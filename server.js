/* ================================
   UserHub Dashboard - Express Server
   ================================ */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize database
require('./database/init');

// Import routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const rolesRoutes = require('./routes/roles');
const analyticsRoutes = require('./routes/analytics');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname)));
app.use('/pages', express.static(path.join(__dirname, 'pages')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);

// Root route - serve login or dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║     UserHub Dashboard Server Running       ║
╠════════════════════════════════════════════╣
║  🌐 URL: http://localhost:${PORT}             ║
║  📁 Static files: Enabled                  ║
║  🔐 Auth: JWT Enabled                      ║
║  💾 Database: SQLite                       ║
╚════════════════════════════════════════════╝
    `);
});
