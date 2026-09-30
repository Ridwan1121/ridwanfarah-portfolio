// State
let token = localStorage.getItem('token');
let currentUser = null;

// DOM elements
const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const login2FA = document.getElementById('login2FA');
const twoFactorGroup = document.getElementById('twoFactorGroup');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');

// Tabs
const tabs = document.querySelectorAll('nav button');
const tabContents = {
  visitors: document.getElementById('visitorsTab'),
  audit: document.getElementById('auditTab'),
  settings: document.getElementById('settingsTab'),
  backup: document.getElementById('backupTab')
};

// Init
if (token) {
  checkAuth();
}

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = loginEmail.value;
  const password = loginPassword.value;
  const twoFactorToken = login2FA.value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, twoFactorToken })
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      token = data.token;
      currentUser = data.user;
      showDashboard();
    } else {
      if (data.require2FA) {
        twoFactorGroup.style.display = 'block';
        loginError.textContent = '2FA required';
      } else {
        loginError.textContent = data.error || 'Login failed';
      }
    }
  } catch (error) {
    loginError.textContent = 'Network error';
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token }
  }).finally(() => {
    localStorage.removeItem('token');
    token = null;
    currentUser = null;
    showLogin();
  });
});

// Check auth
async function checkAuth() {
  try {
    const response = await fetch('/api/auth/me', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (response.ok) {
      const data = await response.json();
      currentUser = data;
      showDashboard();
    } else {
      localStorage.removeItem('token');
      token = null;
      showLogin();
    }
  } catch {
    localStorage.removeItem('token');
    token = null;
    showLogin();
  }
}

// Show/hide pages
function showLogin() {
  loginPage.style.display = 'flex';
  dashboardPage.style.display = 'none';
}

function showDashboard() {
  loginPage.style.display = 'none';
  dashboardPage.style.display = 'block';
  userEmail.textContent = currentUser.email;
  loadVisitors();
  loadAudit();
  loadSettings();
  // Start periodic refresh
  if (window.visitorInterval) clearInterval(window.visitorInterval);
  window.visitorInterval = setInterval(loadVisitors, 30000); // every 30s
}

// Tab switching
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tabName = btn.dataset.tab;
    Object.keys(tabContents).forEach(key => {
      tabContents[key].classList.toggle('active', key === tabName);
    });
    if (tabName === 'visitors') loadVisitors();
    if (tabName === 'audit') loadAudit();
    if (tabName === 'settings') loadSettings();
  });
});

// Load visitors
async function loadVisitors() {
  try {
    const response = await fetch('/api/visitors', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (response.ok) {
      const visitors = await response.json();
      const tbody = document.querySelector('#visitorsTable tbody');
      tbody.innerHTML = visitors.map(v => `
        <tr>
          <td>${v.ip}</td>
          <td>${v.pageVisited || '-'}</td>
          <td>${new Date(v.timestamp).toLocaleString()}</td>
          <td>${v.location ? v.location.city + ', ' + v.location.country : '-'}</td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('Failed to load visitors', error);
  }
}

// Load audit logs
async function loadAudit() {
  try {
    const response = await fetch('/api/admin/audit', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (response.ok) {
      const logs = await response.json();
      const tbody = document.querySelector('#auditTable tbody');
      tbody.innerHTML = logs.map(log => `
        <tr>
          <td>${log.userId || 'system'}</td>
          <td>${log.action}</td>
          <td>${new Date(log.timestamp).toLocaleString()}</td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('Failed to load audit logs', error);
  }
}

// Settings
async function loadSettings() {
  // Show current IP (client side)
  fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => {
      document.getElementById('currentIP').textContent = data.ip;
    });
}

// 2FA Setup
document.getElementById('setup2faBtn').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/auth/setup-2fa', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (response.ok) {
      const data = await response.json();
      const qrContainer = document.getElementById('qrContainer');
      document.getElementById('qrCodeImg').src = data.qrCode;
      qrContainer.style.display = 'block';
      alert('Scan the QR code with your authenticator app. Secret: ' + data.secret);
    } else {
      const err = await response.json();
      alert(err.error || 'Failed to setup 2FA');
    }
  } catch (error) {
    alert('Network error');
  }
});

document.getElementById('toggle2faBtn').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/auth/toggle-2fa', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (response.ok) {
      const data = await response.json();
      alert(`2FA ${data.twoFactorEnabled ? 'enabled' : 'disabled'}`);
    } else {
      const err = await response.json();
      alert(err.error || 'Failed to toggle 2FA');
    }
  } catch (error) {
    alert('Network error');
  }
});

// Manual backup
document.getElementById('manualBackupBtn').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/admin/backup', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (response.ok) {
      const data = await response.json();
      document.getElementById('backupStatus').innerHTML = `<p>✅ ${data.message}: ${data.file}</p>`;
    } else {
      document.getElementById('backupStatus').innerHTML = `<p style="color:red;">❌ Backup failed</p>`;
    }
  } catch (error) {
    document.getElementById('backupStatus').innerHTML = `<p style="color:red;">❌ Network error</p>`;
  }
});

// Visitor tracking (track page visits)
function trackPage() {
  fetch('/api/visitors/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pageVisited: window.location.pathname,
      referer: document.referrer,
      userAgent: navigator.userAgent,
      location: null // can be filled with geolocation later
    })
  }).catch(err => console.log('Track error:', err));
}

// Track on load
trackPage();

// Track on page changes (SPA)
let lastPage = window.location.pathname;
setInterval(() => {
  if (window.location.pathname !== lastPage) {
    lastPage = window.location.pathname;
    trackPage();
  }
}, 2000);
