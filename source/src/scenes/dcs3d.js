/* ============================================================================
   DISTRICT COOLING, IN 3D · 25 Sep 2026.
   Bazil, with the EFM slide "Services Scope · Energy Management · Energy As A Service": "put this info in for the
   district cooling 3D, very detailed and easy to understand, don't cut corners", then "apply it in the specific page".

   One isometric district, built from primitives (nothing to download): the central plant with its chillers, pumps
   and cooling towers; the thermal energy storage tank; the two-pipe network (chilled water out in blue, warmer water
   back in red, the flow drawn moving along each pipe); an energy transfer station at every building; and the five
   kinds of building on IAQ's slide: offices, a hotel, universities, a hospital, a shopping mall.

   The parts follow IAQ's own EFM page (iaqtechnology.com.my/efm): the plant "serves multiple buildings from a single,
   centralized location"; insulated pipes carry the chilled water; thermal energy storage "stores cooling energy for
   later use"; the ETS at the user's building is "for metering of cooling energy, contractual segregation and
   hydraulic segregation".

   initDCS(root, { onReady }) returns { setStep(key), zoom(dir), reset(), stop() }.
   Steps: all, plant, tes, net, ets, bld, and the three delivery models epc, bot, om.
   ========================================================================= */
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

/* 26 Sep (Bazil: "make this a lot better and realistic"): the ground reads as a real district: asphalt roads with white
   lines, kerbed pavements, green lawns, a concrete plant yard; the walls stay light so the pipes and labels keep the eye */
const C = {
  ground: 0xDDE2E8, plot: 0xCFD5DC, grass: 0x8CBF76, grassDk: 0x7AB065,
  road: 0x7D8792, lane: 0xF4F6F8, walk: 0xD9DEE5,
  wall: 0xF3F5F8, wall2: 0xE6EBF1, trim: 0xC9D1DC, roof: 0xDDE3EA, roofDk: 0xC7CFD9,
  red: 0xEC2027, redDk: 0xB5121B, supply: 0x1E88E5, supplyDk: 0x0B5FA8, ret: 0xEF4B2A,   /* 26 Sep (Bazil: "does it look like it's warm colour?"): the return is a warm red-orange */
  steel: 0xB9C2CD, steelDk: 0x8A96A5, tank: 0xF4F6F9, glass: 0x9FC4E4, water: 0x62B5E8,
  tree: 0x5FA05A, treeDk: 0x4C8A4A, trunk: 0x8B6B4E, track: 0xC9796A, cool: 0x3AA0F0,
}

/* ---- facade textures: one bay by one floor, drawn once, repeated over each face ---- */
function facadeTex(kind) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128
  const g = c.getContext('2d')
  const fill = (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(x, y, w, h) }
  if (kind === 'office') {                    /* curtain wall: tall glass panes, thin mullions, a slab edge */
    const gr = g.createLinearGradient(0, 0, 128, 128); gr.addColorStop(0, '#8DB6DC'); gr.addColorStop(1, '#4F7FAE')
    fill(gr, 0, 0, 128, 128); fill('#EEF3F8', 0, 0, 128, 10); fill('#E3EAF2', 0, 0, 4, 128)
    fill('rgba(255,255,255,.22)', 18, 14, 22, 110)
  } else if (kind === 'hotel') {               /* balconies: a white slab band and a recessed glass line */
    fill('#F1F3F6', 0, 0, 128, 128); fill('#6D9BC7', 10, 30, 108, 76); fill('#FFFFFF', 0, 104, 128, 14); fill('#D5DDE7', 62, 30, 4, 76)
  } else if (kind === 'hospital') {            /* punched windows in a white wall */
    fill('#F5F7FA', 0, 0, 128, 128); fill('#6793C0', 22, 30, 84, 62); fill('#E1E7EF', 22, 92, 84, 6)
  } else if (kind === 'univ') {                 /* warm stone with tall windows */
    fill('#EBE3D6', 0, 0, 128, 128); fill('#6A91B5', 30, 22, 30, 80); fill('#6A91B5', 70, 22, 30, 80); fill('#DCD2C2', 0, 112, 128, 16)
  } else if (kind === 'mall') {                 /* a glass band over a white plinth */
    fill('#F4F6F9', 0, 0, 128, 128); fill('#72A2CE', 0, 18, 128, 60); fill('#DCE4EE', 0, 18, 128, 5); fill('#E7ECF2', 60, 18, 6, 60)
  } else if (kind === 'plant') {                /* industrial cladding: vertical ribs, a louvre band */
    fill('#EEF1F5', 0, 0, 128, 128); for (let i = 0; i < 128; i += 16) fill('#DDE3EA', i, 0, 3, 128)
    fill('#C7D0DB', 0, 44, 128, 26); for (let y = 46; y < 70; y += 5) fill('#AEB9C6', 0, y, 128, 2)
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8
  return t
}
/* flow texture for the pipes: chevrons on the pipe colour, moved along the pipe every frame */
function flowTex(hex) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 32
  const g = c.getContext('2d'); g.fillStyle = hex; g.fillRect(0, 0, 128, 32)
  g.fillStyle = 'rgba(255,255,255,.5)'   /* 26 Sep: softer chevrons, so the pipe keeps its colour (white washed the return to pink) */
  for (const x of [20, 84]) { g.beginPath(); g.moveTo(x, 4); g.lineTo(x + 18, 16); g.lineTo(x, 28); g.lineTo(x + 8, 28); g.lineTo(x + 26, 16); g.lineTo(x + 8, 4); g.closePath(); g.fill() }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8
  return t
}

