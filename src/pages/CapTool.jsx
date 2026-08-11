import React from 'react'
import CapabilityPage from '../components/CapabilityPage.jsx'

/* Copy provenance
   desc, items      capabilities hub business-model block 03, verbatim (shared with Process
                    Critical Utilities; see the note on that page)
   the six steps    written from the plan brief "what tool hook-up involves, step by step". The
                    sequence is generic to hook-up practice and is marked for IAQ verification in
                    the slot, because the plan makes explaining it well the differentiator.
   slot             business model questionnaire section D, still outstanding                    */

export default function CapTool() {
  return (
    <CapabilityPage
      id="cap-tool"
      no="03"
      name="Total Tool Installation"
      full="Bringing production lines to life"
      title={<>The last hundred metres, where a facility <em>becomes a fab.</em></>}
      lede="Tool hook-up connects production equipment fully and precisely into the facility it sits in. Outside the industry almost nobody knows what hook-up means, so this page explains it before it sells it."
      chips={['Hook-up', 'Semiconductor · Pharma']}
      image={{
        src: '/assets/ph-electrical.webp',
        alt: 'Production tool hook-up in a cleanroom',
        caption: 'Model imagery · placeholder, replaced with IAQ project photography at production',
      }}
      what={[
        'IAQ designs, installs, and commissions process critical utilities, alongside total tool installation and hook-up services that connect production equipment fully and precisely into the facility.',
        'Hook-up is the work between a delivered machine and a producing machine. The tool arrives on the floor as an inert box; hook-up is every connection that turns it into part of the line: power, gases, chemicals, water, exhaust, drainage, signals and safety interlocks.',
        'It is the last work done and the least forgiving. The facility is finished, the cleanroom is live, the tool is worth more than the room, and the programme has usually already been compressed by everything upstream.',
      ]}
      pull="Hook-up is the work between a delivered machine and a producing machine."
      steps={[
        { k: 'Survey', t: 'Survey and set out', d: 'The tool footprint, service drops and access route are set out against the as-built facility, not against the design drawing. Discrepancies are found here rather than on the day the tool lands.' },
        { k: 'Rig', t: 'Rig and place', d: 'Moving a tool into a live cleanroom without breaching classification: route, protection, lifting and levelling, with the room recovered afterwards.' },
        { k: 'Connect', t: 'Connect the services', d: 'Power, specialty gases, chemicals, process water, exhaust and drainage brought to the tool and terminated to its own specification, each to the material and cleanliness standard that service demands.' },
        { k: 'Verify', t: 'Leak-test and verify', d: 'Every connection pressure-tested, purged and verified before energising. On gas and chemical services this is the step that protects both the tool and the people around it.' },
        { k: 'Energise', t: 'Energise and interlock', d: 'Controls, monitoring and safety interlocks proven, so the tool fails safe into the facility systems rather than independently of them.' },
        { k: 'Hand over', t: 'Hand over to production', d: 'The tool is released to the process owner with its documentation, ready for the equipment maker to run acceptance.' },
      ]}
      items={[
        'Tools hookup',
        'Gas and chemical connection to the tool',
        'Process water and ultrapure water connection',
        'Process exhaust connection',
        'Power and controls termination',
        'Leak testing, purging and verification',
        'Safety interlock proving',
      ]}
      why={[
        { k: 'It is the critical path', t: 'Hook-up is the last work before production, so every delay upstream lands on it and every day lost is a day of lost output.' },
        { k: 'The room is already live', t: 'This work happens inside a classified cleanroom that is finished and certified. Doing it without breaching that classification is the skill.' },
        { k: 'Semiconductor and pharma first', t: 'These are the sectors where the tool is the investment and the facility exists to serve it, which is why hook-up capability decides who gets asked.' },
      ]}
      slot="Business model questionnaire, section D · IAQ's own hook-up sequence, the scope boundary with the equipment maker, and which sectors it is offered in · supplied by IAQ"
      filter={p => p.ind === 'semiconductor'}
      proofNote="Published by scope and location only. Client names are withheld where the contract requires it."
      cta={{ label: 'See the reference projects', route: '/projects' }}
    />
  )
}
