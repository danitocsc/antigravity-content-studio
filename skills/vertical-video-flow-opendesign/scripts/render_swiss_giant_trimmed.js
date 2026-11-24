const { chromium } = require('/home/ubuntu/node_modules/playwright-core');
const fs = require('fs');
const path = require('path');

function expoOut(x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return 1 - Math.pow(2, -10 * x);
}
function prog(t, t0, dur) {
  return expoOut((t - t0) / dur);
}
function quant(v, step) {
  return Math.round(v / step) * step;
}

function getBeatState(t) {
  if (t < 0.12) return { empty: true };

  // Beat 1A: 0.12s -> 4.25s ("¿Sabías que en Gemini no todos los modelos hacen lo mismo?")
  if (t < 4.25) {
    return {
      beat: '1A',
      enter: quant(prog(t, 0.12, 0.32), 0.05),
      sketch: quant(prog(t, 2.05, 0.32), 0.1),
      bar: quant(prog(t, 0.30, 0.60), 0.05)
    };
  }
  // Beat 1B: 4.25s -> 7.77s ("Google ahora los divide en tres niveles según lo que necesites.")
  if (t < 7.77) {
    return {
      beat: '1B',
      enter: quant(prog(t, 4.25, 0.30), 0.05),
      s1: t >= 5.15 ? 1 : 0.2,
      s2: t >= 5.55 ? 1 : 0.2,
      s3: t >= 5.95 ? 1 : 0.2
    };
  }
  // Beat 2A: 7.77s -> 12.85s ("Para preguntas rápidas y tu día a día usa Hydrogen, que es gratis y el más veloz.")
  if (t < 12.85) {
    return {
      beat: '2A',
      enter: quant(prog(t, 7.77, 0.30), 0.05),
      bar: quant(prog(t, 9.95, 0.55), 0.04),
      sketch: quant(prog(t, 11.10, 0.30), 0.1)
    };
  }
  // Beat 2B: 12.85s -> 15.25s ("Para análisis complejo usa Neon,")
  if (t < 15.25) {
    return {
      beat: '2B',
      enter: quant(prog(t, 12.85, 0.28), 0.05),
      bar: quant(prog(t, 14.00, 0.50), 0.04)
    };
  }
  // Beat 2C: 15.25s -> 16.89s ("y para retos pesados, Carbon.")
  if (t < 16.89) {
    return {
      beat: '2C',
      enter: quant(prog(t, 15.25, 0.25), 0.05),
      bar: quant(prog(t, 15.85, 0.45), 0.05)
    };
  }
  // Beat 3A: 16.89s -> 20.65s ("Un tip clave: abajo del chat puedes ajustar el nivel de pensamiento")
  if (t < 20.65) {
    return {
      beat: '3A',
      enter: quant(prog(t, 16.89, 0.30), 0.05),
      bar: quant(prog(t, 18.80, 0.55), 0.05)
    };
  }
  // Beat 3B: 20.65s -> 24.20s ("entre bajo, medio y alto para no gastar tu límite.")
  return {
    beat: '3B',
    enter: quant(prog(t, 20.65, 0.28), 0.05),
    s1: t >= 20.80 ? 1 : 0.2,
    s2: t >= 21.45 ? 1 : 0.2,
    s3: t >= 21.85 ? 1 : 0.2,
    sketch: quant(prog(t, 22.45, 0.32), 0.1)
  };
}

