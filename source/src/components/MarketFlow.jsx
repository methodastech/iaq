import React from 'react'
import Icon from './FlowIcon.jsx'
import { iconFor } from './DetailDiagram.jsx'
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
      {/* 20 Oct (client: "this one is repeated, remove it under all the services"): the six-stage row ("How it is delivered,
          stage by stage"), its lede and the closing loop line are off every market page; the scope row stays */}
    </div>
  )
}
