import React, { useEffect } from 'react'
import Nav from '../components/Nav.jsx'
import ClosingBand from '../components/ClosingBand.jsx'
import PageHead from '../components/PageHead.jsx'
import Faq from '../components/Faq.jsx'
import '../styles/pages.css'
import '../styles/services-map.css'

/* ============================================================================
   /faq · 26 Oct 2026. IAQ review (NR, page 005), on the Services page's "Questions clients ask": "Remove this FAQ or create
   a dedicated FAQ section". The questions keep a page of their own: the same Faq (data/codex.js FAQ, its sticky group
   index and its FAQPage structured data), off the Services page, linked from the footer's "What we do" column and from
   the Contact page. The banner is IAQ's own Shah Alam office (Project Photos, site-office-4660), the people who answer.
   ============================================================================ */
export default function FaqPage() {
  useEffect(() => { document.title = 'IAQ Group · Frequently Asked Questions' }, [])
  return (
    <>
      <Nav />
      <PageHead
        title={<>Frequently Asked <em>Questions</em></>}
        lede="The questions facility owners ask before they engage IAQ, answered. Any other question, ask."
        figure={{ src: '/assets/iaq/site-office-4660.webp', video: '/assets/videos/banners/faq-site-office.mp4', alt: 'The IAQ office in Shah Alam: open desks with red chairs', hero: true }} />
      <section className="pg-sec sm-faq faq-page" aria-label="Questions and answers">
        <div className="pg-in">
          <Faq />
        </div>
      </section>
      <ClosingBand note="Frequently Asked Questions, Brand Method" />
    </>
  )
}
