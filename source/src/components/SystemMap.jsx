import React, { useEffect, useRef, useState } from 'react'
import { UNITS, SERVICES, WORK } from '../data/codex.js'
import { CYCLE_SVG } from '../data/cycleMarks.js'
import { LAYERS } from './ServicesCover.jsx'
import Icon from './FlowIcon.jsx'
import '../styles/services-map.css'   /* the chip palette (.sm-chip), which the Codex does not load on its own */
import '../styles/system-map.css'
import { fitMarks } from '../lib/fitMarks.js'
import { sentence, list, unitShort, BOUGHT } from '../lib/relations.jsx'

/* ============================================================================
   SystemMap · 24 Sep 2026. Bazil, pointing at the cover: "can we have a visual that can represent the services,
   the units, and the CSA, MEP, process utilities, tools hookup and everything, to understand this process".

   One chart. Across: the six services in order, with the return from 6 to 1. Down: the three units in the order a
   facility lives through them (build, equip, run), each as a bar over the services it carries (solid: always,
   dashed: when the client asks, faint: not this unit), with the work it does at the end of its row. Under it, the
   four kinds of work: who does each, and which numbered layer of the model on the cover it is.
   It tours the units on its own until touched; hover or tap anything and its relations light.
   The data is src/data/codex.js and the cover's LAYERS, the same sources everything else reads.
   ============================================================================ */

const MARK = { design: 'des', procure: 'prc', construct: 'con', commission: 'com', maintain: 'mnt', hookup: 'hok' }
const ORDER = ['epc', 'hookup', 'efm']
/* 26 Sep (Bazil: "refine this table so it looks more premium", and the colour code): units are blue, one shade per
   unit (light, blue, dark), services red, work yellow */
const UB = ['#5CBCF5', '#0B8FD8', '#1C4F9C']
const UNIT = Object.fromEntries(UNITS.map(u => [u.id, u]))
const short = u => u.short || u.name
/* the four kinds of work as the cover names them: the three disciplines, then the tools themselves */
const KINDS = [
  ...WORK.map(w => ({ id: w.id, name: w.name, full: w.full, line: w.line, k: 'w', units: UNITS.filter(u => u.work.includes(w.id)).map(u => u.id) })),
  { id: 'hookup', name: 'Tools hookup', full: 'Service 6, the tools themselves', line: 'Each production tool connected and released to production.', k: 's', units: UNITS.filter(u => u.core.includes('hookup')).map(u => u.id) },
]
const PINS = Object.fromEntries(KINDS.map(k => [k.id, LAYERS.filter(l => l.d === k.id)]))
const carries = (u, s) => u.core.includes(s) ? 'core' : u.ask.includes(s) ? 'ask' : 'off'

