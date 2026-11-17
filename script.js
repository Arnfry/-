/* =========================================================
   A BIRTHDAY FOR AMIL — script.js
   Small, dependency-free modules. Edit CONFIG to customise.
   ========================================================= */

const CONFIG = {
  photoFolder: 'assets/images/',
  photoPrefix: 'photo-',               // photo-01.jpg, photo-02.jpg, ...
  extensions: ['jpg', 'jpeg', 'png', 'webp'],
  maxPhotos: 60,
  // Optional captions by photo number. Anything missing gets "Chapter 01", etc.
  captions: {
    // 1: 'Where it all began',
    // 2: 'Never a dull moment',
  },
  signature: '',                       // e.g. 'Rina'. Leave empty to keep the placeholder.
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad2 = n => String(n).padStart(2, '0');

/* ---------- Toast ---------- */
const Toast = (() => {
  const el = $('#toast'); let t;
  return { show(msg) { el.textContent = msg; el.classList.add('show'); clearTimeout(t); t = setTimeout(() => el.classList.remove('show'), 3800); } };
})();

/* ---------- Scroll reveal ---------- */
const Reveal = (() => {
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15, rootMargin: '0px 0px -6% 0px' })
    : null;
  return { watch(el) { io ? io.observe(el) : el.classList.add('in'); }, scan(root = document) { $$('.reveal:not(.in)', root).forEach(el => this.watch(el)); } };
})();

/* ---------- Parallax (subtle, rAF-throttled) ---------- */
const Parallax = (() => {
  const items = $$('[data-speed]'); let ticking = false;
  const update = () => {
    const vh = innerHeight;
    items.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const offset = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.speed);
      el.style.translate = `0 ${offset.toFixed(1)}px`;
    });
    ticking = false;
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  return { init() { if (reduceMotion) return; addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); update(); } };
})();

/* ---------- Confetti (light, canvas) ---------- */
const Confetti = (() => {
  const canvas = $('#confetti'); const ctx = canvas.getContext('2d');
  const colors = ['#F4E8D0', '#713B43', '#D66B35', '#69734D', '#24221F'];
  let parts = [], raf = null, w = 0, h = 0, dpr = 1;
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  const spawn = n => {
    for (let i = 0; i < n; i++) parts.push({
      x: Math.random() * w, y: -20 - Math.random() * h * .4, vx: (Math.random() - .5) * 1.2, vy: 1.2 + Math.random() * 2.2,
      s: 5 + Math.random() * 6, r: Math.random() * 6.28, vr: (Math.random() - .5) * .14, c: colors[i % colors.length],
      shape: Math.random() < .35 ? 'c' : 'r', sw: Math.random() * 6.28,
    });
  };
  const tick = () => {
    ctx.clearRect(0, 0, w, h);
    parts.forEach(p => {
      p.sw += .05; p.x += p.vx + Math.sin(p.sw) * .6; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.globalAlpha = .92;
      if (p.shape === 'c') { ctx.beginPath(); ctx.arc(0, 0, p.s / 2, 0, 6.28); ctx.fill(); } else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      ctx.restore();
    });
    parts = parts.filter(p => p.y < h + 30);
    if (parts.length) raf = requestAnimationFrame(tick); else { raf = null; ctx.clearRect(0, 0, w, h); }
  };
  return {
    burst(n) {
      if (reduceMotion) return;
      size(); spawn(n || (innerWidth < 600 ? 60 : 110));
      if (!raf) raf = requestAnimationFrame(tick);
    },
    init() { addEventListener('resize', () => { if (parts.length) size(); }); },
  };
})();

/* ---------- Music ---------- */
const Music = (() => {
  const audio = $('#bgm'), btn = $('#musicBtn'); let on = false, warned = false;
  const set = state => { on = state; btn.setAttribute('aria-pressed', String(on)); btn.setAttribute('aria-label', on ? 'Pause music' : 'Play music'); };
  const play = async () => {
    try { await audio.play(); set(true); }
    catch (e) { set(false); if (!warned) { warned = true; Toast.show('Add your song at assets/audio/background.mp3 to hear music.'); } }
  };
  const pause = () => { audio.pause(); set(false); };
  return {
    init() {
      btn.addEventListener('click', () => (on ? pause() : play()));
      audio.volume = .6;
      // Silence the song when the visitor leaves the page or switches tab/app;
      // resume on return only if it was playing before.
      let resumeOnReturn = false;
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) { resumeOnReturn = on; if (on) pause(); }
        else if (resumeOnReturn) { resumeOnReturn = false; play(); }
      });
      addEventListener('pagehide', () => { audio.pause(); });
    },
    start: play,
  };
})();

