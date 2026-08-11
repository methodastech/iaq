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
      no="05"
      name="District Cooling & Heating"
      hash="district-cooling"
      ind="district-cooling"
      image="/assets/industries/district-cooling.webp"
      title={<>Powering comfort <em>at scale</em>.</>}
      lede="Including Malaysia's largest district cooling centre. See how we design efficient, centralized cooling for entire communities."
      facts={[
        { k: 'Flagship', v: "Malaysia's largest", sub: 'District cooling centre, Kuala Lumpur.' },
        { k: 'Regional first', v: 'First in Southeast Asia', sub: 'Co-generative plant, delivered in Malaysia.' },
        { k: 'Classification', v: 'Not applicable', sub: 'Energy infrastructure rather than a classified environment.' },
      ]}
      why={{
        head: 'Efficiency at scale, held for decades',
        quote: 'Recognizing The Crucial Role These Systems Play in Sustainable Urban Development.',
        cite: 'IAQ company profile',
        body: 'One central plant, cooling or heating multiple buildings at once. Efficiency at scale is the product, and it has to hold for decades rather than for a commissioning week, which is why operation and maintenance are part of the same contract.',
      }}
      demands={[
        'Centralised plant serving multiple buildings',
        'Efficiency at scale',
        'Long-term operation and maintenance',
        'Sustainable urban development outcomes',
      ]}
      deliverIntro={[
        'IAQ Group extends its expertise to District Cooling and Heating, recognizing the crucial role these systems play in sustainable urban development.',
        'Our specialized approach involves cutting-edge technology and meticulous planning to ensure efficient district energy solutions. We provide comprehensive services that align with the evolving needs of this vital industry, contributing to environmentally conscious and energy-efficient solutions for our clients.',
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
        body: 'Installed capacity in refrigeration tons, the number of buildings connected and the measured operating efficiency of the delivered plants are not corroborated in the client-supplied documents. This panel holds them once they are verified.',
        who: 'Supplied by IAQ',
      }}
      proofLede="Published district cooling and co-generation work from the sample registry."
    />
  )
}
