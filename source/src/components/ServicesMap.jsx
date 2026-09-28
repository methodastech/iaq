import FabLayers from './FabLayers.jsx'
import OneFlow from './OneFlow.jsx'
import FabReal from './FabReal.jsx'
import ModelIcon from './ModelIcon.jsx'
import UnitsBoard from './UnitsBoard.jsx'
import IsoIcon from './IsoIcon.jsx'
const ISO_U = { epc: 'epc', hookup: 'hookupUnit', efm: 'efm' }
import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './FlowIcon.jsx'
import RelExplorer, { visFor } from './codex/RelExplorer.jsx'
import { sentence, workOf, sysOf } from '../lib/relations.jsx'
import { CYCLE_SVG } from '../data/cycleMarks.js'
import { UNITS, SERVICES, WORK, QUESTIONS, SCENARIOS, CONTRACTORS, LIFE, FAQ } from '../data/codex.js'
import '../styles/codex-parts.css'
/* the number of systems the map carries, read from the same data the explorer draws (the three kinds of work, each with its systems) */
const SYS_N = WORK.reduce((n, w) => n + ((w.systems && w.systems.length) || 0), 0)
import '../styles/services-map.css'
import { useMomentum } from '../lib/momentum.js'
import Faq from './Faq.jsx'
import { DmFaq } from './DioramaMarks.jsx'

/* each band arrives once: .in on the band root drives every choreography in services-map.css */
function useInView(threshold = 0.18) {
  const ref = useRef(null); const [inView, setIn] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (!('IntersectionObserver' in window) || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) { setIn(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIn(true); io.disconnect() } }, { threshold })
    io.observe(el); return () => io.disconnect()
  }, [threshold])
  return [ref, inView]
}
/* ============================================================================
   ServicesMap · the Services page told in the Codex order, 24 Sep 2026.

   Bazil: "upgrade the services page with this new info, top quality, answers every concern of the client",
   "explain the services, business units and the others with an amazing, easy to understand diagram",
   "easy to understand and flow of info", "nothing vague, nothing that wastes people's time".

   One source: src/data/codex.js, the same data the Codex, the slides and the unit pages read, so this page can
   never disagree with them. The bands, in the reading order the Codex sets for every page:
     units      the three units as one row: what each builds, how it is bought, what it carries, its term
     map        IAQ in one picture (RelExplorer): pick anything and its chain lights
     questions  the three things a buyer settles, in order: model, scope, work
     asks       six real asks, each read left to right through the layers
     work       the three disciplines and the systems inside them, and why one contractor for all three matters
     faq        the questions clients put to IAQ, answered from the questionnaires
   ============================================================================ */

const svcById = id => SERVICES.find(s => s.id === id)
const workById = id => WORK.find(w => w.id === id)
/* the unit photographs that say what each unit is (a site under cranes, a valve manifold, a chiller plant); the cap-* banners are
   company-profile stills and read wrong here */
/* 24 Sep (Bazil: "perfect visuals that represent each"): unit 2 shows the tools in, from IAQ's own model */
const UNIT_PHOTO = { epc: '/assets/menu/u-epc.webp', hookup: '/assets/iaq/thumbs/unit-hookup-card.webp', efm: '/assets/menu/u-efm.webp' }
/* 25 Sep (Bazil: "should have icon for each"): each kind carries a mark beside its colour */
const KEY = [['u', 'Business unit', 'epcUnit'], ['m', 'Delivery model', 'file'], ['s', 'Service', 'cycle'], ['w', 'Work', 'helmet'], ['y', 'System', 'sysPlumb']]


export function UnitsBand() {
  useMomentum()
  const [ref, inView] = useInView()
  /* 24 Sep (Bazil: "both these need to combine"): the three units are one board (UnitsBoard.jsx): the short read on top,
     Read more opens the detailed rows in the same columns */
  return (
    <section ref={ref} className={'pg-sec sm-units' + (inView ? ' in' : '')} aria-labelledby="sm-units-h">
      <div className="pg-in">
        <h2 id="sm-units-h" className="sm-h2-u kind-h k-u" data-reveal=""><Icon name="epcUnit" className="kind-ic" />3 business units</h2>{/* 26 Sep (Bazil: "just write the title 3 business units in blue") */}
        <p className="pg-lede" data-reveal="">EPC builds the facility. PCU &amp; TTI re-equips a running fab. EFM runs and maintains it.</p>
        <UnitsBoard />
      </div>
    </section>
  )
}

