import React, { useEffect, useRef } from 'react'
import { VALUES } from '../data/values.js'
import ValuesCarousel from './ValuesCarousel.jsx'
import '../styles/values-grid.css'

/* "Six values, held on every site." — 3 Sep, line-drawing pass.

   The photoreal isometric renders are gone (Bazil: "not the style I want"). Each value is now
   an ISOMETRIC LINE DIAGRAM in exactly the language of the vision and mission drawings: fine
   hairlines on white, grey and black only, no fills that read as colour and no glow.

   The geometry is generated rather than hand-drawn: every diagram is a short list of boxes,
   discs and rules in world coordinates which `iso()` projects onto the page. That keeps all six
   on one true axis, so a row of them reads as one drawing rather than six sketches.

   The concept holds from the previous pass: IAQ's world is measured, so the six sit on one
   graduated rail, each taking the major graduation on its own segment. */

/* ---- isometric projection: x right and back, z right and forward, y up ---- */
const C30 = Math.cos(Math.PI / 6), S30 = 0.5
const iso = (x, y, z) => [(x - z) * C30, (x + z) * S30 - y]

/* Each diagram is declared as primitives in world units. Nothing is positioned by hand on the
   page: every point is projected, the whole set is measured, and one transform fits it to the
   middle of the frame. That is why all six sit at the same size on the same axis, centred,
   instead of drifting around their tiles (3 Sep). */
const B = (x, y, z, w, h, d) => {            /* the three visible faces of a box */
  const X = x + w, Y = y + h, Z = z + d
  return [
    { t: 'p', pts: [[x, Y, z], [X, Y, z], [X, Y, Z], [x, Y, Z]] },
    { t: 'p', pts: [[x, y, Z], [x, Y, Z], [X, Y, Z], [X, y, Z]] },
    { t: 'p', pts: [[X, y, z], [X, Y, z], [X, Y, Z], [X, y, Z]] },
  ]
}
const L = (a, b, k) => ({ t: 'l', pts: [a, b], k })
const D = (c, r) => ({ t: 'd', c, r })
const FLOOR = (w, d) => {
  const out = []
  for (let i = 0; i <= w; i++) out.push({ t: 'g', pts: [[i, 0, 0], [i, 0, d]] })
  for (let i = 0; i <= d; i++) out.push({ t: 'g', pts: [[0, 0, i], [w, 0, i]] })
  return out
}

/* helpers for the scenes: a worker, a guard rail run, a red accent */
const D2 = (c, r, k) => ({ t: 'd', c, r, k })
const PG = (pts, k) => ({ t: 'p', pts, k })
const RAIL = (pts, y) => pts.map((p, i) => L([p[0], y, p[1]], [pts[(i + 1) % pts.length][0], y, pts[(i + 1) % pts.length][1]], 1))
const WORKER = (x, y, z) => [
  L([x - 0.12, y, z], [x - 0.12, y + 0.7, z], 1), L([x + 0.12, y, z], [x + 0.12, y + 0.7, z], 1),           /* legs */
  ...B(x - 0.22, y + 0.7, z - 0.12, 0.44, 0.62, 0.24),                                                     /* torso */
  L([x - 0.22, y + 1.25, z], [x - 0.42, y + 0.85, z], 1), L([x + 0.22, y + 1.25, z], [x + 0.42, y + 0.85, z], 1),   /* arms */
  D([x, y + 1.5, z], 0.17), D2([x, y + 1.68, z], 0.22, 2),                                                 /* head, red hard hat */
]

/* Each value is a SCENE from IAQ's own work, not an abstract shape (client, 4 Sep: "create a
   good diagram for this section"). Same hairline language, one red accent per scene. */
