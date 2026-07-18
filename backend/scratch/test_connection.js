const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

console.log('Testing connection to MongoDB...');
console.log('URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('SUCCESS: Database connected successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('FAILED: Database connection failed:', err.message);
    process.exit(1);
  });
