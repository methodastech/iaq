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
    {/* 20 Oct ("remove this tag as well", "same goes with this"): no label under any market drawing (the class, dew point and
        redundancy captions were claims IAQ has not confirmed) */}
  </svg>
)

const SCENES = {
  /* 20 Oct ("make the animation easy to understand"): the chip is made from the wafer, shown literally. One die on the wafer
     lights up, lifts off and travels right, leaving its empty slot; the chip's package draws round it and its pins appear: a
     finished microchip. Then it all resets. The still (reduced motion, off screen) is the finished state. */
  'mkt-semiconductor': () => (
    <Sheet cls="mm-sem">
      <defs><clipPath id="mmSemClip"><circle cx="78" cy="80" r="46" /></clipPath></defs>
      <circle className="i f" cx="78" cy="80" r="46" />{/* 20 Oct ("what is that", the wafer notch): a plain circle, the notch read as a glitch */}
      <g clipPath="url(#mmSemClip)">
        <path className="i w08 o5" d={Array.from({ length: 9 }, (_, k) => `M${30 + k * 12} 30V130`).join('') + Array.from({ length: 9 }, (_, k) => `M28 ${32 + k * 12}H128`).join('')} />
      </g>
      <rect className="i w08 sem-slot" x="78" y="68" width="12" height="12" strokeDasharray="2 2" />
      <rect className="i f sem-body" pathLength="1" x="162" y="58" width="44" height="44" />
      <path className="i w08 sem-pins" d="M168 58v-6M168 102v6M162 64h-6M206 64h6M176 58v-6M176 102v6M162 72h-6M206 72h6M184 58v-6M184 102v6M162 80h-6M206 80h6M192 58v-6M192 102v6M162 88h-6M206 88h6M200 58v-6M200 102v6M162 96h-6M206 96h6" />
      <rect className="rf sem-die" x="78" y="68" width="12" height="12" />
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
      {/* 20 Oct (client review, Sunny: "what is this alignment"): four equal segments with equal gaps and equal margins inside
          the case, the bolt centred on the case, the terminal centred on its end */}
      {[0, 1, 2, 3].map(k => <rect key={k} className="rf seg" style={{ '--pd': `${.4 + k * .5}s` }} x={57 + k * 31} y="55" width="25" height="52" />)}
      <path className="wk pop" style={{ '--pd': '2.6s' }} d="M119.5 58 104.5 85h11l-4 19 16-28h-11l4-18z" />
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
  /* 20 Oct (client review, Sunny: "what chilled water 24 hours"): the label under the drawing is gone */
  'mkt-district-cooling': () => (
    <Sheet cls="mm-dch">
      {/* 20 Oct ("can you make it proper"): a district cooling network read the way it works: the plant (chillers and its
          cooling tower) and three buildings stand on one ground line; the chilled water supply main and the return run
          under the ground and rise into each building. Red is the supply, travelling the main. */}
      <path className="i o5" d="M6 136H234" />
      <rect className="i f" x="12" y="92" width="64" height="44" />
      <path className="i f" d="M22 92V80h20v12" />
      <circle className="i" cx="30" cy="114" r="8" /><circle className="i" cx="58" cy="114" r="8" />
      <path className="i w08 o5" d="M26 114h8M30 110v8M54 114h8M58 110v8" />
      {[[100, 84, 30, 52], [144, 58, 34, 78], [192, 76, 30, 60]].map(([x, y, w, h]) => <rect key={x} className="i f" x={x} y={y} width={w} height={h} />)}
      <path className="i w08 o5" d="M107 96h16M107 108h16M107 120h16M151 70h20M151 84h20M151 98h20M151 112h20M199 88h16M199 102h16M199 116h16" />
      <path className="i o5" d="M54 136V152H215M123 152V136M169 152V136M215 152V136" />
      <path className="i w22" d="M44 136V145H207M115 145V136M161 145V136M207 145V136" />
      <path className="r flow" d="M44 136V145H207" />
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
