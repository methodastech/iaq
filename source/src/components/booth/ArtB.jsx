import React, { useId } from 'react'
import { Svg, Zones, Qr, UNIT_LINE, SCREEN3, UNITS3, ScreenStill, HiddenNote } from './Art.jsx'
import { QR_URL } from '../../data/boothQr.js'
import { MARK_VB, MARK_RED, MARK_REG } from '../../assets/booth/iaq-mark-paths.js'
import { ISO_SET } from '../../assets/booth/iso-set-0929.js'

/* ============================================================================
   The SEMICON Europa 2026 artwork, Direction B: "Navy statement" (29 Sep 2026).
   Bazil: "complete the exhibition with 2 choices of direction". Direction A is Art.jsx (white cleanroom ground,
   the exploded fab, the logo's stripes, the navy plinth). Direction B is built from the earlier B pieces (the full
   navy roll-up, one statement) and set on the IAQ Design tab system decided on 29 Sep (public/design/apps.css,
   tools/design-apps/elements.html and applications.html):

   the ground: IAQ navy #17213A in the calm square pattern, tone on tone (#1F2C4B grid; square 78 %, gap 22 % of the
     pitch; 25 mm on the walls, a sixtieth of the width elsewhere, 8 px at least on screen)
   the wordmark top left on the margin (big across the top on the aisle column), as IAQ's dark file: red letters,
     white ®; the all white file on red. No white panel (the Design tab's rule, which replaces booth.js's panel rule)
   one statement per surface in Switzer 600, sentence case, one phrase in IAQ red
   the seven lines, the wordmark's own rows (18.4 23.6 25.8 26.3 25.8 23.6 18.4 on gaps of 8.3), full width at the
     foot of the three walls only, as tall as the wordmark's letters there, white on navy and red. The walls share one
     wordmark size, so the lines stand at one height round the zone, the way A's plinth does
   every other piece takes the one long line above its foot: 1.2 % of the wordmark's width, white on navy, red on white
   the working detail on a white block, with the Design tab's isometric objects (tools/booth-iso-0929.mjs)
   one wide IAQ photograph per piece on the leaflet, the roll-up and the digital pieces, in its own block, never under
     type; none on the walls (no photograph is sharp enough at 3.5 m and 150 ppi)
   Switzer for headlines, names and labels; Instrument Sans for sentences. No capitals outside a slim box, no
     numbering, no dots, no middle dots, no dot map, no stripes as a marker.
   Every piece is an SVG whose viewBox is its real size (mm for print, px for screens), as in Art.jsx.
   ============================================================================ */

export const N = { navy: '#17213A', sq: '#1F2C4B', red: '#EC2027', white: '#FFFFFF', ink: '#231F20', tx2: '#5A5F6B', cool: '#C5CCD9', tint: '#F1F3F6' }
export const FS = "'Switzer','Instrument Sans',system-ui,sans-serif"
export const FI = "'Instrument Sans','Switzer',system-ui,sans-serif"
const AR = MARK_VB[2] / MARK_VB[3]
export const markHB = w => w / AR
/* the height of the wordmark's letters (the I, top to foot), read off the traced mark: 92.7 % of its box */
export const letterH = w => markHB(w) * 0.927
/* the long line: a quarter of a wordmark bar, 1.2 % of the lockup's width, which is the traced mark's width */
export const lineT = w => w * 0.012

/* ---------------------------------------------------------------- parts */
/* the wordmark as IAQ's dark file (red letters, white ®), the all white file, or (30 Sep) the light file for white grounds
   (red letters, black ®) */
export function MarkB({ x, y, w, tone = 'dark' }) {
  return (
    <svg x={x} y={y} width={w} height={markHB(w)} viewBox={MARK_VB.join(' ')}>
      <path fill={tone === 'white' ? '#fff' : '#E30613'} fillRule="evenodd" d={MARK_RED} />
      <path fill={tone === 'light' ? '#1D1D1B' : '#fff'} fillRule="evenodd" d={MARK_REG} />
    </svg>
  )
}

