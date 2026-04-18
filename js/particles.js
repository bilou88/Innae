/* ═══════════════════════════════════════════════════════════════
   VIRIDIS · particles.js
   Système de particules 2D pour la section Étymologie.
   Particules vertes, violettes et dorées qui flottent doucement,
   avec lignes de connexion subtiles quand elles se rapprochent.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── Configuration ───
  const COLORS = [
    { r:  61, g: 203, b: 108 }, // green-viridis
    { r: 155, g:  89, b: 208 }, // violet-light
    { r: 201, g: 168, b:  76 }, // gold-60
    { r:  26, g: 122, b:  60 }  // green-dark
  ];
  const COUNT_BASE = prefersReduced ? 30 : 70;
  let width = 0, height = 0, dpr = 1;
  let particles = [];
  let mx = -9999, my = -9999;
  let running = true;

  // ─── Resize (haute densité) ───
  function resize () {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.floor(width  * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ─── Init particules ───
  function init () {
    resize();
    const area = width * height;
    const count = Math.round(COUNT_BASE * Math.min(1.6, Math.max(0.6, area / (1200 * 600))));
    particles = [];
    for (let i = 0; i < count; i++) {
      const col = COLORS[Math.floor(Math.random() * COLORS.length)];
      particles.push({
        x:  Math.random() * width,
        y:  Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.1 - Math.random() * 0.45, // tend vers le haut
        r:  0.8 + Math.random() * 2.6,
        a:  0.25 + Math.random() * 0.5,
        col,
        tw: Math.random() * Math.PI * 2 // phase scintillement
      });
    }
  }

  // ─── Boucle de rendu ───
  let lastT = 0;
  function frame (t) {
    if (!running) return;
    const dt = Math.min(32, t - lastT) / 16.67 || 1;
    lastT = t;

    ctx.clearRect(0, 0, width, height);

    // Lignes de connexion discrètes
    ctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 10000) { // 100px
          const d = Math.sqrt(d2);
          const o = (1 - d / 100) * 0.12;
          // couleur moyenne des deux
          const r = (p.col.r + q.col.r) / 2 | 0;
          const g = (p.col.g + q.col.g) / 2 | 0;
          const b = (p.col.b + q.col.b) / 2 | 0;
          ctx.strokeStyle = `rgba(${r},${g},${b},${o.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }

    // Particules
    for (const p of particles) {
      // drift + répulsion légère de la souris
      const ddx = p.x - mx, ddy = p.y - my;
      const md2 = ddx * ddx + ddy * ddy;
      if (md2 < 14000) {
        const f = (1 - md2 / 14000) * 0.5;
        const d = Math.sqrt(md2) || 1;
        p.vx += (ddx / d) * f * 0.25;
        p.vy += (ddy / d) * f * 0.25;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.tw += 0.04 * dt;

      // amortissement pour éviter l'emballement
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 - 0.0025; // rappel doux vers le haut

      // wrap
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
      if (p.y > height + 20) p.y = -10;

      const tw = 0.85 + Math.sin(p.tw) * 0.15;
      const alpha = p.a * tw;
      const { r, g, b } = p.col;

      // halo
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
      grd.addColorStop(0,   `rgba(${r},${g},${b},${alpha.toFixed(3)})`);
      grd.addColorStop(0.4, `rgba(${r},${g},${b},${(alpha * 0.35).toFixed(3)})`);
      grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
      ctx.fill();

      // coeur
      ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(1, alpha * 2).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }

  // ─── Events ───
  window.addEventListener('resize', () => { init(); });
  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  });
  canvas.addEventListener('pointerleave', () => { mx = -9999; my = -9999; });

  // Pause quand la section sort du viewport (performance)
  const section = canvas.closest('section');
  if (section && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !running) {
          running = true;
          lastT = 0;
          requestAnimationFrame(frame);
        } else if (!e.isIntersecting) {
          running = false;
        }
      });
    }, { threshold: 0.05 });
    io.observe(section);
  }

  init();
  requestAnimationFrame(frame);
})();
