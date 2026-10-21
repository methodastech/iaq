import React from 'react'
import { Link } from 'react-router-dom'
import Icon from './FlowIcon.jsx'
import '../styles/tools-hookup-band.css'

/* ============================================================================
   ToolsHookupBand · 25 Sep 2026. Bazil, on version 2 of the Services banner: "tools hookup will have a dedicated section,
   like the diagram the client gave". Service 6 in IAQ's own four phases (the unit head's answer in the SL (Utility)
   questionnaire, first sentence of each) and IAQ's Main Tool schematic, redrawn. On the Services page and as stage 6
   of the services page. `embed` drops the band's own section padding for the services page.
   ============================================================================ */
const PHASES = [
  ['Facilitize', 'Facilitization, before the tool arrives', 'Everything upstream of the tool’s connection point is built to the equipment maker’s facility requirements: the sub-fab and chase, the power, the structure and the room itself.'],
  ['Rig in', 'Rig-in and move-in', 'The tool is uncrated in a de-trash airlock, so cardboard and wood stay outside the cleanroom.'],
  ['Hook up', 'Hook-up proper', 'Each utility is tapped from the facility and connected into the tool, to its own standard.'],
  ['Commission', 'Commissioning', 'Every connection is proven before production: leak tested, purged and dried down to specification, balanced, and tested for continuity and every safety trip.'],
]

/* 19 Oct: `bare` drops the band's own heading and sentence, for /services/all where the stage head carries them */
export default function ToolsHookupBand({ embed = false, id = 'tools-hookup', fold = false, bare = false }) {
  /* 26 Sep (Bazil: "easy to understand"): on the Services page the four phases carry the section and the schematic opens
     on demand (`fold`); the page was 1,700px of diagram at this point */
  return (
    <section className={'pg-sec thb' + (embed ? ' thb-embed' : '')} id={id} aria-labelledby={id + '-h'}>
      <div className="pg-in">
        {!bare && <>
        <h2 id={id + '-h'} className="kind-h k-s"><Icon name="link" className="kind-ic" />Tool Installation</h2>{/* 15 Oct (Sunny: "Use \"Tool Installation\" ... please stick to our wording"): IAQ's name, and it is service 5 */}
        <p className="pg-lede">Service 5. Each production tool is connected into the live facility and released to production, in four phases.</p>
        </>}
        {bare && <h3 id={id + '-h'} className="thb-sub">In four phases</h3>}
        <ol className="thb-ph">
          {PHASES.map(([k, t, d], i) => (
            <li key={k}><span className="thb-n">{i + 1}</span><b>{t}</b><p>{d}</p></li>
          ))}
        </ol>
        {/* 21 Oct (client review, Sunny: "This picture is actually P&C, remove"): the Main Tool schematic and its open button are
            gone (ToolInstallDiagram.jsx stays in the project) */}
        <p className="thb-by">Carried by <Link to="/services/tool-installation">PCU &amp; TTI <Icon name="arrow" /></Link></p>
      </div>
    </section>
  )
}
