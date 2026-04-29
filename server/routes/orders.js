const router = require('express').Router();
const c = require('../controllers/orderController');
const { protect, admin, restaurantOwner } = require('../middleware/auth');

router.use(protect);
router.post('/', c.create);
router.get('/my', c.getMyOrders);
router.get('/admin/stats', admin, c.getStats);
router.get('/admin/all', admin, c.getAll);
router.get('/:id', c.getById);
router.put('/:id/status', c.updateStatus);

module.exports = router;
