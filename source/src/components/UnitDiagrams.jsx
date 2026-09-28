import React from 'react'

/* ============================================================================
   UnitDiagrams · how each business unit works, drawn (24 Sep 2026, Bazil: "including a diagram in detail view of how
   it works for each"). Three SVGs on a 640 x 300 grid, the house palette: unit red, ink, azure for services, amber
   for work, green for systems, grey hairlines. Boxes and arrows, short labels, no glow.
   ============================================================================ */
/* 26 Sep: the unit colour is BLUE (Bazil, 25 Sep: service red, unit blue); RED here is the unit's accent, kept as the name */
const INK = '#0C1220', SOFT = '#66708A', RED = '#0B8FD8', LINE = '#C3D1E0', SVC = '#EC2027', WORK = '#231F20', SYS = '#0FA968', PALE = '#F3F6FB'
const Box = ({ x, y, w, h, t, s, tone = 'ink', fill = '#fff' }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={tone === 'red' ? RED : fill} stroke={tone === 'red' ? RED : tone === 'svc' ? SVC : tone === 'work' ? WORK : tone === 'sys' ? SYS : LINE} strokeWidth="1.2" />
    <text x={x + w / 2} y={y + (s ? h / 2 - 4 : h / 2 + 4)} textAnchor="middle" className="ud-t" fill={tone === 'red' ? '#fff' : INK}>{t}</text>
    {s && <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" className="ud-s" fill={tone === 'red' ? '#DCEFFB' : SOFT}>{s}</text>}
  </g>
)
const Arrow = ({ x1, y1, x2, y2, tone = LINE, dash }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), hx = x2 - Math.cos(a) * 7, hy = y2 - Math.sin(a) * 7
  return <g><line x1={x1} y1={y1} x2={hx} y2={hy} stroke={tone} strokeWidth="1.4" strokeDasharray={dash ? '4 3' : undefined} /><path d={`M${x2} ${y2} L${hx - Math.sin(a) * 4} ${hy + Math.cos(a) * 4} L${hx + Math.sin(a) * 4} ${hy - Math.cos(a) * 4} Z`} fill={tone} /></g>
}
const Lane = ({ y, t, s }) => <g><text x="0" y={y} className="ud-h" fill={INK}>{t}</text>{s && <text x="0" y={y + 15} className="ud-s" fill={SOFT}>{s}</text>}</g>

export function DgEpc() {
  const stages = ['Design', 'Procure', 'Construct', 'Commission']
  return (
    <svg viewBox="0 0 640 310" className="ud-svg" role="img" aria-label="How EPC works, under EPCC and under EPCM">
      <Lane y={16} t="EPCC · one contract, IAQ delivers everything" s="IAQ answers for the system working as intended" />
      <Box x={0} y={44} w={78} h={44} t="Owner" />
      <Arrow x1={78} y1={66} x2={106} y2={66} tone={RED} />
      <rect x={106} y={36} width={434} height={60} fill="#EEF6FD" stroke={RED} strokeWidth="1.2" />
      <text x={116} y={50} className="ud-s" fill={RED}>IAQ, one contract</text>
      {stages.map((t, i) => <g key={t}><Box x={116 + i * 106} y={54} w={92} h={34} t={t} tone="svc" />{i < 3 && <Arrow x1={208 + i * 106} y1={71} x2={222 + i * 106} y2={71} tone={SVC} />}</g>)}
      <Arrow x1={540} y1={66} x2={568} y2={66} tone={RED} />
      <Box x={568} y={44} w={72} h={44} t="Handover" />

      <Lane y={140} t="EPCM · the owner holds the contracts, IAQ manages them" s="Engaged by large multinationals on the biggest programmes" />
      <Box x={0} y={168} w={78} h={44} t="Owner" />
      <Box x={116} y={168} w={196} h={44} t="IAQ manages" s="design, programme and cost" tone="red" />
      <Arrow x1={78} y1={190} x2={116} y2={190} tone={RED} />
      {['Contractor A', 'Contractor B', 'Contractor C'].map((t, i) => <g key={t}><Box x={340 + i * 100} y={252} w={92} h={40} t={t} s="owner's contract" /><Arrow x1={214} y1={212} x2={386 + i * 100} y2={252} tone={RED} dash /><Arrow x1={39} y1={212} x2={386 + i * 100} y2={252} tone={LINE} /></g>)}
      <text x={0} y={300} className="ud-s" fill={SOFT}>grey: the owner's contract · blue dashed: IAQ manages that contractor</text>
      <Arrow x1={312} y1={190} x2={568} y2={190} tone={LINE} />
      <Box x={568} y={168} w={72} h={44} t="Handover" />
    </svg>
  )
}

