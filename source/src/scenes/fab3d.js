import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

/* ---------------------------------------------------------------------------
   THE FAB · live 3D, built to IAQ's own model

   A ten-bay fab modelled to the proportions of IAQ's Revit coordination model, which is in this
   repo as 57 exported frames in `_reference/fab-frames/` (NOT as a .rvt). Open those before
   changing massing or level heights
   (their rendered frames are the modelling reference: pile grid, cap and beam
   sizes, sub-fab height, raised floor, steel roof, the colour of every system).
   Scroll drives nine stages. Each stage assembles ONE system into place and
   holds it in colour while every system already built greys back; the last
   stage returns all of them to colour and pulls the camera out to the whole
   building. Pointer explores it at any point: drag to rotate, pinch or the
   controls to zoom, double-click to reset.

   Architecture, because the client will keep changing this:
   · every part of a system is an InstancedMesh, one draw call per part TYPE
     across all ten bays, so highlight/grey-out is a material swap and the whole
     building stays under ~60 draw calls
   · assembly is per-instance: each instance carries a stagger, so a system
     builds along the building rather than popping in as one block
   · the stage machine reads ONE number (u = stage units, 0..9) and derives
     everything from it, so scroll, the rail and the camera cannot disagree
   · a rate-capped mirror smooths u with a fast-resync path (a flick cascades,
     a re-entry does not look frozen), and section edges settle to clean values
   --------------------------------------------------------------------------- */

/* stage colour = the system's colour in their model; the rail icons carry it */
export const STAGE_COLOR = { st: '#B7C0CC', ar: '#E87A2E', pu: '#22C55E', fp: '#DC2626', ac: '#22D3EE', el: '#EAB308', cr: '#67E8F9', tl: '#E5E7EB', ov: '#EC2027' }
export const STAGES = [
  { n: '1', k: 'st', seq: 'Piles · pile caps · ground beams · sub-fab slab · columns · waffle floor', t: 'Civil & Structural',   d: 'Piles, caps and ground beams below grade; slab, columns and the raised fab floor above it.' },
  { n: '2', k: 'ar', seq: 'Roof trusses · purlins · roof deck · wall envelope', t: 'Architectural',        d: 'Steel roof trusses and purlins land, and the wall envelope closes the volume.' },
  { n: '3', k: 'pu', seq: 'Pipe rack · PCW header · UPW header · risers to tools · gas cabinets', t: 'Process Utilities',    d: 'Process pipework routed through the sub-fab before anything sits above it.' },
  { n: '4', k: 'fp', seq: 'Sprinkler mains · risers · branch lines', t: 'Fire Protection',      d: 'Sprinkler mains and risers, red by convention, threaded through every level.' },
  { n: '5', k: 'ac', seq: 'Fresh-air intake · supply main · drops to plenum · return main · return out', t: 'Air-conditioning',     d: 'Supply and return ductwork fills the roof space above the cleanroom ceiling.' },
  { n: '6', k: 'el', seq: 'Transformer · switchboards · busbar · cable trays · cabling', t: 'HT & LV Electrical',   d: 'Cable containment and distribution follow the duct routes.' },
  { n: '7', k: 'cr', seq: 'Ceiling grid · FFU field · air handlers · partitions · exhaust stacks', t: 'Cleanroom System',     d: 'Ceiling grid, fan filter units and the plant that holds the class.' },
  { n: '8', k: 'tl', seq: 'Process tools · load ports · hookup drops · pump skids · wet benches', t: 'Tools Hookup',         d: 'Process tools arrive on the fab floor and connect to every service beneath.' },
  { n: '9', k: null, c: 'ov', seq: 'Review of all eight systems · envelope closes · plant lands · site handover', t: 'Overall',              d: 'Every system reviewed, then the envelope closes, the plant goes up and the site is handed over.' },
]
const SYS = STAGES.filter(s => s.k).map(s => s.k)     /* the 8 buildable systems, in order */
const UNITS = STAGES.length                              /* 9 stage units across the runway */

/* geometry of the building, in metres, from their model's proportions (see _reference/fab-frames) */
const BAYS = 10, PITCH = 12, DEPTH = 24
const HERO_A = 4, HERO_B = 6                              /* the hero cluster: bays 4..6 */
const HERO_CX = ((HERO_A + HERO_B) / 2 - (BAYS - 1) / 2) * PITCH   /* its centre x */
const LINES = [-10, 0, 10]                               /* column lines across the depth */
const Y = { pileTip: -10.2, capTop: 0, beamTop: 0.8, slabTop: 1.4, colTop: 7.4, floorTop: 8.4,
            ceiling: 13.4, trussBot: 17.2, trussTop: 19.8, roof: 20.2 }

/* palette: their BIM colours, kept honest */
const C = {
  concrete: 0x8E959E, column: 0xA9D9D4, subslab: 0x16302F, floor: 0xA3A9B1, floorEdge: 0x6E747C,
  steel: 0xE87A2E, deck: 0x3D6B66, wall: 0xE3E8EE,
  green: 0x22C55E, purple: 0x8B5CF6, red: 0xDC2626, cyan: 0x22D3EE, yellow: 0xEAB308,
  ceil: 0xC9CED6, ffu: 0x67E8F9, ahu: 0x2563EB, tool: 0xE5E7EB,
}
const GREY = new THREE.Color(0x4B5568), GREY_LIGHT = new THREE.Color(0xB4BCC8)

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const ease = t => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3))
const pad = i => String(i)   /* client, 28 Aug: no zero-padded counters anywhere: 1, 2, 3 */

/* 24 Sep · DRIVEN MODE (opts.driven, components/FabDriven.jsx on the Services page). The same scene, but nothing
   scrolls: the whole facility stands built and `stop.focus(keys)` lights the systems named (the rest grey back) and
   calls out their part names. Bazil: "start from the parallax 3D, but instead it shows everything in detail in that
   3D as we select". */
