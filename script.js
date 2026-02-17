/**
 * STATE MANAGEMENT
 */
const state = {
    currentUser: null,
    orders: [],
    menu: [
        { id: '1', category: 'starter', name: 'Soupe de Tomates', price: 3.50, visible: true, tags: [], limit: 0 },
        { id: '2', category: 'starter', name: 'Salade Chèvre Chaud', price: 4.50, visible: true, tags: [], limit: 0 },
        { id: '3', category: 'main', name: 'Poulet Grillé', price: 8.90, visible: true, tags: [], limit: 0 },
        { id: '4', category: 'main', name: 'Lasagnes Végétales', price: 8.00, visible: true, tags: ['veg'], limit: 0 },
        { id: '5', category: 'dessert', name: 'Tarte aux Pommes', price: 3.00, visible: true, tags: [], limit: 0 },
        { id: '6', category: 'dessert', name: 'Salade de Fruits', price: 2.50, visible: true, tags: ['vegan'], limit: 0 }
    ],
    lang: 'fr',
    nextItemId: 7
};

const i18n = {
    fr: {
        welcome: 'Bon retour !', welcomeSub: 'Nous sommes heureux de vous revoir.',
        createAccount: 'Créer un compte', createSub: 'Rejoignez TeacherMeals.',
        emailLabel: 'Adresse e-mail', passwordLabel: 'Mot de passe',
        confirmPasswordLabel: 'Confirmer le mot de passe',
        firstNameLabel: 'Prénom', lastNameLabel: 'Nom',
        signinBtn: 'Se connecter', registerBtn: "S'inscrire",
        newHere: 'Nouveau ici ?', alreadyAccount: 'Déjà un compte ?',
        createLink: 'Créer un compte', signinLink: 'Se connecter',
        forgotPwd: 'Mot de passe oublié ?', rememberMe: 'Se souvenir de moi',
        langLabel: 'Langue : FR'
    },
    en: {
        welcome: 'Welcome back!', welcomeSub: "We're so excited to see you again!",
        createAccount: 'Create an account', createSub: 'Join TeacherMeals today.',
        emailLabel: 'Email address', passwordLabel: 'Password',
        confirmPasswordLabel: 'Confirm password',
        firstNameLabel: 'First name', lastNameLabel: 'Last name',
        signinBtn: 'Sign In', registerBtn: 'Register',
        newHere: 'New here?', alreadyAccount: 'Already have an account?',
        createLink: 'Create an account', signinLink: 'Sign In',
        forgotPwd: 'Forgot your password?', rememberMe: 'Remember me',
        langLabel: 'Language: EN'
    }
};

let isLoginMode = true;

