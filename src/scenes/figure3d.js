/* ============================================================================
   ONE RENDERER, MANY FIGURES.

   The page now wants ten small 3D objects: six milestones on the white band and
   four delivery models on the black one. A WebGLRenderer per object would be
   ten GL contexts, and browsers start dropping the oldest at about sixteen — so
   the whole page would work until someone added a chart.

   Instead: one canvas fixed over the viewport, one context, one loop. Each
   frame clears the lot, then for every registered element sets the scissor and
   viewport to that element's screen rect and renders its little scene into it.
   Nothing is drawn outside those rects, so the canvas is transparent everywhere
   else and the page shows through.

   The canvas sits at z-index 2: above section backgrounds, and far below the
   header (80) and the search overlay (400), so a figure can never paint over
   the navigation as it scrolls past.

   THE CAMERA is orthographic at (1, 0.7071, 1) — the 2:1 dimetric of the mark
   system, elevation atan(0.7071/1.4142) = 26.565°. The flat SVG marks and these
   solids are then the same objects under the same camera, which is what lets
   one hand over to the other without reading as a swap.
   ========================================================================= */

let boot = null            /* the shared context, created once, lazily */
const items = new Set()

/* the mark system's nineteen tones, the ones these objects need */
const T = {
  GREY: 0xD2DAE7, GREY_DK: 0x8A93A6, PALE: 0xEFF3F9, SPEC: 0xE9EEF6,
  RED: 0xEC2027, RED_DK: 0xB5121B,
  WIRE_EDGE: 0xC8D1E1, WIRE_FACE: 0x2A3446,
  WIRE_HOT_EDGE: 0xFF6A66, WIRE_HOT_FACE: 0x7A0C13,
}

async function init () {
  if (boot) return boot
  boot = (async () => {
    let THREE
    try { THREE = await import('three') } catch { return null }

    const canvas = document.createElement('canvas')
    canvas.className = 'fig3d-canvas'
    canvas.setAttribute('aria-hidden', 'true')
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    } catch { return null }
    renderer.setClearAlpha(0)
    document.body.appendChild(canvas)

    let raf = 0
    const frame = now => {
      raf = requestAnimationFrame(frame)
      const w = window.innerWidth, h = window.innerHeight
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(w, h, false)

      /* clear the WHOLE canvas first: without this a figure leaves its previous
         rect painted behind it as the page scrolls */
      renderer.setScissorTest(false)
      renderer.clear()
      renderer.setScissorTest(true)

      for (const it of items) {
        const r = it.el.getBoundingClientRect()
        if (r.bottom < -40 || r.top > h + 40 || r.width < 2) continue
        const bottom = h - r.bottom
        renderer.setViewport(r.left, bottom, r.width, r.height)
        renderer.setScissor(r.left, bottom, r.width, r.height)
        const a = r.width / r.height
        if (it.fitX) {
          /* WIDTH-LED framing, for the count fields: the strip must always show the whole field
             end to end, so the horizontal half-extent is fixed and the vertical follows the
             aspect. Height-led framing would let a narrow column crop the field's tail off. */
          it.cam.left = -it.fitX; it.cam.right = it.fitX
          it.cam.top = it.fitX / a; it.cam.bottom = -it.fitX / a
        } else {
          const half = it.half
          it.cam.left = -half * Math.max(1, a); it.cam.right = half * Math.max(1, a)
          it.cam.top = half * Math.max(1, 1 / a); it.cam.bottom = -half * Math.max(1, 1 / a)
        }
        it.cam.updateProjectionMatrix()
        it.tick(now)
        renderer.render(it.scene, it.cam)
        if (!it.shown) { it.shown = true; it.el.classList.add('is-3d') }
      }
    }
    raf = requestAnimationFrame(frame)
    return { THREE, renderer, stop: () => cancelAnimationFrame(raf) }
  })()
  return boot
}

/* --------------------------------------------------------------- geometry */
function makeGeometry (THREE, p) {
  switch (p.g) {
    case 'sphere': return new THREE.SphereGeometry(...p.a)
    case 'cyl': return new THREE.CylinderGeometry(...p.a)
    case 'cone': return new THREE.ConeGeometry(...p.a)
    case 'torus': return new THREE.TorusGeometry(...p.a)
    default: return new THREE.BoxGeometry(...p.a)
  }
}

/* WIRE is the black band's language: glowing edges over a thin wash, so the
   object reads as a diagram of itself. SOLID is the white band's: matte faces
   under one key light, which is the mark system's own material — bead-blasted
   anodising, no mirror lobe, so nothing here gets a specular highlight. */
