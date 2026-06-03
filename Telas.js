// =================================================================
// Telas.js - Cadastro Simplificado, Responsável Dinâmico e Correção de Salvamento
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    const btnAbrirLancamento = document.getElementById('btn-abrir-lancamento');
    const gaveta = document.getElementById('gaveta-lancamento');
    const btnFecharGaveta = document.getElementById('fechar-gaveta');
    const corpoGaveta = document.getElementById('corpo-gaveta');

    let tipoAtivo = 'conta'; 

    // Navegação de Abas Inferiores
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

    if (btnAbrirLancamento) {
        btnAbrirLancamento.addEventListener('click', () => {
            tipoAtivo = 'conta';
            montarEstruturaGaveta();
            gaveta.classList.remove('escondida');
        });
    }
    if (btnFecharGaveta) btnFecharGaveta.addEventListener('click', () => gaveta.classList.add('escondida'));

    function montarEstruturaGaveta() {
        corpoGaveta.innerHTML = `
            <div style="display: flex; gap: 8px; margin-bottom: 20px;">
                <button id="pilula-conta" style="flex: 1; padding: 10px; background-color: ${tipoAtivo === 'conta' ? '#00E676' : '#1E1E1E'}; border: 1px solid #2C2C2C; border-radius: 20px; color: ${tipoAtivo === 'conta' ? '#000' : '#B3B3B3'}; font-weight: bold; font-size: 13px; cursor: pointer;">📄 Consumo</button>
                <button id="pilula-cartao" style="flex: 1; padding: 10px; background-color: ${tipoAtivo === 'cartao' ? '#00E676' : '#1E1E1E'}; border: 1px solid #2C2C2C; border-radius: 20px; color: ${tipoAtivo === 'cartao' ? '#000' : '#B3B3B3'}; font-weight: bold; font-size: 13px; cursor: pointer;">💳 Cartão</button>
                <button id="pilula-emprestimo" style="flex: 1; padding: 10px; background-color: ${tipoAtivo === 'emprestimo' ? '#00E676' : '#1E1E1E'}; border: 1px solid #2C2C2C; border-radius: 20px; color: ${tipoAtivo === 'emprestimo' ? '#000' : '#B3B3B3'}; font-weight: bold; font-size: 13px; cursor: pointer;">🏦 Empréstimo</button>
            </div>
            <div id="formulario-dinamico-campos"></div>
        `;

        document.getElementById('pilula-conta').addEventListener('click', () => { tipoAtivo = 'conta'; montarEstruturaGaveta(); });
        document.getElementById('pilula-cartao').addEventListener('click', () => { tipoAtivo = 'cartao'; montarEstruturaGaveta(); });
        document.getElementById('pilula-emprestimo').addEventListener('click', () => { tipoAtivo = 'emprestimo'; montarEstruturaGaveta(); });

        gerarCamposFormulario();
    }

    function gerarCamposFormulario() {
        const container = document.getElementById('formulario-dinamico-campos');
        
        let pessoas = ['Casa'];
        let cartoes = [];
        let consumos = [];
        let emprestimos = [];

        try {
            if (typeof Cadastros !== 'undefined') {
                pessoas = Cadastros.obterPessoas();
                cartoes = Cadastros.obterCartoes();
                consumos = Cadastros.obterTiposConsumo();
                emprestimos = Cadastros.obterContratosEmprestimo();
            }
        } catch (e) { console.error(e); }

        // Montagem das Opções com Inclusão de Novos Itens Dinâmicos
        let opcoesResponsaveis = pessoas.map(p => `<option value="${p}">${p}</option>`).join('');
        opcoesResponsaveis += `<option value="__NOVO_RESPONSAVEL__" style="color: #00E676;">+ Cadastrar Novo Responsável</option>`;
        
        let opcoesCartoes = cartoes.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('');
        opcoesCartoes += `<option value="__NOVO_CARTAO__" style="color: #00E676;">+ Cadastrar Novo Cartão</option>`;

        let opcoesConsumos = consumos.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('');
        opcoesConsumos += `<option value="__NOVO_CONSUMO__" style="color: #00E676;">+ Cadastrar Nova Conta</option>`;

        let opcoesEmprestimos = emprestimos.map(e => `<option value="${e.nome}">${e.nome}</option>`).join('');
        opcoesEmprestimos += `<option value="__NOVO_EMPRESTIMO__" style="color: #00E676;">+ Cadastrar Novo Empréstimo</option>`;

        if (tipoAtivo === 'conta') {
            container.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Selecione a Conta de Consumo</label>
                    <select id="campo-selecao-item" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                        <option value="">Escolha uma conta...</option>
                        ${opcoesConsumos}
                    </select>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Valor da Conta (R$)</label>
                    <input type="number" id="campo-valor" placeholder="0.00" step="0.01" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Dia de Vencimento desta Conta</label>
                    <input type="number" id="campo-vencimento-manual" placeholder="Ex: 10" min="1" max="31" value="10" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Responsável</label>
                    <select id="campo-responsavel" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                        <option value="">Selecione...</option>
                        ${opcoesResponsaveis}
                    </select>
                </div>
            `;
        } else if (tipoAtivo === 'cartao') {
            container.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Selecione o Cartão</label>
                    <select id="campo-selecao-item" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                        <option value="">Escolha um cartão...</option>
                        ${opcoesCartoes}
                    </select>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Descrição da Compra</label>
                    <input type="text" id="campo-descricao-avulsa" placeholder="Ex: Supermercado, Posto" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                </div>
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <div style="flex: 2;">
                        <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Valor Total</label>
                        <input type="number" id="campo-valor" placeholder="0.00" step="0.01" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Parcelas</label>
                        <input type="number" id="campo-parcelas" min="1" value="1" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                    </div>
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Responsável</label>
                    <select id="campo-responsavel" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                        <option value="">Selecione...</option>
                        ${opcoesResponsaveis}
                    </select>
                </div>
            `;
        } else if (tipoAtivo === 'emprestimo') {
            container.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Selecione o Contrato</label>
                    <select id="campo-selecao-item" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                        <option value="">Escolha um contrato...</option>
                        ${opcoesEmprestimos}
                    </select>
                </div>
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Valor da Parcela</label>
                        <input type="number" id="campo-valor-parcela" placeholder="0.00" step="0.01" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Qtd Parcelas</label>
                        <input type="number" id="campo-parcelas" placeholder="12" value="12" min="1" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                    </div>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Dia de Vencimento da Parcela</label>
                    <input type="number" id="campo-vencimento-manual" placeholder="Ex: 20" min="1" max="31" value="20" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Responsável</label>
                    <select id="campo-responsavel" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                        <option value="">Selecione...</option>
                        ${opcoesResponsaveis}
                    </select>
                </div>
            `;
        }

        container.innerHTML += `
            <button id="btn-salvar-gasto" style="width: 100%; padding: 15px; background-color: #00E676; border: none; border-radius: 12px; color: #000; font-weight: bold; font-size: 16px; cursor: pointer;">
                Salvar Lançamento
            </button>
        `;

        configurarEventosMenus();
    }

    function configurarEventosMenus() {
        const seletor = document.getElementById('campo-selecao-item');
        const seletorResp = document.getElementById('campo-responsavel');

        if (seletor) {
            seletor.addEventListener('change', () => {
                const val = seletor.value;
                if (val === '__NOVO_CARTAO__') {
                    const nome = prompt("Nome do Cartão (Ex: Nu Bank):");
                    const fechamento = prompt("Dia do Fechamento (Ex: 5):");
                    const vencimento = prompt("Dia do Vencimento (Ex: 12):");
                    if (nome && fechamento && vencimento) {
                        Cadastros.adicionarCartao(nome, fechamento, vencimento);
                        gerarCamposFormulario();
                    } else { seletor.value = ''; }
                } else if (val === '__NOVO_CONSUMO__') {
                    const nome = prompt("Nome da Conta de Consumo (Ex: Conta de Luz EDP):");
                    if (nome) {
                        Cadastros.adicionarTipoConsumo(nome);
                        gerarCamposFormulario();
                    } else { seletor.value = ''; }
                } else if (val === '__NOVO_EMPRESTIMO__') {
                    const nome = prompt("Nome do Empréstimo (Ex: Caixa Construção):");
                    if (nome) {
                        Cadastros.adicionarContratoEmprestimo(nome);
                        gerarCamposFormulario();
                    } else { seletor.value = ''; }
                }
            });
        }

        if (seletorResp) {
            seletorResp.addEventListener('change', () => {
                if (seletorResp.value === '__NOVO_RESPONSAVEL__') {
                    const nome = prompt("Nome do Novo Responsável (Ex: Rogério):");
                    if (nome && nome.trim()) {
                        Cadastros.adicionarPessoa(nome);
                        gerarCamposFormulario();
                    } else { seletorResp.value = ''; }
                }
            });
        }

        const btn = document.getElementById('btn-salvar-gasto');
        if (btn) btn.addEventListener('click', processarFormularioFinal);
    }

    function processarFormularioFinal() {
        const seletor = document.getElementById('campo-selecao-item');
        const respElement = document.getElementById('campo-responsavel');
        
        if (!seletor || !seletor.value || seletor.value.startsWith('__')) {
            alert("Por favor, selecione um item válido no menu.");
            return;
        }

        if (!respElement || !respElement.value || respElement.value.startsWith('__')) {
            alert("Por favor, selecione um Responsável.");
            return;
        }

        const itemSelecionado = seletor.value;
        const responsavel = respElement.value;
        const dataAtual = new Date();
        
        let descricao = itemSelecionado;
        let valorTotal = 0;
        let parcelas = 1;
        let cartaoNome = '';
        let diaVencimentoDefinido = 10;

        if (tipoAtivo === 'conta') {
            const valE = document.getElementById('campo-valor');
            const vManualE = document.getElementById('campo-vencimento-manual');
            
            valorTotal = valE ? parseFloat(valE.value) : 0;
            diaVencimentoDefinido = vManualE && vManualE.value ? parseInt(vManualE.value) : 10;
            
        } else if (tipoAtivo === 'cartao') {
            cartaoNome = itemSelecionado;
            const descAvulsaE = document.getElementById('campo-descricao-avulsa');
            const valE = document.getElementById('campo-valor');
            const parcE = document.getElementById('campo-parcelas');

            descricao = descAvulsaE && descAvulsaE.value.trim() ? descAvulsaE.value.trim() : `Compra no ${cartaoNome}`;
            valorTotal = valE ? parseFloat(valE.value) : 0;
            parcelas = parcE ? parseInt(parcE.value) : 1;

            // Lógica Inteligente de Cartão (Sincroniza com as datas cadastradas do cartão)
            const cartaoInfo = Cadastros.obterCartoes().find(c => c.nome === itemSelecionado);
            if (cartaoInfo) {
                const diaHoje = dataAtual.getDate();
                if (diaHoje > cartaoInfo.fechamento) {
                    dataAtual.setMonth(dataAtual.getMonth() + 1); // Joga pra fatura seguinte
                }
                diaVencimentoDefinido = cartaoInfo.vencimento;
            } else {
                diaVencimentoDefinido = 10;
            }
        } else if (tipoAtivo === 'emprestimo') {
            const vpE = document.getElementById('campo-valor-parcela');
            const parcE = document.getElementById('campo-parcelas');
            const vManualE = document.getElementById('campo-vencimento-manual');

            const vParcela = vpE ? parseFloat(vpE.value) : 0;
            parcelas = parcE ? parseInt(parcE.value) : 1;
            valorTotal = vParcela * parcelas;
            diaVencimentoDefinido = vManualE && vManualE.value ? parseInt(vManualE.value) : 20;
        }

        if (isNaN(valorTotal) || valorTotal <= 0) {
            alert("Insira um valor válido maior que zero.");
            return;
        }

        const novoGasto = {
            id: Date.now(),
            tipo: tipoAtivo,
            descricao: descricao,
            valorTotal: valorTotal,
            parcelas: parcelas,
            responsavel: responsavel,
            cartaoNome: cartaoNome,
            diaVencimento: diaVencimentoDefinido,
            mesInicio: dataAtual.getMonth(),
            anoInicio: dataAtual.getFullYear()
        };

        // Salva de Verdade no LocalStorage
        if (typeof CalculoFinanceiro !== 'undefined') {
            CalculoFinanceiro.adicionarGasto(novoGasto);
        } else {
            const lista = JSON.parse(localStorage.getItem('financas_lancamentos') || '[]');
            lista.push(novoGasto);
            localStorage.setItem('financas_lancamentos', JSON.stringify(lista));
        }

        // Fecha a Gaveta e Atualiza a Interface sem fingimento!
        gaveta.classList.add('escondida');
        if (window.atualizarTelaFinanceira) {
            window.atualizarTelaFinanceira();
        } else {
            window.location.reload();
        }
    }
});
