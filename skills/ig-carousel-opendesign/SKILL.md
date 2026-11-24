---
name: ig-carousel-opendesign
description: Metodología y pipeline completo para diseñar, renderizar y entregar carruseles de Instagram (1080x1350 px, formato 4:5) con calidad editorial usando OpenDesign, stickers 3D die-cut, tipografía de alto contraste, páginas interactivas complementarias en danielcruz.mx y subida automática a Google Drive. Úsala SIEMPRE que el usuario pida crear un carrusel de Instagram o LinkedIn, láminas para redes sociales, imágenes educativas de Embajadores de Google, un diseño visual basado en OpenDesign, o transformar una sesión/tema en contenido visual compartible.
---

# IG Carousel OpenDesign (`1080 × 1350 px` · Modo Claro)

Esta skill reúne la metodología probada para producir carruseles de Instagram de alto impacto en formato `4:5` (`1080 × 1350 px`) combinando principios editoriales de **OpenDesign**, narrativa enfocada en el beneficio del lector, componentes UI reales por lámina, stickers 3D troquelados (`die-cut`) y entrega automatizada en Google Drive.

---

## 1. Arquitectura Narrativa (Centrada en el Beneficio)

Evita narrar cronológicamente una charla o reunión ("hoy vi esto en clase"). Enfoca cada lámina en el **problema del lector y el beneficio concreto que obtiene hoy**:

### Estructura estándar de 4 láminas (alta retención)
1. **`01 / EL PROBLEMA` (Portada de choque + metáfora de código):**
   - Titular con beneficio cuantificado (ej. `Estudia en la mitad de tiempo. Comprende el doble.`).
   - Ventana minimalista de código (`metodo.py` con `False` / `True` / `funcion()`) que resume el cambio de mentalidad en 3 líneas.
   - Tira inferior de beneficio inmediato + 2 stickers 3D die-cut.
2. **`02 / HERRAMIENTA 1` (Flashcards / Procedimiento real):**
   - No expliques conceptos en abstracto: muestra una tarjeta real **Frente / Reverso** con un ejercicio concreto y el ahorro de tiempo que genera.
3. **`03 / HERRAMIENTA 2` (Simulador / Prueba práctica):**
   - Mockup de interfaz real (`10 REACTIVOS`, barra de progreso, pregunta aplicada con 3 incisos `A`, `B [BENEFICIO/CORRECTO]`, `C` y explicación debajo).
4. **`04 / PASO A PASO` (Llamado a la acción + Pregunta para comentarios):**
   - Tarjeta destacada apuntando a la página web interactiva (ej. `danielcruz.mx/flashcards`) con 3 puntos de valor concretos.
   - Caja verde inferior con una pregunta abierta para detonar comentarios (`¿Qué materia quieres aprobar con mejor promedio este semestre?`).

*(Cuando el tema requiera mostrar un flujo de 3 pasos, un prompt completo `.TXT` o ruta de estudio, escala a 6 o 7 láminas manteniendo un solo componente UI protagonista por lámina. Consulta `references/insights-instagram.md` para ver los patrones detallados. Si deseas alternar láminas UI con fotografías stock reales y tarjeta glassmorphism para variar el ritmo visual, combina esta skill con `ig-stock-photo-overlay`).*

---

## 2. Reglas Visuales y Tipográficas (Modo Claro + Zero Slop)

1. **Modo Blanco / Claro Obligatorio:**
   - Fondo `--bg: #F8FAFC` con retícula sutil (`45px × 45px`, `rgba(15, 23, 42, 0.04)`).
   - Superficies en `#FFFFFF` (`--paper`), tintes suaves para foco (`#EFF6FF`, `#ECFDF5`, `#FEFCE8`) y bordes limpios (`2px solid #0F172A` o `1.5px solid #CBD5E1`).
   - Barra superior de espectro Google (`10px` de alto): `linear-gradient(90deg, #4285F4 0%, #EA4335 33%, #FBBC05 66%, #34A853 100%)`.
2. **Cero Badges y Cero Cursivas:**
   - Nunca uses píldoras o chips con fondo sólido. Usa kickers en `JetBrains Mono` (`15px`, mayúsculas, `letter-spacing: 1.8px`) precedidos por una barra horizontal de `24px × 3px`.
   - Prohibido usar cursivas (`font-style: normal` en `*`), guiones largos (`—`) o punto y coma (`;`).
