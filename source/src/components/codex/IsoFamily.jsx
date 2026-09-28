import React from 'react'
import IsoIcon from '../IsoIcon.jsx'

/* the isometric icon family, recorded in the Codex (24 Sep 2026, Bazil: "save this icon in the Codex") */
const ROWS = [
  ['Services', '#EC2027', [['design', 'Design'], ['procure', 'Procurement'], ['construct', 'Construction'], ['commission', 'Commissioning'], ['maintain', 'Maintenance'], ['hookup', 'Tools hookup']]],
  ['Business units', '#0B8FD8', [['epc', 'EPC'], ['hookupUnit', 'PCU & TTI'], ['efm', 'EFM']]],
  ['Work', '#231F20', [['csa', 'CSA'], ['mep', 'MEP'], ['process', 'Process utilities']]],
  ['Records', '#EC2027', [['plant', 'Plant'], ['award', 'Award'], ['medal', 'Medal'], ['safety', 'Safety']]],
  ['Systems', '#0FA968', [['piles', 'Piling'], ['frame', 'Frame'], ['envelope', 'Envelope'], ['finishes', 'Finishes'], ['duct', 'Air'], ['pipe', 'Pipework'], ['chiller', 'Chiller'], ['fire', 'Fire'], ['electrical', 'Electrical'], ['tank', 'Water'], ['gas', 'Gases'], ['vacuum', 'Vacuum and exhaust']]],
]
export default function IsoFamily() {
  return (
    <section className="cx-iso" aria-labelledby="cx-iso-h" data-noab="">
      <div className="pg-in">
        <h3 id="cx-iso-h" className="cx-h3">The icon family, <em>one isometric grammar.</em></h3>
        <p className="cx-p">Two to four solids on one grid, three flat tones, one accent in the kind’s colour: red for a service, blue for a unit, black for work, green for a system (Bazil, 25 Sep). Drawn by components/IsoIcon.jsx; used on the Services page and the map.</p>
        {ROWS.map(([name, accent, items]) => (
          <div className="cx-iso-row" key={name}>
            <b style={{ color: accent }}>{name}</b>
            <ul>{items.map(([k, t]) => <li key={k}><IsoIcon name={k} accent={accent} /><span>{t}</span></li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  )
}
