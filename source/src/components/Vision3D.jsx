import React, { useEffect, useRef } from 'react'
import * as T from 'three'

/* VISION · THE ROAD AHEAD — the original 2D drawing, rebuilt in real 3D (3 Sep, Bazil: "this
   looks nothing like my original futuristic 2D design, but in 3D").

   The block version is gone. This is the same composition the 2D canvas drew, given true
   depth: a blueprint plane running away to a horizon, one red road sweeping out of the near
   corner and climbing toward a point on that horizon, three milestones standing beside it.

   What makes it read as the 2D drawing rather than as a rendered object:
     · white fog, so the grid and the road dissolve into the page exactly where the 2D version
       faded its lines out. There is no visible edge to the world.
     · unlit materials. A graphic line does not take a highlight, so the red stays the flat
       signal red of the drawing at any depth.
     · the grid drifts toward the viewer continuously, which is what gave the 2D version its
       sense of moving forward.
     · the camera sits low and near the plane, so the road recedes rather than being looked
       down upon.

   IntersectionObserver-gated, fully disposed on unmount, one static frame under reduced
   motion. */

const RED = 0xEC2027

/* a bright band that travels the ribbon: the red flow reads as ALIVE rather than as a static
   line, the same way the homepage ring's comet does, but riding real geometry (3 Sep) */
function flowTexture(T) {
  const c = document.createElement('canvas')
  c.width = 512; c.height = 4
  const x = c.getContext('2d')
  const g = x.createLinearGradient(0, 0, 512, 0)
  g.addColorStop(0.00, 'rgba(255,255,255,0)')
  g.addColorStop(0.42, 'rgba(255,255,255,0)')
  g.addColorStop(0.62, 'rgba(255,150,155,0.55)')
  g.addColorStop(0.80, 'rgba(255,255,255,0.92)')
  g.addColorStop(0.88, 'rgba(255,190,193,0.5)')
  g.addColorStop(1.00, 'rgba(255,255,255,0)')
  x.fillStyle = g; x.fillRect(0, 0, 512, 4)
  const tex = new T.CanvasTexture(c)
  tex.colorSpace = T.SRGBColorSpace
  tex.wrapS = T.RepeatWrapping
  tex.wrapT = T.ClampToEdgeWrapping
  return tex
}


