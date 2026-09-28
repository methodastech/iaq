import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { longDate } from '../data/news.js'
import { art } from '../data/newsArt.js'
import NewsMark from './NewsMark.jsx'
import '../styles/news-front.css'

/* ---------------------------------------------------------------------------
   FEATURED · /news, first thing under the banner

   14 Sep, third pass. Bazil: "I need user to see 3-4 at once, constant slow scroll left to
   right, and the bottom is latest", then "why repeat info", "no need this left side", "but
   make the UI awesome scrolling".

   One full-width rail of tall photo tiles, the story named on each photograph. It is driven
   by requestAnimationFrame rather than a CSS animation so that it can respond:
   · it drifts left to right at BASE px/s, and never stops on its own
   · scrolling the page throws it: the scroll adds velocity in the scroll's direction, which
     eases back to the drift
   · it can be dragged or swiped, and keeps the momentum of the release
   · a horizontal trackpad swipe moves it
   · the pointer on the rail eases it to a stop, so a tile can be read and clicked
   · each photograph slides a little inside its tile against the rail's movement (depth)
   Two copies of the set sit side by side and the position wraps by one set width, so the loop
   has no seam. The copy is aria-hidden and out of the tab order. Off screen, hidden tab, or
   the pause button: nothing runs. prefers-reduced-motion: a still rail you scroll by hand.
   --------------------------------------------------------------------------- */

const BASE = 38            /* drift, px per second, left to right */
const EASE = 3.2           /* how fast the speed settles on its target, per second */

