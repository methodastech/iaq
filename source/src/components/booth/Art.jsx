import React, { useMemo } from 'react'
import Icon from '../FlowIcon.jsx'
import { isLand, GW, GH } from '../../data/landBits.js'
import { QR_PATH, QR_VIEWBOX, QR_URL } from '../../data/boothQr.js'
import { MESSAGE } from '../../data/booth.js'
import { MARK_VB, MARK_RED, MARK_REG } from '../../assets/booth/iaq-mark-paths.js'
import { ISO_FAB, ISO_VB } from '../../assets/booth/iso-fab.js'

/* ============================================================================
   The SEMICON Europa 2026 artwork (22 Sep 2026, finished designs; the first drafts are in
   src/_backups/booth-0922/Art.drafts.jsx). Bazil: "you have to design all the things I ask for".

   Every piece is an SVG whose viewBox is its real size: millimetres for print, pixels for screens.
   Everything in it is vector (the mark traced from IAQ's own PNG, IAQ's exploded isometric of a fab,
   the dot world from the site's globe, the QR, the line icons, the type), so the same drawing prints
   at 1:1 on a 3.5 m wall with no loss (tools/export-booth-print-0922.mjs).

   One system across every surface: a white cleanroom ground, the mark, the fab drawn layer by layer,
   a 250 mm navy plinth that runs round the whole IAQ zone at the same height, the logo's own stripes
   as the one graphic device, and IAQ Red kept to a signal (Brand OS v3.1: about six percent of a
   surface; on navy or red the mark sits in a white panel; Poppins for headlines, Urbanist for text,
   League Spartan for labels).

   `print` drops everything that is a note to the reader (the screen still, the hidden strip's label).
   `zones` draws the content bands; `bleed` draws the 10 mm bleed.
   ============================================================================ */

export const C = { red: '#EC2027', deep: '#B5121B', navy: '#0A101F', ink: '#0C1220', white: '#F7F9FC', paper: '#FFFFFF', mist: '#828B9E', soft: '#48536A', line: '#DCE2EC', dot: '#C4CBD8', tint: '#EEF1F5' }
const FD = "'Poppins','Switzer','Instrument Sans',system-ui,sans-serif"
const FB = "'Urbanist','Instrument Sans',system-ui,sans-serif"
const FL = "'League Spartan','Urbanist','Instrument Sans',sans-serif"
const MARK_AR = MARK_VB[2] / MARK_VB[3]
const ISO = ISO_VB.split(' ').map(Number)
/* the drawing's right edge, before the stubs that led to its old labels */
const ISO_CLIP = 668

/* ---------------------------------------------------------------- parts */
export function Mark({ x, y, w, panel, pad = 0.16 }) {
  const h = w / MARK_AR, p = panel ? w * pad : 0
  return (
    <g>
      {panel && <rect x={x} y={y} width={w + p * 2} height={h + p * 2} fill="#fff" />}
      <svg x={x + p} y={y + p} width={w} height={h} viewBox={MARK_VB.join(' ')}>
        <path fill="#E30613" fillRule="evenodd" d={MARK_RED} />
        <path fill="#1D1D1B" fillRule="evenodd" d={MARK_REG} />
      </svg>
    </g>
  )
}
export const markH = w => w / MARK_AR

/* IAQ's exploded isometric of a fab, four trays: roof and plant, cleanroom ceiling, fab floor, sub-fab */
export function IsoFab({ x, y, w }) {
  const h = w * ISO[3] / ISO_CLIP
  return <svg x={x} y={y} width={w} height={h} viewBox={`0 0 ${ISO_CLIP} ${ISO[3]}`} overflow="hidden" dangerouslySetInnerHTML={{ __html: ISO_FAB }} />
}
export const isoH = w => w * ISO[3] / ISO_CLIP
/* where each tray's right edge sits, as a fraction of the drawing's height (read off the drawing) */
export const TRAYS = [
  { f: 0.29, k: 'Roof and plant', t: 'Air handling, chillers, the exhaust stack' },
  { f: 0.462, k: 'Cleanroom', t: 'Ceiling grid, fan filter units, return air' },
  { f: 0.634, k: 'Fab floor', t: 'Waffle deck, process tools, the tool hook-up' },
  { f: 0.807, k: 'Sub-fab', t: 'Process utilities, piles, cable ladders' },
]

/* the logo's stripes, as a graphic: layered construction, floor by floor */
export function Stripes({ x, y, w, n = 5, h = 18, gap = 10, fill = C.red, o = 1 }) {
  return <g opacity={o}>{Array.from({ length: n }, (_, i) => <rect key={i} x={x} y={y + i * (h + gap)} width={w} height={h} fill={fill} />)}</g>
}

export function Ic({ name, x, y, s, color = C.red, sw = 1.1 }) {
  return <svg x={x} y={y} width={s} height={s} viewBox="0 0 24 24" style={{ color }} strokeWidth={sw}><Icon name={name} /></svg>
}

export const OFFICES = [
  { k: 'Malaysia', s: 'HQ, Shah Alam', lat: 3.1, lon: 101.7, hq: true },
  { k: 'Singapore', lat: 1.35, lon: 103.82, dy: 1.25 },
  { k: 'Germany', s: 'Dresden', lat: 51.05, lon: 13.74, eu: true, dy: 0.25 },
  { k: 'India', s: 'Ahmedabad', lat: 23.03, lon: 72.58 },
  { k: 'Sweden', lat: 59.33, lon: 18.07, eu: true, dy: -0.75 },
  { k: 'United States', lat: 33.45, lon: -112.07 },
  { k: 'Ireland', lat: 53.35, lon: -6.26, eu: true, left: true },
]
const LON0 = -135, LON1 = 160, LAT0 = 74, LAT1 = -46
export const mapH = w => w * (LAT0 - LAT1) / (LON1 - LON0)
export function DotMap({ x, y, w, label = 1, dot = C.dot, ink = C.ink, sub = C.mist, showLabels = true, marker = 1 }) {
  const h = mapH(w)
  const P = (lat, lon) => [x + (lon - LON0) / (LON1 - LON0) * w, y + (LAT0 - lat) / (LAT0 - LAT1) * h]
  const cell = w / ((LON1 - LON0) / (360 / GW))
  const dots = useMemo(() => {
    const out = []
    for (let gy = 0; gy < GH; gy++) {
      const lat = 90 - (gy + 0.5) * (180 / GH)
      if (lat > LAT0 || lat < LAT1) continue
      for (let gx = 0; gx < GW; gx++) {
        const lon = (gx + 0.5) * (360 / GW) - 180
        if (lon < LON0 || lon > LON1 || !isLand(gy, gx)) continue
        out.push(P(lat, lon))
      }
    }
    return out
  }, [x, y, w])
  const L = cell * 1.9 * label
  return (
    <g>
      {dots.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={cell * 0.34} fill={dot} />)}
      {OFFICES.map(o => {
        const [cx, cy] = P(o.lat, o.lon), col = o.eu ? C.red : ink, r = cell * (o.hq ? 0.95 : 0.72) * marker
        const tx = o.left ? cx - r - L * 0.45 : cx + r + L * 0.45
        return (
          <g key={o.k}>
            <circle cx={cx} cy={cy} r={r * 2.4} fill={col} opacity=".16" />
            <circle cx={cx} cy={cy} r={r} fill={col} />
            {showLabels && <text x={tx} y={cy + (o.dy || 0) * L} textAnchor={o.left ? 'end' : 'start'} fontFamily={FD} fontWeight="600" fontSize={L} fill={ink} dominantBaseline="middle">
              {o.k}{o.s && <tspan fontFamily={FB} fontWeight="500" fill={sub} fontSize={L * 0.78}>{'  ' + o.s}</tspan>}
            </text>}
          </g>
        )
      })}
    </g>
  )
}

