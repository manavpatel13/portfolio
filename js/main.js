/* ---------- cursor label (native colored cursor lives in CSS) ---------- */
const cursor = (() => {
  if (!FINE) return { tick() {} };
  const lab = Q('#curLabel');
  document.addEventListener('pointerover', e => {
    const l = e.target.closest('[data-cursor]');
    if (l) { lab.textContent = l.dataset.cursor; lab.classList.add('on'); } else lab.classList.remove('on');
  });
  return { tick() { lab.style.transform = `translate3d(${mouse.x + 18}px,${mouse.y + 20}px,0)`; } };
})();

/* ---------- smooth scroll (Lenis) ---------- */
const lenis = (typeof Lenis !== 'undefined' && FINE && !RM) ? new Lenis({ lerp: .1 }) : null;
function scrollToY(y) {
  if (lenis) lenis.scrollTo(y, { duration: 1.5, easing: t => 1 - Math.pow(1 - t, 4) });
  else scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
}

/* ---------- smooth anchors, menu, magnetic buttons ---------- */
function goTo(id) {
  const el = Q(id === '#top' ? '#top' : id); if (!el) return;
  const y = id === '#top' ? 0 : el.getBoundingClientRect().top + scrollY;
  scrollToY(y);
}
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]'); if (!a || a.getAttribute('target') === '_blank') return;
  const id = a.getAttribute('href'); if (id.length < 2) return;
  e.preventDefault(); closeMenu(); goTo(id);
});
const sheet = Q('#sheet'), menuBtn = Q('#menuBtn');
function closeMenu() { sheet.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.textContent = 'MENU'; document.body.style.overflow = ''; if (lenis) lenis.start(); }
menuBtn.addEventListener('click', () => {
  const o = !sheet.classList.contains('open'); sheet.classList.toggle('open', o);
  menuBtn.setAttribute('aria-expanded', String(o)); menuBtn.textContent = o ? 'CLOSE' : 'MENU'; document.body.style.overflow = o ? 'hidden' : ''; if (lenis) (o ? lenis.stop() : lenis.start());
});
function magnetize(root) {
  if (!FINE) return;
  QA('.mag', root).forEach(el => {
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .28}px,${(e.clientY - r.top - r.height / 2) * .4}px)`; });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}
magnetize(document);
QA('.js-resume').forEach(a => { if (CONFIG.resumeUrl) a.href = CONFIG.resumeUrl; });

/* ---------- hero reactive radar grid ---------- */
const grid = (() => {
  const cv = Q('#grid'), g = cv.getContext('2d'), SP = 36; let W = 0, H = 0, vis = true, gx = 0, gy = 0, init = false;
  function rs() { const dpr = Math.min(devicePixelRatio, 2), r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); if (!init) { gx = W * .66; gy = H * .45; init = true; } }
  rs(); addEventListener('resize', rs);
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(cv);
  g.font = '10px "JetBrains Mono",monospace';
  return { tick(t) {
    if (!vis) return;
    const r = cv.getBoundingClientRect();
    gx = lerp(gx, mouse.x - r.left, .12); gy = lerp(gy, mouse.y - r.top, .12);
    g.clearRect(0, 0, W, H);
    const cols = Math.ceil(W / SP) + 1, rows = Math.ceil(H / SP) + 1;
    g.fillStyle = 'rgba(255,255,255,.1)';
    const near = [];
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const x = i * SP, y = j * SP, dx = x - gx, dy = y - gy, d = Math.hypot(dx, dy), f = Math.max(0, 1 - d / 250);
      if (f < .04) { g.fillRect(x - .7, y - .7, 1.4, 1.4); continue; }
      const push = f * f * 24, ux = d ? dx / d : 0, uy = d ? dy / d : 0;
      near.push(x + ux * push, y + uy * push, f, Math.sin(d * .03 - t * .004) * .5 + .5);
    }
    for (let k = 0; k < near.length; k += 4) {
      const f = near[k + 2], s = 1.4 + f * 3, a = .15 + f * .7 + near[k + 3] * .12 * f;
      g.fillStyle = `rgba(255,${91 + Math.round(f * 70)},20,${a.toFixed(3)})`; g.fillRect(near[k] - s / 2, near[k + 1] - s / 2, s, s);
    }
    g.strokeStyle = 'rgba(255,91,20,.22)'; g.lineWidth = 1; g.beginPath();
    g.moveTo(0, gy); g.lineTo(W, gy); g.moveTo(gx, 0); g.lineTo(gx, H); g.stroke();
    g.fillStyle = 'rgba(255,91,20,.8)';
    g.fillText(`X ${String(Math.round(gx)).padStart(4, '0')}  Y ${String(Math.round(gy)).padStart(4, '0')}`, Math.min(gx + 10, W - 110), Math.max(gy - 8, 14));
  } };
})();

const heroV = safeViewer(Q('#heroCv'), 'hero', { hero: true, glb: CONFIG.models.suas, rot: CONFIG.modelRotation.suas, plain: CONFIG.plain.suas, fitR: 3.2 });
if (!heroV) Q('.hero-3d').hidden = true;

/* ---------- projects ---------- */
const workEl = Q('#work'), track = Q('#workTrack'), introP = Q('#introP');
const projViewers = [];
(function renderProjects() {
  const idx = Q('#idx'), pn = Q('#wPn');
  PROJECTS.forEach((p, i) => {
    const mets = p.mets ? `<div class="mets">${p.mets.map(m => m.t
      ? `<div class="met"><b class="t">${m.t}</b><span>${m.l}</span></div>`
      : `<div class="met"><b><span data-n="${m.n}"${m.d ? ` data-d="${m.d}"` : ''}>${m.n}</span>${m.s}</b><span>${m.l}</span></div>`).join('')}</div>`
      : `<div class="flow">${p.flow.map(f => `<div>${f}</div>`).join('')}</div>`;
    const el = document.createElement('article'); el.className = 'pj'; el.id = 'pj-' + p.key;
    el.innerHTML = `
      <div class="pj-num" aria-hidden="true">${pad(i + 1)}</div>
      <div class="pj-copy">
        <div class="pj-meta"><span class="tag ${p.tc}">${p.tag}</span><span class="mono pj-date">${p.date}</span></div>
        <h3>${p.title}</h3><div class="pj-sub">${p.sub}</div><p class="pj-role">${p.role}</p>
        <p class="pj-desc">${p.desc}</p>${mets}
        <div class="stack">${p.stack.map(s => `<span class="chip">${s}</span>`).join('')}</div>
        <div class="links-row">${p.links.map(l => `<a class="btn" href="${l[1]}" target="_blank" rel="noopener">${l[0]}</a>`).join('')}</div>
      </div>
      <div class="pj-view"><div class="vw" data-key="${p.key}">
        <div class="vw-bar">
          <div class="seg" role="group" aria-label="View mode"><button data-m="model" aria-pressed="true">3D model</button><button data-m="video" aria-pressed="false">Flight video</button></div>
          <div class="tools"><label class="tool swatch" title="Change drone color"><input type="color" value="#c9ccd1" aria-label="Drone color"><span>Color</span></label><button class="tool" data-a="creset" title="Original colors">Reset</button><button class="tool zbtn" data-a="zin" aria-label="Zoom in" title="Zoom in">+</button><button class="tool zbtn" data-a="zout" aria-label="Zoom out" title="Zoom out">&minus;</button><button class="tool" data-a="wire" aria-pressed="false">Wireframe</button><button class="tool" data-a="spin" aria-pressed="true">Spin</button></div>
        </div>
        <div class="vw-stage" data-cursor="DRAG"><canvas></canvas><div class="vw-note" hidden><b>Video not loaded</b><span>Set CONFIG.videos.${p.key} to your own .mp4 file or URL.</span></div>
          <span class="vw-corner a">${p.corner}</span><span class="vw-corner b">Drag to rotate</span><span class="vw-corner c">Scroll also turns it</span></div>
      </div></div>`;
    track.appendChild(el);
    const b = document.createElement('button'); b.innerHTML = `<span>${pad(i + 1)}</span>${p.title}`; b.addEventListener('click', () => jumpTo(i + 1)); idx.appendChild(b);
    const c = document.createElement('button'); c.textContent = i + 1; c.setAttribute('aria-label', 'Go to ' + p.title); c.addEventListener('click', () => jumpTo(i + 1)); pn.appendChild(c);
    // viewer
    const vw = Q('.vw', el), stage = Q('.vw-stage', vw), cv = Q('canvas', stage), note = Q('.vw-note', stage);
    const v = safeViewer(cv, p.kind, {
      orbit: true, fitR: p.kind === 'swarm' ? 2.9 : 2.5, plain: CONFIG.plain[p.key], glb: CONFIG.models[p.key], rot: CONFIG.modelRotation[p.key], copies: p.kind === 'swarm' ? 4 : 1,
      onReady: vv => { if (CONFIG.models[p.key] && vv.loadedFrom !== 'glb') Q('.vw-corner.a', vw).textContent = location.protocol === 'file:' ? 'Open the site through a local server, not file://' : 'Model failed: ' + String(vv.loadError || 'not found').slice(0, 80); }
    });
    if (!v) { note.hidden = false; Q('b', note).textContent = '3D not available'; Q('span', note).textContent = 'WebGL is disabled in this browser.'; }
    projViewers.push(v);
    QA('.seg button', vw).forEach(btn => btn.addEventListener('click', () => {
      const vid = btn.dataset.m === 'video'; QA('.seg button', vw).forEach(x => x.setAttribute('aria-pressed', String(x === btn)));
      let video = Q('video', stage);
      if (vid) {
        if (!video) {
          const url = CONFIG.videos[p.key];
          if (!url) { note.hidden = false; } else {
            video = document.createElement('video'); video.src = url; video.muted = true; video.loop = true; video.playsInline = true; video.controls = true; video.preload = 'metadata';
            video.addEventListener('error', async () => {
              note.hidden = false; const b = Q('b', note), s = Q('span', note); b.textContent = 'Video not loaded';
              if (location.protocol === 'file:') { s.textContent = 'Open the site through a local server (not file://) for videos to play.'; return; }
              try { const r = await fetch(url, { method: 'HEAD' }); s.textContent = r.ok ? 'Found "' + url + '" but this browser cannot play it. Re-export as 8-bit H.264 (yuv420p) + AAC with fast-start (see README). Browser says: ' + ((video.error && video.error.message) || ('error code ' + (video.error && video.error.code))) : 'File not found (' + r.status + ') at "' + url + '". Check the videos folder location, file name and spelling.'; }
              catch (e) { s.textContent = 'Could not reach "' + url + '".'; }
            }); video.addEventListener('loadeddata', () => { note.hidden = true; }); stage.insertBefore(video, note);
          }
        }
        cv.hidden = true; if (v) v.paused = true; if (video) { video.hidden = false; const pr = video.play(); if (pr && pr.catch) pr.catch(() => {}); }
      } else {
        cv.hidden = false; if (v) v.paused = false; note.hidden = true; if (video) { video.pause(); video.hidden = true; } if (v) v.resize();
      }
    }));
    const cin = Q('input[type=color]', vw);
    cin.addEventListener('input', () => { if (v) v.setColor(parseInt(cin.value.slice(1), 16)); });
    QA('.tool', vw).forEach(btn => btn.addEventListener('click', () => {
      if (btn.dataset.a === 'creset') { if (v) v.setColor(null); return; }
      if (btn.classList.contains('swatch')) return;
      if (btn.dataset.a === 'zin' || btn.dataset.a === 'zout') { if (v) v.zoom(btn.dataset.a === 'zin' ? .8 : 1.25); return; }
      const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', String(on)); if (!v) return;
      if (false) v.setExplode(on); else if (btn.dataset.a === 'wire') v.setWire(on); else v.setSpin(on);
    }));
  });
  QA('.pj', track).forEach(el => magnetize(el));
})();

/* pinned horizontal run */
let pinned = false, range = 0, pos = 0;
const panels = () => [introP, ...QA('.pj', track)];
function layoutWork() {
  const want = innerWidth >= 1000 && innerHeight >= 640;
  workEl.classList.toggle('pinned', want); pinned = want;
  if (want) { range = (panels().length - 1) * innerWidth; workEl.style.height = (range + innerHeight) + 'px'; }
  else { workEl.style.height = ''; track.style.transform = ''; }
}
function jumpTo(i) {
  const n = panels().length;
  if (pinned) scrollToY(workEl.getBoundingClientRect().top + scrollY + (i / (n - 1)) * (workEl.offsetHeight - innerHeight));
  else scrollToY(panels()[i].getBoundingClientRect().top + scrollY);
}
layoutWork(); addEventListener('resize', layoutWork);
const wCnt = Q('#wCnt'), wProg = Q('#wProg'), wBtns = QA('#wPn button');
function workFX() {
  const ps = panels(), n = ps.length;
  if (pinned) {
    const r = workEl.getBoundingClientRect(), p = clamp(-r.top / Math.max(1, workEl.offsetHeight - innerHeight), 0, 1);
    track.style.transform = `translate3d(${(-p * range).toFixed(1)}px,0,0)`; pos = p * (n - 1);
    wProg.style.setProperty('--p', p.toFixed(4));
    const act = Math.round(pos); wCnt.textContent = `${pad(Math.max(act, 0))} / ${pad(n - 1)}`; wBtns.forEach((b, i) => b.classList.toggle('on', i + 1 === act));
    ps.forEach((el, i) => { const num = Q('.pj-num', el); if (num) num.style.transform = `translate3d(${((i - pos) * -170).toFixed(1)}px,0,0)`; });
    projViewers.forEach((v, i) => { if (v) v.phase = (i + 1) - pos; });
  } else {
    projViewers.forEach((v, i) => { if (!v) return; const el = ps[i + 1], r = el.getBoundingClientRect(); v.phase = clamp((r.top + r.height / 2 - innerHeight / 2) / innerHeight, -1.5, 1.5) * -1; });
  }
}

/* ---------- about interactions ---------- */
const TABS = [
  '<p>Third-year <strong>BTech Computer Science</strong> student at Nirma University, Ahmedabad (CGPA 9.12/10). Captain and Software Lead of <strong>Team Arrow ITNU</strong>, the university’s competitive aerial robotics team.</p>',
  '<p>My work sits between autonomous systems, computer vision and machine learning. The systems I build <strong>navigate without GPS</strong>, <strong>detect objects in real time</strong> on embedded hardware, and <strong>coordinate in formations</strong> without central control.</p>',
  '<p>Every project is built to compete and fly in real conditions, not to sit in a lab demo. The IRoC-U build alone went through <strong>50+ autonomous flight test runs</strong> before it won nationals.</p>',
  '<p>I am looking for <strong>graduate research</strong> in AI, machine learning and autonomous robotics, and <strong>research internships for Summer 2027</strong> (May to July). If your lab works on this, let’s talk.</p>'
];
(function about() {
  const tb = Q('#tabbody'), btns = QA('#tabs button'), ind = Q('#tabInd');
  function setInd() { const b = Q('#tabs button[aria-selected=true]'); ind.style.left = b.offsetLeft + 'px'; ind.style.width = (b.offsetWidth - parseFloat(getComputedStyle(b).paddingRight)) + 'px'; }
  function sel(i) { btns.forEach((b, j) => b.setAttribute('aria-selected', String(i === j))); tb.innerHTML = TABS[i]; setInd(); }
  btns.forEach((b, i) => b.addEventListener('click', () => sel(i)));
  sel(0); document.fonts && document.fonts.ready.then(setInd); addEventListener('resize', setInd);
  const card = Q('#idcard');
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.transform = `rotateY(${(x - .5) * 24}deg) rotateX(${(.5 - y) * 24}deg)`;
    card.style.setProperty('--gx', x * 100 + '%'); card.style.setProperty('--gy', y * 100 + '%'); card.style.setProperty('--go', '1');
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; card.style.setProperty('--go', '0'); });
  const flip = () => card.classList.toggle('flipped');
  card.addEventListener('click', e => { if (!e.target.closest('a')) flip(); });
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
})();

/* scroll-scrubbed statement */
const scrub = (() => {
  const el = Q('#scrub'), keys = (el.dataset.k || '').split(',').map(s => s.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map(w => `<span class="w${keys.includes(w.toLowerCase().replace(/[^a-z0-9]/g, '')) ? ' k' : ''}">${w}</span>`).join(' ');
  const spans = QA('.w', el);
  return { tick() {
    const r = el.getBoundingClientRect(), p = clamp((innerHeight * .88 - r.top) / (r.height + innerHeight * .25), 0, 1), n = Math.round(p * spans.length * 1.1);
    spans.forEach((s, i) => s.classList.toggle('on', i < n));
  } };
})();

/* ---------- skills ---------- */
(function skills() {
  const grid = Q('#skGrid'), fl = Q('#filters');
  const filters = [['all', 'All']].concat(Object.entries(GROUPS));
  fl.innerHTML = filters.map(([k, l], i) => `<button data-f="${k}" aria-pressed="${i === 0}">${l}</button>`).join('');
  grid.innerHTML = SK.map((s, i) => `<div class="sk" data-g="${s[2]}" style="--d:${(i % 12) * 0.03}s"><div class="logo-w">${logoOrMono(s)}</div><div class="nm">${s[0]}</div><div class="use">${s[3].length ? 'Used in ' + s[3].join(' · ') : GROUPS[s[2]]}</div></div>`).join('');
  QA('.sk', grid).forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%');
      el.style.transform = `rotateY(${(x - .5) * 22}deg) rotateX(${(.5 - y) * 22}deg)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
  fl.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    QA('button', fl).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    let k = 0; QA('.sk', grid).forEach(el => {
      const show = b.dataset.f === 'all' || el.dataset.g === b.dataset.f; el.hidden = !show;
      if (show) { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; el.style.setProperty('--d', (k++ % 12) * .03 + 's'); }
    });
  });
})();

