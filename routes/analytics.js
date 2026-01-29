/* ================================
   Analytics Routes
   ================================ */

const express = require('express');
const db = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get dashboard stats
router.get('/stats', authenticateToken, (req, res) => {
    try {
        const users = db.getUsers();

        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalUsers = users.length;
        const activeUsers = users.filter(u => u.status === 'Active').length;
        const pendingUsers = users.filter(u => u.status === 'Pending').length;
        const inactiveUsers = users.filter(u => u.status === 'Inactive').length;
        const newUsersThisMonth = users.filter(u => new Date(u.joined) >= firstOfMonth).length;

        res.json({
            success: true,
            stats: {
                totalUsers,
                activeUsers,
                pendingUsers,
                inactiveUsers,
                newUsersThisMonth
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get user growth trends
router.get('/growth', authenticateToken, (req, res) => {
    try {
        const { days = 30 } = req.query;
        const daysNum = parseInt(days);

        const users = db.getUsers();
        const now = new Date();
        const labels = [];
        const data = [];

        for (let i = daysNum - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

            const count = users.filter(u => u.joined === dateStr).length;
            data.push(count);
        }

        res.json({
            success: true,
            growth: { labels, data }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get monthly trends
router.get('/monthly-trends', authenticateToken, (req, res) => {
    try {
        const users = db.getUsers();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const now = new Date();
        const currentYear = now.getFullYear();
        const labels = [];
        const data = [];

        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(currentYear, now.getMonth() - i, 1);
            const monthIndex = monthDate.getMonth();
            const year = monthDate.getFullYear();
            labels.push(months[monthIndex]);

            const count = users.filter(u => {
                const joinDate = new Date(u.joined);
                return joinDate.getMonth() === monthIndex && joinDate.getFullYear() === year;
            }).length;
            data.push(count);
        }

        res.json({
            success: true,
            trends: { labels, data }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get role distribution
router.get('/roles-distribution', authenticateToken, (req, res) => {
    try {
        const roles = db.getRoles();

        const distribution = roles.map(role => ({
            name: role.name,
            count: db.countUsersByRole(role.name),
            color: role.color
        }));

        res.json({
            success: true,
            distribution
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get status distribution
router.get('/status-distribution', authenticateToken, (req, res) => {
    try {
        const users = db.getUsers();

        const statusColors = {
            'Active': '#22C55E',
            'Pending': '#F59E0B',
            'Inactive': '#EF4444'
        };

        const distribution = ['Active', 'Pending', 'Inactive'].map(status => ({
            name: status,
            count: users.filter(u => u.status === status).length,
            color: statusColors[status]
        }));

        res.json({
            success: true,
            distribution
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get recent activity
router.get('/recent-activity', authenticateToken, (req, res) => {
    try {
        const users = db.getUsers();

        // Get most recently joined users as activity
        const recentUsers = [...users]
            .sort((a, b) => new Date(b.joined) - new Date(a.joined))
            .slice(0, 10);

        const activities = recentUsers.map(user => ({
            type: 'user_joined',
            message: `${user.firstName} ${user.lastName} joined as ${user.role}`,
            timestamp: user.joined,
            user: {
                name: `${user.firstName} ${user.lastName}`,
                avatar: user.avatar
            }
        }));

        res.json({
            success: true,
            activities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