export function Qr({ x, y, s, fill = C.ink, quiet = true }) {
  const n = +QR_VIEWBOX.split(' ')[2]
  return (
    <g>
      {quiet && <rect x={x - s * 0.08} y={y - s * 0.08} width={s * 1.16} height={s * 1.16} fill="#fff" />}
      <path d={QR_PATH} fill={fill} transform={`translate(${x} ${y}) scale(${s / n})`} />
    </g>
  )
}

/* text that wraps inside a box (foreignObject), for the few multi-line blocks. HTML lays lines out on whole CSS pixels,
   so at millimetre sizes (the flyer's 3 mm text) the line gaps came out uneven: small text is laid out K times larger
   and scaled back down, so every line sits on its true pitch, on screen and in the PDF */
const Para = ({ x, y, w, h, size, lh = 1.35, color = C.soft, weight = 500, font = FB, children, ls }) => {
  const K = size < 20 ? 10 : 1
  const lsK = ls && K > 1 && /px$/.test(ls) ? parseFloat(ls) * K + 'px' : ls
  return (
    <g transform={`translate(${x} ${y}) scale(${1 / K})`}>
      <foreignObject x="0" y="0" width={w * K} height={h * K}>
        <div xmlns="http://www.w3.org/1999/xhtml" style={{ font: `${weight} ${size * K}px/${lh} ${font}`, color, letterSpacing: lsK }}>{children}</div>
      </foreignObject>
    </g>
  )
}

function Zones({ w, h, zones }) {
  return (
    <g pointerEvents="none">
      {zones.map(([range], i) => {
        const m = range.match(/(\d+)\s*to\s*(\d+)/)
        if (!m) return null
        const a = +m[1], b = +m[2], y0 = h - b, hh = b - a
        return (
          <g key={i}>
            <rect x="0" y={y0} width={w} height={hh} fill={i % 2 ? 'rgba(37,99,235,.10)' : 'rgba(16,185,129,.10)'} stroke="rgba(37,99,235,.55)" strokeWidth={w / 400} strokeDasharray={`${w / 60} ${w / 90}`} />
            <text x={w * 0.02} y={y0 + Math.min(hh * 0.5, w * 0.05)} fontFamily={FB} fontWeight="700" fontSize={Math.max(w * 0.028, 24)} fill="#1D4ED8">{range}</text>
          </g>
        )
      })}
    </g>
  )
}
function Svg({ w, h, children, label, bleed, className = '', bleedFill }) {
  /* 10 mm on the stand and the roll-ups, as berrylife's guidelines ask; 3 mm on the A5 flyer, as a litho printer expects */
  const b = bleed ? (Math.max(w, h) < 400 ? 3 : 10) : 0
  return (
    <svg className={'bt-art ' + className} viewBox={`${-b} ${-b} ${w + 2 * b} ${h + 2 * b}`} role="img" aria-label={label} preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      {bleed && bleedFill && <rect x={-b} y={-b} width={w + 2 * b} height={h + 2 * b} fill={bleedFill} />}
      {children}
      {bleed && <rect x={-b} y={-b} width={w + 2 * b} height={h + 2 * b} fill="none" stroke="rgba(236,32,39,.7)" strokeWidth={Math.max(w, h) / 900} strokeDasharray="8 6" pointerEvents="none" className="bt-bleedline" />}
    </svg>
  )
}
/* the navy plinth every IAQ surface shares, 250 mm high */
const Plinth = ({ w, h, H = 250, children }) => <g><rect x="-10" y={h - H} width={w + 20} height={H + 10} fill={C.navy} />{children}</g>

const UNIT_ICON = { EPC: 'crane', 'PCU & TTI': 'link', EFM: 'power' }
const UNIT_LINE = { EPC: 'Builds the facility, under one contract.', 'PCU & TTI': 'Utilities and tool installation, in a live fab.', EFM: 'Runs and maintains it; cuts the energy bill.' }

/* ================================================================ the stand */

/* 1 · the aisle column, 310 × 3472 */
export function W1({ zones, bleed }) {
  const w = 310, h = 3472
  return (
    <Svg w={w} h={h} label="Wall 1, the aisle column" bleed={bleed} bleedFill={C.red}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={C.red} />
      <Mark x={40} y={130} w={196} panel pad={0.14} />
      <text transform={`translate(${w / 2 + 36} ${h - 1000}) rotate(-90)`} fontFamily={FD} fontWeight="600" fontSize="96" fill="#fff" letterSpacing="-1.5">{MESSAGE.tagline}</text>
      <Stripes x={40} y={h - 250 - 200} w={w - 80} n={4} h={22} gap={16} fill="#fff" o={0.22} />
      <Plinth w={w} h={h} />
      {zones && <Zones w={w} h={h} zones={zones} />}
    </Svg>
  )
}

