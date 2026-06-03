// =================================================================
// CalculoFinanceiro.js - Motor Inteligente de Cálculos (Versão Corrigida)
// =================================================================

const CalculoFinanceiro = {
    CHAVE_LANCAMENTOS: 'financas_lancamentos',

    obterLancamentos: function() {
        const dados = localStorage.getItem(this.CHAVE_LANCAMENTOS);
        return dados ? JSON.parse(dados) : [];
    },

    salvarLancamentos: function(lista) {
        localStorage.setItem(this.CHAVE_LANCAMENTOS, JSON.stringify(lista));
    },

    adicionarGasto: function(gasto) {
        const lancamentos = this.obterLancamentos();
        lancamentos.push(gasto);
        this.salvarLancamentos(lancamentos);
        return true;
    },

    excluirGasto: function(id) {
        let lancamentos = this.obterLancamentos();
        lancamentos = lancamentos.filter(g => g.id !== id);
        this.salvarLancamentos(lancamentos);
        return true;
    },

    calcularResumoDoMes: function(mesAlvo, anoAlvo) {
        const lancamentos = this.obterLancamentos();
        
        let totalGeral = 0;
        let rateioPorResponsavel = {};
        let faturasCartoes = {};
        let itensDoMes = [];

        lancamentos.forEach(gasto => {
            // Calcula a distância de meses entre o início do gasto e o mês visualizado na tela
            const mesesDecorridos = (anoAlvo - gasto.anoInicio) * 12 + (mesAlvo - gasto.mesInicio);
            
            // Se a parcela pertence a este mês
            if (mesesDecorridos >= 0 && mesesDecorridos < gasto.parcelas) {
                const valorDaParcela = gasto.valorTotal / gasto.parcelas;
                const parcelaAtual = mesesDecorridos + 1;

                totalGeral += valorDaParcela;

                // Divide o valor para o responsável correto
                const resp = gasto.responsavel || 'Casa';
                if (!rateioPorResponsavel[resp]) {
                    rateioPorResponsavel[resp] = 0;
                }
                rateioPorResponsavel[resp] += valorDaParcela;

                // Se for cartão, acumula na fatura dele
                if (gasto.tipo === 'cartao' && gasto.cartaoNome) {
                    if (!faturasCartoes[gasto.cartaoNome]) {
                        faturasCartoes[gasto.cartaoNome] = 0;
                    }
                    faturasCartoes[gasto.cartaoNome] += valorDaParcela;
                }

                // Garante que o dia de vencimento exista para não quebrar a ordenação
                let diaVenc = parseInt(gasto.diaVencimento);
                if (isNaN(diaVenc) || diaVenc < 1 || diaVenc > 31) {
                    diaVenc = 10; // Padrão caso esteja vazio
                }

                itensDoMes.push({
                    id: gasto.id,
                    tipo: gasto.tipo,
                    descricao: gasto.descricao,
                    valorParcela: valorDaParcela,
                    parcelaAtual: parcelaAtual,
                    parcelasTotais: gasto.parcelas,
                    responsavel: resp,
                    cartaoNome: gasto.cartaoNome || '',
                    diaVencimento: diaVenc
                });
            }
        });

        // Ordena a lista do mês pelo dia do vencimento (do menor pro maior)
        itensDoMes.sort((a, b) => a.diaVencimento - b.diaVencimento);

        return {
            totalGeral: totalGeral,
            rateio: rateioPorResponsavel,
            cartoes: faturasCartoes,
            listaContas: itensDoMes
        };
    }
};
