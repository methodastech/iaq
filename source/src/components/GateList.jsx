import React from 'react'
import '../styles/gate-list.css'

/* The gate: the three conditions a stage has to meet before it moves on.

   10 Sep. Every service page had two sections one apart, "Scope list" and "How it runs", both
   drawn with DetailDiagram, both three items, both resolving to the same three marks. The audit
   called it "the page appears to say the same thing twice", and it was right, but the fix is
   not a delete: the h2 above the second one ("Three things have to be true before it moves
   on") is a real statement and deleting the diagram would strand it.

   The two sections mean different things and now LOOK different. Scope is what the stage
   covers: a rail of marks. This is the gate: three numbered conditions on an open ledger, each
   with a check, read top to bottom. Same copy, a different shape for a different meaning. */
export default function GateList({ items = [], ariaLabel }) {
  if (!items.length) return null
  return (
    <ol className="gl" aria-label={ariaLabel}>
      {items.map((t, i) => (
        <li className="gl-i" key={t} style={{ '--d': i * 90 + 'ms' }}>
          <span className="gl-n">{i + 1}</span>
          <span className="gl-t">{t}</span>
          <span className="gl-c" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="butt" strokeLinejoin="miter"><path d="M5 12.5l4.5 4.5L19 7"/></svg>
          </span>
        </li>
      ))}
    </ol>
  )
}
