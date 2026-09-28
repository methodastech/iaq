/* IAQ TONAL marks (23 Sep 2026).
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
  top: '#FDECEC', lft: '#F8AEB2', mid: '#F2595F', rgt: '#EC2027', deep: '#A6131A',
  ink: '#8A0E14', dot: '#F7CACC', sig: '#EC2027', white: '#FFFFFF',
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
/* TEXTURE. Bazil: "maybe some texture will help detailed." Fine ribbing clipped to one face, at a value one step
   from the face it sits on, so it reads as brushed metal at 80 px instead of as lines. */
let UID = 0
function hatch (pts, { gap = 2.6, col = C.lft, w = .55, op = .9 } = {}) {
  const id = `h${UID++}`
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1])
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys)
  const L = []
  for (let x = x0 + gap * .5; x < x1; x += gap) L.push(`M${n(x)} ${n(y0 - 1)}V${n(y1 + 1)}`)
  return [
    `<clipPath id="${id}"><path d="${poly(pts)}"/></clipPath>`,
    `<g clip-path="url(#${id})" opacity="${op}"><path d="${L.join('')}" stroke="${col}" stroke-width="${w}" fill="none"/></g>`,
  ]
}
const solid = d => `<path d="${d}" fill="${C.sig}" stroke="${C.ink}" stroke-width="${W2}" stroke-linejoin="round"/>`
const solidEl = (cx, cy, rx, ry) => `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${C.sig}" stroke="${C.ink}" stroke-width="${W2}"/>`

