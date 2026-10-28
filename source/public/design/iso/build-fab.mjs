#!/usr/bin/env node
/* 29 Sep 2026, night. The exploded fab, redrawn in the house isometric (Bazil: "this one definitely need to change the
   style, based on the one above"). Same engine as the nine and the six (iso-engine.mjs): true isometric, three tone
   greys, a fine non scaling edge, transparent ground, no dotted grid, no guide rules, no numbering.
   Four trays lifted on one axis, set out in the order a fab is built:
     Foundation and subfab   piles and caps under the raft, the process headers on their rack, the fire main, the cable ladder
     Fab floor               the waffle deck, three process tools, a wet bench, the stocker, a gas cabinet
     Cleanroom               the ceiling grid with its fan filter units, the return chase
     Roof                    air handlers, supply and return duct, chillers, the exhaust stack
   A tower crane stands beside them. One red part per tray at most: the fire main, the gas cabinet, one fan filter unit
   under test, the stack cap. Labels are the four tray names in Switzer, set as outlines (text-paths.py) because a
   drawing served through <img> cannot load a web font, on fine straight leaders, large enough for a phone.
   Loop (iso-loops.mjs, fabTray): the trays are set down one after another, each lifting 18 px and settling back,
   then the drawing rests; translate only, still under prefers-reduced-motion, and a still twin for <picture>.
   Run: node public/design/iso/build-fab.mjs   (writes fab-exploded.svg and fab-exploded-still.svg next to this file) */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { U, CO, PI, SW, EW, GREY, RED, P, poly, line, circ, rectOn, outline, dotEl, Scene, elsOf, bboxOf, writeSet } from './iso-engine.mjs';
import { run, fabTray, FAB } from './iso-loops.mjs';

const OUT = dirname(fileURLToPath(import.meta.url));
const FONTS = join(OUT, '../../assets/fonts');
const W = 1060, MARGIN = 24;
const X1 = 24, Y1 = 14, SLAB = 0.6, DZ = 16;                 // tray footprint, slab depth, the lift between trays
const ZB = [0, DZ, 2 * DZ, 3 * DZ];

function worldBox(T) {
  const b = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9];
  for (const p of T.prims) for (let k = 0; k < 3; k++) { b[k] = Math.min(b[k], p.bb[k]); b[k + 3] = Math.max(b[k + 3], p.bb[k + 3]); }
  return b;
}
const deep = (axis, a, u0, u1, w0, w1) => poly(rectOn(axis, a, u0, u1, w0, w1), GREY.deep, GREY.edge, SW);
const seamsY = (y, x0, x1, zs) => zs.map(z => line([x0, y, z], [x1, y, z]));

/* ------------------------------------------------------------------ the slab every tray stands on */
function slab(T, zb, topDeco = []) {
  T.box(0, 0, zb, X1, Y1, zb + SLAB, { deco: [line([0, Y1, zb + SLAB * 0.5], [X1, Y1, zb + SLAB * 0.5]), line([X1, 0, zb + SLAB * 0.5], [X1, Y1, zb + SLAB * 0.5]), ...topDeco] });
  return zb + SLAB;
}

