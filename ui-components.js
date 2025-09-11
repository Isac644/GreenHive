// ui-components.js
import { state, CATEGORIES, PALETTE_COLORS } from "./state-and-handlers.js";

const logoFullHorizontal = `<img src="assets/LogoFullHorizontal.png" style="height: 80px;">`;
const logoFull = `<img src="assets/LogoFull.png" style="height: 180px;">`;
const logoIcon = `<img src="assets/LogoIcon.png" style="height: 80px;">`;
const logoName = `<img src="assets/LogoName.png" style="height: 80px;">`;
const themeIcon = () => state.theme === 'light' ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-400"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

export function renderHeader() {
    if (!state.user) return '';
    return `<header class="bg-white shadow-md w-full sticky top-0 z-10">
    <div class="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div class="flex items-center gap-3">
            ${logoFullHorizontal}
        </div>
        <div class="flex items-center gap-4">
            <button id="theme-toggle-button" class="p-2 rounded-full hover:bg-gray-100 transition">
                ${themeIcon()}
            </button>
            <div class="relative">
                <button id="user-menu-button" class="p-2 rounded-full hover:bg-gray-100 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </button>
                <div id="user-menu" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2">
                    <button id="logout-button" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sair da Conta</button>
                </div>
            </div>
        </div>
    </div>
</header>`;
}

