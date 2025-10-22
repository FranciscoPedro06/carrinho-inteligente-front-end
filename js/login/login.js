// Importa o objeto "auth" já configurado do Firebase
import { auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// === LOGIN ===
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    alert("✅ Login realizado com sucesso!");
    console.log(userCredential.user);
    // window.location.href = "dashboard.html";
  } catch (error) {
    switch (error.code) {
      case "auth/invalid-email":
        alert("❌ E-mail inválido!");
        break;
      case "auth/user-disabled":
        alert("❌ Usuário desativado!");
        break;
      case "auth/user-not-found":
        alert("❌ Usuário não encontrado! Verifique o e-mail ou cadastre-se.");
        break;
      case "auth/wrong-password":
        alert("❌ Senha incorreta!");
        break;
      default:
        alert("❌ Erro no login: " + error.message);
    }
  }
});

