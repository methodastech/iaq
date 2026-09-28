import React, { useCallback, useEffect, useRef, useState } from 'react'
import { VALUES } from '../data/values.js'
import '../styles/values-plate.css'

/* ------------------------------------------------------------------------
   "Six values, held on every site."  ·  the PLATE

   Built to the client's reference: one large light plate carrying a fine
   wireframe cage, a row of red marks running the FULL width of the equator,
   the index top-left, the caption bottom-left and pagination bottom-right.

   Proportions are the whole point of that reference and they are not
   negotiable: the plate is wide and generous, the sphere fills it, and the
   equator's marks run edge to edge rather than huddling in the middle.

   Fifteen marks sit on the equator. SIX of them are the values — brighter,
   larger, interactive — and the nine between them are fine measure ticks.
   That is what gives the reference its instrument quality: a scale, with
   points ON the scale, rather than six lonely dots.

   Interaction lives on the plate itself: click or hover a value mark, drag
   anywhere along the equator to scrub, and the cage drifts toward the
   pointer. The label row beneath is the same control in words, and carries
   the accessible names.
   ------------------------------------------------------------------------ */

const TICKS = 15                                  /* marks across the equator */
const VAL_AT = k => 2 + k * 2                     /* which ticks are values: 2,4,6,8,10,12 */
const TICK_X = i => 6 + (i / (TICKS - 1)) * 88    /* % across the plate, edge to edge */

