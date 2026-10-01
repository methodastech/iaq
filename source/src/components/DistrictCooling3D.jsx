import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/dcs3d.css'

/* ============================================================================
   District cooling, in 3D, and Energy as a Service · 25 Sep 2026.
   Bazil, with IAQ's EFM slide (Services Scope · Energy Management · Energy As A Service): "put this info in for the
   district cooling 3D, very detailed and easy to understand, don't cut corners", "apply it in the specific page".
   The slide is IAQ Energy Facility Management's own page, so it lands here, on EFM, where "District cooling, in
   brief" stood (its three plain steps are now five, told on the model).

   Copy provenance
     STEPS        IAQ's EFM page (iaqtechnology.com.my/efm): the plant "serves multiple buildings from a single,
                  centralized location"; "insulated pipes transport chilled water from the central cooling plant to the
                  connected buildings"; TES "designed to store cooling energy for later use"; "ETS at user's building
                  are for metering of cooling energy, contractual segregation and hydraulic segregation". Buildings:
                  the slide's labels (universities, hospital, hotel, offices, shopping mall).
                  Inference, stated plainly: cooling towers release the chillers' heat (a water-cooled plant, as on
                  IAQ's illustration); a store is charged when demand is low and drawn on at the peak (what "for later
                  use" means in practice).
     MODELS       the slide's three columns, verbatim steps (Optimization spelt the site's British way); durations
                  from the EFM questionnaire flowcharts (FLOW-EPC 5 to 10 years, FLOW-CAAS 10 to 20 years); the
                  maintenance packages and coverage from the slide's third column.
     SAVINGS BARS the slide's chart: 100% before; 60% energy cost, 30% IAQ's share, 10% owner's share during the
                  contract; 60% and 40% after. Shown as IAQ drew it and labelled illustrative. IAQ's live page
                  publishes "up to 30%", so this 40% is an example, not a claim, and is flagged to Bazil.
     BOT DIAGRAM  the slide's diagram: IAQ supplies chilled water to the building owner, the owner pays a tariff (a
                  fixed cooling tariff, as the EFM page's lede says); IAQ finances and builds or rehabilitates the
                  chiller plant and operates and maintains it through the contract.
   ============================================================================ */

/* 26 Sep (Bazil: "no need long descriptions"): one short line a step; the model carries the rest, numbered to match */
const STEPS = [
  { k: 'plant', t: 'One central plant', d: 'Chillers make the chilled water. Towers shed the heat.' },
  { k: 'tes', t: 'Thermal energy storage', d: 'A tank stores cooling for the peak.' },
  { k: 'net', t: 'The chilled water network', d: 'Chilled water out, warmer water back.' },
  { k: 'ets', t: 'An energy transfer station at each building', d: 'It meters each building\u2019s cooling.' },
  { k: 'bld', t: 'Cooling in every building', d: 'Every building runs its air-conditioning on it.' },
]

const MODELS = [
  {
    k: 'epc', t: 'Energy Performance Contracting', dur: '5 to 10 years',
    d: 'IAQ funds the upgrade, and shares in the savings it makes.',
    steps: ['System audit', 'Optimisation planning', 'Financial analysis', 'Implementation', 'Shared savings', 'Contract completion'],
  },
  {
    k: 'bot', t: 'Cooling as a Service, Build-Operate-Transfer', dur: '10 to 20 years',
    d: 'IAQ finances and builds or rehabilitates the chiller plant, runs it, then hands it to you.',
    steps: ['System assessment', 'Upgrade planning', 'Construction phase', 'Operational management', 'System and asset transfer'],
  },
  {
    k: 'om', t: 'Operate and Maintain', dur: 'Two packages',
    d: 'Skilled manpower for daily operation and emergency response.',
    steps: null,
  },
]

