// state-and-handlers.js
import { firebase, db, auth, googleProvider } from "./firebase-config.js";
import { renderApp, showToast } from "./main.js";
import { 
    getFirestore, collection, addDoc, getDocs, doc, query, where, 
    updateDoc, arrayUnion, arrayRemove, getDoc, deleteDoc, writeBatch, 
    onSnapshot, setDoc 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { 
    updateProfile, 
    updatePassword, 
    EmailAuthProvider, 
    reauthenticateWithCredential 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

export const state = {
    user: null,
    family: null,
    userFamilies: [],
    transactions: [],
    budgets: [],
    debts: [],
    installments: [],
    userCategories: { expense: [], income: [] },
    categoryColors: {},
    theme: localStorage.getItem('theme') || 'light',
    authView: 'login',
    currentView: 'auth',
    detailsFilterType: 'all',
    displayedMonth: new Date(),
    selectedDate: null,
    isModalOpen: false,
    editingTransactionId: null,
    editingBudgetItemId: null,
    editingDebtId: null,
    editingInstallmentId: null,
    modalView: '',
    modalTransactionType: 'expense',
    modalBudgetType: 'expense',
    confirmingDelete: false,
    errorMessage: '',
    familyAdmins: [],
    familyMembers: [],
    editingCategory: '',
    notifications: [],
    joinRequestMessage: '',
    isNotificationMenuOpen: false,
    isSigningUp: false,
    settingsTab: 'profile',
    modalParentView: '',
    confirmationModal: {
        isOpen: false,
        title: '',
        message: '',
        type: 'danger',
        onConfirm: null
    },
    // Armazena todas as funções de cancelamento dos listeners (transactions, budgets, etc.)
    unsubscribers: [],
    isLoading: true,
    shouldAnimate: true,
    filterType: 'all',        // 'all', 'income', 'expense'
    filterCategory: null,     // Nome da categoria ou null
    filterMember: null,       // UID do membro ou null
    selectedDate: null,       // Dia do mês (número) ou null
    tempFilters: {
        type: 'all',
        category: null,
        member: null,
        date: null
    },
    editingGoalId: null, // NOVO: ID da meta em edição
    goals: [], // NOVO: Lista de Metas
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

export const CATEGORIES = { expense: [], income: [] }; 

export function handleOpenFilters() {
    // Copia o estado atual para o temporário ao abrir
    state.tempFilters = {
        type: state.filterType,
        category: state.filterCategory,
        member: state.filterMember,
        date: state.selectedDate
    };
    state.isModalOpen = true;
    state.modalView = 'filters';
    // Não anima o fundo ao abrir modal
    state.shouldAnimate = false; 
    renderApp();
}

export function handleApplyFilters() {
    // "Commita" as mudanças do temporário para o real
    state.filterType = state.tempFilters.type;
    state.filterCategory = state.tempFilters.category;
    state.filterMember = state.tempFilters.member;
    state.selectedDate = state.tempFilters.date;

    state.isModalOpen = false;
    state.shouldAnimate = true; // AGORA SIM ANIMA (Mudou a lista)
    renderApp();
    // showToast("Filtros aplicados.", "success"); // Opcional
}

export function handleClearFilters() {
    // Limpa o temporário (se estiver no modal) ou o real?
    // Como o botão "Limpar" está dentro do modal, limpamos o temporário.
    state.tempFilters = {
        type: 'all',
        category: null,
        member: null,
        date: null
    };
    renderApp(); // Atualiza visual do modal
}

// Toggles agora mexem no TEMP
export function handleToggleFilterType(type) {
    if (state.tempFilters.type === type) state.tempFilters.type = 'all';
    else state.tempFilters.type = type;
    renderApp();
}

export function handleToggleFilterCategory(category) {
    if (state.tempFilters.category === category) state.tempFilters.category = null;
    else state.tempFilters.category = category;
    renderApp();
}

export function handleToggleFilterMember(memberId) {
    if (state.tempFilters.member === memberId) state.tempFilters.member = null;
    else state.tempFilters.member = memberId;
    renderApp();
}

export function handleToggleFilterDate(day) {
    if (state.tempFilters.date === day) state.tempFilters.date = null;
    else state.tempFilters.date = day;
    renderApp();
}

// --- FUNÇÕES DE NOTIFICAÇÃO ---
export function subscribeToNotifications() {
    if (!state.user) return;
    const q = query(collection(db, "notifications"), where("recipientId", "==", state.user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
        const notifs = [];
        snapshot.forEach(doc => { notifs.push({ id: doc.id, ...doc.data() }); });
        state.notifications = notifs.sort((a, b) => b.createdAt - a.createdAt);
        
        // ALTERADO: Passa true. Assim se chegar notificação enquanto vc digita, não fecha o modal.
        renderApp(true);
    });
    return unsub; 
}

// --- FUNÇÕES DE TEMPO REAL (CORE) ---

// Limpa todos os listeners ativos (chamar ao sair da família ou deslogar)
function clearAllListeners() {
    if (state.unsubscribers.length > 0) {
        state.unsubscribers.forEach(unsub => unsub());
        state.unsubscribers = [];
    }
}

function forceExitFamily(message) {
    clearAllListeners(); // Para de ouvir tudo
    
    state.family = null;
    state.transactions = [];
    state.budgets = [];
    state.debts = [];
    state.installments = [];
    state.currentView = 'onboarding';
    state.isModalOpen = false;
    
    // Limpa persistência
    localStorage.removeItem('greenhive_last_family');

    fetchUserFamilies().then(families => {
        state.userFamilies = families;
        renderApp();
        if (message) showToast(message, 'error');
    });
}

// Inicia todos os listeners da família (Transações, Orçamentos, etc.)
export function subscribeToFamilyData(familyId) {
    clearAllListeners(); 

    const familyRef = doc(db, "familyGroups", familyId);
    
    const unsubFamily = onSnapshot(familyRef, { includeMetadataChanges: true }, async (snapshot) => {
        if (!snapshot.exists()) {
            state.isLoading = false; 
            forceExitFamily("A família que você estava acessando foi excluída.");
            return;
        }
        
        const data = snapshot.data();
        
        // PROTEÇÃO CONTRA 'members' UNDEFINED
        const membersList = data.members || []; 
        const isMember = membersList.includes(state.user.uid);

        if (!isMember) {
            if (snapshot.metadata.fromCache) {
                console.log("Cache desatualizado detectado. Aguardando servidor...");
                return; 
            }
            state.isLoading = false;
            forceExitFamily("Você foi removido desta família.");
            return;
        }

        state.family = { id: familyId, ...data };
        state.userCategories = data.userCategories || { expense: [], income: [] };
        state.categoryColors = data.categoryColors || {};
        state.categoryIcons = data.categoryIcons || {}; 
        state.familyAdmins = data.admins || [];

        if (state.familyMembers.length !== membersList.length) {
            const memberPromises = membersList.map(uid => getDoc(doc(db, "users", uid)));
            const memberDocs = await Promise.all(memberPromises);
            state.familyMembers = memberDocs.map(d => ({ uid: d.id, ...d.data() }));
        }
        
        state.isLoading = false;
        renderApp();
        state.shouldAnimate = false;
        checkAutomatedAlerts();
        checkRecurringTransactions(familyId);
    });
    state.unsubscribers.push(unsubFamily);

    // ... (Resto dos listeners de transações, budgets, etc. mantidos iguais) ...
    const handleSubCollectionSnapshot = (snapshot, listKey, sortFunc) => {
        const items = [];
        snapshot.forEach(d => items.push({ id: d.id, ...d.data() }));
        if (sortFunc) items.sort(sortFunc);
        state[listKey] = items;
        renderApp();
        state.shouldAnimate = false;
        checkAutomatedAlerts();
    };

    const qTrans = query(collection(db, "transactions"), where("familyGroupId", "==", familyId));
    state.unsubscribers.push(onSnapshot(qTrans, (s) => handleSubCollectionSnapshot(s, 'transactions', (a, b) => new Date(b.date) - new Date(a.date))));

    const qBudg = query(collection(db, "familyGroups", familyId, "budgets"));
    state.unsubscribers.push(onSnapshot(qBudg, (s) => handleSubCollectionSnapshot(s, 'budgets')));

    const qDebts = query(collection(db, "familyGroups", familyId, "debts"));
    state.unsubscribers.push(onSnapshot(qDebts, (s) => handleSubCollectionSnapshot(s, 'debts')));

    const qInst = query(collection(db, "familyGroups", familyId, "installments"));
    state.unsubscribers.push(onSnapshot(qInst, (s) => handleSubCollectionSnapshot(s, 'installments')));

    const qGoals = query(collection(db, "familyGroups", familyId, "goals"));
    state.unsubscribers.push(onSnapshot(qGoals, (snapshot) => { 
        const g = []; 
        snapshot.forEach(d => g.push({ id: d.id, ...d.data() })); 
        state.goals = g; 
        renderApp();
    }));
}

// --- HANDLERS ---

export async function handleSaveGoal(event) {
    event.preventDefault();
    
    // PROTEÇÃO DE PERMISSÃO
    if (!state.familyAdmins.includes(state.user.uid)) {
        showToast("Apenas administradores podem gerenciar metas.", 'error');
        return;
    }

    const formData = new FormData(event.target);
    const id = state.editingGoalId;
    
    const goalData = {
        name: formData.get('goalName'),
        targetAmount: parseFloat(formData.get('targetAmount')),
        deadline: formData.get('deadline') || null,
        icon: formData.get('goalIcon') || '🎯',
        color: formData.get('goalColor') || '#10B981',
        familyGroupId: state.family.id,
        userId: state.user.uid
    };

    if (!goalData.name || isNaN(goalData.targetAmount)) {
        showToast('Preencha nome e valor da meta.', 'error'); return;
    }

    try {
        const colRef = collection(db, "familyGroups", state.family.id, "goals");
        if (id) {
            await updateDoc(doc(colRef, id), goalData);
        } else {
            await addDoc(colRef, goalData);
        }
        
        // FECHAMENTO CORRETO
        state.editingGoalId = null; 
        state.isModalOpen = false; 
        renderApp(); 
        
        showToast("Meta salva com sucesso!", 'success');
    } catch (e) { 
        console.error(e);
        showToast("Erro ao salvar meta.", 'error'); 
    }
}

export async function handleDeleteGoal() {
    if (!state.editingGoalId) return;
    
    // PROTEÇÃO DE PERMISSÃO
    if (!state.familyAdmins.includes(state.user.uid)) {
        showToast("Apenas administradores podem excluir metas.", 'error');
        return;
    }

    // REMOVIDO O openConfirmation (Modal Global)
    // Agora a exclusão é direta, pois o usuário já clicou em "Sim" no modal inline.
    try {
        await deleteDoc(doc(db, "familyGroups", state.family.id, "goals", state.editingGoalId));
        
        // FECHAMENTO CORRETO
        state.editingGoalId = null; 
        state.isModalOpen = false; 
        state.confirmingDelete = false; // Reseta o estado do botão
        renderApp(); 
        
        showToast("Meta excluída.", 'success');
    } catch (e) { 
        console.error(e);
        showToast("Erro ao excluir.", 'error'); 
    }
}

// Selecionar Família (Agora com persistência)
export async function handleSelectFamily(familyId) {
    state.shouldAnimate = true; 
    subscribeToFamilyData(familyId);
    localStorage.setItem('greenhive_last_family', familyId);
    state.currentView = 'dashboard';
}

// Trocar Família (Limpa persistência)
export function handleSwitchFamily() {
    clearAllListeners();
    state.family = null; state.transactions = []; state.budgets = []; state.debts = []; state.installments = [];
    state.userCategories = { expense: [], income: [] }; state.categoryColors = {}; state.familyAdmins = []; state.familyMembers = [];
    state.currentView = 'onboarding'; state.isModalOpen = false;
    localStorage.removeItem('greenhive_last_family');
    fetchUserFamilies().then(families => { state.userFamilies = families; renderApp(); });
    showToast("Você saiu da visualização da família.", 'success');
}
export async function handleLogout() {
    clearAllListeners();
    if (userFamiliesUnsubscribe) userFamiliesUnsubscribe(); // Para de ouvir a lista de famílias
    localStorage.removeItem('greenhive_last_family');
    await firebase.signOut(auth);
}

// As funções de escrita (add/update/delete) NÃO precisam mais manipular o state.
// Elas apenas escrevem no banco. O listener (onSnapshot) vai ver a mudança e atualizar o state automaticamente.
// Isso simplifica muito o código e garante que o que está na tela é o que está no banco.

export async function handleAddTransaction(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const description = formData.get('description');
    const amount = parseFloat(formData.get('amount'));
    const date = formData.get('date');
    const category = formData.get('category');
    const type = state.modalTransactionType;
    const linkedEntity = formData.get('linkedEntity'); 
    const isRecurring = formData.get('isRecurring') === 'on'; // NOVO

    if (!description || !amount || !date || !category || category === '--create-new--') {
        showToast('Preencha todos os campos.', 'error'); return;
    }

    let linkedDebtId = null;
    let linkedInstallmentId = null;
    let linkedGoalId = null;

    if (linkedEntity) {
        const [entityType, entityId] = linkedEntity.split(':');
        if (entityType === 'debt') linkedDebtId = entityId;
        if (entityType === 'installment') linkedInstallmentId = entityId;
        if (entityType === 'goal') linkedGoalId = entityId;
    }

    const newTransaction = { description, amount, date, category, type, userId: state.user.uid, userName: state.user.name, familyGroupId: state.family.id, linkedDebtId, linkedInstallmentId, linkedGoalId };
    
    try {
        // 1. Salva a transação normal
        await addDoc(collection(db, "transactions"), newTransaction);
        
        // 2. Se for recorrente, salva o modelo na subcoleção 'recurring'
        if (isRecurring) {
            const transactionDate = new Date(date + 'T12:00:00');
            const dayOfMonth = transactionDate.getDate(); // Dia que deve repetir
            
            await addDoc(collection(db, "familyGroups", state.family.id, "recurring"), {
                description, amount, category, type, 
                userId: state.user.uid, userName: state.user.name,
                dayOfMonth: dayOfMonth,
                lastProcessedDate: date, // Data da última criação (hoje)
                linkedDebtId, linkedInstallmentId,
                familyGroupId: state.family.id
            });
            showToast("Transação e recorrência criadas!", 'success');
        } else {
            showToast("Transação adicionada!", 'success');
        }

        state.isModalOpen = false; 
        renderApp(); 
    } catch (e) { 
        console.error(e);
        showToast("Erro ao adicionar.", 'error'); 
    }
}
export async function handleUpdateTransaction(event) {
event.preventDefault();
    const transactionId = state.editingTransactionId;
    
    // Verifica Permissão
    const transaction = state.transactions.find(t => t.id === transactionId);
    const isAdmin = state.familyAdmins.includes(state.user.uid);
    if (!isAdmin && transaction.userId !== state.user.uid) {
        showToast("Você não tem permissão para editar este registro.", 'error');
        return;
    }

    event.preventDefault();
    const formData = new FormData(event.target);
    const linkedEntity = formData.get('linkedEntity');
    // NOVO: Pega o estado do checkbox
    const isRecurring = formData.get('isRecurring') === 'on';
    
    
    let linkedDebtId = null; let linkedInstallmentId = null; let linkedGoalId = null; // NOVO
    if (linkedEntity) { const [entityType, entityId] = linkedEntity.split(':'); if (entityType === 'debt') linkedDebtId = entityId; if (entityType === 'installment') linkedInstallmentId = entityId; if (entityType === 'goal') linkedGoalId = entityId;}
    
    const updatedData = { 
        description: formData.get('description'), 
        amount: parseFloat(formData.get('amount')), 
        date: formData.get('date'), 
        category: formData.get('category'), 
        linkedDebtId, 
        linkedInstallmentId,
        linkedGoalId // NOVO: Salva no banco
    };
    
    try {
        // 1. Atualiza a transação existente
        await updateDoc(doc(db, "transactions", transactionId), updatedData);
        
        // 2. Se marcou como recorrente, cria a entrada na coleção 'recurring'
        if (isRecurring) {
             const transactionDate = new Date(updatedData.date + 'T12:00:00');
             await addDoc(collection(db, "familyGroups", state.family.id, "recurring"), {
                description: updatedData.description,
                amount: updatedData.amount,
                category: updatedData.category,
                type: state.transactions.find(t => t.id === transactionId)?.type || 'expense',
                userId: state.user.uid, 
                userName: state.user.name,
                dayOfMonth: transactionDate.getDate(),
                lastProcessedDate: updatedData.date,
                linkedDebtId, linkedInstallmentId,
                familyGroupId: state.family.id
            });
            showToast("Atualizado e recorrência criada!", 'success');
        } else {
            showToast("Transação atualizada!", 'success');
        }

        state.editingTransactionId = null; 
        state.isModalOpen = false; 
        renderApp(); 
        
    } catch (e) { 
        console.error(e);
        showToast("Erro ao atualizar.", 'error'); 
    }
}

export async function handleDeleteTransaction() {
    const transactionId = state.editingTransactionId;
    if (!transactionId) return;
    
    // Verifica Permissão
    const transaction = state.transactions.find(t => t.id === transactionId);
    const isAdmin = state.familyAdmins.includes(state.user.uid);
    if (!isAdmin && transaction.userId !== state.user.uid) {
        showToast("Você não tem permissão para excluir este registro.", 'error');
        return;
    }
    try { await deleteDoc(doc(db, "transactions", transactionId)); state.editingTransactionId = null; state.isModalOpen = false; state.confirmingDelete = false; renderApp(); showToast("Transação excluída!", 'success'); } catch (e) { console.error(e); showToast("Erro ao excluir.", 'error'); }
}

export async function handleSaveDebt(event) {
    event.preventDefault(); const formData = new FormData(event.target); const id = state.editingDebtId;
    const debtData = { name: formData.get('debtName'), debtorId: formData.get('debtorId'), totalValue: parseFloat(formData.get('debtTotalValue')), dueDate: formData.get('debtDueDate') || null, familyGroupId: state.family.id, userId: state.user.uid };
    if (!debtData.name || !debtData.debtorId || isNaN(debtData.totalValue)) { showToast('Preencha os campos.', 'error'); return; }
    try { const colRef = collection(db, "familyGroups", state.family.id, "debts"); if (id) { await updateDoc(doc(colRef, id), debtData); } else { await addDoc(colRef, debtData); } state.editingDebtId = null; state.isModalOpen = false; renderApp(); showToast("Dívida salva!", 'success'); } catch (e) { showToast("Erro.", 'error'); }
}

export async function handleDeleteDebt() {
    if (!state.editingDebtId) return;
    try { await deleteDoc(doc(db, "familyGroups", state.family.id, "debts", state.editingDebtId)); state.editingDebtId = null; state.isModalOpen = false; state.confirmingDelete = false; renderApp(); showToast("Dívida excluída.", 'success'); } catch (e) { showToast("Erro.", 'error'); }
}

export async function handleSaveInstallment(event) {
    event.preventDefault(); const formData = new FormData(event.target); const id = state.editingInstallmentId;
    const instData = { name: formData.get('installmentName'), debtorId: formData.get('debtorId'), installmentsCount: parseInt(formData.get('installmentsCount')), valuePerInstallment: parseFloat(formData.get('valuePerInstallment')), totalValue: parseInt(formData.get('installmentsCount')) * parseFloat(formData.get('valuePerInstallment')), dueDay: parseInt(formData.get('dueDay')), familyGroupId: state.family.id, userId: state.user.uid };
    if (!instData.name || !instData.debtorId || isNaN(instData.totalValue)) { showToast('Preencha os campos.', 'error'); return; }
    try { const colRef = collection(db, "familyGroups", state.family.id, "installments"); if (id) { await updateDoc(doc(colRef, id), instData); } else { await addDoc(colRef, instData); } state.editingInstallmentId = null; state.isModalOpen = false; renderApp(); showToast("Parcelamento salvo!", 'success'); } catch (e) { showToast("Erro.", 'error'); }
}

export async function handleDeleteInstallment() {
    if (!state.editingInstallmentId) return;
    try { await deleteDoc(doc(db, "familyGroups", state.family.id, "installments", state.editingInstallmentId)); state.editingInstallmentId = null; state.isModalOpen = false; state.confirmingDelete = false; renderApp(); showToast("Excluído.", 'success'); } catch (e) { showToast("Erro.", 'error'); }
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
    
    try {
        const col = collection(db, "familyGroups", state.family.id, "budgets");
        if (id) { 
            await updateDoc(doc(col, id), budgetData); 
        } else { 
            await addDoc(col, budgetData); 
        }
        
        // CORREÇÃO: Fecha o modal e atualiza
        state.editingBudgetItemId = null; 
        state.isModalOpen = false; 
        renderApp(); 
        
        showToast("Orçamento salvo!", 'success');
    } catch (e) { showToast("Erro ao salvar orçamento.", 'error'); }
}

export async function handleDeleteBudget() {
    if (!state.editingBudgetItemId) return;
    try { 
        await deleteDoc(doc(db, "familyGroups", state.family.id, "budgets", state.editingBudgetItemId)); 
        
        // CORREÇÃO: Fecha o modal, reseta confirmação e atualiza
        state.editingBudgetItemId = null; 
        state.isModalOpen = false; 
        state.confirmingDelete = false;
        renderApp(); 
        
        showToast("Orçamento excluído!", 'success'); 
    } catch (e) { showToast("Erro ao excluir.", 'error'); }
}

export async function handleSaveNewTag(event) {
    event.preventDefault();
    const form = event.target;
    const newTagName = form.newTagName.value.trim();
    const newTagColor = form.newTagColor.value;
    const newTagIcon = form.newTagIcon.value; // Pega o emoji
    const type = state.modalTransactionType;

    if (!newTagName || !newTagColor || !newTagIcon) { 
        showToast('Preencha todos os campos e escolha um ícone.', 'error'); 
        return; 
    }
    
    if (state.userCategories[type].includes(newTagName)) { 
        showToast('Categoria já existe.', 'error'); 
        return; 
    }

    try {
        await firebase.updateDoc(firebase.doc(db, "familyGroups", state.family.id), { 
            [`userCategories.${type}`]: arrayUnion(newTagName), 
            [`categoryColors.${newTagName}`]: newTagColor,
            [`categoryIcons.${newTagName}`]: newTagIcon // Salva o ícone
        });
        
        state.modalView = state.modalParentView || 'transaction'; 
        state.modalParentView = ''; 
        renderApp(); 
        showToast("Categoria criada!", 'success');
    } catch (e) { showToast("Erro ao criar categoria.", 'error'); }
}

// --- FUNÇÕES DE TEMPO REAL ---
export function subscribeToFamily(familyId) {
    if (state.familyUnsubscribe) state.familyUnsubscribe();
    const familyRef = doc(db, "familyGroups", familyId);
    state.familyUnsubscribe = onSnapshot(familyRef, async (snapshot) => {
        if (!snapshot.exists()) {
            forceExitFamily("A família que você estava acessando foi excluída.");
            return;
        }
        const data = snapshot.data();
        if (!data.members.includes(state.user.uid)) {
            forceExitFamily("Você foi removido desta família.");
            return;
        }
        if (state.family && state.family.id === familyId) {
            state.family = { id: familyId, ...data };
            state.familyAdmins = data.admins || [];
            if (state.familyMembers.length !== data.members.length) {
                const memberPromises = data.members.map(uid => getDoc(doc(db, "users", uid)));
                const memberDocs = await Promise.all(memberPromises);
                state.familyMembers = memberDocs.map(d => ({ uid: d.id, ...d.data() }));
            }
            renderApp();
        }
    });
}

// --- HANDLERS ---
export async function handleLogin(event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
    try {
        const userCredential = await firebase.signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
            await firebase.signOut(auth);
            showToast("Seu email ainda não foi verificado.", 'error');
            return;
        }
    } catch (error) {
        let errorMessage = "Erro desconhecido.";
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') errorMessage = "Email ou senha incorretos.";
        showToast("Falha no login: " + errorMessage, 'error');
    }
}

export async function handleSignup(event) {
    event.preventDefault();
    const name = event.target.name.value;
    const email = event.target.email.value;
    const password = event.target.password.value;
    if (!name || !email || !password) { showToast("Preencha todos os campos.", 'error'); return; }
    state.isSigningUp = true; 
    try {
        const userCredential = await firebase.createUserWithEmailAndPassword(auth, email, password);
        await firebase.updateProfile(userCredential.user, { displayName: name });
        await setDoc(doc(db, "users", userCredential.user.uid), { name: name, email: email, photoURL: null });
        const actionCodeSettings = { url: window.location.href, handleCodeInApp: false };
        await firebase.sendEmailVerification(userCredential.user, actionCodeSettings);
        await firebase.signOut(auth);
        state.isSigningUp = false; 
        state.authView = 'signup-success'; 
        renderApp();
    } catch (error) {
        state.isSigningUp = false;
        showToast("Falha no cadastro: " + error.message, 'error');
    }
}

export async function handleGoogleLogin() {
    try {
        // CONFIGURAÇÃO: Força o Google a mostrar a tela de seleção de contas
        googleProvider.setCustomParameters({
            prompt: 'select_account'
        });

        const result = await firebase.signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Salva/Atualiza usuário no Firestore
        await setDoc(doc(db, "users", user.uid), { 
            name: user.displayName, 
            email: user.email, 
            photoURL: user.photoURL 
        }, { merge: true });

    } catch (error) { 
        console.error("Erro Google:", error);
        showToast("Erro no login com Google.", 'error'); 
    }
}

export async function handleCreateFamily(event) {
    event.preventDefault();
    const familyName = event.target.familyName.value;
    if (!familyName) return;
    
    // Inicializa com cores e ícones padrão
    const initialCategories = { expense: [...DEFAULT_CATEGORIES_SETUP.expense], income: [...DEFAULT_CATEGORIES_SETUP.income] };
    const initialColors = { ...DEFAULT_CATEGORIES_SETUP.colors };
    const initialIcons = { ...DEFAULT_CATEGORIES_SETUP.icons };

    const newFamily = { 
        name: familyName, 
        code: Math.random().toString(36).substring(2, 8).toUpperCase(), 
        members: [state.user.uid], 
        admins: [state.user.uid], 
        userCategories: initialCategories, 
        categoryColors: initialColors,
        categoryIcons: initialIcons // Salva ícones
    };

    try {
        const docRef = await firebase.addDoc(firebase.collection(db, "familyGroups"), newFamily);
        await handleSelectFamily(docRef.id);
        showToast("Família criada!", 'success');
    } catch (e) { showToast("Erro ao criar família.", 'error'); }
}

export async function handleJoinFamily(event) {
    event.preventDefault();
    const code = event.target.inviteCode.value.toUpperCase().trim();
    if (!code) return;
    state.joinRequestMessage = ''; renderApp(); 
    try {
        const qFamily = firebase.query(firebase.collection(db, "familyGroups"), firebase.where("code", "==", code));
        const querySnapshot = await firebase.getDocs(qFamily);
        if (querySnapshot.empty) { state.joinRequestMessage = "Código inválido."; renderApp(); return; }
        const familyData = querySnapshot.docs[0].data();
        if (familyData.members.includes(state.user.uid)) { state.joinRequestMessage = `Você já é membro de "${familyData.name}".`; renderApp(); return; }
        
        const qExisting = firebase.query(firebase.collection(db, "notifications"), firebase.where("senderId", "==", state.user.uid), firebase.where("targetFamilyId", "==", querySnapshot.docs[0].id), where("type", "==", "join_request"));
        if (!(await firebase.getDocs(qExisting)).empty) { state.joinRequestMessage = 'Solicitação pendente.'; renderApp(); return; }

        const batch = firebase.writeBatch(db);
        familyData.admins.forEach(adminId => {
            const notifRef = firebase.doc(firebase.collection(db, "notifications"));
            batch.set(notifRef, { recipientId: adminId, senderId: state.user.uid, senderName: state.user.name, targetFamilyId: querySnapshot.docs[0].id, targetFamilyName: familyData.name, type: 'join_request', createdAt: Date.now(), read: false });
        });
        await batch.commit();
        state.joinRequestMessage = `Solicitação enviada para "${familyData.name}".`; renderApp(); showToast("Solicitação enviada!", 'success');
    } catch (e) { showToast("Erro ao processar solicitação.", 'error'); }
}

export function handleLeaveFamily() {
    openConfirmation(
        "Sair da Família",
        "Ao sair, todas as suas transações e dívidas pendentes nesta família serão apagadas. Tem certeza?",
        async () => {
            const familyId = state.family.id;
            const userId = state.user.uid;
            const familyRef = doc(db, "familyGroups", familyId);

            try {
                const batch = firebase.writeBatch(db);

                // Apaga Transações
                const qTrans = query(collection(db, "transactions"), where("familyGroupId", "==", familyId), where("userId", "==", userId));
                const transDocs = await getDocs(qTrans);
                transDocs.forEach(d => batch.delete(d.ref));

                // Apaga Dívidas (onde sou devedor)
                const qDebts = query(collection(db, "familyGroups", familyId, "debts"), where("debtorId", "==", userId));
                const debtDocs = await getDocs(qDebts);
                debtDocs.forEach(d => batch.delete(d.ref));

                // Apaga Parcelamentos (onde sou devedor)
                const qInst = query(collection(db, "familyGroups", familyId, "installments"), where("debtorId", "==", userId));
                const instDocs = await getDocs(qInst);
                instDocs.forEach(d => batch.delete(d.ref));

                // Executa limpeza
                await batch.commit();

                const fDoc = await getDoc(familyRef);
                const fData = fDoc.data();
                
                if (fData.members.length === 1) {
                    await handleDeleteFamily(); 
                    return;
                } 
                
                // Lógica de passar Admin se necessário
                if (fData.admins.includes(userId) && fData.admins.length === 1) {
                    const nextAdmin = fData.members.find(m => m !== userId);
                    // CORREÇÃO AQUI: Usando arrayRemove e arrayUnion importados
                    await updateDoc(familyRef, { 
                        members: arrayRemove(userId), 
                        admins: arrayUnion(nextAdmin) 
                    });
                    await updateDoc(familyRef, { admins: arrayRemove(userId) });
                } else {
                    // CORREÇÃO AQUI: Usando arrayRemove importado
                    await updateDoc(familyRef, { 
                        members: arrayRemove(userId), 
                        admins: arrayRemove(userId) 
                    });
                }

                handleSwitchFamily();
                showToast("Você saiu e seus dados foram limpos.", 'success');

            } catch (e) {
                console.error(e);
                showToast("Erro ao sair.", 'error');
            }
        }
    );
}
// --- DÍVIDAS E PARCELAMENTOS HANDLERS ---


export function handleChangeMonth(direction) {
    // Muda o mês
    state.displayedMonth.setMonth(state.displayedMonth.getMonth() + direction);
    state.selectedDate = null;
    
    // ATIVA A ANIMAÇÃO (Pois é uma mudança de "página" visual)
    state.shouldAnimate = true;
    
    renderApp();
}

export function handleToggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light'; localStorage.setItem('theme', state.theme); renderApp();
}

export async function fetchUserFamilies() {
    if (!state.user?.uid) return [];
    const q = query(collection(db, "familyGroups"), where("members", "array-contains", state.user.uid));
    const s = await getDocs(q); const f = []; s.forEach(d => f.push({ id: d.id, ...d.data() })); return f;
}

export async function loadFamilyData(familyId) {
    try {
        const fDoc = await firebase.getDoc(firebase.doc(db, "familyGroups", familyId));
        if (!fDoc.exists()) throw new Error("Família não encontrada!");
        const fData = fDoc.data();
        state.family = { id: familyId, ...fData };
        state.userCategories = fData.userCategories || { expense: [], income: [] };
        state.categoryColors = fData.categoryColors || {};
        state.familyAdmins = fData.admins || [];

        const qTrans = firebase.query(firebase.collection(db, "transactions"), firebase.where("familyGroupId", "==", familyId));
        const sTrans = await firebase.getDocs(qTrans);
        const t = []; sTrans.forEach(d => t.push({ id: d.id, ...d.data() }));
        state.transactions = t.sort((a, b) => new Date(b.date) - new Date(a.date));

        const qBudg = firebase.query(firebase.collection(db, "familyGroups", familyId, "budgets"));
        const sBudg = await firebase.getDocs(qBudg);
        const b = []; sBudg.forEach(d => b.push({ id: d.id, ...d.data() }));
        state.budgets = b;

        // Carregar Dívidas
        const qDebts = firebase.query(firebase.collection(db, "familyGroups", familyId, "debts"));
        const sDebts = await firebase.getDocs(qDebts);
        const dbts = []; sDebts.forEach(d => dbts.push({ id: d.id, ...d.data() }));
        state.debts = dbts;

        // Carregar Parcelamentos
        const qInst = firebase.query(firebase.collection(db, "familyGroups", familyId, "installments"));
        const sInst = await firebase.getDocs(qInst);
        const insts = []; sInst.forEach(d => insts.push({ id: d.id, ...d.data() }));
        state.installments = insts;

        const mProm = fData.members.map(uid => getDoc(doc(db, "users", uid)));
        const mDocs = await Promise.all(mProm);
        state.familyMembers = mDocs.map(d => ({ uid: d.id, ...d.data() }));
    } catch (e) { console.error(e); showToast("Erro ao carregar.", 'error'); state.family = null; state.userFamilies = await fetchUserFamilies(); renderApp(); }
}

export async function handleUpdateCategory(event) {
    event.preventDefault();
    const oldName = state.editingCategory;
    const newName = document.getElementById('category-name-input').value.trim();
    const newColor = document.getElementById('category-color-input').value;
    
    // Captura o ícone selecionado (radio button)
    const iconInput = document.querySelector('input[name="editCategoryIcon"]:checked');
    const newIcon = iconInput ? iconInput.value : (state.categoryIcons[oldName] || '🏷️');

    if (!newName) { showToast("O nome não pode ser vazio.", 'error'); return; }

    try {
        const familyDocRef = firebase.doc(db, "familyGroups", state.family.id);
        const currentCategories = { ...state.userCategories };
        let type = currentCategories.expense.includes(oldName) ? 'expense' : 'income';
        const newCategories = currentCategories[type].filter(cat => cat !== oldName);
        
        if (newCategories.includes(newName)) { showToast("Nome já existe.", 'error'); return; }
        newCategories.push(newName);

        // Atualiza transações antigas
        if (newName !== oldName) {
            const batch = firebase.writeBatch(db);
            state.transactions.filter(t => t.category === oldName).forEach(t => {
                batch.update(doc(db, "transactions", t.id), { category: newName });
            });
            await batch.commit();
        }

        // Atualiza metadados da categoria
        await firebase.updateDoc(familyDocRef, {
            [`userCategories.${type}`]: newCategories,
            [`categoryColors.${newName}`]: newColor,
            [`categoryIcons.${newName}`]: newIcon
        });

        if (oldName !== newName) {
            // Limpa dados antigos (opcional, simplificado aqui)
            // Se quiser limpar 100%, teria que deletar a chave
        }

        state.isModalOpen = false;
        state.editingCategory = '';
        renderApp();
        showToast("Categoria atualizada!", 'success');
    } catch (e) { console.error(e); showToast("Erro ao atualizar.", 'error'); }
}

export async function handleDeleteCategory() {
    const categoryToDelete = state.editingCategory;
    try {
        const familyDocRef = firebase.doc(db, "familyGroups", state.family.id);
        let type = state.userCategories.expense.includes(categoryToDelete) ? 'expense' : 'income';
        
        const newCategories = state.userCategories[type].filter(cat => cat !== categoryToDelete);
        
        await firebase.updateDoc(familyDocRef, {
            [`userCategories.${type}`]: newCategories
        });

        const batch = firebase.writeBatch(db);
        state.transactions.filter(t => t.category === categoryToDelete).forEach(t => {
            batch.update(doc(db, "transactions", t.id), { category: 'Indefinida' });
        });
        await batch.commit();

        state.isModalOpen = false;
        state.editingCategory = '';
        renderApp();
        showToast("Categoria excluída.", 'success');
    } catch (e) { showToast("Erro ao excluir.", 'error'); }
}

// --- CONFIGURAÇÕES DE PERFIL E FAMÍLIA ---

// Atualizar Perfil (Nome e Avatar/Emoji)
export async function handleUpdateProfile(event) {
    event.preventDefault();
    const displayName = event.target.displayName.value;
    const emoji = event.target.avatarEmoji.value;
    const color = event.target.avatarColor.value;
    const photoURL = `${emoji}|${color}`;

    try {
        await firebase.updateProfile(auth.currentUser, { 
            displayName: displayName,
            photoURL: photoURL 
        });
        
        // NOVO: Sincroniza com Firestore
        await updateDoc(doc(db, "users", state.user.uid), {
            name: displayName,
            photoURL: photoURL
        });
        
        state.user.name = displayName;
        state.user.photoURL = photoURL;
        
        showToast("Perfil atualizado com sucesso!", 'success');
        renderApp(); 
    } catch (e) {
        console.error(e);
        showToast("Erro ao atualizar perfil.", 'error');
    }
}

// Alterar Senha
export async function handleChangePassword(event) {
    event.preventDefault();
    const currentPassword = event.target.currentPassword.value;
    const newPassword = event.target.newPassword.value;

    try {
        const user = auth.currentUser;
        
        // CORREÇÃO 1: Removido 'firebase.' antes de EmailAuthProvider
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        
        // CORREÇÃO 2: Removido 'firebase.' antes de reauthenticateWithCredential
        // Reautenticar por segurança (necessário antes de trocar senha)
        await reauthenticateWithCredential(user, credential);
        
        // CORREÇÃO 3: Removido 'firebase.' antes de updatePassword
        // Atualizar senha
        await updatePassword(user, newPassword);
        
        showToast("Senha alterada com sucesso!", 'success');
        event.target.reset();

        // Opcional: Fecha o formulário visualmente após o sucesso
        const formContainer = document.getElementById('password-form-container');
        const chevron = document.getElementById('password-chevron');
        if (formContainer) {
            formContainer.classList.add('hidden');
            if (chevron) chevron.classList.remove('rotate-180');
        }

    } catch (e) {
        console.error(e);
        if (e.code === 'auth/wrong-password') {
            showToast("Senha atual incorreta.", 'error');
        } else if (e.code === 'auth/weak-password') {
            showToast("A nova senha deve ter pelo menos 6 caracteres.", 'error');
        } else {
            showToast("Erro ao alterar senha. Tente novamente.", 'error');
        }
    }
}

// (ADMIN) Renomear Família
export async function handleUpdateFamilyName(event) {
    event.preventDefault();
    const newName = document.getElementById('edit-family-name-input').value;

    try {
        const familyRef = firebase.doc(db, "familyGroups", state.family.id);
        await firebase.updateDoc(familyRef, { name: newName });
        state.family.name = newName;
        showToast("Nome atualizado!", 'success');
        document.getElementById('family-name-display').classList.remove('hidden');
        document.getElementById('family-name-edit').classList.add('hidden');
        renderApp(); 
    } catch (e) {
        console.error(e);
        showToast("Erro ao atualizar nome.", 'error');
    }
}

export async function handleRegenerateCode() {
    try {
        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const familyRef = firebase.doc(db, "familyGroups", state.family.id);
        await firebase.updateDoc(familyRef, { code: newCode });
        state.family.code = newCode;
        showToast("Novo código de convite gerado!", 'success');
        renderApp();
    } catch (e) {
        console.error(e);
        showToast("Erro ao gerar código.", 'error');
    }
}

// --- NOVAS FUNÇÕES DE GERENCIAMENTO DE MEMBROS ---

export async function handlePromoteMember(memberId) {
    try {
        const familyRef = firebase.doc(db, "familyGroups", state.family.id);
        await firebase.updateDoc(familyRef, {
            admins: firebase.arrayUnion(memberId)
        });
        // Atualiza estado local
        state.familyAdmins.push(memberId);
        renderApp(); // Re-renderiza para atualizar a UI
        showToast("Membro promovido a Admin!", 'success');
    } catch (e) {
        console.error(e);
        showToast("Erro ao promover membro.", 'error');
    }
}

export function handleKickMember(memberId, memberName) {
    openConfirmation(
        "Remover Membro",
        `Tem certeza que deseja remover <strong>${memberName}</strong> e apagar todos os seus registros?`,
        async () => {
            try {
                const batch = firebase.writeBatch(db);
                const familyId = state.family.id;
                const familyRef = doc(db, "familyGroups", familyId);
                
                // CORREÇÃO: Usando arrayRemove direto
                batch.update(familyRef, {
                    members: arrayRemove(memberId),
                    admins: arrayRemove(memberId)
                });

                // ... (código de deleção dos dados mantido igual ao anterior) ...
                const qTrans = query(collection(db, "transactions"), where("familyGroupId", "==", familyId), where("userId", "==", memberId));
                const transDocs = await getDocs(qTrans);
                transDocs.forEach(d => batch.delete(d.ref));

                const qDebts = query(collection(db, "familyGroups", familyId, "debts"), where("debtorId", "==", memberId));
                const debtDocs = await getDocs(qDebts);
                debtDocs.forEach(d => batch.delete(d.ref));

                const qInst = query(collection(db, "familyGroups", familyId, "installments"), where("debtorId", "==", memberId));
                const instDocs = await getDocs(qInst);
                instDocs.forEach(d => batch.delete(d.ref));

                await batch.commit();
                
                showToast(`${memberName} removido.`, 'success');
            } catch (e) {
                console.error(e);
                showToast("Erro ao remover.", 'error');
            }
        }
    );
}

export function handleDeleteFamily() {
    openConfirmation(
        "Excluir Família",
        "ATENÇÃO: Isso excluirá <strong>PERMANENTEMENTE</strong> a família, todas as transações e históricos. <br><br>Essa ação não pode ser desfeita.",
        async () => {
            try {
                const batch = firebase.writeBatch(db);
                const familyId = state.family.id;

                const transQuery = firebase.query(firebase.collection(db, "transactions"), firebase.where("familyGroupId", "==", familyId));
                const transDocs = await firebase.getDocs(transQuery);
                transDocs.forEach(doc => batch.delete(doc.ref));

                const budgetsQuery = firebase.query(firebase.collection(db, "familyGroups", familyId, "budgets"));
                const budgetDocs = await firebase.getDocs(budgetsQuery);
                budgetDocs.forEach(doc => batch.delete(doc.ref));

                const familyRef = firebase.doc(db, "familyGroups", familyId);
                batch.delete(familyRef);

                await batch.commit();

                showToast("Família excluída.", 'success');
                state.family = null;
                state.transactions = [];
                state.userFamilies = await fetchUserFamilies();
                state.currentView = 'onboarding';
                state.isModalOpen = false; // Fecha o modal da família
                // O renderApp virá no closeConfirmation
            } catch (e) {
                console.error(e);
                showToast("Erro ao excluir família.", 'error');
            }
        }
    );
}

export function openConfirmation(title, message, action, type = 'danger') {
    state.confirmationModal = {
        isOpen: true,
        title,
        message,
        type,
        onConfirm: action
    };
    renderApp();
}

// 2. Função chamada quando clica em "Sim" no modal
export async function handleConfirmAction() {
    if (state.confirmationModal.onConfirm) {
        await state.confirmationModal.onConfirm();
    }
    closeConfirmation();
}

// 3. Função para fechar o modal
export function closeConfirmation() {
    state.confirmationModal = { isOpen: false, title: '', message: '', onConfirm: null };
    renderApp();
}

export async function handleAcceptJoinRequest(notificationId) {
    const notification = state.notifications.find(n => n.id === notificationId);

    if (!notification) {
        console.error("Notificação não encontrada para aceite.");
        return;
    }

    try {
        const batch = writeBatch(db);
        const familyRef = doc(db, "familyGroups", notification.targetFamilyId);
        
        // 1. Adiciona membro
        batch.update(familyRef, { members: arrayUnion(notification.senderId) });
        
        // 2. Apaga solicitação original
        const notifRef = doc(db, "notifications", notification.id);
        batch.delete(notifRef);
        
        // 3. Avisa o usuário que foi aceito (CORRIGIDO: Incluindo targetFamilyId)
        const newNotifRef = doc(collection(db, "notifications"));
        batch.set(newNotifRef, {
            recipientId: notification.senderId,
            senderId: state.user.uid,
            senderName: state.user.name,
            targetFamilyId: notification.targetFamilyId, // <--- ESSA LINHA FALTAVA!
            targetFamilyName: notification.targetFamilyName,
            type: 'request_accepted',
            createdAt: Date.now(),
            read: false
        });

        // 4. Limpa duplicatas
        const qOthers = query(collection(db, "notifications"), where("senderId", "==", notification.senderId), where("targetFamilyId", "==", notification.targetFamilyId), where("type", "==", "join_request"));
        const otherDocs = await getDocs(qOthers);
        otherDocs.forEach(d => { if (d.id !== notification.id) batch.delete(d.ref); });

        await batch.commit();

        showToast(`${notification.senderName} foi adicionado!`, 'success');
    } catch (e) {
        console.error(e);
        showToast("Erro ao aceitar solicitação.", 'error');
    }
}

export async function handleDeleteNotification(notificationId) {
    try {
        await deleteDoc(doc(db, "notifications", notificationId));
    } catch (e) {
        console.error(e);
    }
}
export async function handleEnterFamilyFromNotification(notification) {
    // Proteção contra dados incompletos
    if (!notification || !notification.targetFamilyId) {
        console.log(notification + " " + notification.targetFamilyId)
        showToast("Erro: Convite inválido ou família não encontrada.", 'error');
        // Opcional: Deletar a notificação bugada automaticamente
        if (notification?.id) handleDeleteNotification(notification.id);
        return;
    }

    try {
        await handleSelectFamily(notification.targetFamilyId);
        await deleteDoc(doc(db, "notifications", notification.id));
        state.isNotificationMenuOpen = false;
        renderApp();
        showToast(`Bem-vindo à família ${notification.targetFamilyName}!`, 'success');
    } catch (e) {
        console.error(e);
        showToast("Erro ao acessar a família.", 'error');
    }
}

export async function handleJoinFamilyFromLink(code) {
    const uppercaseCode = code.toUpperCase();
    if (state.family) return false;
    try {
        const q = query(collection(db, "familyGroups"), where("code", "==", uppercaseCode));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) { showToast("Link inválido.", 'error'); return false; }
        
        const familyDoc = querySnapshot.docs[0];
        const familyId = familyDoc.id;
        const familyData = familyDoc.data();
        
        if (familyData.members.includes(state.user.uid)) {
            await handleSelectFamily(familyId);
            showToast(`Você já faz parte da família.`, 'success');
            return true;
        }
        
        await updateDoc(doc(db, "familyGroups", familyId), { members: arrayUnion(state.user.uid) });
        
        // REMOVIDO: notifyAllMembers

        await handleSelectFamily(familyId);
        showToast(`Bem-vindo à "${familyData.name}"!`, 'success');
        return true;
    } catch (e) {
        console.error("Erro link:", e);
        showToast("Erro ao entrar.", 'error');
        return false;
    }
}

