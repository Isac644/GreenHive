// state-and-handlers.js
import { firebase, db, auth, googleProvider } from "./firebase-config.js";
import { renderApp, showToast } from "./main.js";

export const state = {
    user: null,
    family: null,
    userFamilies: [],
    transactions: [],
    budgets: [],
    userCategories: { expense: [], income: [] },
    categoryColors: {}, // AGORA VAZIO. CORES VIRÃO DO FIRESTORE.
     theme: localStorage.getItem('theme') || 'light',
    authView: 'login',
    currentView: 'auth',
    detailsFilterType: 'all',
    displayedMonth: new Date(),
    selectedDate: null,
    isModalOpen: false,
    editingTransactionId: null,
    editingBudgetItemId: null,
    modalView: '',
    modalTransactionType: 'expense',
    confirmingDelete: false,
    errorMessage: '',
    // NOVO:
    familyAdmins: [],
    familyMembers: [],
    modalView: '',
    editingCategory: '', // NOVO: A categoria que está sendo editada
};

export const PALETTE_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78716c', '#6b7280'];
export const DEFAULT_CATEGORIES_SETUP = {
    expense: ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde'],
    income: ['Salário', 'Freelance', 'Investimentos'],
    colors: {
        'Alimentação': '#F97316', 
        'Moradia': '#3B82F6', 
        'Transporte': '#EF4444', 
        'Lazer': '#8B5CF6', 
        'Saúde': '#14B8A6', 
        'Salário': '#10B981', 
        'Freelance': '#EAB308', 
        'Investimentos': '#06B6D4'
    }
};

export const CATEGORIES = { expense: [], income: [] }; // AGORA VAZIO

// --- LÓGICA / HANDLERS ---
export async function handleLogin(event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
    
    try {
        await firebase.signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        let errorMessage = "Ocorreu um erro desconhecido. Tente novamente.";
        
        console.log(error.code);
        // A chave para o tratamento específico é o error.code
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                errorMessage = "Email ou senha incorretos.";
                break;
            case 'auth/invalid-credential':
                errorMessage = "Email ou senha incorretos.";
                break;
            case 'auth/invalid-email':
                errorMessage = "O formato do email é inválido.";
                break;
            case 'auth/too-many-requests':
                errorMessage = "Acesso temporariamente bloqueado. Tente mais tarde.";
                break;
            default:
                console.error("Erro de login não mapeado:", error);
                errorMessage = error.message; 
                break;
        }
        
        // Exibe a mensagem amigável para o usuário
        showToast("Falha no login: " + errorMessage, 'error');
    }
}

export async function handleSignup(event) {
    event.preventDefault();
    const name = event.target.name.value;
    const email = event.target.email.value;
    const password = event.target.password.value;
    
    if (!name || !email || !password) {
        showToast("Por favor, preencha todos os campos.", 'error');
        return;
    }
    
    try {
        const userCredential = await firebase.createUserWithEmailAndPassword(auth, email, password);
        await firebase.updateProfile(userCredential.user, { displayName: name });
    } catch (error) {
        let errorMessage = "Ocorreu um erro desconhecido. Tente novamente.";
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = "Este email já está cadastrado.";
                break;
            case 'auth/invalid-email':
                errorMessage = "O formato do email é inválido.";
                break;
            case 'auth/weak-password':
                errorMessage = "A senha deve ter pelo menos 6 caracteres.";
                break;
            case 'auth/operation-not-allowed':
                errorMessage = "O cadastro de email/senha não está ativado no Firebase.";
                break;
            default:
                console.error("Erro de cadastro não mapeado:", error);
                errorMessage = error.message; 
                break;
        }
        showToast("Falha no cadastro: " + errorMessage, 'error');
    }
}

export async function handleGoogleLogin() {
    try {
        await firebase.signInWithPopup(auth, googleProvider);
    } catch (error) {
        console.error("Erro no login com Google:", error);
        showToast("Não foi possível fazer o login com o Google.", 'error');
    }
}

export async function handleLogout() {
    await firebase.signOut(auth);
}

