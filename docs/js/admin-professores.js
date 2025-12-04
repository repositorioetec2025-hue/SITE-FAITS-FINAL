// ===== IMPORTS FIREBASE =====
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  deleteUser,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  set,
  remove,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

import { app } from "./firebase-config.js";

// ===== Inicializações =====
const auth = getAuth(app);
const db = getDatabase(app);

// ===== DOM =====
const botoesAbrir = document.querySelectorAll(".js-abrir-form");
const btnCancelar = document.getElementById("btn-cancelar");
const formSection = document.getElementById("add-professor-section");
const formCadastro = document.getElementById("professor-form");
const professoresGrid = document.getElementById("professores-grid");

// ===== Mostrar / Ocultar Formulário =====
botoesAbrir.forEach((botao) => {
  botao.addEventListener("click", () => {
    formSection.classList.remove("hidden");
  });
});

btnCancelar.addEventListener("click", () => {
  formSection.classList.add("hidden");
});

// ===== CADASTRAR PROFESSOR =====
formCadastro.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("form-nome").value.trim();
  const email = document.getElementById("form-email").value.trim();
  const ra = document.getElementById("form-ra").value.trim();

  if (!nome || !email || !ra) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const senhaTemporaria = Math.random().toString(36).slice(-10);

    // Cria no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      senhaTemporaria
    );

    const uid = userCredential.user.uid;

    // Salva no Realtime Database
    await set(ref(db, "professores/" + uid), {
      nome,
      email,
      ra,
      uid,
    });

    await sendPasswordResetEmail(auth, email);

    alert(
      "Professor cadastrado com sucesso!\nUm email foi enviado para ele criar a senha."
    );

    formCadastro.reset();
    formSection.classList.add("hidden");
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    alert("Erro ao cadastrar professor: " + error.message);
  }
});

// ===== EXCLUIR PROFESSOR =====
async function excluirProfessor(uid, email) {
  if (!confirm(`Deseja excluir o professor:\n${email} ?`)) return;

  try {
    // Remove do banco
    await remove(ref(db, "professores/" + uid));

    // Opcional — TENTAR remover do Auth
    const userToDelete = await auth.getUser?.(uid);
    if (userToDelete) await deleteUser(userToDelete);

    alert("Professor excluído!");
  } catch (error) {
    console.error("Erro ao excluir:", error);
    alert("Erro ao excluir professor (usuário ainda pode existir no Auth).");
  }
}

// ===== LISTAR PROFESSORES =====
const professoresRef = ref(db, "professores/");

onValue(professoresRef, (snapshot) => {
  professoresGrid.innerHTML = "";

  if (!snapshot.exists()) {
    professoresGrid.innerHTML = `<p style="opacity:.6;">Nenhum professor cadastrado.</p>`;
    return;
  }

  snapshot.forEach((childSnapshot) => {
    const prof = childSnapshot.val();

    const card = document.createElement("div");
    card.classList.add("card-professor");

    card.innerHTML = `
      <button class="btn-excluir" title="Excluir" data-uid="${prof.uid}" data-email="${prof.email}">X</button>
      <h2>${prof.nome}</h2>
      <p><strong>Email:</strong> ${prof.email}</p>
      <p><strong>RA:</strong> ${prof.ra}</p>
    `;

    // Clique excluir
    card.querySelector(".btn-excluir").addEventListener("click", () => {
      excluirProfessor(prof.uid, prof.email);
    });

    professoresGrid.appendChild(card);
  });
});

