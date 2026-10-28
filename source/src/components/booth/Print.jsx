import React from 'react'
import { Svg, Qr, MarkFlat, UnitIc, PROCESS } from './Art.jsx'
import { MarkB, H, T, Txt, Line, Iso, FS } from './ArtB.jsx'
import { Build, IsoC } from './ArtC.jsx'
import { Rn, Obj, HERO, LabRender } from './ArtF.jsx'

/* ============================================================================
   The exhibition print, 30 Sep 2026 (Bazil: "2 design A5 variant", "and 2 more trifold variant", "for the exhibition
   print"). Two A5 leaflets and two A4 trifolds, mm-true like every booth piece, on the Design tab's structure
   (tools/design-apps/applications.html #ap-a5 and #ap-trifold): cleanroom construction first, the three units and what each
   does for a cleanroom, the six services in order as a loop, the figures, the booth and the contacts, the code.
     Leaflet, design 1   Direction C: white, the cleanroom being built drawn large with its layers named, one red part
     Leaflet, design 2   C2's red front: field red, the white IAQ big across the top, the drawing on a white block; back white
     Trifold, design 1   Direction C: white, drawn throughout
     Trifold, design 2   red and drawn: the field red cover and flap (the white IAQ, the statement and the figures in white,
                         the drawings on white blocks), white inside with the Design tab's exploded fab
     Leaflet and trifold, design 3   "3D cleanroom" (Bazil: "make a 3D experience trifold design as well"): Direction F's white
                         look, built on the photoreal renders (public/booth/f3d/iaq), every layer named, the six services as the
                         site's photoreal objects
   The trifold is an A4 roll fold, 297 × 210 flat: outside the inside flap 97, the back 100, the cover 100; inside the left
   100, the centre 100, the right 97 (the flap, 3 mm narrower so it folds in). No fold is drawn on the art: the folds show
   in the zones overlay only. The IAQ sits at the top of each outside panel (big on the cover); the inside spread opens
   under the cover, with its three heads on one line, as the Design tab's trifold does.
   Personal contact details are one quiet label: "Contact details to follow from IAQ".
   ============================================================================ */

export const P = { white: '#FFFFFF', light: '#F4F6F9', ink: '#231F20', tx2: '#5A5F6B', red: '#EC2027', field: '#C8161D' }
const LINE = 0.5

/* ---------------------------------------------------------------- content */
const UNITS_P = [
  { k: 'EPC', full: 'Engineering, procurement and construction', t: 'One contract for the cleanroom and the facility around it, from the first drawing to handover.', short: 'One contract for the cleanroom and its facility, first drawing to handover.' },
  { k: 'PCU & TTI', full: 'Process critical utilities and total tool installation', t: 'Builds the gas, chemical, water and exhaust systems, and connects each tool to them inside a running fab.', short: 'The gas, chemical, water and exhaust systems, and each tool connected to them.' },
  { k: 'EFM', full: 'Energy facility management', t: 'Runs and maintains the chiller plant and HVAC that hold the cleanroom in spec, and cuts their energy use.', short: 'The chiller plant and HVAC that hold the cleanroom in spec, run and maintained.' },
]
const SVC_LINE = {
  design: 'Concept to detailed design, feasibility, permitting, BIM.',
  procure: 'Sourcing, tenders and long lead equipment, tracked in one system.',
  construct: 'Site management, safety, quality, programme and cost.',
  commission: 'Proven to operate as intended, before handover.',
  maintain: 'Planned care that protects lifespan and uptime.',
  hookup: 'Production tools connected into the facility and released to production.',
}
const FIGS = [['1995', 'Founded in Malaysia'], ['1,050,000 m²', 'Cleanroom built up'], ['7', 'Countries, global offices'], ['450', 'Employees group wide']]
const HQ = 'IAQ Technology International Sdn. Bhd., No. 12, Jalan Sungai Jeluh 32/192, Kawasan Perindustrian Kemuning, Seksyen 32, 40460 Shah Alam, Selangor, Malaysia'
const REG = 'ISO 9001, 14001, 45001, CIDB G7'
const LEGAL = 'IAQ Technology International Sdn. Bhd. 200001031412 (534019‑T)'
const MARKETS = 'Semiconductor, Data Centre, EV Battery, Photovoltaics, District Cooling & Heating, Bio LifeScience and Food & Beverage'

