// Importa o SDK principal do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// 🔥 Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDu939ID9K6mCjifhw8Xm9P0U-flvO9nWo",
  authDomain: "carrinho-inteligente-d5d90.firebaseapp.com",
  projectId: "carrinho-inteligente-d5d90",
  storageBucket: "carrinho-inteligente-d5d90.appspot.com", // ✅ corrigido
  messagingSenderId: "425401129695",
  appId: "1:425401129695:web:f7cd5a254d9a1fd3a7a76a",
  measurementId: "G-3XXL35KQ1M",
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta a autenticação
export const auth = getAuth(app);

console.log("✅ Firebase configurado com sucesso!");
