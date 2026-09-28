import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import ClosingBand from '../components/ClosingBand.jsx'
import NewsMark from '../components/NewsMark.jsx'
import NewsBanner from '../components/NewsBanner.jsx'
import NewsFeatured from '../components/NewsFeatured.jsx'
import { TAGS, longDate } from '../data/news.js'
import { art } from '../data/newsArt.js'
import { cmsNews, live } from '../lib/cms.js'
const NEWS = live(cmsNews)
import '../styles/pages.css'
import '../styles/company.css'
import '../styles/news.css'
import '../styles/news-front.css'

/* ============================================================================
   News & Insights · /news · sitemap id `news`

   14 Sep RESTRUCTURE (Bazil: "make this more structure clear like featured scrolling at top
   and then etc you know just do it better"). The front page was three competing columns (more
   stories, lead story, the latest) with an outlined chip on every item and uneven card heights,
   so nothing read as first. It is now one clear order, top to bottom:

     1. Featured   the five newest stories on a drifting, draggable rail (components/NewsFeatured.jsx)
     2. Latest     the next six, as an even photo card grid
     3. Earlier    everything else, grouped by topic, as a dated index with thumbnails

   Every story appears ONCE on the page: the three blocks are consecutive slices of the same
   date-sorted list, so nothing repeats between them. The banner above runs in its compact form,
   because its wire of the five newest stories would otherwise duplicate the carousel.

   Checklist pn5 (10 Sep client meeting) still holds: ONE approach, no filter list, no search.
   Topic grouping is layout, not a control.

   CONTENT PROVENANCE. 15 Sep: src/data/news.js holds every post on IAQ's own newsroom
   (iaqtechnology.com.my), with its title, date, body and photographs as IAQ published them.

   ARTWORK. Each card shows the post's own photograph (`img`) through data/newsArt.js, the ONE
   mapping shared with the home rail and the article page. A post with no usable IAQ photograph
   falls back to the interim pool there, and the pg-note counts those from the list.

   All new classes are `nf-` and live in styles/news-front.css.
   ============================================================================ */

const FEATURED = 5
const LATEST = 6

function Card({ n, list }) {
  return (
    <Link className="nf-card" to={`/news/${n.slug}`}>
      <span className="nf-media"><img src={art(n, list)} alt="" loading="lazy" decoding="async" /></span>
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

export default function News() {
  useEffect(() => { document.title = 'IAQ Group · News & Insights · Brand Method' }, [])

  /* SORT EXPLICITLY. The portal unshifts every new row to position zero and lets the date be
     edited freely afterwards, so array order cannot be trusted. Ties break on slug so the order
     is total, not just stable. */
  const rows = useMemo(
    () => [...NEWS].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (a.slug < b.slug ? -1 : 1))),
    [],
  )

  const interim = NEWS.filter(n => !n.img).length

  const featured = useMemo(() => rows.slice(0, FEATURED), [rows])
  /* 17 Sep (client: "to remove this section, top section is sufficient in my opinion"): the
     "Earlier, by topic" block is gone. Its stories are not: Latest now holds every story after
     the featured rail and opens a page at a time, so the whole record is still one click deep
     instead of being orphaned by the removal. */
  const rest = useMemo(() => rows.slice(FEATURED), [rows])
  const [page, setPage] = useState(1)
  const latest = useMemo(() => rest.slice(0, LATEST * page), [rest, page])
  const more = rest.length - latest.length


  return (
    <>
      <Nav />

      {/* 14 Sep (Bazil: "wheres the sidebar"): the full banner is back, with its side panel of the
          latest stories. The compact option stays in NewsBanner but is not used here. */}
      <NewsBanner />

      {/* ── 1. Featured: one full-width rail of photo tiles, drifting left to right ── */}
      <section className="nf-sec nf-feat">
        <div className="pg-in">
          <NewsFeatured items={featured} list={rows} headingId="nf-feat-h" />
        </div>
      </section>

      {/* ── 2. Latest: the next stories, an even card grid ───────────────── */}
      {latest.length > 0 && (
        <section className="nf-sec nf-latest" aria-labelledby="nf-latest-h">
          <div className="pg-in">
            <div className="nf-head">
              <h2 className="nf-h" id="nf-latest-h">Latest</h2>
            </div>
            <ul className="nf-grid">
              {latest.map(n => <li key={n.slug}><Card n={n} list={rows} /></li>)}
            </ul>
            {more > 0 && (
              <button type="button" className="nf-more nf-more-all" onClick={() => setPage(p => p + 1)}>
                Show {more < LATEST ? ('the last ' + more) : (LATEST + ' more')} {more === 1 ? 'story' : 'stories'}
                <i aria-hidden="true">&darr;</i>
              </button>
            )}
            <p className="pg-note">
              {NEWS.length} stories from the IAQ newsroom &middot; text and photographs as IAQ published them
              on iaqtechnology.com.my
              {interim > 0 && <> &middot; {interim} {interim === 1 ? 'story whose post had' : 'stories whose posts had'} no
              IAQ photograph {interim === 1 ? 'shows' : 'show'} newsroom artwork</>}
            </p>
          </div>
        </section>
      )}

      {/* 17 Sep: "Earlier, by topic" stood here, and the "Where this goes next" strip under it
          (client: "To remove this section on newsroom. I dont think it is necessary to have this
          section on this page"). Both are gone; the stories they held are in Latest above. */}
      <ClosingBand note="News and Insights concept · Brand Method" />
    </>
  )
}
