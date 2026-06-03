// =================================================================
// Historico.js - Renderização de Listas, Faturas e Rateio na Tela
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. DATA CONTROL (Inicia no mês e ano atuais)
    let dataAtual = new Date();
    let mesAtual = dataAtual.getMonth(); // 0 = Janeiro, 5 = Junho...
    let anoAtual = dataAtual.getFullYear();

    const nomesMeses = [
        "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
        "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
    ];

    // Elementos do Topo
    const txtMesAtual = document.getElementById('mes-atual');
    const btnAnterior = document.getElementById('btn-mes-anterior');
    const btnProximo = document.getElementById('btn-mes-proximo');
    const txtTotalGeral = document.getElementById('total-geral-mes');

    // Elementos das Abas
    const listaPrioridades = document.getElementById('lista-prioridades');
    const listaFaturas = document.getElementById('lista-faturas-cartoes');
    const gradeRateio = document.getElementById('grade-rateio');

    // 2. FUNÇÃO PRINCIPAL: ATUALIZAR A INTERFACE
    function atualizarInterface() {
        // Atualiza o texto do topo (Ex: JUNHO 2026)
        txtMesAtual.textContent = `${nomesMeses[mesAtual]} ${anoAtual}`;

        // Puxa os dados mastigados do motor matemático
        const resumo = CalculoFinanceiro.calcularResumoDoMes(mesAtual, anoAtual);

        // A. Atualiza o Total Geral do Mês
        txtTotalGeral.textContent = `R$ ${resumo.totalGeral.toFixed(2).replace('.', ',')}`;

        // B. Desenha a Lista de Contas (Aba 1)
        listaPrioridades.innerHTML = '';
        if (resumo.listaContas.length === 0) {
            listaPrioridades.innerHTML = `<div style="color: #B3B3B3; font-size: 14px; text-align: center; padding: 20px;">Nenhuma conta para este mês.</div>`;
        } else {
            resumo.listaContas.forEach(item => {
                const tipoIcone = item.tipo === 'cartao' ? '💳' : item.tipo === 'emprestimo' ? '🏦' : '📄';
                const subTexto = item.tipo === 'cartao' ? `${item.cartaoNome} • Parcela ${item.parcelaAtual}/${item.parcelasTotais}` : `Parcela ${item.parcelaAtual}/${item.parcelasTotais}`;
                
                listaPrioridades.innerHTML += `
                    <div class="card-item">
                        <div>
                            <span style="font-size: 16px; font-weight: bold; display: block;">${tipoIcone} ${item.descricao}</span>
                            <span style="font-size: 12px; color: #B3B3B3;">${subTexto} [${item.responsavel}]</span>
                        </div>
                        <div style="font-size: 16px; font-weight: bold; color: #FFF;">
                            R$ ${item.valorParcela.toFixed(2).replace('.', ',')}
                        </div>
                    </div>
                `;
            });
        }

        // C. Desenha as Faturas dos Cartões (Aba 1)
        listaFaturas.innerHTML = '';
        const marcasCartoes = Object.keys(resumo.cartoes);
        if (marcasCartoes.length === 0) {
            listaFaturas.innerHTML = `<div style="color: #B3B3B3; font-size: 14px; text-align: center; padding: 20px;">Nenhuma fatura de cartão.</div>`;
        } else {
            marcasCartoes.forEach(cartao => {
                listaFaturas.innerHTML += `
                    <div class="card-item">
                        <span style="font-size: 16px; font-weight: bold;">💳 Fatura ${cartao}</span>
                        <span style="font-size: 16px; font-weight: bold; color: #00E676;">
                            R$ ${resumo.cartoes[cartao].toFixed(2).replace('.', ',')}
                        </span>
                    </div>
                `;
            });
        }

        // D. Desenha os Blocos de Rateio por Responsável (Aba 2)
        gradeRateio.innerHTML = '';
        const responsaveis = Object.keys(resumo.rateio);
        if (responsaveis.length === 0) {
            gradeRateio.innerHTML = `<div style="color: #B3B3B3; font-size: 14px; text-align: center; padding: 20px;">Nenhum rateio gerado.</div>`;
        } else {
            responsaveis.forEach(resp => {
                gradeRateio.innerHTML += `
                    <div class="card-item" style="border-left: 4px solid #00E676;">
                        <div>
                            <span style="font-size: 16px; font-weight: bold; display: block;">👤 ${resp}</span>
                            <span style="font-size: 12px; color: #B3B3B3;">Total de responsabilidade</span>
                        </div>
                        <div style="font-size: 18px; font-weight: bold; color: #00E676;">
                            R$ ${resumo.rateio[resp].toFixed(2).replace('.', ',')}
                        </div>
                    </div>
                `;
            });
        }
    }

    // 3. CONTROLE DOS BOTÕES DE MUDANÇA DE MÊS
    btnAnterior.addEventListener('click', () => {
        if (mesAtual === 0) {
            mesAtual = 11;
            anoAtual--;
        } else {
            mesAtual--;
        }
        atualizarInterface();
    });

    btnProximo.addEventListener('click', () => {
        if (mesAtual === 11) {
            mesAtual = 0;
            anoAtual++;
        } else {
            mesAtual++;
        }
        atualizarInterface();
    });

    // Executa a primeira renderização ao abrir o app
    atualizarInterface();

    // Torna a função disponível globalmente para que outros arquivos (como o de lançamento) possam atualizar a tela
    window.atualizarTelaFinanceira = atualizarInterface;
});

