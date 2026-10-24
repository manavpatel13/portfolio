# Manav Patel · Portfolio

Interactive single-page portfolio of Manav Patel, Captain and Software Lead of Team Arrow ITNU at Nirma University. It covers work on GPS-denied navigation, onboard computer vision and swarm coordination for autonomous drones.

**Live site:** https://manavpatel13.github.io/REPO-NAME

## Highlights
- SUAS 2025 world champion
- IRoC-U 2026 national champion
- Robofest 5.0 top-20 finalist

## What's inside
- Real SolidWorks drone models (glTF/GLB) rendered with three.js, with spinning propellers
- Scroll-driven achievements and a pinned horizontal projects section
- Per-project 3D viewer with zoom, wireframe, colour and flight-video toggle
- Skills grid with hover effects, resume download and contact links

## Tech
HTML, CSS and vanilla JavaScript, with three.js, Lenis smooth scroll and no build step.

## Run locally
Serve the folder over http (models and videos don't load from `file://`):

    python -m http.server 8000

Then open http://localhost:8000.

To plug in your own models and videos, edit `js/config.js`.
