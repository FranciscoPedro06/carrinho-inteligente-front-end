// js/login/login.js

import { auth } from "../firebase-config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// Alternar visibilidade da senha — precisa estar no escopo global
window.togglePassword = function () {
  const passwordInput = document.getElementById("senha");
  const toggleIcon = document.getElementById("toggleIcon");
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.classList.replace("bi-eye", "bi-eye-slash");
  } else {
    passwordInput.type = "password";
    toggleIcon.classList.replace("bi-eye-slash", "bi-eye");
  }
};

// Evento de login
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    alert("Login realizado com sucesso!");
    window.location.href = "index.html"; // redireciona para a página principal
  } catch (error) {
    console.error(error);
    alert("Erro ao fazer login: " + traduzErroFirebase(error.code));
  }
});

// Observa mudanças de autenticação
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Usuário logado:", user.email);
  } else {
    console.log("Nenhum usuário logado.");
  }
});

// Tradução de erros do Firebase
function traduzErroFirebase(code) {
  const erros = {
    "auth/invalid-email": "E-mail inválido.",
    "auth/user-disabled": "Usuário desativado.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
  };
  return erros[code] || "Ocorreu um erro desconhecido.";
}


document.getElementById("forgotPasswordLink").addEventListener("click", () => {
  const email = prompt("Digite seu e-mail para recuperação de senha:");
  if (email) {
    sendPasswordResetEmail(auth, email)
      .then(() => alert("✅ E-mail de recuperação enviado!"))
      .catch(error => {
        console.error(error);
        alert("❌ Erro ao enviar e-mail: " + error.message);
      });
  }
});
