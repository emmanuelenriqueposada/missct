/* ═══════════════════════════════════════
   ROSA GALÁCTICA — galactica.js
   Motor: warp speed stars, rosa rosa en canvas,
   pétalos galácticos, transiciones suaves
═══════════════════════════════════════ */
'use strict';

/* ── DOM ── */
const warpCv    = document.getElementById('warp-canvas');
const wCtx      = warpCv.getContext('2d');
const petalsCv  = document.getElementById('petals-canvas');
const pCtx      = petalsCv.getContext('2d');
const roseCv    = document.getElementById('rose-canvas');
const rCtx      = roseCv.getContext('2d');
const sparkDiv  = document.getElementById('sparkles');
const introScr  = document.getElementById('intro');
const cartaScr  = document.getElementById('carta');
const musicBar  = document.getElementById('music-bar');
const musicBarsEl = document.getElementById('music-bars');
const musicFloat= document.getElementById('music-float');
const floatWaves= document.getElementById('float-waves');
const musicIcon = document.getElementById('music-icon');
const btnBack   = document.getElementById('btn-back');
const bgMusic   = document.getElementById('bg-music');

/* ── ESTADO ── */
let time = 0, isPlaying = false, canOpen = true;
let roseAngle = 0, bloomFactor = 0, bloomDir = 1;
let warpStars = [], petals = [];
const DPR = Math.min(window.devicePixelRatio || 1, 2);

/* ══════════════════════════════════════
   1. RESIZE
══════════════════════════════════════ */
function resize() {
  const W = window.innerWidth, H = window.innerHeight;

  warpCv.width = W * DPR; warpCv.height = H * DPR;
  warpCv.style.width = W+'px'; warpCv.style.height = H+'px';
  wCtx.setTransform(DPR,0,0,DPR,0,0);

  petalsCv.width = W*DPR; petalsCv.height = H*DPR;
  petalsCv.style.width = W+'px'; petalsCv.style.height = H+'px';
  pCtx.setTransform(DPR,0,0,DPR,0,0);

  const rS = roseCv.parentElement.offsetWidth;
  roseCv.width = rS*DPR; roseCv.height = rS*DPR;
  roseCv.style.width = rS+'px'; roseCv.style.height = rS+'px';
  rCtx.setTransform(DPR,0,0,DPR,0,0);

  initWarpStars();
}

window.addEventListener('resize', resize);

/* ══════════════════════════════════════
   2. WARP SPEED — ESTRELLAS VIAJANDO
   Técnica: cada estrella tiene coordenadas
   3D (x,y,z). Al proyectarlas en 2D se
   alejan del centro hacia los bordes,
   creando el efecto de velocidad hiperespacial
══════════════════════════════════════ */
function initWarpStars() {
  warpStars = [];
  const COUNT = window.innerWidth < 500 ? 280 : 420;
  for (let i = 0; i < COUNT; i++) {
    warpStars.push(newWarpStar(true));
  }
}

function newWarpStar(randomZ = false) {
  const W = window.innerWidth, H = window.innerHeight;
  return {
    x:     (Math.random() - .5) * W * 2.2,   // coord 3D centrada
    y:     (Math.random() - .5) * H * 2.2,
    z:     randomZ ? Math.random() * W : W,   // profundidad (W = lejos, 0 = cerca)
    pz:    0,                                  // z anterior (para rastro)
    // color aleatorio entre blanco y rosas
    hue:   Math.random() > .6 ? 340 + Math.random() * 30 : 0,
    sat:   Math.random() > .6 ? 80 + Math.random() * 20 : 0,
    size:  Math.random() * 1.4 + .4,
  };
}

