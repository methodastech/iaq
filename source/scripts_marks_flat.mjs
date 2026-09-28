/* IAQ FLAT marks (23 Sep 2026). Bazil, with the IAQ logo mark beside the grey isometric icons: "i like the detailing
   of the icon but can you do something like this design direction", and "bio lifescience shouldn't have a flat beaker".

   THE LOGO'S OWN GRAMMAR, applied to seven markets:
     · one flat IAQ red, no gradient, no shading, no second colour
     · every object is built of STACKED BANDS with the ground showing through the gaps, the way the mark's cube is
     · the topmost face is an OPEN outline, not a fill, so the object reads as built rather than drawn
     · a seam splits the front vertical edge, as the mark's does
     · one small part per mark is solid, and that part is the one that moves

   node scripts_marks_flat.mjs --svg <dir>     one SVG per mark, for review
   node scripts_marks_flat.mjs --react         src/components/FlatMarks.jsx  */
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

const RED = '#EC2027'
const n = v => (Math.round(v * 100) / 100).toString()
const poly = pts => 'M' + pts.map(p => n(p[0]) + ' ' + n(p[1])).join('L') + 'Z'
const line = (p, q) => 'M' + n(p[0]) + ' ' + n(p[1]) + 'L' + n(q[0]) + ' ' + n(q[1])
const down = (p, t) => [p[0], p[1] + t]
const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]

/* the same 2:1 dimetric plan the rest of the system uses */
function plan (cx, cy, A, B) {
  return {
    T: [cx + (-A + B), cy - (A + B) / 2], R: [cx + (A + B), cy + (A - B) / 2],
    F: [cx + (A - B), cy + (A + B) / 2], L: [cx + (-A - B), cy + (-A + B) / 2], cx, cy, A, B,
  }
}
/* ONE BAND of a box: the two visible faces between two heights, split by the seam at the front edge */
function band (r, y0, y1, { seam = 2.2 } = {}) {
  const s = seam / 2
  const Fr = [r.F[0] + s, r.F[1] + s / 2], Fl = [r.F[0] - s, r.F[1] + s / 2]
  return [
    `<path d="${poly([down(r.R, y0), down(Fr, y0), down(Fr, y1), down(r.R, y1)])}" fill="${RED}"/>`,
    `<path d="${poly([down(Fl, y0), down(r.L, y0), down(r.L, y1), down(Fl, y1)])}" fill="${RED}"/>`,
  ]
}
/* the open top: the rhombus as an outline, plus the short drop at each corner, which is what makes the mark's
   cube read as an open crate rather than a flat tile */
function openTop (r, drop = 5, w = 3) {
  const S = `fill="none" stroke="${RED}" stroke-width="${w}" stroke-linejoin="miter" stroke-linecap="butt"`
  return [
    `<path d="${poly([r.T, r.R, r.F, r.L])}" ${S}/>`,
    `<path d="${line(r.R, down(r.R, drop))}" ${S}/>`,
    `<path d="${line(r.L, down(r.L, drop))}" ${S}/>`,
    `<path d="${line(r.F, down(r.F, drop))}" ${S}/>`,
  ]
}
const topFill = r => `<path d="${poly([r.T, r.R, r.F, r.L])}" fill="${RED}"/>`
/* an isometric ring (one band of a cylinder): the front half of the wall between two heights */
function ring (cx, cy, rr, y0, y1) {
  const rx = rr * 1.414, ry = rr * 0.707
  return `<path d="M${n(cx - rx)} ${n(cy + y0)}A${n(rx)} ${n(ry)} 0 0 0 ${n(cx + rx)} ${n(cy + y0)}V${n(cy + y1)}A${n(rx)} ${n(ry)} 0 0 1 ${n(cx - rx)} ${n(cy + y1)}Z" fill="${RED}"/>`
}
const ellipseOutline = (cx, cy, rr, w = 3) => `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rr * 1.414)}" ry="${n(rr * 0.707)}" fill="none" stroke="${RED}" stroke-width="${w}"/>`