document.addEventListener('DOMContentLoaded', () => {
    // Password Toggle
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('auth-password');
    const eyeIcon = document.getElementById('eye-icon');
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            eyeIcon.style.stroke = isPassword ? 'var(--danger-color)' : 'currentColor';
        });
    }

    // Auth Mode Switching
    const switchBtn = document.getElementById('switch-auth-mode');
    if (switchBtn) {
        switchBtn.addEventListener('click', (e) => { e.preventDefault(); isLoginMode = !isLoginMode; applyAuthMode(); });
    }

    // Settings FAB
    const fab = document.getElementById('settings-fab');
    const popover = document.getElementById('settings-popover');
    fab.addEventListener('click', (e) => { e.stopPropagation(); popover.classList.toggle('show'); });
    document.addEventListener('click', (e) => {
        if (!popover.contains(e.target) && e.target !== fab) popover.classList.remove('show');
    });

    // Dark Mode
    const darkToggle = document.getElementById('dark-mode-toggle');
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        if (darkToggle) darkToggle.checked = true;
    }
    if (darkToggle) {
        darkToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode', darkToggle.checked);
            localStorage.setItem('theme', darkToggle.checked ? 'dark' : 'light');
        });
    }

    // Language
    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            setLanguage(opt.dataset.lang);
            document.querySelectorAll('.lang-option').forEach(o => o.classList.remove('active-lang'));
            opt.classList.add('active-lang');
        });
    });
    const savedLang = localStorage.getItem('lang') || 'fr';
    setLanguage(savedLang);
    document.querySelectorAll('.lang-option').forEach(o => o.classList.toggle('active-lang', o.dataset.lang === savedLang));

    // Page links
    document.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => { e.preventDefault(); if (link.dataset.target) navigateTo(link.dataset.target); });
    });
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.target || 'home'));
    });

    // Admin tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab)?.classList.add('active');
            if (tab.dataset.tab === 'menu-tab') renderAdminMenuList();
        });
    });

    // Export
    document.getElementById('export-csv-btn')?.addEventListener('click', exportCSV);
    document.getElementById('admin-search')?.addEventListener('input', renderAdminOrders);
    document.getElementById('admin-status-filter')?.addEventListener('change', renderAdminOrders);

    // Payment flow
    document.getElementById('back-to-order')?.addEventListener('click', () => {
        document.getElementById('payment-view').classList.add('hidden');
        document.getElementById('order-form-container').classList.remove('hidden');
    });
    document.querySelectorAll('.payment-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            const cardFields = document.getElementById('card-fields');
            if (cardFields) cardFields.style.display = opt.dataset.method === 'card' ? 'block' : 'none';
        });
    });
    document.getElementById('confirm-payment-btn')?.addEventListener('click', confirmPayment);
    document.getElementById('success-home-btn')?.addEventListener('click', () => {
        document.getElementById('payment-success-view').classList.add('hidden');
        document.getElementById('order-form-container').classList.remove('hidden');
        document.getElementById('order-form').reset();
        renderMenu();
        navigateTo('home');
    });

    // Card formatting
    document.getElementById('card-number')?.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').substring(0, 16);
        e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
    });
    document.getElementById('card-expiry')?.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (v.length >= 3) v = v.substring(0, 2) + '/' + v.substring(2);
        e.target.value = v;
    });

    // Menu admin form
    document.getElementById('menu-admin-form')?.addEventListener('submit', handleMenuFormSubmit);
    document.getElementById('menu-cancel-edit-btn')?.addEventListener('click', resetMenuForm);

    initTime();
    setupNavigation();
    setupForms();
    checkSession();
});

/* ---- LANGUAGE ---- */
function setLanguage(lang) {
    if (!i18n[lang]) return;
    state.lang = lang;
    localStorage.setItem('lang', lang);
    const langLabel = document.getElementById('lang-label');
    if (langLabel) langLabel.textContent = i18n[lang].langLabel;
    applyAuthMode();
}

