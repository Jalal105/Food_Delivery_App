const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { SUPER_ADMIN_EMAIL } = require('../middleware/auth');
const { notifyAdminOfRequest } = require('../utils/email');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

/** POST /api/auth/register */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, accountType } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const userData = { name, email, password };

    if (accountType === 'restaurant') {
      userData.role = 'restaurant';
      userData.restaurantApprovalStatus = 'pending';
      userData.restaurantApprovalRequestedAt = new Date();
    } else if (accountType === 'admin') {
      if (email.toLowerCase() === SUPER_ADMIN_EMAIL) {
        userData.role = 'admin';
        userData.adminApprovalStatus = 'approved';
      } else {
        userData.role = 'user';
        userData.adminApprovalStatus = 'pending';
        userData.adminApprovalRequestedAt = new Date();
      }
    } else {
      userData.role = 'user';
    }

    const user = await User.create(userData);
    const response = { ...user.toJSON(), token: generateToken(user._id) };

    // Send email notifications for pending requests
    if (accountType === 'restaurant' && userData.restaurantApprovalStatus === 'pending') {
      response.pendingMessage = 'Your restaurant account is pending admin approval. You will be notified once approved.';
      notifyAdminOfRequest('restaurant', { name, email }).catch(() => {});
    }
    if (accountType === 'admin' && email.toLowerCase() !== SUPER_ADMIN_EMAIL) {
      response.pendingMessage = 'Your admin access request is pending. The super admin will review your request.';
      notifyAdminOfRequest('admin', { name, email }).catch(() => {});
    }

    res.status(201).json(response);
  } catch (err) { next(err); }
};

/** POST /api/auth/login */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const response = { ...user.toJSON(), token: generateToken(user._id) };
    if (user.role === 'restaurant' && user.restaurantApprovalStatus === 'pending') {
      response.pendingMessage = 'Your restaurant account is still pending admin approval.';
    }
    if (user.role === 'restaurant' && user.restaurantApprovalStatus === 'rejected') {
      response.pendingMessage = 'Your restaurant registration was rejected by admin.';
    }
    if (user.adminApprovalStatus === 'pending') {
      response.pendingMessage = 'Your admin access request is still pending.';
    }
    res.json(response);
  } catch (err) { next(err); }
};

/** POST /api/auth/google */
exports.googleLogin = async (req, res, next) => {
  try {
    const { name, email, profilePic, googleId } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    let user = await User.findOne({ email });
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        if (profilePic) user.profilePic = profilePic;
        await user.save();
      }
    } else {
      user = await User.create({ name: name || email.split('@')[0], email, profilePic, googleId });
    }
    res.json({ ...user.toJSON(), token: generateToken(user._id) });
  } catch (err) { next(err); }
};

/** GET /api/auth/me */
exports.getMe = async (req, res) => {
  res.json(req.user);
};