const svc = id => SERVICES.find(x => x.id === id)
const Fact = ({ k, children }) => <div className="sysm-rd-f"><dt>{k}</dt><dd>{children}</dd></div>
const UChips = ({ ids }) => ids.map(id => <b key={id} className="rd-u" style={{ '--ub': UB[ORDER.indexOf(id)] }}>{short(UNIT[id])}</b>)
const SChips = ({ ids }) => ids.map(id => <b key={id} className="rd-s"><i>{svc(id).n}</i>{svc(id).short}</b>)
const WChips = ({ ids }) => ids.map(id => <b key={id} className={'rd-w' + (id === 'hookup' ? ' h' : '')}>{id === 'hookup' ? 'Tools hookup' : WORK.find(x => x.id === id).name}</b>)
/* one panel per kind of selection: a head (chip and name), its line, then the facts */
function readout(sel) {
  if (!sel) return null
  const [k, id] = sel
  const head = (chip, name, sub) => <div className="sysm-rd-h">{chip}<strong>{name}</strong>{sub && <span>{sub}</span>}</div>
  if (k === 'u' || k === 'c') {
    const u = UNIT[id], r = ORDER.indexOf(id)
    const unitChip = <b className="rd-u" style={{ '--ub': UB[r] }}>Unit {u.no}</b>
    if (k === 'c') {
      const s = svc(sel[2]), kk = carries(u, s.id)
      const by = UNITS.filter(x => x.core.includes(s.id)).map(x => x.id)
      return <>{head(<b className="rd-s"><i>{s.n}</i>{s.short}</b>, s.name, short(u))}
        <p className="sysm-rd-l">{s.line}</p>
        <dl className="sysm-rd-fs">
          <Fact k={short(u)}>{kk === 'core' ? 'Carried by the unit' : kk === 'ask' ? 'Carried when you ask for it' : 'Outside this unit'}</Fact>
          {kk === 'off' && <Fact k="Carried by"><UChips ids={by} /></Fact>}
        </dl></>
    }
    const works = [...u.work, ...(u.core.includes('hookup') ? ['hookup'] : [])]
    return <>{head(unitChip, short(u), u.full)}
      <p className="sysm-rd-l">{u.line} <em>{u.term}</em></p>
      <dl className="sysm-rd-fs">
        <Fact k="Bought as">{BOUGHT[id].replace(/^./, c => c.toUpperCase())}</Fact>
        <Fact k="Carries"><SChips ids={u.core} /></Fact>
        {u.ask.length > 0 && <Fact k="When you ask"><SChips ids={u.ask} /></Fact>}
        <Fact k="Work"><WChips ids={works} /></Fact>
      </dl></>
  }
  if (k === 's') {
    const s = svc(id)
    const core = UNITS.filter(u => u.core.includes(id)).map(u => u.id), ask = UNITS.filter(u => u.ask.includes(id)).map(u => u.id)
    return <>{head(<b className="rd-s"><i>{s.n}</i>{s.short}</b>, s.name)}
      <p className="sysm-rd-l">{s.line}</p>
      <dl className="sysm-rd-fs">
        <Fact k="Carried by"><UChips ids={core} /></Fact>
        {ask.length > 0 && <Fact k="When you ask"><UChips ids={ask} /></Fact>}
        <Fact k="Bought">On its own, or with the others</Fact>
      </dl></>
  }
  if (k === 'w') {
    const w = KINDS.find(x => x.id === id)
    return <>{head(<b className={'rd-w' + (id === 'hookup' ? ' h' : '')}>{w.name}</b>, w.full)}
      <p className="sysm-rd-l">{w.line}</p>
      <dl className="sysm-rd-fs">
        <Fact k="Done by"><UChips ids={w.units} /></Fact>
        {PINS[id].length > 0 && <Fact k="In the model">{PINS[id].map(l => l.n).join(', ')}</Fact>}
      </dl></>
  }
  return <p className="sysm-rd-l">{sentence(sel)}</p>
}

/* everything lit by a selection: units, services and kinds of work */
function lit(sel) {
  const on = { u: new Set(), s: new Set(), w: new Set() }
  if (!sel) return on
  const [k, id] = sel
  if (k === 'c') {
    /* 25 Sep, midday (Bazil: "is this hoverable or something"): a cell is one unit at one service; the row and the column light */
    const u = UNIT[id]; on.u.add(id); on.s.add(sel[2]); u.work.forEach(w => on.w.add(w)); if (u.core.includes('hookup')) on.w.add('hookup')
  } else if (k === 'u') {
    const u = UNIT[id]; on.u.add(id); u.core.forEach(s => on.s.add(s)); u.ask.forEach(s => on.s.add(s))
    u.work.forEach(w => on.w.add(w)); if (u.core.includes('hookup')) on.w.add('hookup')
  } else if (k === 's') {
    on.s.add(id); UNITS.forEach(u => { if (carries(u, id) !== 'off') on.u.add(u.id) }); if (id === 'hookup') on.w.add('hookup')
  } else {
    on.w.add(id); KINDS.find(x => x.id === id).units.forEach(u => on.u.add(u)); if (id === 'hookup') on.s.add('hookup')
  }
  return on
}

/* `embed`: the chart alone, no section, heading or lede, for the Codex (24 Sep, Bazil: "any new view or system we
   build here can be updated in the Codex accordingly") */
