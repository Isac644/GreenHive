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
    handleJoinFamilyFromLink,
    subscribeToNotifications, 
    toggleNotificationMenu, 
    handleAcceptJoinRequest, 
    handleRejectJoinRequest,
    handleDeleteNotification,
    handleEnterFamilyFromNotification,
    handleResetPassword,
    handleUpdateProfile, 
    handleChangePassword, 
    handleUpdateFamilyName, 
    handleRegenerateCode,
    // --- ADICIONE AS IMPORTAÇÕES ABAIXO QUE ESTAVAM FALTANDO ---
    handlePromoteMember,
    handleKickMember,
    handleDeleteFamily,
    // NOVOS:
    handleConfirmAction,
    closeConfirmation
} from "./state-and-handlers.js";

import {
    renderHeader, renderAuthPage, renderFamilyOnboardingPage,
    renderMainContent, renderTransactionModal, renderBudgetModal, renderFamilyInfoModal,
    renderCharts as renderChartsUI,
    renderManageCategoriesModal,
    renderEditCategoryModal,
    renderSettingsModal,
    renderConfirmationModal // NOVO
} from "./ui-components.js";

const root = document.getElementById('root');
const toastContainer = document.getElementById('toast-container');
let destroyChartsCallback = null;

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

export function renderApp() {
    document.documentElement.className = state.theme;

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

    root.insertAdjacentHTML('beforeend', renderTransactionModal());
    root.insertAdjacentHTML('beforeend', renderBudgetModal());
    root.insertAdjacentHTML('beforeend', renderFamilyInfoModal());
    root.insertAdjacentHTML('beforeend', renderManageCategoriesModal());
    root.insertAdjacentHTML('beforeend', renderEditCategoryModal());
    root.insertAdjacentHTML('beforeend', renderSettingsModal()); 
    root.insertAdjacentHTML('beforeend', renderConfirmationModal());

    attachEventListeners();
}