export async function handleRejectJoinRequest(notificationId) {
    const notification = state.notifications.find(n => n.id === notificationId);
    if (!notification) { console.error("Notificação não encontrada."); return; }

    try {
        const batch = writeBatch(db);
        
        // 1. Apaga solicitação original
        const notifRef = doc(db, "notifications", notificationId);
        batch.delete(notifRef);

        // 2. Cria notificação de rejeição para o usuário
        const newNotifRef = doc(collection(db, "notifications"));
        batch.set(newNotifRef, {
            recipientId: notification.senderId, // Quem pediu
            senderId: state.user.uid,          // Admin que recusou
            senderName: state.user.name,       // Nome do Admin <--- IMPORTANTE
            targetFamilyName: notification.targetFamilyName,
            type: 'request_rejected',          // Tipo correto
            createdAt: Date.now(),
            read: false
        });

        await batch.commit();
        showToast("Solicitação recusada.", 'info');
    } catch (e) {
        console.error("Erro ao recusar:", e);
        showToast("Erro ao recusar.", 'error');
    }
}

export function toggleNotificationMenu() {
    state.isNotificationMenuOpen = !state.isNotificationMenuOpen;
    renderApp();
}

export async function handleDemoteMember(memberId) {
    try {
        if (memberId === state.user.uid) {
            showToast("Você não pode remover sua própria permissão de admin.", 'error');
            return;
        }
        const familyRef = doc(db, "familyGroups", state.family.id);
        await updateDoc(familyRef, {
            admins: arrayRemove(memberId)
        });
        state.familyAdmins = state.familyAdmins.filter(id => id !== memberId);
        renderApp(); 
        showToast("Permissão de admin removida.", 'success');
    } catch (e) {
        console.error(e);
        showToast("Erro ao remover permissão.", 'error');
    }
}