/* ---------- marquees ---------- */
const marquees = QA('.mq').map(mq => {
  const inn = Q('.mq-in', mq), dir = +mq.dataset.dir || 1, base = inn.innerHTML; let x = 0, w0 = 0;
  function measure() { inn.innerHTML = base; w0 = inn.scrollWidth; let c = 1; while (inn.scrollWidth < innerWidth * 2 + w0 && c < 8) { inn.innerHTML += base; c++; } }
  measure(); addEventListener('resize', measure); document.fonts && document.fonts.ready.then(measure);
  return { tick(vel) {
    if (!w0) return; x -= dir * (RM ? 0 : .8) + vel * .5 * dir;
    if (x <= -w0) x += w0; if (x > 0) x -= w0;
    inn.style.transform = `translate3d(${x.toFixed(1)}px,0,0) skewX(${clamp(-vel * .35 * dir, -9, 9).toFixed(2)}deg)`;
  } };
});

/* ---------- contact: repelling letters, copy, clock ---------- */
const contactFX = (() => {
  QA('#cx .row').forEach(row => { row.innerHTML = Array.from(row.dataset.t).map(c => c === ' ' ? '<span class="sp"></span>' : `<span class="ch">${c}</span>`).join(''); });
  const chars = QA('#cx .ch').map(el => ({ el, x: 0, y: 0, r: 0 })); let vis = false;
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(Q('#cx'));
  return { tick() {
    if (!vis) return;
    const rects = chars.map(c => c.el.getBoundingClientRect());
    chars.forEach((c, i) => {
      const r = rects[i], cx = r.left + r.width / 2 - c.x, cy = r.top + r.height / 2 - c.y, dx = cx - mouse.x, dy = cy - mouse.y, d = Math.hypot(dx, dy) || 1;
      const f = FINE || mouse.last ? clamp(1 - d / 220, 0, 1) : 0, f2 = f * f;
      c.x = lerp(c.x, dx / d * f2 * 70, .18); c.y = lerp(c.y, dy / d * f2 * 70, .18); c.r = lerp(c.r, (dx > 0 ? 1 : -1) * f2 * 14, .18);
      c.el.style.transform = `translate3d(${c.x.toFixed(1)}px,${c.y.toFixed(1)}px,0) rotate(${c.r.toFixed(1)}deg)`;
    });
  } };
})();
Q('#copyMail').addEventListener('click', async () => {
  const txt = Q('#mailTxt').textContent;
  try { await navigator.clipboard.writeText(txt); toast('Email copied'); }
  catch (e) { const r = document.createRange(); r.selectNodeContents(Q('#mailTxt')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast('Press Ctrl/Cmd + C to copy'); }
});
const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
const clockEl = Q('#clock'); setInterval(() => { clockEl.textContent = fmt.format(new Date()); }, 1000); clockEl.textContent = fmt.format(new Date());

/* ---------- achievements: stacked cards, each with its own 3D airframe ---------- */
/* Each model reacts to scroll (phase: +1 arriving, 0 on screen, -1 covered by the next card) and to the cursor over the card. */
function cardCursor(v) {
  const r = v.canvas.getBoundingClientRect(), s = v.cur || (v.cur = { x: 0, y: 0 });
  s.x = lerp(s.x, clamp((mouse.x - (r.left + r.width / 2)) / (r.width / 2), -1.4, 1.4), .08);
  s.y = lerp(s.y, clamp((mouse.y - (r.top + r.height / 2)) / (r.height / 2), -1.4, 1.4), .08);
  return s;
}
const ACH_MOTION = {
  plane(v, p) { const st = v.stage, c = cardCursor(v);   /* fly-by: sweeps in from the right, banks, exits left */
    st.position.x = p * 2.6; st.position.y += Math.sin(p * 3) * .3 - Math.abs(p) * .4;
    st.rotation.y = -.55 + p * .9 + c.x * .55; st.rotation.z = -p * .75 - c.x * .12; st.rotation.x = .1 + Math.abs(p) * .2 + c.y * .22; },
  quad(v, p) { const st = v.stage, c = cardCursor(v);    /* lift-off: climbs while spinning up through the card */
    st.position.y += -p * 2.3; st.rotation.y = -p * 2.6 + c.x * .6; st.rotation.x = .12 + Math.sin(p * 2) * .25 + c.y * .28; st.rotation.z = -c.x * .12; },
  swarm(v, p) { const st = v.stage, c = cardCursor(v);   /* formation breaks apart and regroups (see exDriver) */
    st.position.x = p * 1.4; st.rotation.y = -p * 1.6 + c.x * .7; st.rotation.x = .16 + c.y * .3; st.rotation.z = -c.x * .1; }
};
const achEls = [], achViewers = [], achList = Q('#achList'), stackMQ = matchMedia('(min-width:1000px) and (min-height:700px)');
(function renderAch() {
  ACH.forEach((a, i) => {
    const el = document.createElement('article'); el.className = 'ach t-' + a.theme; el.id = 'ach-' + i;
    el.innerHTML = `<div class="ach-in"><div class="ach-bg" aria-hidden="true">${a.big}</div>
      <div class="ach-top"><span class="tag">${a.tag}</span><span class="mono">${a.year}</span></div>
      <div class="ach-grid"><div class="ach-main">
        <div class="ach-rank"><span class="pre">${a.pre}</span><span${a.rank > 1 ? ` data-n="${a.rank}"` : ''}>${a.rank}</span></div>
        <h3>${a.title}</h3><p class="full">${a.full}</p><p class="mono where">${a.where}</p><p class="role">${a.role}</p>
        <div class="ach-facts">${a.facts.map(f => `<div><b>${f[0]}</b><span>${f[1]}</span></div>`).join('')}</div>
        <button class="btn" data-proj="${a.proj}">See the airframe</button></div>
        <div class="ach-field" data-cursor="DRAG"><canvas aria-label="3D model of the ${a.title} airframe. Drag to rotate."></canvas><div class="ach-cap mono">${a.cap}</div></div></div>
      <div class="ach-dim"></div></div>`;
    achList.appendChild(el); achEls.push(el);
    achViewers.push(safeViewer(Q('canvas', el), a.kind, {
      orbit: true, still: true, fitR: a.kind === 'swarm' ? 2.8 : 2.25, plain: CONFIG.plain[a.model], glb: CONFIG.models[a.model], rot: CONFIG.modelRotation[a.model], copies: a.kind === 'swarm' ? 4 : 1,
      ring: a.theme === 'orange' ? 0x0a0a0a : undefined, motion: ACH_MOTION[a.motion],
      exDriver: a.kind === 'swarm' ? p => Math.min(1, Math.abs(p) * 1.2) : null
    }));
  });
  achList.addEventListener('click', e => { const b = e.target.closest('[data-proj]'); if (b) jumpTo(+b.dataset.proj); });
  magnetize(achList);
})();
function achFX() {
  const vh = innerHeight, stack = stackMQ.matches, lr = achList.getBoundingClientRect();
  achEls.forEach((el, i) => {
    const inn = Q('.ach-in', el), bg = Q('.ach-bg', el), dim = Q('.ach-dim', el), v = achViewers[i], er = el.getBoundingClientRect();
    bg.style.setProperty('--bx', (stack ? (i * vh + lr.top) * .5 : (er.top - vh / 2) * -.3).toFixed(0) + 'px');
    let phase, covered = false;
    if (stack) {
      const arrive = clamp(er.top / vh, 0, 1); let leave = 0;
      if (i < achEls.length - 1) { const r = clamp(achEls[i + 1].getBoundingClientRect().top / vh, 0, 1); leave = 1 - r; covered = r <= .002; inn.style.transform = `scale(${(1 - (1 - r) * .07).toFixed(4)})`; dim.style.opacity = ((1 - r) * .75).toFixed(3); }
      else { inn.style.transform = ''; dim.style.opacity = 0; }
      phase = arrive - leave;
    } else { inn.style.transform = ''; dim.style.opacity = 0; phase = clamp((er.top + er.height / 2 - vh / 2) / vh, -1, 1); }
    if (v) { v.phase = phase; v.paused = covered; }
  });
}

/* ---------- reveal + counters ---------- */
function fmtNum(v, d) { return d ? v.toFixed(d) : String(Math.round(v)); }
(function revealAndCount() {
  const inView = el => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 && r.left < innerWidth && r.right > 0; };
  if (!RM && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('rv-h'); io.unobserve(e.target); } }), { threshold: .12 });
    QA('.rv').forEach(el => { if (!inView(el)) { el.classList.add('rv-h'); io.observe(el); } });
    const co = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; co.unobserve(e.target);
      const el = e.target, n = +el.dataset.n, d = +el.dataset.d || 0, t0 = performance.now();
      (function step(t) { const k = clamp((t - t0) / 1400, 0, 1), v = n * (1 - Math.pow(1 - k, 4)); el.textContent = fmtNum(v, d); if (k < 1) requestAnimationFrame(step); })(t0);
    }), { threshold: .6 });
    QA('[data-n]').forEach(el => { if (!inView(el)) { el.textContent = fmtNum(0, +el.dataset.d || 0); co.observe(el); } else el.textContent = fmtNum(+el.dataset.n, +el.dataset.d || 0); });
  } else QA('[data-n]').forEach(el => { el.textContent = fmtNum(+el.dataset.n, +el.dataset.d || 0); });
})();

