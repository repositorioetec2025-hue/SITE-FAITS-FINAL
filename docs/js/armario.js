document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // PARTE 1: SELETORES DE ELEMENTOS DO DOM
    // ======================================================
    const gridContainer = document.getElementById('projects-grid-container');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectForm = document.getElementById('project-form');
    // (outros seletores do formulário, se necessário)

    // A URL base do nosso backend
    const API_URL = 'http://127.0.0.1:5000/api';

    // ======================================================
    // PARTE 2: FUNÇÕES QUE CONVERSAM COM O BACKEND
    // ======================================================

    /**
     * Busca todos os projetos no backend e os exibe na tela.
     */
    async function buscarEGerarProjetos() {
        try {
            const resposta = await fetch(`${API_URL}/projetos`);
            if (!resposta.ok) {
                throw new Error('Não foi possível buscar os projetos.');
            }
            const projetos = await resposta.json(); // A lista de projetos vem do backend

            // Limpa o container
            gridContainer.innerHTML = '';

            // Gera um card para cada projeto recebido
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
        } catch (error) {
            console.error('Erro ao buscar projetos:', error);
            gridContainer.innerHTML = '<p>Não foi possível carregar os projetos. Tente novamente mais tarde.</p>';
        }
    }

    /**
     * Envia um novo projeto para o backend.
     * @param {Event} event - O evento de submit do formulário.
     */
    async function salvarNovoProjeto(event) {
        event.preventDefault();

        const novoProjeto = {
            titulo: document.getElementById('titulo').value,
            descricao: document.getElementById('descricao').value,
            imagem: document.getElementById('imagem').value,
            link: document.getElementById('link').value,
            categorias: document.getElementById('categorias').value
        };

        try {
            const resposta = await fetch(`${API_URL}/projetos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoProjeto)
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(resultado.mensagem || 'Erro ao salvar o projeto.');
            }
            
            alert(resultado.mensagem);
            projectForm.reset();
            document.getElementById('add-project-section').classList.add('hidden');
            
            // Atualiza a lista de projetos na tela para incluir o novo
            buscarEGerarProjetos();

        } catch (error) {
            console.error('Erro ao salvar projeto:', error);
            alert(error.message);
        }
    }

    // ======================================================
    // PARTE 3: INICIALIZAÇÃO E EVENTOS
    // ======================================================

    // Evento para salvar um novo projeto
    if (projectForm) {
        projectForm.addEventListener('submit', salvarNovoProjeto);
    }
    
    // (Sua lógica de filtro e de abrir/fechar formulário continua aqui, sem alterações)
    // ...

    // Inicializa a página buscando os projetos do backend
    buscarEGerarProjetos();
});