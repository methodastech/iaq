import React from 'react'
import CapabilityPage from '../components/CapabilityPage.jsx'

/* Copy provenance
   desc, items      capabilities hub business-model block 01 (EPCC) and 02 (EPCM), verbatim
   sequence         the six stages IAQ already publishes as its delivery cycle, restated here as
                    the order of operations inside a single turnkey contract
   slot             business model questionnaire section B, still outstanding                    */

export default function CapEpc() {
  return (
    <CapabilityPage
      id="cap-epc"
      no="01"
      name="EPC & Construction"
      full="Engineering, Procurement, Construction & Commissioning"
      title={<>One contract, from first drawing to <em>final handover.</em></>}
      lede="The turnkey model. IAQ carries engineering design, procurement, construction and commissioning under a single contract, so accountability never moves between parties."
      chips={['EPCC · EPCM', 'Single-point accountability']}
      image={{
        src: '/assets/ph-crane.webp',
        alt: 'Construction of a hi-tech facility delivered by IAQ',
        caption: 'Model imagery · placeholder, replaced with IAQ project photography at production',
      }}
      what={[
        'For clients who want one accountable team from first drawing to final handover, our EPCC model delivers full turnkey execution. IAQ manages engineering design, procurement of materials and equipment, construction, and commissioning under a single contract.',
        'Our EPCM model is built for clients who want expert engineering and procurement leadership while retaining direct control of individual construction contracts. IAQ oversees design, procurement strategy, and construction management, coordinating multiple contractors, managing schedule and cost, and ensuring the project meets specification.',
        'The difference is where the construction contracts sit. Under EPCC they sit with IAQ; under EPCM they stay with the owner and IAQ manages them. Everything else about how the work is run is the same.',
      ]}
      pull="One accountable team, first drawing to final handover."
      steps={[
        { k: 'Design', t: 'Engineering design and consultation', d: 'Concept to detailed design across CSA and MEP. The decisions taken here set the budget, the programme and the classification the facility will be tested against four stages later, which is why design sits inside the same team that builds it.' },
        { k: 'Procure', t: 'Procurement of materials and equipment', d: 'Specification, sourcing and delivery of long-lead process-critical equipment, scheduled against the construction programme rather than against the purchase order.' },
        { k: 'Construct', t: 'Construction across all trades', d: 'Site management across every trade, with schedule and cost control carried to handover. Under EPCC the trade contracts sit with IAQ; under EPCM they stay with the owner and IAQ manages them.' },
        { k: 'Commission', t: 'Testing and commissioning', d: 'ISO cleanroom classification testing and system performance verification, with certified documentation issued at handover. The facility is proven against the classification it was designed to, not against a general standard.' },
        { k: 'Handover', t: 'Handover and the next cycle', d: 'The facility transfers with its documentation, and maintenance picks it up. Because the same group carries the asset afterwards, what is learned in operation feeds the next design.' },
      ]}
      items={[
        'Engineering design',
        'Procurement of materials and equipment',
        'Construction',
        'Commissioning',
        'Single contract, single point of accountability',
        'Design oversight (EPCM)',
        'Procurement strategy (EPCM)',
        'Construction management (EPCM)',
        'Coordination of multiple contractors (EPCM)',
        'Schedule and cost management',
        'Specification compliance',
      ]}
      why={[
        { k: 'One party carries the risk', t: 'When design, procurement and construction sit in separate contracts, the gaps between them belong to the owner. Under a single contract they belong to IAQ.' },
        { k: 'The programme is real', t: 'Procurement is scheduled against construction, not against the purchase order, which is where fast-track facility programmes are usually lost.' },
        { k: 'Tested against its own spec', t: 'The team that set the classification at design stage is the team that proves it at commissioning.' },
      ]}
      slot="Business model questionnaire, section B · exact included scope, the level of single-point accountability and risk IAQ carries, and the typical fast-track timeline · supplied by IAQ"
      filter={p => p.type === 'cleanroom' || p.size >= 10000}
      proofNote="Published by scope and location only. Client names are withheld where the contract requires it."
      cta={{ label: 'See the projects delivered this way', route: '/projects' }}
    />
  )
}
