/* ============================================================
   CONFIG: edit this block to plug in your own files.
   - models: path or URL to a .glb or .gltf (SolidWorks export). A .gltf must keep its .bin and texture files next to it.
     Empty or missing file = built-in placeholder airframe. The swarm model is shown 4 times in formation.
   - videos: path or URL to an .mp4. The values below are online sample clips as placeholders.
   - resumeUrl: your PDF resume. Default is assets/Manav_Patel_Resume.pdf (already included). A Drive link works too.
   Note: GLB/video files load only when the page is served over http(s), not from file://
   ============================================================ */
const CONFIG = {
  resumeUrl: 'assets/Manav_Patel_Resume.pdf',
  models: { suas: '', iroc: '', swarm: '', agri: '', explore: '' },
  // Default flat color per model (drawn without textures). Value = hex like 0xff5b14. Remove a key to keep the model's own textures/colors.
  // Each airframe viewer also has a Color picker to try other colors live.
  plain: {},
  // Degrees [x, y, z] to turn a model that loads sideways or upside down, e.g. suas: [-90, 0, 0]. Empty = no change.
  modelRotation: { suas: [0, 0, 0], iroc: [0, 0, 0], swarm: [0, 0, 0], agri: [0, 0, 0], explore: [0, 0, 0] },
  videos: {
    suas:    'videos/suas.mp4',
    iroc:    'videos/iroc.mp4',
    swarm:   'videos/robofest.mp4',
    agri:    'videos/agri.mp4',
    explore: 'videos/nidar.mp4'
  }
};
/* ---------- data ---------- */
const PROJECTS = [
  { key: 'suas', kind: 'quadLong', tag: 'World Champions', tc: '', date: 'Aug 2024 – Jul 2025',
    title: 'Autonomous Survey UAV', sub: 'SUAS 2025 · St. Mary’s County Regional Airport (2W6), California, Maryland, USA',
    role: 'Software Engineer · Navigation & Computer Vision',
    desc: 'Fixed-wing autonomous UAV for airport-runway survey. I engineered the coverage path-planner and fine-tuned a YOLO Foreign Object Debris detector on a self-annotated runway dataset, running in real time on NVIDIA Jetson. A live mission-control GUI shows telemetry, autonomous status and geo-referenced detections.',
    mets: [{ n: 15, s: ' ac', l: 'autonomous coverage per mission' }, { n: 91, s: '%', l: 'FOD precision at 45 m altitude' }, { n: .5, s: ' m', d: 1, l: 'max geo-position error' }],
    stack: ['Python', 'ROS', 'YOLOv8', 'OpenCV', 'ArduPilot', 'NVIDIA Jetson', 'PyTorch', 'CUDA', 'MAVLink'],
    links: [['Team Arrow', 'https://teamarrow.in']], corner: 'Quad · long-range survey' },
  { key: 'iroc', kind: 'quadGuard', tag: 'National Champions', tc: '', date: 'Jan 2026 – Jul 2026',
    title: 'Mars Exploration UAV', sub: 'IRoC-U 2026 · ISRO Robotics Challenge, URSC',
    role: 'Captain · GPS-Denied Navigation & Docking',
    desc: 'Sub-2 kg autonomous UAV for simulated Martian indoor exploration. I implemented the ORB-based visual tracking and local positioning pipeline with zero external reference infrastructure, validated PID attitude loops in MATLAB/Simulink, engineered the self-charging docking sequence, and trained a YOLO terrain model with cosine-similarity landmark re-identification.',
    mets: [{ n: 20, s: ' cm', l: 'positional accuracy, no GPS' }, { n: 92, s: '%', l: 'autonomous docking success' }, { n: 87, s: '%', l: 'landmark ID accuracy' }],
    stack: ['ORB-SLAM2', 'Python', 'ROS', 'PX4', 'YOLOv8', 'OpenCV', 'MATLAB / Simulink', 'ArduPilot'],
    links: [['Team Arrow', 'https://teamarrow.in']], corner: 'Quad · sub-2 kg' },
  { key: 'swarm', kind: 'swarm', tag: 'Finalist · Top 20', tc: 'fin', date: 'Aug 2025 – Mar 2026',
    title: 'Autonomous UAV Swarm', sub: 'Robofest 5.0 · Swarm Aerial Robotics Competition',
    role: 'Software Lead · Swarm Coordination & Obstacle Avoidance',
    desc: 'Four 1 lb UAVs flying in formation with a decentralised inter-drone communication protocol I designed. RRT*-based predictive obstacle avoidance, a forest-field survey and navigation algorithm, simulated landmine detection with automated safe-path re-routing, and gesture and voice control as a manual override.',
    mets: [{ n: 4, s: ' UAVs', l: '1 lb each, synchronised waypoints' }, { n: 95, s: '%', l: 'obstacle avoidance (simulation)' }, { n: 87, s: '%', l: 'landmine detection (simulated)' }],
    stack: ['Python', 'ROS', 'RRT*', 'MAVLink', 'YOLOv8', 'Gazebo', 'ArduPilot', 'QGroundControl'],
    links: [['Team Arrow', 'https://teamarrow.in']], corner: '4-UAV formation' },
  { key: 'agri', kind: 'quadTank', tag: 'Team Arrow ITNU', tc: '', date: 'Aug 2025 – Dec 2026',
    title: 'Autonomous Agricultural Survey', sub: 'Team Arrow ITNU',
    role: 'Software Lead · Computer Vision',
    desc: 'Autonomous agricultural UAV with an image-processing crop-health survey pipeline. GPS-tagged field zones drive targeted irrigation and fertilisation commands, all monitored through a live mission-control GUI.',
    flow: ['Survey field with vision', 'Tag zones with GPS', 'Irrigate and fertilise by zone'],
    stack: ['Python', 'OpenCV', 'Image processing', 'GPS tagging', 'Mission-control GUI'],
    links: [['Team Arrow', 'https://teamarrow.in']], corner: 'Quad · sprayer payload' },
  { key: 'explore', kind: 'quadLidar', tag: 'Active Research', tc: 'res', date: '2026 – Present',
    title: 'Indoor Exploration Drone', sub: 'Autonomous maze exploration and human localisation',
    role: 'Project Lead · RL Trajectory & Human Localisation',
    desc: 'Sub-2 kg drone that explores an unknown floor plan and reports where people are, without GPS. An RL trajectory generator trained in Gazebo and transferred to the real world, frontier-based exploration for systematic coverage, 3D LiDAR obstacle avoidance, and depth-camera human localisation relative to the start position.',
    mets: [{ t: '<2 kg', l: 'airframe' }, { t: '3D LiDAR', l: 'real-time obstacle avoidance' }, { t: 'RL', l: 'trained in Gazebo, real-world transfer' }],
    stack: ['Reinforcement Learning', '3D LiDAR', 'Depth Camera', 'Frontier Exploration', 'ROS2', 'Gazebo', 'PyTorch', 'PX4'],
    links: [['Team Arrow', 'https://teamarrow.in']], corner: 'Quad · LiDAR + depth' }
];
const GROUPS = { lang: 'Languages', ml: 'ML & Vision', rob: 'Robotics & Sim', hw: 'Hardware', tools: 'Tools & Web' };
// [name, icon slug or null, group, used-in, monogram]
const SK = [
  ['Python', 'python', 'lang', ['SUAS', 'IRoC-U', 'Swarm']], ['C++', 'cplusplus', 'lang', []], ['C', 'c', 'lang', []], ['Java', 'openjdk', 'lang', []],
  ['JavaScript', 'javascript', 'lang', ['Website']], ['HTML', 'html5', 'lang', ['Website']], ['CSS', 'css', 'lang', ['Website']], ['MATLAB', null, 'lang', ['IRoC-U'], 'M'], ['SQL (MySQL)', 'mysql', 'lang', []],
  ['PyTorch', 'pytorch', 'ml', ['SUAS', 'Explore']], ['TensorFlow', 'tensorflow', 'ml', []], ['OpenCV', 'opencv', 'ml', ['SUAS', 'IRoC-U']], ['YOLO', null, 'ml', ['SUAS', 'IRoC-U', 'Swarm'], 'YOLO'],
  ['CUDA', 'nvidia', 'ml', ['SUAS']], ['NumPy', 'numpy', 'ml', []], ['Pandas', 'pandas', 'ml', []], ['scikit-learn', 'scikitlearn', 'ml', []],
  ['ROS / ROS2', 'ros', 'rob', ['SUAS', 'IRoC-U', 'Swarm', 'Explore']], ['ArduPilot', null, 'rob', ['SUAS', 'IRoC-U', 'Swarm'], 'AP'], ['PX4', null, 'rob', ['IRoC-U', 'Explore'], 'PX4'],
  ['MAVLink', null, 'rob', ['SUAS', 'Swarm'], 'MAV'], ['Gazebo', null, 'rob', ['Swarm', 'Explore'], 'GZ'], ['ORB-SLAM2 / SLAM', null, 'rob', ['IRoC-U'], 'SLAM'],
  ['Mission Planner', null, 'rob', [], 'MP'], ['QGroundControl', null, 'rob', ['Swarm'], 'QGC'], ['Simulink', null, 'rob', ['IRoC-U'], 'SIM'],
  ['NVIDIA Jetson', 'nvidia', 'hw', ['SUAS']], ['Raspberry Pi', 'raspberrypi', 'hw', []], ['Arduino', 'arduino', 'hw', []], ['3D LiDAR', null, 'hw', ['Explore'], 'LiDAR'], ['Depth camera', null, 'hw', ['Explore'], '3D'],
  ['Git', 'git', 'tools', []], ['GitHub', 'github', 'tools', []], ['Docker', 'docker', 'tools', []], ['Linux', 'linux', 'tools', []], ['VS Code', null, 'tools', [], 'VS'], ['Windows', null, 'tools', [], 'WIN'],
  ['React.js', 'react', 'tools', ['Website']], ['Node.js', 'nodedotjs', 'tools', ['Website']]
];
const iconSvg = (slug, cls) => ICONS[slug] ? `<svg viewBox="0 0 24 24" aria-hidden="true"${cls ? ` class="${cls}"` : ''}><path d="${ICONS[slug]}"/></svg>` : '';
const logoOrMono = s => s[1] && ICONS[s[1]] ? iconSvg(s[1]) : `<span class="mg">${s[4] || s[0].slice(0, 2)}</span>`;


