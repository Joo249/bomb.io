'use strict';

// ─── ELEMENTS ────────────────────────────────────────────────
const scene          = document.getElementById('scene');
const bombEl         = document.getElementById('bomb');
const bombWrapper    = document.getElementById('bomb-wrapper');
const clickHint      = document.getElementById('click-hint');
const subtitle       = document.getElementById('subtitle');
const letterScene    = document.getElementById('letter-scene');
const envFlap        = document.getElementById('env-flap');
const letterPaper    = document.getElementById('letter-paper');
const letterText     = document.getElementById('letter-text');
const letterSig      = document.querySelector('.letter-sig');
const resetBtn       = document.getElementById('reset-btn');
const canvas         = document.getElementById('confetti-canvas');
const explosionOverlay = document.getElementById('explosion-overlay');
const bgBubbles      = document.getElementById('bg-bubbles');
const starsEl        = document.getElementById('stars');
const ctx            = canvas.getContext('2d');

// ─── CANVAS RESIZE ───────────────────────────────────────────
function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ─── GENERATE BACKGROUND STARS ───────────────────────────────
(function generateStars() {
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 3 + 1;
    s.style.cssText = `
      width: ${size}px; height: ${size}px;
      top: ${Math.random() * 100}%;
      left: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 3 + 2}s;
      animation-delay: ${Math.random() * 4}s;
    `;
    starsEl.appendChild(s);
  }
})();

// ─── GENERATE BACKGROUND BUBBLES ─────────────────────────────
(function generateBubbles() {
  for (let i = 0; i < 14; i++) {
    const b = document.createElement('div');
    b.className = 'bubble';
    const size = Math.random() * 90 + 30;
    b.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 12 + 8}s;
      animation-delay: ${Math.random() * 10}s;
    `;
    bgBubbles.appendChild(b);
  }
})();

// ─── TYPEWRITER TEXT ─────────────────────────────────────────
const MESSAGE = 'Apa kamu mengerti? 💕';

function typewriterEffect(el, text, speed = 60) {
  return new Promise(resolve => {
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    el.textContent = '';
    el.appendChild(cursor);

    const interval = setInterval(() => {
      const char = text[i];
      el.insertBefore(document.createTextNode(char), cursor);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        // remove cursor after pause
        setTimeout(() => { cursor.remove(); resolve(); }, 1200);
      }
    }, speed);
  });
}

// ─── CONFETTI SYSTEM ─────────────────────────────────────────
const PALETTE = [
  '#ff80c0','#f9a8d4','#f472b6','#fb7185',
  '#fda4af','#fbbf24','#ffffff','#e879f9',
  '#c084fc','#fcd5e5','#ff6ec7'
];
const SHAPES = ['rect', 'circle', 'triangle'];

class Piece {
  constructor() {
    this.x    = canvas.width  / 2;
    this.y    = canvas.height / 2;
    const a   = Math.random() * Math.PI * 2;
    const spd = Math.random() * 22 + 5;
    this.vx   = Math.cos(a) * spd;
    this.vy   = Math.sin(a) * spd - Math.random() * 8;
    this.w    = Math.random() * 14 + 5;
    this.h    = Math.random() * 8  + 4;
    this.color= PALETTE[Math.floor(Math.random() * PALETTE.length)];
    this.rot  = Math.random() * Math.PI * 2;
    this.rotV = (Math.random() - 0.5) * 0.3;
    this.alpha= 1;
    this.life = 0;
    this.maxL = Math.random() * 80 + 70;
    this.shape= SHAPES[Math.floor(Math.random() * SHAPES.length)];
  }
  update() {
    this.vy   += 0.6;
    this.vx   *= 0.985;
    this.x    += this.vx;
    this.y    += this.vy;
    this.rot  += this.rotV;
    this.life++;
    this.alpha = Math.max(0, 1 - this.life / this.maxL);
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur  = 4;
    if (this.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, this.w / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === 'triangle') {
      const r = this.w / 2;
      ctx.beginPath();
      ctx.moveTo(0, -r); ctx.lineTo(r, r); ctx.lineTo(-r, r);
      ctx.closePath(); ctx.fill();
    } else {
      ctx.fillRect(-this.w/2, -this.h/2, this.w, this.h);
    }
    ctx.restore();
  }
  isDead() { return this.life >= this.maxL; }
}

let pieces = [];
let rafId  = null;

function runConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces = pieces.filter(p => !p.isDead());
  pieces.forEach(p => { p.update(); p.draw(); });
  if (pieces.length > 0) {
    rafId = requestAnimationFrame(runConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    rafId = null;
  }
}

function burstConfetti(n = 160) {
  for (let i = 0; i < n; i++) pieces.push(new Piece());
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  runConfetti();
}

// ─── DOM PARTICLES ────────────────────────────────────────────
function spawnDOMParticles() {
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;
  const n  = 45;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('div');
    const sz = Math.random() * 20 + 8;
    const angle = (Math.PI * 2 / n) * i + Math.random() * 0.5;
    const spd   = Math.random() * 180 + 80;
    const col   = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const dur   = Math.random() * 600 + 500;
    const shapes = ['50%','12%','40% 60% 60% 40% / 40% 40% 60% 60%'];
    p.style.cssText = `
      position:fixed; z-index:45;
      width:${sz}px; height:${sz}px;
      left:${cx}px; top:${cy}px;
      background:${col};
      border-radius:${shapes[i % shapes.length]};
      box-shadow:0 0 ${sz/1.5}px ${col};
      transform:translate(-50%,-50%);
      pointer-events:none;
      transition:transform ${dur}ms cubic-bezier(.17,.67,.35,.96),
                 opacity ${dur*0.7}ms ease ${dur*0.25}ms;
    `;
    document.body.appendChild(p);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const dx = Math.cos(angle) * spd;
      const dy = Math.sin(angle) * spd;
      p.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${Math.random()*720}deg)`;
      p.style.opacity   = '0';
    }));
    setTimeout(() => p.remove(), dur + 300);
  }
}

