const { readJSON } = require('../utils/fileManager');

const SHOPS_FILE = 'shops.json';

const getAllShops = (req, res) => {
    try {
        const shops = readJSON(SHOPS_FILE);

        if (!shops || shops.length === 0) {
            return res.json({
                success: true,
                shops: []
            });
        }

        // Filter valid fields and sort by name
        const formattedShops = shops.map(shop => ({
            id: shop.id,
            name: shop.name,
            image: shop.image,
            isOpen: shop.isOpen,
            openingTime: shop.openingTime,
            closingTime: shop.closingTime
        })).sort((a, b) => a.name.localeCompare(b.name));

        res.json({
            success: true,
            shops: formattedShops
        });
    } catch (error) {
        console.error('Error in getAllShops:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getAllShops
};
