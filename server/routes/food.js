const router = require('express').Router();
const c = require('../controllers/foodController');
const { protect, admin, restaurantOwner } = require('../middleware/auth');

router.get('/', c.getAll);
router.get('/:id', c.getById);
router.post('/', protect, restaurantOwner, c.create);
router.put('/:id', protect, restaurantOwner, c.update);
router.delete('/:id', protect, restaurantOwner, c.remove);
router.patch('/:id/toggle', protect, restaurantOwner, c.toggleAvailability);

module.exports = router;
