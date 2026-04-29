const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SUPER_ADMIN_EMAIL = 'skjalaluddin772@gmail.com';

/** Verify JWT and attach user to req */
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ message: 'Not authorized — no token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized — token failed' });
  }
};

/** Restrict to admin role — must also be the super admin email */
const admin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  if (req.user.email !== SUPER_ADMIN_EMAIL && req.user.adminApprovalStatus !== 'approved') {
    return res.status(403).json({ message: 'Admin access not approved' });
  }
  next();
};

/** Restrict to super admin only */
const superAdmin = (req, res, next) => {
  if (req.user?.email !== SUPER_ADMIN_EMAIL) {
    return res.status(403).json({ message: 'Super admin access required' });
  }
  next();
};

/** Restrict to restaurant role with approved status */
const restaurantOwner = (req, res, next) => {
  if (req.user?.role !== 'restaurant' && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Restaurant access required' });
  }
  if (req.user.role === 'restaurant' && req.user.restaurantApprovalStatus !== 'approved') {
    return res.status(403).json({ message: 'Restaurant not yet approved by admin' });
  }
  next();
};

/** Optional auth — attaches user if token present, continues otherwise */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch {
    /* ignore — proceed as guest */
  }
  next();
};

module.exports = { protect, admin, superAdmin, restaurantOwner, optionalAuth, SUPER_ADMIN_EMAIL };
