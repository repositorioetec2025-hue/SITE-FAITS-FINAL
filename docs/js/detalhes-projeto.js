// =========================
// 🔥 IMPORTAÇÕES
// =========================
import { db } from "./firebase-config.js";
import {
  ref,
  get,
  update,
  remove,
  child,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// =========================
// 📌 PEGAR ID DA URL
// =========================
const params = new URLSearchParams(window.location.search);
const projetoId = params.get("id");

if (!projetoId) {
  alert("ID do projeto não encontrado!");
  window.location.href = "config.html";
}

// =========================
// 📌 ELEMENTOS DO HTML
// =========================
const tituloInput = document.getElementById("edit-titulo");
const descInput = document.getElementById("edit-descricao");
const cursoInput = document.getElementById("edit-curso");
const linkInput = document.getElementById("edit-link"); // Campo principal (topo)
const areaIntegrantes = document.getElementById("area-integrantes");
const visualizadorEmbed = document.getElementById("visualizador-embed"); // Elemento do Iframe

const btnSalvar = document.getElementById("btn-salvar");
const btnExcluir = document.getElementById("btn-excluir");
const btnAddIntegrante = document.getElementById("btnAddIntegrante");

// =========================
// 🔄 FUNÇÕES DO VISUALIZADOR EMBUTIDO (CORRIGIDAS)
// =========================

function criarIframeVisualizador(url) {
  if (!url) return "";

  // Atenção: O campo de input abaixo deve ter um ID diferente
  return `
        <div class="form-group documento-detalhe">
            <label>Visualização do Documento (Embed)</label>
            <div class="visualizador-container" style="border: 1px solid #ddd; height: 400px; margin-bottom: 10px;">
                <iframe 
                    src="${url}" 
                    frameborder="0" 
                    width="100%" 
                    height="100%" 
                    allowfullscreen="true" 
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    style="display: block;"
                ></iframe>
            </div>
        </div>

        <div class="form-group link-detalhe">
            <label>Link de Acesso Direto (Completo)</label>
            <input 
                type="url"
                id="edit-link-secundario"  class="detalhes-input"
                value="${url}" 
                placeholder="Cole o link de Incorporação (embed) aqui"
                style="cursor: text;"
            />
        </div>

        <p class="detalhes-nota">Se o documento não aparecer, verifique se o link é o de **Incorporação (Embed)**.</p>
    `;
}

function atualizarVisualizador() {
  const linkExterno = linkInput.value.trim();

  if (linkExterno) {
    // Gera o HTML, incluindo o campo de input secundário
    visualizadorEmbed.innerHTML = criarIframeVisualizador(linkExterno);

    // LIGAÇÃO 1: Adiciona evento ao novo campo de input secundário
    const linkSecundarioInput = document.getElementById("edit-link-secundario");
    if (linkSecundarioInput) {
      linkSecundarioInput.addEventListener("input", () => {
        // Sincroniza o campo secundário com o campo principal
        linkInput.value = linkSecundarioInput.value;
        // Atualiza o iframe com o valor sincronizado
        atualizarVisualizador();
      });
    }
  } else {
    visualizadorEmbed.innerHTML =
      '<p class="detalhes-nota">Cole o link de incorporação (embed) acima para pré-visualizar.</p>';
  }
}

// =========================
// 📌 CARREGAR DADOS DO FIREBASE (MANTIDO)
// =========================
async function carregarProjeto() {
  try {
    const snap = await get(child(ref(db), `projetos/${projetoId}`));

    if (!snap.exists()) {
      alert("Projeto não encontrado!");
      window.location.href = "config.html";
      return;
    }

    const dados = snap.val(); // Preencher os inputs

    tituloInput.value = dados.titulo || "";
    descInput.value = dados.descricao || "";
    cursoInput.value = dados.curso || "";

    // Usando a chave padronizada 'linkExterno'
    linkInput.value = dados.linkExterno || "";

    // ATUALIZAR VISUALIZADOR AO CARREGAR
    atualizarVisualizador(); // =============== INTEGRANTES ===============

    areaIntegrantes.innerHTML = "";
    const integrantes = dados.integrantes || {};

    Object.keys(integrantes).forEach((key) => {
      adicionarCampoIntegrante(integrantes[key].nome, integrantes[key].ra);
    });
  } catch (e) {
    console.error("Erro ao carregar detalhes:", e);
  }
}

carregarProjeto();

// =========================
// 📌 ADICIONAR CAMPO DE INTEGRANTE (MANTIDO)
// =========================
function adicionarCampoIntegrante(nome = "", ra = "") {
  // ... (código inalterado) ...
  const qtd = areaIntegrantes.children.length;

  if (qtd >= 6) {
    alert("Máximo de 6 integrantes!");
    return;
  }

  const div = document.createElement("div");
  div.className = "integrante-item";
  div.style.marginBottom = "10px";

  div.innerHTML = `
    <input type="text" placeholder="Nome do integrante" class="detalhes-input integrante-nome" value="${nome}">
    <input type="text" placeholder="RA" class="detalhes-input integrante-ra" value="${ra}">
    <button type="button" class="btn-excluir-integrante" style="background:red;color:white;border:none;padding:6px 10px;border-radius:6px;cursor:pointer">X</button>
  `;

  div.querySelector(".btn-excluir-integrante").addEventListener("click", () => {
    div.remove();
  });

  areaIntegrantes.appendChild(div);
}

btnAddIntegrante.addEventListener("click", () => {
  adicionarCampoIntegrante();
});

// LIGAÇÃO 2: Evento principal, dispara a atualização do visualizador quando o campo de cima muda
linkInput.addEventListener("input", atualizarVisualizador);

// =========================
// 📌 SALVAR ALTERAÇÕES (MANTIDO)
// =========================
btnSalvar.addEventListener("click", async (e) => {
  // ... (código inalterado) ...
  e.preventDefault();

  const nomes = [...document.querySelectorAll(".integrante-nome")];
  const ras = [...document.querySelectorAll(".integrante-ra")];

  if (nomes.length < 2) {
    alert("O projeto deve ter no mínimo 2 integrantes.");
    return;
  }

  const integrantes = {};
  nomes.forEach((el, i) => {
    integrantes[i] = { nome: el.value, ra: ras[i].value };
  });

  try {
    await update(ref(db, `projetos/${projetoId}`), {
      titulo: tituloInput.value,
      descricao: descInput.value,
      curso: cursoInput.value,
      // Salvando na chave padronizada 'linkExterno'
      linkExterno: linkInput.value,
      integrantes,
    });

    alert("Projeto atualizado!");
  } catch (erro) {
    console.error(erro);
    alert("Erro ao salvar.");
  }
});

// =========================
// 📌 EXCLUIR PROJETO (MANTIDO)
// =========================
btnExcluir.addEventListener("click", async () => {
  // ... (código inalterado) ...
  if (!confirm("Tem certeza que deseja excluir este projeto?")) return;

  try {
    await remove(ref(db, `projetos/${projetoId}`));
    alert("Projeto excluído!");
    window.location.href = "config.html";
  } catch (erro) {
    console.error(erro);
    alert("Erro ao excluir.");
  }
});
