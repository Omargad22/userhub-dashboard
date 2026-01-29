/* ================================
   Authentication Routes
   ================================ */

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/init');
const { authenticateToken, generateToken } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = db.getUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user has password (some sample users don't)
        if (!user.password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const validPassword = bcrypt.compareSync(password, user.password);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user);

        // Create session
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        db.createSession({
            userId: user.id,
            token,
            createdAt: new Date().toISOString(),
            expiresAt
        });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Logout
router.post('/logout', authenticateToken, (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            db.deleteSession(token);
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
    try {
        const user = db.getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Verify token
router.get('/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        valid: true
    });
});

module.exports = router;
