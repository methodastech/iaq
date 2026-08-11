import React from 'react'
import { Link } from 'react-router-dom'
import { byId } from '../data/sitemap.js'
import Icon from './FlowIcon.jsx'

/* ============================================================================
   Related: the "where this goes next" strip that closes every phase 2 page.

   props
     from   string   a page id from src/data/sitemap.js
     title  string   optional heading override

   It reads that page's `linksOut` straight from the sitemap and renders each
   target as an icon link carrying the target's own label and the first line of
   its purpose. Because the data is the source, interlinking rule 05 (nothing
   orphaned) holds automatically: change the sitemap and this strip follows.

   Dynamic pages (/projects/:id, /news/:slug) are skipped: their routes are
   patterns, not destinations.
   ============================================================================ */

function oneLiner(text) {
  if (!text) return ''
  const m = String(text).match(/^[^.]+\./)
  return m ? m[0] : String(text)
}

export default function Related({ from, title = 'Where this goes next' }) {
  const page = byId(from)
  if (!page) return null

  const targets = (page.linksOut || [])
    .map(byId)
    .filter(p => p && !p.dynamic && p.id !== from)

  if (targets.length === 0) return null

  return (
    <nav className="pg-rel" aria-label={title}>
      <div className="pg-in">
        <span className="pg-k">{title}</span>
        <ul className="pg-rel-grid">
          {targets.map(t => (
            <li key={t.id}>
              <Link className="pg-rel-a" to={t.route}>
                <span className="pg-rel-ic"><Icon name={t.icon} /></span>
                <span className="pg-rel-tx">
                  <b>{t.label}</b>
                  <small>{oneLiner(t.purpose)}</small>
                </span>
                <span className="pg-rel-go" aria-hidden="true"><Icon name="arrow" /></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
