import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { UNITS as CODEX_UNITS } from '../data/codex.js'
/* the unit pages pass their own ids (cap-epc, cap-tool, cap-pcu, cap-energy); the data keys are epc, hookup, efm */
const UNIT_OF = { 'cap-epc': 'epc', 'cap-tool': 'hookup', 'cap-pcu': 'hookup', 'cap-energy': 'efm' }
const UNIT_WHEN = Object.fromEntries(Object.entries(UNIT_OF).map(([k, v]) => [k, CODEX_UNITS.find(u => u.id === v)?.when]))
import { Link } from 'react-router-dom'
import Nav from './Nav.jsx'
import ClosingBand from './ClosingBand.jsx'
import Icon from './FlowIcon.jsx'
import { UNITS as CX_UNITS, SERVICES as CX_SERVICES, WORK as CX_WORK } from '../data/codex.js'
import UnitArt from './UnitArt.jsx'
import CycleFlow from './CycleFlow.jsx'
import { CYCLE } from '../data/cycle.js'
import '../styles/cycle-flow.css'
import UnitBuild from './UnitBuild.jsx'
/* 25 Sep: EFM's district cooling section as a 3D model and the three Energy as a Service models (intro.scene) */
import DistrictCooling3D from './DistrictCooling3D.jsx'
import { iconFor } from './DetailDiagram.jsx'
import { crumbLd } from './PageHead.jsx'
import { jargon } from '../lib/jargon.jsx'
import { useMomentum } from '../lib/momentum.js'
import { INDLBL, TYPLBL } from '../data/projects.js'
import { cmsProjects, live } from '../lib/cms.js'
import '../styles/pages.css'
import '../styles/unit.css'

const PROJECTS = live(cmsProjects)

/* ============================================================================
   UnitPage (15 Sep 2026): the template behind the three business units, replacing
   CapabilityPage for EPC & Construction, Total Tools Hookup Solution and Energy Facility
   Management. Bazil: "a lot better, more premium, detailed but snappy, no repetition, flow
   easy to understand, very good visuals and animation, not lame."

   One flow, six moves, each said once:
     1 hero        the photograph, the claim, three facts
     2 what        the definition, the heading beside the copy
     3 models      how it is bought, when a unit has two ways (EPCC / EPCM, CaaS / EPC)
     4 cycle       the unit's drawn diagram (UnitArt) pinned beside the stages: the stage under
                   the eye lights in the drawing, and its row carries the sentence and the scope
     4c build      IAQ's own 3D model building up as the visitor scrolls (UnitBuild), then the
                   unit's own extract from the coordination model
     5 delivers    why owners choose it as plain statements
     6 proof       three published projects, then the ask
   The "supplied by IAQ" slot is no longer printed on the page (Bazil, Culture pass: "no
   skeletons"); pages may still pass it and the handover file carries what is owed.

   17 Sep (client, on the EPC page: "Repetitive information. Try to merge the design and
   information into one section explaining the cycle of the project"). The drawing used to sit
   beside the definition near the top, and the step rail lower down said the same stages again
   with a card that restated the row under the eye. They are one section now (4 above); the
   previous cut is in src/_backups/unit-cycle-0917/.

   Motion: reveal on entry (data-rv, staggered by --d), the diagram draws itself, the hero
   photograph carries momentum, and the cycle rail lights the stage nearest the viewport
   centre. Everything is visible without JS; the classes only add the motion.
   ============================================================================ */

function useReveal(root) {
  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const items = Array.from(el.querySelectorAll('[data-rv]'))
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const on = n => n.classList.add('in')
    if (reduce || !('IntersectionObserver' in window)) { items.forEach(on); return () => {} }
    el.classList.add('un-armed')
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { on(e.target); io.unobserve(e.target) } }),
      { rootMargin: '0px 0px -10% 0px', threshold: 0.01 })
    items.forEach(n => io.observe(n))
    /* a jump to an anchor or a fast scroll must never strand a hidden block. The sweep runs on the
       scroll event itself (throttled by time, not by rAF: a backgrounded tab stalls frames and
       observer callbacks alike) and once more as a failsafe after arrival. */
    let last = 0
    const sweep = () => { const vh = window.innerHeight; items.forEach(n => { if (!n.classList.contains('in') && n.getBoundingClientRect().top < vh * .96) on(n) }) }
    const onScroll = () => { const now = Date.now(); if (now - last > 80) { last = now; sweep() } }
    window.addEventListener('scroll', onScroll, { passive: true })
    const t1 = setTimeout(sweep, 900), t2 = setTimeout(sweep, 2600)
    return () => { io.disconnect(); clearTimeout(t1); clearTimeout(t2); window.removeEventListener('scroll', onScroll) }
  }, [root])
}