/* 2A · the side wall, global presence (the berrylife concept), 2852 × 3472 */
export function W2({ zones, bleed }) {
  const w = 2852, h = 3472, m = 150
  return (
    <Svg w={w} h={h} label="Wall 2, global presence" bleed={bleed} bleedFill={C.paper}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={C.paper} />
      <Stripes x={m} y={170} w={120} n={3} h={16} gap={12} />
      <text x={m} y={400} fontFamily={FD} fontWeight="600" fontSize="162" fill={C.ink} letterSpacing="-5">From Shah Alam to <tspan fill={C.red}>Dresden.</tspan></text>
      <text x={m} y={530} fontFamily={FB} fontWeight="500" fontSize="62" fill={C.soft}>Offices in seven countries. In Germany: IAQ Engineering (DE) GmbH, Dresden.</text>
      <DotMap x={m} y={660} w={w - m * 2} label={1.9} />
      {MESSAGE.proof.map(([n, l], i) => {
        const cw = (w - m * 2) / 2, x = m + (i % 2) * cw, y = 2090 + Math.floor(i / 2) * 330
        return (
          <g key={n}>
            <text x={x} y={y} fontFamily={FD} fontWeight="600" fontSize="156" fill={C.ink} letterSpacing="-5">{n}</text>
            <text x={x} y={y + 80} fontFamily={FB} fontWeight="500" fontSize="56" fill={C.soft}>{l}</text>
          </g>
        )
      })}
      <Plinth w={w} h={h}>
        <text x={m} y={h - 102} fontFamily={FL} fontWeight="600" fontSize="56" fill="#fff" letterSpacing="7">YOUR TOTAL FACILITY SOLUTIONS PROVIDER</text>
        <text x={w - m} y={h - 102} textAnchor="end" fontFamily={FB} fontWeight="600" fontSize="56" fill="#fff">iaqtechnology.com.my</text>
      </Plinth>
      {zones && <Zones w={w} h={h} zones={zones} />}
    </Svg>
  )
}

/* 2B · the side wall, option B: every layer of the fab, 2852 × 3472 */
export function W2B({ zones, bleed }) {
  const w = 2852, h = 3472, m = 150, fw = 1480, fx = m - 40, fy = 640, fh = isoH(fw)
  return (
    <Svg w={w} h={h} label="Wall 2, option B: every layer of the fab" bleed={bleed} bleedFill={C.paper}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={C.paper} />
      <Stripes x={m} y={170} w={120} n={3} h={16} gap={12} />
      <text x={m} y={400} fontFamily={FD} fontWeight="600" fontSize="150" fill={C.ink} letterSpacing="-5">Every layer of the fab,</text>
      <text x={m} y={560} fontFamily={FD} fontWeight="600" fontSize="150" fill={C.red} letterSpacing="-5">one accountable team.</text>
      <IsoFab x={fx} y={fy} w={fw} />
      {TRAYS.map((t, i) => {
        const y = fy + fh * t.f, x = fx + fw * 0.99
        return (
          <g key={t.k}>
            <text x={x + 40} y={y - 20} fontFamily={FD} fontWeight="600" fontSize="84" fill={C.ink} letterSpacing="-2"><tspan fill={C.red}>{String(4 - i).padStart(2, '0')}</tspan>  {t.k}</text>
            <text x={x + 40} y={y + 62} fontFamily={FB} fontWeight="500" fontSize="54" fill={C.soft}>{t.t}</text>
          </g>
        )
      })}
      <Plinth w={w} h={h}>
        <text x={m} y={h - 102} fontFamily={FL} fontWeight="600" fontSize="56" fill="#fff" letterSpacing="7">YOUR TOTAL FACILITY SOLUTIONS PROVIDER</text>
        <text x={w - m} y={h - 102} textAnchor="end" fontFamily={FB} fontWeight="600" fontSize="56" fill="#fff">iaqtechnology.com.my</text>
      </Plinth>
      {zones && <Zones w={w} h={h} zones={zones} />}
    </Svg>
  )
}

/* 3 · the back wall, 2046 × 3472, 1736 visible, the 55 inch screen at 1500 mm */
export function W3({ zones, bleed, print, still = '/booth/screen-still.webp' }) {
  const w = 2046, h = 3472, vis = 1736, m = 130
  const sc = { x: 249, w: 1238, y: h - 1500 - 709, h: 709 }
  const tagW = 900
  return (
    <Svg w={w} h={h} label="Wall 3, the screen wall" bleed={bleed} bleedFill={C.paper}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={C.paper} />
      {/* Lockup B: the tagline under the mark, at the mark's full width */}
      <Mark x={m} y={170} w={tagW} />
      <text x={m} y={170 + markH(tagW) + 96} fontFamily={FL} fontWeight="600" fontSize="51" fill={C.ink} letterSpacing="3" textLength={tagW} lengthAdjust="spacing">YOUR TOTAL FACILITY SOLUTIONS PROVIDER</text>
      <text x={m} y={880} fontFamily={FD} fontWeight="600" fontSize="126" fill={C.ink} letterSpacing="-4">Controlled environments,</text>
      <text x={m} y={1030} fontFamily={FD} fontWeight="600" fontSize="126" fill={C.red} letterSpacing="-4">built to class.</text>
      {/* the screen: nothing is printed behind it; the still is for the preview only */}
      {!print && (
        <g>
          <rect x={sc.x - 8} y={sc.y - 8} width={sc.w + 16} height={sc.h + 16} fill="#11151F" />
          <image href={still} x={sc.x} y={sc.y} width={sc.w} height={sc.h} preserveAspectRatio="xMidYMid slice" />
        </g>
      )}
      {MESSAGE.units.map((u, i) => {
        const cw = (vis - m * 2) / 3, x = m + i * cw, y = h - 1390
        return (
          <g key={u.k}>
            <Ic name={UNIT_ICON[u.k]} x={x - 6} y={y} s={96} />
            <text x={x} y={y + 172} fontFamily={FD} fontWeight="600" fontSize="64" fill={C.ink} letterSpacing="-1">{u.k}</text>
            <Para x={x} y={y + 196} w={cw - 50} h={150} size={37} lh={1.3}>{UNIT_LINE[u.k]}</Para>
          </g>
        )
      })}
      <Stripes x={m} y={h - 250 - 330} w={vis - m * 2} n={3} h={14} gap={22} fill={C.line} />
      <Plinth w={w} h={h}>
        <text x={m} y={h - 104} fontFamily={FB} fontWeight="600" fontSize="52" fill="#fff">iaqtechnology.com.my</text>
      </Plinth>
      {!print && (
        <g className="bt-note-layer">
          <rect x={vis} y="0" width={w - vis} height={h} fill="url(#btHatch)" />
          <defs><pattern id="btHatch" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="40" height="40" fill="rgba(12,18,32,.04)" /><line x1="0" y1="0" x2="0" y2="40" stroke="rgba(12,18,32,.14)" strokeWidth="6" /></pattern></defs>
          <text transform={`translate(${vis + (w - vis) / 2 + 14} ${h / 2}) rotate(-90)`} textAnchor="middle" fontFamily={FB} fontWeight="700" fontSize="44" fill={C.mist}>310 mm inside wall 2 · background only</text>
        </g>
      )}
      {zones && <Zones w={vis} h={h} zones={zones} />}
    </Svg>
  )
}

