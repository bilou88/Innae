# VIRIDIS · Grand Delta Habitat · 60 ans

> Site web événementiel célébrant la résidence **Viridis** — le projet d'habitat collectif engagé de Grand Delta Habitat, réalisé en maquette LEGO à l'occasion des 60 ans de l'office, par l'agence du Pontet.

*Viridis · du latin · Vert & Flamboyant*

---

## 🎬 Aperçu

Un site single-page immersif, multi-sections, alliant l'univers **LEGO** (briques, studs, couleurs saturées) et un **imaginaire écologique** (particules vertes, végétation, organicité). Dix sections cinématiques, avec intro 3D, visite cubique interactive des façades, galerie filtrable, timeline GDH, et particules animées.

---

## 🛠 Stack

- **HTML5 + CSS3** — structure sémantique, CSS custom properties, grids modernes
- **Vanilla JavaScript** — aucune dépendance à un framework
- **Three.js r128** (CDN) — scène hero 3D + cube visite des façades + raycasting hotspots
- **GSAP 3.12 + ScrollTrigger** (CDN) — timeline d'intro, reveals, sticky manifeste
- **Canvas 2D** — système de particules pour la section étymologie
- **Google Fonts** — Bebas Neue, Outfit, Cormorant Garamond Italic

Aucune build step. Simple static hosting.

---

## 📁 Structure

```
viridis-gdh/
├── index.html
├── css/
│   ├── main.css          ← reset, variables, typographie, navbar, CTA
│   ├── animations.css    ← préloader, reveals, glitch, hotspots
│   └── sections.css      ← styles détaillés des 10 sections
├── js/
│   ├── main.js           ← init, scroll, navbar, carrousel, compteurs
│   ├── three-scene.js    ← hero 3D + cube façades interactif
│   ├── gallery.js        ← filtres, lightbox, parallax
│   └── particles.js      ← particules vertes/violettes/or
├── assets/
│   └── images/           ← ← placez ici vos photos de maquette
└── README.md
```

---

## 📸 Photos à placer

Déposez vos photos de la maquette LEGO dans `assets/images/` avec ces noms exacts (le site les référence automatiquement) :

### Façades (visite 3D — section 5)
| Fichier | Contenu suggéré |
|---|---|
| `facade-sud.jpg` | Façade principale avec logo VIRIDIS et badge 60 ans |
| `facade-nord.jpg` | Vue arrière — toits asymétriques colorés, station vélo |
| `facade-est.jpg` | Vue latérale — parvis, stationnement, mobilité douce |
| `facade-ouest.jpg` | Vue latérale opposée — station météo, végétation |

### Galerie (section 7)
| Fichier | Suggestion |
|---|---|
| `photo-lego-1.jpg` | Vue d'ensemble de la maquette |
| `photo-lego-2.jpg` | Détail des toits asymétriques |
| `photo-lego-3.jpg` | Vue aérienne toiture végétale |
| `photo-lego-4.jpg` | Façade « Le Pontet » + parking numéroté |
| `photo-lego-5.jpg` | Panneau « Le Grand Chantier » |
| `photo-lego-6.jpg` | Vue frontale jour, ambiance |

**Format recommandé** : JPG, 1600×1200 minimum, compressées (< 500 Ko chacune).
Tous les `<img>` ont un `onerror` → si un fichier manque, un **placeholder stylé** (brique LEGO violette avec motif de studs + label) s'affiche automatiquement.

---

## 🚀 Déploiement GitHub Pages

```bash
# 1. Créer un repo et y déposer le dossier
git init
git add .
git commit -m "Viridis · GDH 60 ans"
git branch -M main
git remote add origin https://github.com/VOTRE-USER/viridis-gdh.git
git push -u origin main

# 2. Sur github.com → Settings → Pages
#    Source : "Deploy from a branch"
#    Branch : main · /root · Save
#    → Le site est en ligne sous quelques minutes
```

Tous les chemins sont **relatifs** — aucune modification nécessaire pour GitHub Pages. Compatible aussi avec Netlify, Vercel, Cloudflare Pages, ou tout serveur statique.

### En local (sans serveur)

Certaines fonctionnalités (textures Three.js chargées depuis `/assets/`) requièrent un contexte HTTP. Lancez un serveur local rapide :

```bash
# Python 3
python3 -m http.server 8080
# puis ouvrez http://localhost:8080

# ou Node
npx serve .
```

---

## ⚙️ Personnalisation

### Couleurs
Toutes les couleurs sont des variables CSS dans `css/main.css` (`:root`). Modifiez une seule fois pour propager au site entier.

### Vidéo YouTube
Dans `index.html`, section 2, l'ID de la vidéo est déjà configuré (`rPAeK45YNVI`). Pour changer, remplacer ce string dans l'URL de l'iframe.

### Texte manifeste
Le texte « Je suis Viridis... » est éditable directement dans `index.html`, section `.manifeste`, en 9 blocs `.mb`. L'animation sticky scroll s'adapte automatiquement au nombre de blocs.

### Façades 3D — hotspots
Dans `js/three-scene.js`, chercher le tableau `hotspotData` pour ajouter/modifier les points d'intérêt cliquables sur le cube.

---

## 🎨 Direction artistique

- **Palette** : violet profond (`#3D1660`) → violet principal (`#6B2D9F`) → vert Viridis (`#3DCB6C`) → or 60 ans (`#C9A84C`)
- **Typographie** : Bebas Neue (titres massifs), Outfit (corps), Cormorant Garamond Italic (latin et accents)
- **Motifs récurrents** : studs LEGO en watermark, grain fin, liserés or en pointillés
- **Animations** : intro séquencée hero, reveal lignes du manifeste, flip des façades, compteurs animés, particules scintillantes

---

## ♿ Accessibilité

- Navigation clavier complète (menu, carrousel, lightbox, timeline)
- `prefers-reduced-motion` respecté : les animations lourdes sont désactivées
- `aria-label` / `aria-hidden` sur éléments décoratifs et modaux
- Focus visible personnalisé
- Contrastes AA sur le corps de texte

---

## 📝 Crédits

- **Projet** : résidence Viridis — Grand Delta Habitat
- **Maquette LEGO** : agence du Pontet, Grand Delta Habitat
- **Occasion** : 60 ans de GDH
- **Fonts** : Google Fonts (Bebas Neue, Outfit, Cormorant Garamond)
- **Libs** : Three.js, GSAP

---

© 2024 · Grand Delta Habitat · Résidence Viridis · Agence du Pontet
# Innae
