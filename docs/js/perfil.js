// =========================
// 🔥 IMPORTAÇÕES DO FIREBASE
// =========================
import { db, auth } from "./firebase-config.js";
import {
  ref,
  set,
  get,
  child,
  remove,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// =========================
// 🔐 HASH SHA-256
// =========================
async function hashSenha(senha) {
  const encoder = new TextEncoder();
  const data = encoder.encode(senha);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function compararSenha(senhaDigitada, senhaHash) {
  const hashDigitada = await hashSenha(senhaDigitada);
  return hashDigitada === senhaHash;
}

// =========================
// 🌐 ELEMENTOS
// =========================
const loginSection = document.getElementById("loginSection");
const profileSection = document.getElementById("profileSection");
const editProfileSection = document.getElementById("editProfileSection");

const loginForm = document.getElementById("loginForm");
const profileForm = document.getElementById("profileForm");

const displayUsername = document.getElementById("displayUsername");
const displayEmail = document.getElementById("displayEmail");
const displayRA = document.getElementById("displayRA");
const displayCurso = document.getElementById("displayCurso");
const displayTipo = document.getElementById("displayTipo");

const logoutButton = document.getElementById("logoutButton");
const deleteButton = document.getElementById("deleteAccountButton");

const lembrarLoginCheckbox = document.getElementById("lembrarLogin");

// =========================
// 🔄 TROCAR ENTRE SEÇÕES
// =========================
const sectionButtons = document.querySelectorAll("[data-section]");
if (sectionButtons && sectionButtons.length) {
  sectionButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-section");
      if (loginSection)
        loginSection.style.display = target === "login" ? "block" : "none";
      if (profileSection)
        profileSection.style.display = target === "profile" ? "block" : "none";
      if (editProfileSection) editProfileSection.style.display = "none";
    });
  });
}

// =========================
// 🧾 CRIAR CONTA (ALUNOS + PROFESSORES)
// =========================
if (profileForm) {
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username =
      document.getElementById("new-username")?.value.trim() || "";
    const ra = document.getElementById("new-ra")?.value.trim() || "";
    const curso = document.getElementById("new-curso")?.value.trim() || "";
    const tipoNovoUser =
      document.getElementById("new-tipo")?.value.trim() || "alunos";
    const emailInput = document.getElementById("new-email");
    const email = emailInput ? emailInput.value.trim() : `${username}@etec.com`;
    const senha = document.getElementById("new-password")?.value.trim() || "";
    const confirmSenha =
      document.getElementById("confirm-password")?.value.trim() || "";

    if (!username || !ra || !curso || !senha || !confirmSenha) {
      alert("Todos os campos obrigatórios devem ser preenchidos!");
      return;
    }

    if (senha !== confirmSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      const dbRef = ref(db);

      const raSnapshot = await get(child(dbRef, `${tipoNovoUser}/${ra}`));

      if (raSnapshot.exists() && tipoNovoUser !== "professores") {
        alert("Esse RA já está cadastrado!");
        return;
      }

      const senhaHash = await hashSenha(senha);

      await set(ref(db, `${tipoNovoUser}/${ra}`), {
        ra,
        username,
        curso,
        email,
        senhaHash,
      });

      alert("Conta criada com sucesso!");
      profileForm.reset();

      if (profileSection) profileSection.style.display = "none";
      if (loginSection) loginSection.style.display = "block";
    } catch (err) {
      console.error("Erro ao criar conta:", err);
      alert("Erro ao criar conta. Veja o console.");
    }
  });
}

// =========================
// 🔑 LOGIN
// =========================
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const tipoLogin = document.getElementById("login-tipo")?.value || "alunos";
    const ra = document.getElementById("login-ra")?.value.trim() || "";
    const senha = document.getElementById("password")?.value.trim() || "";
    const lembrar = lembrarLoginCheckbox?.checked;

    if (!ra || !senha) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      const dbRef = ref(db);

      // ======== PROFESSOR LOGIN POR RA ========
      if (tipoLogin === "professores") {
        const professoresSnapshot = await get(child(dbRef, "professores"));
        if (!professoresSnapshot.exists()) {
          alert("Professor não encontrado!");
          return;
        }

        let professorEncontrado = null;

        professoresSnapshot.forEach((prof) => {
          if (prof.val().ra == ra) {
            professorEncontrado = prof.val();
          }
        });

        if (!professorEncontrado) {
          alert("RA de professor não encontrado!");
          return;
        }

        try {
          await signInWithEmailAndPassword(
            auth,
            professorEncontrado.email,
            senha
          );

          if (lembrar) {
            localStorage.setItem(
              "usuarioLogado",
              JSON.stringify({
                tipo: tipoLogin,
                ra: professorEncontrado.ra,
                username: professorEncontrado.nome,
                email: professorEncontrado.email,
                curso: "Professor",
              })
            );
          }

          mostrarPerfil(
            {
              ra: professorEncontrado.ra,
              username: professorEncontrado.nome,
              email: professorEncontrado.email,
              curso: "Professor",
            },
            tipoLogin
          );
          return;
        } catch (error) {
          alert("Senha incorreta ou professor não concluiu redefinição!");
          return;
        }
      }

      // ===== ADMIN OU ALUNO (LÓGICA MANTIDA) =====
      const snapshot = await get(child(dbRef, `${tipoLogin}/${ra}`));

      if (!snapshot.exists()) {
        alert("RA não encontrado!");
        return;
      }

      const dados = snapshot.val();

      const senhaCorreta =
        tipoLogin === "alunos"
          ? await compararSenha(senha, dados.senhaHash)
          : senha === dados.senha; // ADMIN

      if (!senhaCorreta) {
        alert("Senha incorreta!");
        return;
      }

      if (lembrar) {
        localStorage.setItem(
          "usuarioLogado",
          JSON.stringify({
            tipo: tipoLogin,
            ra: dados.ra,
            username: dados.username,
            email: dados.email,
            curso: dados.curso,
          })
        );
      }

      mostrarPerfil(dados, tipoLogin);
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      alert("Erro ao fazer login. Veja o console.");
    }
  });
}

