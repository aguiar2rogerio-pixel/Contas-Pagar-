// =================================================================
// Cadastros.js - Estrutura Comercial com Regras de Vencimento
// =================================================================

const Cadastros = {
    CHAVE_PESSOAS: 'financas_pessoas',
    CHAVE_CARTOES: 'financas_cartoes',
    CHAVE_TIPOS_CONSUMO: 'financas_tipos_consumo',
    CHAVE_CONTRATOS_EMPRESTIMO: 'financas_contratos_emprestimo',

    obterPessoas: function() {
        const dados = localStorage.getItem(this.CHAVE_PESSOAS);
        return dados ? JSON.parse(dados) : ['Casa'];
    },
    salvarPessoas: function(lista) {
        localStorage.setItem(this.CHAVE_PESSOAS, JSON.stringify(lista));
    },
    adicionarPessoa: function(nome) {
        const n = nome.trim(); if (!n) return false;
        const lista = this.obterPessoas();
        if (lista.includes(n)) return false;
        lista.push(n); this.salvarPessoas(lista); return true;
    },

    obterCartoes: function() {
        const dados = localStorage.getItem(this.CHAVE_CARTOES);
        return dados ? JSON.parse(dados) : []; 
    },
    salvarCartoes: function(lista) {
        localStorage.setItem(this.CHAVE_CARTOES, JSON.stringify(lista));
    },
    adicionarCartao: function(nome, diaFechamento, diaVencimento) {
        const n = nome.trim(); if (!n) return false;
        const lista = this.obterCartoes();
        if (lista.some(c => c.nome.toLowerCase() === n.toLowerCase())) return false;
        
        lista.push({
            nome: n,
            fechamento: parseInt(diaFechamento) || 5,
            vencimento: parseInt(diaVencimento) || 12
        });
        this.salvarCartoes(lista);
        return true;
    },

    obterTiposConsumo: function() {
        const dados = localStorage.getItem(this.CHAVE_TIPOS_CONSUMO);
        return dados ? JSON.parse(dados) : [];
    },
    salvarTiposConsumo: function(lista) {
        localStorage.setItem(this.CHAVE_TIPOS_CONSUMO, JSON.stringify(lista));
    },
    adicionarTipoConsumo: function(nome, vencimentoPadrao) {
        const n = nome.trim(); if (!n) return false;
        const lista = this.obterTiposConsumo();
        if (lista.some(c => c.nome.toLowerCase() === n.toLowerCase())) return false;

        lista.push({
            nome: n,
            vencimentoPadrao: parseInt(vencimentoPadrao) || 10
        });
        this.salvarTiposConsumo(lista);
        return true;
    },

    obterContratosEmprestimo: function() {
        const dados = localStorage.getItem(this.CHAVE_CONTRATOS_EMPRESTIMO);
        return dados ? JSON.parse(dados) : [];
    },
    salvarContratosEmprestimo: function(lista) {
        localStorage.setItem(this.CHAVE_CONTRATOS_EMPRESTIMO, JSON.stringify(lista));
    },
    adicionarContratoEmprestimo: function(nome, vencimentoPadrao) {
        const n = nome.trim(); if (!n) return false;
        const lista = this.obterContratosEmprestimo();
        if (lista.some(e => e.nome.toLowerCase() === n.toLowerCase())) return false;

        lista.push({
            nome: n,
            vencimentoPadrao: parseInt(vencimentoPadrao) || 20
        });
        this.salvarContratosEmprestimo(lista);
        return true;
    }
};
