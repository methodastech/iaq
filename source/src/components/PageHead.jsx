import React, { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PAGES } from '../data/sitemap.js'
import gsap from 'gsap'
import { jargon } from '../lib/jargon.jsx'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* same origin the canonical tag uses (src/lib/meta.js) */
const SITE = 'https://iaqtechnology.com'

/* ============================================================================
   PageHead: the standard header every phase 2 page opens with.

   props
     eyebrow  string          the mono kicker above the title
     title    node            the h1. Wrap the accent phrase in <em> to pick up
                              the site's red emphasis (base.css: h1 em)
     lede     node            one paragraph under the title
     chips    array of nodes  optional mono tags under the lede
     figure   optional visual, accepted in four shapes:
                string        an image src
                object        { src, alt, caption }            a still
                object        { video, poster, alt, caption }  a silent loop
                element       any React node, rendered as given

   The band carries its own horizontal gutter inside its `padding` shorthand
   (see .pg-head in pages.css) so it can never be flattened against the screen
   edge by a competing two-class selector.

   PARALLAX (2 Sep, Bazil: "premium parallax"). The copy and the figure travel at
   different rates as the head scrolls away, which is what makes a flat header
   read as layered. It is a scrubbed ScrollTrigger on the two WRAPPERS, never on
   the h1 or the img: the motion system already owns those (a one-shot rise on
   the heading, a scale release on the image) and two tweens on one element
   fight. Lenis feeds ScrollTrigger.update from the shell, so a scrub follows
   the smoothed scroll for free. Reduced motion is a hard bail.
   ============================================================================ */

function renderFigure(figure) {
  if (!figure) return null
  if (React.isValidElement(figure)) return <div className="pg-head-fig" data-px="fig">{figure}</div>
  const f = typeof figure === 'string' ? { src: figure } : figure
  if (!f || (!f.src && !f.video)) return null
  return (
    <figure className="pg-head-fig" data-px="fig">
      {f.video
        /* the loop opens on its own poster frame, so a slow network shows the still, never a
           black box; muted + playsInline is what lets it autoplay everywhere */
        ? <video src={f.video} poster={f.poster} muted loop playsInline autoPlay preload="metadata"
                 aria-label={f.alt || ''} tabIndex={-1} />
        : <img src={f.src} alt={f.alt || ''} loading="lazy" />}
      {f.caption && <figcaption>{f.caption}</figcaption>}
    </figure>
  )
}

/* 11 Sep: the BreadcrumbList wrote hash addresses (origin + '/#' + path). After the router
   switch those URLs no longer exist, so search engines were handed six broken items per page.
   Real paths now, built from the same SITE constant the canonical tag uses. */
/* 15 Sep: a label can be JSX (every sub-page title carries an <em>), and a React element
   cannot be stringified: in dev it is circular and crashed the page blank, in production it
   serialised as an object and the published name was garbage. Flatten to plain text first. */
export function textOf(n) {
  if (n == null || typeof n === 'boolean') return ''
  if (typeof n === 'string' || typeof n === 'number') return String(n)
  if (Array.isArray(n)) return n.map(textOf).join('')
  if (n.props) return textOf(n.props.children)
  return ''
}
export function crumbLd(trail) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: textOf(c.label).replace(/\s+/g, ' ').trim(), item: SITE + c.to })),
  }
}

/* 10 Sep audit: sub-pages had no breadcrumb, so a visitor arriving from search had no sense of
   where the page sat. `crumbs` is the parent trail ([{ label, to }]); the page itself is the h1
   beneath it. A BreadcrumbList is written for search engines alongside. */
function Crumbs({ crumbs, self }) {
  if (!crumbs || !crumbs.length) return null
  /* 11 Sep: the list named the parents but stopped short of the page itself, so a two-item
     trail was published for an eleven-page set. The page is appended for search engines
     only; on screen it stays the h1 beneath the trail, as before. */
  /* 15 Sep: the page's own entry is named from the sitemap (History of IAQ, Energy Management),
     not from the headline, which is a sentence. The headline is the fallback. */
  const named = self && self.to ? PAGES.find(p => p.route === self.to) : null
  const tail = self && self.to && (named || self.label) ? [{ label: named ? named.label : self.label, to: self.to }] : []
  const ld = crumbLd([{ label: 'Home', to: '/' }, ...crumbs, ...tail])
  return (
    <nav className="pg-crumbs" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      {crumbs.map(c => <React.Fragment key={c.to}><span aria-hidden="true">&rsaquo;</span><Link to={c.to}>{c.label}</Link></React.Fragment>)}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </nav>
  )
}

export default function PageHead({ eyebrow, title, lede, figure, chips, crumbs, aside }) {
  const { pathname } = useLocation()
  const ref = useRef(null)
  /* HERO mode (2 Sep, Bazil: "make it take the whole banner spacing section and design on it"):
     when the figure carries `hero: true` the banner becomes the band itself — full bleed behind
     the copy, a left-to-right scrim for legibility, white type — instead of a picture under the
     text. The same parallax wrappers apply, so the image drifts slower than the copy. */
  const hero = figure && !React.isValidElement(figure) && typeof figure === 'object' && figure.hero && figure.src

  useEffect(() => {
    const head = ref.current
    if (!head || !gsap || !ScrollTrigger) return
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const copy = head.querySelector('[data-px="copy"]')
    const fig = head.querySelector('[data-px="fig"]')
    const ctx = gsap.context(() => {
      /* one trigger drives both layers. onUpdate mirrors its progress onto the header as a data
         attribute: a scrubbed tween only renders on the GSAP ticker, which a backgrounded tab
         stalls, so the attribute is the one thing a headless check can read to prove the trigger
         is measuring. It costs nothing and changes nothing visible. */
      const st = {
        trigger: head, start: 'top top', end: 'bottom top', scrub: 0.6,
        onUpdate: self => { head.dataset.pxProg = self.progress.toFixed(2) },
      }
      /* the copy leaves a touch faster than the page, the figure a touch slower: the eye reads
         the slower layer as further back */
      if (copy) gsap.to(copy, { y: -36, ease: 'none', scrollTrigger: st })
      if (fig) gsap.to(fig, { y: 48, ease: 'none', scrollTrigger: { ...st, onUpdate: undefined } })
      head.dataset.pxArmed = '1'
    }, head)
    return () => ctx.revert()
  }, [])

  return (
    <header className={'pg-head' + (hero ? ' pg-head-hero' : '')} ref={ref}>
      {hero && (
        <>
          <div className="pg-hero-bg" data-px="fig" aria-hidden="true"><img src={figure.src} alt="" /></div>
          <div className="pg-hero-scrim" aria-hidden="true" />
          {figure.alt && <span className="u-visually-hidden">{figure.alt}</span>}
        </>
      )}
      {/* 25 Sep, night (Bazil, on the market heroes: "put it at the right side of the title and description"): `aside` is a
          block that stands in the same row as the copy, right after it, level with it */}
      <div className={'pg-in' + (aside ? ' pg-in-aside' : '')}>
        <div className="pg-head-copy" data-px="copy">
          <Crumbs crumbs={crumbs} self={{ label: title, to: pathname }} />
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          {title && <h1>{title}</h1>}
          {lede && <p className="pg-head-lede">{jargon(lede)}</p>}
          {chips && chips.length > 0 && (
            <ul className="pg-chips">
              {chips.map((c, i) => <li className="pg-chip" key={i}>{jargon(c)}</li>)}
            </ul>
          )}
        </div>
        {aside && <div className="pg-head-aside">{aside}</div>}
        {!hero && renderFigure(figure)}
      </div>
    </header>
  )
}
