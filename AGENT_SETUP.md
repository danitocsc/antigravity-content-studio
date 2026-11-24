# AGENT_SETUP.md · Guía de Configuración Autónoma para el Agente de IA (Antigravity)

Este documento está redactado específicamente para el **Agente de IA (Google Antigravity)**. Si un usuario humano te compartió la URL o ruta de este repositorio y te pidió configurarlo o usarlo para crear contenido, ejecuta este protocolo paso a paso.

---

## 1. Qué Contiene Este Repositorio

Este repositorio empaqueta 4 skills de producción de contenido visual y de video vertical, 1 plugin para Google Flow y las reglas globales de diseño e iteración por checkpoints:

1. **`skills/ig-carousel-opendesign`**: Diseño y renderizado de carruseles de Instagram y LinkedIn (`1080 × 1350 px`, formato `4:5`) en Modo Claro usando OpenDesign, componentes UI por lámina y 21 stickers 3D troquelados (`die-cut`).
2. **`skills/ig-stock-photo-overlay`**: Variación editorial para carruseles (`1080 × 1350 px`) combinando fotografías stock gratuitas de uso comercial (Pexels, Pixabay, Openverse CC0, Wikimedia) con tarjetas translúcidas glassmorphism.
3. **`skills/vertical-video-flow-opendesign`**: Producción end-to-end de videos verticales de 30 segundos (`1080 × 1920 px`, formato `9:16`) para TikTok, Instagram Reels y YouTube Shorts combinando Google Flow (Avatar entrenado en modo `Ingredientes` + continuidad por último fotograma + `DON'Ts` anatómicos), transcripción por palabra con Whisper, recorte de silencios muertos en las uniones mediante análisis de espectrograma (`-37.0 dBFS`), gráficos animados gigantes estilo TikTok/OpenDesign y cumplimiento estricto de **Safe Margins**.
4. **`skills/opencv-whisper-video-audit`**: Auditoría técnica de video con OpenCV, transcripción con marcas de tiempo en Whisper y diagnóstico de espectrograma (`Antes vs. Después`).
5. **`plugins/antigravity-flow`**: Plugin para operar Google Flow (`https://flow.google.com`) mediante el subagente nativo `/browser` de Antigravity.
6. **`rules/AGENTS_CONTENT_RULES.md`**: Reglas globales de diseño UI/UX (Modo Claro obligatorio `#FFFFFF`, cero badges, cero guiones largos) y protocolo de iteración por checkpoints de muestras antes de renderizar.

---

## 2. Pasos de Instalación que Debes Ejecutar (Agente de IA)

### Paso 1: Clonar e instalar skills y plugin
Si aún no has clonado el repositorio, clónalo y ejecuta `install.sh`:

```bash
git clone https://github.com/danitocsc/antigravity-content-studio.git /tmp/antigravity-content-studio
bash /tmp/antigravity-content-studio/install.sh
```

Esto copiará las 4 skills a `~/.agents/skills/` y el plugin `antigravity-flow` a `~/.gemini/config/plugins/antigravity-flow`.

### Paso 2: Verificar e instalar dependencias faltantes
Verifica que el entorno del usuario cuente con las herramientas necesarias:

1. **FFmpeg y FFprobe** (indispensables para extracción de últimos fotogramas, espectrogramas `showspectrumpic`, recorte de silencios con `afade` y montaje a `1080 × 1920 px`):
   - Linux (Ubuntu/Debian): `sudo apt-get update && sudo apt-get install -y ffmpeg`
   - macOS: `brew install ffmpeg`
2. **Python 3 + Pillow + faster-whisper**:
   ```bash
   pip3 install Pillow faster-whisper requests
   ```
3. **Node.js + Playwright / agent-browser** (para renderizar las plantillas HTML/CSS de carruseles y las capas transparentes de motion graphics a `1080 × 1920 px`):
   ```bash
   npm install -g agent-browser playwright-core
   npx playwright install chromium
   ```

### Paso 3: Incorporar las Reglas Globales de Contenido
Lee el archivo `rules/AGENTS_CONTENT_RULES.md` de este repositorio y pregunta al usuario si desea agregar esas reglas a su archivo global `~/AGENTS.md` (o al `AGENTS.md` de su proyecto activo).

### Paso 4: Preguntar al Usuario por Integraciones Opcionales
No bloquees el arranque si el usuario aún no tiene estas integraciones. Pregúntale cuáles quiere usar:
- **Entrega del contenido final:** ¿Desea recibir los videos e imágenes por **Telegram** (requiere `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID`), subirlos a **Google Drive** (requiere `rclone` configurado con un remote `gdrive:`), o guardarlos directamente en una **carpeta local** de su computadora?
- **Fotografías Stock (`ig-stock-photo-overlay`):** Funciona sin llaves API gracias a Openverse CC0 y Wikimedia Commons. Si el usuario tiene cuenta gratuita en Pexels o Pixabay, puede exportar `PEXELS_API_KEY` o `PIXABAY_API_KEY`.
- **Google Flow (`vertical-video-flow-opendesign`):** Recuérdale que para automatizar Google Flow debe activar el comando **`/browser`** en el chat de Antigravity y tener su sesión de Google iniciada en `https://flow.google.com/` con su Avatar creado bajo la pestaña `Avatares`.

---

## 3. Reglas Operativas Estrictas para el Agente Durante la Creación

1. **Checkpoint Obligatorio de Muestras Antes de Renderizar:**
   - Nunca lances un renderizado completo de video (hundreds de fotogramas + FFmpeg) sin antes generar **muestras estáticas (`Muestra A`, `Muestra B`, `Muestra C`)** y la lámina diagnóstica del **Espectrograma (`Antes vs. Después`)**.
   - Presenta las muestras al usuario y **espera su retroalimentación y elección explícita** antes de renderizar el video final.
2. **Inspección Visual Obligatoria (`read_file`):**
   - Cada vez que generes láminas de carrusel (`slide-01.png` .. `slide-0N.png`) o mosaicos de video (`qc.jpg`), ábrelos con `read_file` para comprobar que no haya texto cortado, que la tarjeta no toque la barbilla del avatar y que se respeten los **Safe Margins** (`160 px` arriba, `480 px` abajo, `184 px` a la derecha, `96 px` a la izquierda).
3. **Iteración Continua de Skills y Regla "Dependiendo del Caso":**
   - Cuando el usuario te dé retroalimentación, actualiza la skill local en `~/.agents/skills/<nombre>/SKILL.md` para que el aprendizaje persista.
   - Si una nueva indicación del usuario pudiera reemplazar una regla existente en la skill, **pregúntale siempre antes** si desea reemplazarla por completo o conservar ambas variantes dependiendo del caso.
