/* IAQ DIORAMA marks (23 Sep 2026). Bazil sent a sheet of isometric icons that each sit on a pale dotted plate:
   filled faces in ONE accent plus a near-black, small nodes floating on thin stalks, a soft shadow under the plate.

   The same seven markets, the same subject (each market is the facility IAQ builds for it), the same 2:1 dimetric,
   but drawn as the sheet draws: three face values (red top, deep red left, ink right), a plate under each with its
   dot grid, and one or two nodes standing off it. One part of each still moves (.mk-mv).

   node scripts_marks_diorama.mjs --svg <dir>    one SVG per mark, for review
   node scripts_marks_diorama.mjs --react        src/components/DioramaMarks.jsx  */
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

const C = {
  top: '#EC2027', lft: '#B5121B', rgt: '#7A0C13',   /* the accent, on its three faces */
  inkT: '#243149', inkL: '#151E30', inkR: '#0A101F', /* the near-black object, same three faces */
  plate: '#E7EBF2', plateE: '#CFD6E2', dot: '#B6BFCE', node: '#0A101F', white: '#FFFFFF',
}
const n = v => (Math.round(v * 100) / 100).toString()
const poly = pts => 'M' + pts.map(p => n(p[0]) + ' ' + n(p[1])).join('L') + 'Z'
const line = (p, q) => 'M' + n(p[0]) + ' ' + n(p[1]) + 'L' + n(q[0]) + ' ' + n(q[1])
const down = (p, t) => [p[0], p[1] + t]
const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]

function plan (cx, cy, A, B) {
  return {
    T: [cx + (-A + B), cy - (A + B) / 2], R: [cx + (A + B), cy + (A - B) / 2],
    F: [cx + (A - B), cy + (A + B) / 2], L: [cx + (-A - B), cy + (-A + B) / 2], cx, cy, A, B,
  }
}
/* a filled box: right face, left face, top face, painted in that order so nothing leaks at the seams */
function box (r, h, k = 'a') {
  const P = k === 'ink' ? [C.inkR, C.inkL, C.inkT] : [C.rgt, C.lft, C.top]
  return [
    `<path d="${poly([r.R, r.F, down(r.F, h), down(r.R, h)])}" fill="${P[0]}"/>`,
    `<path d="${poly([r.F, r.L, down(r.L, h), down(r.F, h)])}" fill="${P[1]}"/>`,
    `<path d="${poly([r.T, r.R, r.F, r.L])}" fill="${P[2]}"/>`,
  ]
}
/* a filled cylinder */
function cyl (cx, cy, rr, h, k = 'a') {
  const rx = rr * 1.414, ry = rr * 0.707
  const P = k === 'ink' ? [C.inkL, C.inkT] : [C.lft, C.top]
  return [
    `<path d="M${n(cx - rx)} ${n(cy)}V${n(cy + h)}A${n(rx)} ${n(ry)} 0 0 0 ${n(cx + rx)} ${n(cy + h)}V${n(cy)}Z" fill="${P[0]}"/>`,
    `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${P[1]}"/>`,
  ]
}
/* the pale plate every mark stands on, with its dot grid and the shadow under it */
function plate (cx, cy, A, B) {
  const r = plan(cx, cy, A, B), t = 3
  const O = [
    `<ellipse cx="${n(cx)}" cy="${n(cy + (A + B) / 2 + 7)}" rx="${n((A + B) * .8)}" ry="${n((A + B) * .26)}" fill="#0A101F" opacity=".1"/>`,
    `<path d="${poly([r.R, r.F, down(r.F, t), down(r.R, t)])}" fill="${C.plateE}"/>`,
    `<path d="${poly([r.F, r.L, down(r.L, t), down(r.F, t)])}" fill="${C.plateE}"/>`,
    `<path d="${poly([r.T, r.R, r.F, r.L])}" fill="${C.plate}"/>`,
  ]
  /* the dot grid, in plan so it lies on the plate */
  for (let i = 1; i < 7; i++) for (let j = 1; j < 7; j++) {
    const u = -A + (2 * A) * i / 7, v = -B + (2 * B) * j / 7
    O.push(`<circle cx="${n(cx + (u - v))}" cy="${n(cy + (u + v) / 2)}" r=".9" fill="${C.dot}"/>`)
  }
  return O
}
/* a node on a thin stalk, the sheet's own garnish: a small square standing off the plate */
const node = (x, y, h, s = 3.2) => [
  `<path d="${line([x, y], [x, y - h])}" stroke="${C.node}" stroke-width="1.1"/>`,
  `<rect x="${n(x - s / 2)}" y="${n(y - h - s)}" width="${n(s)}" height="${n(s)}" fill="${C.node}"/>`,
]
const windows = (r, h, rows, cols) => {
  const O = []
  for (let i = 1; i <= cols; i++) for (let j = 0; j < rows; j++) {
    const p = lerp(r.L, r.F, i / (cols + 1)), y = 4 + j * (h / rows)
    O.push(`<path d="${poly([down(p, y), down([p[0] + 3, p[1] + 1.5], y), down([p[0] + 3, p[1] + 1.5], y + h / (rows * 2.4)), down(p, y + h / (rows * 2.4))])}" fill="${C.white}" opacity=".5"/>`)
  }
  return O
}

