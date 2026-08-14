import React, { useMemo, useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { NEWS, TAGS } from '../data/news.js'
import '../styles/news-rail.css'

/* The newsroom rail — press-center pattern: filter pills with prev/next
   arrows on the right, over a horizontal snap carousel of cards. The lead
   card carries a photograph with the title overlaid; every other card is a
   quiet panel with the title up top and a big crimson day-of-month at the
   bottom, month and year small beside it. All 20 registry items ride the
   rail; the pills narrow it by tag. */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/* PLACEHOLDERS: the registry carries no article photography, so each card
   borrows a house photo by topic, revealed on hover. Swap for real article
   images when the bodies are migrated. */
const PLACEHOLDER = {
  CSR: '/assets/photo-opening.webp',
  EHS: '/assets/ph-crane.webp',
  Quality: '/assets/photo-cleanroom.webp',
  Company: '/assets/photo-awards.webp',
  Industry: '/assets/ph-blueprint.webp',
}
const imgFor = n => PLACEHOLDER[n.tag] || '/assets/photo-cleanroom.webp'

const dayOf = iso => iso.slice(8, 10)
const monthOf = iso => MONTHS[+iso.slice(5, 7) - 1]
const yearOf = iso => iso.slice(0, 4)

export default function NewsRail() {
  const [tag, setTag] = useState('All')
  const [ends, setEnds] = useState({ start: true, end: false })
  const railRef = useRef(null)

  const shown = useMemo(() => (tag === 'All' ? NEWS : NEWS.filter(n => n.tag === tag)), [tag])
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

      <div className="nr-rail" ref={railRef} data-reveal="">
        {shown.map(n => (
          <Link className="nr-card" to={`/news/${n.slug}`} key={n.slug}>
            <img className="nr-img" src={imgFor(n)} alt="" loading="lazy" decoding="async" />
            <span className="nr-scrim" aria-hidden="true" />
            <span className="nr-title">{n.title}</span>
            <span className="nr-date">
              <b>{dayOf(n.date)}</b>
              <span className="nr-my">{monthOf(n.date)}<br />{yearOf(n.date)}</span>
            </span>
          </Link>
        ))}
      </div>
    </>
  )
}
