import React from 'react'
import { Link } from 'react-router-dom'
import { FOOTER_COLUMNS, byId } from '../data/sitemap.js'
import { SOCIAL } from '../data/social.jsx'
import '../styles/footer-b.css'

/* ============================================================================
   Footer option B (22 Sep 2026), for comparison with the current footer. Bazil sent Kresna's footer
   ("is the footer better presented like this"), then "proceed". Taken from it: two cards, the brand on
   one and the links on the other, a lot of air, and a giant faint wordmark under them. Left out: the
   rounded corners (IAQ is square), the handwriting labels, the glossy logo tile and the newsletter.
   On: ?footer=b (kept for the session). Off: ?footer=a. The current footer stays the default.
   ============================================================================ */
const EMAIL = 'business@iaqtechnology.com.my'

export default function FooterB() {
  const top = e => { e.preventDefault(); (window.__lenis ? window.__lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' })) }
  return (
    <div className="fb">
      <div className="fb-in">
        <div className="fb-brand">
          <span className="fb-mark"><img src="/assets/iaq-logo.webp" alt="IAQ" width="668" height="276" /></span>
          <div className="fb-say">
            <p className="fb-tag">Your Total Facility Solutions Provider</p>
            <p className="fb-since">Engineering and facility solutions since 1995.</p>
          </div>
          {SOCIAL.some(s => s.url) && (
            <ul className="fb-social">
              {SOCIAL.filter(s => s.url).map(s => (
                <li key={s.id}><a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{s.icon}</svg><span>{s.label}</span></a></li>
              ))}
            </ul>
          )}
        </div>
        <div className="fb-links">
          <div className="fb-cols">
            {FOOTER_COLUMNS.map(col => (
              <div key={col.title}>
                <p className="fb-h">{col.title}</p>
                {col.pages.map(id => { const p = byId(id); if (!p) return null; return <Link key={id} to={p.route}>{p.label}</Link> })}
              </div>
            ))}
            <div>
              <p className="fb-h">Get in touch</p>
              <a href={'mailto:' + EMAIL}>{EMAIL}</a>
              <a href="tel:+60351248319">+603 5124 8319</a>
              <Link className="fb-cta" to="/contact">Start a project <i aria-hidden="true">&rarr;</i></Link>
            </div>
          </div>
          <div className="fb-base">
            <span>&copy; 2026 IAQ Group &middot; IAQ Technology International Sdn. Bhd. 200001031412 (534019-T) &middot; ISO 9001 / 14001 / 45001 &middot; CIDB G7</span>
            <a href="#top" onClick={top}>Back to top <i aria-hidden="true">&uarr;</i></a>
          </div>
        </div>
      </div>
      <div className="fb-word" aria-hidden="true"><img src="/assets/iaq-logo.webp" alt="" /></div>
    </div>
  )
}
