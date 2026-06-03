// =================================================================
// app.js - O Inicializador e Instalador do PWA
// =================================================================

// 1. ATIVAR O MODO OFFLINE (Registrar o Service Worker)
// Verifica se o navegador do celular suporta essa tecnologia
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registro => {
                console.log('Operário Offline (sw.js) registrado com sucesso!', registro.scope);
            })
            .catch(erro => {
                console.error('Falha ao registrar o sw.js:', erro);
            });
    });
}

// 2. GERENCIAR A INSTALAÇÃO NA TELA INICIAL (Opcional/Automático)
// Guarda o evento de instalação para quando o usuário clicar em instalar
let disparoInstalacao;

window.addEventListener('beforeinstallprompt', (evento) => {
    // Impede que o navegador mostre aquele aviso padrão e feio de instalação
    evento.preventDefault();
    
    // Guarda o evento para usarmos no momento certo
    disparoInstalacao = evento;
    
    // Aqui, no futuro, se você quiser colocar um botão visual escrito "Instalar Aplicativo"
    // dentro do menu de configurações, nós podemos fazê-lo aparecer aqui.
    console.log('O aplicativo está pronto para ser instalado no celular!');
});

// Detecta se o aplicativo já está rodando instalado (Tela Cheia / Standalone)
window.addEventListener('appinstalled', () => {
    console.log('Trabalho feito! O aplicativo foi instalado com sucesso na tela inicial.');
    disparoInstalacao = null;
});