function drawWarp() {
  const W = window.innerWidth, H = window.innerHeight;
  const cx = W / 2, cy = H / 2;

  // Fondo — negro cosmos con tinte rosa muy sutil
  wCtx.fillStyle = 'rgba(3,0,8,.85)';
  wCtx.fillRect(0, 0, W, H);

  // Nebulosa de fondo tenue
  const neb = wCtx.createRadialGradient(cx, cy*.6, 0, cx, cy*.6, W*.55);
  neb.addColorStop(0,   'rgba(107,0,56,.09)');
  neb.addColorStop(.5,  'rgba(224,32,160,.04)');
  neb.addColorStop(1,   'transparent');
  wCtx.fillStyle = neb;
  wCtx.fillRect(0, 0, W, H);

  // Velocidad warp
  const SPEED = 18;

  warpStars.forEach(s => {
    s.pz = s.z;          // guardar z anterior
    s.z -= SPEED;        // acercar estrella

    if (s.z <= 0) {
      // Reciclar estrella: vuelve al fondo con nueva posición
      Object.assign(s, newWarpStar(false));
      s.z  = W;
      s.pz = W;
      return;
    }

    // Proyección perspectiva
    const scale  = W / s.z;
    const scaleP = W / s.pz;

    const x  = cx + s.x * scale;
    const y  = cy + s.y * scale;
    const px = cx + s.x * scaleP;
    const py = cy + s.y * scaleP;

    // Solo dibujar si está en pantalla
    if (x < -20 || x > W+20 || y < -20 || y > H+20) return;

    // Brillo según profundidad (más cerca = más brillante)
    const brightness = 1 - s.z / W;
    const r = s.size * (1 + brightness * 2);

    // Color: blanco o rosa según la estrella
    let color;
    if (s.hue > 0) {
      color = `hsla(${s.hue},${s.sat}%,85%,${brightness * .95})`;
    } else {
      color = `rgba(255,255,255,${brightness * .9})`;
    }

    // Rastro (streak) — línea desde posición anterior
    const streakLen = Math.max(0, (scaleP - scale) * Math.abs(s.x));
    if (brightness > .15 && streakLen > 0.5) {
      wCtx.beginPath();
      wCtx.moveTo(px, py);
      wCtx.lineTo(x, y);
      // Gradiente del rastro: transparente → color
      const grad = wCtx.createLinearGradient(px, py, x, y);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, color);
      wCtx.strokeStyle = grad;
      wCtx.lineWidth = r * .8;
      wCtx.stroke();
    }

    // Punto de la estrella
    wCtx.beginPath();
    wCtx.arc(x, y, r * .5, 0, Math.PI * 2);
    wCtx.fillStyle = color;
    wCtx.fill();

    // Halo en estrellas muy cercanas
    if (brightness > .75 && r > 1.5) {
      wCtx.beginPath();
      wCtx.arc(x, y, r * 2.5, 0, Math.PI * 2);
      if (s.hue > 0) {
        wCtx.fillStyle = `hsla(${s.hue},${s.sat}%,85%,${brightness*.15})`;
      } else {
        wCtx.fillStyle = `rgba(255,255,255,${brightness*.12})`;
      }
      wCtx.fill();
    }
  });

  // Viñeta central que da sensación de túnel
  const vin = wCtx.createRadialGradient(cx,cy,W*.05, cx,cy,W*.75);
  vin.addColorStop(0,   'transparent');
  vin.addColorStop(.65, 'transparent');
  vin.addColorStop(1,   'rgba(3,0,8,.55)');
  wCtx.fillStyle = vin;
  wCtx.fillRect(0,0,W,H);
}

