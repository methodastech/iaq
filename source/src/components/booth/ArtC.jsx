import React from 'react'
import { Svg, Zones, Qr, UNIT_LINE, SCREEN3, UNITS3, ScreenStill, HiddenNote, MarkFlat, ProcessColumn, DotMap, mapH } from './Art.jsx'
import { MarkB, markHB, letterH, Seven, Iso, H, T, Txt, Act, Line, lineT, FS, FI, UNITS, PROOF, WALL_MARK, FOOT } from './ArtB.jsx'
import { QR_URL } from '../../data/boothQr.js'
import { ISO_C } from '../../assets/booth/iso-set-c-0930.js'

/* ============================================================================
   The SEMICON Europa 2026 artwork, Direction C: "Isometric cleanroom" (30 Sep 2026).
   Bazil, pointing at Direction B's white block of isometric objects: "extract the 3d clean room part and focus more to
   this for a 3rd variation", then "make sure clean room construction". The Design tab's isometric drawings become the
   stand: a cleanroom being built, layer by layer, drawn large on the side wall with its layers named on fine horizontal
   leaders (tools/booth-cleanroom-0930.mjs, on the Design tab's own engine); a tower crane lifting a fan filter unit up
   the aisle column; the three units under the raised screen on the back wall.

   the ground: white #FFFFFF, the aisle column #F4F6F9
   the drawings in their own soft greys, ONE red part each (the panel being set, the fan filter unit on the hook, the
     cleanroom tray's unit on the fab, each object's own red part)
   the IAQ wordmark top left on every piece (IAQ's light file: red letters, black ®), 520 mm on the walls, the same grid as
     Direction B, so the statement sits above the raised screen
   ONE long straight red line: on the stand it runs 400 mm above the floor across all three walls at one height, edge to
     edge, so it reads as one line round the zone; above the foot on every other piece. No seven lines, no stripes
   type: Switzer 600 for statements, names and labels, Switzer 500 for the foot, Instrument Sans for sentences
   no photographs: drawings only (the posts' stand still is a render of this stand)
   ============================================================================ */

export const G = { white: '#FFFFFF', light: '#F4F6F9', ink: '#231F20', tx2: '#5A5F6B', red: '#EC2027', lead: '#8E96A1' }
const LINE_Y = 3472 - 400, LINE_T = lineT(WALL_MARK)

/* one of the C drawings (ISO_C) at a width, or fitted to a height */
export function IsoC({ k, x, y, w, h, isw = 1 }) {
  const o = ISO_C[k]
  const [, , vw, vh] = o.vb.split(' ').map(Number)
  const W = w ?? h * vw / vh, Hh = h ?? w * vh / vw
  return <svg x={x} y={y} width={W} height={Hh} viewBox={o.vb} style={{ '--isw': isw }} dangerouslySetInnerHTML={{ __html: o.inner }} />
}
const vbOf = k => ISO_C[k].vb.split(' ').map(Number)

/* the cleanroom, complete, in its construction layers, each layer named on a fine leader to a label column at lx, with the
   house line icon for that layer beside its name (30 Sep, evening, Bazil: "there's icon involved"): 24 grid, one stroke,
   no fill, one red part, never in a box, all at one size */
