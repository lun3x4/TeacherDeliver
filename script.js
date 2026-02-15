/**
 * STATE MANAGEMENT
 */
const state = {
    currentUser: null, // { email, firstName, lastName, role }
    orders: [], // Array of order objects
    menu: [
        { id: '1', category: 'starter', name: 'Tomato Soup', price: 3.50, visible: true },
        { id: '2', category: 'starter', name: 'Goat Cheese Salad', price: 4.50, visible: true },
        { id: '3', category: 'main', name: 'Grilled Chicken', price: 8.90, visible: true },
        { id: '4', category: 'main', name: 'Vegetable Lasagna', price: 8.00, visible: true, tags: ['veg'] },
        { id: '5', category: 'dessert', name: 'Apple Pie', price: 3.00, visible: true },
        { id: '6', category: 'dessert', name: 'Fruit Salad', price: 2.50, visible: true, tags: ['vegan'] }
    ]
};

/**
 * INITIALIZATION
 */
document.addEventListener('DOMContentLoaded', () => {
    initTime();
    setupNavigation();
    setupForms();
    checkSession();
});

// Business Rules: Time
function initTime() {
    const now = new Date();
    // 0 = Sunday, 6 = Saturday
    const day = now.getDay();
    const isWeekend = (day === 0 || day === 6);
    
    // Status Strip Update
    const statusStrip = document.getElementById('status-strip');
    const resetTime = new Date();
    resetTime.setHours(24, 0, 0, 0); // Next midnight
    
    let statusHTML = isWeekend 
        ? `<span style="color:red">● Closed</span> (Returns Monday)`
        : `<span style="color:green">● Open</span>`;
    
    statusStrip.innerHTML = `${statusHTML} &nbsp;|&nbsp; Next reset: 00:00 CET`;

    // Order Page Logic
    const banner = document.getElementById('weekend-banner');
    const form = document.getElementById('order-form');
    
    if (isWeekend) {
        banner.classList.remove('hidden');
        const elements = form.elements;
        for (let i = 0; i < elements.length; i++) {
            elements[i].disabled = true;
        }
    } else {
        renderMenu();
    }
}

/**
 * NAVIGATION & AUTH
 */
function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            if (target) navigateTo(target);
        });
    });

    document.getElementById('nav-logout').addEventListener('click', logout);
}

