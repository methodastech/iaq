import React, { useEffect, useId, useRef, useState } from 'react'
import '../styles/value-motion.css'

/* ============================================================================
   ValueMotion · one drawn scene per core value (Culture page), 15 Sep 2026.
   Bazil, on the flat marks: "either video or amazing top level animation icon,
   detail, premium, that loop each when seen". No footage of the values exists,
   so each value is a small technical drawing whose ONE movement says what the
   value means, with IAQ red doing that movement:
     V·01 Safety      a shield draws in and the red check lands (20 Oct)
     V·02 Quality     an inspection sheet; each row is ticked, then the ISO 9001 seal lands
     V·03 Integrity   a balance with a weight against a document; it swings, settles level
     V·04 Engineering two meshing gears turning at their ratio; the red dimension line draws in (20 Oct)
     V·05 Efficiency  a stopwatch; the red sweep runs to the mark, the chevrons follow (20 Oct)
     V·06 Excellence  a podium builds, the trophy lands and fills
   Loops run only while the card is on screen (IntersectionObserver sets .is-live;
   without it no animation rule applies) and never under reduced motion, where the
   finished drawing is the still.
   ========================================================================== */

const rad = a => (a * Math.PI) / 180
const f2 = v => v.toFixed(2)
/* radial ticks, angles in degrees clockwise from twelve o'clock */
const ticks = (cx, cy, r1, r2, step, from, to) => {
  let d = ''
  for (let a = from; a <= to + 1e-6; a += step) {
    const s = Math.sin(rad(a)), c = Math.cos(rad(a))
    d += `M${f2(cx + r1 * s)} ${f2(cy - r1 * c)}L${f2(cx + r2 * s)} ${f2(cy - r2 * c)}`
  }
  return d
}
const star = (x, y, r) => {
  const s = r * 0.28
  return `M${x} ${y - r}L${x + s} ${y - s}L${x + r} ${y}L${x + s} ${y + s}L${x} ${y + r}L${x - s} ${y + s}L${x - r} ${y}L${x - s} ${y - s}Z`
}

/* 20 Oct (client, Sunny on the review: "the logo is ugly please propose alternative"; "make it more premium and
   relatable"): a protective shield round a hard hat, drawn in, then the small red tick lands */
function Safety() {
  /* 20 Oct ("Shield with a check, replace"): protection, plainly. A shield draws itself in, an inner line follows, and the red
     check lands inside it. The still is the finished shield with its check. */
  return (<>
    <path className="w i w2 shd" pathLength="1" d="M120 22l42 14v38c0 29-17 50-42 62c-25-12-42-33-42-62V36z" />
    <path className="i o35 shd2" pathLength="1" d="M120 32l33 11v31c0 23-13 40-33 50c-20-10-33-27-33-50V43z" />
    <path className="r w5 shck" pathLength="1" d="M101 80l13 13 26-28" />
  </>)
}
function Quality() {
  const rows = [54, 78, 102]
  return (<>
    <rect className="w i" x="78" y="24" width="84" height="112" />
    <rect className="f i" x="104" y="18" width="32" height="12" />
    {rows.map(y => (
      <g key={y}>
        <rect className="i" x="90" y={y - 7} width="14" height="14" />
        <path className="i" d={`M112 ${y - 3}h38`} />
        <path className="i o35" d={`M112 ${y + 4}h24`} />
      </g>
    ))}
    <g className="dy">
      {rows.map((y, i) => <path key={y} className={'r w22 tk tk' + i} pathLength="1" d={`M92.5 ${y}l3.8 3.8 6.8-7.6`} />)}
      <g className="stamp">
        <circle className="r w16 w" cx="160" cy="118" r="20" />
        <circle className="r w08 dash" cx="160" cy="118" r="15.5" />
        <text className="st" x="160" y="119.5">ISO</text>
        <text className="st2" x="160" y="127.5">9001</text>
      </g>
    </g>
  </>)
}

