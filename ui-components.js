import { state, CATEGORIES, PALETTE_COLORS } from "./state-and-handlers.js";

// --- 1. ÍCONES E LOGOTIPO ---

const GreenHiveLogoSVG = (height) => `
    <div class="flex items-center gap-2 select-none">
        <svg height="${height}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="text-brand-500">
            <path d="M50 5 L88 27 V73 L50 95 L12 73 V27 Z" fill="none" stroke="currentColor" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>
            <path d="M50 25 Q75 25 75 50 Q75 75 50 75 Q25 75 25 50 Q25 25 50 25" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
            <path d="M50 75 Q50 50 75 25" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
        </svg>
        <span class="font-heading font-bold text-gray-800 dark:text-white text-2xl tracking-tight">GreenHive</span>
    </div>`;

const Icons = {
    Bell: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
    Moon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    Sun: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
    Copy: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
    Google: `<svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>`,
    Close: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="6 6 18 18"/></svg>`,
    Spinner: `<svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`
};

// --- 2. COMPONENTES GLOBAIS (Loading e Header) ---

/*
export function renderLoadingScreen() {
    return `
    <div class="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
        <div class="animate-bounce mb-6 transform scale-125">
            ${GreenHiveLogoSVG('80')}
        </div>
        <div class="flex items-center gap-3 text-brand-600 dark:text-brand-400 font-heading font-medium text-lg">
            ${Icons.Spinner}
            Carregando sua colmeia...
        </div>
    </div>`;
}
*/

export function renderHeader() {
    if (!state.user) return '';

    // Notificações
    const hasUnread = state.notifications && state.notifications.some(n => !n.read);
    const badgeHTML = hasUnread ? `<span class="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-900 bg-brand-500 animate-pulse"></span>` : '';
    
    let notificationsListHTML = state.notifications.length > 0 
        ? state.notifications.map(notif => {
            // Define estilo do alerta
            let bgClass = 'bg-white dark:bg-gray-800';
            let borderClass = 'border-gray-100 dark:border-gray-700';
            let icon = '';
            
            if (['balance_alert', 'budget_alert', 'installment_alert'].includes(notif.type)) {
                if (notif.type === 'balance_alert') { bgClass = 'bg-red-50 dark:bg-red-900/20'; icon = '⚠️'; } 
                else if (notif.type === 'budget_alert') { bgClass = 'bg-yellow-50 dark:bg-yellow-900/20'; icon = '📉'; } 
                else { bgClass = 'bg-blue-50 dark:bg-blue-900/20'; icon = '📅'; }
            }
            
            // Destaque para não lidas
            const finalBg = !notif.read ? bgClass + ' border-l-4 border-brand-500' : bgClass;
            const content = notif.title ? 
                `<div class="flex gap-3"><span class="text-xl">${icon}</span><div><p class="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">${notif.title}</p><p class="text-xs text-gray-600 dark:text-gray-300">${notif.message}</p></div></div>` :
                `<p class="text-sm text-gray-800 dark:text-gray-200 pr-4 mb-2"><strong>${notif.senderName}</strong> ${notif.type === 'join_request' ? 'quer entrar na família' : 'aceitou seu convite'}.</p>`;

            // Botões de ação (se for convite)
            let actions = '';
            if (notif.type === 'join_request') {
                actions = `<div class="flex gap-2 mt-2"><button class="accept-request-btn px-3 py-1.5 text-xs font-bold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition" data-notif-id="${notif.id}">Aceitar</button><button class="reject-request-btn px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition" data-notif-id="${notif.id}">Recusar</button></div>`;
            } else if (notif.type === 'request_accepted') {
                actions = `<button class="enter-family-notif-btn w-full mt-2 px-3 py-1.5 text-xs font-bold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition" data-notif-id="${notif.id}">Entrar Agora</button>`;
            }

            return `
            <div class="p-4 border-b ${borderClass} ${finalBg} relative group transition hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                <button class="delete-notif-btn absolute top-2 right-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition" data-id="${notif.id}">&times;</button>
                ${content}
                ${actions}
            </div>`;
        }).join('') 
        : `<div class="p-8 text-center text-gray-400 text-sm font-medium flex flex-col items-center gap-2"><svg class="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>Tudo limpo por aqui!</div>`;

    // Avatar do Usuário
    let userAvatar = `<div class="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-300 flex items-center justify-center font-heading font-bold text-lg shadow-sm ring-2 ring-white dark:ring-gray-800 select-none">${state.user.name.charAt(0).toUpperCase()}</div>`;
    if (state.user.photoURL) { 
        if(state.user.photoURL.includes('|')) {
            const [emoji, bg] = state.user.photoURL.split('|'); 
            userAvatar = `<div class="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm ring-2 ring-white dark:ring-gray-800 select-none" style="background-color: ${bg};">${emoji}</div>`; 
        } else {
            userAvatar = `<img src="${state.user.photoURL}" class="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-white dark:ring-gray-800 select-none" />`; 
        }
    }
    
    const dropdownHTML = state.isNotificationMenuOpen ? `<div class="absolute right-0 mt-4 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-fade-in origin-top-right ring-1 ring-black/5"><div class="bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm px-4 py-3 border-b border-gray-100 dark:border-gray-700 font-heading font-bold text-gray-700 dark:text-gray-200 text-sm">Notificações</div><div class="max-h-96 overflow-y-auto custom-scrollbar">${notificationsListHTML}</div></div>` : '';

    return `
    <header class="sticky top-0 z-40 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800 transition-colors duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-20">
                <div class="flex items-center gap-3 hover:opacity-80 transition cursor-default">
                    ${GreenHiveLogoSVG('36')}
                </div>
                <div class="flex items-center gap-2 sm:gap-4">
                    <div class="relative">
                        <button id="notification-button" class="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all active:scale-95 focus:outline-none">
                            ${Icons.Bell}${badgeHTML}
                        </button>
                        ${dropdownHTML}
                    </div>
                    <button id="theme-toggle-button" class="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all active:scale-95 focus:outline-none">
                        ${state.theme === 'light' ? Icons.Moon : Icons.Sun}
                    </button>
                    <div class="relative pl-2">
                        <button id="user-menu-button" class="flex items-center gap-2 transition-transform active:scale-95 focus:outline-none">
                            ${userAvatar}
                        </button>
                        <div id="user-menu" class="hidden absolute right-0 mt-4 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 animate-fade-in origin-top-right z-50 ring-1 ring-black/5">
                            <div class="px-5 py-3 border-b border-gray-100 dark:border-gray-700 mb-2">
                                <p class="text-sm font-heading font-bold text-gray-800 dark:text-white truncate">${state.user.name}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">${state.user.email}</p>
                            </div>
                            <button id="open-settings-button" class="w-full text-left px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-3 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.29 1.52 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                Configurações
                            </button>
                            <div class="h-px bg-gray-100 dark:bg-gray-700 my-2 mx-4"></div>
                            <button id="logout-button" class="w-full text-left px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mb-1 flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                Sair da Conta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>`;
}

// --- 3. TELAS DE AUTENTICAÇÃO E ENTRADA ---

export function renderAuthPage() { 
    const content = state.authView === 'login' ? renderLoginFormHTML() : state.authView === 'signup' ? renderSignupFormHTML() : state.authView === 'forgot-password' ? renderForgotPasswordFormHTML() : state.authView === 'forgot-password-success' ? renderForgotPasswordSuccessHTML() : renderSignupSuccessHTML();
    
    return `<div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-100/50 via-transparent to-transparent dark:from-brand-900/20"></div>
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-2xl w-full max-w-md mx-auto border border-white/50 dark:border-gray-700 relative z-10 animate-fade-in">
            <div class="flex flex-col items-center mb-8 text-center">
                <div class="mb-4 transform scale-125">${GreenHiveLogoSVG('48')}</div>
                <p class="text-gray-500 dark:text-gray-400 font-medium mt-2">Sua colmeia financeira organizada.</p>
            </div>
            ${content}
        </div>
    </div>`; 
}

export function renderLoginFormHTML() { 
    return `<form id="login-form" class="space-y-5">
        <div><label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Email</label><input id="email" name="email" type="email" class="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition dark:text-white" placeholder="seu@email.com" required /></div>
        <div><div class="flex justify-between mb-1.5 ml-1"><label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Senha</label><button type="button" id="forgot-password-link" class="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">Esqueceu?</button></div><input id="password" name="password" type="password" class="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition dark:text-white" placeholder="••••••••" required /></div>
        <button type="submit" class="w-full py-3.5 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0">Entrar</button>
    </form>
    <div class="mt-6 flex items-center gap-4"><div class="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div><span class="text-xs text-gray-400 uppercase font-bold tracking-wider">Ou continue com</span><div class="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div></div>
    <button id="google-login-button" class="mt-6 w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-bold rounded-xl transition-all">${Icons.Google} Google</button>
    <p class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">Não tem conta? <button id="switch-to-signup" class="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400">Crie agora</button></p>`; 
}

export function renderSignupFormHTML() { 
    return `<form id="signup-form" class="space-y-5">
        <div><label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Nome</label><input id="name" name="name" type="text" class="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 transition dark:text-white" placeholder="Como te chamamos?" required /></div>
        <div><label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Email</label><input id="email-signup" name="email" type="email" class="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 transition dark:text-white" required /></div>
        <div><label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Senha</label><input id="password-signup" name="password" type="password" class="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 transition dark:text-white" placeholder="Mínimo 6 caracteres" required /></div>
        <button type="submit" class="w-full py-3.5 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all">Criar Conta</button>
    </form>
    <p class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">Já é membro? <button id="switch-to-login" class="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400">Fazer Login</button></p>`; 
}

export function renderSignupSuccessHTML() { return `<div class="text-center space-y-4"><div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400 mb-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div><h2 class="text-2xl font-heading font-bold text-gray-800 dark:text-white">Verifique seu Email</h2><p class="text-gray-600 dark:text-gray-300">Enviamos um link de confirmação para você. <br>Verifique também sua caixa de <strong>Spam</strong>.</p><button id="back-to-login-success-button" class="mt-6 w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-xl transition">Voltar para Login</button></div>`; }
export function renderForgotPasswordFormHTML() { return `<div class="text-center mb-6"><h2 class="text-2xl font-heading font-bold text-gray-800 dark:text-white">Recuperar Senha</h2><p class="text-sm text-gray-500 mt-2">Informe seu email para receber o link.</p></div><form id="reset-password-form"><div class="mb-6"><input name="email" type="email" class="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 transition dark:text-white" placeholder="seu@email.com" required /></div><button type="submit" class="w-full py-3.5 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all">Enviar Link</button></form><button id="back-to-login-link" class="mt-6 w-full text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Voltar</button>`; }
export function renderForgotPasswordSuccessHTML() { return `<div class="text-center"><div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400 mb-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></div><h2 class="text-2xl font-heading font-bold text-gray-800 dark:text-white mb-2">Email Enviado!</h2><p class="text-gray-600 dark:text-gray-300">Se a conta existir, você receberá o link em instantes.</p><button id="back-to-login-success-button" class="mt-8 w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-xl transition">Voltar para Login</button></div>`; }

