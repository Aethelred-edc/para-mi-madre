function drawRoseCurve(canvas, opts = {}) {
  const ctx = canvas.getContext('2d');
  const W   = canvas.width;
  const H   = canvas.height;
  const cx  = W / 2;
  const cy  = H / 2;

  const {
    k          = 5,
    maxR       = Math.min(W, H) * 0.42,
    color      = 'rgba(201,168,76,0.6)',
    strokeWidth = 1.4,
    steps      = 1800,
    rotation   = 0,
    fill       = false,
    fillColor  = 'rgba(201,168,76,0.04)'
  } = opts;

  const totalAngle = Math.PI * (k % 2 === 0 ? 4 : 2);
  const pts = [];

  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * totalAngle;
    const r     = maxR * Math.cos(k * theta);
    pts.push([cx + r * Math.cos(theta + rotation), cy + r * Math.sin(theta + rotation)]);
  }

  // Draw fill with closed path (separate from stroke)
  if (fill) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
  }

  // Draw stroke on a fresh open path (no closePath = no diagonal line)
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = color;
  ctx.lineWidth   = strokeWidth;
  ctx.lineJoin    = 'round';
  ctx.lineCap     = 'round';
  ctx.stroke();
}

function animatePreloaderRose(canvas) {
  let angle = 0;
  let raf;

  function frame() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRoseCurve(canvas, {
      k: 5, maxR: 50,
      color: 'rgba(201,168,76,0.85)',
      strokeWidth: 1.6,
      rotation: angle, fill: true,
      fillColor: 'rgba(201,168,76,0.07)'
    });
    angle += 0.007;
    raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}

function animateBackgroundRose(canvas) {
  let angle = 0;
  let raf;

  function resize() {
    canvas.width  = canvas.offsetWidth  || 300;
    canvas.height = canvas.offsetHeight || 300;
  }

  resize();
  window.addEventListener('resize', resize);

  function frame() {
    const ctx   = canvas.getContext('2d');
    const { width: W, height: H } = canvas;
    ctx.clearRect(0, 0, W, H);

    const baseR = Math.min(W, H) * 0.38;

    [
      { k: 5, r: baseR,        color: 'rgba(201,168,76,0.09)',  sw: 1.6, rot: angle },
      { k: 7, r: baseR * 0.75, color: 'rgba(100,18,32,0.13)',   sw: 1.0, rot: -angle * 0.65 },
      { k: 3, r: baseR * 0.52, color: 'rgba(232,201,107,0.07)', sw: 1.2, rot:  angle * 1.25 }
    ].forEach(l => {
      drawRoseCurve(canvas, { k: l.k, maxR: l.r, color: l.color, strokeWidth: l.sw, rotation: l.rot });
    });

    angle += 0.0025;
    raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
  };
}

function drawRewardRoses(canvas) {
  let angle = 0;
  let raf;
  const W = canvas.width;
  const H = canvas.height;

  const roses = [
    { x: W * 0.18, y: H * 0.5, r: 54, k: 5, phase: 0 },
    { x: W * 0.5,  y: H * 0.46, r: 72, k: 7, phase: Math.PI / 3 },
    { x: W * 0.82, y: H * 0.5, r: 54, k: 5, phase: Math.PI * 0.7 },
    { x: W * 0.5,  y: H * 0.5, r: 36, k: 3, phase: Math.PI }
  ];

  function frame() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    roses.forEach((d, i) => {
      const off   = document.createElement('canvas');
      const pad   = d.r + 4;
      off.width   = pad * 2;
      off.height  = pad * 2;

      const alpha = i === 1 ? 0.78 : i === 3 ? 0.48 : 0.58;
      drawRoseCurve(off, {
        k: d.k, maxR: d.r,
        color: `rgba(201,168,76,${alpha})`,
        strokeWidth: i === 1 ? 1.8 : 1.3,
        rotation: angle * (i === 3 ? -1 : 1) + d.phase,
        fill: true,
        fillColor: `rgba(201,168,76,${i === 1 ? 0.08 : 0.04})`
      });

      ctx.drawImage(off, d.x - pad, d.y - pad);
    });

    angle += 0.003;
    raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}

