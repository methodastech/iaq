import React from 'react'
import { Svg, Zones, Qr, UNIT_LINE, SCREEN3, ScreenStill, HiddenNote } from './Art.jsx'
import { MarkB, markHB, letterH, Seven, H, T, Txt, Act, Line, lineT, Photo, FS, UNITS, PROOF, WALL_MARK, FOOT } from './ArtB.jsx'
import { QR_URL } from '../../data/boothQr.js'

/* ============================================================================
   The SEMICON Europa 2026 artwork, Direction E: "Red back wall" (30 Sep 2026). Bazil: "make a 5th version as well, all red
   on the back wall". A white stand with ONE red plane: the back wall, entirely field red, the screen set into it, the white
   IAQ big across its top, the cleanroom statement in white under the screen, the white seven lines at its foot. The side
   wall and the aisle column stay white and lead with IAQ's own cleanroom photographs; the counter is white with one red
   line. So the aisle sees one red plane, where Direction D is red throughout.

   the ground: white #FFFFFF (the aisle column #F4F6F9); field red #C8161D only on the back wall and, on the other pieces, one
     red plane at the top that carries the white IAQ and the statement (the back wall in small)
   the IAQ: white across the top of the back wall; IAQ's light file (red letters, black ®) top left on white
   the seven lines: WHITE, on the back wall only (white is allowed only on IAQ red), as tall as its wordmark's letters
   one long red line: 400 mm above the floor on the side wall and the column, above the foot everywhere else
   photographs: IAQ's cleanrooms in square cornered blocks, never under type; originals needed before the walls print
   type: Switzer 600 for statements, figures and names, Switzer 500 for the foot, Instrument Sans for sentences
   ============================================================================ */

export const E = { field: '#C8161D', white: '#FFFFFF', light: '#F4F6F9', ink: '#231F20', tx2: '#5A5F6B', red: '#EC2027' }
const PH = {
  ballroom: '/assets/iaq/cr-ballroom-8578.webp',
  ballroom2: '/assets/iaq/cr-ballroom-8575.webp',
  corridor: '/assets/iaq/cr-corridor-8588.webp',
  utilities: '/assets/iaq/cr-utilities-p1010242.webp',
  build: '/assets/iaq/cr-build-2024.webp',
}
const LINE_Y = 3472 - 400, LINE_T = lineT(WALL_MARK)

/* ================================================================ the stand */

/* 1, the aisle column, 310 × 3472: light, the IAQ across the top, one tall IAQ cleanroom corridor in its block, the line */
export function W1E({ zones, bleed }) {
  const w = 310, h = 3472, mw = 230
  return (
    <Svg w={w} h={h} label="Wall 1, the aisle column, Direction E" bleed={bleed} bleedFill={E.light}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={E.light} />
      <MarkB x={40} y={150} w={mw} tone="light" />
      <Photo href={PH.corridor} x={40} y={760} w={mw} h={1900} />
      <Line x={-10} y={LINE_Y} w={w + 20} t={LINE_T} fill={E.red} />
      {zones && <Zones w={w} h={h} zones={zones} />}
    </Svg>
  )
}

/* 2, the side wall, 2852 × 3472: white, the IAQ top left, the figure and the cleanroom statement, one IAQ cleanroom in a
   square block, three figures beside it, the red line */
