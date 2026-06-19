const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Design = require('../models/Design');
const User = require('../models/User');
const { log } = require('../utils/logger');

const FRONTEND_BASE = process.env.FRONTEND_BASE || 'http://localhost:5173';
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || '';
let stripeLib = null;
function getStripe() {
  if (!STRIPE_KEY) return null;
  if (stripeLib) return stripeLib;
  try {
    // eslint-disable-next-line global-require
    stripeLib = require('stripe')(STRIPE_KEY);
    return stripeLib;
  } catch (_) {
    console.warn('[orders] stripe package not installed; falling back to mock provider');
    return null;
  }
}

// isValidId: cheap guard so we never call mongoose with `undefined` / `null`
function isValidId(id) {
  return typeof id === 'string' && mongoose.Types.ObjectId.isValid(id) && /^[a-f0-9]{24}$/i.test(id);
}
function notFound(res) {
  return res.status(404).json({ message: 'Order not found.' });
}
function badId(res) {
  return res.status(400).json({ message: 'Invalid order id.' });
}

// -------- helpers --------
function calcTotals(items, shippingFee = 0, taxRate = 0) {
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
  const tax = +(subtotal * taxRate).toFixed(2);
  const total = +(subtotal + shippingFee + tax).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), tax, shippingFee: +shippingFee.toFixed(2), total };
}

async function buildItems(cart) {
  if (!Array.isArray(cart) || cart.length === 0) {
    const err = new Error('Cart is empty.');
    err.status = 400;
    throw err;
  }
  const ids = cart.map((c) => c.designId).filter(Boolean);
  if (ids.length === 0) {
    const err = new Error('Cart has no valid designs.');
    err.status = 400;
    throw err;
  }
  const designs = await Design.find({ _id: { $in: ids }, isPublished: true });
  const byId = new Map(designs.map((d) => [String(d._id), d]));
  const items = [];
  for (const c of cart) {
    const d = byId.get(String(c.designId));
    if (!d) continue;
    const qty = Math.max(parseInt(c.quantity, 10) || 1, 1);
    items.push({
      design: d._id,
      title: d.title,
      price: d.price,
      currency: d.currency,
      quantity: qty,
      fileName: d.fileName,
      fileUrl: d.fileUrl,
    });
  }
  if (items.length === 0) {
    const err = new Error('None of the cart designs are available.');
    err.status = 400;
    throw err;
  }
  return items;
}

// -------- client endpoints --------

async function createOrder(req, res) {
  const { cart, shipping, notes } = req.body || {};
  const items = await buildItems(cart);
  const { subtotal, tax, shippingFee, total } = calcTotals(items);
  const order = await Order.create({
    client: req.user._id,
    items,
    subtotal,
    tax,
    shippingFee,
    total,
    currency: items[0].currency || 'USD',
    status: 'pending',
    payment: { provider: STRIPE_KEY && getStripe() ? 'stripe' : 'mock' },
    shipping: shipping || {},
    notes: notes || '',
  });
  await log({
    req,
    actor: req.user._id,
    actorRole: 'client',
    action: 'order.create',
    targetType: 'Order',
    targetId: order._id,
    meta: { total, items: items.length },
  });
  res.status(201).json({ order, checkoutUrl: null });
}

async function checkout(req, res) {
  if (!isValidId(req.params.id)) return badId(res);
  const order = await Order.findById(req.params.id);
  if (!order) return notFound(res);
  if (String(order.client) !== String(req.user._id))
    return res.status(403).json({ message: 'Forbidden.' });
  if (order.status !== 'pending')
    return res.status(400).json({ message: `Order is ${order.status}.` });

  const stripe = getStripe();
  if (stripe) {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: order.items.map((it) => ({
        price_data: {
          currency: order.currency.toLowerCase(),
          product_data: { name: it.title },
          unit_amount: Math.round(it.price * 100),
        },
        quantity: it.quantity,
      })),
      customer_email: req.user.email,
      success_url: `${FRONTEND_BASE}/client/orders/${order._id}?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_BASE}/client/orders/${order._id}?cancelled=1`,
      metadata: { orderId: String(order._id), clientId: String(req.user._id) },
    });
    order.payment.provider = 'stripe';
    order.payment.sessionId = session.id;
    await order.save();
    await log({
      req,
      actor: req.user._id,
      actorRole: 'client',
      action: 'order.checkout',
      targetType: 'Order',
      targetId: order._id,
      meta: { provider: 'stripe', sessionId: session.id },
    });
    return res.json({ checkoutUrl: session.url, order });
  }

  // Mock provider: redirect to a frontend page that completes the payment.
  const token = crypto.randomBytes(16).toString('hex');
  order.payment.provider = 'mock';
  order.payment.sessionId = `mock_${token}`;
  await order.save();
  const checkoutUrl = `${FRONTEND_BASE}/mock-pay?order=${order._id}&token=${token}`;
  await log({
    req,
    actor: req.user._id,
    actorRole: 'client',
    action: 'order.checkout',
    targetType: 'Order',
    targetId: order._id,
    meta: { provider: 'mock' },
  });
  res.json({ checkoutUrl, order });
}

