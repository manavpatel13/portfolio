/* ---------- 3D: procedural placeholder airframes + GLB loading ---------- */
const THREE_OK = typeof THREE !== 'undefined';
function mats() {
  const S = (c, r, m, x) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r, metalness: m }, x || {}));
  return { carbon: S(0x1c1b1a, .5, .35), carbon2: S(0x2e2c2a, .45, .4), alu: S(0xa3a6ab, .3, .85), orange: S(0xff5b14, .42, .15, { emissive: 0x3a1200 }),
    white: S(0xe9e6e1, .5, .1), glass: S(0x6a8cff, .15, .7, { transparent: true, opacity: .55 }), prop: S(0xd9d6d1, .6, .1),
    disc: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .07, side: THREE.DoubleSide, depthWrite: false }) };
}
const mk = (geo, m, p, r) => { const o = new THREE.Mesh(geo, m); if (p) o.position.set(p[0], p[1], p[2]); if (r) o.rotation.set(r[0], r[1], r[2]); return o; };
const BX = (w, h, d, m, p, r) => mk(new THREE.BoxGeometry(w, h, d), m, p, r);
const CY = (rt, rb, h, m, p, r, s) => mk(new THREE.CylinderGeometry(rt, rb, h, s || 24), m, p, r);
const V3 = a => new THREE.Vector3(a[0], a[1], a[2]).normalize();

