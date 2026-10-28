import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Icon from '../components/FlowIcon.jsx'
import { DECKS } from '../data/presentations.jsx'
import '../styles/presentation.css'

/* 7 Oct 2026 (Bazil: "in codex we need to add a tab called presentation", "one of it is IAQ Europe presentation 1",
   "for this we need tabs at the top and they're just like slides", "this one is for the screen exhibition", "i need a
   showreel where it shows all slides automatically ... and loop"). The portal's Presentation group lists the decks
   (data/presentations.jsx); this page shows one. The tabs across the top ARE the slides, one each; the one in hand
   shows below at 16:9. Arrow keys and the two buttons step; the hash (#s3) deep-links a slide; Full screen puts the
   tabs and the slide alone on the TV. Showreel (or ?reel on the address) plays every slide for its own time, each
   running its own motion, and goes round again; a touch on the slide holds it, and the reel resumes after a pause.
   A slide with `keep` shares one live instance (the 3D) that stays mounted, hidden, while another slide is up. */
const slideFromHash = deck => {
  const m = /^#s(\d+)$/.exec(typeof location !== 'undefined' ? location.hash : '')
  const n = m ? +m[1] - 1 : 0
  return n >= 0 && n < deck.slides.length ? n : 0
}
const IDLE = 30000   /* a touch holds the showreel this long */
const REFRESH_3D = 90 * 60 * 1000   /* the 3D is reloaded at the start of a loop once it has run this long */

/* 9 Oct (Bazil: "make sure stable"): a slide that throws never blanks the screen. It shows the IAQ mark in its place,
   tells the deck, and is tried again the next time it comes round (the guard is keyed by slide) */
class SlideGuard extends React.Component {
  constructor (p) { super(p); this.state = { err: null } }
  static getDerivedStateFromError (err) { return { err } }
  componentDidCatch (err) { try { console.error('IAQ deck: a slide failed and was skipped', err) } catch {} ; if (this.props.onFail) this.props.onFail() }
  render () { return this.state.err ? <div className="pr-fail"><img src="/assets/iaq-logo.webp" alt="IAQ" /></div> : this.props.children }
}

/* standalone: the deck on its own (deck.html, the exhibition package): no portal head, the screen fills the window from
   the first frame, F or the button toggles the browser's real full screen */
