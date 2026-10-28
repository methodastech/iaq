import React, { useEffect, useRef, useState } from 'react'

/* ============================================================================
   The exhibition print in 3D (30 Sep 2026, Bazil: "make a 3D experience trifold design as well"): the chosen trifold as a
   real folded sheet, or the A5 leaflet as a card, on a light table. Same approach and lighting as BoothModel.jsx (three.js,
   RoomEnvironment, neutral tone mapping, a soft key light with shadow), rendered on demand.
     Trifold  three panels hinged as an A4 roll fold (outside: the flap 97, the back 100, the cover 100; inside: left 100,
              centre 100, right 97), each a thin box textured on both faces from the exported pieces (public/booth/pv, 2048
              max). Closed, Opening and Open flat fold and unfold the panels on their hinges: closing, the flap folds in
              first and the cover over it; opening, the cover first. Rotation only, eased; never a scale or a zoom.
     Leaflet  one card, Front and Back turn it on its vertical axis.
   Drag turns the piece (no zoom, no pan). Design 1, 2 and 3 swap the textures. Reduced motion: the open state, still.
   window.__printViewer exposes { state, go(k), fps(ms) } for the headless checks.
   ============================================================================ */

const DESIGNS = [1, 2, 3]
const TRI_STATES = { closed: [Math.PI - 0.004, -Math.PI + 0.004], opening: [0.3 * Math.PI, -0.62 * Math.PI], open: [0, 0] }
const S = 0.001                     /* scene units per mm */
const T = 0.7 * S                   /* the paper, drawn a little thicker than 250 gsm so its edge reads */

export default function PrintViewer({ kind = 'trifold' }) {
  const host = useRef(null), api = useRef(null)
  const [design, setDesign] = useState(1)
  const [state, setState] = useState(kind === 'trifold' ? 'closed' : 'front')
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let dead = false, cleanup = null
    ;(async () => {
      const THREE = await import('three')
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js')
      if (dead || !host.current) return
      cleanup = build(THREE, OrbitControls, RoomEnvironment, host.current, kind, api, () => setReady(true))
    })()
    return () => { dead = true; if (cleanup) cleanup() }
  }, [kind])
  useEffect(() => { if (api.current) api.current.design(design) }, [design, ready])
  const go = k => { setState(k); if (api.current) api.current.go(k) }
  const states = kind === 'trifold' ? [['closed', 'Closed'], ['opening', 'Opening'], ['open', 'Open flat']] : [['front', 'Front'], ['back', 'Back']]
  return (
    <div className="pv">
      <div className="pv-stage" ref={host} />
      {!ready && <div className="pv-wait">Folding the {kind} in 3D</div>}
      <div className="pv-bar">
        <span className="pv-seg" role="group" aria-label="Design">
          {DESIGNS.map(d => <button type="button" key={d} className={d === design ? 'on' : undefined} aria-pressed={d === design} onClick={() => setDesign(d)}>Design {d}</button>)}
        </span>
        <span className="pv-seg" role="group" aria-label={kind === 'trifold' ? 'Fold' : 'Side'}>
          {states.map(([k, l]) => <button type="button" key={k} className={k === state ? 'on' : undefined} aria-pressed={k === state} onClick={() => go(k)}>{l}</button>)}
        </span>
      </div>
      <p className="pv-hint">Drag to turn it</p>
    </div>
  )
}

