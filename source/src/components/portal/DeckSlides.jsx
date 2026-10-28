import React, { useCallback, useEffect, useRef, useState } from 'react'
import CycleFlow from '../CycleFlow.jsx'
import Icon from '../FlowIcon.jsx'
import { CYCLE_SVG } from '../../data/cycleMarks.js'
import SystemMap from '../SystemMap.jsx'
import { CYCLE } from '../../data/cycle.js'
import '../../styles/cycle-flow.css'
/* the slide frame (.cxs) and its tokens: loaded here so the deck stands alone (the 8 Oct zip had no frames without it) */
import '../../styles/codex-slides.css'
import '../../styles/cycle-band.css'
import { MARKETS } from '../../data/markets.js'
import { HERO_LINE } from '../HeroLineMarks.jsx'
import { DECK_QR } from '../../data/deckQr.js'

/* ============================================================================
   DeckSlides · 7 Oct 2026. The slides of the exhibition deck (Bazil: "tab 1 is parallax, 2 is interactive like
   walkthrough, 3 one more like this one picture to show business unit etc, and make sure no short code", "have the
   services process as well, the round one, interactive", "then another tab for this" [the one chart], "improve all
   better for presentation, cause this one is for the screen exhibition").

   Every slide is a 16:9 frame in the Codex slide system (.cxs, measures in cqw), so the set scales as one piece from
   the portal to the booth TV. Live pieces the site already has (the developer's 3D, the service ring, the one chart)
   are shown INSIDE a frame: <Fit> lays a piece out at its design width and scales it to the frame, so nothing is
   cut at any screen size and nothing is drawn twice.
   ============================================================================ */

/* the frame: title, one line, the body, the foot with the mark. No key, no short forms (Bazil: "no short code") */
export function Frame ({ title, sub, foot, children, cls = '' }) {
  return (
    <div className="cxs-wrap">
      <article className={'cxs pr-fr ' + cls}>
        <div className="cxs-in">
          <header className="cxs-h"><h3>{title}</h3>{sub && <p>{sub}</p>}</header>
          <div className="cxs-b">{children}</div>
          <footer className="cxs-f">
            <span className="cxs-f-l"><img src="/assets/iaq-logo.webp" alt="IAQ" /><span>{foot}</span></span>
            <span />
            <span className="n" />
          </footer>
        </div>
      </article>
    </div>
  )
}

/* a piece laid out at its design width `w`, scaled to fit the box it is given, centred */
export function Fit ({ w = 1400, children }) {
  const outer = useRef(null), inner = useRef(null)
  const [k, setK] = useState(1)
  useEffect(() => {
    const o = outer.current, i = inner.current; if (!o || !i) return
    const calc = () => { const W = o.clientWidth, H = o.clientHeight, ih = i.offsetHeight || 1; setK(Math.max(.05, Math.min(W / w, H / ih))) }
    const ro = new ResizeObserver(calc); ro.observe(o); ro.observe(i); calc()
    return () => ro.disconnect()
  }, [w])
  return (
    <div className="pr-fit" ref={outer}>
      <div className="pr-fit-in" ref={inner} style={{ width: w, display: 'flow-root', transform: `translate(-50%,-50%) scale(${k})` }}>{children}</div>
    </div>
  )
}

/* ---------- 0 · the home banner, as a slide ----------
   Bazil: "add the first video as the homepage website banner", "loop", "but IAQ is a lot bigger on top of title, no need
   description, no button or nav bar", "but leave the industries". The reel is the home hero's, same clips in the LOCKED
   order (scenes/home.js SRC, 26 Sep): two players, a dissolve, each clip handing over before its own loop point, round
   and round. The mark large over the three-line title, the seven markets along the foot, nothing else. */
const VISIT_CLIPS = ['/assets/videos/cr-corridor-hf.mp4', '/assets/videos/cr-bay-hf.mp4']
/* 26 Oct: the home reel's order (IAQ review, NR): cleanroom first, the stadium out, IAQ's wafer fab construction footage in */
const REEL = ['/assets/videos/cr-bay-hf.mp4', '/assets/videos/cr-corridor-hf.mp4', '/assets/videos/hookup-team-rep.mp4', '/assets/videos/hero-site-aerial.mp4', '/assets/videos/hero-site-lift-hf.mp4', '/assets/hero-campus-dusk-clean.mp4', '/assets/videos/hero-mkt-data-centre.mp4', '/assets/videos/hero-mkt-district-cooling.mp4', '/assets/videos/hero-kl.mp4']
const HOLDS = { 'hookup-team-rep': 4.0, 'hero-site-lift-hf': 5.5 }
const FADE = 1100, HOLD = 6.6
export function BannerSlide ({ active = true }) {
  const v0 = useRef(null), v1 = useRef(null)
  useEffect(() => {
    if (!active) return
    const vids = [v0.current, v1.current]; if (!vids[0] || !vids[1]) return
    let cur = 0, idx = 0, dead = false, timer = 0, t2 = 0, t3 = 0
    const key = v => (v.getAttribute('src') || '').split('/').pop().replace(/\.mp4$/, '')
    const holdFor = v => { const k = key(v); if (HOLDS[k]) return HOLDS[k]; const d = v.duration; return isFinite(d) && d > 2 ? Math.max(3.4, d - FADE / 1000 - .25) : HOLD }
    const play = v => { const p = v.play(); if (p && p.catch) p.catch(() => {}) }
    const load = (v, i) => { if (v.getAttribute('src') !== REEL[i]) { v.setAttribute('src', REEL[i]); v.load() } }
    const queue = () => { const v = vids[cur]; clearTimeout(timer); timer = setTimeout(handover, Math.max(1200, holdFor(v) * 1000)); load(vids[1 - cur], (idx + 1) % REEL.length) }
    const handover = () => {
      if (dead) return
      const out = vids[cur], nxt = vids[1 - cur]
      idx = (idx + 1) % REEL.length
      load(nxt, idx)
      let fired = false
      const go = () => {
        if (fired || dead) return; fired = true
        nxt.removeEventListener('canplay', go); clearTimeout(t3)
        nxt.style.zIndex = 2; out.style.zIndex = 1
        try { nxt.currentTime = 0 } catch {}
        play(nxt); nxt.classList.add('on')
        t2 = setTimeout(() => { if (dead) return; out.classList.remove('on'); out.pause(); cur = 1 - cur; queue() }, FADE)
      }
      if (nxt.readyState >= 3) go(); else { nxt.addEventListener('canplay', go); t3 = setTimeout(go, 3000) }
    }
    vids.forEach((v, i) => { v.muted = true; v.loop = true; v.playsInline = true; v.style.zIndex = i })
    load(vids[0], 0); play(vids[0]); vids[0].classList.add('on'); queue()
    const onMeta = () => queue()   /* the first clip's real hold, once its length is known */
    vids[0].addEventListener('loadedmetadata', onMeta)
    return () => { dead = true; clearTimeout(timer); clearTimeout(t2); clearTimeout(t3); vids[0].removeEventListener('loadedmetadata', onMeta); vids.forEach(v => { v.pause(); v.classList.remove('on') }) }
  }, [active])
  return (
    <div className="pr-ban">
      <div className="pr-ban-v" aria-hidden="true"><video ref={v0} muted playsInline preload="auto" /><video ref={v1} muted playsInline preload="auto" /></div>
      <div className="pr-ban-scrim" aria-hidden="true" />
      <div className="pr-ban-in">
        <img className="pr-ban-logo" src="/assets/iaq-logo-rwhite.webp" alt="IAQ" />
        <h3>We build the<br />environments where<br />the <em>future is made</em></h3>
      </div>
      <ul className="pr-ban-mk" aria-label="Markets">
        {MARKETS.map(m => { const M = HERO_LINE[m.id]; return <li key={m.id}>{M ? <M className="pr-ban-ic" /> : null}<span>{m.name}</span></li> })}
      </ul>
    </div>
  )
}