function attachEventListeners() {
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
    
    // Navegação por abas
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

    const openModalButton = document.getElementById('open-modal-button');
    if (openModalButton) openModalButton.onclick = () => {
        state.isModalOpen = true;
        state.modalView = 'transaction';
        state.editingTransactionId = null;
        state.confirmingDelete = false;
        state.isCreatingTag = false;
        state.modalTransactionType = 'expense';
        renderApp();
    };

    const prevMonthChartButton = document.getElementById('prev-month-chart-button'); if (prevMonthChartButton) prevMonthChartButton.onclick = () => handleChangeMonth(-1);
    const nextMonthChartButton = document.getElementById('next-month-chart-button'); if (nextMonthChartButton) nextMonthChartButton.onclick = () => handleChangeMonth(1);
    
    document.querySelectorAll('#copy-code-button').forEach(button => {
        if (button) button.onclick = () => navigator.clipboard.writeText(state.family.code).then(() => showToast('Código copiado!', 'success'));
    });

    const prevMonthButton = document.getElementById('prev-month-button'); if (prevMonthButton) prevMonthButton.onclick = () => handleChangeMonth(-1);
    const nextMonthButton = document.getElementById('next-month-button'); if (nextMonthButton) nextMonthButton.onclick = () => handleChangeMonth(1);
    document.querySelectorAll('.filter-button').forEach(button => button.onclick = (e) => { state.detailsFilterType = e.currentTarget.dataset.filter; state.selectedDate = null; renderApp(); });
    
    document.querySelectorAll('.calendar-day').forEach(day => day.onclick = e => {
        const recordsList = document.getElementById('records-list-wrapper');
        const dayNumber = parseInt(e.currentTarget.dataset.day);
        if (recordsList) {
            recordsList.classList.add('content-fade-out');
            setTimeout(() => {
                state.selectedDate = (state.selectedDate === dayNumber) ? null : dayNumber;
                renderApp();
            }, 150);
        }
    });

    const clearDateFilterButton = document.getElementById('clear-date-filter'); if (clearDateFilterButton) clearDateFilterButton.onclick = () => { state.selectedDate = null; renderApp(); };
    
    document.querySelectorAll('.transaction-item').forEach(item => item.onclick = e => {
        const transactionId = e.currentTarget.dataset.transactionId;
        state.editingTransactionId = transactionId;
        state.isModalOpen = true;
        state.modalView = 'transaction';
        state.confirmingDelete = false;
        renderApp();
    });

    const addBudgetButton = document.getElementById('add-budget-button'); if (addBudgetButton) addBudgetButton.onclick = () => { state.isModalOpen = true; state.modalView = 'budget'; state.editingBudgetItemId = null; renderApp(); };
    document.querySelectorAll('.budget-item').forEach(item => item.onclick = e => { state.editingBudgetItemId = e.currentTarget.dataset.budgetId; state.isModalOpen = true; state.modalView = 'budget'; renderApp(); });
    
    document.querySelectorAll('#close-modal-button').forEach(button => {
        if (button) button.onclick = () => {
            state.isModalOpen = false;
            state.editingTransactionId = null;
            state.editingBudgetItemId = null;
            state.confirmingDelete = false;
            renderApp();
        };
    });
    
    const addTransactionForm = document.getElementById('add-transaction-form'); if (addTransactionForm) addTransactionForm.onsubmit = handleAddTransaction;
    const editTransactionForm = document.getElementById('edit-transaction-form'); if (editTransactionForm) editTransactionForm.onsubmit = handleUpdateTransaction;
    
    const deleteTransactionButton = document.getElementById('delete-transaction-button'); if (deleteTransactionButton) deleteTransactionButton.onclick = () => { state.confirmingDelete = true; renderApp(); };
    
    const budgetForm = document.getElementById('budget-form'); if (budgetForm) budgetForm.onsubmit = handleSaveBudget;
    const deleteBudgetButton = document.getElementById('delete-budget-button'); if (deleteBudgetButton) deleteBudgetButton.onclick = () => { state.confirmingDelete = true; renderApp(); };
    const budgetTypeSelect = document.getElementById('budgetType'); if (budgetTypeSelect) budgetTypeSelect.onchange = () => {
        const form = budgetTypeSelect.closest('form');
        const type = budgetTypeSelect.value;
        const allIncomeCategories = [...(state.userCategories.income || [])];
        const allExpenseCategories = [...(state.userCategories.expense || [])];
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
    
    // Modal de Informações da Família
    const familyInfoButton = document.getElementById('family-info-button');
    if (familyInfoButton) {
        familyInfoButton.onclick = () => {
            state.isModalOpen = true;
            state.modalView = 'familyInfo';
            renderApp();
        };
    }

    // --- NOVOS LISTENERS DO MODAL DA FAMÍLIA ---
    const switchFamilyHeaderBtn = document.getElementById('switch-family-header-button');
    if (switchFamilyHeaderBtn) switchFamilyHeaderBtn.onclick = handleSwitchFamily;

    const switchFamilyModalBtn = document.getElementById('switch-family-button');
    if (switchFamilyModalBtn) switchFamilyModalBtn.onclick = handleSwitchFamily;

    const leaveFamilyModalBtn = document.getElementById('leave-family-modal-button');
    if (leaveFamilyModalBtn) leaveFamilyModalBtn.onclick = handleLeaveFamily; // Lógica inteligente

    const deleteFamilyBtn = document.getElementById('delete-family-button');
    if (deleteFamilyBtn) deleteFamilyBtn.onclick = handleDeleteFamily; // Lógica de exclusão

    // Editar Nome da Família
    const editFamilyNameBtn = document.getElementById('edit-family-name-btn');
    if (editFamilyNameBtn) {
        editFamilyNameBtn.onclick = () => {
            document.getElementById('family-name-display').classList.add('hidden');
            document.getElementById('family-name-edit').classList.remove('hidden');
            document.getElementById('edit-family-name-input').focus();
        };
    }
    const cancelNameEditBtn = document.getElementById('cancel-name-edit');
    if (cancelNameEditBtn) {
        cancelNameEditBtn.onclick = () => {
            document.getElementById('family-name-display').classList.remove('hidden');
            document.getElementById('family-name-edit').classList.add('hidden');
        };
    }
    const familyNameEditForm = document.getElementById('family-name-edit');
    if (familyNameEditForm) familyNameEditForm.onsubmit = handleUpdateFamilyName;

    // Regenerar Código
    const regenerateCodeBtnInfo = document.getElementById('regenerate-code-btn');
    if (regenerateCodeBtnInfo) regenerateCodeBtnInfo.onclick = handleRegenerateCode;

    // Botões de Membros (Promover/Remover)
    document.querySelectorAll('.promote-member-btn').forEach(btn => {
        btn.onclick = (e) => {
            const uid = e.currentTarget.dataset.uid;
            handlePromoteMember(uid);
        };
    });

    document.querySelectorAll('.kick-member-btn').forEach(btn => {
        btn.onclick = (e) => {
            const uid = e.currentTarget.dataset.uid;
            const name = e.currentTarget.dataset.name;
            handleKickMember(uid, name);
        };
    });
    // -----------------------------------------

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
                renderApp();
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
    
    document.querySelectorAll('.edit-category-button').forEach(button => {
        button.onclick = (event) => {
            const categoryToEdit = event.target.dataset.categoryName;
            state.editingCategory = categoryToEdit;
            state.isModalOpen = true;
            state.modalView = 'editCategory';
            renderApp();
        };
    });

    const cancelEditButton = document.getElementById('cancel-edit-button');
    if (cancelEditButton) {
        cancelEditButton.onclick = () => {
            state.isModalOpen = false;
            state.modalView = '';
            state.editingCategory = '';
            renderApp();
        };
    }

    const editCategoryForm = document.getElementById('edit-category-form');
    if (editCategoryForm) {
        editCategoryForm.onsubmit = handleUpdateCategory;
    }

    const addNewCategoryButton = document.getElementById('add-new-category-button');
    if (addNewCategoryButton) {
        addNewCategoryButton.onclick = () => {
            state.isModalOpen = true;
            state.modalParentView = 'manageCategories';
            state.modalView = 'newTag';
            renderApp();
        };
    }
    
    const categorySelect = document.getElementById('category'); 
    if (categorySelect) categorySelect.onchange = (e) => { 
        if (e.target.value === '--create-new--') { 
            state.modalParentView = 'transaction';
            state.modalView = 'newTag'; 
            renderApp(); 
        } 
    };
    
    const cancelTagCreation = document.getElementById('cancel-tag-creation'); 
    if (cancelTagCreation) cancelTagCreation.onclick = () => { 
        state.modalView = state.modalParentView || 'transaction'; 
        state.modalParentView = '';
        renderApp(); 
    };

    const deleteCategoryButton = document.getElementById('delete-category-button');
    if (deleteCategoryButton) {
        deleteCategoryButton.onclick = () => {
            state.confirmingDelete = true;
            renderApp();
        };
    }
    
    const confirmDeleteYes = document.getElementById('confirm-delete-yes'); 
    if (confirmDeleteYes) confirmDeleteYes.onclick = () => {
        if (state.editingCategory) {
            handleDeleteCategory();
        } else if (state.editingTransactionId) {
            handleDeleteTransaction();
        } else if (state.editingBudgetItemId) {
            handleDeleteBudget();
        }
        state.confirmingDelete = false;
    };

    const confirmDeleteNo = document.getElementById('confirm-delete-no'); 
    if (confirmDeleteNo) confirmDeleteNo.onclick = () => { 
        state.confirmingDelete = false;
        renderApp();
    };

    const shareLinkButton = document.getElementById('share-link-button'); 
    if (shareLinkButton) shareLinkButton.onclick = () => navigator.clipboard.writeText(`${window.location.origin}/?code=${state.family.code}`).then(() => showToast('Link de convite copiado!', 'success'));

    const notificationButton = document.getElementById('notification-button');
    if (notificationButton) {
        notificationButton.onclick = (e) => {
            e.stopPropagation(); // Evita fechar ao clicar no botão
            toggleNotificationMenu();
        };
    }

    // Fecha dropdowns se clicar fora
    document.addEventListener('click', (e) => {
        if (state.isNotificationMenuOpen && !e.target.closest('#notification-button') && !e.target.closest('.absolute.right-0')) {
            toggleNotificationMenu();
        }
    });
    
    // Botões de Notificação
    document.querySelectorAll('.accept-request-btn').forEach(btn => {
        btn.onclick = (e) => {
            const notifId = e.currentTarget.dataset.notifId;
            const notif = state.notifications.find(n => n.id === notifId);
            if (notif) handleAcceptJoinRequest(notif);
        };
    });

    document.querySelectorAll('.reject-request-btn').forEach(btn => {
        btn.onclick = (e) => {
            const notifId = e.currentTarget.dataset.notifId;
            handleRejectJoinRequest(notifId);
        };
    });

    document.querySelectorAll('.delete-notif-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation(); 
            const notifId = e.currentTarget.dataset.id;
            handleDeleteNotification(notifId);
        };
    });

    document.querySelectorAll('.enter-family-notif-btn').forEach(btn => {
        btn.onclick = (e) => {
            const notifId = e.currentTarget.dataset.notifId;
            const notif = state.notifications.find(n => n.id === notifId);
            if (notif) handleEnterFamilyFromNotification(notif);
        };
    });

    // Auth Listeners
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    if (forgotPasswordLink) {
        forgotPasswordLink.onclick = (e) => {
            e.preventDefault();
            state.authView = 'forgot-password';
            renderApp();
        };
    }

    const resetPasswordForm = document.getElementById('reset-password-form');
    if (resetPasswordForm) {
        resetPasswordForm.onsubmit = handleResetPassword;
    }

    const backToLoginLink = document.getElementById('back-to-login-link');
    if (backToLoginLink) {
        backToLoginLink.onclick = () => {
            state.authView = 'login';
            renderApp();
        };
    }
    
    const backToLoginSuccess = document.getElementById('back-to-login-success-button');
    if (backToLoginSuccess) {
        backToLoginSuccess.onclick = () => {
            state.authView = 'login';
            renderApp();
        };
    }

    const toggleChartsButton = document.getElementById('toggle-charts-button');
    if (toggleChartsButton) {
        toggleChartsButton.onclick = () => {
            const container = document.getElementById('secondary-charts-container');
            const icon = document.getElementById('toggle-icon');
            const btnText = toggleChartsButton.querySelector('span');

            if (container.classList.contains('hidden')) {
                container.classList.remove('hidden');
                icon.classList.add('rotate-180');
                btnText.textContent = "Ocultar gráficos";
                if (window.renderSecondaryCharts) window.renderSecondaryCharts();
                container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                container.classList.add('hidden');
                icon.classList.remove('rotate-180');
                btnText.textContent = "Exibir mais gráficos";
            }
        };
    }

    const openSettingsBtn = document.getElementById('open-settings-button');
    if (openSettingsBtn) {
        openSettingsBtn.onclick = () => {
            state.isModalOpen = true;
            state.modalView = 'settings';
            state.settingsTab = 'profile'; 
            document.getElementById('user-menu').classList.add('hidden');
            renderApp();
        };
    }

    // Configurações
    const updateProfileForm = document.getElementById('update-profile-form');
    if (updateProfileForm) updateProfileForm.onsubmit = handleUpdateProfile;

    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) changePasswordForm.onsubmit = handleChangePassword;

    const togglePasswordBtn = document.getElementById('toggle-password-btn');
    if (togglePasswordBtn) {
        togglePasswordBtn.onclick = () => {
            const formContainer = document.getElementById('password-form-container');
            const chevron = document.getElementById('password-chevron');
            if (formContainer.classList.contains('hidden')) {
                formContainer.classList.remove('hidden');
                chevron.classList.add('rotate-180');
            } else {
                formContainer.classList.add('hidden');
                chevron.classList.remove('rotate-180');
            }
        };
    }

    // Listeners do Modal de Confirmação Global
    const confirmYesBtn = document.getElementById('confirm-modal-yes');
    if (confirmYesBtn) confirmYesBtn.onclick = handleConfirmAction;

    const confirmCancelBtn = document.getElementById('confirm-modal-cancel');
    if (confirmCancelBtn) confirmCancelBtn.onclick = closeConfirmation;
}

let unsubscribeNotifications = null;

firebase.onAuthStateChanged(auth, async (user) => {
    if (state.isSigningUp) return; 

    if (user) {
        // DETECTA SE É USER GOOGLE: Verifica se algum provedor é 'google.com'
        const isGoogle = user.providerData.some(p => p.providerId === 'google.com');

        state.user = { 
            uid: user.uid, 
            email: user.email, 
            name: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL,
            isGoogle: isGoogle // SALVAMOS AQUI
        };
        
        state.userFamilies = await fetchUserFamilies();
        
        if (unsubscribeNotifications) unsubscribeNotifications(); 
        unsubscribeNotifications = subscribeToNotifications();
        
    } else {
        if (unsubscribeNotifications) unsubscribeNotifications();
        state.user = null; 
        state.family = null; 
        state.transactions = []; 
        state.userFamilies = []; 
        state.budgets = [];
        
        state.isModalOpen = false;
        state.modalView = '';
        state.isNotificationMenuOpen = false;

        if (state.authView !== 'signup-success') {
            state.currentView = 'auth';
        }
    }
    renderApp();
});