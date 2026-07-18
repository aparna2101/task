const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { runScheduler } = require('./controllers/schedulerController');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Mount routes
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/scheduler', require('./routes/schedulerRoutes'));

// Basic health check route
app.get('/', (req, res) => {
  res.send('Order Management API is running...');
});

// Configure background cron scheduler task to run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Internal Cron Trigger: Starting status progression checks...`);
  try {
    const result = await runScheduler(null, null);
    console.log(`[${timestamp}] Internal Cron Completed. Orders updated: ${result.ordersProcessed}`);
  } catch (error) {
    console.error(`[${timestamp}] Internal Cron Failed:`, error.message);
  }
});

// Start listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Scheduler is scheduled to run every 5 minutes.`);
});