/* ══════════════════════════════════════
   3. ROSA ROSA EN CANVAS
══════════════════════════════════════ */
function drawRose() {
  const sz = roseCv.width / DPR;
  const cx = sz / 2, cy = sz / 2;
  const base = sz * .36;

  rCtx.clearRect(0, 0, sz, sz);

  // Halo detrás
  const halo = rCtx.createRadialGradient(cx,cy,base*.15, cx,cy,base*1.5);
  halo.addColorStop(0,   'rgba(255,80,160,.30)');
  halo.addColorStop(.45, 'rgba(224,32,160,.12)');
  halo.addColorStop(1,   'transparent');
  rCtx.fillStyle = halo;
  rCtx.beginPath();
  rCtx.arc(cx, cy, base*1.5, 0, Math.PI*2);
  rCtx.fill();

  // Animación
  roseAngle  += .003;
  bloomFactor += .007 * bloomDir;
  if (bloomFactor > 1 || bloomFactor < 0) bloomDir *= -1;
  bloomFactor = Math.max(0, Math.min(1, bloomFactor));
  const bloom = .86 + bloomFactor * .14;

  // Capas de pétalos — tonos rosa/fucsia/magenta
  const layers = [
    { n:7, rMid:base*.85, wMid:base*.36, rot:0,    cols:['#7a0040','#b01060','#d82878'] },
    { n:7, rMid:base*.70, wMid:base*.32, rot:.45,  cols:['#901050','#c81870','#ec3088'] },
    { n:6, rMid:base*.55, wMid:base*.29, rot:.9,   cols:['#a81060','#d82080','#f04098'] },
    { n:5, rMid:base*.42, wMid:base*.25, rot:1.4,  cols:['#c01870','#e83090','#ff58a8'] },
    { n:4, rMid:base*.29, wMid:base*.21, rot:1.85, cols:['#d82880','#f040a0','#ff70be'] },
    { n:3, rMid:base*.17, wMid:base*.16, rot:2.3,  cols:['#ec3890','#ff55b0','#ff88cc'] },
  ];

  layers.forEach((layer, li) => {
    const rotOff = roseAngle * (li % 2 === 0 ? 1 : -1) * .28;
    for (let i = 0; i < layer.n; i++) {
      const angle = (Math.PI*2 / layer.n)*i + layer.rot + rotOff;
      const breathe = 1 + .055 * Math.sin(time*.038 + i*.8 + li);
      const r = layer.rMid * bloom * breathe;
      const w = layer.wMid * bloom;

      rCtx.save();
      rCtx.translate(cx, cy);
      rCtx.rotate(angle);

      const grd = rCtx.createRadialGradient(0,-r*.25,w*.04, 0,-r*.58,r);
      grd.addColorStop(0,   layer.cols[2]+'ff');
      grd.addColorStop(.38, layer.cols[1]+'ee');
      grd.addColorStop(.75, layer.cols[0]+'cc');
      grd.addColorStop(1,   layer.cols[0]+'00');

      rCtx.beginPath();
      rCtx.ellipse(0, -r*.5, w*.5, r*.5, 0, 0, Math.PI*2);
      rCtx.fillStyle = grd;
      rCtx.globalAlpha = .93 - li*.04;
      rCtx.fill();

      // Brillo especular
      rCtx.globalAlpha = .15;
      rCtx.fillStyle = 'rgba(255,255,255,.85)';
      rCtx.beginPath();
      rCtx.ellipse(-w*.1, -r*.35, w*.1, r*.17, -.3, 0, Math.PI*2);
      rCtx.fill();

      // Vena
      rCtx.globalAlpha = .1;
      rCtx.strokeStyle = 'rgba(255,200,230,.7)';
      rCtx.lineWidth = .7;
      rCtx.beginPath();
      rCtx.moveTo(0, -r*.06);
      rCtx.quadraticCurveTo(w*.08, -r*.48, 0, -r*.94);
      rCtx.stroke();

      rCtx.globalAlpha = 1;
      rCtx.restore();
    }
  });

  // Centro dorado rosado
  const cR = base*.115 * bloom;
  const cg = rCtx.createRadialGradient(cx-cR*.22,cy-cR*.22,0, cx,cy,cR*1.5);
  cg.addColorStop(0,   '#fff0f8');
  cg.addColorStop(.35, '#ffcce0');
  cg.addColorStop(.7,  '#f080a0');
  cg.addColorStop(1,   '#c04060');
  rCtx.beginPath();
  rCtx.arc(cx, cy, cR, 0, Math.PI*2);
  rCtx.fillStyle = cg;
  rCtx.fill();

  // Brillo centro
  rCtx.beginPath();
  rCtx.arc(cx - cR*.28, cy - cR*.28, cR*.34, 0, Math.PI*2);
  rCtx.fillStyle = 'rgba(255,255,255,.5)';
  rCtx.fill();

  // Hojas — tono verde azulado para contraste con rosa
  drawLeaf(rCtx, cx - base*.48, cy + base*.52, base*.4,  -Math.PI/5, bloom);
  drawLeaf(rCtx, cx + base*.48, cy + base*.52, base*.4,  Math.PI + Math.PI/5, bloom);
}