const LAYER_IC = {
  air: { ink: 'M2 7.5h20v10H2zM9 7.5v10M3.5 10h4M3.5 12.5h4M3.5 15h4', red: 'M18.8 12.5a3 3 0 1 1-6 0a3 3 0 1 1 6 0M15.8 9.5v6M12.8 12.5h6' },
  ceiling: { ink: 'M3 6h18v5H3zM6 11v1.5M18 11v1.5M9 8.5h6', red: 'M8 15v4M12 15v4M16 15v4' },
  walls: { ink: 'M4 3h16v18H4zM12 3v18M6.5 13.5h1', red: 'M14 7h4v5h-4z' },
  floor: { ink: 'M2 9h20v2.5H2zM5 11.5v7M19 11.5v7M3.5 18.5h3M17.5 18.5h3', red: 'M12 11.5v7M10.5 18.5h3' },
}
export function LayerIc({ k, x, y, s, onRed }) {
  const u = LAYER_IC[k]
  return <svg x={x} y={y} width={s} height={s} viewBox="0 0 24 24" fill="none" strokeWidth={onRed ? 1.2 : 1} strokeLinecap="round" strokeLinejoin="round"><path d={u.ink} stroke={onRed ? '#fff' : G.ink} /><path d={u.red} stroke={onRed ? '#fff' : G.red} /></svg>
}
export const LAYERS = [
  { a: 'air', t: 'Air handling', s: 'The unit and its duct above the ceiling' },
  { a: 'ceiling', t: 'Fan filter units', s: 'A full grid, light panels between' },
  { a: 'walls', t: 'Walls and tools', s: 'A door, a pass box and a viewing window' },
  { a: 'floor', t: 'Raised floor', s: 'Perforated tiles on pedestals' },
]
/* onRed: the white line drawing straight on field red (30 Sep, evening: "no weird white"), white leaders, names and icons */
export function Build({ x, y, h, lx, size, sub, subW, lw, gap, isw = 1, titleColor = G.ink, subColor = G.tx2, icons = true, onRed }) {
  const [, , vw, vh] = vbOf('build'), k = h / vh, ic = size * 1.55, tx = icons ? lx + ic + size * 0.45 : lx
  if (onRed) { titleColor = '#fff'; subColor = 'rgba(255,255,255,.86)' }
  return (
    <g>
      <IsoC k={onRed ? 'build-w' : 'build'} x={x} y={y} h={h} isw={isw} />
      {LAYERS.map(L => {
        const [ax, ay] = ISO_C.build.anchors[L.a], X = x + ax * k + gap, Y = y + ay * k
        return (
          <g key={L.a}>
            <rect x={X} y={Y - lw / 2} width={Math.max(0, lx - gap - X)} height={lw} fill={onRed ? 'rgba(255,255,255,.75)' : G.lead} />
            {icons && <LayerIc k={L.a} x={lx} y={Y - ic / 2 - size * 0.06} s={ic} onRed={onRed} />}
            <text x={tx} y={Y + size * 0.34} fontFamily={FS} fontWeight="600" fontSize={size} fill={titleColor} letterSpacing={-0.02 * size}>{L.t}</text>
            {sub && <text x={tx} y={Y + size * 0.34 + sub * 1.45} fontFamily={FI} fontWeight="400" fontSize={sub} fill={subColor}>{L.s}</text>}
          </g>
        )
      })}
    </g>
  )
}

/* ================================================================ the stand */

/* 1, the aisle column, 310 × 3472: the wordmark across the top, then one bay of the same cleanroom with its four layers
   lifted far apart, tall and narrow (the tower crane was drawn first and read too thin from the aisle: tools/booth-cleanroom-0930.mjs
   still builds it), above the red line */
export function W1C({ zones, bleed }) {
  const w = 310, h = 3472, mw = 230, cw = 286, [, , vw, vh] = vbOf('stack'), ch = cw * vh / vw
  return (
    <Svg w={w} h={h} label="Wall 1, the aisle column, Direction C" bleed={bleed} bleedFill={G.light}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={G.light} />
      <MarkB x={40} y={150} w={mw} tone="light" />
      <IsoC k="stack" x={(w - cw) / 2} y={LINE_Y - ch - 90} w={cw} isw={2} />
      <Line x={-10} y={LINE_Y} w={w + 20} t={LINE_T} fill={G.red} />
      {zones && <Zones w={w} h={h} zones={zones} />}
    </Svg>
  )
}

/* 30 Sep, C2 "Isometric cleanroom, red front" (Bazil: "i like direction C the most", "but the front panel do a new version
   that is red"): Direction C with its front panel, the aisle column that faces the aisle, in field red: the white IAQ at the
   top, the six services as a loop drawn white (ProcessColumn, as on A's column), the white seven lines at its foot (white
   only because the ground is IAQ red). Every other C2 piece is C's own */
