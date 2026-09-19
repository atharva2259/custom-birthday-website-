import JSZip from 'jszip';
import { BirthdayEventConfig, GalleryPhoto, ThemeColors } from '../types';
import { COLOR_THEMES } from '../data/defaultData';
import { PHOTO_FILTERS } from '../data/photoFilters';

/**
 * Generates a complete standalone interactive HTML website customized with user inputs.
 * Works out-of-the-box in any browser and can be hosted on GitHub Pages, Vercel, Netlify, etc.
 */
export function generateStandaloneWebsiteHtml(
  config: BirthdayEventConfig,
  photos: GalleryPhoto[],
  theme: ThemeColors
): string {
  const photosJson = JSON.stringify(photos, null, 2);
  const configJson = JSON.stringify(config, null, 2);
  const themeJson = JSON.stringify(theme, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${config.personName}'s ${config.milestoneAge}th Birthday Celebration</title>
  <meta name="description" content="Join us in celebrating ${config.personName}'s ${config.milestoneAge}th birthday on ${config.celebrationDate}. Photos, memories, and occasion details." />
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..700;1,400..700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Canvas Confetti CDN -->
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.min.js"></script>

  <style>
    :root {
      --bg-color: ${theme.bg};
      --text-primary: ${theme.textPrimary};
      --text-secondary: ${theme.textSecondary};
      --accent: ${theme.accent};
      --accent-light: ${theme.accentLight};
      --accent-dark: ${theme.accentDark};
      --border-color: ${theme.border};
      --card-bg: ${theme.cardBg};
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-color);
      color: var(--text-primary);
      font-family: 'Plus Jakarta Sans', sans-serif;
      line-height: 1.6;
      overflow-x: hidden;
    }

    h1, h2, h3, .font-serif {
      font-family: 'Playfair Display', Georgia, serif;
    }

    /* Container */
    .container {
      max-width: 1140px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* Navbar */
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: rgba(250, 248, 245, 0.9);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 100;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--text-primary);
      font-weight: 600;
    }

    .monogram {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--accent);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Playfair Display', serif;
      font-weight: bold;
    }

    .nav-links {
      display: flex;
      gap: 20px;
    }

    .nav-links a {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      transition: color 0.2s;
    }

    .nav-links a:hover {
      color: var(--text-primary);
    }

    /* Hero Section */
    .hero {
      padding: 140px 20px 80px;
      text-align: center;
    }

    .milestone-badge {
      display: inline-block;
      padding: 6px 18px;
      border-radius: 9999px;
      background: #fff;
      border: 1px solid var(--border-color);
      color: var(--accent);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 20px;
    }

    .hero-title {
      font-size: clamp(40px, 8vw, 76px);
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 16px;
      color: var(--text-primary);
    }

    .hero-tagline {
      font-size: clamp(20px, 4vw, 32px);
      font-style: italic;
      color: var(--text-secondary);
      max-width: 680px;
      margin: 0 auto 30px;
    }

    .event-pills {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
      margin-bottom: 40px;
    }

    .event-pill {
      background: #fff;
      border: 1px solid var(--border-color);
      padding: 8px 18px;
      border-radius: 9999px;
      font-size: 14px;
      color: var(--text-primary);
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }

    .cover-card {
      max-width: 820px;
      margin: 0 auto 40px;
      padding: 12px;
      background: #fff;
      border: 1px solid var(--border-color);
      border-radius: 28px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.06);
    }

    .cover-card img {
      width: 100%;
      height: 380px;
      object-fit: cover;
      border-radius: 20px;
      display: block;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 28px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s;
      border: none;
    }

    .btn-primary {
      background: var(--accent);
      color: #fff;
      box-shadow: 0 4px 14px rgba(0,0,0,0.12);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #fff;
      border: 1px solid var(--border-color);
      color: var(--text-primary);
    }

    .btn-secondary:hover {
      background: var(--accent-light);
    }

    /* Countdown */
    .countdown-section {
      padding: 60px 20px;
      text-align: center;
    }

    .countdown-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      max-width: 540px;
      margin: 24px auto;
    }

    .countdown-card {
      background: #fff;
      border: 1px solid var(--border-color);
      padding: 18px 12px;
      border-radius: 20px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }

    .countdown-val {
      font-size: 32px;
      font-family: 'Playfair Display', serif;
      font-weight: 700;
      color: var(--text-primary);
    }

    .countdown-lbl {
      font-size: 11px;
      text-transform: uppercase;
      color: var(--text-secondary);
      letter-spacing: 0.05em;
    }

    /* Cake Cutting */
    .cake-section {
      padding: 80px 20px;
      background: rgba(255, 255, 255, 0.6);
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
      text-align: center;
    }

    .cake-visual {
      display: inline-block;
      cursor: pointer;
      margin: 30px auto;
      transition: transform 0.2s;
    }

    .cake-visual:hover {
      transform: scale(1.04);
    }

    .cake-svg-wrapper {
      position: relative;
      width: 220px;
      height: 220px;
      margin: 0 auto;
    }

    /* Photos Section */
    .gallery-section {
      padding: 80px 20px;
    }

    .section-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .section-title {
      font-size: 36px;
      margin-bottom: 10px;
    }

    .filters-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      margin-bottom: 30px;
    }

    .filter-btn {
      padding: 8px 18px;
      border-radius: 9999px;
      border: 1px solid var(--border-color);
      background: #fff;
      font-size: 12px;
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.2s;
    }

    .filter-btn.active {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
    }

    .photos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 24px;
    }

    .photo-card {
      background: #fff;
      border: 1px solid var(--border-color);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      transition: transform 0.3s;
    }

    .photo-card:hover {
      transform: translateY(-4px);
    }

    .photo-card img {
      width: 100%;
      height: 260px;
      object-fit: cover;
      display: block;
      transition: filter 0.3s;
    }

    .photo-info {
      padding: 16px;
    }

    .photo-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .photo-caption {
      font-size: 12px;
      color: var(--text-secondary);
    }

    /* Floating Poppable Balloons */
    .balloon-layer {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 90;
      overflow: hidden;
    }

    .balloon {
      position: absolute;
      bottom: -120px;
      width: 60px;
      height: 75px;
      border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
      cursor: pointer;
      pointer-events: auto;
      animation: rise 10s linear infinite;
      box-shadow: inset -4px -6px 12px rgba(0,0,0,0.1), 0 6px 12px rgba(0,0,0,0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: rgba(255,255,255,0.7);
      user-select: none;
    }

    .balloon::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      height: 40px;
      background: rgba(140, 123, 107, 0.4);
    }

    @keyframes rise {
      0% { transform: translateY(0) rotate(0deg); opacity: 0; }
      10% { opacity: 0.9; }
      90% { opacity: 0.9; }
      100% { transform: translateY(-115vh) rotate(15deg); opacity: 0; }
    }

    /* Footer */
    footer {
      padding: 50px 20px;
      text-align: center;
      border-top: 1px solid var(--border-color);
      color: var(--text-secondary);
      font-size: 13px;
    }

    /* Sparkler Canvas & Widget */
    #sparkler-canvas {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 999;
      width: 100vw;
      height: 100vh;
    }

    .sparkler-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 18px;
      border-radius: 9999px;
      background: #FFFFFF;
      color: #2D2A26;
      border: 1px solid var(--border-color);
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
      user-select: none;
    }

    .sparkler-btn.active {
      background: var(--accent);
      color: #FFFFFF;
      box-shadow: 0 0 16px rgba(180, 140, 100, 0.45);
    }

    @media (max-width: 640px) {
      .countdown-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .nav-links {
        display: none;
      }
    }
  </style>
