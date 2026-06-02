// js/dateUtils.js

/**
 * Retorna a data atual no formato YYYY-MM-DD considerando o fuso horário local.
 * Evita o bug clássico de o app mudar de dia à noite por causa do fuso universal.
 */
export function getLocalDateStr() {
    const d = new Date();
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

/**
 * Formata uma string de data (YYYY-MM-DD) para o formato brasileiro resumido (ex: 05 Jun).
 */
export function formatDate(dateStr) {
    if (!dateStr) return '';
    // Adiciona o horário para evitar problemas de fuso na conversão
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
}

/**
 * Retorna o ano e o mês atual formatado (ex: "2026-05") para usarmos nos filtros.
 */
export function getCurrentYearMonth() {
    const d = new Date();
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    return `${ano}-${mes}`;
}

/**
 * Avança ou retrocede meses a partir de uma data base (útil para calcular "Próximo Mês" e "Subsequente").
 */
export function addMonths(yearMonthStr, monthsToAdd) {
    const [year, month] = yearMonthStr.split('-').map(Number);
    const d = new Date(year, month - 1 + monthsToAdd, 1);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    return `${ano}-${mes}`;
}
