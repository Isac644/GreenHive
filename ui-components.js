// ui-components.js
import { state, CATEGORIES, PALETTE_COLORS } from "./state-and-handlers.js";

const GreenHiveLogoSVG = (height) => `
    <svg height="${height}" viewBox="0 0 340 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#16a34a;stop-opacity:1" />
            </linearGradient>
        </defs>
        <path d="M30,5 L0,25 L0,65 L30,85 L60,65 L60,25 Z M30,15 L50,28 L50,52 L30,65 L10,52 L10,28 Z" fill="url(#logoGradient)"/>
        <text x="80" y="62" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="url(#logoGradient)">GreenHive</text>
    </svg>`;

const ThemeIconSVG = () => state.theme === 'light' 
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` 
    : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-400"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

const GoogleIconSVG = `<svg class="h-6 w-6 mr-2" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C44.572,36.833,48,30.826,48,24C48,22.659,47.862,21.35,47.611,20.083z"></path></svg>`;

const CopyIconSVG = `<svg class="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`;

const BellIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`;

export function renderHeader() {
    if (!state.user) return '';

    const hasUnread = state.notifications && state.notifications.length > 0;
    const badgeHTML = hasUnread 
        ? `<span class="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-red-600 transform translate-x-1/4 -translate-y-1/4"></span>` 
        : '';

    let notificationsListHTML = '';
    if (state.isNotificationMenuOpen) {
        if (state.notifications.length === 0) {
            notificationsListHTML = `<div class="p-4 text-center text-gray-500 text-sm">Nenhuma notificação nova.</div>`;
        } else {
            notificationsListHTML = state.notifications.map(notif => {
                if (notif.type === 'join_request') {
                    return `
                    <div class="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 relative group">
                        <button class="delete-notif-btn absolute top-2 right-2 text-gray-400 hover:text-gray-600" data-id="${notif.id}">&times;</button>
                        <p class="text-sm text-gray-800 dark:text-gray-200 pr-4 mb-2">
                            <strong>${notif.senderName}</strong> quer entrar na família <strong>${notif.targetFamilyName}</strong>.
                        </p>
                        <div class="flex gap-2">
                            <button class="accept-request-btn px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700" data-notif-id="${notif.id}">Aceitar</button>
                            <button class="reject-request-btn px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300" data-notif-id="${notif.id}">Recusar</button>
                        </div>
                    </div>`;
                }
                if (notif.type === 'request_accepted') {
                    return `
                    <div class="p-3 border-b border-gray-100 dark:border-gray-700 bg-green-50 dark:bg-green-900/20 relative">
                        <button class="delete-notif-btn absolute top-2 right-2 text-gray-400 hover:text-gray-600" data-id="${notif.id}">&times;</button>
                        <p class="text-sm text-gray-800 dark:text-gray-200 pr-4 mb-2">
                            <span class="text-green-600 font-bold">Aprovado!</span> Sua solicitação para entrar na família <strong>${notif.targetFamilyName}</strong> foi aceita.
                        </p>
                        <button class="enter-family-notif-btn w-full px-3 py-2 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition" data-notif-id="${notif.id}">
                            Entrar Agora
                        </button>
                    </div>`;
                }
                if (notif.type === 'request_rejected') {
                    return `
                    <div class="p-3 border-b border-gray-100 dark:border-gray-700 bg-red-50 dark:bg-red-900/20 relative">
                        <button class="delete-notif-btn absolute top-2 right-2 text-gray-400 hover:text-gray-600" data-id="${notif.id}">&times;</button>
                        <p class="text-sm text-gray-800 dark:text-gray-200 pr-4">
                            <span class="text-red-600 font-bold">Recusado.</span> Sua solicitação para entrar na família <strong>${notif.targetFamilyName || 'solicitada'}</strong> foi recusada pelo administrador.
                        </p>
                    </div>`;
                }
                return '';
            }).join('');
        }
    }

    let userAvatar = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600 dark:text-gray-300">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>`;
        
    if (state.user.photoURL && state.user.photoURL.includes('|')) {
        const [emoji, bg] = state.user.photoURL.split('|');
        userAvatar = `<div class="w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-sm border border-gray-200" style="background-color: ${bg};">${emoji}</div>`;
    }

    const dropdownHTML = state.isNotificationMenuOpen 
        ? `<div class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-fade-in">
            <div class="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300 text-sm">Notificações</div>
            <div class="max-h-96 overflow-y-auto">${notificationsListHTML}</div>
           </div>` : '';

    return `<header class="bg-white dark:bg-gray-800 shadow-md w-full sticky top-0 z-40">
        <div class="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <div class="flex items-center gap-3">${GreenHiveLogoSVG('40')}</div>
            <div class="flex items-center gap-4">
                <div class="relative">
                    <button id="notification-button" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition relative text-gray-600 dark:text-gray-300">
                        ${BellIconSVG}${badgeHTML}
                    </button>
                    ${dropdownHTML}
                </div>
                <button id="theme-toggle-button" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">${ThemeIconSVG()}</button>
                <div class="relative">
                    <button id="user-menu-button" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center justify-center">
                        ${userAvatar}
                    </button>
                    <div id="user-menu" class="hidden absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 border dark:border-gray-700 animate-fade-in z-50">
                        <div class="px-4 py-2 border-b dark:border-gray-700">
                            <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">${state.user.name}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">${state.user.email}</p>
                        </div>
                        
                        <button id="open-settings-button" class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Configurações
                        </button>

                        <button id="logout-button" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Sair da Conta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </header>`;
}

export function renderAuthPage() {
    let content = '';
    if (state.authView === 'login') {
        content = renderLoginFormHTML();
    } else if (state.authView === 'signup') {
        content = renderSignupFormHTML();
    } else if (state.authView === 'signup-success') {
        content = renderSignupSuccessHTML();
    } else if (state.authView === 'forgot-password') {
        content = renderForgotPasswordFormHTML();
    } else if (state.authView === 'forgot-password-success') {
        content = renderForgotPasswordSuccessHTML();
    }

    return `<div class="min-h-screen flex items-center justify-center p-4">
    <div class="bg-white p-8 rounded-2xl shadow-lg w-full animate-fade-in max-w-md mx-auto">
        <div class="text-center mb-8">
            <div class="flex justify-center items-center gap-3 mb-2">
                ${GreenHiveLogoSVG('80')}
            </div>
            <p class="text-gray-600">Sua colmeia financeira familiar.</p>
        </div>
        <div id="auth-form-container">
            ${content}
        </div>
    </div>
</div>`;
}

export function renderLoginFormHTML() {
    return `<h2 class="text-2xl font-semibold text-center text-gray-700 mb-6">Acessar minha conta</h2>
<form id="login-form" novalidate>
    <div class="space-y-6">
        <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="email" name="email" type="email" required class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm" placeholder="voce@exemplo.com" />
        </div>
        <div>
            <div class="flex items-center justify-between">
                <label for="password" class="block text-sm font-medium text-gray-700">Senha</label>
                <a href="#" id="forgot-password-link" class="text-sm font-medium text-green-600 hover:text-green-500 transition">Esqueceu a senha?</a>
            </div>
            <input id="password" name="password" type="password" required class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm" placeholder="Sua senha" />
        </div>
        <div>
            <button type="submit" class="w-full flex justify-center py-3 px-4 border-transparent rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700">Entrar</button>
        </div>
    </div>
</form>
<div class="mt-6 flex items-center">
    <div class="flex-grow border-t border-gray-300"></div>
    <span class="flex-shrink mx-4 text-gray-400 text-sm">OU</span>
    <div class="flex-grow border-t border-gray-300"></div>
</div>
<button type="button" id="google-login-button" class="mt-6 w-full flex justify-center items-center py-3 px-4 rounded-lg font-medium 
    text-gray-700 bg-white border border-gray-300 shadow-sm 
    hover:bg-gray-100 hover:text-gray-800 
    dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 
    dark:hover:bg-gray-600 dark:hover:text-white">
    ${GoogleIconSVG}
    Login com Google
</button>
<p class="mt-8 text-center text-sm text-gray-600">Não tem uma conta?
    <button id="switch-to-signup" class="font-medium text-green-600 hover:text-green-500">Cadastre-se</button>
</p>`;
}

export function renderSignupFormHTML() {
    return `<h2 class="text-2xl font-semibold text-center text-gray-700 mb-6">Criar nova conta</h2>
<form id="signup-form" novalidate>
    <div class="space-y-6">
        <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input id="name" name="name" type="text" required class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm" placeholder="Seu nome" />
        </div>
        <div>
            <label for="email-signup" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="email-signup" name="email" type="email" required class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm" placeholder="voce@exemplo.com" />
        </div>
        <div>
            <label for="password-signup" class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input id="password-signup" name="password" type="password" required class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm" placeholder="Crie uma senha forte" />
        </div>
        <div>
            <button type="submit" class="w-full flex justify-center py-3 px-4 border-transparent rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700">Criar Conta</button>
        </div>
    </div>
</form>
<p class="mt-8 text-center text-sm text-gray-600">Já tem uma conta?
    <button id="switch-to-login" class="font-medium text-green-600 hover:text-green-500">Faça login</button>
</p>`;
}

function renderSignupSuccessHTML() {
    return `
    <div class="text-center animate-fade-in">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
        </div>
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Verifique seu Email</h2>
        <div class="text-gray-600 mb-8 space-y-2">
            <p>Enviamos um link de confirmação para o seu endereço de email.</p>
            <p class="text-sm bg-yellow-50 text-yellow-800 p-3 rounded-lg border border-yellow-200">
                <strong>Atenção:</strong> Caso não encontre o email na caixa de entrada, verifique também sua pasta de <strong>Spam</strong> ou <strong>Lixo Eletrônico</strong>.
            </p>
            <p>Por favor, volte ao login após a confirmação.</p>
        </div>
        <button id="back-to-login-success-button" class="w-full py-3 px-4 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition shadow-md">
            Voltar para Login
        </button>
    </div>`;
}

