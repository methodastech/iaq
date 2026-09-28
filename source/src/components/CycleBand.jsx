import React, { useEffect, useRef, useState } from 'react'
import CycleFlow from './CycleFlow.jsx'
import Icon from './FlowIcon.jsx'
import { CYCLE } from '../data/cycle.js'
import '../styles/cycle-band.css'

/* ============================================================================
   CycleBand · the delivery cycle on the home page (24 Sep 2026).
   Bazil, with the Services cover (its heading, lede and three facts) and the serpentine side by side: "this info
   should be at picture 2, and put this at the second section of this website". So the serpentine (CycleFlow.jsx,
   the six stages left to right, the U-turn, the red return from Hookup into the next Design) carries the cover's
   words, and sits second on the home page, straight after the hero. The ring it replaces (Bazil: "lame boxy
   stuff and paper") is gone from the home page. The three facts are plain, in a row, no boxes.
   ============================================================================ */
/* head: the band as a page head (the Services page, 24 Sep): the title is the page's h1 and the band sits under the nav */
export default function CycleBand ({ head = false, id = 'services' }) {
  const [active, setActive] = useState(0)
  const H = head ? 'h1' : 'h2'
  /* 24 Sep (Bazil: "have this flow once every 3 seconds"): the active stage steps round on its own while the band is on
     screen, until the reader touches a stage; reduced motion, no stepping */
  const touched = useRef(false), seen = useRef(false), box = useRef(null)
  useEffect(() => {
    const el = box.current; if (!el) return
    const io = new IntersectionObserver(([e]) => { seen.current = e.isIntersecting }, { threshold: .35 })
    io.observe(el)
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => io.disconnect()
    const t = setInterval(() => { if (touched.current || !seen.current || document.hidden) return; setActive(a => (a + 1) % 6) }, 3000)
    return () => { io.disconnect(); clearInterval(t) }
  }, [])
  const pick = i => { touched.current = true; setActive(i) }
  return (
    <section className={'sec cyb' + (head ? ' cyb-ashead' : '')} id={id} aria-labelledby={'cyb-h-' + id} ref={box}>
      <div className="wrap">
        <div className="cyb-head">
          {/* 26 Sep (Bazil: "title it correctly", "do six stages of service") */}
          <H id={'cyb-h-' + id} className="kind-h k-s"><Icon name="cycle" className="kind-ic" /><em>6 services</em></H>{/* 26 Sep (Bazil: "this one should be 6 services"): the kind, in its colour */}
          {/* 24 Sep (Bazil: "I'd like the description be on the right with the icons stuff") */}
          <div className="cyb-side">
            <p className="cyb-lede" data-reveal="">Design, procurement, construction, commissioning, maintenance and tools hookup, run as one cycle by one team.</p>
            <ul className="cyb-facts" aria-label="In short">
              <li><Icon name="grid" />Six services</li>
              <li><Icon name="cycle" />One cycle</li>
              <li><Icon name="cube" />Three business units</li>
            </ul>
          </div>
        </div>
        {/* 26 Sep, small hours (Bazil: "revert back to the previous horizontal diagram"): the serpentine is back in place of
            the ring that stood here for an hour (ServiceRing.jsx stays on disk) */}
        <CycleFlow stages={CYCLE} active={active} onStage={pick} />
      </div>
    </section>
  )
}