function renderBeatHtml(st) {
  if (st.empty) return '';
  const y = Math.round((1 - st.enter) * 26);
  const op = st.enter.toFixed(2);

  if (st.beat === '1A') {
    return `
      <div style="opacity:${op};transform:translateY(${y}px);">
        <div class="ma-caption">¿Sabías esto de <span class="ma-hl">Gemini 4</span>?</div>
        <div class="ma-card" style="margin-top:14px;">
          <div class="ma-topbar"><span>SWISS PULSE · ARQUITECTURA</span><span>01 / 06</span></div>
          <div class="ma-body">
            <div class="ma-main-row">
              <div class="ma-model">Gemini 4</div>
              <div class="ma-score">3<small>MODOS</small></div>
            </div>
            <div class="ma-desc">No todos los modelos hacen <strong style="border-color:${st.sketch > 0 ? '#EA4335' : 'transparent'};">lo mismo</strong></div>
            <div class="ma-bar-track"><div class="ma-bar-fill" style="width:${Math.round(st.bar * 100)}%;background:#0F172A;"></div></div>
          </div>
        </div>
      </div>`;
  }

  if (st.beat === '1B') {
    return `
      <div style="opacity:${op};transform:translateY(${y}px);">
        <div class="ma-caption">Google los divide en <span class="ma-hl">3 niveles</span></div>
        <div class="ma-card" style="margin-top:14px;">
          <div class="ma-topbar"><span>CLASIFICACIÓN DE MODELOS</span><span>02 / 06</span></div>
          <div class="ma-body">
            <div class="ma-main-row">
              <div class="ma-model">3 Niveles</div>
              <div class="ma-score" style="color:#137333;">N1-N3</div>
            </div>
            <div class="ma-desc">Elige según la dificultad de tu tarea</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
              <div style="opacity:${st.s1};background:#EFF6FF;border:3.5px solid #0F172A;padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:24px;font-weight:800;color:#1A73E8;">01 HYDROGEN</div>
              <div style="opacity:${st.s2};background:#ECFDF5;border:3.5px solid #0F172A;padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:24px;font-weight:800;color:#137333;">02 NEON</div>
              <div style="opacity:${st.s3};background:#FEFCE8;border:3.5px solid #0F172A;padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:24px;font-weight:800;color:#B45309;">03 CARBON</div>
            </div>
          </div>
        </div>
      </div>`;
  }

  if (st.beat === '2A') {
    const score = (st.bar * 5.0).toFixed(1);
    return `
      <div style="opacity:${op};transform:translateY(${y}px);">
        <div class="ma-caption">Día a día: usa <span class="ma-hl">Hydrogen</span></div>
        <div class="ma-card" style="margin-top:14px;">
          <div class="ma-topbar"><span>VELOCIDAD MÁXIMA · DÍA A DÍA</span><span>03 / 06</span></div>
          <div class="ma-body">
            <div class="ma-main-row">
              <div class="ma-model">Hydrogen</div>
              <div class="ma-score">${score}<small>/5</small></div>
            </div>
            <div class="ma-desc"><strong style="border-color:${st.sketch > 0 ? '#EA4335' : 'transparent'};">GRATIS</strong> · El más veloz para preguntas rápidas</div>
            <div class="ma-bar-track"><div class="ma-bar-fill" style="width:${Math.round(st.bar * 100)}%;background:#1A73E8;"></div></div>
          </div>
        </div>
      </div>`;
  }

  if (st.beat === '2B') {
    const score = (st.bar * 3.5).toFixed(1);
    return `
      <div style="opacity:${op};transform:translateY(${y}px);">
        <div class="ma-caption">Análisis complejo: usa <span class="ma-hl">Neon</span></div>
        <div class="ma-card" style="margin-top:14px;">
          <div class="ma-topbar"><span>BALANCE DE RAZONAMIENTO · PRO</span><span style="color:#137333;">04 / 06</span></div>
          <div class="ma-body">
            <div class="ma-main-row">
              <div class="ma-model">Neon</div>
              <div class="ma-score" style="color:#137333;">${score}<small>/5</small></div>
            </div>
            <div class="ma-desc"><strong style="color:#137333;border-color:#137333;">PLUS · PRO</strong> · Datos, código y análisis</div>
            <div class="ma-bar-track"><div class="ma-bar-fill" style="width:${Math.round(st.bar * 70)}%;background:#137333;"></div></div>
          </div>
        </div>
      </div>`;
  }

  if (st.beat === '2C') {
    const score = (st.bar * 2.0).toFixed(1);
    return `
      <div style="opacity:${op};transform:translateY(${y}px);">
        <div class="ma-caption">Retos pesados: usa <span class="ma-hl">Carbon</span></div>
        <div class="ma-card" style="margin-top:14px;">
          <div class="ma-topbar"><span>MÁXIMA POTENCIA · PLAN ULTRA</span><span style="color:#B45309;">05 / 06</span></div>
          <div class="ma-body">
            <div class="ma-main-row">
              <div class="ma-model">Carbon</div>
              <div class="ma-score" style="color:#E37400;">${score}<small>/5</small></div>
            </div>
            <div class="ma-desc"><strong style="color:#B45309;border-color:#E37400;">ULTRA</strong> · Problemas pesados y profundos</div>
            <div class="ma-bar-track"><div class="ma-bar-fill" style="width:${Math.round(st.bar * 40)}%;background:#E37400;"></div></div>
          </div>
        </div>
      </div>`;
  }

  if (st.beat === '3A') {
    return `
      <div style="opacity:${op};transform:translateY(${y}px);">
        <div class="ma-caption">Tip clave abajo del <span class="ma-hl">chat</span></div>
        <div class="ma-card" style="margin-top:14px;">
          <div class="ma-topbar"><span>CONTROL DE RAZONAMIENTO</span><span>06 / 06</span></div>
          <div class="ma-body">
            <div class="ma-main-row">
              <div class="ma-model" style="font-size:66px;">Pensamiento</div>
              <div class="ma-score" style="font-size:74px;">3<small>NIV</small></div>
            </div>
            <div class="ma-desc">Ajusta cuánto razona antes de responder</div>
            <div class="ma-bar-track"><div class="ma-bar-fill" style="width:${Math.round(st.bar * 100)}%;background:#1A73E8;"></div></div>
          </div>
        </div>
      </div>`;
  }

  // Beat 3B
  return `
    <div style="opacity:${op};transform:translateY(${y}px);">
      <div class="ma-caption">No gastes tu <span class="ma-hl">límite diario</span></div>
      <div class="ma-card" style="margin-top:14px;">
        <div class="ma-topbar"><span>SELECTOR ABAJO DEL CHAT</span><span style="color:#137333;">AHORRA CUOTA</span></div>
        <div class="ma-body">
          <div class="ma-main-row">
            <div class="ma-model" style="font-size:66px;">Nivel Activo</div>
            <div class="ma-score" style="font-size:74px;color:#137333;">CUOTA</div>
          </div>
          <div class="ma-desc">Alterna para cuidar tu <strong style="border-color:${st.sketch > 0 ? '#EA4335' : 'transparent'};">límite diario</strong></div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
            <div style="opacity:${st.s1};background:#EFF6FF;border:3.5px solid #0F172A;padding:10px 14px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:800;color:#1A73E8;">BAJO</div>
            <div style="opacity:${st.s2};background:#ECFDF5;border:3.5px solid #0F172A;padding:10px 14px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:800;color:#137333;">MEDIO</div>
            <div style="opacity:${st.s3};background:#FEFCE8;border:3.5px solid #0F172A;padding:10px 14px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:800;color:#B45309;">ALTO</div>
          </div>
        </div>
      </div>
    </div>`;
}