async function createSystemNotification(type, title, message, metadata = {}) {
    const exists = state.notifications.some(n => 
        n.type === type && 
        n.targetFamilyId === state.family.id &&
        JSON.stringify(n.metadata) === JSON.stringify(metadata)
    );

    if (!exists) {
        try {
            // 1. Salva no Banco (Para aparecer na lista)
            await addDoc(collection(db, "notifications"), {
                recipientId: state.user.uid,
                senderId: "SYSTEM",
                senderName: "GreenHive Alerta",
                targetFamilyId: state.family.id,
                targetFamilyName: state.family.name,
                type: type,
                title: title,
                message: message,
                metadata: metadata,
                createdAt: Date.now(),
                read: false
            });

            // 2. Dispara Notificação Nativa (Se permitido e se a página estiver oculta ou minimizada)
            // Na verdade, mandamos sempre para garantir que ele veja
            if (Notification.permission === "granted") {
                new Notification(`GreenHive: ${title}`, {
                    body: message,
                    icon: 'assets/icon-192.png', // Caminho do seu ícone
                    tag: type // Evita flood de notificações iguais
                });
            }

        } catch (e) {
            console.error("Erro ao criar alerta automático:", e);
        }
    }
}

function checkAutomatedAlerts() {
    if (!state.user || !state.family) return;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const today = new Date();
    const todayDay = today.getDate();
    
    // Calculando datas para alertas de vencimento
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.getDate();

    // --- 1. ALERTA DE SALDO NEGATIVO ---
    const myBalance = state.transactions
        .filter(t => t.userId === state.user.uid)
        .reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);

    const balanceStateKey = `gh_bal_state_${state.user.uid}_${state.family.id}`;
    const lastState = localStorage.getItem(balanceStateKey) || 'positive';

    if (myBalance < 0) {
        if (lastState !== 'negative') {
            createSystemNotification(
                'balance_alert', 
                'Saldo Negativo', 
                `Cuidado! Seu saldo na família "${state.family.name}" está negativo em R$ ${Math.abs(myBalance).toFixed(2)}.`,
                { threshold: 'negative' } 
            );
            localStorage.setItem(balanceStateKey, 'negative');
        }
    } else {
        if (lastState !== 'positive') localStorage.setItem(balanceStateKey, 'positive');
    }

    // --- 2. ALERTAS DE ORÇAMENTO (Despesa e Receita) ---
    state.budgets.forEach(budget => {
        // Filtra transações da categoria deste orçamento no mês atual
        const currentVal = state.transactions
            .filter(t => {
                const tDate = new Date(t.date + 'T12:00:00');
                return t.category === budget.category && 
                       t.type === budget.type && // Verifica se é o mesmo tipo
                       tDate.getMonth() === currentMonth &&
                       tDate.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + t.amount, 0);

        const budgetKey = `gh_budget_alert_${budget.id}_${currentMonth}_${currentYear}`;
        const alreadyAlerted = localStorage.getItem(budgetKey);

        if (budget.type === 'expense') {
            // ORÇAMENTO ESTOURADO
            if (currentVal > budget.value) {
                if (!alreadyAlerted) {
                    createSystemNotification(
                        'budget_alert',
                        'Orçamento Excedido',
                        `Você ultrapassou o limite de "${budget.name}" em R$ ${(currentVal - budget.value).toFixed(2)}.`,
                        { budgetId: budget.id, month: currentMonth, year: currentYear }
                    );
                    localStorage.setItem(budgetKey, 'exceeded');
                }
            } else if (alreadyAlerted === 'exceeded') {
                localStorage.removeItem(budgetKey); // Reset se voltar ao normal
            }
        } else {
            // META DE RECEITA ATINGIDA (Novo!)
            if (currentVal >= budget.value && budget.value > 0) {
                if (alreadyAlerted !== 'achieved') { // Só avisa uma vez
                    createSystemNotification(
                        'goal_alert', // Tipo novo (Verde)
                        'Meta Atingida! 🏆',
                        `Parabéns! Você atingiu sua meta de receita em "${budget.name}".`,
                        { budgetId: budget.id, month: currentMonth, year: currentYear }
                    );
                    localStorage.setItem(budgetKey, 'achieved');
                }
            }
        }
    });

    // --- 3. ALERTAS DE PARCELAMENTO (Amanhã e Hoje) ---
    state.installments.forEach(inst => {
        if (inst.debtorId === state.user.uid) {
            const instKeyPrefix = `gh_inst_alert_${inst.id}_${currentMonth}`;
            
            // Vence Amanhã
            if (inst.dueDay === tomorrowDay) {
                const key = `${instKeyPrefix}_tomorrow`;
                if (!localStorage.getItem(key)) {
                    createSystemNotification(
                        'installment_alert',
                        'Parcela Vence Amanhã',
                        `Prepare-se: O parcelamento "${inst.name}" vence amanhã.`,
                        { installmentId: inst.id, type: 'tomorrow' }
                    );
                    localStorage.setItem(key, 'true');
                }
            }
            
            // Vence HOJE (Novo!)
            if (inst.dueDay === todayDay) {
                const key = `${instKeyPrefix}_today`;
                if (!localStorage.getItem(key)) {
                    createSystemNotification(
                        'installment_due_today', // Tipo novo (Laranja/Urgente)
                        'Vence Hoje!',
                        `O parcelamento "${inst.name}" vence hoje! Já efetuou o pagamento?`,
                        { installmentId: inst.id, type: 'today' }
                    );
                    localStorage.setItem(key, 'true');
                }
            }
        }
    });

    // --- 4. ALERTA DE INATIVIDADE (Novo!) ---
    // Verifica se a última transação do usuário foi há mais de 5 dias
    const userTrans = state.transactions.filter(t => t.userId === state.user.uid);
    if (userTrans.length > 0) {
        // Como a lista já vem ordenada por data (do mais recente pro mais antigo) no listener
        const lastDate = new Date(userTrans[0].date + 'T12:00:00');
        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        if (diffDays >= 5) {
            const inactivityKey = `gh_inactivity_${lastDate.toISOString().split('T')[0]}`; // Chave baseada na data da última
            
            if (!localStorage.getItem(inactivityKey)) {
                createSystemNotification(
                    'inactivity_alert', // Tipo novo (Cinza/Neutro)
                    'Sentimos sua falta!',
                    `Faz ${diffDays} dias que você não registra nada. Mantenha suas contas em dia!`,
                    { lastDate: lastDate.toISOString() }
                );
                localStorage.setItem(inactivityKey, 'true');
            }
        }
    }
}

