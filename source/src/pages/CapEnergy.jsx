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
      /* 19 Oct (client feedback, Energy Management · Hero Banner): IAQ's header and line, in place of "Lower energy bills, with
         no upfront cost." */
      /* 26 Oct (IAQ review, NR, page 009): the title is the unit's full name, "Energy Facility Management"; it breaks before the blue word */
      title={<>Energy Facility <em>Management</em></>}
      /* IAQ funds implementation, upgrading, operation and maintenance Q-EM-C; payment on actual savings, or a fixed tariff, Q-EM-C. 18 words. */
      lede="Optimising Performance. Advancing Sustainability."
      /* ESCO under Suruhanjaya Tenaga LIVE-EFM; zero upfront investment Q-EM-A */
      chips={['Registered ESCO · Suruhanjaya Tenaga', 'Zero upfront investment']}
      /* 17 Sep: IAQ's own drone photograph of a delivered plant at dusk (SharePoint, Project Photos), in place of
         the Higgsfield still and clip, so the representation tag goes. The band lower down is another frame of the same flight. */
      /* 19 Oct (client feedback, Hero Banner: "Premium visual: District Cooling / Energy Infrastructure / Central utility
         Facility"): the district cooling plant room, the picture the District Cooling market page opens on, in place of the
         plant from the air */
      image={{ src: '/assets/banners/mkt-district-cooling.jpg', alt: 'A district cooling plant room: chillers and chilled water headers', hero: true }}
      /* the band below is IAQ's own photograph, so only the hero is tagged */
      bandRep={false}
      /* 15 Sep (UnitPage): the hero facts and the two funding models as cards. Zero upfront Q-EM-A; durations FLOW-EPC
         and FLOW-CAAS. */
      /* 17 Sep: IAQ's own drone photograph of a delivered plant at dusk, from the SharePoint share */
      band="/assets/iaq/plant-dusk-04.webp"
      art="energy"
      /* 19 Oct ("remove this", on the hero's RM0 / 5 to 10 / 10 to 20 figures): no figures on the hero; UnitPage closes the
         empty row (no-facts) */
      facts={[]}
      /* 24 Sep (client: "For this section they have 7 end-to-end Energy Management Services, refer our current
         website: iaqtechnology.com.my/efm", and "Then can remove this sections" on the At a glance ledger): the three
         payment models and the ledger are replaced by the seven services, worded as IAQ's own page words them. */
      /* 19 Oct (client feedback, Energy Management · Our Solutions): IAQ's five solutions, in IAQ's order and words, in place
         of the seven services (24 Sep, from IAQ's current EFM page) */
      /* 21 Oct (IAQ amendment sheet, Energy Management · Industry We Serve): the seven, in IAQ's order and words */
      industries={{ head: <>Industries <em>We Serve</em></>, items: [
        { t: 'Industrial & Manufacturing', icon: 'factory' }, { t: 'Commercial Developments', icon: 'building' }, { t: 'Data Centres', icon: 'server' },
        { t: 'Healthcare', icon: 'shield' }, { t: 'Hospitality', icon: 'home' }, { t: 'Education Campuses', icon: 'people' },
        { t: 'District Cooling Infrastructure', icon: 'snow' },
      ] }}
      /* 21 Oct (IAQ amendment sheet, Energy Management · Deliverable): Energy as a Service and its four steps, after Our
         Solutions; the project cycle section it stands for is off the page. Spelling slip only corrected ("sustainability"). */
      process={{ head: <>Energy as <em>a Service</em></>,
        lede: 'IAQ’s Energy-as-a-Service approach enables organisations to improve energy performance through innovative delivery models that minimise capital expenditure while creating long-term operational and sustainability benefits.',
        steps: [
          { k: 'Assess', icon: 'gauge', t: 'Evaluate existing infrastructure and identify opportunities for improvement.' },
          { k: 'Optimise', icon: 'chart', t: 'Develop strategies to improve efficiency, performance and energy consumption.' },
          { k: 'Implement', icon: 'crane', t: 'Deliver upgrades, retrofits and infrastructure improvements through proven engineering solutions.' },
          { k: 'Operate', icon: 'cycle', t: 'Support long-term performance through monitoring, maintenance and operational management.' },
        ] }}
      hideCycle
      /* 21 Oct ("remove this"): the "Call EFM when" line is off the hero, as on EPC and PCU & TTI */
      hideWhen
      /* 21 Oct (IAQ amendment sheet, Energy Management · CTA): its own section above the footer. Spelling slip only
         corrected ("infrastructure"). */
      ctaBand={{ title: <>Let&rsquo;s Discuss Your <br /><em>Energy Goals</em></>, label: 'Discuss your energy goals', route: '/contact',
        lede: 'Whether you are evaluating energy optimisation opportunities, exploring sustainable cooling solutions or modernising existing infrastructure, IAQ can help identify practical pathways towards greater efficiency, resilience and long-term value.' }}
      servicesHead={<>Our <em>Solutions</em></>}
      services={[
        { t: 'Energy Audit', icon: 'gauge', d: 'Comprehensive assessments that identify opportunities to improve energy efficiency, system performance and investment planning.' },
        { t: 'Energy Performance Contracting', icon: 'chart', d: 'Performance-based solutions that enable energy efficiency improvements through measurable operational outcomes.' },
        { t: 'Cooling-as-a-Service', icon: 'snow', d: 'A utility-based approach that provides efficient cooling infrastructure while reducing upfront capital investment and operational complexity.' },
        { t: 'District Cooling System', icon: 'factory', d: 'Integrated solutions spanning feasibility, development, operation and long-term lifecycle management.' },
        { t: 'Operations & Maintenance', icon: 'gear', d: 'Structured maintenance programmes designed to enhance reliability, optimise performance and extend asset life.' },
      ]}
      /* 29 Sep (client, Website Update: "You should first describe what EFM is first", "Only then continue with The
         problems EFM solved"): the client's two paragraphs, as given, open "What EFM is."; the dash after "IAQ Group"
         is a comma on the site (house style, no dashes as pauses) */
      /* 19 Oct (client feedback, Energy Management · Introduction to Energy Management): IAQ's heading and paragraph, in place
         of "What EFM is." and its two paragraphs (29 Sep). Spelling slip only corrected ("reliability"). */
      whatHead={<>Driving Sustainable <em>Facility Performance</em></>}
      whatParts={[
        { t: 'By combining technical expertise, innovative commercial models and lifecycle support services, IAQ helps organisations optimise energy infrastructure, improve reliability and create measurable long-term value across their facilities.' },
      ]}
      painsHead={<>The problems <em>EFM solves</em></>}
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
        head: <>District cooling, <br /><em>in brief</em></>,
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
      /* 21 Oct (IAQ amendment sheet, Energy Management · Why IAQ): IAQ's four reasons, in its order and words, in place of
         "Why owners choose it.", after Energy as a Service */
      whyHead={<>Why Energy Performance <br /><em>Matters</em></>}
      whyAfterServices
      why={[
        { k: 'Engineering-Led Solutions', icon: 'compass', t: 'Backed by multidisciplinary engineering expertise and decades of project delivery experience.' },
        { k: 'Performance-Focused Approach', icon: 'gauge', t: 'Focused on improving operational efficiency, system reliability and long-term asset value.' },
        { k: 'Innovative Business Models', icon: 'chart', t: 'Flexible Energy-as-a-Service solutions that support energy transition initiatives while reducing investment barriers.' },
        { k: 'Sustainability Commitment', icon: 'leaf', t: 'Helping organisations advance energy efficiency, carbon reduction and broader sustainability objectives.' },
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
      cta={{ label: 'Request an energy audit', route: '/contact', title: 'Find out where your plant loses energy', note: 'The audit examines your existing HVAC and chiller plant, then plans the upgrades that save the most.' }}
    />
  )
}
