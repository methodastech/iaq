import React from 'react'
import { Svg, Zones, Qr, UNIT_LINE, UNITS3, ScreenStill, HiddenNote, MarkFlat, ProcessColumn } from './Art.jsx'
import { MarkB, letterH, Seven, H, T, Txt, Act, Line, lineT, Photo, FS, FI, UNITS, PROOF, WALL_MARK, FOOT } from './ArtB.jsx'
import { QR_URL } from '../../data/boothQr.js'
import { ISO_C } from '../../assets/booth/iso-set-c-0930.js'

/* ============================================================================
   The SEMICON Europa 2026 artwork, Direction D: "Field red" (30 Sep 2026), Brand Method's pick for a fourth, clearly
   different idea. The stand in IAQ's deep field red, calm rather than loud: few elements per surface, a lot of red space
   inside them, the figures large, IAQ's own cleanroom photographs in square cornered solid blocks.

   the ground: field red #C8161D on the walls, the counter and every piece's front (the bright #EC2027 only small, on
     white: a phrase or a line on the leaflet's back)
   white type only on the red (black on field red is 2.79:1, so never)
   the IAQ in white, top left (IAQ's all white file), or across the top of the aisle column and the roll-up
   the seven lines in WHITE at the foot of the three walls (white is allowed only on IAQ red), as tall as the wall
     wordmark's letters, one height round the zone; the one long line (white) above the foot everywhere else
   photographs: IAQ's cleanrooms (public/assets/iaq/cr-*.webp), wide, no close faces, in their own block, never under type;
     none are sharp enough for the walls yet (see the Plan's judgement calls): the camera originals are needed
   the red aisle column carries the six services as a loop (ProcessColumn, shared with Direction A)
   type: Switzer 600 for statements, figures and names, Switzer 500 for the foot, Instrument Sans for sentences
   ============================================================================ */

export const F = { field: '#C8161D', white: '#FFFFFF', bright: '#EC2027', ink: '#231F20', tx2: '#5A5F6B', light: '#F4F6F9' }
const PH = {
  ballroom: '/assets/iaq/cr-ballroom-8575.webp',
  ballroom2: '/assets/iaq/cr-ballroom-8578.webp',
  utilities: '/assets/iaq/cr-utilities-p1010242.webp',
  lift: '/assets/iaq/cr-utilities-p1010244-lift.webp',
  build: '/assets/iaq/cr-build-2024.webp',
}
const SH = letterH(WALL_MARK)
const IsoW = ({ k, x, y, w, isw = 1.1 }) => {
  const o = ISO_C['w-' + k], [, , vw, vh] = o.vb.split(' ').map(Number)
  return <svg x={x} y={y} width={w} height={w * vh / vw} viewBox={o.vb} style={{ '--isw': isw }} dangerouslySetInnerHTML={{ __html: o.inner }} />
}

/* ================================================================ the stand */

/* 1, the aisle column, 310 × 3472: field red, the white IAQ across the top, the six services as a loop, the white seven
   lines at the foot */
export function W1D({ zones, bleed }) {
  const w = 310, h = 3472, mw = 230, sh = letterH(mw)
  return (
    <Svg w={w} h={h} label="Wall 1, the aisle column, Direction D" bleed={bleed} bleedFill={F.field}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={F.field} />
      <MarkFlat x={40} y={150} w={mw} />
      <ProcessColumn top={420} bottom={2990} />
      <Seven x={-10} y={h - FOOT - sh} w={w + 20} h={sh} />
      {zones && <Zones w={w} h={h} zones={zones} />}
    </Svg>
  )
}

/* 2, the side wall, 2852 × 3472: the figure as the statement, one IAQ cleanroom in a square block, two more figures, the
   white seven lines */
export function W2D({ zones, bleed }) {
  const w = 2852, h = 3472, m = 150, ps = 1220, px = w - m - ps, py = 1000
  return (
    <Svg w={w} h={h} label="Wall 2, the side wall, Direction D" bleed={bleed} bleedFill={F.field}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={F.field} />
      <MarkB x={m} y={130} w={WALL_MARK} tone="white" />
      <H x={m} y={690} size={290} fill={F.white}>1,050,000 m²</H>
      <T x={m} y={830} size={92} weight={600} font={FS} fill={F.white}>of cleanroom built since 1995.</T>
      <Photo href={PH.ballroom} x={px} y={py} w={ps} h={ps} />
      {[['250+', 'projects completed'], ['7', 'countries with an IAQ office,', 'Germany among them']].map(([n, a, b], i) => (
        <g key={n}>
          <H x={m} y={1330 + i * 560} size={250} fill={F.white}>{n}</H>
          <T x={m} y={1430 + i * 560} size={60} fill={F.white}>{a}</T>
          {b && <T x={m} y={1510 + i * 560} size={60} fill={F.white}>{b}</T>}
        </g>
      ))}
      <Seven x={-10} y={h - FOOT - SH} w={w + 20} h={SH} />
      {zones && <Zones w={w} h={h} zones={zones} />}
    </Svg>
  )
}

