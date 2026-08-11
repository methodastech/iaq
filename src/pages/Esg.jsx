import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import PageHead from '../components/PageHead.jsx'
import Related from '../components/Related.jsx'
import { NEWS, longDate } from '../data/news.js'
import '../styles/pages.css'
import '../styles/company.css'

/* ============================================================================
   Corporate Commitment · /about/esg · sitemap id `esg`
   Blocks, in sitemap order:
     Commitment intro · Environment · Social and safety · Governance ·
     Certifications · Reporting
   One action: Talk to us → /contact

   CONTENT PROVENANCE. Almost everything here is real and verbatim. The intro,
   the three pillar headlines and their body copy, the safety pull-quote, the
   certifications line and the recognition line are taken word for word from the
   client's own Corporate Commitment copy sheet. The longer pillar descriptions
   come from the company profile and the built ESG section. The certifications
   are the ones already carried by the built site.

   FRAMING RULE, client instruction verbatim on the copy sheet: "avoid certified
   near ESG, use committed to instead, since IAQ is not yet formally
   ESG-certified". Nothing on this page claims an ESG certification. The ISO
   certifications are separate, real, and named as such.
   ============================================================================ */

/* the copy sheet asks this page for a live newsroom feed of items tagged CSR,
   EHS and Quality. These are the real newsroom items carrying those tags. */
const REPORTED = NEWS.filter(n => n.tag === 'CSR' || n.tag === 'EHS' || n.tag === 'Quality').slice(0, 6)

