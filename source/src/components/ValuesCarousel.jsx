import React, { useCallback, useEffect, useRef, useState } from 'react'
import { VALUES } from '../data/values.js'
import Icon from './FlowIcon.jsx'
import ValuesIndex from './ValuesIndex.jsx'
import '../styles/values-carousel.css'

/* ============================================================================
   ValuesCarousel · "Six values, held on every site." (16 Sep 2026)

   Replaces the spinning ring (components/ValuesRing.jsx, kept for reference). The ring stood six
   billboarded cards and a centre photograph on one small circle: they overlapped each other, the
   titles were cut off, and it never stopped turning, so none of it could be read. Bazil: "can u
   make this look better and work better."

   What it keeps: one value held at the front, the rest standing behind it in perspective, the site
   itself behind all of them. What changes is that a card's place is now a function of ONE number,
   its offset from the front, so the front card is always clear of the others and always still.

     · the front card is full size and legible; the four behind it are turned, dimmed and stacked
     · it advances every 6s, and stops while a pointer, a finger or the keyboard is on it, while
       the tab is hidden, and whenever the section is off screen. Any move you make yourself
       restarts that 6s, so the card you just chose is never taken away half read
     · drag or swipe to turn it, click a card behind to bring it forward, arrow keys to step
     · under reduced motion the typographic index renders instead

   Geometry (see the stylesheet): X is a percentage of the card's own width, so it holds at every
   width the card clamps to. Z is what does the shrinking, through the stage's perspective. A card
   behind is set back by a WHITE VEIL, not by opacity: the first cut faded them and you could read
   the card behind straight through the card in front, which looked like a printing fault.
   ============================================================================ */

const N = VALUES.length
const HOLD = 6000

/* by distance from the front: 0 front, 1 shoulder, 2 back, 3 out of play */
const X = [0, 104, 148, 166]
const Z = [0, -240, -460, -600]
const R = [0, 12, 16, 18]
const V = [0, 0.64, 0.84, 0.92]   /* the white veil that sets a card back, so it stays opaque */
const O = [1, 1, 1, 0]            /* opacity is only ever used to take a card out of play */

/* the value being held, photographed on IAQ's own sites and days (17 Sep colour pass: the set the
   ring carried mixed the old site's stills with generated stage art; these six are all from the
   17 Sep SharePoint share, see public/assets/iaq/SOURCES.md) */
const PHOTO = {
  'V·01': ['/assets/iaq/ev-osh-crowd.webp', '50% 45%'],           /* World OSH Day, the crews at dawn */
  'V·02': ['/assets/iaq/cr-ballroom-8575.webp', '50% 50%'],       /* a finished cleanroom, every line true */
  'V·03': ['/assets/iaq/ev-mciea-team.webp', '50% 62%'],          /* the team on the MCIEA night */
  'V·04': ['/assets/iaq/hq-office-4740.webp', '50% 55%'],         /* the engineering floor at HQ */
  'V·05': ['/assets/iaq/cr-utilities-p1010229.webp', '50% 55%'],  /* a utilities corridor, the route marked */
  /* 25 Sep (Bazil: "make sure content correct"): the award photograph carried a subsidiary's name on the screen, which stays
     off public pages (client, DV3 A2.1); the finished ballroom stands for excellence delivered */
  'V·06': ['/assets/iaq/cr-ballroom-8578.webp', '50% 50%'],
}
const MARKS = ['shield', 'check', 'people', 'drawing', 'gauge', 'chart']

/* shortest signed distance from a to b around the six */
const off = (a, b) => { let d = (b - a) % N; if (d > N / 2) d -= N; if (d < -N / 2) d += N; return d }