/* ---------- 1 and 2 · the developer's 3D, built by scrolling, then walked ----------
   One frame serves both tabs (the app is heavy; it loads once). `mode` drives it: build = the runway at its start,
   the visitor scrolls inside the frame and the facility assembles; walk = the runway at its end, the app's own
   "Enter the cleanroom" pressed as soon as it allows, first person. Back to build leaves the room first. */
/* ---------- the systems view (Bazil, 7 Oct: "have a blow up view like this as well but explaining each section or
   services and it highlights", "we have the business unit also being explained, what are the parts", "you can use our
   actual 3D for this if it's better", "maybe the building view can have different view", "remember EPC is everything but
   tools hookup", "a screen must show a blow up view and show info about EPC and all the services and parts and energy
   management info", "tools hook up ... supposed to be at the middle", "visually labelled as well for each").

   The built facility with its envelope turned to glass, from a higher view that turns slowly. The panel on the right
   is the three units: EPC with its seven systems, PCU & TTI with its two offerings, Energy Management with its two.
   The item in hand lights its discipline(s) in the model and greys the rest; every discipline carries a label on the
   left with a leader to its part, following the camera. The eight disciplines are the app's own chapters (its assembly
   controller groups the model by them); what each holds is the Codex's (data/business.js WORK) and the exhibition
   art's lists; the unit is Bazil's rule. Drawn with the app's own tools: wear() lights or greys a discipline's
   materials, the fade keeps the app's own per-frame alpha in agreement, orbitBy() turns the camera. Everything is put
   back when the slide is left. */
