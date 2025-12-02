// main.js
import { auth, firebase } from "./firebase-config.js";
import {
  state,
  handleLogin,
  handleSignup,
  handleGoogleLogin,
  handleLogout,
  handleCreateFamily,
  handleJoinFamily,
  handleSelectFamily,
  handleLeaveFamily,
  handleAddTransaction,
  handleUpdateTransaction,
  handleDeleteTransaction,
  handleSaveBudget,
  handleDeleteBudget,
  handleSaveNewTag,
  handleChangeMonth,
  handleToggleTheme,
  fetchUserFamilies,
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
  handlePromoteMember,
  handleKickMember,
  handleDemoteMember,
  handleConfirmAction,
  closeConfirmation,
  handleSaveDebt,
  handleDeleteDebt,
  handleSaveInstallment,
  handleDeleteInstallment,
  handleDeleteFamily,
  requestNotificationPermission,
  handleSaveGoal,
  handleDeleteGoal,
  handleOpenFilters,
  handleApplyFilters,
  handleClearFilters,
  handleToggleFilterMember,
  handleToggleFilterCategory,
  handleToggleFilterType,
  handleToggleFilterDate,
  subscribeToUserFamilies,
  handleExportExcel,
  handleOpenExportModal,
  handleExportCSV,
  handleExportPDF,
} from "./state-and-handlers.js";
import {
  renderHeader,
  renderAuthPage,
  renderFamilyOnboardingPage,
  renderMainContent,
  renderTransactionModal,
  renderBudgetModal,
  renderFamilyInfoModal,
  renderCharts as renderChartsUI,
  renderManageCategoriesModal,
  renderEditCategoryModal,
  renderSettingsModal,
  renderConfirmationModal,
  renderDebtsPage,
  renderDebtModal,
  renderInstallmentModal,
  renderLoadingScreen,
  renderFilterModal,
  renderGoalsPage,
  renderGoalModal,
  renderExportModal,
} from "./ui-components.js";

const root = document.getElementById("root");
const toastContainer = document.getElementById("toast-container");
let destroyChartsCallback = null;

const urlParams = new URLSearchParams(window.location.search);
const inviteCodeFromUrl = urlParams.get("code");
if (inviteCodeFromUrl) {
  sessionStorage.setItem("pendingInviteCode", inviteCodeFromUrl);
}

