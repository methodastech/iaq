import React from 'react'
import { Link } from 'react-router-dom'

/* ============================================================================
   VideoBanner · a full-bleed video head for a page (25 Sep 2026, Bazil on the History page: "create a video banner
   that's awesome for this"). IAQ's own clip under a dark scrim, the crumbs, the title with its red phrase, the lede
   and the body paragraph that used to sit in a grey band under the head. The clip is muted, looped and never
   autoplays under reduced motion (the poster stands).
   ============================================================================ */
export default function VideoBanner({ crumbs = [], title, lede, body, video, poster, years }) {
  const still = typeof window !== 'undefined' && window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches
  return (
    <header className="vb" id="top">
      <div className="vb-media" aria-hidden="true">
        {still
          ? <img src={poster} alt="" />
          : <video muted loop playsInline autoPlay preload="metadata" poster={poster}><source src={video} type="video/mp4" /></video>}
      </div>
      <div className="vb-scrim" aria-hidden="true" />
      <div className="vb-in">
        {crumbs.length > 0 && (
          <nav className="vb-crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            {crumbs.map(c => <React.Fragment key={c.to}><i aria-hidden="true">&rsaquo;</i><Link to={c.to}>{c.label}</Link></React.Fragment>)}
          </nav>
        )}
        {years && <div className="vb-years" aria-hidden="true"><b>{years[0]}</b><i /><b>{years[1]}</b></div>}
        <h1>{title}</h1>
        {lede && <p className="vb-lede">{lede}</p>}
        {body && <p className="vb-body">{body}</p>}
      </div>
    </header>
  )
}