// ─── SHOCKWAVE RINGS ─────────────────────────────────────────
function spawnRings() {
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;
  [0, 100, 200].forEach(delay => {
    setTimeout(() => {
      const ring = document.createElement('div');
      ring.style.cssText = `
        position:fixed; z-index:48;
        left:${cx}px; top:${cy}px;
        width:10px; height:10px; border-radius:50%;
        border:5px solid rgba(249,168,212,0.9);
        transform:translate(-50%,-50%) scale(0);
        opacity:1; pointer-events:none;
        transition:transform 0.7s ease-out, opacity 0.7s ease-out;
        box-shadow:0 0 24px #f472b6, inset 0 0 10px rgba(255,255,255,0.3);
      `;
      document.body.appendChild(ring);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        ring.style.transform = 'translate(-50%,-50%) scale(35)';
        ring.style.opacity   = '0';
      }));
      setTimeout(() => ring.remove(), 800);
    }, delay);
  });
}

// ─── SCREEN SHAKE ────────────────────────────────────────────
function shakeScreen() {
  const frames = [
    [7,4],[-7,-4],[6,-6],[-5,7],[4,-3],[-2,4],[1,-1],[0,0]
  ];
  frames.forEach(([x,y], i) => {
    setTimeout(() => {
      document.body.style.transform = `translate(${x}px,${y}px)`;
    }, i * 40);
  });
  setTimeout(() => { document.body.style.transform = ''; }, frames.length * 40 + 30);
}

// ─── HEART RAIN (bonus) ───────────────────────────────────────
function heartRain() {
  const hearts = ['💖','💗','💕','✨','🌸','💫'];
  for (let i = 0; i < 18; i++) {
    setTimeout(() => {
      const h = document.createElement('div');
      h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      const startX = Math.random() * window.innerWidth;
      h.style.cssText = `
        position:fixed; z-index:42;
        left:${startX}px; top:-40px;
        font-size:${Math.random()*20+14}px;
        pointer-events:none;
        animation: fallDown ${Math.random()*2+2}s linear forwards;
      `;
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 4000);
    }, i * 120);
  }

  if (!document.getElementById('fall-style')) {
    const st = document.createElement('style');
    st.id = 'fall-style';
    st.textContent = `
      @keyframes fallDown {
        0%   { transform:translateY(0)   rotate(0deg);   opacity:1; }
        100% { transform:translateY(110vh) rotate(360deg); opacity:0; }
      }
    `;
    document.head.appendChild(st);
  }
}

// ─── LETTER REVEAL SEQUENCE ───────────────────────────────────
async function revealLetter() {
  // 1. Show letter scene
  letterScene.classList.remove('hidden');
  letterScene.classList.add('show');

  // 2. Pull letter paper out of envelope (flap opens simultaneously)
  await sleep(100);
  envFlap.classList.add('open');
  await sleep(300);
  letterPaper.classList.add('pull-out');

  // 3. Typewriter effect
  await sleep(900);
  await typewriterEffect(letterText, MESSAGE, 55);

  // 4. Signature fades in
  letterSig.classList.add('show');

  // 5. Heart rain
  heartRain();
  setTimeout(heartRain, 2500);
}

// ─── MAIN EXPLODE ─────────────────────────────────────────────
let exploded = false;

async function explode() {
  if (exploded) return;
  exploded = true;

  // Disable interactions
  bombEl.classList.add('exploding');

  // Effects
  shakeScreen();

  await sleep(120);
  explosionOverlay.classList.add('flash');
  spawnRings();
  spawnDOMParticles();
  burstConfetti(180);

  await sleep(300);
  // Hide bomb scene
  scene.style.transition = 'opacity 0.3s';
  scene.style.opacity    = '0';
  await sleep(320);
  scene.style.display    = 'none';

  // Reveal letter
  await revealLetter();
}

// helper
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── EVENTS ──────────────────────────────────────────────────
bombEl.addEventListener('click', explode);
bombEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); explode(); }
});

// ─── RESET ───────────────────────────────────────────────────
resetBtn.addEventListener('click', () => {
  // Clear confetti
  pieces = [];
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Reset letter
  letterScene.classList.add('hidden');
  letterScene.classList.remove('show');
  envFlap.classList.remove('open');
  letterPaper.classList.remove('pull-out');
  letterText.textContent = '';
  letterSig.classList.remove('show');
  explosionOverlay.classList.remove('flash');

  // Reset bomb scene
  exploded = false;
  scene.style.display   = '';
  scene.style.opacity   = '';
  scene.style.transition= '';
  bombEl.classList.remove('exploding');
  bombEl.style.display  = '';
  document.body.style.transform = '';
});