/* the savings split, as IAQ's chart draws it */
function SavingsBars() {
  const H = 150, top = 22, base = top + H
  const bar = (x, segs, label) => {
    let y = base
    return (
      <g>
        {segs.map((s, i) => { const h = H * s.v / 100; y -= h; return (
          <g key={i}>
            <rect x={x} y={y} width="46" height={h} fill={s.c} />
            <path d={`M${x} ${y} l8 -6 h46 l-8 6 z`} fill={s.top || s.c} opacity={i === segs.length - 1 ? 1 : 0} />
            <path d={`M${x + 46} ${y} l8 -6 v${h} l-8 6 z`} fill={s.side || s.c} />
            <text x={x + 23} y={y + h / 2 + 4} textAnchor="middle" className="dcs3-bv">{s.v}%</text>
          </g>) })}
        <text x={x + 27} y={base + 18} textAnchor="middle" className="dcs3-bl">{label}</text>
      </g>
    )
  }
  const COST = { c: '#6E86A6', top: '#8FA3BE', side: '#566E8E' }
  const NOW = { c: '#1E88E5', top: '#5AA9EE', side: '#136CBC' }
  const IAQ = { c: '#EC2027', top: '#F2595E', side: '#B5121B' }
  const OWN = { c: '#27A560', top: '#5CC285', side: '#1B7F48' }
  return (
    <svg className="dcs3-bars" viewBox="0 0 340 200" role="img" aria-label="Illustrative split from IAQ's company profile. Before the upgrade, energy cost is 100%. During the contract, energy cost falls to 60%, IAQ's share of the saving is 30% and yours is 10%. After the contract, energy cost stays at 60% and you keep the whole 40% saving.">
      <line x1="20" y1={top + 0.5} x2="320" y2={top + H * 0.4 + 0.5} stroke="#EC2027" strokeWidth="1.2" strokeDasharray="4 4" opacity=".55" />
      {bar(24, [{ v: 100, ...COST }], 'Before')}
      {bar(140, [{ v: 60, ...NOW }, { v: 30, ...IAQ }, { v: 10, ...OWN }], 'During')}
      {bar(256, [{ v: 60, ...NOW }, { v: 40, ...OWN }], 'After')}
    </svg>
  )
}
const BarKey = () => (
  <ul className="dcs3-key">
    <li><i style={{ background: '#6E86A6' }} />Energy cost before the upgrade</li>
    <li><i style={{ background: '#1E88E5' }} />Energy cost after it</li>
    <li><i style={{ background: '#EC2027' }} />IAQ&rsquo;s share, recovering its investment</li>
    <li><i style={{ background: '#27A560' }} />Your saving, all of it after the contract</li>
  </ul>
)

/* who does what under Build-Operate-Transfer, as IAQ's diagram draws it */
function BotDiagram() {
  return (
    <svg className="dcs3-bot" viewBox="0 0 340 210" role="img" aria-label="IAQ supplies chilled water to the building owner, who pays a fixed cooling tariff. IAQ finances and builds or rehabilitates the chiller plant, and operates and maintains it through the contract. At the end, the plant is transferred to the owner.">
      <defs>
        <marker id="dcs3-ah-b" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#1E88E5" /></marker>
        <marker id="dcs3-ah-r" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#EC2027" /></marker>
      </defs>
      <rect x="10" y="14" width="96" height="40" fill="#0C1220" /><text x="58" y="39" textAnchor="middle" className="dcs3-dg is-w">IAQ</text>
      <rect x="234" y="14" width="96" height="40" fill="#EEF3F9" /><text x="282" y="39" textAnchor="middle" className="dcs3-dg">Building owner</text>
      <line x1="110" y1="26" x2="228" y2="26" stroke="#1E88E5" strokeWidth="2" markerEnd="url(#dcs3-ah-b)" />
      <text x="169" y="20" textAnchor="middle" className="dcs3-ds">Chilled water</text>
      <line x1="230" y1="44" x2="112" y2="44" stroke="#EC2027" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#dcs3-ah-r)" />
      <text x="169" y="60" textAnchor="middle" className="dcs3-ds">Fixed cooling tariff</text>
      <path d="M58 56 V78 H58" stroke="#0C1220" strokeWidth="1.5" fill="none" />
      <rect x="10" y="80" width="150" height="46" fill="#F7F9FC" /><text x="85" y="99" textAnchor="middle" className="dcs3-ds">Finances, builds or</text><text x="85" y="115" textAnchor="middle" className="dcs3-ds">rehabilitates the plant</text>
      <rect x="180" y="80" width="150" height="46" fill="#F7F9FC" /><text x="255" y="99" textAnchor="middle" className="dcs3-ds">Operates and maintains</text><text x="255" y="115" textAnchor="middle" className="dcs3-ds">it through the contract</text>
      <path d="M58 72 H255 V80" stroke="#0C1220" strokeWidth="1.5" fill="none" />
      <g className="dcs3-tl">
        <rect x="10" y="150" width="74" height="26" fill="#0C1220" /><text x="47" y="167" textAnchor="middle" className="dcs3-dg is-w">Build</text>
        <rect x="88" y="150" width="166" height="26" fill="#1E88E5" /><text x="171" y="167" textAnchor="middle" className="dcs3-dg is-w">Operate, 10 to 20 years</text>
        <rect x="258" y="150" width="72" height="26" fill="#27A560" /><text x="294" y="167" textAnchor="middle" className="dcs3-dg is-w">Transfer</text>
        <text x="10" y="196" className="dcs3-ds">IAQ owns and runs the plant</text><text x="330" y="196" textAnchor="end" className="dcs3-ds">then it is yours</text>
      </g>
    </svg>
  )
}

