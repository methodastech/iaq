import React, { useState } from 'react'
import Icon from '../FlowIcon.jsx'
import { KINDS } from '../../data/codex.js'

/* ============================================================================
   KindsGuide · the six kinds of thing (24 Sep 2026). Bazil, on the key band: "I need more detailed explanation on
   this and example, names and even icons and visual", "and then have a table, detailed, on what it really is,
   compared", then "make a summary view and a detailed view, add icons or other visuals to make it easier to
   differentiate and understand".

   Two views of the same six, one switch:
     Summary   six tiles: the icon in the kind's colour, the name, how many, one line, and every name as a chip with
               its own small icon. Enough to tell the kinds apart at a glance.
     Detailed  the six cards in full (what it is, the names explained, an example sentence, Think / Not / On the
               site) and the comparison table, eight rows across the six.
   Print and the PDF carry the detailed view. Data: KINDS in data/codex.js. Colours: the Codex grammar.
   ============================================================================ */
const ROWS = [
  ['What it is', k => k.what],
  ['How many IAQ has', k => k.count],
  ['The names', k => k.names.map(n => n[1]).join(' · ')],
  ['Who decides it', k => k.decides],
  ['Think of it as', k => k.think],
  ['Often confused with', k => k.not],
  ['Where you see it on the site', k => k.where],
  ['Colour in every picture', k => k.colour],
]
const ONE_LINE = { u: 'Who you buy from.', m: 'How the contract runs.', s: 'What is in the contract.', w: 'The discipline that does it.', y: 'The thing being built.', k: 'Who it is for.' }

function Summary() {
  return (
    <div className="cx-ks">
      {KINDS.map(k => (
        <article className={'cx-kst k-' + k.k} key={k.k}>
          <header>
            <span className="cx-kc-ic"><Icon name={k.icon} /></span>
            <span><b>{k.name}</b><small>{k.count} · {ONE_LINE[k.k]}</small></span>
          </header>
          <ul className="cx-kst-names">
            {k.names.map(([ic, n]) => <li key={n}><Icon name={ic} />{n}</li>)}
          </ul>
          <p className="cx-kst-think"><b>Think:</b> {k.think}</p>
        </article>
      ))}
    </div>
  )
}

function Detailed() {
  return (
    <>
      <div className="cx-kg">
        {KINDS.map(k => (
          <article className={'cx-kc k-' + k.k} key={k.k}>
            <header>
              <span className="cx-kc-ic"><Icon name={k.icon} /></span>
              <span><b>{k.name}</b><small>{k.count}</small></span>
            </header>
            <p className="cx-kc-what">{k.what}</p>
            <ul className="cx-kc-names">
              {k.names.map(([ic, n, d]) => <li key={n}><Icon name={ic} /><span><b>{n}</b>{d}</span></li>)}
            </ul>
            <p className="cx-kc-eg">{k.example}</p>
            <dl className="cx-kc-meta">
              <div><dt>Think</dt><dd>{k.think}</dd></div>
              <div><dt>Not</dt><dd>{k.not}</dd></div>
              <div><dt>On the site</dt><dd>{k.where}</dd></div>
            </dl>
          </article>
        ))}
      </div>
      <h3 className="cx-kinds-h3">Side by side, <em>what each one really is.</em></h3>
      <div className="cx-kt-wrap">
        <table className="cx-kt">
          <thead>
            <tr><th scope="col"><span className="cx-kt-corner">Compared</span></th>{KINDS.map(k => <th scope="col" key={k.k} className={'k-' + k.k}><Icon name={k.icon} />{k.name}</th>)}</tr>
          </thead>
          <tbody>
            {ROWS.map(([label, get]) => (
              <tr key={label}><th scope="row">{label}</th>{KINDS.map(k => <td key={k.k} className={'k-' + k.k}>{get(k)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default function KindsGuide() {
  const [view, setView] = useState('summary')
  return (
    <section className={'cx-kinds v-' + view} aria-labelledby="cx-kinds-h" data-noab="">
      <div className="pg-in">
        <div className="cx-kinds-top">
          <div>
            <h2 id="cx-kinds-h" className="cx-kinds-h">How to read every picture: <em>the six kinds of thing.</em></h2>
            <p className="cx-kinds-lede">One colour and one icon per kind, the same everywhere on this page. Summary tells them apart; Detailed says what each one is, what IAQ calls it, and what it is not.</p>
          </div>
          <div className="cx-kinds-sw" role="tablist" aria-label="View">
            {/* 24 Sep (Bazil: "make tab more visible and icon it") */}
            <button type="button" role="tab" aria-selected={view === 'summary'} className={view === 'summary' ? 'on' : undefined} onClick={() => setView('summary')}><Icon name="grid" /><span>Summary<small>Six tiles, at a glance</small></span></button>
            <button type="button" role="tab" aria-selected={view === 'detailed'} className={view === 'detailed' ? 'on' : undefined} onClick={() => setView('detailed')}><Icon name="layers" /><span>Detailed<small>Cards and the comparison table</small></span></button>
          </div>
        </div>
        <div className="cx-kinds-sum">{(view === 'summary') && <Summary />}</div>
        <div className="cx-kinds-det">{(view === 'detailed') && <Detailed />}</div>
        {/* print carries the detailed view whichever is on screen */}
        <div className="cx-kinds-print" aria-hidden="true">{view !== 'detailed' && <Detailed />}</div>
      </div>
    </section>
  )
}
