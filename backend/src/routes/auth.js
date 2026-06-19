const router = require('express').Router();
const { body } = require('express-validator');
const c = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post(
  '/register',
  [
    body('name').isString().isLength({ min: 2, max: 80 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 8 }),
  ],
  c.register
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').isString().notEmpty()],
  c.login
);

router.get('/me', authenticate, c.me);

router.put('/profile', authenticate, c.updateProfile);
router.put('/password', authenticate, c.changePassword);

module.exports = router;
