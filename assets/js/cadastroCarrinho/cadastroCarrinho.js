import { auth, db } from "../firebase-config.js";
import { 
    collection, addDoc, getDocs, serverTimestamp, query, where, doc, getDoc, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

document.getElementById('btnLogout').addEventListener('click', async () => {
    if (!auth.currentUser) return alert("Você já está deslogado.");
    try {
        await signOut(auth);
        alert("Logout realizado com sucesso!");
        window.location.href = "/index.html"; 
    } catch (err) {
        console.error("Erro ao deslogar:", err);
        alert("Não foi possível deslogar.");
    }
});

export async function carregarClientes() {
    const select = document.getElementById('clienteId');
    select.innerHTML = '<option value="">Selecione o cliente</option>';
    try {
        const snapshot = await getDocs(collection(db, "user"));
        snapshot.forEach(doc => {
            const c = doc.data();
            select.innerHTML += `<option value="${doc.id}">${c.nome} - ${c.cpf}</option>`;
        });
    } catch(err) {
        console.error("Erro ao carregar clientes:", err);
        alert("Não foi possível carregar os clientes.");
    }
}


export async function carregarCarrinhosSessao() {
    const select = document.getElementById('carrinhoIdSessao');
    select.innerHTML = '<option value="">Selecione um carrinho</option>';
    try {
        const snapshot = await getDocs(collection(db, "carrinhos"));
        snapshot.forEach(doc => {
            const c = doc.data();
            select.innerHTML += `<option value="${doc.id}">${c.loja_id} - ${c.codigo_qr}</option>`;
        });
    } catch(err) {
        console.error("Erro ao carregar carrinhos para sessão:", err);
        alert("Não foi possível carregar os carrinhos.");
    }
}

document.getElementById('formCarrinhoFisico').addEventListener('submit', async function(e) {
    e.preventDefault();
    const dados = {
        loja_id: document.getElementById('lojaId').value,
        codigo_qr: document.getElementById('codigoQr').value,
        status: document.getElementById('statusCarrinho').value,
        criado_em: serverTimestamp()
    };
    try {
        await addDoc(collection(db, "carrinhos"), dados);
        alert('Carrinho físico cadastrado com sucesso!');
        this.reset();
        document.getElementById('qrCodeDisplay').style.display = 'none';
        carregarCarrinhos();
        carregarCarrinhosSessao(); 
    } catch(err) {
        console.error("Erro ao salvar carrinho:", err);
        alert("Erro ao cadastrar carrinho.");
    }
});

document.getElementById('formSessao').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!auth.currentUser) {
        alert("Você precisa estar logado!");
        return;
    }

    const carrinhoId = document.getElementById('carrinhoIdSessao').value;
    if (!carrinhoId) {
        alert("Selecione um carrinho válido!");
        return;
    }

    const dados = {
        carrinho_id: carrinhoId,
        usuario_uid: auth.currentUser.uid,
        usuario_email: auth.currentUser.email,
        status: document.getElementById('statusSessao').value,
        total: parseFloat(document.getElementById('totalSessao').value) || 0,
        criado_em: serverTimestamp(),
        atualizado_em: serverTimestamp()
    };

    try {
        await addDoc(collection(db, "sessoes"), dados);
        alert('Sessão cadastrada com sucesso!');
        this.reset();
        carregarSessoes();
    } catch(err) {
        console.error("Erro ao salvar sessão:", err);
        alert("Erro ao cadastrar sessão.");
    }
});


export function gerarCodigoQR() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const codigo = `CART-${timestamp}-${random}`;

    document.getElementById('codigoQr').value = codigo;
    document.getElementById('qrCodeDisplay').style.display = 'block';
    document.getElementById('qrCodeText').textContent = codigo;

    const qrImage = document.getElementById('qrCodeImage');
    QRCode.toDataURL(codigo)
        .then(url => { qrImage.src = url; })
        .catch(err => console.error(err));
}

export function atualizarPrecoProduto() {
    const select = document.getElementById('produtoId');
    const preco = select.selectedOptions[0].dataset.preco;
    if (preco) {
        document.getElementById('precoUnit').value = preco;
        calcularPrecoTotal();
    }
}

export function calcularPrecoTotal() {
    const quantidade = parseFloat(document.getElementById('quantidade').value) || 0;
    const precoUnit = parseFloat(document.getElementById('precoUnit').value) || 0;
    document.getElementById('precoTotal').value = (quantidade * precoUnit).toFixed(2);
}


