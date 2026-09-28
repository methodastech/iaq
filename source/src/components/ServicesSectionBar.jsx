import React, { useEffect, useRef, useState } from 'react'
import '../styles/services-bar.css'

/* ============================================================================
   ServicesSectionBar · 26 Sep 2026. Bazil: "make the services page better, the content is correct but more
   interesting, easy to understand and looks good"; "go research online if needed". Long B2B pages keep the reader
   oriented with a section bar that stays in view, and leading fab contractors (Exyte) keep each service to a short
   line with the detail one step away. This is the first half: the page's seven parts in one row under the nav, each
   in its own colour, the part in view lit, a click scrolls there. It reads the sections the page already has, so no
   section had to change to be listed. It steps out of the way above the banner's foot and after the FAQ.
   ============================================================================ */
const PARTS = [
  { k: 'units', n: '3', label: 'business units', sel: '.sm-units', id: 'business-units', c: '#0B8FD8' },
  { k: 'services', n: '6', label: 'services', sel: '#services-cycle', c: '#EC2027' },
  { k: 'works', n: '4', label: 'works', sel: '.sm-works', id: 'works', c: '#231F20' },
  { k: 'hookup', n: '', label: 'Tools hookup', sel: '#tools-hookup', c: '#EC2027' },
  { k: 'who', n: '', label: 'Who does what', sel: '.sysm', id: 'who-does-what', c: '#1C4F9C' },
  { k: 'quote', n: '', label: 'Your quote', sel: '.sm-qs', id: 'your-quote', c: '#0C1220' },
  { k: 'faq', n: '', label: 'Questions', sel: '.sm-faq', id: 'questions', c: '#0C1220' },
]

export default function ServicesSectionBar () {
  const [on, setOn] = useState(null)
  const [shown, setShown] = useState(false)
  const bar = useRef(null)
  /* 26 Sep (site crawl: five links were bare "#"): every part gets a real anchor, so each link is a deep link too */
  useEffect(() => { PARTS.forEach(p => { const el = p.id && document.querySelector(p.sel); if (el && !el.id) el.id = p.id }) }, [])
  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const els = PARTS.map(p => document.querySelector(p.sel))
      const line = innerHeight * .32
      let cur = null
      els.forEach((el, i) => { if (el && el.getBoundingClientRect().top < line) cur = PARTS[i].k })
      const first = els.find(Boolean), last = els[els.length - 1]
      const past = last && last.getBoundingClientRect().bottom < line
      setShown(!!first && first.getBoundingClientRect().top < innerHeight * .9 && !past)
      setOn(past ? null : cur)
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(read) }
    read()
    addEventListener('scroll', kick, { passive: true }); addEventListener('resize', kick)
    return () => { removeEventListener('scroll', kick); removeEventListener('resize', kick); cancelAnimationFrame(raf) }
  }, [])
  /* keep the lit part in view on a narrow screen, where the row scrolls sideways */
  useEffect(() => {
    const b = bar.current; if (!b || !on) return
    const a = b.querySelector(`[data-k="${on}"]`); if (!a) return
    const br = b.getBoundingClientRect(), ar = a.getBoundingClientRect()
    if (ar.left < br.left || ar.right > br.right) b.scrollBy({ left: ar.left - br.left - 24, behavior: 'smooth' })
  }, [on])
  const go = p => e => { e.preventDefault(); const el = document.querySelector(p.sel); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  return (
    <nav className={'ssb' + (shown ? ' is-shown' : '')} aria-label="On this page">
      <div className="ssb-in" ref={bar}>
        {PARTS.map(p => (
          <a key={p.k} href={p.sel.startsWith('#') ? p.sel : '#' + p.id} data-k={p.k} onClick={go(p)} className={'ssb-a' + (on === p.k ? ' on' : '')} style={{ '--c': p.c }} aria-current={on === p.k ? 'true' : undefined}>
            {p.n && <b>{p.n}</b>}<span>{p.label}</span>
          </a>
        ))}
      </div>
    </nav>
  )
}