export function renderFamilyOnboardingPage() {
    return `
    <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
         <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-brand-200/40 via-transparent to-transparent dark:from-brand-900/20"></div>
         <div class="w-full max-w-4xl relative z-10">
            <div class="text-center mb-12">
                <h1 class="text-4xl sm:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-4">Olá, ${state.user.name.split(' ')[0]}! 👋</h1>
                <p class="text-xl text-gray-500 dark:text-gray-400">Vamos organizar as finanças da sua casa?</p>
            </div>

            <div class="grid md:grid-cols-2 gap-8">
                <div class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 hover:border-brand-200 transition-colors group">
                    <div class="w-14 h-14 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center text-brand-600 mb-6 group-hover:scale-110 transition-transform">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                    </div>
                    <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">Criar nova família</h2>
                    <p class="text-gray-500 dark:text-gray-400 mb-6 text-sm">Comece do zero, defina as categorias e convide quem você quiser.</p>
                    <form id="create-family-form">
                        <input id="familyName" name="familyName" type="text" class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition dark:text-white mb-4" placeholder="Ex: Casa de Praia" required />
                        <button type="submit" class="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-all">Começar agora</button>
                    </form>
                </div>

                <div class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 transition-colors group">
                    <div class="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
                    </div>
                    <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">Já tenho um convite</h2>
                    <p class="text-gray-500 dark:text-gray-400 mb-6 text-sm">Cole o código de 6 dígitos que você recebeu para entrar.</p>
                    <form id="join-family-form">
                        <input id="inviteCode" name="inviteCode" type="text" class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition dark:text-white mb-4 uppercase tracking-widest font-mono text-center" placeholder="CÓDIGO" required maxlength="6" />
                        ${state.joinRequestMessage ? `<p class="mb-4 text-sm text-amber-600 font-medium text-center bg-amber-50 p-2 rounded-lg">${state.joinRequestMessage}</p>` : ''}
                        <button type="submit" class="w-full py-4 bg-white border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:text-blue-600 text-gray-700 dark:text-white font-bold rounded-xl transition-all">Solicitar Acesso</button>
                    </form>
                </div>
            </div>

            ${state.userFamilies.length > 0 ? `
            <div class="mt-12">
                <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Suas Famílias</h3>
                <div class="flex flex-wrap justify-center gap-4">
                    ${state.userFamilies.map(f => `
                    <button data-family-id="${f.id}" class="select-family-button flex items-center gap-3 px-6 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border border-gray-100 dark:border-gray-700 group">
                        <div class="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-600 flex items-center justify-center font-bold text-lg">${f.name.charAt(0)}</div>
                        <span class="font-heading font-bold text-gray-800 dark:text-white text-lg group-hover:text-brand-600 transition-colors">${f.name}</span>
                        <svg class="w-5 h-5 text-gray-300 group-hover:text-brand-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>`).join('')}
                </div>
            </div>` : ''}
         </div>
    </div>`;
}

// --- 4. DASHBOARD & ESTRUTURA PRINCIPAL ---

export function renderMainContent() {
    if (!state.family) return '';
    
    // Estilos das Abas (Pílulas Modernas)
    const activeClass = "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 shadow-sm ring-1 ring-brand-200 dark:ring-brand-800";
    const inactiveClass = "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50 transition-colors";

    const navTabs = `
    <div class="mb-8 overflow-x-auto pb-2 no-scrollbar">
        <nav class="flex space-x-2 p-1.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 w-max mx-auto sm:w-full sm:mx-0">
            <button data-view="dashboard" class="nav-tab ${state.currentView === 'dashboard' ? activeClass : inactiveClass} flex-1 py-2.5 px-6 rounded-xl text-sm font-heading font-bold transition-all duration-200 whitespace-nowrap">Dashboard</button>
            <button data-view="records" class="nav-tab ${state.currentView === 'records' ? activeClass : inactiveClass} flex-1 py-2.5 px-6 rounded-xl text-sm font-heading font-bold transition-all duration-200 whitespace-nowrap">Registros</button>
            <button data-view="budget" class="nav-tab ${state.currentView === 'budget' ? activeClass : inactiveClass} flex-1 py-2.5 px-6 rounded-xl text-sm font-heading font-bold transition-all duration-200 whitespace-nowrap">Orçamento</button>
            <button data-view="debts" class="nav-tab ${state.currentView === 'debts' ? activeClass : inactiveClass} flex-1 py-2.5 px-6 rounded-xl text-sm font-heading font-bold transition-all duration-200 whitespace-nowrap">Dívidas</button>
        </nav>
    </div>`;

    // Roteamento de Visualização
    let viewContent = '';
    if (state.currentView === 'dashboard') viewContent = renderFamilyDashboard();
    else if (state.currentView === 'records') viewContent = renderRecordsPage();
    else if (state.currentView === 'budget') viewContent = renderBudgetPage();
    else if (state.currentView === 'debts') viewContent = renderDebtsPage();

    // Animação condicional (só anima na troca de abas/entrada)
    const animationClass = state.shouldAnimate ? 'content-fade-in' : '';

    return `
    <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
                <button id="family-info-button" class="text-3xl font-heading font-bold text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition flex items-center gap-2 group">
                    ${state.family.name}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 group-hover:text-brand-500 transition opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Bem-vindo de volta, ${state.user.name.split(' ')[0]}! 👋</p>
            </div>
            
            <button id="switch-family-header-button" class="text-sm font-bold text-gray-600 hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-400 bg-white dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                Trocar Família
            </button>
        </div>

        ${navTabs}

        <div id="view-content" class="${animationClass} min-h-[500px]">
            ${viewContent}
        </div>
    </div>`;
}

export function renderFamilyDashboard() {
    const month = state.displayedMonth.getMonth(); const year = state.displayedMonth.getFullYear();
    const monthName = state.displayedMonth.toLocaleString('pt-BR', { month: 'long' });
    const monthlyTransactions = state.transactions.filter(t => new Date(t.date + 'T12:00:00').getMonth() === month && new Date(t.date + 'T12:00:00').getFullYear() === year);
    const summary = monthlyTransactions.reduce((acc, t) => { if (t.type === 'income') acc.income += t.amount; else acc.expenses += t.amount; return acc; }, { income: 0, expenses: 0 });
    summary.balance = summary.income - summary.expenses;
    const userTransactions = monthlyTransactions.filter(t => t.userId === state.user.uid);
    const userSummary = userTransactions.reduce((acc, t) => { if (t.type === 'income') acc.income += t.amount; else acc.expenses += t.amount; return acc; }, { income: 0, expenses: 0 });
    userSummary.balance = userSummary.income - userSummary.expenses;
    const activeExpenseBudgets = state.budgets.filter(b => b.type === 'expense' && new Date(b.appliesFrom) <= state.displayedMonth && (!b.appliesTo || new Date(b.appliesTo) >= state.displayedMonth));
    const totalBudget = activeExpenseBudgets.reduce((sum, b) => sum + b.value, 0);
    const totalSpentInBudgets = activeExpenseBudgets.reduce((acc, b) => { const spent = monthlyTransactions.filter(t => t.type === 'expense' && t.category === b.category).reduce((sum, t) => sum + t.amount, 0); return acc + spent; }, 0);
    const isAdmin = state.familyAdmins.includes(state.user.uid);
    const manageCategoriesButton = isAdmin ? `<button id="manage-categories-button" class="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition">Gerenciar</button>` : '';
    const cardBase = "bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-100/50 dark:border-gray-700/50";
    const titleClass = "text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2";
    const valueClass = "font-heading font-bold text-3xl sm:text-4xl tracking-tight mb-3";

    return `
    <div class="animate-fade-in space-y-8">
        
        <div class="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1.5 rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700 flex justify-between items-center max-w-sm mx-auto">
            <button id="prev-month-chart-button" class="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg></button>
            <h3 class="text-sm font-heading font-bold capitalize text-gray-800 dark:text-gray-100 select-none">${monthName} ${year}</h3>
            <button id="next-month-chart-button" class="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="flex flex-col gap-6 h-full"><div class="flex flex-col gap-4"><div class="${cardBase} relative overflow-hidden group"><div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">${Icons.Wallet}</div><p class="${titleClass}">Saldo da Família</p><p class="${valueClass} text-gray-900 dark:text-white">R$ ${summary.balance.toFixed(2)}</p><div class="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50"><div class="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-lg">🫵</div><div class="flex flex-col"><span class="text-[10px] font-bold text-gray-400 uppercase">Seu Saldo</span><span class="text-sm font-bold ${userSummary.balance >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-red-500'}">R$ ${userSummary.balance.toFixed(2)}</span></div></div></div><div class="grid grid-cols-2 gap-4"><div class="${cardBase} flex flex-col justify-center"><div class="flex items-center gap-2 mb-2"><div class="w-2 h-2 rounded-full bg-brand-500"></div><p class="${titleClass} !mb-0">Receita</p></div><p class="font-heading font-bold text-xl sm:text-2xl text-gray-800 dark:text-gray-100 truncate">R$ ${summary.income.toFixed(2)}</p><p class="text-xs text-gray-400 mt-1 font-medium">Você: <span class="text-brand-600 dark:text-brand-400">R$ ${userSummary.income.toFixed(2)}</span></p></div><div class="${cardBase} flex flex-col justify-center"><div class="flex items-center gap-2 mb-2"><div class="w-2 h-2 rounded-full bg-red-500"></div><p class="${titleClass} !mb-0">Despesa</p></div><p class="font-heading font-bold text-xl sm:text-2xl text-gray-800 dark:text-gray-100 truncate">R$ ${summary.expenses.toFixed(2)}</p><p class="text-xs text-gray-400 mt-1 font-medium">Você: <span class="text-red-500">R$ ${userSummary.expenses.toFixed(2)}</span></p></div></div></div><div class="${cardBase} flex-1 min-h-[300px] flex flex-col"><h3 class="text-lg font-heading font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2"><svg class="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>Saldo dos Membros</h3><div class="relative w-full flex-1 min-h-[250px]"><canvas id="person-spending-chart"></canvas><div id="person-spending-chart-no-data" class="absolute inset-0 flex items-center justify-center text-center text-gray-500 text-sm hidden">Sem dados neste mês</div></div></div></div><div class="flex flex-col gap-6 h-full"><div class="${cardBase} flex-1 min-h-[250px] flex flex-col"><div class="flex justify-between items-center mb-4"><h3 class="text-lg font-heading font-bold text-gray-800 dark:text-gray-100">Orçamento</h3><div class="flex gap-3 text-xs font-bold text-gray-400 uppercase bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-lg"><span>Meta: <span class="text-gray-600 dark:text-gray-300">R$ ${totalBudget.toFixed(0)}</span></span></div></div><div class="relative w-full flex-1 min-h-[200px]"><canvas id="budget-performance-chart"></canvas><div id="budget-performance-chart-no-data" class="absolute inset-0 flex items-center justify-center text-center text-gray-500 text-sm hidden">Sem orçamentos definidos</div></div></div><div class="${cardBase} flex-1 min-h-[250px] flex flex-col"><h3 class="text-lg font-heading font-bold text-gray-800 dark:text-gray-100 mb-4">Evolução Diária</h3><div class="relative w-full flex-1 min-h-[200px]"><canvas id="daily-evolution-chart"></canvas></div></div></div></div><div class="${cardBase}"><h3 class="text-lg font-heading font-bold text-gray-800 dark:text-gray-100 mb-6">Balanço Anual (${year})</h3><div class="h-72 relative w-full"><canvas id="annual-balance-chart"></canvas></div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="${cardBase}"><div class="flex justify-between items-center mb-6"><h3 class="text-lg font-heading font-bold text-gray-800 dark:text-gray-100">Por Categoria</h3>${manageCategoriesButton}</div><div class="h-64 relative w-full"><canvas id="monthly-expenses-chart"></canvas><div id="monthly-expenses-chart-no-data" class="absolute inset-0 flex items-center justify-center text-center text-gray-500 text-sm hidden">Sem dados</div></div></div><div class="${cardBase}"><h3 class="text-lg font-heading font-bold text-gray-800 dark:text-gray-100 mb-6">Comparativo Mês Anterior</h3><div class="h-64 relative w-full"><canvas id="comparison-chart"></canvas></div></div></div><div class="bg-gradient-to-r from-brand-500 to-brand-600 p-1 rounded-[2rem] shadow-lg shadow-brand-500/20"><div class="bg-white dark:bg-gray-900 rounded-[1.8rem] p-6 sm:p-8"><div class="flex flex-col sm:flex-row items-center justify-between gap-6"><div><h3 class="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-2">Convite da Família</h3><p class="text-4xl font-mono font-bold text-gray-900 dark:text-white tracking-widest">${state.family.code}</p><p class="text-sm text-gray-400 mt-1">Compartilhe este código para adicionar membros.</p></div><div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"><button class="copy-code-btn flex-1 sm:flex-none px-6 py-3.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 rounded-xl transition flex items-center justify-center gap-2">${Icons.Copy} Copiar</button><button id="share-link-button" class="flex-1 sm:flex-none px-6 py-3.5 text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2">Compartilhar Link</button></div></div></div></div></div>`;
}

