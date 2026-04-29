const FoodItem = require('../models/FoodItem');
const Restaurant = require('../models/Restaurant');

/** GET /api/food?restaurantId=…&category=…&foodType=… */
exports.getAll = async (req, res, next) => {
  try {
    const { restaurantId, category, foodType, search, veg, page = 1, limit = 50 } = req.query;
    const query = {};
    if (restaurantId) query.restaurantId = restaurantId;
    if (category) query.category = category;
    if (foodType) query.foodType = foodType;
    if (veg === 'true') query.isVeg = true;
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      FoodItem.find(query)
        .populate('restaurantId', 'name image approvalStatus')
        .populate('foodType', 'name icon slug')
        .sort({ isBestseller: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      FoodItem.countDocuments(query),
    ]);
    
    // Filter out items from non-approved restaurants for public queries
    const filtered = items.filter(i => {
      if (!i.restaurantId) return false;
      if (typeof i.restaurantId === 'object' && i.restaurantId.approvalStatus !== 'approved') return false;
      return true;
    });
    
    res.json({ items: filtered, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

/** GET /api/food/:id */
exports.getById = async (req, res, next) => {
  try {
    const item = await FoodItem.findById(req.params.id)
      .populate('restaurantId', 'name image deliveryTime')
      .populate('foodType', 'name icon slug');
    if (!item) return res.status(404).json({ message: 'Food item not found' });
    res.json(item);
  } catch (err) { next(err); }
};

/** POST /api/food (admin or restaurant owner) */
exports.create = async (req, res, next) => {
  try {
    // Verify the user owns the restaurant (or is admin)
    if (req.user.role === 'restaurant') {
      const restaurant = await Restaurant.findById(req.body.restaurantId);
      if (!restaurant || !restaurant.ownerId.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized for this restaurant' });
      }
    }
    const item = await FoodItem.create(req.body);
    const populated = await item.populate(['restaurantId', { path: 'foodType', select: 'name icon slug' }]);
    res.status(201).json(populated);
  } catch (err) { next(err); }
};

/** PUT /api/food/:id (admin or restaurant owner) */
exports.update = async (req, res, next) => {
  try {
    const existing = await FoodItem.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Food item not found' });
    
    // Verify ownership for restaurant owners
    if (req.user.role === 'restaurant') {
      const restaurant = await Restaurant.findById(existing.restaurantId);
      if (!restaurant || !restaurant.ownerId.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized for this restaurant' });
      }
    }
    
    const item = await FoodItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('foodType', 'name icon slug');
    res.json(item);
  } catch (err) { next(err); }
};

/** DELETE /api/food/:id (admin or restaurant owner) */
exports.remove = async (req, res, next) => {
  try {
    const existing = await FoodItem.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Food item not found' });
    
    if (req.user.role === 'restaurant') {
      const restaurant = await Restaurant.findById(existing.restaurantId);
      if (!restaurant || !restaurant.ownerId.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }
    
    await FoodItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Food item removed' });
  } catch (err) { next(err); }
};

/** PATCH /api/food/:id/toggle (toggle availability) */
exports.toggleAvailability = async (req, res, next) => {
  try {
    const item = await FoodItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Food item not found' });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json(item);
  } catch (err) { next(err); }
};