/* 23 Sep, second cut (Bazil: "it needs not be too boring like this"): seven objects of the same mass in a row read as
   one object seven times. Each market now has the silhouette its real facility has, and the verticals (a cooling
   tower, a bioreactor, silos, server towers) are what break the line up. Pipes, ducts and stacks carry the detail. */
const pipe = (a, b, w = 2.4, col = C.inkL) => `<path d="${line(a, b)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`
const stack = (x, y, h, r = 2.2, k = 'ink') => cyl(x, y - h, r, h, k)
/* a duct run: a short square section between two points, drawn as a thin box */
const duct = (a, b, w = 3) => `<path d="${poly([[a[0], a[1] - w], [b[0], b[1] - w], [b[0], b[1] + w], [a[0], a[1] + w]])}" fill="${C.inkL}"/>`

export const DIO_MARKS = [
  {
    slot: 'sem', title: 'Semiconductor',
    /* the fab: a long low hall under three exhaust stacks, the wafer on its carrier out front */
    body: () => {
      const O = [...plate(48, 62, 30, 30)]
      const hall = plan(44, 42, 17, 11)
      O.push(...box(hall, 13)); O.push(...windows(hall, 13, 2, 4))
      /* the stacks, the tallest thing on the plate */
      for (const [k, h] of [[.24, 26], [.5, 32], [.76, 22]]) {
        const q = lerp(hall.T, hall.R, k)
        O.push(...stack(q[0], q[1] + 1, h, 2.4))
      }
      O.push(duct(lerp(hall.T, hall.R, .24), lerp(hall.T, hall.R, .76), 1.6))
      /* the wafer on its carrier */
      O.push(...box(plan(30, 68, 7, 6), 3, 'ink'))
      O.push(`<g class="mk-mv"><ellipse cx="30" cy="66" rx="7.4" ry="3.7" fill="${C.top}"/><ellipse cx="30" cy="66" rx="3" ry="1.5" fill="${C.white}" opacity=".5"/></g>`)
      return O
    },
  },
  {
    slot: 'dat', title: 'Data Centre',
    /* the halls stand UP here: two towers, the near one red with its lit rows, a chiller deck between them */
    body: () => {
      const O = [...plate(48, 64, 30, 30)]
      const back = plan(62, 34, 8, 7), front = plan(38, 42, 9, 8)
      O.push(...box(back, 30, 'ink'))
      O.push(...box(front, 34))
      /* the lit rows */
      for (let i = 0; i < 3; i++) {
        const p = lerp(front.F, front.L, .22), q = lerp(front.F, front.L, .78), y = 8 + i * 9
        O.push(`<path d="${poly([down(p, y), down(q, y), down(q, y + 3), down(p, y + 3)])}" fill="${C.white}" opacity="${i === 1 ? '.9' : '.4'}" class="${i === 1 ? 'mk-mv' : ''}"/>`)
      }
      /* the chiller deck */
      O.push(...box(plan(52, 62, 7, 6), 5, 'ink'))
      O.push(`<ellipse cx="52" cy="57" rx="5" ry="2.5" fill="${C.top}"/>`)
      O.push(pipe([46, 62], [56, 57]))
      return O
    },
  },
  {
    slot: 'ev', title: 'EV Battery',
    /* the gigafactory: the long dry-room hall with a stack, the module and its cells on the apron */
    body: () => {
      const O = [...plate(48, 62, 30, 30)]
      const hall = plan(46, 38, 18, 9)
      O.push(...box(hall, 15)); O.push(...windows(hall, 15, 2, 4))
      O.push(...stack(lerp(hall.T, hall.L, .3)[0], lerp(hall.T, hall.L, .3)[1] + 1, 20, 2.2))
      /* the cells, standing on the apron */
      for (let i = 0; i < 3; i++) O.push(...cyl(26 + i * 8, 62 + i * 4, 3, 7, 'ink'))
      /* the module leaving */
      O.push(`<g class="mk-mv">`)
      O.push(...box(plan(60, 66, 8, 5), 5, 'ink'))
      O.push(`<path d="${poly([plan(60, 63, 8, 5).T, plan(60, 63, 8, 5).R, plan(60, 63, 8, 5).F, plan(60, 63, 8, 5).L])}" fill="${C.top}"/>`)
      O.push(`</g>`)
      return O
    },
  },
  {
    slot: 'pv', title: 'Photovoltaics',
    /* the field: two arrays stepping back, the inverter, and a met mast with the sun above it */
    body: () => {
      const O = [...plate(48, 64, 30, 30)]
      for (let i = 0; i < 2; i++) {
        const cx = 36 + i * 24, cy = 46 + i * 12, p0 = plan(cx, cy, 12, 6), lift = 12
        const T = down(p0.T, -lift), R = down(p0.R, -lift), F = p0.F, L = p0.L
        O.push(`<path d="${line(lerp(T, L, .5), down(lerp(T, L, .5), 14))}" stroke="${C.inkR}" stroke-width="2.4"/>`)
        O.push(`<path d="${line(lerp(R, F, .5), down(lerp(R, F, .5), 14))}" stroke="${C.inkR}" stroke-width="2.4"/>`)
        O.push(`<path d="${poly([T, R, F, L])}" fill="${C.top}"/>`)
        O.push(`<path d="${poly([lerp(T, L, .5), lerp(R, F, .5), F, L])}" fill="${C.lft}"/>`)
        for (const k of [.33, .66]) O.push(`<path d="${line(lerp(T, R, k), lerp(L, F, k))}" stroke="${C.white}" stroke-width="1.2" opacity=".6"/>`)
        O.push(`<path d="${line(lerp(T, L, .5), lerp(R, F, .5))}" stroke="${C.white}" stroke-width="1.2" opacity=".6"/>`)
      }
      O.push(...box(plan(24, 66, 6, 5), 9, 'ink'))
      /* the met mast, and the sun over it */
      O.push(pipe([70, 62], [70, 30], 1.6))
      O.push(`<g class="mk-mv"><circle cx="70" cy="22" r="7.5" fill="${C.top}"/></g>`)
      return O
    },
  },
  {
    slot: 'dch', title: 'District Cooling &amp; Heating',
    /* the plant, and it is TALL: the cooling tower with its fan over a low chiller hall, two chilled-water tanks */
    body: () => {
      const O = [...plate(48, 66, 30, 30)]
      const hall = plan(34, 52, 12, 8)
      O.push(...box(hall, 12)); O.push(...windows(hall, 12, 1, 3))
      const tw = plan(64, 38, 10, 9)
      O.push(...box(tw, 30, 'ink'))
      /* the louvred face */
      for (let i = 0; i < 3; i++) O.push(`<path d="${poly([down(lerp(tw.F, tw.L, .15), 8 + i * 7), down(lerp(tw.F, tw.L, .85), 8 + i * 7), down(lerp(tw.F, tw.L, .85), 11 + i * 7), down(lerp(tw.F, tw.L, .15), 11 + i * 7)])}" fill="${C.white}" opacity=".18"/>`)
      O.push(`<ellipse cx="64" cy="38" rx="${n(8 * 1.414)}" ry="${n(8 * .707)}" fill="${C.inkR}"/>`)
      O.push(`<ellipse cx="64" cy="38" rx="${n(8 * 1.414)}" ry="${n(8 * .707)}" fill="none" stroke="${C.top}" stroke-width="1.8"/>`)
      O.push(`<g class="mk-mv"><g transform="translate(64 38) scale(1 .5)">` +
        [0, 60, 120, 180, 240, 300].map(d => `<path d="M0 0L-3.8 -10L1.8 -10.4Z" fill="${C.top}" transform="rotate(${d})"/>`).join('') +
        `<circle r="2.2" fill="${C.white}" opacity=".85"/></g></g>`)
      /* the tanks and the header between them */
      O.push(...cyl(26, 68, 5, 12))
      O.push(...cyl(40, 74, 5, 12, 'ink'))
      O.push(pipe([31, 70], [58, 62], 2.8, C.lft))
      return O
    },
  },
  {
    slot: 'bio', title: 'Bio LifeScience',
    /* the plant: the cleanroom block low and wide, the bioreactor standing tall beside it, piped in */
    body: () => {
      const O = [...plate(48, 66, 30, 30)]
      const block = plan(34, 50, 13, 9)
      O.push(...box(block, 14)); O.push(...windows(block, 14, 2, 3))
      for (const k of [.3, .7]) { const q = lerp(block.T, block.R, k); O.push(...box(plan(q[0], q[1] - 3, 3, 2.6), 4, 'ink')) }
      /* the bioreactor, the tallest thing here */
      O.push(...cyl(68, 40, 9, 26))
      O.push(`<path d="${poly([[68 - 9 * 1.414, 52], [68 + 9 * 1.414, 52], [68 + 9 * 1.414, 57], [68 - 9 * 1.414, 57]])}" fill="${C.rgt}"/>`)
      O.push(`<g class="mk-mv"><path d="M${n(68 - 9 * 1.414)} ${n(58)}A${n(9 * 1.414)} ${n(9 * .707)} 0 0 0 ${n(68 + 9 * 1.414)} ${n(58)}V${n(64)}A${n(9 * 1.414)} ${n(9 * .707)} 0 0 1 ${n(68 - 9 * 1.414)} ${n(64)}Z" fill="${C.white}" opacity=".22"/></g>`)
      O.push(pipe([44, 62], [56, 56], 2.6))
      O.push(...stack(78, 40, 14, 1.8))
      return O
    },
  },
  {
    slot: 'fnb', title: 'Food &amp; Beverage',
    /* the plant: three silos of different heights over a low process hall, the filling line out front */
    body: () => {
      const O = [...plate(48, 66, 30, 30)]
      const hall = plan(36, 52, 13, 8)
      O.push(...box(hall, 12)); O.push(...windows(hall, 12, 1, 3))
      /* the silos */
      const silos = [[62, 36, 24], [72, 42, 30], [80, 48, 20]]
      silos.forEach(([x, y, h], i) => O.push(...cyl(x, y, 5.5, h, i === 1 ? 'a' : 'ink')))
      O.push(pipe([58, 40], [80, 48], 2))
      /* the filling line */
      O.push(...box(plan(30, 70, 11, 4), 4, 'ink'))
      for (const [u, solid] of [[-7, false], [4, true]]) {
        const cx = 30 + u, cy = 68 + u / 2
        O.push(...cyl(cx, cy - 8, 3.4, 8, solid ? 'a' : 'ink'))
      }
      O.push(`<g class="mk-mv"><ellipse cx="34" cy="60" rx="4.8" ry="2.4" fill="${C.white}" opacity=".75"/></g>`)
      return O
    },
  },
  {
    slot: 'faq', title: 'Questions, answered',
    /* 24 Sep (Bazil, for the FAQ heading: "question icon, this style but better"): a standing red plaque on the
       plate, the question mark on its face drawn in the face's own perspective, one node off the plate */
    body: () => {
      const O = [...plate(48, 62, 30, 30)]
      const pq = plan(47, 46, 15, 5), h = 28
      O.push(...box(pq, h))
      /* the face the viewer reads: L to F across the top, straight down by h. A local 20 x 28 sheet is mapped
         onto it, so the glyph sits in the face's perspective instead of floating flat over it. */
      const W = 20, H = 28, dx = (pq.F[0] - pq.L[0]) / W, dy = (pq.F[1] - pq.L[1]) / W
      const M = `matrix(${n(dx)} ${n(dy)} 0 ${n(h / H)} ${n(pq.L[0])} ${n(pq.L[1])})`
      O.push(`<g transform="${M}"><path d="M6.2 9.6C6.2 5.2 8 3.6 10.2 3.6C12.6 3.6 14 5.3 14 7.6C14 10.4 10.3 11 10.3 15.4V17.2" fill="none" stroke="${C.white}" stroke-width="2.3" stroke-linecap="round"/><g class="mk-mv"><circle cx="10.3" cy="22.4" r="1.6" fill="${C.white}"/></g></g>`)
      /* the answer: a small ink block at the foot of the plaque, and the node */
      O.push(...box(plan(64, 66, 5, 4), 4, 'ink'))
      O.push(...node(28, 40, 12))
      return O
    },
  },
  {
    slot: 'grow', title: 'Engineers start and grow',
    /* 24 Sep (Careers heading "Where engineers start and grow", Bazil: "create icon on the left also here"): three
       red steps rising across the plate, an ink figure block at the top step, one node */
    body: () => {
      const O = [...plate(48, 62, 30, 30)]
      const steps = [[66, 42, 26], [48, 51, 17], [30, 60, 8]]
      steps.forEach(([cx, cy, h]) => O.push(...box(plan(cx, cy, 6, 6), h)))
      /* the engineer at the top: an ink block, and the moving part is the node above it */
      O.push(...box(plan(66, 42, 3, 3), 8, 'ink').map(x => x.replace(/<path /g, '<path transform="translate(0 -26)" ')))
      O.push(`<g class="mk-mv">${node(30, 40, 14).join('')}</g>`)
      return O
    },
  },
]
const wrap = m => `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" class="iaq-dm dm-${m.slot}" aria-hidden="true" focusable="false"><title>${m.title}</title>${m.body().join('')}</svg>`

