const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/food', require('./routes/food'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/food-types', require('./routes/foodTypes'));
app.use('/api/admin', require('./routes/admin'));

// Health
app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'BiteDash API' }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  🍕 BiteDash API`);
  console.log(`  ➜ Port ${PORT} | ${process.env.NODE_ENV || 'development'}\n`);
});
