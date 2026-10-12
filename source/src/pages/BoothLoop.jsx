import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Icon from '../components/FlowIcon.jsx'
import { Fab, FAB } from './BoothScreen.jsx'
import { SLIDES } from '../components/CodexSlides.jsx'
import SystemMap from '../components/SystemMap.jsx'
import { MapBand } from '../components/ServicesMap.jsx'
import { Qr, C } from '../components/booth/Art.jsx'
import { EVENT } from '../data/booth.js'
import { QR_URL } from '../data/boothQr.js'
import { useBrandFonts } from '../lib/brandFonts.js'
import '../styles/pages.css'
import '../styles/codex.css'
import '../styles/codex-parts.css'
import '../styles/booth-loop.css'

/* ============================================================================
   The booth loop (8 Oct 2026): "make like html for digital screen ... and looping", from four references: the three
   units across the life of a facility (Codex slide 2), the same on one chart (the Services page's chart), the fab built
   (the booth screen's drag-to-build) and the IAQ facility map. One browser tab, full screen on the stand's screen.

   It is the booth screen's machinery (pages/BoothScreen.jsx): a 1920 x 1080 stage scaled to the window, the tab bar with
   a red line filling under the section that is on, LOOP and EXPLORE. Looping, each section plays for its time and the
   next comes up, round and round. Any touch, click or key hands it to the visitor (the tabs, the chart, the fab's slider,
   the map); sixty seconds untouched and it loops again. Each section is the real component, not a picture of it: the
   slide and the chart are scaled to fill the stage (Fit), the fab is the booth screen's own section, the facility map
   runs its tour by itself. Keys: 1 to 4, the arrows, Space to pause, F for full screen. Review builds only (main.jsx).
   ============================================================================ */

const W = 1920, H = 1080, IDLE = 60
const CHAPTERS = [
  { id: 'units', k: 'Three units', dur: 20 },
  { id: 'chart', k: 'Units and services', dur: 26 },
  { id: 'fab', k: 'The fab, built', dur: FAB.dur },
  { id: 'map', k: 'Facility map', dur: 40 },
]
const UNITS_SLIDE = SLIDES.find(s => s.n === 2).C
/* 8 Oct ("too much space"): the facility map is a wide band on the site, which left the lower part of the screen empty.
   Laid out at 1500 and scaled up, it fills the stage edge to edge */
const MAP_W = 1500

/* a component laid out at its own design width, then scaled to fill the section without cropping */
function Fit ({ w, pad = 40, children }) {
  const box = useRef(null), inner = useRef(null)
  const [s, setS] = useState(1)
  useLayoutEffect(() => {
    const b = box.current, i = inner.current
    if (!b || !i) return
    const fit = () => {
      const bw = b.clientWidth - pad * 2, bh = b.clientHeight - pad * 2, ih = i.offsetHeight
      if (bw > 0 && bh > 0 && ih > 0) setS(Math.min(bw / w, bh / ih))
    }
    const ro = new ResizeObserver(fit)
    ro.observe(b); ro.observe(i); fit()
    return () => ro.disconnect()
  }, [w, pad])
  return (
    <div className="bl-fit" ref={box}>
      <div className="bl-fit-in" ref={inner} style={{ width: w, transform: `translate(-50%, -50%) scale(${s})` }}>{children}</div>
    </div>
  )
}

