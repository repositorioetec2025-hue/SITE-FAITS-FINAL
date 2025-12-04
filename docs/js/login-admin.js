// =========================
// 🔥 IMPORTAÇÕES DO FIREBASE
// =========================
import { db } from "./firebase-config.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// =========================
// 📌 FORM DO LOGIN ADMIN
// =========================
const form = document.getElementById("loginMasterForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const ra = document.getElementById("login-ra").value.trim();
    const senha = document.getElementById("login-senha").value.trim();

    if (!ra || !senha) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      // 🔎 Busca o administrador pelo RA
      const adminRef = ref(db, `admin/${ra}`);
      const snapshot = await get(adminRef);

      if (!snapshot.exists()) {
        alert("RA de administrador não encontrado!");
        return;
      }

      const dados = snapshot.val();

      // Verificação simples da senha (admin não usa hash)
      if (dados.senha !== senha) {
        alert("Senha incorreta!");
        return;
      }

      // ==============================
      // 🔥 LOGIN DO ADMINISTRADOR
      // ==============================
      localStorage.setItem(
        "usuarioLogado",
        JSON.stringify({
          tipo: "admin",
          ra: ra,
          username: dados.Usuario || "Administrador",
          email: dados.email || "",
        })
      );

      alert("Login realizado com sucesso!");
      window.location.href = "perfil.html";
    } catch (error) {
      console.error("Erro ao acessar o banco:", error);
      alert("Erro ao acessar o banco de dados. Veja o console.");
    }
  });
}

// =========================
// 👁️ MOSTRAR / OCULTAR SENHA
// =========================
document.querySelectorAll(".toggle-senha").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");
    const input = document.getElementById(targetId);
    if (!input) return;

    const isShowing = input.type === "text";

    input.type = isShowing ? "password" : "text";

    // Alterna ícones bx-show / bx-hide
    btn.classList.toggle("bx-show", !isShowing);
    btn.classList.toggle("bx-hide", isShowing);
  });
});
