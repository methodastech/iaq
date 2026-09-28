import React, { useEffect, useRef, useState } from 'react'

/* ============================================================================
   The IAQ corner of the SEMICON Europa stand, in 3D (22 Sep 2026), with the finished artwork on it.

   Built to berrylife's graphic specification v. 15.09, in metres: the back wall (2046 wide, 1736 visible)
   with the 55 inch screen at 1.5 m; the side wall, 310 mm thick, whose inner face carries wall 2 and whose
   end carries the aisle column; the counter, 600 x 1170 with its 170 mm corner and red side; a strip of
   Green Excel's wall to the left, left plain because it is theirs to design. No figures (Bazil, 22 Sep: "no need people").
   Textures are the print artwork itself (public/booth/tex, baked by tools/render-booth-art-0922.mjs
   --print), so what is seen here is what is sent to print. The screen cycles the six chapters of the loop.
   Drag to turn, scroll or pinch to zoom; the buttons jump to the three views that matter.
   ============================================================================ */

const VIEWS = [
  { k: 'From the aisle', pos: [-1.1, 1.7, 6.8], at: [0.9, 1.6, 1.1] },
  { k: 'At the counter', pos: [0.1, 1.62, 4.5], at: [1.05, 1.35, 1.3] },
  { k: 'The screen wall', pos: [0.87, 1.88, 2.5], at: [0.87, 1.88, 0] },
  { k: 'From above', pos: [-2.0, 6.6, 6.6], at: [0.7, 0.8, 1.2] },
]

export default function BoothModel({ option = 'w2' }) {
  const host = useRef(null)
  const api = useRef(null)
  const [ready, setReady] = useState(false)
  const [view, setView] = useState(0)

  useEffect(() => {
    let dead = false, cleanup = null
    ;(async () => {
      const THREE = await import('three')
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js')
      if (dead || !host.current) return
      cleanup = build(THREE, OrbitControls, RoomEnvironment, host.current, api, () => setReady(true))
    })()
    return () => { dead = true; if (cleanup) cleanup() }
  }, [])
  useEffect(() => { if (api.current) api.current.setOption(option) }, [option, ready])
  const go = i => { setView(i); if (api.current) api.current.goto(VIEWS[i]) }

  return (
    <div className="bm3">
      <div className="bm3-stage" ref={host} />
      {!ready && <div className="bm3-wait">Building the stand in 3D</div>}
      <div className="bm3-views" role="group" aria-label="Views">
        {VIEWS.map((v, i) => <button type="button" key={v.k} className={i === view ? 'on' : undefined} onClick={() => go(i)}>{v.k}</button>)}
      </div>
      <p className="bm3-hint">Drag to turn · scroll or pinch to zoom</p>
    </div>
  )
}

