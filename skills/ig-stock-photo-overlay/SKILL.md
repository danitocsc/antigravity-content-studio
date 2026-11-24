---
name: ig-stock-photo-overlay
description: Metodología y herramientas para buscar, descargar y componer fotografías stock gratuitas (Pexels, Pixabay, Openverse CC0/StockSnap, Wikimedia Commons) como fondo full-bleed con tarjetas editoriales translúcidas tipo glassmorphism y texto de alto contraste en carruseles de Instagram (1080x1350 px). Úsala SIEMPRE que el usuario pida variar el estilo visual de sus carruseles usando fotos reales, imágenes stock de Pexels/sitios gratuitos, portadas estilo editorial con foto de fondo y texto encima (como @gbmplus_), o combinar láminas fotográficas con láminas UI de OpenDesign.
---

# IG Stock Photo Overlay (`1080 × 1350 px` · Variación Editorial)

Esta skill documenta la metodología para integrar **fotografías stock gratuitas y libres de derechos** como capa base (`z-index: 1`) debajo de una **tarjeta editorial translúcida (`backdrop-filter: blur`)** con tipografía limpia (`z-index: 3`), logrando el acabado de publicaciones editoriales como `@gbmplus_` y aportando ritmo visual al alternarse con láminas UI de `ig-carousel-opendesign`.

---

## 1. Arquitectura Visual por Capas (Foto Abajo + Texto Arriba)

Cada lámina fotográfica (`1080 × 1350 px`, formato `4:5`) se construye en 3 capas exactas:

1. **Capa 1 (`z-index: 1`) · Fotografía Stock Full-Bleed:**
   - Imagen de alta resolución (`width >= 900 px`) ajustada con `object-fit: cover` para llenar el lienzo sin deformarse.
   - El punto focal de la foto debe respirar fuera de la caja de texto (ej. sujeto arriba/derecha y tarjeta de texto abajo, o viceversa).
2. **Capa 2 (`z-index: 2`) · Scrim Direccional Sutil:**
   - Degradado suave (`rgba(15, 23, 42, 0.08)` a `rgba(15, 23, 42, 0.34)`) en el extremo donde descansan el dominio inferior y el contador superior para garantizar lectura inmediata.
3. **Capa 3 (`z-index: 3`) · Tarjeta Glassmorphism Editorial + Micro-navegación:**
   - Tarjeta flotante redondeada (`border-radius: 26px`, `backdrop-filter: blur(22px) saturate(140%)`).
   - **Dos variantes según la luminosidad de la foto:**
     - `theme-light-glass` *(predeterminada Modo Claro)*: `rgba(255, 255, 255, 0.84)` con tinta `#0F172A` y kicker `#1A73E8`. Ideal para fotos con tonos medios o profundos.
     - `theme-editorial-scrim` *(estilo `@gbmplus_`)*: `rgba(15, 23, 42, 0.46)` con tinta `#FFFFFF` y borde `rgba(255, 255, 255, 0.24)`. Ideal cuando la foto stock es muy luminosa o blanca.
   - **Límites estrictos de texto dentro de la tarjeta:**
     - Título: 1 a 3 líneas máximo (`56px`, `Inter Display ExtraBold 800`, `line-height: 1.05`).
     - Descripción: 2 a 3 líneas máximo (`25px`, `Regular 400`, `line-height: 1.38`).
     - Pie discreto fuera de la tarjeta: dominio o marca (`danielcruz.mx/...`) a la izquierda y `DESLIZA ->` a la derecha.
   - **Reglas de consistencia:** Sin badges o píldoras de color, sin cursivas, sin guiones largos (`—`) y sin punto y coma (`;`).

---

## 2. Obtención Segura de Imágenes Stock Gratuitas

Usa siempre APIs oficiales y licencias libres de uso comercial (nunca hagas scraping ni intentes evadir CAPTCHAs o bloqueos anti-bot).

