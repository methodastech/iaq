import React from 'react'
import Icon from './FlowIcon.jsx'
import ToolInstallDiagram from './ToolInstallDiagram.jsx'
import { jargon } from '../lib/jargon.jsx'
import '../styles/tool-scope.css'

/* ============================================================================
   ToolScope · 25 Sep 2026. Bazil, on the PCU & TTI page's work cards: "wouldn't this be better replaced with picture 2",
   picture 2 being IAQ's own company profile slide "Services Scope": the Main Tool schematic beside two lists, Process
   Critical Utilities and Tool Installations Hook Up. The lists are IAQ's words in the site's sentence case. The slide's
   entity name stays off the public page. Colours follow the schematic's own legend: green is the facility base build,
   red is the tool install, which is also the site's system green and service red.
   ============================================================================ */
const PCU = [
  ['Water solutions', 'UPW plant and distribution, process waste drains, WWT, reclaim, ZLD, chemical storage tanks and dispensing'],
  ['Chemical and slurry solutions', 'Bulk chemical, blending and dispense systems'],
  ['Gas solutions', 'Bulk gas, specialty gas and abatement, bunker (NH₃, SiH₄, H₂) and liquid dispense system'],
  ['Process exhaust solutions', 'General, acid, caustic, solvent and calamity exhaust'],
]
const TTI = [
  'Bulk gas', 'Specialty gas', 'Process chemicals', 'Ultrapure water', 'Process cooling water', 'Process drain',
  'Process vacuum', 'High vacuum', 'Process exhaust', 'Gas detection and monitoring', 'Electrical power and controls',
]

export default function ToolScope() {
  return (
    <div className="tsc">
      <h2 id="un-scope-h" className="un-h2" data-rv="">The services scope, <em style={{ whiteSpace: 'nowrap' }}>from plant to tool.</em></h2>
      <p className="tsc-lede" data-rv="" style={{ '--d': '.06s' }}>Engineering, procurement and construction management of process critical utility infrastructure and total tool installations, for semiconductor manufacturing.</p>
      <figure className="tsc-fig" data-rv="" style={{ '--d': '.1s' }}>
        <ToolInstallDiagram />
        <figcaption>IAQ&rsquo;s Main Tool schematic, redrawn for scope illustration. Connection detail follows each tool&rsquo;s own configuration.</figcaption>
      </figure>
      <div className="tsc-cols">
        <div className="tsc-col tsc-pcu" data-rv="" style={{ '--d': '.06s' }}>
          <h3><Icon name="pcuUnit" />Process critical utilities</h3>
          <p className="tsc-k">Built with the base build</p>
          <ul className="tsc-groups">
            {PCU.map(([k, d]) => <li key={k}><b>{k}</b><span>{jargon(d)}</span></li>)}
          </ul>
        </div>
        <div className="tsc-col tsc-tti" data-rv="" style={{ '--d': '.12s' }}>
          <h3><Icon name="link" />Tool installation hook-up</h3>
          <p className="tsc-k">Connected into each tool</p>
          <ul className="tsc-list">
            {TTI.map(t => <li key={t}>{t}</li>)}
          </ul>
        </div>
      </div>
    </div>
  )
}
