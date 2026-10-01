import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FAQ } from '../data/codex.js'
import Icon from './FlowIcon.jsx'
import '../styles/faq.css'

/* Faq · 24 Sep (Bazil: "create a proper FAQ section here, premium, structured"). Five groups by what the client
   is deciding; a sticky index on the left that follows the reading and jumps on click; each answer opens with
   its height animated; a link to the page that says more where there is one. Data: codex.js FAQ. */
export default function Faq({ embed = false }) {
  const root = useRef(null)
  /* 30 Sep ("close all drop down on faq"): every group and every answer starts closed; a click on a group, or on
     the index beside it, opens it */
  const [open, setOpen] = useState(null)
  const [cur, setCur] = useState(FAQ[0].id)
  /* 24 Sep (Bazil: "make a dropdown as well"): each group folds; the index opens the one it names */
  const [openG, setOpenG] = useState(() => new Set())
  const toggleG = id => setOpenG(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const [inView, setIn] = useState(false)
  /* 25 Sep (Bazil: "for SEO purposes"): every question and answer as FAQPage structured data, on the site only (the
     Codex embed is behind the member login and writes none) */
  useEffect(() => {
    if (embed) return
    const ld = document.createElement('script'); ld.type = 'application/ld+json'; ld.id = 'faq-ld'
    ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.flatMap(g => g.items).map(it => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: typeof it.a === 'string' ? it.a : String(it.a) } })) })
    const old = document.getElementById('faq-ld'); if (old) old.remove()
    document.head.appendChild(ld)
    return () => ld.remove()
  }, [embed])

  useEffect(() => {
    const el = root.current; if (!el) return
    if (!('IntersectionObserver' in window)) { setIn(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIn(true); io.disconnect() } }, { threshold: 0.12 })
    io.observe(el); return () => io.disconnect()
  }, [])
  /* the index follows the group under the reader's eye */
  useEffect(() => {
    const el = root.current; if (!el || !('IntersectionObserver' in window)) return
    const groups = [...el.querySelectorAll('.faq-g')]
    const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) setCur(e.target.dataset.g) }) }, { rootMargin: '-35% 0px -55% 0px' })
    groups.forEach(g => io.observe(g)); return () => io.disconnect()
  }, [])
  const jump = id => { setOpenG(s => new Set([...s, id])); const g = root.current?.querySelector(`.faq-g[data-g="${id}"]`); if (g) { setCur(id); requestAnimationFrame(() => g.scrollIntoView({ behavior: 'smooth', block: 'start' })) } }

  return (
    <div ref={root} className={'faq' + (inView ? ' in' : '') + (embed ? ' faq-embed' : '')}>
      <aside className="faq-ix" aria-label="Question groups">
        <ul>
          {FAQ.map((g, i) => (
            <li key={g.id}><button type="button" className={'faq-ix-b' + (cur === g.id ? ' on' : '')} onClick={() => jump(g.id)} aria-current={cur === g.id ? 'true' : undefined} style={{ '--i': i }}>
              <span className="faq-ic"><Icon name={g.icon} /></span><b>{g.name}</b><small>{g.lead}</small><i>{g.items.length}</i>
            </button></li>
          ))}
        </ul>
        {!embed && <p className="faq-ix-cta"><span>Another question?</span><Link to="/contact">Ask us <i aria-hidden="true">&rarr;</i></Link></p>}
      </aside>

      <div className="faq-list">
        {FAQ.map((g, gi) => (
          <section key={g.id} className={'faq-g' + (openG.has(g.id) ? ' is-open' : '')} data-g={g.id} aria-labelledby={'faq-' + g.id}>
            <h3 id={'faq-' + g.id}>
              <button type="button" className="faq-gb" aria-expanded={openG.has(g.id)} onClick={() => toggleG(g.id)}>
                <span className="faq-ic"><Icon name={g.icon} /></span>
                <span className="faq-gt"><b>{g.name}</b><small>{g.lead}</small></span>
                <span className="faq-gn">{g.items.length}</span><i aria-hidden="true" />
              </button>
            </h3>
            <div className="faq-gl"><ul>
              {g.items.map((it, i) => {
                const isOpen = open === it.q
                return (
                  <li key={it.q} className={'faq-i' + (isOpen ? ' open' : '')} style={{ '--i': i }}>
                    <button type="button" className="faq-q" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : it.q)}>
                      <span>{it.q}</span><i aria-hidden="true" />
                    </button>
                    <div className="faq-a" aria-hidden={!isOpen}><div>
                      <p>{it.a}</p>
                      {it.link && <Link className="faq-more" to={it.link[1]} tabIndex={isOpen ? 0 : -1}>{it.link[0]} <i aria-hidden="true">&rarr;</i></Link>}
                    </div></div>
                  </li>
                )
              })}
            </ul></div>
          </section>
        ))}
      </div>
    </div>
  )
}
