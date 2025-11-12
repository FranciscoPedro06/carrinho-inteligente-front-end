 // Gerar código QR aleatório
        function gerarCodigoQR() {
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);
            const codigo = `CART-${timestamp}-${random}`;
            document.getElementById('codigoQr').value = codigo;
            
            // Mostrar QR Code
            document.getElementById('qrCodeDisplay').style.display = 'block';
            document.getElementById('qrCodeText').textContent = codigo;
        }

        // Atualizar preço do produto selecionado
        function atualizarPrecoProduto() {
            const select = document.getElementById('produtoId');
            const selectedOption = select.options[select.selectedIndex];
            const preco = selectedOption.getAttribute('data-preco');
            
            if (preco) {
                document.getElementById('precoUnit').value = preco;
                calcularPrecoTotal();
            }
        }

        // Calcular preço total do item
        function calcularPrecoTotal() {
            const quantidade = parseFloat(document.getElementById('quantidade').value) || 0;
            const precoUnit = parseFloat(document.getElementById('precoUnit').value) || 0;
            const precoTotal = (quantidade * precoUnit).toFixed(2);
            
            document.getElementById('precoTotal').value = precoTotal;
        }

        // Atualizar total da sessão
        function atualizarTotalSessao() {
            // Aqui você calcularia o total baseado nos itens da sessão
            console.log('[v0] Atualizando total da sessão');
        }

        // Form Carrinho Físico
        document.getElementById('formCarrinhoFisico').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const dados = {
                loja_id: document.getElementById('lojaId').value,
                codigo_qr: document.getElementById('codigoQr').value,
                status: document.getElementById('statusCarrinho').value,
                criado_em: new Date().toISOString()
            };
            
            console.log('[v0] Salvando carrinho físico:', dados);
            alert('Carrinho físico cadastrado com sucesso!');
            this.reset();
            document.getElementById('qrCodeDisplay').style.display = 'none';
        });

        // Form Sessão
        document.getElementById('formSessao').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const dados = {
                carrinho_id: document.getElementById('carrinhoIdSessao').value,
                cliente_id: document.getElementById('clienteId').value,
                status: document.getElementById('statusSessao').value,
                total: parseFloat(document.getElementById('totalSessao').value),
                criado_em: new Date().toISOString(),
                atualizado_em: new Date().toISOString()
            };
            
            console.log('[v0] Salvando sessão:', dados);
            alert('Sessão cadastrada com sucesso!');
            this.reset();
        });

        // Form Itens
        document.getElementById('formItens').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const dados = {
                sessao_id: document.getElementById('sessaoId').value,
                produto_id: document.getElementById('produtoId').value,
                quantidade: parseFloat(document.getElementById('quantidade').value),
                preco_unit: parseFloat(document.getElementById('precoUnit').value),
                preco_total: parseFloat(document.getElementById('precoTotal').value),
                adicionado_em: new Date().toISOString()
            };
            
            console.log('[v0] Adicionando item:', dados);
            alert('Item adicionado com sucesso!');
            this.reset();
        });

        // Funções de edição e exclusão
        function editarCarrinho(id) {
            console.log('[v0] Editando carrinho:', id);
            alert('Função de edição será implementada');
        }

        function excluirCarrinho(id) {
            if (confirm('Deseja realmente excluir este carrinho?')) {
                console.log('[v0] Excluindo carrinho:', id);
                alert('Carrinho excluído com sucesso!');
            }
        }

        function editarSessao(id) {
            console.log('[v0] Editando sessão:', id);
            alert('Função de edição será implementada');
        }

        function excluirSessao(id) {
            if (confirm('Deseja realmente excluir esta sessão?')) {
                console.log('[v0] Excluindo sessão:', id);
                alert('Sessão excluída com sucesso!');
            }
        }

        function editarItem(id) {
            console.log('[v0] Editando item:', id);
            alert('Função de edição será implementada');
        }

        function excluirItem(id) {
            if (confirm('Deseja realmente excluir este item?')) {
                console.log('[v0] Excluindo item:', id);
                alert('Item excluído com sucesso!');
            }
        }