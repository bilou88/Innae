/* ═══════════════════════════════════════════════════════════════
   VIRIDIS · main.js
   Orchestration : préloader, navbar, scroll, carousel, compteurs,
   manifeste sticky, timeline, reveals GSAP ScrollTrigger.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     0 · Utilitaires
     ───────────────────────────────────────────────────────────── */
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp  = (a, b, t) => a + (b - a) * t;
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hasGSAP = !!window.gsap;
  const hasST   = hasGSAP && !!window.ScrollTrigger;
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  /* ─────────────────────────────────────────────────────────────
     1 · Préloader
     ───────────────────────────────────────────────────────────── */
  const preloader = $('#preloader');
  function hidePreloader () {
    if (!preloader) return;
    preloader.classList.add('hidden');
    setTimeout(() => preloader.remove(), 900);
  }
  if (document.readyState === 'complete') {
    setTimeout(hidePreloader, 600);
  } else {
    window.addEventListener('load', () => setTimeout(hidePreloader, 400));
    // Failsafe — après 4s on cache de toute façon
    setTimeout(hidePreloader, 4000);
  }

  /* ─────────────────────────────────────────────────────────────
     2 · Navbar : scroll state + burger mobile + smooth anchors
     ───────────────────────────────────────────────────────────── */
  const navbar   = $('#navbar');
  const navLinks = $('#navLinks');
  const burger   = $('#navBurger');

  const onScrollNav = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      burger.classList.toggle('active', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('no-scroll', open);
    });
  }

  // Smooth anchor + fermeture menu mobile
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
      if (navLinks?.classList.contains('open')) {
        navLinks.classList.remove('open');
        burger?.classList.remove('active');
        burger?.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
      }
    });
  });

  /* ─────────────────────────────────────────────────────────────
     3 · Reveals génériques (.reveal-up / .reveal-fade / .reveal-scale)
     ───────────────────────────────────────────────────────────── */
  const revealEls = $$('.reveal-up, .reveal-fade, .reveal-scale');
  if (revealEls.length) {
    if (prefersReduced) {
      revealEls.forEach(el => el.classList.add('in'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach(el => io.observe(el));
    }
  }

  /* ─────────────────────────────────────────────────────────────
     4 · Hero : intro séquencée (letters + méta)
     ───────────────────────────────────────────────────────────── */
  const heroTitleLetters = $$('.hero-title .l');
  if (heroTitleLetters.length && !prefersReduced && hasGSAP) {
    gsap.set(heroTitleLetters, { y: 120, opacity: 0, rotateX: -60 });
    gsap.to(heroTitleLetters, {
      y: 0, opacity: 1, rotateX: 0,
      duration: 1.1, ease: 'expo.out',
      stagger: 0.08, delay: 0.9
    });
    const heroMetaEls = $$('.hero-badge, .hero-subtitle, .hero-lead, .hero-ctas, .hero-scroll');
    gsap.from(heroMetaEls, {
      y: 40, opacity: 0, duration: 0.9, ease: 'power3.out',
      stagger: 0.12, delay: 1.9
    });
  }

  /* ─────────────────────────────────────────────────────────────
     5 · Trailer : rideau qui s'ouvre + glitch titre au scroll
     ───────────────────────────────────────────────────────────── */
  const trailerStage = $('.trailer-stage');
  const trailerTitle = $('.trailer-title');
  if (trailerStage) {
    if (hasST && !prefersReduced) {
      ScrollTrigger.create({
        trigger: '.trailer',
        start: 'top 70%',
        once: true,
        onEnter: () => {
          trailerStage.classList.add('opened');
          trailerTitle?.classList.add('glitch-on');
        }
      });
    } else {
      trailerStage.classList.add('opened');
      trailerTitle?.classList.add('glitch-on');
    }
  }

  /* ─────────────────────────────────────────────────────────────
     6 · Manifeste — sticky scroll, lignes progressives + hotspots
     ───────────────────────────────────────────────────────────── */
  const manifeste = $('.manifeste');
  const mbLines   = $$('.mb');
  const hotspots  = $$('.manifeste .hotspot');

  if (manifeste && mbLines.length) {
    if (prefersReduced || !hasST) {
      mbLines.forEach(l => l.classList.add('active'));
      hotspots.forEach(h => h.classList.add('on'));
    } else {
      ScrollTrigger.create({
        trigger: manifeste,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const p = self.progress; // 0 → 1
          const n = mbLines.length;
          // active jusqu'à l'index atteint
          const reached = clamp(Math.floor(p * n * 1.05), 0, n);
          mbLines.forEach((el, i) => {
            el.classList.toggle('active', i < reached);
          });
          // hotspots : on allume au fil du scroll
          if (hotspots.length) {
            const hreached = clamp(Math.floor(p * hotspots.length * 1.1), 0, hotspots.length);
            hotspots.forEach((h, i) => h.classList.toggle('on', i < hreached));
          }
        }
      });
    }
  }

  /* ─────────────────────────────────────────────────────────────
     7 · Carrousel des façades (section LEGO)
     ───────────────────────────────────────────────────────────── */
  const facadeCarousel = $('#facadeCarousel');
  if (facadeCarousel) {
    const cards = $$('.facade-card', facadeCarousel);
    const dots  = $$('.facade-nav-dots .dot');
    const prev  = $('.facade-nav-btn.prev');
    const next  = $('.facade-nav-btn.next');
    let idx = cards.findIndex(c => c.classList.contains('active'));
    if (idx < 0) idx = 0;

    function setIndex (newIdx) {
      idx = (newIdx + cards.length) % cards.length;
      cards.forEach((c, i) => {
        c.classList.remove('active', 'prev', 'next', 'far');
        if (i === idx) c.classList.add('active');
        else if (i === (idx - 1 + cards.length) % cards.length) c.classList.add('prev');
        else if (i === (idx + 1) % cards.length) c.classList.add('next');
        else c.classList.add('far');
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }
    setIndex(idx);

    prev?.addEventListener('click', () => setIndex(idx - 1));
    next?.addEventListener('click', () => setIndex(idx + 1));
    dots.forEach(d => d.addEventListener('click', () => {
      const n = Number(d.dataset.index);
      if (!Number.isNaN(n)) setIndex(n);
    }));

    // Flip de la carte active au clic
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        // n'interfère pas avec la navigation via dots
        if (e.target.closest('.facade-nav')) return;
        if (card.classList.contains('active')) {
          card.classList.toggle('flipped');
        } else {
          const i = cards.indexOf(card);
          setIndex(i);
        }
      });
    });

    // Clavier
    facadeCarousel.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') setIndex(idx + 1);
      if (e.key === 'ArrowLeft')  setIndex(idx - 1);
    });
  }

  /* ─────────────────────────────────────────────────────────────
     8 · Compteurs animés
     ───────────────────────────────────────────────────────────── */
  const counters = $$('.counter-num[data-target]');
  if (counters.length) {
    const animateCount = (el) => {
      const target = Number(el.dataset.target) || 0;
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();
      const from = 0;
      function tick (t) {
        const p = clamp((t - start) / duration, 0, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(from + (target - from) * eased);
        el.textContent = val + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else {
          el.textContent = target + suffix;
          el.parentElement?.classList.add('counter-done');
        }
      }
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => io.observe(c));
  }

  /* ─────────────────────────────────────────────────────────────
     9 · ADN cartes — reveal stagger au scroll
     ───────────────────────────────────────────────────────────── */
  const adnCards = $$('.adn-card');
  if (adnCards.length) {
    if (prefersReduced) {
      adnCards.forEach(c => c.classList.add('in'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = adnCards.indexOf(e.target);
            setTimeout(() => e.target.classList.add('in'), Math.max(0, idx) * 100);
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.2 });
      adnCards.forEach(c => io.observe(c));
    }
  }

  /* ─────────────────────────────────────────────────────────────
     10 · Timeline GDH — reveals + scroll arrows
     ───────────────────────────────────────────────────────────── */
  const timeline = $('#timeline');
  if (timeline) {
    const steps = $$('.tl-step', timeline);
    if (prefersReduced) {
      steps.forEach(s => s.classList.add('in'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.3 });
      steps.forEach(s => io.observe(s));
    }

    // Drag to scroll horizontal
    let isDown = false, startX = 0, startScroll = 0;
    timeline.addEventListener('mousedown', e => {
      isDown = true; startX = e.pageX; startScroll = timeline.scrollLeft;
      timeline.classList.add('dragging');
    });
    window.addEventListener('mouseup', () => {
      isDown = false; timeline.classList.remove('dragging');
    });
    timeline.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      timeline.scrollLeft = startScroll - (e.pageX - startX) * 1.4;
    });
  }

  /* ─────────────────────────────────────────────────────────────
     11 · Étymologie — reveal lettres
     ───────────────────────────────────────────────────────────── */
  const etymoSection = $('#etymo');
  if (etymoSection) {
    if (prefersReduced || !hasST) {
      etymoSection.classList.add('in');
    } else {
      ScrollTrigger.create({
        trigger: etymoSection,
        start: 'top 60%',
        once: true,
        onEnter: () => etymoSection.classList.add('in')
      });
    }
  }

  /* ─────────────────────────────────────────────────────────────
     12 · Navbar : highlight section courante
     ───────────────────────────────────────────────────────────── */
  const navAnchors = $$('.nav-links a[href^="#"]');
  if (navAnchors.length) {
    const sections = navAnchors
      .map(a => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = '#' + e.target.id;
          navAnchors.forEach(a => {
            a.classList.toggle('current', a.getAttribute('href') === id);
          });
        }
      });
    }, { threshold: 0.45 });
    sections.forEach(s => io.observe(s));
  }

  /* ─────────────────────────────────────────────────────────────
     13 · ScrollTrigger refresh après chargement images
     ───────────────────────────────────────────────────────────── */
  if (hasST) {
    window.addEventListener('load', () => ScrollTrigger.refresh());
    // Images qui chargent tardivement (lazy)
    $$('img').forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────
     14 · Debug — log discret pour confirmer init
     ───────────────────────────────────────────────────────────── */
  console.log('%c VIRIDIS ', 'background:#6B2D9F;color:#3DCB6C;font-weight:bold;padding:2px 6px;border-radius:3px', 'site initialisé · 60 ans GDH');
})();
