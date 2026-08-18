import React, { useEffect, useRef } from 'react'

/* ============================================================================
   THE GLOBAL PRESENCE GLOBE.

   The copy deck asks for "an interactive map graphic marking current + upcoming
   country presence", so this is the one place on the page that earns WebGL: a
   world you can spin, with the record pinned to it.

   HOW IT IS DRAWN: a point cloud on a sphere, not a textured ball. Points cost
   one draw call, need no image to download, and give the object its own
   material language rather than borrowing a photograph of Earth. Land is not
   simulated — the sphere is uniform, and the only geography that matters here
   is where the markers are.

   The markers are the content: solid red where IAQ holds an office, hollow
   where it has delivered. A legend says which is which, because a viewer should
   never have to infer a distinction that the business cares about.

   It is an UPGRADE, never a requirement: three.js loads only when the section
   is near, and under reduced motion or without WebGL the caption list beneath
   it carries the same facts in text.
   ========================================================================= */

/* office cities first, then the countries delivered into */
const PINS = [
  { lat: 3.07, lon: 101.52, office: true, name: 'Shah Alam · HQ' },
  { lat: 5.41, lon: 100.33, office: true, name: 'Penang' },
  { lat: 1.35, lon: 103.82, office: true, name: 'Singapore' },
  { lat: 51.05, lon: 13.74, office: true, name: 'Dresden' },
  { lat: 48.86, lon: 2.35, office: true, name: 'France' },
  { lat: 28.61, lon: 77.21, office: true, name: 'India' },
  { lat: 31.23, lon: 121.47, office: false, name: 'China' },
  { lat: 59.33, lon: 18.07, office: false, name: 'Sweden' },
  { lat: 52.23, lon: 21.01, office: false, name: 'Poland' },
  { lat: 33.57, lon: -7.59, office: false, name: 'Morocco' },
]

const R = 1
const toVec = (THREE, lat, lon, r = R) => {
  const p = (90 - lat) * Math.PI / 180
  const t = (lon + 180) * Math.PI / 180
  return new THREE.Vector3(
    -r * Math.sin(p) * Math.cos(t),
    r * Math.cos(p),
    r * Math.sin(p) * Math.sin(t),
  )
}