/* 4 · the counter front, 600 × 1170, 170 mm radius top right */
export function Counter({ zones, bleed }) {
  const w = 600, h = 1170, r = 170
  const shape = `M0 0H${w - r}A${r} ${r} 0 0 1 ${w} ${r}V${h}H0Z`
  const shapeB = `M-10 -10H${w - r}A${r + 10} ${r + 10} 0 0 1 ${w + 10} ${r}V${h + 10}H-10Z`
  return (
    <Svg w={w} h={h} label="Counter front" bleed={bleed}>
      <defs><clipPath id="btCt"><path d={bleed ? shapeB : shape} /></clipPath></defs>
      <g clipPath="url(#btCt)">
        <rect x="-10" y="-10" width={w + 20} height={h + 20} fill="#fff" />
        <Mark x={60} y={70} w={320} />
        <Para x={60} y={250} w={470} h={160} size={40} lh={1.16} color={C.ink} weight={600} font={FD} ls="-1px">Cleanrooms, utilities and tool hook-up, <span style={{ color: C.red }}>end to end.</span></Para>
        <Qr x={60} y={440} s={180} />
        <Para x={272} y={436} w={280} h={190} size={27} lh={1.35}>Scan for the 3D story, the services and the projects.</Para>
        <text x="60" y="690" fontFamily={FB} fontWeight="600" fontSize="26" fill={C.ink}>{QR_URL}</text>
        <Stripes x={60} y={760} w={480} n={3} h={10} gap={16} fill={C.line} />
        <rect x="-10" y={h - 150} width={w + 20} height="160" fill={C.navy} />
      </g>
      {!bleed && <path d={shape} fill="none" stroke={C.line} strokeWidth="3" className="bt-bleedline" />}
      {zones && <Zones w={w} h={h} zones={zones} />}
    </Svg>
  )
}

/* ================================================================ print collateral */

/* the flyer, A5 148 × 210, two sides */
export function FlyerFront({ bleed }) {
  const w = 148, h = 210, fw = 62
  return (
    <Svg w={w} h={h} label="Flyer, front" bleed={bleed}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill="#fff" />
      <rect x="-10" y="-10" width={w + 20} height="56" fill={C.navy} />
      <Mark x={12} y={12} w={32} panel pad={0.16} />
      <text x={w - 12} y={24} textAnchor="end" fontFamily={FL} fontWeight="600" fontSize="3.4" fill="#fff" letterSpacing=".45">MEET US AT SEMICON EUROPA</text>
      <text x={w - 12} y={30.5} textAnchor="end" fontFamily={FB} fontWeight="500" fontSize="3.4" fill="#C9D2E3">Messe München · 10 to 13 November 2026</text>
      <text x={w - 12} y={36.5} textAnchor="end" fontFamily={FB} fontWeight="600" fontSize="3.4" fill="#fff">Stand · to confirm</text>
      {/* the text column: 12 to 76 mm; the fab's column: 80 to 142 mm */}
      <text x="12" y="62" fontFamily={FD} fontWeight="600" fontSize="7.2" fill={C.ink} letterSpacing="-.25">Controlled</text>
      <text x="12" y="70.5" fontFamily={FD} fontWeight="600" fontSize="7.2" fill={C.ink} letterSpacing="-.25">environments,</text>
      <text x="12" y="79" fontFamily={FD} fontWeight="600" fontSize="7.2" fill={C.red} letterSpacing="-.25">built to class.</text>
      <Para x={12} y={84} w={62} h={34} size={3.3} lh={1.42}>IAQ designs, builds and commissions cleanrooms and the hi-tech facilities around them, hooks up the tools inside and keeps them running. Since 1995, from offices in seven countries, Germany among them.</Para>
      {MESSAGE.units.map((u, i) => (
        <g key={u.k}>
          <Ic name={UNIT_ICON[u.k]} x={11.5} y={124 + i * 20} s={6.5} />
          <text x={21} y={128.6 + i * 20} fontFamily={FD} fontWeight="600" fontSize="3.8" fill={C.ink}>{u.k}</text>
          <Para x={21} y={130 + i * 20} w={54} h={10} size={2.8} lh={1.3}>{UNIT_LINE[u.k]}</Para>
        </g>
      ))}
      <IsoFab x={w - fw - 6} y={52} w={fw} />
      <rect x="-10" y={h - 12} width={w + 20} height="22" fill={C.red} />
      <text x="12" y={h - 4.6} fontFamily={FB} fontWeight="600" fontSize="3.4" fill="#fff">Your Total Facility Solutions Provider</text>
      <text x={w - 12} y={h - 4.6} textAnchor="end" fontFamily={FB} fontWeight="600" fontSize="3.4" fill="#fff">iaqtechnology.com.my</text>
    </Svg>
  )
}
export function FlyerBack({ bleed }) {
  const w = 148, h = 210
  return (
    <Svg w={w} h={h} label="Flyer, back" bleed={bleed}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill="#fff" />
      <Stripes x={12} y={12} w={10} n={3} h={1.2} gap={1} />
      <text x="12" y="28" fontFamily={FD} fontWeight="600" fontSize="7.6" fill={C.ink} letterSpacing="-.2">One team, from the first drawing</text>
      <text x="12" y="37.5" fontFamily={FD} fontWeight="600" fontSize="7.6" fill={C.ink} letterSpacing="-.2">to the plant <tspan fill={C.red}>in operation.</tspan></text>
      {[
        ['Engineering design', 'compass'], ['Procurement', 'crate'], ['Construction', 'crane'],
        ['Testing and commissioning', 'gauge'], ['Maintenance', 'gear'], ['Tools hookup', 'link'],
      ].map(([t, ic], i) => (
        <g key={t}>
          <Ic name={ic} x={12 + (i % 3) * 46} y={48 + Math.floor(i / 3) * 18} s={6.4} color={C.ink} />
          <text x={12 + (i % 3) * 46} y={60.5 + Math.floor(i / 3) * 18} fontFamily={FB} fontWeight="600" fontSize="3.1" fill={C.ink}><tspan fill={C.red}>{i + 1}</tspan>  {t}</text>
        </g>
      ))}
      <text x="12" y="96" fontFamily={FL} fontWeight="600" fontSize="2.9" fill={C.mist} letterSpacing=".4">THE RECORD</text>
      {MESSAGE.proof.map(([n, l], i) => (
        <g key={n}>
          <text x={12 + (i % 2) * 64} y={108 + Math.floor(i / 2) * 20} fontFamily={FD} fontWeight="600" fontSize="9" fill={C.ink} letterSpacing="-.3">{n}</text>
          <text x={12 + (i % 2) * 64} y={113 + Math.floor(i / 2) * 20} fontFamily={FB} fontWeight="500" fontSize="2.9" fill={C.soft}>{l}</text>
        </g>
      ))}
      <rect x="-10" y="146" width={w + 20} height="74" fill={C.navy} />
      <text x="12" y="158" fontFamily={FL} fontWeight="600" fontSize="2.9" fill="#8E9BB4" letterSpacing=".4">IN GERMANY</text>
      <Para x={12} y={160} w={78} h={20} size={3.1} lh={1.45} color="#D3DBE9"><b style={{ color: '#fff', fontWeight: 600 }}>IAQ Engineering (DE) GmbH</b><br />8. OG, Budapester Straße 5, 01069 Dresden<br />+49 351 4387 9529</Para>
      <text x="12" y="186" fontFamily={FL} fontWeight="600" fontSize="2.9" fill="#8E9BB4" letterSpacing=".4">HEADQUARTERS</text>
      <Para x={12} y={188} w={78} h={14} size={3.1} lh={1.45} color="#D3DBE9">Shah Alam, Malaysia · +603 5124 8319<br />business@iaqtechnology.com.my</Para>
      <Qr x={106} y={158} s={28} />
      <text x={120} y={196} textAnchor="middle" fontFamily={FB} fontWeight="500" fontSize="2.8" fill="#C9D2E3">The 3D story, online</text>
    </Svg>
  )
}

