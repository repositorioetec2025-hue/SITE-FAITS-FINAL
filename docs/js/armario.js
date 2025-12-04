import { db } from "./firebase-config.js";
import {
  ref,
  set,
  push,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// =======================================================
// 1. VARIÁVEIS GLOBAIS E FUNÇÕES DE UTILIDADE (ESCOPO GLOBAL)
// =======================================================

let projetosArray = [];
let usuarioLogadoCache = null;

function verificarUsuarioLogado() {
  const usuarioRaw = localStorage.getItem("usuarioLogado");
  if (usuarioRaw) {
    try {
      usuarioLogadoCache = JSON.parse(usuarioRaw);
      return usuarioLogadoCache.ra || true;
    } catch (e) {
      console.error("Erro ao analisar JSON do localStorage:", e);
      return null;
    }
  }
  return null;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// =======================================================
// 2. FUNÇÕES DE RENDERIZAÇÃO E DADOS (ESCOPO GLOBAL)
// =======================================================

/**
 * Cria o HTML de um card de projeto simplificado (Título e 1º Integrante).
 * O card inteiro agora é clicável.
 * @param {object} projeto O objeto do projeto.
 */
function criarCardProjeto(projeto) {
  const integrantesDoProjeto = projeto.integrantes ?? [];

  const primeiroIntegranteNome = integrantesDoProjeto[0]
    ? escapeHtml(integrantesDoProjeto[0].nome)
    : "Não Informado";

  const card = document.createElement("div");
  card.className = "project-card";
  card.setAttribute("data-id", projeto.id);

  card.innerHTML = `
        <h3>${escapeHtml(projeto.titulo)}</h3>
        <p class="project-integrantes">Autor Principal: ${primeiroIntegranteNome}</p>
    `;
  return card;
}

/**
 * Exibe a seção de detalhes do projeto, em modo de visualização, com o iframe.
 * ✅ NÃO FAZ MAIS CONVERSÃO DE URL: Espera-se a URL de Incorporação (Embed) direta.
 * @param {object} projeto O objeto do projeto a ser exibido.
 */
function exibirProjetoCompleto(projeto) {
  const detailsSection = document.getElementById("modal-projeto");
  const detailsContent = document.getElementById("modal-projeto-detalhes");
  if (!detailsSection || !detailsContent) return;

  // --- LÓGICA DO IFRAME (SIMPLIFICADA) ---
  let iframeHtml = "";
  const linkExterno = projeto.linkExterno ?? "";

  if (linkExterno) {
    // 🛑 NÃO HÁ CONVERSÃO AQUI: linkEmbed é igual ao linkExterno do Firebase
    const linkEmbed = linkExterno;

    iframeHtml = `
        <div class="detalhes-iframe-box">
            <label>VISUALIZAÇÃO DO DOCUMENTO (EMBED)</label>
            <div class="iframe-container-wrapper">
                <iframe src="${escapeHtml(linkEmbed)}" 
                        width="100%" 
                        height="400" 
                        frameborder="0" 
                        allowfullscreen="true" 
                        sandbox="allow-scripts allow-same-origin allow-popups"
                        style="display: block;">
                </iframe>
            </div>
        </div>

        <div class="detalhes-campo-visual">
            <label>LINK DO DOCUMENTO (ACESSO DIRETO)</label>
            <a href="${escapeHtml(
              linkExterno
            )}" target="_blank" class="link-documento">${escapeHtml(
      linkExterno
    )}</a>
        </div>
        
        <p class="detalhes-nota">Para visualizar, o link no Firebase deve ser a URL de **Incorporação (Embed)** e ter permissão pública.</p>
    `;
  }
  // --- FIM DA LÓGICA DO IFRAME ---

  // --- GERAÇÃO DOS INTEGRANTES EM FORMATO DE CAMPO DE VISUALIZAÇÃO ---
  const integrantesCampos = (projeto.integrantes ?? [])
    .map(
      (i) => `
        <div class="detalhes-campo-integrante visual-only">
            <label>RA: ${escapeHtml(i.ra)}</label>
            <p class="valor-integrante">${escapeHtml(i.nome)}</p>
        </div>
    `
    )
    .join("");

  // --- INJEÇÃO DO CONTEÚDO ---
  detailsContent.innerHTML = `
        <h1 class="detalhes-titulo-pagina">Detalhes do Projeto</h1>

        <div class="detalhes-campo-visual">
            <label>Título</label>
            <p class="valor-visual">${escapeHtml(projeto.titulo)}</p>
        </div>

        <div class="detalhes-campo-visual">
            <label>Curso</label>
            <p class="valor-visual">${escapeHtml(projeto.curso)}</p>
        </div>
        
        <div class="detalhes-campo-visual">
            <label>Descrição</label>
            <p class="valor-visual">${escapeHtml(projeto.descricao)}</p>
        </div>

        <label class="detalhes-subtitulo">Integrantes</label>
        <div class="integrantes-grid">
            ${integrantesCampos}
        </div>
        
        ${iframeHtml} 
    `;

  detailsSection.classList.remove("hidden");
  detailsSection.scrollIntoView({ behavior: "smooth" });
}

/**
 * Fecha a seção de detalhes.
 */
function fecharDetalhes() {
  const detailsSection = document.getElementById("modal-projeto");
  if (detailsSection) {
    detailsSection.classList.add("hidden");
  }
}

/**
 * Renderiza os projetos no container e anexa o evento de clique ao CARD inteiro.
 * @param {Array<object>} projetosParaExibir Array de projetos a serem renderizados.
 */
function renderizarProjetos(projetosParaExibir) {
  const containerProjetos = document.getElementById("projects-grid-container");
  if (!containerProjetos) return;

  containerProjetos.innerHTML = "";
  if (projetosParaExibir.length === 0) {
    containerProjetos.innerHTML =
      "<p>Nenhum projeto encontrado. Que tal cadastrar o primeiro?</p>";
    return;
  }

  projetosParaExibir.forEach((projeto) => {
    containerProjetos.appendChild(criarCardProjeto(projeto));
  });

  // Adiciona evento de clique a todos os CARDS (.project-card)
  containerProjetos.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-id");
      const projeto = projetosArray.find((p) => p.id === id);
      if (projeto) exibirProjetoCompleto(projeto);
    });
  });
}

