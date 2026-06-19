const { validationResult } = require('express-validator');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const { log } = require('../utils/logger');

function issueToken(user) {
  return signToken({ sub: user._id.toString(), role: user.role });
}

async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed.', details: errors.array() });
  }
  const { name, email, password, phone, company, address } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ message: 'Email already registered.' });

  const user = new User({
    name,
    email,
    phone: phone || '',
    company: company || '',
    address: address || '',
    role: 'client',
  });
  await user.setPassword(password);
  await user.save();

  await log({
    req,
    actor: user._id,
    actorRole: 'client',
    action: 'auth.register',
    targetType: 'User',
    targetId: user._id,
    meta: { email: user.email },
  });

  const token = issueToken(user);
  res.status(201).json({ token, user: user.toSafeJSON() });
}

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed.', details: errors.array() });
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
  const ok = await user.verifyPassword(password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials.' });
  if (!user.isActive)
    return res.status(403).json({ message: 'Account disabled. Contact admin.' });

  user.lastLoginAt = new Date();
  await user.save();

  await log({
    req,
    actor: user._id,
    actorRole: user.role,
    action: 'auth.login',
    targetType: 'User',
    targetId: user._id,
  });

  const token = issueToken(user);
  res.json({ token, user: user.toSafeJSON() });
}

async function me(req, res) {
  res.json({ user: req.user.toSafeJSON() });
}

async function updateProfile(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed.', details: errors.array() });
  }
  const { name, phone, company, address, avatar } = req.body;
  const fields = ['name', 'phone', 'company', 'address', 'avatar'];
  for (const f of fields) if (req.body[f] !== undefined) req.user[f] = req.body[f];
  await req.user.save();

  await log({
    req,
    actor: req.user._id,
    actorRole: req.user.role,
    action: 'profile.update',
    targetType: 'User',
    targetId: req.user._id,
  });
  res.json({ user: req.user.toSafeJSON() });
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }
  const ok = await req.user.verifyPassword(currentPassword);
  if (!ok) return res.status(401).json({ message: 'Current password is wrong.' });
  await req.user.setPassword(newPassword);
  await req.user.save();
  await log({
    req,
    actor: req.user._id,
    actorRole: req.user.role,
    action: 'profile.change_password',
    targetType: 'User',
    targetId: req.user._id,
  });
  res.json({ message: 'Password updated.' });
}

module.exports = { register, login, me, updateProfile, changePassword };