const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function build(THREE, OrbitControls, RoomEnvironment, el, kind, api, onReady) {
  const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let W = el.clientWidth, H = el.clientHeight
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(W, H)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 0.9
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#EEF1F5')
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  /* 30 Sep (Bazil: "too dark at the back and not realistic enough"): a soft studio all round (the room environment
     stronger, a warm ground bounce) so the back of a sheet is as bright as its front when turned; the key light rides
     with the camera, like a photographer's light, so the face you look at is always lit and the shadow falls behind */
  scene.environmentIntensity = 0.5
  scene.add(new THREE.HemisphereLight('#ffffff', '#e4e1da', 0.3))
  const key = new THREE.DirectionalLight("#ffffff", 0.85)
  key.position.set(0.35, 0.9, 0.7); key.castShadow = true
  key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 6
  Object.assign(key.shadow.camera, { left: -0.5, right: 0.5, top: 0.5, bottom: -0.5, near: 0.1, far: 3 })
  key.shadow.bias = -0.0005
  scene.add(key); scene.add(key.target)

  const camera = new THREE.PerspectiveCamera(30, W / H, 0.01, 10)
  /* the key light keeps its place relative to the camera: up and to the right of the viewer */
  const followKey = () => {
    const off = new THREE.Vector3(0.28, 0.62, 0.55).applyQuaternion(camera.quaternion)
    key.position.copy(camera.position).add(off); key.position.y = Math.max(key.position.y, 0.45)
  }
  /* the camera fits the piece to the frame: the open sheet (or the card) and its height, whatever the pane's shape */
  const fit = () => {
    const t = Math.tan((camera.fov * Math.PI) / 360), needW = kind === 'trifold' ? 0.33 : 0.19, needH = 0.255
    const d = Math.max(needH / (2 * t), needW / (2 * t * camera.aspect))
    const dir = camera.position.clone().sub(controls ? controls.target : new THREE.Vector3()).normalize()
    camera.position.copy(dir.multiplyScalar(d))
  }
  camera.position.set(0.05, 0.08, 0.6)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 0, 0)
  controls.enableZoom = false; controls.enablePan = false
  controls.enableDamping = true; controls.dampingFactor = 0.08
  controls.minPolarAngle = Math.PI * 0.2; controls.maxPolarAngle = Math.PI * 0.52
  fit(); controls.update()

  /* the light table, just under the sheet's foot */
  const table = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshStandardMaterial({ color: '#F4F6F9', roughness: 0.9 }))
  table.rotation.x = -Math.PI / 2; table.position.y = -0.105 - 0.0005; table.receiveShadow = true
  scene.add(table)

  const loader = new THREE.TextureLoader()
  /* uncoated paper: fully matt, a faint fibre sheen at grazing angles, a warm white edge */
  const paper = new THREE.MeshPhysicalMaterial({ color: '#F4F2EC', roughness: 0.95, sheen: 0.35, sheenRoughness: 0.85, sheenColor: new THREE.Color('#ffffff') })
  const face = () => new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.9, metalness: 0, sheen: 0.25, sheenRoughness: 0.9, sheenColor: new THREE.Color('#ffffff') })
  /* a panel: a thin box, the inside (+z) and the outside (-z) each showing a region of their sheet */
  const panel = (w) => {
    const inside = face(), outside = face()
    const m = new THREE.Mesh(new THREE.BoxGeometry(w * S, 210 * S, T), [paper, paper, paper, paper, inside, outside])
    m.castShadow = true; m.receiveShadow = true
    return { m, inside, outside }
  }
  /* a texture region of a sheet W mm wide: [x0, x1] mm */
  const region = (base, x0, x1, Wmm) => { const t = base.clone(); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.repeat.set((x1 - x0) / Wmm, 1); t.offset.set(x0 / Wmm, 0); t.needsUpdate = true; return t }
  const load = src => new Promise(res => loader.load(src, t => res(t), undefined, () => res(null)))

  const root = new THREE.Group()
  scene.add(root)
  let panels = {}, angles = { cover: 0, flap: 0 }, spin = 0
  if (kind === 'trifold') {
    /* flat: the inside faces +z; the centre (the back) at the middle; the cover hinged on its left edge, the flap on its right */
    const centre = panel(100), cover = panel(100), flap = panel(97)
    root.add(centre.m)
    const hC = new THREE.Group(); hC.position.set(-50 * S, 0, 2 * T); root.add(hC)
    cover.m.position.x = -50 * S; hC.add(cover.m)
    const hF = new THREE.Group(); hF.position.set(50 * S, 0, T); root.add(hF)
    flap.m.position.x = 48.5 * S; hF.add(flap.m)
    panels = { centre, cover, flap, hC, hF }
    root.position.y = 0
  } else {
    const card = new THREE.Mesh(new THREE.BoxGeometry(148 * S, 210 * S, T), [paper, paper, paper, paper, face(), face()])
    card.castShadow = true; card.receiveShadow = true
    const hub = new THREE.Group(); hub.add(card); root.add(hub)
    panels = { card, hub }
  }
  const apply = () => {
    if (kind === 'trifold') { panels.hC.rotation.y = angles.cover; panels.hF.rotation.y = angles.flap }
    else panels.hub.rotation.y = spin
  }

  let tex = {}
  const design = async d => {
    if (kind === 'trifold') {
      const [o, i] = await Promise.all([load(`/booth/pv/tri-${d}o.jpg`), load(`/booth/pv/tri-${d}i.jpg`)])
      if (!o || !i) return
      Object.values(tex).forEach(t => t.dispose())
      tex = {
        cO: region(o, 197, 297, 297), bO: region(o, 97, 197, 297), fO: region(o, 0, 97, 297),
        cI: region(i, 0, 100, 297), bI: region(i, 100, 200, 297), fI: region(i, 200, 297, 297),
      }
      const set = (p, a, b) => { p.inside.map = tex[a]; p.outside.map = tex[b]; p.inside.needsUpdate = p.outside.needsUpdate = true }
      set(panels.cover, 'cI', 'cO'); set(panels.centre, 'bI', 'bO'); set(panels.flap, 'fI', 'fO')
    } else {
      const [f, b] = await Promise.all([load(`/booth/pv/a5-${d}f.jpg`), load(`/booth/pv/a5-${d}b.jpg`)])
      if (!f || !b) return
      Object.values(tex).forEach(t => t.dispose())
      tex = { f: region(f, 0, 148, 148), b: region(b, 0, 148, 148) }
      const mats = panels.card.material
      mats[4].map = tex.f; mats[5].map = tex.b; mats[4].needsUpdate = mats[5].needsUpdate = true
    }
    render()
  }

  /* the fold, eased, rotation only; closing folds the flap first, opening moves the cover first */
  let anim = null, state = kind === 'trifold' ? 'closed' : 'front'
  const target = k => (kind === 'trifold' ? { cover: TRI_STATES[k][0], flap: TRI_STATES[k][1] } : { spin: k === 'back' ? Math.PI : 0 })
  const go = k => {
    const to = target(k)
    if (reduce) { if (kind === 'trifold') angles = { cover: to.cover, flap: to.flap }; else spin = to.spin; apply(); render(); state = k; return }
    const opening = kind === 'trifold' && to.cover < angles.cover
    anim = { t0: performance.now(), from: { ...angles, spin }, to, dur: 1100, lagCover: kind === 'trifold' && !opening ? 380 : 0, lagFlap: kind === 'trifold' && opening ? 380 : 0 }
    state = k
    kick()
  }
  const step = now => {
    if (!anim) return false
    const { t0, from, to, dur, lagCover, lagFlap } = anim
    const p = (lag) => Math.min(1, Math.max(0, (now - t0 - lag) / dur))
    if (kind === 'trifold') {
      const pc = ease(p(lagCover)), pf = ease(p(lagFlap))
      angles.cover = from.cover + (to.cover - from.cover) * pc
      angles.flap = from.flap + (to.flap - from.flap) * pf
      if (pc >= 1 && pf >= 1) anim = null
    } else {
      const ps = ease(p(0)); spin = from.spin + (to.spin - from.spin) * ps
      if (ps >= 1) anim = null
    }
    apply()
    return true
  }

  let raf = 0, frames = 0
  function render() { followKey(); renderer.render(scene, camera); frames++ }
  function loop(now) {
    raf = 0
    const moving = step(now)
    const damp = controls.update()
    render()
    if (moving || damp || anim) raf = requestAnimationFrame(loop)
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop) }
  controls.addEventListener('change', kick)

  if (kind === 'trifold') { const s0 = target(reduce ? 'open' : 'closed'); angles = { cover: s0.cover, flap: s0.flap }; if (reduce) state = 'open' }
  apply()
  design(1).then(() => { onReady(); render() })

  const onResize = () => { W = el.clientWidth; H = el.clientHeight; if (!W || !H) return; renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix(); fit(); controls.update(); render() }
  const ro = new ResizeObserver(onResize); ro.observe(el)

  api.current = {
    go, design,
    get state() { return state },
    angles: () => ({ ...angles, spin }),
    /* frames per second over ms, with the loop kept running */
    fps: ms => new Promise(res => { const f0 = frames, t0 = performance.now(); const keep = () => { render(); if (performance.now() - t0 < ms) requestAnimationFrame(keep); else res(Math.round((frames - f0) * 1000 / (performance.now() - t0))) }; requestAnimationFrame(keep) }),
  }
  if (typeof window !== 'undefined') window.__printViewer = Object.assign(window.__printViewer || {}, { [kind]: api.current })

  return () => {
    cancelAnimationFrame(raf); ro.disconnect(); controls.dispose()
    Object.values(tex).forEach(t => t.dispose())
    scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => m.dispose()) })
    pmrem.dispose(); renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss()
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
    if (typeof window !== 'undefined' && window.__printViewer) delete window.__printViewer[kind]
  }
}
