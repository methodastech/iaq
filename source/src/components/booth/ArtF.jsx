import React from 'react'
import { Svg, Zones, Qr, UNITS3, ScreenStill, HiddenNote, PROCESS, DotMap, mapH, SCREEN3 } from './Art.jsx'
import { MarkB, markHB, H, T, Txt, Act, Line, lineT, Photo, FS, FI, PROOF, WALL_MARK } from './ArtB.jsx'
import { QR_URL } from '../../data/boothQr.js'
import { Build } from './ArtC.jsx'

/* ============================================================================
   The SEMICON Europa 2026 artwork, Direction F: "3D cleanroom" (30 Sep 2026). Bazil: "create one with amazing 3d".
   A white stand built around photoreal renders of a cleanroom facility (generated CGI, public/booth/f3d, graded to the IAQ
   palette by tools/booth-f3d-grade-0930.py into public/booth/f3d/iaq: every hue but red to grey, one red part each, the
   ground lifted to pure white so each render sits on the wall's own white with no box edge):
     the side wall     the fab exploded into four layers (hero-exploded), its layers named on fine leaders, the cleanroom
                       with its one red fan filter unit
     the back wall     a cleanroom under construction (construction) directly under the raised screen, on its edges
     the aisle column  the six services as the site's own photoreal stage objects (public/assets/cycle3d/<k>-card.webp), top
                       to bottom: a 9 by 16 render on a 310 mm column would stand only about 700 mm tall
     the roll-up       the tall exploded stack of cleanroom layers (column-stack)
   the ground: white #FFFFFF; the IAQ at the top of every piece (IAQ's light file); ONE long red line, 400 mm above the floor
   across the three walls at one height (as C), above the foot everywhere else; Switzer 600 statements and names, Switzer 500
   the foot, Instrument Sans sentences. The renders are representations: said in the zones overlay and the print spec only.
   Print pieces take the full size JPGs (`print`), the screen the 1600 px WEBPs.
   ============================================================================ */

export const FF = { white: '#FFFFFF', light: '#F4F6F9', ink: '#231F20', tx2: '#5A5F6B', red: '#EC2027', field: '#C8161D' }
/* the renders, graded copies; `print` takes the full size JPG */
export const R = (n, print) => `/booth/f3d/iaq/${n}.${print ? 'jpg' : 'webp'}`
const OBJ = k => `/assets/cycle3d/${k}-card.webp`
const LINE_Y = 3472 - 400, LINE_T = lineT(WALL_MARK)
/* a render fitted whole into its box (its white ground runs into the piece's white) */
export const Rn = ({ n, x, y, w, h, print }) => <image href={R(n, print)} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMid meet" />
/* one of the site's photoreal stage objects: its whole 2 by 1 card, whose white runs into the piece's white */
export const Obj = ({ k, x, y, w }) => <image href={OBJ(k)} x={x} y={y} width={w} height={w / 2} preserveAspectRatio="xMidYMid meet" />
/* in the zones overlay only: the renders are generated representations */
const RepNote = ({ x, y, size = 40 }) => <g pointerEvents="none"><rect x={x} y={y} width={size * 15} height={size * 1.8} fill="rgba(37,99,235,.14)" /><text x={x + size * 0.4} y={y + size * 1.22} fontFamily={FS} fontWeight="700" fontSize={size} fill="#1D4ED8">Representation, a generated render</text></g>
/* the hero's four layers: where each layer's right edge sits in the render (fractions), and its name */
export const HERO = [
  { f: [0.965, 0.17], t: 'Roof plant', s: 'Air handling, chillers, the stack' },
  { f: [0.955, 0.40], t: 'Cleanroom', s: 'Fan filter units, one under test' },
  { f: [0.975, 0.61], t: 'Fab floor', s: 'Process tools on the raised floor' },
  { f: [0.975, 0.80], t: 'Subfab', s: 'Utilities, pumps and pipework' },
]

/* 30 Sep (Bazil on the roll-up: "doesn't this look very bad and not proper"): no render stands unexplained. Each render's
   aspect and the left edge of the object inside it (fraction of the width), so a render aligns on the object, not on its
   white; and the parts of each, where a part's right edge sits (fractions) and its name */