function Integrity() {
  return (<>
    <path className="f" d="M104 128h32v5h-32z" />
    <path className="i" d="M120 46v82M92 133h56M104 128h32v5h-32z" />
    <g className="beam"><path className="i w2" d="M66 46h108" /><path className="i" d="M66 42v8M174 42v8" /></g>
    <path className="rf" d="m120 37 5.5 8.5-5.5 8.5-5.5-8.5z" />
    <g className="panL">
      <path className="i" d="M66 46 48 88M66 46l18 42" />
      <path className="f i" d="M44 88h44a22 10 0 0 1-44 0z" />
      <rect className="rf" x="59" y="79" width="13" height="9" />
    </g>
    <g className="panR">
      <path className="i" d="m174 46-18 42M174 46l18 42" />
      <path className="f i" d="M152 88h44a22 10 0 0 1-44 0z" />
      <path className="w i" d="M167 73h12v15h-12z" />
      <path className="i o5" d="M170 78h6M170 82h6" />
    </g>
    <path className="r w22 level" d="M106 28h28" />
  </>)
}

/* 20 Oct (Sunny: "how is a house depict Engineering capabilities?"): the engineer's tools instead, a gear for the
   systems and a drafting compass whose pencil draws the red arc */
function Engineering() {
  /* 20 Oct ("make it more premium"): a precise mechanism. Two gears mesh and turn together at their true ratio (14 and 9 teeth,
     one clockwise, one back), each with its hub and bore; under them a red dimension line between the two centres draws in,
     the draughtsman's mark of an engineered fit. */
  const gear = (cx, cy, n, root, tip) => {
    const P = (r, d) => `${f2(cx + r * Math.sin(rad(d)))} ${f2(cy - r * Math.cos(rad(d)))}`
    const step = 360 / n
    return Array.from({ length: n }, (_, k) => {
      const a0 = k * step
      return `${k ? 'L' : 'M'}${P(root, a0 - step * .36)}L${P(tip, a0 - step * .18)}L${P(tip, a0 + step * .18)}L${P(root, a0 + step * .36)}`
    }).join('') + 'Z'
  }
  const A = [96, 84], B = [96 + 46 * Math.cos(rad(16)), 84 + 46 * Math.sin(rad(16))]
  return (<>
    <g className="g1">
      <path className="w i w16" d={gear(A[0], A[1], 14, 25, 30.5)} />
      <circle className="i o5" cx={A[0]} cy={A[1]} r="17" />
      <circle className="f i w16" cx={A[0]} cy={A[1]} r="7" />
      <path className="i o5" d={`M${A[0]} ${A[1] - 17}v6M${A[0]} ${A[1] + 11}v6M${A[0] - 17} ${A[1]}h6M${A[0] + 11} ${A[1]}h6`} />
    </g>
    <g className="g2">
      <path className="w i w16" d={gear(B[0], B[1], 9, 15.5, 21)} />
      <circle className="f i w16" cx={B[0]} cy={B[1]} r="5" />
    </g>
    <circle className="inkf" cx={A[0]} cy={A[1]} r="1.6" /><circle className="inkf" cx={B[0]} cy={B[1]} r="1.4" />
    <path className="i o35" d={`M${A[0]} ${A[1] + 33}V142M${f2(B[0])} ${f2(B[1] + 23)}V142`} />
    <path className="r w16 dimln" pathLength="1" d={`M${A[0]} 138H${f2(B[0])}`} />
    <path className="r w16 dimend" d={`M${A[0]} 134v8M${f2(B[0])} 134v8`} />
  </>)
}
function Efficiency() {
  /* 20 Oct ("make it proper time"): a real stopwatch face, sixty second marks with the five-second marks long, the crown
     on its stem and the pusher on the case at 45 degrees, the hand with its counterweight tail, ending where the red
     sweep ends */
  return (<>
    <path className="i w16" d="M116 48v-6M110 42h12v-6h-12zM145.7 60.3l4.2-4.2M147.5 52.4l5.6 5.6" />
    <circle className="w i w2" cx="116" cy="90" r="42" />
    <path className="i o35" d={ticks(116, 90, 37, 40, 6, 0, 354)} />
    <path className="i w16" d={ticks(116, 90, 33, 40, 30, 0, 330)} />
    <path className="r w5 sweep" pathLength="1" d="M116 62A28 28 0 0 1 140.25 104" />
    <g className="hand"><path className="i w2" d="M116 98V56" /></g>
    <circle className="inkf" cx="116" cy="90" r="4" />
    <circle cx="116" cy="90" r="1.4" fill="#fff" />
    {/* 20 Oct ("that arrow indicates what?"): the forward chevrons are gone; the stopwatch and its red sweep say fast-track */}
  </>)
}
function Excellence({ uid }) {
  const cup = 'M108 50h24v14a12 12 0 0 1-24 0z'
  return (<g className="sc">
    <path className="i" d="M50 136h140" />
    <rect className="f i b2" x="68" y="110" width="34" height="26" />
    <rect className="f i b3" x="138" y="118" width="34" height="18" />
    <rect className="f i b1" x="102" y="92" width="36" height="44" />
    <rect className="rf b1m" x="116" y="106" width="8" height="8" />
    <g className="tro">
      <defs><clipPath id={uid + 'c'}><path d={cup} /></clipPath></defs>
      <path className="w" d={cup} />
      <g clipPath={`url(#${uid}c)`}><rect className="rf cupfill" x="104" y="46" width="32" height="32" /></g>
      <path className="i w18" d={cup + 'M108 54h-6a7 7 0 0 0 7.5 9.5M132 54h6a7 7 0 0 1-7.5 9.5M120 76v8M111 84h18v8h-18z'} />
    </g>
    <path className="rf sp sp1" d={star(153, 40, 7)} />
    <path className="rf sp sp2" d={star(89, 46, 4.5)} />
    <path className="rf sp sp3" d={star(141, 24, 3.5)} />
  </g>)
}

