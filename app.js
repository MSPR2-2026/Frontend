const API_GATEWAY = '/function';

// Кэширование элементов DOM
const sections = {
    login: document.getElementById('login-section'),
    create: document.getElementById('create-section'),
    qrPass: document.getElementById('qr-pass-section'),
    qr2fa: document.getElementById('qr-2fa-section')
};

const forms = {
    login: document.getElementById('login-form'),
    create: document.getElementById('create-form')
};

const messages = {
    login: document.getElementById('login-message'),
    create: document.getElementById('create-message')
};

let currentNewUsername = '';

// --- 1. ФУНКЦИИ ДЛЯ ОБРАЩЕНИЯ К API OPENFAAS ---

async function apiAuthenticate(username, password, code_2fa) {
    const response = await fetch(`${API_GATEWAY}/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username, password: password, code_2fa: code_2fa })
    });
    if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);
    return await response.json(); 
}

async function apiGeneratePassword(username) {
    const response = await fetch(`${API_GATEWAY}/generate-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username })
    });
    if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);
    
    const textData = await response.text(); 
    try {
        const jsonData = JSON.parse(textData); 
        return jsonData.qrcode || jsonData.image || jsonData.data || textData;
    } catch (e) {
        return textData; 
    }
}

async function apiGenerate2FA(username) {
    const response = await fetch(`${API_GATEWAY}/generate-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username })
    });
    if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);
    
    const textData = await response.text();
    try {
        const jsonData = JSON.parse(textData);
        return jsonData.qrcode || jsonData.image || jsonData.data || textData;
    } catch (e) {
        return textData;
    }
}

// --- УТИЛИТЫ ДЛЯ УПРАВЛЕНИЯ ИНТЕРФЕЙСОМ ---

function showSection(target) {
    Object.values(sections).forEach(sec => sec.classList.remove('active', 'hidden'));
    Object.values(sections).forEach(sec => sec.classList.add('hidden'));
    sections[target].classList.remove('hidden');
    sections[target].classList.add('active');
}

function showMessage(el, text, type) {
    el.textContent = text;
    el.className = `message ${type}`;
}

// --- НАВИГАЦИЯ ПО СТРАНИЦАМ (КНОПКИ) ---

document.getElementById('btn-show-create').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('create');
    messages.create.textContent = '';
});

document.getElementById('btn-show-login').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('login');
    messages.login.textContent = '';
});

document.getElementById('btn-finish-setup').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('login');
    showMessage(messages.login, 'Configuration terminée. Vous pouvez vous authentifier.', 'success');
});

// --- ОСНОВНАЯ ЛОГИКА: АВТОРИЗАЦИЯ ---

forms.login.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const code_2fa = document.getElementById('totp').value;
    const submitBtn = e.target.querySelector('button');

    submitBtn.disabled = true;
    showMessage(messages.login, 'Authentification en cours...', '');

    try {
        const data = await apiAuthenticate(username, password, code_2fa);

        if (data.expired) {
            showMessage(messages.login, 'Identifiants expirés. Redirection vers le renouvellement...', 'error');
            setTimeout(() => {
                document.getElementById('new-username').value = username;
                showSection('create');
            }, 2500);
        } else if (data.authenticated) {
            showMessage(messages.login, 'Authentification OK. Accès autorisé.', 'success');
        } else {
            showMessage(messages.login, 'Identifiants ou code 2FA incorrects.', 'error');
        }
    } catch (error) {
        console.error(error);
        showMessage(messages.login, 'Impossible de joindre le serveur OpenFaaS.', 'error');
    } finally {
        submitBtn.disabled = false;
    }
});

// --- ОСНОВНАЯ ЛОГИКА: ЭТАП 1 (ГЕНЕРАЦИЯ ПАРОЛЯ) ---

forms.create.addEventListener('submit', async (e) => {
    e.preventDefault();
    currentNewUsername = document.getElementById('new-username').value;
    const submitBtn = e.target.querySelector('button');
    
    submitBtn.disabled = true;
    showMessage(messages.create, 'Génération du mot de passe fort...', '');
    
    try {
        const passData = await apiGeneratePassword(currentNewUsername);
        
        // Жесткая очистка строки Base64 от мусора
        const cleanBase64 = passData.replace(/["'\n\r\s]/g, '');
        
        document.getElementById('qr-password-img').src = cleanBase64;
        showSection('qrPass');
    } catch (error) {
        console.error(error);
        showMessage(messages.create, 'Erreur lors de la génération. La gateway est up ?', 'error');
    } finally {
        submitBtn.disabled = false;
    }
});

// --- ОСНОВНАЯ ЛОГИКА: ЭТАП 2 (ГЕНЕРАЦИЯ 2FA) ---

document.getElementById('btn-next-2fa').addEventListener('click', async (e) => {
    e.preventDefault();
    const btn = e.target;
    btn.disabled = true;
    btn.textContent = 'Génération du code 2FA en cours...';

    try {
        const mfaData = await apiGenerate2FA(currentNewUsername);
        
        // Жесткая очистка строки Base64 от мусора
        const cleanBase64 = mfaData.replace(/["'\n\r\s]/g, '');
        
        document.getElementById('qr-2fa-img').src = cleanBase64;
        showSection('qr2fa'); 
    } catch (error) {
        console.error(error);
        alert('Erreur lors de la génération du 2FA. Vérifiez la console.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Étape suivante : Configurer le 2FA';
    }
});