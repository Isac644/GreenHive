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
    handleSwitchFamily,
    handleUpdateCategory, 
    handleDeleteCategory,
    handleJoinFamilyFromLink // <--- NOVO: ADICIONE ESTA FUNÇÃO
} from "./state-and-handlers.js";
import {
    renderHeader, renderAuthPage, renderFamilyOnboardingPage,
    renderMainContent, renderTransactionModal, renderBudgetModal, renderFamilyInfoModal,
    renderCharts as renderChartsUI,
    renderManageCategoriesModal, // NOVO: Importe a função do novo modal
    renderEditCategoryModal,
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

    root.innerHTML = contentHTML;

    // Atualiza apenas o conteúdo principal
    root.innerHTML = contentHTML;

    // Renderiza os modais
    root.insertAdjacentHTML('beforeend', renderTransactionModal());
    root.insertAdjacentHTML('beforeend', renderBudgetModal());
    root.insertAdjacentHTML('beforeend', renderFamilyInfoModal());
    root.insertAdjacentHTML('beforeend', renderManageCategoriesModal());
    root.insertAdjacentHTML('beforeend', renderEditCategoryModal()); // NOVO: Chame a função do novo modal de edição

    attachEventListeners();
}

function attachEventListeners() {
    // Limpar eventos anteriores para evitar duplicatas
    // ...

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

    // Handler para o botão "Adicionar Transação"
    const openModalButton = document.getElementById('open-modal-button');
    if (openModalButton) openModalButton.onclick = () => {
        state.isModalOpen = true;
        state.modalView = 'transaction';
        state.editingTransactionId = null;
        state.confirmingDelete = false; // LINHA ADICIONADA
        state.isCreatingTag = false;
        state.modalTransactionType = 'expense';
        renderApp();
    };

    const prevMonthChartButton = document.getElementById('prev-month-chart-button'); if (prevMonthChartButton) prevMonthChartButton.onclick = () => handleChangeMonth(-1);
    const nextMonthChartButton = document.getElementById('next-month-chart-button'); if (nextMonthChartButton) nextMonthChartButton.onclick = () => handleChangeMonth(1);
    const copyCodeButton = document.getElementById('copy-code-button'); if (copyCodeButton) copyCodeButton.onclick = () => navigator.clipboard.writeText(state.family.code).then(() => showToast('Código copiado!', 'success'));
    const prevMonthButton = document.getElementById('prev-month-button'); if (prevMonthButton) prevMonthButton.onclick = () => handleChangeMonth(-1);
    const nextMonthButton = document.getElementById('next-month-button'); if (nextMonthButton) nextMonthButton.onclick = () => handleChangeMonth(1);
    document.querySelectorAll('.filter-button').forEach(button => button.onclick = (e) => { state.detailsFilterType = e.currentTarget.dataset.filter; state.selectedDate = null; renderApp(); });
    
    // CORREÇÃO: Lógica de clique no dia do calendário para limpar o filtro
    document.querySelectorAll('.calendar-day').forEach(day => day.onclick = e => {
        const recordsList = document.getElementById('records-list-wrapper');
        const dayNumber = parseInt(e.currentTarget.dataset.day);
        if (recordsList) {
            recordsList.classList.add('content-fade-out');
            setTimeout(() => {
                // Se o dia clicado já está selecionado, ele limpa o filtro (null)
                state.selectedDate = (state.selectedDate === dayNumber) ? null : dayNumber;
                renderApp();
            }, 150);
        }
    });

    const clearDateFilterButton = document.getElementById('clear-date-filter'); if (clearDateFilterButton) clearDateFilterButton.onclick = () => { state.selectedDate = null; renderApp(); };
    
    // Handler para abrir a edição de transação
    document.querySelectorAll('.transaction-item').forEach(item => item.onclick = e => {
        const transactionId = e.currentTarget.dataset.transactionId;
        state.editingTransactionId = transactionId;
        state.isModalOpen = true;
        state.modalView = 'transaction';
        state.confirmingDelete = false; // LINHA ADICIONADA
        renderApp();
    });

    const addBudgetButton = document.getElementById('add-budget-button'); if (addBudgetButton) addBudgetButton.onclick = () => { state.isModalOpen = true; state.modalView = 'budget'; state.editingBudgetItemId = null; renderApp(); };
    document.querySelectorAll('.budget-item').forEach(item => item.onclick = e => { state.editingBudgetItemId = e.currentTarget.dataset.budgetId; state.isModalOpen = true; state.modalView = 'budget'; renderApp(); });
    
    // Handler para fechar a modal
    const closeModalButton = document.getElementById('close-modal-button');
    if (closeModalButton) closeModalButton.onclick = () => {
        state.isModalOpen = false;
        state.editingTransactionId = null;
        state.editingBudgetItemId = null;
        state.confirmingDelete = false; // LINHA ADICIONADA
        renderApp();
    };
    
    const addTransactionForm = document.getElementById('add-transaction-form'); if (addTransactionForm) addTransactionForm.onsubmit = handleAddTransaction;
    const editTransactionForm = document.getElementById('edit-transaction-form'); if (editTransactionForm) editTransactionForm.onsubmit = handleUpdateTransaction;
    
    // Handler para o botão "Excluir"
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
    const createTagForm = document.getElementById('create-tag-form'); if (createTagForm) createTagForm.onsubmit = handleSaveNewTag;
    
    const swipeTarget = document.getElementById('view-content');
    if (swipeTarget && ['dashboard', 'records'].includes(state.currentView)) {
        let touchStartX = 0; let touchEndX = 0;
        swipeTarget.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        swipeTarget.addEventListener('touchend', e => { touchEndX = e.changedTouches[0].screenX; if (touchEndX < touchStartX - 50) handleChangeMonth(1); if (touchEndX > touchStartX + 50) handleChangeMonth(-1); });
    }
    const familyInfoButton = document.getElementById('family-info-button');
    if (familyInfoButton) {
        familyInfoButton.onclick = () => {
            state.isModalOpen = true;
            state.modalView = 'familyInfo';
            renderApp();
        };
    }

     // NOVO: Evento para o botão "Trocar de Família"
     const switchFamilyButton = document.getElementById('switch-family-button');
     if (switchFamilyButton) {
         switchFamilyButton.onclick = handleSwitchFamily;
     }
 

    // Gerenciamento de gráficos
    if (state.currentView === 'dashboard') {
        if (destroyChartsCallback) {
            destroyChartsCallback();
            destroyChartsCallback = null;
        }
        destroyChartsCallback = renderChartsUI();
    } else if (destroyChartsCallback) {
        destroyChartsCallback();
        destroyChartsCallback = null;
    }

    document.querySelectorAll('.transaction-type-button').forEach(button => {
        button.onclick = (e) => {
            if (state.modalTransactionType !== e.currentTarget.dataset.type) {
                state.modalTransactionType = e.currentTarget.dataset.type;
                renderApp(); // re-renderiza para atualizar a UI do modal
            }
        };
    });

    const manageCategoriesButton = document.getElementById('manage-categories-button');
    if (manageCategoriesButton) {
        manageCategoriesButton.onclick = () => {
            state.isModalOpen = true;
            state.modalView = 'manageCategories';
            renderApp();
        };
    }
    
    // NOVO: Handler para os botões "Editar" de cada categoria
    document.querySelectorAll('.edit-category-button').forEach(button => {
        button.onclick = (event) => {
            const categoryToEdit = event.target.dataset.categoryName;
            state.editingCategory = categoryToEdit;
            state.isModalOpen = true;
            state.modalView = 'editCategory';
            renderApp();
        };
    });

    // NOVO: Handler para o botão "Cancelar" no modal de edição
    const cancelEditButton = document.getElementById('cancel-edit-button');
    if (cancelEditButton) {
        cancelEditButton.onclick = () => {
            state.isModalOpen = false;
            state.modalView = '';
            state.editingCategory = '';
            renderApp();
        };
    }

    // Handler para o formulário de edição de categoria
    const editCategoryForm = document.getElementById('edit-category-form');
    if (editCategoryForm) {
        editCategoryForm.onsubmit = handleUpdateCategory; // Conecta com a nova função
    }

    // Handler para o botão "Adicionar Nova Categoria" dentro do modal de GERENCIAR
    const addNewCategoryButton = document.getElementById('add-new-category-button');
    if (addNewCategoryButton) {
        addNewCategoryButton.onclick = () => {
            state.isModalOpen = true;
            state.modalParentView = 'manageCategories'; // <--- RASTREIA A ORIGEM
            state.modalView = 'newTag';
            renderApp();
        };
    }
    
    // ... (Seu código atual)

    // Handler para o select de categoria (quando escolhe '--create-new--')
    const categorySelect = document.getElementById('category'); 
    if (categorySelect) categorySelect.onchange = (e) => { 
        if (e.target.value === '--create-new--') { 
            state.modalParentView = 'transaction'; // <--- RASTREIA A ORIGEM
            state.modalView = 'newTag'; 
            renderApp(); 
        } 
    };
    
    // Handler para o botão "Cancelar" no modal de criação de tags
    const cancelTagCreation = document.getElementById('cancel-tag-creation'); 
    if (cancelTagCreation) cancelTagCreation.onclick = () => { 
        // Retorna para o pai rastreado
        state.modalView = state.modalParentView || 'transaction'; 
        state.modalParentView = ''; // Limpa o estado
        renderApp(); 
    };

    // Handler para os botões "Editar" de cada categoria
    document.querySelectorAll('.edit-category-button').forEach(button => {
        button.onclick = (event) => {
            const categoryToEdit = event.target.dataset.categoryName;
            state.editingCategory = categoryToEdit;
            state.confirmingDelete = false; // Garante que a confirmação esteja oculta ao abrir
            state.isModalOpen = true;
            state.modalView = 'editCategory';
            renderApp();
        };
    });

    // ... (Seu código atual)

    // Handler para o botão "Excluir" no modal de edição de categoria
    const deleteCategoryButton = document.getElementById('delete-category-button');
    if (deleteCategoryButton) {
        deleteCategoryButton.onclick = () => {
             // NOVO: Apenas mostra a confirmação, não exclui ainda
            state.confirmingDelete = true;
            renderApp();
        };
    }
    
    // NOVO: Handler para o botão "Sim" na confirmação
    const confirmDeleteYes = document.getElementById('confirm-delete-yes'); 
    if (confirmDeleteYes) confirmDeleteYes.onclick = () => {
        handleDeleteCategory(); // Chama a função de exclusão
        state.confirmingDelete = false; // Limpa o estado
    };

    // NOVO: Handler para o botão "Não" na confirmação
    const confirmDeleteNo = document.getElementById('confirm-delete-no'); 
    if (confirmDeleteNo) confirmDeleteNo.onclick = () => { 
        state.confirmingDelete = false; // Oculta a confirmação
        renderApp();
    };

    const shareLinkButton = document.getElementById('share-link-button'); 
if (shareLinkButton) shareLinkButton.onclick = () => navigator.clipboard.writeText(`${window.location.origin}/?code=${state.family.code}`).then(() => showToast('Link de convite copiado!', 'success'));

}

// --- PONTO DE PARTIDA E CONTROLE DE AUTH ---
firebase.onAuthStateChanged(auth, async (user) => {
    if (user) {
        state.user = { uid: user.uid, email: user.email, name: user.displayName || user.email.split('@')[0] };
        state.userFamilies = await fetchUserFamilies();

        // --- NOVO: LÓGICA DE CONVITE POR LINK ---
        const urlParams = new URLSearchParams(window.location.search);
        const inviteCode = urlParams.get('code');

        // Só tenta entrar se houver um código e o usuário não estiver em uma família
        if (inviteCode && !state.family) {
            const success = await handleJoinFamilyFromLink(inviteCode); 
            
            // Se o código for processado (sucesso ou falha), limpamos o código da URL
            if (success || inviteCode) {
                 // Use replaceState para remover o código da URL sem recarregar a página
                history.replaceState(null, '', window.location.pathname);
            }
        }
        // ----------------------------------------

    } else {
        state.user = null; state.family = null; state.transactions = []; state.userFamilies = []; state.budgets = [];
        state.currentView = 'auth';
    }
    renderApp();
});