/* the flyer, set B (22 Sep, Bazil: "front back leaflet A5 option please 2 design set"). Leads with the cleanroom, as IAQ
   asked for the European show, beside Green Excel's cleanroom products: IAQ builds the room AND the fab around it.
   Front: the headline, IAQ's exploded fab with its four layers named, the show in a navy foot with the code.
   Back: the three units (EPC first, the cleanroom builder), the record on a tint band, then Munich, Dresden and HQ. */
const B_UNITS = [
  { k: 'EPC', ic: 'crane', full: 'Engineering, Procurement and Construction', t: 'Cleanrooms and the whole hi-tech facility, under one contract: EPCC, or EPCM for the largest programmes.' },
  { k: 'PCU & TTI', ic: 'link', full: 'Process Critical Utilities & Total Tool Installation', t: 'Bulk gas, chemical, water and exhaust systems, then each tool connected, inside a fab that keeps running.' },
  { k: 'EFM', ic: 'power', full: 'Energy Facility Management', t: 'Runs and maintains the plant, and brings its energy bill down.' },
]
export function FlyerFrontB({ bleed }) {
  const w = 148, h = 210, fw = 74, fx = 6, fy = 50, fh = isoH(fw)
  return (
    <Svg w={w} h={h} label="Flyer, set B, front" bleed={bleed}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill="#fff" />
      <Mark x={12} y={12} w={30} />
      <Stripes x={w - 22} y={13} w={10} n={3} h={1.2} gap={1} />
      <text x="12" y="36" fontFamily={FD} fontWeight="600" fontSize="7.4" fill={C.ink} letterSpacing="-.25">The cleanroom, and</text>
      <text x="12" y="45" fontFamily={FD} fontWeight="600" fontSize="7.4" fill={C.red} letterSpacing="-.25">the whole fab around it.</text>
      <IsoFab x={fx} y={fy} w={fw} />
      {TRAYS.map((t, i) => {
        const y = fy + fh * t.f, x = fx + fw * 0.99
        return (
          <g key={t.k}>
            <text x={x + 3} y={y - 1.2} fontFamily={FD} fontWeight="600" fontSize="3.5" fill={C.ink}><tspan fill={C.red}>{String(4 - i).padStart(2, '0')}</tspan>  {t.k}</text>
            <Para x={x + 3} y={y + 0.4} w={w - x - 15} h={8} size={2.6} lh={1.3}>{t.t}</Para>
          </g>
        )
      })}
      <rect x="-10" y={h - 30} width={w + 20} height="40" fill={C.navy} />
      <text x="12" y={h - 21.5} fontFamily={FL} fontWeight="600" fontSize="3.1" fill="#8E9BB4" letterSpacing=".45">MEET US AT SEMICON EUROPA 2026</text>
      <text x="12" y={h - 14.5} fontFamily={FD} fontWeight="600" fontSize="4.6" fill="#fff">Messe München, 10 to 13 November</text>
      <text x="12" y={h - 8.5} fontFamily={FB} fontWeight="500" fontSize="3.2" fill="#C9D2E3">Stand to confirm · iaqtechnology.com.my</text>
      <Qr x={w - 30} y={h - 26} s={18} />
    </Svg>
  )
}
export function FlyerBackB({ bleed }) {
  const w = 148, h = 210
  return (
    <Svg w={w} h={h} label="Flyer, set B, back" bleed={bleed}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill="#fff" />
      <Stripes x={12} y={12} w={10} n={3} h={1.2} gap={1} />
      <text x="12" y="28" fontFamily={FD} fontWeight="600" fontSize="7.4" fill={C.ink} letterSpacing="-.2">Three units,</text>
      <text x="12" y="37" fontFamily={FD} fontWeight="600" fontSize="7.4" fill={C.red} letterSpacing="-.2">one accountable team.</text>
      {B_UNITS.map((u, i) => {
        const y = 48 + i * 22
        return (
          <g key={u.k}>
            <Ic name={u.ic} x={11.5} y={y} s={7} />
            <text x={23} y={y + 4.2} fontFamily={FD} fontWeight="600" fontSize="4.4" fill={C.ink}>{u.k}</text>
            <text x={23} y={y + 8.6} fontFamily={FB} fontWeight="600" fontSize="2.8" fill={C.mist}>{u.full}</text>
            <Para x={23} y={y + 10} w={112} h={10} size={3.1} lh={1.38}>{u.t}</Para>
          </g>
        )
      })}
      <rect x="-10" y="114" width={w + 20} height="34" fill={C.tint} />
      {MESSAGE.proof.map(([n, l], i) => {
        const x = 12 + i * 33
        return (
          <g key={n}>
            <text x={x} y={127} fontFamily={FD} fontWeight="600" fontSize={n.length > 6 ? 4.6 : 7} fill={C.ink} letterSpacing="-.2">{n}</text>
            <Para x={x} y={130} w={30} h={14} size={2.6} lh={1.3}>{l.replace(', Germany among them', '')}</Para>
          </g>
        )
      })}
      <rect x="-10" y="148" width={w + 20} height="72" fill={C.navy} />
      <text x="12" y="159" fontFamily={FL} fontWeight="600" fontSize="2.9" fill="#8E9BB4" letterSpacing=".4">IN GERMANY</text>
      <Para x={12} y={161} w={80} h={20} size={3.1} lh={1.45} color="#D3DBE9"><b style={{ color: '#fff', fontWeight: 600 }}>IAQ Engineering (DE) GmbH</b><br />8. OG, Budapester Straße 5, 01069 Dresden<br />+49 351 4387 9529</Para>
      <text x="12" y="186" fontFamily={FL} fontWeight="600" fontSize="2.9" fill="#8E9BB4" letterSpacing=".4">HEADQUARTERS</text>
      <Para x={12} y={188} w={80} h={14} size={3.1} lh={1.45} color="#D3DBE9">Shah Alam, Malaysia · +603 5124 8319<br />business@iaqtechnology.com.my</Para>
      <Qr x={106} y={158} s={28} />
      <text x={120} y={195.5} textAnchor="middle" fontFamily={FB} fontWeight="600" fontSize="3" fill="#fff">Book a meeting</text>
      <text x={120} y={200} textAnchor="middle" fontFamily={FB} fontWeight="500" fontSize="2.6" fill="#C9D2E3">{QR_URL}</text>
    </Svg>
  )
}

