import React from 'react'
import UnitPage from '../components/UnitPage.jsx'

/* Copy provenance. Rebuilt 15 Sep from IAQ's own answers; the previous version is in
   src/_backups/epc-efm-0915/CapEnergy.jsx. Every fact carries a source tag beside it.

   Keys
     Q-EM-A, Q-EM-C   Client info/IAQ/2026.07.27_IAQ BM Questionnaire (Energy Management).xlsx, sections A and C
     FLOW-CAAS        flowchart image embedded in that workbook, "IAQ's Cooling As A Service/Build-Operate-
                      Transfer Model": five steps, duration 10 to 20 years. This is the "Refer flowchart" answer.
     FLOW-EPC         the second flowchart, "Energy Performance Contracting (EPC) Business Process": six
                      steps, duration 5 to 10 years
     LIVE-EFM         iaqtechnology.com.my/efm/
     LIVE-CC          iaqtechnology.com.my/corporate-commitment/, the two energy service blurbs
     HIST             iaqtechnology.com.my/history-of-iaq/, the 2013 district cooling entry

   Flow choices
     IAQ runs two funding models and drew one flowchart for each. They share their opening steps and
     both end at contract completion, so the sequence merges them into one journey and names the model
     wherever the two part ways. A buyer comparing the models reads the difference at the step where it
     happens. "Financial analysis" appears only in FLOW-EPC and is labelled that way.
     LIVE-EFM has no process section. Its order is hero, who we are, solutions, problems, benefits, a
     district cooling explainer, references. The template runs offering, sequence, scope, benefits,
     proof, contact, which is also the order IAQ asked for in Q-EM-A, so it stays.
     "EPC" means Engineering, Procurement and Construction everywhere else on this site, so the energy
     model is always spelled out as Energy Performance Contracting here.

   Left out on purpose
     The 21% pump saving on a named contract: Q-EM-C says do not disclose the client project or its
     savings. LIVE-EFM lists a 10-year cooling water pump energy performance contract, most likely the
     same one (inference), so that line is left out too.
     "Up to 30%" on LIVE-EFM: its own body text says "up to double-digit", and Q-EM-C says IAQ does not
     usually disclose amounts. Carried in the slot as a question for IAQ.
     Client names on LIVE-EFM: the site publishes projects by scope and location only.                 */

