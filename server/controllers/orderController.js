const Order = require('../models/Order');

/** POST /api/orders */
exports.create = async (req, res, next) => {
  try {
    const { restaurantId, items, subtotal, deliveryFee, tax, discount, totalAmount, paymentMethod, deliveryAddress, isDirectOrder, notes } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'No items in order' });

    const order = await Order.create({
      userId: req.user._id,
      restaurantId,
      items,
      subtotal,
      deliveryFee,
      tax,
      discount: discount || 0,
      totalAmount,
      paymentMethod,
      deliveryAddress,
      isDirectOrder: isDirectOrder || false,
      notes,
      statusHistory: [{ status: 'placed', note: 'Order placed' }],
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
    });

    const populated = await order.populate([
      { path: 'restaurantId', select: 'name image' },
      { path: 'userId', select: 'name email' },
    ]);
    res.status(201).json(populated);
  } catch (err) { next(err); }
};

/** GET /api/orders/my */
exports.getMyOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { userId: req.user._id };
    if (status) query.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query).populate('restaurantId', 'name image').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(query),
    ]);
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

/** GET /api/orders/:id */
exports.getById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurantId', 'name image address phone')
      .populate('userId', 'name email phone');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    // Only allow owner or admin
    if (!order.userId._id.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (err) { next(err); }
};

/** GET /api/orders (admin – all orders) */
exports.getAll = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('restaurantId', 'name')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(query),
    ]);
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

/** PUT /api/orders/:id/status (admin) */
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note: note || `Status changed to ${status}`, timestamp: new Date() });

    if (status === 'delivered') order.paymentStatus = 'paid';
    if (status === 'cancelled' && order.paymentStatus === 'paid') order.paymentStatus = 'refunded';

    await order.save();
    res.json(order);
  } catch (err) { next(err); }
};

/** GET /api/orders/admin/stats (admin analytics) */
exports.getStats = async (req, res, next) => {
  try {
    const [totalOrders, totalRevenue, statusCounts] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: todayStart } });
    const todayRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: todayStart }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayOrders,
      todayRevenue: todayRevenue[0]?.total || 0,
      statusBreakdown: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
    });
  } catch (err) { next(err); }
};
