const { readJSON, writeJSON, appendToJSON, updateInJSON, deleteFromJSON } = require('../utils/fileManager');

const ITEMS_FILE = 'items.json';
const SHOPS_FILE = 'shops.json';
const ORDERS_FILE = 'orders.json';

const getShopMenu = (req, res) => {
    try {
        const { shopId } = req.params;
        const shops = readJSON(SHOPS_FILE);
        const shop = shops.find(s => s.id === shopId);

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        const items = readJSON(ITEMS_FILE);
        let shopItems = items.filter(item => item.shopId === shopId);
        const isAdmin = req.user && req.user.role === 'admin';

        if (!isAdmin) {
            shopItems = shopItems.filter(item => item.isAvailable);
        }

        const groupedItems = shopItems.reduce((acc, item) => {
            const category = item.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push({
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                isVeg: item.isVeg,
                isAvailable: item.isAvailable,
                quantity: item.quantity
            });
            return acc;
        }, {});

        const categories = Object.keys(groupedItems).sort().map(categoryName => ({
            categoryName,
            items: groupedItems[categoryName]
        }));

        res.json({
            success: true,
            shop: {
                id: shop.id,
                name: shop.name
            },
            categories
        });
    } catch (error) {
        console.error('Error in getShopMenu:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getShopItems = async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const items = readJSON(ITEMS_FILE);
        let shopId;

        if (role === 'SHOP_ADMIN') {
            const shops = readJSON(SHOPS_FILE);
            const shop = shops.find(s => s.adminId === userId);
            if (!shop) return res.status(404).json({ success: false, message: "No shop assigned" });
            shopId = shop.id;
        } else if (role === 'SUPER_ADMIN') {
            if (req.query.shopId) shopId = req.query.shopId;
        }

        const filteredItems = shopId ? items.filter(i => i.shopId === shopId) : items;
        res.json({ success: true, data: filteredItems });
    } catch (error) {
        console.error("Error in getShopItems:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const addItem = async (req, res) => {
    try {
        const { name, category, price, image, isVeg, quantity } = req.body;
        const { id: userId, role } = req.user;

        // Validation
        if (!name || name.length < 2 || name.length > 100) return res.status(400).json({ success: false, message: 'Name must be 2-100 characters' });
        if (!category || category.length < 2 || category.length > 50) return res.status(400).json({ success: false, message: 'Category must be 2-50 characters' });
        if (!price || Number(price) <= 0) return res.status(400).json({ success: false, message: 'Price must be greater than 0' });
        if (quantity === undefined || Number(quantity) < 0) return res.status(400).json({ success: false, message: 'Quantity must be >= 0' });

        let shopId;
        const shops = readJSON(SHOPS_FILE);

        if (role === 'SHOP_ADMIN') {
            const shop = shops.find(s => s.adminId === userId);
            if (!shop) return res.status(403).json({ success: false, message: "No shop assigned" });
            shopId = shop.id;
        } else if (role === 'SUPER_ADMIN') {
            shopId = req.body.shopId;
            if (!shopId) return res.status(400).json({ success: false, message: "Shop ID required for Super Admin" });
        }

        const newItem = {
            id: `item_${Date.now()}`,
            shopId,
            name,
            price: Number(price),
            category,
            isVeg: Boolean(isVeg),
            isAvailable: Number(quantity) > 0,
            quantity: Number(quantity),
            createdAt: new Date().toISOString(),
            image: image || "https://via.placeholder.com/150"
        };

        if (appendToJSON(ITEMS_FILE, newItem)) {
            res.json({ success: true, data: newItem });
        } else {
            throw new Error("Failed to write to file");
        }

    } catch (error) {
        console.error("Error in addItem:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const updates = req.body;
        const { id: userId, role } = req.user;

        const items = readJSON(ITEMS_FILE);
        const item = items.find(i => i.id === itemId);

        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

        if (role === 'SHOP_ADMIN') {
            const shops = readJSON(SHOPS_FILE);
            const shop = shops.find(s => s.adminId === userId);
            if (!shop || shop.id !== item.shopId) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }
        }

        // Validation if fields are present
        if (updates.name && (updates.name.length < 2 || updates.name.length > 100)) return res.status(400).json({ success: false, message: 'Name must be 2-100 characters' });
        if (updates.category && (updates.category.length < 2 || updates.category.length > 50)) return res.status(400).json({ success: false, message: 'Category must be 2-50 characters' });
        if (updates.price && Number(updates.price) <= 0) return res.status(400).json({ success: false, message: 'Price must be greater than 0' });
        if (updates.quantity !== undefined && Number(updates.quantity) < 0) return res.status(400).json({ success: false, message: 'Quantity must be >= 0' });

        // Logic: If quantity updated, auto-set availability
        if (updates.quantity !== undefined) {
            updates.isAvailable = Number(updates.quantity) > 0;
        }

        // Security: Prevent updating specific fields
        delete updates.id;
        delete updates.shopId;
        delete updates.createdAt;

        const updatedItem = updateInJSON(ITEMS_FILE, itemId, updates);

        if (updatedItem) {
            res.json({ success: true, data: updatedItem });
        } else {
            throw new Error("Failed to update item");
        }
    } catch (error) {
        console.error("Error in updateItem:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { id: userId, role } = req.user;

        const items = readJSON(ITEMS_FILE);
        const item = items.find(i => i.id === itemId);

        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

        if (role === 'SHOP_ADMIN') {
            const shops = readJSON(SHOPS_FILE);
            const shop = shops.find(s => s.adminId === userId);
            if (!shop || shop.id !== item.shopId) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }
        }

        const orders = readJSON(ORDERS_FILE);
        const activeOrders = orders.filter(o =>
            !['COMPLETED', 'DELIVERED', 'REJECTED', 'CANCELLED'].includes(o.status) &&
            o.items.some(orderItem => orderItem.itemId === itemId)
        );

        if (activeOrders.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete item. It is part of ${activeOrders.length} active orders.`
            });
        }

        if (deleteFromJSON(ITEMS_FILE, itemId)) {
            res.json({ success: true, message: 'Item deleted' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to delete' });
        }

    } catch (error) {
        console.error("Error in deleteItem:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const toggleAvailability = async (req, res) => {
    try {
        const { itemId } = req.params;
        const items = readJSON(ITEMS_FILE);
        const item = items.find(i => i.id === itemId);

        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

        // Permission check
        const { id: userId, role } = req.user;
        if (role === 'SHOP_ADMIN') {
            const shops = readJSON(SHOPS_FILE);
            const shop = shops.find(s => s.adminId === userId);
            if (!shop || shop.id !== item.shopId) return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const newStatus = !item.isAvailable;
        const updatedItem = updateInJSON(ITEMS_FILE, itemId, { isAvailable: newStatus });

        if (updatedItem) {
            res.json({ success: true, data: updatedItem });
        } else {
            throw new Error("Failed to update availability");
        }
    } catch (error) {
        console.error("Error in toggleAvailability:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getShopMenu,
    getShopItems,
    addItem,
    updateItem,
    deleteItem,
    toggleAvailability
};
