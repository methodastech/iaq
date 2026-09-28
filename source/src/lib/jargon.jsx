import React from 'react'

/* 10 Sep audit: acronyms appeared with no expansion (CSA, MEP, EPCC…). `jargon(text)` returns the
   text with every known acronym wrapped in an <abbr> carrying its expansion, so a hover or a
   screen reader gets the words. GLOSSARY feeds the strip on the Services hub. */
export const GLOSSARY = [
  ['CSA', 'Civil, Structural and Architectural'],
  ['MEP', 'Mechanical, Electrical and Plumbing'],
  ['EPCC', 'Engineering, Procurement, Construction and Commissioning: IAQ delivers the whole project'],
  ['EPCM', 'Engineering, Procurement and Construction Management: IAQ manages the project on the client\u2019s behalf'],
  ['EPC', 'Engineering, Procurement and Construction'],
  ['EFM', 'Energy Facility Management'],
  ['T&C', 'Testing and Commissioning'],
  ['FFU', 'Fan Filter Unit: the ceiling units that make a cleanroom clean'],
  ['UPW', 'Ultra-pure water'],
  ['PCW', 'Process cooling water'],
  ['CDA', 'Clean dry air'],
  ['PV', 'Process vacuum'],
  /* 25 Sep: the PCU & TTI services scope (IAQ's slide) */
  ['WWT', 'Wastewater treatment'],
  ['ZLD', 'Zero liquid discharge'],
  ['ESCO', 'Energy Service Company, registered with Suruhanjaya Tenaga'],
  ['GMP', 'Good Manufacturing Practice, the pharmaceutical standard'],
  ['HVAC', 'Heating, ventilation and air-conditioning'],
  ['ACMV', 'Air-conditioning and mechanical ventilation'],
  ['BIM', 'Building Information Modelling: the coordinated 3D model of the facility'],
  ['RFQ', 'Request for quotation'],
  ['DLP', 'Defects liability period'],
  ['PCU', 'Process Critical Utilities'],
  ['TTI', 'Total Tool Installation'],
  ['VMB', 'Valve manifold box, where a gas or chemical line is tapped for a tool'],
  /* 15 Sep copy pass: acronyms buyers and candidates met with no expansion */
  ['EHS', 'Environment, health and safety'],
  ['OSH', 'Occupational safety and health'],
  ['DOSH', 'Department of Occupational Safety and Health, Malaysia'],
  ['CIDB', 'Construction Industry Development Board, Malaysia'],
  ['UKAS', 'United Kingdom Accreditation Service'],
  ['QAQC', 'Quality assurance and quality control'],
  ['M&E', 'Mechanical and electrical'],
  ['ISO', 'The international cleanroom classes: ISO 3 is the cleanest in common use, ISO 8 the least'],
]
const MAP = Object.fromEntries(GLOSSARY)
/* 15 Sep: the ISO entry explains cleanroom classes, so it only wraps "ISO" when a class number
   follows (ISO 5, ISO Class 1). "ISO 9001" is a management standard and stays plain. */
const PAT = { ISO: 'ISO(?=\\s(?:Class\\s)?[1-8]\\b)' }
const RX = new RegExp('\\b(' + GLOSSARY.map(([k]) => k).sort((a, b) => b.length - a.length).map(k => PAT[k] || k).join('|') + ')\\b')

export function jargon(text) {
  if (typeof text !== 'string' || !RX.test(text)) return text
  const out = []; let rest = text, i = 0
  while (rest) {
    const m = RX.exec(rest); if (!m) { out.push(rest); break }
    if (m.index) out.push(rest.slice(0, m.index))
    out.push(<abbr key={i++} title={MAP[m[1]]}>{m[1]}</abbr>)
    rest = rest.slice(m.index + m[1].length)
  }
  return out
}

export function Glossary({ keys }) {
  const rows = keys ? GLOSSARY.filter(([k]) => keys.includes(k)) : GLOSSARY
  return (
    <dl className="glossary">
      {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
    </dl>
  )
}