export default function initFab3D(root, opts = {}) {
  if (!root) return () => {}
  const driven = !!opts.driven
  let focusKeys = null, bgWant = true
  const view = root.querySelector('.fab-view')
  const canvas = root.querySelector('canvas')
  const items = [...root.querySelectorAll('.fab-st')]
  const counter = root.querySelector('.fab-count')
  const cue = root.querySelector('.fab-cue i')
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches

  /* ---- renderer / scene ------------------------------------------------- */
  let renderer
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }) }
  catch (e) { root.dataset.nogl = '1'; return () => {} }
  /* driven (24 Sep, Bazil: "find out how to do it beautifully"): a white studio, the way an exploded axonometric is drawn */
  /* 24 Sep, later (Bazil's references: a dark card, the model in white clay, only the pick in colour, pins on stalks) */
  renderer.setClearColor(driven ? 0x0F1319 : 0x070C18, 1)   /* the section's own navy: opaque, so the AO pass composites cleanly */
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap   /* PCFSoft is deprecated in r184 and silently falls back to this anyway */
  renderer.shadowMap.autoUpdate = false

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(driven ? 0x0F1319 : 0x070C18, driven ? 320 : 210, 900)
  const pm = new THREE.PMREMGenerator(renderer)
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture
  pm.dispose()

  const camera = new THREE.PerspectiveCamera(driven ? 24 : 34, 1, 0.5, 1400)   /* driven: a longer lens, nearer to an axonometric */
  const world = new THREE.Group(); scene.add(world)             /* yaw is applied here */

  const hemi = new THREE.HemisphereLight(0xE3E9F2, 0x2A3448, 0.62); scene.add(hemi)
  const key = new THREE.DirectionalLight(0xFFF6EA, 1.6)
  key.position.set(60, 90, 40); key.castShadow = true
  /* 10 Sep: the shadow camera has to span 180 x 90 metres to hold a 120m building, so 2048
     was 11 texels per metre and every soft edge stair-stepped. 4096 on pointer devices puts
     it at 23; coarse pointers keep 2048 because they are also the slower GPUs. */
  key.shadow.mapSize.set(coarse ? 2048 : 4096, coarse ? 2048 : 4096)
  key.shadow.camera.left = -90; key.shadow.camera.right = 90
  key.shadow.camera.top = 60; key.shadow.camera.bottom = -30
  key.shadow.camera.near = 20; key.shadow.camera.far = 260
  key.shadow.bias = -0.0008; key.shadow.normalBias = 0.02
  scene.add(key)
  const fill = new THREE.DirectionalLight(0x9DB4E8, 0.35); fill.position.set(-60, 30, -50); scene.add(fill)
  /* GTAO on pointer devices only: contact shadow under every beam, pile cap and tool foot */
  const useAO = !coarse
  let composer = null, aoPass = null
  if (useAO) {
    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    aoPass = new GTAOPass(scene, camera, 1, 1)
    aoPass.output = GTAOPass.OUTPUT.Default
    aoPass.updateGtaoMaterial({ radius: 2.2, distanceExponent: 1.5, thickness: 1.4, scale: 1.6, samples: 16, distanceFallOff: 1, screenSpaceRadius: false })
    aoPass.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 4, radiusExponent: 1, rings: 2, samples: 16 })
    composer.addPass(aoPass)
    /* driven (24 Sep, Bazil's digital-twin reference: "this kind of render and detail looks good, but of course IAQ theme"):
       a bloom so the lit systems' edges and emissive surfaces glow, the dark model under them stays dark */
    /* 24 Sep, later (Bazil: "rather than making it shiny, colour code it to match, so each part can have different"): no bloom */
    composer.addPass(new OutputPass())
  }

  /* ---- the ground (client: "ground needs real"): an earth block with an excavation around the
     hero bays, so the piles stand exposed in the cut the way a real site opens them up, the cut
     faces show soil strata, and the surface is concrete hardstanding. Everything else is buried. */
  const EARTH_TOP = Y.capTop, EARTH_BOT = Y.pileTip - 1.6
  const EX = { x0: HERO_CX - 24, x1: HERO_CX + 24, z0: -17, z1: 60 }        /* the excavation, open toward the camera */
  const GW = 320, GD = 240
  function strataTex() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256
    const g = c.getContext('2d')
    const bands = [['#3A3129', 0], ['#4A3D31', .16], ['#5A4D3F', .34], ['#6A5F50', .5], ['#565149', .66], ['#43403C', .82], ['#33312E', 1]]
    for (let i = 0; i < bands.length - 1; i++) { g.fillStyle = bands[i][0]; g.fillRect(0, bands[i][1] * 256, 256, (bands[i + 1][1] - bands[i][1]) * 256 + 1) }
    for (let i = 0; i < 1400; i++) { g.fillStyle = 'rgba(' + (i % 2 ? '0,0,0' : '255,255,255') + ',' + (0.04 + (i % 7) * 0.012) + ')'; g.fillRect((i * 7919) % 256, (i * 104729) % 256, 1 + (i % 3), 1) }
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = THREE.RepeatWrapping; tx.wrapT = THREE.ClampToEdgeWrapping; return tx
  }
  function hardTex() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256
    const g = c.getContext('2d'); g.fillStyle = '#44484E'; g.fillRect(0, 0, 256, 256)
    for (let i = 0; i < 2600; i++) { g.fillStyle = 'rgba(' + (i % 2 ? '0,0,0' : '255,255,255') + ',' + (0.03 + (i % 5) * 0.01) + ')'; g.fillRect((i * 7919) % 256, (i * 104729) % 256, 1 + (i % 2), 1) }
    g.strokeStyle = 'rgba(20,22,26,.55)'; g.lineWidth = 2; g.strokeRect(1, 1, 254, 254)   /* a saw-cut joint per 6m tile */
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.anisotropy = 4; return tx
  }
  function gravelTex() {
    /* compacted fill: two octaves of seamless tonal variation (integer sine sums tile without a
       seam), fine grain on top, and a pair of tyre ruts. No discs: at 24 m a disc reads as a pattern */
    const n = 1024, c = document.createElement('canvas'); c.width = c.height = n
    const g = c.getContext('2d'), im = g.createImageData(n, n), d = im.data
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const u = x / n * Math.PI * 2, v = y / n * Math.PI * 2
      const t = 0.5 + 0.18 * Math.sin(u * 2 + Math.cos(v * 3) * 1.3) * Math.cos(v * 2 + Math.sin(u * 5) * 0.8) + 0.09 * Math.sin(u * 7 + v * 4) * Math.cos(v * 9 - u * 3) + 0.05 * Math.sin(u * 17 + v * 11) * Math.cos(v * 23 - u * 13)
      const grain = ((x * 7919 + y * 104729) % 97) / 97 - 0.5
      const k = 0.8 + t * 0.3 + grain * 0.24
      const i = (y * n + x) * 4; d[i] = 88 * k; d[i + 1] = 83 * k; d[i + 2] = 76 * k; d[i + 3] = 255
    }
    g.putImageData(im, 0, 0)
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.anisotropy = 4; return tx
  }
  const strata = strataTex(), hard = hardTex(), gravel = gravelTex()
  /* equipment skins: louvred plant faces, and the panel seams every process tool carries */
  const louvreTex = tile((g, n) => { g.fillStyle = '#2E5FB5'; g.fillRect(0, 0, n, n); for (let i = 0; i < 12; i++) { g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(0, i * (n / 12), n, 3); g.fillStyle = 'rgba(255,255,255,.10)'; g.fillRect(0, i * (n / 12) + 5, n, 2) } }, 128)
  const toolTex = tile((g, n) => { g.fillStyle = '#E8EAEE'; g.fillRect(0, 0, n, n); g.strokeStyle = 'rgba(70,76,88,.35)'; g.lineWidth = 2; g.strokeRect(1, 1, n - 2, n - 2); g.beginPath(); g.moveTo(n / 2, 0); g.lineTo(n / 2, n); g.moveTo(0, n * 0.36); g.lineTo(n, n * 0.36); g.stroke(); g.fillStyle = 'rgba(70,76,88,.5)'; g.fillRect(n * 0.06, n * 0.9, n * 0.16, 4) }, 128)
  const earthSide = new THREE.MeshStandardMaterial({ map: strata, roughness: 1, metalness: 0 })
  const earthTop = new THREE.MeshStandardMaterial({ map: gravel, roughness: 0.95, metalness: 0 })
  const earthBot = new THREE.MeshStandardMaterial({ color: 0x24221F, roughness: 1 })
  function earthBlock(x0, x1, z0, z1) {
    const w = x1 - x0, d = z1 - z0, h = EARTH_TOP - EARTH_BOT
    const side = earthSide
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [side, side, earthBot, earthBot, side, side])
    m.position.set((x0 + x1) / 2, (EARTH_TOP + EARTH_BOT) / 2, (z0 + z1) / 2)
    m.receiveShadow = true; world.add(m)
    /* strata repeat along each side face proportionally, so the bands read as one continuous cut */
    return m
  }
  earthBlock(-GW / 2, GW / 2, -GD / 2, EX.z0)                       /* behind the excavation */
  /* ONE gravel surface over the whole site with the pit cut out of it (a ShapeGeometry's UVs are
     world units, so the texture phase is continuous across the four blocks: no seams), with the
     same noise as a bump map so the light picks up relief instead of paint */
  ;(function groundSurface() {
    const shp = new THREE.Shape(); shp.moveTo(-GW / 2, GD / 2); shp.lineTo(GW / 2, GD / 2); shp.lineTo(GW / 2, -GD / 2); shp.lineTo(-GW / 2, -GD / 2); shp.closePath()
    const hole = new THREE.Path(); hole.moveTo(EX.x0, -EX.z0); hole.lineTo(EX.x1, -EX.z0); hole.lineTo(EX.x1, -EX.z1); hole.lineTo(EX.x0, -EX.z1); hole.closePath(); shp.holes.push(hole)
    const gmap = gravel.clone(); gmap.needsUpdate = true; gmap.repeat.set(1 / 24, 1 / 24)
    const gm = new THREE.MeshStandardMaterial({ map: gmap, bumpMap: gmap, bumpScale: 0.55, roughness: 0.96, metalness: 0 })
    const g = new THREE.Mesh(new THREE.ShapeGeometry(shp, 1), gm); g.rotation.x = -Math.PI / 2; g.position.y = EARTH_TOP + 0.006; g.receiveShadow = true; world.add(g)
  })()
  earthBlock(-GW / 2, EX.x0, EX.z0, GD / 2)                          /* left of it */
  earthBlock(EX.x1, GW / 2, EX.z0, GD / 2)                           /* right of it */
  earthBlock(EX.x0, EX.x1, EX.z1, GD / 2)                          /* in front of it: the site is closed all round */
  const bedrock = new THREE.Mesh(new THREE.BoxGeometry(EX.x1 - EX.x0, 0.6, EX.z1 - EX.z0), new THREE.MeshStandardMaterial({ color: 0x2A2621, roughness: 1 }))
  bedrock.position.set((EX.x0 + EX.x1) / 2, EARTH_BOT + 0.3, (EX.z0 + EX.z1) / 2); bedrock.receiveShadow = true; world.add(bedrock)
  /* BACKFILL (client: "cover the ground after it's done with the piling"): once the piles, caps
     and ground beams have landed, the excavation fills back to grade before the slab goes down,
     and from stage 02 the building stands on finished ground */
  const fillH = EARTH_TOP - EARTH_BOT
  const fillTop = earthTop.clone(); fillTop.map = gravel.clone(); fillTop.map.needsUpdate = true; fillTop.map.repeat.set((EX.x1 - EX.x0) / 24, (EX.z1 - EX.z0) / 24); fillTop.bumpMap = fillTop.map; fillTop.bumpScale = 0.55
  const backfill = new THREE.Mesh(new THREE.BoxGeometry(EX.x1 - EX.x0, fillH, EX.z1 - EX.z0), [earthSide, earthSide, fillTop, earthBot, earthSide, earthSide])   /* the pit floor is soil, not a black void, so the depth reads from the strata on the sides */
  const cap = new THREE.Mesh(new THREE.PlaneGeometry(EX.x1 - EX.x0, EX.z1 - EX.z0), fillTop)
  cap.rotation.x = -Math.PI / 2; cap.position.set((EX.x0 + EX.x1) / 2, EARTH_TOP + 0.012, (EX.z0 + EX.z1) / 2); cap.receiveShadow = true; cap.visible = false; world.add(cap)
  backfill.position.set((EX.x0 + EX.x1) / 2, EARTH_BOT, (EX.z0 + EX.z1) / 2); backfill.scale.y = 0.001; backfill.receiveShadow = true; world.add(backfill)
  /* the finished site is paved: saw-cut concrete hardstanding fades in over the gravel as the job ends */
  const paveMap = hard.clone(); paveMap.needsUpdate = true; paveMap.repeat.set(GW / 6, GD / 6)
  const pave = new THREE.Mesh(new THREE.PlaneGeometry(GW, GD), new THREE.MeshStandardMaterial({ map: paveMap, roughness: 0.9, metalness: 0, transparent: true, opacity: 0, depthWrite: false }))
  pave.rotation.x = -Math.PI / 2; pave.position.set(0, EARTH_TOP + 0.02, 0); pave.receiveShadow = true; pave.visible = false; world.add(pave)
  let SPOIL = null
  function setBackfill(u) {
    if (driven) { backfill.visible = false; cap.visible = false; pave.visible = false; if (SPOIL) SPOIL.visible = false; return }
    /* (client: "so it starts as a construction site"): at u=0 the ground is untouched; the pit is
       dug open over the first 14% of stage 01 while the excavator works, the piles go in, and
       once piles, caps and ground beams have landed the pit is backfilled to grade */
    /* smoothstep, not ease-out: the pit opens over the first 0.16 units so the excavation is
       something you watch, not something that has already happened at the first wheel tick */
    const dg = clamp(u / 0.16, 0, 1), dug = dg * dg * (3 - 2 * dg)
    const refill = ease(clamp((u - 0.5) / 0.14, 0, 1))
    if (SPOIL) { const f = clamp(dug - refill, 0, 1); SPOIL.scale.set(1, 1, 1); SPOIL.visible = f > 0.01; SPOIL.position.y = groundY - 2.4 + 4.6 * ease(f) }   /* 7 Sep: rises, never grows */
    const f = Math.max(1 - dug, refill)
    backfill.scale.y = Math.max(0.001, f); backfill.position.y = EARTH_BOT + f * fillH / 2
    backfill.visible = f > 0.002
    cap.visible = f > 0.985
    pave.material.opacity = clamp((u - 8.55) / 0.3, 0, 1); pave.visible = pave.material.opacity > 0.01
  }

  /* ---- procedural textures: the patterns that make a fab read as a fab ------ */
  function tile(draw, size = 256) {
    const c = document.createElement('canvas'); c.width = c.height = size
    const g = c.getContext('2d'); draw(g, size)
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t
  }
  /* waffle slab: a grid of dark perforations in the grey deck, 0.6m module */
  const waffleTex = tile((g, n) => { g.fillStyle = '#AEB4BB'; g.fillRect(0, 0, n, n)
    g.fillStyle = '#3B4149'; const cell = n / 4, hole = cell * 0.3
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) g.fillRect(i * cell + (cell - hole) / 2, j * cell + (cell - hole) / 2, hole, hole) })
  waffleTex.repeat.set(PITCH / 2.4, DEPTH / 2.4)   /* 4 cells per tile -> 0.6m module */
  /* FFU field: a dark ceiling module grid with a lighter frame */
  const ffuTex = tile((g, n) => { g.fillStyle = '#D5DAE2'; g.fillRect(0, 0, n, n)
    g.fillStyle = '#1E4D57'; const cw = n / 2, ch = n / 4, m = 6
    for (let i = 0; i < 2; i++) for (let j = 0; j < 4; j++) g.fillRect(i * cw + m, j * ch + m, cw - 2 * m, ch - 2 * m) })
  ffuTex.repeat.set(PITCH / 2.4, DEPTH / 2.4)
  /* cleanroom wall: cyan glazed panels with white mullions on a 1.2m module */
  const wallTex = tile((g, n) => { g.fillStyle = '#39D6E6'; g.fillRect(0, 0, n, n)
    g.strokeStyle = '#EAFBFD'; g.lineWidth = 6; g.strokeRect(3, 3, n - 6, n - 6) })

  /* surface grain: a value-noise tile used as roughness for concrete, and a streaked tile as
     roughness for steel, so flat colour still reads as material under the key light */
  const noiseTex = tile((g, n) => { const im = g.createImageData(n, n); const d = im.data
    for (let i = 0; i < n * n; i++) { const x = i % n, y = (i / n) | 0
      const v = 150 + 40 * Math.sin(x * 0.19 + Math.sin(y * 0.07) * 3) * Math.cos(y * 0.23 + Math.sin(x * 0.05) * 2) + ((x * 7919 + y * 104729) % 23) * 1.4
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = Math.max(0, Math.min(255, v)); d[i * 4 + 3] = 255 }
    g.putImageData(im, 0, 0) }, 128)
  noiseTex.colorSpace = THREE.NoColorSpace; noiseTex.repeat.set(3, 3)
  const streakTex = tile((g, n) => { g.fillStyle = '#9a9a9a'; g.fillRect(0, 0, n, n)
    for (let i = 0; i < 260; i++) { g.fillStyle = 'rgba(' + (i % 2 ? '255,255,255' : '0,0,0') + ',' + (0.05 + (i % 5) * 0.02) + ')'; g.fillRect(0, (i * 37) % n, n, 1) } }, 128)
  streakTex.colorSpace = THREE.NoColorSpace; streakTex.repeat.set(1, 6)

  /* flow: a soft band that travels along a pipe's length. CylinderGeometry maps V along the axis,
     so offsetting the emissive map in V runs the band down the pipe. */
  const flowTex = tile((g, n) => { const grad = g.createLinearGradient(0, 0, 0, n); grad.addColorStop(0, '#000'); grad.addColorStop(0.42, '#000'); grad.addColorStop(0.5, '#fff'); grad.addColorStop(0.58, '#000'); grad.addColorStop(1, '#000'); g.fillStyle = grad; g.fillRect(0, 0, n, n) }, 64)
  flowTex.colorSpace = THREE.NoColorSpace; flowTex.repeat.set(1, 2)
  const FLOW = []
  function flowing(m, speed = 1) { m.emissiveMap = flowTex.clone(); m.emissiveMap.needsUpdate = true; m.emissiveMap.wrapS = m.emissiveMap.wrapT = THREE.RepeatWrapping; m.emissiveMap.repeat.set(1, 2); m.userData.flow = speed; FLOW.push(m); return m }

  /* ---- system registry --------------------------------------------------- */
  const systems = {}
  SYS.forEach(k => { systems[k] = { parts: [], mats: [], group: new THREE.Group(), built: -1, look: '' }; world.add(systems[k].group) })
  systems.fin = { parts: [], mats: [], group: new THREE.Group(), built: -1, look: '' }; world.add(systems.fin.group)   /* the finish: envelope, entrance, plant, site */

  function material(k, hex, opt = {}) {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color: hex, roughness: 0.62, metalness: 0.08, envMapIntensity: 0.5 }, opt))
    m.userData.base = new THREE.Color(hex); m.userData.baseOpacity = opt.opacity !== undefined ? opt.opacity : 1
    m.userData.baseTransparent = !!opt.transparent
    m.userData.hasEmissive = opt.emissive !== undefined
    /* 10 Sep (Bazil: "can you further make the render realistic"). Every material in the scene
       carried 16% of its own colour as EMISSIVE. Nothing real glows, and a uniform self-lit
       term is the single biggest thing that makes a render read as CG: it lifts every shadow
       side back toward the lit side, flattens the form the key light is trying to describe,
       and washes out the ambient occlusion that is doing the contact work. Down to 5%, which
       is enough to keep the darkest recesses off pure black and no more. The ACTIVE system's
       lift is set separately in look(). */
    if (!m.userData.hasEmissive) m.emissive.copy(m.userData.base).multiplyScalar(0.05)
    systems[k].mats.push(m); return m
  }
  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3()
  /* one InstancedMesh per part type; `places` = [{x,y,z, rx,ry,rz, sx,sy,sz}] in building space */
  function part(k, geo, mat, places, opt = {}) {
    const mesh = new THREE.InstancedMesh(geo, mat, places.length)
    mesh.castShadow = opt.shadow !== false; mesh.receiveShadow = opt.receive !== false
    const base = [], stag = []
    const span = BAYS * PITCH
    const hero = []
    places.forEach((pl, i) => {
      /* their reference builds ONE bay close up and only reveals the whole facility at the end:
         the three middle bays are the hero cluster for stages 01-08, the rest arrive at Overall */
      const bay = Math.round(pl.x / PITCH + (BAYS - 1) / 2)
      hero.push(opt.all || (bay >= HERO_A && bay <= HERO_B) ? 1 : 0)
      _p.set(pl.x, pl.y, pl.z)
      _q.setFromEuler(new THREE.Euler(pl.rx || 0, pl.ry || 0, pl.rz || 0))
      _s.set(pl.sx || 1, pl.sy || 1, pl.sz || 1)
      _m.compose(_p, _q, _s); base.push(_m.clone())
      /* stagger along the building, plus a little per-instance scatter, so a system builds
         front to back rather than all at once */
      /* the camera stands at the +x end, so each system builds from the bays nearest the viewer
         toward the far end: the assembly happens in front of you, not at the back of the building */
      const inHero = bay >= HERO_A && bay <= HERO_B
      const spanH = (HERO_B - HERO_A + 1) * PITCH
      const along = inHero ? 1 - (pl.x - (HERO_CX - spanH / 2)) / spanH : 1 - (pl.x + span / 2) / span
      /* offset + descent window (0.42) must stay inside the stage, or a late part is still in
         the air when the next stage begins and gets ghosted mid-drop: cap at 0.56 */
      /* 9 Sep (client: "timing too fast, cannot see in time, not enough detail seen"). The
         along-building spread was only 0.14 wide, so every part in an `after` group landed
         almost together and the eye had nothing to follow. 0.24 spreads the same parts across
         nearly twice the build, which is what makes the assembly readable.
         BUDGET: max stagger + descent window must stay <= 1.0 or a late part is still falling
         when the stage ends and gets ghosted mid-drop. 0.24 + 0.04 + 0.34 = 0.62, + 0.36 = 0.98. */
      stag.push(clamp(along * 0.24 + ((i * 0.6180339) % 1) * 0.04 + (opt.after || 0) * 0.34, 0, 0.62))
      mesh.setMatrixAt(i, _m)
    })
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    mesh.visible = false
    /* entry: where the part comes FROM. 'above' is a crane lift and needs open sky; 'below' is
       lifted up from the floor beneath it; 'side' is rolled in across the floor from the open
       (camera) side; 'end' comes in from the building end. Nothing passes through built work. */
    const dist = opt.drop !== undefined ? opt.drop : 4
    const from = opt.from || 'above'
    const dir = from === 'below' ? new THREE.Vector3(0, -dist, 0) : from === 'side' ? new THREE.Vector3(0, 0, dist) : from === 'back' ? new THREE.Vector3(0, 0, -dist) : from === 'end' ? new THREE.Vector3(dist, 0, 0) : new THREE.Vector3(0, dist, 0)
    mesh.userData.sys = k
    systems[k].parts.push({ mesh, base, stag, hero, drop: dist, dir })
    systems[k].group.add(mesh)
    return mesh
  }
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d)
  const cyl = (r, h, n = 14) => new THREE.CylinderGeometry(r, r, h, n)
  const bayX = b => (b - (BAYS - 1) / 2) * PITCH

  /* ---- 01 civil & structural ------------------------------------------- */
  ;(function buildStructure() {
    const k = 'st'
    const concrete = material(k, C.concrete, { roughness: 0.92, metalness: 0, roughnessMap: noiseTex, bumpMap: noiseTex, bumpScale: 0.02 })
    const colMat = material(k, C.column, { roughness: 0.55, metalness: 0.05 })
    const subMat = material(k, C.subslab, { roughness: 0.95 }); subMat.userData.veil = true
    const floorMat = material(k, 0xFFFFFF, { roughness: 0.6, metalness: 0.08, map: waffleTex }); floorMat.userData.veil = true
    const edgeMat = material(k, C.floorEdge, { roughness: 0.7 })

    /* piles: a 2x2 group under every column pad, tips at -9 */
    const piles = [], caps = [], gbX = [], gbZ = [], cols = []
    for (let b = 0; b < BAYS; b++) {
      const x = bayX(b)
      LINES.forEach(z => {
        /* their frames: two piles in a row under each cap, caps about 2m, tips well below grade */
        piles.push({ x, y: (Y.pileTip + Y.capTop - 1) / 2, z })
        caps.push({ x, y: Y.capTop - 0.5, z })
        cols.push({ x, y: (Y.slabTop + Y.colTop) / 2, z })
      })
      /* ground beams: along the building on each line, across it between lines */
      LINES.forEach(z => gbX.push({ x: x + PITCH / 2, y: Y.beamTop - 0.4, z }))
      gbZ.push({ x, y: Y.beamTop - 0.4, z: -5 }); gbZ.push({ x, y: Y.beamTop - 0.4, z: 5 })
    }
    part(k, cyl(0.42, Y.capTop - 1 - Y.pileTip), concrete, piles, { drop: 9.5, after: 0.55, shadow: false })   /* driven down once the pit is open */
    part(k, box(1.7, 1, 1.7), concrete, caps, { drop: 9, after: 0.65 })
    part(k, box(PITCH, 0.8, 0.55), concrete, gbX.slice(0, -LINES.length), { drop: 9, after: 0.75 })
    part(k, box(0.55, 0.8, 10), concrete, gbZ, { drop: 9, after: 0.75 })
    /* sub-fab slab, one plate per bay */
    part(k, box(PITCH, 0.6, DEPTH + 1), subMat, Array.from({ length: BAYS }, (_, b) => ({ x: bayX(b), y: Y.slabTop - 0.3, z: 0 })), { drop: 9, after: 1.3 })
    part(k, box(0.95, Y.colTop - Y.slabTop, 0.95), colMat, cols, { drop: 11, after: 1.35 })
    /* the raised fab floor: a deck plate per bay with a deeper edge beam, waffle read from the shading */
    part(k, box(PITCH, 1.0, DEPTH + 1), floorMat, Array.from({ length: BAYS }, (_, b) => ({ x: bayX(b), y: Y.floorTop - 0.5, z: 0 })), { drop: 12, after: 1.4 })
    part(k, box(PITCH, 0.9, 0.5), edgeMat, Array.from({ length: BAYS * 2 }, (_, i) => ({ x: bayX(i >> 1), y: Y.floorTop - 0.45, z: (i & 1 ? 1 : -1) * (DEPTH / 2 + 0.25) })), { drop: 12, after: 1.4 })
    /* the raised floor bears on steel joists across the depth, orange in their model, seen from
       the sub-fab: one every 3m, hung between the column lines */
    const joistMat = material(k, C.steel, { roughness: 0.42, metalness: 0.55 })
    const joists = []
    for (let b = 0; b < BAYS; b++) for (let i = 0; i < 4; i++) joists.push({ x: bayX(b) - PITCH / 2 + 1.5 + i * 3, y: Y.floorTop - 1.3, z: 0 })
    part(k, box(0.28, 0.6, DEPTH), joistMat, joists, { drop: 12, after: 1.4 })
    /* and along the building on the three column lines, so the sub-fab ceiling reads as their
       orange grid rather than a row of bars */
    const joistsX = []
    for (let b = 0; b < BAYS; b++) LINES.forEach(z => { joistsX.push({ x: bayX(b), y: Y.floorTop - 1.3, z: z - 3.3 }); joistsX.push({ x: bayX(b), y: Y.floorTop - 1.3, z: z + 3.3 }) })
    part(k, box(PITCH, 0.5, 0.24), joistMat, joistsX, { drop: 12, after: 1.4 })
  })()

  /* ---- 02 architectural: steel roof + envelope --------------------------- */
  ;(function buildEnvelope() {
    const k = 'ar'
    const steel = material(k, C.steel, { roughness: 0.5, metalness: 0.6, roughnessMap: streakTex })
    const deckMat = material(k, C.deck, { roughness: 0.6, metalness: 0.2 }); deckMat.userData.veil = true
    const wallMat = material(k, C.wall, { roughness: 0.55, metalness: 0.1, transparent: true, opacity: 0.5, depthWrite: false }); wallMat.userData.veil = true
    const trussH = Y.trussTop - Y.trussBot, midY = (Y.trussTop + Y.trussBot) / 2
    /* a truss on every column line, spanning the bay: two chords, verticals, diagonals */
    const chords = [], verts = [], diags = [], purlins = [], posts = []
    for (let b = 0; b < BAYS; b++) {
      const x0 = bayX(b) - PITCH / 2, xc = bayX(b)
      LINES.forEach(z => {
        chords.push({ x: xc, y: Y.trussBot, z }); chords.push({ x: xc, y: Y.trussTop, z })
        for (let i = 0; i <= 4; i++) {
          const x = x0 + i * (PITCH / 4)
          verts.push({ x, y: midY, z })
          if (i < 4) diags.push({ x: x + PITCH / 8, y: midY, z, rz: (i % 2 ? -1 : 1) * Math.atan2(trussH, PITCH / 4) })
        }
        /* roof posts: the truss bears on a short steel post over each column */
        posts.push({ x: xc, y: (Y.colTop + Y.floorTop) / 2 + (Y.trussBot - Y.floorTop) / 2 + 0.2, z })
      })
      /* purlins across the depth at quarter points of the bay */
      for (let i = 0; i < 12; i++) purlins.push({ x: x0 + (i + 0.5) * (PITCH / 12), y: Y.trussTop + 0.22, z: 0 })
    }
    part(k, box(PITCH, 0.34, 0.34), steel, chords, { drop: 14, after: 0.05 })
    part(k, box(0.22, trussH, 0.22), steel, verts, { drop: 14, after: 0.12 })
    part(k, box(0.2, Math.hypot(trussH, PITCH / 4), 0.2), steel, diags, { drop: 14, after: 0.16 })
    part(k, box(0.9, Y.trussBot - Y.floorTop + 0.4, 0.9), material(k, 0x9AA1A9, { roughness: 0.9, metalness: 0 }), posts, { drop: 13, after: 0 })
    part(k, box(0.2, 0.26, DEPTH + 2), steel, purlins, { drop: 14, after: 0.3 })
    /* roof deck, one plate per bay, and the wall envelope on the far side and both ends */
    part(k, box(PITCH, 0.16, DEPTH + 2.4), deckMat, Array.from({ length: BAYS }, (_, b) => ({ x: bayX(b), y: Y.roof, z: 0 })), { drop: 14, after: 0.45 })
    const walls = []
    for (let b = 0; b < BAYS; b++) walls.push({ x: bayX(b), y: (Y.floorTop + Y.roof) / 2, z: -(DEPTH / 2 + 1.1), sx: 1, sy: 1, sz: 1 })
    part(k, box(PITCH, Y.roof - Y.floorTop, 0.18), wallMat, walls, { from: 'back', drop: 26, after: 0.55, shadow: false })
    /* WALKWAYS (client: "walkways for people to go through"; frame 28): white handrailed access
       platforms, one along each sub-fab pipe rack and one along each roof truss line */
    const grateMat = material(k, 0x8A9099, { roughness: 0.6, metalness: 0.5 })
    const railMat = material(k, 0xF3F4F6, { roughness: 0.4, metalness: 0.4 })
    const grates = [], posts2 = [], rails = []
    const walk = (y, z) => { for (let b = 0; b < BAYS; b++) { grates.push({ x: bayX(b), y, z })
      for (let i = 0; i < 8; i++) [-0.6, 0.6].forEach(dz => posts2.push({ x: bayX(b) - PITCH / 2 + 0.75 + i * 1.5, y: y + 0.55, z: z + dz }))
      ;[0.5, 1.05].forEach(dy => [-0.6, 0.6].forEach(dz => rails.push({ x: bayX(b), y: y + dy, z: z + dz }))) } }
    walk(Y.floorTop - 3.0, -4.2); walk(Y.floorTop - 3.0, 3.6)            /* sub-fab, either side of the racks */
    LINES.forEach(z => walk(Y.trussBot + 0.3, z + 1.4))                    /* roof space, beside each truss */
    part(k, box(PITCH, 0.08, 1.2), grateMat, grates, { from: 'below', drop: 5, after: 0.5, shadow: false })
    part(k, box(0.05, 1.1, 0.05), railMat, posts2, { from: 'below', drop: 5, after: 0.55, shadow: false })
    part(k, box(PITCH, 0.05, 0.05), railMat, rails, { from: 'below', drop: 5, after: 0.58, shadow: false })
    part(k, box(0.18, Y.roof - Y.floorTop, DEPTH + 2.4), wallMat,
      [{ x: -(BAYS * PITCH) / 2 - 0.1, y: (Y.floorTop + Y.roof) / 2, z: 0 }, { x: (BAYS * PITCH) / 2 + 0.1, y: (Y.floorTop + Y.roof) / 2, z: 0 }], { from: 'end', drop: 40, after: 0.7, shadow: false })
  })()

  /* ---- 03 process utilities: sub-fab pipework ----------------------------- */
  ;(function buildProcess() {
    const k = 'pu'
    const green = flowing(material(k, C.green, { roughness: 0.35, metalness: 0.45 }), 1)
    const purple = flowing(material(k, C.purple, { roughness: 0.35, metalness: 0.45 }), 0.8)
    const runs = [], drops = [], hangers = []
    /* long headers run the length of the building under the fab floor, hung from the deck,
       at two depths and two sizes, exactly where their model carries them */
    const yh = Y.floorTop - 1.4
    ;[{ z: -6.5, r: 0.42, m: 'g' }, { z: -5.2, r: 0.26, m: 'p' }, { z: 5.6, r: 0.42, m: 'g' }, { z: 7.0, r: 0.26, m: 'p' }].forEach(h => {
      for (let b = 0; b < BAYS; b++) runs.push({ x: bayX(b), y: yh - (h.r > 0.3 ? 0 : 0.9), z: h.z, rz: Math.PI / 2, sx: 1, sy: 1, sz: 1, m: h.m, r: h.r })
      for (let b = 0; b < BAYS; b++) [-4, 0, 4].forEach(dx => hangers.push({ x: bayX(b) + dx, y: Y.floorTop - 0.7, z: h.z }))
    })
    /* drops: every bay sends two risers up through the floor to the tools above */
    for (let b = 0; b < BAYS; b++) [-3, 3].forEach(dx => { drops.push({ x: bayX(b) + dx, y: (yh + Y.floorTop + 0.9) / 2, z: -6.5, m: 'g' }); drops.push({ x: bayX(b) + dx + 1, y: (yh - 0.9 + Y.floorTop + 0.9) / 2, z: 5.6, m: 'p' }) })
    part(k, cyl(0.62, PITCH, 18), green, runs.filter(r => r.m === 'g' && r.r > 0.3), { from: 'below', drop: 6, after: 0.05 })
    part(k, cyl(0.42, PITCH, 14), purple, runs.filter(r => r.m === 'p'), { from: 'below', drop: 6, after: 0.1 })
    part(k, cyl(0.24, Y.floorTop + 0.9 - yh, 10), green, drops.filter(d => d.m === 'g'), { from: 'below', drop: 6, after: 0.4 })
    part(k, cyl(0.18, Y.floorTop + 0.9 - (yh - 0.9), 10), purple, drops.filter(d => d.m === 'p'), { from: 'below', drop: 6, after: 0.45 })
    part(k, box(0.08, 0.7, 0.08), material(k, 0xB8C0CC, { roughness: 0.5, metalness: 0.6 }), hangers, { from: 'below', drop: 6, after: 0.02, shadow: false })
    /* colour check against their frames: the sub-fab also carries a teal PCW header and a
       dark-red hot-return line, and gas cabinets stand along the wall line */
    const teal = flowing(material(k, 0x14B8A6, { roughness: 0.35, metalness: 0.45 }), 1.2)
    const hot = flowing(material(k, 0x2563EB, { roughness: 0.4, metalness: 0.4 }), 0.7)
    const gasMat = material(k, 0xE5E7EB, { roughness: 0.5, metalness: 0.2 })
    const gasDoor = material(k, 0x374151, { roughness: 0.6, metalness: 0.2 })
    const tealRuns = [], hotRuns = [], gas = [], gasDoors = []
    for (let b = 0; b < BAYS; b++) {
      tealRuns.push({ x: bayX(b), y: yh - 2.0, z: -7.6, rz: Math.PI / 2 })
      hotRuns.push({ x: bayX(b), y: yh - 2.0, z: 8.2, rz: Math.PI / 2 })
      if (b % 2 === 1) for (let i = 0; i < 3; i++) { gas.push({ x: bayX(b) - 2 + i * 2, y: Y.slabTop + 1.1, z: 10.6 }); gasDoors.push({ x: bayX(b) - 2 + i * 2, y: Y.slabTop + 1.1, z: 10.14 }) }
    }
    part(k, cyl(0.5, PITCH, 16), teal, tealRuns, { from: 'below', drop: 6, after: 0.16 })
    part(k, cyl(0.44, PITCH, 14), hot, hotRuns, { from: 'below', drop: 6, after: 0.2 })
    part(k, box(1.4, 2.2, 0.8), gasMat, gas, { from: 'side', drop: 30, after: 0.6 })
    part(k, box(1.1, 1.7, 0.06), gasDoor, gasDoors, { from: 'side', drop: 30, after: 0.62, shadow: false })
    /* pipe racks: a steel frame under the floor joists carrying the headers, one per bay per side */
    const rackMat = material(k, 0x8B939E, { roughness: 0.55, metalness: 0.55 })
    const rackPosts = [], rackBeams = []
    for (let b = 0; b < BAYS; b++) [-6.5, 6.3].forEach(z => {
      rackBeams.push({ x: bayX(b), y: yh - 1.35, z, sx: 1 })
      ;[-4.5, 4.5].forEach(dx => rackPosts.push({ x: bayX(b) + dx, y: (Y.slabTop + yh - 1.35) / 2, z }))
    })
    part(k, box(PITCH - 0.6, 0.22, 1.6), rackMat, rackBeams, { from: 'below', drop: 6, after: 0.0, shadow: false })
    part(k, box(0.18, yh - 1.35 - Y.slabTop, 0.18), rackMat, rackPosts, { from: 'below', drop: 6, after: 0.0, shadow: false })
    /* (client: "piping... must look super real"): flanged joints at every bay line on the big
       headers, a valve with a handwheel on every riser, and U-bolt supports on the racks */
    const flangeMat = material(k, 0xCBD5E1, { roughness: 0.35, metalness: 0.7 })
    const valveMat = material(k, 0x374151, { roughness: 0.5, metalness: 0.5 })
    const wheelMat = material(k, 0xDC2626, { roughness: 0.5, metalness: 0.3 })
    const flG = [], flP = [], valves = [], wheels = [], ubolts = []
    for (let b = 0; b <= BAYS; b++) {
      const x = bayX(0) - PITCH / 2 + b * PITCH
      flG.push({ x, y: yh, z: -6.5, rz: Math.PI / 2 }); flG.push({ x, y: yh, z: 5.6, rz: Math.PI / 2 })
      flP.push({ x, y: yh - 0.9, z: -5.2, rz: Math.PI / 2 }); flP.push({ x, y: yh - 0.9, z: 7.0, rz: Math.PI / 2 })
    }
    drops.forEach(d => { valves.push({ x: d.x, y: Y.floorTop - 0.75, z: d.m === 'g' ? -6.5 : 5.6 }); wheels.push({ x: d.x + 0.32, y: Y.floorTop - 0.75, z: d.m === 'g' ? -6.5 : 5.6, rz: Math.PI / 2 }) })
    for (let b = 0; b < BAYS; b++) [-3, 0, 3].forEach(dx => [-6.5, 5.6].forEach(z => ubolts.push({ x: bayX(b) + dx, y: yh + 0.5, z })))
    part(k, cyl(0.78, 0.18, 18), flangeMat, flG, { from: 'below', drop: 6, after: 0.3, shadow: false })
    part(k, cyl(0.56, 0.16, 16), flangeMat, flP, { from: 'below', drop: 6, after: 0.32, shadow: false })
    part(k, box(0.42, 0.42, 0.42), valveMat, valves, { from: 'below', drop: 6, after: 0.5, shadow: false })
    part(k, new THREE.TorusGeometry(0.22, 0.035, 8, 20), wheelMat, wheels, { from: 'below', drop: 6, after: 0.52, shadow: false })
    part(k, box(0.16, 0.5, 1.5), material(k, 0x9CA3AF, { roughness: 0.5, metalness: 0.6 }), ubolts, { from: 'below', drop: 6, after: 0.2, shadow: false })
  })()

  /* ---- 04 fire protection: sprinkler mains and risers ---------------------- */
  ;(function buildFire() {
    const k = 'fp'
    const red = flowing(material(k, C.red, { roughness: 0.4, metalness: 0.4 }), 0.5)
    const mains = [], risers = [], branches = []
    /* one main under the fab floor, one under the roof; risers on every column line tie them */
    for (let b = 0; b < BAYS; b++) {
      mains.push({ x: bayX(b), y: Y.floorTop - 2.3, z: 2.2, rz: Math.PI / 2 })
      mains.push({ x: bayX(b), y: Y.trussBot - 0.5, z: -3, rz: Math_PI2() })
      risers.push({ x: bayX(b) - PITCH / 2 + 1.6, y: (Y.floorTop - 2.3 + Y.trussBot - 0.5) / 2, z: -3 })   /* 7 Sep: 0.7 sat inside the 0.9-wide column */
      ;[-4.8, -1.4, 2.6].forEach(dx => branches.push({ x: bayX(b) + dx, y: Y.trussBot - 0.5, z: 0, rx: Math.PI / 2 }))   /* 7 Sep: off the bay-centre post */
    }
    function Math_PI2() { return Math.PI / 2 }
    part(k, cyl(0.3, PITCH, 14), red, mains, { from: 'below', drop: 7, after: 0.05 })
    part(k, cyl(0.2, Y.trussBot - 0.5 - (Y.floorTop - 2.3), 10), red, risers, { from: 'below', drop: 7, after: 0.35 })
    part(k, cyl(0.14, DEPTH - 6, 10), red, branches, { from: 'below', drop: 7, after: 0.5, shadow: false })
  })()

  /* ---- 05 air-conditioning: ductwork in the roof space ---------------------- */
  ;(function buildAir() {
    const k = 'ac'
    const duct = flowing(material(k, C.cyan, { roughness: 0.3, metalness: 0.5 }), 1.4)
    const ductDk = flowing(material(k, 0x0E9FB5, { roughness: 0.35, metalness: 0.5 }), 1.4)
    const mains = [], branches = [], stubs = []
    const yd = Y.trussBot - 1.9
    for (let b = 0; b < BAYS; b++) {
      /* two rectangular mains run the length of the building above the cleanroom ceiling */
      mains.push({ x: bayX(b), y: yd, z: -4 }); mains.push({ x: bayX(b), y: yd, z: 6 })
      /* branches drop across the depth from each main at the bay centre, feeding the FFU plenum */
      branches.push({ x: bayX(b) + 2.6, y: yd - 0.2, z: 1, rx: Math.PI / 2 })   /* 7 Sep: +2.6 clears the bay-centre post */
      ;[-4, 6].forEach(z => stubs.push({ x: bayX(b), y: (Y.ceiling + yd - 0.6) / 2, z }))
    }
    part(k, box(PITCH, 1.6, 2.4), duct, mains, { from: 'below', drop: 7, after: 0.05 })
    /* every 3 m a flanged joint, and a pair of threaded-rod hangers up to the purlins */
    const flanges = [], hangers = []
    for (let b = 0; b < BAYS; b++) [-4, 6].forEach(z => { for (let i = 0; i < 4; i++) { const x = bayX(b) - PITCH / 2 + 1.5 + i * 3; flanges.push({ x, y: yd, z }); [-1.05, 1.05].forEach(dz => hangers.push({ x, y: (yd + 0.8 + Y.trussBot) / 2, z: z + dz })) } })
    part(k, box(0.12, 1.8, 2.62), ductDk, flanges, { from: 'below', drop: 7, after: 0.12, shadow: false })
    part(k, box(0.05, Y.trussBot - (yd + 0.8), 0.05), material(k, 0x9AA1A9, { roughness: 0.6, metalness: 0.6 }), hangers, { from: 'below', drop: 7, after: 0.08, shadow: false })
    part(k, cyl(0.8, 8.6, 16), ductDk, branches, { from: 'below', drop: 7, after: 0.4 })
    part(k, box(1.3, yd - 0.6 - Y.ceiling, 1.3), ductDk, stubs, { from: 'below', drop: 7, after: 0.6 })
    /* frame 42: the branches turn down through the ceiling on 90-degree elbows rather than
       ending in the air: a short horizontal leg meets a vertical leg over each stub */
    const elbH = [], elbV = []
    for (let b = 0; b < BAYS; b++) [-4, 6].forEach(z => {
      elbH.push({ x: bayX(b) + 2.6, y: yd - 0.2, z: z + (z < 0 ? 1.6 : -1.6), rx: Math.PI / 2 })
      elbV.push({ x: bayX(b) + 2.6, y: yd - 0.2 - 1.1, z })
    })
    part(k, cyl(0.8, 3.2, 16), ductDk, elbH, { from: 'below', drop: 7, after: 0.5 })
    part(k, cyl(0.8, 2.2, 16), ductDk, elbV, { from: 'below', drop: 7, after: 0.55 })
    /* 4 Sep (client: "show the flow of air coming from where and going out to where, to the
       external tubing"): the loop now has an OUTSIDE. A fresh-air intake enters the supply main
       at the +x end of the envelope and a return leaves the return main at the same end, so
       the particles below have a real source and a real sink. */
    const xEnd = (BAYS * PITCH) / 2
    part(k, box(9, 1.6, 2.4), duct, [{ x: xEnd + 3.5, y: yd, z: -4 }, { x: xEnd + 3.5, y: yd, z: 6 }], { from: 'end', drop: 7, after: 0.7, all: true })
    part(k, box(2.2, 2.6, 3.2), ductDk, [{ x: xEnd + 8.6, y: yd, z: -4 }, { x: xEnd + 8.6, y: yd, z: 6 }], { from: 'end', drop: 7, after: 0.8, all: true })
    systems[k].pulse = [ductDk, duct]                          /* airflow: the ducts breathe while their stage is live */
  })()

  /* ---- airflow particles: supply in, down to the plenum, back up and out ---------
     One cloud of points travelling closed loops, one loop per hero bay: intake at the +x end ->
     along the SUPPLY main (z -4) -> down the stub into the plenum -> across under the ceiling ->
     up the RETURN stub (z 6) -> back along the return main -> out at the +x end. Supply runs cyan,
     return runs amber, so direction reads even in a still frame. Live only while the stage is
     active and landed, or at Overall. */
  const AIR = (function () {
    const yd = Y.trussBot - 1.9, xEnd = (BAYS * PITCH) / 2 + 9
    const loops = []
    for (let b = HERO_A; b <= HERO_B; b++) {
      const x = bayX(b)
      const pts = [
        new THREE.Vector3(xEnd, yd, -4), new THREE.Vector3(x + 2, yd, -4), new THREE.Vector3(x, yd - 0.4, -4),
        new THREE.Vector3(x, Y.ceiling + 0.6, -4), new THREE.Vector3(x, Y.ceiling - 0.4, -1), new THREE.Vector3(x, Y.ceiling - 0.4, 3),
        new THREE.Vector3(x, Y.ceiling + 0.6, 6), new THREE.Vector3(x, yd - 0.4, 6), new THREE.Vector3(x + 2, yd, 6), new THREE.Vector3(xEnd, yd, 6),
      ]
      loops.push(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.2))
    }
    const PER = 64, N = loops.length * PER   /* 7 Sep: fewer, so the loop reads as a line not a swarm */
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), t0 = new Float32Array(N)
    const cyan = new THREE.Color(0x67E8F9), amber = new THREE.Color(0xFBBF24)
    for (let i = 0; i < N; i++) t0[i] = Math.random()
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.55, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false, sizeAttenuation: true }))
    pts.visible = false; pts.frustumCulled = false; world.add(pts)
    const _v = new THREE.Vector3()
    return { pts, update(now, live) {
      pts.visible = live; if (!live) return
      for (let i = 0; i < N; i++) {
        const loop = loops[(i / PER) | 0], t = (t0[i] + now * 0.06) % 1
        loop.getPointAt(t, _v); pos[i * 3] = _v.x; pos[i * 3 + 1] = _v.y; pos[i * 3 + 2] = _v.z
        const c = t < 0.5 ? cyan : amber; col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true
    } }
  })()

  /* ---- 06 HT & LV electrical: containment and distribution ------------------ */
  ;(function buildElectrical() {
    const k = 'el'
    const tray = material(k, C.yellow, { roughness: 0.45, metalness: 0.5 })
    const trayP = material(k, 0x7C3AED, { roughness: 0.45, metalness: 0.5 })
    const panel = material(k, 0xD1D5DB, { roughness: 0.5, metalness: 0.3 })
    const runs = [], runsP = [], panels = [], ladders = []
    for (let b = 0; b < BAYS; b++) {
      /* 7 Sep: the roof-level trays sat on the z=10 post line and ran through every post; both inboard */
      runs.push({ x: bayX(b), y: Y.trussBot - 0.9, z: 7.4 }); runs.push({ x: bayX(b), y: Y.floorTop - 1.0, z: -8.6 })
      runsP.push({ x: bayX(b), y: Y.trussBot - 0.9, z: 8.4 }); runsP.push({ x: bayX(b), y: Y.floorTop - 1.0, z: -9.4 })
      /* a distribution board on the sub-fab wall line every second bay, fed by a vertical ladder */
      if (b % 2 === 0) { panels.push({ x: bayX(b) + 2.5, y: Y.slabTop + 1.3, z: -11.2 }); ladders.push({ x: bayX(b) + 2.5, y: (Y.slabTop + 2.3 + Y.floorTop - 1) / 2, z: -10.6 }) }
    }
    part(k, box(PITCH, 0.16, 0.9), tray, runs, { from: 'below', drop: 7, after: 0.05, shadow: false })
    part(k, box(PITCH, 0.16, 0.6), trayP, runsP, { from: 'below', drop: 7, after: 0.12, shadow: false })
    part(k, box(1.6, 2.2, 0.5), panel, panels, { from: 'below', drop: 7, after: 0.5 })
    part(k, box(0.5, Y.floorTop - 1 - (Y.slabTop + 2.3), 0.16), tray, ladders, { from: 'below', drop: 7, after: 0.6, shadow: false })
    /* their model's maroon switchboard, a yellow busbar duct along the sub-fab ceiling, and a
       finned transformer at grade by the end wall */
    const swMat = material(k, 0x7F1D1D, { roughness: 0.55, metalness: 0.3 })
    const swFace = material(k, 0x1F2937, { roughness: 0.6, metalness: 0.2 })
    const busMat = flowing(material(k, 0xFACC15, { roughness: 0.5, metalness: 0.5 }), 2.2)
    const trMat = material(k, 0x6B7280, { roughness: 0.6, metalness: 0.45 })
    const sw = [], swf = [], bus = [], tr = [], fins = []
    for (let b = 0; b < BAYS; b++) {
      if (b % 3 === 0) { sw.push({ x: bayX(b) - 3, y: Y.slabTop + 1.15, z: 10.4 }); swf.push({ x: bayX(b) - 3, y: Y.slabTop + 1.15, z: 9.98 }) }
      bus.push({ x: bayX(b), y: Y.floorTop - 1.75, z: -9.9 })
    }
    tr.push({ x: -(BAYS * PITCH) / 2 - 5, y: Y.capTop + 1.3, z: 4 }); tr.push({ x: -(BAYS * PITCH) / 2 - 5, y: Y.capTop + 1.3, z: -2 })
    for (let i = 0; i < 6; i++) { fins.push({ x: -(BAYS * PITCH) / 2 - 5 - 1.5, y: Y.capTop + 1.3, z: 4 - 1 + i * 0.4 }); fins.push({ x: -(BAYS * PITCH) / 2 - 5 - 1.5, y: Y.capTop + 1.3, z: -2 - 1 + i * 0.4 }) }
    part(k, box(3.2, 2.3, 0.9), swMat, sw, { from: 'side', drop: 30, after: 0.5 })
    part(k, box(2.9, 2.0, 0.06), swFace, swf, { from: 'side', drop: 30, after: 0.52, shadow: false })
    part(k, box(PITCH, 0.3, 0.3), busMat, bus, { from: 'below', drop: 7, after: 0.2, shadow: false })
    part(k, box(2.4, 2.6, 1.8), trMat, tr, { from: 'end', drop: -30, after: 0.7 })
    part(k, box(0.3, 2.0, 0.08), trMat, fins, { from: 'end', drop: -30, after: 0.72, shadow: false })
    /* (client: "wires... must look super real"): ladder rungs every 300mm on every tray, and
       cable bundles lying in them in the colours of the services they carry */
    const rungMat = material(k, 0xD4A017, { roughness: 0.5, metalness: 0.6 })
    const cabA = material(k, 0x111827, { roughness: 0.7 }), cabB = flowing(material(k, 0xEA580C, { roughness: 0.6 }), 1.2), cabC = flowing(material(k, 0x2563EB, { roughness: 0.6 }), 1.2)
    const rungs = [], cA = [], cB = [], cC = []
    runs.concat(runsP).forEach(r => { for (let i = 0; i < 40; i++) rungs.push({ x: r.x - PITCH / 2 + 0.15 + i * 0.3, y: r.y + 0.02, z: r.z }) })
    runs.forEach(r => { cA.push({ x: r.x, y: r.y + 0.16, z: r.z - 0.25, rz: Math.PI / 2 }); cB.push({ x: r.x, y: r.y + 0.16, z: r.z, rz: Math.PI / 2 }); cC.push({ x: r.x, y: r.y + 0.14, z: r.z + 0.25, rz: Math.PI / 2 }) })
    part(k, box(0.06, 0.06, 0.9), rungMat, rungs, { from: 'below', drop: 7, after: 0.06, shadow: false })
    part(k, cyl(0.07, PITCH, 8), cabA, cA, { from: 'below', drop: 7, after: 0.3, shadow: false })
    part(k, cyl(0.06, PITCH, 8), cabB, cB, { from: 'below', drop: 7, after: 0.33, shadow: false })
    part(k, cyl(0.06, PITCH, 8), cabC, cC, { from: 'below', drop: 7, after: 0.36, shadow: false })
    systems[k].pulse = [busMat, tray, trayP]                    /* current: the containment pulses while live */
  })()

  /* ---- 07 cleanroom system: ceiling grid, FFUs, plant ---------------------- */
  ;(function buildCleanroom() {
    const k = 'cr'
    const grid = material(k, 0xFFFFFF, { roughness: 0.5, metalness: 0.2, map: ffuTex }); grid.userData.veil = true
    const ffu = material(k, C.ffu, { roughness: 0.3, metalness: 0.1 })
    const plant = material(k, 0xFFFFFF, { map: louvreTex, roughness: 0.5, metalness: 0.3 })
    const plantLt = material(k, 0x93C5FD, { roughness: 0.5, metalness: 0.2 })
    const ceil = [], units = [], ahus = [], ahuTops = []
    for (let b = 0; b < BAYS; b++) {
      ceil.push({ x: bayX(b), y: Y.ceiling, z: 0 })
      /* a 3 x 8 field of fan filter units per bay, sitting in the grid */
      for (let i = 0; i < 3; i++) for (let j = 0; j < 8; j++) units.push({ x: bayX(b) - PITCH / 2 + 2 + i * 4, y: Y.ceiling + 0.36, z: -DEPTH / 2 + 1.5 + j * 3 })
      /* an air handler on the roof space over every second bay */
      if (b % 2 === 1) { ahus.push({ x: bayX(b), y: Y.trussBot - 1.3, z: 9.5 }); ahuTops.push({ x: bayX(b), y: Y.trussBot - 0.2, z: 9.5 }) }
    }
    part(k, box(PITCH, 0.12, DEPTH), grid, ceil, { from: 'below', drop: 7, after: 0.05, shadow: false })
    /* cleanroom partitions: cyan glazed panels on the far wall line and a corridor line at 1/3
       depth, floor to ceiling, mullions on a 1.2m module */
    const cwMat = material(k, 0xFFFFFF, { roughness: 0.2, metalness: 0.05, map: wallTex, transparent: true, opacity: 0.78, depthWrite: false }); cwMat.userData.veil = true
    const cw = []
    for (let b = 0; b < BAYS; b++) { cw.push({ x: bayX(b), y: (Y.floorTop + Y.ceiling) / 2, z: -DEPTH / 2 + 0.6 }); cw.push({ x: bayX(b), y: (Y.floorTop + Y.ceiling) / 2, z: -1.2 }) }
    const cwm = material(k, 0xFFFFFF, { roughness: 0.2, metalness: 0.05, map: wallTex, transparent: true, opacity: 0.78, depthWrite: false })
    wallTex.repeat.set(PITCH / 1.2, (Y.ceiling - Y.floorTop) / 1.2)
    part(k, box(PITCH, Y.ceiling - Y.floorTop, 0.12), cwMat, cw, { from: 'below', drop: 7, after: 0.18, shadow: false })
    part(k, box(3.4, 0.5, 2.4), ffu, units, { from: 'below', drop: 7, after: 0.3, shadow: false })
    part(k, box(6, 2.2, 3.2), plant, ahus, { from: 'below', drop: 7, after: 0.65 })
    part(k, box(5.6, 0.3, 2.9), plantLt, ahuTops, { from: 'below', drop: 7, after: 0.7, shadow: false })
    /* roof plant: exhaust stacks and scrubber cabinets on the deck, the part of a fab you see
       from outside */
    const stackMat = material(k, 0xC7CDD6, { roughness: 0.5, metalness: 0.45 })
    const scrubMat = material(k, 0x6B7280, { roughness: 0.6, metalness: 0.3 })
    const stacks = [], scrubbers = []
    for (let b = 0; b < BAYS; b++) { if (b % 3 === 1) { stacks.push({ x: bayX(b) + 3, y: Y.roof + 2.6, z: -6 }); stacks.push({ x: bayX(b) - 2, y: Y.roof + 2.2, z: -7 }) }
      if (b % 2 === 0) scrubbers.push({ x: bayX(b), y: Y.roof + 1.1, z: 6 }) }
    part(k, cyl(0.55, 5.2, 14), stackMat, stacks, { drop: 12, after: 0.8 })
    part(k, box(4.2, 2.2, 3), scrubMat, scrubbers, { drop: 12, after: 0.85 })
  })()

  /* ---- 08 tools hookup: process tools on the fab floor ----------------------- */
  ;(function buildTools() {
    const k = 'tl'
    const shell = material(k, 0xFFFFFF, { roughness: 0.35, metalness: 0.2, map: toolTex })
    const dark = material(k, 0x1F2937, { roughness: 0.6, metalness: 0.3 })
    const glass = material(k, 0x60A5FA, { roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.55, depthWrite: false })
    const bodies = [], tops = [], screens = [], plinths = []
    for (let b = 0; b < BAYS; b++) {
      /* two rows of tools per bay, three each, on the fab floor */
      for (let i = 0; i < 3; i++) [-6.5, 4.5].forEach(z => {
        const x = bayX(b) - 3.6 + i * 3.6, h = 2.6 + ((b * 3 + i) % 3) * 0.35
        bodies.push({ x, y: Y.floorTop + 0.2 + h / 2, z, sy: h / 2.6 })
        tops.push({ x, y: Y.floorTop + 0.2 + h + 0.12, z })
        screens.push({ x, y: Y.floorTop + 0.2 + h * 0.62, z: z + 1.22 })
        plinths.push({ x, y: Y.floorTop + 0.1, z })
      })
    }
    part(k, box(2.4, 2.6, 2.2), shell, bodies, { from: 'side', drop: 34, after: 0.05 })
    part(k, box(2.5, 0.24, 2.3), dark, tops, { from: 'side', drop: 34, after: 0.08, shadow: false })
    part(k, box(1.2, 0.8, 0.06), glass, screens, { from: 'side', drop: 34, after: 0.1, shadow: false })
    part(k, box(2.6, 0.2, 2.4), dark, plinths, { from: 'side', drop: 34, after: 0.02, shadow: false })
    /* super detail (client): three tool archetypes rather than one box, load ports on the front
       of every tool, a status lamp that is the one emissive point in the scene, and a wide wet
       bench and a tall furnace tower among the litho-type tools */
    const portMat = material(k, 0xF3F4F6, { roughness: 0.45, metalness: 0.15 })
    const lampMat = material(k, 0x22C55E, { roughness: 0.3, metalness: 0, emissive: 0x16A34A, emissiveIntensity: 1.2 })
    const benchMat = material(k, 0xD1D5DB, { roughness: 0.4, metalness: 0.3 })
    const furnMat = material(k, 0xB0B7C3, { roughness: 0.35, metalness: 0.5 })
    const ports = [], lamps = [], benches = [], benchTops = [], furnaces = [], furnCaps = []
    bodies.forEach((t, i) => {
      const h = 2.6 * (t.sy || 1)
      ports.push({ x: t.x - 0.55, y: Y.floorTop + 0.2 + 0.9, z: t.z + 1.25 }); ports.push({ x: t.x + 0.55, y: Y.floorTop + 0.2 + 0.9, z: t.z + 1.25 })
      lamps.push({ x: t.x + 0.95, y: Y.floorTop + 0.2 + h + 0.34, z: t.z + 0.9 })
    })
    for (let b = 0; b < BAYS; b++) {
      if (b % 3 === 0) { benches.push({ x: bayX(b) + 4.2, y: Y.floorTop + 0.2 + 0.55, z: -1.5 }); benchTops.push({ x: bayX(b) + 4.2, y: Y.floorTop + 0.2 + 1.16, z: -1.5 }) }
      if (b % 3 === 2) { furnaces.push({ x: bayX(b) - 4.4, y: Y.floorTop + 0.2 + 2.1, z: -1.5 }); furnCaps.push({ x: bayX(b) - 4.4, y: Y.floorTop + 0.2 + 4.3, z: -1.5 }) }
    }
    part(k, box(0.7, 0.5, 0.35), portMat, ports, { from: 'side', drop: 34, after: 0.12, shadow: false })
    /* a signal tower on every tool (red, amber, green on a post) and load-port doors on the front */
    const lampR = material(k, 0xEF4444, { roughness: 0.3, emissive: 0x7F1D1D, emissiveIntensity: 0.6 })
    const lampA = material(k, 0xF59E0B, { roughness: 0.3, emissive: 0x92400E, emissiveIntensity: 0.6 })
    const posts3 = [], lR = [], lA = [], doors = []
    lamps.forEach(l => { posts3.push({ x: l.x, y: l.y - 0.02, z: l.z }); lR.push({ x: l.x, y: l.y + 0.36, z: l.z }); lA.push({ x: l.x, y: l.y + 0.18, z: l.z }) })
    bodies.forEach(t => [-0.55, 0.55].forEach(dx => doors.push({ x: t.x + dx, y: Y.floorTop + 0.2 + 1.6, z: t.z + 1.115 })))
    part(k, box(0.05, 0.7, 0.05), dark, posts3, { from: 'side', drop: 34, after: 0.14, shadow: false })
    part(k, cyl(0.09, 0.16, 10), lampMat, lamps, { from: 'side', drop: 34, after: 0.14, shadow: false })
    part(k, cyl(0.09, 0.16, 10), lampA, lA, { from: 'side', drop: 34, after: 0.14, shadow: false })
    part(k, cyl(0.09, 0.16, 10), lampR, lR, { from: 'side', drop: 34, after: 0.14, shadow: false })
    part(k, box(0.5, 0.5, 0.03), dark, doors, { from: 'side', drop: 34, after: 0.11, shadow: false })
    part(k, box(3.6, 1.1, 1.4), benchMat, benches, { from: 'side', drop: 34, after: 0.06 })
    part(k, box(3.7, 0.12, 1.5), dark, benchTops, { from: 'side', drop: 34, after: 0.08, shadow: false })
    part(k, cyl(0.9, 4.2, 18), furnMat, furnaces, { from: 'side', drop: 34, after: 0.07 })
    part(k, cyl(1.0, 0.3, 18), dark, furnCaps, { from: 'side', drop: 34, after: 0.09, shadow: false })
    /* HOOKUP (client: "show the equipment hookups"): every tool is connected below the raised
       floor to the services under it: process drops in green and purple, an exhaust drop, a power
       feed, a manifold plate where they meet the floor, and a pump skid in the sub-fab serving
       each pair of tools. They belong to the tools system so they light with the tools. */
    const gMat = material(k, C.green, { roughness: 0.35, metalness: 0.45 })
    const pMat = material(k, C.purple, { roughness: 0.35, metalness: 0.45 })
    const exMat = material(k, 0x0E9FB5, { roughness: 0.35, metalness: 0.5 })
    const pwMat = material(k, C.yellow, { roughness: 0.45, metalness: 0.5 })
    const skidMat = material(k, 0x9CA3AF, { roughness: 0.55, metalness: 0.35 })
    const drumMat = material(k, 0x60A5FA, { roughness: 0.4, metalness: 0.4 })
    const yTop = Y.floorTop + 0.2, yHdr = Y.floorTop - 1.4, yHdr2 = Y.floorTop - 2.3
    const dG = [], dP = [], dX = [], dW = [], skids = [], drums = [], manif = []
    bodies.forEach((t, i) => {
      dG.push({ x: t.x - 0.7, y: (yTop + yHdr) / 2, z: t.z + 0.4 })
      dP.push({ x: t.x + 0.7, y: (yTop + yHdr - 0.9) / 2, z: t.z + 0.4 })
      dX.push({ x: t.x, y: (yTop + yHdr2) / 2, z: t.z - 0.6 })
      dW.push({ x: t.x - 0.2, y: (yTop + Y.floorTop - 1.0) / 2, z: t.z - 0.9 })
      manif.push({ x: t.x, y: Y.floorTop - 0.62, z: t.z })
      if (i % 2 === 0) { skids.push({ x: t.x + 1.8, y: Y.slabTop + 0.55, z: t.z + 0.2 }); drums.push({ x: t.x + 1.2, y: Y.slabTop + 1.5, z: t.z + 0.2 }); drums.push({ x: t.x + 2.4, y: Y.slabTop + 1.5, z: t.z + 0.2 }) }
    })
    part(k, cyl(0.09, yTop - yHdr, 8), gMat, dG, { from: 'below', drop: 5, after: 0.3, shadow: false })
    part(k, cyl(0.07, yTop - (yHdr - 0.9), 8), pMat, dP, { from: 'below', drop: 5, after: 0.34, shadow: false })
    part(k, cyl(0.16, yTop - yHdr2, 10), exMat, dX, { from: 'below', drop: 5, after: 0.38, shadow: false })
    part(k, box(0.1, yTop - (Y.floorTop - 1.0), 0.1), pwMat, dW, { from: 'below', drop: 5, after: 0.42, shadow: false })
    part(k, box(1.8, 0.12, 1.6), skidMat, manif, { from: 'below', drop: 5, after: 0.28, shadow: false })
    part(k, box(2.8, 1.1, 1.6), skidMat, skids, { from: 'side', drop: 34, after: 0.5 })
    part(k, cyl(0.42, 1.4, 14), drumMat, drums, { from: 'side', drop: 34, after: 0.55 })
    systems[k].pulse = [gMat, pMat, exMat, pwMat, lampMat]   /* the hookups breathe while the tools stage is live */
  })()

  /* ---- 09 the finish (client: "the whole building needs to finish", "walls close up, roads,
     people"): cladding on every face, parapet, the entrance block with canopy and sign, a loading
     dock, and the UPW plant building the Revit set carries alongside the fab ------------------ */
  ;(function buildFinish() {
    const k = 'fin'
    const cladTex = tile((g, n) => { g.fillStyle = '#D9DBD7'; g.fillRect(0, 0, n, n); g.fillStyle = '#C3C6C2'; for (let i = 0; i < 5; i++) g.fillRect(0, i * (n / 5), n, 2); g.fillRect(0, 0, 2, n) }, 128)
    cladTex.repeat.set(4, 4)
    const clad = material(k, 0xFFFFFF, { roughness: 0.55, metalness: 0.25, map: cladTex })
    const cladDk = material(k, 0x9AA0A6, { roughness: 0.6, metalness: 0.3 })
    const glazing = material(k, 0x1E3A5F, { roughness: 0.1, metalness: 0.4, transparent: true, opacity: 0.85, depthWrite: false })
    const canopyMat = material(k, 0x374151, { roughness: 0.5, metalness: 0.5 })
    const signMat = material(k, C.red, { roughness: 0.4, metalness: 0.1, emissive: 0xEC2027, emissiveIntensity: 0.6 })
    const tankMat = material(k, 0xF3F4F6, { roughness: 0.3, metalness: 0.4 })
    const H = Y.roof - Y.capTop, cy = Y.capTop + H / 2
    /* the long façades: near side rolls in from the site, far side from behind; ends from the ends */
    const near = [], far = [], ends = [], parapet = []
    for (let b = 0; b < BAYS; b++) {
      near.push({ x: bayX(b), y: cy, z: DEPTH / 2 + 1.6 }); far.push({ x: bayX(b), y: cy, z: -(DEPTH / 2 + 1.6) })
      parapet.push({ x: bayX(b), y: Y.roof + 0.7, z: DEPTH / 2 + 1.6 }); parapet.push({ x: bayX(b), y: Y.roof + 0.7, z: -(DEPTH / 2 + 1.6) })
    }
    ends.push({ x: -(BAYS * PITCH) / 2 - 0.4, y: cy, z: 0 }); ends.push({ x: (BAYS * PITCH) / 2 + 0.4, y: cy, z: 0 })
    part(k, box(PITCH, H, 0.3), clad, near, { from: 'side', drop: 30, after: 0.1, all: true })
    part(k, box(PITCH, H, 0.3), clad, far, { from: 'back', drop: 30, after: 0.1, all: true })
    part(k, box(0.3, H, DEPTH + 3.5), clad, ends, { from: 'end', drop: 40, after: 0.2, all: true })
    part(k, box(PITCH, 1.4, 0.4), cladDk, parapet, { drop: 8, after: 0.5, all: true })
    /* downpipes at every bay line on both long façades */
    const dps = []
    for (let b = 0; b <= BAYS; b++) [DEPTH / 2 + 1.6 + 0.32, -(DEPTH / 2 + 1.6 + 0.32)].forEach(z => dps.push({ x: -(BAYS * PITCH) / 2 + b * PITCH, y: cy, z }))
    part(k, cyl(0.09, H, 8), cladDk, dps, { from: 'side', drop: 30, after: 0.55, all: true, shadow: false })
    /* roof plant that only goes up once the envelope is closed: two chillers with their fans */
    const chMat = material(k, 0xA7ADB5, { roughness: 0.6, metalness: 0.35 }), fanMat = material(k, 0x2B3138, { roughness: 0.6, metalness: 0.4 })
    part(k, box(8, 2.8, 3.6), chMat, [{ x: HERO_CX + 30, y: Y.roof + 1.5, z: -5 }, { x: HERO_CX + 30, y: Y.roof + 1.5, z: 5 }], { drop: 14, after: 0.6, all: true })
    part(k, cyl(1.1, 0.3, 16), fanMat, [-2.6, 0, 2.6].flatMap(dx => [-5, 5].map(z => ({ x: HERO_CX + 30 + dx, y: Y.roof + 3.05, z }))), { drop: 14, after: 0.66, all: true, shadow: false })
    /* entrance: gowning and office block on the road side, glazed, with a canopy and the sign */
    const ex = HERO_CX, ez = DEPTH / 2 + 1.6
    part(k, box(20, 9, 9), clad, [{ x: ex, y: Y.capTop + 4.5, z: ez + 4.5 }], { from: 'side', drop: 30, after: 0.35, all: true })
    part(k, box(19.4, 4.2, 0.2), glazing, [{ x: ex, y: Y.capTop + 3.4, z: ez + 9.1 }], { from: 'side', drop: 30, after: 0.45, all: true })
    part(k, box(10, 0.4, 5), canopyMat, [{ x: ex, y: Y.capTop + 4.2, z: ez + 11.4 }], { drop: 8, after: 0.55, all: true })
    part(k, box(6.4, 1.6, 0.3), signMat, [{ x: ex, y: Y.capTop + 7.6, z: ez + 9.2 }], { from: 'side', drop: 20, after: 0.65, all: true })
    part(k, box(3.4, 3, 0.08), material(k, 0x0F172A, { roughness: 0.2, metalness: 0.5 }), [{ x: ex, y: Y.capTop + 1.5, z: ez + 9.16 }], { from: 'side', drop: 30, after: 0.5, all: true, shadow: false })   /* entrance doors */
    part(k, box(22, 0.3, 2.4), cladDk, [{ x: ex, y: Y.capTop + 0.15, z: ez + 10.2 }], { from: 'side', drop: 30, after: 0.5, all: true })                                       /* entrance plinth */
    /* loading dock at the east end */
    part(k, box(14, 1.2, 8), cladDk, [{ x: (BAYS * PITCH) / 2 - 12, y: Y.capTop + 0.6, z: ez + 4.4 }], { from: 'side', drop: 26, after: 0.4, all: true })
    part(k, box(15, 0.4, 5), canopyMat, [{ x: (BAYS * PITCH) / 2 - 12, y: Y.capTop + 5.4, z: ez + 2.6 }], { drop: 10, after: 0.5, all: true })                                        /* dock canopy */
    part(k, box(3.6, 3.8, 0.12), material(k, 0x4B5563, { roughness: 0.6, metalness: 0.5 }), [-3, 3].map(dx => ({ x: (BAYS * PITCH) / 2 - 12 + dx, y: Y.capTop + 3.1, z: ez + 0.18 })), { from: 'side', drop: 26, after: 0.55, all: true, shadow: false })   /* roller shutters */
    /* the UPW plant building behind the fab, with its tanks and stack (Revit: ALL_AR_UPW) */
    const ux = (BAYS * PITCH) / 2 + 32, uz = -6
    part(k, box(30, 12, 18), clad, [{ x: ux, y: Y.capTop + 6, z: uz }], { from: 'end', drop: 40, after: 0.15, all: true })
    part(k, box(30.4, 0.6, 18.4), cladDk, [{ x: ux, y: Y.capTop + 12.2, z: uz }], { drop: 10, after: 0.3, all: true })
    part(k, cyl(2.6, 9, 20), tankMat, [0, 1, 2, 3].map(i => ({ x: ux - 8 + i * 6.2, y: Y.capTop + 4.5, z: uz + 14 })), { from: 'end', drop: 30, after: 0.4, all: true })
    part(k, cyl(0.5, 8, 12), tankMat, [{ x: ux + 10, y: Y.capTop + 16, z: uz - 5 }], { drop: 10, after: 0.6, all: true })
    part(k, box(8, 3, 0.4), signMat, [{ x: ux - 6, y: Y.capTop + 9.5, z: uz + 9.2 }], { from: 'end', drop: 20, after: 0.7, all: true })
    /* the utility bridge: a pipe rack on two columns carrying UPW, PCW and gas from the plant into the fab */
    const bx0 = (BAYS * PITCH) / 2 + 0.4, bx1 = ux - 15, bl = bx1 - bx0, bcx = (bx0 + bx1) / 2, by = Y.capTop + 7.2
    const rackMat = material(k, 0x6B7280, { roughness: 0.55, metalness: 0.5 })
    part(k, box(bl, 0.2, 0.2), rackMat, [-1.6, 1.6].flatMap(dz => [0, 2.4].map(dy => ({ x: bcx, y: by + dy, z: uz + dz }))), { from: 'end', drop: 30, after: 0.5, all: true, shadow: false })
    part(k, box(0.15, 2.4, 0.15), rackMat, Array.from({ length: 5 }, (_, i) => [-1.6, 1.6].map(dz => ({ x: bx0 + 1 + i * (bl - 2) / 4, y: by + 1.2, z: uz + dz }))).flat(), { from: 'end', drop: 30, after: 0.52, all: true, shadow: false })
    part(k, box(0.5, by - Y.capTop, 0.5), rackMat, [-1.6, 1.6].map(dz => ({ x: bcx, y: (by + Y.capTop) / 2, z: uz + dz })), { from: 'end', drop: 30, after: 0.48, all: true })
    part(k, box(bl, 0.08, 1.2), rackMat, [{ x: bcx, y: by + 0.14, z: uz + 2.4 }], { from: 'end', drop: 30, after: 0.54, all: true, shadow: false })                                   /* walkway */
    const pipeCols = [tankMat, material(k, C.green, { roughness: 0.4, metalness: 0.5 }), material(k, 0x2563EB, { roughness: 0.4, metalness: 0.5 }), tankMat, material(k, 0x8B5CF6, { roughness: 0.4, metalness: 0.5 })]
    pipeCols.forEach((pm2, i) => part(k, cyl(0.2, bl, 10), pm2, [{ x: bcx, y: by + 0.6, z: uz - 1.2 + i * 0.6, rz: Math.PI / 2 }], { from: 'end', drop: 30, after: 0.56 + i * 0.02, all: true, shadow: false }))
  })()
  /* the EXISTING building the Revit set carries (ALL_AR_UPW&EXISTING): on site from the first frame */
  ;(function existing() {
    const g = new THREE.Group(); world.add(g)
    const bx = -(BAYS * PITCH) / 2 - 42, bz = 6
    const m = new THREE.MeshStandardMaterial({ color: 0xB9BDB8, roughness: 0.7, metalness: 0.1 })
    const md = new THREE.MeshStandardMaterial({ color: 0x6B7075, roughness: 0.8 })
    const mesh2 = (geo, mat, x, y, z) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; g.add(o) }
    mesh2(new THREE.BoxGeometry(40, 13, 26), m, bx, Y.capTop + 6.5, bz)
    mesh2(new THREE.BoxGeometry(40.6, 0.5, 26.6), md, bx, Y.capTop + 13.2, bz)
    for (let i = 0; i < 6; i++) mesh2(new THREE.BoxGeometry(2.4, 2, 0.1), new THREE.MeshStandardMaterial({ color: 0x1E3A5F, roughness: 0.2, metalness: 0.4 }), bx - 15 + i * 6, Y.capTop + 5, bz + 13.06)
    mesh2(new THREE.CylinderGeometry(0.45, 0.45, 6, 12), md, bx + 12, Y.capTop + 16, bz - 6)
    for (let i = 0; i < 6; i++) mesh2(new THREE.BoxGeometry(2.4, 2, 0.1), new THREE.MeshStandardMaterial({ color: 0x1E3A5F, roughness: 0.2, metalness: 0.4 }), bx - 15 + i * 6, Y.capTop + 9.6, bz + 13.06)
    mesh2(new THREE.BoxGeometry(2.6, 3, 0.12), new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.3, metalness: 0.4 }), bx + 16, Y.capTop + 1.5, bz + 13.06)
    ;[-10, 4].forEach(dx => mesh2(new THREE.BoxGeometry(4, 1.6, 2.6), md, bx + dx, Y.capTop + 14.2, bz - 4))
  })()

  /* ---- crews, machines and the site (client: "crews involved building it", "the dirt roadside
     and everything needs to look real") --------------------------------------------------------
     Props are NOT systems: they exist during a stage window and leave when the work moves on.
     People are instanced per body part (six meshes for every worker on site), machines are small
     groups, the site context is permanent. */
  const PROPS = []
  const pmat = (hex, opt = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: hex, roughness: 0.7, metalness: 0.1 }, opt))
  /* 26 Sep 2026 (Bazil: "we do not use any kind of yellowish colour"; asked of the cranes, "proceed"): the machines are
     painted steel, light and dark, so the only colours on site are the systems' own; the keys keep their old names so
     every call site stays as it was. The workers' hi-vis stays yellow: it is IAQ's own vest (TSV 5316, Fluorescent Yellow). */
  const MAT = { yellow: pmat(0xDADEE3), yellowDk: pmat(0x7B838D), steelDk: pmat(0x3B4048, { metalness: 0.5, roughness: 0.45 }), white: pmat(0xE5E7EB), red: pmat(0xDC2626),
    cab: pmat(0x1F2937), tyre: pmat(0x111318, { roughness: 0.95 }), blue: pmat(0x1E3A8A), hoard: pmat(0x1D4ED8), asphalt: pmat(0x25272B, { roughness: 0.95 }), dirt: pmat(0x5C4630, { roughness: 1 }),
    orange: pmat(0xF97316), glass: pmat(0x7DD3FC, { transparent: true, opacity: 0.55, depthWrite: false }), hiVis: pmat(0xF59E0B), skin: pmat(0xC9956B), navy: pmat(0x1F2A44), hatY: pmat(0xFACC15), hatW: pmat(0xF3F4F6), hatO: pmat(0xF97316) }
  function mesh(g, geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = true; m.receiveShadow = true; g.add(m); return m }
  function prop(u0, u1, x, y, z, ry, build) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; build(g); g.visible = false; world.add(g); PROPS.push({ g, u0, u1, y0: y }); return g }
  function applyProps(u) {
    if (driven) { PROPS.forEach(p => { p.g.visible = false }); return }
    PROPS.forEach(p => {
      const t = u < p.u0 - 0.12 ? 0 : u < p.u0 ? (u - (p.u0 - 0.12)) / 0.12 : u <= p.u1 ? 1 : u < p.u1 + 0.12 ? 1 - (u - p.u1) / 0.12 : 0
      /* 7 Sep (client): nothing grows from a point. A prop arrives at full size, lowered the last
         3 m into place and decelerating as it lands; leaving, it lifts the same way. */
      p.g.visible = t > 0; p.g.scale.setScalar(1); p.g.position.y = p.y0 + (1 - ease(t)) * 3
    })
    setCrews(u)
  }
  const gx = HERO_CX, groundY = Y.capTop
  /* one mesh from many placed geometries (fences, bay lines, poles, canopies): [geo, x, y, z, rx, ry, rz, scale] */
  function merged(g, mat, list) {
    const gs = [], M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), P = new THREE.Vector3(), S3 = new THREE.Vector3()
    list.forEach(([geo, x, y, z, rx = 0, ry = 0, rz = 0, sc = 1]) => { E.set(rx, ry, rz); Q.setFromEuler(E); P.set(x, y, z); S3.set(sc, sc, sc); M.compose(P, Q, S3); const q = geo.clone(); q.applyMatrix4(M); gs.push(q) })
    const m = new THREE.Mesh(mergeGeometries(gs, false), mat); gs.forEach(q => q.dispose()); m.castShadow = true; m.receiveShadow = true; g.add(m); return m
  }
  /* the site: road with markings, hoarding, cabins, stockpiles, pallets */
  ;(function buildSite() {
    /* the road and kerb stay; the construction furniture is a prop that leaves when the job ends */
    const g = new THREE.Group(); world.add(g)
    const site = new THREE.Group(); site.visible = false; world.add(site); PROPS.push({ g: site, u0: 0, u1: 8.45 })
    const roadTex = tile((c, n) => { c.fillStyle = '#2A2C31'; c.fillRect(0, 0, n, n); c.fillStyle = '#D8D5C7'; for (let i = 0; i < 4; i++) c.fillRect(i * (n / 4) + 8, n / 2 - 3, n / 8, 6) }, 128)
    roadTex.repeat.set(20, 1)
    const road = mesh(g, new THREE.BoxGeometry(GW, 0.18, 9), new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.95 }), 0, groundY + 0.1, EX.z1 + 18)
    road.castShadow = false
    /* kerb */
    mesh(g, new THREE.BoxGeometry(GW, 0.3, 0.5), MAT.white, 0, groundY + 0.15, EX.z1 + 13.2).castShadow = false
    /* hoarding along the road side of the site and the two ends */
    for (let x = -GW / 2 + 6; x < GW / 2; x += 6) mesh(site, new THREE.BoxGeometry(5.6, 2.4, 0.12), MAT.hoard, x, groundY + 1.2, EX.z1 + 12)
    for (let z = -GD / 2 + 6; z < EX.z1 + 12; z += 6) { mesh(site, new THREE.BoxGeometry(0.12, 2.4, 5.6), MAT.hoard, -GW / 2 + 8, groundY + 1.2, z); mesh(site, new THREE.BoxGeometry(0.12, 2.4, 5.6), MAT.hoard, GW / 2 - 8, groundY + 1.2, z) }
    /* site cabins by the gate */
    ;[0, 1].forEach(i => { mesh(site, new THREE.BoxGeometry(9, 3, 3.2), MAT.white, gx + 46 + i * 11, groundY + 1.5, EX.z1 + 4); mesh(site, new THREE.BoxGeometry(9.4, 0.2, 3.6), MAT.steelDk, gx + 46 + i * 11, groundY + 3.1, EX.z1 + 4); mesh(site, new THREE.BoxGeometry(1, 2.2, 0.08), MAT.cab, gx + 43 + i * 11, groundY + 1.1, EX.z1 + 2.36) })
    /* spoil heaps from the excavation, and material stacks */
    SPOIL = mesh(site, new THREE.ConeGeometry(7, 4.4, 18), MAT.dirt, EX.x1 + 18, groundY + 2.2, EX.z0 + 4)
    ;[[gx - 40, EX.z1 - 6, 4.5, 3], [gx - 52, EX.z1 - 14, 3.5, 2.4], [gx + 42, EX.z1 - 22, 5, 3.2]].forEach(([x, z, r, h]) => { const c = mesh(site, new THREE.ConeGeometry(r, h, 14), MAT.dirt, x, groundY + h / 2, z); c.castShadow = true })
    for (let i = 0; i < 6; i++) mesh(site, new THREE.BoxGeometry(2.4, 0.9, 1.2), i % 2 ? MAT.steelDk : MAT.orange, gx - 44 + (i % 3) * 3, groundY + 0.45 + (i > 2 ? 1 : 0), EX.z1 + 6 - (i > 2 ? 0 : 1.6))
  })()
  /* when the job ends: the site is handed over with its infrastructure: painted car park, kerbs and
     footpaths, a perimeter fence with a gate house and barrier, lamp posts, a totem sign, flagpoles,
     bollards at the entrance, real trees, cars and traffic */
  prop(8.55, 99, 0, groundY, 0, 0, g => {
    const zPark = EX.z1 + 2, zKerb = EX.z1 + 13.2, zRoad = EX.z1 + 18, zF = zKerb - 3.4, zEnt = DEPTH / 2 + 1.6 + 13.9
    const paint = pmat(0xE5E7EB, { roughness: 0.8 }), pave = pmat(0xB4B8BE, { roughness: 0.9 }), galv = pmat(0x9AA0A6, { metalness: 0.55, roughness: 0.45 })
    const signM = pmat(0xEC2027, { emissive: 0xEC2027, emissiveIntensity: 0.5 }), lampHead = pmat(0xFFF3D0, { emissive: 0xFFE6A0, emissiveIntensity: 0.9 })
    /* car park: painted bays, a footpath along the kerb, a path from the bays to the entrance */
    const bayG = new THREE.BoxGeometry(0.12, 0.03, 5.2), bays = []
    for (let i = 0; i <= 13; i++) bays.push([bayG, gx - 34.5 + i * 5, 0.045, zPark])
    for (let i = 0; i <= 8; i++) bays.push([bayG, gx + 38 + i * 5, 0.045, zPark])
    merged(g, paint, bays)
    mesh(g, new THREE.BoxGeometry(GW - 20, 0.14, 2.6), pave, 0, 0.07, zKerb - 1.7).castShadow = false
    mesh(g, new THREE.BoxGeometry(5, 0.12, zPark - zEnt + 1), pave, gx, 0.06, (zPark + zEnt) / 2).castShadow = false
    /* bollards at the entrance and three flagpoles */
    const bol = [], bolG = new THREE.CylinderGeometry(0.16, 0.16, 0.95, 8)
    for (let i = 0; i < 7; i++) bol.push([bolG, gx - 7.2 + i * 2.4, 0.47, zEnt + 0.7])
    merged(g, galv, bol)
    for (let i = 0; i < 3; i++) { mesh(g, new THREE.CylinderGeometry(0.06, 0.09, 9, 8), galv, gx - 14 + i * 2.6, 4.5, zEnt + 1.2); mesh(g, new THREE.BoxGeometry(1.5, 0.85, 0.04), i === 1 ? MAT.red : MAT.white, gx - 13.2 + i * 2.6, 8.3, zEnt + 1.2) }
    /* cars in the bays, with glass and wheels */
    const carCols = [MAT.white, MAT.cab, MAT.blue, MAT.red, MAT.steelDk]
    /* a car is built along its own x and turned as a group: parked cars stand nose-in to the bays (client: "park the car vertically") */
    const car = (x, z, dir, col, ry = 0) => {
      const cg = new THREE.Group(); cg.position.set(x, 0, z); cg.rotation.y = ry; g.add(cg)
      mesh(cg, new THREE.BoxGeometry(4.4, 1.1, 1.9), col, 0, 0.72, 0); mesh(cg, new THREE.BoxGeometry(2.3, 0.75, 1.7), col, -0.2 * dir, 1.62, 0)
      mesh(cg, new THREE.BoxGeometry(0.06, 0.6, 1.5), MAT.glass, 0.98 * dir, 1.66, 0); mesh(cg, new THREE.BoxGeometry(0.06, 0.55, 1.5), MAT.glass, -1.38 * dir, 1.64, 0)
      ;[-1.4, 1.4].forEach(dx => [-0.95, 0.95].forEach(dz => mesh(cg, new THREE.CylinderGeometry(0.33, 0.33, 0.24, 10), MAT.tyre, dx, 0.33, dz, Math.PI / 2)))
    }
    for (let i = 0; i < 9; i++) car(gx - 32 + i * 5, zPark, 1, carCols[i % 5], Math.PI / 2)
    for (let i = 0; i < 4; i++) car(gx + 40.5 + i * 5, zPark, 1, carCols[(i + 2) % 5], Math.PI / 2)
    /* perimeter fence on the road side and both ends, with the gate gap at the entrance road */
    const fp = [], fr = [], postG = new THREE.BoxGeometry(0.08, 1.9, 0.08), railX = new THREE.BoxGeometry(3, 0.05, 0.05), railZ = new THREE.BoxGeometry(0.05, 0.05, 3)
    for (let x = -GW / 2 + 8; x <= GW / 2 - 8; x += 3) { if (Math.abs(x - (gx + 8)) < 6.5) continue; fp.push([postG, x, 0.95, zF]); fr.push([railX, x + 1.5, 0.75, zF], [railX, x + 1.5, 1.75, zF]) }
    for (let z = -GD / 2 + 8; z < zF; z += 3) [-GW / 2 + 8, GW / 2 - 8].forEach(x => { fp.push([postG, x, 0.95, z]); fr.push([railZ, x, 0.75, z + 1.5], [railZ, x, 1.75, z + 1.5]) })
    merged(g, MAT.steelDk, fp); merged(g, galv, fr)
    /* gate house with a barrier, and the totem sign by the gate */
    mesh(g, new THREE.BoxGeometry(4, 3, 3.2), MAT.white, gx + 17, 1.5, zF - 2.4); mesh(g, new THREE.BoxGeometry(4.6, 0.25, 3.8), MAT.steelDk, gx + 17, 3.1, zF - 2.4)
    mesh(g, new THREE.BoxGeometry(2.4, 1.1, 0.05), MAT.glass, gx + 17, 1.85, zF - 0.78); mesh(g, new THREE.BoxGeometry(0.05, 1.1, 2.4), MAT.glass, gx + 14.98, 1.85, zF - 2.4)
    mesh(g, new THREE.CylinderGeometry(0.14, 0.14, 1.1, 8), MAT.steelDk, gx + 14.2, 0.55, zF); mesh(g, new THREE.BoxGeometry(5.6, 0.1, 0.1), MAT.red, gx + 11.2, 1.1, zF)
    mesh(g, new THREE.BoxGeometry(1.4, 5, 0.5), MAT.cab, gx + 1.2, 2.5, zF - 1.4); mesh(g, new THREE.BoxGeometry(1.1, 1.5, 0.06), signM, gx + 1.2, 4.1, zF - 1.12)
    /* lamp posts on both verges of the road */
    const poles = [], heads = [], poleG = new THREE.CylinderGeometry(0.1, 0.14, 8, 8), armG = new THREE.BoxGeometry(0.1, 0.1, 1.9), headG = new THREE.BoxGeometry(0.36, 0.16, 0.75)
    for (let x = -GW / 2 + 14; x < GW / 2; x += 26) { poles.push([poleG, x, 4, zRoad + 6.2], [armG, x, 7.95, zRoad + 5.35]); heads.push([headG, x, 7.9, zRoad + 4.55]) }
    for (let x = -GW / 2 + 27; x < GW / 2; x += 26) { poles.push([poleG, x, 4, zKerb + 0.9], [armG, x, 7.95, zKerb + 1.75]); heads.push([headG, x, 7.9, zKerb + 2.55]) }
    merged(g, MAT.steelDk, poles); merged(g, lampHead, heads)
    /* trees: trunk and a clustered canopy, two tones, along the far verge and in the car park islands */
    const leafA = pmat(0x2F6B3A, { roughness: 0.9 }), leafB = pmat(0x3F7F49, { roughness: 0.9 }), trunk = pmat(0x5B4636, { roughness: 0.9 })
    const trunks = [], canA = [], canB = [], tG = new THREE.CylinderGeometry(0.16, 0.26, 2.8, 7), sG = new THREE.SphereGeometry(1.5, 9, 7)
    const tree = (x, z, sc, alt) => { trunks.push([tG, x, 1.4, z]); (alt ? canA : canB).push([sG, x, 4.1 * sc, z, 0, 0, 0, 1.25 * sc], [sG, x + 0.95 * sc, 3.5 * sc, z + 0.5 * sc, 0, 0, 0, 0.9 * sc], [sG, x - 0.85 * sc, 3.6 * sc, z - 0.5 * sc, 0, 0, 0, 0.95 * sc], [sG, x, 5.1 * sc, z, 0, 0, 0, 0.8 * sc]) }
    for (let i = 0; i < 16; i++) tree(-GW / 2 + 20 + i * 18 + (i % 3) * 1.4, zRoad + 9, 0.85 + (i % 4) * 0.1, i % 2)
    ;[gx - 40, gx + 34, gx + 70, gx - 70].forEach((x, i) => tree(x, zPark - 1, 0.8 + (i % 2) * 0.15, i % 2))
    merged(g, trunk, trunks); merged(g, leafA, canA); merged(g, leafB, canB)
    /* the road gets traffic */
    ;[[gx - 60, 1], [gx + 40, -1], [gx - 110, 1]].forEach(([x, d]) => car(x, zRoad + d * 2, d, d > 0 ? MAT.white : MAT.steelDk, 0))
  })

  /* ---- the world beyond the fence (7 Sep, client: "where's the sky, city or forest when done") --
     The finished facility used to sit in a black void. Now, as the camera pulls out for Overall,
     a sky dome fades in, the fog lifts from near-black to a hazy horizon, and a forest ring
     beyond the site emerges out of that fog. Nothing grows and nothing pops: the ring is there
     from the start, hidden inside the dark fog, and the fog is what changes. */
  const ENV = (function () {
    const cv = document.createElement('canvas'); cv.width = 4; cv.height = 256
    const c = cv.getContext('2d'); const gr = c.createLinearGradient(0, 0, 0, 256)
    /* 4 Sep (client: "where's the sky"). The blue lived in the top 40% of the dome, which is the
       zenith: the camera looks slightly DOWN at the building, so the only band ever on screen was
       the pale haze at the bottom of the gradient and the result read as an overcast blank. The
       blue is pulled down the dome so real sky sits above the treeline, with the warm haze kept
       as a thin band at the horizon rather than half the sky. */
    gr.addColorStop(0, '#08152F'); gr.addColorStop(0.26, '#1E4C92'); gr.addColorStop(0.48, '#3E76BE')
    gr.addColorStop(0.68, '#7FA8D6'); gr.addColorStop(0.84, '#BBD0E4'); gr.addColorStop(0.93, '#E6DACA'); gr.addColorStop(1, '#CBD2DA')
    c.fillStyle = gr; c.fillRect(0, 0, 4, 256)
    const skyTex = new THREE.CanvasTexture(cv); if (THREE.SRGBColorSpace) skyTex.colorSpace = THREE.SRGBColorSpace
    const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.55),
      new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, transparent: true, opacity: 0, depthWrite: false, fog: false }))
    sky.position.y = -60; sky.renderOrder = -10; scene.add(sky)
    /* the forest ring: the site's own tree recipe, scattered on a band well outside the fence,
       with the front road sector left open so the approach stays clear */
    const g = new THREE.Group(); world.add(g)
    const leafA = pmat(0x2F6B3A, { roughness: 0.9, transparent: true }), leafB = pmat(0x3F7F49, { roughness: 0.9, transparent: true }),
          leafC = pmat(0x36613C, { roughness: 0.9, transparent: true }), leafD = pmat(0x27512F, { roughness: 0.9, transparent: true }),
          trunk = pmat(0x5B4636, { roughness: 0.9, transparent: true })
    const trunks = [], canA = [], canB = [], canC = [], tG = new THREE.CylinderGeometry(0.16, 0.26, 2.8, 7), sG = new THREE.SphereGeometry(1.5, 9, 7)
    /* `rot` turns the canopy cluster about the trunk. The lobes sat at fixed offsets, so every
       tree presented the same silhouette from the same camera and the ring read as one tree
       pasted 260 times. */
    const tree = (x, z, sc, tone, rot = 0) => {
      const ca = Math.cos(rot), sa = Math.sin(rot)
      const bin = tone === 0 ? canA : tone === 1 ? canB : canC
      trunks.push([tG, x, 1.4 * sc, z, 0, 0, 0, sc])
      bin.push([sG, x, 4.1 * sc, z, 0, 0, 0, 1.25 * sc],
               [sG, x + (0.95 * ca - 0.5 * sa) * sc, 3.5 * sc, z + (0.95 * sa + 0.5 * ca) * sc, 0, 0, 0, 0.9 * sc],
               [sG, x + (-0.85 * ca + 0.5 * sa) * sc, 3.6 * sc, z + (-0.85 * sa - 0.5 * ca) * sc, 0, 0, 0, 0.95 * sc],
               [sG, x, 5.1 * sc, z, 0, 0, 0, 0.8 * sc])
    }
    let seed = 7; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 }
    /* planting is decoration and it is the heaviest geometry in the scene, so a touch device
       gets a thinner wood. The ring reads the same at the distance it is seen from. */
    const DENS = coarse ? 0.55 : 1
    const N = n => Math.round(n * DENS)
    for (let i = 0; i < N(260); i++) {
      const a = rnd() * Math.PI * 2, r = 215 + rnd() * 120
      const x = Math.cos(a) * r, z = Math.sin(a) * r
      if (z > EX.z1 + 26 && Math.abs(x) < GW / 2 + 30) continue      /* keep the road frontage open */
      /* three tones and a free turn per tree: the ring is 260 copies of one recipe, and with a
         fixed cluster shape and two colours it read as stamped clones along the horizon */
      tree(x, z, 1.3 + rnd() * 1.6, i % 3, rnd() * Math.PI * 2)
    }
    /* the middle distance: the ring started at r=215 while the site ends around 160, which left
       a bare mown annulus all the way round. Sparse outliers and low scrub carry the eye from
       the fence line out to the treeline. */
    for (let i = 0; i < N(70); i++) {
      const a = rnd() * Math.PI * 2, r = 172 + rnd() * 48
      const x = Math.cos(a) * r, z = Math.sin(a) * r
      if (z > EX.z1 + 20 && Math.abs(x) < GW / 2 + 40) continue
      tree(x, z, 1.0 + rnd() * 1.1, i % 3, rnd() * Math.PI * 2)
    }
    const scrub = [], bushG = new THREE.SphereGeometry(1.5, 6, 4)   /* 36 tris, not 112: it is a bush at 200m */
    for (let i = 0; i < N(150); i++) {
      const a = rnd() * Math.PI * 2, r = 168 + rnd() * 190
      const x = Math.cos(a) * r, z = Math.sin(a) * r
      if (z > EX.z1 + 20 && Math.abs(x) < GW / 2 + 40) continue
      const sc = 0.5 + rnd() * 0.8
      scrub.push([bushG, x, 0.85 * sc, z, 0, 0, 0, sc], [bushG, x + 0.9 * sc, 0.7 * sc, z + 0.6 * sc, 0, 0, 0, sc * 0.7])
    }
    /* conifers: a second species breaks the horizon silhouette, which was 260 identical domes */
    const conifers = []
    const cG = new THREE.ConeGeometry(1.5, 4.4, 8)
    for (let i = 0; i < N(90); i++) {
      const a = rnd() * Math.PI * 2, r = 225 + rnd() * 115
      const x = Math.cos(a) * r, z = Math.sin(a) * r
      if (z > EX.z1 + 26 && Math.abs(x) < GW / 2 + 30) continue
      const sc = 1.5 + rnd() * 1.7
      trunks.push([tG, x, 1.4 * sc, z, 0, 0, 0, sc])
      conifers.push([cG, x, 4.6 * sc, z, 0, 0, 0, sc], [cG, x, 6.6 * sc, z, 0, 0, 0, sc * 0.68])
    }
    merged(g, trunk, trunks); merged(g, leafA, canA); merged(g, leafB, canB)
    if (canC.length) merged(g, leafC, canC)
    if (conifers.length) merged(g, leafD, conifers)
    if (scrub.length) merged(g, leafC, scrub)

    /* ---- THE LAND ITSELF -----------------------------------------------------
       (client 4 Sep: "continue to perfect the environment")

       The site was a 320x240 slab floating in a void. The forest ring sits at radius
       215-335, so every one of those trees stood on nothing, and at any low camera
       angle the hardstanding simply ENDED in a hard straight edge with dark scene
       behind it. The sky and the forest had been added; the ground under them had not.

       So: one large disc of land, a touch below the site's grade so the hardstanding
       still reads as a raised, engineered platform on top of it. It fades in with the
       rest of the world beyond the fence, and the fog takes it before its own rim can
       ever be seen. */
    const landTex = (() => {
      const n = 512, cv = document.createElement('canvas'); cv.width = cv.height = n
      const c = cv.getContext('2d'), im = c.createImageData(n, n), d = im.data
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const u = x / n * Math.PI * 2, v = y / n * Math.PI * 2
        /* integer sine sums tile without a seam, same trick as the site gravel */
        const t = 0.5 + 0.20 * Math.sin(u * 2 + Math.cos(v * 3) * 1.1) * Math.cos(v * 2 + Math.sin(u * 4) * 0.7)
                      + 0.10 * Math.sin(u * 5 + v * 3) * Math.cos(v * 7 - u * 2)
        const grain = ((x * 7919 + y * 104729) % 89) / 89 - 0.5
        const k = 0.86 + t * 0.26 + grain * 0.08
        const i = (y * n + x) * 4
        /* dry grass and scrub, not lawn: kept close in value to the site's own grey so the
           hardstanding reads as a platform ON the land rather than a patch cut out of it */
        d[i] = 92 * k; d[i + 1] = 99 * k; d[i + 2] = 78 * k; d[i + 3] = 255
      }
      c.putImageData(im, 0, 0)
      const tx = new THREE.CanvasTexture(cv); if (THREE.SRGBColorSpace) tx.colorSpace = THREE.SRGBColorSpace
      tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(7, 7); tx.anisotropy = 4
      return tx
    })()
    const landMat = new THREE.MeshStandardMaterial({ map: landTex, roughness: 1, metalness: 0, transparent: true, opacity: 0 })
    const land = new THREE.Mesh(new THREE.CircleGeometry(760, 80), landMat)
    land.rotation.x = -Math.PI / 2
    land.position.y = EARTH_TOP - 0.35      /* under the hardstanding, so no z-fight and the site still sits proud */
    land.renderOrder = -5
    g.add(land)
    g.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false } })
    const mats = [leafA, leafB, leafC, leafD, trunk, landMat]
    const fogDark = new THREE.Color(0x070C18), fogDay = new THREE.Color(0xA9BBD0)
    return { update(t) {
      sky.material.opacity = t
      mats.forEach(m => { m.opacity = t })
      g.visible = t > 0.02
      scene.fog.color.copy(fogDark).lerp(fogDay, t)
      scene.fog.near = 210 + 120 * t; scene.fog.far = 900 + 700 * t
    } }
  })()

  /* ---- machines --------------------------------------------------------------
     Built from the parts real ones have: crawler tracks, a slewing house, a counterweight, a
     lattice mast and jib (each merged into one geometry, so a crane is a handful of draw calls),
     pendants, a trolley and a two-fall hook. They move: the excavator digs, the hammer drops on
     the pile and drives it, the tower crane slews to whatever is being lowered. */
  const MACH = []
  const latMat = pmat(0xC7CDD5, { metalness: 0.35, roughness: 0.5 })   /* 26 Sep: tower crane lattice in steel, no yellow */
  const concMat = pmat(0x9AA0A6, { roughness: 0.92 })
  const _Y = new THREE.Vector3(0, 1, 0)
  function latticeGeo(len, w, chord = 0.16, brace = 0.09) {
    const gs = [], h = w / 2, M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), P = new THREE.Vector3(), ONE = new THREE.Vector3(1, 1, 1)
    const add = (geo, x, y, z, rx = 0, ry = 0, rz = 0) => { E.set(rx, ry, rz); Q.setFromEuler(E); P.set(x, y, z); M.compose(P, Q, ONE); geo.applyMatrix4(M); gs.push(geo) }
    ;[[h, h], [h, -h], [-h, h], [-h, -h]].forEach(([y, z]) => add(new THREE.BoxGeometry(len, chord, chord), len / 2, y, z))
    const step = w * 1.5, n = Math.max(1, Math.floor(len / step)), dl = Math.hypot(step, w), ang = Math.atan2(w, step)
    for (let i = 0; i < n; i++) {
      const x = i * step + step / 2, sg = i % 2 ? 1 : -1
      add(new THREE.BoxGeometry(dl, brace, brace), x, 0, h, 0, 0, sg * ang)
      add(new THREE.BoxGeometry(dl, brace, brace), x, 0, -h, 0, 0, -sg * ang)
      add(new THREE.BoxGeometry(dl, brace, brace), x, h, 0, 0, sg * ang, 0)
      add(new THREE.BoxGeometry(dl, brace, brace), x, -h, 0, 0, -sg * ang, 0)
      add(new THREE.BoxGeometry(brace, w, brace), i * step + step, 0, h)
      add(new THREE.BoxGeometry(brace, w, brace), i * step + step, 0, -h)
    }
    const geo = mergeGeometries(gs, false); gs.forEach(q => q.dispose()); return geo
  }
  function lattice(g, len, w, x, y, z, rx = 0, ry = 0, rz = 0, chord, brace) { const m = new THREE.Mesh(latticeGeo(len, w, chord, brace), latMat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = true; g.add(m); return m }
  function rod(g, ax, ay, az, bx, by, bz, r, mat) { const a = new THREE.Vector3(ax, ay, az), d = new THREE.Vector3(bx - ax, by - ay, bz - az), L = d.length(); const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 6), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(_Y, d.normalize()); g.add(m); return m }
  function tracks(g, len, gauge, h = 1) {
    ;[-gauge / 2, gauge / 2].forEach(z => { mesh(g, new THREE.BoxGeometry(len, h, 0.9), MAT.tyre, 0, h / 2, z); mesh(g, new THREE.BoxGeometry(len - 0.6, 0.28, 1), MAT.steelDk, 0, h + 0.1, z); [-1, 1].forEach(sg => mesh(g, new THREE.CylinderGeometry(h / 2, h / 2, 1, 12), MAT.steelDk, sg * (len / 2 - 0.3), h / 2, z, Math.PI / 2)) })
    mesh(g, new THREE.BoxGeometry(len * 0.7, 0.5, gauge), MAT.steelDk, 0, h + 0.25, 0)
  }

  /* piling rig: stage 01, working from the excavation floor.
     4 Sep (client: "why is this machine underneath?"). It stood at z=6, which is INSIDE the
     building footprint: the deck plates are DEPTH+1 = 25 deep about z=0, so they cover z -12.5
     to +12.5. Those plates become visible the moment they start their descent, around u 0.20,
     and float down from 9-12m up. So from a third of the way through stage 01 the rig was
     sitting in the pit directly beneath a slab and a fab floor hanging in the air above it, and
     it read as a machine trapped under the building rather than one driving its piles.
     The pit runs to z=60 while the building stops at 12.5, so there is open excavation in FRONT
     of the structure. The rig works from there: still down in the cut, still on the piling
     platform, but clear of everything that lands from above. Same rule the stage 01 crew
     already follows, which stands beside the pit and never inside its footprint. */
  prop(0.22, 0.5, gx - 14, EARTH_BOT + 0.6, 26, 0.4, g => {
    tracks(g, 7.2, 4.2, 1.1)
    const house = new THREE.Group(); house.position.y = 1.85; g.add(house)
    mesh(house, new THREE.BoxGeometry(6.2, 1.9, 4), MAT.yellow, -0.4, 0.95, 0)
    mesh(house, new THREE.BoxGeometry(1.6, 1.9, 3.6), MAT.steelDk, -4.1, 0.95, 0)            /* counterweight */
    mesh(house, new THREE.BoxGeometry(2, 2, 2.2), MAT.cab, 1.8, 2.9, 0.9); mesh(house, new THREE.BoxGeometry(1.9, 1.3, 0.05), MAT.glass, 1.8, 3.1, 2.02)
    mesh(house, new THREE.BoxGeometry(2.4, 1.2, 2.6), MAT.yellowDk, -1.6, 2.5, -0.4)           /* winch deck */
    const L = 26
    lattice(house, L, 1.1, 3.9, 0.6, 0, 0, 0, Math.PI / 2, 0.14, 0.07)                          /* the leader */
    ;[-0.7, 0.7].forEach(z => mesh(house, new THREE.BoxGeometry(0.14, L, 0.14), MAT.steelDk, 4.65, 0.6 + L / 2, z))   /* guide rails */
    rod(house, -3.4, 2.9, 0, 3.9, 18, 0, 0.12, MAT.steelDk); rod(house, -3.4, 2.9, 0, 3.9, 9, 0, 0.1, MAT.steelDk)   /* stays */
    mesh(house, new THREE.BoxGeometry(0.9, 0.9, 0.9), MAT.steelDk, 3.9, L + 0.9, 0)            /* head sheave block */
    rod(house, 4.75, L + 0.5, 0, 4.75, 6, 0, 0.05, MAT.steelDk)                                  /* hoist rope */
    const pile = mesh(house, new THREE.CylinderGeometry(0.42, 0.42, 14, 14), MAT.white, 4.75, 5, 0)   /* the pile in the leader */
    const hammer = new THREE.Group(); hammer.position.set(4.75, 12, 0); house.add(hammer)
    mesh(hammer, new THREE.BoxGeometry(1.1, 3.4, 1.1), MAT.steelDk, 0, 1.7, 0); mesh(hammer, new THREE.BoxGeometry(1.3, 0.5, 1.3), MAT.yellowDk, 0, 3.6, 0)
    MACH.push({ anim: (t, u) => {
      const k = clamp((u - 0.16) / 0.06, 0, 1) * (1 - clamp((u - 0.42) / 0.06, 0, 1))         /* hammer works through the piling window */
      const drive = clamp((u - 0.18) / 0.26, 0, 1)
      pile.position.y = 5 - drive * 6
      hammer.position.y = pile.position.y + 7 + 2.4 * (1 - Math.pow(Math.abs(Math.sin(t * 2.6)), 0.45)) * k
    } })
  })
  /* 9 Sep (client: "remove this"): the excavator is gone. It read as a toy against the rest of
     the model, and the pit opening on its own tells the same story without it. The generated
     mesh stays in public/assets/fab/excavator.glb, unused. */
  /* tower crane: stages 01 to 03, at the back corner so the jib never crosses the camera */
  const crane = { pos: new THREE.Vector3(gx + 30, groundY, -(DEPTH / 2) - 30), top: null, trolley: null, line: null, block: null, jibLen: 50, H: 46, topY: 0 }
  crane.topY = 1.2 + crane.H + 0.55
  prop(0.2, 3.2, crane.pos.x, crane.pos.y, crane.pos.z, 0, g => {
    mesh(g, new THREE.BoxGeometry(6, 1.2, 6), concMat, 0, 0.6, 0)                              /* foundation block */
    ;[[-2, -2], [2, -2], [-2, 2], [2, 2]].forEach(([x, z]) => mesh(g, new THREE.BoxGeometry(1.2, 0.6, 1.2), MAT.steelDk, x, 1.5, z))
    lattice(g, crane.H, 1.8, 0, 1.2, 0, 0, 0, Math.PI / 2, 0.18, 0.1)                          /* mast */
    const top = new THREE.Group(); top.position.y = 1.2 + crane.H; g.add(top); crane.top = top
    mesh(top, new THREE.CylinderGeometry(1.5, 1.5, 0.5, 18), MAT.steelDk, 0, 0.25, 0)           /* slewing ring */
    mesh(top, new THREE.BoxGeometry(2.2, 2.3, 2), MAT.cab, 1.2, 1.7, 1.7); mesh(top, new THREE.BoxGeometry(2.1, 1.3, 0.05), MAT.glass, 1.2, 1.85, 2.72); mesh(top, new THREE.BoxGeometry(0.05, 1.3, 1.9), MAT.glass, 2.32, 1.85, 1.7)
    lattice(top, crane.jibLen, 1.4, 0, 1.25, 0, 0, 0, 0, 0.16, 0.08)                            /* jib */
    lattice(top, 15, 1.4, 0, 1.25, 0, 0, Math.PI, 0, 0.16, 0.08)                                /* counter-jib */
    ;[0, 1, 2].forEach(i => mesh(top, new THREE.BoxGeometry(0.7, 2.4, 2.6), concMat, -12.5 - i * 0.85, 0.9, 0))   /* counterweights */
    mesh(top, new THREE.BoxGeometry(3, 1.3, 1.9), MAT.steelDk, -7.5, 2.55, 0)                    /* hoist winch */
    mesh(top, new THREE.BoxGeometry(0.5, 8, 0.5), latMat, 0, 5.25, 0)                            /* tower top */
    ;[[crane.jibLen - 0.5, 1.95], [crane.jibLen * 0.55, 1.95], [-14.5, 1.95]].forEach(([x, y]) => rod(top, 0, 9.25, 0, x, y, 0, 0.06, MAT.steelDk))   /* pendants */
    const trolley = new THREE.Group(); trolley.position.set(24, 0.55, 0); top.add(trolley); crane.trolley = trolley
    mesh(trolley, new THREE.BoxGeometry(1.5, 0.5, 1.7), MAT.steelDk, 0, 0, 0)
    const line = new THREE.Group(); trolley.add(line); crane.line = line
    ;[-0.18, 0.18].forEach(z => mesh(line, new THREE.CylinderGeometry(0.04, 0.04, 1, 6), MAT.steelDk, 0, 0, z))   /* two falls, scaled to length */
    const block = new THREE.Group(); trolley.add(block); crane.block = block
    mesh(block, new THREE.BoxGeometry(0.9, 1.3, 0.5), MAT.steelDk, 0, -0.65, 0); mesh(block, new THREE.TorusGeometry(0.35, 0.09, 8, 14, Math.PI * 1.5), MAT.steelDk, 0, -1.75, 0, 0, 0, Math.PI * 0.75)
  })
  /* the part currently being lowered by the active system, in building space */
  const lift = { on: false, x: 0, y: 0, z: 0 }
  function craneFollow() {
    if (!crane.top) return
    if (!lift.on) { crane.top.rotation.y += (0.6 - crane.top.rotation.y) * 0.05; return }
    const dx = lift.x - crane.pos.x, dz = lift.z - crane.pos.z
    const yaw = Math.atan2(-dz, dx)
    crane.top.rotation.y += (yaw - crane.top.rotation.y) * 0.08
    const r = clamp(Math.hypot(dx, dz), 6, crane.jibLen - 2)
    crane.trolley.position.x += (r - crane.trolley.position.x) * 0.1
    const drop = clamp(crane.pos.y + crane.topY - (lift.y + 1.2), 2, 60)
    crane.line.scale.y = drop; crane.line.position.y = -drop / 2
    crane.block.position.y = -drop
  }
  /* mobile crane for the steel: stage 02, on the far side so the boom stays behind the work */
  prop(1, 2, gx - 38, groundY, -(DEPTH / 2) - 9, -0.35, g => {
    mesh(g, new THREE.BoxGeometry(12, 1.5, 3), MAT.white, 0, 1.35, 0)
    mesh(g, new THREE.BoxGeometry(2.6, 2.2, 2.9), MAT.cab, 4.6, 3.2, 0); mesh(g, new THREE.BoxGeometry(0.05, 1.2, 2.7), MAT.glass, 5.92, 3.4, 0)
    for (let i = 0; i < 5; i++) [-1.7, 1.7].forEach(z => mesh(g, new THREE.CylinderGeometry(0.72, 0.72, 0.65, 16), MAT.tyre, -4.8 + i * 2.4, 0.72, z, Math.PI / 2))
    ;[-1, 1].forEach(sg => [-3.6, 3.6].forEach(x => { mesh(g, new THREE.BoxGeometry(0.5, 0.5, 4.6), MAT.yellowDk, x, 1.1, sg * 2.2); mesh(g, new THREE.BoxGeometry(0.6, 1.2, 0.6), MAT.steelDk, x, 0.6, sg * 4.3); mesh(g, new THREE.BoxGeometry(1.4, 0.2, 1.4), MAT.steelDk, x, 0.1, sg * 4.3) }))   /* outriggers on pads */
    const sup = new THREE.Group(); sup.position.set(-2.6, 2.1, 0); g.add(sup)
    mesh(sup, new THREE.BoxGeometry(3.6, 1.6, 2.8), MAT.yellow, 0, 0.8, 0); mesh(sup, new THREE.BoxGeometry(1.4, 2, 2.8), MAT.steelDk, -2.4, 1, 0)   /* superstructure + counterweight */
    mesh(sup, new THREE.BoxGeometry(1.6, 1.5, 1.4), MAT.cab, 0.8, 1.55, 1.5)
    const boom = new THREE.Group(); boom.position.set(0.4, 1.6, 0); boom.rotation.z = 1.05; sup.add(boom)
    ;[[11, 1.1, 0], [10, 0.9, 9.5], [9, 0.72, 18.5]].forEach(([len, w, x0]) => mesh(boom, new THREE.BoxGeometry(len, w, w), MAT.yellow, x0 + len / 2, 0, 0))   /* telescopic sections */
    const tip = new THREE.Vector3(27.5, 0, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), 1.05)
    rod(sup, tip.x + 0.4, tip.y + 1.6, 0, tip.x + 0.4, 3, 0, 0.05, MAT.steelDk)                /* hook line */
    mesh(sup, new THREE.BoxGeometry(0.7, 1.1, 0.4), MAT.steelDk, tip.x + 0.4, 2.5, 0)
  })
  /* scissor lifts for the roof space and ceiling: stages 05 to 07 */
  const armMat = pmat(0x6B7280, { metalness: 0.5, roughness: 0.5 }), railMat2 = pmat(0xE5E7EB, { metalness: 0.4, roughness: 0.4 })
  ;[[gx - 8, 3], [gx + 10, -5]].forEach(([x, z], i) => prop(4 + i * 0.3, 7, x, Y.floorTop, z, 0.3, g => {
    mesh(g, new THREE.BoxGeometry(2.4, 0.7, 1.2), MAT.blue, 0, 0.55, 0)                                  /* chassis */
    ;[-0.95, 0.95].forEach(dx => [-0.7, 0.7].forEach(dz => mesh(g, new THREE.CylinderGeometry(0.22, 0.22, 0.2, 10), MAT.tyre, dx, 0.22, dz, Math.PI / 2)))
    mesh(g, new THREE.BoxGeometry(0.5, 0.5, 0.3), MAT.steelDk, 0.9, 1.1, 0)                                /* control box */
    const arm = new THREE.BoxGeometry(2.3, 0.09, 0.07)
    for (let j = 0; j < 3; j++) [-0.58, 0.58].forEach(dz => { mesh(g, arm, armMat, 0, 1.4 + j * 1.05, dz, 0, 0, 0.62); mesh(g, arm, armMat, 0, 1.4 + j * 1.05, dz, 0, 0, -0.62) })
    mesh(g, new THREE.BoxGeometry(2.9, 0.14, 1.5), MAT.steelDk, 0, 4.55, 0)                                /* platform */
    ;[-1.4, 1.4].forEach(dx => [-0.7, 0.7].forEach(dz => mesh(g, new THREE.BoxGeometry(0.05, 1.1, 0.05), railMat2, dx, 5.15, dz)))
    ;[-0.7, 0.7].forEach(dz => [5.15, 5.7].forEach(y => mesh(g, new THREE.BoxGeometry(2.85, 0.04, 0.04), railMat2, 0, y, dz)))
    ;[-1.4, 1.4].forEach(dx => [5.15, 5.7].forEach(y => mesh(g, new THREE.BoxGeometry(0.04, 0.04, 1.45), railMat2, dx, y, 0)))
    mesh(g, new THREE.BoxGeometry(2.85, 0.16, 0.03), MAT.yellowDk, 0, 4.7, 0.73)                            /* toe board */
  }))
  /* tool delivery on an air-ride trailer: stage 08 */
  prop(7, 7.8, gx + 6, Y.floorTop, 9.5, 0.1, g => {
    mesh(g, new THREE.BoxGeometry(6, 0.4, 2.4), MAT.steelDk, 0, 0.6, 0)
    ;[-2.2, 2.2].forEach(x => [-1.1, 1.1].forEach(z => mesh(g, new THREE.CylinderGeometry(0.35, 0.35, 0.3, 12), MAT.tyre, x, 0.35, z, Math.PI / 2)))
    mesh(g, new THREE.BoxGeometry(3.2, 2.8, 2.2), MAT.white, -0.6, 2.2, 0)                       /* crated tool */
    mesh(g, new THREE.BoxGeometry(3.3, 0.16, 2.3), MAT.orange, -0.6, 3.7, 0)
  })

  /* crews: instanced workers, one set per stage, placed at that stage's work face */
  const CREW = []
  const worker = (u0, x, y, z, ry, hat) => CREW.push({ u0, u1: u0 + 1, x, y, z, ry, hat })
  const subY = Y.slabTop + 0.02, fabY = Y.floorTop + 0.02, roofY = Y.trussBot - 1.4
  /* stage 01 crew stands on solid ground beside the pit, never inside its footprint (it opens under them otherwise) */
  ;[[EX.x1 + 5, EX.z0 + 6, 0.3, 'Y'], [EX.x1 + 7.5, EX.z0 + 3, 2.6, 'W'], [gx - 6, EX.z0 - 4, -0.4, 'Y'], [gx + 2, EX.z0 - 5.5, 2.2, 'O']].forEach(([x, z, r, h]) => worker(0, x, groundY, z, r, h))
  ;[[gx - 6, 4, 0.2, 'W'], [gx + 4, -6, 2.1, 'Y'], [gx + 12, 3, -0.8, 'Y']].forEach(([x, z, r, h]) => worker(1, x, Y.floorTop + 0.2, z, r, h))
  ;[[gx - 8, -6, 0.6, 'Y'], [gx + 2, 6.5, 2.8, 'O'], [gx + 10, -7, -0.3, 'Y']].forEach(([x, z, r, h]) => worker(2, x, subY, z, r, h))
  ;[[gx - 10, 2, 1.2, 'R'], [gx + 6, 2.5, -1.4, 'R']].forEach(([x, z, r, h]) => worker(3, x, subY, z, r, h))
  CREW.push({ u0: 4, u1: 7, x: gx - 8, y: Y.floorTop + 4.62, z: 3, ry: 0.2, hat: 'W' }); CREW.push({ u0: 4.3, u1: 7, x: gx + 10, y: Y.floorTop + 4.62, z: -5, ry: 2.4, hat: 'Y' })   /* on the lift platforms */
  ;[[gx - 4, 9, 0.4, 'Y'], [gx + 8, 8.6, 2.9, 'Y']].forEach(([x, z, r, h]) => worker(5, x, fabY, z, r, h))
  ;[[gx - 6, 0, 0.1, 'W'], [gx + 2, 4, 2.2, 'W'], [gx + 12, -2, -1, 'W']].forEach(([x, z, r, h]) => worker(6, x, fabY, z, r, h))
  ;[[gx - 2, 6.5, 0.3, 'W'], [gx + 6, -4, 2.6, 'W'], [gx + 12, 6.5, -0.6, 'O']].forEach(([x, z, r, h]) => worker(7, x, fabY, z, r, h))
  ;[[gx - 6, 3, 0.4, 'W'], [gx + 4, 6, 2.8, 'W'], [gx + 9, 2, -0.6, 'W'], [gx - 14, 8, 1.6, 'W']].forEach(([x, z, r, h]) => CREW.push({ u0: 8.6, u1: 99, x, y: groundY, z: EX.z1 + 12 + z, ry: r, hat: h }))
  const HAT = { Y: MAT.hatY, W: MAT.hatW, O: MAT.hatO, R: MAT.red }
  const crewParts = []
  function crewPart(geo, mat, dx, dy, dz, rz = 0) {
    const m = new THREE.InstancedMesh(geo, mat, CREW.length); m.castShadow = true; m.frustumCulled = false
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); world.add(m); crewParts.push({ m, dx, dy, dz, rz }); return m
  }
  const shirt = pmat(0x4F7FBF, { roughness: 0.8 }), boot = pmat(0x2A2420, { roughness: 0.9 }), stripe = pmat(0xE5E7EB, { roughness: 0.4 })
  crewPart(new THREE.CylinderGeometry(0.11, 0.1, 0.78, 8), MAT.navy, -0.14, 0.45, 0)             /* legs */
  crewPart(new THREE.CylinderGeometry(0.11, 0.1, 0.78, 8), MAT.navy, 0.14, 0.45, 0)
  crewPart(new THREE.BoxGeometry(0.2, 0.12, 0.3), boot, -0.14, 0.06, 0.03)                        /* boots */
  crewPart(new THREE.BoxGeometry(0.2, 0.12, 0.3), boot, 0.14, 0.06, 0.03)
  crewPart(new THREE.BoxGeometry(0.46, 0.62, 0.28), shirt, 0, 1.13, 0)                             /* shirt */
  crewPart(new THREE.BoxGeometry(0.5, 0.5, 0.31), MAT.hiVis, 0, 1.15, 0)                           /* vest */
  crewPart(new THREE.BoxGeometry(0.52, 0.06, 0.33), stripe, 0, 1.06, 0)                           /* reflective band */
  crewPart(new THREE.CylinderGeometry(0.07, 0.065, 0.58, 8), shirt, -0.32, 1.14, 0, 0.16)          /* arms */
  crewPart(new THREE.CylinderGeometry(0.07, 0.065, 0.58, 8), shirt, 0.32, 1.14, 0, -0.16)
  crewPart(new THREE.SphereGeometry(0.15, 10, 8), MAT.skin, 0, 1.62, 0)                            /* head */
  /* hardhats: one instanced mesh per colour so each crew keeps its own */
  const hatParts = {}
  const hatGeo = mergeGeometries([new THREE.CylinderGeometry(0.17, 0.2, 0.17, 12), new THREE.CylinderGeometry(0.26, 0.26, 0.03, 14).translate(0, -0.07, 0)], false)
  Object.keys(HAT).forEach(c => { const m = new THREE.InstancedMesh(hatGeo, HAT[c], CREW.length); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); world.add(m); hatParts[c] = m })
  const _cm = new THREE.Matrix4(), _cp = new THREE.Vector3(), _cq = new THREE.Quaternion(), _cs = new THREE.Vector3(), _ce = new THREE.Euler()
  let lastCrewU = -1
  function setCrews(u) {
    if (Math.abs(u - lastCrewU) < 0.002) return
    lastCrewU = u
    CREW.forEach((w, i) => {
      /* a crew walks on over the first 12% of its stage and leaves over the first 12% of the next */
      const t = u < w.u0 ? 0 : u < w.u0 + 0.12 ? (u - w.u0) / 0.12 : u <= w.u1 ? 1 : u < w.u1 + 0.12 ? 1 - (u - w.u1) / 0.12 : 0
      const sc = t <= 0 ? 0.001 : 0.75 + 0.25 * ease(t)
      const bob = t > 0 && t < 1 ? Math.sin(u * 80) * 0.03 : 0
      crewParts.forEach(pt => {
        _ce.set(0, w.ry, pt.rz); _cq.setFromEuler(_ce)
        _cp.set(w.x + pt.dx * Math.cos(w.ry) , w.y + pt.dy * sc + bob, w.z - pt.dx * Math.sin(w.ry) + pt.dz)
        _cs.set(sc, sc, sc); _cm.compose(_cp, _cq, _cs); pt.m.setMatrixAt(i, _cm)
        pt.m.instanceMatrix.needsUpdate = true
      })
      Object.keys(hatParts).forEach(c => {
        const on = c === w.hat && t > 0
        _cp.set(w.x, w.y + 1.78 * sc + bob, w.z); _cs.set(on ? sc : 0.001, on ? sc : 0.001, on ? sc : 0.001)
        _ce.set(0, w.ry, 0); _cq.setFromEuler(_ce); _cm.compose(_cp, _cq, _cs); hatParts[c].setMatrixAt(i, _cm); hatParts[c].instanceMatrix.needsUpdate = true
      })
    })
  }
  setCrews(0)

  /* ---- labels (client: "labels etc must be there"): callouts pinned to 3D anchors, shown for
     the active stage once its parts have landed, projected by the camera each frame ---- */
  const LABELS = [
    ['st', 'Driven pile', gx - 6, Y.pileTip + 4, 10], ['st', 'Pile cap', gx + 6, Y.capTop - 0.5, -10], ['st', 'Ground beam', gx, Y.beamTop - 0.4, 5], ['st', 'Sub-fab slab', gx - 12, Y.slabTop, 8], ['st', 'Column', gx + 6, Y.colTop - 2.5, 10], ['st', 'Waffle floor', gx + 4, Y.floorTop, -4],
    ['ar', 'Roof truss', gx, Y.trussTop - 1, 0], ['ar', 'Purlins', gx - 8, Y.trussTop + 0.3, 6], ['ar', 'Roof deck', gx + 10, Y.roof + 0.2, -6], ['ar', 'Wall envelope', gx + 2, (Y.floorTop + Y.roof) / 2, -DEPTH / 2 - 1.2],
    ['pu', 'PCW header', gx, Y.floorTop - 1.4, -6.5], ['pu', 'UPW header', gx + 6, Y.floorTop - 2.3, 5.6], ['pu', 'Riser to tool', gx + 3, Y.floorTop - 0.4, -6.5], ['pu', 'Gas cabinets', gx + 2, Y.slabTop + 2.3, 10.6], ['pu', 'Pipe rack', gx - 6, Y.floorTop - 2.75, 6.3],
    ['fp', 'Sprinkler main', gx, Y.trussBot - 0.5, -3], ['fp', 'Riser', gx - PITCH / 2 + 0.7, Y.floorTop + 2, -3], ['fp', 'Branch line', gx + 4, Y.trussBot - 0.5, 5],
    ['ac', 'Supply duct', gx, Y.trussBot - 1.9, -4], ['ac', 'Return duct', gx + 6, Y.trussBot - 1.9, 6], ['ac', 'Drop to plenum', gx, Y.ceiling + 1.2, -4],
    ['ac', 'Fresh air in', (BAYS * PITCH) / 2 + 8.6, Y.trussBot - 0.4, -4], ['ac', 'Return air out', (BAYS * PITCH) / 2 + 8.6, Y.trussBot - 0.4, 6],
    ['el', 'Cable tray', gx, Y.trussBot - 0.9, 7.4], ['el', 'Busbar', gx + 6, Y.floorTop - 1.75, -9.9], ['el', 'Switchboard', gx - 3, Y.slabTop + 2.4, 10.4], ['el', 'Transformer', -(BAYS * PITCH) / 2 - 5, Y.capTop + 2.8, 4],
    ['cr', 'Ceiling grid', gx + 4, Y.ceiling + 0.4, 0], ['cr', 'FFU field', gx - 4, Y.ceiling + 0.6, -6], ['cr', 'Air handler', gx + 6, Y.trussBot - 0.2, 9.5], ['cr', 'Cleanroom partition', gx, (Y.floorTop + Y.ceiling) / 2, -1.2], ['cr', 'Exhaust stack', gx + 3, Y.roof + 5.4, -6],
    ['tl', 'Process tool', gx, Y.floorTop + 3.2, -6.5], ['tl', 'Load ports', gx + 0.55, Y.floorTop + 1.1, 4.5 + 1.25], ['tl', 'Hookup drops', gx - 0.7, Y.floorTop - 0.6, 4.9], ['tl', 'Pump skid', gx + 1.8, Y.slabTop + 1.2, 4.7], ['tl', 'Wet bench', gx + 4.2, Y.floorTop + 1.5, -1.5],
  ]
  LABELS.push(['fin', 'Entrance & gowning', HERO_CX, Y.capTop + 9.5, DEPTH / 2 + 6], ['fin', 'Loading dock', (BAYS * PITCH) / 2 - 12, Y.capTop + 4.5, DEPTH / 2 + 6], ['fin', 'UPW plant', (BAYS * PITCH) / 2 + 32, Y.capTop + 13, -6], ['fin', 'Existing building', -(BAYS * PITCH) / 2 - 42, Y.capTop + 14, 6])
  const labelEls = LABELS.map(L => {
    const el = document.createElement('span'); el.className = 'fab-lab'; el.dataset.sys = L[0]
    /* 24 Sep (Bazil: "tag and point correctly, with icons"): the pill carries its system's colour chip (shown on the driven stage only) */
    el.innerHTML = '<i></i><b><s style="background:' + (STAGE_COLOR[L[0]] || '#E5E7EB') + '"></s>' + L[1] + '</b>'; view.appendChild(el); return { el, k: L[0], p: new THREE.Vector3(L[2], L[3], L[4]) }
  })
  const _lp = new THREE.Vector3()
  /* the rail's box in canvas pixels, refreshed every 30 frames (a layout read, kept rare) */
  let _rr = null, _rrN = 0
  function railRect() {
    if ((_rrN++ % 30) === 0) {
      const railEl = root.closest('.fab')?.querySelector('.fab-rail') || document.querySelector('.fab-rail')
      const v = root.getBoundingClientRect()
      if (railEl) { const b = railEl.getBoundingClientRect(); _rr = { r: b.right - v.left + 12, t: b.top - v.top - 12, b: b.bottom - v.top + 12 } } else _rr = null
    }
    return _rr
  }
  function placeLabels() {
    const recap = (SM.u >= 8 && SM.u < 8.5) ? Math.min(7, Math.floor((SM.u - 8) / 0.0625)) : -1
    const active = recap >= 0 ? recap : Math.min(Math.floor(SM.u), SYS.length)
    const overall = SM.u >= SYS.length && recap < 0
    /* (client: "don't know which is which and it's blocking the view"): at most four chips per
       stage, and any chip that would land within 46px of one already placed is pushed down a row */
    const placed = []
    let shown = 0
    labelEls.forEach(L => {
      const i = SYS.indexOf(L.k)
      const on = driven ? (!!focusKeys && focusKeys.includes(L.k) && shown < 6)
        : L.k === 'fin' ? (SM.u >= 8.82 && shown < 4) : (!overall && i === active && systems[L.k].built >= 0.7 && !(L.p.y < 0 && SM.u > 0.7) && shown < 3)
      if (!on) { L.el.style.opacity = '0'; L.el.style.pointerEvents = 'none'; return }
      _lp.copy(L.p).applyMatrix4(world.matrixWorld).project(camera)
      if (_lp.z > 1) { L.el.style.opacity = '0'; return }
      /* chips live in layout px inside the zoomed root, while W/H are rect px (zoom applied), so
         everything here is divided by the effective zoom or the chips drift right and down */
      const zk = W / Math.max(1, view.offsetWidth), Wl = W / zk, Hl = H / zk
      let x = (_lp.x * 0.5 + 0.5) * Wl, y = (-_lp.y * 0.5 + 0.5) * Hl
      /* never under the rail column or off the frame (a chip is ~160px wide) */
      const rr = railRect()
      if ((rr && x < rr.r / zk && y > rr.t / zk && y < rr.b / zk) || x < 16 || x > Wl - 170 || y < 24 || y > Hl - 28) { L.el.style.opacity = '0'; return }
      for (let k = 0; k < 6; k++) { const hit = placed.find(q => Math.abs(q.x - x) < 200 && Math.abs(q.y - y) < 46); if (!hit) break; y = (driven && hit.y + 46 > Hl - 28) ? hit.y - 46 : hit.y + 46 }
      /* studio: a chip that still lands on another, or off the frame, is left out rather than piled on */
      if (driven && (y < 64 || y > Hl - 44 || x > Wl - 150 || placed.some(q => Math.abs(q.x - x) < 200 && Math.abs(q.y - y) < 40))) { L.el.style.opacity = '0'; return }   /* the pill stands 30px above its dot */
      placed.push({ x, y }); shown++
      L.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'
      L.el.style.opacity = String(clamp((systems[L.k].built - 0.7) / 0.2, 0, 1))
    })
  }

  /* ---- drawing edges ------------------------------------------------------- */
  /* Their renders are BIM views: every box carries a dark edge. One merged LineSegments per
     system (one draw call each), built from the final matrices, and faded in only over the last
     tenth of that system's assembly so edges never float where a part has not yet landed. */
  const _e = new THREE.Matrix4()
  /* two sets per system: the hero cluster's edges follow the stage, the far bays' edges follow
     Overall, so the unbuilt bays never show as a wireframe behind the hero */
  SYS.forEach(k => {
    const geosH = [], geosF = []
    systems[k].parts.forEach(pt => {
      if (pt.mesh.geometry.type !== 'BoxGeometry') return
      const eg = new THREE.EdgesGeometry(pt.mesh.geometry, 20)
      pt.base.forEach((m, i) => { const g = eg.clone(); g.applyMatrix4(m); (pt.hero[i] ? geosH : geosF).push(g) })
      eg.dispose()
    })
    const mk = geos => {
      if (!geos.length) return null
      const merged = mergeGeometries(geos, false); geos.forEach(g => g.dispose())
      const lines = new THREE.LineSegments(merged, new THREE.LineBasicMaterial({ color: 0x0B1220, transparent: true, opacity: 0, depthWrite: false }))
      lines.renderOrder = 2; lines.visible = false; systems[k].group.add(lines); return lines
    }
    systems[k].edges = mk(geosH); systems[k].edgesFar = mk(geosF)
  })

  /* ---- state machine ------------------------------------------------------ */
  /* driven (24 Sep): in close on the built bays from the first frame, so the reset view is this one */
  const S = { u: driven ? 8.45 : 0, yaw: driven ? 0.92 : 0.88, pitch: driven ? 0.34 : 0.24, zoom: driven ? 0.94 : 1 }   /* driven: in close, air round the cluster */
  /* 17 Sep: a QA hook, in the manner of __globeQA on the home globe. It reports the scroll unit and
     where the camera is, so a probe can prove the building holds still between the systems instead
     of having to photograph a scene that takes seconds a frame to render headless. */
  window.__fabQA = () => ({ u: +S.u.toFixed(3), tOut: +(S.tOut || 0).toFixed(3),
    cam: [camera.position.x, camera.position.y, camera.position.z].map(v => +v.toFixed(3)),
    dist: +camera.position.length().toFixed(3) })
  const secured = new Array(SYS.length).fill(0), flash = new Array(SYS.length).fill(0)
  function blipRail(i) { const el = items[i]; if (!el) return; el.classList.remove('blip'); void el.offsetWidth; el.classList.add('blip'); setTimeout(() => el.classList.remove('blip'), 1400) }
  const SM = { u: 0 }
  const _t = new THREE.Vector3(), _m2 = new THREE.Matrix4()

  let liftSys = null, liftSeen = false, liftBest = -1e9
  const liftPt = new THREE.Vector3()
  function setBuilt(k, b, ov) {
    const sys = systems[k]
    if (Math.abs(sys.built - b) < 0.0005 && Math.abs((sys.ov || 0) - ov) < 0.0005) return
    sys.built = b; sys.ov = ov
    liftSeen = false; liftBest = -1e9
    sys.group.visible = b > 0
    /* 9 Sep (client, on an outlined isometric reference: "cant the 3d effect be this detailed").
       The detail in a drawing like that is the OUTLINE, not the shading, and this build already had
       a merged edge pass per system. It was only fading in over the last tenth of a build at half
       opacity, so it barely showed. It now comes in from 55% and lands at 0.8. */
    if (sys.edges) { const eo = clamp((b - 0.55) / 0.25, 0, 1); sys.edges.visible = eo > 0; sys.edges.userData.eo = eo; sys.edges.material.opacity = eo * 0.8 * (sys.edges.userData.k || 1) }
    if (sys.edgesFar) { const fo = clamp((ov - 0.6) / 0.25, 0, 1); sys.edgesFar.visible = fo > 0; sys.edgesFar.material.opacity = fo * 0.7 }
    if (b <= 0) return
    sys.parts.forEach(pt => {
      const mesh = pt.mesh, n = pt.base.length
      mesh.visible = true
      let any = false
      for (let i = 0; i < n; i++) {
        /* 4 Sep (client: "it must go down like real construction", "the 3d cannot just appear"):
           a part is either not yet on site (hidden), or it is being LOWERED into position at
           full size from above the frame, decelerating as it lands. Nothing scales up from a
           point and nothing pops in place. Hero-cluster parts follow their system's stage; the
           other seven bays are lowered in during Overall, far end first. */
        const t = pt.hero[i] ? ease(clamp((b - pt.stag[i]) / 0.36, 0, 1)) : ease(clamp((ov - pt.stag[i] * 0.8) / 0.35, 0, 1))
        _m2.copy(pt.base[i])
        if (t <= 0) _m2.scale(_t.set(0.001, 0.001, 0.001))
        else { if (t < 1) { const e = _m2.elements; e[12] += (1 - t) * pt.dir.x; e[13] += (1 - t) * pt.dir.y; e[14] += (1 - t) * pt.dir.z
            /* only crane lifts (from above) register as the crane's load */
            if (pt.hero[i] && pt.dir.y > 0) { liftSeen = true; if (e[13] > liftBest) { liftBest = e[13]; liftPt.set(e[12], e[13], e[14]) } } }
          any = true }
        mesh.setMatrixAt(i, _m2)
      }
      mesh.instanceMatrix.needsUpdate = true
      mesh.visible = any || b >= 1
    })
    sys.lifting = liftSeen && b < 1
    if (sys.lifting) { sys.liftPt = sys.liftPt || new THREE.Vector3(); sys.liftPt.copy(liftPt) }
  }
  function setLook(k, mode) {
    const sys = systems[k]
    if (sys.look === mode) return
    sys.look = mode
    /* 7 Sep: the ACTIVE system reads as a hologram — its edges turn cyan-white and additive, the way
       the client's references draw a lit BIM volume; grey and lit keep the quiet ink edge */
    const holo = mode === 'active'
    if (sys.edges && sys.edges.userData.eo !== undefined) sys.edges.material.opacity = sys.edges.userData.eo * (holo ? 0.8 : 0.8) * (mode === 'grey' ? 0.22 : 1)
    if (sys.edgesFar) sys.edgesFar.material.color.set(0x0B1220)
    if (sys.edges) { sys.edges.material.color.set(holo ? 0x9FE9FF : mode === 'grey' ? 0x8A94A6 : 0x0B1220); sys.edges.material.blending = holo ? THREE.AdditiveBlending : THREE.NormalBlending; sys.edges.material.needsUpdate = true; sys.edges.userData.k = mode === 'grey' ? 0.22 : 1 }
    if (driven) {
      /* the digital twin: at rest the model is dark slate with fine white edges, detailed and quiet; a lit system turns
         into a hologram in its own key colour (surfaces half-clear and self-lit, edges additive, the bloom does the
         rest); a system not in the pick dims further */
      const REST = new THREE.Color(0x3E4655), DIM = new THREE.Color(0x272D38)
      const KC = new THREE.Color(STAGE_COLOR[k] || '#E5E7EB')
      /* a near-white key (structure, tools) would bloom to a blob: those glow at a third, and stay solid */
      const kl = 0.2126 * KC.r + 0.7152 * KC.g + 0.0722 * KC.b, pale = kl > 0.62
      const GL = pale ? 0.0 : 0.22, OP = pale ? 0.9 : 0.58
      const PALE = new THREE.Color(0xA3ADBC)   /* a pale system lit: a light grey-blue body under the bloom threshold, its edges do the glowing */
      sys.mats.forEach(m => {
        const b = m.userData.base
        /* active: the system's own flat key colour, solid, a touch self-lit so it reads on the dark; nothing shiny */
        if (mode === 'active') { m.color.copy(b).lerp(KC, pale ? 0.1 : 0.45); if (!m.userData.hasEmissive) m.emissive.copy(KC).multiplyScalar(pale ? 0.04 : 0.14); m.emissiveIntensity = 1; m.transparent = m.userData.baseTransparent; m.opacity = m.userData.baseOpacity; m.depthWrite = !m.userData.baseTransparent; m.roughness = 0.7; m.envMapIntensity = 0.25 }
        else if (mode === 'grey') { m.color.copy(DIM); m.emissive.set(0x000000); m.transparent = true; m.opacity = m.userData.veil ? 0.3 : 0.5; m.depthWrite = true; m.roughness = 0.9; m.envMapIntensity = 0.08 }
        else if (mode === 'full') { m.color.copy(b); if (!m.userData.hasEmissive) m.emissive.copy(b).multiplyScalar(0.1); m.emissiveIntensity = 1; m.transparent = m.userData.baseTransparent; m.opacity = m.userData.baseOpacity; m.depthWrite = !m.userData.baseTransparent; m.roughness = m.userData.roughness !== undefined ? m.userData.roughness : m.roughness; m.envMapIntensity = 0.4 }
        else { m.color.copy(REST); if (!m.userData.hasEmissive) m.emissive.copy(REST).multiplyScalar(0.08); m.emissiveIntensity = 1; m.transparent = m.userData.baseTransparent; m.opacity = m.userData.baseOpacity; m.depthWrite = !m.userData.baseTransparent; m.roughness = 0.8; m.envMapIntensity = 0.2 }
        m.needsUpdate = false
      })
      if (sys.edges) {
        const eo = sys.edges.userData.eo !== undefined ? sys.edges.userData.eo : 0.8
        if (mode === 'active') { sys.edges.material.color.set(0xFFFFFF); sys.edges.material.blending = THREE.NormalBlending; sys.edges.material.opacity = eo * 0.45 }
        else if (mode === 'full') { sys.edges.material.color.set(0xFFFFFF); sys.edges.material.blending = THREE.NormalBlending; sys.edges.material.opacity = eo * 0.3 }
        else { sys.edges.material.color.set(0xFFFFFF); sys.edges.material.blending = THREE.NormalBlending; sys.edges.material.opacity = eo * (mode === 'grey' ? 0.06 : 0.22) }
      }
      if (sys.edgesFar) sys.edgesFar.material.color.set(0xFFFFFF)
      return
    }
    sys.mats.forEach(m => {
      if (mode === 'grey') {
        /* 7 Sep (client: "weird bug shadows"): a finished system used to lerp 94% toward slate at
           half opacity, and over the near-black ground that read as a dark stain on the slab. It
           now recedes to a light concrete grey and stays almost opaque, so it reads as built, not
           as shadow. */
        /* 10 Sep (Bazil, on the sub-fab: "the content is all over the place"). A finished
           system used to lerp 60% toward a LIGHT blue-grey, which on the dark band made the
           completed systems the brightest things in the frame, and 1,676 objects in the sub-fab
           rendered inside one pale band. It recedes DESATURATED now, toward a grey of its own
           luminance, so a dark pipe stays dark and a pale duct stays pale and the active system
           is the only saturated thing in the frame. The 12% lift keeps it reading as built
           rather than as shadow, which was the 7 Sep complaint. */
        {
          const b = m.userData.base, lum = 0.2126 * b.r + 0.7152 * b.g + 0.0722 * b.b
          m.color.copy(b).lerp(new THREE.Color(lum, lum, lum), 0.78).lerp(GREY_LIGHT, 0.12)
        }
        m.transparent = true; m.opacity = m.userData.veil ? 0.5 : 0.92; m.depthWrite = true; m.roughness = 0.9; m.envMapIntensity = 0.15
        m.emissive.set(0x000000)
      } else {
        m.color.copy(m.userData.base)
        /* 10 Sep: 0.34 / 0.14 was a lot of glow on everything that was not greyed out. The
           active system still lifts, because that is how you tell which one is being built,
           but a system that is merely lit now sits at 0.04 and lets the key light shape it. */
        if (!m.userData.hasEmissive) m.emissive.copy(m.userData.base).multiplyScalar(mode === 'active' ? 0.24 : 0.04)
        m.emissiveIntensity = 1
        m.transparent = m.userData.baseTransparent; m.opacity = m.userData.baseOpacity; m.depthWrite = !m.userData.baseTransparent
        m.roughness = m.userData.roughness !== undefined ? m.userData.roughness : m.roughness; m.envMapIntensity = 0.5
      }
      m.needsUpdate = false
    })
  }
  systems && SYS.forEach(k => systems[k].mats.forEach(m => { m.userData.roughness = m.roughness }))

  /* camera: close on the middle bays for the build, out to the whole building at the end */
  const CAM_NEAR = new THREE.Vector3(HERO_CX + 46, 22, 66), CAM_FAR = new THREE.Vector3(128, 56, 182)
  const CAM_CLOSE = new THREE.Vector3(HERO_CX + 40, 19, 58), LOOK_CLOSE = new THREE.Vector3(HERO_CX + 2, 6.5, 0)
  const LOOK_NEAR = new THREE.Vector3(HERO_CX + 2, 6.5, 0), LOOK_FAR = new THREE.Vector3(0, 8, 0)
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3()

  function apply() {
    const u = SM.u
    const active = Math.min(Math.floor(u), SYS.length)   /* 0..7 = a system, 8 = overall */
    const overall = u >= SYS.length
    /* Overall (client: "labels go through everything first, then only zoom out when all is built"):
       u 8 to 8.5 tours the eight systems one by one with their labels, then the far bays land,
       the envelope closes and the site finishes while the camera pulls out */
    const ov = ease(clamp((u - 8.5) / 0.4, 0, 1))
    const recapIdx = (u >= 8 && u < 8.5) ? Math.min(7, Math.floor((u - 8) / 0.0625)) : -1
    liftSys = u < 3.2 ? SYS[Math.min(Math.floor(u), SYS.length - 1)] : null
    SYS.forEach((k, i) => {
      /* (client: "give some time for the thing to land and light up and blip once like it's
         secure before scrolling to the others", then 4 Sep: "once complete each section give
         time before the next section scrolls").
         A stage builds across the FIRST 55% of its unit and then HOLDS, complete and lit, for
         the remaining 45%. It was 70/30, which meant the system landed and the next one started
         arriving almost immediately; the dwell is now half again as long for the same amount of
         scrolling. The moment it completes, a flash fires that decays in real time. */
      const built = clamp((u - i) / 0.55, 0, 1)
      if (built >= 1 && !secured[i] && u < SYS.length) { secured[i] = 1; flash[i] = 1; blipRail(i) }
      if (built < 1) secured[i] = 0
      setBuilt(k, built, ov)
      if (built > 0) setLook(k, recapIdx >= 0 ? (i === recapIdx ? 'active' : 'grey') : overall ? 'lit' : (i === active || built < 1) ? 'active' : 'grey')
    })
    /* a camera per phase, like their reference: the whole building while the structure and
       envelope go up, then in close on the middle bays while the services and tools are fitted so
       a 2.4m tool is legible, then out to the full facility for Overall */
    setBuilt('fin', clamp((u - 8.5) / 0.4, 0, 1), 1); if (systems.fin.built > 0) setLook('fin', 'lit')
    /* driven: the pick decides the look, not the scroll */
    /* six or more lit is the whole facility: true colours, no hologram, or the model blooms to a blob */
    if (driven) { const many = focusKeys && focusKeys.length >= 6; SYS.forEach(k => { if (systems[k].built > 0) setLook(k, focusKeys && focusKeys.length ? (focusKeys.includes(k) ? (many ? 'full' : 'active') : 'grey') : 'lit') }) }
    const tIn = ease(clamp((u - 1.6) / 0.9, 0, 1))
    const tOut = ease(clamp((u - 8.45) / 0.55, 0, 1)); S.tOut = tOut
    /* portrait phones need the camera much further back: the hero cluster must fit above the rail */
    const aspectK = clamp(1.55 / Math.max(0.4, camera.aspect), 1, 2.9)
    /* the far view already frames the whole site, so it needs far less of that push-back */
    const farK = clamp(1.55 / Math.max(0.4, camera.aspect), 1, 1.55)
    /* auto-focus (4 Sep, client: "can you automatically zoom in at a particular area", then "at
       every applying layer please zoom in to it").
       Two things were wrong with the first pass. It was gated on `u >= 1`, so stage 01 — the
       piling and the whole substructure — never got the move at all, and 24% was small enough
       to read as drift rather than as the camera going to look at something.
       Now every buildable stage gets it, the push tracks the BUILD itself (a system completes at
       0.70 of its unit) so the camera arrives as the last part lands and holds while the system
       stands lit, then releases over the final tenth to hand over to the next stage. That release
       and re-approach IS the move from one section to the next. Overall is excluded: it pulls out
       to frame the whole facility and a push-in would fight it. The visitor's own zoom multiplies
       on top, so this never overrides the hand. */
    /* 17 Sep (client: "To have a static building during scrolling between services but zoom effect
       once reach overall section", and "The zoom in and zoom out effect between scrolling of the
       scope kind of disturbing, in my opinion"). The per-stage push-in and release is off. The
       building now holds still while the nine systems land on it, and the only camera move left is
       the one the client asked to keep: the pull-out to the whole facility at Overall (tOut).
       FOCUS_PUSH is kept as the dial it was, at zero, so the old behaviour is one number away. */
    const FOCUS_PUSH = 0        /* was 0.34 */
    const fu = u - Math.floor(u)
    const inK = ease(clamp((fu - 0.16) / 0.39, 0, 1))     /* arrives with the last part, at 0.55 */
    const outK = ease(clamp((fu - 0.90) / 0.10, 0, 1))    /* lets go into the next stage */
    const focusK = (u < UNITS - 1) ? 1 + FOCUS_PUSH * inK * (1 - outK) * (1 - tOut) : 1
    camPos.lerpVectors(CAM_NEAR, CAM_CLOSE, tIn); camPos.lerp(CAM_FAR, tOut); camPos.multiplyScalar((aspectK + (farK - aspectK) * tOut) / (S.zoom * focusK))
    camLook.lerpVectors(LOOK_NEAR, LOOK_CLOSE, tIn); camLook.lerp(LOOK_FAR, tOut)
    /* during the close phase the eye moves to the LEVEL of the work: down under the floor for the
       sub-fab systems (03, 04), up into the roof space for ducts, trays and the ceiling (05-07),
       back to the fab floor for the tools (08) */
    /* stage 02 is roof work too: lift for it, drop into the sub-fab for 03-04, lift again for 05-07 */
    const lvl = u < 1 ? 0 : u < 2 ? 1 : u < 4.6 ? -1 : u < 7.3 ? 1 : 0
    const lvlK = (u < 2 ? ease(clamp((u - 1) / 0.5, 0, 1)) : tIn) * (1 - tOut)
    const lvlY = lvl < 0 ? -2.5 : lvl > 0 ? 3 : 0
    const wIn = u < 2.5 ? ease(clamp((u - 1.6) / 0.9, 0, 1)) : 1
    const wOutLow = ease(clamp((u - 4.3) / 0.6, 0, 1)), wOutHigh = ease(clamp((u - 7.0) / 0.6, 0, 1))
    /* the eye used to travel to the LEVEL of each system: under the floor for the sub-fab, up into
       the roof for the ducts. That is the other half of what read as moving between stages, so it
       is damped to a quarter: enough that sub-fab work is not looked at edge-on, small enough that
       the building reads as standing still. LEVEL_MOVE is the dial. */
    const LEVEL_MOVE = 0.25     /* was 1 */
    const dy = LEVEL_MOVE * lvlK * (lvl < 0 ? -2.5 * (1 - wOutLow) * wIn : lvl > 0 ? 3 * (1 - wOutHigh) * (u < 2 ? 1 : ease(clamp((u - 4.3) / 0.6, 0, 1))) : 0)
    camLook.y += dy * 0.9; camPos.y += dy * 1.6
    const t = tOut
    /* pitch tilts the camera around the look target; yaw turns the building */
    const r = camPos.length()
    const ang = Math.atan2(camPos.y - camLook.y, Math.hypot(camPos.x, camPos.z))
    const a2 = clamp(ang + S.pitch - 0.24, 0.06, 1.2)
    const h = Math.hypot(camPos.x, camPos.z)
    const dir = Math.atan2(camPos.z, camPos.x)
    const rr = Math.hypot(h, camPos.y - camLook.y)
    camera.position.set(Math.cos(dir) * Math.cos(a2) * rr, camLook.y + Math.sin(a2) * rr, Math.sin(dir) * Math.cos(a2) * rr)
    camera.lookAt(camLook)
    world.rotation.y = S.yaw + t * 0.35
  }

  /* ---- rail --------------------------------------------------------------- */
  let stageIdx = -1
  let lastCounter = ''
  function setStage(u) {
    const k = Math.min(Math.floor(u), UNITS - 1)
    const rc = (u >= 8 && u < 8.5) ? STAGES[Math.min(7, Math.floor((u - 8) / 0.0625))].t : null
    /* this now runs every frame rather than once per scroll event, so the text is only
       written when it actually changes */
    const label = STAGES[k].n + ' / ' + pad(UNITS) + ' · ' + (rc ? 'Review · ' + rc : STAGES[k].t)
    if (counter && label !== lastCounter) { counter.textContent = label; lastCounter = label }
    if (k === stageIdx) return
    stageIdx = k
    items.forEach((el, i) => { el.classList.toggle('on', i === k); el.classList.toggle('done', i < k); el.setAttribute('aria-current', i === k ? 'step' : 'false') })
    /* 15 Sep: the colour key mirrors the rail (the last stage, Overall, lights every row) */
    root.querySelectorAll('.fab-legend li').forEach((li, i) => li.classList.toggle('on', i === k || k >= SYS.length))
    root.dataset.stage = String(k); root.style.setProperty('--sp', (k / (UNITS - 1)).toFixed(3))
  }
  function setCue(p) { if (cue) cue.style.transform = 'scaleX(' + clamp(p, 0, 1) + ')' }

  /* ---- picking (client: "why can't I interact and see the parts and click on it"): hover names
     the part under the cursor from its system and the nearest label anchor, a click pins the name
     and pulses that system ---- */
  const pickEl = document.createElement('span'); pickEl.className = 'fab-lab fab-pick'; pickEl.innerHTML = '<i></i><b></b>'; view.appendChild(pickEl)
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), pick = { has: false, x: 0, y: 0, text: '', k: null, pinned: null, until: 0, down: null }
  const TITLE = {}; STAGES.forEach(st => { if (st.k) TITLE[st.k] = st.t }); TITLE.fin = 'Envelope & site'
  const _pw = new THREE.Vector3(), _pl = new THREE.Vector3()
  function pickTargets() { const out = []; Object.keys(systems).forEach(k => { const sy = systems[k]; if (!sy.group.visible) return; sy.parts.forEach(pt => { if (pt.mesh.visible) out.push(pt.mesh) }) }); return out }
  function pickHit() { ndc.set(pick.x / W * 2 - 1, -(pick.y / H) * 2 + 1); ray.setFromCamera(ndc, camera); return ray.intersectObjects(pickTargets(), false)[0] || null }
  function nameAt(k, worldPoint) {
    let best = null, bd = 1e9
    labelEls.forEach(L => { if (L.k !== k) return; _pl.copy(L.p).applyMatrix4(world.matrixWorld); const d = _pl.distanceTo(worldPoint); if (d < bd) { bd = d; best = L } })
    return TITLE[k] + (best && bd < 40 ? ' · ' + best.el.querySelector('b').textContent : '')
  }
  /* the part under the pointer lights up: a per-INSTANCE tint (instanceColor) so only that one
     beam, duct or tool glows, not every twin that shares its material. Restored on leave. */
  /* 7 Sep (client references: holographic wireframe, luminous edges, "go all out, refined, not
     messy"): the hovered part gets a cyan-white EDGE OUTLINE drawn additively over it, plus a
     cool lift of its own colour. One shared line object; its geometry swaps to the hovered
     part's cached edges and its matrix to that instance's live matrix, so it costs one draw. */
  const GLOW = new THREE.Color(0xD8F6FF), WHITE = new THREE.Color(0xFFFFFF)
  const hoverLine = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x9FE9FF, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending }))
  hoverLine.renderOrder = 4; hoverLine.visible = false; hoverLine.matrixAutoUpdate = false; hoverLine.frustumCulled = false
  const edgeCache = new Map()
  function edgesFor(geo) { let g = edgeCache.get(geo); if (!g) { g = new THREE.EdgesGeometry(geo, 20); edgeCache.set(geo, g) } return g }
  let glowMesh = null, glowId = -1
  function glowSet(mesh, id) {
    if (mesh === glowMesh && id === glowId) return
    if (glowMesh && glowId >= 0) { glowMesh.setColorAt(glowId, WHITE); glowMesh.instanceColor.needsUpdate = true }
    glowMesh = mesh; glowId = id
    if (mesh && id >= 0) {
      if (!mesh.instanceColor) { for (let i = 0; i < mesh.count; i++) mesh.setColorAt(i, WHITE) }
      mesh.setColorAt(id, GLOW); mesh.instanceColor.needsUpdate = true
      hoverLine.geometry = edgesFor(mesh.geometry)
      mesh.getMatrixAt(id, hoverLine.matrix)
      if (hoverLine.parent !== mesh.parent) { if (hoverLine.parent) hoverLine.parent.remove(hoverLine); mesh.parent.add(hoverLine) }
      hoverLine.visible = true
    } else hoverLine.visible = false
  }
  function pickFrame() {
    const zk = W / Math.max(1, view.offsetWidth), b = pickEl.querySelector('b')
    if (pick.pinned && performance.now() > pick.until) pick.pinned = null
    if (pick.pinned) {
      _pw.copy(pick.pinned.p).applyMatrix4(world.matrixWorld).project(camera)
      pickEl.style.transform = 'translate(' + ((_pw.x * 0.5 + 0.5) * W / zk).toFixed(1) + 'px,' + ((-_pw.y * 0.5 + 0.5) * H / zk).toFixed(1) + 'px)'
      b.textContent = pick.pinned.text; pickEl.classList.add('on'); pickEl.style.opacity = '1'; return
    }
    pickEl.classList.remove('on')
    if (!pick.has || dragging || pinch) { pickEl.style.opacity = '0'; canvas.style.cursor = ''; return }
    if (frame % 2) return
    const hit = pickHit()
    glowSet(hit && hit.object.isInstancedMesh ? hit.object : null, hit ? hit.instanceId : -1)
    if (!hit) { pickEl.style.opacity = '0'; canvas.style.cursor = ''; pick.k = null; return }
    pick.k = hit.object.userData.sys; pick.text = nameAt(pick.k, hit.point)
    b.textContent = pick.text
    pickEl.style.transform = 'translate(' + (pick.x / zk + 14).toFixed(1) + 'px,' + (pick.y / zk - 10).toFixed(1) + 'px)'
    pickEl.style.opacity = '1'; canvas.style.cursor = 'pointer'
  }
  if (import.meta.env && import.meta.env.DEV) window.__fabPick = pick

  /* ---- pointer: drag to rotate, pinch / controls to zoom, double-click to reset ---- */
  let dragging = false, lx = 0, ly = 0, vy = 0, vx = 0, pinch = null
  const ptrs = new Map()
  const YAW0 = S.yaw, PITCH0 = S.pitch, ZOOM0 = S.zoom

  /* ---- always return to the isometric front view ---------------------------
     (client 4 Sep: "fix the parallax spinning, it should always go back to the
     isometric front view")

     Drag used to be sticky: whatever angle you let go at was the angle the model
     kept, so one exploratory spin left the fab skewed for the rest of the scroll
     and every stage after it was read off-axis. Only a double-click or the reset
     button brought it back, which nobody discovers.

     The turn is still free. It just does not persist: a moment after the hand
     comes off, the model glides back to the view the section is composed around.
     The pause lets the flick and its inertia read as a deliberate look, rather
     than the camera snatching itself back the instant you release. */
  const TAU = Math.PI * 2
  const HOME_WAIT = 900        /* ms after release before it starts coming back */
  const HOME_RATE = 0.055      /* per-frame ease; a glide, not a snap */
  let homeAt = 0
  const cancelHome = () => { homeAt = 0 }
  const goHome = () => {
    /* reduced motion gets the destination, not the journey */
    if (reduce) { S.yaw = YAW0; S.pitch = PITCH0; homeAt = 0; render(); return }
    homeAt = performance.now() + HOME_WAIT
  }
  canvas.addEventListener('pointerdown', e => {
    pick.down = { x: e.clientX, y: e.clientY }
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (ptrs.size === 2) { const a = [...ptrs.values()]; pinch = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); dragging = false; return }
    dragging = true; lx = e.clientX; ly = e.clientY; vx = vy = 0
    try { canvas.setPointerCapture(e.pointerId) } catch (_) {}
    root.dataset.touched = '1'
    cancelHome()
  })
  canvas.addEventListener('pointermove', e => {
    { const r = canvas.getBoundingClientRect(); pick.x = e.clientX - r.left; pick.y = e.clientY - r.top; pick.has = e.pointerType !== 'touch' }
    if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (ptrs.size === 2 && pinch) {
      const a = [...ptrs.values()]; const d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y)
      S.zoom = clamp(S.zoom * (d / pinch), 0.6, 2.6); pinch = d; return
    }
    if (!dragging) return
    const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY
    vx = dx * 0.0034; vy = dy * 0.0026
    S.yaw += vx; S.pitch = clamp(S.pitch + vy, -0.12, 0.7)
  })
  const up = e => {
    ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null
    if (!ptrs.size) { dragging = false; goHome() }
    /* a tap or click (no drag) on a part pins its name for a few seconds and pulses that system */
    if (pick.down && e.type === 'pointerup' && Math.hypot(e.clientX - pick.down.x, e.clientY - pick.down.y) < 5) {
      const r = canvas.getBoundingClientRect(); pick.x = e.clientX - r.left; pick.y = e.clientY - r.top
      const hit = pickHit()
      if (hit) { pick.pinned = { p: world.worldToLocal(hit.point.clone()), text: nameAt(hit.object.userData.sys, hit.point) }; pick.until = performance.now() + 4000; const i = SYS.indexOf(hit.object.userData.sys); if (i >= 0 && flash[i] !== undefined) flash[i] = Math.max(flash[i], 0.9) }
      else pick.pinned = null
    }
    pick.down = null
  }
  canvas.addEventListener('pointerleave', () => { pick.has = false })
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up); canvas.addEventListener('lostpointercapture', up)
  canvas.addEventListener('dblclick', () => { S.yaw = YAW0; S.pitch = PITCH0; S.zoom = ZOOM0; cancelHome() })
  root.querySelectorAll('.fab-zoom button').forEach(b => b.addEventListener('click', () => {
    const z = b.dataset.z
    if (z === 'in') S.zoom = clamp(S.zoom * 1.25, 0.6, 2.6)
    else if (z === 'out') S.zoom = clamp(S.zoom / 1.25, 0.6, 2.6)
    else { S.yaw = YAW0; S.pitch = PITCH0; S.zoom = ZOOM0; cancelHome() }
  }))

  /* ---- sizing / loop ------------------------------------------------------ */
  let W = 1, H = 1, inView = false, raf = 0, frame = 0, dead = false
  function resize() {
    const r = view.getBoundingClientRect()
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height))
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, useAO ? 1.6 : 2))
    renderer.setSize(W, H, false)
    if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(W, H); aoPass.setSize(W, H); if (composer.userData && composer.userData.bloom) composer.userData.bloom.setSize(W, H) }
    camera.aspect = W / H
    /* desktop: the rail floats left, so the composition centre moves right. Phone: the rail sits
       at the bottom, so the building is lifted into the upper half instead. */
    /* 10 Sep (Bazil: "align the screen well, horizontally"). The rail takes the left .38fr plus
       the gap, so the model's column centre sits near 70% of the stage width. An 11% shift put
       the scene at 61%, visibly left of centre in its own column. 20% lands it there. */
    if (driven) camera.setViewOffset(W, H, W >= 1280 ? Math.round(W * 0.24) : 0, -Math.round(H * 0.06), W, H)   /* on the wide banner the model stands in the left half, the map on the right */
    else if (W > 900) camera.setViewOffset(W, H, -Math.round(W * 0.20), 0, W, H)
    else camera.setViewOffset(W, H, 0, Math.round(H * 0.16), W, H)
    camera.updateProjectionMatrix()
    renderer.shadowMap.needsUpdate = true
    bgWant = true
    render()
  }
  function render() {
    if (dead) return
    const gap = Math.abs(S.u - SM.u)
    SM.u += (S.u - SM.u) * (gap > 0.5 ? 0.075 : 0.026)   /* 4 Sep halved, 9 Sep again: still too fast */
    if (gap < 0.0005) SM.u = S.u
    /* inertia on the turn, and a slow idle drift when the visitor is not holding it */
    /* 4 Sep (client: "make sure it doesn't automatically turn to the back, should be the front
       only, we can turn the 3D"). The model used to creep round on its own: a slow idle drift
       here, and a turntable at Overall below. Left alone for half a minute the facility had its
       back to the camera, and the composed front view — the one the whole section is framed and
       lit for — was something you only saw for the first few seconds. Rotation is now entirely
       the visitor's: inertia still carries a flick, and nothing turns the building by itself. */
    if (!dragging) { S.yaw += vx; vx *= 0.9; S.pitch = clamp(S.pitch + vy, -0.12, 0.7); vy *= 0.9 }
    /* the glide home. The yaw target is the NEAREST equivalent of YAW0, not YAW0
       itself: someone who spins the building through two full turns should watch
       it settle the short way round, not slowly unwind 720 degrees. */
    if (homeAt && !dragging && !pinch && performance.now() >= homeAt) {
      const ty = YAW0 + TAU * Math.round((S.yaw - YAW0) / TAU)
      S.yaw += (ty - S.yaw) * HOME_RATE
      S.pitch += (PITCH0 - S.pitch) * HOME_RATE
      vx *= 0.6; vy *= 0.6            /* leftover inertia must not fight the return */
      if (Math.abs(ty - S.yaw) < 0.0015 && Math.abs(PITCH0 - S.pitch) < 0.0015) {
        S.yaw = YAW0; S.pitch = PITCH0; vx = vy = 0; homeAt = 0
      }
    }
    apply()
    /* the secure flash: a bright lift that decays over ~0.8s, and the live pulses of the stage */
    const now = performance.now() * 0.001
    SYS.forEach((k, i) => {
      const sys = systems[k]
      if (flash[i] > 0.002) { flash[i] *= 0.955; const f = flash[i]
        sys.mats.forEach(m => { if (!m.userData.hasEmissive) m.emissiveIntensity = 1 + f * 3.2 }) }
      else if (sys.look === 'active' && sys.pulse) { const pz = 0.6 + 0.4 * Math.sin(now * 3.1); sys.pulse.forEach(m => { m.emissiveIntensity = 0.6 + pz * 1.4 }) }
    })
    const ls = liftSys ? systems[liftSys] : null
    lift.on = !!(ls && ls.lifting)
    if (lift.on) { lift.x = ls.liftPt.x; lift.y = ls.liftPt.y; lift.z = ls.liftPt.z }
    if (!driven) { craneFollow(); { const tNow = performance.now() / 1000; for (let i = 0; i < MACH.length; i++) MACH[i].anim(tNow, SM.u) } }
    const overallNow = SM.u >= SYS.length
    AIR.update(now, !driven && (systems.ac.look === 'active' || overallNow) && systems.ac.built > 0.9 && !reduce)
    /* 7 Sep (client: "less messy, more informative"): the active rail item carries a live count of
       parts placed, from the same landed test the parts use, so the number is the truth on screen */
    if ((frame % 6) === 0) {
      const ai = Math.min(Math.floor(SM.u), SYS.length)
      if (ai < SYS.length) { const sys = systems[SYS[ai]]; let n = 0, d = 0
        sys.parts.forEach(pt => pt.hero.forEach((h, i) => { if (!h) return; n++; if (sys.built - pt.stag[i] >= 0.42) d++ }))
        const el = items[ai] && items[ai].querySelector('.fab-st-ct'); if (el) el.textContent = d + ' / ' + n + ' placed' }
    }
    if (!driven) ENV.update(S.tOut || 0)
    FLOW.forEach(m => {
      const sysOf = SYS.find(k => systems[k].mats.includes(m)); const live = sysOf && (systems[sysOf].look === 'active' || overallNow) && systems[sysOf].built > 0.9
      if (live) { m.emissiveMap.offset.y -= 0.012 * m.userData.flow; if (m.emissiveIntensity < 1.3) m.emissiveIntensity = 1.3 }
    })
    /* (client: "we can check spin"): a slow turntable once the facility is complete, until it is held */
    /* the Overall turntable is gone for the same reason: it was the fastest way to end up
       looking at the back of the building without having touched anything */
    setStage(SM.u)
    applyProps(SM.u)
    setBackfill(SM.u)
    placeLabels()
    pickFrame()
    if ((frame++ % 3) === 0) renderer.shadowMap.needsUpdate = true
    if (composer) composer.render(); else renderer.render(scene, camera)
    /* driven (Bazil: "the whole background should be the same that's inside the 3D, the whole section"): the banner takes the
       rendered ground colour, read from the sky corner of the frame just drawn, once, and again on a resize */
    if (driven && bgWant) { bgWant = false; try { const gl = renderer.getContext(); const px = new Uint8Array(4); gl.readPixels(2, Math.max(0, gl.drawingBufferHeight - 3), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const sec = root.closest('.sm-map-dark'); if (sec && (px[0] + px[1] + px[2]) > 0) sec.style.setProperty('--fv-bg', 'rgb(' + px[0] + ',' + px[1] + ',' + px[2] + ')') } catch (e) {} }
  }
  function loop() { if (dead || !inView) { raf = 0; return } render(); raf = requestAnimationFrame(loop) }
  const io = new IntersectionObserver(es => es.forEach(e => { inView = e.isIntersecting; if (inView && !raf && !reduce) raf = requestAnimationFrame(loop); if (inView && reduce) render() }), { rootMargin: '10% 0px' })
  io.observe(root)
  const ro = window.ResizeObserver ? new ResizeObserver(resize) : null
  if (ro) ro.observe(view)
  resize()

  /* ---- scroll ------------------------------------------------------------- */
  let st = null
  let snapCleanup = null
  if (import.meta.env && import.meta.env.DEV) { window.__fabS = S; window.__fabWorld = world; window.__fabRender = () => { SM.u = S.u; render(); return { u: S.u, W, H, rr: railRect(), parts: SYS.map(k => [k, systems[k].group.visible ? systems[k].parts.filter(p => p.mesh.visible).length : 0, systems[k].look]), landed: SYS.map(k => { const sys = systems[k]; let n = 0, d = 0; sys.parts.forEach(pt => pt.hero.forEach((h, i) => { if (!h) return; n++; if (sys.built - pt.stag[i] >= 0.36) d++ })); return k + ':' + d + '/' + n }) , cam: camera.position.toArray().map(v => Math.round(v)), yaw: +world.rotation.y.toFixed(2), calls: renderer.info.render.calls, tris: renderer.info.render.triangles, zoom: +S.zoom.toFixed(2), crane: crane.top ? { on: lift.on, yaw: +crane.top.rotation.y.toFixed(2), trolley: +crane.trolley.position.x.toFixed(1), line: +crane.line.scale.y.toFixed(1), target: [Math.round(lift.x), Math.round(lift.y), Math.round(lift.z)] } : null } } }
  /* dev harness: ?fabu=<stage units> poses the model statically at that point and scrolls the
     section into view, so a headless browser can capture any stage without scrubbing. */
  const pose = (import.meta.env && import.meta.env.DEV) ? new URLSearchParams(location.search).get('fabu') : null
  if (driven) {
    /* 8.45: every system built on the middle bays, no envelope or site yet, so what is lit can be seen.
       The studio: only the building. Earth, hardstanding, site, crews, machines and the sky go; a shadow-catching
       plane stands in for the ground, so the building casts one soft shadow on white */
    const keepG = new Set(Object.keys(systems).map(k => systems[k].group))
    world.children.forEach(o => { if (!keepG.has(o)) o.visible = false })
    scene.children.forEach(o => { if (o !== world && !o.isLight) o.visible = false })
    /* the ground: a fine grid on the dark, and a shadow catcher above it */
    const gc = document.createElement('canvas'); gc.width = gc.height = 256; const gx = gc.getContext('2d')
    gx.strokeStyle = 'rgba(255,255,255,0.075)'; gx.lineWidth = 1; gx.beginPath(); gx.moveTo(0.5, 0); gx.lineTo(0.5, 256); gx.moveTo(0, 0.5); gx.lineTo(256, 0.5); gx.stroke()
    const gridTex = new THREE.CanvasTexture(gc); gridTex.wrapS = gridTex.wrapT = THREE.RepeatWrapping; gridTex.repeat.set(75, 75)
    const grid = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshBasicMaterial({ map: gridTex, transparent: true, depthWrite: false }))
    grid.rotation.x = -Math.PI / 2; grid.position.y = EARTH_TOP + 0.01; world.add(grid)
    const studio = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.ShadowMaterial({ opacity: 0.35 }))
    studio.rotation.x = -Math.PI / 2; studio.position.y = EARTH_TOP + 0.02; studio.receiveShadow = true; world.add(studio)
    hemi.intensity = 0.55; hemi.color.set(0xDDE4EE); hemi.groundColor.set(0x2A3140); key.intensity = 1.1; fill.intensity = 0.4
    root.dataset.static = '1'
    /* 24 Sep (Bazil: "can't really see clearly"): in close, the bays fill the frame, a shade lower pitch so the section reads */
    S.u = 8.45; SM.u = 8.45; setStage(UNITS - 1); setCue(1); render()
  } else if (pose !== null && pose !== undefined && pose !== '') {
    const u = clamp(parseFloat(pose) || 0, 0, UNITS)
    root.dataset.static = '1'
    S.u = u; SM.u = u; setStage(Math.min(u, UNITS - 0.001)); setCue(u / UNITS); render()
    setTimeout(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, root.getBoundingClientRect().top + window.scrollY + 2); render() }, 400)
  } else if (reduce) {
    root.dataset.static = '1'
    S.u = UNITS; SM.u = UNITS; setStage(UNITS - 1); setCue(1); render()
  } else {
    if ('scrollRestoration' in history) { try { history.scrollRestoration = 'manual' } catch (e) {} }
    setStage(0)
    /* ---- snap state -----------------------------------------------------------
       These MUST be declared BEFORE ScrollTrigger.create below. `onUpdate` runs during
       creation, and `snapDir` is a `let`: reading it from that first callback while it was
       still declared further down threw "Cannot access 'snapDir' before initialization" on
       every load of this page. (armSnap survived only because a function declaration hoists
       within its block; a let does not.) */
    const SNAP_AT = 0.86          /* inside the hold: the system completes at 0.55 of a unit */
    const SNAP_IDLE = 170         /* ms of stillness that counts as "stopped scrolling" */
    const SNAP_DEAD = 0.10        /* units: closer than this and it is already the stage */
    const SNAP_TAKE = 0.70        /* how far into the next unit a flick has to carry to claim it */
    let snapT = null, snapping = false, snapDir = 1

    st = ScrollTrigger.create({
      trigger: root, start: 'top top', end: 'bottom bottom',
      scrub: coarse ? 0.9 : 1.2, invalidateOnRefresh: true,
      onUpdate(self) {
        /* 4 Sep (client: "check the parallax so the people and equipment animation is correct
           and not out of whack"). setStage used to be called HERE, off the raw scroll value,
           while the building, the crews and the machines are all driven from SM.u, the
           smoothed mirror, one frame-rate-limited lerp behind. Two different numbers drove
           the same moment: on a quick scroll the rail lit "05 Air-conditioning" and named it
           in the counter while the model was still fitting stage 03 and the sub-fab crew was
           still standing under it. The rail now reads the mirror, in the render loop, so the
           label, the highlighted step, the built systems, the workers and the plant are all
           the same one number. The gauge keeps tracking raw scroll progress, which is honest:
           it measures how far through the section you are, not what the model is showing. */
        S.u = self.progress * UNITS; setCue(self.progress)
        if (!raf && inView) render()
        if (self.direction) snapDir = self.direction
        armSnap()
      },
      onLeave() { S.u = UNITS; SM.u = UNITS; setStage(UNITS - 0.001); setCue(1); disarmSnap() },
      onLeaveBack() { S.u = 0; SM.u = 0; setStage(0); setCue(0); disarmSnap() },
    })

    /* ---- one system at a time -------------------------------------------------
       (client 4 Sep: "make the parallax more realistic, go one by one instead of
       being able to pass all of them too quickly")

       The MODEL already holds: a stage builds across the first 70% of its unit and
       then sits, lit, for the remaining 30%, which is the beat the client asked for
       earlier ("give some time for the thing to land and light up and blip once").
       But nothing held the SCROLL. With Lenis at wheelMultiplier 1.8, two flicks
       carried you from piling to handover and every one of those holds went by
       unseen, so the sequence read as one blur rather than nine steps.

       So the scroll settles too. When the wheel stops inside the runway, the page
       eases to the nearest stage's HOLD window, where that system stands complete
       and lit. The result is that a flick advances a stage and stops, rather than
       cascading through all nine.

       Deliberately NOT ScrollTrigger's own `snap`: it drives window.scrollTo and
       fights Lenis, which owns the scroll position on this site. This snaps THROUGH
       Lenis, so the two never argue.

       It stays out of the way: it waits for the scroll to actually stop, it never
       fires while the model is being dragged or pinched, it ignores gaps small
       enough that the visitor is already looking at the stage, and any new wheel
       input cancels it mid-flight. */


    /* the scroll position at which stage k stands complete and lit */
    const anchorY = k => st.start + (st.end - st.start) * ((k + SNAP_AT) / UNITS)

    function disarmSnap() { if (snapT) { clearTimeout(snapT); snapT = null } }
    function armSnap() {
      if (reduce || snapping) return
      disarmSnap()
      snapT = setTimeout(runSnap, SNAP_IDLE)
    }
    function runSnap() {
      snapT = null
      if (reduce || snapping || dragging || pinch) return
      if (!st || !st.isActive) return
      const u = st.progress * UNITS
      /* the last unit is the handover: let it run to the end of the runway and release,
         rather than parking the visitor inside a section they have finished */
      if (u >= UNITS - 1 + SNAP_AT) return
      /* DIRECTION-AWARE, not nearest. Nearest sounds right and feels wrong: a unit is over
         1000px, so a normal forward flick lands around a third of the way into the next
         stage and nearest would drag the visitor BACK to the one they just left, which
         reads as the page refusing to advance. Travelling forward, a flick claims the next
         stage once it carries 30% into it; travelling back, the same in reverse. So one
         gesture moves exactly one system, either way. */
      const rel = u - SNAP_AT
      const k = clamp(
        snapDir >= 0 ? Math.floor(rel + SNAP_TAKE) : Math.ceil(rel - SNAP_TAKE),
        0, UNITS - 1)
      const target = k + SNAP_AT
      if (Math.abs(u - target) < SNAP_DEAD) return
      const y = anchorY(k)
      /* distance-proportional, so a nudge settles quickly and a long throw eases */
      const dur = clamp(Math.abs(u - target) * 0.85, 0.28, 0.75)
      snapping = true
      const done = () => { snapping = false }
      if (window.__lenis && window.__lenis.scrollTo) {
        window.__lenis.scrollTo(y, { duration: dur, easing: t => 1 - Math.pow(1 - t, 3), onComplete: done })
        /* Lenis drops onComplete if the user interrupts, so release the lock regardless */
        setTimeout(done, dur * 1000 + 120)
      } else {
        window.scrollTo({ top: y, behavior: 'smooth' })
        setTimeout(done, 600)
      }
    }
    /* any fresh input cancels a pending settle, so the snap can never fight the hand */
    const cancelSnap = () => { disarmSnap(); snapping = false }
    window.addEventListener('wheel', cancelSnap, { passive: true })
    window.addEventListener('touchstart', cancelSnap, { passive: true })
    window.addEventListener('keydown', cancelSnap)
    snapCleanup = () => {
      disarmSnap()
      window.removeEventListener('wheel', cancelSnap)
      window.removeEventListener('touchstart', cancelSnap)
      window.removeEventListener('keydown', cancelSnap)
    }
    if (import.meta.env && import.meta.env.DEV) { window.__fabST = st; window.__ST = ScrollTrigger }
    /* dev: a hidden pane freezes rAF, so a probe can settle the mirror and render one frame */
    const refresh = () => { try { ScrollTrigger.refresh() } catch (e) {} }
    window.addEventListener('load', refresh)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh)
  }
  /* a rail click lands inside the stage's HOLD, so the system the visitor asked for is
     standing complete when the scroll arrives. It used to target u = k exactly, which is
     the instant BEFORE that system starts building, so clicking "Air-conditioning" showed
     no air-conditioning. */
  const clicks = items.map((el, k) => { const h = () => {
    if (!st) return
    const y = st.start + (st.end - st.start) * ((k + 0.86) / UNITS)
    if (window.__lenis && window.__lenis.scrollTo) window.__lenis.scrollTo(y, { duration: 1.1 }); else window.scrollTo({ top: y, behavior: 'smooth' })
  }; el.addEventListener('click', h); return h })

  const stop = () => {
    dead = true
    if (raf) cancelAnimationFrame(raf)
    if (snapCleanup) snapCleanup()
    if (st) st.kill()
    io.disconnect(); if (ro) ro.disconnect()
    items.forEach((el, k) => el.removeEventListener('click', clicks[k]))
    scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose()) })
    if (composer) composer.dispose()
    renderer.dispose()
    /* remove what this instance put in the DOM, so a remount (HMR, StrictMode) never leaves
       a stale duplicate set of chips or a dead canvas behind */
    labelEls.forEach(L => L.el.remove())
    if (renderer.domElement.parentNode) renderer.domElement.remove()
    delete window.__fabQA
  }
  stop.focus = keys => { focusKeys = keys && keys.length ? keys.slice() : null; if (!raf) render() }
  return stop
}
