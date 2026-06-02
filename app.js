/**
 * Compromissos App - PWA em JavaScript Puro
 * Gerenciamento de compromissos e contas a pagar com fuso horário de Brasília
 */

// ==================== CONFIGURAÇÕES ====================
const STORAGE_KEY = 'compromissos_app_state';
const DEFAULT_PEOPLE = ['Casa', 'Daniela', 'Rogério', 'Isabelli', 'Stephanie'];

// ==================== UTILITÁRIOS DE DATA ====================

/**
 * Obtém a data atual no fuso horário de Brasília
 */
function getNowBrasilia() {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    const parts = formatter.formatToParts(new Date());
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '2024');
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '1') - 1;
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');

    return new Date(year, month, day);
}

/**
 * Verifica se uma data está no mês atual
 */
function isCurrentMonth(date) {
    const now = getNowBrasilia();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

/**
 * Verifica se uma data está no próximo mês
 */
function isNextMonth(date) {
    const now = getNowBrasilia();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return date.getMonth() === nextMonth.getMonth() && date.getFullYear() === nextMonth.getFullYear();
}

/**
 * Verifica se uma data está no mês após o próximo
 */
function isMonthAfterNext(date) {
    const now = getNowBrasilia();
    const monthAfterNext = new Date(now.getFullYear(), now.getMonth() + 2, 1);
    return date.getMonth() === monthAfterNext.getMonth() && date.getFullYear() === monthAfterNext.getFullYear();
}

/**
 * Formata data para exibição (DD/MM/YYYY)
 */
function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR').format(date);
}

/**
 * Formata moeda para exibição
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(amount);
}

// ==================== GERENCIAMENTO DE DADOS ====================

/**
 * Obtém o estado da aplicação do LocalStorage
 */
function getAppState() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            const defaultState = getDefaultState();
            saveAppState(defaultState);
            return defaultState;
        }
        const state = JSON.parse(stored);
        // Converte datas de string para Date
        state.transactions = state.transactions.map(t => ({
            ...t,
            dueDate: new Date(t.dueDate)
        }));
        return state;
    } catch (error) {
        console.error('Erro ao ler estado:', error);
        return getDefaultState();
    }
}

/**
 * Obtém o estado padrão
 */
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

/**
 * Salva o estado da aplicação no LocalStorage
 */
function saveAppState(state) {
    try {
        state.lastUpdated = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Erro ao salvar estado:', error);
        alert('Erro ao salvar dados. Verifique o espaço disponível.');
    }
}

/**
 * Gera um ID único
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ==================== LÓGICA DE PARCELAMENTO ====================

/**
 * Calcula as datas de vencimento das parcelas
 */
function calculateInstallmentDates(totalAmount, installments, closingDay, dueDay, purchaseDate = getNowBrasilia()) {
    const dates = [];
    let currentMonth = purchaseDate.getMonth();
    let currentYear = purchaseDate.getFullYear();

    // Se a compra é após o dia de fechamento, vai para o próximo ciclo
    if (purchaseDate.getDate() > closingDay) {
        currentMonth += 1;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear += 1;
        }
    }

    // Gera datas para cada parcela
    for (let i = 0; i < installments; i++) {
        const dueDate = new Date(currentYear, currentMonth + i, dueDay);
        dates.push(dueDate);
    }

    return dates;
}

/**
 * Calcula o valor de cada parcela
 */
function calculateInstallmentAmount(totalAmount, installments) {
    return parseFloat((totalAmount / installments).toFixed(2));
}

// ==================== CÁLCULOS DE TOTAIS ====================

/**
 * Calcula o total do mês atual
 */