export async function handleResetPassword(event) {
    event.preventDefault();
    const email = event.target.email.value;

    if (!email) {
        showToast("Por favor, informe seu email.", 'error');
        return;
    }

    try {
        const actionCodeSettings = {
            url: window.location.href,
            handleCodeInApp: false
        };
        await firebase.sendPasswordResetEmail(auth, email, actionCodeSettings);
        state.authView = 'forgot-password-success';
        renderApp();
    } catch (error) {
        let errorMessage = "Erro ao enviar email.";
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = "Email não encontrado.";
                break;
            case 'auth/invalid-email':
                errorMessage = "Email inválido.";
                break;
            default:
                console.error(error);
                errorMessage = error.message;
        }
        showToast(errorMessage, 'error');
    }
}

// --- NOVO: Função para pedir permissão ao navegador ---
export async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        showToast("Este navegador não suporta notificações.", "error");
        return;
    }

    if (Notification.permission === "granted") {
        // showToast("Notificações já estão ativas!", "success"); // Opcional
        return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
        showToast("Notificações ativadas com sucesso!", "success");
        // Teste imediato
        new Notification("GreenHive", { 
            body: "As notificações estão ativas!", 
            icon: 'assets/icon-192.png' 
        });
    }
}

// Função para notificar todos da família (menos quem causou a ação)
// Função Auxiliar: Notifica membros da família
// membersList: Opcional. Se não passar, tenta usar o state.family.members
// excludeIds: Array de IDs que NÃO devem receber a notificação
async function notifyAllMembers(title, message, excludeUserId = null, customTargetList = null) {
    // Se passarmos uma lista específica, usa ela. Se não, tenta usar a do estado atual.
    const targets = customTargetList || (state.family ? state.family.members : []);
    
    if (!targets || targets.length === 0) return;

    const batch = writeBatch(db);
    let count = 0;

    targets.forEach(recipientId => {
        // Não notifica a si mesmo (quem está logado)
        if (recipientId === state.user.uid) return;
        
        // Não notifica quem foi explicitamente excluído (ex: o novato)
        if (recipientId === excludeUserId) return;

        const notifRef = doc(collection(db, "notifications"));
        batch.set(notifRef, {
            recipientId: recipientId,
            senderId: "SYSTEM",
            senderName: "GreenHive",
            targetFamilyId: state.family ? state.family.id : '', 
            type: 'new_member_alert',
            title: title,
            message: message,
            createdAt: Date.now(),
            read: false
        });
        count++;
    });

    if (count > 0) await batch.commit();
}