/* the square pattern: squares of the ground colour on a grid one tone lighter, aligned to the piece's corner */
export function Squares({ x = -10, y = -10, w, h, p }) {
  const id = 'bsq' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const g = p * 0.22
  return (
    <g>
      <defs>
        <pattern id={id} width={p} height={p} patternUnits="userSpaceOnUse" x="0" y="0">
          <rect width={p} height={p} fill={N.sq} />
          <rect x={g} y={g} width={p - g} height={p - g} fill={N.navy} />
        </pattern>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
    </g>
  )
}

/* the seven lines: the wordmark's rows in their own proportion, full width */
export const BARS = [18.4, 23.6, 25.8, 26.3, 25.8, 23.6, 18.4], GAP = 8.3, TOT = BARS.reduce((a, b) => a + b, 0) + GAP * 6
export function Seven({ x, y, w, h, fill = '#fff' }) {
  const k = h / TOT
  let yy = y
  return <g fill={fill}>{BARS.map((b, i) => { const r = <rect key={i} x={x} y={yy} width={w} height={b * k} />; yy += (b + GAP) * k; return r })}</g>
}
export const Line = ({ x, y, w, t, fill = '#fff' }) => <rect x={x} y={y} width={w} height={t} fill={fill} />

/* one of the Design tab's isometric objects; --isw thickens its lines on small print */
export function Iso({ k, x, y, w, isw = 1 }) {
  const o = ISO_SET[k]
  const [, , vw, vh] = o.vb.split(' ').map(Number)
  return <svg x={x} y={y} width={w} height={w * vh / vw} viewBox={o.vb} style={{ '--isw': isw }} dangerouslySetInnerHTML={{ __html: o.inner }} />
}
export const isoH = (k, w) => { const [, , vw, vh] = ISO_SET[k].vb.split(' ').map(Number); return w * vh / vw }

/* a photograph in its own block, cropped to fill it */
export const Photo = ({ href, x, y, w, h, at = 'xMidYMid' }) => <image href={href} x={x} y={y} width={w} height={h} preserveAspectRatio={`${at} slice`} />

/* a headline line: Switzer 600, tracked in by 2.4 % */
export const H = ({ x, y, size, fill = '#fff', anchor, children }) => <text x={x} y={y} textAnchor={anchor} fontFamily={FS} fontWeight="600" fontSize={size} fill={fill} letterSpacing={-0.024 * size}>{children}</text>
/* one line of Switzer 500 or Instrument Sans */
export const T = ({ x, y, size, fill = N.cool, weight = 400, font = FI, anchor, children }) => <text x={x} y={y} textAnchor={anchor} fontFamily={font} fontWeight={weight} fontSize={size} fill={fill}>{children}</text>

/* wrapped text (foreignObject). Small sizes (mm) are laid out ten times larger in a nested viewBox and drawn back
   down, so the lines keep their true pitch on screen and in the PDF. Lines balance by default, so no block ends on a
   runt (every block here is three lines or fewer) */
export function Txt({ x, y, w, h, size, lh = 1.4, color = N.cool, weight = 400, font = FI, children, wrap = 'balance' }) {
  const K = size < 20 ? 10 : 1
  return (
    <svg x={x} y={y} width={w} height={h} viewBox={`0 0 ${w * K} ${h * K}`} overflow="visible" className="bb-txt">
      <foreignObject x="0" y="0" width={w * K} height={h * K}>
        <div xmlns="http://www.w3.org/1999/xhtml" style={{ font: `${weight} ${size * K}px/${lh} ${font}`, color, textWrap: wrap }}>{children}</div>
      </foreignObject>
    </svg>
  )
}

/* the one action: an IAQ slim box (square, one line, 0.62 em above and below, 1.05 em each side), with anything beside
   it on its baseline, 1.2 em to its right */
