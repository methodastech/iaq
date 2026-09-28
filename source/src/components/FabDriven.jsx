import React, { useEffect, useRef, useState } from 'react'
import initFab3D, { STAGES, STAGE_COLOR } from '../scenes/fab3d.js'
import FabStage from './FabStage.jsx'
import { SYS } from '../lib/relations.jsx'
import '../styles/fab-assembly.css'
import '../styles/fab-driven.css'

/* ============================================================================
   FabDriven · IAQ's 3D fab, driven by a pick (24 Sep 2026).
   Bazil: "use my 3D to do a draft, start from the parallax 3D, but instead it shows everything in detail in that 3D
   as we select ... everything about this business we can know from there". The scene is the home page's
   (scenes/fab3d.js) in its driven mode: the whole facility stands built, nothing scrolls, and focus() lights the
   systems a pick touches while the rest grey back, with the part names of the lit systems called out on the model.
   Drag turns it, pinch or the buttons zoom, a click on a part names it. Without WebGL the frame stage stands in.
   ============================================================================ */
/* which of the model's eight systems a pick lights */
const U = { epc: ['st', 'ar', 'pu', 'fp', 'ac', 'el', 'cr', 'tl'], hookup: ['pu', 'tl'], efm: ['ac', 'el', 'fp'] }
const W = { csa: ['st', 'ar'], mep: ['ac', 'el', 'fp', 'cr'], process: ['pu'] }
const S = { design: ['st', 'ar', 'pu', 'fp', 'ac', 'el', 'cr', 'tl'], procure: ['ac', 'el', 'cr', 'tl'], construct: ['st', 'ar', 'pu', 'fp', 'ac', 'el', 'cr'], commission: ['ac', 'el', 'fp', 'cr'], maintain: ['ac', 'el', 'fp'], hookup: ['tl', 'pu'] }
const Y = [[/piling|structural/i, ['st']], [/envelope|architectural/i, ['ar', 'cr']], [/hvac|acmv|fan filter/i, ['ac', 'cr']], [/cooling water|chiller|plumbing/i, ['ac']], [/fire/i, ['fp']], [/electrical/i, ['el']], [/./, ['pu']]]
export function keysFor(sel) {
  if (!sel) return []
  const [k, id] = sel
  if (k === 'u') return U[id] || []
  if (k === 'w') return W[id] || []
  if (k === 's') return S[id] || []
  const y = SYS.find(x => x.id === id); const m = y && Y.find(([rx]) => rx.test(y.t)); return m ? m[1] : []   /* 25 Sep, midday: the tools hookup systems have no layer here */
}

export default function FabDriven({ sel, onPick }) {
  const root = useRef(null)
  const api = useRef(null)
  const [nogl, setNogl] = useState(false)
  useEffect(() => {
    const el = root.current; if (!el) return
    let stop = initFab3D(el, { driven: true }), again = null
    /* a browser can refuse a WebGL context and hand one over a moment later (the home page's scene has the same
       retry): one more try after a second, and only then the frame stage stands in */
    if (el.dataset.nogl === '1') {
      again = setTimeout(() => { delete el.dataset.nogl; stop = initFab3D(el, { driven: true }); if (el.dataset.nogl === '1') setNogl(true); else { api.current = stop; if (api.current.focus) api.current.focus(keysFor(selRef.current)) } }, 1000)
    } else api.current = stop
    return () => { if (again) clearTimeout(again); api.current = null; if (typeof stop === 'function') stop() }
  }, [])
  const selRef = useRef(sel); selRef.current = sel
  useEffect(() => { if (api.current && api.current.focus) api.current.focus(keysFor(sel)) }, [sel])
  if (nogl) return <FabStage sel={sel} onPick={onPick} />
  const lit = new Set(keysFor(sel))
  return (
    <div className={'fv' + (sel ? ' has' : '')} ref={root}>
      <div className="fab-view">
        <canvas aria-label="IAQ's 3D model of a fab. Drag to turn." />
        <div className="fab-zoom fv-zoom" role="group" aria-label="Model view controls">
          <button type="button" data-z="in" aria-label="Zoom in">+</button>
          <button type="button" data-z="out" aria-label="Zoom out">&minus;</button>
          <button type="button" data-z="reset" aria-label="Reset view">&#8634;</button>
        </div>
      </div>
      {/* the eight systems: lit ones for the pick, and each one picks its kind of work in the map */}
      <ul className="fv-legend fab-legend" aria-label="The building systems">
        {STAGES.filter(s => s.k).map(s => (
          <li key={s.k} data-k={s.k} className={lit.has(s.k) ? 'on' : sel ? 'off' : ''} style={{ '--c': STAGE_COLOR[s.k] }}>
            <button type="button" onClick={() => onPick && onPick(s.k === 'tl' ? ['s', 'hookup'] : s.k === 'pu' ? ['w', 'process'] : (s.k === 'st' || s.k === 'ar') ? ['w', 'csa'] : ['w', 'mep'])}>
              <i aria-hidden="true" /><b>{s.n}</b><span>{s.t}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
