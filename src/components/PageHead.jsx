import React from 'react'

/* ============================================================================
   PageHead: the standard header every phase 2 page opens with.

   props
     eyebrow  string          the mono kicker above the title
     title    node            the h1. Wrap the accent phrase in <em> to pick up
                              the site's red emphasis (base.css: h1 em)
     lede     node            one paragraph under the title
     chips    array of nodes  optional mono tags under the lede
     figure   optional visual, accepted in three shapes:
                string        an image src
                object        { src, alt, caption }
                element       any React node, rendered as given

   The band carries its own horizontal gutter inside its `padding` shorthand
   (see .pg-head in pages.css) so it can never be flattened against the screen
   edge by a competing two-class selector.
   ============================================================================ */

function renderFigure(figure) {
  if (!figure) return null
  if (React.isValidElement(figure)) return <div className="pg-head-fig">{figure}</div>
  const f = typeof figure === 'string' ? { src: figure } : figure
  if (!f || !f.src) return null
  return (
    <figure className="pg-head-fig">
      <img src={f.src} alt={f.alt || ''} loading="lazy" />
      {f.caption && <figcaption>{f.caption}</figcaption>}
    </figure>
  )
}

export default function PageHead({ eyebrow, title, lede, figure, chips }) {
  return (
    <header className="pg-head">
      <div className="pg-in">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        {title && <h1>{title}</h1>}
        {lede && <p className="pg-head-lede">{lede}</p>}
        {chips && chips.length > 0 && (
          <ul className="pg-chips">
            {chips.map((c, i) => <li className="pg-chip" key={i}>{c}</li>)}
          </ul>
        )}
        {renderFigure(figure)}
      </div>
    </header>
  )
}
