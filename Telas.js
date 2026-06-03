// =================================================================
// Telas.js - Versão Definitiva, Limpa e Funcional (Sem travamentos)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. CAPTURA DOS ELEMENTOS DA TELA PRINCIPAL
    const btnAbrirLancamento = document.getElementById('btn-abrir-lancamento');
    const gaveta = document.getElementById('gaveta-lancamento');
    const btnFecharGaveta = document.getElementById('fechar-gaveta');
    const corpoGaveta = document.getElementById('corpo-gaveta');

    // Controla qual pílula está selecionada ('conta', 'cartao' ou 'emprestimo')
    let tipoAtivo = 'conta'; 

    // CONTROLE DE NAVEGAÇÃO DAS ABAS INFERIORES
    document.querySelectorAll('.nav-item').forEach(botao => {
        botao.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('ativo'));
            botao.classList.add('ativo');

            const targetAba = botao.getAttribute('data-aba');
            document.querySelectorAll('.secao-aba').forEach(aba => {
                if (aba.id === targetAba) {
                    aba.classList.remove('aba-escondida');
                } else {
                    aba.classList.add('aba-escondida');
                }
            });
        });
    });

    // CONTROLE DE ABRIR E FECHAR GAVETA
    if (btnAbrirLancamento) {
        btnAbrirLancamento.addEventListener('click', () => {
            tipoAtivo = 'conta'; // Inicializa sempre em conta de consumo
            montarEstruturaGaveta();
            gaveta.classList.remove('escondida');
        });
    }

    if (btnFecharGaveta) {
        btnFecharGaveta.addEventListener('click', () => gaveta.classList.add('escondida'));
    }

    if (gaveta) {
        gaveta.addEventListener('click', (e) => {
            if (e.target === gaveta) gaveta.classList.add('escondida');
        });
    }

    // 2. MONTA AS PÍLULAS SUPERIORES DA GAVETA
    function montarEstruturaGaveta() {
        corpoGaveta.innerHTML = `
            <div style="display: flex; gap: 8px; margin-bottom: 20px;">
                <button id="pilula-conta" style="flex: 1; padding: 10px; background-color: ${tipoAtivo === 'conta' ? '#00E676' : '#1E1E1E'}; border: 1px solid #2C2C2C; border-radius: 20px; color: ${tipoAtivo === 'conta' ? '#000' : '#B3B3B3'}; font-weight: bold; font-size: 13px; cursor: pointer;">
                    📄 Consumo
                </button>
                <button id="pilula-cartao" style="flex: 1; padding: 10px; background-color: ${tipoAtivo === 'cartao' ? '#00E676' : '#1E1E1E'}; border: 1px solid #2C2C2C; border-radius: 20px; color: ${tipoAtivo === 'cartao' ? '#000' : '#B3B3B3'}; font-weight: bold; font-size: 13px; cursor: pointer;">
                    💳 Cartão
                </button>
                <button id="pilula-emprestimo" style="flex: 1; padding: 10px; background-color: ${tipoAtivo === 'emprestimo' ? '#00E676' : '#1E1E1E'}; border: 1px solid #2C2C2C; border-radius: 20px; color: ${tipoAtivo === 'emprestimo' ? '#000' : '#B3B3B3'}; font-weight: bold; font-size: 13px; cursor: pointer;">
                    🏦 Empréstimo
                </button>
            </div>
            <div id="formulario-dinamico-campos"></div>
        `;

        // Vincula as ações de troca de pílula
        document.getElementById('pilula-conta').addEventListener('click', () => { tipoAtivo = 'conta'; montarEstruturaGaveta(); });
        document.getElementById('pilula-cartao').addEventListener('click', () => { tipoAtivo = 'cartao'; montarEstruturaGaveta(); });
        document.getElementById('pilula-emprestimo').addEventListener('click', () => { tipoAtivo = 'emprestimo'; montarEstruturaGaveta(); });

        // Renderiza os campos de fato
        gerarCamposFormulario();
    }

    // 3. GERA OS CAMPOS ESPECÍFICOS (TOTALMENTE ZERADOS)
    function gerarCamposFormulario() {
        const container = document.getElementById('formulario-dinamico-campos');
        
        // Puxa as listas reais do banco de dados (Cadastros.js)
        let pessoas = ['Casa'];
        let cartoes = [];
        try {
            if (typeof Cadastros !== 'undefined') {
                pessoas = Cadastros.obterPessoas();
                cartoes = Cadastros.obterCartoes();
            }
        } catch (e) { console.error(e); }

        let opcoesResponsaveis = pessoas.map(p => `<option value="${p}">${p}</option>`).join('');
        let opcoesCartoes = cartoes.map(c => `<option value="${c}">${c}</option>`).join('');
        opcoesCartoes += `<option value="__NOVO__" style="color: #00E676;">+ Cadastrar Novo Cartão</option>`;

        let htmlCampos = '';

        if (tipoAtivo === 'conta') {
            htmlCampos = `
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Nome da Conta</label>
                    <input type="text" id="campo-descricao" placeholder="Ex: Conta de Luz" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Valor (R$)</label>
                    <input type="number" id="campo-valor" placeholder="0.00" step="0.01" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Responsável</label>
                    <select id="campo-responsavel" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                        ${opcoesResponsaveis}
                    </select>
                </div>
            `;
        } else if (tipoAtivo === 'cartao') {
            htmlCampos = `
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Cartão de Crédito</label>
                    <select id="campo-cartao" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                        <option value="">Selecione...</option>
                        ${opcoesCartoes}
                    </select>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Descrição da Compra</label>
                    <input type="text" id="campo-descricao" placeholder="Ex: Supermercado" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                </div>
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <div style="flex: 2;">
                        <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Valor Total</label>
                        <input type="number" id="campo-valor" placeholder="0.00" step="0.01" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Parcelas</label>
                        <input type="number" id="campo-parcelas" placeholder="1" min="1" value="1" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                    </div>
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Responsável</label>
                    <select id="campo-responsavel" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                        ${opcoesResponsaveis}
                    </select>
                </div>
            `;
        } else if (tipoAtivo === 'emprestimo') {
            htmlCampos = `
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Descrição do Empréstimo</label>
                    <input type="text" id="campo-descricao" placeholder="Ex: Financiamento" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                </div>
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Valor da Parcela Fixa</label>
                        <input type="number" id="campo-valor-parcela" placeholder="0.00" step="0.01" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Qtd Parcelas</label>
                        <input type="number" id="campo-parcelas" placeholder="12" min="1" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                    </div>
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Responsável</label>
                    <select id="campo-responsavel" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                        ${opcoesResponsaveis}
                    </select>
                </div>
            `;
        }

        htmlCampos += `
            <button id="btn-salvar-gasto" style="width: 100%; padding: 15px; background-color: #00E676; border: none; border-radius: 12px; color: #000; font-weight: bold; font-size: 16px; cursor: pointer;">
                Salvar Lançamento
            </button>
        `;

        container.innerHTML = htmlCampos;

        // ATIVA OS EVENTOS DOS CAMPOS CRIADOS DINAMICAMENTE
        const campoCartao = document.getElementById('campo-cartao');
        if (campoCartao) {
            campoCartao.addEventListener('change', () => {
                if (campoCartao.value === '__NOVO__') {
                    const novoNome = prompt("Digite o nome do novo Cartão de Crédito:");
                    if (novoNome && novoNome.trim()) {
                        if (typeof Cadastros !== 'undefined') {
                            Cadastros.adicionarCartao(novoNome);
                            gerarCamposFormulario(); // Atualiza apenas o formulário interno
                        }
                    } else {
                        campoCartao.value = '';
                    }
                }
            });
        }

        document.getElementById('btn-salvar-gasto').addEventListener('click', salvarMovimento);
    }

    // 4. LÓGICA DE SALVAMENTO SEM FALHAS
    function salvarMovimento() {
        const descricaoElement = document.getElementById('campo-descricao');
        const responsavelElement = document.getElementById('campo-responsavel');

        if (!descricaoElement || !descricaoElement.value.trim()) {
            alert("Atenção: Digite uma descrição para o gasto.");
            return;
        }

        const descricao = descricaoElement.value.trim();
        const responsavel = responsavelElement ? responsavelElement.value : 'Casa';
        const dataAtual = new Date();

        let valorTotal = 0;
        let parcelas = 1;
        let cartaoNome = '';

        if (tipoAtivo === 'conta') {
            const valElement = document.getElementById('campo-valor');
            valorTotal = valElement ? parseFloat(valElement.value) : 0;
        } else if (tipoAtivo === 'cartao') {
            const cartElement = document.getElementById('campo-cartao');
            const valElement = document.getElementById('campo-valor');
            const parcElement = document.getElementById('campo-parcelas');

            cartaoNome = cartElement ? cartElement.value : '';
            valorTotal = valElement ? parseFloat(valElement.value) : 0;
            parcelas = parcElement ? parseInt(parcElement.value) : 1;

            if (!cartaoNome || cartaoNome === '__NOVO__') {
                alert("Atenção: Selecione um cartão de crédito válido.");
                return;
            }
        } else if (tipoAtivo === 'emprestimo') {
            const vpElement = document.getElementById('campo-valor-parcela');
            const parcElement = document.getElementById('campo-parcelas');

            const valorParcelaFixa = vpElement ? parseFloat(vpElement.value) : 0;
            parcelas = parcElement ? parseInt(parcElement.value) : 1;
            valorTotal = valorParcelaFixa * parcelas;
        }

        if (isNaN(valorTotal) || valorTotal <= 0) {
            alert("Atenção: Digite um valor válido maior que zero.");
            return;
        }

        // Criando o registro financeiro limpo
        const novoGasto = {
            id: Date.now(),
            tipo: tipoAtivo,
            descricao: descricao,
            valorTotal: valorTotal,
            parcelas: parcelas,
            responsavel: responsavel,
            cartaoNome: cartaoNome,
            mesInicio: dataAtual.getMonth(),
            anoInicio: dataAtual.getFullYear()
        };

        // Escrita direta e à prova de falhas no banco local
        try {
            if (typeof CalculoFinanceiro !== 'undefined') {
                CalculoFinanceiro.adicionarGasto(novoGasto);
            } else {
                const armazenados = localStorage.getItem('financas_lancamentos');
                const lista = armazenados ? JSON.parse(armazenados) : [];
                lista.push(novoGasto);
                localStorage.setItem('financas_lancamentos', JSON.stringify(lista));
            }
        } catch (e) {
            alert("Erro físico ao salvar dados no celular.");
            return;
        }

        // Fecha a gaveta com sucesso
        gaveta.classList.add('escondida');

        // Renderiza as modificações ou força o navegador a atualizar
        if (window.atualizarTelaFinanceira) {
            window.atualizarTelaFinanceira();
        } else {
            window.location.reload();
        }
    }
});