/* ---------- Navigation ---------- */
const Nav = (() => {
  const nav = $('#nav'), toggle = $('#navToggle'), list = $('#navList');
  const close = () => { list.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open menu'); };
  return {
    show() { nav.hidden = false; },
    init() {
      toggle.addEventListener('click', () => {
        const open = list.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      });
      $$('a', list).forEach(a => a.addEventListener('click', close));
      addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
      // active link
      const links = $$('a', list);
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(es => es.forEach(e => {
          if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
        }), { threshold: .45 });
        ['birthday', 'memories', 'message', 'journey', 'finale'].forEach(id => io.observe($('#' + id)));
      }
    },
  };
})();

/* ---------- Lightbox ---------- */
const Lightbox = (() => {
  const box = $('#lightbox'), img = $('#lbImg'), cap = $('#lbCap'); let list = [], i = 0, opener = null;
  const render = () => { const it = list[i]; img.src = it.src; img.alt = it.alt; cap.textContent = it.caption; img.style.animation = 'none'; void img.offsetWidth; img.style.animation = ''; };
  const open = (items, idx, from) => { list = items; i = idx; opener = from; render(); box.hidden = false; document.body.style.overflow = 'hidden'; $('#lbClose').focus(); };
  const close = () => { box.hidden = true; document.body.style.overflow = ''; opener && opener.focus(); };
  const step = d => { i = (i + d + list.length) % list.length; render(); };
  return {
    open,
    init() {
      $('#lbClose').addEventListener('click', close);
      $('#lbPrev').addEventListener('click', () => step(-1));
      $('#lbNext').addEventListener('click', () => step(1));
      box.addEventListener('click', e => { if (e.target === box || e.target.classList.contains('lb__fig')) close(); });
      addEventListener('keydown', e => {
        if (box.hidden) return;
        if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') step(-1); else if (e.key === 'ArrowRight') step(1);
        else if (e.key === 'Tab') { const f = $$('button', box); const first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
      });
      let sx = null;
      box.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
      box.addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); sx = null; });
    },
  };
})();

/* ---------- Gallery: auto-detects photo-01, photo-02 ... ---------- */
const Gallery = (() => {
  const root = $('#gallery');
  const VARIANTS = ['polaroid', 'magazine', 'film', 'taped', 'stamp'];

  const tryLoad = (n, ext) => new Promise(res => {
    const im = new Image(); const src = `${CONFIG.photoFolder}${CONFIG.photoPrefix}${pad2(n)}.${ext}`;
    im.onload = () => res({ src, w: im.naturalWidth, h: im.naturalHeight }); im.onerror = () => res(null); im.src = src;
  });
  const probe = async n => { for (const ext of CONFIG.extensions) { const r = await tryLoad(n, ext); if (r) return r; } return null; };

  async function discover() {
    const found = []; let misses = 0;
    for (let n = 1; n <= CONFIG.maxPhotos && misses < 2; n++) {
      const r = await probe(n);
      if (r) { found.push({ ...r, n }); misses = 0; } else misses++;
    }
    return found;
  }

  function build(photos) {
    const items = photos.map(p => ({ src: p.src, alt: `Memory ${pad2(p.n)}`, caption: CONFIG.captions[p.n] || `Chapter ${pad2(p.n)}` }));
    const frag = document.createDocumentFragment();
    photos.forEach((p, idx) => {
      const v = VARIANTS[idx % VARIANTS.length];
      const fig = document.createElement('figure'); fig.className = `shot v-${v} reveal`; fig.style.setProperty('--d', `${(idx % 2) * .12}s`);
      const btn = document.createElement('button'); btn.type = 'button'; btn.setAttribute('aria-label', `Open ${items[idx].alt} larger`);
      const frame = document.createElement('div'); frame.className = 'frame'; frame.dataset.no = pad2(idx + 1);
      const img = new Image(); img.src = p.src; img.alt = items[idx].alt; img.loading = 'lazy'; img.decoding = 'async'; img.width = p.w; img.height = p.h;
      const z = document.createElement('span'); z.className = 'zoom'; z.setAttribute('aria-hidden', 'true'); z.textContent = '+';
      frame.append(img, z);
      const cap = document.createElement('figcaption'); cap.textContent = items[idx].caption;
      btn.append(frame); fig.append(btn, cap);
      btn.addEventListener('click', () => Lightbox.open(items, idx, btn));
      frag.append(fig);
    });
    root.replaceChildren(frag);
    Reveal.scan(root);
  }

  return {
    async init() {
      const photos = await discover();
      if (!photos.length) { root.innerHTML = '<p class="gallery__empty">No photos yet — add photo-01.jpg to assets/images/ and refresh.</p>'; return; }
      build(photos);
    },
  };
})();