export default function CapEnergy() {
  return (
    <UnitPage
      id="cap-energy"
      /* DV3 A2.1: Energy Management is IAQ's business model 3 of 3 */
      no="3"
      /* 18 Sep: the unit's registered name, the one the market knows */
      name="EFM"
      /* LIVE-EFM "IAQ Energy Facility Management (EFM)"; Q-EM-C: Energy Management covers the services EFM provides */
      full="Energy Facility Management (EFM)"
      /* high electricity bill Q-EM-A pain point a; "no upfront costs" LIVE-CC; zero upfront investment Q-EM-A differentiator a. The em holds one line. */
      title={<>Lower energy bills, with <em style={{ whiteSpace: 'nowrap' }}>no upfront cost.</em></>}
      /* IAQ funds implementation, upgrading, operation and maintenance Q-EM-C; payment on actual savings, or a fixed tariff, Q-EM-C. 18 words. */
      lede="IAQ funds, builds and runs the energy upgrade. You pay from the savings, or a fixed cooling tariff."
      /* ESCO under Suruhanjaya Tenaga LIVE-EFM; zero upfront investment Q-EM-A */
      chips={['Registered ESCO · Suruhanjaya Tenaga', 'Zero upfront investment']}
      /* 17 Sep: IAQ's own drone photograph of a delivered plant at dusk (SharePoint, Project Photos), in place of
         the Higgsfield still and clip, so the representation tag goes. The band lower down is another frame of the same flight. */
      image={{ src: '/assets/iaq/plant-dusk-01.webp', alt: 'A plant delivered by IAQ, photographed from the air at dusk', hero: true }}
      /* the band below is IAQ's own photograph, so only the hero is tagged */
      bandRep={false}
      /* 15 Sep (UnitPage): the hero facts and the two funding models as cards. Zero upfront Q-EM-A; durations FLOW-EPC
         and FLOW-CAAS. */
      /* 17 Sep: IAQ's own drone photograph of a delivered plant at dusk, from the SharePoint share */
      band="/assets/iaq/plant-dusk-04.webp"
      art="energy"
      facts={[
        { v: 'RM0', l: 'upfront investment from you' },
        { v: '5 to 10', l: 'years, Energy Performance Contracting' },
        { v: '10 to 20', l: 'years, Cooling as a Service' },
      ]}
      /* 24 Sep (client: "For this section they have 7 end-to-end Energy Management Services, refer our current
         website: iaqtechnology.com.my/efm", and "Then can remove this sections" on the At a glance ledger): the three
         payment models and the ledger are replaced by the seven services, worded as IAQ's own page words them. */
      servicesHead={<>Seven energy management services, <em>end to end.</em></>}
      servicesLede="Designed to reduce operating expenditure, increase efficiency and improve sustainability outcomes."
      services={[
        { t: 'Energy Audit', icon: 'gauge', d: 'Comprehensive energy audits to identify inefficiencies, optimise system performance and implement targeted Energy Saving Measures (ESMs).' },
        { t: 'Energy Efficiency Solutions', icon: 'airflow', d: 'HVAC and building system optimisation through targeted retrofits and AI-based automation.' },
        { t: 'Energy Performance Contracting', icon: 'chart', d: 'IAQ fully funds and delivers system upgrades, from HVAC retrofits to smart controls, and shares in the operating cost savings achieved.' },
        { t: 'Cooling-as-a-Service / Build-Operate-Transfer', icon: 'snow', d: 'A utility-based cooling model: chilled water supplied under a long-term service agreement. Pay only for the cooling you consume.' },
        { t: 'District Cooling System', icon: 'factory', d: 'End-to-end solutions from feasibility studies through engineering, procurement, construction, commissioning, operation and maintenance.' },
        { t: 'Maintenance & Reliability', icon: 'gear', d: 'Comprehensive and non-comprehensive maintenance packages with skilled manpower for daily operations and emergency response.' },
        { t: 'Cogeneration System', icon: 'power', d: 'Efficient on-site power and thermal energy generation that reduces energy costs, improves reliability and supports sustainable facility operations.' },
      ]}
      painsHead={<>The problems <em>EFM solves.</em></>}
      /* 24 Sep (client: "This section can replace with brief introduction of district cooling system"): stands where the
         six-services list stood. First line is what a district cooling system is; the rest is IAQ's own wording from the
         markets page and the live EFM page, and the flagship the site already carries. */
      /* 25 Sep (Bazil: "this one can remove" on the work cards, "district cooling can put at the bottom", "explain
         district cooling nice and straightforward"): the cards are off this page, and the brief closes it as one
         picture and three plain steps. The picture is a generated illustration and is labelled so. The IAQ line is its
         own wording from the markets page and the live EFM page. */
      works={false}
      introEnd
      /* 25 Sep (Bazil, with IAQ's EFM slide "Services Scope · Energy Management · Energy As A Service": "put this info in
         for the district cooling 3D, very detailed and easy to understand", "apply it in the specific page"): `scene` swaps
         the illustration and three steps for the 3D district, a five-step tour and the three delivery models
         (components/DistrictCooling3D.jsx). The fields below stay as the fallback and keep the IAQ line and the link. */
      intro={{
        scene: 'dcs',
        head: <>District cooling, <em>in brief.</em></>,
        lede: 'One central plant cools a whole district or campus, through a shared network of pipes.',
        fig: { src: '/assets/iaq/dcs-illustration.webp', alt: 'Illustration of a district cooling system: a central plant with cooling towers and a storage tank pipes chilled water to offices, a hospital, a university and a mall' },
        steps: [
          { k: 'One central plant', t: 'Chillers at one plant make chilled water for every building on the network.' },
          { k: 'Pipes to each building', t: 'Insulated pipes carry the chilled water out, and bring the warmer water back to be chilled again.' },
          { k: 'Cooling in every building', t: 'Each building runs its air-conditioning on the chilled water, in place of a chiller plant of its own.' },
        ],
        paras: ['IAQ delivers district cooling end to end, from feasibility study to operation and maintenance. Its work includes Malaysia\u2019s largest district cooling centre, in Kuala Lumpur.'],
        to: '/markets/district-cooling', cta: 'District cooling on the markets page',
      }}
      pains={[
        { k: 'High electricity bills', icon: 'power', t: 'Inefficient cooling driving operating cost up year after year.' },
        { k: 'Rising carbon emissions', icon: 'leaf', t: 'Compliance risk against regulation and sustainability targets.' },
        { k: 'Ageing infrastructure', icon: 'gear', t: 'Chiller plants past their best, and a capital bill to replace them.' },
        { k: 'Operational disruption', icon: 'clock', t: 'Downtime and inefficiency from poor maintenance and old systems.' },
      ]}
      /* Q-EM-A differentiators a (zero upfront investment) and b (performance assurance); IAQ funds Q-EM-C */
      /* 17 Sep: IAQ's own Revit extract for this system, from the SharePoint share */
      bim={{ src: '/assets/iaq/bim-acmv.webp', cap: 'The air-conditioning and mechanical ventilation model: the ducts and plant an energy retrofit works on.', alt: 'An isometric view of the air-conditioning model' }}
      pull="Zero upfront investment. IAQ funds the upgrade and assures its performance."
      steps={[
        /* FLOW-EPC 1 "System Audit" and FLOW-CAAS 1 "System Assessment"; "for existing HVAC systems only" is the FLOW-CAAS footnote */
        { k: 'Assess', t: 'System assessment', d: 'IAQ’s experts examine your existing HVAC infrastructure. Under Energy Performance Contracting this is the system audit. Under Cooling as a Service it applies to existing systems only.', covers: ['Energy audit of HVAC and chiller plant', 'Building Energy Index baseline'] },
        /* FLOW-EPC 2 "Optimization Planning" and FLOW-CAAS 2 "Upgrade Planning", the same text on both */
        { k: 'Plan', t: 'Upgrade planning', d: 'IAQ identifies the specific solutions that maximise energy efficiency.', covers: ['Energy Saving Measures identified', 'Retrofit and AI-based automation options'] },
        /* FLOW-EPC 3 only; payment on actual savings Q-EM-C */
        { k: 'Analyse', t: 'Financial analysis', d: 'IAQ calculates the investment required and the potential savings. This step belongs to Energy Performance Contracting, where payment is based on the savings achieved.', covers: ['Investment and savings modelled', 'Payment set against savings achieved'] },
        /* FLOW-EPC 4 "IAQ finance and execute all necessary upgrades"; FLOW-CAAS 3 "IAQ finances and builds/rehabilitates your chiller plant" */
        { k: 'Fund & build', t: 'Funding and construction', d: 'IAQ finances the works and carries them out. Under Cooling as a Service, IAQ builds or rehabilitates your chiller plant. Under Energy Performance Contracting, IAQ executes every upgrade needed.', covers: ['IAQ funds the works', 'Chiller plant built or rehabilitated', 'District cooling, feasibility to operation'] },
        /* FLOW-CAAS 4 with its SLA note; FLOW-EPC 5 "Client and IAQ share the operational cost reductions" */
        { k: 'Operate', t: 'Operation and shared savings', d: 'Under Cooling as a Service, IAQ operates and maintains the system for the whole contract. The owner and IAQ sign a Service Level Agreement with a performance guarantee. Under Energy Performance Contracting, you and IAQ share the reduction in operating cost.', covers: ['Operation and maintenance', 'Service Level Agreement with a performance guarantee', 'Cogeneration where the site suits it'] },
        /* FLOW-CAAS 5 and its duration; FLOW-EPC 6 and its duration */
        { k: 'Contract end', t: 'Handover at contract end', d: 'Cooling as a Service runs 10 to 20 years, and the system is then handed over to you. Energy Performance Contracting runs 5 to 10 years, and you then keep 100% of the savings.', covers: ['Plant handed to the owner', 'Savings kept in full'] },
      ]}
      /* 17 Sep: the seven services moved onto the stages above as `covers` (client: merge with the
         lifecycle and remove the section). */
      why={[
        /* Q-EM-A differentiator a; IAQ funds Q-EM-C; "focus capital on core business priorities" LIVE-EFM */
        { k: 'Zero upfront investment', icon: 'chart', t: 'IAQ funds the implementation. Your capital stays free for core business priorities.' },
        /* LIVE-EFM "Up to 30% cost reduction". IAQ's own published claim, kept as a range, not as a
           promise: the BU head asked that no client project or achieved saving be named. */
        { k: 'Up to 30% lower cost', icon: 'gauge', t: 'IAQ publishes savings of up to 30% on electricity consumption where the measures are applied in full.' },
        /* Q-EM-A differentiator b; "Service Level Agreements ensure system reliability, energy efficiency and guaranteed uptime" LIVE-EFM */
        { k: 'Performance assurance', icon: 'shield', t: 'Service Level Agreements cover system reliability, energy efficiency and uptime.' },
        /* Q-EM-A differentiator c */
        { k: '30 years in HVAC', icon: 'airflow', t: 'IAQ has 30 years of experience in HVAC.' },
        /* Q-EM-A differentiator d; district cooling "from feasibility studies through engineering, procurement, construction, commissioning, operation and maintenance" LIVE-EFM */
        { k: 'EPCC capability', icon: 'crane', t: 'IAQ engineers, procures, constructs and commissions the works. On district cooling it carries on into operation and maintenance.' },
        /* LIVE-EFM Regulatory Compliance */
        { k: 'Regulatory compliance', icon: 'check', t: 'Upgrades help facilities meet energy efficiency regulations and Building Energy Index (BEI) requirements.' },
        /* main contractor for Malaysia's largest district cooling plant HIST 2013 and LIVE-EFM "Malaysia largest DCP"; "Malaysia First Multi Varsity District Cooling System" LIVE-EFM */
        { k: 'District cooling record', icon: 'snow', t: 'IAQ was main contractor for Malaysia’s largest district cooling plant. Its references also include Malaysia’s first multi-varsity district cooling system.' },
      ]}
      /* what no source answers: client questions listed in Q-EM-A and Q-EM-C without answers; equipment ownership after FLOW-EPC; the unconfirmed LIVE-EFM figure */
      /* 17 Sep: the questionnaire came back and closed part of this. The "up to 30%" claim is IAQ's
         own published figure and is now on the page; what ends at contract end is on the models and
         the last stage. What the questionnaire lists but does not answer is the six questions
         clients actually ask, so the slot now asks for exactly those, in IAQ's own wording, and
         nothing else. The BU head's instruction is recorded here too: no client project and no
         achieved saving is to be named on the site. */
      slot={{
        tag: 'Supplied by IAQ',
        title: 'The six questions clients ask, from the Energy Management questionnaire, section C',
        items: [
          'Why adopt Cooling as a Service, and how the model works',
          'Whether the energy rate fluctuates over the term',
          'Whether the savings rise or fall through the contract',
          'What happens when the contract tenure ends',
          'Whether there is an exit clause',
          'What the risks are for the end user',
        ],
      }}
      filter={p => p.ind === 'district-cooling' || p.type === 'district-cooling'}
      /* Q-EM-C: savings amounts are not disclosed */
      proofNote="Published by scope and location only. Savings on individual contracts are held in confidence, at IAQ’s request."
      proofLink={{ label: 'See all district cooling projects', to: '/projects#district-cooling' }}
      /* energy audit is service c in Q-EM-C; Q-EM-A: a visitor contacts the PIC */
      /* the note restates steps 1 and 2 above (FLOW-EPC, FLOW-CAAS) */
      cta={{ label: 'Request an energy audit', route: '/contact', title: 'Find out where your plant loses energy.', note: 'The audit examines your existing HVAC and chiller plant, then plans the upgrades that save the most.' }}
    />
  )
}
