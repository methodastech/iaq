import React, { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import ClosingBand from '../components/ClosingBand.jsx'
import NewsMark from '../components/NewsMark.jsx'
import { longDate } from '../data/news.js'
import { art } from '../data/newsArt.js'
import { cmsNews, newsBySlug, cmsProjects, live } from '../lib/cms.js'
const NEWS = live(cmsNews)
const bySlug = newsBySlug
const PROJECTS = live(cmsProjects)
import '../styles/pages.css'
import '../styles/company.css'
import '../styles/news.css'
import '../styles/news-front.css'

/* ============================================================================
   Article · /news/:slug · sitemap id `article`
   Blocks, in sitemap order:
     Header · Body · Related market · Related projects · More articles
   One action: Talk to us → /contact

   CONTENT PROVENANCE. 15 Sep: every story now carries its real body and, where the post had
   one, its own photograph, migrated from IAQ's newsroom on iaqtechnology.com.my (see the
   header of data/news.js for exactly what was edited and which posts had no usable photo).
   With the body present, the old "body is still on the old site" note and the outbound link
   are gone. Both come back only for a story that has no body, which is what a new article
   saved from the portal with an empty body looks like.

   BODY. `body` is plain text so the portal textarea can edit it: a blank line starts a new
   paragraph, "## " a subheading, "* " a list item, and [text](https://...) an inline link.
   Prose renders at a 65 to 75 character measure; photographs run the full column width at
   their own aspect ratio, with a caption only when the post supplied one.

   ARTWORK. The lead photograph is the row's own `img`. A story without one falls back to
   the interim pool in data/newsArt.js, the same picture its card shows everywhere else.

   "Related market" is still deliberately not asserted per article: no story has been mapped
   to a market, so the block links to the markets hub. "Related projects" is labelled as a
   selection from the publishable registry, not a claim that the article names them.
   ============================================================================ */

/* a stable pick of three publishable projects, so a given article always shows
   the same three rather than reshuffling on every render */
function pickProjects(slug) {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) % 100000
  const start = h % PROJECTS.length
  return [0, 1, 2].map(k => {
    const i = (start + k * 5) % PROJECTS.length
    return { ...PROJECTS[i], i }
  })
}

/* inline text: [label](https://...) becomes a link, a single line break stays a line break */
const LINK = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g
function inline(text) {
  const out = []
  String(text).split('\n').forEach((line, li) => {
    if (li) out.push(<br key={'b' + li} />)
    let last = 0
    let m
    LINK.lastIndex = 0
    while ((m = LINK.exec(line))) {
      if (m.index > last) out.push(line.slice(last, m.index))
      out.push(
        <a key={'a' + li + '-' + m.index} className="ar-link" href={m[2]} target="_blank" rel="noopener noreferrer">
          {m[1]}<i aria-hidden="true">&#8599;</i>
        </a>,
      )
      last = m.index + m[0].length
    }
    if (last < line.length) out.push(line.slice(last))
  })
  return out
}