// --- EXPORTAÇÃO ---
// --- EXPORTAÇÃO EXCEL ESTILIZADA (ExcelJS) ---
export async function handleExportExcel() {
    if (!state.transactions || state.transactions.length === 0) {
        showToast("Não há transações para exportar.", "error");
        return;
    }

    // 1. Cria o Workbook e a Planilha
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório GreenHive');

    // 2. Define as Colunas
    worksheet.columns = [
        { header: 'Data', key: 'date', width: 15 },
        { header: 'Descrição', key: 'desc', width: 30 },
        { header: 'Categoria', key: 'cat', width: 20 },
        { header: 'Tipo', key: 'type', width: 15 },
        { header: 'Valor (R$)', key: 'amount', width: 18 },
        { header: 'Quem', key: 'user', width: 15 },
        { header: 'Família', key: 'family', width: 20 },
    ];

    // 3. Adiciona os Dados
    state.transactions.forEach(t => {
        worksheet.addRow({
            date: new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR'),
            desc: t.description,
            cat: t.category,
            type: t.type === 'income' ? 'Receita' : 'Despesa',
            amount: t.amount, // Passa o número puro para o Excel calcular
            user: t.userName || 'Desconhecido',
            family: state.family.name
        });
    });

    // --- 4. ESTILIZAÇÃO PROFISSIONAL ---

    // Estilo do Cabeçalho (Linha 1)
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 }; // Texto Branco e Negrito
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF10B981' } // Cor Verde Brand (Emerald-500)
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };
    });
    headerRow.height = 30; // Altura do cabeçalho

    // Estilo das Linhas de Dados
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Pula o cabeçalho
            
            // Lógica de cores para o Valor (Coluna 5)
            const typeCell = row.getCell(4).value; // Coluna Tipo
            const amountCell = row.getCell(5);     // Coluna Valor

            if (typeCell === 'Receita') {
                amountCell.font = { color: { argb: 'FF16A34A' } }; // Verde
            } else {
                amountCell.font = { color: { argb: 'FFDC2626' } }; // Vermelho
            }
            amountCell.numFmt = '"R$" #,##0.00'; // Formato de Moeda no Excel

            // Bordas e Alinhamento para todas as células da linha
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFCBD5E1' } }, // Borda cinza suave
                    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
                    bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
                    right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
                };
                // Centraliza Data e Tipo
                if (cell.col === 1 || cell.col === 4) {
                    cell.alignment = { horizontal: 'center' };
                }
            });
        }
    });

    // 5. Gera o Arquivo e Baixa
    const buffer = await workbook.xlsx.writeBuffer();
    
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    const fileName = `Relatório GreenHive - ${dia}-${mes}-${ano}.xlsx`;

    saveAs(new Blob([buffer]), fileName); // Usa o FileSaver.js para baixar
    
    showToast("Relatório estilizado baixado!", "success");
}