export function W1C2({ zones, bleed }) {
  const w = 310, h = 3472, mw = 230, sh = letterH(mw)
  return (
    <Svg w={w} h={h} label="Wall 1, the aisle column, Direction C2, red front" bleed={bleed} bleedFill="#C8161D">
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill="#C8161D" />
      <MarkFlat x={40} y={150} w={mw} />
      <ProcessColumn top={420} bottom={2990} />
      <Seven x={-10} y={h - FOOT - sh} w={w + 20} h={sh} />
      {zones && <Zones w={w} h={h} zones={zones} />}
    </Svg>
  )
}

/* 30 Sep, C3 "Isometric cleanroom, red back wall" (Bazil: "this new 3D looking one looks good, so have it as a good
   variation", "but I do know the backdrop should be red background"): Direction C with two changes, the side wall and the
   counter C's own.
   The aisle column: C's light ground, the IAQ at the top, the six services as a loop in C's own style (the simple objects
     in their greys, the names in black, one red line down with plain chevrons that turns back up to Design).
   The back wall: field red, the white IAQ big and centred over the 1736 visible, the title centred in white, the raised
     screen, C's cleanroom being built on a white block on the screen's edges with its layers named, and at its foot a white
     dot world map with the offices beside four figures; the zone line white */
export function W1C3({ zones, bleed }) {
  const w = 310, h = 3472, mw = 230
  return (
    <Svg w={w} h={h} label="Wall 1, the aisle column, Direction C3" bleed={bleed} bleedFill={G.light}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={G.light} />
      <MarkB x={40} y={150} w={mw} tone="light" />
      <ProcessColumn top={420} bottom={2860} set="s" line={G.red} ink={G.ink} isw={1.3} />
      <Line x={-10} y={LINE_Y} w={w + 20} t={LINE_T} fill={G.red} />
      {zones && <Zones w={w} h={h} zones={zones} />}
    </Svg>
  )
}
export function W3C3({ zones, bleed, print, still = '/booth/screen-still.webp' }) {
  /* 30 Sep, evening (Bazil: "no need the assembly for this one"): no white block under the screen. The IAQ, the title, the
     raised screen, then the white dot world map across the screen's width and the four figures larger under it; nothing
     readable under 300 mm; the line white */
  const w = 2046, h = 3472, vis = 1736, cx = vis / 2, S = SCREEN3, mw = 720, mh = markHB(mw)
  const mapX = S.x, mapW = S.w, mapY = S.y + S.h + 90
  const fy = mapY + mapH(mapW) + 150, colW = S.w / 2
  const FIG = [['31', 'years building controlled environments'], ['1,050,000 m\u00b2', 'of cleanroom built'], ['7', 'countries with an IAQ office, Germany among them'], ['450', 'people, group wide']]
  return (
    <Svg w={w} h={h} label="Wall 3, the screen wall, Direction C3" bleed={bleed} bleedFill="#C8161D">
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill="#C8161D" />
      <MarkB x={cx - mw / 2} y={110} w={mw} tone="white" />
      <H x={cx} y={110 + mh + 150} size={108} fill={G.white} anchor="middle">From the first drawing</H>
      <H x={cx} y={110 + mh + 270} size={108} fill={G.white} anchor="middle">to a proven cleanroom.</H>
      <ScreenStill print={print} still={still} frame="#1B1B1B" />
      <DotMap x={mapX} y={mapY} w={mapW} label={1.25} dot="rgba(255,255,255,.34)" ink={G.white} sub="rgba(255,255,255,.8)" hl={G.white} />
      {FIG.map(([v, l], i) => {
        const x = S.x + (i % 2) * colW, y = fy + Math.floor(i / 2) * 250
        return (
          <g key={v}>
            <text x={x} y={y} fontFamily={FS} fontWeight="600" fontSize="96" fill={G.white} letterSpacing="-2">{v}</text>
            <Txt x={x} y={y + 22} w={colW - 60} h={90} size={34} lh={1.28} color="rgba(255,255,255,.9)">{l}</Txt>
          </g>
        )
      })}
      <Line x={-10} y={LINE_Y} w={w + 20} t={LINE_T} fill={G.white} />
      {zones && <><Zones w={vis} h={h} zones={zones} /><HiddenNote /></>}
    </Svg>
  )
}