export default function NewsFeatured({ items, list, headingId = 'nf-feat-h' }) {
  const count = items.length
  const [held, setHeld] = useState(false)
  const [still, setStill] = useState(false)
  const rootRef = useRef(null)
  const railRef = useRef(null)
  const trackRef = useRef(null)
  const setRef = useRef(null)
  const st = useRef({ pos: 0, speed: BASE, boost: 0, hover: false, drag: null, held: false, seen: true, moved: false, lastY: 0 })
  st.current.held = held

  useEffect(() => {
    if (!window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const read = () => setStill(mq.matches)
    read()
    if (mq.addEventListener) mq.addEventListener('change', read)
    return () => { if (mq.removeEventListener) mq.removeEventListener('change', read) }
  }, [])

  useEffect(() => {
    if (still) return
    const s = st.current, rail = railRef.current, track = trackRef.current, set = setRef.current
    if (!rail || !track || !set) return
    let raf = 0, last = performance.now(), setW = set.getBoundingClientRect().width
    const zoomOf = () => (rail.offsetWidth ? rail.getBoundingClientRect().width / rail.offsetWidth : 1)
    let zf = zoomOf()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { zf = zoomOf(); setW = set.getBoundingClientRect().width / zf }) : null
    if (ro) { ro.observe(set); ro.observe(rail) }
    setW = setW / zf
    const imgs = () => [...track.querySelectorAll('.nf-mc-m img')]
    let pics = imgs()

    const frame = now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      if (!s.drag) {
        const target = (s.hover || s.held) ? 0 : BASE
        s.speed += (target - s.speed) * Math.min(1, dt * EASE)
        s.boost *= Math.exp(-dt * 2.4)
        s.pos += (s.speed + s.boost) * dt
      }
      if (setW > 0) {
        const x = ((s.pos % setW) + setW) % setW - setW
        track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`
        /* depth: each photograph sits 8% wider than its tile and slides against its position */
        const rr = rail.getBoundingClientRect(), mid = rr.left + rr.width / 2
        for (const im of pics) {
          const r = im.parentElement.getBoundingClientRect()
          if (r.right < rr.left - 40 || r.left > rr.right + 40) continue
          const k = ((r.left + r.width / 2) - mid) / rr.width
          im.style.transform = `translate3d(${(-k * 6).toFixed(2)}%,0,0) scale(1.08)`
        }
      }
      raf = s.seen && !document.hidden ? requestAnimationFrame(frame) : 0
    }
    const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame) } }
    const stop = () => { cancelAnimationFrame(raf); raf = 0 }

    const io = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([e]) => { s.seen = e.isIntersecting; if (s.seen) start(); else stop() }, { threshold: 0 })
      : null
    if (io) io.observe(rail)
    const onVis = () => { if (!document.hidden && s.seen) start() }
    document.addEventListener('visibilitychange', onVis)

    /* the page scroll throws the rail: down pushes it on, up pulls it back */
    s.lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY, dy = y - s.lastY; s.lastY = y
      if (s.hover || s.held || s.drag) return
      s.boost = Math.max(-900, Math.min(900, s.boost + dy * 7))
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    /* drag and swipe, with the release velocity kept */
    const down = e => {
      if (e.button !== undefined && e.button !== 0) return
      s.drag = { x: e.clientX, t: performance.now(), v: 0, from: e.clientX }
      s.moved = false
      s.boost = 0; s.speed = 0
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up, { once: true })
      window.addEventListener('pointercancel', up, { once: true })
    }
    const move = e => {
      const d = s.drag; if (!d) return
      const now = performance.now(), dx = (e.clientX - d.x) / zf
      if (Math.abs(e.clientX - d.from) > 6) { s.moved = true; rail.classList.add('dragging') }
      s.pos += dx
      const dtm = Math.max(1, now - d.t)
      d.v = d.v * 0.6 + (dx / dtm * 1000) * 0.4
      d.x = e.clientX; d.t = now
    }
    const up = () => {
      const d = s.drag; s.drag = null
      window.removeEventListener('pointermove', move)
      rail.classList.remove('dragging')
      if (d) s.boost = Math.max(-2400, Math.min(2400, d.v))
    }
    rail.addEventListener('pointerdown', down)
    /* a drag is not a click */
    const click = e => { if (s.moved) { e.preventDefault(); e.stopPropagation(); s.moved = false } }
    rail.addEventListener('click', click, true)
    /* horizontal trackpad swipes; vertical wheel stays with the page */
    const wheel = e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); s.pos -= e.deltaX / zf; s.boost = 0 } }
    rail.addEventListener('wheel', wheel, { passive: false })
    const enter = e => { if (e.pointerType === 'mouse') s.hover = true }
    const leave = e => { if (e.pointerType === 'mouse') s.hover = false }
    rail.addEventListener('pointerenter', enter)
    rail.addEventListener('pointerleave', leave)

    start()
    return () => {
      stop(); if (ro) ro.disconnect(); if (io) io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', move)
      rail.removeEventListener('pointerdown', down)
      rail.removeEventListener('click', click, true)
      rail.removeEventListener('wheel', wheel)
      rail.removeEventListener('pointerenter', enter)
      rail.removeEventListener('pointerleave', leave)
    }
  }, [still, count])

  /* keyboard: a focused tile is brought fully into view, and the rail holds while focus is in it */
  const onFocusCard = e => {
    const s = st.current, rail = railRef.current
    if (!rail || still) return
    s.hover = true
    const rr = rail.getBoundingClientRect(), r = e.currentTarget.getBoundingClientRect()
    const zf = rail.offsetWidth ? rr.width / rail.offsetWidth : 1
    if (r.left < rr.left) s.pos += (rr.left - r.left + 24) / zf
    else if (r.right > rr.right) s.pos -= (r.right - rr.right + 24) / zf
  }
  const onBlurRail = e => { if (!railRef.current.contains(e.relatedTarget)) st.current.hover = false }

  if (!count) return null

  const tile = (m, copy) => (
    <Link key={copy + m.slug} className="nf-mc" to={`/news/${m.slug}`} draggable="false"
          aria-hidden={copy ? 'true' : undefined} tabIndex={copy ? -1 : undefined}
          onFocus={copy ? undefined : onFocusCard}>
      <span className="nf-mc-m"><img src={art(m, list)} alt="" loading="eager" decoding="async" draggable="false" /></span>
      {/* 14 Sep (Bazil: "must have tagging and icon"): the category is a tag with its newsroom mark */}
      <span className="nf-tag"><NewsMark tag={m.tag} />{m.tag}</span>
      <span className="nf-mc-b">
        <time className="nf-mc-d" dateTime={m.date}>{longDate(m.date)}</time>
        <span className="nf-mc-t">{m.title}</span>
        <span className="nf-mc-go">Read the story <i aria-hidden="true">&rarr;</i></span>
      </span>
    </Link>
  )

  return (
    <div className="nf-fx" ref={rootRef} role="region" aria-labelledby={headingId}>
      <div className="nf-head">
        <h2 className="nf-h" id={headingId}>Featured</h2>
        {!still && (
          <button type="button" className="nf-btn" onClick={() => setHeld(h => !h)}
                  aria-label={held ? 'Play featured stories' : 'Pause featured stories'} aria-pressed={held}>
            {held
              ? <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4.5 2.8v10.4L13 8z" fill="currentColor" /></svg>
              : <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4.5 3h2.2v10H4.5zM9.3 3h2.2v10H9.3z" fill="currentColor" /></svg>}
          </button>
        )}
      </div>
      <div className={'nf-marq' + (still ? ' still' : '')} ref={railRef} onBlur={onBlurRail}>
        <div className="nf-marq-track" ref={trackRef}>
          <div className="nf-marq-set" ref={setRef}>{items.map(m => tile(m, 0))}</div>
          {!still && <div className="nf-marq-set" aria-hidden="true">{items.map(m => tile(m, 1))}</div>}
        </div>
      </div>
    </div>
  )
}