/**
 * Ordena a lista global de projetos e renderiza.
 * @param {string} tipoOrdenacao O tipo de ordenação (ex: 'titulo-asc', 'data_desc').
 */
function ordenarProjetos(tipoOrdenacao) {
  if (projetosArray.length === 0) return;

  const sortedArray = [...projetosArray];

  switch (tipoOrdenacao) {
    case "titulo-asc":
      sortedArray.sort((a, b) => a.titulo.localeCompare(b.titulo));
      break;
    case "titulo-desc":
      sortedArray.sort((a, b) => b.titulo.localeCompare(a.titulo));
      break;
    case "data_desc":
    default:
      sortedArray.sort(
        (a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao)
      );
      break;
    case "data_asc":
      sortedArray.sort(
        (a, b) => new Date(a.dataCriacao) - new Date(b.dataCriacao)
      );
      break;
    case "integrantes-desc":
      // Ordena por maior número de integrantes primeiro
      sortedArray.sort(
        (a, b) => (b.integrantes?.length ?? 0) - (a.integrantes?.length ?? 0)
      );
      break;
    case "integrantes-asc":
      // Ordena por menor número de integrantes primeiro
      sortedArray.sort(
        (a, b) => (a.integrantes?.length ?? 0) - (b.integrantes?.length ?? 0)
      );
      break;
  }

  renderizarProjetos(sortedArray);
}

/**
 * Carrega todos os projetos do Firebase.
 */
async function carregarTodosProjetos() {
  const containerProjetos = document.getElementById("projects-grid-container");
  if (containerProjetos) {
    containerProjetos.innerHTML = "<p>Carregando projetos...</p>";
  }

  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, "projetos"));

    if (snapshot.exists()) {
      const projetosObj = snapshot.val();
      projetosArray = Object.values(projetosObj);
      console.log(`Projetos carregados: ${projetosArray.length}`);

      const ordenacaoAtual =
        document.getElementById("ordenacao-select")?.value || "data_desc";
      ordenarProjetos(ordenacaoAtual);
    } else {
      console.log("Nenhum projeto encontrado no banco de dados.");
      projetosArray = [];
      renderizarProjetos([]);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar projetos:", error);
    if (containerProjetos) {
      containerProjetos.innerHTML =
        "<p>Erro ao carregar projetos. Tente novamente.</p>";
    }
  }
}

// =======================================================
// 3. FUNÇÕES AUXILIARES DO FORMULÁRIO (ESCOPO INTERNO)
// =======================================================

const abrirFormulario = (cadastrarSection) => {
  cadastrarSection.classList.remove("hidden");
  cadastrarSection.scrollIntoView({ behavior: "smooth" });
};

const fecharFormulario = (cadastrarSection, projectForm, btnSubmit) => {
  cadastrarSection.classList.add("hidden");
  projectForm.reset();
  btnSubmit.disabled = false;
  btnSubmit.textContent = "Salvar";
};

const capturarIntegrantes = () => {
  const integrantes = [];
  for (let i = 1; i <= 6; i++) {
    const nome = document.getElementById(`integrante${i}-nome`)?.value.trim();
    const ra = document.getElementById(`integrante${i}-ra`)?.value.trim();
    if (nome && ra) integrantes.push({ nome, ra });
  }
  return integrantes;
};

