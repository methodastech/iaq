import React from 'react'

/* ============================================================================
   ModelIcon · one drawn mark per delivery model.
   25 Sep 2026, late night (Bazil, on the icon library: "the delivery models need to have hard corners, like the line
   marks"). Redrawn on the line mark frame (components/HeroLineMarks.jsx): 24 grid, baseline y 20, centre x 12, height
   15.5, width 13 to 16; one stroke weight, butt caps, mitre joins; straight lines only, no circles, no dashes; and ONE
   red part per mark, the part that says what the model is:
     EPCC        the contract, its terms, and the tick of one party answering for all of it: the tick is red
     EPCM        IAQ above three contractors, the owner holding their contracts: IAQ's box is red
     Standalone  one block on its own ground: the ground is red
     On the EPC or EPCM model  the same block held inside the larger contract's frame: the frame is red
     Cooling as a Service      the cold, and the meter that bills it: the metered part is red
     Energy Performance Contracting  energy, and the bill stepping down: the last bar, the saving, is red
     Build Operate Transfer    the plant IAQ builds and runs, handed on: the handover arrow is red
   The red reads --mdl-sig (IAQ red by default); a shape prefixed F: is filled rather than stroked.
   The earlier set, with its circles and its dashed meter arc, is in src/_backups/design-apps-0925/ModelIcon.jsx.
   ============================================================================ */
const P = {
  EPCC: ['M5.5 4.5h9l4 4V20h-13z', 'M14.5 4.5v4h4', 'M8 9.5h4.5M8 12h7.5M8 14.5h7.5', 'M8.3 17.3l1.5 1.5 3.2-3.3'],
  EPCM: ['M12 8.5V12M6 12h12M6 12v3.5M12 12v3.5M18 12v3.5', 'M4 15.5h4V20H4zM10 15.5h4V20h-4zM16 15.5h4V20h-4z', 'F:M9.5 4.5h5v4h-5z'],
  Standalone: ['M12 4.5l6 3.46-6 3.46-6-3.46z', 'M6 7.96v7.5l6 3.46 6-3.46v-7.5M12 11.42v7.5', 'M4 20h16'],
  'On the EPC or EPCM model': ['M12 7.8l4 2.31-4 2.31-4-2.31z', 'M8 10.11v4.6l4 2.31 4-2.31v-4.6M12 12.42v4.6', 'M4 8.5v-4h4M16 4.5h4v4M20 16v4h-4M8 20H4v-4'],
  'Cooling as a Service': ['M12 4.5v12M6.8 7.5l10.4 6M6.8 13.5l10.4-6', 'M13.3 4.9 12 6.4l-1.3-1.5M10.7 16.1 12 14.6l1.3 1.5M7.8 6.57l.65 1.88-1.95.38M16.2 14.43l-.65-1.88 1.95-.38M6.5 12.17l1.95.38-.65 1.88M17.5 8.83l-1.95-.38.65-1.88', 'M5 18h14v2H5z', 'F:M5 18h8v2H5z'],
  'Energy Performance Contracting': ['M8.95 4.5 4.5 13.11h3.18L7.04 20l4.46-8.61H8.32z', 'M13 9h1.8v11H13zM15.6 12h1.8v8h-1.8z', 'F:M18.2 15H20v5h-1.8z'],
  'Build Operate Transfer': ['M4.5 20V9.5h8V20', 'M9 9.5v-5h2.2v5', 'M6.5 12.5h4M6.5 15.5h4', 'M4 20h9.5', 'M14 14.5h5.5M17 12l2.5 2.5-2.5 2.5'],
}
export const MODEL_ICON_KEYS = Object.keys(P)
const draw = (d, k, sig) => {
  const fill = d.startsWith('F:')
  const path = fill ? d.slice(2) : d
  const color = sig ? 'var(--mdl-sig, #EC2027)' : 'currentColor'
  return fill ? <path key={k} d={path} fill={color} stroke="none" /> : <path key={k} d={path} stroke={color} strokeWidth={sig ? 1.4 : 1} />
}
export default function ModelIcon({ name, className }) {
  const key = P[name] ? name : MODEL_ICON_KEYS.find(k => name && name.toLowerCase().startsWith(k.toLowerCase())) || (name && /epcm/i.test(name) ? 'EPCM' : /epcc/i.test(name) ? 'EPCC' : /cooling/i.test(name) ? 'Cooling as a Service' : /performance/i.test(name) ? 'Energy Performance Contracting' : /standalone/i.test(name) ? 'Standalone' : /transfer/i.test(name) ? 'Build Operate Transfer' : 'On the EPC or EPCM model')
  const shapes = P[key]
  return (
    <svg className={'mdl-ic' + (className ? ' ' + className : '')} viewBox="0 0 24 24" fill="none" strokeLinecap="butt" strokeLinejoin="miter" aria-hidden="true">
      {shapes.map((d, i) => draw(d, i, i === shapes.length - 1))}
    </svg>
  )
}