// =========================
// 💾 AUTOLOGIN
// =========================
document.addEventListener("DOMContentLoaded", async () => {
  const usuarioSalvoRaw = localStorage.getItem("usuarioLogado");
  const usuarioLogado = usuarioSalvoRaw ? JSON.parse(usuarioSalvoRaw) : null;

  if (usuarioLogado) {
    try {
      const dbRef = ref(db);
      const snapshot = await get(
        child(dbRef, `${usuarioLogado.tipo}/${usuarioLogado.ra}`)
      );

      if (snapshot.exists() || usuarioLogado.tipo === "professores") {
        mostrarPerfil(
          snapshot.exists() ? snapshot.val() : usuarioLogado,
          usuarioLogado.tipo
        );
      } else {
        localStorage.removeItem("usuarioLogado");
      }
    } catch (err) {
      console.error("Erro no autologin:", err);
    }
  }
});

// =========================
// 🧍 MOSTRAR PERFIL
// =========================
function mostrarPerfil(dados, tipo = "alunos") {
  if (loginSection) loginSection.style.display = "none";
  if (profileSection) profileSection.style.display = "none";
  if (editProfileSection) editProfileSection.style.display = "block";

  displayUsername && (displayUsername.textContent = dados.username ?? "—");
  displayEmail && (displayEmail.textContent = dados.email ?? "—");
  displayRA && (displayRA.textContent = dados.ra ?? "—");
  displayCurso && (displayCurso.textContent = dados.curso ?? "—");
  displayTipo && (displayTipo.textContent = tipo);
}

// =========================
// 🚪 LOGOUT
// =========================
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");

    if (editProfileSection) editProfileSection.style.display = "none";
    if (loginSection) loginSection.style.display = "block";

    alert("Você saiu da conta!");
  });
}

// =========================
// 🗑️ APAGAR CONTA
// =========================
if (deleteButton) {
  deleteButton.addEventListener("click", async () => {
    const raAtual = displayRA?.textContent || "";
    const usuarioSalvoRaw = localStorage.getItem("usuarioLogado");
    const usuarioSalvo = usuarioSalvoRaw ? JSON.parse(usuarioSalvoRaw) : null;

    if (!usuarioSalvo) {
      alert("Erro: nenhum usuário logado.");
      return;
    }

    if (usuarioSalvo.tipo === "admin") {
      alert("Conta de administrador não pode ser apagada aqui.");
      return;
    }

    if (!confirm("Tem certeza que deseja apagar sua conta?")) return;

    try {
      await remove(ref(db, `${usuarioSalvo.tipo}/${raAtual}`));
      localStorage.removeItem("usuarioLogado");
      alert("Conta apagada com sucesso!");

      if (editProfileSection) editProfileSection.style.display = "none";
      if (loginSection) loginSection.style.display = "block";
    } catch (err) {
      console.error("Erro ao apagar conta:", err);
      alert("Erro ao apagar conta. Veja o console.");
    }
  });
}

// =========================
// 👁️ MOSTRAR / OCULTAR SENHA (OLHO ABERTO/FECHADO)
// =========================
document.querySelectorAll(".toggle-senha").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");
    const input = document.getElementById(targetId);
    if (!input) return;

    // Se a senha estiver sendo mostrada
    if (input.type === "text") {
      input.type = "password"; // esconde a senha
      btn.classList.remove("bx-show"); // remove olho aberto
      btn.classList.add("bx-hide"); // coloca olho fechado
    } else {
      input.type = "text"; // mostra a senha
      btn.classList.remove("bx-hide"); // remove olho fechado
      btn.classList.add("bx-show"); // coloca olho aberto
    }
  });
});
