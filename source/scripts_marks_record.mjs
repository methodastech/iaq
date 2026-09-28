/* IAQ RECORD marks (23 Sep 2026). Bazil, on the six marks beside the record numbers: "make the fonts smaller and the
   icon more detailed and not flat."

   Same machinery as the market marks in scripts_marks_tonal.mjs, in the graphite the record band uses, with the IAQ
   red kept for the one part of each mark that carries the fact. Five values, three line weights, stacked bands with a
   seam down the front edge, a dotted ground, and one red part that lifts on the section's slow loop.

   node scripts_marks_record.mjs --svg <dir>    one SVG per mark, for review
   node scripts_marks_record.mjs --react        src/components/RecordMarks.jsx

   (header kept from the market set:)
   Bazil, with a sheet of blue isometric icons: "like this, this one blue but shades of blue, so you need to do red but
   shades of red, and thickness etc." Then, in the same breath: "but IAQ is much more better."
   So the value ladder and the two line weights come from that sheet, and the DETAILING comes from the IAQ mark.

   THE SYSTEM
     · one hue, five values: a pale top face, a light-mid left face, the brand red on the right face, a deep red for
       the outline, and the brand red solid on the one part that matters
     · the IAQ mark's own grammar kept: every volume is STACKED BANDS with the ground showing through the gaps, and a
       seam down the front edge, which is the detailing Bazil picked out of the logo
     · three line weights: 1.9 on the silhouette, 1.45 on secondary structure (legs, tubes, pipes), 1.05 on detail,
       so the object reads first, then how it is built, then what it is made of
     · a dotted shadow under each object, in the palest value, which seats it without introducing a grey
     · the subjects are the equipment IAQ works on: a process tool, an open rack, a battery pack, a tracker, a chiller
       skid, a bioreactor, a filling line
     · one small part of each is solid, and that part is the one that moves (.mk-mv)

   node scripts_marks_tonal.mjs --svg <dir>    one SVG per mark, for review
   node scripts_marks_tonal.mjs --react        src/components/TonalMarks.jsx  */
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

