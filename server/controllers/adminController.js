const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem');
const { notifyUserOfDecision } = require('../utils/email');

/** GET /api/admin/users — list all users */
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);
    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

/** PUT /api/admin/users/:id/role — change user role */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

/** DELETE /api/admin/users/:id — delete user */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
};

/** GET /api/admin/restaurant-requests — pending restaurant user registrations */
exports.getRestaurantRequests = async (req, res, next) => {
  try {
    // Return Users who registered as restaurant owners awaiting approval
    const users = await User.find({ role: 'restaurant', restaurantApprovalStatus: { $in: ['pending', 'rejected'] } })
      .select('-password')
      .sort({ restaurantApprovalRequestedAt: -1 });
    res.json(users);
  } catch (err) { next(err); }
};

/** PUT /api/admin/restaurant-requests/:id/approve — approve a restaurant USER account */
exports.approveRestaurantUser = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'restaurant' },
      { restaurantApprovalStatus: 'approved' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'Restaurant user not found' });
    notifyUserOfDecision(user.email, user.name, 'restaurant', true).catch(() => {});
    res.json({ message: 'Restaurant access approved', user });
  } catch (err) { next(err); }
};

/** PUT /api/admin/restaurant-requests/:id/reject — reject a restaurant USER account */
exports.rejectRestaurantUser = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'restaurant' },
      { restaurantApprovalStatus: 'rejected' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'Restaurant user not found' });
    notifyUserOfDecision(user.email, user.name, 'restaurant', false).catch(() => {});
    res.json({ message: 'Restaurant access rejected', user });
  } catch (err) { next(err); }
};

/** PUT /api/admin/restaurants/:id/approve — approve a Restaurant document (legacy) */
exports.approveRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('ownerId', 'name email');
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    restaurant.approvalStatus = 'approved';
    restaurant.approvalDate = new Date();
    await restaurant.save();
    await User.findByIdAndUpdate(restaurant.ownerId._id, { restaurantApprovalStatus: 'approved' });
    if (restaurant.ownerId?.email) {
      notifyUserOfDecision(restaurant.ownerId.email, restaurant.ownerId.name, 'restaurant', true).catch(() => {});
    }
    res.json({ message: 'Restaurant approved', restaurant });
  } catch (err) { next(err); }
};

/** PUT /api/admin/restaurants/:id/reject — reject a Restaurant document (legacy) */
exports.rejectRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('ownerId', 'name email');
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    restaurant.approvalStatus = 'rejected';
    restaurant.approvalDate = new Date();
    await restaurant.save();
    await User.findByIdAndUpdate(restaurant.ownerId._id, { restaurantApprovalStatus: 'rejected' });
    if (restaurant.ownerId?.email) {
      notifyUserOfDecision(restaurant.ownerId.email, restaurant.ownerId.name, 'restaurant', false).catch(() => {});
    }
    res.json({ message: 'Restaurant rejected', restaurant });
  } catch (err) { next(err); }
};

/** GET /api/admin/admin-requests — pending admin access requests */
exports.getAdminRequests = async (req, res, next) => {
  try {
    const users = await User.find({ adminApprovalStatus: { $in: ['pending', 'rejected'] } })
      .select('-password')
      .sort({ adminApprovalRequestedAt: -1 });
    res.json(users);
  } catch (err) { next(err); }
};

/** PUT /api/admin/admin-requests/:id/approve */
exports.approveAdmin = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'admin', adminApprovalStatus: 'approved' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    notifyUserOfDecision(user.email, user.name, 'admin', true).catch(() => {});

    res.json({ message: 'Admin access approved', user });
  } catch (err) { next(err); }
};

/** PUT /api/admin/admin-requests/:id/reject */
exports.rejectAdmin = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { adminApprovalStatus: 'rejected' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    notifyUserOfDecision(user.email, user.name, 'admin', false).catch(() => {});

    res.json({ message: 'Admin request rejected', user });
  } catch (err) { next(err); }
};

/** GET /api/admin/analytics — dashboard analytics */
exports.getAnalytics = async (req, res, next) => {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

    const [
      totalUsers, totalRestaurants, totalOrders, totalMenuItems,
      pendingRestaurants, pendingAdmins,
      totalRevenue, todayOrders, todayRevenue,
      weeklyOrders, statusCounts,
      dailyRevenue,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Restaurant.countDocuments({ approvalStatus: 'approved' }),
      Order.countDocuments(),
      FoodItem.countDocuments(),
      Restaurant.countDocuments({ approvalStatus: 'pending' }),
      User.countDocuments({ adminApprovalStatus: 'pending' }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: todayStart }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: weekStart } }),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: weekStart }, status: { $ne: 'cancelled' } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      totalUsers,
      totalRestaurants,
      totalOrders,
      totalMenuItems,
      pendingRestaurants,
      pendingAdmins,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayOrders,
      todayRevenue: todayRevenue[0]?.total || 0,
      weeklyOrders,
      statusBreakdown: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
      dailyRevenue,
    });
  } catch (err) { next(err); }
};
