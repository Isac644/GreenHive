// state-and-handlers.js
// state-and-handlers.js
import { firebase, db, auth, googleProvider } from "./firebase-config.js";
import { renderApp, showToast } from "./main.js";
// ADICIONE 'arrayRemove' NA LINHA ABAIXO:
import { getFirestore, collection, addDoc, getDocs, doc, query, where, updateDoc, arrayUnion, arrayRemove, getDoc, deleteDoc, writeBatch, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { 
    updateProfile, 
    updatePassword, 
    EmailAuthProvider, 
    reauthenticateWithCredential 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
export const state = {
    // ... (mantenha os outros estados: user, family, transactions, etc...)
    user: null,
    family: null,
    userFamilies: [],
    transactions: [],
    budgets: [],
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
    modalView: '',
    modalTransactionType: 'expense',
    confirmingDelete: false, // Esse é o antigo inline, pode manter por enquanto
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
    // NOVO: Estado do Modal de Confirmação Global
    confirmationModal: {
        isOpen: false,
        title: '',
        message: '',
        type: 'danger', // 'danger' ou 'info'
        onConfirm: null // Aqui guardaremos a função a ser executada
    },
    familyUnsubscribe: null // Guarda a função para parar de ouvir a família
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

export function subscribeToNotifications() {
    if (!state.user) return;
    
    const q = query(
        collection(db, "notifications"), 
        where("recipientId", "==", state.user.uid)
    );

    // Escuta mudanças em tempo real
    return onSnapshot(q, (snapshot) => {
        const notifs = [];
        snapshot.forEach(doc => {
            notifs.push({ id: doc.id, ...doc.data() });
        });
        // Ordena por data (mais recente primeiro)
        state.notifications = notifs.sort((a, b) => b.createdAt - a.createdAt);
        renderApp(); // Atualiza a UI (bolinha vermelha)
    });
}

// --- LÓGICA / HANDLERS ---
export async function handleLogin(event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
    
    try {
        const userCredential = await firebase.signInWithEmailAndPassword(auth, email, password);
        
        // NOVO: Verificação de Email
        if (!userCredential.user.emailVerified) {
            // Se não verificado, desloga imediatamente
            await firebase.signOut(auth);
            showToast("Seu email ainda não foi verificado. Verifique sua caixa de entrada.", 'error');
            return;
        }

        // Se chegou aqui, o login ocorre naturalmente pelo onAuthStateChanged no main.js

    } catch (error) {
        let errorMessage = "Ocorreu um erro desconhecido. Tente novamente.";
        
        console.log(error.code);
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
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
    
    state.isSigningUp = true; 

    try {
        const userCredential = await firebase.createUserWithEmailAndPassword(auth, email, password);
        await firebase.updateProfile(userCredential.user, { displayName: name });

        // NOVO: Salvar dados no Firestore para outros membros verem
        await setDoc(doc(db, "users", userCredential.user.uid), {
            name: name,
            email: email,
            photoURL: null
        });

        const actionCodeSettings = {
            url: window.location.href,
            handleCodeInApp: false
        };

        await firebase.sendEmailVerification(userCredential.user, actionCodeSettings);
        await firebase.signOut(auth);

        state.isSigningUp = false; 
        state.authView = 'signup-success'; 
        renderApp();

    } catch (error) {
        state.isSigningUp = false;
        let errorMessage = "Ocorreu um erro desconhecido.";
        switch (error.code) {
            case 'auth/email-already-in-use': errorMessage = "Este email já está cadastrado."; break;
            case 'auth/invalid-email': errorMessage = "O formato do email é inválido."; break;
            case 'auth/weak-password': errorMessage = "A senha deve ter pelo menos 6 caracteres."; break;
            default: errorMessage = error.message; break;
        }
        showToast("Falha no cadastro: " + errorMessage, 'error');
    }
}

export async function handleGoogleLogin() {
    try {
        const result = await firebase.signInWithPopup(auth, googleProvider);
        const user = result.user;

        // NOVO: Sincronizar usuário Google com Firestore
        // setDoc com { merge: true } atualiza ou cria se não existir, sem apagar outros campos
        await setDoc(doc(db, "users", user.uid), {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL
        }, { merge: true });

    } catch (error) {
        console.error("Erro no login com Google:", error);
        showToast("Não foi possível fazer o login com o Google.", 'error');
    }
}

export async function handleLogout() {
    if (state.familyUnsubscribe) state.familyUnsubscribe(); // <--- PARA DE OUVIR
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
    if (state.familyUnsubscribe) state.familyUnsubscribe(); // <--- PARA DE OUVIR
    state.familyUnsubscribe = null;

    state.family = null;
    state.transactions = [];
    state.budgets = [];
    state.userCategories = { expense: [], income: [] };
    state.categoryColors = {};
    state.familyAdmins = [];
    state.familyMembers = [];
    state.currentView = 'onboarding'; 
    state.isModalOpen = false;
    
    fetchUserFamilies().then(families => {
        state.userFamilies = families;
        renderApp();
    });
    
    showToast("Você saiu da visualização da família.", 'success');
}

// ATUALIZADA: handleJoinFamily com verificação explícita
export async function handleJoinFamily(event) {
    event.preventDefault();
    const code = event.target.inviteCode.value.toUpperCase().trim();
    if (!code) return;

    state.joinRequestMessage = ''; 
    renderApp(); 

    try {
        const qFamily = firebase.query(firebase.collection(db, "familyGroups"), firebase.where("code", "==", code));
        const querySnapshot = await firebase.getDocs(qFamily);
        
        // AVISO 1: Código não existe
        if (querySnapshot.empty) {
            showToast("Família não encontrada com esse código.", 'error');
            state.joinRequestMessage = "Código inválido.";
            renderApp();
            return;
        }

        const familyDoc = querySnapshot.docs[0];
        const familyData = familyDoc.data();
        const familyId = familyDoc.id;

        // AVISO 2: Usuário já está na família (O aviso que você pediu)
        if (familyData.members.includes(state.user.uid)) {
            showToast(`Você já faz parte da família "${familyData.name}"!`, 'info');
            state.joinRequestMessage = `Você já é membro da família ${familyData.name}.`;
            renderApp();
            return;
        }

        // ... (Resto da função de verificação de pendência e envio igual à anterior) ...
        const qExisting = firebase.query(
            firebase.collection(db, "notifications"),
            firebase.where("senderId", "==", state.user.uid),
            firebase.where("targetFamilyId", "==", familyId),
            where("type", "==", "join_request")
        );
        
        const existingDocs = await firebase.getDocs(qExisting);
        if (!existingDocs.empty) {
            state.joinRequestMessage = 'Solicitação pendente. Aguarde aprovação do admin.';
            renderApp();
            return;
        }

        const batch = firebase.writeBatch(db);
        familyData.admins.forEach(adminId => {
            const notifRef = firebase.doc(firebase.collection(db, "notifications"));
            batch.set(notifRef, {
                recipientId: adminId,
                senderId: state.user.uid,
                senderName: state.user.name,
                targetFamilyId: familyId,
                targetFamilyName: familyData.name,
                type: 'join_request',
                createdAt: Date.now(),
                read: false
            });
        });

        await batch.commit();
        state.joinRequestMessage = `Solicitação enviada para "${familyData.name}". Aguarde.`;
        renderApp();
        showToast("Solicitação enviada!", 'success');

    } catch (e) {
        showToast("Erro ao processar solicitação.", 'error');
        console.error(e);
    }
}

export async function handleAcceptJoinRequest(notification) {
    try {
        const batch = firebase.writeBatch(db);
        const familyRef = firebase.doc(db, "familyGroups", notification.targetFamilyId);
        
        // 1. Adiciona o usuário na família
        batch.update(familyRef, { 
            members: firebase.arrayUnion(notification.senderId) 
        });

        // 2. Apaga a notificação do Admin (a solicitação)
        const notifRef = firebase.doc(db, "notifications", notification.id);
        batch.delete(notifRef);
        
        // 3. Cria notificação para o Usuário (Aceito)
        const newNotifRef = firebase.doc(firebase.collection(db, "notifications"));
        batch.set(newNotifRef, {
            recipientId: notification.senderId, // Manda de volta para quem pediu
            senderId: state.user.uid, // Admin que aceitou
            targetFamilyId: notification.targetFamilyId,
            targetFamilyName: notification.targetFamilyName,
            type: 'request_accepted', // Novo tipo
            createdAt: Date.now(),
            read: false
        });

        // Limpa notificações duplicadas de outros admins (opcional, mas recomendado)
        const qOthers = firebase.query(
            firebase.collection(db, "notifications"),
            firebase.where("senderId", "==", notification.senderId),
            firebase.where("targetFamilyId", "==", notification.targetFamilyId),
            firebase.where("type", "==", "join_request")
        );
        const otherDocs = await firebase.getDocs(qOthers);
        otherDocs.forEach(d => {
            if (d.id !== notification.id) batch.delete(d.ref);
        });

        await batch.commit();

        showToast(`${notification.senderName} foi adicionado à família!`, 'success');
        
        // Se o admin estiver na tela dessa família, recarrega
        if (state.family && state.family.id === notification.targetFamilyId) {
            loadFamilyData(notification.targetFamilyId);
        }

    } catch (e) {
        console.error(e);
        showToast("Erro ao aceitar solicitação.", 'error');
    }
}

export async function handleRejectJoinRequest(notification) {
    try {
        const batch = firebase.writeBatch(db);
        
        // 1. Apaga a solicitação
        const notifRef = firebase.doc(db, "notifications", notification.id);
        batch.delete(notifRef);

        // 2. Cria notificação para o Usuário (Recusado)
        const newNotifRef = firebase.doc(firebase.collection(db, "notifications"));
        batch.set(newNotifRef, {
            recipientId: notification.senderId,
            senderId: state.user.uid,
            targetFamilyName: notification.targetFamilyName,
            type: 'request_rejected', // Novo tipo
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

export async function handleDeleteNotification(notificationId) {
    try {
        await deleteDoc(doc(db, "notifications", notificationId));
    } catch (e) {
        console.error(e);
    }
}

// NOVA FUNÇÃO: Entrar na família via notificação
export async function handleEnterFamilyFromNotification(notification) {
    try {
        // 1. Seleciona a família
        await handleSelectFamily(notification.targetFamilyId);
        
        // 2. Apaga a notificação após usar
        await firebase.deleteDoc(firebase.doc(db, "notifications", notification.id));
        
        // 3. Fecha o menu
        state.isNotificationMenuOpen = false;
        renderApp();
        
        showToast(`Bem-vindo à família ${notification.targetFamilyName}!`, 'success');
    } catch (e) {
        console.error(e);
        showToast("Erro ao acessar a família. Ela pode ter sido excluída.", 'error');
    }
}

export function toggleNotificationMenu() {
    state.isNotificationMenuOpen = !state.isNotificationMenuOpen;
    renderApp();
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
    await loadFamilyData(familyId); // Carrega os dados iniciais (Transações, etc)
    
    if (state.family) {
        subscribeToFamily(familyId); // <--- LIGA O MONITORAMENTO EM TEMPO REAL
        state.currentView = 'dashboard';
        renderApp();
    }
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

export async function handleResetPassword(event) {
    event.preventDefault();
    const email = event.target.email.value;

    if (!email) {
        showToast("Por favor, informe seu email.", 'error');
        return;
    }

    try {
        // Configura para redirecionar de volta para o app após redefinir (opcional, mas bom UX)
        const actionCodeSettings = {
            url: window.location.href,
            handleCodeInApp: false
        };

        await firebase.sendPasswordResetEmail(auth, email, actionCodeSettings);

        // Muda para a tela de sucesso
        state.authView = 'forgot-password-success';
        renderApp();

    } catch (error) {
        let errorMessage = "Erro ao enviar email.";
        switch (error.code) {
            case 'auth/user-not-found':
                // Por segurança, alguns sistemas não avisam que o email não existe.
                // Mas para facilitar, vamos avisar ou mostrar sucesso genérico.
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
        
        // Hack visual para alternar de volta para texto
        document.getElementById('family-name-display').classList.remove('hidden');
        document.getElementById('family-name-edit').classList.add('hidden');
        document.getElementById('family-name-text').textContent = newName;
        renderApp(); // Para atualizar o header também
    } catch (e) {
        console.error(e);
        showToast("Erro ao atualizar nome.", 'error');
    }
}

// (ADMIN) Gerar Novo Código
export async function handleRegenerateCode() {
    try {
        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const familyRef = firebase.doc(db, "familyGroups", state.family.id);
        
        await firebase.updateDoc(familyRef, { code: newCode });
        
        state.family.code = newCode;
        showToast("Novo código de convite gerado!", 'success');
        renderApp(); // Atualiza a UI onde o código aparece
    } catch (e) {
        console.error(e);
        showToast("Erro ao gerar código.", 'error');
    }
}// state-and-handlers.js

// ... (imports existentes)

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
        `Tem certeza que deseja remover <strong>${memberName}</strong> da família?`,
        async () => {
            try {
                const familyRef = firebase.doc(db, "familyGroups", state.family.id);
                await updateDoc(familyRef, {
                    members: arrayRemove(memberId),
                    admins: arrayRemove(memberId)
                });
                
                state.familyMembers = state.familyMembers.filter(m => m.uid !== memberId);
                state.familyAdmins = state.familyAdmins.filter(id => id !== memberId);
                
                // Não precisa chamar renderApp aqui pois o closeConfirmation chama depois
                showToast(`${memberName} foi removido da família.`, 'success');
            } catch (e) {
                console.error(e);
                showToast("Erro ao remover membro.", 'error');
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

export function handleLeaveFamily() {
    openConfirmation(
        "Sair da Família",
        "Tem certeza que deseja sair? Você perderá acesso aos dados e precisará de um novo convite para entrar novamente.",
        async () => {
            const familyId = state.family.id;
            const userId = state.user.uid;
            const familyRef = firebase.doc(db, "familyGroups", familyId);

            try {
                const familyDoc = await firebase.getDoc(familyRef);
                const familyData = familyDoc.data();
                const admins = familyData.admins;
                const members = familyData.members;

                if (members.length === 1) {
                    // Se for o único, deleta tudo (Reutiliza lógica interna ou manual)
                    // Aqui faremos manual para evitar abrir outro modal
                    const batch = firebase.writeBatch(db);
                    const transQuery = firebase.query(firebase.collection(db, "transactions"), firebase.where("familyGroupId", "==", familyId));
                    const transDocs = await firebase.getDocs(transQuery);
                    transDocs.forEach(doc => batch.delete(doc.ref));
                    batch.delete(familyRef);
                    await batch.commit();
                } else if (admins.includes(userId) && admins.length === 1) {
                    // Admin único saindo: Passa o bastão
                    const otherMembers = members.filter(m => m !== userId);
                    let nextAdminId = otherMembers[0]; // Simplificado
                    
                    await updateDoc(familyRef, {
                        members: arrayRemove(userId),
                        admins: arrayUnion(nextAdminId) 
                    });
                    await updateDoc(familyRef, { admins: arrayRemove(userId) });
                    showToast("Você saiu. A administração foi passada adiante.", 'success');
                } else {
                    // Saída comum
                    await updateDoc(familyRef, {
                        members: arrayRemove(userId),
                        admins: arrayRemove(userId)
                    });
                    showToast("Você saiu da família.", 'success');
                }

                state.family = null;
                state.transactions = [];
                state.currentView = 'onboarding';
                state.userFamilies = await fetchUserFamilies();
                state.isModalOpen = false; 
            } catch (e) {
                console.error(e);
                showToast("Erro ao sair da família.", 'error');
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

function forceExitFamily(message) {
    if (state.familyUnsubscribe) state.familyUnsubscribe();
    state.familyUnsubscribe = null;
    
    state.family = null;
    state.transactions = [];
    state.budgets = [];
    state.currentView = 'onboarding';
    state.isModalOpen = false;
    
    // Busca as famílias novamente para atualizar a lista (caso tenha sido removido de uma)
    fetchUserFamilies().then(families => {
        state.userFamilies = families;
        renderApp();
        showToast(message, 'error'); // Toast vermelho de aviso
    });
}

export function subscribeToFamily(familyId) {
    // Se já estiver ouvindo outra, cancela a anterior
    if (state.familyUnsubscribe) state.familyUnsubscribe();

    const familyRef = doc(db, "familyGroups", familyId);

    // Inicia o listener
    state.familyUnsubscribe = onSnapshot(familyRef, async (snapshot) => {
        // CENÁRIO 1: Família Excluída (Documento deixou de existir)
        if (!snapshot.exists()) {
            forceExitFamily("A família que você estava acessando foi excluída.");
            return;
        }

        const data = snapshot.data();

        // CENÁRIO 2: Usuário Removido (Seu ID não está mais na lista de membros)
        if (!data.members.includes(state.user.uid)) {
            forceExitFamily("Você foi removido desta família.");
            return;
        }

        // CENÁRIO 3: Atualização Normal (Nome mudou, código mudou, novo membro entrou)
        // Só atualizamos o estado se o usuário ainda estiver logado nessa família
        if (state.family && state.family.id === familyId) {
            state.family = { id: familyId, ...data };
            state.familyAdmins = data.admins || [];
            
            // Se a lista de membros mudou de tamanho, recarregamos os dados dos membros
            // para pegar nome/foto dos novos integrantes
            if (state.familyMembers.length !== data.members.length) {
                const memberPromises = data.members.map(uid => getDoc(doc(db, "users", uid)));
                const memberDocs = await Promise.all(memberPromises);
                state.familyMembers = memberDocs.map(d => ({ uid: d.id, ...d.data() }));
            }

            renderApp(); // Atualiza a tela em tempo real (ex: novo nome da família aparece na hora)
        }
    });
}