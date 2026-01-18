const { readJSON } = require('./fileManager');
const ORDERS_FILE = 'orders.json';

const generateOrderToken = (shopName) => {
    try {
        // 1. Get current date in DDMMYY format
        const now = new Date();
        const d = String(now.getDate()).padStart(2, '0');
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const y = String(now.getFullYear()).slice(-2);
        const dateStr = `${d}${m}${y}`;

        // 2. Get shop prefix
        // Remove non-alphanumeric, uppercase, take first 5
        const cleanName = shopName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const prefix = cleanName.substring(0, 5);

        // 3. Read orders to find sequence
        const orders = readJSON(ORDERS_FILE);

        // Filter for orders with the same prefix and date
        // Token format: PREFIX_DATE_SEQ
        const currentTokenPrefix = `${prefix}_${dateStr}`;

        const todayOrders = orders.filter(order =>
            order.tokenNumber && order.tokenNumber.startsWith(currentTokenPrefix)
        );

        let maxSeq = 0;
        todayOrders.forEach(order => {
            const parts = order.tokenNumber.split('_');
            if (parts.length === 3) {
                const seq = parseInt(parts[2], 10);
                if (!isNaN(seq) && seq > maxSeq) {
                    maxSeq = seq;
                }
            }
        });

        // 4. Increment sequence
        const nextSeq = maxSeq + 1;
        const seqStr = String(nextSeq).padStart(3, '0');

        return `${currentTokenPrefix}_${seqStr}`;
    } catch (error) {
        console.error('Error generating token:', error);
        // Fallback or rethrow? 
        // Generates a timestamp based fallback to prevent total failure
        return `ERR_${Date.now()}`;
    }
};

module.exports = { generateOrderToken };
