/* IAQ "Hard Anodise" Tier 2 figure marks — generator.
   Emits SVG from a spec tuple per mark rather than hand-authoring eighteen files, because a bounce
   vector computed by hand eighteen times is exactly where a set drifts.

   THE SIX LAWS this generator enforces mechanically:
     1 SLOPE     every silhouette segment is slope 0, inf, +0.5 or -0.5 (b = a/2 on every rhombus)
     2 ONE LAMP  every face gradient is userSpaceOnUse 21,0 -> 75,96. Only stop colours change.
     3 COUNT     tiers step in PLAN, so the count is in the outline and survives the black-fill test
     4 ONE MASS  <= 3 solids, one hero carrying 60-80% of the ink
     5 ONE ACCENT exactly one signal-red functional part
     6 DERIVATION the top-face plan / 4 lands on a Tier 1 icon on the 24 grid

   node scripts_marks_build.mjs [outDir]        emits <outDir>/iaq-<slot>.svg for every mark  */
import fs from 'fs'
import { pathToFileURL } from 'url'
import path from 'path'

/* ---------------------------------------------------------------- palette (spec section 4) */
export const P = {
  SPEC: '#E9EEF6', CHAM_L: '#C8D1E1', CHAM_R: '#B2BAC9',
  TOP_HI: '#BFC7D5', TOP_LO: '#949CAD',
  LFT_HI: '#848DA1', LFT_LO: '#666E80',
  RGT_HI: '#4C5464', RGT_LO: '#343B49',
  BACK: '#414855', BOUNCE: '#6A7284',
  ENGRAVE: '#6C7589', COUNTER: '#C4CCD8',
  INK: '#0C1220',
  SIG_LIT: '#EC2027', SIG_SHADE: '#B5121B', SIG_DEEP: '#7A0C13',
  SIG_CHAM_L: '#FF8F86', SIG_CHAM_R: '#F4595E', SIG_WALL: '#8E0E14',
}
const LIGHT = 'gradientUnits="userSpaceOnUse" x1="21" y1="0" x2="75" y2="96"'
const n = v => (Math.round(v * 100) / 100).toString()

/* ------------------------------------------------------------------- rhombus geometry
   A slab's top face is a rhombus with half-width a and half-height b = a/2, so every edge is
   slope +/-0.5 and Law 1 holds by construction. Extrusion is straight down by t: under a parallel
   projection the extrusion axis projects to a constant screen vector, so no silhouette maths. */
export function rhombus (cx, cy, a) { return plan(cx, cy, a / 2, a / 2) }

/* A RECTANGULAR PLAN, projected. World plan half-extents A along +x and B along +y map to
     sx = (u - v) * 1.0      sy = (u + v) * 0.5
   so the four corners come out as a parallelogram whose every edge is slope +/-0.5 for ANY A and
   B. Law 1 therefore holds for any rectangular footprint, not only for squares, which is what
   lets the set carry wide plates, tall stacks and thin brims without leaving the lattice. */
export function plan (cx, cy, A, B) {
  const T = [cx + (-A + B), cy - (A + B) / 2]   /* back   (-A,-B) */
  const R = [cx + (A + B), cy + (A - B) / 2]    /* right  (+A,-B) */
  const F = [cx + (A - B), cy + (A + B) / 2]    /* front  (+A,+B) */
  const L = [cx + (-A - B), cy + (-A + B) / 2]  /* left   (-A,+B) */
  return { T, R, F, L, cx, cy, A, B, a: A + B, b: (A + B) / 2 }
}
const poly = pts => 'M' + pts.map(p => n(p[0]) + ' ' + n(p[1])).join('L') + 'Z'
const seg = (p, q) => 'M' + n(p[0]) + ' ' + n(p[1]) + 'L' + n(q[0]) + ' ' + n(q[1])
const down = (p, t) => [p[0], p[1] + t]

/* ---------------------------------------------------------------------------- one slab */
function slab (id, r, t, opts = {}) {
  const { top = true, spec = false, chamTop = false } = opts
  const O = []
  const G = []
  /* SEAM RULE: the side quads are drawn with their TOP edge raised 2 units above true geometry;
     the top face is then painted at exact geometry over them and its own anti-aliased edge covers
     the seam, so no background hairline can leak at any device pixel ratio. The bottom edge is
     never oversized, which would bulge the silhouette. */
  const lift = 2
  const Rr = [r.R[0], r.R[1] - lift], Fr = [r.F[0], r.F[1] - lift], Lr = [r.L[0], r.L[1] - lift]
  /* L2a screen-right face (world +x), then L2b screen-left (+y), then L2c the top face */
  O.push(`<path d="${poly([Rr, Fr, down(r.F, t), down(r.R, t)])}" fill="url(#${id}-rgt)"/>`)
  O.push(`<path d="${poly([Fr, Lr, down(r.L, t), down(r.F, t)])}" fill="url(#${id}-lft)"/>`)
  if (top) O.push(`<path d="${poly([r.T, r.R, r.F, r.L])}" fill="url(#${id}-top)"/>`)
  G.push(`<linearGradient id="${id}-rgt" ${LIGHT}><stop offset="0" stop-color="${P.RGT_HI}"/><stop offset="1" stop-color="${P.RGT_LO}"/></linearGradient>`)
  G.push(`<linearGradient id="${id}-lft" ${LIGHT}><stop offset="0" stop-color="${P.LFT_HI}"/><stop offset="1" stop-color="${P.LFT_LO}"/></linearGradient>`)
  if (top) G.push(`<linearGradient id="${id}-top" ${LIGHT}><stop offset="0" stop-color="${P.TOP_HI}"/><stop offset="1" stop-color="${P.TOP_LO}"/></linearGradient>`)
  return { O, G, clipTop: `<clipPath id="${id}-ct"><path d="${poly([r.T, r.R, r.F, r.L])}"/></clipPath>` }
}

/* CHAMFERS. The two FRONT chamfers are the brightest surfaces in the mark and the two BACK
   chamfers among the darkest: that is Lambert on the 45-degree edge normals under a high
   front-left key, and it is what makes a stack countable rather than a flat polygon pile.
   Drawn as strokes centred on the top-face edges and clipped to the top face, so exactly the
   inner half survives. Square caps and miter joins: the Tier 1 stroke rule, unamended. */
function chamfers (id, r, isTop) {
  const w = isTop ? { fl: 3.4, fr: 3.0 } : { fl: 3.2, fr: 2.8 }
  const S = `stroke-linecap="square" stroke-linejoin="miter" fill="none"`
  const out = [
    `<path d="${seg(r.T, r.R)}" stroke="${P.BACK}" stroke-width="2.4" ${S}/>`,
    `<path d="${seg(r.L, r.T)}" stroke="${P.BACK}" stroke-width="2.4" ${S}/>`,
    `<path d="${seg(r.R, r.F)}" stroke="${P.CHAM_R}" stroke-width="${w.fr}" ${S}/>`,
    `<path d="${seg(r.F, r.L)}" stroke="${P.CHAM_L}" stroke-width="${w.fl}" ${S}/>`,
  ]
  if (isTop) {
    /* the entire specular budget: one 1.2u core on the front-left chamfer of the topmost mass,
       offset 0.9 perpendicular into the face. Bead-blasted anodising has no mirror lobe, so there
       is no gloss ellipse anywhere in this system. */
    const dx = r.L[0] - r.F[0], dy = r.L[1] - r.F[1], L = Math.hypot(dx, dy)
    const ox = -dy / L * 0.9, oy = dx / L * 0.9
    out.push(`<path d="${seg([r.F[0] + ox, r.F[1] + oy], [r.L[0] + ox, r.L[1] + oy])}" stroke="${P.SPEC}" stroke-width="1.2" ${S}/>`)
  }
  return out
}

