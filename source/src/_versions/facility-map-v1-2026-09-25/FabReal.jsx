import React, { useEffect, useRef, useState } from 'react'
import initFabReal from '../scenes/fabreal.js'
import Icon from './FlowIcon.jsx'
import FabStage from './FabStage.jsx'
import { SYS } from '../lib/relations.jsx'
import '../styles/fab-real.css'

/* ============================================================================
   FabReal · the real fab in the Services banner, driven by the map (25 Sep 2026). A pick in the map lights the
   layers of the Revit model that belong to it, in the kind's colour; a pin per lit layer names it, on a stalk, and
   picks it back in the map. No WebGL: the frame sequence (FabStage) stands in.
   ============================================================================ */
/* the model's layers behind each system of the map (data/business.js order: csa 0..3, mep 0..5, process 0..4) */
const SYS_LAYERS = {
  'csa:0': ['structure'], 'csa:1': ['structure', 'detail-frame'], 'csa:2': ['detail-cleanroomwalls', 'ceiling'], 'csa:3': ['detail-envelope', 'detail-louvres'],
  'mep:0': ['detail-ducts-lite'], 'mep:1': ['detail-processwater'], 'mep:2': ['detail-equipment-lite'], 'mep:3': ['detail-sprinklers-lite'], 'mep:4': ['detail-electrical'], 'mep:5': ['detail-coldwater', 'detail-rainwater', 'detail-sanitary'],
  'process:0': ['detail-pipes-lite'], 'process:1': ['detail-pipes-lite', 'detail-supports'], 'process:2': ['detail-pipes-lite'], 'process:3': ['detail-pipes-lite'], 'process:4': ['detail-pipes-lite'],   /* detail-support is the structure's pile and column supports, not process */
}
const TOOLS = ['detail-tools-lite']
/* the app's manifest-detail-exterior-v3 is its alternative site (the utility building moved 100 m west): a second
   building beside the real one. It is not a layer here (Bazil, 25 Sep: "aren't we focusing on one building"). */
const NAME = { shell: 'The facility', structure: 'Structure', 'detail-frame': 'Frame and roof steel', 'detail-cleanroomwalls': 'Cleanroom walls', ceiling: 'Ceiling grid', 'detail-envelope': 'Envelope', 'detail-louvres': 'Louvres', 'detail-ducts-lite': 'Air ducts', 'detail-processwater': 'Process cooling water', 'detail-equipment-lite': 'Plant and chillers', 'detail-sprinklers-lite': 'Sprinklers', 'detail-electrical': 'Electrical', 'detail-coldwater': 'Cold water', 'detail-rainwater': 'Rainwater', 'detail-sanitary': 'Sanitary', 'detail-pipes-lite': 'Process pipework', 'detail-supports': 'Pipe supports', 'detail-support': 'Supports', 'detail-tools-lite': 'Process tools' }
/* flat line icons on the pins (Bazil: "use flat icon here") */
const ICON = { shell: 'building', structure: 'layers', 'detail-frame': 'building', 'detail-cleanroomwalls': 'cube', ceiling: 'grid', 'detail-envelope': 'cube', 'detail-louvres': 'filter', 'detail-ducts-lite': 'airflow', 'detail-processwater': 'water', 'detail-equipment-lite': 'snow', 'detail-sprinklers-lite': 'shield', 'detail-electrical': 'power', 'detail-coldwater': 'water', 'detail-rainwater': 'water', 'detail-sanitary': 'route', 'detail-pipes-lite': 'gas', 'detail-supports': 'route', 'detail-support': 'route', 'detail-tools-lite': 'link' }
/* the pin picks the system that owns the layer */
const OWNER = {}; Object.entries(SYS_LAYERS).forEach(([id, ls]) => ls.forEach(l => { if (!OWNER[l]) OWNER[l] = ['y', id] })); OWNER['detail-tools-lite'] = ['s', 'hookup']
const KIND_COLOR = { s: '#EC2027', u: '#0B8FD8', w: '#F2B705', y: '#0FA968', m: '#0C1220' }

const workLayers = w => Object.entries(SYS_LAYERS).filter(([id]) => id.startsWith(w + ':')).flatMap(([, ls]) => ls)
export function layersFor(sel) {
  if (!sel) return []
  const [k, id] = sel
  const s = new Set()
  /* 25 Sep, midday: tools hookup is the fourth kind of work, and its three systems are the tools themselves */
  if (k === 'y') { if (id.startsWith('hookup:')) TOOLS.forEach(l => s.add(l)); else SYS_LAYERS[id]?.forEach(l => s.add(l)) }
  if (k === 'w') { if (id === 'hookup') TOOLS.forEach(l => s.add(l)); else workLayers(id).forEach(l => s.add(l)) }
  /* the whole building (shell and structure) stands for the picks that mean all of it; every detail layer at once is
     a heavy load and a pile of pins for the same meaning */
  const whole = () => ['shell', 'structure'].forEach(l => s.add(l))
  if (k === 's') { if (id === 'hookup') TOOLS.forEach(l => s.add(l)); else if (id === 'construct') whole(); else if (id === 'commission' || id === 'maintain') workLayers('mep').forEach(l => s.add(l)); else if (id === 'design') ['structure', 'detail-frame', 'detail-envelope'].forEach(l => s.add(l)); else if (id === 'procure') ['detail-equipment-lite', 'detail-ducts-lite', 'detail-electrical'].forEach(l => s.add(l)) }
  if (k === 'u') { if (id === 'epc') whole(); else if (id === 'hookup') { TOOLS.forEach(l => s.add(l)); workLayers('process').forEach(l => s.add(l)) } else if (id === 'efm') ['detail-equipment-lite', 'detail-ducts-lite', 'detail-electrical', 'detail-processwater'].forEach(l => s.add(l)) }
  if (k === 'm') { if (/cool|energy/i.test(id)) ['detail-equipment-lite', 'detail-processwater'].forEach(l => s.add(l)); else whole() }
  return [...s]
}