export function showToast(message, type) {
  const toast = document.createElement("div");
  toast.className = `toast ${type} animate-fade-in`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

export function renderApp(isDataUpdate = false) {
  const currentScrollY = window.scrollY;

  document.documentElement.className = state.theme;

  if (state.isLoading) {
    root.innerHTML = renderLoadingScreen();
    return;
  }
  document.querySelector("body > header")?.remove();
  if (state.user)
    document.body.insertAdjacentHTML("afterbegin", renderHeader());

  // --- RENDERIZAÇÃO INTELIGENTE ---

  if (isDataUpdate && state.isModalOpen) {
    const viewContainer = document.getElementById("view-content");
    if (viewContainer) {
      let newContent = "";
      if (state.currentView === "dashboard")
        newContent = renderFamilyDashboard();
      else if (state.currentView === "records")
        newContent = renderRecordsPage();
      else if (state.currentView === "budget") newContent = renderBudgetPage();
      else if (state.currentView === "debts") newContent = renderDebtsPage();
      else if (state.currentView === "goals") newContent = renderGoalsPage();

      viewContainer.innerHTML = newContent;
    }
    attachEventListeners();
    window.scrollTo(0, currentScrollY);
    return;
  }

  let contentHTML = "";
  if (!state.user) contentHTML = renderAuthPage();
  else if (!state.family) contentHTML = renderFamilyOnboardingPage();
  else contentHTML = renderMainContent();

  root.innerHTML = contentHTML;

  // Re-insere Modais
  root.insertAdjacentHTML("beforeend", renderTransactionModal());
  root.insertAdjacentHTML("beforeend", renderBudgetModal());
  root.insertAdjacentHTML("beforeend", renderFamilyInfoModal());
  root.insertAdjacentHTML("beforeend", renderManageCategoriesModal());
  root.insertAdjacentHTML("beforeend", renderEditCategoryModal());
  root.insertAdjacentHTML("beforeend", renderSettingsModal());
  root.insertAdjacentHTML("beforeend", renderConfirmationModal());
  root.insertAdjacentHTML("beforeend", renderDebtModal());
  root.insertAdjacentHTML("beforeend", renderInstallmentModal());
  root.insertAdjacentHTML("beforeend", renderFilterModal());
  root.insertAdjacentHTML("beforeend", renderGoalModal());
  root.insertAdjacentHTML("beforeend", renderExportModal());

  attachEventListeners();

  // --- GERENCIAMENTO DE SCROLL E ANIMAÇÃO ---

  if (isDataUpdate) {
    window.scrollTo(0, currentScrollY);
  } else {
    const activeTab = document.querySelector(
      `.nav-tab[data-view="${state.currentView}"]`
    );
    if (activeTab) {
      activeTab.scrollIntoView({
        behavior: "auto",
        block: "nearest",
        inline: "center",
      });
    }
  }

  if (state.shouldAnimate) {
    state.shouldAnimate = false;
  }
}

function attachEventListeners() {
  // --- 1. AUTH & ONBOARDING ---
  const loginForm = document.getElementById("login-form");
  if (loginForm) loginForm.onsubmit = handleLogin;
  const signupForm = document.getElementById("signup-form");
  if (signupForm) signupForm.onsubmit = handleSignup;
  const switchToSignup = document.getElementById("switch-to-signup");
  if (switchToSignup)
    switchToSignup.onclick = () => {
      state.authView = "signup";
      renderApp();
    };
  const switchToLogin = document.getElementById("switch-to-login");
  if (switchToLogin)
    switchToLogin.onclick = () => {
      state.authView = "login";
      renderApp();
    };
  const googleLoginBtn = document.getElementById("google-login-button");
  if (googleLoginBtn) googleLoginBtn.onclick = handleGoogleLogin;
  const forgotPassLink = document.getElementById("forgot-password-link");
  if (forgotPassLink)
    forgotPassLink.onclick = (e) => {
      e.preventDefault();
      state.authView = "forgot-password";
      renderApp();
    };
  const resetPassForm = document.getElementById("reset-password-form");
  if (resetPassForm) resetPassForm.onsubmit = handleResetPassword;
  const backToLoginLink = document.getElementById("back-to-login-link");
  if (backToLoginLink)
    backToLoginLink.onclick = () => {
      state.authView = "login";
      renderApp();
    };
  const backToLoginSuccess = document.getElementById(
    "back-to-login-success-button"
  );
  if (backToLoginSuccess)
    backToLoginSuccess.onclick = () => {
      state.authView = "login";
      renderApp();
    };
  const createFamilyForm = document.getElementById("create-family-form");
  if (createFamilyForm) createFamilyForm.onsubmit = handleCreateFamily;
  const joinFamilyForm = document.getElementById("join-family-form");
  if (joinFamilyForm) joinFamilyForm.onsubmit = handleJoinFamily;
  document
    .querySelectorAll(".select-family-button")
    .forEach(
      (b) =>
        (b.onclick = (e) =>
          handleSelectFamily(e.currentTarget.dataset.familyId))
    );

  // --- 2. HEADER & MENUS ---
  const userMenuBtn = document.getElementById("user-menu-button");
  if (userMenuBtn)
    userMenuBtn.onclick = (e) => {
      e.stopPropagation();
      const menu = document.getElementById("user-menu");
      menu.classList.toggle("hidden");
      state.isNotificationMenuOpen = false;
    };

  const notifBtn = document.getElementById("notification-button");
  if (notifBtn)
    notifBtn.onclick = (e) => {
      e.stopPropagation();
      document.getElementById("user-menu")?.classList.add("hidden");
      toggleNotificationMenu();
    };

  const logoutBtn = document.getElementById("logout-button");
  if (logoutBtn) logoutBtn.onclick = handleLogout;
  const themeToggle = document.getElementById("theme-toggle-button");
  if (themeToggle) themeToggle.onclick = handleToggleTheme;
  const openSettingsBtn = document.getElementById("open-settings-button");
  if (openSettingsBtn)
    openSettingsBtn.onclick = () => {
      state.isModalOpen = true;
      state.modalView = "settings";
      state.settingsTab = "profile";
      document.getElementById("user-menu").classList.add("hidden");
      renderApp();
    };

  // --- LÓGICA GLOBAL DE CLICAR FORA (Menus e Modais) ---
  document.onclick = (e) => {
    // Fechar User Menu se clicar fora
    if (
      !e.target.closest("#user-menu-button") &&
      !e.target.closest("#user-menu")
    ) {
      document.getElementById("user-menu")?.classList.add("hidden");
    }
    // Fechar Notificações se clicar fora
    if (
      state.isNotificationMenuOpen &&
      !e.target.closest("#notification-button") &&
      !e.target.closest(".absolute.right-0")
    ) {
      toggleNotificationMenu();
    }
  };

  // Fechar Modal ao clicar no Overlay (Fundo escuro)
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        state.isModalOpen = false;
        state.editingTransactionId = null;
        state.editingBudgetItemId = null;
        state.editingDebtId = null;
        state.editingInstallmentId = null;
        state.editingCategory = "";
        state.confirmingDelete = false;
        renderApp();
      }
    };
  });

  // --- 3. NAVEGAÇÃO (ABAS) ---
  document.querySelectorAll(".nav-tab").forEach(
    (tab) =>
      (tab.onclick = (e) => {
        const newView = e.currentTarget.dataset.view;
        if (state.currentView !== newView) {
          state.shouldAnimate = true;
          state.currentView = newView;
          renderApp();
        }
      })
  );
  const detailsBtn = document.getElementById("details-button");
  if (detailsBtn)
    detailsBtn.onclick = () => {
      state.shouldAnimate = true;
      state.currentView = "records";
      renderApp();
    };

  // --- 4. FILTROS E MESES ---
  const prevM = document.getElementById("prev-month-button");
  if (prevM) prevM.onclick = () => handleChangeMonth(-1);
  const nextM = document.getElementById("next-month-button");
  if (nextM) nextM.onclick = () => handleChangeMonth(1);
  const prevMC = document.getElementById("prev-month-chart-button");
  if (prevMC) prevMC.onclick = () => handleChangeMonth(-1);
  const nextMC = document.getElementById("next-month-chart-button");
  if (nextMC) nextMC.onclick = () => handleChangeMonth(1);

  // Filtros
  document.querySelectorAll(".filter-type-btn").forEach((btn) => {
    btn.onclick = (e) => handleToggleFilterType(e.currentTarget.dataset.type);
  });
  document.querySelectorAll(".filter-category-btn").forEach((btn) => {
    btn.onclick = (e) =>
      handleToggleFilterCategory(e.currentTarget.dataset.category);
  });
  document.querySelectorAll(".filter-member-btn").forEach((btn) => {
    btn.onclick = (e) => handleToggleFilterMember(e.currentTarget.dataset.uid);
  });
  document.querySelectorAll(".calendar-day-filter").forEach((btn) => {
    btn.onclick = (e) => {
      const day = parseInt(e.currentTarget.dataset.day);
      state.selectedDate = state.selectedDate === day ? null : day;
      state.shouldAnimate = true;
      renderApp();
    };
  });

  // --- 5. MODAIS E CRUD ---

  // Transaction Modal
  const openModalBtn = document.getElementById("open-modal-button");
  if (openModalBtn)
    openModalBtn.onclick = () => {
      state.isModalOpen = true;
      state.modalView = "transaction";
      state.editingTransactionId = null;
      state.modalTransactionType = "expense";
      renderApp();
    };
  document.querySelectorAll(".transaction-item").forEach(
    (i) =>
      (i.onclick = (e) => {
        state.editingTransactionId = e.currentTarget.dataset.transactionId;
        state.isModalOpen = true;
        state.modalView = "transaction";
        renderApp();
      })
  );
  const addTransForm = document.getElementById("add-transaction-form");
  if (addTransForm) addTransForm.onsubmit = handleAddTransaction;
  const editTransForm = document.getElementById("edit-transaction-form");
  if (editTransForm) editTransForm.onsubmit = handleUpdateTransaction;
  const delTransBtn = document.getElementById("delete-transaction-button");
  if (delTransBtn)
    delTransBtn.onclick = () => {
      state.confirmingDelete = true;
      renderApp();
    };
  document.querySelectorAll(".transaction-type-button").forEach(
    (b) =>
      (b.onclick = (e) => {
        state.modalTransactionType = e.currentTarget.dataset.type;
        renderApp();
      })
  );
  const catSelect = document.getElementById("category");
  if (catSelect)
    catSelect.onchange = (e) => {
      if (e.target.value === "--create-new--") {
        state.modalParentView = "transaction";
        state.modalView = "newTag";
        renderApp();
      }
    };

  // Budget Modal

  document.querySelectorAll(".budget-item").forEach(
    (i) =>
      (i.onclick = (e) => {
        state.editingBudgetItemId = e.currentTarget.dataset.budgetId;
        state.isModalOpen = true;
        state.modalView = "budget";
        renderApp();
      })
  );
  const budgetForm = document.getElementById("budget-form");
  if (budgetForm) budgetForm.onsubmit = handleSaveBudget;
  const delBudgetBtn = document.getElementById("delete-budget-button");
  if (delBudgetBtn)
    delBudgetBtn.onclick = () => {
      state.confirmingDelete = true;
      renderApp();
    };

  // Dívidas e Parcelas
  const addDebtBtn = document.getElementById("add-debt-btn");
  if (addDebtBtn)
    addDebtBtn.onclick = () => {
      state.isModalOpen = true;
      state.modalView = "debt";
      state.editingDebtId = null;
      renderApp();
    };
  document.querySelectorAll(".edit-debt-btn").forEach(
    (b) =>
      (b.onclick = (e) => {
        state.editingDebtId = e.currentTarget.dataset.id;
        state.isModalOpen = true;
        state.modalView = "debt";
        renderApp();
      })
  );
  const debtForm = document.getElementById("debt-form");
  if (debtForm) debtForm.onsubmit = handleSaveDebt;
  const delDebtBtn = document.getElementById("delete-debt-modal-btn");
  if (delDebtBtn)
    delDebtBtn.onclick = () => {
      state.confirmingDelete = true;
      renderApp();
    };

  const addInstBtn = document.getElementById("add-installment-btn");
  if (addInstBtn)
    addInstBtn.onclick = () => {
      state.isModalOpen = true;
      state.modalView = "installment";
      state.editingInstallmentId = null;
      renderApp();
    };
  document.querySelectorAll(".edit-installment-btn").forEach(
    (b) =>
      (b.onclick = (e) => {
        state.editingInstallmentId = e.currentTarget.dataset.id;
        state.isModalOpen = true;
        state.modalView = "installment";
        renderApp();
      })
  );
  const instForm = document.getElementById("installment-form");
  if (instForm) instForm.onsubmit = handleSaveInstallment;
  const delInstBtn = document.getElementById("delete-installment-modal-btn");
  if (delInstBtn)
    delInstBtn.onclick = () => {
      state.confirmingDelete = true;
      renderApp();
    };

  // Botões "Fechar" e "Cancelar" (Modais)
  document.querySelectorAll(".close-modal-btn").forEach(
    (b) =>
      (b.onclick = () => {
        state.isModalOpen = false;
        state.editingTransactionId = null;
        state.editingBudgetItemId = null;
        state.editingDebtId = null;
        state.editingInstallmentId = null;
        state.editingCategory = "";
        state.confirmingDelete = false;
        renderApp();
      })
  );

  const confirmNo = document.getElementById("confirm-delete-no");
  if (confirmNo)
    confirmNo.onclick = () => {
      state.confirmingDelete = false;
      renderApp();
    };

  // Family Info & Actions
  const famInfoBtn = document.getElementById("family-info-button");
  if (famInfoBtn)
    famInfoBtn.onclick = () => {
      state.isModalOpen = true;
      state.modalView = "familyInfo";
      renderApp();
    };
  const switchFamHead = document.getElementById("switch-family-header-button");
  if (switchFamHead) switchFamHead.onclick = handleSwitchFamily;
  const switchFamMod = document.getElementById("switch-family-button");
  if (switchFamMod) switchFamMod.onclick = handleSwitchFamily;
  const leaveFamMod = document.getElementById("leave-family-modal-button");
  if (leaveFamMod) leaveFamMod.onclick = handleLeaveFamily;
  const delFamBtn = document.getElementById("delete-family-button");
  if (delFamBtn) delFamBtn.onclick = handleDeleteFamily;
  const editFamNameBtn = document.getElementById("edit-family-name-btn");
  if (editFamNameBtn)
    editFamNameBtn.onclick = () => {
      document.getElementById("family-name-display").classList.add("hidden");
      document.getElementById("family-name-edit").classList.remove("hidden");
      document.getElementById("edit-family-name-input").focus();
    };
  const cancelFamNameBtn = document.getElementById("cancel-name-edit");
  if (cancelFamNameBtn)
    cancelFamNameBtn.onclick = () => {
      document.getElementById("family-name-display").classList.remove("hidden");
      document.getElementById("family-name-edit").classList.add("hidden");
    };
  const famNameForm = document.getElementById("family-name-edit");
  if (famNameForm) famNameForm.onsubmit = handleUpdateFamilyName;
  const regenCodeBtn = document.getElementById("regenerate-code-btn");
  if (regenCodeBtn) regenCodeBtn.onclick = handleRegenerateCode;
  document.querySelectorAll(".copy-code-btn").forEach((button) => {
    button.onclick = () =>
      navigator.clipboard
        .writeText(state.family.code)
        .then(() => showToast("Código copiado!", "success"));
  });
  document
    .querySelectorAll(".promote-member-btn")
    .forEach(
      (b) =>
        (b.onclick = (e) => handlePromoteMember(e.currentTarget.dataset.uid))
    );
  document
    .querySelectorAll(".demote-member-btn")
    .forEach(
      (b) =>
        (b.onclick = (e) => handleDemoteMember(e.currentTarget.dataset.uid))
    );
  document
    .querySelectorAll(".kick-member-btn")
    .forEach(
      (b) =>
        (b.onclick = (e) =>
          handleKickMember(
            e.currentTarget.dataset.uid,
            e.currentTarget.dataset.name
          ))
    );

  // Categories
  const manageCatBtn = document.getElementById("manage-categories-button");
  if (manageCatBtn)
    manageCatBtn.onclick = () => {
      state.isModalOpen = true;
      state.modalView = "manageCategories";
      if (!state.modalTransactionType) state.modalTransactionType = "expense";
      renderApp();
    };
  const addNewCatBtn = document.getElementById("add-new-category-button");
  if (addNewCatBtn)
    addNewCatBtn.onclick = () => {
      state.isModalOpen = true;
      state.modalParentView = "manageCategories";
      state.modalView = "newTag";
      renderApp();
    };
  document.querySelectorAll(".edit-category-button").forEach(
    (b) =>
      (b.onclick = (e) => {
        state.editingCategory = e.currentTarget.dataset.categoryName;
        state.isModalOpen = true;
        state.modalView = "editCategory";
        renderApp();
      })
  );
  const editCatForm = document.getElementById("edit-category-form");
  if (editCatForm) editCatForm.onsubmit = handleUpdateCategory;
  const cancelEditBtn = document.getElementById("cancel-edit-button");
  if (cancelEditBtn)
    cancelEditBtn.onclick = () => {
      state.isModalOpen = false;
      state.editingCategory = "";
      renderApp();
    };
  const delCatBtn = document.getElementById("delete-category-button");
  if (delCatBtn)
    delCatBtn.onclick = () => {
      state.confirmingDelete = true;
      renderApp();
    };
  const createTagForm = document.getElementById("create-tag-form");
  if (createTagForm) createTagForm.onsubmit = handleSaveNewTag;
  const cancelTagCreation = document.getElementById("cancel-tag-creation");
  if (cancelTagCreation)
    cancelTagCreation.onclick = () => {
      state.modalView = state.modalParentView || "transaction";
      state.modalParentView = "";
      renderApp();
    };

  // Settings
  const updateProfileForm = document.getElementById("update-profile-form");
  if (updateProfileForm) updateProfileForm.onsubmit = handleUpdateProfile;
  const changePassForm = document.getElementById("change-password-form");
  if (changePassForm) changePassForm.onsubmit = handleChangePassword;
  const togglePassBtn = document.getElementById("toggle-password-btn");
  if (togglePassBtn)
    togglePassBtn.onclick = () => {
      const c = document.getElementById("password-form-container");
      c.classList.toggle("hidden");
      document
        .getElementById("password-chevron")
        .classList.toggle("rotate-180");
    };

  // Global Confirm Modal
  const confirmYesBtn = document.getElementById("confirm-modal-yes");
  if (confirmYesBtn) confirmYesBtn.onclick = handleConfirmAction;
  const confirmCancelBtn = document.getElementById("confirm-modal-cancel");
  if (confirmCancelBtn) confirmCancelBtn.onclick = closeConfirmation;

  // Notifications Actions
  document
    .querySelectorAll(".accept-request-btn")
    .forEach(
      (b) =>
        (b.onclick = (e) =>
          handleAcceptJoinRequest(
            state.notifications.find(
              (n) => n.id === e.currentTarget.dataset.notifId
            )
          ))
    );
  document
    .querySelectorAll(".reject-request-btn")
    .forEach(
      (b) =>
        (b.onclick = (e) =>
          handleRejectJoinRequest(e.currentTarget.dataset.notifId))
    );
  document.querySelectorAll(".delete-notif-btn").forEach((b) => {
    b.onclick = (e) => {
      e.stopPropagation();
      handleDeleteNotification(e.currentTarget.dataset.id);
    };
  });
  document
    .querySelectorAll(".enter-family-notif-btn")
    .forEach(
      (b) =>
        (b.onclick = (e) =>
          handleEnterFamilyFromNotification(
            state.notifications.find(
              (n) => n.id === e.currentTarget.dataset.notifId
            )
          ))
    );

  // Misc
  const shareLinkBtn = document.getElementById("share-link-button");
  if (shareLinkBtn)
    shareLinkBtn.onclick = () =>
      navigator.clipboard
        .writeText(`${window.location.origin}/?code=${state.family.code}`)
        .then(() => showToast("Link copiado!", "success"));
  const toggleChartBtn = document.getElementById("toggle-charts-button");
  if (toggleChartBtn)
    toggleChartBtn.onclick = () => {
      const c = document.getElementById("secondary-charts-container");
      const i = document.getElementById("toggle-icon");
      const s = toggleChartBtn.querySelector("span");
      if (c.classList.contains("hidden")) {
        c.classList.remove("hidden");
        i.classList.add("rotate-180");
        s.textContent = "Ocultar gráficos";
        if (window.renderSecondaryCharts) window.renderSecondaryCharts();
        c.scrollIntoView({ behavior: "smooth" });
      } else {
        c.classList.add("hidden");
        i.classList.remove("rotate-180");
        s.textContent = "Exibir mais gráficos";
      }
    };

  // Chart Render
  if (state.currentView === "dashboard") {
    if (destroyChartsCallback) {
      destroyChartsCallback();
      destroyChartsCallback = null;
    }
    destroyChartsCallback = renderChartsUI();
  } else if (destroyChartsCallback) {
    destroyChartsCallback();
    destroyChartsCallback = null;
  }

  // Toggles
  document.querySelectorAll(".filter-type-btn").forEach((btn) => {
    btn.onclick = (e) => handleToggleFilterType(e.currentTarget.dataset.type);
  });
  document.querySelectorAll(".filter-category-btn").forEach((btn) => {
    btn.onclick = (e) =>
      handleToggleFilterCategory(e.currentTarget.dataset.category);
  });
  document.querySelectorAll(".filter-member-btn").forEach((btn) => {
    btn.onclick = (e) => handleToggleFilterMember(e.currentTarget.dataset.uid);
  });
  document.querySelectorAll(".calendar-day-filter").forEach((btn) => {
    btn.onclick = (e) =>
      handleToggleFilterDate(parseInt(e.currentTarget.dataset.day));
  });

  // Toggles (mesmos de antes, mas agora afetam o tempFilters)
  document.querySelectorAll(".filter-type-btn").forEach((btn) => {
    btn.onclick = (e) => handleToggleFilterType(e.currentTarget.dataset.type);
  });
  document.querySelectorAll(".filter-category-btn").forEach((btn) => {
    btn.onclick = (e) =>
      handleToggleFilterCategory(e.currentTarget.dataset.category);
  });
  document.querySelectorAll(".filter-member-btn").forEach((btn) => {
    btn.onclick = (e) => handleToggleFilterMember(e.currentTarget.dataset.uid);
  });
  document.querySelectorAll(".calendar-day-filter").forEach((btn) => {
    btn.onclick = (e) =>
      handleToggleFilterDate(parseInt(e.currentTarget.dataset.day));
  });

  document.querySelectorAll(".debt-item").forEach((b) => {
    b.onclick = (e) => {
      state.editingDebtId = e.currentTarget.dataset.debtId;
      state.isModalOpen = true;
      state.modalView = "debt";
      renderApp();
    };
  });

  document.querySelectorAll(".installment-item").forEach((b) => {
    b.onclick = (e) => {
      state.editingInstallmentId = e.currentTarget.dataset.installmentId;
      state.isModalOpen = true;
      state.modalView = "installment";
      renderApp();
    };
  });
  const enablePushBtn = document.getElementById("enable-push-btn");
  if (enablePushBtn) {
    enablePushBtn.onclick = (e) => {
      e.stopPropagation();
      requestNotificationPermission();
    };
  }

  const addBudgetBtn = document.getElementById("add-budget-button");
  if (addBudgetBtn)
    addBudgetBtn.onclick = () => {
      state.isModalOpen = true;
      state.modalView = "budget";
      state.editingBudgetItemId = null;
      state.modalBudgetType = "expense";
      renderApp();
    };
  const budgetTypeSelect = document.getElementById("budgetType");
  if (budgetTypeSelect)
    budgetTypeSelect.onchange = (e) => {
      state.modalBudgetType = e.target.value;
      renderApp();
    };

  document.querySelectorAll(".goal-item").forEach((b) => {
    b.onclick = (e) => {
      state.editingGoalId = e.currentTarget.dataset.goalId;
      state.isModalOpen = true;
      state.modalView = "goal";
      renderApp();
    };
  });
  // --- METAS FINANCEIRAS (COFRINHOS) ---

  document.querySelectorAll(".goal-item").forEach((b) => {
    b.onclick = (e) => {
      state.editingGoalId = e.currentTarget.dataset.goalId;
      state.isModalOpen = true;
      state.modalView = "goal";
      renderApp();
    };
  });
  const confirmYes = document.getElementById("confirm-delete-yes");
  if (confirmYes)
    confirmYes.onclick = async () => {
      const orig = confirmYes.innerText;
      confirmYes.innerText = "...";

      if (state.editingCategory) await handleDeleteCategory();
      else if (state.editingTransactionId) await handleDeleteTransaction();
      else if (state.editingBudgetItemId) await handleDeleteBudget();
      else if (state.editingDebtId) await handleDeleteDebt();
      else if (state.editingInstallmentId) await handleDeleteInstallment();
      else if (state.editingGoalId) await handleDeleteGoal();

      if (state.isModalOpen) {
        state.confirmingDelete = false;
        renderApp();
      }
    };

  // --- LISTENERS DAS METAS (COFRINHOS) ---

  // 1. Botão "+ Nova Meta" (Verde)
  const addGoalBtn = document.getElementById("add-goal-btn");
  if (addGoalBtn) {
    addGoalBtn.onclick = () => {
      state.isModalOpen = true;
      state.modalView = "goal";
      state.editingGoalId = null;
      renderApp();
    };
  }

  // 2. Clique no Card da Meta (Para Editar)
  document.querySelectorAll(".goal-item").forEach((b) => {
    b.onclick = (e) => {
      // Pega o ID do atributo data-goal-id do card
      state.editingGoalId = e.currentTarget.dataset.goalId;
      state.isModalOpen = true;
      state.modalView = "goal";
      renderApp();
    };
  });

  // 3. Salvar Meta (Formulário)
  const goalForm = document.getElementById("goal-form");
  if (goalForm) {
    goalForm.onsubmit = handleSaveGoal;
  }

  // 4. Excluir Meta (Botão dentro do modal)
  const delGoalBtn = document.getElementById("delete-goal-modal-btn");
  if (delGoalBtn) {
    console.log("listener ativado");
    delGoalBtn.onclick = () => {
      console.log("click");
      state.confirmingDelete = true;
      renderApp();
    };
  }

  document.querySelectorAll(".accept-request-btn").forEach((b) => {
    b.onclick = (e) => handleAcceptJoinRequest(e.currentTarget.dataset.notifId);
  });

  document.querySelectorAll(".reject-request-btn").forEach((b) => {
    b.onclick = (e) => handleRejectJoinRequest(e.currentTarget.dataset.notifId);
  });

  document.querySelectorAll(".delete-notif-btn").forEach((b) => {
    b.onclick = (e) => {
      e.stopPropagation();
      handleDeleteNotification(e.currentTarget.dataset.id);
    };
  });

  document.querySelectorAll(".enter-family-notif-btn").forEach((b) => {
    b.onclick = (e) =>
      handleEnterFamilyFromNotification(
        state.notifications.find(
          (n) => n.id === e.currentTarget.dataset.notifId
        )
      );
  });

  const exportBtn = document.getElementById("export-csv-btn");
  if (exportBtn) {
    exportBtn.onclick = handleExportExcel;
  }

  const fabExportBtn = document.getElementById("export-csv-btn");
  if (fabExportBtn) {
    fabExportBtn.onclick = handleOpenExportModal;
  }

  // --- BOTÕES DENTRO DO MODAL DE EXPORTAÇÃO ---

  const btnExcel = document.getElementById("download-excel-btn");
  if (btnExcel)
    btnExcel.onclick = () => {
      handleExportExcel();
      state.isModalOpen = false;
      renderApp();
    };

  const btnPdf = document.getElementById("download-pdf-btn");
  if (btnPdf)
    btnPdf.onclick = () => {
      handleExportPDF();
      state.isModalOpen = false;
      renderApp();
    };

  const btnCsv = document.getElementById("download-csv-btn");
  if (btnCsv) btnCsv.onclick = handleExportCSV;

  // --- FILTROS ---

    // 1. Botão de Abrir o Modal de Filtros (Ícone de funil)
    const openFilterBtn = document.getElementById('filter-funnel-btn');
    if (openFilterBtn) {
        openFilterBtn.onclick = handleOpenFilters;
    }

    // 2. Botão "Limpar Filtros" (Dentro do modal)
    const clearFilterBtn = document.getElementById('clear-filters-btn');
    if (clearFilterBtn) clearFilterBtn.onclick = handleClearFilters;

    // 3. Botão "Ver Resultados" (Aplicar) (Dentro do modal)
    const applyFilterBtn = document.getElementById('apply-filters-btn');
    if (applyFilterBtn) applyFilterBtn.onclick = handleApplyFilters;

    // 4. Botões de Seleção (Toggles dentro do modal)
    document.querySelectorAll('.filter-type-btn').forEach(btn => {
        btn.onclick = (e) => handleToggleFilterType(e.currentTarget.dataset.type);
    });

    document.querySelectorAll('.filter-category-btn').forEach(btn => {
        btn.onclick = (e) => handleToggleFilterCategory(e.currentTarget.dataset.category);
    });

    document.querySelectorAll('.filter-member-btn').forEach(btn => {
        btn.onclick = (e) => handleToggleFilterMember(e.currentTarget.dataset.uid);
    });

    document.querySelectorAll('.calendar-day-filter').forEach(btn => {
        btn.onclick = (e) => handleToggleFilterDate(parseInt(e.currentTarget.dataset.day));
    });
}

