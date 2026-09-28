import React, { useRef } from 'react'
import { useAbbr } from '../lib/abbr.js'
import Icon from './FlowIcon.jsx'
import { PROJECTS, INDUSTRIES, TYPES, REGIONS } from '../data/projects.js'
import { SERVICES, WORK } from '../data/codex.js'
import '../styles/codex-slides.css'

/* ============================================================================
   CodexSlides: the IAQ infographic set, second language (18 Sep 2026, evening).

   Bazil: "super clear easy to understand infographic, clear breakdown, group and glows";
   "the problem is confusing to learn and understand ... mixing up, not sure which is which group".

   The answer is one grammar, carried by colour and printed as a key on every slide: red is a
   business unit, ink outline a delivery model, azure a service, amber a discipline, green a system,
   violet a market. Light ground with soft coloured glows: IAQ's own feedback called the site "just
   too white" and the moodboard asks for one or two bold colours, but the set also prints, so no black. Slide 1 is that grammar as a map; slide 2 names the three words that mean two
   things. Names follow the cross-check of IAQ's own documents (src/data/codex.js, CROSSCHECK).
   The model on the cover and on slide 7 is IAQ's own Revit model, multiplied onto the ground.
   Every fact is one the site already publishes; revenue stays off; proof is computed.
   ============================================================================ */

const TOTAL = 11
const KINDS = [['unit', 'Business unit'], ['model', 'Delivery model'], ['svc', 'Service'], ['work', 'Work'], ['sys', 'System'], ['mkt', 'Market']]
function Key() {
  return <ul className="cxs-key" aria-label="Colour key">{KINDS.map(([k, l]) => <li key={k} className={'c-' + k}><i className={k === 'model' ? 'o' : ''} />{l}</li>)}</ul>
}
const FIT = { fit: true }
function Slide({ n, name, title, sub, children, cover }) {
  /* 18 Sep: every short form gets its meaning in brackets at its first appearance on the slide (lib/abbr.js) */
  const box = useRef(null)
  useAbbr(box, [], FIT)
  return (
    <div className="cxs-wrap">
      <article className="cxs" id={'slide-' + n} aria-label={name} ref={box}>
        <div className="cxs-in">
          <header className="cxs-h"><h3>{title}</h3>{sub && <p>{sub}</p>}</header>
          <div className="cxs-b">{children}</div>
          <footer className="cxs-f">
            <p className="cxs-gl" data-abslot="" />
            <span className="cxs-f-l"><img src="/assets/iaq-logo.webp" alt="IAQ" /><span>{name}</span></span>
            <Key />
            <span className="n">{cover ? 'Cover' : `${n} / ${TOTAL}`}</span>
          </footer>
        </div>
      </article>
    </div>
  )
}

/* ---------- cover · one fab, every layer ---------- */
const LAYERS = [
  { n: 1, x: 55, y: 9,  t: 'Roof steel and structural frame', d: 'csa' },
  { n: 2, x: 31, y: 17, t: 'Air handling and ducting', d: 'mep' },
  { n: 3, x: 77, y: 26, t: 'Building services, the interstitial level', d: 'mep' },
  { n: 4, x: 43, y: 41, t: 'Cleanroom envelope', d: 'csa' },
  { n: 5, x: 71, y: 45, t: 'Process tools, hooked up', d: 'hookup' },
  { n: 6, x: 32, y: 49, t: 'Waffle slab and raised floor', d: 'csa' },
  { n: 7, x: 48, y: 58, t: 'Process utilities in the sub-fab', d: 'process' },
  { n: 8, x: 69, y: 76, t: 'Sub-fab plant and fire protection', d: 'mep' },
  { n: 9, x: 42, y: 87, t: 'Piles and pile caps', d: 'csa' },
]
const DISC = {
  csa: ['CSA', 'The building', 'c-work'], mep: ['MEP', 'What makes it run', 'c-work'], process: ['Process utilities', 'What the tools run on', 'c-work'], hookup: ['Tools hookup', 'Service 6, the tools themselves', 'c-svc'],
}
const BUILDUP = [['00', 'Piles and pile caps'], ['05', 'Frame, slabs and roof steel'], ['11', 'Cleanroom envelope'], ['22', 'Building services'], ['33', 'Tools and sub-fab plant'], ['final', 'The whole fab']]
function LayerList({ keys }) {
  return (
    <div className="s0-list">
      {keys.map(k => (
        <div className={'s0-grp ' + DISC[k][2]} key={k}>
          <span className="s0-grp-h"><b>{DISC[k][0]}</b>{DISC[k][1]}</span>
          <ul>{LAYERS.filter(l => l.d === k).map(l => <li key={l.n}><i>{l.n}</i>{l.t}</li>)}</ul>
        </div>
      ))}
    </div>
  )
}
function S0() {
  return (
    <Slide n={0} cover name="One fab, every layer" title={<>One fab, every layer: <em>what IAQ delivers.</em></>}
      sub="A section through IAQ’s own Revit coordination model. Every numbered layer is designed, procured, built and proven by the same company.">
      <div className="s0">
        <div className="s0-top">
          <LayerList keys={['csa']} />
          <div className="s0-model">
            <img className="mdl" src="/assets/iaq/model-seq/44.webp" alt="A section through a fab in IAQ’s Revit model: roof steel, services, cleanroom, tools, sub-fab and piles" />
            {LAYERS.map(l => <span className={'s0-pin ' + DISC[l.d][2]} key={l.n} style={{ left: l.x + '%', top: l.y + '%' }}>{l.n}</span>)}
          </div>
          <LayerList keys={['mep', 'process', 'hookup']} />
        </div>
        <div className="s0-strip">
          <span className="s0-strip-h"><b>It assembles in the order IAQ builds it</b>The same model, six frames of sixty one</span>
          {BUILDUP.map(([f, c], i) => <figure key={f}><img className="mdl" src={`/assets/iaq/model-seq/${f}.webp`} alt="" /><figcaption><i>{i + 1}</i>{c}</figcaption></figure>)}
        </div>
      </div>
    </Slide>
  )
}