export const TONAL_MARKS = [
  {
    slot: 'sem', title: 'Semiconductor',
    /* the package: the body in bands, the lead frame inset on the lid, four pins a side, the pin-one dot,
       the die on top. One object, nothing beside it. The die is the solid part and the part that moves. */
    body: () => {
      const O = [...dots(46, 74, 25, 14), '<g class="mk-ob">']
      const pkg = plan(48, 30, 15, 15)
      O.push(...box(pkg, 9, { bands: 2, gap: 2 }))
      const inset = plan(48, 30, 11.4, 11.4)
      O.push(OUT(poly([inset.T, inset.R, inset.F, inset.L]), W2))
      for (let i = 1; i <= 4; i++) {
        const a = lerp(pkg.L, pkg.F, i / 5), b = lerp(pkg.F, pkg.R, i / 5)
        O.push(OUT(line(down(a, 9), down(a, 14)), W3, C.deep))
        O.push(OUT(line(down(b, 9), down(b, 14)), W3, C.deep))
      }
      const p1 = lerp(pkg.T, pkg.L, .3)
      O.push(dot(p1[0] + 2, p1[1] + 1.4, 1.1))
      const die = plan(48, 27.6, 5.2, 5.2)
      O.push(`<g class="mk-mv">${solid(poly([die.T, die.R, die.F, die.L]))}</g>`)
      O.push(OUT(line(die.L, down(die.L, 2.4)), W2), OUT(line(die.F, down(die.F, 2.4)), W2), OUT(line(die.R, down(die.R, 2.4)), W2))
      O.push('</g>')
      return O
    },
  },
  {
    slot: 'dat', title: 'Data Centre',
    /* the rack: six servers with their vents and status lights, the posts and the feet, and one unit live,
       which is the part that moves */
    body: () => {
      const O = [...dots(48, 76, 23, 14), '<g class="mk-ob">']
      const r = plan(48, 22, 11, 8.5), H = 44
      O.push(fill(poly([r.T, r.R, down(r.R, H), down(r.F, H), down(r.L, H), r.L]), C.top))
      O.push(fill(poly([r.T, r.R, r.F, r.L]), C.top))
      for (let i = 0; i < 6; i++) {
        const y = 3 + i * 7
        O.push(`<g class="mk-bd" style="--i:${6 - i}">`)
        O.push(...band(r, y, y + 4.4, { rgt: i === 2 ? C.mid : C.rgt }))
        O.push('</g>')
        const a = down(r.L, y), b = down(r.F, y), c = down(r.R, y)
        O.push(OUT(poly([a, b, c, down(c, 4.4), down(b, 4.4), down(a, 4.4)]), W2))
        O.push(...ticks(down(r.F, y + 1.1), down(r.R, y + 1.1), 2))
        const led = lerp(down(r.F, y + 2.2), down(r.L, y + 2.2), .26)
        O.push(dot(led[0], led[1], .95, i === 2 ? C.sig : C.lft))
      }
      O.push(OUT(poly([r.T, r.R, down(r.R, H), down(r.F, H), down(r.L, H), r.L])))
      O.push(OUT(line(r.L, r.F), W2), OUT(line(r.F, r.R), W2))
      O.push(OUT(line(r.F, down(r.F, H)), W2))
      for (const q of [r.L, r.R, r.F]) O.push(OUT(line(down(q, H), down(q, H + 3)), W3))
      const y2 = 3 + 2 * 7 + 1.2
      const p = lerp(down(r.F, y2), down(r.L, y2), .24), q = lerp(down(r.F, y2), down(r.L, y2), .82)
      O.push(`<g class="mk-mv">${solid(poly([p, q, down(q, 2.2), down(p, 2.2)]))}</g>`)
      O.push('</g>')
      return O
    },
  },
  {
    slot: 'ev', title: 'EV Battery',
    /* the pack: the tray in bands with its bolted flange, three prismatic modules on it, each ribbed and terminalled,
       the busbar across their tops, and the module that is live, which is the solid part and the part that moves */
    body: () => {
      const O = [...dots(48, 74, 26, 15), '<g class="mk-ob">']
      const tray = plan(48, 48, 20, 13)
      O.push(...box(tray, 9, { bands: 2, gap: 2.4 }))
      O.push(...hatch([tray.R, tray.F, down(tray.F, 9), down(tray.R, 9)], { gap: 2.4, col: C.lft, op: .5 }))
      const fl = plan(48, 48, 17, 10.6)
      O.push(OUT(poly([fl.T, fl.R, fl.F, fl.L]), W2))
      for (const k of [.2, .5, .8]) {
        const a = lerp(fl.T, fl.R, k), b = lerp(fl.L, fl.F, k)
        O.push(dot(a[0], a[1], .8, C.mid), dot(b[0], b[1], .8, C.mid))
      }
      /* three modules along the tray, each one object, not a crowd of cans */
      const modules = [-11, 0, 11].map(u => plan(48 + u, 48 + u / 2, 4.6, 9.5))
      modules.forEach((m, i) => {
        O.push(...box(m, 9, { bands: 2, gap: 1.8, rgt: i === 1 ? C.mid : C.rgt }))
        O.push(...hatch([m.R, m.F, down(m.F, 9), down(m.R, 9)], { gap: 1.7, col: C.top, op: .45 }))
        O.push(dot(m.cx - 2.4, m.cy - .6, .9), dot(m.cx + 2.4, m.cy + .6, .9))
      })
      const bar0 = [modules[0].T[0] + 1, modules[0].T[1] + 1.5], bar1 = [modules[2].F[0] - 1, modules[2].F[1] - 1.5]
      O.push(OUT(line(bar0, bar1), W3, C.deep))
      const live = modules[0]
      O.push(`<g class="mk-mv">${solid(poly([live.T, live.R, live.F, live.L]))}</g>`)
      O.push('</g>')
      return O
    },
  },
  {
    slot: 'pv', title: 'Photovoltaics',
    /* the tracker: three modules with their cell grids on the torque tube, the bearings, two posts on base plates,
       and the drive at the middle. The lit module is the solid part and the part that moves. */
    body: () => {
      const O = [...dots(50, 78, 24, 13), '<g class="mk-ob">']
      const p0 = plan(50, 52, 20, 12), lift = 16
      const T = down(p0.T, -lift), R = down(p0.R, -lift), F = p0.F, L = p0.L
      const m1 = lerp(T, L, .5), m2 = lerp(R, F, .5)
      O.push(OUT(line(m1, m2), W1, C.deep))
      const posts = [lerp(m1, m2, .2), lerp(m1, m2, .8)]
      for (const q of posts) {
        O.push(OUT(line(q, down(q, 12)), W3))
        O.push(OUT(line(down(q, 12), [q[0] - 5.5, q[1] + 16]), W2), OUT(line(down(q, 12), [q[0] + 5.5, q[1] + 16]), W2))
        O.push(foot(q[0], q[1] + 16.6, 5.2))
        O.push(`<rect x="${n(q[0] - 2.2)}" y="${n(q[1] - 2)}" width="4.4" height="4" rx=".6" fill="${C.lft}" stroke="${C.ink}" stroke-width="${W2}"/>`)
      }
      const tone = [C.top, C.lft, C.mid]
      const cut = [[0, .3], [.35, .65], [.7, 1]]
      cut.forEach(([k0, k1], i) => {
        const a = lerp(T, L, k0), b = lerp(R, F, k0), c = lerp(R, F, k1), d = lerp(T, L, k1)
        O.push(`<g class="mk-bd" style="--i:${3 - i}">`, fill(poly([a, b, c, d]), tone[i]), '</g>')
        O.push(...grid(a, b, c, d, 3, 2))
        O.push(OUT(poly([a, b, c, d]), W2))
      })
      O.push(OUT(poly([T, R, F, L])))
      const mid = lerp(m1, m2, .5)
      O.push(`<rect x="${n(mid[0] - 3)}" y="${n(mid[1] - 1.6)}" width="6" height="5.2" rx=".8" fill="${C.top}" stroke="${C.ink}" stroke-width="${W2}"/>`)
      O.push(dot(mid[0], mid[1] + 1, 1))
      O.push(`<g class="mk-mv">${solid(poly([lerp(T, L, .04), lerp(R, F, .04), lerp(R, F, .26), lerp(T, L, .26)]))}</g>`)
      O.push('</g>')
      return O
    },
  },
  {
    slot: 'dch', title: 'District Cooling &amp; Heating',
    /* the cooling tower on its basin: louvre bands and the fan in its shroud, which is the part that moves.
       One object: the ladder and the pump set beside it were noise at 80 px. */
    body: () => {
      const O = [...dots(48, 78, 26, 15), '<g class="mk-ob">']
      const basin = plan(48, 62, 16, 12)
      O.push(...box(basin, 4, { bands: 1 }))
      const tw = plan(48, 42, 13, 11)
      O.push(...box(tw, 20, { bands: 4, gap: 2.2 }))
      O.push(`<ellipse cx="48" cy="42" rx="${n(8.4 * 1.414)}" ry="${n(8.4 * .707)}" fill="${C.lft}" stroke="${C.ink}" stroke-width="${W2}"/>`)
      O.push(`<ellipse cx="48" cy="42" rx="${n(6.6 * 1.414)}" ry="${n(6.6 * .707)}" fill="none" stroke="${C.ink}" stroke-width="${W2}"/>`)
      O.push(`<g class="mk-mv"><g transform="translate(48 42) scale(1 .5)">` +
        [0, 90, 180, 270].map(d => `<path d="M0 0L-2.8 -8.8A9.2 9.2 0 0 1 2.8 -8.8Z" fill="${C.sig}" stroke="${C.ink}" stroke-width="${W2}" stroke-linejoin="round" transform="rotate(${d})"/>`).join('') +
        `<circle r="1.8" fill="${C.top}" stroke="${C.ink}" stroke-width="${W2}"/></g></g>`)
      O.push(...ticks(down(tw.F, 3), down(tw.R, 3), 3))
      O.push('</g>')
      return O
    },
  },
  {
    slot: 'bio', title: 'Bio LifeScience',
    /* the bioreactor: the dished vessel in jacket bands, the agitator drive on top, the sight glass, three legs on
       base plates, and the batch level, which is the part that moves */
    body: () => {
      const O = [...dots(46, 78, 24, 14), '<g class="mk-ob">']
      const cx = 46, cy = 24, rr = 12.5, H = 26, rx = rr * 1.414, ry = rr * 0.707
      O.push(...cyl(cx, cy, rr, H, { bands: 4, gap: 2.4 }))
      O.push(`<path d="M${n(cx - rx)} ${n(cy + H)}A${n(rx)} ${n(rr * .95)} 0 0 0 ${n(cx + rx)} ${n(cy + H)}" fill="${C.lft}"/>`)
      O.push(OUT(`M${n(cx - rx)} ${n(cy + H)}A${n(rx)} ${n(rr * .95)} 0 0 0 ${n(cx + rx)} ${n(cy + H)}`))
      O.push(`<path d="M${n(cx - rx)} ${n(cy)}A${n(rx)} ${n(rr * .62)} 0 0 1 ${n(cx + rx)} ${n(cy)}" fill="${C.top}" stroke="${C.ink}" stroke-width="${W1}"/>`)
      for (const [dx, h] of [[-12.5, 16], [12.5, 16], [0, 12]]) {
        O.push(OUT(line([cx + dx, cy + H + (dx ? 3 : 8)], [cx + dx * 1.32, cy + H + h + 3]), W3))
        if (dx) O.push(foot(cx + dx * 1.32, cy + H + h + 3.6, 3.6))
      }
      const drv = plan(cx, 10, 3.4, 2.8)
      O.push(...box(drv, 4.4, { bands: 1, rgt: C.deep }))
      O.push(OUT(line([cx, 14.4], [cx, 17.5]), W3))
      O.push(`<rect x="${n(cx - 9.5)}" y="${n(cy + 9)}" width="3" height="9" rx="1.5" fill="${C.top}" stroke="${C.ink}" stroke-width="${W2}"/>`)
      const y0 = 17.5, y1 = 21
      O.push(`<g class="mk-mv"><path d="M${n(cx - rx)} ${n(cy + y0)}A${n(rx)} ${n(ry)} 0 0 0 ${n(cx + rx)} ${n(cy + y0)}V${n(cy + y1)}A${n(rx)} ${n(ry)} 0 0 1 ${n(cx - rx)} ${n(cy + y1)}Z" fill="${C.sig}" stroke="${C.ink}" stroke-width="${W2}"/></g>`)
      O.push('</g>')
      return O
    },
  },
  {
    slot: 'fnb', title: 'Food &amp; Beverage',
    /* the line: the conveyor on its legs with rollers and a side rail, three bottles with shoulders, necks and caps,
       and the full bottle, which is the part that moves. The filler head above it was a second object, so it went. */
    body: () => {
      const O = [...dots(46, 76, 26, 14), '<g class="mk-ob">']
      const belt = plan(46, 56, 20, 6.5)
      O.push(...box(belt, 5, { bands: 1 }))
      for (const k of [.14, .34, .54, .74, .94]) O.push(OUT(line(lerp(belt.T, belt.R, k), lerp(belt.L, belt.F, k)), W2))
      O.push(OUT(line([belt.T[0], belt.T[1] - 2.4], [belt.R[0], belt.R[1] - 2.4]), W2))
      const A0 = lerp(belt.T, belt.L, .5), A1 = lerp(belt.R, belt.F, .5)
      for (const q of [lerp(A0, A1, .12), lerp(A0, A1, .88)]) {
        O.push(OUT(line(down(q, 5), down(q, 13)), W3))
        O.push(foot(q[0], q[1] + 13.6, 3.6))
      }
      const spot = [.2, .5, .8].map(k => lerp(A0, A1, k))
      spot.forEach((q, i) => {
        O.push(...cyl(q[0], q[1] - 9, 3.1, 9, { bands: 2, gap: 1.6, body: i === 1 ? C.mid : C.rgt }))
        O.push(OUT(line([q[0] - 3.1, q[1] - 9], [q[0] - 1.3, q[1] - 11.6]), W2), OUT(line([q[0] + 3.1, q[1] - 9], [q[0] + 1.3, q[1] - 11.6]), W2))
        O.push(...cyl(q[0], q[1] - 14.6, 1.3, 3, { bands: 1, body: C.lft }))
        O.push(`<ellipse cx="${n(q[0])}" cy="${n(q[1] - 15.2)}" rx="2.2" ry="1.1" fill="${C.deep}" stroke="${C.ink}" stroke-width="${W2}"/>`)
      })
      const f = spot[1]
      O.push(`<g class="mk-mv">${solid(`M${n(f[0] - 4.4)} ${n(f[1] - 6)}A4.4 2.2 0 0 0 ${n(f[0] + 4.4)} ${n(f[1] - 6)}V${n(f[1] - 2)}A4.4 2.2 0 0 1 ${n(f[0] - 4.4)} ${n(f[1] - 2)}Z`)}</g>`)
      O.push('</g>')
      return O
    },
  },
]

