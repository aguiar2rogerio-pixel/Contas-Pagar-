// ==================== CONFIGURAÇÃO DO SISTEMA ====================
const STORAGE_KEY = 'compromissos_app_state';
const DEFAULT_PEOPLE = ['Casa', 'Daniela', 'Rogério', 'Isabelli', 'Stephanie'];

let currentTab = 'pending';
let activeFormType = 'cartao'; // cartao ou consumo

// ==================== DATA E MOTOR DE BRASÍLIA ====================
function getNowBrasilia() {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit'
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
    const nm = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return date.getMonth() === nm.getMonth() && date.getFullYear() === nm.getFullYear();
}
function isMonthAfterNext(date) {
    const now = getNowBrasilia();
    const man = new Date(now.getFullYear(), now.getMonth() + 2, 1);
    return date.getMonth() === man.getMonth() && date.getFullYear() === man.getFullYear();
}

function formatDate(date) { return new Intl.DateTimeFormat('pt-BR').format(date); }
function formatCurrency(v) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v); }

// ==================== INFRAESTRUTURA DE DADOS ====================
function getAppState() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            const def = getDefaultState();
            saveAppState(def);
            return def;
        }
        const state = JSON.parse(stored);
        state.transactions = (state.transactions || []).map(t => ({ ...t, dueDate: new Date(t.dueDate) }));
        return state;
    } catch (e) {
        return getDefaultState();
    }
}

function getDefaultState() {
    return {
        accounts: [],
        people: DEFAULT_PEOPLE.map((name, i) => ({ id: `p_${i}`, name, createdAt: Date.now() })),
        transactions: [],
        lastUpdated: Date.now()
    };
}

function saveAppState(s) {
    s.lastUpdated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}
function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }

// ==================== CÁLCULO DAS DESPESAS ====================
function calculateInstallments(amount, qty, closingDay, dueDay) {
    const dates = [];
    const now = getNowBrasilia();
    let m = now.getMonth();
    let y = now.getFullYear();

    if (now.getDate() > closingDay) {
        m += 1;
        if (m > 11) { m = 0; y += 1; }
    }
    for (let i = 0; i < qty; i++) {
        dates.push(new Date(y, m + i, dueDay));
    }
    return dates;
}

// ==================== CONTROLADORES DA REQUISIÇÃO ====================
function setFormType(type) {
    activeFormType = type;
    document.getElementById('typeCartao').classList.toggle('active', type === 'cartao');
    document.getElementById('typeConsumo').classList.toggle('active', type === 'consumo');
    document.getElementById('groupAccount').style.display = type === 'cartao' ? 'block' : 'none';
    document.getElementById('groupInstallments').style.display = type === 'cartao' ? 'block' : 'none';
    
    if(type === 'consumo') {
        const state = getAppState();
        const casaObj = state.people.find(p => p.name === 'Casa');
        if(casaObj) document.getElementById('selectPerson').value = casaObj.id;
    }
}

function openModal(id) { 
    const m = document.getElementById(id); 
    if(m) m.style.display = 'flex'; 
}
function closeModal(id) { 
    const m = document.getElementById(id); 
    if(m) m.style.display = 'none'; 
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    if(tab === 'pending') document.getElementById('tabPending').classList.add('active');
    if(tab === 'paid') document.getElementById('tabPaid').classList.add('active');
    if(tab === 'all') document.getElementById('tabAll').classList.add('active');
    updateUI();
}

// ==================== OPERAÇÕES (SALVAR / EXCLUIR / EDITAR) ====================
function createAccount() {
    const name = document.getElementById('inputAccountName').value.trim();
    const closing = parseInt(document.getElementById('inputClosingDay').value);
    const due = parseInt(document.getElementById('inputDueDay').value);

    if (!name || !closing || !due) return alert('Preencha as configurações do cartão.');

    const state = getAppState();
    state.accounts.push({ id: generateId(), name, closingDay: closing, dueDay: due });
    saveAppState(state);

    document.getElementById('inputAccountName').value = '';
    document.getElementById('inputClosingDay').value = '';
    document.getElementById('inputDueDay').value = '';
    closeModal('modalNewAccount');
    updateUI();
}