function ProofCard({ p, i }) {
  return (
    <Link className="un-pc" to={'/projects/' + i} data-rv="">
      <span className="un-pc-fig"><span className="un-mo" data-mo="0.4"><img src={p.img} alt="" loading="lazy" decoding="async" /></span></span>
      <span className="un-pc-in">
        <span className="un-pc-ref"><span>{p.loc}</span><b>{p.iso}</b></span>
        <b className="un-pc-t">{p.name}</b>
        <span className="un-pc-c">{p.client}</span>
        <span className="un-pc-tags"><span className="is-b">{INDLBL[p.ind]}</span><span>{TYPLBL[p.type]}</span></span>
      </span>
    </Link>
  )
}

/* 26 Sep: an even grid for n cards: 3 columns (4 from seven cards); the first card spans two when that closes the rows */
const bentoCols = (n, max = 3) => (n >= 7 ? 4 : n === 4 ? 2 : Math.min(max, 3))
const bentoWide = (n, max = 3) => { const c = bentoCols(n, max); return n % c !== 0 && (n + 1) % c === 0 }
const bentoVars = (n, max = 3) => ({ '--cols': bentoCols(n, max) })

export default function UnitPage(props) {
  const {
    id, no, of = 3, name, full, title, lede, image, art, band, pull,
    facts = [], what = [], hard, pains = [], painsHead, services, servicesHead, servicesLede, intro, bim, models, modelsHead, compare, bandRep,
    steps = [], items = [], why = [], cycleHead, cycleLede,
    filter, proofNote, proofLink, cta, rep, cycle, works = true, scope, introEnd, servicesFlow = false, modelsJoin = 'or',
  } = props

  const root = useRef(null)
  const bandIsRep = bandRep === undefined ? rep : bandRep
  /* 18 Sep (the Codex, parts 4 and 5 of the unit page): the six services with this unit's own lit,
     and the three disciplines with their systems. Read from src/data/codex.js so the four pages and
     the Codex can never disagree about what a unit carries. PCU is a service of the hookup unit. */
  const cxUnit = CX_UNITS.find(u => u.id === ({ 'cap-epc': 'epc', 'cap-tool': 'hookup', 'cap-pcu': 'hookup', 'cap-energy': 'efm' }[id]))
  const [cur, setCur] = useState(0)
  /* which "why owners choose it" beat is open. The first one stands open so the section is never
     a row of closed labels; hovering or clicking moves it. */
  const [openBeat, setOpenBeat] = useState(0)
  /* which contract model the comparison is answering for */
  const [pick, setPick] = useState(0)

  useEffect(() => { document.title = `IAQ Group · ${name} · Brand Method` }, [name])
  useReveal(root)
  useMomentum()

  /* the hero numbers count up once, when they arrive; only plain integers, the ranges stay as text */
  useEffect(() => {
    const el = root.current
    if (!el) return
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nodes = Array.from(el.querySelectorAll('.un-facts b[data-n]'))
    if (!nodes.length || reduce) return
    const timers = []
    nodes.forEach((n, i) => {
      const target = parseInt(n.dataset.n, 10)
      const t0 = performance.now() + 350 + i * 120, dur = 1100
      const step = t => {
        const k = Math.max(0, Math.min(1, (t - t0) / dur)), e = 1 - Math.pow(1 - k, 3)
        n.textContent = String(Math.round(target * e))
        if (k < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
      timers.push(setTimeout(() => { n.textContent = String(target) }, 350 + i * 120 + dur + 300))
    })
    return () => timers.forEach(clearTimeout)
  }, [])

  /* the sequence rail: the step whose row sits nearest the middle of the viewport is the one
     the sticky panel shows. A band around the centre, not the whole viewport, so only one row
     can own it at a time. */
  useEffect(() => {
    const el = root.current
    if (!el || !('IntersectionObserver' in window)) return
    const rows = Array.from(el.querySelectorAll('.un-step'))
    if (!rows.length) return
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) setCur(Number(e.target.dataset.i)) })
    }, { rootMargin: '-42% 0px -46% 0px', threshold: 0 })
    rows.forEach(r => io.observe(r))
    return () => io.disconnect()
  }, [steps.length])

  const proof = PROJECTS.map((p, i) => ({ p, i })).filter(({ p }) => (filter ? filter(p) : true)).slice(0, 3)
  const ld = crumbLd([{ label: 'Home', to: '/' }, { label: 'Services', to: '/services' }, { label: name, to: '' }])
  const step = steps[cur] || steps[0]

  return (
    <>
      <Nav />
      <div className="un-page" ref={root}>

        {/* 1 · hero */}
        {/* 15 Sep, second cut (Bazil: "the sizing, visual and stuff"): the photograph is a panel beside the copy,
            not a scrimmed wash behind it; the band is as tall as its content; the facts carry the weight */}
        <header className="un-hero">
          <div className="pg-in un-hero-in">
            <div className="un-hero-copy">
              {/* 15 Sep (Bazil: "too much to read at the top, proper navigation is fine"): no breadcrumb line and no
                  unit line above the headline; the nav carries the way here, the crumb data stays for search engines */}
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
              <h1 className="un-h1" data-rv="">{title}</h1>
              <p className="un-lede" data-rv="" style={{ '--d': '.1s' }}>{lede}</p>
              {/* 24 Sep: when to call this unit, in the client's words (codex.js UNITS.when, also on the Services page cards) */}
              {UNIT_WHEN[id] && <p className="un-when" data-rv="" style={{ '--d': '.14s' }}><span>Call {name} when</span>{UNIT_WHEN[id]}</p>}
            </div>
            <figure className="un-hero-fig" data-rv="" style={{ '--d': '.12s' }}>
              {/* a silent loop when the page has one (its still is the poster and the fallback); the still otherwise */}
              <span className="un-mo" data-mo="0.5">
                {/* 25 Sep (Bazil: "the videos are not shown"): the still always sits under the loop, so a device that hides
                    motion (Reduce Motion hides the video, see unit.css) or a slow network still shows the picture */}
                <img src={image?.src} alt={image?.alt || ''} />
                {image?.video && <video src={image.video} poster={image.src} muted loop playsInline autoPlay preload="auto" aria-hidden="true" tabIndex={-1} />}
              </span>
              {rep && <span className="un-rep">Representation</span>}
            </figure>
            {facts.length > 0 && (
              <ul className="un-facts" data-rv="" style={{ '--d': '.26s' }}>
                {facts.map((f, i) => <li key={i} style={{ '--i': i }}><b data-n={/^\d+$/.test(String(f.v)) ? f.v : undefined}>{f.v}</b><span>{f.l}</span></li>)}
              </ul>
            )}
          </div>
        </header>

        {/* 2 · what it is. 17 Sep: the drawing that stood beside this copy is the sticky panel of
            the cycle section now (client: "repetitive information"), so the definition stands on
            its own, the heading in the left column and the paragraphs in the right. */}
        {/* 26 Sep (Bazil: "improve visually all the unit pages", "boring and messy", "don't add unnecessary info"; references:
            Bechtel's and Exyte's unit pages, one statement and a picture): what the unit is, in one statement beside the
            unit's own photograph. The further paragraphs and the "hard" line repeated the hero and the claim band. */}
        <section className="un-sec un-what" aria-labelledby="un-what-h">
          <div className="pg-in">
            <div className={'un-intro2' + (band ? ' has-fig' : '')}>
              <div className="un-intro2-copy">
                <h2 id="un-what-h" className="un-h2" data-rv="">What <em>{name} is.</em></h2>
                {what[0] && <p className="un-state" data-rv="" style={{ '--d': '.06s' }}>{jargon(what[0])}</p>}
                {pains.length > 0 && (<>
                  <h3 className="un-pains-h" data-rv="" style={{ '--d': '.1s' }}>{painsHead || <>The problems <em>it solves.</em></>}</h3>
                  <ul className="un-pains2">
                    {pains.map((x, i) => (
                      <li key={x.k} data-rv="" style={{ '--d': `${.12 + i * .05}s` }}>
                        <Icon name={x.icon || iconFor(x.k + ' ' + x.t)} className="un-pains2-ic" />
                        <b>{x.k}</b><span>{x.t}</span>
                      </li>
                    ))}
                  </ul>
                </>)}
              </div>
              {band && (
                <figure className="un-intro2-fig" data-rv="" style={{ '--d': '.12s' }}>
                  <span className="un-mo" data-mo="0.35"><img src={band} alt="" loading="lazy" decoding="async" /></span>
                  {bandIsRep && <span className="un-rep">Representation</span>}
                </figure>
              )}
            </div>
          </div>
        </section>

        {/* 5 · why owners choose it.
             25 Sep (Bazil: "why owners choose would be before the process", then "all 3 business unit pages, why choose
             first then how it works"): the reasons come straight after what the unit is, ahead of its services, how it
             is bought, its scope and its cycle. And ("fix the way it's being put together"): the hover cards opened one
             at a time, so the rows ran to uneven heights and a seventh claim sat alone on its own row. One aligned list
             now, every claim beside its sentence, nothing to open. */}
        {why.length > 0 && (
          <section className="un-sec un-deliver" aria-labelledby="un-del-h">
            <div className="pg-in">
              <h2 id="un-del-h" className="un-h2" data-rv="">Why owners <em>choose it.</em></h2>
              {/* 26 Sep: an even grid of equal cards, the first one led in navy; it spans two columns when the count is odd,
                  so no card is ever left alone on a row */}
              <ol className="un-bento" style={bentoVars(why.length)}>
                {why.map((b, i) => (
                  <li className={'un-bento-c' + (i === 0 ? ' is-lead' : '') + (i === 0 && bentoWide(why.length) ? ' is-wide' : '')} key={b.k} data-rv="" style={{ '--d': `${Math.min(i, 6) * .05}s` }}>
                    <Icon name={b.icon || iconFor(b.k + ' ' + b.t)} className="un-bento-ic" />
                    <b>{b.k}</b>
                    <p>{jargon(b.t)}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* 24 Sep (client, EFM: "they have 7 end-to-end Energy Management Services, refer our current website"): a unit
            can carry its services as a grid, one line each, as IAQ's own page lists them */}
        {services && services.length > 0 && (
          <section className="un-sec un-svc7" aria-labelledby="un-svc7-h">
            <div className="pg-in">
              <h2 id="un-svc7-h" className="un-h2" data-rv="">{servicesHead || <>What EFM <em>offers.</em></>}</h2>
              {servicesLede && <p className="un-cycle-lede" data-rv="" style={{ '--d': '.06s' }}>{servicesLede}</p>}
              {/* 26 Sep: steps in sequence read as a process strip (PCU & TTI); a set of services as an even grid (EFM) */}
              <ol className={servicesFlow ? 'un-flow' : 'un-svc7-grid'} style={servicesFlow ? { '--n': services.length } : bentoVars(services.length, 4)}>
                {services.map((sv, i) => (
                  <li key={sv.t} className={!servicesFlow && i === 0 && bentoWide(services.length, 4) ? 'is-wide' : undefined} data-rv="" style={{ '--d': `${.08 + (i % 5) * .06}s` }}>
                    <span className="un-svc7-n">0{i + 1}</span>
                    {sv.icon && <span className="un-svc-mark" aria-hidden="true"><Icon name={sv.icon} /></span>}
                    <b>{sv.t}</b>
                    <span>{sv.d}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* 3 · how it is bought */}
        {models && models.length > 0 && (
          <section className="un-sec un-models" aria-labelledby="un-models-h">
            <div className="pg-in">
              <h2 id="un-models-h" className="un-h2" data-rv="">{modelsHead || <>Two ways to <em>buy it.</em></>}</h2>
              {/* 26 Sep: a pair reads as a pair: "or" between two ways to buy, an arrow from what arrives to what leaves */}
              <div className={'un-model-grid' + (models.length === 2 ? ' is-pair' : '')}>
                {models.map((m, i) => (<React.Fragment key={m.t}>
                  {i === 1 && models.length === 2 && <span className={'un-join is-' + modelsJoin} aria-hidden="true">{modelsJoin === 'arrow' ? <Icon name="arrow" /> : 'or'}</span>}
                  <article className={'un-model' + (i === 1 && modelsJoin === 'arrow' ? ' is-result' : '')} data-rv="" style={{ '--d': `${.08 + i * .1}s` }}>
                    <span className="un-model-n">0{i + 1}</span>
                    <h3>{m.t}</h3>
                    <span className="un-model-s">{m.s}</span>
                    <p>{jargon(m.d)}</p>
                    {m.pts && <ul>{m.pts.map(x => <li key={x}>{x}</li>)}</ul>}
                  </article>
                </React.Fragment>))}
              </div>
              {/* 17 Sep (client: "Maybe can further design this section instead of listing in words
                  form. Open to suggestion or maybe we can exclude this information if there is no
                  better way to explain this section"). The five rows were a word table a reader had
                  to compare across by eye. It is a chooser now: pick the way you would buy it and
                  the page answers the five questions for THAT model, with the other model's answer
                  kept beside it in small type so the difference is still legible. The information
                  stays, because it is the thing an owner actually has to decide. */}
              {compare && compare.rows && (
                <div className="un-pick" data-rv="" style={{ '--d': '.2s' }}>
                  <div className="un-pick-top">
                    <span className="un-pick-k">{compare.head || 'At a glance'}: {models[pick] && models[pick].t}</span>
                    <div className="un-pick-tabs" role="tablist" aria-label="Choose a contract model">
                      {models.map((m, i) => (
                        <button type="button" key={m.t} role="tab" aria-selected={pick === i}
                                className={'un-pick-tab' + (pick === i ? ' on' : '')}
                                onClick={() => setPick(i)}>{m.t}</button>
                      ))}
                    </div>
                  </div>
                  <dl className="un-pick-rows">
                    {compare.rows.map(([k, ...vals]) => (
                      <div className="un-pick-row" key={k}>
                        <dt>{k}</dt>
                        <dd>
                          {/* 24 Sep (client: "when I click EPCC the description shows EPCM ... Kindly clarify"): the
                              other model's answer no longer prints under the chosen one; the ledger answers for the
                              model in red, and says which one it is answering for */}
                          <b key={pick}>{vals[pick]}</b>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </section>
        )}

        {cxUnit && (scope || works || (intro && !introEnd)) && (
          <section className="un-sec un-scope" aria-labelledby="un-scope-h">
            <div className="pg-in">
              {/* 24 Sep (client, EPC page: "Choose either one for below section because the information is repetitive ...
                  Prefer bottom design and can continue with below section"): the six-services list is gone from the unit
                  pages, the cycle carries the stages, and this section is the work and the systems inside it */}
              {intro && !introEnd && (
                <div className="un-intro" data-rv="">
                  {/* 24 Sep (client, EFM: "This section can replace with brief introduction of district cooling system") */}
                  <h2 className="un-h2">{intro.head}</h2>
                  <div className="un-intro-body">
                    {intro.paras.map((t, i) => <p className="un-p" key={i}>{jargon(t)}</p>)}
                    {intro.to && <Link className="un-more" to={intro.to}>{intro.cta}</Link>}
                  </div>
                </div>
              )}
              {/* 25 Sep (Bazil): on PCU & TTI IAQ's own Services Scope slide stands here in place of the work cards ("wouldn't
                  this be better replaced with picture 2"); on EFM the cards are off ("this one can remove"). `scope` is a
                  page's own block, `works={false}` drops the cards. */}
              {scope ? scope : works && (<>
              <h2 id="un-scope-h" className="un-h2">The work, <em>and the systems inside it.</em></h2>
              <div className="un-works">
                {CX_WORK.map(w => (
                  <div key={w.id} className={'un-work' + (cxUnit.work.includes(w.id) ? ' is-on' : ' is-off')}>
                    <span className="un-work-top">
                      <span className="un-svc-mark" aria-hidden="true"><Icon name={w.icon} /></span>
                      <b>{w.name}</b>
                      <span className="un-work-full">{w.full}</span>
                    </span>
                    <ul className="un-systems">{w.systems.map(x => <li key={x}>{x}</li>)}</ul>
                  </div>
                ))}
              </div>
              </>)}
            </div>
          </section>
        )}

        {/* 4 · the cycle: the drawing pinned beside the stages.
            17 Sep (client, EPC page: "Repetitive information. Try to merge the design and information
            into one section explaining the cycle of the project"). One section now. The drawing is
            the sticky panel and the stage under the eye lights in it (UnitArt `active`); each row
            carries its stage's sentence and the scope IAQ delivers there (the `covers` chips, moved
            onto the stages on 17 Sep: "merge this information with lifecycle and remove this
            section"). The card that repeated the row's title and sentence is gone. The observer
            below still picks the row nearest the viewport centre; clicking a row's head picks it too. */}
        {steps.length > 0 && (
          <section className="un-sec un-cycle" aria-labelledby="un-seq-h">
            <div className="pg-in">
              <div className="un-cycle-head">
                <h2 id="un-seq-h" className="un-h2" data-rv="">{cycleHead || <>The project cycle, <em>stage by stage.</em></>}</h2>
                <p className="un-cycle-lede" data-rv="" style={{ '--d': '.06s' }}>{cycleLede || 'Each stage lights in the drawing as you read it, with the scope IAQ delivers there.'}</p>
              </div>
              <div className="un-cycle-grid">
                <div className="un-cycle-stick">
                  <figure className="un-figure un-cycle-fig" data-rv="" style={{ '--d': '.1s' }}>
                    {/* 25 Sep (Bazil, EPC: "no need to explain so much detail, use the same cycle visual"): the Services page's
                        cycle, the unit's own stages lit in turn, the ones it does not carry quiet */}
                    {cycle ? <div className="un-cyc"><CycleFlow stages={CYCLE} active={cycle.map[cur] ?? 0} onStage={() => {}} dim={cycle.dim || []} /></div> : <UnitArt kind={art} active={cur} bare={!!scope} />}
                    <figcaption className="un-cycle-now" aria-live="polite">
                      <b>{String(cur + 1).padStart(2, '0')}</b><em>/ {String(steps.length).padStart(2, '0')}</em><span>{step.t}</span>
                    </figcaption>
                    {/* 26 Sep (Bazil: "don't add unnecessary info"): the scope of the stage in view sits under the drawing,
                        so the list reads as one line a stage and the detail follows the eye */}
                    {step.covers && step.covers.length > 0 && (
                      <ul className="un-now-covers" key={cur}>{step.covers.map(c => <li key={c}>{jargon(c)}</li>)}</ul>
                    )}
                  </figure>
                </div>
                <ol className="un-steps">
                  {/* data-rv sits on the inner block, not the li: React rewrites the li's className on
                      every stage change and would wipe the `in` class the reveal observer adds */}
                  {steps.map((s, i) => (
                    <li key={i} className={'un-step' + (i === cur ? ' on' : i < cur ? ' done' : '')} data-i={i}>
                      <div className="un-step-in" data-rv="" style={{ '--d': `${i * .05}s` }}>
                        <button type="button" className="un-step-h" onClick={() => { setCur(i) }} aria-current={i === cur ? 'step' : undefined}>
                          <span className="un-step-n">{String(i + 1).padStart(2, '0')}</span>
                          <span className="un-step-ic" aria-hidden="true"><Icon name={s.icon || iconFor(s.t + ' ' + s.k)} /></span>
                          <span className="un-step-t"><b>{s.k}</b><span>{s.t}</span></span>
                        </button>
                        <p className="un-step-d">{jargon(s.d.split(/(?<=\.)\s/)[0])}</p>
                        {false && s.covers && s.covers.length > 0 && (
                          <ul className="un-covers">
                            {s.covers.map(c => <li key={c}>{jargon(c)}</li>)}
                          </ul>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>
        )}

        {/* 4c · from IAQ's own model.
            17 Sep (client: "And to include diagram if possible. 3D animation can be included in the
            page if possible"). Two things from the SharePoint share. First, IAQ's own 3D model of a
            facility, rendered as a sequence of the building going up: it builds as the visitor
            scrolls (UnitBuild). Then the unit's own extract from the Revit coordination model, one
            per system: not an illustration of the work, the drawing the work is built from. */}
        {/* 24 Sep (client, EPC: "Remove below section, too repetitive"; PCU: "mcm glitch ke bug gitu?"; EFM: "Remove
            this section"): the model-build section is off on every unit page. The code stays for the Codex. */}
        {false && bim && (
          <section className="un-sec un-bim" aria-labelledby="un-bim-h">
            <div className="pg-in">
              <div className="un-bim-head">
                <h2 id="un-bim-h" className="un-h2" data-rv="">{bim.head || <>From IAQ&rsquo;s own <em>model.</em></>}</h2>
                <p className="un-bim-lede" data-rv="" style={{ '--d': '.06s' }}>{bim.lede || 'The facility as IAQ’s own model builds it: the piles, the structure and the roof, then the services that run it, floor by floor.'}</p>
              </div>
              <UnitBuild />
              <div className="un-bim-sys">
                {bim.cap && <p className="un-bim-cap" data-rv="">{bim.cap}</p>}
                <figure className="un-bim-fig" data-rv="" style={{ '--d': '.08s' }}>
                  <img src={bim.src} alt={bim.alt} loading="lazy" decoding="async" />
                </figure>
              </div>
            </div>
          </section>
        )}

        {/* 4b · the claim, on the unit's own photograph. 26 Sep: off on all three pages; each claim repeated the hero or a
            reason above it, and the photograph now stands beside the intro */}
        {false && pull && (
          <section className="un-band" aria-label={`${name}: the claim`}>
            <span className="un-band-fig" aria-hidden="true"><span className="un-mo" data-mo="0.6"><img src={band || image?.src} alt="" loading="lazy" decoding="async" /></span></span>
            {/* 17 Sep: the band tag is its own flag. Two of these pages now carry IAQ's own
                photograph on the band while the hero is still a generated still, and a real
                photograph must not be labelled a representation. */}
            {bandIsRep && <span className="un-rep un-rep-band">Representation</span>}
            <div className="pg-in un-band-in">
              <span className="un-band-k" data-rv="">{name}</span>
              <p className="un-band-q" data-rv="" style={{ '--d': '.1s' }}>{pull}</p>
            </div>
          </section>
        )}

        {/* 6 · proof */}
        {proof.length > 0 && (
          <section className="un-sec un-proof" aria-labelledby="un-proof-h">
            <div className="pg-in">
              <div className="un-proof-head">
                <h2 id="un-proof-h" className="un-h2" data-rv="">Delivered <em>this way.</em></h2>
                <Link className="un-more" to={(proofLink && proofLink.to) || '/projects'} data-rv="">{(proofLink && proofLink.label) || 'See all published projects'}</Link>
              </div>
              <div className="un-proof-grid" data-n={proof.length}>
                {proof.map(({ p, i }) => <ProofCard p={p} i={i} key={i} />)}
              </div>
              {proofNote && <p className="un-note" data-rv="">{proofNote}</p>}
            </div>
          </section>
        )}

        {/* 25 Sep (Bazil, EFM: "district cooling can put at the bottom", then "explain district cooling nice and
            straightforward"): the brief closes the page, told as one picture and three plain steps */}
        {intro && introEnd && intro.scene && <DistrictCooling3D intro={intro} />}
        {intro && introEnd && !intro.scene && (
          <section className="un-sec un-dcs" aria-labelledby="un-dcs-h">
            <div className="pg-in">
              <h2 id="un-dcs-h" className="un-h2" data-rv="">{intro.head}</h2>
              {intro.lede && <p className="un-dcs-lede" data-rv="" style={{ '--d': '.06s' }}>{intro.lede}</p>}
              <div className="un-dcs-grid">
                {intro.fig && (
                  <figure className="un-dcs-fig" data-rv="" style={{ '--d': '.1s' }}>
                    <img src={intro.fig.src} alt={intro.fig.alt} width="1600" height="730" loading="lazy" decoding="async" />
                    <span className="un-dcs-tag">Illustration</span>
                  </figure>
                )}
                <div className="un-dcs-copy">
                  {intro.steps && (
                    <ol className="un-dcs-steps">
                      {intro.steps.map((x, i) => (
                        <li key={x.k} data-rv="" style={{ '--d': `${.12 + i * .06}s` }}>
                          <span className="un-beat-n">{String(i + 1).padStart(2, '0')}</span>
                          <b>{x.k}</b>
                          <p>{x.t}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                  {(intro.paras || []).map((t, i) => <p className="un-dcs-by" key={i} data-rv="">{jargon(t)}</p>)}
                  {intro.to && <Link className="un-more" to={intro.to} data-rv="">{intro.cta}</Link>}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 17 Sep (client: "Remove this page, too much interlink section, a bit messy"): the
            "Where this goes next" strip is gone from the unit pages. The footer sitemap and the
            menu carry those routes already. */}

      </div>
      <ClosingBand />
    </>
  )
}