export default function ValuesPlate() {
  const [live, setLive] = useState(0)
  const [drawn, setDrawn] = useState(false)

  const rootRef = useRef(null), plateRef = useRef(null), parRef = useRef(null)
  const liveRef = useRef(0), scrubbing = useRef(false), rafId = useRef(0), reduceRef = useRef(false)
  liveRef.current = live

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches
    reduceRef.current = !!reduce
    if (reduce) { setDrawn(true); return }
    const io = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) { setDrawn(true); io.disconnect() }
    }, { rootMargin: '0px 0px -18% 0px' })
    io.observe(el)
    /* never leave the cage stranded invisible: observer callbacks are throttled in a
       backgrounded tab, and an undrawn plate is just an empty grey box */
    const bail = window.setTimeout(() => setDrawn(true), 2600)
    return () => { io.disconnect(); clearTimeout(bail); if (rafId.current) cancelAnimationFrame(rafId.current) }
  }, [])

  const pick = useCallback(k => { if (k !== liveRef.current) setLive(k) }, [])

  /* RATIOS, never pixels: clientX and getBoundingClientRect are both in the zoomed
     viewport space, so their ratio is unitless and immune to the 1.12 / 1.5 / 2.1 root
     zoom. Mixing a rect with offsetWidth is what drifts; this cannot. */
  const ratioAt = useCallback(e => {
    const el = plateRef.current
    if (!el) return null
    const r = el.getBoundingClientRect()
    if (!r.width) return null
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
  }, [])

  const scrubTo = useCallback(rx => {
    let best = 0, bd = Infinity
    for (let k = 0; k < 6; k++) {
      const d = Math.abs(TICK_X(VAL_AT(k)) / 100 - rx)
      if (d < bd) { bd = d; best = k }
    }
    pick(best)
  }, [pick])

  const parallax = useCallback((rx, ry) => {
    if (reduceRef.current || rafId.current) return
    rafId.current = requestAnimationFrame(() => {
      rafId.current = 0
      const el = parRef.current
      if (!el) return
      el.style.setProperty('--px', (rx - .5).toFixed(3))
      el.style.setProperty('--py', (ry - .5).toFixed(3))
    })
  }, [])

  const onMove = e => {
    const r = ratioAt(e); if (!r) return
    parallax(r.x, r.y)
    if (scrubbing.current) scrubTo(r.x)
  }
  const onDown = e => {
    const r = ratioAt(e); if (!r) return
    scrubbing.current = true
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch (_) {}
    scrubTo(r.x)
  }
  const onUp = e => {
    scrubbing.current = false
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch (_) {}
  }
  const onLeave = e => {
    onUp(e)
    const el = parRef.current
    if (el) { el.style.setProperty('--px', '0'); el.style.setProperty('--py', '0') }
  }

  const onKey = e => {
    let n = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (liveRef.current + 1) % 6
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (liveRef.current + 5) % 6
    else if (e.key === 'Home') n = 0
    else if (e.key === 'End') n = 5
    if (n === null) return
    e.preventDefault()
    setLive(n)
    const b = document.getElementById('vp-n-' + n)
    if (b) b.focus()
  }

  const v = VALUES[live]

  return (
    <section className="vp" id="values" ref={rootRef}
             data-drawn={drawn ? '1' : '0'} style={{ '--live': live }} aria-labelledby="vpH">
      <div className="wrap">

        <div className="vp-head">
          <span className="eyebrow">What we hold</span>
          <h2 id="vpH">Six values, <em>held on every site.</em></h2>
        </div>

        <figure className="vp-plate" ref={plateRef}
                onPointerMove={onMove} onPointerDown={onDown}
                onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={onLeave}>

          <span className="vp-no" aria-hidden="true">{live + 1}</span>

          <span className="vp-par" ref={parRef} aria-hidden="true">
            <svg className="vp-art" viewBox="0 0 1200 620" fill="none"
                 preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              {/* the envelope: wider than the sphere, dashed */}
              <ellipse className="vp-env" cx="600" cy="310" rx="470" ry="238" pathLength="1" />
              {/* the cage: meridians bulging inside the sphere, each breathing on its own phase */}
              {Array.from({ length: 11 }, (_, k) => {
                const t = (k - 5) / 5
                return <ellipse key={k} className="vp-mer" cx="600" cy="310"
                                rx={Math.abs(t) * 252 + 0.5} ry="252" pathLength="1"
                                style={{ '--n': k }} />
              })}
              <circle className="vp-core" cx="600" cy="310" r="252" pathLength="1" />
              <line className="vp-eq" x1="40" y1="310" x2="1160" y2="310" pathLength="1" />
            </svg>
          </span>

          {/* the equator scale: fine ticks throughout, the six values ON the scale */}
          <span className="vp-scale">
            {Array.from({ length: TICKS }, (_, i) => {
              const k = (i - 2) % 2 === 0 ? (i - 2) / 2 : -1
              const isVal = k >= 0 && k < 6
              if (!isVal) return <i key={i} className="vp-tick" style={{ '--x': TICK_X(i) + '%' }} />
              return (
                <button type="button" key={i} className="vp-node" id={'vp-n-' + k}
                        data-on={k === live ? '1' : '0'} style={{ '--x': TICK_X(i) + '%' }}
                        aria-label={VALUES[k].title} aria-pressed={k === live}
                        onPointerEnter={e => { if (e.pointerType === 'mouse') pick(k) }}
                        onClick={() => pick(k)} onKeyDown={onKey} />
              )
            })}
            <i className="vp-mark" aria-hidden="true" style={{ '--x': TICK_X(VAL_AT(live)) + '%' }} />
          </span>

          <figcaption className="vp-cap">
            <span className="vp-ttl" key={'t' + live}>{v.title}</span>
            <span className="vp-line" key={'l' + live}>{v.line}</span>
          </figcaption>

          <span className="vp-pag" aria-hidden="true">
            {VALUES.map((val, k) => <i key={val.ix} data-on={k === live ? '1' : '0'} />)}
          </span>
        </figure>

        {/* the same control in words: scannable, and it carries the names for assistive tech */}
        <ul className="vp-legend" role="list" onKeyDown={onKey}>
          {VALUES.map((val, k) => (
            <li key={val.ix}>
              <button type="button" className="vp-leg" data-on={k === live ? '1' : '0'}
                      aria-pressed={k === live}
                      onPointerEnter={e => { if (e.pointerType === 'mouse') pick(k) }}
                      onClick={() => pick(k)}>
                <span className="vp-leg-ix">{val.ix}</span>
                <span className="vp-leg-nm">{val.title}</span>
              </button>
            </li>
          ))}
        </ul>

      </div>
    </section>
  )
}
