const router = require('express').Router();
const c = require('../controllers/restaurantController');
const { protect, admin, restaurantOwner } = require('../middleware/auth');

// ⚠️ Specific routes MUST come before parameterized routes to avoid conflicts
router.get('/owner/my', protect, restaurantOwner, c.getMyRestaurants);
router.get('/owner/:id/orders', protect, restaurantOwner, c.getRestaurantOrders);
router.get('/owner/:id/stats', protect, restaurantOwner, c.getRestaurantStats);

// Public
router.get('/', c.getAll);
router.get('/:id', c.getById);

// Authenticated
router.post('/', protect, restaurantOwner, c.create);
router.put('/:id', protect, restaurantOwner, c.update);
router.delete('/:id', protect, admin, c.remove);

module.exports = router;
