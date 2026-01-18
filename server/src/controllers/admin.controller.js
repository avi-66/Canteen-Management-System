const { readJSON, updateInJSON, appendToJSON, writeJSON } = require('../utils/fileManager');
const USERS_FILE = 'users.json';
const SHOPS_FILE = 'shops.json';
const ORDERS_FILE = 'orders.json';
const ITEMS_FILE = 'items.json';

// ... existing exports ...

exports.getMyShop = async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const shops = readJSON(SHOPS_FILE);

        if (role === 'SUPER_ADMIN') {
            return res.json({
                success: true,
                role: 'SUPER_ADMIN',
                shops: shops.map(shop => ({
                    id: shop.id,
                    name: shop.name
                }))
            });
        }

        if (role === 'SHOP_ADMIN') {
            // Find shop where adminId matches the logged-in user
            const shop = shops.find(s => s.adminId === userId);

            if (!shop) {
                return res.status(404).json({ success: false, message: "No shop assigned" });
            }

            return res.json({
                success: true,
                shop: {
                    id: shop.id,
                    name: shop.name,
                    isOpen: shop.isOpen,
                    openingTime: shop.openingTime,
                    closingTime: shop.closingTime
                }
            });
        }

        return res.status(403).json({ success: false, message: 'Access denied' });
    } catch (error) {
        console.error("Error in getMyShop:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllShops = async (req, res) => {
    try {
        const shops = readJSON(SHOPS_FILE);
        const users = readJSON(USERS_FILE);

        // Enhance shops with admin email if exists
        const enhancedShops = shops.map(shop => {
            const admin = users.find(u => u.id === shop.adminId);
            return {
                ...shop,
                adminEmail: admin ? admin.email : null
            };
        });

        res.json({ success: true, data: enhancedShops });
    } catch (error) {
        console.error("Error in getAllShops:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getShopById = async (req, res) => {
    try {
        const { shopId } = req.params;
        const shops = readJSON(SHOPS_FILE);
        const shop = shops.find(s => s.id === shopId);

        if (!shop) {
            return res.status(404).json({ success: false, message: 'Shop not found' });
        }

        res.json({ success: true, data: shop });
    } catch (error) {
        console.error("Error in getShopById:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getShopStats = async (req, res) => {
    try {
        const { shopId } = req.params;
        const orders = readJSON(ORDERS_FILE);
        const items = readJSON(ITEMS_FILE);

        const shopOrders = orders.filter(o => o.shopId === shopId);

        // Orders Today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const ordersTodayList = shopOrders.filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate >= startOfDay;
        });

        const ordersToday = ordersTodayList.length;

        // Revenue Today
        const revenueToday = ordersTodayList.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // Pending Orders (PLACED status)
        const pendingOrders = shopOrders.filter(o => o.status === 'PLACED').length;

        // Items Out of Stock (quantity <= 0 or isAvailable is false)
        const outOfStockItems = items.filter(i =>
            i.shopId === shopId && (!i.isAvailable || i.quantity <= 0)
        ).length;

        res.json({
            success: true,
            data: {
                ordersToday,
                revenueToday,
                pendingOrders,
                outOfStockItems
            }
        });

    } catch (error) {
        console.error("Error in getShopStats:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateShopStatus = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { isOpen } = req.body;

        // Validate inputs
        if (typeof isOpen !== 'boolean') {
            return res.status(400).json({ success: false, message: 'isOpen must be a boolean' });
        }

        // Check permissions: User must be SUPER_ADMIN or the admin of this shop
        const shops = readJSON(SHOPS_FILE);
        const shop = shops.find(s => s.id === shopId);
        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

        if (req.user.role !== 'SUPER_ADMIN' && shop.adminId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this shop' });
        }

        const updatedShop = updateInJSON(SHOPS_FILE, shopId, { isOpen });

        res.json({ success: true, data: updatedShop });
    } catch (error) {
        console.error("Error in updateShopStatus:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.toggleShopStatus = async (req, res) => {
    try {
        const { shopId } = req.params;

        // 1. Read shops to find the target shop
        const shops = readJSON(SHOPS_FILE);
        const shop = shops.find(s => s.id === shopId);

        if (!shop) {
            return res.status(404).json({ success: false, message: "Shop not found" });
        }

        // 2. Verify Access
        // SHOP_ADMIN must match adminId; SUPER_ADMIN can bypass
        if (req.user.role === 'SHOP_ADMIN' && shop.adminId !== req.user.id) {
            return res.status(403).json({ success: false, message: "Access denied: You do not own this shop" });
        }

        // 3. Toggle Status using !shop.isOpen
        const newStatus = !shop.isOpen;

        // 4. Update JSON
        updateInJSON(SHOPS_FILE, shopId, { isOpen: newStatus });

        // 5. Return Response
        return res.json({
            success: true,
            shop: {
                id: shop.id,
                isOpen: newStatus
            },
            message: newStatus ? "Shop is now open" : "Shop is now closed"
        });

    } catch (error) {
        console.error("Error in toggleShopStatus:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addShop = async (req, res) => {
    try {
        const { name, adminEmail, openingTime, closingTime, image } = req.body;

        if (req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, message: 'Access denied: Only Super Admin can create shops' });
        }

        // 1. Basic Validation
        if (!name || !adminEmail || !openingTime || !closingTime) {
            return res.status(400).json({ success: false, message: 'All fields are required (name, adminEmail, openingTime, closingTime)' });
        }

        if (name.length < 2 || name.length > 100) {
            return res.status(400).json({ success: false, message: 'Shop name must be between 2 and 100 characters' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(adminEmail)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        // Validate Time Format HH:MM
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(openingTime) || !timeRegex.test(closingTime)) {
            return res.status(400).json({ success: false, message: 'Invalid time format. Use HH:MM' });
        }

        // 2. Uniqueness Check
        const shops = readJSON(SHOPS_FILE);
        if (shops.some(s => s.name.toLowerCase() === name.toLowerCase())) {
            return res.status(400).json({ success: false, message: 'Shop name already exists' });
        }

        // 3. Handle User/Admin
        const users = readJSON(USERS_FILE);
        let adminUser = users.find(u => u.email === adminEmail);
        let userId;

        if (adminUser) {
            // Verify existing user doesn't manage a shop
            if (shops.some(s => s.adminId === adminUser.id)) {
                return res.status(400).json({ success: false, message: 'This user already manages a shop' });
            }
            if (adminUser.role !== 'SHOP_ADMIN' && adminUser.role !== 'SUPER_ADMIN') {
                adminUser.role = 'SHOP_ADMIN';
                const updatedUsers = users.map(u => u.id === adminUser.id ? adminUser : u);
                writeJSON(USERS_FILE, updatedUsers);
            }
            userId = adminUser.id;
        } else {
            // Create new user
            userId = "user_" + Date.now();
            const newUser = {
                id: userId,
                email: adminEmail,
                name: adminEmail.split('@')[0],
                role: 'SHOP_ADMIN',
                createdAt: new Date().toISOString()
            };
            appendToJSON(USERS_FILE, newUser);
        }

        // 4. Create Shop
        const newShop = {
            id: "shop_" + Date.now(),
            name,
            image: image || "https://via.placeholder.com/150",
            isOpen: true,
            openingTime,
            closingTime,
            adminId: userId
        };

        appendToJSON(SHOPS_FILE, newShop);

        // 5. Response
        res.status(201).json({
            success: true,
            shop: {
                id: newShop.id,
                name: newShop.name,
                adminId: newShop.adminId
            },
            message: "Shop created successfully"
        });

    } catch (error) {
        console.error("Error in addShop:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteShop = async (req, res) => {
    try {
        const { shopId } = req.params;

        if (req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const shops = readJSON(SHOPS_FILE);
        const shopIndex = shops.findIndex(s => s.id === shopId);

        if (shopIndex === -1) {
            return res.status(404).json({ success: false, message: 'Shop not found' });
        }

        const shop = shops[shopIndex];

        // Remove shop from array
        shops.splice(shopIndex, 1);
        writeJSON(SHOPS_FILE, shops);

        res.json({ success: true, message: "Shop deleted successfully" });

    } catch (error) {
        console.error("Error in deleteShop:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateShop = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { name, openingTime, closingTime, image } = req.body;

        if (req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const shops = readJSON(SHOPS_FILE);
        const shopIndex = shops.findIndex(s => s.id === shopId);

        if (shopIndex === -1) {
            return res.status(404).json({ success: false, message: 'Shop not found' });
        }

        // Basic validation if fields are provided
        if (name && (name.length < 2 || name.length > 100)) {
            return res.status(400).json({ success: false, message: 'Shop name too short/long' });
        }

        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (openingTime && !timeRegex.test(openingTime)) {
            return res.status(400).json({ success: false, message: 'Invalid opening time' });
        }
        if (closingTime && !timeRegex.test(closingTime)) {
            return res.status(400).json({ success: false, message: 'Invalid closing time' });
        }

        const updatedShop = {
            ...shops[shopIndex],
            name: name || shops[shopIndex].name,
            openingTime: openingTime || shops[shopIndex].openingTime,
            closingTime: closingTime || shops[shopIndex].closingTime,
            image: image || shops[shopIndex].image
        };

        shops[shopIndex] = updatedShop;
        writeJSON(SHOPS_FILE, shops);

        res.json({ success: true, shop: updatedShop, message: "Shop updated successfully" });

    } catch (error) {
        console.error("Error in updateShop:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = readJSON(USERS_FILE);
        // Sort by createdAt descending
        users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        // Exclude sensitive data if any (e.g. password hash)
        // users.json currently has: id, email, name, role, createdAt. No password.
        res.json({ success: true, data: users });
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role, shopId } = req.body;

        // 1. Prevent changing own role
        if (req.user.id === userId) {
            return res.status(400).json({ success: false, message: "Cannot change your own role" });
        }

        const validRoles = ['USER', 'SHOP_ADMIN', 'SUPER_ADMIN'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role" });
        }

        const users = readJSON(USERS_FILE);
        const user = users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const shops = readJSON(SHOPS_FILE);
        const oldRole = user.role;

        // 2. Logic for promoting to SHOP_ADMIN
        if (role === 'SHOP_ADMIN') {
            if (oldRole !== 'SHOP_ADMIN') {
                if (!shopId) {
                    return res.status(400).json({ success: false, message: "Shop ID required when promoting to Shop Admin" });
                }
                const shop = shops.find(s => s.id === shopId);
                if (!shop) {
                    return res.status(404).json({ success: false, message: "Shop not found" });
                }

                // Guardrail: Shop must not already have an admin
                if (shop.adminId && shop.adminId !== userId) {
                    return res.status(400).json({ success: false, message: "This shop already has an administrator assigned." });
                }

                // Update Shop
                shop.adminId = userId;
                updateInJSON(SHOPS_FILE, shopId, { adminId: userId });
            }
            // If already Shop Admin, allowing shop switch if shopId provided
            else if (shopId) {
                const shop = shops.find(s => s.id === shopId);
                if (shop && shop.adminId && shop.adminId !== userId) {
                    return res.status(400).json({ success: false, message: "Target shop already has an administrator." });
                }
                // Unassign old shop if strictly switching
                const oldShop = shops.find(s => s.adminId === userId && s.id !== shopId);
                if (oldShop) updateInJSON(SHOPS_FILE, oldShop.id, { adminId: null });

                updateInJSON(SHOPS_FILE, shopId, { adminId: userId });
            }
        }

        // 3. Logic for demoting from SHOP_ADMIN
        if (oldRole === 'SHOP_ADMIN' && role !== 'SHOP_ADMIN') {
            // Find shop they managed
            const shop = shops.find(s => s.adminId === userId);
            if (shop) {
                // Unassign
                updateInJSON(SHOPS_FILE, shop.id, { adminId: null });
            }
        }

        // 4. Update User Role
        user.role = role;
        const updatedUsers = users.map(u => u.id === userId ? user : u);
        writeJSON(USERS_FILE, updatedUsers);

        res.json({ success: true, message: "User role updated successfully", user });

    } catch (error) {
        console.error("Error in updateUserRole:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
