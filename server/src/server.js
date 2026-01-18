const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('./config/passport');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// ✅ SAFE ROOT ROUTE (FIRST) - Before any risky middleware
app.get("/", (req, res) => {
    res.status(200).send("Canteen Backend is Live 🚀");
});

const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Routes
// Using try-catch for requiring routes to prevent server crash if a file is malformed or missing dependencies
try {
    app.use('/api/auth', require('./routes/auth.routes'));
} catch (e) { console.error('Error loading auth routes:', e); }

try {
    app.use('/api/shops', require('./routes/shop.routes'));
} catch (e) { console.error('Error loading shop routes:', e); }

try {
    app.use('/api/orders', require('./routes/order.routes'));
} catch (e) { console.error('Error loading order routes:', e); }

try {
    app.use('/api/items', require('./routes/item.routes'));
} catch (e) { console.error('Error loading item routes:', e); }

try {
    app.use('/api/cart', require('./routes/cart.routes'));
} catch (e) { console.error('Error loading cart routes:', e); }

try {
    app.use('/api/admin', require('./routes/admin.routes'));
} catch (e) { console.error('Error loading admin routes:', e); }


// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../../client/dist')));

    app.get('*', (req, res, next) => {
        if (req.url.startsWith('/api')) {
            return next();
        }
        res.sendFile(path.resolve(__dirname, '../../client', 'dist', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('Canteen Management System API is running');
    });
}

// Error handling middleware (MUST BE LAST)
app.use((err, req, res, next) => {
    console.error("🔥 ERROR:", err);
    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
