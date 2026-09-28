import React, { useEffect, useRef, useState } from 'react'
import { VALUES } from '../data/values.js'
import Icon from './FlowIcon.jsx'
import ValuesIndex from './ValuesIndex.jsx'

/* "Six values, held on every site." — as a ring of cards in perspective.

   Client reference (4 Sep): the Awsmd portfolio's "Ring" mode — a set of cards standing on a
   tilted ring, the whole thing turning so each card comes to the front in turn, with a
   "01 — 08" counter and "scroll to explore". After a flat spoke diagram was rejected as
   "horrible", this is the shape they pointed at.

   How it is built, and why NOT Three.js: six cards of text do not need a WebGL scene. Each card
   is placed on a cylinder with `rotateY(angle) translateZ(R)` inside a `preserve-3d` ring, and
   the ring itself carries the rotation. Perspective does the sizing for free — cards at the
   back are smaller because they are further away, not because anything computes a scale. The
   only per-frame work is six opacity values, from the cosine of each card's angle to the
   front, so the back of the ring recedes into the page instead of showing six cards at equal
   weight through each other.

   Three ways to turn it: it drifts on its own, a drag spins it (with inertia), and clicking a
   card brings that card to the front. The counter tracks whichever card is nearest the front.

   The card at the front is the one being read, so it is the only one at full weight. Everything
   else on the ring is context.

   Reduced motion, and anything under 900px, gets the typographic index instead: a ring needs
   room to be a ring, and a preference against motion should not get a spinning object. */

const N = VALUES.length
const STEP = 360 / N
const R = 400                                   /* ring radius: chord between neighbours = R at 60°, so it must clear the card's APPARENT width, which perspective inflates at the front. 330 let cards overlap. */
/* 10 Sep, second correction the same hour (Bazil: "put actual pictures and icons instead", and
   "can you put the middle as the site?"). The isometric objects come off the cards; each card
   carries a photograph of the value being held on a real site, and the line mark it had before.
   The empty centre of the ring is the SITE: the campus at dusk, standing at radius zero as a
   billboard so the ring turns around it. Six values, held on every site, literally. */
const PHOTO = {
  'V·01': ['/assets/ph-crane.webp', '50% 40%'],           /* safety: the site, cranes, edge protection */
  'V·02': ['/assets/cycle3d/stage-commission.jpg', '50% 45%'], /* quality: the class proven by test */
  'V·03': ['/assets/photo-opening.webp', '60% 60%'],     /* integrity: the team, faces to the camera */
  'V·04': ['/assets/cycle3d/stage-design.jpg', '50% 50%'],   /* engineering: the design room */
  'V·05': ['/assets/cycle3d/stage-maintain.jpg', '50% 45%'], /* efficiency: the plant room, in control */
  'V·06': ['/assets/cycle3d/stage-hookup.jpg', '50% 50%'],   /* excellence: the finished tool bay */
}
const MARKS = ['shield', 'check', 'people', 'drawing', 'gauge', 'chart']
const SITE = '/assets/hero-campus.webp'
/* 10 Sep (Bazil: "the circular one", "put the isometric icons on the card", "more from the top").
   The ring is the format the client kept coming back to. Two changes: each card now carries its
   isometric object (valuesArt.js) where the 22px line mark used to sit in a corner, and the
   ring is tilted 24 degrees rather than 9, so the cards are seen from above the way an
   isometric board is, while still turning. */
const TILT = 24
const DRIFT = 0.045                             /* deg per frame when nobody is touching it */

/* shortest signed angle from a to b */
const delta = (a, b) => (((b - a) % 360) + 540) % 360 - 180

