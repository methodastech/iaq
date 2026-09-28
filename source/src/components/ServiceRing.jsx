import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CYCLE } from '../data/cycle.js'
import { CYCLE_SVG } from '../data/cycleMarks.js'
import '../styles/service-ring.css'

/* ============================================================================
   ServiceRing · the six services as one cycle (26 Sep 2026, Bazil: "refine this, why is it so messy and cut off",
   "create a better diagram, do six stages of service", "why isn't this being animated", "no need 'feeds the next
   Design'"). One SVG: a ring, six stations at sixty degrees, the 24 Sep marks on the stations, the names outside,
   a red flow that runs round the ring and a lit arc between the active station and the next. The active station
   steps every three seconds until the reader touches one; a station is a link to its service page. Nothing is
   positioned in pixels, so nothing is cut at any width.
   ============================================================================ */
const MARK_KEY = ['des', 'prc', 'con', 'com', 'mnt', 'hok']
const W = 1000, H = 640, CX = 500, CY = 320, R = 210
const ang = i => (-90 + i * 60) * Math.PI / 180
const pt = (i, r = R) => [CX + Math.cos(ang(i)) * r, CY + Math.sin(ang(i)) * r]
const arc = (a, b) => { const [x1, y1] = pt(a), [x2, y2] = pt(b); return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}` }

export default function ServiceRing({ active = 0, onPick }) {
  const [live, setLive] = useState(false)
  const box = useRef(null)
  useEffect(() => {
    const el = box.current; if (!el) return
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { threshold: .25 })
    io.observe(el); return () => io.disconnect()
  }, [])
  return (
    <div className={'sr' + (live ? ' is-live' : '')} ref={box}>
      <svg className="sr-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="The six services as one cycle">
        <circle className="sr-ring" cx={CX} cy={CY} r={R} />
        <circle className="sr-flow" cx={CX} cy={CY} r={R} />
        <path className="sr-lit" d={arc(active, (active + 1) % 6)} />
        {CYCLE.map((s, i) => {
          const [x, y] = pt(i)
          const on = i === active
          /* the name stands outside the ring on the station's own side; the two at the top and the foot centre */
          const side = i === 0 || i === 3 ? 'mid' : (i < 3 ? 'right' : 'left')
          const [lx, ly] = pt(i, R + 96)
          return (
            <g key={s.id} className={'sr-st' + (on ? ' on' : '')} onMouseEnter={() => onPick && onPick(i, true)}>
              <circle className="sr-dot" cx={x} cy={y} r="7" />
              <foreignObject x={x - 58} y={y - 58} width="116" height="116" className="sr-mk-box">
                <span className="sr-mk" dangerouslySetInnerHTML={{ __html: CYCLE_SVG[MARK_KEY[i]] }} />
              </foreignObject>
              <text className="sr-no" x={side === 'mid' ? lx : side === 'right' ? lx - 4 : lx + 4} y={ly - 22} textAnchor={side === 'mid' ? 'middle' : side === 'right' ? 'start' : 'end'}>{s.no}</text>
              <text className="sr-nm" x={lx} y={ly + 8} textAnchor={side === 'mid' ? 'middle' : side === 'right' ? 'start' : 'end'}>{s.name}</text>
            </g>
          )
        })}
      </svg>
      {/* the same six as real links, laid over the stations for the pointer and the keyboard */}
      <ol className="sr-links" aria-label="The six services">
        {CYCLE.map((s, i) => { const [x, y] = pt(i); return (
          <li key={s.id} style={{ left: (x / W * 100) + '%', top: (y / H * 100) + '%' }}>
            <Link to={s.route} aria-current={i === active ? 'true' : undefined} onClick={() => onPick && onPick(i)} onFocus={() => onPick && onPick(i, true)}>{s.no} {s.name}</Link>
          </li>) })}
      </ol>
    </div>
  )
}
