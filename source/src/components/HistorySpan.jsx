import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
/* 1 Oct: the milestones as the portal last saved them (Edit website, History), the shipped data/history.js when nothing
   has been edited */
import { live, cmsHistory } from '../lib/cms.js'
import '../styles/history-span.css'
import '../styles/history-media.css'
const SPAN = live(cmsHistory)

/* ------------------------------------------------------------------------
   THE SPAN: the history of IAQ, drawn to scale.

   The page's own claim is "thirty one years, compounded", and this is that
   claim made visible instead of asserted. Two rules carry it:

     1. The distance between two milestones is PROPORTIONAL to the years
        between them. Five years pass between 1995 and 2000 and the page makes
        you travel it; two years pass between 2020 and 2022 and it is over
        almost at once. The acceleration is the story, and a list with even
        spacing hides it.

     2. Every intervening year is COUNTABLE. The connector between two
        milestones carries exactly one tick per year that passed, so the gap
        is not a vague stretch of whitespace but a measured span the reader
        can count. That is done with a repeating gradient sized as a fraction
        of the connector, so the tick COUNT stays true at any height.

   This replaces both of the timelines the page used to carry: a six-scene
   scroller and a flat ten-item list telling the same story underneath it.
   One record, told once, with the specification metadata the list never had.

   15 Sep, at the client's request:

     FIGURES. Every entry carries a photograph, a short muted clip, or for the
     undated credentials the badge row itself (data/history.js records what
     each file actually shows). Clips carry no src until the entry is near
     the viewport, play muted and looped inline, pause when they leave, and
     never start under reduced motion. The poster is a real image under the
     clip, so the figure is never blank before playback or under reduced
     motion.

     ACHIEVEMENTS. Awards, recognitions, safety records and certifications sit
     on the same rail as a distinct entry type: a smaller filled red square
     instead of the milestone mark and an "Achievement" kind tag by the year.
     They carry IAQ's own newsroom photographs. Two entries can share a year;
     they are then held apart by the minimum gap, with no ticks and no year
     count between them, since no year passed.

     NO LINES. The client dislikes rules and dividers, so the entry carries
     none: no hairline above the specification strip, none above the read
     head, none at the top of the section. The rail and its year ticks remain
     because they are the scale itself.
   ------------------------------------------------------------------------ */

const PX_PER_YEAR = 30          /* the scale of the drawing */
const MIN_GAP = 40              /* text still needs air when years are adjacent */

/* a clip that costs nothing until it is needed: no src until the entry is
   near the viewport, playing only while in view, poster always present */
function HxClip({ src, poster, alt, pos }) {
  const ref = useRef(null)
  const inView = useRef(false)
  const [near, setNear] = useState(false)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return
    v.muted = true
    const io = new IntersectionObserver(([e]) => {
      inView.current = e.isIntersecting
      if (e.isIntersecting) {
        setNear(true)
        if (v.readyState >= 2 && v.paused) v.play().catch(() => {})
      } else if (!v.paused) {
        v.pause()
      }
    }, { rootMargin: '160px 0px 160px 0px', threshold: 0 })
    io.observe(v)
    return () => io.disconnect()
  }, [])

  const ready = e => {
    const v = e.currentTarget
    if (inView.current && v.paused) v.play().catch(() => {})
  }

  return (
    <video ref={ref} muted loop playsInline preload={near ? 'auto' : 'none'}
           poster={poster} src={near ? src : undefined} aria-label={alt}
           data-on={on ? '1' : '0'}
           onLoadedData={ready} onCanPlay={ready}
           onPlaying={() => setOn(true)}
           style={pos ? { objectPosition: pos } : undefined} />
  )
}

function HxFigure({ fig }) {
  if (!fig) return null
  const style = {}
  if (fig.ar) style['--ar'] = fig.ar
  if (fig.pos) style['--pos'] = fig.pos
  /* 29 Sep ("image placeholder first"): a picture still to come holds its place, named */
  if (fig.ph) return (
    <figure className="hx-fig hx-fig-ph">
      <div className="hx-fig-box" style={style}><span className="hx-ph">{fig.cap}</span></div>
      <figcaption className="hx-cap"><b>{fig.kind}</b>{fig.cap}</figcaption>
    </figure>
  )
  return (
    <figure className="hx-fig" data-rep={fig.rep ? '1' : '0'}>
      <div className="hx-fig-box" style={style}>
        {fig.clip
          ? <>
              {/* the poster as a real image under the clip: it is what shows before
                  playback and under reduced motion, and the clip fades up over it */}
              <img className="hx-poster" src={fig.poster} alt="" aria-hidden="true" loading="lazy" decoding="async" />
              <HxClip src={fig.clip} poster={fig.poster} alt={fig.alt} pos={fig.pos} />
            </>
          : <img src={fig.img} alt={fig.alt} loading="lazy" decoding="async" />}
      </div>
      <figcaption className="hx-cap"><b>{fig.kind}</b>{fig.cap}</figcaption>
    </figure>
  )
}

