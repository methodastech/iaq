/* ============================================================================
   fabreal.js · IAQ's real fab, the Revit model, in the Services banner (25 Sep 2026)

   Bazil: "this shouldn't be a visual, it should be actual 3D", then the IAQ Cleanroom app at iaq3d.netlify.app
   ("you can take everything"). Its model is the fab exported from Revit as one Draco GLB per storey per layer
   (public/assets/iaq/model3d, manifests as the app wrote them). This scene loads the shell and the structure at
   once and every other layer the first time a pick needs it, keeps one group per layer, and lights the picked
   layers in the kind's colour while the rest fall back to slate. The map drives it through focus(); a pin per lit
   layer is placed by the host from the projected top of that layer's box.

   initFabReal(root, { onReady }) → { focus(layerKeys, colour), reset(), zoom(dir), stop(), project(key) }
   ============================================================================ */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createAOPass } from './ao-pass.js'

const BASE = '/assets/iaq/model3d/'
export const LAYER_FILE = k => BASE + (k === 'shell' ? 'manifest.json' : `manifest-${k}.json`)
/* what stands at rest: the building and its frame */
export const REST = ['shell', 'structure']

const REST_COLOR = new THREE.Color('#D3DAE3')      /* the app's light model on the dark ground */
const DIM_COLOR = new THREE.Color('#5C6675')       /* the building when something is picked: solid slate, the colour reads on it */
/* 25 Sep (Bazil, of the app's Overall view: "it looks so far ok here"): every layer in its own colour at rest, as the
   app draws them: the building light, walls green, ducts blue, sprinklers red, electrical orange, pipes green, water
   blues, plant and tools pale. A pick keeps the lit layers in these colours and greys the rest. */
const PALETTE = { shell: '#D9DEE6', structure: '#C4CBD5', 'detail-frame': '#B7BFCA', ceiling: '#E4E8EE', 'detail-cleanroomwalls': '#2E8B57', 'detail-envelope': '#D3D8E0', 'detail-louvres': '#AEB6C2', 'detail-ducts-lite': '#2F62D6', 'detail-processwater': '#1E9E8A', 'detail-equipment-lite': '#E6E9EE', 'detail-sprinklers-lite': '#D9342B', 'detail-electrical': '#E8792B', 'detail-coldwater': '#4A90D9', 'detail-rainwater': '#6FA8DC', 'detail-sanitary': '#8E6BB3', 'detail-pipes-lite': '#4CAF50', 'detail-supports': '#9AA3AF', 'detail-support': '#AEB6C2', 'detail-tools-lite': '#4A9BE6' }   /* 26 Sep (Bazil: "tools should be blue colour?"): the process tools in blue */
const BG = '#0F1319'
/* 25 Sep (Bazil: "we just need the one building in the middle, concentrate on that, but I don't want the broken part
   look"). The app's storey meshes merge the whole site: the main fab (its steel frame stands at x -70 to 41, z -39 to
   3), the utility annex east of x 41, and a lower apron deck south of z 5 with its pile field and a few stray plates.
   Two clipping planes cut the model to the main fab exactly; anything wholly outside is hidden; the frame and the
   pins use the clipped box. */
/* 25 Sep (Bazil, on a zoom of the pile caps hanging under the slab: "why the 3d look so bad"): the structure layer runs
   down to y -4.3 with the piles and caps, and with no ground in the scene they hung in space. The shell's lowest point
   is the slab at y 4.1, so a third clipping plane cuts everything below 3.95: the building stands on its own footprint. */
const GROUND_Y = 3.95
const KEEP = new THREE.Box3(new THREE.Vector3(-72, GROUND_Y, -41), new THREE.Vector3(41.2, 32, 2.6))   /* z 2.6: the south facade is cut, the floors show as in the app's view */

