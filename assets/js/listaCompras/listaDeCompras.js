import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { auth } from "../firebase-config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// Logout
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
        alert("Você saiu da conta com sucesso!");
        window.location.href = "index.html"; // Redireciona para a tela de login
    } catch (error) {
        console.error("Erro ao sair:", error);
        alert("Não foi possível sair da conta.");
    }
});

const db = getFirestore();


const API = "http://localhost:5000";

const cartItemsList = document.getElementById("cartItemsList");
const itemCount = document.getElementById("itemCount");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const cartSummary = document.getElementById("cartSummary");

// Armazena os elementos já criados
const elementosCarrinho = {};

// Guarda o usuário logado
let usuarioLogado = null;
auth.onAuthStateChanged(user => {
    usuarioLogado = user;
});

// ==========================
// ATUALIZA CARRINHO
// ==========================
async function atualizarCarrinho() {
    try {
        const res = await fetch(`${API}/cart`);
        const data = await res.json();

        const items = data.items;
        const keys = Object.keys(items);

        // Carrinho vazio
        if (keys.length === 0) {
            cartItemsList.innerHTML = `
                <div class="empty-cart">
                    <i class="bi bi-cart-x"></i>
                    <p>Seu carrinho está vazio</p>
                    <small>Comece escaneando produtos</small>
                </div>
            `;
            itemCount.textContent = 0;
            subtotalEl.textContent = "R$ 0,00";
            totalEl.textContent = "R$ 0,00";
            cartSummary.style.display = "none";

            // Limpa elementos armazenados
            for (let key in elementosCarrinho) delete elementosCarrinho[key];
            return;
        }

        // Remove placeholder se houver
        const emptyCartDiv = cartItemsList.querySelector(".empty-cart");
        if (emptyCartDiv) emptyCartDiv.remove();

        // Atualiza ou cria elementos do carrinho
        keys.forEach(code => {
            const item = items[code];
            const subtotalItem = item.price * item.quantity;

            if (!elementosCarrinho[code]) {
                const div = document.createElement("div");
                div.className = "cart-item";
                div.innerHTML = `
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-barcode">${code}</div>
                    </div>
                    <div class="item-controls">
                        <span class="item-quantity">${item.quantity} × R$ ${item.price.toFixed(2)}</span>
                        <span class="item-subtotal">R$ ${subtotalItem.toFixed(2)}</span>
                        <button class="remove-btn" onclick="removerItem('${code}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                `;
                cartItemsList.appendChild(div);
                elementosCarrinho[code] = div;
            } else {
                elementosCarrinho[code].querySelector(".item-quantity").textContent = `${item.quantity} × R$ ${item.price.toFixed(2)}`;
                elementosCarrinho[code].querySelector(".item-subtotal").textContent = `R$ ${subtotalItem.toFixed(2)}`;
            }
        });

        // Remove elementos que não existem mais
        for (let key in elementosCarrinho) {
            if (!items[key]) {
                elementosCarrinho[key].remove();
                delete elementosCarrinho[key];
            }
        }

        // Atualiza totais
        itemCount.textContent = keys.length;
        subtotalEl.textContent = "R$ " + data.subtotal.toFixed(2);
        totalEl.textContent = "R$ " + data.subtotal.toFixed(2);
        cartSummary.style.display = "block";

    } catch (err) {
        console.error("Erro ao buscar carrinho:", err);
    }
}

// ==========================
// REMOVER ITEM
// ==========================
async function removerItem(code) {
    if (!confirm("Remover este item do carrinho?")) return;

    try {
        await fetch(`${API}/remove`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code })
        });
        atualizarCarrinho();
    } catch (err) {
        console.error("Erro ao remover item:", err);
    }
}

// ==========================
// FINALIZAR COMPRA
// ==========================
async function finalizarCompra() {
    if (!confirm("Deseja finalizar a compra?")) return;

    if (!auth.currentUser) {
        alert("Você precisa estar logado para finalizar a compra!");
        return;
    }

    // Pega carrinho atual
    const resCart = await fetch(`${API}/cart`);
    const cartData = await resCart.json();

    // Salva diretamente no Firestore
    await salvarHistorico(cartData);

    // Limpa carrinho
    await fetch(`${API}/clear`, { method: "POST" });
    atualizarCarrinho();
}


async function salvarHistorico(cart) {
    if (!auth.currentUser) {
        alert("Você precisa estar logado para salvar a compra!");
        return;
    }

    const user = auth.currentUser;

    try {
        await addDoc(collection(db, "historico_compras"), {
            user_email: user.email,
            user_uid: user.uid,
            cart: cart,
            timestamp: serverTimestamp()
        });

        console.log("✅ Compra salva no Firebase!");
        alert("Compra finalizada com sucesso!");
    } catch (err) {
        console.error("Erro ao salvar histórico:", err);
        alert("Erro ao salvar a compra. Veja o console.");
    }
}


// Função para exibir histórico
async function verHistorico() {
    if (!auth.currentUser) {
        alert("Você precisa estar logado para ver o histórico!");
        return;
    }

    const historicoContainer = document.getElementById("historicoContainer");
    const historicoList = document.getElementById("historicoList");
    historicoList.innerHTML = "<p>Carregando histórico...</p>";
    historicoContainer.style.display = "block";

    const user = auth.currentUser;

    try {
        const q = query(
            collection(db, "historico_compras"),
            where("user_uid", "==", user.uid),
            orderBy("timestamp", "desc")
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            historicoList.innerHTML = "<p>Você ainda não realizou nenhuma compra.</p>";
            return;
        }

        historicoList.innerHTML = ""; // Limpa lista
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const compraDiv = document.createElement("div");
            compraDiv.className = "historico-item";

            // Formata data
            const dataCompra = data.timestamp?.toDate().toLocaleString() || "";

            // Lista produtos
            let produtosHTML = "";
            for (const code in data.cart.items) {
                const item = data.cart.items[code];
                produtosHTML += `<div>${item.name} - ${item.quantity} × R$ ${item.price.toFixed(2)}</div>`;
            }

            compraDiv.innerHTML = `
                <strong>Data:</strong> ${dataCompra}<br>
                <strong>Produtos:</strong><br> ${produtosHTML}
                <strong>Total:</strong> R$ ${data.cart.subtotal.toFixed(2)}
            `;

            historicoList.appendChild(compraDiv);
        });
    } catch (err) {
        console.error("Erro ao buscar histórico:", err);
        historicoList.innerHTML = "<p>Erro ao carregar histórico.</p>";
    }
}





// ==========================
// LOOP DE ATUALIZAÇÃO
// ==========================
setInterval(atualizarCarrinho, 1000);
atualizarCarrinho();


// Expondo funções para HTML
window.removerItem = removerItem;
window.finalizarCompra = finalizarCompra;
window.verHistorico = verHistorico;
