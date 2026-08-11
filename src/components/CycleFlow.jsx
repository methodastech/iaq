import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import '../styles/cycle-flow.css'

/* The delivery cycle, ported from referenceprocess.html.

   Art-directed on a fixed 1005 x 355 coordinate canvas: one SVG carries the whole
   pathway, and an SVG mask knocks the line out beneath the discs AND the label
   blocks, which is what lets a single continuous path run behind everything
   without ever crossing text. The canvas is scaled to fit its container rather
   than re-laid-out, so the composition never drifts.

   Colours and type follow the IAQ system (site red token, Switzer / Instrument
   Sans / JetBrains Mono) rather than the reference's Inter / Roboto Mono.

   Flow: Design → Procure → Construct → U-turn → Commission → Maintain → Hookup,
   then the red return closes back into Design. */

/* stage geometry: disc centres are (left + 31, top + 31) on the 1005 x 355 grid.
   DOM order is 01→06 for reading, tabbing and the mobile stack; the serpentine
   is pure positioning. */
const NODES = [
  { i: 0, left: 72, top: 49, d: 500, title: 'Design', desc: ['Engineering Design', '& Consultation'] },
  { i: 1, left: 396, top: 49, d: 700, title: 'Procure', desc: ['Procurement'] },
  { i: 2, left: 711, top: 49, d: 900, title: 'Construct', desc: ['Construction'] },
  { i: 3, left: 711, top: 212, d: 1100, title: 'Commission', desc: ['Testing &', 'Commissioning'] },
  { i: 4, left: 396, top: 212, d: 1300, title: 'Maintain', desc: ['Maintenance'] },
  { i: 5, left: 72, top: 212, d: 1500, title: 'Hookup', desc: ['Tools Hookup'] },
]

/* the reference icon set, drawn on a 24 grid at one stroke weight */
const ICONS = [
  /* 01 dividers */
  <><circle cx="12" cy="3.9" r="1.7" /><path d="M11.2 5.5 6.1 20.6" /><path d="M12.8 5.5 17.9 20.6" /><path d="M8.7 13.6a7.4 7.4 0 0 0 6.6 0" /><path d="M17.9 20.6 19.6 18" /></>,
  /* 02 order sheet + trolley */
  <><rect x="3.4" y="3.2" width="11.4" height="14.4" rx="1.7" /><path d="M7.3 3.2V2.2h4.1v1" /><path d="M6.4 7.6h5.6M6.4 10.6h5.6M6.4 13.6h3.4" /><path d="M15.9 6.2h3.9l-1.1 6.1h-3.9" /><circle cx="15.6" cy="20.2" r="1.35" /><circle cx="19.5" cy="20.2" r="1.35" /></>,
  /* 03 tower crane */
  <><path d="M2.6 21.4h18.8" /><path d="M6.4 21.4V3.4" /><path d="M3.1 3.4h17.4" /><path d="M6.4 3.4 3.1 7" /><path d="M17.6 3.4v3.1" /><path d="M16.2 6.5h2.9v2.4h-2.9z" /><path d="M6.4 6.6 11.4 12" /><path d="M9.9 21.4v-8.2h4.6v8.2" /><path d="M12.2 13.2v8.2" /></>,
  /* 04 validated clipboard */
  <><rect x="4.6" y="3.4" width="14.8" height="18.2" rx="2" /><path d="M9.1 3.4V2.2h5.8v1.2" /><path d="M8.6 12.4l2.6 2.6 4.6-5.2" /></>,
  /* 05 spanner */
  <><path d="M15.1 3.1a4.6 4.6 0 0 0-5.5 6.1L3.3 15.5a1.9 1.9 0 0 0 2.7 2.7l6.3-6.3a4.6 4.6 0 0 0 6.1-5.5l-2.7 2.7-2.6-.7-.7-2.6z" /><path d="M14.4 14.1l5.4 5.4a1.7 1.7 0 0 1-2.4 2.4l-5.3-5.3" /></>,
  /* 06 link */
  <><path d="M9.4 14.6 14.6 9.4" /><path d="M7.6 10.6 5.4 12.8a3.7 3.7 0 0 0 5.2 5.2l2.2-2.2" /><path d="M16.4 13.4l2.2-2.2a3.7 3.7 0 0 0-5.2-5.2l-2.2 2.2" /></>,
]

/* label blocks the wire mask knocks out, matched to each node's text extent */
const LABELS = [
  [134, 52, 134, 70], [458, 52, 125, 70], [773, 52, 105, 70],
  [773, 215, 111, 70], [458, 215, 119, 70], [134, 215, 128, 70],
]

/* arrow chips sitting on the line between stages */
const CHIPS = [
  { left: 323, top: 80, d: 600 }, { left: 634, top: 80, d: 800 },
  { left: 633, top: 243, d: 1200, back: true }, { left: 315, top: 243, d: 1400, back: true },
]

/* small stops before each receiving disc */
const BEADS = [
  { cx: 386, cy: 80, d: 900 }, { cx: 697, cy: 80, d: 1100 },
  { cx: 697, cy: 243, d: 1300 }, { cx: 386, cy: 243, d: 1500 },
]

