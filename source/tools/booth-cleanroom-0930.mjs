/* 30 Sep 2026: the booth's cleanroom drawings for Direction C (Bazil: "extract the 3d clean room part and focus more to this",
   "make sure clean room construction"). Drawn on the Design tab's own engine (public/design/iso/iso-engine.mjs, read only):
   true isometric, three tone greys, one red part per drawing, no ground patch, no glow, no text in the drawing.

   cleanroom-build   a cleanroom being built, in four layers lifted apart on one axis, in the order it goes up:
                       raised access floor   the slab, pedestals, tiles half laid (the front bay still bare), perforated tiles,
                                             a stack of tiles waiting
                       wall panels           sandwich panels on their floor track, a door and a vision panel, the return air
                                             chase along the back with its low grilles; ONE panel (red) being lowered into its gap
                       ceiling grid          the grid on its hanger rods, fan filter units in most cells, the front bay still open
                       air handling          the air handling unit, its supply duct dropping to the ceiling, the chilled water pair
   crane             a tower crane, tall and narrow, for the aisle column: the load on its hook is a fan filter unit (red)

   Writes src/assets/booth/iso-c/<name>.svg (the engine's own file format) and <name>.json (the frame and the anchor
   points, in the SVG's viewBox units, where each layer's leader starts). tools/booth-iso-0929.mjs turns them into the
   booth's vector set. Usage: node tools/booth-cleanroom-0930.mjs */
import fs from 'node:fs'
import { GREY, RED, SW, P, line, poly, rectOn, outline, dotEl, Scene, elsOf, bboxOf, writeSet } from '../public/design/iso/iso-engine.mjs'

const OUT = 'src/assets/booth/iso-c'
fs.mkdirSync(OUT, { recursive: true })
const deep = (axis, a, u0, u1, w0, w1) => poly(rectOn(axis, a, u0, u1, w0, w1), GREY.deep, GREY.edge, SW)

/* the room: 19.2 by 12 units (16 by 10 floor tiles of 1.2) */
const X1 = 19.2, Y1 = 12
const Z = { floor: 0, wall: 4.2, ceil: 20, ahu: 24.6 }
const WH = 5.6                 // wall height

function floor(S) {
  const z0 = Z.floor, zs = z0 + 0.5, zt = zs + 1.0, zt1 = zt + 0.16
  S.box(0, 0, z0, X1, Y1, zs, { deco: [line([0, Y1, z0 + 0.25], [X1, Y1, z0 + 0.25]), line([X1, 0, z0 + 0.25], [X1, Y1, z0 + 0.25])] })
  /* the bare bay at the front right: x 10.8 to 19.2, y 7.2 to 12 */
  const bx = 10.8, by = 7.2
  /* pedestals along the two open edges under the laid tiles, and across the bare bay */
  const ped = (x, y) => {
    S.box(x - 0.16, y - 0.16, zs, x + 0.16, y + 0.16, zs + 0.06)
    S.tube([[x, y, zs + 0.06], [x, y, zt - 0.08]], 0.06)
    S.box(x - 0.2, y - 0.2, zt - 0.08, x + 0.2, y + 0.2, zt - 0.02)
  }
  for (let x = 0.6; x < bx; x += 1.2) ped(x, Y1 - 0.35)
  for (let y = 0.6; y < by; y += 1.2) ped(X1 - 0.35, y)
  for (let x = bx + 0.6; x < X1; x += 1.2) for (let y = by + 0.6; y < Y1; y += 1.2) ped(x, y)
  /* stringers across the bare bay, the next tiles' seats */
  for (let y = by + 1.2; y < Y1 - 0.01; y += 1.2) S.box(bx, y - 0.04, zt - 0.1, X1 - 0.1, y + 0.04, zt - 0.02)
  /* the laid tiles: back field and front left; seams on the tile grid; a block of perforated tiles where the air returns */
  const tiles = (x0, x1, y0, y1) => {
    const d = []
    for (let x = x0 + 1.2; x < x1 - 0.01; x += 1.2) d.push(line([x, y0, zt1], [x, y1, zt1]))
    for (let y = y0 + 1.2; y < y1 - 0.01; y += 1.2) d.push(line([x0, y, zt1], [x1, y, zt1]))
    return d
  }
  const perf = []
  for (const [i, j] of [[3, 2], [4, 2], [5, 2], [3, 3], [4, 3], [5, 3], [3, 4], [4, 4], [5, 4], [11, 2], [12, 2], [11, 3], [12, 3]]) {
    const px = i * 1.2, py = j * 1.2
    perf.push(poly(rectOn('z', zt1, px + 0.08, px + 1.12, py + 0.08, py + 1.12), GREY.top, GREY.seam, SW))
    for (let a = 0; a < 5; a++) for (let b = 0; b < 5; b++) perf.push(dotEl([px + 0.24 + a * 0.18, py + 0.24 + b * 0.18, zt1], 0.035, 'z', GREY.deep))
  }
  S.box(0, 0, zt, X1, by, zt1, { deco: [...tiles(0, X1, 0, by), ...perf] })
  S.box(0, by, zt, bx, Y1, zt1, { deco: tiles(0, bx, by, Y1) })
  /* a stack of tiles waiting at the edge of the bare bay */
  for (let k = 0; k < 4; k++) S.box(8.7, 5.4, zt1 + k * 0.14, 9.9, 6.6, zt1 + (k + 1) * 0.14 - 0.02, { deco: [line([8.7, 6.6, zt1 + k * 0.14 + 0.06], [9.9, 6.6, zt1 + k * 0.14 + 0.06])] })
}