function dressWire (THREE, geo, hot, bin) {
  const g = new THREE.Group()
  const face = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
    color: hot ? T.WIRE_HOT_FACE : T.WIRE_FACE,
    transparent: true, opacity: hot ? .62 : .4, depthWrite: false, side: THREE.DoubleSide,
  }))
  const eg = new THREE.EdgesGeometry(geo, 24)
  const edge = new THREE.LineSegments(eg, new THREE.LineBasicMaterial({
    color: hot ? T.WIRE_HOT_EDGE : T.WIRE_EDGE, transparent: true, opacity: hot ? 1 : .92,
  }))
  g.add(face, edge)
  bin.push(eg, face.material, edge.material)
  return g
}

function dressSolid (THREE, geo, p, bin) {
  const color = p.hot ? T.RED : p.dim ? T.GREY_DK : p.pale ? T.PALE : T.GREY
  const mat = new THREE.MeshLambertMaterial({ color })
  const mesh = new THREE.Mesh(geo, mat)
  bin.push(mat)
  return mesh
}

/* ============================================================== count fields
   A DIFFERENT IDEA FROM THE FIGURES ABOVE. Those are pictures of a subject — a globe for
   countries, a plate for cleanroom. This one has no subject at all: each milestone is a FIELD OF
   UNITS, and the number of units IS the number. Three certifications is three bars. Seven
   industries is seven. Two hundred and fifty projects is a twenty-five by ten grid you can see the
   size of without counting it.

   So the eye compares magnitudes directly — three coarse bars against a fine mesh of a thousand —
   which no icon of a certificate or a floor plate can do. A slow wave travels the long axis, so
   the field reads as a live surface rather than a bar chart.

   The only value that is NOT literal is the last: a million square metres cannot be a million
   boxes, so that field is the densest the strip will carry and stands for area, not for a tally. */
export const FIELDS = {
  yrs: { cols: 8, rows: 4 },      /* 32 */
  ctr: { cols: 4, rows: 2 },      /* 8  */
  iso: { cols: 3, rows: 1 },      /* 3  */
  ind: { cols: 7, rows: 1 },      /* 7  */
  prj: { cols: 25, rows: 10 },    /* 250 */
  cln: { cols: 48, rows: 20 },    /* indicative: area, not a count */
}

export async function registerField (el, spec, opts = {}) {
  const ctx = await init()
  if (!ctx || !el || !spec) return () => {}
  const { THREE } = ctx
  const { cols, rows } = spec
  const n = cols * rows
  const bin = []

  const scene = new THREE.Scene()
  const group = new THREE.Group()
  scene.add(group)
  const key = new THREE.DirectionalLight(0xffffff, 2.2)
  key.position.set(-1.1, 1.6, 1.05)
  scene.add(key, new THREE.AmbientLight(0xD7E0EE, 1.15))

  /* THIRTY DEGREES, NOT FORTY-FIVE. Under this camera the direction that runs flat across the
     view is (1,0,-1), so a field laid along x climbs the frame diagonally and can only fill a
     third of a wide strip. A quarter turn fixes the width — and costs all the depth, because the
     rows then stack straight up the screen behind each other and the field reads as flat stripes.
     Thirty degrees keeps 97% of the width and gives the rows their horizontal shear back. */
  group.rotation.y = Math.PI / 6

  /* the footprint is FIXED and the cells divide it, so granularity carries the magnitude: the
     same strip holds three fat bars or a thousand fine ones, and they are instantly comparable */
  const W = 31, D = 3, GAP = .22
  const cw = W / cols, cd = D / rows
  const bw = cw * (1 - GAP), bd = cd * (1 - GAP)

  const geo = new THREE.BoxGeometry(1, 1, 1)
  const mat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF })
  const mesh = new THREE.InstancedMesh(geo, mat, n)
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  group.add(mesh)
  bin.push(geo, mat)

  /* the accent is the near edge of the field — one column, whatever the resolution */
  const grey = new THREE.Color(T.GREY)
  const red = new THREE.Color(T.RED)
  for (let i = 0; i < n; i++) mesh.setColorAt(i, (i % cols) === 0 ? red : grey)
  mesh.instanceColor.needsUpdate = true

  const dummy = new THREE.Object3D()
  const base = Math.min(.42, cd * 1.5), amp = base * .72

  const item = {
    el, scene, shown: false, fitX: opts.fitX ?? 16.6,
    cam: (() => {
      const d = 9
      const c = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 100)
      c.position.set(d, d * 0.7071, d)
      c.lookAt(0, 0, 0)
      return c
    })(),
    tick (now) {
      const t = now / 1000
      for (let i = 0; i < n; i++) {
        const c = i % cols, r = (i / cols) | 0
        const h = base + Math.sin(t * .9 + (c / cols) * 7.5 + (r / rows) * 2.2) * amp
        dummy.position.set(-W / 2 + c * cw + cw / 2, h / 2, -D / 2 + r * cd + cd / 2)
        dummy.scale.set(bw, h, bd)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
    },
  }
  items.add(item)
  return () => { items.delete(item); bin.forEach(o => o.dispose && o.dispose()); mesh.dispose() }
}

