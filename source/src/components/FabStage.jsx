import React, { useEffect, useState } from 'react'
import { UNITS } from '../data/business.js'
import { SYS, sysOf } from '../lib/relations.jsx'
import { FRAMES, FRAMES_T } from '../data/fabFrames.js'
import IsoIcon from './IsoIcon.jsx'
import '../styles/fab-explorer.css'

/* ============================================================================
   FabStage · IAQ's Revit fab, driven by a selection (24 Sep 2026).
   The model stage that the home page's FabExplorer carries, on its own so the Services map can carry it too
   (Bazil: "a diagram of building and structure on top of this diagram, so while we're selecting info here we can
   see what it is showcasing ... the parts in a building, what is EPC and what it's connected to"). Give it a
   selection [kind, id] and the facility scrubs to that thing's moment, the layers it touches are pinned with their
   names, the rest fade. Pins can pick back (onPick), so the building and the map read each other.
   ============================================================================ */
export const FRAME = {
  u: { epc: 26, hookup: 44, efm: 60 },
  s: { design: 2, procure: 8, construct: 22, commission: 26, maintain: 60, hookup: 44 },
  w: { csa: 11, mep: 22, process: 33 },
}
export const PINS = [
  { n: 1, x: 55, y: 9,  t: 'Roof steel and structural frame',           d: 'csa',     from: 5,  ic: 'frame' },
  { n: 2, x: 31, y: 17, t: 'Air handling and ducting',                  d: 'mep',     from: 22, ic: 'duct' },
  { n: 3, x: 77, y: 26, t: 'Building services, the interstitial level', d: 'mep',     from: 22, ic: 'pipe' },
  { n: 4, x: 43, y: 41, t: 'Cleanroom envelope',                        d: 'csa',     from: 11, ic: 'envelope' },
  { n: 5, x: 71, y: 45, t: 'Process tools, hooked up',                  d: 'hookup',  from: 40, ic: 'hookup' },
  { n: 6, x: 32, y: 49, t: 'Waffle slab and raised floor',              d: 'csa',     from: 5,  ic: 'finishes' },
  { n: 7, x: 48, y: 58, t: 'Process utilities in the sub-fab',          d: 'process', from: 30, ic: 'gas' },
  { n: 8, x: 69, y: 76, t: 'Sub-fab plant and fire protection',         d: 'mep',     from: 22, ic: 'chiller' },
  { n: 9, x: 42, y: 87, t: 'Piles and pile caps',                       d: 'csa',     from: 0,  ic: 'piles' },
]
export function pinsFor(sel) {
  if (!sel) return new Set()
  const [k, id] = sel
  const s = new Set()
  if (k === 'u') UNITS.find(u => u.id === id).work.forEach(w => s.add(w))
  if (k === 'w') s.add(id)
  if (k === 'y') { const y = sysOf(id); if (y) s.add(y.work) }   /* 25 Sep, midday: the tools hookup systems pin the tools */
  if (k === 's') { if (id === 'hookup') s.add('hookup'); else if (id === 'construct') ['csa', 'mep', 'process'].forEach(w => s.add(w)); else if (id === 'commission' || id === 'maintain') s.add('mep') }
  if (k === 'u' && id === 'hookup') s.add('hookup')
  return s
}
export const frameFor = sel => {
  if (!sel) return 44
  const [k, id] = sel
  if (k === 'y') { const y = sysOf(id); return (y && FRAME.w[y.work]) ?? (FRAME.s && FRAME.s.hookup) ?? 44 }
  return (FRAME[k] && FRAME[k][id]) ?? 44
}
const MOMENT = f => f === 60 ? 'In operation' : f >= 40 ? 'Tools moving in' : f >= 30 ? 'Utilities in the sub-fab' : f >= 22 ? 'Services and plant' : f >= 11 ? 'Cleanroom envelope' : f >= 5 ? 'Frame, slabs and roof' : 'Piles and pile caps'

/* scrub the frames towards the target rather than cutting to it */
export function useScrub(target) {
  const [f, setF] = useState(target)
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setF(target); return }
    let raf
    const step = () => {
      setF(c => { if (c === target) return c; const d = target > c ? 1 : -1; const n = c + d * (Math.abs(target - c) > 12 ? 2 : 1); return d > 0 ? Math.min(n, target) : Math.max(n, target) })
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return f
}

/* 25 Sep: the frame on screen is always one that has decoded. Chrome drops the old bitmap the moment src changes, so
   a scrub through frames not yet in memory blanked the model between them (seen in the headless capture: src "",
   naturalWidth 0). The scrub still steps f; the image follows one decode behind. */
function useDecoded(F, f) {
  const clamp = i => Math.max(0, Math.min(F.length - 1, i | 0))
  const [shown, setShown] = useState(clamp(f))
  useEffect(() => {
    let live = true
    const i = clamp(f), im = new Image()
    const done = () => { if (live) setShown(i) }
    im.src = F[i]
    if (im.decode) im.decode().then(done, done); else im.onload = done
    return () => { live = false }
  }, [F, f])
  return clamp(shown)
}
/* the dark banner crops the empty sides of the frame (object-fit cover, services-map.css): measured 25 Sep, the model
   holds the middle 36 to 71% of the width at full height in most frames, 13 to 82% at rest. CROP is the share cut from
   each side; the pins are remapped so they stay on the parts they name, and a pin past 62% carries its label on its left. */
const CROP = 12
/* the kind of the pick colours the lit pins (Bazil: "colour code it to match"): unit red, service blue, work yellow, system green */
const KIND_ACCENT = { u: '#0B8FD8', s: '#EC2027', w: '#FFFFFF', y: '#0FA968', m: '#0C1220' }   /* 25 Sep: service red, unit blue */
export default function FabStage({ sel, onPick, preload = true, dark = false, kind = null }) {
  const accent = KIND_ACCENT[kind] || null
  const F = dark ? FRAMES_T : FRAMES
  const f = useScrub(frameFor(sel))
  const shown = useDecoded(F, f)
  const lit = pinsFor(sel)
  const px = x => dark ? (x - CROP) / (100 - 2 * CROP) * 100 : x
  useEffect(() => { if (preload) F.forEach(src => { const im = new Image(); im.src = src }) }, [preload, F])
  const pickPin = p => () => { if (!onPick) return; onPick(p.d === 'hookup' ? ['s', 'hookup'] : ['w', p.d]) }
  return (
    <div className={'fx-view' + (onPick ? ' fx-pickable' : '') + (dark ? ' fx-dark' : '') + (kind ? ' fx-k-' + kind : '')} aria-label="IAQ's model of a semiconductor fab">
      <img src={F[shown]} alt="" decoding="async" draggable="false" />
      {PINS.map(p => (
        <span key={p.n} className={'fx-pin d-' + p.d + (p.from > f ? ' gone' : '') + (lit.has(p.d) ? ' lit' : sel ? ' dim' : '') + (px(p.x) > 62 ? ' fx-pin-l' : '')} style={{ left: px(p.x) + '%', top: p.y + '%' }}
          onClick={pickPin(p)} role={onPick ? 'button' : undefined} tabIndex={onPick ? 0 : undefined} onKeyDown={onPick ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickPin(p)() } } : undefined}>
          <i>{p.n}</i><b><IsoIcon name={p.ic} accent={accent || (p.d === 'hookup' ? '#EC2027' : '#FFFFFF')} className="fx-pin-ic" />{p.t}</b>
        </span>
      ))}
      <span className="fx-frame" aria-hidden="true">{MOMENT(shown)}</span>
    </div>
  )
}
