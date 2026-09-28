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
      title={<>District cooling, <em>run for decades</em>.</>}
      lede="Centralised cooling plant for districts and campuses, including Malaysia's largest district cooling centre."
      facts={[
        { k: 'Flagship', v: "Malaysia's largest", sub: 'District cooling centre, Kuala Lumpur.' },
        { k: 'Regional first', v: 'First in Southeast Asia', sub: 'Co-generative plant, delivered in Malaysia.' },
        { k: 'Classification', v: 'Energy infrastructure', sub: 'Measured in kilowatt hours, as a plant rather than a classified environment.' },
      ]}
      why={{
        head: 'Efficiency at scale, held for decades',
        quote: 'Recognising the crucial role these systems play in sustainable urban development.',
        cite: 'IAQ company profile',
        body: 'One central plant, cooling or heating multiple buildings at once. Efficiency at scale is the product, and it has to hold for decades rather than for a commissioning week. That is why operation and maintenance are part of the same contract.',
      }}
      demands={[
        'Centralised plant serving multiple buildings',
        'Efficiency at scale',
        'Long-term operation and maintenance',
        'Sustainable urban development outcomes',
      ]}
      deliverIntro={[
        'IAQ Group extends its expertise to district cooling and heating, recognising the crucial role these systems play in sustainable urban development.',
        'We combine current plant technology with meticulous planning to deliver efficient district energy. Our services follow the industry as its needs change, and help clients cut energy use and environmental impact.',
      ]}
      scopeTitle="Typical district cooling scope"
      cycleLede="District energy is the one market where the fifth stage is the point. Maintenance runs for decades after handover, and what it learns goes back into the next plant."
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
