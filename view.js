// view.js - Responsável pelo visual e cliques na tela
import { FinanceiroContext } from './storage.js';

export function renderizarInterface() {
    const totais = FinanceiroContext.CalcularTotaisDoMes();
    const rateios = FinanceiroContext.CalcularRateioResumido();
    const itensPendentes = FinanceiroContext.obterHistoricoAgrupado('pendente');

    // 1. Atualiza os Balões e Totais do Topo
    const containerTopo = document.getElementById('container-topo');
    if (containerTopo) {
        containerTopo.innerHTML = `
            <div class="grid grid-cols-3 gap-2 text-center mb-4">
                <div class="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl">
                    <span class="text-[11px] text-zinc-400 block mb-0.5">🏠 Contas Consumo</span>
                    <span class="text-xs font-bold text-zinc-100">R$ ${rateios.Casa.toFixed(2)}</span>
                </div>
                <div class="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl">
                    <span class="text-[11px] text-zinc-400 block mb-0.5">Daniela</span>
                    <span class="text-xs font-bold text-zinc-100">R$ ${rateios.Daniela.toFixed(2)}</span>
                </div>
                <div class="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl">
                    <span class="text-[11px] text-zinc-400 block mb-0.5">Rogério</span>
                    <span class="text-xs font-bold text-zinc-100">R$ ${rateios.Rogerio.toFixed(2)}</span>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-2 text-center border-t border-zinc-800/60 pt-3">
                <div class="bg-zinc-900/40 p-2">
                    <span class="text-[10px] text-amber-500 block">💳 Cartões</span>
                    <span class="text-sm font-bold text-amber-500">R$ ${totais.cartao.toFixed(2)}</span>
                </div>
                <div class="bg-zinc-900/40 p-2">
                    <span class="text-[10px] text-red-400 block">🏦 Empréstimo</span>
                    <span class="text-sm font-bold text-red-400">R$ ${totais.emprestimo.toFixed(2)}</span>
                </div>
                <div class="bg-zinc-900/40 p-2">
                    <span class="text-[10px] text-sky-400 block">📄 Contas</span>
                    <span class="text-sm font-bold text-sky-400">R$ ${totais.consumo.toFixed(2)}</span>
                </div>
            </div>
        `;
    }

    // 2. Renderiza o Histórico Enxuto
    const containerLista = document.getElementById('lista-compromissos');
    if (containerLista) {
        containerLista.innerHTML = '';
        
        itensPendentes.forEach(item => {
            const div = document.createElement('div');
            div.className = "bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3 flex items-center justify-between mx-1 my-2";
            
            let badgeColor = item.tipo === 'cartao' ? "text-amber-400 bg-amber-500/10" : item.tipo === 'emprestimo' ? "text-red-400 bg-red-500/10" : "text-sky-400 bg-sky-500/10";
            let tagTexto = item.tipo === 'cartao' ? 'CARTÃO' : item.tipo.toUpperCase();

            div.innerHTML = `
                <div class="flex items-center space-x-3 max-w-[65%]">
                    <button class="btn-lupa-acao text-xl p-1 active:scale-125 transition-all" data-tipo="${item.tipo}" data-nome="${item.cartaoNome || ''}" data-id="${item.id}">🔍</button>
                    <div class="truncate">
                        <div class="flex items-center space-x-1.5">
                            <span class="font-semibold text-sm text-zinc-100 truncate">${item.descricao}</span>
                            <span class="text-[9px] px-1 py-0.2 rounded font-bold ${badgeColor}">${tagTexto}</span>
                        </div>
                        <span class="text-[11px] text-zinc-500">Venc. ${item.vencimento.split('-').reverse().slice(0,2).join('/')}</span>
                    </div>
                </div>
                <div class="flex items-center space-x-2 text-right">
                    <span class="text-sm font-bold text-zinc-200">R$ ${item.valor.toFixed(2)}</span>
                    <button class="btn-pagar-acao bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold active:scale-90" data-ids="${item.idsAgrupados.join(',')}">
                        Pagar
                    </button>
                </div>
            `;
            containerLista.appendChild(div);
        });

        // Configuração dos Cliques nos Botões
        containerLista.querySelectorAll('.btn-pagar-acao').forEach(btn => {
            btn.onclick = (e) => {
                const ids = e.target.closest('.btn-pagar-acao').getAttribute('data-ids').split(',').map(Number);
                FinanceiroContext.marcarComoPago(ids);
                renderizarInterface();
            };
        });

        containerLista.querySelectorAll('.btn-lupa-acao').forEach(btn => {
            btn.onclick = (e) => {
                const alvo = e.target.closest('.btn-lupa-acao');
                const tipo = alvo.getAttribute('data-tipo');
                const id = Number(alvo.getAttribute('data-id'));
                const nome = alvo.getAttribute('data-nome');
                abrirJanelaInteligente(tipo, id, nome);
            };
        });
    }
}

