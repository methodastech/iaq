import ToolInstallDiagram from './ToolInstallDiagram.jsx'
import React from 'react'

/* ============================================================================
   UnitArt: one drawn diagram per business unit (15 Sep 2026). Second cut the same night after
   Bazil saw the first: "this is a very bad looking visual". The first was a thin outline sketch
   with 11px type. This one is built from filled blocks in the site's ink and red, white chips
   on the tint ground, 13 to 22px type, and 3 to 4px connectors: a graphic, not a wireframe.

   epc     the owner signs ONE contract with IAQ; IAQ fans out to the six stages
   hookup  a tool in a live bay: six services drop from the ceiling onto it, then it goes live
   energy  the bill before and after: the saving pays for the works IAQ funded, and the plant
           is yours at contract end
   pcu     five utility systems run as one into the point of use, verified on the way

   Motion (unit.css, keyed on .un-figure.in): .un-line draws (pathLength=1), .un-node pops,
   .un-bar rises from its baseline, .un-pulse is one dot that keeps travelling.

   17 Sep (client, on the EPC page: "Repetitive information. Try to merge the design and
   information into one section explaining the cycle of the project"). The drawing is now the
   sticky panel of the cycle section and takes an `active` prop: the index of the stage under
   the reader's eye, or -1 for the plain drawing. Each part of a drawing is tagged with the
   stages it belongs to (the ON sets below); parts of the active stage are lit, the rest sit
   back. The tag goes on an inner group (.un-st), not on .un-node, because the pop keyframes
   hold .un-node's opacity and a class on the same element could not override them.
   ============================================================================ */

const F = '"Switzer","Instrument Sans",system-ui,sans-serif'
const INK = '#0C1220', RED = '#EC2027', SOFT = '#48536A'

function T({ x, y, children, a = 'middle', s = 14, w = 600, c = INK, op, cls }) {
  return <text className={cls} x={x} y={y} textAnchor={a} fontSize={s} fontWeight={w} fill={c} opacity={op} style={{ fontFamily: F, letterSpacing: s >= 18 ? '-.02em' : '0' }}>{children}</text>
}

/* the state class for a part: nothing when no stage is active, lit when the part belongs to the
   active stage, back otherwise */
const st = (sets, active) => (active < 0 ? '' : sets.includes(active) ? ' is-on' : ' is-off')
/* the travelling dot: remounted on every stage change so its path restarts with the stage */
function Pulse({ path, k, dur = 2.4 }) {
  return (
    <circle key={k} className="un-pulse" r="5" fill="#fff" stroke={RED} strokeWidth="2">
      <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={path} />
    </circle>
  )
}

/* epc: stage i of the drawing IS step i of the page (Design, Procure, Construct, Commission,
   Maintain, Hook up, in IAQ's own order) */
function EpcArt({ active }) {
  const stages = ['Design', 'Procure', 'Construct', 'Commission', 'Maintain', 'Hook up']
  const ox = 40, oy = 172, ix = 250, iy = 160, cy = 220
  const toStage = i => { const y = 42 + i * 64, cx = 440; return `M${ix + 120} ${cy} C ${ix + 175} ${cy}, ${cx - 55} ${y + 22}, ${cx} ${y + 22}` }
  return (
    <svg className="un-art" viewBox="0 0 640 440" role="img" aria-label="The owner signs one contract with IAQ; IAQ carries the six stages of the work" data-active={active}>
      <g className="un-node" style={{ '--i': 0 }}>
        <rect x={ox} y={oy} width="96" height="96" fill={INK} />
        <T x={ox + 48} y={oy + 44} s={17} w={700} c="#fff">Owner</T>
        <T x={ox + 48} y={oy + 64} s={11.5} w={500} c="#fff" op=".78">signs one</T>
        <T x={ox + 48} y={oy + 78} s={11.5} w={500} c="#fff" op=".78">contract</T>
      </g>
      <path className="un-draw un-line" d={`M${ox + 96} ${cy} H${ix}`} stroke={RED} strokeWidth="4" fill="none" pathLength="1" style={{ '--i': 1 }} />
      {active < 0
        ? <Pulse k="owner" path={`M${ox + 96} ${cy} H${ix}`} />
        : <Pulse k={'s' + active} path={toStage(active)} dur={2} />}
      <g className="un-node" style={{ '--i': 2 }}>
        <rect x={ix} y={iy} width="120" height="120" fill={RED} />
        <T x={ix + 60} y={iy + 56} s={24} w={700} c="#fff">IAQ</T>
        <T x={ix + 60} y={iy + 78} s={11.5} w={500} c="#fff" op=".85">one point</T>
        <T x={ix + 60} y={iy + 92} s={11.5} w={500} c="#fff" op=".85">of contact</T>
      </g>
      {stages.map((s, i) => {
        const y = 42 + i * 64, cx = 440
        return (
          <g key={s}>
            <path className={'un-draw un-line un-tostage' + st([i], active)} d={toStage(i)} stroke={INK} strokeWidth="2" fill="none" pathLength="1" style={{ '--i': 3 + i }} />
            <g className="un-node" style={{ '--i': 4 + i }}>
              <g className={'un-st' + st([i], active)}>
                <rect className="un-chip" x={cx} y={y} width="176" height="44" fill="#fff" />
                <T cls="un-chip-n" x={cx + 16} y={y + 28} a="start" s={13} w={700} c={RED}>{String(i + 1).padStart(2, '0')}</T>
                <T cls="un-chip-t" x={cx + 46} y={y + 28} a="start" s={15} w={600}>{s}</T>
              </g>
            </g>
          </g>
        )
      })}
      <T x={ox} y="428" a="start" s={12.5} w={500} c={SOFT}>Six stages, in the order they run on site. One party answers for all of them.</T>
    </svg>
  )
}