export default function ValuesRing() {
  const stageRef = useRef(null)
  const ringRef = useRef(null)
  const cardRefs = useRef([])
  const siteRef = useRef(null)
  const S = useRef({ rot: 0, vel: 0, target: null, drag: null, hover: false, raf: 0, dead: false })
  const [front, setFront] = useState(0)
  const [still, setStill] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setStill(mq.matches)
    sync(); mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (still) return
    const s = S.current, ring = ringRef.current, stage = stageRef.current
    if (!ring || !stage) return
    s.dead = false

    /* only animate while on screen: a ring nobody can see should cost nothing */
    let visible = false
    const io = new IntersectionObserver(e => { visible = e[0].isIntersecting; if (visible && !s.raf) s.raf = requestAnimationFrame(tick) }, { rootMargin: '10% 0px' })
    io.observe(stage)

    let lastFront = -1
    function tick() {
      if (s.dead || !visible) { s.raf = 0; return }
      step()
      s.raf = requestAnimationFrame(tick)
    }
    /* one frame of the ring, split out from the rAF loop so it can be stepped by hand. The
       dev harness needs this: a backgrounded preview tab freezes rAF entirely, so nothing
       here would ever run under it, and the ring would look dead when it is merely unpainted.
       Same convention as window.__fabRender in scenes/fab3d.js. */
    function step() {
      if (s.target != null) {
        /* easing to a clicked card */
        const d = delta(s.rot, s.target)
        s.rot += d * 0.11
        if (Math.abs(d) < 0.05) { s.rot = s.target; s.target = null }
      } else if (s.drag) {
        /* the hand owns it */
      } else if (Math.abs(s.vel) > 0.02) {
        /* inertia after a throw */
        s.rot += s.vel; s.vel *= 0.94
      } else if (!s.hover) {
        s.rot += DRIFT
      }
      ring.style.transform = `rotateX(-${TILT}deg) rotateY(${s.rot}deg)`
      if (siteRef.current) siteRef.current.style.transform = `rotateY(${-s.rot}deg) rotateX(${TILT}deg)`
      /* the front card is the one being read: everything else recedes with its depth */
      let best = 0, bestD = -2
      cardRefs.current.forEach((el, i) => {
        if (!el) return
        const deg = i * STEP
        const a = (deg + s.rot) * Math.PI / 180
        const depth = Math.cos(a)                      /* 1 = front, -1 = back */
        /* BILLBOARDED: the card sits on the ring but is turned back to face the camera. Without
           this the six cards faced OUTWARD, so the three at the back showed their backfaces and
           were hidden — the ring only ever showed two or three cards, where the reference shows
           all of them, the far ones small and behind. rotateY(-(a+rot)) undoes the ring turn and
           the card's own placement; rotateX(9) undoes the ring's tilt, so the card stands upright. */
        el.style.transform = `rotateY(${deg}deg) translateZ(${R}px) rotateY(${-(deg + s.rot)}deg) rotateX(${TILT}deg)`
        el.style.opacity = (0.55 + 0.45 * ((depth + 1) / 2)).toFixed(3)
        el.style.zIndex = String(Math.round(100 + depth * 50))
        el.classList.toggle('is-front', depth > 0.86)
        if (depth > bestD) { bestD = depth; best = i }
      })
      if (best !== lastFront) { lastFront = best; setFront(best) }
    }
    if (import.meta.env && import.meta.env.DEV) { window.__vrStep = step; window.__vrS = s }

    /* drag to spin, with inertia */
    /* 10 Sep (Bazil: "can't click"). The stage takes pointer capture on pointerdown so a drag
       keeps tracking outside it, but capture retargets pointerup to the stage, and the browser
       then fires `click` on the common ancestor of down and up, which is the stage, never the
       card. So the card's onClick never ran. The click is resolved HERE instead: remember the
       card the pointer went down on, and on release with under 6px of travel, turn to it. */
    const down = e => { s.drag = { x: e.clientX, last: e.clientX, t: performance.now(), el: e.target.closest && e.target.closest('.vr-card'), moved: false }; s.target = null; s.vel = 0; stage.setPointerCapture?.(e.pointerId) }
    const move = e => {
      if (!s.drag) return
      const dx = e.clientX - s.drag.last
      if (Math.abs(e.clientX - s.drag.x) > 6) s.drag.moved = true
      s.rot += dx * 0.32
      s.vel = dx * 0.32
      s.drag.last = e.clientX
    }
    const up = () => {
      const d = s.drag; s.drag = null
      if (!d || d.moved || !d.el) return
      const i = cardRefs.current.indexOf(d.el)
      if (i >= 0) { s.target = -i * STEP; s.vel = 0 }
    }
    const enter = () => { s.hover = true }
    const leave = () => { s.hover = false; s.drag = null }
    stage.addEventListener('pointerdown', down)
    stage.addEventListener('pointermove', move)
    stage.addEventListener('pointerup', up)
    stage.addEventListener('pointercancel', up)
    stage.addEventListener('pointerenter', enter)
    stage.addEventListener('pointerleave', leave)

    return () => {
      s.dead = true
      if (s.raf) cancelAnimationFrame(s.raf)
      io.disconnect()
      stage.removeEventListener('pointerdown', down)
      stage.removeEventListener('pointermove', move)
      stage.removeEventListener('pointerup', up)
      stage.removeEventListener('pointercancel', up)
      stage.removeEventListener('pointerenter', enter)
      stage.removeEventListener('pointerleave', leave)
    }
  }, [still])

  /* click a card: bring it to the front. A drag that ended on a card is not a click. */
  const focus = i => e => {
    const s = S.current
    if (s.drag && Math.abs(e.clientX - s.drag.x) > 6) return
    s.target = -i * STEP
    s.vel = 0
  }

  if (still) return <ValuesIndex />

  return (
    <div className="vr">
      <div className="vr-stage" ref={stageRef}>
        <div className="vr-ring" ref={ringRef}>
          {/* the site at the centre: radius zero, billboarded, so the front cards pass in front
              of it and the back cards behind it */}
          <div className="vr-site" ref={siteRef} aria-hidden="true"
               style={{ transform: `rotateX(${TILT}deg)` }}>
            <img src={SITE} alt="" loading="lazy" decoding="async" />
            <span className="vr-site-k">Every site</span>
          </div>
          {VALUES.map((v, i) => (
            <button type="button" className="vr-card" key={v.ix}
                    ref={el => { cardRefs.current[i] = el }}
                    style={{ transform: `rotateY(${i * STEP}deg) translateZ(${R}px) rotateY(${-i * STEP}deg) rotateX(${TILT}deg)` }}
                    onClick={focus(i)} aria-label={v.title + '. ' + v.line}>
              <span className="vr-photo" aria-hidden="true"><img src={PHOTO[v.ix][0]} alt="" loading="lazy" decoding="async" style={{ objectPosition: PHOTO[v.ix][1] }} /></span>
              <span className="vr-top">
                <span className="vr-ix">{v.ix}</span>
                <span className="vr-mark" aria-hidden="true"><Icon name={MARKS[i]} /></span>
              </span>
              <b>{v.title}</b>
              <span className="vr-line">{v.line}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="vr-foot" aria-live="polite">
        <span className="vr-hint">Drag to turn · click a value</span>
        <span className="vr-count"><b>{front + 1}</b> of {N}</span>
      </div>
      {/* the same six as a list for small screens, where the ring collapses (see CSS) */}
      <div className="vr-list"><ValuesIndex /></div>
    </div>
  )
}
