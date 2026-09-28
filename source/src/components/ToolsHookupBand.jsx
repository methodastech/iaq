import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './FlowIcon.jsx'
import ToolInstallDiagram from './ToolInstallDiagram.jsx'
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

export default function ToolsHookupBand({ embed = false, id = 'tools-hookup', fold = false }) {
  /* 26 Sep (Bazil: "easy to understand"): on the Services page the four phases carry the section and the schematic opens
     on demand (`fold`); the page was 1,700px of diagram at this point */
  const [open, setOpen] = useState(!fold)
  return (
    <section className={'pg-sec thb' + (embed ? ' thb-embed' : '')} id={id} aria-labelledby={id + '-h'}>
      <div className="pg-in">
        <h2 id={id + '-h'} className="kind-h k-s"><Icon name="link" className="kind-ic" />Tools hookup</h2>
        <p className="pg-lede">Service 6. Each production tool is connected into the live facility and released to production, in four phases.</p>
        <ol className="thb-ph">
          {PHASES.map(([k, t, d], i) => (
            <li key={k}><span className="thb-n">{i + 1}</span><b>{t}</b><p>{d}</p></li>
          ))}
        </ol>
        {fold && (
          <button type="button" className={'thb-open' + (open ? ' is-open' : '')} aria-expanded={open} aria-controls={id + '-fig'} onClick={() => setOpen(o => !o)}>
            <Icon name="layers" /><span>{open ? 'Hide the Main Tool schematic' : 'See it on IAQ\u2019s Main Tool schematic'}</span><i aria-hidden="true">{open ? '\u2212' : '+'}</i>
          </button>
        )}
        {open && (
        <figure className="thb-fig" id={id + '-fig'}>
          <ToolInstallDiagram />
          <figcaption>IAQ&rsquo;s own Main Tool schematic, redrawn: the tool on the fab floor, the raised floor, the sub-fab equipment, and the lines between them in the direction they run.</figcaption>
        </figure>
        )}
        <p className="thb-by">Carried by <Link to="/services/tool-installation">PCU &amp; TTI <Icon name="arrow" /></Link></p>
      </div>
    </section>
  )
}