export async function handleCreateFamily(event) {
    event.preventDefault();
    const familyName = event.target.familyName.value;
    if (!familyName) return;
    
    // NOVO: Usa a constante de setup para as categorias iniciais
    const initialCategories = { 
        expense: [...DEFAULT_CATEGORIES_SETUP.expense], 
        income: [...DEFAULT_CATEGORIES_SETUP.income] 
    };
    const initialColors = { ...DEFAULT_CATEGORIES_SETUP.colors };
    
    const newFamily = { 
        name: familyName, 
        code: Math.random().toString(36).substring(2, 8).toUpperCase(), 
        members: [state.user.uid],
        admins: [state.user.uid],
        userCategories: initialCategories, 
        categoryColors: initialColors // SALVA AS CORES INICIAIS AQUI
    };
    try {
        const docRef = await firebase.addDoc(firebase.collection(db, "familyGroups"), newFamily);
        await handleSelectFamily(docRef.id);
        showToast("Família criada com sucesso!", 'success');
    } catch (e) {
        showToast("Erro ao criar família.", 'error');
        console.error(e);
    }
}

export function handleSwitchFamily() {
    state.family = null;
    state.transactions = [];
    state.budgets = [];
    state.userCategories = { expense: [], income: [] };
    state.categoryColors = {};
    state.familyAdmins = [];
    state.familyMembers = [];
    state.currentView = 'onboarding'; // Volta para a tela de seleção/criação
    state.isModalOpen = false;
    renderApp();
    showToast("Você saiu da família atual.", 'success');
}

export async function handleJoinFamily(event) {
    event.preventDefault();
    const code = event.target.inviteCode.value.toUpperCase();
    if (!code) return;
    try {
        const q = firebase.query(firebase.collection(db, "familyGroups"), firebase.where("code", "==", code));
        const querySnapshot = await firebase.getDocs(q);
        if (querySnapshot.empty) {
            showToast("Código de família inválido!", 'error');
            return;
        }
        const familyDoc = querySnapshot.docs[0];
        const familyId = familyDoc.id;
        if (!familyDoc.data().members.includes(state.user.uid)) {
            await firebase.updateDoc(firebase.doc(db, "familyGroups", familyId), { members: firebase.arrayUnion(state.user.uid) });
        }
        await handleSelectFamily(familyId);
        showToast("Você entrou na família com sucesso!", 'success');
    } catch (e) {
        showToast("Erro ao entrar na família.", 'error');
        console.error(e);
    }
}

export async function handleJoinFamilyFromLink(code) {
    const uppercaseCode = code.toUpperCase();
    
    // Evita que usuários já em uma família tentem entrar em outra automaticamente
    if (state.family) return false;
    
    try {
        const q = firebase.query(firebase.collection(db, "familyGroups"), firebase.where("code", "==", uppercaseCode));
        const querySnapshot = await firebase.getDocs(q);
        
        if (querySnapshot.empty) {
            // Falha silenciosa, pois o código pode estar errado
            return false;
        }
        
        const familyDoc = querySnapshot.docs[0];
        const familyId = familyDoc.id;
        
        // Se o usuário não estiver na lista de membros, adiciona
        if (!familyDoc.data().members.includes(state.user.uid)) {
            await firebase.updateDoc(firebase.doc(db, "familyGroups", familyId), { members: firebase.arrayUnion(state.user.uid) });
        }
        
        // Seleciona e carrega a nova família
        await handleSelectFamily(familyId);
        showToast("Você entrou na família via link de convite!", 'success');
        return true;
        
    } catch (e) {
        console.error("Erro ao entrar na família via link:", e);
        showToast("Erro ao tentar entrar na família via link.", 'error');
        return false;
    }
}

export async function handleSelectFamily(familyId) {
    await loadFamilyData(familyId);
    if (state.family) {
        state.currentView = 'dashboard';
        renderApp();
    }
}

export function handleLeaveFamily() {
    state.family = null;
    state.transactions = [];
    state.budgets = [];
    state.currentView = 'onboarding';
    fetchUserFamilies().then(families => {
        state.userFamilies = families;
        renderApp();
        showToast("Você saiu da família.", 'success');
    });
}

export async function handleAddTransaction(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const description = formData.get('description');
    const amount = parseFloat(formData.get('amount'));
    const date = formData.get('date');
    const category = formData.get('category');
    const type = state.modalTransactionType;
    if (!description || !amount || !date || !category || category === '--create-new--') {
        showToast('Por favor, preencha todos os campos e selecione uma categoria válida.', 'error');
        return;
    }
    const newTransaction = { description, amount, date, category, type, userId: state.user.uid, userName: state.user.name, familyGroupId: state.family.id };
    try {
        const docRef = await firebase.addDoc(firebase.collection(db, "transactions"), newTransaction);
        state.transactions.push({ id: docRef.id, ...newTransaction });
        state.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        state.isModalOpen = false;
        renderApp();
        showToast("Transação adicionada com sucesso!", 'success');
    } catch (e) {
        showToast("Erro ao adicionar transação.", 'error');
        console.error(e);
    }
}

