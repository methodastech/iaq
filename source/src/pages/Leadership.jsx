import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import ClosingBand from '../components/ClosingBand.jsx'
import PageHead from '../components/PageHead.jsx'
import '../styles/pages.css'
import '../styles/company.css'

/* ============================================================================
   Board & Leadership · /about/leadership · sitemap id `leadership`
   Blocks, in sitemap order: Board · Executive team · Governance note · Join us
   One action: Join the team → /careers

   CONTENT PROVENANCE. This page is a hard content gap and is built as one.
   The ONLY person named in any client source is the founder. Discovery A2.15
   (ownership and board) and A2.10 (key people) were both answered "TBC", with
   A2.10 adding: "If we showcase our key people, they will be our Founder, CEO,
   Board of Directors, C-suite and Managerial level." Those groupings are the
   client's own words and are the only structure used here. No name, position,
   portrait or biography has been invented. The two business development
   contacts printed on the back of the company profile are deliberately NOT
   published: discovery A1.8 says "Main contact person no need to disclose."

   The card format follows the client's own specification, moodboard slide 14:
   "Formal listing, group people based on their position. Information listing:
   Name, Position. When clicked, drop-down showing list of professional
   experience."
   ============================================================================ */

function Person({ name, role, portrait, experience }) {
  return (
    <article className="cp-person">
      <div className="cp-portrait">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="9" r="3.6" />
          <path d="M4.5 20c0-4 3.4-6.6 7.5-6.6s7.5 2.6 7.5 6.6" />
        </svg>
        <span>{portrait}</span>
      </div>
      <div className="cp-person-b">
        <b>{name}</b>
        <span>{role}</span>
      </div>
      <details>
        <summary>Professional experience</summary>
        <div>{experience}</div>
      </details>
    </article>
  )
}

const BOARD = [
  {
    name: 'Ir. Tiew Soon Aik', role: 'Founder', portrait: 'Portrait · founder',
    experience: 'Founded IAQ in Malaysia in 1995 as a cleanroom specialist and led its evolution into a total facility solutions provider. The full professional record is to be supplied by IAQ.',
  },
  {
    name: 'Name to be confirmed', role: 'Chief Executive Officer', portrait: 'Portrait · CEO',
    experience: 'Name, portrait and professional record to be supplied by IAQ.',
  },
  {
    name: 'Line-up to be confirmed', role: 'Board of Directors', portrait: 'Portraits · board',
    experience: 'The board line-up, each position and the professional record behind it are to be supplied by IAQ.',
  },
]

const EXEC = [
  {
    name: 'Line-up to be confirmed', role: 'C-suite', portrait: 'Portraits · C-suite',
    experience: 'Names, positions, portraits and professional records to be supplied by IAQ.',
  },
  {
    name: 'Line-up to be confirmed', role: 'Managerial level', portrait: 'Portraits · management',
    experience: 'Names, positions, portraits and professional records to be supplied by IAQ.',
  },
]

export default function Leadership() {
  useEffect(() => { document.title = 'IAQ Group · Board & Leadership · Brand Method' }, [])

  return (
    <>
      <Nav />

      <PageHead crumbs={[{ label: 'About', to: '/about' }]}
        eyebrow="Leadership"
        title={<>The people <em>accountable.</em></>}
        lede="The people who lead IAQ, grouped by position. Names beyond the founder are published as IAQ confirms them."
        chips={['Founder on record', 'Further names from IAQ', 'Portraits to follow']}
      />

      {/* ── Board ───────────────────────────────────────────────────────── */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="eyebrow">Board</span>
          <h2>Founder, chief executive, <em>board of directors.</em></h2>
          <p className="pg-lede">
            Grouped by position. Open any entry for that person&rsquo;s professional experience. The founder
            is on the record today, and each further name is added as IAQ confirms it.
          </p>

          <div className="cp-people">
            {BOARD.map(p => <Person key={p.role} {...p} />)}
          </div>

          <div className="pg-slot">
            <div className="pg-slot-in">
              <span className="pg-slot-tag">Board line-up · supplied by IAQ</span>
              <b>Every entry above other than the founder is a position ready for IAQ to name</b>
              <p>
                Filling this page takes four things per individual and nothing less. Until they arrive,
                no name is guessed and no biography is written.
              </p>
              <ul>
                <li>Full name, with the correct honorific</li>
                <li>Exact position title</li>
                <li>Publishable portrait</li>
                <li>Professional experience, for the drop-down</li>
              </ul>
            </div>
          </div>

          <p className="pg-note">
            The founder&rsquo;s honorific sits with IAQ to confirm. IAQ&rsquo;s own wording gives Mr. Tiew Soon Aik, the built pages give Ir. Tiew Soon Aik, and IAQ&rsquo;s confirmation sets the form across the site.
          </p>
        </div>
      </section>

      {/* ── Executive team ──────────────────────────────────────────────── */}
      <section className="pg-sec calm">
        <div className="pg-in">
          <span className="eyebrow">Executive team</span>
          <h2>The layer that <em>runs delivery.</em></h2>
          <p className="pg-lede">
            The C-suite and the managerial level, in the same format as the board. Names are added as
            IAQ confirms each entry.
          </p>

          <div className="cp-people">
            {EXEC.map(p => <Person key={p.role} {...p} />)}
          </div>

          <p className="pg-note">
            Portraits belong to the leadership photography package, still to be scheduled with IAQ
          </p>
        </div>
      </section>

      {/* ── Governance note ─────────────────────────────────────────────── */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="eyebrow">Governance</span>
          <h2>Doing business <em>the right way.</em></h2>
          <div className="pg-split">
            <div>
              <p className="pg-body u-mt0">
                Transparency and accountability guide every decision, backed by our published Quality and
                environment, health and safety (EHS) policies.
              </p>
              <p className="pg-body">
                IAQ&rsquo;s governance practice is built for transparency, accountability and ethical
                decision-making. It is held to the compliance standards clients, partners and stakeholders
                expect, and to the bar a public company is judged by.
              </p>
              <div className="cp-chips">
                <span className="lbl">Read next</span>
                <Link to="/policies">Policies</Link>
                <Link to="/about/esg">ESG commitment</Link>
              </div>
            </div>
            <div>
              <span className="cp-pk">On the record</span>
              <ul className="cp-facts">
                <li><b>Entity</b><span>IAQ Technology International Sdn. Bhd. is the entity intended to list. The listing board will be confirmed ahead of the listing.</span></li>
                <li><b>Policies</b><span>Quality Policy and EHS Policy, published in the policy index.</span></li>
                <li><b>Standards</b><span>ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018, certified by Intertek.</span></li>
                <li><b>Licence</b><span>CIDB Grade G7.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Join us ─────────────────────────────────────────────────────── */}
      <section className="pg-sec calm">
        <div className="pg-in">
          <span className="eyebrow">Join us</span>
          <h2>Careers <em>with the group.</em></h2>
          <p className="pg-lede">
            IAQ has 31 years of engineering behind it, and offices in Singapore, Germany, India, Sweden,
            the USA and Ireland. Engineers here get hands-on experience and a long career runway, on
            projects that matter to hi-tech industries worldwide.
          </p>
          <div className="cp-act">
            <Link className="cta" to="/careers">Join the team</Link>
            <span className="cp-hint">
              Open roles across engineering, project management, quality assurance and control (QAQC), finance and more.
            </span>
          </div>
        </div>
      </section>
      <ClosingBand note="Board and Leadership concept · Brand Method" />
    </>
  )
}
