# Reglas Globales de Diseño, Redacción e Iteración para Creación de Contenido

Copia o integra estas reglas en tu archivo `AGENTS.md` o `GEMINI.md` para que tu agente de Antigravity mantenga el mismo estándar visual y operativo en todas las sesiones.

---

## 1. Directrices de Diseño UI/UX (Modo Claro + Zero Slop)
- **Modo Blanco / Claro Obligatorio:** Nunca diseñes carruseles educativos, tarjetas de datos sobre video, reportes diagnósticos o interfaces en modo oscuro por defecto.
- **Paleta Base de Alto Contraste:** Utiliza fondos `#FFFFFF` y `#F8FAFC`, bordes arquitectónicos firmes (`2.5px` a `4.5px solid #0F172A` o `#CBD5E1` para divisores internos), sombra dura desplazada (`6px 6px 0px #0F172A` a `10px 10px 0px #0F172A`) y tipografía oscura `#0F172A`.
- **Cero Badges Decorativos:** Nunca utilices píldoras o chips decorativos con fondo redondeado. Muestra los indicadores, códigos, niveles y estados con tipografía monoespaciada limpia (`JetBrains Mono`), barras horizontales o recuadros `Sketchout` (`border: 3.5px solid #EA4335`).

---

## 2. Estilo de Redacción Limpio (Sin Marcas Típicas de IA)
- **Cero Guiones Largos (`—`):** Prohibido usar la raya o guion largo para encerrar incisos. Usa comas, paréntesis o punto y seguido.
- **Cero Punto y Coma (`;`):** Prohibido usar punto y coma en textos de láminas, subtítulos o descripciones de redes sociales. Usa punto y seguido o conectores naturales.
- **Cero Cursivas (`font-style: normal`):** Prohibido aplicar cursivas o itálicas en titulares, tarjetas, subtítulos de video o descripciones.

---

## 3. Iteración Continua sobre Retroalimentación y Checkpoints
- **Checkpoint Obligatorio de Muestras y Sugerencias Antes de Continuar:** Antes de ejecutar un renderizado completo de video o lote pesado de imágenes, presenta primero muestras rápidas (`Muestra A`, `Muestra B`, `Muestra C`) y espera siempre la retroalimentación y elección explícita del usuario para no perder tiempo ni cómputo.
- **Actualización Proactiva de Skills:** Cada vez que el usuario dé retroalimentación sobre tamaño de letra, cortes de audio, colores, márgenes o estructura, actualiza de inmediato el archivo `SKILL.md` correspondiente para persistir la mejora.
- **Confirmación Obligatoria ante Reemplazos ("Dependiendo del Caso"):** Si una corrección nueva pudiera reemplazar un patrón existente en una skill, pregunta siempre al usuario si la nueva regla sustituye por completo a la anterior o si ambas deben conservarse como variantes dependiendo del caso.
