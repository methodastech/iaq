import React, { useEffect, useRef, useState } from 'react'
import { WORK, UNITS, SERVICES } from '../data/business.js'
import { LAYERS } from './ServicesCover.jsx'
import Icon from './FlowIcon.jsx'
import { HOOK_WORK, does } from '../lib/relations.jsx'
import '../styles/works-band.css'

/* ============================================================================
   WorksBand · 26 Sep 2026. Bazil, after the six-service cycle: "after this should be four works, and detail them".
   The four kinds of work as the Codex names them: the three disciplines from data/business.js (CSA, MEP, process
   utilities) and tools hookup, service 6, the tools themselves. Each card: the flat mark, the name spelt out, the one
   line, the systems it covers (the same list the facility map draws), the units that do it, and where it sits in the
   numbered model on the cover. Colour code: work black, units blue, services red, systems green.
   ============================================================================ */
/* 25 Sep, midday: the fourth kind of work comes from lib/relations.jsx (HOOK_WORK), the same source the facility map reads */
const KINDS = [
  ...WORK.map(w => ({ ...w, k: 'w', units: UNITS.filter(u => does(u, w.id)) })),
  { ...HOOK_WORK, units: UNITS.filter(u => does(u, 'hookup')) },
]
const PINS = Object.fromEntries(KINDS.map(k => [k.id, LAYERS.filter(l => l.d === k.id)]))
const UB = { epc: '#5CBCF5', hookup: '#0B8FD8', efm: '#1C4F9C' }
const short = u => u.short || u.name

function useInView(threshold = 0.18) {
  const ref = useRef(null)
  const [inView, setIn] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (!('IntersectionObserver' in window)) { setIn(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIn(true); io.disconnect() } }, { threshold })
    io.observe(el); return () => io.disconnect()
  }, [threshold])
  return [ref, inView]
}

export default function WorksBand({ embed = false }) {   /* embed: the Codex shows the cards without the section head */
  const [ref, inView] = useInView()
  return (
    <section ref={ref} className={'pg-sec sm-works' + (embed ? ' sm-works-embed' : '') + (inView ? ' in' : '')} aria-labelledby="sm-works-h">
      <div className="pg-in">
        <h2 id="sm-works-h" className="kind-h k-w" data-reveal=""><Icon name="helmet" className="kind-ic" />4 works</h2>
        <p className="pg-lede" data-reveal="">The work inside every service: three disciplines and the tools themselves, with the systems each one covers.</p>
        <div className="wk-grid">
          {KINDS.map((k, i) => (
            <article key={k.id} className={'wk-card k-' + k.k} data-reveal="" style={{ '--i': i }}>
              <div className="wk-head">
                <span className="wk-ic" aria-hidden="true"><Icon name={k.icon} /></span>
                <h3>{k.name}<small>{k.full}</small></h3>
              </div>
              <p className="wk-line">{k.line}</p>
              <div className="wk-row">
                <span className="wk-k">Systems</span>
                <ul className="wk-sys">{k.systems.map(t => <li key={t}>{t}</li>)}</ul>
              </div>
              <div className="wk-row">
                <span className="wk-k">Done by</span>
                <span className="wk-units">{k.units.map(u => <b key={u.id} style={{ '--ub': UB[u.id] }}>{short(u)}</b>)}</span>
              </div>
              <div className="wk-row">
                <span className="wk-k">In the model</span>
                <span className="wk-pins">{PINS[k.id].map(l => <b key={l.n} className={'p-' + k.k} title={l.t}>{l.n}</b>)}</span>
              </div>
            </article>
          ))}
        </div>
        {/* 25 Sep, night (Bazil: "give a reasoning why hookup is here even though it's part of service"): hookup is service 6
            AND a kind of work. Said once, under the four, so the three discipline cards keep their own height */}
        <p className="wk-why" data-reveal=""><span className="wk-why-ic" aria-hidden="true"><Icon name={HOOK_WORK.icon} /></span><b>Why tools hookup is one of the four works</b><span>{HOOK_WORK.why}</span></p>
      </div>
    </section>
  )
}