/* 21 Oct (PCU & TTI, Why Clients Partner with IAQ: "make this icon animation more premium", "like this animation", the
   values above; then "make icon relatable"): the same drawn scenes for a unit page's reasons, each a picture anyone reads
   at a glance, one movement each in IAQ red */
const gearPath = (cx, cy, n, root, tip) => {
  const P = (r, d) => `${f2(cx + r * Math.sin(rad(d)))} ${f2(cy - r * Math.cos(rad(d)))}`
  const step = 360 / n
  return Array.from({ length: n }, (_, k) => {
    const a0 = k * step
    return `${k ? 'L' : 'M'}${P(root, a0 - step * .34)}L${P(tip, a0 - step * .17)}L${P(tip, a0 + step * .17)}L${P(root, a0 + step * .34)}`
  }).join('') + 'Z'
}
/* Integrated Delivery: two puzzle pieces, the utilities and the tool; the second slides in and locks, the red seam closes */
function Puzzle() {
  return (<>
    <path className="i o35" d="M44 124h152" />
    <path className="w i w2" d="M64 52H84a9 9 0 1 1 12 0H116V72a9 9 0 1 1 0 12V104H64Z" />
    <path className="i o5" d="M76 78h6M98 78h6M82 72l8 6-8 6zM98 72l-8 6 8 6z" />
    <g className="pz2">
      <path className="w i w2" d="M116 52H168V104H148a9 9 0 1 1-12 0H116V84a9 9 0 1 0 0-12Z" />
      <rect className="i o5" x="134" y="64" width="20" height="26" />
      <path className="i o5" d="M139 70h10M139 76h10" />
    </g>
    <path className="r w22 seam" pathLength="1" d="M116 52V72a9 9 0 1 1 0 12V104" />
  </>)
}
/* Semiconductor Focus: a silicon wafer of dies; a magnifier passes over it and settles, and the die under it lights */
function Wafer() {
  const cx = 110, cy = 82, R = 48, D = 12, dies = []
  for (let x = -4; x < 4; x++) for (let y = -4; y < 4; y++) {
    const far = Math.max(...[[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]].map(([a, b]) => Math.hypot(a * D, b * D)))
    if (far < R - 4) dies.push(`M${cx + x * D + 1.5} ${cy + y * D + 1.5}h${D - 3}v${D - 3}h-${D - 3}z`)
  }
  return (<>
    <path className="w i w2" d={`M${cx - 15} ${cy + R - 2.4}A${R} ${R} 0 1 1 ${cx + 15} ${cy + R - 2.4}Z`} />
    <path className="i o35" d={dies.join('')} />
    <rect className="rf hit" x={cx + 13.5} y={cy - 22.5} width={D - 3} height={D - 3} />
    <g className="lens">
      <circle className="i w2" cx={cx + 18} cy={cy - 18} r="17" fill="rgba(255,255,255,.35)" />
      <circle className="i o35" cx={cx + 18} cy={cy - 18} r="13" />
      <path className="i w5" d={`M${cx + 30} ${cy - 6}l16 16`} />
    </g>
  </>)
}
/* Technical Excellence: a project schedule, phase by phase; each bar fills in red in its turn and the plan is signed off */
function Plan() {
  const bars = [[64, 60, 44], [92, 78, 50], [120, 96, 44], [146, 114, 32]]
  return (<>
    <rect className="w i w2" x="52" y="30" width="136" height="100" />
    <path className="i" d="M52 46h136" />
    <path className="i o35 dash" d="M86 46v84M120 46v84M154 46v84" />
    <path className="i o5" d="M60 38h14M94 38h14M128 38h14M162 38h14" />
    {bars.map(([x, y, w], k) => (
      <g key={k}>
        <rect className="i" x={x} y={y} width={w} height="9" />
        <rect className={'rf gb gb' + k} x={x} y={y} width={w} height="9" />
      </g>
    ))}
    <circle className="w r w16 ok" cx="188" cy="130" r="10" />
    <path className="r w2 okt" pathLength="1" d="M183 130l3.6 3.6 6.8-7.2" />
  </>)
}
/* Manufacturing Readiness: the finished facility and the factory, a gap between; the red bridge spans it, the first load
   crosses, and the factory's gear starts to turn */
