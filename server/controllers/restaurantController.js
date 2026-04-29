const Restaurant = require('../models/Restaurant');

/** GET /api/restaurants — public list (only approved restaurants) */
exports.getAll = async (req, res, next) => {
  try {
    const { search, cuisine, featured, page = 1, limit = 20 } = req.query;
    const query = { approvalStatus: 'approved' };
    if (search) query.$text = { $search: search };
    if (cuisine) query.cuisine = { $in: cuisine.split(',') };
    if (featured === 'true') query.isFeatured = true;

    const skip = (Number(page) - 1) * Number(limit);
    const [restaurants, total] = await Promise.all([
      Restaurant.find(query).sort({ isFeatured: -1, rating: -1 }).skip(skip).limit(Number(limit)),
      Restaurant.countDocuments(query),
    ]);
    res.json({ restaurants, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

/** GET /api/restaurants/:id */
exports.getById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('foodTypes');
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (err) { next(err); }
};

/** POST /api/restaurants (admin or restaurant owner) */
exports.create = async (req, res, next) => {
  try {
    // Restaurant owners are limited to ONE restaurant
    if (req.user.role === 'restaurant') {
      const existing = await Restaurant.findOne({ ownerId: req.user._id });
      if (existing) {
        return res.status(400).json({ message: 'You already have a restaurant. Only one restaurant per account is allowed.' });
      }
    }

    // Auto-approve if created by an already-approved restaurant owner or admin
    const approvalStatus = (req.user.role === 'admin' || req.user.restaurantApprovalStatus === 'approved')
      ? 'approved'
      : 'pending';

    const restaurant = await Restaurant.create({
      ...req.body,
      ownerId: req.user._id,
      approvalStatus,
      approvalDate: approvalStatus === 'approved' ? new Date() : undefined,
    });
    res.status(201).json(restaurant);
  } catch (err) { next(err); }
};


/** PUT /api/restaurants/:id (admin or owner) */
exports.update = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    
    // Only admin or owner can update
    if (req.user.role !== 'admin' && !restaurant.ownerId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to edit this restaurant' });
    }
    
    const updated = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) { next(err); }
};

/** DELETE /api/restaurants/:id (admin only) */
exports.remove = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json({ message: 'Restaurant removed' });
  } catch (err) { next(err); }
};

/** GET /api/restaurants/owner/my — get logged-in restaurant owner's restaurants */
exports.getMyRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ ownerId: req.user._id }).populate('foodTypes').sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (err) { next(err); }
};

/** GET /api/restaurants/owner/:id/orders — restaurant owner's orders */
exports.getRestaurantOrders = async (req, res, next) => {
  try {
    const Order = require('../models/Order');
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (req.user.role !== 'admin' && !restaurant.ownerId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { status, page = 1, limit = 20 } = req.query;
    const query = { restaurantId: req.params.id };
    if (status) query.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query).populate('userId', 'name email phone').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(query),
    ]);
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

/** GET /api/restaurants/owner/:id/stats — restaurant owner's stats */
exports.getRestaurantStats = async (req, res, next) => {
  try {
    const Order = require('../models/Order');
    const FoodItem = require('../models/FoodItem');
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (req.user.role !== 'admin' && !restaurant.ownerId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const [totalOrders, totalRevenue, todayOrders, todayRevenue, totalItems, statusCounts] = await Promise.all([
      Order.countDocuments({ restaurantId: req.params.id }),
      Order.aggregate([
        { $match: { restaurantId: restaurant._id, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.countDocuments({ restaurantId: req.params.id, createdAt: { $gte: todayStart } }),
      Order.aggregate([
        { $match: { restaurantId: restaurant._id, createdAt: { $gte: todayStart }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      FoodItem.countDocuments({ restaurantId: req.params.id }),
      Order.aggregate([
        { $match: { restaurantId: restaurant._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayOrders,
      todayRevenue: todayRevenue[0]?.total || 0,
      totalItems,
      statusBreakdown: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
    });
  } catch (err) { next(err); }
};