export default function GlobeFigure () {
  const host = useRef(null)
  const canvas = useRef(null)

  useEffect(() => {
    const box = host.current
    const cv = canvas.current
    if (!box || !cv) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let killed = false
    let teardown = () => {}

    const io = new IntersectionObserver(e => {
      if (!e.some(x => x.isIntersecting)) return
      io.disconnect()
      start()
    }, { rootMargin: '350px' })
    io.observe(box)

    async function start () {
      let THREE
      try { THREE = await import('three') } catch { return }
      if (killed) return

      let renderer
      try { renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }) } catch { return }
      renderer.setClearAlpha(0)

      const scene = new THREE.Scene()
      const world = new THREE.Group()
      scene.add(world)
      const bin = []

      /* the sphere as a field of points — one draw call, no texture to fetch */
      const N = 2600
      const pos = new Float32Array(N * 3)
      for (let i = 0; i < N; i++) {
        /* golden-angle spiral: an even spread, where random points clump at the poles */
        const y = 1 - (i / (N - 1)) * 2
        const rad = Math.sqrt(Math.max(0, 1 - y * y))
        const th = i * Math.PI * (3 - Math.sqrt(5))
        pos.set([Math.cos(th) * rad * R, y * R, Math.sin(th) * rad * R], i * 3)
      }
      const dotGeo = new THREE.BufferGeometry()
      dotGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      const dotMat = new THREE.PointsMaterial({ color: 0x8A94AA, size: .013, sizeAttenuation: true, transparent: true, opacity: .85 })
      world.add(new THREE.Points(dotGeo, dotMat))
      bin.push(dotGeo, dotMat)

      /* a whisper of a shell, so the silhouette reads as a solid body and the far-side points
         do not float free of it */
      const shellGeo = new THREE.SphereGeometry(R * .985, 48, 32)
      const shellMat = new THREE.MeshBasicMaterial({ color: 0x0B0F18, transparent: true, opacity: .55 })
      world.add(new THREE.Mesh(shellGeo, shellMat))
      bin.push(shellGeo, shellMat)

      /* the equator and one meridian: three lines are what make a ball a world */
      const ringGeo = new THREE.TorusGeometry(R * 1.001, .0022, 6, 128)
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x6C7589, transparent: true, opacity: .5 })
      const eq = new THREE.Mesh(ringGeo, ringMat); eq.rotation.x = Math.PI / 2
      const mer = new THREE.Mesh(ringGeo, ringMat)
      world.add(eq, mer)
      bin.push(ringGeo, ringMat)

      /* the markers — solid where there is an office, hollow where IAQ has delivered */
      const pinGeo = new THREE.SphereGeometry(.022, 12, 10)
      const officeMat = new THREE.MeshBasicMaterial({ color: 0xEC2027 })
      const deliverMat = new THREE.MeshBasicMaterial({ color: 0xE9EEF6, transparent: true, opacity: .82 })
      bin.push(pinGeo, officeMat, deliverMat)
      for (const p of PINS) {
        const m = new THREE.Mesh(pinGeo, p.office ? officeMat : deliverMat)
        m.position.copy(toVec(THREE, p.lat, p.lon, R * 1.012))
        world.add(m)
        if (p.office) {
          /* a stem, so an office reads as planted rather than painted on */
          const v = toVec(THREE, p.lat, p.lon, R)
          const stemGeo = new THREE.CylinderGeometry(.003, .003, .085, 6)
          const stem = new THREE.Mesh(stemGeo, officeMat)
          stem.position.copy(v.clone().multiplyScalar(1.04))
          stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize())
          world.add(stem)
          bin.push(stemGeo)
        }
      }

      const cam = new THREE.PerspectiveCamera(34, 1, .1, 100)
      cam.position.set(0, .5, 3.5)
      cam.lookAt(0, 0, 0)
      world.rotation.x = .32

      const fit = () => {
        const w = box.clientWidth, h = box.clientHeight
        if (!w || !h) return
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        renderer.setSize(w, h, false)
        cam.aspect = w / h
        cam.updateProjectionMatrix()
      }
      fit()
      const ro = new ResizeObserver(fit); ro.observe(box)

      /* drag to spin, with momentum that decays back into the idle drift */
      let spin = 0, vel = 0, dragging = false, lastX = 0
      const down = e => { dragging = true; lastX = e.clientX; vel = 0; box.setPointerCapture?.(e.pointerId) }
      const move = e => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; vel = dx * .006; spin += vel }
      const up = () => { dragging = false }
      box.addEventListener('pointerdown', down)
      box.addEventListener('pointermove', move)
      box.addEventListener('pointerup', up)
      box.addEventListener('pointerleave', up)

      let raf = 0, last = 0, visible = true
      const vis = new IntersectionObserver(e => { visible = e[0].isIntersecting }, { rootMargin: '120px' })
      vis.observe(box)

      const tick = now => {
        raf = requestAnimationFrame(tick)
        if (!visible || document.hidden) { last = now; return }
        const dt = Math.min((now - last) / 1000, .05); last = now
        if (!dragging) { vel *= .94; spin += vel + dt * .075 }
        world.rotation.y = spin
        mer.rotation.y = -spin          /* hold the meridian still against the spin */
        renderer.render(scene, cam)
        box.classList.add('is-3d')
      }
      raf = requestAnimationFrame(tick)

      teardown = () => {
        cancelAnimationFrame(raf)
        ro.disconnect(); vis.disconnect()
        box.removeEventListener('pointerdown', down)
        box.removeEventListener('pointermove', move)
        box.removeEventListener('pointerup', up)
        box.removeEventListener('pointerleave', up)
        bin.forEach(o => o.dispose && o.dispose())
        renderer.dispose()
      }
    }

    return () => { killed = true; io.disconnect(); teardown() }
  }, [])

  return (
    <div className="a2-globe" ref={host}>
      <canvas ref={canvas} aria-hidden="true" />
      <span className="a2-globe-hint" aria-hidden="true">Drag to spin</span>
    </div>
  )
}