export function renderForgotPasswordFormHTML() {
    return `<h2 class="text-2xl font-semibold text-center text-gray-700 mb-6">Recuperar Senha</h2>
    <p class="text-gray-600 text-center mb-6 text-sm">Insira seu email para receber o link de redefinição.</p>
    <form id="reset-password-form" novalidate>
        <div class="space-y-6">
            <div>
                <label for="email-reset" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input id="email-reset" name="email" type="email" required class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm" placeholder="voce@exemplo.com" />
            </div>
            <div>
                <button type="submit" class="w-full flex justify-center py-3 px-4 border-transparent rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700">Enviar Link</button>
            </div>
        </div>
    </form>
    <p class="mt-8 text-center text-sm text-gray-600">
        Lembrou a senha?
        <button id="back-to-login-link" class="font-medium text-green-600 hover:text-green-500">Voltar ao Login</button>
    </p>`;
}

export function renderForgotPasswordSuccessHTML() {
    return `
    <div class="text-center animate-fade-in">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
            <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
        </div>
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Email Enviado!</h2>
        <div class="text-gray-600 mb-8 space-y-2">
            <p>Se houver uma conta associada a este endereço, enviamos as instruções de recuperação.</p>
            <p class="text-sm bg-yellow-50 text-yellow-800 p-3 rounded-lg border border-yellow-200">
                <strong>Dica:</strong> Verifique também sua pasta de <strong>Spam</strong> ou <strong>Lixo Eletrônico</strong>.
            </p>
        </div>
        <button id="back-to-login-success-button" class="w-full py-3 px-4 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition shadow-md">
            Voltar para Login
        </button>
    </div>`;
}

export function renderFamilyOnboardingPage() {
    let userFamiliesHTML = `<p class="text-center text-gray-500 p-4">Você ainda não faz parte de nenhuma família.</p>`;
    if (state.userFamilies.length > 0) {
        userFamiliesHTML = state.userFamilies.map(fam => `<div class="flex items-center justify-between p-4 border rounded-lg">
    <div>
        <p class="font-semibold text-gray-800">${fam.name}</p>
    </div>
    <button data-family-id="${fam.id}" class="select-family-button px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">Acessar</button>
</div>`).join('');
    }
    return `<div class="w-full max-w-4xl animate-fade-in p-4 mx-auto my-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-8 text-center">Bem-vindo(a), ${state.user.name}!</h1>
    <div class="grid md:grid-cols-2 gap-8">
        <div class="bg-white p-8 rounded-2xl shadow-lg">
            <h2 class="text-xl font-semibold text-gray-700 mb-4">Crie uma nova família</h2>
            <form id="create-family-form">
                <label for="familyName" class="block text-sm font-medium text-gray-700 mb-1">Nome da Família</label>
                <input id="familyName" name="familyName" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Ex: Família Silva" />
                <button type="submit" class="mt-4 w-full py-3 px-4 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700">Criar Família</button>
            </form>
        </div>
        <div class="bg-white p-8 rounded-2xl shadow-lg">
    <h2 class="text-xl font-semibold text-gray-700 mb-4">Ingresse em uma família</h2>
    <form id="join-family-form">
        <label for="inviteCode" class="block text-sm font-medium text-gray-700 mb-1">Código de Convite</label>
        <input id="inviteCode" name="inviteCode" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg uppercase" placeholder="INSIRA O CÓDIGO" />
        
        ${state.joinRequestMessage ? `<p class="mt-2 text-sm text-amber-600 font-medium animate-fade-in">${state.joinRequestMessage}</p>` : ''}
        
        <button type="submit" class="mt-4 w-full py-3 px-4 rounded-lg font-medium text-white bg-gray-700 hover:bg-gray-800">Solicitar Entrada</button>
    </form>
</div>
    </div>
    <div class="mt-8 bg-white p-8 rounded-2xl shadow-lg">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">Acesse uma de suas famílias</h2>
        <div class="space-y-4">
            ${userFamiliesHTML}
        </div>
    </div>
</div>`;
}