/* ------------------------------------------------------------------ foundation and subfab */
function foundation(T) {
  const z0 = slab(T, ZB[0]);
  // piles and their caps under the raft, along the two open edges
  const heads = [[2, 12.6], [7, 12.6], [12, 12.6], [17, 12.6], [22.2, 12.6], [22.2, 7.3], [22.2, 2]];
  for (const [x, y] of heads) {
    T.tube([[x, y, -3.4], [x, y, -0.8]], 0.3);
    T.box(x - 0.75, y - 0.75, -0.8, x + 0.75, y + 0.75, 0);
  }
  // the pipe rack at the back, carrying three process headers
  for (const x of [2, 7, 12, 17, 22]) {
    for (const y of [2.2, 5.6]) T.box(x - 0.14, y - 0.14, z0, x + 0.14, y + 0.14, z0 + 2.4);
    T.box(x - 0.16, 2.0, z0 + 2.4, x + 0.16, 5.8, z0 + 2.62);
  }
  [[2.9, 0.34], [3.9, 0.27], [4.85, 0.27]].forEach(([y, r]) => T.tube([[0.8, y, z0 + 2.62 + r], [23.2, y, z0 + 2.62 + r]], r, { rings: [3.5, 9.6, 15.9] }));
  // the fire main (red): along the rack's foot and up as a riser at the far end
  for (const x of [3, 8, 13, 18]) T.box(x - 0.2, 7.0, z0, x + 0.2, 7.5, z0 + 0.5);
  T.pipe([[1, 7.25, z0 + 0.82], [21.2, 7.25, z0 + 0.82], [21.2, 7.25, z0 + 3.6]], 0.32, { pal: RED, bend: 0.6, steps: 8 });
  // the cable ladder on its posts, with two cables laid in it
  for (const x of [3, 9, 15, 21]) T.box(x - 0.1, 9.5, z0, x + 0.1, 9.7, z0 + 1.8);
  const rungs = []; for (let x = 1.4; x < 23; x += 0.9) rungs.push(line([x, 9.12, z0 + 1.96], [x, 10.08, z0 + 1.96]));
  T.box(1, 9.0, z0 + 1.8, 23, 10.2, z0 + 1.86, { deco: rungs, faces: { top: '#FFFFFF' } });
  T.box(1, 9.0, z0 + 1.86, 23, 9.12, z0 + 2.06); T.box(1, 10.08, z0 + 1.86, 23, 10.2, z0 + 2.06);
  for (const y of [9.4, 9.8]) T.tube([[1.2, y, z0 + 1.97], [22.8, y, z0 + 1.97]], 0.11);
  // vacuum pumps and abatement along the front, a transformer at the corner
  for (let i = 0; i < 4; i++) {
    const x = 1.4 + i * 3;
    T.box(x, 11.3, z0, x + 2.2, 13.3, z0 + 1.2, { deco: [deep('y', 13.3, x + 0.3, x + 1.9, z0 + 0.35, z0 + 0.75)] });
    T.tube([[x + 0.3, 12.3, z0 + 1.6], [x + 1.9, 12.3, z0 + 1.6]], 0.36);
  }
  for (const x of [14, 17]) T.box(x, 11.1, z0, x + 2.4, 13.4, z0 + 2.3, { deco: [outline(rectOn('y', 13.4, x + 0.25, x + 2.15, z0 + 0.25, z0 + 2.05)), deep('y', 13.4, x + 0.6, x + 1.8, z0 + 1.3, z0 + 1.8)] });
  const fins = []; for (let x = 20.9; x < 22.9; x += 0.3) fins.push(line([x, 13.3, z0 + 0.2], [x, 13.3, z0 + 1.5]));
  T.box(20.6, 11.4, z0, 23.1, 13.3, z0 + 1.7, { deco: fins });
}