/* the two maintenance packages, and what they cover */
function Packages() {
  return (
    <div className="dcs3-pk">
      <table>
        <thead><tr><th /><th>Full comprehensive</th><th>Non-comprehensive</th></tr></thead>
        <tbody>
          <tr><th>Planned maintenance</th><td><i className="y" aria-label="included" /></td><td><i className="y" aria-label="included" /></td></tr>
          <tr><th>Unplanned maintenance</th><td><i className="y" aria-label="included" /></td><td><i className="n" aria-label="not included" /></td></tr>
        </tbody>
      </table>
      <p className="dcs3-pk-h">Both packages cover</p>
      <ul className="dcs3-cov">
        <li>HVAC systems</li><li>Process equipment</li><li>Operational support</li>
      </ul>
    </div>
  )
}

const ICON = {
  epc: <svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V6M16 20v-8M22 20H2" /><path d="M4 7l6-3 6 5 5-4" /></svg>,
  bot: <svg viewBox="0 0 24 24"><path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18" /><circle cx="12" cy="12" r="3" /></svg>,
  om: <svg viewBox="0 0 24 24"><path d="M14.5 5.5a4 4 0 0 0-5.3 5L4 15.7 8.3 20l5.2-5.2a4 4 0 0 0 5-5.3l-2.4 2.4-2.6-.6-.6-2.6z" /></svg>,
}