export function initDCS(root, { onReady, onHover, onPick } = {}) {
  const canvas = root.querySelector('canvas')
  const labelsEl = root.querySelector('.dcs3-labels')
  const COARSE = matchMedia('(pointer: coarse)').matches
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.94
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.shadowMap.autoUpdate = false
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xF7F9FC)
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.55

  /* ---- camera: orthographic, the house dimetric ---- */
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -500, 1000)
  const HOME = { target: new THREE.Vector3(2, 0, -2), dir: new THREE.Vector3(1, 1.04, 1).normalize(), zoom: 1 }
  const HOME_BASE = HOME.target.clone()
  cam.position.copy(HOME.target).addScaledVector(HOME.dir, 240); cam.lookAt(HOME.target)
  const controls = new OrbitControls(cam, canvas)
  controls.enableZoom = false; controls.enablePan = false; controls.enableDamping = true; controls.dampingFactor = 0.08
  controls.rotateSpeed = 0.55
  controls.target.copy(HOME.target)
  const az0 = Math.atan2(HOME.dir.x, HOME.dir.z)
  controls.minAzimuthAngle = az0 - 0.55; controls.maxAzimuthAngle = az0 + 0.55
  controls.minPolarAngle = 0.62; controls.maxPolarAngle = 1.12
  controls.update()

  /* ---- light: sky, a low sun for long soft shadows, a fill ---- */
  scene.add(new THREE.HemisphereLight(0xE4EEFF, 0x98A3B1, 0.85))
  const sun = new THREE.DirectionalLight(0xFFF3E2, 3.1)
  sun.position.set(-60, 110, 70); sun.castShadow = true
  sun.shadow.mapSize.set(COARSE ? 1024 : 4096, COARSE ? 1024 : 4096)
  Object.assign(sun.shadow.camera, { left: -95, right: 95, top: 95, bottom: -95, near: 10, far: 320 })
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.3; sun.shadow.radius = 2.2
  scene.add(sun); scene.add(sun.target)
  const fill = new THREE.DirectionalLight(0xE8F1FF, 0.55); fill.position.set(80, 50, -40); scene.add(fill)

  /* ---- materials ---- */
  const M = {}
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0.0, ...o })
  M.ground = std(C.ground, { roughness: 1 }); M.plot = std(C.plot, { roughness: 1 }); M.grass = std(C.grass, { roughness: 1 })
  M.road = std(C.road, { roughness: 1 }); M.lane = std(C.lane); M.walk = std(C.walk, { roughness: 1 })
  M.wall = std(C.wall); M.wall2 = std(C.wall2); M.trim = std(C.trim); M.roof = std(C.roof); M.roofDk = std(C.roofDk)
  M.red = std(C.red, { roughness: 0.6 }); M.steel = std(C.steel, { roughness: 0.35, metalness: 0.55 }); M.steelDk = std(C.steelDk, { roughness: 0.4, metalness: 0.5 })
  M.tank = std(C.tank, { roughness: 0.5 }); M.glass = std(C.glass, { roughness: 0.15, metalness: 0.1 })
  M.water = std(C.water, { roughness: 0.2 }); M.tree = std(0xFFFFFF, { roughness: 0.9 }); M.treeDk = std(C.treeDk, { flatShading: true }); M.trunk = std(C.trunk)
  M.track = std(C.track, { roughness: 1 }); M.dark = std(0x5A6675); M.black = std(0x2B323C)
  M.supplyPlain = std(C.supply, { roughness: 0.45 }); M.retPlain = std(C.ret, { roughness: 0.45 })
  M.chiller = std(0x3E78B8, { roughness: 0.45, metalness: 0.25 }); M.chillerCond = std(0x5B8FC4, { roughness: 0.45, metalness: 0.25 })
  M.pump = std(0x2E7D5B, { roughness: 0.5 }); M.motor = std(0x6B7684, { roughness: 0.45, metalness: 0.4 })
  M.ets = std(0xF7F9FB, { roughness: 0.5 }); M.etsBand = std(C.supply, { roughness: 0.5, emissive: new THREE.Color(C.supply), emissiveIntensity: 0 })
  M.hx = std(0xA9B4C1, { roughness: 0.35, metalness: 0.6 })
  M.loop = std(0x7FC4F2, { roughness: 0.45 })
  const FT = { office: facadeTex('office'), hotel: facadeTex('hotel'), hospital: facadeTex('hospital'), univ: facadeTex('univ'), mall: facadeTex('mall'), plant: facadeTex('plant') }

  const shadow = (o, cast = true, recv = true) => { o.traverse(m => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = recv } }); return o }
  const box = (w, h, d, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y + h / 2, z); return m }
  const cyl = (r, h, mat, x = 0, y = 0, z = 0, seg = 28) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat); m.position.set(x, y + h / 2, z); return m }
  /* a building box with the facade repeated per bay and floor on each side, a plain roof on top */
  const facade = (w, h, d, kind, x, z, y = 0, bay = 4, floor = 3.6) => {
    const tx = FT[kind].clone(); tx.needsUpdate = true; tx.repeat.set(Math.max(1, Math.round(d / bay)), Math.max(1, Math.round(h / floor)))
    const tz = FT[kind].clone(); tz.needsUpdate = true; tz.repeat.set(Math.max(1, Math.round(w / bay)), Math.max(1, Math.round(h / floor)))
    const gl = { roughness: 0.3, metalness: 0.12, envMapIntensity: 1.15 }
    const mx = std(0xFFFFFF, { map: tx, ...gl }), mz = std(0xFFFFFF, { map: tz, ...gl })
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [mx, mx, M.roof, M.roof, mz, mz])
    m.position.set(x, y + h / 2, z); m.userData.glass = [mx, mz]
    return m
  }
  const parapet = (w, d, x, y, z, t = 0.35, h = 0.8) => {
    const g = new THREE.Group()
    g.add(box(w, h, t, M.trim, x, y, z - d / 2 + t / 2), box(w, h, t, M.trim, x, y, z + d / 2 - t / 2))
    g.add(box(t, h, d, M.trim, x - w / 2 + t / 2, y, z), box(t, h, d, M.trim, x + w / 2 - t / 2, y, z))
    return g
  }
  const rooftopUnits = (n, x, y, z, spread = 6) => {
    const g = new THREE.Group()
    for (let i = 0; i < n; i++) {
      const ox = x + (i % 3 - 1) * spread * .45, oz = z + (Math.floor(i / 3) - .5) * spread * .5
      g.add(box(2.2, 1.2, 1.6, M.wall2, ox, y, oz)); g.add(cyl(0.55, 0.2, M.dark, ox + 0.4, y + 1.2, oz, 18))
    }
    return g
  }

  const world = new THREE.Group(); scene.add(world)
  const hoverables = []
  const anchors = {}          /* name -> world point for the labels */
  const groups = {}           /* key -> THREE.Group, for highlight */

  /* ---- ground, plots, roads ---- */
  const G = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), M.ground); G.rotation.x = -Math.PI / 2; G.receiveShadow = true; world.add(G)
  const plate = (x0, z0, x1, z1, mat, y = 0.02) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), mat); m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); m.receiveShadow = true; world.add(m); return m }
  /* the district: an avenue along x at z=0, two streets along z */
  plate(-70, -3.5, 72, 3.5, M.road, 0.03)
  plate(-15.5, -56, -8.5, 56, M.road, 0.031); plate(20.5, -56, 27.5, 56, M.road, 0.032)
  for (let x = -68; x < 70; x += 6) if (Math.abs(x + 12) > 5 && Math.abs(x - 24) > 5) plate(x, -0.12, x + 3, 0.12, M.lane, 0.04)
  for (let z = -54; z < 54; z += 6) if (Math.abs(z) > 5) { plate(-12.12, z, -11.88, z + 3, M.lane, 0.041); plate(23.88, z, 24.12, z + 3, M.lane, 0.041) }
  const BLOCKS = {
    offices: [-66, -52, -19, -6], hotel: [-5, -52, 17, -6], univ: [31, -52, 70, -6],
    plant: [-66, 6, -19, 52], hospital: [-5, 6, 17, 52], mall: [31, 6, 70, 52],
  }
  for (const [k, [x0, z0, x1, z1]] of Object.entries(BLOCKS)) {
    plate(x0 - 1.5, z0 - 1.5, x1 + 1.5, z1 + 1.5, M.walk, 0.025)
    plate(x0, z0, x1, z1, k === 'plant' ? M.plot : M.grass, 0.035)
  }

  /* ---- trees, instanced ---- */
  const treePts = []
  const rowTrees = (x0, z0, x1, z1, n) => { for (let i = 0; i < n; i++) { const t = n === 1 ? .5 : i / (n - 1); treePts.push([x0 + (x1 - x0) * t, z0 + (z1 - z0) * t]) } }
  rowTrees(-64, -8, -21, -8, 8); rowTrees(-3, -8, 15, -8, 4); rowTrees(33, -8, 68, -8, 7)
  rowTrees(-3, 50, 15, 50, 4); rowTrees(33, 50, 68, 50, 7); rowTrees(-64, 50, -21, 50, 8)
  rowTrees(-3, 8, -3, 48, 7); rowTrees(68, 8, 68, 48, 7); rowTrees(-64, -50, -64, -10, 7)
  const trunkG = new THREE.CylinderGeometry(0.25, 0.3, 1.6, 6), crownG = new THREE.IcosahedronGeometry(1.5, 2)
  const trunks = new THREE.InstancedMesh(trunkG, M.trunk, treePts.length), crowns = new THREE.InstancedMesh(crownG, M.tree, treePts.length)
  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), s3 = new THREE.Vector3()
  treePts.forEach(([x, z], i) => {
    const sc = 0.85 + ((i * 37) % 10) / 22
    mtx.compose(new THREE.Vector3(x, 0.8, z), q, s3.set(1, 1, 1)); trunks.setMatrixAt(i, mtx)
    mtx.compose(new THREE.Vector3(x, 2.4 * sc, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, i * 1.3, 0)), s3.set(sc, sc * 1.15, sc)); crowns.setMatrixAt(i, mtx)
  })
  const tc = new THREE.Color(), TG = [0x5FA05A, 0x4F9150, 0x6BAA5E, 0x57984F]
  treePts.forEach((_, i) => crowns.setColorAt(i, tc.setHex(TG[(i * 7) % TG.length])))
  crowns.instanceColor.needsUpdate = true
  shadow(trunks); shadow(crowns); world.add(trunks, crowns)

  /* =====================================================================
     THE DISTRICT COOLING PLANT: a hall with its front walls cut away in the plant step, three chillers inside,
     a row of pumps, the supply and return headers; the cooling tower yard beside it; the red band of the slide.
     ===================================================================== */
  const plant = new THREE.Group(); groups.plant = plant; world.add(plant)
  const PX = -44, PZ = 26, PW = 22, PD = 14, PH = 9
  plant.add(box(PW + 1, 0.4, PD + 1, M.roofDk, PX, 0, PZ))                          /* slab */
  const backWall = box(PW, PH, 0.5, M.wall, PX, 0.4, PZ - PD / 2 + 0.25)
  const leftWall = box(0.5, PH, PD, M.wall, PX - PW / 2 + 0.25, 0.4, PZ)
  plant.add(backWall, leftWall)
  /* the two walls facing the camera and the roof: faded out in the plant step so the hall reads inside */
  const cutMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, map: (() => { const t = FT.plant.clone(); t.needsUpdate = true; t.repeat.set(6, 2); return t })(), roughness: 0.6, transparent: true, opacity: 1 })
  const cutRoofMat = new THREE.MeshStandardMaterial({ color: C.roof, roughness: 0.8, transparent: true, opacity: 1 })
  const frontWall = box(PW, PH, 0.5, cutMat, PX, 0.4, PZ + PD / 2 - 0.25)
  const rightWall = box(0.5, PH, PD, cutMat, PX + PW / 2 - 0.25, 0.4, PZ)
  const roof = box(PW + 0.6, 0.5, PD + 0.6, cutRoofMat, PX, PH + 0.4, PZ)
  const band = box(PW + 0.02, 0.9, 0.52, M.red, PX, 6.6, PZ + PD / 2 - 0.25)
  const band2 = box(0.52, 0.9, PD + 0.02, M.red, PX + PW / 2 - 0.25, 6.6, PZ)
  const cutaway = [frontWall, rightWall, roof, band, band2]
  plant.add(...cutaway)
  /* inside: three chillers (evaporator and condenser shells stacked, the compressor on top, a control panel) */
  const chillers = new THREE.Group(); plant.add(chillers)
  for (let i = 0; i < 3; i++) {
    const cx = PX - 6 + i * 6, cz = PZ + 0.5
    const ev = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 7, 24), M.chiller); ev.rotation.x = Math.PI / 2; ev.position.set(cx, 1.5, cz)
    const co = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 7, 24), M.chillerCond); co.rotation.x = Math.PI / 2; co.position.set(cx, 3.3, cz)
    const comp = box(1.6, 1.2, 2.2, M.motor, cx, 4.2, cz - 1)
    const panel = box(1.4, 2.2, 0.6, M.wall2, cx + 1.8, 0.4, cz + 2.6)
    const feet = box(2.2, 0.5, 6.4, M.steelDk, cx, 0.4, cz)
    chillers.add(feet, ev, co, comp, panel)
    /* 26 Sep (Bazil: "remove this, two extended bars cut in half"): the nozzles stood upright from the header height and
       ended in the air. Each now runs level from its shell to its header: the evaporator's chilled water to the supply
       header, the condenser's to the return header, and it stops at the header's face */
    const noz = (x, y, z0, z1, mat) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, z1 - z0, 14), mat); m.rotation.x = Math.PI / 2; m.position.set(x, y, (z0 + z1) / 2); return m }
    chillers.add(noz(cx - 0.6, 1.4, PZ - 5.4 + 0.4, cz - 3.4, M.supplyPlain), noz(cx + 0.6, 3.2, PZ - 5.4 + 0.4, cz - 3.4, M.retPlain))
  }
  anchors.chillers = new THREE.Vector3(PX, 5.5, PZ + 0.5)
  /* the pumps along the front of the hall */
  const pumps = new THREE.Group(); plant.add(pumps)
  for (let i = 0; i < 4; i++) {
    const x = PX - 7.5 + i * 3.2, z = PZ + 5.2
    const base = box(2.2, 0.35, 1.2, M.steelDk, x, 0.4, z)
    const vol = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.6, 20), M.pump); vol.rotation.x = Math.PI / 2; vol.position.set(x - 0.5, 1.3, z)
    const mot = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.2, 18), M.motor); mot.rotation.z = Math.PI / 2; mot.position.set(x + 0.45, 1.25, z)
    pumps.add(base, vol, mot)
  }
  anchors.pumps = new THREE.Vector3(PX - 2.5, 2.2, PZ + 5.2)
  /* headers along the back wall, out through the right wall to the network */
  const hdrS = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, PW - 2, 20), M.supplyPlain); hdrS.rotation.z = Math.PI / 2; hdrS.position.set(PX + 1, 1.4, PZ - 5.4)
  const hdrR = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, PW - 2, 20), M.retPlain); hdrR.rotation.z = Math.PI / 2; hdrR.position.set(PX + 1, 3.2, PZ - 5.4)
  plant.add(hdrS, hdrR)
  /* the cooling tower yard, beside the hall: four cells, each a fan in a shroud, and the vapour rising */
  const towers = new THREE.Group(); world.add(towers); groups.towers = towers
  const TX = -44, TZ = 44
  towers.add(box(24, 0.5, 8, M.roofDk, TX, 0, TZ))
  const fans = []
  for (let i = 0; i < 4; i++) {
    const x = TX - 8.4 + i * 5.6
    towers.add(box(5.2, 4.6, 7, M.wall2, x, 0.5, TZ))
    for (let y = 1.2; y < 4.4; y += 0.55) towers.add(box(5.22, 0.16, 7.02, M.trim, x, 0.5 + y, TZ))   /* louvres */
    const shroud = cyl(2, 1.6, M.wall, x, 5.1, TZ, 28); towers.add(shroud)
    const fan = new THREE.Group(); fan.position.set(x, 6.55, TZ)
    fan.add(cyl(0.35, 0.3, M.dark, 0, -0.15, 0, 12))
    for (let k = 0; k < 5; k++) { const bl = box(1.7, 0.06, 0.34, M.dark, 0.85, 0, 0); const p = new THREE.Group(); p.rotation.y = k * Math.PI * 2 / 5; p.add(bl); fan.add(p) }
    towers.add(fan); fans.push(fan)
  }
  anchors.towers = new THREE.Vector3(TX, 8.5, TZ)
  /* vapour: soft white puffs rising from the fans and fading (a sprite each, pooled) */
  const puffTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const r = g.createRadialGradient(32, 32, 2, 32, 32, 30); r.addColorStop(0, 'rgba(255,255,255,.95)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c) })()
  const puffs = []
  for (let i = 0; i < (COARSE ? 16 : 28); i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false, opacity: 0 }))
    sp.userData = { fan: i % 4, t: Math.random() }
    towers.add(sp); puffs.push(sp)
  }
  shadow(plant); shadow(towers)
  frontWall.castShadow = rightWall.castShadow = roof.castShadow = false
  anchors.plant = new THREE.Vector3(PX, 12, PZ)
  hoverables.push({ key: 'plant', obj: plant, label: 'District cooling plant' }, { key: 'plant', obj: towers, label: 'Cooling towers' })

  /* =====================================================================
     THERMAL ENERGY STORAGE: a tank beside the plant; in its step the shell fades to show the water inside,
     cold (blue) below the warmer (red) layer, the line between them moving as it charges and is drawn on.
     ===================================================================== */
  const tes = new THREE.Group(); groups.tes = tes; world.add(tes)
  const SX = -58, SZ = 13, SR = 5.2, SH = 15
  tes.add(cyl(SR + 0.8, 0.5, M.roofDk, SX, 0, SZ, 36))
  const shellMat = new THREE.MeshStandardMaterial({ color: C.tank, roughness: 0.45, transparent: true, opacity: 1, side: THREE.DoubleSide })
  const shell = cyl(SR, SH, shellMat, SX, 0.5, SZ, 48); tes.add(shell)
  const bandT = new THREE.Mesh(new THREE.CylinderGeometry(SR + 0.03, SR + 0.03, 1.1, 48, 1, true), std(C.supply, { roughness: 0.5 })); bandT.position.set(SX, 11.5, SZ); tes.add(bandT)
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(SR * 0.35, SR, 1.6, 48), M.tank); lid.position.set(SX, SH + 0.5 + 0.8, SZ); tes.add(lid)
  /* ring rail and a ladder */
  const rail = new THREE.Mesh(new THREE.TorusGeometry(SR * 0.9, 0.06, 6, 48), M.steel); rail.rotation.x = Math.PI / 2; rail.position.set(SX, SH + 2.6, SZ); tes.add(rail)
  for (let y = 1; y < SH; y += 0.7) tes.add(box(0.9, 0.08, 0.08, M.steelDk, SX + SR + 0.25, y, SZ + 1.2))
  tes.add(box(0.08, SH, 0.08, M.steelDk, SX + SR + 0.25, 0.5, SZ + 0.75), box(0.08, SH, 0.08, M.steelDk, SX + SR + 0.25, 0.5, SZ + 1.65))
  /* the water column inside */
  const cold = cyl(SR - 0.25, 1, std(0x2F8BE0, { roughness: 0.3, transparent: true, opacity: 0.92 }), SX, 0.6, SZ, 40)
  const warm = cyl(SR - 0.25, 1, std(0xE8686C, { roughness: 0.3, transparent: true, opacity: 0.9 }), SX, 0.6, SZ, 40)
  const cline = new THREE.Mesh(new THREE.CylinderGeometry(SR - 0.2, SR - 0.2, 0.18, 40), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.85 }))
  const inner = new THREE.Group(); inner.add(cold, warm, cline); inner.visible = false; tes.add(inner)
  const setLevel = f => {   /* f = the cold share of the tank */
    const h = SH - 0.4, hc = Math.max(0.3, h * f), hw = Math.max(0.3, h - hc)
    cold.scale.y = hc; cold.position.y = 0.6 + hc / 2
    warm.scale.y = hw; warm.position.y = 0.6 + hc + hw / 2
    cline.position.y = 0.6 + hc
  }
  setLevel(0.6)
  /* its pipes to the plant */
  tes.add(box(0.9, 0.9, 0.9, M.steelDk, SX + SR + 0.3, 0.5, SZ))
  shadow(tes); shell.castShadow = true
  anchors.tes = new THREE.Vector3(SX, SH + 4, SZ)
  hoverables.push({ key: 'tes', obj: tes, label: 'Thermal energy storage' })

  /* =====================================================================
     THE BUILDINGS on the network: offices, a hotel, universities, a hospital, a shopping mall.
     ===================================================================== */
  const bldAll = new THREE.Group(); world.add(bldAll)
  const glassMats = []
  const addB = (key, label, g, anchor) => { groups[key] = g; bldAll.add(shadow(g)); anchors[key] = anchor; hoverables.push({ key, obj: g, label }); g.traverse(m => { if (m.userData && m.userData.glass) glassMats.push(...m.userData.glass) }) }
  { /* offices: three towers on a podium, a plaza */
    const g = new THREE.Group()
    g.add(box(34, 0.6, 26, M.walk, -42.5, 0, -29))
    const t1 = facade(10, 30, 10, 'office', -50, -36); const t2 = facade(9, 22, 9, 'office', -36, -40); const t3 = facade(12, 14, 9, 'office', -44, -20)
    g.add(t1, t2, t3, parapet(10, 10, -50, 30, -36), parapet(9, 9, -36, 22, -40), parapet(12, 9, -44, 14, -20))
    g.add(rooftopUnits(3, -50, 30, -36, 6), rooftopUnits(2, -36, 22, -40, 5), rooftopUnits(3, -44, 14, -20, 6))
    g.add(box(8, 0.35, 3, M.trim, -44, 3.6, -15.2))   /* entrance canopy */
    addB('offices', 'Offices', g, new THREE.Vector3(-46, 33, -32))
  }
  { /* hotel: a podium and a slim tower, a rooftop pool on the podium */
    const g = new THREE.Group()
    g.add(facade(20, 6, 16, 'mall', 6, -26))
    g.add(facade(9, 30, 11, 'hotel', 2, -30, 6))
    g.add(parapet(9, 11, 2, 36, -30), rooftopUnits(2, 2, 36, -30, 4))
    g.add(box(7, 0.3, 5, M.water, 11.5, 6, -24))
    g.add(box(7.6, 0.25, 5.6, M.walk, 11.5, 5.95, -24))
    g.add(box(20.2, 0.5, 16.2, M.trim, 6, 6, -26))
    addB('hotel', 'Hotel', g, new THREE.Vector3(3, 39, -30))
  }
  { /* universities: three faculty blocks round a green, a sports field with a track */
    const g = new THREE.Group()
    g.add(facade(18, 10, 9, 'univ', 42, -44), facade(9, 12, 16, 'univ', 62, -34), facade(16, 8, 8, 'univ', 44, -26))
    g.add(parapet(18, 9, 42, 10, -44), parapet(9, 16, 62, 12, -34), parapet(16, 8, 44, 8, -26))
    const field = new THREE.Group()
    const track = new THREE.Mesh(new THREE.CircleGeometry(1, 48), M.track); track.scale.set(9, 5.2, 1); track.rotation.x = -Math.PI / 2; track.position.set(56, 0.06, -17); field.add(track)
    const pitch = new THREE.Mesh(new THREE.CircleGeometry(1, 48), M.grass); pitch.scale.set(7, 3.4, 1); pitch.rotation.x = -Math.PI / 2; pitch.position.set(56, 0.07, -17); field.add(pitch)
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 6.4), M.lane); line.rotation.x = -Math.PI / 2; line.position.set(56, 0.08, -17); field.add(line)
    g.add(field)
    addB('univ', 'Universities', g, new THREE.Vector3(48, 15, -38))
  }
  { /* hospital: a cross plan, a helipad on the roof, the red cross, an ambulance canopy */
    const g = new THREE.Group()
    g.add(facade(22, 14, 9, 'hospital', 6, 26), facade(9, 18, 22, 'hospital', 6, 26))
    g.add(parapet(9, 22, 6, 18, 26))
    const pad = new THREE.Mesh(new THREE.CircleGeometry(3.2, 40), M.dark); pad.rotation.x = -Math.PI / 2; pad.position.set(6, 18.06, 22); g.add(pad)
    const ring = new THREE.Mesh(new THREE.RingGeometry(2.6, 2.9, 40), M.lane); ring.rotation.x = -Math.PI / 2; ring.position.set(6, 18.08, 22); g.add(ring)
    g.add(box(0.5, 0.05, 2.4, M.lane, 5.2, 18.08, 22), box(0.5, 0.05, 2.4, M.lane, 6.8, 18.08, 22), box(1.6, 0.05, 0.45, M.lane, 6, 18.08, 22))
    g.add(box(3, 0.9, 0.3, M.red, 6, 14.5, 37.2), box(0.9, 3, 0.3, M.red, 6, 13.5, 37.2))   /* the cross on the front */
    g.add(box(8, 0.35, 4, M.trim, 6, 3.4, 39.2), box(0.3, 3.4, 0.3, M.steelDk, 2.3, 0, 40.9), box(0.3, 3.4, 0.3, M.steelDk, 9.7, 0, 40.9))
    addB('hospital', 'Hospital', g, new THREE.Vector3(6, 22, 26))
  }
  { /* shopping mall: a long low block, a round glass atrium, skylights, the car park */
    const g = new THREE.Group()
    g.add(facade(30, 8, 16, 'mall', 51, 22, 0, 5, 4))
    const atr = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 9.5, 40), M.glass); atr.position.set(38, 4.75, 29); g.add(atr)
    g.add(cyl(6.2, 0.5, M.trim, 38, 9.5, 29, 40))
    for (let i = 0; i < 3; i++) g.add(box(5, 0.6, 3, M.glass, 48 + i * 7, 8, 20))
    g.add(parapet(30, 16, 51, 8, 22), rooftopUnits(3, 60, 8, 26, 6))
    /* car park bays */
    for (let i = 0; i < 9; i++) plate(38 + i * 3.4, 38.2, 38.12 + i * 3.4, 44, M.lane, 0.05)
    addB('mall', 'Shopping mall', g, new THREE.Vector3(48, 13, 24))
  }

  /* cars in the car park and moving on the roads */
  const carG = new THREE.BoxGeometry(2.1, 0.9, 1.1)
  const carCols = [0xFFFFFF, 0x2B323C, 0xB5121B, 0x8A96A5, 0x1E88E5, 0xDDE3EA]
  const parked = new THREE.InstancedMesh(carG, std(0xFFFFFF, { roughness: 0.4 }), 12)
  for (let i = 0; i < 12; i++) { mtx.compose(new THREE.Vector3(39.7 + (i % 8) * 3.4, 0.5, 41 + (i > 7 ? 0 : 0)), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)), s3.set(1, 1, 1)); parked.setMatrixAt(i, mtx); parked.setColorAt(i, new THREE.Color(carCols[i % carCols.length])) }
  shadow(parked); world.add(parked)
  const movers = []
  const carMat = std(0xFFFFFF, { roughness: 0.35, metalness: 0.2 })
  const carBodyG = new THREE.BoxGeometry(2.2, 0.6, 1.1), carCabG = new THREE.BoxGeometry(1.15, 0.42, 0.98), carGlass = std(0x27313D, { roughness: 0.2, metalness: 0.3 })
  const lanes = [
    { axis: 'x', c: -1.6, from: -70, to: 72, dir: 1 }, { axis: 'x', c: 1.6, from: 72, to: -70, dir: -1 },
    { axis: 'z', c: -13.6, from: -56, to: 56, dir: 1 }, { axis: 'z', c: -10.4, from: 56, to: -56, dir: -1 },
    { axis: 'z', c: 22.4, from: -56, to: 56, dir: 1 }, { axis: 'z', c: 25.6, from: 56, to: -56, dir: -1 },
  ]
  lanes.forEach((ln, li) => {
    for (let k = 0; k < (COARSE ? 1 : 3); k++) {
      /* 26 Sep (Bazil: "detailed and alive"): a body and a darker glass cabin, not a block */
      const m = new THREE.Group(); const bm = carMat.clone(); bm.color.set(carCols[(li * 3 + k) % carCols.length])
      const body = new THREE.Mesh(carBodyG, bm); body.position.y = -0.1; m.add(body)
      const cab = new THREE.Mesh(carCabG, carGlass); cab.position.set(-0.1, 0.42, 0); m.add(cab)
      m.userData = { ln, t: (k / (COARSE ? 1 : 3) + li * 0.17) % 1 }
      if (ln.axis === 'z') m.rotation.y = Math.PI / 2
      world.add(m); movers.push(m)
    }
  })

  /* 26 Sep (Bazil: "look very good, detailed and alive"): zebra crossings at the junctions, street lamps along the
     avenue, and people walking the pavements round every block */
  for (const x of [-19, -5, 17.5, 31]) for (let z = -3; z < 3.2; z += 1) plate(x - 1.3, z, x + 1.3, z + 0.5, M.lane, 0.046)
  for (const xc of [-12, 24]) for (const zc of [-6.4, 6.4]) for (let x = xc - 3.2; x < xc + 3.3; x += 1) plate(x, zc - 1.3, x + 0.5, zc + 1.3, M.lane, 0.046)
  {
    const pts = []
    for (let x = -64; x < 70; x += 11) if (Math.abs(x + 12) > 5 && Math.abs(x - 24) > 5) { pts.push([x, -4.6, 1], [x + 5.5, 4.6 + 2.4, -1]) }
    const poleG = new THREE.CylinderGeometry(0.09, 0.12, 5, 8), headG = new THREE.BoxGeometry(1.3, 0.16, 0.34)
    const poles = new THREE.InstancedMesh(poleG, M.steelDk, pts.length), heads = new THREE.InstancedMesh(headG, M.steel, pts.length)
    pts.forEach(([x, z, dir], i) => {
      mtx.compose(new THREE.Vector3(x, 2.5, z), q, s3.set(1, 1, 1)); poles.setMatrixAt(i, mtx)
      mtx.compose(new THREE.Vector3(x, 4.95, z + dir * 0.55), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)), s3.set(1, 1, 1)); heads.setMatrixAt(i, mtx)
    })
    poles.castShadow = true; world.add(poles, heads)
  }
  const walkers = []
  {
    const personG = new THREE.CapsuleGeometry(0.26, 0.75, 3, 8)
    const tones = [0x2B323C, 0xEC2027, 0x1E88E5, 0xF4F6F8, 0x5A6675, 0x27A560, 0xF2B705, 0x8A96A5]
    const people = new THREE.InstancedMesh(personG, std(0xFFFFFF, { roughness: 0.7 }), COARSE ? 24 : 54)
    const rings = Object.values(BLOCKS).map(([x0, z0, x1, z1]) => [x0 - 0.8, z0 - 0.8, x1 + 0.8, z1 + 0.8])
    for (let i = 0; i < people.count; i++) {
      people.setColorAt(i, new THREE.Color(tones[(i * 5) % tones.length]))
      walkers.push({ r: rings[i % rings.length], t: ((i * 0.137) % 1), v: (0.004 + ((i * 7) % 5) * 0.0012) * (i % 2 ? 1 : -1), ph: i * 1.7 })
    }
    people.instanceColor.needsUpdate = true
    walkers.mesh = people; world.add(people)
  }
  const ringAt = (r, t) => { const [x0, z0, x1, z1] = r, w = x1 - x0, h = z1 - z0, P = 2 * (w + h); let d = ((t % 1) + 1) % 1 * P
    if (d < w) return [x0 + d, z0]; d -= w; if (d < h) return [x1, z0 + d]; d -= h; if (d < w) return [x1 - d, z1]; d -= w; return [x0, z1 - d] }
  /* the trees' own matrices, so the crowns can sway round them */
  const crownBase = treePts.map((_, i) => { const m = new THREE.Matrix4(); crowns.getMatrixAt(i, m); return m })

  /* =====================================================================
     THE NETWORK: supply (blue) and return (red), side by side in a shallow trench along the avenue's south verge,
     a branch to each building; each pipe carries moving chevrons in the direction its water flows.
     ===================================================================== */
  const net = new THREE.Group(); groups.net = net; world.add(net)
  const FLOW = { s: flowTex('#1E88E5'), r: flowTex('#EF4B2A') }
  const flowMats = []
  const PIPE_R = 0.54, PY = 0.62   /* 26 Sep: the network is the story, so it reads bolder */
  const pipe = (pts, kind, width = PIPE_R) => {
    /* a polyline with rounded corners, tube along it, the chevrons scaled to its length */
    const path = new THREE.CurvePath(), RAD = 1.1
    let cur = pts[0].clone()
    for (let i = 1; i < pts.length; i++) {
      const b = pts[i]
      if (i < pts.length - 1) {
        /* a rounded elbow at every corner: stop short, curve through the corner, carry on */
        const n = pts[i + 1], din = b.clone().sub(cur), dout = n.clone().sub(b)
        const r = Math.min(RAD, din.length() / 2, dout.length() / 2)
        const p0 = b.clone().addScaledVector(din.normalize(), -r), p1 = b.clone().addScaledVector(dout.normalize(), r)
        if (p0.distanceTo(cur) > 1e-3) path.add(new THREE.LineCurve3(cur.clone(), p0))
        path.add(new THREE.QuadraticBezierCurve3(p0, b.clone(), p1)); cur = p1
      } else if (b.distanceTo(cur) > 1e-3) path.add(new THREE.LineCurve3(cur.clone(), b.clone()))
    }
    const len = path.getLength()
    const geo = new THREE.TubeGeometry(path, Math.max(8, Math.round(len * 1.5)), width, 14, false)
    const tex = FLOW[kind].clone(); tex.needsUpdate = true; tex.repeat.set(len / 3.2, 1)
    const mat = std(0xFFFFFF, { map: tex, roughness: 0.4, emissive: new THREE.Color(kind === 's' ? C.supply : C.ret), emissiveIntensity: 0.0 })
    mat.userData.tex = tex; flowMats.push(mat)
    const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true
    net.add(m); return m
  }
  const V = (x, z, y = PY) => new THREE.Vector3(x, y, z)
  /* the trench */
  const trench = std(0xC5CDD7, { roughness: 1 })
  const trenchStrip = (x0, z0, x1, z1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(x1 - x0) || 3.4, Math.abs(z1 - z0) || 3.4), trench); m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, 0.045, (z0 + z1) / 2); m.receiveShadow = true; net.add(m) }
  const ZS = 4.4, ZR = 5.8   /* trunk: supply and return lines along the south verge */
  trenchStrip(-34, 3.7, 68, 6.5)
  /* from the plant's headers (they leave the hall's right wall) and the tank, out to the verge */
  const px0 = PX + PW / 2 + 0.2
  pipe([V(px0 - 2, PZ - 5.4, 1.4), V(px0 + 2.5, PZ - 5.4, 1.4), V(px0 + 2.5, PZ - 5.4, PY), V(px0 + 2.5, ZS, PY), V(68, ZS)], 's')
  pipe([V(68, ZR), V(px0 + 4, ZR), V(px0 + 4, PZ - 3.4, PY), V(px0 + 4, PZ - 3.4, 3.2), V(px0 - 2, PZ - 3.4, 3.2)], 'r')
  trenchStrip(px0 + 1.5, ZS - 1, px0 + 5, PZ - 2.4)
  /* the tank sits on the supply side: charged from the plant, discharged into the network */
  pipe([V(SX + SR + 0.3, SZ, 0.9), V(PX - 6, SZ, 0.9), V(PX - 6, PZ - PD / 2 + 0.6, 0.9)], 's', 0.3)
  trenchStrip(SX + SR, SZ - 1, PX - 5, SZ + 1)
  /* branches: north across the avenue to offices, hotel, universities; south to hospital and mall */
  /* north of the avenue a station faces the camera on the building's south side; south of it, the station sits at
     the block's east edge, where the building cannot hide it from the camera */
  const ETS_AT = { offices: [-38, -13, -1], hotel: [0, -13, -1], univ: [38, -13, -1], hospital: [14, 13, 1], mall: [67, 13, 1] }
  const etsList = []
  for (const [k, [bx, bz, side]] of Object.entries(ETS_AT)) {
    const zs = side < 0 ? ZS : ZS, zr = ZR
    const tipZ = bz
    pipe([V(bx - 0.8, zs), V(bx - 0.8, tipZ - side * 0.2)], 's')
    pipe([V(bx + 0.8, tipZ - side * 0.2), V(bx + 0.8, zr)], 'r')
    trenchStrip(bx - 1.8, Math.min(ZS - 0.7, tipZ), bx + 1.8, Math.max(ZR + 0.7, tipZ))
    /* the energy transfer station: a white cabinet, a plate heat exchanger inside its open side, a meter */
    const e = new THREE.Group()
    const ez = tipZ + side * 1.6
    e.add(box(4.4, 2.6, 2.6, M.ets, bx, 0, ez))
    const bandE = box(4.42, 0.45, 2.62, M.etsBand, bx, 2.0, ez); e.add(bandE)
    for (let p = 0; p < 7; p++) e.add(box(0.14, 1.5, 1.3, M.hx, bx - 1.2 + p * 0.22, 0.35, ez - side * 0.1))
    e.add(box(0.7, 0.7, 0.2, M.dark, bx + 1.3, 1.1, ez + side * 1.32))
    /* the building's own loop, a lighter blue, from the station into the building */
    const loopEnd = bz + side * 5.2
    const lp1 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(V(bx + 0.4, ez + side * 1.3, 1.9), V(bx + 0.4, loopEnd, 1.9)), 6, 0.2, 10), M.loop)
    const lp2 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(V(bx - 0.4, ez + side * 1.3, 1.2), V(bx - 0.4, loopEnd, 1.2)), 6, 0.2, 10), M.loop)
    e.add(lp1, lp2)
    shadow(e); net.add(e)
    etsList.push({ key: k, g: e, band: bandE, loops: [lp1, lp2] })
    anchors['ets-' + k] = new THREE.Vector3(bx, 4.2, ez)
  }
  anchors.supply = new THREE.Vector3(-4, 1.5, ZS)
  anchors.ret = new THREE.Vector3(30, 1.5, ZR)
  hoverables.push({ key: 'net', obj: net, label: 'Chilled water network' })

  /* =====================================================================
     LABELS: HTML, placed on their anchors each frame. Names always; notes per step.
     ===================================================================== */
  const LBL = {
    plant: ['District cooling plant', 'name'], tes: ['Thermal energy storage', 'name'], offices: ['Offices', 'name'], hotel: ['Hotel', 'name'],
    univ: ['Universities', 'name'], hospital: ['Hospital', 'name'], mall: ['Shopping mall', 'name'],
    chillers: ['Chillers make the chilled water', 'note'], pumps: ['Pumps send it out', 'note'], towers: ['Cooling towers release the heat', 'note'],
    tesCharge: ['', 'note'], supply: ['Chilled water out', 'flow s'], ret: ['Warmer water back', 'flow r'],
  }
  anchors.tesCharge = new THREE.Vector3(SX + SR + 1, SH * 0.5, SZ + 3)
  for (const k of Object.keys(ETS_AT)) LBL['ets-' + k] = ['Energy transfer station', 'note ets']
  const labels = {}
  for (const [k, [t, cls]] of Object.entries(LBL)) {
    const el = document.createElement('span'); el.className = 'dcs3-lb ' + cls.split(' ').map(c => 'is-' + c).join(' '); el.textContent = t
    el.dataset.k = k; labelsEl.appendChild(el); labels[k] = el
  }
  /* 26 Sep (Bazil: "no need long descriptions, if you can label numbers or interact with the visual then good"): the five
     steps as numbered markers on the model, the numbers of the list beside it; a click on one picks its step */
  const NUMS = [
    ['plant', new THREE.Vector3(PX + PW / 2 + 1.5, 1.2, PZ + PD / 2 + 1.5), 'One central plant'],
    ['tes', new THREE.Vector3(SX + SR * 0.72, SH * 0.78, SZ + SR * 0.72), 'Thermal energy storage'],   /* on the tank's face, above the plant's roof */
    ['net', new THREE.Vector3(-26, 1.8, (ZS + ZR) / 2), 'The chilled water network'],   /* on the trunk by the plant, clear of the two flow labels */
    ['ets', anchors['ets-hotel'].clone().add(new THREE.Vector3(3.4, -2.2, 0)), 'An energy transfer station at each building'],
    ['bld', new THREE.Vector3(-40, 1.2, -13.6), 'Cooling in every building'],
  ]
  const nums = NUMS.map(([k, at, name], i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'dcs3-num'; b.dataset.k = k; b.textContent = String(i + 1)
    b.setAttribute('aria-label', `Step ${i + 1}: ${name}`)
    b.addEventListener('click', e => { e.stopPropagation(); onPick && onPick(k) })
    labelsEl.appendChild(b); return { k, at, el: b }
  })
  const pins = []   /* maintenance and model pins, made on demand */
  const pin = (k, text, where) => { const el = document.createElement('span'); el.className = 'dcs3-lb is-pin'; el.innerHTML = '<i></i>' + text; labelsEl.appendChild(el); anchors[k] = where; labels[k] = el; pins.push(k) }
  pin('om-ch', 'Chillers', anchors.chillers.clone().add(new THREE.Vector3(-3, 1, 0)))
  pin('om-tw', 'Cooling towers', anchors.towers.clone())
  pin('om-pu', 'Pumps', anchors.pumps.clone())
  pin('om-tes', 'Storage tank', anchors.tes.clone().add(new THREE.Vector3(0, -3, 0)))
  pin('om-ets', 'Transfer stations', anchors['ets-hospital'].clone())
  pin('epc-up', 'Upgraded, funded by IAQ', anchors.chillers.clone().add(new THREE.Vector3(3, 2.5, 0)))
  pin('bot-own', 'Built, run, then handed over', anchors.plant.clone().add(new THREE.Vector3(0, 3, 0)))

  /* =====================================================================
     STEPS: camera shot, cutaway, glow, labels
     ===================================================================== */
  /* 25 Sep (Bazil, on the plant step: "supposed to be more zoomed out and placed in the middle properly"): each step
     names the part of the district it is about as a box, and the camera frames that box, centred, at a set share of
     the stage, whatever the stage's size or shape. `fill` is how much of the stage the box takes. */
  const SHOTS = {
    all: { home: true },
    plant: { box: [-66, 0, 8, -30, 16, 50], fill: 0.74 },          /* hall, cooling tower yard and tank */
    tes: { box: [-66, 0, 4, -33, 20, 34], fill: 0.72 },            /* the tank with the hall beside it */
    net: { home: true, zoom: 1.04 },
    ets: { box: [-6, 0, -20, 70, 10, 20], fill: 0.86 },            /* the stations at the hotel, hospital, universities, mall */
    bld: { home: true },
    epc: { box: [-58, 0, 16, -30, 12, 38], fill: 0.66 },           /* the hall and its chillers */
    bot: { box: [-66, 0, 4, -24, 20, 50], fill: 0.8 },             /* the whole plant site */
    om: { box: [-66, 0, -20, 20, 20, 50], fill: 0.9 },             /* plant, tank, and the nearest stations */
  }
  /* the target and zoom that frame a shot, seen along `dir` */
  const frameShot = (sh, dir) => {
    if (sh.home) return { t: HOME.target.clone(), zoom: sh.zoom || 1 }
    const [x0, y0, z0, x1, y1, z1] = sh.box
    const c = new THREE.Vector3((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
    const probe = new THREE.OrthographicCamera(-1, 1, 1, -1, -500, 1000)
    probe.position.copy(c).addScaledVector(dir, 240); probe.lookAt(c); probe.updateMatrixWorld(true)
    const inv = probe.matrixWorldInverse, q3 = new THREE.Vector3()
    let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity
    for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) { q3.set(x, y, z).applyMatrix4(inv); a0 = Math.min(a0, q3.x); a1 = Math.max(a1, q3.x); b0 = Math.min(b0, q3.y); b1 = Math.max(b1, q3.y) }
    const right = new THREE.Vector3().setFromMatrixColumn(probe.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(probe.matrixWorld, 1)
    const t = c.clone().addScaledVector(right, (a0 + a1) / 2).addScaledVector(up, (b0 + b1) / 2)
    const halfW = (a1 - a0) / 2, halfH = (b1 - b0) / 2
    const aspect = W / H
    const zoom = Math.max(1, Math.min(6, sh.fill * Math.min(frustum * aspect / halfW, frustum / halfH)))
    return { t, zoom }
  }
  const SHOW = {   /* which labels each step shows */
    all: ['plant', 'tes', 'offices', 'hotel', 'univ', 'hospital', 'mall'],
    plant: ['chillers', 'pumps', 'towers'],
    tes: ['tes', 'tesCharge'],
    net: ['plant', 'supply', 'ret'],   /* 26 Sep (Bazil: "clean"): the network step names the pipes; the buildings speak in the others */
    ets: ['ets-hotel', 'ets-hospital', 'ets-univ', 'hotel', 'hospital'],
    bld: ['offices', 'hotel', 'univ', 'hospital', 'mall', 'plant'],
    epc: ['chillers', 'epc-up'],
    bot: ['bot-own', 'plant', 'tes'],
    om: ['om-ch', 'om-tw', 'om-pu', 'om-tes', 'om-ets'],
  }
  let step = 'all', stepT = 0
  const tw = { from: null, to: null, t: 1, dur: 1 }
  const startTween = (k) => {
    tw.from = { t: controls.target.clone(), zoom: cam.zoom, pos: cam.position.clone() }
    /* keep the visitor's turn, re-aimed at the new target, and framed along that same view */
    const dir = cam.position.clone().sub(controls.target).normalize()
    const to = frameShot(SHOTS[k], dir)
    tw.to = { t: to.t.clone(), zoom: to.zoom * zoomUser, pos: to.t.clone().addScaledVector(dir, 240) }
    tw.t = 0; tw.dur = REDUCED ? 0.01 : 1.5
  }
  let zoomUser = 1
  const cut = { v: 0, want: 0 }        /* plant cutaway */
  const tesCut = { v: 0, want: 0 }
  const glow = { net: 0, netW: 0, ets: 0, etsW: 0, cool: 0, coolW: 0, epc: 0, epcW: 0 }
  function setStep(k) {
    if (!SHOTS[k]) k = 'all'
    step = k; stepT = 0
    startTween(k)
    cut.want = (k === 'plant' || k === 'epc' || k === 'om') ? 1 : 0
    tesCut.want = (k === 'tes' || k === 'om') ? 1 : 0
    glow.netW = (k === 'net') ? 1 : 0
    glow.etsW = (k === 'ets' || k === 'om') ? 1 : 0
    glow.coolW = (k === 'bld') ? 1 : 0
    glow.epcW = (k === 'epc') ? 1 : 0
    const on = new Set(SHOW[k] || [])
    for (const [lk, el] of Object.entries(labels)) el.classList.toggle('on', on.has(lk))
    needShadow = true
  }
  let needShadow = true

  /* 26 Sep: ground-truth ambient occlusion on desktop, so every building sits in its own soft contact shade and the
     pipes, towers and trees read as solid; phones keep the direct render */
  let composer = null, aoPass = null
  if (!COARSE) {
    try {
      const rt = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: 4 })
      composer = new EffectComposer(renderer, rt)
      composer.addPass(new RenderPass(scene, cam))
      aoPass = new GTAOPass(scene, cam, 2, 2)
      aoPass.output = GTAOPass.OUTPUT.Default
      /* the pass skips points and lines but draws sprites and see-through surfaces as solids, which shaded the vapour
         puffs into grey slabs: they are skipped too */
      const ov = aoPass._overrideVisibility.bind(aoPass)
      aoPass._overrideVisibility = function () { ov(); const cache = this._visibilityCache; this.scene.traverse(o => { if (o.visible && (o.isSprite || (o.material && !Array.isArray(o.material) && o.material.transparent && o.material.opacity < 0.99))) { o.visible = false; cache.push(o) } }) }
      aoPass.blendIntensity = 1
      aoPass.updateGtaoMaterial({ radius: 3.2, distanceExponent: 1.2, thickness: 2.4, scale: 1, samples: 16, distanceFallOff: 1 })
      aoPass.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 5, rings: 2, samples: 16 })
      composer.addPass(aoPass)
      composer.addPass(new OutputPass())
    } catch (e) { composer = null; aoPass = null }
  }

  /* ---- size ---- */
  let W = 1, H = 1, frustum = 70
  function resize() {
    const r = root.getBoundingClientRect()
    const zf = parseFloat(getComputedStyle(document.documentElement).zoom) || 1
    W = Math.max(1, root.clientWidth); H = Math.max(1, root.clientHeight)
    const dpr = Math.min(COARSE ? 1.6 : 1.8, (window.devicePixelRatio || 1) * zf)
    renderer.setPixelRatio(dpr); renderer.setSize(W, H, false)
    if (composer) { composer.setPixelRatio(dpr); composer.setSize(W, H) }
    const aspect = W / H
    /* fit the whole district to the stage, whatever its shape: the district's box is taken into the home view's
       camera space, the home target moves to its centre and the frustum takes its size, with a little air round it */
    HOME.target.copy(HOME_BASE)
    const probe = new THREE.OrthographicCamera(-1, 1, 1, -1, -500, 1000)
    probe.position.copy(HOME.target).addScaledVector(HOME.dir, 240); probe.lookAt(HOME.target); probe.updateMatrixWorld(true)
    const inv = probe.matrixWorldInverse, p3 = new THREE.Vector3()
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
    for (const x of [-68, 72]) for (const z of [-55, 55]) for (const y of [0, 36]) { p3.set(x, y, z).applyMatrix4(inv); x0 = Math.min(x0, p3.x); x1 = Math.max(x1, p3.x); y0 = Math.min(y0, p3.y); y1 = Math.max(y1, p3.y) }
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2
    const right = new THREE.Vector3().setFromMatrixColumn(probe.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(probe.matrixWorld, 1)
    HOME.target.addScaledVector(right, cx).addScaledVector(up, cy)
    /* a narrow stage may crop the far corners a little rather than shrink the district to a stamp */
    const needW = (x1 - x0) / 2 * (aspect < 0.8 ? 0.9 : 1.03), needH = (y1 - y0) / 2 * 1.04
    frustum = Math.max(needH, needW / aspect)
    cam.left = -frustum * aspect; cam.right = frustum * aspect; cam.top = frustum; cam.bottom = -frustum
    cam.updateProjectionMatrix()
    if (tw.t >= 1 && typeof frameShot === 'function') { const d = cam.position.clone().sub(controls.target).normalize(); const f = frameShot(SHOTS[step], d); controls.target.copy(f.t); cam.position.copy(f.t).addScaledVector(d, 240); cam.zoom = f.zoom * zoomUser; cam.updateProjectionMatrix() }
    void r
  }
  const ro = new ResizeObserver(() => resize()); ro.observe(root)

  /* ---- hover: a name tag follows the pointer over a building ---- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2()
  let hoverKey = null
  const tip = document.createElement('span'); tip.className = 'dcs3-tip'; labelsEl.appendChild(tip)
  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect()
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    ray.setFromCamera(ndc, cam)
    let best = null, bd = Infinity
    for (const h of hoverables) { const hit = ray.intersectObject(h.obj, true)[0]; if (hit && hit.distance < bd) { bd = hit.distance; best = h } }
    const zf = r.width / canvas.clientWidth
    if (best) { tip.textContent = best.label; tip.style.transform = `translate(${(e.clientX - r.left) / zf + 14}px, ${(e.clientY - r.top) / zf - 10}px)`; tip.classList.add('on'); canvas.style.cursor = 'pointer' }
    else { tip.classList.remove('on'); canvas.style.cursor = '' }
    if ((best && best.key) !== hoverKey) { hoverKey = best ? best.key : null; onHover && onHover(hoverKey) }
  })
  canvas.addEventListener('pointerleave', () => { tip.classList.remove('on'); hoverKey = null; onHover && onHover(null) })

  /* ---- the loop ---- */
  let vis = true, raf = 0, last = performance.now(), T = 0, stopped = false, paused = false
  const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !raf) raf = requestAnimationFrame(frame) }, { rootMargin: '120px' }); io.observe(root)
  const onVis = () => { if (!document.hidden && vis && !raf) raf = requestAnimationFrame(frame) }
  document.addEventListener('visibilitychange', onVis)
  const pv = new THREE.Vector3()
  function frame(now) {
    raf = 0
    if (stopped || paused || !vis || document.hidden) return
    raf = requestAnimationFrame(frame)
    const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt; stepT += dt
    /* camera tween */
    if (tw.t < 1) {
      tw.t = Math.min(1, tw.t + dt / tw.dur); const e = tw.t < .5 ? 4 * tw.t ** 3 : 1 - (-2 * tw.t + 2) ** 3 / 2
      controls.target.lerpVectors(tw.from.t, tw.to.t, e); cam.position.lerpVectors(tw.from.pos, tw.to.pos, e)
      cam.zoom = tw.from.zoom + (tw.to.zoom - tw.from.zoom) * e; cam.updateProjectionMatrix()
    }
    controls.update()
    /* flow: chevrons move with the water; faster and brighter in the network step */
    const speed = (REDUCED ? 0.15 : 0.55) * (1 + glow.net * 0.8)
    for (const m of flowMats) { m.userData.tex.offset.x -= dt * speed; m.emissiveIntensity = 0.16 + glow.net * 0.5 }
    glow.net += (glow.netW - glow.net) * Math.min(1, dt * 4); glow.ets += (glow.etsW - glow.ets) * Math.min(1, dt * 4)
    glow.cool += (glow.coolW - glow.cool) * Math.min(1, dt * 3); glow.epc += (glow.epcW - glow.epc) * Math.min(1, dt * 4)
    /* the plant cutaway */
    cut.v += (cut.want - cut.v) * Math.min(1, dt * 3)
    const op = 1 - cut.v * 0.94
    cutMat.opacity = op; cutRoofMat.opacity = op; band.material.transparent = true; band.material.opacity = op; band2.material = band.material
    cutMat.depthWrite = cutRoofMat.depthWrite = op > 0.6
    for (const o of cutaway) o.visible = op > 0.03
    /* chillers glow green when upgraded (the performance contracting view) */
    M.chiller.emissive.setHex(0x22C55E); M.chiller.emissiveIntensity = glow.epc * (0.35 + 0.15 * Math.sin(T * 3))
    M.chillerCond.emissive.setHex(0x22C55E); M.chillerCond.emissiveIntensity = M.chiller.emissiveIntensity
    /* the tank: shell fades, water shows, the line between cold and warm water rises (charging) and falls (drawn on) */
    tesCut.v += (tesCut.want - tesCut.v) * Math.min(1, dt * 3)
    shellMat.opacity = 1 - tesCut.v * 0.78; shellMat.depthWrite = shellMat.opacity > 0.6
    inner.visible = tesCut.v > 0.05
    const cyc = (Math.sin(T * 0.5) + 1) / 2          /* one full charge and draw in about 12 s */
    setLevel(0.25 + cyc * 0.6)
    if (labels.tesCharge) { const rising = Math.cos(T * 0.5) > 0; const txt = rising ? 'Charging: cold water stored while demand is low' : 'Drawn on: cold water released at the peak'; if (labels.tesCharge.textContent !== txt) labels.tesCharge.textContent = txt }
    /* stations pulse in their step; the buildings' loops brighten */
    const pulse = 0.5 + 0.5 * Math.sin(T * 3.2)
    M.etsBand.emissiveIntensity = glow.ets * (0.4 + 0.6 * pulse)
    M.loop.emissive.setHex(0x7FC4F2); M.loop.emissiveIntensity = glow.ets * 0.5 + glow.cool * 0.6
    /* the buildings, cooled: the glass takes a cool tint in a wave outward from the plant */
    for (const gm of glassMats) { gm.emissive.setHex(C.cool); gm.emissiveIntensity = glow.cool * (0.3 + 0.14 * Math.sin(T * 2.2)) }
    /* fans turn, vapour rises */
    for (const f of fans) f.rotation.y += dt * (REDUCED ? 1.5 : 7)
    for (const p of puffs) {
      p.userData.t += dt * 0.28; if (p.userData.t > 1) p.userData.t -= 1
      const t = p.userData.t, f = fans[p.userData.fan]
      p.position.set(f.position.x + Math.sin(t * 6 + p.userData.fan) * 0.6, 7 + t * 7, f.position.z + Math.cos(t * 5) * 0.5)
      const sc = 2 + t * 4; p.scale.set(sc, sc, 1); p.material.opacity = (REDUCED ? 0.18 : 0.42) * Math.sin(Math.PI * t)
    }
    /* people walk their block, with a small step bob; the crowns sway a touch in the breeze */
    if (!REDUCED) {
      const pm = walkers.mesh
      for (let i = 0; i < walkers.length; i++) { const w = walkers[i]; w.t += w.v * dt * 6; const [x, z] = ringAt(w.r, w.t); mtx.makeTranslation(x, 0.64 + Math.abs(Math.sin(T * 7 + w.ph)) * 0.06, z); pm.setMatrixAt(i, mtx) }
      pm.instanceMatrix.needsUpdate = true
      const sw = new THREE.Matrix4()
      for (let i = 0; i < crownBase.length; i++) { sw.makeRotationZ(Math.sin(T * 1.1 + i * 0.7) * 0.035); const b = crownBase[i]; const e = b.elements; mtx.copy(b); mtx.setPosition(0, 0, 0); mtx.premultiply(sw); mtx.setPosition(e[12], e[13], e[14]); crowns.setMatrixAt(i, mtx) }
      crowns.instanceMatrix.needsUpdate = true
    }
    /* cars */
    for (const m of movers) {
      const { ln } = m.userData; m.userData.t = (m.userData.t + dt * (REDUCED ? 0.004 : 0.016)) % 1
      const v = ln.from + (ln.to - ln.from) * m.userData.t
      if (ln.axis === 'x') m.position.set(v, 0.5, ln.c); else m.position.set(ln.c, 0.5, v)
    }
    if (needShadow) { renderer.shadowMap.needsUpdate = true; needShadow = false }
    if (composer) composer.render(); else renderer.render(scene, cam)
    /* the step numbers ride on their points; the picked one is lit, the others quiet */
    const numXY = []
    for (const n of nums) {
      pv.copy(n.at).project(cam)
      const x = (pv.x * 0.5 + 0.5) * W, y = (-pv.y * 0.5 + 0.5) * H
      if (pv.z <= 1) numXY.push({ x, y, r: 19 })
      n.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`
      n.el.style.visibility = (pv.z > 1 || x < 0 || x > W || y < 0 || y > H) ? 'hidden' : ''
      n.el.classList.toggle('on', step === n.k); n.el.classList.toggle('dim', step !== 'all' && ['plant', 'tes', 'net', 'ets', 'bld'].includes(step) && step !== n.k)
    }
    /* labels: placed on their anchors, then any two that overlap are pushed apart, the higher one upward */
    const placed = []
    for (const [k, el] of Object.entries(labels)) {
      if (!el.classList.contains('on')) continue
      pv.copy(anchors[k]).project(cam)
      const w = el.offsetWidth || 120, h = (el.offsetHeight || 26) + 6
      { const y0 = (-pv.y * 0.5 + 0.5) * H; placed.push({ el, x: (pv.x * 0.5 + 0.5) * W, y: y0, y0, w, h, z: pv.z }) }
    }
    placed.sort((a, b) => b.y - a.y)
    for (let i = 0; i < placed.length; i++) {
      const a = placed[i]
      for (let pass = 0; pass < 4; pass++) {
        let moved = false
        for (let j = 0; j < i; j++) {
          const b = placed[j]
          if (Math.abs(a.x - b.x) < (a.w + b.w) / 2 + 4 && a.y > b.y - b.h && a.y - a.h < b.y) { a.y = b.y - b.h; moved = true }
        }
        /* 26 Sep (Bazil's capture: marker 3 sat on "Warmer water back"): a label never covers a step marker; it rises clear */
        /* it steps above or below the marker, whichever keeps it nearer its own building */
        for (const m of numXY) if (Math.abs(a.x - m.x) < a.w / 2 + m.r && a.y > m.y - m.r && a.y - a.h < m.y + m.r) { const up = m.y - m.r - 2, dn = m.y + m.r + 2 + a.h; a.y = Math.abs(up - a.y0) <= Math.abs(dn - a.y0) ? up : dn; moved = true }
        if (!moved) break
      }
      a.el.style.transform = `translate(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px) translate(-50%, -100%)`
      a.el.style.visibility = (a.z > 1 || a.x < -40 || a.x > W + 40 || a.y < -20 || a.y > H + 60) ? 'hidden' : ''
    }
  }
  resize()
  setStep('all')
  raf = requestAnimationFrame(t => { last = t; frame(t) })
  /* the shadow map bakes once the first frames are in */
  setTimeout(() => { needShadow = true }, 400)
  onReady && setTimeout(onReady, 60)

  return {
    setStep,
    get step() { return step },
    /* while IAQ's own animation is showing in the stage, the model rests */
    pause(on) { paused = !!on; if (!paused && !raf && vis) { last = performance.now(); raf = requestAnimationFrame(frame) } },
    zoom(dir) {
      zoomUser = dir === 0 ? 1 : Math.max(0.7, Math.min(2.4, zoomUser * (dir > 0 ? 1.25 : 0.8)))
      if (dir === 0) { const d = HOME.dir.clone(); tw.from = { t: controls.target.clone(), zoom: cam.zoom, pos: cam.position.clone() }; const s = frameShot(SHOTS[step], d); tw.to = { t: s.t.clone(), zoom: s.zoom, pos: s.t.clone().addScaledVector(d, 240) }; tw.t = 0; tw.dur = 1.1; return }
      tw.from = { t: controls.target.clone(), zoom: cam.zoom, pos: cam.position.clone() }
      tw.to = { t: controls.target.clone(), zoom: frameShot(SHOTS[step], cam.position.clone().sub(controls.target).normalize()).zoom * zoomUser, pos: cam.position.clone() }; tw.t = 0; tw.dur = 0.6
    },
    reset() { this.zoom(0) },
    stop() {
      stopped = true; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); document.removeEventListener('visibilitychange', onVis)
      if (composer) { try { composer.dispose && composer.dispose(); aoPass && aoPass.dispose && aoPass.dispose() } catch (e) {} }
      controls.dispose(); renderer.dispose(); pmrem.dispose()
      scene.traverse(o => { if (o.geometry) o.geometry.dispose(); const m = o.material; (Array.isArray(m) ? m : m ? [m] : []).forEach(x => { if (x.map) x.map.dispose(); x.dispose() }) })
      labelsEl.innerHTML = ''
    },
  }
}
