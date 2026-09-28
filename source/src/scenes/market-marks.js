/* ============================================================================
   market-marks · the home hero's seven market marks, in real 3D (23 Sep 2026).

   Bazil, on the SVG sets that came before this: "this looks worse and flat and all over the place. Try making real
   3D OpenGL but super refined."

   HOW IT WORKS
     · ONE WebGL context for all seven marks, not seven canvases. The canvas lies over the row, pointer-events none,
       and each mark is a group positioned from the DOM: the tile's own .hmk-stage box is measured and converted to
       world units along the camera's screen-right and screen-up vectors, so a mark sits exactly where the markup
       says it sits, at any width, and the row can reflow without the scene knowing anything about the grid.
     · An orthographic camera on the same dimetric the drawn marks used, so the language is unchanged: only the
       render is real now.
     · Studio light: a room environment for reflections, one key with a soft shadow map, one fill, one rim. Every
       group carries its own shadow-catching plane, so the contact shadow is correct no matter where its tile is.
     · One part of each mark moves on a slow idle. A hover lifts the mark, turns it a little and speeds its moving
       part up. No glow.
     · It replaces the SVG marks only once it is running: the drawn set stays in the markup as the fallback for no
       WebGL and for reduced motion.
   ============================================================================ */

/* The row sits on a dark photograph. A white-bodied object greys out on it, which is what the first run did, so the
   bodies are the client red and the white is the accent, not the other way round. Every mesh also carries a keyline
   (EdgesGeometry), which is what keeps a 90 px object sharp against a busy background. */
/* ONE surface palette for the whole row (23 Sep, Bazil: "sharper colours and better lines, consistent thickness and
   surface colour"). Five values, nothing else: white body, one cool light for secondary faces, one steel for metal,
   the exact brand red for the working part, a deep red where that part turns away, and one ink for every outline.
   The pinks and the second greys that had crept in are gone. */
const WHITE = 0xFFFFFF, LIGHT = 0xE9EEF5, STEEL = 0xBFC9D6, RED = 0xEC2027, DEEP = 0xB5121B, INKC = 0x101722

