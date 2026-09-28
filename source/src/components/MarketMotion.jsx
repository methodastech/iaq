import React, { useEffect, useRef } from 'react'
import '../styles/market-motion.css'

/* ============================================================================
   MarketMotion · one drawn scene per market for the market hero, 25 Sep 2026 (Bazil: "create a more
   detailed icon instead that can animate", after "don't put icons in a box", "avoid using gradient or
   double mirror"). The ValueMotion language: a 240 x 160 sheet of line work in the hero's own light
   ink, no ground, no box, and IAQ red doing the ONE movement that says what the market is:
     semiconductor     a wafer on its chuck; the stepper beam sweeps it
     data centre       three racks; cold air runs the aisle and the units blink
     EV battery        a prismatic cell in the dry room; it charges segment by segment, the bolt lands
     photovoltaics     a module under the sun; the rays draw and the yield runs to the inverter
     district cooling  the chiller plant; chilled water travels the mains to three buildings
     bio lifescience   a bay under HEPA filters; laminar air falls over the vessel
     food and beverage a bottling line; the filler fills the bottle and the line moves on
   Loops only while on screen (.live), a finished still under reduced motion.
   ========================================================================= */

const Sheet = ({ cls, label, children }) => (
  <svg className={'mm-svg ' + cls} viewBox="0 0 240 160" aria-hidden="true">
    {children}
    {label && <text className="mm-st" x="120" y="152">{label}</text>}
  </svg>
)

