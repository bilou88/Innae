/* ═══════════════════════════════════════════════════════════════
   VIRIDIS · gallery.js
   Filtres catégories + lightbox clavier + parallax au scroll.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const grid   = $('#galerieGrid');
  const items  = $$('.gal-item', grid || document);
  const filters = $$('.gf-btn');

  if (!grid || !items.length) return;

  /* ─────────────────────────────────────────────────────────────
     1 · Filtres catégories
     ───────────────────────────────────────────────────────────── */
  function applyFilter (cat) {
    items.forEach(item => {
      const cats = (item.dataset.cat || '').split(/\s+/);
      const match = cat === 'all' || cats.includes(cat);
      if (match) {
        item.classList.remove('hidden');
        item.style.display = '';
      } else {
        item.classList.add('hidden');
        // délai pour que la transition s'effectue avant display:none
        setTimeout(() => {
          if (item.classList.contains('hidden')) item.style.display = 'none';
        }, 380);
      }
    });
  }

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter || 'all';
      applyFilter(cat);
    });
  });

  /* ─────────────────────────────────────────────────────────────
     2 · Lightbox
     ───────────────────────────────────────────────────────────── */
  const lb       = $('#lightbox');
  const lbImg    = $('#lbImg');
  const lbCap    = $('#lbCaption');
  const lbClose  = $('.lb-close', lb || document);
  const lbPrev   = $('.lb-prev', lb || document);
  const lbNext   = $('.lb-next', lb || document);

  let current = 0;
  let activeItems = items;

  function refreshActive () {
    activeItems = items.filter(it => !it.classList.contains('hidden'));
  }

  function openLightbox (index) {
    refreshActive();
    if (!activeItems.length || !lb) return;
    current = (index + activeItems.length) % activeItems.length;
    const item = activeItems[current];
    const img = item.querySelector('img');
    const caption = item.querySelector('figcaption');

    if (img && lbImg) {
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || '';
    }
    if (lbCap) {
      lbCap.textContent = caption ? caption.textContent.trim() : (img?.alt || '');
    }
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function closeLightbox () {
    if (!lb) return;
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    // reset après transition
    setTimeout(() => { if (lbImg) lbImg.src = ''; }, 300);
  }

  function nav (dir) {
    refreshActive();
    if (!activeItems.length) return;
    openLightbox(current + dir);
  }

  items.forEach((item, i) => {
    item.addEventListener('click', () => {
      // si un lien natif, laisser (aucun ici)
      refreshActive();
      const visibleIndex = activeItems.indexOf(item);
      openLightbox(visibleIndex >= 0 ? visibleIndex : 0);
    });
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });

  lbClose?.addEventListener('click', closeLightbox);
  lbPrev?.addEventListener('click', () => nav(-1));
  lbNext?.addEventListener('click', () => nav(+1));
  lb?.addEventListener('click', e => {
    if (e.target === lb || e.target.classList.contains('lb-backdrop')) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!lb?.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') nav(+1);
    if (e.key === 'ArrowLeft')  nav(-1);
  });

  /* ─────────────────────────────────────────────────────────────
     3 · Parallax subtil au scroll
     ───────────────────────────────────────────────────────────── */
  if (!prefersReduced) {
    let ticking = false;
    const rects = new Map();

    function measure () {
      items.forEach(it => {
        const r = it.getBoundingClientRect();
        rects.set(it, { top: r.top + window.scrollY, h: r.height });
      });
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);

    function update () {
      const vh = window.innerHeight;
      const scroll = window.scrollY;
      items.forEach((it, i) => {
        if (it.classList.contains('hidden')) return;
        const data = rects.get(it); if (!data) return;
        const center = data.top + data.h / 2;
        const dist = (center - scroll - vh / 2) / vh;
        // chaque item : valeur parallax max ±12px, direction alternée
        const offset = dist * 14 * (i % 2 === 0 ? 1 : -1);
        const img = it.querySelector('img, .photo-missing');
        if (img) img.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0) scale(1.05)`;
      });
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }
})();