/* ------------------------------------------------------------------ fab floor */
function fabFloor(T) {
  const zb = ZB[1], z0 = zb + SLAB;
  const busy = [[1.5, 5.5, 19.8, 10.1], [2, 11.2, 13, 13.4], [20.5, 1, 23.3, 6.5], [21, 9.2, 22.6, 10.6]];
  const holes = [];
  for (let x = 0.6; x + 0.6 < X1; x += 1.2) for (let y = 0.6; y + 0.6 < Y1; y += 1.2) {
    if (busy.some(([a, b, c, d]) => x >= a && x + 0.6 <= c && y >= b && y + 0.6 <= d)) continue;
    holes.push(poly(rectOn('z', z0, x, x + 0.6, y, y + 0.6), GREY.left, GREY.seam, SW));
  }
  slab(T, zb, holes);
  // three process tools: mainframe, front end with load ports, transfer chamber and two process chambers
  for (const x of [1.5, 8.1, 14.7]) {
    T.box(x, 5.5, z0, x + 5.1, 8.6, z0 + 2.3, { deco: [outline(rectOn('y', 8.6, x + 0.25, x + 4.85, z0 + 0.25, z0 + 2.05)), deep('y', 8.6, x + 3.4, x + 4.6, z0 + 0.6, z0 + 1.7)] });
    T.box(x + 0.3, 8.6, z0, x + 4.8, 10.1, z0 + 1.75, { deco: [outline(rectOn('x', x + 4.8, 8.8, 9.9, z0 + 0.2, z0 + 1.55))] });
    for (const u of [x + 0.7, x + 2.6]) T.box(u, 10.1, z0 + 0.9, u + 1.5, 10.5, z0 + 1.05);
    T.tube([[x + 2.55, 7.05, z0 + 2.3], [x + 2.55, 7.05, z0 + 2.8]], 0.95, { rings: [0.25] });
    for (const u of [x + 0.35, x + 3.35]) {
      T.box(u, 5.8, z0 + 2.3, u + 1.4, 7.2, z0 + 3.2, { deco: [line([u, 7.2, z0 + 2.75], [u + 1.4, 7.2, z0 + 2.75])] });
      T.tube([[u + 0.7, 6.5, z0 + 3.2], [u + 0.7, 6.5, z0 + 3.38]], 0.5);
    }
  }
  // the wet bench along the front: cabinet, deck recess, hood on its uprights, exhaust collar
  T.box(2, 11.2, z0, 13, 13.3, z0 + 1.5, { deco: [deep('y', 13.3, 2.4, 12.6, z0 + 1.0, z0 + 1.3), ...[4.2, 6.4, 8.6, 10.8].map(x => line([x, 13.3, z0 + 0.1], [x, 13.3, z0 + 0.9]))] });
  for (const x of [2.1, 12.7]) T.box(x, 11.3, z0 + 1.5, x + 0.2, 11.6, z0 + 2.7);
  T.box(2, 11.2, z0 + 2.7, 13, 12.2, z0 + 3.1);
  T.tube([[7.5, 11.7, z0 + 3.1], [7.5, 11.7, z0 + 3.55]], 0.35);
  // the stocker at the back right, its window on the open face
  T.box(20.5, 1, z0, 23.3, 6.5, z0 + 4.6, { deco: [deep('x', 23.3, 1.6, 5.9, z0 + 1.2, z0 + 4.0), ...[2.2, 3.1, 4.0].map(z => line([23.3, 1.6, z0 + z], [23.3, 5.9, z0 + z], GREY.edge, SW)), outline(rectOn('y', 6.5, 20.8, 23.0, z0 + 0.3, z0 + 4.3))] });
  // the gas cabinet (red)
  T.box(21, 9.2, z0, 22.6, 10.6, z0 + 2.8, { pal: RED, deco: [poly(rectOn('y', 10.6, 21.25, 22.35, z0 + 1.6, z0 + 2.5), RED.deep, RED.edge, SW), line([21.25, 10.6, z0 + 1.2], [22.35, 10.6, z0 + 1.2], RED.edge, SW)] });
}

/* ------------------------------------------------------------------ cleanroom */
function cleanroom(T) {
  const zb = ZB[2], z0 = zb + SLAB;
  const grid = [];
  for (let x = 1.2; x <= 22.8 + 1e-9; x += 2.4) grid.push(line([x, 3.3, z0], [x, 13.2, z0]));
  for (let y = 3.6; y <= 13.2 + 1e-9; y += 2.4) grid.push(line([0.8, y, z0], [23.2, y, z0]));
  slab(T, zb, grid);
  // fan filter units in the grid; one under test in red
  for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) {
    const x = 1.2 + i * 2.4, y = 3.6 + j * 2.4, red = i === 6 && j === 2, pal = red ? RED : GREY;
    T.box(x + 0.16, y + 0.16, z0, x + 2.24, y + 2.24, z0 + 0.5, { pal });
    T.tube([[x + 1.2, y + 1.2, z0 + 0.5], [x + 1.2, y + 1.2, z0 + 0.66]], 0.55, { pal });
  }
  // the return chase along the back, louvred on its open face
  const lv = []; for (let z = z0 + 0.4; z < z0 + 2.6; z += 0.32) lv.push(line([1, 2.8, z], [23, 2.8, z]));
  T.box(0.5, 0.4, z0, 23.5, 2.8, z0 + 2.9, { deco: [...lv, line([23.5, 0.6, z0 + 2.6], [23.5, 2.6, z0 + 2.6])] });
}