/* 2, the side wall, 2852 × 3472: the figure, the statement, the cleanroom being built drawn large with its layers named */
export function W2C({ zones, bleed }) {
  const w = 2852, h = 3472, m = 150
  return (
    <Svg w={w} h={h} label="Wall 2, the side wall, Direction C" bleed={bleed} bleedFill={G.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={G.white} />
      <MarkB x={m} y={130} w={WALL_MARK} tone="light" />
      <H x={m} y={530} size={150} fill={G.ink}>1,050,000 m² of cleanroom,</H>
      <H x={m} y={690} size={150} fill={G.red}>built layer by layer.</H>
      <Build x={m - 40} y={860} h={2000} lx={1660} size={76} sub={44} lw={3} gap={40} isw={1.6} />
      <Line x={-10} y={LINE_Y} w={w + 20} t={LINE_T} fill={G.red} />
      <T x={w - m} y={LINE_Y + 110} size={52} weight={500} font={FS} fill={G.ink} anchor="end">iaqtechnology.com.my</T>
      {zones && <Zones w={w} h={h} zones={zones} />}
    </Svg>
  )
}

/* 3, the back wall, 2046 × 3472, 1736 visible: the statement, the raised screen, the three units on the screen's edges
   under it, each with its isometric object (EPC carries the cleanroom) */
const UNITS3C = [
  { k: 'EPC', iso: 'cleanroom', t: 'Builds cleanrooms and the facility.' },
  { k: 'PCU & TTI', iso: 'hookup', t: UNIT_LINE['PCU & TTI'] },
  { k: 'EFM', iso: 'maintain', t: UNIT_LINE.EFM },
]
export function W3C({ zones, bleed, print, still = '/booth/screen-still.webp' }) {
  const w = 2046, h = 3472, vis = 1736, m = 150, U = UNITS3, cw = U.w / 3
  return (
    <Svg w={w} h={h} label="Wall 3, the screen wall, Direction C" bleed={bleed} bleedFill={G.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={G.white} />
      <MarkB x={m} y={130} w={WALL_MARK} tone="light" />
      <H x={m} y={530} size={150} fill={G.ink}>Cleanrooms,</H>
      <H x={m} y={690} size={150} fill={G.red}>built to class.</H>
      <ScreenStill print={print} still={still} />
      {UNITS3C.map((u, i) => {
        const x = U.x + i * cw
        return (
          <g key={u.k}>
            <Iso k={u.iso} x={x - 20} y={U.y + 20} w={214} isw={1.3} />
            <T x={x} y={U.y + 300} size={72} weight={600} font={FS} fill={G.ink}>{u.k}</T>
            <Txt x={x} y={U.y + 322} w={cw - 50} h={140} size={36} lh={1.3} color={G.tx2}>{u.t}</Txt>
          </g>
        )
      })}
      <Line x={-10} y={LINE_Y} w={w + 20} t={LINE_T} fill={G.red} />
      {zones && <><Zones w={vis} h={h} zones={zones} /><HiddenNote /></>}
    </Svg>
  )
}

/* 4, the counter front, 600 × 1170, 170 mm radius top right: the statement, the code, the finished cleanroom, the line */
export function CounterC({ zones, bleed }) {
  const w = 600, h = 1170, r = 170, mw = 260
  const shape = `M0 0H${w - r}A${r} ${r} 0 0 1 ${w} ${r}V${h}H0Z`
  const shapeB = `M-10 -10H${w - r}A${r + 10} ${r + 10} 0 0 1 ${w + 10} ${r}V${h + 10}H-10Z`
  return (
    <Svg w={w} h={h} label="Counter front, Direction C" bleed={bleed}>
      <defs><clipPath id="bcCt"><path d={bleed ? shapeB : shape} /></clipPath></defs>
      <g clipPath="url(#bcCt)">
        <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={G.white} />
        <MarkB x={60} y={70} w={mw} tone="light" />
        <H x={60} y={300} size={54} fill={G.ink}>Cleanrooms,</H>
        <H x={60} y={362} size={54} fill={G.red}>built to class.</H>
        {/* 30 Sep, evening (Bazil: "bigger size QR"): 270 mm, 9.3 mm a module; its line and the finished cleanroom beside it */}
        <Qr x={60} y={430} s={270} />
        <Txt x={362} y={426} w={178} h={140} size={26} lh={1.35} color={G.tx2}>Scan for the 3D story, the services and the projects.</Txt>
        <Iso k="cleanroom" x={364} y={566} w={176} isw={2.2} />
        <Line x={60} y={790} w={480} t={lineT(mw)} fill={G.red} />
        <T x={60} y={846} size={26} weight={500} font={FS} fill={G.ink}>{QR_URL}</T>
      </g>
      {!bleed && <path d={shape} fill="none" stroke="#DCE2EC" strokeWidth="3" className="bt-bleedline" />}
      {zones && <Zones w={w} h={h} zones={zones} />}
    </Svg>
  )
}

/* ================================================================ print collateral */

/* the leaflet, A5 148 × 210. Front: the statement, the cleanroom being built with its layers named, the show, the code */
export function FlyerFrontC({ bleed }) {
  const w = 148, h = 210, mw = 34
  return (
    <Svg w={w} h={h} label="Leaflet, Direction C, front" bleed={bleed} bleedFill={G.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={G.white} />
      <MarkB x={12} y={12} w={mw} tone="light" />
      <H x={12} y={40} size={8.6} fill={G.ink}>Cleanrooms,</H>
      <H x={12} y={50.5} size={8.6} fill={G.red}>built layer by layer.</H>
      <Txt x={12} y={55} w={120} h={12} size={3.3} lh={1.42} color={G.tx2}>IAQ designs, builds and commissions cleanrooms and the facilities around them, then hooks up the tools inside and keeps them running.</Txt>
      <Build x={9} y={68} h={88} lx={76} size={3.6} sub={2.5} lw={0.22} gap={2.4} isw={2.4} />
      <H x={12} y={167} size={4.8} fill={G.ink}>Meet IAQ at SEMICON Europa 2026</H>
      <T x={12} y={173.5} size={3.3} fill={G.tx2}>Messe München, 10 to 13 November</T>
      <T x={12} y={178.5} size={3.3} fill={G.tx2}>Stand to confirm</T>
      <Qr x={112} y={160} s={24} />
      <Line x={12} y={186} w={124} t={lineT(mw)} fill={G.red} />
      <T x={12} y={195} size={3.2} weight={500} font={FS} fill={G.ink}>iaqtechnology.com.my</T>
      <T x={136} y={195} size={3.2} weight={500} font={FS} fill={G.ink} anchor="end">business@iaqtechnology.com.my</T>
    </Svg>
  )
}
/* back: the three units with their objects, the record on a light band, Dresden and headquarters, the stand contact slot */
export function FlyerBackC({ bleed }) {
  const w = 148, h = 210
  const U = [{ ...UNITS[0], iso: 'cleanroom' }, UNITS[1], UNITS[2]]
  return (
    <Svg w={w} h={h} label="Leaflet, Direction C, back" bleed={bleed} bleedFill={G.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={G.white} />
      <MarkB x={12} y={10} w={20} tone="light" />
      <H x={12} y={30} size={7.4} fill={G.ink}>Three units,</H>
      <H x={12} y={39} size={7.4} fill={G.red}>one accountable team.</H>
      {U.map((u, i) => {
        const y = 50 + i * 23
        return (
          <g key={u.k}>
            <Iso k={u.iso} x={10.5} y={y - 1} w={22} isw={2.2} />
            <H x={38} y={y + 4.6} size={4.4} fill={G.ink}>{u.k}</H>
            <T x={38} y={y + 8.8} size={2.7} weight={500} font={FS} fill={G.tx2}>{u.full}</T>
            <Txt x={38} y={y + 10.2} w={98} h={10} size={3} lh={1.36} color={G.tx2}>{u.t}</Txt>
          </g>
        )
      })}
      <rect x="-10" y="120" width={w + 20} height="34" fill={G.light} />
      {PROOF.map(([n, l], i) => {
        const x = 12 + (i % 2) * 64, y = 131.5 + Math.floor(i / 2) * 14
        return (
          <g key={n}>
            <H x={x} y={y} size={7} fill={G.ink}>{n}</H>
            <T x={x} y={y + 4.4} size={2.7} fill={G.tx2}>{l}</T>
          </g>
        )
      })}
      <H x={12} y={166} size={3.4} fill={G.ink}>IAQ Engineering (DE) GmbH, Dresden</H>
      <Txt x={12} y={168} w={58} h={10} size={2.9} lh={1.45} color={G.tx2}>8. OG, Budapester Straße 5, 01069 Dresden<br />+49 351 4387 9529</Txt>
      <H x={12} y={184} size={3.4} fill={G.ink}>Headquarters, Shah Alam, Malaysia</H>
      <Txt x={12} y={186} w={58} h={10} size={2.9} lh={1.45} color={G.tx2}>+603 5124 8319<br />business@iaqtechnology.com.my</Txt>
      <H x={76} y={166} size={3.4} fill={G.ink}>Your contact</H>
      <Txt x={76} y={168} w={30} h={10} size={2.9} lh={1.45} color={G.tx2}>Contact details to follow from IAQ</Txt>
      <Qr x={112} y={164} s={24} />
      <T x={112} y={196} size={3} weight={600} font={FS} fill={G.ink}>Book a meeting</T>
    </Svg>
  )
}

/* the roll-up, 850 × 2000: the wordmark, the statement, IAQ's exploded fab with its four layers named, the line at 1633 */
export function RollUpC({ bleed }) {
  const w = 850, h = 2000, m = 85, mw = 425, fw = 660
  const [, , vw, vh] = vbOf('fab')
  return (
    <Svg w={w} h={h} label="Roll-up, Direction C" bleed={bleed} bleedFill={G.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={G.white} />
      <MarkB x={m} y={102} w={mw} tone="light" />
      <H x={m} y={470} size={96} fill={G.ink}>Cleanrooms,</H>
      <H x={m} y={572} size={96} fill={G.red}>built to class.</H>
      <Txt x={m} y={604} w={w - 2 * m} h={150} size={32} lh={1.38} color={G.tx2}>Cleanrooms and the facility around them, designed, built, hooked up and maintained by one IAQ team since 1995.</Txt>
      <IsoC k="fab" x={(w - fw) / 2} y={1612 - fw * vh / vw} w={fw} isw={1.2} />
      <Line x={m} y={1633} w={w - 2 * m} t={lineT(mw)} fill={G.red} />
      <T x={m} y={1690} size={28} weight={500} font={FS} fill={G.ink}>iaqtechnology.com.my</T>
      <T x={w - m} y={1690} size={28} weight={500} font={FS} fill={G.ink} anchor="end">Shah Alam and Dresden</T>
    </Svg>
  )
}

/* ================================================================ digital (px) */

/* LinkedIn, four posts at 1080 × 1350: the wordmark, the statement, one line, one drawing (or the stand), the action, the
   line above the foot */
function PostC({ label, h1, h2, lede, art, act, after, footL, footR }) {
  const w = 1080, h = 1350, m = 80, mw = 200
  return (
    <Svg w={w} h={h} label={label}>
      <rect width={w} height={h} fill={G.white} />
      <MarkB x={m} y={80} w={mw} tone="light" />
      <H x={m} y={300} size={96} fill={G.ink}>{h1}</H>
      <H x={m} y={400} size={96} fill={G.red}>{h2}</H>
      <Txt x={m} y={432} w={w - 2 * m} h={96} size={34} lh={1.36} color={G.tx2}>{lede}</Txt>
      {art}
      {act && <Act x={m} y={1062} w={w - 2 * m} h={80} size={30} t={act} after={after} afterColor={G.tx2} />}
      <Line x={m} y={1190} w={w - 2 * m} t={lineT(mw)} fill={G.red} />
      {footL && <T x={m} y={1250} size={28} weight={500} font={FS} fill={G.ink}>{footL}</T>}
      {footR && <T x={w - m} y={1250} size={28} weight={500} font={FS} fill={G.ink} anchor="end">{footR}</T>}
    </Svg>
  )
}
const still = src => <image href={src} x="0" y="540" width="1080" height="480" preserveAspectRatio="xMidYMid slice" />
export const Post1C = () => <PostC label="LinkedIn post 1, three weeks out, Direction C" h1="Meet IAQ" h2="in Munich." lede={'SEMICON Europa 2026, Messe München, 10 to 13 November.'}
  art={<Build x={70} y={548} h={480} lx={470} size={32} lw={1.5} gap={16} isw={1} />} act="Book a meeting" after="Stand to confirm" footL="iaqtechnology.com.my/semicon" />
export const Post2C = () => <PostC label="LinkedIn post 2, one week out, Direction C" h1="From Shah Alam" h2="to Dresden." lede="Offices in seven countries, and a team in Germany: IAQ Engineering (DE) GmbH, Dresden."
  art={<Iso k="cleanroom" x={290} y={560} w={500} isw={1} />} footL="Messe München, 10 to 13 November" footR="iaqtechnology.com.my/semicon" />
export const Post3C = ({ photo = '/booth/still-post3-c.webp' }) => <PostC label="LinkedIn post 3, opening day, Direction C" h1="The stand" h2="is open." lede="See a cleanroom built layer by layer, on the stand and on the screen."
  art={still(photo)} act="Find us at the stand" after="Messe München" footL="iaqtechnology.com.my/semicon" />
export const Post4C = ({ photo = '/booth/still-post4-c.webp' }) => <PostC label="LinkedIn post 4, thank you, Direction C" h1="Thank you," h2="Munich." lede="Four days of briefs and conversations. Every one gets an answer within one working day."
  art={still(photo)} footL="SEMICON Europa 2026" footR="iaqtechnology.com.my" />

/* web ads, four sizes: white, the wordmark, the statement, one drawing, one red action */
export function AdC({ size }) {
  const [w, h] = size
  const head = (x, ys, s) => <><H x={x} y={ys[0]} size={s} fill={G.ink}>Cleanrooms,</H><H x={x} y={ys[1]} size={s} fill={G.red}>built to class.</H></>
  const frame = <rect width={w} height={h} fill={G.white} />
  if (w > h * 3) return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}, Direction C`}>
      {frame}
      <MarkB x={20} y={24} w={100} tone="light" />
      <H x={148} y={42} size={20} fill={G.ink}>Cleanrooms, <tspan fill={G.red}>built to class.</tspan></H>
      <T x={148} y={64} size={12.5} fill={G.tx2}>SEMICON Europa, Messe München, 10 to 13 Nov</T>
      <Act x={540} y={27} w={168} h={40} size={14} t="Book a meeting" end />
    </Svg>
  )
  if (h > w * 3) return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}, Direction C`}>
      {frame}
      <MarkB x={16} y={24} w={128} tone="light" />
      {head(16, [122, 144], 19)}
      <IsoC k="build" x={14} y={176} w={132} isw={0.7} />
      <Txt x={16} y={384} w={w - 32} h={60} size={13} lh={1.35} color={G.tx2}>SEMICON Europa, Munich, 10 to 13 Nov</Txt>
      <Act x={16} y={450} w={w - 32} h={34} size={13} t="Book a meeting" />
    </Svg>
  )
  if (h > w * 1.5) return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}, Direction C`}>
      {frame}
      <MarkB x={24} y={28} w={120} tone="light" />
      {head(24, [146, 184], 34)}
      <Txt x={24} y={204} w={w - 48} h={60} size={15} lh={1.4} color={G.tx2}>Meet IAQ at SEMICON Europa, Messe München, 10 to 13 November.</Txt>
      <IsoC k="build" x={50} y={272} h={220} isw={0.8} />
      <Act x={24} y={514} w={w - 48} h={40} size={16} t="Book a meeting" />
    </Svg>
  )
  return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}, Direction C`}>
      {frame}
      <MarkB x={20} y={18} w={86} tone="light" />
      {head(20, [92, 120], 25)}
      <Iso k="cleanroom" x={186} y={34} w={100} isw={1} />
      <T x={20} y={170} size={13} fill={G.tx2}>SEMICON Europa, Munich, 10 to 13 Nov</T>
      <Act x={20} y={188} w={w - 40} h={36} size={14} t="Book a meeting" />
    </Svg>
  )
}