// --- 5. PÁGINAS INTERNAS (REGISTROS, ORÇAMENTO, DÍVIDAS) ---

export function renderRecordsPage() {
    const month = state.displayedMonth.getMonth();
    const year = state.displayedMonth.getFullYear();
    const monthName = state.displayedMonth.toLocaleString('pt-BR', { month: 'long' });

    // Lógica de Filtro (Usa os filtros REAIS)
    const filtered = state.transactions.filter(t => {
        const tDate = new Date(t.date + 'T12:00:00');
        const isSameMonth = tDate.getMonth() === month && tDate.getFullYear() === year;
        if (!isSameMonth) return false;
        if (state.selectedDate && tDate.getDate() !== state.selectedDate) return false;
        if (state.filterType !== 'all' && t.type !== state.filterType) return false;
        if (state.filterCategory && t.category !== state.filterCategory) return false;
        if (state.filterMember && t.userId !== state.filterMember) return false;
        return true;
    });

    const groupedByDate = filtered.reduce((acc, t) => {
        const day = new Date(t.date + 'T12:00:00').getDate();
        if (!acc[day]) acc[day] = [];
        acc[day].push(t);
        return acc;
    }, {});
    
    const sortedDays = Object.keys(groupedByDate).sort((a, b) => b - a);
    const isAdmin = state.familyAdmins.includes(state.user.uid);

    // HTML da Lista
    let transactionsHTML = `
        <div class="flex flex-col items-center justify-center py-20 text-gray-400 animate-fade-in">
            <div class="w-24 h-24 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-6 border border-gray-100 dark:border-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </div>
            <p class="font-medium text-lg">Nenhuma transação encontrada.</p>
            <p class="text-sm mt-1 opacity-70">Tente mudar os filtros ou adicionar um novo registro.</p>
        </div>`;
    
    if (sortedDays.length > 0) {
        transactionsHTML = sortedDays.map(day => {
            const transactionsForDay = groupedByDate[day].map(t => {
                // ... (código de renderização do item da transação IGUAL AO ANTERIOR) ...
                // Copie o bloco <li>...</li> do código que você já tem
                const isOwner = t.userId === state.user.uid;
                const canEdit = isAdmin || isOwner;
                const interactClasses = canEdit ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.99] hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800' : 'cursor-default opacity-80';
                const categoryColor = state.categoryColors[t.category] || '#9ca3af';
                const categoryIcon = state.categoryIcons[t.category] || '🏷️';
                const memberName = t.userName ? t.userName.split(' ')[0] : '???';
                return `<li class="transaction-item ${interactClasses} bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm transition-all duration-200 mb-3 border border-gray-100 dark:border-gray-700 flex justify-between items-center group" data-transaction-id="${t.id}"><div class="flex items-center gap-4"><div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ring-1 ring-black/5" style="background-color: ${categoryColor}20; color: ${categoryColor}">${categoryIcon}</div><div><p class="font-heading font-bold text-gray-900 dark:text-white text-base leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">${t.description}</p><div class="flex items-center gap-2 mt-1.5"><span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600 px-1.5 py-0.5 rounded-md">${t.category}</span><span class="text-xs text-gray-400 flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>${memberName}</span></div></div></div><div class="text-right"><p class="font-heading font-bold text-lg ${t.type === 'income' ? 'text-brand-600 dark:text-brand-400' : 'text-red-500 dark:text-red-400'}">${t.type === 'income' ? '+' : '-'} R$ ${t.amount.toFixed(2)}</p></div></li>`;
            }).join('');
            
            // Note: Adicionei animate-fade-in-up AQUI nas listas internas, para elas entrarem suave
            // mas o container principal não tem animação forçada.
            return `<div class="mb-8 animate-fade-in-up"><div class="flex items-center gap-3 mb-4 ml-1"><h4 class="text-2xl font-heading font-bold text-gray-800 dark:text-white">${day}</h4><span class="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pt-1.5">${monthName}</span><div class="h-px bg-gray-200 dark:bg-gray-700 flex-1 ml-4"></div></div><ul class="space-y-1">${transactionsForDay}</ul></div>`;
        }).join('');
    }

    let activeFiltersCount = 0;
    if (state.filterType !== 'all') activeFiltersCount++;
    if (state.filterCategory) activeFiltersCount++;
    if (state.filterMember) activeFiltersCount++;
    if (state.selectedDate) activeFiltersCount++;
    const filterBadge = activeFiltersCount > 0 ? `<span class="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900 shadow-sm animate-bounce">${activeFiltersCount}</span>` : '';

    // REMOVIDO: A classe 'content-fade-in' da div principal. 
    // Agora ela obedece o pai (renderMainContent) ou é estática.
    return `
    <div id="records-page-container" class="pb-32">
        
        <div class="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl py-4 border-b border-gray-200/50 dark:border-gray-800 mb-8 -mx-4 px-4 md:mx-0 md:px-0 md:rounded-b-3xl transition-all shadow-sm">
            <div class="flex items-center justify-between gap-4 max-w-3xl mx-auto">
                <div class="flex items-center bg-gray-100/80 dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                    <button id="prev-month-button" class="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:shadow-sm transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg></button>
                    <span class="font-heading font-bold capitalize text-sm md:text-base px-3 w-36 text-center text-gray-800 dark:text-gray-100 select-none">${monthName} ${year}</span>
                    <button id="next-month-button" class="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:shadow-sm transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></button>
                </div>

                <div class="flex gap-3">
                    <button id="open-filter-modal-btn" class="relative p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm hover:border-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                        ${filterBadge}
                    </button>
                    <button id="open-modal-button" class="flex items-center gap-2 px-5 py-3 bg-brand-600 text-white font-heading font-bold rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition transform active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                        <span class="hidden sm:inline">Novo</span>
                    </button>
                </div>
            </div>
        </div>
        <div id="records-list-wrapper" class="max-w-3xl mx-auto">
            ${transactionsHTML}
        </div>
    </div>`;
}

export function renderBudgetPage() {
    const month = state.displayedMonth.getMonth(); 
    const year = state.displayedMonth.getFullYear(); 
    const monthName = state.displayedMonth.toLocaleString('pt-BR', { month: 'long' });
    const monthlyTransactions = state.transactions.filter(t => new Date(t.date + 'T12:00:00').getMonth() === month && new Date(t.date + 'T12:00:00').getFullYear() === year);
    const activeBudgets = state.budgets.filter(b => { const startDate = new Date(b.appliesFrom + 'T12:00:00'); const startYear = startDate.getUTCFullYear(); const startMonth = startDate.getUTCMonth(); const endDate = b.appliesTo ? new Date(b.appliesTo + 'T12:00:00') : null; const currentYear = state.displayedMonth.getFullYear(); const currentMonth = state.displayedMonth.getMonth(); if (startDate > new Date(currentYear, currentMonth + 1, 0)) return false; if (b.recurring === false && (startYear !== currentYear || startMonth !== currentMonth)) return false; if (endDate && endDate < new Date(currentYear, currentMonth, 1)) return false; return true; });
    const isAdmin = state.familyAdmins.includes(state.user.uid);

    const budgetItemsHTML = activeBudgets.map(budget => {
        let progressHTML = '';
        let spent = 0;
        let limit = budget.value;
        
        if(budget.type === 'expense') {
            spent = monthlyTransactions.filter(t => t.type === 'expense' && t.category === budget.category).reduce((sum, t) => sum + t.amount, 0);
            const percentage = limit > 0 ? (spent / limit) * 100 : 0;
            const barColor = percentage > 100 ? 'bg-red-500' : (percentage > 80 ? 'bg-amber-400' : 'bg-brand-500');
            progressHTML = `<div class="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider"><span>Gasto: R$ ${spent.toFixed(2)}</span><span>Teto: R$ ${limit.toFixed(2)}</span></div><div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner"><div class="${barColor} h-full rounded-full transition-all duration-500 ease-out relative" style="width: ${Math.min(percentage, 100)}%">${percentage > 100 ? '<div class="absolute inset-0 bg-white/20 animate-pulse"></div>' : ''}</div></div>`;
        } else {
            spent = monthlyTransactions.filter(t => t.type === 'income' && t.category === budget.category).reduce((sum, t) => sum + t.amount, 0);
            const percentage = limit > 0 ? (spent / limit) * 100 : 0;
            progressHTML = `<div class="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider"><span>Alcançado: R$ ${spent.toFixed(2)}</span><span>Meta: R$ ${limit.toFixed(2)}</span></div><div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner"><div class="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out" style="width: ${Math.min(percentage, 100)}%"></div></div>`;
        }

        const interactionClasses = isAdmin 
            ? 'cursor-pointer hover:scale-[1.01] hover:shadow-md hover:border-brand-200 dark:hover:border-gray-600' 
            : 'cursor-default';
        const catIcon = state.categoryIcons[budget.category] || '🎯';

        // CORREÇÃO: Adicionada classe 'budget-item'
        return `
            <div class="${interactionClasses} budget-item bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-200 group" data-budget-id="${budget.id}">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-900 text-2xl flex items-center justify-center border border-gray-100 dark:border-gray-700">${catIcon}</div>
                    <div><h4 class="font-heading font-bold text-lg text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">${budget.name}</h4><p class="text-xs text-gray-400 uppercase font-bold tracking-wider">${budget.category}</p></div>
                </div>
                ${progressHTML}
            </div>`;
    }).join('');

    const addButtonHTML = isAdmin ? `<button id="add-budget-button" class="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl text-gray-400 hover:text-brand-600 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all flex flex-col items-center justify-center gap-2 group"><div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg></div><span class="font-bold text-sm">Novo Orçamento</span></button>` : '';

    return `
        <main class="animate-fade-in pb-24">
            <div class="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl py-4 border-b border-gray-200/50 dark:border-gray-800 mb-8 -mx-4 px-4 md:mx-0 md:px-0 md:rounded-b-3xl">
                <div class="flex items-center justify-between bg-gray-100/80 dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700 max-w-sm mx-auto">
                    <button id="prev-month-button" class="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-500 transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg></button>
                    <span class="font-heading font-bold capitalize text-sm md:text-base px-3 w-36 text-center text-gray-800 dark:text-gray-100 select-none">${monthName} ${year}</span>
                    <button id="next-month-button" class="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-500 transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></button>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">${budgetItemsHTML}${addButtonHTML}</div>
            ${activeBudgets.length === 0 && !isAdmin ? `<div class="text-center py-12 text-gray-400"><p>Nenhum orçamento definido.</p></div>` : ''}
        </main>`;
}

