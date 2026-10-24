/* Loads three.js r160 as ES modules (same setup as the teamarrow.in IRoC viewer: three + GLTFLoader + OrbitControls),
   exposes them as window.THREE, then loads the app scripts in order. Falls back to the older UMD build if modules fail. */
const APP = ['js/utils.js', 'js/icons.js', 'js/config.js', 'js/viewer.js', 'js/main.js'];
function addScript(src) { return new Promise(ok => { const s = document.createElement('script'); s.src = src; s.async = false; s.onload = s.onerror = ok; document.body.appendChild(s); }); }
async function start() {
  try {
    const T = await import('three');
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
    const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
    const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js');
    let MeshoptDecoder = null; try { MeshoptDecoder = (await import('three/addons/libs/meshopt_decoder.module.js')).MeshoptDecoder; } catch (e) {}
    window.THREE = Object.assign({}, T, { GLTFLoader, OrbitControls, DRACOLoader });
    window.DRACO_PATH = 'https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/gltf/'; window.MESHOPT = MeshoptDecoder;
    window.THREE_VER = 160;
  } catch (e) {
    console.warn('three r160 modules failed, falling back to r128', e);
    const base = 'https://cdn.jsdelivr.net/npm/three@0.128.0/';
    await addScript(base + 'build/three.min.js'); await addScript(base + 'examples/js/loaders/GLTFLoader.js'); await addScript(base + 'examples/js/controls/OrbitControls.js'); await addScript(base + 'examples/js/loaders/DRACOLoader.js');
    window.DRACO_PATH = base + 'examples/js/libs/draco/gltf/';
    window.THREE_VER = 128;
  }
  if (window.__APP_INLINE) { const s = document.createElement('script'); s.textContent = window.__APP_INLINE; document.body.appendChild(s); }
  else for (const f of APP) await addScript(f);
}
start();
