const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Place a new order
router.post('/place', verifyToken, orderController.createOrder);

// Get my orders
router.get('/my-orders', verifyToken, orderController.getMyOrders);

// Placeholder for getting orders
router.get('/', (req, res) => {
    res.json({ message: 'Order route working' });
});

module.exports = router;
