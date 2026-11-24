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
  if (t < 0.10) return { empty: true };

  // Beat 1: 0.10s -> 4.25s ("¿Sabías que en Gemini no todos los modelos hacen lo mismo?")
  if (t < 4.25) {
    return {
      beat: 1,
      enter: quant(prog(t, 0.10, 0.30), 0.05),
      slam: quant(prog(t, 2.00, 0.25), 0.1),
      bar: quant(prog(t, 0.30, 0.55), 0.05)
    };
  }
  // Beat 2: 4.25s -> 7.77s ("Google ahora los divide en tres niveles según lo que necesites.")
  if (t < 7.77) {
    return {
      beat: 2,
      enter: quant(prog(t, 4.25, 0.28), 0.05),
      slam: quant(prog(t, 5.15, 0.25), 0.1),
      bar: quant(prog(t, 5.15, 0.60), 0.05)
    };
  }
  // Beat 3: 7.77s -> 12.85s ("Para preguntas rápidas y tu día a día usa Hydrogen, que es gratis y el más veloz.")
  if (t < 12.85) {
    return {
      beat: 3,
      enter: quant(prog(t, 7.77, 0.28), 0.05),
      slam: quant(prog(t, 9.85, 0.25), 0.1),
      bar: quant(prog(t, 9.95, 0.55), 0.04)
    };
  }
  // Beat 4: 12.85s -> 15.25s ("Para análisis complejo usa Neon,")
  if (t < 15.25) {
    return {
      beat: 4,
      enter: quant(prog(t, 12.85, 0.26), 0.05),
      slam: quant(prog(t, 13.85, 0.25), 0.1),
      bar: quant(prog(t, 13.95, 0.50), 0.04)
    };
  }
  // Beat 5: 15.25s -> 16.89s ("y para retos pesados, Carbon.")
  if (t < 16.89) {
    return {
      beat: 5,
      enter: quant(prog(t, 15.25, 0.24), 0.05),
      slam: quant(prog(t, 15.75, 0.22), 0.1),
      bar: quant(prog(t, 15.80, 0.45), 0.05)
    };
  }
  // Beat 6: 16.89s -> 20.65s ("Un tip clave: abajo del chat puedes ajustar el nivel de pensamiento")
  if (t < 20.65) {
    return {
      beat: 6,
      enter: quant(prog(t, 16.89, 0.28), 0.05),
      slam: quant(prog(t, 19.20, 0.25), 0.1),
      bar: quant(prog(t, 18.80, 0.55), 0.05)
    };
  }
  // Beat 7: 20.65s -> 24.20s ("entre bajo, medio y alto para no gastar tu límite.")
  let modeLabel = 'BAJO';
  let modeColor = '#1A73E8';
  let modeBg = '#EFF6FF';
  let barPct = 33;
  if (t >= 21.85) {
    modeLabel = 'ALTO';
    modeColor = '#B45309';
    modeBg = '#FEFCE8';
    barPct = 100;
  } else if (t >= 21.42) {
    modeLabel = 'MEDIO';
    modeColor = '#137333';
    modeBg = '#ECFDF5';
    barPct = 66;
  }
  return {
    beat: 7,
    enter: quant(prog(t, 20.65, 0.26), 0.05),
    slam: quant(prog(t, 22.35, 0.25), 0.1),
    modeLabel,
    modeColor,
    modeBg,
    barPct
  };
}

