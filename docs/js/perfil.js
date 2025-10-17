// js/perfil.js

import { auth } from './firebase-init.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile,
    sendEmailVerification,
    EmailAuthProvider,           // <-- VÍRGULA ADICIONADA
    reauthenticateWithCredential,
    deleteUser
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ======================================================
// FUNÇÃO TRADUTORA DE ERROS DO FIREBASE
// ======================================================
function traduzirErroFirebase(errorCode) {
    const mensagensDeErro = {
        'auth/email-already-in-use': 'Este endereço de e-mail já está cadastrado. Por favor, tente fazer login.',
        'auth/weak-password': 'A senha é muito fraca. Ela deve ter no mínimo 6 caracteres.',
        'auth/invalid-credential': 'E-mail ou senha inválidos. Verifique suas credenciais e tente novamente.',
        'auth/invalid-email': 'O formato do endereço de e-mail é inválido.',
        'auth/operation-not-allowed': 'O login por e-mail e senha não está ativado.',
        'auth/wrong-password': 'Senha incorreta. A conta não foi apagada.',
        'auth/requires-recent-login': 'Esta operação é sensível e requer um login recente. Por favor, faça logout e login novamente antes de tentar.'
    };
    return mensagensDeErro[errorCode] || 'Ocorreu um erro inesperado. Por favor, tente novamente.';
}


// ======================================================
// CONTROLE PRINCIPAL DA PÁGINA ("O VIGIA")
// ======================================================
onAuthStateChanged(auth, user => {
    if (user) {
        if (!user.emailVerified) {
            console.log("E-mail ainda não verificado.");
        }
        document.getElementById('displayEmail').textContent = user.email;
        document.getElementById('displayUsername').textContent = user.displayName || 'Não definido';
        document.getElementById('displayRA').textContent = 'Em breve';
        showSection('editProfileSection');
    } else {
        showSection('loginSection');
    }
});


// ======================================================
// EVENTOS DOS FORMULÁRIOS E BOTÕES
// ======================================================

// Formulário de Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('password').value;
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Erro no login:", error.code);
            alert(traduzirErroFirebase(error.code));
        }
    });
}

// Formulário de Cadastro
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('new-username').value;
        const email = document.getElementById('new-email').value;
        const password = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: username });
            await sendEmailVerification(user); 
            
            alert('Conta criada com sucesso! Um e-mail de verificação foi enviado para ' + user.email + '. Por favor, verifique sua caixa de entrada (e spam) antes de fazer login.');
            
            await signOut(auth);
        } catch (error) {
            console.error("Erro no cadastro:", error.code);
            alert(traduzirErroFirebase(error.code));
        }
    });
}

// Botão de Logout
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        await signOut(auth);
    });
}

// Botão de Apagar Conta
const deleteAccountButton = document.getElementById('deleteAccountButton');
if (deleteAccountButton) {
    deleteAccountButton.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) return;

        const isSure = confirm("Você tem certeza ABSOLUTA que deseja apagar sua conta? Esta ação é irreversível e todos os seus dados serão perdidos.");
        if (!isSure) return;

        const password = prompt("Para confirmar, por favor, digite sua senha:");
        if (!password) {
            alert("Operação cancelada. A senha é necessária.");
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);
            await deleteUser(user);
            alert("Sua conta foi apagada com sucesso!");
        } catch (error) {
            console.error("Erro ao apagar a conta:", error.code);
            alert(traduzirErroFirebase(error.code));
        }
    });
}


// ======================================================
// FUNÇÕES AUXILIARES DE UI
// ======================================================
function showSection(sectionIdToShow) {
    const sections = ['loginSection', 'profileSection', 'editProfileSection'];
    sections.forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.style.display = (sectionId === sectionIdToShow) ? 'block' : 'none';
        }
    });
}

document.querySelectorAll('[data-section]').forEach(button => {
    button.addEventListener('click', (event) => {
        const sectionName = event.target.getAttribute('data-section');
        showSection(sectionName === 'profile' ? 'profileSection' : 'loginSection');
    });
});