function applyAuthMode() {
    const t = i18n[state.lang];
    const $ = id => document.getElementById(id);
    const authTitle = $('auth-title');
    const authSubtitle = document.querySelector('.auth-subtitle');
    const submitBtn = $('auth-submit-btn');
    const switchText = $('auth-switch-text');
    const switchBtn = $('switch-auth-mode');
    const registerFields = $('register-fields');
    const confirmGroup = $('confirm-password-group');
    const rememberGroup = $('remember-me-group');

    if (isLoginMode) {
        if (authTitle) authTitle.textContent = t.welcome;
        if (authSubtitle) authSubtitle.textContent = t.welcomeSub;
        if (submitBtn) submitBtn.textContent = t.signinBtn;
        if (switchText) switchText.textContent = t.newHere;
        if (switchBtn) switchBtn.textContent = t.createLink;
        registerFields?.classList.add('hidden');
        confirmGroup?.classList.add('hidden');
        rememberGroup?.classList.remove('hidden');
    } else {
        if (authTitle) authTitle.textContent = t.createAccount;
        if (authSubtitle) authSubtitle.textContent = t.createSub;
        if (submitBtn) submitBtn.textContent = t.registerBtn;
        if (switchText) switchText.textContent = t.alreadyAccount;
        if (switchBtn) switchBtn.textContent = t.signinLink;
        registerFields?.classList.remove('hidden');
        confirmGroup?.classList.remove('hidden');
        rememberGroup?.classList.add('hidden');
    }
    const el = (sel) => document.querySelector(sel);
    const emailLabel = el('label[for="auth-email"]');
    const pwdLabel = el('.label-row label[for="auth-password"]');
    const forgotBtn = el('.forgot-link');
    const confirmLabel = el('label[for="auth-confirm-password"]');
    const fnLabel = el('label[for="reg-fname"]');
    const lnLabel = el('label[for="reg-lname"]');
    if (emailLabel) emailLabel.textContent = t.emailLabel;
    if (pwdLabel) pwdLabel.textContent = t.passwordLabel;
    if (forgotBtn) forgotBtn.textContent = t.forgotPwd;
    if (confirmLabel) confirmLabel.textContent = t.confirmPasswordLabel;
    if (fnLabel) fnLabel.textContent = t.firstNameLabel;
    if (lnLabel) lnLabel.textContent = t.lastNameLabel;

    const rememberLbl = el('#remember-me-group .checkbox-label');
    if (rememberLbl) {
        const tn = Array.from(rememberLbl.childNodes).find(n => n.nodeType === 3 && n.textContent.trim());
        if (tn) tn.textContent = ' ' + t.rememberMe;
    }
}

/* ---- TIME ---- */
function initTime() {
    const now = new Date();
    const day = now.getDay();
    const isWeekend = (day === 0 || day === 6);
    const statusStrip = document.getElementById('status-strip');
    const statusHTML = isWeekend
        ? `<span style="color:var(--danger-color)">● Fermé</span> (Retour lundi)`
        : `<span style="color:#34c759">● Ouvert</span>`;
    if (statusStrip) statusStrip.innerHTML = `${statusHTML} &nbsp;|&nbsp; Prochain reset : 00:00 CET`;
    const banner = document.getElementById('weekend-banner');
    const form = document.getElementById('order-form');
    if (isWeekend && form) {
        banner?.classList.remove('hidden');
        Array.from(form.elements).forEach(el => el.disabled = true);
    } else {
        renderMenu();
    }
}

/* ---- NAVIGATION ---- */
function setupNavigation() {
    document.querySelectorAll('.nav-btn, .setting-btn').forEach(btn => {
        btn.addEventListener('click', () => { if (btn.dataset.target) navigateTo(btn.dataset.target); });
    });
    document.getElementById('settings-logout')?.addEventListener('click', logout);
    document.getElementById('nav-logout')?.addEventListener('click', logout);
}

