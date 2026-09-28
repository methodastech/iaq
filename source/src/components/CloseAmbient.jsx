import React, { useEffect, useRef } from 'react'

/* The closing band's signature (24 Aug): the campus diorama retired on client
   feedback. In its place, the thing IAQ actually sells, drawn abstractly:
   turbulent air enters from the left, crosses the filter membrane, and leaves
   as calm laminar streams. A few red tracer particles carry the brand through.
   Subtle by design: slow drift, pointer sway, and it stands down off-screen
   and under reduced motion. */

const COUNT = 2400
const FIELD_W = 15, FIELD_H = 5.6, FIELD_D = 3.2
const MEMBRANE_X = -2.2
const ROWS = 26

export default function CloseAmbient() {
  const hostRef = useRef(null)
  const cvRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current, canvas = cvRef.current
    if (!host || !canvas) return
    /* 10 Sep audit: this block sits on every page, and its static `import 'three'` made the 800K
       three.js chunk part of every page load. The library now arrives only when the closing
       block comes within reach of the viewport, and never if the visitor leaves before that. */
    let cleanup = null, dead = false
    const boot = async () => {
      let THREE
      try { THREE = await import('three') } catch (e) { return }
      if (dead) return
      cleanup = mount(THREE, host, canvas)
    }
    const pre = new IntersectionObserver(([e]) => { if (e.isIntersecting) { pre.disconnect(); boot() } }, { rootMargin: '900px 0px' })
    pre.observe(host)
    return () => { dead = true; pre.disconnect(); if (cleanup) cleanup() }
  }, [])

  function mount(THREE, host, canvas) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    } catch (e) { return }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 2, .1, 40)
    camera.position.set(0, .1, 8.4)

    /* round sprite so the points never read as squares */
    const dotTex = (() => {
      const cv = document.createElement('canvas'); cv.width = cv.height = 64
      const c = cv.getContext('2d')
      const g = c.createRadialGradient(32, 32, 2, 32, 32, 30)
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.55, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)')
      c.fillStyle = g; c.fillRect(0, 0, 64, 64)
      return new THREE.CanvasTexture(cv)
    })()

    /* the particles: x runs left to right and recycles; y settles into its row
       as the particle crosses the membrane */
    const pos = new Float32Array(COUNT * 3)
    const col = new Float32Array(COUNT * 3)
    const P = []
    const base = new THREE.Color(0x9FB2CC), calm = new THREE.Color(0xD7E2F5), red = new THREE.Color(0xEC2027)
    for (let i = 0; i < COUNT; i++) {
      const row = (Math.floor(Math.random() * ROWS) / (ROWS - 1) - .5) * FIELD_H
      const p = {
        x: (Math.random() - .5) * FIELD_W,
        rowY: row,
        z: (Math.random() - .5) * FIELD_D,
        speed: .014 + Math.random() * .02,
        phase: Math.random() * Math.PI * 2,
        freq: .6 + Math.random() * 1.3,
        amp: .28 + Math.random() * .5,
        tracer: Math.random() < .035,
      }
      P.push(p)
      const c = p.tracer ? red : base.clone().lerp(calm, Math.random() * .6)
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({
      size: .05, map: dotTex, vertexColors: true, transparent: true, opacity: .85,
      depthWrite: false, sizeAttenuation: true,
    }))
    scene.add(pts)

    /* the membrane stays invisible (24 Aug): the flow ordering itself tells the story,
       and drawn lines read as strays over the footer text */

    const smooth = v => { const t = Math.min(1, Math.max(0, v)); return t * t * (3 - 2 * t) }
    let t = 0
    const step = dt => {
      t += dt
      const a = pos
      for (let i = 0; i < COUNT; i++) {
        const p = P[i]
        p.x += p.speed * (dt * 60)
        if (p.x > FIELD_W / 2) { p.x = -FIELD_W / 2; p.phase = Math.random() * Math.PI * 2 }
        const k = smooth((p.x - MEMBRANE_X + 1.6) / 3.2)
        const wob = Math.sin(t * p.freq + p.phase) * p.amp + Math.sin(t * .7 + p.x) * .12
        a[i * 3] = p.x
        a[i * 3 + 1] = p.rowY + wob * (1 - k)
        a[i * 3 + 2] = p.z + Math.cos(t * p.freq * .8 + p.phase) * .3 * (1 - k)
      }
      geo.attributes.position.needsUpdate = true
    }

    /* pointer sway on the whole field */
    let sx = 0, sy = 0, tx = 0, ty = 0
    const sec = host.closest('.close3d') || host
    const onMove = e => {
      const r = sec.getBoundingClientRect()
      tx = ((e.clientX - r.left) / r.width - .5)
      ty = ((e.clientY - r.top) / r.height - .5)
    }
    sec.addEventListener('pointermove', onMove)

    const fit = () => {
      const w = host.clientWidth || 800, h = host.clientHeight || 420
      renderer.setSize(w, h, false)
      camera.aspect = w / h; camera.updateProjectionMatrix()
    }
    fit()
    const ro = new ResizeObserver(fit); ro.observe(host)

    let raf = 0, running = false, last = 0
    const frame = ts => {
      if (!running) return
      const dt = Math.min(.05, (ts - last) / 1000 || .016); last = ts
      step(dt)
      sx += (tx - sx) * .04; sy += (ty - sy) * .04
      scene.rotation.y = sx * .16; scene.rotation.x = sy * .08
      renderer.render(scene, camera)
      raf = requestAnimationFrame(frame)
    }
    const start = () => { if (running || reduce) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame) }
    const stop = () => { running = false; cancelAnimationFrame(raf) }

    /* one settled still for reduced motion, live only while on screen otherwise */
    step(.016); for (let i = 0; i < 220; i++) step(.016)
    renderer.render(scene, camera)
    const io = new IntersectionObserver(([e]) => { e.isIntersecting ? start() : stop() }, { threshold: .12 })
    io.observe(host)
    window.__closeAmb = 'on'

    return () => {
      stop(); io.disconnect(); ro.disconnect(); sec.removeEventListener('pointermove', onMove)
      geo.dispose(); dotTex.dispose(); renderer.dispose()
      delete window.__closeAmb
    }
  }

  return (
    <div className="close-viz" aria-hidden="true" ref={hostRef}>
      <canvas ref={cvRef}></canvas>
      <div className="close-scrim"></div>
    </div>
  )
}
