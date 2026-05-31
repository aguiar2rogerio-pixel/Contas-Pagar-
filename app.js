// ==================== CONFIGURAÇÕES E ESTADO ====================
const STORAGE_KEY = 'compromissos_app_state';
const DEFAULT_PEOPLE = ['Casa', 'Daniela', 'Rogério', 'Isabelli', 'Stephanie'];

let currentFilter = 'all';
let currentTab = 'pending';

// ==================== UTILITÁRIOS DE DATA (BRASÍLIA) ====================
function getNowBrasilia() {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const parts = formatter.formatToParts(new Date());
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '2026');
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '1') - 1;
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');
    return new Date(year, month, day);
}

function isCurrentMonth(date) {
    const now = getNowBrasilia();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

function isNextMonth(date) {
    const now = getNowBrasilia();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return date.getMonth() === nextMonth.getMonth() && date.getFullYear() === nextMonth.getFullYear();
}

function isMonthAfterNext(date) {
    const now = getNowBrasilia();
    const monthAfterNext = new Date(now.getFullYear(), now.getMonth() + 2, 1);
    return date.getMonth() === monthAfterNext.getMonth() && date.getFullYear() === monthAfterNext.getFullYear();
}

function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR').format(date);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
}

// ==================== GERENCIAMENTO DE BANCO DE DADOS ====================
function getAppState() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            const defaultState = getDefaultState();
            saveAppState(defaultState);
            return defaultState;
        }
        const state = JSON.parse(stored);
        state.transactions = (state.transactions || []).map(t => ({
            ...t,
            dueDate: new Date(t.dueDate)
        }));
        return state;
    } catch (error) {
        console.error('Erro ao ler estado:', error);
        return getDefaultState();
    }
}

function getDefaultState() {
    return {
        accounts: [],
        people: DEFAULT_PEOPLE.map((name, index) => ({
            id: `person_${index}`,
            name,
            createdAt: Date.now(),
        })),
        transactions: [],
        lastUpdated: Date.now(),
    };
}

