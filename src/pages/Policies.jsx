import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import PageHead from '../components/PageHead.jsx'
import Related from '../components/Related.jsx'
import Icon from '../components/FlowIcon.jsx'
import '../styles/pages.css'
import '../styles/gated.css'

/* ============================================================================
   06 · Policies · /policies · status: new

   Hard content gap. No privacy, terms or cookie text exists in any supplied
   source, and the Quality Policy and EHS Policy PDFs referenced in the client
   copy sheet were never handed over. So this page ships the structure, correct
   and complete, with every document represented by a labelled placeholder slot
   naming the document and who supplies it.

   The certifications block is the exception. ISO 9001:2015, ISO 14001:2015,
   ISO 45001:2018, CIDB G7, the UKAS accreditation mark and the Gold OSH 2024
   recognition are already published on the built site (_source/about.html
   compliance strips and both footers), so they are real and stated as fact. The
   certificate files behind them are still outstanding, which is a slot.

   No policy text is drafted or invented here. What each slot carries is a
   specification of the document IAQ must supply, never a policy.
   ============================================================================ */

const POLICIES = [
  {
    id: 'privacy',
    title: 'Privacy Policy',
    sub: 'How personal data from the site and from enquiries is handled',
    icon: 'shield',
    status: 'Awaiting text',
    must: 'The document must set out what personal data the site and the enquiry form collect, the lawful basis for holding it, how long it is kept, which processors it is shared with, any transfer outside Malaysia, and the route for a person to request access, correction or deletion.',
    tag: 'Privacy Policy text, PDPA aligned · supplied by IAQ legal counsel',
    note: 'A Privacy Policy link already exists in the footer of the current live site. The text behind it was never captured and does not appear in any supplied document.',
  },
  {
    id: 'terms',
    title: 'Terms of Use',
    sub: 'The terms that govern use of the website itself',
    icon: 'file',
    status: 'Awaiting text',
    must: 'The document must set out acceptable use of the site, ownership of the content and the marks, the limits of any representation made on the site, third party links, and the governing law.',
    tag: 'Terms of Use text · supplied by IAQ legal counsel',
    note: 'Required by the site architecture. No text exists in any source.',
  },
  {
    id: 'cookies',
    title: 'Cookie and consent notice',
    sub: 'What is set, why, and how a visitor refuses it',
    icon: 'grid',
    status: 'Scope not agreed',
    must: 'The document must list every cookie and tag the site sets, its purpose and its lifespan, separate analytics from anything strictly necessary, and describe how consent is captured, stored and withdrawn.',
    tag: 'Cookie inventory and consent copy · supplied by IAQ legal counsel once the consent scope is agreed',
    note: 'Analytics, Search Console and cookie consent are scheduled for launch. In discovery B2.10 IAQ asked what the consent banner is for, so the requirement has not been accepted yet and the scope is still open.',
  },
  {
    id: 'quality',
    title: 'Quality Policy',
    sub: 'The quality commitment behind the ISO 9001:2015 certification',
    icon: 'gauge',
    status: 'PDF outstanding',
    must: 'The signed policy statement, dated, with the management representative named, published as a downloadable PDF and summarised on this page.',
    tag: 'Quality Policy PDF, signed and dated · supplied by IAQ QHSE',
    note: 'The client copy sheet for the corporate commitment page calls for a link to a downloadable Quality Policy PDF. The file has not been supplied.',
  },
  {
    id: 'ehs',
    title: 'EHS Policy',
    sub: 'Environment, health and safety, behind ISO 14001 and ISO 45001',
    icon: 'leaf',
    status: 'PDF outstanding',
    must: 'The signed environment, health and safety policy statement, dated, published as a downloadable PDF and summarised on this page alongside the site safety standard.',
    tag: 'EHS Policy PDF, signed and dated · supplied by IAQ QHSE',
    note: 'The client copy sheet for the corporate commitment page calls for a link to a downloadable EHS Policy PDF. The file has not been supplied.',
  },
  {
    id: 'whistleblowing',
    title: 'Whistleblowing policy',
    sub: 'The protected route for raising a concern',
    icon: 'people',
    status: 'Awaiting text',
    must: 'The document must state who may raise a concern, the channel it goes to, how the person raising it is protected, and how the outcome is recorded. A listing track company is expected to publish this.',
    tag: 'Whistleblowing policy text and the reporting channel · supplied by IAQ legal counsel with the company secretary',
    note: 'Named in the purpose of this page in the site architecture. No text exists in any source.',
  },
]

/* Already published on the built site, so these are stated as fact.
   Certifier attribution follows the company profile. */
const CERTS = [
  { name: 'ISO 9001:2015', meta: 'Quality management · certified by Intertek' },
  { name: 'ISO 14001:2015', meta: 'Environmental management · certified by Intertek' },
  { name: 'ISO 45001:2018', meta: 'Occupational health and safety · certified by Intertek' },
  { name: 'CIDB G7', meta: 'Highest grade contractor registration, Malaysia' },
  { name: 'UKAS accredited', meta: 'Accreditation mark carried on the certification' },
  { name: 'Gold · OSH 2024', meta: 'Occupational safety and health recognition' },
]

