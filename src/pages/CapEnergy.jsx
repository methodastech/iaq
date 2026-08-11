import React from 'react'
import CapabilityPage from '../components/CapabilityPage.jsx'

/* Copy provenance
   desc, items      capabilities hub business-model block 04, verbatim
   the journey      the plan brief "the client journey from audit to monitoring"
   slot             business model questionnaire section C, still outstanding. Savings figures are
                    deliberately NOT stated: an unverified savings number on a listing-bound site
                    is a liability, so the evidence block stays a labelled gap.               */

export default function CapEnergy() {
  return (
    <CapabilityPage
      id="cap-energy"
      no="04"
      name="Energy Management"
      full="Optimizing performance long after handover"
      title={<>Paid from the savings, <em>not from the budget.</em></>}
      lede="Audits, retrofits and district cooling. Under this model IAQ designs, implements and finances the energy works, and is paid out of the savings they achieve."
      chips={['No upfront cost', 'District cooling & heating']}
      image={{
        src: '/assets/about-2013-energy.webp',
        alt: 'Energy plant delivered and operated by IAQ',
        caption: 'Model imagery · placeholder, replaced with IAQ project photography at production',
      }}
      what={[
        'Through our Energy Management model, IAQ offers risk-free, no-upfront-cost energy-saving solutions: we design, implement, and finance energy projects, guaranteeing returns through achieved savings.',
        'In plain terms: the facility owner does not fund the works. IAQ carries the capital cost, the works are implemented, the savings are measured against an agreed baseline, and IAQ is paid a share of what is actually saved. If the savings do not materialise, the exposure is IAQ’s.',
        'That is why this model carries the most commercial nuance of the four, and why the baseline and the measurement method matter more than the equipment.',
      ]}
      pull="If the savings do not materialise, the exposure is IAQ's."
      steps={[
        { k: 'Audit', t: 'Energy audit', d: 'The facility is measured as it runs today: consumption by system, load profile, and where the energy is actually going. This becomes the baseline every later claim is settled against.' },
        { k: 'Model', t: 'Model the savings', d: 'Candidate measures are modelled against the baseline, with the achievable saving separated from the theoretical one. The measures that survive are the ones IAQ is prepared to be paid out of.' },
        { k: 'Fund', t: 'Fund and agree the terms', d: 'IAQ carries the capital cost. The baseline, the measurement method and the share of savings are agreed in writing before any work starts, because that agreement is the product.' },
        { k: 'Implement', t: 'Implement the works', d: 'Retrofit, plant replacement or district cooling connection, delivered under the same engineering and construction discipline as any other IAQ project.' },
        { k: 'Monitor', t: 'Measure and monitor', d: 'Consumption is monitored against the baseline for the term of the agreement. Settlement follows the measurement, so the reporting is the commercial instrument, not a report.' },
      ]}
      items={[
        'Energy design, implementation and financing',
        'Risk-free, no-upfront-cost model with returns guaranteed through achieved savings',
        'District cooling and heating plants',
        'Operation and maintenance of district cooling systems',
        'Energy audit and baseline measurement',
        'Ongoing monitoring against the agreed baseline',
      ]}
      why={[
        { k: 'No capital request', t: 'The works do not compete with the facility’s own capital budget, which is usually what stops an energy retrofit from happening at all.' },
        { k: 'The baseline is the contract', t: 'Everything is settled against a measured starting point, so both sides are arguing from the same number rather than from an estimate.' },
        { k: 'It outlasts the handover', t: 'District cooling plants are operated and maintained by IAQ afterwards, which is a different relationship from delivering a building and leaving.' },
      ]}
      slot="Business model questionnaire, section C · how the no-upfront-cost financing works in plain terms, the audit to monitoring journey, and verified savings figures · supplied by IAQ"
      filter={p => p.ind === 'district-cooling' || p.type === 'district-cooling'}
      proofNote="Published by scope and location only. Savings figures are not published until IAQ verifies them."
      cta={{ label: 'Request an energy audit', route: '/contact' }}
    />
  )
}