/* 23 Sep, second reference (Bazil sent a sheet of fine isometric LINE icons: "must be red though"): the marks are
   drawn as OUTLINES in IAQ red, one uniform stroke, rounded joins, with exactly one small solid red part each, which
   is also the part that moves. The geometry stays the logo's: the same 2:1 dimetric, the same open tops. */
const W = 3.3
const ST = `fill="none" stroke="${RED}" stroke-width="${W}" stroke-linejoin="round" stroke-linecap="round"`
const STROKE = (d, w = W) => `<path d="${d}" fill="none" stroke="${RED}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`
/* a box drawn as edges only: the top face, the three visible verticals, and the two bottom edges */
function boxOutline (r, h) {
  return [
    STROKE(poly([r.T, r.R, r.F, r.L])),
    STROKE(line(r.L, down(r.L, h))), STROKE(line(r.F, down(r.F, h))), STROKE(line(r.R, down(r.R, h))),
    STROKE(line(down(r.L, h), down(r.F, h))), STROKE(line(down(r.F, h), down(r.R, h))),
  ]
}
/* a line across both front faces at one height: what a rack unit, a seam or a weld reads as */
const across = (r, y, w = 2.2) => [STROKE(line(down(r.L, y), down(r.F, y)), w), STROKE(line(down(r.F, y), down(r.R, y)), w)]
/* a cylinder as edges: the top ellipse, the two side verticals and the bottom arc */
function cylOutline (cx, cy, rr, h) {
  const rx = rr * 1.414, ry = rr * 0.707
  return [
    `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" ${ST}/>`,
    STROKE(line([cx - rx, cy], [cx - rx, cy + h])), STROKE(line([cx + rx, cy], [cx + rx, cy + h])),
    STROKE(`M${n(cx - rx)} ${n(cy + h)}A${n(rx)} ${n(ry)} 0 0 0 ${n(cx + rx)} ${n(cy + h)}`),
  ]
}
const ringLine = (cx, cy, rr, y) => STROKE(`M${n(cx - rr * 1.414)} ${n(cy + y)}A${n(rr * 1.414)} ${n(rr * 0.707)} 0 0 0 ${n(cx + rr * 1.414)} ${n(cy + y)}`, 2.2)

/* 23 Sep, third reference (Bazil sent isometric line icon sheets and a sheet of detailed isometric BUILDING types):
   each market is now the FACILITY IAQ builds for it, drawn in red line work with a few solid red accents. Still one
   colour, still the logo's 2:1 dimetric, still one moving part each. */
const plate = (cx, cy, A, B, t = 4) => [
  STROKE(poly([plan(cx, cy, A, B).T, plan(cx, cy, A, B).R, plan(cx, cy, A, B).F, plan(cx, cy, A, B).L])),
  STROKE(line(plan(cx, cy, A, B).L, down(plan(cx, cy, A, B).L, t))),
  STROKE(line(plan(cx, cy, A, B).F, down(plan(cx, cy, A, B).F, t))),
  STROKE(line(plan(cx, cy, A, B).R, down(plan(cx, cy, A, B).R, t))),
  STROKE(line(down(plan(cx, cy, A, B).L, t), down(plan(cx, cy, A, B).F, t))),
  STROKE(line(down(plan(cx, cy, A, B).F, t), down(plan(cx, cy, A, B).R, t))),
]
/* windows or louvres: short parallel cuts down one face */
const facade = (r, h, rows, cols, face = 'L') => {
  const O = [], a = face === 'L' ? r.L : r.R, b = r.F
  for (let i = 1; i <= cols; i++) for (let j = 1; j <= rows; j++) {
    const p = lerp(a, b, i / (cols + 1))
    O.push(STROKE(line(down(p, 4 + (j - 1) * (h / rows)), down(p, 4 + (j - 1) * (h / rows) + h / (rows * 1.8))), 2.2))
  }
  return O
}
/* a stack, a vent or a mast standing on a face */
const stack = (p, h, w = 2.6) => [STROKE(line(p, down(p, -h)), w), STROKE(`M${n(p[0] - 3)} ${n(p[1] - h)}L${n(p[0] + 3)} ${n(p[1] - h)}`, 2.2)]

