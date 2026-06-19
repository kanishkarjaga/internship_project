const router = require('express').Router();
const c = require('../controllers/messageController');
const cc = require('../controllers/clientController');
const { authenticate, requireRole } = require('../middleware/auth');

// Public contact form (creates a message thread)
router.post('/contact', cc.contactAdmin);

// Authenticated user
router.get('/mine', authenticate, requireRole('client'), cc.myMessages);
router.post('/mine', authenticate, requireRole('client'), cc.sendMessage);
router.get('/mine/:id', authenticate, c.getThread);
router.post('/mine/:id/reply', authenticate, requireRole('client'), c.clientReply);

// Admin
router.get('/', authenticate, requireRole('admin'), c.adminListMessages);
router.get('/:id', authenticate, requireRole('admin'), c.getThread);
router.post('/:id/reply', authenticate, requireRole('admin'), c.adminReply);
router.post('/:id/close', authenticate, requireRole('admin'), c.closeThread);

module.exports = router;
