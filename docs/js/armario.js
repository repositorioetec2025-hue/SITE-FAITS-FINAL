// js/armario.js
import { db } from "./firebase-config.js";
import {
  ref,
  set,
  push,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("🔰 armario.js carregado");

  // ELEMENTOS DA INTERFACE
  const botoesAbrirForm = document.querySelectorAll(".js-abrir-form");
  const cadastrarSection = document.getElementById("add-project-section");
  const projectForm = document.getElementById("project-form");
  const btnCancelar = document.getElementById("btn-cancelar");
  const containerProjetos = document.getElementById("projects-grid-container");
  const btnSubmit = projectForm.querySelector('[type="submit"]');

  // Área de detalhes
  const detailsSection = document.getElementById("project-details");
  const detailsContent = document.getElementById("project-details-content");
  const btnCloseDetails = document.getElementById("close-project-details");

  // ===============================
  // FORMULÁRIO
  // ===============================
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

  // ===============================
  // SALVAR NO FIREBASE
  // ===============================
  async function handleSalvarProjeto(event) {
    event.preventDefault();

    const titulo = document.getElementById("form-titulo").value.trim();
    const descricao = document.getElementById("form-descricao").value.trim();
    const curso = document.getElementById("form-curso").value.trim();
    const linkExterno = document.getElementById("form-link").value.trim();

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
      });

      alert(`✔ Projeto "${titulo}" cadastrado com sucesso!`);
      fecharFormulario();
      carregarTodosProjetos();
    } catch (erro) {
      console.error("❌ Erro ao salvar projeto:", erro);
      alert("Erro ao salvar projeto.");
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Salvar";
    }
  }

  // ===============================
  // CARREGAR TODOS OS PROJETOS
  // ===============================
  async function carregarTodosProjetos() {
    try {
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, "projetos"));

      containerProjetos.innerHTML = "";

      if (snapshot.exists()) {
        const projetos = Object.values(snapshot.val()).reverse();
        projetos.forEach((projeto) => {
          const card = criarCardProjeto(projeto);
          containerProjetos.appendChild(card);
        });
      } else {
        containerProjetos.innerHTML =
          "<p>📂 Nenhum projeto cadastrado ainda.</p>";
      }
    } catch (erro) {
      console.error("❌ Erro ao carregar projetos:", erro);
      containerProjetos.innerHTML = "<p>Erro ao carregar projetos.</p>";
    }
  }

  // ===============================
  // CRIAR CARD DA LISTA (SÓ COM TÍTULO)
  // ===============================
  function criarCardProjeto(projeto) {
    const card = document.createElement("div");
    card.classList.add("projeto-card");

    card.innerHTML = `
    <h3>${escapeHtml(projeto.titulo || "")}</h3>
  `;

    // Ao clicar, abre o modal completo
    card.addEventListener("click", () => exibirProjetoCompleto(projeto));

    return card;
  }

  // ===============================
  // ABRIR DETALHES DO PROJETO
  // ===============================
  async function abrirDetalhes(id) {
    const dbRef = ref(db);

    try {
      const snapshot = await get(child(dbRef, `projetos/${id}`));

      if (!snapshot.exists()) {
        alert("Projeto não encontrado!");
        return;
      }

      const projeto = snapshot.val();

      const integrantesTxt =
        projeto.integrantes?.length > 0
          ? projeto.integrantes.map((i) => `${i.nome} (${i.ra})`).join("<br>")
          : "Nenhum integrante cadastrado";

      const linkExternoHTML = projeto.linkExterno
        ? `<a href="${projeto.linkExterno}" target="_blank">🔗 Link externo</a>`
        : "Nenhum link cadastrado";

      detailsContent.innerHTML = `
        <h2>${escapeHtml(projeto.titulo)}</h2>
        <p><b>Descrição:</b> ${escapeHtml(projeto.descricao)}</p>
        <p><b>Curso:</b> ${escapeHtml(projeto.curso)}</p>
        <p><b>Integrantes:</b><br>${integrantesTxt}</p>
        <p><b>Link adicional:</b> ${linkExternoHTML}</p>
      `;

      detailsSection.classList.remove("hidden");
      detailsSection.scrollIntoView({ behavior: "smooth" });
    } catch (erro) {
      console.error("❌ Erro ao carregar detalhes:", erro);
      alert("Erro ao abrir detalhes.");
    }
  }

  function fecharDetalhes() {
    detailsSection.classList.add("hidden");
  }

  // ===============================
  // FUNÇÃO DE SANITIZAÇÃO
  // ===============================
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function exibirProjetoCompleto(projeto) {
    const modal = document.getElementById("modal-projeto");
    const caixa = document.getElementById("modal-projeto-detalhes");

    const integrantes =
      projeto.integrantes && projeto.integrantes.length > 0
        ? projeto.integrantes.map((i) => `${i.nome} (${i.ra})`).join("<br>")
        : "Nenhum integrante cadastrado";

    caixa.innerHTML = `
    <h2>${escapeHtml(projeto.titulo)}</h2>
    <p><b>Descrição:</b> ${escapeHtml(projeto.descricao)}</p>
    <p><b>Curso:</b> ${escapeHtml(projeto.curso)}</p>
    <p><b>Integrantes:</b><br>${integrantes}</p>

    ${
      projeto.linkExterno
        ? `<p><b>Link Externo:</b> <a href="${projeto.linkExterno}" target="_blank">Abrir</a></p>`
        : ""
    }
  `;

    modal.classList.remove("hidden");
  }

  document.getElementById("modal-fechar").addEventListener("click", () => {
    document.getElementById("modal-projeto").classList.add("hidden");
  });

  // Fechar ao clicar fora da caixa
  document.getElementById("modal-projeto").addEventListener("click", (e) => {
    if (e.target.id === "modal-projeto") {
      document.getElementById("modal-projeto").classList.add("hidden");
    }
  });

  // ===============================
  // EVENTOS
  // ===============================
  botoesAbrirForm.forEach((btn) =>
    btn.addEventListener("click", abrirFormulario)
  );

  btnCancelar?.addEventListener("click", fecharFormulario);

  projectForm?.addEventListener("submit", handleSalvarProjeto);

  btnCloseDetails?.addEventListener("click", fecharDetalhes);

  // CARREGAR NA INICIALIZAÇÃO
  carregarTodosProjetos();
});