/* 23 Sep, fourth cut (Bazil: "red colour only", "but detailed", "the blocky boring shapes too much i dont like"):
   buildings are blocks, so the marks are the EQUIPMENT now: a process tool, an open rack, a battery pack, a tracker,
   a chiller skid, a bioreactor, a filling line. One red, line work, and the detail is the point: ladders, railings,
   ribs, valves, flanges and pipe runs. One small solid red part each, and it is the part that moves. */
const T1 = 2.0, T2 = 1.5   /* the two light weights the detail is drawn with */
/* a run of pipe with a flange at each end */
const pipeRun = (a, b, w = 2.6) => [STROKE(line(a, b), w), STROKE(line([a[0] - 2, a[1] - 1], [a[0] + 2, a[1] + 1]), T1), STROKE(line([b[0] - 2, b[1] - 1], [b[0] + 2, b[1] + 1]), T1)]
/* a valve: a small circle on a line, the way a P&ID draws one */
const valve = (x, y, r = 2.4) => [`<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="none" stroke="${RED}" stroke-width="${T1}"/>`, STROKE(line([x, y - r - 2], [x, y - r]), T2)]
/* a ladder up a vessel or a stack */
const ladder = (x, y, h, w = 4) => {
  const O = [STROKE(line([x - w / 2, y], [x - w / 2, y - h]), T2), STROKE(line([x + w / 2, y], [x + w / 2, y - h]), T2)]
  for (let i = 1; i * 4 < h; i++) O.push(STROKE(line([x - w / 2, y - i * 4], [x + w / 2, y - i * 4]), T2))
  return O
}
/* a handrail round a deck: posts and a top rail */
const rail = (r, h = 5) => {
  const O = [STROKE(line(down(r.L, -h), down(r.F, -h)), T2), STROKE(line(down(r.F, -h), down(r.R, -h)), T2)]
  for (const p of [r.L, lerp(r.L, r.F, .5), r.F, lerp(r.F, r.R, .5), r.R]) O.push(STROKE(line(p, down(p, -h)), T2))
  return O
}
/* the ribs round a vessel: three arcs across its face */
const ribs = (cx, cy, rr, ys) => ys.map(y => ringLine(cx, cy, rr, y))

