// GÜVENLİK AYARI
const CORRECT_PASSWORD = "757575";
let enteredPassword = "";

// --- API Anahtarları (Sizin Anahtarlarınız) ---
const WEATHER_API_KEY = "9a04fe8303507e2ac272303047c6a3c2";
const EXCHANGE_API_KEY = "ccef33d1d48d749041651010";
const COINGECKO_API_KEY = "CG-YmZbY9eU5FoSArzkXWACXWSJ"; 

// Sabitler
const LOCATIONS = {
    TUZLA: { 
        api: "Tuzla,TR", 
        display: "Tuzla/İstanbul",
        headerTitle: "Sabancı Üniversitesi",
        headerSubtitle: "Tuzla, İstanbul Dashboard",
        address: "Orta Mahalle, Üniversite Cd.<br>No:27, 34956 Tuzla/İstanbul",
        logoSrc: "logo.png" 
    },
    CUKUROVA: { 
        api: "Adana,TR", 
        display: "Adana/Çukurova",
        headerTitle: "Arcadia Apartmanı",
        headerSubtitle: "Berke Kıdık Dashboard",
        address: "Çukurova Mahallesi, Arcadia Apartmanı<br>Adana",
        logoSrc: "ev.png" // Yeni Ev Logosu
    }
};
const BASE_CURRENCY = "TRY";
let current_location_key = 'TUZLA'; 

// --- DOM Elementleri (Global olarak atanacak) ---
let dashboardContainer, passwordScreen, keypadButtons, passwordDots, passwordHeader, toggleLocationBtn, refreshBtn;
let timeElement, dateElement, headerTitleEl, headerSubtitleEl, headerLogoEl;


// --- ŞİFRE EKRANI YÖNETİMİ ---

function updatePasswordDots() {
    const dots = document.querySelectorAll('.password-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('filled', index < enteredPassword.length);
    });
}

function unlockDashboard() {
    const header = document.querySelector('.password-header');
    
    header.textContent = "Hoş Geldiniz";
    
    document.querySelector('.password-dots-container').style.visibility = 'hidden';
    document.querySelector('.keypad-container').style.visibility = 'hidden';

    setTimeout(() => {
        passwordScreen.style.display = 'none';
        dashboardContainer.style.display = 'flex'; 
        
        initializeDashboard();
    }, 1000); 
}

function handleKeypadInput(key) {
    const header = document.querySelector('.password-header');
    
    if (key === 'delete') {
        enteredPassword = enteredPassword.slice(0, -1);
        header.textContent = "Parolayı Girin";
    } else if (key === 'error') {
        header.textContent = "Yanlış Parola";
        enteredPassword = ""; 
        
        const dotsContainer = document.querySelector('.password-dots-container');
        dotsContainer.style.animation = 'shake 0.4s'; 
        
        setTimeout(() => {
            header.textContent = "Parolayı Girin";
            dotsContainer.style.animation = 'none';
            updatePasswordDots();
        }, 800); 
    } else if (key.length === 1 && !isNaN(parseInt(key))) {
        if (enteredPassword.length < CORRECT_PASSWORD.length) {
            enteredPassword += key;
        }
    }
    
    updatePasswordDots();

    if (enteredPassword.length === CORRECT_PASSWORD.length) {
        if (enteredPassword === CORRECT_PASSWORD) {
            unlockDashboard();
        } else {
            handleKeypadInput('error'); 
        }
    }
}

function setupKeypadListeners() {
    const buttons = document.querySelectorAll('.keypad-button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const key = button.getAttribute('data-key');
            if (key === 'delete') {
                handleKeypadInput(key);
            } else if (key === '0' || (parseInt(key) >= 1 && parseInt(key) <= 9)) {
                 handleKeypadInput(key);
            }
        });
    });
}

function checkPassword() {
    if (currentPasswordInput === CORRECT_PASSWORD) {
        unlockDashboard();
    } else {
        handleKeypadInput('error');
    }
}


// --- PANONUN ANA FONKSİYONLARI ---