function walls(S) {
  const z0 = Z.wall, z1 = z0 + WH, t = 0.3, cd = 1.5          // panel thickness, chase depth
  /* the floor track the panels stand in */
  S.box(cd, 0, z0 - 0.12, X1, t + 0.1, z0)
  S.box(0, 0, z0 - 0.12, t + 0.1, Y1, z0)
  /* the return air chase along the back left: a double wall, low grilles on its room face, open to the ceiling above */
  const ch = []
  for (let y = 0.6; y + 1.6 < Y1; y += 2.4) {
    ch.push(poly(rectOn('x', cd, y + 0.2, y + 1.9, z0 + 0.35, z0 + 1.35), GREY.right, GREY.edge, SW))
    for (let z = z0 + 0.5; z < z0 + 1.3; z += 0.16) ch.push(line([cd, y + 0.3, z], [cd, y + 1.8, z], GREY.deep, SW))
  }
  for (let y = 1.2; y < Y1 - 0.01; y += 1.2) ch.push(line([cd, y, z0], [cd, y, z1]))
  ch.push(poly(rectOn('z', z1, 0.25, cd - 0.25, 0.3, Y1 - 0.3), GREY.deep, GREY.edge, SW))
  S.box(0, 0, z0, cd, Y1, z1, { deco: ch })
  /* the panels along the back right, a gap for the one being set; a double door and a vision panel */
  const gap = [13.5, 14.7]
  const face = (x0, x1) => {
    const d = []
    for (let x = x0 + 1.2; x < x1 - 0.01; x += 1.2) d.push(line([x, t, z0], [x, t, z1]))
    return d
  }
  const run1 = face(cd, gap[0])
  /* the double door (x 4.2 to 6.6) */
  run1.push(poly(rectOn('y', t, 4.3, 6.5, z0, z0 + 2.6), GREY.top, GREY.edge, SW), line([5.4, t, z0], [5.4, t, z0 + 2.6], GREY.edge, SW),
    poly(rectOn('y', t, 4.55, 5.2, z0 + 1.7, z0 + 2.35), GREY.deep, GREY.edge, SW), poly(rectOn('y', t, 5.6, 6.25, z0 + 1.7, z0 + 2.35), GREY.deep, GREY.edge, SW),
    dotEl([5.25, t, z0 + 1.2], 0.05, 'y', GREY.edge), dotEl([5.55, t, z0 + 1.2], 0.05, 'y', GREY.edge))
  /* the vision panel (x 8.7 to 11.1) */
  run1.push(poly(rectOn('y', t, 8.75, 11.05, z0 + 1.6, z0 + 3.0), GREY.deep, GREY.edge, SW), line([9.9, t, z0 + 1.6], [9.9, t, z0 + 3.0], GREY.edge, SW))
  S.box(cd, 0, z0, gap[0], t, z1, { deco: run1 })
  S.box(gap[1], 0, z0, X1, t, z1, { deco: face(gap[1], X1) })
  /* the one being set: lowered into its gap on two slings from a spreader, in red */
  const lift = 2.0
  S.box(gap[0] + 0.04, 0.02, z0 + lift, gap[1] - 0.04, t - 0.02, z1 + lift, { pal: RED, deco: [line([gap[0] + 0.04, t - 0.02, z1 + lift - 0.4], [gap[1] - 0.04, t - 0.02, z1 + lift - 0.4], RED.seam, SW)] })
  const sp = z1 + lift + 1.5
  S.group([gap[0], 0.1, z1 + lift, gap[1], 0.2, sp], [line([gap[0] + 0.15, 0.15, z1 + lift], [(gap[0] + gap[1]) / 2, 0.15, sp], GREY.edge, SW), line([gap[1] - 0.15, 0.15, z1 + lift], [(gap[0] + gap[1]) / 2, 0.15, sp], GREY.edge, SW)])
  S.box((gap[0] + gap[1]) / 2 - 0.12, 0.05, sp, (gap[0] + gap[1]) / 2 + 0.12, 0.25, sp + 0.3)
  S.group([(gap[0] + gap[1]) / 2 - 0.02, 0.14, sp + 0.3, (gap[0] + gap[1]) / 2 + 0.02, 0.16, sp + 1.2], [line([(gap[0] + gap[1]) / 2, 0.15, sp + 0.3], [(gap[0] + gap[1]) / 2, 0.15, sp + 1.2], GREY.edge, SW)])
}