/* 3, the back wall, 2046 × 3472, 1736 visible: the statement, the raised screen, the three units in white on the screen's
   edges with their objects drawn white line, the white seven lines */
const UNITS3D = [
  { k: 'EPC', iso: 'construct', t: 'Builds cleanrooms and the facility.' },
  { k: 'PCU & TTI', iso: 'hookup', t: UNIT_LINE['PCU & TTI'] },
  { k: 'EFM', iso: 'maintain', t: UNIT_LINE.EFM },
]
export function W3D({ zones, bleed, print, still = '/booth/screen-still.webp' }) {
  const w = 2046, h = 3472, vis = 1736, m = 150, U = UNITS3, cw = U.w / 3
  return (
    <Svg w={w} h={h} label="Wall 3, the screen wall, Direction D" bleed={bleed} bleedFill={F.field}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={F.field} />
      <MarkB x={m} y={130} w={WALL_MARK} tone="white" />
      <H x={m} y={530} size={150} fill={F.white}>Cleanrooms,</H>
      <H x={m} y={690} size={150} fill={F.white}>built to class.</H>
      <ScreenStill print={print} still={still} frame="#1B1B1B" />
      {UNITS3D.map((u, i) => {
        const x = U.x + i * cw
        return (
          <g key={u.k}>
            <IsoW k={u.iso} x={x - 12} y={U.y + 20} w={170} />
            <T x={x} y={U.y + 290} size={72} weight={600} font={FS} fill={F.white}>{u.k}</T>
            <Txt x={x} y={U.y + 312} w={cw - 50} h={140} size={36} lh={1.3} color={F.white}>{u.t}</Txt>
          </g>
        )
      })}
      <Seven x={-10} y={h - FOOT - SH} w={w + 20} h={SH} />
      {zones && <><Zones w={vis} h={h} zones={zones} /><HiddenNote /></>}
    </Svg>
  )
}

/* 4, the counter front, 600 × 1170, 170 mm radius top right */
export function CounterD({ zones, bleed }) {
  const w = 600, h = 1170, r = 170, mw = 260
  const shape = `M0 0H${w - r}A${r} ${r} 0 0 1 ${w} ${r}V${h}H0Z`
  const shapeB = `M-10 -10H${w - r}A${r + 10} ${r + 10} 0 0 1 ${w + 10} ${r}V${h + 10}H-10Z`
  return (
    <Svg w={w} h={h} label="Counter front, Direction D" bleed={bleed}>
      <defs><clipPath id="bdCt"><path d={bleed ? shapeB : shape} /></clipPath></defs>
      <g clipPath="url(#bdCt)">
        <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={F.field} />
        <MarkB x={60} y={70} w={mw} tone="white" />
        <H x={60} y={300} size={54} fill={F.white}>Cleanrooms,</H>
        <H x={60} y={362} size={54} fill={F.white}>built to class.</H>
        <Qr x={60} y={462} s={170} />
        <Txt x={272} y={456} w={270} h={180} size={27} lh={1.38} color={F.white}>Scan for the 3D story, the services and the projects.</Txt>
        <Line x={60} y={790} w={480} t={lineT(mw)} />
        <T x={60} y={846} size={26} weight={500} font={FS} fill={F.white}>{QR_URL}</T>
      </g>
      {!bleed && <path d={shape} fill="none" stroke="#DCE2EC" strokeWidth="3" className="bt-bleedline" />}
      {zones && <Zones w={w} h={h} zones={zones} />}
    </Svg>
  )
}

/* ================================================================ print collateral */