function saveTransaction() {
    const txId = document.getElementById('inputEditTxId').value;
    const description = document.getElementById('inputDescription').value.trim();
    const amount = parseFloat(document.getElementById('inputAmount').value);
    const personId = document.getElementById('selectPerson').value;

    if (!description || isNaN(amount) || amount <= 0 || !personId) return alert('Preencha os campos obrigatórios.');

    const state = getAppState();

    if (txId) {
        // Modo Edição Direta
        const item = state.transactions.find(t => t.id === txId);
        if(item) {
            item.description = description;
            item.amount = amount;
            item.personId = personId;
            if (activeFormType === 'cartao') {
                item.accountId = document.getElementById('selectAccount').value;
            } else {
                item.accountId = 'consumo';
            }
        }
    } else {
        // Modo Criação Inteligente
        if (activeFormType === 'cartao') {
            const accId = document.getElementById('selectAccount').value;
            if(!accId) return alert('Selecione o cartão.');
            const acc = state.accounts.find(a => a.id === accId);
            const qty = parseInt(document.getElementById('selectInstallments').value);
            const part = parseFloat((amount / qty).toFixed(2));
            const dates = calculateInstallments(amount, qty, acc.closingDay, acc.dueDay);

            dates.forEach((dueDate, i) => {
                state.transactions.push({
                    id: generateId(), accountId: accId, personId, description,
                    amount: part, installmentNumber: i + 1, totalInstallments: qty,
                    dueDate, isPaid: false
                });
            });
        } else {
            // Conta de Consumo (Vence no mês atual no dia corrente)
            state.transactions.push({
                id: generateId(), accountId: 'consumo', personId, description,
                amount, installmentNumber: 1, totalInstallments: 1,
                dueDate: getNowBrasilia(), isPaid: false
            });
        }
    }

    saveAppState(state);
    closeModal('modalNewTransaction');
    updateUI();
}

function deleteTransaction(id) {
    if(!confirm("Tem certeza que deseja excluir permanentemente este lançamento?")) return;
    const state = getAppState();
    state.transactions = state.transactions.filter(t => t.id !== id);
    saveAppState(state);
    closeModal('modalPersonHistory');
    updateUI();
}

function startEditTransaction(id) {
    const state = getAppState();
    const t = state.transactions.find(item => item.id === id);
    if(!t) return;

    closeModal('modalPersonHistory');
    document.getElementById('inputEditTxId').value = t.id;
    document.getElementById('txModalTitle').textContent = "Editar Lançamento";
    document.getElementById('inputDescription').value = t.description;
    document.getElementById('inputAmount').value = t.amount;
    document.getElementById('selectPerson').value = t.personId;

    if(t.accountId === 'consumo') {
        setFormType('consumo');
    } else {
        setFormType('cartao');
        document.getElementById('selectAccount').value = t.accountId;
    }
    openModal('modalNewTransaction');
}

function togglePayment(id) {
    const state = getAppState();
    const t = state.transactions.find(item => item.id === id);
    if(t) { t.isPaid = !t.isPaid; saveAppState(state); updateUI(); }
}

// ==================== CONSTRUÇÃO DA INTERFACE GRÁFICA ====================
function openPersonHistory(personId, name) {
    const state = getAppState();
    const box = document.getElementById('personHistoryRows');
    document.getElementById('personHistoryTitle').textContent = `Gastos de ${name}`;
    box.innerHTML = '';

    const list = state.transactions.filter(t => t.personId === personId && !t.isPaid && isCurrentMonth(t.dueDate));
    let totalSum = 0;

    if(list.length === 0) {
        box.innerHTML = '<div class="empty-state">Nenhum gasto em aberto este mês.</div>';
    } else {
        list.forEach(t => {
            totalSum += t.amount;
            const row = document.createElement('div');
            row.className = 'history-item-row';
            
            let origin = t.accountId === 'consumo' ? '📄 Consumo' : '💳 Cartão';
            if(t.accountId !== 'consumo') {
                const accName = state.accounts.find(a => a.id === t.accountId)?.name || 'Cartão';
                origin = `${accName} (${t.installmentNumber}/${t.totalInstallments})`;
            }

            row.innerHTML = `
                <div>
                    <div style="font-weight:600;">${t.description}</div>
                    <div style="font-size:0.75rem; color:var(--text-secondary);">${origin}</div>
                </div>
                <div style="display:flex; align-items:center;">
                    <span style="font-weight:700; color:var(--accent); margin-right:0.5rem;">${formatCurrency(t.amount)}</span>
                    <button class="history-action-btn" onclick="startEditTransaction('${t.id}')">✏️</button>
                    <button class="history-action-btn" onclick="deleteTransaction('${t.id}')">🗑️</button>
                </div>
            `;
            box.appendChild(row);
        });
    }

    document.getElementById('personHistoryTotal').textContent = formatCurrency(totalSum);
    openModal('modalPersonHistory');
}

