import cv2 # type: ignore
from pyzbar.pyzbar import decode # type: ignore
import webbrowser
#import time
# Inicia a captura de vídeo da webcam
#cap = cv2.VideoCapture(0)
# Inicia a captura de vídeo do Esp32 CAM
cap = cv2.VideoCapture("http://10.71.132.152:81/stream")

while True:
    # Lê o frame da câmera
    ret, frame = cap.read()
    if not ret:
        break
    
    # Decodifica qualquer QR Code no frame
    decoded_objects = decode(frame)
    for obj in decoded_objects:
        # Mostra a posição do QR Code no frame
        points = obj.polygon
        if len(points) == 4:
            pts = [(point.x, point.y) for point in points]
            pts = tuple(pts)
            #cv2.polylines(frame, [pts], isClosed=True, color=(0, 255, 0), thickness=2)
        
        # Extrai e imprime os dados do QR Code
        qr_data = obj.data.decode('utf-8')
        print("QR Code detectado:", qr_data)
        
        # Abre o link do QR Code no navegador
        webbrowser.open(qr_data)
        #time.sleep(5.0)
        cap.release()

        cv2.destroyAllWindows()
        break  # Sai do loop após detectar o QR Code
        
    # Mostra o vídeo na tela
    cv2.imshow("Leitura", frame)

    # Pressione 'q' para sair do loop
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Libera a câmera e fecha a janela
cap.release()

cv2.destroyAllWindows()