export function Act({ x, y, w, h, size, t, bg = N.red, color = '#fff', after, afterColor = N.cool, end }) {
  const K = size < 20 ? 10 : 1
  return (
    <svg x={x} y={y} width={w} height={h} viewBox={`0 0 ${w * K} ${h * K}`} overflow="visible" className="bb-act">
      <foreignObject x="0" y="0" width={w * K} height={h * K}>
        <div xmlns="http://www.w3.org/1999/xhtml" style={{ display: 'flex', alignItems: 'baseline', justifyContent: end ? 'flex-end' : 'flex-start', gap: '1.2em', font: `600 ${size * K}px/1 ${FS}`, whiteSpace: 'nowrap' }}>
          <span style={{ background: bg, color, padding: '.62em 1.05em .64em' }}>{t}</span>
          {after && <span style={{ fontWeight: 500, color: afterColor }}>{after}</span>}
        </div>
      </foreignObject>
    </svg>
  )
}

export const PHOTO = { cleanroom: '/assets/iaq/cr-ballroom-8578.webp', team: '/design/photos/back-wide.jpg' }
export const UNITS = [
  { k: 'EPC', iso: 'construct', full: 'Engineering, Procurement and Construction', t: 'Cleanrooms and the whole facility: EPCC, or EPCM for the largest programmes.' },
  { k: 'PCU & TTI', iso: 'hookup', full: 'Process Critical Utilities & Total Tool Installation', t: 'Bulk gas, chemical, water and exhaust systems, then each tool connected, inside a fab that keeps running.' },
  { k: 'EFM', iso: 'maintain', full: 'Energy Facility Management', t: 'Runs and maintains the plant, and brings its energy bill down.' },
]
export const PROOF = [
  ['31', 'years building controlled environments'],
  ['7', 'countries with an IAQ office, Germany among them'],
  ['250+', 'projects completed'],
  ['1,050,000 m²', 'of cleanroom built'],
]
/* the fab around the cleanroom, as the Design tab's system objects */
export const SYSTEMS = [['cleanroom', 'Cleanroom'], ['utilities', 'Process utilities'], ['air', 'Air handling'], ['electrical', 'Electrical'], ['fire', 'Fire protection'], ['building', 'The building']]

/* the walls share one wordmark size, so the seven lines stand at one height and one level round the zone. 30 Sep: 520 (was
   700), the grid every back wall now shares with its side wall, so the statement fits above the raised screen */
export const WALL_MARK = 520, FOOT = 150

/* ================================================================ the stand */

/* 1, the aisle column, 310 × 3472: the Design tab's totem. IAQ red, the white wordmark across the top, the seven
   lines in white at the foot */
export function W1B({ zones, bleed }) {
  const w = 310, h = 3472, mw = 230, sh = letterH(mw)
  return (
    <Svg w={w} h={h} label="Wall 1, the aisle column, Direction B" bleed={bleed} bleedFill="#C8161D">
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill="#C8161D" />   {/* 30 Sep: field red, the large-area red */}
      <MarkB x={40} y={150} w={mw} tone="white" />
      <Seven x={-10} y={h - FOOT - sh} w={w + 20} h={sh} />
      {zones && <Zones w={w} h={h} zones={zones} />}
    </Svg>
  )
}

