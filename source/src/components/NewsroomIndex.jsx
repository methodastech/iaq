import React, { useMemo, useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cmsNews, live } from '../lib/cms.js'
/* the CMS list, not the shipped registry: News.jsx and Article.jsx already read
   live(cmsNews), so importing the static array here made the banner facts, the
   cadence plot and the type counts disagree with the grid the moment the portal
   saved a story. */
const NEWS = live(cmsNews)
import NewsMark from './NewsMark.jsx'
import '../styles/newsroom-index.css'

/* ---------------------------------------------------------------------------
   THE NEWSROOM INDEX

   The page listed stories but never showed the SHAPE of the newsroom: how often
   the group publishes, and what it publishes about. This reads both off the
   real archive and nothing else:

     · one column per month actually covered, so gaps in publishing show as gaps
     · one mark per story, stacked in its month and coloured by type
     · a type rail with true counts, which doubles as the filter

   Every number here is counted from NEWS at render time, so it can never drift
   from the articles the page actually holds. Selecting a type dims the rest
   rather than removing it: the cadence stays readable while you isolate a line.
   --------------------------------------------------------------------------- */

const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function NewsroomIndex({ active, onPick }) {
  const [live, setLive] = useState(null)      /* the story under the cursor */
  const [shown, setShown] = useState(false)   /* draw-in once in view */
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(true); return }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { setShown(true); io.disconnect() } }), { rootMargin: '0px 0px -15% 0px' })
    io.observe(el)
    /* a page that never scrolls this into view must still resolve */
    const t = setTimeout(() => setShown(true), 2400)
    return () => { io.disconnect(); clearTimeout(t) }
  }, [])

  const { months, types, span } = useMemo(() => {
    const byMonth = new Map()
    const byType = new Map()
    NEWS.forEach(n => {
      const [y, m] = n.date.split('-')
      const key = y + '-' + m
      if (!byMonth.has(key)) byMonth.set(key, [])
      byMonth.get(key).push(n)
      byType.set(n.tag, (byType.get(n.tag) || 0) + 1)
    })
    /* fill the empty months too, or a quiet month reads as if it never existed */
    const keys = [...byMonth.keys()].sort()
    const out = []
    if (keys.length) {
      let [cy, cm] = keys[0].split('-').map(Number)
      const [ey, em] = keys[keys.length - 1].split('-').map(Number)
      while (cy < ey || (cy === ey && cm <= em)) {
        const key = cy + '-' + String(cm).padStart(2, '0')
        out.push({ key, y: cy, m: cm, items: (byMonth.get(key) || []).slice().reverse() })
        cm++; if (cm > 12) { cm = 1; cy++ }
      }
    }
    const tallest = out.reduce((a, b) => Math.max(a, b.items.length), 0)
    return {
      months: out,
      types: [...byType.entries()].sort((a, b) => b[1] - a[1]),
      span: tallest || 1,
    }
  }, [])

  return (
    <section className="nx" ref={ref} data-in={shown ? '1' : '0'} aria-labelledby="nxH">
      <div className="wrap">

        <header className="nx-head">
          <span className="eyebrow">The newsroom, indexed</span>
          <h2 id="nxH">{NEWS.length} stories, <em>{months.length} months.</em></h2>
          <p className="nx-lede">
            One mark per story, stacked in the month it was published. Pick a type to isolate its
            line, or hover a mark to read the headline.
          </p>
        </header>

        <div className="nx-body">

          {/* the type rail: real counts, and the filter */}
          <ul className="nx-types">
            {types.map(([t, n]) => (
              <li key={t}>
                <button type="button" className="nx-type" data-on={active === t ? '1' : '0'}
                        aria-pressed={active === t}
                        onClick={() => onPick && onPick(active === t ? null : t)}>
                  <NewsMark tag={t} />
                  <span className="nx-type-n">{t}</span>
                  <span className="nx-type-c">{n}</span>
                  <span className="nx-type-bar" aria-hidden="true"
                        style={{ '--w': Math.round((n / NEWS.length) * 100) + '%' }} />
                </button>
              </li>
            ))}
          </ul>

          {/* the cadence plot */}
          <div className="nx-plot" onMouseLeave={() => setLive(null)}>
            <ol className="nx-months" style={{ '--span': span }}>
              {months.map(mo => (
                <li className="nx-mo" key={mo.key} data-empty={mo.items.length ? '0' : '1'}
                    style={{ '--n': mo.items.length }}>
                  <span className="nx-mo-n">{mo.items.length || '\u2013'}</span>
                  <ul className="nx-stack">
                    {mo.items.map((n, i) => (
                      <li key={n.slug} style={{ '--i': i }}>
                        <Link className="nx-mk" to={'/news/' + n.slug}
                              data-dim={active && active !== n.tag ? '1' : '0'}
                              data-live={live && live.slug === n.slug ? '1' : '0'}
                              onMouseEnter={() => setLive(n)} onFocus={() => setLive(n)}
                              aria-label={n.tag + ': ' + n.title}>
                          <NewsMark tag={n.tag} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <span className="nx-mo-l">
                    <b>{MONTH[mo.m - 1]}</b>
                    {(mo.m === 1 || mo === months[0]) && <i>{String(mo.y).slice(2)}</i>}
                  </span>
                </li>
              ))}
            </ol>

            {/* the readout: whatever the cursor is on, or the newsroom's own summary */}
            <div className="nx-read" aria-live="polite">
              {live ? (
                <>
                  <span className="nx-read-k"><NewsMark tag={live.tag} />{live.tag}</span>
                  <span className="nx-read-t">{live.title}</span>
                </>
              ) : (
                <span className="nx-read-idle">
                  Busiest month: {(() => {
                    const top = months.reduce((a, b) => (b.items.length > a.items.length ? b : a), months[0])
                    return top ? MONTH[top.m - 1] + ' ' + top.y + ', ' + top.items.length + ' stories' : ''
                  })()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
