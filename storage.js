// storage.js - Central de inteligência de dados (Nosso Contexto)
const NomeChaveStorage = 'dados_financeiros_daniela';

const dadosIniciais = {
    lancamentos: [
        { id: 1, tipo: 'cartao', cartaoNome: 'Nu Bank Daniela', descricao: 'Supermercado', valor: 150.00, vencimento: '2026-06-10', responsavel: 'Daniela', status: 'pendente' },
        { id: 2, tipo: 'cartao', cartaoNome: 'Nu Bank Daniela', descricao: 'Farmácia', valor: 300.00, vencimento: '2026-06-10', responsavel: 'Casa', status: 'pendente' },
        { id: 3, tipo: 'cartao', cartaoNome: 'Casas Bahia Visa', descricao: 'Geladeira 1/10', valor: 120.00, vencimento: '2026-06-15', responsavel: 'Casa', status: 'pendente' },
        { id: 4, tipo: 'emprestimo', descricao: 'Empréstimo Bradesco', valor: 1200.00, valorTotalEmprestimo: 12000.00, valorPagoAteAgora: 5000.00, vencimento: '2026-06-15', responsavel: 'Casa', status: 'pendente' },
        { id: 5, tipo: 'consumo', descricao: 'Conta de Luz EDP', valor: 185.30, vencimento: '2026-06-22', responsavel: 'Casa', status: 'pendente' }
    ]
};

export const FinanceiroContext = {
    state: JSON.parse(localStorage.getItem(NomeChaveStorage)) || dadosIniciais,

    salvar() {
        localStorage.setItem(NomeChaveStorage, JSON.stringify(this.state));
    },

    obterLancamentos(status = 'pendente') {
        return this.state.lancamentos.filter(l => l.status === status);
    },

    obterHistoricoAgrupado(status = 'pendente') {
        const itensFiltrados = this.obterLancamentos(status);
        const agrupado = [];

        itensFiltrados.forEach(item => {
            if (item.tipo === 'cartao') {
                const cartaoExistente = agrupado.find(c => c.tipo === 'cartao' && c.cartaoNome === item.cartaoNome);
                if (cartaoExistente) {
                    cartaoExistente.valor += Number(item.valor);
                    cartaoExistente.idsAgrupados.push(item.id);
                } else {
                    agrupado.push({
                        ...item,
                        descricao: item.cartaoNome,
                        idsAgrupados: [item.id]
                    });
                }
            } else {
                agrupado.push({ ...item, idsAgrupados: [item.id] });
            }
        });
        return agrupado;
    },

    CalcularTotaisDoMes() {
        const pendentes = this.obterLancamentos('pendente');
        return {
            cartao: pendentes.filter(l => l.tipo === 'cartao').reduce((acc, curr) => acc + Number(curr.valor), 0),
            emprestimo: pendentes.filter(l => l.tipo === 'emprestimo').reduce((acc, curr) => acc + Number(curr.valor), 0),
            consumo: pendentes.filter(l => l.tipo === 'consumo').reduce((acc, curr) => acc + Number(curr.valor), 0),
        };
    },

    CalcularRateioResumido() {
        const pendentes = this.obterLancamentos('pendente');
        const rateio = { Casa: 0, Daniela: 0, Rogerio: 0, Isabelli: 0, Stephanie: 0 };
        pendentes.forEach(l => {
            if (rateio[l.responsavel] !== undefined) {
                rateio[l.responsavel] += Number(l.valor);
            }
        });
        return rateio;
    },

    marcarComoPago(ids) {
        this.state.lancamentos = this.state.lancamentos.map(l => {
            if (ids.includes(l.id)) l.status = 'paga';
            return l;
        });
        this.salvar();
    },

    excluirLancamento(id) {
        this.state.lancamentos = this.state.lancamentos.filter(l => l.id !== id);
        this.salvar();
    },

    atualizarValorConsumo(id, novoValor) {
        this.state.lancamentos = this.state.lancamentos.map(l => {
            if (l.id === id) l.valor = Number(novoValor);
            return l;
        });
        this.salvar();
    }
};
