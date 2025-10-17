document.addEventListener('DOMContentLoaded', () => {
     // ======================================================
    // SELETORES DE ELEMENTOS DO DOM (sem alterações)
    // ======================================================
    const gridContainer = document.getElementById('projects-grid-container');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Seletores para o formulário
    const btnMostrarFormTexto = document.getElementById('btn-mostrar-form');
    const btnAbrirFormularioIcone = document.getElementById('btn-abrir-formulario');
    const addProjectSection = document.getElementById('add-project-section');
    const projectForm = document.getElementById('project-form');
    const btnCancelar = document.getElementById('btn-cancelar');

    // ======================================================
    // FUNÇÕES DE CONTROLE DO FORMULÁRIO (MAIS ORGANIZADO)
    // ======================================================

    /**
     * Função para abrir o formulário.
     */
    function abrirFormulario() {
        if (addProjectSection) {
            addProjectSection.classList.remove('hidden');
        }
    }

    /**
     * Função para fechar e limpar o formulário.
     */
    function fecharFormulario() {
        if (addProjectSection) {
            addProjectSection.classList.add('hidden');
            projectForm.reset(); // Bônus: limpa os campos do formulário ao cancelar.
        }
    }

    /**
     * Função para lidar com o envio (submit) do formulário.
     * @param {Event} event - O evento de submit.
     */
    function salvarNovoProjeto(event) {
        event.preventDefault(); // Impede que a página recarregue

        // (Aqui entra a sua lógica de pegar os dados e adicionar ao array 'projetos')
        // const novoProjeto = { ... };
        // projetos.push(novoProjeto);
        
        // gerarCardsDeProjetos(); // Regenera os cards na tela
        
        console.log("Novo projeto salvo (temporariamente)!"); // Mensagem de teste

        fecharFormulario(); // Reutiliza a função de fechar o formulário
    }

    // ======================================================
    // INICIALIZAÇÃO DOS EVENTOS
    // ======================================================

    // Agrupa os botões que têm a mesma função
    const botoesDeAbrir = [btnMostrarFormTexto, btnAbrirFormularioIcone];

    // Adiciona o mesmo evento de 'click' para todos os botões do grupo
    botoesDeAbrir.forEach(botao => {
        if (botao) {
            botao.addEventListener('click', abrirFormulario); // Chama a função nomeada
        }
    });

    // Evento para ESCONDER o formulário (botão Cancelar)
    if (btnCancelar) {
        btnCancelar.addEventListener('click', fecharFormulario); // Chama a função nomeada
    }

    // Evento para SALVAR um novo projeto
    if (projectForm) {
        projectForm.addEventListener('submit', salvarNovoProjeto); // Chama a função nomeada
    }
});