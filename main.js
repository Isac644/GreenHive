// main.js
import { auth, firebase } from "./firebase-config.js";
import {
    state, handleLogin, handleSignup, handleGoogleLogin, handleLogout, handleCreateFamily, handleJoinFamily, handleSelectFamily, handleLeaveFamily, handleAddTransaction, handleUpdateTransaction, handleDeleteTransaction, handleSaveBudget, handleDeleteBudget, handleSaveNewTag, handleChangeMonth, handleToggleTheme, fetchUserFamilies, handleSwitchFamily, handleUpdateCategory, handleDeleteCategory, handleJoinFamilyFromLink, subscribeToNotifications, toggleNotificationMenu, handleAcceptJoinRequest, handleRejectJoinRequest, handleDeleteNotification, handleEnterFamilyFromNotification, handleResetPassword, handleUpdateProfile, handleChangePassword, handleUpdateFamilyName, handleRegenerateCode, handlePromoteMember, handleKickMember, handleDemoteMember, handleDeleteFamily, handleConfirmAction, closeConfirmation,
    handleSaveDebt, handleDeleteDebt, handleSaveInstallment, handleDeleteInstallment 
} from "./state-and-handlers.js";
import {
    renderHeader, renderAuthPage, renderFamilyOnboardingPage, renderMainContent, renderTransactionModal, renderBudgetModal, renderFamilyInfoModal, renderCharts as renderChartsUI, renderManageCategoriesModal, renderEditCategoryModal, renderSettingsModal, renderConfirmationModal,
    renderDebtsPage, renderDebtModal, renderInstallmentModal 
} from "./ui-components.js";

const root = document.getElementById('root');
const toastContainer = document.getElementById('toast-container');
let destroyChartsCallback = null;

