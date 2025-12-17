import cv2
import time
from flask import Flask, jsonify, request
from flask_cors import CORS
from threading import Thread

ESP32_STREAM_URL = "http://10.71.132.152/stream"

cap = cv2.VideoCapture(ESP32_STREAM_URL)
detector = cv2.QRCodeDetector()

produtos = {
    "7891234567890": ("Arroz Integral 1kg", 12.90),
    "7891234567891": ("Feijão Preto 1kg", 8.50),
    "7891234567892": ("Macarrão Espaguete 500g", 4.20),
    "7891234567893": ("Óleo de Soja 900ml", 7.30),
    "7891234567894": ("Açúcar Refinado 1kg", 5.50),
    "7891234567895": ("Sal Refinado 1kg", 2.90),
    "7891234567896": ("Café Torrado 250g", 9.80),
    "7891234567897": ("Leite UHT 1L", 4.50),
    "7891234567898": ("Pão de Forma 500g", 6.20),
    "7891234567899": ("Margarina 250g", 3.80)
}


carrinho = {}
subtotal = 0.0
ultimo_qr = ""
ultimo_tempo = 0

app = Flask(__name__)
CORS(app)

@app.route("/cart")
def get_cart():
    return jsonify({
        "items": carrinho,
        "subtotal": round(subtotal, 2)
    })

@app.route("/clear", methods=["POST"])
def clear_cart():
    global carrinho, subtotal
    carrinho = {}
    subtotal = 0.0
    return jsonify({"status": "ok"})

@app.route("/checkout", methods=["POST"])
def checkout():
    data = request.json
    user = data.get("user")
    cart = data.get("cart")

    print("Usuário:", user)
    print("Carrinho:", cart)

    return jsonify({"status": "ok"})

@app.route("/remove", methods=["POST"])
def remove_item():
    global subtotal

    data = request.json
    code = data.get("code")

    if code in carrinho:
        carrinho[code]["quantity"] -= 1
        subtotal -= carrinho[code]["price"]

        if carrinho[code]["quantity"] <= 0:
            del carrinho[code]

    return jsonify({"status": "ok"})

def camera_loop():
    global subtotal, ultimo_qr, ultimo_tempo

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        data, _, _ = detector.detectAndDecode(frame)

        if data:
            agora = time.time()
            if data != ultimo_qr or agora - ultimo_tempo > 3:
                if data in produtos:
                    nome, preco = produtos[data]

                    if data in carrinho:
                        carrinho[data]["quantity"] += 1
                    else:
                        carrinho[data] = {
                            "name": nome,
                            "price": preco,
                            "quantity": 1
                        }

                    subtotal += preco
                    print("📦 Produto adicionado:", nome)

                ultimo_qr = data
                ultimo_tempo = agora

Thread(target=camera_loop, daemon=True).start()

app.run(host="0.0.0.0", port=5000)
