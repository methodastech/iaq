import React from 'react'
import { LAUNCH } from '../lib/launch.js'
import { Link } from 'react-router-dom'
import { FOOTER_COLUMNS, byId } from '../data/sitemap.js'
import { SOCIAL } from '../data/social.jsx'
import Flogo3D from './Flogo3D.jsx'

/* The brand line and the two sitemap columns, lifted out of <Footer> so the closing
   sections can place them INSIDE their own grid (28 Aug, client: the nav sits at the top
   of the left column, level with the contact block, not stranded below it).

   Pages that do this render <Footer nav={false} /> so the block is never duplicated.
   Both routes read the same FOOTER_COLUMNS, so a new page is still never orphaned. */
/* 22 Sep (Bazil: "iaq logo needs to be at top"): the closing band shows the brand block at its head, so it
   passes brand={false} here and the block is never shown twice */
export function FooterBrand() {
  return (
    <div className="f-brand">
      <Flogo3D className="f-mark" />
      <div className="wm"><span>Total Facility Solutions</span></div>
      <p>Engineering and facility solutions since 1995.</p>
    </div>
  )
}

export default function FooterNav ({ className = '', wide = false, brand = true, social = true }) {
  return (
    <div className={'f-nav ' + (wide ? 'f-nav-wide ' : '') + className}>
      {/* the mark leads the block; the mono line drops its "IAQ ·" prefix because the
          wordmark already says it, and keeps the descriptor that earns its place */}
      {brand && <FooterBrand />}
      <div className="f-cols">
        {FOOTER_COLUMNS.map(col => (
          <div key={col.title}>
            <h2 className="f-h4">{col.title}</h2>
            {col.pages.map(id => { const p = byId(id); if (!p) return null
              return <Link key={id} to={p.route}>{p.label}</Link> })}
          </div>
        ))}
      </div>
      {/* Social sits under the sitemap, in the space the columns leave. Only accounts with a
          confirmed URL render, so nothing here can ship as a dead link. */}
      {/* 2 Sep (Bazil: "improve to a premium design"): the standalone footer was a thin stack on
          the left with two-thirds of the width empty. In `wide` mode (only <Footer> passes it,
          so the closing sections keep their own composition) a fourth column carries the
          conversation starters, and the Follow chips sit under it. No contact data is invented
          here: the block links to the pages that hold it. */}
      {wide && (
        <div className="f-reach">
          <h2 className="f-h4">Start a conversation</h2>
          <Link className="f-reach-cta" to="/contact">Start a project</Link>
          <Link to="/careers">Join the team</Link>
          {!LAUNCH && <Link to="/portal">Staff login</Link>}
        </div>
      )}
      {social && <FooterSocial />}
    </div>
  )
}

/* the Follow block, on its own so the closing band can sit it under the brand instead of leaving a hole in the
   left column (23 Sep, Bazil: "weird empty space") */
export function FooterSocial () {
  if (!SOCIAL.some(s => s.url)) return null
  return (
        <div className="f-social">
          <h2 className="f-h4">Follow</h2>
          <ul>
            {SOCIAL.filter(s => s.url).map(s => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{s.icon}</svg>
                  <span>{s.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
  )
}
