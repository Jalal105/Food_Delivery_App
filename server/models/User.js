const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, default: '' },
  postalCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, minlength: 6 },
    profilePic: { type: String, default: '' },
    phone: { type: String, default: '' },
    role: { type: String, enum: ['user', 'restaurant', 'admin'], default: 'user' },
    googleId: { type: String },
    addresses: [addressSchema],
    savedPayments: [
      {
        type: { type: String, enum: ['upi', 'card', 'cod'] },
        label: String,
        last4: String,
      },
    ],
    // Admin approval system
    adminApprovalStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
    },
    adminApprovalRequestedAt: { type: Date },
    // Restaurant approval system
    restaurantApprovalStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
    },
    restaurantApprovalRequestedAt: { type: Date },
    // Restaurant-specific fields
    restaurantInfo: {
      name: { type: String, default: '' },
      description: { type: String, default: '' },
      cuisine: [{ type: String }],
      image: { type: String, default: '' },
      coverImage: { type: String, default: '' },
      deliveryTime: { type: String, default: '30-40 min' },
      deliveryFee: { type: Number, default: 0 },
      minOrder: { type: Number, default: 0 },
      isOpen: { type: Boolean, default: true },
      address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
      },
      openingHours: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '23:00' },
      },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
