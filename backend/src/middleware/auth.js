const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Not authenticated.' });
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub);
    if (!user) return res.status(401).json({ message: 'User not found.' });
    if (!user.isActive)
      return res.status(403).json({ message: 'Account disabled. Contact admin.' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role.' });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
