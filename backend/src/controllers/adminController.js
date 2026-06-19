const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Design = require('../models/Design');
const User = require('../models/User');
const Message = require('../models/Message');
const SiteSettings = require('../models/SiteSettings');
const ActivityLog = require('../models/ActivityLog');
const { DESIGNS } = require('../utils/upload');
const { log } = require('../utils/logger');

// ---------- Designs ----------
async function adminListDesigns(req, res) {
  const { q, category, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (category && category !== 'all') filter.category = category;
  if (q) filter.$text = { $search: String(q) };
  const lim = Math.min(parseInt(limit, 10) || 50, 200);
  const skip = (Math.max(parseInt(page, 10), 1) - 1) * lim;
  const [items, total] = await Promise.all([
    Design.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim),
    Design.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), limit: lim });
}

async function adminCreateDesign(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: 'Validation failed.', details: errors.array() });
  }
  if (!req.file) return res.status(400).json({ message: 'Design file is required.' });
  const { title, description, category, tags, price, currency } = req.body;
  const host = `${req.protocol}://${req.get('host')}`;
  const design = await Design.create({
    title,
    description,
    category,
    tags: tags ? String(tags).split(',').map((s) => s.trim()).filter(Boolean) : [],
    price: Number(price),
    currency: (currency || 'USD').toUpperCase(),
    fileName: req.file.filename,
    fileMime: req.file.mimetype,
    fileSize: req.file.size,
    fileUrl: `${host}/uploads/designs/${req.file.filename}`,
    uploadedBy: req.user._id,
    isPublished: true,
  });
  await log({
    req,
    actor: req.user._id,
    actorRole: 'admin',
    action: 'design.create',
    targetType: 'Design',
    targetId: design._id,
    meta: { title, category },
  });
  res.status(201).json({ design });
}

async function adminUpdateDesign(req, res) {
  const d = await Design.findById(req.params.id);
  if (!d) return res.status(404).json({ message: 'Not found.' });
  const allowed = ['title', 'description', 'category', 'tags', 'price', 'currency', 'isPublished'];
  for (const f of allowed) if (req.body[f] !== undefined) d[f] = req.body[f];
  if (typeof req.body.tags === 'string') {
    d.tags = req.body.tags.split(',').map((s) => s.trim()).filter(Boolean);
  }
  await d.save();
  await log({
    req,
    actor: req.user._id,
    actorRole: 'admin',
    action: 'design.update',
    targetType: 'Design',
    targetId: d._id,
  });
  res.json({ design: d });
}

async function adminDeleteDesign(req, res) {
  const d = await Design.findById(req.params.id);
  if (!d) return res.status(404).json({ message: 'Not found.' });
  const filePath = path.join(DESIGNS, d.fileName);
  await d.deleteOne();
  if (fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch (_) { /* ignore */ }
  }
  await log({
    req,
    actor: req.user._id,
    actorRole: 'admin',
    action: 'design.delete',
    targetType: 'Design',
    targetId: req.params.id,
    meta: { title: d.title, fileName: d.fileName },
  });
  res.json({ message: 'Deleted.' });
}

// ---------- Clients ----------
async function listClients(req, res) {
  const { q, page = 1, limit = 50 } = req.query;
  const filter = { role: 'client' };
  if (q) filter.$or = [
    { name: new RegExp(q, 'i') },
    { email: new RegExp(q, 'i') },
    { company: new RegExp(q, 'i') },
  ];
  const lim = Math.min(parseInt(limit, 10) || 50, 200);
  const skip = (Math.max(parseInt(page, 10), 1) - 1) * lim;
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim),
    User.countDocuments(filter),
  ]);
  res.json({
    items: items.map((u) => u.toSafeJSON()),
    total,
    page: Number(page),
    limit: lim,
  });
}

