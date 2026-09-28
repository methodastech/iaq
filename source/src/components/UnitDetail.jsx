import React from 'react'
import { Link } from 'react-router-dom'
import Icon from './FlowIcon.jsx'
import ModelIcon from './ModelIcon.jsx'
import { SERVICES, WORK } from '../data/business.js'
import { SCENARIOS } from '../data/codex.js'
import { UNIT_DIAGRAM } from './UnitDiagrams.jsx'

/* ============================================================================
   UnitDetail · the "Read more" of a business unit (24 Sep 2026, Bazil: "super detailed when click read more for all 3,
   otherwise easy, straight to the point"). Left, how it works, drawn. Right, everything IAQ has stated about the
   unit: what it is, when to call it, how it is bought (each model with its mark), the six services it carries, the
   work and the systems inside that work, the term, the typical requests, and the way to its page.
   ============================================================================ */
const MARKETS = { epc: 'All seven markets: semiconductor, data centre, EV battery, photovoltaics, district cooling, bio lifescience, food and beverage.', hookup: 'Semiconductor fabs only.', efm: 'Any facility with a cooling or energy bill worth cutting: chiller plants, district cooling, industrial plant.' }
const workById = id => WORK.find(w => w.id === id)
const svcById = id => SERVICES.find(s => s.id === id)

export default function UnitDetail({ u, onClose }) {
  const Dg = UNIT_DIAGRAM[u.id]
  const asks = SCENARIOS.filter(s => s.unit === u.id)
  return (
    <div className="sm-ud" id={'ud-' + u.id} role="region" aria-label={(u.short || u.name) + ', in detail'}>
      <header className="sm-ud-head">
        <span className="sm-uc-mark" aria-hidden="true"><Icon name={u.icon} /></span>
        <div><b>{u.short || u.name}</b><small>{u.id === 'hookup' ? u.name : u.full}</small></div>
        <button type="button" className="sm-ud-close" onClick={onClose} aria-label="Close">Close</button>
      </header>
      <div className="sm-ud-grid">
        <div className="sm-ud-dg">
          <h4>How it works</h4>
          {Dg && <Dg />}
        </div>
        <div className="sm-ud-txt">
          <p className="sm-ud-what">{u.what}</p>
          <dl className="sm-ud-spec">
            <div><dt>Call when</dt><dd className="sm-ud-when">{u.when}</dd></div>
            <div><dt>Bought as</dt><dd className="sm-ud-models">{u.models.map(m => <span key={m.t} className="sm-ud-model"><span className="sm-mi"><ModelIcon name={m.t} />{m.t}</span><small>{m.s}</small></span>)}</dd></div>
            <div><dt>What you buy</dt><dd>{u.bought}</dd></div>
            <div><dt>Services</dt><dd className="sm-svc6">{SERVICES.map(s => { const core = u.core.includes(s.id), ask = u.ask.includes(s.id); return <span key={s.id} className={'sm-chip s' + (core ? '' : ask ? ' ask' : ' off')}><i>{s.n}</i>{s.short}</span> })}<small className="sm-ud-note">{u.ask.length ? 'Solid: always carried. Dashed: ' + u.ask.map(id => svcById(id).short.toLowerCase()).join(', ') + ' when you ask for it. Faint: not this unit.' : 'All six, always.'}</small></dd></div>
            <div><dt>Work</dt><dd className="sm-ud-work">{u.work.map(w => { const wk = workById(w); return <span key={w} className="sm-ud-w"><b className="sm-chip w">{wk.name}</b><small>{wk.full}</small><span className="sm-ud-sys">{wk.systems.map(t => <i key={t}>{t}</i>)}</span></span> })}</dd></div>
            <div><dt>Term</dt><dd className="sm-uc-term">{u.term}</dd></div>
            <div><dt>Markets</dt><dd>{MARKETS[u.id]}</dd></div>
            {asks.length > 0 && <div><dt>Typical requests</dt><dd className="sm-ud-asks">{asks.map(a => <span key={a.ask}><q>{a.ask}</q><small>{a.model} · {a.services.map(id => svcById(id).short).join(', ')}</small></span>)}</dd></div>}
          </dl>
          <Link className="sm-uc-go" to={u.route}>Open {u.short || u.name} <i aria-hidden="true">&rarr;</i></Link>
        </div>
      </div>
    </div>
  )
}
