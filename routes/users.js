/* ================================
   Users Routes
   ================================ */

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all users with search, filter, and pagination
router.get('/', authenticateToken, (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        let users = db.getUsers();

        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase();
            users = users.filter(u =>
                u.firstName.toLowerCase().includes(searchLower) ||
                u.lastName.toLowerCase().includes(searchLower) ||
                u.email.toLowerCase().includes(searchLower)
            );
        }

        // Filter by role
        if (role) {
            users = users.filter(u => u.role === role);
        }

        // Filter by status
        if (status) {
            users = users.filter(u => u.status === status);
        }

        const total = users.length;
        const totalPages = Math.ceil(total / limitNum);
        const offset = (pageNum - 1) * limitNum;

        // Paginate
        users = users.slice(offset, offset + limitNum);

        // Remove passwords
        users = users.map(({ password, ...user }) => user);

        res.json({
            success: true,
            users,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get single user
router.get('/:id', authenticateToken, (req, res) => {
    try {
        const user = db.getUserById(parseInt(req.params.id));

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const { password, ...userData } = user;
        res.json({
            success: true,
            user: userData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Create user
router.post('/', authenticateToken, (req, res) => {
    try {
        const { firstName, lastName, email, password, role, status } = req.body;

        if (!firstName || !lastName || !email) {
            return res.status(400).json({
                success: false,
                message: 'First name, last name, and email are required'
            });
        }

        // Check if email exists
        const existingUser = db.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;
        const avatarColors = ['#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];
        const avatar = avatarColors[Math.floor(Math.random() * avatarColors.length)];

        const newUser = db.createUser({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: role || 'User',
            status: status || 'Pending',
            joined: new Date().toISOString().split('T')[0],
            avatar
        });

        const { password: _, ...userData } = newUser;

        res.status(201).json({
            success: true,
            user: userData,
            message: 'User created successfully'
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update user
router.put('/:id', authenticateToken, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { firstName, lastName, email, password, role, status } = req.body;

        const user = db.getUserById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if email is taken by another user
        if (email && email !== user.email) {
            const existingUser = db.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        const updates = {};
        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;
        if (email) updates.email = email;
        if (role) updates.role = role;
        if (status) updates.status = status;
        if (password) updates.password = bcrypt.hashSync(password, 10);

        const updatedUser = db.updateUser(id, updates);
        const { password: _, ...userData } = updatedUser;

        res.json({
            success: true,
            user: userData,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Delete user
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = db.getUserById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting self
        if (user.id === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        db.deleteUser(id);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Bulk delete
router.post('/bulk-delete', authenticateToken, (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No user IDs provided'
            });
        }

        // Filter out current user
        const filtered = ids.filter(id => id !== req.user.id);
        let deletedCount = 0;

        for (const id of filtered) {
            if (db.deleteUser(id)) {
                deletedCount++;
            }
        }

        res.json({
            success: true,
            deletedCount,
            message: `${deletedCount} users deleted`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