export default function BoothLoop () {
  useBrandFonts()
  const [ci, setCi] = useState(0)
  const [t, setT] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hand, setHand] = useState(false)
  const [sel, setSel] = useState({})
  const [book, setBook] = useState(false)
  const [scale, setScale] = useState(1)
  const last = useRef(performance.now()), idle = useRef(0)

  useEffect(() => { document.title = 'IAQ Group · Booth loop · ' + EVENT.name }, [])
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H))
    fit(); window.addEventListener('resize', fit)
    document.documentElement.classList.add('bs-on')
    return () => { window.removeEventListener('resize', fit); document.documentElement.classList.remove('bs-on') }
  }, [])

  /* the clock, as on the booth screen: time in a ref, published once a frame */
  const tRef = useRef(0), ciRef = useRef(0), pausedRef = useRef(false), handRef = useRef(false)
  ciRef.current = ci; pausedRef.current = paused; handRef.current = hand
  useEffect(() => {
    let raf
    const tick = now => {
      const dt = Math.min(0.1, (now - last.current) / 1000); last.current = now
      if (handRef.current) {
        idle.current += dt
        if (idle.current > IDLE) { setHand(false); setPaused(false); setSel({}); setBook(false); tRef.current = 0 }
      }
      if (!pausedRef.current) {
        const dur = CHAPTERS[ciRef.current].dur
        tRef.current += dt
        if (tRef.current >= dur) {
          if (handRef.current) tRef.current = dur
          else { tRef.current = 0; setSel({}); setCi(c => (c + 1) % CHAPTERS.length) }
        }
        setT(tRef.current)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const wake = useCallback(() => { idle.current = 0; setHand(true) }, [])
  const jump = useCallback(n => { tRef.current = 0; setCi((n + CHAPTERS.length) % CHAPTERS.length); setT(0); setSel({}); setBook(false); setPaused(false); wake() }, [wake])
  const pick = useCallback(patch => { wake(); setSel(s => ({ ...s, ...patch })) }, [wake])
  useEffect(() => {
    const key = e => {
      wake()
      if (e.key >= '1' && e.key <= String(CHAPTERS.length)) jump(+e.key - 1)
      else if (e.key === 'ArrowRight') jump(ci + 1)
      else if (e.key === 'ArrowLeft') jump(ci - 1)
      else if (e.key === ' ') { e.preventDefault(); setPaused(p => !p) }
      else if (e.key === 'f' || e.key === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => {}) }
      else if (e.key === 'Escape' && book) setBook(false)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [ci, jump, wake, book])

  const ch = CHAPTERS[ci]
  return (
    <div className={'bl' + (hand ? ' bl-x' : ' bl-loop')} onPointerDownCapture={wake}>
      <div className="bs-stage" style={{ transform: `translate(-50%,-50%) scale(${scale})` }}>
        <header className="bs-top">
          <span className="bs-home bl-home"><img src="/booth/iaq-mark.png" alt="IAQ" /></span>
          <nav>
            {CHAPTERS.map((c, i) => (
              <button type="button" key={c.id} className={i === ci ? 'on' : undefined} onClick={() => jump(i)}>
                <span>{c.k}</span><i style={{ '--p': i === ci ? Math.min(1, t / c.dur) : 0 }} />
              </button>
            ))}
          </nav>
          {hand
            ? <button type="button" className="bs-book" onClick={() => { wake(); setBook(true) }}><Icon name="calendar" />Book a meeting</button>
            : <button type="button" className="bs-book bs-hint" onClick={wake}><span className="bs-tap" />Touch to explore</button>}
        </header>

        {/* one section at a time: each mounts when it comes up, so the 3D of the fab and the map run only while shown */}
        {ch.id === 'fab'
          ? <div className="bs-ch" key={'fab' + ci}><Fab t={t} x={hand} sel={sel} pick={pick} /></div>
          : (
            <div className={'bl-ch bl-' + ch.id} key={ch.id + ci}>
              {ch.id === 'units' && <Fit w={1280}><UNITS_SLIDE /></Fit>}
              {ch.id === 'chart' && <Fit w={1500}><SystemMap embed /></Fit>}
              {ch.id === 'map' && <Fit w={MAP_W} pad={24}><MapBand autoTour /></Fit>}
            </div>
          )}

        {book && (
          <div className="bs-bk" role="dialog" aria-label="Book a meeting" onClick={() => setBook(false)}>
            <div className="bs-bk-in" onClick={e => e.stopPropagation()}>
              <div className="bs-bk-qr"><svg viewBox="-3 -3 36 36" aria-hidden="true"><Qr x={0} y={0} s={30} fill={C.ink} /></svg></div>
              <div>
                <span className="bs-kick">{EVENT.name} · Munich</span>
                <h2 className="bs-h2">Book a meeting <em>with the team.</em></h2>
                <p className="bs-p">Scan with your phone camera: it opens the booth page and a form with the reason already set. Or talk to the team at the counter now.</p>
                <p className="bs-bk-url">{QR_URL}<span>business@iaqtechnology.com.my</span></p>
              </div>
              <button type="button" className="bs-bk-x" onClick={() => setBook(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
      {paused && <div className="bs-paused">Paused · Space to play</div>}
    </div>
  )
}
