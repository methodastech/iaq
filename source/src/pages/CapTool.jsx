import React from 'react'
import UnitPage from '../components/UnitPage.jsx'

/* Copy provenance
   desc, items      capabilities hub business-model block 03, verbatim (shared with Process
                    Critical Utilities; see the note on that page)
   the six steps    written from the plan brief "what tool hook-up involves, step by step". The
                    sequence is generic to hook-up practice and is marked for IAQ verification in
                    the slot, because the plan makes explaining it well the differentiator.
   slot             business model questionnaire section D, still outstanding                    */

export default function CapTool() {
  return (
    <UnitPage
      id="cap-tool"
      no="2"
      name="PCU & TTI"
      full="Process Critical Utilities & Total Tool Installation Solutions"
      /* 19 Oct (client feedback, PCU & TTI · "Direct header, no explanation", High): the unit's own name as the header, and
         IAQ's line under it, in place of "The last hundred metres, where a facility becomes a fab." */
      /* 22 Oct: set on three lines, as asked: "Process Critical / Utilities (PCU) & / Total Tool Installation (TTI)" */
      title={<>Process Critical<br />Utilities (PCU) &amp;<br /><em className="un-h1-line">Total Tool Installation (TTI)</em></>}
      lede="Bridging Facility Readiness and Manufacturing Readiness"
      /* 29 Sep (client, Website Update: the hero's line "should be under below section", "you missing out the PCU
         description"): the line moved under "What PCU & TTI is." as the TTI half, beside a PCU half (whatParts) */
      chips={['Tool installation · hook-up', 'Semiconductor fabs']}
      /* the sixth service opens on its own banner (2 Sep): the tool being connected in a live bay */
      image={{
        /* 17 Sep: IAQ's own photograph (SharePoint Cleanroom Photos/P1010242): the utility runs above a
           cleanroom bay, which is what hook-up brings down to the tool. The Higgsfield still it replaces is kept in
           public/assets/units. */
        /* 25 Sep (Bazil: "a visual and also video of the same team but better uniform, IAQ working on it, the equipment more
           covered", "a video of the IAQ team working on hookup in a clean room, research carefully"): a generated scene,
           tagged Representation. Researched detail: full cleanroom garments (hood, mask, glasses, nitrile gloves, boots),
           the tool wrapped in protective film and unbranded, raised-floor tiles lifted with barriers, stainless lines
           rising from below the floor to the tool's connection panel, a compact orbital welder (a closed process, no sparks),
           a leak test probe, matte floor with no reflections. No faces from IAQ's Robocon photographs are reproduced.
           The client's 24 Sep line against generated installation footage is on record; this is Bazil's call. The
           photograph it replaces (P1010242) stays on the hub's Tools Hookup card. */
        /* 22 Oct (Bazil: "i dont like process doing the work. cause it might be have an isssue regarding how we operate. so
           avoid making process work"; this video "is ai generated can you replace it"): the team loop is off the hero. Now a
           finished hookup with nobody in it: a wrapped tool, its stainless utility lines rising from the open raised floor
           to the connection panel, barriers round the opening, and only the camera moving. GPT Image 2.5 still, Seedance
           2.5 start-image 8 s 1080p played forward then back (no seam dissolve, so no double image), both in Higgsfield. Still a representation. The
           team loop and still stay in the folder. */
        /* 22 Oct, later (Bazil: the client's example for tool installation, a phone video of a tool move-in along a protected
           floor path, "dont copy one to one ... you can make video for it"): the same idea, made new and still with no one
           doing hands-on work. A film-wrapped tool on its transport skid waits on a grey anti-static path edged in blue
           tape, down the middle of a large new cleanroom; the camera glides along the path towards it. Matte floor, no
           signs or notes (the example's glossy floor and paper notices are left out). GPT Image 2.5 still, Seedance 2.5
           start-image 8 s 1080p played forward then back, in Higgsfield. A second take with three people in cleanroom
           coats walking beside the tool, far off, is kept as tool-movein-b in the same folders. */
        /* 22 Oct ("replace the video", hall-movein from Downloads): a slow move down a finished, empty cleanroom hall with the
           tools standing along both sides. HEVC re-encoded to H.264 for every browser, played forward then back so the loop
           has no jump; the still is its first frame. tool-movein-a stays in the folder. */
        video: '/assets/videos/tool-movein-hall.mp4',
        src: '/assets/iaq/tool-movein-hall.webp', hero: true,   /* 15 Sep: Higgsfield still, a connected tool in a bay, no people (the wrench shot was rejected: "the guy playing a screw"); no loop on this page */   /* 15 Sep: Higgsfield still, a representation */
        /* 26 Sep (Bazil: "the people in the video did not wear what the engineers wear in the 3D, nor the people in the
           picture I said", "please redo"): the team now wears IAQ's own site kit, as the walkthrough's engineers do and as
           the IAQ x UM Robocon team does: navy long-sleeve polo with the red IAQ chest logo, navy work trousers, white hard
           hat, mask, safety glasses, white gloves, light-blue shoe covers. Made in Higgsfield (GPT Image 2.5 still with the
           3D outfit and two Robocon photos as references, Seedance 2.5 loop). Still a representation; no real faces. */
        /* 25 Sep, 22:30 (Bazil: "make sure accurate like in 3D character, but too many people there, maybe max just 3 doing
           actual work"): three engineers, all hands-on (one torques a fitting with an open-end wrench, one seats a connector
           at the tool's utility panel, one opens a valve); nobody holding a tablet. GPT Image 2.5 edit of the previous still
           (job 5f9e3ce2), Seedance 2.5 start-image 8 s 1080p (job 348b2b04), 7 s loop with a 1 s seam dissolve. */
        alt: 'Representation: a slow move down a large finished cleanroom, its process tools standing along both sides of the hall',
      }}
      rep
      /* 15 Sep (UnitPage): the hero facts, the "why it is hard" line, the hookup diagram. Six services and six steps
         are the page's own sequence and scope; sectors from the plan brief. */
      /* 17 Sep: IAQ's own photograph (SharePoint Cleanroom Photos/DSCN6580): the team crossing a finished ballroom.
         Nothing generated is left on this page, so no representation tag. */
      /* 21 Oct (Bazil: "remove those people"): the same photograph with the people removed in ChatGPT */
      band="/assets/iaq/cr-team-dscn6580-empty.webp"
      /* 26 Sep: the band is IAQ's own photograph; only the hero loop is generated, so only the hero carries the tag */
      bandRep={false}
      art="hookup"
      /* 25 Sep (Bazil: "wouldn't this be better replaced with picture 2"): IAQ's Services Scope slide in place of the work cards */
      /* 27 Oct (client: "Remove this section, redundant information"): "The services scope, from plant to tool." (ToolScope) is off
         this page, and no work cards stand in its place */
      works={false}
      /* 19 Oct (client feedback, PCU & TTI · "Direct header, no explanation"; IAQ: "Remove phrases that cannot be explained
         plainly"): the hero is the header and its line only; the 6 / 4 / 1 figures (marked wrong in the 13 Oct review) and
         the "Call PCU & TTI when" line are off it */
      hideWhen
      hard={{ k: 'The last work done, with the least margin for error.', t: 'The facility is finished, the cleanroom is live, the tool is worth more than the room, and the programme arrives compressed. The work is planned and sequenced to hold the date.' }}
      /* 21 Oct ("remove"): the "What arrives, what leaves." pair (Delivered, Producing) is off the page */
      /* 24 Sep (client: "To remove below section, repetitive from its top description"): the At a glance ledger is gone */
      /* 29 Sep (client): both halves of the unit, PCU then TTI. The PCU line is the page's own (the utilities section's
         lede and the first `what` paragraph); the TTI line is the hero's, moved here as the client asked. */
      /* 19 Oct (client feedback, PCU & TTI · Introduction to PCU & TTI): IAQ's heading and paragraph, in place of "What PCU &
         TTI is." and its PCU and TTI halves (29 Sep). Spelling slip only corrected ("competion"). */
      whatHead={<>Manufacturing Readiness <em>Start Here</em></>}
      whatParts={[
        { t: 'A production facility is only ready when its manufacturing equipment and utility systems operate as one. IAQ delivers integrated PCU and TTI solutions that connect critical utility infrastructure with manufacturing tools, enabling a seamless transition from facility completion to operational readiness.' },
      ]}
      what={[
        'Total Tool Installation connects production equipment fully and precisely into the facility it sits in. IAQ designs, installs and commissions the process critical utilities, then brings each of them to the tool.',
        /* SL questionnaire, section D, in IAQ's own terms */
        'The utilities are built in two sections. The bulk systems are designed and built with the base build. Once the building is complete and the tools arrive, each utility is tapped from its valve manifold and connected into the tool: the hook-up.',
        'Hook-up is the work between a delivered machine and a producing machine. The tool arrives on the floor as an inert box. Hook-up is every connection that makes it part of the line: power, gases, chemicals, water, exhaust, drainage, signals and safety interlocks.',
        'It is the last work done and the one with the least margin for error. The facility is finished, the cleanroom is live, the tool is worth more than the room, and the programme arrives compressed. The work is planned and sequenced to hold the date.',
      ]}
      /* 17 Sep: IAQ's own Revit extract for this system, from the SharePoint share */
      /* 25 Sep (Bazil: "3 sub pages business unit"): the Process Critical Utilities page folds in here as the unit's
         first half, its five steps as the utilities section; the four phases below are the tool installation */
      /* 22 Oct (IAQ amendment sheet, PCU & TTI · Capabilities, High): "What We Deliver" as two capability cards, IAQ's text as
         given ("Installlation", "Tetsing" corrected). 22 Oct ("remove the image"): the model pictures are off both cards. They replace the five-step utilities strip below (servicesHead etc., kept). */
      capCards={{
        head: <>What We <em>Deliver</em></>,
        cards: [
          { t: 'Process Critical Utilities', d: 'Specialised utility systems that support the safe and reliable operation of semiconductor manufacturing facilities.',
            listHead: 'Core Solutions',
            items: [
              { t: 'Specialty Gas Systems', icon: 'gas' },
              { t: 'Chemical Distribution Systems', icon: 'flask' },
              { t: 'Ultra-Pure Water (UPW)', icon: 'water' },
              { t: 'Process Exhaust Systems', icon: 'airflow' },
              { t: 'Waste Collection Treatment Systems', icon: 'sysWaste' },
            ] },
          { t: 'Total Tool Installation', d: 'Comprehensive equipment integration services supporting manufacturing start-up and production readiness.',
            listHead: 'Core Services',
            items: [
              { t: 'Equipment Move-In', icon: 'crate' },
              { t: 'Tool Installation', icon: 'pcuUnit' },
              { t: 'Utility Hook-Up', icon: 'link' },
              { t: 'System Integration', icon: 'layers' },
              { t: 'Testing & Verification', icon: 'gauge' },
              { t: 'Commissioning Support', icon: 'check' },
            ] },
        ],
      }}
      servicesHead={<>Process critical utilities, <em>run as one system.</em></>}
      /* 26 Sep: the five utility steps run in sequence, drawn as a process strip; the pair below reads as a change */
      servicesFlow
      modelsJoin="arrow"
      servicesLede="Specialty gases, chemicals, ultrapure water and exhaust, designed, installed and commissioned as one system. They are what the production tool actually consumes."
      services={[
        { t: 'Define the demand', icon: 'target', d: 'What each production tool consumes: gas purity and flow, chemical volumes, ultrapure water quality, exhaust duty. The demand schedule is set from the tool list, tool by tool.' },
        { t: 'Design the distribution', icon: 'drawing', d: 'Routing, materials and redundancy for each utility, sized against the demand schedule. The expansion case is allowed for at the outset.' },
        { t: 'Install to purity standards', icon: 'gas', d: 'Orbital welding, cleanliness protocols and materials handling appropriate to each service. Purity is built in at installation rather than recovered afterwards.' },
        { t: 'Test, purge and verify', icon: 'check', d: 'Pressure testing, purging and purity verification service by service, with documentation issued against each one.' },
        { t: 'Commission against the tool', icon: 'gauge', d: 'The utility is proven at the point of use, under the load the tool actually places on it.' },
      ]}
      bim={{ src: '/assets/iaq/bim-hookup.webp', cap: 'The tool hook-up layout in the model: the machines, their drops and the services that reach them.', alt: 'An isometric view of the tool hookup model' }}
      pull="The last work done, with the least margin for error."
      /* 18 Sep, cross-check: IAQ's own four phases, from the unit head's answer in the SL (Utility) questionnaire,
         section D. They replace the six generic steps written from the plan brief. */
      /* 15 Oct ("remove", on The project cycle, stage by stage): the cycle section is off this page, as on EPC; the stages
         stay in the props */
      hideCycle
      steps={[
        { k: 'Facilitize', t: 'Facilitization, before the tool arrives', d: 'Everything upstream of the tool’s connection point is built to the equipment maker’s facility requirements: the sub-fab and chase, the power, the structure and the room itself. The frozen tool layout is the gate. Late layout changes are the most common source of rework.', covers: ['VMBs and VMPs for specialty gases', 'UPW and PCW loops, vacuum, drains, N₂ and CDA', 'Exhaust branches, each stream ducted separately', 'Power drops, panels, UPS and EMI surveys', 'Floor cut-outs, loading and vibration criteria', 'Bay ISO class, AMC, temperature and humidity'] },
        { k: 'Rig in', t: 'Rig-in and move-in', d: 'The tool is uncrated in a de-trash airlock, so cardboard and wood stay outside the cleanroom. It is wiped down through the cleanliness zones, moved along a pre-agreed route, then set, levelled, anchored and seated on vibration isolation.', covers: ['De-trash airlock and staged wipe-down', 'Agreed tool route and floor protection', 'Set, level, anchor, vibration isolation'] },
        { k: 'Hook up', t: 'Hook-up proper', d: 'Each utility is tapped from the facility and connected into the tool, to its own standard. This is the work a cleanroom contractor actually sells.', covers: ['Process gas: electropolished 316L, orbital welded, logged', 'UPW, PCW and chiller lines, drains to the right waste stream', 'Vacuum fore-line and abatement tie-in', 'Exhaust connected and flow set per port', 'Power, grounding, bonding and EMO tie-in', 'Controls, toxic gas monitoring and interlocks', 'SECS/GEM network and AMHS interface'] },
        { k: 'Commission', t: 'Commissioning', d: 'Every connection is proven before production: leak tested, purged and dried down to specification, balanced, and tested for continuity and every safety trip. The tool is then handed to the client’s operations team.', covers: ['Pressure decay and helium leak testing, hydro on water lines', 'Purge, passivation and moisture dry-down', 'Exhaust balancing and airflow verification', 'Continuity, ground resistance, phase rotation', 'EMO, gas alarm and exhaust loss trip tests'] },
      ]}
      /* 17 Sep: the scope list moved onto the stages above as `covers` (client: merge it with the
         lifecycle), and the detail under each stage is the BU head's own answer in the SL (Utility)
         questionnaire, section D. */
      /* 21 Oct (IAQ amendment sheet, PCU & TTI · Delivery Approach): "Horizontal Journey Graphic: Facilitisation --> Move-In &
         Installation --> Utility Integration --> Testing & Commissioning. Each stage: simple icon, one line explanation". IAQ's
         heading, stages and lines; spelling slip only corrected ("tolls"). */
      process={{
        head: <>Our Delivery <em>Approach</em></>,
        journey: true,
        steps: [
          { k: 'Facilitisation', icon: 'building', t: 'Preparing facility infrastructure and utility systems for equipment installation' },
          { k: 'Move-In & Installation', icon: 'crate', t: 'Positioning and installing manufacturing equipment' },
          { k: 'Utility Integration', icon: 'gas', t: 'Connecting tools to critical utilities and support systems' },
          { k: 'Testing & Commissioning', icon: 'check', t: 'Verifying system performance and operational readiness' },
        ],
      }}
      /* 21 Oct (IAQ amendment sheet, PCU & TTI · Section for PCU & TTI Statement, High): IAQ's statement, verbatim; the three
         facility types it names are set out under it */
      statement={{
        kicker: 'PCU & TTI',
        label: 'PCU and TTI statement',
        text: <>Our PCU and TTI solutions are dedicated to semiconductor manufacturing environments, supporting <em>wafer fabrication, advanced packaging and backend facilities</em> through specialised utility and equipment integration services.</>,
        items: [
          { t: 'Wafer Fabrication', icon: 'chip' },
          { t: 'Advanced Packaging', icon: 'layers' },
          { t: 'Backend Facilities', icon: 'factory' },
        ],
      }}
      /* 21 Oct (IAQ amendment sheet, PCU & TTI · Why Clients Partner with IAQ): IAQ's heading and four reasons, in place of the
         five written on 15 to 18 Sep; spelling slip only corrected ("Focue"). Each is drawn as a scene, as the Careers
         values are ("like this animation"). They follow the delivery approach and the
         statement, as the sheet orders them. */
      whyHead={<>Why Clients Partner <em>with IAQ</em></>}
      whyAfterServices
      why={[
        { k: 'Integrated Delivery', icon: 'link', scene: 'puzzle', t: 'Utility infrastructure and tool installation delivered through a coordinated execution framework.' },
        { k: 'Semiconductor Focus', icon: 'chip', scene: 'wafer', t: 'Dedicated expertise supporting the unique requirements of semiconductor manufacturing facilities.' },
        { k: 'Technical Excellence', icon: 'compass', scene: 'plan', t: 'Disciplined planning, coordination and execution throughout every project phase.' },
        { k: 'Manufacturing Readiness', icon: 'factory', scene: 'bridge', t: 'Helping clients bridge the gap between facility completion and production start-up.' },
      ]}
      /* 17 Sep: the section D slot is closed. The BU head's answer in
         2026.07.27_IAQ BM Questionnaire_SL (Utility).xlsx sets out the four phases, and they are on
         the stages above. What the questionnaire does NOT clear is a reference project: "old
         projects only back in 2008" and client names "none", so the proof strip below stays on the
         registry's own semiconductor entries with no client named. */
      proofLink={{ label: 'See all semiconductor projects', to: '/projects#semiconductor' }}
      filter={p => p.ind === 'semiconductor'}
      proofNote="Published by scope and location only. Client names are withheld where the contract requires it."
      /* the note restates the Survey step above */
      cta={{ label: 'Plan a tool hook-up', route: '/contact', title: 'Plan the hook-up before the tool lands.', note: 'Send the tool list and the move-in date. Discrepancies are found at survey, not on the day the tool arrives.' }}
    />
  )
}
