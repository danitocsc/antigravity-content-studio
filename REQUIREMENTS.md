# Requerimientos y Dependencias · Antigravity Content Studio

Este documento detalla todas las dependencias obligatorias y opcionales necesarias para ejecutar el ecosistema completo de creación de contenido (carruseles `4:5` y videos verticales `9:16` con **Google Flow**, **OpenDesign**, **OpenMotion Studio + MCP**, **Whisper** y **FFmpeg**).

---

## 1. Requisitos del Sistema Base

| Dependencia | Versión Mínima | Uso en el Flujo | Comando de Verificación |
| :--- | :--- | :--- | :--- |
| **Google Antigravity** | Actual (con `/browser`) | Agente principal, ejecución de skills, MCP y control de Google Flow | Activar `/browser` en el chat |
| **Git** | `>= 2.25` | Clonación de repositorios y control de versiones | `git --version` |
| **Node.js + npm** | `Node >= 22.18.0` | Requerido por **OpenMotion (`@openmotion/app`)**, `HyperFrames`, `Playwright` y `agent-browser` | `node -v && npm -v` |
| **Python 3** | `>= 3.9` | Scripts de stickers die-cut, descarga de fotos stock, auditoría de espectrograma y Whisper | `python3 --version` |
| **FFmpeg + FFprobe** | `>= 4.2` | Extracción de últimos fotogramas (`-sseof -0.15`), espectrogramas (`showspectrumpic`), recorte de silencios (`afade`) y renderizado `1080 × 1920 px` | `ffmpeg -version && ffprobe -version` |
| **Chromium / Chrome / Brave** | Reciente | Renderizado de HTML/CSS (`1080 × 1350 px` y `1080 × 1920 px`) y acceso autenticado a Google Flow | `which google-chrome brave-browser chromium-browser` |

---

## 2. Repositorios y Motores de Motion Graphics (Requeridos para Video)

| Repositorio / Paquete | Rol en la Arquitectura | Instalación Recomendada |
| :--- | :--- | :--- |
| **[nexu-io/openmotion](https://github.com/nexu-io/openmotion) (`@openmotion/app@0.2.1`)** | Estudio local de video con **300+ recetas `Motion.md`**, plantillas (`presenter-tech`, `nyt-graph`, `decision-tree`), **34 herramientas MCP** y skills para clonar efectos desde cualquier TikTok/Reel de referencia (`openmotion-recreate`, `openmotion-director`, `openmotion-template-to-video`). | `npx --yes @openmotion/app@0.2.1 setup --host antigravity --skills-dir ~/.agents/skills --data-dir ~/openmotion-data` |
| **[nexu-io/open-design](https://github.com/nexu-io/open-design)** | Sistemas de diseño (`155+` design systems), `HyperFrames`, `Motion.Lab` y `huashu-art-motion` usados como base de tipografía, paletas y componentes. | Opcional si instalas `@openmotion/app`, ya que incluye el catálogo de diseño y motion integrado. |
| **Plugin `antigravity-flow`** *(incluido en `plugins/`)* | Reglas y 6 skills para operar Google Flow (`https://flow.google.com`) desde `/browser` en modo manual (`Agente de Flow` OFF). | Copiado automáticamente por `install.sh` / `install.ps1` a `~/.gemini/config/plugins/antigravity-flow`. |

### Configuración del Servidor MCP de OpenMotion (`~/.gemini/config/mcp_config.json`)
Después de ejecutar `@openmotion/app@0.2.1 setup --host antigravity`, agrega el bloque `agentRegistration` devuelto por el instalador a tu `~/.gemini/config/mcp_config.json`:

**Linux / macOS:**
```json
{
  "mcpServers": {
    "openmotion": {
      "command": "/usr/bin/node",
      "args": ["/home/<TU_USUARIO>/.local/share/openmotion/run-mcp.mjs"]
    }
  }
}
```

**Windows (PowerShell):**
```json
{
  "mcpServers": {
    "openmotion": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": ["C:\\Users\\<TU_USUARIO>\\AppData\\Local\\openmotion\\run-mcp.mjs"]
    }
  }
}
```

> **Nota para servidores Linux ARM64 (`aarch64`):** `@openmotion/app@0.2.1` trae binarios nativos empaquetados para `win32-x64`, `linux-x64`, `darwin-arm64` y `darwin-x64`. En Linux `arm64`, utiliza los binarios nativos del sistema (`/usr/bin/ffmpeg`, `/usr/bin/ffprobe` y `/usr/bin/brave-browser` o `/usr/bin/chromium-browser`) mediante las variables `HYPERFRAMES_FFMPEG_PATH`, `HYPERFRAMES_FFPROBE_PATH` y `HYPERFRAMES_BROWSER_PATH`.

---

## 3. Paquetes de Python y Node.js

### Python (`pip3`)
```bash
pip3 install Pillow faster-whisper requests
```
- **`Pillow`**: Necesario para `make_diecut.py` (stickers 3D troquelados) y `fetch_stock.py` (análisis de luminancia y contraste en fotos stock).
- **`faster-whisper`**: Transcripción local con `word_timestamps=True` para sincronizar gráficos al milisegundo y validar cortes de silencios.
- **`requests`**: Subida directa de muestras y videos finales a Telegram (si el usuario activa entrega por Telegram).

### Node.js (`npm`)
```bash
npm install -g agent-browser playwright-core
npx playwright install chromium
```

---

## 4. Integraciones y Variables de Entorno Opcionales

Ninguna de estas claves es obligatoria para iniciar. Configura solo las que vayas a utilizar:

| Variable de Entorno | Servicio | Para qué sirve |
| :--- | :--- | :--- |
| `PEXELS_API_KEY` | Pexels API (gratis) | Prioriza fotos editoriales verticales de Pexels en `fetch_stock.py` (sin esta clave usa Openverse CC0 y Wikimedia automáticamente). |
| `PIXABAY_API_KEY` | Pixabay API (gratis) | Fuente adicional gratuita de fotos stock en `fetch_stock.py`. |
| `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` | Telegram Bot API | Envía muestras (`Muestra A, B, C`), espectrogramas y videos MP4 terminados directo al celular. |
| `DRIVE_EDITOR_EMAIL` + `rclone` (`gdrive:`) | Google Drive | Sube carpetas completas de carruseles PNG y devuelve enlace compartible automático (`upload_to_drive.py`). |
