import React from 'react'
import UnitPage from '../components/UnitPage.jsx'
import ToolScope from '../components/ToolScope.jsx'

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
      title={<>The last hundred metres, where a facility <em>becomes a fab.</em></>}
      lede="Tool hook-up connects production equipment into the facility it sits in. Here is what the work involves, step by step."
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
        video: '/assets/videos/hookup-team-rep.mp4',
        src: '/assets/iaq/hookup-team-rep.webp', hero: true,   /* 15 Sep: Higgsfield still, a connected tool in a bay, no people (the wrench shot was rejected: "the guy playing a screw"); no loop on this page */   /* 15 Sep: Higgsfield still, a representation */
        /* 26 Sep (Bazil: "the people in the video did not wear what the engineers wear in the 3D, nor the people in the
           picture I said", "please redo"): the team now wears IAQ's own site kit, as the walkthrough's engineers do and as
           the IAQ x UM Robocon team does: navy long-sleeve polo with the red IAQ chest logo, navy work trousers, white hard
           hat, mask, safety glasses, white gloves, light-blue shoe covers. Made in Higgsfield (GPT Image 2.5 still with the
           3D outfit and two Robocon photos as references, Seedance 2.5 loop). Still a representation; no real faces. */
        /* 25 Sep, 22:30 (Bazil: "make sure accurate like in 3D character, but too many people there, maybe max just 3 doing
           actual work"): three engineers, all hands-on (one torques a fitting with an open-end wrench, one seats a connector
           at the tool's utility panel, one opens a valve); nobody holding a tablet. GPT Image 2.5 edit of the previous still
           (job 5f9e3ce2), Seedance 2.5 start-image 8 s 1080p (job 348b2b04), 7 s loop with a 1 s seam dissolve. */
        alt: 'Representation: three IAQ engineers in navy site polos, hard hats and shoe covers hooking up a wrapped process tool: one tightens a stainless fitting with a wrench, one connects a cable at the utility panel, one opens a valve',
      }}
      rep
      /* 15 Sep (UnitPage): the hero facts, the "why it is hard" line, the hookup diagram. Six services and six steps
         are the page's own sequence and scope; sectors from the plan brief. */
      /* 17 Sep: IAQ's own photograph (SharePoint Cleanroom Photos/DSCN6580): the team crossing a finished ballroom.
         Nothing generated is left on this page, so no representation tag. */
      band="/assets/iaq/cr-team-dscn6580.webp"
      /* 26 Sep: the band is IAQ's own photograph; only the hero loop is generated, so only the hero carries the tag */
      bandRep={false}
      art="hookup"
      /* 25 Sep (Bazil: "wouldn't this be better replaced with picture 2"): IAQ's Services Scope slide in place of the work cards */
      scope={<ToolScope />}
      facts={[
        { v: '6', l: 'services connected to every tool' },
        /* 18 Sep, cross-check: the unit head's answer (SL questionnaire, section D) gives four phases and
           "semiconductor exclusively"; IAQ's Utility Solutions deck names front end, advanced packaging and back end */
        { v: '4', l: 'phases, from facilitization to commissioning' },
        { v: '1', l: 'sector: semiconductor, front end to back end' },
      ]}
      hard={{ k: 'The last work done, with the least margin for error.', t: 'The facility is finished, the cleanroom is live, the tool is worth more than the room, and the programme arrives compressed. The work is planned and sequenced to hold the date.' }}
      /* the pair: what the tool is when it lands and what it is when IAQ hands it over, from the page's own steps */
      modelsHead={<>What arrives, <em>what leaves.</em></>}
      models={[
        { t: 'Delivered', s: 'The tool lands', d: 'A boxed tool on the floor of a live, classified cleanroom, waiting to be connected and energised on a compressed programme.',
          pts: ['Footprint and drops set out against the as-built facility', 'Moved in with the classification held', 'Worth more than the room it sits in'] },
        { t: 'Producing', s: 'IAQ hands it over', d: 'Every service brought to the tool and terminated to its own specification, then proven before anyone switches it on.',
          pts: ['Power, gases, chemicals, UPW, exhaust and drainage connected', 'Pressure-tested, purged and verified', 'Interlocked into the facility, released with its documentation'] },
      ]}
      /* 24 Sep (client: "To remove below section, repetitive from its top description"): the At a glance ledger is gone */
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
      steps={[
        { k: 'Facilitize', t: 'Facilitization, before the tool arrives', d: 'Everything upstream of the tool’s connection point is built to the equipment maker’s facility requirements: the sub-fab and chase, the power, the structure and the room itself. The frozen tool layout is the gate. Late layout changes are the most common source of rework.', covers: ['VMBs and VMPs for specialty gases', 'UPW and PCW loops, vacuum, drains, N₂ and CDA', 'Exhaust branches, each stream ducted separately', 'Power drops, panels, UPS and EMI surveys', 'Floor cut-outs, loading and vibration criteria', 'Bay ISO class, AMC, temperature and humidity'] },
        { k: 'Rig in', t: 'Rig-in and move-in', d: 'The tool is uncrated in a de-trash airlock, so cardboard and wood stay outside the cleanroom. It is wiped down through the cleanliness zones, moved along a pre-agreed route, then set, levelled, anchored and seated on vibration isolation.', covers: ['De-trash airlock and staged wipe-down', 'Agreed tool route and floor protection', 'Set, level, anchor, vibration isolation'] },
        { k: 'Hook up', t: 'Hook-up proper', d: 'Each utility is tapped from the facility and connected into the tool, to its own standard. This is the work a cleanroom contractor actually sells.', covers: ['Process gas: electropolished 316L, orbital welded, logged', 'UPW, PCW and chiller lines, drains to the right waste stream', 'Vacuum fore-line and abatement tie-in', 'Exhaust connected and flow set per port', 'Power, grounding, bonding and EMO tie-in', 'Controls, toxic gas monitoring and interlocks', 'SECS/GEM network and AMHS interface'] },
        { k: 'Commission', t: 'Commissioning', d: 'Every connection is proven before production: leak tested, purged and dried down to specification, balanced, and tested for continuity and every safety trip. The tool is then handed to the client’s operations team.', covers: ['Pressure decay and helium leak testing, hydro on water lines', 'Purge, passivation and moisture dry-down', 'Exhaust balancing and airflow verification', 'Continuity, ground resistance, phase rotation', 'EMO, gas alarm and exhaust loss trip tests'] },
      ]}
      /* 17 Sep: the scope list moved onto the stages above as `covers` (client: merge it with the
         lifecycle), and the detail under each stage is the BU head's own answer in the SL (Utility)
         questionnaire, section D. */
      why={[
        { k: 'It is the critical path', icon: 'route', t: 'Hook-up is the last work before production, so the whole programme converges on it. Every day held to schedule is a day of output on the line.' },
        { k: 'The room is already live', icon: 'shield', t: 'This work happens inside a classified cleanroom that is finished and certified. Holding that classification while the tool goes in is the skill.' },
        { k: 'Semiconductor, front to back', icon: 'chip', t: 'Front end, advanced packaging and back end fabs. The sector where the tool is the investment and the facility exists to serve it.' },
        /* SL (Utility) questionnaire, section A: "1 stop solutions from EPC Contracting base build all
           the way to tool installation", and section D: standalone, but run on the EPC/EPCM model */
        { k: 'One route from base build', icon: 'building', t: 'The same company that built the facility connects the tools into it, so the last step stays inside one team.' },
        { k: 'Bought on its own', icon: 'link', t: 'It is a standalone service, run on the EPC or EPCM model, on a base facility built by IAQ or by others.' },
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
