import React from 'react'
import CapabilityPage from '../components/CapabilityPage.jsx'

/* Copy provenance
   desc, items      capabilities hub business-model block 03, verbatim. The hub presents Process
                    Critical Utilities and Total Tool Installation as one model; the client web
                    plan splits them into two pages. Built as two, with the open question carried
                    on both as a labelled slot rather than resolved by guessing.
   slot             business model questionnaire section D, still outstanding                    */

export default function CapPcu() {
  return (
    <CapabilityPage
      id="cap-pcu"
      no="03"
      name="Process Critical Utilities"
      full="The utilities a production tool cannot run without"
      title={<>The building is not the facility. The <em>utilities are.</em></>}
      lede="Specialty gases, chemical delivery and process water. Beyond the building itself, a hi-tech facility lives or dies by its critical utilities, and they are designed, installed and commissioned as one system."
      chips={['CDA · PCW · PV', 'UPW · Chemical · Exhaust']}
      image={{
        src: '/assets/ph-boiler.webp',
        alt: 'Process critical utility plant delivered by IAQ',
        caption: 'Model imagery · placeholder, replaced with IAQ project photography at production',
      }}
      what={[
        'Beyond the building itself, a hi-tech facility lives or dies by its critical utilities and equipment integration. IAQ designs, installs, and commissions process critical utilities, alongside total tool installation and hook-up services that connect production equipment fully and precisely into the facility.',
        'In plain terms: a wafer fab or a battery dry room is a shell until the gases, chemicals, ultrapure water and exhaust are running to specification. Those systems are what the production tool actually consumes, and their purity, pressure and continuity are what decide whether the tool can run at all.',
        'They are treated as one system rather than as separate trades, because a fault in any one of them stops production in exactly the same way.',
      ]}
      pull="A shell is not a facility until the utilities are running to specification."
      steps={[
        { k: 'Define', t: 'Define the demand', d: 'What each production tool consumes: gas purity and flow, chemical volumes, ultrapure water quality, exhaust duty. The demand schedule is set from the tool list, not from a floor area.' },
        { k: 'Design', t: 'Design the distribution', d: 'Routing, materials and redundancy for each utility, sized against the demand schedule with the expansion case allowed for at the outset rather than retrofitted.' },
        { k: 'Install', t: 'Install to purity standards', d: 'Orbital welding, cleanliness protocols and materials handling appropriate to each service. Contamination introduced at installation cannot be flushed out later.' },
        { k: 'Test', t: 'Test, purge and verify', d: 'Pressure testing, purging and purity verification service by service, with documentation issued against each one.' },
        { k: 'Commission', t: 'Commission against the tool', d: 'The utility is proven at the point of use, under the load the tool actually places on it, not at the plant room.' },
      ]}
      items={[
        'CDA, PCW, PV',
        'Process Exhaust System',
        'Chemical / Gas Delivery System',
        'UPW (ultrapure water)',
        'Waste Water Treatment',
        'Tools hookup',
      ]}
      why={[
        { k: 'Purity is the product', t: 'A gas line that meets pressure but not purity has failed. These systems are specified and proven on contamination, not on flow alone.' },
        { k: 'Continuity is the risk', t: 'An interruption to a process utility stops production as completely as a power cut, which is why redundancy is designed in rather than added.' },
        { k: 'Proven at the tool', t: 'Verification happens at the point of use under real load, because that is the only place the specification actually has to hold.' },
      ]}
      slot="Business model questionnaire, section D · whether PCU and tool installation are one offering or two, and the full system-by-system scope and standards · supplied by IAQ"
      filter={p => p.ind === 'semiconductor' || p.ind === 'pharma'}
      proofNote="Published by scope and location only. Client names are withheld where the contract requires it."
      cta={{ label: 'See the reference projects', route: '/projects' }}
    />
  )
}
