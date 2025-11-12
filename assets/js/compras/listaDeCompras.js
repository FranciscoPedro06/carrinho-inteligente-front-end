
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

document.getElementById('barcodeInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const barcode = this.value.trim();
        if (barcode) {
            adicionarProduto(barcode);
            this.value = '';
        }
    }
});

function adicionarProduto(barcode) {
    const produto = produtosDB[barcode];

    if (!produto) {
        mostrarAlerta('Produto não encontrado!', 'danger');
        return;
    }

    const itemExistente = carrinho.find(item => item.barcode === barcode);

    if (itemExistente) {
        itemExistente.quantidade++;
    } else {
        carrinho.push({
            barcode: barcode,
            nome: produto.nome,
            preco: produto.preco,
            quantidade: 1
        });
    }

    atualizarCarrinho();
    mostrarAlerta('Produto adicionado!', 'success');
}

function removerProduto(barcode) {
    carrinho = carrinho.filter(item => item.barcode !== barcode);
    atualizarCarrinho();
    mostrarAlerta('Produto removido!', 'info');
}

function alterarQuantidade(barcode, delta) {
    const item = carrinho.find(item => item.barcode === barcode);
    if (item) {
        item.quantidade += delta;
        if (item.quantidade <= 0) {
            removerProduto(barcode);
        } else {
            atualizarCarrinho();
        }
    }
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
                    </div>
                `;
        cartSummary.style.display = 'none';
        itemCount.textContent = '0';
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
                            <div class="item-price">
                                R$ ${itemTotal.toFixed(2)}
                            </div>
                            <button class="remove-btn" onclick="removerProduto('${item.barcode}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
    });

    cartItemsList.innerHTML = html;

    const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
    itemCount.textContent = totalItens;

    const desconto = 0; 
    const total = subtotal - desconto;

    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('discount').textContent = `R$ ${desconto.toFixed(2)}`;
    document.getElementById('total').textContent = `R$ ${total.toFixed(2)}`;

    cartSummary.style.display = 'block';

    document.getElementById('barcodeInput').focus();
}

function mostrarAlerta(mensagem, tipo) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo} alert-dismissible fade show alert-custom`;
    alertDiv.innerHTML = `
                ${mensagem}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

function finalizarCompra() {
    if (carrinho.length === 0) return;

    const total = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);

    if (confirm(`Finalizar compra no valor de R$ ${total.toFixed(2)}?`)) {
        mostrarAlerta('Compra finalizada com sucesso!', 'success');
        carrinho = [];
        atualizarCarrinho();
    }
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        if (confirm('Deseja limpar o carrinho?')) {
            carrinho = [];
            atualizarCarrinho();
        }
    }
});