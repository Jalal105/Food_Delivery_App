const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Starters', 'Main Course', 'Desserts', 'Beverages', 'Sides', 'Combos', 'Specials'],
    },
    foodType: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodType' },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    isVeg: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    isBestseller: { type: Boolean, default: false },
    spiceLevel: { type: String, enum: ['mild', 'medium', 'hot', ''], default: '' },
    preparationTime: { type: String, default: '15-20 min' },
    rating: { type: Number, default: 0 },
    numRatings: { type: Number, default: 0 },
    tags: [String],
  },
  { timestamps: true }
);

foodItemSchema.index({ name: 'text', description: 'text', tags: 'text' });
foodItemSchema.index({ restaurantId: 1, category: 1 });
foodItemSchema.index({ foodType: 1 });

module.exports = mongoose.model('FoodItem', foodItemSchema);