/* ------------------------------------------------------------------ roof */
function roof(T) {
  const zb = ZB[3], z0 = slab(T, zb);
  // two air handlers: louvred intake, access doors, a fan section on top
  for (const [a, b] of [[1.5, 11], [12.5, 22]]) {
    const d = [];
    for (let z = z0 + 0.4; z < z0 + 2.2; z += 0.28) d.push(line([a + 0.3, 5, z], [a + 2.3, 5, z]));
    for (const u of [a + 3.2, a + 5.3]) d.push(outline(rectOn('y', 5, u, u + 1.4, z0 + 0.3, z0 + 2.2)), dotEl([u + 1.2, 5, z0 + 1.2], 0.07, 'y', GREY.deep));
    d.push(outline(rectOn('x', b, 1.8, 4.7, z0 + 0.3, z0 + 2.3)));
    T.box(a, 1.5, z0, b, 5, z0 + 2.6, { deco: d });
    T.box(b - 3, 2, z0 + 2.6, b - 0.4, 4.5, z0 + 3.2, { deco: [line([b - 3, 4.5, z0 + 2.9], [b - 0.4, 4.5, z0 + 2.9])] });
  }
  // supply and return duct on their stools, flanged at the joints
  for (const x of [2.5, 7.5, 12.5, 17.5, 22]) { T.box(x - 0.2, 6.4, z0, x + 0.2, 7.4, z0 + 0.9); T.box(x - 0.2, 8.1, z0, x + 0.2, 9.1, z0 + 0.9); }
  const joints = [3.2, 5.4, 7.6, 9.8, 12, 14.2, 16.4, 18.6, 20.8];
  T.box(1, 6.3, z0 + 0.9, 23, 7.5, z0 + 2.1, { deco: [...joints.map(x => line([x, 7.5, z0 + 0.9], [x, 7.5, z0 + 2.1])), ...joints.map(x => line([x, 6.3, z0 + 2.1], [x, 7.5, z0 + 2.1]))] });
  T.box(1, 8.1, z0 + 0.9, 23, 9.2, z0 + 1.9, { deco: [...joints.map(x => line([x + 1.1, 9.2, z0 + 0.9], [x + 1.1, 9.2, z0 + 1.9])), ...joints.map(x => line([x + 1.1, 8.1, z0 + 1.9], [x + 1.1, 9.2, z0 + 1.9]))] });
  // chillers with their fans
  for (const [a, b] of [[1.5, 7.7], [8.5, 14.7]]) {
    T.box(a, 10.3, z0, b, 13.2, z0 + 2.0, { deco: [...[0.5, 0.9, 1.3].map(z => line([a + 0.3, 13.2, z0 + z], [b - 0.3, 13.2, z0 + z])), line([b, 10.5, z0 + 1.7], [b, 13, z0 + 1.7])] });
    for (let k = 0; k < 3; k++) {
      const cx = a + 1.05 + k * 2.05;
      T.tube([[cx, 11.75, z0 + 2.0], [cx, 11.75, z0 + 2.16]], 0.78, { deco: [poly(circ([cx, 11.75, z0 + 2.17], 0.6, 'z', 28), GREY.deep, GREY.edge, SW), dotEl([cx, 11.75, z0 + 2.18], 0.14, 'z', GREY.right, GREY.edge)] });
    }
  }
  // the exhaust stack on its plinth, banded, with the red cap
  T.box(17.8, 10.1, z0, 21.2, 13.5, z0 + 0.4);
  T.tube([[19.5, 11.8, z0 + 0.4], [19.5, 11.8, z0 + 6.2]], 0.95, { rings: [1.4, 2.9, 4.4] });
  T.tube([[19.5, 11.8, z0 + 6.2], [19.5, 11.8, z0 + 6.7]], 1.08, { pal: RED });
}