export function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type} animate-fade-in`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 5000);
}

export function renderApp() {
    document.documentElement.className = state.theme;
    document.querySelector('body > header')?.remove();
    if (state.user) document.body.insertAdjacentHTML('afterbegin', renderHeader());

    let contentHTML = '';
    if (!state.user) contentHTML = renderAuthPage();
    else if (!state.family) contentHTML = renderFamilyOnboardingPage();
    else contentHTML = renderMainContent();

    root.innerHTML = contentHTML;

    // Modals
    root.insertAdjacentHTML('beforeend', renderTransactionModal());
    root.insertAdjacentHTML('beforeend', renderBudgetModal());
    root.insertAdjacentHTML('beforeend', renderFamilyInfoModal());
    root.insertAdjacentHTML('beforeend', renderManageCategoriesModal());
    root.insertAdjacentHTML('beforeend', renderEditCategoryModal());
    root.insertAdjacentHTML('beforeend', renderSettingsModal());
    root.insertAdjacentHTML('beforeend', renderConfirmationModal());
    root.insertAdjacentHTML('beforeend', renderDebtModal());
    root.insertAdjacentHTML('beforeend', renderInstallmentModal());

    attachEventListeners();
}

function attachEventListeners() {
    // Auth
    const loginForm = document.getElementById('login-form'); if (loginForm) loginForm.onsubmit = handleLogin;
    const signupForm = document.getElementById('signup-form'); if (signupForm) signupForm.onsubmit = handleSignup;
    const switchToSignup = document.getElementById('switch-to-signup'); if (switchToSignup) switchToSignup.onclick = () => { state.authView = 'signup'; renderApp(); };
    const switchToLogin = document.getElementById('switch-to-login'); if (switchToLogin) switchToLogin.onclick = () => { state.authView = 'login'; renderApp(); };
    const googleLoginBtn = document.getElementById('google-login-button'); if (googleLoginBtn) googleLoginBtn.onclick = handleGoogleLogin;
    const forgotPassLink = document.getElementById('forgot-password-link'); if (forgotPassLink) forgotPassLink.onclick = (e) => { e.preventDefault(); state.authView = 'forgot-password'; renderApp(); };
    const resetPassForm = document.getElementById('reset-password-form'); if (resetPassForm) resetPassForm.onsubmit = handleResetPassword;
    const backToLoginLink = document.getElementById('back-to-login-link'); if (backToLoginLink) backToLoginLink.onclick = () => { state.authView = 'login'; renderApp(); };
    const backToLoginSuccess = document.getElementById('back-to-login-success-button'); if (backToLoginSuccess) backToLoginSuccess.onclick = () => { state.authView = 'login'; renderApp(); };

    // Onboarding
    const createFamilyForm = document.getElementById('create-family-form'); if (createFamilyForm) createFamilyForm.onsubmit = handleCreateFamily;
    const joinFamilyForm = document.getElementById('join-family-form'); if (joinFamilyForm) joinFamilyForm.onsubmit = handleJoinFamily;
    document.querySelectorAll('.select-family-button').forEach(b => b.onclick = (e) => handleSelectFamily(e.currentTarget.dataset.familyId));
    
    // Header & Menus
    const userMenuBtn = document.getElementById('user-menu-button'); if (userMenuBtn) userMenuBtn.onclick = () => document.getElementById('user-menu').classList.toggle('hidden');
    const logoutBtn = document.getElementById('logout-button'); if (logoutBtn) logoutBtn.onclick = handleLogout;
    const notifBtn = document.getElementById('notification-button'); if (notifBtn) notifBtn.onclick = (e) => { e.stopPropagation(); toggleNotificationMenu(); };
    document.addEventListener('click', (e) => { if (state.isNotificationMenuOpen && !e.target.closest('#notification-button') && !e.target.closest('.absolute.right-0')) toggleNotificationMenu(); });
    const themeToggle = document.getElementById('theme-toggle-button'); if (themeToggle) themeToggle.onclick = handleToggleTheme;
    const openSettingsBtn = document.getElementById('open-settings-button'); if (openSettingsBtn) openSettingsBtn.onclick = () => { state.isModalOpen = true; state.modalView = 'settings'; state.settingsTab = 'profile'; document.getElementById('user-menu').classList.add('hidden'); renderApp(); };

    // Main Navigation
    document.querySelectorAll('.nav-tab').forEach(tab => tab.onclick = e => {
        const newView = e.currentTarget.dataset.view;
        if (state.currentView !== newView) { state.currentView = newView; renderApp(); }
    });
    const detailsBtn = document.getElementById('details-button'); if (detailsBtn) detailsBtn.onclick = () => { state.currentView = 'records'; renderApp(); };

    // Transaction Modal
    const openModalBtn = document.getElementById('open-modal-button'); if (openModalBtn) openModalBtn.onclick = () => { state.isModalOpen = true; state.modalView = 'transaction'; state.editingTransactionId = null; state.modalTransactionType = 'expense'; renderApp(); };
    document.querySelectorAll('.transaction-item').forEach(i => i.onclick = e => { state.editingTransactionId = e.currentTarget.dataset.transactionId; state.isModalOpen = true; state.modalView = 'transaction'; renderApp(); });
    const addTransForm = document.getElementById('add-transaction-form'); if (addTransForm) addTransForm.onsubmit = handleAddTransaction;
    const editTransForm = document.getElementById('edit-transaction-form'); if (editTransForm) editTransForm.onsubmit = handleUpdateTransaction;
    const delTransBtn = document.getElementById('delete-transaction-button'); if (delTransBtn) delTransBtn.onclick = () => { state.confirmingDelete = true; renderApp(); };
    document.querySelectorAll('.transaction-type-button').forEach(b => b.onclick = e => { state.modalTransactionType = e.currentTarget.dataset.type; renderApp(); });
    const catSelect = document.getElementById('category'); if (catSelect) catSelect.onchange = (e) => { if (e.target.value === '--create-new--') { state.modalParentView = 'transaction'; state.modalView = 'newTag'; renderApp(); } };

    // Budget Modal
    const addBudgetBtn = document.getElementById('add-budget-button'); if (addBudgetBtn) addBudgetBtn.onclick = () => { state.isModalOpen = true; state.modalView = 'budget'; state.editingBudgetItemId = null; renderApp(); };
    document.querySelectorAll('.budget-item').forEach(i => i.onclick = e => { state.editingBudgetItemId = e.currentTarget.dataset.budgetId; state.isModalOpen = true; state.modalView = 'budget'; renderApp(); });
    const budgetForm = document.getElementById('budget-form'); if (budgetForm) budgetForm.onsubmit = handleSaveBudget;
    const delBudgetBtn = document.getElementById('delete-budget-button'); if (delBudgetBtn) delBudgetBtn.onclick = () => { state.confirmingDelete = true; renderApp(); };
    
    // Dívidas e Parcelas (NOVOS LISTENERS)
    const addDebtBtn = document.getElementById('add-debt-btn'); if(addDebtBtn) addDebtBtn.onclick = () => { state.isModalOpen = true; state.modalView = 'debt'; state.editingDebtId = null; renderApp(); };
    document.querySelectorAll('.edit-debt-btn').forEach(b => b.onclick = e => { state.editingDebtId = e.currentTarget.dataset.id; state.isModalOpen = true; state.modalView = 'debt'; renderApp(); });
    const debtForm = document.getElementById('debt-form'); if(debtForm) debtForm.onsubmit = handleSaveDebt;
    const delDebtBtn = document.getElementById('delete-debt-modal-btn'); if(delDebtBtn) delDebtBtn.onclick = handleDeleteDebt;

    const addInstBtn = document.getElementById('add-installment-btn'); if(addInstBtn) addInstBtn.onclick = () => { state.isModalOpen = true; state.modalView = 'installment'; state.editingInstallmentId = null; renderApp(); };
    document.querySelectorAll('.edit-installment-btn').forEach(b => b.onclick = e => { state.editingInstallmentId = e.currentTarget.dataset.id; state.isModalOpen = true; state.modalView = 'installment'; renderApp(); });
    const instForm = document.getElementById('installment-form'); if(instForm) instForm.onsubmit = handleSaveInstallment;
    const delInstBtn = document.getElementById('delete-installment-modal-btn'); if(delInstBtn) delInstBtn.onclick = handleDeleteInstallment;

    // Common Modal Actions
    document.querySelectorAll('#close-modal-button').forEach(b => b.onclick = () => { state.isModalOpen = false; state.editingTransactionId = null; state.editingBudgetItemId = null; state.editingDebtId = null; state.editingInstallmentId = null; state.confirmingDelete = false; renderApp(); });
    // Family Info Modal
    const famInfoBtn = document.getElementById('family-info-button'); if (famInfoBtn) famInfoBtn.onclick = () => { state.isModalOpen = true; state.modalView = 'familyInfo'; renderApp(); };
    const switchFamHead = document.getElementById('switch-family-header-button'); if (switchFamHead) switchFamHead.onclick = handleSwitchFamily;
    const switchFamMod = document.getElementById('switch-family-button'); if (switchFamMod) switchFamMod.onclick = handleSwitchFamily;
    const leaveFamMod = document.getElementById('leave-family-modal-button'); if (leaveFamMod) leaveFamMod.onclick = handleLeaveFamily;
    const delFamBtn = document.getElementById('delete-family-button'); if (delFamBtn) delFamBtn.onclick = handleDeleteFamily;
    const editFamNameBtn = document.getElementById('edit-family-name-btn'); if(editFamNameBtn) editFamNameBtn.onclick = () => { document.getElementById('family-name-display').classList.add('hidden'); document.getElementById('family-name-edit').classList.remove('hidden'); document.getElementById('edit-family-name-input').focus(); };
    const cancelFamNameBtn = document.getElementById('cancel-name-edit'); if(cancelFamNameBtn) cancelFamNameBtn.onclick = () => { document.getElementById('family-name-display').classList.remove('hidden'); document.getElementById('family-name-edit').classList.add('hidden'); };
    const famNameForm = document.getElementById('family-name-edit'); if(famNameForm) famNameForm.onsubmit = handleUpdateFamilyName;
    const regenCodeBtn = document.getElementById('regenerate-code-btn'); if(regenCodeBtn) regenCodeBtn.onclick = handleRegenerateCode;
    
    document.querySelectorAll('.promote-member-btn').forEach(b => b.onclick = e => handlePromoteMember(e.currentTarget.dataset.uid));
    document.querySelectorAll('.kick-member-btn').forEach(b => b.onclick = e => handleKickMember(e.currentTarget.dataset.uid, e.currentTarget.dataset.name));

    // Categories
    const manageCatBtn = document.getElementById('manage-categories-button'); if (manageCatBtn) manageCatBtn.onclick = () => { state.isModalOpen = true; state.modalView = 'manageCategories'; renderApp(); };
    const addNewCatBtn = document.getElementById('add-new-category-button'); if (addNewCatBtn) addNewCatBtn.onclick = () => { state.isModalOpen = true; state.modalParentView = 'manageCategories'; state.modalView = 'newTag'; renderApp(); };
    document.querySelectorAll('.edit-category-button').forEach(b => b.onclick = e => { state.editingCategory = e.target.dataset.categoryName; state.isModalOpen = true; state.modalView = 'editCategory'; renderApp(); });
    const editCatForm = document.getElementById('edit-category-form'); if (editCatForm) editCatForm.onsubmit = handleUpdateCategory;
    const cancelEditBtn = document.getElementById('cancel-edit-button'); if (cancelEditBtn) cancelEditBtn.onclick = () => { state.isModalOpen = false; state.editingCategory = ''; renderApp(); };
    const delCatBtn = document.getElementById('delete-category-button'); if (delCatBtn) delCatBtn.onclick = () => { state.confirmingDelete = true; renderApp(); };
    const createTagForm = document.getElementById('create-tag-form'); if (createTagForm) createTagForm.onsubmit = handleSaveNewTag;
    const cancelTagCreation = document.getElementById('cancel-tag-creation'); if (cancelTagCreation) cancelTagCreation.onclick = () => { state.modalView = state.modalParentView || 'transaction'; state.modalParentView = ''; renderApp(); };

    // Settings
    const updateProfileForm = document.getElementById('update-profile-form'); if (updateProfileForm) updateProfileForm.onsubmit = handleUpdateProfile;
    const changePassForm = document.getElementById('change-password-form'); if (changePassForm) changePassForm.onsubmit = handleChangePassword;
    const togglePassBtn = document.getElementById('toggle-password-btn'); if (togglePassBtn) togglePassBtn.onclick = () => { const c = document.getElementById('password-form-container'); c.classList.toggle('hidden'); document.getElementById('password-chevron').classList.toggle('rotate-180'); };

    // Confirm Modal
    const confirmYesBtn = document.getElementById('confirm-modal-yes'); if (confirmYesBtn) confirmYesBtn.onclick = handleConfirmAction;
    const confirmCancelBtn = document.getElementById('confirm-modal-cancel'); if (confirmCancelBtn) confirmCancelBtn.onclick = closeConfirmation;

    // Notifications
    document.querySelectorAll('.accept-request-btn').forEach(b => b.onclick = e => handleAcceptJoinRequest(state.notifications.find(n => n.id === e.currentTarget.dataset.notifId)));
    document.querySelectorAll('.reject-request-btn').forEach(b => b.onclick = e => handleRejectJoinRequest(e.currentTarget.dataset.notifId));
    document.querySelectorAll('.delete-notif-btn').forEach(b => { b.onclick = e => { e.stopPropagation(); handleDeleteNotification(e.currentTarget.dataset.id); }});
    document.querySelectorAll('.enter-family-notif-btn').forEach(b => b.onclick = e => handleEnterFamilyFromNotification(state.notifications.find(n => n.id === e.currentTarget.dataset.notifId)));

    // Misc
    const shareLinkBtn = document.getElementById('share-link-button'); if (shareLinkBtn) shareLinkBtn.onclick = () => navigator.clipboard.writeText(`${window.location.origin}/?code=${state.family.code}`).then(() => showToast('Link copiado!', 'success'));
    
    // Month Nav
    const prevM = document.getElementById('prev-month-button'); if (prevM) prevM.onclick = () => handleChangeMonth(-1);
    const nextM = document.getElementById('next-month-button'); if (nextM) nextM.onclick = () => handleChangeMonth(1);
    const prevMC = document.getElementById('prev-month-chart-button'); if (prevMC) prevMC.onclick = () => handleChangeMonth(-1);
    const nextMC = document.getElementById('next-month-chart-button'); if (nextMC) nextMC.onclick = () => handleChangeMonth(1);
    const toggleChartBtn = document.getElementById('toggle-charts-button'); if(toggleChartBtn) toggleChartBtn.onclick = () => { const c = document.getElementById('secondary-charts-container'); const i = document.getElementById('toggle-icon'); const s = toggleChartBtn.querySelector('span'); if(c.classList.contains('hidden')) { c.classList.remove('hidden'); i.classList.add('rotate-180'); s.textContent = "Ocultar gráficos"; if(window.renderSecondaryCharts) window.renderSecondaryCharts(); c.scrollIntoView({behavior:'smooth'}); } else { c.classList.add('hidden'); i.classList.remove('rotate-180'); s.textContent = "Exibir mais gráficos"; } };

    // Chart rendering
    if (state.currentView === 'dashboard') {
        if (destroyChartsCallback) { destroyChartsCallback(); destroyChartsCallback = null; }
        destroyChartsCallback = renderChartsUI();
    } else if (destroyChartsCallback) {
        destroyChartsCallback(); destroyChartsCallback = null;
    }

    // Promover
    document.querySelectorAll('.promote-member-btn').forEach(btn => {
        btn.onclick = (e) => {
            const uid = e.currentTarget.dataset.uid;
            handlePromoteMember(uid);
        };
    });

    // NOVO: Rebaixar (Remover Admin)
    document.querySelectorAll('.demote-member-btn').forEach(btn => {
        btn.onclick = (e) => {
            const uid = e.currentTarget.dataset.uid;
            handleDemoteMember(uid);
        };
    });

    // Remover (Kick)
    document.querySelectorAll('.kick-member-btn').forEach(btn => {
        btn.onclick = (e) => {
            const uid = e.currentTarget.dataset.uid;
            const name = e.currentTarget.dataset.name;
            handleKickMember(uid, name);
        };
    });

    document.querySelectorAll('.demote-member-btn').forEach(b => b.onclick = e => handleDemoteMember(e.currentTarget.dataset.uid));

    document.querySelectorAll('#close-modal-button').forEach(b => b.onclick = () => { 
        state.isModalOpen = false; 
        state.editingTransactionId = null; 
        state.editingBudgetItemId = null; 
        state.editingDebtId = null; 
        state.editingInstallmentId = null; 
        state.confirmingDelete = false; 
        renderApp(); 
    });

    const confirmYes = document.getElementById('confirm-delete-yes'); 
    if (confirmYes) confirmYes.onclick = async () => { // Note o ASYNC aqui
        // Remove o loading visual ou previne duplo clique se quiser
        const originalText = confirmYes.innerText;
        confirmYes.innerText = "...";
        
        if (state.editingCategory) {
            await handleDeleteCategory();
        } else if (state.editingTransactionId) {
            await handleDeleteTransaction();
        } else if (state.editingBudgetItemId) {
            await handleDeleteBudget();
        }
        
        // Só reseta o estado se o modal ainda estiver aberto (caso de erro)
        // Se deu sucesso, a própria função delete já fechou o modal e chamou renderApp
        if (state.isModalOpen) {
            state.confirmingDelete = false;
            renderApp();
        }
    };

    const confirmNo = document.getElementById('confirm-delete-no'); 
    if (confirmNo) confirmNo.onclick = () => { 
        state.confirmingDelete = false; 
        renderApp(); 
    };
}

let unsubscribeNotifications = null;
firebase.onAuthStateChanged(auth, async (user) => {
    if (state.isSigningUp) return;
    
    if (user) {
        const isGoogle = user.providerData.some(p => p.providerId === 'google.com');
        state.user = { uid: user.uid, email: user.email, name: user.displayName || user.email.split('@')[0], photoURL: user.photoURL, isGoogle: isGoogle };
        
        // Carrega a lista de famílias disponíveis para o usuário
        state.userFamilies = await fetchUserFamilies();
        
        // Notificações
        if (unsubscribeNotifications) unsubscribeNotifications();
        unsubscribeNotifications = subscribeToNotifications();
        
        // LÓGICA DE PERSISTÊNCIA (NOVO)
        const lastFamilyId = localStorage.getItem('greenhive_last_family');
        
        // URL Params (Convite por Link) tem prioridade
        const urlParams = new URLSearchParams(window.location.search);
        const inviteCode = urlParams.get('code');
        
        if (inviteCode && !state.family) {
            const success = await handleJoinFamilyFromLink(inviteCode);
            if (success || inviteCode) history.replaceState(null, '', window.location.pathname);
        } else if (lastFamilyId) {
            // Verifica se o usuário ainda tem acesso a essa família
            const hasAccess = state.userFamilies.some(f => f.id === lastFamilyId);
            if (hasAccess) {
                // Se tiver, entra direto (os listeners vão carregar os dados)
                handleSelectFamily(lastFamilyId);
            } else {
                // Se não tiver mais acesso (foi removido), limpa o storage
                localStorage.removeItem('greenhive_last_family');
            }
        }

    } else {
        if (unsubscribeNotifications) unsubscribeNotifications();
        state.user = null; state.family = null; state.transactions = []; state.userFamilies = []; state.budgets = []; state.debts = []; state.installments = [];
        state.isModalOpen = false; state.modalView = ''; state.isNotificationMenuOpen = false;
        if (state.authView !== 'signup-success') state.currentView = 'auth';
    }
    renderApp();
});