El script `scripts/fetch_stock.py` automatiza la búsqueda en cascada:
1. **Pexels API** (`https://api.pexels.com/v1/search`) si existe `PEXELS_API_KEY` en el entorno.
2. **Pixabay API** (`https://pixabay.com/api/`) si existe `PIXABAY_API_KEY` en el entorno.
3. **Openverse API CC0 / Public Domain (`license=cc0,pdm`)** — funciona **sin API key**, devolviendo fotografías editoriales de alta resolución (como StockSnap.io).
4. **Wikimedia Commons API** — respaldo gratuito sin API key para fotografía documental o científica.

### Ejecutar búsqueda, descarga y análisis automático de zona:
```bash
python3 ~/.agents/skills/ig-stock-photo-overlay/scripts/fetch_stock.py \
  --query "university student laptop desk" \
  --out-dir /tmp/stock_candidates \
  --count 3
```

El script descarga los candidatos, mide la luminancia (`luma`) y la varianza visual (`clutter_std`) de la mitad superior frente a la mitad inferior, y devuelve en JSON:
- `local_path`: ruta local del archivo descargado.
- `analysis.recommended_card_position`: `"bottom"` o `"top"` (elige la mitad visualmente más limpia para no tapar el sujeto principal).
- `analysis.recommended_theme`: `"light-glass"` o `"editorial-scrim"`.

*(Si el usuario ya tiene su propia clave gratuita de Pexels, solo basta exportar `PEXELS_API_KEY` en el entorno para priorizar Pexels automáticamente).*

---

## 3. Cómo Variar los Carruseles (Patrones Híbridos con OpenDesign)

Para evitar que todos los carruseles se vean iguales, combina láminas de **foto stock + texto glass** con láminas **UI modulares de `ig-carousel-opendesign`**:

1. **Patrón A (Portada Fotográfica + Interior UI):**
   - `01`: Foto stock editorial con tarjeta glass (detiene el scroll con estética real y humana).
   - `02` y `03`: Láminas blancas con retícula y componentes UI (`Flashcard`, `Simulador Quiz`, `Código`).
   - `04`: Foto stock distinta con CTA hacia `danielcruz.mx/...` o cierre limpio en Modo Claro.
2. **Patrón B (Carrusel 100% Editorial Fotográfico, estilo `@gbmplus_`):**
   - `01` a `04`: Serie de fotos stock coherentes entre sí (misma temperatura de color) usando `assets/stock-slide-template.html` en todo el deck.
3. **Patrón C (Alternancia 1x1):**
   - Láminas impares (`01`, `03`): Foto stock + tarjeta glass.
   - Láminas pares (`02`, `04`): Tarjetas UI blancas de OpenDesign.

---

## 4. Plantilla Lista y Renderizado (`1080 × 1350 px`)

Usa `assets/stock-slide-template.html` directamente pasando parámetros por URL o clonándola en tu proyecto:

```bash
npx agent-browser set viewport 1080 1350
npx agent-browser open "file://~/.agents/skills/ig-stock-photo-overlay/assets/stock-slide-template.html?img=file:///tmp/stock_candidates/stock_01.jpg&theme=editorial-scrim&pos=bottom&kicker=M%C3%89TODO%20PR%C3%81CTICO&title=Estudia%20en%20la%20mitad%20de%20tiempo&desc=Convierte%20tus%20apuntes%20en%20tarjetas%20y%20ex%C3%A1menes%20de%20pr%C3%A1ctica.&domain=danielcruz.mx/flashcards&counter=01%20/%2004"
npx agent-browser screenshot ./slide-stock-01.png
```

### Control de Calidad Obligatorio
1. Abre siempre cada PNG renderizado con `read_file` antes de entregar.
2. Verifica que la tarjeta translúcida **no cubra rostros ni el objeto principal** de la fotografía (ajusta `pos=top` o `pos=bottom`, o `object-position` en `.stock-bg`).
3. Confirma que el contraste entre texto y vidrio sea nítido y legible en pantalla de celular.
4. Entrega en carpeta de Google Drive usando `upload_to_drive.py` de `ig-carousel-opendesign` cuando el carrusel esté completo.