export async function handleUpdateTransaction(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const transactionId = state.editingTransactionId;
    const updatedData = { description: formData.get('description'), amount: parseFloat(formData.get('amount')), date: formData.get('date'), category: formData.get('category') };
    try {
        await firebase.updateDoc(firebase.doc(db, "transactions", transactionId), updatedData);
        const index = state.transactions.findIndex(t => t.id === transactionId);
        if (index !== -1) { state.transactions[index] = { ...state.transactions[index], ...updatedData }; }
        state.editingTransactionId = null;
        state.isModalOpen = false;
        renderApp();
        showToast("Transação atualizada com sucesso!", 'success');
    } catch (e) {
        showToast("Erro ao atualizar transação.", 'error');
        console.error(e);
    }
}

export async function handleDeleteTransaction() {
    const transactionId = state.editingTransactionId;
    try {
        await firebase.deleteDoc(firebase.doc(db, "transactions", transactionId));
        state.transactions = state.transactions.filter(t => t.id !== transactionId);
        state.editingTransactionId = null;
        state.isModalOpen = false;
        renderApp();
        showToast("Transação excluída com sucesso!", 'success');
    } catch (e) {
        showToast("Erro ao excluir transação.", 'error');
        console.error(e);
    }
}

export async function handleSaveBudget(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const id = state.editingBudgetItemId;
    const budgetData = {
        name: formData.get('budgetName'),
        type: formData.get('budgetType'),
        category: formData.get('budgetCategory'),
        value: parseFloat(formData.get('budgetValue')),
        appliesFrom: state.displayedMonth.toISOString().slice(0, 7) + '-01',
        recurring: formData.get('budgetRecurring') === 'on'
    };
    if (!budgetData.name || !budgetData.category || isNaN(budgetData.value)) {
        showToast('Preencha todos os campos do orçamento com valores válidos.', 'error');
        return;
    }
    try {
        const budgetCollectionRef = firebase.collection(db, "familyGroups", state.family.id, "budgets");
        if (id) {
            await firebase.updateDoc(firebase.doc(budgetCollectionRef, id), budgetData);
            const index = state.budgets.findIndex(b => b.id === id);
            if (index !== -1) state.budgets[index] = { id, ...budgetData };
        } else {
            const docRef = await firebase.addDoc(budgetCollectionRef, budgetData);
            state.budgets.push({ id: docRef.id, ...budgetData });
        }
        state.editingBudgetItemId = null;
        state.isModalOpen = false;
        renderApp();
        showToast("Orçamento salvo com sucesso!", 'success');
    } catch (e) {
        showToast("Erro ao salvar orçamento.", 'error');
        console.error(e);
    }
}

export async function handleDeleteBudget() {
    if (!state.editingBudgetItemId) return;
    const budgetId = state.editingBudgetItemId;
    const budgetToDelete = state.budgets.find(b => b.id === budgetId);
    const budgetDocRef = firebase.doc(db, "familyGroups", state.family.id, "budgets", budgetId);
    try {
        if (budgetToDelete && budgetToDelete.recurring) {
            const lastMonth = new Date(state.displayedMonth);
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            const appliesToDate = lastMonth.toISOString().slice(0, 7) + '-28';
            await firebase.updateDoc(budgetDocRef, { appliesTo: appliesToDate });
            budgetToDelete.appliesTo = appliesToDate;
        } else {
            await firebase.deleteDoc(budgetDocRef);
            state.budgets = state.budgets.filter(b => b.id !== budgetId);
        }
        state.editingBudgetItemId = null;
        state.isModalOpen = false;
        renderApp();
        showToast("Orçamento excluído com sucesso!", 'success');
    } catch (e) {
        showToast("Erro ao excluir orçamento.", 'error');
        console.error(e);
    }
}