export default function FabReal({ sel, onPick, tools = null, apiRef = null, ownTools = true }) {
  const host = useRef(null), api = useRef(null), labRefs = useRef({})
  const [gl, setGl] = useState(true)
  const [ready, setReady] = useState(false)
  const [prog, setProg] = useState(null)
  /* 25 Sep, night (Bazil: "do a quick loading on this banner before everything appear just in case"): the model stays
     under a short loading state until the building stands, and at least 900 ms, so it never pops in piece by piece */
  const [up, setUp] = useState(false)
  const t0 = useRef(performance.now())
  useEffect(() => { if (!ready) return; const id = setTimeout(() => setUp(true), Math.max(0, 900 - (performance.now() - t0.current))); return () => clearTimeout(id) }, [ready])
  const keys = layersFor(sel)
  const colour = sel ? KIND_COLOR[sel[0]] : null
  useEffect(() => {
    const el = host.current; if (!el) return
    const a = initFabReal(el, { onReady: () => setReady(true), onProgress: (n, t) => setProg(n >= t ? null : [n, t]), onFrame: () => {
      /* pins follow their layers every frame; a layer not yet loaded keeps its pin hidden */
      const W = el.clientWidth, H = el.clientHeight
      const placed = []
      /* 25 Sep (Bazil: "don't overlap", the chips over the banner's title): the head's foot in canvas px; a chip that
         would rise into it hangs below its point instead */
      const headEl = el.closest('.sm-map-dark') && el.closest('.sm-map-dark').querySelector('.sm-map-head-r')
      let hb = -1e9
      if (headEl) { const hr = headEl.getBoundingClientRect(), er = el.getBoundingClientRect(); const z = er.height / (H || er.height) || 1; if (hr.width > 0) hb = (hr.bottom - er.top) / z }
      const ks = Object.keys(labRefs.current).filter(k => labRefs.current[k])
      for (const [n, k] of ks.entries()) {
        const lab = labRefs.current[k]
        const p = a.project(k, ks.length < 2 ? .5 : n / (ks.length - 1))
        if (!p || p.x < 0 || p.x > W || p.y < 0 || p.y > H) { lab.style.opacity = '0'; continue }
        /* a chip that would land on one already placed rises above it (the stalk grows), so names never pile */
        const w = lab.offsetWidth || 120, h = 30
        let y = p.y, lift = 0
        /* placed above first (rising over any chip already there); if the chip's top would cross the head, it hangs
           below its point instead, stepping down past any chip already there */
        for (let i = 0; i < 6; i++) { const hit = placed.find(q => Math.abs(q.x - p.x) < (q.w + w) / 2 + 6 && Math.abs(q.y - y) < h + 4); if (!hit) break; y = hit.y - h - 6; lift = p.y - y }
        const below = y - 22 - h < hb + 6
        if (below) { y = p.y; lift = 0; for (let i = 0; i < 6; i++) { const hit = placed.find(q => Math.abs(q.x - p.x) < (q.w + w) / 2 + 6 && Math.abs(q.y - y) < h + 4); if (!hit) break; y = hit.y + h + 6; lift = y - p.y } }
        placed.push({ x: p.x, y, w })
        lab.classList.toggle('below', below)
        lab.style.opacity = '1'; lab.style.left = Math.round(p.x) + 'px'; lab.style.top = Math.round(p.y) + 'px'; lab.style.setProperty('--lift', lift + 'px')
      }
    } })
    if (!a) { setGl(false); return }
    api.current = a
    if (apiRef) apiRef.current = a   /* 26 Sep: the Services banner draws the view tools in its own column */
    labRefs.current = {}
    return () => { a.stop(); api.current = null; if (apiRef) apiRef.current = null }
  }, [])
  useEffect(() => { if (api.current) api.current.focus(keys, colour) }, [keys.join('|'), colour])
  if (!gl) return <FabStage sel={sel} onPick={onPick} dark kind={sel ? sel[0] : null} />
  const shown = keys.slice(0, 6)
  return (
    <div className={'fr' + (up ? ' is-ready' : '')} aria-label="IAQ's fab, the Revit model" aria-busy={!up}>
      <div className="fr-host" ref={host} />
      <div className="fr-load" aria-hidden={up}>
        <span className="fr-load-bar"><i /></span>
        <p>Loading the facility model</p>
      </div>
      <div className="fr-labs" aria-hidden="true">
        {shown.map(k => (
          <button type="button" key={k} className="fr-lab" ref={el => { if (el) labRefs.current[k] = el; else delete labRefs.current[k] }} style={{ '--c': colour || '#EC2027' }} onClick={() => onPick && onPick(OWNER[k] || ['w', 'mep'])}>
            <b><Icon name={ICON[k] || 'route'} className="fr-lab-ic" />{NAME[k] || k}</b><i />
          </button>
        ))}
      </div>
      {ownTools && <div className="fr-tools" role="group" aria-label="View">
        <button type="button" onClick={() => api.current && api.current.zoom(1)} aria-label="Zoom in">+</button>
        <button type="button" onClick={() => api.current && api.current.zoom(-1)} aria-label="Zoom out">&minus;</button>
        <button type="button" onClick={() => api.current && api.current.reset()} aria-label="Reset view">&#8635;</button>
        {tools}
      </div>}
      {/* 25 Sep, night (Bazil: "remove this"): the drag hint is gone once the model is ready; the loading lines stay */}
      {up && prog && <p className="fr-hint">{`Loading the systems, ${prog[0]} of ${prog[1]}`}</p>}
    </div>
  )
}