const SPECS = [
  /* V-01 safety: a railed platform, a worker in a red hat clipped to a lifeline anchor */
  () => [...FLOOR(6, 5), ...B(1, 0, 1, 4, 0.3, 3),
    ...[[1, 1], [3, 1], [5, 1], [5, 2.5], [5, 4], [3, 4], [1, 4], [1, 2.5]].map(([x, z]) => L([x, 0.3, z], [x, 1.4, z], 1)),
    ...RAIL([[1, 1], [5, 1], [5, 4], [1, 4]], 1.4), ...RAIL([[1, 1], [5, 1], [5, 4], [1, 4]], 0.9),
    ...WORKER(3, 0.3, 2.5),
    L([1.5, 0.3, 2.5], [1.5, 3.1, 2.5], 1), L([4.5, 0.3, 2.5], [4.5, 3.1, 2.5], 1), L([1.5, 3.1, 2.5], [4.5, 3.1, 2.5], 1),   /* fall-arrest gantry */
    L([3.0, 3.1, 2.5], [3.0, 1.95, 2.5], 2),                                                                 /* lifeline, straight down to the harness */
    ...B(0.2, 0, 3.6, 0.06, 0.9, 0.8), L([0.26, 0.55, 3.75], [0.26, 0.55, 4.25], 2)],                        /* site board */
  /* V-02 quality: three identical panels under one level line, a gauge on the middle one, a ticked sheet */
  () => [...FLOOR(6, 4), ...B(0.6, 0, 1.4, 4.4, 0.25, 1.2),
    ...B(1.0, 0.25, 1.7, 0.9, 1.5, 0.15), ...B(2.4, 0.25, 1.7, 0.9, 1.5, 0.15), ...B(3.8, 0.25, 1.7, 0.9, 1.5, 0.15),
    L([0.7, 1.85, 1.75], [4.9, 1.85, 1.75], 2),                                                              /* the level line */
    L([2.85, 0.25, 2.5], [2.85, 2.45, 2.5], 1), D([2.85, 2.75, 2.5], 0.5), L([2.85, 2.75, 2.5], [3.15, 3.05, 2.5], 2),   /* gauge and needle */
    ...B(5.3, 0, 2.5, 0.7, 0.05, 0.9), L([5.45, 0.07, 2.75], [5.6, 0.07, 2.95], 2), L([5.6, 0.07, 2.95], [5.85, 0.07, 2.62], 2)],
  /* V-03 honesty and integrity: a plumb line over a stack that is true, a spirit level reading level */
  () => [...FLOOR(5, 4), ...B(1.2, 0, 1.2, 2.6, 0.3, 2.2),
    ...B(2.1, 0.3, 1.9, 0.8, 0.55, 0.8), ...B(2.1, 0.85, 1.9, 0.8, 0.55, 0.8), ...B(2.1, 1.4, 1.9, 0.8, 0.55, 0.8),
    L([1.3, 0.3, 1.4], [1.3, 3.1, 1.4], 1), L([3.7, 0.3, 1.4], [3.7, 3.1, 1.4], 1), L([1.3, 3.1, 1.4], [3.7, 3.1, 1.4], 1),
    L([2.5, 3.1, 1.4], [2.5, 2.25, 1.4], 2), D2([2.5, 2.16, 1.4], 0.11, 2),                                  /* plumb line and bob */
    ...B(1.95, 1.95, 2.2, 1.1, 0.16, 0.22), D2([2.5, 2.12, 2.31], 0.09, 2)],                                 /* spirit level, bubble centred */
  /* V-04 engineering: the building rising off its own drawing, set square and pencil on the sheet */
  () => [...FLOOR(6, 5), ...B(0.8, 0, 1.0, 3.8, 0.06, 2.8),
    L([1.2, 0.07, 1.3], [4.2, 0.07, 1.3], 1), L([1.2, 0.07, 3.5], [4.2, 0.07, 3.5], 1), L([1.2, 0.07, 1.3], [1.2, 0.07, 3.5], 1), L([4.2, 0.07, 1.3], [4.2, 0.07, 3.5], 1),
    ...[2.2, 3.2].map(x => L([x, 0.07, 1.3], [x, 0.07, 3.5], 1)),                                            /* plan grid */
    ...B(1.7, 0.06, 1.7, 2.0, 1.1, 1.4),                                                                     /* the model */
    L([1.7, 1.16, 1.7], [3.7, 1.16, 1.7], 2), L([3.7, 1.16, 1.7], [3.7, 1.16, 3.1], 2), L([3.7, 1.16, 3.1], [1.7, 1.16, 3.1], 2), L([1.7, 1.16, 3.1], [1.7, 1.16, 1.7], 2),
    D([2.2, 1.3, 2.1], 0.14), D([3.1, 1.3, 2.7], 0.14),                                                      /* roof plant */
    PG([[4.0, 0.07, 3.2], [4.55, 0.07, 3.2], [4.0, 0.07, 3.75]], 1),                                         /* set square */
    ...B(0.95, 0.06, 3.3, 1.5, 0.08, 0.08),                                                                  /* pencil */
    L([1.7, 0.08, 3.9], [3.7, 0.08, 3.9], 2), L([1.7, 0.08, 3.8], [1.7, 0.08, 4.0], 2), L([3.7, 0.08, 3.8], [3.7, 0.08, 4.0], 2)],   /* dimension */
  /* V-05 efficiency: a plant feeding a controlled line, and the energy chart falling behind it */
  () => [...FLOOR(6, 4), ...B(0.6, 0, 1.2, 1.6, 1.3, 1.6), D([2.2, 0.65, 2.0], 0.42),
    L([2.2, 1.0, 2.0], [4.6, 1.0, 2.0], 1), L([2.2, 1.08, 2.0], [4.6, 1.08, 2.0], 1),                        /* the line */
    D([3.4, 1.04, 2.0], 0.2), L([3.4, 1.04, 2.0], [3.4, 1.5, 2.0], 1), D2([3.4, 1.6, 2.0], 0.14, 2),          /* valve, red handwheel */
    L([4.0, 1.08, 2.0], [4.0, 1.35, 2.0], 1), D([4.0, 1.6, 2.0], 0.26), L([4.0, 1.6, 2.0], [4.15, 1.8, 2.0], 2),   /* gauge */
    ...B(4.6, 0.3, 1.7, 0.5, 1.3, 0.6),                                                                      /* manifold */
    ...B(0.5, 0, 3.1, 2.6, 1.7, 0.08),                                                                       /* chart board */
    ...B(0.8, 0.1, 3.05, 0.4, 1.2, 0.05), ...B(1.4, 0.1, 3.05, 0.4, 0.85, 0.05), ...B(2.0, 0.1, 3.05, 0.4, 0.5, 0.05),
    L([1.0, 1.45, 3.04], [2.2, 0.75, 3.04], 2)],                                                             /* the trend, down */
  /* V-06 excellence: three steps up to the finished facility, the flag raised, the handover signed */
  () => [...FLOOR(6, 5), ...B(0.8, 0, 1.4, 1.2, 0.4, 2.4), ...B(2.0, 0, 1.4, 1.2, 0.8, 2.4), ...B(3.2, 0, 1.4, 2.2, 1.2, 2.4),
    ...B(3.5, 1.2, 1.7, 1.6, 0.9, 1.8), D([4.0, 2.15, 2.2], 0.16), D([4.6, 2.15, 2.6], 0.16),
    L([5.15, 1.2, 1.6], [5.15, 3.7, 1.6], 1), PG([[5.15, 3.7, 1.6], [5.85, 3.5, 1.6], [5.15, 3.3, 1.6]], 2),   /* the flag */
    ...B(1.0, 0.4, 1.8, 0.9, 0.7, 0.05), L([1.2, 0.7, 1.78], [1.4, 0.55, 1.78], 2), L([1.4, 0.55, 1.78], [1.75, 0.95, 1.78], 2)],   /* signed off */
]

