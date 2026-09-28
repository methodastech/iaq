import React, { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '../components/FlowIcon.jsx'
import { FRAMES, STORY } from '../components/codex/FabStory.jsx'
import { DotMap, Qr, C, OFFICES } from '../components/booth/Art.jsx'
import { MESSAGE, EVENT, SCREEN } from '../data/booth.js'
import { SERVICES, UNITS } from '../data/codex.js'
import { QR_URL } from '../data/boothQr.js'
import { useBrandFonts } from '../lib/brandFonts.js'
import '../styles/booth-screen.css'

/* ============================================================================
   The booth screen (22 Sep 2026): a website, not a video. One browser tab, open full screen on the stand
   machine for the 55 inch screen at SEMICON Europa. Bazil: "a full on screen to show the services full
   including the 3D of how it works"; then "it must be shown in a website form ... a total tab that needs
   to be open and shown looping to the public and interacted".

   The stage is always 1920 x 1080 and is scaled to the window, so what is checked here is what the
   screen shows. Rules (data/booth.js SCREEN): silent; headlines 80 px and up, text 34 px and up, labels
   32 px and up; one sentence a section; the 3D model is IAQ's own Revit sequence.

   Two modes. LOOP: the sections advance on their own, with "Touch the screen to explore" in the corner.
   EXPLORE: any touch, click or key hands it over. The header is the site's navigation; in each section
   the visitor can scrub the fab model and tap its five moments, open a unit, filter the services by
   unit, open a hook-up phase, and "Book a meeting" shows the code. Sixty seconds untouched and it loops
   again. Keys for the team: 1 to 6, the arrows, Space, F for full screen, Esc back to the portal.
   Open to anyone (no member session): the content is the booth page's. Review builds only (main.jsx).
   ============================================================================ */

const W = 1920, H = 1080, IDLE = 60
const FPS = 6, HOLD = 4.5
/* the model builds a moment at a time: play its frames, then hold on its last frame with the caption */
const FAB = (() => {
  const seg = []
  let t = 0
  STORY.forEach((m, i) => {
    const play = (m.to - m.from + 1) / FPS
    seg.push({ i, a: t, b: t + play + HOLD, from: m.from, to: m.to, play })
    t += play + HOLD
  })
  return { seg, dur: t + 2 }
})()
const stageOf = f => Math.max(0, STORY.findIndex(s => f >= s.from && f <= s.to))
const UNIT_IMG = ['/assets/iaq/site-aerial-build.webp', '/assets/iaq/cr-utilities-p1010242.webp', '/assets/iaq/plant-dusk-01.webp']
const PHASES = [
  ['Facilitize', 'Drops, power, structure and room built to the tool maker’s requirements.'],
  ['Rig in', 'Uncrated in an airlock, moved on an agreed route, set, levelled and isolated.'],
  ['Hook up', 'Each utility tapped from its valve manifold and connected into the tool.'],
  ['Commission', 'Leak tested, purged, balanced, trip tested, handed to operations.'],
]
const DUR = { open: 9, fab: FAB.dur, units: 16, services: 21, hookup: 18, europe: 14 }
const CHAPTERS = SCREEN.chapters.filter(c => DUR[c.id]).map(c => ({ ...c, dur: DUR[c.id] }))
const inFrame = (() => { try { return window.self !== window.top } catch { return true } })()

export default function BoothScreen() {
  useBrandFonts()
  const [ci, setCi] = useState(0)
  const [t, setT] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hand, setHand] = useState(false)        /* explore: a visitor or the team is driving */
  const [sel, setSel] = useState({})             /* what the visitor has picked in the current section */
  const [book, setBook] = useState(false)
  const [scale, setScale] = useState(1)
  const last = useRef(performance.now()), idle = useRef(0)

  useEffect(() => { document.title = 'IAQ Group · Booth screen · SEMICON Europa 2026' }, [])
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H))
    fit(); window.addEventListener('resize', fit)
    document.documentElement.classList.add('bs-on')
    return () => { window.removeEventListener('resize', fit); document.documentElement.classList.remove('bs-on') }
  }, [])
  /* preload every frame and picture once, so the tab runs without the network after it opens */
  useEffect(() => { [...FRAMES, ...UNIT_IMG, '/booth/iaq-mark.png'].forEach(s => { const i = new Image(); i.src = s }) }, [])

  /* the clock: time lives in a ref and is published once a frame; the section changes outside any updater */
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
          if (handRef.current) tRef.current = dur                       /* exploring: stay on the section */
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
      else if (e.key === 'Escape') { if (book) setBook(false); else if (!document.fullscreenElement && !inFrame) window.location.assign('/portal/booth') }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [ci, jump, wake, book])

  const ch = CHAPTERS[ci]
  const P = { t, x: hand, sel, pick, jump, setBook }
  return (
    <div className={'bs' + (hand ? ' bs-x' : ' bs-loop')} onPointerDownCapture={wake}>
      <div className="bs-stage" style={{ transform: `translate(-50%,-50%) scale(${scale})` }}>
        <header className="bs-top">
          <button type="button" className={'bs-home' + (ci === 0 ? ' on' : '')} onClick={() => jump(0)} aria-label="IAQ, home">
            <img src="/booth/iaq-mark.png" alt="IAQ" /><i style={{ '--p': ci === 0 ? Math.min(1, t / ch.dur) : 0 }} />
          </button>
          <nav>
            {CHAPTERS.slice(1).map((c, k) => {
              const i = k + 1
              return <button type="button" key={c.id} className={i === ci ? 'on' : undefined} onClick={() => jump(i)}><span>{c.k}</span><i style={{ '--p': i === ci ? Math.min(1, t / c.dur) : 0 }} /></button>
            })}
          </nav>
          {hand
            ? <button type="button" className="bs-book" onClick={() => { wake(); setBook(true) }}><Icon name="calendar" />Book a meeting</button>
            : <button type="button" className="bs-book bs-hint" onClick={wake}><span className="bs-tap" />Touch to explore</button>}
        </header>

        <div className="bs-ch" key={ch.id + ci}>
          {ch.id === 'open' && <Open {...P} />}
          {ch.id === 'fab' && <Fab {...P} />}
          {ch.id === 'units' && <Units {...P} />}
          {ch.id === 'services' && <Services {...P} />}
          {ch.id === 'hookup' && <Hookup {...P} />}
          {ch.id === 'europe' && <Europe {...P} />}
        </div>

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

/* ---- the sections. `t` is seconds into the section, `x` is explore mode ---- */
const In = ({ d = 0, t, children, className = '', as: T = 'div', ...r }) => <T className={'bs-in ' + className + (t >= d ? ' on' : '')} {...r}>{children}</T>

function Open({ t, jump, setBook }) {
  return (
    <section className="bs-open">
      <In t={t} d={0.2} className="bs-kick">{MESSAGE.tagline}</In>
      <In t={t} d={0.6} as="h1" className="bs-h1">Controlled environments, <em>built to class.</em></In>
      <In t={t} d={1.6} className="bs-figs">
        {MESSAGE.proof.slice(0, 3).map(([n, l]) => <div key={n}><b>{n}</b><span>{l}</span></div>)}
      </In>
      <In t={t} d={2.4} className="bs-acts">
        <button type="button" className="bs-btn" onClick={() => jump(1)}><Icon name="play" />Watch a fab being built</button>
        <button type="button" className="bs-btn ghost" onClick={() => setBook(true)}><Icon name="calendar" />Book a meeting</button>
      </In>
    </section>
  )
}

function Fab({ t, x, sel, pick }) {
  const s = FAB.seg.find(v => t >= v.a && t < v.b) || FAB.seg[FAB.seg.length - 1]
  const auto = t >= FAB.dur - 2 ? 60 : Math.min(s.to, s.from + Math.floor((t - s.a) * FPS))
  const f = sel.f != null ? sel.f : auto
  const si = sel.f != null ? stageOf(f) : s.i
  const m = STORY[si]
  return (
    <section className="bs-fab">
      <div className="bs-fab-img"><img src={FRAMES[f]} alt="" /></div>
      <div className="bs-fab-copy" key={si}>
        <span className="bs-step">{si + 1} <small>of {STORY.length}</small></span>
        <h2 className="bs-h2">{m.k}</h2>
        <p className="bs-p">{m.t}</p>
        <div className="bs-who"><span className="bs-unit">{m.unit}</span><span>{m.does}</span></div>
      </div>
      <div className="bs-fab-ctl">
        <ol>
          {STORY.map((v, i) => (
            <li key={v.k}><button type="button" className={i === si ? 'on' : i < si ? 'done' : undefined} onClick={() => pick({ f: v.to })} aria-label={v.k}><b>{i + 1}</b><span>{v.k}</span></button></li>
          ))}
        </ol>
        <label className="bs-scrub">
          <span>{x ? 'Drag to build it' : 'Building'}</span>
          <input type="range" min="0" max="60" value={f} onChange={e => pick({ f: +e.target.value })} aria-label="Drag through the build" />
        </label>
      </div>
    </section>
  )
}

function Units({ t, x, sel, pick }) {
  const auto = Math.min(2, Math.floor(Math.max(0, t - 2) / 4.6))
  const open = sel.u != null ? UNITS[sel.u] : null
  if (open) {
    const i = sel.u
    return (
      <section className="bs-units bs-uopen">
        <div className="bs-uo-img"><img src={UNIT_IMG[i]} alt="" /></div>
        <div className="bs-uo-copy" key={i}>
          <h2 className="bs-h2">{open.short || open.name}</h2>
          <p className="bs-uo-full">{open.short ? open.name : open.full}</p>
          <p className="bs-p">{open.what}</p>
          <ul className="bs-uo-models">{open.models.map(md => <li key={md.t}><b>{md.t}</b><span>{md.s}</span></li>)}</ul>
        </div>
        <div className="bs-uo-nav">
          <button type="button" onClick={() => pick({ u: null })}><Icon name="grid" />All three units</button>
          {UNITS.map((u, k) => <button type="button" key={u.id} className={k === i ? 'on' : undefined} onClick={() => pick({ u: k })}>{u.short || u.name}</button>)}
        </div>
      </section>
    )
  }
  return (
    <section className="bs-units">
      <In t={t} d={0.1} as="h2" className="bs-h2">Three business units, <em>one facility.</em></In>
      <div className="bs-ucards">
        {UNITS.map((u, i) => (
          <In t={t} d={0.5 + i * 0.3} key={u.id} as="button" type="button" className={'bs-ucard' + (!x && i === auto ? ' lit' : '')} onClick={() => pick({ u: i })}>
            <span className="bs-uimg"><img src={UNIT_IMG[i]} alt="" /></span>
            <b>{u.short || u.name}</b>
            <span className="bs-uline">{u.line}</span>
            <span className="bs-more">See how<Icon name="arrow" /></span>
          </In>
        ))}
      </div>
    </section>
  )
}

function Services({ t, x, sel, pick }) {
  /* first the six, then each unit lights what it carries (the Codex: core, and ask); a visitor picks a unit */
  const auto = t < 6 ? -1 : Math.min(2, Math.floor((t - 6) / 5))
  const phase = sel.su !== undefined ? sel.su : (x ? -1 : auto)
  const u = phase >= 0 ? UNITS[phase] : null
  const sv = sel.sv != null ? SERVICES.find(s => s.id === sel.sv) : null
  return (
    <section className="bs-svc">
      <div className="bs-svc-h">
        <In t={t} d={0.1} as="h2" className="bs-h2">Six services, <em>one contract.</em></In>
        <In t={t} d={0.4} className="bs-chips" role="group" aria-label="Show the services a unit carries">
          <button type="button" className={!u ? 'on' : undefined} onClick={() => pick({ su: -1, sv: null })}>All six</button>
          {UNITS.map((un, k) => <button type="button" key={un.id} className={phase === k ? 'on' : undefined} onClick={() => pick({ su: k, sv: null })}>{un.short || un.name}</button>)}
        </In>
      </div>
      <div className="bs-svc-grid">
        {SERVICES.map((s, i) => {
          const st = !u ? '' : u.core.includes(s.id) ? ' carried' : u.ask.includes(s.id) ? ' asked' : ' quiet'
          return (
            <In t={t} d={0.5 + i * 0.18} key={s.id} as="button" type="button" className={'bs-sv' + st + (sv && sv.id === s.id ? ' picked' : '')} onClick={() => pick({ sv: s.id })}>
              <span className="bs-sv-n">{s.n}</span>
              <span className="bs-sv-ic"><Icon name={s.icon} /></span>
              <b>{s.name}</b>
              {st === ' asked' && <small>When asked</small>}
            </In>
          )
        })}
      </div>
      <div className="bs-svc-foot" key={(sv && sv.id) || phase}>
        {sv ? <p><span className="bs-unit">{sv.short}</span>{sv.line}</p>
          : u ? <p><span className="bs-unit">{u.short || u.name}</span> {u.id === 'epc' ? 'carries all six.' : u.id === 'hookup' ? 'carries five, and maintenance when asked.' : 'runs and maintains, and designs and builds when an upgrade needs it.'}</p>
            : <p>A client can buy the whole cycle, or one service alone.{x ? ' Tap a service, or a unit above.' : ''}</p>}
      </div>
    </section>
  )
}

function Hookup({ t, sel, pick }) {
  const step = sel.ph != null ? sel.ph : Math.min(3, Math.floor(Math.max(0, t - 1.5) / 4))
  return (
    <section className="bs-hk">
      <div className="bs-hk-copy">
        <In t={t} d={0.1} className="bs-kick">Tool hook-up</In>
        <In t={t} d={0.3} as="h2" className="bs-h2">A tool connected <em>in four phases,</em> inside a live fab.</In>
        <ol className="bs-phases">
          {PHASES.map(([k, d], i) => (
            <li key={k} className={i === step ? 'on' : i < step ? 'done' : undefined}>
              <button type="button" onClick={() => pick({ ph: i })}><span className="bs-ph-n">{i + 1}</span><span className="bs-ph-t"><b>{k}</b><span>{d}</span></span></button>
            </li>
          ))}
        </ol>
      </div>
      <div className="bs-hk-vis"><video src="/assets/cycle3d/hookup-loop.mp4" autoPlay muted loop playsInline /></div>
    </section>
  )
}

function Europe({ t, sel, pick, setBook }) {
  const o = sel.o != null ? OFFICES[sel.o] : OFFICES.find(x => x.k === 'Germany')
  return (
    <section className="bs-eu">
      <In t={t} d={0.1} as="h2" className="bs-h2">From Shah Alam <em>to Dresden.</em></In>
      <In t={t} d={0.4} className="bs-eu-map">
        <svg viewBox="0 0 1180 490" aria-hidden="true"><DotMap x={10} y={10} w={1160} showLabels={false} marker={1.5} /></svg>
        {/* the names sit under the map at booth size: on the map itself they would be 14 px from four metres */}
        <ul className="bs-offices">{OFFICES.map((of, i) => <li key={of.k} className={(of.eu ? 'eu' : '') + (of === o ? ' on' : '')}><button type="button" onClick={() => pick({ o: i })}><i />{of.k}{of.s && of.k !== 'India' ? <small>{of.s.replace('HQ, ', '')}</small> : null}</button></li>)}</ul>
      </In>
      <In t={t} d={1.2} className="bs-eu-side">
        <div className="bs-eu-de" key={o.k}>
          {o.k === 'Germany' ? <>
            <span className="bs-kick">In Germany</span>
            <b>IAQ Engineering (DE) GmbH</b>
            <span>8. OG, Budapester Straße 5, 01069 Dresden</span>
            <span>+49 351 4387 9529</span>
          </> : o.hq ? <>
            <span className="bs-kick">Headquarters</span>
            <b>IAQ Group, Shah Alam</b>
            <span>Malaysia, since 1995</span>
            <span>+603 5124 8319</span>
          </> : <>
            <span className="bs-kick">IAQ office</span>
            <b>{o.k}{o.s ? ', ' + o.s : ''}</b>
            <span>One of seven countries with an IAQ office.</span>
          </>}
        </div>
        <button type="button" className="bs-eu-qr" onClick={() => setBook(true)}>
          <svg viewBox="-3 -3 36 36" aria-hidden="true"><Qr x={0} y={0} s={30} fill={C.ink} /></svg>
          <span><b>Scan for the 3D story and the projects</b><span>{QR_URL}</span><span>business@iaqtechnology.com.my</span></span>
        </button>
      </In>
    </section>
  )
}
