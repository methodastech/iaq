import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import '../styles/cycle-flow.css'
import { CYCLE_SVG } from '../data/cycleMarks.js'
import { fitMarks } from '../lib/fitMarks.js'

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
  /* 24 Sep (Bazil: "just put name, no need like Construct then Construction"): one name per stage, the service's own */
  { i: 0, left: 72, top: 49, d: 500, title: 'Design', desc: [] },
  { i: 1, left: 396, top: 49, d: 700, title: 'Procurement', desc: [] },
  { i: 2, left: 711, top: 49, d: 900, title: 'Construction', desc: [] },
  { i: 3, left: 711, top: 225, d: 1100, title: 'Commissioning', desc: [] },
  { i: 4, left: 396, top: 225, d: 1300, title: 'Maintenance', desc: [] },
  /* 17 Sep (Bazil, pointing the caption at this node): the sub-label used to read "Tools Hookup"
     under a title that already said Hookup, and the line that earned the loop floated on its own
     under the diagram. The line IS this stage's description, so it stands here instead. */
  { i: 5, left: 72, top: 225, d: 1500, title: 'Tools Hookup', desc: ['feeds the', 'next Design'], loop: true },
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
  [146, 52, 134, 70], [470, 52, 125, 70], [785, 52, 105, 70],
  [785, 228, 111, 70], [470, 228, 119, 70], [146, 228, 128, 70],
]

/* arrow chips sitting on the line between stages */
const CHIPS = [
  { left: 323, top: 80, d: 600 }, { left: 634, top: 80, d: 800 },
  { left: 633, top: 256, d: 1200, back: true }, { left: 315, top: 256, d: 1400, back: true },
]

/* small stops before each receiving disc */

