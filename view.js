// js/view.js
import { formatDate } from './dateUtils.js';

/**
 * Desenha os balões de rateio e resumos no topo da tela.
 * Altera o antigo balão "Casa" para "Contas Consumo".
 */
export function renderizarTotais(containerId, dadosDoMes) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Valores fictícios ou calculados que virão do app.js posteriormente
    const totalCartao = dadosDoMes.totalCartao || 0;
    const totalEmprestimo = dadosDoMes.totalEmprestimo || 0;
    const totalConsumo = dadosDoMes.totalConsumo || 0;

    container.innerHTML = `
        <!-- Grid de Balões Modernos -->
        <div class="grid grid-cols-3 gap-3 text-center">
            <div class="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl active:scale-95 transition-all" onclick="alert('Detalhes dos Cartões em breve!')">
                <span class="text-xs text-zinc-400 block mb-1">💳 Cartões</span>
                <span class="text-sm font-bold text-amber-500">R$ ${totalCartao.toFixed(2)}</span>
            </div>
            <div class="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl">
                <span class="text-xs text-zinc-400 block mb-1">🏦 Empréstimo</span>
                <span class="text-sm font-bold text-red-400">R$ ${totalEmprestimo.toFixed(2)}</span>
            </div>
            <div class="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl">
                <span class="text-xs text-zinc-400 block mb-1">📄 Contas Consumo</span>
                <span class="text-sm font-bold text-sky-400">R$ ${totalConsumo.toFixed(2)}</span>
            </div>
        </div>
    `;
}

/**
 * Desenha a lista de compromissos do mês (~20 linhas no máximo).
 * Consolida compras repetidas do mesmo cartão e adiciona a Lupa 🔍.
 */
export function renderizarHistorico(containerId, lancamentos, aoPagar, aoClicarNaLupa) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (lancamentos.length === 0) {
        container.innerHTML = `<p class="text-center text-zinc-500 py-8 text-sm">Nenhum compromisso para este mês.</p>`;
        return;
    }

    container.innerHTML = `
        <h3 class="text-sm font-semibold text-zinc-400 mb-3 tracking-wide">Compromissos do Mês</h3>
        <div class="space-y-2.5" id="lista-compromissos-itens"></div>
    `;

    const listaItens = document.getElementById('lista-compromissos-itens');

    lancamentos.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = "bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex items-center justify-between transition-all";
        
        // Define a cor de destaque baseada no tipo de lançamento
        let badgeColor = "text-zinc-400 bg-zinc-800";
        if (item.tipo === 'cartao') badgeColor = "text-amber-400 bg-amber-500/10";
        if (item.tipo === 'emprestimo') badgeColor = "text-red-400 bg-red-500/10";
        if (item.tipo === 'consumo') badgeColor = "text-sky-400 bg-sky-500/10";

        div.innerHTML = `
            <div class="flex items-center space-x-3">
                <!-- Botão da Lupa 🔍 -->
                <button class="btn-lupa text-lg p-1 active:scale-125 transition-all" data-index="${index}">🔍</button>
                <div>
                    <div class="flex items-center space-x-2">
                        <span class="font-medium text-sm text-zinc-200">${item.descricao}</span>
                        <span class="text-[10px] px-1.5 py-0.5 rounded-md font-medium ${badgeColor}">${item.tipo.toUpperCase()}</span>
                    </div>
                    <span class="text-xs text-zinc-500">${formatDate(item.vencimento)}</span>
                </div>
            </div>
            
            <div class="flex items-center space-x-3">
                <span class="text-sm font-semibold text-zinc-100">R$ ${Number(item.valor).toFixed(2)}</span>
                <!-- Botão Pagar (Seta para pular para a aba pagas) -->
                <button class="btn-pagar bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-xs font-medium active:scale-90 transition-all" data-index="${index}">
                    Pagar
                </button>
            </div>
        `;
        
        listaItens.appendChild(div);
    });

    // Configura os cliques nos botões de Pagar e Lupa de forma cirúrgica
    container.querySelectorAll('.btn-pagar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = e.target.getAttribute('data-index');
            aoPagar(idx);
        });
    });

    container.querySelectorAll('.btn-lupa').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = e.target.getAttribute('data-index');
            aoClicarNaLupa(lancamentos[idx]);
        });
    });
}

/**
 * Abre a janela de detalhes (Modal) baseada no tipo de item clicado.
 */
export function abrirModalDetalhes(item) {
    // Cria a casca do modal de forma dinâmica na tela
    const modal = document.createElement('div');
    modal.className = "fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in";
    
    let conteudoEspecifico = '';

    // Inteligência da Lupa mudando conforme o tipo
    if (item.tipo === 'cartao') {
        conteudoEspecifico = `
            <p class="text-xs text-zinc-400 mb-4">Aqui você verá o pergaminho de lançamentos deste cartão.</p>
            <div class="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-sm max-h-40 overflow-y-auto space-y-2">
                <!-- Exemplo de como as compras individuais vão aparecer para exclusão -->
                <div class="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                    <span>Compra Exemplo</span>
                    <button class="text-red-400 text-xs font-semibold" onclick="alert('Excluir item?')">Excluir</button>
                </div>
            </div>
        `;
    } else if (item.tipo === 'emprestimo') {
        conteudoEspecifico = `
            <div class="space-y-3">
                <div class="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex justify-between text-sm">
                    <span class="text-zinc-400">Total Pago:</span>
                    <span class="text-emerald-400 font-semibold">R$ 5.000,00</span>
                </div>
                <div class="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex justify-between text-sm">
                    <span class="text-zinc-400">Falta Pagar:</span>
                    <span class="text-red-400 font-semibold">R$ 7.000,00</span>
                </div>
            </div>
        `;
    } else if (item.tipo === 'consumo') {
        conteudoEspecifico = `
            <p class="text-xs text-zinc-400 mb-2">Ajuste o valor real da fatura deste mês:</p>
            <input type="number" step="0.01" value="${item.valor}" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-50 font-semibold focus:outline-none focus:border-sky-500">
        `;
    }

    modal.innerHTML = `
        <div class="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-bold text-zinc-100">${item.descricao}</h4>
                    <span class="text-xs text-zinc-500">Detalhes do Compromisso</span>
                </div>
                <button id="fechar-modal" class="text-zinc-500 hover:text-zinc-300 text-lg">✕</button>
            </div>
            
            <hr class="border-zinc-800">
            
            ${conteudoEspecifico}
            
            <button id="salvar-modal" class="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-3 rounded-xl text-sm font-medium transition-all active:scale-95">
                Confirmar / Fechar
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    // Eventos para fechar o modal e tirá-lo da tela
    const fechar = () => document.body.removeChild(modal);
    modal.querySelector('#fechar-modal').addEventListener('click', fechar);
    modal.querySelector('#salvar-modal').addEventListener('click', fechar);
}
