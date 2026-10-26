import React, { useEffect, useRef, useState } from 'react'
import '../styles/build3d3.css'

/* Build3D3 · IAQ 3D 3, the developer's new engine, on the home page (26 Oct 2026, "replace the home page 3D with this new
   version": yes). The delivery is a window-sized app of its own (public/build3d3, brought in by tools/embed-3d3.mjs), so
   it runs in a frame on a sticky stage, and the page and the frame talk:

     page -> frame  "b3d3-p": how far the visitor has scrolled through the section, as the change since the last message
                    and the two ends, so the build follows the page scroll and finishes as the section ends
     frame -> page  "b3d3-wheel": the wheel turned over the model; the page scrolls by it

   Desktop: a runway under the stage gives the section its length. Phones build by tapping (the app's own Tap build),
   one screen tall, no runway. The frame loads once the page is idle on a desktop, only as the section comes near on a
   phone. Build3D (the previous delivery, mounted into the page) is kept for a return. */
const SRC = '/build3d3/projects/iaq3d3/index.html'
const HOLD = 0.78   /* share of the section's scroll that builds; the rest holds the finished facility */
const TOUCH = () => matchMedia('(hover: none) and (pointer: coarse)').matches

export default function Build3D3 () {
  const sec = useRef(null), stage = useRef(null), frame = useRef(null)
  const [src, setSrc] = useState(null)
  const [touch] = useState(() => (typeof window !== 'undefined' ? TOUCH() : false))

  /* load: idle on a desktop, near on a phone */
  useEffect(() => {
    const el = sec.current
    if (!el) return
    if (!touch) {
      const go = () => setSrc(SRC)
      const id = window.requestIdleCallback ? requestIdleCallback(go, { timeout: 1500 }) : setTimeout(go, 1800)
      return () => (window.cancelIdleCallback ? cancelIdleCallback(id) : clearTimeout(id))
    }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSrc(SRC); io.disconnect() } }, { rootMargin: '150% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [touch])

  /* the bridge */
  useEffect(() => {
    const el = sec.current, st = stage.current
    if (!el || !st) return
    let last = -1
    const frac = () => {
      const r = el.getBoundingClientRect(), vh = st.getBoundingClientRect().height || innerHeight
      const span = r.height - vh
      /* 27 Oct ("the parallax not yet complete ... then i already scroll to the next section"): the build reaches the finished
         facility at HOLD of the way through the section, and the rest of the scroll holds it on screen, so the envelope,
         the car park and the handover have played out before the page moves on */
      return span > 0 ? Math.min(1, Math.max(0, -r.top / span) / HOLD) : 0
    }
    const send = () => {
      const r = el.getBoundingClientRect(), vh = st.getBoundingClientRect().height || innerHeight
      /* the nav steps aside while the stage fills the window */
      document.documentElement.classList.toggle('b3d-pin', r.top <= 1 && r.bottom >= vh - 1)
      if (touch) return
      const f = frac()
      if (last < 0) last = f
      const df = f - last
      if (df === 0 && f > 0 && f < 1) return
      last = f
      frame.current?.contentWindow?.postMessage({ kind: 'b3d3-p', f, df }, location.origin)
    }
    let shown = 0
    const wheel = e => {
      if (e.origin !== location.origin || !e.data) return
      if (e.data.kind === 'b3d3-shown') { shown = +e.data.s || 0; return }
      if (e.data.kind !== 'b3d3-wheel') return
      const dy = +e.data.dy || 0
      const L = window.__lenis
      let to = (L ? (L.targetScroll ?? L.scroll ?? scrollY) : scrollY) + dy
      /* 27 Oct: the page holds at the end of the section until the finished facility is on screen (the frame reports how far
         its picture has got); the scroll after that carries on to the next section */
      if (dy > 0 && shown < 0.995) {
        const r = el.getBoundingClientRect(), vh = st.getBoundingClientRect().height || innerHeight
        const end = scrollY + r.bottom - vh
        if (to > end) to = Math.max(scrollY, end)
      }
      /* force: a scroll the visitor asked for goes through even if something has paused the smooth scroller */
      if (L) L.scrollTo(to, { force: true })
      else window.scrollTo(0, to)
    }
    addEventListener('scroll', send, { passive: true })
    addEventListener('resize', send)
    addEventListener('message', wheel)
    send()
    return () => {
      removeEventListener('scroll', send); removeEventListener('resize', send); removeEventListener('message', wheel)
      document.documentElement.classList.remove('b3d-pin')
    }
  }, [touch])

  /* the client's skip (12 Oct): straight past the build to the markets band */
  const skip = e => {
    e.stopPropagation()
    /* on the home page the markets band (#industries); elsewhere (Services) whatever section follows the 3D */
    const to = document.getElementById('industries') || sec.current?.nextElementSibling; if (!to) return
    const navH = document.querySelector('.nav')?.offsetHeight || 0
    if (window.__lenis) window.__lenis.scrollTo(to, { immediate: true, force: true, offset: -navH })
    else window.scrollTo({ top: to.getBoundingClientRect().top + scrollY - navH, behavior: 'instant' })
  }

  return (
    <section className={'b3d3' + (touch ? ' is-touch' : '')} id="build3d" ref={sec} aria-label="IAQ's facility, built as you scroll">
      <div className="b3d3-stage" ref={stage}>
        {src
          ? <iframe ref={frame} src={src} title="IAQ's facility, built as you scroll" allow="fullscreen" />
          : <div className="b3d3-wait" aria-hidden="true"><span>3D rendering</span></div>}
        <button type="button" className="b3d3-skip" onClick={skip}>
          <span>Skip the 3D</span>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 3l4 4 4-4M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      {!touch && <div className="b3d3-runway" aria-hidden="true" />}
    </section>
  )
}