function navigateTo(pageId) {
    // Auth Guards
    if ((pageId === 'order' || pageId === 'management') && !state.currentUser) {
        navigateTo('signin');
        return;
    }
    if (pageId === 'management' && state.currentUser?.role !== 'admin') {
        showToast('Access Denied: Admins only');
        return;
    }

    // UI Switching
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.nav-btn[data-target="${pageId}"]`);
    if(activeBtn) activeBtn.classList.add('active');

    if(pageId === 'management') renderAdminOrders();
}

function checkSession() {
    const stored = localStorage.getItem('teacher_user');
    if (stored) {
        state.currentUser = JSON.parse(stored);
        updateAuthUI();
        // Prefill Name
        document.getElementById('order-fname').value = state.currentUser.firstName;
        document.getElementById('order-lname').value = state.currentUser.lastName;
    }
}

function updateAuthUI() {
    if (state.currentUser) {
        document.getElementById('nav-signin').classList.add('hidden');
        document.getElementById('nav-logout').classList.remove('hidden');
        if (state.currentUser.role === 'admin') {
            document.getElementById('nav-admin').classList.remove('hidden');
        }
    } else {
        document.getElementById('nav-signin').classList.remove('hidden');
        document.getElementById('nav-logout').classList.add('hidden');
        document.getElementById('nav-admin').classList.add('hidden');
    }
}

function logout() {
    state.currentUser = null;
    localStorage.removeItem('teacher_user');
    updateAuthUI();
    navigateTo('home');
    showToast('Signed out');
}

/**
 * FORMS & LOGIC
 */
function setupForms() {
    // Login
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const isAdmin = email.startsWith('admin'); // Mock Admin Check
        
        state.currentUser = {
            email: email,
            firstName: 'Alice', // Mock data
            lastName: isAdmin ? 'Admin' : 'Teacher',
            role: isAdmin ? 'admin' : 'user'
        };

        if(document.getElementById('remember-me').checked) {
            localStorage.setItem('teacher_user', JSON.stringify(state.currentUser));
        }

        updateAuthUI();
        navigateTo(isAdmin ? 'management' : 'order');
        showToast(`Welcome, ${state.currentUser.firstName}`);
    });

    // Contact
    document.getElementById('contact-form').addEventListener('submit', (e) => {
        e.preventDefault();
        // Here you would fetch POST /api/contact
        document.getElementById('contact-form-view').classList.add('hidden');
        document.getElementById('contact-success-view').classList.remove('hidden');
    });

    document.getElementById('contact-return-home').addEventListener('click', () => {
        document.getElementById('contact-form').reset();
        document.getElementById('contact-form-view').classList.remove('hidden');
        document.getElementById('contact-success-view').classList.add('hidden');
        navigateTo('home');
    });

    // Order Logic
    document.getElementById('menu-container').addEventListener('input', calculateTotal);
    document.getElementById('order-form').addEventListener('submit', saveOrder);
    document.getElementById('cancel-order-btn').addEventListener('click', () => {
        if(confirm('Delete today\'s order?')) {
            document.getElementById('order-form').reset();
            calculateTotal();
            showToast('Order cancelled');
        }
    });
}

function renderMenu() {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';
    
    // Group by category
    ['starter', 'main', 'dessert'].forEach(cat => {
        const items = state.menu.filter(i => i.category === cat);
        if(items.length === 0) return;

        const section = document.createElement('div');
        section.className = 'card';
        section.innerHTML = `<h3>${cat.charAt(0).toUpperCase() + cat.slice(1)}s</h3>`;

        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'menu-item';
            div.innerHTML = `
                <div class="item-info">
                    <strong>${item.name}</strong>
                    ${item.tags ? `<small>(${item.tags.join(', ')})</small>` : ''}
                </div>
                <div class="item-controls">
                    <span class="item-price">€${item.price.toFixed(2)}</span>
                    <input type="number" min="0" max="5" value="0" 
                        class="qty-input" data-price="${item.price}" data-id="${item.id}">
                </div>
            `;
            section.appendChild(div);
        });
        container.appendChild(section);
    });
}

function calculateTotal() {
    let count = 0;
    let price = 0;
    document.querySelectorAll('.qty-input').forEach(input => {
        const qty = parseInt(input.value) || 0;
        const p = parseFloat(input.dataset.price);
        count += qty;
        price += (qty * p);
    });
    
    document.getElementById('total-count').innerText = count;
    document.getElementById('total-price').innerText = price.toFixed(2);
}

function saveOrder(e) {
    e.preventDefault();
    // Validation: Require at least 1 main usually, but simplistic for now
    const total = parseInt(document.getElementById('total-count').innerText);
    if(total === 0) {
        alert('Please select at least one item.');
        return;
    }

    // Mock Save to "DB"
    const order = {
        user: state.currentUser.firstName + ' ' + state.currentUser.lastName,
        summary: `${total} items`,
        extras: Array.from(document.querySelectorAll('input[name="extra"]:checked')).map(c => c.value).join(', '),
        status: 'placed'
    };
    state.orders.push(order);
    
    showToast('Order saved successfully');
    // Scroll to top or show summary
}

/**
 * ADMIN
 */
function renderAdminOrders() {
    const tbody = document.getElementById('orders-table-body');
    tbody.innerHTML = '';

    // Mock data if empty
    const displayOrders = state.orders.length ? state.orders : [
        { user: 'John Doe', summary: '1x Main, 1x Starter', extras: 'Cutlery', status: 'placed' },
        { user: 'Jane Smith', summary: '1x Main', extras: 'Napkin', status: 'modified' }
    ];

    displayOrders.forEach(o => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${o.user}</td>
            <td>${o.summary}</td>
            <td>${o.extras}</td>
            <td>${o.status}</td>
            <td><button class="btn-secondary" style="padding:4px 8px; font-size:12px">Edit</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 3000);
}

// --- Settings Popover Logic (Fixed) ---
document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsPopover = document.getElementById('settings-popover');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Only run if the elements actually exist on the page
    if (settingsBtn && settingsPopover) {
        
        // 1. Toggle visibility
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            settingsPopover.classList.toggle('hidden');
        });

        // 2. Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!settingsPopover.contains(e.target) && e.target !== settingsBtn) {
                settingsPopover.classList.add('hidden');
            }
        });

        // 3. Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') settingsPopover.classList.add('hidden');
        });
    }

    // 4. Dark Mode Toggle
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        });

        // Persistence: Load Dark Mode on start
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        }
    }
});