export const FLAT_MARKS = [
  {
    slot: 'sem', title: 'Semiconductor',
    /* a process tool: the chamber on its frame, the load port with a wafer cassette, the transfer arm */
    body: () => {
      const O = []
      /* the chamber */
      O.push(...cylOutline(58, 30, 11, 16))
      O.push(ringLine(58, 30, 11, 8))
      O.push(...ladder(74, 62, 16))
      /* the frame under it */
      const base = plan(52, 62, 17, 12)
      O.push(...boxOutline(base, 10))
      O.push(...across(base, 5))
      /* the load port and its cassette, the one solid part */
      const port = plan(24, 56, 8, 6)
      O.push(...boxOutline(port, 12))
      O.push(`<g class="mk-mv">`)
      O.push(`<path d="${poly([plan(24, 50, 6, 4).T, plan(24, 50, 6, 4).R, plan(24, 50, 6, 4).F, plan(24, 50, 6, 4).L])}" fill="${RED}"/>`)
      O.push(`</g>`)
      /* the transfer arm between them */
      O.push(...pipeRun([32, 48], [48, 40], 2.2))
      O.push(...valve(40, 44))
      return O
    },
  },
  {
    slot: 'dat', title: 'Data Centre',
    /* an open rack: the posts, the rails, the servers on them, the loom down the side, one unit lit */
    body: () => {
      const O = [], r = plan(48, 22, 13, 10), H = 46
      /* the four posts */
      for (const p of [r.T, r.R, r.F, r.L]) O.push(STROKE(line(p, down(p, H)), T1))
      O.push(STROKE(poly([r.T, r.R, r.F, r.L])))
      O.push(STROKE(line(down(r.L, H), down(r.F, H))), STROKE(line(down(r.F, H), down(r.R, H))))
      /* the servers: each one a thin slab between the posts */
      for (let i = 0; i < 5; i++) {
        const y = 7 + i * 8
        const a = down(r.L, y), b = down(r.F, y), c = down(r.R, y)
        O.push(STROKE(line(a, b), T1), STROKE(line(b, c), T1))
        O.push(STROKE(line(down(a, 3.4), down(b, 3.4)), T2), STROKE(line(down(b, 3.4), down(c, 3.4)), T2))
        O.push(STROKE(line(down(b, .6), down(b, 3)), T2))
      }
      /* the loom of cable down the back right */
      O.push(STROKE(`M${n(r.R[0] + 1)} ${n(r.R[1] + 8)}C${n(r.R[0] + 9)} ${n(r.R[1] + 16)} ${n(r.R[0] + 7)} ${n(r.R[1] + 30)} ${n(r.R[0] + 1)} ${n(r.R[1] + 40)}`, T2))
      /* the lit unit */
      const p = lerp(down(r.F, 24), down(r.L, 24), .2), q = lerp(down(r.F, 24), down(r.L, 24), .8)
      O.push(`<g class="mk-mv"><path d="${poly([p, q, down(q, 3.2), down(p, 3.2)])}" fill="${RED}"/></g>`)
      return O
    },
  },
  {
    slot: 'ev', title: 'EV Battery',
    /* a battery pack: the tray, its cells in two rows, the busbar across them, the terminal solid */
    body: () => {
      const O = [], tray = plan(48, 46, 20, 13)
      O.push(...boxOutline(tray, 11))
      O.push(...across(tray, 6))
      /* the cells */
      for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) {
        const u = -13 + i * 8.6, v = -6 + j * 12
        const cx = 48 + (u - v), cy = 46 + (u + v) / 2
        O.push(...cylOutline(cx, cy - 7, 2.6, 7))
      }
      /* the busbar over the near row */
      O.push(...pipeRun([34, 52], [62, 38], 2.2))
      /* the terminal */
      O.push(`<g class="mk-mv"><ellipse cx="66" cy="36" rx="4.2" ry="2.1" fill="${RED}"/></g>`)
      O.push(...valve(30, 55))
      return O
    },
  },
  {
    slot: 'pv', title: 'Photovoltaics',
    /* a tracker: the array on its torque tube, the drive, the truss legs, the sun */
    body: () => {
      const O = [], p0 = plan(50, 56, 21, 12), lift = 16
      const T = down(p0.T, -lift), R = down(p0.R, -lift), F = p0.F, L = p0.L
      /* the torque tube and its legs */
      const m1 = lerp(T, L, .5), m2 = lerp(R, F, .5)
      O.push(STROKE(line(m1, m2), 2.4))
      for (const q of [m1, lerp(m1, m2, .5), m2]) {
        O.push(STROKE(line(q, down(q, 16)), T1))
        O.push(STROKE(line(down(q, 16), [q[0] - 5, q[1] + 20]), T2), STROKE(line(down(q, 16), [q[0] + 5, q[1] + 20]), T2))
      }
      /* the array: its frame and its cells */
      O.push(STROKE(poly([T, R, F, L])))
      for (const k of [.2, .4, .6, .8]) O.push(STROKE(line(lerp(T, R, k), lerp(L, F, k)), T2))
      O.push(STROKE(line(lerp(T, L, .5), lerp(R, F, .5)), T2))
      /* the drive and the sun */
      O.push(...valve(lerp(m1, m2, .5)[0], lerp(m1, m2, .5)[1] + 8, 3))
      O.push(`<g class="mk-mv"><circle cx="22" cy="22" r="7" fill="${RED}"/></g>`)
      return O
    },
  },
  {
    slot: 'dch', title: 'District Cooling &amp; Heating',
    /* a chiller skid: the cooling tower with its fan and ladder, the chiller barrel, the pumps and the header */
    body: () => {
      const O = []
      /* the tower */
      const tw = plan(64, 26, 11, 10)
      O.push(...boxOutline(tw, 22))
      O.push(...across(tw, 10)); O.push(...across(tw, 16))
      O.push(`<ellipse cx="64" cy="26" rx="${n(7 * 1.414)}" ry="${n(7 * .707)}" ${ST}/>`)
      O.push(`<g class="mk-mv"><g transform="translate(64 26) scale(1 .5)">` +
        [0, 60, 120, 180, 240, 300].map(d => `<path d="M0 0L-3 -8.6L1.5 -9Z" fill="${RED}" transform="rotate(${d})"/>`).join('') +
        `<circle r="1.8" fill="${RED}"/></g></g>`)
      O.push(...ladder(80, 60, 20))
      /* the chiller barrel on its saddles */
      O.push(...cylOutline(28, 50, 8, 14))
      O.push(ringLine(28, 50, 8, 7))
      O.push(STROKE(line([28 - 11, 64], [28 - 7, 70]), T2), STROKE(line([28 + 11, 64], [28 + 7, 70]), T2))
      /* the pumps and the header between them */
      O.push(...pipeRun([40, 60], [56, 52], 2.6))
      O.push(...valve(48, 56))
      O.push(...cylOutline(44, 70, 3.4, 5))
      O.push(...cylOutline(54, 75, 3.4, 5))
      return O
    },
  },
  {
    slot: 'bio', title: 'Bio LifeScience',
    /* a bioreactor: the vessel on its legs, the jacket ribs, the agitator drive on top, the sample port solid */
    body: () => {
      const O = [], cx = 46, cy = 26, rr = 13, H = 34
      O.push(...cylOutline(cx, cy, rr, H))
      O.push(...ribs(cx, cy, rr, [11, 22]))
      /* the dished bottom and the legs */
      O.push(STROKE(`M${n(cx - rr * 1.414)} ${n(cy + H)}A${n(rr * 1.414)} ${n(rr * .9)} 0 0 0 ${n(cx + rr * 1.414)} ${n(cy + H)}`, T1))
      for (const dx of [-12, 12]) O.push(STROKE(line([cx + dx, cy + H + 4], [cx + dx * 1.2, cy + H + 14]), T1))
      /* the agitator drive */
      O.push(...cylOutline(cx, cy - 9, 3.4, 8))
      O.push(STROKE(line([cx, cy], [cx, cy + 20]), T2))
      for (const y of [16, 20]) O.push(STROKE(line([cx - 6, cy + y], [cx + 6, cy + y - 2]), T2))
      /* the pipework */
      O.push(...pipeRun([cx + rr * 1.414 - 2, cy + 14], [cx + rr * 1.414 + 12, cy + 8], 2.4))
      O.push(...valve(cx + rr * 1.414 + 6, cy + 11))
      /* the sample port */
      O.push(`<g class="mk-mv"><ellipse cx="${n(cx - rr * 1.414 + 3)}" cy="${n(cy + 26)}" rx="3.6" ry="1.8" fill="${RED}"/></g>`)
      return O
    },
  },
  {
    slot: 'fnb', title: 'Food &amp; Beverage',
    /* a filling line: the conveyor on its frame, the filler head over it, bottles along it, the full one solid */
    body: () => {
      const O = [], belt = plan(46, 62, 24, 6)
      O.push(...boxOutline(belt, 4))
      for (const k of [.2, .4, .6, .8]) O.push(STROKE(line(lerp(belt.T, belt.R, k), lerp(belt.L, belt.F, k)), T2))
      /* the frame legs */
      for (const q of [lerp(belt.L, belt.F, .15), lerp(belt.L, belt.F, .85)]) {
        O.push(STROKE(line(down(q, 4), down(q, 14)), T1))
        O.push(STROKE(line(down(q, 14), [q[0] + 6, q[1] + 17]), T2))
      }
      /* the filler head over the line */
      const head = plan(52, 34, 9, 6)
      O.push(...boxOutline(head, 7))
      for (const dx of [-5, 0, 5]) O.push(STROKE(line([52 + dx, 43], [52 + dx, 49]), T2))
      O.push(...pipeRun([44, 30], [26, 24], 2.2))
      /* the bottles */
      for (const [u, solid] of [[-14, false], [-2, true], [10, false]]) {
        const cx = 46 + u, cy = 62 + u / 2
        O.push(...cylOutline(cx, cy - 12, 3, 9))
        O.push(STROKE(line([cx - 1.6, cy - 12], [cx - 1.6, cy - 16]), T2), STROKE(line([cx + 1.6, cy - 12], [cx + 1.6, cy - 16]), T2))
        if (solid) O.push(`<g class="mk-mv"><path d="M${n(cx - 3 * 1.414)} ${n(cy - 8)}A${n(3 * 1.414)} ${n(3 * .707)} 0 0 0 ${n(cx + 3 * 1.414)} ${n(cy - 8)}V${n(cy - 3)}A${n(3 * 1.414)} ${n(3 * .707)} 0 0 1 ${n(cx - 3 * 1.414)} ${n(cy - 3)}Z" fill="${RED}"/></g>`)
      }
      return O
    },
  },
]
const wrap = m => `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" class="iaq-fm fm-${m.slot}" aria-hidden="true" focusable="false"><title>${m.title}</title>${m.body().join('')}</svg>`

