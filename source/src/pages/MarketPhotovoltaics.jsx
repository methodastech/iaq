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
      no="4"
      name="Photovoltaics"
      hash="photovoltaic"
      ind="photovoltaic"
      image="/assets/banners/mkt-photovoltaics.jpg"
      /* 20 Oct (IAQ amendment sheet, Photovoltaics · Hero Banner) */
      title={<em>Photovoltaics</em>}
      lede="Supporting Clean Energy Manufacturing"
      /* 20 Oct (client review, Sunny): "Delivered in" and "On the registry": "remove"; "Materials handled" and "Cleanroom class":
         "how sure are you about this?". No figure stays that IAQ has not confirmed, so the strip is gone; the two queried
         figures (silicon, cadmium, silver; ISO 6 to ISO 8, from the company profile p15 and the registry) can return once IAQ
         confirms them. */
      hideRegistry
      /* 20 Oct (IAQ amendment sheet, Photovoltaics · Industry Overview, Key Capabilities, Importance): IAQ's three sections, in its
         order and words. Spelling slips only corrected ("reliable"). */
      whyKick={null}
      why={{
        head: 'Industry Overview',
        body: 'As the world advances towards cleaner energy sources, photovoltaics manufacturing plays an increasingly important role in supporting global energy transformation. Modern solar production facilities require reliable infrastructure, consistent environmental control and efficient manufacturing environments to meet growing market demand while maintaining product quality, operational efficiency and competitiveness.',
      }}
      demandsHead="IAQ Key Capabilities"
      demands={[{ label: 'Solar manufacturing Facilities', icon: 'sun' }, { label: 'Utility Infrastructure', icon: 'sysPcw' }, { label: 'Manufacturing Facilities', icon: 'factory' }, { label: 'EPC Delivery', icon: 'epcUnit' }]}
      deliverKick={null}
      deliverHead="Why Manufacturing Infrastructure Matters"
      deliverIntro={[
        'Reliable infrastructure supports production efficiency, operational stability and long-term manufacturing growth.',
      ]}
      hideScope
      /* 22 Oct ("remove"): the "Classified where the process needs it" section and its content slot are off the page */
      slot={{
        tag: 'Content slot · photovoltaics',
        title: 'Regulatory consents and waste approvals',
        body: 'This panel carries the named local authority consents, the toxic material handling approvals and the waste treatment standards held on the delivered solar facilities. Each one is published here as IAQ confirms it.',
        who: 'Supplied by IAQ',
      }}
      proofLede="Published photovoltaics work from the sample registry. Further solar cell and module projects sit in the wider record and migrate at launch."
    />
  )
}