export function renderTransactionModal() {
    const isEditing = state.editingTransactionId !== null;
    if (!state.isModalOpen || (state.modalView !== 'transaction' && state.modalView !== 'newTag')) return '';

    const transaction = isEditing ? state.transactions.find(t => t.id === state.editingTransactionId) : null;
    
    // Proteção contra exclusão em tempo real
    if (isEditing && !transaction) return ''; 

    const type = isEditing ? transaction.type : state.modalTransactionType;
    const defaultCategories = (type === 'expense' ? CATEGORIES.expense : CATEGORIES.income);
    const customCategories = state.userCategories[type] || [];
    const allCategories = [...defaultCategories, ...customCategories];
    
    // Verifica se é Admin
    const isAdmin = state.familyAdmins.includes(state.user.uid);

    // 1. Adiciona um Placeholder para forçar o evento 'change'
    let categoryOptions = `<option value="" disabled ${!transaction?.category ? 'selected' : ''}>Selecione uma categoria...</option>`;
    
    // 2. Lista as categorias existentes
    allCategories.forEach(cat => {
        const isSelected = transaction?.category === cat ? 'selected' : '';
        categoryOptions += `<option value="${cat}" ${isSelected}>${cat}</option>`;
    });

    // 3. Adiciona a opção de Criar Nova APENAS se for Admin
    if (isAdmin) {
        categoryOptions += `<option value="--create-new--" class="font-bold text-green-600">+ ✨ Criar nova categoria</option>`;
    }

    const confirmDeleteHTML = state.confirmingDelete ? `<div class="mt-4 p-4 bg-red-100 rounded-lg text-center">
    <p class="text-red-700 mb-2">Tem certeza?</p>
    <button type="button" id="confirm-delete-yes" class="px-3 py-1 bg-red-600 text-white rounded-md mr-2">Sim</button>
    <button type="button" id="confirm-delete-no" class="px-3 py-1 bg-gray-300 rounded-md">Não</button>
</div>` : '';

    let linkOptions = '<option value="">Nenhum</option>';
    if (type === 'expense') {
        state.debts.forEach(d => {
            const selected = transaction?.linkedDebtId === d.id ? 'selected' : '';
            linkOptions += `<option value="debt:${d.id}" ${selected}>Dívida: ${d.name}</option>`;
        });
        state.installments.forEach(i => {
            const selected = transaction?.linkedInstallmentId === i.id ? 'selected' : '';
            linkOptions += `<option value="installment:${i.id}" ${selected}>Parcela: ${i.name}</option>`;
        });
    }

    let contentHTML = '';
    if (state.modalView === 'newTag') {
        const colorSwatches = PALETTE_COLORS.map(color => `<label class="cursor-pointer"><input type="radio" name="newTagColor" value="${color}" class="sr-only peer"><div class="w-8 h-8 rounded-full peer-checked:ring-2 ring-offset-2 ring-blue-500" style="background-color: ${color};"></div></label>`).join('');
        contentHTML = `<h3 class="text-lg font-semibold text-gray-700 mb-4">Criar Nova Categoria</h3><form id="create-tag-form"><div class="mb-4"><label for="newTagName" class="block text-sm font-medium text-gray-700 mb-1">Nome</label><input id="newTagName" name="newTagName" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg" required /></div><div class="mb-4"><label class="block text-sm font-medium text-gray-700 mb-2">Cor</label><div class="flex flex-wrap gap-3">${colorSwatches}</div></div><div class="mt-6 flex justify-end gap-2"><button type="button" id="cancel-tag-creation" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg">Cancelar</button><button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg">Salvar</button></div></form>`;
    } else {
        const deleteButtonHTML = isEditing ? `<button type="button" id="delete-transaction-button" class="px-4 py-3 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700">Excluir</button>` : '';
        const typeSelectorHTML = `<div class="flex gap-2 mb-6"><button type="button" data-type="expense" class="transaction-type-button flex-1 py-3 px-4 rounded-lg font-medium ${type === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}">Despesa</button><button type="button" data-type="income" class="transaction-type-button flex-1 py-3 px-4 rounded-lg font-medium ${type === 'income' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}">Receita</button></div>`;

        contentHTML = `
            <form id="${isEditing ? 'edit' : 'add'}-transaction-form">
                ${typeSelectorHTML}
                <div class="space-y-4">
                    <div><label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label><input name="description" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg" value="${transaction?.description || ''}" required /></div>
                    <div class="grid grid-cols-3 gap-4">
                        <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label><select id="category" name="category" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white">${categoryOptions}</select></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Valor</label><input name="amount" type="number" step="0.01" class="w-full px-4 py-3 border border-gray-300 rounded-lg" value="${transaction?.amount || ''}" required /></div>
                    </div>
                    <div><label class="block text-sm font-medium text-gray-700 mb-1">Data</label><input name="date" type="date" value="${transaction?.date || new Date().toISOString().slice(0, 10)}" class="w-full px-4 py-3 border border-gray-300 rounded-lg" required /></div>
                    ${type === 'expense' ? `<div><label class="block text-sm font-medium text-gray-700 mb-1">Vincular a (Opcional)</label><select name="linkedEntity" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white">${linkOptions}</select></div>` : ''}
                </div>
                <div class="mt-8 flex gap-2">
                    ${deleteButtonHTML}
                    <button type="submit" class="w-full py-3 px-4 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700">${isEditing ? 'Salvar' : 'Adicionar'}</button>
                </div>
                ${confirmDeleteHTML}
            </form>`;
    }

    return `<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay p-4"><div class="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 modal-content"><div class="flex justify-between items-center mb-6"><h2 class="text-2xl font-semibold text-gray-700">${isEditing ? 'Editar' : 'Nova'} Transação</h2><button id="close-modal-button" class="p-2 rounded-full hover:bg-gray-200 transition"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div>${contentHTML}</div></div>`;
}

export function renderBudgetModal() {
    const isEditing = state.editingBudgetItemId !== null;
    if (!state.isModalOpen || state.modalView !== 'budget') return '';

    const budget = isEditing ? state.budgets.find(b => b.id === state.editingBudgetItemId) : null;
    const type = budget?.type || 'expense';
    const allIncomeCategories = [...CATEGORIES.income, ...(state.userCategories.income || [])];
    const allExpenseCategories = [...CATEGORIES.expense, ...(state.userCategories.expense || [])];
    const incomeOptions = allIncomeCategories.map(c => `<option value="${c}" ${budget?.category === c ? 'selected' : ''}>${c}</option>`).join('');
    const expenseOptions = allExpenseCategories.map(c => `<option value="${c}" ${budget?.category === c ? 'selected' : ''}>${c}</option>`).join('');
    const deleteButtonHTML = isEditing ? `<button type="button" id="delete-budget-button" class="px-4 py-3 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700">Excluir</button>` : '';
    const confirmDeleteHTML = state.confirmingDelete ? `<div class="mt-4 p-4 bg-red-100 rounded-lg text-center">
    <p class="text-red-700 mb-2">Tem certeza?</p>
    <button type="button" id="confirm-delete-yes" class="px-3 py-1 bg-red-600 text-white rounded-md mr-2">Sim</button>
    <button type="button" id="confirm-delete-no" class="px-3 py-1 bg-gray-300 rounded-md">Não</button>
</div>` : '';

    return `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay p-4">
            <div class="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 modal-content">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-semibold text-gray-700">${isEditing ? 'Editar' : 'Criar'} Orçamento</h2>
                    <button id="close-modal-button" class="p-2 rounded-full hover:bg-gray-200 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <form id="budget-form">
                    <div class="space-y-4">
                        <div>
                            <label for="budgetName" class="block text-sm font-medium text-gray-700 mb-1">Nome do Orçamento</label>
                            <input id="budgetName" name="budgetName" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg" value="${budget?.name || ''}" placeholder="Ex: Teto com Comida" required />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select id="budgetType" name="budgetType" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white">
                                <option value="expense" ${type === 'expense' ? 'selected' : ''}>Limite de Despesa</option>
                                <option value="income" ${type === 'income' ? 'selected' : ''}>Meta de Receita</option>
                            </select>
                        </div>
                        <div id="budget-category-wrapper">
                            <label for="budgetCategory" class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                            <select id="budgetCategory" name="budgetCategory" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white">
                                ${type === 'expense' ? expenseOptions : incomeOptions}
                            </select>
                        </div>
                        <div>
                            <label for="budgetValue" class="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                            <input id="budgetValue" name="budgetValue" type="number" step="0.01" class="w-full px-4 py-3 border border-gray-300 rounded-lg" value="${budget?.value || ''}" placeholder="0,00" required />
                        </div>
                        <div class="flex items-center">
                            <input id="budgetRecurring" name="budgetRecurring" type="checkbox" class="h-4 w-4 text-green-600 border-gray-300 rounded" ${budget?.recurring ?? true ? 'checked' : ''}>
                            <label for="budgetRecurring" class="ml-2 block text-sm text-gray-700">Repetir para os meses futuros</label>
                        </div>
                    </div>
                    <div class="mt-8 flex gap-2">
                        ${deleteButtonHTML}
                        <button type="submit" class="w-full py-3 px-4 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700">${isEditing ? 'Salvar Alterações' : 'Criar Orçamento'}</button>
                    </div>
                    ${confirmDeleteHTML}
                </form>
            </div>
        </div>`;
}

export function renderFamilyInfoModal() {
    if (!state.isModalOpen || state.modalView !== 'familyInfo') return '';
    const isAdmin = state.familyAdmins.includes(state.user.uid);
    const memberListHTML = state.familyMembers.map(member => {
        const isMemberAdmin = state.familyAdmins.includes(member.uid);
        const isCurrentUser = member.uid === state.user.uid;
        const dbName = member.name;
        const localName = isCurrentUser ? state.user.name : 'Anônimo';
        const finalName = dbName || localName;
        const displayName = isCurrentUser ? `${finalName} (você)` : finalName;
        const dbPhoto = member.photoURL;
        const localPhoto = isCurrentUser ? state.user.photoURL : null;
        const finalPhoto = dbPhoto || localPhoto;
        let avatarHTML = `<div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg mr-3 select-none">${finalName.charAt(0).toUpperCase()}</div>`;
        if (finalPhoto && finalPhoto.includes('|')) { const [emoji, bg] = finalPhoto.split('|'); avatarHTML = `<div class="h-10 w-10 rounded-full flex items-center justify-center text-xl mr-3 shadow-sm select-none" style="background-color: ${bg};">${emoji}</div>`; }
        else if (finalPhoto) { avatarHTML = `<img src="${finalPhoto}" class="h-10 w-10 rounded-full mr-3 shadow-sm select-none object-cover" />`; }
        const memberBalance = state.transactions.filter(t => t.userId === member.uid).reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
        const balanceColor = memberBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
        const adminTag = isMemberAdmin ? `<span class="ml-2 bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-700">Admin</span>` : '';
        let actionButtons = '';
        if (isAdmin && !isCurrentUser) {
            if (!isMemberAdmin) { actionButtons += `<button class="promote-member-btn p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition" title="Tornar Admin" data-uid="${member.uid}"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></button>`; }
            else { actionButtons += `<button class="demote-member-btn p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition" title="Remover Admin" data-uid="${member.uid}"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></button>`; }
            actionButtons += `<button class="kick-member-btn p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition" title="Remover da Família" data-uid="${member.uid}" data-name="${finalName}"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" /></svg></button>`;
        }
        return `<li class="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"><div class="flex items-center">${avatarHTML}<div><div class="flex items-center"><p class="font-semibold text-gray-800 dark:text-gray-200 text-sm">${displayName}</p>${adminTag}</div><p class="text-xs font-medium ${balanceColor}">R$ ${memberBalance.toFixed(2)}</p></div></div><div class="flex items-center gap-1">${actionButtons}</div></li>`;
    }).join('');
    const editNameButton = isAdmin ? `<button id="edit-family-name-btn" class="ml-2 text-gray-400 hover:text-blue-500 transition"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>` : '';
    const regenerateCodeButton = isAdmin ? `<button id="regenerate-code-btn" class="p-2 text-gray-500 hover:text-green-600 transition" title="Gerar novo código"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>` : '';
    const deleteFamilyButton = isAdmin ? `<button id="delete-family-button" class="w-full py-3 px-4 rounded-lg font-bold text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition mt-3 border border-red-200 dark:border-red-800">Excluir Família (Permanente)</button>` : '';

    return `<div class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 modal-overlay p-4 backdrop-blur-sm"><div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden modal-content dark:bg-gray-800 flex flex-col"><div class="p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-start"><div class="w-full"><p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Gerenciar Família</p><div id="family-name-display" class="flex items-center"><h2 id="family-name-text" class="text-2xl font-bold text-gray-800 dark:text-gray-100 truncate">${state.family.name}</h2>${editNameButton}</div><form id="family-name-edit" class="hidden flex items-center gap-2 w-full mt-1"><input id="edit-family-name-input" type="text" value="${state.family.name}" class="flex-1 px-2 py-1 text-lg border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" /><button type="submit" class="p-1 text-white bg-green-500 rounded hover:bg-green-600"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg></button><button type="button" id="cancel-name-edit" class="p-1 text-gray-500 bg-gray-200 rounded hover:bg-gray-300"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg></button></form></div><button id="close-modal-button" class="p-2 rounded-full hover:bg-gray-200 transition dark:hover:bg-gray-700 -mt-2 -mr-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500 dark:text-gray-400"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div><div class="p-6 overflow-y-auto custom-scrollbar flex-1"><div class="mb-6"><p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Código de Convite</p><div class="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg p-1 pl-4 border border-gray-200 dark:border-gray-600"><p class="text-xl font-mono font-bold text-gray-800 dark:text-gray-100 tracking-widest">${state.family.code}</p><div class="flex">${regenerateCodeButton}<button class="copy-code-btn p-2 text-gray-500 hover:text-blue-600 transition" title="Copiar">${CopyIconSVG}</button></div></div></div><div class="mb-6"><div class="flex justify-between items-end mb-2"><p class="text-sm font-medium text-gray-500 dark:text-gray-400">Membros (${state.familyMembers.length})</p></div><ul class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">${memberListHTML}</ul></div><div class="space-y-3 mt-4 pt-4 border-t dark:border-gray-700"><button id="switch-family-button" class="w-full py-3 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md transition flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>Trocar de Família</button><button id="leave-family-modal-button" class="w-full py-3 px-4 rounded-lg font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 dark:bg-gray-700 dark:text-red-400 dark:border-gray-600 dark:hover:bg-gray-600 transition">Sair da Família</button>${deleteFamilyButton}</div></div></div></div>`;
}

export function renderManageCategoriesModal() {
    if (!state.isModalOpen || state.modalView !== 'manageCategories') return '';

    const allExpenseCategories = [...(state.userCategories.expense || [])];

    const categoryListHTML = allExpenseCategories.map(cat => {
        const color = state.categoryColors[cat] || '#6B7280';
        return `
            <li class="bg-white flex justify-between items-center p-3">
                <div class="flex items-center">
                    <div class="w-4 h-4 rounded-full mr-2" style="background-color: ${color};"></div>
                    <span class="text-gray-800">${cat}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <button class="edit-category-button px-2 py-1 text-xs font-medium rounded-md transition bg-gray-200 text-gray-600 hover:bg-gray-300" data-category-name="${cat}">
                        Editar
                    </button>
                </div>
            </li>
        `;
    }).join('');

    return `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay p-4">
            <div class="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 modal-content dark:bg-gray-800">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-100">Gerenciar Categorias</h2>
                    <button id="close-modal-button" class="p-2 rounded-full hover:bg-gray-200 transition dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-700 dark:text-gray-300">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="space-y-4">
                    <ul class="rounded-lg overflow-hidden divide-y divide-gray-200 dark:divide-gray-600">
                        ${categoryListHTML}
                    </ul>
                    <button id="add-new-category-button" class="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-100 hover:border-green-500 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:border-green-500 transition">
                        + Adicionar Nova Categoria
                    </button>
                </div>
            </div>
        </div>
    `;
}

export function renderEditCategoryModal() {
    if (!state.isModalOpen || state.modalView !== 'editCategory') return '';

    const categoryName = state.editingCategory;
    const categoryColor = state.categoryColors[categoryName] || '#6B7280';
    
    const confirmDeleteHTML = state.confirmingDelete ? `<div class="mt-4 p-4 bg-red-100 rounded-lg text-center">
        <p class="text-red-700 mb-2">Tem certeza?</p>
        <button type="button" id="confirm-delete-yes" class="px-3 py-1 bg-red-600 text-white rounded-md mr-2">Sim</button>
        <button type="button" id="confirm-delete-no" class="px-3 py-1 bg-gray-300 rounded-md">Não</button>
    </div>` : '';
    
    const deleteButtonClass = state.confirmingDelete ? 'hidden' : '';

    return `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay p-4">
            <div class="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 modal-content dark:bg-gray-800">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-100">Editar Categoria</h2>
                    <button id="close-modal-button" class="p-2 rounded-full hover:bg-gray-200 transition dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-700 dark:text-gray-300">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <form id="edit-category-form" class="space-y-4">
                    <div>
                        <label for="category-name-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Categoria</label>
                        <input type="text" id="category-name-input" value="${categoryName}" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                    </div>
                    <div>
                        <label for="category-color-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor</label>
                        <input type="color" id="category-color-input" value="${categoryColor}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                    </div>
                    <div class="flex justify-between items-center pt-4 ${deleteButtonClass}">
                        <button type="button" id="delete-category-button" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition">
                            Excluir
                        </button>
                        <div class="space-x-2">
                            <button type="button" id="cancel-edit-button" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition">
                                Cancelar
                            </button>
                            <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition">
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                    ${confirmDeleteHTML}
                </form>
            </div>
        </div>
    `;
}

export function renderMainContent() {
    if (!state.family) return '';
    const activeClass = "border-green-500 text-green-600 dark:text-green-400";
    const inactiveClass = "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300";

    const navTabs = `<div class="mb-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
    <nav class="flex -mb-px space-x-8">
        <button data-view="dashboard" class="nav-tab ${state.currentView === 'dashboard' ? activeClass : inactiveClass} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors">Dashboard</button>
        <button data-view="records" class="nav-tab ${state.currentView === 'records' ? activeClass : inactiveClass} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors">Registros</button>
        <button data-view="budget" class="nav-tab ${state.currentView === 'budget' ? activeClass : inactiveClass} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors">Orçamento</button>
        <button data-view="debts" class="nav-tab ${state.currentView === 'debts' ? activeClass : inactiveClass} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors">Dívidas e Parcelas</button>
    </nav>
</div>`;

    let viewContent = '';
    if (state.currentView === 'dashboard') viewContent = renderFamilyDashboard();
    else if (state.currentView === 'records') viewContent = renderRecordsPage();
    else if (state.currentView === 'budget') viewContent = renderBudgetPage();
    else if (state.currentView === 'debts') viewContent = renderDebtsPage();

    // CORREÇÃO: Aplica a classe de animação apenas se state.shouldAnimate for true
    const animationClass = state.shouldAnimate ? 'content-fade-in' : '';

    return `<div class="w-full max-w-6xl mx-auto px-4 py-8">
        <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
                <button id="family-info-button" class="text-2xl font-bold text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-400 transition cursor-pointer flex items-center gap-2 group">
                    ${state.family.name}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-hover:text-green-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
                <p class="text-sm text-gray-500 dark:text-gray-400">Bem-vindo(a), ${state.user.name}!</p>
            </div>
            <button id="switch-family-header-button" class="mt-4 sm:mt-0 text-sm font-medium text-gray-600 hover:text-blue-600 transition bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                Trocar Família
            </button>
        </header>
        ${navTabs}
        <div id="view-content" class="${animationClass} min-h-[500px]">${viewContent}</div>
    </div>`;
}

export function renderDebtsPage() {
    const isAdmin = state.familyAdmins.includes(state.user.uid);
    
    const debtsHTML = state.debts.map(d => {
        const canEdit = isAdmin || d.userId === state.user.uid;
        const memberName = state.familyMembers.find(m => m.uid === d.debtorId)?.name || 'Desconhecido';
        const paid = state.transactions.filter(t => t.linkedDebtId === d.id && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const progress = Math.min((paid / d.totalValue) * 100, 100);
        let status = 'Pendente'; let statusColor = 'bg-yellow-100 text-yellow-800';
        if (paid >= d.totalValue) { status = 'Pago'; statusColor = 'bg-green-100 text-green-800'; }
        else if (d.dueDate && new Date(d.dueDate) < new Date()) { status = 'Atrasado'; statusColor = 'bg-red-100 text-red-800'; }
        const editBtn = canEdit ? `<button class="edit-debt-btn text-gray-400 hover:text-blue-500" data-id="${d.id}"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>` : '';
        return `<div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-100 dark:border-gray-700"><div class="flex justify-between items-start mb-2"><div><h4 class="font-bold text-gray-800 dark:text-gray-100">${d.name}</h4><p class="text-xs text-gray-500 dark:text-gray-400">Devedor: ${memberName}</p></div>${editBtn}</div><div class="mb-2"><div class="flex justify-between text-xs mb-1 text-gray-600 dark:text-gray-300"><span>Pago: R$ ${paid.toFixed(2)}</span><span>Total: R$ ${d.totalValue.toFixed(2)}</span></div><div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700"><div class="bg-blue-600 h-2.5 rounded-full" style="width: ${progress}%"></div></div></div><div class="flex justify-between items-center mt-3"><span class="text-xs px-2 py-1 rounded-full ${statusColor}">${status}</span>${d.dueDate ? `<span class="text-xs text-gray-500">Vence: ${new Date(d.dueDate).toLocaleDateString('pt-BR')}</span>` : ''}</div></div>`;
    }).join('') || '<p class="text-gray-500 text-sm col-span-full text-center py-4">Nenhuma dívida cadastrada.</p>';

    const installmentsHTML = state.installments.map(i => {
        const canEdit = isAdmin || i.userId === state.user.uid;
        const memberName = state.familyMembers.find(m => m.uid === i.debtorId)?.name || 'Desconhecido';
        
        const linkedTrans = state.transactions.filter(t => t.linkedInstallmentId === i.id);
        const paidCount = linkedTrans.length;
        
        let lastPaidText = "Nenhuma";
        if (paidCount > 0) {
            linkedTrans.sort((a, b) => new Date(b.date) - new Date(a.date));
            const lastDate = new Date(linkedTrans[0].date + 'T12:00:00');
            lastPaidText = lastDate.toLocaleString('pt-BR', { month: 'short', year: 'numeric' });
        }

        const progress = Math.min((paidCount / i.installmentsCount) * 100, 100);
        const editBtn = canEdit ? `<button class="edit-installment-btn text-gray-400 hover:text-blue-500" data-id="${i.id}"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>` : '';

        return `
        <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-100 dark:border-gray-700">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h4 class="font-bold text-gray-800 dark:text-gray-100">${i.name}</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Devedor: ${memberName}</p>
                </div>
                ${editBtn}
            </div>
            <div class="grid grid-cols-2 gap-2 mb-3">
                <div class="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <p class="text-xs text-gray-500">Parcelas</p>
                    <p class="font-bold text-gray-800 dark:text-gray-200">${paidCount}/${i.installmentsCount}</p>
                </div>
                <div class="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <p class="text-xs text-gray-500">Valor/Mês</p>
                    <p class="font-bold text-gray-800 dark:text-gray-200">R$ ${i.valuePerInstallment.toFixed(2)}</p>
                </div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2 relative overflow-hidden">
                <div class="bg-purple-600 h-2.5 rounded-full" style="width: ${progress}%"></div>
            </div>
            
            <div class="flex justify-between items-center mt-2">
                <p class="text-xs text-gray-500 dark:text-gray-400">
                    Última paga: <span class="font-medium text-gray-700 dark:text-gray-300 capitalize">${lastPaidText}</span>
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                    Vence dia: ${i.dueDay}
                </p>
            </div>
        </div>`;
    }).join('') || '<p class="text-gray-500 text-sm col-span-full text-center py-4">Nenhum parcelamento cadastrado.</p>';

    // REMOVIDO animate-fade-in DA DIV ABAIXO
    return `
    <div class="grid md:grid-cols-2 gap-8">
        <div>
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-gray-700 dark:text-gray-200">Dívidas</h3>
                <button id="add-debt-btn" class="text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition font-medium">+ Nova Dívida</button>
            </div>
            <div class="grid gap-4">${debtsHTML}</div>
        </div>

        <div>
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-gray-700 dark:text-gray-200">Parcelamentos</h3>
                <button id="add-installment-btn" class="text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 transition font-medium">+ Novo Parcelamento</button>
            </div>
            <div class="grid gap-4">${installmentsHTML}</div>
        </div>
    </div>`;
}

export function renderDebtModal() {
    if (!state.isModalOpen || state.modalView !== 'debt') return '';
    const d = state.editingDebtId ? state.debts.find(i => i.id === state.editingDebtId) : null;
    const deleteBtn = state.editingDebtId ? `<button type="button" id="delete-debt-modal-btn" class="px-4 py-3 rounded-lg bg-red-600 text-white font-medium">Excluir</button>` : '';
    
    const membersOptions = state.familyMembers.map(m => `<option value="${m.uid}" ${d?.debtorId === m.uid ? 'selected' : ''}>${m.name || 'Anônimo'}</option>`).join('');

    return `<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay p-4"><div class="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 modal-content"><div class="flex justify-between items-center mb-6"><h2 class="text-2xl font-semibold text-gray-700">${d ? 'Editar' : 'Nova'} Dívida</h2><button id="close-modal-button" class="p-2 rounded-full hover:bg-gray-200 transition"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div><form id="debt-form"><div class="space-y-4"><div><label class="block text-sm font-medium text-gray-700 mb-1">Nome da Dívida</label><input name="debtName" type="text" class="w-full px-4 py-3 border rounded-lg" value="${d?.name || ''}" required /></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Devedor</label><select name="debtorId" class="w-full px-4 py-3 border rounded-lg bg-white">${membersOptions}</select></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Valor Total (R$)</label><input name="debtTotalValue" type="number" step="0.01" class="w-full px-4 py-3 border rounded-lg" value="${d?.totalValue || ''}" required /></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Vencimento (Opcional)</label><input name="debtDueDate" type="date" class="w-full px-4 py-3 border rounded-lg" value="${d?.dueDate || ''}" /></div></div><div class="mt-8 flex gap-2">${deleteBtn}<button type="submit" class="w-full py-3 px-4 rounded-lg bg-green-600 text-white font-medium">Salvar</button></div></form></div></div>`;
}

export function renderInstallmentModal() {
    if (!state.isModalOpen || state.modalView !== 'installment') return '';
    const i = state.editingInstallmentId ? state.installments.find(x => x.id === state.editingInstallmentId) : null;
    const deleteBtn = state.editingInstallmentId ? `<button type="button" id="delete-installment-modal-btn" class="px-4 py-3 rounded-lg bg-red-600 text-white font-medium">Excluir</button>` : '';
    const membersOptions = state.familyMembers.map(m => `<option value="${m.uid}" ${i?.debtorId === m.uid ? 'selected' : ''}>${m.name || 'Anônimo'}</option>`).join('');

    return `<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay p-4"><div class="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 modal-content"><div class="flex justify-between items-center mb-6"><h2 class="text-2xl font-semibold text-gray-700">${i ? 'Editar' : 'Novo'} Parcelamento</h2><button id="close-modal-button" class="p-2 rounded-full hover:bg-gray-200 transition"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div><form id="installment-form"><div class="space-y-4"><div><label class="block text-sm font-medium text-gray-700 mb-1">Nome</label><input name="installmentName" type="text" class="w-full px-4 py-3 border rounded-lg" value="${i?.name || ''}" required /></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Devedor</label><select name="debtorId" class="w-full px-4 py-3 border rounded-lg bg-white">${membersOptions}</select></div><div class="grid grid-cols-2 gap-4"><div><label class="block text-sm font-medium text-gray-700 mb-1">Qtd. Parcelas</label><input name="installmentsCount" type="number" class="w-full px-4 py-3 border rounded-lg" value="${i?.installmentsCount || ''}" required /></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Valor/Mês</label><input name="valuePerInstallment" type="number" step="0.01" class="w-full px-4 py-3 border rounded-lg" value="${i?.valuePerInstallment || ''}" required /></div></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Dia de Vencimento</label><input name="dueDay" type="number" min="1" max="31" class="w-full px-4 py-3 border rounded-lg" value="${i?.dueDay || ''}" required /></div></div><div class="mt-8 flex gap-2">${deleteBtn}<button type="submit" class="w-full py-3 px-4 rounded-lg bg-green-600 text-white font-medium">Salvar</button></div></form></div></div>`;
}

export function renderFamilyDashboard() {
    const month = state.displayedMonth.getMonth(); const year = state.displayedMonth.getFullYear();
    const monthName = state.displayedMonth.toLocaleString('pt-BR', { month: 'long' });
    const monthlyTransactions = state.transactions.filter(t => new Date(t.date + 'T12:00:00').getMonth() === month && new Date(t.date + 'T12:00:00').getFullYear() === year);
    const summary = monthlyTransactions.reduce((acc, t) => { if (t.type === 'income') acc.income += t.amount; else acc.expenses += t.amount; return acc; }, { income: 0, expenses: 0 });
    summary.balance = summary.income - summary.expenses;
    const activeExpenseBudgets = state.budgets.filter(b => b.type === 'expense' && new Date(b.appliesFrom) <= state.displayedMonth && (!b.appliesTo || new Date(b.appliesTo) >= state.displayedMonth));
    const totalBudget = activeExpenseBudgets.reduce((sum, b) => sum + b.value, 0);
    const totalSpentInBudgets = activeExpenseBudgets.reduce((acc, b) => {
        const spent = monthlyTransactions.filter(t => t.type === 'expense' && t.category === b.category).reduce((sum, t) => sum + t.amount, 0);
        return acc + spent;
    }, 0);
    const isAdmin = state.familyAdmins.includes(state.user.uid);
    const manageCategoriesButton = isAdmin ? `<button id="manage-categories-button" class="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition">Gerenciar Categorias</button>` : '';

    return `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"><div class="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500"><p class="text-sm text-gray-500">Receita</p><p class="text-2xl font-bold text-green-600">R$ ${summary.income.toFixed(2)}</p></div><div class="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-red-500"><p class="text-sm text-gray-500">Despesa</p><p class="text-2xl font-bold text-red-600">R$ ${summary.expenses.toFixed(2)}</p></div><div class="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500"><p class="text-sm text-gray-500">Saldo</p><p class="text-2xl font-bold text-blue-600">R$ ${summary.balance.toFixed(2)}</p></div><div class="bg-white p-6 rounded-2xl shadow-lg flex flex-col justify-center items-center text-center"><h3 class="font-semibold text-gray-700">Acesso Rápido</h3><button id="details-button" class="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Ver Registros</button></div></div><div class="bg-white p-6 rounded-2xl shadow-lg mb-6"><div class="flex justify-between items-center"><button id="prev-month-chart-button" class="p-2 rounded-md hover:bg-gray-200 month-selector-text"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg></button><h3 class="text-lg font-semibold capitalize month-selector-text">${monthName} de ${year}</h3><button id="next-month-chart-button" class="p-2 rounded-md hover:bg-gray-200 month-selector-text"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg></button></div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in"><div class="bg-white p-6 rounded-2xl shadow-lg"><div class="flex justify-between items-center mb-4"><h3 class="text-lg font-semibold text-gray-700">Despesas por Categoria</h3>${manageCategoriesButton}</div><div class="h-80 relative"><canvas id="monthly-expenses-chart"></canvas><div id="monthly-expenses-chart-no-data" class="absolute inset-0 flex items-center justify-center text-center text-gray-500 text-sm hidden">Sem dados</div></div></div><div class="bg-white p-6 rounded-2xl shadow-lg"><div class="mb-4"><h3 class="text-lg font-semibold text-gray-700">Performance do Orçamento</h3><div class="flex justify-between text-xs text-gray-500 mt-1"><span>Total Planejado: <strong>R$ ${totalBudget.toFixed(2)}</strong></span><span>Total Gasto: <strong>R$ ${totalSpentInBudgets.toFixed(2)}</strong></span></div></div><div class="h-80 relative"><canvas id="budget-performance-chart"></canvas><div id="budget-performance-chart-no-data" class="absolute inset-0 flex items-center justify-center text-center text-gray-500 text-sm hidden">Sem orçamentos definidos</div></div></div></div><div class="text-center mb-8"><button id="toggle-charts-button" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-full transition shadow flex items-center mx-auto gap-2"><span>Exibir mais gráficos</span><svg id="toggle-icon" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg></button></div><div id="secondary-charts-container" class="hidden grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in"><div class="bg-white p-6 rounded-2xl shadow-lg"><h3 class="text-lg font-semibold text-gray-700 mb-4">Balanço Anual (${year})</h3><div class="h-80 relative"><canvas id="annual-balance-chart"></canvas></div></div><div class="bg-white p-6 rounded-2xl shadow-lg"><h3 class="text-lg font-semibold text-gray-700 mb-4">Comparativo com Mês Anterior</h3><div class="h-80 relative"><canvas id="comparison-chart"></canvas></div></div><div class="bg-white p-6 rounded-2xl shadow-lg"><h3 class="text-lg font-semibold text-gray-700 mb-4">Saldo dos Membros</h3><div class="h-80 relative"><canvas id="person-spending-chart"></canvas><div id="person-spending-chart-no-data" class="absolute inset-0 flex items-center justify-center text-center text-gray-500 text-sm hidden">Sem dados</div></div></div><div class="bg-white p-6 rounded-2xl shadow-lg"><h3 class="text-lg font-semibold text-gray-700 mb-4">Evolução Diária de Gastos</h3><div class="h-80 relative"><canvas id="daily-evolution-chart"></canvas></div></div></div><div class="mt-8 bg-white p-6 rounded-2xl shadow-lg"><h3 class="text-lg font-semibold text-gray-700 mb-4">Código de Convite da Família</h3><div class="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-100 rounded-lg"><p class="text-2xl font-bold text-gray-800 tracking-widest mb-4 sm:mb-0">${state.family.code}</p><div class="flex gap-2"><button class="copy-code-btn px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-lg">Copiar Código</button><button id="share-link-button" class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg">Compartilhar Link</button></div></div></div>`;
}
export function renderRecordsPage() {
    const month = state.displayedMonth.getMonth(); const year = state.displayedMonth.getFullYear(); const monthName = state.displayedMonth.toLocaleString('pt-BR', { month: 'long' }); const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysWithTransactions = new Set(state.transactions.filter(t => { const tDate = new Date(t.date + 'T12:00:00'); return tDate.getMonth() === month && tDate.getFullYear() === year; }).map(t => new Date(t.date + 'T12:00:00').getDate()));
    let calendarDaysHTML = Array(firstDay).fill(`<div class="text-center p-2"></div>`).join('');
    for (let day = 1; day <= daysInMonth; day++) { const isSelected = state.selectedDate === day; const hasTransaction = daysWithTransactions.has(day); let dayClasses = 'text-gray-800'; if (isSelected) dayClasses = 'bg-blue-500 text-white'; else if (hasTransaction) dayClasses = 'bg-blue-500 bg-opacity-25 hover:bg-opacity-50 transition-opacity text-gray-800'; else dayClasses += ' hover:bg-gray-200'; calendarDaysHTML += `<div class="text-center p-1"><button data-day="${day}" class="calendar-day w-8 h-8 rounded-full ${dayClasses}">${day}</button></div>`; }
    const calendarHTML = `<div class="bg-white p-6 rounded-2xl shadow-lg mb-6"><div class="flex justify-between items-center mb-4"><button id="prev-month-button" class="p-2 rounded-md hover:bg-gray-200 month-selector-text"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg></button><h3 class="text-lg font-semibold capitalize month-selector-text">${monthName} de ${year}</h3><button id="next-month-button" class="p-2 rounded-md hover:bg-gray-200 month-selector-text"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg></button></div><div class="grid grid-cols-7 gap-1">${calendarDaysHTML}</div></div>`;
    const filtered = state.transactions.filter(t => { const transactionDate = new Date(t.date + 'T12:00:00'); const typeMatch = state.detailsFilterType === 'all' || t.type === state.detailsFilterType; const dateMatch = !state.selectedDate || transactionDate.getDate() === state.selectedDate; return typeMatch && dateMatch && transactionDate.getMonth() === month && transactionDate.getFullYear() === year; });
    const groupedByDate = filtered.reduce((acc, t) => { const day = new Date(t.date + 'T12:00:00').getDate(); if (!acc[day]) acc[day] = []; acc[day].push(t); return acc; }, {});
    const sortedDays = Object.keys(groupedByDate).sort((a, b) => b - a);
    const isAdmin = state.familyAdmins.includes(state.user.uid);
    let transactionsHTML = `<p class="text-center text-gray-500 py-8">Nenhuma transação encontrada.</p>`;
    if (sortedDays.length > 0) { transactionsHTML = sortedDays.map(day => { const transactionsForDay = groupedByDate[day].map(t => { const isOwner = t.userId === state.user.uid; const canEdit = isAdmin || isOwner; const interactClasses = canEdit ? 'transaction-item cursor-pointer' : 'cursor-default opacity-60'; const categoryColor = state.categoryColors[t.category] || '#6B7280'; return `<li class="${interactClasses} flex justify-between items-center py-3 px-2 -mx-2 rounded-lg" data-transaction-id="${t.id}"><div><p class="font-medium text-gray-800">${t.description}</p><div class="flex items-center mt-1"><p class="text-sm text-gray-500 mr-2">${t.userName || 'Desconhecido'}</p><span class="text-xs px-2 py-1 rounded-full text-white" style="background-color: ${categoryColor}">${t.category}</span></div></div><p class="font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}">${t.type === 'income' ? '+' : '-'} R$ ${t.amount.toFixed(2)}</p></li>`; }).join(''); return `<div class="mb-4"><div class="flex items-center justify-between pb-2 border-b"><p class="font-bold text-gray-700">${day} de ${monthName}</p></div><ul class="divide-y">${transactionsForDay}</ul></div>`; }).join(''); }
    const newButtonHTML = `<div class="flex justify-end mb-4"><button id="open-modal-button" class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg">Adicionar Transação</button></div>`;
    
    // REMOVIDO content-fade-in DA DIV ABAIXO
    return `<div id="records-page-container"><div class="grid grid-cols-1 lg:grid-cols-5 gap-6"><div class="lg:col-span-2">${calendarHTML}</div><div class="lg:col-span-3"><div class="bg-white p-6 rounded-2xl shadow-lg mb-6"><div class="flex items-center justify-center gap-4"><button data-filter="all" class="filter-button px-4 py-2 rounded-lg ${state.detailsFilterType === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 filter-button-inactive'}">Tudo</button><button data-filter="income" class="filter-button px-4 py-2 rounded-lg ${state.detailsFilterType === 'income' ? 'bg-green-500 text-white' : 'bg-gray-200 filter-button-inactive'}">Receitas</button><button data-filter="expense" class="filter-button px-4 py-2 rounded-lg ${state.detailsFilterType === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-200 filter-button-inactive'}">Despesas</button></div></div><div id="records-list-wrapper" class="bg-white rounded-2xl shadow-lg p-6">${newButtonHTML + transactionsHTML}</div></div></div></div>`;
}

export function renderBudgetPage() {
    const month = state.displayedMonth.getMonth(); const year = state.displayedMonth.getFullYear(); const monthName = state.displayedMonth.toLocaleString('pt-BR', { month: 'long' });
    const monthlyTransactions = state.transactions.filter(t => new Date(t.date + 'T12:00:00').getMonth() === month && new Date(t.date + 'T12:00:00').getFullYear() === year);
    const activeBudgets = state.budgets.filter(b => { const startDate = new Date(b.appliesFrom + 'T12:00:00'); const startYear = startDate.getUTCFullYear(); const startMonth = startDate.getUTCMonth(); const endDate = b.appliesTo ? new Date(b.appliesTo + 'T12:00:00') : null; const currentYear = state.displayedMonth.getFullYear(); const currentMonth = state.displayedMonth.getMonth(); const budgetStartsLater = startYear > currentYear || (startYear === currentYear && startMonth > currentMonth); if (budgetStartsLater) { return false; } if (b.recurring === false) { return startYear === currentYear && startMonth === currentMonth; } if (endDate) { const endYear = endDate.getUTCFullYear(); const endMonth = endDate.getUTCMonth(); const budgetEndsEarlier = endYear < currentYear || (endYear === currentYear && endMonth < currentMonth); if (budgetEndsEarlier) { return false; } } return true; });
    const isAdmin = state.familyAdmins.includes(state.user.uid);
    const budgetItemsHTML = activeBudgets.map(budget => { let progressHTML = ''; if(budget.type === 'expense') { const spent = monthlyTransactions.filter(t => t.type === 'expense' && t.category === budget.category).reduce((sum, t) => sum + t.amount, 0); const limit = budget.value; const percentage = limit > 0 ? (spent / limit) * 100 : 0; const barColor = percentage > 100 ? 'bg-red-500' : (percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'); progressHTML = `<div class="w-full bg-gray-200 rounded-full h-8 mt-2 relative overflow-hidden flex items-center"><div class="${barColor} h-8 rounded-full flex items-center justify-start pl-4" style="width: ${Math.min(percentage, 100)}%"></div><span class="absolute left-4 text-sm font-bold ${percentage > 50 ? 'text-white' : 'text-gray-800'}">${budget.name}</span></div><p class="text-xs text-right text-gray-500 mt-1">Gasto: R$ ${spent.toFixed(2)} de R$ ${limit.toFixed(2)}</p>`; } else { const earned = monthlyTransactions.filter(t => t.type === 'income' && t.category === budget.category).reduce((sum, t) => sum + t.amount, 0); const goal = budget.value; const percentage = goal > 0 ? (earned / goal) * 100 : 0; progressHTML = `<div class="w-full bg-gray-200 rounded-full h-8 mt-2 relative overflow-hidden flex items-center"><div class="bg-green-500 h-8 rounded-full flex items-center justify-start pl-4" style="width: ${Math.min(percentage, 100)}%"></div><span class="absolute left-4 text-sm font-bold ${percentage > 50 ? 'text-white' : 'text-gray-800'}">${budget.name}</span></div><p class="text-xs text-right text-gray-500 mt-1">Alcançado: R$ ${earned.toFixed(2)} de R$ ${goal.toFixed(2)}</p>`; } const interactionClasses = isAdmin ? 'budget-item cursor-pointer hover:bg-gray-100' : 'cursor-default'; return `<div class="${interactionClasses} p-4 border rounded-lg" data-budget-id="${budget.id}">${progressHTML}</div>`; }).join('');
    const addButtonHTML = isAdmin ? `<button id="add-budget-button" class="w-full p-4 border-2 border-dashed rounded-lg text-gray-500 hover:bg-gray-100 hover:border-green-500">+ Adicionar Novo Orçamento</button>` : '';
    
    // REMOVIDO content-fade-in DA TAG MAIN ABAIXO
    return `<main><div class="bg-white p-6 rounded-2xl shadow-lg mb-6"><div class="flex items-center justify-between"><button id="prev-month-button" class="p-2 rounded-md hover:bg-gray-200 month-selector-text"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg></button><span class="font-semibold capitalize month-selector-text">${monthName} de ${year}</span><button id="next-month-button" class="p-2 rounded-md hover:bg-gray-200 month-selector-text"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg></button></div></div><div class="bg-white p-6 rounded-2xl shadow-lg"><h3 class="text-lg font-semibold text-gray-700 mb-4">Orçamentos para ${monthName}</h3><div class="space-y-4">${budgetItemsHTML}${addButtonHTML}</div></div></main>`;
}

export function renderMonthlyChart() {
    const chartCanvas = document.getElementById('monthly-expenses-chart');
    const noDataElement = document.getElementById('monthly-expenses-chart-no-data');
    if (!chartCanvas || !noDataElement) return null;

    const month = state.displayedMonth.getMonth();
    const year = state.displayedMonth.getFullYear();
    const monthlyTransactions = state.transactions.filter(t => new Date(t.date + 'T12:00:00').getMonth() === month && new Date(t.date + 'T12:00:00').getFullYear() === year && t.type === 'expense');

    if (monthlyTransactions.length === 0) {
        chartCanvas.style.display = 'none';
        noDataElement.style.display = 'flex';
        noDataElement.innerHTML = `Ainda não foram registrados gastos para esse mês.`;
        return null;
    } else {
        chartCanvas.style.display = 'block';
        noDataElement.style.display = 'none';
    }

    const expenseData = monthlyTransactions.reduce((acc, t) => {
        const category = t.category || 'Outros';
        acc[category] = (acc[category] || 0) + t.amount;
        return acc;
    }, {});
    const labels = Object.keys(expenseData);
    const data = Object.values(expenseData);
    const colors = labels.map(label => state.categoryColors[label] || '#6B7280');
    const textColor = state.theme === 'dark' ? '#d1d5db' : '#374151';

    if (Chart.getChart(chartCanvas)) Chart.getChart(chartCanvas).destroy();

    return new Chart(chartCanvas.getContext('2d'), {
        type: 'doughnut', data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: state.theme === 'dark' ? '#1f2937' : '#f9fafb', borderWidth: 4 }] }, options: {
            responsive: true, maintainAspectRatio: false, plugins: {
                legend: { position: 'bottom', labels: { color: textColor } }, datalabels: {
                    formatter: (value, ctx) => {
                        const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? (value / total * 100).toFixed(0) + '%' : '0%';
                        return percentage;
                    }, color: '#fff', font: { weight: 'bold' }
                }
            }
        }
    });
}


export function renderAnnualChart() {
    const chartCanvas = document.getElementById('annual-balance-chart');
    if (!chartCanvas) return null;
    const currentYear = new Date().getFullYear();
    const annualData = { income: Array(12).fill(0), expense: Array(12).fill(0) };
    state.transactions.forEach(t => {
        const transactionDate = new Date(t.date + 'T12:00:00');
        if (transactionDate.getFullYear() === currentYear) {
            const month = transactionDate.getMonth();
            if (t.type === 'income') annualData.income[month] += t.amount;
            else annualData.expense[month] += t.amount;
        }
    });
    const textColor = state.theme === 'dark' ? '#d1d5db' : '#374151';

    return new Chart(chartCanvas.getContext('2d'), {
        type: 'bar', data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'], datasets: [
                { label: 'Receitas', data: annualData.income, backgroundColor: 'rgba(16, 185, 129, 0.6)' },
                { label: 'Despesas', data: annualData.expense, backgroundColor: 'rgba(239, 68, 68, 0.6)' }
            ]
        }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: textColor } }, datalabels: { display: false } }, scales: { x: { stacked: false, ticks: { color: textColor } }, y: { stacked: false, ticks: { color: textColor } } } }
    });
}