const C = {
  top: '#EEF1F6', lft: '#C6CDD9', mid: '#9AA4B4', rgt: '#6E798C', deep: '#414B5E',
  ink: '#2C3442', dot: '#D8DEE8', sig: '#EC2027', sigD: '#B5121B', white: '#FFFFFF',
}
const n = v => (Math.round(v * 100) / 100).toString()
const poly = pts => 'M' + pts.map(p => n(p[0]) + ' ' + n(p[1])).join('L') + 'Z'
const line = (p, q) => 'M' + n(p[0]) + ' ' + n(p[1]) + 'L' + n(q[0]) + ' ' + n(q[1])
const down = (p, t) => [p[0], p[1] + t]
const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]
const W1 = 1.9, W2 = 1.05, W3 = 1.45
const OUT = (d, w = W1, col = C.ink) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`
const fill = (d, col) => `<path d="${d}" fill="${col}"/>`

/* the same 2:1 dimetric plan the rest of the system uses */
function plan (cx, cy, A, B) {
  return {
    T: [cx + (-A + B), cy - (A + B) / 2], R: [cx + (A + B), cy + (A - B) / 2],
    F: [cx + (A - B), cy + (A + B) / 2], L: [cx + (-A - B), cy + (-A + B) / 2], cx, cy, A, B,
  }
}
/* ONE BAND of a box, split by the seam at the front edge: right face brand red, left face light-mid */
function band (r, y0, y1, { seam = 1.8, rgt = C.rgt, lft = C.lft } = {}) {
  const s = seam / 2
  const Fr = [r.F[0] + s, r.F[1] + s / 2], Fl = [r.F[0] - s, r.F[1] + s / 2]
  return [
    fill(poly([down(r.R, y0), down(Fr, y0), down(Fr, y1), down(r.R, y1)]), rgt),
    fill(poly([down(Fl, y0), down(r.L, y0), down(r.L, y1), down(Fl, y1)]), lft),
  ]
}
/* a banded box: the volume in slices, the silhouette thick, the top pale. The whole body is filled in the palest
   value FIRST, so the slices read as pale seams on any background, dark hero included, rather than as holes. */
function box (r, h, { bands = 3, gap = 2.2, top = C.top, rgt = C.rgt, lft = C.lft, cap = true } = {}) {
  const O = [fill(poly([r.T, r.R, down(r.R, h), down(r.F, h), down(r.L, h), r.L]), C.top)]
  const step = (h + gap) / bands
  for (let i = 0; i < bands; i++) {
    const y0 = i * step, y1 = Math.min(h, y0 + step - gap)
    if (y1 > y0) O.push(`<g class="mk-bd" style="--i:${bands - i}">`, ...band(r, y0, y1, { rgt, lft }), '</g>')
  }
  if (cap) O.push(fill(poly([r.T, r.R, r.F, r.L]), top))
  O.push(OUT(poly([r.T, r.R, down(r.R, h), down(r.F, h), down(r.L, h), r.L])))
  if (cap) { O.push(OUT(line(r.L, r.F), W2)); O.push(OUT(line(r.F, r.R), W2)) }
  O.push(OUT(line(r.F, down(r.F, h)), W2))
  return O
}
/* a banded cylinder: rings with the ground between them, pale lid, thick silhouette */
function cyl (cx, cy, rr, h, { bands = 3, gap = 2.2, top = C.top, body = C.rgt } = {}) {
  const rx = rr * 1.414, ry = rr * 0.707
  const O = [`<path d="M${n(cx - rx)} ${n(cy)}V${n(cy + h)}A${n(rx)} ${n(ry)} 0 0 0 ${n(cx + rx)} ${n(cy + h)}V${n(cy)}Z" fill="${C.top}"/>`]
  const step = (h + gap) / bands
  for (let i = 0; i < bands; i++) {
    const y0 = i * step, y1 = Math.min(h, y0 + step - gap)
    if (y1 <= y0) continue
    O.push(`<g class="mk-bd" style="--i:${bands - i}">`)
    O.push(`<path d="M${n(cx - rx)} ${n(cy + y0)}A${n(rx)} ${n(ry)} 0 0 0 ${n(cx + rx)} ${n(cy + y0)}V${n(cy + y1)}A${n(rx)} ${n(ry)} 0 0 1 ${n(cx - rx)} ${n(cy + y1)}Z" fill="${body}"/>`)
    O.push(`<path d="M${n(cx - rx)} ${n(cy + y0)}A${n(rx)} ${n(ry)} 0 0 0 ${n(cx)} ${n(cy + y0 + ry)}V${n(cy + y1 + ry)}A${n(rx)} ${n(ry)} 0 0 1 ${n(cx - rx)} ${n(cy + y1)}Z" fill="${C.lft}"/>`)
    O.push('</g>')
  }
  O.push(`<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${top}"/>`)
  O.push(OUT(`M${n(cx - rx)} ${n(cy)}V${n(cy + h)}A${n(rx)} ${n(ry)} 0 0 0 ${n(cx + rx)} ${n(cy + h)}V${n(cy)}`))
  O.push(`<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="none" stroke="${C.ink}" stroke-width="${W1}"/>`)
  return O
}
/* the dotted shadow: the palest value, laid in plan so it reads as ground, densest under the object.
   Tagged .mk-gd so a dark surface can drop it, where pale dots would read as dust. */
