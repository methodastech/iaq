import React, { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import Related from '../components/Related.jsx'
import { longDate } from '../data/news.js'
import { cmsNews, newsBySlug, cmsProjects, live } from '../lib/cms.js'
const NEWS = live(cmsNews)
const bySlug = newsBySlug
const PROJECTS = live(cmsProjects)
import '../styles/pages.css'
import '../styles/company.css'

/* ============================================================================
   Article · /news/:slug · sitemap id `article`
   Blocks, in sitemap order:
     Header · Body · Related market · Related projects · More articles
   One action: Talk to us → /contact

   CONTENT PROVENANCE. The headline, the date and the tag are real, captured
   from the live iaqtechnology.com.my newsroom. The BODY DOES NOT EXIST in any
   supplied source, for this item or any other, so it is a labelled slot. No
   substitute prose has been written and none should be.

   "Related market" is deliberately not asserted per article: mapping a story to
   a market needs the body text, which has not arrived. The block links to the
   markets hub and says exactly that. "Related projects" is labelled selected
   work drawn from the publishable registry, not a claim that the article
   mentions them.

   This page uses its own header rather than PageHead: the h1 is the article
   title, and it carries a back link and a dateline that no other page has.
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

function NotFound() {
  return (
    <>
      <Nav />
      <section className="pg-sec">
        <div className="pg-in">
          <span className="eyebrow">Not found</span>
          <h2>That story is not <em>in the newsroom.</em></h2>
          <p className="pg-lede">
            The link may be from an older build of the site. The full index is one click away.
          </p>
          <div className="cp-act">
            <Link className="cta" to="/news">Back to the newsroom</Link>
          </div>
        </div>
      </section>
      <Related from="article" />
      <Footer note="News and Insights concept · Brand Method" />
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
  const more = useMemo(
    () => (item ? NEWS.filter(n => n.slug !== item.slug).slice(0, 3) : []),
    [item],
  )

  if (!item) return <NotFound />

  return (
    <>
      <Nav />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="cp-art-head">
        <div className="pg-in">
          <Link className="cp-back" to="/news">&larr; News and insights</Link>
          <h1>{item.title}</h1>
          <div className="cp-meta u-mt18">
            <span className="cp-tag">{item.tag}</span>
            <span className="cp-date">{longDate(item.date)}</span>
            <span className="cp-date">Source · IAQ newsroom</span>
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <section className="pg-sec">
        <div className="pg-in">
          <div className="cp-art-body">
            {item.body && item.body.trim() ? (
              <div className="cp-prose">
                {item.body.trim().split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}
                <p className="cp-src" style={{ fontSize: 12.5, color: '#828B9E', marginTop: 18 }}>Published through the IAQ CMS portal.</p>
              </div>
            ) : (
            <div className="pg-slot u-mt0">
              <div className="pg-slot-in">
                <span className="pg-slot-tag">Article body · supplied by IAQ</span>
                <b>The headline and date above are real. The text is not written yet.</b>
                <p>
                  This story is part of the published record on iaqtechnology.com.my, but its body copy
                  was not captured in any supplied document, and nothing has been written in its place.
                  The slot fills the moment IAQ migrates the copy or approves a rewrite.
                </p>
                <ul>
                  <li>Article body</li>
                  <li>Lead image and gallery, with publish permission</li>
                  <li>The market and capability tags for this story</li>
                </ul>
              </div>
            </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Related market ──────────────────────────────────────────────── */}
      <section className="pg-sec calm">
        <div className="pg-in">
          <span className="eyebrow">Related market</span>
          <h2>Where this story <em>sits.</em></h2>
          <p className="pg-lede">
            Each story carries its market once the body copy arrives and can be tagged against it.
            Asserting one now would be a guess. Until then, the seven markets are one click away.
          </p>
          <div className="u-mt18">
            <Link className="cp-back" to="/markets">All seven markets &rarr;</Link>
          </div>
        </div>
      </section>

      {/* ── Related projects ────────────────────────────────────────────── */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="eyebrow">Related projects</span>
          <h2>Selected work <em>from the registry.</em></h2>
          <p className="pg-lede">
            Publishable projects from the track record. These are not references drawn from the article
            text: that tagging follows once the body copy is supplied.
          </p>
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
      <section className="pg-sec calm">
        <div className="pg-in">
          <span className="eyebrow">More articles</span>
          <h2>Also in <em>the newsroom.</em></h2>
          <div className="cp-grid">
            {more.map(n => (
              <Link className="cp-card" key={n.slug} to={`/news/${n.slug}`}>
                <div className="cp-meta">
                  <span className="cp-tag">{n.tag}</span>
                  <span className="cp-date">{longDate(n.date)}</span>
                </div>
                <h3>{n.title}</h3>
                <span className="go">Read &rarr;</span>
              </Link>
            ))}
          </div>

          <div className="cp-act">
            <Link className="cta" to="/contact">Talk to us</Link>
            <span className="cp-hint">
              Media enquiries, partner briefings and project questions land in the same place.
            </span>
          </div>
        </div>
      </section>

      <Related from="article" />
      <Footer note="News and Insights concept · Brand Method" />
    </>
  )
}
