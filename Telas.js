// =================================================================
// Telas.js - Controle de Abas, Gavetas e Formulários Dinâmicos (CORRIGIDO)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. ELEMENTOS DA TELA PRINCIPAL
    const botoesNavegacao = document.querySelectorAll('.nav-item');
    const abas = document.querySelectorAll('.secao-aba');
    const btnAbrirLancamento = document.getElementById('btn-abrir-lancamento');
    const gaveta = document.getElementById('gaveta-lancamento');
    const btnFecharGaveta = document.getElementById('fechar-gaveta');
    const corpoGaveta = document.getElementById('corpo-gaveta');

    // Variável para controlar qual pílula está ativa no formulário ('cartao', 'conta' ou 'emprestimo')
    let tipoAtivo = 'cartao'; 

    // 2. CONTROLE DAS ABAS INFERIORES (Painel <-> Rateio)
    botoesNavegacao.forEach(botao => {
        botao.addEventListener('click', () => {
            botoesNavegacao.forEach(b => b.classList.remove('ativo'));
            botao.classList.add('ativo');

            const targetAba = botao.getAttribute('data-aba');
            abas.forEach(aba => {
                if (aba.id === targetAba) {
                    aba.classList.remove('aba-escondida');
                } else {
                    aba.classList.add('aba-escondida');
                }
            });
        });
    });

    // 3. CONTROLE DE ABRIR E FECHAR A GAVETA
    btnAbrirLancamento.addEventListener('click', () => {
        tipoAtivo = 'cartao'; // Sempre nasce na pílula Cartão
        renderizarFormularioGeral();
        gaveta.classList.remove('escondida');
    });

    btnFecharGaveta.addEventListener('click', () => {
        gaveta.classList.add('escondida');
    });

    gaveta.addEventListener('click', (e) => {
        if (e.target === gaveta) gaveta.classList.add('escondida');
    });

    // 4. DESENHAR A ESTRUTURA DO FORMULÁRIO COM AS 3 PÍLULAS
    function renderizarFormularioGeral() {
        corpoGaveta.innerHTML = `
            <div style="display: flex; gap: 8px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 5px;">
                <button id="pilula-cartao" style="flex: 1; padding: 10px 5px; background-color: ${tipoAtivo === 'cartao' ? '#00E676' : '#1E1E1E'}; border: 1px solid #2C2C2C; border-radius: 20px; color: ${tipoAtivo === 'cartao' ? '#000' : '#B3B3B3'}; font-weight: bold; font-size: 13px; cursor: pointer; white-space: nowrap;">
                    💳 Cartão
                </button>
                <button id="pilula-conta" style="flex: 1; padding: 10px 5px; background-color: ${tipoAtivo === 'conta' ? '#00E676' : '#1E1E1E'}; border: 1px solid #2C2C2C; border-radius: 20px; color: ${tipoAtivo === 'conta' ? '#000' : '#B3B3B3'}; font-weight: bold; font-size: 13px; cursor: pointer; white-space: nowrap;">
                    📄 Consumo
                </button>
                <button id="pilula-emprestimo" style="flex: 1; padding: 10px 5px; background-color: ${tipoAtivo === 'emprestimo' ? '#00E676' : '#1E1E1E'}; border: 1px solid #2C2C2C; border-radius: 20px; color: ${tipoAtivo === 'emprestimo' ? '#000' : '#B3B3B3'}; font-weight: bold; font-size: 13px; cursor: pointer; white-space: nowrap;">
                    🏦 Empréstimo
                </button>
            </div>

            <div id="container-campos-especificos"></div>
        `;

        // Ativa os cliques nas pílulas
        document.getElementById('pilula-cartao').addEventListener('click', () => { tipoAtivo = 'cartao'; renderizarFormularioGeral(); });
        document.getElementById('pilula-conta').addEventListener('click', () => { tipoAtivo = 'conta'; renderizarFormularioGeral(); });
        document.getElementById('pilula-emprestimo').addEventListener('click', () => { tipoAtivo = 'emprestimo'; renderizarFormularioGeral(); });

        // Desenha os campos baseados na pílula selecionada
        injetarCamposEspecificos();
    }

    // 5. INJETAR OS CAMPOS EXCLUSIVOS DE CADA PÍLULA
    function injetarCamposEspecificos() {
        const container = document.getElementById('container-campos-especificos');
        
        // Puxa as listas reais do Cadastros.js para montar os menus suspensos
        const listaPessoas = Cadastros.obterPessoas();
        const listaCartoes = Cadastros.obterCartoes();

        // Monta as opções do menu de responsáveis
        let opcoesResponsaveis = listaPessoas.map(p => `<option value="${p}">${p}</option>`).join('');
        
        // Monta as opções do menu de cartões com a opção de cadastrar um novo
        let opcoesCartoes = listaCartoes.map(c => `<option value="${c}">${c}</option>`).join('');
        opcoesCartoes += `<option value="__NOVO__" style="color: #00E676; font-weight: bold;">+ Cadastrar Novo Cartão</option>`;

        let htmlCampos = '';

        if (tipoAtivo === 'cartao') {
            htmlCampos = `
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Escolha o Cartão</label>
                    <select id="campo-cartao" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                        <option value="">Selecione um cartão...</option>
                        ${opcoesCartoes}
                    </select>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Descrição da Compra</label>
                    <input type="text" id="campo-descricao" placeholder="Ex: Mercado" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                </div>
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Valor Total</label>
                        <input type="number" id="campo-valor" placeholder="0.00" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Parcelas</label>
                        <input type="number" id="campo-parcelas" value="1" min="1" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                    </div>
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Responsável pelo Gasto</label>
                    <select id="campo-responsavel" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                        ${opcoesResponsaveis}
                    </select>
                </div>
            `;
        } else if (tipoAtivo === 'conta') {
            htmlCampos = `
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Nome da Conta / Serviço</label>
                    <input type="text" id="campo-descricao" placeholder="Ex: Conta de Luz EDP, Internet" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Valor Estimado ou Confirmado</label>
                    <input type="number" id="campo-valor" placeholder="0.00" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Responsável (Padrão: Casa)</label>
                    <select id="campo-responsavel" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                        ${opcoesResponsaveis}
                    </select>
                </div>
            `;
        } else if (tipoAtivo === 'emprestimo') {
            htmlCampos = `
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Banco / Descrição do Empréstimo</label>
                    <input type="text" id="campo-descricao" placeholder="Ex: Empréstimo Caixa" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                </div>
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Valor da Parcela Fixa</label>
                        <input type="number" id="campo-valor-parcela" placeholder="0.00" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Qtd de Parcelas</label>
                        <input type="number" id="campo-parcelas" placeholder="Ex: 24" min="1" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                    </div>
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Quem assumiu a dívida?</label>
                    <select id="campo-responsavel" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                        ${opcoesResponsaveis}
                    </select>
                </div>
            `;
        }

        // Botão de ação final para salvar
        htmlCampos += `
            <button id="btn-salvar-gasto" style="width: 100%; padding: 15px; background-color: #00E676; border: none; border-radius: 12px; color: #000; font-weight: bold; font-size: 16px; cursor: pointer;">
                Salvar Lançamento
            </button>
        `;

        container.innerHTML = htmlCampos;

        // Configura os ouvintes de eventos específicos dos novos elementos injetados
        configurarAcoesFormulario();
    }

    // 6. ENGENHARIA DE CLIPES: TRATAR CADASTROS RÁPIDOS E SALVAMENTO
    function configurarAcoesFormulario() {
        const campoCartao = document.getElementById('campo-cartao');
        const btnSalvar = document.getElementById('btn-salvar-gasto');

        // Se estiver na pílula cartão, monitora se escolheu "+ Cadastrar Novo Cartão"
        if (campoCartao) {
            campoCartao.addEventListener('change', () => {
                if (campoCartao.value === '__NOVO__') {
                    const novoNome = prompt("Digite o nome do novo Cartão de Crédito:");
                    if (novoNome && novoNome.trim()) {
                        Cadastros.adicionarCartao(novoNome);
                        // Recarrega o formulário para atualizar o menu suspenso com o novo cartão
                        renderizarFormularioGeral();
                    } else {
                        campoCartao.value = ''; // Reseta se cancelar
                    }
                }
            });
        }

        // Evento do Botão Salvar Lançamento
        btnSalvar.addEventListener('click', () => {
            const descricao = document.getElementById('campo-descricao').value;
            const responsavel = document.getElementById('campo-responsavel').value;
            const dataAtual = new Date();

            let valorTotal = 0;
            let parcelas = 1;
            let cartaoNome = '';

            // Captura os dados baseado no tipo ativo
            if (tipoAtivo === 'cartao') {
                cartaoNome = campoCartao.value;
                valorTotal = parseFloat(document.getElementById('campo-valor').value);
                parcelas = parseInt(document.getElementById('campo-parcelas').value) || 1;

                if (!cartaoNome || cartaoNome === '__NOVO__') {
                    alert("Por favor, selecione ou cadastre um cartão válido.");
                    return;
                }
            } else if (tipoAtivo === 'conta') {
                valorTotal = parseFloat(document.getElementById('campo-valor').value);
                parcelas = 1; // Contas de consumo morrem no mês corrente
            } else if (tipoAtivo === 'emprestimo') {
                const valorParcelaFixa = parseFloat(document.getElementById('campo-valor-parcela').value);
                parcelas = parseInt(document.getElementById('campo-parcelas').value) || 1;
                valorTotal = valorParcelaFixa * parcelas; // Calcula o montante total para o motor matemático
            }

            // Validação simples de segurança
            if (!descricao.trim() || isNaN(valorTotal) || valorTotal <= 0) {
                alert("Por favor, preencha a descrição e o valor corretamente.");
                return;
            }

            // Monta o objeto perfeito para o motor do CalculoFinanceiro.js processar
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

            // Salva no cofre do celular
            CalculoFinanceiro.adicionarGasto(novoGasto);
            
            // Fecha a gaveta
            gaveta.classList.add('escondida');

            // MÁGICA: Avisa o arquivo Historico.js para atualizar a tela principal na hora!
            if (window.atualizarTelaFinanceira) {
                window.atualizarTelaFinanceira();
            }
        });
    }
});