/* 2, the side wall, 2852 × 3472: the statement, the fab around the cleanroom on a white block, the record */
export function W2B({ zones, bleed }) {
  const w = 2852, h = 3472, m = 150, sh = letterH(WALL_MARK)
  const bx = m, by = 820, bw = w - 2 * m, bh = 520, pad = 70, slot = (bw - 2 * pad) / 6, ow = 300
  return (
    <Svg w={w} h={h} label="Wall 2, the side wall, Direction B" bleed={bleed} bleedFill={N.navy}>
      <Squares w={w + 20} h={h + 20} p={25} />
      <MarkB x={m} y={130} w={WALL_MARK} />
      <H x={m} y={530} size={150}>The cleanroom, and</H>
      <H x={m} y={690} size={150} fill={N.red}>the whole fab around it.</H>
      <rect x={bx} y={by} width={bw} height={bh} fill="#fff" />
      {SYSTEMS.map(([k, l], i) => {
        const ox = bx + pad + i * slot + (slot - ow) / 2
        return (
          <g key={k}>
            <Iso k={k} x={ox} y={by + 40} w={ow} isw={1.6} />
            <T x={ox} y={by + 420} size={44} weight={600} font={FS} fill={N.ink}>{l}</T>
          </g>
        )
      })}
      {PROOF.map(([n, l], i) => {
        const x = m + (i % 2) * (bw / 2), y = 1640 + Math.floor(i / 2) * 300
        return (
          <g key={n}>
            <H x={x} y={y} size={150}>{n}</H>
            <T x={x} y={y + 80} size={50}>{l}</T>
          </g>
        )
      })}
      <Seven x={-10} y={h - FOOT - sh} w={w + 20} h={sh} fill={N.red} />   {/* 30 Sep (Bazil: "not 7 white lines on navy", "only when red is background", "and as red lines") */}
      {zones && <Zones w={w} h={h} zones={zones} />}
    </Svg>
  )
}

/* 3, the back wall, 2046 × 3472, 1736 visible. 30 Sep, redesigned (Bazil: "redesign this back", "backdrops focus more on
   cleanroom", "the tv needs to be there but positioned higher"): the statement large under the wordmark, on the side
   wall's grid (the same wordmark, the same size and lines); the screen raised to 1900 mm; the three units on ONE white block
   directly under it, on the screen's own edges, the gap under the screen equal to the block's inner margin; the cleanroom
   first (EPC carries the cleanroom object); the 310 mm inside wall 2 is plain navy, named only in the zones overlay */
const UNITS3B = [
  { k: 'EPC', iso: 'cleanroom', t: 'Builds cleanrooms and the facility.' },
  { k: 'PCU & TTI', iso: 'hookup', t: UNIT_LINE['PCU & TTI'] },
  { k: 'EFM', iso: 'maintain', t: UNIT_LINE.EFM },
]
export function W3B({ zones, bleed, print, still = '/booth/screen-still.webp' }) {
  const w = 2046, h = 3472, vis = 1736, m = 150, sh = letterH(WALL_MARK), U = UNITS3, pad = 60, cw = (U.w - 2 * pad) / 3
  return (
    <Svg w={w} h={h} label="Wall 3, the screen wall, Direction B" bleed={bleed} bleedFill={N.navy}>
      <Squares w={w + 20} h={h + 20} p={25} />
      <MarkB x={m} y={130} w={WALL_MARK} />
      <H x={m} y={530} size={150}>Cleanrooms,</H>
      <H x={m} y={690} size={150} fill={N.red}>built to class.</H>
      <ScreenStill print={print} still={still} frame="#0E1424" />
      <rect x={U.x} y={U.y} width={U.w} height={U.h} fill="#fff" />
      {UNITS3B.map((u, i) => {
        const x = U.x + pad + i * cw
        return (
          <g key={u.k}>
            <Iso k={u.iso} x={x - 14} y={U.y + 34} w={206} isw={1.3} />
            <T x={x} y={U.y + 300} size={72} weight={600} font={FS} fill={N.ink}>{u.k}</T>
            <Txt x={x} y={U.y + 322} w={cw - 34} h={140} size={36} lh={1.3} color={N.tx2}>{u.t}</Txt>
          </g>
        )
      })}
      <Seven x={-10} y={h - FOOT - sh} w={w + 20} h={sh} fill={N.red} />
      {zones && <><Zones w={vis} h={h} zones={zones} /><HiddenNote /></>}
    </Svg>
  )
}

