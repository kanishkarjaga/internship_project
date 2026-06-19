require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const designRoutes = require('./routes/designs');
const clientRoutes = require('./routes/client');
const adminRoutes = require('./routes/admin');
const messageRoutes = require('./routes/messages');
const publicRoutes = require('./routes/public');
const orderRoutes = require('./routes/orders');

const app = express();

// Security & basics
app.set('trust proxy', 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // so <img>/downloads work cross-origin
  })
);
app.use(
  cors({
    origin: (process.env.CLIENT_ORIGIN || '*').split(',').map((s) => s.trim()),
    credentials: false,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limit auth & contact endpoints
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true });
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, standardHeaders: true });

app.use('/uploads', express.static(path.resolve(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

// Routes
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/me', clientRoutes);
app.use('/api/admin', adminRoutes);
// Apply contact-form limiter only to the public contact endpoint.
// (Sub-routers carry their own auth checks; the global limiter here would
// also throttle admin/clients, which we don't want.)
const contactLimiterScoped = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
});
app.use('/api/messages', (req, res, next) => {
  if (req.method === 'POST' && req.path === '/contact') return contactLimiterScoped(req, res, next);
  return next();
}, messageRoutes);
app.use('/api/orders', orderRoutes);

// 404
app.use('/api', (req, res) => res.status(404).json({ message: 'Not found.' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

(async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('[startup] failed:', err.message);
    process.exit(1);
  }
})();

module.exports = app;
