import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import PageHead from '../components/PageHead.jsx'
import Related from '../components/Related.jsx'
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
   ============================================================================ */

const MILESTONES = [
  {
    yr: '1994', key: true, title: 'Founded on air',
    text: 'Ir. Tiew Soon Aik establishes IAQ in Malaysia as a cleanroom specialist: a small office, a blueprint and an unrelenting spirit.',
  },
  {
    yr: '2000', title: 'First build abroad',
    text: "25,000 m² of cleanroom, M&E and utilities delivered in China for the dot-com boom's chipmakers: the first project beyond Malaysia, with more across China to follow.",
  },
  {
    yr: '2007', title: 'Into Europe',
    text: "A branch office opens in Poland for engineering, procurement, construction and commissioning; a project in France follows on a client's recommendation.",
  },
  {
    yr: '2009', title: 'Class 1, delivered',
    text: 'A 14,000 m² Class 1 cleanroom is built in Ipoh, among the cleanest rooms in the region, as the group extends its reach to Morocco.',
  },
  {
    yr: '2013', key: true, title: 'The energy pivot',
    text: "Main contractor for Malaysia's largest district cooling plant: a system serving 56,000 parties, delivered with zero lost-time injury and a 25 year maintenance mandate.",
  },
  {
    yr: '2015', title: 'Semiconductor scale',
    text: 'A 43,000 m² backend facility marks a new order of scale; Class 100 cleanroom works for the national wafer fab initiative follow a year later.',
  },
  {
    yr: '2020', key: true, title: 'The EV era',
    text: 'Dry rooms and architectural works for a Swedish gigafactory carry IAQ into EV batteries; a green-certified plant lands ahead of schedule through the pandemic.',
  },
  {
    yr: '2022', title: 'Mega projects',
    text: 'A wafer fab expansion in the northern corridor, entry into data centres, and a full design and build fab expansion in Kuching the following year.',
  },
  {
    yr: '2025', key: true, title: 'Going global',
    text: 'A second Malaysian base opens in Penang; IAQ Engineering (DE) GmbH opens in Dresden, joining offices in Singapore, France and India.',
  },
  {
    yr: 'Today', key: true, title: 'Listing-grade',
    text: 'Eight countries, 450 people, more than 250 projects and over a million square metres of cleanroom built-up, and a group preparing for its public listing.',
  },
]

const RECORDS = [
  {
    k: 'Cleanroom class', b: 'ISO Class 1',
    s: 'The highest standard of cleanroom IAQ has built, delivered successfully for a semiconductor client. Few companies in the market can do it at all.',
  },
  {
    k: 'Energy', b: "Malaysia's largest district cooling centre",
    s: 'Main contractor on the District cooling operator district cooling scheme, delivered with a 25 year maintenance mandate.',
  },
  {
    k: 'First in region', b: 'First co-generative plant in Southeast Asia',
    s: 'The co-generative plant, delivered as part of the energy portfolio.',
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
    s: 'Achieved on the East Malaysia wafer fab expansion, and recognised by DOSH Kuching in July 2025.',
  },
]

const NEXT = [
  { yr: '2026', title: 'India', text: "IAQ expands into India, providing design and build turnkey delivery for India's first wafer fab." },
  { yr: '2026', title: 'United States', text: 'IAQ steps into the United States following the localisation of advanced technology facilities back into the States.' },
]

export default function History() {
  useEffect(() => { document.title = 'IAQ Group · History of IAQ · Brand Method' }, [])

  return (
    <>
      <Nav />

      <PageHead
        eyebrow="The record"
        title={<>Thirty two years, <em>compounded.</em></>}
        lede="Founded in 1994 by Ir. Tiew Soon Aik in Malaysia, a locally owned company. IAQ started as a cleanroom specialist and evolved into a total facility solutions provider, giving clients end to end delivery: from design and consultation, to building their hi-tech facilities, through to maintenance."
      />

      {/* ── Era intro ───────────────────────────────────────────────────── */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="eyebrow">Era intro</span>
          <h2>From a local engineering firm <em>to a regional leader.</em></h2>
          <p className="pg-lede">
            The company started locally and is now global, with a footprint in Singapore, Sweden, Poland,
            France, India and Germany, and it is still expanding. Globally IAQ grows as a cleanroom
            specialist. Regionally it operates as a total solutions provider: one accountable team from
            the first drawing to final handover, and then for the life of the facility.
          </p>
          <p className="pg-note">
            Source: the client&rsquo;s own founding story and the company profile
          </p>
        </div>
      </section>

      {/* ── Milestone timeline ──────────────────────────────────────────── */}
      <section className="pg-sec calm">
        <div className="pg-in">
          <span className="eyebrow">Milestone timeline</span>
          <h2>Ten moments that <em>changed the scale.</em></h2>
          <p className="pg-lede">A small office in 1994 to listing-grade today.</p>

          <div className="cp-tl">
            {MILESTONES.map(m => (
              <article className={m.key ? 'cp-mile key' : 'cp-mile'} key={m.yr}>
                <span className="cp-yr">{m.yr}</span>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </article>
            ))}
          </div>

          <div className="pg-slot">
            <div className="pg-slot-in">
              <span className="pg-slot-tag">Milestone contract values · withheld</span>
              <b>Four figures are held back rather than published</b>
              <p>
                Contract values carried by the earlier draft of this timeline appear in no
                client-supplied document, so they do not go on the page. The milestones themselves are
                unaffected and stand as written.
              </p>
              <ul>
                <li>2013 · the district cooling plant</li>
                <li>2015 · the semiconductor backend facility</li>
                <li>2020 · the green-certified plant</li>
                <li>2022 · the the northern corridor wafer fab expansion</li>
              </ul>
              <p>
                Supplied by IAQ: the verified contract values, or confirmation to publish the milestones
                without them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Firsts and records ──────────────────────────────────────────── */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="eyebrow">Firsts and records</span>
          <h2>What the record <em>actually proves.</em></h2>
          <p className="pg-lede">
            Not claims. Each of these is carried by the company profile, the live newsroom or the
            published project registry.
          </p>
          <div className="cp-tiles">
            {RECORDS.map(r => (
              <div className="cp-tile" key={r.b}>
                <span className="k">{r.k}</span>
                <b>{r.b}</b>
                <span>{r.s}</span>
              </div>
            ))}
          </div>
          <p className="pg-note">
            The full ESH award list and the certificate files are still outstanding from IAQ
          </p>
        </div>
      </section>

      {/* ── Where it points next ────────────────────────────────────────── */}
      <section className="pg-sec calm">
        <div className="pg-in">
          <span className="eyebrow">Where it points next</span>
          <h2>The arc runs <em>outward.</em></h2>
          <div className="cp-tl">
            {NEXT.map(n => (
              <article className="cp-mile key" key={n.title}>
                <span className="cp-yr">{n.yr}</span>
                <h3>{n.title}</h3>
                <p>{n.text}</p>
              </article>
            ))}
          </div>
          <p className="pg-note">Both entries verbatim from the company profile, page 7</p>

          <div className="cp-act">
            <Link className="cta" to="/projects">See the work</Link>
            <span className="cp-hint">
              The record, project by project: every facility findable by market, location, model and
              cleanroom class.
            </span>
          </div>
        </div>
      </section>

      <Related from="history" />
      <Footer note="History of IAQ concept · Brand Method" />
    </>
  )
}
