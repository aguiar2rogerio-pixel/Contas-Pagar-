// app.js

// 1. Importa a inteligência das outras gavetas (Agora direto na raiz)
import { carregarDados, salvarDados } from './storage.js';
import { getCurrentYearMonth } from './dateUtils.js';
import { renderizarTotais, renderizarHistorico, abrirModalDetalhes } from './view.js';

// 2. Estado Global do Aplicativo
let estadoApp = {
    dados: { lancamentos: [], categoriasCartoes: [] },
    mesVisivel: getCurrentYearMonth()
};

function atualizarTela() {
    const todosLancamentos = estadoApp.dados.lancamentos;
    
    const lancamentosDoMes = todosLancamentos.filter(item => {
        return item.vencimento.startsWith(estadoApp.mesVisivel);
    });

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

    renderizarTotais('totais-container', resumoMes);

    renderizarHistorico(
        'historico-container', 
        lancamentosDoMes, 
        aoPagarItem,        
        aoClicarNaLupa      
    );
}

function aoPagarItem(indexNoMes) {
    alert(`Compromisso pago com sucesso! Ele sairá dos pendentes.`);
}

function aoClicarNaLupa(itemClicado) {
    abrirModalDetalhes(itemClicado);
}

function iniciar() {
    estadoApp.dados = carregarDados();

    // Dados de teste para vermos o sistema funcionando de primeira
    if (estadoApp.dados.lancamentos.length === 0) {
        estadoApp.dados.lancamentos = [
            { descricao: 'Nu Bank Daniela', valor: 450.00, vencimento: '2026-06-10', tipo: 'cartao' },
            { descricao: 'Empréstimo Bradesco', valor: 1200.00, vencimento: '2026-06-15', tipo: 'emprestimo' },
            { descricao: 'Conta de Luz EDP', valor: 185.30, vencimento: '2026-06-22', tipo: 'consumo' }
        ];
        salvarDados(estadoApp.dados);
    }

    atualizarTela();
    console.log("Maestro iniciado na raiz!");
}

iniciar();
