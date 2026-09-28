import React, { useMemo, useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TAGS } from '../data/news.js'
import { art } from '../data/newsArt.js'
import { cmsNews, live } from '../lib/cms.js'
const NEWS = live(cmsNews)
import '../styles/news-rail.css'

/* The newsroom rail — press-center pattern: filter pills with prev/next
   arrows on the right, over a horizontal snap carousel of cards. The lead
   card is an editorial tile: photograph on top with the topic tag notched into
   its corner, then the title and a big crimson day-of-month over month and year.
   All 20 registry items ride the rail; the pills narrow it by tag. */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const RAIL = 12

/* Artwork comes from data/newsArt.js, the ONE mapping every news surface reads,
   so a story wears the same picture here, in the newsroom and on its article
   page. This component used to carry a second set of pools keyed by list
   POSITION, which meant the same story changed picture when the rail was
   filtered. Shown at rest, not on hover (Bazil, 25 Aug: "i need to see the
   visuals at least before hovering"). */

const dayOf = iso => iso.slice(8, 10)
const monthOf = iso => MONTHS[+iso.slice(5, 7) - 1]
const yearOf = iso => iso.slice(0, 4)
/* one mono date line, "13 AUG 2025" (2 Sep): the giant crimson numeral read as a price tag */
const dateLine = iso => `${dayOf(iso)} ${monthOf(iso)} ${yearOf(iso)}`.toUpperCase()

export default function NewsRail() {
  const [tag, setTag] = useState('All')
  const [ends, setEnds] = useState({ start: true, end: false })
  const railRef = useRef(null)

  /* 15 Sep: the registry now holds every newsroom post (70), so the home rail carries the newest
     RAIL of the chosen topic, in date order; the full record is on /news */
  const shown = useMemo(() => [...(tag === 'All' ? NEWS : NEWS.filter(n => n.tag === tag))]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (a.slug < b.slug ? -1 : 1)))
    .slice(0, RAIL), [tag])
  const pills = useMemo(() => ['All', ...TAGS.filter(t => NEWS.some(n => n.tag === t))], [])

  /* arrows page by roughly two cards; disabled state tracks scroll position */
  const page = dir => {
    const el = railRef.current
    if (!el) return
    const card = el.querySelector('.nr-card')
    const step = (card ? card.offsetWidth + 14 : 380) * 2
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  useEffect(() => {
    const el = railRef.current
    if (!el) return
    const read = () => setEnds({
      start: el.scrollLeft < 8,
      end: el.scrollLeft > el.scrollWidth - el.clientWidth - 8,
    })
    read()
    el.addEventListener('scroll', read, { passive: true })
    return () => el.removeEventListener('scroll', read)
  }, [shown])

  /* a tag change can leave the rail scrolled past the new, shorter content */
  useEffect(() => { railRef.current?.scrollTo({ left: 0 }) }, [tag])

  return (
    <>
      <div className="nr-bar" data-reveal="">
        <div className="nr-pills" role="tablist" aria-label="Filter news by topic">
          {pills.map(t => (
            <button key={t} type="button" role="tab" aria-selected={tag === t}
                    className={'nr-pill' + (tag === t ? ' on' : '')}
                    onClick={() => setTag(t)}>{t}</button>
          ))}
        </div>
        <div className="nr-arrows">
          <button type="button" className="nr-arw" aria-label="Previous stories"
                  disabled={ends.start} onClick={() => page(-1)}>
            <svg viewBox="0 0 20 12" fill="none" aria-hidden="true"><path d="M20 6H2M7 1 2 6l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button type="button" className="nr-arw dark" aria-label="Next stories"
                  disabled={ends.end} onClick={() => page(1)}>
            <svg viewBox="0 0 20 12" fill="none" aria-hidden="true"><path d="M0 6h18M13 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      {/* 2 Sep rebuild (Bazil: "a better, premium way"): the newest story LEADS at double width
          with its own kicker, then the rest run as editorial tiles. The date is one mono line
          beside the topic, the title carries the card, and a red rule draws under it on hover
          with the read cue. The rail fades at its right edge so the cut-off tile reads as a
          scroll invitation rather than a mistake. */}
      <div className="nr-rail" ref={railRef} data-reveal="">
        {shown.map((n, i) => (
          <Link className={'nr-card' + (i === 0 ? ' lead' : '')} to={`/news/${n.slug}`} key={n.slug}>
            <span className="nr-shot">
              <img className="nr-img" src={art(n, NEWS)} alt="" loading="lazy" decoding="async" />
              {i === 0 && <span className="nr-lead-k">Latest</span>}
            </span>
            <span className="nr-body">
              <span className="nr-meta"><span className="nr-tag">{n.tag}</span><span className="nr-when">{dateLine(n.date)}</span></span>
              <span className="nr-title">{n.title}</span>
              <span className="nr-go"><span>Read the story</span> <i aria-hidden="true">&rarr;</i></span>
            </span>
          </Link>
        ))}
      </div>
    </>
  )
}
