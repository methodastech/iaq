import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './FlowIcon.jsx'
import { UNITS, SERVICES, WORK } from '../data/business.js'
import { SYS, related, sentence } from '../lib/relations.jsx'
import FabStage, { frameFor, pinsFor } from './FabStage.jsx'
import { FRAMES } from '../data/fabFrames.js'
import '../styles/fab-explorer.css'

/* ============================================================================
   FabExplorer · the first section after the hero (24 Sep 2026).
   Bazil: "the first section should show and explain all 3 units, services, type of work and system all in one go,
   in a 3D view visual of construction, and when you select, the visual reflects where we are".

   Left, the four kinds of thing IAQ's business is made of, in the Codex colours: business unit (red), service
   (azure), work (amber), system (green). Right, IAQ's own Revit model of a fab, rendered as 61 frames. Pick anything
   and three things happen: the facility builds to the moment that thing belongs to, the layers that thing touches
   are pinned on the model, and one sentence says the relation. Everything it says comes from data/codex.js, the
   same source the Codex, the slides and the unit pages read. It tours itself until touched; reduced motion, no tour.
   ============================================================================ */

/* the frames, pins and scrub live in FabStage.jsx now, shared with the Services map */
/* the service pages, by the Codex's service ids */
const SROUTE = { design: '/services/all#design', procure: '/services/all#procurement', construct: '/services/all#construction', commission: '/services/all#commissioning', maintain: '/services/all#maintenance', hookup: '/services/tool-installation' }
const TOUR = [['u', 'epc'], ['s', 'construct'], ['w', 'mep'], ['u', 'hookup'], ['s', 'hookup'], ['y', 'process:2'], ['u', 'efm'], ['s', 'maintain']]

export default function FabExplorer() {
  const [sel, setSel] = useState(null)
  const box = useRef(null)
  const touched = useRef(false)
  const seen = useRef(false)
  const loaded = useRef(false)
  const on = useMemo(() => related(sel), [sel])

  /* preload the frames once the section is near, then scrub to each target rather than cutting to it */
  useEffect(() => {
    const el = box.current; if (!el) return
    const io = new IntersectionObserver(([e]) => {
      seen.current = e.isIntersecting
      if (e.isIntersecting && !loaded.current) { loaded.current = true; FRAMES.forEach(src => { const im = new Image(); im.src = src }) }
    }, { rootMargin: '400px 0px', threshold: 0.01 })
    io.observe(el); return () => io.disconnect()
  }, [])

  /* the tour: only on screen, until the first touch, never under reduced motion */
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let i = 0
    const t = setInterval(() => { if (touched.current || !seen.current || document.hidden) return; setSel(TOUR[i % TOUR.length]); i++ }, 4200)
    const first = setTimeout(() => { if (!touched.current && seen.current) { setSel(TOUR[0]); i = 1 } }, 900)
    return () => { clearInterval(t); clearTimeout(first) }
  }, [])

  const pick = useCallback((k, id) => () => { touched.current = true; setSel(s => (s && s[0] === k && s[1] === id) ? null : [k, id]) }, [])
  const st = (k, id) => (!sel ? '' : on.has(k + '|' + id) ? ' on' : ' off') + (sel && sel[0] === k && sel[1] === id ? ' me' : '')
  const goto = sel ? (sel[0] === 'u' ? UNITS.find(u => u.id === sel[1]).route : sel[0] === 's' ? SROUTE[sel[1]] : null) : null

  return (
    <section className={'fx' + (sel ? ' has' : '')} id="what-iaq-does" aria-labelledby="fx-h" ref={box} onPointerDown={() => { touched.current = true }}>
      <div className="wrap">
        <div className="fx-head">
          <h2 id="fx-h">Everything IAQ does, <em>on one facility.</em></h2>
          <p className="fx-lede">Three business units, six services, three kinds of work and the systems they build. Pick any one, and the facility shows where it sits.</p>
        </div>
        <div className="fx-grid">
          <div className="fx-side">
            <div className="fx-grp c-u">
              <h3><i />Business unit<span>Who you buy from</span></h3>
              <div className="fx-row">
                {UNITS.map(u => (
                  <button type="button" key={u.id} className={'fx-n' + st('u', u.id)} aria-pressed={sel?.[0] === 'u' && sel?.[1] === u.id} onClick={pick('u', u.id)}>
                    <Icon name={u.icon} /><span><b>{u.short || u.name}</b><small>{u.line}</small></span>
                  </button>
                ))}
              </div>
            </div>
            <div className="fx-grp c-s">
              <h3><i />Service<span>What is in the contract</span></h3>
              <div className="fx-row fx-six">
                {SERVICES.map(s => (
                  <button type="button" key={s.id} className={'fx-n' + st('s', s.id)} aria-pressed={sel?.[0] === 's' && sel?.[1] === s.id} onClick={pick('s', s.id)}>
                    <i className="fx-no">{s.n}</i><Icon name={s.icon} /><span><b>{s.short}</b></span>
                  </button>
                ))}
              </div>
            </div>
            <div className="fx-grp c-w">
              <h3><i />Work<span>The discipline that does it</span></h3>
              <div className="fx-row">
                {WORK.map(w => (
                  <button type="button" key={w.id} className={'fx-n' + st('w', w.id)} aria-pressed={sel?.[0] === 'w' && sel?.[1] === w.id} onClick={pick('w', w.id)}>
                    <Icon name={w.icon} /><span><b>{w.name}</b><small>{w.full}</small></span>
                  </button>
                ))}
              </div>
            </div>
            <div className="fx-grp c-y">
              <h3><i />System<span>The thing being built</span></h3>
              <div className="fx-chips">
                {SYS.map(y => (
                  <button type="button" key={y.id} className={'fx-c' + st('y', y.id)} aria-pressed={sel?.[0] === 'y' && sel?.[1] === y.id} onClick={pick('y', y.id)}>{y.t}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="fx-stage">
            <FabStage sel={sel} preload={false} />
            <div className="fx-read" aria-live="polite">
              {sel ? <p>{sentence(sel)}</p> : <p className="fx-hint">Pick a business unit, a service, a kind of work or a system. The facility builds to that moment and the layers it touches light up.</p>}
              {goto && <Link className="fx-go" to={goto}>Open the page<i aria-hidden="true">&#8594;</i></Link>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
