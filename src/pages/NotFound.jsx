import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'

/* A real 404. The catch-all used to render the homepage silently, which hides
   broken links instead of surfacing them. */

export default function NotFound () {
  useEffect(() => { document.title = 'Page not found · IAQ Group' }, [])
  return (
    <>
      <Nav />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '170px 22px 120px', textAlign: 'center' }}>
        <span style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#B5121B', fontWeight: 700 }}>404 · Not found</span>
        <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', margin: '12px 0 10px' }}>That page is not here.</h1>
        <p style={{ fontSize: 15, color: '#48536A', lineHeight: 1.6 }}>
          The address may have changed with the new site structure. Everything still exists: start from the
          homepage, or go straight to the projects, the services or the careers list.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 22 }}>
          <Link className="cta" to="/">Back to the homepage</Link>
          <Link className="cta-ghost" to="/projects" style={{ color: '#0C1220', borderColor: 'rgba(12,18,32,.3)' }}>Projects</Link>
          <Link className="cta-ghost" to="/services" style={{ color: '#0C1220', borderColor: 'rgba(12,18,32,.3)' }}>Services</Link>
        </div>
      </div>
      <Footer />
    </>
  )
}
