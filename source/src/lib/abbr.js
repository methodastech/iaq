import { createElement, useLayoutEffect } from 'react'

/* ============================================================================
   abbr.js · every short form, with its meaning in brackets (18 Sep 2026, Bazil, pointing at "CSA" on the
   Codex cover: "meaning, everything need to put bracket").

   expandAbbr(root) walks the text of a STATIC block and, at the first appearance of each short form in that
   block, adds its meaning in brackets right after it: "CSA (Civil, Structural and Architectural)". Later
   appearances in the same block stay short, so a picture never repeats the same bracket. It skips titles,
   pills, chips, drawings (svg) and anything marked data-noab, so the layout of a label never bloats.
   Only for blocks whose text never changes after mount: the slides and the Codex's fixed sections. Live text
   (the relationship map, the fab story) carries its brackets in its own data.
   ============================================================================ */
export const ABBR = {
  'PCU & TTI': 'Process Critical Utilities & Total Tool Installation',
  EPCC: 'Engineering, Procurement, Construction and Commissioning',
  EPCM: 'Engineering, Procurement and Construction Management',
  EPC: 'Engineering, Procurement and Construction',
  EFM: 'Energy Facility Management',
  PCU: 'Process Critical Utilities',
  TTI: 'Total Tool Installation',
  CSA: 'Civil, Structural and Architectural',
  MEP: 'Mechanical, Electrical and Plumbing',
  'M&E': 'mechanical and electrical',
  ESCO: 'Energy Service Company',
  BIM: 'Building Information Modelling',
  PCW: 'process cooling water',
  CDA: 'clean dry air',
  UPW: 'ultrapure water',
  PV: 'process vacuum',
  HVAC: 'heating, ventilation and air conditioning',
  ACMV: 'air conditioning and mechanical ventilation',
  FFU: 'fan filter unit',
  FFUs: 'fan filter units',
  VMB: 'valve manifold box',
  SLA: 'service level agreement',
  'T&C': 'testing and commissioning',
  ATF: 'Advanced Technology Facilities',
  OEM: 'original equipment maker',
}
const KEYS = Object.keys(ABBR).sort((a, b) => b.length - a.length)
const esc = s => s.replace(/[.*+?^${}()|[\]\\&]/g, m => (m === '&' ? '&' : '\\' + m))
const RX = new RegExp('(?<![A-Za-z0-9])(' + KEYS.map(esc).join('|') + ')(?![A-Za-z0-9])', 'g')
/* live pieces (.fs the fab story, .rx the relationship map) and slides inside a page (.cxs, which expand themselves) are
   skipped when a page section is expanded; a block is never skipped by its own root */
const SKIP = 'svg, h1, h2, h3, [data-noab], .ab-x, abbr, input, textarea, button, .cxs, .fs, .rx, .sm3, .wt, .cxs-pill, .cxs-chip, .cxs-key, .cxs-f, .fs-chips, .nm-rows, code'

/* how far every element of a fixed frame already spills past its own box */
function spillAll(els) { return els.map(e => (e.scrollHeight - e.clientHeight) * 1e4 + (e.scrollWidth - e.clientWidth)) }
const FLEXY = /^(inline-)?(flex|grid)$/

/* fit: the block is a fixed frame (a 16:9 slide). A bracket then goes inline only where it is body sized and
   pushes nothing past its box; anything else is listed on the block's short forms line instead. */
