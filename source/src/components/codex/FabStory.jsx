import React, { useEffect, useRef, useState } from 'react'
import Icon from '../FlowIcon.jsx'
import { ABBR } from '../../lib/abbr.js'

/* ============================================================================
   FabStory · section 1 of the Codex, for everyone (18 Sep 2026).

   Bazil: "for the normal people to understand ... super easy to understand and imagine and know its
   relationship". IAQ's own Revit model (public/assets/iaq/model-seq, 61 frames of the fab assembling)
   plays or scrubs through five plain moments, and the panel says in everyday words what is happening and
   which IAQ business unit does it. The play control is the one the 17 Sep review asked the 3D model for.
   Colours follow the Codex grammar: a business unit red, work black, a service azure.
   ============================================================================ */

export { FRAMES } from '../../data/fabFrames.js'
import { FRAMES } from '../../data/fabFrames.js'
export const STORY = [
  { from: 0, to: 7, icon: 'building', k: 'The ground and the frame', t: 'Piles go into the ground. The structure, the floors and the roof go up.',
    unit: 'EPC', does: 'builds the facility', work: ['CSA'], svc: ['Engineering design', 'Procurement', 'Construction'] },
  { from: 8, to: 21, icon: 'airflow', k: 'Air, water and power', t: 'Ducts, pipes and cables run through every level, so the building can breathe, cool and be powered.',
    unit: 'EPC', does: 'builds the facility', work: ['MEP'], svc: ['Construction'] },
  { from: 22, to: 26, icon: 'filter', k: 'The clean room', t: 'Sealed walls, a ceiling of air filters and a raised floor keep the air far cleaner than the air outside.',
    unit: 'EPC', does: 'builds the facility', work: ['CSA', 'MEP'], svc: ['Construction', 'Testing and commissioning'] },
  { from: 27, to: 44, icon: 'link', k: 'The machines arrive', t: 'The production machines are moved in. Each one is connected to its gases, chemicals, pure water and power, then tested.',
    unit: 'PCU & TTI', does: 'connects the machines', work: ['Process utilities', 'MEP'], svc: ['Tools hookup', 'Testing and commissioning'] },
  { from: 45, to: 60, icon: 'power', k: 'Running for years', t: 'The fab runs day and night. It is maintained, and its energy bill is brought down with no money paid upfront.',
    unit: 'EFM', does: 'runs it and cuts the energy bill', work: ['MEP'], svc: ['Maintenance'] },
]
const stageOf = f => STORY.findIndex(s => f >= s.from && f <= s.to)

export default function FabStory() {
  const root = useRef(null)
  const [f, setF] = useState(60)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const touched = useRef(false)
  const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /* load the frames once the story is near the screen, then play it once, unless the reader got there first */
  useEffect(() => {
    const el = root.current
    if (!el) return
    let done = false
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done) return
      done = true
      io.disconnect()
      let n = 0
      FRAMES.forEach(src => { const im = new Image(); im.onload = im.onerror = () => { if (++n === FRAMES.length) setReady(true) }; im.src = src })
    }, { rootMargin: '300px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!ready || reduce || touched.current) return
    setF(0); setPlaying(true)
  }, [ready])

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => {
      setF(x => {
        if (x >= 60) { setPlaying(false); return 60 }
        return x + 1
      })
    }, 130)
    return () => clearInterval(t)
  }, [playing])

  const st = STORY[Math.max(0, stageOf(f))]
  const si = Math.max(0, stageOf(f))
  const user = fn => (...a) => { touched.current = true; fn(...a) }
  const toggle = user(() => { if (f >= 60) setF(0); setPlaying(p => !p) })
  const jump = user(i => { setPlaying(false); setF(STORY[i].from + Math.round((STORY[i].to - STORY[i].from) * .6)) })
  const scrub = user(e => { setPlaying(false); setF(parseInt(e.target.value, 10)) })

  return (
    <div className="fs" ref={root}>
      <div className="fs-stage">
        <div className="fs-frame">
          <span className="fs-halo" aria-hidden="true" />
          <img src={FRAMES[f]} alt={`IAQ’s Revit model of a fab, at the moment: ${st.k}`} />
          <span className="fs-now" aria-hidden="true"><i>{si + 1}</i>{st.k}</span>
        </div>
        <div className="fs-ctrl">
          <button type="button" className="fs-play" onClick={toggle} aria-label={playing ? 'Pause' : (f >= 60 ? 'Play again' : 'Play')}>
            {playing ? <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
              : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z" /></svg>}
            <span>{playing ? 'Pause' : (f >= 60 ? 'Play again' : 'Play')}</span>
          </button>
          <div className="fs-track">
            <div className="fs-bands" aria-hidden="true">
              {STORY.map((s, i) => <i key={s.k} className={'u-' + s.unit.replace(/[^A-Z]/g, '').toLowerCase() + (i === si ? ' on' : '')} style={{ flexGrow: s.to - s.from + 1 }} />)}
            </div>
            <input type="range" min="0" max="60" value={f} onChange={scrub} aria-label="Scrub through the build" aria-valuetext={st.k} />
          </div>
        </div>
        <ol className="fs-steps">
          {STORY.map((s, i) => (
            <li key={s.k}>
              <button type="button" className={i === si ? 'on' : undefined} aria-pressed={i === si} onClick={() => jump(i)}>
                <i>{i + 1}</i><span>{s.k}</span><em>{s.unit}</em>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <aside className="fs-panel" aria-live="polite">
        <span className="fs-step"><Icon name={st.icon} /><b>{si + 1}</b><small>of 5</small></span>
        <h3>{st.k}</h3>
        <p className="fs-t">{st.t}</p>
        <div className="fs-who">
          <span className="fs-lb">Who does it</span>
          <span className="fs-unit"><b>{st.unit}</b><small>({ABBR[st.unit]})</small><span>{st.does}</span></span>
        </div>
        <div className="fs-row">
          <span className="fs-lb">The kind of work</span>
          <span className="fs-chips w">{st.work.map(x => <i key={x}>{x}{ABBR[x] ? <small> ({ABBR[x]})</small> : null}</i>)}</span>
        </div>
        <div className="fs-row">
          <span className="fs-lb">The services in the contract</span>
          <span className="fs-chips s">{st.svc.map(x => <i key={x}>{x}</i>)}</span>
        </div>
      </aside>
      <ol className="fs-print">{STORY.map((s, i) => <li key={s.k}><b>{i + 1}. {s.k}</b> {s.t} <em>{s.unit} ({ABBR[s.unit]})</em> {s.does}. Work: {s.work.map(x => ABBR[x] ? x + ' (' + ABBR[x] + ')' : x).join(', ')}. Services: {s.svc.join(', ')}.</li>)}</ol>
    </div>
  )
}
