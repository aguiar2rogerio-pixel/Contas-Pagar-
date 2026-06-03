// =================================================================
// Telas.js - Formulários Inteligentes com Cadastro e Vencimentos
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    const btnAbrirLancamento = document.getElementById('btn-abrir-lancamento');
    const gaveta = document.getElementById('gaveta-lancamento');
    const btnFecharGaveta = document.getElementById('fechar-gaveta');
    const corpoGaveta = document.getElementById('corpo-gaveta');

    let tipoAtivo = 'conta'; 

    // Navegação Inferior
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

        let opcoesResponsaveis = pessoas.map(p => `<option value="${p}">${p}</option>`).join('');
        
        let opcoesCartoes = cartoes.map(c => `<option value="${c.nome}">${c.nome} (venc. dia ${c.vencimento})</option>`).join('');
        opcoesCartoes += `<option value="__NOVO_CARTAO__" style="color: #00E676;">+ Cadastrar Novo Cartão</option>`;

        let opcoesConsumos = consumos.map(c => `<option value="${c.nome}">${c.nome} (venc. dia ${c.vencimentoPadrao})</option>`).join('');
        opcoesConsumos += `<option value="__NOVO_CONSUMO__" style="color: #00E676;">+ Cadastrar Nova Conta</option>`;

        let opcoesEmprestimos = emprestimos.map(e => `<option value="${e.nome}">${e.nome} (venc. dia ${e.vencimentoPadrao})</option>`).join('');
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
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Dia de Vencimento Manual (Opcional)</label>
                    <input type="number" id="campo-vencimento-manual" placeholder="Ex: 10" min="1" max="31" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Responsável</label>
                    <select id="campo-responsavel" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
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
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Descrição do Gasto no Cartão</label>
                    <input type="text" id="campo-descricao-avulsa" placeholder="Ex: Supermercado" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
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
                        ${opcoesResponsaveis}
                    </select>
                </div>
            `;
        } else if (tipoAtivo === 'emprestimo') {
            container.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Selecione o Contrato de Empréstimo</label>
                    <select id="campo-selecao-item" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                        <option value="">Escolha um contrato...</option>
                        ${opcoesEmprestimos}
                    </select>
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

        container.innerHTML += `
            <button id="btn-salvar-gasto" style="width: 100%; padding: 15px; background-color: #00E676; border: none; border-radius: 12px; color: #000; font-weight: bold; font-size: 16px; cursor: pointer;">
                Salvar Lançamento
            </button>
        `;

        configurarEventosMenus();
    }

    function configurarEventosMenus() {
        const seletor = document.getElementById('campo-selecao-item');
        if (!seletor) return;

        seletor.addEventListener('change', () => {
            const val = seletor.value;
            if (val === '__NOVO_CARTAO__') {
                const nome = prompt("Nome do Cartão (Ex: Nu Bank):");
                const fechamento = prompt("Dia do Fechamento da fatura (Ex: 5):");
                const vencimento = prompt("Dia do Vencimento da fatura (Ex: 12):");
                if (nome && fechamento && vencimento) {
                    Cadastros.adicionarCartao(nome, fechamento, vencimento);
                    gerarCamposFormulario();
                } else { seletor.value = ''; }
            } else if (val === '__NOVO_CONSUMO__') {
                const nome = prompt("Nome da Conta de Consumo (Ex: Conta de Luz EDP):");
                const vencimento = prompt("Dia do Vencimento Padrão (Ex: 10):");
                if (nome && vencimento) {
                    Cadastros.adicionarTipoConsumo(nome, vencimento);
                    gerarCamposFormulario();
                } else { seletor.value = ''; }
            } else if (val === '__NOVO_EMPRESTIMO__') {
                const nome = prompt("Nome do Empréstimo/Contrato (Ex: Caixa Construção):");
                const vencimento = prompt("Dia de Vencimento da Parcela (Ex: 20):");
                if (nome && vencimento) {
                    Cadastros.adicionarContratoEmprestimo(nome, vencimento);
                    gerarCamposFormulario();
                } else { seletor.value = ''; }
            }
        });

        const btn = document.getElementById('btn-salvar-gasto');
        if (btn) btn.addEventListener('click', processarFormularioFinal);
    }

    function processarFormularioFinal() {
        const seletor = document.getElementById('campo-selecao-item');
        const respElement = document.getElementById('campo-responsavel');
        
        if (!seletor || !seletor.value) {
            alert("Por favor, selecione um item no menu.");
            return;
        }

        const itemSelecionado = seletor.value;
        const responsavel = respElement ? respElement.value : 'Casa';
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
            
            const cInfo = Cadastros.obterTiposConsumo().find(c => c.nome === itemSelecionado);
            diaVencimentoDefinido = cInfo ? cInfo.vencimentoPadrao : 10;
            
            if (vManualE && vManualE.value) {
                diaVencimentoDefinido = parseInt(vManualE.value);
            }
        } else if (tipoAtivo === 'cartao') {
            cartaoNome = itemSelecionado;
            const descAvulsaE = document.getElementById('campo-descricao-avulsa');
            const valE = document.getElementById('campo-valor');
            const parcE = document.getElementById('campo-parcelas');

            descricao = descAvulsaE && descAvulsaE.value.trim() ? descAvulsaE.value.trim() : "Compra Cartão";
            valorTotal = valE ? parseFloat(valE.value) : 0;
            parcelas = parcE ? parseInt(parcE.value) : 1;

            const cartaoInfo = Cadastros.obterCartoes().find(c => c.nome === itemSelecionado);
            if (cartaoInfo) {
                const diaHoje = dataAtual.getDate();
                if (diaHoje > cartaoInfo.fechamento) {
                    dataAtual.setMonth(dataAtual.getMonth() + 1);
                }
                diaVencimentoDefinido = cartaoInfo.vencimento;
            }
        } else if (tipoAtivo === 'emprestimo') {
            const vpE = document.getElementById('campo-valor-parcela');
            const parcE = document.getElementById('campo-parcelas');

            const vParcela = vpE ? parseFloat(vpE.value) : 0;
            parcelas = parcE ? parseInt(parcE.value) : 1;
            valorTotal = vParcela * parcelas;

            const empInfo = Cadastros.obterContratosEmprestimo().find(e => e.nome === itemSelecionado);
            diaVencimentoDefinido = empInfo ? empInfo.vencimentoPadrao : 20;
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

        if (typeof CalculoFinanceiro !== 'undefined') {
            CalculoFinanceiro.adicionarGasto(novoGasto);
        } else {
            const lista = JSON.parse(localStorage.getItem('financas_lancamentos') || '[]');
            lista.push(novoGasto);
            localStorage.setItem('financas_lancamentos', JSON.stringify(lista));
        }

        gaveta.classList.add('escondida');
        if (window.atualizarTelaFinanceira) window.atualizarTelaFinanceira();
        else window.location.reload();
    }
});

