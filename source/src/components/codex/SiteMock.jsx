import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../FlowIcon.jsx'
import { SLIDES } from '../CodexSlides.jsx'
import { UNITS, SERVICES, WORK, SCENARIOS, READING_ORDER, PAGE_ANATOMY, END_GOALS, NAMES } from '../../data/codex.js'
import { INDUSTRIES } from '../../data/projects.js'
import '../../styles/codex-site.css'

/* ============================================================================
   SiteMock · the Codex, section 3: how the website carries the IAQ structure.
   18 Sep 2026 (Bazil: "how we should portray it in the website, amazing design, interactive etc,
   and overall super easy to understand and imagine and know its relationship. Go all out.")

   Seven blocks, in this order:
     1  the order a visitor reads in       READING_ORDER, one colour per kind
     2  the Services menu, live now        a static replica of the live wing (Nav.jsx, kinds segs + strip)
     3  the Services page, top to bottom   six bands in a browser frame, band <-> note highlight, click for the slide
     4  a business unit page, part by part PAGE_ANATOMY drawn as a wireframe of the EPC page
     5  where every picture goes           the twelve slides, split into site and profile placement, with a lightbox
     6  interactive moments to build       four cards, two live, two proposed
     7  one name each, one goal per page   NAMES and END_GOALS

   The colour grammar is the slides' own: unit red, model ink outline, service azure, work black,
   system green, market violet. Every class is prefixed sm3-; the styles live in codex-site.css.
   The root is a size container, so the lightbox is portalled to <body> (containment would trap a
   fixed element inside the section).
   ============================================================================ */

const thumb = n => `/codex/slide-${n}.jpg`
const full = n => `/codex/slide-${n}.png`
const slideOf = n => SLIDES.find(s => s.n === n)
const unitShort = id => { const u = UNITS.find(x => x.id === id); return u ? (u.short || u.name) : id }
const svcOf = id => SERVICES.find(s => s.id === id)
const workOf = id => WORK.find(w => w.id === id)
const workLabel = w => (w.id === 'process' ? 'Process' : w.name)

/* the reading order, one kind per step */
const STEP_KIND = ['unit', 'model', 'svc', 'work', 'mkt', 'act']
const STEP_ICON = ['building', 'file', 'cycle', 'grid', 'check', 'mail']

/* the colour key: the six kinds, as the slides print it */
const KEY = [
  ['unit', 'Business unit'], ['model', 'Delivery model'], ['svc', 'Service'],
  ['work', 'Work'], ['sys', 'System'], ['mkt', 'Market'],
]

/* one real ask from the 17 Sep review, traced through the six steps */
const EG = SCENARIOS.find(s => s.system && s.system.includes('PCW') && s.services.length === 1) || SCENARIOS[0]

/* hover and focus, both ways: the same index lights the thing and its label */
const hov = (set, i) => ({ onMouseEnter: () => set(i), onMouseLeave: () => set(null), onFocus: () => set(i), onBlur: () => set(null) })

/* adds `is-in` once the element is scrolled into view (a one-shot glow; content never waits on it) */
function useInView(threshold = 0.3) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || on || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { setOn(true); io.disconnect() } }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [on, threshold])
  return [ref, on]
}

function Tag({ live, children }) {
  return <span className={'sm3-tag ' + (live ? 'sm3-tag-live' : 'sm3-tag-prop')}>{children || (live ? 'Live' : 'Proposed')}</span>
}

function Head({ id, title, lede }) {
  return (
    <div className="sm3-head">
      <h3 className="sm3-h3" id={id}>{title}</h3>
      {lede && <p className="sm3-lede">{lede}</p>}
    </div>
  )
}

/* ---------------------------------------------------------------------------
   1 · the order a visitor reads in
   --------------------------------------------------------------------------- */
function StepMembers({ i }) {
  if (i === 0) return <span className="sm3-mem">{UNITS.map(u => <i key={u.id} className="sm3-chip sm3-k-unit sm3-solid">{u.short || u.name}</i>)}</span>
  if (i === 1) return <span className="sm3-mem">{['EPCC', 'EPCM', 'Standalone', 'ESCO'].map(t => <i key={t} className="sm3-pill">{t}</i>)}</span>
  if (i === 2) return <span className="sm3-mem">{SERVICES.map(s => <i key={s.id} className="sm3-sq sm3-k-svc" title={s.name}>{s.n}</i>)}</span>
  if (i === 3) return (
    <span className="sm3-mem">
      {WORK.map(w => <i key={w.id} className="sm3-chip sm3-k-work">{workLabel(w)}</i>)}
      {['PCW', 'CDA', 'UPW'].map(t => <i key={t} className="sm3-chip sm3-k-sys">{t}</i>)}
    </span>
  )
  if (i === 4) return (
    <span className="sm3-mem">
      {INDUSTRIES.map(([id, l]) => <i key={id} className="sm3-dot sm3-k-mkt" title={l} />)}
      <small>{INDUSTRIES.length} markets</small>
    </span>
  )
  return <span className="sm3-mem"><i className="sm3-fakebtn">Contact</i></span>
}