function ceiling(S) {
  const z0 = Z.ceil, zb = z0 + 0.22
  const xs = [], ys = []
  for (let x = 0; x <= X1 + 1e-9; x += 2.4) xs.push(x)
  for (let y = 0; y <= Y1 + 1e-9; y += 2.4) ys.push(y)
  /* fan filter units in the cells; the front right bay still open, the grid bare there */
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
    const a = xs[i] + 0.08, b = xs[i + 1] - 0.08, c = ys[j] + 0.08, e = ys[j + 1] - 0.08
    if (i >= 5 && j >= 3) continue
    S.box(a + 0.04, c + 0.04, z0 + 0.02, b - 0.04, e - 0.04, z0 + 0.55, { deco: [line([a + 0.04, e - 0.04, z0 + 0.3], [b - 0.04, e - 0.04, z0 + 0.3]), line([b - 0.04, c + 0.04, z0 + 0.3], [b - 0.04, e - 0.04, z0 + 0.3])] })
    const mx = (a + b) / 2 - 0.15, my = (c + e) / 2
    S.tube([[mx, my, z0 + 0.55], [mx, my, z0 + 0.82]], 0.5, { deco: [dotEl([mx, my, z0 + 0.82], 0.13, 'z', GREY.right, GREY.edge)] })
  }
  for (const x of xs) S.box(x - 0.08, 0, z0, x + 0.08, Y1, zb)
  for (const y of ys) for (let i = 0; i < xs.length - 1; i++) S.box(xs[i] + 0.08, y - 0.08, z0, xs[i + 1] - 0.08, y + 0.08, zb)
  /* hanger rods up to the structure */
  for (let i = 0; i < xs.length; i += 2) for (let j = 0; j < ys.length; j += 2) S.tube([[xs[i], ys[j], zb], [xs[i], ys[j], zb + 2.2]], 0.04)
}

function airHandling(S) {
  const z0 = Z.ahu
  /* the air handling unit: louvred intake, access doors, the fan section */
  const d = []
  for (let z = z0 + 0.4; z < z0 + 2.6; z += 0.26) d.push(line([1.4, 6.2, z], [3.6, 6.2, z]))
  for (const u of [4.4, 6.7, 9.0]) d.push(outline(rectOn('y', 6.2, u, u + 1.6, z0 + 0.35, z0 + 2.6)), dotEl([u + 1.35, 6.2, z0 + 1.45], 0.07, 'y', GREY.deep))
  d.push(outline(rectOn('x', 13.2, 2.4, 5.8, z0 + 0.35, z0 + 2.6)))
  S.box(1.2, 2, z0, 13.2, 6.2, z0 + 3.0, { deco: d })
  S.box(9.4, 2.6, z0 + 3.0, 12.6, 5.6, z0 + 3.7, { deco: [line([9.4, 5.6, z0 + 3.35], [12.6, 5.6, z0 + 3.35])] })
  /* the chilled water pair into the coil */
  S.pipe([[7.2, 6.8, z0 + 0.6], [7.2, 9.6, z0 + 0.6]], 0.16, { rings: [0.6] })
  S.pipe([[8.0, 6.8, z0 + 0.6], [8.0, 9.6, z0 + 0.6]], 0.16, { rings: [0.6] })
  S.box(6.9, 6.2, z0 + 0.3, 8.3, 6.8, z0 + 0.9)
  /* the supply duct: out of the unit's end, along, and down to the ceiling plenum */
  const joints = [14.6, 16.0]
  S.box(13.2, 3.0, z0 + 0.7, 17.4, 5.2, z0 + 2.3, { deco: [...joints.map(x => line([x, 5.2, z0 + 0.7], [x, 5.2, z0 + 2.3])), ...joints.map(x => line([x, 3.0, z0 + 2.3], [x, 5.2, z0 + 2.3]))] })
  S.box(15.4, 3.0, z0 - 2.4, 17.4, 5.2, z0 + 0.7, { deco: [line([15.4, 5.2, z0 - 0.9], [17.4, 5.2, z0 - 0.9]), line([17.4, 3.0, z0 - 0.9], [17.4, 5.2, z0 - 0.9])] })
}