export function renderDebtsPage() {
    const isAdmin = state.familyAdmins.includes(state.user.uid);
    
    // Estilo base para cards de dívida/parcela
    const cardStyle = "bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all relative overflow-hidden group";

    // Dívidas
    const debtsHTML = state.debts.map(d => {
        const canEdit = isAdmin || d.userId === state.user.uid;
        const memberName = state.familyMembers.find(m => m.uid === d.debtorId)?.name.split(' ')[0] || '???';
        
        const paid = state.transactions
            .filter(t => t.linkedDebtId === d.id && t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const progress = Math.min((paid / d.totalValue) * 100, 100);
        
        // Status Badge
        let status = 'Pendente'; 
        let statusClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        
        if (paid >= d.totalValue) { 
            status = 'Pago'; 
            statusClass = 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'; 
        } else if (d.dueDate && new Date(d.dueDate) < new Date()) { 
            status = 'Atrasado'; 
            statusClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'; 
        }

        const editBtn = canEdit ? `<button class="edit-debt-btn absolute top-4 right-4 p-2 text-gray-300 hover:text-brand-500 bg-transparent hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-full transition opacity-0 group-hover:opacity-100" data-id="${d.id}"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>` : '';

        return `
        <div class="${cardStyle}">
            ${editBtn}
            <div class="flex justify-between items-start mb-4">
                <div>
                    <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Dívida</span>
                    <h4 class="font-heading font-bold text-xl text-gray-900 dark:text-white mb-1">${d.name}</h4>
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-lg">Devedor: ${memberName}</span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-lg ${statusClass}">${status}</span>
                    </div>
                </div>
            </div>
            
            <div class="space-y-2">
                <div class="flex justify-between text-sm font-bold">
                    <span class="text-gray-500 dark:text-gray-400">Pago: <span class="text-gray-900 dark:text-white">R$ ${paid.toFixed(2)}</span></span>
                    <span class="text-gray-400">/ ${d.totalValue.toFixed(2)}</span>
                </div>
                <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div class="bg-blue-500 h-full rounded-full transition-all duration-500" style="width: ${progress}%"></div>
                </div>
                ${d.dueDate ? `<p class="text-xs text-right text-gray-400 font-medium mt-2">Vence: ${new Date(d.dueDate).toLocaleDateString('pt-BR')}</p>` : ''}
            </div>
        </div>`;
    }).join('') || '<div class="col-span-full py-12 text-center text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700"><p>Nenhuma dívida cadastrada.</p></div>';

    // Parcelamentos
    const installmentsHTML = state.installments.map(i => {
        const canEdit = isAdmin || i.userId === state.user.uid;
        const memberName = state.familyMembers.find(m => m.uid === i.debtorId)?.name.split(' ')[0] || '???';
        
        const linkedTrans = state.transactions.filter(t => t.linkedInstallmentId === i.id);
        const paidCount = linkedTrans.length;
        
        let lastPaidText = "Nenhuma";
        if (paidCount > 0) {
            linkedTrans.sort((a, b) => new Date(b.date) - new Date(a.date));
            const lastDate = new Date(linkedTrans[0].date + 'T12:00:00');
            lastPaidText = lastDate.toLocaleString('pt-BR', { month: 'short', year: 'numeric' });
        }

        const progress = Math.min((paidCount / i.installmentsCount) * 100, 100);
        const editBtn = canEdit ? `<button class="edit-installment-btn absolute top-4 right-4 p-2 text-gray-300 hover:text-brand-500 bg-transparent hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-full transition opacity-0 group-hover:opacity-100" data-id="${i.id}"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>` : '';

        return `
        <div class="${cardStyle}">
            ${editBtn}
            <div class="mb-4">
                <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Parcelamento</span>
                <h4 class="font-heading font-bold text-xl text-gray-900 dark:text-white mb-1">${i.name}</h4>
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-lg">Devedor: ${memberName}</span>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl text-center border border-gray-100 dark:border-gray-700">
                    <p class="text-[10px] font-bold text-gray-400 uppercase">Parcelas</p>
                    <p class="font-heading font-bold text-lg text-brand-600 dark:text-brand-400">${paidCount}<span class="text-gray-400 text-sm">/${i.installmentsCount}</span></p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl text-center border border-gray-100 dark:border-gray-700">
                    <p class="text-[10px] font-bold text-gray-400 uppercase">Valor/Mês</p>
                    <p class="font-heading font-bold text-lg text-gray-800 dark:text-white">R$ ${i.valuePerInstallment.toFixed(0)}</p>
                </div>
            </div>

            <div class="space-y-2">
                <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div class="bg-purple-500 h-full rounded-full" style="width: ${progress}%"></div>
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-gray-50 dark:border-gray-700/50 mt-2">
                    <p class="text-[10px] font-bold text-gray-400 uppercase">Última: <span class="text-gray-600 dark:text-gray-300 capitalize">${lastPaidText}</span></p>
                    <p class="text-[10px] font-bold text-gray-400 uppercase">Vence dia: <span class="text-gray-600 dark:text-gray-300">${i.dueDay}</span></p>
                </div>
            </div>
        </div>`;
    }).join('') || '<div class="col-span-full py-12 text-center text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700"><p>Nenhum parcelamento.</p></div>';

    return `
    <div class="animate-fade-in pb-24">
        <div class="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div class="space-y-4">
                <div class="flex justify-between items-center px-2">
                    <h3 class="text-lg font-heading font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <span class="w-2 h-6 bg-blue-500 rounded-full"></span>
                        Dívidas
                    </h3>
                    <button id="add-debt-btn" class="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition">+ Adicionar</button>
                </div>
                <div class="grid gap-4">${debtsHTML}</div>
            </div>

            <div class="space-y-4">
                <div class="flex justify-between items-center px-2">
                    <h3 class="text-lg font-heading font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <span class="w-2 h-6 bg-purple-500 rounded-full"></span>
                        Parcelamentos
                    </h3>
                    <button id="add-installment-btn" class="text-sm font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition">+ Adicionar</button>
                </div>
                <div class="grid gap-4">${installmentsHTML}</div>
            </div>
        </div>
    </div>`;
}

// --- 6. MODAIS DE AÇÃO (CRUD & FILTROS) ---

// Utilitário de Modal Genérico (Padronização Visual)
const ModalBase = (title, content, closeBtnClass = "close-modal-btn") => `
    <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 modal-overlay p-4 animate-fade-in">
        <div class="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden modal-content flex flex-col transform transition-all scale-100 border border-gray-100 dark:border-gray-700">
            <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 sticky top-0 z-10">
                <h2 class="text-xl font-heading font-bold text-gray-900 dark:text-white">${title}</h2>
                <button class="${closeBtnClass} p-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition focus:outline-none">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            <div class="p-6 overflow-y-auto custom-scrollbar">
                ${content}
            </div>
        </div>
    </div>
`;

// Classes de Input Padronizadas
const inputClass = "w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition dark:text-white font-medium outline-none";
const selectClass = "w-full px-4 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition dark:text-white font-medium outline-none appearance-none cursor-pointer";
const labelClass = "block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5 ml-1";

export function renderTransactionModal() {
    const isEditing = state.editingTransactionId !== null;
    if (!state.isModalOpen || (state.modalView !== 'transaction' && state.modalView !== 'newTag')) return '';

    const transaction = isEditing ? state.transactions.find(t => t.id === state.editingTransactionId) : null;
    if (isEditing && !transaction) return ''; 

    const type = isEditing ? transaction.type : state.modalTransactionType;
    const defaultCategories = (type === 'expense' ? CATEGORIES.expense : CATEGORIES.income);
    const customCategories = state.userCategories[type] || [];
    const allCategories = [...defaultCategories, ...customCategories];
    const isAdmin = state.familyAdmins.includes(state.user.uid);

    // Opções de Vínculo
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
        const colorSwatches = PALETTE_COLORS.map(color => `<label class="cursor-pointer hover:scale-110 transition"><input type="radio" name="newTagColor" value="${color}" class="sr-only peer"><div class="w-9 h-9 rounded-full peer-checked:ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600 shadow-sm" style="background-color: ${color};"></div></label>`).join('');
        const categoryEmojis = ['🏠', '🍔', '🚗', '🎮', '💊', '💰', '💻', '📈', '🛒', '👕', '🎓', '✈️', '💡', '🎁', '🔧', '🧾', '🏋️', '📚', '🎨', '🍺', '🐶', '🧹', '⛽', '🏦'];
        const categoryEmojiOptions = categoryEmojis.map(e => `<label class="cursor-pointer group"><input type="radio" name="newTagIcon" value="${e}" class="sr-only peer" ${e === '🏠' ? 'checked' : ''}><div class="w-10 h-10 flex items-center justify-center text-xl rounded-xl border-2 border-transparent bg-gray-50 dark:bg-gray-700 peer-checked:border-brand-500 peer-checked:bg-brand-50 dark:peer-checked:bg-brand-900/30 hover:bg-gray-100 dark:hover:bg-gray-600 transition">${e}</div></label>`).join('');

        contentHTML = `
            <form id="create-tag-form" class="space-y-5">
                <div><label class="${labelClass}">Nome da Categoria</label><input id="newTagName" name="newTagName" type="text" class="${inputClass}" placeholder="Ex: Assinaturas" required /></div>
                <div><label class="${labelClass}">Ícone</label><div class="flex flex-wrap gap-2 p-3 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-700 max-h-36 overflow-y-auto custom-scrollbar">${categoryEmojiOptions}</div></div>
                <div><label class="${labelClass}">Cor</label><div class="flex flex-wrap gap-3 p-2">${colorSwatches}</div></div>
                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" id="cancel-tag-creation" class="px-5 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition">Cancelar</button>
                    <button type="submit" class="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 transition transform active:scale-95">Salvar</button>
                </div>
            </form>`;
        return ModalBase(`Nova Categoria`, contentHTML);
    } 

    // Form Principal
    let categoryOptions = `<option value="" disabled ${!transaction?.category ? 'selected' : ''}>Selecione...</option>`;
    allCategories.forEach(cat => {
        const icon = state.categoryIcons[cat] || '🏷️';
        const isSelected = transaction?.category === cat ? 'selected' : '';
        categoryOptions += `<option value="${cat}" ${isSelected}>${icon} ${cat}</option>`;
    });
    if (isAdmin) categoryOptions += `<option value="--create-new--" class="font-bold text-brand-600 bg-brand-50 dark:bg-brand-900/20">+ ✨ Criar Nova</option>`;

    const typeSelectorHTML = `
        <div class="flex gap-1 mb-6 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
            <button type="button" data-type="expense" class="transaction-type-button flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${type === 'expense' ? 'bg-white dark:bg-gray-800 text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}">Despesa</button>
            <button type="button" data-type="income" class="transaction-type-button flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${type === 'income' ? 'bg-white dark:bg-gray-800 text-green-500 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}">Receita</button>
        </div>`;
    
    const confirmDeleteHTML = state.confirmingDelete ? 
        `<div class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-center animate-fade-in">
            <p class="text-red-600 dark:text-red-400 font-bold mb-3 text-sm">Tem certeza que deseja excluir?</p>
            <div class="flex justify-center gap-3">
                <button type="button" id="confirm-delete-no" class="px-4 py-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 font-bold text-xs hover:bg-gray-50">Cancelar</button>
                <button type="button" id="confirm-delete-yes" class="px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-xs hover:bg-red-600 shadow-md">Sim, excluir</button>
            </div>
        </div>` : '';

    contentHTML = `
        <form id="${isEditing ? 'edit' : 'add'}-transaction-form">
            ${typeSelectorHTML}
            <div class="space-y-5">
                <div><label class="${labelClass}">Descrição</label><input name="description" type="text" class="${inputClass}" value="${transaction?.description || ''}" required placeholder="Ex: Supermercado" /></div>
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="${labelClass}">Categoria</label><select id="category" name="category" class="${selectClass}">${categoryOptions}</select></div>
                    <div><label class="${labelClass}">Valor</label><input name="amount" type="number" step="0.01" class="${inputClass}" value="${transaction?.amount || ''}" required placeholder="0,00" /></div>
                </div>
                <div><label class="${labelClass}">Data</label><input name="date" type="date" class="${inputClass}" value="${transaction?.date || new Date().toISOString().slice(0, 10)}" required /></div>
                ${type === 'expense' ? `<div><label class="${labelClass}">Vincular (Opcional)</label><select name="linkedEntity" class="${selectClass}">${linkOptions}</select></div>` : ''}
            </div>
            <div class="mt-8 flex gap-3">
                ${isEditing ? `<button type="button" id="delete-transaction-button" class="px-4 py-3.5 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/30 transition">Excluir</button>` : ''}
                <button type="submit" class="flex-1 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition transform active:scale-95">${isEditing ? 'Salvar Alterações' : 'Adicionar Transação'}</button>
            </div>
            ${confirmDeleteHTML}
        </form>`;

    return ModalBase(isEditing ? 'Editar Transação' : 'Nova Transação', contentHTML);
}

