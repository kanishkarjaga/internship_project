/* eslint-disable no-console */
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const SiteSettings = require('../models/SiteSettings');

(async () => {
  try {
    await connectDB();
    const email = (process.env.ADMIN_EMAIL || 'admin@embroidery.local').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    const name = process.env.ADMIN_NAME || 'Site Admin';

    let admin = await User.findOne({ email });
    if (!admin) {
      admin = new User({ name, email, role: 'admin', isActive: true });
      await admin.setPassword(password);
      await admin.save();
      console.log(`[seed] admin created: ${email} / ${password}`);
    } else {
      admin.role = 'admin';
      admin.isActive = true;
      await admin.save();
      console.log(`[seed] admin already exists: ${email}`);
    }

    await SiteSettings.getSingleton();
    console.log('[seed] settings ready');
    process.exit(0);
  } catch (err) {
    console.error('[seed] failed:', err);
    process.exit(1);
  }
})();
