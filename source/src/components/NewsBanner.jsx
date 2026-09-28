import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { cmsNews, live } from '../lib/cms.js'
/* the CMS list, not the shipped registry: News.jsx and Article.jsx already read
   live(cmsNews), so importing the static array here made the banner facts, the
   cadence plot and the type counts disagree with the grid the moment the portal
   saved a story. */
const NEWS = live(cmsNews)
import NewsMark from './NewsMark.jsx'
import '../styles/news-banner.css'

/* ---------------------------------------------------------------------------
   THE NEWSROOM BANNER · the wire

   First pass was a field of faint marks with the type in the left half and
   nothing in the right: correct, and dead. A newsroom's banner should carry the
   newsroom, so the right half is now a live wire running the five most recent
   stories, one at a time, with its type mark, date and headline.

   It advances on its own, shows how long is left on the current item, pauses
   the moment a pointer or keyboard focus lands on it, and every entry is a real
   link to that article. Nothing here is decorative: the wire is the fastest
   route into the newest thing IAQ published.
   --------------------------------------------------------------------------- */

const DWELL = 4200
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
const fullDate = d => { const [y, m, dd] = d.split('-'); return +dd + ' ' + MONTHS[+m - 1] + ' ' + y }
const shortDate = d => { const [y, m, dd] = d.split('-'); return +dd + ' ' + MONTHS[+m - 1].slice(0, 3) + ' ' + y }

/* 14 Sep (Bazil: "featured scrolling at top"): /news now opens on a featured carousel of the
   same newest stories, so running the wire here as well put two rotators of one list back to
   back. `compact` drops the wire and sets the facts beside the title in one short band; the
   carousel directly under it is the newsroom's moving part. Default stays the full banner. */
export default function NewsBanner({ compact = false }) {
  const wire = useMemo(() => [...NEWS].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5), [])
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [still, setStill] = useState(false)   /* reduced motion: no auto-advance */
  const tick = useRef(null)

  useEffect(() => {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { setStill(true); return }
  }, [])

  useEffect(() => {
    if (compact || paused || still) return
    tick.current = setTimeout(() => setI(v => (v + 1) % wire.length), DWELL)
    return () => clearTimeout(tick.current)
  }, [i, paused, still, compact, wire.length])

  const facts = useMemo(() => {
    const dates = NEWS.map(n => n.date).sort()
    const months = new Set(NEWS.map(n => n.date.slice(0, 7)))
    const [ly, lm] = dates[dates.length - 1].split('-')
    return [
      { k: String(NEWS.length), v: 'Published stories' },
      { k: String(new Set(NEWS.map(n => n.tag)).size), v: 'Topics covered' },
      { k: String(months.size), v: 'Months publishing' },
      { k: MONTHS[+lm - 1].slice(0, 3) + ' ' + ly, v: 'Most recent' },
    ]
  }, [])

  const cur = wire[i]

  return (
    <header className={'nb' + (compact ? ' nf-intro' : '')}>
      <div className="nb-field" aria-hidden="true">
        <span className="nb-gl nb-gl-a"><NewsMark tag="Company" /></span>
        <span className="nb-gl nb-gl-b"><NewsMark tag="EHS" /></span>
        <span className="nb-gl nb-gl-c"><NewsMark tag="Industry" /></span>
      </div>
      <div className="nb-scrim" aria-hidden="true" />

      <div className="nb-in wrap">
        <div className="nb-say">
          <span className="eyebrow">News and insights</span>
          {/* 22 Sep (Bazil, on the full stop after the name: "no dots very messy"): "IAQ." read like a
              stray mark after the wordmark, so this headline closes without one. */}
          <h1>News <em>from the group.</em></h1>
          <p className="nb-lede">
            Project milestones, industry insight and company updates from across the group.
          </p>
          {!compact && (
            <dl className="nb-facts">
              {facts.map(f => (
                <div key={f.v}><dt>{f.k}</dt><dd>{f.v}</dd></div>
              ))}
            </dl>
          )}
        </div>

        {compact && (
          <dl className="nb-facts">
            {facts.map(f => (
              <div key={f.v}><dt>{f.k}</dt><dd>{f.v}</dd></div>
            ))}
          </dl>
        )}

        {/* the wire */}
        {!compact && <div className="nb-wire" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="nb-wire-k">
            <span className="nb-live" aria-hidden="true" data-on={paused || still ? '0' : '1'} />
            Latest from the newsroom
          </div>

          <Link className="nb-wire-item" to={'/news/' + cur.slug} key={cur.slug}
                onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
            <span className="nb-wire-m">
              <NewsMark tag={cur.tag} />
              <span>{cur.tag}</span>
              <time dateTime={cur.date}>{fullDate(cur.date)}</time>
            </span>
            <span className="nb-wire-t">{cur.title}</span>
            <span className="nb-wire-go">Read the story <i aria-hidden="true">&rarr;</i></span>
          </Link>

          {/* the rail: position in the wire, and how long the current item has left */}
          <ol className="nb-rail">
            {wire.map((n, k) => (
              <li key={n.slug}>
                <button type="button" className="nb-rail-b" data-on={k === i ? '1' : '0'}
                        data-done={k < i ? '1' : '0'}
                        aria-label={'Story ' + (k + 1) + ': ' + n.title}
                        aria-current={k === i}
                        onClick={() => setI(k)}>
                  <span className="nb-rail-fill"
                        style={{ animationDuration: DWELL + 'ms',
                                 animationPlayState: paused || still ? 'paused' : 'running' }} />
                </button>
              </li>
            ))}
          </ol>

          <ul className="nb-wire-next" aria-hidden="true">
            {wire.map((n, k) => k === i ? null : (
              <li key={n.slug}><NewsMark tag={n.tag} /><span>{shortDate(n.date)}</span></li>
            )).filter(Boolean).slice(0, 3)}
          </ul>
        </div>}
      </div>
    </header>
  )
}
