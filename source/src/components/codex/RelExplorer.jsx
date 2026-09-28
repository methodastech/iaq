import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Icon from '../FlowIcon.jsx'
import { UNITS, SERVICES, WORK } from '../../data/business.js'
import { abbrNodes } from '../../lib/abbr.js'
import { CYCLE_SVG } from '../../data/cycleMarks.js'
import IsoIcon, { isoForSystem } from '../IsoIcon.jsx'
const ISO_S = { design: 'design', procure: 'procure', construct: 'construct', commission: 'commission', maintain: 'maintain', hookup: 'hookup' }
const ISO_U = { epc: 'epc', hookup: 'hookupUnit', efm: 'efm' }

/* 24 Sep (Bazil: "I need visual representing this", then, of pictures on the nodes: "not in the diagram"): the nodes stay
   clean cards (the services keep their isometric marks, the systems an icon each). The picture of whatever is picked
   shows in the reading panel under the map: a unit's photograph, a discipline's BIM render, a system's layer render,
   a service's mark. Thumbs in public/assets/iaq/thumbs. */
const SVC_MARK = { design: 'des', procure: 'prc', construct: 'con', commission: 'com', maintain: 'mnt', hookup: 'hok' }
const UNIT_PIC = { epc: '/assets/iaq/thumbs/u-epc.webp', hookup: '/assets/iaq/thumbs/u-hookup.webp', efm: '/assets/iaq/thumbs/u-efm.webp' }
const WORK_PIC = { csa: '/assets/iaq/thumbs/bim-str.webp', mep: '/assets/iaq/thumbs/bim-acmv.webp', process: '/assets/iaq/thumbs/bim-process.webp' }
const SYS_PIC = [[/piling|structural/i, 'bim-str'], [/envelope/i, 'bim-cleanroom'], [/architectural/i, 'bim-archi'], [/hvac|acmv|cooling water|chiller|plumbing/i, 'bim-acmv'], [/fire/i, 'bim-fps'], [/electrical/i, 'bim-elec'], [/./, 'bim-process']]
export const visFor = sel => {
  if (!sel) return null
  const [k, id] = sel
  if (k === 'u') return { src: UNIT_PIC[id], cap: 'IAQ on site' }
  if (k === 'w') return { src: WORK_PIC[id] || '/assets/iaq/thumbs/bim-hookup.webp', cap: id === 'hookup' ? 'IAQ\u2019s BIM model, the tools hooked up' : 'IAQ\u2019s BIM model, this layer' }
  if (k === 'y') { const y = sysOf(id); const m = SYS_PIC.find(([rx]) => rx.test(y.t)); return { src: m ? '/assets/iaq/thumbs/' + m[1] + '.webp' : '/assets/iaq/thumbs/bim-hookup.webp', cap: m ? 'IAQ\u2019s BIM model, this layer' : 'IAQ\u2019s BIM model, the tools hooked up' } }
  if (k === 's' && id === 'hookup') return { src: '/assets/iaq/thumbs/bim-hookup.webp', cap: 'IAQ\u2019s BIM model, the tools hooked up' }
  return { mark: SVC_MARK[id], cap: 'Service ' + SERVICES.find(x => x.id === id).n }
}
/* 25 Sep: one drawn mark per system (FlowIcon sys*) */
const SYS_ICON = [[/to each tool|release to production/i, 'link'], [/piling/i, 'sysPiles'], [/structural/i, 'sysFrame'], [/envelope/i, 'sysEnvelope'], [/architectural/i, 'sysFinish'], [/hvac|acmv|air conditioning/i, 'sysAir'], [/cooling water/i, 'sysPcw'], [/chiller|district/i, 'sysChiller'], [/fire/i, 'sysFire'], [/electrical/i, 'sysElec'], [/plumbing/i, 'sysPlumb'], [/clean dry air/i, 'sysCda'], [/gases|chemical/i, 'sysGas'], [/ultrapure/i, 'sysUpw'], [/vacuum|exhaust/i, 'sysVac'], [/waste/i, 'sysWaste']]
/* the kind colours the ribbons run between (s service, u unit, w work, y system) and a safe id for a gradient */
const KC = { s: '#EC2027', u: '#0B8FD8', w: '#231F20', y: '#0FA968' }
const gid = p => (p.a + '-' + p.b).replace(/[^a-z0-9]+/gi, '_')
export const sysIcon = t => (SYS_ICON.find(([rx]) => rx.test(t)) || [null, 'particle'])[1]
import { SYS, related, sentence, MODELS, BOUGHT, list, isShort, unitShort, TOUR, WORK4, SYS_ALL, does, sysOf } from '../../lib/relations.jsx'