function saveAppState(state) {
    try {
        state.lastUpdated = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Erro ao salvar:', error);
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ==================== LOGICA PARCELAS E TOTAIS ====================
function calculateInstallmentDates(totalAmount, installments, closingDay, dueDay, purchaseDate = getNowBrasilia()) {
    const dates = [];
    let currentMonth = purchaseDate.getMonth();
    let currentYear = purchaseDate.getFullYear();

    if (purchaseDate.getDate() > closingDay) {
        currentMonth += 1;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear += 1;
        }
    }

    for (let i = 0; i < installments; i++) {
        dates.push(new Date(currentYear, currentMonth + i, dueDay));
    }
    return dates;
}

function calculateCurrentMonthTotal(transactions) {
    return transactions.filter(t => !t.isPaid && isCurrentMonth(t.dueDate)).reduce((sum, t) => sum + t.amount, 0);
}

function calculateNextMonthTotal(transactions) {
    return transactions.filter(t => !t.isPaid && isNextMonth(t.dueDate)).reduce((sum, t) => sum + t.amount, 0);
}

function calculateMonthAfterNextTotal(transactions) {
    return transactions.filter(t => !t.isPaid && isMonthAfterNext(t.dueDate)).reduce((sum, t) => sum + t.amount, 0);
}

// ==================== OPERAÇÕES DE CADASTROS ====================
function createAccount() {
    const name = document.getElementById('inputAccountName').value.trim();
    const closingDay = parseInt(document.getElementById('inputClosingDay').value);
    const dueDay = parseInt(document.getElementById('inputDueDay').value);

    if (!name || !closingDay || !dueDay) {
        alert('Preencha todas as informações do cartão.');
        return;
    }

    const state = getAppState();
    const newAccount = { id: generateId(), name, closingDay, dueDay, createdAt: Date.now() };
    state.accounts.push(newAccount);
    saveAppState(state);

    document.getElementById('inputAccountName').value = '';
    document.getElementById('inputClosingDay').value = '';
    document.getElementById('inputDueDay').value = '';

    closeModal('modalNewAccount');
    updateUI();
}

function createPerson() {
    const name = document.getElementById('inputPersonName').value.trim();
    if (!name) {
        alert('Digite o nome da pessoa.');
        return;
    }

    const state = getAppState();
    const newPerson = { id: generateId(), name, createdAt: Date.now() };
    state.people.push(newPerson);
    saveAppState(state);

    document.getElementById('inputPersonName').value = '';
    closeModal('modalNewPerson');
    updateUI();
}

function createTransaction() {
    const accountId = document.getElementById('selectAccount').value;
    const description = document.getElementById('inputDescription').value.trim();
    const amount = parseFloat(document.getElementById('inputAmount').value);
    const installments = parseInt(document.getElementById('selectInstallments').value);
    const personId = document.getElementById('selectPerson').value;
    const isRecurring = document.getElementById('checkRecurring').checked;

    if (!accountId || !description || isNaN(amount) || amount <= 0 || !personId) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    const state = getAppState();
    const account = state.accounts.find(a => a.id === accountId);

    const partAmount = parseFloat((amount / installments).toFixed(2));
    const dates = calculateInstallmentDates(amount, installments, account.closingDay, account.dueDay);

    dates.forEach((dueDate, index) => {
        state.transactions.push({
            id: generateId(),
            accountId,
            personId,
            description,
            amount: partAmount,
            installmentNumber: index + 1,
            totalInstallments: installments,
            dueDate,
            isPaid: false,
            isRecurring,
            createdAt: Date.now(),
        });
    });

    saveAppState(state);

    document.getElementById('inputDescription').value = '';
    document.getElementById('inputAmount').value = '';
    document.getElementById('selectInstallments').value = '1';
    document.getElementById('checkRecurring').checked = false;

    closeModal('modalNewTransaction');
    updateUI();
}

function toggleTransactionPayment(id) {
    const state = getAppState();
    const item = state.transactions.find(t => t.id === id);
    if (item) {
        item.isPaid = !item.isPaid;
        saveAppState(state);
        updateUI();
    }
}

// ==================== INTERFACE GRÁFICA CONTROLADORA ====================
function openModal(id) {
    const target = document.getElementById(id);
    if (target) target.style.display = 'flex';
}

function closeModal(id) {
    const target = document.getElementById(id);
    if (target) target.style.display = 'none';
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    if(tab === 'pending') document.getElementById('tabPending').classList.add('active');
    if(tab === 'paid') document.getElementById('tabPaid').classList.add('active');
    if(tab === 'all') document.getElementById('tabAll').classList.add('active');
    updateTransactionList(getAppState());
}

function filterByAccount(id) {
    currentFilter = id;
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === id);
    });
    updateTransactionList(getAppState());
}

function updateUI() {
    const state = getAppState();
    
    // Atualiza Totais
    document.getElementById('totalCurrentMonth').textContent = formatCurrency(calculateCurrentMonthTotal(state.transactions));
    document.getElementById('totalNextMonth').textContent = formatCurrency(calculateNextMonthTotal(state.transactions));
    document.getElementById('totalMonthAfterNext').textContent = formatCurrency(calculateMonthAfterNextTotal(state.transactions));

    // Atualiza Filtros Superiores
    const carousel = document.getElementById('carouselFilters');
    if (carousel) {
        carousel.innerHTML = '';
        const btnAll = document.createElement('button');
        btnAll.className = `filter-btn ${currentFilter === 'all' ? 'active' : ''}`;
        btnAll.dataset.filter = 'all';
        btnAll.textContent = 'Todas';
        btnAll.onclick = () => filterByAccount('all');
        carousel.appendChild(btnAll);

        state.accounts.forEach(acc => {
            const btn = document.createElement('button');
            btn.className = `filter-btn ${currentFilter === acc.id ? 'active' : ''}`;
            btn.dataset.filter = acc.id;
            btn.textContent = acc.name;
            btn.onclick = () => filterByAccount(acc.id);
            carousel.appendChild(btn);
        });
    }

    // Atualiza Seletores nos formulários
    const selAcc = document.getElementById('selectAccount');
    const selPer = document.getElementById('selectPerson');
    
    if (selAcc) {
        selAcc.innerHTML = '<option value="">Escolha o Cartão/Conta</option>';
        state.accounts.forEach(a => selAcc.innerHTML += `<option value="${a.id}">${a.name}</option>`);
    }
    if (selPer) {
        selPer.innerHTML = '<option value="">Escolha a Pessoa</option>';
        state.people.forEach(p => selPer.innerHTML += `<option value="${p.id}">${p.name}</option>`);
    }

    updateTransactionList(state);
}