const CH = ['Civil & Structural', 'Architectural', 'Process Utilities', 'Fire Protection', 'Air-conditioning', 'HT & LV Electrical', 'Cleanroom System', 'Tools Hookup']
/* where each discipline's label points: one storey object of that chapter, so the eight anchors spread over the model */
const CH_ANCHOR = { 'Civil & Structural': /support-apron|frame-apron/, Architectural: /shell-3f|shell-2f|shell-roof/, 'Process Utilities': /pipes-gf|coldwater-gf/, 'Fire Protection': /sprinklers-1f/, 'Air-conditioning': /ducts-roof|ducts-3f/, 'HT & LV Electrical': /electrical-2f/, 'Cleanroom System': /cleanroomwalls-1f|ceiling-1f/, 'Tools Hookup': /tools-gf/ }
const SYS_UNITS = [
  { id: 'epc', no: 1, name: 'EPC', full: 'Engineering, Procurement and Construction', line: 'Builds the facility: every system below, from the first drawing to handover.',
    items: [
      { k: 'csa', name: 'Civil & Structural', lights: ['Civil & Structural'], work: 'CSA', line: 'The ground it stands on and the frame that carries every floor.', sys: ['Piling and foundations', 'Structural frame and roof'] },
      { k: 'arch', name: 'Architectural', lights: ['Architectural'], work: 'CSA', line: 'What closes the building and what the owner sees.', sys: ['Building envelope', 'Architectural finishes'] },
      { k: 'pu', name: 'Process utilities', lights: ['Process Utilities'], work: 'Process utilities', line: 'What the tools run on, piped through the building before a tool arrives.', sys: ['Clean dry air (CDA)', 'Specialty gases and chemical delivery', 'Ultrapure water (UPW)', 'Process vacuum (PV) and exhaust', 'Waste treatment'] },
      { k: 'fire', name: 'Fire protection', lights: ['Fire Protection'], work: 'MEP', line: 'Sprinklers and suppression on every floor, to the class the facility is certified to.', sys: ['Sprinklers and suppression'] },
      { k: 'ac', name: 'Air-conditioning', lights: ['Air-conditioning'], work: 'MEP', line: 'The air handling that holds a cleanroom in spec: temperature, humidity, pressure, particles.', sys: ['HVAC, ACMV and fan filter units', 'Chiller plant and district cooling', 'Process cooling water (PCW)'] },
      { k: 'elec', name: 'HV, MV and LV electrical', lights: ['HT & LV Electrical'], work: 'MEP', line: 'Power from the intake to every panel: high, medium and low voltage distribution.', sys: ['Electrical, high and low voltage'] },
      { k: 'cr', name: 'Cleanroom system', lights: ['Cleanroom System'], work: 'CSA', line: 'The cleanroom enclosure, built to class.', sys: ['Walls', 'Ceiling grid', 'Raised floor'] },
    ] },
  { id: 'pcu', no: 2, name: 'PCU & TTI', full: 'Process Critical Utilities & Total Tool Installation Solutions', line: 'Re-equips a live semiconductor fab: the utilities a tool needs, and the tool connected to them.',
    items: [
      { k: 'pcu', name: 'Process critical utilities', lights: ['Process Utilities'], work: 'Process utilities', line: 'The utility infrastructure, from facility readiness to manufacturing start-up.', sys: ['Water: UPW plant and distribution, process waste drains, WWT, reclaim, ZLD, chemical storage and dispensing', 'Chemical and slurry: bulk chemical, blending, dispense systems', 'Gas: bulk gas, specialty gas and abatement, bunker (NH3, SiH4, H2) and liquid dispense', 'Process exhaust: general, acid, caustic, solvent and calamity'] },
      { k: 'tti', name: 'Tool installation hook-up', lights: ['Tools Hookup'], work: 'Service 6', line: 'Each tool connected and released to production, inside a fab that keeps running.', sys: ['Bulk gas', 'Specialty gas', 'Process chemicals', 'Ultra pure water', 'Process cooling water', 'Process drain', 'Process vacuum', 'High vacuum', 'Process exhaust', 'Gas detection and monitoring', 'Electrical power and controls'] },
    ] },
  { id: 'efm', no: 3, name: 'Energy Management', full: 'Energy Facility Management', line: 'Runs and maintains it: the plant that moves air, water and power, kept efficient for the facility’s life.',
    items: [
      { k: 'om', name: 'Operate and maintain', lights: ['Air-conditioning', 'HT & LV Electrical'], work: 'MEP', line: 'The plant IAQ runs for the owner, planned and unplanned.', sys: ['Full comprehensive maintenance, planned and unplanned', 'Non-comprehensive maintenance, planned only', 'HVAC system', 'Process equipment', 'Operational support'] },
      { k: 'ec', name: 'Energy contracts', lights: ['Air-conditioning'], work: 'Energy, ESCO', line: 'Lower bills, funded by IAQ, paid from what is saved.', sys: ['Cooling as a Service', 'Energy Performance Contracting', 'Energy audit', 'Chiller plant and HVAC upgrading', 'Build Operate Transfer, district cooling'] },
    ] },
]
const SYS_ITEMS = SYS_UNITS.flatMap(u => u.items.map(it => ({ ...it, unit: u })))
const SYS_FADE = ['layer-detail-envelope', 'layer-detail-exterior-v3', 'layer-detail-shell', 'layer-detail-louvres', 'building', 'section-roof', 'east-block-closing-wall', 'south-infill', 'doors']
const SYS_CSS = '#hud2,#view-tools,#skin-switch,#stage-rail,#scroll-hint,#callouts,#part-chip,#assembly-ui{display:none!important}'
/* the world centre of an object, from its meshes' boxes (the frame's THREE is not reachable from here) */
function centreOf (obj) {
  let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9], n = 0
  obj.updateMatrixWorld(true)
  obj.traverse(m => {
    if (!m.isMesh || !m.geometry) return
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox()
    const bb = m.geometry.boundingBox, e = m.matrixWorld.elements
    if (!bb || !isFinite(bb.min.x) || !isFinite(bb.max.x) || !isFinite(bb.min.y) || !isFinite(bb.max.y)) return
    for (let i = 0; i < 8; i++) {
      const lx = i & 1 ? bb.max.x : bb.min.x, ly = i & 2 ? bb.max.y : bb.min.y, lz = i & 4 ? bb.max.z : bb.min.z
      const x = e[0] * lx + e[4] * ly + e[8] * lz + e[12], y = e[1] * lx + e[5] * ly + e[9] * lz + e[13], z = e[2] * lx + e[6] * ly + e[10] * lz + e[14]
      mn = [Math.min(mn[0], x), Math.min(mn[1], y), Math.min(mn[2], z)]; mx = [Math.max(mx[0], x), Math.max(mx[1], y), Math.max(mx[2], z)]
    }
    n++
  })
  const c = [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2]
  return n && c.every(v => isFinite(v)) ? c : null
}
function sysOn (win) {
  const a = win.__iaqAsm, sc = win.__iaqScene, doc = win.document
  if (!a || !sc || !a.eachMaterial) return null
  const seen = new Set(), mats = []
  for (const n of SYS_FADE) {
    const g = sc.getObjectByName(n); if (!g) continue
    a.eachMaterial(g, m => {
      if (seen.has(m)) return; seen.add(m)
      const u = m.userData
      if (!u.prOrig) u.prOrig = { t: u.asmTransparent !== undefined ? u.asmTransparent : m.transparent, o: u.asmOpacity !== undefined ? u.asmOpacity : m.opacity, faded: u.asmFaded, dw: m.depthWrite, tr: m.transparent, op: m.opacity }
      u.asmFaded = true; u.asmTransparent = true; u.asmOpacity = .08
      m.transparent = true; m.opacity = .08; m.depthWrite = false; m.needsUpdate = true
      mats.push(m)
    })
  }
  try { a.buildFocusIndex() } catch {}
  /* the model is colour coded by the developer already (each discipline in its code colour): wear('base') records each
     material's own colour, and the discipline's swatch is the colour most of its materials carry */
  const colors = {}
  try {
    for (const [c, ms] of a.focusIndex) {
      const tally = new Map()
      for (const m of ms) { a.wear(m, 'base'); const fb = m.userData.focusBase; if (!fb) continue; const h = fb.getHexString(); tally.set(h, (tally.get(h) || 0) + 1) }
      let best = null, n = 0; for (const [h, k] of tally) if (k > n) { best = h; n = k }
      if (best) colors[c] = '#' + best
    }
  } catch {}
  /* one anchor per discipline, from the chapter's own storey objects */
  const anchors = {}
  try {
    const byCh = new Map()
    a.groups.forEach((objs, i) => { const c = a.beatCaption(i).chapter; if (!byCh.has(c)) byCh.set(c, []); byCh.get(c).push(...objs) })
    for (const c of CH) {
      const objs = byCh.get(c) || []
      const pick = objs.find(o => CH_ANCHOR[c] && CH_ANCHOR[c].test(o.name || '')) || objs[0]
      const p = pick && centreOf(pick); if (p) anchors[c] = { obj: pick, p }
    }
  } catch {}
  if (!doc.getElementById('pr-sys-css')) { const st = doc.createElement('style'); st.id = 'pr-sys-css'; st.textContent = SYS_CSS; doc.head.appendChild(st) }
  const tilt0 = a.tilt, spin0 = a.spin
  /* the camera set, not nudged: a higher three-quarter view (tilt .33, the angle checked on 8 Oct), whatever the app's
     camera was doing before */
  try { a.spin = 0; a.tilt = .33 } catch {}
  /* the blow-up (Bazil: "isn't this supposed to be a blow-up view"): the app explodes its storeys during the build and
     settles them at the end; here its explode amount is held at one and its lift made larger, so the floors stand
     apart with everything built. Both are own properties over the prototype's methods; deleting them puts the app back */
  try { a.explodeAt = () => 1; a.lift = t => a.explodeEased * 9 * t } catch {}
  /* the floors apart stand taller than the building: the camera steps back out the deck's two steps in */
  const zo = doc.getElementById('zoom-out'); if (zo) { zo.click(); setTimeout(() => zo.click(), 200) }
  /* a section, not the whole long building (Bazil: "does it require the whole wide building or just a section?", "up to
     you what's best"): the developer's own cut (the app's `section`, the slice its build view opens on), held by the
     app's four clipping planes every frame; its own updateClipping opens the cut as the build ends, so it is replaced
     while this view is up and deleted on leaving */
  try {
    /* the developer's own cut, as the app sets it on a full-size screen (read 7 Oct); fixed here rather than read live,
       because an app started small (the deck's preload) seeds a narrower cut */
    const S = { xMin: -27.437, xMax: 0.562, zMin: -35.557, zMax: 4.257 }
    a.updateClipping = function () {
      const p = this.planes; if (!p || p.length < 4) return
      p[0].normal.set(1, 0, 0); p[0].constant = -S.xMin; p[1].normal.set(-1, 0, 0); p[1].constant = S.xMax
      p[2].normal.set(0, 0, 1); p[2].constant = -S.zMin; p[3].normal.set(0, 0, -1); p[3].constant = S.zMax
      if (this.shellPlane) { this.shellPlane.normal.set(0, 0, -1); this.shellPlane.constant = S.zMax }
    }
  } catch {}
  /* every discipline material keeps its own alpha origin, so a part can be shown or hidden by state (the app's own
     per-frame alpha reads these back, so nothing fights) */
  const dmats = []
  try { for (const [, ms] of a.focusIndex) for (const m of ms) { const u = m.userData; if (!u.prAlpha) u.prAlpha = { t: u.asmTransparent !== undefined ? u.asmTransparent : m.transparent, o: u.asmOpacity !== undefined ? u.asmOpacity : m.opacity, faded: u.asmFaded, dw: m.depthWrite, tr: m.transparent, op: m.opacity }; u.asmFaded = true; dmats.push(m) } } catch {}
  /* the envelope and the exterior: the Classic skin brings them back solid, and the section cut turns them into white
     slabs over the systems; this view hides them outright (held every frame by the label loop), and gives them back */
  const hide = []
  for (const n of ['layer-detail-envelope', 'layer-detail-exterior-v3']) { const g = sc.getObjectByName(n); if (g) { hide.push([g, g.visible]); g.visible = false } }
  return { mats, tilt0, spin0, anchors, colors, dmats, hide, t0: Date.now() }
}
/* only: the parts in hand shown in their colour, every other discipline hidden (Bazil: "just show part of the building
   related only"); coded: every discipline in its code colour, the ones in hand at full strength, the rest softened */
