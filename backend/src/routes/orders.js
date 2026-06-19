const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const c = require('../controllers/orderController');

const router = express.Router();

// Stripe webhook (raw body). Mounted separately in server.js, but for completeness:
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // Lazy require to avoid loading stripe unless needed
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = req.body; // trust the body if no secret configured (dev only)
    }
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const Order = require('../models/Order');
      const order = await Order.findOne({ 'payment.sessionId': session.id });
      if (order && order.status === 'pending') {
        order.status = 'paid';
        order.payment.paymentIntentId = session.payment_intent || '';
        order.payment.paidAt = new Date();
        await order.save();
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error('[stripe webhook]', err.message);
    res.status(400).send(`Webhook error: ${err.message}`);
  }
});

// All routes below require auth
router.use(authenticate);

// Client
router.post('/', requireRole('client'), c.createOrder);
router.get('/mine', requireRole('client'), c.myOrders);
router.get('/mine/:id', c.myOrder);
router.post('/:id/checkout', requireRole('client'), c.checkout);
router.post('/:id/mock-pay', requireRole('client'), c.mockPay);
router.post('/:id/cancel', c.cancel);

module.exports = router;