function build(name, fn) {
  const S = new Scene(name)
  fn(S)
  const els = elsOf(S)
  return { els, bb: bboxOf(els) }
}
function write(name, title, b, anchors, pad = 10) {
  const W = Math.ceil(b.bb[2] - b.bb[0] + 2 * pad), H = Math.ceil(b.bb[3] - b.bb[1] + 2 * pad)
  writeSet(OUT, [{ slug: name, title, els: b.els, bb: b.bb }], { W, H })
  const dx = W / 2 - (b.bb[0] + b.bb[2]) / 2, dy = H / 2 - (b.bb[1] + b.bb[3]) / 2
  const a = Object.fromEntries(Object.entries(anchors).map(([k, p]) => { const [x, y] = P(p); return [k, [+(x + dx).toFixed(1), +(y + dy).toFixed(1)]] }))
  fs.writeFileSync(`${OUT}/${name}.json`, JSON.stringify({ vb: `0 0 ${W} ${H}`, anchors: a }, null, 1))
  console.log(name, W, 'x', H, a)
}

/* ---------------------------------------------------------------- the cleanroom, complete, in construction layers
   30 Sep, evening (Bazil: "isn't the cleanroom supposed to be more complete"): the room stands whole on its raised floor
   (panels all round, the front two cut low so the inside shows, a double door, a pass box and a viewing window in the back
   wall, the return air chase along the left, three process tools inside), the ceiling grid lifted above it fully populated
   with fan filter units and light panels, and the air handling unit with its supply duct above that. ONE red part: the fan
   filter unit under test. The earlier half built version is in src/_backups/booth-cd-0930/round4/ */