/* ---------------------------------------------------------------- parts */
const chev = (x, y, dir, lw, c = P.red) => {
  const a = 1.3, b = 1
  const d = dir === 'down' ? `M${x - a} ${y - b / 2}L${x} ${y + b / 2}L${x + a} ${y - b / 2}` : dir === 'up' ? `M${x - a} ${y + b / 2}L${x} ${y - b / 2}L${x + a} ${y + b / 2}`
    : dir === 'right' ? `M${x - b / 2} ${y - a}L${x + b / 2} ${y}L${x - b / 2} ${y + a}` : `M${x + b / 2} ${y - a}L${x - b / 2} ${y}L${x + b / 2} ${y + a}`
  return <path d={d} fill="none" stroke={c} strokeWidth={lw} strokeLinejoin="miter" />
}
/* the six services in a row, as a loop: the objects, their names, one red line under them left to right with a chevron
   between each pair, and the return running back under it to the start. No numbers */
function LoopRow({ x, y, w, os = 15, size = 2.5, lw = 0.35, photo }) {
  const cw = w / 6, yl = y + os + 10.5, yr = yl + 3.2
  const cx = i => x + cw * (i + 0.5)
  return (
    <g>
      {PROCESS.map(([k, name], i) => (
        <g key={k}>
          {photo ? <Obj k={k} x={cx(i) - (cw - 0.6) / 2} y={y + os / 2 - (cw - 0.6) / 4} w={cw - 0.6} /> : <IsoC k={'s-' + k} x={cx(i) - os / 2} y={y} w={os} isw={1.6} />}
          {name.split('|').map((l, j) => <text key={l} x={cx(i)} y={y + os + 2.6 + j * size * 1.18} textAnchor="middle" fontFamily={FS} fontWeight="600" fontSize={size} fill={P.ink}>{l}</text>)}
        </g>
      ))}
      <path d={`M${cx(0)} ${yl}H${cx(5)}V${yr}H${cx(0)}V${yl}`} fill="none" stroke={P.red} strokeWidth={lw} strokeLinejoin="miter" />
      {[0, 1, 2, 3, 4].map(i => <g key={i}>{chev((cx(i) + cx(i + 1)) / 2, yl, 'right', lw)}</g>)}
      {chev((cx(2) + cx(3)) / 2, yr, 'left', lw)}
    </g>
  )
}
/* the six services down a panel, as a loop: the object, its name and one line; one red line down the objects' axis with a
   chevron between each pair; after Tools hookup it turns and runs back up the panel's right edge into Design */
