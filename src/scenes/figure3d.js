/* ============================================================================
   ONE RENDERER, MANY FIGURES.

   The page wants four small 3D objects, one per delivery model. A renderer
   each would be four GL contexts, and browsers start dropping the oldest at about sixteen — so
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
        const half = it.half
        it.cam.left = -half * Math.max(1, a); it.cam.right = half * Math.max(1, a)
        it.cam.top = half * Math.max(1, 1 / a); it.cam.bottom = -half * Math.max(1, 1 / a)
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

}