export function renderComparisonChart() {
    const chartCanvas = document.getElementById('comparison-chart');
    if (!chartCanvas) return null;
    const currentMonthDate = state.displayedMonth;
    const prevMonthDate = new Date(currentMonthDate);
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const getExpensesForMonth = (date) => state.transactions.filter(t => {
        const tDate = new Date(t.date + 'T12:00:00');
        return t.type === 'expense' && tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
    }).reduce((sum, t) => sum + t.amount, 0);
    const currentMonthExpenses = getExpensesForMonth(currentMonthDate);
    const prevMonthExpenses = getExpensesForMonth(prevMonthDate);
    const textColor = state.theme === 'dark' ? '#d1d5db' : '#374151';

    return new Chart(chartCanvas.getContext('2d'), {
        type: 'bar', data: {
            labels: [prevMonthDate.toLocaleString('pt-BR', { month: 'long' }), currentMonthDate.toLocaleString('pt-BR', { month: 'long' })],
            datasets: [{ label: 'Total de Despesas', data: [prevMonthExpenses, currentMonthExpenses], backgroundColor: ['rgba(107, 114, 128, 0.6)', 'rgba(239, 68, 68, 0.6)'] }]
        }, options: {
            responsive: true, maintainAspectRatio: false, plugins: {
                legend: { display: false }, datalabels: {
                    anchor: 'end', align: 'top', formatter: (value) => `R$ ${value.toFixed(2)}`, color: textColor, font: { weight: 'bold' }
                }
            }, scales: { x: { ticks: { color: textColor } }, y: { ticks: { color: textColor } } }
        }
    });
}