export default function Policies() {
  const [active, setActive] = useState(POLICIES[0].id)
  const doc = POLICIES.find(p => p.id === active) || POLICIES[0]

  useEffect(() => { document.title = 'IAQ Group · Policies · Brand Method' }, [])

  return (
    <>
      <Nav />

      <PageHead
        eyebrow="Policies"
        title={<>Everything IAQ commits to, <em>in writing.</em></>}
        lede="Quality, safety, environment, privacy and whistleblowing in one compliant place. The structure is built and every document has its address. The text and the signed PDFs come from IAQ."
      />

      <section className="pg-sec" aria-labelledby="pol-index-h">
        <div className="pg-in">
          <div className="ghead">
            <div>
              <span className="pg-k">01 / Policy index</span>
              <h2 id="pol-index-h">Six documents, one address</h2>
              <p>Select a document to see what it must contain and where it stands today. Each one gets a permanent address, so a client, an auditor or a regulator can link straight to it.</p>
            </div>
            <span className="pg-tag b">6 outstanding</span>
          </div>

          <div className="gindex" role="tablist" aria-label="Policy index">
            {POLICIES.map((p, i) => (
              <button
                key={p.id} type="button" className="grow" role="tab"
                id={`pol-tab-${p.id}`} aria-controls="pol-detail-panel"
                aria-selected={p.id === active} onClick={() => setActive(p.id)}
              >
                <span className="gn">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <h3>{p.title}</h3>
                  <span className="gsub">{p.sub}</span>
                </span>
                <span className="pg-tag b">{p.status}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        className="pg-sec calm" id="pol-detail-panel" role="tabpanel"
        aria-labelledby={`pol-tab-${doc.id}`} tabIndex={-1}
      >
        <div className="pg-in">
          <div className="ghead">
            <div>
              <span className="pg-k">02 / Policy detail</span>
              <h2>{doc.title}</h2>
              <p>{doc.sub}.</p>
            </div>
            <span className="pg-tag b">{doc.status}</span>
          </div>

          <div className="gdetail">
            <div>
              <p className="gsub-note"><b>What the document must contain.</b> {doc.must}</p>
              <p className="gsub-note">{doc.note}</p>
              <ul className="pg-list" style={{ marginTop: '20px' }}>
                <li>Format: a page on this site, plus a signed PDF where the policy is a controlled document.</li>
                <li>Version control: issue date and revision number printed on the document and shown on this page.</li>
                <li>Owner: named on publication, so an auditor knows who to ask.</li>
              </ul>
            </div>

            <div className="gslots one">
              <div className="pg-slot gslot">
                <div className="pg-slot-in">
                  <span className="gslot-badge"><Icon name={doc.icon} /></span>
                  <b>{doc.title}</b>
                  <p>This slot holds the published document. It stays visibly empty rather than filled with drafted wording, because no approved text exists and nothing on a compliance page should be improvised.</p>
                  <span className="pg-slot-tag">{doc.tag}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pg-sec" aria-labelledby="pol-cert-h">
        <div className="pg-in">
          <div className="ghead">
            <div>
              <span className="pg-k">03 / Certifications</span>
              <h2 id="pol-cert-h">Certified, not asserted</h2>
              <p>The standards IAQ is audited against. These are already published on the site and are stated here as fact. The certificate files behind them are still outstanding.</p>
            </div>
          </div>

          <div className="gcerts">
            {CERTS.map(c => (
              <div className="gcert" key={c.name}>
                <b>{c.name}</b>
                <span>{c.meta}</span>
              </div>
            ))}
          </div>

          <div className="gslots">
            <div className="pg-slot gslot">
              <div className="pg-slot-in">
                <span className="gslot-badge"><Icon name="file" /></span>
                <b>Certificate library</b>
                <p>Each certification downloadable as its own file, with the certificate number, the issuing body and the expiry date shown next to it.</p>
                <span className="pg-slot-tag">ISO 9001, ISO 14001, ISO 45001, UKAS, CIDB G7 and Gold OSH 2024 certificate files, with numbers and expiry dates · supplied by IAQ QHSE</span>
              </div>
            </div>
            <div className="pg-slot gslot">
              <div className="pg-slot-in">
                <span className="gslot-badge"><Icon name="chart" /></span>
                <b>Safety and ESH award record</b>
                <p>The award list referenced in discovery, presented by year with the issuing body, so the safety claim carries evidence rather than adjectives.</p>
                <span className="pg-slot-tag">Full ESH award list and the certificate files, promised as a separate attachment in discovery A2.12 · supplied by IAQ</span>
              </div>
            </div>
          </div>

          <p className="pg-note">
            The commitment behind these standards is set out on the{' '}
            <Link to="/about/esg">corporate commitment</Link> page, and the company behind them on{' '}
            <Link to="/about">about the group</Link>.
          </p>
        </div>
      </section>

      <section className="pg-cta">
        <div className="pg-in">
          <div>
            <span className="eyebrow">Compliance enquiry</span>
            <h2>Need a policy or a certificate</h2>
            <p>Ask the compliance desk and the current signed document is sent directly, ahead of publication here.</p>
          </div>
          <div className="pg-cta-act">
            <Link className="cta" to="/contact">Talk to us</Link>
            <div className="gfacts">
              <div><span>Documents live</span><b>0 of 6</b></div>
              <div><span>Certifications held</span><b>ISO 9001, 14001, 45001</b></div>
              <div><span>Contractor grade</span><b>CIDB G7</b></div>
              <div><span>Blocking</span><b>Text and signed PDFs from IAQ</b></div>
            </div>
          </div>
        </div>
      </section>

      <Related from="policies" />
      <Footer note="Policies concept · Brand Method" />
    </>
  )
}