const validarRAs = () => {
  const ras = [];
  for (let i = 1; i <= 6; i++) {
    const ra = document.getElementById(`integrante${i}-ra`)?.value.trim();
    if (ra) ras.push(ra);
  }

  const ra1 = document.getElementById("integrante1-ra")?.value.trim();
  const ra2 = document.getElementById("integrante2-ra")?.value.trim();

  if (!ra1 || !ra2) {
    alert("Os dois primeiros integrantes precisam ter RA preenchido.");
    return false;
  }

  if (new Set(ras).size !== ras.length) {
    alert("Existem RAs repetidos! Cada RA deve ser único.");
    return false;
  }
  return true;
};

// =======================================================
// 4. FUNÇÃO PRINCIPAL DE SALVAR (FIREBASE)
// =======================================================

async function handleSalvarProjeto(
  event,
  cadastrarSection,
  projectForm,
  btnSubmit
) {
  event.preventDefault();

  const usuario = verificarUsuarioLogado();

  if (!usuario) {
    alert(
      "🔒 Você precisa estar logado para cadastrar um projeto! Faça login na página de perfil."
    );
    btnSubmit.disabled = false;
    btnSubmit.textContent = "Salvar";
    return;
  }

  const titulo = document.getElementById("form-titulo").value.trim();
  const descricao = document.getElementById("form-descricao").value.trim();
  const curso = document.getElementById("form-curso").value.trim();
  const linkExterno = document.getElementById("form-artigo").value.trim();

  if (!validarRAs()) return;

  if (!titulo || !descricao || !curso) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.textContent = "Salvando...";

  const integrantes = capturarIntegrantes();

  try {
    const projetosRef = ref(db, "projetos");
    const novoProjetoRef = push(projetosRef);
    const idProjeto = novoProjetoRef.key;

    await set(novoProjetoRef, {
      id: idProjeto,
      titulo,
      descricao,
      curso,
      linkExterno,
      integrantes,
      dataCriacao: new Date().toISOString(),
      criadoPorRA: usuarioLogadoCache ? usuarioLogadoCache.ra : "desconhecido",
    });

    alert(`✔ Projeto "${titulo}" cadastrado com sucesso!`);

    fecharFormulario(cadastrarSection, projectForm, btnSubmit);
    await carregarTodosProjetos(); // Chama a função global, agora definida.
  } catch (erro) {
    console.error("❌ Erro ao salvar projeto:", erro);
    alert("Erro ao salvar projeto.");
    btnSubmit.disabled = false;
    btnSubmit.textContent = "Salvar";
  }
}

// =======================================================
// 5. INICIALIZAÇÃO DO DOM (EVENT LISTENERS)
// =======================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("🔰 armario.js carregado");

  verificarUsuarioLogado();

  const botoesAbrirForm = document.querySelectorAll(".js-abrir-form");
  const cadastrarSection = document.getElementById("add-project-section");
  const projectForm = document.getElementById("project-form");
  const btnCancelar = document.getElementById("btn-cancelar");
  const ordenacaoSelect = document.getElementById("ordenacao-select");
  const btnSubmit = projectForm?.querySelector('[type="submit"]');

  // Captura o contêiner principal do modal (ID do HTML)
  const modalContainer = document.getElementById("modal-projeto");

  // Adiciona verificação de login e abre o formulário
  botoesAbrirForm.forEach((btn) =>
    btn.addEventListener("click", () => {
      if (verificarUsuarioLogado()) {
        abrirFormulario(cadastrarSection);
      } else {
        alert(
          "🔒 Por favor, faça login através da página de perfil para cadastrar projetos."
        );
      }
    })
  );

  btnCancelar?.addEventListener("click", () =>
    fecharFormulario(cadastrarSection, projectForm, btnSubmit)
  );

  projectForm?.addEventListener("submit", (e) =>
    handleSalvarProjeto(e, cadastrarSection, projectForm, btnSubmit)
  );

  // Listener para fechar os detalhes do projeto (clicando no 'X')
  document
    .getElementById("modal-fechar")
    ?.addEventListener("click", fecharDetalhes);

  // Listener para fechar os detalhes ao clicar FORA do card de conteúdo
  if (modalContainer) {
    modalContainer.addEventListener("click", (e) => {
      // Verifica se o clique ocorreu exatamente no fundo do modal (e não em um filho)
      if (e.target === modalContainer) {
        fecharDetalhes();
      }
    });
  }

  // Listener para ordenação
  ordenacaoSelect?.addEventListener("change", (event) => {
    ordenarProjetos(event.target.value);
  });

  // 🚀 CARREGA TODOS OS PROJETOS NA INICIALIZAÇÃO DA PÁGINA
  carregarTodosProjetos();
});
