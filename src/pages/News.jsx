import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import PageHead from '../components/PageHead.jsx'
import Related from '../components/Related.jsx'
import { TAGS, longDate } from '../data/news.js'
import { cmsNews, live } from '../lib/cms.js'
const NEWS = live(cmsNews)
import '../styles/pages.css'
import '../styles/company.css'
import '../styles/news.css'

/* ============================================================================
   News & Insights · /news · sitemap id `news`
   Blocks, in sitemap order: Featured · Filter by tag · Article grid · Subscribe
   One action: Talk to us → /contact

   CONTENT PROVENANCE. All 20 items are real: title and date captured from the
   live iaqtechnology.com.my newsroom and held in src/data/news.js. What does
   not exist anywhere is the article bodies, so no summary is shown and none has
   been written. The article page carries a labelled slot for the text instead.
   Tags are an editorial classification against the vocabulary the client's own
   copy sheet asked for (CSR, EHS, Quality), pending IAQ confirmation.

   Subscribe is deliberately not a live form: there is no mailing list to write
   to, and a second button would compete with this page's one action.
   ============================================================================ */

/* day-of-month for the archive rail: the month is already the group heading, so repeating it on
   every row is noise */
const dayOf = d => String(+d.slice(8, 10)).padStart(2, '0')

export default function News() {
  const [tag, setTag] = useState('All')
  useEffect(() => { document.title = 'IAQ Group · News & Insights · Brand Method' }, [])

  const featured = NEWS[0]
  const recent = useMemo(() => NEWS.slice(1, 4), [])
  /* the archive carries everything, including the lead: a filtered view that silently omits the
     newest story is a filter that lies */
  const shown = useMemo(() => (tag === 'All' ? NEWS : NEWS.filter(n => n.tag === tag)), [tag])

  /* counts per tag, so the filter says what it will give you before you press it */
  const counts = useMemo(() => [['All', NEWS.length],
    ...TAGS.map(t => [t, NEWS.filter(n => n.tag === t).length])].filter(([, c]) => c > 0), [])

  /* grouped by month, newest first: a dated archive is how a newsroom index is actually read */
  const groups = useMemo(() => {
    const by = new Map()
    for (const n of shown) {
      const k = n.date.slice(0, 7)
      if (!by.has(k)) by.set(k, [])
      by.get(k).push(n)
    }
    return [...by.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([k, items]) => ({
      k, items,
      label: new Date(k + '-01T00:00:00').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
    }))
  }, [shown])

  return (
    <>
      <Nav />

      <PageHead
        eyebrow="News and insights"
        title={<>Stay ahead <em>with IAQ.</em></>}
        lede="Project milestones, industry insight and company updates as IAQ continues expanding its footprint across advanced, dynamic markets worldwide."
        chips={[`${NEWS.length} published items`, 'Live newsroom record', 'Bodies pending migration']}
      />

      {/* ── The lead ─────────────────────────────────────────────────────
          No per-article photography exists and permissions are not cleared, so the lead goes
          TYPOGRAPHIC rather than parking an empty image box at the top of the page. That is what a
          newsroom does when it has a story and no picture, and it reads as a decision instead of
          as a gap. */}
      <section className="nw-lead-band">
        <div className="pg-in">
          <Link className="nw-lead" to={`/news/${featured.slug}`}>
            <span className="nw-lead-k">
              <span className="cp-tag">{featured.tag}</span>
              <time dateTime={featured.date}>{longDate(featured.date)}</time>
              <i aria-hidden="true">Latest</i>
            </span>
            <h2>{featured.title}</h2>
            <span className="nw-lead-go">Open the story <i aria-hidden="true">&rarr;</i></span>
          </Link>
        </div>
      </section>

      {/* ── Recent three ─────────────────────────────────────────────────── */}
      {recent.length > 0 && (
        <section className="pg-sec">
          <div className="pg-in">
            <span className="eyebrow">More recent</span>
            <div className="nw-recent">
              {recent.map(n => (
                <Link className="nw-rc" key={n.slug} to={`/news/${n.slug}`}>
                  <span className="cp-tag">{n.tag}</span>
                  <h3>{n.title}</h3>
                  <time dateTime={n.date}>{longDate(n.date)}</time>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── The archive ──────────────────────────────────────────────────── */}
      <section className="pg-sec calm" id="archive">
        <div className="pg-in">
          <span className="eyebrow">The archive</span>
          <h2>Everything IAQ has <em>published.</em></h2>

          {/* the filter sticks, because scanning an archive means changing your mind halfway down */}
          <div className="nw-bar">
            <div className="nw-chips" role="group" aria-label="Filter articles by tag">
              {counts.map(([t, c]) => (
                <button key={t} type="button" className="nw-chip"
                  aria-pressed={tag === t} onClick={() => setTag(t)}>
                  {t}<b>{c}</b>
                </button>
              ))}
            </div>
            <span className="nw-count" role="status" aria-live="polite">
              {shown.length} {shown.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {groups.length > 0 ? (
            <div className="nw-arch">
              {groups.map(g => (
                <section className="nw-month" key={g.k} aria-label={g.label}>
                  <h3 className="nw-mk">{g.label}</h3>
                  <ol className="nw-list">
                    {g.items.map(n => (
                      <li key={n.slug}>
                        <Link to={`/news/${n.slug}`}>
                          <time dateTime={n.date}>{dayOf(n.date)}</time>
                          <span className="nw-t">{n.title}</span>
                          <span className="cp-tag">{n.tag}</span>
                          <i aria-hidden="true">&rarr;</i>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          ) : (
            <div className="cp-empty">
              <h3>Nothing under that tag yet</h3>
              <p>Pick another tag, or reset to All.</p>
            </div>
          )}

          <p className="pg-note">
            {NEWS.length} items captured from the live newsroom &middot; headlines and dates are the real
            published record &middot; article bodies are still to be migrated from IAQ
          </p>
        </div>
      </section>

      {/* ── Subscribe ───────────────────────────────────────────────────── */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="eyebrow">Subscribe</span>
          <h2>The newsroom, <em>delivered.</em></h2>
          <div className="cp-feature">
            <div className="pg-slot u-mt0">
              <div className="pg-slot-in">
                <span className="pg-slot-tag">Subscribe · not wired in this concept</span>
                <b>No address is collected until IAQ nominates a list</b>
                <p>
                  The sign-up field goes live once there is a mailing list to write to and consent
                  wording to show. Shipping a field that quietly discards an address would be worse than
                  not shipping one.
                </p>
                <ul>
                  <li>Mailing list or platform</li>
                  <li>Consent copy</li>
                  <li>Sender address and reply-to</li>
                </ul>
              </div>
            </div>
            <div>
              <p className="pg-body u-mt0">
                Until then, the fastest route to IAQ is a direct conversation. Media enquiries, partner
                briefings and project questions all land in the same place.
              </p>
              <div className="cp-act">
                <Link className="cta" to="/contact">Talk to us</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Related from="news" />
      <Footer note="News and Insights concept · Brand Method" />
    </>
  )
}
