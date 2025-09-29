document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // PARTE 1: NOSSO "MINI BANCO DE DADOS" DE PROJETOS
    // ======================================================
    const projetos = [
        // ... (seus projetos iniciais ficam aqui) ...
        {
            titulo: "Sistema de Autenticação Segura",
            descricao: "Implementação de login com JWT e criptografia bcrypt para máxima segurança.",
            imagem: "assets/images/project1-thumb.jpg",
            link: "detalhes-projeto-1.html",
            categorias: "web-dev security"
        }
    ];

    // ======================================================
    // PARTE 2: SELETORES DE ELEMENTOS DO DOM
    // ======================================================
    const gridContainer = document.getElementById('projects-grid-container');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // **** NOVOS SELETORES PARA O FORMULÁRIO ****
    const btnMostrarForm = document.getElementById('btn-mostrar-form');
    const addProjectSection = document.getElementById('add-project-section');
    const projectForm = document.getElementById('project-form');
    const btnCancelar = document.getElementById('btn-cancelar');

    // ======================================================
    // PARTE 3: FUNÇÃO PARA GERAR OS CARDS
    // ======================================================
    function gerarCardsDeProjetos() {
        gridContainer.innerHTML = '';
        projetos.forEach(projeto => {
            const cardHTML = `
                <div class="project-card" data-category="${projeto.categorias}">
                    <div class="project-thumbnail">
                        <img src="${projeto.imagem}" alt="Miniatura do Projeto ${projeto.titulo}" class="thumbnail-img">
                    </div>
                    <div class="project-info">
                        <h3 class="project-title">${projeto.titulo}</h3>
                        <p class="project-description">${projeto.descricao}</p>
                        <a href="${projeto.link}" class="btn-view-project">Ver Projeto</a>
                    </div>
                </div>
            `;
            gridContainer.innerHTML += cardHTML;
        });
    }

    // ======================================================
    // PARTE 4: LÓGICA DO FILTRO E EVENTOS
    // ======================================================

    // Função para filtrar os cards
    function filtrarProjetos(filter) {
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            const categories = card.dataset.category.split(' ');
            if (filter === 'all' || categories.includes(filter)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    // Adiciona evento de clique aos botões de filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filterValue = button.dataset.filter;
            filtrarProjetos(filterValue);
        });
    });

    // **** NOVA LÓGICA PARA O FORMULÁRIO ****

    // Evento para MOSTRAR o formulário
    btnMostrarForm.addEventListener('click', () => {
        addProjectSection.classList.remove('hidden');
    });

    // Evento para ESCONDER o formulário (botão Cancelar)
    btnCancelar.addEventListener('click', () => {
        addProjectSection.classList.add('hidden');
    });

    // Evento para SALVAR um novo projeto
    projectForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Impede que a página recarregue

        // 1. Pega os valores dos campos do formulário
        const novoProjeto = {
            titulo: document.getElementById('titulo').value,
            descricao: document.getElementById('descricao').value,
            imagem: document.getElementById('imagem').value,
            link: document.getElementById('link').value,
            categorias: document.getElementById('categorias').value
        };

        // 2. Adiciona o novo projeto ao nosso array "banco de dados"
        projetos.push(novoProjeto);

        // 3. Regenera todos os cards na tela para incluir o novo
        gerarCardsDeProjetos();

        // 4. Limpa e esconde o formulário
        projectForm.reset(); // Limpa os campos
        addProjectSection.classList.add('hidden'); // Esconde a seção do formulário
    });

    // ======================================================
    // INICIALIZAÇÃO DA PÁGINA
    // ======================================================
    gerarCardsDeProjetos(); // Gera os cards iniciais
});