const ZC = { ceil: 16.2, ahu: 21.4 }
function floorAndRoom(S) {
  const zs = 0.5, zt = zs + 1.0, z0 = zt + 0.16, z1 = z0 + 5.6, t = 0.3, cd = 1.5, lowH = 1.3
  S.box(0, 0, 0, X1, Y1, zs, { deco: [line([0, Y1, 0.25], [X1, Y1, 0.25]), line([X1, 0, 0.25], [X1, Y1, 0.25])] })
  const ped = (x, y) => { S.box(x - 0.16, y - 0.16, zs, x + 0.16, y + 0.16, zs + 0.06); S.tube([[x, y, zs + 0.06], [x, y, zt - 0.08]], 0.06); S.box(x - 0.2, y - 0.2, zt - 0.08, x + 0.2, y + 0.2, zt - 0.02) }
  for (let x = 0.6; x < X1; x += 1.2) ped(x, Y1 - 0.35)
  for (let y = 0.6; y < Y1 - 0.5; y += 1.2) ped(X1 - 0.35, y)
  /* the raised floor, fully tiled, perforated where the air returns */
  const d = []
  for (let x = 1.2; x < X1 - 0.01; x += 1.2) d.push(line([x, 0, z0], [x, Y1, z0]))
  for (let y = 1.2; y < Y1 - 0.01; y += 1.2) d.push(line([0, y, z0], [X1, y, z0]))
  for (const [i, j] of [[3, 8], [4, 8], [5, 8], [6, 8], [9, 8], [10, 8], [11, 8], [12, 8], [3, 9], [4, 9], [5, 9], [6, 9], [9, 9], [10, 9], [11, 9], [12, 9]]) {
    const px = i * 1.2, py = j * 1.2
    d.push(poly(rectOn('z', z0, px + 0.08, px + 1.12, py + 0.08, py + 1.12), GREY.top, GREY.seam, SW))
    for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) d.push(dotEl([px + 0.26 + a * 0.2, py + 0.26 + b * 0.2, z0], 0.04, 'z', GREY.deep))
  }
  S.box(0, 0, zt, X1, Y1, z0, { deco: d })
  /* the return air chase along the left: low grilles on its room face, open to the ceiling void */
  const ch = []
  for (let y = 0.6; y + 1.6 < Y1 - 0.3; y += 2.4) {
    ch.push(poly(rectOn('x', cd, y + 0.2, y + 1.9, z0 + 0.3, z0 + 1.3), GREY.right, GREY.edge, SW))
    for (let z = z0 + 0.45; z < z0 + 1.25; z += 0.16) ch.push(line([cd, y + 0.3, z], [cd, y + 1.8, z], GREY.deep, SW))
  }
  for (let y = 1.2; y < Y1 - 0.31; y += 1.2) ch.push(line([cd, y, z0], [cd, y, z1]))
  ch.push(poly(rectOn('z', z1, 0.25, cd - 0.25, 0.3, Y1 - 0.6), GREY.deep, GREY.edge, SW))
  S.box(0, 0, z0, cd, Y1 - 0.3, z1, { deco: ch })
  /* the back wall: panels, a double door, a viewing window, a pass box through it */
  const bw = []
  for (let x = cd + 1.2; x < X1 - 0.01; x += 1.2) bw.push(line([x, t, z0], [x, t, z1]))
  bw.push(poly(rectOn('y', t, 4.3, 6.5, z0, z0 + 2.6), GREY.top, GREY.edge, SW), line([5.4, t, z0], [5.4, t, z0 + 2.6], GREY.edge, SW),
    poly(rectOn('y', t, 4.55, 5.2, z0 + 1.7, z0 + 2.35), GREY.deep, GREY.edge, SW), poly(rectOn('y', t, 5.6, 6.25, z0 + 1.7, z0 + 2.35), GREY.deep, GREY.edge, SW),
    dotEl([5.25, t, z0 + 1.2], 0.05, 'y', GREY.edge), dotEl([5.55, t, z0 + 1.2], 0.05, 'y', GREY.edge))
  bw.push(poly(rectOn('y', t, 8.75, 12.35, z0 + 1.5, z0 + 3.0), GREY.deep, GREY.edge, SW), line([10.55, t, z0 + 1.5], [10.55, t, z0 + 3.0], GREY.edge, SW))
  S.box(cd, 0, z0, X1, t, z1, { deco: bw })
  /* the pass box, through the wall at bench height, its small door on the room side */
  S.box(14.3, t, z0 + 1.1, 15.7, t + 0.6, z0 + 2.3, { deco: [poly(rectOn('y', t + 0.6, 14.45, 15.55, z0 + 1.25, z0 + 2.15), GREY.top, GREY.edge, SW), dotEl([15.4, t + 0.6, z0 + 1.7], 0.05, 'y', GREY.edge)] })
  /* the front two walls, cut low so the room shows */
  const lw1 = [], lw2 = []
  for (let x = cd + 1.2; x < X1 - 0.31; x += 1.2) lw1.push(line([x, Y1, z0], [x, Y1, z0 + lowH]))
  for (let y = 1.2; y < Y1 - 0.01; y += 1.2) lw2.push(line([X1, y, z0], [X1, y, z0 + lowH]))
  S.box(cd, Y1 - t, z0, X1 - t, Y1, z0 + lowH, { deco: lw1 })
  S.box(X1 - t, t, z0, X1, Y1, z0 + lowH, { deco: lw2 })
  /* three process tools on the raised floor: the mainframe, its front end and load ports, two chambers */
  for (const x of [3.2, 8.4, 13.6]) {
    S.box(x, 3.0, z0, x + 4.0, 5.6, z0 + 2.3, { deco: [outline(rectOn('y', 5.6, x + 0.25, x + 3.75, z0 + 0.25, z0 + 2.05)), poly(rectOn('y', 5.6, x + 2.6, x + 3.6, z0 + 0.6, z0 + 1.6), GREY.deep, GREY.edge, SW)] })
    S.box(x + 0.3, 5.6, z0, x + 3.7, 6.9, z0 + 1.6, { deco: [outline(rectOn('x', x + 3.7, 5.8, 6.7, z0 + 0.2, z0 + 1.4))] })
    for (const u of [x + 0.6, x + 2.1]) S.box(u, 6.9, z0 + 0.85, u + 1.2, 7.25, z0 + 1.0)
    for (const u of [x + 0.3, x + 2.5]) S.box(u, 3.3, z0 + 2.3, u + 1.2, 4.6, z0 + 3.1)
  }
}
function ceilingFull(S) {
  const z0 = ZC.ceil, zb = z0 + 0.22
  const xs = [], ys = []
  for (let x = 0; x <= X1 + 1e-9; x += 2.4) xs.push(x)
  for (let y = 0; y <= Y1 + 1e-9; y += 2.4) ys.push(y)
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
    const a = xs[i] + 0.08, b = xs[i + 1] - 0.08, c = ys[j] + 0.08, e = ys[j + 1] - 0.08
    /* light panels in a pattern between the fan filter units */
    if ((i + j) % 3 === 1) {
      S.box(a + 0.04, c + 0.04, z0 + 0.02, b - 0.04, e - 0.04, z0 + 0.3, { deco: [poly(rectOn('z', z0 + 0.3, a + 0.4, b - 0.4, c + 0.4, e - 0.4), GREY.left, GREY.edge, SW)] })
      continue
    }
    const red = i === 6 && j === 3, pal = red ? RED : GREY
    S.box(a + 0.04, c + 0.04, z0 + 0.02, b - 0.04, e - 0.04, z0 + 0.55, { pal, deco: [line([a + 0.04, e - 0.04, z0 + 0.3], [b - 0.04, e - 0.04, z0 + 0.3], pal.seam), line([b - 0.04, c + 0.04, z0 + 0.3], [b - 0.04, e - 0.04, z0 + 0.3], pal.seam)] })
    const mx = (a + b) / 2 - 0.15, my = (c + e) / 2
    S.tube([[mx, my, z0 + 0.55], [mx, my, z0 + 0.82]], 0.5, { pal, deco: [dotEl([mx, my, z0 + 0.82], 0.13, 'z', pal.right, pal.edge)] })
  }
  for (const x of xs) S.box(x - 0.08, 0, z0, x + 0.08, Y1, zb)
  for (const y of ys) for (let i = 0; i < xs.length - 1; i++) S.box(xs[i] + 0.08, y - 0.08, z0, xs[i + 1] - 0.08, y + 0.08, zb)
  for (let i = 0; i < xs.length; i += 2) for (let j = 0; j < ys.length; j += 2) S.tube([[xs[i], ys[j], zb], [xs[i], ys[j], zb + 2.0]], 0.04)
}
function airAbove(S) {
  const z0 = ZC.ahu
  const d = []
  for (let z = z0 + 0.4; z < z0 + 2.6; z += 0.26) d.push(line([1.4, 6.2, z], [3.6, 6.2, z]))
  for (const u of [4.4, 6.7, 9.0]) d.push(outline(rectOn('y', 6.2, u, u + 1.6, z0 + 0.35, z0 + 2.6)), dotEl([u + 1.35, 6.2, z0 + 1.45], 0.07, 'y', GREY.deep))
  d.push(outline(rectOn('x', 13.2, 2.4, 5.8, z0 + 0.35, z0 + 2.6)))
  S.box(1.2, 2, z0, 13.2, 6.2, z0 + 3.0, { deco: d })
  S.box(9.4, 2.6, z0 + 3.0, 12.6, 5.6, z0 + 3.7, { deco: [line([9.4, 5.6, z0 + 3.35], [12.6, 5.6, z0 + 3.35])] })
  S.pipe([[7.2, 6.8, z0 + 0.6], [7.2, 9.6, z0 + 0.6]], 0.16, { rings: [0.6] })
  S.pipe([[8.0, 6.8, z0 + 0.6], [8.0, 9.6, z0 + 0.6]], 0.16, { rings: [0.6] })
  S.box(6.9, 6.2, z0 + 0.3, 8.3, 6.8, z0 + 0.9)
  const joints = [14.6, 16.0]
  S.box(13.2, 3.0, z0 + 0.7, 17.4, 5.2, z0 + 2.3, { deco: [...joints.map(x => line([x, 5.2, z0 + 0.7], [x, 5.2, z0 + 2.3])), ...joints.map(x => line([x, 3.0, z0 + 2.3], [x, 5.2, z0 + 2.3]))] })
  S.box(15.4, 3.0, z0 - 2.4, 17.4, 5.2, z0 + 0.7, { deco: [line([15.4, 5.2, z0 - 0.9], [17.4, 5.2, z0 - 0.9]), line([17.4, 3.0, z0 - 0.9], [17.4, 5.2, z0 - 0.9])] })
}
const cb = build('cleanroom-build', S => { floorAndRoom(S); ceilingFull(S); airAbove(S) })
write('cleanroom-build', 'A complete cleanroom in construction layers: the room on its raised floor with its tools inside, the ceiling grid with fan filter units and light panels lifted above it, the air handling above that', cb, {
  floor: [X1, 0, 1.0],
  walls: [X1, 0, 1.66 + 4.2],
  ceiling: [X1, 0, ZC.ceil + 0.3],
  air: [17.4, 3.0, ZC.ahu + 1.5],
})