// --- EXPORTAÇÃO PDF (jsPDF) ---
export function handleExportPDF() {
    if (!state.transactions || state.transactions.length === 0) {
        showToast("Não há transações para exportar.", "error");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // 1. Cabeçalho do Documento
    // Retângulo Verde (Fundo do Header)
    doc.setFillColor(16, 185, 129); // Cor Emerald-500 (#10b981)
    doc.rect(0, 0, 210, 40, 'F'); // Largura A4 é 210mm

    // Título e Subtítulo
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("GreenHive", 14, 20);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Relatório Financeiro - ${state.family.name}`, 14, 30);

    const hoje = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(10);
    doc.text(`Gerado em: ${hoje}`, 150, 30);

    // 2. Preparar Dados da Tabela
    const tableColumn = ["Data", "Descrição", "Categoria", "Quem", "Valor"];
    const tableRows = [];

    state.transactions.forEach(t => {
        const dateStr = new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR');
        const typeSymbol = t.type === 'income' ? '+' : '-';
        const amountStr = `R$ ${t.amount.toFixed(2)}`;
        
        // Adiciona linha (note que guardamos o tipo 'raw' para colorir depois)
        const rowData = [
            dateStr,
            t.description,
            t.category,
            t.userName || 'N/A',
            typeSymbol + ' ' + amountStr
        ];
        // Hack: Anexamos o tipo original ao array para usar no hook de estilo
        rowData.rawType = t.type; 
        
        tableRows.push(rowData);
    });

    // 3. Gerar a Tabela (AutoTable)
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 50, // Começa abaixo do header verde
        theme: 'grid',
        styles: {
            font: "helvetica",
            fontSize: 10,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [16, 185, 129], // Verde Emerald
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [240, 253, 244] // Verde bem clarinho (zebra)
        },
        // Hook para colorir o valor (Coluna 4 = Índice 4)
        didParseCell: function (data) {
            if (data.section === 'body' && data.column.index === 4) {
                // Recupera o tipo da linha atual
                const originalType = tableRows[data.row.index].rawType;
                if (originalType === 'income') {
                    data.cell.styles.textColor = [22, 163, 74]; // Verde Escuro
                } else {
                    data.cell.styles.textColor = [220, 38, 38]; // Vermelho
                }
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.halign = 'right'; // Alinha números à direita
            }
        }
    });

    // 4. Rodapé e Download
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount}`, 105, 290, null, null, "center");
    }

    doc.save(`GreenHive_Relatorio_${hoje.replace(/\//g, '-')}.pdf`);
    showToast("PDF gerado com sucesso!", "success");
}