export default function Presentation ({ standalone = false }) {
  const { deck: deckId } = useParams()
  const deck = DECKS.find(d => d.id === deckId) || DECKS[0]
  const [i, setI] = useState(() => slideFromHash(deck))
  const [fs, setFs] = useState(false)
  /* where the browser refuses the full-screen API (an embedded pane, a kiosk shell), the screen fills the window instead */
  const [fill, setFill] = useState(standalone)
  const [reel, setReel] = useState(() => typeof location !== 'undefined' && /[?&]reel\b/.test(location.search))
  const [held, setHeld] = useState(false)
  /* 7 Oct (Bazil: "must have a zoom in feature to take space at the screen"): Zoom in and out. On the 3D it is the app's own
     camera zoom (crisp); on every other slide the content scales from its centre, 1 to 2 in quarter steps */
  const [zoom, setZoom] = useState(1)
  /* full screen is the booth TV: the slide fills the screen; the tab bar stays over its top (visitors touch it), the
     controls rise from the foot while the pointer moves and sink after a moment */
  const [peek, setPeek] = useState(true)
  /* the tab strip can be closed to a corner mark and reopened (Bazil: "an icon to close and open") */
  const [tabsOpen, setTabsOpen] = useState(true)
  const tabs = useRef(null), show = useRef(null), holdT = useRef(0), peekT = useRef(0)
  /* the 3D: `gen` remounts it (a lost graphics context, a failure, or the periodic refresh); `preload` loads it in the
     background a few seconds after the deck opens, so Build opens on a ready facility */
  const [gen, setGen] = useState(0)
  const [preload, setPreload] = useState(false)
  const born3d = useRef(Date.now())
  const renew3d = useCallback(() => { born3d.current = Date.now(); setGen(g => g + 1) }, [])
  useEffect(() => { const t = setTimeout(() => setPreload(true), 4000); return () => clearTimeout(t) }, [])
  useEffect(() => { setI(slideFromHash(deck)) }, [deck])
  useEffect(() => { document.title = standalone ? `IAQ · ${deck.name}` : `IAQ Group · Portal · ${deck.name} · Brand Method` }, [deck.name, standalone])
  const go = useCallback(n => {
    const k = (n + deck.slides.length) % deck.slides.length
    setI(k)
    if (typeof history !== 'undefined') history.replaceState(null, '', location.search + `#s${k + 1}`)
  }, [deck])
  const step = useCallback(n => { const k = Math.max(0, Math.min(deck.slides.length - 1, n)); go(k) }, [deck, go])
  useEffect(() => { setZoom(1) }, [i])
  const zoomBy = useCallback(d => {
    const cur = deck.slides[i]
    if (cur.keep) {
      const f = show.current && show.current.querySelector('.pr-keep.on iframe')
      let b = null; try { b = f && f.contentDocument && f.contentDocument.getElementById(d > 0 ? 'zoom-in' : 'zoom-out') } catch {}
      if (b) b.click()
      return
    }
    setZoom(z => Math.max(1, Math.min(2, Math.round((z + d * .25) * 100) / 100)))
  }, [deck, i])
  const wake = useCallback(() => {
    setPeek(true); clearTimeout(peekT.current)
    peekT.current = setTimeout(() => setPeek(false), 3200)
  }, [])
  useEffect(() => () => clearTimeout(peekT.current), [])
  /* filling the window (and on load in the standalone deck), the controls show for a moment and then sink, so the TV
     shows the slide alone until someone moves the pointer */
  useEffect(() => { if (fill) wake() }, [fill, wake])
  useEffect(() => {
    const h = e => {
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); step(i + 1) }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); step(i - 1) }
      if (e.key === 'Escape' && !standalone) { setFill(false) }
      if (e.key === 'f' || e.key === 'F') { e.preventDefault(); fullRef.current && fullRef.current() }
      if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomBy(1) }
      if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomBy(-1) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [i, step, zoomBy, standalone])
  /* the tab in hand stays in view when the strip scrolls sideways */
  useEffect(() => {
    const a = tabs.current && tabs.current.querySelector('a.on')
    if (a && a.scrollIntoView) a.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [i])
  useEffect(() => {
    const h = () => { setFs(!!(document.fullscreenElement || document.webkitFullscreenElement)); wake() }
    document.addEventListener('fullscreenchange', h); document.addEventListener('webkitfullscreenchange', h)
    return () => { document.removeEventListener('fullscreenchange', h); document.removeEventListener('webkitfullscreenchange', h) }
  }, [wake])
  const full = () => {
    const el = show.current; if (!el) return
    if (standalone) {
      /* the window is already filled: the button only asks the browser for (or out of) its real full screen */
      if (document.fullscreenElement || document.webkitFullscreenElement) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return }
      const rq = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen
      if (rq) { try { const p = rq.call(document.documentElement); if (p && p.catch) p.catch(() => {}) } catch {} }
      return
    }
    if (fill) { setFill(false); return }
    if (document.fullscreenElement || document.webkitFullscreenElement) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return }
    const req = el.requestFullscreen || el.webkitRequestFullscreen
    if (!req) { setFill(true); wake(); return }
    try { const p = req.call(el); if (p && p.catch) p.catch(() => { setFill(true); wake() }) } catch { setFill(true); wake() }
    /* some shells neither grant nor reject: if nothing is full screen a moment later, fill the window */
    setTimeout(() => { if (!(document.fullscreenElement || document.webkitFullscreenElement)) { setFill(true); wake() } }, 400)
  }
  const fullRef = useRef(null); fullRef.current = full
  const s = deck.slides[i]
  const last = deck.slides.length - 1
  const playing = reel && !held
  /* the showreel: each slide for its own seconds, then the next, round again after the last */
  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => {
      /* round again: a 3D that has run for an hour and a half is reloaded while the banner plays (fresh memory for a
         whole show day, unattended) */
      if (i === last && Date.now() - born3d.current > REFRESH_3D) renew3d()
      go(i + 1)
    }, (s.dur || 15) * 1000)
    return () => clearTimeout(t)
  }, [playing, i, s, go, last, renew3d])
  /* a failed slide: in the showreel the deck moves on after a moment; a failed 3D is remounted */
  const failed = useCallback(isKeep => {
    if (isKeep) setTimeout(renew3d, 1500)
    if (reelRef.current) setTimeout(() => goRef.current(iRef.current + 1), 2500)
  }, [renew3d])
  const reelRef = useRef(false), goRef = useRef(go), iRef = useRef(i)
  reelRef.current = playing; goRef.current = go; iRef.current = i
  /* a touch on the slide holds the reel; it resumes after IDLE with no touch */
  const touch = () => {
    if (!reel) return
    setHeld(true); clearTimeout(holdT.current)
    holdT.current = setTimeout(() => setHeld(false), IDLE)
  }
  useEffect(() => () => clearTimeout(holdT.current), [])
  const toggleReel = () => { setReel(r => !r); setHeld(false); clearTimeout(holdT.current) }
  /* while the screen fills the window the page itself does not scroll (no scrollbar beside the screen) */
  useEffect(() => { const h = document.documentElement; h.classList.toggle('pr-filling', fill); return () => h.classList.remove('pr-filling') }, [fill])
  /* the kept instances: one per `keep` key, mounted from first use, hidden in place while another slide is up */
  const keeps = []
  deck.slides.forEach(x => { if (x.keep && !keeps.some(k => k.keep === x.keep)) keeps.push(x) })
  return (
    <div className={'pr' + (standalone ? ' pr-alone' : '')}>
      {!standalone && <div className="cms-wrap pr-head">
        <div className="cms-head"><div><h1>{deck.h[0]} <em>{deck.h[1]}</em></h1><p>{deck.lede}</p></div></div>
      </div>}
      <div className={'pr-show' + (fs || fill ? ' is-fs' : '') + (fill ? ' fill' : '') + (playing ? ' is-reel' : '') + (peek ? ' peek' : '')} ref={show} onPointerMove={fs || fill ? wake : undefined}>
        {/* the screen: the 16:9 the TV shows, the tab bar part of it (Bazil: "the tab must be part of the screen") */}
        <div className="pr-screen">
        <nav className={'pr-tabs' + (tabsOpen ? '' : ' closed')} aria-label={deck.name} ref={tabs}>
          <div>
            {deck.slides.map((x, k) => (
              <a key={x.id} href={'#s' + (k + 1)} className={k === i ? 'on' : undefined} aria-current={k === i ? 'true' : undefined} onClick={e => { e.preventDefault(); go(k); touch() }}>
                <i aria-hidden="true" />{x.tab}
              </a>
            ))}
          </div>
          <span className="pr-tabs-r">
          {/* the loop mark (Bazil: "an icon feature that loops everything over and over"): the showreel, on the screen itself */}
          <button type="button" className={'pr-tabs-loop' + (reel ? ' on' : '')} onClick={toggleReel} aria-pressed={reel} aria-label={reel ? 'Stop the loop' : 'Loop every slide'} title={reel ? (held ? 'Loop held, resumes after a pause' : 'Loop on') : 'Loop every slide'}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 4l3 3-3 3M7 20l-3-3 3-3M20 7H9a4 4 0 0 0-4 4v1M4 17h11a4 4 0 0 0 4-4v-1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" /></svg>
          </button>
          <button type="button" className="pr-tabs-x" onClick={() => setTabsOpen(false)} aria-label="Close the tabs" title="Close the tabs"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" /></svg></button>
          </span>
        </nav>
        {!tabsOpen && <button type="button" className="pr-tabs-o" onClick={() => setTabsOpen(true)} aria-label="Open the tabs" title="Open the tabs"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" /></svg></button>}
          <div className="pr-slide" onPointerDownCapture={touch} onKeyDownCapture={touch} onWheelCapture={touch}>
            {keeps.map(x => {
              const on = s.keep === x.keep
              return <div className={'pr-keep' + (on ? ' on' : '')} key={x.keep + ':' + gen} aria-hidden={!on}><SlideGuard onFail={() => failed(true)}><x.C mode={on ? s.mode : x.mode} active={on} preload={preload} reel={on && playing} dur={s.dur} onLost={renew3d} /></SlideGuard></div>
            })}
            {!s.keep && <div className="pr-live" key={s.id} style={zoom !== 1 ? { transform: `scale(${zoom})` } : undefined}><SlideGuard onFail={() => failed(false)}><s.C active reel={playing} dur={s.dur} /></SlideGuard></div>}
          </div>
        </div>
        <div className="pr-stage">
          <div className="pr-ctl">
            <span className="pr-ctl-l">
              <button type="button" className="pr-prev" onClick={() => step(i - 1)} disabled={i === 0}><Icon name="arrow" />Previous</button>
              <button type="button" className={'pr-reel' + (reel ? ' on' : '')} onClick={toggleReel} aria-pressed={reel}><Icon name="play" />{reel ? (held ? 'Showreel held' : 'Showreel on') : 'Showreel'}</button>
            </span>
            <span className="pr-n"><b>{i + 1} / {deck.slides.length}</b>{s.tab}</span>
            <span className="pr-ctl-r">
              <span className="pr-zoom" role="group" aria-label="Zoom">
                <button type="button" onClick={() => zoomBy(-1)} aria-label="Zoom out" disabled={!s.keep && zoom <= 1}><Icon name="minus" /></button>
                <b>{s.keep ? 'Zoom' : Math.round(zoom * 100) + '%'}</b>
                <button type="button" onClick={() => zoomBy(1)} aria-label="Zoom in" disabled={!s.keep && zoom >= 2}><Icon name="plus" /></button>
              </span>
              <button type="button" className="pr-full" onClick={full}>{standalone ? (fs ? 'Exit full screen' : 'Full screen') : (fs || fill ? 'Exit full screen' : 'Full screen')}</button>
              <button type="button" className="pr-next" onClick={() => step(i + 1)} disabled={i === last}>Next<Icon name="arrow" /></button>
            </span>
          </div>
          {s.says && <p className="pr-note">{s.says}</p>}
        </div>
      </div>
    </div>
  )
}
