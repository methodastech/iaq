import React from 'react'
import '../styles/tool-install.css'

/* ============================================================================
   ToolInstallDiagram · 25 Sep 2026. IAQ's own "Main Tool" hookup schematic (24 Sep review, PDF page 12: "can use the
   updated diagram and maybe can animate the new diagram with arrow showing direction of the flow"), redrawn in the
   house language. Every box, floor and line is theirs; the colours follow the site (facility tool install red,
   facility base build green, interconnection blue; main tool grey, tool auxiliaries amber, PAC light blue, base
   build green, tool install supply red tint). The flows run as animated dashes in their direction.
   Stands in phase 01 of the tool hookup run on /services/tool-installation.
   ============================================================================ */
const INK = '#0C1220', RED = '#EC2027', GRN = '#0FA968', BLU = '#0B8FD8'
const F = { grey: '#E9EDF3', mta: '#FBEFD2', pac: '#DDEFFB', bb: '#DDF5EA', tis: '#FBDCDD' }

const Box = ({ x, y, w, h, k = 'bb', t, s = 12.5, lines }) => (
  <g className="tid-box">
    <rect x={x} y={y} width={w} height={h} fill={F[k]} stroke={INK} strokeWidth="1.2" />
    {(lines || [t]).map((l, i, a) => (
      <text key={i} x={x + w / 2} y={y + h / 2 + (i - (a.length - 1) / 2) * (s + 3) + s * .36} textAnchor="middle" fontSize={s} fontWeight={i === 0 ? 600 : 500} fill={INK}>{l}</text>
    ))}
  </g>
)
/* 30 Sep ("fix the arrow", Firefox): the heads were SVG markers, and Firefox places markers wrongly under the page's root
   zoom (1.12 on desktops): each head drifted off its line's end, further the further the line sat from the drawing's
   corner. Each head is now its own triangle at the line's end, turned along its last segment: the marker's geometry
   (a 10-unit head at 7 stroke widths, its tip 1 unit past the end), in every browser. */
const lastLeg = d => {
  const pts = []; let x = 0, y = 0
  for (const [, c, a, b] of d.matchAll(/([MLHV])\s*(-?[\d.]+)(?:[ ,](-?[\d.]+))?/g)) {
    if (c === 'H') x = +a; else if (c === 'V') y = +a; else { x = +a; y = +b }
    pts.push([x, y])
  }
  return pts.slice(-2)
}
const Head = ({ d, c, w }) => {
  const [[x0, y0], [x1, y1]] = lastLeg(d), k = (w * 7) / 10
  const deg = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI
  return <path d={`M${-9 * k} ${-5 * k}L${k} 0L${-9 * k} ${5 * k}Z`} fill={c} transform={`translate(${x1} ${y1}) rotate(${deg})`} />
}
const L = ({ d, c = RED, w = 2.2, dash = true, end = true, i = 0 }) => (<>
  <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round"
        className={dash ? 'tid-flow' : ''} style={{ '--i': i }} />
  {end && <Head d={d} c={c} w={w} />}
</>)
const Dot = ({ x, y, c = BLU }) => <circle cx={x} cy={y} r="4" fill={c} />
const T = ({ x, y, s = 12, w = 600, a = 'middle', c = INK, children }) => <text x={x} y={y} fontSize={s} fontWeight={w} textAnchor={a} fill={c}>{children}</text>

