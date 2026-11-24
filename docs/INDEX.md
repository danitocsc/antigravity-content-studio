# Índice General de Documentación · Antigravity Content Studio

Este índice organiza toda la metodología, skills, scripts, plantillas y diagramas de flujo para producir contenido de alto impacto en Instagram, TikTok, LinkedIn y YouTube Shorts usando **Google Antigravity**, **OpenDesign**, **Google Flow** y **Whisper + FFmpeg**.

---

## 1. Guías Principales y Arranque

| Documento | Audiencia | Propósito |
| :--- | :--- | :--- |
| [README.md](../README.md) | Humano y Agente IA | Guía maestra del repositorio, prompt de configuración automática para el agente, inventario completo de herramientas y diagramas de flujo generales. |
| [AGENT_SETUP.md](../AGENT_SETUP.md) | Agente IA (Antigravity) | Runbook paso a paso para que el agente instale las skills, el plugin `antigravity-flow`, OpenMotion Studio + MCP, valide dependencias y configure el entorno sin intervención manual compleja. |
| [REQUIREMENTS.md](../REQUIREMENTS.md) | Humano y Agente IA | Lista detallada de requerimientos del sistema (`Node >= 22.18`, `ffmpeg`, `Python 3`, `faster-whisper`), instalación de `nexu-io/openmotion` (`@openmotion/app@0.2.1`) y configuración de `mcp_config.json`. |
| [install.sh](../install.sh) / [install.ps1](../install.ps1) | Humano y Agente IA | Instaladores ejecutables (Linux/macOS y Windows PowerShell) que copian las skills, el plugin y lanzan `@openmotion/app`. |
| [rules/AGENTS_CONTENT_RULES.md](../rules/AGENTS_CONTENT_RULES.md) | Agente IA | Reglas globales para `AGENTS.md`: Modo Claro obligatorio (`#FFFFFF`), cero badges, cero guiones largos y pausa obligatoria con muestras antes de renderizar. |

---

## 2. Metodologías Detalladas con Diagramas de Flujo

1. **[docs/WORKFLOW_CAROUSELS.md](./WORKFLOW_CAROUSELS.md)**
   - Cómo transformar una sesión, clase o artículo técnico en un carrusel de Instagram de alta retención (`1080 × 1350 px`, formato `4:5`) centrado en el beneficio del lector.
   - Uso de la plantilla modular `carousel-base.html`, los 21 stickers 3D troquelados (`die-cut`) y la variación fotográfica con fotos stock gratuitas (`fetch_stock.py` + `stock-slide-template.html`).
2. **[docs/WORKFLOW_VERTICAL_VIDEO.md](./WORKFLOW_VERTICAL_VIDEO.md)**
   - Cómo generar videos de 30 segundos (`1080 × 1920 px`, formato `9:16`) con tu Avatar real y tu voz entrenada en **Google Flow** (`Ingredientes` -> `Avatares` -> `@Yo`).
   - Cómo mantener continuidad exacta entre 3 clips de 10 segundos encadenando el último fotograma (`-sseof -0.15`) junto con una foto de referencia y restricciones anatómicas (`DON'Ts`).
   - Cómo auditar el audio con **Whisper** (marcas de tiempo por palabra) y **Espectrograma + RMS (`-37.0 dBFS`)** para eliminar los silencios muertos en las uniones de los clips.
   - Cómo aplicar los **Safe Margins** de TikTok/Reels/Shorts y superponer gráficos animados **Mobile-First (`54px` a `88px`)** basados en los repositorios de motion de OpenDesign (`HyperFrames`, `huashu-art-motion`, `Motion.Lab` y `Remotion`).
3. **[docs/FEEDBACK_ITERATION_PROTOCOL.md](./FEEDBACK_ITERATION_PROTOCOL.md)**
   - Cómo funciona el ciclo de mejora continua donde el agente entrega primero **muestras rápidas (`A, B, C`)**, espera la retroalimentación del creador antes de hacer el render pesado y actualiza las skills automáticamente preguntando cuando una regla depende del caso.

---

## 3. Catálogo de Skills Incluidas en `skills/`

| Skill | Ruta | Formato / Resolución | Qué Automatiza |
| :--- | :--- | :--- | :--- |
| **`ig-carousel-opendesign`** | [skills/ig-carousel-opendesign/SKILL.md](../skills/ig-carousel-opendesign/SKILL.md) | `1080 × 1350 px` (`4:5`) | Carruseles UI en Modo Claro, componentes interactivos (Flashcards, Quiz, Código), stickers 3D die-cut, renderizado PNG y subida a Google Drive. |
| **`ig-stock-photo-overlay`** | [skills/ig-stock-photo-overlay/SKILL.md](../skills/ig-stock-photo-overlay/SKILL.md) | `1080 × 1350 px` (`4:5`) | Descarga automática de fotos stock libres (Pexels, Pixabay, Openverse CC0, Wikimedia), análisis de luminancia y tarjetas glassmorphism. |
| **`vertical-video-flow-opendesign`** | [skills/vertical-video-flow-opendesign/SKILL.md](../skills/vertical-video-flow-opendesign/SKILL.md) | `1080 × 1920 px` (`9:16`) | Video de 30 s en Google Flow con Avatar `@Yo`, corte de silencios por espectrograma, Safe Margins y motion graphics gigantes estilo TikTok. |
| **`opencv-whisper-video-audit`** | [skills/opencv-whisper-video-audit/SKILL.md](../skills/opencv-whisper-video-audit/SKILL.md) | `1080 × 1920 px` / `720 × 1280 px` | Transcripción local con Whisper, muestreo de fotogramas con OpenCV, detección de artefactos visuales y auditoría de espectrograma. |

---

## 4. Plugin Incluido en `plugins/`

- **[plugins/antigravity-flow](../plugins/antigravity-flow/README.md):** Conjunto de reglas (`rules/AGENTS.md`) y 6 sub-skills (`flow-director`, `flow-ingredients`, `flow-generate`, `flow-scene-builder`, `flow-tools`, `flow-sync`) para controlar Google Flow desde el subagente `/browser` de Antigravity sin scripts frágiles.