function calculateCurrentMonthTotal(transactions) {
    return transactions
        .filter(t => !t.isPaid && isCurrentMonth(t.dueDate))
        .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calcula o total do próximo mês
 */
function calculateNextMonthTotal(transactions) {
    return transactions
        .filter(t => isNextMonth(t.dueDate))
        .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calcula o total do mês após o próximo
 */
function calculateMonthAfterNextTotal(transactions) {
    return transactions
        .filter(t => isMonthAfterNext(t.dueDate))
        .reduce((sum, t) => sum + t.amount, 0);
}

// ==================== OPERAÇÕES COM DADOS ====================

/**
 * Cria uma nova conta
 */
function createAccount() {
    const name = document.getElementById('inputAccountName').value.trim();
    const closingDay = parseInt(document.getElementById('inputClosingDay').value);
    const dueDay = parseInt(document.getElementById('inputDueDay').value);

    if (!name) {
        alert('Nome da conta é obrigatório');
        return;
    }

    if (!closingDay || !dueDay) {
        alert('Dias de fechamento e vencimento são obrigatórios');
        return;
    }

    const state = getAppState();
    const newAccount = {
        id: generateId(),
        name,
        closingDay,
        dueDay,
        createdAt: Date.now(),
    };

    state.accounts.push(newAccount);
    saveAppState(state);

    // Limpa o formulário
    document.getElementById('inputAccountName').value = '';
    document.getElementById('inputClosingDay').value = '';
    document.getElementById('inputDueDay').value = '';

    closeModal('modalNewAccount');
    updateUI();
    alert('Conta criada com sucesso!');
}

/**
 * Cria uma nova pessoa
 */
function createPerson() {
    const name = document.getElementById('inputPersonName').value.trim();

    if (!name) {
        alert('Nome da pessoa é obrigatório');
        return;
    }

    const state = getAppState();
    const newPerson = {
        id: generateId(),
        name,
        createdAt: Date.now(),
    };

    state.people.push(newPerson);
    saveAppState(state);

    document.getElementById('inputPersonName').value = '';
    closeModal('modalNewPerson');
    updateUI();
    alert('Pessoa adicionada com sucesso!');
}

/**
 * Cria uma nova transação com parcelamento automático
 */
function createTransaction() {
    const accountId = document.getElementById('selectAccount').value;
    const description = document.getElementById('inputDescription').value.trim();
    const amount = parseFloat(document.getElementById('inputAmount').value);
    const installments = parseInt(document.getElementById('selectInstallments').value);
    const personId = document.getElementById('selectPerson').value;
    const isRecurring = document.getElementById('checkRecurring').checked;

    if (!accountId || !description || !amount || !personId) {
        alert('Preencha todos os campos obrigatórios');
        return;
    }

    const state = getAppState();
    const account = state.accounts.find(a => a.id === accountId);

    if (!account) {
        alert('Conta não encontrada');
        return;
    }

    const installmentAmount = calculateInstallmentAmount(amount, installments);
    const installmentDates = calculateInstallmentDates(
        amount,
        installments,
        account.closingDay,
        account.dueDay
    );

    const newTransactions = installmentDates.map((dueDate, index) => ({
        id: generateId(),
        accountId,
        personId,
        description,
        amount: installmentAmount,
        totalAmount: amount,
        installmentNumber: index + 1,
        totalInstallments: installments,
        dueDate,
        isPaid: false,
        isRecurring,
        createdAt: Date.now(),
    }));

    state.transactions.push(...newTransactions);
    saveAppState(state);

    // Limpa o formulário
    document.getElementById('inputDescription').value = '';
    document.getElementById('inputAmount').value = '';
    document.getElementById('selectInstallments').value = '1';
    document.getElementById('checkRecurring').checked = false;

    closeModal('modalNewTransaction');
    updateUI();
    alert(`${installments} parcela(s) criada(s) com sucesso!`);
}

/**
 * Marca uma transação como paga ou não paga
 */
function toggleTransactionPayment(transactionId) {
    const state = getAppState();
    const transaction = state.transactions.find(t => t.id === transactionId);

    if (transaction) {
        transaction.isPaid = !transaction.isPaid;
        if (transaction.isPaid) {
            transaction.paidAt = Date.now();
        } else {
            delete transaction.paidAt;
        }
        saveAppState(state);
        updateUI();
    }
}

/**
 * Exporta dados para backup
 */
function exportData() {
    const state = getAppState();
    return JSON.stringify(state, null, 2);
}

/**
 * Importa dados de um backup
 */
function importData(jsonString) {
    try {
        const state = JSON.parse(jsonString);
        if (!state.accounts || !state.people || !state.transactions) {
            throw new Error('Estrutura de dados inválida');
        }
        state.transactions = state.transactions.map(t => ({
            ...t,
            dueDate: new Date(t.dueDate)
        }));
        saveAppState(state);
        return true;
    } catch (error) {
        console.error('Erro ao importar dados:', error);
        return false;
    }
}

// ==================== INTERFACE ====================

/**
 * Abre um modal
 */
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

/**
 * Fecha um modal
 */
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

/**
 * Atualiza toda a interface
 */
function updateUI() {
    const state = getAppState();
    updateSummary(state);
    updateFilters(state);
    updateTransactionList(state);
    updateSelects(state);
}

/**
 * Atualiza os cards de resumo
 */
function updateSummary(state) {
    const currentMonth = calculateCurrentMonthTotal(state.transactions);
    const nextMonth = calculateNextMonthTotal(state.transactions);
    const monthAfterNext = calculateMonthAfterNextTotal(state.transactions);

    document.getElementById('totalCurrentMonth').textContent = formatCurrency(currentMonth);
    document.getElementById('totalNextMonth').textContent = formatCurrency(nextMonth);
    document.getElementById('totalMonthAfterNext').textContent = formatCurrency(monthAfterNext);
}

/**
 * Atualiza os filtros de conta
 */
function updateFilters(state) {
    const carousel = document.getElementById('carouselFilters');
    carousel.innerHTML = '';

    // Botão "Todas"
    const btnAll = document.createElement('button');
    btnAll.className = 'filter-btn active';
    btnAll.dataset.filter = 'all';
    btnAll.textContent = 'Todas';
    btnAll.onclick = () => filterByAccount('all');
    carousel.appendChild(btnAll);

    // Botões de contas
    state.accounts.forEach(account => {
        const total = state.transactions
            .filter(t => t.accountId === account.id && !t.isPaid && isCurrentMonth(t.dueDate))
            .reduce((sum, t) => sum + t.amount, 0);

        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.filter = account.id;
        btn.innerHTML = `<div>${account.name}</div><div class="filter-btn-amount">${formatCurrency(total)}</div>`;
        btn.onclick = () => filterByAccount(account.id);
        carousel.appendChild(btn);
    });
}

let currentFilter = 'all';
let currentTab = 'pending';

/**
 * Filtra transações por conta
 */
function filterByAccount(accountId) {
    currentFilter = accountId;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === accountId);
    });
    updateTransactionList(getAppState());
}