/* barely-visible technical mesh, bottom right — deterministic, built once */
const MESH = (() => {
  const rows = []
  for (let r = 0; r < 14; r++) {
    let d = ''
    const y0 = 379 + r * 8.5
    for (let c = 0; c <= 26; c++) {
      const x = 858 + c * 7.5
      const y = y0 - c * 2.15 - Math.sin((c / 26) * Math.PI * 1.7 + r * 0.2) * (5 + r * 0.4)
      d += (c ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' '
    }
    rows.push({ d, o: 0.22 + r * 0.03 })
  }
  return rows
})()

/* 24 Sep: the discs carry the detailed vector marks Bazil had refined for the ring and the home page
   (des prc con com mnt hok), so the three cycles on the site draw the same six objects. */
const MARK_KEY = ['des', 'prc', 'con', 'com', 'mnt', 'hok']

const ARROW_R = <><path d="M4 12h15" /><path d="M13.5 6.5 19.5 12l-6 5.5" /></>
const ARROW_L = <><path d="M20 12H5" /><path d="M10.5 6.5 4.5 12l6 5.5" /></>
/* the inline handover mark (2 Sep): a double chevron, the second one lighter, so it reads as
   direction on the wire rather than as a round button sitting on it */
const CHEV_R = <><path d="M7.5 6.5 13 12l-5.5 5.5" /><path className="cyc-chev2" d="M12.5 6.5 18 12l-5.5 5.5" /></>
const CHEV_L = <><path d="M16.5 6.5 11 12l5.5 5.5" /><path className="cyc-chev2" d="M11.5 6.5 6 12l5.5 5.5" /></>

/* which stage each inline chip hands over FROM: chips sit after 01, 02, 04 and 05; the U-turn
   carries 03 → 04 and the red return carries 06 → 01 */
const CHIP_FROM = [0, 1, 3, 4]

/* the closed loop the runner rides: main line, then the red return, ending inside Design */
const LOOP = 'M 103 80 H 878 A 88 88 0 0 1 878 256 H 74 H 30 A 20 20 0 0 1 10 236 V 96 A 20 20 0 0 1 30 76 H 103'
/* twelve intervals: travel (eased), hold (flat), six times over */
const HOPS = Array.from({ length: 6 }, () => '.45 0 .2 1;0 0 1 1').join(';')

export default function CycleFlow({ stages, onStage, active = 0, dim = [] }) {   /* dim: station indexes outside a unit's own scope (the EPC page) */
  /* 4 Sep (client: "wheres the line here"). The red return was drawn with a hardcoded
     `stroke-dasharray: 108 412` summing to 520 — but the path is 293 units long, so the pattern
     was nearly twice the path and only a stub ever painted. The number was already stale before
     the rows moved on 4 Sep, and moving them made it worse. Measured at runtime now and published
     as --cycRedLen, so the dash always matches the geometry no matter where the rows sit. */
  const redRef = React.useRef(null)
  React.useEffect(() => {
    const el = redRef.current
    if (!el || !el.getTotalLength) return
    const len = el.getTotalLength()
    el.style.setProperty('--cycRedLen', len.toFixed(1))
  }, [])

  const fitRef = useRef(null)
  const canvasRef = useRef(null)
  /* the wire is masked out behind each label. Those rects used to be hardcoded, and the
     Commission label had outgrown its one by 14px, so the U-turn cut straight through the
     word (Bazil, 9 Sep: "no overlapping"). Measured from the DOM now, so a copy change
     cannot reintroduce it. */
  const [labelBoxes, setLabelBoxes] = React.useState(LABELS)
  /* 25 Sep, midday (Bazil: "icons supposed to be the same size"): every mark's viewBox is fitted to its own drawing */
  /* the fit runs two frames after mount, when the drawings measure as they will paint (a ref-time measure, taken in the
     commit, gave other numbers); a second pass at 900ms is a safety and the data-fit guard keeps it from refitting */
  useEffect(() => {
    let raf2; const raf = requestAnimationFrame(() => { raf2 = requestAnimationFrame(() => fitMarks(fitRef.current, '.cyc-mk svg')) })
    const t = setTimeout(() => fitMarks(fitRef.current, '.cyc-mk svg'), 900)
    return () => { cancelAnimationFrame(raf); cancelAnimationFrame(raf2); clearTimeout(t) }
  }, [])

  /* scale the fixed 1005px composition into whatever width the section gives it,
     exactly as the reference does, so the art direction never re-flows */
  useEffect(() => {
    const fit = fitRef.current
    const canvas = canvasRef.current
    if (!fit || !canvas) return

    const apply = () => {
      /* 9 Sep BUG (client: "isn't the website supposed to be responsive"): 93px of horizontal
         overflow between about 960 and 1100px. The scale was measured from `.cyc-fit`, but
         `.cyc-fit` contains a `flex:none` canvas fixed at 1005px, so the container is INFLATED
         BY THE THING IT IS MEASURING. Below 1005px it reported 1005 or more, the scale came out
         at or above 1, and the composition painted wider than the window.
         Measured from the PARENT now, which is the element that is actually constrained. */
      const host = fit.parentElement || fit
      const w = Math.min(fit.clientWidth, host.clientWidth || fit.clientWidth)
      /* below the mobile breakpoint the canvas becomes a vertical stack: no scaling */
      if (!w || window.matchMedia('(max-width: 860px)').matches) {
        canvas.style.transform = ''
        fit.style.height = ''
        return
      }
      /* 2 Sep (Bazil: "bigger, take more space"): the composition may grow to 1.5x its authored
         size, so on a desktop band it fills the width instead of sitting in the middle */
      const k = Math.min(1.5, w / 1005)
      canvas.style.transform = k === 1 ? 'none' : `scale(${k})`
      /* 4 Sep BUG (client: "increase the distance from the bottom content"): this reserved
         `355 * k`, the canvas height as authored back in August. The canvas has since grown to
         432 for the extra row spacing, so the container was reserving 434px for something that
         renders 528px tall — the diagram overflowed it and the "TOOLS HOOKUP FEEDS THE NEXT
         DESIGN" caption printed 43px INSIDE the stage panel below.
         `scale()` is a paint-time transform: it never changes layout height, so the parent has to
         be told. Measured from the canvas itself now, so moving the rows again cannot desync it. */
      fit.style.height = Math.round(canvas.offsetHeight * k) + 'px'

      /* offsetLeft/Top are layout values in the canvas's own 1005-unit space, so they are not
         disturbed by the paint-time scale above. 7px of padding round each label. */
      const boxes = []
      canvas.querySelectorAll('.cyc-node').forEach(node => {
        const t = node.querySelector('.cyc-txt')
        if (!t) return
        boxes.push([node.offsetLeft + t.offsetLeft - 7, node.offsetTop + t.offsetTop - 7,
                    t.offsetWidth + 14, t.offsetHeight + 14])
      })
      /* 26 Sep, later (the line rules: no short dash): where a label ends just short of the next chevron, the wire showed a
         stub between them that read as a dash; that label's mask now runs on to the chevron's white plate */
      boxes.forEach(bx => {
        const cy = bx[1] + bx[3] / 2, end = bx[0] + bx[2]
        CHIPS.forEach(c => { const cl = c.left - 17; if (Math.abs(c.top - cy) < 40 && cl > end && cl - end < 40) bx[2] = cl - bx[0] + 1 })
      })
      if (boxes.length === LABELS.length) {
        setLabelBoxes(prev => (prev.length === boxes.length &&
          prev.every((b, i) => b.every((v, k2) => Math.abs(v - boxes[i][k2]) < 1)) ? prev : boxes))
      }
    }

    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(fit)
    window.addEventListener('resize', apply)
    return () => { ro.disconnect(); window.removeEventListener('resize', apply) }
  }, [])

  /* 25 Sep (Bazil: "make sure the icons are the same size, not flat, not messy, reduce 15%"): every mark's drawing is
     measured and fitted to the same box (its longest side 74 of the 96 viewBox, centred), so the six objects read as
     one size whatever their own drawing spans; the ground shadow ellipse follows the object's foot */
  useEffect(() => {
    const fit = canvasRef.current
    if (!fit) return
    const NS = 'http://www.w3.org/2000/svg'
    for (const svg of fit.querySelectorAll('.cyc-mk svg')) {
      if (svg.querySelector(':scope > g.cyc-fitg')) continue
      /* five of the six marks keep their drawing loose under the svg (paths, circles, groups); the ground shadow is the
         first ellipse with the gnd gradient. Everything else moves into one group that is then fitted */
      const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'cyc-fitg')
      const kids = [...svg.childNodes].filter(n => n.nodeType === 1 && !/^(title|defs)$/i.test(n.tagName) && !(n.tagName.toLowerCase() === 'ellipse' && /gnd/.test(n.getAttribute('fill') || '')))
      if (!kids.length) continue
      svg.insertBefore(g, kids[0]); kids.forEach(n => g.appendChild(n))
      let bb; try { bb = g.getBBox() } catch (e) { continue }
      if (!bb || !bb.width || !bb.height) continue
      const k = 74 / Math.max(bb.width, bb.height), cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2
      g.setAttribute('transform', `translate(48 48) scale(${k.toFixed(4)}) translate(${(-cx).toFixed(2)} ${(-cy).toFixed(2)})`)
      /* (Bazil, later: "remove the shadows"): the ground ellipse is hidden by cycle-flow.css, nothing to place */
    }
  })   /* after every render (the marks land after the first one); the cyc-fitg guard makes repeats free */

  /* reveal on enter */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    /* 26 Sep (Bazil: "the loop arrow at the left side not moving and cut off"): one JS clock drives the red run along
       the wire (0 to 6 s, Design to Hookup) and then the return (6 to 7.05 s, Hookup to Design), one 7.5 s loop, both
       dashes parked off their paths otherwise. CSS keyframes on stroke-dashoffset did not repaint reliably, and an
       !important offset had frozen the return at the corner, which is what read as "not moving". The clock starts
       when .play lands so the chevrons (CSS, same moment) stay in phase, and stops while the section is off screen. */
    const run = canvas.querySelector('.cyc-run'), red = canvas.querySelector('.cyc-red')
    /* 26 Sep, later (Bazil's line rules, "no separated lines", no short dash; his answer: "just go proceed with all"): no
       dash travels the wire any more. Each path is dashed as one piece its own length, so the clock draws it as a growing
       line: the run from Design to Hookup in 6 s (its head near the old dash's speed, so the chevrons still breathe as it
       passes), then the return into Design at the same speed, a short hold, a fade, and again */
    const RL = (run && run.getTotalLength) ? run.getTotalLength() : 1826
    const BL = (red && red.getTotalLength) ? red.getTotalLength() : 247
    const RUN = 6, BACK = BL / 320, HOLD = 0.45, FADE = 0.4, PERIOD = RUN + BACK + HOLD + FADE
    const dash = (el, len) => { if (el) el.style.setProperty('stroke-dasharray', len.toFixed(1) + ' ' + len.toFixed(1), 'important') }
    const off = (el, v) => { if (el) el.style.setProperty('stroke-dashoffset', v.toFixed(1), 'important') }
    dash(run, RL); dash(red, BL); off(run, RL); off(red, BL)
    canvas.style.setProperty('--cycP', PERIOD.toFixed(2) + 's')
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (still) { off(run, 0); off(red, 0) }   /* under reduced motion the loop is simply drawn */
    let raf = 0, t0 = 0, on = false
    const tick = now => {
      if (!t0) t0 = now
      const t = ((now - t0) / 1000) % PERIOD
      const op = t > PERIOD - FADE ? (PERIOD - t) / FADE : 1
      off(run, t < RUN ? RL * (1 - t / RUN) : 0)
      off(red, t < RUN ? BL : t < RUN + BACK ? BL * (1 - (t - RUN) / BACK) : 0)
      if (run) run.style.opacity = op
      if (red) red.style.opacity = op
      raf = requestAnimationFrame(tick)
    }
    const start = () => { if (on || still) return; on = true; raf = requestAnimationFrame(tick) }
    const stop = () => { on = false; cancelAnimationFrame(raf); raf = 0 }
    const play = () => { canvas.classList.add('play'); start() }
    if (still || !('IntersectionObserver' in window)) {
      play(); return () => stop()
    }
    const io = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) { play(); io.disconnect() }
    }, { threshold: 0.25 })
    io.observe(canvas)
    /* the clock runs only while the diagram is on screen */
    const vis = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { if (canvas.classList.contains('play')) start() } else stop() }, { threshold: 0 })
    vis.observe(canvas)
    /* load sweep: never leave the diagram stranded hidden */
    const failsafe = setTimeout(play, 3600)
    return () => { io.disconnect(); vis.disconnect(); clearTimeout(failsafe); stop() }
  }, [])

  const onKey = e => {
    if (!onStage) return
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (active + (e.key === 'ArrowRight' ? 1 : 5)) % 6
    onStage(next)
    const link = fitRef.current && fitRef.current.querySelectorAll('.cyc-node')[next]
    if (link) link.focus()
  }

  return (
    <div className="cyc-fit" ref={fitRef} onKeyDown={onKey}>
      <div className="cyc-canvas" ref={canvasRef} data-active={active}>

        {/* one absolute SVG carrying the entire pathway */}
        <svg className="cyc-wire" viewBox="0 0 1005 368" fill="none" aria-hidden="true">
          <defs>
            {/* knocks the line out beneath discs and label blocks */}
            <mask id="cycWireMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1005" height="368">
              <rect x="0" y="0" width="1005" height="368" fill="#fff" />
              {NODES.map(n => (
                /* 9 Sep (Bazil: "no overlapping"): r was 46 against a 42px-radius disc, so the
                   wire stopped 4px from the edge and read as touching it. 56 leaves a clear
                   14px gap on every approach, and the arrow chevrons still land inside it. */
                <circle key={n.i} cx={n.left + 31} cy={n.top + 31} r="48" fill="#000" />
              ))}
              {labelBoxes.map((l, i) => (
                <rect key={i} x={l[0]} y={l[1]} width={l[2]} height={l[3]} fill="#000" />
              ))}
            </mask>
          </defs>

          {/* continuous pathway: Design → Procure → Construct → U-turn → Commission → Maintain → Hookup */}
          <g mask="url(#cycWireMask)">
            <path className="cyc-blue" d="M 103 80 H 878 A 88 88 0 0 1 878 256 H 103"
                  stroke="#C3D1E0" strokeWidth="1" strokeLinecap="butt" fill="none" />
            {/* 26 Sep (Bazil: "improve the animation flow"): a red run travels the whole wire from Design to Hookup, then
                the return path carries it back to Design (cycle-flow.css, cycRunWire and cycRunBack) */}
            <path className="cyc-run" d="M 103 80 H 878 A 88 88 0 0 1 878 256 H 103" />
          </g>

          {/* 9 Sep (Bazil: "no dots"): the beads sat at the point where each wire met a disc,
              so every junction carried a dot and the line looked pinned rather than run. */}

          {/* red return: Hookup → back to Design. The head sits at the TIP, pointing into the
              Design disc (2 Sep, Bazil: it used to sit halfway up the vertical, which read as a
              marker on the line rather than as the line arriving).
              9 Sep (Bazil: "no overlapping in line"): it STARTED at x 74, and the Hookup disc is
              masked to r 46 about (103, 256), so its left edge is x 57. The line was beginning
              17px inside the disc and painting over it, because the red path sits outside the
              wire mask. It starts at 49 now, which is 8px clear. */}
          {/* 26 Sep (Bazil: "the loop arrow at the left side not moving and cut off"): the return route is drawn in the
              same grey as the wire, so the loop reads whole; the red dash travels it only when the run arrives */}
          <path className="cyc-redbase" d="M 66 256 H 30 A 20 20 0 0 1 10 236 V 96 A 20 20 0 0 1 30 76 H 57"
                stroke="#C3D1E0" strokeWidth="1" strokeLinecap="butt" fill="none" />
          <path className="cyc-red" ref={redRef} d="M 66 256 H 30 A 20 20 0 0 1 10 236 V 96 A 20 20 0 0 1 30 76 H 57"
                strokeWidth="1.7" strokeLinecap="butt" fill="none" />
          {/* the head stops 6px short of the 84px disc's edge (x 61): the red path is drawn outside
              the wire mask, so anything past that edge paints OVER the disc (Bazil: no overlapping) */}
          {/* 26 Sep (Bazil: "refine the arrow so it does not overlap"): the head's tip stops at x 42, six units clear of the
              Design plate's painted edge (48; its drawing runs past its box), and the return starts eight clear of the rings */}
          <path className="cyc-redhead" d="M 68 76 L 57 70.4 L 57 81.6 Z" />

          {/* 9 Sep (Bazil: "no dots"). The travelling runner is gone with the beads. The red
              return already runs on its own dash, which carries the motion without putting
              a dot anywhere on the diagram. */}

          <g className="cyc-mesh" opacity=".28">
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
                       strokeLinecap="butt" strokeLinejoin="miter">{ARROW_R}</svg>
                </span>
              )}
              <Link className={'cyc-node' + (n.i === active ? ' on' : '') + (dim.includes(n.i) ? ' is-dim' : '')} to={s.route} aria-current={n.i === active ? 'true' : undefined}
                    onMouseEnter={onStage ? () => onStage(n.i) : undefined}
                    onFocus={onStage ? () => onStage(n.i) : undefined}
                    style={{ left: n.left + 'px', top: n.top + 'px', '--d': n.d + 'ms' }}>
                <span className="cyc-num">{s.no}</span>
                {/* the photoreal stage marks replace the line glyphs (client: the icons must
                    depict the service, 18 Aug). The SVG set stays as the no-image fallback. */}
                {/* 4 Sep (client: "too many circles that are messy"): the faint .cyc-orbit ring
                    sat around every disc permanently, so each node was two concentric circles at
                    rest and three when active. The disc carries the mark and the arc marks the
                    active stage: the middle ring said nothing and made six nodes read as clutter. */}
                <span className="cyc-arc" aria-hidden="true" />
                <span className="cyc-disc has-mk">
                  <span className="cyc-mk" aria-hidden="true" dangerouslySetInnerHTML={{ __html: CYCLE_SVG[MARK_KEY[n.i]] }} />
                </span>
                <span className="cyc-txt">
                  <b>{n.title}</b>
                  {n.desc.length > 0 && <small className={n.loop ? 'is-loop' : undefined}>{n.desc.map((l, k) => <React.Fragment key={k}>{k > 0 && <br />}{k > 0 ? ' ' : ''}{l}</React.Fragment>)}</small>}
                </span>
              </Link>
            </React.Fragment>
          )
        })}

        {/* arrow chips on the line */}
        {CHIPS.map((c, i) => (
          <span key={i} className={'cyc-chip' + (CHIP_FROM[i] === active ? ' hot' : '')} aria-hidden="true"
                style={{ left: c.left + 'px', top: c.top + 'px', '--d': c.d + 'ms' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
                 strokeLinecap="butt" strokeLinejoin="miter">{c.back ? CHEV_L : CHEV_R}</svg>
          </span>
        ))}

        {/* 17 Sep: the caption that sat under stage 5 is gone. It is stage 6's sub-label now, in
            the node it describes (see NODES above). It travelled from the canvas edge, to under
            stage 5, to here, which is where it was always pointing. */}
      </div>
    </div>
  )
}
