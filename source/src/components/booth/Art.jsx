import React, { useMemo } from 'react'
import Icon from '../FlowIcon.jsx'
import { isLand, GW, GH } from '../../data/landBits.js'
import { QR_PATH, QR_VIEWBOX, QR_URL } from '../../data/boothQr.js'
import { MESSAGE } from '../../data/booth.js'
import { MARK_VB, MARK_RED, MARK_REG } from '../../assets/booth/iaq-mark-paths.js'
import { ISO_FAB, ISO_VB } from '../../assets/booth/iso-fab.js'
import { ISO_C } from '../../assets/booth/iso-set-c-0930.js'

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

   29 Sep: this file is Direction A, "White cleanroom". Direction B, "Navy statement", is ArtB.jsx (the portal shows the two
   side by side). Fixed here for the house rules: no numbering (the fab's layers and the six services), no middle dots in
   the copy, no navy gradient over post 3's photograph.

   30 Sep: five directions (A here; B ArtB.jsx, C ArtC.jsx, D ArtD.jsx, E ArtE.jsx; the registry is sets.js). Every backdrop
   leads with the cleanroom; the screen raised to 1900 mm (SCREEN3) with the units on its edges (UNITS3); A's map poster and
   second side wall retired; the IAQ at the top of every piece; the red column carries the six services as a loop
   (ProcessColumn, shared with D); no stripe markers or grey stripes; unit icons in ink with one red part (UnitIc).

   `print` drops everything that is a note to the reader (the screen still, the hidden strip's label).
   `zones` draws the content bands; `bleed` draws the 10 mm bleed.
   ============================================================================ */

export const C = { field: '#C8161D', red: '#EC2027', deep: '#B5121B', navy: '#0A101F', ink: '#0C1220', white: '#F7F9FC', paper: '#FFFFFF', mist: '#828B9E', soft: '#48536A', line: '#DCE2EC', dot: '#C4CBD8', tint: '#EEF1F5' }
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
export function DotMap({ x, y, w, label = 1, dot = C.dot, ink = C.ink, sub = C.mist, showLabels = true, marker = 1, hl = C.red }) {   /* hl: the European offices' colour (white on a red ground) */
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
        const [cx, cy] = P(o.lat, o.lon), col = o.eu ? hl : ink, r = cell * (o.hq ? 0.95 : 0.72) * marker
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
const Para = ({ x, y, w, h, size, lh = 1.35, color = C.soft, weight = 500, font = FB, children, ls, wrap }) => {
  const K = size < 20 ? 10 : 1
  const lsK = ls && K > 1 && /px$/.test(ls) ? parseFloat(ls) * K + 'px' : ls
  return (
    <g transform={`translate(${x} ${y}) scale(${1 / K})`}>
      <foreignObject x="0" y="0" width={w * K} height={h * K}>
        <div xmlns="http://www.w3.org/1999/xhtml" style={{ font: `${weight} ${size * K}px/${lh} ${font}`, color, letterSpacing: lsK, textWrap: wrap }}>{children}</div>
      </foreignObject>
    </g>
  )
}

/* 30 Sep 2026 (Bazil: "the tv needs to be there but positioned higher"): the 55 inch screen on every back wall, 249 mm in
   from the wall's left edge, its bottom 1900 mm from the floor (was 1500), so its centre sits above a standing crowd.
   Nothing is printed behind it. y is from the top of the 3472 mm wall */
export const SCREEN3 = { x: 249, w: 1238, h: 709, bottom: 1900, y: 3472 - 1900 - 709 }
/* the block that holds the three units sits directly under the screen, on the screen's own edges */
export const UNITS3 = { x: 249, w: 1238, y: SCREEN3.y + SCREEN3.h + 60, h: 480 }
/* the screen as the reader sees it on the review pages (the still, in a dark frame); nothing in print */
export function ScreenStill({ print, still = '/booth/screen-still.webp', frame = '#11151F' }) {
  if (print) return null
  const s = SCREEN3
  return <g><rect x={s.x - 8} y={s.y - 8} width={s.w + 16} height={s.h + 16} fill={frame} /><image href={still} x={s.x} y={s.y} width={s.w} height={s.h} preserveAspectRatio="xMidYMid slice" /></g>
}
/* the 310 mm of the back wall inside wall 2: plain on the art; named only in the zones overlay */
export function HiddenNote({ x = 1736, w = 310, h = 3472 }) {
  return (
    <g pointerEvents="none">
      <rect x={x} y="0" width={w} height={h} fill="rgba(37,99,235,.12)" />
      {['310 mm', 'inside wall 2,', 'background', 'only'].map((t, i) => <text key={t} x={x + 24} y={h / 2 - 60 + i * 44} fontFamily={FB} fontWeight="700" fontSize="34" fill="#1D4ED8">{t}</text>)}
    </g>
  )
}
/* the wordmark in one flat colour (white on red): IAQ's all white file */
export function MarkFlat({ x, y, w, fill = '#fff' }) {
  return <svg x={x} y={y} width={w} height={w / MARK_AR} viewBox={MARK_VB.join(' ')}><path fill={fill} fillRule="evenodd" d={MARK_RED} /><path fill={fill} fillRule="evenodd" d={MARK_REG} /></svg>
}

/* 30 Sep (Bazil: "the red panel showcasing the 6 services process that loops"): the six services down a red aisle column,
   each object drawn white line on red (the Design tab's simple objects, tools/booth-iso-0929.mjs w-<k>), its name under it
   in white Switzer, joined by one straight white line with small plain chevrons; after Tools hookup the line turns and runs
   back up the column's right side into Design. No numbers, no dashes. Used by Direction A and Direction D */
export const PROCESS = [['design', 'Design and|consultation'], ['procure', 'Procurement'], ['construct', 'Construction'], ['commission', 'Testing and|commissioning'], ['maintain', 'Maintenance'], ['hookup', 'Tools hookup']]
export function ProcessColumn({ top, bottom, w = 310, cx = 138, rx = 280, icon = 150, size = 30, lw = 4, set = 'w', line = '#fff', ink = '#fff', isw = 1.1 }) {   /* 30 Sep: set 's' draws the objects in their own greys (C3's light column), with the line in red and the names in ink */
  const n = PROCESS.length, pitch = (bottom - top) / n
  const ih = k => icon * Number(ISO_C[set + '-' + k].vb.split(' ')[3]) / Number(ISO_C[set + '-' + k].vb.split(' ')[2])
  const lh = size * 1.18
  const items = PROCESS.map(([k, name], i) => {
    const y = top + i * pitch, lines = name.split('|'), h = ih(k)
    return { k, lines, y, h, foot: y + h + 18 + lines.length * lh }
  })
  const chev = (x, y, dir) => {
    const a = 11, b = 8
    const d = dir === 'down' ? `M${x - a} ${y - b / 2}L${x} ${y + b / 2}L${x + a} ${y - b / 2}` : dir === 'up' ? `M${x - a} ${y + b / 2}L${x} ${y - b / 2}L${x + a} ${y + b / 2}` : `M${x + b / 2} ${y - a}L${x - b / 2} ${y}L${x + b / 2} ${y + a}`
    return <path d={d} fill="none" stroke={line} strokeWidth={lw} strokeLinejoin="miter" strokeLinecap="butt" />
  }
  const first = items[0], last = items[n - 1]
  const ret = { y0: last.foot + 26, y1: last.foot + 80, yT: first.y + first.h * 0.5, xIn: cx + icon / 2 + 22 }
  return (
    <g>
      {items.map((it, i) => {
        const [, , vw, vh] = ISO_C[set + '-' + it.k].vb.split(' ').map(Number)
        const nx = items[i + 1]
        return (
          <g key={it.k}>
            <svg x={cx - icon / 2} y={it.y} width={icon} height={it.h} viewBox={`0 0 ${vw} ${vh}`} style={{ '--isw': isw }} dangerouslySetInnerHTML={{ __html: ISO_C[set + '-' + it.k].inner }} />
            {it.lines.map((l, j) => <text key={l} x={cx} y={it.y + it.h + 18 + (j + 0.8) * lh} textAnchor="middle" fontFamily={"'Switzer','Instrument Sans',sans-serif"} fontWeight="600" fontSize={size} fill={ink} letterSpacing={-0.01 * size}>{l}</text>)}
            {nx && <><rect x={cx - lw / 2} y={it.foot + 26} width={lw} height={nx.y - 26 - it.foot - 26} fill={line} />{chev(cx, (it.foot + nx.y) / 2, 'down')}</>}
          </g>
        )
      })}
      {/* the loop back: down from Tools hookup, across, up the right side, and in to Design */}
      <path d={`M${cx} ${ret.y0}V${ret.y1}H${rx}V${ret.yT}H${ret.xIn}`} fill="none" stroke={line} strokeWidth={lw} strokeLinejoin="miter" />
      {chev(rx, (ret.y1 + ret.yT) / 2, 'up')}
      {chev(ret.xIn + 10, ret.yT, 'left')}
    </g>
  )
}

export function Zones({ w, h, zones }) {
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
export function Svg({ w, h, children, label, bleed, className = '', bleedFill }) {
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
/* 30 Sep: the three units as the site's unit icons (FlowIcon epcUnit, pcuUnit, efmUnit, paths copied), one stroke, no fill,
   in ink with ONE red part (the load on the hook, the utility drops, the fan), as the icon rule asks; they were all red */
const UNIT_IC = {
  EPC: { ink: 'M3 21h18M6 21V9h7v12M8 12h3M8 15h3M8 18h3M13 21v-6h5v6M16 4v17M9 4h12M9 4 6 7M20 4v4', red: 'M18.5 8h3v2h-3z' },
  'PCU & TTI': { ink: 'M3 5h18M5 21v-8h14v8M5 17h14M8 13v-3h8v3M9 21v-2M15 21v-2M13 15a1 1 0 1 1-2 0a1 1 0 1 1 2 0', red: 'M7 5v5M12 5v5M17 5v5' },
  EFM: { ink: 'M3 20V9h13v11M3 20h18M16 12h5v8M18.5 15v2M6 9V6h3v3M11 9V7h2v2', red: 'M12.7 14.5a3.2 3.2 0 1 1-6.4 0a3.2 3.2 0 1 1 6.4 0M9.5 11.3v6.4M6.3 14.5h6.4' },
}
export function UnitIc({ k, x, y, s, sw = 1 }) {
  const u = UNIT_IC[k]
  return <svg x={x} y={y} width={s} height={s} viewBox="0 0 24 24" fill="none" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={u.ink} stroke={C.ink} /><path d={u.red} stroke={C.red} /></svg>
}
export const UNIT_LINE = { EPC: 'Builds cleanrooms and the facility.',   /* 27 Oct: "under one contract" off (IAQ, 24 Sep) */ 'PCU & TTI': 'Utilities and tool installation, in a live fab.', EFM: 'Runs and maintains it; cuts the energy bill.' }

/* ================================================================ the stand */

/* 1, the aisle column, 310 × 3472 */
export function W1({ zones, bleed }) {
  const w = 310, h = 3472
  return (
    <Svg w={w} h={h} label="Wall 1, the aisle column" bleed={bleed} bleedFill={C.field}>
      {/* 30 Sep: field red (the large-area red), the white wordmark on top, the six services as a loop; the vertical tagline
          and the faded stripes are gone (Bazil: "the red panel showcasing the 6 services process that loops") */}
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={C.field} />
      <MarkFlat x={40} y={150} w={230} />
      <ProcessColumn top={420} bottom={2930} />
      <Plinth w={w} h={h} />
      {zones && <Zones w={w} h={h} zones={zones} />}
    </Svg>
  )
}

/* 2, the side wall, 2852 × 3472. 30 Sep (Bazil: "backdrops focus more on cleanroom", "map not needed, maybe small part if
   needed", "remember all is A"): the dot map poster and the second side wall are retired (the old code is in
   src/_backups/booth-cd-0930/Art.jsx.pre). One side wall: the IAQ top left, the cleanroom first, IAQ's exploded fab with its
   four layers named, the offices as one short line, the navy plinth */
export function W2({ zones, bleed }) {
  const w = 2852, h = 3472, m = 150, fh = 2240, fw = fh * ISO_CLIP / ISO[3], fx = m - 20, fy = 930
  return (
    <Svg w={w} h={h} label="Wall 2, the side wall: the cleanroom and every layer around it" bleed={bleed} bleedFill={C.paper}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={C.paper} />
      <Mark x={m} y={130} w={520} />
      <text x={m} y={530} fontFamily={FD} fontWeight="600" fontSize="140" fill={C.ink} letterSpacing="-4.5">The cleanroom, and every</text>
      <text x={m} y={690} fontFamily={FD} fontWeight="600" fontSize="140" fill={C.red} letterSpacing="-4.5">layer of the fab around it.</text>
      <text x={m} y={840} fontFamily={FB} fontWeight="500" fontSize="56" fill={C.soft}>Offices in seven countries. In Germany: IAQ Engineering (DE) GmbH, Dresden.</text>
      <IsoFab x={fx} y={fy} w={fw} />
      {TRAYS.map(t => {
        const y = fy + fh * t.f, x = fx + fw * 0.99 + 60
        return (
          <g key={t.k}>
            <text x={x} y={y - 20} fontFamily={FD} fontWeight="600" fontSize="96" fill={C.ink} letterSpacing="-2">{t.k}</text>
            <text x={x} y={y + 64} fontFamily={FB} fontWeight="500" fontSize="58" fill={C.soft}>{t.t}</text>
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

/* 3, the back wall, 2046 × 3472, 1736 visible. 30 Sep: the screen raised to 1900 mm (SCREEN3); the statement large under
   the IAQ, cleanroom first; the three units directly under the screen on its own edges, sized to read from the aisle; the
   310 mm inside wall 2 is plain white (named in the zones overlay only); no stripes, no tagline lockup */
export function W3({ zones, bleed, print, still = '/booth/screen-still.webp' }) {
  const w = 2046, h = 3472, vis = 1736, m = 150, U = UNITS3, cw = U.w / 3
  return (
    <Svg w={w} h={h} label="Wall 3, the screen wall" bleed={bleed} bleedFill={C.paper}>
      <rect x="-10" y="-10" width={w + 20} height={h + 20} fill={C.paper} />
      <Mark x={m} y={130} w={520} />
      <text x={m} y={530} fontFamily={FD} fontWeight="600" fontSize="140" fill={C.ink} letterSpacing="-4.5">Cleanrooms,</text>
      <text x={m} y={690} fontFamily={FD} fontWeight="600" fontSize="140" fill={C.red} letterSpacing="-4.5">built to class.</text>
      <ScreenStill print={print} still={still} />
      {MESSAGE.units.map((u, i) => {
        const x = U.x + i * cw
        return (
          <g key={u.k}>
            <UnitIc k={u.k} x={x - 10} y={U.y + 10} s={130} />
            <text x={x} y={U.y + 236} fontFamily={FD} fontWeight="600" fontSize="72" fill={C.ink} letterSpacing="-1.5">{u.k}</text>
            <Para x={x} y={U.y + 262} w={cw - 40} h={150} size={36} lh={1.3} wrap="balance">{UNIT_LINE[u.k]}</Para>
          </g>
        )
      })}
      <Plinth w={w} h={h}>
        <text x={m} y={h - 104} fontFamily={FB} fontWeight="600" fontSize="52" fill="#fff">iaqtechnology.com.my</text>
      </Plinth>
      {zones && <><Zones w={vis} h={h} zones={zones} /><HiddenNote /></>}
    </Svg>
  )
}

/* 4, the counter front, 600 × 1170, 170 mm radius top right */
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
        {/* 30 Sep, evening (Bazil: "bigger size QR"): 270 mm, 9.3 mm a module (29 modules); its line beside it */}
        <Qr x={60} y={440} s={270} />
        <Para x={362} y={436} w={178} h={200} size={26} lh={1.35}>Scan for the 3D story, the services and the projects.</Para>
        <rect x="60" y="790" width="480" height="4" fill={C.red} />   {/* 30 Sep: the one long red line, at the height every counter shares */}
        <text x="60" y="846" fontFamily={FB} fontWeight="600" fontSize="26" fill={C.ink}>{QR_URL}</text>
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
      <text x={w - 12} y={30.5} textAnchor="end" fontFamily={FB} fontWeight="500" fontSize="3.4" fill="#C9D2E3">Messe München, 10 to 13 November 2026</text>
      <text x={w - 12} y={36.5} textAnchor="end" fontFamily={FB} fontWeight="600" fontSize="3.4" fill="#fff">Stand to confirm</text>
      {/* the text column: 12 to 76 mm; the fab's column: 80 to 142 mm */}
      <text x="12" y="62" fontFamily={FD} fontWeight="600" fontSize="7.2" fill={C.ink} letterSpacing="-.25">Controlled</text>
      <text x="12" y="70.5" fontFamily={FD} fontWeight="600" fontSize="7.2" fill={C.ink} letterSpacing="-.25">environments,</text>
      <text x="12" y="79" fontFamily={FD} fontWeight="600" fontSize="7.2" fill={C.red} letterSpacing="-.25">built to class.</text>
      <Para x={12} y={84} w={62} h={34} size={3.3} lh={1.42}>IAQ designs, builds and commissions cleanrooms and the hi-tech facilities around them, hooks up the tools inside and keeps them running. Since 1995, from offices in seven countries, Germany among them.</Para>
      {MESSAGE.units.map((u, i) => (
        <g key={u.k}>
          <UnitIc k={u.k} x={11.5} y={124 + i * 20} s={6.5} />
          <text x={21} y={128.6 + i * 20} fontFamily={FD} fontWeight="600" fontSize="3.8" fill={C.ink}>{u.k}</text>
          <Para x={21} y={130 + i * 20} w={54} h={10} size={2.8} lh={1.3}>{UNIT_LINE[u.k]}</Para>
        </g>
      ))}
      <IsoFab x={w - fw - 6} y={52} w={fw} />
      <rect x="-10" y={h - 12} width={w + 20} height="22" fill={C.field} />
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
      <Mark x={12} y={10} w={20} />   {/* 30 Sep: the IAQ at the top, not a stripe marker */}
      <text x="12" y="29.5" fontFamily={FD} fontWeight="600" fontSize="7.6" fill={C.ink} letterSpacing="-.2">One team, from the first drawing</text>
      <text x="12" y="39" fontFamily={FD} fontWeight="600" fontSize="7.6" fill={C.ink} letterSpacing="-.2">to the plant <tspan fill={C.red}>in operation.</tspan></text>
      {[
        ['Engineering design', 'compass'], ['Procurement', 'crate'], ['Construction', 'crane'],
        ['Testing and commissioning', 'gauge'], ['Maintenance', 'gear'], ['Tools hookup', 'link'],
      ].map(([t, ic], i) => (
        <g key={t}>
          <Ic name={ic} x={12 + (i % 3) * 46} y={48 + Math.floor(i / 3) * 18} s={6.4} color={C.ink} />
          <text x={12 + (i % 3) * 46} y={60.5 + Math.floor(i / 3) * 18} fontFamily={FB} fontWeight="600" fontSize="3.1" fill={C.ink}>{t}</text>
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
      <Para x={12} y={188} w={78} h={14} size={3.1} lh={1.45} color="#D3DBE9">Shah Alam, Malaysia, +603 5124 8319<br />business@iaqtechnology.com.my</Para>
      <Qr x={110} y={152} s={24} />   {/* 30 Sep, evening: 24 mm, as every leaflet (0.83 mm a module) */}
      <text x={110} y={186.5} fontFamily={FL} fontWeight="600" fontSize="2.9" fill="#8E9BB4" letterSpacing=".4">YOUR CONTACT</text>
      <Para x={110} y={188} w={27} h={10} size={2.8} lh={1.35} color="#D3DBE9">Contact details to follow from IAQ</Para>
    </Svg>
  )
}

/* 29 Sep: the 22 Sep leaflet set B (white, the fab's four layers) and the old full navy roll-up B are retired: Direction B's
   leaflet and roll-up are in ArtB.jsx, rebuilt on their content. The old code is in src/_backups/booth-2dir-0929/Art.jsx.pre */

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
          <UnitIc k={u.k} x={70 + i * 250} y={1570} s={46} />
          <text x={70 + i * 250} y={1656} fontFamily={FD} fontWeight="600" fontSize="34" fill={C.ink}>{u.k}</text>
          <Para x={70 + i * 250} y={1668} w={220} h={90} size={20} lh={1.35}>{UNIT_LINE[u.k]}</Para>
        </g>
      ))}
      <rect x="-10" y={h - 200} width={w + 20} height="210" fill={C.field} />
      <text x={w / 2} y={h - 118} textAnchor="middle" fontFamily={FB} fontWeight="600" fontSize="34" fill="#fff">iaqtechnology.com.my</text>
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
      <text x={80} y={330} fontFamily={FL} fontWeight="600" fontSize="28" fill="#9AA6BD" letterSpacing="3.5">SEMICON EUROPA 2026, MUNICH</text>
      <text x={80} y={420} fontFamily={FD} fontWeight="600" fontSize="84" fill="#fff" letterSpacing="-3">Meet IAQ in Munich.</text>
      <text x={80} y={490} fontFamily={FB} fontWeight="500" fontSize="34" fill="#C9D2E3">Messe München, 10 to 13 November</text>
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
      <Mark x={80} y={80} w={170} />
      <text x={80} y={196} fontFamily={FL} fontWeight="600" fontSize="28" fill={C.mist} letterSpacing="3.5">ONE WEEK TO SEMICON EUROPA</text>
      <text x={80} y={300} fontFamily={FD} fontWeight="600" fontSize="84" fill={C.ink} letterSpacing="-3">From Shah Alam</text>
      <text x={80} y={396} fontFamily={FD} fontWeight="600" fontSize="84" fill={C.red} letterSpacing="-3">to Dresden.</text>
      <DotMap x={80} y={500} w={640} label={1.9} />   {/* 30 Sep: the map kept small, never the hero ("map not needed, maybe small part") */}
      <Para x={80} y={830} w={900} h={140} size={30} lh={1.45}>Offices in seven countries, and a team in Germany: IAQ Engineering (DE) GmbH, Dresden. Meet both in Munich, 10 to 13 November.</Para>
      <rect y={h - 200} width={w} height="200" fill={C.navy} />
      <text x={w - 80} y={h - 110} textAnchor="end" fontFamily={FB} fontWeight="600" fontSize="30" fill="#fff">Messe München, stand to confirm</text>
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
      <Mark x={0} y={0} w={170} panel pad={0.2} />   {/* 30 Sep: flush in the photograph's top left corner, on its solid block */}
      <text x={80} y={1000} fontFamily={FL} fontWeight="600" fontSize="28" fill="#9AA6BD" letterSpacing="3.5">SEMICON EUROPA 2026, DAY ONE</text>
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
      <Mark x={0} y={0} w={170} panel pad={0.2} />   {/* 30 Sep: the IAQ at the top, never in the foot */}
      <text x={80} y={940} fontFamily={FL} fontWeight="600" fontSize="28" fill={C.mist} letterSpacing="3.5">SEMICON EUROPA 2026</text>
      <text x={80} y={1030} fontFamily={FD} fontWeight="600" fontSize="84" fill={C.ink} letterSpacing="-3">Thank you, <tspan fill={C.red}>Munich.</tspan></text>
      <Para x={80} y={1060} w={860} h={140} size={30} lh={1.45}>Four days of briefs and conversations. Every one gets an answer within one working day.</Para>
      <rect y={h - 130} width={w} height="130" fill={C.navy} />
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
      <text x={w - h * 2.1} y={h * 0.2} fontFamily={FL} fontWeight="600" fontSize={h * 0.12} fill={C.mist} letterSpacing=".5">SEMICON EUROPA, 10 TO 13 NOV</text>
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
      <text x={w * 0.1} y={h * 0.86} fontFamily={FB} fontWeight="500" fontSize={w * 0.06} fill={C.soft}>Munich, 10 to 13 Nov</text>
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
      <text x="188" y="112" fontFamily={FB} fontWeight="500" fontSize="14" fill={C.soft}>Messe München, 10 to 13 Nov, stand to confirm</text>
    </Svg>
  )
}

export const ART = { w1: W1, w2: W2, w3: W3, ct: Counter }
/* every piece, for the standalone renderer (/booth/art/:id) and the print and texture exports */
export const PIECES = {
  w1: { C: W1, w: 310, h: 3472, unit: 'mm', k: 'Wall 1, aisle column, Direction A', print: true },
  w2: { C: W2, w: 2852, h: 3472, unit: 'mm', k: 'Wall 2, side wall, Direction A', print: true },
  w3: { C: W3, w: 2046, h: 3472, unit: 'mm', k: 'Wall 3, the screen wall, Direction A', print: true },
  ct: { C: Counter, w: 600, h: 1170, unit: 'mm', k: 'Counter front, Direction A', print: true },
  flyer1: { C: FlyerFront, w: 148, h: 210, unit: 'mm', k: 'Leaflet, Direction A, front', print: true },
  flyer2: { C: FlyerBack, w: 148, h: 210, unit: 'mm', k: 'Leaflet, Direction A, back', print: true },
  rollA: { C: RollUp, w: 850, h: 2000, unit: 'mm', k: 'Roll-up, Direction A', print: true },
  post1: { C: Post1, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 1, three weeks out, Direction A' },
  post2: { C: Post2, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 2, one week out, Direction A' },
  post3: { C: Post3, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 3, opening day, Direction A' },
  post4: { C: Post4, w: 1080, h: 1350, unit: 'px', k: 'LinkedIn 4, thank you, Direction A' },
  sig: { C: Signature, w: 600, h: 150, unit: 'px', k: 'Email signature, Direction A' },
  ...Object.fromEntries(ADS.map(s => ['ad' + s.join('x'), { C: p => <Ad size={s} {...p} />, w: s[0], h: s[1], unit: 'px', k: `Web ad ${s[0]} × ${s[1]}, Direction A` }])),
}