function Bridge() {
  return (<>
    <path className="i" d="M24 120h58M158 120h58" />
    <path className="i o35" d="M96 130h48M104 136h32" />
    <rect className="w i w2" x="34" y="58" width="48" height="62" />
    <path className="i o5" d="M42 68h8v8h-8zM58 68h8v8h-8zM42 84h8v8h-8zM58 84h8v8h-8zM50 104h12v16H50z" />
    <path className="w i w2" d="M158 120V84l13-12v12l13-12v12l13-12v12l13-12v48z" />
    <g className="gr"><path className="w i w16" d={gearPath(186, 102, 8, 7, 10)} /><circle className="i" cx="186" cy="102" r="2.6" /></g>
    <path className="i o5 arch" pathLength="1" d="M84 120C98 100 144 100 156 120" />
    <path className="r w3 deck" pathLength="1" d="M82 96H158" />
    <rect className="rf load" x="84" y="86" width="9" height="9" />
  </>)
}

/* 21 Oct (Corporate Commitment, IAQ sheet: "Avoid duplicating the globe graphic"; "bro use different design"): the three
   ESG pillars as drawn scenes in place of the office globe, no target or result shown in any of them */
/* Environmental responsibility: a sprout grows from the ground, its leaves open, the red sun rises behind it */
function EsgE() {
  return (<>
    <path className="i o35" d="M40 126h160" />
    <path className="i o35" d="M52 126c18-14 40-14 58 0M134 126c16-11 36-11 52 0" />
    <g className="sun"><circle className="rf" cx="166" cy="46" r="9" /><path className="r w16" d={ticks(166, 46, 13, 18, 45, 0, 315)} /></g>
    <path className="i w2 stem" pathLength="1" d="M120 126V70" />
    <path className="w i w16 lf1" d="M120 100c-6-14-20-20-34-18c2 14 18 23 34 18z" />
    <path className="i o5 lf1" d="M120 100 94 86" />
    <path className="w i w16 lf2" d="M120 84c6-14 20-20 34-18c-2 14-18 23-34 18z" />
    <path className="i o5 lf2" d="M120 84l26-14" />
  </>)
}
/* Social accountability: the people arrive one by one, a red shelter draws over them and the heart above it beats */
function EsgS() {
  return (<>
    <path className="i o35" d="M52 122h136" />
    <g className="p1"><circle className="w i w16" cx="86" cy="88" r="7.5" /><path className="w i w16" d="M70 122c0-12 7-20 16-20s16 8 16 20" /></g>
    <g className="p3"><circle className="w i w16" cx="154" cy="88" r="7.5" /><path className="w i w16" d="M138 122c0-12 7-20 16-20s16 8 16 20" /></g>
    <g className="p2"><circle className="w i w16" cx="120" cy="79" r="9" /><path className="w i w16" d="M100 122c0-15 9-24 20-24s20 9 20 24" /></g>
    <path className="r w2 roof" pathLength="1" d="M60 110C60 38 180 38 180 110" />
    <path className="rf heart" d="M120 52c-6-4-9-7-9-10.5a4.5 4.5 0 0 1 9-1.5a4.5 4.5 0 0 1 9 1.5c0 3.5-3 6.5-9 10.5z" />
  </>)
}
/* Corporate governance: a written policy; its lines set out, the pen signs it in red */
function EsgG() {
  return (<>
    <path className="f" d="M88 32h76v110H88z" />
    <path className="w i w2" d="M82 26h62l14 14v96H82z" />
    <path className="i" d="M144 26v14h14" />
    <path className="i w2" d="M94 42h32" />
    <path className="i o5 doc" d="M94 56h52M94 66h52M94 76h44M94 86h52M94 96h36" />
    <path className="i o35" d="M92 120h56" />
    <path className="r w16 sig" pathLength="1" d="M96 116c3-9 7-11 8-4s2 7 6-1 6-7 7 0 3 6 7-1 5-6 7 0c1 4 3 5 6 1 3-4 6-4 9-1" />
    <g className="pen"><path className="w i w16" d="M96 116l3-9 30-30 6 6-30 30z" /><path className="i" d="M126 80l6 6" /></g>
  </>)
}