/* ------------------------------------------------------------------ the tower crane beside the trays */
function crane(S) {
  const mx = -3.4, my = 11.4, h = 0.62, zb = -3.6, MT = 58;
  S.box(mx - 1.4, my - 1.4, zb, mx + 1.4, my + 1.4, zb + 0.6);
  for (const [dx, dy] of [[-h, -h], [h, -h], [-h, h], [h, h]]) S.box(mx + dx - 0.09, my + dy - 0.09, zb + 0.6, mx + dx + 0.09, my + dy + 0.09, MT);
  const lx = [], ly = [];
  for (let z = zb + 0.6, i = 0; z < MT - 0.1; z += 1.6, i++) {
    const z1 = Math.min(z + 1.6, MT);
    lx.push(line([mx + h + 0.09, my - h, z], [mx + h + 0.09, my + h, z], GREY.edge, SW), line([mx + h + 0.09, i % 2 ? my - h : my + h, z], [mx + h + 0.09, i % 2 ? my + h : my - h, z1], GREY.edge, SW));
    ly.push(line([mx - h, my + h + 0.09, z], [mx + h, my + h + 0.09, z], GREY.edge, SW), line([i % 2 ? mx - h : mx + h, my + h + 0.09, z], [i % 2 ? mx + h : mx - h, my + h + 0.09, z1], GREY.edge, SW));
  }
  S.group([mx + h + 0.09, my - h, zb, mx + h + 0.1, my + h, MT], lx);
  S.group([mx - h, my + h + 0.09, zb, mx + h, my + h + 0.1, MT], ly);
  // slewing ring, cab, jib, counter jib and counterweights, tower head and pendants, trolley and hook
  S.tube([[mx, my, MT], [mx, my, MT + 0.45]], 0.95, { rings: [0.2] });
  const JZ = MT + 0.45;
  S.box(mx - 0.5, my + 0.95, MT - 0.7, mx + 0.5, my + 2.0, MT + 0.45, { deco: [deep('y', my + 2.0, mx - 0.38, mx + 0.38, MT - 0.35, MT + 0.3), deep('x', mx + 0.5, my + 1.1, my + 1.85, MT - 0.35, MT + 0.3)] });
  const jx0 = mx + 0.9, jx1 = 12.5, yb = [my - 0.45, my + 0.45], jt = JZ + 1.1;
  for (const y of yb) S.box(jx0, y - 0.05, JZ, jx1, y + 0.05, JZ + 0.1);
  S.box(jx0, my - 0.05, jt - 0.05, jx1 - 0.4, my + 0.05, jt + 0.05);
  const lace = [];
  for (let x = jx0, i = 0; x < jx1 - 0.7; x += 0.7, i++) lace.push(line([x, yb[1], JZ + 0.1], [x + 0.7, my, jt - 0.05], GREY.edge, SW), line([x + 0.7, yb[1], JZ + 0.1], [x + 0.7, my, jt - 0.05], GREY.edge, SW));
  S.group([jx0, my, JZ, jx1, yb[1], jt], lace);
  const cx0 = -8.4, cx1 = mx - 0.9;
  for (const y of yb) S.box(cx0, y - 0.06, JZ, cx1, y + 0.06, JZ + 0.14);
  for (let k = 0; k < 3; k++) S.box(cx0 + 0.15 + k * 0.5, my - 0.6, JZ - 1.4, cx0 + 0.6 + k * 0.5, my + 0.6, JZ + 0.35);
  const apex = [mx, my, JZ + 2.6];
  S.tube([[mx - 0.6, my, JZ + 0.1], apex], 0.07); S.tube([[mx + 0.6, my, JZ + 0.1], apex], 0.07);
  S.group([cx0, my - 0.1, JZ, 5, my + 0.1, apex[2]], [line(apex, [4.5, my, jt + 0.05], GREY.edge, SW), line(apex, [cx0 + 0.4, my, JZ + 0.14], GREY.edge, SW)]);
  const xt = 9.2, HZ = JZ - 2.2;
  S.box(xt - 0.45, yb[0] - 0.08, JZ - 0.3, xt + 0.45, yb[1] + 0.08, JZ);
  S.group([xt - 0.12, my - 0.02, HZ, xt + 0.12, my + 0.02, JZ - 0.3], [line([xt - 0.1, my, JZ - 0.3], [xt - 0.1, my, HZ], GREY.edge, SW), line([xt + 0.1, my, JZ - 0.3], [xt + 0.1, my, HZ], GREY.edge, SW)]);
  S.box(xt - 0.22, my - 0.24, HZ - 0.5, xt + 0.22, my + 0.24, HZ);
  S.tube([[xt, my, HZ - 0.5], [xt, my, HZ - 0.75], [xt + 0.02, my, HZ - 0.9], [xt + 0.15, my, HZ - 0.96], [xt + 0.26, my, HZ - 0.88], [xt + 0.27, my, HZ - 0.78]], 0.055);
}

/* ------------------------------------------------------------------ labels: words in Switzer, set as outlines */
/* 29 Sep, later (coordinator): titles only, no second line, set to read at 11 px or more when the drawing shows
   304 px wide on a phone (T_SIZE / W >= 11 / 304, about 3.6 percent). A title that will not fit the column breaks
   where it is written to break ('|') into two balanced lines; 'Foundation' and 'and subfab' measure 209 and 205. */
const TRAYS = [
  { fn: foundation, title: 'Foundation|and subfab' },
  { fn: fabFloor, title: 'Fab floor' },
  { fn: cleanroom, title: 'Cleanroom' },
  { fn: roof, title: 'Roof' },
];
const T_SIZE = 40, T_LEAD = 46, LEADER = 52, GAP = 10;
const PHONE = 304, FLOOR = 11;                 // the narrowest the Design tab shows it, and the tab's type floor
function setText(reqs) {
  const out = execFileSync('python3', [join(OUT, 'text-paths.py')], { input: JSON.stringify(reqs) });
  return JSON.parse(out.toString());
}