export function emitReact () {
  const parts = FLAT_MARKS.map(m => {
    const name = 'Fm' + m.slot[0].toUpperCase() + m.slot.slice(1)
    let svg = wrap(m).replace(/([a-zA-Z-]+)=/g, (x, a) => ({ 'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin', 'fill-rule': 'fillRule', 'class': 'className' }[a] || a) + '=')
    svg = svg.replace(`className="iaq-fm fm-${m.slot}"`, `className={'iaq-fm fm-${m.slot}' + (p.className ? ' ' + p.className : '')}`)
    svg = svg.replace('<svg ', '<svg {...p} ')
    return `export function ${name} (p) {\n  return (\n    ${svg}\n  )\n}`
  })
  return `/* GENERATED by scripts_marks_flat.mjs --react. Do not edit by hand.
   The seven market marks in the LOGO's own grammar (23 Sep 2026): one flat IAQ red, stacked bands with the ground
   showing between them, open outlined tops, one solid moving part each (.mk-mv, home.css hmk* keyframes). */
import React from 'react'

${parts.join('\n\n')}

export const FLAT_MARK = { 'mkt-semiconductor': FmSem, 'mkt-data-centre': FmDat, 'mkt-ev-battery': FmEv, 'mkt-photovoltaics': FmPv, 'mkt-district-cooling': FmDch, 'mkt-bio-lifescience': FmBio, 'mkt-food-beverage': FmFnb }
`
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === '--react') { process.stdout.write(emitReact()); process.exit(0) }
  if (process.argv[2] === '--svg') {
    const out = process.argv[3] || '.marks'
    fs.mkdirSync(out, { recursive: true })
    for (const m of FLAT_MARKS) fs.writeFileSync(path.join(out, `fm-${m.slot}.svg`), wrap(m))
    console.log('wrote', FLAT_MARKS.length)
  }
}