export async function editarCarrinho(id) {
    const docRef = doc(db, "carrinhos", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return alert("Carrinho não encontrado.");
    
    const c = docSnap.data();
    document.getElementById('lojaId').value = c.loja_id;
    document.getElementById('codigoQr').value = c.codigo_qr;
    document.getElementById('statusCarrinho').value = c.status;
    document.getElementById('qrCodeDisplay').style.display = 'block';
    document.getElementById('qrCodeText').textContent = c.codigo_qr;
    QRCode.toDataURL(c.codigo_qr).then(url => document.getElementById('qrCodeImage').src = url);

    const form = document.getElementById('formCarrinhoFisico');
    form.removeEventListener('submit', form._listener);
    form._listener = async function(e) {
        e.preventDefault();
        try {
            await updateDoc(docRef, {
                loja_id: document.getElementById('lojaId').value,
                codigo_qr: document.getElementById('codigoQr').value,
                status: document.getElementById('statusCarrinho').value
            });
            alert("Carrinho atualizado com sucesso!");
            form.reset();
            document.getElementById('qrCodeDisplay').style.display = 'none';
            carregarCarrinhos();
        } catch(err) { console.error(err); alert("Erro ao atualizar carrinho"); }
    };
    form.addEventListener('submit', form._listener);
}

export async function excluirCarrinho(id) {
    if (!confirm("Tem certeza que deseja excluir este carrinho?")) return;
    try {
        await deleteDoc(doc(db, "carrinhos", id));
        alert("Carrinho excluído com sucesso!");
        carregarCarrinhos();
    } catch(err) { console.error(err); alert("Erro ao excluir carrinho"); }
}

export async function editarSessao(id) {
    const docRef = doc(db, "sessoes", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return alert("Sessão não encontrada.");

    const s = docSnap.data();
    document.getElementById('carrinhoIdSessao').value = s.carrinho_id;
    document.getElementById('statusSessao').value = s.status;
    document.getElementById('totalSessao').value = s.total;

    const form = document.getElementById('formSessao');
    form.removeEventListener('submit', form._listener);
    form._listener = async function(e) {
        e.preventDefault();
        try {
            await updateDoc(docRef, {
                carrinho_id: document.getElementById('carrinhoIdSessao').value,
                status: document.getElementById('statusSessao').value,
                total: parseFloat(document.getElementById('totalSessao').value) || 0,
                atualizado_em: serverTimestamp()
            });
            alert("Sessão atualizada com sucesso!");
            form.reset();
            carregarSessoes();
        } catch(err) {
            console.error(err);
            alert("Erro ao atualizar sessão");
        }
    };
    form.addEventListener('submit', form._listener);
}

export async function excluirSessao(id) {
    if (!confirm("Tem certeza que deseja excluir esta sessão?")) return;
    try {
        await deleteDoc(doc(db, "sessoes", id));
        alert("Sessão excluída com sucesso!");
        carregarSessoes();
    } catch(err) {
        console.error(err);
        alert("Erro ao excluir sessão");
    }
}


export async function carregarCarrinhos() {
    const tbody = document.getElementById('listaCarrinhos');
    tbody.innerHTML = '';
    const snapshot = await getDocs(collection(db, "carrinhos"));
    snapshot.forEach(doc => {
        const c = doc.data();
        tbody.innerHTML += `
            <tr>
                <td>${c.loja_id}</td>
                <td><code>${c.codigo_qr}</code></td>
                <td><span class="badge bg-success">${c.status}</span></td>
                <td>${c.criado_em?.toDate?.()?.toLocaleString() || 'Automático'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editarCarrinho('${doc.id}')"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="excluirCarrinho('${doc.id}')"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

export async function carregarSessoes() {
    const tbody = document.getElementById('listaSessoes');
    tbody.innerHTML = '';
    const snapshot = await getDocs(collection(db, "sessoes"));
    snapshot.forEach(doc => {
        const s = doc.data();
        tbody.innerHTML += `
            <tr>
                <td>${s.carrinho_id}</td>
                <td>${s.usuario_email}</td>
                <td><span class="badge bg-success">${s.status}</span></td>
                <td>R$ ${s.total?.toFixed(2) || '0.00'}</td>
                <td>${s.criado_em?.toDate?.()?.toLocaleString() || 'Automático'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editarSessao('${doc.id}')"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="excluirSessao('${doc.id}')"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
    });
}


window.editarCarrinho = editarCarrinho;
window.excluirCarrinho = excluirCarrinho;
window.gerarCodigoQR = gerarCodigoQR;
window.editarSessao = editarSessao;
window.excluirSessao = excluirSessao;

window.addEventListener('DOMContentLoaded', () => {
    carregarCarrinhos();
    carregarSessoes();
    carregarClientes();
    carregarCarrinhosSessao();
});
