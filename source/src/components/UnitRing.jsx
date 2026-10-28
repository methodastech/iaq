import React from 'react'
import '../styles/unit-ring.css'

/* ============================================================================
   UnitRing · a unit's stages on the delivery ring (29 Sep 2026).

   Bazil, on the EPC page's serpentine cycle: "why this diagram look horrible, just use the round diagram here I
   guess", then "but better". The Services page ring (CycleRing), rebuilt for one unit:
     · One circle, six stations at 60 degree steps from the top, in the order they run on site. The line stops short
       of every station, so no object sits on a line and nothing is boxed or put in a disc.
     · Each station is the house isometric object for that service (public/assets/units/iso, the Design tab's six
       service objects). The stages the unit carries (`own`) are drawn full; the rest sit back, grey and light.
     · The hand-offs inside the unit are red: solid up to the stage in view, a light red after it. Hand-offs outside
       the unit stay a grey hairline. A plain chevron on each hand-off points the way round.
     · The centre carries the stage in view: its object drawn large (the animated drawing, its own small loop) and
       its name. No numbers anywhere.
     · Motion is a fade and the line drawing on; nothing grows or shrinks (no zoom, 29 Sep rule).
   ============================================================================ */

const KEYS = ['design', 'procure', 'construct', 'commission', 'maintain', 'hookup']
const NAMES = ['Design', 'Procurement', 'Construction', 'Commissioning', 'Maintenance', 'Tools hookup']
const CX = 500, CY = 500, R = 350
const TRIM = 15                                   /* degrees kept clear either side of a station */
const at = i => i * 60 - 90
const P = (d, r = R) => [CX + Math.cos(d * Math.PI / 180) * r, CY + Math.sin(d * Math.PI / 180) * r]
const seg = i => {
  const [x1, y1] = P(at(i) + TRIM), [x2, y2] = P(at(i + 1) - TRIM)
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}A${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`
}
const chev = i => {
  const d = at(i) + 30, [x, y] = P(d)
  return `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(d + 90).toFixed(1)})`
}

export default function UnitRing ({ own = [], active = 0, onPick }) {
  const pos = own.indexOf(active)
  /* a hand-off belongs to the unit when both its ends do; it is done when it leads into the stage in view or before it */
  const kind = i => {
    const j = (i + 1) % 6
    if (!own.includes(i) || !own.includes(j) || own.indexOf(j) !== own.indexOf(i) + 1) return 'off'
    return own.indexOf(j) <= pos ? 'done' : 'next'
  }
  return (
    <div className="uring">
      <svg className="uring-svg" viewBox="0 0 1000 1000" aria-hidden="true" focusable="false">
        {KEYS.map((_, i) => <path key={i} d={seg(i)} className={'uring-seg ' + kind(i)} pathLength="1" />)}
        {KEYS.map((_, i) => <path key={'c' + i} d="M-9 -10L1 0L-9 10" transform={chev(i)} className={'uring-chev ' + kind(i)} />)}
      </svg>
      {KEYS.map((k, i) => {
        const [x, y] = P(at(i))
        const mine = own.includes(i)
        return (
          <button key={k} type="button" className={'uring-st' + (mine ? '' : ' is-off') + (i === active ? ' on' : '')}
            style={{ left: x / 10 + '%', top: y / 10 + '%' }} tabIndex={mine ? 0 : -1} aria-pressed={i === active}
            onClick={mine && onPick ? () => onPick(i) : undefined}>
            <img src={`/assets/units/iso/${k}.webp`} alt="" width="240" height="240" decoding="async" />
            <span>{NAMES[i]}</span>
          </button>
        )
      })}
      <div className="uring-core" aria-live="polite">
        <img key={active} src={`/assets/units/iso/${KEYS[active]}.svg`} alt="" width="321" height="315" decoding="async" />
        <h3>{NAMES[active]}</h3>
      </div>
    </div>
  )
}