export function expandAbbr(root, { fit = false } = {}) {
  if (!root || root.dataset.ab === '1') return
  root.dataset.ab = '1'
  const seen = new Set()
  const maxFs = fit ? root.clientWidth * 0.0165 : 21
  /* a fixed frame measures with its short forms line already holding two lines of room */
  const slot0 = fit && root.querySelector('[data-abslot]')
  if (slot0) { slot0.textContent = '\u00a0'; slot0.style.minHeight = '2.7em' }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: n => {
      if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT
      const hit = n.parentElement && n.parentElement.closest(SKIP)
      return hit && hit !== root && root.contains(hit) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    },
  })
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  const els = fit ? [...root.querySelectorAll('*')].filter(e => !(e instanceof SVGElement)) : null
  for (let node of nodes) {
    const host = node.parentElement
    if (!host) continue
    const cs = getComputedStyle(host)
    /* display text stays short (its short form goes on the short forms line); a bracket dropped into a flex or grid
       row would become a column of its own, so those hosts are left alone too */
    if (parseFloat(cs.fontSize) > maxFs || FLEXY.test(cs.display)) continue
    /* the card this text sits in, for "is the meaning already here" */
    const up = host.parentElement, card = up && up.parentElement && up.parentElement !== root && up.parentElement.textContent.length < 400 ? up.parentElement : (up || host)
    const near = card.textContent.toLowerCase()
    RX.lastIndex = 0
    let m
    while ((m = RX.exec(node.nodeValue))) {
      const k = m[1]
      if (seen.has(k)) continue
      /* the meaning is already beside it, as in "Process cooling water (PCW)" or "EPC (Engineering...)" */
      if (near.includes(ABBR[k].toLowerCase())) { seen.add(k); continue }
      const before = fit ? spillAll(els) : null
      const after = node.splitText(m.index + k.length)
      const sp = document.createElement('span'); sp.className = 'ab-x'; sp.textContent = ' (' + ABBR[k] + ')'
      host.insertBefore(sp, after)
      if (fit && spillAll(els).some((v, i) => v > before[i] + 1)) {
        /* it would push the frame: undo, and let a later, roomier appearance or the short forms line carry it */
        sp.remove(); node.nodeValue += after.nodeValue; after.remove()
        RX.lastIndex = m.index + k.length
        continue
      }
      seen.add(k)
      node = after; RX.lastIndex = 0
    }
  }
  /* short forms that only appear where a bracket would bloat the label (a pill, a chip, a title, a drawing) and
     whose meaning the block never states get one line, "Short forms: EPCC (...) · EPCM (...)", in the block's
     [data-abslot] (the slide footer) or at its end. Blocks nested inside (slides, live pieces) answer for themselves. */
  const own = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: n => {
      const hit = n.parentElement && n.parentElement.closest('.cxs, .fs, .rx, .wt, .ab-gl, .sm3-lb, [role=dialog]')
      return hit && hit !== root && root.contains(hit) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    },
  })
  let text = ''
  while (own.nextNode()) text += own.currentNode.nodeValue + ' '
  const low = text.toLowerCase(), left = []
  RX.lastIndex = 0
  let m
  while ((m = RX.exec(text))) { const k = m[1]; if (!left.includes(k) && !low.includes(ABBR[k].toLowerCase())) left.push(k) }
  if (slot0) { slot0.style.minHeight = ''; slot0.textContent = '' }
  if (!left.length) return
  let slot = root.querySelector('[data-abslot]')
  if (!slot) { slot = document.createElement('p'); root.appendChild(slot) }
  slot.classList.add('ab-gl')
  slot.textContent = 'Short forms: ' + left.map(k => k + ' (' + ABBR[k] + ')').join(' · ')
}

/* expand once, after the block has painted its text */
export function useAbbr(ref, deps = [], opts) {
  useLayoutEffect(() => { expandAbbr(ref.current, opts) }, deps)
}

/* the same rule for LIVE text, as React nodes (never a DOM edit under React): the first appearance of each
   short form across the strings that share one `seen` set gets its meaning in brackets */
export function abbrNodes(str, seen = new Set()) {
  const out = []
  let last = 0, m
  RX.lastIndex = 0
  while ((m = RX.exec(str))) {
    const k = m[1]
    if (seen.has(k)) continue
    seen.add(k)
    const around = str.slice(Math.max(0, m.index - 60), m.index + k.length + 60).toLowerCase()
    if (around.includes(ABBR[k].toLowerCase())) continue
    out.push(str.slice(last, m.index + k.length), createElement('span', { className: 'ab-x', key: m.index }, ' (' + ABBR[k] + ')'))
    last = m.index + k.length
  }
  out.push(str.slice(last))
  return out
}
