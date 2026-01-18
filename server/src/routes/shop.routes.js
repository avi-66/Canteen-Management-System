const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { getAllShops } = require('../controllers/shop.controller');
const { getShopMenu } = require('../controllers/item.controller');

// GET /api/shops
router.get('/', verifyToken, getAllShops);

// GET /api/shops/:shopId/items
router.get('/:shopId/items', verifyToken, getShopMenu);

module.exports = router;
