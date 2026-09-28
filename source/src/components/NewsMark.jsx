import React from 'react'

/* ---------------------------------------------------------------------------
   NEWSROOM ICONOGRAPHY · one mark per story type.

   The newsroom carried five tags rendered as five identical text chips, so the
   archive read as one undifferentiated list. Each type now has a drawn mark, in
   the house language: a 20 unit grid, 1.6 stroke, square caps, no fills except
   the single red accent that marks what makes the type distinct.

   The marks are line drawings rather than glyphs from a set, so they inherit
   currentColor and sit at any size against light or dark without a second file.
   --------------------------------------------------------------------------- */

const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'square', strokeLinejoin: 'miter' }
const A = { fill: 'none', stroke: 'var(--nm-accent,#EC2027)', strokeWidth: 1.6, strokeLinecap: 'square' }

const MARKS = {
  /* community: three figures, the nearest one carried in the accent */
  CSR: (
    <>
      <circle cx="6" cy="7.5" r="2.1" {...P} />
      <path d="M2.6 16.5v-1.4a3.4 3.4 0 0 1 3.4-3.4h0a3.4 3.4 0 0 1 3.4 3.4v1.4" {...P} />
      <circle cx="14" cy="7.5" r="2.1" {...A} />
      <path d="M10.6 16.5v-1.4a3.4 3.4 0 0 1 3.4-3.4h0a3.4 3.4 0 0 1 3.4 3.4v1.4" {...A} />
    </>
  ),
  /* safety: a shield, with the accent as the check inside it */
  EHS: (
    <>
      <path d="M10 2.6 3.4 5.2v5.1c0 3.6 2.7 6.2 6.6 7.1 3.9-.9 6.6-3.5 6.6-7.1V5.2z" {...P} />
      <path d="M6.9 9.9l2.3 2.3 4-4.2" {...A} />
    </>
  ),
  /* quality: a calibration seal, accent on the certified centre */
  Quality: (
    <>
      <path d="M10 2.4l2 1.5 2.4-.4.7 2.3 2 1.4-1 2.2 1 2.2-2 1.4-.7 2.3-2.4-.4-2 1.5-2-1.5-2.4.4-.7-2.3-2-1.4 1-2.2-1-2.2 2-1.4.7-2.3 2.4.4z" {...P} />
      <path d="M7.4 10.1l1.9 1.9 3.3-3.4" {...A} />
    </>
  ),
  /* company: the group as a building, accent on the newest floor */
  Company: (
    <>
      <path d="M3.2 17.4V6.1l5.6-2.9v14.2" {...P} />
      <path d="M8.8 17.4V8.6l7.9 2.2v6.6" {...P} />
      <path d="M2 17.4h16" {...P} />
      <path d="M11.6 13.4h2.4" {...A} />
    </>
  ),
  /* industry: shared knowledge as a node graph, accent on the outbound link */
  Industry: (
    <>
      <circle cx="4.6" cy="14.8" r="1.9" {...P} />
      <circle cx="10" cy="5.2" r="1.9" {...P} />
      <path d="M5.7 13.1 8.9 6.9" {...P} />
      <circle cx="15.4" cy="14.8" r="1.9" {...A} />
      <path d="M11.1 6.9l3.2 6.2" {...A} />
    </>
  ),
}

export default function NewsMark({ tag, className = '' }) {
  const mark = MARKS[tag]
  if (!mark) return null
  return (
    <svg className={'nm ' + className} viewBox="0 0 20 20" width="20" height="20"
         aria-hidden="true" focusable="false">{mark}</svg>
  )
}

export const NEWS_TYPES = Object.keys(MARKS)
