import React from 'react'
import { Link } from 'react-router-dom'
import Icon from './FlowIcon.jsx'
import ModelIcon from './ModelIcon.jsx'
import { UNITS, SERVICES, WORK } from '../data/business.js'
import { SCENARIOS } from '../data/codex.js'
import { UNIT_DIAGRAM } from './UnitDiagrams.jsx'
import IsoIcon from './IsoIcon.jsx'
const ISO_U = { epc: 'epc', hookup: 'hookupUnit', efm: 'efm' }

/* ============================================================================
   UnitsCompare · the three business units side by side (24 Sep 2026, Bazil: "once you click Read more it's for the
   whole 3 units, so combine this into a table together"). One panel under the three cards: the three how-it-works
   diagrams in a row, then one table, a row per fact and a column per unit, so the three read across.
   ============================================================================ */
const MARKETS = { epc: 'All seven markets: semiconductor, data centre, EV battery, photovoltaics, district cooling, bio lifescience, food and beverage.', hookup: 'Semiconductor fabs only.', efm: 'Any facility with a cooling or energy bill worth cutting: chiller plants, district cooling, industrial plant.' }
const workById = id => WORK.find(w => w.id === id)
const svcById = id => SERVICES.find(s => s.id === id)
const ROWS = [
  ['What it is', u => u.what],
  ['Call when', u => <b className="sm-uc3-when">{u.when}</b>],
  ['Bought as', u => <span className="sm-uc3-models">{u.models.map(m => <span className="sm-ud-model" key={m.t}><span className="sm-mi"><ModelIcon name={m.t} />{m.t}</span><small>{m.s}</small></span>)}</span>],
  ['What you buy', u => u.bought],
  ['Services', u => <span className="sm-svc6">{SERVICES.map(s => { const core = u.core.includes(s.id), ask = u.ask.includes(s.id); return <span key={s.id} className={'sm-chip s' + (core ? '' : ask ? ' ask' : ' off')}><i>{s.n}</i>{s.short}</span> })}<small className="sm-ud-note">{u.ask.length ? 'Dashed: ' + u.ask.map(id => svcById(id).short.toLowerCase()).join(', ') + ' when you ask for it. Faint: not this unit.' : 'All six, always.'}</small></span>],
  ['Work and systems', u => <span className="sm-ud-work">{u.work.map(w => { const wk = workById(w); return <span key={w} className="sm-ud-w"><b className="sm-chip w">{wk.name}</b><small>{wk.full}</small><span className="sm-ud-sys">{wk.systems.map(t => <i key={t}>{t}</i>)}</span></span> })}</span>],
  ['Term', u => <b>{u.term}</b>],
  ['Markets', u => MARKETS[u.id]],
  ['Typical requests', u => <span className="sm-ud-asks">{SCENARIOS.filter(a => a.unit === u.id).map(a => <span key={a.ask}><q>{a.ask}</q><small>{a.model} · {a.services.map(id => svcById(id).short).join(', ')}</small></span>)}</span>],
]

export default function UnitsCompare({ onClose }) {
  return (
    <div className="sm-uc3" id="units-compare" role="region" aria-label="The three business units, side by side">
      <header className="sm-uc3-head">
        <h3>The three units, <em>side by side.</em></h3>
        <button type="button" className="sm-ud-close" onClick={onClose}>Close</button>
      </header>
      <div className="sm-uc3-dg">
        {UNITS.map(u => { const Dg = UNIT_DIAGRAM[u.id]; return (
          <figure key={u.id}>
            <figcaption><span className="sm-uc-mark sm-uc-iso" aria-hidden="true"><IsoIcon name={ISO_U[u.id]} /></span><b>{u.short || u.name}</b><small>how it works</small></figcaption>
            {Dg && <Dg />}
          </figure>) })}
      </div>
      <div className="sm-uc3-wrap">
        <table className="sm-uc3-t">
          <thead>
            <tr><th scope="col"><span className="sm-uc3-corner">Compared</span></th>{UNITS.map(u => <th scope="col" key={u.id}><span className="sm-uc-mark sm-uc-iso" aria-hidden="true"><IsoIcon name={ISO_U[u.id]} /></span><b>{u.short || u.name}</b><small>{u.id === 'hookup' ? u.name : u.full}</small></th>)}</tr>
          </thead>
          <tbody>
            {ROWS.map(([label, get]) => <tr key={label}><th scope="row">{label}</th>{UNITS.map(u => <td key={u.id}>{get(u)}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
      <div className="sm-uc3-go">{UNITS.map(u => <Link key={u.id} className="sm-uc-go" to={u.route}>Open {u.short || u.name} <i aria-hidden="true">&rarr;</i></Link>)}</div>
    </div>
  )
}