function dots (cx, cy, A, B) {
  const O = ['<g class="mk-gd">']
  for (let i = 0; i <= 6; i++) for (let j = 0; j <= 6; j++) {
    const u = -A + (2 * A) * i / 6, v = -B + (2 * B) * j / 6
    const d = Math.abs(u) / A + Math.abs(v) / B
    if (d > 1.02) continue
    O.push(`<circle cx="${n(cx + (u - v))}" cy="${n(cy + (u + v) / 2)}" r="${d > .55 ? .85 : 1.15}" fill="${C.dot}"/>`)
  }
  O.push('</g>')
  return O
}
/* a pipe with a flange at each end, drawn at the secondary weight so it never competes with the vessel it serves */
const pipeRun = (a, b, w = W3) => [OUT(line(a, b), w, C.deep), OUT(line([a[0] - 1.8, a[1] - .9], [a[0] + 1.8, a[1] + .9]), W2), OUT(line([b[0] - 1.8, b[1] - .9], [b[0] + 1.8, b[1] + .9]), W2)]
/* a handwheel valve: the wheel in plan with its spokes and the stem, which is what a valve actually looks like */
const valve = (x, y, r = 2.6) => [
  `<ellipse cx="${n(x)}" cy="${n(y - 3.2)}" rx="${n(r)}" ry="${n(r * .5)}" fill="${C.top}" stroke="${C.ink}" stroke-width="${W2}"/>`,
  OUT(line([x - r, y - 3.2], [x + r, y - 3.2]), W2), OUT(line([x, y - 3.2 - r * .5], [x, y - 3.2 + r * .5]), W2),
  OUT(line([x, y - 3.2], [x, y]), W2),
]
/* a base plate: what a pump, a post or a leg actually stands on */
const foot = (x, y, w = 5) => `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(w)}" ry="${n(w * .5)}" fill="${C.lft}" stroke="${C.ink}" stroke-width="${W2}"/>`
/* louvre or vent ticks on a face */
const ticks = (a, b, k = 3) => { const O = []; for (let i = 1; i <= k; i++) { const p = lerp(a, b, i / (k + 1)); O.push(OUT(line(p, down(p, 2.2)), W2)) } return O }
const dot = (x, y, r = 1.1, col = C.deep) => `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${col}"/>`
const ladder = (x, y, h, w = 4.4) => {
  const O = [OUT(line([x - w / 2, y], [x - w / 2, y - h]), W2), OUT(line([x + w / 2, y], [x + w / 2, y - h]), W2)]
  for (let i = 1; i * 4 < h; i++) O.push(OUT(line([x - w / 2, y - i * 4], [x + w / 2, y - i * 4]), W2))
  return O
}
/* a cell grid on a flat panel quad, which is what turns a rectangle into a module */
const grid = (a, b, c, d, nx, ny) => {
  const O = []
  for (let i = 1; i < nx; i++) O.push(OUT(line(lerp(a, b, i / nx), lerp(d, c, i / nx)), W2))
  for (let j = 1; j < ny; j++) O.push(OUT(line(lerp(a, d, j / ny), lerp(b, c, j / ny)), W2))
  return O
}
const solid = d => `<path d="${d}" fill="${C.sig}" stroke="${C.sigD}" stroke-width="${W2}" stroke-linejoin="round"/>`
const solidEl = (cx, cy, rx, ry) => `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${C.sig}" stroke="${C.sigD}" stroke-width="${W2}"/>`