/* ---------- 1 · the map: which kind of thing is this ---------- */
const MAP_UNITS = [
  { b: 'EPC', s: 'Engineering, Procurement and Construction. Builds the facility.', m: ['EPCC', 'EPCM'] },
  { b: 'Process Critical Utilities & Total Tool Installation Solutions', s: 'Re-equips a live semiconductor fab.', m: ['Standalone', 'On the EPC or EPCM model'] },
  { b: 'EFM', s: 'Energy Facility Management. Runs and maintains it.', m: ['Cooling as a Service', 'Energy Performance Contracting'] },
]
const MARKETS = [['chip', 'Semiconductor'], ['server', 'Data Centre'], ['battery', 'EV Battery'], ['sun', 'Photovoltaics'], ['snow', 'District Cooling & Heating'], ['flask', 'Bio LifeScience'], ['bottle', 'Food & Beverage']]
function MapRow({ c, k, q, children }) {
  return <div className={'sm-row c-' + c}><div className="sm-k"><div><b>{k}</b><span>{q}</span></div></div>{children}</div>
}
function SMap() {
  return (
    <Slide n={3} name="IAQ in one picture" title={<>IAQ in one picture: <em>which kind of thing is which.</em></>}
      sub="Six kinds of thing, one colour each, the same on every slide. Read down: who you buy from, how the contract runs, what is in it, who does it, what gets built, and for whom.">
      <div className="sm">
        <MapRow c="unit" k="Business unit" q="Who you buy from. Three.">
          <div className="sm-items sm-units" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>{MAP_UNITS.map(u => <div className="sm-it" key={u.b}><b>{u.b}</b><span>{u.s}</span></div>)}</div>
        </MapRow>
        <MapRow c="model" k="Delivery model" q="How the contract runs. Belongs to a unit.">
          <div className="sm-items sm-models">{MAP_UNITS.map(u => <div className="sm-mg" key={u.b}>{u.m.map(x => <span className="cxs-pill" key={x}>{x}</span>)}</div>)}</div>
        </MapRow>
        <MapRow c="svc" k="Service" q="What is in the contract. Six, one or all.">
          <div className="sm-items" style={{ gridTemplateColumns: 'repeat(6,minmax(0,1fr))' }}>{SERVICES.map(s => <div className="sm-it" key={s.id}><b>{s.n}. {s.short === 'Hook up' ? 'Tools hookup' : s.name.replace(' and consultation', '')}</b></div>)}</div>
        </MapRow>
        <MapRow c="work" k="Work" q="The discipline that does it. How the market classifies a contractor.">
          <div className="sm-items" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>{WORK.map(w => <div className="sm-it" key={w.id}><b>{w.name}</b><span>{w.full}</span></div>)}</div>
        </MapRow>
        <MapRow c="sys" k="System" q="The thing being built, inside a discipline.">
          <div className="sm-items sm-sys">{WORK.map(w => <div className="sm-sg" key={w.id}>{w.systems.slice(0, 4).map(x => <span className="cxs-chip" key={x}>{x.replace('Cleanroom envelope: walls, ceiling grid, raised floor', 'Cleanroom envelope').replace('HVAC, ACMV and fan filter units', 'HVAC, ACMV, FFU').replace('Chiller plant and district cooling', 'Chiller plant')}</span>)}</div>)}</div>
        </MapRow>
        <MapRow c="mkt" k="Market" q="Who it is for. Seven.">
          <div className="sm-items" style={{ gridTemplateColumns: 'repeat(7,minmax(0,1fr))' }}>{MARKETS.map(([, l]) => <div className="sm-it" key={l}><b style={{ fontSize: '.9cqw' }}>{l}</b></div>)}</div>
        </MapRow>
      </div>
    </Slide>
  )
}

/* ---------- 2 · the words that get mixed up ---------- */
const MIX = [
  { w: 'EPC', p: 'One word, used for three different kinds of thing. This is where most of the confusion starts.',
    m: [['unit', 'Business unit', 'EPC, unit 1', 'The unit that builds the facility.'], ['model', 'Delivery model', 'The EPC model: EPCC, EPCM', 'How a contract runs. The hookup unit works on it too.'], ['model', 'A contract', 'Energy Performance Contracting', 'EFM’s contract. Always written in full, never EPC.']],
    say: 'Say “the EPC unit” or “the EPC model”. Never shorten the energy contract.' },
  { w: 'Hookup', p: 'Unit 2 went by two names, and one of them borrowed the name of a service.',
    m: [['unit', 'Business unit', 'Process Critical Utilities & Total Tool Installation Solutions', 'Unit 2, IAQ’s own written name. “Total Tools Hookup Solution” is retired.'], ['svc', 'Service', 'Tools hookup, service 6', 'The work of connecting a tool. The only thing “hookup” names now.']],
    say: 'Name the unit by what it sells. Keep “hookup” for the work.' },
  { w: 'PCW, CDA, UPW', p: 'Systems turn up in two places, so they get listed as services by mistake.',
    m: [['sys', 'System', 'Built with the facility', 'PCW is mechanical work. CDA and UPW are process work.'], ['svc', 'Service', 'Their last metres are hookup', 'From the main to the tool, service 6 connects them.']],
    say: 'A system is never a service. It appears twice because two crews touch it.' },
]
function SMix() {
  return (
    <Slide n={4} name="The words that get mixed up" title={<>Three words that <em>mean two things.</em></>}
      sub="Found by cross-checking IAQ’s own documents against the 17 September review and the site. The colour says which kind of thing each meaning is.">
      <div className="sx">
        {MIX.map(x => (
          <div className="sx-c cxs-card" key={x.w}>
            <span className="sx-w">{x.w}</span><p>{x.p}</p>
            <div className="sx-m">{x.m.map(([c, k, b, s]) => <div className={'c-' + c} key={b}><i>{k}</i><span style={{ margin: 0 }}><b>{b}</b><span>{s}</span></span></div>)}</div>
            <p className="sx-say"><b>Say it this way</b>{x.say}</p>
          </div>
        ))}
      </div>
    </Slide>
  )
}

