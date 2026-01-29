/* ================================
   Authentication Module
   ================================ */

class Auth {
    constructor() {
        this.api = api; // Use global api instance
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('currentUser');
        return !!(token && user);
    }

    // Get current user
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    // Check auth and redirect if not authenticated
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/pages/login.html';
            return false;
        }
        return true;
    }

    // Redirect if already authenticated
    redirectIfAuthenticated() {
        if (this.isAuthenticated()) {
            window.location.href = '/index.html';
            return true;
        }
        return false;
    }

    // Login
    async login(email, password) {
        try {
            const response = await this.api.login(email, password);
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Logout
    async logout() {
        await this.api.logout();
    }

    // Verify token is still valid
    async verifyToken() {
        try {
            const response = await this.api.verifyToken();
            return response.valid;
        } catch {
            return false;
        }
    }

    // Update user info display
    updateUserDisplay() {
        const user = this.getCurrentUser();
        if (!user) return;

        // Update sidebar user info
        const userNameEl = document.querySelector('.user-name');
        const userRoleEl = document.querySelector('.user-role');
        const userAvatarEl = document.querySelector('.user-avatar');

        if (userNameEl) userNameEl.textContent = `${user.firstName} ${user.lastName}`;
        if (userRoleEl) userRoleEl.textContent = user.role;
        if (userAvatarEl) {
            userAvatarEl.textContent = `${user.firstName[0]}${user.lastName[0]}`;
            if (user.avatar) {
                userAvatarEl.style.background = user.avatar;
            }
        }
    }

    // Initialize auth (run on every page load)
    async init() {
        // Skip for login page
        if (window.location.pathname.includes('login')) {
            this.redirectIfAuthenticated();
            return;
        }

        // Check authentication
        if (!this.requireAuth()) return;

        // Verify token is still valid
        const isValid = await this.verifyToken();
        if (!isValid) {
            this.api.removeToken();
            window.location.href = '/pages/login.html';
            return;
        }

        // Update user display
        this.updateUserDisplay();
    }
}

// Create global instance
const auth = new Auth();