/* hookup: the page's six steps are Survey, Rig, Connect, Verify, Energise, Hand over.
   Survey lights the tool's footprint on the floor; Rig the tool itself; Connect the six drops;
   Verify the drops and their terminations; Energise the drops and the tool with the dot
   running; Hand over the line to LIVE. */
function HookupArt({ active, bare }) {
  /* 25 Sep (IAQ, 24 Sep review: "can use the updated diagram, and animate it with arrows showing the flow"): phase 01
     shows IAQ's own Main Tool hookup schematic, redrawn (ToolInstallDiagram); the four-phase drawing carries on for
     rig-in, hook-up and commissioning, which IAQ marked "this is okay" */
  /* 25 Sep: `bare` when the page already carries the schematic in its scope section, so it is not shown twice */
  if (active === 0 && !bare) return <ToolInstallDiagram />
  const drops = ['Power', 'Gases', 'Chemicals', 'UPW', 'Exhaust', 'Drainage']
  const tx = 190, ty = 250, tw = 260, th = 110
  /* 18 Sep: four phases now (IAQ's own): facilitization lights the footprint and the drops built upstream, rig-in the
     tool, hook-up the drops, their terminations and the tool, commissioning everything and the line to LIVE */
  const DROPS = [0, 2, 3], TERMS = [2, 3], TOOL = [1, 2, 3], LIVE = [3]
  const firstDrop = `M${tx + 25} 64 V${ty}`, liveLine = `M${tx + tw} ${ty + th / 2} H540`
  return (
    <svg className="un-art" viewBox="0 0 640 440" role="img" aria-label="Six services drop from the facility onto a process tool in a live cleanroom, then the tool goes live" data-active={active}>
      <g className="un-node" style={{ '--i': 0 }}>
        <rect x="40" y="40" width="560" height="24" fill={INK} />
        <T x="52" y="57" a="start" s={11.5} w={600} c="#fff" op=".85">FACILITY SERVICES · above the bay</T>
      </g>
      {/* the footprint: only drawn while Survey is the stage */}
      <rect className={'un-ghost' + (active === 0 ? ' is-on' : '')} x={tx + 2} y={ty + 2} width={tw - 4} height={th - 4} fill="none" stroke={RED} strokeWidth="3" strokeDasharray="10 8" />
      {drops.map((d, i) => {
        const x = tx + 25 + i * 42, ly = i % 2 ? 112 : 80
        return (
          <g key={d}>
            <path className={'un-draw un-line' + st(DROPS, active)} d={`M${x} 64 V${ty}`} stroke={RED} strokeWidth="4" fill="none" pathLength="1" style={{ '--i': 1 + i }} />
            <g className="un-node" style={{ '--i': 2 + i }}>
              <g className={'un-st' + st(DROPS, active)}>
                <rect x={x - 38} y={ly} width="76" height="26" fill="#fff" />
                <T x={x} y={ly + 17} s={12} w={600}>{d}</T>
              </g>
              <g className={'un-st' + st(TERMS, active)}>
                <circle cx={x} cy={ty} r="6" fill={RED} />
              </g>
            </g>
          </g>
        )
      })}
      {active === 3
        ? <Pulse k="live" path={liveLine} dur={1.6} />
        : <Pulse k="drop" path={firstDrop} dur={2} />}
      <g className="un-node" style={{ '--i': 8 }}>
        <g className={'un-st' + st(TOOL, active)}>
          <rect x={tx} y={ty} width={tw} height={th} fill={INK} />
          <T x={tx + tw / 2} y={ty + 50} s={19} w={700} c="#fff">Process tool</T>
          <T x={tx + tw / 2} y={ty + 72} s={11.5} w={500} c="#fff" op=".75">arrives as an inert box, leaves connected</T>
        </g>
      </g>
      <path className={'un-draw un-line' + st(LIVE, active)} d={liveLine} stroke={INK} strokeWidth="2" fill="none" pathLength="1" style={{ '--i': 9 }} />
      <g className="un-node" style={{ '--i': 10 }}>
        <g className={'un-st' + st(LIVE, active)}>
          <circle cx="572" cy={ty + th / 2} r="30" fill={RED} />
          <T x="572" y={ty + th / 2 + 5} s={13} w={800} c="#fff">LIVE</T>
          <T x="572" y={ty + th / 2 + 52} s={12} w={600}>to production</T>
        </g>
      </g>
      <T x="40" y="428" a="start" s={12.5} w={500} c={SOFT}>Every drop is leak-tested, purged, energised and interlocked before the tool is handed over.</T>
    </svg>
  )
}

