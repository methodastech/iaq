import React from 'react'
import MarketPage from '../components/MarketPage.jsx'

/* Copy provenance
   h1 + closing line   client copy sheet, Industries row, verbatim
   lede opener         built site industries card, verbatim
   pull quote          company profile p15 pull-quote, verbatim
   requirements        company profile p15, verbatim phrases
   delivery paragraphs company profile p15, verbatim
   classes             ISO 8 recorded in the content file on solar cell work,
                       ISO 6 recorded on the published module plant. Both are
                       stated, neither is averaged into a single number.      */

export default function MarketPhotovoltaics() {
  return (
    <MarketPage
      id="mkt-photovoltaics"
      no="04"
      name="Photovoltaics"
      hash="photovoltaic"
      ind="photovoltaic"
      image="/assets/industries/photovoltaic.webp"
      title={<>Solar moves fast. <em>So do we.</em></>}
      lede="Solar cell and module production facilities. See how we keep pace with an ever-evolving industry."
      facts={[
        { k: 'Materials handled', v: 'Silicon, cadmium, silver', sub: 'Managed with toxic material and waste controls through design and construction.' },
        { k: 'Cleanroom class', v: 'ISO 6 to ISO 8', sub: 'Class 1K on the published module plant, Class 100K recorded on solar cell production.' },
        { k: 'Delivered in', v: 'the northern corridor, Kedah', sub: 'Solar panel manufacturing plant, KMW building M&E works.' },
      ]}
      why={{
        head: 'The process changes faster than the building',
        quote: 'The Solar Industry is Constantly Evolving, With New Materials and Technologies Emerging Regularly.',
        cite: 'IAQ company profile',
        body: 'Silicon, cadmium and silver each carry environmental and health considerations if they are not managed properly. Handling them safely is a design decision taken alongside the local regulations that govern the site, not a procedure written afterwards.',
      }}
      demands={[
        'Safe handling of silicon, cadmium and silver',
        'Compliance with local regulations',
        'Toxic material and waste management',
        'Optimized energy output and efficiency',
      ]}
      deliverIntro={[
        'The manufacturing of solar panels involves the use of certain materials, such as silicon, cadmium, and silver, which can have environmental and health considerations if not managed properly.',
        "IAQ's expertise in solar technology, knowledge of local regulations, and a commitment to optimizing energy output and efficiency, along with our knowledge in managing toxic materials and waste ensuring the development of reliable and efficient facility for Solar Panel manufacturing.",
      ]}
      scopeTitle="Typical photovoltaics scope"
      cycleLede="Solar plants change process faster than most sectors, so design and procurement are run to keep the facility able to take the next generation of tooling."
      standards={{
        head: 'Classified where the process needs it',
        k: 'Cleanroom classification',
        body: 'The published module plant runs at ISO 6, Class 1K, and solar cell production is recorded at ISO 8, Class 100K. Where the process does not need a classified environment, the record shows Not Applicable and the control effort moves to materials handling and waste instead.',
      }}
      slot={{
        tag: 'Content slot · photovoltaics',
        title: 'Regulatory consents and waste approvals',
        body: 'The named local authority consents, the toxic material handling approvals and the waste treatment standards held on the delivered solar facilities are not stated in any supplied source. This panel holds them once they are confirmed.',
        who: 'Supplied by IAQ',
      }}
      proofLede="Published photovoltaics work from the sample registry. Further solar cell and module projects sit in the wider record and migrate at launch."
    />
  )
}
