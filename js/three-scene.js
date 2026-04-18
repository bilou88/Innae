/* ═══════════════════════════════════════════════════════════════
   VIRIDIS · three-scene.js
   Scène Three.js pour le hero (briques LEGO qui tombent)
   et le cube 3D interactif des façades
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  if (!window.THREE) { console.warn('THREE.js non chargé.'); return; }

  // ═══════════════════════════════════════════════════════════════
  // PARTIE 1 — SCÈNE HERO (fond cinématique)
  // ═══════════════════════════════════════════════════════════════

  const heroCanvas = document.getElementById('heroCanvas');
  if (heroCanvas) initHeroScene(heroCanvas);

  function initHeroScene(canvas) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a14, 12, 40);

    const camera = new THREE.PerspectiveCamera(
      55,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 2, 14);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setClearColor(0x000000, 0);

    // ——— Lumières ———
    const ambient = new THREE.AmbientLight(0x9B59D0, 0.35);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x3DCB6C, 1.5, 20);
    rimLight.position.set(-5, 3, 3);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x6B2D9F, 1.2, 20);
    fillLight.position.set(6, -2, 4);
    scene.add(fillLight);

    // ——— Générateur de briques LEGO (procédural) ———
    function makeBrick(w = 1, d = 0.5, studs = true, color = 0x6B2D9F) {
      const group = new THREE.Group();
      const h = 0.35;
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshPhongMaterial({
        color,
        shininess: 60,
        specular: 0x222244
      });
      const body = new THREE.Mesh(geo, mat);
      group.add(body);

      if (studs) {
        const studsX = Math.round(w / 0.5);
        const studsZ = Math.round(d / 0.5);
        const studGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
        for (let i = 0; i < studsX; i++) {
          for (let j = 0; j < studsZ; j++) {
            const stud = new THREE.Mesh(studGeo, mat);
            stud.position.set(
              -w / 2 + 0.25 + i * 0.5,
              h / 2 + 0.05,
              -d / 2 + 0.25 + j * 0.5
            );
            group.add(stud);
          }
        }
      }
      return group;
    }

    // ——— Créer plusieurs briques qui flottent/tournent ———
    const bricks = [];
    const palette = [
      0x6B2D9F, 0x9B59D0, 0x3D1660, 0x3DCB6C, 0xC9A84C,
      0x6B2D9F, 0x9B59D0, 0xFF7BAE, 0x4FB8FF
    ];

    const count = window.innerWidth < 720 ? 18 : 36;
    for (let i = 0; i < count; i++) {
      const w = [0.5, 1, 1, 1.5, 2][Math.floor(Math.random() * 5)];
      const d = [0.5, 0.5, 1][Math.floor(Math.random() * 3)];
      const color = palette[Math.floor(Math.random() * palette.length)];
      const brick = makeBrick(w, d, true, color);

      brick.position.set(
        (Math.random() - 0.5) * 20,
        20 + Math.random() * 10,
        (Math.random() - 0.5) * 10 - 3
      );
      brick.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      brick.userData = {
        vy: -(0.01 + Math.random() * 0.02),
        vr: (Math.random() - 0.5) * 0.015,
        targetY: (Math.random() - 0.5) * 6,
        bobOffset: Math.random() * Math.PI * 2,
        bobSpeed: 0.6 + Math.random() * 0.4,
        bobAmp: 0.15 + Math.random() * 0.25
      };

      scene.add(brick);
      bricks.push(brick);
    }

    // Sol invisible avec reflets subtils
    const groundGeo = new THREE.PlaneGeometry(40, 40);
    const groundMat = new THREE.MeshPhongMaterial({
      color: 0x3D1660,
      transparent: true,
      opacity: 0.15,
      shininess: 120
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -4;
    scene.add(ground);

    // Mouse parallax
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener('pointermove', (e) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Resize
    function resize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    window.addEventListener('resize', resize);

    // Animation
    const clock = new THREE.Clock();
    let settled = false;
    let settleTimer = 0;

    function animate() {
      const dt = clock.getDelta();
      const t = clock.getElapsedTime();
      settleTimer += dt;

      // Au bout de ~2s la chute se stabilise et les briques flottent
      if (!settled && settleTimer > 2.2) settled = true;

      bricks.forEach((b, i) => {
        if (!settled) {
          // Chute
          b.position.y += b.userData.vy * 60 * dt;
          b.userData.vy -= 0.0008;
          if (b.position.y < b.userData.targetY) {
            b.position.y = b.userData.targetY;
            b.userData.vy = -b.userData.vy * 0.3;
            if (Math.abs(b.userData.vy) < 0.005) b.userData.vy = 0;
          }
          b.rotation.x += b.userData.vr * 60 * dt;
          b.rotation.y += b.userData.vr * 0.7 * 60 * dt;
        } else {
          // Flottement
          b.position.y = b.userData.targetY + Math.sin(t * b.userData.bobSpeed + b.userData.bobOffset) * b.userData.bobAmp;
          b.rotation.x += 0.003;
          b.rotation.y += 0.002;
        }
      });

      // Parallax caméra
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      camera.position.x = mouse.x * 1.5;
      camera.position.y = 2 - mouse.y * 0.8;
      camera.lookAt(0, 1, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    resize();
    animate();
  }

  // ═══════════════════════════════════════════════════════════════
  // PARTIE 2 — CUBE 3D INTERACTIF (tour des façades)
  // ═══════════════════════════════════════════════════════════════

  const tourCanvas = document.getElementById('tour3dCanvas');
  if (tourCanvas) initTourScene(tourCanvas);

  function initTourScene(canvas) {
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 2, 8);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setClearColor(0x000000, 0);

    // ——— Lumières ———
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 8, 5);
    scene.add(dir);
    const p1 = new THREE.PointLight(0x9B59D0, 1.5, 15);
    p1.position.set(-4, 3, 2);
    scene.add(p1);
    const p2 = new THREE.PointLight(0x3DCB6C, 1.2, 15);
    p2.position.set(4, -2, 3);
    scene.add(p2);

    // ——— Chargement des textures des façades ———
    const loader = new THREE.TextureLoader();
    const facadeFiles = {
      sud: 'assets/images/facade-sud.jpg',
      nord: 'assets/images/facade-nord.jpg',
      est: 'assets/images/facade-est.jpg',
      ouest: 'assets/images/facade-ouest.jpg'
    };

    // Texture de secours procédurale (si image manquante)
    function makeFallbackTexture(label, color) {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 512;
      const ctx = c.getContext('2d');
      // Gradient fond
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, color);
      grad.addColorStop(1, '#1A1A2E');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
      // Pattern studs
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let y = 20; y < 512; y += 40) {
        for (let x = 20; x < 512; x += 40) {
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Label
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 72px "Bebas Neue", Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 256, 240);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'italic 24px Georgia';
      ctx.fillText('FAÇADE', 256, 300);

      const tx = new THREE.CanvasTexture(c);
      tx.needsUpdate = true;
      return tx;
    }

    function loadOrFallback(file, label, color) {
      return new Promise((resolve) => {
        loader.load(
          file,
          (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace || THREE.LinearSRGBColorSpace;
            resolve(tex);
          },
          undefined,
          () => resolve(makeFallbackTexture(label, color))
        );
      });
    }

    const FALLBACK_COLORS = {
      sud: '#E0862C',
      nord: '#6B2D9F',
      est: '#3DCB6C',
      ouest: '#4FB8FF'
    };

    Promise.all([
      loadOrFallback(facadeFiles.sud, 'SUD', FALLBACK_COLORS.sud),
      loadOrFallback(facadeFiles.nord, 'NORD', FALLBACK_COLORS.nord),
      loadOrFallback(facadeFiles.est, 'EST', FALLBACK_COLORS.est),
      loadOrFallback(facadeFiles.ouest, 'OUEST', FALLBACK_COLORS.ouest)
    ]).then(([sud, nord, est, ouest]) => {

      // Ordre BoxGeometry : +X, -X, +Y (top), -Y (bottom), +Z, -Z
      const topTex = makeRoofTexture();
      const bottomTex = makeBaseTexture();

      const materials = [
        new THREE.MeshPhongMaterial({ map: est, shininess: 30 }),   // +X = Est
        new THREE.MeshPhongMaterial({ map: ouest, shininess: 30 }), // -X = Ouest
        new THREE.MeshPhongMaterial({ map: topTex, shininess: 20 }),
        new THREE.MeshPhongMaterial({ map: bottomTex, shininess: 20 }),
        new THREE.MeshPhongMaterial({ map: sud, shininess: 30 }),   // +Z = Sud
        new THREE.MeshPhongMaterial({ map: nord, shininess: 30 })   // -Z = Nord
      ];

      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(4, 3, 4),
        materials
      );
      cube.position.y = 0;
      scene.add(cube);

      // ——— Studs LEGO sur le toit ———
      const studGroup = new THREE.Group();
      studGroup.position.y = 1.55;
      const studMat = new THREE.MeshPhongMaterial({ color: 0x3DCB6C, shininess: 80 });
      const studGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 16);
      for (let x = -1.5; x <= 1.5; x += 0.5) {
        for (let z = -1.5; z <= 1.5; z += 0.5) {
          const s = new THREE.Mesh(studGeo, studMat);
          s.position.set(x, 0, z);
          studGroup.add(s);
        }
      }
      scene.add(studGroup);

      // ——— Hotspots 3D ———
      const hotspotsData = [
        { pos: [0, 0.8, 2.05], face: 'sud', title: 'Entrée principale', text: 'Façade chaleureuse aux tons orangés et signalétique Viridis.' },
        { pos: [0, 1.55, 0], face: 'top', title: 'Toit-jardin', text: 'Toits asymétriques végétalisés qui captent la lumière.' },
        { pos: [2.05, 0.3, 0], face: 'est', title: 'Station vélo', text: 'Mobilité douce, bornes de recharge, loi mobilités.' },
        { pos: [-2.05, 0.3, 0], face: 'ouest', title: 'Parking 1-2-3', text: 'Stationnement résidents et accès agence du Pontet.' },
        { pos: [0, 0.5, -2.05], face: 'nord', title: 'Toits colorés', text: 'Puits de lumière et captation solaire optimisée.' }
      ];

      const hotspotMeshes = [];
      const hotspotMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
      const hotspotGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const glowGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xFFD700, transparent: true, opacity: 0.3
      });

      hotspotsData.forEach((h) => {
        const sphere = new THREE.Mesh(hotspotGeo, hotspotMat);
        sphere.position.fromArray(h.pos);
        sphere.userData = h;
        scene.add(sphere);
        hotspotMeshes.push(sphere);

        const glow = new THREE.Mesh(glowGeo, glowMat.clone());
        glow.position.fromArray(h.pos);
        glow.userData.parent = sphere;
        scene.add(glow);
      });

      // ——— Controls maison (orbit simplifié) ———
      const ctrl = {
        rotX: 0.2, rotY: -0.4,
        targetRotX: 0.2, targetRotY: -0.4,
        distance: 8, targetDistance: 8,
        minDist: 5, maxDist: 14,
        isDragging: false,
        lastX: 0, lastY: 0
      };

      canvas.addEventListener('pointerdown', (e) => {
        ctrl.isDragging = true;
        ctrl.lastX = e.clientX;
        ctrl.lastY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
      });
      canvas.addEventListener('pointerup', (e) => {
        ctrl.isDragging = false;
        try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
      });
      canvas.addEventListener('pointermove', (e) => {
        if (ctrl.isDragging) {
          const dx = e.clientX - ctrl.lastX;
          const dy = e.clientY - ctrl.lastY;
          ctrl.targetRotY -= dx * 0.008;
          ctrl.targetRotX -= dy * 0.008;
          ctrl.targetRotX = Math.max(-1.0, Math.min(1.0, ctrl.targetRotX));
          ctrl.lastX = e.clientX;
          ctrl.lastY = e.clientY;
        }
      });
      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        ctrl.targetDistance += e.deltaY * 0.005;
        ctrl.targetDistance = Math.max(ctrl.minDist, Math.min(ctrl.maxDist, ctrl.targetDistance));
      }, { passive: false });

      // ——— Boutons d'orientation ———
      const orientations = {
        sud:    { rotX: 0,    rotY: 0 },
        nord:   { rotX: 0,    rotY: Math.PI },
        est:    { rotX: 0,    rotY: -Math.PI / 2 },
        ouest:  { rotX: 0,    rotY: Math.PI / 2 },
        reset:  { rotX: 0.2,  rotY: -0.4 }
      };

      document.querySelectorAll('.t3d-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const o = btn.dataset.orient;
          if (orientations[o]) {
            ctrl.targetRotX = orientations[o].rotX;
            ctrl.targetRotY = orientations[o].rotY;
            ctrl.targetDistance = 8;
            document.querySelectorAll('.t3d-btn').forEach(b => b.classList.remove('active'));
            if (o !== 'reset') btn.classList.add('active');
          }
        });
      });

      // ——— Raycasting pour les hotspots ———
      const raycaster = new THREE.Raycaster();
      const mouseV = new THREE.Vector2();
      const tooltip = document.getElementById('tour3dTooltip');
      const tooltipTitle = document.getElementById('tour3dTooltipTitle');
      const tooltipText = document.getElementById('tour3dTooltipText');

      canvas.addEventListener('pointermove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseV.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseV.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      });

      canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseV.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseV.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouseV, camera);
        const hits = raycaster.intersectObjects(hotspotMeshes);
        if (hits.length > 0) {
          const hs = hits[0].object.userData;
          tooltipTitle.textContent = hs.title;
          tooltipText.textContent = hs.text;
          tooltip.style.left = (e.clientX - rect.left) + 'px';
          tooltip.style.top = (e.clientY - rect.top) + 'px';
          tooltip.classList.add('visible');
          clearTimeout(tooltip._timer);
          tooltip._timer = setTimeout(() => tooltip.classList.remove('visible'), 4500);
        } else {
          tooltip.classList.remove('visible');
        }
      });

      // ——— Resize ———
      function resize() {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      }
      window.addEventListener('resize', resize);
      resize();

      // ——— Boucle de rendu ———
      const clock = new THREE.Clock();
      function loop() {
        const t = clock.getElapsedTime();

        // Interpolation douce
        ctrl.rotX += (ctrl.targetRotX - ctrl.rotX) * 0.08;
        ctrl.rotY += (ctrl.targetRotY - ctrl.rotY) * 0.08;
        ctrl.distance += (ctrl.targetDistance - ctrl.distance) * 0.08;

        // Rotation auto très légère si pas en drag
        if (!ctrl.isDragging) {
          ctrl.targetRotY += 0.0015;
        }

        // Positionner la caméra
        const cx = ctrl.distance * Math.sin(ctrl.rotY) * Math.cos(ctrl.rotX);
        const cy = ctrl.distance * Math.sin(ctrl.rotX);
        const cz = ctrl.distance * Math.cos(ctrl.rotY) * Math.cos(ctrl.rotX);
        camera.position.set(cx, cy, cz);
        camera.lookAt(0, 0, 0);

        // Pulse des hotspots
        hotspotMeshes.forEach((hs, i) => {
          const scale = 1 + Math.sin(t * 2 + i) * 0.15;
          hs.scale.setScalar(scale);
        });

        // Studs subtiles
        studGroup.children.forEach((s, i) => {
          s.position.y = Math.sin(t * 1.5 + i * 0.3) * 0.02;
        });

        renderer.render(scene, camera);
        requestAnimationFrame(loop);
      }
      loop();
    });

    // Textures procédurales
    function makeRoofTexture() {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 256;
      const ctx = c.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 256, 256);
      grad.addColorStop(0, '#3DCB6C');
      grad.addColorStop(1, '#1A7A3C');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      for (let y = 15; y < 256; y += 22) {
        for (let x = 15; x < 256; x += 22) {
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      const tx = new THREE.CanvasTexture(c);
      return tx;
    }

    function makeBaseTexture() {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 256;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#AAAABB';
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      for (let y = 15; y < 256; y += 22) {
        for (let x = 15; x < 256; x += 22) {
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      return new THREE.CanvasTexture(c);
    }
  }
})();
