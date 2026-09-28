import * as THREE_MOD from 'three'

/* ============================================================================
   Contact page · the headquarters district (rebuilt 22 Sep 2026).

   Bazil, on the block map this replaces: "this map suck put their actual map", then three white-clay
   isometric city references: "to this detail take all the details and make it awesome zoom in", and
   "should take a whole left to right section".

   What it is now. The real district, not a drawing of one: every footprint, road, drain and pond
   within 560 m of IAQ's front door, from OpenStreetMap (tools/build-hqmap.py writes
   public/assets/iaq/hq-district.json; the page credits OpenStreetMap contributors, as the licence
   asks). It is modelled as a white clay miniature: 772 extruded buildings with roof decks and
   rooftop plant, kerbed roads with lane dashes, the Lebuhraya Shah Alam carriageways with traffic
   on them, verge trees, water. One building is red.

   What is real and what is not, because the difference matters on a map:
     · footprints, roads, water, names: OpenStreetMap, as surveyed
     · the pin: Google Maps' own pin for IAQ Technology International Sdn. Bhd.
     · the red building: the footprint nearest that pin (23 m). OSM does not name occupiers, so this
       is an inference and the builder script says so
     · heights: estimated from footprint area. Trees and rooftop plant: decorative

   The arrival: the band opens on the whole district from above and flies down to the front door the
   first time it is on screen. After that it is the visitor's: drag to turn, the buttons (or a pinch,
   or ctrl + wheel) to zoom between the street and the district. A plain wheel still scrolls the page.

   The enquiry form is owned by the React page (src/pages/Contact.jsx).
   ============================================================================ */

const DATA_URL = '/assets/iaq/hq-district.json'
const BG = 0xEEF1F5
const ROAD_W = [11, 9, 7, 4, 2]

function mulberry(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
const ringOf = f => { const r = []; for (let i = 0; i < f.length; i += 2) r.push([f[i], f[i + 1]]); return r }
const areaOf = r => { let s = 0; for (let i = 0; i < r.length; i++) { const a = r[i], b = r[(i + 1) % r.length]; s += a[0] * b[1] - b[0] * a[1] } return s / 2 }
function inside(p, r){ let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const a = r[i], b = r[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c } return c }
const dedupe = p => p.filter((v, i) => i === 0 || Math.hypot(v[0] - p[i - 1][0], v[1] - p[i - 1][1]) > 0.05)

/* plan (east, north, height) to scene: x east, y up, z south */
const P = (e, n, y) => [e, y, -n]

function Acc(){ this.p = []; this.n = [] }
Acc.prototype.tri = function(a, b, c, nx, ny, nz){ this.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); this.n.push(nx, ny, nz, nx, ny, nz, nx, ny, nz) }
Acc.prototype.mesh = function(THREE, mat){
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3))
  return new THREE.Mesh(g, mat)
}

