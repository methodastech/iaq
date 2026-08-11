import React, { useEffect, useRef, useState } from 'react'
import '../styles/tour360.css'

/* ============================================================================
   Tour360: an equirectangular walkthrough, embedded where a buyer is deciding.

   The strongest proof IAQ already owns is its 360 captures, and the plan puts
   them on project detail pages rather than scattered across the homepage.

   Three things the plan asks for and this does:
     - loads only when opened. three.js, the texture and the render loop are all
       behind the button, so a project page costs nothing extra until asked.
     - still-image fallback. Coarse pointers and reduced-motion get the poster,
       because dragging a sphere on a phone in a meeting is not the job.
     - reuses captures already taken. It wants one equirectangular JPG.

   props
     src     string  equirectangular image. Absent, the component renders the
                     labelled slot instead of a broken frame.
     poster  string  the still shown before opening, and the mobile fallback
     label   string  what the capture is of
   ============================================================================ */

export default function Tour360({ src, poster, label }) {
  const [open, setOpen] = useState(false)
  const [err, setErr] = useState(false)
  const hostRef = useRef(null)
  const stopRef = useRef(null)

  /* a coarse pointer gets the still: this is a look-around control, and it needs a pointer */
  const coarse = typeof window !== 'undefined'
    && window.matchMedia?.('(pointer: coarse), (prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (!open || !src || coarse) return
    let dead = false
    let cleanup = () => {}

    ;(async () => {
      try {
        const T = await import('three')
        if (dead) return
        const host = hostRef.current
        if (!host) return

        const W = () => host.clientWidth || 640
        const H = () => host.clientHeight || 360

        const renderer = new T.WebGLRenderer({ antialias: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
        renderer.setSize(W(), H())
        host.appendChild(renderer.domElement)

        const scene = new T.Scene()
        const camera = new T.PerspectiveCamera(72, W() / H(), 0.1, 100)
        camera.position.set(0, 0, 0.01)

        /* the sphere is turned inside out by a negative scale, so its inner face is what is seen */
        const geo = new T.SphereGeometry(10, 60, 40)
        geo.scale(-1, 1, 1)

        const tex = await new Promise((res, rej) =>
          new T.TextureLoader().load(src, res, undefined, rej))
        if (dead) { renderer.dispose(); return }
        tex.colorSpace = T.SRGBColorSpace
        const mesh = new T.Mesh(geo, new T.MeshBasicMaterial({ map: tex }))
        scene.add(mesh)

        let lon = 0, lat = 0, down = false, px = 0, py = 0, dLon = 0, dLat = 0
        const onDown = e => { down = true; px = e.clientX; py = e.clientY; dLon = lon; dLat = lat
          host.setPointerCapture?.(e.pointerId) }
        const onMove = e => { if (!down) return
          lon = dLon - (e.clientX - px) * 0.16
          lat = Math.max(-85, Math.min(85, dLat + (e.clientY - py) * 0.16)) }
        const onUp = e => { down = false; host.releasePointerCapture?.(e.pointerId) }
        host.addEventListener('pointerdown', onDown)
        host.addEventListener('pointermove', onMove)
        host.addEventListener('pointerup', onUp)
        host.addEventListener('pointercancel', onUp)

        const onKey = e => {
          if (e.key === 'ArrowLeft') { lon -= 4; e.preventDefault() }
          if (e.key === 'ArrowRight') { lon += 4; e.preventDefault() }
          if (e.key === 'ArrowUp') { lat = Math.min(85, lat + 3); e.preventDefault() }
          if (e.key === 'ArrowDown') { lat = Math.max(-85, lat - 3); e.preventDefault() }
        }
        host.addEventListener('keydown', onKey)

        const onResize = () => { camera.aspect = W() / H(); camera.updateProjectionMatrix(); renderer.setSize(W(), H()) }
        window.addEventListener('resize', onResize)

        let raf = 0
        const tick = () => {
          if (dead) return
          raf = requestAnimationFrame(tick)
          const phi = T.MathUtils.degToRad(90 - lat), theta = T.MathUtils.degToRad(lon)
          camera.lookAt(
            10 * Math.sin(phi) * Math.cos(theta),
            10 * Math.cos(phi),
            10 * Math.sin(phi) * Math.sin(theta))
          renderer.render(scene, camera)
        }
        tick()

        cleanup = () => {
          dead = true
          cancelAnimationFrame(raf)
          window.removeEventListener('resize', onResize)
          host.removeEventListener('pointerdown', onDown)
          host.removeEventListener('pointermove', onMove)
          host.removeEventListener('pointerup', onUp)
          host.removeEventListener('pointercancel', onUp)
          host.removeEventListener('keydown', onKey)
          tex.dispose(); geo.dispose(); mesh.material.dispose()
          renderer.dispose()
          if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
        }
        stopRef.current = cleanup
      } catch {
        if (!dead) setErr(true)
      }
    })()

    return () => { dead = true; try { (stopRef.current || cleanup)() } catch { /* already gone */ } }
  }, [open, src, coarse])

  /* No capture for this project yet. Say so rather than shipping a dead button. */
  if (!src) {
    return (
      <div className="pg-slot">
        <div className="pg-slot-in">
          <span className="pg-slot-tag">360&deg; walkthrough &middot; capture supplied by IAQ</span>
          <p>
            IAQ already holds 360 captures of delivered facilities. Dropping one equirectangular
            image against this project turns this block into a walkthrough, with no other change.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={'t360' + (open ? ' open' : '')}>
      <div className="t360-stage" ref={hostRef} tabIndex={open && !coarse ? 0 : -1}
           role={open && !coarse ? 'application' : undefined}
           aria-label={open && !coarse ? `360 degree view of ${label || 'the facility'}. Drag or use the arrow keys to look around.` : undefined}>
        {(!open || coarse || err) && poster && <img src={poster} alt={label || ''} loading="lazy" />}
        {!open && (
          <button type="button" className="t360-open cta" onClick={() => setOpen(true)}>
            {coarse ? 'View the capture' : 'Walk the facility'}
          </button>
        )}
      </div>
      {open && !coarse && !err && (
        <div className="t360-bar">
          <span>Drag to look around &middot; arrow keys also work</span>
          <button type="button" className="t360-close" onClick={() => setOpen(false)}>Close</button>
        </div>
      )}
      {err && <p className="pg-note">The walkthrough could not load. The still above is the same view.</p>}
    </div>
  )
}
