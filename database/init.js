/* ================================
   Database Initialization - JSON File Storage
   ================================ */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'userhub.json');

// Database structure
let data = {
    users: [],
    roles: [],
    settings: [],
    sessions: []
};

// Load or initialize database
function loadDatabase() {
    try {
        if (fs.existsSync(DB_PATH)) {
            const content = fs.readFileSync(DB_PATH, 'utf8');
            data = JSON.parse(content);
        } else {
            initializeDatabase();
        }
    } catch (error) {
        console.error('Error loading database:', error);
        initializeDatabase();
    }
}

// Save database
function saveDatabase() {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Initialize with default data
function initializeDatabase() {
    const now = new Date().toISOString().split('T')[0];
    const hashedPassword = bcrypt.hashSync('admin123', 10);

    // Default admin and sample users
    data.users = [
        { id: 1, firstName: 'Omar', lastName: 'Gad', email: 'admin@userhub.com', password: hashedPassword, role: 'Admin', status: 'Active', joined: now, avatar: '#8B5CF6' },
        { id: 2, firstName: 'Ahmed', lastName: 'Hassan', email: 'ahmed.hassan@email.com', role: 'Admin', status: 'Active', joined: '2025-08-15', avatar: '#3B82F6' },
        { id: 3, firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@email.com', role: 'Editor', status: 'Active', joined: '2025-09-20', avatar: '#8B5CF6' },
        { id: 4, firstName: 'Mohamed', lastName: 'Ali', email: 'mohamed.ali@email.com', role: 'User', status: 'Pending', joined: '2025-10-05', avatar: '#22C55E' },
        { id: 5, firstName: 'Emily', lastName: 'Davis', email: 'emily.d@email.com', role: 'Editor', status: 'Active', joined: '2025-07-12', avatar: '#F59E0B' },
        { id: 6, firstName: 'Omar', lastName: 'Khalil', email: 'omar.k@email.com', role: 'Admin', status: 'Active', joined: '2025-06-30', avatar: '#EF4444' },
        { id: 7, firstName: 'Fatima', lastName: 'Ahmed', email: 'fatima.a@email.com', role: 'User', status: 'Inactive', joined: '2025-11-18', avatar: '#EC4899' },
        { id: 8, firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com', role: 'User', status: 'Active', joined: '2025-05-25', avatar: '#06B6D4' },
        { id: 9, firstName: 'Mona', lastName: 'Ibrahim', email: 'mona.i@email.com', role: 'Editor', status: 'Pending', joined: '2025-12-01', avatar: '#8B5CF6' },
        { id: 10, firstName: 'David', lastName: 'Wilson', email: 'david.w@email.com', role: 'User', status: 'Active', joined: '2025-04-10', avatar: '#3B82F6' },
        { id: 11, firstName: 'Layla', lastName: 'Mahmoud', email: 'layla.m@email.com', role: 'Admin', status: 'Active', joined: '2025-03-22', avatar: '#22C55E' },
        { id: 12, firstName: 'James', lastName: 'Brown', email: 'james.b@email.com', role: 'User', status: 'Inactive', joined: '2025-02-14', avatar: '#F59E0B' },
        { id: 13, firstName: 'Nour', lastName: 'Saleh', email: 'nour.s@email.com', role: 'Editor', status: 'Active', joined: '2026-01-05', avatar: '#EF4444' },
    ];

    // Default roles
    const roleNow = new Date().toISOString();
    data.roles = [
        { id: 1, name: 'Admin', description: 'Full system access with all permissions', permissions: ['all'], color: '#8B5CF6', createdAt: roleNow },
        { id: 2, name: 'Editor', description: 'Can create and edit content', permissions: ['read', 'write', 'edit'], color: '#3B82F6', createdAt: roleNow },
        { id: 3, name: 'User', description: 'Basic access to view content', permissions: ['read'], color: '#64748B', createdAt: roleNow },
    ];

    // Default settings
    data.settings = [
        { key: 'appName', value: 'UserHub Dashboard' },
        { key: 'language', value: 'en' },
        { key: 'theme', value: 'light' },
        { key: 'emailNotifications', value: 'true' },
        { key: 'twoFactorAuth', value: 'false' },
        { key: 'sessionTimeout', value: '30' },
        { key: 'timezone', value: 'UTC' },
    ];

    data.sessions = [];

    saveDatabase();
    console.log('✅ Database initialized with default data');
}

// Load database on module load
loadDatabase();

// Database API (mimics SQLite API structure)
const db = {
    // Get all data
    getData: () => data,

    // Users
    getUsers: () => data.users,
    getUserById: (id) => data.users.find(u => u.id === id),
    getUserByEmail: (email) => data.users.find(u => u.email === email),
    createUser: (user) => {
        const id = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
        const newUser = { id, ...user };
        data.users.push(newUser);
        saveDatabase();
        return newUser;
    },
    updateUser: (id, updates) => {
        const index = data.users.findIndex(u => u.id === id);
        if (index !== -1) {
            data.users[index] = { ...data.users[index], ...updates };
            saveDatabase();
            return data.users[index];
        }
        return null;
    },
    deleteUser: (id) => {
        const index = data.users.findIndex(u => u.id === id);
        if (index !== -1) {
            data.users.splice(index, 1);
            saveDatabase();
            return true;
        }
        return false;
    },

    // Roles
    getRoles: () => data.roles,
    getRoleById: (id) => data.roles.find(r => r.id === id),
    getRoleByName: (name) => data.roles.find(r => r.name === name),
    createRole: (role) => {
        const id = data.roles.length > 0 ? Math.max(...data.roles.map(r => r.id)) + 1 : 1;
        const newRole = { id, ...role };
        data.roles.push(newRole);
        saveDatabase();
        return newRole;
    },
    updateRole: (id, updates) => {
        const index = data.roles.findIndex(r => r.id === id);
        if (index !== -1) {
            data.roles[index] = { ...data.roles[index], ...updates };
            saveDatabase();
            return data.roles[index];
        }
        return null;
    },
    deleteRole: (id) => {
        const index = data.roles.findIndex(r => r.id === id);
        if (index !== -1) {
            data.roles.splice(index, 1);
            saveDatabase();
            return true;
        }
        return false;
    },

    // Settings
    getSettings: () => data.settings,
    getSetting: (key) => data.settings.find(s => s.key === key),
    setSetting: (key, value) => {
        const index = data.settings.findIndex(s => s.key === key);
        if (index !== -1) {
            data.settings[index].value = value;
        } else {
            data.settings.push({ key, value });
        }
        saveDatabase();
    },

    // Sessions
    createSession: (session) => {
        const id = data.sessions.length > 0 ? Math.max(...data.sessions.map(s => s.id)) + 1 : 1;
        const newSession = { id, ...session };
        data.sessions.push(newSession);
        saveDatabase();
        return newSession;
    },
    getSessionByToken: (token) => data.sessions.find(s => s.token === token),
    deleteSession: (token) => {
        const index = data.sessions.findIndex(s => s.token === token);
        if (index !== -1) {
            data.sessions.splice(index, 1);
            saveDatabase();
            return true;
        }
        return false;
    },
    deleteUserSessions: (userId) => {
        data.sessions = data.sessions.filter(s => s.userId !== userId);
        saveDatabase();
    },

    // Count users by role
    countUsersByRole: (roleName) => data.users.filter(u => u.role === roleName).length,

    // Update users role name
    updateUsersRole: (oldName, newName) => {
        data.users.forEach(u => {
            if (u.role === oldName) u.role = newName;
        });
        saveDatabase();
    },
};

module.exports = db;