export async function handleSaveNewTag(event) {
    event.preventDefault();
    const form = event.target;
    const newTagName = form.newTagName.value;
    const newTagColor = form.newTagColor.value;
    if (!newTagName || !newTagColor) {
        showToast('Por favor, preencha o nome e selecione uma cor.', 'error');
        return;
    }
    const type = state.modalTransactionType;
    const allCategories = [...state.userCategories[type]]; 
    if (allCategories.includes(newTagName)) {
        showToast('Essa categoria já existe.', 'error');
        return;
    }
    try {
        const familyDocRef = firebase.doc(db, "familyGroups", state.family.id);
        await firebase.updateDoc(familyDocRef, {
            [`userCategories.${type}`]: firebase.arrayUnion(newTagName),
            [`categoryColors.${newTagName}`]: newTagColor
        });
        
        state.userCategories[type].push(newTagName);
        state.categoryColors[newTagName] = newTagColor;
        
        // NOVO: Lógica de retorno baseada no modal pai
        const returnView = state.modalParentView || 'transaction';
        state.modalView = returnView;
        state.modalParentView = ''; // Limpa o estado temporário após o uso

        renderApp();
        showToast("Nova categoria salva com sucesso!", 'success');
        
        // Se o retorno for para a transação, pré-seleciona a categoria
        if (returnView === 'transaction') {
            setTimeout(() => { document.getElementById('category').value = newTagName; }, 0);
        }

    } catch (e) {
        showToast("Erro ao salvar nova categoria.", 'error');
        console.error(e);
    }
}

export function handleChangeMonth(direction) {
    const viewContainer = document.getElementById('view-content') || document.getElementById('records-page-container');
    if (viewContainer) {
        viewContainer.classList.remove('content-fade-in');
        viewContainer.classList.add('content-fade-out');
        setTimeout(() => {
            state.displayedMonth.setMonth(state.displayedMonth.getMonth() + direction);
            state.selectedDate = null;
            renderApp();
        }, 150);
    }
}

export function handleToggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', state.theme);
    renderApp();
}

export async function fetchUserFamilies() {
    if (!state.user?.uid) return [];
    try {
        const q = firebase.query(firebase.collection(db, "familyGroups"), firebase.where("members", "array-contains", state.user.uid));
        const querySnapshot = await firebase.getDocs(q);
        const families = [];
        querySnapshot.forEach(doc => { families.push({ id: doc.id, ...doc.data() }); });
        return families;
    } catch (error) {
        console.error("Erro ao buscar famílias:", error);
        return [];
    }
}

export async function loadFamilyData(familyId) {
    try {
        // 1. CARREGA O DOCUMENTO DA FAMÍLIA (Dados da Família, Categorias, etc.)
        const familyDocSnap = await firebase.getDoc(firebase.doc(db, "familyGroups", familyId));
        if (!familyDocSnap.exists()) throw new Error("Família não encontrada!");
        const familyData = familyDocSnap.data();
        
        // 2. ATUALIZA O ESTADO COM DADOS DA FAMÍLIA E CATEGORIAS
        state.family = { id: familyId, ...familyData };
        state.userCategories = familyData.userCategories || { expense: [], income: [] };
        state.categoryColors = familyData.categoryColors || {};
        state.familyAdmins = familyData.admins || [];

        // --- 3. PONTO DE CORREÇÃO: CARREGAR TRANSAÇÕES ---
        // Cria uma consulta (query) para buscar todas as transações desta família
        const qTransactions = firebase.query(
            firebase.collection(db, "transactions"), 
            firebase.where("familyGroupId", "==", familyId)
        );
        
        const transactionsSnapshot = await firebase.getDocs(qTransactions);
        const transactions = [];
        
        transactionsSnapshot.forEach(doc => {
            transactions.push({ id: doc.id, ...doc.data() });
        });

        // 4. ATUALIZA O ESTADO COM TRANSAÇÕES CARREGADAS
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        state.transactions = transactions;
        
        // --- 5. CARREGAR ORÇAMENTOS ---
        const qBudgets = firebase.query(firebase.collection(db, "familyGroups", familyId, "budgets"));
        const budgetsSnapshot = await firebase.getDocs(qBudgets);
        const budgets = [];
        budgetsSnapshot.forEach(doc => { budgets.push({ id: doc.id, ...doc.data() }); });
        state.budgets = budgets;
        
        // 6. CARREGAR MEMBROS
        const memberPromises = familyData.members.map(uid => firebase.getDoc(firebase.doc(db, "users", uid)));
        const memberDocs = await Promise.all(memberPromises);
        state.familyMembers = memberDocs.map(doc => ({ uid: doc.id, ...doc.data() }));

    } catch (e) {
        console.error("Erro ao carregar dados da família:", e);
        showToast("Erro ao carregar dados. Tente fazer login novamente.", 'error');
        state.family = null; 
        state.userFamilies = await fetchUserFamilies(); // Mantém a capacidade de trocar de família
        renderApp();
    }
}