function sysLight (win, lights, only = true) {
  const a = win.__iaqAsm; if (!a || !a.focusIndex) return
  const lit = []
  for (const [c, ms] of a.focusIndex) for (const m of ms) {
    const on = lights.includes(c), u = m.userData, o = u.prAlpha
    if (on) {
      a.wear(m, 'active'); lit.push(m)
      if (o) { u.asmTransparent = o.t; u.asmOpacity = o.o; m.transparent = o.tr; m.opacity = o.op; m.depthWrite = o.dw }
      continue
    }
    /* related parts only: every other system hidden, the structural frame kept as a faint ghost so the separated floors
       still read as floors (a blow-up, not loose pipes in the dark) */
    if (only) { const g = c === 'Civil & Structural' ? .13 : 0; a.wear(m, g ? 'grey' : 'base'); u.asmTransparent = true; u.asmOpacity = g; m.transparent = true; m.opacity = g; m.depthWrite = false; continue }
    a.wear(m, 'base')
    if (o) { u.asmTransparent = o.t; u.asmOpacity = o.o; m.transparent = o.tr; m.opacity = o.op; m.depthWrite = o.dw }
    const fb = u.focusBase
    /* every other system in its own code colour, dimmed on the black stage, so the lit one stands out and the rest
       still read by colour (8 Oct: softening toward grey turned the whole stack white) */
    if (fb && m.color) { try { m.color.copy(fb).multiplyScalar(.4); m.envMapIntensity = .25 } catch {} }
  }
  /* on the black stage the lit discipline carries its own code colour as light, so it reads from across the booth;
     wear() puts every material's own emissive back on the next change and on leaving */
  for (const m of lit) { const fb = m.userData.focusBase; if (m.emissive && fb) { m.emissive.copy(fb).multiplyScalar(.55); m.emissiveIntensity = 1 } }
}
function sysOff (win, st) {
  const a = win.__iaqAsm, doc = win.document
  if (st && st.mats) for (const m of st.mats) { const u = m.userData, o = u.prOrig; if (!o) continue; u.asmTransparent = o.t; u.asmOpacity = o.o; u.asmFaded = o.faded; m.transparent = o.tr; m.opacity = o.op; m.depthWrite = o.dw; m.needsUpdate = true; delete u.prOrig }
  if (st && st.hide) for (const [g, v] of st.hide) g.visible = v
  if (st && st.dmats) for (const m of st.dmats) { const u = m.userData, o = u.prAlpha; if (!o) continue; u.asmTransparent = o.t; u.asmOpacity = o.o; u.asmFaded = o.faded; m.transparent = o.tr; m.opacity = o.op; m.depthWrite = o.dw; m.needsUpdate = true; delete u.prAlpha }
  try { if (a) { a.releaseFocus(); if (st) { a.tilt = st.tilt0; a.spin = st.spin0 }; delete a.explodeAt; delete a.lift; delete a.updateClipping } } catch {}
  /* the skin is NOT switched back here: a skin switch recompiles the app's shaders, and doing it on leaving made the
     next slide stutter for seconds (8 Oct, measured 14.5 fps on Three units). The build and walk tabs set the daylight
     skin themselves, behind the veil, when they open */
  const zi = doc && doc.getElementById('zoom-in'); if (zi) { zi.click(); setTimeout(() => zi.click(), 200) }
  const css = doc && doc.getElementById('pr-sys-css'); if (css) css.remove()
}
/* a world point on the frame, in the frame's own pixels: the camera's matrices, applied by hand */
function project (cam, p, W, H) {
  const v = cam.matrixWorldInverse.elements, q = cam.projectionMatrix.elements
  const x = v[0] * p[0] + v[4] * p[1] + v[8] * p[2] + v[12], y = v[1] * p[0] + v[5] * p[1] + v[9] * p[2] + v[13], z = v[2] * p[0] + v[6] * p[1] + v[10] * p[2] + v[14]
  const cx = q[0] * x + q[4] * y + q[8] * z + q[12], cy = q[1] * x + q[5] * y + q[9] * z + q[13], cw = q[3] * x + q[7] * y + q[11] * z + q[15]
  if (!(cw > 0)) return null
  const r = [(cx / cw + 1) / 2 * W, (1 - cy / cw) / 2 * H]
  return isFinite(r[0]) && isFinite(r[1]) ? r : null
}

