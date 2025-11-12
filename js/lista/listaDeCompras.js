import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

// ================================
// 🔧 Config Firebase
// ================================
const firebaseConfig = {
  apiKey: "AIzaSyDu939ID9K6mCjifhw8Xm9P0U-flvO9nWo",
  authDomain: "carrinho-inteligente-d5d90.firebaseapp.com",
  databaseURL: "https://carrinho-inteligente-d5d90-default-rtdb.firebaseio.com",
  projectId: "carrinho-inteligente-d5d90",
  storageBucket: "carrinho-inteligente-d5d90.firebasestorage.app",
  messagingSenderId: "425401129695",
  appId: "1:425401129695:web:f7cd5a254d9a1fd3a7a76a",
  measurementId: "G-3XXL35KQ1M"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ================================
// 🧾 Produtos
// ================================
const produtosDB = {
  '7891234567890': { nome: 'Arroz Integral 1kg', preco: 12.90 },
  '7891234567891': { nome: 'Feijão Preto 1kg', preco: 8.50 },
  '7891234567892': { nome: 'Macarrão Espaguete 500g', preco: 4.20 },
  '7891234567893': { nome: 'Óleo de Soja 900ml', preco: 7.80 },
  '7891234567894': { nome: 'Açúcar Cristal 1kg', preco: 5.30 },
  '7891234567895': { nome: 'Café Torrado 500g', preco: 15.90 },
  '7891234567896': { nome: 'Leite Integral 1L', preco: 4.50 },
  '7891234567897': { nome: 'Farinha de Trigo 1kg', preco: 6.20 },
  '7891234567898': { nome: 'Sal Refinado 1kg', preco: 2.10 },
  '7891234567899': { nome: 'Molho de Tomate 500g', preco: 3.80 }
};

let carrinho = [];
document.getElementById('barcodeInput').focus();

// ================================
// 📦 Escanear produtos
// ================================
document.getElementById('barcodeInput').addEventListener('keypress', async function (e) {
  if (e.key === 'Enter') {
    const barcode = this.value.trim();
    if (!barcode) return;
    adicionarProduto(barcode);
    await set(ref(db, 'arduino/barcode'), barcode); // envia pro Wokwi
    this.value = '';
  }
});

// ================================
// 📲 Atualizar Firebase
// ================================
async function atualizarTotalFirebase() {
  const total = carrinho.reduce((s, i) => s + (i.preco * i.quantidade), 0);
  await set(ref(db, 'arduino/total'), total);
}

// ================================
// 🧮 Carrinho
// ================================
function adicionarProduto(barcode) {
  const produto = produtosDB[barcode];
  if (!produto) return mostrarAlerta('Produto não encontrado!', 'danger');

  const item = carrinho.find(i => i.barcode === barcode);
  if (item) item.quantidade++;
  else carrinho.push({ barcode, nome: produto.nome, preco: produto.preco, quantidade: 1 });

  atualizarCarrinho();
  mostrarAlerta('Produto adicionado!', 'success');
}

function removerProduto(barcode) {
  carrinho = carrinho.filter(i => i.barcode !== barcode);
  atualizarCarrinho();
  mostrarAlerta('Produto removido!', 'info');
}

function alterarQuantidade(barcode, delta) {
  const item = carrinho.find(i => i.barcode === barcode);
  if (!item) return;
  item.quantidade += delta;
  if (item.quantidade <= 0) removerProduto(barcode);
  else atualizarCarrinho();
}

function atualizarCarrinho() {
  const cartItemsList = document.getElementById('cartItemsList');
  const itemCount = document.getElementById('itemCount');
  const cartSummary = document.getElementById('cartSummary');

  if (carrinho.length === 0) {
    cartItemsList.innerHTML = `
      <div class="empty-cart">
        <i class="bi bi-cart-x"></i>
        <p>Seu carrinho está vazio</p>
        <small>Comece escaneando produtos</small>
      </div>`;
    cartSummary.style.display = 'none';
    itemCount.textContent = '0';
    atualizarTotalFirebase();
    return;
  }

  let html = '';
  let subtotal = 0;

  carrinho.forEach(item => {
    const itemTotal = item.preco * item.quantidade;
    subtotal += itemTotal;
    html += `
      <div class="cart-item">
        <div class="item-info">
          <div class="item-name">${item.nome}</div>
          <div class="item-barcode">Código: ${item.barcode}</div>
        </div>
        <div class="item-controls">
          <div class="quantity-control">
            <button onclick="alterarQuantidade('${item.barcode}', -1)">
              <i class="bi bi-dash"></i>
            </button>
            <span>${item.quantidade}</span>
            <button onclick="alterarQuantidade('${item.barcode}', 1)">
              <i class="bi bi-plus"></i>
            </button>
          </div>
          <div class="item-price">R$ ${itemTotal.toFixed(2)}</div>
          <button class="remove-btn" onclick="removerProduto('${item.barcode}')">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>`;
  });

  cartItemsList.innerHTML = html;
  itemCount.textContent = carrinho.reduce((s, i) => s + i.quantidade, 0);
  const total = subtotal;

  document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
  document.getElementById('discount').textContent = `R$ 0,00`;
  document.getElementById('total').textContent = `R$ ${total.toFixed(2)}`;

  cartSummary.style.display = 'block';
  atualizarTotalFirebase();
}

// ================================
// 💬 Alertas
// ================================
function mostrarAlerta(msg, tipo) {
  const div = document.createElement('div');
  div.className = `alert alert-${tipo} alert-dismissible fade show alert-custom`;
  div.innerHTML = `${msg} <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// ================================
// 💳 Pagamento estilizado
// ================================
window.finalizarCompra = function () {
  if (carrinho.length === 0) return mostrarAlerta('Carrinho vazio!', 'warning');
  document.getElementById("paymentModal").style.display = "flex";
};

window.escolherPagamento = async function (opcao) {
  document.getElementById("paymentModal").style.display = "none";
  await set(ref(db, "arduino/pagamento/opcao"), opcao);
  mostrarAlerta("Processando pagamento...", "info");
};

// Recebe status do pagamento
onValue(ref(db, "arduino/pagamento/status"), (snap) => {
  const status = snap.val();
  if (status) mostrarAlerta(`💳 ${status}`, "success");
});