function updateUI() {
    const state = getAppState();
    const now = getNowBrasilia();

    // 1. Totais Superiores
    const totalCurrent = state.transactions.filter(t => !t.isPaid && isCurrentMonth(t.dueDate)).reduce((s, t) => s + t.amount, 0);
    const totalNext = state.transactions.filter(t => !t.isPaid && isNextMonth(t.dueDate)).reduce((s, t) => s + t.amount, 0);
    const totalSub = state.transactions.filter(t => !t.isPaid && isMonthAfterNext(t.dueDate)).reduce((s, t) => s + t.amount, 0);

    document.getElementById('totalCurrentMonth').textContent = formatCurrency(totalCurrent);
    document.getElementById('totalNextMonth').textContent = formatCurrency(totalNext);
    document.getElementById('totalMonthAfterNext').textContent = formatCurrency(totalSub);

    // 2. Renderizar Balões Estilo Cofrinho
    const balloonsBox = document.getElementById('peopleBalloonsBox');
    if (balloonsBox) {
        balloonsBox.innerHTML = '';
        state.people.forEach(p => {
            const sum = state.transactions
                .filter(t => t.personId === p.id && !t.isPaid && isCurrentMonth(t.dueDate))
                .reduce((s, t) => s + t.amount, 0);

            const ball = document.createElement('div');
            ball.className = 'person-balloon';
            ball.onclick = () => openPersonHistory(p.id, p.name);
            ball.innerHTML = `
                <span class="person-name">${p.name}</span>
                <span class="person-amount">${formatCurrency(sum)}</span>
            `;
            balloonsBox.appendChild(ball);
        });
    }

    // 3. Atualizar Seletores nos Modais
    const selAcc = document.getElementById('selectAccount');
    const selPer = document.getElementById('selectPerson');
    if (selAcc) {
        selAcc.innerHTML = '';
        state.accounts.forEach(a => selAcc.innerHTML += `<option value="${a.id}">${a.name}</option>`);
    }
    if (selPer) {
        selPer.innerHTML = '';
        state.people.forEach(p => selPer.innerHTML += `<option value="${p.id}">${p.name}</option>`);
    }

    // 4. Renderizar Lista Central Unificada (Evita o efeito pergaminho)
    renderMainList(state);
}