</head>
<body>
  <!-- Virtual Sparkler Canvas -->
  <canvas id="sparkler-canvas"></canvas>

  <!-- Virtual Sparkler Toggle Button -->
  <button id="sparkler-toggle-btn" class="sparkler-btn" onclick="toggleSparkler()">
    <span>✨ Sparkler</span>
  </button>
  <!-- Navigation -->
  <nav class="navbar">
    <a href="#" class="brand">
      <div class="monogram">${config.personName.charAt(0)}</div>
      <span>${config.personName}</span>
    </a>
    <div class="nav-links">
      <a href="#event-details">Details</a>
      <a href="#cake-cutting">Cut Cake</a>
      <a href="#photo-memories">Memories</a>
    </div>
  </nav>

  <!-- Hero Header -->
  <header class="hero container">
    <div class="milestone-badge">A Celebration of Life • The ${config.milestoneAge}th Milestone</div>
    <h1 class="hero-title">${config.personName}</h1>
    <p class="hero-tagline">“Celebrating ${config.milestoneAge} years of grace, laughter, and light.”</p>
    
    <div class="event-pills">
      <div class="event-pill">📅 ${new Date(config.celebrationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
      <div class="event-pill">📍 ${config.locationName}</div>
      <div class="event-pill">✨ ${config.dressCode}</div>
    </div>

    <div class="cover-card">
      <img src="${config.coverPhotoUrl}" alt="${config.personName}" />
    </div>

    <div>
      <button class="btn btn-primary" onclick="cutCake()">Cut the Birthday Cake 🍰</button>
      <a href="#photo-memories" class="btn btn-secondary">Explore Memories</a>
    </div>
  </header>

  <!-- Event Details & Countdown -->
  <section id="event-details" class="countdown-section container">
    <h2 class="section-title">The Occasion Awaits</h2>
    <p style="color: var(--text-secondary); font-size: 14px;">Gathering at ${config.locationAddress}</p>
    
    <div class="countdown-grid">
      <div class="countdown-card">
        <div class="countdown-val" id="days">00</div>
        <div class="countdown-lbl">Days</div>
      </div>
      <div class="countdown-card">
        <div class="countdown-val" id="hours">00</div>
        <div class="countdown-lbl">Hours</div>
      </div>
      <div class="countdown-card">
        <div class="countdown-val" id="minutes">00</div>
        <div class="countdown-lbl">Minutes</div>
      </div>
      <div class="countdown-card">
        <div class="countdown-val" id="seconds">00</div>
        <div class="countdown-lbl">Seconds</div>
      </div>
    </div>
  </section>

  <!-- Interactive Cake Cutting -->
  <section id="cake-cutting" class="cake-section">
    <div class="container">
      <h2 class="section-title">Cut the Birthday Cake</h2>
      <p style="color: var(--text-secondary);">Click the cake to slice it, trigger confetti, and float celebratory balloons!</p>

      <div class="cake-visual" onclick="cutCake()" title="Click to cut the cake!">
        <div style="font-size: 96px; line-height: 1;">🎂</div>
        <div style="font-size: 14px; color: var(--accent); margin-top: 10px; font-weight: 500;">✨ Tap to Cut & Celebrate ✨</div>
      </div>

      <div id="cake-status" style="font-family: 'Playfair Display', serif; font-size: 20px; font-style: italic; color: var(--text-primary); margin-top: 12px;">
        Make a wish before the slice!
      </div>
    </div>
  </section>

  <!-- Photo Memories & Aesthetic Filters -->
  <section id="photo-memories" class="gallery-section container">
    <div class="section-header">
      <h2 class="section-title">Photo Memories Archive</h2>
      <p style="color: var(--text-secondary);">A curated lookbook of adventures and lifelong moments.</p>
    </div>

    <!-- Aesthetic Filter Selector -->
    <div class="filters-bar">
      <button class="filter-btn active" onclick="applyFilter('none', this)">Original</button>
      <button class="filter-btn" onclick="applyFilter('warm', this)">✨ Warm Glow</button>
      <button class="filter-btn" onclick="applyFilter('sepia', this)">🎞️ Vintage Sepia</button>
      <button class="filter-btn" onclick="applyFilter('noir', this)">⚪ Classic Noir</button>
      <button class="filter-btn" onclick="applyFilter('film', this)">📷 Matte Film</button>
    </div>

    <div class="photos-grid" id="photos-container">
      <!-- Photos injected via JavaScript -->
    </div>
  </section>

  <!-- Floating Balloon Overlay -->
  <div class="balloon-layer" id="balloon-layer"></div>

  <!-- Footer -->
  <footer>
    <p>Crafted with love for <strong>${config.personName}</strong>'s ${config.milestoneAge}th Birthday.</p>
    <p style="margin-top: 6px; font-size: 11px; opacity: 0.8;">Customized Source Code Package • Licensed Version</p>
  </footer>

  <script>
    // Configuration Data
    const EVENT_CONFIG = ${configJson};
    const PHOTOS = ${photosJson};

    // Populate Photo Gallery
    const photosContainer = document.getElementById('photos-container');
    function renderPhotos(filterCss = 'none') {
      photosContainer.innerHTML = '';
      PHOTOS.forEach(photo => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        card.innerHTML = \`
          <img src="\${photo.url}" alt="\${photo.title}" style="filter: \${filterCss};" />
          <div class="photo-info">
            <div style="font-size: 11px; text-transform: uppercase; color: var(--accent); margin-bottom: 2px;">\${photo.category}</div>
            <div class="photo-title">\${photo.title}</div>
            <div class="photo-caption">\${photo.caption}</div>
          </div>
        \`;
        photosContainer.appendChild(card);
      });
    }
    renderPhotos();

    // Aesthetic Filter Switcher
    function applyFilter(preset, btn) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      let css = 'none';
      if (preset === 'warm') css = 'sepia(0.28) contrast(1.05) brightness(1.04) saturate(1.22)';
      if (preset === 'sepia') css = 'sepia(0.68) contrast(1.12) brightness(0.95) saturate(0.85)';
      if (preset === 'noir') css = 'grayscale(1) contrast(1.18) brightness(1.02)';
      if (preset === 'film') css = 'contrast(0.92) brightness(1.06) saturate(0.88) sepia(0.15)';

      renderPhotos(css);
    }

    // Countdown Timer Engine
    function updateCountdown() {
      const target = new Date(EVENT_CONFIG.celebrationDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      document.getElementById('days').innerText = String(d).padStart(2, '0');
      document.getElementById('hours').innerText = String(h).padStart(2, '0');
      document.getElementById('minutes').innerText = String(m).padStart(2, '0');
      document.getElementById('seconds').innerText = String(s).padStart(2, '0');
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // Cake Cutting & Confetti Blast
    function cutCake() {
      // Confetti burst
      if (window.confetti) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#8C7B6B', '#E8D8CE', '#D6C7B2', '#B07B7A']
        });
        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 250);
      }

      document.getElementById('cake-status').innerText = '🎉 Happy Birthday ' + EVENT_CONFIG.personName + '! The cake is cut! 🍰';
      spawnBalloons(15);
    }

    // Floating Balloons Spawner
    function spawnBalloons(count = 12) {
      const balloonLayer = document.getElementById('balloon-layer');
      const colors = ['#E8D8CE', '#D6C7B2', '#CCD6CB', '#D4BFA8', '#EAE4DC', '#C8B8A6'];
      
      for (let i = 0; i < count; i++) {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        balloon.style.left = Math.random() * 90 + '%';
        balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        balloon.style.animationDuration = (8 + Math.random() * 6) + 's';
        balloon.style.animationDelay = (Math.random() * 2) + 's';
        balloon.title = 'Click to pop!';
        balloon.onclick = function() {
          balloon.remove();
        };
        balloonLayer.appendChild(balloon);

        setTimeout(() => {
          if (balloon.parentNode) balloon.remove();
        }, 16000);
      }
    }
    
    // Spawn initial aesthetic balloons
    spawnBalloons(6);

    // --- Virtual Sparkler Animation Engine ---
    let sparklerActive = false;
    const sparklerCanvas = document.getElementById('sparkler-canvas');
    const sparklerBtn = document.getElementById('sparkler-toggle-btn');
    const sparkCtx = sparklerCanvas.getContext('2d');
    let sparkParticles = [];
    let sparkPointer = { x: -100, y: -100, active: false, lastX: -100, lastY: -100 };
    let sparkAnimId = null;

    function resizeSparklerCanvas() {
      sparklerCanvas.width = window.innerWidth;
      sparklerCanvas.height = window.innerHeight;
    }
    resizeSparklerCanvas();
    window.addEventListener('resize', resizeSparklerCanvas);

    function toggleSparkler() {
      sparklerActive = !sparklerActive;
      if (sparklerActive) {
        sparklerBtn.classList.add('active');
        sparklerBtn.innerHTML = '<span>Sparkler ON ✨</span>';
        spawnSparkBurst(window.innerWidth / 2, window.innerHeight / 2, 35);
        if (!sparkAnimId) renderSparkler();
      } else {
        sparklerBtn.classList.remove('active');
        sparklerBtn.innerHTML = '<span>✨ Sparkler</span>';
      }
    }

    function spawnSpark(x, y, speedMult = 1.0) {
      const colors = ['#FFFFFF', '#FFF8E7', '#FFE082', '#FFCA28', '#FFA000', '${theme.accent}'];
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 3.5 + 1.2) * speedMult;
      const life = Math.floor(Math.random() * 25 + 15);
      sparkParticles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        size: Math.random() * 2.2 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    function spawnSparkBurst(x, y, count = 30) {
      for (let i = 0; i < count; i++) {
        spawnSpark(x, y, 1.8);
      }
    }

    function renderSparkler() {
      sparkCtx.clearRect(0, 0, sparklerCanvas.width, sparklerCanvas.height);

      if (sparklerActive && sparkPointer.active && sparkPointer.x > 0 && sparkPointer.y > 0) {
        const dx = sparkPointer.x - sparkPointer.lastX;
        const dy = sparkPointer.y - sparkPointer.lastY;
        const dist = Math.hypot(dx, dy);
        const steps = Math.min(Math.max(Math.floor(dist / 6), 1), 6);
        for (let s = 0; s < steps; s++) {
          const t = s / steps;
          spawnSpark(sparkPointer.lastX + dx * t, sparkPointer.lastY + dy * t);
        }
        sparkPointer.lastX = sparkPointer.x;
        sparkPointer.lastY = sparkPointer.y;

        // Draw glowing wand flare
        const grad = sparkCtx.createRadialGradient(sparkPointer.x, sparkPointer.y, 0, sparkPointer.x, sparkPointer.y, 28);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        grad.addColorStop(0.3, 'rgba(255, 224, 130, 0.6)');
        grad.addColorStop(1, 'rgba(255, 200, 60, 0)');
        sparkCtx.fillStyle = grad;
        sparkCtx.beginPath();
        sparkCtx.arc(sparkPointer.x, sparkPointer.y, 28, 0, Math.PI * 2);
        sparkCtx.fill();
      }

      for (let i = sparkParticles.length - 1; i >= 0; i--) {
        const p = sparkParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.vy += 0.07;
        p.life -= 1;

        if (p.life <= 0) {
          sparkParticles.splice(i, 1);
          continue;
        }

        const alpha = p.life / p.maxLife;
        sparkCtx.save();
        sparkCtx.globalAlpha = alpha;
        sparkCtx.strokeStyle = p.color;
        sparkCtx.lineWidth = p.size;
        sparkCtx.beginPath();
        sparkCtx.moveTo(p.x, p.y);
        sparkCtx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
        sparkCtx.stroke();
        sparkCtx.restore();
      }

      if (sparklerActive || sparkParticles.length > 0) {
        sparkAnimId = requestAnimationFrame(renderSparkler);
      } else {
        sparkAnimId = null;
        sparkCtx.clearRect(0, 0, sparklerCanvas.width, sparklerCanvas.height);
      }
    }

    window.addEventListener('pointermove', e => {
      if (!sparklerActive) return;
      sparkPointer.x = e.clientX;
      sparkPointer.y = e.clientY;
      if (!sparkPointer.active) {
        sparkPointer.active = true;
        sparkPointer.lastX = e.clientX;
        sparkPointer.lastY = e.clientY;
      }
    });

    window.addEventListener('pointerdown', e => {
      if (!sparklerActive) return;
      if (e.target.closest('#sparkler-toggle-btn')) return;
      sparkPointer.x = e.clientX;
      sparkPointer.y = e.clientY;
      sparkPointer.active = true;
      sparkPointer.lastX = e.clientX;
      sparkPointer.lastY = e.clientY;
      spawnSparkBurst(e.clientX, e.clientY, 28);
    });
  </script>
</body>
</html>`;
}

/**
 * Generates the complete source code package as a downloadable ZIP file.
 */
export async function createCustomizedSourceCodeZip(
  config: BirthdayEventConfig,
  photos: GalleryPhoto[],
  theme: ThemeColors
): Promise<Blob> {
  const zip = new JSZip();

  // 1. Standalone Single-file complete website
  const standaloneHtml = generateStandaloneWebsiteHtml(config, photos, theme);
  zip.file('index.html', standaloneHtml);

  // 2. Structured JSON configuration
  const configJson = JSON.stringify(
    {
      license: 'Paid License (₹199 INR)',
      unlockedAt: new Date().toISOString(),
      config,
      theme,
      photosCount: photos.length,
      photos,
    },
    null,
    2
  );
  zip.file('birthday-config.json', configJson);

  // 3. Quick Start & Deployment Guide (README.md)
  const readmeMd = `# ${config.personName}'s ${config.milestoneAge}th Birthday Celebration Website

Congratulations! You have unlocked and customized your complete Birthday Celebration source code package.

## 📦 What's Inside This Package

- **\`index.html\`**: The complete, standalone, production-ready interactive celebration website.
  - Interactive Cake Cutting with Confetti blasts
  - Virtual Sparkler wand animation with glowing particle trails on cursor and touch
  - Floating Poppable Balloons
  - Real-time Countdown Timer to ${new Date(config.celebrationDate).toLocaleDateString()}
  - Photo Memories Archive with Aesthetic Filter Presets (Warm Glow, Vintage Sepia, Classic Noir, Matte Film)
  - Responsive, elegant typography and minimalist soft neutral color palette (\`${theme.name}\`)
- **\`birthday-config.json\`**: Clean configuration file containing all your customized dates, venue addresses, and photo collections.
- **\`README.md\`**: This quick-start deployment manual.

---

## 🚀 How to Launch Your Website

### Option 1: Instant Local View (No setup needed!)
1. Simply double-click \`index.html\` in your file manager.
2. It will open immediately in any browser (Chrome, Safari, Edge, Firefox).

### Option 2: Free Cloud Hosting in 2 Minutes

#### Host on GitHub Pages (100% Free):
1. Create a free account at [github.com](https://github.com).
2. Create a new repository named \`${config.personName.toLowerCase().replace(/\\s+/g, '-')}-birthday\`.
3. Upload \`index.html\` directly into the repository.
4. Go to **Settings** > **Pages** > Select branch **main** > **Save**.
5. Your website is live and shareable with friends and family!

#### Host on Vercel or Netlify (Drag and Drop):
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop) or [vercel.com](https://vercel.com).
2. Drag and drop this folder.
3. You will receive an instant live URL to send to all your guests.

---

## 🎨 Customizing Further
You can open \`index.html\` in any text editor (like VS Code, Notepad, or TextEdit) and change text, photos, or styles at any time.

*Thank you for purchasing the ₹199 customizer package! Wishing ${config.personName} an unforgettable celebration!*
`;
  zip.file('README.md', readmeMd);

  // 4. Package.json for developer reference
  const pkgJson = JSON.stringify(
    {
      name: `${config.personName.toLowerCase().replace(/\s+/g, '-')}-birthday-website`,
      version: '1.0.0',
      description: `Customized birthday celebration website for ${config.personName}`,
      author: config.personName,
      license: 'MIT',
      scripts: {
        start: 'npx serve .',
      },
    },
    null,
    2
  );
  zip.file('package.json', pkgJson);

  // Generate blob
  return await zip.generateAsync({ type: 'blob' });
}