/* AMBIENT OCCLUSION where an upper mass meets a lower one: three strokes along the UPPER mass's
   footprint, clipped to the LOWER mass's top face, so half of each survives and the rest is
   overpainted. That is what makes masses read as touching rather than as stacked stickers. */
function crevice (upper) {
  const p = poly([upper.T, upper.R, upper.F, upper.L])
  const S = `fill="none" stroke-linejoin="miter" stroke="${P.INK}"`
  return [
    `<path d="${p}" ${S} stroke-width="7" opacity=".07"/>`,
    `<path d="${p}" ${S} stroke-width="4" opacity=".11"/>`,
    `<path d="${p}" ${S} stroke-width="1.8" opacity=".22"/>`,
  ]
}

/* THE SIGNAL PART. One per mark, always functional, sitting 3 units proud of its host face with a
   1.1-unit wall on the lower edges: the wall is what makes the red read as a pad milled into the
   surface rather than as a red fill. */
function signal (id, r, proud = 3) {
  const O = [], G = []
  const foot = [down(r.T, 2), down(r.R, 2), down(r.F, 2), down(r.L, 2)]
  O.push(`<path d="${poly(foot)}" fill="${P.INK}" opacity=".22"/>`)
  const Rr = [r.R[0], r.R[1] - 1], Fr = [r.F[0], r.F[1] - 1], Lr = [r.L[0], r.L[1] - 1]
  O.push(`<path d="${poly([Rr, Fr, down(r.F, proud), down(r.R, proud)])}" fill="${P.SIG_DEEP}"/>`)
  O.push(`<path d="${poly([Fr, Lr, down(r.L, proud), down(r.F, proud)])}" fill="${P.SIG_SHADE}"/>`)
  O.push(`<path d="${poly([r.T, r.R, r.F, r.L])}" fill="url(#${id}-sig)"/>`)
  const S = `stroke-linecap="square" stroke-linejoin="miter" fill="none"`
  O.push(`<g clip-path="url(#${id}-sc)">`)
  O.push(`<path d="${seg(r.R, r.F)}" stroke="${P.SIG_CHAM_R}" stroke-width="1.3" ${S}/>`)
  O.push(`<path d="${seg(r.F, r.L)}" stroke="${P.SIG_CHAM_L}" stroke-width="1.6" ${S}/>`)
  O.push(`<path d="${seg(r.T, r.R)}" stroke="${P.SIG_WALL}" stroke-width="1.3" ${S}/>`)
  O.push(`<path d="${seg(r.L, r.T)}" stroke="${P.SIG_WALL}" stroke-width="1.3" ${S}/>`)
  O.push(`</g>`)
  G.push(`<linearGradient id="${id}-sig" ${LIGHT}><stop offset="0" stop-color="${P.SIG_LIT}"/><stop offset="1" stop-color="${P.SIG_SHADE}"/></linearGradient>`)
  return { O, G, clip: `<clipPath id="${id}-sc"><path d="${poly([r.T, r.R, r.F, r.L])}"/></clipPath>` }
}

/* incised V-groove: the dark cut plus a counter-line offset by exactly the light direction, which
   is what reads as cut rather than printed. Monochrome always — red is inlaid, never engraved. */
export function groove (d) {
  const S = `fill="none" stroke-linecap="square" stroke-linejoin="miter"`
  return [
    `<path d="${d}" stroke="${P.ENGRAVE}" stroke-width=".85" opacity=".8" ${S}/>`,
    `<path d="${d}" stroke="${P.COUNTER}" stroke-width=".7" opacity=".28" transform="translate(.5 1)" ${S}/>`,
  ]
}


/* ---------------------------------------------------------------- object primitives
   For subjects that are only recognisable as OBJECTS. These break the slope law on purpose: a
   globe with faceted edges is not a globe. What is kept is the part that actually makes eighteen
   marks read as one set — the single light vector, the nineteen tones, and the matte anodised
   material. Nothing here introduces a hue, a filter or a second lamp. */
export function bodyGrad (id, k, a, b) {
  return `<linearGradient id="${id}-${k}" ${LIGHT}><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`
}
/* a lit sphere: the terminator does the work, the rim light stops it reading as a flat disc */
export function sphere (id, cx, cy, r) {
  const O = [
    `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="url(#${id}-sph)"/>`,
    /* the crescent of shadow on the away side */
    `<path d="M${n(cx)} ${n(cy - r)}A${n(r)} ${n(r)} 0 0 1 ${n(cx)} ${n(cy + r)}A${n(r * .62)} ${n(r)} 0 0 0 ${n(cx)} ${n(cy - r)}Z" fill="${P.RGT_LO}" opacity=".55"/>`,
    /* the lit rim, upper-left, where the key actually lands */
    `<path d="M${n(cx - r * .93)} ${n(cy - r * .38)}A${n(r)} ${n(r)} 0 0 1 ${n(cx + r * .38)} ${n(cy - r * .93)}" fill="none" stroke="${P.CHAM_L}" stroke-width="2.1" stroke-linecap="round"/>`,
  ]
  return { O, G: [bodyGrad(id, 'sph', P.TOP_HI, P.RGT_HI)] }
}
/* the red locator. A pin is the one shape everybody already reads as "here". */
export function pin (id, cx, cy, r) {
  const h = r * 2.5
  return [
    `<path d="M${n(cx)} ${n(cy + h)}C${n(cx - r * 1.5)} ${n(cy + h * .45)} ${n(cx - r * 1.55)} ${n(cy)} ${n(cx - r * 1.55)} ${n(cy - r * .1)}A${n(r * 1.55)} ${n(r * 1.55)} 0 1 1 ${n(cx + r * 1.55)} ${n(cy - r * .1)}C${n(cx + r * 1.55)} ${n(cy)} ${n(cx + r * 1.5)} ${n(cy + h * .45)} ${n(cx)} ${n(cy + h)}Z" fill="url(#${id}-pin)"/>`,
    `<circle cx="${n(cx)}" cy="${n(cy - r * .1)}" r="${n(r * .62)}" fill="${P.SIG_DEEP}" opacity=".85"/>`,
    `<path d="M${n(cx - r * 1.1)} ${n(cy - r * .8)}A${n(r * 1.5)} ${n(r * 1.5)} 0 0 1 ${n(cx - r * .1)} ${n(cy - r * 1.5)}" fill="none" stroke="${P.SIG_CHAM_L}" stroke-width="1.3" stroke-linecap="round"/>`,
  ]
}
/* one person: a head and a shouldered body. Read at 29px because the proportion is right, not
   because the detail is. */
