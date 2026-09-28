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
      title={<>Regulated facilities, <em>proven by the record</em>.</>}
      lede="GMP parenteral suites, laboratories and medical device plants, with the validation record produced at every stage."
      facts={[
        { k: 'Cleanroom classes', v: 'ISO 5 to ISO 8', sub: 'Class 100 to Class 100K on recorded projects.' },
        { k: 'GMP grades', v: 'Grade B, C and D', sub: 'Held across recorded pharmaceutical and life science work.' },
        { k: 'Range', v: 'Labs to production', sub: 'Research labs, tissue culture, parenteral lines and medical device plants.' },
      ]}
      why={{
        head: 'Contamination control is patient safety',
        quote: 'Pharmaceutical manufacturing demands pristine, regulated environments to prevent contamination.',
        cite: 'IAQ company profile',
        body: 'Regulatory guideline specifications set the standard here, not preference. Research labs and production spaces are held to the same discipline, and the documentation has to prove it long after the builders have left.',
      }}
      demands={[
        'Regulatory guideline specifications',
        'Highest cleanliness standards',
        'GMP grades',
        'Research labs through to production spaces',
      ]}
      deliverIntro={[
        "IAQ builds cleanrooms to regulatory guideline specifications, so these facilities meet the highest cleanliness standards and stringent regulatory requirements.",
        "In pharmaceuticals, precision is paramount. IAQ specialises in environments that meet the stringent demands of pharmaceutical facilities. From research labs to production spaces, they are held to the tightest standards of cleanliness, safety and function.",
      ]}
      scopeTitle="Typical Bio LifeScience scope"
      cycleLede="Regulated work is proved in the documentation trail, so every stage produces the record the validation team needs at handover."
      standards={{
        head: 'ISO class and GMP grade, held together',
        k: 'Cleanroom classification',
        body: 'Recorded projects run from ISO 5 to ISO 8, Class 100 to Class 100K, alongside GMP Grades B, C and D. The pressure cascade, the finishes and the clean utilities are designed to the regulatory guideline from the first drawing rather than retrofitted to it later.',
        k2: 'Validation-ready handover',
        body2: 'We test and commission to our established programme. It proves the facility operates as intended, at its best, and meets every specified requirement. Anything the programme identifies is resolved and verified, so the facility is fully functional when it is handed over.',
      }}
      proofLede="Published Bio LifeScience projects from the sample registry, from small volume parenteral through to tissue culture laboratories."
    />
  )
}
