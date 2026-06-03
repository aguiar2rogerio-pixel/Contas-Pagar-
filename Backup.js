// =================================================================
// Backup.js - Sistema de Segurança: Download e Compartilhamento Opcional
// =================================================================

const BackupSistema = {
    // 1. JUNTA TODOS OS DADOS DO COFRE EM UM ÚNICO OBJETO
    COLETAR_DADOS: function() {
        return {
            pessoas: localStorage.getItem('financas_pessoas'),
            cartoes: localStorage.getItem('financas_cartoes'),
            lancamentos: localStorage.getItem('financas_lancamentos'),
            exportadoEm: new Date().toISOString()
        };
    },

    // 2. A FUNÇÃO PRINCIPAL DO BOTÃO
    GERAR_E_EXPORTAR: function() {
        const dadosCompletos = this.COLETAR_DADOS();
        const textoDados = JSON.stringify(dadosCompletos, null, 2);
        
        // Criamos o arquivo de texto na memória do navegador
        const blob = new Blob([textoDados], { type: 'application/json' });
        const nomeArquivo = `backup_financas_${new Date().toISOString().slice(0,10)}.json`;

        // Passo A: O Download Tradicional (Como você já faz)
        const linkInvisivel = document.createElement('a');
        linkInvisivel.href = URL.createObjectURL(blob);
        linkInvisivel.download = nomeArquivo;
        document.body.appendChild(linkInvisivel);
        linkInvisivel.click();
        document.body.removeChild(linkInvisivel);

        console.log("Download do backup local concluído com sucesso!");

        // Passo B: O Compartilhamento Opcional (O Pulo do Gato)
        // Damos um mini intervalo para não travar o download e fazemos a pergunta
        setTimeout(() => {
            const querCompartilhar = confirm("Backup salvo na pasta de Downloads! Deseja também enviar uma cópia de segurança para fora do celular (WhatsApp, Google Drive ou E-mail)?");
            
            if (querCompartilhar) {
                // Criamos um arquivo real na memória para a API de compartilhamento do celular ler
                const arquivoParaCompartilhar = new File([blob], nomeArquivo, { type: 'application/json' });

                // Verifica se o celular (Android/iOS) suporta o compartilhamento de arquivos nativo
                if (navigator.canShare && navigator.canShare({ files: [arquivoParaCompartilhar] })) {
                    navigator.share({
                        files: [arquivoParaCompartilhar],
                        title: 'Backup Controle Financeiro',
                        text: 'Minha cópia de segurança das finanças domésticas.'
                    })
                    .then(() => console.log('Backup compartilhado com sucesso externamente!'))
                    .catch((erro) => console.log('Compartilhamento cancelado ou falhou:', erro));
                } else {
                    // Caso o navegador seja antigo e não tenha a gaveta de compartilhamento
                    alert("Seu navegador não suporta o envio direto. Você pode mover o arquivo baixado manualmente para o seu Drive ou WhatsApp!");
                }
            }
        }, 800);
    },

    // 3. RESTAURAR OS DADOS A PARTIR DO ARQUIVO (.JSON)
    RESTAURAR_BACKUP: function(conteudoTexto) {
        try {
            const dadosRestauração = JSON.parse(conteudoTexto);
            
            // Injeta de volta nas respectivas gavetas do LocalStorage
            if (dadosRestauração.pessoas) localStorage.setItem('financas_pessoas', dadosRestauração.pessoas);
            if (dadosRestauração.cartoes) localStorage.setItem('financas_cartoes', dadosRestauração.cartoes);
            if (dadosRestauração.lancamentos) localStorage.setItem('financas_lancamentos', dadosRestauração.lancamentos);
            
            alert("Dados restaurados com absoluto sucesso! O aplicativo vai reiniciar para aplicar as mudanças.");
            window.location.reload(); // Recarrega o app para atualizar as faturas e o rateio na tela
            return true;
        } catch (erro) {
            alert("Erro ao ler o arquivo de backup. Certifique-se de escolher o arquivo correto enviado anteriormente.");
            return false;
        }
    }
};