export function emitReact () {
  const parts = DIO_MARKS.map(m => {
    const name = 'Dm' + m.slot[0].toUpperCase() + m.slot.slice(1)
    let svg = wrap(m).replace(/([a-zA-Z-]+)=/g, (x, a) => ({ 'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin', 'fill-rule': 'fillRule', 'class': 'className', 'fill-opacity': 'fillOpacity' }[a] || a) + '=')
    svg = svg.replace(`className="iaq-dm dm-${m.slot}"`, `className={'iaq-dm dm-${m.slot}' + (p.className ? ' ' + p.className : '')}`)
    svg = svg.replace('<svg ', '<svg {...p} ')
    return `export function ${name} (p) {\n  return (\n    ${svg}\n  )\n}`
  })
  return `/* GENERATED by scripts_marks_diorama.mjs --react. Do not edit by hand.
   The seven market marks as dioramas (23 Sep 2026): filled isometric in IAQ red and near-black, each on a pale
   dotted plate with a node standing off it, one moving part each (.mk-mv, home.css hmk* keyframes). */
import React from 'react'

${parts.join('\n\n')}

export const DIO_MARK = { 'mkt-semiconductor': DmSem, 'mkt-data-centre': DmDat, 'mkt-ev-battery': DmEv, 'mkt-photovoltaics': DmPv, 'mkt-district-cooling': DmDch, 'mkt-bio-lifescience': DmBio, 'mkt-food-beverage': DmFnb }
/* DmFaq is the FAQ heading mark on the Services page, not a market */
`
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === '--react') { process.stdout.write(emitReact()); process.exit(0) }
  if (process.argv[2] === '--svg') {
    const out = process.argv[3] || '.marks'
    fs.mkdirSync(out, { recursive: true })
    for (const m of DIO_MARKS) fs.writeFileSync(path.join(out, `dm-${m.slot}.svg`), wrap(m))
    console.log('wrote', DIO_MARKS.length)
  }
}