export function renderPersonSpendingChart() {
    const chartCanvas = document.getElementById('person-spending-chart');
    const noDataElement = document.getElementById('person-spending-chart-no-data');
    if (!chartCanvas || !noDataElement) return null;

    const month = state.displayedMonth.getMonth();
    const year = state.displayedMonth.getFullYear();
    
    // 1. Filtra transações
    const monthlyTransactions = state.transactions.filter(t => {
        const tDate = new Date(t.date + 'T12:00:00');
        return tDate.getMonth() === month && tDate.getFullYear() === year;
    });

    if (monthlyTransactions.length === 0) {
        chartCanvas.style.display = 'none';
        noDataElement.style.display = 'flex';
        noDataElement.innerHTML = `Sem movimentações neste mês.`;
        return null;
    } else {
        chartCanvas.style.display = 'block';
        noDataElement.style.display = 'none';
    }

    // 2. Prepara os dados
    const memberStats = {};
    
    state.familyMembers.forEach(m => {
        let icon = '👤';
        let color = '#9CA3AF'; 
        
        if (m.photoURL && m.photoURL.includes('|')) {
            const parts = m.photoURL.split('|');
            icon = parts[0];
            color = parts[1];
        } else if (m.photoURL) {
            icon = '📷'; 
        }
        
        memberStats[m.uid] = { 
            name: m.name.split(' ')[0], 
            icon: icon,
            color: color,
            income: 0, 
            expense: 0 
        };
    });

    monthlyTransactions.forEach(t => {
        const uid = t.userId;
        if (!memberStats[uid]) {
            memberStats[uid] = { name: 'Ex-membro', icon: '👻', color: '#9CA3AF', income: 0, expense: 0 };
        }
        if (t.type === 'income') memberStats[uid].income += t.amount;
        else memberStats[uid].expense += t.amount;
    });

    const incomes = [];
    const expenses = [];
    const balances = [];
    const userData = []; 

    Object.values(memberStats).forEach(s => {
        const balance = s.income - s.expense;
        incomes.push(s.income);
        expenses.push(s.expense);
        balances.push(balance);
        
        userData.push({ 
            name: s.name, 
            icon: s.icon, 
            color: s.color,
            balance: balance 
        });
    });

    const textColor = state.theme === 'dark' ? '#d1d5db' : '#374151';

    // 3. Plugin Customizado
    const avatarAxisPlugin = {
        id: 'avatarAxis',
        afterDraw: (chart) => {
            const { ctx, scales: { x } } = chart;
            
            x.ticks.forEach((tick, index) => {
                // Proteção para evitar erro se não tiver dados suficientes
                if (!chart.data.userData || !chart.data.userData[index]) return;

                const xPos = x.getPixelForTick(index);
                const yPos = x.bottom + 25; // Ajustado para baixo
                const user = chart.data.userData[index];

                // 1. Círculo
                ctx.beginPath();
                ctx.arc(xPos, yPos, 18, 0, 2 * Math.PI);
                ctx.fillStyle = user.color;
                ctx.fill();
                ctx.closePath();

                // 2. Emoji
                ctx.font = '20px Arial';
                ctx.fillStyle = '#FFFFFF';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(user.icon, xPos, yPos + 1);

                // 3. Nome
                ctx.font = 'bold 12px sans-serif';
                ctx.fillStyle = textColor;
                ctx.fillText(user.name, xPos, yPos + 30);

                // 4. Saldo
                const balanceFormatted = "Saldo: R$ " + user.balance.toFixed(2);
                ctx.font = 'normal 11px sans-serif';
                ctx.fillStyle = '#3B82F6'; // Azul
                ctx.fillText(balanceFormatted, xPos, yPos + 45);
            });
        }
    };

    if (Chart.getChart(chartCanvas)) Chart.getChart(chartCanvas).destroy();

    return new Chart(chartCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: userData.map(u => u.name), 
            userData: userData, // Passando dados para o plugin
            datasets: [
                {
                    label: 'Saldo',
                    data: balances,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)', 
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8
                },
                {
                    label: 'Receita',
                    data: incomes,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8
                },
                {
                    label: 'Despesa',
                    data: expenses,
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8
                }
            ]
        },
        plugins: [avatarAxisPlugin], 
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    // AUMENTADO PARA 80 PARA GARANTIR ESPAÇO
                    bottom: 80 
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: textColor }
                },
                x: {
                    ticks: { display: false }, 
                    grid: { display: false }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: textColor }
                },
                tooltip: {
                    callbacks: {
                        title: (context) => {
                            const index = context[0].dataIndex;
                            return context[0].chart.data.userData[index]?.name || '';
                        }
                    }
                },
                datalabels: { display: false }
            }
        }
    });
}