/* barely-visible technical mesh, bottom right — deterministic, built once */
const MESH = (() => {
  const rows = []
  for (let r = 0; r < 14; r++) {
    let d = ''
    const y0 = 302 + r * 8.5
    for (let c = 0; c <= 26; c++) {
      const x = 858 + c * 7.5
      const y = y0 - c * 2.15 - Math.sin((c / 26) * Math.PI * 1.7 + r * 0.2) * (5 + r * 0.4)
      d += (c ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' '
    }
    rows.push({ d, o: 0.22 + r * 0.03 })
  }
  return rows
})()

const ARROW_R = <><path d="M4 12h15" /><path d="M13.5 6.5 19.5 12l-6 5.5" /></>
const ARROW_L = <><path d="M20 12H5" /><path d="M10.5 6.5 4.5 12l6 5.5" /></>

export default function CycleFlow({ stages }) {
  const fitRef = useRef(null)
  const canvasRef = useRef(null)

  /* scale the fixed 1005px composition into whatever width the section gives it,
     exactly as the reference does, so the art direction never re-flows */
  useEffect(() => {
    const fit = fitRef.current
    const canvas = canvasRef.current
    if (!fit || !canvas) return

    const apply = () => {
      const w = fit.clientWidth
      /* below the mobile breakpoint the canvas becomes a vertical stack: no scaling */
      if (!w || window.matchMedia('(max-width: 860px)').matches) {
        canvas.style.transform = ''
        fit.style.height = ''
        return
      }
      const k = Math.min(1, w / 1005)
      canvas.style.transform = k === 1 ? 'none' : `scale(${k})`
      fit.style.height = Math.round(355 * k) + 'px'
    }

    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(fit)
    window.addEventListener('resize', apply)
    return () => { ro.disconnect(); window.removeEventListener('resize', apply) }
  }, [])

  /* reveal on enter */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const play = () => canvas.classList.add('play')
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      play(); return
    }
    const io = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) { play(); io.disconnect() }
    }, { threshold: 0.25 })
    io.observe(canvas)
    /* load sweep: never leave the diagram stranded hidden */
    const failsafe = setTimeout(play, 3600)
    return () => { io.disconnect(); clearTimeout(failsafe) }
  }, [])

  return (
    <div className="cyc-fit" ref={fitRef}>
      <div className="cyc-canvas" ref={canvasRef}>

        {/* one absolute SVG carrying the entire pathway */}
        <svg className="cyc-wire" viewBox="0 0 1005 355" fill="none" aria-hidden="true">
          <defs>
            {/* knocks the line out beneath discs and label blocks */}
            <mask id="cycWireMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1005" height="355">
              <rect x="0" y="0" width="1005" height="355" fill="#fff" />
              {NODES.map(n => (
                <circle key={n.i} cx={n.left + 31} cy={n.top + 31} r="35" fill="#000" />
              ))}
              {LABELS.map((l, i) => (
                <rect key={i} x={l[0]} y={l[1]} width={l[2]} height={l[3]} fill="#000" />
              ))}
            </mask>
          </defs>

          {/* continuous pathway: Design → Procure → Construct → U-turn → Commission → Maintain → Hookup */}
          <g mask="url(#cycWireMask)">
            <path className="cyc-blue" d="M 103 80 H 878 C 1030 80 1030 243 878 243 H 103"
                  stroke="#C3D1E0" strokeWidth="1.25" strokeLinecap="round" fill="none" />
          </g>

          {BEADS.map((b, i) => (
            <circle key={i} className="cyc-bead" cx={b.cx} cy={b.cy} r="3.1" fill="#C3D1E0"
                    style={{ '--d': b.d + 'ms' }} />
          ))}

          {/* red return: Hookup → back to Design */}
          <path className="cyc-red" d="M 74 243 H 30 A 20 20 0 0 1 10 223 V 96 A 20 20 0 0 1 30 76 H 60"
                strokeWidth="1.7" strokeLinecap="round" fill="none" />
          <path className="cyc-redhead" d="M 10 130 L 15.6 141 L 4.4 141 Z" />
          <circle className="cyc-bead" cx="60" cy="76" r="4" fill="#1B2A44" style={{ '--d': '2450ms' }} />

          <g className="cyc-mesh" opacity=".5">
            {MESH.map((m, i) => (
              <path key={i} d={m.d} stroke="#B9CBDE" strokeWidth=".7" fill="none" opacity={m.o.toFixed(3)} />
            ))}
          </g>
        </svg>

        {/* stages */}
        {NODES.map(n => {
          const s = stages[n.i]
          return (
            <React.Fragment key={n.i}>
              {n.i > 0 && (
                <span className="cyc-mvert" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                       strokeLinecap="round" strokeLinejoin="round">{ARROW_R}</svg>
                </span>
              )}
              <Link className="cyc-node" to={s.route}
                    style={{ left: n.left + 'px', top: n.top + 'px', '--d': n.d + 'ms' }}>
                <span className="cyc-num">{s.no}</span>
                <span className="cyc-disc">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35"
                       strokeLinecap="round" strokeLinejoin="round">{ICONS[n.i]}</svg>
                </span>
                <span className="cyc-txt">
                  <b>{n.title}</b>
                  <small>{n.desc.map((l, k) => <React.Fragment key={k}>{k > 0 && <br />}{l}</React.Fragment>)}</small>
                </span>
              </Link>
            </React.Fragment>
          )
        })}

        {/* arrow chips on the line */}
        {CHIPS.map((c, i) => (
          <span key={i} className="cyc-chip" aria-hidden="true"
                style={{ left: c.left + 'px', top: c.top + 'px', '--d': c.d + 'ms' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
                 strokeLinecap="round" strokeLinejoin="round">{c.back ? ARROW_L : ARROW_R}</svg>
          </span>
        ))}

        <p className="cyc-caption">
          <i className="rule" aria-hidden="true" /><i className="dot" aria-hidden="true" />
          <span>Tools Hookup feeds the next Design</span>
        </p>
      </div>
    </div>
  )
}
