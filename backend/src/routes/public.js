const router = require('express').Router();
const { publicSettings } = require('../controllers/adminController');
const { listPublic, categories } = require('../controllers/designController');

router.get('/settings', publicSettings);
router.get('/designs', listPublic);
router.get('/categories', categories);

module.exports = router;
