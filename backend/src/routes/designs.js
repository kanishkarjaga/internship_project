const router = require('express').Router();
const c = require('../controllers/designController');

router.get('/categories', c.categories);
router.get('/:id', c.getOne);

module.exports = router;
