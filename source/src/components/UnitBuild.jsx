import React, { useEffect, useRef, useState } from 'react'

/* ============================================================================
   UnitBuild · 17 Sep 2026 (client, on the EPC page: "to include diagram if possible. 3D
   animation can be included in the page if possible").

   IAQ's own 3D model, as the facility building up. The share holds 116 rendered frames of it
   (3840x2160); tools/model-seq-0917.py keeps 60 of them, evenly spaced, at 1400px WebP, in
   public/assets/iaq/model-seq/00.webp .. 59.webp, with final.webp the last frame.

   The section is a runway (unit.css .un-build, 280vh); the stage inside it is sticky. The
   scroll position through the runway picks a frame, and a canvas draws it. Rules held:
     load only when the section is a viewport away (IntersectionObserver), ends first and then
       halves and quarters, so the nearest loaded frame is never far from the one wanted;
     draw on requestAnimationFrame, and only when the frame to show has changed;
     while a frame is still arriving, draw the nearest one that has, on the low side;
     the canvas is capped at device pixel ratio 2;
     nothing is decoded at 3840px, the 1400px WebPs are the only frames the page sees;
     under prefers-reduced-motion, or if the canvas cannot run, or if the first frame fails,
       the last frame shows as a still and the runway collapses (.is-still).
   ============================================================================ */

const N = 60
const DIR = '/assets/iaq/model-seq/'
const src = i => `${DIR}${String(i).padStart(2, '0')}.webp`
const STILL = DIR + 'final.webp'

/* the phases the frames show, by progress: the piles, columns, slabs and roof go up first, the
   services fill the floors, and the camera pulls back to the whole facility at the end */
const PHASE = p => (p < 0.16 ? 'Piles, structure and roof' : p < 0.93 ? 'The services, floor by floor' : 'The whole facility')

/* coarse to fine: 0 and 59, then 30, then 15 and 45, then every eighth... */
function order(n) {
  const out = [0, n - 1], seen = new Set(out)
  let step = n - 1
  while (step > 1) {
    step = Math.ceil(step / 2)
    for (let i = 0; i < n; i += step) if (!seen.has(i)) { seen.add(i); out.push(i) }
  }
  for (let i = 0; i < n; i++) if (!seen.has(i)) out.push(i)
  return out
}

export default function UnitBuild({ alt = 'IAQ’s 3D model of a facility, built up from the piles to the roof and then the services' }) {
  const root = useRef(null), stage = useRef(null), cv = useRef(null)
  const [mode, setMode] = useState('idle')   /* idle | live | still */
  const [phase, setPhase] = useState(PHASE(0))
  const [going, setGoing] = useState(false)

  useEffect(() => {
    const el = root.current, c = cv.current, sg = stage.current
    if (!el || !c || !sg) return
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = !reduce && c.getContext && c.getContext('2d')
    if (!ctx || !('IntersectionObserver' in window)) { setMode('still'); return }
    setMode('live')

    const imgs = new Array(N), loaded = new Array(N).fill(false)
    let want = 0, drawn = -1, raf = 0, dead = false, lastPhase = PHASE(0), moved = false

    const nearest = i => {
      for (let k = i; k >= 0; k--) if (loaded[k]) return k
      for (let k = i + 1; k < N; k++) if (loaded[k]) return k
      return -1
    }
    const draw = () => {
      raf = 0
      if (dead) return
      const k = nearest(want)
      if (k < 0 || k === drawn) return
      const im = imgs[k]
      const W = c.width, H = c.height
      const s = Math.min(W / im.naturalWidth, H / im.naturalHeight)
      const dw = Math.round(im.naturalWidth * s), dh = Math.round(im.naturalHeight * s)
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H)
      ctx.drawImage(im, Math.round((W - dw) / 2), Math.round((H - dh) / 2), dw, dh)
      drawn = k
      c.dataset.frame = String(k)
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw) }

    const size = () => {
      const r = sg.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr))
      if (c.width !== w || c.height !== h) {
        c.width = w; c.height = h
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h)
        drawn = -1; kick()
      }
    }

    /* progress through the runway: the stage's top moves from the section's top to (section
       height - stage height) below it while it is stuck, whatever the sticky offset is */
    const onScroll = () => {
      const r = el.getBoundingClientRect(), sr = sg.getBoundingClientRect()
      const run = r.height - sr.height
      const p = run > 0 ? Math.max(0, Math.min(1, (sr.top - r.top) / run)) : 1
      const k = Math.round(p * (N - 1))
      c.dataset.p = p.toFixed(3)
      if (k !== want) { want = k; kick() }
      const ph = PHASE(p)
      if (ph !== lastPhase) { lastPhase = ph; setPhase(ph) }
      if (!moved && p > 0.02) { moved = true; setGoing(true) }
    }

    /* the frames: fetched only once the section is a viewport away, a few at a time in the
       coarse-to-fine order, each decoded off the main thread before it is drawn */
    let started = false
    const start = () => {
      if (started) return
      started = true
      const q = order(N)
      let inflight = 0, failed = 0
      const next = () => {
        while (inflight < 6 && q.length && !dead) {
          const i = q.shift()
          inflight++
          const im = new Image()
          im.decoding = 'async'
          im.src = src(i)
          const ok = () => { imgs[i] = im; loaded[i] = true; inflight--; if (nearest(want) !== drawn) kick(); next() }
          const bad = () => { inflight--; failed++; if (i === 0 && !loaded[0]) setMode('still'); next() }
          if (im.decode) im.decode().then(ok, bad)
          else { im.onload = ok; im.onerror = bad }
        }
      }
      next()
    }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { start(); io.disconnect() } }, { rootMargin: '100% 0px 100% 0px' })
    io.observe(el)

    const ro = 'ResizeObserver' in window ? new ResizeObserver(() => { size(); onScroll() }) : null
    if (ro) ro.observe(sg)
    size(); onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', size)
    return () => {
      dead = true
      io.disconnect(); if (ro) ro.disconnect()
      window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', size)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className={'un-build' + (mode === 'live' ? ' is-live' : mode === 'still' ? ' is-still' : '') + (going ? ' is-going' : '')} ref={root}
         aria-label={alt} role="img">
      <div className="un-build-stage" ref={stage}>
        <canvas ref={cv} aria-hidden="true" />
        {/* the still: the last frame, shown under reduced motion, without a canvas, or without JS */}
        <img className="un-build-still" src={STILL} alt="" loading="lazy" decoding="async" />
        <div className="un-build-hud" aria-hidden="true">
          <span className="un-build-k">{phase}</span>
          <span className="un-build-hint">Scroll to build it</span>
        </div>
      </div>
    </div>
  )
}