/* ---------- 3 · at a glance ---------- */
const FACTS = [
  ['clock', 'Since 1995', '31 years, founded in Malaysia as a cleanroom specialist'],
  ['people', '450 people', 'Engineers, project teams and site crews, group wide'],
  ['folder', '250+ projects', 'Delivered for hi-tech manufacturers and facility owners'],
  ['area', '1,050,000 m²', 'Of cleanroom built'],
  ['globe', '7 countries', 'Eight offices, headquartered in Shah Alam'],
  ['particle', 'ISO 3', 'The cleanest class IAQ has built'],
]
const GLANCE_UNITS = [
  { no: 1, name: 'EPC', line: 'Builds the facility.', pills: ['EPCC', 'EPCM'], img: '/assets/iaq/site-aerial-build.webp', pos: '50% 40%',
    pts: ['Design, procurement, construction and commissioning under one contract', 'Cleanrooms, dry rooms and hi-tech facilities', 'CSA, MEP and process utilities, in house'] },
  { no: 2, name: 'Process Critical Utilities & Total Tool Installation Solutions', line: 'Re-equips a live semiconductor fab.', pills: ['Standalone', 'EPC or EPCM model'], img: '/assets/iaq/cr-utilities-p1010242.webp', pos: '50% 35%',
    pts: ['Utilities: gas, chemical and slurry, water, process exhaust', 'Tool installation: facilitize, rig in, hook up, commission', 'Semiconductor fabs, front end to back end'] },
  { no: 3, name: 'EFM', line: 'Runs and maintains it.', pills: ['Cooling as a Service', 'Energy Performance Contracting'], img: '/assets/iaq/plant-dusk-01.webp', pos: '50% 70%',
    pts: ['Energy Facility Management, a registered ESCO', 'IAQ funds the upgrade, paid from the savings', 'Chiller plant and district cooling, run under a service level'] },
]
function S1() {
  return (
    <Slide n={1} name="IAQ at a glance" title={<>IAQ at a glance: one group, <em>three business units.</em></>}
      sub="A total facility solutions provider for controlled environments. Each unit answers one question a facility owner has.">
      <div className="s1">
        <div className="s1-facts">{FACTS.map(([ic, b, s]) => <div className="s1-fact" key={b}><span className="cxs-ic"><Icon name={ic} /></span><div><b>{b}</b><span>{s}</span></div></div>)}</div>
        <div className="s1-right">
          <div className="s1-units">
            {GLANCE_UNITS.map(u => (
              <div className="s1-unit cxs-card glow-u" key={u.no}>
                <div className="s1-unit-img"><img src={u.img} alt="" style={{ objectPosition: u.pos }} /></div>
                <div className="s1-unit-h"><span>Business unit {u.no}</span><b>{u.name}</b></div>
                <div className="s1-unit-b"><b>{u.line}</b><ul className="cxs-li c-unit">{u.pts.map(p => <li key={p}>{p}</li>)}</ul><div className="cxs-pills">{u.pills.map(c => <span className="cxs-pill" key={c}>{c}</span>)}</div></div>
              </div>
            ))}
          </div>
          <div className="s1-mk"><span>Seven markets</span>{MARKETS.map(([ic, l]) => <div key={l}><Icon name={ic} />{l}</div>)}</div>
        </div>
      </div>
    </Slide>
  )
}

/* ---------- 4 · the life of a facility ---------- */
const PHASES = [
  ['compass', 'Plan and design', 'Engineering design and consultation', 'Drawings, the BIM model and the permits'],
  ['crate', 'Procure', 'Procurement', 'Equipment on site, on programme and on budget'],
  ['crane', 'Build', 'Construction', 'The facility, built to its class'],
  ['gauge', 'Commission and hand over', 'Testing and commissioning', 'Proof it performs, and the certified documents'],
  ['link', 'Tools move in', 'Tools hookup', 'Tools connected, qualified and released to production'],
  ['gear', 'Operate and maintain', 'Maintenance', 'Uptime, compliance and a lower energy bill'],
]
function S2() {
  return (
    <Slide n={2} name="Three units across the life of a facility" title={<>Three units, across the life of <em>your facility.</em></>}
      sub="Read it as the owner does: left to right, from the first drawing to a plant in operation, and round again at the next expansion.">
      <div className="s2">
        <div className="s2-spans">
          <div className="s2-span" style={{ gridColumn: '1 / 5' }}>
            <div><i>Business unit 1</i><b>EPC</b><span>Builds the facility, under one contract.</span></div>
            <div className="s2-pills"><span className="cxs-pill">EPCC · IAQ delivers</span><span className="cxs-pill">EPCM · IAQ manages</span></div>
          </div>
          <div className="s2-span" style={{ gridColumn: '5 / 6' }}><div><i>Business unit 2</i><b>PCU &amp; TTI</b><span>Process Critical Utilities &amp; Total Tool Installation</span></div></div>
          <div className="s2-span" style={{ gridColumn: '6 / 7' }}><div><i>Business unit 3</i><b>EFM</b><span>Runs and maintains it.</span></div></div>
          <div className="s2-also" style={{ gridColumn: '5 / 6' }}>Can also sit inside the same EPC contract</div>
        </div>
        <div className="s2-phases">{PHASES.map(([ic, p], i) => <div className="s2-ph" key={p}><span className="s2-ph-t"><i>{i + 1}</i><Icon name={ic} /></span><b>{p}</b></div>)}</div>
        <div className="s2-svc">{PHASES.map(([, p, sv, get]) => <div key={p}><b>The service</b><span>{sv}</span><b>You receive</b><span>{get}</span></div>)}</div>
        <div className="s2-loop">
          <svg viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
            <path d="M 992 2 V 24 H 8 V 8" fill="none" stroke="#EC2027" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <path d="M 2 14 L 8 3 L 14 14" fill="none" stroke="#EC2027" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
          <p><span>And round again.</span> New tools, a new line or an energy upgrade start the next design. The same three units carry it.</p>
        </div>
      </div>
    </Slide>
  )
}