export function W2E({ zones, bleed }) {
  const w = 2852, h = 3472, m = 150, ps = 1260, py = 960
  return (
    <Svg w={w} h={h} label="Wall 2, the side wall, Direction E" bleed={bleed} bleedFill={E.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={E.white} />
      <MarkB x={m} y={130} w={WALL_MARK} tone="light" />
      <H x={m} y={530} size={150} fill={E.ink}>1,050,000 m² of cleanroom,</H>
      <H x={m} y={690} size={150} fill={E.red}>built since 1995.</H>
      <Photo href={PH.ballroom} x={m} y={py} w={ps} h={ps} />
      {[['31', 'years building controlled environments'], ['7', 'countries with an IAQ office, Germany among them'], ['250+', 'projects completed']].map(([n, l], i) => (
        <g key={n}>
          <H x={m + ps + 160} y={py + 190 + i * 420} size={200} fill={E.ink}>{n}</H>
          <Txt x={m + ps + 160} y={py + 230 + i * 420} w={w - m - (m + ps + 160)} h={140} size={54} lh={1.3} color={E.tx2}>{l}</Txt>
        </g>
      ))}
      <Line x={-10} y={LINE_Y} w={w + 20} t={LINE_T} fill={E.red} />
      <T x={w - m} y={LINE_Y + 110} size={52} weight={500} font={FS} fill={E.ink} anchor="end">iaqtechnology.com.my</T>
      {zones && <Zones w={w} h={h} zones={zones} />}
    </Svg>
  )
}

/* 3, the back wall, 2046 × 3472, 1736 visible: ALL field red. The white IAQ big across the top, the raised screen set into
   the red, the cleanroom statement in white under it, the white seven lines at the foot; the 310 mm inside wall 2 carries
   on in red, plain */
export const E_MARK = 1100
export function W3E({ zones, bleed, print, still = '/booth/screen-still.webp' }) {
  const w = 2046, h = 3472, vis = 1736, m = 150, sh = letterH(E_MARK), s = SCREEN3
  return (
    <Svg w={w} h={h} label="Wall 3, the screen wall, Direction E" bleed={bleed} bleedFill={E.field}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={E.field} />
      <MarkB x={m} y={140} w={E_MARK} tone="white" />
      <ScreenStill print={print} still={still} frame="#1B1B1B" />
      <H x={s.x} y={s.y + s.h + 200} size={150} fill={E.white}>Cleanrooms,</H>
      <H x={s.x} y={s.y + s.h + 360} size={150} fill={E.white}>built to class.</H>
      <Txt x={s.x} y={s.y + s.h + 410} w={s.w} h={120} size={46} lh={1.36} color={E.white}>Designed, built, hooked up and maintained by one IAQ team, from Shah Alam and Dresden.</Txt>
      <Seven x={-10} y={h - FOOT - sh} w={w + 20} h={sh} />
      {zones && <><Zones w={vis} h={h} zones={zones} /><HiddenNote /></>}
    </Svg>
  )
}

/* 4, the counter front, 600 × 1170, 170 mm radius top right: white, the IAQ, the statement, the code, one red line */
export function CounterE({ zones, bleed }) {
  const w = 600, h = 1170, r = 170, mw = 260
  const shape = `M0 0H${w - r}A${r} ${r} 0 0 1 ${w} ${r}V${h}H0Z`
  const shapeB = `M-10 -10H${w - r}A${r + 10} ${r + 10} 0 0 1 ${w + 10} ${r}V${h + 10}H-10Z`
  return (
    <Svg w={w} h={h} label="Counter front, Direction E" bleed={bleed}>
      <defs><clipPath id="beCt"><path d={bleed ? shapeB : shape} /></clipPath></defs>
      <g clipPath="url(#beCt)">
        <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={E.white} />
        <MarkB x={60} y={70} w={mw} tone="light" />
        <H x={60} y={300} size={54} fill={E.ink}>Cleanrooms,</H>
        <H x={60} y={362} size={54} fill={E.red}>built to class.</H>
        <Qr x={60} y={430} s={270} />   {/* 30 Sep, evening: 270 mm, 9.3 mm a module */}
        <Txt x={362} y={426} w={178} h={200} size={26} lh={1.35} color={E.tx2}>Scan for the 3D story, the services and the projects.</Txt>
        <Line x={60} y={790} w={480} t={lineT(mw)} fill={E.red} />
        <T x={60} y={846} size={26} weight={500} font={FS} fill={E.ink}>{QR_URL}</T>
      </g>
      {!bleed && <path d={shape} fill="none" stroke="#DCE2EC" strokeWidth="3" className="bt-bleedline" />}
      {zones && <Zones w={w} h={h} zones={zones} />}
    </Svg>
  )
}

/* ================================================================ print collateral */

/* the leaflet, A5 148 × 210. Front: the red plane at the top (the white IAQ, the statement), then white: one IAQ cleanroom
   in a square block, the show, the code, the red line */
export function FlyerFrontE({ bleed }) {
  const w = 148, h = 210, mw = 34
  return (
    <Svg w={w} h={h} label="Leaflet, Direction E, front" bleed={bleed} bleedFill={E.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={E.white} />
      <rect x="-10" y="-10" width={w + 20} height="84" fill={E.field} />
      <MarkB x={12} y={12} w={mw} tone="white" />
      <H x={12} y={46} size={8.6} fill={E.white}>Cleanrooms,</H>
      <H x={12} y={56.5} size={8.6} fill={E.white}>built to class.</H>
      <Txt x={12} y={61} w={120} h={12} size={3.1} lh={1.4} color={E.white}>Designed, built, hooked up and maintained by one IAQ team since 1995.</Txt>
      <Photo href={PH.ballroom2} x={12} y={86} w={68} h={68} />
      <H x={88} y={98} size={9} fill={E.ink}>31</H>
      <T x={88} y={103} size={2.7} fill={E.tx2}>years building controlled</T>
      <T x={88} y={106.6} size={2.7} fill={E.tx2}>environments</T>
      <H x={88} y={122} size={9} fill={E.ink}>250+</H>
      <T x={88} y={127} size={2.7} fill={E.tx2}>projects completed</T>
      <H x={88} y={143} size={9} fill={E.ink}>7</H>
      <T x={88} y={148} size={2.7} fill={E.tx2}>countries with an IAQ office</T>
      <H x={12} y={167} size={4.8} fill={E.ink}>Meet IAQ at SEMICON Europa 2026</H>
      <T x={12} y={173.5} size={3.3} fill={E.tx2}>Messe München, 10 to 13 November</T>
      <T x={12} y={178.5} size={3.3} fill={E.tx2}>Stand to confirm</T>
      <Qr x={112} y={160} s={24} />
      <Line x={12} y={186} w={124} t={lineT(mw)} fill={E.red} />
      <T x={12} y={195} size={3.2} weight={500} font={FS} fill={E.ink}>iaqtechnology.com.my</T>
      <T x={136} y={195} size={3.2} weight={500} font={FS} fill={E.ink} anchor="end">business@iaqtechnology.com.my</T>
    </Svg>
  )
}
/* back, white: the IAQ, the three units, one IAQ cleanroom, the record, Dresden, headquarters, the stand slot */
export function FlyerBackE({ bleed }) {
  const w = 148, h = 210
  return (
    <Svg w={w} h={h} label="Leaflet, Direction E, back" bleed={bleed} bleedFill={E.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={E.white} />
      <MarkB x={12} y={10} w={20} tone="light" />
      <H x={12} y={30} size={7.4} fill={E.ink}>Three units,</H>
      <H x={12} y={39} size={7.4} fill={E.red}>one accountable team.</H>
      {UNITS.map((u, i) => {
        const y = 52 + i * 21
        return (
          <g key={u.k}>
            <H x={12} y={y} size={4.4} fill={E.ink}>{u.k}</H>
            <T x={12} y={y + 4.2} size={2.7} weight={500} font={FS} fill={E.tx2}>{u.full}</T>
            <Txt x={12} y={y + 5.6} w={124} h={10} size={3} lh={1.36} color={E.tx2}>{u.t}</Txt>
          </g>
        )
      })}
      <rect x="-10" y="114" width={w + 20} height="42" fill={E.light} />
      {PROOF.map(([n, l], i) => {
        const x = 12 + (i % 2) * 64, y = 127 + Math.floor(i / 2) * 16
        return (
          <g key={n}>
            <H x={x} y={y} size={7.6} fill={E.ink}>{n}</H>
            <T x={x} y={y + 4.4} size={2.7} fill={E.tx2}>{l}</T>
          </g>
        )
      })}
      <H x={12} y={168} size={3.4} fill={E.ink}>IAQ Engineering (DE) GmbH, Dresden</H>
      <Txt x={12} y={170} w={58} h={10} size={2.9} lh={1.45} color={E.tx2}>8. OG, Budapester Straße 5, 01069 Dresden<br />+49 351 4387 9529</Txt>
      <H x={12} y={186} size={3.4} fill={E.ink}>Headquarters, Shah Alam, Malaysia</H>
      <Txt x={12} y={188} w={58} h={10} size={2.9} lh={1.45} color={E.tx2}>+603 5124 8319<br />business@iaqtechnology.com.my</Txt>
      <H x={76} y={168} size={3.4} fill={E.ink}>Your contact</H>
      <Txt x={76} y={170} w={30} h={10} size={2.9} lh={1.45} color={E.tx2}>Contact details to follow from IAQ</Txt>
      <Qr x={112} y={166} s={24} />
      <T x={112} y={198} size={3} weight={600} font={FS} fill={E.ink}>Book a meeting</T>
    </Svg>
  )
}

/* the roll-up, 850 × 2000: the red plane at the top with the white IAQ and the statement, then white: one IAQ cleanroom in
   a square block, the line at 1633 */
export function RollUpE({ bleed }) {
  const w = 850, h = 2000, m = 85, mw = 425, ps = w - 2 * m
  return (
    <Svg w={w} h={h} label="Roll-up, Direction E" bleed={bleed} bleedFill={E.white}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={E.white} />
      <rect x="-10" y="-10" width={w + 20} height="720" fill={E.field} />
      <MarkB x={m} y={102} w={mw} tone="white" />
      <H x={m} y={470} size={96} fill={E.white}>Cleanrooms,</H>
      <H x={m} y={572} size={96} fill={E.white}>built to class.</H>
      <Txt x={m} y={600} w={w - 2 * m} h={90} size={30} lh={1.36} color={E.white}>Designed, built, hooked up and maintained by one IAQ team.</Txt>
      <Photo href={PH.ballroom} x={m} y={790} w={ps} h={ps} />
      <Line x={m} y={1633} w={w - 2 * m} t={lineT(mw)} fill={E.red} />
      <T x={m} y={1690} size={28} weight={500} font={FS} fill={E.ink}>iaqtechnology.com.my</T>
      <T x={w - m} y={1690} size={28} weight={500} font={FS} fill={E.ink} anchor="end">Shah Alam and Dresden</T>
    </Svg>
  )
}

/* ================================================================ digital (px) */

/* LinkedIn, four posts at 1080 × 1350: the red plane at the top (the white IAQ, the statement), then white: one line, one
   photograph in its block, the red action, the red line above the foot */
function PostE({ label, h1, h2, lede, photo, at, act, after, footL, footR }) {
  const w = 1080, h = 1350, m = 80, mw = 200
  return (
    <Svg w={w} h={h} label={label}>
      <rect width={w} height={h} fill={E.white} />
      <rect width={w} height="460" fill={E.field} />
      <MarkB x={m} y={80} w={mw} tone="white" />
      <H x={m} y={300} size={96} fill={E.white}>{h1}</H>
      <H x={m} y={400} size={96} fill={E.white}>{h2}</H>
      <Txt x={m} y={488} w={w - 2 * m} h={90} size={30} lh={1.36} color={E.tx2}>{lede}</Txt>
      <Photo href={photo} x={m} y={594} w={w - 2 * m} h={426} at={at} />
      {act && <Act x={m} y={1062} w={w - 2 * m} h={80} size={30} t={act} after={after} afterColor={E.tx2} />}
      <Line x={m} y={1190} w={w - 2 * m} t={lineT(mw)} fill={E.red} />
      {footL && <T x={m} y={1250} size={28} weight={500} font={FS} fill={E.ink}>{footL}</T>}
      {footR && <T x={w - m} y={1250} size={28} weight={500} font={FS} fill={E.ink} anchor="end">{footR}</T>}
    </Svg>
  )
}
export const Post1E = () => <PostE label="LinkedIn post 1, three weeks out, Direction E" h1="Meet IAQ" h2="in Munich." lede={'SEMICON Europa 2026, Messe München, 10 to 13 November.'} photo={PH.ballroom} act="Book a meeting" after="Stand to confirm" footL="iaqtechnology.com.my/semicon" />
export const Post2E = () => <PostE label="LinkedIn post 2, one week out, Direction E" h1="From Shah Alam" h2="to Dresden." lede="Offices in seven countries, and a team in Germany: IAQ Engineering (DE) GmbH, Dresden." photo={PH.utilities} footL="Messe München, 10 to 13 November" footR="iaqtechnology.com.my/semicon" />
export const Post3E = ({ photo = '/booth/still-post3-e.webp' }) => <PostE label="LinkedIn post 3, opening day, Direction E" h1="The stand" h2="is open." lede="See a fab built layer by layer, on the screen." photo={photo} act="Find us at the stand" after="Messe München" footL="iaqtechnology.com.my/semicon" />
export const Post4E = ({ photo = '/booth/still-post4-e.webp' }) => <PostE label="LinkedIn post 4, thank you, Direction E" h1="Thank you," h2="Munich." lede="Four days of briefs and conversations. Every one gets an answer within one working day." photo={photo} footL="SEMICON Europa 2026" footR="iaqtechnology.com.my" />

/* web ads, four sizes: the red plane with the white IAQ and the statement, white under it, one red action */
export function AdE({ size }) {
  const [w, h] = size
  const act = (x, y, ww, hh, s, end) => <Act x={x} y={y} w={ww} h={hh} size={s} t="Book a meeting" end={end} />
  if (w > h * 3) return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}, Direction E`}>
      <rect width={w} height={h} fill={E.white} />
      <rect width="150" height={h} fill={E.field} />
      <MarkB x={20} y={28} w={110} tone="white" />
      <H x={176} y={42} size={20} fill={E.ink}>Cleanrooms, <tspan fill={E.red}>built to class.</tspan></H>
      <T x={176} y={64} size={12.5} fill={E.tx2}>SEMICON Europa, Messe München, 10 to 13 Nov</T>
      {act(540, 27, 168, 40, 14, true)}
    </Svg>
  )
  if (h > w * 3) return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}, Direction E`}>
      <rect width={w} height={h} fill={E.white} />
      <rect width={w} height="170" fill={E.field} />
      <MarkB x={16} y={24} w={128} tone="white" />
      <H x={16} y={122} size={19} fill={E.white}>Cleanrooms,</H>
      <H x={16} y={146} size={19} fill={E.white}>built to class.</H>
      <Photo href={PH.ballroom} x={16} y={190} w={w - 32} h={170} />
      <Txt x={16} y={384} w={w - 32} h={60} size={13} lh={1.35} color={E.tx2}>SEMICON Europa, Munich, 10 to 13 Nov</Txt>
      {act(16, 450, w - 32, 34, 13)}
    </Svg>
  )
  if (h > w * 1.5) return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}, Direction E`}>
      <rect width={w} height={h} fill={E.white} />
      <rect width={w} height="216" fill={E.field} />
      <MarkB x={24} y={28} w={120} tone="white" />
      <H x={24} y={146} size={34} fill={E.white}>Cleanrooms,</H>
      <H x={24} y={184} size={34} fill={E.white}>built to class.</H>
      <Txt x={24} y={236} w={w - 48} h={60} size={15} lh={1.4} color={E.tx2}>Meet IAQ at SEMICON Europa, Messe München, 10 to 13 November.</Txt>
      <Photo href={PH.ballroom} x={24} y={300} w={w - 48} h={190} />
      {act(24, 514, w - 48, 40, 16)}
    </Svg>
  )
  return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}, Direction E`}>
      <rect width={w} height={h} fill={E.white} />
      <rect width={w} height="136" fill={E.field} />
      <MarkB x={20} y={18} w={86} tone="white" />
      <H x={20} y={92} size={25} fill={E.white}>Cleanrooms,</H>
      <H x={20} y={120} size={25} fill={E.white}>built to class.</H>
      <T x={20} y={170} size={13} fill={E.tx2}>SEMICON Europa, Munich, 10 to 13 Nov</T>
      {act(20, 188, w - 40, 36, 14)}
    </Svg>
  )
}