export function renderBudgetModal() {
    if (!state.isModalOpen || state.modalView !== 'budget') return '';
    const isEditing = state.editingBudgetItemId !== null;
    const budget = isEditing ? state.budgets.find(b => b.id === state.editingBudgetItemId) : null;
    const type = budget?.type || 'expense';
    
    const allIncomeCategories = [...CATEGORIES.income, ...(state.userCategories.income || [])];
    const allExpenseCategories = [...CATEGORIES.expense, ...(state.userCategories.expense || [])];
    const renderOpts = (cats) => cats.map(c => `<option value="${c}" ${budget?.category === c ? 'selected' : ''}>${state.categoryIcons[c]||'🏷️'} ${c}</option>`).join('');
    
    const confirmDeleteHTML = state.confirmingDelete ? `<div class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-center animate-fade-in"><p class="text-red-600 dark:text-red-400 font-bold mb-3 text-sm">Excluir este orçamento?</p><div class="flex justify-center gap-3"><button type="button" id="confirm-delete-no" class="px-4 py-2 bg-white dark:bg-gray-800 text-gray-600 rounded-lg border font-bold text-xs">Não</button><button type="button" id="confirm-delete-yes" class="px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-xs shadow-md">Sim</button></div></div>` : '';

    const contentHTML = `
        <form id="budget-form" class="space-y-5">
            <div><label class="${labelClass}">Nome do Orçamento</label><input id="budgetName" name="budgetName" type="text" class="${inputClass}" value="${budget?.name || ''}" placeholder="Ex: Limite Mercado" required /></div>
            <div><label class="${labelClass}">Tipo</label><select id="budgetType" name="budgetType" class="${selectClass}"><option value="expense" ${type === 'expense' ? 'selected' : ''}>Limite de Despesa</option><option value="income" ${type === 'income' ? 'selected' : ''}>Meta de Receita</option></select></div>
            <div id="budget-category-wrapper"><label class="${labelClass}">Categoria</label><select id="budgetCategory" name="budgetCategory" class="${selectClass}">${renderOpts(type === 'expense' ? allExpenseCategories : allIncomeCategories)}</select></div>
            <div><label class="${labelClass}">Valor Mensal (R$)</label><input id="budgetValue" name="budgetValue" type="number" step="0.01" class="${inputClass}" value="${budget?.value || ''}" required /></div>
            <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700"><input id="budgetRecurring" name="budgetRecurring" type="checkbox" class="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 border-gray-300" ${budget?.recurring ?? true ? 'checked' : ''}><label for="budgetRecurring" class="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">Repetir todos os meses</label></div>
            <div class="mt-8 flex gap-3">
                ${isEditing ? `<button type="button" id="delete-budget-button" class="px-4 py-3.5 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition">Excluir</button>` : ''}
                <button type="submit" class="flex-1 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition">${isEditing ? 'Salvar' : 'Criar Orçamento'}</button>
            </div>
            ${confirmDeleteHTML}
        </form>`;
    return ModalBase(isEditing ? 'Editar Orçamento' : 'Criar Orçamento', contentHTML);
}

export function renderDebtModal() {
    if (!state.isModalOpen || state.modalView !== 'debt') return '';
    const d = state.editingDebtId ? state.debts.find(i => i.id === state.editingDebtId) : null;
    const membersOptions = state.familyMembers.map(m => `<option value="${m.uid}" ${d?.debtorId === m.uid ? 'selected' : ''}>${m.name || 'Anônimo'}</option>`).join('');
    const confirmDeleteHTML = state.confirmingDelete ? `<div class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-center animate-fade-in"><p class="text-red-600 dark:text-red-400 font-bold mb-3 text-sm">Excluir esta dívida?</p><div class="flex justify-center gap-3"><button type="button" id="confirm-delete-no" class="px-4 py-2 bg-white dark:bg-gray-800 text-gray-600 rounded-lg border font-bold text-xs">Não</button><button type="button" id="confirm-delete-yes" class="px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-xs shadow-md">Sim</button></div></div>` : '';

    const contentHTML = `
        <form id="debt-form" class="space-y-5">
            <div><label class="${labelClass}">Nome da Dívida</label><input name="debtName" type="text" class="${inputClass}" value="${d?.name || ''}" placeholder="Ex: Empréstimo do João" required /></div>
            <div><label class="${labelClass}">Quem deve?</label><select name="debtorId" class="${selectClass}">${membersOptions}</select></div>
            <div><label class="${labelClass}">Valor Total (R$)</label><input name="debtTotalValue" type="number" step="0.01" class="${inputClass}" value="${d?.totalValue || ''}" required /></div>
            <div><label class="${labelClass}">Vencimento (Opcional)</label><input name="debtDueDate" type="date" class="${inputClass}" value="${d?.dueDate || ''}" /></div>
            <div class="mt-8 flex gap-3">
                ${d ? `<button type="button" id="delete-debt-modal-btn" class="px-4 py-3.5 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition">Excluir</button>` : ''}
                <button type="submit" class="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition">Salvar</button>
            </div>
            ${confirmDeleteHTML}
        </form>`;
    return ModalBase(d ? 'Editar Dívida' : 'Nova Dívida', contentHTML);
}

export function renderInstallmentModal() {
    if (!state.isModalOpen || state.modalView !== 'installment') return '';
    const i = state.editingInstallmentId ? state.installments.find(x => x.id === state.editingInstallmentId) : null;
    const membersOptions = state.familyMembers.map(m => `<option value="${m.uid}" ${i?.debtorId === m.uid ? 'selected' : ''}>${m.name || 'Anônimo'}</option>`).join('');
    const confirmDeleteHTML = state.confirmingDelete ? `<div class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-center animate-fade-in"><p class="text-red-600 dark:text-red-400 font-bold mb-3 text-sm">Excluir este parcelamento?</p><div class="flex justify-center gap-3"><button type="button" id="confirm-delete-no" class="px-4 py-2 bg-white dark:bg-gray-800 text-gray-600 rounded-lg border font-bold text-xs">Não</button><button type="button" id="confirm-delete-yes" class="px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-xs shadow-md">Sim</button></div></div>` : '';

    const contentHTML = `
        <form id="installment-form" class="space-y-5">
            <div><label class="${labelClass}">Nome</label><input name="installmentName" type="text" class="${inputClass}" value="${i?.name || ''}" placeholder="Ex: TV Nova" required /></div>
            <div><label class="${labelClass}">Quem paga?</label><select name="debtorId" class="${selectClass}">${membersOptions}</select></div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="${labelClass}">Qtd. Parcelas</label><input name="installmentsCount" type="number" class="${inputClass}" value="${i?.installmentsCount || ''}" required /></div>
                <div><label class="${labelClass}">Valor Mensal</label><input name="valuePerInstallment" type="number" step="0.01" class="${inputClass}" value="${i?.valuePerInstallment || ''}" required /></div>
            </div>
            <div><label class="${labelClass}">Dia de Vencimento</label><input name="dueDay" type="number" min="1" max="31" class="${inputClass}" value="${i?.dueDay || ''}" placeholder="Ex: 10" required /></div>
            <div class="mt-8 flex gap-3">
                ${i ? `<button type="button" id="delete-installment-modal-btn" class="px-4 py-3.5 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition">Excluir</button>` : ''}
                <button type="submit" class="flex-1 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition">Salvar</button>
            </div>
            ${confirmDeleteHTML}
        </form>`;
    return ModalBase(i ? 'Editar Parcelamento' : 'Novo Parcelamento', contentHTML);
}

