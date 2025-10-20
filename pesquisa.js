const formPesquisa = document.getElementById('formPesquisa');
const inputPesquisa = formPesquisa.querySelector('.input-pesquisa');


let fuse;
let listaDeBuscaPlana;

// --- PASSO 1: Carregar os dados e o índice pré-gerado ---
async function inicializarBusca() {
    try {
        // Carrega a lista de termos e o índice ao mesmo tempo
        const [respostaLista, respostaIndice] = await Promise.all([
            fetch('./assets/lista-busca.json'),
            fetch('./assets/indice-busca.json')
        ]);

        
        listaDeBuscaPlana = await respostaLista.json();
        const indiceFuse = await respostaIndice.json();
        
        // --- PASSO 2: Inicializar o Fuse.js com os dados carregados ---
        const options = {
            keys: ['termo'],
            includeScore: true,
            threshold: 0.7, // qual a rigorozidade da busca de termos
            // IMPORTANTE: Passa o índice pré-gerado para o Fuse
            index: Fuse.parseIndex(indiceFuse) 
        };

        // Cria a instância do Fuse. Agora isso é quase instantâneo!
        fuse = new Fuse(listaDeBuscaPlana, options);
        console.log("Sistema de busca inteligente pronto!");

    } catch (error) {
        console.error("Falha ao inicializar o sistema de busca:", error);
        alert("Erro ao carregar a busca. Tente recarregar a página.");
    }
}

// --- PASSO 3: A função de busca (praticamente a mesma de antes) ---
function buscarPagina(termo) {
    if (!fuse) {
        alert("A busca ainda não está pronta, por favor aguarde um momento.");
        return;
    }

    const termoFormatado = termo.trim().toLowerCase();
    if (!termoFormatado) return;

    const resultados = fuse.search(termoFormatado);
    limparResultados();

    if (resultados.length === 0) {
        alert("Não encontramos resultados para: " + termo);
    } else if (resultados.length === 1 || resultados[0].score < 0.1) {
        window.location.href = resultados[0].item.pagina;
    } else {
        mostrarResultados(resultados.slice(0, 5));
    }
}

// --- Funções auxiliares 
function mostrarResultados(resultados) {
    const containerResultados = document.createElement('ul');
    containerResultados.className = 'lista-resultados-pesquisa';
    const titulo = document.createElement('li');
    titulo.className = 'resultado-titulo';
    titulo.textContent = 'Encontramos múltiplos resultados. Onde você quer ir?';
    containerResultados.appendChild(titulo);
    resultados.forEach(resultado => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = resultado.item.pagina;
        const nomePagina = resultado.item.pagina.replace('.html', '').replace(/[-_]/g, ' ');
        link.innerHTML = `Termo: "<strong>${resultado.item.termo}</strong>" <span class="pagina-destino">em ${nomePagina}</span>`;
        item.appendChild(link);
        containerResultados.appendChild(item);
    });
    document.querySelector('.cabeçalho').insertAdjacentElement('afterend', containerResultados);
}

function limparResultados() {
    const listaExistente = document.querySelector('.lista-resultados-pesquisa');
    if (listaExistente) listaExistente.remove();
}

// --- Event Listeners ---
formPesquisa.addEventListener('submit', function(event) {
    event.preventDefault();
    buscarPagina(inputPesquisa.value);
});

document.addEventListener('click', function(event) {
    if (!formPesquisa.contains(event.target)) {
        limparResultados();
    }
});

// --- Inicia todo o processo quando a página carrega ---
document.addEventListener('DOMContentLoaded', inicializarBusca);