function LoopCol({ x, y, h, w, os = 13, photo, size = 3, sub = 2.4, lw = 0.35 }) {
  const n = PROCESS.length, pitch = h / n, ax = x + os / 2, tx = x + os + 4, rx = x + w - 0.5
  const oh = photo ? os / 2 : os, ob = photo ? 1 + os * 0.75 + 0.8 : os + 1   /* the object's foot, where the line leaves it */
  const items = PROCESS.map(([k, name], i) => ({ k, name: name.replace('|', ' '), y: y + i * pitch }))
  return (
    <g>
      {items.map((it, i) => (
        <g key={it.k}>
          {photo ? <Obj k={it.k} x={x - os * 0.25} y={it.y + 1} w={os * 1.5} /> : <IsoC k={'s-' + it.k} x={x} y={it.y} w={os} isw={1.6} />}
          <text x={tx} y={it.y + 3.6} fontFamily={FS} fontWeight="600" fontSize={size} fill={P.ink}>{it.name}</text>
          <Txt x={tx} y={it.y + 5} w={rx - tx - 3} h={9} size={sub} lh={1.28} color={P.tx2}>{SVC_LINE[it.k]}</Txt>
          {i === 3 && <text x={tx} y={it.y + pitch - 1.6} fontFamily={FS} fontWeight="500" fontSize={sub} fill={P.red}>Then, as the cycle continues</text>}
          {i < n - 1 && <><rect x={ax - lw / 2} y={it.y + ob} width={lw} height={pitch - ob - 1} fill={P.red} />{chev(ax, it.y + ob + (pitch - ob - 1) / 2, 'down', lw)}</>}
        </g>
      ))}
      {/* the loop back: down from Tools hookup, across the foot, up the right edge, over the top and down into Design */}
      <path d={`M${ax} ${items[n - 1].y + ob}V${y + h - 1.5}H${rx}V${y - 3.2}H${ax}V${y - 0.6}`} fill="none" stroke={P.red} strokeWidth={lw} strokeLinejoin="miter" />
      {chev(rx, (y + h) / 2 + y / 2, 'up', lw)}
      {chev((ax + rx) / 2, y - 3.2, 'left', lw)}
    </g>
  )
}
/* the three units: the unit's own line icon (ink, one red part), its name, what it does for a cleanroom */
function UnitsCols({ x, y, w, short = true, ic = 9 }) {
  const cw = w / 3
  return UNITS_P.map((u, i) => (
    <g key={u.k}>
      <UnitIc k={u.k} x={x + i * cw - 0.6} y={y} s={ic} />
      <H x={x + i * cw} y={y + ic + 4.6} size={4} fill={P.ink}>{u.k}</H>
      <Txt x={x + i * cw} y={y + ic + 6} w={cw - 3.5} h={16} size={2.5} lh={1.3} color={P.tx2}>{short ? u.short : u.t}</Txt>
    </g>
  ))
}
function UnitsRows({ x, y, w, pitch = 38 }) {
  return UNITS_P.map((u, i) => (
    <g key={u.k}>
      <UnitIc k={u.k} x={x - 0.8} y={y + i * pitch} s={12} />
      <H x={x + 16} y={y + i * pitch + 4.2} size={4.2} fill={P.ink}>{u.k}</H>
      <Txt x={x + 16} y={y + i * pitch + 5.4} w={w - 16} h={6} size={2.4} lh={1.25} color={P.tx2} weight={500} font={FS}>{u.full}</Txt>
      <Txt x={x + 16} y={y + i * pitch + 12} w={w - 16} h={16} size={2.6} lh={1.34} color={P.ink}>{u.t}</Txt>
    </g>
  ))
}
function Figs({ x, y, w, cols = 4, color = P.ink, sub = P.tx2, size = 4.6, pitchY = 16 }) {
  const cw = w / cols
  return FIGS.map(([n, l], i) => (
    <g key={n}>
      <H x={x + (i % cols) * cw} y={y + Math.floor(i / cols) * pitchY} size={size} fill={color}>{n}</H>
      <T x={x + (i % cols) * cw} y={y + Math.floor(i / cols) * pitchY + size * 0.95} size={2.4} fill={sub}>{l}</T>
    </g>
  ))
}
/* fold marks and panel names, in the zones overlay only */
function Folds({ at, h = 210, names }) {
  return (
    <g pointerEvents="none">
      {at.map(x => <line key={x} x1={x} y1={-3} x2={x} y2={h + 3} stroke="rgba(37,99,235,.7)" strokeWidth=".35" strokeDasharray="2 1.4" />)}
      {names.map(([x, t]) => <text key={t} x={x + 2} y={h - 3} fontFamily={FS} fontWeight="700" fontSize="3" fill="#1D4ED8">{t}</text>)}
    </g>
  )
}
/* the contacts block of a back: headquarters, Dresden, your contact */
function Contacts({ x, y, w, size = 2.4 }) {
  return (
    <g>
      <H x={x} y={y} size={3} fill={P.ink}>Headquarters, Shah Alam</H>
      <Txt x={x} y={y + 1.4} w={w} h={18} size={size} lh={1.36} color={P.tx2}>{HQ}<br />+603 5124 8319<br />business@iaqtechnology.com.my</Txt>
      <H x={x} y={y + 25} size={3} fill={P.ink}>Germany, Dresden</H>
      <Txt x={x} y={y + 26.4} w={w} h={12} size={size} lh={1.36} color={P.tx2}>IAQ Engineering (DE) GmbH, 8. OG, Budapester Straße 5, 01069 Dresden, Germany<br />+49 351 4387 9529</Txt>
      <H x={x} y={y + 42} size={3} fill={P.ink}>Your contact</H>
      <Txt x={x} y={y + 43.4} w={w} h={6} size={size} lh={1.36} color={P.tx2}>Contact details to follow from IAQ</Txt>
    </g>
  )
}

/* ================================================================ A5 leaflets, 148 × 210 */

const A5 = { w: 148, h: 210, m: 12 }
/* the A5 back, both designs: the head and the line, the six services as a loop, the three units, the figures (on a light
   band, or white on field red for design 2), contacts and the code, the legal line */
