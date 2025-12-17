

---

# Carrinho Inteligente

Projeto de carrinho inteligente que integra **ESP32-CAM**, leitura de QR Code e um front-end web local. Permite simular o fluxo de compras de forma automatizada utilizando hardware e interface web.

---

## Pré-requisitos

Antes de rodar o projeto, você precisa ter instalado:

* [Python 3.x](https://www.python.org/downloads/)
* [Arduino IDE](https://www.arduino.cc/en/software) ou outro software para ESP32
* Drivers do **ESP32-CAM** instalados no seu computador
* Navegador moderno (Chrome, Edge, Firefox)
* Dependências Python

---

## 1. Configurar o ESP32-CAM

1. Conecte o **ESP32-CAM** ao computador via USB.
2. Abra o código do ESP32 no Arduino IDE (`.ino` do projeto).
3. Configure a rede Wi-Fi no código, se necessário.
4. Faça o **upload** do código para o ESP32.
5. Abra o **Serial Monitor** no Arduino IDE.
6. Reinicie o ESP32 e aguarde a inicialização.
7. No Serial Monitor, você verá o **IP que o ESP32 recebeu** na sua rede. Anote esse IP.

---

## 2. Configurar o Python

1. Abra o terminal/Prompt de Comando.
2. Navegue até a pasta `assets` do projeto, onde está o script Python.
3. Abra o código Python que faz a comunicação com o ESP32.
4. Substitua a rota/URL no código pelo **IP do ESP32** obtido no Serial Monitor, algo como:

```python
ESP32_IP = "http://192.168.0.xxx"
```

5. Instale as dependências necessárias (exemplo com  `opencv-python`):

```bash
pip install opencv-python
```

6. Rode o script Python:

```bash
python scanner.py
```

O Python fará a comunicação com o ESP32, lendo os QR Codes e enviando os dados.

---

## 3. Rodar o Front-End Local
1. Abra o arquivo `index.html` diretamente no navegador (não precisa de servidor local).
2. O front-end irá se comunicar com o script Python e com o ESP32, permitindo o fluxo completo do carrinho inteligente.

---

## 4. Fluxo de Teste

1. Certifique-se que o ESP32 está ligado e com o IP correto.
2. O script Python está rodando e acessando o ESP32.
3. Abra o `index.html` no navegador.
4. Realize a simulação do carrinho: leitura de QR Codes, registro de produtos e fluxo de compra.

---

## 5. Observações

* Sempre confira o IP do ESP32 antes de rodar o script Python.
* O ESP32 e o computador precisam estar na mesma rede Wi-Fi.
* Caso haja problemas de conexão, reinicie o ESP32 e verifique o Serial Monitor.

---

