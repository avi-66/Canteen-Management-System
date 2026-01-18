const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const {
    getMyShop,
    getAllShops,
    getShopStats,
    updateShopStatus,
    getShopById,
    toggleShopStatus,

    addShop,
    updateShop,
    deleteShop,
    getAllUsers,
    updateUserRole
} = require('../controllers/admin.controller');

const {
    getShopItems,
    addItem,
    updateItem,
    deleteItem,
    toggleAvailability
} = require('../controllers/item.controller');
const orderController = require('../controllers/order.controller');

// Protect all admin routes
router.use(verifyToken);
router.use(checkRole(['SHOP_ADMIN', 'SUPER_ADMIN']));

// Routes
router.get('/my-shop', getMyShop);
router.get('/shops', getAllShops);
router.post('/shops', addShop);
router.put('/shops/:shopId', updateShop);
router.get('/shops/:shopId', getShopById);
router.delete('/shops/:shopId', deleteShop);
router.get('/shop/:shopId/stats', getShopStats);
router.put('/shop/:shopId/status', updateShopStatus);
router.put('/shop/:shopId/toggle', toggleShopStatus);

// User Management Routes
router.get('/users', getAllUsers);
router.put('/users/:userId/role', updateUserRole);

// Order Routes
router.get('/orders', orderController.getShopOrders);
router.put('/orders/:orderId/status', orderController.updateOrderStatus);
router.put('/orders/:orderId/reject', orderController.rejectOrder);

// Item Routes
router.get('/items', getShopItems);
router.post('/items', addItem);
router.put('/items/:itemId', updateItem);
router.delete('/items/:itemId', deleteItem);
router.put('/items/:itemId/availability', toggleAvailability);

module.exports = router;
