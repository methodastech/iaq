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

/* 14 Oct ("on services, this 3d animation can you replace with the new one refer the home 3d animation"): the map reads
   the home build's own model (public/build3d/models, the 3D team's latest delivery, imported by tools/embed-3d.mjs), so
   the two never drift apart again. Those GLBs are gzipped; glb() below unpacks them as the home build does. */
const BASE = '/build3d/models/'
export const LAYER_FILE = k => BASE + (k === 'shell' ? 'manifest.json' : `manifest-${k}.json`)
/* what stands at rest: the building and its frame */
/* 14 Oct ("follow the first reference", the home build's finished building): at rest the map shows the building as the
   home build hands it over: its storey shell, clad and closed (closing walls, initFabReal). The frame, the systems and
   the tools stay out of sight until a pick lights them. */
export const REST = ['shell']

const REST_COLOR = new THREE.Color('#D3DAE3')      /* the app's light model on the dark ground */
const DIM_COLOR = new THREE.Color('#5C6675')       /* the building when something is picked: solid slate, the colour reads on it */
/* 25 Sep (Bazil, of the app's Overall view: "it looks so far ok here"): every layer in its own colour at rest, as the
   app draws them: the building light, walls green, ducts blue, sprinklers red, electrical orange, pipes green, water
   blues, plant and tools pale. A pick keeps the lit layers in these colours and greys the rest. */
const PALETTE = { shell: '#E1E0E0', structure: '#C9CCD0', 'detail-frame': '#AEB3BA', ceiling: '#E4E8EE', 'detail-cleanroomwalls': '#2E8B57', 'detail-envelope': '#E1E0E0', 'detail-louvres': '#B4B8BE', 'detail-ducts-lite': '#2F62D6', 'detail-processwater': '#1E9E8A', 'detail-equipment-lite': '#E6E9EE', 'detail-sprinklers-lite': '#D9342B', 'detail-electrical': '#E8792B', 'detail-coldwater': '#4A90D9', 'detail-rainwater': '#6FA8DC', 'detail-sanitary': '#8E6BB3', 'detail-pipes-lite': '#4CAF50', 'detail-supports': '#9AA3AF', 'detail-support': '#AEB6C2', 'detail-tools-lite': '#4A9BE6' }   /* 26 Sep (Bazil: "tools should be blue colour?"): the process tools in blue */
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
/* 14 Oct (the home build's finished view, "envelope closes"): the south facade stands at z 2.72 and the crown band just
   outside it, so the cut moves out to z 3.4 and the building is closed, as the home build hands it over. The apron deck
   (south of z 5) stays out. */
