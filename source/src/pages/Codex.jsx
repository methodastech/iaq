import React, { useEffect, useRef, useState } from 'react'
import { useAbbr } from '../lib/abbr.js'
import { Navigate, useLocation } from 'react-router-dom'
import Icon from '../components/FlowIcon.jsx'
import { SLIDES } from '../components/CodexSlides.jsx'
import FabStory from '../components/codex/FabStory.jsx'
import RelExplorer from '../components/codex/RelExplorer.jsx'
import SystemMap from '../components/SystemMap.jsx'
import Faq from '../components/Faq.jsx'
import Watch from '../components/codex/Watch.jsx'
import KindsGuide from '../components/codex/KindsGuide.jsx'
import IsoFamily from '../components/codex/IsoFamily.jsx'
import CycleFlow from '../components/CycleFlow.jsx'
import WorksBand from '../components/WorksBand.jsx'
import ToolInstallDiagram from '../components/ToolInstallDiagram.jsx'
import { DgEpcV, DgHookupV, DgEfmV } from '../components/UnitDiagramsV.jsx'
import { CYCLE } from '../data/cycle.js'
import '../styles/cycle-flow.css'
import SiteMock from '../components/codex/SiteMock.jsx'
import FabAssembly from '../components/FabAssembly.jsx'
import { OPEN_QUESTIONS, CROSSCHECK, BENCHMARK, THE_BAR, PROFILE_ORDER, UNITS, SERVICES, WORK, QUESTIONS, SCENARIOS, RULES, TERMS, STATUS, VIDEOS, LIFE, FAQ, CONTRACTORS, CONTRACTOR_COLS } from '../data/codex.js'
import '../styles/pages.css'
import '../styles/codex.css'
import '../styles/codex-parts.css'
import { useMomentum } from '../lib/momentum.js'

/* ============================================================================
   The Codex · a tab of the member portal (/portal/codex).

   18 Sep 2026, Bazil's brief, from the start: "separate it into three sections overall: for the normal people
   to understand; for the professionals and their target market, because they are knowledgeable; and lastly how
   we should portray it on the website. Amazing design, interactive, and overall super easy to understand and
   imagine and know its relationship. Go all out." And: "make it clearer and easier to understand", "an option
   to just download the Codex page only".

   So the page is the three sections, each built for its reader, with the decisions on top and the document
   check and the background below:
     key         the six colours, one meaning each, used on every picture on the page
     decisions   the open questions, each with what was done meanwhile
     1 everyone  three plain sentences, the fab build-up you can play, pictures 0 to 2
     2 industry  the buyer's three questions, the relationship map, pictures 3 to 11, six buyer requests
     3 website   the site mockups (components/codex/SiteMock.jsx) and where each picture goes in the profile
     checked     IAQ's own documents against the site
     background  the benchmark, the reading rules, the terms by layer, applied and next (closed by default)
   The Download button serves /codex/IAQ-Codex.pdf, made by tools/export-codex-pdf-0918.mjs from this page's
   print styles: the three sections and the check, landscape, one picture per page, no site chrome.
   ============================================================================ */

const byId = (list, id) => list.find(x => x.id === id)

function SecHead({ no, title, lede, id }) {
  return (
    <div className={'cx-sh' + (no ? '' : ' nonum')} id={id}>
      {no && <span className="cx-no" aria-hidden="true">{no}</span>}
      <div>
        <h2>{title}</h2>
        {lede && <p className="pg-lede">{lede}</p>}
      </div>
    </div>
  )
}

/* ---------- the key: how to read every picture ---------- */
/* 24 Sep (Bazil: "these need more explanation, example or snappy info"): each kind carries its meaning, the
   real examples from the data, and one plain analogy */