/* energy: the page's six steps are Assess, Plan, Analyse, Fund and build, Operate, Contract end.
   Assess lights the bill today; Plan the bill after; Analyse the saving; Fund and build the
   IAQ funds block and the start of the term; Operate the term with the dot running and the
   saving being shared; Contract end the end of the line. */
function EnergyArt({ active }) {
  const base = 360
  const line = 'M440 300 H600'
  return (
    <svg className="un-art" viewBox="0 0 640 440" role="img" aria-label="The energy bill before and after the upgrade: the saving pays for the works IAQ funded" data-active={active}>
      <g className={'un-bar un-st' + st([0, 1], active)} style={{ '--i': 0 }}>
        <rect x="90" y="100" width="110" height={base - 100} fill={INK} />
      </g>
      <T cls={'un-st' + st([0, 1], active)} x="145" y={base + 26} s={14} w={600}>Your bill today</T>
      <g className={'un-bar un-st' + st([1, 2], active)} style={{ '--i': 1 }}>
        <rect x="260" y="209" width="110" height={base - 209} fill={INK} />
      </g>
      <T cls={'un-st' + st([1, 2], active)} x="315" y={base + 26} s={14} w={600}>After the upgrade</T>
      <g className="un-node" style={{ '--i': 2 }}>
        <g className={'un-st' + st([2, 4], active)}>
          <rect x="260" y="100" width="110" height="109" fill={RED} />
          <T x="315" y="148" s={17} w={700} c="#fff">Saving</T>
          <T x="315" y="167" s={11.5} w={500} c="#fff" op=".85">pays for the works</T>
        </g>
      </g>
      <path className={'un-draw un-line' + st([3], active)} d="M370 150 C 405 150, 405 126, 440 126" stroke={RED} strokeWidth="3" fill="none" pathLength="1" style={{ '--i': 3 }} />
      <g className="un-node" style={{ '--i': 4 }}>
        <g className={'un-st' + st([3], active)}>
          <rect x="440" y="90" width="160" height="72" fill={RED} />
          <T x="520" y="121" s={19} w={700} c="#fff">IAQ funds</T>
          <T x="520" y="142" s={11.5} w={500} c="#fff" op=".85">zero upfront cost</T>
        </g>
      </g>
      <path className={'un-draw un-line' + st([4, 5], active)} d={line} stroke={INK} strokeWidth="3" fill="none" pathLength="1" style={{ '--i': 5 }} />
      <g className="un-node" style={{ '--i': 6 }}>
        <g className={'un-st' + st([3, 4], active)}>
          <circle cx="440" cy="300" r="8" fill={INK} />
          <T x="440" y="268" a="start" s={13} w={700}>Year 0</T>
          <T x="440" y="284" a="start" s={11.5} w={500} c={SOFT}>the contract starts</T>
        </g>
      </g>
      <g className="un-node" style={{ '--i': 7 }}>
        <g className={'un-st' + st([5], active)}>
          <circle cx="600" cy="300" r="8" fill={RED} />
          <T x="600" y="326" a="end" s={13} w={700}>Contract end</T>
          <T x="600" y="342" a="end" s={11.5} w={500} c={SOFT}>plant and savings are yours</T>
        </g>
      </g>
      <Pulse k={active < 0 ? 'plain' : 's' + active} path={line} dur={3} />
      <path d={`M60 ${base} H600`} stroke={INK} strokeWidth="2" />
      <T x="60" y="428" a="start" s={12.5} w={500} c={SOFT}>5 to 10 years under Energy Performance Contracting, 10 to 20 under Cooling as a Service.</T>
    </svg>
  )
}