/* ---------------------------------------------------------------- the tower crane, with a fan filter unit on its hook */
function crane(S) {
  const mx = 0, my = 0, h = 0.62, zb = 0, MT = 120
  S.box(mx - 1.4, my - 1.4, zb, mx + 1.4, my + 1.4, zb + 0.6)
  for (const [dx, dy] of [[-h, -h], [h, -h], [-h, h], [h, h]]) S.box(mx + dx - 0.09, my + dy - 0.09, zb + 0.6, mx + dx + 0.09, my + dy + 0.09, MT)
  const lx = [], ly = []
  for (let z = zb + 0.6, i = 0; z < MT - 0.1; z += 1.6, i++) {
    const z1 = Math.min(z + 1.6, MT)
    lx.push(line([mx + h + 0.09, my - h, z], [mx + h + 0.09, my + h, z], GREY.edge, SW), line([mx + h + 0.09, i % 2 ? my - h : my + h, z], [mx + h + 0.09, i % 2 ? my + h : my - h, z1], GREY.edge, SW))
    ly.push(line([mx - h, my + h + 0.09, z], [mx + h, my + h + 0.09, z], GREY.edge, SW), line([i % 2 ? mx - h : mx + h, my + h + 0.09, z], [i % 2 ? mx + h : mx - h, my + h + 0.09, z1], GREY.edge, SW))
  }
  S.group([mx + h + 0.09, my - h, zb, mx + h + 0.1, my + h, MT], lx)
  S.group([mx - h, my + h + 0.09, zb, mx + h, my + h + 0.1, MT], ly)
  S.tube([[mx, my, MT], [mx, my, MT + 0.45]], 0.95, { rings: [0.2] })
  const JZ = MT + 0.45
  S.box(mx - 0.5, my + 0.95, MT - 0.7, mx + 0.5, my + 2.0, MT + 0.45, { deco: [deep('y', my + 2.0, mx - 0.38, mx + 0.38, MT - 0.35, MT + 0.3), deep('x', mx + 0.5, my + 1.1, my + 1.85, MT - 0.35, MT + 0.3)] })
  const jx0 = mx + 0.9, jx1 = 8.2, yb = [my - 0.45, my + 0.45], jt = JZ + 1.1
  for (const y of yb) S.box(jx0, y - 0.05, JZ, jx1, y + 0.05, JZ + 0.1)
  S.box(jx0, my - 0.05, jt - 0.05, jx1 - 0.4, my + 0.05, jt + 0.05)
  const lace = []
  for (let x = jx0; x < jx1 - 0.7; x += 0.7) lace.push(line([x, yb[1], JZ + 0.1], [x + 0.7, my, jt - 0.05], GREY.edge, SW), line([x + 0.7, yb[1], JZ + 0.1], [x + 0.7, my, jt - 0.05], GREY.edge, SW))
  S.group([jx0, my, JZ, jx1, yb[1], jt], lace)
  const cx0 = -4.2, cx1 = mx - 0.9
  for (const y of yb) S.box(cx0, y - 0.06, JZ, cx1, y + 0.06, JZ + 0.14)
  for (let k = 0; k < 3; k++) S.box(cx0 + 0.15 + k * 0.5, my - 0.6, JZ - 1.4, cx0 + 0.6 + k * 0.5, my + 0.6, JZ + 0.35)
  const apex = [mx, my, JZ + 2.6]
  S.tube([[mx - 0.6, my, JZ + 0.1], apex], 0.07); S.tube([[mx + 0.6, my, JZ + 0.1], apex], 0.07)
  S.group([cx0, my - 0.1, JZ, jx1, my + 0.1, apex[2]], [line(apex, [jx1 - 0.5, my, jt + 0.05], GREY.edge, SW), line(apex, [cx0 + 0.4, my, JZ + 0.14], GREY.edge, SW)])
  /* the trolley, the hoist ropes, the hook block, and the fan filter unit on its slings (red) */
  const xt = 6.2, HZ = JZ - 40
  S.box(xt - 0.45, yb[0] - 0.08, JZ - 0.3, xt + 0.45, yb[1] + 0.08, JZ)
  S.group([xt - 0.12, my - 0.02, HZ, xt + 0.12, my + 0.02, JZ - 0.3], [line([xt - 0.1, my, JZ - 0.3], [xt - 0.1, my, HZ], GREY.edge, SW), line([xt + 0.1, my, JZ - 0.3], [xt + 0.1, my, HZ], GREY.edge, SW)])
  S.box(xt - 0.22, my - 0.24, HZ - 0.5, xt + 0.22, my + 0.24, HZ)
  const lz = HZ - 2.2
  S.group([xt - 1, my - 1, lz + 0.62, xt + 1, my + 1, HZ - 0.5], [line([xt, my, HZ - 0.5], [xt - 0.9, my - 0.9, lz + 0.62], GREY.edge, SW), line([xt, my, HZ - 0.5], [xt + 0.9, my + 0.9, lz + 0.62], GREY.edge, SW), line([xt, my, HZ - 0.5], [xt + 0.9, my - 0.9, lz + 0.62], GREY.edge, SW), line([xt, my, HZ - 0.5], [xt - 0.9, my + 0.9, lz + 0.62], GREY.edge, SW)])
  S.box(xt - 1.0, my - 1.0, lz, xt + 1.0, my + 1.0, lz + 0.5, { pal: RED })
  S.tube([[xt - 0.1, my, lz + 0.5], [xt - 0.1, my, lz + 0.62]], 0.46, { pal: RED })
}
const cr = build('crane', crane)
write('crane', 'A tower crane lifting a fan filter unit', cr, {})

