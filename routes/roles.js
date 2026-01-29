/* ================================
   Roles Routes
   ================================ */

const express = require('express');
const db = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all roles
router.get('/', authenticateToken, (req, res) => {
    try {
        let roles = db.getRoles();

        // Add user count to each role
        roles = roles.map(role => ({
            ...role,
            usersCount: db.countUsersByRole(role.name)
        }));

        res.json({
            success: true,
            roles
        });
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get single role
router.get('/:id', authenticateToken, (req, res) => {
    try {
        const role = db.getRoleById(parseInt(req.params.id));

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        res.json({
            success: true,
            role: {
                ...role,
                usersCount: db.countUsersByRole(role.name)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Create role
router.post('/', authenticateToken, (req, res) => {
    try {
        const { name, description, permissions, color } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Role name is required'
            });
        }

        // Check if role exists
        const existingRole = db.getRoleByName(name);
        if (existingRole) {
            return res.status(400).json({
                success: false,
                message: 'Role already exists'
            });
        }

        const newRole = db.createRole({
            name,
            description: description || '',
            permissions: permissions || ['read'],
            color: color || '#64748B',
            createdAt: new Date().toISOString()
        });

        res.status(201).json({
            success: true,
            role: newRole,
            message: 'Role created successfully'
        });
    } catch (error) {
        console.error('Create role error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update role
router.put('/:id', authenticateToken, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name, description, permissions, color } = req.body;

        const role = db.getRoleById(id);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        // If name is changing, update users with this role
        if (name && name !== role.name) {
            const existingRole = db.getRoleByName(name);
            if (existingRole) {
                return res.status(400).json({
                    success: false,
                    message: 'Role name already exists'
                });
            }
            db.updateUsersRole(role.name, name);
        }

        const updates = {};
        if (name) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (permissions) updates.permissions = permissions;
        if (color) updates.color = color;

        const updatedRole = db.updateRole(id, updates);

        res.json({
            success: true,
            role: updatedRole,
            message: 'Role updated successfully'
        });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Delete role
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const role = db.getRoleById(id);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        // Check if users are assigned to this role
        const usersCount = db.countUsersByRole(role.name);
        if (usersCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete role with ${usersCount} assigned users`
            });
        }

        db.deleteRole(id);

        res.json({
            success: true,
            message: 'Role deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
