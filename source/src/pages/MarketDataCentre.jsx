import React from 'react'
import MarketPage from '../components/MarketPage.jsx'

/* Copy provenance
   h1 + closing line   client copy sheet, Industries row. The sheet reads
                       "Discover how engineer cooling", a word is missing in
                       the source and the content file flags it for rewrite
                       before publication. Corrected to "how we engineer".
   lede opener         built site industries card, verbatim
   pull quote          company profile p12 pull-quote, verbatim
   requirements        company profile p12, verbatim phrases
   delivery paragraphs company profile p12, verbatim
   160 MW              verified reference, client confidential, published by
                       scale only per the confidentiality rule                */

export default function MarketDataCentre() {
  return (
    <MarketPage
      id="mkt-data-centre"
      no="2"
      name="Data Centre"
      hash="data-centre"
      ind="data-centre"
      image="/assets/banners/mkt-data-centre.jpg"
      /* 20 Oct (IAQ amendment sheet, Data Centre · Hero Banner, Industry Overview, Capabilities, Importance): IAQ's sections, in
         its order and words. The figures strip (160 MW and 9.6 MW, which the 13 Oct review said contradict each other) is gone.
         Spelling slips only corrected ("artificial", "capable", "data centre performance depends"). */
      title={<em>Data Centres</em>}
      lede="Enabling Resilient Digital Infrastructure"
      hideRegistry
      whyKick={null}
      why={{
        head: 'Industry Overview',
        body: 'As demand for cloud computing, artificial intelligence and digital services continues to grow, data centres require highly reliable infrastructure capable of supporting uninterrupted operations.',
      }}
      demandsHead="IAQ Key Capabilities"
      demands={[
        { label: 'Mission Critical Infrastructure', icon: 'server' }, { label: 'Cooling Systems', icon: 'snow' },
        { label: 'Utility Infrastructure', icon: 'sysPcw' }, { label: 'EPC Delivery', icon: 'epcUnit' }, { label: 'Energy Optimisation', icon: 'power' },
      ]}
      deliverKick={null}
      deliverHead="Why Infrastructure Reliability Matters"
      deliverIntro={[
        'Data centre performance depends on resilient power, cooling and support infrastructure designed to maintain uptime and operational continuity.',
      ]}
      hideScope
      /* 20 Oct (client review, Sunny, on "No cleanroom class. A different bar entirely.": "You declare there is on the first page,
         why the deviation now", "This is AI telling you and you just copy paste to me?"): the standards section and its content
         slot are gone; and on the data hall photograph ("So not our project?"): it was a generated still, so the band is off */
      hideBand
      proofLede="Published data centre work from the sample registry. The hyperscale project stands on the record by scale alone, 160 MW, held under client confidentiality."
    />
  )
}
