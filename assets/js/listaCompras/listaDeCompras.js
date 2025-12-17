import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp,
    query,
    where,
    orderBy,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

import { auth } from "../firebase-config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
const db = getFirestore();



const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
        alert("Você saiu da conta com sucesso!");
        window.location.href = "index.html"; 
    } catch (error) {
        console.error("Erro ao sair:", error);
        alert("Não foi possível sair da conta.");
    }
});



const API = "http://localhost:5000";

const cartItemsList = document.getElementById("cartItemsList");
const itemCount = document.getElementById("itemCount");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const cartSummary = document.getElementById("cartSummary");

const elementosCarrinho = {};

let usuarioLogado = null;
auth.onAuthStateChanged(user => {
    usuarioLogado = user;
});


async function atualizarCarrinho() {
    try {
        const res = await fetch(`${API}/cart`);
        const data = await res.json();

        const items = data.items;
        const keys = Object.keys(items);

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

            for (let key in elementosCarrinho) delete elementosCarrinho[key];
            return;
        }

        const emptyCartDiv = cartItemsList.querySelector(".empty-cart");
        if (emptyCartDiv) emptyCartDiv.remove();

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

        for (let key in elementosCarrinho) {
            if (!items[key]) {
                elementosCarrinho[key].remove();
                delete elementosCarrinho[key];
            }
        }

        itemCount.textContent = keys.length;
        subtotalEl.textContent = "R$ " + data.subtotal.toFixed(2);
        totalEl.textContent = "R$ " + data.subtotal.toFixed(2);
        cartSummary.style.display = "block";

    } catch (err) {
        console.error("Erro ao buscar carrinho:", err);
    }
}

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


async function finalizarCompra() {
    if (!confirm("Deseja finalizar a compra?")) return;

    if (!auth.currentUser) {
        alert("Você precisa estar logado para finalizar a compra!");
        return;
    }

    const resCart = await fetch(`${API}/cart`);
    const cartData = await resCart.json();

    await salvarHistorico(cartData);

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
            where("user_uid", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            historicoList.innerHTML = "<p>Você ainda não realizou nenhuma compra.</p>";
            return;
        }

        historicoList.innerHTML = "";

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            console.log("Doc data:", data); 

            const compraDiv = document.createElement("div");
            compraDiv.className = "historico-item";

            const dataCompra = data.timestamp?.toDate?.()?.toLocaleString?.() || "Data não disponível";

           
            let produtosHTML = "";
            if (data.cart?.items) {
                for (const code in data.cart.items) {
                    const item = data.cart.items[code];
                    produtosHTML += `<div>${item.name} - ${item.quantity} × R$ ${item.price.toFixed(2)}</div>`;
                }
            }

            const total = data.cart?.subtotal?.toFixed(2) || "0,00";

            compraDiv.innerHTML = `
                <div>
                    <strong>Data:</strong> ${dataCompra}<br>
                    <strong>Produtos:</strong><br> ${produtosHTML}
                    <strong>Total:</strong> R$ ${total}
                </div>
                <hr>
            `;

            historicoList.appendChild(compraDiv);
        });
    } catch (err) {
        console.error("Erro ao buscar histórico:", err);
        historicoList.innerHTML = "<p>Erro ao carregar histórico.</p>";
    }
}

setInterval(atualizarCarrinho, 1000);
atualizarCarrinho();

window.removerItem = removerItem;
window.finalizarCompra = finalizarCompra;
window.verHistorico = verHistorico;
