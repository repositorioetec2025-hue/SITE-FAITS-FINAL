document.addEventListener('DOMContentLoaded', function() {

    const sections = {
        'login': 'loginSection',
        'profile': 'profileSection'
    };

    /**
     * @description Exibe a seção correspondente e esconde as outras.
     * @param {string} sectionName - O nome da seção a ser exibida (ex: 'login').
     */
    function showSection(sectionName) {
        // Itera sobre todas as seções para escondê-las
        for (const key in sections) {
            const element = document.getElementById(sections[key]);
            if (element) {
                element.style.display = 'none';
            }
        }

        // Mostra a seção solicitada
        const targetSection = sections[sectionName];
        if (targetSection) {
            const element = document.getElementById(targetSection);
            if (element) {
                element.style.display = 'block';
            }
        }
    }

    /**
     * @description Gerencia a navegação e a URL sem recarregar a página.
     * @param {string} sectionName - O nome da seção para navegação.
     */
    function navigateToSection(sectionName) {
        // Exibe a seção
        showSection(sectionName);
        
        // Atualiza a URL do navegador para um controle de desenvolvedor
        const newUrl = `${window.location.pathname}?page=${sectionName}`;
        history.pushState({ page: sectionName }, '', newUrl);
    }

    // Configura os botões para usar a nova função de navegação
    document.querySelectorAll('[data-section]').forEach(button => {
        button.addEventListener('click', (event) => {
            const sectionName = event.target.getAttribute('data-section');
            navigateToSection(sectionName);
        });
    });

    // Ouve o evento do botão de voltar do navegador
    window.addEventListener('popstate', (event) => {
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('page');
        if (page) {
            showSection(page);
        }
    });

    // Lógica para exibir a seção correta ao carregar a página
    // Isso é útil quando a página é acessada via link direto (ex: meusite.com/perfil.html?page=profile)
    const urlParams = new URLSearchParams(window.location.search);
    const initialPage = urlParams.get('page');
    
    if (initialPage && sections[initialPage]) {
        showSection(initialPage);
    } else {
        // Se não houver parâmetro, mostra a seção de login por padrão
        showSection('login');
    }

});