/* ------------------------------------------------------------- the public */
export async function registerFigure (el, parts, opts = {}) {
  const ctx = await init()
  if (!ctx || !el || !parts) return () => {}
  const { THREE } = ctx
  const tone = opts.tone || 'wire'
  const bin = []

  const scene = new THREE.Scene()
  const group = new THREE.Group()
  /* the parts hang off an INNER group so the whole composition can be re-centred on the outer
     group's origin once it is built — which is what lets a figure with a wide plinth and one with
     a tall block frame identically, and makes the swing happen about the object's own centre
     instead of orbiting the scene origin */
  const inner = new THREE.Group()
  group.add(inner)
  scene.add(group)

  if (tone === 'solid') {
    /* one key from the upper LEFT FRONT and a wide fill — the same lamp the flat
       marks are drawn under, so a solid and its mark are lit from one place */
    const key = new THREE.DirectionalLight(0xffffff, 2.1)
    key.position.set(-1.1, 1.5, 1.15)
    scene.add(key, new THREE.AmbientLight(0xD7E0EE, 1.2))
  }

  for (const p of parts) {
    const geo = makeGeometry(THREE, p)
    const unit = tone === 'wire' ? dressWire(THREE, geo, p.hot, bin) : dressSolid(THREE, geo, p, bin)
    unit.position.set(p.x || 0, p.y || 0, p.z || 0)
    unit.rotation.set(p.rx || 0, p.ry || 0, p.rz || 0)
    inner.add(unit)
    bin.push(geo)
  }

  const mid = new THREE.Box3().setFromObject(inner).getCenter(new THREE.Vector3())
  inner.position.set(-mid.x, -mid.y, -mid.z)

  const D = 9
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 100)
  cam.position.set(D, D * 0.7071, D)
  cam.lookAt(0, 0, 0)

  /* IT SWINGS, IT DOES NOT SPIN. These objects are not symmetric: three energy
     pillars in a row hide behind each other at 90°, and a deck goes edge-on and
     becomes a plank. The swing shows the depth from both sides and never
     reaches an angle where the object stops being itself. The white band swings
     HALF as far and half as fast as the black one — premium is the amount of
     motion you can only just tell is there. */
  const amp = opts.amp ?? .56
  const per = opts.period ?? 2600
  const item = {
    el, scene, cam, shown: false, half: opts.half ?? 2.5,
    tick (now) {
      group.rotation.y = Math.sin(now / per) * amp
      group.rotation.x = Math.sin(now / (per * 1.6)) * (amp * .09)
      group.position.y = Math.sin(now / 1600) * (opts.float ?? .07)
    },
  }
  items.add(item)

  return () => {
    items.delete(item)
    bin.forEach(o => o.dispose && o.dispose())
  }
}

/* The shared set-dressing for the milestone scenes. `floor` is where the object's base sits, so
   each scene puts its plinth directly under whatever it is carrying. The small masses are always
   in the same three places, which is what makes six different subjects read as one family. */
const stage = floor => [
  /* the plinth stays TIGHT around what it carries — a wide apron reads as an empty stage and
     leaves the object looking lost on it */
  { g: 'box', a: [3.9, .14, 3.9], y: floor - .07, pale: true },
  { g: 'box', a: [.32, .32, .32], x: -1.85, y: floor + 2.05, z: .7, pale: true },
  { g: 'box', a: [.24, .24, .24], x: 1.95, y: floor + .58, z: -1.15, pale: true },
  { g: 'box', a: [.2, .2, .2], x: 1.55, y: floor + 2.45, z: .85, hot: true },
]

/* ------------------------------------------------------------ the objects
   Every build is the SAME composition as the flat mark of the same name, so
   the two are one object and not two drawings of one idea. */
