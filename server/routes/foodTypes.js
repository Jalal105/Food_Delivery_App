const router = require('express').Router();
const c = require('../controllers/foodTypeController');
const { protect, admin } = require('../middleware/auth');

router.get('/', c.getAll);
router.get('/:id', c.getById);
router.post('/', protect, admin, c.create);
router.put('/:id', protect, admin, c.update);
router.delete('/:id', protect, admin, c.remove);

module.exports = router;