function buildQuad(m, o = {}) {
  const root = new THREE.Group(), parts = [], spin = [], arm = o.arm || 1.5;
  const add = (g, dir, w) => { root.add(g); parts.push({ o: g, dir: V3(dir), w: w || 1 }); };
  const body = new THREE.Group();
  body.add(BX(.9, .2, .9, m.carbon), BX(.7, .05, .7, m.carbon2, [0, .125, 0]), BX(.12, .052, .7, m.orange, [0, .126, 0]), BX(.5, .03, .5, m.carbon2, [0, -.11, 0]));
  add(body, [0, 1, 0], .5);
  const bat = new THREE.Group(); bat.add(BX(.6, .16, .32, m.orange, [0, -.22, 0]), BX(.62, .02, .34, m.carbon, [0, -.15, 0])); add(bat, [0, -1, 0], .7);
  [45, 135, 225, 315].forEach((a, i) => {
    const g = new THREE.Group(), rad = a * Math.PI / 180; g.rotation.y = rad;
    g.add(BX(arm, .06, .11, m.carbon2, [arm / 2, 0, 0]), CY(.12, .12, .14, m.alu, [arm, .08, 0]), CY(.128, .128, .025, m.orange, [arm, .16, 0]));
    const p = new THREE.Group(); p.position.set(arm, .21, 0);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(.5, 32), m.disc); disc.rotation.x = -Math.PI / 2;
    p.add(BX(.95, .012, .07, m.prop), disc); g.add(p);
    if (o.guards) {
      const t = new THREE.Mesh(new THREE.TorusGeometry(.58, .022, 8, 48), m.carbon2); t.rotation.x = Math.PI / 2; t.position.set(arm, .12, 0);
      g.add(t, BX(1.16, .025, .03, m.carbon2, [arm, .12, 0]), BX(.03, .025, 1.16, m.carbon2, [arm, .12, 0]));
    }
    spin.push({ o: p, axis: 'y', s: (i % 2 ? 1 : -1) * 40 });
    add(g, [Math.cos(rad), .25, -Math.sin(rad)], 1);
  });
  const legs = new THREE.Group();
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([x, z]) => legs.add(CY(.025, .025, .5, m.carbon2, [x * .35, -.4, z * .3], null, 10), BX(.06, .03, .3, m.orange, [x * .35, -.66, z * .3])));
  add(legs, [0, -1, 0], .45);
  if (o.cam !== false) { const c = new THREE.Group(); c.add(mk(new THREE.SphereGeometry(.14, 20, 16), m.carbon2), CY(.07, .07, .1, m.glass, [0, -.02, -.12], [Math.PI / 2, 0, 0], 16)); c.position.set(0, -.16, -.45); add(c, [0, -.4, -1], .8); }
  if (o.depth) { const d = new THREE.Group(); d.add(BX(.4, .1, .1, m.carbon2), CY(.035, .035, .04, m.glass, [-.12, 0, -.06], [Math.PI / 2, 0, 0], 12), CY(.035, .035, .04, m.glass, [.12, 0, -.06], [Math.PI / 2, 0, 0], 12), CY(.02, .02, .04, m.orange, [0, 0, -.06], [Math.PI / 2, 0, 0], 12)); d.position.set(0, .02, -.52); add(d, [0, .2, -1], .8); }
  if (o.lidar) {
    const l = new THREE.Group(); l.add(CY(.04, .04, .28, m.alu, [0, .27, 0]), CY(.17, .17, .16, m.carbon, [0, .49, 0]), CY(.172, .172, .03, m.orange, [0, .49, 0]));
    const head = new THREE.Group(); head.position.set(0, .55, 0); head.add(BX(.06, .05, .2, m.glass, [.16, 0, 0])); l.add(head);
    spin.push({ o: head, axis: 'y', s: 9 }); add(l, [0, 1, 0], 1);
  }
  if (o.tank) {
    const t = new THREE.Group(); t.add(CY(.2, .2, .9, m.white, [0, -.36, 0], [0, 0, Math.PI / 2], 28));
    [-1, 1].forEach(s => { t.add(CY(.02, .02, .3, m.carbon2, [s * .45, -.55, 0], null, 8)); t.add(mk(new THREE.ConeGeometry(.07, .12, 12), m.orange, [s * .45, -.74, 0], [Math.PI, 0, 0])); });
    t.add(BX(.2, .04, .5, m.orange, [0, -.17, 0])); add(t, [0, -1, 0], 1);
  }
  return { root, parts, spin };
}
function buildSwarm(m) {
  const root = new THREE.Group(), parts = [], spin = [];
  [[0, .5, -2.3], [2.3, -.2, 0], [0, .5, 2.3], [-2.3, -.2, 0]].forEach((p, i) => {
    const q = buildQuad(m, { arm: 1.2 }); q.root.scale.setScalar(.5);
    const g = new THREE.Group(); g.add(q.root); g.position.set(p[0], p[1], p[2]); g.rotation.y = i * Math.PI / 2 + .4; root.add(g);
    q.spin.forEach(s => spin.push(s)); parts.push({ o: g, dir: V3([p[0], .25, p[2]]), w: 1.5 });
  });
  return { root, parts, spin };
}
function buildPlane(m) {
  const root = new THREE.Group(), parts = [], spin = [];
  const add = (g, d, w) => { root.add(g); parts.push({ o: g, dir: V3(d), w: w || 1 }); };
  const fus = new THREE.Group();
  const cap = mk(new THREE.SphereGeometry(.2, 20, 14), m.glass, [.45, .16, 0]); cap.scale.set(1.8, .8, .8);
  fus.add(CY(.2, .2, 2.4, m.white, [0, 0, 0], [0, 0, Math.PI / 2], 28), mk(new THREE.ConeGeometry(.2, .8, 28), m.white, [1.6, 0, 0], [0, 0, -Math.PI / 2]),
    mk(new THREE.ConeGeometry(.2, 1.4, 28), m.white, [-1.9, 0, 0], [0, 0, Math.PI / 2]), CY(.205, .205, .2, m.orange, [.7, 0, 0], [0, 0, Math.PI / 2], 28), cap);
  add(fus, [0, 1, 0], .25);
  const wing = new THREE.Group(); wing.add(BX(.62, .05, 3.8, m.white, [.15, .03, 0]));
  [-1, 1].forEach(s => { wing.add(BX(.64, .052, .12, m.orange, [.15, .03, s * 1.84]), BX(.2, .04, 1.1, m.orange, [-.22, .03, s * 1.0])); });
  add(wing, [0, 1, 0], .9);
  const tail = new THREE.Group(); tail.add(BX(.42, .04, 1.3, m.white, [-2.35, .1, 0]), BX(.5, .6, .04, m.orange, [-2.35, .42, 0])); add(tail, [-1, .6, 0], .8);
  const prop = new THREE.Group(); prop.position.set(1.98, 0, 0);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(.65, 32), m.disc); disc.rotation.y = Math.PI / 2;
  prop.add(BX(.03, 1.3, .09, m.prop), mk(new THREE.ConeGeometry(.07, .2, 12), m.orange, [.08, 0, 0], [0, 0, -Math.PI / 2]), disc);
  spin.push({ o: prop, axis: 'x', s: 45 }); add(prop, [1, 0, 0], .8);
  const pod = new THREE.Group(); pod.add(CY(.09, .09, .45, m.alu, [.3, -.27, 0], [0, 0, Math.PI / 2], 16), CY(.06, .06, .04, m.glass, [.54, -.27, 0], [0, 0, Math.PI / 2], 16)); add(pod, [0, -1, 0], .7);
  return { root, parts, spin };
}
const BUILDERS = {
  hero: m => buildQuad(m, { lidar: true }), quadGuard: m => buildQuad(m, { arm: 1.25, guards: true }), swarm: buildSwarm, plane: buildPlane,
  quadLong: m => buildQuad(m, { arm: 1.8 }),
  quadTank: m => buildQuad(m, { tank: true }), quadLidar: m => buildQuad(m, { lidar: true, depth: true, cam: false })
};

