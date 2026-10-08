import React, { useMemo } from 'react'
import { GW, GH, isLand } from '../data/landBits.js'
import { OFFICES, DELIVERED } from '../data/offices.js'
import Flag from './Flag.jsx'
import '../styles/office-map.css'

/* ============================================================================
   OfficeMap · the world, flat, with every IAQ office pinned and named on it (8 Oct 2026).

   Client: "guna pin, terus guna flag country ... bila orang tengok maps tu, orang nak tahu bila you highlight tu dia
   dekat mana sebenarnya ... kita tak pernah guna listing untuk our global presence. Kita biasa guna call out ataupun
   pin dekat map tu sendiri." So: a red pin on each office, and beside it a callout carrying the country's flag, the
   country and the city, joined to the pin by a short leader. No legend, no list.

   Flat, not a globe, so every office is on screen at once: on the rotating globe this replaced, Shah Alam, Penang and
   Singapore sat a few pixels apart and half the offices were always round the back. The land is the site's own dot
   world (data/landBits.js, the same grid the home globe and the booth map draw).

   Geometry is in map units, 1000 wide. Each callout's anchor is the pin plus (dx, dy), and `side` says which edge of
   the box sits on the anchor: r, the box to the right; l, to the left. They are placed by hand so the three offices
   around the Straits and the four in Europe never cover each other.
   ============================================================================ */

const LON0 = -130, LON1 = 155, LAT0 = 72, LAT1 = -38
const W = 1000, H = W * (LAT0 - LAT1) / (LON1 - LON0)
const P = (lat, lon) => [(lon - LON0) / (LON1 - LON0) * W, (LAT0 - lat) / (LAT0 - LAT1) * H]

const CALL = {
  'my-hq':     { dx: -46, dy: 34,  side: 'l' },
  'my-penang': { dx: -46, dy: -26, side: 'l' },
  'sg':        { dx: 44,  dy: 34,  side: 'r' },
  'in':        { dx: -44, dy: 22,  side: 'l' },
  'de':        { dx: 54,  dy: 46,  side: 'r' },
  'se':        { dx: 42,  dy: -2,  side: 'r' },
  'ie':        { dx: -42, dy: -16, side: 'l' },
  'us':        { dx: 44,  dy: 30,  side: 'r' },
}
/* the two offices a few kilometres from the headquarters take a smaller pin, so the three around the Straits read as
   three pins and not one red blot */
const SMALL = new Set(['my-penang', 'sg'])
/* the delivered-in names sit beside their dot, on the side with room */
const DL_SIDE = { cn: 'r', pl: 'r', fr: 'l', ma: 'l' }

/* a map pin, its point on the place: a red drop with a white eye */
const pin = (x, y, s = 1) =>
  `M${x} ${y}c${-1 * s} ${-3.2 * s} ${-5.6 * s} ${-6 * s} ${-5.6 * s} ${-10.4 * s}a${5.6 * s} ${5.6 * s} 0 1 1 ${11.2 * s} 0c0 ${4.4 * s} ${-4.6 * s} ${7.2 * s} ${-5.6 * s} ${10.4 * s}z`

const pct = (x, y) => ({ left: (100 * x / W) + '%', top: (100 * y / H) + '%' })

export default function OfficeMap ({ className = '' }) {
  const cell = W / ((LON1 - LON0) / (360 / GW))
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
  }, [])
  const offices = OFFICES.map(o => {
    const [x, y] = P(o.lat, o.lon), c = CALL[o.id] || { dx: 40, dy: 0, side: 'r' }, s = o.hq ? 1.3 : SMALL.has(o.id) ? 0.82 : 1
    return { ...o, x, y, s, head: y - 10.4 * s, ax: x + c.dx, ay: y + c.dy, side: c.side }
  })
  const delivered = DELIVERED.map(d => { const [x, y] = P(d.lat, d.lon); return { ...d, x, y, side: DL_SIDE[d.id] || 'r' } })
  const label = 'Map of the IAQ offices: ' + OFFICES.map(o => `${o.city}, ${o.country}${o.hq ? ' (headquarters)' : ''}`).join('; ')
    + '. Countries IAQ has delivered in: ' + DELIVERED.map(d => d.country).join(', ') + '.'

  return (
    <div className={('om ' + className).trim()}>
      <div className="om-in">
        <svg className="om-svg" viewBox={`0 0 ${W} ${H.toFixed(1)}`} role="img" aria-label={label}>
          <g className="om-land">{dots.map(([cx, cy], i) => <circle key={i} cx={cx.toFixed(1)} cy={cy.toFixed(1)} r={(cell * 0.3).toFixed(2)} />)}</g>
          {delivered.map(d => <circle key={d.id} className="om-dl-dot" cx={d.x} cy={d.y} r="3.4" />)}
          {offices.map(o => <line key={'l' + o.id} className="om-lead" x1={o.x} y1={o.head} x2={o.ax} y2={o.ay} />)}
          {offices.map(o => (
            <g key={'p' + o.id} className={'om-pin' + (o.hq ? ' hq' : '')}>
              <circle className="om-pulse" cx={o.x} cy={o.y} r={4 * o.s} />
              <path d={pin(o.x, o.y, o.s)} />
              <circle className="om-eye" cx={o.x} cy={o.head} r={2.2 * o.s} />
            </g>
          ))}
        </svg>
        {offices.map(o => (
          <div key={'c' + o.id} className={'om-call ' + o.side + (o.hq ? ' hq' : '')} style={pct(o.ax, o.ay)}>
            <Flag cc={o.cc} className="om-flag" />
            <span className="om-t"><b>{o.country}</b><small>{o.city}{o.hq ? ' · Headquarters' : ''}</small></span>
          </div>
        ))}
        {delivered.map(d => (
          <span key={'d' + d.id} className={'om-dl ' + d.side} style={pct(d.x, d.y)}>{d.country}</span>
        ))}
      </div>
    </div>
  )
}
