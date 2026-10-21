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
      /* 20 Oct (IAQ amendment sheet, Food & Beverage · Hero Banner) */
      title={<>Food &amp; <em>Beverage</em></>}
      lede="Supporting Safe and Reliable Production Environments"
      /* 20 Oct (client review, Sunny: "just remove all the metrics footer"): no figures under the hero, the registry
         figure included, so the strip is not drawn */
      hideRegistry
      /* 20 Oct (IAQ amendment sheet, Food & Beverage · Industry Overview, Key Capabilities, Importance): IAQ's three sections,
         in its order and words, in place of "Hygiene is a building decision", its quote and tiles, and "One accountable team".
         Spelling slip only corrected ("efficiency"). */
      whyKick={null}
      why={{
        head: 'Industry Overview',
        body: 'Food and beverage manufacturing facilities must balance production efficiency, product quality and operational reliability while meeting stringent hygiene and safety requirements. As consumer expectations, sustainability priorities and production demands continue to evolve, organisations require manufacturing environments that support consistent operations, supply chain resilience and long-term growth.',
      }}
      demandsHead="IAQ Key Capabilities"
      demands={[
        { label: 'Manufacturing facilities', icon: 'factory' }, { label: 'Utility Infrastructure', icon: 'sysPcw' },
        { label: 'Process Environments', icon: 'flask' }, { label: 'Energy Management', icon: 'power' }, { label: 'EPC Delivery', icon: 'epcUnit' },
      ]}
      deliverKick={null}
      deliverHead="Why Operational Continuity Matters"
      deliverIntro={[
        'Food and beverage production relies on reliable infrastructure that supports product quality, efficiency and uninterrupted operations.',
      ]}
      hideScope
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
