const mongoose = require('mongoose');

const schedulerLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED'],
    required: true
  },
  ordersProcessed: {
    type: Number,
    default: 0
  },
  details: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('SchedulerLog', schedulerLogSchema);