const SCENES = { 'V·01': Safety, 'V·02': Quality, 'V·03': Integrity, 'V·04': Engineering, 'V·05': Efficiency, 'V·06': Excellence }
/* 21 Oct: the unit pages' reasons (UnitPage `why[].scene`) */
Object.assign(SCENES, { puzzle: Puzzle, wafer: Wafer, plan: Plan, bridge: Bridge })
Object.assign(SCENES, { esgE: EsgE, esgS: EsgS, esgG: EsgG })   /* 21 Oct: Corporate Commitment */

export default function ValueMotion({ k, i = 0 }) {
  const ref = useRef(null)
  const [live, setLive] = useState(false)
  const uid = 'vm' + useId().replace(/[^a-zA-Z0-9]/g, '')
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const Scene = SCENES[k]
  if (!Scene) return null
  return (
    <span ref={ref} className={'vm vm-' + (/\d/.test(k) ? k.replace(/\D/g, '') : k) + (live ? ' is-live' : '')} style={{ '--vmi': i }} aria-hidden="true">
      <svg viewBox="0 0 240 160" preserveAspectRatio="xMidYMid meet" focusable="false">
        <defs>
          <pattern id={uid + 'g'} width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r=".8" /></pattern>
        </defs>
        <rect className="vm-grid" x="0" y="0" width="240" height="160" fill={`url(#${uid}g)`} />
        <Scene uid={uid} />
      </svg>
    </span>
  )
}
