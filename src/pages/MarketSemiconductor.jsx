import React from 'react'
import MarketPage from '../components/MarketPage.jsx'

/* Copy provenance
   h1 + closing line   client copy sheet, Industries row, verbatim
   lede opener         built site industries card, verbatim
   pull quote          company profile p11 pull-quote, verbatim
   requirements        company profile p11, verbatim phrases
   delivery paragraphs company profile p11, verbatim
   classes             verified content JSON, iso_class plus discovery A2.7 */

export default function MarketSemiconductor() {
  return (
    <MarketPage
      id="mkt-semiconductor"
      no="01"
      name="Semiconductor"
      hash="semiconductor"
      ind="semiconductor"
      image="/assets/industries/semiconductor.webp"
      title={<>Nanometer precision, delivered at <em>breakneck speed</em>.</>}
      lede="Wafer fabs, backend plants, ISO 3 to 6 cleanrooms. See how we build the cleanrooms behind the chips."
      facts={[
        { k: 'Cleanroom classes', v: 'ISO 3 to ISO 7', sub: 'Class 1 to Class 10K across delivered projects.' },
        { k: 'Highest delivered', v: 'ISO Class 1', sub: 'The highest standard of cleanroom IAQ states it has built and delivered for a semiconductor project.' },
        { k: 'Largest delivered', v: '43,000 m²', sub: 'Backend test, probe and assembly plant, Malaysia.' },
      ]}
      why={{
        head: 'Cleanliness, efficiency and safety, held at fab speed',
        quote: 'Semiconductor Technology Evolves at Breakneck Speed.',
        cite: 'IAQ company profile',
        body: 'All three are settled at design stage, when the class, the airflow and the utility routes are fixed, rather than on site once the tools start arriving. A fab that has to be reworked to reach its class has already lost the schedule.',
      }}
      demands={[
        'Cleanliness to the tightest ISO classes',
        'Efficiency and schedule certainty on fab ramp-up',
        'Safety on live and brownfield fab sites',
        'Facilities optimized for complex fabrication processes',
      ]}
      deliverIntro={[
        'IAQ Group offers streamlined project management, cutting-edge construction methods, and a dedicated team to ensure client stays ahead of the curve.',
        'We are a specialized engineering and construction company for semiconductor facilities, focusing on cleanliness, efficiency, and safety. Our design and construction spaces are optimized to facilitate complex semiconductor fabrication processes, providing the ideal facility for innovation to thrive.',
      ]}
      scopeTitle="Typical semiconductor scope"
      cycleLede="The same six stages carry a fab from the first concept drawing to the tools hookup that feeds the next expansion. Open any stage to see how it runs."
      standards={{
        head: 'ISO 3 to ISO 7, proven by test',
        k: 'Cleanroom classification',
        body: 'Delivered semiconductor projects run from ISO 3 to ISO 7, Class 1 to Class 10K. IAQ states it has built the highest standard of cleanroom, ISO Class 1, for a semiconductor project, and delivered it successfully. Classification is proven by test at commissioning, never assumed from the design.',
        k2: 'How the class is held',
        body2: 'We execute testing and commissioning based on our established programme to ensure that constructed facility operates as intended and at its optimal whilst meets all specified requirements. Identification and rectification of any issues or deficiencies, ensuring functionality before the facility is handed over for operation.',
      }}
      proofLede="Published semiconductor projects from the sample registry, each one linked to its full record."
    />
  )
}