/* the roll-up, 850 × 2000. A: Brand OS design 1, navy crown, white field, red foot */
export function RollUp({ bleed }) {
  const w = 850, h = 2000, fw = 400
  return (
    <Svg w={w} h={h} label="Roll-up A" bleed={bleed} bleedFill="#fff">
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill="#fff" />
      <rect x="-10" y="-10" width={w + 20} height="410" fill={C.navy} />
      <Mark x={(w - 180 * 1.32) / 2} y={96} w={180} panel pad={0.16} />
      <text x={w / 2} y={330} textAnchor="middle" fontFamily={FL} fontWeight="600" fontSize="22" fill="#fff" letterSpacing="3.2">YOUR TOTAL FACILITY SOLUTIONS PROVIDER</text>
      <text x="70" y="530" fontFamily={FD} fontWeight="600" fontSize="70" fill={C.ink} letterSpacing="-2.4">Controlled</text>
      <text x="70" y="612" fontFamily={FD} fontWeight="600" fontSize="70" fill={C.ink} letterSpacing="-2.4">environments,</text>
      <text x="70" y="694" fontFamily={FD} fontWeight="600" fontSize="70" fill={C.red} letterSpacing="-2.4">built to class.</text>
      <IsoFab x={(w - fw) / 2 + 30} y={735} w={fw} />
      {MESSAGE.units.map((u, i) => (
        <g key={u.k}>
          <Ic name={UNIT_ICON[u.k]} x={70 + i * 250} y={1570} s={46} />
          <text x={70 + i * 250} y={1656} fontFamily={FD} fontWeight="600" fontSize="34" fill={C.ink}>{u.k}</text>
          <Para x={70 + i * 250} y={1668} w={220} h={90} size={20} lh={1.35}>{UNIT_LINE[u.k]}</Para>
        </g>
      ))}
      <rect x="-10" y={h - 200} width={w + 20} height="210" fill={C.red} />
      <text x={w / 2} y={h - 118} textAnchor="middle" fontFamily={FB} fontWeight="600" fontSize="34" fill="#fff">iaqtechnology.com.my</text>
    </Svg>
  )
}
/* B: Brand OS design 2, full navy, one statement */
export function RollUpB({ bleed }) {
  const w = 850, h = 2000
  return (
    <Svg w={w} h={h} label="Roll-up B" bleed={bleed} bleedFill={C.navy}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={C.navy} />
      <Mark x={70} y={110} w={180} panel pad={0.16} />
      <text x="70" y="600" fontFamily={FD} fontWeight="600" fontSize="96" fill="#fff" letterSpacing="-3.5">Controlled</text>
      <text x="70" y="712" fontFamily={FD} fontWeight="600" fontSize="96" fill="#fff" letterSpacing="-3.5">environments,</text>
      <text x="70" y="824" fontFamily={FD} fontWeight="600" fontSize="96" fill="#FF4D55" letterSpacing="-3.5">built to class.</text>
      <Para x={70} y={870} w={700} h={120} size={26} lh={1.45} color="#C9D2E3">Design, procurement, construction, testing and commissioning, and the tool hook-up, under one accountable team.</Para>
      <DotMap x={40} y={1080} w={770} label={1.55} dot="rgba(255,255,255,.2)" ink="#fff" sub="#9AA6BD" />
      <Stripes x={70} y={1560} w={90} n={3} h={10} gap={8} fill="#FF4D55" />
      <text x="70" y="1650" fontFamily={FD} fontWeight="600" fontSize="44" fill="#fff" letterSpacing="-1">From Shah Alam to Dresden.</text>
      <text x="70" y="1700" fontFamily={FB} fontWeight="500" fontSize="24" fill="#9AA6BD">Offices in seven countries, since 1995.</text>
      <text x="70" y={h - 160} fontFamily={FL} fontWeight="600" fontSize="24" fill="#fff" letterSpacing="3">YOUR TOTAL FACILITY SOLUTIONS PROVIDER</text>
      <text x="70" y={h - 116} fontFamily={FB} fontWeight="600" fontSize="30" fill="#FF4D55">iaqtechnology.com.my</text>
    </Svg>
  )
}

/* ================================================================ digital (px) */

const Cta = ({ x, y, w, h, t, size }) => (
  <g><rect x={x} y={y} width={w} height={h} fill={C.red} /><text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="central" fontFamily={FB} fontWeight="700" fontSize={size} fill="#fff">{t}</text></g>
)