function updateTime() {
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' };

    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString('tr-TR', timeOptions);
    }
    const dateString = now.toLocaleDateString('tr-TR', dateOptions);
    if (dateElement) {
        dateElement.textContent = dateString.charAt(0).toUpperCase() + dateString.slice(1);
    }
}

function getWeatherEmoji(mainCondition) {
    const condition = mainCondition.toLowerCase();
    switch (condition) {
        case 'clear':
            return '☀️'; 
        case 'clouds':
            return '☁️'; 
        case 'rain':
        case 'drizzle':
            return '🌧️'; 
        case 'thunderstorm':
            return '⛈️'; 
        case 'snow':
            return '❄️'; 
        case 'mist':
        case 'smoke':
        case 'haze':
        case 'fog':
            return '🌫️'; 
        default:
            return '🌤️'; 
    }
}

async function fetchWeatherData(locationKey) {
    const location = LOCATIONS[locationKey];
    
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${location.api}&appid=${WEATHER_API_KEY}&units=metric&lang=tr`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Hata kodu: ${response.status}`);
        }
        
        const data = await response.json();
        
        const mainCondition = data.weather[0].main;
        const emoji = getWeatherEmoji(mainCondition);
        
        let weatherVisual = document.getElementById('weather-visual');
        if (!weatherVisual) {
            weatherVisual = document.createElement('span');
            weatherVisual.id = 'weather-visual';
            weatherVisual.classList.add('weather-visual');
            document.querySelector('.weather-content').prepend(weatherVisual); 
        }
        weatherVisual.textContent = emoji;

        const rainChance = Math.floor(Math.random() * 20) + 5; 

        document.getElementById('weather-temp').textContent = `${Math.round(data.main.temp)}°C`;
        const conditionText = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
        document.getElementById('weather-condition').textContent = conditionText;
        
        document.getElementById('rain-probability').textContent = `%${rainChance}`; 
        
        document.getElementById('weather-location').textContent = location.display;
        document.querySelector('.address-info p').innerHTML = location.address; 

        // BAŞLIK VE LOGO GÜNCELLEMESİ
        if (headerTitleEl) headerTitleEl.textContent = location.headerTitle;
        if (headerSubtitleEl) headerSubtitleEl.textContent = location.headerSubtitle;
        if (headerLogoEl) headerLogoEl.src = location.logoSrc; 

    } catch (error) {
        console.error("Hava durumu verisi çekilirken hata:", error);
        document.getElementById('weather-condition').textContent = "Veri Yok";
        document.getElementById('weather-location').textContent = location.display + " (Hata)";
        let weatherVisual = document.getElementById('weather-visual');
        if (weatherVisual) weatherVisual.textContent = '';
    }
}

async function fetchExchangeData() {
    try {
        const exchangeUrl = `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/${BASE_CURRENCY}`;
        const exchangeResponse = await fetch(exchangeUrl);
        
        if (!exchangeResponse.ok) throw new Error(`Döviz API hatası: ${exchangeResponse.statusText}`);
        
        const exchangeData = await exchangeResponse.json();
        
        const usdValue = 1 / exchangeData.conversion_rates.USD; 
        const eurValue = 1 / exchangeData.conversion_rates.EUR; 

        const calculateChange = () => (Math.random() * 0.8 - 0.4).toFixed(2); 

        const usdLow = (usdValue - 0.03).toFixed(2);
        const usdHigh = (usdValue + 0.03).toFixed(2);
        document.getElementById('usd-low').textContent = usdLow + ' TL';
        document.getElementById('usd-high').textContent = usdHigh + ' TL';

        updateCard('usd', usdValue.toFixed(2), calculateChange());
        updateCard('eur', eurValue.toFixed(2), calculateChange());
        
        const goldValue = 5721 + (Math.random() * 50 - 25);
        updateCard('gold', Math.round(goldValue).toLocaleString('tr-TR'), calculateChange());

    } catch (error) {
        console.error("Döviz/Altın verisi çekilirken hata:", error);
    }
}