/* the leaflet, A5 148 × 210. Front on field red: the statement, one IAQ cleanroom, the show and the code */
export function FlyerFrontD({ bleed }) {
  const w = 148, h = 210, mw = 34
  return (
    <Svg w={w} h={h} label="Leaflet, Direction D, front" bleed={bleed} bleedFill={F.field}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={F.field} />
      <MarkB x={12} y={12} w={mw} tone="white" />
      <H x={12} y={44} size={8.6} fill={F.white}>Cleanrooms,</H>
      <H x={12} y={54.5} size={8.6} fill={F.white}>built to class.</H>
      <Txt x={12} y={60} w={120} h={12} size={3.3} lh={1.42} color={F.white}>IAQ designs, builds and commissions cleanrooms and the facilities around them, then hooks up the tools inside and keeps them running.</Txt>
      <Photo href={PH.ballroom2} x={12} y={78} w={124} h={72} />
      <H x={12} y={161} size={4.8} fill={F.white}>Meet IAQ at SEMICON Europa 2026</H>
      <T x={12} y={167.5} size={3.3} fill={F.white}>Messe München, 10 to 13 November</T>
      <T x={12} y={172.5} size={3.3} fill={F.white}>Stand to confirm</T>
      <Qr x={112} y={156} s={24} />
      <Line x={12} y={186} w={124} t={lineT(mw)} />
      <T x={12} y={195} size={3.2} weight={500} font={FS} fill={F.white}>iaqtechnology.com.my</T>
      <T x={136} y={195} size={3.2} weight={500} font={FS} fill={F.white} anchor="end">business@iaqtechnology.com.my</T>
    </Svg>
  )
}
/* back on white: the IAQ, the three units, the record large on a field red band, Dresden, headquarters, the stand slot */
export function FlyerBackD({ bleed }) {
  const w = 148, h = 210
  return (
    <Svg w={w} h={h} label="Leaflet, Direction D, back" bleed={bleed} bleedFill={F.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={F.white} />
      <MarkB x={12} y={10} w={20} tone="light" />
      <H x={12} y={30} size={7.4} fill={F.ink}>Three units,</H>
      <H x={12} y={39} size={7.4} fill={F.bright}>one accountable team.</H>
      {UNITS.map((u, i) => {
        const y = 52 + i * 21
        return (
          <g key={u.k}>
            <H x={12} y={y} size={4.4} fill={F.ink}>{u.k}</H>
            <T x={12} y={y + 4.2} size={2.7} weight={500} font={FS} fill={F.tx2}>{u.full}</T>
            <Txt x={12} y={y + 5.6} w={124} h={10} size={3} lh={1.36} color={F.tx2}>{u.t}</Txt>
          </g>
        )
      })}
      <rect x="-10" y="112" width={w + 20} height="46" fill={F.field} />
      {PROOF.map(([n, l], i) => {
        const x = 12 + (i % 2) * 64, y = 127 + Math.floor(i / 2) * 18
        return (
          <g key={n}>
            <H x={x} y={y} size={9} fill={F.white}>{n}</H>
            <T x={x} y={y + 4.6} size={2.7} fill={F.white}>{l}</T>
          </g>
        )
      })}
      <H x={12} y={168} size={3.4} fill={F.ink}>IAQ Engineering (DE) GmbH, Dresden</H>
      <Txt x={12} y={170} w={58} h={10} size={2.9} lh={1.45} color={F.tx2}>8. OG, Budapester Straße 5, 01069 Dresden<br />+49 351 4387 9529</Txt>
      <H x={12} y={186} size={3.4} fill={F.ink}>Headquarters, Shah Alam, Malaysia</H>
      <Txt x={12} y={188} w={58} h={10} size={2.9} lh={1.45} color={F.tx2}>+603 5124 8319<br />business@iaqtechnology.com.my</Txt>
      <H x={76} y={168} size={3.4} fill={F.ink}>At the stand</H>
      <Txt x={76} y={170} w={30} h={10} size={2.9} lh={1.45} color={F.tx2}>Contact details to follow from IAQ</Txt>
      <Qr x={112} y={166} s={24} />
      <T x={112} y={198} size={3} weight={600} font={FS} fill={F.ink}>Book a meeting</T>
    </Svg>
  )
}

/* the roll-up, 850 × 2000: the white IAQ across the top, the statement, one cleanroom, the figure, the line at 1633 */
export function RollUpD({ bleed }) {
  const w = 850, h = 2000, m = 85, mw = w - 2 * m
  return (
    <Svg w={w} h={h} label="Roll-up, Direction D" bleed={bleed} bleedFill={F.field}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={F.field} />
      <MarkB x={m} y={102} w={mw} tone="white" />
      <H x={m} y={520} size={84} fill={F.white}>Cleanrooms,</H>
      <H x={m} y={612} size={84} fill={F.white}>built to class.</H>
      <Txt x={m} y={648} w={w - 2 * m} h={120} size={30} lh={1.38} color={F.white}>Designed, built, hooked up and maintained by one IAQ team since 1995.</Txt>
      <Photo href={PH.lift} x={m} y={790} w={w - 2 * m} h={560} />
      <H x={m} y={1478} size={96} fill={F.white}>1,050,000 m²</H>
      <T x={m} y={1532} size={30} fill={F.white}>of cleanroom built</T>
      <Line x={m} y={1633} w={w - 2 * m} t={lineT(425)} />
      <T x={m} y={1690} size={28} weight={500} font={FS} fill={F.white}>iaqtechnology.com.my</T>
      <T x={w - m} y={1690} size={28} weight={500} font={FS} fill={F.white} anchor="end">Shah Alam and Dresden</T>
    </Svg>
  )
}

/* ================================================================ digital (px) */

/* LinkedIn, four posts at 1080 × 1350, one structure: the white IAQ, the statement, one line, one photograph in its block
   inside the margins, the white action box, the long white line above the foot */
function PostD({ label, h1, h2, lede, photo, at, act, after, footL, footR }) {
  const w = 1080, h = 1350, m = 80, mw = 200
  return (
    <Svg w={w} h={h} label={label}>
      <rect width={w} height={h} fill={F.field} />
      <MarkB x={m} y={80} w={mw} tone="white" />
      <H x={m} y={300} size={96} fill={F.white}>{h1}</H>
      <H x={m} y={400} size={96} fill={F.white}>{h2}</H>
      <Txt x={m} y={432} w={w - 2 * m} h={96} size={34} lh={1.36} color={F.white}>{lede}</Txt>
      <Photo href={photo} x={m} y={540} w={w - 2 * m} h={480} at={at} />
      {act && <Act x={m} y={1062} w={w - 2 * m} h={80} size={30} t={act} bg={F.white} color={F.field} after={after} afterColor={F.white} />}
      <Line x={m} y={1190} w={w - 2 * m} t={lineT(mw)} />
      {footL && <T x={m} y={1250} size={28} weight={500} font={FS} fill={F.white}>{footL}</T>}
      {footR && <T x={w - m} y={1250} size={28} weight={500} font={FS} fill={F.white} anchor="end">{footR}</T>}
    </Svg>
  )
}
export const Post1D = () => <PostD label="LinkedIn post 1, three weeks out, Direction D" h1="Meet IAQ" h2="in Munich." lede={'SEMICON Europa 2026, Messe München, 10 to 13 November.'} photo={PH.ballroom2} act="Book a meeting" after="Stand to confirm" footL="iaqtechnology.com.my/semicon" />
export const Post2D = () => <PostD label="LinkedIn post 2, one week out, Direction D" h1="From Shah Alam" h2="to Dresden." lede="Offices in seven countries, and a team in Germany: IAQ Engineering (DE) GmbH, Dresden." photo={PH.utilities} footL="Messe München, 10 to 13 November" footR="iaqtechnology.com.my/semicon" />
export const Post3D = ({ photo = '/booth/still-post3-d.webp' }) => <PostD label="LinkedIn post 3, opening day, Direction D" h1="The stand" h2="is open." lede="See a fab built layer by layer, on the screen." photo={photo} act="Find us at the stand" after="Messe München" footL="iaqtechnology.com.my/semicon" />
export const Post4D = ({ photo = '/booth/still-post4-d.webp' }) => <PostD label="LinkedIn post 4, thank you, Direction D" h1="Thank you," h2="Munich." lede="Four days of briefs and conversations. Every one gets an answer within one working day." photo={photo} footL="SEMICON Europa 2026" footR="iaqtechnology.com.my" />

/* web ads, four sizes: field red, the white IAQ, the statement, one cleanroom where there is room, the white action */
export function AdD({ size }) {
  const [w, h] = size
  const head = (x, ys, s) => <><H x={x} y={ys[0]} size={s} fill={F.white}>Cleanrooms,</H><H x={x} y={ys[1]} size={s} fill={F.white}>built to class.</H></>
  const act = (x, y, ww, hh, s, end) => <Act x={x} y={y} w={ww} h={hh} size={s} t="Book a meeting" bg={F.white} color={F.field} end={end} />
  const frame = <rect width={w} height={h} fill={F.field} />
  if (w > h * 3) return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}, Direction D`}>
      {frame}
      <MarkB x={20} y={24} w={100} tone="white" />
      <H x={148} y={42} size={20} fill={F.white}>Cleanrooms, built to class.</H>
      <T x={148} y={64} size={12.5} fill={F.white}>SEMICON Europa, Messe München, 10 to 13 Nov</T>
      {act(540, 27, 168, 40, 14, true)}
    </Svg>
  )
  if (h > w * 3) return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}, Direction D`}>
      {frame}
      <MarkB x={16} y={24} w={128} tone="white" />
      {head(16, [122, 144], 19)}
      <Photo href={PH.ballroom2} x={16} y={176} w={w - 32} h={180} />
      <Txt x={16} y={384} w={w - 32} h={60} size={13} lh={1.35} color={F.white}>SEMICON Europa, Munich, 10 to 13 Nov</Txt>
      {act(16, 450, w - 32, 34, 13)}
    </Svg>
  )
  if (h > w * 1.5) return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}, Direction D`}>
      {frame}
      <MarkB x={24} y={28} w={120} tone="white" />
      {head(24, [146, 184], 34)}
      <Txt x={24} y={204} w={w - 48} h={60} size={15} lh={1.4} color={F.white}>Meet IAQ at SEMICON Europa, Messe München, 10 to 13 November.</Txt>
      <Photo href={PH.ballroom2} x={24} y={280} w={w - 48} h={200} />
      {act(24, 514, w - 48, 40, 16)}
    </Svg>
  )
  return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}, Direction D`}>
      {frame}
      <MarkB x={20} y={18} w={86} tone="white" />
      {head(20, [92, 120], 25)}
      <T x={20} y={170} size={13} fill={F.white}>SEMICON Europa, Munich, 10 to 13 Nov</T>
      {act(20, 188, w - 40, 36, 14)}
    </Svg>
  )
}