/* LinkedIn, four posts at 1080 × 1350 */
export function Post1() {
  const w = 1080, h = 1350
  return (
    <Svg w={w} h={h} label="LinkedIn post 1, three weeks out">
      <rect width={w} height={h} fill="#fff" />
      <rect width={w} height="560" fill={C.navy} />
      <Mark x={80} y={80} w={170} panel pad={0.16} />
      <text x={80} y={330} fontFamily={FL} fontWeight="600" fontSize="28" fill="#9AA6BD" letterSpacing="3.5">SEMICON EUROPA 2026 · MUNICH</text>
      <text x={80} y={420} fontFamily={FD} fontWeight="600" fontSize="84" fill="#fff" letterSpacing="-3">Meet IAQ in Munich.</text>
      <text x={80} y={490} fontFamily={FB} fontWeight="500" fontSize="34" fill="#C9D2E3">Messe München · 10 to 13 November</text>
      <IsoFab x={680} y={590} w={290} />
      <text x={80} y={700} fontFamily={FD} fontWeight="600" fontSize="44" fill={C.ink} letterSpacing="-1">Controlled</text>
      <text x={80} y={756} fontFamily={FD} fontWeight="600" fontSize="44" fill={C.ink} letterSpacing="-1">environments,</text>
      <text x={80} y={812} fontFamily={FD} fontWeight="600" fontSize="44" fill={C.red} letterSpacing="-1">built to class.</text>
      <Para x={80} y={850} w={380} h={260} size={27} lh={1.45}>Meet the IAQ team on the stand, 10 to 13 November. Bring the brief.</Para>
      <Cta x={80} y={1170} w={360} h={90} t="Book a meeting" size={30} />
      <text x={470} y={1224} fontFamily={FB} fontWeight="600" fontSize="28" fill={C.ink}>Stand to confirm</text>
    </Svg>
  )
}
export function Post2() {
  const w = 1080, h = 1350
  return (
    <Svg w={w} h={h} label="LinkedIn post 2, one week out">
      <rect width={w} height={h} fill="#fff" />
      <Stripes x={80} y={96} w={70} n={3} h={9} gap={7} />
      <text x={80} y={200} fontFamily={FL} fontWeight="600" fontSize="28" fill={C.mist} letterSpacing="3.5">ONE WEEK TO SEMICON EUROPA</text>
      <text x={80} y={300} fontFamily={FD} fontWeight="600" fontSize="84" fill={C.ink} letterSpacing="-3">From Shah Alam</text>
      <text x={80} y={396} fontFamily={FD} fontWeight="600" fontSize="84" fill={C.red} letterSpacing="-3">to Dresden.</text>
      <DotMap x={60} y={470} w={960} label={1.6} />
      <Para x={80} y={900} w={900} h={140} size={30} lh={1.45}>Offices in seven countries, and a team in Germany: IAQ Engineering (DE) GmbH, Dresden. Meet both in Munich, 10 to 13 November.</Para>
      <rect y={h - 200} width={w} height="200" fill={C.navy} />
      <Mark x={80} y={h - 146} w={120} panel pad={0.16} />
      <text x={w - 80} y={h - 110} textAnchor="end" fontFamily={FB} fontWeight="600" fontSize="30" fill="#fff">Messe München · Stand to confirm</text>
      <text x={w - 80} y={h - 66} textAnchor="end" fontFamily={FB} fontWeight="500" fontSize="26" fill="#9AA6BD">iaqtechnology.com.my/semicon</text>
    </Svg>
  )
}
export function Post3({ photo = '/booth/still-post3.webp' }) {
  const w = 1080, h = 1350
  return (
    <Svg w={w} h={h} label="LinkedIn post 3, opening day">
      <rect width={w} height={h} fill={C.navy} />
      <image href={photo} x="0" y="0" width={w} height="880" preserveAspectRatio="xMidYMid slice" />
      <rect x="0" y="0" width={w} height="880" fill="url(#p3g)" />
      <defs><linearGradient id="p3g" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stopColor={C.navy} stopOpacity="0" /><stop offset="1" stopColor={C.navy} stopOpacity=".95" /></linearGradient></defs>
      <Mark x={80} y={80} w={150} panel pad={0.16} />
      <text x={80} y={1000} fontFamily={FL} fontWeight="600" fontSize="28" fill="#9AA6BD" letterSpacing="3.5">SEMICON EUROPA 2026 · DAY ONE</text>
      <text x={80} y={1090} fontFamily={FD} fontWeight="600" fontSize="78" fill="#fff" letterSpacing="-3">The stand is open.</text>
      <text x={80} y={1150} fontFamily={FB} fontWeight="500" fontSize="32" fill="#C9D2E3">See a fab built layer by layer, on the screen.</text>
      <Cta x={80} y={1210} w={420} h={86} t="Find us at the stand" size={30} />
    </Svg>
  )
}
export function Post4({ photo = '/booth/still-post4.webp' }) {
  const w = 1080, h = 1350
  return (
    <Svg w={w} h={h} label="LinkedIn post 4, thank you">
      <rect width={w} height={h} fill="#fff" />
      <image href={photo} x="0" y="0" width={w} height="820" preserveAspectRatio="xMidYMid slice" />
      <text x={80} y={940} fontFamily={FL} fontWeight="600" fontSize="28" fill={C.mist} letterSpacing="3.5">SEMICON EUROPA 2026</text>
      <text x={80} y={1030} fontFamily={FD} fontWeight="600" fontSize="84" fill={C.ink} letterSpacing="-3">Thank you, <tspan fill={C.red}>Munich.</tspan></text>
      <Para x={80} y={1060} w={860} h={140} size={30} lh={1.45}>Four days of briefs and conversations. Every one gets an answer within one working day.</Para>
      <rect y={h - 130} width={w} height="130" fill={C.navy} />
      <Mark x={80} y={h - 98} w={110} panel pad={0.14} />
      <text x={w - 80} y={h - 56} textAnchor="end" fontFamily={FB} fontWeight="600" fontSize="28" fill="#fff">iaqtechnology.com.my</text>
    </Svg>
  )
}