function Prose({ text }) {
  const blocks = String(text).replace(/\r\n?/g, '\n').trim().split(/\n\s*\n/)
  return (
    <div className="ar-prose">
      {blocks.map((b, i) => {
        if (/^##\s+/.test(b)) return <h2 className="ar-h" key={i}>{inline(b.replace(/^##\s+/, ''))}</h2>
        if (/^\*\s+/.test(b)) {
          const items = []
          b.split('\n').forEach(l => {
            if (/^\*\s+/.test(l)) items.push([l.replace(/^\*\s+/, '')])
            else if (items.length) items[items.length - 1].push(l)
          })
          return (
            <ul className="ar-list" key={i}>
              {items.map((it, k) => (
                <li key={k}>
                  {it.length > 1
                    ? <><strong>{inline(it[0])}</strong><br />{inline(it.slice(1).join('\n'))}</>
                    : inline(it[0])}
                </li>
              ))}
            </ul>
          )
        }
        return <p key={i}>{inline(b)}</p>
      })}
    </div>
  )
}

function Photo({ src, w, h, alt, cap, eager, className = '' }) {
  return (
    <figure className={'ar-fig ' + className}>
      <img src={src} width={w || undefined} height={h || undefined} alt={alt || ''}
           loading={eager ? 'eager' : 'lazy'} decoding="async" />
      {cap ? <figcaption>{cap}</figcaption> : null}
    </figure>
  )
}

function Card({ n }) {
  return (
    <Link className="nf-card" to={`/news/${n.slug}`}>
      <span className="nf-media"><img src={art(n, NEWS)} alt="" loading="lazy" decoding="async" /></span>
      <span className="nf-card-b">
        <span className="nf-kick">
          <span className="nf-cat"><NewsMark tag={n.tag} />{n.tag}</span>
          <time dateTime={n.date}>{longDate(n.date)}</time>
        </span>
        <h3 className="nf-card-t">{n.title}</h3>
      </span>
    </Link>
  )
}

function NotFound() {
  return (
    <>
      <Nav />
      <section className="pg-sec">
        <div className="pg-in">
          <span className="eyebrow">Not found</span>
          <h2>Start again <em>in the newsroom.</em></h2>
          <p className="pg-lede">
            Every story we publish stays in the newsroom index. The full index is one click away.
          </p>
          <div className="cp-act">
            <Link className="cta" to="/news">Back to the newsroom</Link>
          </div>
        </div>
      </section>
      <ClosingBand note="News and Insights concept · Brand Method" />
    </>
  )
}

export default function Article() {
  const { slug } = useParams()
  const item = bySlug(slug)

  useEffect(() => {
    document.title = item
      ? `IAQ Group · ${item.title} · Brand Method`
      : 'IAQ Group · Article · Brand Method'
  }, [item])

  const projects = useMemo(() => (item ? pickProjects(item.slug) : []), [item])

  /* the archive in date order, so previous/next mean older/newer rather than array position */
  const ordered = useMemo(
    () => [...NEWS].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (a.slug < b.slug ? -1 : 1))),
    [],
  )
  const at = item ? ordered.findIndex(n => n.slug === item.slug) : -1
  const newer = at > 0 ? ordered[at - 1] : null
  const older = at >= 0 && at < ordered.length - 1 ? ordered[at + 1] : null
  const more = useMemo(
    () => (at < 0 ? [] : [ordered[at + 1], ordered[at + 2], ordered[at - 1], ordered[at - 2]]
      .filter(n => n && n.slug !== item.slug).slice(0, 3)),
    [ordered, at, item],
  )

  if (!item) return <NotFound />

  const hasBody = !!(item.body && String(item.body).trim())
  const gallery = Array.isArray(item.gallery) ? item.gallery.filter(g => g && g.src) : []

  return (
    <>
      <Nav />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="cp-art-head ar-head">
        <div className="pg-in">
          <Link className="cp-back" to="/news">&larr; News and insights</Link>
          <h1>{item.title}</h1>
          <div className="ar-meta">
            <span className="nf-cat"><NewsMark tag={item.tag} />{item.tag}</span>
            <time dateTime={item.date}>{longDate(item.date)}</time>
            {!hasBody && item.url && (
              <a className="cp-srclink" href={item.url} target="_blank" rel="noopener noreferrer">
                Read the original on iaqtechnology.com.my <i aria-hidden="true">↗</i>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <article className="pg-sec ar-sec ar-white" aria-label={item.title}>
        <div className="pg-in">
          <div className="ar-col">
            {item.img
              ? <Photo className="ar-lead" src={item.img} w={item.imgW} h={item.imgH} alt={item.imgAlt} cap={item.imgCap} eager />
              : <Photo className="ar-lead ar-interim" src={art(item, NEWS)} alt="" eager />}

            {hasBody ? (
              <Prose text={item.body} />
            ) : (
              <div className="pg-slot u-mt0">
                <div className="pg-slot-in">
                  <span className="pg-slot-tag">Article body · supplied by IAQ</span>
                  <b>The headline and date above are verified. The body copy follows from IAQ.</b>
                  <p>
                    This page holds the space for the story rather than filling it with stand-in text.
                    The slot fills the moment the body is published through the portal.
                  </p>
                </div>
              </div>
            )}

            {gallery.length > 0 && (
              <div className={'ar-gallery' + (gallery.length % 2 ? ' odd' : '')}>
                {gallery.map(g => <Photo key={g.src} src={g.src} w={g.w} h={g.h} alt={g.alt} cap={g.cap} />)}
              </div>
            )}
          </div>
        </div>
      </article>

      {/* ── Previous / next ─────────────────────────────────────────────── */}
      {(newer || older) && (
        <nav className="pg-sec u-pt0 ar-white ar-pnav" aria-label="More stories in date order">
          <div className="pg-in">
            <div className="ar-pn">
              {newer && (
                <Link to={`/news/${newer.slug}`}>
                  <span className="ar-pn-k">&larr; Newer story</span><span className="ar-pn-t">{newer.title}</span>
                </Link>
              )}
              {older && (
                <Link className="nx" to={`/news/${older.slug}`}>
                  <span className="ar-pn-k">Older story &rarr;</span><span className="ar-pn-t">{older.title}</span>
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* 15 Sep (finish pass): the "Related market" block was one sentence and a link to /markets, repeated on all
          70 articles; it said nothing about the story, so it is gone. The nav and the footer carry /markets. */}
      {/* ── Related projects ────────────────────────────────────────────── */}
      <section className="pg-sec ar-white ar-proj">
        <div className="pg-in">
          <span className="eyebrow">Related projects</span>
          <h2>More of <em>IAQ&rsquo;s work.</em></h2>
          <p className="pg-lede">A selection of IAQ&rsquo;s published projects.</p>
          <div className="cp-rows">
            {projects.map(p => (
              <Link className="cp-row" key={p.i} to={`/projects/${p.i}`}>
                <span className="c">{p.client}</span>
                <span className="n">{p.name}</span>
                <span className="v">{p.loc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── More articles ───────────────────────────────────────────────── */}
      <section className="pg-sec ar-more">
        <div className="pg-in">
          <span className="eyebrow">More articles</span>
          <h2>Also in <em>the newsroom.</em></h2>
          <ul className="nf-grid">
            {more.map(n => <li key={n.slug}><Card n={n} /></li>)}
          </ul>

          <div className="cp-act">
            <Link className="cta" to="/contact">Contact us</Link>
            <span className="cp-hint">
              Media enquiries, partner briefings and project questions land in the same place.
            </span>
          </div>
        </div>
      </section>
      <ClosingBand note="News and Insights concept · Brand Method" />
    </>
  )
}