async function checkRecurringTransactions(familyId) {
    try {
        const recurringRef = collection(db, "familyGroups", familyId, "recurring");
        const snapshot = await getDocs(recurringRef); // Lê uma vez (não precisa ser realtime)
        
        const batch = writeBatch(db);
        let hasUpdates = false;
        const today = new Date();
        today.setHours(0,0,0,0); // Zera hora para comparar apenas data

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            // Pega a data da última vez que foi processado
            const lastDate = new Date(data.lastProcessedDate + 'T12:00:00');
            
            // Calcula quando deveria ser a PRÓXIMA (mês seguinte)
            let nextDate = new Date(lastDate);
            nextDate.setMonth(nextDate.getMonth() + 1);
            
            // Ajuste fino de dias (ex: 31 de jan -> 28 fev)
            // Se o dia mudou (ex: era 31, virou 02), volta pro último dia do mês correto
            if (nextDate.getDate() !== data.dayOfMonth) {
                 nextDate.setDate(0); 
            }

            // Loop para criar transações pendentes (caso tenha ficado meses sem abrir)
            // Limitamos a 12 meses para evitar loop infinito ou bugs massivos
            let iterations = 0;
            while (nextDate <= today && iterations < 12) {
                hasUpdates = true;
                iterations++;
                
                const isoDate = nextDate.toISOString().split('T')[0];
                
                // Cria a transação nova
                const newTransRef = doc(collection(db, "transactions"));
                batch.set(newTransRef, {
                    description: data.description + " (Recorrente)", // Identificador visual
                    amount: data.amount,
                    category: data.category,
                    type: data.type,
                    date: isoDate,
                    userId: data.userId,
                    userName: data.userName,
                    familyGroupId: familyId,
                    linkedDebtId: data.linkedDebtId || null,
                    linkedInstallmentId: data.linkedInstallmentId || null,
                    isAutoGenerated: true
                });
                
                // Atualiza a data de referência para a próxima volta
                batch.update(docSnap.ref, { lastProcessedDate: isoDate });
                
                // Prepara para a próxima iteração
                lastDate.setTime(nextDate.getTime());
                nextDate.setMonth(nextDate.getMonth() + 1);
                if (nextDate.getDate() !== data.dayOfMonth) nextDate.setDate(0);
            }
        });

        if (hasUpdates) {
            await batch.commit();
            showToast("Transações recorrentes processadas com sucesso.", "info");
        }
    } catch (e) {
        console.error("Erro ao processar recorrências:", e);
    }
}

