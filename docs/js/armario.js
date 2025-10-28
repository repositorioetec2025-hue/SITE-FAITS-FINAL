// IMPORTA AS NOVAS FERRAMENTAS
import { db, auth, storage } from './firebase-init.js';
import { collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

document.addEventListener('DOMContentLoaded', () => {

    const gridContainer = document.getElementById('projects-grid-container');
    const projectForm = document.getElementById('project-form');
    // ... (outros seletores) ...

    /**
     * Busca os projetos no Firestore e os exibe.
     */
    async function buscarEGerarProjetos() {
        try {
            const querySnapshot = await getDocs(collection(db, "projetos"));
            gridContainer.innerHTML = '';
            // ... (o resto desta função continua igual) ...

            querySnapshot.forEach((doc) => {
                const projeto = doc.data();
                // O card agora precisa de um link para o documento
                const cardHTML = `
                    <div class="project-card">
                        <div class="project-thumbnail"><img src="${projeto.imagemURL}" alt="Miniatura do Projeto ${projeto.titulo}" class="thumbnail-img"></div>
                        <div class="project-info">
                            <h3 class="project-title">${projeto.titulo}</h3>
                            <p class="project-description">${projeto.descricao}</p>
                            <div class="project-links">
                                ${projeto.documentoURL ? `<a href="${projeto.documentoURL}" class="btn-secondary" target="_blank">Ver Documento</a>` : ''}
                                ${projeto.linkExterno ? `<a href="${projeto.linkExterno}" class="btn-view-project" target="_blank">Ver Link</a>` : ''}
                            </div>
                        </div>
                    </div>
                `;
                gridContainer.innerHTML += cardHTML;
            });
        } catch (error) {
            console.error('Erro ao buscar projetos:', error);
        }
    }

    /**
     * Faz o upload de um arquivo para o Firebase Storage e retorna a URL de download.
     */
    async function uploadArquivo(file, userId) {
        if (!file) return null;
        // Cria um nome de arquivo único para evitar conflitos
        const filePath = `projetos/${userId}/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, filePath);
        
        console.log(`Fazendo upload de: ${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log(`Arquivo disponível em: ${downloadURL}`);
        return downloadURL;
    }

    /**
     * Salva o formulário, fazendo upload dos arquivos primeiro.
     */
    async function salvarNovoProjeto(event) {
        event.preventDefault();
        const user = auth.currentUser;

        if (!user) {
            alert("Você precisa estar logado para adicionar um projeto.");
            return;
        }

        // Pega os arquivos dos inputs
        const imagemFile = document.getElementById('imagem-file').files[0];
        const documentoFile = document.getElementById('documento-file').files[0];

        // Validação de obrigatoriedade
        if (!imagemFile || !documentoFile) {
            alert("Por favor, selecione uma imagem e um documento para o projeto.");
            return;
        }

        try {
            // Mostra um feedback de "carregando" (opcional, mas recomendado)
            const submitButton = projectForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';

            // 1. Faz o upload dos arquivos para o Storage em paralelo
            const [imagemURL, documentoURL] = await Promise.all([
                uploadArquivo(imagemFile, user.uid),
                uploadArquivo(documentoFile, user.uid)
            ]);

            // 2. Monta o objeto com os dados para salvar no Firestore
            const novoProjeto = {
                titulo: document.getElementById('titulo').value,
                descricao: document.getElementById('descricao').value,
                categorias: document.getElementById('categorias').value,
                linkExterno: document.getElementById('link').value || null, // Salva null se o link opcional estiver vazio
                imagemURL: imagemURL,       // A URL que veio do Storage
                documentoURL: documentoURL, // A URL que veio do Storage
                createdAt: new Date(),
                user_id: user.uid
            };

            // 3. Salva os metadados (incluindo as URLs) no Firestore
            await addDoc(collection(db, "projetos"), novoProjeto);

            alert("Projeto adicionado com sucesso!");
            fecharFormulario();
            buscarEGerarProjetos();

        } catch (error) {
            console.error('Erro ao salvar projeto:', error);
            alert("Ocorreu um erro ao salvar o projeto. Verifique o console para mais detalhes.");
        } finally {
            // Reativa o botão de submit, aconteça o que acontecer
            const submitButton = projectForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Salvar Projeto';
        }
    }

    // ... (suas funções de abrir/fechar formulário e eventos continuam aqui) ...
    function abrirFormulario() { /* ... */ }
    function fecharFormulario() { /* ... */ }
    botoesAbrirForm.forEach(botao => botao.addEventListener('click', abrirFormulario));
    if (btnCancelar) btnCancelar.addEventListener('click', fecharFormulario);
    if (projectForm) projectForm.addEventListener('submit', salvarNovoProjeto);

    // Inicialização da Página
    buscarEGerarProjetos();
});


// ======================================================
    // LÓGICA PARA PROCESSAR A BUSCA VINDA DA URL
    // ======================================================
    function processarBuscaDaURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const termoDeBusca = urlParams.get('q');

        if (termoDeBusca) {
            console.log(`Buscando por: "${termoDeBusca}"`);
            // Aqui você precisará integrar com sua lógica de busca existente (Fuse.js)
            // Esta parte assume que a busca é feita no carregamento da página.
            // A melhor abordagem é ter o Fuse.js inicializado aqui também.
        } else {
            // Se não houver termo de busca, carrega todos os projetos
            buscarEGerarProjetos();
        }
    }

    // Chama a função para processar a busca assim que a página carrega
    processarBuscaDaURL();