const mongoose = require('mongoose');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const FoodItem = require('../models/FoodItem');
const connectDB = require('./db');
require('dotenv').config();

const restaurants = [
  { name: 'The Spice Garden', description: 'Authentic Indian cuisine with a modern twist. From rich biryanis to sizzling tandoori delights.', cuisine: ['Indian', 'Biryani', 'Tandoori'], image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600', rating: 4.5, numRatings: 342, deliveryTime: '25-35 min', deliveryFee: 2.5, isFeatured: true, isOpen: true, tags: ['spicy', 'indian', 'biryani'] },
  { name: 'Pizza Paradise', description: 'Wood-fired pizzas crafted with love. Italian flavors in every slice.', cuisine: ['Italian', 'Pizza', 'Pasta'], image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600', rating: 4.7, numRatings: 578, deliveryTime: '20-30 min', deliveryFee: 1.5, isFeatured: true, isOpen: true, tags: ['pizza', 'italian', 'pasta'] },
  { name: 'Dragon Wok', description: 'Premium Chinese and Thai cuisine. Taste the Orient with every bite.', cuisine: ['Chinese', 'Thai', 'Asian'], image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600', rating: 4.3, numRatings: 215, deliveryTime: '30-40 min', deliveryFee: 2.0, isFeatured: false, isOpen: true, tags: ['chinese', 'noodles', 'thai'] },
  { name: 'Burger Republic', description: 'Gourmet burgers, loaded fries, and creamy shakes. Your burger craving, served.', cuisine: ['American', 'Burgers', 'Fast Food'], image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600', rating: 4.6, numRatings: 892, deliveryTime: '15-25 min', deliveryFee: 1.0, isFeatured: true, isOpen: true, tags: ['burgers', 'fast food', 'shakes'] },
  { name: 'Sushi Symphony', description: 'Fresh sushi rolls, sashimi platters, and Japanese delicacies.', cuisine: ['Japanese', 'Sushi', 'Asian'], image: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=600', rating: 4.8, numRatings: 167, deliveryTime: '35-45 min', deliveryFee: 3.0, isFeatured: true, isOpen: true, tags: ['sushi', 'japanese', 'healthy'] },
  { name: 'Mediterranean Mezze', description: 'Hummus, falafel, shawarma and fresh salads from the Mediterranean coast.', cuisine: ['Mediterranean', 'Middle Eastern', 'Healthy'], image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600', rating: 4.4, numRatings: 198, deliveryTime: '25-35 min', deliveryFee: 2.0, isFeatured: false, isOpen: true, tags: ['healthy', 'shawarma', 'falafel'] },
];

const foodItemsByRestaurant = {
  'The Spice Garden': [
    { name: 'Butter Chicken', description: 'Tender chicken in rich tomato-butter gravy with aromatic spices', price: 14.99, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', category: 'Main Course', isVeg: false, isBestseller: true, spiceLevel: 'medium', rating: 4.8, numRatings: 120 },
    { name: 'Hyderabadi Biryani', description: 'Fragrant basmati rice layered with spiced lamb and saffron', price: 16.99, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', category: 'Main Course', isVeg: false, isBestseller: true, spiceLevel: 'hot', rating: 4.9, numRatings: 200 },
    { name: 'Paneer Tikka', description: 'Marinated cottage cheese cubes grilled in tandoor', price: 11.99, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=400', category: 'Starters', isVeg: true, isBestseller: false, spiceLevel: 'medium', rating: 4.5, numRatings: 88 },
    { name: 'Garlic Naan', description: 'Soft bread topped with garlic and butter from tandoor', price: 3.99, image: 'https://images.unsplash.com/photo-1600628421055-4d30de868b8f?w=400', category: 'Sides', isVeg: true, spiceLevel: 'mild', rating: 4.6, numRatings: 150 },
    { name: 'Mango Lassi', description: 'Cool yogurt drink blended with fresh Alphonso mangoes', price: 4.99, image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400', category: 'Beverages', isVeg: true, rating: 4.7, numRatings: 95 },
    { name: 'Gulab Jamun', description: 'Soft milk dumplings soaked in rose-cardamom syrup', price: 5.99, image: 'https://images.unsplash.com/photo-1666190059278-8d22c200bdfe?w=400', category: 'Desserts', isVeg: true, rating: 4.4, numRatings: 67 },
    { name: 'Dal Makhani', description: 'Black lentils slow-cooked overnight with butter and cream', price: 12.99, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', category: 'Main Course', isVeg: true, isBestseller: true, spiceLevel: 'mild', rating: 4.7, numRatings: 110 },
    { name: 'Chicken Tikka', description: 'Succulent char-grilled chicken marinated in yogurt spices', price: 13.99, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400', category: 'Starters', isVeg: false, spiceLevel: 'hot', rating: 4.6, numRatings: 140 },
  ],
  'Pizza Paradise': [
    { name: 'Margherita Classic', description: 'San Marzano tomatoes, fresh mozzarella, basil on wood-fired crust', price: 12.99, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', category: 'Main Course', isVeg: true, isBestseller: true, rating: 4.8, numRatings: 250 },
    { name: 'Pepperoni Supreme', description: 'Double pepperoni, mozzarella, crushed red pepper on thin crust', price: 15.99, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', category: 'Main Course', isVeg: false, isBestseller: true, rating: 4.9, numRatings: 310 },
    { name: 'Truffle Mushroom', description: 'Wild mushroom medley with truffle oil and parmesan', price: 17.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', category: 'Specials', isVeg: true, rating: 4.7, numRatings: 85 },
    { name: 'Garlic Bread', description: 'Toasted sourdough with garlic butter and herbs', price: 5.99, image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400', category: 'Sides', isVeg: true, rating: 4.5, numRatings: 180 },
    { name: 'Tiramisu', description: 'Classic Italian dessert with espresso-soaked ladyfingers', price: 7.99, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', category: 'Desserts', isVeg: true, rating: 4.8, numRatings: 120 },
    { name: 'Penne Alfredo', description: 'Creamy parmesan penne with grilled chicken', price: 13.99, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400', category: 'Main Course', isVeg: false, rating: 4.6, numRatings: 95 },
  ],
  'Dragon Wok': [
    { name: 'Kung Pao Chicken', description: 'Wok-tossed chicken with peanuts, chili and Sichuan pepper', price: 13.99, image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400', category: 'Main Course', isVeg: false, isBestseller: true, spiceLevel: 'hot', rating: 4.6, numRatings: 78 },
    { name: 'Pad Thai', description: 'Stir-fried rice noodles with shrimp, tofu, peanuts and lime', price: 12.99, image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400', category: 'Main Course', isVeg: false, isBestseller: true, rating: 4.7, numRatings: 110 },
    { name: 'Dim Sum Platter', description: 'Steamed har gow, siu mai, and crystal dumplings', price: 14.99, image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400', category: 'Starters', isVeg: false, rating: 4.5, numRatings: 65 },
    { name: 'Vegetable Spring Rolls', description: 'Crispy rolls filled with julienned vegetables', price: 7.99, image: 'https://images.unsplash.com/photo-1548507200-1b42daac6d55?w=400', category: 'Starters', isVeg: true, rating: 4.3, numRatings: 90 },
    { name: 'Green Curry', description: 'Thai green curry with coconut milk, bamboo shoots, basil', price: 14.99, image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400', category: 'Main Course', isVeg: false, spiceLevel: 'hot', rating: 4.6, numRatings: 55 },
  ],
  'Burger Republic': [
    { name: 'Classic Smash Burger', description: 'Double smashed patty, American cheese, caramelized onions, special sauce', price: 11.99, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', category: 'Main Course', isVeg: false, isBestseller: true, rating: 4.8, numRatings: 350 },
    { name: 'Truffle Fries', description: 'Crispy fries with truffle oil, parmesan, and herbs', price: 6.99, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', category: 'Sides', isVeg: true, isBestseller: true, rating: 4.7, numRatings: 280 },
    { name: 'BBQ Bacon Burger', description: 'Angus beef, smoked bacon, cheddar, BBQ sauce, pickles', price: 14.99, image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400', category: 'Main Course', isVeg: false, spiceLevel: 'mild', rating: 4.6, numRatings: 190 },
    { name: 'Oreo Milkshake', description: 'Thick vanilla milkshake blended with Oreo cookies and cream', price: 5.99, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', category: 'Beverages', isVeg: true, rating: 4.8, numRatings: 220 },
    { name: 'Chicken Wings', description: '8 crispy wings tossed in buffalo, BBQ or honey garlic sauce', price: 10.99, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400', category: 'Starters', isVeg: false, spiceLevel: 'medium', rating: 4.5, numRatings: 175 },
    { name: 'Veggie Beyond Burger', description: 'Plant-based patty with avocado, lettuce, tomato, vegan mayo', price: 12.99, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400', category: 'Main Course', isVeg: true, rating: 4.4, numRatings: 95 },
  ],
  'Sushi Symphony': [
    { name: 'Rainbow Roll', description: 'Inside-out roll with tuna, salmon, avocado, and cucumber', price: 16.99, image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400', category: 'Main Course', isVeg: false, isBestseller: true, rating: 4.9, numRatings: 88 },
    { name: 'Salmon Sashimi', description: '8 pieces of premium Norwegian salmon sashimi', price: 18.99, image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400', category: 'Specials', isVeg: false, rating: 4.8, numRatings: 72 },
    { name: 'Edamame', description: 'Steamed soybeans with sea salt and sesame', price: 5.99, image: 'https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9?w=400', category: 'Starters', isVeg: true, rating: 4.5, numRatings: 55 },
    { name: 'Miso Ramen', description: 'Rich miso broth with chashu pork, ajitama egg, nori', price: 15.99, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', category: 'Main Course', isVeg: false, isBestseller: true, rating: 4.7, numRatings: 110 },
    { name: 'Matcha Ice Cream', description: 'Premium Uji matcha ice cream with mochi balls', price: 6.99, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', category: 'Desserts', isVeg: true, rating: 4.6, numRatings: 45 },
  ],
  'Mediterranean Mezze': [
    { name: 'Chicken Shawarma Plate', description: 'Spiced rotisserie chicken with hummus, rice, and garlic sauce', price: 13.99, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400', category: 'Main Course', isVeg: false, isBestseller: true, rating: 4.7, numRatings: 95 },
    { name: 'Falafel Wrap', description: 'Crispy chickpea falafel in pita with tahini and pickles', price: 9.99, image: 'https://images.unsplash.com/photo-1561651188-d207bbec4ec3?w=400', category: 'Main Course', isVeg: true, isBestseller: true, rating: 4.6, numRatings: 130 },
    { name: 'Hummus & Pita', description: 'Classic chickpea hummus with warm pita bread and olive oil', price: 7.99, image: 'https://images.unsplash.com/photo-1578512762296-d2e7a4c75b6e?w=400', category: 'Starters', isVeg: true, rating: 4.5, numRatings: 85 },
    { name: 'Greek Salad', description: 'Crisp vegetables, Kalamata olives, feta cheese, oregano dressing', price: 8.99, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', category: 'Sides', isVeg: true, rating: 4.4, numRatings: 60 },
    { name: 'Baklava', description: 'Layered phyllo pastry with pistachios and rose syrup', price: 6.99, image: 'https://images.unsplash.com/photo-1598110750624-207050c4f28c?w=400', category: 'Desserts', isVeg: true, rating: 4.7, numRatings: 48 },
  ],
};

async function seed() {
  try {
    await connectDB();
    await Promise.all([User.deleteMany(), Restaurant.deleteMany(), FoodItem.deleteMany()]);

    // Create users
    // Super admin — must match SUPER_ADMIN_EMAIL in middleware/auth.js
    const admin = await User.create({ name: 'SK Jalaluddin', email: 'skjalaluddin772@gmail.com', password: 'admin123', role: 'admin', adminApprovalStatus: 'approved', phone: '+1234567890' });
    await User.create({ name: 'John Doe', email: 'user@bitedash.com', password: 'user123', role: 'user', phone: '+1987654321',
      addresses: [{ label: 'Home', street: '123 Main St, Apt 4B', city: 'New York', state: 'NY', postalCode: '10001', isDefault: true }],
    });

    // Create restaurants
    const createdRestaurants = await Restaurant.insertMany(restaurants.map((r) => ({ ...r, ownerId: admin._id, approvalStatus: 'approved', approvalDate: new Date() })));

    // Create food items
    const allItems = [];
    for (const rest of createdRestaurants) {
      const items = foodItemsByRestaurant[rest.name] || [];
      for (const item of items) {
        allItems.push({ ...item, restaurantId: rest._id });
      }
    }
    await FoodItem.insertMany(allItems);

    console.log('\n  ✅ BiteDash Database Seeded!');
    console.log(`  📦 ${createdRestaurants.length} restaurants, ${allItems.length} food items`);
    console.log(`  👤 Admin: skjalaluddin772@gmail.com / admin123`);
    console.log(`  👤 User:  user@bitedash.com / user123\n`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