/* ---------------------------------------------------------------- the stack, for the aisle column: one bay of the same
   cleanroom (3 by 3 tiles), its four layers lifted far apart so it stands tall and narrow. Red: the panel being set */
function stack(S) {
  const A = 3.6, zF = 0, zW = 11, zC = 27, zA = 38
  /* raised floor: slab, pedestals on the open edges, tiles with one perforated and one still to lay */
  S.box(0, 0, zF, A, A, zF + 0.4)
  const zt = zF + 1.3, zt1 = zt + 0.16
  const ped = (x, y) => { S.tube([[x, y, zF + 0.4], [x, y, zt - 0.06]], 0.07); S.box(x - 0.2, y - 0.2, zt - 0.06, x + 0.2, y + 0.2, zt) }
  for (const x of [0.6, 1.8]) ped(x, A - 0.35)
  for (const y of [0.6, 1.8]) ped(A - 0.35, y)
  ped(3.0, 3.0)
  const d = [line([1.2, 0, zt1], [1.2, A, zt1]), line([2.4, 0, zt1], [2.4, 2.4, zt1]), line([0, 1.2, zt1], [A, 1.2, zt1]), line([0, 2.4, zt1], [A, 2.4, zt1])]
  d.push(poly(rectOn('z', zt1, 1.28, 2.32, 1.28, 2.32), GREY.top, GREY.seam, SW))
  for (let a = 0; a < 5; a++) for (let b = 0; b < 5; b++) d.push(dotEl([1.44 + a * 0.18, 1.44 + b * 0.18, zt1], 0.035, 'z', GREY.deep))
  S.box(0, 0, zt, A, 2.4, zt1, { deco: d.slice(0, 1).concat(d.slice(2)) })
  S.box(0, 2.4, zt, 2.4, A, zt1, { deco: [line([1.2, 2.4, zt1], [1.2, A, zt1])] })
  /* walls: panels on the two back edges, the middle one on the right lowered in (red), on its slings */
  const t = 0.26, H = 5.4
  S.box(0, 0, zW, t, A, zW + H, { deco: [line([t, 1.2, zW], [t, 1.2, zW + H]), line([t, 2.4, zW], [t, 2.4, zW + H]), poly(rectOn('x', t, 0.3, 3.3, zW + 0.3, zW + 1.1), GREY.right, GREY.edge, SW), ...[0.5, 0.7, 0.9].map(z => line([t, 0.4, zW + z], [t, 3.2, zW + z], GREY.deep, SW))] })
  S.box(t, 0, zW, 1.2, t, zW + H)
  S.box(2.4, 0, zW, A, t, zW + H)
  const lift = 2.2
  S.box(1.22, 0.02, zW + lift, 2.38, t - 0.02, zW + H + lift, { pal: RED })
  const sp = zW + H + lift + 1.4
  S.group([1.2, 0.1, zW + H + lift, 2.4, 0.2, sp], [line([1.32, 0.13, zW + H + lift], [1.8, 0.13, sp], GREY.edge, SW), line([2.28, 0.13, zW + H + lift], [1.8, 0.13, sp], GREY.edge, SW)])
  S.box(1.68, 0.03, sp, 1.92, 0.23, sp + 0.3)
  /* ceiling: the grid, eight fan filter units, one cell still open, hanger rods */
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    if (i === 2 && j === 2) continue
    const a = i * 1.2 + 0.1, c = j * 1.2 + 0.1
    S.box(a, c, zC + 0.02, a + 1.0, c + 1.0, zC + 0.4)
    S.tube([[a + 0.45, c + 0.5, zC + 0.4], [a + 0.45, c + 0.5, zC + 0.58]], 0.26)
  }
  for (const x of [0, 1.2, 2.4, A]) S.box(x - 0.06, 0, zC, x + 0.06, A, zC + 0.18)
  for (const y of [0, 1.2, 2.4, A]) for (const x0 of [0, 1.2, 2.4]) S.box(x0 + 0.06, y - 0.06, zC, x0 + 1.14, y + 0.06, zC + 0.18)
  for (const [x, y] of [[0, 0], [A, 0], [0, A], [A, A]]) S.tube([[x, y, zC + 0.18], [x, y, zC + 2.2]], 0.04)
  /* air handling: a unit with its intake louvres and a duct dropping toward the ceiling */
  const dl = []
  for (let z = zA + 0.35; z < zA + 1.9; z += 0.22) dl.push(line([0.3, 2.6, z], [1.5, 2.6, z]))
  dl.push(outline(rectOn('y', 2.6, 2.0, 3.2, zA + 0.3, zA + 1.9)))
  S.box(0.1, 0.4, zA, A - 0.1, 2.6, zA + 2.2, { deco: dl })
  S.box(2.3, 0.9, zA - 2.0, 3.3, 1.9, zA)
}
const st = build('stack', stack)
write('stack', 'One bay of a cleanroom, its four layers lifted apart: raised floor, wall panels with one being set, the ceiling grid with fan filter units, the air handling', st, {})
