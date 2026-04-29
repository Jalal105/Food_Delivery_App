const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    cuisine: [{ type: String }],
    image: { type: String, required: true },
    coverImage: { type: String, default: '' },
    rating: { type: Number, default: 4.0, min: 0, max: 5 },
    numRatings: { type: Number, default: 0 },
    deliveryTime: { type: String, default: '30-40 min' },
    deliveryFee: { type: Number, default: 0 },
    minOrder: { type: Number, default: 0 },
    isOpen: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvalDate: { type: Date },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      coordinates: { lat: Number, lng: Number },
    },
    openingHours: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '23:00' },
    },
    tags: [String],
    foodTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoodType' }],
  },
  { timestamps: true }
);

restaurantSchema.index({ name: 'text', cuisine: 'text', tags: 'text' });
restaurantSchema.index({ ownerId: 1 });
restaurantSchema.index({ approvalStatus: 1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);
