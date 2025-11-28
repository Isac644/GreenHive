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
    // Listener global de notificações
    const unsub = onSnapshot(q, (snapshot) => {
        const notifs = [];
        snapshot.forEach(doc => { notifs.push({ id: doc.id, ...doc.data() }); });
        state.notifications = notifs.sort((a, b) => b.createdAt - a.createdAt);
        renderApp();
    });
    // Adiciona ao array de unsubscribers para limpar no logout
    // (Obs: Notifications é especial, geralmente queremos manter enquanto logado, 
    // mas vamos gerenciar junto com o resto por simplicidade ou separar se preferir)
    // Aqui vamos deixar separado pois é ligado ao User, não à Família.
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
    const unsubFamily = onSnapshot(familyRef, async (snapshot) => {
        if (!snapshot.exists()) {
            state.isLoading = false; 
            forceExitFamily("A família que você estava acessando foi excluída.");
            return;
        }
        const data = snapshot.data();
        if (!data.members.includes(state.user.uid)) {
            state.isLoading = false;
            forceExitFamily("Você foi removido desta família.");
            return;
        }
        state.family = { id: familyId, ...data };
        state.userCategories = data.userCategories || { expense: [], income: [] };
        state.categoryColors = data.categoryColors || {};
        state.categoryIcons = data.categoryIcons || {}; // Carrega ícones
        state.familyAdmins = data.admins || [];

        if (state.familyMembers.length !== data.members.length) {
            const memberPromises = data.members.map(uid => getDoc(doc(db, "users", uid)));
            const memberDocs = await Promise.all(memberPromises);
            state.familyMembers = memberDocs.map(d => ({ uid: d.id, ...d.data() }));
        }
        
        state.isLoading = false;
        renderApp();
        state.shouldAnimate = false;
        checkAutomatedAlerts();
    });
    state.unsubscribers.push(unsubFamily);

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
}

// --- HANDLERS ---

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
    localStorage.removeItem('greenhive_last_family');
    await firebase.signOut(auth);
}

// As funções de escrita (add/update/delete) NÃO precisam mais manipular o state.
// Elas apenas escrevem no banco. O listener (onSnapshot) vai ver a mudança e atualizar o state automaticamente.
// Isso simplifica muito o código e garante que o que está na tela é o que está no banco.

export async function handleAddTransaction(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const description = formData.get('description'); const amount = parseFloat(formData.get('amount')); const date = formData.get('date'); const category = formData.get('category'); const type = state.modalTransactionType; const linkedEntity = formData.get('linkedEntity'); 
    if (!description || !amount || !date || !category || category === '--create-new--') { showToast('Preencha todos os campos.', 'error'); return; }
    let linkedDebtId = null; let linkedInstallmentId = null;
    if (linkedEntity) { const [entityType, entityId] = linkedEntity.split(':'); if (entityType === 'debt') linkedDebtId = entityId; if (entityType === 'installment') linkedInstallmentId = entityId; }
    const newTransaction = { description, amount, date, category, type, userId: state.user.uid, userName: state.user.name, familyGroupId: state.family.id, linkedDebtId, linkedInstallmentId };
    try { await addDoc(collection(db, "transactions"), newTransaction); state.isModalOpen = false; renderApp(); } catch (e) { showToast("Erro ao adicionar.", 'error'); }
}

export async function handleUpdateTransaction(event) {
    event.preventDefault();
    const formData = new FormData(event.target); const transactionId = state.editingTransactionId; const linkedEntity = formData.get('linkedEntity');
    let linkedDebtId = null; let linkedInstallmentId = null;
    if (linkedEntity) { const [entityType, entityId] = linkedEntity.split(':'); if (entityType === 'debt') linkedDebtId = entityId; if (entityType === 'installment') linkedInstallmentId = entityId; }
    const updatedData = { description: formData.get('description'), amount: parseFloat(formData.get('amount')), date: formData.get('date'), category: formData.get('category'), linkedDebtId, linkedInstallmentId };
    try { await updateDoc(doc(db, "transactions", transactionId), updatedData); state.editingTransactionId = null; state.isModalOpen = false; renderApp(); showToast("Transação atualizada!", 'success'); } catch (e) { showToast("Erro ao atualizar.", 'error'); }
}

export async function handleDeleteTransaction() {
    const transactionId = state.editingTransactionId; if (!transactionId) return;
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
        const result = await firebase.signInWithPopup(auth, googleProvider);
        const user = result.user;
        await setDoc(doc(db, "users", user.uid), { name: user.displayName, email: user.email, photoURL: user.photoURL }, { merge: true });
    } catch (error) { showToast("Erro no login com Google.", 'error'); }
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

