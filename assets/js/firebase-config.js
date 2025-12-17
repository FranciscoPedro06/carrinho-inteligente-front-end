import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js"; 

const firebaseConfig = {
  apiKey: "AIzaSyDu939ID9K6mCjifhw8Xm9P0U-flvO9nWo",
  authDomain: "carrinho-inteligente-d5d90.firebaseapp.com",
  projectId: "carrinho-inteligente-d5d90",
  storageBucket: "carrinho-inteligente-d5d90.firebasestorage.app",
  messagingSenderId: "425401129695",
  appId: "1:425401129695:web:f7cd5a254d9a1fd3a7a76a",
  measurementId: "G-3XXL35KQ1M"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 
