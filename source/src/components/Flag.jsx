import React from 'react'

/* Seven country flags for the offices list (22 Sep 2026, Bazil: "put the country flags").
   Drawn here as SVG because flag emoji do not render on Windows, where they fall back to the two
   letters the flags were meant to replace. One 30 x 20 slot for all seven, so they line up; the
   national proportions are adapted to it, the colours and devices are the official ones. */
const star = (cx, cy, R, pts = 5, inner = 0.382, rot = -90) => {
  let d = ''
  for (let i = 0; i < pts * 2; i++) {
    const r = i % 2 ? R * inner : R, a = (rot + i * 180 / pts) * Math.PI / 180
    d += (i ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(2) + ' ' + (cy + r * Math.sin(a)).toFixed(2)
  }
  return d + 'Z'
}
const stripes = (n, h, fill) => Array.from({ length: Math.ceil(n / 2) }, (_, k) => <rect key={k} x="0" y={k * 2 * h} width="30" height={h} fill={fill} />)

const US_STARS = (() => {
  let d = ''
  for (let r = 0; r < 9; r++) { const six = r % 2 === 0; for (let c = 0; c < (six ? 6 : 5); c++) d += star((six ? 1 : 2) + c * 2, 1.077 * (r + 1), 0.46) }
  return d
})()
const SG_STARS = [-90, -18, 54, 126, 198].map(a => star(10.3 + 2.05 * Math.cos(a * Math.PI / 180), 5 + 2.05 * Math.sin(a * Math.PI / 180), 0.92)).join('')

const F = {
  MY: <>
    <rect width="30" height="20" fill="#fff" />{stripes(14, 20 / 14, '#CC0001')}
    <rect width="15" height={20 / 14 * 8} fill="#010066" />
    <circle cx="6.1" cy="5.7" r="3.9" fill="#FFCC00" /><circle cx="7.3" cy="5.7" r="3.4" fill="#010066" />
    <path d={star(10.4, 5.7, 3, 14, 0.46)} fill="#FFCC00" />
  </>,
  SG: <>
    <rect width="30" height="20" fill="#fff" /><rect width="30" height="10" fill="#EE2536" />
    <circle cx="7" cy="5" r="3.7" fill="#fff" /><circle cx="8.5" cy="5" r="3.4" fill="#EE2536" />
    <path d={SG_STARS} fill="#fff" />
  </>,
  DE: <><rect width="30" height="20" fill="#FFCE00" /><rect width="30" height="13.34" fill="#DD0000" /><rect width="30" height="6.67" fill="#000" /></>,
  IN: <>
    <rect width="30" height="20" fill="#fff" /><rect width="30" height="6.67" fill="#FF9933" /><rect y="13.33" width="30" height="6.67" fill="#138808" />
    <g stroke="#000080" fill="none"><circle cx="15" cy="10" r="2.6" strokeWidth=".42" />
      {Array.from({ length: 12 }, (_, k) => { const a = k * 15 * Math.PI / 180, x = 2.5 * Math.cos(a), y = 2.5 * Math.sin(a); return <line key={k} x1={15 - x} y1={10 - y} x2={15 + x} y2={10 + y} strokeWidth=".16" /> })}
    </g><circle cx="15" cy="10" r=".5" fill="#000080" />
  </>,
  SE: <><rect width="30" height="20" fill="#006AA7" /><rect x="9.375" width="3.75" height="20" fill="#FECC02" /><rect y="8" width="30" height="4" fill="#FECC02" /></>,
  US: <>
    <rect width="30" height="20" fill="#fff" />{stripes(13, 20 / 13, '#B22234')}
    <rect width="12" height={20 / 13 * 7} fill="#3C3B6E" /><path d={US_STARS} fill="#fff" />
  </>,
  IE: <><rect width="30" height="20" fill="#fff" /><rect width="10" height="20" fill="#169B62" /><rect x="20" width="10" height="20" fill="#FF883E" /></>,
}

export default function Flag({ cc, title }) {
  return (
    <svg className="flag" viewBox="0 0 30 20" role={title ? 'img' : undefined} aria-label={title || undefined} aria-hidden={title ? undefined : 'true'}>
      {F[cc] || <rect width="30" height="20" fill="#DCE2EC" />}
    </svg>
  )
}