export function figure (cx, cy, s, lit) {
  const hr = 5.4 * s, bw = 9.6 * s, bh = 15 * s
  const top = lit ? P.TOP_HI : P.LFT_HI
  const side = lit ? P.LFT_HI : P.LFT_LO
  return [
    `<path d="M${n(cx - bw)} ${n(cy + bh)}V${n(cy + bh * .12)}C${n(cx - bw)} ${n(cy - bh * .42)} ${n(cx + bw)} ${n(cy - bh * .42)} ${n(cx + bw)} ${n(cy + bh * .12)}V${n(cy + bh)}Z" fill="${side}"/>`,
    `<path d="M${n(cx - bw)} ${n(cy + bh * .12)}C${n(cx - bw)} ${n(cy - bh * .42)} ${n(cx + bw)} ${n(cy - bh * .42)} ${n(cx + bw)} ${n(cy + bh * .12)}Z" fill="${top}"/>`,
    `<circle cx="${n(cx)}" cy="${n(cy - bh * .62)}" r="${n(hr)}" fill="${top}"/>`,
    `<path d="M${n(cx - hr * .82)} ${n(cy - bh * .62 - hr * .4)}A${n(hr)} ${n(hr)} 0 0 1 ${n(cx - hr * .1)} ${n(cy - bh * .62 - hr)}" fill="none" stroke="${P.CHAM_L}" stroke-width="1.5" stroke-linecap="round"/>`,
  ]
}