/* THE FIT. Bazil: "please centre the icon, right now there are taller ones and there are shorter ones."
   tools/fit-tonal-0923.mjs measures each mark's object in Chrome and writes marks-tonal-fit.json; every mark is then
   scaled and moved into the same optical box. Stroke widths are divided by that scale, so the fit changes the size of
   the object and never the weight of its lines. */
let FIT = {}
try { FIT = JSON.parse(fs.readFileSync(new URL('./marks-tonal-fit.json', import.meta.url), 'utf8')) } catch (e) { FIT = {} }
const applyFit = (slot, inner) => {
  const f = process.env.TONAL_NOFIT ? null : FIT[slot]
  if (!f) return inner
  let body = inner.replace(/stroke-width="([\d.]+)"/g, (x, w) => `stroke-width="${(+w / f.s).toFixed(2)}"`)
  /* the ground dots ride inside the fit, so divide their radii by the same scale and every mark's ground reads the same */
  body = body.replace(/<g class="mk-gd">[\s\S]*?<\/g>/, g => g.replace(/ r="([\d.]+)"/g, (x, r) => ` r="${(+r / f.s).toFixed(2)}"`))
  return `<g class="mk-fit" transform="translate(${f.tx} ${f.ty}) scale(${f.s})">${body}</g>`
}
const wrap = m => {
  const f = process.env.TONAL_NOFIT ? null : FIT[m.slot]
  /* --fs carries the fit scale to CSS, so the hover lift is the same number of screen pixels on every mark */
  const st = f ? ` style="--fs:${f.s}"` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" class="iaq-tm tm-${m.slot}"${st} aria-hidden="true" focusable="false"><title>${m.title}</title>${applyFit(m.slot, m.body().join(''))}</svg>`
}