function A5Back({ d2, d3, bleed }) {
  const { w, h, m } = A5
  return (
    <Svg w={w} h={h} label={`Leaflet, design ${d3 ? 3 : d2 ? 2 : 1}, back`} bleed={bleed} bleedFill={P.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={P.white} />
      <MarkB x={m} y={10} w={18} tone="light" />
      <H x={m} y={27} size={5} fill={P.ink}>Designed, built and maintained <tspan fill={P.red}>by one team.</tspan></H>
      <Line x={m} y={30} w={w - 2 * m} t={LINE * 0.8} fill={P.red} />
      <T x={m} y={37} size={2.6} weight={600} font={FS} fill={P.red}>How the work runs</T>
      <LoopRow x={m} y={40} w={w - 2 * m} photo={d3} />
      <T x={m} y={74} size={2.5} fill={P.tx2}>Design to handover, then maintenance and tools hookup as the cycle continues.</T>
      <T x={m} y={82} size={2.6} weight={600} font={FS} fill={P.red}>Three business units</T>
      <UnitsCols x={m} y={85} w={w - 2 * m} />
      <rect x="-10" y="118" width={w + 20} height="21" fill={d2 ? P.field : P.light} />
      <Figs x={m} y={128} w={w - 2 * m} color={d2 ? P.white : P.ink} sub={d2 ? P.white : P.tx2} />
      <Contacts x={m} y={148} w={60} size={2.4} />
      <H x={78} y={148} size={3} fill={P.ink}>At the show</H>
      <Txt x={78} y={149.4} w={30} h={16} size={2.4} lh={1.36} color={P.tx2}>SEMICON Europa 2026, Messe München, 10 to 13 November, stand to confirm</Txt>
      <Qr x={110} y={146} s={24} />
      <T x={110} y={177} size={2.5} weight={600} font={FS} fill={P.ink}>Book a meeting</T>
      <T x={m} y={200} size={2.3} fill={P.tx2}>{LEGAL}</T>
      <T x={w - m} y={200} size={2.3} fill={P.tx2} anchor="end">{REG}</T>
    </Svg>
  )
}
/* design 1, front: white, the IAQ top left, the statement, the cleanroom being built with its layers named, the show,
   the one red line above the foot */
export function A5Front1({ bleed }) {
  const { w, h, m } = A5
  return (
    <Svg w={w} h={h} label="Leaflet, design 1, front" bleed={bleed} bleedFill={P.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={P.white} />
      <MarkB x={m} y={m} w={52} tone="light" />
      <H x={m} y={50} size={7.2} fill={P.ink}>Cleanrooms and the systems</H>
      <H x={m} y={59} size={7.2} fill={P.red}>that hold them in spec.</H>
      <Build x={9} y={67} h={108} lx={90} size={3.3} lw={0.2} gap={2.2} isw={2.4} />
      <H x={m} y={183} size={4.4} fill={P.ink}>Meet IAQ at SEMICON Europa 2026</H>
      <T x={m} y={188.5} size={3} fill={P.tx2}>Messe München, 10 to 13 November, stand to confirm</T>
      <Line x={m} y={192.5} w={w - 2 * m} t={LINE} fill={P.red} />
      <T x={m} y={199.5} size={3} weight={500} font={FS} fill={P.ink}>iaqtechnology.com.my</T>
      <T x={w - m} y={199.5} size={3} weight={500} font={FS} fill={P.ink} anchor="end">business@iaqtechnology.com.my</T>
    </Svg>
  )
}
export const A5Back1 = p => <A5Back {...p} />
/* design 2, front: C2's red front. Field red, the white IAQ big across the top, the statement in white, the drawing on a
   white block, the show, the white line above the foot */
export function A5Front2({ bleed }) {
  const { w, h, m } = A5
  return (
    <Svg w={w} h={h} label="Leaflet, design 2, front" bleed={bleed} bleedFill={P.field}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={P.field} />
      <MarkFlat x={m} y={m} w={w - 2 * m} />
      <H x={m} y={79} size={7.2} fill={P.white}>Cleanrooms and the systems</H>
      <H x={m} y={88} size={7.2} fill={P.white}>that hold them in spec.</H>
      {/* 30 Sep, evening: no white block; the complete cleanroom as a white line drawing straight on the red */}
      <Build x={m - 2} y={95} h={82} lx={80} size={3.2} lw={0.22} gap={1.8} isw={2.6} onRed />
      <H x={m} y={184} size={4.4} fill={P.white}>Meet IAQ at SEMICON Europa 2026</H>
      <T x={m} y={189.5} size={3} fill={P.white}>Messe München, 10 to 13 November, stand to confirm</T>
      <Line x={m} y={193} w={w - 2 * m} t={LINE} />
      <T x={m} y={200} size={3} weight={500} font={FS} fill={P.white}>iaqtechnology.com.my</T>
      <T x={w - m} y={200} size={3} weight={500} font={FS} fill={P.white} anchor="end">business@iaqtechnology.com.my</T>
    </Svg>
  )
}
export const A5Back2 = p => <A5Back d2 {...p} />
/* design 3, front, "3D cleanroom": white, the IAQ top left, the statement, the fab exploded (render) with its four layers
   named, the show, the one red line above the foot */
export function A5Front3({ bleed, print }) {
  const { w, h, m } = A5
  return (
    <Svg w={w} h={h} label="Leaflet, design 3, front" bleed={bleed} bleedFill={P.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={P.white} />
      <MarkB x={m} y={m} w={52} tone="light" />
      <H x={m} y={50} size={7.2} fill={P.ink}>Cleanrooms and the systems</H>
      <H x={m} y={59} size={7.2} fill={P.red}>that hold them in spec.</H>
      <LabRender n="hero-exploded" parts={HERO} left={m} y={66} h={108} lx={104} size={3.3} sub={2.3} subW={32} lw={0.2} gap={2} print={print} />
      <H x={m} y={183} size={4.4} fill={P.ink}>Meet IAQ at SEMICON Europa 2026</H>
      <T x={m} y={188.5} size={3} fill={P.tx2}>Messe München, 10 to 13 November, stand to confirm</T>
      <Line x={m} y={192.5} w={w - 2 * m} t={LINE} fill={P.red} />
      <T x={m} y={199.5} size={3} weight={500} font={FS} fill={P.ink}>iaqtechnology.com.my</T>
      <T x={w - m} y={199.5} size={3} weight={500} font={FS} fill={P.ink} anchor="end">business@iaqtechnology.com.my</T>
    </Svg>
  )
}
export const A5Back3 = p => <A5Back d3 {...p} />

/* ================================================================ A4 trifolds, 297 × 210 flat, roll fold */

const TRI = { w: 297, h: 210, m: 9, out: [0, 97, 197], inn: [0, 100, 200] }
/* the back panel (outside, middle), both designs */
function TriBack({ x0 }) {
  const m = TRI.m, x = x0 + m, w = 100 - 2 * m
  return (
    <g>
      <MarkB x={x} y={m} w={20} tone="light" />
      <H x={x} y={28} size={4.4} fill={P.ink}>Tell us what you are building</H>
      <Txt x={x} y={30} w={w} h={9} size={2.8} lh={1.36} color={P.tx2}>Send the brief and the right engineer replies within one working day.</Txt>
      <H x={x} y={47} size={3.2} fill={P.ink}>Meet IAQ at SEMICON Europa 2026</H>
      <T x={x} y={51.5} size={2.6} fill={P.tx2}>Messe München, 10 to 13 November, stand to confirm</T>
      <Contacts x={x} y={63} w={w} size={2.5} />
      <Qr x={x} y={128} s={24} />
      <Txt x={x + 30} y={128} w={w - 30} h={14} size={2.6} lh={1.36} color={P.ink} weight={600} font={FS}>Scan for the 3D story, the services and the projects, or book a meeting.</Txt>
      <T x={x} y={195.5} size={2.3} fill={P.tx2}>{REG}</T>
      <T x={x} y={200.5} size={2.3} fill={P.tx2}>{LEGAL}</T>
    </g>
  )
}
/* the inside heads: a red label and one line of head, the same on all three panels, the one red line under them */
function TriHeads({ heads }) {
  return (
    <g>
      {heads.map(([x, l, h]) => (
        <g key={l}>
          <T x={x} y={14} size={2.8} weight={600} font={FS} fill={P.red}>{l}</T>
          <H x={x} y={21.5} size={4.9} fill={P.ink}>{h}</H>
        </g>
      ))}
      <Line x={TRI.m} y={25} w={TRI.w - 2 * TRI.m} t={LINE} fill={P.red} />
    </g>
  )
}
const SYS = [
  ['CSA', 'The building itself: piling and foundations, frame and roof, the cleanroom envelope and its finishes.'],
  ['MEP', 'What makes it run: HVAC, ACMV and fan filter units, process cooling water, fire protection and power.'],
  ['Process', 'What the tool runs on: clean dry air, specialty gases, ultrapure water, process vacuum and exhaust.'],
]
function TriLeft() {
  const x = TRI.m, w = 100 - 2 * TRI.m
  return (
    <g>
      <Txt x={x} y={29} w={w} h={14} size={2.7} lh={1.36} color={P.tx2}>IAQ is a Malaysian total facility solutions provider. For 31 years it has designed, built and maintained high technology facilities through three business units.</Txt>
      <UnitsRows x={x} y={48} w={w} />
      <H x={x} y={168} size={3} fill={P.ink}>Seven markets</H>
      <Txt x={x} y={169.5} w={w} h={12} size={2.5} lh={1.36} color={P.tx2}>{MARKETS}</Txt>
    </g>
  )
}
function TriSystems({ x, y, w }) {
  return SYS.map(([k, t], i) => (
    <g key={k}>
      <H x={x} y={y + i * 15} size={3} fill={P.ink}>{k}</H>
      <Txt x={x} y={y + i * 15 + 1.4} w={w} h={10} size={2.4} lh={1.34} color={P.tx2}>{t}</Txt>
    </g>
  ))
}

/* design 1, outside: the flap (the figures, the finished cleanroom), the back, the cover (the IAQ big, the statement, the
   cleanroom being built, the one red line) */
export function Tri1Out({ bleed, zones }) {
  const { w, h, m } = TRI
  return (
    <Svg w={w} h={h} label="Trifold, design 1, outside" bleed={bleed} bleedFill={P.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={P.white} />
      <MarkB x={m} y={m} w={20} tone="light" />
      <H x={m} y={28} size={4.8} fill={P.ink}>Designed, built and</H>
      <H x={m} y={34} size={4.8} fill={P.ink}>maintained by one team</H>
      <H x={m} y={40} size={4.8} fill={P.red}>for 31 years.</H>
      <Figs x={m} y={56} w={80} cols={2} pitchY={18} size={5.6} />
      <Iso k="cleanroom" x={m - 2} y={98} w={82} isw={2.6} />
      <TriBack x0={97} />
      <MarkB x={197 + m} y={m} w={82} tone="light" />
      <H x={197 + m} y={59} size={6.7} fill={P.ink}>Cleanrooms and</H>
      <H x={197 + m} y={66.5} size={6.7} fill={P.ink}>the systems that</H>
      <H x={197 + m} y={74} size={6.7} fill={P.red}>hold them in spec.</H>
      <IsoC k="build" x={197 + 18} y={82} h={96} isw={2.2} />
      <Line x={197 + m} y={184} w={82} t={LINE} fill={P.red} />
      <T x={197 + m} y={201} size={3} weight={500} font={FS} fill={P.ink}>iaqtechnology.com.my</T>
      {zones && <Folds at={[97, 197]} names={[[0, 'Inside flap, 97'], [97, 'Back, 100'], [197, 'Front cover, 100']]} />}
    </Svg>
  )
}
/* design 1, inside: the three units, the cleanroom layer by layer with its layers named, the six services as a loop */
export function Tri1In({ bleed, zones }) {
  const { w, h } = TRI
  return (
    <Svg w={w} h={h} label="Trifold, design 1, inside" bleed={bleed} bleedFill={P.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={P.white} />
      <TriHeads heads={[[9, 'Three business units', 'Three units, one facility'], [109, 'Cleanroom construction', 'A cleanroom, layer by layer'], [209, 'How the work runs', 'Six services, one cycle']]} />
      <TriLeft />
      <Txt x={109} y={29} w={82} h={14} size={2.7} lh={1.36} color={P.tx2}>Walls, ceiling grid, raised floor and the fan filter units above them, delivered by one team as a single accountable envelope.</Txt>
      <Build x={104} y={45} h={74} lx={164} size={2.5} lw={0.18} gap={1.6} isw={2.2} />
      <TriSystems x={109} y={144} w={82} />
      <Txt x={209} y={29} w={79} h={14} size={2.7} lh={1.36} color={P.tx2}>Design, procurement, construction, commissioning, maintenance and tools hookup, run as one cycle by one team.</Txt>
      <LoopCol x={209} y={46} h={150} w={79} />
      {zones && <Folds at={[100, 200]} names={[[0, 'Inside left, 100'], [100, 'Inside centre, 100'], [200, 'Inside right, the flap, 97']]} />}
    </Svg>
  )
}
/* design 2, outside, red and drawn: the flap field red (the white IAQ, the line, the figures in white, the finished cleanroom
   on a white block), the back, the cover field red (the white IAQ big across the top, the statement in white, the cleanroom
   in its layers on a white block, the white line) */
export function Tri2Out({ bleed, zones }) {
  const { w, h, m } = TRI
  return (
    <Svg w={w} h={h} label="Trifold, design 2, outside" bleed={bleed} bleedFill={P.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={P.white} />
      <rect x="-10" y="-10" width={107} height={h + 20} fill={P.field} />
      <rect x="197" y="-10" width={110} height={h + 20} fill={P.field} />
      <MarkFlat x={m} y={m} w={20} />
      <H x={m} y={28} size={4.8} fill={P.white}>Designed, built and</H>
      <H x={m} y={34} size={4.8} fill={P.white}>maintained by one team</H>
      <H x={m} y={40} size={4.8} fill={P.white}>for 31 years.</H>
      <Figs x={m} y={56} w={80} cols={2} pitchY={18} size={5.6} color={P.white} sub={P.white} />
      <IsoC k="cleanroom-w" x={m - 3} y={100} w={86} isw={2.8} />
      <TriBack x0={97} />
      <MarkFlat x={197 + m} y={m} w={82} />
      <H x={197 + m} y={59} size={6.7} fill={P.white}>Cleanrooms and</H>
      <H x={197 + m} y={66.5} size={6.7} fill={P.white}>the systems that</H>
      <H x={197 + m} y={74} size={6.7} fill={P.white}>hold them in spec.</H>
      <IsoC k="build-w" x={197 + m + 4} y={80} h={100} isw={2.4} />
      <Line x={197 + m} y={184} w={82} t={LINE} />
      <T x={197 + m} y={201} size={3} weight={500} font={FS} fill={P.white}>iaqtechnology.com.my</T>
      {zones && <Folds at={[97, 197]} names={[[0, 'Inside flap, 97'], [97, 'Back, 100'], [197, 'Front cover, 100']]} />}
    </Svg>
  )
}
/* design 2, inside: the three units, the Design tab's exploded fab with its four layers named, the six services as a loop */
export function Tri2In({ bleed, zones }) {
  const { w, h } = TRI
  return (
    <Svg w={w} h={h} label="Trifold, design 2, inside" bleed={bleed} bleedFill={P.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={P.white} />
      <TriHeads heads={[[9, 'Three business units', 'Three units, one facility'], [109, 'Cleanroom construction', 'The cleanroom, and the fab'], [209, 'How the work runs', 'Six services, one cycle']]} />
      <TriLeft />
      <Txt x={109} y={29} w={82} h={14} size={2.7} lh={1.36} color={P.tx2}>The cleanroom and the whole facility around it, from the subfab to the roof plant, built by one team.</Txt>
      <IsoC k="fab" x={106} y={43} w={88} isw={1.4} />
      <TriSystems x={109} y={156} w={82} />
      <Txt x={209} y={29} w={79} h={14} size={2.7} lh={1.36} color={P.tx2}>Design, procurement, construction, commissioning, maintenance and tools hookup, run as one cycle by one team.</Txt>
      <LoopCol x={209} y={46} h={150} w={79} />
      {zones && <Folds at={[100, 200]} names={[[0, 'Inside left, 100'], [100, 'Inside centre, 100'], [200, 'Inside right, the flap, 97']]} />}
    </Svg>
  )
}
/* design 3, outside, "3D cleanroom": the flap white (the IAQ, the line, the figures, a cleanroom under construction), the
   back, the cover (the IAQ big across the top, the statement, a finished cleanroom bay, the red line) */
export function Tri3Out({ bleed, zones, print }) {
  const { w, h, m } = TRI
  return (
    <Svg w={w} h={h} label="Trifold, design 3, outside" bleed={bleed} bleedFill={P.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={P.white} />
      <MarkB x={m} y={m} w={20} tone="light" />
      <H x={m} y={28} size={4.8} fill={P.ink}>Designed, built and</H>
      <H x={m} y={34} size={4.8} fill={P.ink}>maintained by one team</H>
      <H x={m} y={40} size={4.8} fill={P.red}>for 31 years.</H>
      <Figs x={m} y={56} w={80} cols={2} pitchY={18} size={5.6} />
      <LabRender n="construction" parts={[{ f: [0.93, 0.22], t: 'Fan filter units' }, { f: [0.93, 0.46], t: 'Wall panel' }, { f: [0.86, 0.72], t: 'Raised floor' }]} left={m} y={106} h={38} lx={m + 59} size={2.3} lw={0.18} gap={1.2} print={print} />
      <Txt x={m} y={150} w={79} h={10} size={2.4} lh={1.36} color={P.tx2}>A cleanroom going up: the ceiling grid, a wall panel being set, the raised floor on its pedestals.</Txt>
      <TriBack x0={97} />
      <MarkB x={197 + m} y={m} w={82} tone="light" />
      <H x={197 + m} y={59} size={6.7} fill={P.ink}>Cleanrooms and</H>
      <H x={197 + m} y={66.5} size={6.7} fill={P.ink}>the systems that</H>
      <H x={197 + m} y={74} size={6.7} fill={P.red}>hold them in spec.</H>
      <Rn n="bay" x={197 + m} y={84} w={82} h={94} print={print} />
      <Line x={197 + m} y={184} w={82} t={LINE} fill={P.red} />
      <T x={197 + m} y={201} size={3} weight={500} font={FS} fill={P.ink}>iaqtechnology.com.my</T>
      {zones && <Folds at={[97, 197]} names={[[0, 'Inside flap, 97'], [97, 'Back, 100'], [197, 'Front cover, 100']]} />}
    </Svg>
  )
}
/* design 3, inside: the three units, the fab exploded (render) with its four layers named and a line each, the six services
   as the site's 3D objects in a loop */
export function Tri3In({ bleed, zones, print }) {
  const { w, h } = TRI
  return (
    <Svg w={w} h={h} label="Trifold, design 3, inside" bleed={bleed} bleedFill={P.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={P.white} />
      <TriHeads heads={[[9, 'Three business units', 'Three units, one facility'], [109, 'Cleanroom construction', 'The cleanroom, and the fab'], [209, 'How the work runs', 'Six services, one cycle']]} />
      <TriLeft />
      <Txt x={109} y={29} w={82} h={14} size={2.7} lh={1.36} color={P.tx2}>The cleanroom and the whole facility around it, from the subfab to the roof plant, built by one team.</Txt>
      <LabRender n="hero-exploded" parts={HERO} left={109} y={46} h={68} lx={168} size={2.6} sub={2.1} subW={23} lw={0.18} gap={1.4} print={print} />
      <TriSystems x={109} y={144} w={82} />
      <Txt x={209} y={29} w={79} h={14} size={2.7} lh={1.36} color={P.tx2}>Design, procurement, construction, commissioning, maintenance and tools hookup, run as one cycle by one team.</Txt>
      <LoopCol x={209} y={46} h={150} w={79} os={14} photo />
      {zones && <Folds at={[100, 200]} names={[[0, 'Inside left, 100'], [100, 'Inside centre, 100'], [200, 'Inside right, the flap, 97']]} />}
    </Svg>
  )
}

/* the exhibition print, for the renderer and the exports */
export const PRINT_SETS = [
  { k: 'Leaflet', n: 1, t: 'Direction C: white, the cleanroom being built drawn large with its layers named, the six services as a loop on the back.', F: A5Front1, B: A5Back1, ids: ['a5-1f', 'a5-1b'] },
  { k: 'Leaflet', n: 2, t: 'The red front: field red, the white IAQ big across the top, the complete cleanroom as a white line drawing on the red; the back white, the figures on field red.', F: A5Front2, B: A5Back2, ids: ['a5-2f', 'a5-2b'] },
  { k: 'Trifold', n: 1, t: 'Direction C, drawn throughout: the cleanroom being built on the cover, its layers named inside, the six services as a loop.', F: Tri1Out, B: Tri1In, ids: ['tri-1o', 'tri-1i'] },
  { k: 'Trifold', n: 2, t: 'Red and drawn: the cover and the flap in field red, the white IAQ, the figures, and the cleanroom as white line drawings on the red; inside, the Design tab’s exploded fab.', F: Tri2Out, B: Tri2In, ids: ['tri-2o', 'tri-2i'] },
  { k: 'Leaflet', n: 3, t: '3D cleanroom: white, the fab exploded as a render with its layers named; the back with the six services as the site’s 3D objects.', F: A5Front3, B: A5Back3, ids: ['a5-3f', 'a5-3b'] },
  { k: 'Trifold', n: 3, t: '3D cleanroom: white, a finished cleanroom bay on the cover, the fab exploded inside with every layer named, the six services as the site’s 3D objects.', F: Tri3Out, B: Tri3In, ids: ['tri-3o', 'tri-3i'] },
]
export const PIECES_PRINT = {
  'a5-1f': { C: A5Front1, w: 148, h: 210, unit: 'mm', k: 'Leaflet A5, design 1, front', print: true },
  'a5-1b': { C: A5Back1, w: 148, h: 210, unit: 'mm', k: 'Leaflet A5, design 1, back', print: true },
  'a5-2f': { C: A5Front2, w: 148, h: 210, unit: 'mm', k: 'Leaflet A5, design 2, front', print: true },
  'a5-2b': { C: A5Back2, w: 148, h: 210, unit: 'mm', k: 'Leaflet A5, design 2, back', print: true },
  'tri-1o': { C: Tri1Out, w: 297, h: 210, unit: 'mm', k: 'Trifold A4, design 1, outside', print: true },
  'tri-1i': { C: Tri1In, w: 297, h: 210, unit: 'mm', k: 'Trifold A4, design 1, inside', print: true },
  'tri-2o': { C: Tri2Out, w: 297, h: 210, unit: 'mm', k: 'Trifold A4, design 2, outside', print: true },
  'tri-2i': { C: Tri2In, w: 297, h: 210, unit: 'mm', k: 'Trifold A4, design 2, inside', print: true },
  'a5-3f': { C: A5Front3, w: 148, h: 210, unit: 'mm', k: 'Leaflet A5, design 3, front', print: true },
  'a5-3b': { C: A5Back3, w: 148, h: 210, unit: 'mm', k: 'Leaflet A5, design 3, back', print: true },
  'tri-3o': { C: Tri3Out, w: 297, h: 210, unit: 'mm', k: 'Trifold A4, design 3, outside', print: true },
  'tri-3i': { C: Tri3In, w: 297, h: 210, unit: 'mm', k: 'Trifold A4, design 3, inside', print: true },
}