function navigateTo(pageId) {
    if ((pageId === 'order' || pageId === 'management') && !state.currentUser) {
        navigateTo('signin');
        showToast('Veuillez vous connecter d\'abord');
        return;
    }
    if (pageId === 'management' && state.currentUser?.role !== 'admin') {
        showToast('Accès refusé : réservé aux admins');
        return;
    }
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId)?.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-btn[data-target="${pageId}"]`)?.classList.add('active');
    document.getElementById('settings-popover')?.classList.remove('show');
    if (pageId === 'management') { renderAdminOrders(); renderAdminMenuList(); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function checkSession() {
    const stored = localStorage.getItem('teacher_user');
    if (stored) { state.currentUser = JSON.parse(stored); updateAuthUI(); prefillNameFields(); }
}
function prefillNameFields() {
    if (state.currentUser) {
        const f = document.getElementById('order-fname');
        const l = document.getElementById('order-lname');
        if (f) f.value = state.currentUser.firstName;
        if (l) l.value = state.currentUser.lastName;
    }
}
function updateAuthUI() {
    const navSignin = document.getElementById('nav-signin');
    const navLogout = document.getElementById('nav-logout');
    const setSignin = document.getElementById('settings-signin');
    const setLogout = document.getElementById('settings-logout');
    const navAdmin = document.getElementById('nav-admin');
    if (state.currentUser) {
        navSignin?.classList.add('hidden'); navLogout?.classList.remove('hidden');
        setSignin?.classList.add('hidden'); setLogout?.classList.remove('hidden');
        if (state.currentUser.role === 'admin') navAdmin?.classList.remove('hidden');
    } else {
        navSignin?.classList.remove('hidden'); navLogout?.classList.add('hidden');
        setSignin?.classList.remove('hidden'); setLogout?.classList.add('hidden');
        navAdmin?.classList.add('hidden');
    }
}
function logout() {
    state.currentUser = null;
    localStorage.removeItem('teacher_user');
    updateAuthUI();
    navigateTo('home');
    showToast('Déconnecté');
}

/* ---- FORMS ---- */
function setupForms() {
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!isLoginMode) {
                const fName = document.getElementById('reg-fname').value.trim();
                const lName = document.getElementById('reg-lname').value.trim();
                const email = document.getElementById('auth-email').value.trim();
                const pass = document.getElementById('auth-password').value;
                const conf = document.getElementById('auth-confirm-password').value;
                if (pass !== conf) { showToast('Les mots de passe ne correspondent pas !'); return; }
                state.currentUser = { email, firstName: fName, lastName: lName, role: email.startsWith('admin') ? 'admin' : 'user' };
                showToast('Compte créé ! Connexion en cours…');
            } else {
                const email = document.getElementById('auth-email').value.trim();
                const isAdmin = email.startsWith('admin');
                const savedFName = localStorage.getItem('userFirstName') || 'Professeur';
                const savedLName = localStorage.getItem('userLastName') || (isAdmin ? 'Admin' : 'User');
                state.currentUser = { email, firstName: savedFName, lastName: savedLName, role: isAdmin ? 'admin' : 'user' };
                showToast(`Bienvenue, ${state.currentUser.firstName} !`);
            }
            if (document.getElementById('remember-me')?.checked || !isLoginMode) {
                localStorage.setItem('teacher_user', JSON.stringify(state.currentUser));
                localStorage.setItem('userFirstName', state.currentUser.firstName);
                localStorage.setItem('userLastName', state.currentUser.lastName);
            }
            updateAuthUI(); prefillNameFields();
            navigateTo(state.currentUser.role === 'admin' ? 'management' : 'order');
        });
    }

    document.getElementById('contact-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        document.getElementById('contact-form-view').classList.add('hidden');
        document.getElementById('contact-success-view').classList.remove('hidden');
    });
    document.getElementById('contact-return-home')?.addEventListener('click', () => {
        document.getElementById('contact-form').reset();
        document.getElementById('contact-form-view').classList.remove('hidden');
        document.getElementById('contact-success-view').classList.add('hidden');
        navigateTo('home');
    });

    document.getElementById('order-form')?.addEventListener('submit', goToPayment);
    document.getElementById('cancel-order-btn')?.addEventListener('click', () => {
        if (confirm('Annuler la commande du jour ?')) {
            document.getElementById('order-form').reset();
            renderMenu();
            showToast('Commande annulée');
        }
    });
}

/* ---- MENU RENDERING (order page) ---- */
function renderMenu() {
    const container = document.getElementById('menu-container');
    if (!container) return;
    container.innerHTML = '';
    const catLabels = { starter: 'Entrées', main: 'Plats principaux', dessert: 'Desserts' };
    const catIcons = { starter: '🥗', main: '🍽️', dessert: '🍰' };

    ['starter', 'main', 'dessert'].forEach(cat => {
        const items = state.menu.filter(i => i.category === cat && i.visible);
        if (!items.length) return;
        const section = document.createElement('div');
        section.className = 'card menu-section';
        section.innerHTML = `<div class="menu-section-header"><span class="menu-section-icon">${catIcons[cat]}</span><h3>${catLabels[cat]}</h3></div>`;

        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'menu-item-row';
            const tagHTML = item.tags?.length
                ? item.tags.map(t => `<span class="menu-tag menu-tag-${t}">${tagLabel(t)}</span>`).join('') : '';
            const limitHTML = item.limit > 0 ? `<span class="menu-limit">⚡ ${item.limit} restants</span>` : '';

            div.innerHTML = `
                <div class="menu-item-info">
                    <div class="menu-item-name">${item.name}</div>
                    <div class="menu-item-tags">${tagHTML}${limitHTML}</div>
                </div>
                <div class="menu-item-right">
                    <span class="menu-item-price">€${item.price.toFixed(2)}</span>
                    <div class="qty-stepper" data-id="${item.id}">
                        <button type="button" class="qty-btn qty-minus" aria-label="Diminuer">−</button>
                        <span class="qty-display">0</span>
                        <button type="button" class="qty-btn qty-plus" aria-label="Augmenter">+</button>
                    </div>
                </div>
            `;
            section.appendChild(div);

            const stepper = div.querySelector('.qty-stepper');
            const display = stepper.querySelector('.qty-display');
            div.querySelector('.qty-plus').addEventListener('click', () => {
                const max = item.limit > 0 ? item.limit : 10;
                const cur = parseInt(display.textContent);
                if (cur < max) { display.textContent = cur + 1; stepper.classList.add('has-qty'); calculateTotal(); }
            });
            div.querySelector('.qty-minus').addEventListener('click', () => {
                const cur = parseInt(display.textContent);
                if (cur > 0) {
                    display.textContent = cur - 1;
                    stepper.classList.toggle('has-qty', cur - 1 > 0);
                    calculateTotal();
                }
            });
        });
        container.appendChild(section);
    });
    calculateTotal();
}

function tagLabel(t) {
    const map = { veg: ' Végétarien', vegan: ' Vegan', glutenfree: ' Sans Gluten', halal: ' Halal', spicy: ' Épicé' };
    return map[t] || t;
}

function calculateTotal() {
    let count = 0, price = 0;
    document.querySelectorAll('.qty-stepper').forEach(stepper => {
        const qty = parseInt(stepper.querySelector('.qty-display').textContent) || 0;
        const item = state.menu.find(i => i.id === stepper.dataset.id);
        if (item) { count += qty; price += qty * item.price; }
    });
    document.getElementById('total-count').textContent = count;
    document.getElementById('total-price').textContent = price.toFixed(2);
    const badge = document.getElementById('cart-count-badge');
    if (badge) badge.textContent = count === 0 ? '0 article' : `${count} article${count > 1 ? 's' : ''}`;
    const cartBar = document.getElementById('cart-bar');
    if (cartBar) cartBar.classList.toggle('active', count > 0);
}

/* ---- PAYMENT FLOW ---- */
function goToPayment(e) {
    e.preventDefault();
    const total = parseInt(document.getElementById('total-count').textContent);
    if (total === 0) { showToast('Veuillez sélectionner au moins un article.'); return; }
    buildPaymentRecap();
    document.getElementById('order-form-container').classList.add('hidden');
    document.getElementById('payment-view').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function buildPaymentRecap() {
    const recapItems = document.getElementById('payment-recap-items');
    recapItems.innerHTML = '';
    let subtotal = 0;
    document.querySelectorAll('.qty-stepper').forEach(stepper => {
        const qty = parseInt(stepper.querySelector('.qty-display').textContent) || 0;
        if (!qty) return;
        const item = state.menu.find(i => i.id === stepper.dataset.id);
        if (!item) return;
        subtotal += qty * item.price;
        const row = document.createElement('div');
        row.className = 'recap-item-row';
        row.innerHTML = `<span>${qty}× ${item.name}</span><span>€${(qty * item.price).toFixed(2)}</span>`;
        recapItems.appendChild(row);
    });
    const extras = Array.from(document.querySelectorAll('input[name="extra"]:checked')).map(c => c.value).join(', ');
    document.getElementById('recap-subtotal').textContent = `€${subtotal.toFixed(2)}`;
    document.getElementById('recap-extras-label').textContent = extras || '—';
    document.getElementById('recap-total').textContent = `€${subtotal.toFixed(2)}`;
    const tomorrow = new Date();
    do { tomorrow.setDate(tomorrow.getDate() + 1); } while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6);
    document.getElementById('recap-date').textContent = tomorrow.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function confirmPayment() {
    const method = document.querySelector('input[name="payment"]:checked')?.value || 'card';
    if (method === 'card') {
        const num = document.getElementById('card-number').value.replace(/\s/g, '');
        if (num.length < 16) { showToast('Numéro de carte invalide'); return; }
        if (!/^\d{2}\/\d{2}$/.test(document.getElementById('card-expiry').value)) {
            showToast('Date d\'expiration invalide'); return;
        }
    }
    const ref = 'TM-' + Date.now().toString(36).toUpperCase();
    const items = [];
    document.querySelectorAll('.qty-stepper').forEach(stepper => {
        const qty = parseInt(stepper.querySelector('.qty-display').textContent) || 0;
        if (!qty) return;
        const item = state.menu.find(i => i.id === stepper.dataset.id);
        if (item) items.push({ ...item, qty });
    });
    const extras = Array.from(document.querySelectorAll('input[name="extra"]:checked')).map(c => c.value).join(', ');
    state.orders.push({
        ref,
        user: (state.currentUser?.firstName || '') + ' ' + (state.currentUser?.lastName || ''),
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        items, extras, payment: method,
        total: document.getElementById('recap-total').textContent,
        status: 'Confirmée',
        starter: items.filter(i => i.category === 'starter').map(i => `${i.qty}× ${i.name}`).join(', ') || '—',
        main: items.filter(i => i.category === 'main').map(i => `${i.qty}× ${i.name}`).join(', ') || '—',
        dessert: items.filter(i => i.category === 'dessert').map(i => `${i.qty}× ${i.name}`).join(', ') || '—'
    });
    document.getElementById('order-ref').textContent = ref;
    document.getElementById('payment-view').classList.add('hidden');
    document.getElementById('payment-success-view').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---- ADMIN: ORDERS ---- */
function renderAdminOrders() {
    const tbody = document.getElementById('orders-table-body');
    const tfoot = document.getElementById('orders-table-foot');
    const emptyMsg = document.getElementById('table-empty');
    if (!tbody) return;
    const searchVal = (document.getElementById('admin-search')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('admin-status-filter')?.value || '';

    const source = state.orders.length ? state.orders : [
        { ref: 'TM-DEMO1', user: 'Jean Dupont', time: '08:42', starter: '1× Soupe de Tomates', main: '1× Poulet Grillé', dessert: '—', extras: 'Couverts', payment: 'badge', total: '€12.40', status: 'Confirmée' },
        { ref: 'TM-DEMO2', user: 'Marie Martin', time: '09:15', starter: '—', main: '1× Lasagnes Végétales', dessert: '1× Tarte aux Pommes', extras: 'Serviette', payment: 'card', total: '€11.00', status: 'Confirmée' },
        { ref: 'TM-DEMO3', user: 'Paul Bernard', time: '11:03', starter: '1× Salade Chèvre Chaud', main: '1× Poulet Grillé', dessert: '1× Salade de Fruits', extras: '—', payment: 'cash', total: '€15.90', status: 'Modifiée' }
    ];

    const filtered = source.filter(o =>
        (!searchVal || o.user.toLowerCase().includes(searchVal)) &&
        (!statusFilter || o.status === statusFilter)
    );

    tbody.innerHTML = '';
    const tw = document.querySelector('.table-wrapper');
    if (!filtered.length) {
        emptyMsg?.classList.remove('hidden');
        if (tw) tw.style.display = 'none';
        return;
    }
    emptyMsg?.classList.add('hidden');
    if (tw) tw.style.display = '';

    let grandTotal = 0;
    filtered.forEach(o => {
        const statusClass = o.status === 'Confirmée' ? 'status-ok' : o.status === 'Annulée' ? 'status-cancelled' : 'status-modified';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><div class="cell-user"><strong>${o.user}</strong><small class="ref-label">${o.ref || ''}</small></div></td>
            <td>${o.time || '—'}</td>
            <td class="cell-dish">${o.starter || '—'}</td>
            <td class="cell-dish">${o.main || '—'}</td>
            <td class="cell-dish">${o.dessert || '—'}</td>
            <td>${o.extras || '—'}</td>
            <td><strong>${o.total || '—'}</strong></td>
            <td><span class="status-badge ${statusClass}">${o.status}</span></td>
            <td class="cell-actions">
                <button class="btn-icon" title="Confirmer" onclick="markOrder('${o.ref}','Confirmée')">✅</button>
                <button class="btn-icon btn-icon-danger" title="Annuler" onclick="markOrder('${o.ref}','Annulée')">✕</button>
            </td>
        `;
        tbody.appendChild(tr);
        const val = parseFloat((o.total || '0').replace('€', ''));
        if (!isNaN(val)) grandTotal += val;
    });

    if (tfoot) {
        tfoot.innerHTML = `<tr class="table-footer-row">
            <td colspan="6"><strong>${filtered.length} commande${filtered.length > 1 ? 's' : ''}</strong></td>
            <td><strong>€${grandTotal.toFixed(2)}</strong></td><td colspan="2"></td>
        </tr>`;
    }
    const statsEl = document.getElementById('admin-stats');
    if (statsEl) {
        const confirmed = filtered.filter(o => o.status === 'Confirmée').length;
        const modified = filtered.filter(o => o.status === 'Modifiée').length;
        statsEl.innerHTML = `
            <div class="stat-pill stat-green">✅ ${confirmed} confirmées</div>
            <div class="stat-pill stat-orange">✏️ ${modified} modifiées</div>
            <div class="stat-pill">💰 Total : €${grandTotal.toFixed(2)}</div>
        `;
    }
}