const RM = { 'hero-exploded': [0.8, 0.03], construction: [1.5, 0.06], 'module-exploded': [1.5, 0.18], 'column-stack': [0.5625, 0.11], 'column-tower': [0.5625, 0.17], bay: [1, 0.03], block: [1, 0.03] }
export const PARTS = {
  'module-exploded': [
    { f: [0.79, 0.12], t: 'Air handling unit', s: 'Supplies and conditions the air' },
    { f: [0.81, 0.29], t: 'Fan filter units', s: 'HEPA filtration at the ceiling' },
    { f: [0.81, 0.55], t: 'Wall panels', s: 'One being set' },
    { f: [0.83, 0.80], t: 'Raised floor', s: 'Perforated tiles on pedestals' },
  ],
  construction: [
    { f: [0.93, 0.22], t: 'Fan filter units', s: 'Going into the ceiling grid' },
    { f: [0.93, 0.46], t: 'Wall panel', s: 'One being set' },
    { f: [0.86, 0.72], t: 'Raised floor', s: 'The front bay still bare' },
  ],
  block: [
    { f: [0.96, 0.22], t: 'Roof plant', s: 'Air handling and chillers' },
    { f: [0.93, 0.48], t: 'Cleanroom', s: 'The controlled space' },
    { f: [0.96, 0.72], t: 'Subfab', s: 'Utilities and pipework' },
  ],
}
/* a render with its object's left edge at `left`, its parts named on fine horizontal leaders to a column at lx */
export function LabRender({ n, left, y, h, lx, size, sub, subW, lw, gap, print, parts = PARTS[n], clipX }) {
  const [a, l] = RM[n], w = h * a, x = clipX != null ? Math.max(clipX, left - l * w) : left - l * w
  return (
    <g>
      <Rn n={n} x={x} y={y} w={w} h={h} print={print} />
      {parts.map(P => {
        const X = x + P.f[0] * w + gap, Y = y + P.f[1] * h
        return (
          <g key={P.t}>
            <rect x={X} y={Y - lw / 2} width={Math.max(0, lx - gap - X)} height={lw} fill="#8E96A1" />
            <text x={lx} y={Y + size * 0.34} fontFamily={FS} fontWeight="600" fontSize={size} fill={FF.ink} letterSpacing={-0.015 * size}>{P.t}</text>
            {sub && <Txt x={lx} y={Y + size * 0.62} w={subW} h={sub * 3} size={sub} lh={1.28} color={FF.tx2}>{P.s}</Txt>}
          </g>
        )
      })}
    </g>
  )
}

/* ================================================================ the stand */

/* 1, the aisle column, 310 × 3472, white: the IAQ across the top, the six services top to bottom as photoreal objects with
   their names, joined as a LOOP (30 Sep, Bazil: "this should have a loop flow right"): one red line down the column with a
   plain chevron between each pair, and after Tools hookup the line turns, runs back up the column's right edge and in to
   Design, as on the red columns of A and C2. No numbers, no discs. The red line round the zone at 400 mm. */