function ReadingOrder() {
  const [ref, on] = useInView(0.35)
  const [hot, setHot] = useState(null)
  const svcs = EG.services.map(svcOf).filter(Boolean)
  const works = EG.work.map(workOf).filter(Boolean)
  const sys = (EG.system.match(/\(([A-Z]+)\)/) || [])[1] || EG.system
  const trace = [
    <i className="sm3-chip sm3-k-unit sm3-solid">{unitShort(EG.unit)}</i>,
    <i className="sm3-pill">{EG.model}</i>,
    <>{svcs.map(s => <i key={s.id} className="sm3-chip sm3-k-svc">{s.n} {s.name}</i>)}</>,
    <>{works.map(w => <i key={w.id} className="sm3-chip sm3-k-work">{workLabel(w)}</i>)}<i className="sm3-chip sm3-k-sys">{sys}</i></>,
    <i className="sm3-chip sm3-k-mkt">{sys} projects, by market</i>,
    <i className="sm3-fakebtn">Contact, once</i>,
  ]
  return (
    <section className="sm3-blk" aria-labelledby="sm3-h-order">
      <Head id="sm3-h-order" title="The order a visitor reads in" lede="Every page reads in this order, and ends on one action." />
      <div ref={ref} className={'sm3-flow-wrap' + (on ? ' sm3-in' : '') + (hot != null ? ' sm3-anyhot' : '')}>
        <span className="sm3-flow-line" aria-hidden="true" />
        <ol className="sm3-flow">
          {READING_ORDER.map((r, i) => (
            <li key={r.k} className={'sm3-step sm3-k-' + STEP_KIND[i] + (hot === i ? ' sm3-hot' : '')} style={{ '--i': i }} tabIndex={0} {...hov(setHot, i)}>
              <span className="sm3-step-top">
                <i className="sm3-step-tile" aria-hidden="true"><Icon name={STEP_ICON[i]} /></i>
                <span className="sm3-step-n" aria-hidden="true">{i + 1}</span>
              </span>
              <span className="sm3-step-k">{r.k}</span>
              <span className="sm3-step-t">{r.t}</span>
              <StepMembers i={i} />
              {i < READING_ORDER.length - 1 && <span className="sm3-step-arw" aria-hidden="true"><Icon name="arrow" /></span>}
            </li>
          ))}
        </ol>
        {/* one real ask, traced through the same six columns */}
        <div className="sm3-trace">
          <p className="sm3-trace-q"><b>One ask from the review, read in order:</b> <q>{EG.ask.replace(/\.$/, '')}</q></p>
          <ol className="sm3-trace-row">
            {trace.map((t, i) => <li key={i} className={hot === i ? 'sm3-hot' : undefined} style={{ '--i': i }}><span className="sm3-sr">{READING_ORDER[i].k}: </span>{t}</li>)}
          </ol>
        </div>
      </div>
      <ul className="sm3-key" aria-label="Colour key">
        {KEY.map(([k, l]) => <li key={k} className={'sm3-k-' + k}><i aria-hidden="true" />{l}</li>)}
      </ul>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   2 · the Services menu, live now (copied from Nav.jsx MENUS, services-hub)
   --------------------------------------------------------------------------- */
/* 22 Sep: the live wing is three columns now (Bazil: "3 columns only, the picture, the 3 units and the 6
   services"). The units are cards, every section inside one is a link (the contract models open "Two ways to
   buy it" on the unit's page), and the six services are one numbered list that answers to the unit under the
   pointer, from UNITS core and ask. This replica does the same. */
const MENU_UNITS = [
  { id: 'epc', label: 'EPC', full: 'Engineering, Procurement and Construction', sub: 'Builds the facility, under one contract.', icon: 'crane', subs: ['EPCC', 'EPCM'] },
  { id: 'hookup', label: 'Process Critical Utilities & Total Tool Installation Solutions', sub: 'Re-equips a live semiconductor fab.', icon: 'link', subs: ['Process Critical Utilities', 'Total Tool Installation'] },
  { id: 'efm', label: 'EFM', full: 'Energy Facility Management', sub: 'Runs and maintains it.', icon: 'power', subs: ['Cooling as a Service', 'Energy Performance Contracting'] },
]
const MENU_SVCS = [
  ['Engineering Design', 'compass'], ['Procurement', 'crate'], ['Construction', 'crane'],
  ['Testing & Commissioning', 'gauge'], ['Maintenance', 'gear'], ['Tools Hookup', 'link'],
]
const CALLOUTS = [
  { k: 'Three columns: the picture, the units, the services.', t: 'The three business units are three cards, because a buyer chooses the unit first.' },
  { k: 'Every section inside a unit is a link.', t: 'Its own pages, and its contract models, which open “Two ways to buy it” on the unit’s page.' },
  { k: 'The six services, one numbered list.', t: 'Point at a unit and the list lights what it carries, and marks what it carries only when asked.' },
]
/* which of the six a unit carries, read from UNITS (the Codex is the source) */
const carries = (unitId, svcIndex) => {
  const u = UNITS.find(x => x.id === unitId), sid = SERVICES[svcIndex] && SERVICES[svcIndex].id
  if (!u || !sid) return ''
  return u.core.includes(sid) ? 'carried' : u.ask.includes(sid) ? 'asked' : 'quiet'
}

function MenuReplica() {
  const [hot, setHot] = useState(null)
  const [pt, setPt] = useState(null)   /* the unit card under the pointer */
  const mark = n => <span className="sm3-mk" aria-hidden="true">{n}</span>
  return (
    <section className="sm3-blk" aria-labelledby="sm3-h-menu">
      <Head id="sm3-h-menu" title="The Services menu, live now" lede="Three columns: the picture, the three units as cards, the six services as one list. Point at a unit to see what it carries." />
      <div className={'sm3-menu' + (hot != null ? ' sm3-anyhot' : '')}>
        <div className="sm3-mn" aria-label="Replica of the live Services menu" role="img">
          <div className="sm3-mn-nav" aria-hidden="true">
            <img src="/assets/iaq-logo.webp" alt="" />
            <span className="sm3-mn-links"><span>About</span><span className="sm3-mn-on">Services</span><span>Markets</span><span>Projects</span><span>News</span><span>Careers</span></span>
            <Tag live>Live on the site</Tag>
          </div>
          <div className="sm3-mn-mega">
            <div className="sm3-mn-lead" aria-hidden="true">
              <img src="/assets/banners/svc-design.jpg" alt="" />
              <span className="sm3-mn-scrim" />
              <span className="sm3-mn-copy">
                <i><Icon name="cycle" /></i>
                <b>Services</b>
                <span>The six services of the delivery cycle, and the three business units the work is contracted through.</span>
              </span>
              <span className="sm3-mn-open">Open the page <em>&rarr;</em></span>
            </div>
            <div className="sm3-mn-groups">
              <div className={'sm3-mn-segs' + (hot === 0 ? ' sm3-hot' : '')}>
                {mark(1)}
                <span className="sm3-mn-gl">Business units</span>
                <div className="sm3-mn-seggrid" onMouseLeave={() => setPt(null)}>
                  {MENU_UNITS.map(u => (
                    <div className={'sm3-mn-seg' + (pt === u.id ? ' on' : '')} key={u.id} onMouseEnter={() => setPt(u.id)}>
                      <span className="sm3-mn-sega">
                        <i className="sm3-mn-ict"><Icon name={u.icon} /></i>
                        <span className="sm3-mn-segt"><em>{u.label}</em>{u.full && <b>{u.full}</b>}<small>{u.sub}</small></span>
                      </span>
                      <span className={'sm3-mn-sub' + (hot === 1 ? ' sm3-hot' : '')}>
                        {u.id === 'hookup' && mark(2)}
                        {(u.subs || []).map(x => <span key={x} className="sm3-mn-a">{x}</span>)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={'sm3-mn-strip' + (hot === 2 ? ' sm3-hot' : '')}>
                {mark(3)}
                <span className="sm3-mn-gl">{pt ? 'What ' + (MENU_UNITS.find(u => u.id === pt).full ? MENU_UNITS.find(u => u.id === pt).label : 'this unit') + ' carries' : 'Six services'}</span>
                <div className="sm3-mn-stripgrid">
                  {MENU_SVCS.map(([l, ic], i) => {
                    const st = pt ? carries(pt, i) : ''
                    return (
                      <span className={'sm3-mn-st' + (st ? ' ' + st : '')} key={l}>
                        <span className="sm3-mn-stn">{i + 1}</span>
                        <i className="sm3-mn-ict sm3-mn-icts"><Icon name={ic} /></i>
                        <em>{l}</em>
                        <span className="sm3-mn-stk">{st === 'asked' ? 'When asked' : ''}</span>
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        <ol className="sm3-callouts">
          {CALLOUTS.map((c, i) => (
            <li key={c.k} className={hot === i ? 'sm3-hot' : undefined} tabIndex={0} {...hov(setHot, i)}>
              <span className="sm3-mk" aria-hidden="true">{i + 1}</span>
              <span><b>{c.k}</b><span>{c.t}</span></span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   3 · the Services page, top to bottom
   Units come straight after the hero (Nabilah, 17 Sep: "3 business unit on top of the page"), then
   the bands follow the reading order: models, services and work in one map, the cycle, proof, action.
   --------------------------------------------------------------------------- */
/* 24 Sep: the page as rebuilt on 24 Sep (cover with the ring and the model, the one-view chart, unit cards, the
   serpentine, what to settle before a quote, the three kinds of work, proof, the questions clients ask, close).
   Bazil: the Services page answers every client concern and shows the best; the Codex is the deep reference. */
/* 26 Sep: the page as it stands tonight (the client's 24 Sep review and Bazil's sweeps): the facility map is the banner
   (Bazil: "this should be the banner"), the kinds-of-work band and the projects strip are gone (client: "Remove this
   section", "project reference should be interlinked at each business unit page"). Seven bands. */
const BANDS = [
  { id: 'map', k: 'model', name: 'The banner: the IAQ facility map', slide: 3, live: true, reads: [0, 1, 2, 3], vis: 'map',
    note: 'IAQ\u2019s own Revit model on the left (drag to turn, zoom, a tour you play), and on the right the map of 6 services, 3 business units, 3 kinds of work and 15 systems. Pick anything and the model builds to that moment and lights the layers it touches; the reading of the relation sits under the model, at one fixed height.' },
  { id: 'units', k: 'unit', name: 'The three business units, one card each', slide: 2, live: true, reads: [0], vis: 'units',
    note: 'White cards with the unit\u2019s photograph, its tag, its mark beside the name and its one line; then when to call it and how it is bought. Read more opens the three in detail as one bar across the cards. Each card opens its page.' },
  { id: 'cycle', k: 'svc', name: 'Six services, one accountable team', slide: 5, live: true, reads: [2], vis: 'cycle',
    note: 'The horizontal serpentine: 1 to 6 left to right, the U-turn, the red return from Hookup into the next Design. It steps on its own until touched. Each stage opens its page.' },
  { id: 'chart', k: 'model', name: 'Six services, three units, four kinds of work, in one view', slide: 3, live: true, reads: [1, 2, 3], vis: 'chart',
    note: 'The one-view figure: the six services across, the three units as bars over the services they carry (solid always, dashed when asked), the kinds of work with who does each.' },
  { id: 'ask', k: 'model', name: 'What to settle before you ask for a quote', slide: 4, live: true, reads: [1], vis: 'ask',
    note: 'Three questions (model, scope, work) and six typical requests read as a path through the layers.' },
  { id: 'faq', k: 'act', name: 'Questions clients ask, answered', slide: null, live: true, reads: [], vis: 'faq',
    note: 'The questions in five groups (choosing a model, time and cost, a live fab, after handover, working with IAQ), each answer one paragraph with the page that says more. Codex part 1 holds the same set.' },
  { id: 'close', k: 'act', name: 'One action: contact', slide: null, live: true, reads: [5], vis: 'close',
    note: 'The closing band. The only call to action on the page.' },
]

function BandVis({ v }) {
  if (v === 'hero') return (
    <span className="sm3-v sm3-v-hero">
      <span className="sm3-v-txt"><i className="sm3-bar" data-c="ink" style={{ width: '80%' }} /><i className="sm3-bar" data-c="ink" style={{ width: '60%' }} /><i className="sm3-bar" data-c="red" style={{ width: '50%' }} /><i className="sm3-bar" data-c="soft" data-thin="" style={{ width: '90%' }} /><i className="sm3-v-btn" /></span>
      <img className="sm3-v-img" src={thumb(0)} alt="" />
    </span>
  )
  if (v === 'units') return (
    <span className="sm3-v sm3-v-units">
      {UNITS.map(u => <span key={u.id} className="sm3-v-unit"><i><Icon name={u.icon} /></i><b>{u.short || u.name}</b><small>{u.line}</small></span>)}
    </span>
  )
  if (v === 'map') return (
    <span className="sm3-v sm3-v-map">
      <svg viewBox="0 0 320 96" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <g className="sm3-g-ln">
          <path d="M40 18 C70 18 70 20 96 20" /><path d="M40 18 C70 18 70 40 96 40" />
          <path d="M136 20 C160 20 160 14 178 14" /><path d="M136 20 C160 20 160 36 178 36" /><path d="M136 40 C160 40 160 58 178 58" />
          <path d="M196 14 C220 14 220 30 238 30" /><path d="M196 36 C220 36 220 30 238 30" /><path d="M196 58 C220 58 220 52 238 52" />
          <path d="M276 30 C290 30 290 24 300 24" /><path d="M276 52 C290 52 290 60 300 60" />
        </g>
        <g className="sm3-g-u"><rect x="6" y="8" width="34" height="20" rx="4" /><rect x="6" y="38" width="34" height="20" rx="4" opacity=".35" /><rect x="6" y="68" width="34" height="20" rx="4" opacity=".35" /></g>
        <g className="sm3-g-m"><rect x="96" y="12" width="40" height="16" rx="8" /><rect x="96" y="32" width="40" height="16" rx="8" /></g>
        <g className="sm3-g-s"><rect x="178" y="6" width="18" height="16" rx="3" /><rect x="178" y="28" width="18" height="16" rx="3" /><rect x="178" y="50" width="18" height="16" rx="3" /><rect x="178" y="72" width="18" height="16" rx="3" opacity=".35" /></g>
        <g className="sm3-g-w"><rect x="238" y="22" width="38" height="16" rx="4" /><rect x="238" y="44" width="38" height="16" rx="4" /><rect x="238" y="66" width="38" height="16" rx="4" opacity=".35" /></g>
        <g className="sm3-g-y"><circle cx="305" cy="24" r="5" /><circle cx="305" cy="60" r="5" /><circle cx="305" cy="78" r="5" opacity=".35" /></g>
      </svg>
    </span>
  )
  if (v === 'cycle') return (
    <span className="sm3-v sm3-v-cycle">
      <svg viewBox="0 0 220 96" aria-hidden="true">
        <ellipse cx="110" cy="48" rx="84" ry="34" className="sm3-g-ring" />
        {SERVICES.map((s, i) => {
          const a = -Math.PI / 2 + (i * Math.PI * 2) / SERVICES.length
          const x = 110 + 84 * Math.cos(a), y = 48 + 34 * Math.sin(a)
          return <g key={s.id} className="sm3-g-nd"><circle cx={x} cy={y} r="10" /><text x={x} y={y + 3.6} textAnchor="middle">{s.n}</text></g>
        })}
      </svg>
      <span className="sm3-v-cyc-l">{SERVICES.map(s => <i key={s.id}>{s.short}</i>)}</span>
    </span>
  )
  if (v === 'chart') return (
    <span className="sm3-v sm3-v-chart">
      <span className="sm3-v-cyc-l">{SERVICES.map(s => <i key={s.id}>{s.n}</i>)}</span>
      {UNITS.map(u => <span key={u.id} className="sm3-v-row">{SERVICES.map(s => <i key={s.id} className={u.core.includes(s.id) ? 'on' : u.ask.includes(s.id) ? 'ask' : 'off'} />)}</span>)}
    </span>
  )
  if (v === 'ask') return (
    <span className="sm3-v sm3-v-ask">
      {['Model', 'Scope', 'Work'].map((t, i) => <span key={t} className="sm3-v-q"><i>{i + 1}</i>{t}</span>)}
    </span>
  )
  if (v === 'work') return (
    <span className="sm3-v sm3-v-work">
      {WORK.map(w => <span key={w.id} className="sm3-v-w"><b>{w.name}</b><small>{w.line}</small></span>)}
    </span>
  )
  if (v === 'faq') return (
    <span className="sm3-v sm3-v-faq">
      {[0, 1, 2].map(i => <span key={i} className="sm3-v-txt"><i className="sm3-bar" data-c="ink" style={{ width: (78 - i * 14) + '%' }} /><i className="sm3-bar" data-c="soft" data-thin="" style={{ width: '92%' }} /></span>)}
    </span>
  )
  if (v === 'proof') return (
    <span className="sm3-v sm3-v-proof">
      {INDUSTRIES.slice(0, 4).map(([id, l]) => (
        <span key={id} className="sm3-v-pj"><span className="sm3-ph" /><i className="sm3-chip sm3-k-mkt">{l}</i></span>
      ))}
    </span>
  )
  return (
    <span className="sm3-v sm3-v-close">
      <span className="sm3-v-txt"><i className="sm3-bar" data-c="ink" style={{ width: '70%' }} /><i className="sm3-bar" data-c="soft" data-thin="" style={{ width: '50%' }} /></span>
      <i className="sm3-fakebtn">Contact</i>
    </span>
  )
}

function ServicesPage({ openLb }) {
  const [hot, setHot] = useState(null)
  const [open, setOpen] = useState(null)
  return (
    <section className="sm3-blk" aria-labelledby="sm3-h-page">
      <Head id="sm3-h-page" title="The Services page, top to bottom" lede="Seven bands in the reading order, as the page stands on 26 September 2026. Point at a band to see its job, click it to see its slide." />
      <div className={'sm3-page' + (hot != null ? ' sm3-anyhot' : '')}>
        <span className="sm3-page-bg" aria-hidden="true" />
        <div className="sm3-chrome" aria-hidden="true">
          <span className="sm3-chrome-dots"><i /><i /><i /></span>
          <span className="sm3-chrome-url">iaqtechnology.com.my/services</span>
        </div>
        <p className="sm3-page-legend"><Tag live /> built today <Tag /> to build</p>
        {BANDS.map((b, i) => {
          const s = b.slide != null ? slideOf(b.slide) : null
          const isOpen = open === i && s
          return (
            <React.Fragment key={b.id}>
              <div className={'sm3-band sm3-k-' + b.k + (i === BANDS.length - 1 ? ' sm3-band-last' : '') + (hot === i ? ' sm3-hot' : '') + (isOpen ? ' sm3-open' : '')} style={{ '--r': i + 2 }}
                onMouseEnter={() => setHot(i)} onMouseLeave={() => setHot(null)}>
                <button type="button" className="sm3-band-btn"
                  aria-expanded={s ? !!isOpen : undefined} aria-controls={s ? 'sm3-pv-' + b.id : undefined}
                  aria-describedby={'sm3-note-' + b.id} aria-disabled={s ? undefined : true}
                  onFocus={() => setHot(i)} onBlur={() => setHot(null)}
                  onClick={() => { if (s) setOpen(isOpen ? null : i) }}>
                  <span className="sm3-band-n" aria-hidden="true">{i + 1}</span>
                  <span className="sm3-sr">{b.name}. {s ? (isOpen ? 'Hide ' : 'Show ') + (s.n === 0 ? 'the cover' : 'slide ' + s.n) : 'No slide'}</span>
                  <BandVis v={b.vis} />
                  {s && <span className="sm3-band-cue" aria-hidden="true">{isOpen ? 'Hide' : 'Slide ' + s.n}</span>}
                </button>
                {isOpen && (
                  <div className="sm3-band-pv" id={'sm3-pv-' + b.id}>
                    <img src={full(s.n)} alt={'Slide ' + s.n + ': ' + s.name} />
                    <span className="sm3-band-pvc">
                      <span><b>Slide {s.n}</b> {s.name}</span>
                      <button type="button" className="sm3-sqbtn" onClick={e => openLb(s.n, e.currentTarget)}>Full size</button>
                    </span>
                  </div>
                )}
              </div>
              <div className={'sm3-note sm3-k-' + b.k + (hot === i ? ' sm3-hot' : '')} id={'sm3-note-' + b.id} style={{ '--r': i + 2 }}
                onMouseEnter={() => setHot(i)} onMouseLeave={() => setHot(null)}>
                <span className="sm3-note-top"><b>{b.name}</b><Tag live={b.live} /></span>
                <span className="sm3-note-t">{b.note}</span>
                {b.reads.length > 0 && (
                  <span className="sm3-note-reads">
                    {b.reads.map(r => <span key={r} className={'sm3-k-' + STEP_KIND[r]}><i aria-hidden="true" />{READING_ORDER[r].k}</span>)}
                  </span>
                )}
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   4 · a business unit page, part by part (EPC)
   --------------------------------------------------------------------------- */
/* 26 Sep: eight parts, as the unit pages stand tonight (the six-services list, the ledger and the model build are gone) */
const PART_KIND = ['unit', 'unit', 'model', 'work', 'svc', 'unit', 'mkt', 'act']

function AnatomyPart({ n, epc }) {
  if (n === 1) return (
    <span className="sm3-ap-hero">
      <b>{epc.name}</b><small>{epc.full}</small>
      <span className="sm3-ap-pills">{epc.models.map(m => <i key={m.t} className="sm3-pill">{m.t}</i>)}</span>
    </span>
  )
  if (n === 2) return <span className="sm3-ap-what"><small>{epc.what.split('. ')[0]}.</small><i className="sm3-bar" data-c="soft" data-thin="" style={{ width: '90%' }} /><i className="sm3-bar" data-c="soft" data-thin="" style={{ width: '70%' }} /></span>
  if (n === 3) return (
    <span className="sm3-ap-models">
      {epc.models.map(m => <span key={m.t}><i className="sm3-pill">{m.t}</i><small>{m.s.split('. ')[0].replace(/\.$/, '')}.</small></span>)}
    </span>
  )
  if (n === 4) return (
    <span className="sm3-ap-work">
      {WORK.map(w => (
        <span key={w.id} data-s={epc.work.includes(w.id) ? 'lit' : 'off'}>
          <i className="sm3-chip sm3-k-work">{workLabel(w)}</i>
          <span className="sm3-ap-sys">{w.systems.slice(0, 2).map(x => <i key={x} className="sm3-dot sm3-k-sys" title={x} />)}<small>{w.systems.length} systems</small></span>
        </span>
      ))}
    </span>
  )
  if (n === 5) return (
    <span className="sm3-ap-scope">
      {SERVICES.map(s => <span key={s.id} data-s="lit"><i>{s.n}</i><small>{s.short}</small></span>)}
    </span>
  )
  if (n === 6) return (
    <span className="sm3-ap-why">
      {[0, 1, 2].map(i => <span key={i} className="sm3-v-txt"><i className="sm3-bar" data-c="ink" style={{ width: (70 - i * 12) + '%' }} /><i className="sm3-bar" data-c="soft" data-thin="" style={{ width: (86 - i * 10) + '%' }} /></span>)}
    </span>
  )
  if (n === 7) return (
    <span className="sm3-ap-proof">
      {INDUSTRIES.slice(0, 3).map(([id, l]) => <span key={id}><span className="sm3-ph" /><i className="sm3-chip sm3-k-mkt">{l}</i></span>)}
    </span>
  )
  return <span className="sm3-ap-act"><i className="sm3-bar" data-c="ink" style={{ width: '50%' }} /><i className="sm3-fakebtn">Contact</i></span>
}

function Anatomy() {
  const [hot, setHot] = useState(null)
  const epc = UNITS.find(u => u.id === 'epc')
  return (
    <section className="sm3-blk" aria-labelledby="sm3-h-anat">
      <Head id="sm3-h-anat" title="A business unit page, part by part" lede="Eight parts, the same on all three unit pages, so they compare line for line; EFM carries its seven services where the models stand. EPC shown." />
      <div className={'sm3-anat' + (hot != null ? ' sm3-anyhot' : '')}>
        <div className="sm3-anat-frame" aria-hidden="true">
          <div className="sm3-chrome">
            <span className="sm3-chrome-dots"><i /><i /><i /></span>
            <span className="sm3-chrome-url">iaqtechnology.com.my{epc.route}</span>
          </div>
          <div className="sm3-anat-pg">
            {PAGE_ANATOMY.map((p, i) => (
              <span key={p.n} className={'sm3-ap sm3-k-' + PART_KIND[i] + (hot === i ? ' sm3-hot' : '')} onMouseEnter={() => setHot(i)} onMouseLeave={() => setHot(null)}>
                <AnatomyPart n={p.n} epc={epc} />
                <span className="sm3-ap-n">{p.n}</span>
              </span>
            ))}
          </div>
        </div>
        <ol className="sm3-anat-list">
          {PAGE_ANATOMY.map((p, i) => (
            <li key={p.n} className={'sm3-k-' + PART_KIND[i] + (hot === i ? ' sm3-hot' : '')} tabIndex={0} {...hov(setHot, i)}>
              <span className="sm3-anat-n" aria-hidden="true">{p.n}</span>
              <span><b>{p.k}</b><span>{p.t}</span></span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   5 · where every picture goes
   `use` reads "Profile: ... Website: ... Anything else." Each marked sentence is one line.
   --------------------------------------------------------------------------- */
const cap = s => s.charAt(0).toUpperCase() + s.slice(1)
function placeOf(use) {
  const out = { site: null, profile: null, extra: [] }
  String(use || '').split(/(?<=\.)\s+/).map(x => x.trim()).filter(Boolean).forEach(x => {
    const m = x.match(/^(Website|Profile):\s*(.*)$/)
    if (m && m[1] === 'Website' && !out.site) out.site = cap(m[2])
    else if (m && m[1] === 'Profile' && !out.profile) out.profile = cap(m[2])
    else out.extra.push(x)
  })
  return out
}

function SlideGrid({ openLb }) {
  return (
    <section className="sm3-blk" aria-labelledby="sm3-h-pics">
      <Head id="sm3-h-pics" title="Where every picture goes" lede="The twelve slides, and where each one is placed. Click a slide to open it full size." />
      <ul className="sm3-shots">
        {SLIDES.map(s => {
          const p = placeOf(s.use)
          return (
            <li key={s.n} className="sm3-shot">
              <button type="button" className="sm3-shot-btn" onClick={e => openLb(s.n, e.currentTarget)} aria-label={'Open slide ' + s.n + ', ' + s.name + ', full size'}>
                <img src={thumb(s.n)} alt="" width="480" height="270" decoding="async" />
                <span className="sm3-shot-n" aria-hidden="true">{s.n}</span>
              </button>
              <span className="sm3-shot-tx">
                <b>{s.name}</b>
                {/* spans, not dl/dt/dd: base.css floors dt and dd to 11px !important on phones */}
                <span className="sm3-shot-dl">
                  <span className={'sm3-shot-row' + (p.site ? '' : ' sm3-shot-none')}><span className="sm3-shot-dt"><Icon name="globe" />On the site</span><span className="sm3-shot-dd">{p.site || 'Not on the site.'}</span></span>
                  <span className={'sm3-shot-row' + (p.profile ? '' : ' sm3-shot-none')}><span className="sm3-shot-dt"><Icon name="file" />In the profile</span><span className="sm3-shot-dd">{p.profile || 'Not in the profile.'}</span></span>
                </span>
                {p.extra.length > 0 && <small>{p.extra.join(' ')}</small>}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Lightbox({ n, onClose, onStep }) {
  const boxRef = useRef(null)
  const closeRef = useRef(null)
  const s = slideOf(n)
  useEffect(() => { if (closeRef.current) closeRef.current.focus({ preventScroll: true }) }, [])
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      else if (e.key === 'ArrowRight') { e.preventDefault(); onStep(1) }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); onStep(-1) }
      else if (e.key === 'Tab' && boxRef.current) {
        const f = [...boxRef.current.querySelectorAll('button')]
        if (!f.length) return
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
        else if (!boxRef.current.contains(document.activeElement)) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose, onStep])
  if (!s) return null
  return createPortal(
    <div className="sm3-lb" role="dialog" aria-modal="true" aria-label={'Slide ' + s.n + ': ' + s.name} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sm3-lb-box" ref={boxRef}>
        <div className="sm3-lb-img"><img key={s.n} src={full(s.n)} alt={'Slide ' + s.n + ': ' + s.says} /></div>
        <div className="sm3-lb-bar">
          <span className="sm3-lb-cap"><b>Slide {s.n}</b> {s.name}<small>{s.says}</small></span>
          <span className="sm3-lb-btns">
            <button type="button" className="sm3-sqbtn" onClick={() => onStep(-1)} aria-label="Previous slide"><span className="sm3-flip"><Icon name="arrow" /></span></button>
            <button type="button" className="sm3-sqbtn" onClick={() => onStep(1)} aria-label="Next slide"><Icon name="arrow" /></button>
            <button type="button" className="sm3-sqbtn sm3-sqbtn-x" ref={closeRef} onClick={onClose}>Close</button>
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ---------------------------------------------------------------------------
   6 · interactive moments to build
   --------------------------------------------------------------------------- */
const MOMENTS = [
  { id: 'build', k: 'sys', icon: 'layers', title: 'The fab build-up', live: false, when: 'Asked for on 17 Sep',
    line: 'Home page, in 3D. Press play and the fab assembles layer by layer, each layer named by its work.' },
  { id: 'map', k: 'unit', icon: 'grid', title: 'The relationship map', live: true,
    line: 'Services page. Pick a unit, and its models, services, work and systems light up.' },
  { id: 'lights', k: 'svc', icon: 'check', title: 'The scope lights', live: true,
    line: 'Each unit page. The six services, the unit’s own lit, the ones carried on request ringed.' },
  { id: 'hookup', k: 'work', icon: 'link', title: 'The hook-up section', live: true,
    line: 'Total Tool Installation page. IAQ’s four phases, from facilitization to commissioning.' },
]
const BUILD_LAYERS = [['CSA', 'work'], ['MEP', 'work'], ['Process', 'work'], ['Systems', 'sys']]
const HOOK_PHASES = ['Facilitize', 'Rig in', 'Hook up', 'Commission']

function MomentVis({ id, play, onPlay }) {
  if (id === 'build') return (
    <span className={'sm3-mv sm3-mv-build' + (play ? ' sm3-playing' : '')}>
      <span className="sm3-mv-stack">
        {BUILD_LAYERS.map(([l, k], i) => <span key={l} className={'sm3-mv-lay sm3-k-' + k} style={{ '--i': i }}><b>{l}</b></span>)}
      </span>
      <button type="button" className="sm3-play" aria-pressed={!!play} onClick={onPlay}>
        <Icon name="play" /><span>{play ? 'Reset' : 'Play'}</span>
      </button>
    </span>
  )
  if (id === 'map') return (
    <span className="sm3-mv sm3-mv-map" aria-hidden="true">
      <span className="sm3-mv-col"><i className="sm3-chip sm3-k-unit sm3-solid">EPC</i><i className="sm3-chip sm3-k-unit sm3-solid" data-dim="">EFM</i></span>
      <span className="sm3-mv-col"><i className="sm3-pill">EPCC</i><i className="sm3-pill">EPCM</i></span>
      <span className="sm3-mv-col" data-sq="">{SERVICES.slice(0, 4).map(s => <i key={s.id} className="sm3-sq sm3-k-svc">{s.n}</i>)}</span>
      <span className="sm3-mv-col"><i className="sm3-chip sm3-k-work">MEP</i><i className="sm3-chip sm3-k-sys">PCW</i></span>
    </span>
  )
  if (id === 'lights') return (
    <span className="sm3-mv sm3-mv-lights" aria-hidden="true">
      {SERVICES.map((s, i) => <i key={s.id} data-s={i === 4 ? 'ask' : 'lit'} style={{ '--i': i }}>{s.n}</i>)}
    </span>
  )
  return (
    <span className="sm3-mv sm3-mv-hook" aria-hidden="true">
      {HOOK_PHASES.map((p, i) => <span key={p} style={{ '--i': i }}><i>{i + 1}</i>{p}</span>)}
    </span>
  )
}

function Moments() {
  const [play, setPlay] = useState(false)
  return (
    <section className="sm3-blk" aria-labelledby="sm3-h-mom">
      <Head id="sm3-h-mom" title="Interactive moments to build" lede="Four interactive pieces that show how the parts connect. Two are live on the site, two are proposed." />
      <ul className="sm3-moms">
        {MOMENTS.map(m => (
          <li key={m.id} className={'sm3-mom sm3-k-' + m.k}>
            <MomentVis id={m.id} play={play} onPlay={() => setPlay(p => !p)} />
            <span className="sm3-mom-tx">
              <span className="sm3-mom-top"><i className="sm3-mom-ic" aria-hidden="true"><Icon name={m.icon} /></i><b>{m.title}</b></span>
              <span className="sm3-mom-t">{m.line}</span>
              <span className="sm3-mom-st"><Tag live={m.live} />{m.when && <small>{m.when}</small>}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   7 · one name each, one goal per page
   --------------------------------------------------------------------------- */
function NamesGoals() {
  return (
    <section className="sm3-blk" aria-labelledby="sm3-h-names">
      <Head id="sm3-h-names" title="One name each, one goal per page" />
      <div className="sm3-ng">
        <div className="sm3-panel">
          <b className="sm3-panel-h">The names</b>
          <ul className="sm3-names">
            {NAMES.map(n => (
              <li key={n.is}>
                <span className="sm3-names-row"><s>{n.was}</s><i aria-hidden="true"><Icon name="arrow" /></i><b>{n.is}</b></span>
                <small>{n.why}</small>
              </li>
            ))}
          </ul>
        </div>
        <div className="sm3-panel">
          <b className="sm3-panel-h">The goals</b>
          <ul className="sm3-goals">
            {END_GOALS.map(([p, g]) => (
              <li key={p}><span className="sm3-goal-p">{p}</span><span>{g}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   the section body
   --------------------------------------------------------------------------- */
export default function SiteMock() {
  const [lb, setLb] = useState(null)
  const retRef = useRef(null)
  const openLb = (n, el) => { retRef.current = el || null; setLb(n) }
  const closeLb = React.useCallback(() => setLb(null), [])
  const stepLb = React.useCallback(d => setLb(n => {
    const i = SLIDES.findIndex(s => s.n === n)
    return SLIDES[(i + d + SLIDES.length) % SLIDES.length].n
  }), [])
  /* focus goes back to whatever opened the lightbox */
  useEffect(() => {
    if (lb == null && retRef.current) { const el = retRef.current; retRef.current = null; if (el.isConnected) el.focus({ preventScroll: true }) }
  }, [lb])
  return (
    <div className="sm3">
      <ReadingOrder />
      <MenuReplica />
      <ServicesPage openLb={openLb} />
      <Anatomy />
      <SlideGrid openLb={openLb} />
      <Moments />
      <NamesGoals />
      {lb != null && <Lightbox n={lb} onClose={closeLb} onStep={stepLb} />}
    </div>
  )
}
