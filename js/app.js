/* ================================
   UserHub Dashboard JavaScript
   ================================ */

// Sample Users Data
const usersData = [
    { id: 1, firstName: 'Ahmed', lastName: 'Hassan', email: 'ahmed.hassan@email.com', role: 'Admin', status: 'Active', joined: '2024-01-15', avatar: '#3B82F6' },
    { id: 2, firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@email.com', role: 'Editor', status: 'Active', joined: '2024-02-20', avatar: '#8B5CF6' },
    { id: 3, firstName: 'Mohamed', lastName: 'Ali', email: 'mohamed.ali@email.com', role: 'User', status: 'Pending', joined: '2024-03-10', avatar: '#22C55E' },
    { id: 4, firstName: 'Emily', lastName: 'Davis', email: 'emily.d@email.com', role: 'Editor', status: 'Active', joined: '2024-03-15', avatar: '#F59E0B' },
    { id: 5, firstName: 'Omar', lastName: 'Khalil', email: 'omar.k@email.com', role: 'Admin', status: 'Active', joined: '2024-04-01', avatar: '#EF4444' },
    { id: 6, firstName: 'Fatima', lastName: 'Ahmed', email: 'fatima.a@email.com', role: 'User', status: 'Inactive', joined: '2024-04-12', avatar: '#EC4899' },
    { id: 7, firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com', role: 'User', status: 'Active', joined: '2024-05-05', avatar: '#06B6D4' },
    { id: 8, firstName: 'Mona', lastName: 'Ibrahim', email: 'mona.i@email.com', role: 'Editor', status: 'Pending', joined: '2024-05-20', avatar: '#8B5CF6' },
    { id: 9, firstName: 'David', lastName: 'Wilson', email: 'david.w@email.com', role: 'User', status: 'Active', joined: '2024-06-01', avatar: '#3B82F6' },
    { id: 10, firstName: 'Layla', lastName: 'Mahmoud', email: 'layla.m@email.com', role: 'Admin', status: 'Active', joined: '2024-06-15', avatar: '#22C55E' },
    { id: 11, firstName: 'James', lastName: 'Brown', email: 'james.b@email.com', role: 'User', status: 'Inactive', joined: '2024-07-01', avatar: '#F59E0B' },
    { id: 12, firstName: 'Nour', lastName: 'Saleh', email: 'nour.s@email.com', role: 'Editor', status: 'Active', joined: '2024-07-20', avatar: '#EF4444' },
];

let users = [...usersData];
let currentPage = 1;
const itemsPerPage = 10;
let editingUserId = null;
let deletingUserId = null;

// DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const searchInput = document.getElementById('searchInput');
const roleFilter = document.getElementById('roleFilter');
const statusFilter = document.getElementById('statusFilter');
const usersTableBody = document.getElementById('usersTableBody');
const pagination = document.getElementById('pagination');
const addUserBtn = document.getElementById('addUserBtn');
const userModal = document.getElementById('userModal');
const deleteModal = document.getElementById('deleteModal');
const userForm = document.getElementById('userForm');
const selectAllCheckbox = document.getElementById('selectAll');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderUsers();
    updateStats();
    initCharts();
    setupEventListeners();
});

// Event Listeners Setup
function setupEventListeners() {
    // Sidebar Toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    // Mobile Menu
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            sidebar.classList.remove('mobile-open');
        }
    });

    // Search
    searchInput.addEventListener('input', debounce(() => {
        currentPage = 1;
        renderUsers();
    }, 300));

    // Filters
    roleFilter.addEventListener('change', () => {
        currentPage = 1;
        renderUsers();
    });

    statusFilter.addEventListener('change', () => {
        currentPage = 1;
        renderUsers();
    });

    // Add User Button
    addUserBtn.addEventListener('click', () => {
        openUserModal();
    });

    // Modal Close Buttons
    document.getElementById('closeModal').addEventListener('click', closeUserModal);
    document.getElementById('cancelBtn').addEventListener('click', closeUserModal);
    document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);

    // Modal Overlays
    userModal.querySelector('.modal-overlay').addEventListener('click', closeUserModal);
    deleteModal.querySelector('.modal-overlay').addEventListener('click', closeDeleteModal);

    // Form Submit
    userForm.addEventListener('submit', handleFormSubmit);

    // Confirm Delete
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);

    // Select All
    selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = usersTableBody.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = e.target.checked);
    });
}

