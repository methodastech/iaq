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
      no="06"
      name="Bio LifeScience"
      hash="pharma"
      ind="pharma"
      image="/assets/industries/pharma.webp"
      title={<>Ultra-clean, and <em>heavily regulated</em>.</>}
      lede="GMP parenteral, labs and medical device plants. Explore how we engineer the facilities that meet the strictest regulatory standards."
      facts={[
        { k: 'Cleanroom classes', v: 'ISO 5 to ISO 8', sub: 'Class 100 to Class 100K on recorded projects.' },
        { k: 'GMP grades', v: 'Grade B, C and D', sub: 'Held across recorded pharmaceutical and life science work.' },
        { k: 'Range', v: 'Labs to production', sub: 'Research labs, tissue culture, parenteral lines and medical device plants.' },
      ]}
      why={{
        head: 'Contamination control is patient safety',
        quote: 'Pharmaceutical Manufacturing Demands Pristine, Regulated Environments To Prevent Contamination.',
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
        "IAQ's expertise in cleanroom construction, incorporating regulatory guideline specifications, guarantees that these facilities adhere to the highest cleanliness standards and comply with stringent regulatory requirements.",
        "In the realm of pharmaceuticals, precision is paramount. IAQ specializes in crafting environments that meet the stringent demands of pharmaceutical facilities. From research labs to production spaces, we're committed to creating spaces that uphold the tightest standards of cleanliness, safety, and functionality.",
      ]}
      scopeTitle="Typical Bio LifeScience scope"
      cycleLede="Regulated work is won or lost in the documentation trail, so every stage produces the record the validation team needs at handover."
      standards={{
        head: 'ISO class and GMP grade, held together',
        k: 'Cleanroom classification',
        body: 'Recorded projects run from ISO 5 to ISO 8, Class 100 to Class 100K, alongside GMP Grades B, C and D. The pressure cascade, the finishes and the clean utilities are designed to the regulatory guideline from the first drawing rather than retrofitted to it later.',
        k2: 'Validation-ready handover',
        body2: 'We execute testing and commissioning based on our established programme to ensure that constructed facility operates as intended and at its optimal whilst meets all specified requirements. Identification and rectification of any issues or deficiencies, ensuring functionality before the facility is handed over for operation.',
      }}
      proofLede="Published Bio LifeScience projects from the sample registry, from small volume parenteral through to tissue culture laboratories."
    />
  )
}
