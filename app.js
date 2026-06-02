// js/app.js

// 1. Importa a inteligência das outras gavetas
import { carregarDados, salvarDados } from './storage.js';
import { getCurrentYearMonth } from './dateUtils.js';
import { renderizarTotais, renderizarHistorico, abrirModalDetalhes } from './view.js';

// 2. Estado Global do Aplicativo (O que está acontecendo na tela agora)
let estadoApp = {
    dados: { lancamentos: [], categoriasCartoes: [] },
    mesVisivel: getCurrentYearMonth() // Começa travado no mês atual (ex: 2026-06)
};

/**
 * Função principal que dita o ritmo do app.
 * Ela lê o banco de dados e manda a visão desenhar tudo na tela.
 */
function atualizarTela() {
    const todosLancamentos = estadoApp.dados.lancamentos;
    
    // Filtra os lançamentos para mostrar APENAS os ~20 itens do mês escolhido
    const lancamentosDoMes = todosLancamentos.filter(item => {
        return item.vencimento.startsWith(estadoApp.mesVisivel);
    });

    // Calcula a matemática dos 3 Balões do topo de forma automática
    const resumoMes = {
        totalCartao: 0,
        totalEmprestimo: 0,
        totalConsumo: 0
    };

    lancamentosDoMes.forEach(item => {
        if (item.tipo === 'cartao') resumoMes.totalCartao += Number(item.valor);
        if (item.tipo === 'emprestimo') resumoMes.totalEmprestimo += Number(item.valor);
        if (item.tipo === 'consumo') resumoMes.totalConsumo += Number(item.valor);
    });

    // Manda o arquivo view.js desenhar os balões no topo
    renderizarTotais('totais-container', resumoMes);

    // Manda o arquivo view.js desenhar a lista de contas com os botões Pagar e Lupa
    renderizarHistorico(
        'historico-container', 
        lancamentosDoMes, 
        aoPagarItem,        // Ação quando clica em Pagar
        aoClicarNaLupa      // Ação quando clica na Lupa
    );
}

/**
 * Ação disparada quando você clica em "Pagar" (Seta para a aba pagas)
 */
function aoPagarItem(indexNoMes) {
    alert(`Compromisso pago com sucesso! Ele sairá dos pendentes.`);
    // A lógica de mudar o status do item e salvar será colocada aqui
}

/**
 * Ação disparada quando você clica na Lupa 🔍
 */
function aoClicarNaLupa(itemClicado) {
    // Chama o modal visual que criamos no view.js
    abrirModalDetalhes(itemClicado);
}

/**
 * Inicialização do Aplicativo (Roda assim que a página abre)
 */
function iniciar() {
    // Carrega os dados reais guardados no LocalStorage do celular
    estadoApp.dados = carregarDados();

    // SE O BANCO ESTIVER TOTALMENTE VAZIO (Primeiro acesso), coloca itens de teste para vermos o visual
    if (estadoApp.dados.lancamentos.length === 0) {
        estadoApp.dados.lancamentos = [
            { descricao: 'Nu Bank Daniela', valor: 450.00, vencimento: '2026-06-10', tipo: 'cartao' },
            { descricao: 'Empréstimo Bradesco', valor: 1200.00, vencimento: '2026-06-15', tipo: 'emprestimo' },
            { descricao: 'Conta de Luz EDP', valor: 185.30, vencimento: '2026-06-22', tipo: 'consumo' }
        ];
        salvarDados(estadoApp.dados);
    }

    // Da ordens para desenhar a tela inicial
    atualizarTela();
    
    console.log("Maestro iniciado! Aplicativo rodando em modo modular.");
}

// Executa a inicialização do sistema
iniciar();