export default function DistrictCooling3D({ intro }) {
  const stage = useRef(null), api = useRef(null), sec = useRef(null)
  const [step, setStep] = useState(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [go, setGo] = useState(false)
  /* 26 Sep (Bazil, of the IAQ animation view: "remove this"; "make sure ours looks very good, detailed and alive"): the
     stage is the 3D model only */
  /* build the scene only when the section is near */
  useEffect(() => {
    const el = sec.current; if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); io.disconnect() } }, { rootMargin: '600px 0px' })
    io.observe(el); return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!go) return
    let dead = false
    import('../scenes/dcs3d.js').then(({ initDCS }) => {
      if (dead || !stage.current) return
      try { api.current = initDCS(stage.current, { onReady: () => setReady(true), onPick: k => pickRef.current(k) }) } catch (e) { console.warn('district cooling 3D unavailable', e); setReady(true) }
    })
    return () => { dead = true; api.current && api.current.stop(); api.current = null }
  }, [go])
  const pickRef = useRef(() => {})
  const pick = (k, stopTour = true) => { if (stopTour) setPlaying(false); setStep(k); api.current && api.current.setStep(k || 'all') }
  /* the tour: one step every seven seconds, only when Play is pressed (Bazil on the Services 3D: "it shouldn't move
     automatically unless you play it") */
  useEffect(() => {
    if (!playing) return
    const order = STEPS.map(s => s.k)
    const next = () => { const i = order.indexOf(step); const k = order[(i + 1) % order.length]; setStep(k); api.current && api.current.setStep(k) }
    if (!step || !order.includes(step)) { next(); }
    const t = setInterval(next, 7000)
    return () => clearInterval(t)
  }, [playing, step])
  pickRef.current = k => pick(k)
  const cur = STEPS.find(s => s.k === step)
  const mod = MODELS.find(m => m.k === step)
  return (
    <section className="un-sec un-dcs dcs3" aria-labelledby="un-dcs-h" ref={sec}>
      <div className="pg-in">
        <h2 id="un-dcs-h" className="un-h2" data-rv="">How district cooling <em>works.</em></h2>
        <p className="un-dcs-lede" data-rv="" style={{ '--d': '.06s' }}>Chilled water is made at one central plant and piped to every building on the network. Each building cools on it, with no chiller plant of its own.</p>

        <div className="dcs3-wrap">
          <div className={'dcs3-stage' + (ready ? ' is-ready' : '')} ref={stage}>
            <canvas aria-hidden="true" />
            <div className="dcs3-labels" aria-hidden="true" />
            <div className="dcs3-load" aria-hidden={ready}><span className="dcs3-spin" /><b>Building the district</b></div>
            <div className="dcs3-tools">
              <button type="button" onClick={() => api.current && api.current.zoom(1)} aria-label="Zoom in"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg></button>
              <button type="button" onClick={() => api.current && api.current.zoom(-1)} aria-label="Zoom out"><svg viewBox="0 0 24 24"><path d="M5 12h14" /></svg></button>
              <button type="button" onClick={() => { setPlaying(false); setStep(null); api.current && (api.current.setStep('all'), api.current.zoom(0)) }} aria-label="Reset the view"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" /></svg></button>
            </div>
            <ul className="dcs3-legend" aria-hidden="true">
              <li><i className="s" />Chilled water out</li>
              <li><i className="r" />Warmer water back</li>
              <li><i className="e" />Energy transfer station</li>
            </ul>
            <p className="dcs3-hint" aria-hidden="true">Drag to turn</p>
          </div>

          <div className="dcs3-side">
            <button type="button" className={'dcs3-play' + (playing ? ' on' : '')} onClick={() => setPlaying(p => !p)} aria-pressed={playing}>
              {playing
                ? <><svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>Pause the tour</>
                : <><svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z" /></svg>Play the tour</>}
            </button>
            <ol className="dcs3-steps">
              {STEPS.map((s, i) => (
                <li key={s.k} className={step === s.k ? 'on' : ''}>
                  <button type="button" onClick={() => pick(s.k)} aria-current={step === s.k ? 'step' : undefined}>
                    <span className="n">{String(i + 1).padStart(2, '0')}</span>
                    <b>{s.t}</b>
                    <span className="d">{s.d}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="dcs3-eaas">
          <h3 className="dcs3-h3" data-rv="">Energy as a Service, <em>in three models.</em></h3>
          <div className="dcs3-models">
            {MODELS.map((m, i) => (
              <article key={m.k} className={'dcs3-m' + (step === m.k ? ' on' : '')} data-rv="" style={{ '--d': `${.06 * i}s` }}>
                <header>
                  <span className="dcs3-mi" aria-hidden="true">{ICON[m.k]}</span>
                  <span className="dcs3-dur">{m.dur}</span>
                </header>
                <h4>{m.k === 'bot' ? <>Cooling as a Service, <span className="dcs3-nw">Build-Operate-Transfer</span></> : m.t}</h4>
                <p className="dcs3-md">{m.d}</p>
                {m.steps && (
                  <ol className="dcs3-ms">
                    {m.steps.map((s, j) => <li key={s}><span>{j + 1}</span>{s}</li>)}
                  </ol>
                )}
                <figure className="dcs3-fig">
                  {m.k === 'epc' && <><SavingsBars /><BarKey /><figcaption>Illustrative split, from IAQ&rsquo;s company profile.</figcaption></>}
                  {m.k === 'bot' && <BotDiagram />}
                  {m.k === 'om' && <Packages />}
                </figure>
                {/* 30 Sep ("remove see it on model"): the "See it on the model" link under each delivery model is gone */}
              </article>
            ))}
          </div>
        </div>

        {(intro.paras || []).map((t, i) => <p className="un-dcs-by dcs3-by" key={i} data-rv="">{t}</p>)}
        {intro.to && <Link className="un-more" to={intro.to} data-rv="">{intro.cta}</Link>}
        <span className="dcs3-sr" aria-live="polite">{cur ? `${cur.t}. ${cur.d}` : mod ? mod.t : ''}</span>
      </div>
    </section>
  )
}
