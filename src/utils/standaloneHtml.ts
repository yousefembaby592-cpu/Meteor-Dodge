// Generates a fully self-contained single-file HTML version containing HTML, CSS, JavaScript, Web Audio synthesizer, and Canvas game loop.

export function generateStandaloneHtml(): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Meteor Dodge - تفادي النيزك السريع</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;800;900&family=Orbitron:wght@600;800;900&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      user-select: none;
      -webkit-user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    body {
      background: #03050d;
      color: #fff;
      font-family: 'Cairo', 'Orbitron', system-ui, sans-serif;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      touch-action: none;
    }
    #game-container {
      position: relative;
      width: 100vw;
      height: 100vh;
      max-width: 480px;
      max-height: 900px;
      background: radial-gradient(circle at 50% 30%, #0a0e27 0%, #03040b 100%);
      box-shadow: 0 0 40px rgba(6, 182, 212, 0.25);
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-radius: 12px;
      overflow: hidden;
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
    .hud {
      position: absolute;
      top: 16px;
      left: 16px;
      right: 16px;
      display: flex;
      justify-content: space-between;
      pointer-events: none;
      z-index: 10;
    }
    .badge {
      background: rgba(10, 15, 35, 0.75);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(6, 182, 212, 0.4);
      border-radius: 10px;
      padding: 6px 14px;
      font-size: 14px;
      font-weight: 800;
      box-shadow: 0 0 12px rgba(6, 182, 212, 0.3);
    }
    .badge span {
      color: #06b6d4;
      font-family: 'Orbitron', sans-serif;
      font-size: 16px;
      margin-left: 6px;
    }
    .badge.high-score span {
      color: #eab308;
    }
    .overlay {
      position: absolute;
      inset: 0;
      background: rgba(3, 5, 15, 0.85);
      backdrop-filter: blur(10px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 24px;
      z-index: 20;
      transition: opacity 0.3s;
    }
    .overlay.hidden {
      display: none;
    }
    .title {
      font-size: 32px;
      font-weight: 900;
      color: #06b6d4;
      text-shadow: 0 0 20px rgba(6, 182, 212, 0.8);
      margin-bottom: 6px;
    }
    .subtitle {
      font-family: 'Orbitron', sans-serif;
      font-size: 14px;
      letter-spacing: 2px;
      color: #ec4899;
      text-shadow: 0 0 10px rgba(236, 72, 153, 0.8);
      margin-bottom: 24px;
    }
    .score-card {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-radius: 14px;
      padding: 16px 24px;
      margin-bottom: 24px;
      width: 100%;
      max-width: 320px;
    }
    .score-row {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
      font-size: 16px;
      font-weight: 700;
    }
    .score-val {
      font-family: 'Orbitron', sans-serif;
      color: #06b6d4;
    }
    .btn {
      background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
      color: #fff;
      font-weight: 900;
      font-size: 18px;
      border: none;
      border-radius: 12px;
      padding: 14px 32px;
      cursor: pointer;
      box-shadow: 0 0 25px rgba(6, 182, 212, 0.6);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .btn:active {
      transform: scale(0.96);
    }
    .btn-replay {
      background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
      box-shadow: 0 0 25px rgba(236, 72, 153, 0.6);
    }
    .controls-hint {
      margin-top: 20px;
      font-size: 13px;
      color: #94a3b8;
      max-width: 280px;
    }
  </style>
</head>
<body>
  <div id="game-container">
    <canvas id="gameCanvas"></canvas>
    
    <div class="hud">
      <div class="badge">النقاط: <span id="hudScore">0</span></div>
      <div class="badge high-score">الرقم القياسي: <span id="hudHighScore">0</span></div>
    </div>

    <!-- Start Overlay -->
    <div id="startOverlay" class="overlay">
      <h1 class="title">تفادي النيزك السريع</h1>
      <p class="subtitle">METEOR DODGE</p>
      <div class="score-card">
        <div class="score-row">
          <span>أعلى نتيجة سابقة:</span>
          <span class="score-val" id="startHighScore">0</span>
        </div>
      </div>
      <button class="btn" id="startBtn">انطلاق المهمة 🚀</button>
      <p class="controls-hint">اسحب يميناً ويساراً باللمس أو الماوس، أو أسهم الكيبورد لتفادي النيازك!</p>
    </div>

    <!-- Game Over Overlay -->
    <div id="gameOverOverlay" class="overlay hidden">
      <h1 class="title" style="color: #ef4444; text-shadow: 0 0 20px rgba(239, 68, 68, 0.8);">تحطمت المركبة!</h1>
      <p class="subtitle" style="color: #f97316;">GAME OVER</p>
      <div class="score-card">
        <div class="score-row">
          <span>النقاط الحالية:</span>
          <span class="score-val" id="finalScore">0</span>
        </div>
        <div class="score-row">
          <span>أعلى رقم قياسي:</span>
          <span class="score-val" style="color: #eab308;" id="finalHighScore">0</span>
        </div>
        <div class="score-row">
          <span>نيازك تم تفاديها:</span>
          <span class="score-val" style="color: #10b981;" id="finalMeteors">0</span>
        </div>
      </div>
      <button class="btn btn-replay" id="restartBtn">إعادة المحاولة 🔄</button>
    </div>
  </div>

  <script>
    // --- AUDIO SYNTHESIZER ---
    const AudioEngine = {
      ctx: null,
      init() {
        if (!this.ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      },
      playExplosion() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const bufSize = this.ctx.sampleRate * 0.5;
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buf;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(40, now + 0.5);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
        noise.stop(now + 0.5);
      },
      playNearMiss() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.12);
      }
    };

    // --- GAME STATE ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('game-container');
    const startOverlay = document.getElementById('startOverlay');
    const gameOverOverlay = document.getElementById('gameOverOverlay');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const hudScore = document.getElementById('hudScore');
    const hudHighScore = document.getElementById('hudHighScore');
    const startHighScore = document.getElementById('startHighScore');
    const finalScore = document.getElementById('finalScore');
    const finalHighScore = document.getElementById('finalHighScore');
    const finalMeteors = document.getElementById('finalMeteors');

    let width = 0;
    let height = 0;
    let isPlaying = false;
    let score = 0;
    let highScore = parseInt(localStorage.getItem('meteor_dodge_high_score') || '0', 10);
    let meteorsDodged = 0;
    let speedMultiplier = 1;
    let spawnTimer = 0;
    let shakeAmount = 0;

    hudHighScore.textContent = highScore;
    startHighScore.textContent = highScore;

    // Entities
    const stars = [];
    const meteors = [];
    const particles = [];
    const floatingTexts = [];

    const player = {
      x: 0,
      y: 0,
      targetX: 0,
      width: 36,
      height: 48,
      tilt: 0
    };

    function resize() {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      player.y = height - 70;
      if (!isPlaying) {
        player.x = width / 2;
        player.targetX = width / 2;
      }
    }
    window.addEventListener('resize', resize);

    // Generate Stars
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * 500,
        y: Math.random() * 900,
        size: Math.random() * 2 + 0.8,
        speed: Math.random() * 1.5 + 0.5,
        color: ['#ffffff', '#06b6d4', '#ec4899', '#fef08a'][Math.floor(Math.random() * 4)]
      });
    }

    function spawnMeteor() {
      const radius = Math.random() * 18 + 14;
      const speed = (Math.random() * 2.5 + 3.2) * speedMultiplier;
      const x = Math.random() * (width - radius * 2) + radius;
      const colors = [
        { c: '#f97316', g: '#ef4444' },
        { c: '#06b6d4', g: '#3b82f6' },
        { c: '#ec4899', g: '#a855f7' }
      ];
      const theme = colors[Math.floor(Math.random() * colors.length)];
      
      const vertices = [];
      const count = 7;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const dist = radius * (0.75 + Math.random() * 0.4);
        vertices.push({ angle, dist });
      }

      meteors.push({
        x,
        y: -radius - 10,
        radius,
        speed,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        vertices,
        color: theme.c,
        glowColor: theme.g,
        nearMissed: false
      });
    }

    function createExplosion(x, y, color) {
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 6 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: Math.random() * 4 + 2,
          color,
          alpha: 1,
          decay: Math.random() * 0.03 + 0.02
        });
      }
    }

    // Input handlers
    let isTouching = false;
    function handlePointer(clientX) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      player.targetX = Math.max(player.width / 2, Math.min(width - player.width / 2, x));
    }

    window.addEventListener('mousemove', (e) => {
      if (isPlaying) handlePointer(e.clientX);
    });

    window.addEventListener('touchstart', (e) => {
      isTouching = true;
      if (isPlaying && e.touches.length > 0) handlePointer(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isPlaying && e.touches.length > 0) handlePointer(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => { isTouching = false; });

    window.addEventListener('keydown', (e) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        player.targetX = Math.max(player.width / 2, player.targetX - 25);
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        player.targetX = Math.min(width - player.width / 2, player.targetX + 25);
      }
    });

    function startGame() {
      AudioEngine.init();
      isPlaying = true;
      score = 0;
      meteorsDodged = 0;
      speedMultiplier = 1;
      spawnTimer = 0;
      meteors.length = 0;
      particles.length = 0;
      floatingTexts.length = 0;
      player.x = width / 2;
      player.targetX = width / 2;
      hudScore.textContent = '0';
      startOverlay.classList.add('hidden');
      gameOverOverlay.classList.add('hidden');
    }

    function gameOver() {
      isPlaying = false;
      AudioEngine.playExplosion();
      createExplosion(player.x, player.y, '#06b6d4');
      shakeAmount = 15;

      if (score > highScore) {
        highScore = score;
        localStorage.setItem('meteor_dodge_high_score', String(highScore));
        hudHighScore.textContent = highScore;
      }

      finalScore.textContent = score;
      finalHighScore.textContent = highScore;
      finalMeteors.textContent = meteorsDodged;
      gameOverOverlay.classList.remove('hidden');
    }

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);

    // --- GAME LOOP ---
    function update() {
      // Stars
      for (const s of stars) {
        s.y += s.speed * speedMultiplier;
        if (s.y > height) {
          s.y = 0;
          s.x = Math.random() * width;
        }
      }

      if (!isPlaying) return;

      // Score and Speed Scaling
      score += Math.round(1 * speedMultiplier);
      hudScore.textContent = score;
      speedMultiplier = 1 + (score / 1500) * 1.5;

      // Smooth Player Movement
      const dx = player.targetX - player.x;
      player.x += dx * 0.22;
      player.tilt = Math.max(-0.4, Math.min(0.4, dx * 0.02));

      // Thruster flame particles
      if (Math.random() < 0.6) {
        particles.push({
          x: player.x + (Math.random() - 0.5) * 8,
          y: player.y + player.height / 2,
          vx: (Math.random() - 0.5) * 1.5,
          vy: Math.random() * 3 + 4,
          size: Math.random() * 3 + 1.5,
          color: '#06b6d4',
          alpha: 1,
          decay: 0.06
        });
      }

      // Spawning Meteors
      spawnTimer += speedMultiplier;
      const spawnInterval = Math.max(25, 60 - speedMultiplier * 7);
      if (spawnTimer >= spawnInterval) {
        spawnTimer = 0;
        spawnMeteor();
      }

      // Meteors Update & Collision
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.y += m.speed;
        m.rotation += m.rotationSpeed;

        // Near miss check
        const dist = Math.hypot(m.x - player.x, m.y - player.y);
        if (!m.nearMissed && dist < m.radius + 35 && dist > m.radius + 18) {
          m.nearMissed = true;
          score += 50;
          AudioEngine.playNearMiss();
          floatingTexts.push({
            x: player.x,
            y: player.y - 20,
            text: '+50 تفادٍ خطير!',
            alpha: 1,
            color: '#eab308'
          });
        }

        // Collision Check (Circle vs Ship Hitbox)
        const hitDist = m.radius + player.width * 0.38;
        if (dist < hitDist) {
          gameOver();
          break;
        }

        // Off screen
        if (m.y > height + m.radius + 20) {
          meteors.splice(i, 1);
          meteorsDodged++;
        }
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0) particles.splice(i, 1);
      }

      // Floating Texts
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y -= 1.2;
        ft.alpha -= 0.025;
        if (ft.alpha <= 0) floatingTexts.splice(i, 1);
      }

      // Shake decay
      if (shakeAmount > 0) shakeAmount *= 0.88;
      if (shakeAmount < 0.2) shakeAmount = 0;
    }

    function draw() {
      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Screen Shake
      if (shakeAmount > 0) {
        const sx = (Math.random() - 0.5) * shakeAmount;
        const sy = (Math.random() - 0.5) * shakeAmount;
        ctx.translate(sx, sy);
      }

      // Draw Stars
      for (const s of stars) {
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Meteors
      for (const m of meteors) {
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(m.rotation);

        // Glow
        ctx.shadowColor = m.glowColor;
        ctx.shadowBlur = 15;

        // Meteor Body
        ctx.fillStyle = m.color;
        ctx.beginPath();
        for (let i = 0; i < m.vertices.length; i++) {
          const v = m.vertices[i];
          const vx = Math.cos(v.angle) * v.dist;
          const vy = Math.sin(v.angle) * v.dist;
          if (i === 0) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        ctx.closePath();
        ctx.fill();

        // Core highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, m.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Draw Particles
      for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Player Ship
      if (isPlaying || !gameOverOverlay.classList.contains('hidden') === false) {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.tilt);

        // Neon Glow
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 20;

        // Ship Body (Futuristic Neon Fighter)
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(0, -player.height / 2); // Nose
        ctx.lineTo(player.width / 2, player.height / 2 - 6); // Right Wing
        ctx.lineTo(player.width / 4, player.height / 2);
        ctx.lineTo(0, player.height / 2 - 8);
        ctx.lineTo(-player.width / 4, player.height / 2);
        ctx.lineTo(-player.width / 2, player.height / 2 - 6); // Left Wing
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cockpit Glow
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.ellipse(0, -4, 4, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wing Laser Accents
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-player.width / 2 + 2, player.height / 2 - 12);
        ctx.lineTo(-player.width / 2 + 2, player.height / 2 - 2);
        ctx.moveTo(player.width / 2 - 2, player.height / 2 - 12);
        ctx.lineTo(player.width / 2 - 2, player.height / 2 - 2);
        ctx.stroke();

        ctx.restore();
      }

      // Floating Texts
      for (const ft of floatingTexts) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillStyle = ft.color;
        ctx.font = "bold 15px 'Cairo', sans-serif";
        ctx.textAlign = 'center';
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 10;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      ctx.restore();
    }

    function loop() {
      update();
      draw();
      requestAnimationFrame(loop);
    }

    resize();
    requestAnimationFrame(loop);
  </script>
</body>
</html>`;
}
