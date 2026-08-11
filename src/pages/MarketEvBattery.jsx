import React from 'react'
import MarketPage from '../components/MarketPage.jsx'

/* Copy provenance
   h1 + closing line   client copy sheet, Industries row, verbatim
   lede opener         built site industries card, verbatim
   pull quote          company profile p13 pull-quote, verbatim
   requirements        company profile p13, verbatim phrases
   delivery paragraphs company profile p13, verbatim
   62,000 m2           verified reference, Sweden gigafactory dry room        */

export default function MarketEvBattery() {
  return (
    <MarketPage
      id="mkt-ev-battery"
      no="03"
      name="EV Battery"
      hash="ev-battery"
      ind="ev-battery"
      image="/assets/industries/ev-battery.webp"
      title={<>High stakes, <em>zero room for error</em>.</>}
      lede="Gigafactory dry rooms, humidity-critical builds. Explore our approach to safe, contamination-controlled battery manufacturing."
      facts={[
        { k: 'Environment', v: 'Dry room', sub: 'Dry room specification rather than ISO cleanroom class on most battery projects.' },
        { k: 'Largest dry room', v: '62,000 m²', sub: 'Lithium-ion gigafactory dry room delivered in Sweden.' },
        { k: 'Recorded class', v: 'ISO 7', sub: 'One recorded project at Class 10K, on a 79,000 m² lithium cell facility.' },
      ]}
      why={{
        head: 'Humidity, contamination and hazard, controlled together',
        quote: 'Battery Manufacturing Involves Hazardous Materials and Processes Throughout Its Manufacturing Processes.',
        cite: 'IAQ company profile',
        body: 'Moisture control, cleanliness, contamination control and the explosion proof requirement arrive as one problem rather than four. The envelope, the airlocks, the dehumidification plant and the safety systems have to be designed as a single package.',
      }}
      demands={[
        'Moisture-controlled dry room environment',
        'Adherence to cleanliness standards',
        'Contamination control',
        'Explosion proof requirement',
      ]}
      deliverIntro={[
        'A moisture-controlled environment, adherence to cleanliness standards, contamination control and explosion proof requirement are quintessential to facilitate the manufacturing process of EV Battery safely.',
        'IAQ stands at the forefront, offering expertise in creating cutting-edge facility tailored to the unique requirement of EV battery manufacturing. With a focus on precision engineering and sustainability, we are here to build the infrastructure that powers the clean energy revolution.',
      ]}
      scopeTitle="Typical EV battery scope"
      cycleLede="A dry room is only as good as its envelope and its dehumidification plant, so design and commissioning carry the risk on every battery project."
      standards={{
        head: 'Dry room, not cleanroom',
        k: 'Classification',
        body: 'Battery lines are specified as dry rooms rather than ISO cleanrooms on most delivered projects, with one recorded project at ISO 7, Class 10K. The explosion proof requirement sits alongside the humidity target rather than after it, so the envelope, the airlocks and the safety systems are designed as one package.',
      }}
      slot={{
        tag: 'Content slot · EV battery',
        title: 'Dry room dew point specification',
        body: 'The dew point target, the humidity tolerance held in operation and the explosion proof classification carried on the delivered dry rooms are not stated in any supplied source. This panel holds those figures once they are confirmed.',
        who: 'Supplied by IAQ',
      }}
      proofLede="Published EV battery projects from the sample registry, from European gigafactory dry rooms to lithium cell facilities in Southeast Asia."
    />
  )
}