export function renderFilterModal() {
    if (!state.isModalOpen || state.modalView !== 'filters') return '';
    
    // Usa TEMP FILTERS para renderizar estado
    const T = state.tempFilters;

    const month = state.displayedMonth.getMonth(); const year = state.displayedMonth.getFullYear(); const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysWithData = new Set(state.transactions.filter(t => { const d = new Date(t.date + 'T12:00:00'); return d.getMonth() === month && d.getFullYear() === year; }).map(t => new Date(t.date + 'T12:00:00').getDate()));
    let calendarDaysHTML = Array(firstDay).fill(`<div class="p-2"></div>`).join('');
    for (let day = 1; day <= daysInMonth; day++) {
        const isSelected = T.date === day; // Verifica TEMP
        const hasData = daysWithData.has(day);
        let btnClass = "w-8 h-8 rounded-lg text-sm flex items-center justify-center mx-auto transition ";
        if (isSelected) btnClass += "bg-brand-600 text-white font-bold shadow-md scale-110"; else if (hasData) btnClass += "bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300 font-medium"; else btnClass += "text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800";
        calendarDaysHTML += `<div class="text-center py-1"><button data-day="${day}" class="calendar-day-filter ${btnClass}">${day}</button></div>`;
    }

    const allCategories = [...CATEGORIES.expense, ...CATEGORIES.income, ...(state.userCategories.expense || []), ...(state.userCategories.income || [])];
    const uniqueCategories = [...new Set(allCategories)].sort();
    const categoriesHTML = uniqueCategories.map(cat => {
        const isActive = T.category === cat; // Verifica TEMP
        const icon = state.categoryIcons[cat] || '🏷️';
        const activeClass = isActive ? 'bg-brand-600 text-white border-brand-600 shadow-md' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-brand-500';
        return `<button data-category="${cat}" class="filter-category-btn px-3 py-1.5 text-xs font-bold rounded-lg border transition ${activeClass} flex items-center gap-1"><span>${icon}</span>${cat}</button>`;
    }).join('');

    const membersHTML = state.familyMembers.map(m => {
        const isActive = T.member === m.uid; // Verifica TEMP
        const activeClass = isActive ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-gray-800 grayscale-0 opacity-100 scale-110' : 'grayscale opacity-60 hover:opacity-100 hover:grayscale-0';
        let avatar = `<div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 shadow-sm">${m.name.charAt(0)}</div>`;
        if (m.photoURL && m.photoURL.includes('|')) { const [emoji, bg] = m.photoURL.split('|'); avatar = `<div class="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm" style="background-color: ${bg}">${emoji}</div>`; }
        else if (m.photoURL) { avatar = `<img src="${m.photoURL}" class="w-10 h-10 rounded-full object-cover shadow-sm">`; }
        return `<button data-uid="${m.uid}" class="filter-member-btn flex flex-col items-center gap-1 transition-all ${activeClass} rounded-full p-1">${avatar}<span class="text-[10px] font-bold text-gray-600 dark:text-gray-400">${m.name.split(' ')[0]}</span></button>`;
    }).join('');

    const typeOptions = [{ val: 'all', label: 'Todos' }, { val: 'income', label: 'Receitas' }, { val: 'expense', label: 'Despesas' }];
    const typesHTML = typeOptions.map(t => {
        const isActive = T.type === t.val; // Verifica TEMP
        const activeClass = isActive ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900 shadow-sm' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700';
        return `<button data-type="${t.val}" class="filter-type-btn flex-1 py-2 rounded-lg text-sm font-bold transition ${activeClass}">${t.label}</button>`;
    }).join('');

    const contentHTML = `
        <div class="space-y-6">
            <div><label class="${labelClass}">Tipo</label><div class="flex gap-1 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl">${typesHTML}</div></div>
            <div><label class="${labelClass}">Data (${state.displayedMonth.toLocaleDateString('pt-BR', {month:'long', year:'numeric'})})</label><div class="bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl p-3 border border-gray-100 dark:border-gray-700"><div class="grid grid-cols-7 gap-1 text-center mb-2">${['D','S','T','Q','Q','S','S'].map(d => `<span class="text-[10px] font-bold text-gray-300 dark:text-gray-600">${d}</span>`).join('')}</div><div class="grid grid-cols-7 gap-1">${calendarDaysHTML}</div></div></div>
            <div><label class="${labelClass}">Por Pessoa</label><div class="flex flex-wrap gap-4 justify-center p-2">${membersHTML}</div></div>
            <div><label class="${labelClass}">Categorias</label><div class="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">${categoriesHTML}</div></div>
        </div>
        <div class="pt-6 mt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <button id="clear-filters-btn" class="text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-wider px-2">Limpar Filtros</button>
            <button id="apply-filters-btn" class="px-6 py-3 bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition transform active:scale-95">Ver Resultados</button>
        </div>`;
    
    return ModalBase('Filtrar Transações', contentHTML);
}

export function renderManageCategoriesModal() {
    if (!state.isModalOpen || state.modalView !== 'manageCategories') return '';

    // Define qual tipo está sendo visualizado (padrão: Despesa)
    const currentType = state.modalTransactionType || 'expense';
    const currentCategories = [...(state.userCategories[currentType] || [])];

    const categoryListHTML = currentCategories.map(cat => {
        const color = state.categoryColors[cat] || '#6B7280';
        const icon = state.categoryIcons[cat] || '🏷️';
        
        return `
            <li class="flex justify-between items-center p-3 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl mb-2 group hover:border-brand-200 dark:hover:border-brand-800 transition-colors">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm ring-1 ring-black/5" style="background-color: ${color}20; color: ${color}">
                        ${icon}
                    </div>
                    <span class="font-bold text-gray-700 dark:text-gray-200">${cat}</span>
                </div>
                <button class="edit-category-button p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition" data-category-name="${cat}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
            </li>
        `;
    }).join('');

    // Botões de Alternância (Despesa / Receita)
    const typeSelectorHTML = `
        <div class="flex gap-1 mb-6 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
            <button data-type="expense" class="transaction-type-button flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${currentType === 'expense' ? 'bg-white dark:bg-gray-800 text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}">Despesa</button>
            <button data-type="income" class="transaction-type-button flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${currentType === 'income' ? 'bg-white dark:bg-gray-800 text-green-500 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}">Receita</button>
        </div>`;

    const contentHTML = `
        <div>
            ${typeSelectorHTML}
            <div class="space-y-2 mb-6 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                <ul class="">
                    ${categoryListHTML.length ? categoryListHTML : '<p class="p-8 text-center text-gray-400 text-sm font-medium bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">Nenhuma categoria personalizada encontrada.</p>'}
                </ul>
            </div>
            <button id="add-new-category-button" class="w-full py-3.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 font-bold hover:text-brand-600 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition flex items-center justify-center gap-2 group">
                <div class="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 group-hover:bg-brand-200 group-hover:text-brand-700 transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                </div>
                Adicionar Categoria
            </button>
        </div>
    `;

    return ModalBase('Gerenciar Categorias', contentHTML);
}

export function renderEditCategoryModal() {
    if (!state.isModalOpen || state.modalView !== 'editCategory') return '';

    const categoryName = state.editingCategory;
    const categoryColor = state.categoryColors[categoryName] || '#6B7280';
    const currentIcon = state.categoryIcons[categoryName] || '🏷️';
    
    // Lista de Emojis para Categorias
    const categoryEmojis = ['🏠', '🍔', '🚗', '🎮', '💊', '💰', '💻', '📈', '🛒', '👕', '🎓', '✈️', '💡', '🎁', '🔧', '🧾', '🏋️', '📚', '🎨', '🍺', '🐶', '🧹', '⛽', '🏦'];
    
    const categoryEmojiOptions = categoryEmojis.map(e => 
        `<label class="cursor-pointer group">
            <input type="radio" name="editCategoryIcon" value="${e}" class="sr-only peer" ${e === currentIcon ? 'checked' : ''}>
            <div class="w-10 h-10 flex items-center justify-center text-xl rounded-xl border-2 border-transparent bg-gray-50 dark:bg-gray-700 peer-checked:border-brand-500 peer-checked:bg-brand-50 dark:peer-checked:bg-brand-900/30 hover:scale-110 transition">
                ${e}
            </div>
        </label>`
    ).join('');
    
    // Botão de Excluir condicional
    const confirmDeleteHTML = state.confirmingDelete ? 
        `<div class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-center animate-fade-in">
            <p class="text-red-600 dark:text-red-400 font-bold mb-3 text-sm">Tem certeza que deseja excluir?</p>
            <div class="flex justify-center gap-3">
                <button type="button" id="confirm-delete-no" class="px-4 py-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 font-bold text-xs hover:bg-gray-50">Cancelar</button>
                <button type="button" id="confirm-delete-yes" class="px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-xs hover:bg-red-600 shadow-md">Sim, excluir</button>
            </div>
        </div>` : '';
    
    // Classes reutilizáveis
    const inputClass = "w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition dark:text-white font-medium outline-none";
    const labelClass = "block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5 ml-1";

    const contentHTML = `
        <form id="edit-category-form" class="space-y-5">
            <div>
                <label class="${labelClass}">Nome</label>
                <input type="text" id="category-name-input" value="${categoryName}" required class="${inputClass}">
            </div>
            <div>
                <label class="${labelClass}">Ícone</label>
                <div class="flex flex-wrap gap-2 p-3 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-700 max-h-32 overflow-y-auto custom-scrollbar">
                    ${categoryEmojiOptions}
                </div>
            </div>
            <div>
                <label class="${labelClass}">Cor</label>
                <div class="flex items-center gap-3">
                    <input type="color" id="category-color-input" value="${categoryColor}" class="h-12 w-full rounded-xl cursor-pointer border-2 border-gray-200 dark:border-gray-600 p-1 bg-white dark:bg-gray-800">
                </div>
            </div>
            
            <div class="mt-8 flex gap-3 ${state.confirmingDelete ? 'hidden' : ''}">
                <button type="button" id="delete-category-button" class="px-4 py-3.5 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/30 transition">Excluir</button>
                <button type="submit" class="flex-1 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition transform active:scale-95">
                    Salvar Alterações
                </button>
            </div>
            ${confirmDeleteHTML}
        </form>
    `;

    return ModalBase('Editar Categoria', contentHTML);
}

// --- 7. MODAIS DE SISTEMA & CONFIGURAÇÕES ---

