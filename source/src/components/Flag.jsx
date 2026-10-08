import React from 'react'

/* Seven country flags for the offices list (22 Sep 2026, Bazil: "put the country flags").
   Drawn here as SVG because flag emoji do not render on Windows, where they fall back to the two
   letters the flags were meant to replace. One 30 x 20 slot for all seven, so they line up; the
   national proportions are adapted to it, the colours and devices are the official ones.

   8 Oct: the drawings are SVG markup strings (FLAG_SVG), so the maps can use them too: the home globe builds its
   callouts as plain HTML (scenes/home.js), and the map pins nest them inside their own SVG. <Flag> is unchanged. */
const star = (cx, cy, R, pts = 5, inner = 0.382, rot = -90) => {
  let d = ''
  for (let i = 0; i < pts * 2; i++) {
    const r = i % 2 ? R * inner : R, a = (rot + i * 180 / pts) * Math.PI / 180
    d += (i ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(2) + ' ' + (cy + r * Math.sin(a)).toFixed(2)
  }
  return d + 'Z'
}
const rect = (x, y, w, h, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`
const stripes = (n, h, fill) => Array.from({ length: Math.ceil(n / 2) }, (_, k) => rect(0, k * 2 * h, 30, h, fill)).join('')

const US_STARS = (() => {
  let d = ''
  for (let r = 0; r < 9; r++) { const six = r % 2 === 0; for (let c = 0; c < (six ? 6 : 5); c++) d += star((six ? 1 : 2) + c * 2, 1.077 * (r + 1), 0.46) }
  return d
})()
const SG_STARS = [-90, -18, 54, 126, 198].map(a => star(10.3 + 2.05 * Math.cos(a * Math.PI / 180), 5 + 2.05 * Math.sin(a * Math.PI / 180), 0.92)).join('')
const IN_SPOKES = Array.from({ length: 12 }, (_, k) => {
  const a = k * 15 * Math.PI / 180, x = 2.5 * Math.cos(a), y = 2.5 * Math.sin(a)
  return `<line x1="${(15 - x).toFixed(2)}" y1="${(10 - y).toFixed(2)}" x2="${(15 + x).toFixed(2)}" y2="${(10 + y).toFixed(2)}" stroke-width=".16"/>`
}).join('')

export const FLAG_SVG = {
  MY: rect(0, 0, 30, 20, '#fff') + stripes(14, 20 / 14, '#CC0001') + rect(0, 0, 15, 20 / 14 * 8, '#010066')
    + '<circle cx="6.1" cy="5.7" r="3.9" fill="#FFCC00"/><circle cx="7.3" cy="5.7" r="3.4" fill="#010066"/>'
    + `<path d="${star(10.4, 5.7, 3, 14, 0.46)}" fill="#FFCC00"/>`,
  SG: rect(0, 0, 30, 20, '#fff') + rect(0, 0, 30, 10, '#EE2536')
    + '<circle cx="7" cy="5" r="3.7" fill="#fff"/><circle cx="8.5" cy="5" r="3.4" fill="#EE2536"/>'
    + `<path d="${SG_STARS}" fill="#fff"/>`,
  DE: rect(0, 0, 30, 20, '#FFCE00') + rect(0, 0, 30, 13.34, '#DD0000') + rect(0, 0, 30, 6.67, '#000'),
  IN: rect(0, 0, 30, 20, '#fff') + rect(0, 0, 30, 6.67, '#FF9933') + rect(0, 13.33, 30, 6.67, '#138808')
    + `<g stroke="#000080" fill="none"><circle cx="15" cy="10" r="2.6" stroke-width=".42"/>${IN_SPOKES}</g><circle cx="15" cy="10" r=".5" fill="#000080"/>`,
  SE: rect(0, 0, 30, 20, '#006AA7') + rect(9.375, 0, 3.75, 20, '#FECC02') + rect(0, 8, 30, 4, '#FECC02'),
  US: rect(0, 0, 30, 20, '#fff') + stripes(13, 20 / 13, '#B22234') + rect(0, 0, 12, 20 / 13 * 7, '#3C3B6E') + `<path d="${US_STARS}" fill="#fff"/>`,
  IE: rect(0, 0, 30, 20, '#fff') + rect(0, 0, 10, 20, '#169B62') + rect(20, 0, 10, 20, '#FF883E'),
}
const BLANK = rect(0, 0, 30, 20, '#DCE2EC')

/* the whole flag as one <svg> string, for HTML built outside React */
export const flagSvg = (cc, cls = 'flag') => `<svg class="${cls}" viewBox="0 0 30 20" aria-hidden="true">${FLAG_SVG[cc] || BLANK}</svg>`

/* x, y, width, height place it inside another SVG (the map pins); without them it is the usual inline flag */
export default function Flag({ cc, title, x, y, width, height, className = 'flag' }) {
  return (
    <svg className={className} viewBox="0 0 30 20" x={x} y={y} width={width} height={height} preserveAspectRatio="xMidYMid slice"
      role={title ? 'img' : undefined} aria-label={title || undefined} aria-hidden={title ? undefined : 'true'}
      dangerouslySetInnerHTML={{ __html: FLAG_SVG[cc] || BLANK }} />
  )
}