let unsubscribeNotifications = null;
firebase.onAuthStateChanged(auth, async (user) => {
  if (state.isSigningUp) return;

  state.isLoading = true;
  renderApp();

  if (user) {
    const isGoogle = user.providerData.some(
      (p) => p.providerId === "google.com"
    );
    state.user = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || user.email.split("@")[0],
      photoURL: user.photoURL,
      isGoogle: isGoogle,
    };

    subscribeToUserFamilies();

    if (unsubscribeNotifications) unsubscribeNotifications();
    unsubscribeNotifications = subscribeToNotifications();

    const pendingCode = sessionStorage.getItem("pendingInviteCode");
    const lastFamilyId = localStorage.getItem("greenhive_last_family");

    if (pendingCode) {
      const success = await handleJoinFamilyFromLink(pendingCode);
      sessionStorage.removeItem("pendingInviteCode");
      history.replaceState(null, "", window.location.pathname);
    } else if (lastFamilyId) {
      handleSelectFamily(lastFamilyId);
    } else {
      state.isLoading = false;
      renderApp();
    }
  } else {
    if (unsubscribeNotifications) unsubscribeNotifications();
    state.user = null;
    state.family = null;
    state.transactions = [];
    state.userFamilies = [];
    state.budgets = [];
    state.debts = [];
    state.installments = [];
    state.isModalOpen = false;
    state.modalView = "";
    state.isNotificationMenuOpen = false;
    if (state.authView !== "signup-success") state.currentView = "auth";
    state.isLoading = false;
    renderApp();
  }
});
