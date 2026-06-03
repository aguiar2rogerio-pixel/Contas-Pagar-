// =================================================================
// Telas.js - Controle de Abas, Gavetas e Interface Dinâmica
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. INICIALIZAÇÃO DE ELEMENTOS DA TELA
    const botoesNavegacao = document.querySelectorAll('.nav-item');
    const abas = document.querySelectorAll('.secao-aba');
    const btnAbrirLancamento = document.getElementById('btn-abrir-lancamento');
    const gaveta = document.getElementById('gaveta-lancamento');
    const btnFecharGaveta = document.getElementById('fechar-gaveta');
    const corpoGaveta = document.getElementById('corpo-gaveta');

    // 2. CONTROLE DAS ABAS INFERIORES (Painel <-> Rateio)
    botoesNavegacao.forEach(botao => {
        botao.addEventListener('click', () => {
            // Remove a classe 'ativo' de todos os botões e adiciona no clicado
            botoesNavegacao.forEach(b => b.classList.remove('ativo'));
            botao.classList.add('ativo');

            // Descobre qual aba deve mostrar baseado no atributo 'data-aba'
            const targetAba = botao.getAttribute('data-aba');

            // Esconde todas as abas e mostra apenas a selecionada
            abas.forEach(aba => {
                if (aba.id === targetAba) {
                    aba.classList.remove('aba-escondida');
                } else {
                    aba.classList.add('aba-escondida');
                }
            });
        });
    });

    // 3. CONTROLE DE ABRIR E FECHAR A GAVETA DE LANÇAMENTO
    btnAbrirLancamento.addEventListener('click', () => {
        // Quando abre, desenha o formulário inicial
        desenharFormularioInicial();
        gaveta.classList.remove('escondida');
    });

    btnFecharGaveta.addEventListener('click', () => {
        gaveta.classList.add('escondida');
    });

    // Fecha a gaveta se clicar no fundo escuro fora dela
    gaveta.addEventListener('click', (e) => {
        if (e.target === gaveta) {
            gaveta.classList.add('escondida');
        }
    });

    // 4. FUNÇÃO PARA DESENHAR O FORMULÁRIO DENTRO DA GAVETA
    // Esta função recria os botões idênticos aos das suas capturas de tela
    function desenharFormularioInicial() {
        corpoGaveta.innerHTML = `
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <button id="btn-tipo-cartao" style="flex: 1; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #B3B3B3; font-weight: bold; cursor: pointer;">
                    💳 Cartão de Crédito
                </button>
                <button id="btn-tipo-conta" style="flex: 1; padding: 12px; background-color: #1E1E1E; border: 2px solid #00E676; border-radius: 8px; color: #00E676; font-weight: bold; cursor: pointer;">
                    📄 Conta de Consumo
                </button>
            </div>

            <div id="campos-dinamicos-formulario">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Descrição do Gasto</label>
                    <input type="text" value="Conta EDP" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Valor do Lançamento</label>
                    <input type="number" value="400" style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 1px solid #2C2C2C; border-radius: 8px; color: #FFF; font-size: 16px;">
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; color: #B3B3B3; margin-bottom: 5px;">Quem gastou / Responsável?</label>
                    <select style="width: 100%; padding: 12px; background-color: #1E1E1E; border: 2px solid #FFA000; border-radius: 8px; color: #FFF; font-size: 16px; appearance: none;">
                        <option>Casa</option>
                        <option>Isabelli</option>
                        <option>Daniela</option>
                    </select>
                </div>

                <button style="width: 100%; padding: 15px; background-color: #00E676; border: none; border-radius: 12px; color: #000; font-weight: bold; font-size: 16px; cursor: pointer;">
                    Salvar Lançamento
                </button>
            </div>
        `;

        // Adiciona os eventos para mudar os campos caso clique em Cartão ou Conta
        configurarCliquesFormulario();
    }

    function configurarCliquesFormulario() {
        const btnCartao = document.getElementById('btn-tipo-cartao');
        const btnConta = document.getElementById('btn-tipo-conta');
        
        btnCartao.addEventListener('click', () => {
            // Estiliza os botões mudando o destaque para o Cartão
            btnCartao.style.border = "2px solid #00E676";
            btnCartao.style.color = "#00E676";
            btnConta.style.border = "1px solid #2C2C2C";
            btnConta.style.color = "#B3B3B3";
            
            // Aqui no futuro, chamamos a lógica de abrir a sub-gaveta 
            // de escolher cartões (Casas Bahia, Nu Bank...) e depois parcelas
            console.log("Mudou para modo Cartão de Crédito. Próximo passo: Escolher Cartão.");
        });

        btnConta.addEventListener('click', () => {
            // Volta o destaque para a Conta de Consumo
            btnConta.style.border = "2px solid #00E676";
            btnConta.style.color = "#00E676";
            btnCartao.style.border = "1px solid #2C2C2C";
            btnCartao.style.color = "#B3B3B3";
            
            desenharFormularioInicial();
        });
    }
});