export function emitReact () {
  const parts = TONAL_MARKS.map(m => {
    const name = 'Tm' + m.slot[0].toUpperCase() + m.slot.slice(1)
    let svg = wrap(m).replace(/([a-zA-Z-]+)=/g, (x, a) => ({ 'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin', 'fill-rule': 'fillRule', 'class': 'className', 'fill-opacity': 'fillOpacity' }[a] || a) + '=')
    svg = svg.replace(`className="iaq-tm tm-${m.slot}"`, `className={'iaq-tm tm-${m.slot}' + (p.className ? ' ' + p.className : '')}`)
    svg = svg.replace('<svg ', '<svg {...p} ')
    /* SVG style attributes carry the band index and the fit scale; React wants them as objects */
    svg = svg.replace(/style="--i:([\d.]+)"/g, (x, v) => `style={{ '--i': ${v} }}`)
    svg = svg.replace(/style="--fs:([\d.]+)"/g, (x, v) => `style={{ '--fs': ${v} }}`)
    return `export function ${name} (p) {\n  return (\n    ${svg}\n  )\n}`
  })
  return `/* GENERATED by scripts_marks_tonal.mjs --react. Do not edit by hand.
   The seven market marks in shades of one red (23 Sep 2026): pale top faces, light-mid sides, the brand red, a deep
   red outline in two weights, the IAQ mark's banded detailing, a dotted shadow, and one solid moving part each
   (.mk-mv, home.css hmk* keyframes). */
import React from 'react'

${parts.join('\n\n')}

export const TONAL_MARK = { 'mkt-semiconductor': TmSem, 'mkt-data-centre': TmDat, 'mkt-ev-battery': TmEv, 'mkt-photovoltaics': TmPv, 'mkt-district-cooling': TmDch, 'mkt-bio-lifescience': TmBio, 'mkt-food-beverage': TmFnb }
`
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === '--react') { process.stdout.write(emitReact()); process.exit(0) }
  if (process.argv[2] === '--svg') {
    const out = process.argv[3] || '.marks'
    fs.mkdirSync(out, { recursive: true })
    for (const m of TONAL_MARKS) fs.writeFileSync(path.join(out, `tm-${m.slot}.svg`), wrap(m))
    console.log('wrote', TONAL_MARKS.length)
  }
}
