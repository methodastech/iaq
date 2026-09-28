import React from 'react'
import MarketPage from '../components/MarketPage.jsx'

/* Copy provenance
   h1 + closing line   client copy sheet, Industries row. The sheet reads
                       "hygienice"; the content file flags the typo for
                       correction before publication, so it reads "hygienic".
   lede opener         built site industries card, verbatim
   pull quote          company profile p17 pull-quote, verbatim
   requirements        company profile p17, verbatim phrases
   delivery paragraphs company profile p17, verbatim
   40,000 m2           verified reference, greenfield flavouring plant        */

export default function MarketFoodBeverage() {
  return (
    <MarketPage
      id="mkt-food-beverage"
      no="7"
      name="Food & Beverage"
      hash="fnb"
      ind="fnb"
      image="/assets/banners/mkt-food-beverage.jpg"
      title={<>Hygienic plants, <em>from intake to package</em>.</>}
      lede="Flavour and food production plants built to a hygienic regime, from intake to package."
      facts={[
        { k: 'Specification', v: 'Hygienic', sub: 'Hygienic specification rather than an ISO cleanroom class.' },
        { k: 'Largest delivered', v: '40,000 m²', sub: 'Greenfield food flavouring manufacturing plant.' },
        { k: 'Scope', v: 'CSA through waste', sub: 'Full facility scope from structure to process utilities, fire protection and waste.' },
      ]}
      why={{
        head: 'Hygiene is a building decision, not a cleaning routine',
        quote: 'The food and beverage industry relies on stringent quality and safety standards.',
        cite: 'IAQ company profile',
        body: 'Stringent quality and safety standards govern the whole facility, from the structure through the process utilities to the waste stream. They are designed in first, proven at commissioning, then maintained for the life of the plant.',
      }}
      demands={[
        'Stringent quality and safety standards',
        'Hygienic design and construction',
        'Full facility scope from CSA through process utilities and waste',
      ]}
      deliverIntro={[
        'IAQ understands the importance of adhering to these standards, and our facilities are designed and constructed with utmost cleanliness and safety in mind.',
        'We deliver the whole facility, from structure to process utilities and waste, so clients can operate with confidence.',
      ]}
      scopeTitle="Typical food and beverage scope"
      cycleLede="Hygiene is a design decision before it is a cleaning routine, which is why the layout, the finishes and the utilities are settled in stage one."
      standards={{
        head: 'A hygienic specification, not an ISO class',
        k: 'Classification',
        body: 'Food and beverage projects on the record carry a hygienic specification rather than an ISO cleanroom class. Cleanliness is designed into the layout, the finishes and the process utilities, then proven at commissioning before the first production run.',
      }}
      slot={{
        tag: 'Content slot · food and beverage',
        title: 'Food safety standards and certification',
        body: 'The named food safety standards and third-party certifications the delivered plants were built to are being confirmed directly with IAQ. This panel publishes the full set here, with the certificates attached.',
        who: 'Supplied by IAQ',
      }}
      proofLede="Published food and beverage work from the sample registry, both flavour manufacturing plants."
    />
  )
}
