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
  console.log("✅ armario.js carregado com sucesso.");

  // =============================
  // 🔧 SELETORES
  // =============================
  const botoesAbrirForm = document.querySelectorAll(".js-abrir-form");
  const cadastrarSection = document.getElementById("add-project-section");
  const projectForm = document.getElementById("project-form");
  const btnCancelar = document.getElementById("btn-cancelar");
  const containerProjetos = document.getElementById("projects-grid-container");

  // =============================
  // 🪟 FORMULÁRIO
  // =============================
  function abrirFormulario() {
    cadastrarSection.classList.remove("hidden");
    cadastrarSection.scrollIntoView({ behavior: "smooth" });
  }

  function fecharFormulario() {
    cadastrarSection.classList.add("hidden");
    projectForm.reset();
  }

  // =============================
  // 💾 SALVAR PROJETO
  // =============================
  async function handleSalvarProjeto(event) {
    event.preventDefault();

    const titulo = document.getElementById("form-titulo").value.trim();
    const descricao = document.getElementById("form-descricao").value.trim();
    const curso = document.getElementById("form-curso").value.trim();
    const linkExterno = document.getElementById("form-link").value.trim();
    const arquivoInput = document.getElementById("form-documento-file");
    const arquivo = arquivoInput.files[0];

    if (!titulo || !descricao || !curso || !arquivo) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    if (arquivo.type !== "application/pdf") {
      alert("Por favor, selecione um arquivo PDF válido.");
      return;
    }

    // Capturar integrantes dinamicamente
    const integrantes = [];
    for (let i = 1; i <= 6; i++) {
      const nome = document.getElementById(`integrante${i}-nome`)?.value.trim();
      const ra = document.getElementById(`integrante${i}-ra`)?.value.trim();
      if (nome && ra) integrantes.push({ nome, ra });
    }

    try {
      const projetosRef = ref(db, "projetos");
      const novoProjetoRef = push(projetosRef);
      const idProjeto = novoProjetoRef.key;

      await set(novoProjetoRef, {
        id: idProjeto,
        titulo,
        descricao,
        curso,
        nomeArquivo: arquivo.name,
        linkExterno,
        integrantes,
        dataCriacao: new Date().toISOString(),
      });

      alert(`✅ Projeto "${titulo}" cadastrado com sucesso!`);
      fecharFormulario();
      carregarTodosProjetos();
    } catch (error) {
      console.error("❌ Erro ao salvar projeto:", error);
      alert("Erro ao salvar projeto. Verifique o console.");
    }
  }

  // =============================
  // 📋 LISTAR TODOS OS PROJETOS
  // =============================
  async function carregarTodosProjetos() {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, "projetos"));

    containerProjetos.innerHTML = "";

    if (snapshot.exists()) {
      const projetos = Object.values(snapshot.val());
      projetos.reverse(); // mostra os mais recentes primeiro

      projetos.forEach((projeto) => {
        const card = document.createElement("div");
        card.classList.add("projeto-card");
        card.innerHTML = `
          <h3>${projeto.titulo}</h3>
          <p><b>Descrição:</b> ${projeto.descricao}</p>
          <p><b>Curso:</b> ${projeto.curso}</p>
          <p><b>Integrantes:</b> ${
            projeto.integrantes && projeto.integrantes.length > 0
              ? projeto.integrantes.map((i) => `${i.nome} (${i.ra})`).join(", ")
              : "Nenhum integrante cadastrado"
          }</p>
          ${
            projeto.linkExterno
              ? `<a href="${projeto.linkExterno}" target="_blank">🔗 Acessar Link</a>`
              : ""
          }
        `;
        containerProjetos.appendChild(card);
      });
    } else {
      containerProjetos.innerHTML =
        "<p>📂 Nenhum projeto cadastrado ainda.</p>";
    }
  }

  // =============================
  // ⚙️ EVENTOS
  // =============================
  botoesAbrirForm.forEach((btn) =>
    btn.addEventListener("click", abrirFormulario)
  );
  btnCancelar.addEventListener("click", fecharFormulario);
  projectForm.addEventListener("submit", handleSalvarProjeto);

  // =============================
  // 🚀 INICIALIZAÇÃO
  // =============================
  carregarTodosProjetos();
});