function drawMandala(canvas) {
  const ctx  = canvas.getContext('2d');
  const W    = canvas.width;
  const H    = canvas.height;
  const cx   = W / 2;
  const cy   = H / 2;
  const maxR = Math.min(W, H) * 0.42;
  let angle  = 0;
  let raf;
  let progress = 0;

  const PETALS = 20;

  function frame() {
    progress = Math.min(progress + 0.008, 1);
    ctx.clearRect(0, 0, W, H);

    const currentR = maxR * progress;

    // Outer glow ring
    const glow = ctx.createRadialGradient(cx, cy, currentR * 0.3, cx, cy, currentR * 1.1);
    glow.addColorStop(0, 'transparent');
    glow.addColorStop(0.7, `rgba(201,168,76,${0.06 * progress})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, currentR * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Particle dots
    for (let p = 0; p < PETALS; p++) {
      const baseAngle = (p / PETALS) * Math.PI * 2;
      for (let step = 0; step < 16; step++) {
        const r     = (step / 16) * currentR;
        const theta = baseAngle + angle * (p % 2 === 0 ? 1 : -0.6);
        const x     = cx + r * Math.cos(theta);
        const y     = cy + r * Math.sin(theta);
        const alpha = 0.15 + (r / maxR) * 0.65;
        const size  = 0.8 + (step / 16) * 2.8;

        ctx.beginPath();
        ctx.arc(x, y, size * progress, 0, Math.PI * 2);
        ctx.fillStyle = step % 3 === 0
          ? `rgba(232,201,107,${alpha})`
          : `rgba(201,168,76,${alpha * 0.75})`;
        ctx.fill();
      }
    }

    const layers = [
      { k: 5, rMult: 1.0,  alpha: 0.80, sw: 2.0 },
      { k: 7, rMult: 0.75, alpha: 0.60, sw: 1.5 },
      { k: 3, rMult: 0.52, alpha: 0.45, sw: 1.2 },
      { k: 9, rMult: 0.32, alpha: 0.30, sw: 0.9 }
    ];

    layers.forEach(({ k, rMult, alpha, sw }) => {
      drawRoseCurve(canvas, {
        k, maxR: currentR * rMult,
        color: `rgba(201,168,76,${alpha * progress})`,
        strokeWidth: sw,
        rotation: angle * (k % 2 === 0 ? 1 : -0.8),
        fill: true,
        fillColor: `rgba(201,168,76,${0.05 * progress})`
      });
    });

    angle += 0.005;
    raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}

function spawnHearts(container, count = 12) {
  const hearts = ['♥', '❤', '♡', '❥'];

  for (let i = 0; i < count; i++) {
    const el  = document.createElement('span');
    el.classList.add('heart-particle');
    el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    el.style.setProperty('--left',     `${Math.random() * 100}%`);
    el.style.setProperty('--size',     `${0.6 + Math.random() * 1.1}rem`);
    el.style.setProperty('--duration', `${7 + Math.random() * 9}s`);
    el.style.setProperty('--delay',    `${Math.random() * 5}s`);
    el.style.color = Math.random() > 0.5
      ? `rgba(201,168,76,${0.3 + Math.random() * 0.4})`
      : `rgba(232,130,154,${0.3 + Math.random() * 0.4})`;
    container.appendChild(el);
  }
}

function spawnPetals(container, count = 18) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.classList.add('petal-particle');
    el.style.setProperty('--left',     `${Math.random() * 100}%`);
    el.style.setProperty('--size',     `${6 + Math.random() * 10}px`);
    el.style.setProperty('--duration', `${9 + Math.random() * 11}s`);
    el.style.setProperty('--delay',    `${Math.random() * 7}s`);
    el.style.setProperty('--sway',     `${(Math.random() - 0.5) * 140}px`);
    el.style.setProperty('--spin',     `${(Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360)}deg`);
    el.style.setProperty('--color',
      Math.random() > 0.6
        ? `rgba(201,168,76,${0.2 + Math.random() * 0.3})`
        : `rgba(232,130,154,${0.15 + Math.random() * 0.25})`
    );
    container.appendChild(el);
  }
}

function spawnRewardPetals(container, count = 40) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.classList.add('petal-particle', 'petal-particle--reward');
    el.style.setProperty('--left',     `${Math.random() * 100}%`);
    el.style.setProperty('--size',     `${8 + Math.random() * 14}px`);
    el.style.setProperty('--duration', `${6 + Math.random() * 8}s`);
    el.style.setProperty('--delay',    `${Math.random() * 3}s`);
    el.style.setProperty('--sway',     `${(Math.random() - 0.5) * 200}px`);
    el.style.setProperty('--spin',     `${(Math.random() > 0.5 ? 1 : -1) * (200 + Math.random() * 400)}deg`);
    el.style.setProperty('--color',
      Math.random() > 0.5
        ? `rgba(232,201,107,${0.4 + Math.random() * 0.4})`
        : `rgba(201,168,76,${0.3 + Math.random() * 0.4})`
    );
    container.appendChild(el);
  }
}

function launchSuccessOverlay(symbol) {
  const overlay = document.createElement('div');
  overlay.className = 'success-overlay';

  const count = 12;
  for (let i = 0; i < count; i++) {
    const el    = document.createElement('span');
    el.className = 'success-overlay__particle';
    el.textContent = symbol;
    const a    = (i / count) * Math.PI * 2;
    const dist = 55 + Math.random() * 55;
    el.style.setProperty('--tx',    `${Math.cos(a) * dist}px`);
    el.style.setProperty('--ty',    `${Math.sin(a) * dist}px`);
    el.style.setProperty('--delay', `${i * 0.04}s`);
    overlay.appendChild(el);
  }

  const center = document.createElement('span');
  center.className  = 'success-overlay__center';
  center.textContent = symbol;
  overlay.appendChild(center);

  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 1500);
}

function initGalaxyCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  let raf;
  let angle = 0;

  function resize() {
    canvas.width  = canvas.offsetWidth  || window.innerWidth;
    canvas.height = canvas.offsetHeight || 400;
  }

  resize();
  window.addEventListener('resize', resize);

  const stars = Array.from({ length: 110 }, () => ({
    x:     Math.random(),
    y:     Math.random(),
    r:     0.3 + Math.random() * 1.6,
    speed: 0.00015 + Math.random() * 0.0004,
    phase: Math.random() * Math.PI * 2,
    gold:  Math.random() > 0.35
  }));

  const dust = Array.from({ length: 30 }, () => ({
    x: Math.random(),
    y: Math.random(),
    w: 40 + Math.random() * 80,
    h: 20 + Math.random() * 40,
    a: Math.random() * Math.PI,
    alpha: 0.015 + Math.random() * 0.025
  }));

  function frame() {
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    dust.forEach(d => {
      ctx.save();
      ctx.translate(d.x * W, d.y * H);
      ctx.rotate(d.a);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, d.w * 0.5);
      g.addColorStop(0, `rgba(201,168,76,${d.alpha})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.ellipse(0, 0, d.w, d.h, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    stars.forEach(s => {
      const pulse = 0.4 + 0.6 * Math.abs(Math.sin(angle * 1.8 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r * pulse, 0, Math.PI * 2);
      const c = s.gold ? `rgba(232,201,107,${0.25 + 0.6 * pulse})` : `rgba(248,244,238,${0.15 + 0.4 * pulse})`;
      ctx.fillStyle = c;
      ctx.fill();
    });

    drawRoseCurve(canvas, {
      k: 5, maxR: Math.min(W, H) * 0.22,
      color: 'rgba(201,168,76,0.06)',
      strokeWidth: 1,
      rotation: angle * 0.35,
      fill: true,
      fillColor: 'rgba(201,168,76,0.015)'
    });

    angle += 0.01;
    raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
  };
}

export {
  drawRoseCurve,
  animatePreloaderRose,
  animateBackgroundRose,
  drawRewardRoses,
  drawMandala,
  spawnHearts,
  spawnPetals,
  spawnRewardPetals,
  launchSuccessOverlay,
  initGalaxyCanvas
};