3. **Jerarquía Editorial:**
   - Titular principal (`Inter Display Black 900`, `78px`, `line-height: 0.96`, `letter-spacing: -3.1px`) alternando negro `#0F172A` con un único color acento por lámina (`#1A73E8` o `#137333`).
   - Limita el ancho del párrafo introductorio (`max-width: 755px`) cuando haya un sticker 3D grande en la esquina superior derecha del bloque hero para evitar colisiones.
4. **Micro-navegación constante en todas las láminas:**
   - **Micro-header:** Logo + nombre de serie a la izquierda, `0X / ETAPA` a la derecha.
   - **Frase ancla:** Una sola línea contundente justo encima del footer + indicador `DESLIZA ->` o nombre de la siguiente lámina.
   - **Footer con barra segmentada:** Autor/URL a la izquierda (`DANIEL CRUZ · danielcruz.mx/...`), contador `0X / 0N` y barra de `N` segmentos a la derecha.

---

## 3. Assets y Scripts Incluidos en la Skill

- **Plantilla base lista para clonar y editar:**
  `assets/carousel-base.html` (soporta `?slide=1` .. `?slide=N` para capturar cada lámina limpia a `1080 × 1350 px`).
- **Stickers 3D Die-Cut (21 recursos pre-procesados del Media Kit):**
  `assets/diecut/*.png` (`lightbulb.png`, `rocket.png`, `gradcap.png`, `laptop_irid.png`, `books_red.png`, `clock_gold.png`, `thumbs_up.png`, `open_book.png`, `speech_purple.png`, `cursor_click.png`, `briefcase.png`, `mountain.png`, `community.png`, `megaphone.png`, `medal.png`, `star_chrome.png`, `star_smile.png`, `dna.png`, `lock_heart.png`, `globe_green.png`, `phone_silver.png`) más `assets/google-g.png`.
- **Generar nuevos stickers Die-Cut desde cualquier PNG transparente:**
  ```bash
  python3 ~/.agents/skills/ig-carousel-opendesign/scripts/make_diecut.py entrada.png salida.png
  ```
- **Renderizar todas las láminas a PNG (`1080 × 1350 px`) con `agent-browser`:**
  ```bash
  ~/.agents/skills/ig-carousel-opendesign/scripts/render_carousel.sh mi_carrusel.html ./salida_png 4
  ```
- **Subir carpeta a Google Drive y obtener enlace compartible:**
  ```bash
  python3 ~/.agents/skills/ig-carousel-opendesign/scripts/upload_to_drive.py ./salida_png "[MX] Media Kit/Nombre Carpeta"
  ```

---

## 4. Flujo de Ejecución Paso a Paso

1. **Definir ángulo y estructura:** Si el tema es educativo o técnico, prioriza el beneficio del usuario final en 4 láminas (o 6–7 si pide prompts/casos extensos). Si requiere una experiencia interactiva (simulador, generador de prompts, calculadora), crea una ruta dedicada en `/home/ubuntu/danielcruzmx/<slug>/index.html` y enlázala desde la lámina final.
2. **Construir HTML desde `assets/carousel-base.html`:** Adapta los textos, elige stickers `assets/diecut/*.png` coherentes con cada bloque y ajusta `max-width` para evitar solapamientos.
3. **Renderizar con `scripts/render_carousel.sh`:** Genera todos los `slide-0X.png`.
4. **Inspección visual obligatoria (QC):** Lee TODOS los PNG generados con `read_file` para verificar contraste, alineación, ausencia de texto cortado y balance de espacios antes de subir. Si algo se solapa o queda vacío, corrige el HTML y re-renderiza solo las láminas modificadas.
5. **Publicar en Drive y entregar:** Ejecuta `scripts/upload_to_drive.py`, haz commit atómico en Git con co-autoría dual (`Co-authored-by: antigravity <antigravity@google.com>`) y entrega al usuario el enlace directo de Drive junto con 2 opciones de copy listas para Instagram (una completa para guardados/tráfico y una corta).