export async function handleUpdateCategory(event) {
    event.preventDefault();
    const oldName = state.editingCategory;
    const newName = document.getElementById('category-name-input').value.trim();
    const newColor = document.getElementById('category-color-input').value;

    if (!newName) {
        showToast("O nome da categoria não pode ser vazio.", 'error');
        return;
    }

    try {
        const familyDocRef = firebase.doc(db, "familyGroups", state.family.id);

        const currentCategories = { ...state.userCategories };
        let type = '';

        if (currentCategories.expense.includes(oldName)) {
            type = 'expense';
        } else if (currentCategories.income.includes(oldName)) {
            type = 'income';
        }

        const oldCategories = currentCategories[type];
        const newCategories = oldCategories.filter(cat => cat !== oldName);

        if (oldCategories.includes(newName) && newName !== oldName) {
            showToast("Uma categoria com este nome já existe.", 'error');
            return;
        }

        newCategories.push(newName);
        
        // Atualizar o nome da categoria nas transações
        const transactionsToUpdate = state.transactions.filter(t => t.category === oldName);
        const batch = firebase.writeBatch(db);
        transactionsToUpdate.forEach(t => {
            const transactionRef = firebase.doc(db, "transactions", t.id);
            batch.update(transactionRef, { category: newName });
        });
        await batch.commit();

        // Atualizar no banco de dados da família
        await firebase.updateDoc(familyDocRef, {
            [`userCategories.${type}`]: newCategories,
            [`categoryColors.${newName}`]: newColor
        });
        
        // Remover a cor antiga se o nome mudou
        if (oldName !== newName) {
            const familyData = (await firebase.getDoc(familyDocRef)).data();
            const newColors = familyData.categoryColors;
            delete newColors[oldName];
            await firebase.updateDoc(familyDocRef, { categoryColors: newColors });
        }

        // Atualizar o estado local
        state.userCategories[type] = newCategories;
        state.categoryColors[newName] = newColor;
        delete state.categoryColors[oldName];

        // Recarregar os dados para refletir as mudanças
        await loadFamilyData(state.family.id);

        state.isModalOpen = false;
        state.editingCategory = '';
        renderApp();
        showToast("Categoria atualizada com sucesso!", 'success');
    } catch (e) {
        showToast("Erro ao atualizar categoria.", 'error');
        console.error(e);
    }
}

export async function handleDeleteCategory() {
    const categoryToDelete = state.editingCategory;
    
    try {
        const familyDocRef = firebase.doc(db, "familyGroups", state.family.id);
        const familyData = (await firebase.getDoc(familyDocRef)).data();
        const userCategories = familyData.userCategories;
        const categoryColors = familyData.categoryColors;
        
        // Identifica o tipo (receita ou despesa) da categoria
        let type = '';
        if (userCategories.expense.includes(categoryToDelete)) {
            type = 'expense';
        } else if (userCategories.income.includes(categoryToDelete)) {
            type = 'income';
        }

        // Remove a categoria da lista
        const newCategories = userCategories[type].filter(cat => cat !== categoryToDelete);
        
        // Remove a cor da categoria
        delete categoryColors[categoryToDelete];

        // Atualiza o documento no Firebase
        await firebase.updateDoc(familyDocRef, {
            [`userCategories.${type}`]: newCategories,
            categoryColors: categoryColors
        });

        // Atualizar transações para a categoria "Indefinida"
        const transactionsToUpdate = state.transactions.filter(t => t.category === categoryToDelete);
        const batch = firebase.writeBatch(db);
        transactionsToUpdate.forEach(t => {
            const transactionRef = firebase.doc(db, "transactions", t.id);
            batch.update(transactionRef, { category: 'Indefinida' });
        });
        await batch.commit();

        // Atualiza o estado local
        state.userCategories[type] = newCategories;
        delete state.categoryColors[categoryToDelete];
        state.transactions = state.transactions.map(t => t.category === categoryToDelete ? { ...t, category: 'Indefinida' } : t);

        state.isModalOpen = false;
        state.editingCategory = '';
        renderApp();
        showToast("Categoria excluída com sucesso! Transações relacionadas foram movidas para 'Indefinida'.", 'success');
    } catch (e) {
        showToast("Erro ao excluir categoria.", 'error');
        console.error(e);
    }
}