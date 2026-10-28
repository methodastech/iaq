import React, { useRef, useState } from 'react'
import { VALUES } from '../data/values.js'
import { LINE_SHAPES } from './HeroLineMarks.jsx'
import '../styles/values-split.css'

/* ============================================================================
   ValuesSplit · "Six values, held on every site." (1 Oct 2026)

   Replaces the fanned 3D carousel (components/ValuesCarousel.jsx, kept on disk, unmounted). Bazil: "make this
   section look better and improve word presentation", "and make it look awesome". The carousel showed one card
   clearly and five turned, veiled and small, so five of the six values could not be read at all.

   The form now is a split, and nothing in it is dimmed or turned:
     · left, one large photograph of IAQ's own work for the value in hand (IAQ's own site photographs, OneDrive
       share of 26 Sep; the six before these were generated and carried a Representation label)
     · right, the six names as one set of tabs, every name readable at rest, and under them the value in hand:
       its mark, its name large, IAQ's statement as the lead, and one supporting line from IAQ's own text
   It never moves on its own. A click, a tap or the keyboard changes it (arrow keys, Home, End), and the change
   is a fade with a short rise; nothing scales (house rule, 29 Sep). Under reduced motion it changes at once.

   Every panel and photograph is stacked in one cell, so the block keeps the height of its tallest value and
   nothing below it jumps when the value changes.
   ============================================================================ */

/* the value's photograph (public/assets/iaq/SOURCES.md, "The six values, IAQ's own photographs") */
const SHOT = {
  V01: { src: '/assets/iaq/val-real-safety.webp', pos: '0% 50%', cap: 'Safety induction on site',
         alt: 'An IAQ safety induction on site: the trainer presents working at height and the safety harness to the crew' },
  V02: { src: '/assets/iaq/val-real-quality.webp', pos: '50% 60%', cap: 'Cleanroom hall, floor laid',
         alt: 'A cleanroom hall built by IAQ, seen along its length: the raised floor laid and the ceiling grid lit' },
  V03: { src: '/assets/iaq/val-real-honesty.webp', pos: '50% 50%', cap: 'One drawing, read together',
         alt: 'IAQ engineers in IAQ vests reviewing one drawing together, each hand on the same sheet' },
  V04: { src: '/assets/iaq/val-real-engineering.webp', pos: '55% 50%', cap: 'Chilled water plant',
         alt: 'Two IAQ engineers walk a chilled water plant room with the drawing, between insulated pipework and valves' },
  V05: { src: '/assets/iaq/val-real-efficiency.webp', pos: '45% 50%', cap: 'Crew at the scissor lift',
         alt: 'An IAQ engineer directs a crew onto a scissor lift, one worker helping the next onto the platform' },
  V06: { src: '/assets/iaq/val-real-excellence.webp', pos: '55% 50%', cap: 'Facade at sunset',
         alt: 'A boom lift at a facade and a steel pipe rack at sunset, on an IAQ site' },
}

/* the marks, drawn to the house line spec (HeroLineMarks.jsx: 24 grid, one stroke, no fill, baseline 20, ONE red
   element, always the last shape). Three come from the house set, three are drawn here on the same four numbers:
     V01 the shield, the check red (recSafety)          V04 the chiller plant, the fan hub red (recCooling)
     V02 the cleanroom bay, one filter unit red (recClean) V05 the stopwatch, the hand red
     V03 the plumb line, the bob red: true, and seen to be V06 the steps up, the next step red */
const MARK = {
  V01: LINE_SHAPES.recSafety,
  V02: LINE_SHAPES.recClean,
  V03: ['M4 20h16', 'M6.5 4h11', 'M12 4v8.4', 'F:M9.6 12.4h4.8L12 18.6z'],
  V04: LINE_SHAPES.recCooling,
  V05: ['M5.5 13.5a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0-13 0', 'M10.4 4.5h3.2M12 4.5V7', 'M17.1 8.4l1.3-1.3', 'M12 9.3v1.1M16.2 13.5h-1.1M12 17.7v-1.1M7.8 13.5h1.1', 'M12 13.5l3-3'],
  V06: ['M4 20h16', 'M4 20v-4h4v-4h4V8h4', 'M20 8v12', 'F:M16 4h4v4h-4z'],
}
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 0.95, strokeLinecap: 'butt', strokeLinejoin: 'miter' }
const SIG = { fill: 'none', stroke: '#FF3B42', strokeWidth: 1.45, strokeLinecap: 'butt', strokeLinejoin: 'miter' }
const draw = (d, k, a) => d.startsWith('F:')
  ? <path key={k} d={d.slice(2)} fill={a.stroke} stroke="none" />
  : <path key={k} d={d} {...a} />
function Mark({ ix }) {
  const sh = MARK[ix]
  return (
    <svg className="vs-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {sh.slice(0, -1).map((d, k) => draw(d, k, S))}
      {draw(sh[sh.length - 1], 'r', SIG)}
    </svg>
  )
}

const N = VALUES.length
/* no runts (house type rule, 29 Sep): the last three words of a statement travel together, so a paragraph that breaks
   never leaves one or two words alone on its last line */
const keep3 = t => t.replace(/ (\S+) (\S+)$/, '\u00a0$1\u00a0$2')

export default function ValuesSplit() {
  const [i, setI] = useState(0)
  const tabs = useRef([])

  const pick = n => { setI(n); const t = tabs.current[n]; if (t && document.activeElement !== t) t.focus() }
  const onKey = e => {
    const k = e.key
    let n = null
    if (k === 'ArrowRight' || k === 'ArrowDown') n = (i + 1) % N
    else if (k === 'ArrowLeft' || k === 'ArrowUp') n = (i - 1 + N) % N
    else if (k === 'Home') n = 0
    else if (k === 'End') n = N - 1
    if (n === null) return
    e.preventDefault()
    pick(n)
  }

  return (
    <div className="vs">
      <div className="vs-tabs" role="tablist" aria-label="IAQ values" onKeyDown={onKey}>
        {VALUES.map((v, n) => (
          <button key={v.ix} type="button" role="tab" id={'vs-tab-' + v.ix} aria-controls={'vs-panel-' + v.ix}
                  aria-selected={n === i} tabIndex={n === i ? 0 : -1} className={'vs-tab' + (n === i ? ' on' : '')}
                  ref={el => { tabs.current[n] = el }} onClick={() => setI(n)}>
            {v.title}
          </button>
        ))}
      </div>

      <figure className="vs-stage">
        {VALUES.map((v, n) => {
          const s = SHOT[v.ix]
          return (
            <div key={v.ix} className={'vs-shot' + (n === i ? ' on' : '')} aria-hidden={n === i ? undefined : 'true'}>
              <img src={s.src} alt={n === i ? s.alt : ''} loading="lazy" decoding="async" style={{ objectPosition: s.pos }} />
              {/* what the photograph shows, flush in its top left corner on a solid block (IAQ graphic rules) */}
              <span className="vs-cap">{s.cap}</span>
            </div>
          )
        })}
      </figure>

      <div className="vs-panels">
        {VALUES.map((v, n) => (
          <div key={v.ix} role="tabpanel" id={'vs-panel-' + v.ix} aria-labelledby={'vs-tab-' + v.ix}
               className={'vs-panel' + (n === i ? ' on' : '')} aria-hidden={n === i ? undefined : 'true'}
               inert={n === i ? undefined : true} tabIndex={n === i ? 0 : -1}>
            <Mark ix={v.ix} />
            <h3 className="vs-name">{v.title}</h3>
            <p className="vs-lead">{keep3(v.line)}</p>
            <p className="vs-note">{keep3(v.note)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