function build(THREE, OrbitControls, RoomEnvironment, el, api, onReady) {
  let W = el.clientWidth, H = el.clientHeight
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(W, H)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 0.92
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#1B1F27')
  scene.fog = new THREE.Fog('#1B1F27', 12, 30)
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.35

  const camera = new THREE.PerspectiveCamera(38, W / H, 0.05, 80)
  camera.position.set(...VIEWS[0].pos)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(...VIEWS[0].at)
  controls.enableDamping = true; controls.dampingFactor = 0.08
  controls.minDistance = 1.2; controls.maxDistance = 14
  controls.maxPolarAngle = Math.PI * 0.49
  controls.update()

  /* light: a hall with the stand's own arm lights */
  scene.add(new THREE.HemisphereLight('#ffffff', '#3a3f4a', 0.45))
  const key = new THREE.DirectionalLight('#ffffff', 1.25)
  key.position.set(4, 7, 6); key.castShadow = true
  key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -6; key.shadow.camera.right = 6; key.shadow.camera.top = 6; key.shadow.camera.bottom = -6
  key.shadow.bias = -0.0004
  scene.add(key)

  const loader = new THREE.TextureLoader()
  const tex = src => { const t = loader.load(src, () => render()); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t }
  const matte = (c = '#ffffff') => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0 })
  const art = t => new THREE.MeshStandardMaterial({ map: t, roughness: 0.78, metalness: 0 })

  /* the hall floor and the stand floor */
  const hall = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: '#4A4F58', roughness: 0.55, metalness: 0.05 }))
  hall.rotation.x = -Math.PI / 2; hall.receiveShadow = true; scene.add(hall)
  const floor = new THREE.Mesh(new THREE.BoxGeometry(6.1, 0.04, 3.2), new THREE.MeshStandardMaterial({ color: '#E6E8EC', roughness: 0.6 }))
  floor.position.set(-0.96, 0.02, 1.55); floor.receiveShadow = true; scene.add(floor)

  const T = 3.472, Y = T / 2 + 0.04
  /* Green Excel's stretch of the back wall, plain white: theirs to design */
  const ge = new THREE.Mesh(new THREE.BoxGeometry(3.968, T, 0.05), matte('#F2F3F5'))
  ge.position.set(-1.984, Y, -0.025); ge.receiveShadow = true; ge.castShadow = true; scene.add(ge)

  /* the back wall: wall 3 across its full 2046 mm, the last 310 mm inside the side wall */
  const w3 = new THREE.Mesh(new THREE.PlaneGeometry(2.046, T), art(tex('/booth/tex/w3.jpg')))
  w3.position.set(1.023, Y, 0.001); w3.receiveShadow = true; scene.add(w3)
  const back = new THREE.Mesh(new THREE.BoxGeometry(2.046, T, 0.05), matte())
  back.position.set(1.023, Y, -0.026); back.castShadow = true; scene.add(back)

  /* the side wall, 310 mm thick: wall 2 on its inner face, the aisle column on its end */
  const D = 2.852
  const side = new THREE.Mesh(new THREE.BoxGeometry(0.31, T, D), matte())
  side.position.set(1.736 + 0.155, Y, D / 2); side.castShadow = true; side.receiveShadow = true; scene.add(side)
  const w2Tex = { w2: tex('/booth/tex/w2.jpg'), w2b: tex('/booth/tex/w2b.jpg') }
  const w2 = new THREE.Mesh(new THREE.PlaneGeometry(D, T), art(w2Tex.w2))
  w2.rotation.y = -Math.PI / 2; w2.position.set(1.7355, Y, D / 2); w2.receiveShadow = true; scene.add(w2)
  const w1 = new THREE.Mesh(new THREE.PlaneGeometry(0.31, T), art(tex('/booth/tex/w1.jpg')))
  w1.position.set(1.736 + 0.155, Y, D + 0.0005); scene.add(w1)

  /* the 55 inch screen: 1238 x 709, bottom edge 1.5 m, 249 mm in from the wall's left edge */
  const shots = [1, 2, 3, 4, 5, 6].map(i => tex(`/booth/screen-${i}.webp`))
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(1.258, 0.729, 0.04), new THREE.MeshStandardMaterial({ color: '#111318', roughness: 0.4, metalness: 0.3 }))
  bezel.position.set(0.249 + 0.619, 0.04 + 1.5 + 0.3545, 0.021); bezel.castShadow = true; scene.add(bezel)
  const panelMat = new THREE.MeshBasicMaterial({ map: shots[1], toneMapped: false })
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.238, 0.709), panelMat)
  panel.position.set(0.868, 0.04 + 1.5 + 0.3545, 0.042); scene.add(panel)

  /* the counter: front 600 x 1170 with the 170 mm corner, 450 deep, the red side the render shows */
  const cw = 0.6, ch = 1.17, cr = 0.17, cd = 0.45
  const shape = new THREE.Shape()
  shape.moveTo(0, 0); shape.lineTo(cw, 0); shape.lineTo(cw, ch - cr); shape.absarc(cw - cr, ch - cr, cr, 0, Math.PI / 2, false); shape.lineTo(0, ch); shape.lineTo(0, 0)
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: cd, bevelEnabled: false, curveSegments: 18 }), [matte('#ffffff'), new THREE.MeshStandardMaterial({ color: '#EC2027', roughness: 0.6 })])
  const counter = new THREE.Group()
  body.castShadow = true; body.receiveShadow = true; counter.add(body)
  const frontGeo = new THREE.ShapeGeometry(shape, 18)
  const uv = frontGeo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / cw, uv.getY(i) / ch)
  const front = new THREE.Mesh(frontGeo, art(tex('/booth/tex/ct.jpg')))
  front.position.z = cd + 0.0008; counter.add(front)
  counter.position.set(0.85, 0.04, 1.75); counter.rotation.y = 0.18
  scene.add(counter)

  /* the arm lights along the top of the IAQ walls */
  const lampMat = new THREE.MeshStandardMaterial({ color: '#D9DCE2', roughness: 0.4, metalness: 0.6 })
  ;[[0.45, 0.25], [1.35, 0.25], [1.55, 1.0], [1.55, 2.2]].forEach(([x, z], i) => {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 8), lampMat)
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.08), lampMat)
    const g = new THREE.Group(); arm.rotation.z = Math.PI / 2 - 0.5; arm.position.set(-0.2, 0, 0); head.position.set(-0.42, -0.12, 0); g.add(arm, head)
    g.position.set(x, T + 0.08, z); g.rotation.y = i < 2 ? -Math.PI / 2 : Math.PI; scene.add(g)
    const sp = new THREE.SpotLight('#fff6ea', 2.2, 5, 0.7, 0.6, 1.4); sp.position.set(x + (i < 2 ? 0 : -0.4), T, z + (i < 2 ? 0.4 : 0)); sp.target.position.set(x - (i < 2 ? 0 : 0.8), 1.6, i < 2 ? 0 : z); scene.add(sp, sp.target)
  })

  /* render on demand; the screen changes chapter every 4 s */
  let raf = 0, anim = null, shot = 1
  function render() { renderer.render(scene, camera) }
  function loop() {
    raf = requestAnimationFrame(loop)
    if (anim) {
      const k = Math.min(1, (performance.now() - anim.t0) / 900), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
      camera.position.lerpVectors(anim.p0, anim.p1, e); controls.target.lerpVectors(anim.a0, anim.a1, e)
      if (k >= 1) anim = null
    }
    if (controls.update() || anim) render()
  }
  controls.addEventListener('change', render)
  const tick = setInterval(() => { shot = (shot + 1) % shots.length; panelMat.map = shots[shot]; panelMat.needsUpdate = true; render() }, 4000)
  loop(); render()

  const onResize = () => { W = el.clientWidth; H = el.clientHeight; if (!W || !H) return; renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix(); render() }
  const ro = new ResizeObserver(onResize); ro.observe(el)

  api.current = {
    goto: v => { if (typeof v === 'number') v = VIEWS[v]; anim = { t0: performance.now(), p0: camera.position.clone(), p1: new THREE.Vector3(...v.pos), a0: controls.target.clone(), a1: new THREE.Vector3(...v.at) } },
    setOption: o => { w2.material.map = w2Tex[o] || w2Tex.w2; w2.material.needsUpdate = true; render() },
    shotAt: (i, s) => { const v = typeof i === 'number' ? VIEWS[i] : i; camera.position.set(...v.pos); controls.target.set(...v.at); controls.update(); if (s != null) { panelMat.map = shots[s]; panelMat.needsUpdate = true } render(); return renderer.domElement.toDataURL('image/jpeg', 0.9) },
  }
  window.__boothModel = api.current
  setTimeout(onReady, 300)

  return () => {
    cancelAnimationFrame(raf); clearInterval(tick); ro.disconnect(); controls.dispose()
    scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => { if (m.map) m.map.dispose(); m.dispose() }) })
    pmrem.dispose(); renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss()
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
    delete window.__boothModel
  }
}
