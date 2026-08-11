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
      no="02"
      name="Data Centre"
      hash="data-centre"
      ind="data-centre"
      image="/assets/industries/data-centre.webp"
      title={<>Where uptime is <em>everything</em>.</>}
      lede="Cooling, power and controlled environments at scale. Discover how we engineer cooling and reliability for the digital world."
      facts={[
        { k: 'Largest delivered', v: '160 MW', sub: 'Hyperscale data centre in Malaysia. Client confidential, published by scale only.' },
        { k: 'Also delivered', v: '9.6 MW', sub: 'the data centre campus phase 1, chilled and condenser water piping works.' },
        { k: 'Cleanroom class', v: 'Not applicable', sub: 'Delivered data centre projects are recorded as Not Applicable for cleanroom classification.' },
      ]}
      why={{
        head: 'Heat management is the job, and it never pauses',
        quote: 'Empowering the Digital Future with Precision, Security, and Efficiency in Data Center Excellence.',
        cite: 'IAQ company profile',
        body: 'Precision, data security, reliability and operational efficiency are the four the profile names. Cooling carries all four at once, which is why heat management sets the pace of the build rather than following it.',
      }}
      demands={[
        'Absolute precision',
        'Highest standards for data security, reliability and operational efficiency',
        'Heat management',
        'Energy efficiency and reduced environmental footprint',
      ]}
      deliverIntro={[
        'Fueled by incremental global demand for higher computing and data processing, storage and sharing to support information technology infrastructures and operations, data centers are on the rise, demanding absolute precision and the highest standards for data security, reliability, and operational efficiency.',
        'Heat management is critical. We employ cutting-edge cooling technologies to optimize energy efficiency and reduce the environmental footprint of data centers.',
      ]}
      scopeTitle="Typical data centre scope"
      cycleLede="Cooling plant, distribution and controls run through the same six stages, with commissioning carrying the weight because the load arrives whether the plant is ready or not."
      standards={{
        head: 'No cleanroom class. A different bar entirely.',
        k: 'Classification',
        body: 'Cleanroom classification does not apply here, and every delivered data centre project is recorded as Not Applicable. The bar is set instead by the four things the sector is judged on: absolute precision, data security, reliability and operational efficiency.',
      }}
      slot={{
        tag: 'Content slot · data centre',
        title: 'Uptime tier and commissioning evidence',
        body: 'The tier rating, redundancy topology and level-by-level commissioning evidence for the delivered data centre projects are not stated in any supplied source. This panel holds them once they are confirmed, alongside the cooling technologies named on each project.',
        who: 'Supplied by IAQ',
      }}
      proofLede="Published data centre work from the sample registry. The confidential hyperscale project is recorded by scale only and does not appear as a card."
    />
  )
}
