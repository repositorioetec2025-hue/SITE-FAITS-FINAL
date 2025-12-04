import { db } from "./firebase-config.js";
import {
  ref,
  set,
  push,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// REMOVIDO: Importações do Firebase Auth (getAuth, onAuthStateChanged)

// VARIÁVEL GLOBAL PARA ARMAZENAR OS PROJETOS CARREGADOS
let projetosArray = [];
// VARIÁVEL GLOBAL PARA ARMAZENAR O ESTADO DO USUÁRIO (Baseado no LocalStorage)
let usuarioLogadoCache = null; // Usaremos esta variável para armazenar o objeto do usuário

// ===============================
// CONTROLE DE ACESSO VIA LOCALSTORAGE
// ===============================

// Função para verificar e retornar o objeto de usuário logado do localStorage
function verificarUsuarioLogado() {
  const usuarioRaw = localStorage.getItem("usuarioLogado");
  if (usuarioRaw) {
    try {
      // Tenta analisar o JSON e armazena na cache
      usuarioLogadoCache = JSON.parse(usuarioRaw);
      // Retorna algo que confirma o login (por exemplo, o RA)
      return usuarioLogadoCache.ra || true;
    } catch (e) {
      console.error("Erro ao analisar JSON do localStorage:", e);
      return null;
    }
  }
  return null;
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("🔰 armario.js carregado"); // ELEMENTOS DA INTERFACE

  // Checa o estado do usuário na inicialização do DOM
  verificarUsuarioLogado();

  const botoesAbrirForm = document.querySelectorAll(".js-abrir-form");
  const cadastrarSection = document.getElementById("add-project-section");
  const projectForm = document.getElementById("project-form");
  const btnCancelar = document.getElementById("btn-cancelar");
  const containerProjetos = document.getElementById("projects-grid-container");
  const btnSubmit = projectForm.querySelector('[type="submit"]'); // NOVO: Elemento de Ordenação

  const ordenacaoSelect = document.getElementById("ordenacao-select"); // Área de detalhes

  const detailsSection = document.getElementById("project-details");
  const detailsContent = document.getElementById("project-details-content");
  const btnCloseDetails = document.getElementById("close-project-details");

  // =============================== // FUNÇÕES DO FORMULÁRIO (MANTIDAS) // ===============================

  function abrirFormulario() {
    cadastrarSection.classList.remove("hidden");
    cadastrarSection.scrollIntoView({ behavior: "smooth" });
  }

  function fecharFormulario() {
    cadastrarSection.classList.add("hidden");
    projectForm.reset();
    btnSubmit.disabled = false;
    btnSubmit.textContent = "Salvar";
  }

  // ... (funções capturarIntegrantes, validarRAs) ...
  function capturarIntegrantes() {
    const integrantes = [];
    for (let i = 1; i <= 6; i++) {
      const nome = document.getElementById(`integrante${i}-nome`)?.value.trim();
      const ra = document.getElementById(`integrante${i}-ra`)?.value.trim();
      if (nome && ra) integrantes.push({ nome, ra });
    }
    return integrantes;
  }

  function validarRAs() {
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
  }

  // =============================== // SALVAR NO FIREBASE (MODIFICADO) // ===============================

  async function handleSalvarProjeto(event) {
    event.preventDefault();

    // 🛑 NOVO: VERIFICAÇÃO DE LOGIN APENAS POR LOCALSTORAGE
    const usuario = verificarUsuarioLogado();

    if (!usuario) {
      alert(
        "🔒 Você precisa estar logado para cadastrar um projeto! Faça login na página de perfil."
      );
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Salvar";
      return; // Impede a execução do restante do código
    }
    // ----------------------------

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
        // Usa o RA do objeto cache (ou 'uid' se fosse Firebase Auth)
        criadoPorRA: usuarioLogadoCache
          ? usuarioLogadoCache.ra
          : "desconhecido",
      });

      alert(`✔ Projeto "${titulo}" cadastrado com sucesso!`);
      fecharFormulario(); // Recarrega, o que recarrega o array e renderiza
      carregarTodosProjetos();
    } catch (erro) {
      console.error("❌ Erro ao salvar projeto:", erro);
      alert("Erro ao salvar projeto.");
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Salvar";
    }
  }
  // =============================== // NOVO: RENDERIZAR PROJETOS (MANTIDO) // ===============================

  // ... (renderizarProjetos, carregarTodosProjetos, ordenarProjetos, criarCardProjeto, escapeHtml, exibirProjetoCompleto) ...
  // (Mantenha todas as funções restantes do seu armario.js aqui)

  // Função de Sanitização (Escape HTML) - Mantenha no final ou onde estava
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // O resto das funções do seu arquivo anterior deve ser colado aqui:
  // Certifique-se de que renderizarProjetos, carregarTodosProjetos, etc., estão aqui.

  /* FUNÇÕES DE EXEMPLO (COLE AS SUAS COMPLETAS AQUI)
    function renderizarProjetos(projetosParaExibir) { /* ... */ /* }
    async function carregarTodosProjetos() { /* ... */ /* }
    function ordenarProjetos(tipoOrdenacao) { /* ... */ /* }
    function criarCardProjeto(projeto) { /* ... */ /* }
    function exibirProjetoCompleto(projeto) { /* ... */ /* }
    function fecharDetalhes() { /* ... */ /* }
   */

  // =============================== // EVENTOS (MODIFICADO) // ===============================

  // 3. Opcional: Adiciona verificação no clique do botão 'Abrir Formulário'
  botoesAbrirForm.forEach((btn) =>
    btn.addEventListener("click", () => {
      if (verificarUsuarioLogado()) {
        abrirFormulario();
      } else {
        alert(
          "🔒 Por favor, faça login através da página de perfil para cadastrar projetos."
        );
      }
    })
  );

  btnCancelar?.addEventListener("click", fecharFormulario);

  projectForm?.addEventListener("submit", handleSalvarProjeto);

  btnCloseDetails?.addEventListener("click", fecharDetalhes);

  ordenacaoSelect?.addEventListener("change", (event) => {
    ordenarProjetos(event.target.value);
  }); // CARREGAR NA INICIALIZAÇÃO

  carregarTodosProjetos();
});
