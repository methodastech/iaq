import React, { useEffect, useId, useRef, useState } from 'react'
import '../styles/value-motion.css'

/* ============================================================================
   ValueMotion · one drawn scene per core value (Culture page), 15 Sep 2026.
   Bazil, on the flat marks: "either video or amazing top level animation icon,
   detail, premium, that loop each when seen". No footage of the values exists,
   so each value is a small technical drawing whose ONE movement says what the
   value means, with IAQ red doing that movement:
     V·01 Safety      a hard hat inside a manhours dial; the red count runs the full ring
     V·02 Quality     an inspection sheet; each row is ticked, then the ISO 9001 seal lands
     V·03 Integrity   a balance with a weight against a document; it swings, settles level
     V·04 Engineering a cleanroom section drawn by a cursor, then dimensioned
     V·05 Efficiency  a gauge; the needle overshoots and settles inside the target band
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

function Safety() {
  return (<>
    <path className="i o35" d={ticks(120, 80, 57, 62, 6, 0, 354)} />
    <path className="i" d={ticks(120, 80, 53, 62, 30, 0, 330)} />
    <g className="dy">
      <path className="r w3 arc" pathLength="1" d="M120 22a58 58 0 1 1 0 116a58 58 0 1 1 0-116" />
      <g className="head"><circle className="rf" cx="120" cy="22" r="3.4" /></g>
    </g>
    <path className="f" d="M86 96h68v6H86z" />
    <path className="i w18" d="M94 96a26 26 0 0 1 52 0M113 71v-5h14v5M107 96V74M133 96V74M86 96h68v6H86z" />
    <g className="dy"><g className="badge">
      <rect className="rf" x="150" y="108" width="22" height="22" />
      <path d="m155 119 4.5 4.5 8-9" fill="none" stroke="#fff" strokeWidth="2.2" />
    </g></g>
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

function Engineering() {
  return (<>
    {/* 25 Sep (the Codex art rules: "no box behind the mark"): the white drawing sheet is gone; the section sits on the dotted ground like the other five */}
    <g className="dy">
      <path className="i w18 ol" pathLength="1" d="M62 112V70l58-26 58 26v42" />
      <path className="i fl" pathLength="1" d="M50 112h140" />
      <path className="i ce" pathLength="1" d="M74 80h92" />
      <path className="i o5 ffu" d="M90 80v6M106 80v6M122 80v6M138 80v6M154 80v6" />
      <g className="tools">
        <rect className="f i" x="78" y="94" width="22" height="18" />
        <rect className="f i" x="136" y="90" width="28" height="22" />
      </g>
      <g className="dim"><path className="r" d="M62 124h116M62 120v8M178 120v8" /></g>
      <g className="cur"><path className="r w12" d="M-8 0h16M0-8v16" /><circle className="r w12" cx="0" cy="0" r="3.6" /></g>
    </g>
  </>)
}

function Efficiency() {
  const pt = (a, r) => [f2(120 + r * Math.sin(rad(a))), f2(112 - r * Math.cos(rad(a)))]
  const [ax, ay] = pt(-100, 62), [bx, by] = pt(100, 62), [zx, zy] = pt(40, 62), [wx, wy] = pt(72, 62)
  return (<>
    <path className="i" d={`M${ax} ${ay}A62 62 0 1 1 ${bx} ${by}`} />
    <path className="i" d={ticks(120, 112, 51, 62, 20, -100, 100)} />
    <path className="i o35" d={ticks(120, 112, 57, 62, 5, -100, 100)} />
    <path className="r w5 zone" d={`M${zx} ${zy}A62 62 0 0 1 ${wx} ${wy}`} />
    <rect className="f" x="86" y="140" width="68" height="5" />
    <rect className="rf bar" x="86" y="140" width="68" height="5" />
    <g className="needle"><path className="i w22" d="M120 112V60" /><path className="rf" d="m120 51 3.4 9h-6.8z" /></g>
    <circle className="inkf" cx="120" cy="112" r="7" />
    <circle cx="120" cy="112" r="2.4" fill="#fff" />
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

const SCENES = { 'V·01': Safety, 'V·02': Quality, 'V·03': Integrity, 'V·04': Engineering, 'V·05': Efficiency, 'V·06': Excellence }

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
    <span ref={ref} className={'vm vm-' + k.replace(/\D/g, '') + (live ? ' is-live' : '')} style={{ '--vmi': i }} aria-hidden="true">
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