export const RECORD_MARKS = [
  {
    slot: 'yrs', title: 'Years building hi-tech facilities',
    /* a desk calendar: the pages in bands with their edge lines, the binding rings, the date panel, and the header,
       which is the red part and the part that lifts */
    body: () => {
      const O = [...dots(46, 72, 24, 14), '<g class="mk-ob">']
      const pages = plan(46, 42, 15, 12)
      O.push(...box(pages, 12, { bands: 3, gap: 2.2 }))
      const head = plan(46, 38, 15, 12)
      O.push('<g class="mk-mv">', ...box(head, 4, { bands: 1, top: '#F2595F', lft: '#C7161D', rgt: C.sig }), '</g>')
      const panel = plan(46, 37.4, 7.5, 6)
      O.push(`<path d="${poly([panel.T, panel.R, panel.F, panel.L])}" fill="${C.white}" opacity=".92"/>`)
      O.push(OUT(poly([panel.T, panel.R, panel.F, panel.L]), W2, C.sigD))
      for (const x of [39, 53]) {
        O.push(OUT(`M${x - 2.6} 33.4A2.6 2.6 0 0 1 ${x + 2.6} 33.4`, W2))
        O.push(OUT(line([x - 2.6, 33.4], [x - 2.6, 35.4]), W2), OUT(line([x + 2.6, 33.4], [x + 2.6, 35.4]), W2))
      }
      const a = lerp(pages.L, pages.F, .62), b = lerp(pages.F, pages.R, .38)
      for (const y of [5.5, 8.5]) O.push(OUT(line(down(a, y), down(b, y)), W2))
      O.push('</g>')
      return O
    },
  },
  {
    slot: 'ctr', title: 'Countries with an IAQ office',
    /* the globe: the lit limb, meridians and parallels, two land masses, and the office pin,
       which is the red part and the part that lifts */
    body: () => {
      const O = [...dots(46, 76, 22, 13), '<g class="mk-ob">']
      const cx = 46, cy = 42, R = 19
      O.push(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="${C.lft}" stroke="${C.ink}" stroke-width="${W1}"/>`)
      O.push(`<path d="M${cx} ${cy - R}A${R} ${R} 0 0 0 ${cx} ${cy + R}A${n(R * .52)} ${R} 0 0 1 ${cx} ${cy - R}Z" fill="${C.top}"/>`)
      for (const k of [.34, .68]) O.push(`<ellipse cx="${cx}" cy="${cy}" rx="${n(R * k)}" ry="${R}" fill="none" stroke="${C.ink}" stroke-width="${W2}"/>`)
      O.push(OUT(line([cx, cy - R], [cx, cy + R]), W2))
      for (const dy of [-9, 0, 9]) {
        const rx = Math.sqrt(Math.max(R * R - dy * dy, 1))
        O.push(OUT(`M${n(cx - rx)} ${n(cy + dy)}H${n(cx + rx)}`, W2))
      }
      O.push(`<path d="M32 36q5-4 9 0t8-1q3 4-2 6t-11 1q-5-2-4-6Z" fill="${C.mid}" opacity=".9"/>`)
      O.push(`<path d="M50 50q6-3 9 1t-2 6q-6 2-8-2t1-5Z" fill="${C.mid}" opacity=".9"/>`)
      O.push(`<g class="mk-mv"><path d="M60 16a6 6 0 0 1 6 6c0 4.4-6 10-6 10s-6-5.6-6-10a6 6 0 0 1 6-6Z" fill="${C.sig}" stroke="${C.sigD}" stroke-width="${W2}" stroke-linejoin="round"/><circle cx="60" cy="22" r="2.1" fill="${C.white}"/></g>`)
      O.push('</g>')
      return O
    },
  },
  {
    slot: 'iso', title: 'ISO certifications, held and audited',
    /* three certificates in banded plates with their edges, and the seal with its ribbon,
       which is the red part and the part that lifts */
    body: () => {
      const O = [...dots(46, 74, 24, 14), '<g class="mk-ob">']
      for (let i = 0; i < 3; i++) {
        const r = plan(46, 46 - i * 9, 15, 11)
        O.push(...box(r, 5, { bands: 1, rgt: i === 0 ? C.rgt : C.mid }))
        const a = lerp(r.L, r.F, .35), b = lerp(r.F, r.R, .65)
        O.push(OUT(line(down(a, 2.4), down(b, 2.4)), W2))
      }
      const top = plan(46, 28, 15, 11)
      for (const k of [.3, .5, .7]) O.push(OUT(line(lerp(top.T, top.L, k), lerp(top.R, top.F, k)), W2))
      O.push(`<g class="mk-mv"><g transform="translate(62 44)">` +
        `<path d="M0 -8.4L2.2 -6.6L5 -7L5.2 -4.1L7.6 -2.6L6.2 0L7.6 2.6L5.2 4.1L5 7L2.2 6.6L0 8.4L-2.2 6.6L-5 7L-5.2 4.1L-7.6 2.6L-6.2 0L-7.6 -2.6L-5.2 -4.1L-5 -7L-2.2 -6.6Z" fill="${C.sig}" stroke="${C.sigD}" stroke-width="${W2}" stroke-linejoin="round"/>` +
        `<circle r="3.1" fill="none" stroke="${C.white}" stroke-width="${W2}"/>` +
        `<path d="M-3.4 7.6L-4.6 14.4L-1 12.6L1.6 15.2L2.6 7.8" fill="${C.sigD}" stroke="${C.sigD}" stroke-width="${W2}" stroke-linejoin="round"/></g></g>`)
      O.push('</g>')
      return O
    },
  },
  {
    slot: 'ind', title: 'Industries served',
    /* the dial: a banded disc cut into seven, the hub, and the one sector that is ours,
       which is the red part and the part that lifts */
    body: () => {
      const O = [...dots(46, 74, 24, 14), '<g class="mk-ob">']
      const cx = 46, cy = 38, rr = 16, rx = rr * 1.414, ry = rr * .707
      O.push(...cyl(cx, cy, rr, 9, { bands: 2, gap: 1.8, body: C.rgt }))
      const P = t => [cx + rx * Math.cos(t), cy + ry * Math.sin(t)]
      for (let i = 0; i < 7; i++) {
        const t = (i / 7) * Math.PI * 2
        O.push(OUT(line([cx, cy], P(t)), W2))
      }
      const t0 = 0, t1 = (1 / 7) * Math.PI * 2
      const A = P(t0), B = P(t1)
      O.push(`<g class="mk-mv"><path d="M${n(cx)} ${n(cy)}L${n(A[0])} ${n(A[1])}A${n(rx)} ${n(ry)} 0 0 1 ${n(B[0])} ${n(B[1])}Z" fill="${C.sig}" stroke="${C.sigD}" stroke-width="${W2}" stroke-linejoin="round"/></g>`)
      O.push(`<circle cx="${cx}" cy="${cy}" r="2.6" fill="${C.top}" stroke="${C.ink}" stroke-width="${W2}"/>`)
      O.push('</g>')
      return O
    },
  },
  {
    slot: 'prj', title: 'Projects completed',
    /* the drawings: two banded plates with their sheet lines and a rolled set standing beside them, and the sign-off
       tick, which is the red part and the part that lifts */
    body: () => {
      const O = [...dots(44, 74, 25, 14), '<g class="mk-ob">']
      const low = plan(42, 50, 16, 12)
      O.push(...box(low, 5, { bands: 1, rgt: C.mid }))
      const top = plan(42, 42, 16, 12)
      O.push(...box(top, 5, { bands: 1 }))
      for (const k of [.3, .5, .7]) O.push(OUT(line(lerp(top.T, top.L, k), lerp(top.R, top.F, k)), W2))
      O.push(...cyl(72, 30, 2.8, 20, { bands: 4, gap: 1.5, body: C.rgt }))
      O.push(OUT(`M69.2 30A2.8 1.4 0 0 0 74.8 30`, W2))
      O.push(`<g class="mk-mv"><path d="M30 36.5L37 41.5L49.5 29.5L53 32.2L37.6 46.5L27 39.2Z" fill="${C.sig}" stroke="${C.sigD}" stroke-width="${W2}" stroke-linejoin="round"/></g>`)
      O.push('</g>')
      return O
    },
  },
  {
    slot: 'cln', title: 'Square metres of cleanroom built',
    /* the cleanroom floor: a banded slab with its raised-floor grid, the air handler standing on it, and the
       dimension run along the near edge, which is the red part and the part that lifts */
    body: () => {
      const O = [...dots(46, 74, 26, 15), '<g class="mk-ob">']
      const slab = plan(46, 44, 21, 17)
      O.push(...box(slab, 6, { bands: 1 }))
      O.push(...grid(slab.T, slab.R, slab.F, slab.L, 4, 4))
      const ahu = plan(52, 33, 7, 5.5)
      O.push(...box(ahu, 9, { bands: 2, gap: 1.6, rgt: C.mid }))
      O.push(...ticks(down(ahu.F, 2), down(ahu.R, 2), 2))
      const a = [slab.L[0] - 3, slab.L[1] + 7.5], b = [slab.F[0] - 3, slab.F[1] + 7.5]
      O.push(`<g class="mk-mv"><path d="M${n(a[0])} ${n(a[1])}L${n(b[0])} ${n(b[1])}" stroke="${C.sig}" stroke-width="2.4" stroke-linecap="round"/>` +
        `<path d="M${n(a[0])} ${n(a[1])}l4.6 -.6l-1.2 3.6Z" fill="${C.sig}" stroke="${C.sigD}" stroke-width="${W2}" stroke-linejoin="round"/>` +
        `<path d="M${n(b[0])} ${n(b[1])}l-4.6 .6l1.2 -3.6Z" fill="${C.sig}" stroke="${C.sigD}" stroke-width="${W2}" stroke-linejoin="round"/></g>`)
      O.push('</g>')
      return O
    },
  },
]

/* THE FIT. Bazil: "please centre the icon, right now there are taller ones and there are shorter ones."
   tools/fit-tonal-0923.mjs measures each mark's object in Chrome and writes marks-record-fit.json; every mark is then
   scaled and moved into the same optical box. Stroke widths are divided by that scale, so the fit changes the size of
   the object and never the weight of its lines. */
let FIT = {}
try { FIT = JSON.parse(fs.readFileSync(new URL('./marks-record-fit.json', import.meta.url), 'utf8')) } catch (e) { FIT = {} }
const applyFit = (slot, inner) => {
  const f = process.env.RECORD_NOFIT ? null : FIT[slot]
  if (!f) return inner
  let body = inner.replace(/stroke-width="([\d.]+)"/g, (x, w) => `stroke-width="${(+w / f.s).toFixed(2)}"`)
  /* the ground dots ride inside the fit, so divide their radii by the same scale and every mark's ground reads the same */
  body = body.replace(/<g class="mk-gd">[\s\S]*?<\/g>/, g => g.replace(/ r="([\d.]+)"/g, (x, r) => ` r="${(+r / f.s).toFixed(2)}"`))
  return `<g class="mk-fit" transform="translate(${f.tx} ${f.ty}) scale(${f.s})">${body}</g>`
}
const wrap = m => {
  const f = process.env.RECORD_NOFIT ? null : FIT[m.slot]
  /* --fs carries the fit scale to CSS, so the hover lift is the same number of screen pixels on every mark */
  const st = f ? ` style="--fs:${f.s}"` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" class="iaq-rm rm-${m.slot}"${st} aria-hidden="true" focusable="false"><title>${m.title}</title>${applyFit(m.slot, m.body().join(''))}</svg>`
}

export function emitReact () {
  const parts = RECORD_MARKS.map(m => {
    const name = 'Rm' + m.slot[0].toUpperCase() + m.slot.slice(1)
    let svg = wrap(m).replace(/([a-zA-Z-]+)=/g, (x, a) => ({ 'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin', 'fill-rule': 'fillRule', 'class': 'className', 'fill-opacity': 'fillOpacity' }[a] || a) + '=')
    svg = svg.replace(`className="iaq-rm rm-${m.slot}"`, `className={'iaq-rm rm-${m.slot}' + (p.className ? ' ' + p.className : '')}`)
    svg = svg.replace('<svg ', '<svg {...p} ')
    /* SVG style attributes carry the band index and the fit scale; React wants them as objects */
    svg = svg.replace(/style="--i:([\d.]+)"/g, (x, v) => `style={{ '--i': ${v} }}`)
    svg = svg.replace(/style="--fs:([\d.]+)"/g, (x, v) => `style={{ '--fs': ${v} }}`)
    return `export function ${name} (p) {\n  return (\n    ${svg}\n  )\n}`
  })
  return `/* GENERATED by scripts_marks_record.mjs --react. Do not edit by hand.
   The six record marks (23 Sep 2026): graphite in five values with the IAQ red on the one part that carries the fact,
   the IAQ mark's banded detailing, three line weights, a dotted ground, and the red part on the section's slow lift
   (.mk-mv, group-record.css grLift). */
import React from 'react'

${parts.join('\n\n')}

export const RECORD_MARK = { yrs: RmYrs, ctr: RmCtr, iso: RmIso, ind: RmInd, prj: RmPrj, cln: RmCln }
`
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === '--react') { process.stdout.write(emitReact()); process.exit(0) }
  if (process.argv[2] === '--svg') {
    const out = process.argv[3] || '.marks'
    fs.mkdirSync(out, { recursive: true })
    for (const m of RECORD_MARKS) fs.writeFileSync(path.join(out, `tm-${m.slot}.svg`), wrap(m))
    console.log('wrote', RECORD_MARKS.length)
  }
}