/* the email signature banner, 600 × 150: the red block with the white IAQ, white beside it, one IAQ cleanroom */
export function SignatureE() {
  const w = 600, h = 150
  return (
    <Svg w={w} h={h} label="Email signature banner, Direction E">
      <rect width={w} height={h} fill={E.white} />
      <rect width="170" height={h} fill={E.field} />
      <MarkB x={24} y={24} w={112} tone="white" />
      <H x={196} y={64} size={19} fill={E.ink}>Meet IAQ at SEMICON Europa</H>
      <T x={196} y={88} size={12.5} fill={E.tx2}>Messe München, 10 to 13 November</T>
      <T x={196} y={108} size={12.5} fill={E.tx2}>Stand to confirm</T>
      <Photo href={PH.ballroom} x={470} y={0} w={130} h={h} />
    </Svg>
  )
}

export const ART_E = { 'w1-e': W1E, 'w2-e': W2E, 'w3-e': W3E, 'ct-e': CounterE }
export const POSTS_E = { post1: Post1E, post2: Post2E, post3: Post3E, post4: Post4E }
const ADS_E = [[300, 250], [728, 90], [300, 600], [160, 600]]
export const PIECES_E = {
  'w1-e': { C: W1E, w: 310, h: 3472, unit: 'mm', k: 'Wall 1, aisle column, Direction E', print: true },
  'w2-e': { C: W2E, w: 2852, h: 3472, unit: 'mm', k: 'Wall 2, side wall, Direction E', print: true },
  'w3-e': { C: W3E, w: 2046, h: 3472, unit: 'mm', k: 'Wall 3, the screen wall, Direction E', print: true },
  'ct-e': { C: CounterE, w: 600, h: 1170, unit: 'mm', k: 'Counter front, Direction E', print: true },
  flyerE1: { C: FlyerFrontE, w: 148, h: 210, unit: 'mm', k: 'Leaflet, Direction E, front', print: true },
  flyerE2: { C: FlyerBackE, w: 148, h: 210, unit: 'mm', k: 'Leaflet, Direction E, back', print: true },
  rollE: { C: RollUpE, w: 850, h: 2000, unit: 'mm', k: 'Roll-up, Direction E', print: true },
  'post1-e': { C: Post1E, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 1, three weeks out, Direction E' },
  'post2-e': { C: Post2E, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 2, one week out, Direction E' },
  'post3-e': { C: Post3E, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 3, opening day, Direction E' },
  'post4-e': { C: Post4E, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 4, thank you, Direction E' },
  'sig-e': { C: SignatureE, w: 600, h: 150, unit: 'px', k: 'Email signature, Direction E' },
  ...Object.fromEntries(ADS_E.map(s => ['ad' + s.join('x') + '-e', { C: p => <AdE size={s} {...p} />, w: s[0], h: s[1], unit: 'px', k: `Web ad ${s[0]} × ${s[1]}, Direction E` }])),
}