/* 4, the counter front, 600 × 1170, 170 mm radius top right */
export function CounterB({ zones, bleed }) {
  const w = 600, h = 1170, r = 170, mw = 260
  const shape = `M0 0H${w - r}A${r} ${r} 0 0 1 ${w} ${r}V${h}H0Z`
  const shapeB = `M-10 -10H${w - r}A${r + 10} ${r + 10} 0 0 1 ${w + 10} ${r}V${h + 10}H-10Z`
  return (
    <Svg w={w} h={h} label="Counter front, Direction B" bleed={bleed}>
      <defs><clipPath id="bbCt"><path d={bleed ? shapeB : shape} /></clipPath></defs>
      <g clipPath="url(#bbCt)">
        <Squares w={w + 20} h={h + 20} p={10} />
        <MarkB x={60} y={70} w={mw} />
        <H x={60} y={300} size={54}>Cleanrooms,</H>
        <H x={60} y={362} size={54} fill={N.red}>built to class.</H>
        <Qr x={60} y={480} s={170} />
        <Txt x={272} y={474} w={270} h={180} size={27} lh={1.38}>Scan for the 3D story, the services and the projects.</Txt>
        <Line x={60} y={790} w={480} t={lineT(mw)} />
        <T x={60} y={846} size={26} weight={500} font={FS} fill="#fff">{QR_URL}</T>
      </g>
      {!bleed && <path d={shape} fill="none" stroke="#DCE2EC" strokeWidth="3" className="bt-bleedline" />}
      {zones && <Zones w={w} h={h} zones={zones} />}
    </Svg>
  )
}

/* ================================================================ print collateral */

/* the leaflet, A5 148 × 210. Front: the statement, one wide photograph of an IAQ cleanroom, the show and the code */
export function FlyerFrontB({ bleed }) {
  const w = 148, h = 210, mw = 34
  return (
    <Svg w={w} h={h} label="Leaflet, Direction B, front" bleed={bleed} bleedFill={N.navy}>
      <Squares w={w + 20} h={h + 20} p={w / 60} />
      <MarkB x={12} y={12} w={mw} />
      <H x={12} y={44} size={8.6}>The cleanroom, and</H>
      <H x={12} y={54.5} size={8.6} fill={N.red}>the whole fab around it.</H>
      <Txt x={12} y={60} w={112} h={12} size={3.4} lh={1.42}>IAQ designs, builds and commissions cleanrooms and the facilities around them, then hooks up the tools inside and keeps them running.</Txt>
      <Photo href={PHOTO.cleanroom} x={12} y={78} w={124} h={64} />
      <H x={12} y={153} size={5}>Meet IAQ at SEMICON Europa 2026</H>
      <T x={12} y={159.5} size={3.3}>Messe München, 10 to 13 November</T>
      <T x={12} y={164.5} size={3.3}>Stand to confirm</T>
      <Qr x={110} y={148} s={24} />
      <Line x={12} y={184} w={124} t={lineT(mw)} />
      <T x={12} y={193} size={3.2} weight={500} font={FS} fill="#fff">iaqtechnology.com.my</T>
      <T x={136} y={193} size={3.2} weight={500} font={FS} fill="#fff" anchor="end">business@iaqtechnology.com.my</T>
    </Svg>
  )
}
/* back: the three units with their objects on white, the record on a tint, Dresden and headquarters on navy */
export function FlyerBackB({ bleed }) {
  const w = 148, h = 210
  return (
    <Svg w={w} h={h} label="Leaflet, Direction B, back" bleed={bleed}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill="#fff" />
      <MarkB x={12} y={10} w={20} tone="light" />   {/* 30 Sep: the IAQ at the top of every piece */}
      <H x={12} y={30} size={7.4} fill={N.ink}>Three units,</H>
      <H x={12} y={39} size={7.4} fill={N.red}>one accountable team.</H>
      <Line x={12} y={44} w={124} t={0.41} fill={N.red} />
      {UNITS.map((u, i) => {
        const y = 51.5 + i * 23
        return (
          <g key={u.k}>
            <Iso k={u.iso} x={10.5} y={y - 1} w={22} isw={2.2} />
            <H x={38} y={y + 4.6} size={4.4} fill={N.ink}>{u.k}</H>
            <T x={38} y={y + 8.8} size={2.7} weight={500} font={FS} fill={N.tx2}>{u.full}</T>
            <Txt x={38} y={y + 10.2} w={98} h={10} size={3} lh={1.36} color={N.tx2}>{u.t}</Txt>
          </g>
        )
      })}
      <rect x="-10" y="120" width={w + 20} height="34" fill={N.tint} />
      {PROOF.map(([n, l], i) => {
        const x = 12 + (i % 2) * 64, y = 131.5 + Math.floor(i / 2) * 14
        return (
          <g key={n}>
            <H x={x} y={y} size={7} fill={N.ink}>{n}</H>
            <T x={x} y={y + 4.4} size={2.7} fill={N.tx2}>{l}</T>
          </g>
        )
      })}
      <Squares x={-10} y={160} w={w + 20} h={60} p={w / 60} />
      <H x={12} y={170} size={3.4}>IAQ Engineering (DE) GmbH, Dresden</H>
      <Txt x={12} y={172} w={84} h={10} size={3} lh={1.45}>8. OG, Budapester Straße 5, 01069 Dresden<br />+49 351 4387 9529</Txt>
      <H x={12} y={187} size={3.4}>Headquarters, Shah Alam, Malaysia</H>
      <Txt x={12} y={189} w={84} h={10} size={3} lh={1.45}>+603 5124 8319<br />business@iaqtechnology.com.my</Txt>
      <Qr x={110} y={167} s={24} />
      <T x={110} y={198} size={3} weight={600} font={FS} fill="#fff">Book a meeting</T>
    </Svg>
  )
}