/* pcu: five utility systems, each a filled block, run as one system into the tool; the verify
   chip sits on the line. The page's five steps are Define, Design, Install, Test, Commission:
   Define lights the systems; Design the runs; Install both; Test the verify chip on the runs;
   Commission the point of use with the dot running to it. */
function PcuArt({ active }) {
  const sys = ['Specialty gases', 'Chemicals', 'Ultrapure water', 'CDA · PCW · PV', 'Process exhaust']
  const tx = 470, ty = 150, tw = 130, th = 130, cy = ty + th / 2
  const SYS = [0, 2], RUNS = [1, 2, 3, 4], VERIFY = [3], POU = [4]
  const firstRun = `M220 62 C 300 62, 330 ${cy}, ${tx} ${cy}`
  return (
    <svg className="un-art" viewBox="0 0 640 440" role="img" aria-label="Five process utilities run as one system to the point of use, tested and verified before the tool runs" data-active={active}>
      {sys.map((n, i) => {
        const y = 40 + i * 70
        const d = `M220 ${y + 22} C 300 ${y + 22}, 330 ${cy}, ${tx} ${cy}`
        return (
          <g key={n}>
            <g className="un-node" style={{ '--i': i }}>
              <g className={'un-st' + st(SYS, active)}>
                <rect x="40" y={y} width="180" height="44" fill={i === 4 ? INK : '#fff'} />
                {/* 17 Sep: a top rule, not a left stripe (Bazil's no-left-lines rule) */}
                <rect x="40" y={y} width="180" height="3" fill={RED} />
                <T x="62" y={y + 28} a="start" s={14.5} w={600} c={i === 4 ? '#fff' : INK}>{n}</T>
              </g>
            </g>
            <path className={'un-draw un-line' + st(RUNS, active)} d={d} stroke={i % 2 ? INK : RED} strokeWidth="3" fill="none" pathLength="1" style={{ '--i': 5 + i }} />
          </g>
        )
      })}
      <Pulse k={active < 0 ? 'plain' : 's' + active} path={firstRun} dur={2.6} />
      <g className="un-node" style={{ '--i': 10 }}>
        <g className={'un-st' + st(VERIFY, active)}>
          <rect x="330" y={cy - 18} width="112" height="36" fill={RED} />
          <T x="386" y={cy + 5} s={12.5} w={700} c="#fff">Verified</T>
        </g>
      </g>
      <g className="un-node" style={{ '--i': 11 }}>
        <g className={'un-st' + st(POU, active)}>
          <rect x={tx} y={ty} width={tw} height={th} fill={INK} />
          <T x={tx + tw / 2} y={ty + 58} s={17} w={700} c="#fff">Point</T>
          <T x={tx + tw / 2} y={ty + 80} s={17} w={700} c="#fff">of use</T>
        </g>
      </g>
      <T x="40" y="428" a="start" s={12.5} w={500} c={SOFT}>Designed, installed and proven as one system, at the tool, under real load.</T>
    </svg>
  )
}

export default function UnitArt({ kind, active = -1, bare = false }) {
  if (kind === 'epc') return <EpcArt active={active} />
  if (kind === 'hookup') return <HookupArt active={active} bare={bare} />
  if (kind === 'energy') return <EnergyArt active={active} />
  if (kind === 'pcu') return <PcuArt active={active} />
  return null
}