/* web ad banners, the brand book's grammar: navy band, white field, one message, one red call to action */
export function Ad({ size }) {
  const [w, h] = size
  const tall = h > w * 1.5, wide = w > h * 3
  if (wide) return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}`}>
      <rect width={w} height={h} fill="#fff" />
      <rect width={h * 1.9} height={h} fill={C.navy} />
      <Mark x={h * 0.28} y={h * 0.26} w={h * 0.95} panel pad={0.14} />
      <text x={h * 2.2} y={h * 0.43} fontFamily={FD} fontWeight="600" fontSize={h * 0.25} fill={C.ink} letterSpacing="-.4">Controlled environments,</text>
      <text x={h * 2.2} y={h * 0.74} fontFamily={FD} fontWeight="600" fontSize={h * 0.25} fill={C.red} letterSpacing="-.4">built to class.</text>
      <text x={w - h * 2.1} y={h * 0.2} fontFamily={FL} fontWeight="600" fontSize={h * 0.12} fill={C.mist} letterSpacing=".5">SEMICON EUROPA · 10 TO 13 NOV</text>
      <Cta x={w - h * 2.1} y={h * 0.32} w={h * 1.85} h={h * 0.46} t="Book a meeting" size={h * 0.17} />
    </Svg>
  )
  if (tall) return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}`}>
      <rect width={w} height={h} fill="#fff" />
      <rect width={w} height={h * 0.22} fill={C.navy} />
      <Mark x={w * 0.12} y={h * 0.06} w={w * 0.5} panel pad={0.14} />
      <text x={w * 0.1} y={h * 0.31} fontFamily={FL} fontWeight="600" fontSize={w * 0.058} fill={C.mist} letterSpacing="1">SEMICON EUROPA 2026</text>
      {['Controlled', 'environments,'].map((l, i) => <text key={l} x={w * 0.1} y={h * 0.37 + i * w * 0.135} fontFamily={FD} fontWeight="600" fontSize={w * 0.112} fill={C.ink} letterSpacing="-.8">{l}</text>)}
      <text x={w * 0.1} y={h * 0.37 + 2 * w * 0.135} fontFamily={FD} fontWeight="600" fontSize={w * 0.112} fill={C.red} letterSpacing="-.8">built to class.</text>
      <IsoFab x={w * 0.34} y={h * 0.5} w={w * 0.32} />
      <text x={w * 0.1} y={h * 0.86} fontFamily={FB} fontWeight="500" fontSize={w * 0.06} fill={C.soft}>Munich · 10 to 13 Nov</text>
      <Cta x={w * 0.1} y={h * 0.89} w={w * 0.8} h={h * 0.07} t="Book a meeting" size={w * 0.07} />
    </Svg>
  )
  return (
    <Svg w={w} h={h} label={`Ad ${w} × ${h}`}>
      <rect width={w} height={h} fill="#fff" />
      <rect width={w} height={h * 0.26} fill={C.navy} />
      <Mark x={w * 0.07} y={h * 0.05} w={w * 0.23} panel pad={0.14} />
      <text x={w * 0.93} y={h * 0.155} textAnchor="end" fontFamily={FL} fontWeight="600" fontSize={w * 0.04} fill="#fff" letterSpacing=".8">SEMICON EUROPA 2026</text>
      <text x={w * 0.07} y={h * 0.43} fontFamily={FD} fontWeight="600" fontSize={w * 0.066} fill={C.ink} letterSpacing="-.5">Controlled environments,</text>
      <text x={w * 0.07} y={h * 0.53} fontFamily={FD} fontWeight="600" fontSize={w * 0.066} fill={C.red} letterSpacing="-.5">built to class.</text>
      <text x={w * 0.07} y={h * 0.66} fontFamily={FB} fontWeight="500" fontSize={w * 0.045} fill={C.soft}>Meet IAQ in Munich, 10 to 13 November</text>
      <Cta x={w * 0.07} y={h * 0.76} w={w * 0.5} h={h * 0.15} t="Book a meeting" size={w * 0.05} />
    </Svg>
  )
}
export const ADS = [[300, 250], [728, 90], [300, 600], [160, 600]]

export function Signature() {
  const w = 600, h = 150
  return (
    <Svg w={w} h={h} label="Email signature banner">
      <rect width={w} height={h} fill="#fff" />
      <rect width="160" height={h} fill={C.navy} />
      <Mark x={30} y={46} w={82} panel pad={0.14} />
      <text x="188" y="50" fontFamily={FL} fontWeight="600" fontSize="12" fill={C.mist} letterSpacing="1.6">MEET US IN MUNICH</text>
      <text x="188" y="84" fontFamily={FD} fontWeight="600" fontSize="24" fill={C.ink} letterSpacing="-.6">SEMICON Europa 2026</text>
      <text x="188" y="112" fontFamily={FB} fontWeight="500" fontSize="14" fill={C.soft}>Messe München · 10 to 13 Nov · Stand to confirm</text>
      <Stripes x={w - 60} y={52} w={34} n={3} h={6} gap={5} />
    </Svg>
  )
}

export const ART = { w1: W1, w2: W2, w2b: W2B, w3: W3, ct: Counter }
/* every piece, for the standalone renderer (/booth/art/:id) and the print and texture exports */
export const PIECES = {
  w1: { C: W1, w: 310, h: 3472, unit: 'mm', k: 'Wall 1 · aisle column', print: true },
  w2: { C: W2, w: 2852, h: 3472, unit: 'mm', k: 'Wall 2 · global presence', print: true },
  w2b: { C: W2B, w: 2852, h: 3472, unit: 'mm', k: 'Wall 2 · option B, every layer', print: true },
  w3: { C: W3, w: 2046, h: 3472, unit: 'mm', k: 'Wall 3 · the screen wall', print: true },
  ct: { C: Counter, w: 600, h: 1170, unit: 'mm', k: 'Counter front', print: true },
  flyer1: { C: FlyerFront, w: 148, h: 210, unit: 'mm', k: 'Flyer, set A · front', print: true },
  flyer2: { C: FlyerBack, w: 148, h: 210, unit: 'mm', k: 'Flyer, set A · back', print: true },
  flyerB1: { C: FlyerFrontB, w: 148, h: 210, unit: 'mm', k: 'Flyer, set B · front', print: true },
  flyerB2: { C: FlyerBackB, w: 148, h: 210, unit: 'mm', k: 'Flyer, set B · back', print: true },
  rollA: { C: RollUp, w: 850, h: 2000, unit: 'mm', k: 'Roll-up A', print: true },
  rollB: { C: RollUpB, w: 850, h: 2000, unit: 'mm', k: 'Roll-up B', print: true },
  post1: { C: Post1, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 1 · three weeks out' },
  post2: { C: Post2, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 2 · one week out' },
  post3: { C: Post3, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 3 · opening day' },
  post4: { C: Post4, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 4 · thank you' },
  sig: { C: Signature, w: 600, h: 150, unit: 'px', k: 'Email signature' },
  ...Object.fromEntries(ADS.map(s => ['ad' + s.join('x'), { C: p => <Ad size={s} {...p} />, w: s[0], h: s[1], unit: 'px', k: `Web ad ${s[0]} × ${s[1]}` }])),
}
