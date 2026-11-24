---
name: opencv-whisper-video-audit
description: Audita, transcribe y analiza videos (MP4, Reels, TikToks) combinando Whisper (CUDA/local) para transcripción de audio con marcas de tiempo precisas y OpenCV para análisis de fotogramas, detección de artefactos "AI Slop" (marcos falsos, rostros deformados), corrección de color enmascarada (preservando piel y fondo) y alineación de marcas de tiempo para Motion Graphics. Usar SIEMPRE que el usuario pida revisar un video, extraer transcripción con tiempos, analizar calidad de video sintético o IA, corregir color de prendas o ajustar capas gráficas sobre un video.
---

# OpenCV & Whisper Video Audit Methodology

Una metodología integral de 5 pasos para analizar, transcribir, auditar y procesar videos cortos (formato vertical 9:16 o estándar) combinando **Whisper CUDA** y **OpenCV**.

---

## 📋 Flujo de Trabajo en 5 Pasos

### 1. Transcripción Local de Audio con Marcas de Tiempo (`faster-whisper` / `whisper`)
- Extrae el audio del video utilizando FFmpeg (`ffmpeg -i input.mp4 -vn -acodec pcm_s16le -ar 16000 audio.wav`).
- Transcribe localmente con modelo `tiny`, `base` o `small` en GPU (CUDA) o CPU.
- Obtén el JSON/lista de segmentos con timestamps exactos (`start`, `end`, `text`).

```python
from faster_whisper import WhisperModel

model = WhisperModel("small", device="cuda", compute_type="float16")
segments, info = model.transcribe("audio.wav", language="es")

for segment in segments:
    print(f"[{segment.start:.2f}s -> {segment.end:.2f}s] {segment.text}")
```

---

### 2. Muestreo e Inspección Visual de Fotogramas (`OpenCV`)
- Extrae metadatos del video ($W \times H$, FPS, total de frames).
- Extrae frames clave correspondientes a los tiempos del script hablados usando la relación:
  $$\text{Frame Index} = \lfloor \text{Timestamp (segundos)} \times \text{FPS} \rfloor$$
- Extrae fotogramas de prueba uniformes (cada 2 a 5 segundos) y guárdalos en `scratch/` para revisión visual.

```python
import cv2

cap = cv2.VideoCapture("video.mp4")
fps = cap.get(cv2.CAP_PROP_FPS)

def extract_frame_at_time(cap, time_sec, output_path):
    frame_idx = int(time_sec * fps)
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
    ret, frame = cap.read()
    if ret:
        cv2.imwrite(output_path, frame)
```

---

### 3. Auditoría de Artefactos Visuales ("AI Slop" & Calidad)
Inspecciona los fotogramas guardados con las herramientas de vista previa e identifica:
- ❌ **Marcos Falsos / Bezels**: Interfaz simulada de celular, barras de cámara de renderizado IA.
- ❌ **Distorsión Anatómica**: Manos deformadas, parpadeo inconsistente, valla del "valle inquietante" (*uncanny valley*).
- ❌ **Inconsistencias de Vestuario**: Cambios no deseados de tono en prendas o accesorios entre clips consecutivos.

---

### 4. Corrección de Color Enmascarada en Espacio LAB/HSV (OpenCV)
Cuando sea necesario igualar el color de una prenda (ejemplo: sudadera) entre clips sin alterar la piel del creador ni el fondo:

1. Convertir la imagen a espacio **LAB** o **HSV**.
2. Crear una máscara del color de la prenda (`cv2.inRange`).
3. Detectar el rostro con `cv2.CascadeClassifier` (Haar Cascade) o máscara HSV de tono de piel para restar el rostro de la máscara de la prenda.
4. Aplicar la transferencia de color/luminancia únicamente a la región de la máscara de la prenda.

```python
import cv2
import numpy as np

# Cargar clasificadores faciales para protección
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def mask_garment_and_correct(img, target_color_lab):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    
    # Crear máscara de piel/rostro a proteger
    face_mask = np.zeros(img.shape[:2], dtype=np.uint8)
    for (x, y, w, h) in faces:
        cv2.rectangle(face_mask, (x, y), (x + w, y + h), 255, -1)
    
    # Mascara de la prenda (ejemplo en HSV o LAB)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    garment_mask = cv2.inRange(hsv, np.array([0, 0, 40]), np.array([180, 50, 180]))
    
    # Restar rostro de la máscara de prenda
    final_mask = cv2.bitwise_and(garment_mask, cv2.bitwise_not(face_mask))
    
    # Transferir color solo sobre final_mask
    # ...
    return final_mask
```

---

### 5. Sincronización de Motion Graphics, Escala Mobile-First y Safe Zone (`1080 × 1920 px`)
- Asocia los párrafos clave del script obtenidos en el **Paso 1** con componentes gráficos en pantalla (OpenDesign HyperFrames, `Motion.Lab`, `huashu-art-motion` o Remotion).
- **Safe Zone estricta (`1080 × 1920 px`, `9:16`)**: Respeta `top >= 160px`, `bottom >= 480px`, `right >= 184px` (para librar la barra derecha de iconos de `1080px` de alto en TikTok/Reels/Shorts), `left >= 96–120px` y nunca cubras el rostro ni la barbilla del creador (`y >= 1030px`).
- **Escala Tipográfica Mobile-First**: En celular, usa titulares y números protagonistas de **`54px` a `88px`** y subtítulos de **`28px` a `56px`** (nunca textos menores a `20px`).

---

### 6. Análisis de Espectrograma y Recorte de Silencios en Uniones de Clips (`-37 dBFS`)
Cuando se unen múltiples tomas o clips generados por IA (por ejemplo, 3 clips de 10 s de Google Flow), realiza siempre una auditoría de espectrograma y energía RMS (`50 ms`, umbral `-37.0 dBFS`) antes del montaje final:
1. Detecta silencios iniciales, silencios finales en las uniones entre clips y pausas internas muertas (`>= 0.60 s`) donde el actor se queda callado en cámara.
2. Genera una comparativa visual **Antes vs. Después** combinando `showwavespic` y `showspectrumpic` de FFmpeg para evidenciar los segmentos recortados.
3. Recorta cada clip a sus fronteras exactas de voz activa (`+0.08 s` de margen natural) y aplica micro-fundidos `afade` (`40–70 ms`) en cada corte al concatenar.
