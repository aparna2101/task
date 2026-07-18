const Order = require('../models/Order');

// Helper to generate a unique order ID if not provided
const generateOrderId = () => {
  return `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
};

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { orderId, customerName, phoneNumber, productName, amount, paymentStatus, orderStatus } = req.body;

    if (!customerName || !phoneNumber || !productName || amount === undefined) {
      return res.status(400).json({ success: false, message: 'Required fields are missing.' });
    }

    const finalOrderId = orderId ? orderId.trim() : generateOrderId();

    // Check if orderId already exists
    const existingOrder = await Order.findOne({ orderId: finalOrderId });
    if (existingOrder) {
      return res.status(409).json({
        success: false,
        message: `Order ID '${finalOrderId}' already exists.`
      });
    }

    const order = new Order({
      orderId: finalOrderId,
      customerName,
      phoneNumber,
      productName,
      amount,
      paymentStatus: paymentStatus || 'PENDING',
      orderStatus: orderStatus || 'PLACED'
    });

    const savedOrder = await order.save();
    res.status(201).json({ success: true, data: savedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all orders with filtering, search, and pagination
exports.getOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const query = {};

    // 1. Filter by status
    if (status && status !== 'ALL') {
      query.orderStatus = status;
    }

    // 2. Search filter (covers orderId, customerName, and productName)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { orderId: searchRegex },
        { customerName: searchRegex },
        { productName: searchRegex },
        { phoneNumber: searchRegex }
      ];
    }

    // Convert pagination parameters to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipNum = (pageNum - 1) * limitNum;

    // Execute query with pagination and sort by latest created order
    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum);

    const totalPages = Math.ceil(totalOrders / limitNum);

    res.status(200).json({
      success: true,
      pagination: {
        totalOrders,
        totalPages,
        currentPage: pageNum,
        limit: limitNum
      },
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single order by database _id or by custom orderId
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Search by both _id (if valid ObjectId) and custom orderId
    let order;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id);
    }
    
    if (!order) {
      order = await Order.findOne({ orderId: id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order fields manually
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, orderStatus, customerName, phoneNumber, productName, amount } = req.body;

    let order = await Order.findOne({ orderId: id });
    if (!order) {
      order = await Order.findById(id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Check if details are being updated
    if (customerName) order.customerName = customerName;
    if (phoneNumber) order.phoneNumber = phoneNumber;
    if (productName) order.productName = productName;
    if (amount !== undefined) order.amount = amount;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    // If orderStatus changes, we must update statusHistory
    if (orderStatus && orderStatus !== order.orderStatus) {
      order.orderStatus = orderStatus;
      order.statusHistory.push({
        status: orderStatus,
        updatedAt: new Date()
      });
    }

    const updatedOrder = await order.save();
    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Seed dummy orders with custom timestamps to test the scheduler rules
exports.seedDummyOrders = async (req, res) => {
  try {
    const now = Date.now();
    
    // Clear any previous test orders to avoid unique key conflicts
    await Order.deleteMany({
      orderId: { $in: ['ORD-TEST-1', 'ORD-TEST-2', 'ORD-TEST-3'] }
    });

    const dummyOrders = [
      {
        orderId: 'ORD-TEST-1',
        customerName: 'Alice Smith (Old Placed)',
        phoneNumber: '+91 99999 88888',
        productName: 'Premium Wireless Headset',
        amount: 129.99,
        paymentStatus: 'PENDING',
        orderStatus: 'PLACED',
        statusHistory: [
          {
            status: 'PLACED',
            updatedAt: new Date(now - 15 * 60 * 1000) // 15 minutes ago
          }
        ],
        createdAt: new Date(now - 15 * 60 * 1000),
        updatedAt: new Date(now - 15 * 60 * 1000)
      },
      {
        orderId: 'ORD-TEST-2',
        customerName: 'Bob Jones (Old Processing)',
        phoneNumber: '+91 88888 77777',
        productName: 'Mechanical Gaming Keyboard',
        amount: 89.50,
        paymentStatus: 'PAID',
        orderStatus: 'PROCESSING',
        statusHistory: [
          {
            status: 'PLACED',
            updatedAt: new Date(now - 50 * 60 * 1000) // 50 minutes ago
          },
          {
            status: 'PROCESSING',
            updatedAt: new Date(now - 25 * 60 * 1000) // 25 minutes ago
          }
        ],
        createdAt: new Date(now - 50 * 60 * 1000),
        updatedAt: new Date(now - 25 * 60 * 1000)
      },
      {
        orderId: 'ORD-TEST-3',
        customerName: 'Charlie Brown (New Placed)',
        phoneNumber: '+91 77777 66666',
        productName: 'Ergonomic Office Chair',
        amount: 249.00,
        paymentStatus: 'PENDING',
        orderStatus: 'PLACED',
        statusHistory: [
          {
            status: 'PLACED',
            updatedAt: new Date(now - 1 * 60 * 1000) // 1 minute ago
          }
        ],
        createdAt: new Date(now - 1 * 60 * 1000),
        updatedAt: new Date(now - 1 * 60 * 1000)
      }
    ];

    // Using mongoose insertMany but bypassing the pre-save hooks to preserve the custom timestamps
    await Order.insertMany(dummyOrders, { silent: true });

    res.status(201).json({
      success: true,
      message: 'Seeded 3 test orders with custom historical timestamps successfully.',
      data: dummyOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

