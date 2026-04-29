const FoodType = require('../models/FoodType');

/** GET /api/food-types */
exports.getAll = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.active === 'true') query.isActive = true;
    const foodTypes = await FoodType.find(query).sort({ sortOrder: 1, name: 1 });
    res.json(foodTypes);
  } catch (err) { next(err); }
};

/** GET /api/food-types/:id */
exports.getById = async (req, res, next) => {
  try {
    const foodType = await FoodType.findById(req.params.id);
    if (!foodType) return res.status(404).json({ message: 'Food type not found' });
    res.json(foodType);
  } catch (err) { next(err); }
};

/** POST /api/food-types (admin only) */
exports.create = async (req, res, next) => {
  try {
    const { name, icon, image, description, isActive, sortOrder } = req.body;
    if (!name) return res.status(400).json({ message: 'Food type name is required' });
    const foodType = await FoodType.create({ name, icon, image, description, isActive, sortOrder });
    res.status(201).json(foodType);
  } catch (err) { next(err); }
};

/** PUT /api/food-types/:id (admin only) */
exports.update = async (req, res, next) => {
  try {
    const foodType = await FoodType.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!foodType) return res.status(404).json({ message: 'Food type not found' });
    res.json(foodType);
  } catch (err) { next(err); }
};

/** DELETE /api/food-types/:id (admin only) */
exports.remove = async (req, res, next) => {
  try {
    const foodType = await FoodType.findByIdAndDelete(req.params.id);
    if (!foodType) return res.status(404).json({ message: 'Food type not found' });
    res.json({ message: 'Food type removed' });
  } catch (err) { next(err); }
};
