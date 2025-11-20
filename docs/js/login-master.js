import { db } from "./firebase-config.js";
import {
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const ra = document.getElementById("ra").value.trim();
  const senha = document.getElementById("senha").value.trim();

  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `admin/${ra}`));

    if (!snapshot.exists()) {
      alert("RA não encontrado no master.");
      return;
    }

    const dados = snapshot.val();

    if (dados.senha !== senha) {
      alert("Senha incorreta.");
      return;
    }

    alert("Login realizado!");

    sessionStorage.setItem("masterLogado", ra);
    window.location.href = "painel-master.html";
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    alert("Erro inesperado ao tentar logar.");
  }
});
