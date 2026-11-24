---
name: vertical-video-flow-opendesign
description: Metodología end-to-end para producir reels y videos verticales (9:16, 1080x1920 px) de 30 segundos combinando Google Flow (Avatar @Yo en modo Ingredientes + foto de referencia + continuidad por último fotograma + DON'Ts anatómicos de nariz/rostro), transcripción con marcas de tiempo por palabra (Whisper), gráficos animados Swiss Pulse de OpenDesign en Modo Claro respetando estrictamente los Safe Margins de TikTok/Reels/Shorts (160px top, 480px bottom, 1080px barra derecha, 120px laterales) y entrega directa por Telegram. Úsala SIEMPRE que el usuario pida crear un video vertical, reel o short con su avatar en Google Flow y superponer gráficos llamativos de OpenDesign.
---

# Producción de Video Vertical 9:16: Google Flow (`@Yo`) + OpenDesign Swiss Pulse + Safe Margins

Esta skill documenta el pipeline completo para producir videos verticales de 30 segundos (`9:16`, `1080 × 1920 px`) con el Avatar real de Daniel Cruz en **Google Flow** y capas gráficas animadas **Swiss Pulse** de **OpenDesign**.

---

## 1. Generación de Video con Avatar Real en Google Flow (3 × 10 s)

### 1.1 Modo `Ingredientes` Obligatorio (No `Fotogramas`)
- Para que Google Flow utilice el Avatar entrenado con la **voz real** de Daniel, el `Tipo de video` en `Botón de configuración` debe ser **`Ingredientes`** (`Ingredients`), nunca `Fotogramas` (`Frames`).
- Al escribir **`@`** en la caja de prompt (o hacer clic en **`+`** -> pestaña **`Avatares`**), selecciona el Avatar **`Yo`** (disponible a nivel de cuenta en todos los proyectos).
- Configuración estándar por clip:
  - Modo manual (`Agente de Flow` **OFF**)
  - `Video` · `Ingredientes` · `9:16` · `Omni 1.2 Flash` · `720p` · `10 s` · `x1`

### 1.2 Combinación de Avatar `@Yo` + Foto de Referencia + Continuidad por Último Frame
Para variar de escenario/vestimenta y mantener continuidad visual y vocal perfecta a lo largo de 30 segundos (3 clips de 10 s):
1. **Clip 1 (00s a 10s):** Adjunta en `Ingredientes` dos recursos simultáneos:
   - El Avatar **`Yo`** (`Avatares` -> `Yo`, e incluye `[Yo]` en el texto del prompt).
   - La foto de referencia real (`daniel_ref.jpg`) subida mediante `+` -> `Subir contenido multimedia`.
2. **Extracción del último fotograma:** Al descargar cada clip (`Más opciones` -> `Descargar` -> `720p Tamaño original`), extrae su último frame real de video (usando `-sseof -0.15` porque la pista AAC suele durar ~0.03 s más que la pista H.264):
   ```bash
   ffmpeg -y -sseof -0.15 -i clip1.mp4 -frames:v 1 clip1_last.png
   ```
3. **Clip 2 (10s a 20s) y Clip 3 (20s a 30s):** En cada clip consecutivo, mantén adjunto el Avatar **`Yo`** (para conservar exactamente la misma voz real) y reemplaza la imagen adjunta por el último fotograma del clip anterior (`clip1_last.png` para el Clip 2 y `clip2_last.png` para el Clip 3).

### 1.3 Regla Anatómica y `DON'Ts` Obligatorios en el Prompt
Para evitar que el modelo distorsione o agrande las facciones de Daniel (especialmente la nariz) o inserte elementos no deseados, incluye siempre al final de cada prompt este bloque de restricciones negativas:
```text
DON'Ts / Evitar estrictamente: NO hacer la nariz grande, ancha ni bulbosa, NO exagerar rasgos faciales, mantener exactamente las proporciones faciales y nariz fina, recta y pequeña de la foto de referencia adjunta, sin música de fondo, sin subtítulos ni texto en pantalla.
```

### 1.4 Enrutamiento Residencial (Anti-Bloqueo de IP de Datacenter)
Las IPs de centros de datos (como Oracle Cloud) pueden activar el bloqueo `"Detectamos actividad inusual"` al generar en Google Flow. Cuando el desktop de Daniel (`<TU_DESKTOP_HOSTNAME>`, `<TU_DESKTOP_TAILSCALE_IP>` en Tailscale) esté encendido:
1. Abre un túnel SOCKS5 por SSH hacia el desktop (`ssh -i ~/.ssh/id_ed25519 -N -D 127.0.0.1:1080 daniel@<TU_DESKTOP_TAILSCALE_IP>`).
2. Ejecuta el navegador con `--proxy-server="socks5://127.0.0.1:1080" --remote-debugging-port=9222 --user-data-dir=/home/ubuntu/.config/google-chrome` sobre `Xvfb :99`, escribe `DevToolsActivePort` y opera mediante el subagente nativo `/browser` (`antigravity-flow`).

### 1.5 Auditoría de Espectrograma y Recorte de Silencios en Uniones (`-37 dBFS`)
Los modelos de video (como `Omni 1.2 Flash` en Google Flow) suelen dejar entre `0.8 s` y `2.5 s` de silencio al inicio y al final de cada clip de 10 segundos. Si se concatenan los 3 clips crudos (`0..10 s`), el avatar se queda callado mirando a cámara en las uniones entre un clip y otro, lo cual se percibe antinatural.

**Procedimiento obligatorio antes de unir con `FFmpeg`:**
1. Analiza la energía RMS en ventanas de `50 ms` (umbral `-37.0 dBFS`) junto con las marcas de tiempo por palabra de `faster-whisper` para detectar el primer y último fonema real de cada clip (dejando `0.08 s` a `0.12 s` de respiración natural) y cualquier pausa interna muerta `>= 0.60 s`.
2. Genera la lámina diagnóstica **Antes vs. Después** con espectrograma (`showspectrumpic`) y forma de onda (`showwavespic`) para verificar visualmente que desaparecieron los huecos planos en las uniones:
   ```bash
   ffmpeg -y -i raw_30s.mp4 -lavfi "showspectrumpic=s=1200x240:legend=0:color=intensity" spec_before.png
   ffmpeg -y -i raw_30s.mp4 -lavfi "aformat=channel_layouts=mono,showwavespic=s=1200x140:colors=#1A73E8" wave_before.png
   ```
3. Recorta y une los segmentos activos aplicando micro-fundidos de audio (`afade=d=0.05`) en cada corte para evitar chasquidos (`clicks`) acústicos:
   ```bash
   ffmpeg -y -threads 2 \
     -ss 0.85 -to 8.62 -i clip1.mp4 \
     -ss 0.02 -to 8.58 -i clip2.mp4 \
     -ss 9.22 -to 9.78 -i clip2.mp4 \
     -ss 1.02 -to 7.65 -i clip3.mp4 \
     -filter_complex "[0:v]scale=1080:1920:flags=lanczos,fps=24,format=yuv420p,setsar=1[v0];[0:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,afade=t=in:st=0:d=0.05,afade=t=out:st=7.70:d=0.07[a0];[1:v]scale=1080:1920:flags=lanczos,fps=24,format=yuv420p,setsar=1[v1];[1:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,afade=t=in:st=0:d=0.05,afade=t=out:st=8.49:d=0.07[a1];[2:v]scale=1080:1920:flags=lanczos,fps=24,format=yuv420p,setsar=1[v2];[2:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,afade=t=in:st=0:d=0.04,afade=t=out:st=0.50:d=0.06[a2];[3:v]scale=1080:1920:flags=lanczos,fps=24,format=yuv420p,setsar=1[v3];[3:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,afade=t=in:st=0:d=0.05,afade=t=out:st=6.55:d=0.08[a3];[v0][a0][v1][a1][v2][a2][v3][a3]concat=n=4:v=1:a=1[v][a]" \
     -map "[v]" -map "[a]" -c:v libx264 -crf 18 -preset superfast -c:a aac -b:a 128k trimmed_1080x1920.mp4
   ```

---

## 2. Geometría Estricta de Safe Margins (`1080 × 1920 px` · `9:16`)

La imagen de referencia oficial se encuentra en `assets/safe-margins-1080x1920.png`. Todo gráfico, tarjeta o subtítulo superpuesto sobre un video vertical `1080 × 1920 px` debe respetar estas zonas de exclusión de interfaz (TikTok, Instagram Reels y YouTube Shorts):

| Zona de Exclusión | Medida en `1080 × 1920 px` | Medida Equivalente en `720 × 1280 px` | Qué la bloquea en la app |
| :--- | :--- | :--- | :--- |
| **Margen Superior (Top Dead Zone)** | `0 px` a `160 px` (`top >= 160 px`) | `0 px` a `107 px` (`top >= 107 px`) | Barra superior de Reels/TikTok, cámara, buscador y pestañas |
| **Margen Inferior (Bottom Dead Zone)** | Últimos `480 px` (`bottom >= 480 px`, `y <= 1440 px`) | Últimos `320 px` (`bottom >= 320 px`, `y <= 960 px`) | Usuario, descripción, audio en reproducción, barra de progreso y botones CTA/QR |
| **Barra Lateral Derecha (Right Action Bar)** | `1080 px` de alto desde abajo (`y: 840..1920 px`), ancho `160–180 px` (`right >= 180 px`) | `720 px` de alto desde abajo (`y: 560..1280 px`), ancho `110–120 px` (`right >= 120 px`) | Avatar del creador, botones de Like, Comentarios, Guardados, Compartir y disco de audio |
| **Márgenes Laterales de Seguridad** | `80 px` a `120 px` por lado (`left >= 80–120 px`) | `54 px` a `80 px` por lado (`left >= 54–80 px`) | Recorte en pantallas estrechas y bordes curvos |
| **Zona del Rostro del Creador** | `y: 160 px` a `940 px` | `y: 107 px` a `625 px` | Rostro, ojos y boca del hablante (nunca cubrir con tarjetas) |

### Ventana Segura Óptima para Tarjetas Gráficas (Chest Safe Window)
En un lienzo de **`1080 × 1920 px`**, la caja segura donde deben vivir las tarjetas de datos y subtítulos sin tapar la barbilla del creador ni chocar con los iconos de TikTok/Reels es:
- **`left: 80px`** (o `90px`)
- **`right: 184px`** (deja libre toda la columna derecha de `180 px` donde van los iconos de interacción)
- **`bottom: 490px`** (queda por encima de la zona muerta inferior de `480 px`)
- **`top >= 945px`** (altura máxima de tarjeta `~480 px`, quedando siempre debajo de la barbilla del creador)

---

## 3. Gráficos Llamativos Mobile-First con OpenDesign (`Swiss Pulse` + Repositorios de Motion)

Referencias oficiales dentro de `/home/ubuntu/openDesign`:
- **HyperFrames (`heygen-com/hyperframes`):** `/home/ubuntu/openDesign/design-templates/hyperframes/` (`visual-styles.md`, `references/typography.md`, `references/captions.md`, `references/motion-principles.md`, `references/css-patterns.md`).
- **Huashu Art Motion (`alchaincyf/huashu-art-motion`):** `/home/ubuntu/openDesign/skills/huashu-art-motion/references/explainer-grammars.md` (`t2_keynote_ui` y `t3_finance_chart`: *"Una pantalla, una sola idea: un sustantivo, un número gigante y una tarjeta; un color para el protagonista y el resto se atenúa"*).
- **Motion.Lab (`yangxu128/Motion.Lab`):** `/home/ubuntu/openDesign/skills/motion-lab/references/` (`text.md`, `basic.md`, `advanced.md`).
- **Remotion (`remotion-dev/remotion`):** `/home/ubuntu/openDesign/skills/remotion/SKILL.md` y `~/.agents/skills/remotion-stories/SKILL.md`.

### 3.1 Escala Tipográfica Mobile-First Obligatoria (Prohibido Texto Pequeño)
En pantallas de celular (`1080 × 1920 px`), textos de `11px–22px` dentro de tablas densas pierden legibilidad inmediata. Siguiendo `hyperframes/references/typography.md` (*"Video sizes, not web sizes. Headlines: 60px+. Numbers dominate the frame at 80-120px"*):
- **Nombre del modelo / concepto protagonista:** **`54px` a `82px`** (`Inter 900`, `letter-spacing: -0.04em`).
- **Puntaje / métrica numérica principal (`5.0/5`, `3.5/5`, `2.0/5`):** **`74px` a `96px`** (`JetBrains Mono 800`).
- **Subtítulo cinético superior (2 a 4 palabras por golpe):** **`38px` a `56px`** con resaltado amarillo (`#FEF08A`, `Marker Sweep`) o recuadro rojo (`3.5px solid #EA4335`, `Sketchout`).
- **Descripción breve (máximo 4 a 6 palabras):** **`28px` a `34px`** (`Inter 800`). Prohibido usar textos menores a `20px`.
- **Barras proporcionales de datos:** Altura mínima de **`24px` a `28px`** con borde de `3px solid #0F172A`.

### 3.2 Tres Variantes de Layout Mobile-First (Según el Caso)
1. **Variante A (`Swiss Pulse · Giant Single-Focus`):** *"Una pantalla, una sola cosa"* (`huashu-art-motion`). En vez de mostrar una tabla de 3 filas pequeñas a la vez, cada tarjeta muestra únicamente el modelo o nivel que Daniel está pronunciando en ese segundo (`Hydrogen` -> `Neon` -> `Carbon`) a tamaño gigante (`78px` / `88px`).
2. **Variante B (`TikTok Kinetic Slam`):** Subtítulo cinético gigante (`56px`) arriba y tarjeta inferior dividida en 2 bloques de alto impacto (bloque izquierdo con métrica `5/5` en `76px` sobre `#EFF6FF` y bloque derecho con título en `54px`).
3. **Variante C (`Keynote Step-Focus`):** El nivel activo que se pronuncia se expande a tamaño gigante (`66px` / `74px`) ocupando el 75% de la tarjeta, mientras los otros dos niveles permanecen debajo en una tira compacta de contexto (`28px` en gris `#64748B`).
4. **Variante D (`Tabla Compacta de 3 Filas Simultáneas`):** Solo cuando se requiera explícitamente comparar las 3 filas completas al mismo tiempo en una vista estática o de cierre.

### 3.3 Flujo Obligatorio por Checkpoints (Muestras -> Retroalimentación -> Render Final)
1. **Generar y enviar solo muestras estáticas primero (Checkpoint de Retroalimentación):** Renderiza únicamente 1 fotograma de muestra por cada variante propuesta (`Muestra A`, `Muestra B`, `Muestra C`) junto con el diagnóstico de espectrograma (`Antes vs. Después`) y envíalos a Telegram.
2. **Pausa obligatoria:** Detente y muestra a Daniel las sugerencias para que elija o ajuste antes de renderizar los cientos de fotogramas del video completo, evitando desperdiciar tiempo de cómputo.
3. **Renderizado final y Verificación Visual (QC):** Solo después de que Daniel elija la muestra, renderiza la secuencia completa de fotogramas, intégrala con `ffmpeg`, extrae un mosaico de fotogramas y verifica con `read_file` que ninguna tarjeta toque la barbilla del creador (`y >= 1030 px`) ni invada los `480 px` inferiores o los `184 px` derechos.
