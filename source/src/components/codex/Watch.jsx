import React, { useEffect, useState } from 'react'

/* ============================================================================
   Watch · short video tutorials inside the Codex (18 Sep 2026, Bazil: "put some video tutorial also if there are").
   Each card shows the video's own thumbnail and loads the player only when pressed (youtube-nocookie, no
   tracking until then, nothing heavy on page load). Every video was checked to exist and allow embedding;
   the list lives in data/codex.js (VIDEOS). Print shows the titles and links instead of players.
   ============================================================================ */
/* 25 Sep (Bazil: "why can't I expand"): the player's own full screen button needs the browser to allow full screen,
   which some embedded browsers do not; Expand opens the film large inside the page instead, and Escape closes it */
function Big({ v, onClose }) {
  useEffect(() => { const k = e => { if (e.key === 'Escape') onClose() }; window.addEventListener('keydown', k); const o = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { window.removeEventListener('keydown', k); document.body.style.overflow = o } }, [onClose])
  return (
    <div className="wt-big" role="dialog" aria-label={v.title} onClick={onClose}>
      <div className="wt-big-in" onClick={e => e.stopPropagation()}>
        <iframe src={'https://www.youtube-nocookie.com/embed/' + v.id + '?autoplay=1&rel=0&modestbranding=1'} title={v.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
      </div>
      <button type="button" className="wt-big-x" onClick={onClose}>Close</button>
    </div>
  )
}
function Card({ v }) {
  const [on, setOn] = useState(false)
  const [big, setBig] = useState(false)
  const url = 'https://www.youtube.com/watch?v=' + v.id
  return (
    <article className="wt-card">
      {big && <Big v={v} onClose={() => setBig(false)} />}   {/* outside the frame, so the frame's own iframe rules do not reach it */}
      <div className="wt-frame">
        <button type="button" className="wt-exp" onClick={() => { setOn(false); setBig(true) }} aria-label={'Expand: ' + v.title}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>Expand</button>

        {on
          ? <iframe src={'https://www.youtube-nocookie.com/embed/' + v.id + '?autoplay=1&rel=0&modestbranding=1'} title={v.title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
          : <button type="button" className="wt-play" onClick={() => setOn(true)} aria-label={'Play: ' + v.title}>
              <img src={'https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg'} alt="" loading="lazy" />
              <span className="wt-btn" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" /></svg></span>
              {v.dur && <span className="wt-dur">{v.dur}</span>}
            </button>}
      </div>
      <div className="wt-txt">
        <span className="wt-topic">{v.topic}</span>
        <h4>{v.title}</h4>
        <p>{v.why}</p>
        <a className="wt-src" href={url} target="_blank" rel="noopener noreferrer">{v.channel} on YouTube</a>
      </div>
    </article>
  )
}

/* groups: [{ name, sub, items }] shows one labelled row per business unit; items alone shows one row */
export default function Watch({ items, groups, title, lede, cols = 4 }) {
  const gs = groups || (items ? [{ items }] : [])
  if (!gs.length) return null
  const all = gs.flatMap(g => g.items)
  return (
    <div className="wt" style={{ '--wt-cols': cols }}>
      {title && <h3 className="wt-h">{title}</h3>}
      {lede && <p className="wt-lede">{lede}</p>}
      {gs.map((g, i) => (
        <div className="wt-grp" key={g.name || i}>
          {g.name && <h4 className="wt-gh"><b>{g.name}</b>{g.sub && <span>{g.sub}</span>}</h4>}
          <div className="wt-grid">{g.items.map(v => <Card key={v.id} v={v} />)}</div>
        </div>
      ))}
      <ol className="wt-print">{all.map(v => <li key={v.id}><b>{v.title}</b> ({v.channel}{v.dur ? ', ' + v.dur : ''}): youtube.com/watch?v={v.id}</li>)}</ol>
    </div>
  )
}