export function renderBudgetPerformanceChart() {
    const chartCanvas = document.getElementById('budget-performance-chart');
    const noDataElement = document.getElementById('budget-performance-chart-no-data');
    if (!chartCanvas || !noDataElement) return null;

    const activeBudgets = state.budgets.filter(b => b.type === 'expense' && new Date(b.appliesFrom) <= state.displayedMonth && (!b.appliesTo || new Date(b.appliesTo) >= state.displayedMonth));

    if (activeBudgets.length === 0) {
        chartCanvas.style.display = 'none';
        noDataElement.style.display = 'flex';
        noDataElement.innerText = "Nenhum orçamento definido para este mês.";
        return null;
    }

    chartCanvas.style.display = 'block';
    noDataElement.style.display = 'none';

    // Preparar dados
    const labels = [];
    const limits = [];
    const spentData = [];

    activeBudgets.forEach(budget => {
        labels.push(budget.name); // Nome do Orçamento
        limits.push(budget.value); // Valor Limite
        
        // Calcula quanto gastou nessa categoria neste mês
        const spent = state.transactions
            .filter(t => 
                t.type === 'expense' && 
                t.category === budget.category &&
                new Date(t.date + 'T12:00:00').getMonth() === state.displayedMonth.getMonth() &&
                new Date(t.date + 'T12:00:00').getFullYear() === state.displayedMonth.getFullYear()
            )
            .reduce((sum, t) => sum + t.amount, 0);
        
        spentData.push(spent);
    });

    const textColor = state.theme === 'dark' ? '#d1d5db' : '#374151';

    if (Chart.getChart(chartCanvas)) Chart.getChart(chartCanvas).destroy();

    return new Chart(chartCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Limite Definido',
                    data: limits,
                    backgroundColor: 'rgba(16, 185, 129, 0.6)', // Verde
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Gasto Atual',
                    data: spentData,
                    backgroundColor: 'rgba(239, 68, 68, 0.6)', // Vermelho
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { color: textColor } },
                x: { ticks: { color: textColor } }
            },
            plugins: {
                legend: { position: 'top', labels: { color: textColor } },
                tooltip: {
                    callbacks: {
                        label: (context) => `R$ ${context.raw.toFixed(2)}`
                    }
                },
                datalabels: { display: false } // Polui muito nesse gráfico
            }
        }
    });
}