export function renderSettingsModal() {
    if (!state.user || !state.isModalOpen || state.modalView !== 'settings') return '';

    let currentEmoji = '👤';
    let currentColor = '#10B981'; 
    if (state.user.photoURL && state.user.photoURL.includes('|')) {
        const parts = state.user.photoURL.split('|');
        currentEmoji = parts[0];
        currentColor = parts[1];
    }

    const primaryEmojis = ['👤', '🧑‍💼', '👩‍💻', '🦸', '🧕', '🧔', '👶', '👵'];
    const secondaryEmojis = ['🐶', '🐱', '🦊', '🦁', '🐸', '🐵', '🐼', '🐨', '🐯', '🦄', '🐙', '🦉', '🦋', '🐞', '🦖', '👽', '🤖', '👻', '👮', '医生', '👷', '🤴', '👸', '🧝', '🧞', '🧟', '🧛'];
    const generateEmojiOptions = (emojiList) => emojiList.map(e => `<label class="cursor-pointer group"><input type="radio" name="avatarEmoji" value="${e}" class="sr-only peer/emoji" ${e === currentEmoji ? 'checked' : ''}><div class="w-10 h-10 flex items-center justify-center text-xl rounded-xl border-2 border-transparent bg-gray-50 dark:bg-gray-700 peer-checked:border-brand-500 peer-checked:bg-brand-50 dark:peer-checked:bg-brand-900/30 hover:scale-110 transition shadow-sm">${e}</div></label>`).join('');
    const primaryOptionsHTML = generateEmojiOptions(primaryEmojis);
    const secondaryOptionsHTML = generateEmojiOptions(secondaryEmojis);
    const emojiSelectionSection = `<div class="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700"><div class="flex flex-wrap gap-2 mb-3">${primaryOptionsHTML}</div><input type="checkbox" id="toggle-more-emojis" class="sr-only peer/toggle"><label for="toggle-more-emojis" class="text-xs font-bold text-brand-600 dark:text-brand-400 cursor-pointer flex items-center gap-1 select-none hover:underline"><span class="block peer-checked/toggle:hidden">Mostrar mais opções</span><span class="hidden peer-checked/toggle:block">Mostrar menos</span><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform peer-checked/toggle:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg></label><div class="hidden peer-checked/toggle:flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 animate-fade-in">${secondaryOptionsHTML}</div></div>`;

    const profileContent = `<form id="update-profile-form" class="space-y-6 animate-fade-in"><div><label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Avatar</label>${emojiSelectionSection}<div class="mt-4 flex items-center gap-4"><div class="flex-1"><label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Cor de Fundo</label><div class="flex items-center gap-3"><input type="color" name="avatarColor" value="${currentColor}" class="h-10 w-full rounded-xl cursor-pointer border-2 border-gray-200 dark:border-gray-600 p-1 bg-white dark:bg-gray-800"></div></div><div class="flex-1"></div></div></div><div><label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nome de Exibição</label><input name="displayName" type="text" value="${state.user.name}" class="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 transition dark:text-white font-medium outline-none" required /></div><button type="submit" class="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition transform active:scale-95">Salvar Alterações</button></form>${!state.user.isGoogle ? `<div class="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700"><button id="toggle-password-btn" class="flex items-center justify-between w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition group border border-transparent hover:border-gray-200 dark:hover:border-gray-600"><span class="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>Alterar Senha</span><svg id="password-chevron" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 transform transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg></button><div id="password-form-container" class="hidden mt-4 animate-fade-in p-5 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-700"><form id="change-password-form" class="space-y-4"><input name="currentPassword" type="password" placeholder="Senha Atual" class="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 dark:text-white outline-none" required /><input name="newPassword" type="password" placeholder="Nova Senha" class="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 dark:text-white outline-none" required /><button type="submit" class="w-full py-3 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold rounded-xl transition">Atualizar Senha</button></form></div></div>` : ''}`;

    // CORREÇÃO: Botão usando CLASSE 'close-modal-btn'
    const closeBtn = `<button class="close-modal-btn p-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition focus:outline-none"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>`;

    return `
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 modal-overlay p-4 animate-fade-in">
            <div class="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden modal-content flex flex-col transform transition-all scale-100 border border-gray-100 dark:border-gray-700">
                <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 sticky top-0 z-10">
                    <h2 class="text-xl font-heading font-bold text-gray-900 dark:text-white">Configurações</h2>
                    ${closeBtn}
                </div>
                <div class="p-6 overflow-y-auto custom-scrollbar">
                    ${profileContent}
                </div>
            </div>
        </div>
    `;
}

export function renderConfirmationModal() {
    if (!state.confirmationModal.isOpen) return '';

    const { title, message, type } = state.confirmationModal;
    
    const iconColor = type === 'danger' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    const confirmBtnColor = type === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20';
    const iconSvg = type === 'danger' 
        ? `<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;

    return `
        <div class="fixed inset-0 bg-gray-900/70 backdrop-blur-md flex items-center justify-center z-[60] modal-overlay p-4 animate-fade-in">
            <div class="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl max-w-sm w-full p-8 transform transition-all scale-100 text-center border border-gray-100 dark:border-gray-700">
                <div class="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${iconColor}">
                    ${iconSvg}
                </div>
                
                <h3 class="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                    ${title}
                </h3>
                
                <p class="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    ${message}
                </p>

                <div class="grid grid-cols-2 gap-4">
                    <button id="confirm-modal-cancel" class="px-6 py-3.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition">
                        Cancelar
                    </button>
                    <button id="confirm-modal-yes" class="px-6 py-3.5 rounded-xl font-bold shadow-lg ${confirmBtnColor} transition transform active:scale-95">
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
        <div class="relative">
            <div class="animate-bounce mb-8 transform scale-150 filter drop-shadow-lg">
                ${GreenHiveLogoSVG('64')}
            </div>
            <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-2 bg-black/10 dark:bg-white/10 rounded-full blur-sm animate-pulse"></div>
        </div>
        <div class="flex flex-col items-center gap-3 mt-4">
            <svg class="animate-spin h-6 w-6 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest animate-pulse">Carregando...</span>
        </div>
    </div>`;
}

export function renderFamilyInfoModal() {
    if (!state.isModalOpen || state.modalView !== 'familyInfo') return '';

    const isAdmin = state.familyAdmins.includes(state.user.uid);

    const memberListHTML = state.familyMembers.map(member => {
        const isMemberAdmin = state.familyAdmins.includes(member.uid);
        const isCurrentUser = member.uid === state.user.uid;
        const dbName = member.name || 'Anônimo';
        const localName = isCurrentUser ? state.user.name : dbName;
        const finalName = dbName;
        const displayName = isCurrentUser ? `${finalName} (você)` : finalName;
        const dbPhoto = member.photoURL;
        const localPhoto = isCurrentUser ? state.user.photoURL : null;
        const finalPhoto = dbPhoto || localPhoto;

        let avatarHTML = `<div class="w-10 h-10 rounded-full bg-brand-100 dark:bg-gray-700 flex items-center justify-center text-brand-600 dark:text-gray-300 font-heading font-bold text-lg mr-3 select-none border-2 border-white dark:border-gray-600 shadow-sm">${finalName.charAt(0).toUpperCase()}</div>`;
        if (finalPhoto) {
            if (finalPhoto.includes('|')) {
                const [emoji, bg] = finalPhoto.split('|');
                avatarHTML = `<div class="w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3 shadow-sm select-none border-2 border-white dark:border-gray-600" style="background-color: ${bg};">${emoji}</div>`;
            } else {
                avatarHTML = `<img src="${finalPhoto}" class="w-10 h-10 rounded-full mr-3 shadow-sm select-none object-cover border-2 border-white dark:border-gray-600" />`;
            }
        }

        const memberBalance = state.transactions.filter(t => t.userId === member.uid).reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
        const balanceColor = memberBalance >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-red-500 dark:text-red-400';
        const adminTag = isMemberAdmin ? `<span class="ml-2 bg-brand-100 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-full dark:bg-brand-900/30 dark:text-brand-300 border border-brand-200 dark:border-brand-800">Admin</span>` : '';
        
        let actionButtons = '';
        if (isAdmin && !isCurrentUser) {
            if (!isMemberAdmin) {
                actionButtons += `<button class="promote-member-btn p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition" title="Tornar Admin" data-uid="${member.uid}"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></button>`;
            } else {
                actionButtons += `<button class="demote-member-btn p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition" title="Remover Admin" data-uid="${member.uid}"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></button>`;
            }
            actionButtons += `<button class="kick-member-btn p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" title="Remover da Família" data-uid="${member.uid}" data-name="${finalName}"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" /></svg></button>`;
        }

        return `<li class="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"><div class="flex items-center">${avatarHTML}<div><div class="flex items-center gap-1"><p class="font-heading font-bold text-gray-800 dark:text-gray-200 text-sm">${displayName}</p>${adminTag}</div><p class="text-xs font-medium ${balanceColor} mt-0.5">R$ ${memberBalance.toFixed(2)}</p></div></div><div class="flex items-center gap-1">${actionButtons}</div></li>`;
    }).join('');

    const editNameButton = isAdmin ? `<button id="edit-family-name-btn" class="ml-2 text-gray-400 hover:text-brand-500 transition"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>` : '';
    const regenerateCodeButton = isAdmin ? `<button id="regenerate-code-btn" class="p-2 text-gray-400 hover:text-brand-600 transition" title="Gerar novo código"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>` : '';
    const deleteFamilyButton = isAdmin ? `<button id="delete-family-button" class="w-full py-3.5 px-4 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition mt-2 border border-red-100 dark:border-red-900/50">Excluir Família</button>` : '';

    // CORREÇÃO: Botão usando CLASSE 'close-modal-btn'
    const closeBtn = `<button class="close-modal-btn p-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition focus:outline-none"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>`;

    return `
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 modal-overlay p-4 animate-fade-in">
            <div class="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden modal-content flex flex-col transform transition-all scale-100 border border-gray-100 dark:border-gray-700">
                <div class="p-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10 flex justify-between items-start">
                    <div class="w-full">
                        <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Gerenciar Família</p>
                        <div id="family-name-display" class="flex items-center"><h2 id="family-name-text" class="text-2xl font-heading font-bold text-gray-900 dark:text-white truncate max-w-[250px]">${state.family.name}</h2>${editNameButton}</div>
                        <form id="family-name-edit" class="hidden flex items-center gap-2 w-full mt-1"><input id="edit-family-name-input" type="text" value="${state.family.name}" class="flex-1 px-3 py-1.5 text-base border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" /><button type="submit" class="p-1.5 text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg></button><button type="button" id="cancel-name-edit" class="p-1.5 text-gray-500 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg></button></form>
                    </div>
                    ${closeBtn}
                </div>
                <div class="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                    <div class="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50"><p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Código de Convite</p><div class="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-2 pl-4 border border-gray-200 dark:border-gray-700"><p class="text-xl font-mono font-bold text-gray-900 dark:text-white tracking-widest">${state.family.code}</p><div class="flex">${regenerateCodeButton}<button class="copy-code-btn p-2 text-gray-400 hover:text-brand-600 transition" title="Copiar">${Icons.Copy}</button></div></div></div>
                    <div><div class="flex justify-between items-end mb-3 px-1"><p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Membros (${state.familyMembers.length})</p></div><ul class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">${memberListHTML}</ul></div>
                    <div class="space-y-3 pt-2"><button id="switch-family-button" class="w-full py-3.5 px-4 rounded-xl font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/30 transition flex items-center justify-center gap-2 border border-brand-100 dark:border-brand-900/50"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>Trocar de Família</button><button id="leave-family-modal-button" class="w-full py-3.5 px-4 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition">Sair da Família</button>${deleteFamilyButton}</div>
                </div>
            </div>
        </div>
    `;
}



