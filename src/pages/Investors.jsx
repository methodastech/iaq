import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import PageHead from '../components/PageHead.jsx'
import Related from '../components/Related.jsx'
import Icon from '../components/FlowIcon.jsx'
import '../styles/pages.css'
import '../styles/gated.css'

/* ============================================================================
   06 · Investor Relations · /investors · status: gated

   The hidden wing. Per the architecture this page is built now and sealed until
   listing day: unindexed, unlinked from the public navigation, and opened with
   one configuration change.

   !! THE GATE BELOW IS PRESENTATIONAL ONLY. !!
   It is a client-side string comparison against a passcode that ships inside the
   JavaScript bundle, so anyone who opens devtools or reads the source walks
   straight past it. It exists to demonstrate the sealed state to IAQ and it
   protects nothing. Before launch it MUST be replaced by real server-side
   authentication: documents served from behind an auth check on the server,
   sessions issued by the server, and the route itself refusing to render for an
   unauthenticated request. Do not place a single confidential document behind
   this component as it stands.

   Nothing behind the gate is defined yet (discovery B2.6, A2.15, B4.6 and B6.4
   are all recorded as "TBC") and the listing board has not been chosen, so every
   section below is a labelled placeholder slot. No announcement, financial
   figure, share price or date is invented here.
   ============================================================================ */

const STORE_KEY = 'iaq-ir-gate'
/* Demo passcode, printed on screen on purpose. Presentational only, see above. */
const DEMO_PASSCODE = 'IAQ2027'

function Slot({ icon, title, body, tag }) {
  return (
    <div className="pg-slot gslot">
      <div className="pg-slot-in">
        <span className="gslot-badge"><Icon name={icon} /></span>
        <b>{title}</b>
        <p>{body}</p>
        <span className="pg-slot-tag">{tag}</span>
      </div>
    </div>
  )
}

