/* ================================
   Settings Routes
   ================================ */

const express = require('express');
const db = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all settings
router.get('/', authenticateToken, (req, res) => {
    try {
        const settingsArray = db.getSettings();

        // Convert array to object
        const settings = {};
        settingsArray.forEach(s => {
            settings[s.key] = s.value;
        });

        res.json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get single setting
router.get('/:key', authenticateToken, (req, res) => {
    try {
        const setting = db.getSetting(req.params.key);

        if (!setting) {
            return res.status(404).json({
                success: false,
                message: 'Setting not found'
            });
        }

        res.json({
            success: true,
            setting
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update single setting
router.put('/:key', authenticateToken, (req, res) => {
    try {
        const { value } = req.body;

        if (value === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Value is required'
            });
        }

        db.setSetting(req.params.key, value);

        res.json({
            success: true,
            message: 'Setting updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Bulk update settings
router.post('/bulk', authenticateToken, (req, res) => {
    try {
        const settings = req.body;

        if (!settings || typeof settings !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Settings object is required'
            });
        }

        for (const [key, value] of Object.entries(settings)) {
            db.setSetting(key, value);
        }

        res.json({
            success: true,
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error('Bulk update error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
