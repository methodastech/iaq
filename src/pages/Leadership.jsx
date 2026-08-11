import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import PageHead from '../components/PageHead.jsx'
import Related from '../components/Related.jsx'
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
    experience: 'Founded IAQ in Malaysia in 1994 as a cleanroom specialist and led its evolution into a total facility solutions provider. The full professional record is to be supplied by IAQ.',
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

      <PageHead
        eyebrow="Leadership"
        title={<>The people <em>accountable.</em></>}
        lede="Structure shown for layout. The final line-up, names, titles, portraits and professional records are to be confirmed by IAQ before publication. Nothing on this page has been drafted on the company's behalf."
        chips={['Format per IAQ moodboard slide 14', 'One name on record', 'Portraits pending']}
      />

      {/* ── Board ───────────────────────────────────────────────────────── */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="eyebrow">Board</span>
          <h2>Founder, chief executive, <em>board of directors.</em></h2>
          <p className="pg-lede">
            Listed formally and grouped by position, with a drop-down of professional experience on each
            entry, exactly as IAQ specified. One name exists in the record today: the founder.
          </p>

          <div className="cp-people">
            {BOARD.map(p => <Person key={p.role} {...p} />)}
          </div>

          <div className="pg-slot">
            <div className="pg-slot-in">
              <span className="pg-slot-tag">Board line-up · supplied by IAQ</span>
              <b>Every entry above other than the founder is a slot, not a person</b>
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
            Open item: the founder&rsquo;s honorific. The client&rsquo;s own words say Mr. Tiew Soon Aik,
            the built pages render Ir. Tiew Soon Aik. IAQ confirms which is correct.
          </p>
        </div>
      </section>

      {/* ── Executive team ──────────────────────────────────────────────── */}
      <section className="pg-sec calm">
        <div className="pg-in">
          <span className="eyebrow">Executive team</span>
          <h2>The layer that <em>runs delivery.</em></h2>
          <p className="pg-lede">
            The C-suite and the managerial level, in the same format as the board. IAQ named these two
            groupings; it has not yet named the people in them.
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
          <span className="eyebrow">Governance note</span>
          <h2>Doing business <em>the right way.</em></h2>
          <div className="pg-split">
            <div>
              <p className="pg-body u-mt0">
                Transparency and accountability guide every decision, backed by our published Quality and
                EHS Policies.
              </p>
              <p className="pg-body">
                IAQ&rsquo;s governance practice is built for transparency, accountability and ethical
                decision-making, held to the compliance standards clients, partners and stakeholders
                expect, and to the bar a public company is judged by.
              </p>
              <div className="cp-chips">
                <span className="lbl">Read next</span>
                <Link to="/policies">Policies</Link>
                <Link to="/about/esg">Corporate commitment</Link>
              </div>
            </div>
            <div>
              <span className="cp-pk">On the record</span>
              <ul className="cp-facts">
                <li><b>Entity</b><span>IAQ Technology Sdn. Bhd. is the entity intended to list. The listing board is not yet selected.</span></li>
                <li><b>Policies</b><span>Quality Policy and EHS Policy, published in the policy index.</span></li>
                <li><b>Standards</b><span>ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018, certified by Intertek.</span></li>
                <li><b>Licence</b><span>CIDB Gred G7.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Join us ─────────────────────────────────────────────────────── */}
      <section className="pg-sec calm">
        <div className="pg-in">
          <span className="eyebrow">Join us</span>
          <h2>Grow with a team <em>that is growing too.</em></h2>
          <p className="pg-lede">
            With over 30 years of engineering excellence and an expanding footprint across Singapore,
            Sweden, France, Germany and India, IAQ offers the kind of hands-on experience and career
            runway that is hard to find elsewhere, working on projects that genuinely matter to hi-tech
            industries worldwide.
          </p>
          <div className="cp-act">
            <Link className="cta" to="/careers">Join the team</Link>
            <span className="cp-hint">
              Open roles across engineering, project management, QAQC, finance and more.
            </span>
          </div>
        </div>
      </section>

      <Related from="leadership" />
      <Footer note="Board and Leadership concept · Brand Method" />
    </>
  )
}