async function setClientActive(req, res) {
  const { id } = req.params;
  const { isActive } = req.body;
  const u = await User.findOne({ _id: id, role: 'client' });
  if (!u) return res.status(404).json({ message: 'Client not found.' });
  u.isActive = !!isActive;
  await u.save();
  await log({
    req,
    actor: req.user._id,
    actorRole: 'admin',
    action: 'client.set_active',
    targetType: 'User',
    targetId: u._id,
    meta: { isActive: u.isActive },
  });
  res.json({ user: u.toSafeJSON() });
}

async function deleteClient(req, res) {
  const { id } = req.params;
  const u = await User.findOne({ _id: id, role: 'client' });
  if (!u) return res.status(404).json({ message: 'Client not found.' });
  await u.deleteOne();
  await log({
    req,
    actor: req.user._id,
    actorRole: 'admin',
    action: 'client.delete',
    targetType: 'User',
    targetId: id,
  });
  res.json({ message: 'Deleted.' });
}

// ---------- Dashboard overview ----------
async function overview(req, res) {
  const Order = require('../models/Order');
  const [designs, clients, openMessages, paidOrders, recentMessages, recentClients, recentLogs, settings] =
    await Promise.all([
      Design.countDocuments(),
      User.countDocuments({ role: 'client' }),
      Message.countDocuments({ status: 'open' }),
      Order.countDocuments({ status: { $in: ['paid', 'fulfilled'] } }),
      Message.find().sort({ updatedAt: -1 }).limit(5).populate('client', 'name email'),
      User.find({ role: 'client' }).sort({ createdAt: -1 }).limit(5),
      ActivityLog.find().sort({ createdAt: -1 }).limit(15).populate('actor', 'name email role'),
      SiteSettings.getSingleton(),
    ]);
  res.json({
    counts: { designs, clients, openMessages, paidOrders },
    recentMessages,
    recentClients: recentClients.map((u) => u.toSafeJSON()),
    recentLogs,
    settings,
  });
}

async function activityLogs(req, res) {
  const { page = 1, limit = 50, action } = req.query;
  const filter = {};
  if (action) filter.action = action;
  const lim = Math.min(parseInt(limit, 10) || 50, 200);
  const skip = (Math.max(parseInt(page, 10), 1) - 1) * lim;
  const [items, total] = await Promise.all([
    ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .populate('actor', 'name email role'),
    ActivityLog.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), limit: lim });
}

// ---------- Settings ----------
async function getSettings(req, res) {
  const s = await SiteSettings.getSingleton();
  res.json({ settings: s });
}

async function updateSettings(req, res) {
  const s = await SiteSettings.getSingleton();
  const fields = [
    'businessName',
    'tagline',
    'contactEmail',
    'contactPhone',
    'address',
    'heroImage',
    'aboutText',
  ];
  for (const f of fields) if (req.body[f] !== undefined) s[f] = req.body[f];
  if (req.body.socials) s.socials = { ...s.socials.toObject(), ...req.body.socials };
  if (req.body.notifications)
    s.notifications = { ...s.notifications.toObject(), ...req.body.notifications };
  await s.save();
  await log({
    req,
    actor: req.user._id,
    actorRole: 'admin',
    action: 'settings.update',
    targetType: 'SiteSettings',
    targetId: s._id,
  });
  res.json({ settings: s });
}

async function publicSettings(req, res) {
  const s = await SiteSettings.getSingleton();
  // Strip server-only flags
  res.json({
    businessName: s.businessName,
    tagline: s.tagline,
    contactEmail: s.contactEmail,
    contactPhone: s.contactPhone,
    address: s.address,
    heroImage: s.heroImage,
    aboutText: s.aboutText,
    socials: s.socials,
  });
}

module.exports = {
  adminListDesigns,
  adminCreateDesign,
  adminUpdateDesign,
  adminDeleteDesign,
  listClients,
  setClientActive,
  deleteClient,
  overview,
  activityLogs,
  getSettings,
  updateSettings,
  publicSettings,
};