export function Fab3D ({ mode = 'build', active = true, reel = false, dur = 24, preload = false, onLost }) {
  const frame = useRef(null)
  const [go, setGo] = useState(false)
  const [ready, setReady] = useState(false)
  const [sys, setSys] = useState(0)          /* the panel item in hand on the systems view */
  const [sysReady, setSysReady] = useState(false)
  const sysRef = useRef(null), touched = useRef(false), labels = useRef(null), listRef = useRef(null), skin0 = useRef(null)
  /* loaded on first use, or ahead of it when the deck asks (it loads asleep, two pixels tall, while another slide plays) */
  useEffect(() => { if (active || preload) setGo(true) }, [active, preload])
  /* 9 Oct (Bazil: "make sure stable"): if the browser takes the 3D's graphics context away (GPU reset, memory pressure,
     a long unattended day), the deck is told and reloads the 3D rather than showing a frozen or black frame */
  useEffect(() => {
    if (!ready || !onLost) return
    let cv = null, lost = null
    try { cv = frame.current && frame.current.contentDocument && frame.current.contentDocument.querySelector('canvas') } catch {}
    if (!cv) return
    lost = e => { try { e.preventDefault() } catch {} ; onLost() }
    cv.addEventListener('webglcontextlost', lost)
    return () => { try { cv.removeEventListener('webglcontextlost', lost) } catch {} }
  }, [ready, onLost])
  /* 8 Oct (Bazil: "needs to seem flawless"): every handover between the three 3D tabs happens behind a veil, so the
     app's camera dive, its skin switch and the systems view being set up are never seen. The drive lifts the veil the
     moment the new view is in place; a ceiling of seven seconds lifts it whatever happens */
  const [veil, setVeil] = useState(false)
  const shown = useRef(null), veilT = useRef(0)
  const lift = useCallback(() => { clearTimeout(veilT.current); veilT.current = setTimeout(() => setVeil(false), 350) }, [])
  useEffect(() => {
    if (!active) return
    if (shown.current !== null && (shown.current !== mode || mode !== 'build')) { setVeil(true); clearTimeout(veilT.current); veilT.current = setTimeout(() => setVeil(false), 7000) }
    shown.current = mode
  }, [mode, active])
  useEffect(() => () => clearTimeout(veilT.current), [])
  useEffect(() => {
    if (!go || !active) return
    const f = frame.current; if (!f) return
    let stop = false, t = 0
    const drive = () => {
      if (stop) return
      let win, doc
      try { win = f.contentWindow; doc = win && win.document } catch { return }
      /* the iframe's first document is a blank page that also reads "complete": wait for the app itself, its assembly
         controller up and its runway laid */
      if (!doc || !doc.body || doc.readyState !== 'complete' || !/\/3d\//.test(doc.location.pathname) || !win.__iaqAsm) { t = setTimeout(drive, 250); return }
      const se = doc.scrollingElement || doc.documentElement
      const runway = Math.max(0, se.scrollHeight - se.clientHeight)
      const rb = doc.getElementById('room-bar')
      const inRoom = !!((rb && !rb.hidden) || doc.body.classList.contains('room'))
      if (mode === 'systems') {
        if (inRoom) { const ex = doc.getElementById('exit-room'); if (ex) ex.click(); t = setTimeout(drive, 600); return }
        /* parked just before the app's last beat ("Overall", the handover view, where it fades the interior out for the
           finished building): every system built and on show */
        const ov = (win.__iaqChapters || []).find(c => c.name === 'Overall')
        const target = ov && isFinite(ov.p) ? Math.max(.5, ov.p - .015) : .88
        const want = Math.round(target * runway)
        if (runway > 0 && Math.abs(se.scrollTop - want) > 3) { win.scrollTo(0, want); t = setTimeout(drive, 300); return }
        const a = win.__iaqAsm
        if (!a || Math.abs(a.smoothed - target) > .01) { t = setTimeout(drive, 300); return }
        /* the black stage first (Bazil: "just black visual is ok", "the info on the black background"): the app's Classic
           skin resets materials as it lands, so the look is applied only once the skin is on; the skin that was on comes
           back on leaving */
        if (!doc.body.classList.contains('skin-v1')) {
          if (skin0.current === null) { const on = doc.querySelector('#skin-switch [aria-pressed="true"]'); skin0.current = on ? on.id : 'skin-v3' }
          const v1 = doc.getElementById('skin-v1'); if (v1) v1.click()
          t = setTimeout(drive, 700); return
        }
        if (!sysRef.current) { const st = sysOn(win); if (st) { st.skin0 = skin0.current; sysRef.current = st; setSysReady(true) } }
        /* the veil lifts only once the floors have finished moving apart and the camera has come back out */
        if (!(a.explodeEased > .97) || Date.now() - (sysRef.current ? sysRef.current.t0 : 0) < 1400) { t = setTimeout(drive, 150); return }
        lift()
        return
      }
      if (mode === 'walk') {
        /* the app's key list sits over the middle of the view: the deck hides it (the walk needs no reading on a TV) */
        if (!doc.getElementById('pr-walk-css')) { const st = doc.createElement('style'); st.id = 'pr-walk-css'; st.textContent = '#room-keys,#keys-toggle{display:none!important}'; doc.head.appendChild(st) }
        if (inRoom) { lift(); if (!walked) { walked = true; stroll(doc) } return }
        if (runway > 0 && se.scrollTop < runway - 2) win.scrollTo(0, runway)
        /* the app's Explore button carries the dive (its click handler, Lv in the bundle) whether or not the Environment
           skin lays it out (body.skin-v3 hides #assembly-ui), so it is pressed by its state, never by its box. The app
           focuses its canvas on entry, which would scroll this page: the page's scroll is put back */
        const cta = doc.getElementById('explore-cta')
        if (cta && !cta.hidden && !cta.disabled) { const y = window.scrollY; cta.click(); setTimeout(() => window.scrollTo(0, y), 50); setTimeout(() => window.scrollTo(0, y), 400) }
        t = setTimeout(drive, 400)
      } else {
        if (inRoom) { const ex = doc.getElementById('exit-room'); if (ex) ex.click(); t = setTimeout(drive, 600); return }
        /* the daylight site for the build and the walk (the website's default since 26 Sep); the systems view takes the
           black stage itself and hands this back */
        if (!skinned) { skinned = true; const v3 = doc.getElementById('skin-v3'); if (v3 && v3.getAttribute('aria-pressed') !== 'true') { v3.click(); t = setTimeout(drive, 700); return } }
        lift()
        /* 8 Oct (Bazil: "proper presentation"): the build plays itself each time the slide opens, in or out of the
           showreel; a scroll, a drag or a key inside the frame hands it to the visitor */
        if (!built) { built = true; build(win, se, doc) }
      }
    }
    /* the showreel: the build runs the runway end to end on its own, eased, in the slide's time less a breath */
    let built = false, walked = false, raf = 0, skinned = false, took = false
    const build = (win, se, doc) => {
      const t0 = performance.now(), T = Math.max(6, (reel ? dur : 26) - 4) * 1000
      const take = e => { if (e && e.isTrusted === false) return; took = true; cancelAnimationFrame(raf) }
      for (const ev of ['wheel', 'pointerdown', 'keydown', 'touchstart']) doc.addEventListener(ev, take, { passive: true, capture: true })
      takers.push(() => { for (const ev of ['wheel', 'pointerdown', 'keydown', 'touchstart']) doc.removeEventListener(ev, take, { capture: true }) })
      const tick = () => { if (stop || took) return; const p = Math.min(1, (performance.now() - t0) / T), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; const sl = win.document.scrollingElement || win.document.documentElement; const r = Math.max(0, sl.scrollHeight - sl.clientHeight); if (r > 0) win.scrollTo(0, Math.round(e * r)); if (p < 1) raf = requestAnimationFrame(tick) }
      win.scrollTo(0, 0); raf = requestAnimationFrame(tick)
    }
    const takers = []
    /* the showreel inside: a few steps forward, a pause, a few more, by the app's own keys */
    /* the walk plays itself too (in or out of the showreel): a few steps down the bay, a pause, a few more; a touch, a
       drag or a key inside the frame stops it and hands the walk to the visitor (checked 8 Oct: a synthetic W moves the
       walker, x 2.1 to 4.8 in two seconds) */
    const stroll = doc => {
      let quit = false
      const key = (type, code, k) => { try { doc.dispatchEvent(new KeyboardEvent(type, { key: k, code, bubbles: true, cancelable: true })) } catch {} }
      const stopWalk = e => { if (e && e.isTrusted === false) return; quit = true; key('keyup', 'KeyW', 'w'); strolls.forEach(clearTimeout) }
      for (const ev of ['pointerdown', 'keydown', 'wheel', 'touchstart']) doc.addEventListener(ev, stopWalk, { passive: true, capture: true })
      takers.push(() => { key('keyup', 'KeyW', 'w'); for (const ev of ['pointerdown', 'keydown', 'wheel', 'touchstart']) doc.removeEventListener(ev, stopWalk, { capture: true }) })
      const walk = (ms, after) => { if (quit) return; key('keydown', 'KeyW', 'w'); strolls.push(setTimeout(() => { key('keyup', 'KeyW', 'w'); if (after && !quit) strolls.push(setTimeout(after, 1600)) }, ms)) }
      strolls.push(setTimeout(() => walk(3000, () => walk(3000, () => walk(2400))), 1200))
    }
    const strolls = []
    drive()
    return () => {
      stop = true; clearTimeout(t); cancelAnimationFrame(raf); strolls.forEach(clearTimeout); takers.forEach(f => f())
      if (sysRef.current) { try { sysOff(f.contentWindow, sysRef.current) } catch {} sysRef.current = null; skin0.current = null; setSysReady(false) }
    }
  }, [go, active, mode, reel, dur, lift])
  /* the systems view: the lit discipline follows `sys`; it steps on its own (every few seconds, or the slide's time
     over the eight in the showreel) until touched; the camera turns slowly until the visitor takes it */
  const item = SYS_ITEMS[sys] || SYS_ITEMS[0]
  const [only, setOnly] = useState(true)   /* related parts only (Bazil), or every discipline colour coded: the two versions */
  useEffect(() => { if (mode === 'systems' && sysReady && frame.current) { try { sysLight(frame.current.contentWindow, item.lights, only) } catch {} } }, [item, sysReady, mode, only])
  useEffect(() => { const el = listRef.current && listRef.current.querySelector('li.on'); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' }) }, [sys])
  useEffect(() => {
    if (mode !== 'systems' || !active) return
    touched.current = false
    const every = reel ? Math.max(2600, ((dur || 44) - 2) / SYS_ITEMS.length * 1000) : 5000
    const t = setInterval(() => { if (reel || !touched.current) setSys(k => (k + 1) % SYS_ITEMS.length) }, every)
    return () => clearInterval(t)
  }, [mode, active, reel, dur])
  /* the camera turns slowly until the visitor takes it; every frame the eight labels' leaders follow their parts */
  useEffect(() => {
    if (mode !== 'systems' || !active || !sysReady) return
    let raf = 0, win = null; try { win = frame.current && frame.current.contentWindow } catch {}
    const onDown = () => { touched.current = true }
    try { win.document.addEventListener('pointerdown', onDown, { capture: true }) } catch {}
    const tick = () => {
      try {
        const a = win && win.__iaqAsm
        const st = sysRef.current, f = frame.current, box = labels.current
        if (a && st && f && box && a.camera) {
          const W = f.clientWidth, H = f.clientHeight, dx = f.offsetLeft, dy = f.offsetTop
          const pins = box.querySelectorAll('.pr-lb'), lines = box.querySelectorAll('line'), dots = box.querySelectorAll('circle')
          st.frame = (st.frame || 0) + 1
          if (st.hide) for (const [g] of st.hide) if (g.visible) g.visible = false
          /* the labels stack in the order their parts sit on screen, top to bottom, so no two leaders cross */
          if (st.frame === 1 || st.frame % 12 === 0) {
            const ys = CH.map((c, k) => { const an = st.anchors[c], q = an && project(a.camera, an.p, W, H); return [k, q ? q[1] : 1e9] })
            ys.sort((u, v) => u[1] - v[1]).forEach(([k], pos) => { if (pins[k]) pins[k].style.setProperty('--slot', pos) })
          }
          /* read every pin first, in the labels' own units (offsetLeft/Top: the portal's page zoom scales client rects but
             not these, nor the SVG they draw into), then write every line: no layout forced between writes */
          const m = []
          pins.forEach((pin, k) => {
            const c = CH[k], an = st.anchors[c]
            if (an && st.frame % 15 === 0) { const np = centreOf(an.obj); if (np) an.p = np }
            const pt = an && project(a.camera, an.p, W, H)
            m.push({ pt, x1: pin.offsetLeft + pin.offsetWidth, y1: pin.offsetTop + pin.offsetHeight / 2 })
          })
          m.forEach((q, k) => {
            const ln = lines[k], dot = dots[k]
            if (!q.pt || !isFinite(q.pt[0] + dx) || !isFinite(q.pt[1] + dy)) { ln.style.display = 'none'; dot.style.display = 'none'; return }
            const x = q.pt[0] + dx, y = q.pt[1] + dy
            ln.setAttribute('x1', q.x1); ln.setAttribute('y1', q.y1); ln.setAttribute('x2', x); ln.setAttribute('y2', y)
            dot.setAttribute('cx', x); dot.setAttribute('cy', y)
            ln.style.display = ''; dot.style.display = ''
          })
        }
      } catch {}
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); try { win.document.removeEventListener('pointerdown', onDown, { capture: true }) } catch {} }
  }, [mode, active, sysReady])
  /* the model should take the frame, not sit small in its landscape (Bazil: "zoom in ... take space at the screen"): the
     app's own camera is stepped in twice once it is ready; the Zoom buttons on the deck page step it from there */
  useEffect(() => {
    if (!ready) return
    const f = frame.current; let n = 0
    const t = setInterval(() => { let b = null; try { b = f && f.contentDocument && f.contentDocument.getElementById('zoom-in') } catch {}; if (b) { b.click(); n++ }; if (n >= 2 || !f) clearInterval(t) }, 500)
    return () => clearInterval(t)
  }, [ready])
  /* 8 Oct (Bazil: "presentation is lagging"): the app renders at up to 2x on a Retina screen (3840 px across for a 1920
     screen); 1.25x keeps it sharp at well under half the pixels. It sets its ratio once at start, so it is set again
     here once the app is up, and the resize that follows makes it take */
  useEffect(() => {
    if (!ready) return
    const f = frame.current; let n = 0
    const t = setInterval(() => {
      let w = null; try { w = f && f.contentWindow } catch {}
      const r = w && w.__iaqRenderer
      if (r && r.setPixelRatio) { r.setPixelRatio(Math.min(w.devicePixelRatio || 1, 1.25)); try { w.dispatchEvent(new Event('resize')) } catch {}; clearInterval(t) }
      if (++n > 40) clearInterval(t)
    }, 250)
    return () => clearInterval(t)
  }, [ready])
  /* while another slide is up the 3D stays loaded but draws nothing: its frame shrinks to a two-pixel sliver (the app
     sizes its canvas to its window), and comes back to full size the moment its tab returns */
  useEffect(() => { if (frame.current) { try { frame.current.contentWindow.dispatchEvent(new Event('resize')) } catch {} } }, [active])
  return (
    <div className={'pr-3d' + (ready ? ' ready' : '') + (mode === 'systems' ? ' is-sys' : '') + (active || !ready ? '' : ' asleep')}>
      {go && <iframe ref={frame} src="/3d/index.html" title="IAQ's facility in 3D" allow="fullscreen; pointer-lock" onLoad={() => setTimeout(() => setReady(true), 900)} />}
      {!ready && <div className="pr-3d-veil"><img src="/assets/iaq-logo.webp" alt="" /><span>Loading the facility</span></div>}
      <div className={'pr-3d-hand' + (veil ? ' on' : '')} aria-hidden="true" />
      {mode !== 'systems' && <p className="pr-3d-hint">{mode === 'walk' ? 'Inside the facility: drag to look, the keys to walk, the doors to change room.' : 'The facility builds itself. Scroll inside the frame to take over, drag to turn it.'}</p>}
      {mode === 'systems' && (
        <>
          {/* the eight disciplines, labelled on the left, each with a leader to its part in the model */}
          <div className="pr-labels" ref={labels} aria-hidden="true">
            <svg className="pr-leaders">{CH.map(c => <g key={c}><line className={item.lights.includes(c) ? 'on' : undefined} /><circle r="4" className={item.lights.includes(c) ? 'on' : undefined} /></g>)}</svg>
            {(() => { const cols = (sysRef.current && sysRef.current.colors) || {}; return CH.map((c, k) => <span key={c} className={'pr-lb' + (item.lights.includes(c) ? ' on' : '')} style={{ '--c': cols[c] || '#8A94A6' }}><i />{c}</span>) })()}
          </div>
          <div className="pr-sys" onPointerDownCapture={() => { touched.current = true }}>
            <header>
              <b>Three units, <em>one facility.</em></b>
              <span>What each unit delivers, part by part. Touch an item and its systems light in the model.</span>
              <div className="pr-sys-v" role="group" aria-label="View">
                <button type="button" className={only ? 'on' : undefined} onClick={() => setOnly(true)} aria-pressed={only}>Related parts only</button>
                <button type="button" className={!only ? 'on' : undefined} onClick={() => setOnly(false)} aria-pressed={!only}>Every system, colour coded</button>
              </div>
            </header>
            <div className="pr-sys-list" ref={listRef}>
              {SYS_UNITS.map(u => (
                <section key={u.id} className={'pr-sys-u u-' + u.id}>
                  <h4><i>Unit {u.no}</i><b>{u.name}</b><small>{u.full}</small></h4>
                  <ol>
                    {u.items.map(x => { const k = SYS_ITEMS.findIndex(y => y.k === x.k); return (
                      <li key={x.k} className={k === sys ? 'on' : undefined}>
                        <button type="button" onClick={() => setSys(k)} onMouseEnter={() => { touched.current = true; setSys(k) }} aria-pressed={k === sys}>
                          <span className="pr-sys-n">{x.name}</span><em>{x.work}</em>
                        </button>
                        {k === sys && <div className="pr-sys-d"><p>{x.line}</p><p className="pr-sys-s">{x.sys.join(', ')}.</p></div>}
                      </li>
                    ) })}
                  </ol>
                </section>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ---------- 3 · three units across the life of a facility ----------
   Redrawn for the screen (Bazil on the Codex slide in the deck: "this looks too ugly", "no curve corner"): one line of
   stages on one long red line (IAQ graphic rule), the three units as square blocks over the stages they carry, the
   service and what the client receives under each stage. Words are the Codex's (data/cycle.js, CodexSlides S2). */
const STAGES = [
  { n: 1, mk: 'des', stage: 'Plan and design', svc: 'Engineering design and consultation', you: 'Drawings, the BIM model and the permits' },
  { n: 2, mk: 'prc', stage: 'Procure', svc: 'Procurement', you: 'Equipment on site, on programme and on budget' },
  { n: 3, mk: 'con', stage: 'Build', svc: 'Construction', you: 'The facility, built to its class' },
  { n: 4, mk: 'com', stage: 'Commission and hand over', svc: 'Testing and commissioning', you: 'Proof it performs, and the certified documents' },
  { n: 5, mk: 'hok', stage: 'Tools move in', svc: 'Tools hookup', you: 'Tools connected, qualified and released to production' },
  { n: 6, mk: 'mnt', stage: 'Operate and maintain', svc: 'Maintenance', you: 'Uptime, compliance and a lower energy bill' },
]
export function UnitsSlide ({ reel = false }) {
  const [on, setOn] = useState(0)
  const touched = useRef(false)
  useEffect(() => { const t = setInterval(() => { if (reel || !touched.current) setOn(k => (k + 1) % STAGES.length) }, 2800); return () => clearInterval(t) }, [reel])
  const unitOf = k => (k < 4 ? 0 : k === 4 ? 1 : 2)
  const unitOn = unitOf(on)
  return (
    <Frame title={<>Three units, across the life of <em>your facility.</em></>} sub="Read it as the owner does: left to right, from the first drawing to a plant in operation, and round again at the next expansion." foot="Three units across the life of a facility" cls="pr-fr-units">
      <div className="pr-un" onPointerDown={() => { touched.current = true }}>
        <div className="pr-un-units">
          <div className={'pr-un-u' + (unitOn === 0 ? ' on' : '')} style={{ gridColumn: '1 / 5' }} onMouseEnter={() => { touched.current = true; setOn(0) }}>
            <small>Business unit 1</small><b>EPC</b><span>Builds the facility.</span>
            <em><i>EPCC: IAQ delivers</i><i>EPCM: IAQ manages</i></em>
          </div>
          <div className={'pr-un-u' + (unitOn === 1 ? ' on' : '')} onMouseEnter={() => { touched.current = true; setOn(4) }}>
            <small>Business unit 2</small><b>PCU &amp; TTI</b><span>Process Critical Utilities &amp; Total Tool Installation.</span><p>Can also sit inside the same EPC contract.</p>
          </div>
          <div className={'pr-un-u' + (unitOn === 2 ? ' on' : '')} onMouseEnter={() => { touched.current = true; setOn(5) }}>
            <small>Business unit 3</small><b>EFM</b><span>Runs and maintains it.</span>
          </div>
        </div>
        <ol className="pr-un-stages">
          {STAGES.map((x, k) => (
            <li key={x.n} className={k === on ? 'on' : undefined} onMouseEnter={() => { touched.current = true; setOn(k) }}>
              <span className="pr-un-mk" aria-hidden="true" dangerouslySetInnerHTML={{ __html: CYCLE_SVG[x.mk] }} />
              <b>{x.stage}</b>
              <small>The service</small><strong>{x.svc}</strong>
              <small>You receive</small><span>{x.you}</span>
            </li>
          ))}
        </ol>
        <p className="pr-un-round"><em>And round again.</em> New tools, a new line or an energy upgrade start the next design. The same three units carry it.</p>
      </div>
    </Frame>
  )
}

/* ---------- 4 · the six services as one cycle ----------
   Bazil: "check the website how we represent": the Services page's own serpentine (CycleFlow.jsx, the six stages left to
   right, the U-turn, the red return from Hookup into the next Design), stepping every three seconds until touched,
   the stage in hand named large beneath it. */
export function RingSlide ({ reel = false }) {
  const [i, setI] = useState(0)
  const touched = useRef(false)
  useEffect(() => { const t = setInterval(() => { if (reel || !touched.current) setI(x => (x + 1) % CYCLE.length) }, 3000); return () => clearInterval(t) }, [reel])
  const pick = k => { touched.current = true; setI(k) }
  const c = CYCLE[i]
  return (
    <Frame title={<>Six services, <em>one cycle.</em></>} sub="Design, procurement, construction, commissioning, maintenance and tools hookup, run as one cycle by one team. Touch a stage." foot="The services, as one cycle" cls="pr-fr-ring">
      <div className="pr-cyc" onClickCapture={e => { const a = e.target && e.target.closest && e.target.closest('a'); if (a) e.preventDefault() }}>
        <div className="pr-cyc-f"><Fit w={1500}><div className="cyb"><CycleFlow stages={CYCLE} active={i} onStage={pick} /></div></Fit></div>
        <div className="pr-cyc-now" key={c.id}><b>{c.name}</b><p>{c.kick}</p></div>
      </div>
    </Frame>
  )
}

/* ---------- 5 · the same, on one chart ---------- */
export function ChartSlide () {
  return (
    <Frame title={<>Three units, six services, <em>on one chart.</em></>} sub="Which unit carries which service, the work each one does, and where that work sits in the fab. Hover a unit." foot="The same, on one chart" cls="pr-fr-chart">
      <div className="pr-chart"><Fit w={1360}><SystemMap embed /></Fit></div>
    </Frame>
  )
}

/* ---------- 6 · scan: the website and the one-page prospect form ----------
   Bazil: "have a tab for qr code, for website, qr code for the form, put temporary". Codes from data/deckQr.js
   (tools/deck-qr-1007.py); the form is pages/Prospect.jsx at /prospect. */
export function QrSlide () {
  const codes = [DECK_QR.site, DECK_QR.form]
  return (
    <Frame title={<>Scan, <em>and take IAQ with you.</em></>} foot="Scan" cls="pr-fr-qr">
      <div className="pr-qr">
        <div className="pr-qr-c">
          <svg viewBox={codes[0].viewBox} shapeRendering="crispEdges" role="img" aria-label={codes[0].label + ', ' + codes[0].show}><path d={codes[0].path} fill="#0C1220" /></svg>
          <b>The website</b><span>{codes[0].show}</span>
        </div>
        <div className="pr-qr-c">
          <svg viewBox={codes[1].viewBox} shapeRendering="crispEdges" role="img" aria-label={codes[1].label + ', ' + codes[1].show}><path d={codes[1].path} fill="#0C1220" /></svg>
          <b>Leave your details</b><span>{codes[1].show}</span>
        </div>
      </div>
    </Frame>
  )
}

/* ---------- 7 · the invitation: SEMICON Europa 2026 ----------
   Bazil, with IAQ's pre-event poster ("Visit us", the cleanroom, the dates, the three offerings, "Visit us at Booth No.
   C1 128"): "can you build this one better and do it better but make it lively", then (8 Oct) "refine and fix it to be a
   proper presentation". Second cut: the words on a white block (IAQ's rule: type on a photo only on a block), IAQ's
   own cleanroom and hook-up footage beside it, dissolving clip to clip with a slow push in; the three offerings take
   turns; the one long red line under the facts. Dates are the booth data's (10 to 13 November 2026, checked against
   messe-muenchen.de on 22 Sep); the poster's "2027" and "10 - 14" are flagged in the handover. */
const VISIT_REEL = ['/assets/videos/cr-corridor-hf.mp4', '/assets/videos/hookup-team-rep.mp4', '/assets/videos/cr-bay-hf.mp4']
const OFFERS = ['Engineering, Procurement and Construction', 'Process Critical Utilities Solutions', 'Total Tools Installation Solutions']
export function VisitSlide ({ active = true }) {
  const v0 = useRef(null), v1 = useRef(null)
  const [k, setK] = useState(0)
  useEffect(() => { const t = setInterval(() => setK(x => (x + 1) % OFFERS.length), 2800); return () => clearInterval(t) }, [])
  /* two players, a dissolve every six seconds, round and round */
  useEffect(() => {
    if (!active) return
    const vids = [v0.current, v1.current]; if (!vids[0] || !vids[1]) return
    let cur = 0, idx = 0, dead = false, t1 = 0, t2 = 0
    const play = v => { const p = v.play(); if (p && p.catch) p.catch(() => {}) }
    const load = (v, n) => { if (v.getAttribute('src') !== VISIT_REEL[n]) { v.setAttribute('src', VISIT_REEL[n]); v.load() } }
    vids.forEach(v => { v.muted = true; v.loop = true; v.playsInline = true })
    load(vids[0], 0); play(vids[0]); vids[0].classList.add('on'); load(vids[1], 1)
    const next = () => {
      if (dead) return
      const out = vids[cur], nxt = vids[1 - cur]
      idx = (idx + 1) % VISIT_REEL.length; load(nxt, idx)
      try { nxt.currentTime = 0 } catch {}
      play(nxt); nxt.style.zIndex = 2; out.style.zIndex = 1; nxt.classList.add('on')
      t2 = setTimeout(() => { if (dead) return; out.classList.remove('on'); out.pause(); cur = 1 - cur; load(vids[1 - cur], (idx + 1) % VISIT_REEL.length) }, 1300)
      t1 = setTimeout(next, 6000)
    }
    t1 = setTimeout(next, 6000)
    return () => { dead = true; clearTimeout(t1); clearTimeout(t2); vids.forEach(v => { v.pause(); v.classList.remove('on') }) }
  }, [active])
  return (
    <div className="pr-visit">
      <div className="pr-visit-v" aria-hidden="true"><video ref={v0} muted playsInline preload="auto" poster="/assets/iaq/cr-corridor-8588.webp" /><video ref={v1} muted playsInline preload="auto" /></div>
      <div className="pr-visit-cap"><b>Discover new business opportunities.</b><span>Cleanrooms, process utilities and tool hook-up, delivered by one team.</span></div>
      <div className="pr-visit-p">
        <img className="pr-visit-logo" src="/assets/iaq-logo.webp" alt="IAQ" />
        <div className="pr-visit-in">
          <h3>Meet IAQ at <em>SEMICON Europa 2026.</em></h3>
          <ul className="pr-visit-facts">
            <li><Icon name="calendar" /><span><b>10 to 13 November 2026</b></span></li>
            <li><Icon name="pin" /><span><b>Messe München, Munich</b>Co-located with electronica</span></li>
          </ul>
          <ul className="pr-visit-offers" aria-label="What IAQ brings">
            {OFFERS.map((o, n) => <li key={o} className={n === k ? 'on' : undefined}>{o}</li>)}
          </ul>
        </div>
        <div className="pr-visit-booth"><span>Visit us at booth</span><b>C1 128</b></div>
        <p className="pr-visit-url">iaqtechnology.com.my</p>
      </div>
    </div>
  )
}
