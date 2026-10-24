/* ---------- helpers ---------- */
const Q = (s, r = document) => r.querySelector(s);
const QA = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const pad = n => String(n).padStart(2, '0');
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
const mouse = { x: innerWidth * .66, y: innerHeight * .45, nx: .3, ny: 0, last: 0 };
addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.last = performance.now(); }, { passive: true });
function toast(msg) { const t = Q('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), 1800); }