export function W1F({ zones, bleed }) {
  const w = 310, h = 3472, mw = 230, top = 430, bottom = 2900, cx = 138, rx = 284, cw = 236, lw = 4, size = 29, lh = 34
  const n = PROCESS.length, pitch = (bottom - top) / n
  const items = PROCESS.map(([k, name], i) => { const y = top + i * pitch, lines = name.split('|'); return { k, lines, y, foot: y + cw / 2 + 22 + lines.length * lh } })
  const chev = (x, y, dir) => {
    const a = 11, b = 8
    const d = dir === 'down' ? `M${x - a} ${y - b / 2}L${x} ${y + b / 2}L${x + a} ${y - b / 2}` : dir === 'up' ? `M${x - a} ${y + b / 2}L${x} ${y - b / 2}L${x + a} ${y + b / 2}` : `M${x + b / 2} ${y - a}L${x - b / 2} ${y}L${x + b / 2} ${y + a}`
    return <path d={d} fill="none" stroke={FF.red} strokeWidth={lw} strokeLinejoin="miter" strokeLinecap="butt" />
  }
  const first = items[0], last = items[n - 1]
  const ret = { y0: last.foot + 24, y1: last.foot + 74, yT: first.y + cw / 4, xIn: cx + cw / 2 - 18 }
  return (
    <Svg w={w} h={h} label="Wall 1, the aisle column, Direction F" bleed={bleed} bleedFill={FF.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={FF.white} />
      <MarkB x={40} y={150} w={mw} tone="light" />
      {items.map((it, i) => {
        const nx = items[i + 1]
        return (
          <g key={it.k}>
            <Obj k={it.k} x={cx - cw / 2} y={it.y} w={cw} />
            {it.lines.map((l, j) => <text key={l} x={cx} y={it.y + cw / 2 + 22 + (j + 0.8) * lh} textAnchor="middle" fontFamily={FS} fontWeight="600" fontSize={size} fill={FF.ink} letterSpacing={-0.3}>{l}</text>)}
            {nx && <><rect x={cx - lw / 2} y={it.foot + 22} width={lw} height={nx.y - 22 - it.foot - 22} fill={FF.red} />{chev(cx, (it.foot + nx.y) / 2, 'down')}</>}
          </g>
        )
      })}
      {/* the loop back: down from Tools hookup, across, up the right edge, and in to Design */}
      <path d={`M${cx} ${ret.y0}V${ret.y1}H${rx}V${ret.yT}H${ret.xIn}`} fill="none" stroke={FF.red} strokeWidth={lw} strokeLinejoin="miter" />
      {chev(rx, (ret.y1 + ret.yT) / 2, 'up')}
      {chev(ret.xIn + 10, ret.yT, 'left')}
      <Line x={-10} y={LINE_Y} w={w + 20} t={LINE_T} fill={FF.red} />
      {zones && <Zones w={w} h={h} zones={zones} />}
    </Svg>
  )
}

/* 2, the side wall, 2852 × 3472: the statement, the fab exploded into four layers as the hero render, each layer named on a
   fine leader, the red line */
export function W2F({ zones, bleed, print }) {
  const w = 2852, h = 3472, m = 150, hx = 110, hy = 840, hh = 2140, hw = hh * 0.8, lx = 1920
  return (
    <Svg w={w} h={h} label="Wall 2, the side wall, Direction F" bleed={bleed} bleedFill={FF.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={FF.white} />
      <MarkB x={m} y={130} w={WALL_MARK} tone="light" />
      <H x={m} y={530} size={150} fill={FF.ink}>The cleanroom, and</H>
      <H x={m} y={690} size={150} fill={FF.red}>the whole fab around it.</H>
      <Rn n="hero-exploded" x={hx} y={hy} w={hw} h={hh} print={print} />
      {HERO.map(L => {
        const X = hx + L.f[0] * hw + 40, Y = hy + L.f[1] * hh
        return (
          <g key={L.t}>
            <rect x={X} y={Y - 1.5} width={lx - 40 - X} height={3} fill="#8E96A1" />
            <text x={lx} y={Y + 27} fontFamily={FS} fontWeight="600" fontSize="80" fill={FF.ink} letterSpacing="-1.6">{L.t}</text>
            <text x={lx} y={Y + 97} fontFamily={FI} fontWeight="400" fontSize="46" fill={FF.tx2}>{L.s}</text>
          </g>
        )
      })}
      <Line x={-10} y={LINE_Y} w={w + 20} t={LINE_T} fill={FF.red} />
      <T x={w - m} y={LINE_Y + 110} size={52} weight={500} font={FS} fill={FF.ink} anchor="end">iaqtechnology.com.my</T>
      {zones && <><Zones w={w} h={h} zones={zones} /><RepNote x={hx + 40} y={hy + 40} /></>}
    </Svg>
  )
}

/* 3, the back wall, 2046 × 3472, 1736 visible. 30 Sep (Bazil: "back should be red", "IAQ in middle with better title", "put
   better info at bottom, maybe world map"): the one red plane of F. Field red; the white IAQ big and centred over the visible
   width; the title centred under it in white; the raised screen; the cleanroom under construction on a white block on the
   screen's own edges; at the foot the world in white dots with the offices, and the figures; the zone's line in white. */
export function W3F({ zones, bleed, print, still = '/booth/screen-still.webp' }) {
  const w = 2046, h = 3472, vis = 1736, cx = vis / 2, U = UNITS3, mw = 720, mh = markHB(mw)
  const rb = { x: U.x, y: SCREEN3.y + SCREEN3.h + 56, w: U.w, h: 560 }
  const band = rb.y + rb.h + 70, mapW = 620   /* 30 Sep: 620 and a 70 mm gap, so the figures end inside the screen's right edge */
  const FIG = [['31', 'years building controlled environments'], ['1,050,000 m\u00b2', 'of cleanroom built'], ['7', 'countries with an IAQ office'], ['450', 'people, group wide']]
  return (
    <Svg w={w} h={h} label="Wall 3, the screen wall, Direction F" bleed={bleed} bleedFill={FF.field}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={FF.field} />
      <MarkB x={cx - mw / 2} y={110} w={mw} tone="white" />
      <H x={cx} y={110 + mh + 150} size={108} fill={FF.white} anchor="middle">From the first drawing</H>
      <H x={cx} y={110 + mh + 270} size={108} fill={FF.white} anchor="middle">to a proven cleanroom.</H>
      <ScreenStill print={print} still={still} frame="#0A1020" />
      {/* 30 Sep, evening (Bazil: "no weird white"): no white block on the red; the complete cleanroom as a white line drawing,
          its layers named in white (a render cannot sit on red without its white ground showing) */}
      <Build x={rb.x - 10} y={rb.y + 10} h={rb.h - 20} lx={rb.x + 560} size={40} lw={2.5} gap={24} isw={1.4} onRed />
      <DotMap x={rb.x} y={band} w={mapW} label={1.4} dot="rgba(255,255,255,.34)" ink={FF.white} sub="rgba(255,255,255,.78)" hl={FF.white} />
      {FIG.map(([v, l], i) => {
        const x = rb.x + mapW + 70 + (i % 2) * 235, y = band + 90 + Math.floor(i / 2) * 200   /* 30 Sep: 200, so a three line label clears the row under it */
        return (
          <g key={v}>
            <text x={x} y={y} fontFamily={FS} fontWeight="600" fontSize={i === 1 ? 52 : 70} fill={FF.white} letterSpacing="-1.4">{v}</text>
            <Txt x={x} y={y + 16} w={215} h={110} size={24} lh={1.3} color="rgba(255,255,255,.86)">{l}</Txt>
          </g>
        )
      })}
      <Line x={-10} y={LINE_Y} w={w + 20} t={LINE_T} fill={FF.white} />
      {zones && <><Zones w={vis} h={h} zones={zones} /><HiddenNote /><RepNote x={rb.x + 30} y={rb.y + 20} size={34} /></>}
    </Svg>
  )
}

/* 4, the counter front, 600 × 1170, 170 mm radius top right: the IAQ, the statement, the code, one render, the red line */
export function CounterF({ zones, bleed, print }) {
  const w = 600, h = 1170, r = 170, mw = 260
  const shape = `M0 0H${w - r}A${r} ${r} 0 0 1 ${w} ${r}V${h}H0Z`
  const shapeB = `M-10 -10H${w - r}A${r + 10} ${r + 10} 0 0 1 ${w + 10} ${r}V${h + 10}H-10Z`
  return (
    <Svg w={w} h={h} label="Counter front, Direction F" bleed={bleed}>
      <defs><clipPath id="bfCt"><path d={bleed ? shapeB : shape} /></clipPath></defs>
      <g clipPath="url(#bfCt)">
        <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={FF.white} />
        <MarkB x={60} y={70} w={mw} tone="light" />
        <H x={60} y={300} size={54} fill={FF.ink}>Cleanrooms,</H>
        <H x={60} y={362} size={54} fill={FF.red}>built to class.</H>
        <Qr x={60} y={430} s={270} />   {/* 30 Sep, evening: 270 mm, 9.3 mm a module */}
        <Txt x={362} y={426} w={178} h={140} size={26} lh={1.35} color={FF.tx2}>Scan for the 3D story, the services and the projects.</Txt>
        {/* the module render beside the code, named in one line under it */}
        <Rn n="module-exploded" x={352} y={566} w={196} h={131} print={print} />
        <Txt x={362} y={702} w={178} h={60} size={20} lh={1.3} color={FF.tx2}>A cleanroom module, exploded</Txt>
        <Line x={60} y={790} w={480} t={lineT(mw)} fill={FF.red} />
        <T x={60} y={846} size={26} weight={500} font={FS} fill={FF.ink}>{QR_URL}</T>
      </g>
      {!bleed && <path d={shape} fill="none" stroke="#DCE2EC" strokeWidth="3" className="bt-bleedline" />}
      {zones && <Zones w={w} h={h} zones={zones} />}
    </Svg>
  )
}

/* ================================================================ print collateral */

/* the leaflet, A5 148 × 210. Front: the statement, the cleanroom module exploded, the show, the code, the red line */
export function FlyerFrontF({ bleed, print }) {
  const w = 148, h = 210, mw = 34
  return (
    <Svg w={w} h={h} label="Leaflet, Direction F, front" bleed={bleed} bleedFill={FF.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={FF.white} />
      <MarkB x={12} y={12} w={mw} tone="light" />
      <H x={12} y={44} size={8.6} fill={FF.ink}>Cleanrooms,</H>
      <H x={12} y={54.5} size={8.6} fill={FF.red}>built to class.</H>
      <Txt x={12} y={60} w={120} h={12} size={3.3} lh={1.42} color={FF.tx2}>IAQ designs, builds and commissions cleanrooms and the facilities around them, then hooks up the tools inside and keeps them running.</Txt>
      <LabRender n="module-exploded" left={12} y={70} h={80} lx={95} size={3.2} lw={0.2} gap={2} print={print} />
      <H x={12} y={163} size={4.8} fill={FF.ink}>Meet IAQ at SEMICON Europa 2026</H>
      <T x={12} y={169.5} size={3.3} fill={FF.tx2}>Messe München, 10 to 13 November</T>
      <T x={12} y={174.5} size={3.3} fill={FF.tx2}>Stand to confirm</T>
      <Qr x={112} y={158} s={24} />
      <Line x={12} y={186} w={124} t={lineT(mw)} fill={FF.red} />
      <T x={12} y={195} size={3.2} weight={500} font={FS} fill={FF.ink}>iaqtechnology.com.my</T>
      <T x={136} y={195} size={3.2} weight={500} font={FS} fill={FF.ink} anchor="end">business@iaqtechnology.com.my</T>
    </Svg>
  )
}
/* back: the six services as photoreal objects, the record on a light band, Dresden, headquarters, the stand slot */
export function FlyerBackF({ bleed }) {
  const w = 148, h = 210, cw = 124 / 3
  return (
    <Svg w={w} h={h} label="Leaflet, Direction F, back" bleed={bleed} bleedFill={FF.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={FF.white} />
      <MarkB x={12} y={10} w={20} tone="light" />
      <H x={12} y={30} size={7.4} fill={FF.ink}>Six services,</H>
      <H x={12} y={39} size={7.4} fill={FF.red}>one accountable team.</H>
      {PROCESS.map(([k, name], i) => {
        const x = 12 + (i % 3) * cw, y = 45 + Math.floor(i / 3) * 38
        return (
          <g key={k}>
            <Obj k={k} x={x - 4} y={y} w={cw} />
            <Txt x={x} y={y + cw / 2 + 1} w={cw - 4} h={9} size={3} lh={1.2} color={FF.ink} weight={600} font={FS}>{name.replace('|', ' ')}</Txt>
          </g>
        )
      })}
      <rect x="-10" y="124" width={w + 20} height="36" fill={FF.light} />
      {PROOF.map(([n, l], i) => {
        const x = 12 + (i % 2) * 64, y = 135.5 + Math.floor(i / 2) * 14
        return (
          <g key={n}>
            <H x={x} y={y} size={7} fill={FF.ink}>{n}</H>
            <T x={x} y={y + 4.4} size={2.7} fill={FF.tx2}>{l}</T>
          </g>
        )
      })}
      <H x={12} y={170} size={3.4} fill={FF.ink}>IAQ Engineering (DE) GmbH, Dresden</H>
      <Txt x={12} y={172} w={58} h={10} size={2.9} lh={1.45} color={FF.tx2}>8. OG, Budapester Straße 5, 01069 Dresden<br />+49 351 4387 9529</Txt>
      <H x={12} y={187} size={3.4} fill={FF.ink}>Headquarters, Shah Alam, Malaysia</H>
      <Txt x={12} y={189} w={58} h={10} size={2.9} lh={1.45} color={FF.tx2}>+603 5124 8319<br />business@iaqtechnology.com.my</Txt>
      <H x={76} y={170} size={3.4} fill={FF.ink}>Your contact</H>
      <Txt x={76} y={172} w={30} h={10} size={2.9} lh={1.45} color={FF.tx2}>Contact details to follow from IAQ</Txt>
      <Qr x={112} y={168} s={24} />
      <T x={112} y={200} size={3} weight={600} font={FS} fill={FF.ink}>Book a meeting</T>
    </Svg>
  )
}

/* the roll-up, 850 × 2000. 30 Sep, rebuilt (Bazil: "doesn't this look very bad and not proper as well"): the IAQ top left on
   the margin, a real headline with one phrase red and one short line, then the stack of cleanroom layers (render) with its
   left edge on the margin and each of its five layers named on a fine horizontal leader to a name column on the right, the
   figure, the one red line at 1633 and the foot at 1690, all inside the margins; nothing readable under 300 mm from the
   floor (the cassette hides it) */
const STACK = [
  { f: [0.85, 0.12], t: 'Air handling unit', s: 'Supplies and conditions the air' },
  { f: [0.86, 0.30], t: 'Fan filter units', s: 'HEPA filtration at the ceiling' },
  { f: [0.80, 0.50], t: 'Cleanroom', s: 'The controlled space and its tools' },
  { f: [0.88, 0.69], t: 'Raised floor', s: 'Perforated tiles for the return air' },
  { f: [0.89, 0.90], t: 'Subfab', s: 'The utilities and pipework below' },
]
export function RollUpF({ bleed, print }) {
  const w = 850, h = 2000, m = 85, mw = 425, rh = 740, rw = rh * 0.5625, ry = 648, rx = m - 0.11 * rw, lx = 468
  return (
    <Svg w={w} h={h} label="Roll-up, Direction F" bleed={bleed} bleedFill={FF.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={FF.white} />
      <MarkB x={m} y={102} w={mw} tone="light" />
      <H x={m} y={420} size={80} fill={FF.ink}>The cleanroom,</H>
      <H x={m} y={510} size={80} fill={FF.red}>layer by layer.</H>
      <Txt x={m} y={534} w={w - 2 * m} h={92} size={30} lh={1.34} color={FF.tx2}>Built by one IAQ team, from the raised floor to the air handling above.</Txt>
      <Rn n="column-stack" x={rx} y={ry} w={rw} h={rh} print={print} />
      {STACK.map(L => {
        const X = rx + L.f[0] * rw + 16, Y = ry + L.f[1] * rh
        return (
          <g key={L.t}>
            <rect x={X} y={Y - 1} width={lx - 14 - X} height={2} fill="#8E96A1" />
            <text x={lx} y={Y + 11} fontFamily={FS} fontWeight="600" fontSize="32" fill={FF.ink} letterSpacing="-0.5">{L.t}</text>
            <Txt x={lx} y={Y + 20} w={w - m - lx} h={64} size={24} lh={1.28} color={FF.tx2}>{L.s}</Txt>
          </g>
        )
      })}
      <H x={m} y={1478} size={64} fill={FF.ink}>1,050,000 m²</H>
      <T x={m} y={1522} size={28} fill={FF.tx2}>of cleanroom built since 1995</T>
      <Line x={m} y={1633} w={w - 2 * m} t={lineT(mw)} fill={FF.red} />
      <T x={m} y={1690} size={28} weight={500} font={FS} fill={FF.ink}>iaqtechnology.com.my</T>
      <T x={w - m} y={1690} size={28} weight={500} font={FS} fill={FF.ink} anchor="end">Shah Alam and Dresden</T>
    </Svg>
  )
}

/* ================================================================ digital (px) */

/* LinkedIn, four posts at 1080 × 1350: the IAQ, the statement, one line, one render on the white (or the stand), the action,
   the red line above the foot */
function PostF({ label, h1, h2, lede, photo, render, act, after, footL, footR }) {
  const w = 1080, h = 1350, m = 80, mw = 200
  return (
    <Svg w={w} h={h} label={label}>
      <rect width={w} height={h} fill={FF.white} />
      <MarkB x={m} y={80} w={mw} tone="light" />
      <H x={m} y={300} size={96} fill={FF.ink}>{h1}</H>
      <H x={m} y={400} size={96} fill={FF.red}>{h2}</H>
      <Txt x={m} y={432} w={w - 2 * m} h={96} size={34} lh={1.36} color={FF.tx2}>{lede}</Txt>
      {render ? <LabRender n={render} left={m} y={544} h={render === 'block' ? 470 : 440} lx={render === 'block' ? 600 : 610} size={32} sub={render === 'block' ? 24 : 0} subW={w - m - 610} lw={1.5} gap={14} /> : <Photo href={photo} x={0} y={540} w={w} h={480} />}
      {act && <Act x={m} y={1062} w={w - 2 * m} h={80} size={30} t={act} after={after} afterColor={FF.tx2} />}
      <Line x={m} y={1190} w={w - 2 * m} t={lineT(mw)} fill={FF.red} />
      {footL && <T x={m} y={1250} size={28} weight={500} font={FS} fill={FF.ink}>{footL}</T>}
      {footR && <T x={w - m} y={1250} size={28} weight={500} font={FS} fill={FF.ink} anchor="end">{footR}</T>}
    </Svg>
  )
}
export const Post1F = () => <PostF label="LinkedIn post 1, three weeks out, Direction F" h1="Meet IAQ" h2="in Munich." lede={'SEMICON Europa 2026, Messe München, 10 to 13 November.'} render="module-exploded" act="Book a meeting" after="Stand to confirm" footL="iaqtechnology.com.my/semicon" />
export const Post2F = () => <PostF label="LinkedIn post 2, one week out, Direction F" h1="From Shah Alam" h2="to Dresden." lede="Offices in seven countries, and a team in Germany: IAQ Engineering (DE) GmbH, Dresden." render="block" footL="Messe München, 10 to 13 November" footR="iaqtechnology.com.my/semicon" />
export const Post3F = ({ photo = '/booth/still-post3-f.webp' }) => <PostF label="LinkedIn post 3, opening day, Direction F" h1="The stand" h2="is open." lede="See a fab built layer by layer, on the screen." photo={photo} act="Find us at the stand" after="Messe München" footL="iaqtechnology.com.my/semicon" />
export const Post4F = ({ photo = '/booth/still-post4-f.webp' }) => <PostF label="LinkedIn post 4, thank you, Direction F" h1="Thank you," h2="Munich." lede="Four days of briefs and conversations. Every one gets an answer within one working day." photo={photo} footL="SEMICON Europa 2026" footR="iaqtechnology.com.my" />

/* web ads, four sizes: white, the IAQ, the statement, one render where there is room, one red action */
export function AdF({ size }) {
  const [w, h] = size
  const head = (x, ys, s) => <><H x={x} y={ys[0]} size={s} fill={FF.ink}>Cleanrooms,</H><H x={x} y={ys[1]} size={s} fill={FF.red}>built to class.</H></>
  const frame = <rect width={w} height={h} fill={FF.white} />
  if (w > h * 3) return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}, Direction F`}>
      {frame}
      <MarkB x={20} y={24} w={100} tone="light" />
      <H x={148} y={42} size={20} fill={FF.ink}>Cleanrooms, <tspan fill={FF.red}>built to class.</tspan></H>
      <T x={148} y={64} size={12.5} fill={FF.tx2}>SEMICON Europa, Messe München, 10 to 13 Nov</T>
      <Act x={540} y={27} w={168} h={40} size={14} t="Book a meeting" end />
    </Svg>
  )
  if (h > w * 3) return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}, Direction F`}>
      {frame}
      <MarkB x={16} y={24} w={128} tone="light" />
      {head(16, [122, 144], 19)}
      <Rn n="column-tower" x={16} y={162} w={w - 32} h={214} />
      <Txt x={16} y={392} w={w - 32} h={52} size={13} lh={1.35} color={FF.tx2}>SEMICON Europa, Munich, 10 to 13 Nov</Txt>
      <Act x={16} y={450} w={w - 32} h={34} size={13} t="Book a meeting" />
    </Svg>
  )
  if (h > w * 1.5) return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}, Direction F`}>
      {frame}
      <MarkB x={24} y={28} w={120} tone="light" />
      {head(24, [146, 184], 34)}
      <Txt x={24} y={204} w={w - 48} h={60} size={15} lh={1.4} color={FF.tx2}>Meet IAQ at SEMICON Europa, Messe München, 10 to 13 November.</Txt>
      <Rn n="bay" x={24} y={272} w={w - 48} h={222} />
      <Act x={24} y={514} w={w - 48} h={40} size={16} t="Book a meeting" />
    </Svg>
  )
  return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}, Direction F`}>
      {frame}
      <MarkB x={20} y={18} w={86} tone="light" />
      {head(20, [92, 120], 25)}
      <Rn n="bay" x={196} y={36} w={96} h={96} />
      <T x={20} y={170} size={13} fill={FF.tx2}>SEMICON Europa, Munich, 10 to 13 Nov</T>
      <Act x={20} y={188} w={w - 40} h={36} size={14} t="Book a meeting" />
    </Svg>
  )
}

