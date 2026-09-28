import React, { useEffect, useRef, useState } from 'react'
import Icon from './FlowIcon.jsx'
import IsoIcon from './IsoIcon.jsx'
const ISO_U = { epc: 'epc', hookup: 'hookupUnit', efm: 'efm' }
import { UNITS, SERVICES, WORK } from '../data/business.js'
import { SYS, MODELS, sentence } from '../lib/relations.jsx'
import '../styles/one-flow.css'

/* ============================================================================
   OneFlow · the flow diagram of IAQ's business, one unit at a time (24 Sep 2026).
   Bazil: "the things in the services that explain all 3 parts, units, services and others in one flow ... create
   diagram". Five stations, left to right, joined by chevrons: the business unit, how it is bought, the services in
   the contract, the work on site, the systems that work builds. Pick a unit (or let it turn) and the chips it owns
   light along the row, the rest fade, and one sentence reads the row. The relationship map under it is the full
   picture; this is the flow. Data: business.js and lib/relations.jsx, the same as the map, the Codex and the pages.
   ============================================================================ */
const STATION = [
  ['u', 'Business unit', 'who you buy from'],
  ['m', 'Bought as', 'how the contract runs'],
  ['s', 'Services', 'what is in the contract'],
  ['w', 'Work', 'the discipline that does it'],
  ['y', 'Systems', 'what gets built'],
]

export default function OneFlow() {
  const [uid, setUid] = useState('epc')
  const touched = useRef(false)
  const seen = useRef(false)
  const box = useRef(null)
  useEffect(() => {
    const el = box.current; if (!el) return
    const io = new IntersectionObserver(([e]) => { seen.current = e.isIntersecting }, { threshold: .4 })
    io.observe(el)
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => io.disconnect()
    let i = 0
    const t = setInterval(() => { if (touched.current || !seen.current || document.hidden) return; i = (i + 1) % UNITS.length; setUid(UNITS[i].id) }, 4600)
    return () => { io.disconnect(); clearInterval(t) }
  }, [])
  const u = UNITS.find(x => x.id === uid)
  const pick = id => () => { touched.current = true; setUid(id) }
  const svcState = s => u.core.includes(s.id) ? 'on' : u.ask.includes(s.id) ? 'ask' : 'off'
  return (
    <div className="of" ref={box} onPointerDown={() => { touched.current = true }}>
      <div className="of-tabs" role="tablist" aria-label="Business unit">
        {UNITS.map((x, i) => (
          <button type="button" key={x.id} role="tab" aria-selected={x.id === uid} className={x.id === uid ? 'on' : undefined} onClick={pick(x.id)} onMouseEnter={pick(x.id)}>
            <i>Unit {i + 1}</i><IsoIcon name={ISO_U[x.id]} className="of-iso" /><b>{x.short || x.name}</b><small>{x.line}</small>
          </button>
        ))}
      </div>
      <div className="of-row" key={uid}>
        {STATION.map(([k, name, sub], i) => (
          <React.Fragment key={k}>
            {i > 0 && <span className="of-chev" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5l7 7-7 7" /></svg></span>}
            <div className={'of-st k-' + k}>
              <h4><i />{name}<span>{sub}</span></h4>
              <div className="of-chips">
                {k === 'u' && <span className="of-chip on"><Icon name={u.icon} />{u.short || u.name}</span>}
                {k === 'm' && MODELS[uid].map(m => <span className="of-chip on" key={m}>{m}</span>)}
                {k === 's' && SERVICES.map(s => <span className={'of-chip ' + svcState(s)} key={s.id}><b>{s.n}</b>{s.short}</span>)}
                {k === 'w' && WORK.map(w => <span className={'of-chip ' + (u.work.includes(w.id) ? 'on' : 'off')} key={w.id}>{w.name}</span>)}
                {k === 'y' && SYS.map(y => <span className={'of-chip sm ' + (u.work.includes(y.work) ? 'on' : 'off')} key={y.id}>{y.t}</span>)}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
      <p className="of-read" aria-live="polite" key={'r' + uid}>{sentence(['u', uid])}</p>
      <p className="of-key"><span><i className="on" />always carried</span><span><i className="ask" />when you ask for it</span><span><i className="off" />not this unit</span></p>
    </div>
  )
}
