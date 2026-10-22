import React from 'react'
import MarketPage from '../components/MarketPage.jsx'

/* Copy provenance
   h1 + closing line   client copy sheet, Industries row, verbatim
   lede opener         built site industries card, verbatim
   pull quote          company profile p13 pull-quote, verbatim
   requirements        company profile p13, verbatim phrases
   delivery paragraphs company profile p13, verbatim
   62,000 m2           verified reference, Sweden gigafactory dry room        */

export default function MarketEvBattery() {
  return (
    <MarketPage
      id="mkt-ev-battery"
      no="3"
      name="EV Battery"
      hash="ev-battery"
      ind="ev-battery"
      image="/assets/banners/mkt-ev-battery.jpg"
      /* 20 Oct (IAQ amendment sheet, EV Battery · Hero Banner) */
      title={<>EV Battery <em>Manufacturing</em></>}
      lede="Supporting the Future of Electrification"
      /* 20 Oct (client review, Sunny: "misaligned with Recorded Class ISO 7", "Dry room are not ISO classified, they are
         designed based on ISO standard as reference"): the figures strip is gone, the registry figure included */
      hideRegistry
      /* 20 Oct (IAQ amendment sheet, EV Battery · Industry Overview, Key Capabilities, Importance): IAQ's three sections, in its
         order and words. Spelling slips only corrected ("Electrification", "achieving"). */
      whyKick={null}
      why={{
        head: 'Industry Overview',
        body: 'The global transition towards electrification continues to accelerate demand for advanced battery manufacturing facilities. These environments require highly controlled conditions, specialised utility systems and scalable infrastructure to support evolving production technologies, safety requirements and operational efficiency. As manufacturing capacity expands worldwide, facility performance and reliability remain critical to achieving sustainable, high-volume production.',
      }}
      demandsHead="IAQ Key Capabilities"
      demands={[{ label: 'Dry Room Facilities', icon: 'dewpoint' }, { label: 'Manufacturing Infrastructure', icon: 'factory' }, { label: 'Critical Utility Systems', icon: 'sysPcw' }, { label: 'EPC Delivery', icon: 'epcUnit' }]}
      deliverKick={null}
      deliverHead="Why Production Readiness Matters"
      deliverIntro={[
        'Battery manufacturing requires specialised environments, stringent safety controls and highly coordinated facility operations to support large-scale production.',
      ]}
      hideScope
      /* 21 Oct (client review, Sunny, on "Dry room, not cleanroom": "this explanation is for BM or for IAQ's audience"): the
         standards section is gone; and the dry room still above it ("same comment as before", generated, not IAQ's project) */
      proofLede="Published EV battery projects from the sample registry, from European gigafactory dry rooms to lithium cell facilities in Southeast Asia."
    />
  )
}