async function mockPay(req, res) {
  if (!isValidId(req.params.id)) return badId(res);
  const { token } = req.body || {};
  const order = await Order.findById(req.params.id);
  if (!order) return notFound(res);
  if (String(order.client) !== String(req.user._id))
    return res.status(403).json({ message: 'Forbidden.' });
  if (!order.payment.sessionId || order.payment.sessionId !== `mock_${token}`)
    return res.status(400).json({ message: 'Invalid payment token.' });
  if (order.status !== 'pending')
    return res.json({ order }); // idempotent

  order.status = 'paid';
  order.payment.paidAt = new Date();
  await order.save();
  await log({
    req,
    actor: req.user._id,
    actorRole: 'client',
    action: 'order.paid',
    targetType: 'Order',
    targetId: order._id,
  });
  res.json({ order });
}

async function myOrders(req, res) {
  const items = await Order.find({ client: req.user._id }).sort({ createdAt: -1 });
  res.json({ items });
}

async function myOrder(req, res) {
  if (!isValidId(req.params.id)) return badId(res);
  const order = await Order.findById(req.params.id);
  if (!order) return notFound(res);
  if (String(order.client) !== String(req.user._id) && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden.' });
  res.json({ order });
}

async function cancel(req, res) {
  if (!isValidId(req.params.id)) return badId(res);
  const order = await Order.findById(req.params.id);
  if (!order) return notFound(res);
  if (String(order.client) !== String(req.user._id) && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden.' });
  if (!['pending', 'paid'].includes(order.status))
    return res.status(400).json({ message: `Cannot cancel a ${order.status} order.` });
  order.status = 'cancelled';
  await order.save();
  await log({
    req,
    actor: req.user._id,
    actorRole: req.user.role,
    action: 'order.cancel',
    targetType: 'Order',
    targetId: order._id,
  });
  res.json({ order });
}

// -------- admin endpoints --------

async function adminList(req, res) {
  const { status, q, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (status && status !== 'all') filter.status = status;
  if (q) {
    const matchingClients = await User.find({
      $or: [
        { name: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') },
        { company: new RegExp(q, 'i') },
      ],
    }).select('_id');
    filter.$or = [
      { notes: new RegExp(q, 'i') },
      { 'items.title': new RegExp(q, 'i') },
      { client: { $in: matchingClients.map((u) => u._id) } },
    ];
  }
  const lim = Math.min(parseInt(limit, 10) || 50, 200);
  const skip = (Math.max(parseInt(page, 10), 1) - 1) * lim;
  const [items, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .populate('client', 'name email company'),
    Order.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), limit: lim });
}

async function fulfill(req, res) {
  if (!isValidId(req.params.id)) return badId(res);
  const order = await Order.findById(req.params.id);
  if (!order) return notFound(res);
  if (order.status !== 'paid')
    return res.status(400).json({ message: `Cannot fulfil a ${order.status} order.` });
  order.status = 'fulfilled';
  await order.save();
  await log({
    req,
    actor: req.user._id,
    actorRole: 'admin',
    action: 'order.fulfill',
    targetType: 'Order',
    targetId: order._id,
  });
  res.json({ order });
}

async function refund(req, res) {
  if (!isValidId(req.params.id)) return badId(res);
  const order = await Order.findById(req.params.id);
  if (!order) return notFound(res);
  if (!['paid', 'fulfilled'].includes(order.status))
    return res.status(400).json({ message: `Cannot refund a ${order.status} order.` });
  order.status = 'refunded';
  await order.save();
  await log({
    req,
    actor: req.user._id,
    actorRole: 'admin',
    action: 'order.refund',
    targetType: 'Order',
    targetId: order._id,
  });
  res.json({ order });
}

module.exports = {
  createOrder,
  checkout,
  mockPay,
  myOrders,
  myOrder,
  cancel,
  adminList,
  fulfill,
  refund,
};
