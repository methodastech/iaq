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
      no="1"
      name="Semiconductor"
      hash="semiconductor"
      ind="semiconductor"
      /* 20 Oct (Bazil: "change the image"): the empty yellow lithography room did not read as a semiconductor fab. Now an
         operating wafer fab: rows of process tools, overhead wafer transport, engineers in cleanroom suits at a tool, matte
         floor, no logos. Generated in ChatGPT, so it is a representation; the old banner stays in the folder */
      image="/assets/banners/mkt-semiconductor-fab.jpg"
      /* 20 Oct (IAQ amendment sheet, Semiconductor · Hero Banner; IAQ: "substantiate all project-size, class, capacity and
         performance claims"): IAQ's header and line, and the figures strip (ISO 3 to 7, ISO Class 1, 43,000 m2, registry) is gone */
      title={<em>Semiconductor</em>}
      lede="Supporting Facilities That Power Modern Technology"
      hideRegistry
      /* 20 Oct (IAQ amendment sheet, Semiconductor · Industry Overview): IAQ's paragraph, in place of "Cleanliness, efficiency and
         safety, held at fab speed", its quote and the company-profile label */
      whyKick={null}
      why={{
        head: 'Industry Overview',
        body: 'Semiconductor manufacturing demands precise environmental control, reliable utility infrastructure and seamless equipment integration. As technology advances and production requirements become increasingly complex, facilities must be designed and operated to meet the highest standards of performance and reliability.',
      }}
      /* 20 Oct (IAQ amendment sheet, Semiconductor · 3rd Section, Key Capabilities, Importance): IAQ's sections in its order and
         words, in place of the demand tiles, "One accountable team" and the typical scope. Spelling slip only corrected ("supports"). */
      whyMore={{
        head: 'How IAQ Supports Semiconductor Manufacturing',
        body: 'Through EPC, PCU & TTI and Energy Management solutions, IAQ supports semiconductor facilities across the full lifecycle, from facility development and utility infrastructure to manufacturing readiness and operational optimisation.',
      }}
      demandsHead="IAQ Key Capabilities"
      demands={[
        { label: 'Wafer Fabrication Facilities', icon: 'chip' }, { label: 'Advanced Packaging Utilities', icon: 'layers' },
        { label: 'Process Critical Utilities', icon: 'pcuUnit' }, { label: 'Total Tool Installation', icon: 'link' },
        { label: 'Cleanroom Infrastructure', icon: 'filter' }, { label: 'Manufacturing Readiness', icon: 'check' },
      ]}
      deliverKick={null}
      deliverHead="The Importance of Manufacturing Readiness"
      deliverIntro={[
        'Successful semiconductor production depends on the seamless integration of facilities, utilities and manufacturing equipment. A well-prepared facility reduces risk, accelerates start-up and supports long-term operational performance.',
      ]}
      hideScope
      /* 21 Oct (client review, Sunny, on "ISO 3 to ISO 7, proven by test": "What test to prove?", "What is this grammar, run
         from what?", "I hope in a school"): the standards section and its class chips are gone; the hero's figures went on 20 Oct */
      proofLede="Published semiconductor projects from the sample registry, each one linked to its full record."
    />
  )
}