function updateTransactionList(state) {
    let list = state.transactions || [];

    if (currentFilter !== 'all') list = list.filter(t => t.accountId === currentFilter);
    if (currentTab === 'pending') list = list.filter(t => !t.isPaid);
    if (currentTab === 'paid') list = list.filter(t => t.isPaid);

    list.sort((a, b) => a.dueDate - b.dueDate);

    const box = document.getElementById('transactionList');
    if (!box) return;
    box.innerHTML = '';

    if (list.length === 0) {
        box.innerHTML = '<div class="empty-state">Nenhum lançamento encontrado nesta aba.</div>';
        return;
    }

    list.forEach(t => {
        const p = state.people.find(person => person.id === t.personId);
        const card = document.createElement('div');
        card.className = `transaction-item ${t.isPaid ? 'paid' : ''}`;
        card.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-description">${t.description}</div>
                <div class="transaction-details">${p ? p.name : 'Geral'} • ${formatDate(t.dueDate)} ${t.totalInstallments > 1 ? `(${t.installmentNumber}/${t.totalInstallments})` : ''}</div>
            </div>
            <div class="transaction-amount">${formatCurrency(t.amount)}</div>
            <button class="transaction-btn ${t.isPaid ? 'paid' : 'pay'}" onclick="toggleTransactionPayment('${t.id}')">
                ${t.isPaid ? '✓' : 'Pagar'}
            </button>
        `;
        box.appendChild(card);
    });
}

// ==================== CONFIGURAÇÃO DOS CLIQUES (MOBILE SAFE) ====================
document.addEventListener('DOMContentLoaded', () => {
    updateUI();

    // Cliques do Modal de Lançamentos
    document.getElementById('btnOpenMainModal').addEventListener('click', () => openModal('modalNewTransaction'));
    document.getElementById('btnCloseTxModal').addEventListener('click', () => closeModal('modalNewTransaction'));
    document.getElementById('btnSubmitTransaction').addEventListener('click', createTransaction);

    // Cliques de Cartões
    document.getElementById('btnOpenAccModal').addEventListener('click', () => openModal('modalNewAccount'));
    document.getElementById('btnCloseAccModal').addEventListener('click', () => closeModal('modalNewAccount'));
    document.getElementById('btnSubmitAccount').addEventListener('click', createAccount);

    // Cliques de Pessoas
    document.getElementById('btnOpenPerModal').addEventListener('click', () => openModal('modalNewPerson'));
    document.getElementById('btnClosePerModal').addEventListener('click', () => closeModal('modalNewPerson'));
    document.getElementById('btnSubmitPerson').addEventListener('click', createPerson);

    // Backup e Limpeza
    document.getElementById('btnBackup').addEventListener('click', () => {
        const txt = JSON.stringify(getAppState(), null, 2);
        const a = document.createElement('a');
        a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt));
        a.setAttribute('download', `compromissos_backup_${new Date().toISOString().split('T')[0]}.txt`);
        a.click();
    });

    document.getElementById('btnRestore').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.onchange = (e) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const parsed = JSON.parse(ev.target.result);
                    parsed.transactions = parsed.transactions.map(t => ({...t, dueDate: new Date(t.dueDate)}));
                    saveAppState(parsed);
                    updateUI();
                    alert('Dados restaurados com sucesso!');
                } catch(err) { alert('Arquivo inválido.'); }
            };
            reader.readAsText(e.target.files[0]);
        };
        input.click();
    });

    document.getElementById('btnClear').addEventListener('click', () => {
        if (confirm('Deseja apagar os lançamentos? Cartões e pessoas continuam salvos.')) {
            const state = getAppState();
            state.transactions = [];
            saveAppState(state);
            updateUI();
        }
    });
});