/* ---------- 5 · six services ---------- */
const SCOPE = {
  design: ['Feasibility and master planning', 'Concept to detailed design, CSA, MEP and process', 'BIM coordination', 'Permitting and authority liaison'],
  procure: ['Supplier prequalification', 'Tenders, estimates and cost analysis', 'Long-lead equipment tracked'],
  construct: ['Site and construction management', 'Safety, quality assurance and control', 'Programme and cost control'],
  commission: ['Cleanroom classification testing', 'System performance verification', 'As-built and handover documents'],
  maintain: ['Planned preventive maintenance', 'Breakdown response', 'Optimisation and retrofits'],
  hookup: ['Tool move-in and placement', 'Utilities tied in to each tool', 'Qualified and released to production'],
}
const CARRY = [
  ['EPC', ['design', 'procure', 'construct', 'commission', 'maintain', 'hookup'], []],
  ['PCU & TTI', ['design', 'procure', 'construct', 'commission', 'hookup'], ['maintain']],
  ['EFM', ['commission', 'maintain'], ['design', 'procure', 'construct']],
]
function S3() {
  return (
    <Slide n={5} name="Six services" title={<>Six services. Buy one, <em>or all of them.</em></>}
      sub="IAQ calls the six its total solution: the scope written into the contract, in the order a project runs. Under it, the business unit that carries each one.">
      <div className="s3">
        <div className="s3-row s3-br"><span /><span className="w2">Before site</span><span className="w2">On site</span><span className="w2">In operation</span></div>
        <div className="s3-row s3-ch"><span className="s3-lb">The service</span>{SERVICES.map(s => <div className="s3-c" key={s.id}><i>{s.n}</i><b>{s.name}</b></div>)}</div>
        <div className="s3-row s3-sc"><span className="s3-lb">The scope</span>{SERVICES.map(s => <ul className="cxs-li" key={s.id}>{SCOPE[s.id].map(x => <li key={x}>{x}</li>)}</ul>)}</div>
        <div className="s3-carry">
          {CARRY.map(([u, core, ask], k) => (
            <div className="s3-row" key={u}>
              <span className="s3-lb u">{k === 0 && <i>Carried by</i>}{u}</span>
              {SERVICES.map(s => <span key={s.id} className={'s3-cell' + (core.includes(s.id) ? ' on' : ask.includes(s.id) ? ' ask' : '')}>{ask.includes(s.id) ? 'when asked' : ''}</span>)}
            </div>
          ))}
        </div>
        <div className="s3-claims">
          <div className="s3-claim cxs-card c-work"><span className="cxs-ic"><Icon name="layers" /></span><div><b>Every discipline</b><span>Civil, structural and architectural, MEP, and process utilities, in house.</span></div></div>
          <div className="s3-claim cxs-card c-svc"><span className="cxs-ic"><Icon name="grid" /></span><div><b>Any combination</b><span>One service, several, or all six. The model that governs it stays the same.</span></div></div>
          <div className="s3-claim cxs-card c-model"><span className="cxs-ic"><Icon name="file" /></span><div><b>Two delivery models</b><span>EPCC, IAQ delivers the whole project. EPCM, IAQ manages it for the owner.</span></div></div>
        </div>
      </div>
    </Slide>
  )
}

