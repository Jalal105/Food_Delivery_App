const router = require('express').Router();
const c = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/profile').get(c.getProfile).put(c.updateProfile);
router.route('/addresses').post(c.addAddress);
router.route('/addresses/:id').put(c.updateAddress).delete(c.deleteAddress);

module.exports = router;
