document.addEventListener('DOMContentLoaded', () => {

const paginasDoSite = {
        // Variações para a Página Inicial (index.html)]
        'inicio': 'index.html',
        'Inicio': 'index.html', // Variação com maiúscula
        'home': 'index.html',
        'Home': 'index.html', // Variação com maiúscula
        'principal': 'index.html',
        'Principal': 'index.html', // Variação com maiúscula
        'inicio': 'index.html',
        'home': 'index.html',
        'principal': 'index.html',
        'comeco': 'index.html',
        'pagina inicial': 'index.html',
        'tela inicial': 'index.html',
        'menu': 'index.html',
        'menu principal': 'index.html',
        'capa': 'index.html',
        'portal': 'index.html',
        'entrada': 'index.html',
        'dashboard': 'index.html',
        'painel': 'index.html',
        'voltar ao inicio': 'index.html',

        // Variações para o Repositório (armario.html)
        'repositorio': 'armario.html',
        'repositorios': 'armario.html',
        'repositorio': 'armario.html',
        'Repositorio': 'armario.html', // Variação com maiúscula
        'armario': 'armario.html',
        'Armario': 'armario.html', // Variação com maiúscula
        'armario': 'armario.html',
        'projeto': 'armario.html',
        'projetos': 'armario.html',
        'meus projetos': 'armario.html',
        'lista de projetos': 'armario.html',
        'trabalhos': 'armario.html',
        'meus trabalhos': 'armario.html',
        'portfolio': 'armario.html',
        'galeria': 'armario.html',
        'acervo': 'armario.html',
        'ver projetos': 'armario.html',
        'listar projetos': 'armario.html',
        'meu repositorio': 'armario.html',

        // Variações para o Perfil (perfil.html)
        'perfil': 'perfil.html',
        'Perfil': 'perfil.html',
        'login': 'perfil.html',
        'Login': 'perfil.html',
        'minha conta': 'perfil.html',
        'meu perfil': 'perfil.html',
        'entrar': 'perfil.html',
        'acessar conta': 'perfil.html',
        'cadastro': 'perfil.html',
        'cadastrar': 'perfil.html',
        'registrar': 'perfil.html',
        'minhas informacoes': 'perfil.html',
        'meus dados': 'perfil.html',
        'fazer login': 'perfil.html',
        'criar conta': 'perfil.html',
        'Criar conta': 'perfil.html',
        
        // Variações para Configurações (config.html)
        'config': 'config.html',
        'configuracoes': 'config.html',
        'ajustes': 'config.html',
        'opcoes': 'config.html',
        'preferencias': 'config.html',
        'painel de controle': 'config.html',
        'definicoes': 'config.html',
        'meus repositorios': 'config.html',
    };

    const formPesquisa = document.getElementById('formPesquisa');
    const inputPesquisa = document.getElementById('input-pesquisa');

    function realizarBusca(event) {
        event.preventDefault(); // Impede o recarregamento da página

        const termoBusca = inputPesquisa.value.trim().toLowerCase();

        if (paginasDoSite[termoBusca]) {
            window.location.href = paginasDoSite[termoBusca];
        } else {
            alert('Página não encontrada para o termo: "' + inputPesquisa.value + '".');
        }
    }

    if (formPesquisa && inputPesquisa) {
        formPesquisa.addEventListener('submit', realizarBusca);
        console.log("Sistema de busca simples pronto!");
    } else {
        console.error("Não foi possível encontrar o formulário (#formPesquisa) ou o campo de busca (#input-pesquisa). Verifique os IDs no seu HTML.");
    }

});