const KEY = [
  ['u', 'Business unit', 'Who you buy from. IAQ has three.', 'EPC · PCU & TTI · EFM', 'The company you sign with.'],
  ['m', 'Delivery model', 'How the contract runs.', 'EPCC · EPCM · Cooling as a Service · Energy Performance Contracting', 'The shape of the deal.'],
  ['s', 'Service', 'What is in the contract. Six, one or all.', 'Design · Procure · Construct · Commission · Maintain · Hook up', 'The menu.'],
  ['w', 'Work', 'The discipline that does it.', 'CSA · MEP · Process utilities', 'The trades on site.'],
  ['y', 'System', 'The thing being built.', 'Process cooling water · Ultrapure water · Fan filter units · Fire protection', 'The parts of the fab.'],
  ['k', 'Market', 'Who it is for. Seven industries.', 'Semiconductor · Data centre · EV battery · Photovoltaics · District cooling · Bio · Food', 'The customer.'],
]
function Key() {
  const r = useRef(null); useAbbr(r)
  return (
    <section ref={r} className="cx-key-band" aria-label="How to read every picture">
      <div className="pg-in">
        <div className="cx-key-in">
          <p className="cx-key-h"><b>How to read every picture.</b> One colour per kind of thing, the same everywhere on this page.</p>
          <ul className="cx-keys">
            {KEY.map(([k, t, d, eg, think]) => (
              <li key={k} className={'k-' + k}>
                <i />
                <span><b>{t}</b>{d}<em className="cx-key-eg" data-noab="">{eg}</em><small className="cx-key-think">Think: {think}</small></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ---------- decisions needed ---------- */
function OpenQuestions() {
  const r = useRef(null); useAbbr(r)
  if (!OPEN_QUESTIONS.length) return null
  return (
    <section ref={r} className="pg-sec cx-open" aria-labelledby="cx-open-h" id="questions">
      <div className="pg-in">
        <div className="cx-open-head">
          {/* 24 Sep (Bazil: "make it clear that these are questions to ask", "put a green answered, in your full
              access opinion and analysis"): each card is a question for a named person, with what was done
              meanwhile and Brand Method's answer in green */}
          <h2 id="cx-open-h">Ten questions to ask IAQ, <em>with our answer on each.</em></h2>
          <p className="pg-lede">Nothing waits on them. Under each question: what was done meanwhile, and the answer Brand Method would give if the call were ours.</p>
        </div>
        <ol className="cx-oq">
          {OPEN_QUESTIONS.map((x, i) => (
            <li key={x.q}>
              <span className="cx-oq-n">{i + 1}</span>
              <div>
                <span className="cx-oq-ask">Question for {x.who}</span>
                <b>{x.q}</b>
                <p><span>Meanwhile</span>{x.did}</p>
                {x.rec && <p className="cx-oq-rec"><span>Our answer</span>{x.rec}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------- the pictures of one section ---------- */
function Pictures({ part, title }) {
  return (
    <div className="cx-pics">
      <h3 className="cx-h3">{title}</h3>
      <div className="cx-set">
        {SLIDES.filter(sl => sl.part === part).map((sl, i) => (
          <figure className="cx-slide" key={sl.n}>
            <figcaption>
              {i === 0 && <span className="cx-set-label">{title}</span>}
              <span className="cx-slide-n">{sl.n === 0 ? 'Cover' : sl.n}</span>
              <span className="cx-slide-t"><b>{sl.name}</b><span>{sl.says}</span></span>
              <span className="cx-slide-use">{sl.use}</span>
            </figcaption>
            <sl.C />
          </figure>
        ))}
      </div>
    </div>
  )
}

/* ---------- section 1 · for everyone ---------- */
const PLAIN = [
  ['crane', 'EPC', 'It builds the factory.', 'From the first drawing to a finished, clean facility, under one contract.', 'Engineering, Procurement and Construction'],
  ['link', 'PCU & TTI', 'It connects the machines.', 'When production machines arrive in a chip factory, it brings them their gases, chemicals, water and power.', 'Process Critical Utilities & Total Tool Installation'],
  ['power', 'EFM', 'It runs it for less.', 'It maintains the plant and cuts the energy bill, funded by IAQ upfront.', 'Energy Facility Management'],
]
function PartOne() {
  const r = useRef(null); useAbbr(r)
  return (
    <section ref={r} className="pg-sec cx-part cx-p1 cx3" aria-labelledby="cx-h1">
      <div className="pg-in">
        <SecHead no="1" id="part1"
          title={<span id="cx-h1">For everyone. <em>What IAQ does, in plain words.</em></span>}
          lede="IAQ is one company with three businesses. Together they build a high-tech factory, fit it out and keep it running. No industry words needed." />
        <div className="cx-plain">
          {PLAIN.map(([ic, u, h, p, full], i) => (
            <div className="cx-plain-c" key={u}>
              <span className="cx-plain-top"><span className="cx-plain-ic"><Icon name={ic} /></span><i>{i + 1}</i></span>
              <b>{h}</b>
              <p>{p}</p>
              <span className="cx-plain-u" data-noab=""><b>{u}</b> ({full})</span>
            </div>
          ))}
        </div>
        <h3 className="cx-h3">Watch a fab being built, and who does each part</h3>
        <p className="cx-p">IAQ’s own 3D model of a semiconductor fab. Press play, drag the bar, or pick a moment.</p>
        <FabStory />
        {/* 24 Sep (Bazil: "make sure all info in the Codex, sectioned into the three parts"): the plain-words rows the
            Services page carries, kept here for newcomers. Same data (codex.js LIFE, UNITS.when, FAQ). */}
        <h3 className="cx-h3">The life of a facility, and who to call at each point</h3>
        <p className="cx-p">A facility is built, then equipped, then run. One business unit carries each phase.</p>
        <ol className="cx-life">
          {LIFE.map((l, i) => { const u = byId(UNITS, l.u); return (
            <li key={l.u} className="cx-life-i">
              <span className="cx-life-n">{i + 1}</span>
              <b>{l.k}</b><small>{l.t}</small>
              <p>{l.d}</p>
              <p className="cx-life-when"><span>Call {u.short || u.name} when</span>{u.when}</p>
            </li>
          ) })}
        </ol>
        {/* 25 Sep (Bazil: "any other diagram or process you need to upload in the Codex, please do, in the right sector") */}
        <h3 className="cx-h3">The six services, one after another</h3>
        <p className="cx-p">Design, procurement, construction, commissioning, maintenance, tools hookup; the hookup feeds the next design.</p>
        <div className="cx-diag cx-cyc"><CycleFlow stages={CYCLE} active={0} onStage={() => {}} /></div>
        <h3 className="cx-h3">How a district cooling system works</h3>
        <p className="cx-p">One central plant and its storage tank pipe chilled water to every building it serves. An illustration.</p>
        <div className="cx-diag"><img src="/assets/iaq/dcs-illustration.webp" alt="Illustration of a district cooling system: a central plant with cooling towers and a storage tank pipes chilled water to offices, a hospital, a university and a mall" loading="lazy" /></div>
        <h3 className="cx-h3">Questions clients ask, answered</h3>
        <p className="cx-p">As answered on the Services page.</p>
        <div data-noab=""><Faq embed /></div>
        <Pictures part={1} title="The pictures for everyone" />
        <Watch items={VIDEOS.everyone} cols={3} title="Watch it: three short films" lede="New to cleanrooms and chip factories? Start here. Nothing loads until you press play." />
      </div>
    </section>
  )
}

/* ---------- section 2 · for professionals ---------- */
function PartTwo() {
  const r = useRef(null); useAbbr(r)
  return (
    <section ref={r} className="pg-sec cx-part cx-p2 cx3" aria-labelledby="cx-h2">
      <div className="pg-in">
        <SecHead no="2" id="part2"
          title={<span id="cx-h2">For professionals. <em>How the industry reads IAQ.</em></span>}
          lede="Engineers and buyers in hi-tech construction do not shop for a service. They ask three questions, in this order, and classify a contractor by its answers." />
        <ol className="cx-qs">
          {QUESTIONS.map(q => (
            <li key={q.n} className={'cx-q q-' + q.layer.toLowerCase()}>
              <span className="cx-q-n">{q.n}</span>
              <b>{q.q}</b>
              <span className="cx-q-l">{q.layer}</span>
              <p>{q.a}</p>
            </li>
          ))}
        </ol>
        <h3 className="cx-h3">Everything IAQ does, and how it connects</h3>
        <p className="cx-p">Pick any service, unit, discipline or system. Its connections light up, and one sentence says what they mean.</p>
        <RelExplorer />
        {/* 24 Sep: the one-view chart built for the Services page, kept here too (Bazil: every new view or system
            we build is to be updated in the Codex). Same data as the explorer above, read as a table. */}
        <h3 className="cx-h3">The same, on one chart</h3>
        <p className="cx-p">The chart under the cover of the Services page: which unit carries which service, the work each one does, and where that work sits in the fab.</p>
        <SystemMap embed />
        <h3 className="cx-h3">The four kinds of work, and the systems in each</h3>
        <p className="cx-p">The three disciplines and the tools themselves, with the systems each covers, the units that do it and where it sits in the model.</p>
        <WorksBand embed />
        <h3 className="cx-h3">How each business unit works</h3>
        <p className="cx-p">The three drawings from the units board on the Services page: the flow of each unit, service red, unit blue, work yellow, systems green.</p>
        <div className="cx-ud3">
          <figure><figcaption>EPC</figcaption><DgEpcV /></figure>
          <figure><figcaption>PCU &amp; TTI</figcaption><DgHookupV /></figure>
          <figure><figcaption>EFM</figcaption><DgEfmV /></figure>
        </div>
        <h3 className="cx-h3">A tool hookup, as IAQ draws it</h3>
        <p className="cx-p">IAQ’s own Main Tool schematic, redrawn: the tool on the fab floor, the raised floor, the sub-fab equipment, and the lines between them in the direction they run.</p>
        <div className="cx-diag"><ToolInstallDiagram /></div>
        <h3 className="cx-h3">Three choices shape a quote</h3>
        <p className="cx-p">The model, the scope and the work, drawn as the Services page shows them.</p>
        <div className="cx-diag"><img src="/assets/iaq/quote-visual.webp" alt="Illustration of the three choices: a contract, a facility with its chosen wing, and the work" loading="lazy" /></div>
        <h3 className="cx-h3">Who does what, against the other kinds of contractor</h3>
        <p className="cx-p">The market classifies a contractor by the work it delivers. A process specialist does process only; a civil main contractor does CSA only; an M&amp;E contractor does MEP only. IAQ delivers all five kinds, which is what "inclusive" means on this site.</p>
        <div className="cx-cmp" data-noab="">
          <div className="cx-cmp-h"><span>Contractor</span>{CONTRACTOR_COLS.map(([id, l]) => <span key={id}>{l}</span>)}</div>
          {CONTRACTORS.map(c => (
            <div className={'cx-cmp-r' + (c.name === 'IAQ' ? ' me' : '')} key={c.name}>
              <span><b>{c.name}</b><small>{c.kind}</small></span>
              {CONTRACTOR_COLS.map(([id]) => <span key={id} className={c.has.includes(id) ? 'on' : 'off'}><i />{c.has.includes(id) ? 'Yes' : ''}</span>)}
            </div>
          ))}
        </div>
        <Pictures part={2} title="The pictures for professionals" />
        <Watch title="Watch it, by business unit" lede="Nine short tutorials. Each one explains a term used on this page."
          groups={[
            { name: 'EPC', sub: '(Engineering, Procurement and Construction)', items: VIDEOS.pro.filter(v => v.unit === 'epc') },
            { name: 'PCU & TTI', sub: '(Process Critical Utilities & Total Tool Installation)', items: VIDEOS.pro.filter(v => v.unit === 'hookup') },
            { name: 'EFM', sub: '(Energy Facility Management)', items: VIDEOS.pro.filter(v => v.unit === 'efm') },
          ]} />
        <details className="cx-more-in">
          <summary>Six buyer requests, each read as a path through the layers</summary>
          <div className="cx-scen">
            {SCENARIOS.map((s, i) => {
              const u = byId(UNITS, s.unit)
              return (
                <article className="cx-sc" key={i}>
                  <p className="cx-sc-ask">“{s.ask}”</p>
                  <dl className="cx-path">
                    <div className="p-u"><dt>Unit</dt><dd><b>{u.short || u.name}</b></dd></div>
                    <div className="p-m"><dt>Model</dt><dd>{s.model}</dd></div>
                    <div className="p-s"><dt>Scope</dt><dd><span className="cx-chips">{s.services.map(id => <i key={id}>{byId(SERVICES, id).short}</i>)}</span></dd></div>
                    <div className="p-w"><dt>Work</dt><dd><span className="cx-chips">{s.work.map(id => <i key={id}>{byId(WORK, id).name}</i>)}</span></dd></div>
                    <div className="p-y"><dt>System</dt><dd>{s.system}</dd></div>
                  </dl>
                </article>
              )
            })}
          </div>
        </details>
      </div>
    </section>
  )
}

/* ---------- section 3 · on the website ---------- */
function PartThree() {
  const r = useRef(null); useAbbr(r)
  return (
    <section ref={r} className="pg-sec cx-part cx-p3 cx3" aria-labelledby="cx-h3s">
      <div className="pg-in">
        <SecHead no="3" id="part3"
          title={<span id="cx-h3s">On the website. How the site shows it, <em>page by page.</em></span>}
          lede="The same order everywhere: business unit first, then how it is bought, what is in it, who does it, the proof, and one action. What is live now and what is proposed." />
        <SiteMock />
        <h3 className="cx-h3">In the company profile</h3>
        <p className="cx-p">IAQ, 18 September: the three unit pages go into the profile straight after the page on the three business units. Every picture above has its place.</p>
        <ol className="cx-prof">
          {PROFILE_ORDER.map(p => (
            <li key={p.where}>
              <span className="cx-prof-s">{p.slides.map(n => <a key={n} href={'#slide-' + n}>{n === 0 ? 'C' : n}</a>)}</span>
              <span><b>{p.where}</b><span>{p.why}</span></span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------- checked against IAQ's own documents ---------- */
const VERDICT = { fixed: ['Fixed on the site', 'fx'], kept: ['Already agreed', 'kp'], ask: ['IAQ’s papers disagree', 'ak'] }
/* 18 Sep ("no unclear explanation"): the source codes (DV3, Q-SL...) are spelled out as the document's name */
const DOC = { DV3: 'Discovery answers', COPY: 'Website copy sheet', 'Q-SL': 'Unit 2 questionnaire', 'Q-EPC': 'EPC questionnaire', 'Q-EM': 'EFM questionnaire',
  DECK: 'Utility Solutions deck', MOOD: 'Moodboard', FB: 'Feedback deck', REV: '17 Sep review', WA: 'Nabilah, 18 Sep message' }
const docName = src => { const [k, ...rest] = src.split(' '); return (DOC[k] || k) + (rest.length ? ' ' + rest.join(' ') : '') }

function CrossCheck() {
  const n = k => CROSSCHECK.filter(r => r.verdict === k).length
  const r = useRef(null); useAbbr(r)
  return (
    <section ref={r} className="pg-sec cx-part cx-pc" aria-labelledby="cx-hc">
      <div className="pg-in">
        <SecHead id="crosscheck"
          title={<span id="cx-hc">IAQ’s own documents, <em>checked line by line.</em></span>}
          lede="The Discovery answers, the three business unit questionnaires, the website copy sheet, the Utility Solutions deck, the moodboard, the annotated feedback deck, the 17 September review and Nabilah’s 18 September message, read against the site. Where they disagree, IAQ’s written word wins." />
        <div className="cx-cc-sum">
          {Object.entries(VERDICT).map(([k, [l, c]]) => <span key={k} className={'cx-cc-v ' + c}><b>{n(k)}</b>{l}</span>)}
        </div>
        <div className="cx-cc">
          {CROSSCHECK.map(r => (
            <article className={'cx-cc-row ' + VERDICT[r.verdict][1]} key={r.topic}>
              <div className="cx-cc-t"><span className={'cx-cc-tag ' + VERDICT[r.verdict][1]}>{VERDICT[r.verdict][0]}</span><b>{r.topic}</b></div>
              <div className="cx-cc-docs"><span className="cx-cc-k">IAQ’s documents</span>{r.docs.map(([src, say]) => <p key={src + say}><i title={src}>{docName(src)}</i>{say}</p>)}</div>
              <div className="cx-cc-site"><span className="cx-cc-k">The site said</span><p>{r.site}</p></div>
              <div className="cx-cc-now"><span className="cx-cc-k">Now</span><p>{r.now}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}


/* ---------- background, closed by default ---------- */
function Benchmark() {
  return (
    <section className="pg-sec cx-part cx-pb" aria-labelledby="cx-hb">
      <div className="pg-in">
        <SecHead id="benchmark"
          title={<span id="cx-hb">The benchmark: <em>what Sunny expects.</em></span>}
          lede="On 18 September IAQ forwarded a competitor’s company introduction deck with one line: this is the expectation, infographics that help clients understand the business. Read slide by slide, it does six things our first Codex did not." />
        <ol className="cx-bar">
          {THE_BAR.map(([k, t], i) => <li key={k}><span className="cx-bar-n">{i + 1}</span><b>{k}</b><span>{t}</span></li>)}
        </ol>
        <h3 className="cx-h3">Their deck, slide by slide, and the IAQ slide that answers it</h3>
        <div className="cx-mx-wrap">
          <table className="cx-bm">
            <thead><tr><th scope="col">Their slide</th><th scope="col">The device</th><th scope="col">IAQ’s answer</th><th scope="col">Where we stand</th></tr></thead>
            <tbody>
              {BENCHMARK.map(b => (
                <tr key={b.their}>
                  <th scope="row">{b.their}</th>
                  <td>{b.device}</td>
                  <td>{b.ours.length ? b.ours.map(n => <a key={n} className="cx-bm-s" href={'#slide-' + n}>Slide {n}</a>) : <span className="cx-bm-none">Not in the set</span>}</td>
                  <td>{b.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function Background() {
  const r = useRef(null); useAbbr(r)
  return (
    <section ref={r} className="pg-sec cx-bg" aria-label="Background" id="background">
      <div className="pg-in">
        <details className="cx-more">
          <summary><b>Background</b><span>The competitor benchmark IAQ sent, the reading rules, every term placed by layer, and what is applied or next.</span></summary>
          <Benchmark />
          <div className="cx-bg-in">
            <h3 className="cx-h3">The reading rules</h3>
            <div className="cx-rules">{RULES.map(r => <div className="cx-rule" key={r.k}><b>{r.k}</b><p>{r.t}</p></div>)}</div>
            <h3 className="cx-h3">The terms, placed by layer</h3>
            <div className="cx-terms">
              {TERMS.map(t => (
                <div className="cx-tcol" key={t.layer}>
                  <span className="cx-tcol-h">{t.layer}</span>
                  <dl>{t.items.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
                </div>
              ))}
            </div>
            <div className="cx-status">
              <div><h3 className="cx-h3">Applied on the site</h3><ul>{STATUS.applied.map(x => <li key={x}><i className="cx-dot" />{x}</li>)}</ul></div>
              <div><h3 className="cx-h3">Next</h3><ul>{STATUS.next.map(x => <li key={x}><i className="cx-dot ask" />{x}</li>)}</ul></div>
            </div>
          </div>
        </details>
      </div>
    </section>
  )
}

/* ---------- the page ---------- */
export function CodexBody() {
  const [meta, setMeta] = useState(null)
  useEffect(() => { document.title = 'IAQ Group · Portal · Codex · Brand Method' }, [])
  useEffect(() => { fetch('/codex/IAQ-Codex.json', { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)).then(setMeta).catch(() => {}) }, [])
  /* 18 Sep (Bazil: "download the whole codex page"): printing opens every closed panel, so the page prints whole */
  useEffect(() => {
    let shut = []
    const open = () => { shut = [...document.querySelectorAll('.cx-page details:not([open])')]; shut.forEach(d => { d.open = true }) }
    const close = () => { shut.forEach(d => { d.open = false }); shut = [] }
    window.addEventListener('beforeprint', open); window.addEventListener('afterprint', close)
    return () => { window.removeEventListener('beforeprint', open); window.removeEventListener('afterprint', close) }
  }, [])
  useMomentum()
  /* 24 Sep (Bazil: "premium, appealing, animated, throughout the page"): every head, card, row and picture rises
     in as it arrives, staggered within its group. Armed only with JS and motion allowed; print shows everything. */
  useEffect(() => {
    if (!('IntersectionObserver' in window) || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return
    const page = document.querySelector('.cx-page'); if (!page) return
    const SEL = '.cx-sh, .cx-keys li, .cx-oq li, .cx-plain-c, .cx-q, .cx-slide, .cx-sc, .cx-cc-v, .cx-cc > *, .cx-jump li, .cx-dl, .cx-head h1, .cx-head .pg-head-lede, .cx-key-h, .cx-open-head, .cx-h3, .cx-p, .rx-wrap, .cx-more-in, .cx-bg-in > *'
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.02 })
    const arm = () => {
      page.querySelectorAll(SEL).forEach(el => {
        if (el.classList.contains('cxr')) return
        const sibs = el.parentElement ? [...el.parentElement.children].filter(c => c.matches(SEL)) : [el]
        el.style.setProperty('--d', Math.min(sibs.indexOf(el), 9) * 0.06 + 's')
        el.classList.add('cxr'); io.observe(el)
      })
    }
    page.classList.add('cx-armed'); arm()
    const mo = new MutationObserver(arm); mo.observe(page, { childList: true, subtree: true })
    const sweep = () => page.querySelectorAll('.cxr:not(.in)').forEach(el => { if (el.getBoundingClientRect().top < innerHeight * 0.98) el.classList.add('in') })
    const t = setTimeout(sweep, 900); window.addEventListener('scroll', sweep, { passive: true })
    return () => { io.disconnect(); mo.disconnect(); clearTimeout(t); window.removeEventListener('scroll', sweep); page.classList.remove('cx-armed') }
  }, [])
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <div className="cx-page">
      <header className="cx-head">
        {/* 24 Sep (Bazil: "make a proper nice banner"): the exploded fab drawing from the Design tab, faint, drifting on
            momentum behind the head, on a grey to white wash with the drafting grid and a soft red glow */}
        <div className="cx-head-art" aria-hidden="true"><span data-mo="0.55"><img src="/assets/iso-fab-exploded.svg" alt="" decoding="async" /></span></div>
        <div className="pg-in">
          <div className="cx-head-in">
            <div>
              <h1>The Codex. <em>IAQ’s business, easy to read.</em></h1>
              <p className="pg-head-lede">Three sections for three readers. Section 1 is for anyone. Section 2 is for engineers and buyers who know the industry. Section 3 is how the website shows it.</p>
              <div className="cx-dl">
                <a className="cta" href="/codex/IAQ-Codex.pdf" download="IAQ-Codex.pdf"><Icon name="file" />Download the whole Codex</a>
                <button className="cx-print" type="button" onClick={() => window.print()}>Print</button>
                <span className="cx-dl-note">{meta ? `PDF · every section, ${meta.pages} landscape pages · updated ${meta.date}` : 'PDF · every section, landscape'}</span>
              </div>
              <p className="cx-printdate">IAQ member portal · the Codex · printed {today}</p>
            </div>
            <nav className="cx-head-act" aria-label="On this page">
              <ol className="cx-jump">
                {OPEN_QUESTIONS.length > 0 && <li><a className="cx-jump-q" href="#questions"><span>?</span>Decisions needed<i>{OPEN_QUESTIONS.length}</i></a></li>}
                <li><a href="#part1"><span>1</span>For everyone</a></li>
                <li><a href="#part2"><span>2</span>For professionals</a></li>
                <li><a href="#part3"><span>3</span>On the website</a></li>
                <li><a href="#crosscheck"><span><Icon name="check" /></span>Checked against IAQ’s documents</a></li>
                <li><a href="#background"><span>+</span>Background</a></li>
                <li><a href="#archive3d"><span><Icon name="cube" /></span>3D archive</a></li>
              </ol>
            </nav>
          </div>
        </div>
      </header>
      {/* 24 Sep: the key band's six chips live in KindsGuide's Summary view now */}
      <KindsGuide />
      <OpenQuestions />
      <PartOne />
      <PartTwo />
      <PartThree />
      <CrossCheck />
      <Background />
      {/* 25 Sep (Bazil: "isn't this supposed to be in the design tab instead of here?"): the icon family and the art and
          motion rules now live on the portal's Design direction page */}
      {/* 25 Sep (Bazil: "make sure this is all in the Codex, version 1, in case we're going to edit"): the facility map as it
          stood before version 2, six states, and where its code is kept */}
      <section className="pg-sec cx-part cx-v1" aria-labelledby="cx-hv1" id="facility-map-v1">
        <div className="pg-in">
          <h2 id="cx-hv1">Facility map, version 1. <em>As it stood on 25 September 2026.</em></h2>
          <p className="pg-lede">Four columns beside IAQ&rsquo;s Revit fab: service, business unit, work and system, with a reading panel under the model. Kept here before the simplified version 2. The code is kept in <code>src/_versions/facility-map-v1-2026-09-25</code>, with a note on how to put it back.</p>
          <div className="cx-v1-grid">
            {[['default', 'At rest'], ['unit-epc', 'EPC picked: design to commissioning'], ['unit-pcu', 'PCU & TTI picked'], ['work-mep', 'MEP picked'], ['system-fire', 'Fire protection picked'], ['service-hookup', 'Tools hookup picked']].map(([k, l]) => (
              <figure key={k}><a href={'/codex/v1/' + k + '.webp'} target="_blank" rel="noopener"><img src={'/codex/v1/' + k + '.webp'} alt={'The facility map, version 1: ' + l} loading="lazy" /></a><figcaption>{l}</figcaption></figure>
            ))}
          </div>
        </div>
      </section>
      {/* 26 Sep (Bazil: "store the old one we have right now in the Codex, with this new one"): the scroll-driven assembly
          that stood on the home page until 26 Sep 2026 (our own engine, scenes/fab3d.js, on IAQ's Revit model), kept here
          in full so it can be reviewed against the developer's Scroll to build that replaced it. */}
      <section className="pg-sec cx-part cx-p3d" aria-labelledby="cx-h3d" id="archive3d">
        <div className="pg-in">
          <h2 id="cx-h3d">3D archive. <em>The assembly the home page ran until 26 September 2026.</em></h2>
          <p className="pg-lede">Brand Method's own scroll-driven build of IAQ's model: six stages, one accountable rail, the finish. Replaced on the home page by the developer's Scroll to build 3D (delivery "3D ONLY (4)", 26 September 2026), which assembles the same facility in 25 beats under IAQ's service headings and hands off to a first-person walkthrough. Kept here in full.</p>
        </div>
        <FabAssembly />
      </section>
    </div>
  )
}

export default function Codex() {
  const { hash } = useLocation()
  return <Navigate to={'/portal/codex' + (hash || '')} replace />
}