export default function Investors() {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    document.title = 'IAQ Group · Investor Relations · Brand Method'
    try { if (sessionStorage.getItem(STORE_KEY) === '1') setOpen(true) } catch (e) { /* private mode */ }
  }, [])

  /* Keep this route out of the index for as long as it is sealed. The tag is
     created on mount and removed on unmount, so it never leaks onto another
     page. A real launch also needs the route excluded from the XML sitemap and
     from robots.txt, which is a server concern rather than a React one. */
  useEffect(() => {
    const m = document.createElement('meta')
    m.name = 'robots'
    m.content = 'noindex, nofollow'
    m.setAttribute('data-iaq-ir', '1')
    document.head.appendChild(m)
    return () => { if (m.parentNode) m.parentNode.removeChild(m) }
  }, [])

  const submit = useCallback(e => {
    e.preventDefault()
    if (code.trim().toUpperCase() === DEMO_PASSCODE) {
      setOpen(true); setErr('')
      try { sessionStorage.setItem(STORE_KEY, '1') } catch (er) { /* private mode */ }
    } else {
      setErr('Passcode not recognised. Access is granted by IAQ.')
    }
  }, [code])

  const reseal = useCallback(() => {
    setOpen(false); setCode(''); setErr('')
    try { sessionStorage.removeItem(STORE_KEY) } catch (e) { /* private mode */ }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <>
      <Nav />

      <PageHead
        eyebrow="Investor Relations"
        title={<>Built now. <em>Sealed until listing.</em></>}
        lede="The investor wing exists in full before it is needed, so nothing is rushed at listing. It stays off the public navigation, out of the search index and behind a gate until IAQ opens it."
      />

      {!open && (
        <section className="ggate" aria-labelledby="ir-gate-h">
          <div className="pg-in">
            <div className="ggate-panel">
              <span className="ggate-lock" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="10" width="16" height="10" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><path d="M12 14v2.5" />
                </svg>
              </span>
              <span className="ggate-k">Access controlled by IAQ</span>
              <h2 id="ir-gate-h">This section opens on listing day</h2>
              <p>
                Investor Relations is complete and held sealed. Announcements, reports, governance
                documents and share information publish here the day IAQ reveals the section. Until
                then, access is granted by IAQ on request.
              </p>

              <form className="ggate-form" onSubmit={submit} noValidate>
                <div className="ggate-field">
                  <label htmlFor="ir-code">Passcode</label>
                  <input
                    id="ir-code" name="ir-code" type="password" autoComplete="off"
                    spellCheck="false" placeholder="Enter passcode"
                    value={code} onChange={e => { setCode(e.target.value); if (err) setErr('') }}
                    aria-describedby="ir-code-err"
                  />
                </div>
                <button type="submit">Unlock</button>
              </form>
              <div className="ggate-err" id="ir-code-err" role="status" aria-live="polite">{err}</div>

              <div className="ggate-demo">
                Concept demo passcode: <b>{DEMO_PASSCODE}</b><br />
                Client side only. Replace with server side authentication before launch.
              </div>

              <div className="ggate-meta">
                <div><span>Listing entity</span><b>IAQ Technology Sdn. Bhd.</b></div>
                <div><span>Listing board</span><b>Not yet selected by IAQ</b></div>
                <div><span>Indexing</span><b>noindex, nofollow while sealed</b></div>
                <div><span>Public navigation</span><b>Unlinked until reveal</b></div>
              </div>
            </div>

            <div className="ghair" />
            <p className="pg-lede">
              Two public pages already carry what an investor reads before the numbers exist: the{' '}
              <Link to="/about/leadership">board and leadership</Link> line up, and the{' '}
              <Link to="/about/esg">corporate commitment</Link> that sets out governance as an
              operating standard.
            </p>
          </div>
        </section>
      )}

      {open && (
        <>
          <section className="pg-sec tight flush">
            <div className="pg-in">
              <div className="gopen">
                <span className="gdot" aria-hidden="true" />
                <p>Gate open for this browser session &middot; concept preview &middot; no live disclosure is published</p>
                <button type="button" onClick={reseal}>Reseal</button>
              </div>
            </div>
          </section>

          <section className="pg-sec calm" aria-labelledby="ir-ann-h">
            <div className="pg-in">
              <div className="ghead">
                <div>
                  <span className="pg-k">01 / Announcements</span>
                  <h2 id="ir-ann-h">Every disclosure, in one dated stream</h2>
                  <p>The feed a shareholder checks first. Built to publish the moment IAQ has a board, a stock code and a company secretary filing on its behalf.</p>
                </div>
                <span className="pg-tag b">Awaiting content</span>
              </div>
              <div className="gslots">
                <Slot
                  icon="press" title="Announcement feed"
                  body="Dated, tagged and filterable, newest first, each entry linking to the filed document."
                  tag="Exchange announcement feed and the announcement archive · supplied by IAQ company secretary"
                />
                <Slot
                  icon="file" title="Media and price sensitive releases"
                  body="Corporate releases held apart from regulatory filings, so press and shareholders each find the right one."
                  tag="Release copy and the approval route · supplied by IAQ"
                />
              </div>
              <p className="pg-note">
                Whether a pre listing quiet period constrains what may be published here is recorded as TBC in discovery B2.6 and B4.6. Nothing publishes until IAQ confirms it.
              </p>
            </div>
          </section>

          <section className="pg-sec" aria-labelledby="ir-rep-h">
            <div className="pg-in">
              <div className="ghead">
                <div>
                  <span className="pg-k">02 / Reports</span>
                  <h2 id="ir-rep-h">The reporting library</h2>
                  <p>Annual and interim reporting kept in one place, with a stable address per document so an analyst can cite it.</p>
                </div>
                <span className="pg-tag b">Awaiting content</span>
              </div>
              <div className="gslots">
                <Slot
                  icon="file" title="Annual reports"
                  body="One entry per financial year, PDF plus a short summary, earlier years retained rather than replaced."
                  tag="Annual report PDFs by financial year · supplied by IAQ finance"
                />
                <Slot
                  icon="chart" title="Quarterly results"
                  body="Result announcements with the accompanying presentation, released on the same date as the filing."
                  tag="Quarterly result filings and results decks · supplied by IAQ finance"
                />
                <Slot
                  icon="folder" title="Prospectus and listing documents"
                  body="The offer documents, published when the listing is public and archived afterwards."
                  tag="Prospectus and listing circulars · supplied by IAQ and the principal adviser"
                />
                <Slot
                  icon="people" title="Circulars and general meetings"
                  body="Notices, circulars, proxy forms and the minutes trail for each general meeting."
                  tag="AGM and EGM notices, circulars and proxy forms · supplied by IAQ company secretary"
                />
              </div>
            </div>
          </section>

          <section className="pg-sec calm" aria-labelledby="ir-gov-h">
            <div className="pg-in">
              <div className="ghead">
                <div>
                  <span className="pg-k">03 / Governance</span>
                  <h2 id="ir-gov-h">Governance made legible</h2>
                  <p>The structures an investor tests before the numbers: who sits on the board, which committees exist, and what the company holds itself to.</p>
                </div>
                <span className="pg-tag b">Awaiting content</span>
              </div>
              <div className="gslots">
                <Slot
                  icon="people" title="Board composition"
                  body="Directors, roles, independence status and appointment dates, mirrored from the public leadership page."
                  tag="Board line up, roles, independence status and appointment dates · supplied by IAQ, discovery A2.15 recorded as TBC"
                />
                <Slot
                  icon="shield" title="Board charter and committees"
                  body="The charter, plus terms of reference for audit, nomination and remuneration."
                  tag="Board charter and committee terms of reference · supplied by IAQ company secretary"
                />
                <Slot
                  icon="file" title="Constitution and conduct"
                  body="Constitution, code of conduct, anti bribery and whistleblowing, each downloadable."
                  tag="Constitution, code of conduct, anti bribery and whistleblowing policies · supplied by IAQ legal counsel"
                />
                <Slot
                  icon="leaf" title="Sustainability reporting"
                  body="The ESG statement in its reportable form, tied back to the public commitment page."
                  tag="Sustainability statement and its reporting scope · supplied by IAQ"
                />
              </div>
              <p className="pg-note">
                Public counterparts already exist:{' '}
                <Link to="/about/leadership">board and leadership</Link>,{' '}
                <Link to="/about/esg">corporate commitment</Link>,{' '}
                <Link to="/policies">policies</Link>.
              </p>
            </div>
          </section>

          <section className="pg-sec" aria-labelledby="ir-share-h">
            <div className="pg-in">
              <div className="ghead">
                <div>
                  <span className="pg-k">04 / Share information</span>
                  <h2 id="ir-share-h">Share information</h2>
                  <p>Nothing in this block can be written until the listing board is chosen. IAQ asked which board applies and the answer is still open, so no code, price, registrar or date appears here.</p>
                </div>
                <span className="pg-tag b">Blocked on the listing board</span>
              </div>
              <div className="gslots">
                <Slot
                  icon="chart" title="Stock code and price"
                  body="Board, stock code, and the live price feed once a data source is licensed."
                  tag="Listing board, stock code and the price feed source · supplied by IAQ once the board is confirmed"
                />
                <Slot
                  icon="grid" title="Shareholding structure"
                  body="Issued capital, substantial shareholders and the distribution table as filed."
                  tag="Issued capital and the substantial shareholder table · supplied by IAQ company secretary"
                />
                <Slot
                  icon="crate" title="Share registrar"
                  body="Registrar name, address and the route for transfer or dividend enquiries."
                  tag="Share registrar name, address and contact · supplied by IAQ"
                />
                <Slot
                  icon="clock" title="Financial calendar"
                  body="Result dates, the annual meeting and any entitlement dates, published in advance."
                  tag="Financial calendar dates · supplied by IAQ finance, IPO target date recorded as TBC"
                />
              </div>
            </div>
          </section>

          <section className="pg-sec calm" aria-labelledby="ir-con-h">
            <div className="pg-in">
              <div className="ghead">
                <div>
                  <span className="pg-k">05 / IR contact</span>
                  <h2 id="ir-con-h">One named contact, not a mailbox</h2>
                  <p>Analysts and institutional shareholders reach a person. The general enquiry route stays separate, so project traffic never lands in the IR inbox.</p>
                </div>
                <span className="pg-tag b">Awaiting content</span>
              </div>
              <div className="gslots one">
                <Slot
                  icon="mail" title="Investor Relations contact"
                  body="Name, title, direct line and the dedicated IR address, plus who maintains this section day to day."
                  tag="Named IR contact, direct line, IR mailbox and the maintenance owner · supplied by IAQ, discovery B2.6 recorded as TBC"
                />
              </div>
            </div>
          </section>

          <section className="pg-cta">
            <div className="pg-in">
              <div>
                <span className="eyebrow">IR enquiry</span>
                <h2>Speak to Investor Relations</h2>
                <p>Until the section is revealed, investor and analyst enquiries route through the main contact desk and pass to IAQ directly.</p>
              </div>
              <div className="pg-cta-act">
                <Link className="cta" to="/contact">IR enquiry</Link>
                <div className="gfacts">
                  <div><span>Listing entity</span><b>IAQ Technology Sdn. Bhd.</b></div>
                  <div><span>Listing board</span><b>Not yet selected</b></div>
                  <div><span>Section status</span><b>Built, sealed, unindexed</b></div>
                  <div><span>Reveal</span><b>One configuration change</b></div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <Related from="investors" />
      <Footer note="Investor Relations concept · sealed · Brand Method" />
    </>
  )
}