function drawLeaf(ctx, x, y, len, angle, bloom) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const lg = ctx.createLinearGradient(0, 0, 0, -len);
  lg.addColorStop(0,   '#0a3020');
  lg.addColorStop(.5,  '#185c38');
  lg.addColorStop(1,   '#0a302080');
  ctx.beginPath();
  ctx.ellipse(0, -len*.5, len*.22*bloom, len*.48*bloom, 0, 0, Math.PI*2);
  ctx.fillStyle = lg;
  ctx.globalAlpha = .88;
  ctx.fill();
  ctx.strokeStyle = 'rgba(80,200,120,.28)';
  ctx.lineWidth = .8;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -len*.94);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();
}

/* ══════════════════════════════════════
   4. PÉTALOS CAYENDO — CANVAS
══════════════════════════════════════ */
function spawnPetal() {
  const W = window.innerWidth;
  const cols = ['#d82878','#f04098','#b01060','#ff70be','#ec3090','#ff90c8','#c81870'];
  petals.push({
    x: Math.random() * W, y: -25,
    size:  7 + Math.random() * 11,
    color: cols[Math.floor(Math.random()*cols.length)],
    vx: (Math.random()-.5)*1.3,
    vy: .7 + Math.random()*1.5,
    rot: Math.random()*Math.PI*2,
    rotV: (Math.random()-.5)*.065,
    wobble: Math.random()*Math.PI*2,
    wobbleS: Math.random()*.04+.02,
    alpha: .65 + Math.random()*.35,
    life: 0, maxLife: 280 + Math.random()*200,
  });
}

function drawPetals() {
  const W = window.innerWidth, H = window.innerHeight;
  pCtx.clearRect(0, 0, W, H);
  petals = petals.filter(p => p.life < p.maxLife && p.y < H+50);
  petals.forEach(p => {
    p.life++; p.wobble += p.wobbleS;
    p.x += p.vx + Math.sin(p.wobble)*.9;
    p.y += p.vy; p.rot += p.rotV;
    const fade = p.life > p.maxLife*.8 ? 1-(p.life-p.maxLife*.8)/(p.maxLife*.2) : 1;
    pCtx.save();
    pCtx.translate(p.x, p.y);
    pCtx.rotate(p.rot);
    pCtx.globalAlpha = p.alpha * fade;
    const pg = pCtx.createRadialGradient(0,0,0, 0,0,p.size);
    pg.addColorStop(0,   p.color+'ff');
    pg.addColorStop(.6,  p.color+'cc');
    pg.addColorStop(1,   p.color+'00');
    pCtx.beginPath();
    pCtx.ellipse(0, 0, p.size*.45, p.size, 0, 0, Math.PI*2);
    pCtx.fillStyle = pg;
    pCtx.fill();
    pCtx.restore();
  });
}

/* ══════════════════════════════════════
   5. SPARKLES DOM
══════════════════════════════════════ */
function initSparkles() {
  const pos = [
    {top:'8%', left:'12%', size:10, delay:'0s'},
    {top:'14%',left:'83%', size:8,  delay:'.4s'},
    {top:'74%',left:'7%',  size:7,  delay:'.8s'},
    {top:'80%',left:'88%', size:9,  delay:'1.2s'},
    {top:'38%',left:'4%',  size:6,  delay:'1.6s'},
    {top:'34%',left:'93%', size:7,  delay:'2s'},
    {top:'55%',left:'50%', size:5,  delay:'2.4s'},
    {top:'22%',left:'48%', size:8,  delay:'.6s'},
  ];
  pos.forEach(p => {
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.style.cssText = `top:${p.top};left:${p.left};width:${p.size}px;height:${p.size}px;
      animation-duration:${1.4+Math.random()}s;animation-delay:${p.delay};`;
    sparkDiv.appendChild(s);
  });
}

/* ══════════════════════════════════════
   6. LOOP PRINCIPAL
══════════════════════════════════════ */
let petalTimer = 0;

function loop() {
  time++; petalTimer++;
  drawWarp();
  drawRose();
  drawPetals();
  if (petalTimer % 38 === 0) spawnPetal();
  requestAnimationFrame(loop);
}

