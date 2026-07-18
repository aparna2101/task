const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Route configurations for /api/orders
router.post('/', orderController.createOrder);
router.post('/seed-dummy', orderController.seedDummyOrders);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id', orderController.updateOrder);

module.exports = router;
