const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const c = require('../controllers/clientController');
const dc = require('../controllers/designController');

// Client browsing
router.get('/designs', authenticate, requireRole('client'), c.browseDesigns);

// Download (clients and admins can download; guests can browse but not download)
router.get('/designs/:id/download', authenticate, dc.download);

module.exports = router;