// Função para o Gráfico de Evolução Diária (Linha)
export function renderDailyEvolutionChart() {
    const chartCanvas = document.getElementById('daily-evolution-chart');
    if (!chartCanvas) return null;

    const daysInMonth = new Date(state.displayedMonth.getFullYear(), state.displayedMonth.getMonth() + 1, 0).getDate();
    const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
    
    // Calcula gasto acumulado dia a dia
    let accumulated = 0;
    const dataPoints = days.map(day => {
        const spentOnDay = state.transactions
            .filter(t => {
                const d = new Date(t.date + 'T12:00:00');
                return t.type === 'expense' && 
                       d.getDate() === day && 
                       d.getMonth() === state.displayedMonth.getMonth() &&
                       d.getFullYear() === state.displayedMonth.getFullYear();
            })
            .reduce((sum, t) => sum + t.amount, 0);
        
        accumulated += spentOnDay;
        // Se o dia ainda não chegou (futuro), não mostra ponto no gráfico para não ficar uma linha reta no final
        const today = new Date();
        const currentCheckDate = new Date(state.displayedMonth.getFullYear(), state.displayedMonth.getMonth(), day);
        if (state.displayedMonth.getMonth() === today.getMonth() && state.displayedMonth.getFullYear() === today.getFullYear() && day > today.getDate()) {
            return null;
        }
        return accumulated;
    });

    const textColor = state.theme === 'dark' ? '#d1d5db' : '#374151';

    if (Chart.getChart(chartCanvas)) Chart.getChart(chartCanvas).destroy();

    return new Chart(chartCanvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Gasto Acumulado (Mês)',
                data: dataPoints,
                borderColor: '#3B82F6', // Azul
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4 // Linha curva suave
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { color: textColor } },
                x: { ticks: { color: textColor, maxTicksLimit: 10 } } // Limita labels no eixo X
            },
            plugins: {
                legend: { display: false },
                datalabels: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `Acumulado: R$ ${context.raw.toFixed(2)}`
                    }
                }
            }
        }
    });
}   

