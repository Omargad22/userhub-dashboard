/* ================================
   API Client Module
   ================================ */

const API_BASE_URL = '/api';

class ApiClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    // Get auth token
    getToken() {
        return localStorage.getItem('authToken');
    }

    // Set auth token
    setToken(token) {
        localStorage.setItem('authToken', token);
    }

    // Remove auth token
    removeToken() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    }

    // Get current user
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    // Set current user
    setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    // Base fetch wrapper
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const token = this.getToken();

        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // Handle 401 - redirect to login
                if (response.status === 401 || response.status === 403) {
                    this.removeToken();
                    if (!window.location.pathname.includes('login')) {
                        window.location.href = '/pages/login.html';
                    }
                }
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // GET request
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST request
    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // PUT request
    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // DELETE request
    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // =====================
    // Auth API
    // =====================

    async login(email, password) {
        const data = await this.post('/auth/login', { email, password });
        if (data.success && data.token) {
            this.setToken(data.token);
            this.setCurrentUser(data.user);
        }
        return data;
    }

    async logout() {
        try {
            await this.post('/auth/logout', {});
        } catch (e) {
            // Ignore errors on logout
        }
        this.removeToken();
        window.location.href = '/pages/login.html';
    }

    async getMe() {
        return this.get('/auth/me');
    }

    async verifyToken() {
        return this.get('/auth/verify');
    }

    // =====================
    // Users API
    // =====================

    async getUsers(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/users${query ? `?${query}` : ''}`);
    }

    async getUser(id) {
        return this.get(`/users/${id}`);
    }

    async createUser(userData) {
        return this.post('/users', userData);
    }

    async updateUser(id, userData) {
        return this.put(`/users/${id}`, userData);
    }

    async deleteUser(id) {
        return this.delete(`/users/${id}`);
    }

    async bulkDeleteUsers(ids) {
        return this.post('/users/bulk-delete', { ids });
    }

    // =====================
    // Roles API
    // =====================

    async getRoles() {
        return this.get('/roles');
    }

    async getRole(id) {
        return this.get(`/roles/${id}`);
    }

    async createRole(roleData) {
        return this.post('/roles', roleData);
    }

    async updateRole(id, roleData) {
        return this.put(`/roles/${id}`, roleData);
    }

    async deleteRole(id) {
        return this.delete(`/roles/${id}`);
    }

    // =====================
    // Analytics API
    // =====================

    async getStats() {
        return this.get('/analytics/stats');
    }

    async getUserGrowth(period = 30) {
        return this.get(`/analytics/user-growth?period=${period}`);
    }

    async getRolesDistribution() {
        return this.get('/analytics/roles-distribution');
    }

    async getStatusDistribution() {
        return this.get('/analytics/status-distribution');
    }

    async getMonthlyTrends() {
        return this.get('/analytics/monthly-trends');
    }

    async getRecentActivity() {
        return this.get('/analytics/recent-activity');
    }

    // =====================
    // Settings API
    // =====================

    async getSettings() {
        return this.get('/settings');
    }

    async getSetting(key) {
        return this.get(`/settings/${key}`);
    }

    async updateSettings(settings) {
        return this.put('/settings', settings);
    }

    async updateSetting(key, value) {
        return this.put(`/settings/${key}`, { value });
    }
}

// Create global instance
const api = new ApiClient();