export default function ToolInstallDiagram() {
  return (
    <svg className="un-art tid" viewBox="0 0 1280 912" role="img" aria-label="IAQ's tool hookup schematic: the main tool on the fab floor, the raised metal floor, and the sub-fab equipment, with the facility tool install lines in red, the facility base build in green and the interconnection lines in blue">
      <defs>
        <pattern id="tid-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#DCE3EC" /><rect width="3" height="8" fill="#B9C4D3" /></pattern>
      </defs>

      {/* floors */}
      <T x="1250" y="352" a="end" s={13} w={700}>FAB floor</T>
      <path d="M30 360H1250" stroke={INK} strokeWidth="4" />
      <rect x="30" y="398" width="1220" height="14" fill="url(#tid-hatch)" />
      <T x="1250" y="392" a="end" s={12.5} w={700}>Raised metal floor zone</T>
      <T x="40" y="782" a="start" s={13} w={700}>Sub-fab floor</T>
      <path d="M30 790H1250" stroke={INK} strokeWidth="4" />

      {/* the main tool on its base */}
      <T x="690" y="84" s={19} w={700}>Main tool</T>
      <rect x="420" y="360" width="420" height="42" fill={F.tis} stroke={INK} strokeWidth="1.2" />
      <T x="640" y="378" s={11.5} w={500}>Concrete base</T><T x="640" y="393" s={11.5} w={500}>Metal frame</T>
      <Box x={840} y={360} w={70} h={42} k="tis" t="Trap" s={12} />
      {[[470, 150, 90, 210], [565, 120, 90, 240], [660, 200, 80, 160], [745, 230, 60, 130]].map(([x, y, w, h], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={h} fill={F.grey} stroke={INK} strokeWidth="1.2" />
          {i < 2 && [0, 1].map(j => <rect key={j} x={x + 14} y={y + 34 + j * 70} width={w - 28} height="28" fill="#fff" stroke={INK} strokeWidth="1" />)}
          {i < 2 && [0, 1].map(j => <rect key={'k' + j} x={x + 22} y={y + 42 + j * 70} width={w - 44} height="12" fill={INK} opacity=".55" />)}
        </g>
      ))}
      <rect x="810" y="160" width="110" height="200" fill={F.grey} stroke={INK} strokeWidth="1.2" />
      <rect x="810" y="160" width="110" height="38" fill="#fff" stroke={INK} strokeWidth="1" />
      <Box x={880} y={300} w={46} h={60} k="grey" lines={['Load', 'port']} s={11} />
      <Box x={740} y={96} w={130} h={30} k="mta" t="Tool top filter" s={12} />
      <path d="M805 126L840 160" stroke={INK} strokeWidth="1" fill="none" />
      <Box x={890} y={70} w={110} h={120} k="mta" lines={['N2LP', '(N2 load port)', 'tool owner', 'supply']} s={11.5} />
      <path d="M930 190L905 300" stroke={INK} strokeWidth="1" fill="none" />
      <Box x={1020} y={70} w={130} h={120} k="mta" lines={['Active damper', 'spec and supply', 'by tool owner']} s={11.5} />
      <Box x={1040} y={218} w={130} h={56} k="mta" lines={['DF earthquake', 'seismic isolation table']} s={11.5} />
      <path d="M1040 246L900 380" stroke={INK} strokeWidth="1" fill="none" />
      <Box x={300} y={205} w={90} h={62} k="pac" lines={['H/E chiller', '(Lv2 or Lv3)']} s={12} />
      <Box x={320} y={62} w={110} h={38} k="bb" t="Exhaust system" s={12} />

      {/* fab floor lines: chiller feed, exhaust out, load port and tool control */}
      <L d="M240 236H300" c={RED} i={0} />
      <L d="M390 236H470" c={BLU} i={1} end={false} /><Dot x={470} y={236} />
      <L d="M600 140V70H430" c={RED} i={2} end={false} /><L d="M320 81H270" c={GRN} i={3} />
      <L d="M655 140H700V300H760" c={BLU} i={4} end={false} /><Dot x={655} y={140} /><Dot x={760} y={300} />

      {/* left: base build systems, localized tool kit, the lines to the base */}
      {[['Bulk gas system', 455], ['UPW system', 497], ['NPW/PCW system', 539], ['Exhaust system', 590]].map(([t, y], i) => (
        <g key={t}><L d={`M40 ${y + 15}H80`} c={GRN} i={5 + i} /><Box x={82} y={y} w={140} h={30} k="bb" t={t} s={12} /></g>
      ))}
      <Box x={244} y={455} w={100} h={30} k="mta" lines={['Localized tool', 'gas filter']} s={10.5} />
      <Box x={244} y={497} w={130} h={30} k="mta" lines={['Localized tool booster', 'pump / filter / polisher']} s={10.5} />
      <Box x={244} y={590} w={100} h={30} k="mta" lines={['Localized tool', 'blower']} s={10.5} />
      <L d="M222 470H244" c={RED} i={9} end={false} /><L d="M344 470H500V402" c={RED} i={10} />
      <L d="M222 512H244" c={RED} i={11} end={false} /><L d="M374 512H540V402" c={RED} i={12} />
      <L d="M222 554H580V402" c={RED} i={13} />
      <L d="M344 605H620V402" c={RED} i={14} end={false} /><L d="M244 605H222" c={RED} i={15} />

      {/* right: drain and the busway */}
      <L d="M900 402V520H960" c={RED} i={16} /><Box x={960} y={500} w={90} h={40} k="bb" lines={['Drain', 'system']} s={12} /><L d="M1050 520H1090" c={GRN} i={17} />
      <Box x={1120} y={455} w={46} h={36} k="bb" lines={['PIU /', 'TOU']} s={10.5} /><Box x={1212} y={455} w={46} h={36} k="bb" lines={['PIU /', 'TOU']} s={10.5} />
      <rect x="1166" y="467" width="46" height="12" fill="url(#tid-hatch)" stroke={INK} strokeWidth=".8" />
      <T x="1189" y="500" s={11} w={500}>Busway / busduct</T>

      {/* sub-fab equipment */}
      <Box x={330} y={640} w={130} h={140} k="bb" lines={['FAC', 'power panel (PP)', 'feed out panel (FOP)', 'distribution board (DB)', 'power distribution', 'panel (PDP)']} s={10.5} />
      <Box x={478} y={660} w={82} h={120} k="pac" lines={['POU', 'abatement']} s={12} />
      <Box x={576} y={720} w={72} h={60} k="pac" t="Pump" s={12.5} />
      <rect x="600" y="672" width="24" height="44" fill="#fff" stroke={INK} strokeWidth="1.2" /><rect x="604" y="676" width="16" height="6" fill={INK} opacity=".5" /><rect x="604" y="686" width="16" height="6" fill={INK} opacity=".5" />
      <Box x={664} y={648} w={64} h={132} k="bb" lines={['TGM', 'gas', 'detection', '(LSS)']} s={11.5} />
      <Box x={740} y={648} w={64} h={132} k="grey" lines={['Auxiliaries', 'tools /', 'cabinet']} s={11.5} />
      <Box x={816} y={648} w={64} h={132} k="bb" lines={['Liquid', 'dispenser', 'gas', 'cabinet']} s={11.5} />
      <Box x={896} y={680} w={64} h={100} k="bb" lines={['Specialty', 'gas', 'system', 'VMB']} s={11} />
      <Box x={972} y={680} w={64} h={100} k="bb" lines={['Chemical', 'system', 'VMB']} s={11} />
      <Box x={1052} y={666} w={92} h={114} k="mta" lines={['Tool step', 'down', 'transformer']} s={11.5} />
      <Box x={1160} y={650} w={70} h={130} k="grey" lines={['Main', 'tool', 'power', 'AC box']} s={11.5} />

      {/* base build supplies come up through the sub-fab floor */}
      {[395, 519, 612, 696, 772, 848, 928, 1004, 1098, 1195].map((x, i) => <L key={x} d={`M${x} 826V792`} c={i === 9 || i === 3 ? RED : GRN} i={18 + i} />)}
      {/* tool install lines from the sub-fab up to the base and the tool */}
      <L d="M395 640V612H470V402" c={RED} i={30} />
      <L d="M519 660V612H680V402" c={RED} i={31} />
      <L d="M696 648V612H760V402" c={RED} i={32} />
      <L d="M848 648V632H800V402" c={RED} i={33} />
      <L d="M928 680V620H830V402" c={RED} i={34} />
      <L d="M1004 680V608H870V402" c={RED} i={35} />
      <L d="M1098 666V596H1195V650" c={RED} i={36} />
      <L d="M612 672V596H720V402" c={RED} i={37} />
      <T x="727" y="560" a="start" s={11} w={600} c={RED}>EVac</T>
      {/* interconnection lines: pump, gas detection and tool control */}
      <L d="M478 700H440V586H660V648" c={BLU} i={38} end={false} /><Dot x={478} y={700} /><Dot x={660} y={648} />
      <L d="M576 750H560" c={BLU} i={39} end={false} /><Dot x={576} y={750} />
      <L d="M728 700H740" c={BLU} i={40} end={false} /><Dot x={728} y={700} /><Dot x={740} y={700} />
      <L d="M700 300V596" c={BLU} i={41} end={false} />
      <L d="M1160 700H1144" c={BLU} i={42} end={false} /><Dot x={1160} y={700} />

      {/* legend */}
      <g className="tid-legend">
        {[['grey', 'Main tool', 40], ['mta', 'Main tool auxiliaries (MTA)', 176], ['pac', 'PAC equipment (pump, abatement, chiller)', 404], ['bb', 'Fac base build equipment', 714], ['tis', 'Fac tool install supply', 922]].map(([k, l, x]) => (
          <g key={k}><rect x={x} y="838" width="26" height="14" fill={F[k]} stroke={INK} strokeWidth="1" /><T x={x + 34} y="850" a="start" s={11.5} w={500}>{l}</T></g>
        ))}
        <g>
          <L d="M40 872H74" c={RED} i={43} /><T x="82" y="876" a="start" s={11.5} w={500}>Facility tool install: power, PCW, exhaust, CDA, bulk gas, ESG gas, UPW, drains, chemicals and slurry</T>
          <L d="M700 872H734" c={GRN} i={44} /><T x="742" y="876" a="start" s={11.5} w={500}>Facility base build: panels, exhaust, PCW, CDA, bulk gas, UPW, drains, gas cabinets and VMBs</T>
        </g>
        <g><L d="M40 898H74" c={BLU} dash={false} end={false} /><Dot x={40} y={898} /><Dot x={74} y={898} /><T x="82" y="902" a="start" s={11.5} w={500}>Interconnection: pump lines, gas detection tubing, tool control cables</T></g>
      </g>
    </svg>
  )
}
