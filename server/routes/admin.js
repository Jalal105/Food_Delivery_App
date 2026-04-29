const router = require('express').Router();
const c = require('../controllers/adminController');
const { protect, admin, superAdmin } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, admin);

// Analytics / overview
router.get('/analytics', c.getAnalytics);

// User management
router.get('/users', c.getAllUsers);
router.put('/users/:id/role', c.updateUserRole);
router.delete('/users/:id', c.deleteUser);

// Restaurant USER approval (when someone registers with restaurant role)
router.get('/restaurant-requests', c.getRestaurantRequests);
router.put('/restaurant-requests/:id/approve', c.approveRestaurantUser);
router.put('/restaurant-requests/:id/reject', c.rejectRestaurantUser);

// Restaurant DOCUMENT approval (when owner creates a restaurant entry)
router.put('/restaurants/:id/approve', c.approveRestaurant);
router.put('/restaurants/:id/reject', c.rejectRestaurant);

// Admin access requests (super admin only — additional check on top of admin)
router.get('/admin-requests', superAdmin, c.getAdminRequests);
router.put('/admin-requests/:id/approve', superAdmin, c.approveAdmin);
router.put('/admin-requests/:id/reject', superAdmin, c.rejectAdmin);

module.exports = router;