function abrirJanelaInteligente(tipo, id, nome) {
    const modal = document.createElement('div');
    modal.className = "fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50";
    
    let corpoModal = '';
    
    if (tipo === 'cartao') {
        const compras = FinanceiroContext.state.lancamentos.filter(l => l.cartaoNome === nome && l.status === 'pendente');
        corpoModal = `
            <h4 class="font-bold text-zinc-100 text-sm mb-1">${nome}</h4>
            <p class="text-[11px] text-zinc-400 mb-3">Lançamentos do cartão</p>
            <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
                ${compras.map(c => `
                    <div class="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80 flex justify-between items-center text-xs">
                        <div>
                            <p class="font-medium text-zinc-200">${c.descricao} (${c.responsavel})</p>
                            <p class="text-[10px] text-zinc-500">R$ ${c.valor.toFixed(2)}</p>
                        </div>
                        <button class="text-red-400 font-bold px-2 py-1 bg-red-500/10 rounded active:scale-90" onclick="window.excluirItemDoCartao(${c.id})">Excluir</button>
                    </div>
                `).join('')}
            </div>
        `;
    } else if (tipo === 'emprestimo') {
        const emp = FinanceiroContext.state.lancamentos.find(l => l.id === id);
        corpoModal = `
            <h4 class="font-bold text-zinc-100 text-sm mb-3">${emp.descricao}</h4>
            <div class="space-y-2 text-xs">
                <div class="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 flex justify-between">
                    <span class="text-zinc-400">Total já Pago:</span>
                    <span class="text-emerald-400 font-bold">R$ ${emp.valorPagoAteAgora.toFixed(2)}</span>
                </div>
                <div class="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 flex justify-between">
                    <span class="text-zinc-400">Quanto falta pagar:</span>
                    <span class="text-red-400 font-bold">R$ ${(emp.valorTotalEmprestimo - emp.valorPagoAteAgora).toFixed(2)}</span>
                </div>
            </div>
        `;
    } else if (tipo === 'consumo') {
        const cons = FinanceiroContext.state.lancamentos.find(l => l.id === id);
        corpoModal = `
            <h4 class="font-bold text-zinc-100 text-sm mb-1">${cons.descricao}</h4>
            <p class="text-[11px] text-zinc-400 mb-3">Ajuste o valor real da fatura:</p>
            <input type="number" id="input-valor-real" step="0.01" value="${cons.valor}" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-100 font-bold text-sm focus:outline-none focus:border-sky-500">
        `;
    }

    modal.innerHTML = `
        <div class="bg-zinc-900 border border-zinc-800 w-full max-w-xs rounded-2xl p-4 space-y-4">
            ${corpoModal}
            <button id="btn-fechar-modal" class="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2.5 rounded-xl text-xs font-semibold mt-2">
                ${tipo === 'consumo' ? 'Salvar e Fechar' : 'Fechar'}
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    window.excluirItemDoCartao = (itemId) => {
        if(confirm("Deseja realmente remover este lançamento?")) {
            FinanceiroContext.excluirLancamento(itemId);
            document.body.removeChild(modal);
            renderizarInterface();
        }
    };

    modal.querySelector('#btn-fechar-modal').onclick = () => {
        if (tipo === 'consumo') {
            const nv = modal.querySelector('#input-valor-real').value;
            FinanceiroContext.atualizarValorConsumo(id, nv);
        }
        document.body.removeChild(modal);
        renderizarInterface();
    };
}