/* the roll-up, 850 × 2000, on the Design tab's roll-up structure: margins 85, the wordmark 102 from the top, the
   headline from 391, the lede 42 under it, the photograph, the three units, the line at 1633, the foot at 1670, nothing
   under 300 mm from the floor */
export function RollUpB({ bleed }) {
  const w = 850, h = 2000, m = 85, mw = 425, cw = (w - 2 * m) / 3
  return (
    <Svg w={w} h={h} label="Roll-up, Direction B" bleed={bleed} bleedFill={N.navy}>
      <Squares w={w + 20} h={h + 20} p={14} />
      <MarkB x={m} y={102} w={mw} />
      <H x={m} y={460} size={84}>Controlled</H>
      <H x={m} y={552} size={84}>environments,</H>
      <H x={m} y={644} size={84} fill={N.red}>built to class.</H>
      <Txt x={m} y={684} w={w - 2 * m} h={150} size={34} lh={1.38}>Cleanrooms and the facility around them, designed, built, hooked up and maintained by one IAQ team since 1995.</Txt>
      <Photo href={PHOTO.cleanroom} x={m} y={870} w={w - 2 * m} h={460} />
      {UNITS.map((u, i) => (
        <g key={u.k}>
          <H x={m + i * cw} y={1412} size={38}>{u.k}</H>
          <Txt x={m + i * cw} y={1428} w={cw - 24} h={120} size={22} lh={1.36}>{UNIT_LINE[u.k]}</Txt>
        </g>
      ))}
      <Line x={m} y={1633} w={w - 2 * m} t={lineT(mw)} />
      <T x={m} y={1690} size={28} weight={500} font={FS} fill="#fff">iaqtechnology.com.my</T>
      <T x={w - m} y={1690} size={28} weight={500} font={FS} fill="#fff" anchor="end">Shah Alam and Dresden</T>
    </Svg>
  )
}

/* ================================================================ digital (px) */

/* LinkedIn, four posts at 1080 × 1350, one structure: the wordmark, the statement, one line of text, one photograph,
   the action, the long line above the foot */
