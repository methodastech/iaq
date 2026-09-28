import React from 'react'

/* ============================================================================
   UnitFlows · how each business unit works, as HTML flows (25 Sep 2026, Bazil: "recreate how it works better,
   responsive"). The SVG diagrams (UnitDiagrams.jsx) stay for the Codex; here every step is a real box of text that
   wraps, with the arrows drawn by CSS, so the flow reads at any width. Steps carry the unit's colour.
   ============================================================================ */
const Step = ({ t, s, on, dashed }) => <li className={'uf-step' + (on ? ' on' : '') + (dashed ? ' dashed' : '')}><b>{t}</b>{s && <small>{s}</small>}</li>
const Flow = ({ title, note, steps, group }) => (
  <div className="uf-flow">
    <p className="uf-t"><b>{title}</b>{note && <span>{note}</span>}</p>
    <ol className="uf-steps">
      {steps.map((st, i) => st.group
        ? <li key={i} className="uf-group"><span className="uf-group-l">{st.group}</span><ol className="uf-steps uf-inner">{st.steps.map((x, j) => <Step key={j} {...x} />)}</ol></li>
        : <Step key={i} {...st} />)}
    </ol>
  </div>
)

export function FlowEpc() {
  return (
    <div className="uf">
      <Flow title="EPCC" note="one contract, IAQ delivers everything, and answers for the system working as intended"
        steps={[{ t: 'Owner' }, { group: 'IAQ, one contract', steps: [{ t: 'Design', on: true }, { t: 'Procure', on: true }, { t: 'Construct', on: true }, { t: 'Commission', on: true }] }, { t: 'Handover' }]} />
      <Flow title="EPCM" note="the owner holds the construction contracts, IAQ manages them; engaged by large multinationals on the biggest programmes"
        steps={[{ t: 'Owner' }, { t: 'IAQ manages', s: 'design, programme and cost', on: true }, { t: 'Contractor A', s: 'owner’s contract', dashed: true }, { t: 'Contractor B', s: 'owner’s contract', dashed: true }, { t: 'Contractor C', s: 'owner’s contract', dashed: true }, { t: 'Handover' }]} />
    </div>
  )
}
export function FlowHookup() {
  return (
    <div className="uf">
      <Flow title="Process Critical Utilities builds the systems" note="in the sub-fab, inside a fab that keeps running; semiconductor only"
        steps={[{ t: 'Gases', on: true }, { t: 'Chemicals', on: true }, { t: 'UPW', s: 'ultrapure water', on: true }, { t: 'Exhaust', on: true }, { t: 'Power', on: true }]} />
      <Flow title="Total Tool Installation connects each tool" note="IAQ’s four phases, per tool"
        steps={[{ t: '1 Facilitize', s: 'drops, power and room built to the maker’s spec' }, { t: '2 Rig in', s: 'moved in on a route, set and levelled' }, { t: '3 Hook up', s: 'each utility tapped and connected', on: true }, { t: '4 Commission', s: 'leak tested, purged, released to production' }]} />
    </div>
  )
}
export function FlowEfm() {
  return (
    <div className="uf">
      <Flow title="Cooling as a Service" note="IAQ owns the plant, the owner buys the cooling; IAQ’s capital, the owner’s saving"
        steps={[{ t: 'IAQ funds and builds', s: 'the chiller plant' }, { t: 'IAQ operates it', s: '10 to 20 years' }, { t: 'Owner pays a tariff', s: 'per unit of cooling', on: true }, { t: 'Plant handed over', s: 'at the end' }]} />
      <Flow title="Energy Performance Contracting" note="the upgrade pays for itself; every payment comes from the saving actually measured"
        steps={[{ t: 'Audit', s: 'the baseline' }, { t: 'IAQ funds', s: 'the upgrades' }, { t: 'Savings measured', s: 'against the baseline' }, { t: 'Paid from savings', s: 'IAQ, 5 to 10 years', on: true }, { t: 'Owner keeps', s: 'all savings after' }]} />
      <p className="uf-t"><b>What the owner gains under both</b></p>
      <ul className="uf-gains"><li>Efficient cooling</li><li>Compliance held</li><li>Capital kept for the business</li><li>Uptime from new plant</li></ul>
    </div>
  )
}
export const UNIT_FLOW = { epc: FlowEpc, hookup: FlowHookup, efm: FlowEfm }
