import React, { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import ClosingBand from '../components/ClosingBand.jsx'
import PageHead from '../components/PageHead.jsx'
import OfficeMap from '../components/OfficeMap.jsx'
import { cmsProjects, live } from '../lib/cms.js'
const PROJECTS = live(cmsProjects)
import '../styles/pages.css'
import '../styles/company.css'

/* ============================================================================
   Global Presence · /global-presence · sitemap id `global-presence`
   Blocks, in sitemap order: Globe · Office list · Projects by country · Enquiry
   One action: Start a project → /contact

   CONTENT PROVENANCE. Office list per the client confirmation of 19 Aug 2026:
   Malaysia (Shah Alam HQ + Penang), Singapore, Germany (Dresden), India,
   Sweden, USA, Ireland — seven countries, matching the counters used across the site (Ireland announced 10 Sep 2026).
   Delivered-in keeps the countries with past projects but no current office:
   China, Poland, France and Morocco. Street addresses for India, Sweden and
   the USA are still outstanding from IAQ.

   The projects listed are the 18 publishable entries in src/data/projects.js.
   The ~77 profile-only references are NOT named: they carry client names that
   cannot be published.
   ============================================================================ */

/* 8 Oct (client: pins with the country's flag and a callout on the map itself, never a list beside it): the rotating
   SVG globe, its legend, the address cards and the two country lists are gone. The offices and the delivered-in
   countries are data/offices.js, drawn by components/OfficeMap.jsx; the addresses are on the Contact page. */

/* the 18 publishable projects, grouped the way the registry groups them */
const REGIONS = [
  ['malaysia', 'Malaysia'],
  ['singapore', 'Singapore'],
  ['china', 'China'],
  ['europe', 'Europe'],
]

export default function GlobalPresence() {
  useEffect(() => { document.title = 'IAQ Group · Global Presence · Brand Method' }, [])

  const grouped = useMemo(() => REGIONS.map(([key, name]) => ({
    key,
    name,
    items: PROJECTS.map((p, i) => ({ ...p, i })).filter(p => p.region === key),
  })).filter(g => g.items.length), [])

  return (
    <>
      <Nav />

      <PageHead crumbs={[{ label: 'About', to: '/about' }]}
        eyebrow="Where we are"
        title={<>Rooted in Malaysia, <em>building across borders.</em></>}
        lede="Founded in Malaysia in 1995. Today a total facility solutions provider with offices in seven countries, measured in the programmes those offices run and the projects handed over."
      />

      {/* ── The map ─────────────────────────────────────────────────────── */}
      {/* 8 Oct: the copy above, the map the full width of the band under it, every office pinned and named on it */}
      <section className="cp-globe-band cp-map-band">
        <div className="pg-in">
          <div className="cp-globe-copy cp-map-copy">
            <span className="eyebrow">The footprint</span>
            <h2>Seven countries, <em>pinned where they are.</em></h2>
            <p>
              Each flag marks an IAQ office, and each office supports clients locally while drawing on the group&rsquo;s full
              regional engineering capability. The grey marks are countries IAQ has built in.
            </p>
          </div>
          <OfficeMap className="cp-map" />
        </div>
      </section>

      {/* ── Office list ─────────────────────────────────────────────────── */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="eyebrow">Offices</span>
          <h2>The addresses <em>that answer.</em></h2>

          <p className="pg-lede">Every office&rsquo;s address, phone and hours are on the <Link to="/contact#offices">Contact page</Link>.</p>

          <div className="pg-slot">
            <div className="pg-slot-in">
              <span className="pg-slot-tag">Office addresses · supplied by IAQ</span>
              <b>Seven countries confirmed · street addresses outstanding</b>
              <p>
                The country list is settled: Malaysia, Singapore, Germany, India, Sweden, USA, and Ireland from 10 September 2026.
                Still needed from IAQ before launch:
              </p>
              <ul>
                {/* 30 Sep: Singapore, India, Penang, Sweden and Ireland addresses are in (Contact); what is still owed */}
                <li>The street address for the USA office</li>
                <li>The Ireland office: entity name and phone</li>
                <li>The HQ street number: the profile prints 9, every other source prints 12</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Projects by country ─────────────────────────────────────────── */}
      <section className="pg-sec calm">
        <div className="pg-in">
          <span className="eyebrow">By country</span>
          <h2>Reach, <em>as evidence.</em></h2>
          <p className="pg-lede">
            The publishable record, grouped by where it was built. Every entry opens the full project.
          </p>

          {grouped.map(g => (
            <div key={g.key} style={{ marginTop: '28px' }}>
              <span className="cp-pk">
                {g.name} · {g.items.length} {g.items.length === 1 ? 'project' : 'projects'}
              </span>
              <div className="cp-rows">
                {g.items.map(p => (
                  <Link className="cp-row" key={p.i} to={`/projects/${p.i}`}>
                    <span className="c">{p.client}</span>
                    <span className="n">{p.name}</span>
                    <span className="v">{p.loc}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <p className="pg-note">
            18 projects published at concept stage · IAQ confirms the definitive launch list before go live · profile-only references stay off the page while their client names remain confidential
          </p>
        </div>
      </section>

      {/* ── Enquiry ─────────────────────────────────────────────────────── */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="eyebrow">Enquiries</span>
          <h2>A facility in any <em>of these countries.</em></h2>
          <div className="cp-act">
            <Link className="cta" to="/contact">Start a project</Link>
            <span className="cp-hint">
              Tell us the country, the class and the programme. One accountable team from feasibility to
              handover.
            </span>
          </div>
        </div>
      </section>
      <ClosingBand note="Global Presence concept · Brand Method" />
    </>
  )
}
