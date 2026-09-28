import React, { useEffect, useRef } from 'react'
import * as T from 'three'

/* MISSION · THE FLOW — one concept, in real time WebGL (3 Sep).

   The same world the Vision scene stands in: a blueprint plane running to a horizon, white
   massing held back in the mist, and red as the only signal colour. The concept is the one the
   flat drawing carried: leadership, employees and partners run in from the left, braid into
   ONE TEAM, that single line reaches THE CLIENT, and the benefit fans back out to the
   STAKEHOLDERS. A return line runs beneath it all, because the work is a cycle.

   Every route is a ribbon whose width is a world width, so perspective tapers it. Each node
   carries the icon it carried in the drawing, on a badge that turns to face the eye. */

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


export default function Mission3D() {
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
    scene.fog = new T.Fog(0xFFFFFF, 26, 78)
    const camera = new T.PerspectiveCamera(34, 16 / 10, 0.5, 220)
    camera.position.set(9.0, 8.0, 17.0)
    camera.lookAt(0.4, 1.1, -9.0)

    const world = new T.Group()
    scene.add(world)
    const disposables = []

    const greyMat = new T.MeshBasicMaterial({ color: 0xADBAC9, fog: true })
    const redMat = new T.MeshBasicMaterial({ color: RED, fog: true })
    const markMat = new T.MeshBasicMaterial({ color: 0x8C99AC, fog: true })
    const lineMat = new T.LineBasicMaterial({ color: 0xB9C6D6, transparent: true, opacity: 0.85, fog: true })
    disposables.push(greyMat, redMat, markMat, lineMat)

    /* ---- the plane ---- */
    const HALF_X = 30, Z_NEAR = 13, Z_FAR = -76, RUNG_GAP = 3.4
    const railPts = []
    for (let x = -HALF_X; x <= HALF_X; x += 3.4) railPts.push(x, 0, Z_NEAR, x, 0, Z_FAR)
    const railGeo = new T.BufferGeometry()
    railGeo.setAttribute('position', new T.BufferAttribute(new Float32Array(railPts), 3))
    const gridMat = new T.LineBasicMaterial({ color: 0xB9C6D6, transparent: true, opacity: 0.7, fog: true })
    world.add(new T.LineSegments(railGeo, gridMat)); disposables.push(railGeo, gridMat)
    const RUNGS = Math.ceil((Z_NEAR - Z_FAR) / RUNG_GAP) + 2
    const rungArr = new Float32Array(RUNGS * 6)
    const rungGeo = new T.BufferGeometry()
    rungGeo.setAttribute('position', new T.BufferAttribute(rungArr, 3))
    world.add(new T.LineSegments(rungGeo, gridMat)); disposables.push(rungGeo)

    /* ---- a ribbon along a curve, tapering with distance ---- */
    const flowTex = flowTexture(T)
    const flowMat = new T.MeshBasicMaterial({ map: flowTex, transparent: true, depthWrite: false, fog: true })
    disposables.push(flowTex, flowMat)

    /* fine tubes, not ribbons: the drawing's weight (3 Sep, "exactly like this but 3D") */
    function ribbon(curve, radius, mat, lift, live) {
      const g = new T.TubeGeometry(curve, 140, radius, 10, false)
      const m = new T.Mesh(g, mat); m.position.y = lift
      world.add(m); disposables.push(g)
      if (live) {
        const fg = new T.TubeGeometry(curve, 140, radius * 1.7, 10, false)
        const f = new T.Mesh(fg, flowMat); f.position.y = lift
        world.add(f); disposables.push(fg)
      }
      /* the line's shadow on the plane, as the drawing dropped it */
      const gp = []
      for (let i = 0; i <= 120; i++) { const p = curve.getPoint(i / 120); gp.push(p.x, 0.004, p.z) }
      const gg = new T.BufferGeometry()
      gg.setAttribute('position', new T.BufferAttribute(new Float32Array(gp), 3))
      world.add(new T.Line(gg, lineMat)); disposables.push(gg)
      return curve
    }

    /* ---- the flow: three in, one through, three out ---- */
    const MERGE = new T.Vector3(-1.2, 0.9, -6.0)
    const CLIENT = new T.Vector3(3.4, 1.25, -9.5)
    const SRC_Z = [3.0, -2.0, -7.0]
    const inCurves = SRC_Z.map((z, i) => new T.CatmullRomCurve3([
      new T.Vector3(-9.5, 0.30 + i * 0.06, z),
      new T.Vector3(-6.6, 0.48 + i * 0.06, z * 0.85),
      new T.Vector3(-3.8, 0.70 + i * 0.04, z * 0.45),
      MERGE.clone(),
    ], false, 'catmullrom', 0.4))
    inCurves.forEach(c => ribbon(c, 0.032, greyMat, 0.01))

    const trunk = new T.CatmullRomCurve3([MERGE.clone(), new T.Vector3(1.1, 1.08, -7.8), CLIENT.clone()], false, 'catmullrom', 0.3)
    ribbon(trunk, 0.042, redMat, 0.02, true)

    const OUT_Z = [-4.5, -10.0, -15.5]
    const outCurves = OUT_Z.map((z, i) => new T.CatmullRomCurve3([
      CLIENT.clone(),
      new T.Vector3(6.0, 1.42 + i * 0.05, (CLIENT.z + z) / 2),
      new T.Vector3(9.2, 1.58 + i * 0.05, z),
      new T.Vector3(12.0, 1.70 + i * 0.05, z - 1.5),
    ], false, 'catmullrom', 0.4))
    outCurves.forEach(c => ribbon(c, 0.028, greyMat, 0.01))

    /* the return beneath: the work is a cycle */
    const back = new T.CatmullRomCurve3([
      new T.Vector3(11.5, 0.06, -17.0), new T.Vector3(4.0, 0.06, 6.5),
      new T.Vector3(-4.0, 0.06, 8.0), new T.Vector3(-9.3, 0.06, 3.6),
    ], false, 'catmullrom', 0.4)
    const bPts = []
    for (let i = 0; i <= 150; i++) { const p = back.getPoint(i / 150); bPts.push(p.x, 0.03, p.z) }
    const bGeo = new T.BufferGeometry()
    bGeo.setAttribute('position', new T.BufferAttribute(new Float32Array(bPts), 3))
    const bMat = new T.LineDashedMaterial({ color: 0xC3CEDC, dashSize: 0.5, gapSize: 0.45, transparent: true, opacity: 0.9, fog: true })
    const bLine = new T.Line(bGeo, bMat); bLine.computeLineDistances()
    world.add(bLine); disposables.push(bGeo, bMat)

    /* ---- nodes, each with its own icon on a badge ---- */
    function glyphTexture(kind) {
      const c = document.createElement('canvas'); c.width = c.height = 160
      const x = c.getContext('2d')
      x.translate(80, 80); x.scale(5.2, 5.2)
      x.strokeStyle = '#0C1220'; x.lineWidth = 1.5; x.lineCap = 'round'; x.lineJoin = 'round'
      x.beginPath()
      if (kind === 'lead') { x.moveTo(0, -4); x.arc(0, -6.5, 2.5, 0, Math.PI * 2); x.moveTo(-6, 8); x.bezierCurveTo(-6, 0, 6, 0, 6, 8) }
      else if (kind === 'people') {
        x.moveTo(-4.5, -3); x.arc(-6.5, -5, 2, 0, Math.PI * 2)
        x.moveTo(2.5, -3); x.arc(0.5, -5, 2, 0, Math.PI * 2)
        x.moveTo(9.5, -3); x.arc(7.5, -5, 2, 0, Math.PI * 2)
        x.moveTo(-10, 7); x.bezierCurveTo(-10, 1, -3, 1, -3, 7)
        x.moveTo(-3, 7); x.bezierCurveTo(-3, 1, 4, 1, 4, 7)
        x.moveTo(4, 7); x.bezierCurveTo(4, 1, 11, 1, 11, 7)
      } else if (kind === 'partners') {
        x.moveTo(-9, 3); x.lineTo(-3, -3); x.lineTo(0, 0); x.lineTo(3, -3); x.lineTo(9, 3)
        x.moveTo(-3, -3); x.lineTo(-3, 6); x.moveTo(3, -3); x.lineTo(3, 6)
      } else if (kind === 'client') {
        x.moveTo(9, 0); x.arc(0, 0, 9, 0, Math.PI * 2); x.moveTo(3.5, 0); x.arc(0, 0, 3.5, 0, Math.PI * 2)
      } else {
        x.moveTo(-9, 0); x.lineTo(-3, 0)
        x.moveTo(-3, 0); x.lineTo(5, -6); x.moveTo(-3, 0); x.lineTo(5, 0); x.moveTo(-3, 0); x.lineTo(5, 6)
        x.moveTo(7, -6); x.arc(5, -6, 2, 0, Math.PI * 2)
        x.moveTo(7, 0); x.arc(5, 0, 2, 0, Math.PI * 2)
        x.moveTo(7, 6); x.arc(5, 6, 2, 0, Math.PI * 2)
      }
      x.stroke()
      const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4
      return tex
    }
    const badges = [], anchors = []
    function node(pos, kind, red) {
      const ringGeo = new T.TorusGeometry(0.19, 0.022, 12, 32)
      const ring = new T.Mesh(ringGeo, red ? redMat : markMat)
      ring.position.copy(pos); ring.rotation.x = Math.PI / 2
      world.add(ring); disposables.push(ringGeo)
      const stemGeo = new T.CylinderGeometry(0.016, 0.016, 1.25, 8)
      const stem = new T.Mesh(stemGeo, markMat)
      stem.position.set(pos.x, pos.y + 0.62, pos.z)
      world.add(stem); disposables.push(stemGeo)
      const tex = glyphTexture(kind)
      const bm = new T.MeshBasicMaterial({ map: tex, transparent: true, fog: true })
      const bg = new T.PlaneGeometry(0.72, 0.72)
      const badge = new T.Mesh(bg, bm)
      badge.position.set(pos.x, pos.y + 1.62, pos.z)
      world.add(badge); badges.push(badge); disposables.push(bg, bm, tex)
      const tieGeo = new T.BufferGeometry()
      tieGeo.setAttribute('position', new T.BufferAttribute(new Float32Array([pos.x, 0.004, pos.z, pos.x, pos.y, pos.z]), 3))
      world.add(new T.Line(tieGeo, lineMat)); disposables.push(tieGeo)
      anchors.push(new T.Vector3(pos.x, pos.y + 2.15, pos.z))
    }
    const SRC_ICON = ['lead', 'people', 'partners']
    SRC_Z.forEach((z, i) => node(new T.Vector3(-9.5, 0.30 + i * 0.06, z), SRC_ICON[i], false))
    node(CLIENT.clone(), 'client', true)
    node(new T.Vector3(12.0, 1.70, OUT_Z[1] - 1.5), 'stake', false)

    /* ---- the beads carrying the sequence ---- */
    const beadGeo = new T.SphereGeometry(0.062, 16, 16)
    const beads = [new T.Mesh(beadGeo, redMat), new T.Mesh(beadGeo, redMat), new T.Mesh(beadGeo, redMat)]
    beads.forEach(b => world.add(b)); disposables.push(beadGeo)

    /* ---- labels ---- */
    const pinEls = pinsRef.current ? [...pinsRef.current.querySelectorAll('.vm-pin')] : []
    const v = new T.Vector3()
    const placePins = () => {
      const r = cv.getBoundingClientRect(); if (!r.width) return
      anchors.forEach((a, i) => {
        const el = pinEls[i]; if (!el) return
        v.copy(a); world.localToWorld(v); v.project(camera)
        const back = el.classList.contains('flip') ? '-100%' : '0'
        el.style.transform = `translate(${back},-50%) translate(${((v.x * 0.5 + 0.5) * r.width).toFixed(1)}px, ${((-v.y * 0.5 + 0.5) * r.height).toFixed(1)}px)`
      })
    }

    let raf = null, visible = false, dead = false, px = 0, pxT = 0
    const resize = () => {
      const r = host.getBoundingClientRect()
      const w = Math.max(2, Math.round(r.width)), h = Math.max(2, Math.round(r.height))
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix()
    }
    const frame = ts => {
      if (dead) return
      raf = reduce ? null : requestAnimationFrame(frame)
      if (!visible && !reduce) return
      const t = reduce ? 3000 : ts
      const drift = (t * 0.0022) % RUNG_GAP
      for (let i = 0; i < RUNGS; i++) {
        const z = Z_NEAR - i * RUNG_GAP - drift, o = i * 6
        rungArr[o] = -HALF_X; rungArr[o + 1] = 0; rungArr[o + 2] = z
        rungArr[o + 3] = HALF_X; rungArr[o + 4] = 0; rungArr[o + 5] = z
      }
      rungGeo.attributes.position.needsUpdate = true
      px += (pxT - px) * 0.05
      world.rotation.y = px * 0.045
      flowTex.offset.x = reduce ? 0.3 : -(t * 0.00022) % 1
      /* three in, one across, three out */
      const ph = reduce ? 0.3 : ((t * 0.00016) % 1 + 1) % 1
      if (ph < 0.44) { const f = ph / 0.44; beads.forEach((b, i) => { b.visible = true; b.position.copy(inCurves[i].getPoint(f)); b.position.y += 0.06 }) }
      else if (ph < 0.62) { const f = (ph - 0.44) / 0.18; beads.forEach((b, i) => { b.visible = i === 0; if (i === 0) { b.position.copy(trunk.getPoint(f)); b.position.y += 0.07 } }) }
      else { const f = Math.min(1, (ph - 0.62) / 0.36); beads.forEach((b, i) => { b.visible = true; b.position.copy(outCurves[i].getPoint(f)); b.position.y += 0.06 }) }
      badges.forEach(b => b.lookAt(camera.position))
      renderer.render(scene, camera)
      placePins()
    }
    const move = e => { const r = host.getBoundingClientRect(); pxT = ((e.clientX - r.left) / r.width - 0.5) * 2 }
    const leave = () => { pxT = 0 }
    host.addEventListener('pointermove', move); host.addEventListener('pointerleave', leave)

    resize()
    const ro = new ResizeObserver(() => { resize(); if (reduce) frame(0) })
    ro.observe(host)
    let io = null
    if (reduce) { visible = true; frame(0) }
    else if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(es => {
        visible = es[0].isIntersecting
        if (visible && !raf) raf = requestAnimationFrame(frame)
        else if (!visible && raf) { cancelAnimationFrame(raf); raf = null }
      }, { threshold: 0.04 })
      io.observe(host)
    } else { visible = true; raf = requestAnimationFrame(frame) }

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
        <span className="vm-pin"><i /><b>Leadership</b></span>
        <span className="vm-pin"><i /><b>Employees</b></span>
        <span className="vm-pin"><i /><b>Partners</b></span>
        <span className="vm-pin hi flip"><b>The client</b><i /></span>
        <span className="vm-pin flip"><b>Stakeholders</b><i /></span>
      </span>
      <span className="vm-tag">The flow · three forces, one team, shared benefit</span>
    </div>
  )
}