export function renderCharts() {
    const chartInstances = {};
    
    // Renderiza SEMPRE os principais
    chartInstances.monthly = renderMonthlyChart();
    chartInstances.budget = renderBudgetPerformanceChart(); // NOVO
    
    // Os gráficos secundários só são renderizados se o container estiver visível
    // (Isso será tratado no main.js, mas aqui deixamos a função pronta para destruir tudo)
    
    // Função auxiliar para renderizar os secundários sob demanda
    window.renderSecondaryCharts = () => {
        chartInstances.annual = renderAnnualChart();
        chartInstances.comparison = renderComparisonChart();
        chartInstances.personSpending = renderPersonSpendingChart();
        chartInstances.daily = renderDailyEvolutionChart(); // NOVO
    };

    const destroyAllCharts = () => {
        Object.values(chartInstances).forEach(chart => {
            if (chart) chart.destroy();
        });
        // Também destrói os secundários se foram criados via window
        const secIds = ['annual-balance-chart', 'comparison-chart', 'person-spending-chart', 'daily-evolution-chart'];
        secIds.forEach(id => {
            const canvas = document.getElementById(id);
            if(canvas && Chart.getChart(canvas)) Chart.getChart(canvas).destroy();
        });
    };

    return destroyAllCharts;
}

export function renderSettingsModal() {
    // 1. Proteção básica
    if (!state.user) return ''; 
    if (!state.isModalOpen || state.modalView !== 'settings') return '';

    // 2. Lógica do Avatar Atual
    let currentEmoji = '👤';
    let currentColor = '#10B981'; 
    if (state.user.photoURL && state.user.photoURL.includes('|')) {
        const parts = state.user.photoURL.split('|');
        currentEmoji = parts[0];
        currentColor = parts[1];
    }

    // 3. Listas de Emojis
    const primaryEmojis = ['👤', '🧑‍💼', '🦸', '🦄', '🚀', '🎨', '🎮', '💸'];
    const secondaryEmojis = [
        '🐶', '🐱', '🦊', '🦁', '🐸', '🦉', 
        '🌻', '🌵', '🌲', '🍄', '🌊', '🔥', 
        '🍔', '🍕', '🍦', '☕', '🍺', '🍿', 
        '⚽', '🏀', '🎸', '📷', '🚲', '✈️', 
        '💻', '📱', '💡', '📚', '✏️', '💼', 
        '⭐', '💎', '🛎️', '🗝️', '🎁', '🧸'
    ];

    const generateEmojiOptions = (emojiList) => emojiList.map(e => 
        `<label class="cursor-pointer">
            <input type="radio" name="avatarEmoji" value="${e}" class="sr-only peer/emoji" ${e === currentEmoji ? 'checked' : ''}>
            <div class="w-10 h-10 flex items-center justify-center text-xl rounded-lg border-2 border-transparent peer-checked/emoji:border-green-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                ${e}
            </div>
        </label>`
    ).join('');

    const primaryOptionsHTML = generateEmojiOptions(primaryEmojis);
    const secondaryOptionsHTML = generateEmojiOptions(secondaryEmojis);

    // 4. Seção de Seleção de Avatar (com "Mostrar Mais")
    const emojiSelectionSection = `
        <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex flex-wrap gap-2 mb-3">
                ${primaryOptionsHTML}
            </div>
            <input type="checkbox" id="toggle-more-emojis" class="sr-only peer/toggle">
            <label for="toggle-more-emojis" class="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 cursor-pointer flex items-center gap-1 font-medium select-none">
                <span class="block peer-checked/toggle:hidden">Mostrar mais opções</span>
                <span class="hidden peer-checked/toggle:block">Mostrar menos</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform peer-checked/toggle:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </label>
            <div class="hidden peer-checked/toggle:flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 animate-fade-in">
                ${secondaryOptionsHTML}
            </div>
        </div>
    `;

    // 5. Conteúdo Principal (Perfil + Senha)
    const profileContent = `
        <form id="update-profile-form" class="space-y-6 animate-fade-in">
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Escolha seu Avatar</label>
                ${emojiSelectionSection}
                <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cor de Fundo</label>
                    <div class="flex items-center gap-3">
                        <input type="color" name="avatarColor" value="${currentColor}" class="h-10 w-20 rounded cursor-pointer border-2 border-gray-300 dark:border-gray-600 p-1" title="Escolher cor">
                        <span class="text-sm text-gray-500 dark:text-gray-400">Clique para personalizar a cor</span>
                    </div>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome de Exibição</label>
                <input name="displayName" type="text" value="${state.user.name}" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" required />
            </div>
            <button type="submit" class="w-full py-3 px-4 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition shadow-sm font-bold">Salvar Perfil</button>
        </form>

        ${!state.user.isGoogle ? `
        <hr class="my-6 border-gray-200 dark:border-gray-600">
        <button id="toggle-password-btn" class="flex items-center justify-between w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition group">
            <span class="font-semibold text-gray-700 dark:text-gray-200">Alterar Senha</span>
            <svg id="password-chevron" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 transform transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
        <div id="password-form-container" class="hidden mt-4 animate-fade-in p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
            <form id="change-password-form" class="space-y-4">
                <input name="currentPassword" type="password" placeholder="Senha Atual" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" required />
                <input name="newPassword" type="password" placeholder="Nova Senha" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" required />
                <button type="submit" class="w-full py-2 px-4 rounded-lg font-medium text-white bg-gray-600 hover:bg-gray-700 transition">Atualizar Senha</button>
            </form>
        </div>` : ''}
    `;

    // 6. Estrutura do Modal (Simplificada, sem abas)
    return `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay p-4 backdrop-blur-sm">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden modal-content dark:bg-gray-800 flex flex-col">
                <div class="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Meu Perfil</h2>
                    <button id="close-modal-button" class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div id="settings-content" class="p-6 overflow-y-auto custom-scrollbar">
                    ${profileContent}
                </div>
            </div>
        </div>
    `;
}

export function renderConfirmationModal() {
    if (!state.confirmationModal.isOpen) return '';

    const { title, message, type } = state.confirmationModal;
    
    // Cores baseadas no tipo (danger = vermelho, info = azul/verde)
    const iconColor = type === 'danger' ? 'text-red-600 bg-red-100 dark:bg-red-900/30' : 'text-blue-600 bg-blue-100';
    const confirmBtnColor = type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700';
    const iconSvg = type === 'danger' 
        ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;

    return `
        <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] modal-overlay p-4 backdrop-blur-sm animate-fade-in">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100">
                <div class="flex items-center gap-4 mb-4">
                    <div class="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${iconColor}">
                        ${iconSvg}
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                        ${title}
                    </h3>
                </div>
                
                <div class="mt-2">
                    <p class="text-sm text-gray-500 dark:text-gray-300">
                        ${message}
                    </p>
                </div>

                <div class="mt-6 flex gap-3 justify-end">
                    <button id="confirm-modal-cancel" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                        Cancelar
                    </button>
                    <button id="confirm-modal-yes" class="px-4 py-2 rounded-lg text-sm font-medium text-white ${confirmBtnColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    `;
}

export function renderLoadingScreen() {
    return `
    <div class="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
        <div class="animate-bounce mb-4">
            ${GreenHiveLogoSVG('80')}
        </div>
        <div class="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
            <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Carregando...
        </div>
    </div>`;
}