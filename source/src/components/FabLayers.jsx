import React, { useEffect, useRef, useState } from 'react'
import { LAYERS } from './ServicesCover.jsx'
import '../styles/services-cover.css'

/* ============================================================================
   FabLayers · IAQ's Revit fab with its nine numbered layers (24 Sep 2026, step 5 of the Services plan).
   The piece that was the right half of the Services cover, on its own now, inside the work band: the model, the
   pins in the Codex colours (work amber, the tools' service azure), one layer lit at a time with its name in the
   corner. It advances every 2.4 s while on screen, stops under the pointer, follows a hover on a pin, and lights
   every pin of a kind of work when the band tells it which one the reader is on (hot). No legend here: the three
   work cards beside it carry the systems.
   ============================================================================ */
export default function FabLayers({ hot = null, onHot }) {
  const ref = useRef(null)
  const hover = useRef(false)
  const [on, setOn] = useState(1)
  const [inView, setIn] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el || !('IntersectionObserver' in window)) { setIn(true); return }
    const io = new IntersectionObserver(([e]) => setIn(e.isIntersecting), { threshold: 0.3 })
    io.observe(el); return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!inView || hot) return
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => { if (!hover.current && !document.hidden) setOn(n => (n % LAYERS.length) + 1) }, 2400)
    return () => clearInterval(t)
  }, [inView, hot])
  const lit = LAYERS.find(l => l.n === on)
  return (
    <div ref={ref} className={'sc-head fl' + (inView ? ' in' : '') + (hot ? ' has-hot' : '')}
      onPointerEnter={() => { hover.current = true }} onPointerLeave={() => { hover.current = false; onHot && onHot(null) }}>
      <div className="sc-model">
        <span className="sc-mo"><img src="/assets/iaq/model-seq/44.webp" alt="A section through a fab in IAQ’s Revit model: roof steel, services, cleanroom, tools, sub-fab plant and piles" decoding="async" loading="lazy" /></span>
        {LAYERS.map((l, i) => (
          <button type="button" key={l.n} className={'sc-pin d-' + l.d + (l.n === on ? ' on' : '') + (hot ? (l.d === hot ? ' lit' : ' dim') : '')} style={{ left: l.x + '%', top: l.y + '%', '--i': i }}
            aria-label={l.t} aria-pressed={l.n === on} onPointerEnter={() => { setOn(l.n); onHot && onHot(l.d) }} onFocus={() => setOn(l.n)} onClick={() => setOn(l.n)}>{l.n}</button>
        ))}
        <span className={'sc-tip d-' + lit.d} key={lit.n}><i>{lit.n}</i>{lit.t}</span>
      </div>
      <p className="sc-cap">IAQ’s own Revit model of a fab. Every layer is designed, procured, built and proven by the same company. Point at a kind of work to see its layers.</p>
    </div>
  )
}
