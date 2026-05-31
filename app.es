// ==================== INTERFACE ====================

/**
 * Atualiza os cards de resumo
 */
function updateSummary(state) {
    const currentMonth = calculateCurrentMonthTotal(state.transactions);
    const nextMonth = calculateNextMonthTotal(state.transactions);
    const monthAfterNext = calculateMonthAfterNextTotal(state.transactions);

    const totalCurrent = document.getElementById('totalCurrentMonth');
    const totalNext = document.getElementById('totalNextMonth');
    const totalSub = document.getElementById('totalMonthAfterNext');

    if (totalCurrent) totalCurrent.textContent = formatCurrency(currentMonth);
    if (totalNext) totalNext.textContent = formatCurrency(nextMonth);
    if (totalSub) totalSub.textContent = formatCurrency(monthAfterNext);
}

/**
 * Atualiza os filtros de conta (CORRIGIDO PARA NÃO TRAVAR)
 */
function updateFilters(state) {
    const carousel = document.getElementById('carouselFilters');
    if (!carousel) return; // Proteção caso o elemento suma do HTML
    
    carousel.innerHTML = '';

    // Botão "Todas"
    const btnAll = document.createElement('button');
    btnAll.className = `filter-btn ${currentFilter === 'all' ? 'active' : ''}`;
    btnAll.dataset.filter = 'all';
    btnAll.textContent = 'Todas';
    btnAll.onclick = () => filterByAccount('all');
    carousel.appendChild(btnAll);

    // Se não houver contas cadastradas ainda, para por aqui sem quebrar
    if (!state.accounts || state.accounts.length === 0) return;

    // Botões de contas
    state.accounts.forEach(account => {
        const total = state.transactions
            .filter(t => t.accountId === account.id && !t.isPaid && isCurrentMonth(t.dueDate))
            .reduce((sum, t) => sum + t.amount, 0);

        const btn = document.createElement('button');
        btn.className = `filter-btn ${currentFilter === account.id ? 'active' : ''}`;
        btn.dataset.filter = account.id;
        btn.innerHTML = `<div>${account.name}</div><div class="filter-btn-amount">${formatCurrency(total)}</div>`;
        btn.onclick = () => filterByAccount(account.id);
        carousel.appendChild(btn);
    });
}

/**
 * Atualiza os selects de conta e pessoa com verificação
 */
function updateSelects(state) {
    const selectAccount = document.getElementById('selectAccount');
    const selectPerson = document.getElementById('selectPerson');

    if (selectAccount) {
        selectAccount.innerHTML = '<option value="">Selecione uma conta</option>';
        if (state.accounts) {
            state.accounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account.id;
                option.textContent = account.name;
                selectAccount.appendChild(option);
            });
        }
    }

    if (selectPerson) {
        selectPerson.innerHTML = '<option value="">Selecione uma pessoa</option>';
        if (state.people) {
            state.people.forEach(person => {
                const option = document.createElement('option');
                option.value = person.id;
                option.textContent = person.name;
                selectPerson.appendChild(option);
            });
        }
    }
}