export default function HistorySpan() {
  const [live, setLive] = useState(0)
  const rootRef = useRef(null)
  const itemRefs = useRef([])

  /* the read head names the era you are actually looking at */
  useEffect(() => {
    const els = itemRefs.current.filter(Boolean)
    if (!els.length) return
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(el => el.dataset.in = '1')
      return
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.dataset.in = '1'
          const i = +e.target.dataset.i
          /* the entry in the middle band, in either direction: it used to keep the
             furthest index reached, so scrolling back up left "Today" beside 1995 */
          if (!Number.isNaN(i)) setLive(i)
        }
      })
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 })

    /* a second, looser observer purely for the reveal, so entries appear well before
       they reach the read-head band in the middle of the screen */
    const io2 = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.dataset.in = '1'; io2.unobserve(e.target) } })
    }, { rootMargin: '0px 0px -12% 0px' })

    els.forEach(el => { io.observe(el); io2.observe(el) })
    return () => { io.disconnect(); io2.disconnect() }
  }, [])

  const span = SPAN[SPAN.length - 1].yr - SPAN[0].yr

  return (
    <section className="hx" id="record" ref={rootRef} aria-labelledby="hxH">
      <div className="wrap">

        {/* 25 Sep (Bazil, on "Every milestone, to scale" and its lede: "no need this please remove"): the timeline starts
            straight away; the heading is kept for assistive tech only */}
        <h2 id="hxH" className="sr-only">Milestones</h2>

        <div className="hx-body">

          {/* the read head: the era currently under the eye */}
          {/* 25 Sep (Bazil: "make this view more dynamic"): the year and the title slide in whenever the era under the eye
              changes (keyed on live), a red bar reads how far through the record you are, the spine turns red behind
              you, the live mark rings, and each figure eases in from a slow zoom (history-span.css, appended) */}
          <aside className="hx-read" aria-hidden="true">
            <span className="hx-read-k">Reading</span>
            <span className="hx-read-y" key={'y' + live}>{SPAN[live].label}</span>
            <span className="hx-read-t" key={'t' + live}>{SPAN[live].title}</span>
            <span className="hx-read-bar"><i style={{ width: (100 * live / Math.max(1, SPAN.length - 1)) + '%' }} /></span>
            <span className="hx-read-n">{live + 1} of {SPAN.length}</span>
          </aside>

          <ol className="hx-list">
            {SPAN.map((m, i) => {
              const next = SPAN[i + 1]
              /* years to the next entry; zero when two entries share a year */
              const gy = next ? next.yr - m.yr : 0
              /* the drawn gap: proportional, but never less than the minimum, and
                 present even between same-year entries so they never collide */
              const gap = next ? `max(${MIN_GAP}px, ${gy * PX_PER_YEAR}px)` : '0px'
              const ach = m.kind === 'achievement'
              return (
                <li key={`${m.label}-${m.title}`} className="hx-item"
                    data-k={m.key ? '1' : '0'} data-kind={ach ? 'achievement' : 'milestone'}
                    data-i={i} data-in="0" data-live={i === live ? '1' : '0'} data-past={i < live ? '1' : '0'} ref={el => { itemRefs.current[i] = el }}
                    style={{ '--gy': gy, '--gap': gap }}>
                  <span className="hx-mark" aria-hidden="true" />
                  <div className="hx-txt">
                    <span className="hx-yr">
                      {m.label}
                      {ach && <i className="hx-kind">Achievement</i>}
                    </span>
                    <h3 className="hx-ttl">{m.title}</h3>
                    <p className="hx-body-t">{m.text}</p>
                    {/* 29 Sep: IAQ's milestone document gives each year its technical highlights */}
                    {m.tech && <p className="hx-tech"><b>Technical highlights:</b> {m.tech}</p>}
                    <HxFigure fig={m.fig} />
                    {/* 17 Sep (client: "interlink our project reference in each year"): where the
                        registry holds the project this milestone is about, the year links to it.
                        Only the four the registry actually holds carry one, so a link never
                        promises a page that does not hold the project it names. */}
                    {m.proj && (
                      <Link className="hx-proj" to={m.proj.to}>
                        {m.proj.label}<i aria-hidden="true">&#8594;</i>
                      </Link>
                    )}
                    {m.badges && (
                      /* with a photograph the badges trail it small; without one the
                         badge row IS the figure and takes the figure's scale */
                      <ul className="hx-badges" data-solo={m.fig ? '0' : '1'}>
                        {m.badges.map(b => (
                          <li key={b.src}><img src={b.src} alt={b.alt} loading="lazy" decoding="async" /></li>
                        ))}
                      </ul>
                    )}
                    {m.meta && (
                      <dl className="hx-meta">
                        {m.meta.map(x => (
                          <div key={x.k}>
                            <dt>{x.k}</dt>
                            <dd>{x.v}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                  {/* the measured gap: one tick per year that passed. Nothing is drawn
                      between two entries that share a year, because no year passed. */}
                  {gy > 0 && (
                    <span className="hx-gap" aria-hidden="true">
                      <span className="hx-ticks" />
                      <span className="hx-gap-n">{gy} {gy === 1 ? 'year' : 'years'}</span>
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