/* ============================================================================
   RelExplorer · section 2 of the Codex, for professionals (18 Sep 2026).

   Bazil: "know its relationship". Four columns that each hold one kind of thing, in the Codex colours:
     services (azure) · business units (red, with their delivery models inside, ink) · work (amber) · systems (green)
   Every relation is a line between neighbouring columns, so nothing is drawn through anything:
     a unit carries services (solid, or dashed when carried only when the client asks), does work, and each
     discipline holds its systems. Pick anything and its chain lights, and one sentence says it in words.
   It tours itself until the reader touches it; reduced motion, no tour. Phones stack the columns, no lines.
   18 Sep, Bazil "clearer, no overlapping": only the lit chain is drawn, each line lands on its own port (the ports
   of a card spread along its edge in the order of the other ends, so lines leaving one card never cross there),
   lines are measured from the grid the SVG sits in, not the outer frame, and a lit line is solid, so a dash only
   ever means "carried when the client asks".
   The data is src/data/codex.js, the same source the slides and the unit pages read.
   ============================================================================ */

/* value: a pick made outside (the building's pins); onSelect: every change of the pick, for the building above */
/* read: false leaves the reading panel to the caller (the Services page draws it beside the 3D) */
/* only: the kinds shown, e.g. ['w', 'y'] (25 Sep, version 2 of the Services banner: "no need the business unit",
   "remove services as well", "tools hookup will have a dedicated section"); the Codex keeps all four */