/* ------------------------------------------------------------------ build */
const S = new Scene('fab');
crane(S);
TRAYS.forEach((t, i) => {
  const T = new Scene('tray' + i);
  t.fn(T);
  S.moving(worldBox(T), elsOf(T), { cls: 't' + (i + 1) });
});
const els = elsOf(S);
const draw = bboxOf(els);
// label anchors: the right hand corner of each slab, half way down its edge
const anchors = ZB.map(z => P([X1, 0, z + SLAB * 0.5]));
const lx = anchors[0][0] + LEADER + GAP;
const FH = 1323;                               // the frame height the Design tab's <img> declares (width 1060, height 1323)
if ((T_SIZE * PHONE) / W < FLOOR) throw new Error(`titles would show at ${((T_SIZE * PHONE) / W).toFixed(1)} px on a phone`);
const labels = TRAYS.map((t, i) => {
  const lines = t.title.split('|');
  const set = setText(lines.map(l => ({ text: l, font: join(FONTS, 'Switzer-600-normal.woff2'), size: T_SIZE })));
  if (set.length === 2 && Math.abs(set[0].width - set[1].width) > 0.15 * Math.max(set[0].width, set[1].width)) throw new Error('unbalanced title: ' + t.title);
  const [ax, ay] = anchors[i];
  return { i, ax, ay, lines: set, w: Math.max(...set.map(q => q.width)) };
});
// the composition box: drawing, labels, and the lift headroom above the top tray
const bb = [draw[0], draw[1] - FAB.lift, draw[2], draw[3]];
for (const L of labels) { bb[2] = Math.max(bb[2], lx + L.w); bb[1] = Math.min(bb[1], L.ay - T_SIZE); bb[3] = Math.max(bb[3], L.ay + T_SIZE * 0.36 + (L.lines.length - 1) * T_LEAD + 12); }
if (bb[2] - bb[0] > W - 2 * MARGIN) throw new Error('too wide: ' + Math.round(bb[2] - bb[0]));
if (bb[3] - bb[1] > FH - 2 * MARGIN) throw new Error('too tall: ' + Math.round(bb[3] - bb[1]));
const H = FH;
const dx = W / 2 - (bb[0] + bb[2]) / 2, dy = H / 2 - (bb[1] + bb[3]) / 2;
const labelSvg = labels.map(L => {
  const x = lx + dx, y = L.ay + dy;
  const lead = `<path class="ld" d="M${(L.ax + dx + GAP).toFixed(1)} ${y.toFixed(1)}H${(x - GAP - 4).toFixed(1)}"/>`;
  const lines = L.lines.map((q, k) => `<path class="lt" transform="translate(${x.toFixed(1)} ${(y + T_SIZE * 0.36 + k * T_LEAD).toFixed(1)})" d="${q.d}"/>`).join('');
  return `<g class="t${L.i + 1}">${lead}${lines}</g>`;
}).join('');
const LABEL_CSS = '.ld{fill:none;stroke:#8E96A1;stroke-width:.75px}.lt{fill:#231F20;stroke:none;vector-effect:none}';
const MOTION = [0, 1, 2, 3].map(i => run('t' + (i + 1), 'set' + (i + 1), fabTray(i), a => `translate(0,${(-FAB.lift * a).toFixed(2)}px)`)).join('') +
  '@media (prefers-reduced-motion:reduce){.t1,.t2,.t3,.t4{animation:none!important}}';
const TITLE = 'Exploded isometric of a semiconductor fab in four trays: foundation and subfab, the fab floor, the cleanroom and the roof, with a tower crane beside them';
for (const [slug, css] of [['fab-exploded', LABEL_CSS + MOTION], ['fab-exploded-still', LABEL_CSS]]) {
  writeSet(OUT, [{ slug, title: TITLE, els, bb, css }], { W, H });
  const f = join(OUT, slug + '.svg');
  writeFileSync(f, readFileSync(f, 'utf8').replace(/<\/svg>\s*$/, labelSvg + '</svg>\n'));
}
console.log('frame', W, 'x', H, 'labels at x', Math.round(lx + dx), 'title on a phone', ((T_SIZE * PHONE) / W).toFixed(1), 'px');
