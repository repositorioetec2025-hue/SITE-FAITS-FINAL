/**
 * O código dentro deste evento só será executado depois que todo o conteúdo HTML
 * da página for completamente carregado e processado pelo navegador. Isso evita
 * que o JavaScript tente manipular elementos que ainda não existem.
 */
document.addEventListener('DOMContentLoaded', function() {

    // Objeto que mapeia nomes de seções (login, profile) para os IDs dos
    // elementos HTML correspondentes (loginSection, profileSection).
    // Facilita o controle de qual seção está visível.
    const sections = {
        'login': 'loginSection',
        'profile': 'profileSection',
        'editProfile': 'editProfileSection'
    };

    // =================================================================
    // BLOCO PRINCIPAL: VERIFICAÇÃO DE LOGIN
    // Este é o primeiro bloco de código que roda. Ele verifica se já existe
    // um usuário salvo na "sessionStorage" (que dura enquanto a aba do
    // navegador está aberta).
    // =================================================================
    
    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));

    // Se encontrou um usuário, significa que ele já fez login antes.
    if (usuarioLogado) {
        // Mostra a seção de perfil do usuário logado.
        showSection('editProfile');

        // Preenche as informações do usuário na tela.
        document.getElementById('displayUsername').textContent = usuarioLogado.username;
        document.getElementById('displayEmail').textContent = usuarioLogado.email;
        document.getElementById('displayRA').textContent = usuarioLogado.ra;

        /**
         * FUNÇÃO ANÔNIMA (EVENT LISTENER) - LOGOUT
         * Esta função é acionada quando o usuário clica no botão de logout.
         * Ela remove os dados do usuário da sessionStorage e recarrega a página,
         * efetivamente deslogando o usuário e retornando para a tela de login.
         */
        const logoutButton = document.getElementById('logoutButton');
        logoutButton.addEventListener('click', function() {
            sessionStorage.removeItem('usuarioLogado');
            window.location.reload(); 
        });

    // Se não encontrou um usuário, mostra a tela de login/cadastro.
    } else {
        // Verifica se a URL tem um parâmetro "?page=profile" para mostrar
        // a tela de cadastro diretamente. Caso contrário, mostra a de login.
        const urlParams = new URLSearchParams(window.location.search);
        const initialPage = urlParams.get('page');
        if (initialPage && (initialPage === 'login' || initialPage === 'profile')) {
            showSection(initialPage);
        } else {
            showSection('login');
        }
    }

    // =================================================================
    // FUNÇÕES GLOBAIS E DE INICIALIZAÇÃO
    // =================================================================

    /**
     * FUNÇÃO: inicializarBancoDeDadosFalso
     * Esta função verifica se o "banco de dados" de usuários (no localStorage)
     * já existe. Se não existir, ela cria um array com um usuário de teste
     * e o salva no localStorage. Isso garante que o aplicativo sempre tenha
     * pelo menos um usuário para testes, na primeira vez que for executado.
     */
    function inicializarBancoDeDadosFalso() {
        if (!localStorage.getItem('usuarios')) {
            const usuariosIniciais = [{
                ra: '20250001',
                username: 'usuarioteste',
                email: 'teste@email.com',
                password: '123'
            }];
            localStorage.setItem('usuarios', JSON.stringify(usuariosIniciais));
        }
    }
    inicializarBancoDeDadosFalso(); // Executa a função assim que o script carrega.

    /**
     * FUNÇÃO: gerarRAComAno
     * Recebe um número (sequencial) e o formata como um RA. Ela pega o ano
     * atual e junta com o número sequencial, garantindo que o número tenha
     * sempre 4 dígitos (ex: 1 se torna "0001", 15 se torna "0015").
     */
    function gerarRAComAno(sequencial) {
        const anoAtual = new Date().getFullYear();
        const sequencialFormatado = String(sequencial).padStart(4, '0');
        return `${anoAtual}${sequencialFormatado}`;
    }

    /**
     * FUNÇÃO: isRaUnico
     * É uma função de verificação. Ela recebe um RA e a lista de todos os
     * usuários e checa se esse RA já está sendo usado por alguém na lista.
     * Retorna 'true' se o RA for único, e 'false' se já existir.
     */
    function isRaUnico(ra, usuarios) {
        return !usuarios.some(user => user.ra === ra);
    }
    
    /**
     * FUNÇÃO: gerarRAUnico
     * Orquestra a criação de um RA garantidamente único. Ela usa as duas
     * funções acima. Primeiro, ela gera um RA com o próximo número sequencial
     * disponível e, em seguida, usa um loop 'do-while' com a função isRaUnico
     * para garantir que, caso o RA gerado já exista, ela tente o próximo número,
     * até encontrar um que seja único.
     */
    function gerarRAUnico() {
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        let proximoSequencial = usuarios.length + 1;
        let novoRA;

        do {
            novoRA = gerarRAComAno(proximoSequencial);
            proximoSequencial++;
        } while (!isRaUnico(novoRA, usuarios));
        
        return novoRA;
    }

    /**
     * FUNÇÃO: showSection
     * Responsável por controlar qual "página" (seção) é exibida ao usuário.
     * Primeiro, ela esconde todas as seções definidas no objeto 'sections'.
     * Depois, ela mostra apenas a seção cujo nome foi passado como parâmetro.
     */
    function showSection(sectionName) {
        Object.values(sections).forEach(sectionId => {
            const element = document.getElementById(sectionId);
            if (element) element.style.display = 'none';
        });

        const targetSection = document.getElementById(sections[sectionName]);
        if (targetSection) targetSection.style.display = 'block';
    }
    
    /**
     * FUNÇÃO: navigateToSection
     * Controla a navegação entre as seções. Ela chama a 'showSection' para
     * mudar a visualização e também atualiza a URL na barra de endereços do
     * navegador (sem recarregar a página), criando a ilusão de que o usuário
     * está navegando entre páginas diferentes.
     */
    function navigateToSection(sectionName) {
        showSection(sectionName);
        const newUrl = `${window.location.pathname}?page=${sectionName}`;
        history.pushState({ page: sectionName }, '', newUrl);
    }
    
    /**
     * EVENT LISTENER - BOTÕES DE NAVEGAÇÃO
     * Este código encontra todos os botões que têm o atributo 'data-section'
     * (como "Criar Conta" e "Já tenho uma conta") e adiciona um evento de clique
     * a cada um deles. Ao clicar, ele chama a função 'navigateToSection' para
     * levar o usuário à seção correta.
     */
    document.querySelectorAll('[data-section]').forEach(button => {
        button.addEventListener('click', (event) => {
            const sectionName = event.target.getAttribute('data-section');
            navigateToSection(sectionName);
        });
    });

    /**
     * EVENT LISTENER - BOTÃO VOLTAR/AVANÇAR DO NAVEGADOR
     * Essa função escuta os eventos de "voltar" ou "avançar" do navegador.
     * Quando o usuário clica nesses botões, o código lê a URL atual e usa
     * a função 'showSection' para exibir a seção correspondente àquela URL.
     */
    window.addEventListener('popstate', (event) => {
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('page');
        if (page && sections[page]) {
            showSection(page);
        }
    });

    /**
     * EVENT LISTENER - SUBMISSÃO DO FORMULÁRIO DE LOGIN
     * Esta função é executada quando o usuário preenche e envia o formulário de login.
     * Ela impede o recarregamento padrão da página, pega os dados digitados,
     * busca por um usuário correspondente no localStorage e, se encontrar,
     * salva os dados do usuário na sessionStorage e o redireciona.
     */
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o recarregamento da página
            const usernameInput = document.getElementById('username').value;
            const passwordInput = document.getElementById('password').value;
            const usuarios = JSON.parse(localStorage.getItem('usuarios'));
            const usuarioEncontrado = usuarios.find(user => user.username === usernameInput && user.password === passwordInput);

            if (usuarioEncontrado) {
                sessionStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado));
                window.location.href = 'index.html'; 
            } else {
                alert('Usuário ou senha inválidos.');
            }
        });
    }

    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        
        /**
         * EVENT LISTENER - BOTÃO DE GERAR RA
         * Adiciona uma função ao clique do botão "Gerar". Quando clicado,
         * ele chama a função 'gerarRAUnico', insere o resultado no campo
         * de input do RA e desativa o próprio botão para evitar que o usuário
         * gere um novo RA na mesma sessão de cadastro.
         */
        const generateRaButton = document.getElementById('generateRaButton');
        const raInput = document.getElementById('new-ra');
        if (generateRaButton && raInput) {
            generateRaButton.addEventListener('click', function() {
                const novoRA = gerarRAUnico();
                raInput.value = novoRA;
                generateRaButton.disabled = true;
            });
        }
        
        /**
         * EVENT LISTENER - SUBMISSÃO DO FORMULÁRIO DE CADASTRO
         * Esta é a função executada quando o usuário envia o formulário de "Criar Conta".
         * Ela faz todas as validações necessárias (se o RA foi gerado, se as senhas
         * coincidem, se o usuário ou email já existem) e, se tudo estiver correto,
         * cria um novo objeto de usuário e o adiciona à lista no localStorage.
         */
        profileForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o recarregamento da página
            
            const newRa = document.getElementById('new-ra').value;
            const newUsername = document.getElementById('new-username').value;
            const newEmail = document.getElementById('new-email').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (!newRa) {
                alert('Por favor, clique em "Gerar" para criar o seu RA!');
                return;
            }

            if (newPassword !== confirmPassword) {
                alert('As senhas não coincidem!');
                return;
            }
            const usuarios = JSON.parse(localStorage.getItem('usuarios'));
            const usuarioJaExiste = usuarios.some(user => user.username === newUsername || user.email === newEmail);

            if (usuarioJaExiste) {
                alert('Este nome de usuário ou e-mail já está em uso!');
            } else {
                const novoUsuario = { 
                    ra: newRa, 
                    username: newUsername, 
                    email: newEmail, 
                    password: newPassword 
                };
                
                usuarios.push(novoUsuario);
                localStorage.setItem('usuarios', JSON.stringify(usuarios));
                alert('Conta criada com sucesso! Por favor, faça o login.');
                navigateToSection('login');
            }
        });
    }
});