async function fetchCryptoData() {
    try {
        const cryptoUrl = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=try&x_cg_demo_api_key=${COINGECKO_API_KEY}`;
        const cryptoResponse = await fetch(cryptoUrl);
        
        if (!cryptoResponse.ok) throw new Error(`Kripto API hatası: ${cryptoResponse.statusText}`);
        
        const cryptoData = await cryptoResponse.json();
        
        if (cryptoData.bitcoin && cryptoData.bitcoin.try) {
            const btcValue = cryptoData.bitcoin.try;
            const btcChange = (Math.random() * 0.8 - 0.4).toFixed(2);
            
            document.getElementById('btc-value').textContent = Math.round(btcValue).toLocaleString('tr-TR');
            updateChangeElement('btc-change', btcChange);
        } else {
             throw new Error("Kripto veri formatı beklenenden farklı.");
        }
    } catch (error) {
        console.error("Kripto verisi çekilirken hata:", error);
    }
}

function updateCard(id, value, change) {
    const valueEl = document.getElementById(`${id}-value`);
    if (valueEl) valueEl.textContent = value;
    updateChangeElement(`${id}-change`, change);
}

function updateChangeElement(elementId, changeValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const value = parseFloat(changeValue);
    
    element.textContent = `${value > 0 ? '+' : ''}${value}%`;
    
    element.classList.remove('positive', 'negative');
    if (value > 0) {
        element.classList.add('positive');
    } else if (value < 0) {
        element.classList.add('negative');
    }
}

async function fetchAllData() {
    await fetchWeatherData(current_location_key); 
    await fetchExchangeData();
    await fetchCryptoData();
}

function initializeDashboard() {
    // DOM Atamaları
    dashboardContainer = document.querySelector('.dashboard-container');
    toggleLocationBtn = document.getElementById('toggle-location-btn');
    refreshBtn = document.querySelector('.refresh-button');
    timeElement = document.getElementById('current-time');
    dateElement = document.getElementById('current-date');
    headerTitleEl = document.getElementById('header-title');
    headerSubtitleEl = document.getElementById('header-subtitle');
    headerLogoEl = document.getElementById('header-logo'); // Yeni logo elementi ataması

    // Başlangıç değerlerini çek
    updateTime();
    fetchAllData();
    
    // Düzenli Güncellemeleri başlat
    setInterval(updateTime, 1000); 
    setInterval(fetchAllData, 300000); 

    // Yenileme tuşunu dinle
    if (refreshBtn) {
        refreshBtn.addEventListener('click', fetchAllData);
    }

    // Konum değiştirme tuşunu dinle (Adana/Tuzla geçişi)
    if (toggleLocationBtn) {
        toggleLocationBtn.addEventListener('click', () => {
            current_location_key = (current_location_key === 'TUZLA') ? 'CUKUROVA' : 'TUZLA';
            fetchWeatherData(current_location_key);
        });
    }
    
    // Alarmı kapatma butonu dinleyicisi
    const dismissButton = document.getElementById('alarm-dismiss');
    if (dismissButton) {
        dismissButton.addEventListener('click', () => {
            const overlay = document.getElementById('alarm-overlay');
            overlay.classList.remove('visible');
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 500); 
        });
    }
}


// --- SAYFA YÜKLENDİĞİNDE ŞİFRE EKRANINI BAŞLAT ---
document.addEventListener('DOMContentLoaded', () => {
    // DOM elementlerini atama (Şifre mantığı için)
    dashboardContainer = document.querySelector('.dashboard-container');
    passwordScreen = document.getElementById('password-screen');
    keypadButtons = document.querySelectorAll('.keypad-button');
    passwordDots = document.querySelectorAll('.password-dot');
    passwordHeader = document.querySelector('.password-header');
    
    // Şifre tuş takımını dinle
    setupKeypadListeners();
    
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        if (key >= '0' && key <= '9') {
            handleKeypadInput(key);
        } else if (key === 'Backspace' || key === 'Delete') {
            handleKeypadInput('delete');
        }
    });

    // Başlangıçta panoyu gizle, şifre ekranını göster
    dashboardContainer.style.display = 'none';
    if (passwordScreen) {
        passwordScreen.style.display = 'flex';
    }
});