export function renderAuthPage() {
    return `<div class="min-h-screen flex items-center justify-center p-4">
    <div class="bg-white p-8 rounded-2xl shadow-lg w-full animate-fade-in max-w-md mx-auto">
        <div class="text-center mb-8">
            <div class="flex justify-center items-center gap-3 mb-2">
                ${logoFull}
            </div>
            <p class="text-gray-600">Sua colmeia financeira familiar.</p>
        </div>
        <div id="auth-form-container">
            ${state.authView === 'login' ? renderLoginFormHTML() : renderSignupFormHTML()}
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
                <a href="#" class="text-sm font-medium text-green-600 hover:text-green-500 transition">Esqueceu a senha?</a>
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
    <img src="assets/google_icon.png" alt="Google icon" class="h-6 w-6 mr-2" />
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
                <input id="inviteCode" name="inviteCode" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="INSIRA O CÓDIGO" />
                <button type="submit" class="mt-4 w-full py-3 px-4 rounded-lg font-medium text-white bg-gray-700 hover:bg-gray-800">Entrar com código</button>
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
    const type = isEditing ? transaction.type : state.modalTransactionType;
    const defaultCategories = (type === 'expense' ? CATEGORIES.expense : CATEGORIES.income);
    const customCategories = state.userCategories[type] || [];
    const allCategories = [...defaultCategories, ...customCategories];

    let contentHTML = '';
    if (state.modalView === 'newTag') {
        const colorSwatches = PALETTE_COLORS.map(color => `
            <label class="cursor-pointer">
                <input type="radio" name="newTagColor" value="${color}" class="sr-only peer">
                <div class="w-8 h-8 rounded-full peer-checked:ring-2 ring-offset-2 ring-blue-500" style="background-color: ${color};"></div>
            </label>`).join('');
        contentHTML = `
            <h3 class="text-lg font-semibold text-gray-700 mb-4">Criar Nova Categoria</h3>
            <form id="create-tag-form">
                <div class="mb-4">
                    <label for="newTagName" class="block text-sm font-medium text-gray-700 mb-1">Nome da Categoria</label>
                    <input id="newTagName" name="newTagName" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Ex: Combustível" required />
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                    <div class="flex flex-wrap gap-3">${colorSwatches}</div>
                </div>
                <div class="mt-6 flex justify-end gap-2">
                    <button type="button" id="cancel-tag-creation" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg">Cancelar</button>
                    <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg">Salvar Categoria</button>
                </div>
            </form>`;
    } else {
        const categoryOptions = allCategories.map(cat => `<option value="${cat}" ${transaction?.category === cat ? 'selected' : ''}>${cat}</option>`).join('') + `<option value="--create-new--">Criar nova categoria...</option>`;
        const deleteButtonHTML = isEditing ? `<button type="button" id="delete-transaction-button" class="px-4 py-3 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700">Excluir</button>` : '';
        const confirmDeleteHTML = state.confirmingDelete ? `<div class="mt-4 p-4 bg-red-100 rounded-lg text-center">
    <p class="text-red-700 mb-2">Tem certeza?</p>
    <button type="button" id="confirm-delete-yes" class="px-3 py-1 bg-red-600 text-white rounded-md mr-2">Sim</button>
    <button type="button" id="confirm-delete-no" class="px-3 py-1 bg-gray-300 rounded-md">Não</button>
</div>` : '';
        contentHTML = `
            <form id="${isEditing ? 'edit' : 'add'}-transaction-form">
                <div class="space-y-4">
                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                        <input id="description" name="description" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg" value="${transaction?.description || ''}" required />
                    </div>
                    <div>
                        <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                        <select id="category" name="category" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white">
                            ${categoryOptions}
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                            <input id="amount" name="amount" type="number" step="0.01" class="w-full px-4 py-3 border border-gray-300 rounded-lg" value="${transaction?.amount || ''}" required />
                        </div>
                        <div>
                            <label for="installments" class="block text-sm font-medium text-gray-700 mb-1">Parcelas</label>
                            <input id="installments" name="installments" type="number" min="1" value="1" class="w-full px-4 py-3 border border-gray-300 rounded-lg disabled:bg-gray-100" ${isEditing || type === 'income' ? 'disabled' : ''} />
                        </div>
                    </div>
                    <div>
                        <label for="date" class="block text-sm font-medium text-gray-700 mb-1">Data</label>
                        <input id="date" name="date" type="date" value="${transaction?.date || new Date().toISOString().slice(0, 10)}" class="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
                    </div>
                </div>
                <div class="mt-8 flex gap-2">
                    ${deleteButtonHTML}
                    <button type="submit" class="w-full py-3 px-4 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700">${isEditing ? 'Salvar Alterações' : 'Adicionar Transação'}</button>
                </div>
                ${confirmDeleteHTML}
            </form>`;
    }

    return `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay p-4">
            <div class="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 modal-content">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-semibold text-gray-700">${isEditing ? 'Editar Transação' : (state.modalView === 'newTag' ? 'Criar Categoria' : 'Nova Transação')}</h2>
                    <button id="close-modal-button" class="p-2 rounded-full hover:bg-gray-200 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                ${contentHTML}
            </div>
        </div>`;
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

export function renderMainContent() {
    if (!state.family) return '';
    const navTabs = `<div class="mb-8 border-b">
    <nav class="flex -mb-px space-x-8">
        <button data-view="dashboard" class="nav-tab ${state.currentView === 'dashboard' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Dashboard</button>
        <button data-view="records" class="nav-tab ${state.currentView === 'records' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Registros</button>
        <button data-view="budget" class="nav-tab ${state.currentView === 'budget' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Orçamento</button>
    </nav>
</div>`;
    let viewContent = '';
    if (state.currentView === 'dashboard') viewContent = renderFamilyDashboard();
    else if (state.currentView === 'records') viewContent = renderRecordsPage();
    else if (state.currentView === 'budget') viewContent = renderBudgetPage();

    return `<div class="w-full max-w-6xl mx-auto px-4 py-8">
    <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div>
            <h1 class="text-2xl font-bold text-gray-800">${state.family.name}</h1>
            <p class="text-sm text-gray-500">Bem-vindo(a), ${state.user.name}!</p>
        </div>
        <button id="leave-family-button" class="mt-4 sm:mt-0 text-sm font-medium text-gray-600 hover:text-red-600 transition bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg">Sair da Família</button>
    </header>
    ${navTabs}
    <div id="view-content" class="content-fade-in">${viewContent}</div>
</div>`;
}

export function renderFamilyDashboard() {
    const month = state.displayedMonth.getMonth();
    const year = state.displayedMonth.getFullYear();
    const monthName = state.displayedMonth.toLocaleString('pt-BR', { month: 'long' });
    const monthlyTransactions = state.transactions.filter(t => new Date(t.date + 'T12:00:00').getMonth() === month && new Date(t.date + 'T12:00:00').getFullYear() === year);
    const summary = monthlyTransactions.reduce((acc, t) => { if (t.type === 'income') acc.income += t.amount; else acc.expenses += t.amount; return acc; }, { income: 0, expenses: 0 });
    summary.balance = summary.income - summary.expenses;
    const incomeBudget = state.budgets.find(b => b.type === 'income' && new Date(b.appliesFrom) <= state.displayedMonth);
    const incomeGoal = incomeBudget ? incomeBudget.value : 0;
    const incomePercentage = incomeGoal > 0 ? (summary.income / incomeGoal) * 100 : 0;
    return `
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div class="bg-white p-6 rounded-2xl shadow-lg">
        <p class="text-sm text-gray-500">Receita do Mês</p>
        <p class="text-2xl font-bold text-gray-800 text-green-600">R$ ${summary.income.toFixed(2)}</p>
        <p class="text-sm text-gray-500 mt-2">Meta: R$ ${incomeGoal.toFixed(2)}</p>
        <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div class="bg-green-500 h-2 rounded-full" style="width: ${Math.min(incomePercentage, 100)}%"></div>
        </div>
    </div>
    <div class="bg-white p-6 rounded-2xl shadow-lg">
        <p class="text-sm text-gray-500">Despesa do Mês</p>
        <p class="text-2xl font-bold text-gray-800 text-red-600">R$ ${summary.expenses.toFixed(2)}</p>
    </div>
    <div class="bg-white p-6 rounded-2xl shadow-lg">
        <p class="text-sm text-gray-500">Saldo do Mês</p>
        <p class="text-2xl font-bold text-gray-800 text-blue-600">R$ ${summary.balance.toFixed(2)}</p>
    </div>
    <div class="bg-white p-6 rounded-2xl shadow-lg flex flex-col justify-center items-center text-center">
        <h3 class="font-semibold text-gray-700">Registro Geral</h3>
        <p class="text-xs text-gray-500 mb-2">Veja todas as suas transações</p>
        <button id="details-button" class="w-full mt-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Ver mais</button>
    </div>
</div>
<div class="bg-white p-6 rounded-2xl shadow-lg mb-6">
    <div class="flex justify-between items-center">
        <button id="prev-month-chart-button" class="p-2 rounded-md hover:bg-gray-200 month-selector-text">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
        </button>
        <h3 class="text-lg font-semibold capitalize month-selector-text">${monthName} de ${year}</h3>
        <button id="next-month-chart-button" class="p-2 rounded-md hover:bg-gray-200 month-selector-text">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
        </button>
    </div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <div class="bg-white p-6 rounded-2xl shadow-lg">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Orçamento Mensal</h3>
        <div class="h-80 relative">
            <canvas id="budget-overview-chart"></canvas>
            <div id="budget-chart-text" class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"></div>
        </div>
    </div>
    <div class="bg-white p-6 rounded-2xl shadow-lg">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Despesas do Mês por Categoria</h3>
        <div class="h-80 relative">
            <canvas id="monthly-expenses-chart"></canvas>
        </div>
    </div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <div class="bg-white p-6 rounded-2xl shadow-lg">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Comparativo com Mês Anterior</h3>
        <div class="h-80 relative">
            <canvas id="comparison-chart"></canvas>
        </div>
    </div>
    <div class="bg-white p-6 rounded-2xl shadow-lg">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Balanço Anual (${new Date().getFullYear()})</h3>
        <div class="h-80 relative">
            <canvas id="annual-balance-chart"></canvas>
        </div>
    </div>
</div>
<div class="mt-8 bg-white p-6 rounded-2xl shadow-lg">
    <h3 class="text-lg font-semibold text-gray-700 mb-4">Código de Convite da Família</h3>
    <div class="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-100 rounded-lg">
        <p class="text-2xl font-bold text-gray-800 tracking-widest mb-4 sm:mb-0">${state.family.code}</p>
        <div class="flex gap-2">
            <button id="copy-code-button" class="px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-lg">Copiar Código</button>
            <button id="share-link-button" class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg">Compartilhar Link</button>
        </div>
    </div>
</div>
${['dashboard', 'records'].includes(state.currentView) ? `
    <button id="open-modal-button" class="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition transform hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    </button>` : ''}`;
}

export function renderRecordsPage() {
    const month = state.displayedMonth.getMonth();
    const year = state.displayedMonth.getFullYear();
    const monthName = state.displayedMonth.toLocaleString('pt-BR', { month: 'long' });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let calendarDaysHTML = Array(firstDay).fill(`<div class="text-center p-2"></div>`).join('');
    for (let day = 1; day <= daysInMonth; day++) {
        const isSelected = state.selectedDate === day;
        calendarDaysHTML += `
            <div class="text-center p-1">
                <button data-day="${day}" class="calendar-day w-8 h-8 rounded-full ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}">${day}</button>
            </div>`;
    }

    const calendarHTML = `<div class="bg-white p-6 rounded-2xl shadow-lg mb-6">
    <div class="flex justify-between items-center mb-4">
        <button id="prev-month-button" class="p-2 rounded-md hover:bg-gray-200 month-selector-text">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
        </button>
        <h3 class="text-lg font-semibold capitalize month-selector-text">${monthName} de ${year}</h3>
        <button id="next-month-button" class="p-2 rounded-md hover:bg-gray-200 month-selector-text">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
        </button>
    </div>
    <div class="grid grid-cols-7 gap-1 text-sm text-center text-gray-500 mb-2">
        <div>Dom</div>
        <div>Seg</div>
        <div>Ter</div>
        <div>Qua</div>
        <div>Qui</div>
        <div>Sex</div>
        <div>Sáb</div>
    </div>
    <div class="grid grid-cols-7 gap-1">${calendarDaysHTML}</div>
    ${state.selectedDate ? `<div class="text-center mt-4"><button id="clear-date-filter" class="text-sm text-blue-600 hover:underline">Limpar filtro do dia</button></div>` : ''}
</div>`;
    
    const filtered = state.transactions.filter(t => {
        const transactionDate = new Date(t.date + 'T12:00:00');
        const typeMatch = state.detailsFilterType === 'all' || t.type === state.detailsFilterType;
        const dateMatch = !state.selectedDate || transactionDate.getDate() === state.selectedDate;
        return typeMatch && dateMatch && transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
    });

    const groupedByDate = filtered.reduce((acc, t) => {
        const day = new Date(t.date + 'T12:00:00').getDate();
        if (!acc[day]) acc[day] = [];
        acc[day].push(t);
        return acc;
    }, {});

    const sortedDays = Object.keys(groupedByDate).sort((a,b) => b - a);

    let transactionsHTML = `<p class="text-center text-gray-500 py-8">Nenhuma transação encontrada para os filtros selecionados.</p>`;
    if (sortedDays.length > 0) {
        transactionsHTML = sortedDays.map(day => {
            const transactionsForDay = groupedByDate[day].map(t => `
                <li class="transaction-item flex justify-between items-center py-3 px-2 -mx-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer" data-transaction-id="${t.id}">
                    <div>
                        <p class="font-medium text-gray-800">${t.description}</p>
                        <div class="flex items-center mt-1">
                            <p class="text-sm text-gray-500 mr-2">${t.userName || 'Autor desconhecido'}</p>
                            <span class="text-xs px-2 py-1 rounded-full text-white" style="background-color: ${state.categoryColors[t.category] || '#6B7280'}">${t.category}</span>
                        </div>
                    </div>
                    <p class="font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}">${t.type === 'income' ? '+' : '-'} R$ ${t.amount.toFixed(2)}</p>
                </li>`).join('');
            return `<div class="mb-4">
    <p class="font-bold text-gray-700 pb-2 border-b">${day} de ${monthName}</p>
    <ul class="divide-y">${transactionsForDay}</ul>
</div>`;
        }).join('');
    }

    return `<div id="records-page-container" class="content-fade-in">
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="lg:col-span-2">${calendarHTML}</div>
        <div class="lg:col-span-3">
            <div class="bg-white p-6 rounded-2xl shadow-lg mb-6">
                <div class="flex items-center justify-center gap-4">
                    <button data-filter="all" class="filter-button px-4 py-2 rounded-lg ${state.detailsFilterType === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 filter-button-inactive'}">Tudo</button>
                    <button data-filter="income" class="filter-button px-4 py-2 rounded-lg ${state.detailsFilterType === 'income' ? 'bg-green-500 text-white' : 'bg-gray-200 filter-button-inactive'}">Receitas</button>
                    <button data-filter="expense" class="filter-button px-4 py-2 rounded-lg ${state.detailsFilterType === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-200 filter-button-inactive'}">Despesas</button>
                </div>
            </div>
            <div id="records-list-wrapper" class="bg-white rounded-2xl shadow-lg p-6">${transactionsHTML}</div>
        </div>
    </div>
    ${['dashboard', 'records'].includes(state.currentView) ? `
    <button id="open-modal-button" class="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition transform hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    </button>` : ''}
</div>`;
}

export function renderBudgetPage() {
    const month = state.displayedMonth.getMonth();
    const year = state.displayedMonth.getFullYear();
    const monthName = state.displayedMonth.toLocaleString('pt-BR', { month: 'long' });
    const monthlyTransactions = state.transactions.filter(t => new Date(t.date + 'T12:00:00').getMonth() === month && new Date(t.date + 'T12:00:00').getFullYear() === year);
    const activeBudgets = state.budgets.filter(b => {
        const startDate = new Date(b.appliesFrom + 'T12:00:00');
        const startYear = startDate.getUTCFullYear();
        const startMonth = startDate.getUTCMonth();
        const endDate = b.appliesTo ? new Date(b.appliesTo + 'T12:00:00') : null;
        const currentYear = state.displayedMonth.getFullYear();
        const currentMonth = state.displayedMonth.getMonth();
        const budgetStartsLater = startYear > currentYear || (startYear === currentYear && startMonth > currentMonth);
        if (budgetStartsLater) { return false; }
        if (b.recurring === false) { return startYear === currentYear && startMonth === currentMonth; }
        if (endDate) {
            const endYear = endDate.getUTCFullYear();
            const endMonth = endDate.getUTCMonth();
            const budgetEndsEarlier = endYear < currentYear || (endYear === currentYear && endMonth < currentMonth);
            if (budgetEndsEarlier) { return false; }
        }
        return true;
    });

    const budgetItemsHTML = activeBudgets.map(budget => {
        let progressHTML = '';
        if(budget.type === 'expense') {
            const spent = monthlyTransactions.filter(t => t.type === 'expense' && t.category === budget.category).reduce((sum, t) => sum + t.amount, 0);
            const limit = budget.value;
            const percentage = limit > 0 ? (spent / limit) * 100 : 0;
            const barColor = percentage > 100 ? 'bg-red-500' : (percentage > 80 ? 'bg-yellow-500' : 'bg-green-500');
            progressHTML = `
                <div class="w-full bg-gray-200 rounded-full h-8 mt-2 relative overflow-hidden flex items-center">
                    <div class="${barColor} h-8 rounded-full flex items-center justify-start pl-4" style="width: ${Math.min(percentage, 100)}%"></div>
                    <span class="absolute left-4 text-sm font-bold ${percentage > 50 ? 'text-white' : 'text-gray-800'}">${budget.name}</span>
                </div>
                <p class="text-xs text-right text-gray-500 mt-1">Gasto: R$ ${spent.toFixed(2)} de R$ ${limit.toFixed(2)}</p>`;
        } else {
            const earned = monthlyTransactions.filter(t => t.type === 'income' && t.category === budget.category).reduce((sum, t) => sum + t.amount, 0);
            const goal = budget.value;
            const percentage = goal > 0 ? (earned / goal) * 100 : 0;
            progressHTML = `
                <div class="w-full bg-gray-200 rounded-full h-8 mt-2 relative overflow-hidden flex items-center">
                    <div class="bg-green-500 h-8 rounded-full flex items-center justify-start pl-4" style="width: ${Math.min(percentage, 100)}%"></div>
                    <span class="absolute left-4 text-sm font-bold ${percentage > 50 ? 'text-white' : 'text-gray-800'}">${budget.name}</span>
                </div>
                <p class="text-xs text-right text-gray-500 mt-1">Alcançado: R$ ${earned.toFixed(2)} de R$ ${goal.toFixed(2)}</p>`;
        }
        return `
            <div class="budget-item p-4 border rounded-lg cursor-pointer hover:bg-gray-100" data-budget-id="${budget.id}">
                ${progressHTML}
            </div>`;
    }).join('');

    return `
        <main class="content-fade-in">
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div class="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg">
                    <h3 class="text-lg font-semibold text-gray-700 mb-4">Mês do Orçamento</h3>
                    <div class="flex items-center justify-between">
                        <button id="prev-month-button" class="p-2 rounded-md hover:bg-gray-200 month-selector-text">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span class="font-semibold capitalize month-selector-text">${monthName} de ${year}</span>
                        <button id="next-month-button" class="p-2 rounded-md hover:bg-gray-200 month-selector-text">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="lg:col-span-3 bg-white p-6 rounded-2xl shadow-lg">
                    <h3 class="text-lg font-semibold text-gray-700 mb-4">Orçamentos para ${monthName}</h3>
                    <div class="space-y-4">
                        ${budgetItemsHTML}
                        <button id="add-budget-button" class="w-full p-4 border-2 border-dashed rounded-lg text-gray-500 hover:bg-gray-100 hover:border-green-500">+ Adicionar Novo Orçamento</button>
                    </div>
                </div>
            </div>
        </main>`;
}

export function renderCharts() {
    const chartInstances = { monthly: null, annual: null, comparison: null, budget: null };

    const destroyCharts = () => {
        Object.values(chartInstances).forEach(chart => {
            if (chart) chart.destroy();
        });
    };

    const renderMonthlyChart = () => {
        const chartCanvas = document.getElementById('monthly-expenses-chart');
        if (chartCanvas) {
            if (chartInstances.monthly) chartInstances.monthly.destroy();
            const month = state.displayedMonth.getMonth();
            const year = state.displayedMonth.getFullYear();
            const monthlyTransactions = state.transactions.filter(t => new Date(t.date + 'T12:00:00').getMonth() === month && new Date(t.date + 'T12:00:00').getFullYear() === year && t.type === 'expense');
            const expenseData = monthlyTransactions.reduce((acc, t) => {
                const category = t.category || 'Outros';
                acc[category] = (acc[category] || 0) + t.amount;
                return acc;
            }, {});
            const labels = Object.keys(expenseData);
            const data = Object.values(expenseData);
            const colors = labels.map(label => state.categoryColors[label] || '#6B7280');
            const textColor = state.theme === 'dark' ? '#d1d5db' : '#374151';
            chartInstances.monthly = new Chart(chartCanvas.getContext('2d'), {
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
    };

    const renderAnnualChart = () => {
        const chartCanvas = document.getElementById('annual-balance-chart');
        if (chartCanvas) {
            if (chartInstances.annual) chartInstances.annual.destroy();
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
            chartInstances.annual = new Chart(chartCanvas.getContext('2d'), {
                type: 'bar', data: {
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'], datasets: [
                        { label: 'Receitas', data: annualData.income, backgroundColor: 'rgba(16, 185, 129, 0.6)' },
                        { label: 'Despesas', data: annualData.expense, backgroundColor: 'rgba(239, 68, 68, 0.6)' }
                    ]
                }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: textColor } }, datalabels: { display: false } }, scales: { x: { stacked: false, ticks: { color: textColor } }, y: { stacked: false, ticks: { color: textColor } } } }
            });
        }
    };

    const renderComparisonChart = () => {
        const chartCanvas = document.getElementById('comparison-chart');
        if (chartCanvas) {
            if (chartInstances.comparison) chartInstances.comparison.destroy();
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
            chartInstances.comparison = new Chart(chartCanvas.getContext('2d'), {
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
    };

    const renderBudgetChart = () => {
        const chartCanvas = document.getElementById('budget-overview-chart');
        if (chartCanvas) {
            if (chartInstances.budget) chartInstances.budget.destroy();
            const month = state.displayedMonth.getMonth();
            const year = state.displayedMonth.getFullYear();
            const monthlyTransactions = state.transactions.filter(t => new Date(t.date + 'T12:00:00').getMonth() === month && new Date(t.date + 'T12:00:00').getFullYear() === year);
            const totalExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            const activeExpenseBudgets = state.budgets.filter(b => b.type === 'expense' && new Date(b.appliesFrom) <= state.displayedMonth && (!b.appliesTo || new Date(b.appliesTo) >= state.displayedMonth));
            const totalBudget = activeExpenseBudgets.reduce((sum, b) => sum + b.value, 0);
            const remaining = totalBudget - totalExpenses;
            const textColor = state.theme === 'dark' ? '#d1d5db' : '#374151';
            chartInstances.budget = new Chart(chartCanvas.getContext('2d'), {
                type: 'doughnut', data: {
                    labels: ['Gasto', 'Restante'], datasets: [{ data: [totalExpenses, remaining > 0 ? remaining : 0], backgroundColor: ['#EF4444', '#10B981'], borderColor: state.theme === 'dark' ? '#1f2937' : '#f9fafb', borderWidth: 4 }]
                }, options: {
                    responsive: true, maintainAspectRatio: false, plugins: {
                        legend: { position: 'bottom', labels: { color: textColor } }, datalabels: {
                            formatter: (value, ctx) => {
                                const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                return total > 0 ? (value / total * 100).toFixed(0) + '%' : '0%';
                            }, color: '#fff'
                        }
                    }, cutout: '70%'
                }
            });
            const budgetText = document.getElementById('budget-chart-text');
            if (budgetText) {
                const percentage = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
                const percentageColor = percentage > 100 ? 'text-red-500' : (percentage > 80 ? 'text-yellow-500' : 'text-green-500');
                budgetText.innerHTML = `<span class="text-3xl font-bold ${percentageColor}">${percentage.toFixed(0)}%</span><span class="text-sm text-gray-500">Gasto</span>`;
            }
        }
    };

    renderMonthlyChart();
    renderAnnualChart();
    renderComparisonChart();
    renderBudgetChart();

    return destroyCharts;
}