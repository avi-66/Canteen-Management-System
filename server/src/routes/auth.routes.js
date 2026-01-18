const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/auth.middleware');
const { readJSON } = require('../utils/fileManager');
const router = express.Router();

// Load env variables
require('dotenv').config();

const USERS_FILE = 'users.json';

const { register, login } = require('../controllers/auth.controller');

// ROUTE 0: Email/Password Auth
router.post('/register', register);
router.post('/login', login);

// ROUTE 1: GET /api/auth/google
// Helper: Check if Google Auth is configured
const isGoogleAuthAvailable = () => {
    return process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
};

// ROUTE 1: GET /api/auth/google
router.get('/google', (req, res, next) => {
    if (!isGoogleAuthAvailable()) {
        return res.status(503).json({
            success: false,
            message: "Google Login is not configured. Missing GOOGLE_CLIENT_ID/SECRET."
        });
    }
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// ROUTE 2: GET /api/auth/google/callback
// Helper: Get Frontend URL
const getFrontendUrl = () => process.env.FRONTEND_URL || 'https://canteen-management-system-frontend-k4rx.onrender.com';

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${getFrontendUrl()}/login?error=auth_failed` }),
    (req, res) => {
        try {
            // Generate JWT
            const payload = {
                userId: req.user.id,
                role: req.user.role
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

            // Redirect to frontend
            res.redirect(`${getFrontendUrl()}?token=${token}`);
        } catch (error) {
            console.error('Auth callback error:', error);
            res.redirect(`${getFrontendUrl()}/login?error=server_error`);
        }
    }
);

// ROUTE 3: GET /api/auth/me
router.get('/me', verifyToken, (req, res) => {
    try {
        const users = readJSON(USERS_FILE);
        const user = users.find(u => u.id === req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                picture: user.picture
            }
        });
    } catch (error) {
        console.error('Me endpoint error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
