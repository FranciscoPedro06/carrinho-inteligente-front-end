import { auth, db } from "../firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

document.getElementById("cadastroBtn").addEventListener("click", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const cpf = document.getElementById("cpf").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("password").value.trim();
  const confirmar = document.getElementById("confirmPassword").value.trim();

  if (!nome || !cpf || !email || !senha) {
    alert("⚠️ Preencha todos os campos obrigatórios!");
    return;
  }

  if (senha !== confirmar) {
    alert("❌ As senhas não coincidem!");
    return;
  }
try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;
    console.log("UID do usuário:", user.uid);

    await setDoc(doc(db, "user", user.uid), {
      cpf: cpf,
      email: email,
      nome: nome,
      senha: senha
    });
    console.log("✅ Documento salvo no Firestore");

    alert("✅ Usuário criado com sucesso!");
    window.location.href = "index.html";
} catch (error) {
    console.error("Erro no cadastro:", error);
    alert("❌ Erro: " + error.message);
}
});