/* ---------- master loop ---------- */
const nav = Q('#nav'), bar = Q('#bar'), h1 = Q('#h1'), heroEl = Q('#top'), toTop = Q('#toTop'), ring = Q('#toTop .ring'), bgA = Q('#bgA'), bgB = Q('#bgB');
toTop.addEventListener('click', () => scrollToY(0));
const secs = QA('[data-sec]'), navLinks = QA('[data-nav]'), sxEls = QA('[data-sx]').map(el => ({ el, par: el.parentElement }));
const tlEl = Q('#tl'), tlItems = QA('.tl-item', tlEl);
const hAlt = Q('#hAlt'), hRoll = Q('#hRoll'), hPitch = Q('#hPitch'), hHdg = Q('#hHdg');
let sy = scrollY, vel = 0, curSec = '', last = performance.now(), hudT = 0;
const sgn = (v, n) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1).padStart(n, '0');
function frame(now) {
  requestAnimationFrame(frame);
  if (lenis) lenis.raf(now);
  const dt = Math.min(.05, (now - last) / 1000); last = now; const t = now / 1000;
  const y = scrollY; vel = lerp(vel, y - sy, .15); sy = y;
  if (!FINE && now - mouse.last > 2500) { mouse.x = innerWidth * (.55 + .22 * Math.sin(now * .0006)); mouse.y = innerHeight * (.42 + .18 * Math.cos(now * .0008)); }
  mouse.nx = (mouse.x / innerWidth - .5) * 2; mouse.ny = (mouse.y / innerHeight - .5) * 2;
  cursor.tick();
  const docH = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  bar.style.transform = `scaleX(${clamp(y / docH, 0, 1).toFixed(4)})`; nav.classList.toggle('solid', y > 40);
  let act = 'top'; secs.forEach(s => { const r = s.getBoundingClientRect(); if (r.top < innerHeight * .45 && r.bottom > innerHeight * .45) act = s.dataset.sec; });
  if (act !== curSec) { curSec = act; navLinks.forEach(a => a.classList.toggle('on', a.dataset.nav === act)); }
  const hp = clamp(y / heroEl.offsetHeight, 0, 1);
  h1.style.transform = `translate3d(${(-mouse.nx * 14).toFixed(1)}px,${(y * .22).toFixed(1)}px,0)`;
  if (heroV) heroV.scrollP = hp;
  sxEls.forEach(({ el, par }) => { const r = par.getBoundingClientRect(); if (r.bottom < -200 || r.top > innerHeight + 200) return; el.style.transform = `translate3d(${((r.top - innerHeight * .5) * parseFloat(el.dataset.sx)).toFixed(1)}px,0,0)`; });
  scrub.tick();
  const tr = tlEl.getBoundingClientRect(); tlEl.style.setProperty('--p', clamp((innerHeight * .65 - tr.top) / tr.height, 0, 1).toFixed(3));
  tlItems.forEach(it => it.classList.toggle('on', it.getBoundingClientRect().top < innerHeight * .68));
  if (y > 320 && vel > 1.5 && !sheet.classList.contains('open')) nav.classList.add('hide'); else if (vel < -1.5 || y <= 320) nav.classList.remove('hide');
  toTop.classList.toggle('on', y > innerHeight * .8); ring.style.strokeDashoffset = (138.23 * (1 - clamp(y / docH, 0, 1))).toFixed(1);
  bgA.style.transform = `translate3d(${(mouse.nx * 50 + Math.sin(y / 1100) * 140).toFixed(0)}px,${(Math.cos(y / 1500) * 180).toFixed(0)}px,0)`;
  bgB.style.transform = `translate3d(${(-mouse.nx * 40 + Math.cos(y / 900) * 120).toFixed(0)}px,${(Math.sin(y / 1300) * 160).toFixed(0)}px,0)`;
  achFX();
  workFX();
  grid.tick(now);
  marquees.forEach(m => m.tick(vel));
  contactFX.tick();
  for (const v of viewers) if (v.visible && !v.paused) v.tick(dt, t);
  if (heroV && heroV.model && now - hudT > 90) {
    hudT = now; const st = heroV.stage;
    hAlt.textContent = (12.4 + Math.sin(t * 1.3) * .6 + hp * 40).toFixed(1).padStart(5, '0');
    hRoll.textContent = sgn(-st.rotation.z * 57.3, 4); hPitch.textContent = sgn(st.rotation.x * 57.3, 4);
    hHdg.textContent = String(Math.round(((st.rotation.y * 57.3) % 360 + 360) % 360)).padStart(3, '0');
  }
}
requestAnimationFrame(frame);
