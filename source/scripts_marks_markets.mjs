/* IAQ "Hard Anodise" marks for the seven markets (22 Sep 2026). Bazil, on the hero's market row: "list all seven
   markets but put isometric detailed icons instead across, make it look good", then "do better icons, quality
   better icons or isometric 3d animated".

   The same system as the stat and delivery-cycle marks (scripts_marks_build.mjs): one camera (2:1 dimetric), one
   lamp (userSpaceOnUse 21,0 -> 75,96 on every face), the anodised greys, and exactly one signal-red working part.
   Each mark wraps the part that moves in .mk-mv; the motion itself lives in home.css (the hmk* keyframes).

   node scripts_marks_markets.mjs --svg <dir>     one SVG per market, for review
   node scripts_marks_markets.mjs --react         src/components/MarketMarks.jsx  */
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import { P, plan, groove, bodyGrad, buildMark, toJSX } from './scripts_marks_build.mjs'

const n = v => (Math.round(v * 100) / 100).toString()
const poly = pts => 'M' + pts.map(p => n(p[0]) + ' ' + n(p[1])).join('L') + 'Z'
const seg = (p, q) => 'M' + n(p[0]) + ' ' + n(p[1]) + 'L' + n(q[0]) + ' ' + n(q[1])
const down = (p, t) => [p[0], p[1] + t]
const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]
const S = 'stroke-linecap="square" stroke-linejoin="miter" fill="none"'
const SIG = id => bodyGrad(id, 'sig', P.SIG_LIT, P.SIG_SHADE)

/* a solid block drawn by hand (for objects that are not stacked from the ground): two visible walls, the lit top,
   and the system's chamfers on the front edges */
function block (id, k, r, t, { top = true } = {}) {
  const O = []
  O.push(`<path d="${poly([[r.R[0], r.R[1] - 1.5], [r.F[0], r.F[1] - 1.5], down(r.F, t), down(r.R, t)])}" fill="url(#${id}-${k}r)"/>`)
  O.push(`<path d="${poly([[r.F[0], r.F[1] - 1.5], [r.L[0], r.L[1] - 1.5], down(r.L, t), down(r.F, t)])}" fill="url(#${id}-${k}l)"/>`)
  if (top) O.push(`<path d="${poly([r.T, r.R, r.F, r.L])}" fill="url(#${id}-${k}t)"/>`)
  O.push(`<path d="${seg(r.F, r.L)}" stroke="${P.CHAM_L}" stroke-width="2" ${S}/>`)
  O.push(`<path d="${seg(r.R, r.F)}" stroke="${P.CHAM_R}" stroke-width="1.8" ${S}/>`)
  return O
}
const blockDefs = (id, k) => [
  bodyGrad(id, k + 'r', P.RGT_HI, P.RGT_LO), bodyGrad(id, k + 'l', P.LFT_HI, P.LFT_LO), bodyGrad(id, k + 't', P.TOP_HI, P.TOP_LO),
]
/* a vertical cylinder: plan radius r projects to an ellipse rx = 1.414r, ry = .707r */
function cylinder (id, k, cx, cy, r, h, { cap = true } = {}) {
  const rx = r * 1.414, ry = r * 0.707
  const O = []
  O.push(`<path d="M${n(cx - rx)} ${n(cy)}V${n(cy + h)}A${n(rx)} ${n(ry)} 0 0 0 ${n(cx + rx)} ${n(cy + h)}V${n(cy)}Z" fill="url(#${id}-${k}b)"/>`)
  if (cap) O.push(`<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="url(#${id}-${k}t)"/>`)
  O.push(`<path d="M${n(cx - rx * .96)} ${n(cy + ry * .3)}A${n(rx)} ${n(ry)} 0 0 0 ${n(cx - rx * .2)} ${n(cy + ry * .98)}" stroke="${P.CHAM_L}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`)
  return O
}
/* a cylinder's body shades across its width: lit left, falling into the right */
const cylDefs = (id, k) => [
  `<linearGradient id="${id}-${k}b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${P.LFT_HI}"/><stop offset=".35" stop-color="${P.TOP_LO}"/><stop offset=".75" stop-color="${P.RGT_HI}"/><stop offset="1" stop-color="${P.RGT_LO}"/></linearGradient>`,
  bodyGrad(id, k + 't', P.TOP_HI, P.TOP_LO),
]
const pool = (id, cx, cy, rx) => [
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(rx * .32)}" fill="url(#${id}-gnd)"/>`,
]