/* one reading: the flat icon of the kind, the sentence, the detail line (the Services page panel, and its measurer) */
const HINT = 'Choose a unit, a service, a kind of work or a system. The model builds to that moment and names the layers it touches; this panel reads the relation.'
function iconFor(sel) { const [k, id] = sel; if (k === 's') return <Icon name={SERVICES.find(s => s.id === id).icon} />; if (k === 'u') return <Icon name={UNITS.find(u => u.id === id).icon} />; if (k === 'w') return <Icon name={workOf(id).icon} />; return <Icon name="particle" /> }
function Reading({ sel }) {
  return (
    <>
      <span className={'sm-map-ic k-' + sel[0]} aria-hidden="true">{iconFor(sel)}</span>
      <div>
        <p>{sentence(sel)}</p>
        <p className="sm-map-more">{detail(sel)}</p>
      </div>
    </>
  )
}
/* every pick the map can make: the six services, the three units, the three kinds of work and their systems (work id:index) */
const ALL_SELS = [
  ...SERVICES.map(x => ['s', x.id]), ...UNITS.map(x => ['u', x.id]), ...WORK.map(x => ['w', x.id]),
  ...WORK.flatMap(w => w.systems.map((_, i) => ['y', w.id + ':' + i])),
]

export function MapBand() {
  /* 24 Sep, late (Bazil: "this should be the banner", "the whole banner should be the grey background", "I want my 3D, not
     his", "remove this and name what this interface is about", "maybe put this info here"): the banner is IAQ's own Revit
     model, keyed onto the dark ground, beside the map; the head is the interface's name; the reading sits under the map.
     The map's pick scrubs the model to that moment and pins the layers it touches; a pin picks in the map. */
  const [sel, setSel] = useState(null)
  const [ext, setExt] = useState(null)
  const panelRef = useRef(null), measureRef = useRef(null)
  const [tour, setTour] = useState(false)   /* the map tours itself only while this is on (the play button) */
  const stageRef = useRef(null), headRef = useRef(null), toolsRef = useRef(null), fabApi = useRef(null)
  /* 26 Sep (Bazil: "push the 3D to the bottom a bit", "don't cut the building", "make sure all this is placed perfectly"):
     the share of the canvas the model is framed into is measured from the page: as wide as the left column; the vertical
     seat (under the title) is the engine's own lift(). Refitted on any resize. */
  useEffect(() => {
    const stage = stageRef.current, head = headRef.current, tools = toolsRef.current
    if (!stage || !head || !tools) return
    const left = head.parentElement
    const fit = () => {
      const fr = stage.querySelector('.fr'); if (!fr) return
      const s = stage.getBoundingClientRect(); if (s.height < 10) return
      if (window.matchMedia('(max-width:1279px)').matches) fr.style.removeProperty('--fr-left')
      else { const l = left.getBoundingClientRect(); fr.style.setProperty('--fr-left', ((l.right - s.left) / s.width).toFixed(4)) }
      if (fabApi.current && fabApi.current.refit) fabApi.current.refit()
    }
    fit()
    const ro = new ResizeObserver(fit); ro.observe(stage); ro.observe(left); ro.observe(head)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit)
    const t = setTimeout(fit, 1500)   /* once the model has loaded and its first fit has run */
    return () => { ro.disconnect(); clearTimeout(t) }
  }, [])
  useEffect(() => {
    const panel = panelRef.current, box = measureRef.current
    if (!panel || !box) return
    const fit = () => {
      /* 26 Sep, Bazil "this box is too tall": the panel is as tall as the reading on show, with a floor at the median
         reading so the common picks share one height; only the long unit readings grow it */
      const hs = [...box.children].map(el => el.offsetHeight).sort((x, y) => x - y), floor = hs.length ? hs[Math.floor(hs.length / 2)] : 0
      const cur = box.querySelector('[data-sel="' + (Array.isArray(sel) ? sel.join('|') : '') + '"]') || box.children[0]
      let h = Math.max(floor, cur ? cur.offsetHeight : 0)
      /* 26 Sep (Bazil: "align", a line from the panel's top across to the map): the panel's top sits level with the last
         unit card's top when the tallest reading allows it; measured in CSS px (the page runs at zoom 1.12) */
      const side = panel.closest('.sm-map-dark') && panel.closest('.sm-map-dark').querySelector('.sm-map-side'), last = side && side.querySelector('.rx-u .rx-n:last-child')
      /* 26 Sep, Bazil "this box is too tall": the panel is as short as the tallest reading, and its top snaps only to the
         nearest map line above that (any card's top or foot in any column, the system column gives one every row) */
      if (side && last && matchMedia('(min-width:1280px)').matches) { const sr = side.getBoundingClientRect(), z = sr.width / (side.clientWidth || sr.width) || 1; const cands = []; for (const c of side.querySelectorAll('.rx-n')) { const r = c.getBoundingClientRect(); cands.push((sr.bottom - r.top) / z, (sr.bottom - r.bottom) / z) } const snap = v => cands.filter(x => x >= v && x <= v + 64).sort((a, b) => a - b)[0] || v; h = snap(h) }
      if (h > 0) panel.style.setProperty('--read-h', Math.ceil(h) + 'px')
      /* once the panel's height has settled (.38 s ease), the 3D refits into the room above the tools row, unless the
         view has been turned or zoomed (fabreal refitIfHome) */
      clearTimeout(fit.t); fit.t = setTimeout(() => { if (fabApi.current && fabApi.current.refitIfHome) fabApi.current.refitIfHome() }, 440)
      /* 26 Sep (Bazil: "fix the vertical and horizontal balance"): the model's top sits level with the map's column heads,
         so the left column starts where the head on the right ends (its height, measured, as --head-h on the row) */
      const duo = panel.closest('.sm-map-duo'), head = duo && duo.querySelector('.sm-map-head-r')
      /* measured as the distance from the row's top to the map's column heads, in CSS px (the page runs at zoom 1.12) */
      const heads = duo && duo.querySelector('.rx-heads')
      if (duo && heads) { const dr = duo.getBoundingClientRect(), z = dr.width / (duo.clientWidth || dr.width) || 1; duo.style.setProperty('--head-h', Math.max(0, Math.round((heads.getBoundingClientRect().top - dr.top) / z)) + 'px') }
    }
    fit()
    const ro = new ResizeObserver(fit); ro.observe(box)
    const head0 = panel.closest('.sm-map-duo') && panel.closest('.sm-map-duo').querySelector('.sm-map-head-r'); if (head0) ro.observe(head0)
    /* the map's own height moves the lines the panel snaps to, so the map is observed as well */
    const sideEl = panel.closest('.sm-map-dark') && panel.closest('.sm-map-dark').querySelector('.sm-map-side'); if (sideEl) ro.observe(sideEl)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit)
    return () => { ro.disconnect(); clearTimeout(fit.t) }
  }, [sel])
  return (
    <section className="pg-sec sm-map sm-map-dark sm-map-full" aria-labelledby="sm-map-h">
      {/* 25 Sep, night (Bazil: "the canvas should be the whole banner", "don't cut the building"): the model's canvas is the
          banner's ground, edge to edge and top to bottom, with the model framed into the left part (--fr-left in CSS,
          read by scenes/fabreal.js) so it never meets an edge when turned. The reading panel sits at the foot of the
          left column, the name and the map stand in the right column, both over the canvas. */}
      <div className="sm-map-stage sm-map-stage-bg" ref={stageRef}>
        <FabReal sel={sel} onPick={setExt} apiRef={fabApi} ownTools={false} />
      </div>
      <div className="pg-in">
        <div className="sm-map-duo sm-map-duo-b">
          <div className="sm-map-left">
            {/* 26 Sep, small hours (Bazil, an arrow from the title to the top left: "put title and info to the right/left"): the
                name and its line stand at the top of the left column, over the model; the map alone fills the right column */}
            <div className="sm-map-head sm-map-head-r sm-map-head-tl" ref={headRef}>
              <h1 id="sm-map-h">The <em>IAQ</em> facility map</h1>
              {/* 26 Sep (Bazil: "remove this"): the count line under the title is gone; the title stands alone */}
            </div>
            <div className="sm-map-spacer" aria-hidden="true" />
            {/* 26 Sep (Bazil: "where's the zoom in zoom out button and play button"): the view tools are a row of the left
                column, between the model and the reading panel, never under anything */}
            <div className="sm-map-tools" role="group" aria-label="View" ref={toolsRef}>
              <button type="button" onClick={() => fabApi.current && fabApi.current.zoom(1)} aria-label="Zoom in">+</button>
              <button type="button" onClick={() => fabApi.current && fabApi.current.zoom(-1)} aria-label="Zoom out">&minus;</button>
              <button type="button" onClick={() => fabApi.current && fabApi.current.reset()} aria-label="Reset view">&#8635;</button>
              <button type="button" className={'fr-play' + (tour ? ' on' : '')} onClick={() => setTour(t => !t)} aria-pressed={tour} aria-label={tour ? 'Stop the tour' : 'Play the tour'}>{tour ? '\u25A0 Stop' : '\u25B6 Play the tour'}</button>
            </div>
            {/* 25 Sep, version 2 (Bazil: "no need the bottom left info"): the reading panel is off the banner; version 1 is in
                the Codex and in src/_versions/facility-map-v1-2026-09-25 */}
          </div>
          <div className="sm-map-side">
            <div className="sm-map-in cx-page rx-compact"><RelExplorer value={ext} onSelect={setSel} read={false} tour={tour} onTouch={() => setTour(false)} only={['w', 'y']} />   {/* version 2: work and system only (no services, no units, tools hookup has its own section) */}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* the second line of the reading panel */
function detail(sel) {
  const [k, id] = sel
  if (k === 'u') { const u = UNITS.find(x => x.id === id); return 'Call ' + (u.short || u.name) + ' when ' + u.when.charAt(0).toLowerCase() + u.when.slice(1) + ' Term: ' + u.term + '.' }
  if (k === 's') { const s = SERVICES.find(x => x.id === id); return 'Service ' + s.n + ' of 6. ' + s.line }
  if (k === 'w') { const w = workOf(id); return w.full + '. Its systems: ' + w.systems.join(', ') + '.' }
  const y = sysOf(id), w = y && workOf(y.work)
  return 'One of the systems inside ' + (w ? w.name + ' (' + w.full + ')' : 'its work') + '. Designed, built and proven to operate as intended before handover, then maintained.'
}

export function FlowBand() {
  return (
    <section className="pg-sec sm-flow" aria-labelledby="sm-flow-h">
      <div className="pg-in">
        <h2 id="sm-flow-h" data-reveal="">Units, services, work and systems, <em>in one flow.</em></h2>
        <p className="pg-lede" data-reveal="">Pick a business unit and the row draws its flow: the services it carries, the work it does, and the systems that work builds.</p>
        <OneFlow />
      </div>
    </section>
  )
}

/* the six stage marks, keyed as data/cycleMarks.js keys them; the system chip's mark is read off the system's own words */
const ASK_MARK = { design: 'des', procure: 'prc', construct: 'con', commission: 'com', maintain: 'mnt', hookup: 'hok' }
const sysIcon = t => /whole facility/i.test(t) ? 'factory' : /cooling water|PCW/i.test(t) ? 'sysPcw' : /chiller/i.test(t) ? 'sysChiller' : /gases|chemical/i.test(t) ? 'sysGas' : 'cube'
export function QuestionsBand() {
  const [ref, inView] = useInView()
  /* 26 Sep (Bazil: "easy to understand"): three of the six requests stand open, the rest one click away */
  const [allAsks, setAllAsks] = useState(false)
  return (
    <section ref={ref} className={'pg-sec sm-qs' + (inView ? ' in' : '')} aria-labelledby="sm-qs-h">
      {/* 26 Sep (Bazil: "make a whole banner for this title, not tall but short, so we can separate this section"):
          the head sits in its own short navy band across the page */}
      <div className="sm-qs-band">
        <div className="pg-in">
          <div className="sm-qs-txt">
            {/* 25 Sep (Bazil: "a better, friendly and professional title rather than forced info") */}
            <h2 id="sm-qs-h" data-reveal="">Three choices <em>shape your quote.</em></h2>
            <p className="pg-lede" data-reveal="">The model, the scope and the work. Pick each one, and the quote follows.</p>
          </div>
          {/* 25 Sep (Bazil: "create a better image visual for this banner, make the visual part of the layout", "create it in
              Higgsfield"): an isometric illustration of the three choices (the contract, the facility with its chosen
              wing, the work), rendered in Higgsfield on white and blended into the band's ground */}
          <img className="sm-qs-visual" src="/assets/iaq/quote-visual.webp" alt="" loading="lazy" decoding="async" data-reveal="" />
        </div>
      </div>
      <div className="pg-in">
        <ol className="sm-q3">
          {QUESTIONS.map((q, i) => (
            <li key={q.n} className={'sm-q k-' + ({ Model: 'm', Service: 's', Work: 'w' }[q.layer])} data-reveal="" style={{ '--i': i }}>
              <span className="sm-q-n">{q.n}</span>
              <b>{q.q}</b>
              <span className="sm-q-l">{q.layer}</span>
              <p>{q.a}</p>
            </li>
          ))}
        </ol>
        <h3 className="sm-h3" data-reveal="">Six requests, and what each one needs</h3>
        {/* one column per layer, so every row lines up and the page reads as one diagram: the ask, then unit,
            model, services, work and system. Each row lights left to right as the band arrives. */}
        <div className="sm-asks">
          <div className="sm-ask sm-ask-h" aria-hidden="true">
            <span />
            <span className="k-u">Business unit</span><span className="k-m">Model</span><span className="k-s">Services</span><span className="k-w">Work</span><span className="k-y">System</span>
          </div>
          {SCENARIOS.slice(0, allAsks ? SCENARIOS.length : 3).map((s, i) => {
            const u = UNITS.find(x => x.id === s.unit)
            return (
              <div className="sm-ask" key={i} style={{ '--i': i }}>
                <p className="sm-ask-q">&ldquo;{s.ask}&rdquo;</p>
                {/* 25 Sep, 08:45 (Bazil: "apply the icons"): every chip carries its mark, the same marks the chart above uses:
                    the unit's line mark, the model's drawn mark, the service's isometric stage mark, the work's mark, the system's */}
                <span className="sm-cell" style={{ '--k': 0 }}><span className="sm-chip u"><Icon name={u.icon} className="sm-ci" />{u.short || u.name}</span></span>
                <span className="sm-cell" style={{ '--k': 1 }}><span className="sm-chip m"><ModelIcon name={s.model} className="sm-ci" />{s.model}</span></span>
                <span className="sm-cell sm-pgroup" style={{ '--k': 2 }}>{s.services.map(id => <span key={id} className="sm-chip s"><span className="sm-cm" aria-hidden="true" dangerouslySetInnerHTML={{ __html: CYCLE_SVG[ASK_MARK[id]] }} /><i>{svcById(id).n}</i>{svcById(id).short}</span>)}</span>
                <span className="sm-cell sm-pgroup" style={{ '--k': 3 }}>{s.work.map(id => <span key={id} className="sm-chip w"><Icon name={workById(id).icon} className="sm-ci" />{workById(id).name}</span>)}</span>
                <span className="sm-cell" style={{ '--k': 4 }}><span className="sm-chip y"><Icon name={sysIcon(s.system)} className="sm-ci" />{s.system}</span></span>
              </div>
            )
          })}
        </div>
        {SCENARIOS.length > 3 && (
          <button type="button" className="sm-asks-more" aria-expanded={allAsks} onClick={() => setAllAsks(v => !v)}>
            <span>{allAsks ? 'Show three requests' : `Show all ${SCENARIOS.length === 6 ? 'six' : SCENARIOS.length} requests`}</span><i aria-hidden="true">{allAsks ? '\u2212' : '+'}</i>
          </button>
        )}
      </div>
    </section>
  )
}

const COLS = [['csa', 'CSA'], ['mep', 'MEP'], ['process', 'Process'], ['hookup', 'Hookup'], ['energy', 'Energy']]
export function WorkBand() {
  const [ref, inView] = useInView()
  /* step 5 (24 Sep plan): the fab with its layers sits beside the three kinds of work; pointing at a kind lights its pins */
  const [hot, setHot] = useState(null)
  return (
    <section ref={ref} className={'pg-sec sm-work' + (inView ? ' in' : '')} aria-labelledby="sm-work-h">
      <div className="pg-in">
        <h2 id="sm-work-h" data-reveal="">The three kinds of work, <em>and what each one builds.</em></h2>
        <p className="pg-lede" data-reveal="">Most contractors do one. IAQ does all three in house.</p>
        <div className="sm-wgrid">
        <FabLayers hot={hot} onHot={setHot} />
        <div className="sm-wcols sm-wstack" onMouseLeave={() => setHot(null)}>
          {WORK.map((w, i) => (
            <div className={'sm-wc' + (hot === w.id ? ' lit' : hot ? ' dim' : '')} key={w.id} data-reveal="" style={{ '--i': i }} onMouseEnter={() => setHot(w.id)}>
              <h3><span className="sm-chip w big">{w.name}</span><small>{w.full || ''}</small></h3>
              <ul>{w.systems.map((t, j) => <li key={t} style={{ '--j': j }}><i className="sm-dot y" aria-hidden="true" />{t}</li>)}</ul>
            </div>
          ))}
        </div>
        </div>
        <div className="sm-cmp" data-reveal="">
          <div className="sm-cmp-h"><span>Who does what</span>{COLS.map(([id, l]) => <span key={id}>{l}</span>)}</div>
          {CONTRACTORS.map(c => (
            <div className={'sm-cmp-r' + (c.name === 'IAQ' ? ' me' : '')} key={c.name}>
              <span><b>{c.name}</b><small>{c.kind}</small></span>
              {COLS.map(([id], j) => <span key={id} className={c.has.includes(id) ? 'on' : 'off'} style={{ '--j': j }} aria-label={c.has.includes(id) ? 'Yes' : 'No'}><i /></span>)}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* answered only from what IAQ has stated: the 27 Jul questionnaires (EPC section B, Energy Management section C,
   SL Utility section D) and the 17 Sep review */
/* 24 Sep (Bazil: "create a proper FAQ section here, premium, structured"): the six-tile grid is the grouped, indexed
   Faq component now (components/Faq.jsx, data codex.js FAQ). */
export function FaqBand() {
  return (
    <section className="pg-sec sm-faq" aria-labelledby="sm-faq-h">
      <div className="pg-in">
        {/* 24 Sep (Bazil: "icon here at the left, question icon, this style but better"): the diorama question mark beside the title */}
        {/* 24 Sep (Bazil: "put the icon to the left of the title and description, no need the shadow and platform"):
            the question cube alone, beside the title and the lede as one head */}
        <div className="sm-faq-head" data-reveal="">
          <DmFaq className="faq-hic" />
          <div>
            <h2 id="sm-faq-h" className="sm-faq-h">Questions clients ask</h2>{/* 26 Sep (Bazil: "questions ask") */}
            <p className="pg-lede">The questions facility owners ask before they engage IAQ, answered. Any other question, ask; the reply comes within a working day.</p>
          </div>
        </div>
        <Faq />
      </div>
    </section>
  )
}