export async function mountMarketMarks (host, opts = {}) {
  const ids = opts.ids || []
  const THREE = await import('three')
  const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js')
  const { RoundedBoxGeometry } = await import('three/examples/jsm/geometries/RoundedBoxGeometry.js')

  const canvas = document.createElement('canvas')
  canvas.className = 'hmk-gl-canvas'
  host.appendChild(canvas)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  /* the marks are small, so the extra sample buys real sharpness for very little: the canvas is 90 px a tile */
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2.75))
  /* Bazil, with a sheet of flat isometric icons: "see how clean and refined a 3D icon and sharp it needs to be", and
     before it "see how vivid the red". That look is not photoreal: it is flat colour in two or three steps with a
     hard dark outline. So no tone curve, no environment reflections, toon materials on a three-step ramp, and an
     inverted-hull outline on every mesh. Vivid, because nothing is washing the colour any more. */
  renderer.toneMapping = THREE.NoToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.shadowMap.enabled = false

  const scene = new THREE.Scene()

  /* the dimetric the drawn marks used: 45 degrees around, about 30 up */
  const DIR = new THREE.Vector3(1, 0.82, 1).normalize()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
  camera.position.copy(DIR).multiplyScalar(18)
  camera.lookAt(0, 0, 0)
  /* screen-right and screen-up for this camera. Get the sign wrong here and the row lays out mirrored, which is
     exactly what the first run did: the semiconductor tile carried the bottling line. */
  const RIGHT = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), DIR).normalize()
  const UP = new THREE.Vector3().crossVectors(DIR, RIGHT).normalize()

  /* one key drives which toon step a face lands on, and a flat ambient keeps the dark step from going muddy */
  const key = new THREE.DirectionalLight(0xffffff, 1.5)
  key.position.set(5, 8, 6)
  scene.add(key)
  scene.add(new THREE.AmbientLight(0xffffff, 0.62))


  /* ---- texture. Bazil: "why is the red so dull and no texture and such." Three procedural maps, drawn once into
     canvases: a satin noise that breaks up the sheen on a painted body, a brushed streak for steel, and a louvre
     grille for vents and intakes. Without them a lit box reads as plastic, which is what "dull" meant. ---- */
  function canvasTex (w, h, draw, rx = 1, ry = 1) {
    const c = document.createElement('canvas')
    c.width = w; c.height = h
    draw(c.getContext('2d'), w, h)
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(rx, ry)
    t.anisotropy = renderer.capabilities.getMaxAnisotropy()
    return t
  }
  const satinRough = canvasTex(256, 256, (x, w, h) => {
    x.fillStyle = '#8a8a8a'; x.fillRect(0, 0, w, h)
    const img = x.getImageData(0, 0, w, h)
    for (let i = 0; i < img.data.length; i += 4) {
      const n = 128 + (Math.random() - 0.5) * 46
      img.data[i] = img.data[i + 1] = img.data[i + 2] = n
    }
    x.putImageData(img, 0, 0)
  }, 3, 3)
  const brushed = canvasTex(256, 256, (x, w, h) => {
    x.fillStyle = '#6f6f6f'; x.fillRect(0, 0, w, h)
    for (let i = 0; i < 900; i++) {
      x.strokeStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.07})`
      x.lineWidth = Math.random() * 1.4
      const y = Math.random() * h
      x.beginPath(); x.moveTo(0, y); x.lineTo(w, y + (Math.random() - 0.5) * 2); x.stroke()
    }
  }, 2, 2)
  const cells = canvasTex(256, 256, (x, w, h) => {
    x.fillStyle = '#EC2027'; x.fillRect(0, 0, w, h)
    x.fillStyle = '#B5121B'
    for (let iy = 0; iy < 3; iy++) for (let ix = 0; ix < 6; ix++) x.fillRect(6 + ix * 42, 10 + iy * 82, 34, 66)
    x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 2
    for (let iy = 0; iy < 3; iy++) for (let ix = 0; ix < 6; ix++) x.strokeRect(6 + ix * 42, 10 + iy * 82, 34, 66)
  }, 1, 1)
  const grille = canvasTex(128, 128, (x, w, h) => {
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h)
    x.fillStyle = '#BFC9D6'
    for (let y = 4; y < h; y += 12) x.fillRect(6, y, w - 12, 6)
  }, 1, 1)

  /* a three-step ramp: shade, body, light. Nearest filtering is what keeps the steps hard. */
  function ramp (steps) {
    const c = document.createElement('canvas')
    c.width = steps.length; c.height = 1
    const x = c.getContext('2d')
    steps.forEach((v, i) => { x.fillStyle = v; x.fillRect(i, 0, 1, 1) })
    const t = new THREE.CanvasTexture(c)
    t.minFilter = t.magFilter = THREE.NearestFilter
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }
  /* two steps, not three: a hard light/shade pair keeps every colour at its own value instead of muddying it through
     a middle tone. That is what "sharper" means on a flat-shaded object. */
  const RAMP = ramp(['#ccd2dc', '#ffffff'])
  const toon = col => new THREE.MeshToonMaterial({ color: col, gradientMap: RAMP })

  /* ---- materials: one set, so the seven read as one family ---- */
  const M = {
    red: toon(RED),
    deep: toon(DEEP),
    pale: toon(LIGHT),
    blush: toon(LIGHT),
    shell: toon(WHITE),
    steel: toon(STEEL),
    vent: new THREE.MeshToonMaterial({ color: 0xffffff, map: grille, gradientMap: RAMP }),
    cell: new THREE.MeshToonMaterial({ color: 0xffffff, map: cells, gradientMap: RAMP }),
    dark: toon(STEEL),
    glass: toon(WHITE),
  }
  /* the outline: a copy of the mesh, grown along its normals and drawn back-face only, which gives the hard dark
     keyline the reference sheets have. Internal edges get a line on top of it. */
  const INK = INKC
  const hullMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide })
  const lineMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.42 })
  /* the outline is a constant thickness in world units, and it is clamped to a fraction of the part it wraps, so a
     0.1 wide pin does not end up with an outline half its own size. That clamp is the difference between a keyline
     and a blob at 45 px. */
  function keyline (mesh, grow = 0.022) {
    const hull = new THREE.Mesh(mesh.geometry, hullMat)
    mesh.geometry.computeBoundingBox()
    const size = new THREE.Vector3(); mesh.geometry.boundingBox.getSize(size)
    const f = a => 1 + Math.min(grow, Math.max(a, 0.02) * 0.14) * 2 / Math.max(a, 0.02)
    hull.scale.set(f(size.x), f(size.y), f(size.z))
    mesh.add(hull)
    /* internal edges only where a real crease exists: 26 degrees turned every cylinder into a wire cage */
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 42), lineMat))
    return mesh
  }
  const box = (w, h, d, m, r = 0.035) => {
    const g = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, Math.min(w, h, d) / 2.2)), m)
    g.castShadow = true; g.receiveShadow = true
    return keyline(g)
  }
  const cyl = (rt, rb, h, m, seg = 40) => {
    const g = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m)
    return keyline(g)
  }
  const at = (mesh, x, y, z) => { mesh.position.set(x, y, z); return mesh }

  /* ---- the seven marks.
     One rule, 23 Sep: the machine is white and ONE working part is red, the same way a real plant is painted and its
     live equipment is flagged. Before this the red moved around (a red tray here, a red shell there) and the row read
     as seven unrelated objects. One object each, detail on the object, nothing floating beside it. ---- */
  const BUILD = {
    'mkt-semiconductor': () => {
      const g = new THREE.Group()
      const body = box(1.5, 0.3, 1.5, M.red, 0.06)
      g.add(at(body, 0, 0.15, 0))
      const lid = box(1.06, 0.05, 1.06, M.pale, 0.02)
      g.add(at(lid, 0, 0.33, 0))
      const die = box(0.56, 0.1, 0.56, M.red, 0.02)
      g.add(at(die, 0, 0.36, 0))
      for (let i = -2; i <= 2; i++) {
        for (const s of [-1, 1]) {
          g.add(at(box(0.07, 0.1, 0.16, M.steel, 0.015), i * 0.28, 0.07, s * 0.8))
          g.add(at(box(0.16, 0.1, 0.07, M.steel, 0.015), s * 0.8, 0.07, i * 0.28))
        }
      }
      return { g, mv: die, spin: 0 }
    },
    'mkt-data-centre': () => {
      /* the rack: a white cabinet with a recessed front, six server fronts with their handles, a vented top and
         four feet. One unit is white among the reds, and that is the one that is live. */
      const g = new THREE.Group()
      g.add(at(box(0.92, 1.72, 0.86, M.shell, 0.04), 0, 0.88, 0))
      g.add(at(box(0.76, 1.52, 0.05, M.vent, 0.02), 0, 0.9, 0.43))
      let live = null
      for (let i = 0; i < 6; i++) {
        const y = 0.34 + i * 0.24
        const srv = box(0.7, 0.15, 0.06, i === 3 ? M.red : M.pale, 0.015)
        g.add(at(srv, 0, y, 0.455))
        if (i === 3) live = srv
        g.add(at(box(0.09, 0.035, 0.03, M.steel, 0.01), 0.26, y, 0.49))
      }
      g.add(at(box(0.78, 0.04, 0.72, M.steel, 0.02), 0, 1.76, 0))
      for (const [x, z] of [[-0.34, -0.3], [0.34, -0.3], [-0.34, 0.3], [0.34, 0.3]]) g.add(at(box(0.1, 0.06, 0.1, M.steel, 0.015), x, 0.03, z))
      return { g, mv: live, spin: 0, pulse: true }
    },
    'mkt-ev-battery': () => {
      /* the skateboard pack: a red tray with a machined recess and a rim, four prismatic modules standing in it,
         terminals and a busbar over them, and mounting tabs down both sides */
      const g = new THREE.Group()
      g.add(at(box(1.95, 0.28, 1.2, M.shell, 0.04), 0, 0.14, 0))
      g.add(at(box(1.76, 0.05, 1.02, M.pale, 0.02), 0, 0.29, 0))
      let live = null
      for (let i = 0; i < 4; i++) {
        const x = -0.66 + i * 0.44
        const mod = box(0.32, 0.4, 0.9, M.pale, 0.025)
        g.add(at(mod, x, 0.49, 0))
        if (i === 1) live = mod
        g.add(at(cyl(0.035, 0.035, 0.06, M.red, 18), x, 0.72, 0))
      }
      g.add(at(box(1.38, 0.035, 0.06, M.red, 0.012), 0, 0.735, 0))
      for (const s2 of [-1, 1]) for (const x of [-0.68, 0.68]) g.add(at(box(0.16, 0.06, 0.1, M.steel, 0.015), x, 0.14, s2 * 0.63))
      return { g, mv: live, spin: 0, pulse: true }
    },
    'mkt-photovoltaics': () => {
      const g = new THREE.Group()
      const array = new THREE.Group()
      array.add(at(box(1.95, 0.07, 1.2, M.shell, 0.02), 0, 0, 0))
      const face = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.06), M.cell)
      face.rotation.x = -Math.PI / 2
      face.castShadow = false; face.receiveShadow = true
      array.add(at(face, 0, 0.041, 0))
      array.rotation.z = -0.42
      array.position.y = 0.95
      g.add(array)
      const tube = cyl(0.05, 0.05, 1.8, M.steel, 24)
      tube.rotation.z = Math.PI / 2
      g.add(at(tube, 0, 0.9, 0))
      for (const x of [-0.6, 0.6]) {
        g.add(at(cyl(0.07, 0.085, 0.86, M.shell, 20), x, 0.43, 0))
        g.add(at(box(0.34, 0.06, 0.34, M.steel, 0.015), x, 0.03, 0))
      }
      const beam = cyl(0.05, 0.05, 1.3, M.steel, 18)
      beam.rotation.z = Math.PI / 2
      g.add(at(beam, 0, 0.82, 0))
      return { g, mv: array, spin: 0, tilt: true }
    },
    'mkt-district-cooling': () => {
      /* the cooling tower: a square tapered shell on its basin, louvre grilles on the faces, the fan deck ring and
         four blades on top, which are the part that turns */
      const g = new THREE.Group()
      g.add(at(box(1.62, 0.16, 1.62, M.pale, 0.03), 0, 0.08, 0))
      const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 1.3, 4), M.shell)
      shell.rotation.y = Math.PI / 4
      shell.castShadow = true; shell.receiveShadow = true
      g.add(at(keyline(shell), 0, 0.85, 0))
      for (let i = 0; i < 3; i++) {
        const y = 0.42 + i * 0.3
        const r = 0.9 - i * 0.075
        const grille = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.02, 0.09, 4), M.red)
        grille.rotation.y = Math.PI / 4
        grille.castShadow = true
        g.add(at(keyline(grille), 0, y, 0))
      }
      const deck = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.08, 4), M.pale)
      deck.rotation.y = Math.PI / 4
      deck.castShadow = true
      g.add(at(keyline(deck), 0, 1.53, 0))
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 16, 44), M.steel)
      ring.rotation.x = Math.PI / 2
      ring.castShadow = true
      g.add(at(ring, 0, 1.6, 0))
      const fan = new THREE.Group()
      for (let i = 0; i < 5; i++) {
        const blade = box(0.34, 0.02, 0.12, M.red, 0.008)
        blade.position.set(0.21, 0, 0)
        blade.rotation.z = 0.3
        const arm = new THREE.Group()
        arm.add(blade)
        arm.rotation.y = (i / 5) * Math.PI * 2
        fan.add(arm)
      }
      fan.add(at(cyl(0.07, 0.07, 0.08, M.steel, 20), 0, 0, 0))
      g.add(at(fan, 0, 1.62, 0))
      return { g, mv: fan, spin: 1.3 }
    },
    'mkt-bio-lifescience': () => {
      /* the bioreactor: a tall jacketed vessel with its rings, a shallow dished top, a conical bottom into the
         harvest valve, three legs on feet, the drive on its skirt, and the batch level in red */
      const g = new THREE.Group()
      g.add(at(cyl(0.58, 0.58, 1.18, M.shell, 48), 0, 1.04, 0))
      for (const y of [0.68, 1.42]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.595, 0.034, 12, 44), M.steel)
        ring.rotation.x = Math.PI / 2
        ring.castShadow = true
        g.add(at(ring, 0, y, 0))
      }
      const band = cyl(0.59, 0.59, 0.26, M.red, 48)
      g.add(at(band, 0, 0.86, 0))
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.58, 44, 18, 0, Math.PI * 2, 0, Math.PI / 2), M.shell)
      dome.scale.y = 0.42
      dome.castShadow = true
      g.add(at(dome, 0, 1.63, 0))
      const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.16, 0.44, 44), M.shell)
      cone.castShadow = true
      g.add(at(cone, 0, 0.23, 0))
      g.add(at(cyl(0.11, 0.11, 0.14, M.red, 24), 0, 0.0, 0))
      g.add(at(cyl(0.13, 0.17, 0.14, M.shell, 24), 0, 1.8, 0))
      g.add(at(box(0.34, 0.28, 0.34, M.steel, 0.04), 0, 1.98, 0))
      g.add(at(cyl(0.05, 0.05, 0.32, M.red, 20), 0.58, 1.18, 0.2))
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + 0.6
        const leg = cyl(0.075, 0.085, 0.52, M.steel, 18)
        leg.position.set(Math.cos(a) * 0.54, 0.26, Math.sin(a) * 0.54)
        leg.castShadow = true
        g.add(leg)
        g.add(at(cyl(0.16, 0.16, 0.05, M.dark, 20), Math.cos(a) * 0.54, 0.02, Math.sin(a) * 0.54))
      }
      return { g, mv: band, spin: 0, pulse: true }
    },
    'mkt-food-beverage': () => {
      const g = new THREE.Group()
      const belt = box(1.95, 0.14, 0.72, M.shell, 0.03)
      g.add(at(belt, 0, 0.42, 0))
      for (const z of [-0.35, 0.35]) g.add(at(box(1.97, 0.055, 0.04, M.steel, 0.015), 0, 0.51, z))
      for (let i = -2; i <= 2; i++) {
        const r = cyl(0.03, 0.03, 0.66, M.steel, 14)
        r.rotation.x = Math.PI / 2
        g.add(at(r, i * 0.38, 0.49, 0))
      }
      for (const x of [-0.82, 0.82]) {
        g.add(at(cyl(0.06, 0.07, 0.34, M.steel, 16), x, 0.17, 0))
        g.add(at(box(0.24, 0.05, 0.24, M.dark, 0.02), x, 0.02, 0))
      }
      let live = null
      for (let i = -1; i <= 1; i++) {
        const bot = new THREE.Group()
        const body = cyl(0.17, 0.17, 0.42, M.shell, 32)
        bot.add(at(body, 0, 0.22, 0))
        const sh = cyl(0.07, 0.17, 0.15, M.shell, 32)
        bot.add(at(sh, 0, 0.52, 0))
        bot.add(at(cyl(0.07, 0.07, 0.13, M.shell, 24), 0, 0.64, 0))
        bot.add(at(cyl(0.085, 0.085, 0.07, M.red, 24), 0, 0.735, 0))
        bot.position.set(i * 0.56, 0.5, 0)
        bot.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true } })
        g.add(bot)
        if (i === 0) live = bot
      }
      return { g, mv: live, spin: 0, pulse: true }
    },
  }

  /* ---- one group per tile, each on its own soft contact shadow. A flat-shaded object with no shadow floats; this
     is a single textured quad, which costs nothing and is what seats it. ---- */
  const shadowTex = (() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const x = c.getContext('2d')
    const g = x.createRadialGradient(64, 64, 4, 64, 64, 62)
    g.addColorStop(0, 'rgba(8,12,22,.55)')
    g.addColorStop(0.55, 'rgba(8,12,22,.22)')
    g.addColorStop(1, 'rgba(8,12,22,0)')
    x.fillStyle = g
    x.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(c)
  })()
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.85 })
  /* every object is normalised the way the drawn marks were fitted: scaled so its longest side is the same, centred
     over its tile in x and z, and sat on the ground at y = 0. Without this the bioreactor dwarfs the chip. */
  const TARGET = 1.7
  /* optical trim. Geometry that fits the same box does not always carry the same weight: a tilted panel reads larger
     than a rack of the same height, and a wide tray larger than a vessel. These are eye-judged against the row. */
  const TRIM = { 'mkt-semiconductor': 1.04, 'mkt-data-centre': 0.94, 'mkt-ev-battery': 1.0, 'mkt-photovoltaics': 0.88, 'mkt-district-cooling': 0.96, 'mkt-bio-lifescience': 0.95, 'mkt-food-beverage': 1.0 }
  function normalise (g, id) {
    const bb = new THREE.Box3().setFromObject(g)
    const size = new THREE.Vector3(); bb.getSize(size)
    const k = (TARGET * (TRIM[id] || 1)) / Math.max(size.y, (size.x + size.z) / 2)
    g.scale.setScalar(k)
    const bb2 = new THREE.Box3().setFromObject(g)
    const c = new THREE.Vector3(); bb2.getCenter(c)
    g.position.x -= c.x; g.position.z -= c.z; g.position.y -= bb2.min.y
  }
  const marks = ids.map(id => {
    const made = (BUILD[id] || BUILD['mkt-semiconductor'])()
    normalise(made.g, id)
    const holder = new THREE.Group()
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 2.2), shadowMat)
    plane.rotation.x = -Math.PI / 2
    plane.position.y = 0.002
    holder.add(plane)
    made.shade = plane
    made.y0 = made.g.position.y
    holder.add(made.g)
    scene.add(holder)
    return { ...made, holder, hover: 0, want: 0 }
  })

  /* ---- place each group where its tile is, in world units ---- */
  let wpp = 1 / 58, W = 1, H = 1
  function layout () {
    const r = host.getBoundingClientRect()
    W = Math.max(1, r.width); H = Math.max(1, r.height)
    renderer.setSize(W, H, false)
    const viewH = H * wpp, viewW = W * wpp
    camera.left = -viewW / 2; camera.right = viewW / 2; camera.top = viewH / 2; camera.bottom = -viewH / 2
    camera.updateProjectionMatrix()
    const stages = opts.stages ? opts.stages() : []
    marks.forEach((m, i) => {
      const s = stages[i]
      if (!s) return
      const b = s.getBoundingClientRect()
      const dx = (b.left + b.width / 2 - r.left - W / 2) * wpp
      const dy = (b.top + b.height / 2 - r.top - H / 2) * wpp
      m.holder.position.copy(RIGHT).multiplyScalar(dx).add(UP.clone().multiplyScalar(-dy))
      const k = (b.width / 96) * 0.58
      m.holder.scale.setScalar(k)
    })
  }

  /* ---- idle and hover ---- */
  const clock = new THREE.Clock()
  let raf = 0, alive = true
  function frame () {
    if (!alive) return
    raf = requestAnimationFrame(frame)
    const t = clock.getElapsedTime(), dt = Math.min(clock.getDelta(), 0.05)
    marks.forEach((m, i) => {
      m.hover += (m.want - m.hover) * Math.min(1, dt * 7)
      const g = m.g
      g.position.y = m.y0 + 0.032 * Math.sin(t * 0.55 + i * 1.3) + m.hover * 0.2
      g.rotation.y = m.hover * 0.42 + Math.sin(t * 0.18 + i) * 0.022
      if (m.shade) { m.shade.material = m.shade.material; m.shade.scale.setScalar(1 - m.hover * 0.08) }
      if (m.spin && m.mv) m.mv.rotation.y += dt * m.spin * (1 + m.hover * 2.4)
      if (m.pulse && m.mv) m.mv.position.y += (Math.sin(t * 1.4 + i) * 0.012 - (m.mv.position.y - (m.mv.userData.y0 ?? (m.mv.userData.y0 = m.mv.position.y)))) * 0.2
      if (m.tilt && m.mv) m.mv.rotation.z = -0.42 + Math.sin(t * 0.5) * 0.06 + m.hover * 0.1
    })
    renderer.render(scene, camera)
  }

  layout()
  frame()
  const ro = new ResizeObserver(() => layout())
  ro.observe(host)
  addEventListener('resize', layout)

  return {
    hover (i, on) { if (marks[i]) marks[i].want = on ? 1 : 0 },
    layout,
    destroy () {
      alive = false
      cancelAnimationFrame(raf)
      ro.disconnect(); removeEventListener('resize', layout)
      scene.traverse(o => { if (o.isMesh) { o.geometry.dispose() } })
      Object.values(M).forEach(m => m.dispose())
      pmrem.dispose(); renderer.dispose()
      canvas.remove()
    },
  }
}