export const MARKET_MARKS = [
  {
    slot: 'sem', title: 'Semiconductor',
    /* a chip on its board: the package with a row of legs, the die in red, lifting as if placed */
    masses: [], ground: { rx: 32, cy: 70, line: false },
    custom: id => {
      const O = [], D = [...blockDefs(id, 'b'), ...blockDefs(id, 'c'), SIG(id)]
      const board = plan(48, 50, 17, 17), chip = plan(48, 42, 9.5, 9.5)
      O.push(...block(id, 'b', board, 4))
      /* traces on the board, cut in */
      for (const k of [0.2, 0.8]) {
        O.push(...groove(seg(lerp(board.L, board.F, k), lerp(chip.L, chip.F, k))))
        O.push(...groove(seg(lerp(board.R, board.F, k), lerp(chip.R, chip.F, k))))
      }
      /* the package, standing on its legs */
      for (let i = 1; i < 6; i++) {
        const a = lerp(chip.L, chip.F, i / 6), b = lerp(chip.F, chip.R, i / 6)
        O.push(`<path d="${seg(down(a, 2), down(a, 7))}" stroke="${P.RGT_LO}" stroke-width="1.5" ${S}/>`)
        O.push(`<path d="${seg(down(b, 2), down(b, 7))}" stroke="${P.RGT_LO}" stroke-width="1.5" ${S}/>`)
      }
      O.push(...block(id, 'c', chip, 4))
      /* the die, the one red part */
      const die = plan(48, 36, 4.2, 4.2)
      O.push(`<g class="mk-mv">`)
      O.push(`<path d="${poly([die.R, die.F, down(die.F, 2.5), down(die.R, 2.5)])}" fill="${P.SIG_DEEP}"/>`)
      O.push(`<path d="${poly([die.F, die.L, down(die.L, 2.5), down(die.F, 2.5)])}" fill="${P.SIG_SHADE}"/>`)
      O.push(`<path d="${poly([die.T, die.R, die.F, die.L])}" fill="url(#${id}-sig)"/>`)
      O.push(`<path d="${seg(die.F, die.L)}" stroke="${P.SIG_CHAM_L}" stroke-width="1.3" ${S}/>`)
      O.push(`</g>`)
      return { defs: D, body: O }
    },
  },
  {
    slot: 'dat', title: 'Data Centre',
    /* two server racks side by side, rack units cut into the faces, a status strip that steps through */
    masses: [], ground: { rx: 34, cy: 80, line: false },
    custom: id => {
      const O = [], D = [...blockDefs(id, 'r'), SIG(id)]
      const racks = [plan(36, 22, 8.5, 8.5), plan(60, 34, 8.5, 8.5)]
      const H = 38
      racks.forEach((r, ri) => {
        O.push(...block(id, 'r', r, H))
        /* rack units on the front (screen-left) face: rows parallel to its top edge */
        for (let u = 1; u < 8; u++) {
          const y = 3 + u * 4.4
          O.push(...groove(seg(down(r.F, y), down(r.L, y))))
        }
        /* the door seam and handle on the right face */
        O.push(...groove(seg(down(lerp(r.R, r.F, .5), 4), down(lerp(r.R, r.F, .5), H - 4))))
      })
      /* status lights on the near rack, the one red part, stepping one after another */
      const r = racks[1]
      O.push(`<g class="mk-mv">`)
      for (let i = 0; i < 4; i++) {
        const a = down(lerp(r.F, r.L, .18 + i * .17), 6.5), b = down(lerp(r.F, r.L, .28 + i * .17), 6.5)
        O.push(`<path class="mk-led mk-led${i}" d="${poly([a, b, down(b, 2.4), down(a, 2.4)])}" fill="url(#${id}-sig)"/>`)
      }
      O.push(`</g>`)
      return { defs: D, body: O }
    },
  },
  {
    slot: 'ev', title: 'EV Battery',
    /* a battery module: the cells in their tray, a charge gauge on the front face that fills */
    masses: [], ground: { rx: 32, cy: 72, line: false },
    custom: id => {
      const O = [], D = [...blockDefs(id, 't'), ...cylDefs(id, 'c'), SIG(id)]
      const tray = plan(48, 44, 20, 11)
      O.push(...block(id, 't', tray, 14))
      /* the cells, two rows of four, standing in the tray */
      for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) {
        const u = -15 + i * 10, v = -5.5 + j * 11
        const cx = 48 + (u - v), cy = 44 + (u + v) / 2
        O.push(...cylinder(id, 'c', cx, cy - 5, 3.2, 5))
        O.push(`<ellipse cx="${n(cx)}" cy="${n(cy - 5)}" rx="1.6" ry=".8" fill="${P.RGT_HI}"/>`)
      }
      /* the charge gauge: four cells of a bar on the front (screen-left) face */
      O.push(`<g class="mk-mv">`)
      for (let i = 0; i < 4; i++) {
        const a = down(lerp(tray.L, tray.F, .14 + i * .19), 5), b = down(lerp(tray.L, tray.F, .28 + i * .19), 5)
        O.push(`<path class="mk-bar mk-bar${i}" d="${poly([a, b, down(b, 4.5), down(a, 4.5)])}" fill="url(#${id}-sig)"/>`)
      }
      O.push(`</g>`)
      return { defs: D, body: O }
    },
  },
  {
    slot: 'pv', title: 'Photovoltaics',
    /* a solar panel tilted to the sun on two legs, its cells cut in, the sun in red, rising */
    masses: [], ground: { rx: 30, cy: 74, line: false },
    custom: id => {
      const O = [], D = [bodyGrad(id, 'pf', P.TOP_HI, P.TOP_LO), bodyGrad(id, 'pe', P.RGT_HI, P.RGT_LO), bodyGrad(id, 'leg', P.LFT_HI, P.RGT_LO), SIG(id)]
      const p0 = plan(50, 52, 19, 12)
      const lift = 13
      const T = down(p0.T, -lift), R = down(p0.R, -lift), F = p0.F, L = p0.L
      /* legs under the raised back edge */
      for (const q of [lerp(T, L, .1), lerp(R, F, .1)]) O.push(`<path d="${seg(q, down(q, lift + 12))}" stroke="url(#${id}-leg)" stroke-width="3" ${S}/>`)
      O.push(`<path d="${seg(down(L, 0), down(L, 12))}" stroke="url(#${id}-leg)" stroke-width="3" ${S}/>`)
      O.push(`<path d="${seg(down(F, 0), down(F, 12))}" stroke="url(#${id}-leg)" stroke-width="3" ${S}/>`)
      /* the panel: its front edge thickness, then the face */
      O.push(`<path d="${poly([R, F, down(F, 3), down(R, 3)])}" fill="url(#${id}-pe)"/>`)
      O.push(`<path d="${poly([F, L, down(L, 3), down(F, 3)])}" fill="${P.LFT_LO}"/>`)
      O.push(`<path d="${poly([T, R, F, L])}" fill="url(#${id}-pf)"/>`)
      /* the cells: a 4 x 3 grid */
      for (let i = 1; i < 4; i++) O.push(...groove(seg(lerp(T, R, i / 4), lerp(L, F, i / 4))))
      for (let j = 1; j < 3; j++) O.push(...groove(seg(lerp(T, L, j / 3), lerp(R, F, j / 3))))
      O.push(`<path d="${seg(F, L)}" stroke="${P.CHAM_L}" stroke-width="2" ${S}/>`)
      /* the sun */
      O.push(`<g class="mk-mv">`)
      O.push(`<circle cx="23" cy="24" r="7.5" fill="url(#${id}-sig)"/>`)
      O.push(`<path d="M17.2 21A7.5 7.5 0 0 1 23.4 16.5" stroke="${P.SIG_CHAM_L}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`)
      O.push(`</g>`)
      return { defs: D, body: O }
    },
  },
  {
    slot: 'dch', title: 'District Cooling &amp; Heating',
    /* a cooling tower: the casing, the fan turning in its shroud on top, the red supply pipe out of the side */
    masses: [], ground: { rx: 30, cy: 74, line: false },
    custom: id => {
      const O = [], D = [...blockDefs(id, 'k'), bodyGrad(id, 'fan', P.RGT_HI, P.RGT_LO), SIG(id)]
      const box = plan(46, 34, 12, 12)
      /* the red pipe runs out of the right face and turns down */
      const pa = down(lerp(box.R, box.F, .5), 16)
      O.push(`<path d="M${n(pa[0])} ${n(pa[1])}L${n(pa[0] + 14)} ${n(pa[1] - 7)}L${n(pa[0] + 14)} ${n(pa[1] + 14)}" stroke="${P.SIG_DEEP}" stroke-width="6.5" fill="none" stroke-linejoin="round" transform="translate(0 1.4)"/>`)
      O.push(`<path d="M${n(pa[0])} ${n(pa[1])}L${n(pa[0] + 14)} ${n(pa[1] - 7)}L${n(pa[0] + 14)} ${n(pa[1] + 14)}" stroke="url(#${id}-sig)" stroke-width="6.5" fill="none" stroke-linejoin="round"/>`)
      O.push(...block(id, 'k', box, 32))
      /* louvres on the front face */
      for (let u = 0; u < 5; u++) O.push(...groove(seg(down(lerp(box.F, box.L, .12), 10 + u * 4), down(lerp(box.F, box.L, .88), 10 + u * 4))))
      /* the fan shroud and the fan */
      O.push(`<ellipse cx="46" cy="34" rx="15" ry="7.5" fill="${P.RGT_LO}"/>`)
      O.push(`<ellipse cx="46" cy="34" rx="15" ry="7.5" fill="none" stroke="${P.CHAM_L}" stroke-width="1.5"/>`)
      O.push(`<g transform="translate(46 34) scale(1 .5)"><g class="mk-mv">`)
      for (let b = 0; b < 4; b++) O.push(`<path d="M0 0L-3.4 -12.5Q0 -14.4 3.4 -12.5Z" fill="url(#${id}-fan)" transform="rotate(${b * 90})"/>`)
      O.push(`<circle r="3" fill="${P.TOP_HI}"/>`)
      O.push(`</g></g>`)
      return { defs: D, body: O }
    },
  },
  {
    slot: 'bio', title: 'Bio LifeScience',
    /* a laboratory flask on a plinth, the liquid in red, bubbles rising through it */
    masses: [], ground: { rx: 26, cy: 76, line: false },
    custom: id => {
      const O = [], D = [...blockDefs(id, 'p'),
        `<linearGradient id="${id}-gl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E4EAF3"/><stop offset=".45" stop-color="${P.TOP_HI}"/><stop offset="1" stop-color="${P.LFT_LO}"/></linearGradient>`, SIG(id)]
      const base = plan(48, 66, 13, 13)
      O.push(...block(id, 'p', base, 5))
      /* the flask: neck, shoulders, a wide foot sitting on the plinth */
      const fl = 'M42 16H54V20H52.5V34L67 60Q68.5 64.5 64 65H32Q27.5 64.5 29 60L43.5 34V20H42Z'
      O.push(`<path d="${fl}" fill="url(#${id}-gl)"/>`)
      /* the liquid, the one red part */
      const liq = 'M37.4 46H58.6L67 60Q68.5 64.5 64 65H32Q27.5 64.5 29 60Z'
      O.push(`<path d="${liq}" fill="url(#${id}-sig)"/>`)
      O.push(`<path d="M37.4 46H58.6" stroke="${P.SIG_CHAM_L}" stroke-width="1.4"/>`)
      O.push(`<g class="mk-mv">`)
      for (const [x, y, r] of [[44, 58, 1.7], [51, 55, 1.3], [47.5, 51, 1]]) O.push(`<circle class="mk-bub" cx="${x}" cy="${y}" r="${r}" fill="#FFD4D1"/>`)
      O.push(`</g>`)
      O.push(`<path d="${fl}" fill="none" stroke="${P.RGT_HI}" stroke-width="1.4"/>`)
      O.push(`<path d="M45.5 22V35L32 59" fill="none" stroke="#fff" stroke-width="1.4" opacity=".75" stroke-linecap="round"/>`)
      return { defs: D, body: O }
    },
  },
  {
    slot: 'fnb', title: 'Food &amp; Beverage',
    /* a conveyor with bottles moving along it, one capped in red */
    masses: [], ground: { rx: 34, cy: 72, line: false },
    custom: id => {
      const O = [], D = [...blockDefs(id, 'v'), ...cylDefs(id, 'b'), SIG(id)]
      const belt = plan(48, 54, 26, 7)
      O.push(...block(id, 'v', belt, 8))
      /* the rollers, cut across the belt */
      for (let i = 1; i < 8; i++) O.push(...groove(seg(lerp(belt.T, belt.R, i / 8), lerp(belt.L, belt.F, i / 8))))
      /* legs */
      for (const q of [lerp(belt.L, belt.F, .1), lerp(belt.L, belt.F, .9)]) O.push(`<path d="${seg(down(q, 8), down(q, 18))}" stroke="${P.RGT_LO}" stroke-width="2.6" ${S}/>`)
      /* the bottles ride along the belt, following its slope */
      O.push(`<g class="mk-mv">`)
      for (const [u, red] of [[-15, false], [0, true], [15, false]]) {
        const cx = 48 + u, cy = 54 + u / 2
        O.push(...cylinder(id, 'b', cx, cy - 17, 3.6, 15))
        O.push(`<path d="M${n(cx - 2)} ${n(cy - 17)}V${n(cy - 23)}H${n(cx + 2)}V${n(cy - 17)}Z" fill="url(#${id}-bb)"/>`)
        O.push(`<rect x="${n(cx - 2.6)}" y="${n(cy - 26.5)}" width="5.2" height="3.6" fill="${red ? `url(#${id}-sig)` : P.RGT_HI}"/>`)
        O.push(`<path d="M${n(cx - 5.1)} ${n(cy - 10)}H${n(cx + 5.1)}" stroke="${P.COUNTER}" stroke-width="2.6" opacity=".7"/>`)
      }
      O.push(`</g>`)
      return { defs: D, body: O }
    },
  },
  {
    slot: 'yrs', title: 'Years building hi-tech facilities',
    /* for the record, not a market: a desk calendar block, its days cut into the face, the red binding across the top */
    masses: [], ground: { rx: 30, cy: 74, line: false },
    custom: id => {
      const O = [], D = [...blockDefs(id, 'k'), SIG(id)]
      const r = plan(48, 30, 14, 14), H = 34
      O.push(...block(id, 'k', r, H))
      /* the days, a 3 x 3 grid cut into the front (screen-left) face */
      for (let j = 1; j < 4; j++) O.push(...groove(seg(down(lerp(r.F, r.L, .08), 8 + j * 7.5), down(lerp(r.F, r.L, .92), 8 + j * 7.5))))
      for (let i = 1; i < 3; i++) { const q = lerp(r.F, r.L, i / 3); O.push(...groove(seg(down(q, 12), down(q, H - 3)))) }
      /* the binding, the one red part */
      O.push(`<g class="mk-mv">`)
      O.push(`<path d="${poly([r.F, r.L, down(r.L, 6), down(r.F, 6)])}" fill="url(#${id}-sig)"/>`)
      O.push(`<path d="${poly([r.R, r.F, down(r.F, 6), down(r.R, 6)])}" fill="${P.SIG_SHADE}"/>`)
      O.push(`<path d="${seg(r.F, r.L)}" stroke="${P.SIG_CHAM_L}" stroke-width="1.4" ${S}/>`)
      for (const k of [.3, .7]) { const q = lerp(r.F, r.L, k); O.push(`<path d="${seg(down(q, -3), down(q, 3))}" stroke="${P.RGT_LO}" stroke-width="2.4" stroke-linecap="round"/>`) }
      O.push(`</g>`)
      return { defs: D, body: O }
    },
  },
]

/* 23 Sep (Bazil, on the marks over the hero photograph: "looks very dull, flat and not modern ... do your best"): the
   marks are lit for a light page, so on the dark photograph their greys went muddy. The NIGHT set is the same drawing
   with the anodise lifted to bright silver and the edges to white, so each reads crisp against a dark ground. Only
   stop colours change; the geometry, the lamp and the one red part are the same. */
const NIGHT = {
  '#BFC7D5': '#F4F7FB', '#949CAD': '#D3DAE6', '#848DA1': '#C6CEDB', '#666E80': '#9FA9BB',
  '#4C5464': '#8590A4', '#343B49': '#5E687B', '#C8D1E1': '#FFFFFF', '#B2BAC9': '#E8EDF4',
  '#414855': '#707A8D', '#6C7589': '#98A2B5', '#C4CCD8': '#FFFFFF', '#6A7284': '#8E98AB', '#E4EAF3': '#FFFFFF',
}
const toNight = svg => svg.replace(/#[0-9A-Fa-f]{6}/g, h => NIGHT[h.toUpperCase()] || h)

export function emitReact () {
  const parts = MARKET_MARKS.map(m => {
    const name = 'Mk' + m.slot[0].toUpperCase() + m.slot.slice(1)
    let svg = toJSX(buildMark(m)).replace(/iaq-(\w+)-/g, 'iaqm-$1-').replace(/#iaq-/g, '#iaqm-')
    svg = svg.replace('className="iaq-mk"', 'className={' + "'iaq-mk mm-" + m.slot + "' + (p.className ? ' ' + p.className : '')" + '}')
    svg = svg.replace('<svg ', '<svg {...p} ')
    const night = toNight(svg).replace(/iaqm-/g, 'iaqn-').replace("'iaq-mk mm-", "'iaq-mk iaq-night mm-")
    return `export function ${name} (p) {\n  return (\n    ${svg}\n  )\n}\n\nexport function ${name}N (p) {\n  return (\n    ${night}\n  )\n}`
  })
  return `/* GENERATED by scripts_marks_markets.mjs --react. Do not edit by hand.
   The seven market marks in the Hard Anodise system; the part that moves is .mk-mv (home.css hmk* keyframes). */
import React from 'react'

${parts.join('\n\n')}

export const MARKET_MARK = { 'mkt-semiconductor': MkSem, 'mkt-data-centre': MkDat, 'mkt-ev-battery': MkEv, 'mkt-photovoltaics': MkPv, 'mkt-district-cooling': MkDch, 'mkt-bio-lifescience': MkBio, 'mkt-food-beverage': MkFnb }
export { MkYrs as MarkYears }
export const MARKET_MARK_NIGHT = { 'mkt-semiconductor': MkSemN, 'mkt-data-centre': MkDatN, 'mkt-ev-battery': MkEvN, 'mkt-photovoltaics': MkPvN, 'mkt-district-cooling': MkDchN, 'mkt-bio-lifescience': MkBioN, 'mkt-food-beverage': MkFnbN }
`
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === '--react') { process.stdout.write(emitReact()); process.exit(0) }
  if (process.argv[2] === '--svg') {
    const out = process.argv[3] || '.marks'
    fs.mkdirSync(out, { recursive: true })
    for (const m of MARKET_MARKS) fs.writeFileSync(path.join(out, `mk-${m.slot}.svg`), buildMark(m))
    console.log('wrote', MARKET_MARKS.length)
  }
}