/* ---------- the contract drawings ---------- */
const Box = ({ x, y, w = 64, h = 24, t, red, s }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx="3" className={red ? 'bxr' : 'bx'} />
    <text x={x + w / 2} y={y + (s ? h / 2 - 1 : h / 2 + 3.2)} textAnchor="middle" className={red ? 'tw' : 't'}>{t}</text>
    {s && <text x={x + w / 2} y={y + h / 2 + 8.5} textAnchor="middle" className="ts" style={red ? { fill: '#fff', opacity: .92 } : undefined}>{s}</text>}
  </g>
)
const Ln = ({ d, dash, red }) => <path d={d} className={red ? 'lnr' : 'ln'} strokeDasharray={dash ? '3.5 3' : undefined} />
function DgEpcc() {
  return (
    <svg viewBox="0 0 240 150" role="img" aria-label="EPCC: the owner holds one contract with IAQ, and IAQ holds the trades">
      <Box x={88} y={10} t="Owner" /><Ln d="M120 34 V58" /><text x="126" y="49" className="ts">one contract</text>
      <Box x={76} y={58} w={88} h={28} t="IAQ" s="delivers and answers" red />
      <Ln d="M120 86 V100 M44 100 H196 M44 100 V112 M120 100 V112 M196 100 V112" />
      <Box x={14} y={112} w={60} t="CSA" /><Box x={90} y={112} w={60} t="MEP" /><Box x={166} y={112} w={60} t="Process" />
    </svg>
  )
}
function DgEpcm() {
  return (
    <svg viewBox="0 0 240 150" role="img" aria-label="EPCM: the owner holds the construction contracts, IAQ manages them">
      <Box x={20} y={10} t="Owner" /><Ln d="M84 22 H146" /><text x="92" y="17" className="ts">management</text>
      <Box x={146} y={8} w={80} h={28} t="IAQ" s="manages" red />
      <Ln d="M52 34 V100 M44 100 H196 M44 100 V112 M120 100 V112 M196 100 V112" />
      <text x="58" y="52" className="ts">the owner holds</text><text x="58" y="61" className="ts">the contracts</text>
      <Ln d="M196 36 V92" dash red /><Ln d="M196 92 H60" dash red />
      <text x="190" y="74" textAnchor="end" className="tr">IAQ manages design, programme,</text><text x="190" y="84" textAnchor="end" className="tr">cost and coordination</text>
      <Box x={14} y={112} w={60} t="Contractor" /><Box x={90} y={112} w={60} t="Contractor" /><Box x={166} y={112} w={60} t="Contractor" />
    </svg>
  )
}
function DgSingle() {
  return (
    <svg viewBox="0 0 240 150" role="img" aria-label="A single service: one of the six, bought alone">
      <Box x={88} y={10} t="Owner" /><Ln d="M120 34 V58" /><text x="126" y="49" className="ts">one scope</text>
      <Box x={76} y={58} w={88} h={28} t="IAQ" s="one service" red /><Ln d="M120 86 V106" />
      {[0, 1, 2, 3, 4, 5].map(i => (
        <g key={i}>
          <path d={`M${14 + i * 36} 108 h26 l8 11 l-8 11 h-26 l8 -11 z`} className={i === 1 ? 'sv-on' : 'sv-off'} />
          <text x={14 + i * 36 + 17} y="122.2" textAnchor="middle" className={i === 1 ? 'tw' : 'ts'}>{i + 1}</text>
        </g>
      ))}
      <text x="120" y="144" textAnchor="middle" className="ts">here, procurement only</text>
    </svg>
  )
}
function DgEsco() {
  return (
    <svg viewBox="0 0 240 150" role="img" aria-label="ESCO: IAQ funds and runs the plant, the owner pays from the savings">
      <Box x={14} y={14} w={70} h={28} t="IAQ" s="funds and runs" red />
      <Ln d="M84 28 H150" /><path d="M144 23 L152 28 L144 33" className="ln" /><text x="117" y="21" textAnchor="middle" className="ts">builds, upgrades</text>
      <Box x={152} y={14} w={74} h={28} t="The plant" s="chillers, cooling" />
      <Ln d="M189 42 V84" /><path d="M184 78 L189 86 L194 78" className="ln" /><text x="196" y="66" className="ts">cooling,</text><text x="196" y="75" className="ts">lower bills</text>
      <Box x={152} y={86} w={74} h={28} t="Owner" s="RM0 upfront" />
      <Ln d="M152 100 H58 V50" dash red /><path d="M53 58 L58 48 L63 58" className="lnr" />
      <text x="66" y="113" className="tr">paid from the savings,</text><text x="66" y="123" className="tr">or a fixed cooling tariff</text>
    </svg>
  )
}

