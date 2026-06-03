// =================================================================
// Historico.js - Atualização do Painel Principal por Vencimentos (Corrigido)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    const textoMesAno = document.getElementById('mes-atual');
    const btnMesAnterior = document.getElementById('btn-mes-anterior');
    const btnMesSeguinte = document.getElementById('btn-mes-proximo');
    
    const labelTotalGeral = document.getElementById('total-geral-mes');
    const listaPrioridades = document.getElementById('lista-prioridades');
    const listaFaturas = document.getElementById('lista-faturas-cartoes');
    const containerRateio = document.getElementById('grade-rateio');

    const nomesMeses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    let dataControlador = new Date();
    let mesAtual = dataControlador.getMonth();
    let anoAtual = dataControlador.getFullYear();

    function atualizarPainelVisual() {
        if (textoMesAno) {
            textoMesAno.innerText = `${nomesMeses[mesAtual]} de ${anoAtual}`;
        }

        let resumo = { totalGeral: 0, rateio: {}, cartoes: {}, listaContas: [] };

        // Tenta rodar o cálculo financeiro de forma segura
        try {
            if (typeof CalculoFinanceiro !== 'undefined') {
                resumo = CalculoFinanceiro.calcularResumoDoMes(mesAtual, anoAtual);
            }
        } catch (err) {
            console.error("Erro ao calcular resumo financeiro:", err);
        }

        if (labelTotalGeral) {
            labelTotalGeral.innerText = `R$ ${resumo.totalGeral.toFixed(2).replace('.', ',')}`;
        }

        // Renderiza lista de contas em ordem cronológica
        if (listaPrioridades) {
            listaPrioridades.innerHTML = '';
            if (!resumo.listaContas || resumo.listaContas.length === 0) {
                listaPrioridades.innerHTML = `<div style="color: #B3B3B3; font-size: 14px; text-align: center; padding: 20px;">Nenhum lançamento registrado para este mês.</div>`;
            } else {
                resumo.listaContas.forEach(item => {
                    const icone = item.tipo === 'cartao' ? '💳' : item.tipo === 'emprestimo' ? '🏦' : '📄';
                    
                    let detalhes = '';
                    if (item.tipo === 'cartao') {
                        detalhes = `${item.cartaoNome} • Parcela ${item.parcelaAtual}/${item.parcelasTotais}`;
                    } else if (item.tipo === 'emprestimo') {
                        detalhes = `Parcela ${item.parcelaAtual}/${item.parcelasTotais}`;
                    } else {
                        detalhes = `Conta de Consumo`;
                    }

                    listaPrioridades.innerHTML += `
                        <div class="card-item" style="border-left: 4px solid #00E676; padding: 12px; margin-bottom: 10px; background-color: #1E1E1E; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <span style="font-size: 15px; font-weight: bold; display: block; color: #FFF;">${icone} ${item.descricao}</span>
                                <span style="font-size: 12px; color: #00E676; font-weight: bold;">Vencimento: Dia ${item.diaVencimento}</span>
                                <span style="font-size: 11px; color: #888; display: block; margin-top: 2px;">${detalhes} • [${item.responsavel}]</span>
                            </div>
                            <div style="font-size: 16px; font-weight: bold; color: #FFF;">
                                R$ ${item.valorParcela.toFixed(2).replace('.', ',')}
                            </div>
                        </div>
                    `;
                });
            }
        }

        // Renderiza faturas de cartões
        if (listaFaturas) {
            listaFaturas.innerHTML = '';
            const cartoesChaves = Object.keys(resumo.cartoes || {});
            if (cartoesChaves.length === 0) {
                listaFaturas.innerHTML = `<div style="color: #B3B3B3; font-size: 14px; text-align: center; padding: 20px;">Nenhuma fatura de cartão este mês.</div>`;
            } else {
                cartoesChaves.forEach(cartao => {
                    const valor = resumo.cartoes[cartao];
                    listaFaturas.innerHTML += `
                        <div class="card-item" style="border-left: 4px solid #FF6B6B; padding: 12px; margin-bottom: 10px; background-color: #1E1E1E; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <span style="font-size: 15px; font-weight: bold; display: block; color: #FFF;">💳 ${cartao}</span>
                                <span style="font-size: 11px; color: #888; display: block; margin-top: 2px;">Fatura do Mês</span>
                            </div>
                            <div style="font-size: 16px; font-weight: bold; color: #FF6B6B;">
                                R$ ${valor.toFixed(2).replace('.', ',')}
                            </div>
                        </div>
                    `;
                });
            }
        }

        // Renderiza a aba de Rateio/Divisão (Aba 2)
        if (containerRateio) {
            containerRateio.innerHTML = '';
            const chaves = Object.keys(resumo.rateio || {});
            if (chaves.length === 0) {
                containerRateio.innerHTML = `<div style="color: #B3B3B3; font-size: 14px; text-align: center; padding: 20px;">Sem dados de divisão este mês.</div>`;
            } else {
                chaves.forEach(resp => {
                    const val = resumo.rateio[resp];
                    containerRateio.innerHTML += `
                        <div class="card-item" style="padding: 15px; margin-bottom: 10px; background-color: #1E1E1E; border-radius: 8px; display: flex; justify-content: space-between;">
                            <span style="font-weight: bold; color: #FFF;">👤 ${resp}</span>
                            <span style="font-weight: bold; color: #00E676;">R$ ${val.toFixed(2).replace('.', ',')}</span>
                        </div>
                    `;
                });
            }
        }
    }

    if (btnMesAnterior) {
        btnMesAnterior.addEventListener('click', () => {
            mesAtual--;
            if (mesAtual < 0) { mesAtual = 11; anoAtual--; }
            atualizarPainelVisual();
        });
    }

    if (btnMesSeguinte) {
        btnMesSeguinte.addEventListener('click', () => {
            mesAtual++;
            if (mesAtual > 11) { mesAtual = 0; anoAtual++; }
            atualizarPainelVisual();
        });
    }

    if (btnMesAnterior) {
        btnMesAnterior.addEventListener('click', () => {
            mesAtual--;
            if (mesAtual < 0) { mesAtual = 11; anoAtual--; }
            atualizarPainelVisual();
        });
    }

    window.atualizarTelaFinanceira = atualizarPainelVisual;
    atualizarPainelVisual();
});

