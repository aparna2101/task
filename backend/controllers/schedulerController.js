const Order = require('../models/Order');
const SchedulerLog = require('../models/SchedulerLog');

// Core scheduler execution logic
exports.runScheduler = async (req, res) => {
  const startTime = new Date();
  let updatedCount = 0;
  const updatedDetails = [];

  try {
    // 1. Fetch all candidate orders that are in PLACED or PROCESSING state
    const orders = await Order.find({
      orderStatus: { $in: ['PLACED', 'PROCESSING'] }
    });

    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);

    for (const order of orders) {
      let isUpdated = false;
      const oldStatus = order.orderStatus;

      if (order.orderStatus === 'PLACED') {
        // If order status is PLACED for more than 10 minutes, move to PROCESSING
        if (order.createdAt <= tenMinutesAgo) {
          order.orderStatus = 'PROCESSING';
          order.statusHistory.push({
            status: 'PROCESSING',
            updatedAt: now
          });
          isUpdated = true;
        }
      } else if (order.orderStatus === 'PROCESSING') {
        // If order status is PROCESSING for more than 20 minutes, move to READY_TO_SHIP
        // We look for when it entered the 'PROCESSING' status in the history log
        const processingEntry = [...order.statusHistory]
          .reverse()
          .find(entry => entry.status === 'PROCESSING');
        
        const enteredProcessingAt = processingEntry ? processingEntry.updatedAt : order.updatedAt;

        if (enteredProcessingAt <= twentyMinutesAgo) {
          order.orderStatus = 'READY_TO_SHIP';
          order.statusHistory.push({
            status: 'READY_TO_SHIP',
            updatedAt: now
          });
          isUpdated = true;
        }
      }

      if (isUpdated) {
        await order.save();
        updatedCount++;
        updatedDetails.push({
          orderId: order.orderId,
          from: oldStatus,
          to: order.orderStatus
        });
      }
    }

    const logDetailsString = updatedCount > 0 
      ? `Updated ${updatedCount} orders: ${JSON.stringify(updatedDetails)}`
      : 'No orders met status progression criteria.';

    // 2. Save scheduler execution log
    const log = new SchedulerLog({
      timestamp: startTime,
      status: 'SUCCESS',
      ordersProcessed: updatedCount,
      details: logDetailsString
    });
    await log.save();

    const response = {
      success: true,
      message: 'Scheduler task executed successfully.',
      timestamp: startTime,
      ordersProcessed: updatedCount,
      details: updatedDetails
    };

    // If request comes from an API trigger, send the response. Else (internal trigger) return the object.
    if (res) {
      return res.status(200).json(response);
    }
    return response;
  } catch (error) {
    console.error('Scheduler Execution Error:', error);
    
    // Save failed log to database
    try {
      const errorLog = new SchedulerLog({
        timestamp: startTime,
        status: 'FAILED',
        ordersProcessed: updatedCount,
        details: 'An error occurred during execution.',
        errorMessage: error.message
      });
      await errorLog.save();
    } catch (dbLogErr) {
      console.error('Could not save scheduler error log to DB:', dbLogErr.message);
    }

    if (res) {
      return res.status(500).json({
        success: false,
        message: 'Scheduler task failed.',
        error: error.message
      });
    }
    throw error;
  }
};

// Fetch scheduler logs (for dashboard log tab)
exports.getSchedulerLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipNum = (pageNum - 1) * limitNum;

    const totalLogs = await SchedulerLog.countDocuments();
    const logs = await SchedulerLog.find()
      .sort({ timestamp: -1 })
      .skip(skipNum)
      .limit(limitNum);

    const totalPages = Math.ceil(totalLogs / limitNum);

    res.status(200).json({
      success: true,
      pagination: {
        totalLogs,
        totalPages,
        currentPage: pageNum,
        limit: limitNum
      },
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