// Render Users Table
function renderUsers() {
    const filteredUsers = getFilteredUsers();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    usersTableBody.innerHTML = paginatedUsers.map(user => `
        <tr>
            <td><input type="checkbox" data-id="${user.id}"></td>
            <td>
                <div class="user-cell">
                    <div class="user-table-avatar" style="background: ${user.avatar}">
                        ${user.firstName[0]}${user.lastName[0]}
                    </div>
                    <span class="user-table-name">${user.firstName} ${user.lastName}</span>
                </div>
            </td>
            <td>${user.email}</td>
            <td><span class="role-badge role-${user.role.toLowerCase()}">${user.role}</span></td>
            <td><span class="status-badge status-${user.status.toLowerCase()}">${user.status}</span></td>
            <td>${formatDate(user.joined)}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit" onclick="editUser(${user.id})" title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="action-btn delete" onclick="deleteUser(${user.id})" title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Update table info
    document.getElementById('showingStart').textContent = filteredUsers.length ? startIndex + 1 : 0;
    document.getElementById('showingEnd').textContent = Math.min(endIndex, filteredUsers.length);
    document.getElementById('totalEntries').textContent = filteredUsers.length;

    renderPagination(filteredUsers.length);
}

// Get Filtered Users
function getFilteredUsers() {
    let filtered = [...users];

    const searchTerm = searchInput.value.toLowerCase();
    const roleValue = roleFilter.value;
    const statusValue = statusFilter.value;

    if (searchTerm) {
        filtered = filtered.filter(user =>
            user.firstName.toLowerCase().includes(searchTerm) ||
            user.lastName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
    }

    if (roleValue) {
        filtered = filtered.filter(user => user.role === roleValue);
    }

    if (statusValue) {
        filtered = filtered.filter(user => user.status === statusValue);
    }

    return filtered;
}

// Render Pagination
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    let html = '';

    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">Prev</button>`;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<button disabled>...</button>`;
        }
    }

    html += `<button ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">Next</button>`;

    pagination.innerHTML = html;
}

// Go to Page
function goToPage(page) {
    currentPage = page;
    renderUsers();
}

// Update Stats
function updateStats() {
    document.getElementById('totalUsers').textContent = users.length.toLocaleString();
    document.getElementById('activeUsers').textContent = users.filter(u => u.status === 'Active').length.toLocaleString();
    document.getElementById('pendingUsers').textContent = users.filter(u => u.status === 'Pending').length.toLocaleString();

    // Simulate new users this month
    const newUsersCount = users.filter(u => {
        const joined = new Date(u.joined);
        const now = new Date();
        return joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear();
    }).length || Math.floor(Math.random() * 50) + 10;

    document.getElementById('newUsers').textContent = newUsersCount.toLocaleString();
}

// Open User Modal
function openUserModal(user = null) {
    if (user) {
        document.getElementById('modalTitle').textContent = 'Edit User';
        document.getElementById('firstName').value = user.firstName;
        document.getElementById('lastName').value = user.lastName;
        document.getElementById('email').value = user.email;
        document.getElementById('role').value = user.role;
        document.getElementById('status').value = user.status;
        document.getElementById('userId').value = user.id;
        editingUserId = user.id;
    } else {
        document.getElementById('modalTitle').textContent = 'Add New User';
        userForm.reset();
        editingUserId = null;
    }

    userModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close User Modal
function closeUserModal() {
    userModal.classList.remove('active');
    document.body.style.overflow = '';
    userForm.reset();
    editingUserId = null;
}

// Handle Form Submit
function handleFormSubmit(e) {
    e.preventDefault();

    const userData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value,
        status: document.getElementById('status').value,
    };

    if (editingUserId) {
        // Update existing user
        const index = users.findIndex(u => u.id === editingUserId);
        if (index !== -1) {
            users[index] = { ...users[index], ...userData };
            showNotification('User updated successfully!', 'success');
        }
    } else {
        // Add new user
        const newUser = {
            id: Date.now(),
            ...userData,
            joined: new Date().toISOString().split('T')[0],
            avatar: getRandomColor()
        };
        users.unshift(newUser);
        showNotification('User added successfully!', 'success');
    }

    closeUserModal();
    renderUsers();
    updateStats();
}

// Edit User
function editUser(id) {
    const user = users.find(u => u.id === id);
    if (user) {
        openUserModal(user);
    }
}

// Delete User
function deleteUser(id) {
    const user = users.find(u => u.id === id);
    if (user) {
        deletingUserId = id;
        document.getElementById('deleteUserName').textContent = `${user.firstName} ${user.lastName}`;
        deleteModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close Delete Modal
function closeDeleteModal() {
    deleteModal.classList.remove('active');
    document.body.style.overflow = '';
    deletingUserId = null;
}

// Confirm Delete
function confirmDelete() {
    if (deletingUserId) {
        users = users.filter(u => u.id !== deletingUserId);
        showNotification('User deleted successfully!', 'success');
        closeDeleteModal();
        renderUsers();
        updateStats();
    }
}

// Initialize Charts
function initCharts() {
    // User Growth Chart
    const growthCtx = document.getElementById('userGrowthChart');
    if (growthCtx) {
        new Chart(growthCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'New Users',
                    data: [120, 190, 170, 220, 280, 250, 310, 340, 380, 420, 460, 520],
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        },
                        ticks: {
                            color: '#94A3B8'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        },
                        ticks: {
                            color: '#94A3B8'
                        }
                    }
                }
            }
        });
    }

    // User Roles Chart
    const rolesCtx = document.getElementById('userRolesChart');
    if (rolesCtx) {
        const adminCount = users.filter(u => u.role === 'Admin').length;
        const editorCount = users.filter(u => u.role === 'Editor').length;
        const userCount = users.filter(u => u.role === 'User').length;

        new Chart(rolesCtx, {
            type: 'doughnut',
            data: {
                labels: ['Admin', 'Editor', 'User'],
                datasets: [{
                    data: [adminCount, editorCount, userCount],
                    backgroundColor: ['#8B5CF6', '#3B82F6', '#64748B'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94A3B8',
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                }
            }
        });
    }
}

// Utility Functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function getRandomColor() {
    const colors = ['#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    const colors = {
        success: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
        error: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
    };

    notification.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 16px 24px;
        background: ${colors[type]};
        color: white;
        border-radius: 12px;
        font-weight: 500;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