/* ══════════════════════════════════════
   7. TRANSICIONES
══════════════════════════════════════ */
function openCarta() {
  if (!canOpen) return;
  canOpen = false;

  // ✅ IGUAL QUE EL PROYECTO QUE FUNCIONÓ:
  // play() se llama directo aquí, sin setTimeout, dentro del evento click
  if (!isPlaying) tryPlay();

  // Pulso de la rosa
  roseCv.style.transition = 'transform .25s ease';
  roseCv.style.transform  = 'scale(1.12)';

  // Ripple
  spawnRipple();

  setTimeout(() => {
    introScr.classList.remove('active');
    setTimeout(() => {
      cartaScr.classList.add('active');
      musicFloat.style.display = 'flex';
      window.scrollTo({ top:0, behavior:'instant' });
    }, 800);
  }, 300);
}

function closeCarta() {
  cartaScr.classList.remove('active');
  bgMusic.pause(); bgMusic.currentTime = 0;
  isPlaying = false;
  musicFloat.classList.add('paused');
  musicFloat.classList.remove('playing');
  musicBarsEl.classList.add('paused');
  musicIcon.textContent = '🎵';

  setTimeout(() => {
    roseCv.style.transform = '';
    introScr.classList.add('active');
    canOpen = true;
  }, 800);
}

function spawnRipple() {
  const rect = roseCv.getBoundingClientRect();
  const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
  if (!document.getElementById('ripkf')) {
    const s = document.createElement('style');
    s.id = 'ripkf';
    s.textContent = '@keyframes rip{to{transform:translate(-50%,-50%) scale(24);opacity:0}}';
    document.head.appendChild(s);
  }
  const r = document.createElement('div');
  r.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:12px;height:12px;
    border-radius:50%;border:2px solid rgba(255,80,160,.85);
    transform:translate(-50%,-50%) scale(0);animation:rip .9s ease-out forwards;
    pointer-events:none;z-index:9999;`;
  document.body.appendChild(r);
  setTimeout(() => r.remove(), 1000);
}

roseCv.addEventListener('click', openCarta);
roseCv.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' ') openCarta(); });
btnBack.addEventListener('click', closeCarta);

/* ══════════════════════════════════════
   8. MÚSICA
══════════════════════════════════════ */
function tryPlay() {
  // Mismo patrón del proyecto anterior que sí funcionó:
  // NO poner volume=0 antes del play(), eso bloquea Chrome/Live Server
  const promise = bgMusic.play();
  if (promise !== undefined) {
    promise.then(() => {
      isPlaying = true;
      musicFloat.classList.remove('paused');
      musicFloat.classList.add('playing');
      musicIcon.textContent = '🎵';
      musicBarsEl.classList.remove('paused');
      fadeVol(0, 0.55);
    }).catch(() => {
      isPlaying = false;
      musicFloat.classList.add('paused');
      musicBarsEl.classList.add('paused');
    });
  }
}

function fadeVol(from, to) {
  let v = from;
  const step = to > from ? .04 : -.04;
  const iv = setInterval(() => {
    v = Math.min(Math.max(v+step, 0), 1);
    bgMusic.volume = v;
    if (Math.abs(v-to) < .01) { bgMusic.volume = to; clearInterval(iv); }
  }, 120);
}

function toggleMusic() {
  if (isPlaying) {
    bgMusic.pause(); isPlaying = false;
    musicFloat.classList.add('paused');
    musicFloat.classList.remove('playing');
    musicIcon.textContent = '⏸';
    musicBarsEl.classList.add('paused');
  } else { tryPlay(); }
}

musicFloat.addEventListener('click', toggleMusic);
musicBar.addEventListener('click', toggleMusic);

document.addEventListener('touchstart', function ft() {
  if (!isPlaying && cartaScr.classList.contains('active')) tryPlay();
  document.removeEventListener('touchstart', ft);
}, { once:true });

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
function init() {
  resize();
  initSparkles();
  loop();
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();
/* ══════════════════════════════════════
   LIGHTBOX — foto sin detener música
══════════════════════════════════════ */
(function() {
  const btnFoto      = document.getElementById('btn-foto');
  const lightbox     = document.getElementById('lightbox');
  const lightboxBg   = document.getElementById('lightbox-bg');
  const lightboxClose= document.getElementById('lightbox-close');

  function openLightbox() {
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    // La música NO se toca — sigue corriendo sola
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (btnFoto)       btnFoto.addEventListener('click', openLightbox);
  if (lightboxBg)    lightboxBg.addEventListener('click', closeLightbox);
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

  // Cerrar con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
})();