/* the email signature banner, 600 × 150: white, the IAQ, the show, the cut open cleanroom block at the right */
export function SignatureF() {
  const w = 600, h = 150
  return (
    <Svg w={w} h={h} label="Email signature banner, Direction F">
      <rect width={w} height={h} fill={FF.white} />
      <MarkB x={24} y={24} w={86} tone="light" />
      <H x={24} y={96} size={19} fill={FF.ink}>Meet IAQ at SEMICON Europa</H>
      <T x={24} y={119} size={12.5} fill={FF.tx2}>Messe München, 10 to 13 November, stand to confirm</T>
      <Rn n="block" x={420} y={4} w={170} h={142} />
    </Svg>
  )
}

export const ART_F = { 'w1-f': W1F, 'w2-f': W2F, 'w3-f': W3F, 'ct-f': CounterF }
export const POSTS_F = { post1: Post1F, post2: Post2F, post3: Post3F, post4: Post4F }
const ADS_F = [[300, 250], [728, 90], [300, 600], [160, 600]]
export const PIECES_F = {
  'w1-f': { C: W1F, w: 310, h: 3472, unit: 'mm', k: 'Wall 1, aisle column, Direction F', print: true },
  'w2-f': { C: W2F, w: 2852, h: 3472, unit: 'mm', k: 'Wall 2, side wall, Direction F', print: true },
  'w3-f': { C: W3F, w: 2046, h: 3472, unit: 'mm', k: 'Wall 3, the screen wall, Direction F', print: true },
  'ct-f': { C: CounterF, w: 600, h: 1170, unit: 'mm', k: 'Counter front, Direction F', print: true },
  flyerF1: { C: FlyerFrontF, w: 148, h: 210, unit: 'mm', k: 'Leaflet, Direction F, front', print: true },
  flyerF2: { C: FlyerBackF, w: 148, h: 210, unit: 'mm', k: 'Leaflet, Direction F, back', print: true },
  rollF: { C: RollUpF, w: 850, h: 2000, unit: 'mm', k: 'Roll-up, Direction F', print: true },
  'post1-f': { C: Post1F, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 1, three weeks out, Direction F' },
  'post2-f': { C: Post2F, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 2, one week out, Direction F' },
  'post3-f': { C: Post3F, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 3, opening day, Direction F' },
  'post4-f': { C: Post4F, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 4, thank you, Direction F' },
  'sig-f': { C: SignatureF, w: 600, h: 150, unit: 'px', k: 'Email signature, Direction F' },
  ...Object.fromEntries(ADS_F.map(s => ['ad' + s.join('x') + '-f', { C: p => <AdF size={s} {...p} />, w: s[0], h: s[1], unit: 'px', k: `Web ad ${s[0]} × ${s[1]}, Direction F` }])),
}