export const FIGURES = {
  /* ---- the four delivery models, for the black band ---- */
  epc: [
    { g: 'box', a: [3.4, .3, 3.4] },
    { g: 'box', a: [.42, 1.3, .42], x: -1.25, y: -.8, z: -1.25 },
    { g: 'box', a: [.42, 1.3, .42], x: -1.25, y: -.8, z: 1.25 },
    { g: 'box', a: [.42, 1.3, .42], x: 1.25, y: -.8, z: -1.25 },
    { g: 'box', a: [1, .55, 1], y: .42, hot: true },
  ],
  pcu: [
    { g: 'box', a: [3.7, .52, .9], y: -.5 },
    { g: 'box', a: [.44, 1.35, .44], x: -1.05, y: .42 },
    { g: 'box', a: [.44, .85, .44], x: .75, y: .18 },
    { g: 'torus', a: [.62, .1, 10, 26], x: -1.05, y: 1.15, rx: Math.PI / 2, hot: true },
  ],
  tol: [
    { g: 'box', a: [3.2, .26, 3.2], y: -.75 },
    { g: 'box', a: [1.55, 1.15, 1.55], y: -.045 },
    { g: 'box', a: [.3, .38, .95], x: -.92, y: -.12, hot: true },
  ],
  enr: [
    { g: 'box', a: [.78, 1.9, .78], x: -.95, z: .95, y: -.05 },
    { g: 'box', a: [.78, 1.25, .78], x: 0, z: 0, y: -.38 },
    { g: 'box', a: [.78, .75, .78], x: .95, z: -.95, y: -.63, hot: true },
  ],

  /* ---- the six milestones, for the white band ----
     Each is a STAGED SCENE and not a lone object: a pale plinth for the object to stand on, and
     two or three small masses held in the air around it. That is the whole difference between an
     icon and an illustration — an icon floats in nothing, a scene has a floor and a foreground,
     and it is the floor that makes the object look like it has weight. */
  yrs: [
    ...stage(-1.1),
    { g: 'box', a: [1.5, 2.2, 1.5] },
    { g: 'box', a: [1, .72, .12], z: .81, y: -.1, hot: true },
  ],
  /* 8 countries — the globe and its locator. The two rings are not decoration: a shaded ball is
     a ball, and it is the equator and one meridian that make it a WORLD. */
  ctr: [
    ...stage(-1.26),
    { g: 'sphere', a: [1.32, 30, 20] },
    { g: 'torus', a: [1.335, .022, 8, 54], rx: Math.PI / 2, dim: true },
    { g: 'torus', a: [1.335, .022, 8, 54], ry: Math.PI / 2, dim: true },
    { g: 'cone', a: [.3, .72, 18], x: .62, y: 1.42, z: .62, rx: Math.PI, hot: true },
    { g: 'sphere', a: [.29, 16, 12], x: .62, y: 1.92, z: .62, hot: true },
  ],
  /* 3 certifications — three sheets, the count in the outline, and the seal */
  iso: [
    ...stage(-.75),
    { g: 'box', a: [2.5, .26, 2.5], y: -.62 },
    { g: 'box', a: [1.95, .26, 1.95], y: -.3 },
    { g: 'box', a: [1.4, .26, 1.4], y: .02 },
    { g: 'cyl', a: [.4, .4, .17, 26], y: .24, hot: true },
  ],
  /* 7 industries — SEVEN separate wedges with a gap between them, not one disc with a slice cut
     out. The count has to be in the outline (Law 3), and a solid drum with one piece missing
     counts to one. The seventh lifts clear: the market you are standing in. */
  ind: (() => {
    const N = 7, step = Math.PI * 2 / N, gap = .05
    return [...stage(-.41), ...Array.from({ length: N }, (_, i) => ({
      g: 'cyl',
      a: [1.62, 1.62, .42, 14, 1, false, i * step + gap / 2, step - gap],
      /* lifted clear of the set, not launched out of it: enough daylight to read as separate */
      y: i === N - 1 ? .26 : -.2,
      hot: i === N - 1,
    }))]
  })(),
  /* 250 projects — the delivered plant, and the approval mark applied ACROSS ITS CORNER, the way
     the flat mark applies it. Long and low, with a roof lip: a square box with a tick on the front
     reads as a parcel, and a parcel is not a delivered facility. */
  prj: [
    ...stage(-.99),
    { g: 'box', a: [3, .82, 1.7], y: -.58 },
    { g: 'box', a: [3.2, .12, 1.9], y: -.11 },
    { g: 'box', a: [.28, .8, .28], x: .82, y: .12, z: 1.34, rz: Math.PI / 4, hot: true },
    { g: 'box', a: [.28, 1.55, .28], x: 1.34, y: .42, z: 1.34, rz: -Math.PI / 5, hot: true },
  ],
  /* 1,000,000 m² — the floor plate, and the dimension run that measures it */
  /* the plate rides clear of the plinth: at the same width and a hair above it, the two merge
     into one thick slab and the floor stops reading as a floor */
  cln: [
    ...stage(-.62),
    { g: 'box', a: [2.35, .2, 2.35], y: .1 },
    { g: 'box', a: [1.9, .1, .1], y: -.05, z: 1.4, hot: true },
    { g: 'box', a: [.1, .42, .1], x: -.95, y: -.05, z: 1.4, hot: true },
    { g: 'box', a: [.1, .42, .1], x: .95, y: -.05, z: 1.4, hot: true },
  ],
}
