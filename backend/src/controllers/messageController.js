const Message = require('../models/Message');
const { log } = require('../utils/logger');

// Admin: list all messages (with optional status filter)
async function adminListMessages(req, res) {
  const { status, q, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (status && status !== 'all') filter.status = status;
  if (q) filter.$or = [
    { subject: new RegExp(q, 'i') },
    { body: new RegExp(q, 'i') },
    { contactEmail: new RegExp(q, 'i') },
    { contactName: new RegExp(q, 'i') },
  ];
  const lim = Math.min(parseInt(limit, 10) || 50, 200);
  const skip = (Math.max(parseInt(page, 10), 1) - 1) * lim;
  const [items, total] = await Promise.all([
    Message.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(lim)
      .populate('client', 'name email role'),
    Message.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), limit: lim });
}

// Admin or client: get one thread
async function getThread(req, res) {
  const msg = await Message.findById(req.params.id)
    .populate('client', 'name email')
    .populate('replies.author', 'name email role');
  if (!msg) return res.status(404).json({ message: 'Not found.' });
  // Only the owner client or an admin can read it
  const isOwner = req.user && msg.client && String(msg.client._id) === String(req.user._id);
  const isAdmin = req.user && req.user.role === 'admin';
  if (!isAdmin && !isOwner) return res.status(403).json({ message: 'Forbidden.' });
  res.json({ message: msg });
}

// Admin: reply
async function adminReply(req, res) {
  const { body } = req.body;
  if (!body) return res.status(400).json({ message: 'Reply body is required.' });
  const msg = await Message.findById(req.params.id);
  if (!msg) return res.status(404).json({ message: 'Not found.' });
  msg.addReply({ from: 'admin', author: req.user._id, body });
  await msg.save();
  await log({
    req,
    actor: req.user._id,
    actorRole: 'admin',
    action: 'message.reply',
    targetType: 'Message',
    targetId: msg._id,
  });
  res.json({ message: msg });
}

// Client: reply on own thread
async function clientReply(req, res) {
  const { body } = req.body;
  if (!body) return res.status(400).json({ message: 'Reply body is required.' });
  const msg = await Message.findById(req.params.id);
  if (!msg) return res.status(404).json({ message: 'Not found.' });
  if (String(msg.client) !== String(req.user._id))
    return res.status(403).json({ message: 'Forbidden.' });
  msg.addReply({ from: 'client', author: req.user._id, body });
  // After client replies, mark as open again for admin
  msg.status = 'open';
  await msg.save();
  await log({
    req,
    actor: req.user._id,
    actorRole: 'client',
    action: 'message.reply',
    targetType: 'Message',
    targetId: msg._id,
  });
  res.json({ message: msg });
}

// Admin: close thread
async function closeThread(req, res) {
  const msg = await Message.findById(req.params.id);
  if (!msg) return res.status(404).json({ message: 'Not found.' });
  msg.status = 'closed';
  await msg.save();
  await log({
    req,
    actor: req.user._id,
    actorRole: 'admin',
    action: 'message.close',
    targetType: 'Message',
    targetId: msg._id,
  });
  res.json({ message: msg });
}

module.exports = {
  adminListMessages,
  getThread,
  adminReply,
  clientReply,
  closeThread,
};
