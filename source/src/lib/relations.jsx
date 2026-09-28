import React from 'react'
import { UNITS, SERVICES, WORK } from '../data/business.js'
import { abbrNodes } from './abbr.js'

/* ============================================================================
   relations.jsx · the rules that connect IAQ's units, services, work and systems, and the sentence that says a
   relation in words. Shared by the Codex map (components/codex/RelExplorer.jsx) and the home page explorer
   (components/FabExplorer.jsx). Moved here on 24 Sep 2026 so the home page bundles no Codex code.
   ============================================================================ */
export const unitShort = u => u.short || u.name
export const SYS = WORK.flatMap(w => w.systems.map((t, i) => ({ id: w.id + ':' + i, work: w.id, t: t.replace('Cleanroom envelope: walls, ceiling grid, raised floor', 'Cleanroom envelope').replace('HVAC, ACMV and fan filter units', 'Air conditioning and ventilation (HVAC, ACMV), fan filter units') })))
export const MODELS = { epc: ['EPCC', 'EPCM'], hookup: ['Standalone', 'On the EPC or EPCM model'], efm: ['Cooling as a Service', 'Energy Performance Contracting', 'Build Operate Transfer'] }   /* 25 Sep: BOT for district cooling, from the Energy Management questionnaire */
/* how each unit is bought, said as a sentence */
export const BOUGHT = { epc: 'EPCC or EPCM', hookup: 'a standalone job, or inside an EPC or EPCM contract', efm: 'Cooling as a Service, Energy Performance Contracting or Build Operate Transfer' }
export const list = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]
export const isShort = n => /^[A-Z&]{2,}$/.test(n)
export const TOUR = [['u', 'epc'], ['u', 'hookup'], ['u', 'efm'], ['y', 'mep:1'], ['s', 'hookup'], ['w', 'process']]
/* 25 Sep, midday (Bazil, on the facility map: "why this show 3 work though, cause hook up", "make sure everything structured
   well"): tools hookup is service 6 AND the fourth kind of work, as the chart and the 4 works section already say. This is
   the one source: the work card, its three systems, and `does`, which says whether a unit does a kind of work (the three
   disciplines from the unit's work list; hookup from the unit carrying service 6). */
export const HOOK_WORK = { id: 'hookup', name: 'Tools hookup', full: 'Service 6, the tools themselves', icon: 'link', k: 's',
  line: 'Each production tool connected and released to production.',
  systems: ['Gas, chemical, water and exhaust connections to each tool', 'Power and controls to each tool', 'Release to production'],
  /* 25 Sep, night (Bazil: "give a reasoning why hookup is here even though it's part of service") */
  why: 'Hookup is service 6 in the cycle, and a trade of its own. CSA, MEP and process utilities build the facility; hookup works at each production tool, joining it to those utilities.' }
export const WORK4 = [...WORK, HOOK_WORK]
export const HOOK_SYS = HOOK_WORK.systems.map((t, i) => ({ id: 'hookup:' + i, work: 'hookup', t }))
export const SYS_ALL = [...SYS, ...HOOK_SYS]
export const does = (u, w) => u.work.includes(w) || (w === 'hookup' && u.core.includes('hookup'))
export const workOf = id => WORK4.find(x => x.id === id)
export const sysOf = id => SYS_ALL.find(x => x.id === id)

export function related(sel) {
  const on = new Set()
  if (!sel) return on
  const [k, id] = sel
  const add = (kk, ii) => on.add(kk + '|' + ii)
  add(k, id)
  if (k === 'u') {
    const u = UNITS.find(x => x.id === id)
    ;[...u.core, ...u.ask].forEach(s => add('s', s)); WORK4.forEach(w => { if (does(u, w.id)) add('w', w.id) })
    SYS_ALL.filter(y => does(u, y.work)).forEach(y => add('y', y.id))
  } else if (k === 's') {
    UNITS.filter(u => u.core.includes(id) || u.ask.includes(id)).forEach(u => add('u', u.id))
  } else if (k === 'w') {
    SYS_ALL.filter(y => y.work === id).forEach(y => add('y', y.id)); UNITS.filter(u => does(u, id)).forEach(u => add('u', u.id))
  } else if (k === 'y') {
    const y = sysOf(id); add('w', y.work); UNITS.filter(u => does(u, y.work)).forEach(u => add('u', u.id))
  }
  return on
}
export function sentence(sel) {
  if (!sel) return null
  const [k, id] = sel
  const seen = new Set(), A = t => abbrNodes(t, seen)
  if (k === 'u') {
    const u = UNITS.find(x => x.id === id)
    const core = u.core.map(s => SERVICES.find(x => x.id === s).name.toLowerCase())
    const ask = u.ask.map(s => SERVICES.find(x => x.id === s).name.toLowerCase())
    return <><b className="c-u">{A(u.name)}</b> {u.line.toLowerCase().replace(/\.$/, '')}. Bought as <b className="c-m">{A(BOUGHT[id])}</b>. It carries <b className="c-s">{list(core)}</b>{ask.length ? <>, and <b className="c-s">{list(ask)}</b> when the client asks</> : null}. Its work is <b className="c-w">{A(list(u.work.map(w => WORK.find(x => x.id === w).name)))}</b>.</>
  }
  if (k === 's') {
    const s = SERVICES.find(x => x.id === id)
    const core = UNITS.filter(u => u.core.includes(id)).map(unitShort), ask = UNITS.filter(u => u.ask.includes(id)).map(unitShort)
    return <><b className="c-s">{s.name}</b>: {s.line.replace(/\.$/, '').toLowerCase()}. Carried by <b className="c-u">{A(list(core))}</b>{ask.length ? <>, and by <b className="c-u">{A(list(ask))}</b> when the client asks</> : null}. Any one service can be bought on its own.</>
  }
  if (k === 'w') {
    const w = workOf(id)
    return <><b className="c-w">{isShort(w.name) ? <>{w.name} ({w.full})</> : w.name}</b>{isShort(w.name) ? null : <>, {w.full.toLowerCase()}</>}: {A(w.line.toLowerCase().replace(/\.$/, '').replace(/\b(hvac|acmv|ffus?|pcw|cda|upw|mep|csa)\b/g, x => x.toUpperCase()))}. Delivered by <b className="c-u">{A(list(UNITS.filter(u => does(u, id)).map(unitShort)))}</b>. Its systems include <b className="c-y">{A(list(w.systems.slice(0, 3).map(x => x.split(':')[0].replace(/^([A-Z][a-z])/, c => c.toLowerCase()))))}</b>.</>
  }
  const y = sysOf(id), w = workOf(y.work)
  return <><b className="c-y">{A(y.t)}</b> is a system, not a service. It is built in <b className="c-w">{A(w.name)}</b> work, delivered by <b className="c-u">{A(list(UNITS.filter(u => does(u, y.work)).map(unitShort)))}</b>.</>
}