export default function RelExplorer({ value, onSelect, read = true, tour = false, onTouch, only = null } = {}) {
  const show = k => !only || only.includes(k)
  const WL = only ? WORK : WORK4, YL = only ? SYS : SYS_ALL
  const box = useRef(null)
  const nodes = useRef({})
  const [sel, setSel] = useState(null)
  const cols = useRef(null)
  const [geo, setGeo] = useState(null)
  const [wide, setWide] = useState(true)
  const touched = useRef(false)
  const seen = useRef(false)
  const on = useMemo(() => related(sel), [sel])
  useEffect(() => { if (value !== undefined && value !== null) { touched.current = true; setSel(value) } }, [value])
  useEffect(() => { if (onSelect) onSelect(sel) }, [sel, onSelect])

  const edges = useMemo(() => {
    const e = []
    UNITS.forEach(u => {
      u.core.forEach(s => e.push({ a: 's|' + s, b: 'u|' + u.id, kind: 's' }))
      u.ask.forEach(s => e.push({ a: 's|' + s, b: 'u|' + u.id, kind: 's', ask: true }))
      /* 25 Sep, midday: the fourth kind of work (tools hookup) and its three systems, through `does` */
      WORK4.forEach(w => { if (does(u, w.id)) e.push({ a: 'u|' + u.id, b: 'w|' + w.id, kind: 'w' }) })
    })
    YL.forEach(y => e.push({ a: 'w|' + y.work, b: 'y|' + y.id, kind: 'y' }))
    return only ? e.filter(ed => show(ed.a[0]) && show(ed.b[0])) : e
  }, [])

  const measure = useCallback(() => {
    const el = cols.current
    if (!el) return
    const isWide = window.matchMedia('(min-width: 981px)').matches
    setWide(isWide)
    if (!isWide) { setGeo(null); return }
    /* the page carries a CSS zoom: rects are painted pixels, the SVG draws in CSS pixels, so divide.
       The origin is the grid (.rx-cols) the SVG fills, never the outer frame with its headings and padding. */
    const r = el.getBoundingClientRect(), z = r.width / el.offsetWidth || 1
    const g = {}
    Object.entries(nodes.current).forEach(([k, n]) => {
      if (!n) return
      const q = n.getBoundingClientRect()
      g[k] = { l: (q.left - r.left) / z, r: (q.right - r.left) / z, t: (q.top - r.top) / z, b: (q.bottom - r.top) / z }
    })
    setGeo(g)
  }, [])

  /* only the lit chain is drawn. Each card spreads its lines along its edge, ordered by where the other end sits,
     so two lines never share a point and never cross where they leave or land. */
  const paths = useMemo(() => {
    if (!geo || !sel) return []
    const vis = edges.filter(ed => on.has(ed.a) && on.has(ed.b) && geo[ed.a] && geo[ed.b])
    const mid = k => (geo[k].t + geo[k].b) / 2
    const ports = {}
    const add = (key, side, ed, other) => { (ports[key + side] = ports[key + side] || []).push({ ed, o: mid(other) }) }
    vis.forEach(ed => { add(ed.a, 'r', ed, ed.b); add(ed.b, 'l', ed, ed.a) })
    const at = new Map()
    Object.entries(ports).forEach(([ks, arr]) => {
      const key = ks.slice(0, -1), side = ks.slice(-1), b = geo[key]
      arr.sort((m, n) => m.o - n.o)
      const h = b.b - b.t, pad = Math.min(14, h * .2), span = h - pad * 2
      arr.forEach((p, i) => at.set(side + p.ed.a + '>' + p.ed.b, arr.length === 1 ? b.t + h / 2 : b.t + pad + span * (i + .5) / arr.length))
    })
    return vis.map(ed => {
      const p = { x: geo[ed.a].r, y: at.get('r' + ed.a + '>' + ed.b) }, q = { x: geo[ed.b].l, y: at.get('l' + ed.a + '>' + ed.b) }
      const dx = (q.x - p.x) * .5
      return { ...ed, p, q, d: `M${p.x} ${p.y} C${p.x + dx} ${p.y},${q.x - dx} ${q.y},${q.x} ${q.y}` }
    })
  }, [geo, sel, on, edges])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(() => measure())
    if (cols.current) ro.observe(cols.current)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [measure])

  /* the self tour: only while on screen, never after the reader has touched it, never under reduced motion */
  /* 25 Sep, night (Bazil: "shouldn't move automatically unless you play it"): the tour runs only while `tour` is true,
     which the play button in the model's tools sets; a touch hands the map back to the reader */
  useEffect(() => {
    const el = box.current
    if (!tour || !el || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return
    touched.current = false
    const TT = only ? [['w', 'csa'], ['w', 'mep'], ['w', 'process'], ['y', YL[4] ? YL[4].id : 'mep:0']] : TOUR
    let i = 0
    const io = new IntersectionObserver(([e]) => {
      seen.current = e.isIntersecting
      if (e.isIntersecting && i === 0 && !touched.current) { setSel(TT[0]); i = 1 }
    }, { threshold: .35 })
    io.observe(el)
    const t = setInterval(() => {
      if (touched.current || !seen.current || document.hidden) return
      setSel(TT[i % TT.length]); i++
    }, 3400)
    return () => { io.disconnect(); clearInterval(t) }
  }, [tour])

  const pick = (k, id) => () => { touched.current = true; if (onTouch) onTouch(); setSel(s => (s && s[0] === k && s[1] === id) ? null : [k, id]) }
  const hover = (k, id) => () => { if (touched.current) return; setSel([k, id]) }
  const st = (k, id) => (!sel ? '' : on.has(k + '|' + id) ? ' on' : ' off') + (sel && sel[0] === k && sel[1] === id ? ' me' : '')
  const ref = key => el => { nodes.current[key] = el }

  return (
    <div className={'rx' + (sel ? ' has' : '') + (only ? ' rx-only rx-n' + only.length : '')} ref={box} onPointerDown={() => { touched.current = true; if (onTouch) onTouch() }}>
      {/* 25 Sep (Bazil: "should have icon for each"): the four heads carry a mark, not only a dot */}
      <div className="rx-heads" aria-hidden="true">
        {show('s') && <span className="c-s"><i /><Icon name="cycle" />Service</span>}{show('u') && <span className="c-u"><i /><Icon name="epcUnit" />Business unit</span>}{show('w') && <span className="c-w"><i /><Icon name="helmet" />Work</span>}{show('y') && <span className="c-y"><i /><Icon name="sysPlumb" />System</span>}
      </div>
      <div className="rx-cols" ref={cols}>
        {wide && (
          <svg className="rx-lines" aria-hidden="true">
            {/* 25 Sep (Bazil, on a Sankey reference: "can it be used at the banner, not this thick"): each connector is a thin
                ribbon, a soft wide pass under a 3px core. 25 Sep, midday (Bazil: "the line got worse with dual colours"): one
                colour per line, the colour of its relation kind: service links red, work links amber, system links green;
                the end dots the same colour */}
            {paths.map(p => (
              <g key={p.a + '>' + p.b} className={'rx-e rx-rib k-' + p.kind + (p.ask ? ' ask' : '')}>
                <path className="rx-rib-soft" d={p.d} />
                <path className="rx-rib-core" d={p.d} />
                <circle cx={p.p.x} cy={p.p.y} r="3" style={{ fill: KC[p.kind] }} /><circle cx={p.q.x} cy={p.q.y} r="3" style={{ fill: KC[p.kind] }} />
              </g>
            ))}
          </svg>
        )}
        {show('s') && <div className="rx-col rx-s" role="group" aria-label="Services">
          {SERVICES.map(s => (
            <button type="button" key={s.id} ref={ref('s|' + s.id)} className={'rx-n n-s' + st('s', s.id)} aria-pressed={!!(sel && sel[0] === 's' && sel[1] === s.id)} onClick={pick('s', s.id)} onMouseEnter={hover('s', s.id)}>
              <i className="rx-no">{s.n}</i><Icon name={s.icon} className="rx-fi" /><span>{s.name}</span>
            </button>
          ))}
        </div>}
        {show('u') && <div className="rx-col rx-u" role="group" aria-label="Business units">
          {UNITS.map(u => (
            <button type="button" key={u.id} ref={ref('u|' + u.id)} className={'rx-n n-u' + st('u', u.id)} aria-pressed={!!(sel && sel[0] === 'u' && sel[1] === u.id)} onClick={pick('u', u.id)} onMouseEnter={hover('u', u.id)}>
              <span className="rx-u-top"><Icon name={u.icon} className="rx-fi rx-fi-u" /><i>Unit {u.no}</i></span>
              <b>{u.name}</b>
              <small className="rx-u-full">({u.short || u.full})</small>
              <span className="rx-u-line">{u.line}</span>
              <span className="rx-models">{MODELS[u.id].map(m => <em key={m} title={m === 'EPCC' ? 'Engineering, Procurement, Construction and Commissioning' : m === 'EPCM' ? 'Engineering, Procurement and Construction Management' : undefined}>{m}</em>)}</span>
            </button>
          ))}
        </div>}
        {show('w') && <div className="rx-col rx-w" role="group" aria-label="Work">
          {WL.map(w => (
            <button type="button" key={w.id} ref={ref('w|' + w.id)} className={'rx-n n-w' + (w.k === 's' ? ' n-w-s' : '') + st('w', w.id)} aria-pressed={!!(sel && sel[0] === 'w' && sel[1] === w.id)} onClick={pick('w', w.id)} onMouseEnter={hover('w', w.id)}>
              <Icon name={w.icon} className="rx-fi" /><span><b>{w.name}</b><small>{isShort(w.name) ? '(' + w.full + ')' : w.full}</small></span>
            </button>
          ))}
        </div>}
        {show('y') && <div className="rx-col rx-y" role="group" aria-label="Systems">
          {YL.map(y => (
            <button type="button" key={y.id} ref={ref('y|' + y.id)} className={'rx-n n-y' + st('y', y.id)} aria-pressed={!!(sel && sel[0] === 'y' && sel[1] === y.id)} onClick={pick('y', y.id)} onMouseEnter={hover('y', y.id)}>
              <Icon name={sysIcon(y.t)} className="rx-fi rx-fi-y" /><span>{y.t}</span>
            </button>
          ))}
        </div>}
      </div>
      {/* 18 Sep: print and the PDF can't click, so the same relations print as two tables */}
      <div className="rx-print">
        <table>
          <thead><tr><th>Business unit</th><th>Bought as</th><th>Services it carries</th><th>Only when the client asks</th><th>Its work</th></tr></thead>
          <tbody>{UNITS.map(u => (
            <tr key={u.id}>
              <td><b>{u.name}</b>{u.short ? ' (' + u.short + ')' : u.full ? ' (' + u.full + ')' : ''}</td>
              <td>{abbrNodes(BOUGHT[u.id].replace(/^a /, 'A '))}</td>
              <td>{list(u.core.map(s => SERVICES.find(x => x.id === s).name))}</td>
              <td>{u.ask.length ? list(u.ask.map(s => SERVICES.find(x => x.id === s).name)) : 'None'}</td>
              <td>{abbrNodes(list(WORK4.filter(w => does(u, w.id)).map(w => w.name)))}</td>
            </tr>
          ))}</tbody>
        </table>
        <table>
          <thead><tr><th>Work</th><th>The systems inside it</th></tr></thead>
          <tbody>{WORK4.map(w => (
            <tr key={w.id}><td><b>{w.name}</b> {isShort(w.name) ? '(' + w.full + ')' : ''}</td><td>{list(SYS_ALL.filter(y => y.work === w.id).map(y => y.t))}</td></tr>
          ))}</tbody>
        </table>
      </div>
      {read && <div className="rx-read" aria-live="polite">
        {sel && (() => { const v = visFor(sel); return (
          <figure className="rx-vis" key={sel.join('|')}>
            {v.src ? <img src={v.src} alt="" decoding="async" /> : <span className="rx-vis-mk" dangerouslySetInnerHTML={{ __html: CYCLE_SVG[v.mark] || '' }} />}
            <figcaption>{v.cap}</figcaption>
          </figure>) })()}
        {sel ? <p>{sentence(sel)}</p> : <p className="rx-hint">Pick any service, unit, discipline or system to see what it connects to.</p>}
        <span className="rx-key"><i className="solid" />carried <i className="dash" />carried when the client asks</span>
        <p className="rx-gl">Short forms: EPCC (Engineering, Procurement, Construction and Commissioning) · EPCM (Engineering, Procurement and Construction Management) · HVAC (heating, ventilation and air conditioning) · ACMV (air conditioning and mechanical ventilation)</p>
      </div>}
    </div>
  )
}