const SCENES = {
  'mkt-semiconductor': () => (
    <Sheet cls="mm-sem" label="WAFER FAB, ISO 3 TO ISO 7">
      <defs><clipPath id="mmSemClip"><circle cx="120" cy="80" r="50" /></clipPath></defs>
      <circle className="i f" cx="120" cy="80" r="50" />
      <g clipPath="url(#mmSemClip)">
        <path className="i w08 o5" d={Array.from({ length: 9 }, (_, k) => `M${72 + k * 12} 30V130`).join('') + Array.from({ length: 9 }, (_, k) => `M70 ${32 + k * 12}H170`).join('')} />
        <rect className="rf sweep" x="66" y="30" width="5" height="100" />
      </g>
      <path className="i" d="M116 130h8" />
      <circle className="rf pop" style={{ '--pd': '1.6s' }} cx="120" cy="80" r="4" />
    </Sheet>
  ),
  'mkt-data-centre': () => (
    <Sheet cls="mm-dat" label="DATA HALL, N+1">
      {[44, 104, 164].map((x, k) => (
        <g key={x}>
          <rect className="i f" x={x} y="28" width="32" height="104" />
          <path className="i w08 o5" d={Array.from({ length: 7 }, (_, j) => `M${x + 4} ${40 + j * 13}H${x + 28}`).join('')} />
          <circle className="rf pop" style={{ '--pd': `${.4 + k * .5}s` }} cx={x + 26} cy="35" r="2" />
        </g>
      ))}
      {/* 25 Sep (Bazil: "not overlapping and messy"): the airflow runs under the racks, not across their faces */}
      <path className="r flow" d="M14 16H226" />
      <path className="r" d="M220 11l6 5-6 5" />
    </Sheet>
  ),
  'mkt-ev-battery': () => (
    <Sheet cls="mm-ev" label="DRY ROOM, MINUS 40 DEW POINT">
      <rect className="i f" x="46" y="46" width="140" height="70" />
      <rect className="i f" x="186" y="68" width="10" height="26" />
      {[0, 1, 2, 3, 4].map(k => <rect key={k} className="rf seg" style={{ '--pd': `${.4 + k * .45}s` }} x={56 + k * 25} y="56" width="20" height="50" />)}
      <path className="wk pop" style={{ '--pd': '3s' }} d="M122 60l-10 22h10l-6 20 18-26h-11l6-16z" />
    </Sheet>
  ),
  'mkt-photovoltaics': () => (
    <Sheet cls="mm-pv" label="CELL AND MODULE LINES">
      <circle className="i" cx="196" cy="34" r="9" />
      {Array.from({ length: 8 }, (_, k) => { const a = k * Math.PI / 4, c = Math.cos(a), s = Math.sin(a); return <path key={k} className="r draw" pathLength="1" style={{ '--pd': `${k * .08}s` }} d={`M${(196 + c * 14).toFixed(1)} ${(34 + s * 14).toFixed(1)}L${(196 + c * 22).toFixed(1)} ${(34 + s * 22).toFixed(1)}`} /> })}
      <path className="i f" d="M40 108L176 108L156 52L60 52Z" />
      <path className="i w08 o5" d="M50 80H166M45 94H171M74 52L64 108M100 52L96 108M126 52L128 108M142 52L160 108" />
      <path className="i" d="M108 108v26M88 134h40" />
      <rect className="i f" x="172" y="118" width="30" height="20" />
      <path className="r flow" d="M128 134H172" />
    </Sheet>
  ),
  'mkt-district-cooling': () => (
    <Sheet cls="mm-dch" label="CHILLED WATER, 24 HOURS">
      <rect className="i f" x="14" y="88" width="66" height="48" />
      <circle className="i" cx="32" cy="112" r="9" /><circle className="i" cx="60" cy="112" r="9" />
      <path className="i w22" d="M80 100H128V46H226" />
      <path className="i o5" d="M80 122H140V58H226" />
      {[[136, 70, 24, 66], [170, 56, 26, 80], [206, 78, 20, 58]].map(([x, y, w, h]) => <rect key={x} className="i f" x={x} y={y} width={w} height={h} />)}
      <path className="i w08 o5" d="M142 82h12M142 94h12M142 106h12M176 68h14M176 82h14M176 96h14M176 110h14M211 90h10M211 104h10" />
      <path className="r flow" d="M80 100H128V46H226" />
    </Sheet>
  ),
  'mkt-bio-lifescience': () => (
    <Sheet cls="mm-bio" label="ISO 5 TO ISO 8, GMP">
      <path className="i" d="M30 26H210V134H30Z" />
      {[46, 90, 134, 178].map(x => <rect key={x} className="i f" x={x} y="26" width="26" height="8" />)}
      {[59, 103, 147, 191].map((x, k) => <path key={x} className="r flow" style={{ '--pd': `${k * .2}s` }} d={`M${x} 40V120`} />)}
      {/* 25 Sep (Bazil: "not overlapping"): the vessel stands between the second and third laminar columns */}
      <rect className="i f" x="108" y="84" width="34" height="36" />
      <ellipse className="i f" cx="125" cy="84" rx="17" ry="5" />
      <path className="i" d="M117 72v12M133 72v12" />
    </Sheet>
  ),
  'mkt-food-beverage': () => (
    <Sheet cls="mm-fnb" label="HYGIENIC, FOOD GRADE">
      <path className="i w22" d="M18 122H222" />
      {[36, 84, 132, 180].map(x => <circle key={x} className="i" cx={x} cy="128" r="4" />)}
      {[52, 108, 164].map((x, k) => (
        <g key={x}>
          <path className="i f" d={`M${x - 10} 120V86q0-6 6-8v-6h8v6q6 2 6 8v34z`} />
          {k === 1 && <rect className="rf fillup" x={x - 8} y="92" width="16" height="26" />}
        </g>
      ))}
      <rect className="i f" x="98" y="40" width="20" height="22" />
      {/* 25 Sep (Bazil: "not overlapping"): the nozzle stops above the neck, the check sits in the bottle */}
      <path className="i" d="M108 62v5M104 67h8" />
      <path className="r pop" style={{ '--pd': '3.2s' }} d="M104 102l4 4 8-8" />
    </Sheet>
  ),
}

export default function MarketMotion ({ id }) {
  const host = useRef(null)
  const Scene = SCENES[id]
  useEffect(() => {
    const el = host.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => el.classList.toggle('live', e.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  if (!Scene) return null
  return <span className="mm" ref={host} aria-hidden="true"><Scene /></span>
}