const VB_W = 200, VB_H = 148, PAD = 12

function Diagram({ kind }) {
  const items = SPECS[kind]()
  /* measure everything in projected space, then fit it to the middle of the frame */
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  const flat = items.map(it => {
    if (it.t === 'd') {
      const [px, py] = iso(it.c[0], it.c[1], it.c[2])
      x0 = Math.min(x0, px - it.r); x1 = Math.max(x1, px + it.r)
      y0 = Math.min(y0, py - it.r); y1 = Math.max(y1, py + it.r)
      return { ...it, p: [px, py] }
    }
    const ps = it.pts.map(([a, b, c]) => iso(a, b, c))
    ps.forEach(([px, py]) => { x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py) })
    return { ...it, p: ps }
  })
  const k = Math.min((VB_W - PAD * 2) / (x1 - x0 || 1), (VB_H - PAD * 2) / (y1 - y0 || 1))
  const ox = (VB_W - (x1 - x0) * k) / 2 - x0 * k
  const oy = (VB_H - (y1 - y0) * k) / 2 - y0 * k
  const T = ([px, py]) => [(ox + px * k).toFixed(1), (oy + py * k).toFixed(1)]

  const ground = [], art = []
  flat.forEach((it, i) => {
    if (it.t === 'g') ground.push(<line key={'g' + i} x1={T(it.p[0])[0]} y1={T(it.p[0])[1]} x2={T(it.p[1])[0]} y2={T(it.p[1])[1]} />)
    else if (it.t === 'p') art.push(<polygon key={'p' + i} className={it.k === 2 ? 'r' : it.k ? 'k' : undefined} points={it.p.map(q => T(q).join(',')).join(' ')} />)
    else if (it.t === 'l') art.push(<line key={'l' + i} className={it.k === 2 ? 'r' : it.k ? 'k' : undefined} x1={T(it.p[0])[0]} y1={T(it.p[0])[1]} x2={T(it.p[1])[0]} y2={T(it.p[1])[1]} />)
    else art.push(<ellipse key={'d' + i} className={it.k === 2 ? 'r' : undefined} cx={T(it.p)[0]} cy={T(it.p)[1]} rx={(it.r * k).toFixed(1)} ry={(it.r * k * 0.86).toFixed(1)} />)
  })
  return (
    <svg className="vg-dia" viewBox={`0 0 ${VB_W} ${VB_H}`} fill="none" aria-hidden="true">
      <g className="vg-g">{ground}</g>
      <g className="vg-a">{art}</g>
    </svg>
  )
}

export default function ValuesGrid() {
  const ref = useRef(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const items = [...root.querySelectorAll('.vg-item')]
    const show = () => items.forEach(i => i.classList.add('in'))
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { show(); return }
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } })
    }, { threshold: 0.15 })
    items.forEach(i => io.observe(i))
    const bail = setTimeout(show, 2600)
    return () => { io.disconnect(); clearTimeout(bail) }
  }, [])

  return (
    <section className="vg" id="values" ref={ref}>
      <div className="wrap">
        <span className="eyebrow">What we hold</span>
        <h2>Six values, held on every site.</h2>
        <ValuesCarousel />
      </div>
    </section>
  )
}