/* ------------------------------------------------------------------------ assemble a mark */
export function buildMark (m) {
  const id = 'iaq-' + m.slot
  const defs = [], body = []
  const shape = o => o.A !== undefined ? plan(o.cx, o.cy, o.A, o.B) : rhombus(o.cx, o.cy, o.a)
  const masses = m.masses.map((s, i) => ({ r: shape(s), t: s.t, i }))
  const grounded = masses[0] || { r: rhombus(48, 62, 30), t: 0 }

  /* L0 ground pool — ambient contact, NOT a cast shadow. Under this lamp a cast shadow lands
     behind the object and is self-occluded, so the system has no drop shadow on any mark, ever. */
  /* `ground` lets a custom mark seat its own contact. A mark whose object RISES out of the plane
     inherits the default rhombus; one that LIES IN the plane (hookup's links) needs the pool moved
     under it and the rhombus contact line dropped, because a flat object has no front face to
     meet the floor with and the rhombus edges simply poke out past it. */
  const gy = m.ground?.cy ?? (grounded.r.F[1] + grounded.t)
  const grx = m.ground?.rx ?? grounded.r.a - 2
  defs.push(`<radialGradient id="${id}-gnd"><stop offset="0" stop-color="${P.INK}" stop-opacity=".16"/><stop offset=".55" stop-color="${P.INK}" stop-opacity=".07"/><stop offset="1" stop-color="${P.INK}" stop-opacity="0"/></radialGradient>`)
  body.push(`<ellipse cx="${n(grounded.r.cx)}" cy="${n(gy - 1)}" rx="${n(grx)}" ry="9" fill="url(#${id}-gnd)"/>`)

  /* L1 contact line — one hard edge deliberately: a soft multi-step ramp bands visibly on a
     near-white page. */
  const bR = down(grounded.r.R, grounded.t), bF = down(grounded.r.F, grounded.t), bL = down(grounded.r.L, grounded.t)
  if (m.ground?.line !== false) body.push(`<path d="${seg(bR, bF)}L${n(bL[0])} ${n(bL[1])}" fill="none" stroke="${P.INK}" stroke-width="1.8" stroke-opacity=".17" stroke-linecap="square" stroke-linejoin="miter"/>`)

  /* L2 masses, back to front. Correct under the painter's algorithm because every successive mass
     is displaced along +x and/or +z, both of which move toward the camera. */
  if (!m.custom) masses.forEach((s, i) => {
    const sid = `${id}-s${i}`
    const isTop = i === masses.length - 1
    const sl = slab(sid, s.r, s.t, {})
    defs.push(...sl.G, sl.clipTop)
    body.push(`<g class="iaq-s${i}">`)
    body.push(...sl.O)
    body.push(`<g clip-path="url(#${sid}-ct)">`)
    if (i + 1 < masses.length) body.push(...crevice(masses[i + 1].r))
    body.push(...chamfers(sid, s.r, isTop))
    if (isTop && m.engrave) body.push(...m.engrave(s.r))
    body.push(`</g>`)
    body.push(`</g>`)
  })

  if (m.custom) {
    /* a mark that draws its own object. It still gets the system's ground pool above, the shared
       light vector, and nothing outside the nineteen tones. */
    const c = m.custom(id)
    defs.push(...(c.defs || []))
    /* Optical normalisation, applied as one uniform scale about the centre rather than by
       re-authoring every coordinate. Alpha coverage is what makes six different subjects read at
       the same size beside six numerals; without it the set looks ragged however good each mark is. */
    const k = m.scale || 1
    if (k === 1) body.push(...(c.body || []))
    else body.push(`<g transform="translate(48 48) scale(${k}) translate(-48 -48)">`, ...(c.body || []), `</g>`)
  }
  if (m.extraDefs) defs.push(...m.extraDefs(id))
  if (m.extra) body.push(...m.extra(id, masses))

  /* L3 bounce — the page is a real 92%-reflectance card at #F7F9FC. Omitting this is the single
     most common reason an SVG solid reads as a flat swatch. */
  if (!m.custom) body.push(`<path d="${seg(bF, bL)}" fill="none" stroke="${P.BOUNCE}" stroke-width="1.2" stroke-opacity=".5" stroke-linecap="square"/>`)

  /* L4 the one signal element */
  if (m.signal) {
    const sg = signal(id, shape(m.signal), m.signal.proud ?? 3)
    defs.push(...sg.G, sg.clip)
    body.push(`<g class="iaq-sig">`, ...sg.O, `</g>`)
  } else if (m.signalPath) {
    /* a mark whose accent is not a slab still gets the one signal gradient and the one accent */
    defs.push(`<linearGradient id="${id}-sig" ${LIGHT}><stop offset="0" stop-color="${P.SIG_LIT}"/><stop offset="1" stop-color="${P.SIG_SHADE}"/></linearGradient>`)
    body.push(`<g class="iaq-sig">`, ...m.signalPath(id), `</g>`)
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" class="iaq-mk" aria-hidden="true" focusable="false"><title>${m.title}</title><defs>${defs.join('')}</defs>${body.join('')}</svg>`
}

/* ------------------------------------------------------------------------------ the set */
export const MARKS = [
  {
    slot: 'prj', title: 'Completed projects',
    /* A delivered facility with an approval check. The three-tier stack this replaced satisfied the
       family rules and told a visitor nothing: at 37px it could have been anything stacked. A plant
       silhouette plus a tick is what "completed projects" actually means to a builder. */
    scale: 1.06,
    masses: [],
    custom: id => ({
      defs: [bodyGrad(id, 'wall', P.TOP_HI, P.LFT_LO), bodyGrad(id, 'roof', P.CHAM_L, P.TOP_LO),
             bodyGrad(id, 'tick', P.SIG_LIT, P.SIG_SHADE)],
      body: [
        /* the plant: a long low block with a saw-tooth roof, the industrial read */
        `<path d="M16 44H80V70H16Z" fill="url(#${id}-wall)"/>`,
        `<path d="M16 44L26 34L36 44L46 34L56 44L66 34L76 44Z" fill="url(#${id}-roof)"/>`,
        `<path d="M16 44L26 34L36 44" fill="none" stroke="${P.SPEC}" stroke-width="1.5" stroke-linejoin="miter" opacity=".85"/>`,
        /* window bands, engraved not drawn: the incised pair is the system's surface marking */
        ...groove('M22 52H74'),
        ...groove('M22 60H74'),
        `<path d="M16 70H80" stroke="${P.INK}" stroke-width="1.8" stroke-opacity=".2" fill="none"/>`,
        /* the one signal part: an approval tick, overlapping the corner so it reads as applied */
        `<path d="M58 58L67 67L84 46" fill="none" stroke="${P.SIG_DEEP}" stroke-width="10.5" stroke-linecap="square" stroke-linejoin="miter" transform="translate(0 3)"/>`,
        `<path d="M58 58L67 67L84 46" fill="none" stroke="url(#${id}-tick)" stroke-width="10.5" stroke-linecap="square" stroke-linejoin="miter"/>`,
        `<path d="M58 58L67 67L84 46" fill="none" stroke="${P.SIG_CHAM_L}" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" transform="translate(-1.4 -2.6)" opacity=".8"/>`,
      ],
    }),
  },
  {
    slot: 'cln', title: 'Cleanroom built-up area',
    /* Floor AREA, measured. The plain ceiling grid said "tiles"; the number beside it is square
       metres, so the mark has to carry measurement, not pattern. A plan slab with a 3x3 FFU grid
       and a red dimension run along the front edge does both. 2x2 would read as a window pane. */
    scale: 0.77,
    masses: [],
    custom: id => {
      const O = [], A = 30, B = 30, cx = 48, cy = 44
      const pl = plan(cx, cy, A, B)
      /* the slab */
      O.push(`<path d="${poly([pl.R, pl.F, down(pl.F, 7), down(pl.R, 7)])}" fill="${P.RGT_HI}"/>`)
      O.push(`<path d="${poly([pl.F, pl.L, down(pl.L, 7), down(pl.F, 7)])}" fill="${P.LFT_HI}"/>`)
      O.push(`<path d="${poly([pl.T, pl.R, pl.F, pl.L])}" fill="url(#${id}-top)"/>`)
      /* the 3x3 filter grid, engraved into the plan rather than stacked on it */
      for (const f of [-1 / 3, 1 / 3]) {
        const a0 = [cx + (-A + B) + 2 * A * (f + .5), cy - (A + B) / 2 + A * (f + .5)]
        O.push(...groove(seg(a0, [a0[0] - 2 * B, a0[1] + B])))
        const b0 = [cx + (-A + B) - 2 * B * (f + .5), cy - (A + B) / 2 + B * (f + .5)]
        O.push(...groove(seg(b0, [b0[0] + 2 * A, b0[1] + A])))
      }
      O.push(`<path d="${seg(pl.F, pl.L)}" stroke="${P.CHAM_L}" stroke-width="3" fill="none" stroke-linecap="square"/>`)
      O.push(`<path d="${seg(pl.R, pl.F)}" stroke="${P.CHAM_R}" stroke-width="2.6" fill="none" stroke-linecap="square"/>`)
      /* the dimension run: the one signal part, and the thing that turns a grid into an area */
      const d0 = [pl.L[0] + 3, pl.L[1] + 9], d1 = [pl.F[0] - 3, pl.F[1] + 9]
      O.push(`<path d="${seg(d0, d1)}" stroke="${P.SIG_LIT}" stroke-width="2.6" fill="none" stroke-linecap="butt"/>`)
      for (const [e, dir] of [[d0, 1], [d1, -1]])
        O.push(`<path d="M${n(e[0])} ${n(e[1] - 4.5)}V${n(e[1] + 4.5)}" stroke="${P.SIG_LIT}" stroke-width="2.6" fill="none"/>`,
               `<path d="M${n(e[0] + dir * 7)} ${n(e[1] - 3.4)}L${n(e[0])} ${n(e[1])}L${n(e[0] + dir * 7)} ${n(e[1] + 3.4)}Z" fill="${P.SIG_SHADE}"/>`)
      return { defs: [bodyGrad(id, 'top', P.TOP_HI, P.TOP_LO)], body: O }
    },
  },
  {
    slot: 'emp', title: 'Employees group-wide',
    /* Three people. The previous version put three narrow posts on a plate and they fused into one
       lump at 37px, which is the opposite of what a headcount has to say. Head-and-shoulders at a
       real proportion reads at any size, and a single bust would read as one person. */
    scale: 1.35,
    masses: [],
    custom: id => ({
      defs: [bodyGrad(id, 'sig', P.SIG_LIT, P.SIG_SHADE)],
      body: [
        ...figure(23, 56, .92, false),
        ...figure(73, 56, .92, false),
        ...figure(48, 48, 1.14, true),
        /* the one signal part: the centre figure's collar */
        `<path d="M37 60C37 53.4 42 50.4 48 50.4C54 50.4 59 53.4 59 60Z" fill="url(#${id}-sig)"/>`,
        `<path d="M37 60H59V63.4H37Z" fill="${P.SIG_SHADE}"/>`,
        `<path d="M39.4 57.6C41 54.4 44 52.8 47 52.4" fill="none" stroke="${P.SIG_CHAM_L}" stroke-width="1.5" stroke-linecap="round"/>`,
      ],
    }),
  },
  {
    slot: 'ctr', title: 'Countries and global offices',
    /* A globe with a locator on it. The puck-and-pin version was unreadable at 37px: a low
       cylinder is not a world. The meridians are what make a shaded circle read as a sphere. */
    masses: [],
    custom: id => {
      const sph = sphere(id, 46, 47, 26)
      return {
        defs: [...sph.G, bodyGrad(id, 'pin', P.SIG_LIT, P.SIG_SHADE)],
        body: [
          ...sph.O,
          /* equator and two meridians: three lines, and the circle becomes a globe */
          `<ellipse cx="46" cy="47" rx="26" ry="8.6" fill="none" stroke="${P.ENGRAVE}" stroke-width="1.5" opacity=".5"/>`,
          `<ellipse cx="46" cy="47" rx="10.4" ry="26" fill="none" stroke="${P.ENGRAVE}" stroke-width="1.5" opacity=".45"/>`,
          `<ellipse cx="46" cy="47" rx="21" ry="26" fill="none" stroke="${P.ENGRAVE}" stroke-width="1.3" opacity=".3"/>`,
          ...pin(id, 68, 26, 6),
        ],
      }
    },
  },
  {
    slot: 'shr', title: 'Safe manhours',
    /* A hard hat. The previous brim-and-block read as another stepped solid; a hat is only a hat
       when the brim clearly projects past the crown on both sides. */
    scale: 1.15,
    masses: [],
    custom: id => ({
      defs: [bodyGrad(id, 'crown', P.TOP_HI, P.RGT_HI), bodyGrad(id, 'brim', P.LFT_HI, P.RGT_LO)],
      body: [
        /* crown */
        `<path d="M22 58C22 38 32 26 48 26C64 26 74 38 74 58Z" fill="url(#${id}-crown)"/>`,
        /* the raised centre ridge, the detail that says hard hat rather than bowl */
        `<path d="M43 27.5C45 26.6 51 26.6 53 27.5C54.4 36 54.4 49 53.6 58H42.4C41.6 49 41.6 36 43 27.5Z" fill="${P.TOP_HI}" opacity=".55"/>`,
        /* the lit rim on the key side */
        `<path d="M25 55C26.5 40 34 29.5 45 27.6" fill="none" stroke="${P.CHAM_L}" stroke-width="2.2" stroke-linecap="round"/>`,
        /* the red band, the one signal part */
        `<path d="M22.6 54C23.4 51.6 24 50 24 50H72C72 50 72.6 51.6 73.4 54Z" fill="${P.SIG_LIT}"/>`,
        `<path d="M22.6 54H73.4C73.8 55.3 74 56.6 74 58H22C22 56.6 22.2 55.3 22.6 54Z" fill="${P.SIG_SHADE}"/>`,
        /* brim, projecting well past the crown on both sides */
        `<ellipse cx="48" cy="59.5" rx="31" ry="7.6" fill="url(#${id}-brim)"/>`,
        `<path d="M17 59.5A31 7.6 0 0 1 48 51.9A31 7.6 0 0 1 79 59.5" fill="${P.CHAM_R}" opacity=".75"/>`,
        `<path d="M21 56.8A31 7.6 0 0 1 38 52.4" fill="none" stroke="${P.SPEC}" stroke-width="1.5" stroke-linecap="round" opacity=".9"/>`,
      ],
    }),
  },
  {
    slot: 'crb', title: 'Carbon reduced per year',
    /* An exhaust stack on a base plate with one extruded signal wedge crossing it, pointing DOWN.
       The down arrow must be the visually heaviest element and unmistakably down. Never a CO2
       cloud: that silhouette belongs to cloud computing, and IAQ sells to data centres. */
    masses: [{ cx: 48, cy: 64, A: 19, B: 19, t: 8 }],
    extra: () => {
      const O = []
      const st = plan(38, 46, 6, 6)
      O.push(`<path d="${poly([st.R, st.F, down(st.F, 22), down(st.R, 22)])}" fill="${P.RGT_HI}"/>`)
      O.push(`<path d="${poly([st.F, st.L, down(st.L, 22), down(st.F, 22)])}" fill="${P.LFT_HI}"/>`)
      O.push(`<path d="${poly([st.T, st.R, st.F, st.L])}" fill="${P.TOP_HI}"/>`)
      O.push(`<path d="${seg(st.F, st.L)}" stroke="${P.CHAM_L}" stroke-width="2.6" fill="none" stroke-linecap="square"/>`)
      return O
    },
    /* the accent is a real extruded wedge, not a slab: the only downward arrow in the system */
    signalPath: id => {
      const ax = 66, ay = 40, w = 13, h = 13, d = 5
      const tip = [ax, ay + h + 6], ul = [ax - w, ay + h - w / 2], ur = [ax + w, ay + h - w / 2]
      const sl = [ax - 5, ay + h - w / 2], sr = [ax + 5, ay + h - w / 2]
      const face = [tip, ur, [ax + 5, ay + h - w / 2], [ax + 5, ay - 6], [ax - 5, ay - 6 - 5], [ax - 5, ay + h - w / 2 - 5], ul]
      const O = []
      const head = 'M' + [tip, ur, ul].map(p => n(p[0]) + ' ' + n(p[1])).join('L') + 'Z'
      const shaft = 'M' + [[ax - 5, ay - 8], [ax + 5, ay - 3], [ax + 5, ay + h - w / 2], [ax - 5, ay + h - w / 2 - 5]].map(p => n(p[0]) + ' ' + n(p[1])).join('L') + 'Z'
      O.push(`<path d="${head}" transform="translate(0 ${d})" fill="${P.SIG_DEEP}"/>`)
      O.push(`<path d="${shaft}" transform="translate(0 ${d})" fill="${P.SIG_DEEP}"/>`)
      O.push(`<path d="${shaft}" fill="${P.SIG_SHADE}"/>`)
      O.push(`<path d="${head}" fill="url(#${id}-sig)"/>`)
      O.push(`<path d="${head}" fill="none" stroke="${P.SIG_CHAM_L}" stroke-width="1.4" stroke-linejoin="miter"/>`)
      return O
    },
  },
  {
    slot: 'grw', title: 'Career growth',
    /* 24 Sep (Careers, "why build your career": Bazil wants our marks, not line icons in boxes): three steps rising
       to the back, each a slab on the lattice, the top step's tread the one signal part */
    scale: 1.0, masses: [],
    custom: id => ({
      defs: [bodyGrad(id, 'top', P.TOP_HI, P.TOP_LO), bodyGrad(id, 'sig', P.SIG_LIT, P.SIG_SHADE)],
      body: (() => {
        const O = []
        const steps = [[66, 43, 28], [48, 52, 18], [30, 61, 8]]   /* back first, so the near steps paint over; spaced so every tread shows */
        steps.forEach(([cx, cy, t], k) => {
          const pl = plan(cx, cy, 7, 7)
          O.push(`<path d="${poly([pl.R, pl.F, down(pl.F, t), down(pl.R, t)])}" fill="${P.RGT_HI}"/>`)
          O.push(`<path d="${poly([pl.F, pl.L, down(pl.L, t), down(pl.F, t)])}" fill="${P.LFT_HI}"/>`)
          if (k === 0) {
            O.push(`<g class="mk-mv"><path d="${poly([pl.T, pl.R, pl.F, pl.L])}" fill="url(#${id}-sig)"/></g>`)
          } else O.push(`<path d="${poly([pl.T, pl.R, pl.F, pl.L])}" fill="url(#${id}-top)"/>`)
          O.push(`<path d="${seg(pl.F, pl.L)}" stroke="${P.CHAM_L}" stroke-width="1.6" fill="none" stroke-linecap="square" opacity=".7"/>`)
        })
        return O
      })(),
    }),
  },
]

/* ---------------------------------------------------------------- the delivery cycle
   The five stages on the homepage showpiece, drawn in the same system as the stat marks so the
   whole site speaks one icon language. Same lamp, same palette, same material: only the subjects
   differ. These are consumed by the 3D scene as textures, not as inline SVG. */
export const CYCLE_MARKS = [
  {
    slot: 'des', title: 'Engineering design',
    /* a drawing sheet with a set square on it. "Design" is the drawing, not an abstraction. */
    scale: 1.02, masses: [],
    custom: id => ({
      defs: [bodyGrad(id, 'top', P.TOP_HI, P.TOP_LO), bodyGrad(id, 'sq', P.SIG_LIT, P.SIG_SHADE)],
      body: (() => {
        const O = [], pl = plan(48, 46, 26, 26)
        O.push(`<path d="${poly([pl.R, pl.F, down(pl.F, 5), down(pl.R, 5)])}" fill="${P.RGT_HI}"/>`)
        O.push(`<path d="${poly([pl.F, pl.L, down(pl.L, 5), down(pl.F, 5)])}" fill="${P.LFT_HI}"/>`)
        O.push(`<path d="${poly([pl.T, pl.R, pl.F, pl.L])}" fill="url(#${id}-top)"/>`)
        /* the drawing on the sheet */
        for (const f of [-0.28, 0.06, 0.4]) {
          const a0 = [pl.T[0] + 2 * 26 * (f + .5) * .8 + 6, pl.T[1] + 26 * (f + .5) * .8 + 3]
          O.push(...groove(seg(a0, [a0[0] - 30, a0[1] + 15])))
        }
        /* 24 Sep (Bazil: "more proper and detailed"): a title block in the sheet's near corner, a dimension line
           with its two ticks, and a small plan rectangle, so the sheet reads as a drawing and not a lid */
        O.push(`<path d="${poly([[pl.F[0]-2, pl.F[1]-7.5], [pl.F[0]+12, pl.F[1]-14.5], [pl.F[0]+12, pl.F[1]-10.5], [pl.F[0]-2, pl.F[1]-3.5]])}" fill="${P.INK}" opacity=".13"/>`)
        O.push(...groove(seg([pl.L[0]+7, pl.L[1]-1], [pl.L[0]+19, pl.L[1]-7])))
        O.push(`<path d="M${n(pl.L[0]+7)} ${n(pl.L[1]-3)}v4M${n(pl.L[0]+19)} ${n(pl.L[1]-9)}v4" stroke="${P.INK}" stroke-width="1" opacity=".35" fill="none"/>`)
        O.push(`<path d="${poly([[pl.T[0]-3, pl.T[1]+9], [pl.T[0]+7, pl.T[1]+14], [pl.T[0]+1, pl.T[1]+17], [pl.T[0]-9, pl.T[1]+12]])}" fill="none" stroke="${P.INK}" stroke-width="1" opacity=".3"/>`)
        O.push(`<path d="${seg(pl.F, pl.L)}" stroke="${P.CHAM_L}" stroke-width="2.8" fill="none" stroke-linecap="square"/>`)
        O.push(`<path d="${seg(pl.R, pl.F)}" stroke="${P.CHAM_R}" stroke-width="2.4" fill="none" stroke-linecap="square"/>`)
        /* the set square, the one signal part */
        const sq = 'M34 30L76 51L40 60ZM41 39L61 49L43 53Z'
        /* 22 Sep: .mk-mv wraps the ONE part of each cycle mark that moves on the home ring (home.css mk* keyframes).
           A CSS animation replaces an element's own transform attribute, so the class sits on a bare group. */
        O.push(`<g class="mk-mv">`)
        O.push(`<path d="${sq}" fill-rule="evenodd" fill="${P.SIG_SHADE}" transform="translate(0 3.2)"/>`)
        O.push(`<path d="${sq}" fill-rule="evenodd" fill="url(#${id}-sq)"/>`)
        O.push(`<path d="M34 30L76 51" fill="none" stroke="${P.SIG_CHAM_L}" stroke-width="1.7"/>`)
        O.push(`</g>`)
        return O
      })(),
    }),
  },
  {
    slot: 'prc', title: 'Procurement',
    /* a crate with a shipping band. The single most legible object for "goods arriving". */
    scale: 1.0,
    masses: [{ cx: 48, cy: 44, A: 19, B: 19, t: 22 }],
    extra: () => {
      const pl = plan(48, 44, 19, 19)
      /* 24 Sep (Bazil: "more proper and detailed"): plank grooves on both faces, a shipping label on the front, corner caps */
      const planks = []
      for (const k of [7, 14]) {
        planks.push(...groove(seg([pl.L[0], pl.L[1] + k], [pl.F[0], pl.F[1] + k])))
        planks.push(...groove(seg([pl.F[0], pl.F[1] + k], [pl.R[0], pl.R[1] + k])))
      }
      return [
        ...planks,
        `<path d="${poly([[pl.F[0]+4, pl.F[1]+5], [pl.F[0]+12, pl.F[1]+1], [pl.F[0]+12, pl.F[1]+8], [pl.F[0]+4, pl.F[1]+12]])}" fill="${P.BACK}" opacity=".9"/>`,
        `<path d="M${n(pl.F[0]+5.5)} ${n(pl.F[1]+7)}l5-2.5M${n(pl.F[0]+5.5)} ${n(pl.F[1]+9.5)}l3.5-1.8" stroke="${P.INK}" stroke-width="1" opacity=".35" fill="none"/>`,
        `<g class="mk-mv">`,
        /* the band runs over the top and down the two visible faces */
        `<path d="${poly([[pl.T[0], pl.T[1]], [pl.R[0], pl.R[1]], [pl.F[0], pl.F[1]], [pl.L[0], pl.L[1]]])}" fill="none"/>`,
        `<path d="M${n(pl.T[0])} ${n(pl.T[1])}L${n(pl.F[0])} ${n(pl.F[1])}L${n(pl.F[0])} ${n(pl.F[1] + 22)}" fill="none" stroke="${P.SIG_LIT}" stroke-width="4.6" stroke-linejoin="miter"/>`,
        `<path d="M${n(pl.F[0])} ${n(pl.F[1])}L${n(pl.R[0])} ${n(pl.R[1])}" fill="none" stroke="${P.SIG_SHADE}" stroke-width="4.6"/>`,
        `</g>`,
      ]
    },
  },
  {
    slot: 'con', title: 'Construction',
    /* a tower crane. Nothing else says "construction" as fast at 40px. */
    scale: 1.0, masses: [],
    custom: id => ({
      defs: [bodyGrad(id, 'm', P.TOP_HI, P.RGT_HI), bodyGrad(id, 'j', P.SIG_LIT, P.SIG_SHADE)],
      body: [
        /* mast */
        `<path d="M40 78V26H52V78Z" fill="url(#${id}-m)"/>`,
        `<path d="M40 26H52V78H47V31H40Z" fill="${P.RGT_LO}" opacity=".5"/>`,
        ...groove('M40 40H52'), ...groove('M40 54H52'), ...groove('M40 66H52'),
        /* 24 Sep (Bazil: "more proper and detailed"): mast lattice, a base plate, a cab at the top of the mast,
           a counterweight block on the counter jib */
        `<path d="M40 33L52 40M52 40L40 47M40 47L52 54M52 54L40 61M40 61L52 68M52 68L40 75" fill="none" stroke="${P.INK}" stroke-width="1" opacity=".22"/>`,
        `<path d="M34 78H58V82H34Z" fill="${P.RGT_LO}"/>`,
        `<path d="M36 23H52V28H36Z" fill="${P.LFT_HI}"/><path d="M38 24.5H44V27H38Z" fill="${P.BACK}" opacity=".85"/>`,
        `<path d="M22 20H32V27H22Z" fill="${P.RGT_LO}"/>`,
        /* the hook line and its load: the part that moves. Before the jib, so the jib covers the line as it winds in */
        `<g class="mk-mv"><path d="M74 27V45" fill="none" stroke="${P.LFT_LO}" stroke-width="2"/><path d="M70 45H78V51H70Z" fill="${P.RGT_HI}"/></g>`,
        /* jib, the signal part, running long to the right */
        `<path d="M20 26H86V33H20Z" fill="${P.SIG_SHADE}" transform="translate(0 2.5)"/>`,
        `<path d="M20 26H86V33H20Z" fill="url(#${id}-j)"/>`,
        `<path d="M20 26H86" fill="none" stroke="${P.SIG_CHAM_L}" stroke-width="1.7"/>`,
        /* counter jib and the hook line */
        `<path d="M46 26L46 18L74 26M46 18L26 26" fill="none" stroke="${P.LFT_HI}" stroke-width="2.4" stroke-linejoin="miter"/>`,
        `<path d="M24 28.5H84M26 33.5L34 28.5M42 33.5L50 28.5M58 33.5L66 28.5M74 33.5L82 28.5" fill="none" stroke="${P.SIG_DEEP}" stroke-width="1" opacity=".5"/>`,
        `<path d="M28 78H64" fill="none" stroke="${P.INK}" stroke-width="2" stroke-opacity=".2"/>`,
      ],
    }),
  },
  {
    slot: 'com', title: 'Testing & commissioning',
    /* a gauge with one needle. Commissioning is proving a number, so the mark is a reading. */
    scale: 1.0, masses: [],
    custom: id => {
      const sph = sphere(id, 48, 46, 27)
      return {
        defs: [...sph.G],
        body: [
          ...sph.O,
          `<circle cx="48" cy="46" r="20" fill="${P.BACK}" opacity=".28"/>`,
          `<circle cx="48" cy="46" r="20" fill="none" stroke="${P.ENGRAVE}" stroke-width="1.4" opacity=".6"/>`,
          /* 24 Sep (Bazil: "more proper and detailed"): a bezel, minor ticks between the majors, a red band at the top of the scale */
          `<circle cx="48" cy="46" r="23" fill="none" stroke="${P.CHAM_L}" stroke-width="1.2" opacity=".55"/>`,
          ...[195, 225, 255, 285, 315, 345].map(a => { const t = a * Math.PI / 180
            return `<path d="M${n(48 + 20 * Math.cos(t))} ${n(46 + 20 * Math.sin(t))}L${n(48 + 17.5 * Math.cos(t))} ${n(46 + 17.5 * Math.sin(t))}" stroke="${P.ENGRAVE}" stroke-width="1.2" opacity=".5"/>` }),
          `<path d="M${n(48 + 22 * Math.cos(-0.35))} ${n(46 + 22 * Math.sin(-0.35))}A22 22 0 0 1 ${n(48 + 22 * Math.cos(0.15))} ${n(46 + 22 * Math.sin(0.15))}" fill="none" stroke="${P.SIG_LIT}" stroke-width="2.4"/>`,
          /* the scale ticks */
          ...[210, 240, 270, 300, 330].map(a => {
            const r0 = 20, r1 = 15, t = a * Math.PI / 180
            return `<path d="M${n(48 + r0 * Math.cos(t))} ${n(46 + r0 * Math.sin(t))}L${n(48 + r1 * Math.cos(t))} ${n(46 + r1 * Math.sin(t))}" stroke="${P.ENGRAVE}" stroke-width="1.8" opacity=".75"/>`
          }),
          /* the needle: the one signal part, reading high */
          `<g class="mk-mv"><path d="M48 46L66 32" fill="none" stroke="${P.SIG_SHADE}" stroke-width="4" stroke-linecap="round" transform="translate(0 2)"/>`,
          `<path d="M48 46L66 32" fill="none" stroke="${P.SIG_LIT}" stroke-width="4" stroke-linecap="round"/></g>`,
          `<circle cx="48" cy="46" r="4.6" fill="${P.SIG_SHADE}"/>`,
          `<circle cx="47" cy="45" r="2.2" fill="${P.SIG_CHAM_L}"/>`,
        ],
      }
    },
  },
  {
    slot: 'mnt', title: 'Maintenance',
    /* a gear with a red hub. The one universally read symbol for keeping a thing running. */
    scale: 1.0, masses: [],
    custom: id => {
      const teeth = []
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4, c = Math.cos(a), s2 = Math.sin(a)
        teeth.push(`<path d="M${n(48 + 22 * c - 6 * s2)} ${n(46 + 22 * s2 + 6 * c)}L${n(48 + 30 * c - 4.6 * s2)} ${n(46 + 30 * s2 + 4.6 * c)}L${n(48 + 30 * c + 4.6 * s2)} ${n(46 + 30 * s2 - 4.6 * c)}L${n(48 + 22 * c + 6 * s2)} ${n(46 + 22 * s2 - 6 * c)}Z" fill="url(#${id}-t)"/>`)
      }
      return {
        defs: [bodyGrad(id, 'g', P.TOP_HI, P.RGT_HI), bodyGrad(id, 't', P.LFT_HI, P.RGT_LO)],
        body: [
          `<g class="mk-mv">`, ...teeth, `</g>`,
          `<circle cx="48" cy="46" r="23" fill="url(#${id}-g)"/>`,
          `<path d="M30 34A23 23 0 0 1 60 25.6" fill="none" stroke="${P.CHAM_L}" stroke-width="2.2" stroke-linecap="round"/>`,
          /* 24 Sep (Bazil: "more proper and detailed"): four lightening holes on the web and a keyway in the hub */
          ...[45, 135, 225, 315].map(a => { const t = a * Math.PI / 180
            return `<circle cx="${n(48 + 16.5 * Math.cos(t))}" cy="${n(46 + 16.5 * Math.sin(t))}" r="2.6" fill="${P.RGT_LO}" opacity=".85"/>` }),
          `<circle cx="48" cy="46" r="10.5" fill="${P.SIG_SHADE}"/>`,
          `<circle cx="48" cy="46" r="10.5" fill="none" stroke="${P.SIG_LIT}" stroke-width="3.4"/>`,
          `<path d="M41 40A10.5 10.5 0 0 1 50 36" fill="none" stroke="${P.SIG_CHAM_L}" stroke-width="1.6" stroke-linecap="round"/>`,
          `<path d="M46.5 39.5H49.5V43H46.5Z" fill="${P.SIG_DEEP}"/>`,
        ],
      }
    },
  },
  {
    slot: 'hok', title: 'Tools hookup', ground: { rx: 26, cy: 60, line: false },
    /* two links lying in the ground plane, the far one red. Hookup is the JOIN between a tool and
       the facility it runs on, and a link is the one shape that reads "joined" at 40px. A flat
       circle in this camera projects to a 2:1 ellipse, so a link is an elliptical annulus and its
       depth is one darker copy dropped by t. The interlock is real, not an overlap: the red link
       is drawn over the grey one, then the grey link's FAR arc is redrawn inside a clip band over
       the overlap, so one link passes behind on the near side and in front on the far side. */
    scale: 1.0, masses: [],
    custom: id => {
      /* the pair is measured to the SAME box the other five sit in: every mark centres on
         (48,46) and reaches about 30 units out. The first cut ran 4..92 wide and centred at
         y 55.7, so hookup read oversized and sat visibly low in its station disc against the
         gear and the crane. These numbers put the ink at 34..62 vertically, 14..82 across,
         centred on (48,46) like the rest. */
      const RX = 17, RY = 8.5, W = 8, T = 3, AX = 35, BX = 61, CY = 44.5
      const ring = (cx, cy, stroke) =>
        `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(RX)}" ry="${n(RY)}" fill="none" stroke="${stroke}" stroke-width="${n(W)}"/>`
      const pt = (cx, cy, t) => [cx + RX * Math.cos(t), cy + RY * Math.sin(t)]
      const a0 = pt(AX, CY, Math.PI * 1.12), a1 = pt(AX, CY, Math.PI * 1.48)
      return {
        defs: [bodyGrad(id, 'lk', P.TOP_HI, P.RGT_HI), bodyGrad(id, 'sg', P.SIG_LIT, P.SIG_SHADE),
          `<clipPath id="${id}-ov"><rect x="${n(BX - RX - 2)}" y="${n(CY - RY - W)}" width="${n(2 * RX - (BX - AX) + 4)}" height="${n(RY + W)}"/></clipPath>`],
        body: [
          ring(AX, CY + T, P.RGT_LO),
          ring(AX, CY, `url(#${id}-lk)`),
          `<g class="mk-mv">` + ring(BX, CY + T, P.SIG_DEEP) + ring(BX, CY, `url(#${id}-sg)`) + `</g>`,
          `<g clip-path="url(#${id}-ov)">${ring(AX, CY + T, P.RGT_LO)}${ring(AX, CY, `url(#${id}-lk)`)}</g>`,
          /* 24 Sep (Bazil: "more proper and detailed"): an inner highlight on the red link and a pair of bolt heads
             where the links are pinned */
          `<path d="M${n(BX - 9)} ${n(CY - 4.2)}A9 4.5 0 0 1 ${n(BX + 2)} ${n(CY - 5.3)}" fill="none" stroke="${P.SIG_CHAM_L}" stroke-width="1.5" stroke-linecap="round" opacity=".9"/>`,
          `<circle cx="${n(AX - RX - 1)}" cy="${n(CY + 1)}" r="2.2" fill="${P.LFT_HI}"/><circle cx="${n(BX + RX + 1)}" cy="${n(CY + 1)}" r="2.2" fill="${P.SIG_DEEP}"/>`,
          /* the key lands on the upper left of the grey link, as it does on every other mark */
          `<path d="M${n(a0[0])} ${n(a0[1])}A${n(RX)} ${n(RY)} 0 0 1 ${n(a1[0])} ${n(a1[1])}" fill="none" stroke="${P.CHAM_L}" stroke-width="1.8" stroke-linecap="round"/>`,
        ],
      }
    },
  },
]



/* ---------------------------------------------------------------- React emitter
   Ship as components, not .svg assets: the id prefix is then a compile-time constant and cannot be
   duplicated by copy-paste, which is the failure that makes one inline mark wear another's
   gradient when six share a document id space. */
const JSXATTR = { 'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin', 'stroke-opacity': 'strokeOpacity',
  'fill-opacity': 'fillOpacity', 'stop-color': 'stopColor', 'stop-opacity': 'stopOpacity',
  'clip-path': 'clipPath', 'clip-rule': 'clipRule', 'fill-rule': 'fillRule',
  'aria-hidden': 'aria-hidden', 'class': 'className', 'xmlns': 'xmlns' }
export function toJSX (svg) {
  return svg.replace(/([a-zA-Z-]+)=/g, (m, a) => (JSXATTR[a] || a) + '=')
}
export function emitReact () {
  const parts = MARKS.map(m => {
    const name = 'Mark' + m.slot[0].toUpperCase() + m.slot.slice(1)
    let svg = toJSX(buildMark(m))
    /* merge, never override: spreading props first would let the component's own className win
       and silently drop the caller's sizing class */
    svg = svg.replace('className="iaq-mk"', 'className={'+"'iaq-mk' + (p.className ? ' ' + p.className : '')"+'}')
    svg = svg.replace('<svg ', '<svg {...p} ')
    return `export function ${name} (p) {\n  return (\n    ${svg}\n  )\n}`
  })
  return `/* GENERATED by scripts_marks_build.mjs — do not edit by hand.
   IAQ "Hard Anodise" Tier 2 figure marks. One camera (2:1 dimetric, 26.565deg), one lamp
   (userSpaceOnUse 21,0 -> 75,96 on every face in every mark), two materials, one accent each.
   Decorative: each sits beside a visible .num and .lab, so aria-hidden is correct.
   Regenerate with:  node scripts_marks_build.mjs --react > src/components/Marks.jsx  */\nimport React from 'react'\n\n${parts.join('\n\n')}\n`
}


/* 24 Sep · the FAQ mark (Bazil: "create an isometric on top left representing this section"): a stack of three
   answered sheets, the top one carrying its lines, and the one signal part, a red tick plate, lying on it.
   Same lamp, same palette, same lattice as the six cycle marks. */
export const FAQ_MARKS = [
  {
    slot: 'faq', title: 'Questions, answered',
    /* 24 Sep, second try (Bazil on the sheets-and-tick: "what is this icon"): a question mark built from blocks on
       the lattice, lying on the floor and extruded, the dot the one signal part. Reads as a "?" at 84px. */
    scale: 1.0, masses: [],
    custom: id => ({
      defs: [bodyGrad(id, 'top', P.TOP_HI, P.TOP_LO), bodyGrad(id, 'dot', P.SIG_LIT, P.SIG_SHADE)],
      body: (() => {
        const O = []
        const rows = ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..']
        const cell = 7, t = 9, cols = 5
        const cx0 = 48, cy0 = 42
        const uc = (cols - 1) / 2, vc = (rows.length - 1) / 2
        const cells = []
        rows.forEach((r, ri) => [...r].forEach((ch, ci) => { if (ch === '#') cells.push({ ci, ri, dot: ri === rows.length - 1 }) }))
        /* back to front, so nearer blocks paint over further ones */
        cells.sort((a, b) => (a.ci + a.ri) - (b.ci + b.ri))
        for (const c of cells) {
          const u = (c.ci - uc) * cell, v = (c.ri - vc) * cell
          const pl = plan(cx0 + (u - v), cy0 + (u + v) / 2, cell / 2, cell / 2)
          const R = c.dot ? P.SIG_WALL : P.RGT_HI, L = c.dot ? P.SIG_DEEP : P.LFT_HI
          O.push(`<path d="${poly([pl.R, pl.F, down(pl.F, t), down(pl.R, t)])}" fill="${R}"/>`)
          O.push(`<path d="${poly([pl.F, pl.L, down(pl.L, t), down(pl.F, t)])}" fill="${L}"/>`)
          if (c.dot) O.push(`<g class="mk-mv"><path d="${poly([pl.T, pl.R, pl.F, pl.L])}" fill="url(#${id}-dot)"/></g>`)
          else O.push(`<path d="${poly([pl.T, pl.R, pl.F, pl.L])}" fill="url(#${id}-top)"/>`)
        }
        return O
      })(),
    }),
  },
]

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === '--react') { process.stdout.write(emitReact()); process.exit(0) }
  if (process.argv[2] === '--faq') {
    const out = FAQ_MARKS.map(m => '  ' + JSON.stringify(m.slot) + ': ' + JSON.stringify(buildMark(m)))
    process.stdout.write('/* GENERATED by scripts_marks_build.mjs --faq. Do not edit by hand. */\nexport const FAQ_SVG = {\n' + out.join(',\n') + '\n}\n')
    process.exit(0)
  }
  if (process.argv[2] === '--cycle') {
    /* the scene wants raw SVG strings it can turn into textures, not React components */
    const out = CYCLE_MARKS.map(m => '  ' + JSON.stringify(m.slot) + ': ' + JSON.stringify(buildMark(m)))
    process.stdout.write('/* GENERATED by scripts_marks_build.mjs --cycle. Do not edit by hand.\n' +
      '   The six delivery-cycle marks, in the same Hard Anodise system as the stat marks: one\n' +
      '   lamp, one palette, one material. Consumed by src/scenes/home.js as canvas textures. */\n' +
      'export const CYCLE_SVG = {\n' + out.join(',\n') + '\n}\n')
    process.exit(0)
  }
  const out = process.argv[2] || '.marks'
  fs.mkdirSync(out, { recursive: true })
  for (const m of MARKS) {
    const svg = buildMark(m)
    fs.writeFileSync(path.join(out, `iaq-${m.slot}.svg`), svg)
    console.log('iaq-' + m.slot, svg.length + 'B')
  }
}