export default function ValuesCarousel() {
  const stage = useRef(null)
  const [i, setI] = useState(0)
  const [still, setStill] = useState(false)
  const hold = useRef({ pause: false, drag: null, t: 0 })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setStill(mq.matches)
    sync(); mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  /* every manual move restarts the clock, so a card you just chose is never taken away early */
  const jump = useCallback(n => { hold.current.t = 0; setI(n) }, [])
  const go = useCallback(d => { hold.current.t = 0; setI(v => (v + d + N) % N) }, [])

  /* advance on its own, but only while the section is on screen and nothing is holding it */
  useEffect(() => {
    if (still) return
    const el = stage.current
    if (!el) return
    let seen = false
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting }, { threshold: 0.3 })
    io.observe(el)
    const STEP = 250
    const t = setInterval(() => {
      const s = hold.current
      if (!seen || s.pause || document.hidden) { s.t = 0; return }   /* held: the hold starts again */
      s.t += STEP
      if (s.t >= HOLD) { s.t = 0; setI(v => (v + 1) % N) }
    }, STEP)
    return () => { io.disconnect(); clearInterval(t) }
  }, [still])

  /* drag or swipe: 40px either way turns one card */
  useEffect(() => {
    const el = stage.current
    if (!el || still) return
    const s = hold.current
    const down = e => { s.drag = { x: e.clientX, done: false }; s.pause = true }
    const move = e => {
      if (!s.drag || s.drag.done) return
      const dx = e.clientX - s.drag.x
      if (Math.abs(dx) > 40) { go(dx < 0 ? 1 : -1); s.drag.done = true }
    }
    const up = () => { s.drag = null; s.pause = el.matches(':hover') }
    /* 25 Sep (Bazil: "clicking should move as well"): a click on the stage that lands on no card's button (the deck's
       3D transform leaves the side cards' visible faces outside their hit boxes) turns towards the side it was on */
    const tap = e => { if (e.target.closest('.vc-hit') || e.target.closest('.vc-arw') || e.target.closest('.vc-dots')) return; const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width; if (x < .42) go(-1); else if (x > .58) go(1) }
    el.addEventListener('click', tap)
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('click', tap)
      window.removeEventListener('pointerup', up)
    }
  }, [go, still])

  if (still) return <ValuesIndex />

  const key = e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
  }
  const pause = v => () => { hold.current.pause = v }

  return (
    <div className="vc">
      <div className="vc-stage" ref={stage}
           onMouseEnter={pause(true)} onMouseLeave={pause(false)}
           onFocusCapture={pause(true)} onBlurCapture={pause(false)}
           onKeyDown={key}>
        <ul className="vc-deck">
          {VALUES.map((v, n) => {
            const o = off(i, n), a = Math.min(Math.abs(o), 3), s = Math.sign(o) || 1
            return (
              <li key={v.ix} className={'vc-card' + (o === 0 ? ' is-front' : '') + (a === 3 ? ' is-out' : '')}
                  style={{ '--x': s * X[a] + '%', '--z': Z[a] + 'px', '--r': -s * R[a] + 'deg', '--op': O[a], '--veil': V[a], zIndex: 30 - a }}>
                <button type="button" className="vc-hit" tabIndex={o === 0 || a === 3 ? -1 : 0}
                        onClick={() => jump(n)} aria-label={'Show ' + v.title}>
                  <span className="vc-photo">
                    <img src={PHOTO[v.ix][0]} alt="" loading="lazy" decoding="async" style={{ objectPosition: PHOTO[v.ix][1] }} />
                    <span className="vc-n">{n + 1}</span>
                  </span>
                  <span className="vc-body">
                    <span className="vc-mark" aria-hidden="true"><Icon name={MARKS[n]} /></span>
                    <b>{v.title}</b>
                    <span className="vc-line">{v.line}</span>
                  </span>
                  <span className="vc-veil" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="vc-foot">
        <button type="button" className="vc-arw" onClick={() => go(-1)} aria-label="Previous value">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M15 5 8 12l7 7" /></svg>
        </button>
        <ol className="vc-dots">
          {VALUES.map((v, n) => (
            <li key={v.ix}>
              <button type="button" className={n === i ? 'on' : undefined} onClick={() => jump(n)}
                      aria-current={n === i ? 'true' : undefined} aria-label={v.title}>{n + 1}</button>
            </li>
          ))}
        </ol>
        <button type="button" className="vc-arw" onClick={() => go(1)} aria-label="Next value">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  )
}