function PostB({ label, h1, h2, lede, photo, at, act, after, footL, footR }) {
  const w = 1080, h = 1350, m = 80, mw = 200
  return (
    <Svg w={w} h={h} label={label}>
      <Squares x={0} y={0} w={w} h={h} p={18} />
      <MarkB x={m} y={80} w={mw} />
      <H x={m} y={300} size={96}>{h1}</H>
      <H x={m} y={400} size={96} fill={N.red}>{h2}</H>
      <Txt x={m} y={432} w={w - 2 * m} h={96} size={34} lh={1.36}>{lede}</Txt>
      <Photo href={photo} x={0} y={540} w={w} h={480} at={at} />
      {act && <Act x={m} y={1062} w={w - 2 * m} h={80} size={30} t={act} after={after} />}
      <Line x={m} y={1190} w={w - 2 * m} t={lineT(mw)} />
      {footL && <T x={m} y={1250} size={28} weight={500} font={FS} fill="#fff">{footL}</T>}
      {footR && <T x={w - m} y={1250} size={28} weight={500} font={FS} fill="#fff" anchor="end">{footR}</T>}
    </Svg>
  )
}
export const Post1B = () => <PostB label="LinkedIn post 1, three weeks out, Direction B" h1="Meet IAQ" h2="in Munich." lede={'SEMICON Europa 2026, Messe\u00A0München, 10 to 13 November.'} photo={PHOTO.cleanroom} act="Book a meeting" after="Stand to confirm" footL="iaqtechnology.com.my/semicon" />
export const Post2B = () => <PostB label="LinkedIn post 2, one week out, Direction B" h1="From Shah Alam" h2="to Dresden." lede="Offices in seven countries, and a team in Germany: IAQ Engineering (DE) GmbH, Dresden." photo={PHOTO.team} at="xMidYMid" footL="Messe München, 10 to 13 November" footR="iaqtechnology.com.my/semicon" />
export const Post3B = ({ photo = '/booth/still-post3-b.webp' }) => <PostB label="LinkedIn post 3, opening day, Direction B" h1="The stand" h2="is open." lede="See a fab built layer by layer, on the screen." photo={photo} act="Find us at the stand" after="Messe München" footL="iaqtechnology.com.my/semicon" />
export const Post4B = ({ photo = '/booth/still-post4-b.webp' }) => <PostB label="LinkedIn post 4, thank you, Direction B" h1="Thank you," h2="Munich." lede="Four days of briefs and conversations. Every one gets an answer within one working day." photo={photo} footL="SEMICON Europa 2026" footR="iaqtechnology.com.my" />

/* web ads, four sizes: navy, the wordmark, the headline, one red action */
export function AdB({ size }) {
  const [w, h] = size
  const p = Math.max(8, w / 60)
  const head = (x, ys, s) => <><H x={x} y={ys[0]} size={s}>Controlled</H><H x={x} y={ys[1]} size={s}>environments,</H><H x={x} y={ys[2]} size={s} fill={N.red}>built to class.</H></>
  if (w > h * 3) return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}, Direction B`}>
      <Squares x={0} y={0} w={w} h={h} p={p} />
      <MarkB x={20} y={22} w={112} />
      <H x={160} y={44} size={19}>Controlled environments, <tspan fill={N.red}>built to class.</tspan></H>
      <T x={160} y={66} size={12.5}>SEMICON Europa 2026, Messe München, 10 to 13 November</T>
      <Act x={540} y={27} w={168} h={40} size={14} t="Book a meeting" end />
    </Svg>
  )
  if (h > w * 3) return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}, Direction B`}>
      <Squares x={0} y={0} w={w} h={h} p={p} />
      <MarkB x={16} y={24} w={128} />
      {head(16, [122, 143, 164], 17)}
      <Photo href={PHOTO.cleanroom} x={0} y={192} w={w} h={170} />
      <Txt x={16} y={384} w={w - 32} h={60} size={13} lh={1.35}>SEMICON Europa, Munich, 10 to 13 Nov</Txt>
      <Act x={16} y={450} w={w - 32} h={34} size={13} t="Book a meeting" />
    </Svg>
  )
  if (h > w * 1.5) return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}, Direction B`}>
      <Squares x={0} y={0} w={w} h={h} p={p} />
      <MarkB x={24} y={28} w={120} />
      {head(24, [146, 182, 218], 32)}
      <Txt x={24} y={236} w={w - 48} h={60} size={15} lh={1.4}>Meet IAQ at SEMICON Europa, Messe München, 10 to 13 November.</Txt>
      <Photo href={PHOTO.cleanroom} x={0} y={316} w={w} h={170} />
      <Act x={24} y={514} w={w - 48} h={40} size={16} t="Book a meeting" />
    </Svg>
  )
  return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}, Direction B`}>
      <Squares x={0} y={0} w={w} h={h} p={p} />
      <MarkB x={20} y={18} w={86} />
      {head(20, [88, 116, 144], 24)}
      <T x={20} y={172} size={13}>SEMICON Europa, Munich, 10 to 13 Nov</T>
      <Act x={20} y={188} w={w - 40} h={36} size={14} t="Book a meeting" />
    </Svg>
  )
}