const viewers = [];
const GLB_CACHE = {};
/* SolidWorks glTF exports often use .dds textures, which this Three.js version cannot decode.
   Those texture references are removed before parsing (geometry and colors stay). If anything else still fails,
   it retries once with all textures removed so the shape always shows. */
function stripTextures(json, all) {
  const isDds = i => { const im = json.images && json.images[i]; if (!im) return true; let u = im.uri || ''; try { u = decodeURIComponent(u); } catch (e) {} return /\.dds($|\?)/i.test(u) || /dds/i.test(im.mimeType || ''); };
  const bad = new Set();
  (json.textures || []).forEach((t, i) => {
    if (t.extensions) { delete t.extensions.MSFT_texture_dds; if (!Object.keys(t.extensions).length) delete t.extensions; }
    if (all || t.source === undefined || isDds(t.source)) bad.add(i);
  });
  const strip = o => { for (const k of Object.keys(o)) { const v = o[k]; if (v && typeof v === 'object' && !Array.isArray(v)) { if ('index' in v && bad.has(v.index) && /texture/i.test(k)) delete o[k]; else strip(v); } } };
  (json.materials || []).forEach(strip);
  json.extensionsUsed = (json.extensionsUsed || []).filter(e => e !== 'MSFT_texture_dds');
  json.extensionsRequired = (json.extensionsRequired || []).filter(e => e !== 'MSFT_texture_dds');
  return json;
}
function readGLB(buf) { const dv = new DataView(buf), jl = dv.getUint32(12, true); return { json: JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, jl))), rest: buf.slice(20 + jl) }; }
function writeGLB(json, rest) {
  const enc = new TextEncoder().encode(JSON.stringify(json)), jlen = enc.length + (4 - enc.length % 4) % 4, out = new Uint8Array(20 + jlen + rest.byteLength), dv = new DataView(out.buffer);
  dv.setUint32(0, 0x46546C67, true); dv.setUint32(4, 2, true); dv.setUint32(8, out.length, true); dv.setUint32(12, jlen, true); dv.setUint32(16, 0x4E4F534A, true);
  out.set(enc, 20); out.fill(32, 20 + enc.length, 20 + jlen); out.set(new Uint8Array(rest), 20 + jlen); return out.buffer;
}
let _draco = null;
function makeLoader() {
  const l = new THREE.GLTFLoader();
  if (THREE.DRACOLoader) { if (!_draco) { _draco = new THREE.DRACOLoader(); _draco.setDecoderPath(window.DRACO_PATH); } l.setDRACOLoader(_draco); }
  if (window.MESHOPT && l.setMeshoptDecoder) l.setMeshoptDecoder(window.MESHOPT);
  return l;
}
function loadGLB(url) {
  return GLB_CACHE[url] || (GLB_CACHE[url] = (async () => {
    const res = await fetch(url); if (!res.ok) throw new Error(res.status + ' ' + (res.statusText || 'not found') + ' ' + url);
    const buf = await res.arrayBuffer(), base = THREE.LoaderUtils.extractUrlBase(url), isGlb = new DataView(buf).getUint32(0, true) === 0x46546C67;
    const parse = data => new Promise((ok, no) => makeLoader().parse(data, base, g => ok(g.scene), no));
    const make = all => isGlb ? (g => writeGLB(stripTextures(g.json, all), g.rest))(readGLB(buf)) : JSON.stringify(stripTextures(JSON.parse(new TextDecoder().decode(buf)), all));
    const raw = isGlb ? buf : new TextDecoder().decode(buf);
    try { return await parse(raw); } catch (e0) { console.warn('Plain parse failed, stripping unsupported textures:', e0 && e0.message || e0); }
    try { return await parse(make(false)); } catch (e1) { console.warn('Model textures failed, retrying without textures:', e1 && e1.message || e1); return await parse(make(true)); }
  })());
}
/* Own copy of the loaded model (own materials so Wireframe on one viewer does not affect another), optional rotation in degrees. */
function cloneModel(src, rot, plain) {
  const o = src.clone(true), fix = m => { const c = m.clone();
    if (plain != null) { ['map', 'normalMap', 'bumpMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'displacementMap', 'alphaMap'].forEach(k => { if (c[k]) c[k] = null; }); if (c.color) c.color.setHex(plain); if (c.normalScale) c.normalScale.set(0, 0); c.needsUpdate = true; } if (c.metalness > .4) c.metalness = .4; if (c.roughness < .35) c.roughness = .35; return c; };
  o.traverse(n => { if (n.isMesh && n.material) n.material = Array.isArray(n.material) ? n.material.map(fix) : fix(n.material); });
  const w = new THREE.Group(); w.add(o); if (rot) w.rotation.set(rot[0] * Math.PI / 180, rot[1] * Math.PI / 180, rot[2] * Math.PI / 180); w.userData.props = findProps(w); return w;
}
/* Finds propeller / rotor parts by node name, groups the pieces that touch into one propeller, and gives each a pivot at its own
   center so it can spin around its thin axis. Names are matched with CONFIG.propRegex (default prop|rotor|blade). */
function findProps(root) {
  const re = (typeof CONFIG !== 'undefined' && CONFIG.propRegex) || /prop|rotor|blade|8x3|avan|airscrew|impeller/i;
  root.updateMatrixWorld(true);
  const total = new THREE.Box3().setFromObject(root), tsz = total.getSize(new THREE.Vector3()), tmax = Math.max(tsz.x, tsz.y, tsz.z) || 1;
  const hit = [], names = [];
  if (!findProps.seen) findProps.seen = new Set();
  { const all = []; root.traverse(o => { if (o.name && !/^mesh_?\d*(_\d+)?$/i.test(o.name)) all.push(o.name); }); const key = all.join('|'); if (!findProps.seen.has(key)) { findProps.seen.add(key); console.info('[model parts] ' + all.length + ' named nodes:', all.slice(0, 150).join(', ')); } }
  const walk = n => {
    if (n !== root && re.test(n.name || '')) {
      const b = new THREE.Box3().setFromObject(n);
      if (!b.isEmpty()) { const s = b.getSize(new THREE.Vector3()); if (Math.max(s.x, s.y, s.z) <= tmax * .5) { hit.push({ n, b }); names.push(n.name); return; } }
    }
    n.children.slice().forEach(walk);
  };
  walk(root);
  if (!hit.length) { console.info('[props] no propeller-like part names in this model'); return []; }
  // merge pieces whose boxes touch (hub + blades of the same propeller)
  const grp = hit.map((_, i) => i), find = i => grp[i] === i ? i : (grp[i] = find(grp[i]));
  for (let i = 0; i < hit.length; i++) for (let j = i + 1; j < hit.length; j++) { const a = hit[i].b.clone().expandByScalar(tmax * .01); if (a.intersectsBox(hit[j].b)) grp[find(j)] = find(i); }
  const clusters = {}; hit.forEach((h, i) => (clusters[find(i)] = clusters[find(i)] || []).push(h));
  const out = [];
  Object.values(clusters).forEach((c, k) => {
    const box = new THREE.Box3(); c.forEach(h => box.union(h.b));
    const ctr = box.getCenter(new THREE.Vector3()), sz = box.getSize(new THREE.Vector3());
    const ax = sz.x <= sz.y && sz.x <= sz.z ? new THREE.Vector3(1, 0, 0) : sz.y <= sz.z ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1);
    const par = c[0].n.parent, pivot = new THREE.Group(); par.add(pivot); par.updateMatrixWorld(true);
    pivot.position.copy(par.worldToLocal(ctr.clone())); pivot.updateMatrixWorld(true);
    c.forEach(h => pivot.attach(h.n));
    const q = new THREE.Quaternion(); par.getWorldQuaternion(q); const vec = ax.applyQuaternion(q.invert()).normalize();
    out.push({ o: pivot, vec, a: Math.random() * 6, s: (k % 2 ? -1 : 1) * 32 });
  });
  console.info('[props] spinning ' + out.length + ' propeller(s) from nodes:', names.join(', '));
  return out;
}
function shadowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,.65)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
}
class Viewer {
  constructor(canvas, kind, opts) {
    this.canvas = canvas; this.kind = kind; this.opts = opts || {}; this.phase = 0; this.scrollP = 0; this.visible = false; this.paused = false;
    this.ex = 0; this.exT = 0; this.spinOn = !this.opts.still; this.seed = Math.random() * 6; this.parts = []; this.spin = [];
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    r.setPixelRatio(Math.min(devicePixelRatio, 2)); if ('outputColorSpace' in r) { r.outputColorSpace = THREE.SRGBColorSpace; this.L = Math.PI; } else { this.L = 1;  r.outputEncoding = THREE.sRGBEncoding; } r.setClearColor(0x000000, 0);
    this.scene = new THREE.Scene(); this.camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x2a1a10, .85 * this.L));
    const key = new THREE.DirectionalLight(0xffffff, 1.5 * this.L); key.position.set(4, 7, 5); this.scene.add(key);
    const rim = new THREE.PointLight(0xff5b14, 2.6 * this.L, 30); rim.position.set(-5, 1.5, -4); this.scene.add(rim);
    const rim2 = new THREE.PointLight(0xff8a3d, 1.2 * this.L, 30); rim2.position.set(5, -2, 4); this.scene.add(rim2);
    this.stage = new THREE.Group(); this.holder = new THREE.Group(); this.stage.add(this.holder); this.scene.add(this.stage);
    this.floorG = new THREE.Group(); this.scene.add(this.floorG); this.shTex = shadowTex();
    if (this.opts.orbit) {
      const c = this.controls = new THREE.OrbitControls(this.camera, canvas);
      c.enableZoom = false; c.enablePan = false; c.enableDamping = true; c.dampingFactor = .08; c.rotateSpeed = .8;
      c.minPolarAngle = .3; c.maxPolarAngle = Math.PI * .62; c.autoRotate = !RM && !this.opts.still; c.autoRotateSpeed = 1.6; canvas.style.touchAction = 'pan-y';
      c.addEventListener('start', () => { c.autoRotate = false; clearTimeout(this._t); });
      c.addEventListener('end', () => { this._t = setTimeout(() => { c.autoRotate = this.spinOn && !RM; }, 2200); });
    }
    new ResizeObserver(() => this.resize()).observe(canvas);
    new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }, { rootMargin: '120px' }).observe(canvas);
    viewers.push(this); this.resize(); this.load();
  }
  async load() {
    const o = this.opts; let ok = false;
    if (o.glb && THREE.GLTFLoader) {
      try {
        const src = await loadGLB(o.glb), n = o.copies || 1;
        if (n > 1) {
          const root = new THREE.Group(), parts = [], spins = [], tmp = cloneModel(src, o.rot, o.plain); tmp.updateMatrixWorld(true);
          const s0 = Math.max(...new THREE.Box3().setFromObject(tmp).getSize(new THREE.Vector3()).toArray()) || 1, d = s0 * 1.35;
          [[0, .25, -d], [d, -.15, 0], [0, .25, d], [-d, -.15, 0]].slice(0, n).forEach(p => {
            const w = cloneModel(src, o.rot, o.plain); w.updateMatrixWorld(true);
            w.position.sub(new THREE.Box3().setFromObject(w).getCenter(new THREE.Vector3()));
            spins.push(...w.userData.props); const g = new THREE.Group(); g.add(w); g.position.set(p[0], p[1] * s0, p[2]); root.add(g);
            parts.push({ o: g, dir: V3([p[0], s0 * .3, p[2]]), w: 1.5 });
          });
          this.setModel(root, parts, spins);
        } else { const w = cloneModel(src, o.rot, o.plain); this.setModel(w, null, w.userData.props); }
        ok = true; this.loadedFrom = 'glb';
      } catch (e) { this.loadError = (e && e.message) || String(e); console.warn('Model failed to load, using placeholder:', o.glb, this.loadError); }
    }
    if (!ok) { const b = BUILDERS[this.kind](mats()); this.setModel(b.root, b.parts, b.spin); this.loadedFrom = 'placeholder'; }
    if (o.onReady) o.onReady(this);
  }
  setModel(obj, parts, spin) {
    this.holder.clear(); this.holder.add(obj); this.model = obj; this.spin = spin || [];
    this.holder.scale.setScalar(1); this.holder.position.set(0, 0, 0); this.holder.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    const mx = Math.max(size.x, size.y, size.z) || 1, s = 4 / mx;
    this.holder.scale.setScalar(s); this.holder.position.copy(c).multiplyScalar(-s); this.holder.updateMatrixWorld(true);
    this.size = size.clone().multiplyScalar(s);
    if (parts) parts.forEach(p => { p.base = p.o.position.clone(); p.mag = mx * .32 * p.w; this.parts.push(p); });
    else this.autoParts(obj);
    this.buildFloor(); this.fit();
  }
  autoParts(obj) {
    let n = obj; while (n.children.length === 1) n = n.children[0];
    if (n.children.length < 2) return;
    const cM = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3()), inv = new THREE.Matrix4().copy(n.matrixWorld).invert();
    const ws = n.getWorldScale(new THREE.Vector3()).x || 1;
    n.children.slice().forEach(k => {
      const b = new THREE.Box3().setFromObject(k); if (b.isEmpty()) return;
      const d = b.getCenter(new THREE.Vector3()).sub(cM); if (d.lengthSq() < 1e-8) d.set(0, 1, 0);
      d.transformDirection(inv);
      this.parts.push({ o: k, base: k.position.clone(), dir: d, mag: (4 * .3) / ws });
    });
  }
  buildFloor() {
    while (this.floorG.children.length) this.floorG.remove(this.floorG.children[0]);
    const r = Math.max(this.size.x, this.size.z) * .62, y = -this.size.y / 2 - .45;
    const ring = (a, b, op) => { const m = new THREE.Mesh(new THREE.RingGeometry(a, b, 96), new THREE.MeshBasicMaterial({ color: this.opts.ring || 0xff5b14, transparent: true, opacity: op, side: THREE.DoubleSide, depthWrite: false })); m.rotation.x = -Math.PI / 2; return m; };
    this.floorG.add(ring(r * .985, r, .7), ring(r * .55, r * .552, .3));
    for (let i = 0; i < 4; i++) { const t = BX(.35, .01, .05, new THREE.MeshBasicMaterial({ color: this.opts.ring || 0xff5b14 }), [Math.cos(i * Math.PI / 2) * r, 0, Math.sin(i * Math.PI / 2) * r], [0, -i * Math.PI / 2, 0]); this.floorG.add(t); }
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(r * 2.1, r * 2.1), new THREE.MeshBasicMaterial({ map: this.shTex, transparent: true, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = .01; this.floorG.add(sh);
    this.floorG.position.y = y;
  }
  fit() {
    const w = this.canvas.clientWidth || 1, h = this.canvas.clientHeight || 1, a = w / h;
    let d = (this.opts.fitR || (this.opts.hero ? 3.1 : 3.5)) / Math.sin(this.camera.fov * Math.PI / 360);
    d *= Math.max(1, .85 / a);
    this.d0 = d; this.camera.position.set(0, d * .27, d * .96); this.camera.lookAt(0, 0, 0);
    if (this.controls) this.controls.update();
  }
  resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight; if (!w || !h) return;
    this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); if (this.size) this.fit();
  }
  zoom(f) { const c = this.camera, d = c.position.length(), b = this.d0 || d; c.position.setLength(Math.min(b * 1.7, Math.max(b * .4, d * f))); }
  setColor(hex) {
    const keys = ['map', 'normalMap', 'bumpMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'alphaMap'];
    this.holder.traverse(o => { if (!o.isMesh) return; [].concat(o.material).forEach(m => {
      if (!m.color || (m.isMeshBasicMaterial && m.transparent)) return;
      if (!m.userData.orig) m.userData.orig = { c: m.color.getHex(), maps: keys.map(k => m[k]), em: m.emissive ? m.emissive.getHex() : 0 };
      const s = m.userData.orig;
      if (hex == null) { m.color.setHex(s.c); keys.forEach((k, i) => { m[k] = s.maps[i]; }); }
      else { keys.forEach(k => { if (m[k] && k !== 'alphaMap') m[k] = null; }); m.color.setHex(hex); if (m.emissive) m.emissive.setHex(0); }
      m.needsUpdate = true; }); });
  }
  setExplode(b) { this.exT = b ? 1 : 0; }
  setWire(b) { this.holder.traverse(o => { if (o.isMesh) [].concat(o.material).forEach(mt => { if (mt.isMeshBasicMaterial && mt.transparent) return; mt.wireframe = b; }); }); }
  setSpin(b) { this.spinOn = b; if (this.controls) this.controls.autoRotate = b && !RM; }
  tick(dt, t) {
    if (!this.model) return;
    for (const s of this.spin) { if (s.vec) { s.a += s.s * dt; s.o.quaternion.setFromAxisAngle(s.vec, s.a); } else s.o.rotation[s.axis] += s.s * dt; }
    if (this.opts.exDriver) this.exT = this.opts.exDriver(this.phase);
    this.ex = lerp(this.ex, this.exT, 1 - Math.pow(.002, dt));
    for (const p of this.parts) p.o.position.copy(p.base).addScaledVector(p.dir, p.mag * this.ex);
    const st = this.stage, bob = RM ? 0 : Math.sin(t * 1.3 + this.seed) * .08;
    if (this.opts.hero) {
      const k = 1 - Math.pow(.02, dt);
      st.rotation.y = lerp(st.rotation.y, .55 + mouse.nx * .8 + this.scrollP * 2.6, k);
      st.rotation.x = lerp(st.rotation.x, mouse.ny * .3 + .1 + this.scrollP * .6, k);
      st.rotation.z = lerp(st.rotation.z, -mouse.nx * .14, k);
      st.scale.setScalar(1 + this.scrollP * .5); st.position.y = bob + this.scrollP * 1.8;
    } else {
      st.position.y = bob; st.rotation.y = this.phase * 1.2; st.rotation.z = RM ? 0 : Math.sin(t * .9 + this.seed) * .03; st.rotation.x = RM ? 0 : Math.sin(t * .7 + this.seed) * .04;
      if (this.opts.motion) this.opts.motion(this, this.phase, t);
    }
    if (this.controls) this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
function safeViewer(canvas, kind, opts) { if (!THREE_OK) return null; try { return new Viewer(canvas, kind, opts); } catch (e) { console.warn('WebGL unavailable', e); return null; } }