export default function initFabReal(root, opts = {}) {
  const canvas = document.createElement('canvas')
  canvas.className = 'fr-canvas'
  root.appendChild(canvas)
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  } catch (e) { return null }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.setClearColor(BG, 0)
  /* 26 Sep (Bazil: "I want all our 3D render to be this realistic and 3D"): contact shading on the solid pass, the
     home build's pass as a module; the see-through pass still draws straight over it */
  const aoPass = createAOPass(renderer)
  const CLIP = [new THREE.Plane(new THREE.Vector3(-1, 0, 0), KEEP.max.x), new THREE.Plane(new THREE.Vector3(0, 0, -1), KEEP.max.z), new THREE.Plane(new THREE.Vector3(0, 1, 0), -GROUND_Y)]
  /* the building's own skin is cut a little deeper (z 1.2), so the south face opens on the floors, as the app's Overall
     view shows it; the frame, walls and systems keep the wider cut and stand in the opening */
  const CLIP_SHELL = [CLIP[0], new THREE.Plane(new THREE.Vector3(0, 0, -1), 1.2), CLIP[2]]
  renderer.localClippingEnabled = true   /* the planes ride on each material (two global planes set before the first render left the model blank) */
  window.__frClip = which => { renderer.clippingPlanes = which === 0 ? [] : which === 1 ? [CLIP[0]] : which === 2 ? [CLIP[1]] : CLIP }
  window.__frClipSet_off = (spec, mode) => { const ps = spec.map(([x, y, z, c]) => new THREE.Plane(new THREE.Vector3(x, y, z).normalize(), c)); if (mode === 'local') { renderer.clippingPlanes = []; renderer.localClippingEnabled = true; for (const m of mats.values()) { m.clippingPlanes = ps; m.needsUpdate = true } } else { renderer.localClippingEnabled = false; for (const m of mats.values()) { m.clippingPlanes = null; m.needsUpdate = true } renderer.clippingPlanes = ps } }

  /* 30 Sep ("this one make me laggy bit"): the map drew the whole scene, with the contact-shading pass, sixty times a
     second for as long as it was on screen, although nothing moved. It now draws only when something changed: the
     camera (a drag, the damping after it, a zoom, a refit), a pick, a layer arriving, a resize. Between those the
     canvas keeps its last picture. */
  let dirty = true
  const mark = () => { dirty = true }
  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(BG, 320, 900)
  const camera = new THREE.PerspectiveCamera(26, 1, 1, 4000)
  /* 26 Sep (Bazil: "make the model look more realistic, not broken"): a clear three-point light so faces separate
     (a key from the front left, a cooler fill from the back right, a rim from behind), on a soft sky */
  const hemi = new THREE.HemisphereLight('#E9EEF5', '#141A24', .9); scene.add(hemi)
  const sun = new THREE.DirectionalLight('#FFFFFF', 1.6); sun.position.set(-160, 260, 160); scene.add(sun)
  const fill = new THREE.DirectionalLight('#BFD3EE', .55); fill.position.set(220, 90, -160); scene.add(fill)
  const rim = new THREE.DirectionalLight('#FFFFFF', .7); rim.position.set(60, 120, -260); scene.add(rim)

  /* 25 Sep (Bazil: "no need the ground"): no ground plane; the model stands on the section's own dark */

  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true; controls.dampingFactor = .08
  controls.enablePan = false; controls.enableZoom = false     /* the wheel scrolls the page; zoom is the buttons */
  controls.minPolarAngle = .35; controls.maxPolarAngle = 1.35
  controls.rotateSpeed = .6

  const draco = new DRACOLoader(); draco.setDecoderPath('/draco/')
  /* the app's GLBs are meshopt-compressed (EXT_meshopt_compression), not Draco; both decoders are set so either kind loads */
  const gltf = new GLTFLoader(); gltf.setDRACOLoader(draco); gltf.setMeshoptDecoder(MeshoptDecoder)

  const groups = new Map()          /* layer key → THREE.Group */
  const boxes = new Map()           /* layer key → Box3 */
  const loading = new Map()         /* layer key → Promise */
  const mats = new Map()            /* layer key → MeshStandardMaterial (one per layer, recoloured on focus) */
  const edgeMat = new THREE.LineBasicMaterial({ color: '#0F1319', transparent: true, opacity: .28, clippingPlanes: CLIP })
  const ghosts = new Map()          /* layer key → the same layer's see-through material for the parts behind walls */
  let lit = new Set(), litColor = null
  const world = new THREE.Box3()

  const matFor = key => {
    if (!mats.has(key)) {
      /* the lite layers are decimated with flat normals (their manifests say so): flat shading keeps their facets crisp
         instead of smeared (Bazil: "solid quality, no breakage") */
      mats.set(key, new THREE.MeshStandardMaterial({ color: REST_COLOR.clone(), roughness: .72, metalness: .06, clippingPlanes: key === 'shell' ? CLIP_SHELL : CLIP, flatShading: /-lite$|^ceiling$|envelope|cleanroomwalls/.test(key) }))
      ghosts.set(key, new THREE.MeshStandardMaterial({ color: REST_COLOR.clone(), roughness: 1, metalness: 0, clippingPlanes: CLIP, transparent: true, opacity: .34, depthWrite: false }))
    }
    return mats.get(key)
  }

  async function loadLayer(key) {
    if (groups.has(key)) return groups.get(key)
    if (loading.has(key)) return loading.get(key)
    const p = (async () => {
      const man = await (await fetch(LAYER_FILE(key))).json()
      const g = new THREE.Group(); g.name = key
      const m = matFor(key)
      await Promise.all(man.storeys.map(s => new Promise(res => gltf.load(BASE + s.file, r => {
        r.scene.traverse(o => { if (o.isMesh) { if (man.needsNormals && !o.geometry.attributes.normal) o.geometry.computeVertexNormals(); o.material = m; o.userData.layer = key; o.castShadow = false; o.receiveShadow = false
          /* the building's skin and structure carry fine edge lines, so the geometry reads as drawn, not as a smear */
          if (key === 'shell' || key === 'structure') { try { const eg = new THREE.EdgesGeometry(o.geometry, 28); const el = new THREE.LineSegments(eg, edgeMat); el.userData.edge = true; o.add(el) } catch (e) {} } } })
        g.add(r.scene); res()
      }, undefined, err => { console.error('fabreal: ' + s.file + ' failed', err && (err.message || err)); res() }))))
      /* meshes wholly outside the main fab are hidden (nothing to clip); the layer's box is clamped to the fab */
      g.traverse(o => { if (!o.isMesh) return; const ob = new THREE.Box3().setFromObject(o), sz = ob.getSize(new THREE.Vector3()); if (ob.min.x > KEEP.max.x || ob.min.z > KEEP.max.z || ob.max.y < GROUND_Y) o.visible = false
        /* the shell carries two huge flat site plates (120 and 72 triangles over 80 to 130 m at roof height): the grey
           slabs Bazil circled. A shell mesh that thin and that long with so few triangles is a site plate, hidden */
        const i = o.geometry.index, t = (i ? i.count : o.geometry.attributes.position.count) / 3
        if (key === 'shell' && t < 200 && Math.max(sz.x, sz.z) > 60 && sz.y < 3) o.visible = false })
      const b = new THREE.Box3().setFromObject(g); b.min.max(KEEP.min); b.max.min(KEEP.max)
      boxes.set(key, b); groups.set(key, g); scene.add(g); mark()
      if (REST.includes(key)) { world.union(b); frame() }
      loading.delete(key)
      paint()
      return g
    })()
    loading.set(key, p)
    return p
  }

  /* the rest pose: the whole building in frame from the front right, a little above */
  let home = null
  const DIR = new THREE.Vector3(-.68, .36, .64).normalize()   /* the app's own view: the long facade to the viewer, a little above */
  /* the rest pose: the whole building fills 90% of the box. The eight corners of the world box are projected from a
     trial distance and the distance is scaled by the widest overshoot, twice, so the fit holds for any box shape. */
  function frame() {
    if (world.isEmpty()) return
    /* 25 Sep, night (Bazil: "the canvas should be the whole banner", "don't cut the building"): the canvas spans the
       banner and the model is framed into its left part with a view offset (see resize). The fit itself is done on
       the full frame, with the offset cleared, then the offset goes back on. */
    const view = camera.view && camera.view.enabled ? { ...camera.view } : null
    if (view) camera.clearViewOffset()
    const c = world.getCenter(new THREE.Vector3()), s = world.getSize(new THREE.Vector3())
    /* 26 Sep (Bazil: "push the 3D to the top a bit"): the target sits under the centre, so the fab rides higher in the frame */
    /* 26 Sep, later (Bazil: "building need to be pushed down just by a bit more"): the target moves from 6% under the
       centre to 3% above it, so the fab sits lower in the frame and its pins clear the head */
    controls.target.copy(c).add(new THREE.Vector3(0, s.y * .03, 0))
    let d = s.length()
    /* 26 Sep: the fit is measured on the fab's own outline, not the world box's corners (the box is wider than the
       building along its diagonal, which left air round it): the corners of every visible mesh's clipped box */
    const corners = []
    const KEEPMAX = KEEP.max, KEEPMIN = KEEP.min
    for (const g of groups.values()) g.traverse(o => { if (!o.isMesh || !o.visible) return; const bb = new THREE.Box3().setFromObject(o); bb.min.max(KEEPMIN); bb.max.min(KEEPMAX); if (bb.isEmpty()) return; for (let i = 0; i < 8; i++) corners.push(new THREE.Vector3(i & 1 ? bb.max.x : bb.min.x, i & 2 ? bb.max.y : bb.min.y, i & 4 ? bb.max.z : bb.min.z)) })
    if (!corners.length) for (let i = 0; i < 8; i++) corners.push(new THREE.Vector3(i & 1 ? world.max.x : world.min.x, i & 2 ? world.max.y : world.min.y, i & 4 ? world.max.z : world.min.z))
    for (let pass = 0; pass < 4; pass++) {
      camera.position.copy(controls.target).add(DIR.clone().multiplyScalar(d))
      camera.near = d / 60; camera.far = d * 10; camera.updateProjectionMatrix(); camera.lookAt(controls.target)
      /* 26 Sep: project() reads matrixWorldInverse, which only the renderer refreshed, so every pass was measuring the
         previous camera; harmless once at load, it ran away when the fit was repeated (refit). Refresh it here. */
      camera.updateMatrixWorld(true)
      let mx = 0, my = 0
      for (const p of corners) { const q = p.clone().project(camera); mx = Math.max(mx, Math.abs(q.x)); my = Math.max(my, Math.abs(q.y)) }
      d *= Math.max(mx, my) / .92   /* 26 Sep (Bazil: "by default should zoom in more"): 92% of the box on the fab's own outline */
    }
    /* 26 Sep (Bazil's capture: the model ran under the tools row and the reading panel): the fab's projected height is
       capped to the band between its top (lift's 14%, or under the head) and the tools row, measured for the tallest
       reading (--read-max) so the fit holds whatever is picked and the view never has to refit on a selection */
    const band = bandPx()
    if (band > 0) for (let pass = 0; pass < 6; pass++) {
      camera.position.copy(controls.target).add(DIR.clone().multiplyScalar(d))
      camera.near = d / 60; camera.far = d * 10; camera.updateProjectionMatrix(); camera.lookAt(controls.target); camera.updateMatrixWorld(true)
      let lo = 1, hi = -1
      for (const p of corners) { const q = p.clone().project(camera); lo = Math.min(lo, q.y); hi = Math.max(hi, q.y) }
      const hpx = (hi - lo) / 2 * (root.clientHeight || 200)
      /* perspective: a step back shrinks the near corners more than the far ones, so the ratio is applied and re-measured
         until the projected height meets the band from either side */
      if (Math.abs(hpx - band) < 1) break
      d *= hpx / band
    }
    /* 26 Sep (Bazil: "bigger and a bit lower"): with the taller band the height fit can zoom in past the frame's width and
       cut the fab's end; the width is held to 90% of the model's frame */
    for (let pass = 0; pass < 4; pass++) {
      camera.position.copy(controls.target).add(DIR.clone().multiplyScalar(d))
      camera.near = d / 60; camera.far = d * 10; camera.updateProjectionMatrix(); camera.lookAt(controls.target); camera.updateMatrixWorld(true)
      let mx = 0; for (const p of corners) { const q = p.clone().project(camera); mx = Math.max(mx, Math.abs(q.x)) }
      if (mx <= .9) break
      d *= mx / .9
    }
    camera.position.copy(controls.target).add(DIR.clone().multiplyScalar(d))
    camera.near = d / 60; camera.far = d * 10; camera.updateProjectionMatrix(); camera.lookAt(controls.target); camera.updateMatrixWorld(true)
    home = { pos: camera.position.clone(), tgt: controls.target.clone() }
    scene.fog.near = d * 1.4; scene.fog.far = d * 4
    zoomLevel = 1
    if (view) { camera.setViewOffset(view.fullWidth, view.fullHeight, view.offsetX, view.offsetY, view.width, view.height); camera.updateProjectionMatrix() }
    corners0 = corners
    lift()
  }
  /* 26 Sep (Bazil: "push the 3D to the top a bit"): the model's top sits 6% from the box's top whatever the box's height.
     The vertical part of the view offset does it; the horizontal framing (--fr-left, resize) is kept as it is. */
  let corners0 = []
  /* the vertical band the fab may fill, in canvas CSS px: from lift's wanted top to 14px above the tools row, the tools
     row taken where it sits with the tallest reading open (--read-max on the panel); .74 of the box when there is no row */
  function bandPx() {
    const h = root.clientHeight || 200, cr = root.getBoundingClientRect(), z = cr.height / h || 1
    const sec = root.closest('.sm-map-dark'), head = sec && sec.querySelector('.sm-map-head-r, .sm-map-head')
    const v = camera.view && camera.view.enabled ? camera.view : null, share = v ? v.fullWidth / (root.clientWidth || 300) : 1
    let want = h * .14
    if (head) { const hr = head.getBoundingClientRect()
      if (hr.width > 0 && hr.left < cr.left + cr.width * share && hr.bottom > cr.top) want = Math.max(want, (hr.bottom - cr.top) / z + 28) }
    let bottom = h * .74
    const tools = sec && sec.querySelector('.sm-map-tools'), panel = sec && sec.querySelector('.sm-map-read-b')
    /* 26 Sep (Bazil: "the building can be bigger and a bit lower"): version 2 has no reading panel, and the row was only
       read when the panel stood, so the fab was held to .74 of the box with air under it. The tools row alone sets the floor. */
    if (tools && matchMedia('(min-width:1280px)').matches) { const tr = tools.getBoundingClientRect()
      /* the tools row where it sits now: the page refits the model after the panel's height settles (refitIfHome),
         so the fab is as large as the current reading allows and never runs under the row */
      if (tr.width > 0 && tr.top > cr.top) bottom = (tr.top - cr.top) / z - 28 }   /* the same 28 the head keeps above, so the fab sits with equal air above and below */
    lastBand = { want: Math.round(want), bottom: Math.round(bottom), band: Math.round(bottom - want), h }
    return bottom - want
  }
  let lastBand = null
  window.__frBand = () => { const b = bandPx(); let lo = 1, hi = -1; camera.updateMatrixWorld(true); for (const p of corners0) { const q = p.clone().project(camera); lo = Math.min(lo, q.y); hi = Math.max(hi, q.y) }; return { ...lastBand, hpxNow: Math.round((hi - lo) / 2 * (root.clientHeight || 200)), topNow: Math.round((1 - hi) / 2 * (root.clientHeight || 200)) } }
  function lift() {
    if (!corners0.length) return
    const w = root.clientWidth || 300, h = root.clientHeight || 200
    const v = camera.view && camera.view.enabled ? { ...camera.view } : null
    const fw = v ? v.fullWidth : w
    camera.setViewOffset(fw, h, v ? v.offsetX : 0, 0, w, h); camera.updateProjectionMatrix(); camera.updateMatrixWorld()
    let maxY = -1, minY = 1
    for (const p of corners0) { const q = p.clone().project(camera); if (q.y > maxY) maxY = q.y; if (q.y < minY) minY = q.y }
    /* 26 Sep (Bazil: "a bit more to the bottom", then "still too much to the top?"): 14% from the top, and never under
       the banner's head when the head stands over the model's part of the canvas (narrower screens) */
    let want = h * .14
    const sec = root.closest('.sm-map-dark'), head = sec && sec.querySelector('.sm-map-head-r, .sm-map-head')
    if (head) { const hr = head.getBoundingClientRect(), cr = root.getBoundingClientRect(), z = cr.height / h || 1, share = fw / w
      if (hr.width > 0 && hr.left < cr.left + cr.width * share && hr.bottom > cr.top) want = Math.max(want, (hr.bottom - cr.top) / z + 28) }
    /* 26 Sep (Bazil: "not too far to the top, just nice in the middle"): the fab sits in the middle of the room between
       the head and the tools row (bandPx), whatever height the fit gave it */
    const hpx = (maxY - minY) / 2 * h
    bandPx(); const room = lastBand ? lastBand.bottom - want : 0
    if (room > hpx) want += (room - hpx) / 2
    const topPx = (1 - maxY) / 2 * h, dy = topPx - want
    camera.setViewOffset(fw, h, v ? v.offsetX : 0, dy, w, h); camera.updateProjectionMatrix()
  }

  /* 25 Sep (Bazil: "why is the 3D breaking"): NO transparency anywhere. The building is always solid: light at rest,
     slate when something is picked. The lit layers are drawn in a second pass over a cleared depth buffer (see tick),
     so they show through the walls whole, in their colour, with no half-clear sorting mess and no hollow state
     while a layer is still on its way. */
  let anyLit = false
  function paint() {
    anyLit = [...lit].some(k => groups.has(k))
    for (const [key, m] of mats) {
      const on = anyLit && lit.has(key)
      const pal = new THREE.Color(PALETTE[key] || '#D3DAE3')
      if (on) { m.color.copy(pal).lerp(new THREE.Color('#FFFFFF'), .12); m.emissive.copy(pal).multiplyScalar(.12); m.roughness = .6; const gh = ghosts.get(key); gh.color.copy(pal); gh.emissive.copy(pal).multiplyScalar(.35); gh.needsUpdate = true }
      else if (anyLit) { m.color.copy(DIM_COLOR); m.emissive.set(0); m.roughness = .9 }
      else { m.color.copy(pal); m.emissive.set(0); m.roughness = .82 }
      m.opacity = 1; m.transparent = false; m.depthWrite = true; m.depthTest = true; m.needsUpdate = true
    }
    /* at rest every loaded layer shows, in its colour (the app's Overall); with a pick, the building and the lit layers */
    for (const [key, g] of groups) g.visible = !anyLit || REST.includes(key) || lit.has(key)
    mark()
  }
  /* pass one: the building AND the lit layers with true depth, so every lit part in view is solid and correctly
     occluded; pass two: the lit layers again over a cleared depth buffer in a see-through tint, so the parts behind
     walls still show where they are. Solid where you can see it, a glow where you cannot: nothing reads broken. */
  function renderPasses() {
    const ao = aoPass.active()
    renderer.autoClear = true
    if (ao) aoPass.begin()
    renderer.render(scene, camera)
    if (ao) aoPass.end(camera)
    if (!anyLit) return
    renderer.autoClear = false; renderer.clearDepth()
    const swapped = []
    for (const [k, g] of groups) { const on = lit.has(k); g.visible = on; if (on) g.traverse(o => { if (o.isMesh) { swapped.push(o); o.material = ghosts.get(k) } }) }
    renderer.render(scene, camera)
    swapped.forEach(o => { o.material = mats.get(o.userData.layer) })
    for (const [k, g] of groups) g.visible = REST.includes(k) || lit.has(k)
    renderer.autoClear = true
  }
  /* the lit set's colour for the host's pins stays the kind colour; the model keeps the palette */
  /* every other layer is fetched in the background on a wide screen once the building stands, smallest first, two at
     a time, so a pick lights at once instead of waiting on the network (Bazil: "load properly") */
  const ALL = ['detail-louvres', 'detail-coldwater', 'detail-rainwater', 'detail-sanitary', 'detail-support', 'detail-envelope', 'detail-cleanroomwalls', 'detail-ducts-lite', 'detail-processwater', 'detail-electrical', 'ceiling', 'detail-supports', 'detail-sprinklers-lite', 'detail-pipes-lite', 'detail-equipment-lite', 'detail-frame', 'detail-tools-lite']
  let preloaded = 0
  async function preload() {
    if (window.innerWidth < 1100 || (navigator.connection && navigator.connection.saveData)) return
    const queue = ALL.slice()
    const worker = async () => { while (queue.length) { const k = queue.shift(); try { await loadLayer(k) } catch (e) {} preloaded++; if (opts.onProgress) opts.onProgress(preloaded, ALL.length) } }
    await Promise.all([worker(), worker()])
  }

  let zoomLevel = 1
  function zoom(dir) {
    if (!home) return
    zoomLevel = dir === 0 ? 1 : Math.max(.55, Math.min(2.2, zoomLevel * (dir > 0 ? 1.25 : .8)))
    const v = camera.position.clone().sub(controls.target)
    const want = home.pos.clone().sub(home.tgt).length() / zoomLevel
    v.setLength(want); camera.position.copy(controls.target).add(v)
    /* 26 Sep: reset re-frames into the room the current reading leaves above the tools row (the stored home may be
       from before a pick that changed the panel's height) */
    if (dir === 0) { frame() }
  }

  function resize() {
    const w = root.clientWidth || 300, h = root.clientHeight || 200
    renderer.setSize(w, h, false); mark()
    /* --fr-left (CSS, on .fr): the share of the canvas width the model is framed into, 1 = the whole canvas */
    /* --fr-left (CSS, on .fr): the share of the canvas width the model is framed into, 1 = the whole canvas. The vertical
       placement is lift()'s (the model's top under the banner's head), on the full canvas height. */
    const left = Math.min(1, Math.max(.3, parseFloat(getComputedStyle(root).getPropertyValue('--fr-left')) || 1))
    const fw = Math.max(1, Math.round(w * left))
    camera.aspect = fw / h
    if (left < 1) camera.setViewOffset(fw, h, 0, 0, w, h); else camera.clearViewOffset()
    camera.updateProjectionMatrix()
    /* 25 Sep, night (Bazil: "do not cut the 3D, the whole section banner is its space"): the rest pose was fitted once,
       at load, for the box of that moment, so a box that changed later (the banner relaid, the pane resized) cut the
       model. The fit is redone for the new box, and the view direction and zoom the visitor has are kept. */
    if (home && !world.isEmpty()) {
      const dir = camera.position.clone().sub(controls.target).normalize(), z = zoomLevel
      frame()
      zoomLevel = z
      const d = home.pos.clone().sub(home.tgt).length() / z
      camera.position.copy(controls.target).add(dir.multiplyScalar(d))
      camera.lookAt(controls.target); camera.updateMatrixWorld(true)
      lift()
    }
  }
  const ro = new ResizeObserver(resize); ro.observe(root); resize()

  let raf = 0, alive = true, vis = true, frameMs = 0
  const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) mark() }, { rootMargin: '120px' }); io.observe(root)
  const seenView = new THREE.Matrix4(), seenProj = new THREE.Matrix4()
  function tick() {
    if (!alive) return
    raf = requestAnimationFrame(tick)
    if (!vis) return
    controls.update(); camera.updateMatrixWorld()
    if (!dirty && camera.matrixWorld.equals(seenView) && camera.projectionMatrix.equals(seenProj)) return
    dirty = false; seenView.copy(camera.matrixWorld); seenProj.copy(camera.projectionMatrix)
    const t0 = performance.now(); renderPasses(); frameMs = frameMs * .9 + (performance.now() - t0) * .1
    if (opts.onFrame) opts.onFrame()
  }
  tick()

  /* the screen point of a layer's top, for the host's pins: null until that layer is loaded. t (0 to 1) walks the
     anchor along the layer's box on its long axis, so several lit layers get their pins spread along the building
     instead of stacked on one centre */
  const tmp = new THREE.Vector3()
  function project(key, t = .5) {
    const b = boxes.get(key); if (!b) return null
    const c = b.getCenter(tmp); c.y = b.max.y
    const sx = b.max.x - b.min.x, sz = b.max.z - b.min.z
    if (sx >= sz) c.x = b.min.x + sx * (.18 + .64 * t); else c.z = b.min.z + sz * (.18 + .64 * t)
    c.project(camera)
    if (c.z > 1) return null
    return { x: (c.x * .5 + .5) * root.clientWidth, y: (-c.y * .5 + .5) * root.clientHeight }
  }

  Promise.all(REST.map(loadLayer)).then(() => { if (opts.onReady) opts.onReady(); preload() })
  /* a QA hook, as __globeQA elsewhere: what is loaded and where the model stands */
  /* QA: every mesh with its box and triangle count, largest box per triangle first (to find stray geometry) */
  window.__frMeshes = () => { const out = []; for (const [k, g] of groups) g.traverse(o => { if (!o.isMesh) return; const b = new THREE.Box3().setFromObject(o), sz = b.getSize(new THREE.Vector3()); const i = o.geometry.index; const t = (i ? i.count : o.geometry.attributes.position.count) / 3; out.push({ layer: k, name: o.name, tris: Math.round(t), size: sz.toArray().map(v => +v.toFixed(1)), min: b.min.toArray().map(v => +v.toFixed(1)), ratio: +(sz.length() / Math.sqrt(t)).toFixed(2), uuid: o.uuid }) }); return out.sort((a, b) => b.ratio - a.ratio) }
  window.__frHide = uuids => { for (const g of groups.values()) g.traverse(o => { if (o.isMesh && uuids.includes(o.uuid)) o.visible = false }); mark() }
  /* the model's box projected onto the canvas with the live camera and view offset, in CSS px of the canvas: the probes read it */
  window.__frBounds = () => {
    if (world.isEmpty()) return null
    camera.updateMatrixWorld(true); camera.updateProjectionMatrix()
    const w = root.clientWidth, h = root.clientHeight; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9
    for (let i = 0; i < 8; i++) { const q = new THREE.Vector3(i & 1 ? world.max.x : world.min.x, i & 2 ? world.max.y : world.min.y, i & 4 ? world.max.z : world.min.z).project(camera); const px = (q.x + 1) / 2 * w, py = (1 - q.y) / 2 * h; x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py) }
    return { x0: Math.round(x0), y0: Math.round(y0), x1: Math.round(x1), y1: Math.round(y1), w, h }
  }
  window.__frQA = () => { let meshes = 0, tris = 0; for (const g of groups.values()) g.traverse(o => { if (o.isMesh) { meshes++; const i = o.geometry.index; tris += (i ? i.count : o.geometry.attributes.position.count) / 3 } }); return { layers: [...groups.keys()], loading: [...loading.keys()], meshes, tris: Math.round(tris), world: world.isEmpty() ? null : [world.min.toArray().map(v => +v.toFixed(1)), world.max.toArray().map(v => +v.toFixed(1))], cam: camera.position.toArray().map(v => +v.toFixed(1)), lit: [...lit], frameMs: +frameMs.toFixed(1), drawn: renderer.info.render.triangles } }

  return {
    focus(keys, colour) {
      lit = new Set(keys || []); litColor = new THREE.Color(colour || '#EC2027')
      paint()
      lit.forEach(k => loadLayer(k))
    },
    reset() { zoom(0) },
    zoom,
    refit: resize,   /* 26 Sep: re-read the framing band (--fr-*) and refit, for a caller that set the band from the DOM */
    /* 26 Sep: refit only while the view is untouched (home position, no zoom), so a pick never resets a view the user
       has turned or zoomed, and the tour keeps its camera */
    refitIfHome() { if (zoomLevel !== 1 || !home) return; if (camera.position.distanceTo(home.pos) > 1e-4 * (home.pos.length() || 1)) return; frame() },
    project,
    loaded: key => groups.has(key),
    stop() { alive = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); controls.dispose(); for (const g of groups.values()) g.traverse(o => { if (o.isMesh) o.geometry.dispose() }); for (const m of mats.values()) m.dispose(); for (const m of ghosts.values()) m.dispose(); aoPass.dispose(); renderer.dispose(); draco.dispose(); canvas.remove() },
  }
}