/* ---------- 6 · the models ---------- */
const MODELS = [
  { D: DgEpcc, t: 'EPCC', p: 'IAQ delivers the complete project, commissioning included, and answers for how the system performs.', best: 'You want one accountable party.',
    rows: [['Contracts held by', 'IAQ'], ['Answers for the result', 'IAQ'], ['Typical term', '12 to 24 months']] },
  { D: DgEpcm, t: 'EPCM', p: 'The owner holds the construction contracts. IAQ manages design, contractors, programme and cost.', best: 'You want direct control of the contracts, often on the largest programmes.',
    rows: [['Contracts held by', 'The owner'], ['Answers for the result', 'IAQ manages, the contractors deliver'], ['Typical term', '12 to 24 months']] },
  { D: DgSingle, t: 'A single service', p: 'Any one of the six on its own: procurement only, design only, hookup only. The same model governs it.', best: 'You already hold the rest of the scope.',
    rows: [['Contracts held by', 'IAQ, for that scope'], ['Answers for the result', 'IAQ, for that scope'], ['Typical term', 'Set by the scope']] },
  { D: DgEsco, t: 'ESCO contract', p: 'EFM funds and runs the energy upgrade. Cooling as a Service, or Energy Performance Contracting.', best: 'You want lower energy cost with no capital spent.',
    rows: [['Funded by', 'IAQ'], ['Answers for the result', 'IAQ, for the savings'], ['Typical term', '5 to 20 years']] },
]
function S4() {
  return (
    <Slide n={6} name="Four ways to contract IAQ" title={<>Four ways to <em>contract IAQ.</em></>}
      sub="The model governs the work. The scope, one service or all six, sits inside it. In EPCC, IAQ does the work. In EPCM, IAQ manages the work for the owner.">
      <div className="s4">
        {MODELS.map(m => (
          <div className="s4-m cxs-card" key={m.t}>
            <m.D />
            <div className="s4-tx"><b>{m.t}</b><p>{m.p}</p>
              <dl className="s4-rows">{m.rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
              <div className="s4-best"><span>Best when</span>{m.best}</div>
            </div>
          </div>
        ))}
      </div>
    </Slide>
  )
}

/* ---------- 7 · the work ---------- */
const BIM = { csa: '/assets/iaq/bim-str.webp', mep: '/assets/iaq/bim-acmv.webp', process: '/assets/iaq/bim-process.webp' }
function S5() {
  return (
    <Slide n={7} name="The work: three disciplines" title={<>Three disciplines. <em>One contractor.</em></>}
      sub="The market classifies a contractor by the work it delivers. A specialist carries one discipline. IAQ carries all three. The drawings are IAQ’s own Revit model.">
      <div className="s5">
        <div className="s5-cols">
          {WORK.map(w => (
            <div className="s5-col cxs-card" key={w.id}>
              <div className="s5-top c-work"><span className="cxs-ic"><Icon name={w.icon} /></span><b>{w.name}</b></div>
              <span>{w.full}</span><i>{w.line}</i>
              <ul className="s5-sys c-sys">{w.systems.map(x => <li className="cxs-chip" key={x}>{x}</li>)}</ul>
              <figure className="s5-fig"><img className="mdl" src={BIM[w.id]} alt="" /></figure>
            </div>
          ))}
        </div>
        <div className="s5-bars">
          <div className="s5-bar iaq">IAQ<span>Inclusive: civil to process, under one roof</span></div>
          <div className="s5-bar">A civil contractor<span>CSA only</span></div><div className="s5-bar">An M&amp;E contractor<span>MEP only</span></div><div className="s5-bar">A process specialist<span>Process only</span></div>
        </div>
      </div>
    </Slide>
  )
}

/* ---------- 8 · EPC ---------- */
const EPC_ROWS = [
  ['Who holds the construction contracts', 'IAQ', 'The owner'],
  ['Who answers for the system performing', 'IAQ', 'IAQ manages, the owner’s contractors deliver'],
  ['Commissioning and start-up', 'Included', 'Coordinated by IAQ'],
  ['Typical programme', '12 to 24 months', '12 to 24 months'],
]
function S6() {
  return (
    <Slide n={8} name="Business unit 1 · EPC" title={<>EPC: one contract, from first drawing to <em>final handover.</em></>}
      sub="Engineering, Procurement and Construction. IAQ designs the system, procures it, builds it and proves it operates as intended.">
      <div className="s6">
        <div className="s6-facts">
          <div className="s6-fact cxs-card"><b>1</b><span>point of contact for the whole facility</span></div>
          <div className="s6-fact cxs-card"><b>12 to 24</b><span>months, a typical EPC programme</span></div>
          <div className="s6-fact cxs-card"><b>6</b><span>services, from design to tools hookup</span></div>
          <div className="s6-fact cxs-card"><b>3</b><span>disciplines in house: CSA, MEP, process</span></div>
        </div>
        <div className="s6-main">
          <div className="s6-two">
            <div className="s4-m cxs-card"><DgEpcc /><div className="s4-tx"><b>EPCC</b><p>Turnkey. IAQ delivers the complete project and is accountable for how the system performs.</p></div></div>
            <div className="s4-m cxs-card"><DgEpcm /><div className="s4-tx"><b>EPCM</b><p>Managed for the owner, who keeps the construction contracts and direct control.</p></div></div>
          </div>
          <div className="s6-tbl">
            <span className="h">At a glance</span><span className="h m">EPCC</span><span className="h m">EPCM</span>
            {EPC_ROWS.map(r => <React.Fragment key={r[0]}><span className="r">{r[0]}</span><span className="v">{r[1]}</span><span className="v">{r[2]}</span></React.Fragment>)}
          </div>
        </div>
      </div>
    </Slide>
  )
}

/* ---------- 9 · unit 2: the section ----------
   18 Sep, cross-check: the utility groups are IAQ's own (IAQ Utility Solutions deck, slide 4), the four phases are
   the unit head's (SL questionnaire, section D), and the two layers of the drawing are his explanation: the bulk
   systems are built with the base build, then each utility is tapped from its valve manifold into the tool. */
const UGROUPS = [
  ['Water', 'UPW plant and distribution, process drains, waste water treatment, reclaim'],
  ['Chemical and slurry', 'Bulk chemical, blending, dispense, storage tanks'],
  ['Gas', 'Bulk and specialty gas, abatement, bunkers, liquid dispense'],
  ['Process exhaust', 'General, acid, caustic, solvent and calamity'],
  ['Space management', 'The sub-fab planned in 3D BIM, off-site modules'],
]
const STEPS = [
  ['Facilitization', 'Before the tool arrives: drops, power, structure and room built to the maker’s requirements.'],
  ['Rig-in and move-in', 'Uncrated in an airlock, moved on an agreed route, set, levelled and isolated.'],
  ['Hook-up', 'Each utility tapped from its valve manifold and connected into the tool.'],
  ['Commissioning', 'Leak tested, purged, balanced, trip tested, then handed to operations.'],
]
const Pin = ({ x, y, n }) => <g><circle cx={x} cy={y} r="10" className="xs-pin" /><text x={x} y={y + 3.6} textAnchor="middle" className="xs-n">{n}</text></g>
function XSection() {
  const mains = [['Gases', 372], ['Chemicals', 390], ['UPW', 408], ['PCW', 426], ['CDA', 444]]
  return (
    <svg viewBox="0 0 640 480" role="img" aria-label="A section through a fab: bulk systems in the facility sub-fab, valve manifolds, the drops into a tool in the cleanroom, with IAQ's four hook-up phases marked">
      <rect x="0" y="20" width="640" height="156" rx="4" className="xs-band" /><rect x="0" y="188" width="640" height="118" rx="4" className="xs-band" /><rect x="0" y="316" width="640" height="150" rx="4" className="xs-band" />
      <text x="12" y="46" className="xs-l">Cleanroom</text><text x="12" y="208" className="xs-l">Clean sub-fab</text><text x="12" y="336" className="xs-l">Facility sub-fab</text>
      {Array.from({ length: 20 }).map((_, i) => <rect key={i} x={8 + i * 31.4} y="20" width="27" height="8" className="xs-tile" />)}
      {Array.from({ length: 32 }).map((_, i) => <rect key={i} x={3 + i * 19.85} y="176" width="15.5" height="12" className="xs-tile" />)}
      <rect x="0" y="306" width="640" height="10" className="xs-slab" />
      {[60, 108, 156, 504, 530].map(x => <path key={x} d={`M${x} 36 V158 M${x - 4} 150 L${x} 158 L${x + 4} 150`} className="xs-air" />)}
      <rect x="196" y="80" width="280" height="96" rx="3" className="xs-box" />
      <rect x="210" y="94" width="74" height="40" className="xs-tile" /><rect x="298" y="94" width="92" height="68" className="xs-tile" /><rect x="404" y="94" width="58" height="68" className="xs-tile" />
      <text x="336" y="70" textAnchor="middle" className="xs-t">Process tool</text>
      <rect x="340" y="246" width="54" height="60" rx="3" className="xs-box" /><text x="367" y="296" textAnchor="middle" className="xs-l">Pump</text>
      <rect x="404" y="246" width="54" height="60" rx="3" className="xs-box" /><text x="431" y="296" textAnchor="middle" className="xs-l">Chiller</text>
      <rect x="500" y="246" width="70" height="60" rx="3" className="xs-box" /><text x="535" y="296" textAnchor="middle" className="xs-l">Abatement</text>
      <path d="M570 270 H632" className="xs-exh" /><text x="600" y="260" textAnchor="middle" className="xs-l">Exhaust</text>
      {mains.map(([l, y]) => <g key={l}><path d={`M96 ${y} H632`} className="xs-main" /><text x="12" y={y + 3} className="xs-l">{l}</text></g>)}
      {mains.map(([l, y], i) => <path key={l} d={`M${216 + i * 24} ${y} V176`} className="xs-drop" />)}
      <rect x="204" y="330" width="120" height="22" rx="3" className="xs-vmb" /><text x="264" y="344.5" textAnchor="middle" className="xs-l">Valve manifolds</text>
      <path d="M367 246 V176 M431 246 V176 M462 176 V226 H535 V246" className="xs-drop" strokeDasharray="5 3.5" />
      <rect x="566" y="84" width="50" height="76" rx="3" className="xs-box" /><text x="591" y="74" textAnchor="middle" className="xs-l">Power panel</text>
      <path d="M566 144 H476" className="xs-drop" />
      <path d="M356 456 H384" className="xs-main" /><text x="390" y="459" className="xs-l">Built with the base build</text>
      <path d="M500 456 H528" className="xs-drop" /><text x="534" y="459" className="xs-l">Installed at hook-up</text>
      <Pin x={120} y={400} n="1" /><Pin x={336} y={46} n="2" /><Pin x={292} y={246} n="3" /><Pin x={489} y={128} n="4" />
    </svg>
  )
}
function S7() {
  return (
    <Slide n={9} name={'Business unit 2 · '+'Process Critical Utilities & Total Tool Installation'} title={<>From a delivered tool to <em>a producing tool.</em></>}
      sub="Two halves, one unit, for semiconductor fabs only. Process Critical Utilities builds the utilities with the base build. Total Tool Installation then connects each tool to them.">
      <div className="s7">
        <div className="s7-l">
          <h4>Process Critical Utilities<span>IAQ’s five solution groups</span></h4>
          <div className="s7-grp c-sys">{UGROUPS.map(([b, s]) => <div className="s7-g" key={b}><b><i />{b}</b><span>{s}</span></div>)}</div>
        </div>
        <div className="s7-fig"><XSection /></div>
        <div className="s7-r">
          <h4>Total Tool Installation<span>IAQ’s four phases, marked on the section</span></h4>
          <ol className="s7-st">{STEPS.map(([b, s], i) => <li key={b}><i>{i + 1}</i><div><b>{b}</b><span>{s}</span></div></li>)}</ol>
          <p className="s7-note cxs-card"><b>How it is bought</b>On its own, even in a fab IAQ did not build, or inside an EPCC or EPCM contract.</p>
        </div>
      </div>
    </Slide>
  )
}

/* ---------- 10 · EFM: the ring ---------- */
const RING = ['Assess', 'Plan', 'Analyse', 'Fund and build', 'Operate', 'Contract end']
function Ring() {
  const cx = 210, cy = 210, R = 150
  const pt = i => { const a = (-90 + i * 60) * Math.PI / 180; return [cx + R * Math.cos(a), cy + R * Math.sin(a)] }
  return (
    <svg viewBox="0 0 420 420" role="img" aria-label="The six steps of an energy contract, around zero upfront investment">
      <circle cx={cx} cy={cy} r="96" className="rg-core" />
      <circle cx={cx} cy={cy} r={R} className="rg-track" />
      <path d={`M ${pt(3)[0]} ${pt(3)[1]} A ${R} ${R} 0 0 1 ${pt(5)[0]} ${pt(5)[1]}`} className="rg-arc" />
      {RING.map((l, i) => {
        const [x, y] = pt(i); const hot = i >= 3; const w = l.split(' and ')
        return (
          <g key={l}>
            <circle cx={x} cy={y} r="39" className={'rg-node' + (hot ? ' hot' : '')} />
            <text x={x} y={y - 9} textAnchor="middle" className={'rg-n' + (hot ? ' hot' : '')}>{i + 1}</text>
            {w.length > 1 ? <><text x={x} y={y + 5} textAnchor="middle" className="rg-t">{w[0]}</text><text x={x} y={y + 18} textAnchor="middle" className="rg-t">and {w[1]}</text></>
              : l.split(' ').length > 1 ? <><text x={x} y={y + 5} textAnchor="middle" className="rg-t">{l.split(' ')[0]}</text><text x={x} y={y + 18} textAnchor="middle" className="rg-t">{l.split(' ')[1]}</text></>
                : <text x={x} y={y + 9} textAnchor="middle" className="rg-t">{l}</text>}
          </g>
        )
      })}
      <text x={cx} y={cy + 8} textAnchor="middle" className="rg-c">RM0</text>
      <text x={cx} y={cy + 30} textAnchor="middle" className="rg-cs">upfront investment</text>
      <text x={cx} y={cy - 46} textAnchor="middle" className="rg-cs">IAQ funds steps 4 to 6</text>
    </svg>
  )
}
function S8() {
  return (
    <Slide n={10} name="Business unit 3 · EFM" title={<>EFM: lower energy bills, <em>funded by IAQ.</em></>}
      sub="Energy Facility Management, a registered ESCO under Suruhanjaya Tenaga. IAQ funds, builds and runs the upgrade.">
      <div className="s8">
        <div className="s8-col">
          <h4>Two ways to pay for it</h4>
          <div className="s8-card m cxs-card"><span className="cxs-kick c-svc">10 to 20 years</span><b>Cooling as a Service</b><p>IAQ finances, builds or rehabilitates, and operates the chiller plant. A fixed tariff for the cooling used, under a service level agreement. The plant is handed over at the end.</p></div>
          <div className="s8-card m cxs-card"><span className="cxs-kick c-svc">5 to 10 years</span><b>Energy Performance Contracting</b><p>IAQ funds and delivers the upgrades. Every payment comes from the savings actually measured. After the contract, the owner keeps all of them.</p></div>
        </div>
        <div className="s8-fig"><Ring /></div>
        <div className="s8-col">
          <h4>The four problems it solves</h4>
          {[['High electricity bills', 'Inefficient cooling, driving cost up year after year.'], ['Rising carbon emissions', 'Compliance risk against regulation and targets.'], ['Ageing infrastructure', 'Chiller plant past its best, and a capital bill to replace it.'], ['Operational disruption', 'Downtime from old systems and poor maintenance.']].map(([b, p]) => <div className="s8-card cxs-card" key={b}><b>{b}</b><p>{p}</p></div>)}
        </div>
      </div>
    </Slide>
  )
}

/* ---------- 11 · proof, computed from the registry ---------- */
const MK_ICON = { 'semiconductor': 'chip', 'data-centre': 'server', 'ev-battery': 'battery', 'photovoltaic': 'sun', 'pharma': 'flask', 'fnb': 'bottle', 'district-cooling': 'snow' }
function S9() {
  const count = (ind, type) => PROJECTS.filter(p => p.ind === ind && p.type === type).length
  return (
    <Slide n={11} name="Proof, by market and by work delivered" title={<>Proof, by market and by <em>the work delivered.</em></>}
      sub={`The ${PROJECTS.length} published references of 250+ delivered projects. Each light is one project; client names are withheld.`}>
      <div className="s9">
        <div className="s9-mx">
          <span className="h">Market</span>{TYPES.map(([k, l]) => <span className="h" key={k}>{l}</span>)}
          {INDUSTRIES.map(([k, l]) => (
            <React.Fragment key={k}>
              <span className="m"><Icon name={MK_ICON[k] || 'grid'} />{l}</span>
              {TYPES.map(([t]) => { const n = count(k, t); return <span className={'c' + (n ? '' : ' z')} key={t}>{Array.from({ length: n }).map((_, i) => <i key={i} />)}</span> })}
            </React.Fragment>
          ))}
        </div>
        <div className="s9-side">
          <h4>By region</h4>
          <div className="s9-reg">{REGIONS.map(([k, l]) => { const n = PROJECTS.filter(p => p.region === k).length; return n ? <div key={k}>{l}<b>{n}</b></div> : null })}</div>
          <p className="s9-note">The full record is 250+ projects. This slide grows with the approved project list: every project added to the registry lights here on its own.</p>
        </div>
      </div>
    </Slide>
  )
}

export const SLIDES = [
  /* the reading order of the Codex: the cover, then section 1 (for everyone), then section 2 (for professionals) */
  { n: 0, C: S0, part: 1, name: 'Cover · One fab, every layer', says: 'Everything inside a fab, layer by layer, and which kind of work delivers each layer.', use: 'Profile: opens the business section. Website: the Services page hero. Booth screen, beside the 3D model.' },
  { n: 1, C: S1, part: 1, name: 'IAQ at a glance', says: 'Who IAQ is, and the three business units with what each one does.', use: 'Profile: the opening spread. Website: About.' },
  { n: 2, C: S2, part: 1, name: 'Three units across the life of a facility', says: 'When each unit is called in, from the first drawing to a plant in operation.', use: 'Profile: the page on the three business units. Website: Services, first screen. Booth screen.' },
  { n: 3, C: SMap, part: 2, name: 'IAQ in one picture', says: 'The six kinds of thing, one colour each: unit, model, service, work, system, market.', use: 'Profile: before the scope of services. Website: Services, beside the relationship map.' },
  { n: 4, C: SMix, part: 2, name: 'The words that get mixed up', says: 'The three words that mean two things, and how to say each one.', use: 'Internal first: the team, the profile writers, the booth crew. Then the glossary’s place on the site.' },
  { n: 5, C: S3, part: 2, name: 'Six services', says: 'The six services in a contract, and which unit carries each one.', use: 'Profile: scope of services. Website: Services, under the units.' },
  { n: 6, C: S4, part: 2, name: 'Four ways to contract IAQ', says: 'How the work is bought: EPCC, EPCM, one service alone, or an energy contract.', use: 'Profile: after scope of services. Website: the EPC page.' },
  { n: 7, C: S5, part: 2, name: 'The work: three disciplines', says: 'The work a contractor is classified by, and the systems inside it.', use: 'Profile: scope of work. Website: Services, the glossary’s place.' },
  { n: 8, C: S6, part: 2, name: 'Business unit 1 · EPC', says: 'Unit 1: one contract from the first drawing to handover, bought as EPCC or EPCM.', use: 'Profile: extension page 1, after the page on the three business units.' },
  { n: 9, C: S7, part: 2, name: 'Business unit 2 · Process Critical Utilities & Total Tool Installation', says: 'Unit 2: the utilities a tool runs on, and IAQ’s four phases to connect it.', use: 'Profile: extension page 2. Booth screen beside the 3D model.' },
  { n: 10, C: S8, part: 2, name: 'Business unit 3 · EFM', says: 'Unit 3: lower energy bills, funded by IAQ, in two kinds of contract.', use: 'Profile: extension page 3.' },
  { n: 11, C: S9, part: 2, name: 'Proof, by market and by work delivered', says: 'The published projects, by market and by the work delivered.', use: 'Profile: opens the project references. Website: Projects.' },
]
export default function CodexSlides() { return <>{SLIDES.map(s => <s.C key={s.n} />)}</> }