/**
 * Atualiza a lista de transações
 */
function updateTransactionList(state) {
    let transactions = state.transactions;

    // Filtra por conta
    if (currentFilter !== 'all') {
        transactions = transactions.filter(t => t.accountId === currentFilter);
    }

    // Filtra por status
    if (currentTab === 'pending') {
        transactions = transactions.filter(t => !t.isPaid);
    } else if (currentTab === 'paid') {
        transactions = transactions.filter(t => t.isPaid);
    }

    // Ordena por data de vencimento
    transactions.sort((a, b) => a.dueDate - b.dueDate);

    const listContainer = document.getElementById('transactionList');
    listContainer.innerHTML = '';

    if (transactions.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">Nenhuma transação</div>';
        return;
    }

    transactions.forEach(transaction => {
        const person = state.people.find(p => p.id === transaction.personId);
        const item = document.createElement('div');
        item.className = `transaction-item ${transaction.isPaid ? 'paid' : ''}`;

        const installmentText = transaction.totalInstallments > 1
            ? ` • ${transaction.installmentNumber}/${transaction.totalInstallments}`
            : '';

        item.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-details">
                    ${person?.name || 'Desconhecido'} • ${formatDate(transaction.dueDate)}${installmentText}
                </div>
            </div>
            <div class="transaction-amount">${formatCurrency(transaction.amount)}</div>
            <button class="transaction-btn ${transaction.isPaid ? 'paid' : 'pay'}" 
                    onclick="toggleTransactionPayment('${transaction.id}')">
                ${transaction.isPaid ? 'Pago' : 'Pagar'}
            </button>
        `;

        listContainer.appendChild(item);
    });
}

/**
 * Atualiza os selects de conta e pessoa
 */
function updateSelects(state) {
    const selectAccount = document.getElementById('selectAccount');
    const selectPerson = document.getElementById('selectPerson');

    selectAccount.innerHTML = '<option value="">Selecione uma conta</option>';
    state.accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = account.name;
        selectAccount.appendChild(option);
    });

    selectPerson.innerHTML = '<option value="">Selecione uma pessoa</option>';
    state.people.forEach(person => {
        const option = document.createElement('option');
        option.value = person.id;
        option.textContent = person.name;
        selectPerson.appendChild(option);
    });
}

// ==================== EVENT LISTENERS ====================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa a interface
    updateUI();

    // Botões de abas
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            updateTransactionList(getAppState());
        });
    });

    // Botão de nova transação
    document.getElementById('btnNewTransaction').addEventListener('click', () => {
        openModal('modalNewTransaction');
    });

    // Botão de backup
    document.getElementById('btnBackup').addEventListener('click', () => {
        const data = exportData();
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
        element.setAttribute('download', `compromissos_backup_${new Date().toISOString().split('T')[0]}.txt`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        alert('Backup realizado com sucesso!');
    });

    // Botão de restaurar
    document.getElementById('btnRestore').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target.result;
                if (importData(content)) {
                    updateUI();
                    alert('Dados restaurados com sucesso!');
                } else {
                    alert('Erro ao restaurar dados. Arquivo inválido.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    });

    // Botão de limpar
    document.getElementById('btnClear').addEventListener('click', () => {
        if (confirm('Tem certeza que deseja limpar todos os lançamentos? As contas e pessoas serão preservadas.')) {
            const state = getAppState();
            state.transactions = [];
            saveAppState(state);
            updateUI();
            alert('Lançamentos limpos com sucesso!');
        }
    });

    // Fechar modais ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Registra o Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then((registration) => {
            console.log('Service Worker registrado:', registration);
        }).catch((error) => {
            console.log('Erro ao registrar Service Worker:', error);
        });
    }
});