export default function Vision3D() {
  const hostRef = useRef(null), cvRef = useRef(null), pinsRef = useRef(null)

  useEffect(() => {
    const cv = cvRef.current, host = hostRef.current
    if (!cv || !host) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

    let renderer
    try {
      renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch (e) { host.classList.add('no3d'); return }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearAlpha(0)
    if ('outputColorSpace' in renderer) renderer.outputColorSpace = T.SRGBColorSpace

    const scene = new T.Scene()
    /* the page is white, so the world fades to white: this is the 2D drawing's fade, in depth */
    scene.fog = new T.Fog(0xFFFFFF, 26, 74)

    /* a raised three-quarter view, close to isometric: the plane is read from above and to the
       side, the way the original drawing framed it, rather than from down at floor level */
    const camera = new T.PerspectiveCamera(34, 16 / 10, 0.5, 220)
    camera.position.set(10.0, 8.4, 17.5)
    camera.lookAt(0.2, 1.5, -10.5)

    const world = new T.Group()
    scene.add(world)
    const disposables = []

    /* ---- the plane: hairlines running to the horizon, and rungs gliding toward the eye ---- */
    const HALF_X = 30, Z_NEAR = 13, Z_FAR = -80, RUNG_GAP = 3.4
    const railGeo = new T.BufferGeometry()
    const rails = []
    for (let x = -HALF_X; x <= HALF_X; x += 3.4) rails.push(x, 0, Z_NEAR, x, 0, Z_FAR)
    railGeo.setAttribute('position', new T.BufferAttribute(new Float32Array(rails), 3))
    const gridMat = new T.LineBasicMaterial({ color: 0xB9C6D6, transparent: true, opacity: 0.7, fog: true })
    world.add(new T.LineSegments(railGeo, gridMat))
    disposables.push(railGeo, gridMat)

    const RUNGS = Math.ceil((Z_NEAR - Z_FAR) / RUNG_GAP) + 2
    const rungGeo = new T.BufferGeometry()
    const rungArr = new Float32Array(RUNGS * 6)
    rungGeo.setAttribute('position', new T.BufferAttribute(rungArr, 3))
    const rungs = new T.LineSegments(rungGeo, gridMat)
    world.add(rungs); disposables.push(rungGeo)

    /* ---- the road: out of the near corner, climbing away to the horizon point ---- */
    /* a real sweep: the road leaves the near left, arcs out across the plane and turns back
       toward the horizon as it climbs. A straight run had no movement in it (3 Sep). */
    const road = new T.CatmullRomCurve3([
      new T.Vector3(-7.6, 0.06, 8.0),
      new T.Vector3(-6.2, 0.34, 3.0),
      new T.Vector3(-3.2, 0.92, -1.5),
      new T.Vector3(0.9, 1.58, -6.0),
      new T.Vector3(3.9, 2.26, -11.5),
      new T.Vector3(5.2, 2.94, -17.5),
      new T.Vector3(5.0, 3.45, -23.5),
    ], false, 'catmullrom', 0.5)
    /* A FINE LINE, as the drawing had it (3 Sep: "exactly like this but a 3D angle"). The
       ribbon, its edge rules and its pylons were weight the 2D never carried. A tube gives the
       hairline back and still carries the travelling flow along its length. */
    const roadGeo = new T.TubeGeometry(road, 240, 0.038, 10, false)
    const roadMat = new T.MeshBasicMaterial({ color: RED, fog: true })
    world.add(new T.Mesh(roadGeo, roadMat))
    disposables.push(roadGeo, roadMat)

    /* the live flow rides the same path, a touch fatter so it reads as a glow along the line */
    const flowTex = flowTexture(T)
    const flowMat = new T.MeshBasicMaterial({ map: flowTex, transparent: true, depthWrite: false, fog: true })
    const flowGeo = new T.TubeGeometry(road, 240, 0.062, 10, false)
    world.add(new T.Mesh(flowGeo, flowMat))
    disposables.push(flowGeo, flowTex, flowMat)

    /* the road's own shadow-line on the plane, exactly as the drawing dropped it */
    const groundPts = []
    for (let i = 0; i <= 200; i++) { const p = road.getPoint(i / 200); groundPts.push(p.x, 0.004, p.z) }
    const gLineGeo = new T.BufferGeometry()
    gLineGeo.setAttribute('position', new T.BufferAttribute(new Float32Array(groundPts), 3))
    const gLineMat = new T.LineBasicMaterial({ color: 0xEBC3C5, transparent: true, opacity: 0.8, fog: true })
    world.add(new T.Line(gLineGeo, gLineMat))
    disposables.push(gLineGeo, gLineMat)

    /* ---- three milestones ON the road, each carrying its own icon ----
       The line runs THROUGH each marker: a ring encircles the road at that point, a fine stem
       lifts a badge above it, and the badge carries the same glyph the 2D drawing used. The
       badge is a canvas texture so the icon stays crisp and stays in the site's line language. */
    const markMat = new T.MeshBasicMaterial({ color: 0x8C99AC, fog: true })
    const redMat = new T.MeshBasicMaterial({ color: RED, fog: true })
    disposables.push(markMat, redMat)

    function glyphTexture(kind) {
      const c = document.createElement('canvas')
      c.width = c.height = 160
      const x = c.getContext('2d')
      x.translate(80, 80); x.scale(5.2, 5.2)
      x.strokeStyle = '#0C1220'; x.lineWidth = 1.5; x.lineCap = 'round'; x.lineJoin = 'round'
      x.beginPath()
      if (kind === 'pin') {
        x.moveTo(0, 9); x.bezierCurveTo(-7, 1, -6, -8, 0, -8); x.bezierCurveTo(6, -8, 7, 1, 0, 9)
        x.moveTo(3, -2); x.arc(0, -2, 3, 0, Math.PI * 2)
      } else if (kind === 'globe') {
        x.moveTo(9, 0); x.arc(0, 0, 9, 0, Math.PI * 2)
        x.moveTo(-9, 0); x.lineTo(9, 0)
        x.moveTo(0, -9); x.bezierCurveTo(5, -4, 5, 4, 0, 9); x.bezierCurveTo(-5, 4, -5, -4, 0, -9)
      } else {
        x.moveTo(9, 0); x.arc(0, 0, 9, 0, Math.PI * 2)
        x.moveTo(4, 0); x.arc(0, 0, 4, 0, Math.PI * 2)
        x.moveTo(0, -12); x.lineTo(0, -9.5); x.moveTo(0, 9.5); x.lineTo(0, 12)
        x.moveTo(-12, 0); x.lineTo(-9.5, 0); x.moveTo(9.5, 0); x.lineTo(12, 0)
      }
      x.stroke()
      const tex = new T.CanvasTexture(c)
      tex.colorSpace = T.SRGBColorSpace
      tex.anisotropy = 4
      return tex
    }

    const anchors = [], badges = []
    const MS = [{ u: 0.20, k: 'pin' }, { u: 0.50, k: 'globe' }, { u: 0.80, k: 'target' }]
    MS.forEach((m, i) => {
      const p = road.getPoint(m.u)
      const tan = road.getTangent(m.u)
      /* the ring the road passes through */
      const ringGeo = new T.TorusGeometry(0.2, 0.022, 12, 32)
      const ring = new T.Mesh(ringGeo, markMat)
      ring.position.copy(p)
      ring.lookAt(p.clone().add(tan))
      world.add(ring); disposables.push(ringGeo)
      /* the stem and the badge above it */
      const hgt = 1.5 - i * 0.18
      const stemGeo = new T.CylinderGeometry(0.016, 0.016, hgt, 8)
      const stem = new T.Mesh(stemGeo, markMat)
      stem.position.set(p.x, p.y + hgt / 2, p.z)
      world.add(stem); disposables.push(stemGeo)
      const tex = glyphTexture(m.k)
      const badgeMat = new T.MeshBasicMaterial({ map: tex, transparent: true, fog: true })
      const badgeGeo = new T.PlaneGeometry(0.72, 0.72)
      const badge = new T.Mesh(badgeGeo, badgeMat)
      badge.position.set(p.x, p.y + hgt + 0.42, p.z)
      world.add(badge); badges.push(badge)
      disposables.push(badgeGeo, badgeMat, tex)
      /* the drop to the plane, as the drawing had */
      const tieGeo = new T.BufferGeometry()
      tieGeo.setAttribute('position', new T.BufferAttribute(new Float32Array([p.x, 0.004, p.z, p.x, p.y, p.z]), 3))
      world.add(new T.Line(tieGeo, gLineMat)); disposables.push(tieGeo)
      anchors.push(new T.Vector3(p.x, p.y + hgt + 0.92, p.z))
    })

    /* ---- the destination: a ring standing on the horizon where the road runs out ---- */
    const end = road.getPoint(1)
    const dRingGeo = new T.TorusGeometry(0.3, 0.03, 16, 44)
    const dRing = new T.Mesh(dRingGeo, redMat)
    dRing.position.copy(end)
    world.add(dRing); disposables.push(dRingGeo)
    const haloGeo = new T.RingGeometry(0.52, 0.56, 48)
    const haloMat = new T.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.4, side: T.DoubleSide, fog: true })
    const halo = new T.Mesh(haloGeo, haloMat)
    halo.position.copy(end)
    world.add(halo); disposables.push(haloGeo, haloMat)
    anchors.push(new T.Vector3(end.x, end.y + 0.62, end.z))

    /* ---- the bead that runs the road out to the horizon ---- */
    const beadGeo = new T.SphereGeometry(0.075, 16, 16)
    const bead = new T.Mesh(beadGeo, redMat)
    world.add(bead); disposables.push(beadGeo)

    /* ---- labels ride the geometry ---- */
    const pinEls = pinsRef.current ? [...pinsRef.current.querySelectorAll('.vm-pin')] : []
    const pinAnchors = [anchors[0], anchors[1], anchors[3]]
    const v = new T.Vector3()
    const placePins = () => {
      const r = cv.getBoundingClientRect()
      if (!r.width) return
      pinAnchors.forEach((a, i) => {
        const el = pinEls[i]; if (!el || !a) return
        v.copy(a); world.localToWorld(v); v.project(camera)
        /* position only: writing opacity every frame restarted its transition and pinned the
           labels at 2% forever (3 Sep) */
        const sx = (v.x * 0.5 + 0.5) * r.width, sy = (-v.y * 0.5 + 0.5) * r.height
        const back = el.classList.contains('flip') ? '-100%' : '0'
        el.style.transform = `translate(${back},-50%) translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px)`
      })
    }

    let raf = null, visible = false, dead = false, px = 0, pxT = 0
    const resize = () => {
      const r = host.getBoundingClientRect()
      const w = Math.max(2, Math.round(r.width)), h = Math.max(2, Math.round(r.height))
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const frame = ts => {
      if (dead) return
      raf = reduce ? null : requestAnimationFrame(frame)
      if (!visible && !reduce) return
      const t = reduce ? 4200 : ts
      /* the plane glides toward the viewer: the drawing is always moving forward */
      const drift = (t * 0.0022) % RUNG_GAP
      for (let i = 0; i < RUNGS; i++) {
        const z = Z_NEAR - i * RUNG_GAP - drift
        const o = i * 6
        rungArr[o] = -HALF_X; rungArr[o + 1] = 0; rungArr[o + 2] = z
        rungArr[o + 3] = HALF_X; rungArr[o + 4] = 0; rungArr[o + 5] = z
      }
      rungGeo.attributes.position.needsUpdate = true
      /* the camera leans with the pointer, the composition never breaks */
      px += (pxT - px) * 0.05
      world.rotation.y = px * 0.045
      flowTex.offset.x = reduce ? 0.3 : -(t * 0.00018) % 1
      const u = reduce ? 0.55 : ((t * 0.00012) % 1 + 1) % 1
      const bp = road.getPoint(u)
      bead.position.copy(bp)
      const s = 1 + 0.06 * Math.sin(t * 0.0016)
      dRing.scale.setScalar(s); halo.scale.setScalar(s)
      halo.material.opacity = 0.26 + 0.16 * (0.5 + 0.5 * Math.sin(t * 0.0016))
      dRing.lookAt(camera.position); halo.lookAt(camera.position)
      badges.forEach(b => b.lookAt(camera.position))
      renderer.render(scene, camera)
      placePins()
    }
    const move = e => { const r = host.getBoundingClientRect(); pxT = ((e.clientX - r.left) / r.width - 0.5) * 2 }
    const leave = () => { pxT = 0 }
    host.addEventListener('pointermove', move); host.addEventListener('pointerleave', leave)

    resize()
    frame(0)                       /* one synchronous frame: the labels are never left blank */
    const ro = new ResizeObserver(() => { resize(); if (reduce) frame(0) })
    ro.observe(host)

    let io = null
    if (!reduce && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(es => {
        visible = es[0].isIntersecting
        if (visible && !raf) raf = requestAnimationFrame(frame)
        else if (!visible && raf) { cancelAnimationFrame(raf); raf = null }
      }, { threshold: 0.04 })
      io.observe(host)
    } else if (!reduce) { visible = true; raf = requestAnimationFrame(frame) }

    return () => {
      dead = true
      if (raf) cancelAnimationFrame(raf)
      if (io) io.disconnect()
      ro.disconnect()
      host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave)
      disposables.forEach(d => d && d.dispose && d.dispose())
      renderer.dispose()
    }
  }, [])

  return (
    <div className="vm-stage vm-stage-gl" ref={hostRef}>
      <canvas ref={cvRef} />
      <span className="vm-pins" ref={pinsRef}>
        <span className="vm-pin flip"><b>1995 · Malaysia</b><i /></span>
        <span className="vm-pin"><i /><b>Today · 7 countries</b></span>
        <span className="vm-pin hi flip"><b>Ahead · the region</b><i /></span>
      </span>
      <span className="vm-tag">The road ahead · from Malaysia to the region</span>
    </div>
  )
}
