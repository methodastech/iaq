import React from 'react'
import MarketPage from '../components/MarketPage.jsx'

/* Copy provenance
   h1 + closing line   client copy sheet, Industries row, verbatim
   lede opener         built site industries card, verbatim
   pull quote          company profile p14 pull-quote, verbatim
   requirements        company profile p14, verbatim phrases
   delivery paragraphs company profile p14, verbatim
   Left out on purpose the RM310 million value, the 56,000 parties served and
   the 25-year maintenance mandate. Those appear only in the built about-page
   concept and are not corroborated in any client-supplied document.          */

export default function MarketDistrictCooling() {
  return (
    <MarketPage
      id="mkt-district-cooling"
      no="5"
      name="District Cooling & Heating"
      hash="district-cooling"
      ind="district-cooling"
      image="/assets/banners/mkt-district-cooling.jpg"
      /* 20 Oct (IAQ amendment sheet, District Cooling & Heating · Hero Banner) */
      title={<>District Cooling <em>&amp; Heating</em></>}
      lede="Advancing Sustainable Urban Infrastructure"
      /* 20 Oct ("remove", on the figures under the hero): no figures strip, the registry figure included */
      hideRegistry
      /* 20 Oct (IAQ amendment sheet, District Cooling & Heating · Industry Overview, Key Capabilities, Importance): IAQ's three
         sections, in its order and words. Spelling slips only corrected ("centralised", "operational"). */
      whyKick={null}
      why={{
        head: 'Industry Overview',
        body: 'District cooling and heating systems are essential components of sustainable urban infrastructure, providing centralised thermal energy to support commercial developments, residential communities, healthcare facilities, educational campuses and industrial developments. By improving energy efficiency and reducing environmental impact, these systems help cities and organisations meet long-term sustainability and operational objectives.',
      }}
      demandsHead="IAQ Key Capabilities"
      demands={[
        { label: 'District Energy Systems', icon: 'factory' }, { label: 'Cooling Infrastructure', icon: 'snow' },
        { label: 'Energy Management', icon: 'power' }, { label: 'EPC Delivery', icon: 'epcUnit' }, { label: 'Lifecycle Support', icon: 'cycle' },
      ]}
      deliverKick={null}
      deliverHead="Why Energy Efficiency Matters"
      deliverIntro={[
        'District cooling and heating systems help optimise energy use, improve reliability and support long-term sustainability objectives.',
      ]}
      hideScope
      standards={{
        head: 'Measured in efficiency, not in particles',
        k: 'Classification',
        body: 'Cleanroom classification does not apply to district energy. These plants are judged on efficiency at scale, on availability across every connected building, and on the cost of the energy delivered across a long operating life.',
      }}
      slot={{
        tag: 'Content slot · district cooling',
        title: 'Plant capacity and efficiency record',
        body: 'Installed capacity in refrigeration tons, the number of buildings connected and the measured operating efficiency of the delivered plants are being verified with IAQ before publication. This panel carries each figure the moment it is confirmed.',
        who: 'Supplied by IAQ',
      }}
      proofLede="Published district cooling and co-generation work from the sample registry."
    />
  )
}