export function DgHookup() {
  const util = [['Gases', SYS], ['Chemicals', SYS], ['UPW', SYS], ['Exhaust', SYS], ['Power', SYS]]
  const phases = [['1 Facilitize', 'drops, power and room', 'built to the maker’s spec'], ['2 Rig in', 'moved in on a route,', 'set and levelled'], ['3 Hook up', 'each utility tapped', 'and connected'], ['4 Commission', 'leak tested, purged,', 'released to production']]
  return (
    <svg viewBox="0 0 640 310" className="ud-svg" role="img" aria-label="How PCU and TTI works: utilities in the sub-fab rise to each tool, in four phases">
      <Lane y={16} t="Process Critical Utilities builds the systems, Total Tool Installation connects each tool" s="Inside a fab that keeps running. Semiconductor only." />
      <rect x={0} y={44} width={640} height={2} fill={LINE} />
      <text x={0} y={60} className="ud-s" fill={SOFT}>Fab floor</text>
      <Box x={250} y={52} w={140} h={54} t="Production tool" s="rigged in, hooked up" tone="red" />
      <rect x={0} y={122} width={640} height={2} fill={LINE} />
      <text x={0} y={138} className="ud-s" fill={SOFT}>Sub-fab · process utilities</text>
      {util.map(([t, c], i) => <g key={t}><Box x={40 + i * 116} y={150} w={96} h={34} t={t} tone={c === SYS ? 'sys' : 'work'} /><Arrow x1={88 + i * 116} y1={150} x2={280 + i * 20} y2={106} tone={c} /></g>)}
      <text x={0} y={216} className="ud-h" fill={INK}>IAQ’s four phases, per tool</text>
      {phases.map(([t, s1, s2], i) => <g key={t}><rect x={i * 160} y={228} width={150} height={60} fill={i === 2 ? RED : PALE} stroke={i === 2 ? RED : LINE} strokeWidth="1.2" /><text x={i * 160 + 10} y={248} className="ud-t" fill={i === 2 ? '#fff' : INK}>{t}</text><text x={i * 160 + 10} y={266} className="ud-s" fill={i === 2 ? '#FFE3E4' : SOFT}>{s1}</text><text x={i * 160 + 10} y={280} className="ud-s" fill={i === 2 ? '#FFE3E4' : SOFT}>{s2}</text>{i < 3 && <Arrow x1={i * 160 + 150} y1={258} x2={i * 160 + 160} y2={258} tone={LINE} />}</g>)}
    </svg>
  )
}

export function DgEfm() {
  const caas = [['IAQ funds and builds', 'the chiller plant'], ['IAQ operates it', '10 to 20 years'], ['Owner pays a tariff', 'per unit of cooling'], ['Plant handed over', 'at the end']]
  const epc = [['Audit', 'the baseline'], ['IAQ funds', 'the upgrades'], ['Savings measured', 'against baseline'], ['Paid from savings', 'IAQ, 5 to 10 years'], ['Owner keeps', 'all savings after']]
  return (
    <svg viewBox="0 0 640 310" className="ud-svg" role="img" aria-label="How EFM works: Cooling as a Service, and Energy Performance Contracting">
      <Lane y={16} t="Cooling as a Service · IAQ owns the plant, the owner buys the cooling" s="IAQ’s capital, the owner’s saving" />
      {caas.map(([t, s], i) => <g key={t}><Box x={i * 160} y={40} w={150} h={50} t={t} s={s} tone={i === 2 ? 'red' : 'ink'} fill={PALE} />{i < 3 && <Arrow x1={i * 160 + 150} y1={65} x2={i * 160 + 160} y2={65} tone={LINE} />}</g>)}
      <Lane y={140} t="Energy Performance Contracting · the upgrade pays for itself" s="Every payment comes from the saving actually measured" />
      {epc.map(([t, s], i) => <g key={t}><Box x={i * 128} y={164} w={120} h={50} t={t} s={s} tone={i === 3 ? 'red' : 'ink'} fill={PALE} />{i < 4 && <Arrow x1={i * 128 + 120} y1={189} x2={i * 128 + 128} y2={189} tone={LINE} />}</g>)}
      <text x={0} y={250} className="ud-h" fill={INK}>What the owner gains under both</text>
      {['Efficient cooling', 'Compliance held', 'Capital kept for the business', 'Uptime from new plant'].map((t, i) => <g key={t}><rect x={i * 160} y={262} width={150} height={34} fill="#fff" stroke={LINE} strokeWidth="1.2" /><text x={i * 160 + 75} y={283} textAnchor="middle" className="ud-s" fill={INK}>{t}</text></g>)}
    </svg>
  )
}
export const UNIT_DIAGRAM = { epc: DgEpc, hookup: DgHookup, efm: DgEfm }
