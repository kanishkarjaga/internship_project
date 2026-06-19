const Design = require('../models/Design');
const Message = require('../models/Message');
const User = require('../models/User');
const { log } = require('../utils/logger');
const SiteSettings = require('../models/SiteSettings');

async function browseDesigns(req, res) {
  // clients get same browse, plus an optional purchased flag placeholder
  const { q, category, page = 1, limit = 24 } = req.query;
  const filter = { isPublished: true };
  if (category && category !== 'all') filter.category = category;
  if (q) filter.$text = { $search: String(q) };
  const lim = Math.min(parseInt(limit, 10) || 24, 60);
  const skip = (Math.max(parseInt(page, 10), 1) - 1) * lim;
  const [items, total] = await Promise.all([
    Design.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim),
    Design.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), limit: lim });
}

async function myMessages(req, res) {
  const msgs = await Message.find({ client: req.user._id }).sort({ updatedAt: -1 });
  res.json({ items: msgs });
}

async function sendMessage(req, res) {
  const { subject, body } = req.body;
  if (!subject || !body)
    return res.status(400).json({ message: 'Subject and body are required.' });
  const msg = await Message.create({
    client: req.user._id,
    subject,
    body,
    source: 'dashboard',
  });
  await log({
    req,
    actor: req.user._id,
    actorRole: 'client',
    action: 'message.send',
    targetType: 'Message',
    targetId: msg._id,
    meta: { subject },
  });
  res.status(201).json({ message: msg });
}

async function contactAdmin(req, res) {
  // Public contact form (no auth). Creates a "client-less" message routed to admin inbox.
  const { name, email, subject, body } = req.body;
  if (!name || !email || !subject || !body)
    return res.status(400).json({ message: 'All fields are required.' });
  // We need a real User doc to satisfy the schema's required client ref.
  // Strategy: find-or-create a placeholder client user tied to this email.
  // Placeholder accounts are created disabled so they can't accidentally
  // be used to log in; the real client can register normally later.
  let placeholder = await User.findOne({ email: email.toLowerCase() });
  if (!placeholder) {
    placeholder = new User({
      name,
      email,
      role: 'client',
      isActive: false,
    });
    await placeholder.setPassword(require('crypto').randomBytes(20).toString('hex'));
    await placeholder.save();
  }
  const msg = await Message.create({
    client: placeholder._id,
    subject,
    body,
    source: 'contact',
    contactName: name,
    contactEmail: email,
  });
  await log({
    req,
    actor: placeholder._id,
    actorRole: 'anonymous',
    action: 'contact.submit',
    targetType: 'Message',
    targetId: msg._id,
    meta: { email, subject },
  });
  res.status(201).json({ message: 'Thanks! We will get back to you soon.' });
}

module.exports = { browseDesigns, myMessages, sendMessage, contactAdmin };
