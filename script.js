// ─── DOM references ──────────────────────────────────────────
const bomb   = document.getElementById('bomb');
const letter = document.getElementById('letter');
const canvas = document.getElementById('confetti-canvas');
const ctx    = canvas.getContext('2d');

// Resize canvas to viewport
function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ─── Build fuse + spark into bomb ───────────────────────────
const fuse  = document.createElement('div');
fuse.className = 'fuse';
const spark = document.createElement('div');
spark.className = 'spark';
fuse.appendChild(spark);
bomb.appendChild(fuse);

// ─── Build hint text ─────────────────────────────────────────
const hint = document.createElement('span');
hint.className = 'hint';
hint.textContent = '✨ Klik bom untuk meledakkan!';
bomb.appendChild(hint);

// ─── Build reset button ───────────────────────────────────────
const resetBtn = document.createElement('button');
resetBtn.className = 'reset-btn';
resetBtn.id = 'reset-btn';
resetBtn.textContent = '🔁 Coba Lagi';
document.querySelector('.container').appendChild(resetBtn);

// ─── State guard ─────────────────────────────────────────────
let exploded = false;

// ─── Confetti ────────────────────────────────────────────────
const CONFETTI_COLORS = [
  '#ff80c0','#f9a8d4','#f472b6','#fb7185',
  '#fda4af','#fbbf24','#fff','#e879f9','#c084fc'
];

class ConfettiPiece {
  constructor() { this.reset(true); }
  reset(fromCenter = false) {
    this.x    = canvas.width  / 2;
    this.y    = canvas.height / 2;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 18 + 4;
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed - Math.random() * 6;
    this.w    = Math.random() * 12 + 5;
    this.h    = Math.random() * 6  + 4;
    this.color= CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    this.rot  = Math.random() * Math.PI * 2;
    this.rotV = (Math.random() - 0.5) * 0.25;
    this.alpha= 1;
    this.life = 0;
    this.maxLife = Math.random() * 90 + 60;
  }
  update() {
    this.vy   += 0.55;          // gravity
    this.vx   *= 0.98;          // air drag
    this.x    += this.vx;
    this.y    += this.vy;
    this.rot  += this.rotV;
    this.life++;
    this.alpha = Math.max(0, 1 - this.life / this.maxLife);
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
    ctx.restore();
  }
  isDead() { return this.life >= this.maxLife; }
}

let pieces = [];
let confettiRAF = null;

function runConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces = pieces.filter(p => !p.isDead());
  pieces.forEach(p => { p.update(); p.draw(); });
  if (pieces.length > 0) {
    confettiRAF = requestAnimationFrame(runConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function burstConfetti(n = 120) {
  for (let i = 0; i < n; i++) pieces.push(new ConfettiPiece());
  if (!confettiRAF) runConfetti();
  else { cancelAnimationFrame(confettiRAF); confettiRAF = null; runConfetti(); }
}

// ─── DOM particle helpers ─────────────────────────────────────
function createFlash() {
  const flash = document.createElement('div');
  flash.className = 'flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 600);
}

const DOM_COLORS = [
  '#ff80c0','#f9a8d4','#f472b6','#fb7185',
  '#fcd5e5','#fbbf24','#fff','#fda4af'
];

function createDOMParticles() {
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;
  const n  = 50;
  for (let i = 0; i < n; i++) {
    const p     = document.createElement('div');
    p.className = 'particle';
    const size  = Math.random() * 18 + 6;
    const angle = (Math.PI * 2 / n) * i + Math.random() * 0.4;
    const speed = Math.random() * 160 + 60;
    const color = DOM_COLORS[Math.floor(Math.random() * DOM_COLORS.length)];
    const dur   = Math.random() * 500 + 500;
    const shapes = ['50%','10%','30% 70% 70% 30% / 30% 30% 70% 70%'];
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${cx}px; top:${cy}px;
      background:${color};
      border-radius:${shapes[Math.floor(Math.random()*shapes.length)]};
      box-shadow:0 0 ${size/2}px ${color};
      transform:translate(-50%,-50%);
      transition:transform ${dur}ms cubic-bezier(.17,.67,.35,.96),
                 opacity ${dur*0.8}ms ease ${dur*0.2}ms;
    `;
    document.body.appendChild(p);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      p.style.transform = `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) rotate(${Math.random()*360}deg)`;
      p.style.opacity   = '0';
    }));
    setTimeout(() => p.remove(), dur + 200);
  }
}

function createRing() {
  const ring = document.createElement('div');
  const cx   = window.innerWidth  / 2;
  const cy   = window.innerHeight / 2;
  ring.style.cssText = `
    position:fixed; left:${cx}px; top:${cy}px;
    width:10px; height:10px; border-radius:50%;
    border:6px solid #f9a8d4;
    transform:translate(-50%,-50%) scale(0);
    opacity:1; pointer-events:none; z-index:15;
    transition:transform 0.6s ease-out, opacity 0.6s ease-out;
    box-shadow:0 0 20px #f472b6;
  `;
  document.body.appendChild(ring);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    ring.style.transform = 'translate(-50%,-50%) scale(32)';
    ring.style.opacity   = '0';
  }));
  setTimeout(() => ring.remove(), 700);
}

// ─── Screen shake ─────────────────────────────────────────────
function shakeScreen() {
  const shakes = [[6,3],[-6,-3],[5,-5],[-4,6],[2,-2],[0,0]];
  shakes.forEach(([x,y], i) => {
    setTimeout(() => {
      document.body.style.transform = `translate(${x}px,${y}px)`;
    }, i * 50);
  });
  setTimeout(() => { document.body.style.transform = ''; }, shakes.length * 50 + 30);
}

// ─── Main explode function ────────────────────────────────────
function explode() {
  if (exploded) return;
  exploded = true;

  bomb.classList.add('exploding');
  shakeScreen();

  setTimeout(() => {
    createFlash();
    createRing();
    createDOMParticles();
    burstConfetti(130);
  }, 150);

  setTimeout(() => {
    bomb.style.display = 'none';
    letter.classList.remove('hidden');
    letter.classList.add('show');
    resetBtn.classList.add('show');
  }, 620);
}

// ─── Events ──────────────────────────────────────────────────
bomb.addEventListener('click', explode);
bomb.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') explode();
});

// ─── Reset ───────────────────────────────────────────────────
resetBtn.addEventListener('click', () => {
  exploded = false;
  pieces   = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  letter.classList.add('hidden');
  letter.classList.remove('show');
  resetBtn.classList.remove('show');

  bomb.style.display = '';
  bomb.classList.remove('exploding');
});
