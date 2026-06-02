// js/storage.js

// Chaves que usaremos para salvar as coisas no celular
const CHAVE_COMPROMISSOS = 'compromissos_dados';
const CHAVE_CONFIGURACOES = 'compromissos_config';

/**
 * Carrega todos os dados guardados no celular. 
 * Se for a primeira vez usando, ele cria uma estrutura vazia padrão.
 */
export function carregarDados() {
    const dados = localStorage.getItem(CHAVE_COMPROMISSOS);
    if (!dados) {
        return {
            lancamentos: [], // Onde ficam as ~20 linhas por mês, empréstimos, etc.
            categoriasCartoes: ['Casas Bahia Visa', 'Nu Bank Mastercard'] // Lista de cartões padrão
        };
    }
    return JSON.parse(dados);
}

/**
 * Salva permanentemente todos os lançamentos e cartões no celular.
 */
export function salvarDados(novosDados) {
    localStorage.setItem(CHAVE_COMPROMISSOS, JSON.stringify(novosDados));
}

/**
 * 💾 Função de Backup: Transforma todo o histórico do app em um arquivo de texto
 * e faz o celular baixar automaticamente.
 */
export function exportarBackup() {
    const dados = localStorage.getItem(CHAVE_COMPROMISSOS);
    if (!dados) {
        alert('Nenhum dado encontrado para exportar!');
        return;
    }
    
    const blob = new Blob([dados], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_compromissos_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * 📂 Função de Restaurar: Recebe o arquivo de texto do backup e
 * reescreve o histórico do aplicativo, trazendo tudo de volta.
 */
export function importarBackup(arquivoTexto) {
    try {
        // Valida se o arquivo é um JSON válido antes de salvar
        const testarDados = JSON.parse(arquivoTexto);
        if (testarDados.lancamentos && testarDados.categoriasCartoes) {
            localStorage.setItem(CHAVE_COMPROMISSOS, arquivoTexto);
            return true;
        }
        return false;
    } catch (e) {
        console.error('Erro ao importar backup:', e);
        return false;
    }
}
