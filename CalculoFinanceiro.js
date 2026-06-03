// =================================================================
// CalculoFinanceiro.js - Processamento de Datas Automatizado
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
            const mesesDecorridos = (anoAlvo - gasto.anoInicio) * 12 + (mesAlvo - gasto.mesInicio);
            
            if (mesesDecorridos >= 0 && mesesDecorridos < gasto.parcelas) {
                const valorDaParcela = gasto.valorTotal / gasto.parcelas;
                const parcelaAtual = mesesDecorridos + 1;

                totalGeral += valorDaParcela;

                if (!rateioPorResponsavel[gasto.responsavel]) {
                    rateioPorResponsavel[gasto.responsavel] = 0;
                }
                rateioPorResponsavel[gasto.responsavel] += valorDaParcela;

                if (gasto.tipo === 'cartao' && gasto.cartaoNome) {
                    if (!faturasCartoes[gasto.cartaoNome]) {
                        faturasCartoes[gasto.cartaoNome] = 0;
                    }
                    faturasCartoes[gasto.cartaoNome] += valorDaParcela;
                }

                itensDoMes.push({
                    id: gasto.id,
                    tipo: gasto.tipo,
                    descricao: gasto.descricao,
                    valorParcela: valorDaParcela,
                    parcelaAtual: parcelaAtual,
                    parcelasTotais: gasto.parcelas,
                    responsavel: gasto.responsavel,
                    cartaoNome: gasto.cartaoNome || '',
                    diaVencimento: gasto.diaVencimento || 10
                });
            }
        });

        itensDoMes.sort((a, b) => a.diaVencimento - b.diaVencimento);

        return {
            totalGeral: totalGeral,
            rateio: rateioPorResponsavel,
            cartoes: faturasCartoes,
            listaContas: itensDoMes
        };
    }
};