(async () => {
  const framesDir = '/tmp/flow_research/giant_frames';
  const cacheDir = '/tmp/flow_research/giant_cache';
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.rmSync(cacheDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });
  fs.mkdirSync(cacheDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });
  const page = await browser.newPage({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1
  });

  await page.goto('file:///tmp/flow_research/muestras_mobile_giant.html?m=1', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.querySelector('.bg-frame').remove();
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
    document.getElementById('m2').remove();
    document.getElementById('m3').remove();
  });
  await page.waitForTimeout(200);

  const fps = 24;
  const totalFrames = 581; // 24.167s @ 24fps
  const stateToFile = new Map();
  let uniqueCount = 0;

  for (let f = 0; f < totalFrames; f++) {
    const t = f / fps;
    const st = getBeatState(t);
    const key = JSON.stringify(st);
    let cachedPath = stateToFile.get(key);
    if (!cachedPath) {
      uniqueCount++;
      cachedPath = path.join(cacheDir, `u_${String(uniqueCount).padStart(4, '0')}.png`);
      const html = renderBeatHtml(st);
      await page.evaluate((h) => {
        document.getElementById('m1').innerHTML = h;
      }, html);
      await page.screenshot({ path: cachedPath, omitBackground: true });
      stateToFile.set(key, cachedPath);
    }
    const framePath = path.join(framesDir, `frame_${String(f).padStart(5, '0')}.png`);
    fs.symlinkSync(cachedPath, framePath);
  }

  console.log(`Rendered ${uniqueCount} unique giant-type keyframes for ${totalFrames} frames.`);
  await browser.close();
})();
