# Manav Patel — portfolio

Static site, no build step. Open `index.html` through a local server (for example `python3 -m http.server` in this folder) or host the folder anywhere.

```
index.html          page markup
css/style.css       all styles (colors are the variables at the top of :root)
js/config.js        EDIT ME: model/video/resume paths, project text, achievements, skills
js/utils.js         helpers
js/icons.js         logo paths
js/viewer.js        3D viewer + placeholder airframes (GLB loader)
js/main.js          scroll effects, projects, achievements, skills, cursor, etc.
assets/             resume PDF
models/             put your SolidWorks .glb files here
```

## Plug in your own files
Open `js/config.js`:
- `CONFIG.models`: already set to `models/suas.gltf`, `models/iroc.glb`, `models/robofest.gltf` (swarm). agri and explore are empty, so they show the built-in placeholder drones. A missing file also falls back to the placeholder.
- The swarm model is one drone; the site shows it 4 times in formation.
- If a model loads sideways or upside down, set `CONFIG.modelRotation`, for example `suas: [-90, 0, 0]`.
- A `.gltf` needs its `.bin` and texture files in `models/` next to it.
- `CONFIG.videos.suas = 'videos/suas.mp4'` or any direct .mp4 URL.
- `CONFIG.resumeUrl` points to `assets/Manav_Patel_Resume.pdf`. Replace the PDF or change the path.

GLB tips: export from SolidWorks as glTF/GLB, keep each part as its own node so the Explode button can pull it apart, and keep file size under about 15 MB.


## Videos won't play?
Re-encode with ffmpeg (8-bit H.264, AAC audio, metadata at the start of the file):

    ffmpeg -i input.mp4 -c:v libx264 -pix_fmt yuv420p -profile:v high -preset slow -crf 23 -movflags +faststart -c:a aac -b:a 128k output.mp4

Phone/OBS/screen-recorder files are often 10-bit, H.265 or have the index at the end of the file, which Chrome rejects over a simple local server.


> This public build uses built-in placeholder drone models (no SolidWorks files are included). To show your own models, add .glb/.gltf files and set their paths in `models` in js/config.js.
