import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import ClosingBand from '../components/ClosingBand.jsx'
import VideoBanner from '../components/VideoBanner.jsx'
import { LINE_MARKS } from '../components/HeroLineMarks.jsx'
import HistorySpan from '../components/HistorySpan.jsx'
import '../styles/pages.css'
import '../styles/company.css'

/* ============================================================================
   History of IAQ · /about/history · sitemap id `history`
   Blocks, in the order sitemap.js declares them:
     Era intro · Milestone timeline · Firsts and records · Where it points next
   One action: See the work → /projects

   CONTENT PROVENANCE. The ten milestones are the Brand Method narrative
   timeline carried by _source/about.html, the only narrative timeline that
   exists in text form anywhere. Four contract values that appear in that
   timeline (on the 2013 district cooling plant, the 2015 backend facility, the
   2020 green-certified plant and the 2022 the northern corridor expansion) are NOT corroborated
   in any client-supplied document, so they are omitted here and declared as an
   open item rather than published. Everything in "Firsts and records" is
   carried by the company profile, the live newsroom or the published project
   registry. The two entries in "Where it points next" are verbatim from the
   company profile, page 7.

   15 Sep. The timeline now carries a figure per entry and the achievements
   (awards, certifications, safety records, registrations) as a distinct entry
   type on the same rail. Both live in data/history.js, where each figure
   records what its file actually shows and whether it is the project or a
   labelled representation; nothing there is claimed beyond what this page,
   Culture, Commitment and the newsroom already publish.
   ============================================================================ */

const RECORDS = [
  {
    k: 'Cleanroom class', b: 'ISO Class 1',
    s: 'The highest standard of cleanroom IAQ has built, delivered successfully for a semiconductor client. Few companies in the market can do it at all.',
  },
  {
    k: 'Energy', b: "Malaysia's largest district cooling centre",
    s: 'Main contractor on the scheme, delivered with a 25 year maintenance mandate.',
  },
  {
    k: 'First in region', b: 'First co-generative plant in Southeast Asia',
    s: 'Delivered in Malaysia as part of IAQ’s energy work.',
  },
  {
    k: 'Award · 2024', b: 'Builder of the Year',
    s: 'Named at the Malaysian Construction Industry Excellence Awards by CIDB, judged on company performance, project management, technical expertise, innovation, quality, safety and sustainability.',
  },
  {
    k: 'Award · 2024', b: 'Gold, OSH Management',
    s: 'Gold Award for OSH Management at the 20th OSH Excellence Awards, alongside the Highwire Safety Award at Gold level.',
  },
  {
    k: 'Safety', b: '2.6 million safe manhours',
    /* 15 Sep: corrected. The 2.6 million post is dated 28 February 2025; the DOSH Kuching
       post (3 July 2025) names no figure and its banner reads 2.74 million, so the two are
       stated separately rather than as one recognition. */
    s: 'Reached on 28 February 2025 on the East Malaysia wafer fab expansion, with a clean lost time injury record. In July 2025 DOSH Kuching recognised the safety standards on IAQ’s Sarawak project.',
  },
]


/* the mark each record carries */
/* 25 Sep (Bazil: "no shadow and refine the icons please", "use design direction correct"): the official line set */
const recIcon = b => /ISO Class/.test(b) ? 'recClean' : /district cooling/i.test(b) ? 'recCooling' : /co-generative/i.test(b) ? 'recCogen' : /Builder/.test(b) ? 'recAward' : /OSH/.test(b) ? 'recMedal' : 'recSafety'

export default function History() {
  useEffect(() => { document.title = 'IAQ Group · History of IAQ · Brand Method' }, [])

  return (
    <>
      <Nav />

      {/* 17 Sep (client: "Can merge into one instead of having two separated section? Feels like it
          has 2 header just for IAQ history"). The page opened with a title, then a second heading
          that introduced the same subject again. One header now, carrying both paragraphs. */}
      {/* 25 Sep (Bazil: "create a video banner that's awesome for this"): the head is IAQ's crew clip under a dark scrim,
          the years 1995 to 2026 drawn across it, the title, the lede and the paragraph that sat in a grey band below */}
      <VideoBanner crumbs={[{ label: 'About', to: '/about' }]}
        title={<>31 years <em>of development.</em></>}
        lede="Founded in Malaysia in 1995 by Ir. Tiew Soon Aik, IAQ began as a cleanroom specialist and now delivers hi-tech facilities end to end, from design to maintenance."
        body="The company started locally and is now global. Its footprint covers Singapore, Sweden, Poland, France, India and Germany, and it is still expanding. Globally IAQ grows as a cleanroom specialist. Regionally it operates as a total solutions provider: one accountable team from the first drawing to final handover, and then for the life of the facility."
        /* 25 Sep (Bazil: "need to replace this video with better and proper one", "put 31 years of development instead",
           "not need the banner to be too tall"): the generated crew clip is gone; IAQ's own plant at dusk from the air
           (Xfab drone shot DJI_0516) as an 8 s slow move; the banner height is in pages.css */
        video="/assets/videos/hero-plant-dusk-2.mp4" poster="/assets/iaq/plant-dusk-hero.webp" years={['1995', '2026']}
      />

      {/* ── Milestone timeline ──────────────────────────────────────────── */}
      <HistorySpan />

      {/* ── Firsts and records ──────────────────────────────────────────── */}
      <section className="pg-sec">
        <div className="pg-in">
          <h2>What thirty-one years <em>have proved.</em></h2>
          <p className="pg-lede">
            Each is on record in IAQ&rsquo;s company profile, its newsroom or the project registry.
          </p>
          <div className="cp-tiles">
            {RECORDS.map(r => (
              <div className="cp-tile cp-tile-ic" key={r.b}>
                {/* 25 Sep (Bazil: "create visuals and icons for each", then "use design direction correct"): one line mark per record */}
                <span className="cp-ic" aria-hidden="true">{(() => { const M = LINE_MARKS[recIcon(r.b)]; return <M /> })()}</span>
                <span className="k">{r.k}</span>
                <b>{r.b}</b>
                <span>{r.s}</span>
              </div>
            ))}
          </div>

          {/* 25 Sep (Bazil: "remove this"): the See the projects row is gone; the nav and the closing band reach the registry */}
        </div>
      </section>

      {/* 17 Sep (client: "I don't understand the necessity to have this section. Can remove"):
          "The arc runs outward" is gone. India and the United States are already on the timeline
          above under 2025, so the section repeated the record it sat below. Its one useful part,
          the way through to the registry, stands at the foot of the records instead.

          The "Where this goes next" strip went with it (client: "Instead of having this section,
          maybe we can interlink our project reference in each year"). Each milestone that the
          registry actually holds now links straight to that project, in data/history.js. */}
      <ClosingBand note="History of IAQ concept · Brand Method" />
    </>
  )
}