/* the email signature banner, 600 × 150: a navy block joined to one wide photograph */
export function SignatureB() {
  const w = 600, h = 150, split = 360
  return (
    <Svg w={w} h={h} label="Email signature banner, Direction B">
      <Squares x={0} y={0} w={split} h={h} p={8} />
      <Photo href={PHOTO.cleanroom} x={split} y={0} w={w - split} h={h} />
      <MarkB x={24} y={24} w={86} />
      <H x={24} y={96} size={19}>Meet IAQ at SEMICON Europa</H>
      <T x={24} y={119} size={12.5}>Messe München, 10 to 13 November, stand to confirm</T>
    </Svg>
  )
}

export const ART_B = { 'w1-b': W1B, 'w2-b': W2B, 'w3-b': W3B, 'ct-b': CounterB }
export const POSTS_B = { post1: Post1B, post2: Post2B, post3: Post3B, post4: Post4B }
const ADS_B = [[300, 250], [728, 90], [300, 600], [160, 600]]
/* every Direction B piece, for the standalone renderer (/booth/art/:id) and the PNG, print and texture exports */
export const PIECES_B = {
  'w1-b': { C: W1B, w: 310, h: 3472, unit: 'mm', k: 'Wall 1, aisle column, Direction B', print: true },
  'w2-b': { C: W2B, w: 2852, h: 3472, unit: 'mm', k: 'Wall 2, side wall, Direction B', print: true },
  'w3-b': { C: W3B, w: 2046, h: 3472, unit: 'mm', k: 'Wall 3, the screen wall, Direction B', print: true },
  'ct-b': { C: CounterB, w: 600, h: 1170, unit: 'mm', k: 'Counter front, Direction B', print: true },
  flyerB1: { C: FlyerFrontB, w: 148, h: 210, unit: 'mm', k: 'Leaflet, Direction B, front', print: true },
  flyerB2: { C: FlyerBackB, w: 148, h: 210, unit: 'mm', k: 'Leaflet, Direction B, back', print: true },
  rollB: { C: RollUpB, w: 850, h: 2000, unit: 'mm', k: 'Roll-up, Direction B', print: true },
  'post1-b': { C: Post1B, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 1, three weeks out, Direction B' },
  'post2-b': { C: Post2B, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 2, one week out, Direction B' },
  'post3-b': { C: Post3B, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 3, opening day, Direction B' },
  'post4-b': { C: Post4B, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 4, thank you, Direction B' },
  'sig-b': { C: SignatureB, w: 600, h: 150, unit: 'px', k: 'Email signature, Direction B' },
  ...Object.fromEntries(ADS_B.map(s => ['ad' + s.join('x') + '-b', { C: p => <AdB size={s} {...p} />, w: s[0], h: s[1], unit: 'px', k: `Web ad ${s[0]} × ${s[1]}, Direction B` }])),
}
