import React from 'react'
import MarketPage from '../components/MarketPage.jsx'

/* Copy provenance
   h1 + closing line   client copy sheet, Industries row, verbatim
   lede opener         built site industries card, verbatim
   pull quote          company profile p16 pull-quote, verbatim
   requirements        company profile p16, verbatim phrases
   delivery paragraphs company profile p16, verbatim
   Naming: the profile, the live site and the copy sheet all still say
   "Pharmaceuticals & Hospitals". The client's July correction renames the
   sector "Bio LifeScience", so the page uses that. The registry still tags
   this work "Pharma & Hospitals", which is why the registry link says so.   */

export default function MarketBioLifescience() {
  return (
    <MarketPage
      id="mkt-bio-lifescience"
      no="6"
      name="Bio LifeScience"
      hash="pharma"
      ind="pharma"
      image="/assets/banners/mkt-bio-lifescience.jpg"
      /* 20 Oct (IAQ amendment sheet, Bio LifeScience · Hero Banner) */
      title={<>BioLife <em>Science</em></>}
      lede="Enabling Innovation Through Controlled Environments"
      /* 20 Oct ("remove", on the figures under the hero): no figures strip, the registry figure included */
      hideRegistry
      /* 20 Oct (IAQ amendment sheet, Bio LifeScience · Industry Overview, Key Capabilities, Importance): IAQ's three sections,
         in its order and words. Spelling slips only corrected ("increasingly important", "success"). */
      whyKick={null}
      why={{
        head: 'Industry Overview',
        body: 'The BioLife Science sector continues to drive innovation across healthcare, biotechnology, pharmaceuticals and research. Facilities within this sector demand highly controlled environments, reliable utility infrastructure and consistent operational performance to support research, development and manufacturing activities. As regulatory and technological advancement evolve, facility reliability and environmental control have become increasingly important to long-term success.',
      }}
      demandsHead="IAQ Key Capabilities"
      demands={[
        { label: 'Controlled Environment', icon: 'filter' }, { label: 'Research Facilities', icon: 'flask' },
        { label: 'Manufacturing Facilities', icon: 'factory' }, { label: 'Utility Infrastructure', icon: 'sysPcw' }, { label: 'EPC Delivery', icon: 'epcUnit' },
      ]}
      deliverKick={null}
      deliverHead="Why Precision Matters"
      deliverIntro={[
        'Life science environments depend on reliable infrastructure, environmental control and operational consistency.',
      ]}
      hideScope
      /* 21 Oct ("remove"): the "ISO class and GMP grade, held together" section is off the page */
      proofLede="Published Bio LifeScience projects from the sample registry, from small volume parenteral through to tissue culture laboratories."
    />
  )
}