// --- 8. FUNÇÕES DE GRÁFICOS (CHART.JS) ---

function renderMonthlyChart() {
    const canvas = document.getElementById('monthly-expenses-chart');
    const noData = document.getElementById('monthly-expenses-chart-no-data');
    if (!canvas || !noData) return null;

    const month = state.displayedMonth.getMonth();
    const year = state.displayedMonth.getFullYear();
    const data = state.transactions.filter(t => new Date(t.date + 'T12:00:00').getMonth() === month && new Date(t.date + 'T12:00:00').getFullYear() === year && t.type === 'expense');

    if (data.length === 0) {
        canvas.style.display = 'none'; noData.style.display = 'flex'; return null;
    } else {
        canvas.style.display = 'block'; noData.style.display = 'none';
    }

    const expenseData = data.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {});
    
    const labels = Object.keys(expenseData);
    const values = Object.values(expenseData);
    const colors = labels.map(l => state.categoryColors[l] || '#9ca3af');
    const textColor = state.theme === 'dark' ? '#e2e8f0' : '#475569';

    if (Chart.getChart(canvas)) Chart.getChart(canvas).destroy();

    return new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderColor: state.theme === 'dark' ? '#1f2937' : '#ffffff',
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: textColor, font: { family: 'Inter', size: 11 }, usePointStyle: true, padding: 20 } },
                datalabels: { display: false }
            },
            cutout: '75%'
        }
    });
}

function renderBudgetPerformanceChart() {
    const canvas = document.getElementById('budget-performance-chart');
    const noData = document.getElementById('budget-performance-chart-no-data');
    if (!canvas || !noData) return null;

    const activeBudgets = state.budgets.filter(b => b.type === 'expense' && new Date(b.appliesFrom) <= state.displayedMonth);
    if (activeBudgets.length === 0) { canvas.style.display = 'none'; noData.style.display = 'flex'; return null; }
    canvas.style.display = 'block'; noData.style.display = 'none';

    const labels = []; const limits = []; const spentData = [];
    activeBudgets.forEach(b => {
        labels.push(b.name); limits.push(b.value);
        const spent = state.transactions.filter(t => t.type === 'expense' && t.category === b.category && new Date(t.date + 'T12:00:00').getMonth() === state.displayedMonth.getMonth()).reduce((s, t) => s + t.amount, 0);
        spentData.push(spent);
    });

    const textColor = state.theme === 'dark' ? '#e2e8f0' : '#475569';
    if (Chart.getChart(canvas)) Chart.getChart(canvas).destroy();

    return new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Limite', data: limits, backgroundColor: '#10b981', borderRadius: 4, barPercentage: 0.6 },
                { label: 'Gasto', data: spentData, backgroundColor: '#ef4444', borderRadius: 4, barPercentage: 0.6 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, grid: { color: state.theme === 'dark' ? '#374151' : '#e2e8f0' }, ticks: { color: textColor } }, x: { grid: { display: false }, ticks: { color: textColor } } },
            plugins: { legend: { display: false }, datalabels: { display: false } }
        }
    });
}

function renderPersonSpendingChart() {
    const canvas = document.getElementById('person-spending-chart');
    const noData = document.getElementById('person-spending-chart-no-data');
    if (!canvas || !noData) return null;

    const month = state.displayedMonth.getMonth();
    const year = state.displayedMonth.getFullYear();
    const txs = state.transactions.filter(t => new Date(t.date + 'T12:00:00').getMonth() === month && new Date(t.date + 'T12:00:00').getFullYear() === year);

    if (txs.length === 0) { canvas.style.display = 'none'; noData.style.display = 'flex'; return null; }
    canvas.style.display = 'block'; noData.style.display = 'none';

    const stats = {};
    state.familyMembers.forEach(m => {
        let icon = '👤'; let color = '#9ca3af';
        if (m.photoURL && m.photoURL.includes('|')) { const p = m.photoURL.split('|'); icon = p[0]; color = p[1]; }
        stats[m.uid] = { name: m.name.split(' ')[0], icon, color, income: 0, expense: 0 };
    });

    txs.forEach(t => {
        if (!stats[t.userId]) stats[t.userId] = { name: 'Ex', icon: '👻', color: '#9ca3af', income: 0, expense: 0 };
        if (t.type === 'income') stats[t.userId].income += t.amount; else stats[t.userId].expense += t.amount;
    });

    const userData = Object.values(stats);
    const labels = userData.map(u => u.name);
    const incomes = userData.map(u => u.income);
    const expenses = userData.map(u => u.expense);
    const balances = userData.map(u => u.income - u.expense);
    const textColor = state.theme === 'dark' ? '#e2e8f0' : '#475569';

    // Plugin de Avatar no Eixo X
    const avatarPlugin = {
        id: 'avatarAxis',
        afterDraw: (chart) => {
            const { ctx, scales: { x } } = chart;
            x.ticks.forEach((tick, i) => {
                const u = userData[i];
                if (!u) return;
                const xPos = x.getPixelForTick(i);
                const yPos = x.bottom + 25;
                
                ctx.beginPath(); ctx.arc(xPos, yPos, 18, 0, 2 * Math.PI); ctx.fillStyle = u.color; ctx.fill(); ctx.closePath();
                ctx.font = '20px Arial'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(u.icon, xPos, yPos + 1);
                
                ctx.font = 'bold 12px Inter'; ctx.fillStyle = textColor; ctx.fillText(u.name, xPos, yPos + 30);
                ctx.font = '11px Inter'; ctx.fillStyle = '#3b82f6'; ctx.fillText(`R$ ${balances[i].toFixed(0)}`, xPos, yPos + 45);
            });
        }
    };

    if (Chart.getChart(canvas)) Chart.getChart(canvas).destroy();

    return new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Saldo', data: balances, backgroundColor: '#3b82f6', borderRadius: 4 },
                { label: 'Receita', data: incomes, backgroundColor: '#10b981', borderRadius: 4 },
                { label: 'Despesa', data: expenses, backgroundColor: '#ef4444', borderRadius: 4 }
            ]
        },
        plugins: [avatarPlugin],
        options: {
            responsive: true, maintainAspectRatio: false,
            layout: { padding: { bottom: 60 } },
            scales: { y: { beginAtZero: true, grid: { color: state.theme === 'dark' ? '#374151' : '#e2e8f0' }, ticks: { color: textColor } }, x: { display: false } },
            plugins: { legend: { position: 'top', labels: { color: textColor, usePointStyle: true } }, datalabels: { display: false } }
        }
    });
}

function renderAnnualChart() {
    const canvas = document.getElementById('annual-balance-chart'); if (!canvas) return null;
    const year = new Date().getFullYear();
    const income = Array(12).fill(0); const expense = Array(12).fill(0);
    state.transactions.forEach(t => {
        const d = new Date(t.date + 'T12:00:00');
        if (d.getFullYear() === year) { if (t.type === 'income') income[d.getMonth()] += t.amount; else expense[d.getMonth()] += t.amount; }
    });
    const textColor = state.theme === 'dark' ? '#e2e8f0' : '#475569';

    if (Chart.getChart(canvas)) Chart.getChart(canvas).destroy();
    return new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: { labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'], datasets: [{ label: 'Receita', data: income, backgroundColor: '#10b981', borderRadius: 2 }, { label: 'Despesa', data: expense, backgroundColor: '#ef4444', borderRadius: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: state.theme === 'dark' ? '#374151' : '#e2e8f0' }, ticks: { color: textColor } }, x: { grid: { display: false }, ticks: { color: textColor } } }, plugins: { legend: { position: 'top', labels: { color: textColor, usePointStyle: true } }, datalabels: { display: false } } }
    });
}

function renderComparisonChart() {
    const canvas = document.getElementById('comparison-chart'); if (!canvas) return null;
    const curr = state.displayedMonth; const prev = new Date(curr); prev.setMonth(prev.getMonth() - 1);
    const getExp = (d) => state.transactions.filter(t => t.type === 'expense' && new Date(t.date + 'T12:00:00').getMonth() === d.getMonth() && new Date(t.date + 'T12:00:00').getFullYear() === d.getFullYear()).reduce((s,t)=>s+t.amount,0);
    const textColor = state.theme === 'dark' ? '#e2e8f0' : '#475569';

    if (Chart.getChart(canvas)) Chart.getChart(canvas).destroy();
    return new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: { labels: [prev.toLocaleString('pt-BR',{month:'short'}), curr.toLocaleString('pt-BR',{month:'short'})], datasets: [{ label: 'Gastos', data: [getExp(prev), getExp(curr)], backgroundColor: ['#9ca3af', '#ef4444'], borderRadius: 8, barThickness: 40 }] },
        options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', scales: { x: { grid: { color: state.theme === 'dark' ? '#374151' : '#e2e8f0' }, ticks: { color: textColor } }, y: { grid: { display: false }, ticks: { color: textColor, font: { size: 14, weight: 'bold' } } } }, plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'end', color: textColor, formatter: v => `R$ ${v.toFixed(0)}` } } }
    });
}

function renderDailyEvolutionChart() {
    const canvas = document.getElementById('daily-evolution-chart'); if (!canvas) return null;
    const days = new Date(state.displayedMonth.getFullYear(), state.displayedMonth.getMonth()+1, 0).getDate();
    const labels = Array.from({length: days}, (_, i) => i + 1);
    let acc = 0;
    const data = labels.map(d => {
        const daily = state.transactions.filter(t => t.type === 'expense' && new Date(t.date+'T12:00:00').getDate() === d && new Date(t.date+'T12:00:00').getMonth() === state.displayedMonth.getMonth()).reduce((s,t)=>s+t.amount,0);
        acc += daily;
        return new Date().getDate() < d && new Date().getMonth() === state.displayedMonth.getMonth() ? null : acc;
    });
    const textColor = state.theme === 'dark' ? '#e2e8f0' : '#475569';

    if (Chart.getChart(canvas)) Chart.getChart(canvas).destroy();
    return new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: { labels, datasets: [{ label: 'Acumulado', data, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: state.theme === 'dark' ? '#374151' : '#e2e8f0' }, ticks: { color: textColor } }, x: { grid: { display: false }, ticks: { color: textColor, maxTicksLimit: 10 } } }, plugins: { legend: { display: false }, datalabels: { display: false } } }
    });
}

// EXPORT PRINCIPAL DE GRÁFICOS
export function renderCharts() {
    const chartInstances = {};
    chartInstances.monthly = renderMonthlyChart();
    chartInstances.budget = renderBudgetPerformanceChart();
    chartInstances.personSpending = renderPersonSpendingChart();
    chartInstances.annual = renderAnnualChart();
    chartInstances.comparison = renderComparisonChart();
    chartInstances.daily = renderDailyEvolutionChart();
    
    // Função para limpar memória (usada no main.js)
    const destroyAllCharts = () => {
        ['monthly-expenses-chart', 'budget-performance-chart', 'person-spending-chart', 'annual-balance-chart', 'comparison-chart', 'daily-evolution-chart'].forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas && Chart.getChart(canvas)) Chart.getChart(canvas).destroy();
        });
    };
    return destroyAllCharts;
}