function markOrder(ref, newStatus) {
    const order = state.orders.find(o => o.ref === ref);
    if (order) { order.status = newStatus; renderAdminOrders(); showToast(`Commande ${ref} → ${newStatus}`); }
}

function exportCSV() {
    if (!state.orders.length) { showToast('Aucune commande à exporter.'); return; }
    const headers = ['Référence','Professeur','Heure','Entrée','Plat','Dessert','Extras','Paiement','Total','Statut'];
    const rows = state.orders.map(o =>
        [o.ref||'',o.user,o.time||'',o.starter||'',o.main||'',o.dessert||'',o.extras||'',o.payment||'',o.total||'',o.status]
        .map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `commandes_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    showToast('Export CSV téléchargé !');
}

/* ---- ADMIN: MENU ---- */
function renderAdminMenuList() {
    const container = document.getElementById('admin-menu-list');
    if (!container) return;
    container.innerHTML = '';
    const catLabels = { starter: ' Entrées', main: ' Plats', dessert: ' Desserts' };
    ['starter', 'main', 'dessert'].forEach(cat => {
        const items = state.menu.filter(i => i.category === cat);
        if (!items.length) return;
        const group = document.createElement('div');
        group.className = 'admin-menu-group';
        group.innerHTML = `<div class="admin-menu-group-title">${catLabels[cat]}</div>`;
        items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'admin-menu-row' + (item.visible ? '' : ' menu-hidden-row');
            const tags = item.tags?.length ? item.tags.map(t => `<span class="mini-tag">${tagLabel(t)}</span>`).join('') : '';
            const limitText = item.limit > 0 ? `<span class="mini-tag mini-tag-limit">⚡${item.limit}</span>` : '';
            row.innerHTML = `
                <div class="admin-menu-info">
                    <span class="admin-menu-name">${item.name}</span>
                    <span class="admin-menu-meta">${tags}${limitText}</span>
                </div>
                <span class="admin-menu-price">€${item.price.toFixed(2)}</span>
                <div class="admin-menu-actions">
                    <button class="btn-icon" title="${item.visible ? 'Masquer' : 'Afficher'}" onclick="toggleMenuVisibility('${item.id}')">${item.visible ? '👁️' : '🚫'}</button>
                    <button class="btn-icon" title="Modifier" onclick="editMenuItem('${item.id}')">✏️</button>
                    <button class="btn-icon btn-icon-danger" title="Supprimer" onclick="deleteMenuItem('${item.id}')">🗑️</button>
                </div>
            `;
            group.appendChild(row);
        });
        container.appendChild(group);
    });
}

function handleMenuFormSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('edit-item-id').value;
    const name = document.getElementById('item-name').value.trim();
    const category = document.getElementById('item-category').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const limit = parseInt(document.getElementById('item-limit').value) || 0;
    const visible = document.getElementById('item-visible').checked;
    const tags = Array.from(document.querySelectorAll('#menu-admin-form input[name="tag"]:checked')).map(c => c.value);
    if (!name || !category || isNaN(price)) { showToast('Remplissez tous les champs obligatoires.'); return; }
    if (editId) {
        const item = state.menu.find(i => i.id === editId);
        if (item) Object.assign(item, { name, category, price, limit, visible, tags });
        showToast(`"${name}" mis à jour !`);
    } else {
        state.menu.push({ id: String(state.nextItemId++), name, category, price, limit, visible, tags });
        showToast(`"${name}" ajouté !`);
    }
    resetMenuForm();
    renderAdminMenuList();
    renderMenu();
}

function resetMenuForm() {
    document.getElementById('edit-item-id').value = '';
    document.getElementById('menu-admin-form').reset();
    document.getElementById('item-visible').checked = true;
    document.getElementById('menu-form-title').textContent = 'Ajouter un plat';
    document.getElementById('menu-submit-btn').textContent = 'Ajouter le plat';
    document.getElementById('menu-cancel-edit-btn').classList.add('hidden');
}

function editMenuItem(id) {
    const item = state.menu.find(i => i.id === id);
    if (!item) return;
    document.getElementById('edit-item-id').value = id;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-category').value = item.category;
    document.getElementById('item-price').value = item.price;
    document.getElementById('item-limit').value = item.limit || 0;
    document.getElementById('item-visible').checked = item.visible;
    document.querySelectorAll('#menu-admin-form input[name="tag"]').forEach(cb => { cb.checked = item.tags?.includes(cb.value); });
    document.getElementById('menu-form-title').textContent = `Modifier "${item.name}"`;
    document.getElementById('menu-submit-btn').textContent = 'Enregistrer';
    document.getElementById('menu-cancel-edit-btn').classList.remove('hidden');
    document.getElementById('menu-admin-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteMenuItem(id) {
    const item = state.menu.find(i => i.id === id);
    if (!item || !confirm(`Supprimer "${item.name}" ?`)) return;
    state.menu = state.menu.filter(i => i.id !== id);
    renderAdminMenuList();
    renderMenu();
    showToast(`"${item.name}" supprimé.`);
}

function toggleMenuVisibility(id) {
    const item = state.menu.find(i => i.id === id);
    if (item) { item.visible = !item.visible; renderAdminMenuList(); renderMenu(); }
}

/* ---- TOASTS ---- */
function showToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast toast-enter';
    toast.textContent = msg;
    toast.setAttribute('role', 'alert');
    container.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('toast-visible')));
    const timer = setTimeout(() => dismissToast(toast), 3500);
    toast.addEventListener('click', () => { clearTimeout(timer); dismissToast(toast); });
}
function dismissToast(toast) {
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-exit');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
}
function lettersOnly(input) { input.value = input.value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, ''); }
