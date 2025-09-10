// main.js
import { auth, firebase } from "./firebase-config.js";
import {
    state,
    handleLogin, handleSignup, handleGoogleLogin, handleLogout,
    handleCreateFamily, handleJoinFamily, handleSelectFamily, handleLeaveFamily,
    handleAddTransaction, handleUpdateTransaction, handleDeleteTransaction,
    handleSaveBudget, handleDeleteBudget, handleSaveNewTag,
    handleChangeMonth, handleToggleTheme,
    fetchUserFamilies, loadFamilyData,
} from "./state-and-handlers.js";
import {
    renderHeader, renderAuthPage, renderFamilyOnboardingPage,
    renderMainContent, renderTransactionModal, renderBudgetModal,
    renderCharts as renderChartsUI
} from "./ui-components.js";

const root = document.getElementById('root');
const toastContainer = document.getElementById('toast-container');
let destroyChartsCallback = null;

// Funções de utilidade
export function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type} animate-fade-in`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Funções de Renderização
export function renderApp() {
    document.documentElement.className = state.theme;

    // Renderiza o cabeçalho fora do fluxo principal para evitar re-renderização
    document.querySelector('body > header')?.remove();
    if (state.user) {
        document.body.insertAdjacentHTML('afterbegin', renderHeader());
    }

    let contentHTML = '';
    if (!state.user) {
        contentHTML = renderAuthPage();
    } else if (!state.family) {
        contentHTML = renderFamilyOnboardingPage();
    } else {
        contentHTML = renderMainContent();
    }

    // Atualiza apenas o conteúdo principal
    root.innerHTML = contentHTML;

    // Renderiza os modais
    root.insertAdjacentHTML('beforeend', renderTransactionModal());
    root.insertAdjacentHTML('beforeend', renderBudgetModal());

    attachEventListeners();
}

function attachEventListeners() {
    // Limpar eventos anteriores para evitar duplicatas
    // A abordagem mais simples aqui é usar um "proxy" ou IDs únicos,
    // mas a forma atual com 'removeAllEventListeners' não é trivial.
    // Vamos manter a abordagem original, pois para esse projeto funciona,
    // mas em um framework seria aprimorado.

    const loginForm = document.getElementById('login-form'); if (loginForm) loginForm.onsubmit = handleLogin;
    const signupForm = document.getElementById('signup-form'); if (signupForm) signupForm.onsubmit = handleSignup;
    const switchToSignup = document.getElementById('switch-to-signup'); if (switchToSignup) switchToSignup.onclick = () => { state.authView = 'signup'; renderApp(); };
    const switchToLogin = document.getElementById('switch-to-login'); if (switchToLogin) switchToLogin.onclick = () => { state.authView = 'login'; renderApp(); };
    const googleLoginButton = document.getElementById('google-login-button'); if (googleLoginButton) googleLoginButton.onclick = handleGoogleLogin;
    const createFamilyForm = document.getElementById('create-family-form'); if (createFamilyForm) createFamilyForm.onsubmit = handleCreateFamily;
    const joinFamilyForm = document.getElementById('join-family-form'); if (joinFamilyForm) joinFamilyForm.onsubmit = handleJoinFamily;
    document.querySelectorAll('.select-family-button').forEach(button => button.onclick = (e) => handleSelectFamily(e.currentTarget.dataset.familyId));
    const userMenuButton = document.getElementById('user-menu-button'); if (userMenuButton) userMenuButton.onclick = () => document.getElementById('user-menu').classList.toggle('hidden');
    const logoutButton = document.getElementById('logout-button'); if (logoutButton) logoutButton.onclick = handleLogout;
    const leaveFamilyButton = document.getElementById('leave-family-button'); if (leaveFamilyButton) leaveFamilyButton.onclick = handleLeaveFamily;
    document.querySelectorAll('.nav-tab').forEach(tab => tab.onclick = e => {
        const newView = e.currentTarget.dataset.view;
        if (state.currentView !== newView) {
            const viewContainer = document.getElementById('view-content');
            if (viewContainer) {
                viewContainer.classList.remove('content-fade-in');
                viewContainer.classList.add('content-fade-out');
                setTimeout(() => { state.currentView = newView; renderApp(); }, 150);
            }
        }
    });
    const themeToggleButton = document.getElementById('theme-toggle-button'); if (themeToggleButton) themeToggleButton.onclick = handleToggleTheme;
    const detailsButton = document.getElementById('details-button'); if (detailsButton) detailsButton.onclick = () => { state.currentView = 'records'; renderApp(); };
    const openModalButton = document.getElementById('open-modal-button'); if (openModalButton) openModalButton.onclick = () => { state.isModalOpen = true; state.modalView = 'transaction'; state.editingTransactionId = null; state.isCreatingTag = false; state.modalTransactionType = 'expense'; renderApp(); };
    const prevMonthChartButton = document.getElementById('prev-month-chart-button'); if (prevMonthChartButton) prevMonthChartButton.onclick = () => handleChangeMonth(-1);
    const nextMonthChartButton = document.getElementById('next-month-chart-button'); if (nextMonthChartButton) nextMonthChartButton.onclick = () => handleChangeMonth(1);
    const copyCodeButton = document.getElementById('copy-code-button'); if (copyCodeButton) copyCodeButton.onclick = () => navigator.clipboard.writeText(state.family.code).then(() => showToast('Código copiado!', 'success'));
    const shareLinkButton = document.getElementById('share-link-button'); if (shareLinkButton) shareLinkButton.onclick = () => navigator.clipboard.writeText(`https://seusite.com/join?code=${state.family.code}`).then(() => showToast('Link de convite copiado!', 'success'));
    const prevMonthButton = document.getElementById('prev-month-button'); if (prevMonthButton) prevMonthButton.onclick = () => handleChangeMonth(-1);
    const nextMonthButton = document.getElementById('next-month-button'); if (nextMonthButton) nextMonthButton.onclick = () => handleChangeMonth(1);
    document.querySelectorAll('.filter-button').forEach(button => button.onclick = (e) => { state.detailsFilterType = e.currentTarget.dataset.filter; state.selectedDate = null; renderApp(); });
    document.querySelectorAll('.calendar-day').forEach(day => day.onclick = e => { const recordsList = document.getElementById('records-list-wrapper'); const dayNumber = parseInt(e.currentTarget.dataset.day); if (recordsList) { recordsList.classList.add('content-fade-out'); setTimeout(() => { state.selectedDate = dayNumber; renderApp(); }, 150); } });
    document.querySelectorAll('.transaction-item').forEach(item => item.onclick = e => { const transactionId = e.currentTarget.dataset.transactionId; state.editingTransactionId = transactionId; state.isModalOpen = true; state.modalView = 'transaction'; renderApp(); });
    const clearDateFilterButton = document.getElementById('clear-date-filter'); if (clearDateFilterButton) clearDateFilterButton.onclick = () => { state.selectedDate = null; renderApp(); };
    const addBudgetButton = document.getElementById('add-budget-button'); if (addBudgetButton) addBudgetButton.onclick = () => { state.isModalOpen = true; state.modalView = 'budget'; state.editingBudgetItemId = null; renderApp(); };
    document.querySelectorAll('.budget-item').forEach(item => item.onclick = e => { state.editingBudgetItemId = e.currentTarget.dataset.budgetId; state.isModalOpen = true; state.modalView = 'budget'; renderApp(); });
    const closeModalButton = document.getElementById('close-modal-button'); if (closeModalButton) closeModalButton.onclick = () => { state.isModalOpen = false; state.editingTransactionId = null; state.editingBudgetItemId = null; renderApp(); };
    const confirmDeleteYes = document.getElementById('confirm-delete-yes'); if (confirmDeleteYes) confirmDeleteYes.onclick = state.editingTransactionId ? handleDeleteTransaction : handleDeleteBudget;
    const confirmDeleteNo = document.getElementById('confirm-delete-no'); if (confirmDeleteNo) confirmDeleteNo.onclick = () => { state.confirmingDelete = false; renderApp(); };
    const addTransactionForm = document.getElementById('add-transaction-form'); if (addTransactionForm) addTransactionForm.onsubmit = handleAddTransaction;
    const editTransactionForm = document.getElementById('edit-transaction-form'); if (editTransactionForm) editTransactionForm.onsubmit = handleUpdateTransaction;
    const deleteTransactionButton = document.getElementById('delete-transaction-button'); if (deleteTransactionButton) deleteTransactionButton.onclick = () => { state.confirmingDelete = true; renderApp(); };
    const budgetForm = document.getElementById('budget-form'); if (budgetForm) budgetForm.onsubmit = handleSaveBudget;
    const deleteBudgetButton = document.getElementById('delete-budget-button'); if (deleteBudgetButton) deleteBudgetButton.onclick = () => { state.confirmingDelete = true; renderApp(); };
    const budgetTypeSelect = document.getElementById('budgetType'); if (budgetTypeSelect) budgetTypeSelect.onchange = () => {
        const form = budgetTypeSelect.closest('form');
        const type = budgetTypeSelect.value;
        const allIncomeCategories = [...CATEGORIES.income, ...(state.userCategories.income || [])];
        const allExpenseCategories = [...CATEGORIES.expense, ...(state.userCategories.expense || [])];
        const options = (type === 'expense' ? allExpenseCategories : allIncomeCategories).map(c => `<option value="${c}">${c}</option>`).join('');
        form.querySelector('#budgetCategory').innerHTML = options;
    };
    const categorySelect = document.getElementById('category'); if (categorySelect) categorySelect.onchange = (e) => { if (e.target.value === '--create-new--') { state.modalView = 'newTag'; renderApp(); } };
    const createTagForm = document.getElementById('create-tag-form'); if (createTagForm) createTagForm.onsubmit = handleSaveNewTag;
    const cancelTagCreation = document.getElementById('cancel-tag-creation'); if (cancelTagCreation) cancelTagCreation.onclick = () => { state.modalView = 'transaction'; renderApp(); };

    const swipeTarget = document.getElementById('view-content');
    if (swipeTarget && ['dashboard', 'records'].includes(state.currentView)) {
        let touchStartX = 0; let touchEndX = 0;
        swipeTarget.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        swipeTarget.addEventListener('touchend', e => { touchEndX = e.changedTouches[0].screenX; if (touchEndX < touchStartX - 50) handleChangeMonth(1); if (touchEndX > touchStartX + 50) handleChangeMonth(-1); });
    }

    // Gerenciamento de gráficos
    // ... dentro de attachEventListeners() em main.js
    // ...
    if (state.currentView === 'dashboard') {
        renderChartsUI();
    }
    else if (state.currentView !== 'dashboard' && destroyChartsCallback) {
        destroyChartsCallback();
        destroyChartsCallback = null;
    }
}

// --- PONTO DE PARTIDA E CONTROLE DE AUTH ---
firebase.onAuthStateChanged(auth, async (user) => {
    if (user) {
        state.user = { uid: user.uid, email: user.email, name: user.displayName || user.email.split('@')[0] };
        state.userFamilies = await fetchUserFamilies();
    } else {
        state.user = null; state.family = null; state.transactions = []; state.userFamilies = []; state.budgets = [];
        state.currentView = 'auth';
    }
    renderApp();
});