function renderMainList(state) {
    const box = document.getElementById('transactionList');
    if (!box) return;
    box.innerHTML = '';

    let list = [];

    // Filtragem por Abas
    let filteredTxs = state.transactions || [];
    if (currentTab === 'pending') filteredTxs = filteredTxs.filter(t => !t.isPaid && isCurrentMonth(t.dueDate));
    if (currentTab === 'paid') filteredTxs = filteredTxs.filter(t => t.isPaid && isCurrentMonth(t.dueDate));
    if (currentTab === 'all') filteredTxs = filteredTxs.filter(t => isCurrentMonth(t.dueDate));

    // Mapeamento Inteligente: Agrupa faturas de cartão repetidas para encurtar a tela
    const grouped = {};

    filteredTxs.forEach(t => {
        if (t.accountId !== 'consumo' && currentTab === 'pending') {
            // Agrupa faturas de cartões em aberto
            const key = `card_${t.accountId}`;
            if (!grouped[key]) {
                const cardName = state.accounts.find(a => a.id === t.accountId)?.name || 'Cartão de Crédito';
                grouped[key] = {
                    isGroup: true,
                    description: `Fatura ${cardName}`,
                    details: 'Fechamento Automático',
                    amount: 0,
                    isPaid: false,
                    ids: []
                };
            }
            grouped[key].amount += t.amount;
            grouped[key].ids.push(t.id);
        } else {
            // Lançamento avulso ou conta de consumo
            const pName = state.people.find(p => p.id === t.personId)?.name || 'Geral';
            let lbl = t.accountId === 'consumo' ? '📄 Consumo' : '💳 Fatura';
            list.push({
                id: t.id,
                isGroup: false,
                description: t.description,
                details: `${pName} • ${lbl}`,
                amount: t.amount,
                isPaid: t.isPaid
            });
        }
    });

    // Injeta os cartões agrupados na lista final
    Object.values(grouped).forEach(g => list.push(g));

    if (list.length === 0) {
        box.innerHTML = '<div class="empty-state">Nenhum compromisso cadastrado para este mês.</div>';
        return;
    }

    list.forEach(item => {
        const row = document.createElement('div');
        row.className = `transaction-item ${item.isPaid ? 'paid' : ''}`;
        
        let actionButtonHTML = '';
        if (item.isGroup) {
            actionButtonHTML = `<span style="font-size:0.75rem; color:var(--text-secondary); font-style:italic;">Ver nos Balões</span>`;
        } else {
            actionButtonHTML = `
                <button class="transaction-btn ${item.isPaid ? 'paid' : 'pay'}" onclick="togglePayment('${item.id}')">
                    ${item.isPaid ? '✓' : 'Pagar'}
                </button>
            `;
        }

        row.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-description">${item.description}</div>
                <div class="transaction-details">${item.details}</div>
            </div>
            <div class="transaction-amount">${formatCurrency(item.amount)}</div>
            <div>${actionButtonHTML}</div>
        `;
        box.appendChild(row);
    });
}

// ==================== CAPTURA DE EVENTOS INICIAIS ====================
document.addEventListener('DOMContentLoaded', () => {
    updateUI();

    document.getElementById('btnOpenMainModal').addEventListener('click', () => {
        document.getElementById('inputEditTxId').value = '';
        document.getElementById('txModalTitle').textContent = "Novo Lançamento";
        document.getElementById('inputDescription').value = '';
        document.getElementById('inputAmount').value = '';
        setFormType('cartao');
        openModal('modalNewTransaction');
    });

    document.getElementById('btnCloseTxModal').addEventListener('click', () => closeModal('modalNewTransaction'));
    document.getElementById('btnSubmitTransaction').addEventListener('click', saveTransaction);
    
    document.getElementById('btnOpenAccModal').addEventListener('click', () => openModal('modalNewAccount'));
    document.getElementById('btnCloseAccModal').addEventListener('click', () => closeModal('modalNewAccount'));
    document.getElementById('btnSubmitAccount').addEventListener('click', createAccount);

    // Sistema de Backup e Limpeza do Estado Original
    document.getElementById('btnBackup').addEventListener('click', () => {
        const out = JSON.stringify(getAppState(), null, 2);
        const link = document.createElement('a');
        link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(out));
        link.setAttribute('download', `compromissos_backup.txt`);
        link.click();
    });

    document.getElementById('btnRestore').addEventListener('click', () => {
        const f = document.createElement('input'); f.type = 'file'; f.accept = '.txt';
        f.onchange = (e) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const res = JSON.parse(ev.target.result);
                    res.transactions = res.transactions.map(t => ({ ...t, dueDate: new Date(t.dueDate) }));
                    saveAppState(res); updateUI(); alert('Sucesso!');
                } catch(err) { alert('Erro.'); }
            };
            reader.readAsText(e.target.files[0]);
        };
        f.click();
    });

    document.getElementById('btnClear').addEventListener('click', () => {
        if(confirm('Limpar histórico de gastos do mês?')) {
            const state = getAppState(); state.transactions = []; saveAppState(state); updateUI();
        }
    });
});

