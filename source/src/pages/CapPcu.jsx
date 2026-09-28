import React from 'react'
import UnitPage from '../components/UnitPage.jsx'

/* Copy provenance
   desc, items      capabilities hub business-model block 03, verbatim. The hub presents Process
                    Critical Utilities and Total Tool Installation as one model; the client web
                    plan splits them into two pages. Built as two, with the open question carried
                    on both as a labelled slot rather than resolved by guessing.
   slot             business model questionnaire section D, still outstanding                    */

export default function CapPcu() {
  return (
    <UnitPage
      id="cap-pcu"
      no="2"
      name="Process Critical Utilities"
      full="The utilities a production tool runs on"
      title={<>The utilities <em>are the facility.</em></>}
      lede="Specialty gases, chemicals, ultrapure water and exhaust, designed, installed and commissioned as one system."
      chips={['CDA · PCW · PV', 'UPW · Chemical · Exhaust']}
      /* 17 Sep: IAQ's own photograph (SharePoint Cleanroom Photos/P1010244): the utility runs feeding a cleanroom */
      image={{ src: '/assets/iaq/cr-utilities-p1010244.webp', alt: 'Utility runs feeding a cleanroom in an IAQ-built facility', hero: true }}
      /* 15 Sep (finish pass): moved onto UnitPage so it matches the three business-unit pages it is linked from.
         Facts are the page's own scope list and sequence; the band reuses the semiconductor market photograph. */
      band="/assets/banners/mkt-semiconductor.jpg"
      art="pcu"
      facts={[
        { v: '5', l: 'utility systems, run as one' },
        { v: '5', l: 'steps, from demand to the tool' },
        { v: '1', l: 'place the specification is proven: at the tool' },
      ]}
      what={[
        'Beyond the building itself, a hi-tech facility runs on its critical utilities and equipment integration. IAQ designs, installs, and commissions process critical utilities, alongside total tool installation and hook-up services that connect production equipment fully and precisely into the facility.',
        'A wafer fab is a shell until the gases, chemicals, ultrapure water and exhaust are running to specification. Those systems are what the production tool actually consumes, and their purity, pressure and continuity are what decide whether the tool can run at all.',
      ]}
      /* 17 Sep: IAQ's own Revit extract for this system, from the SharePoint share */
      bim={{ src: '/assets/iaq/bim-process.webp', cap: 'The process utilities as they are coordinated in the model: every run, riser and drop before a single pipe is cut.', alt: 'An isometric view of the process utilities model' }}
      pull="Purity, pressure and continuity decide whether the tool can run."
      hard={{ k: 'One system, designed and proven as one.', t: 'A fault in any one of these utilities stops production in exactly the same way, so they are designed, installed and proven together.' }}
      steps={[
        { k: 'Define', t: 'Define the demand', d: 'What each production tool consumes: gas purity and flow, chemical volumes, ultrapure water quality, exhaust duty. The demand schedule is set from the tool list, tool by tool.', covers: ['Gas purity and flow per tool', 'Chemical volumes and delivery', 'Ultrapure and deionised water', 'Exhaust duty by stream'] },
        { k: 'Design', t: 'Design the distribution', d: 'Routing, materials and redundancy for each utility, sized against the demand schedule. The expansion case is allowed for at the outset.', covers: ['VMB and VMP layouts for specialty gases', 'UPW and PCW loops', 'Acid, solvent and general exhaust, separately ducted'] },
        { k: 'Install', t: 'Install to purity standards', d: 'Orbital welding, cleanliness protocols and materials handling appropriate to each service. Purity is built in at installation rather than recovered afterwards.', covers: ['Electropolished 316L, orbital welded', 'Weld logs traceable to welder and machine', 'Chemical and waste systems'] },
        { k: 'Test', t: 'Test, purge and verify', d: 'Pressure testing, purging and purity verification service by service, with documentation issued against each one.', covers: ['Helium leak testing', 'Moisture and particle verification at the point of use'] },
        { k: 'Commission', t: 'Commission against the tool', d: 'The utility is proven at the point of use, under the load the tool actually places on it.', covers: ['Proven under the tool’s own load', 'Documentation issued service by service'] },
      ]}
      /* 17 Sep: the six systems moved onto the stages above as `covers` (client: merge with the
         lifecycle). The detail is the BU head's own, from the SL (Utility) questionnaire. */
      why={[
        { k: 'Purity is the product', t: 'A gas line is proven on purity as well as pressure. These systems are specified and proven on contamination and on flow.' },
        { k: 'Continuity is designed in', t: 'A process utility carries the same continuity requirement as the power supply, which is why redundancy is designed in from the start rather than added later.' },
        { k: 'Proven at the tool', t: 'Verification happens at the point of use under real load, because that is the only place the specification actually has to hold.' },
        /* SL (Utility) questionnaire, section D: two services integrated into one offering */
        { k: 'One offering, two services', t: 'Process critical utilities and tool installation are bought together or apart: the utilities are built with the facility, the hook-up brings them to the tool.' },
      ]}
      /* 17 Sep: the section D slot is closed. The SL (Utility) questionnaire answers both questions
         it held: the two services are "two services integrated into 1 offering", and the systems are
         chemical, gases, ultrapure water, deionised water and waste treatment. Both are on the page
         now, in the units section and on the stages above. */
      /* 18 Sep, cross-check: semiconductor exclusively (SL questionnaire, section D) */
      filter={p => p.ind === 'semiconductor'}
      proofNote="Published by scope and location only. Client names are withheld where the contract requires it."
      /* the note restates the Define step above: the demand schedule is set from the tool list */
      cta={{ label: 'Discuss a utilities scope', route: '/contact', title: 'Specify the utilities with the team that installs them.', note: 'Send the tool list. The demand for gases, chemicals, water and exhaust is set from it.' }}
    />
  )
}