function renderMuestraB(st) {
  if (st.empty) return '';
  const y = Math.round((1 - st.enter) * 28);
  const op = st.enter.toFixed(2);
  const slamScale = st.slam > 0 ? (1 + (1 - st.slam) * 0.12).toFixed(2) : '1';
  const slamBorder = st.slam > 0 ? '#EA4335' : 'transparent';
  const slamBg = st.slam > 0 ? '#FEF08A' : 'transparent';

  let kicker = '';
  let headline = '';
  let leftBg = '#EFF6FF';
  let leftColor = '#1A73E8';
  let bigNum = '';
  let bigUnit = '';
  let rightTitle = '';
  let rightSub = '';
  let rightColor = '#137333';
  let barWidth = 100;
  let barColor = '#1A73E8';

  if (st.beat === 1) {
    kicker = '01 / 06 · ARQUITECTURA GEMINI 4';
    headline = `No todos hacen <span class="mb-sketch" style="border-color:${slamBorder};background:${slamBg};transform:scale(${slamScale});">lo mismo</span>`;
    leftBg = '#EFF6FF';
    leftColor = '#1A73E8';
    bigNum = '3X';
    bigUnit = 'MODELOS';
    rightTitle = 'Gemini 4';
    rightSub = 'Cada modelo tiene su función';
    rightColor = '#1E293B';
    barWidth = Math.round(st.bar * 100);
    barColor = '#1A73E8';
  } else if (st.beat === 2) {
    kicker = '02 / 06 · CLASIFICACIÓN GOOGLE';
    headline = `Se dividen en <span class="mb-sketch" style="border-color:${slamBorder};background:${slamBg};transform:scale(${slamScale});">3 niveles</span>`;
    leftBg = '#ECFDF5';
    leftColor = '#137333';
    bigNum = 'N1-3';
    bigUnit = 'NIVELES';
    rightTitle = 'Según tu reto';
    rightSub = 'Hydrogen · Neon · Carbon';
    rightColor = '#137333';
    barWidth = Math.round(st.bar * 100);
    barColor = '#137333';
  } else if (st.beat === 3) {
    const v = st.bar >= 0.96 ? '5/5' : `${(st.bar * 5).toFixed(1)}/5`;
    kicker = '03 / 06 · VELOCIDAD MÁXIMA';
    headline = `Usa <span class="mb-sketch" style="border-color:${slamBorder};background:${slamBg};transform:scale(${slamScale});">Hydrogen</span> en tu día a día`;
    leftBg = '#EFF6FF';
    leftColor = '#1A73E8';
    bigNum = v;
    bigUnit = 'VELOCIDAD';
    rightTitle = 'Hydrogen';
    rightSub = 'GRATIS · Respuestas al instante';
    rightColor = '#137333';
    barWidth = Math.round(st.bar * 100);
    barColor = '#1A73E8';
  } else if (st.beat === 4) {
    const v = (st.bar * 3.5).toFixed(1) + '/5';
    kicker = '04 / 06 · ANÁLISIS COMPLEJO';
    headline = `Análisis complejo: usa <span class="mb-sketch" style="border-color:${slamBorder};background:${slamBg};transform:scale(${slamScale});">Neon</span>`;
    leftBg = '#ECFDF5';
    leftColor = '#137333';
    bigNum = v;
    bigUnit = 'VELOCIDAD';
    rightTitle = 'Neon';
    rightSub = 'PLUS y PRO · Datos y código';
    rightColor = '#137333';
    barWidth = Math.round(st.bar * 70);
    barColor = '#137333';
  } else if (st.beat === 5) {
    const v = st.bar >= 0.96 ? '2/5' : `${(st.bar * 2).toFixed(1)}/5`;
    kicker = '05 / 06 · MÁXIMA POTENCIA';
    headline = `Retos pesados: usa <span class="mb-sketch" style="border-color:${slamBorder};background:${slamBg};transform:scale(${slamScale});">Carbon</span>`;
    leftBg = '#FEFCE8';
    leftColor = '#B45309';
    bigNum = v;
    bigUnit = 'VELOCIDAD';
    rightTitle = 'Carbon';
    rightSub = 'PLAN ULTRA · Escala profunda';
    rightColor = '#B45309';
    barWidth = Math.round(st.bar * 40);
    barColor = '#E37400';
  } else if (st.beat === 6) {
    kicker = '06 / 06 · TIP CLAVE EN EL CHAT';
    headline = `Abajo ajusta el <span class="mb-sketch" style="border-color:${slamBorder};background:${slamBg};transform:scale(${slamScale});">pensamiento</span>`;
    leftBg = '#EFF6FF';
    leftColor = '#1A73E8';
    bigNum = '3';
    bigUnit = 'MODOS';
    rightTitle = 'Pensamiento';
    rightSub = 'Controla cuánto razona el chat';
    rightColor = '#1A73E8';
    barWidth = Math.round(st.bar * 100);
    barColor = '#1A73E8';
  } else {
    kicker = '06 / 06 · OPTIMIZA TU CUOTA DIARIA';
    headline = `Elige nivel y cuida tu <span class="mb-sketch" style="border-color:${slamBorder};background:${slamBg};transform:scale(${slamScale});">límite</span>`;
    leftBg = st.modeBg;
    leftColor = st.modeColor;
    bigNum = st.modeLabel;
    bigUnit = 'NIVEL ACTIVO';
    rightTitle = 'Bajo · Medio · Alto';
    rightSub = 'No gastes tu límite diario';
    rightColor = '#137333';
    barWidth = st.barPct;
    barColor = st.modeColor;
  }

  const numFontSize = bigNum.length >= 5 ? '56px' : '72px';

  return `
    <div style="opacity:${op};transform:translateY(${y}px);display:flex;flex-direction:column;gap:14px;">
      <div class="mb-kinetic-box">
        <div class="mb-kicker">${kicker}</div>
        <div class="mb-giant-words">${headline}</div>
      </div>
      <div class="mb-split-card">
        <div class="mb-left-score" style="background:${leftBg};">
          <div class="mb-big-num" style="color:${leftColor};font-size:${numFontSize};">${bigNum}</div>
          <div class="mb-big-unit">${bigUnit}</div>
        </div>
        <div class="mb-right-info">
          <div class="mb-right-title" style="font-size:${rightTitle.length > 12 ? '44px' : '54px'};">${rightTitle}</div>
          <div class="mb-right-sub" style="color:${rightColor};margin-bottom:10px;">${rightSub}</div>
          <div style="height:14px;background:#F1F5F9;border:2.5px solid #0F172A;width:100%;">
            <div style="height:100%;width:${barWidth}%;background:${barColor};"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

(async () => {
  const framesDir = '/tmp/flow_research/mb_frames';
  const cacheDir = '/tmp/flow_research/mb_cache';
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

  await page.goto('file:///tmp/flow_research/muestras_mobile_giant.html?m=2', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.querySelector('.bg-frame').remove();
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
    document.getElementById('m1').remove();
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
      const html = renderMuestraB(st);
      await page.evaluate((h) => {
        document.getElementById('m2').innerHTML = h;
      }, html);
      await page.screenshot({ path: cachedPath, omitBackground: true });
      stateToFile.set(key, cachedPath);
    }
    const framePath = path.join(framesDir, `frame_${String(f).padStart(5, '0')}.png`);
    fs.symlinkSync(cachedPath, framePath);
  }

  console.log(`Rendered ${uniqueCount} unique Muestra B keyframes for ${totalFrames} frames.`);
  await browser.close();
})();
