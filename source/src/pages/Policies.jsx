import React, { useEffect, useState } from 'react'
import { LAUNCH, owed } from '../lib/launch.js'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import ClosingBand from '../components/ClosingBand.jsx'
import PageHead from '../components/PageHead.jsx'
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
    /* 10 Sep audit (P26): a draft for IAQ legal to approve, edit or replace. Shown as a draft. */
    draft: [
      'IAQ Technology International Sdn. Bhd. and its group companies ("IAQ") collect personal data through this website only when a visitor sends an enquiry, applies for a role or asks for a document: name, company, work email, phone number and the message itself. The site sets no advertising cookies. Analytics, if enabled, is anonymised and can be declined.',
      'The data is used to reply to the enquiry, to route it to the right IAQ team or office, and to keep a record of the correspondence. It is held for as long as the enquiry or application is open and for a reasonable period afterwards, then deleted. It is not sold and it is not used for marketing without consent.',
      'IAQ may share the data with its group companies and with service providers that host the site or deliver email, under contract and only for these purposes. Where an office outside Malaysia handles the enquiry, the data may be transferred to that country with the same protection.',
      'Under the Personal Data Protection Act 2010 a person may ask to see the data IAQ holds about them, to correct it, or to withdraw consent, by writing to the data protection contact named on this page. IAQ answers within the period the Act allows.',
    ],
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
    /* 10 Sep audit (P26): a draft for IAQ legal to approve, edit or replace. Shown as a draft. */
    draft: [
      'This website is published by IAQ Technology International Sdn. Bhd. for information about the IAQ group, its services and its track record. Content is provided in good faith and may change without notice; it is not an offer, a specification or professional advice, and any project is governed only by its signed contract.',
      'The IAQ name, marks, photographs, drawings, models and text on this site belong to IAQ or its licensors. They may be viewed and quoted for the purpose of considering IAQ as a supplier, and not otherwise reproduced or used to imply endorsement.',
      'Links to third-party sites are provided for convenience. IAQ does not control and is not responsible for their content. Project references name locations rather than clients unless the client has agreed to be named.',
      'These terms are governed by the laws of Malaysia and the courts of Malaysia have jurisdiction. Questions about these terms go to the contact named on this page.',
    ],
    note: 'Required by the site architecture. No text exists in any source.',
  },
  {
    id: 'cookies',
    title: 'Cookie and consent notice',
    sub: 'What is set, why, and how a visitor refuses it',
    icon: 'grid',
    status: 'Awaiting scope decision',
    must: 'The document must list every cookie and tag the site sets, its purpose and its lifespan, separate analytics from anything strictly necessary, and describe how consent is captured, stored and withdrawn.',
    tag: 'Cookie inventory and consent copy · supplied by IAQ legal counsel once the consent scope is agreed',
    note: 'Analytics, Search Console and cookie consent are scheduled for launch. Discovery B2.10 opened the question of what the consent banner is for, so the scope is being agreed with IAQ before the wording is drafted.',
  },
  {
    id: 'quality',
    title: 'Quality Policy',
    sub: 'The quality commitment behind the ISO 9001:2015 certification',
    icon: 'gauge',
    /* 25 Sep: the signed PDF is IAQ's own file from the live site, filed at public/docs/policies */
    status: 'Published, signed PDF',
    file: '/docs/policies/IAQ-Quality-Policy.pdf', thumb: '/assets/iaq/policies/quality-policy.jpg',
    signed: 'Signed by Ir. Tiew Soon Aik, Chief Executive Officer, 15 November 2024.',
    summary: [
      'Vision: to be a regional facilities solutions provider with engineering excellence, facilitating technological innovation and advancement in quality of life.',
      'Mission: continuous training and development of its people; adopting technological innovation and advancement in the business; strengthening the brand and its reputation; continuous improvement through knowledge sharing; energy-saving and environment-friendly operation.',
      'IAQ is committed to meeting customer and interested-party requirements, statutory and regulatory requirements and the requirements of ISO 9001:2015, enhancing customer satisfaction through quality services, and continually improving the quality management system.',
    ],
    must: 'The signed policy statement, dated, with the management representative named, published as a downloadable PDF and summarised on this page.',
    tag: 'Quality Policy PDF, signed and dated · supplied by IAQ QHSE',
    note: 'Supplied 25 Sep 2026: the signed file published on IAQ\u2019s own site, now served from this site and attached on the Corporate Commitment page.',
  },
  {
    id: 'ehs',
    title: 'EHS Policy',
    sub: 'Environment, health and safety, behind ISO 14001 and ISO 45001',
    icon: 'leaf',
    /* 25 Sep: the signed PDF is IAQ's own file from the live site, filed at public/docs/policies */
    status: 'Published, signed PDF',
    file: '/docs/policies/IAQ-EHS-Policy.pdf', thumb: '/assets/iaq/policies/ehs-policy.jpg',
    signed: 'Signed by Ir. Tiew Soon Aik, Chief Executive Officer, 15 November 2024.',
    summary: [
      'IAQ Solutions Sdn Bhd is committed to environment, health and safety as a core business function: minimising adverse impacts to the environment and protecting the health and safety of its clients, employees, workers, contractors, suppliers, visitors, the public and other interested parties, in line with the organisation\u2019s strategy and objectives.',
      'The policy is driven by EHS management principles: continual improvement and innovation in business processes; fulfilling legal and other requirements; an EHS management system to ISO 14001 and ISO 45001; continual monitoring, improvement and review of EHSMS performance, risks and opportunities; healthy and safe working conditions for the prevention of work-related injury and ill health; sustainable engineering, procurement and construction practices; eliminating hazards and reducing occupational health and safety risks; a caring culture with consultation and participation of employees, workers and interested parties.',
      'The statement is communicated to all stakeholders through the company shared folders, the website, the EHS notice boards and EHS training and awareness programmes, and reviewed periodically so it stays relevant and appropriate.',
    ],
    must: 'The signed environment, health and safety policy statement, dated, published as a downloadable PDF and summarised on this page alongside the site safety standard.',
    tag: 'EHS Policy PDF, signed and dated · supplied by IAQ QHSE',
    note: 'Supplied 25 Sep 2026: the signed file published on IAQ\u2019s own site, now served from this site and attached on the Corporate Commitment page.',
  },
  {
    id: 'whistleblowing',
    title: 'Whistleblowing Policy',
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
/* 17 Sep: the three ISO certificates arrived in IAQ's SharePoint share (Certification & Award/ISO
   Certificate). Number, dates and holder are read off the certificates themselves: they are issued
   to IAQ Solutions Sdn Bhd, the group's contracting company, at No. 9 Jalan Sungai Jeluh. The files
   are served from /docs/certificates and the first page is shown as a thumbnail. The Highwire 2026
   Safety Completion Award badge came in the same folder (ID 121543). */
const CERTS = [
  { name: 'ISO 9001:2015', meta: 'Quality management · certified by Intertek', no: 'Q903788A', since: '1 August 2015', valid: '13 June 2029',
    file: '/docs/certificates/IAQ-ISO-9001-2015-certificate.pdf', thumb: '/assets/iaq/certs/iso-9001.webp' },
  { name: 'ISO 14001:2015', meta: 'Environmental management · certified by Intertek', no: 'E903788', since: '14 June 2023', valid: '13 June 2029',
    file: '/docs/certificates/IAQ-ISO-14001-2015-certificate.pdf', thumb: '/assets/iaq/certs/iso-14001.webp' },
  { name: 'ISO 45001:2018', meta: 'Occupational health and safety · certified by Intertek', no: '0151940', since: '20 June 2023', valid: '19 June 2029',
    file: '/docs/certificates/IAQ-ISO-45001-2018-certificate.pdf', thumb: '/assets/iaq/certs/iso-45001.webp' },
  { name: 'CIDB G7', meta: 'Highest grade contractor registration, Malaysia' },
  { name: 'UKAS accredited', meta: 'Accreditation mark carried on the three ISO certificates' },
  { name: 'Highwire · 2026', meta: 'Safety Completion Award, awarded contractor ID 121543', thumb: '/assets/badge-highwire-2026.webp', badge: true },
  { name: 'Gold · OSH 2024', meta: 'Occupational safety and health recognition' },
]
const HOLDER = 'Issued to IAQ Solutions Sdn Bhd, Shah Alam'

/* 15 Sep (launch gate): the public page carries only the documents that have text, read in full; the review build keeps
   the tracker (status, what each must contain, the slots). Privacy and Terms are Brand Method drafts: IAQ legal approves them
   before go-live (DEPLOY.md says so). */
const LIST = LAUNCH ? POLICIES.filter(p => p.draft) : POLICIES

export default function Policies() {
  const [active, setActive] = useState(LIST[0].id)
  const doc = LIST.find(p => p.id === active) || LIST[0]

  useEffect(() => { document.title = 'IAQ Group · Policies · Brand Method' }, [])

  return (
    <>
      <Nav />

      <PageHead
        eyebrow="Policies"
        title={<>Everything IAQ commits to, <em>in writing.</em></>}
        lede={LAUNCH ? "The terms that govern this website and how IAQ handles personal data, with the certifications IAQ is audited against." : "Every IAQ policy at its own permanent address. Approved text and signed PDFs publish here as each one is issued."}
      />

      <section className="pg-sec" aria-labelledby="pol-index-h">
        <div className="pg-in">
          <div className="ghead">
            <div>
              <span className="pg-k">01 / Policy index</span>
              <h2 id="pol-index-h">{LAUNCH ? 'Website policies' : 'Six documents, one place'}</h2>
              <p>{LAUNCH ? 'Select a document to read it in full.' : 'Select a document to see what it must contain and where it stands today. Each one gets a permanent address, so a client, an auditor or a regulator can link straight to it.'}</p>
            </div>
            {!LAUNCH && <span className="pg-tag b">6 to publish</span>}
          </div>

          <div className="gindex" role="tablist" aria-label="Policy index">
            {LIST.map((p, i) => (
              <button
                key={p.id} type="button" className="grow" role="tab"
                id={`pol-tab-${p.id}`} aria-controls="pol-detail-panel"
                aria-selected={p.id === active} onClick={() => setActive(p.id)}
              >
                <span className="gn">{i + 1}</span>
                <span>
                  <h3>{p.title}</h3>
                  <span className="gsub">{p.sub}</span>
                </span>
                {!LAUNCH && <span className="pg-tag b">{p.status}</span>}
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
            {!LAUNCH && <span className="pg-tag b">{doc.status}</span>}
          </div>

          <div className="gdetail">
            {doc.file ? (
            /* 25 Sep: a published policy shows its signed PDF, first page beside the summary, in every mode */
            <div className="gpub">
              <a className="gcert-th gpub-th" href={doc.file} target="_blank" rel="noopener"><img src={doc.thumb} alt={`${doc.title}, first page`} loading="lazy" decoding="async" /></a>
              <div className="gdoc">
                {(doc.summary || []).map((para, i) => <p key={i}>{para}</p>)}
                <p className="gsub-note">{doc.signed}</p>
                <a className="gcert-file" href={doc.file} target="_blank" rel="noopener">Open the policy (PDF) <i aria-hidden="true">&rarr;</i></a>
                <a className="gcert-file" href={doc.file} download style={{ marginLeft: '18px' }}>Download</a>
              </div>
            </div>
            ) : LAUNCH ? (
            <div className="gdoc">
              {(doc.draft || []).map((para, i) => <p key={i}>{para}</p>)}
            </div>
            ) : (<>
            <div>
              <p className="gsub-note"><b>What the document must contain.</b> {doc.must}</p>
              <p className="gsub-note">{doc.note}</p>
              {doc.draft && (
                <details className="gdraft">
                  <summary>Draft wording for IAQ's approval, not yet a published policy</summary>
                  {doc.draft.map((para, i) => <p key={i}>{para}</p>)}
                  <p className="gdraft-note">Prepared by Brand Method on 10 September 2026 as a starting point. IAQ legal counsel approves, edits or replaces it before publication; nothing here is in force until then.</p>
                </details>
              )}
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
                  <p>This slot carries the published document. It is reserved for the approved wording exactly as IAQ issues it, so a client, an auditor or a regulator reads the authoritative text in full.</p>
                  <span className="pg-slot-tag">{doc.tag}</span>
                </div>
              </div>
            </div>
            </>)}
          </div>
        </div>
      </section>

      <section className="pg-sec" aria-labelledby="pol-cert-h">
        <div className="pg-in">
          <div className="ghead">
            <div>
              <span className="pg-k">03 / Certifications</span>
              <h2 id="pol-cert-h">Certified, on the record</h2>
              <p>{LAUNCH ? 'The standards IAQ is audited against.' : 'The standards IAQ is audited against. These are already published on the site and are stated here as fact. The certificate files behind them are published here as IAQ supplies them.'}</p>
            </div>
          </div>

          <div className="gcerts">
            {CERTS.map(c => (
              <div className={'gcert' + (c.file ? ' has-file' : '')} key={c.name}>
                {c.thumb && (
                  c.file
                    ? <a className="gcert-th" href={c.file} target="_blank" rel="noopener"><img src={c.thumb} alt={`${c.name} certificate, first page`} loading="lazy" decoding="async" /></a>
                    : <span className={'gcert-th' + (c.badge ? ' badge' : '')}><img src={c.thumb} alt={`${c.name} badge`} loading="lazy" decoding="async" /></span>
                )}
                <b>{c.name}</b>
                <span>{c.meta}</span>
                {c.no && (
                  <dl className="gcert-meta">
                    <div><dt>Certificate</dt><dd>{c.no}</dd></div>
                    <div><dt>Certified since</dt><dd>{c.since}</dd></div>
                    <div><dt>Valid until</dt><dd>{c.valid}</dd></div>
                  </dl>
                )}
                {c.file && <a className="gcert-file" href={c.file} target="_blank" rel="noopener">View the certificate (PDF) <i aria-hidden="true">&rarr;</i></a>}
              </div>
            ))}
          </div>
          <p className="gcert-holder">{HOLDER}. Each certificate carries a QR code that Intertek verifies online.</p>

          <div className="gslots">
            <div className="pg-slot gslot">
              <div className="pg-slot-in">
                <span className="gslot-badge"><Icon name="file" /></span>
                <b>Certificate library, the rest</b>
                <p>The three ISO certificates are published above with their numbers and expiry dates. Two registrations are still stated without their file.</p>
                <span className="pg-slot-tag">CIDB G7 registration certificate and the Gold OSH 2024 certificate · supplied by IAQ QHSE</span>
              </div>
            </div>
            <div className="pg-slot gslot">
              <div className="pg-slot-in">
                <span className="gslot-badge"><Icon name="chart" /></span>
                <b>Safety and ESH award record</b>
                <p>The award list referenced in discovery, presented by year with the issuing body, so the safety record stands on named, dated evidence.</p>
                <span className="pg-slot-tag">Full ESH award list and the certificate files, to follow as a separate attachment noted in discovery A2.12 · supplied by IAQ</span>
              </div>
            </div>
          </div>

          <p className="pg-note">
            The commitment behind these standards is set out on the{' '}
            <Link to="/about/esg">ESG commitment</Link> page, and the company behind them on{' '}
            <Link to="/about">about the group</Link>.
          </p>
        </div>
      </section>
      <ClosingBand note="Policies concept · Brand Method" />
    </>
  )
}
