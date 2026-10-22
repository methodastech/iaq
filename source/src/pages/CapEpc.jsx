import React from 'react'
import UnitPage from '../components/UnitPage.jsx'
import Icon from '../components/FlowIcon.jsx'

/* 19 Oct (client feedback, EPC · "The work, and the system inside it section to replace and update the information"): IAQ's
   own section in place of the generic work and systems cards, its six capabilities in IAQ's order, each with its mark.
   Spelling slip only corrected ("through a multidisciplinary team"). */
const CAPS = [
  ['compass', 'Engineering & Design'], ['crate', 'Procurement'], ['crane', 'Construction'],
  ['gas', 'Process Utilities'], ['link', 'Tool Installation'], ['gauge', 'Testing & Commissioning'],
]
/* 22 Oct ("this one looks pale", "dont repeated design", "make other design", then "make grid", "with icon follow branding
   design"): a grid of six, each with its own mark drawn to the house icon spec (RecordFlat.jsx: 24 grid, one fine ink
   weight, butt caps, ONE red element that carries the idea), and the logo's red bars as the card's accent. The red part
   lifts on hover. */
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: .85, strokeLinecap: 'butt', strokeLinejoin: 'miter' }
const R = { fill: 'none', stroke: '#EC2027', strokeWidth: 1.4, strokeLinecap: 'butt', strokeLinejoin: 'miter' }
const CAP_MARK = [
  /* engineering & design: a drawing sheet, a set square on it, the red dimension line */
  <><rect x="3.5" y="4" width="17" height="16" {...S} /><path d="M3.5 8h17" {...S} /><path d="M7 17.5V10.5l7 7z" {...S} /><g className="sig"><path d="M15 11h4M15 10v2M19 10v2" {...R} /></g></>,
  /* procurement: a crate on its pallet, the red tag that marks it delivered */
  <><path d="M5 8.5h11v8.5H5z" {...S} /><path d="M5 8.5 7.5 6h11L16 8.5M18.5 6v8.5L16 17" {...S} /><path d="M3.5 19.5h15" {...S} /><path d="M8 11.5h5" {...S} /><g className="sig"><path d="M19 9.5l2.2 2.2-2.2 2.2" {...R} /></g></>,
  /* construction: a tower crane, mast, jib and line, the red load on the hook */
  <><path d="M8 20.5V5M6 20.5h4" {...S} /><path d="M3.5 7.5h17M8 5l-4.5 2.5M8 5l7 2.5" {...S} /><path d="M17 7.5v5" {...S} /><g className="sig"><rect x="15.4" y="13.2" width="3.2" height="3" {...R} /></g></>,
  /* process utilities: two runs of pipe, a branch down, the red valve on the branch */
  <><path d="M3 7h18M3 10.5h18" {...S} /><path d="M12 10.5v9.5" {...S} /><path d="M6 6v5.5M18 6v5.5" {...S} /><g className="sig"><path d="M10 14.2h4l-4 3.2h4z" {...R} /></g></>,
  /* tool installation: the production tool, its utility panel, the red connector reaching it */
  <><rect x="9" y="4.5" width="11.5" height="15" {...S} /><path d="M9 9h11.5M12 12.5h5.5M12 15h5.5" {...S} /><path d="M3 12h3" {...S} /><g className="sig"><path d="M6 10.6h3v2.8H6z" {...R} /></g></>,
  /* testing & commissioning: a gauge, its scale, the red needle reading true */
  <><circle cx="12" cy="13" r="7.5" {...S} /><path d="M6.7 13H8M16 13h1.3M12 7.7V9M8.2 9.2l.9.9M15.8 9.2l-.9.9" {...S} /><circle cx="12" cy="13" r="1" {...S} /><g className="sig"><path d="M12.7 12.3l2.8-2.8" {...R} /></g></>,
]
function EpcCapabilities() {
  return (
    <div className="un-caps">
      <h2 id="un-scope-h" className="un-h2" data-rv="">Our EPC <em>Capabilities</em></h2>
      <p className="un-caps-lede" data-rv="" style={{ '--d': '.06s' }}>IAQ delivers EPC solutions through a multidisciplinary team of engineers, project managers and construction professionals. Our capabilities span the full project lifecycle, enabling efficient coordination and successful project delivery across complex industrial environments.</p>
      <ul className="un-capg">
        {CAPS.map(([, t], i) => (
          <li key={t} data-rv="" style={{ '--d': `${.08 + i * .05}s` }}>
            <span className="un-capg-bars" aria-hidden="true"><i /><i /><i /></span>
            <span className="un-capg-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <span className="un-capg-mk" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">{CAP_MARK[i]}</svg></span>
            <b>{t}</b>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* Copy provenance. Rebuilt 15 Sep from IAQ's own answers; the previous version is in
   src/_backups/epc-efm-0915/CapEpc.jsx. Every fact carries a source tag beside it.

   Keys
     Q-EPC-A, Q-EPC-B   Client info/IAQ/2026.07.27_IAQ BM Questionnaire (EPC).xlsx, sections A and B
     DV3                Downloads/IAQ-Questionnaire-01-Discovery V3.pdf, IAQ's answers A1.3 and A1.4
     PROFILE-16         Client info/IAQ/IAQ Utility Solutions Company Profile (Brief).pptx, slide 16
     LIVE-HOME          iaqtechnology.com.my, the stage descriptions on the home page
     LIVE-EPCC          iaqtechnology.com.my/epcc/, the phase by phase scope list
     LIVE-EPCM          iaqtechnology.com.my/epcm/
     HUB                the capabilities hub business-model blocks 01 to 03, carried on this page before
     REG                src/data/projects.js, the epcc and epcm type tags

   Flow choices
     The sequence uses the six stages IAQ gave in Q-EPC-A and confirmed in DV3 A1.3, in IAQ's order,
     which is also the order of the site's delivery cycle. The live /epcc/ page groups the same work
     into four phases; its line items fill the step detail, because a buyer reads what is delivered
     at each stage rather than a phase name.
     The scope is nine LIVE-EPCC items. The eleven it replaced collided at 1440.
     Section order stays the shared template's. IAQ asked for offering, benefits, company strength,
     project reference, contact (Q-EPC-A). The template already runs offering, sequence, scope,
     benefits, proof, contact, so company strength is carried in the benefit beats.

   Left out on purpose
     Contract values from the live history page. The client names in Q-EPC-A's ideal client answer,
     which describe who IAQ targets and are not cleared references.                                   */

export default function CapEpc() {
  return (
    <UnitPage
      id="cap-epc"
      no="1"
      /* 18 Sep (Nabilah: "EPC and Construction is wrong, EPC already includes construction") */
      name="EPC"
      full="Engineering, Procurement & Construction"
      /* 19 Oct (IAQ feedback, EPC · Headline and value proposition): IAQ's headline, as given. "One contract, from first
         drawing to final handover" went with it: it implied every project runs every phase */
      title={<>Engineering, Procurement &amp; Construction <em style={{ whiteSpace: 'nowrap' }}>(EPC)</em></>}
      /* Q-EPC-B: one-stop solution; design, procurement, construction; the system operates as intended. HUB: single contract. 15 words. */
      lede="Engineering, procurement and construction under one contract, scoped to what each project needs. IAQ answers for the system working as intended."
      /* LIVE-EPCC and LIVE-EPCM; single point of contact Q-EPC-B; 12 to 24 months Q-EPC-B */
      /* 19 Oct (IAQ feedback, EPC · Metrics: "No blanket duration claim"): "Typically 12 to 24 months" is gone */
      chips={['EPCC · EPCM', 'Single point of contact']}
      /* 17 Sep: IAQ's own photograph from the SharePoint share (Cleanroom Photos/IMG_8578), a finished
         ballroom at handover. It replaces the Higgsfield still and its clip, so the representation tag goes. */
      /* 25 Sep (Bazil: "add video of clean room", IMG_8588 and IMG_8589 "a good representation of clean room", "remove
         reflection, not supposed to have reflection"): the banner is a 16 s loop made from those two IAQ photographs, a slow
         walk down the corridor and into the bay, joined by dissolves. Both show a semiconductor cleanroom as it is built:
         matte perforated raised floor, a ceiling grid of fan filter units with light strips, flush wall panels. The light
         strip mirrored on the corridor's wall panels is retouched out. Photographs, so no representation tag. The poster is
         the loop's first frame; the ballroom photograph (IMG_8578) stays on the About page. */
      /* 25 Sep, evening (Bazil: "please use Higgsfield"): the loop is now two Higgsfield (Seedance 2.5) walks made from the
         same two photographs, picked for staying true to them (the corridor's side door, the bay's filter ceiling, matte
         floors), joined by dissolves into a seamless 14 s loop. Generated motion, so the hero carries the Representation
         tag. The photograph-only loop is kept as videos/cr-cleanroom-reel.mp4. */
      image={{ src: '/assets/iaq/cr-reel-hf-poster.webp', video: '/assets/videos/cr-cleanroom-reel-hf.mp4', alt: 'Inside a cleanroom built by IAQ: a corridor and a production bay, raised perforated floor and a lit ceiling grid of filter units', hero: true }}
      rep
      /* the band below is IAQ's own photograph, so only the hero is tagged */
      bandRep={false}
      /* 15 Sep (UnitPage): three facts on the hero, the two contract models as cards, the one-contract diagram.
         Facts: single point of contact Q-EPC-B; 12 to 24 months Q-EPC-B; six stages Q-EPC-A and DV3 A1.3. */
      /* 17 Sep: IAQ's own drone photograph of a delivered plant, from the SharePoint share, in place
         of the generated still. The Representation tag goes with it: this is the real thing. */
      band="/assets/iaq/plant-dusk-02.webp"
      art="epc"
      /* 19 Oct (IAQ feedback, EPC · Metrics: "Remove all the metrics on this section"): the three hero figures are gone
         (1 point of contact, 12 to 24 months, 4 stages); UnitPage prints no figure row when the list is empty */
      facts={[]}
      /* 19 Oct (client feedback, EPC · Contract models and scope relationship: "Remove this section entirely"; IAQ: "Do not
         publish a simplified two-model framework unless management confirms it is complete"): the "Two contract models, one
         accountable team." section (the EPCC and EPCM cards) is off the page; the cards are in git history */
      /* the ledger: HUB blocks 01 and 02, LIVE-EPCC and LIVE-EPCM; duration Q-EPC-B */
      /* 25 Sep (Bazil: "no need this kind of complex info"): the At a glance ledger is off the page; the two model cards say it */
      /* 19 Oct (client feedback, EPC · Definition): IAQ's heading and paragraph in place of "What EPC is." and its EPC
         definition. The sheet's paragraph is cut off at "the highest standards of quality,"; it ends at "quality" here until
         IAQ's last words are in. */
      whatHead={<>Integrated Project <em>Delivery</em></>}
      whatParts={[
        { t: 'Complex facilities require more than technical expertise. They demand seamless coordination across engineering, procurement and construction to ensure every element is aligned from concept to commissioning. Through an integrated project delivery approach, IAQ combines multidisciplinary expertise, meticulous planning and disciplined execution to deliver facilities that meet the highest standards of quality.' },
      ]}
      what={[
        /* Q-EPC-B, "What does EPC stand for and mean in IAQ's context" */
        'EPC stands for Engineering, Procurement and Construction. It is a one-stop solution. IAQ designs and engineers the system, procures the equipment and materials, and carries out the installation and construction works. IAQ also makes sure the system operates as intended on completion.',
        /* project type and cleanroom origin Q-EPC-B; sector list Q-EPC-B in IAQ's corrected order from DV3 A1.4; client type Q-EPC-A */
        'It is used most for hi-tech facilities that need a cleanroom. IAQ began as a cleanroom specialist. The sectors are semiconductor, data centre, EV battery, photovoltaics, district cooling and heating, Bio LifeScience, and food and beverages. Clients are industrial and multinational manufacturers, including fab owners.',
        /* 15 Sep (UnitPage): the paragraph that followed this note now lives in the model cards below, so it is not printed twice.
           EPCC against EPCM Q-EPC-B; owner keeps the construction contracts, IAQ coordinates contractors, schedule and cost HUB block 02; commissioning and start-up are listed on LIVE-EPCC and not on LIVE-EPCM */
      ]}
      /* Q-EPC-B, "What level of single-point accountability" */
      /* 17 Sep: IAQ's own Revit extract for this system, from the SharePoint share */
      scope={<EpcCapabilities />}
      bim={{ src: '/assets/iaq/bim-archi.webp', cap: 'The architectural model of a hi-tech facility, taken from IAQ’s own Revit coordination model.', alt: 'An isometric view of a facility’s architectural model' }}
      /* 25 Sep (Bazil: "remove the first picture"): the claim band's photograph is off this page */
      cycle={{ map: [0, 1, 2, 3], dim: [4, 5] }}
      cycleLede="The four stages EPC carries, in the order they run on site."

      /* 9 Oct ("remove this section", on The project cycle, stage by stage): the cycle section is off this page; the stages
         stay here for the day it returns */
      hideCycle
      /* 21 Oct ("remove this"): the "Call EPC when" line is off the hero, as on PCU & TTI */
      hideWhen
      steps={[
        /* stage Q-EPC-A 1 and DV3 A1.3; concept to plans, specifications and drawings, CSA to MEP LIVE-HOME; feasibility, master planning, detail design disciplines, BIM, permitting LIVE-EPCC */
        { k: 'Design', t: 'Engineering design and consultation', d: 'IAQ turns the client’s concept into detailed plans, specifications and drawings. Work starts with a feasibility study and master planning. Detail design covers architecture, civil and structural, MEP, HVAC and process. The design is modelled in BIM. Permitting sits in the same stage.', covers: ['Feasibility study', 'Detail design and BIM'] },
        /* stage Q-EPC-A 2; tracked system and alignment with requirements, quality and budget LIVE-HOME; prequalification, strategy, tenders, estimates, cost analysis LIVE-EPCC */
        { k: 'Procure', t: 'Procurement', d: 'Every procurement activity is tracked in one organised system. Suppliers are prequalified and evaluated. IAQ sets the procurement strategy and prepares the tenders. Budget estimates and detailed cost analysis are done in the same stage. Purchasing stays aligned with the project requirements, quality standards and budget.', covers: ['Procurement strategy and planning'] },
        /* stage Q-EPC-A 3; tailored construction programme, on schedule and within budget LIVE-HOME; safety, QA and QC, schedule and cost control, technical interfacing LIVE-EPCC */
        { k: 'Construct', t: 'Construction', d: 'IAQ manages the site through a construction programme tailored to the client. Safety management, quality control and quality assurance run through the build. Schedule and cost are controlled. Technical interfaces are coordinated across the works.', covers: ['Construction management', 'Construction safety, QA and QC', 'Programme and cost control'] },
        /* stage Q-EPC-A 4; established programme, issues rectified before handover, operates as intended LIVE-HOME; start-up, qualification, validation, as-built documentation LIVE-EPCC */
        { k: 'Commission', t: 'Testing and commissioning', d: 'Testing and commissioning follow IAQ’s established programme. Any issue or deficiency is found and put right before handover. The facility is proven to operate as intended and to meet every specified requirement. Start-up, qualification, validation and as-built documentation close the stage.', covers: ['Commissioning and start-up', 'As-built documentation'] },
      ]}
      /* 17 Sep: the nine LIVE-EPCC scope lines moved onto their stage above (client: merge with
         the lifecycle and remove the section). They are the `covers` arrays in steps. */
      /* 21 Oct (IAQ amendment sheet, EPC · Why IAQ): IAQ's five reasons, in its order and words, in place of "Why owners choose it." */
      whyHead={<>Why Integrated Project <em>Delivery Matters</em></>}
      whyAfterScope   /* 21 Oct: after Our EPC Capabilities, the sheet's order */
      why={[
        { k: 'Enhanced Coordination', icon: 'link', t: 'Improved collaboration between design, procurement and construction teams throughout the project lifecycle.' },
        { k: 'Reduced Project Complexity', icon: 'layers', t: 'A structured delivery framework that helps streamline decision-making and project execution.' },
        { k: 'Improved Schedule Certainty', icon: 'calendar', t: 'Early planning and coordinated execution help minimise delays and improve delivery confidence.' },
        { k: 'Quality & Safety Focus', icon: 'shield', t: 'Consistent management of quality and safety standards across all phases of the project.' },
        { k: 'Operational Readiness', icon: 'check', t: 'A lifecycle approach that supports a smoother transition from project completion to facility operation.' },
      ]}
      /* what no source answers: FAQ row blank in Q-EPC-A; Q-EPC-B gives a range but no fast-track answer; only two REG projects carry a model tag */
      slot={{
        tag: 'Supplied by IAQ',
        title: 'Still to come from the EPC questionnaire, sections A and B',
        items: [
          'The questions clients ask before signing an EPC contract (the row was left blank)',
          'Whether “Fast-Track Project” is an approved service or project descriptor',
          'Which reference projects ran as EPCC and which as EPCM',
        ],
      }}
      /* REG: only projects tagged with a contract model, so the heading "Delivered this way" holds */
      filter={p => p.type === 'epcc' || p.type === 'epcm'}
      proofNote="Projects tagged EPCC or EPCM in IAQ’s registry, published by scope and location only. Client names are withheld where the contract requires it."
      /* Q-EPC-A: a visitor contacts the PIC at business@iaqtechnology.com.my, which the contact page carries */
      /* title and note: single point of contact Q-EPC-B; the reply line is the site's own promise */
      /* 21 Oct (IAQ amendment sheet, EPC · CTA): IAQ's heading and line as a section of its own above the footer. Spelling
         slips only corrected ("Discuss", "operationally"). */
      ctaBand={{ title: <>Let&rsquo;s Discuss Your <em>Project Goals</em></>, label: 'Discuss your project', route: '/contact',
        lede: 'Whether planning a new facility, expanding existing operations or upgrading critical infrastructure, IAQ delivers integrated EPC solutions that transform complex requirements into operationally ready facilities.' }}
      cta={{ label: 'Discuss an EPC project', route: '/contact', title: 'One contract for the whole facility.', note: 'Tell us the facility and the programme. One point of contact carries it from design to handover.' }}
    />
  )
}
