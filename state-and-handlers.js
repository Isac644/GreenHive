// state-and-handlers.js
import { firebase, db, auth, googleProvider } from "./firebase-config.js";
import { renderApp, showToast } from "./main.js";

// --- ESTADO GLOBAL DA APLICAÇÃO ---
export const state = {
    user: null,
    family: null,
    userFamilies: [],
    transactions: [],
    budgets: [],
    userCategories: { expense: [], income: [] },
    categoryColors: { 'Alimentação': '#F97316', 'Moradia': '#3B82F6', 'Transporte': '#EF4444', 'Lazer': '#8B5CF6', 'Saúde': '#14B8A6', 'Salário': '#10B981', 'Freelance': '#EAB308', 'Investimentos': '#06B6D4' },
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
};

export const PALETTE_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78716c', '#6b7280'];
export const CATEGORIES = { expense: ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde'], income: ['Salário', 'Freelance', 'Investimentos'] };

// --- LÓGICA / HANDLERS ---
export async function handleLogin(event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
    try {
        await firebase.signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        showToast("Falha no login: " + error.message, 'error');
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
        showToast("Falha no cadastro: " + error.message, 'error');
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
    const newFamily = {
        name: familyName,
        code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        members: [{ uid: state.user.uid, role: 'admin' }], // CORREÇÃO: Adicionado o objeto com a role
        userCategories: { expense: [], income: [] },
        categoryColors: state.categoryColors
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
        const familyData = familyDoc.data();
        
        // CORREÇÃO: Verificando se o usuário já é membro do novo array de objetos
        const userIsMember = familyData.members.some(member => member.uid === state.user.uid);

        if (!userIsMember) {
            const updatedMembers = [...familyData.members, { uid: state.user.uid, role: 'member' }];
            await firebase.updateDoc(firebase.doc(db, "familyGroups", familyId), { members: updatedMembers });
        }
        await handleSelectFamily(familyId);
        showToast("Você entrou na família com sucesso!", 'success');
    } catch (e) {
        showToast("Erro ao entrar na família.", 'error');
        console.error(e);
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
    const allCategories = [...CATEGORIES[type], ...(state.userCategories[type] || [])];
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
        state.modalView = 'transaction';
        renderApp();
        showToast("Nova categoria salva com sucesso!", 'success');
        setTimeout(() => { document.getElementById('category').value = newTagName; }, 0);
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
        // CORREÇÃO: Buscando por todas as famílias onde o UID do usuário está presente,
        // independentemente do cargo.
        const adminQuery = firebase.query(firebase.collection(db, "familyGroups"), firebase.where("members", "array-contains", { uid: state.user.uid, role: 'admin' }));
        const memberQuery = firebase.query(firebase.collection(db, "familyGroups"), firebase.where("members", "array-contains", { uid: state.user.uid, role: 'member' }));

        const [adminSnapshot, memberSnapshot] = await Promise.all([
            firebase.getDocs(adminQuery),
            firebase.getDocs(memberQuery)
        ]);

        const families = [];
        const seenFamilyIds = new Set();

        adminSnapshot.forEach(doc => {
            if (!seenFamilyIds.has(doc.id)) {
                families.push({ id: doc.id, ...doc.data() });
                seenFamilyIds.add(doc.id);
            }
        });

        memberSnapshot.forEach(doc => {
            if (!seenFamilyIds.has(doc.id)) {
                families.push({ id: doc.id, ...doc.data() });
                seenFamilyIds.add(doc.id);
            }
        });

        return families;
    } catch (error) {
        console.error("Erro ao buscar famílias:", error);
        return [];
    }
}

export async function loadFamilyData(familyId) {
    try {
        const familyDocSnap = await firebase.getDoc(firebase.doc(db, "familyGroups", familyId));
        if (!familyDocSnap.exists()) throw new Error("Família não encontrada!");
        const familyData = familyDocSnap.data();

        // Encontra a role do usuário atual
        const userInFamily = familyData.members.find(member => member.uid === state.user.uid);
        if (!userInFamily) throw new Error("Usuário não é membro desta família.");

        // Atualiza o estado com a nova informação de role
        state.user.role = userInFamily.role;

        state.family = { id: familyId, ...familyData };
        state.userCategories = familyData.userCategories || { expense: [], income: [] };
        state.categoryColors = familyData.categoryColors || state.categoryColors;

        const transactionsQuery = firebase.query(firebase.collection(db, "transactions"), firebase.where("familyGroupId", "==", familyId));
        const transactionsSnapshot = await firebase.getDocs(transactionsQuery);
        const loadedTransactions = [];
        transactionsSnapshot.forEach(doc => loadedTransactions.push({ id: doc.id, ...doc.data() }));
        state.transactions = loadedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        const budgetsQuery = firebase.collection(db, "familyGroups", familyId, "budgets");
        const budgetsSnapshot = await firebase.getDocs(budgetsQuery);
        const loadedBudgets = [];
        budgetsSnapshot.forEach(doc => loadedBudgets.push({ id: doc.id, ...doc.data() }));
        state.budgets = loadedBudgets;
    } catch (e) {
        showToast("Erro ao carregar dados da família. Você pode não ter permissão.", 'error');
        console.error(e);
        handleLeaveFamily();
    }
}