/* the email signature banner, 600 × 150: white, the wordmark, the show, the finished cleanroom */
export function SignatureC() {
  const w = 600, h = 150
  return (
    <Svg w={w} h={h} label="Email signature banner, Direction C">
      <rect width={w} height={h} fill={G.white} />
      <MarkB x={24} y={24} w={86} tone="light" />
      <H x={24} y={96} size={19} fill={G.ink}>Meet IAQ at SEMICON Europa</H>
      <T x={24} y={119} size={12.5} fill={G.tx2}>Messe München, 10 to 13 November, stand to confirm</T>
      <Iso k="cleanroom" x={446} y={8} w={140} isw={1} />
    </Svg>
  )
}

export const ART_C = { 'w1-c': W1C, 'w2-c': W2C, 'w3-c': W3C, 'ct-c': CounterC, 'w1-c2': W1C2, 'w1-c3': W1C3, 'w3-c3': W3C3 }
export const POSTS_C = { post1: Post1C, post2: Post2C, post3: Post3C, post4: Post4C }
const ADS_C = [[300, 250], [728, 90], [300, 600], [160, 600]]
/* every Direction C piece, for the standalone renderer (/booth/art/:id) and the PNG, print and texture exports */
export const PIECES_C = {
  'w1-c': { C: W1C, w: 310, h: 3472, unit: 'mm', k: 'Wall 1, aisle column, Direction C', print: true },
  'w2-c': { C: W2C, w: 2852, h: 3472, unit: 'mm', k: 'Wall 2, side wall, Direction C', print: true },
  'w3-c': { C: W3C, w: 2046, h: 3472, unit: 'mm', k: 'Wall 3, the screen wall, Direction C', print: true },
  'ct-c': { C: CounterC, w: 600, h: 1170, unit: 'mm', k: 'Counter front, Direction C', print: true },
  flyerC1: { C: FlyerFrontC, w: 148, h: 210, unit: 'mm', k: 'Leaflet, Direction C, front', print: true },
  flyerC2: { C: FlyerBackC, w: 148, h: 210, unit: 'mm', k: 'Leaflet, Direction C, back', print: true },
  rollC: { C: RollUpC, w: 850, h: 2000, unit: 'mm', k: 'Roll-up, Direction C', print: true },
  'post1-c': { C: Post1C, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 1, three weeks out, Direction C' },
  'post2-c': { C: Post2C, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 2, one week out, Direction C' },
  'post3-c': { C: Post3C, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 3, opening day, Direction C' },
  'post4-c': { C: Post4C, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 4, thank you, Direction C' },
  'sig-c': { C: SignatureC, w: 600, h: 150, unit: 'px', k: 'Email signature, Direction C' },
  ...Object.fromEntries(ADS_C.map(s => ['ad' + s.join('x') + '-c', { C: p => <AdC size={s} {...p} />, w: s[0], h: s[1], unit: 'px', k: `Web ad ${s[0]} × ${s[1]}, Direction C` }])),
}
/* C2 has one piece of its own, the red front; its other pieces are C's (sets.js) */
export const PIECES_C2 = {
  'w1-c2': { C: W1C2, w: 310, h: 3472, unit: 'mm', k: 'Wall 1, aisle column, Direction C2, red front', print: true },
}
/* C3 has two pieces of its own, the loop column and the red back wall; its other pieces are C's (sets.js) */
export const PIECES_C3 = {
  'w1-c3': { C: W1C3, w: 310, h: 3472, unit: 'mm', k: 'Wall 1, aisle column, Direction C3, the loop', print: true },
  'w3-c3': { C: W3C3, w: 2046, h: 3472, unit: 'mm', k: 'Wall 3, the screen wall, Direction C3, red', print: true },
}