/* ---------- Journey carousel ---------- */
const Journey = (() => {
  const track = $('#track'), dots = $$('#dots i'); let idx = 0;
  const stops = () => $$('.stop', track);
  const go = i => { const s = stops(); idx = Math.max(0, Math.min(s.length - 1, i)); s[idx].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' }); };
  return {
    init() {
      $('#jPrev').addEventListener('click', () => go(idx - 1));
      $('#jNext').addEventListener('click', () => go(idx + 1));
      track.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); } });
      let t; track.addEventListener('scroll', () => {
        clearTimeout(t); t = setTimeout(() => {
          const c = track.scrollLeft + track.clientWidth / 2; let best = 0, d = 1e9;
          stops().forEach((s, i) => { const m = Math.abs(s.offsetLeft + s.offsetWidth / 2 - c); if (m < d) { d = m; best = i; } });
          idx = best; dots.forEach((el, i) => el.classList.toggle('on', i === idx));
        }, 60);
      }, { passive: true });
    },
  };
})();

/* ---------- Finale ---------- */
const Finale = (() => {
  const sec = $('#finale'), sky = $('#finaleSky'), iris = $('#iris');
  const NS = 'http://www.w3.org/2000/svg';
  const makeSparkles = () => {
    const n = innerWidth < 600 ? 14 : 26;
    for (let i = 0; i < n; i++) {
      const s = document.createElementNS(NS, 'svg'); const u = document.createElementNS(NS, 'use');
      u.setAttribute('href', i % 3 === 0 ? '#flower' : '#star'); s.append(u); s.classList.add('sparkle');
      const sz = 14 + Math.random() * 30;
      s.style.cssText = `left:${Math.random() * 96}%;top:${10 + Math.random() * 80}%;width:${sz}px;height:${sz}px;--t:${7 + Math.random() * 6}s;--dl:${Math.random() * 6}s`;
      if (i % 3 === 0) s.style.setProperty('--core', '#713B43');
      sky.append(s);
    }
  };
  let played = false;
  return {
    init() {
      makeSparkles();
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((es, o) => es.forEach(e => {
          if (e.isIntersecting && !played) { played = true; setTimeout(() => sec.classList.add('fading'), 6500); }
        }), { threshold: .5 }).observe(sec);
      } else sec.classList.add('fading');
      $('#replayBtn').addEventListener('click', () => {
        iris.classList.remove('close'); void iris.offsetWidth; iris.classList.add('close');
        setTimeout(() => {
          sec.classList.remove('fading'); played = false;
          $$('.reveal', sec).forEach(el => { el.classList.remove('in'); Reveal.watch(el); });
          scrollTo({ top: $('#birthday').offsetTop, behavior: 'instant' });
          iris.classList.remove('close');
        }, 1300);
      });
    },
  };
})();

/* ---------- Intro / page lock ---------- */
const Intro = (() => {
  const body = document.body, curtain = $('#curtain');
  return {
    init() {
      $('#enterBtn').addEventListener('click', () => {
        Music.start();
        if (!reduceMotion) { curtain.classList.remove('run'); void curtain.offsetWidth; curtain.classList.add('run'); }
        setTimeout(() => {
          body.classList.remove('is-locked'); Nav.show();
          $('#birthday').scrollIntoView({ behavior: 'instant' });
          Confetti.burst();
          const h = $('#bdayTitle'); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true });
        }, reduceMotion ? 0 : 520);
      });
      $('#confettiBtn').addEventListener('click', () => Confetti.burst(160));
      // if the page is reloaded mid-way, start at the intro
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      scrollTo(0, 0);
    },
  };
})();

/* ---------- Personal touches ---------- */
function applyPersonalisation() {
  if (CONFIG.signature) { const s = $('#letterSign span'); if (s) s.textContent = CONFIG.signature; $('.placeholder-note')?.remove(); }
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  Reveal.scan();
  Nav.init(); Music.init(); Lightbox.init(); Journey.init(); Finale.init(); Confetti.init(); Parallax.init(); Intro.init();
  applyPersonalisation();
  Gallery.init();
});
