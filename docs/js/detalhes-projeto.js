import { db } from "./firebase-config.js";
import {
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// Pega ID da URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function carregarDetalhes() {
  if (!id) {
    alert("ID do projeto não informado!");
    return;
  }

  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, `projetos/${id}`));

  if (!snapshot.exists()) {
    alert("Projeto não encontrado!");
    return;
  }

  const projeto = snapshot.val();
  console.log("Projeto carregado:", projeto);

  // Título
  document.getElementById("titulo").innerText =
    projeto.titulo ?? "(Sem título)";

  // Curso
  document.getElementById("curso").innerText =
    "Curso: " + (projeto.curso ?? "Não informado");

  // Descrição
  document.getElementById("descricao").innerText =
    projeto.descricao ?? "Sem descrição";

  // Integrantes
  const lista = document.getElementById("listaIntegrantes");
  lista.innerHTML = ""; // limpar lista

  if (Array.isArray(projeto.integrantes)) {
    projeto.integrantes.forEach((i) => {
      const li = document.createElement("li");
      li.innerText = `${i.nome} - RA ${i.ra}`;
      lista.appendChild(li);
    });
  } else {
    lista.innerHTML = "<li>Nenhum integrante cadastrado.</li>";
  }
}

carregarDetalhes();
