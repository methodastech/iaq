import React from 'react'
import { VALUES } from '../data/values.js'
import Icon from './FlowIcon.jsx'

/* "Six values, held on every site." — the third attempt, and the client was right about the
   other two.

   FIRST: six isometric line drawings, one per card. None of them said "safety" or "integrity"
   on sight, so the label did all the work and the art was noise.
   SECOND: a radial orbit — six values on spokes around a hub. It read as a huge white field
   with a heavy black dot in the middle and six small rings scattered round it. The labels sat
   at different distances depending on which side they fell, there was dead space through the
   whole middle band, and the dotted ellipse earned nothing. "Horrible" was fair.

   THIS: no picture of the idea at all. The values are set as an INDEX — the vocabulary this
   site already speaks on its registry, its spec rows and its market cards. A hairline opens
   each entry, the mono index sits above it, the mark is small and quiet, and the value itself
   is the largest thing in its cell. Nothing is drawn that the words do not already say, which
   is why it holds up where the drawings did not: a value is a statement, not a diagram.

   The hairline is the whole structure. It carries the red on hover, so the section has one
   moving part and no boxes at all. */

const MARKS = ['shield', 'check', 'people', 'drawing', 'gauge', 'chart']

export default function ValuesIndex() {
  return (
    <ol className="vx">
      {VALUES.map((v, i) => (
        <li className="vx-i" key={v.ix} style={{ '--d': (i % 3) * 90 + 'ms' }}>
          <span className="vx-rule" aria-hidden="true" />
          <span className="vx-top">
            <span className="vx-ix">{v.ix}</span>
            <span className="vx-mark" aria-hidden="true"><Icon name={MARKS[i]} /></span>
          </span>
          <h3>{v.title}</h3>
          <p>{v.line}</p>
        </li>
      ))}
    </ol>
  )
}