/* Achievements: one stacked full-screen card each. the right side shows that competition's 3D airframe, driven by scroll and cursor. */
const ACH = [
  { theme: 'orange', pre: '#', rank: 1, tag: 'World Champions', year: '2025', big: 'WORLD CHAMPIONS',
    title: 'SUAS 2025', full: 'Student Unmanned Aerial Systems Competition', where: 'St. Mary’s County Regional Airport (2W6) · California, Maryland, USA',
    role: 'Software Engineer · Navigation & Computer Vision', of: 80, cap: '1st of ~80 international university teams',
    facts: [['91%', 'FOD detection precision at 45 m'], ['15 ac', 'autonomous coverage per mission'], ['0.5 m', 'max geo-position error']], proj: 1, model: 'suas', kind: 'quadLong', motion: 'quad' },
  { theme: 'grey', pre: '#', rank: 1, tag: 'National Champions', year: '2026', big: 'NATIONAL CHAMPIONS',
    title: 'IRoC-U 2026', full: 'ISRO Robotics Challenge · URSC', where: 'India · national level',
    role: 'Captain · GPS-Denied Navigation & Docking', of: 590, cap: '1st of ~590 registered teams nationwide',
    facts: [['20 cm', 'positional accuracy with no GPS'], ['92%', 'autonomous docking success'], ['50+', 'autonomous flight test runs']], proj: 2, model: 'iroc', kind: 'quadGuard', motion: 'quad' },
  { theme: 'black', pre: 'TOP', rank: 20, tag: 'Finalist', year: '2025 – 26', big: 'FINALIST',
    title: 'Robofest 5.0', full: 'Swarm Aerial Robotics Competition', where: 'India · national level',
    role: 'Software Lead · Swarm Coordination & Obstacle Avoidance', of: 20, cap: 'One of the top 20 teams nationally',
    facts: [['4', 'UAVs flying in formation, 1 lb each'], ['95%', 'obstacle avoidance (simulation)'], ['87%', 'landmine detection (simulated)']], proj: 3, model: 'swarm', kind: 'swarm', motion: 'swarm' }
];
