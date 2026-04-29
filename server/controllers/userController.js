const User = require('../models/User');

/** GET /api/users/profile */
exports.getProfile = async (req, res) => { res.json(req.user); };

/** PUT /api/users/profile */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profilePic } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profilePic) user.profilePic = profilePic;
    await user.save();
    res.json(user);
  } catch (err) { next(err); }
};

/** POST /api/users/addresses */
exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { label, street, city, state, postalCode, isDefault, coordinates } = req.body;
    if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));
    user.addresses.push({ label, street, city, state, postalCode, isDefault, coordinates });
    await user.save();
    res.status(201).json(user.addresses);
  } catch (err) { next(err); }
};

/** PUT /api/users/addresses/:id */
exports.updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.id);
    if (!addr) return res.status(404).json({ message: 'Address not found' });
    Object.assign(addr, req.body);
    if (req.body.isDefault) user.addresses.forEach((a) => { if (!a._id.equals(addr._id)) a.isDefault = false; });
    await user.save();
    res.json(user.addresses);
  } catch (err) { next(err); }
};

/** DELETE /api/users/addresses/:id */
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.pull(req.params.id);
    await user.save();
    res.json(user.addresses);
  } catch (err) { next(err); }
};
