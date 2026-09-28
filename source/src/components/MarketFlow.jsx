import React from 'react'
import { Link } from 'react-router-dom'
import Icon from './FlowIcon.jsx'
import { iconFor } from './DetailDiagram.jsx'
import { CYCLE } from '../data/cycle.js'
import '../styles/market-flow.css'

/* ============================================================================
   MarketFlow · the market page's "how IAQ delivers it" diagram, 25 Sep 2026 (Bazil: "make sure every
   market's complete flow or diagram is easier for people to understand"). Two rows a reader can follow
   left to right without a legend:
     1  What IAQ builds in this market: the typical scope, numbered, each with its mark, an arrow to the next
     2  How it is delivered: the six stages of the cycle, numbered, each with its mark, its name and one line,
        every stage a link to its service page, and the closing line that says the cycle repeats
   Filled tiles, not a rail of thin lines; sentence-case heads, no mono labels. Replaces the flow rail
   (DetailDiagram variant "flow") and the six-box strip (.pg-rail) that stood here.
   ========================================================================= */
export default function MarketFlow ({ scope = [], scopeTitle, lede }) {
  return (
    <div className="mf">
      {scope.length > 0 && (
        <div className="mf-row">
          <h3 className="mf-h">{scopeTitle || 'What IAQ builds here'}</h3>
          <ol className="mf-scope">
            {scope.map((s, i) => (
              <li key={s}>
                <span className="mf-ic" aria-hidden="true"><Icon name={iconFor(s)} /></span>
                <span className="mf-t"><span className="mf-n">{i + 1}</span><b>{s}</b></span>
              </li>
            ))}
          </ol>
        </div>
      )}
      {lede && <p className="mf-lede">{lede}</p>}
      <div className="mf-row">
        <h3 className="mf-h">How it is delivered, <em>stage by stage.</em></h3>
        <ol className="mf-cycle">
          {CYCLE.map(d => (
            <li key={d.id}>
              <Link to={d.route}>
                <span className="mf-n">Stage {d.no}</span>
                <span className="mf-ic" aria-hidden="true"><Icon name={d.icon} /></span>
                <b>{d.short}</b>
                <small>{d.kick}</small>
              </Link>
            </li>
          ))}
        </ol>
        <p className="mf-loop">The cycle closes: tools hookup feeds the next design.</p>
      </div>
    </div>
  )
}
