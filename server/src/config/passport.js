const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { readJSON, appendToJSON } = require('../utils/fileManager');
const path = require('path');

// Load environment variables
require('dotenv').config();

const USERS_FILE = 'users.json';

// ⚠️ Safety check: Only initialize Google OAuth if env vars are present
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn("⚠️ Google OAuth disabled: missing env vars");
} else {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        proxy: true // Force HTTPS callback generation
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Guardrail: Validate email existence
                if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
                    return done(new Error('No email found in Google profile'), null);
                }

                const email = profile.emails[0].value;
                const users = readJSON(USERS_FILE);

                // Check if user exists by googleId
                let user = users.find(u => u.googleId === profile.id);

                if (user) {
                    return done(null, user);
                }

                // Determine role
                let role = 'USER';
                if (process.env.SUPER_ADMIN_EMAIL && email === process.env.SUPER_ADMIN_EMAIL) {
                    role = 'SUPER_ADMIN';
                }

                // Create new user
                const newUser = {
                    id: `user_${Date.now()}`,
                    name: profile.displayName,
                    email: email,
                    googleId: profile.id,
                    role: role,
                    picture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                    createdAt: new Date().toISOString()
                };

                // Save to users.json
                // functionality 'appendToJSON' reads the file again, which is fine.
                const success = appendToJSON(USERS_FILE, newUser);

                if (!success) {
                    return done(new Error('Failed to create user'), null);
                }

                return done(null, newUser);

            } catch (err) {
                return done(err, null);
            }
        }
    ));
}

// Serialize/Deserialize for session support if needed (though we might use JWT)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.id === id);
    done(null, user);
});

module.exports = passport;
