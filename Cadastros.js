// =================================================================
// Cadastros.js - Gerenciamento de Pessoas e Cartões (ZERADO PARA MONETIZAÇÃO)
// =================================================================

const Cadastros = {
    // 1. CHAVES DE ARMAZENAMENTO (Nomes das gavetas no cofre do celular)
    CHAVE_PESSOAS: 'financas_pessoas',
    CHAVE_CARTOES: 'financas_cartoes',

    // 2. BUSCAR DADOS (Lê o que está salvo. Se estiver vazio, nasce zerado)
    obterPessoas: function() {
        const dados = localStorage.getItem(this.CHAVE_PESSOAS);
        // Nasce apenas com 'Casa', que é o padrão universal para despesas coletivas
        return dados ? JSON.parse(dados) : ['Casa'];
    },

    obterCartoes: function() {
        const dados = localStorage.getItem(this.CHAVE_CARTOES);
        // Nasce 100% vazio para o cliente cadastrar os seus próprios cartões
        return dados ? JSON.parse(dados) : [];
    },

    // 3. SALVAR DADOS (Grava as alterações fisicamente no chip do celular)
    salvarPessoas: function(lista) {
        localStorage.setItem(this.CHAVE_PESSOAS, JSON.stringify(lista));
    },

    salvarCartoes: function(lista) {
        localStorage.setItem(this.CHAVE_CARTOES, JSON.stringify(lista));
    },

    // 4. AÇÕES PARA PESSOAS (Adicionar, Alterar e Excluir)
    adicionarPessoa: function(nome) {
        const nomeLimpo = nome.trim();
        if (!nomeLimpo) return false;
        
        const pessoas = this.obterPessoas();
        if (pessoas.includes(nomeLimpo)) return false; // Impede nomes duplicados
        
        pessoas.push(nomeLimpo);
        this.salvarPessoas(pessoas);
        return true;
    },

    alterarPessoa: function(nomeAntigo, nomeNovo) {
        const novoLimpo = nomeNovo.trim();
        if (!novoLimpo) return false;

        let pessoas = this.obterPessoas();
        const index = pessoas.indexOf(nomeAntigo);
        
        if (index !== -1 && !pessoas.includes(novoLimpo)) {
            pessoas[index] = novoLimpo;
            this.salvarPessoas(pessoas);
            return true;
        }
        return false;
    },

    excluirPessoa: function(nome) {
        let pessoas = this.obterPessoas();
        // Não deixa excluir a entidade "Casa" que é a base do sistema
        if (nome === 'Casa') return false; 

        pessoas = pessoas.filter(p => p !== nome);
        this.salvarPessoas(pessoas);
        return true;
    },

    // 5. AÇÕES PARA CARTÕES (Adicionar, Alterar e Excluir)
    adicionarCartao: function(nome) {
        const nomeLimpo = nome.trim();
        if (!nomeLimpo) return false;

        const cartoes = this.obterCartoes();
        if (cartoes.includes(nomeLimpo)) return false;

        cartoes.push(nomeLimpo);
        this.salvarCartoes(cartoes);
        return true;
    },

    alterarCartao: function(nomeAntigo, nomeNovo) {
        const novoLimpo = nomeNovo.trim();
        if (!novoLimpo) return false;

        let cartoes = this.obterCartoes();
        const index = cartoes.indexOf(nomeAntigo);

        if (index !== -1 && !cartoes.includes(novoLimpo)) {
            cartoes[index] = novoLimpo;
            this.salvarCartoes(cartoes);
            return true;
        }
        return false;
    },

    excluirCartao: function(nome) {
        let cartoes = this.obterCartoes();
        cartoes = cartoes.filter(c => c !== nome);
        this.salvarCartoes(cartoes);
        return true;
    }
};

