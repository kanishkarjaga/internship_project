const fs = require('fs');
const path = require('path');
const Design = require('../models/Design');
const { DESIGNS } = require('../utils/upload');
const { log } = require('../utils/logger');

function publicFileUrl(req, fileName) {
  return `${req.protocol}://${req.get('host')}/uploads/designs/${fileName}`;
}

async function listPublic(req, res) {
  const { q, category, page = 1, limit = 24 } = req.query;
  const filter = { isPublished: true };
  if (category && category !== 'all') filter.category = category;
  if (q) {
    filter.$text = { $search: String(q) };
  }
  const lim = Math.min(parseInt(limit, 10) || 24, 60);
  const skip = (Math.max(parseInt(page, 10), 1) - 1) * lim;
  const [items, total] = await Promise.all([
    Design.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .populate('uploadedBy', 'name email'),
    Design.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), limit: lim });
}

async function getOne(req, res) {
  const d = await Design.findById(req.params.id).populate('uploadedBy', 'name email');
  if (!d) return res.status(404).json({ message: 'Not found.' });
  if (!d.isPublished && !(req.user && req.user.role === 'admin')) {
    return res.status(404).json({ message: 'Not found.' });
  }
  res.json({ design: d });
}

async function categories(req, res) {
  res.json({ categories: Design.CATEGORIES });
}

async function download(req, res) {
  const d = await Design.findById(req.params.id);
  if (!d || !d.isPublished) return res.status(404).json({ message: 'Not found.' });
  const filePath = path.join(DESIGNS, d.fileName);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File missing.' });

  d.downloadCount += 1;
  await d.save();
  await log({
    req,
    actor: req.user._id,
    actorRole: req.user.role,
    action: 'design.download',
    targetType: 'Design',
    targetId: d._id,
    meta: { fileName: d.fileName },
  });

  res.download(filePath, d.fileName);
}

module.exports = { listPublic, getOne, categories, download };
