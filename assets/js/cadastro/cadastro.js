// js/cadastro/cadastro.js

import { auth } from "../firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

document.getElementById("cadastroBtn").addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("password").value.trim();
  const confirmar = document.getElementById("confirmPassword").value.trim();

  if (!email || !senha) {
    alert("⚠️ Preencha e-mail e senha antes de se cadastrar!");
    return;
  }

  if (senha !== confirmar) {
    alert("❌ As senhas não coincidem!");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, senha);
    alert("✅ Usuário criado com sucesso!");
    window.location.href = "index.html"; // Redireciona para login
  } catch (error) {
    console.error(error);
    switch (error.code) {
      case "auth/email-already-in-use":
        alert("❌ Este e-mail já está cadastrado!");
        break;
      case "auth/invalid-email":
        alert("❌ E-mail inválido!");
        break;
      case "auth/weak-password":
        alert("❌ A senha deve ter pelo menos 6 caracteres!");
        break;
      default:
        alert("❌ Erro: " + error.message);
    }
  }
});