export default function SystemMap({ embed = false }) {
  const ref = useRef(null)
  const [inView, setIn] = useState(false)
  const [sel, setSel] = useState(null)
  const [hover, setHover] = useState(false)
  const [tour, setTour] = useState(0)

  /* 25 Sep, midday (Bazil: "icons supposed to be the same size"): the six stage marks carry the same visual weight (lib/fitMarks.js) */
  useEffect(() => { let r2; const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => fitMarks(ref.current, '.sysm-mk svg')) }); return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2) } }, [])
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (!('IntersectionObserver' in window)) { setIn(true); return }
    const io = new IntersectionObserver(([e]) => setIn(e.isIntersecting), { threshold: 0.25 })
    io.observe(el); return () => io.disconnect()
  }, [])
  /* the tour: one unit after another, the bar lit and its services and work with it, until the reader touches it */
  useEffect(() => {
    if (!inView || hover) return
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setTour(i => (i + 1) % ORDER.length), 2600)
    return () => clearInterval(t)
  }, [inView, hover])

  const cur = hover ? sel : ['u', ORDER[tour]]
  const on = lit(cur)
  const has = !!cur
  const enter = s => () => { setHover(true); setSel(s) }
  const leave = () => { setHover(false); setSel(null) }
  const cls = (base, isOn) => base + (has ? (isOn ? ' lit' : ' dim') : '')

  const body = (
    <>

        <div className="sysm-grid" onMouseLeave={leave}>
          <div className="sysm-corner">Business unit</div>

          {/* 25 Sep (Bazil, on the tile matrix: "this looks worse now, we're not sure what is what, the animation before is
              better, 'when you ask' is gone"): the bars are back as they were, sweeping in; the tile version is in
              _backups/services-0926c/SystemMap.tiles-rejected.jsx */}
          {/* the process across the top */}
          <div className="sysm-proc">
            <ol className="sysm-stages">
              {SERVICES.map((s, i) => (
                <li key={s.id} className={cls('sysm-st', on.s.has(s.id))} style={{ '--c': i }}
                    onMouseEnter={enter(['s', s.id])} onFocus={enter(['s', s.id])} tabIndex={0} aria-label={`Service ${s.n}, ${s.name}`}>
                  <i className="sysm-mk" dangerouslySetInnerHTML={{ __html: CYCLE_SVG[MARK[s.id]] }} />
                  <b>{s.n}</b><span>{s.short}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="sysm-wh">Work it does</div>
          {/* 25 Sep, 09:05: under 480px the stage row keeps number and mark only (the names collided), and this line
              names the six in one wrap; hidden above that width */}
          <p className="sysm-stage-names" aria-hidden="true">{SERVICES.map(s => <span key={s.id}><b>{s.n}</b> {s.short}</span>)}</p>

          {/* one row per unit, in the order a facility lives through them */}
          {ORDER.map((id, r) => {
            const u = UNIT[id]
            return (
              <React.Fragment key={id}>
                <button type="button" className={cls('sysm-u', on.u.has(id))} style={{ '--r': r, '--ub': UB[r] }}
                        onMouseEnter={enter(['u', id])} onFocus={enter(['u', id])}>
                  <b><i>Unit {u.no}</i><Icon name={u.icon} className="sysm-ui" />{short(u)}</b>
                  <small>{u.line} <em>{u.term}</em></small>
                </button>
                <div className={cls('sysm-bar', on.u.has(id))} style={{ '--r': r, '--ub': UB[r] }} role="img"
                     aria-label={`${short(u)} carries ${u.core.map(s => SERVICES.find(x => x.id === s).short).join(', ')}${u.ask.length ? `, and ${u.ask.map(s => SERVICES.find(x => x.id === s).short).join(', ')} when asked` : ''}`}>
                  {SERVICES.map((s, c) => {
                    const k = carries(u, s.id)
                    /* 25 Sep, 08:50 (Bazil: "we cannot make it vague"): every carried cell names its service, every asked cell names it and says when; the bar and its sweep stay */
                    return <i key={s.id} className={k} style={{ '--c': c }} onMouseEnter={enter(['c', id, s.id])} title={k === 'ask' ? `${s.short}: when you ask for it` : k === 'core' ? s.name : `${s.short}: not ${short(u)}`}>{k === 'core' && <span><span className="sysm-cn">{s.n}</span><span className="sysm-ct">{s.short}</span></span>}{k === 'ask' && <em><span className="sysm-cn">{s.n}</span><span className="sysm-ct">{s.short}, when you ask</span></em>}</i>
                  })}
                </div>
                <div className={cls('sysm-w', on.u.has(id))} style={{ '--r': r }}>
                  {u.work.map(w => <span key={w} className={cls('sm-chip w', on.w.has(w))} onMouseEnter={enter(['w', w])}>{WORK.find(x => x.id === w).name}</span>)}
                  {u.core.includes('hookup') && <span className={cls('sm-chip s', on.w.has('hookup'))} onMouseEnter={enter(['w', 'hookup'])}>Tools hookup</span>}
                </div>
              </React.Fragment>
            )
          })}
        </div>

        {/* 25 Sep, midday (Bazil: "is this hoverable or something or what, try out"): whatever is under the pointer, or the
            unit the tour is on, is said in one line: a unit, a service, a kind of work, or one cell (a unit at a service) */}
        {/* 25 Sep, night (Bazil: "the way you present this info must be a lot better"): the readout was one long run-on
            sentence with a loose key under it. Now one panel: what is lit, its one line, then the facts as labelled
            chips in the house colours (units blue, services red, work yellow); the key sits at its right edge. */}
        <div className="sysm-foot">
          <div className="sysm-rd" aria-live="polite">{readout(cur)}</div>
          <ul className="sysm-key" data-reveal="">
            <li><i className="core" />Carried by the unit</li>
            <li><i className="ask" />Carried when you ask for it</li>
            <li><i className="off" />Outside this unit</li>
          </ul>
        </div>

        {/* 24 Sep, later (Bazil: "don't remove the things I want in the services that explain all 3 parts, units, services and others in one
            flow"): the four work cards stay at the foot of the chart, who does each and where it is in the model */}
        {/* the four kinds of work: who does each, and where it is in the model */}
        {/* 26 Sep: the four kinds of work have their own section on the page now (WorksBand), so the foot cards stay
            only in the Codex embed */}
        {embed && <div className="sysm-work" onMouseLeave={leave}>
          {KINDS.map((k, i) => (
            <div key={k.id} className={cls('sysm-wk', on.w.has(k.id))} style={{ '--i': i }} tabIndex={0}
                 onMouseEnter={enter(['w', k.id])} onFocus={enter(['w', k.id])}>
              <h3><span className={'sm-chip ' + k.k}>{k.name}</span>{k.full}</h3>
              <p className="sysm-wk-line">{k.line}</p>
              <p className="sysm-wk-by"><span>Done by</span>{k.units.map(id => <b key={id} className={cls('', on.u.has(id))}>{short(UNIT[id])}</b>)}</p>
              <p className="sysm-wk-in"><span>In the model</span>{PINS[k.id].map(l => <b key={l.n} className={'d-' + k.id} title={l.t}>{l.n}</b>)}</p>
            </div>
          ))}
        </div>}
    </>
  )
  if (embed) return <div ref={ref} className={'sysm sysm-embed' + (inView ? ' in' : '')} data-noab="">{body}</div>   /* data-noab: the Codex's bracket expander leaves the chart's labels alone; the names are spelt out in the work cards */
  return (
    <section ref={ref} className={'pg-sec sysm' + (inView ? ' in' : '')} aria-labelledby="sysm-h">
      <div className="pg-in">
        {/* 25 Sep (Bazil: "use 6, 3, 4", "colour code the words to their departments", "remove in one view and the commas") */}
        <h2 id="sysm-h" data-reveal=""><span className="k-s">6 services</span> <span className="k-u">3 units</span> <span className="k-w">4 works</span></h2>
        <p className="pg-lede" data-reveal="">Which unit carries which service, and the work each one does.</p>
        {body}
      </div>
    </section>
  )
}