export function startTutorial() {
    if (!window.driver) return;

    const driver = window.driver.js.driver;

    const tour = driver({
        showProgress: true,
        // Animação suave
        animate: true,
        // Permite clicar fora para fechar (opcional, mas bom pra UX)
        allowClose: true,
        
        // Textos dos botões
        nextBtnText: 'Próximo →',
        prevBtnText: '← Voltar',
        doneBtnText: 'Vamos lá! 🚀',
        
        // Passos
        steps: [
            { element: '#family-info-button', popover: { title: 'Sua Família 🏡', description: 'Aqui você gerencia os membros e pega o código de convite.' } },
            { element: '.nav-tab[data-view="dashboard"]', popover: { title: 'Dashboard 📊', description: 'Visão geral do saldo, receitas e despesas em tempo real.' } },
            { element: '.nav-tab[data-view="records"]', popover: { title: 'Registros 📝', description: 'Adicione suas transações diárias aqui. Use filtros para encontrar gastos antigos.' } },
            { element: '.nav-tab[data-view="budget"]', popover: { title: 'Orçamentos 💰', description: 'Defina limites (teto) para não gastar demais em cada categoria.' } },
            { element: '.nav-tab[data-view="debts"]', popover: { title: 'Dívidas 💳', description: 'Gerencie empréstimos e parcelamentos de cartão de crédito.' } },
            { element: '.nav-tab[data-view="goals"]', popover: { title: 'Metas 🚀', description: 'Crie cofrinhos para guardar dinheiro para seus sonhos.' } },
            { element: '#user-menu-button', popover: { title: 'Seu Perfil 👤', description: 'Mude seu avatar, senha e acesse este tutorial novamente por aqui.' } },
        ],

        // O QUE FAZER AO TERMINAR OU FECHAR
        onDestroyStarted: () => {
            // Se o tour for destruído (clicou em Done ou Close), salvamos que foi visto.
            // O driver.js v1.x não tem callback específico para o botão Done separado do Close na config padrão facilmente,
            // mas o onDestroyStarted roda em ambos os casos, o que é o que queremos.
            localStorage.setItem('greenhive_tutorial_seen', 'true');
            tour.destroy(); // Garante que ele suma da tela
        }
    });

    tour.drive();
}

// Função que verifica se deve rodar o tutorial automaticamente
export function checkAndStartTutorial() {
    // Só roda se estiver no Dashboard e a chave não existir no localStorage
    if (state.currentView === 'dashboard' && !localStorage.getItem('greenhive_tutorial_seen')) {
        // Pequeno delay para garantir que o HTML renderizou
        setTimeout(() => startTutorial(), 1500);
    }
}

// Variável global para controlar o listener da lista de famílias
let userFamiliesUnsubscribe = null;

// ... (código anterior) ...

// NOVA FUNÇÃO: Substitui a 'fetchUserFamilies'
export function subscribeToUserFamilies() {
    if (!state.user?.uid) return;
    
    // Se já tem um listener, limpa antes de criar outro
    if (userFamiliesUnsubscribe) userFamiliesUnsubscribe();

    const q = query(collection(db, "familyGroups"), where("members", "array-contains", state.user.uid));
    
    userFamiliesUnsubscribe = onSnapshot(q, (snapshot) => {
        const families = [];
        snapshot.forEach(d => families.push({ id: d.id, ...d.data() }));
        
        state.userFamilies = families;
        
        // Só atualiza a tela se estivermos na seleção de famílias
        if (state.currentView === 'onboarding' && !state.isModalOpen) {
            renderApp();
        }
    });
}

export function handleOpenExportModal() {
    state.isModalOpen = true;
    state.modalView = 'export';
    state.shouldAnimate = false; // Abre sem piscar o fundo
    renderApp();
}

export function handleExportCSV() {
    if (!state.transactions || state.transactions.length === 0) {
        showToast("Não há transações para exportar.", "error");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    // BOM para Excel ler acentos corretamente
    csvContent += "\uFEFF"; 
    csvContent += "Data,Descrição,Categoria,Tipo,Valor,Quem,Família\n";

    state.transactions.forEach(t => {
        const dateStr = new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR');
        const description = t.description ? `"${t.description.replace(/"/g, '""')}"` : "";
        const amount = t.amount.toString().replace('.', ','); 
        const type = t.type === 'income' ? 'Receita' : 'Despesa';
        const user = t.userName || 'Desconhecido';
        const family = state.family.name;

        const row = [dateStr, description, t.category, type, amount, user, family].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    
    const fileName = `greenhive_relatorio_${state.displayedMonth.getMonth()+1}_${state.displayedMonth.getFullYear()}.csv`;
    link.setAttribute("download", fileName);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    state.isModalOpen = false; // Fecha o modal após clicar
    renderApp();
    showToast("Relatório CSV baixado!", "success");
}