import React from 'react'

/* ============================================================================
   UnitDiagramsV · how each unit works, drawn for a card (26 Sep 2026, Bazil: "put this into the card or make a
   better one, exactly and better, no overlap for each card"). Three SVGs on a 420-wide grid, tall rather than
   wide, every box sized for its words at 13px, so nothing overlaps at a card's width. The colour code: services
   red, the business unit blue, work yellow, systems green, delivery models ink. The wide set (UnitDiagrams.jsx)
   stays for the Codex.
   ============================================================================ */
const INK = '#0C1220', SOFT = '#66708A', UNIT = '#0B8FD8', SVC = '#EC2027', WORK = '#231F20', SYS = '#0FA968', LINE = '#C3D1E0', PALE = '#F3F6FB'
const TONE = { unit: UNIT, svc: SVC, work: WORK, sys: SYS, ink: LINE }
const Box = ({ x, y, w, h, t, s, tone = 'ink', fill }) => {
  const solid = tone === 'unitfill'
  const stroke = solid ? UNIT : TONE[tone] || LINE
  const bg = solid ? UNIT : (fill || '#fff')
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={bg} stroke={stroke} strokeWidth={solid ? 0 : 1.3} />
      <text x={x + w / 2} y={y + (s ? h / 2 - 3 : h / 2 + 5)} textAnchor="middle" className="ud-t" fill={solid ? '#fff' : INK}>{t}</text>
      {s && <text x={x + w / 2} y={y + h / 2 + 13} textAnchor="middle" className="ud-s" fill={solid ? '#DCEFFB' : SOFT}>{s}</text>}
    </g>
  )
}
const Arrow = ({ x1, y1, x2, y2, tone = LINE, dashed }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), hx = x2 - Math.cos(a) * 7, hy = y2 - Math.sin(a) * 7
  return (
    <g>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={tone} strokeWidth="1.4" strokeDasharray={dashed ? '4 3' : undefined} />
      <path d={`M ${x2} ${y2} L ${x2 - Math.cos(a - .5) * 8} ${y2 - Math.sin(a - .5) * 8} L ${x2 - Math.cos(a + .5) * 8} ${y2 - Math.sin(a + .5) * 8} Z`} fill={tone} />
    </g>
  )
}
const H = ({ x, y, t, s }) => <g><text x={x} y={y} className="ud-h" fill={INK}>{t}</text>{s && <text x={x} y={y + 18} className="ud-s" fill={SOFT}>{s}</text>}</g>