/* the email signature banner, 600 × 150: a field red block with the white IAQ, joined to one IAQ cleanroom */
export function SignatureD() {
  const w = 600, h = 150, split = 360
  return (
    <Svg w={w} h={h} label="Email signature banner, Direction D">
      <rect width={split} height={h} fill={F.field} />
      <Photo href={PH.ballroom2} x={split} y={0} w={w - split} h={h} />
      <MarkB x={24} y={24} w={86} tone="white" />
      <H x={24} y={96} size={19} fill={F.white}>Meet IAQ at SEMICON Europa</H>
      <T x={24} y={119} size={12.5} fill={F.white}>Messe München, 10 to 13 November, stand to confirm</T>
    </Svg>
  )
}

export const ART_D = { 'w1-d': W1D, 'w2-d': W2D, 'w3-d': W3D, 'ct-d': CounterD }
export const POSTS_D = { post1: Post1D, post2: Post2D, post3: Post3D, post4: Post4D }
const ADS_D = [[300, 250], [728, 90], [300, 600], [160, 600]]
export const PIECES_D = {
  'w1-d': { C: W1D, w: 310, h: 3472, unit: 'mm', k: 'Wall 1, aisle column, Direction D', print: true },
  'w2-d': { C: W2D, w: 2852, h: 3472, unit: 'mm', k: 'Wall 2, side wall, Direction D', print: true },
  'w3-d': { C: W3D, w: 2046, h: 3472, unit: 'mm', k: 'Wall 3, the screen wall, Direction D', print: true },
  'ct-d': { C: CounterD, w: 600, h: 1170, unit: 'mm', k: 'Counter front, Direction D', print: true },
  flyerD1: { C: FlyerFrontD, w: 148, h: 210, unit: 'mm', k: 'Leaflet, Direction D, front', print: true },
  flyerD2: { C: FlyerBackD, w: 148, h: 210, unit: 'mm', k: 'Leaflet, Direction D, back', print: true },
  rollD: { C: RollUpD, w: 850, h: 2000, unit: 'mm', k: 'Roll-up, Direction D', print: true },
  'post1-d': { C: Post1D, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 1, three weeks out, Direction D' },
  'post2-d': { C: Post2D, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 2, one week out, Direction D' },
  'post3-d': { C: Post3D, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 3, opening day, Direction D' },
  'post4-d': { C: Post4D, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 4, thank you, Direction D' },
  'sig-d': { C: SignatureD, w: 600, h: 150, unit: 'px', k: 'Email signature, Direction D' },
  ...Object.fromEntries(ADS_D.map(s => ['ad' + s.join('x') + '-d', { C: p => <AdD size={s} {...p} />, w: s[0], h: s[1], unit: 'px', k: `Web ad ${s[0]} × ${s[1]}, Direction D` }])),
}