const KEEP = new THREE.Box3(new THREE.Vector3(-72, GROUND_Y, -41), new THREE.Vector3(38.7, 32, 3))   /* 20 Oct ("remove that thing": dashed lines on the east end): the model is cut at x 38.7, inside the closing east wall (38.45 to 38.85), so its own end face no longer sits in the wall's plane and flickers through it; the closing walls are not cut on x (closing, below) */

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
  /* 14 Oct ("that thing should not be there right", a sill standing out of the north face under the band): the closed
     building is cut at its north face line (z -36.73) as well, so nothing the export hangs outside it shows */
  const CLIP = [new THREE.Plane(new THREE.Vector3(-1, 0, 0), KEEP.max.x), new THREE.Plane(new THREE.Vector3(0, 0, -1), KEEP.max.z), new THREE.Plane(new THREE.Vector3(0, 1, 0), -GROUND_Y), new THREE.Plane(new THREE.Vector3(0, 0, 1), 36.78)]
  /* the building's own skin is cut a little deeper (z 1.2), so the south face opens on the floors, as the app's Overall
     view shows it; the frame, walls and systems keep the wider cut and stand in the opening */
  const CLIP_SHELL = CLIP   /* 14 Oct: no deeper cut on the skin any more; the building is closed (KEEP) */
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
  /* 14 Oct: the delivery's GLBs are gzip files (1F 8B), unpacked in the browser; a plain GLB passes straight through */
  async function glb(url) {
    const res = await fetch(url); if (!res.ok) throw new Error(res.status + ' ' + url)
    let buf = await res.arrayBuffer()
    const h = new Uint8Array(buf, 0, 2)
    if (h[0] === 31 && h[1] === 139) buf = await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
    return new Promise((ok, no) => gltf.parse(buf, BASE, ok, no))
  }
  /* 14 Oct (the home build's look): at rest every mesh wears the 3D team's own material, as the home build draws it; a
     pick swaps in the layer's lit or slate material (paint). One clipped copy per source material per layer. */
  const OUTSIDE = /^(shell|structure|detail-envelope|detail-louvres|detail-frame|detail-support)$/
  const owns = new Map()   /* layer key → Map(source material → clipped copy) */
  const ownFor = (key, src) => {
    /* the building's outside (skin, envelope, louvres, frame, structure) keeps the home build's greys (PALETTE; the skin
       is its sign patch colour), not the Revit export's cyans and rust; the systems inside wear the export's colours */
    if (OUTSIDE.test(key)) return null
    if (!owns.has(key)) owns.set(key, new Map())
    const by = owns.get(key)
    if (!by.has(src)) { const c = src.clone(); c.clippingPlanes = key === 'shell' ? CLIP_SHELL : CLIP; c.side = THREE.FrontSide; if (/-lite$|^ceiling$|envelope|cleanroomwalls/.test(key)) c.flatShading = true; c.needsUpdate = true; by.set(src, c) }
    return by.get(src)
  }

  const groups = new Map()          /* layer key → THREE.Group */
  const boxes = new Map()           /* layer key → Box3 */
  const loading = new Map()         /* layer key → Promise */
  const mats = new Map()            /* layer key → MeshStandardMaterial (one per layer, recoloured on focus) */
  const edgeMat = new THREE.LineBasicMaterial({ color: '#0F1319', transparent: true, opacity: .28, clippingPlanes: CLIP })
  const ghosts = new Map()          /* layer key → the same layer's see-through material for the parts behind walls */
  let lit = new Set(), litColor = null
  const world = new THREE.Box3()

  /* 14 Oct: the home build's cladding (its "detail-clad" shader, public/build3d/assets/app.js): on every wall, a joint at
     each 1 m course and panels 3 m long, staggered by half a panel row to row; roofs and soffits stay plain */
  const clad = m => {
    m.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vDetPos; varying vec3 vDetNrm;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvDetPos = (modelMatrix * vec4(transformed, 1.0)).xyz; vDetNrm = mat3(modelMatrix) * objectNormal;')
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying vec3 vDetPos; varying vec3 vDetNrm;
float detLine(float p, float w) {
  float f = abs(fract(p) - 0.5);
  float aa = max(fwidth(p), 1e-5);
  float line = 1.0 - smoothstep(0.5 - w - aa, 0.5 - w + aa, f);
  return line * clamp(2.0 * w / aa, 0.0, 1.0);
}
vec3 detN() { vec3 n = vDetNrm; if (dot(n, n) < 1e-10) n = cross(dFdx(vDetPos), dFdy(vDetPos)); return normalize(n); }`)
        .replace('#include <color_fragment>', `#include <color_fragment>
  {
    vec3 n = detN();
    if (abs(n.y) < 0.4) {
      float along = abs(n.x) > abs(n.z) ? vDetPos.z : vDetPos.x;
      float course = detLine(vDetPos.y / 1.0, 0.035);
      float row = floor(vDetPos.y / 1.0);
      float panel = detLine((along + 1.5 * mod(row, 2.0)) / 3.0, 0.012);
      diffuseColor.rgb *= 1.0 - 0.32 * max(course, panel);
    }
  }`)
    }
    m.customProgramCacheKey = () => 'iaq-clad'
  }
  const matFor = key => {
    if (!mats.has(key)) {
      /* the lite layers are decimated with flat normals (their manifests say so): flat shading keeps their facets crisp
         instead of smeared (Bazil: "solid quality, no breakage") */
      mats.set(key, new THREE.MeshStandardMaterial({ color: REST_COLOR.clone(), roughness: .72, metalness: .06, clippingPlanes: key === 'shell' ? CLIP_SHELL : CLIP, flatShading: /-lite$|^ceiling$|envelope|cleanroomwalls/.test(key) }))
      if (REST.includes(key)) clad(mats.get(key))
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
      await Promise.all(man.storeys.map(s => new Promise(res => glb(BASE + s.file).then(r => {
        r.scene.traverse(o => { if (o.isMesh) { if (man.needsNormals && !o.geometry.attributes.normal) o.geometry.computeVertexNormals(); o.userData.own = Array.isArray(o.material) ? m : ownFor(key, o.material); o.material = m; o.userData.layer = key; o.castShadow = false; o.receiveShadow = false
          /* the building's skin and structure carry fine edge lines, so the geometry reads as drawn, not as a smear */
          if (key === 'structure') { try { const eg = new THREE.EdgesGeometry(o.geometry, 28); const el = new THREE.LineSegments(eg, edgeMat); el.userData.edge = true; o.add(el) } catch (e) {} } } })
        g.add(r.scene); res()
      }).catch(err => { console.error('fabreal: ' + s.file + ' failed', err && (err.message || err)); res() }))))
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
    for (const [key, g] of groups) g.visible = REST.includes(key) || (anyLit && lit.has(key))   /* 14 Oct: at rest, the closed building only */
    signs.visible = closing.visible = !anyLit   /* 14 Oct: the sign, the crown and the closing walls at rest; a pick opens the building on the lit layers */
    /* 14 Oct: at rest the 3D team's materials, with a pick the layer's own */
    for (const [key, g] of groups) g.traverse(o => { if (o.isMesh) o.material = anyLit ? mats.get(key) : (o.userData.own || mats.get(key)) })
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

  /* 14 Oct (the home build's finished view): the IAQ signage as the home build draws it on the same model (its K1:
     public/build3d/assets/app.js), with its own measures. Two grey patches clear the facade where the signs go, the
     logo stands on the north face and on the west end at the top, and the red crown band runs round the building
     under it. */
  const signs = new THREE.Group(); signs.name = 'iaq-signage'; scene.add(signs)
  {
    const LOGO_W = 8.4, LOGO_AR = 668 / 276, LOGO_H = LOGO_W / LOGO_AR * 1.06, LOGO_Y = 28.3 - LOGO_H / 2, SOUTH = 2.72
    const place = (m, c, n, off) => { const v = new THREE.Vector3(...n); m.position.set(...c).addScaledVector(v, off); m.lookAt(m.position.clone().add(v)); signs.add(m) }
    const patch = matFor('shell')
    for (const s of [{ c: [-61.65, 27.1, -36.73], n: [0, 0, -1] }, { c: [-65.74, 27.1, -31.85], n: [-1, 0, 0] }]) place(new THREE.Mesh(new THREE.PlaneGeometry(4.9, 2.3), patch), s.c, s.n, .09)
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = Math.round(1024 / (LOGO_W / LOGO_H))
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8
    const img = new Image(); img.onload = () => { const w = 1024 * .97, h = w / LOGO_AR; cv.getContext('2d').drawImage(img, (1024 - w) / 2, (cv.height - h) / 2, w, h); tex.needsUpdate = true; mark() }; img.src = '/build3d/signs/iaq-logo.png'
    const logo = new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: .05, depthWrite: false, roughness: .6, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })
    for (const s of [{ c: [-65.74 + .7 + LOGO_W / 2, LOGO_Y, -36.73], n: [0, 0, -1] }, { c: [-65.74, LOGO_Y, -36.73 + .7 + LOGO_W / 2], n: [-1, 0, 0] }]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(LOGO_W, LOGO_H), logo); m.renderOrder = 2; place(m, s.c, s.n, .12) }
    const red = new THREE.MeshStandardMaterial({ color: '#EF3F3E', roughness: .6, metalness: 0 })
    const OUT = .3, TH = .12, BAND = .85, TOP = LOGO_Y - LOGO_H / 2 - .35
    for (const [x0, z0, x1, z1, nx, nz] of [[-65.74, -36.73, 38.83, -36.73, 0, -1], [-65.74, -36.73, -65.74, SOUTH, -1, 0], [-65.74, SOUTH, 38.83, SOUTH, 0, 1], [38.69, -36.73, 38.69, SOUTH, 1, 0]]) {
      const len = Math.hypot(x1 - x0, z1 - z0) + 2 * OUT + .1, alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0)
      const m = new THREE.Mesh(new THREE.BoxGeometry(alongX ? len : TH, BAND, alongX ? TH : len), red)
      m.position.set((x0 + x1) / 2 + nx * (OUT - TH / 2), TOP - BAND / 2, (z0 + z1) / 2 + nz * (OUT - TH / 2)); signs.add(m)
    }
  }

  /* 14 Oct: the home build's closing walls (its "fab-closing-walls" and "facade-patch", public/build3d/assets/app.js),
     with its measures: the east end wall and its coping, the south skin that closes the pipe-rack terrace from the ground
     to the parapet with its west return and roof, the patches over the facade's open strips, and the loading-bay doors
     and canopy along the south foot. They take the skin's material, so they clad, dim and clip with it. */
  const closing = new THREE.Group(); closing.name = 'closing-walls'; scene.add(closing)
  {
    /* 20 Oct: the closing walls wear the skin's clad material, but without the east cut, so the east wall stands whole
       while the model behind it is cut inside it (KEEP.max.x) */
    const skin = matFor('shell'), wall = skin.clone()
    wall.color.set(PALETTE.shell); wall.clippingPlanes = CLIP.slice(1); wall.onBeforeCompile = skin.onBeforeCompile; wall.customProgramCacheKey = skin.customProgramCacheKey
    const BASE_Y = 4.1, TOP = 29.34, SOUTH = 2.72
    const box = (w, h, d, x, y, z, m = wall) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); closing.add(b) }
    box(.4, TOP - BASE_Y, SOUTH + .1 + 36.9, 38.65, (TOP + BASE_Y) / 2, (-36.9 + SOUTH + .1) / 2)
    box(38.99 - 38.45, .35, SOUTH + 36.9, (38.45 + 38.99) / 2, TOP + .11 - .175, (-36.9 + SOUTH) / 2)
    const T = { x0: -65.74, x1: 38.85, zN: -8.9, from: 20.9, skin: .3 }, len = T.x1 - T.x0, deep = SOUTH - T.zN
    box(len, TOP - BASE_Y, T.skin, (T.x0 + T.x1) / 2, (TOP + BASE_Y) / 2, SOUTH - T.skin / 2)
    box(T.skin, TOP - T.from, deep, T.x0 + .05 + T.skin / 2, (TOP + T.from) / 2, (T.zN + SOUTH) / 2)
    box(len, T.skin, deep, (T.x0 + T.x1) / 2, TOP - T.skin / 2, (T.zN + SOUTH) / 2)
    for (const [a, b] of [[[-65.81, 8.2, -16.4], [-65.61, 10.5, -10]], [[-65.74, 8.84, -34.13], [38.8, 9.45, -33.95]], [[-65.74, 9.36, -36.7], [38.8, 9.42, -34.13]], [[-65.7, 19.1, -36.665], [38.8, 19.3, -36.6]]])
      box(b[0] - a[0], b[1] - a[1], b[2] - a[2], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2)
    /* 14 Oct ("that thing should not be there right", a hole in the north face under the band): the home build's facade
       infills (its EU list) that fall on the main fab: the opening under the crown, two near the west end, and the ground
       floor's open bays along the recessed north wall. The home build copies a stretch of facade into each; here each is
       a clad block set 1 cm proud of the face and running back into the wall, so the joints line up (they are drawn in
       world space). The annex's infills are outside the map's cut. */
    for (const [face, x0, x1, y0, y1, d] of [[-36.73, -47.8, -38.845, 20.12, 25.63, 3.2], [-36.73, -59.745, -56.765, 14.6, 16.43, 3.2], [-36.73, -59.75, -53.77, 11.13, 13.73, 3.2], [-34.13, -59.744, 38.8, 4.35, 8.87, .08]])
      box(x1 - x0, y1 - y0, d + .01, (x0 + x1) / 2, (y0 + y1) / 2, face - .01 + (d + .01) / 2)
    /* 20 Oct ("can you remove that thing"): the loading-bay doors and their canopy along the south foot are gone */
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
    stop() { alive = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); controls.dispose(); for (const g of groups.values()) g.traverse(o => { if (o.isMesh) o.geometry.dispose() }); for (const m of mats.values()) m.dispose(); for (const m of ghosts.values()) m.dispose(); for (const by of owns.values()) for (const m of by.values()) m.dispose(); closing.traverse(o => { if (o.isMesh) o.geometry.dispose() }); signs.traverse(o => { if (o.isMesh) { o.geometry.dispose(); if (o.material.map) o.material.map.dispose() } }); aoPass.dispose(); renderer.dispose(); draco.dispose(); canvas.remove() },
  }
}