function build(THREE, host, data, reduce){
  let W = host.clientWidth || 360, H = host.clientHeight || 280
  let dead = false, frames = 0
  const small = W < 760

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
  /* :root carries zoom 1.12 above 1024px, so a CSS pixel is 1.12 device pixels before DPR */
  const zoomK = window.innerWidth >= 1025 ? 1.12 : 1
  renderer.setPixelRatio(Math.min((window.devicePixelRatio || 1) * zoomK, small ? 1.75 : 2.25))
  renderer.setSize(W, H, false)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping
  renderer.setClearColor(BG, 1)
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(BG, 600, 2200)
  const camera = new THREE.PerspectiveCamera(24, W / H, 20, 9000)

  /* ---- light: a soft studio. Sums to 1.0 on a lit horizontal face, so the ground renders as the
     page colour and the fog has nothing to hide ---- */
  scene.add(new THREE.HemisphereLight(0xffffff, 0xB4BFD2, 0.7 * Math.PI))
  const sun = new THREE.DirectionalLight(0xFFF8EE, 0.4 * Math.PI)
  sun.position.set(-520, 760, 420)             /* from the south-west, 50 degrees up */
  sun.castShadow = true
  const sm = small ? 2048 : 4096
  sun.shadow.mapSize.set(sm, sm)
  const sc = sun.shadow.camera; sc.left = -700; sc.right = 700; sc.top = 700; sc.bottom = -700; sc.near = 100; sc.far = 2400
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.8
  scene.add(sun); scene.add(sun.target)

  const std = (color, rough) => new THREE.MeshStandardMaterial({ color, roughness: rough === undefined ? 0.95 : rough, metalness: 0 })
  const M = {
    ground: std(0xEEF1F5), plate: std(0xF4F6F9), green: std(0xE3EBE2), water: std(0xC6D9EE, 0.35),
    kerb: std(0xFAFBFC), road: std(0xDCE1E9), motor: std(0xD2D8E2), path: std(0xE6EAF0), dash: std(0xFFFFFF),
    clay: std(0xFFFFFF, 0.9), hq: std(0xEC2027, 0.55), tree: std(0xE4ECE3, 1), trunk: std(0xD9DDE3, 1), car: std(0xFBFCFD, 0.6),
  }

  /* ---- ground and the flat layers, stacked a few centimetres apart ---- */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(16000, 16000), M.ground)
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground)

  function flatPoly(acc, ring, y){
    if (areaOf(ring) < 0) ring = ring.slice().reverse()
    const tris = THREE.ShapeUtils.triangulateShape(ring.map(v => new THREE.Vector2(v[0], v[1])), [])
    for (const t of tris) {
      let a = ring[t[0]], b = ring[t[1]], c = ring[t[2]]
      if ((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]) < 0) { const s = b; b = c; c = s }
      acc.tri(P(a[0], a[1], y), P(b[0], b[1], y), P(c[0], c[1], y), 0, 1, 0)
    }
  }
  function prism(acc, ring, y0, y1){
    flatPoly(acc, ring, y1)
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i], b = ring[(i + 1) % ring.length]
      const de = b[0] - a[0], dn = b[1] - a[1], l = Math.hypot(de, dn)
      if (l < 0.05) continue
      const nx = dn / l, nz = de / l
      const A0 = P(a[0], a[1], y0), B0 = P(b[0], b[1], y0), B1 = P(b[0], b[1], y1), A1 = P(a[0], a[1], y1)
      acc.tri(A0, B0, B1, nx, 0, nz); acc.tri(A0, B1, A1, nx, 0, nz)
    }
  }
  function ribbon(acc, pts, hw, y){
    pts = dedupe(pts); const n = pts.length
    if (n < 2) return
    const Lf = [], Rt = []
    for (let i = 0; i < n; i++) {
      const c = pts[i]
      let d1 = null, d2 = null
      if (i > 0) { const q = pts[i - 1], l = Math.hypot(c[0] - q[0], c[1] - q[1]); d1 = [(c[0] - q[0]) / l, (c[1] - q[1]) / l] }
      if (i < n - 1) { const q = pts[i + 1], l = Math.hypot(q[0] - c[0], q[1] - c[1]); d2 = [(q[0] - c[0]) / l, (q[1] - c[1]) / l] }
      let d = d1 && d2 ? [d1[0] + d2[0], d1[1] + d2[1]] : (d1 || d2)
      let l = Math.hypot(d[0], d[1]); if (l < 1e-6) { d = d1; l = 1 }
      d = [d[0] / l, d[1] / l]
      const m = d1 && d2 ? 1 / Math.max(d1[0] * d[0] + d1[1] * d[1], 0.5) : 1
      const nx = -d[1] * hw * m, ny = d[0] * hw * m
      Lf.push([c[0] + nx, c[1] + ny]); Rt.push([c[0] - nx, c[1] - ny])
    }
    for (let i = 0; i < n - 1; i++) {
      acc.tri(P(Rt[i][0], Rt[i][1], y), P(Rt[i + 1][0], Rt[i + 1][1], y), P(Lf[i + 1][0], Lf[i + 1][1], y), 0, 1, 0)
      acc.tri(P(Rt[i][0], Rt[i][1], y), P(Lf[i + 1][0], Lf[i + 1][1], y), P(Lf[i][0], Lf[i][1], y), 0, 1, 0)
    }
  }
  function dashes(acc, pts, off, y){
    pts = dedupe(pts); let s = 6
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / l, uy = (b[1] - a[1]) / l
      while (s < l) {
        const cx = a[0] + ux * s - uy * off, cy = a[1] + uy * s + ux * off
        if (Math.hypot(cx, cy) < 760) ribbon(acc, [[cx - ux * 2.6, cy - uy * 2.6], [cx + ux * 2.6, cy + uy * 2.6]], 0.3, y)
        s += 15
      }
      s -= l
    }
  }

  const flats = { plate: new Acc(), green: new Acc(), water: new Acc(), kerb: new Acc(), road: new Acc(), motor: new Acc(), path: new Acc(), dash: new Acc() }
  data.l.forEach(f => flatPoly(flats.plate, ringOf(f), 0.06))
  data.g.forEach(f => flatPoly(flats.green, ringOf(f), 0.12))
  data.w.forEach(f => flatPoly(flats.water, ringOf(f), 0.18))
  data.d.forEach(f => ribbon(flats.water, ringOf(f), 1.3, 0.18))
  data.r.forEach(([c, f]) => {
    const pts = ringOf(f), hw = ROAD_W[c] / 2
    if (c === 1 || c === 2) ribbon(flats.kerb, pts, hw + 1.7, 0.24)
    ribbon(c === 0 ? flats.motor : c === 4 ? flats.path : flats.road, pts, hw, c === 0 ? 0.36 : 0.3)
    if (c === 0) { dashes(flats.dash, pts, -1.85, 0.44); dashes(flats.dash, pts, 1.85, 0.44) }
    if (c === 1) dashes(flats.dash, pts, 0, 0.4)
  })
  Object.keys(flats).forEach(k => { const m = flats[k].mesh(THREE, M[k]); m.receiveShadow = true; scene.add(m) })

  /* ---- the buildings: one merged clay mesh, and IAQ's on its own in red ---- */
  const clay = new Acc(), red = new Acc()
  let hqC = [0, 0], hqH = 11
  data.b.forEach(([h, f], idx) => {
    const ring = ringOf(f), isHq = idx === data.hq, acc = isHq ? red : clay
    prism(acc, ring, 0, h)
    const a = Math.abs(areaOf(ring))
    let cx = 0, cy = 0; ring.forEach(v => { cx += v[0]; cy += v[1] }); cx /= ring.length; cy /= ring.length
    if (isHq) { hqC = [cx, cy]; hqH = h }
    if (a < 700) return
    /* roof deck: the footprint drawn in about a metre and a half, where the shape allows it */
    const s = 1 - 3 / Math.sqrt(a)
    const inset = ring.map(v => [cx + (v[0] - cx) * s, cy + (v[1] - cy) * s])
    const ok = inset.every((v, i) => { const w = inset[(i + 1) % inset.length]; return inside(v, ring) && inside([(v[0] + w[0]) / 2, (v[1] + w[1]) / 2], ring) })
    if (!ok) return
    prism(acc, inset, h, h + 0.7)
    if (a < 1100) return
    /* rooftop plant, squared to the longest wall */
    const rnd = mulberry(idx * 7919 + 13)
    let best = 0, ang = 0
    ring.forEach((v, i) => { const w = ring[(i + 1) % ring.length], l = Math.hypot(w[0] - v[0], w[1] - v[1]); if (l > best) { best = l; ang = Math.atan2(w[1] - v[1], w[0] - v[0]) } })
    const ca = Math.cos(ang), sa = Math.sin(ang)
    const xs = ring.map(v => v[0]), ys = ring.map(v => v[1])
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys)
    const core = ring.map(v => [cx + (v[0] - cx) * 0.74, cy + (v[1] - cy) * 0.74])
    let want = Math.min(7, 1 + Math.floor(a / 1600)), tries = 0
    while (want > 0 && tries++ < 60) {
      const p = [x0 + rnd() * (x1 - x0), y0 + rnd() * (y1 - y0)]
      if (!inside(p, core)) continue
      const bw = 1.6 + rnd() * 2.6, bd = 1.2 + rnd() * 1.8, bh = 1.3 + rnd() * 1.5
      const box = [[-bw, -bd], [bw, -bd], [bw, bd], [-bw, bd]].map(q => [p[0] + q[0] * ca - q[1] * sa, p[1] + q[0] * sa + q[1] * ca])
      prism(acc, box, h + 0.7, h + 0.7 + bh); want--
    }
  })
  const clayMesh = clay.mesh(THREE, M.clay); clayMesh.castShadow = true; clayMesh.receiveShadow = true; scene.add(clayMesh)
  const hqMesh = red.mesh(THREE, M.hq); hqMesh.castShadow = true; hqMesh.receiveShadow = true; scene.add(hqMesh)

  /* ---- trees on the verges and in the parks ---- */
  const dummy = new THREE.Object3D()
  const canopy = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.5, 1), M.tree, data.t.length)
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.26, 0.34, 2.6, 5), M.trunk, data.t.length)
  data.t.forEach(([e, n, s], i) => {
    dummy.position.set(e, 2.6 * s + 2.1 * s, -n); dummy.scale.set(s, s * 1.12, s); dummy.rotation.set(0, i * 1.7, 0); dummy.updateMatrix(); canopy.setMatrixAt(i, dummy.matrix)
    dummy.position.set(e, 1.3 * s, -n); dummy.scale.set(s, s, s); dummy.updateMatrix(); trunks.setMatrixAt(i, dummy.matrix)
  })
  canopy.castShadow = true; canopy.receiveShadow = true; trunks.castShadow = true
  scene.add(canopy); scene.add(trunks)

  /* ---- the red plot: a pool of red light under the building, and a pin above the roof ---- */
  const glowCv = document.createElement('canvas'); glowCv.width = glowCv.height = 256
  const gx = glowCv.getContext('2d'), grad = gx.createRadialGradient(128, 128, 0, 128, 128, 128)
  grad.addColorStop(0, 'rgba(236,32,39,.34)'); grad.addColorStop(0.45, 'rgba(236,32,39,.14)'); grad.addColorStop(1, 'rgba(236,32,39,0)')
  gx.fillStyle = grad; gx.fillRect(0, 0, 256, 256)
  const glowTex = new THREE.CanvasTexture(glowCv); glowTex.colorSpace = THREE.SRGBColorSpace
  const pool = new THREE.Mesh(new THREE.CircleGeometry(74, 48), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, fog: false }))
  pool.rotation.x = -Math.PI / 2; pool.position.set(hqC[0], 0.5, -hqC[1]); scene.add(pool)
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0xEC2027, transparent: true, opacity: 0.4, depthWrite: false, fog: false })
  const pulse = new THREE.Mesh(new THREE.RingGeometry(30, 31.4, 64), pulseMat)
  pulse.rotation.x = -Math.PI / 2; pulse.position.set(hqC[0], 0.56, -hqC[1]); pulse.visible = false; scene.add(pulse)   /* 25 Sep (Bazil: "no need the weird ring"): the red ring is off; the soft pool and the pin mark the HQ */
  const pin = new THREE.Group()
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 13, 8), M.hq); stem.position.y = 6.5
  const head = new THREE.Mesh(new THREE.SphereGeometry(2.3, 24, 18), M.hq); head.position.y = 14.4
  pin.add(stem); pin.add(head); pin.position.set(hqC[0], hqH + 0.7, -hqC[1]); scene.add(pin)

  /* ---- traffic on the motorway and the two through roads ---- */
  const paths = []
  data.r.forEach(([c, f]) => {
    if (c > 1) return
    let run = []
    const flush = () => { if (run.length > 1) { let len = 0; const cum = [0]; for (let i = 1; i < run.length; i++) { len += Math.hypot(run[i][0] - run[i - 1][0], run[i][1] - run[i - 1][1]); cum.push(len) } if (len > 160) paths.push({ c, pts: run, cum, len }) } run = [] }
    dedupe(ringOf(f)).forEach(v => { if (Math.hypot(v[0], v[1]) < 1000) run.push(v); else flush() })
    flush()
  })
  const rndC = mulberry(922), CARS = reduce || !paths.length ? 0 : (small ? 12 : 24)
  const carMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(4.4, 1.35, 1.9), M.car, Math.max(CARS, 1)); carMesh.count = CARS; scene.add(carMesh)
  const cars = []
  for (let i = 0; i < CARS; i++) {
    const motor = paths.filter(p => p.c === 0), pool2 = i % 3 === 2 || !motor.length ? paths : motor
    const p = pool2[Math.floor(rndC() * pool2.length)]
    const dir = p.c === 0 ? 1 : (rndC() < 0.5 ? 1 : -1)
    cars.push({ p, s: rndC() * p.len, dir, v: (p.c === 0 ? 12 + rndC() * 5 : 6 + rndC() * 3), off: p.c === 0 ? [-3.6, 0, 3.6][Math.floor(rndC() * 3)] : 2.2 * dir })
  }
  function moveCars(dt){
    for (let i = 0; i < cars.length; i++) {
      const c = cars[i]; c.s += c.v * dt * c.dir
      if (c.s > c.p.len) c.s -= c.p.len; if (c.s < 0) c.s += c.p.len
      const cum = c.p.cum; let k = 1; while (k < cum.length - 1 && cum[k] < c.s) k++
      const a = c.p.pts[k - 1], b = c.p.pts[k], l = cum[k] - cum[k - 1] || 1, t = (c.s - cum[k - 1]) / l
      const ux = (b[0] - a[0]) / l, uy = (b[1] - a[1]) / l
      const e = a[0] + (b[0] - a[0]) * t - uy * c.off, n = a[1] + (b[1] - a[1]) * t + ux * c.off
      dummy.position.set(e, 1.1, -n); dummy.scale.set(1, 1, 1); dummy.rotation.set(0, Math.atan2(uy, ux), 0); dummy.updateMatrix(); carMesh.setMatrixAt(i, dummy.matrix)
    }
    carMesh.instanceMatrix.needsUpdate = true
  }

  /* ---- labels: the building, and the three roads a driver would look for ---- */
  const layer = document.createElement('div'); layer.className = 'hqm-labels'; host.appendChild(layer)
  const labels = []
  function label(cls, html, e, n, y, maxDist){
    const el = document.createElement('div'); el.className = 'hqm-l ' + cls; el.innerHTML = html; layer.appendChild(el)
    labels.push({ el, v: new THREE.Vector3(e, y, -n), maxDist, cls })
  }
  label('hqm-l-hq', '<b>IAQ Group</b><span>Headquarters &middot; No. 12</span>', hqC[0], hqC[1], hqH + 19, 1e9)
  ;(data.labels || []).forEach(([name, ref, e, n, maxDist]) => label('hqm-l-st' + (ref ? ' hqm-l-mw' : ''), name + (ref ? ' <i>' + ref + '</i>' : ''), e, n, 1, maxDist))
  const compass = host.parentElement && host.parentElement.querySelector('.hqm-n')

  /* ---- the camera rig: a bearing, a height and a distance round the front door ---- */
  const FAR = { dist: 1500, az: 0.30, el: 1.06 }, NEAR = { dist: small ? 430 : 350, az: 0.80, el: 0.64 }
  const MIN = 150, MAX = 1500
  const cam = { dist: FAR.dist, az: FAR.az, el: FAR.el }, want = { dist: FAR.dist, az: FAR.az, elUser: 0 }
  const elFor = d => 0.56 + (1.06 - 0.56) * Math.pow((d - MIN) / (MAX - MIN), 0.7)
  let intro = reduce ? null : { t: 0, dur: 3.6, on: false }, idleAt = 0
  if (reduce) { cam.dist = want.dist = NEAR.dist; cam.az = want.az = NEAR.az; cam.el = elFor(NEAR.dist) }
  const target = new THREE.Vector3(hqC[0], 5, -hqC[1])
  function place(){
    const ce = Math.cos(cam.el)
    camera.position.set(target.x + Math.sin(cam.az) * cam.dist * ce, target.y + Math.sin(cam.el) * cam.dist, target.z + Math.cos(cam.az) * cam.dist * ce)
    camera.lookAt(target)
    scene.fog.near = cam.dist * 0.9 + 260; scene.fog.far = cam.dist * 0.9 + 1750
  }
  function frameView(){
    /* on a wide band the address sits over the left third, so the door is framed right of centre */
    camera.aspect = W / H
    if (W >= 900) camera.setViewOffset(W, H, -W * 0.15, 0, W, H); else camera.clearViewOffset()
    camera.updateProjectionMatrix()
  }
  frameView()

  const v3 = new THREE.Vector3()
  function placeLabels(){
    for (const l of labels) {
      v3.copy(l.v); if (l.cls === 'hqm-l-hq') v3.y += pin.position.y - (hqH + 0.7)
      v3.project(camera)
      const x = (v3.x * 0.5 + 0.5) * W, y = (-v3.y * 0.5 + 0.5) * H
      const on = v3.z < 1 && x > 40 && x < W - 40 && y > 24 && y < H - 16 && cam.dist < l.maxDist
      l.el.style.opacity = on ? 1 : 0
      l.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)'
    }
    if (compass) compass.style.transform = 'rotate(' + (cam.az * 180 / Math.PI).toFixed(1) + 'deg)'
  }

  /* ---- input: drag to turn, pinch or ctrl + wheel or the buttons to zoom ---- */
  const touch = t => { idleAt = performance.now() + 6000; if (intro) { intro = null; want.dist = cam.dist; want.az = cam.az } return t }
  const ptrs = new Map(); let pinch0 = 0, dist0 = 0
  function down(e){ ptrs.set(e.pointerId, [e.clientX, e.clientY]); if (ptrs.size === 2) { const p = [...ptrs.values()]; pinch0 = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]); dist0 = want.dist } touch(); host.classList.add('is-drag') }
  function move(e){
    const q = ptrs.get(e.pointerId); if (!q) return
    if (ptrs.size === 1) {
      want.az -= (e.clientX - q[0]) * 0.0042
      if (e.pointerType === 'mouse') want.elUser = Math.max(-0.22, Math.min(0.4, want.elUser + (e.clientY - q[1]) * 0.003))
    }
    q[0] = e.clientX; q[1] = e.clientY
    if (ptrs.size === 2 && pinch0 > 0) { const p = [...ptrs.values()]; want.dist = Math.max(MIN, Math.min(MAX, dist0 * pinch0 / Math.max(20, Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1])))) }
    touch()
  }
  function up(e){ ptrs.delete(e.pointerId); pinch0 = 0; if (!ptrs.size) host.classList.remove('is-drag') }
  function wheel(e){ if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault(); want.dist = Math.max(MIN, Math.min(MAX, want.dist * Math.exp(e.deltaY * 0.01))); touch() }
  host.addEventListener('pointerdown', down)
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
  window.addEventListener('pointercancel', up)
  host.addEventListener('wheel', wheel, { passive: false })
  const btns = host.parentElement ? [...host.parentElement.querySelectorAll('[data-hqm]')] : []
  function onBtn(e){
    const k = e.currentTarget.getAttribute('data-hqm'); touch()
    if (k === 'in') want.dist = Math.max(MIN, want.dist * 0.62)
    if (k === 'out') want.dist = Math.min(MAX, want.dist / 0.62)
    if (k === 'reset') { want.dist = NEAR.dist; want.elUser = 0; want.az = NEAR.az + Math.round((cam.az - NEAR.az) / (Math.PI * 2)) * Math.PI * 2 }
  }
  btns.forEach(b => b.addEventListener('click', onBtn))

  /* ---- the loop: runs only while the band is on screen ---- */
  let visible = false, running = false, raf = 0, t0 = performance.now(), seen = false
  const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  function frame(now){
    if (dead || !visible) { running = false; return }
    const dt = Math.min((now - t0) / 1000, 0.05); t0 = now
    if (intro && intro.on) {
      intro.t = Math.min(1, intro.t + dt / intro.dur); const k = ease(intro.t)
      cam.dist = FAR.dist + (NEAR.dist - FAR.dist) * k; cam.az = FAR.az + (NEAR.az - FAR.az) * k; cam.el = FAR.el + (elFor(NEAR.dist) - FAR.el) * k
      if (intro.t >= 1) { intro = null; want.dist = cam.dist; want.az = cam.az; idleAt = now + 1500 }
    } else if (!intro) {
      if (!reduce && !ptrs.size && now > idleAt) want.az += 0.018 * dt        /* a degree a second, left alone */
      cam.dist += (want.dist - cam.dist) * 0.09; cam.az += (want.az - cam.az) * 0.12
      cam.el += (Math.max(0.42, Math.min(1.2, elFor(cam.dist) + want.elUser)) - cam.el) * 0.1
    }
    if (!reduce) {
      const tt = now * 0.001, k = (tt * 0.42) % 1
      pulse.scale.setScalar(1 + k * 1.9); pulseMat.opacity = 0.42 * (1 - k)
      pin.position.y = hqH + 0.7 + Math.sin(tt * 1.5) * 0.9
      moveCars(dt)
    }
    place(); renderer.render(scene, camera); placeLabels()
    if (++frames === 2) host.classList.add('is-live')
    raf = requestAnimationFrame(frame)
  }
  function start(){ if (running || dead) return; running = true; t0 = performance.now(); raf = requestAnimationFrame(frame) }
  function stop(){ running = false; if (raf) cancelAnimationFrame(raf) }
  const io = new IntersectionObserver(ents => ents.forEach(en => {
    visible = en.isIntersecting
    if (visible && !seen && en.intersectionRatio >= 0.3) { seen = true; if (intro) intro.on = true }
    if (visible) start(); else stop()
  }), { threshold: [0.02, 0.3, 0.6] })
  io.observe(host)

  /* nothing that casts a shadow ever moves (the cars are too small to need one), so the shadow map
     is baked once and frozen */
  place(); renderer.shadowMap.needsUpdate = true; renderer.render(scene, camera); renderer.shadowMap.autoUpdate = false
  moveCars(0); placeLabels()

  function onResize(){
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return
    W = w; H = h; renderer.setSize(W, H, false); frameView()
    if (!running) { place(); renderer.render(scene, camera); placeLabels() }
  }
  window.addEventListener('resize', onResize)
  let rzo = null; if (window.ResizeObserver) { rzo = new ResizeObserver(onResize); rzo.observe(host) }
  function onLost(e){ e.preventDefault(); dead = true; stop(); host.classList.remove('is-live'); host.classList.add('no-webgl') }
  renderer.domElement.addEventListener('webglcontextlost', onLost)

  window.__hqmapQA = () => ({ frames, running, visible, intro: intro ? intro.t : 'done', dist: Math.round(cam.dist), az: +cam.az.toFixed(3), el: +cam.el.toFixed(3),
    buildings: data.b.length, tris: Math.round((clay.p.length + red.p.length) / 9), trees: data.t.length, cars: cars.length,
    labels: labels.map(l => ({ t: l.el.textContent, o: l.el.style.opacity, tr: l.el.style.transform })) })
  window.__hqmapSkip = () => { intro = null; cam.dist = want.dist = NEAR.dist; cam.az = want.az = NEAR.az; cam.el = elFor(NEAR.dist); place(); renderer.render(scene, camera); placeLabels() }

  return function cleanup(){
    dead = true; stop(); io.disconnect(); if (rzo) rzo.disconnect()
    host.removeEventListener('pointerdown', down); host.removeEventListener('wheel', wheel)
    window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up)
    window.removeEventListener('resize', onResize)
    btns.forEach(b => b.removeEventListener('click', onBtn))
    renderer.domElement.removeEventListener('webglcontextlost', onLost)
    scene.traverse(o => { if (o.geometry) o.geometry.dispose() })
    Object.values(M).forEach(m => m.dispose()); glowTex.dispose()
    renderer.dispose(); try { renderer.forceContextLoss() } catch (_) { /* already gone */ }
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
    if (layer.parentNode) layer.parentNode.removeChild(layer)
    host.classList.remove('is-live', 'is-drag')
    delete window.__hqmapQA; delete window.__hqmapSkip
  }
}

export default function initContact(){
  let cleanup = null, gone = false
  const host = document.getElementById('hqmap')
  if (host) {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    fetch(DATA_URL).then(r => { if (!r.ok) throw new Error('district ' + r.status); return r.json() }).then(data => {
      if (gone) return
      try { cleanup = build(THREE_MOD, host, data, reduce) } catch (e) { host.classList.add('no-webgl') }
    }).catch(() => host.classList.add('no-webgl'))
  }
  return function(){ gone = true; if (cleanup) cleanup() }
}
