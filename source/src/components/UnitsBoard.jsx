import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './FlowIcon.jsx'
import ModelIcon from './ModelIcon.jsx'
import { UNITS, SERVICES, WORK } from '../data/business.js'
import { SCENARIOS, LIFE } from '../data/codex.js'
import { UNIT_DIAGRAM_V } from './UnitDiagramsV.jsx'
import { sysIcon } from './codex/RelExplorer.jsx'   /* 25 Sep (Bazil: "you can add icons for each tag"): the same flat system marks the facility map draws */

/* ============================================================================
   UnitsBoard · the three business units as one board (24 Sep 2026, Bazil: "both these need to combine"; 25 Sep: "can this
   look a lot better", "too messy", "don't want this side"). Three columns and nothing else: no label column, each
   cell carries its own small caption. The short read on top (picture, name, line, when to call, how it is bought,
   the page); Read more opens the detailed rows in the same columns (how it works, drawn; what it is; what you buy;
   the six services; the work and its systems; term; markets; typical requests). Phones show one unit at a time.
   ============================================================================ */
/* 25 Sep (Bazil: "are these the best pictures to represent"): IAQ's own photographs (SharePoint, 17 Sep). EPC: a facility
   under construction from the air. PCU & TTI: the process utilities corridor of a cleanroom IAQ built. EFM: the plant at
   night, run and maintained. */
/* 21 Oct (IAQ feedback, Services overview · Building image: "Use approved generic imagery or an image with permission"):
   the three photographs above showed client sites (a fab under construction from the air, a client cleanroom, a client
   plant at night). Each unit now carries a generic picture generated in ChatGPT, with no client, site, sign or name in it:
   EPC, engineers reviewing drawings at a factory under construction; PCU & TTI, engineers in cleanroom suits checking a
   process utility valve panel in a sub-fab; EFM, a routine round in a chiller plant room. */
const PHOTO = { epc: '/assets/units/unit-card-epc.webp', hookup: '/assets/units/unit-card-pcu.webp', efm: '/assets/units/unit-card-efm.webp' }
const MARKETS = { epc: 'All seven markets: semiconductor, data centre, EV battery, photovoltaics, district cooling, bio lifescience, food and beverage.', hookup: 'Semiconductor fabs only.', efm: 'Any facility with a cooling or energy bill worth cutting: chiller plants, district cooling, industrial plant.' }
const workById = id => WORK.find(w => w.id === id)
const svcById = id => SERVICES.find(s => s.id === id)
const DETAIL = [
  /* 21 Oct (IAQ feedback, Services overview · repeated business model: "Keep the business-model diagram in one agreed
     location only"): the per-unit "How it works" diagram and the six-services row are off the Read more. The "Who does
     what" chart below the units is the one place the business model is drawn on this page. */
  ['What it is', u => u.what],
  ['What you buy', u => u.bought],
  ['Bought as, in detail', u => <span className="sm-ub-models">{u.models.map(m => <span className="sm-ud-model" key={m.t}><span className="sm-mi"><ModelIcon name={m.t} />{m.t}</span><small>{m.s}</small></span>)}</span>],
  ['Work and systems', u => <span className="sm-ud-work">{u.work.map(w => { const wk = workById(w); return <span key={w} className="sm-ud-w"><b className="sm-chip w"><Icon name={wk.icon} className="sm-ti" />{wk.name}</b><small>{wk.full}</small><span className="sm-ud-sys">{wk.systems.map(t => <i key={t}><Icon name={sysIcon(t)} className="sm-ti" />{t}</i>)}</span></span> })}</span>],
  ['Term', u => <b>{u.term}</b>],
  ['Markets', u => MARKETS[u.id]],
  ['Typical requests', u => <span className="sm-ud-asks">{SCENARIOS.filter(a => a.unit === u.id).map(a => <span key={a.ask}><q>{a.ask}</q><small>{a.model} · {a.services.map(id => svcById(id).short).join(', ')}</small></span>)}</span>],
]

export default function UnitsBoard() {
  const [open, setOpen] = useState(false)
  const [mob, setMob] = useState(0)
  const cell = i => 'sm-ub-cell' + (i === mob ? ' on' : '')
  const Row = ({ label, get, k }) => (
    <div className="sm-ub-row" role="row" key={k}>
      {UNITS.map((u, i) => <div className={cell(i)} role="cell" key={u.id}><small className="sm-ub-k">{label}</small><div className="sm-ub-v">{get(u)}</div></div>)}
    </div>
  )
  return (
    <div className={'sm-ub' + (open ? ' is-open' : '')} role="table" aria-label="The three business units" data-mob={mob}>
      <div className="sm-ub-tabs" role="tablist" aria-label="Business unit">
        {UNITS.map((u, i) => <button type="button" role="tab" key={u.id} aria-selected={i === mob} className={i === mob ? 'on' : ''} onClick={() => setMob(i)}>{u.short || u.name}</button>)}
      </div>
      <div className="sm-ub-row sm-ub-top" role="row">
        {UNITS.map((u, i) => (
          <div className={cell(i) + ' sm-ub-head'} role="cell" key={u.id} style={{ '--i': i }}>
            <div className="sm-uc-pic"><img src={PHOTO[u.id]} alt="" loading="lazy" decoding="async" /><span className="sm-ub-no">Unit {u.no}<i>{LIFE[i].k}</i></span></div>
            <h3><span className="sm-uc-mark" aria-hidden="true"><Icon name={u.icon} /></span><span className="sm-ub-nm">{u.short || u.name}<small>{u.id === 'hookup' ? u.name : u.full}</small></span></h3>
            <p className="sm-uc-line">{u.line}</p>
          </div>
        ))}
      </div>
      <Row k="when" label="Call when" get={u => <b className="sm-uc3-when">{u.when}</b>} />
      <Row k="bought" label="Bought as" get={u => <span className="sm-ub-models">{u.models.map(m => <span className="sm-mi" key={m.t}><ModelIcon name={m.t} />{m.t}</span>)}</span>} />
      {open && DETAIL.map(([label, get]) => <Row key={label} k={label} label={label} get={get} />)}
      <div className="sm-ub-row sm-ub-foot" role="row">
        {UNITS.map((u, i) => <div className={cell(i)} role="cell" key={u.id}><Link className="sm-uc-go" to={u.route}>Open {u.short || u.name} <i aria-hidden="true">&rarr;</i></Link></div>)}
      </div>
      <div className="sm-ub-more">
        <button type="button" className="sm-uc-more" aria-expanded={open} onClick={() => setOpen(o => !o)}>{open ? 'Less' : 'Read more: the three in detail'}<i aria-hidden="true">{open ? '−' : '+'}</i></button>
      </div>
    </div>
  )
}