export default function Esg() {
  useEffect(() => { document.title = 'IAQ Group · Corporate Commitment · Brand Method' }, [])

  return (
    <>
      <Nav />

      <PageHead
        eyebrow="Corporate commitment"
        title={<>Building responsibly matters <em>as much as building well.</em></>}
        lede="Here is how we protect our people, our environment, and the trust our clients place in us."
        chips={['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018', 'CIDB G7']}
      />

      {/* ── Commitment intro ────────────────────────────────────────────── */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="eyebrow">Commitment intro</span>
          <h2>Three commitments, held <em>as operating standards.</em></h2>
          <p className="pg-lede">
            IAQ integrates environmental, social and corporate governance principles into every project.
            Not a report published once a year: the way the work is run.
          </p>
          <div className="cp-tiles">
            <div className="cp-tile">
              <span className="k">Environmental</span>
              <b>Sustainable by design</b>
              <span>Building sustainably and reducing our footprint.</span>
            </div>
            <div className="cp-tile">
              <span className="k">Social</span>
              <b>People first</b>
              <span>Protecting our people and giving back to our communities.</span>
            </div>
            <div className="cp-tile">
              <span className="k">Governance</span>
              <b>Doing business the right way</b>
              <span>Operating with transparency and integrity.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Environment ─────────────────────────────────────────────────── */}
      <section className="pg-sec calm">
        <div className="pg-in">
          <span className="eyebrow">Environment</span>
          <h2>Sustainable <em>by design.</em></h2>
          <div className="pg-split">
            <div>
              <p className="pg-body u-mt0">
                We build with energy efficiency in mind. From eco-friendly materials to smarter cooling
                systems that cut long-term energy use.
              </p>
              <p className="pg-body">
                IAQ is dedicated to minimising its environmental footprint through sustainable design and
                construction practice, continually seeking energy-efficient solutions and prioritising
                eco-friendly technologies. Impact is managed under ISO 14001: waste minimisation,
                resource conservation and energy-efficient engineering on every site.
              </p>
            </div>
            <div>
              <span className="cp-pk">On the record</span>
              <ul className="cp-facts">
                <li><b>Carbon</b><span>20 tonnes of carbon footprint reduced per annum.</span></li>
                <li><b>Standard</b><span>ISO 14001:2015 environmental management, certified by Intertek.</span></li>
                <li><b>Energy</b><span>Energy management offered as a risk-free service with no upfront cost to the client.</span></li>
              </ul>
            </div>
          </div>

          <div className="pg-slot">
            <div className="pg-slot-in">
              <span className="pg-slot-tag">Energy savings evidence · supplied by IAQ</span>
              <b>The supporting figure this block asks for does not exist yet</b>
              <p>
                The copy sheet calls for a saving stated here, for example the energy saved through
                completed energy management projects. No such figure appears in any supplied document,
                so none is published.
              </p>
              <ul>
                <li>Verified kWh or ringgit saved</li>
                <li>The projects the figure is measured across</li>
                <li>The period it covers</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social and safety ───────────────────────────────────────────── */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="eyebrow">Social and safety</span>
          <h2>People <em>first.</em></h2>
          <div className="pg-split">
            <div>
              <p className="pg-body u-mt0">
                Safe workplaces, an inclusive culture, and giving back, through community outreach like
                our visits to PDK Kota Raja and House of Love.
              </p>
              <p className="pg-body">
                IAQ prioritises the wellbeing and safety of its employees and the communities around its
                sites, promotes a diverse and inclusive work environment, and upholds ethical labour
                practice across the group.
              </p>
              <blockquote className="pg-pull" style={{ marginTop: '26px' }}>
                <small>Safety is not negotiable</small>
                We believe every incident is preventable. No task is worth risking someone&rsquo;s
                safety.
              </blockquote>
            </div>
            <div>
              <span className="cp-pk">On the record</span>
              <ul className="cp-facts">
                <li><b>Safety</b><span>2.6 million safe manhours achieved on the East Malaysia wafer fab expansion.</span></li>
                <li><b>Recognition</b><span>Gold Award for OSH Management, 20th OSH Excellence Awards 2024, and DOSH Kuching recognition in July 2025.</span></li>
                <li><b>Standard</b><span>ISO 45001:2018 occupational health and safety, certified by Intertek.</span></li>
                <li><b>People</b><span>450 people group-wide, and a strategic collaboration with University of Malaya.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Governance ──────────────────────────────────────────────────── */}
      <section className="pg-sec calm">
        <div className="pg-in">
          <span className="eyebrow">Governance</span>
          <h2>Doing business <em>the right way.</em></h2>
          <div className="pg-split">
            <div>
              <p className="pg-body u-mt0">
                Transparency and accountability guide every decision, backed by our published Quality and
                EHS Policies.
              </p>
              <p className="pg-body">
                IAQ&rsquo;s governance practice is built for transparency, accountability and ethical
                decision-making, adhering to the compliance standards that earn the trust of clients,
                partners and stakeholders, and that a public company is judged by.
              </p>
            </div>
            <div>
              <span className="cp-pk">Read next</span>
              <div className="cp-chips" style={{ marginTop: '12px' }}>
                <Link to="/policies">Quality and EHS policies</Link>
                <Link to="/about/leadership">Board and leadership</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Certifications ──────────────────────────────────────────────── */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="eyebrow">Certifications</span>
          <h2>Standards we <em>hold ourselves to.</em></h2>
          <p className="pg-lede">
            ISO 9001 (Quality), ISO 14001 (Environmental), and ISO 45001 (Safety) internationally
            recognised standards guiding how we work.
          </p>
          <div className="cp-certs">
            <em>ISO 9001:2015</em>
            <em>ISO 14001:2015</em>
            <em>ISO 45001:2018</em>
            <em>CIDB G7</em>
          </div>

          <div className="pg-slot">
            <div className="pg-slot-in">
              <span className="pg-slot-tag">Certificate artwork · supplied by IAQ</span>
              <b>Three certificate logos, side by side, minimal text</b>
              <p>
                That is the copy sheet&rsquo;s own specification for this block. The certificate files
                have not been supplied, so the standards sit as text until they arrive.
              </p>
              <ul>
                <li>ISO 9001, ISO 14001 and ISO 45001 certificates</li>
                <li>UKAS and CIDB G7 marks</li>
                <li>The full ESH award list, promised as a separate attachment</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reporting ───────────────────────────────────────────────────── */}
      <section className="pg-sec calm">
        <div className="pg-in">
          <span className="eyebrow">Reporting</span>
          <h2>What we report, <em>and where.</em></h2>
          <p className="pg-lede">
            The commitment is evidenced in the newsroom as it happens. These are the published items
            tagged to community, safety and quality.
          </p>

          <div className="cp-rows">
            {REPORTED.map(n => (
              <Link className="cp-row" key={n.slug} to={`/news/${n.slug}`}>
                <span className="c">{n.tag}</span>
                <span className="n">{n.title}</span>
                <span className="v">{longDate(n.date)}</span>
              </Link>
            ))}
          </div>

          <div className="pg-slot">
            <div className="pg-slot-in">
              <span className="pg-slot-tag">Formal reporting · in preparation</span>
              <b>IAQ is committed to ESG principles and is building the reporting to match</b>
              <p>
                The downloadable policies referenced on the copy sheet have not yet been supplied, and
                no sustainability report has been issued, so neither is linked from this page.
              </p>
              <ul>
                <li>Quality Policy PDF</li>
                <li>EHS Policy PDF</li>
                <li>Reporting period and scope, once set</li>
              </ul>
            </div>
          </div>

          <div className="cp-act">
            <Link className="cta" to="/contact">Talk to us</Link>
            <span className="cp-hint">
              Questions on how IAQ builds, or on the standards behind a specific project.
            </span>
          </div>
        </div>
      </section>

      <Related from="esg" />
      <Footer note="Corporate Commitment concept · Brand Method" />
    </>
  )
}
