// =================================================================
// CalculoFinanceiro.js - O Motor Matemático e Gerenciador de Gastos
// =================================================================

const CalculoFinanceiro = {
    CHAVE_LANCAMENTOS: 'financas_lancamentos',

    // 1. BUSCAR TODOS OS LANÇAMENTOS DO COFRE
    obterLancamentos: function() {
        const dados = localStorage.getItem(this.CHAVE_LANCAMENTOS);
        return dados ? JSON.parse(dados) : [];
    },

    // 2. SALVAR LISTA ATUALIZADA NO CHIP DO CELULAR
    salvarLancamentos: function(lista) {
        localStorage.setItem(this.CHAVE_LANCAMENTOS, JSON.stringify(lista));
    },

    // 3. ADICIONAR UM NOVO GASTO (Trata Cartão, Conta ou Empréstimo)
    adicionarGasto: function(gasto) {
        /* 
           O objeto 'gasto' esperado deve conter:
           {
              id: Date.now(),
              tipo: 'cartao' | 'conta' | 'emprestimo',
              descricao: String,
              valorTotal: Number,
              parcelas: Number, (Ex: 1 para conta única, 12 para empréstimo)
              responsavel: String, (Ex: 'Casa', 'Daniela'...)
              cartaoNome: String, (Apenas se tipo for 'cartao', se não, vazio)
              mesInicio: Number, (0 para Janeiro, 5 para Junho...)
              anoInicio: Number
           }
        */
        const lancamentos = this.obterLancamentos();
        lancamentos.push(gasto);
        this.salvarLancamentos(lancamentos);
        return true;
    },

    // 4. EXCLUIR UM GASTO PELO ID
    excluirGasto: function(id) {
        let lancamentos = this.obterLancamentos();
        lancamentos = lancamentos.filter(g => g.id !== id);
        this.salvarLancamentos(lancamentos);
        return true;
    },

    // 5. O CÉREBRO: CALCULAR O REASSUMO DO MÊS SELECIONADO
    // Esta função varre o banco e descobre o que vence no mês/ano escolhido
    calcularResumoDoMes: function(mesAlvo, anoAlvo) {
        const lancamentos = this.obterLancamentos();
        
        let totalGeral = 0;
        let rateioPorResponsavel = {}; // { 'Casa': 0, 'Daniela': 0... }
        let faturasCartoes = {};       // { 'Nu Bank': 0, 'Bradesco': 0... }
        let itensDoMes = [];           // Lista filtrada de contas a vencer no mês

        lancamentos.forEach(gasto => {
            // Calcula quantos meses se passaram desde que o gasto foi criado
            const mesesDecorridos = (anoAlvo - gasto.anoInicio) * 12 + (mesAlvo - gasto.mesInicio);
            
            // Se o mês alvo está dentro do período das parcelas deste gasto
            if (mesesDecorridos >= 0 && mesesDecorridos < gasto.parcelas) {
                const valorDaParcela = gasto.valorTotal / gasto.parcelas;
                const parcelaAtual = mesesDecorridos + 1;

                totalGeral += valorDaParcela;

                // Organiza o peso por responsável
                if (!rateioPorResponsavel[gasto.responsavel]) {
                    rateioPorResponsavel[gasto.responsavel] = 0;
                }
                rateioPorResponsavel[gasto.responsavel] += valorDaParcela;

                // Se for cartão, acumula na fatura do cartão correspondente
                if (gasto.tipo === 'cartao' && gasto.cartaoNome) {
                    if (!faturasCartoes[gasto.cartaoNome]) {
                        faturasCartoes[gasto.cartaoNome] = 0;
                    }
                    faturasCartoes[gasto.cartaoNome] += valorDaParcela;
                }

                // Guarda as informações mastigadas para o arquivo Historico.js desenhar na tela
                itensDoMes.push({
                    id: gasto.id,
                    tipo: gasto.tipo,
                    descricao: gasto.descricao,
                    valorParcela: valorDaParcela,
                    parcelaAtual: parcelaAtual,
                    parcelasTotais: gasto.parcelas,
                    responsavel: gasto.responsavel,
                    cartaoNome: gasto.cartaoNome || ''
                });
            }
        });

        return {
            totalGeral: totalGeral,
            rateio: rateioPorResponsavel,
            cartoes: faturasCartoes,
            listaContas: itensDoMes
        };
    }
};