export function DgEpcV() {
  return (
    <svg viewBox="0 0 420 372" className="ud-svg ud-svg-v" role="img" aria-label="How EPC works, under EPCC and under EPCM">
      <H x={0} y={16} t="EPCC · one contract, IAQ delivers everything" s="IAQ answers for the system working as intended" />
      <Box x={0} y={50} w={78} h={40} t="Owner" />
      <Arrow x1={78} y1={70} x2={98} y2={70} tone={UNIT} />
      <rect x={98} y={44} width={230} height={90} fill="#EEF6FD" stroke={UNIT} strokeWidth="1.2" />
      <text x={106} y={58} className="ud-s" fill={UNIT}>IAQ, one contract</text>
      <Box x={106} y={64} w={104} h={28} t="Design" tone="svc" />
      <Box x={216} y={64} w={104} h={28} t="Procure" tone="svc" />
      <Box x={106} y={98} w={104} h={28} t="Construct" tone="svc" />
      <Box x={216} y={98} w={104} h={28} t="Commission" tone="svc" />
      <Arrow x1={328} y1={70} x2={344} y2={70} tone={UNIT} />
      <Box x={344} y={50} w={76} h={40} t="Handover" />
      <H x={0} y={168} t="EPCM · the owner holds the contracts" s="IAQ manages them; engaged on the biggest programmes" />
      <Box x={0} y={202} w={78} h={44} t="Owner" />
      <Arrow x1={78} y1={224} x2={104} y2={224} tone={UNIT} />
      <Box x={104} y={202} w={190} h={44} t="IAQ manages" s="design, programme and cost" tone="unitfill" />
      <Arrow x1={294} y1={224} x2={344} y2={224} tone={LINE} />
      <Box x={344} y={202} w={76} h={44} t="Handover" />
      {['Contractor A', 'Contractor B', 'Contractor C'].map((t, i) => <g key={t}>
        <Box x={i * 142} y={296} w={136} h={44} t={t} s="owner’s contract" />
        <Arrow x1={39} y1={246} x2={i * 142 + 30} y2={296} tone="#C8D0DB" />
        <Arrow x1={199} y1={246} x2={i * 142 + 100} y2={296} tone={UNIT} dashed />
      </g>)}
      <text x={0} y={364} className="ud-s" fill={SOFT}>grey: the owner’s contract · blue dashed: IAQ manages that contractor</text>
    </svg>
  )
}
export function DgHookupV() {
  const util = ['Gases', 'Chemicals', 'UPW', 'Exhaust', 'Power']
  return (
    <svg viewBox="0 0 420 394" className="ud-svg ud-svg-v" role="img" aria-label="How PCU and TTI works: utilities in the sub-fab rise to each tool, in four phases">
      <H x={0} y={16} t="PCU builds the systems, TTI connects each tool" s="Inside a fab that keeps running. Semiconductor only." />
      <text x={0} y={62} className="ud-s" fill={SOFT}>Fab floor</text>
      <line x1={0} y1={66} x2={420} y2={66} stroke={LINE} strokeWidth="1" />
      <Box x={126} y={76} w={168} h={46} t="Production tool" s="rigged in, hooked up" tone="unitfill" />
      <line x1={0} y1={148} x2={420} y2={148} stroke={LINE} strokeWidth="1" />
      {/* 26 Sep (Bazil: "no overlapping"): the lane's name sits under its boxes, clear of the arrows */}
      <text x={0} y={212} className="ud-s" fill={SOFT}>Sub-fab · process utilities</text>
      {util.map((t, i) => { const x = i * 85; return <g key={t}>
        <Box x={x} y={162} w={80} h={34} t={t} tone="sys" />
        <Arrow x1={x + 40} y1={162} x2={140 + i * 35} y2={122} tone={SYS} />
      </g> })}
      <H x={0} y={240} t="IAQ’s four phases, per tool" />
      {[['1 Facilitize', 'drops, power and room to spec'], ['2 Rig in', 'moved in, set and levelled'], ['3 Hook up', 'each utility tapped and connected'], ['4 Commission', 'leak tested, purged, released']].map(([t, s], i) => {
        const x = (i % 2) * 214, y = 256 + Math.floor(i / 2) * 60
        return <Box key={t} x={x} y={y} w={206} h={50} t={t} s={s} tone={i === 2 ? 'unitfill' : 'ink'} fill={PALE} />
      })}
      <Arrow x1={206} y1={281} x2={214} y2={281} tone={LINE} />
      <Arrow x1={206} y1={341} x2={214} y2={341} tone={LINE} />
      <Arrow x1={317} y1={306} x2={103} y2={316} tone={LINE} />
    </svg>
  )
}
export function DgEfmV() {
  const caas = [['IAQ funds and builds', 'the chiller plant'], ['IAQ operates it', '10 to 20 years'], ['Owner pays a tariff', 'per unit of cooling'], ['Plant handed over', 'at the end']]
  const epc = [['Audit', 'the baseline'], ['IAQ funds', 'the upgrades'], ['Savings measured', 'against baseline'], ['Paid from savings', 'IAQ, 5 to 10 years'], ['Owner keeps', 'all savings after']]
  return (
    <svg viewBox="0 0 420 430" className="ud-svg ud-svg-v" role="img" aria-label="How EFM works: Cooling as a Service, and Energy Performance Contracting">
      <H x={0} y={16} t="Cooling as a Service · IAQ owns the plant" s="IAQ’s capital, the owner’s saving" />
      {caas.map(([t, s], i) => { const x = (i % 2) * 214, y = 48 + Math.floor(i / 2) * 60; return <Box key={t} x={x} y={y} w={206} h={50} t={t} s={s} tone={i === 2 ? 'unitfill' : 'ink'} fill={PALE} /> })}
      <Arrow x1={206} y1={73} x2={214} y2={73} tone={LINE} />
      <Arrow x1={317} y1={98} x2={103} y2={108} tone={LINE} />
      <Arrow x1={206} y1={133} x2={214} y2={133} tone={LINE} />
      <H x={0} y={196} t="Energy Performance Contracting" s="The upgrade pays for itself, from the saving measured" />
      {epc.map(([t, s], i) => { const x = (i % 3) * 142, y = 228 + Math.floor(i / 3) * 60; return <Box key={t} x={x} y={y} w={136} h={50} t={t} s={s} tone={i === 3 ? 'unitfill' : 'ink'} fill={PALE} /> })}
      <Arrow x1={136} y1={253} x2={142} y2={253} tone={LINE} />
      <Arrow x1={278} y1={253} x2={284} y2={253} tone={LINE} />
      <Arrow x1={352} y1={278} x2={68} y2={288} tone={LINE} />
      <Arrow x1={136} y1={313} x2={142} y2={313} tone={LINE} />
      <H x={0} y={362} t="What the owner gains under both" />
      {['Efficient cooling', 'Compliance held', 'Capital kept', 'Uptime from new plant'].map((t, i) => <Box key={t} x={(i % 2) * 214} y={374 + Math.floor(i / 2) * 30} w={206} h={26} t={t} />)}
    </svg>
  )
}
export const UNIT_DIAGRAM_V = { epc: DgEpcV, hookup: DgHookupV, efm: DgEfmV }
