const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate, requireRole } = require('../middleware/auth');
const c = require('../controllers/adminController');
const orderC = require('../controllers/orderController');
const { uploadDesign } = require('../utils/upload');

router.use(authenticate, requireRole('admin'));

// Overview
router.get('/overview', c.overview);
router.get('/activity', c.activityLogs);

// Designs
router.get('/designs', c.adminListDesigns);
router.post(
  '/designs',
  uploadDesign.single('file'),
  [
    body('title').isString().isLength({ min: 2, max: 120 }),
    body('description').isString().isLength({ min: 5, max: 2000 }),
    body('category').isIn(require('../models/Design').CATEGORIES),
    body('price').isFloat({ min: 0 }),
  ],
  c.adminCreateDesign
);
router.put('/designs/:id', c.adminUpdateDesign);
router.delete('/designs/:id', c.adminDeleteDesign);

// Clients
router.get('/clients', c.listClients);
router.put('/clients/:id/active', c.setClientActive);
router.delete('/clients/:id', c.deleteClient);

// Settings (admin)
router.get('/settings', c.getSettings);
router.put('/settings', c.updateSettings);

// Orders (admin)
router.get('/orders', orderC.adminList);
router.post('/orders/:id/fulfill', orderC.fulfill);
router.post('/orders/:id/refund', orderC.refund);

module.exports = router;