export async function handleAcceptJoinRequest(notification) {
    try {
        const batch = writeBatch(db);
        const familyRef = doc(db, "familyGroups", notification.targetFamilyId);
        
        // Adiciona membro
        batch.update(familyRef, { members: arrayUnion(notification.senderId) });
        
        // Apaga solicitação
        const notifRef = doc(db, "notifications", notification.id);
        batch.delete(notifRef);
        
        // Avisa o usuário que foi aceito
        const newNotifRef = doc(collection(db, "notifications"));
        batch.set(newNotifRef, {
            recipientId: notification.senderId,
            senderId: state.user.uid,
            targetFamilyId: notification.targetFamilyId,
            targetFamilyName: notification.targetFamilyName,
            type: 'request_accepted',
            createdAt: Date.now(),
            read: false
        });

        // Limpa duplicatas
        const qOthers = query(collection(db, "notifications"), where("senderId", "==", notification.senderId), where("targetFamilyId", "==", notification.targetFamilyId), where("type", "==", "join_request"));
        const otherDocs = await getDocs(qOthers);
        otherDocs.forEach(d => { if (d.id !== notification.id) batch.delete(d.ref); });

        await batch.commit();
        
        // --- NOVO: NOTIFICA A FAMÍLIA ---
        // Como o estado local ainda não atualizou, usamos os dados que temos
        // Mas idealmente, chamamos a função auxiliar passando o ID de quem entrou para excluir ele do aviso
        // Nota: Aqui usamos uma lógica direta pois o state.family pode não estar sincronizado na visão do admin para pegar a lista atualizada instantaneamente.
        // Vamos notificar usando a lista atual do state (que são os membros ANTES desse novo entrar), o que é perfeito.
        notifyAllMembers(
            "Novo Membro! 👋", 
            `${notification.senderName} acabou de entrar na família. Dê as boas-vindas!`, 
            state.user.uid // Não avisa o Admin que acabou de clicar no botão
        );

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
    try {
        await handleSelectFamily(notification.targetFamilyId);
        await firebase.deleteDoc(firebase.doc(db, "notifications", notification.id));
        state.isNotificationMenuOpen = false;
        renderApp();
        showToast(`Bem-vindo à família ${notification.targetFamilyName}!`, 'success');
    } catch (e) {
        console.error(e);
        showToast("Erro ao acessar a família. Ela pode ter sido excluída.", 'error');
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
        
        // Carrega a família para ter o state.family preenchido
        await handleSelectFamily(familyId);
        
        // --- NOVO: NOTIFICA A FAMÍLIA ---
        // Agora que state.family está carregado, podemos avisar os outros
        notifyAllMembers(
            "Novo Membro! 👋", 
            `${state.user.name} entrou na família através do link.`, 
            state.user.uid // Não avisa a si mesmo
        );

        showToast(`Bem-vindo à "${familyData.name}"!`, 'success');
        return true;
    } catch (e) {
        console.error("Erro link:", e);
        showToast("Erro ao entrar.", 'error');
        return false;
    }
}

export async function handleRejectJoinRequest(notification) {
    try {
        const batch = firebase.writeBatch(db);
        const notifRef = firebase.doc(db, "notifications", notification.id);
        batch.delete(notifRef);
        const newNotifRef = firebase.doc(firebase.collection(db, "notifications"));
        batch.set(newNotifRef, {
            recipientId: notification.senderId,
            senderId: state.user.uid,
            targetFamilyName: notification.targetFamilyName,
            type: 'request_rejected',
            createdAt: Date.now(),
            read: false
        });
        await batch.commit();
        showToast("Solicitação recusada.", 'info');
    } catch (e) {
        console.error(e);
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
async function notifyAllMembers(title, message, excludeUserId = null) {
    if (!state.family) return;
    
    const batch = writeBatch(db);
    const membersToNotify = state.family.members.filter(uid => uid !== excludeUserId);

    membersToNotify.forEach(recipientId => {
        const notifRef = doc(collection(db, "notifications"));
        batch.set(notifRef, {
            recipientId: recipientId,
            senderId: "SYSTEM",
            senderName: "GreenHive",
            targetFamilyId: state.family.id,
            type: 'new_member_alert', // Tipo novo
            title: title,
            message: message,
            createdAt: Date.now(),
            read: false
        });
    });

    await batch.commit();
}