// API Configuration
const API_BASE_URL = 'https://your-backend-url.com/api';
const TELEGRAM_BOT_USERNAME = 'YourBotUsername';

// Initialize TelegramLoginWidget
window.onload = function() {
    initializeTelegramLogin();
    initializeUI();
    setupEventListeners();
    checkAuthStatus();
};

// Initialize Telegram Login Widget
function initializeTelegramLogin() {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?15';
    script.setAttribute('data-telegram-login', TELEGRAM_BOT_USERNAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    document.getElementById('telegramLogin').appendChild(script);
}

// Handle Telegram Authentication
async function onTelegramAuth(user) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('userToken', data.token);
            updateUIAfterLogin(user);
            await fetchUserData();
        } else {
            showNotification('Authentication failed', 'error');
        }
    } catch (error) {
        console.error('Auth error:', error);
        showNotification('Connection error', 'error');
    }
}

// Initialize UI Components
function initializeUI() {
    updateDateTime();
    initializeCharts();
    setInterval(updateDateTime, 60000);
}

// Setup Event Listeners
function setupEventListeners() {
    document.getElementById('getNewAd').addEventListener('click', fetchNewAd);
    document.getElementById('withdrawBtn').addEventListener('click', showWithdrawModal);
    document.getElementById('confirmWithdraw').addEventListener('click', processWithdrawal);
}

// Fetch User Data
async function fetchUserData() {
    try {
        const token = localStorage.getItem('userToken');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/user/data`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateDashboard(data);
        } else {
            throw new Error('Failed to fetch user data');
        }
    } catch (error) {
        console.error('Data fetch error:', error);
        showNotification('Failed to load user data', 'error');
    }
}

// Update Dashboard with User Data
function updateDashboard(data) {
    document.getElementById('mainBalance').textContent = `$${data.balance.toFixed(2)}`;
    document.getElementById('todayClicks').textContent = data.todayClicks;
    document.getElementById('todayEarnings').textContent = `$${data.todayEarnings.toFixed(2)}`;
    
    updateActivityList(data.recentActivity);
    updateEarningsChart(data.earningsHistory);
}

// Fetch and Display New Ad
async function fetchNewAd() {
    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/ads/new`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const ad = await response.json();
            displayAd(ad);
        } else {
            throw new Error('Failed to fetch ad');
        }
    } catch (error) {
        console.error('Ad fetch error:', error);
        showNotification('Failed to load new ad', 'error');
    }
}

// Display Ad in Container
function displayAd(ad) {
    const adContainer = document.getElementById('adContainer');
    adContainer.innerHTML = `
        <div class="ad-item" data-ad-id="${ad.id}">
            <h4>${ad.title}</h4>
            <p>${ad.description}</p>
            <button class="btn btn-primary ad-click-btn">
                Visit Advertisement
            </button>
        </div>
    `;

    adContainer.querySelector('.ad-click-btn').addEventListener('click', () => handleAdClick(ad.id));
}

// Handle Ad Click
async function handleAdClick(adId) {
    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/ads/click`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ adId })
        });

        if (response.ok) {
            const data = await response.json();
            showNotification(`Earned $${data.earned}!`, 'success');
            await fetchUserData(); // Refresh dashboard data
        } else {
            throw new Error('Failed to process ad click');
        }
    } catch (error) {
        console.error('Click processing error:', error);
        showNotification('Failed to process click', 'error');
    }
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    const container = document.getElementById('notificationContainer');
    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Update DateTime
function updateDateTime() {
    const now = new Date();
    document.getElementById('currentDate').textContent = 
        now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
}