#!/usr/bin/env node
/* 29 Sep 2026. The six service objects of IAQ's delivery cycle, isometric, in the same family as the nine
   (build-iso9.mjs): same engine (iso-engine.mjs), projection, viewBox, three tone greys, 0.75 px edges and
   exactly one IAQ red part each. Each object also carries ONE gentle loop, a single moving part animated by
   the SVG's own CSS and stopped under prefers-reduced-motion. The rest pose (first frame) is the drawing.
   Run: node public/design/iso/build-iso6.mjs   (writes svc-*.svg next to this file)
   Each object is placed by hand in world units; K is its world scale so the six land at the family's
   optical size (line weights never scale). */
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  U, CO, PI, EW, SW, GREY, RED, add, sub, mul, dot, cross, len, norm, P, setScale,
  poly, line, pline, circ, dotEl, rectOn, outline, Scene, elsOf, bboxOf,
  planeMatrix, poly2, line2, circ2, writeSet,
} from './iso-engine.mjs';
import { LOOPS, run, translate, rotate, RM } from './iso-loops.mjs';

const OUT = dirname(fileURLToPath(import.meta.url));
/* 29 Sep, night: the loops now come from iso-loops.mjs (shared with the simple set and the fab): longer holds at rest
   and at the far end, a curve per action, and the hookup spool lifts off its seat instead of sliding into the pipe
   beyond it (it used to overlap the fixed flange at the far end of its travel). */

/* world box of a sub-scene, for sorting a moving part as one piece */
function worldBox(T) {
  const b = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9];
  for (const p of T.prims) for (let k = 0; k < 3; k++) { b[k] = Math.min(b[k], p.bb[k]); b[k + 3] = Math.max(b[k + 3], p.bb[k + 3]); }
  return b;
}
/* an I section, as three boxes. along 'x' or 'y'; web face recessed in the deep tone */
function ibeam(S, axis, a0, a1, c, z0, h, w, o = {}) {
  const pal = o.pal || GREY, tf = Math.max(0.05, h * 0.13), tw = 0.035;
  if (axis === 'x') {
    S.box(a0, c - w / 2, z0, a1, c + w / 2, z0 + tf, o);
    S.box(a0, c - tw, z0 + tf, a1, c + tw, z0 + h - tf, { ...o, faces: { left: pal.deep } });
    S.box(a0, c - w / 2, z0 + h - tf, a1, c + w / 2, z0 + h, o);
  } else {
    S.box(c - w / 2, a0, z0, c + w / 2, a1, z0 + tf, o);
    S.box(c - tw, a0, z0 + tf, c + tw, a1, z0 + h - tf, { ...o, faces: { right: pal.deep } });
    S.box(c - w / 2, a0, z0 + h - tf, c + w / 2, a1, z0 + h, o);
  }
}
/* an I column with its flanges facing y (so the +x side shows the section) */
function icol(S, x, y, z0, z1, w = 0.4, d = 0.4) {
  const tf = 0.06, tw = 0.03;
  S.box(x - w / 2, y - d / 2, z0, x + w / 2, y - d / 2 + tf, z1);
  S.box(x - tw, y - d / 2 + tf, z0, x + tw, y + d / 2 - tf, z1, { faces: { right: GREY.deep } });
  S.box(x - w / 2, y + d / 2 - tf, z0, x + w / 2, y + d / 2, z1);
}
/* a polygon with one hole, as one filled shape (the hole shows what is under it) plus two outlines */
function holed(outer3, inner3, fill, edge, swO = EW, swI = SW) {
  const inr = inner3.slice().reverse();
  return [
    { pts: [...outer3, outer3[0], ...inr, inr[0]].map(P), fill, stroke: null, sw: 0 },
    outline(outer3, edge, swO), outline(inner3, edge, swI),
  ];
}

/* ============================================================================================
   01 DESIGN. A plan chest with the drawing set on it, a parallel rule, a rolled drawing, a pen,
   a scale rule and an architect's lamp. Red: the set square, which slides along the rule.
   ============================================================================================ */
function design(S) {
  const X0 = -5.6, X1 = 5.6, Y0 = -3.8, Y1 = 3.8, TZ = 4.9, Z0 = 5.1;
  S.box(X0 + 0.2, Y0 + 0.2, 0, X1 - 0.2, Y1 - 0.2, 0.3, { faces: { left: GREY.deep, right: GREY.deep } });
  const d = [];
  const dz = [0.45, 1.33, 2.21, 3.09, 3.97, 4.78];
  for (let i = 0; i < 5; i++) {
    const z0 = dz[i] + 0.04, z1 = dz[i + 1] - 0.04;
    d.push(outline(rectOn('y', Y1, X0 + 0.2, X1 - 0.2, z0, z1)));
    d.push(poly(rectOn('y', Y1, -1.1, 1.1, z1 - 0.32, z1 - 0.2), GREY.deep, GREY.edge, SW));
    d.push(outline(rectOn('y', Y1, -3.5, -2.5, z1 - 0.4, z1 - 0.16)));
  }
  d.push(outline(rectOn('x', X1, Y0 + 0.25, Y1 - 0.25, 0.55, TZ - 0.25)));
  S.box(X0, Y0, 0.3, X1, Y1, TZ, { deco: d });
  S.box(X0 - 0.15, Y0 - 0.15, TZ, X1 + 0.15, Y1 + 0.15, Z0);
  // the drawing set: two sheets, the top one carrying a plan, grid bubbles and a title block
  S.box(-4.5, -3.3, Z0, 2.3, 2.0, Z0 + 0.05);
  const ZS = Z0 + 0.1, pl = [];
  pl.push(outline(rectOn('z', ZS, -4.45, 1.85, -2.8, 2.0)));
  pl.push(outline(rectOn('z', ZS, 0.45, 1.85, 1.3, 2.0)), line([0.45, 1.62, ZS], [1.85, 1.62, ZS]), line([1.15, 1.62, ZS], [1.15, 2.0, ZS]));
  for (const x of [-3.6, -2.3, -1.0, 0.3]) { pl.push(line([x, -1.6, ZS], [x, 1.15, ZS])); pl.push(outline(circ([x, 1.33, ZS], 0.16, 'z', 20))); }
  for (const y of [-1.3, -0.15, 1.0]) { pl.push(line([-3.9, y, ZS], [0.6, y, ZS])); pl.push(outline(circ([-4.08, y, ZS], 0.16, 'z', 20))); }
  pl.push(outline(rectOn('z', ZS, -3.6, 0.3, -1.3, 1.0), GREY.edge, EW), outline(rectOn('z', ZS, -3.5, 0.2, -1.2, 0.9), GREY.edge, SW));
  pl.push(line([-1.0, -1.25, ZS], [-1.0, 0.35, ZS], GREY.edge, EW), line([-3.55, -0.15, ZS], [-2.4, -0.15, ZS], GREY.edge, EW));
  const arc = []; for (let k = 0; k <= 12; k++) { const t = (k / 12) * (PI / 2); arc.push([-1.0 + 0.55 * Math.cos(t), 0.35 + 0.55 * Math.sin(t), ZS]); }
  pl.push(pline(arc), line([-1.0, 0.35, ZS], [-0.45, 0.35, ZS]));
  S.box(-4.7, -3.05, Z0 + 0.05, 2.1, 2.25, ZS, { deco: pl });
  // the parallel rule, with its graduations
  const ticks = [];
  for (let x = -5.2, i = 0; x < 5.0; x += 0.25, i++) ticks.push(line([x, -1.98, ZS + 0.1], [x, i % 4 === 0 ? -2.14 : -2.05, ZS + 0.1]));
  S.box(-5.35, -2.3, ZS, 5.1, -1.9, ZS + 0.1, { deco: ticks });
  // the set square (red, moving): a right triangle with its cut out and edge graduations
  const q0 = ZS, q1 = ZS + 0.08;
  const A = [-3.3, -1.9], B = [-0.85, -1.9], C = [-3.3, 0.0];
  const a = B[0] - A[0], b = C[1] - A[1], c = Math.hypot(a, b), r = (a + b - c) / 2, I = [A[0] + r, A[1] + r];
  const shrink = (V, k) => [I[0] + (V[0] - I[0]) * k, I[1] + (V[1] - I[1]) * k];
  const inner = [A, B, C].map(V => shrink(V, 0.4));
  const sq = [
    poly([[B[0], B[1], q0], [C[0], C[1], q0], [C[0], C[1], q1], [B[0], B[1], q1]], RED.right, RED.edge, EW),
    ...holed([A, B, C].map(([x, y]) => [x, y, q1]), inner.map(([x, y]) => [x, y, q1]), RED.left, RED.edge),
  ];
  for (let x = A[0] + 0.2, i = 0; x < B[0] - 0.25; x += 0.2, i++) sq.push(line([x, A[1] + 0.02, q1], [x, A[1] + (i % 5 === 4 ? 0.22 : 0.13), q1], RED.edge, SW));
  S.moving([A[0], A[1], q0, B[0], C[1], q1], sq, { cls: 'mv' });
  // the rolled drawing, with its bands and the rolled end
  const rz = Z0 + 0.34, rx1 = 1.5;
  S.tube([[-4.1, 2.95, rz], [rx1, 2.95, rz]], 0.34, {
    deco: [outline(circ([rx1, 2.95, rz], 0.22, 'x', 28), GREY.edge, SW), outline(circ([rx1, 2.95, rz], 0.11, 'x', 20), GREY.edge, SW), dotEl([rx1, 2.95, rz], 0.05, 'x', GREY.deep)],
  });
  for (const x of [-3.1, 0.5]) S.collar([x - 0.07, 2.95, rz], [x + 0.07, 2.95, rz], 0.37, 0.34);
  // the pen
  S.tube([[0.95, -0.35, ZS + 0.07], [1.32, 1.35, ZS + 0.07]], 0.07);
  S.tube([[1.32, 1.35, ZS + 0.085], [1.4, 1.72, ZS + 0.085]], 0.085);
  // the scale rule
  S.prism('x', [[-0.95, Z0], [-0.55, Z0], [-0.75, Z0 + 0.34]], 2.7, 5.0);
  // the architect's lamp
  const lb = [4.4, -3.0, Z0];
  S.tube([lb, add(lb, [0, 0, 0.14])], 0.5);
  S.tube([add(lb, [0, 0, 0.14]), add(lb, [0, 0, 0.9])], 0.08);
  S.tube([add(lb, [0, 0, 0.84]), add(lb, [0, 0, 1.0])], 0.13);
  const j1 = [3.3, -2.6, Z0 + 3.7], j2 = [1.3, -1.5, Z0 + 3.1];
  S.tube([add(lb, [0, 0, 1.0]), j1], 0.07);
  S.tube([add(j1, [0, 0, -0.08]), add(j1, [0, 0, 0.08])], 0.13);
  S.tube([j1, j2], 0.07);
  S.tube([j2, [0.95, -1.2, Z0 + 2.4]], 0.55);
  // slide 1.6 units along the rule and back
  const dx = 1.6 * CO * U * K6, dy = 1.6 * 0.5 * U * K6;
  S.css = run('mv', 'slide', LOOPS.design, translate(dx, dy)) + RM;
}

/* ============================================================================================
   02 PROCURE. A forklift bringing in a crated unit on a pallet, the crate battened and strapped.
   Red: the strapping. Moving: the load rises and settles on the forks.
   ============================================================================================ */
function procure(S) {
  const Lr = 0.35;
  const wheel = (x, y, r, w, far) => {
    const yc = y + (far ? -w / 2 : w / 2);
    const hub = [poly(circ([x, yc, r], r * 0.56, 'y', 28), GREY.right, GREY.edge, SW)];
    for (let k = 0; k < 5; k++) { const t = (2 * PI * k) / 5; hub.push(dotEl([x + r * 0.36 * Math.cos(t), yc, r + r * 0.36 * Math.sin(t)], 0.045, 'y', GREY.deep)); }
    hub.push(poly(circ([x, yc, r], r * 0.18, 'y', 16), GREY.top, GREY.edge, SW));
    S.tube([[x, y - w / 2, r], [x, y + w / 2, r]], r, { deco: far ? [] : hub });
  };
  wheel(0.55, -1.6, 0.72, 0.55, true); wheel(-3.9, -1.75, 0.58, 0.5, true);
  wheel(0.55, 1.6, 0.72, 0.55, false); wheel(-3.9, 1.75, 0.58, 0.5, false);
  S.prism('y', [[-5.1, 0.35], [-3.3, 0.35], [-3.3, 2.9], [-4.7, 2.9], [-5.1, 2.5]], -1.45, 1.45, {
    deco: [line([-5.1, 1.45, 1.2], [-3.3, 1.45, 1.2]), dotEl([-4.9, 1.45, 2.2], 0.08, 'y', GREY.deep)],
  });
  S.box(-3.3, -1.25, 0.45, 1.1, 1.25, 1.9, {
    deco: [poly(rectOn('y', 1.25, -2.6, -1.1, 0.6, 1.0), GREY.deep, GREY.edge, SW), line([-3.3, 1.25, 1.55], [1.1, 1.25, 1.55])],
  });
  S.box(-3.3, -1.1, 1.9, -1.0, 1.1, 2.6, { deco: [line([-3.3, 1.1, 2.3], [-1.0, 1.1, 2.3])] });
  S.box(-1.0, -1.1, 1.9, 0.5, 1.1, 2.4);
  S.box(-2.9, -0.65, 2.6, -1.8, 0.65, 2.85);
  S.box(-3.12, -0.6, 2.6, -2.9, 0.6, 3.75, { deco: [outline(rectOn('x', -2.9, -0.48, 0.48, 2.95, 3.62))] });
  S.tube([[-0.35, 0, 2.4], [-0.9, 0, 3.25]], 0.07);
  const sd = norm([-0.55, 0, 0.85]), su = [0, 1, 0], sw2 = cross(sd, su), sc = [-0.95, 0, 3.33];
  const ringPts = []; for (let k = 0; k < 32; k++) { const t = (2 * PI * k) / 32; ringPts.push(add(sc, add(mul(su, 0.42 * Math.cos(t)), mul(sw2, 0.42 * Math.sin(t))))); }
  S.tube(ringPts, 0.05, { closed: true, layer: 1 });
  // overhead guard
  for (const [x, z0] of [[-3.2, 2.9], [0.35, 2.4]]) for (const y of [-1.12, 1.12]) S.box(x - 0.07, y - 0.07, z0, x + 0.07, y + 0.07, 5.6);
  S.box(-3.35, -1.25, 5.6, 0.5, -1.05, 5.76); S.box(-3.35, 1.05, 5.6, 0.5, 1.25, 5.76);
  for (const x of [-3.27, -2.55, -1.85, -1.15, -0.45, 0.42]) S.box(x - 0.08, -1.05, 5.62, x + 0.08, 1.05, 5.74);
  // mast, lift cylinder and tilt cylinder
  S.tube([[1.25, 0, 0.5], [1.25, 0, 4.9]], 0.13, { rings: [2.1] });
  for (const y of [-0.95, 0.95]) S.box(1.1, y - 0.16, 0.3, 1.42, y + 0.16, 5.4, { deco: [line([1.42, y - 0.06, 0.3], [1.42, y - 0.06, 5.4])] });
  for (const z of [2.4, 5.05]) S.box(1.1, -0.79, z, 1.42, 0.79, z + 0.22);
  S.tube([[0.2, 1.3, 1.55], [1.05, 1.3, 2.3]], 0.08);
  // the load on the forks (moving): carriage, backrest, forks, pallet, crate, strapping, tag
  const T = new Scene('load');
  T.box(1.45, -1.2, 0.6 + Lr, 1.6, 1.2, 1.3 + Lr);
  for (const y of [-1.15, -0.58, 0, 0.58, 1.15]) T.box(1.45, y - 0.05, 1.3 + Lr, 1.55, y + 0.05, 3.2 + Lr);
  T.box(1.45, -1.2, 3.2 + Lr, 1.55, 1.2, 3.32 + Lr);
  for (const y of [-0.7, 0.7]) { T.box(1.6, y - 0.15, 0.3 + Lr, 1.72, y + 0.15, 1.3 + Lr); T.box(1.72, y - 0.15, 0.33 + Lr, 6.0, y + 0.15, 0.45 + Lr); }
  for (const xr of [[2.0, 2.4], [3.95, 4.35], [5.9, 6.3]]) {
    T.box(xr[0], -2.0, 0.22 + Lr, xr[1], 2.0, 0.32 + Lr);
    for (const yr of [[-2.0, -1.6], [-0.2, 0.2], [1.6, 2.0]]) T.box(xr[0], yr[0], 0.32 + Lr, xr[1], yr[1], 0.72 + Lr);
  }
  for (let i = 0; i < 7; i++) { const y0 = -2.0 + i * 0.585; T.box(2.0, y0, 0.72 + Lr, 6.3, y0 + 0.45, 0.86 + Lr); }
  const cz0 = 0.86 + Lr, cz1 = 4.6 + Lr, cx0 = 2.05, cx1 = 6.25, cy0 = -1.9, cy1 = 1.9;
  const planks = [];
  for (let z = cz0 + 0.5; z < cz1 - 0.1; z += 0.5) { planks.push(line([cx0, cy1, z], [cx1, cy1, z])); planks.push(line([cx1, cy0, z], [cx1, cy1, z])); }
  for (let y = cy0 + 0.55; y < cy1; y += 0.55) planks.push(line([cx0, y, cz1], [cx1, y, cz1]));
  T.box(cx0, cy0, cz0, cx1, cy1, cz1, { deco: planks });
  T.box(cx0, cy1, cz0, cx0 + 0.3, cy1 + 0.07, cz1); T.box(cx1 - 0.3, cy1, cz0, cx1, cy1 + 0.07, cz1);
  T.box(cx0 + 0.3, cy1, cz0, cx1 - 0.3, cy1 + 0.07, cz0 + 0.3); T.box(cx0 + 0.3, cy1, cz1 - 0.3, cx1 - 0.3, cy1 + 0.07, cz1);
  T.bar('y', [cx0 + 0.35, cz0 + 0.35], [cx1 - 0.35, cz1 - 0.35], 0.26, cy1, cy1 + 0.07);
  T.box(cx1, cy0, cz0, cx1 + 0.07, cy0 + 0.3, cz1); T.box(cx1, cy1 - 0.3, cz0, cx1 + 0.07, cy1, cz1);
  T.box(cx1, cy0 + 0.3, cz0, cx1 + 0.07, cy1 - 0.3, cz0 + 0.3); T.box(cx1, cy0 + 0.3, cz1 - 0.3, cx1 + 0.07, cy1 - 0.3, cz1);
  T.bar('x', [cy0 + 0.35, cz1 - 0.35], [cy1 - 0.35, cz0 + 0.35], 0.26, cx1, cx1 + 0.07);
  for (const xb of [3.25, 5.05]) {
    T.box(xb - 0.09, cy0 - 0.02, cz1, xb + 0.09, cy1 + 0.1, cz1 + 0.03, { pal: RED });
    T.box(xb - 0.09, cy1 + 0.07, 0.72 + Lr, xb + 0.09, cy1 + 0.1, cz1, { pal: RED });
    T.box(xb - 0.13, cy1 + 0.1, 2.3 + Lr, xb + 0.13, cy1 + 0.16, 2.6 + Lr, { pal: RED });
  }
  T.box(cx0 - 0.02, -0.09, cz1 + 0.03, cx1 + 0.1, 0.09, cz1 + 0.06, { pal: RED });
  T.box(cx1 + 0.07, -0.09, 0.72 + Lr, cx1 + 0.1, 0.09, cz1 + 0.03, { pal: RED });
  T.flat(rectOn('y', cy1 + 0.075, 3.75, 4.55, 3.35 + Lr, 3.95 + Lr), GREY.top, { deco: [dotEl([3.9, cy1 + 0.076, 3.8 + Lr], 0.05, 'y', GREY.deep), line([3.95, cy1 + 0.076, 3.6 + Lr], [4.4, cy1 + 0.076, 3.6 + Lr]), line([3.95, cy1 + 0.076, 3.5 + Lr], [4.3, cy1 + 0.076, 3.5 + Lr])] });
  S.moving(worldBox(T), elsOf(T), { cls: 'mv' });
  S.css = run('mv', 'lift', LOOPS.procure, translate(0, -0.55 * U * K6)) + RM;
}

/* ============================================================================================
   03 CONSTRUCT. A two level steel frame going up, and a tower crane over it: lattice mast, cab,
   jib, counter jib with counterweights, tower head and pendants, trolley, hook and slings.
   Red: the beam being lifted. Moving: hook and beam lowering as the falls pay out.
   ============================================================================================ */
function construct(S) {
  const xs = [-0.6, 2.4, 5.4], ys = [-1.4, 2.2], L1 = 2.9, L2 = 5.8, bd = 0.36;
  for (const x of xs) for (const y of ys) {
    S.box(x - 0.36, y - 0.36, 0, x + 0.36, y + 0.36, 0.1, { deco: [dotEl([x - 0.24, y + 0.24, 0.1], 0.04, 'z', GREY.deep), dotEl([x + 0.24, y + 0.24, 0.1], 0.04, 'z', GREY.deep), dotEl([x + 0.24, y - 0.24, 0.1], 0.04, 'z', GREY.deep)] });
    icol(S, x, y, 0.1, L1 + 0.16);
    S.box(x - 0.24, y - 0.24, L1 + 0.16, x + 0.24, y + 0.24, L1 + 0.22);
    icol(S, x, y, L1 + 0.22, L2);
  }
  for (const [L, skip] of [[L1, null], [L2, [1, 1]]]) {
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      if (skip && skip[0] === i && skip[1] === j) continue;
      ibeam(S, 'x', xs[i] + 0.2, xs[i + 1] - 0.2, ys[j], L - bd, bd, 0.26);
    }
    for (const x of xs) ibeam(S, 'y', ys[0] + 0.2, ys[1] - 0.2, x, L - bd, bd, 0.26);
  }
  // the deck on level one over the first bay, its profile showing on the edge
  const prof = [];
  for (let x = -0.35, i = 0; x < 2.15; x += 0.25, i++) prof.push([x, 2.0, L1 + (i % 2 ? 0.02 : 0.1)]);
  S.box(-0.4, -1.2, L1, 2.2, 2.0, L1 + 0.16, { deco: [pline(prof), line([-0.4, 2.0, L1 + 0.12], [2.2, 2.0, L1 + 0.12])] });
  // bracing in the right hand bay
  S.bar('x', [ys[0] + 0.25, 0.3], [ys[1] - 0.25, L1 - bd - 0.1], 0.07, 5.36, 5.44);
  S.bar('x', [ys[0] + 0.25, L1 - bd - 0.1], [ys[1] - 0.25, 0.3], 0.07, 5.36, 5.44);
  // tower crane: base, lattice mast, slewing ring, cab
  const mx = -4.6, my = -0.2, h = 0.6, MT = 8.4;
  S.box(mx - 1.0, my - 1.0, 0, mx + 1.0, my + 1.0, 0.5);
  for (const [dx, dy] of [[-h, -h], [h, -h], [-h, h], [h, h]]) S.box(mx + dx - 0.08, my + dy - 0.08, 0.5, mx + dx + 0.08, my + dy + 0.08, MT);
  for (let z = 0.5, i = 0; z < MT - 0.5; z += 1.1, i++) {
    const z1 = Math.min(z + 1.1, MT);
    S.tube([[mx + h + 0.08, my - h, z], [mx + h + 0.08, my + h, z]], 0.035);
    S.tube([[mx + h + 0.08, i % 2 ? my - h : my + h, z], [mx + h + 0.08, i % 2 ? my + h : my - h, z1]], 0.03);
    S.tube([[mx - h, my + h + 0.08, z], [mx + h, my + h + 0.08, z]], 0.035);
    S.tube([[i % 2 ? mx - h : mx + h, my + h + 0.08, z], [i % 2 ? mx + h : mx - h, my + h + 0.08, z1]], 0.03);
  }
  S.tube([[mx, my, MT], [mx, my, MT + 0.35]], 0.8, { rings: [0.17] });
  const JZ = MT + 0.35;
  S.box(mx - 0.55, my + 0.8, MT - 0.55, mx + 0.35, my + 1.7, MT + 0.35, {
    deco: [poly(rectOn('y', my + 1.7, mx - 0.45, mx + 0.25, MT - 0.2, MT + 0.22), GREY.deep, GREY.edge, SW), poly(rectOn('x', mx + 0.35, my + 0.9, my + 1.6, MT - 0.2, MT + 0.22), GREY.deep, GREY.edge, SW)],
  });
  // jib: two bottom chords, a top chord, lacing on the near face
  const jx0 = mx + 0.7, jx1 = 9.2, yb = [my - 0.42, my + 0.42], jt = JZ + 1.0;
  for (const y of yb) S.box(jx0, y - 0.05, JZ, jx1, y + 0.05, JZ + 0.1);
  S.box(jx0, my - 0.05, jt - 0.05, jx1 - 0.3, my + 0.05, jt + 0.05);
  for (let x = jx0, i = 0; x < jx1 - 0.6; x += 0.6, i++) S.tube([[x, yb[1], JZ + 0.1], [x + 0.6, my, jt - 0.05]], 0.028);
  for (let x = jx0 + 0.6; x < jx1 - 0.6; x += 0.6) S.tube([[x, yb[1], JZ + 0.1], [x, my, jt - 0.05]], 0.028);
  S.tube([[jx1 - 0.3, my, jt - 0.05], [jx1, yb[1], JZ + 0.1]], 0.03);
  // counter jib, walkway and counterweights
  const cx1 = mx - 0.7, cx0 = -8.4;
  for (const y of yb) S.box(cx0, y - 0.06, JZ, cx1, y + 0.06, JZ + 0.14);
  for (let x = cx0 + 0.2; x < cx1; x += 0.5) S.box(x - 0.04, yb[0] + 0.06, JZ + 0.02, x + 0.04, yb[1] - 0.06, JZ + 0.1);
  for (let k = 0; k < 3; k++) S.box(cx0 + 0.1 + k * 0.42, my - 0.55, JZ - 1.2, cx0 + 0.48 + k * 0.42, my + 0.55, JZ + 0.35);
  // tower head and pendants
  const apex = [mx, my, JZ + 2.4];
  S.tube([[mx - 0.55, my, JZ + 0.1], apex], 0.06);
  S.tube([[mx + 0.55, my, JZ + 0.1], apex], 0.06);
  S.group([mx - 0.1, my - 0.1, JZ, 3.2, my + 0.1, apex[2]], [line(apex, [3.0, my, jt + 0.05], GREY.edge, SW), line(apex, [cx0 + 0.3, my, JZ + 0.14], GREY.edge, SW)]);
  // trolley
  const xt = 7.7;
  S.box(xt - 0.4, yb[0] - 0.08, JZ - 0.28, xt + 0.4, yb[1] + 0.08, JZ, { deco: [dotEl([xt - 0.22, yb[1] + 0.08, JZ - 0.14], 0.06, 'y'), dotEl([xt + 0.22, yb[1] + 0.08, JZ - 0.14], 0.06, 'y')] });
  // the falls (scale with the lowering) and the hook with its load (moving)
  const HZ = JZ - 2.0, drop = 0.85, BZ = HZ - 2.35;
  const top = [xt, my, JZ - 0.28];
  S.moving([xt - 0.12, my - 0.12, HZ, xt + 0.12, my + 0.12, JZ - 0.28], [line([xt - 0.1, my, JZ - 0.28], [xt - 0.1, my, HZ], GREY.edge, SW), line([xt + 0.1, my, JZ - 0.28], [xt + 0.1, my, HZ], GREY.edge, SW)], { cls: 'mv2', origin: P(top) });
  const T = new Scene('hook');
  T.box(xt - 0.2, my - 0.22, HZ - 0.5, xt + 0.2, my + 0.22, HZ, { deco: [dotEl([xt, my + 0.22, HZ - 0.2], 0.08, 'y', GREY.right, GREY.edge)] });
  T.tube([[xt, my, HZ - 0.5], [xt, my, HZ - 0.72], [xt + 0.02, my, HZ - 0.86], [xt + 0.14, my, HZ - 0.92], [xt + 0.24, my, HZ - 0.84], [xt + 0.25, my, HZ - 0.74]], 0.05);
  const hookPt = [xt, my, HZ - 0.9];
  const b0 = xt - 1.6, b1 = xt + 1.6;
  T.group([b0, my - 0.02, BZ + 0.46, b1, my + 0.02, HZ - 0.9], [line(hookPt, [b0 + 0.45, my, BZ + 0.46], GREY.edge, SW), line(hookPt, [b1 - 0.45, my, BZ + 0.46], GREY.edge, SW)]);
  ibeam(T, 'x', b0, b1, my, BZ, 0.46, 0.32, { pal: RED });
  S.moving(worldBox(T), elsOf(T), { cls: 'mv' });
  const Lpx = (JZ - 0.28 - HZ) * U * K6, D = drop * U * K6;
  // the falls lengthen along themselves on the same keys and curves as the hook, so their ends stay on the block
  S.css = run('mv', 'lower', LOOPS.construct, translate(0, D)) +
    run('mv2', 'payout', LOOPS.construct, a => `scaleY(${(1 + (a * D) / Lpx).toFixed(4)})`) + RM;
}

/* ============================================================================================
   04 COMMISSION. A control panel with a large pressure gauge, a test cart with its instrument
   and leads run to the panel, and an instrument on a tripod. Red: the gauge needle, which drops,
   sweeps up, overshoots and settles.
   ============================================================================================ */
function commission(S) {
  const px0 = 0.0, px1 = 4.4, py0 = -2.6, py1 = -0.6, pz0 = 0.3, pz1 = 6.0;
  S.box(px0 - 0.15, py0 - 0.15, 0, px1 + 0.15, py1 + 0.15, pz0);
  const d = [];
  for (const [a, b] of [[0.15, 2.15], [2.25, 4.25]]) {
    d.push(outline(rectOn('y', py1, a, b, pz0 + 0.2, pz1 - 0.2)));
    d.push(poly(rectOn('y', py1, b - 0.28, b - 0.2, 2.6, 3.4), GREY.deep, GREY.edge, SW));
    for (const z of [pz0 + 0.6, pz1 - 1.0]) d.push(poly(rectOn('y', py1, a - 0.05, a + 0.05, z, z + 0.4), GREY.right, GREY.edge, SW));
  }
  for (let k = 0; k < 3; k++) d.push(poly(circ([0.6 + k * 0.4, py1, 2.8], 0.11, 'y', 18), GREY.top, GREY.edge, SW));
  d.push(poly(circ([0.8, py1, 2.2], 0.16, 'y', 20), GREY.right, GREY.edge, SW), line([0.8, py1, 2.2], [0.9, py1, 2.33], GREY.edge, EW));
  d.push(poly(rectOn('y', py1, 2.6, 3.9, 4.2, 5.2), GREY.deep, GREY.edge, SW));
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) d.push(poly(rectOn('y', py1, 2.7 + i * 0.4, 2.95 + i * 0.4, 3.35 + j * 0.35, 3.55 + j * 0.35), GREY.top, GREY.edge, SW));
  d.push(outline(rectOn('y', py1, 2.6, 3.9, 1.0, 1.35)));
  for (let z = 1.0; z < 2.0; z += 0.14) d.push(line([px1, py0 + 0.35, z], [px1, py1 - 0.35, z]));
  d.push(outline(rectOn('x', px1, py0 + 0.2, py1 - 0.2, pz0 + 0.2, pz1 - 0.2)));
  S.box(px0, py0, pz0, px1, py1, pz1, { deco: d });
  S.box(px0 - 0.08, py0 - 0.08, pz1, px1 + 0.08, py1 + 0.08, pz1 + 0.12);
  // terminal box the leads land on
  S.box(0.3, py1, 1.35, 1.3, py1 + 0.25, 1.85, { deco: [dotEl([0.55, py1 + 0.25, 1.6], 0.06, 'y', GREY.deep), dotEl([0.8, py1 + 0.25, 1.6], 0.06, 'y', GREY.deep), dotEl([1.05, py1 + 0.25, 1.6], 0.06, 'y', GREY.deep)] });
  // the gauge: bezel, white dial, graduations; the red needle turns in the dial plane
  const g = [1.15, 4.35], gy = py1 + 0.2, gr = 0.9;
  const ticks = [];
  for (let k = 0; k <= 20; k++) {
    const phi = ((-135 + 13.5 * k) * PI) / 180, r0 = k % 5 === 0 ? 0.56 : 0.64;
    ticks.push(line([g[0] + r0 * Math.sin(phi), gy + 0.001, g[1] + r0 * Math.cos(phi)], [g[0] + 0.74 * Math.sin(phi), gy + 0.001, g[1] + 0.74 * Math.cos(phi)], k % 5 === 0 ? GREY.edge : GREY.seam, k % 5 === 0 ? EW : SW));
  }
  ticks.push(outline(circ([g[0], gy + 0.001, g[1]], 0.8, 'y', 48), GREY.seam, SW));
  S.tube([[g[0], py1, g[1]], [g[0], gy, g[1]]], gr, { capFill: '#FFFFFF', deco: ticks });
  const needle = [
    poly2([[-0.075, -0.02], [0.075, -0.02], [0.02, 0.74], [-0.02, 0.74]], RED.left, RED.edge, SW),
    poly2([[-0.05, -0.02], [0.05, -0.02], [0.035, -0.26], [-0.035, -0.26]], RED.left, RED.edge, SW),
    poly2(circ2([0, 0], 0.13, 20), RED.top, RED.edge, SW),
  ];
  S.moving([g[0] - 0.7, gy + 0.005, g[1] - 0.7, g[0] + 0.7, gy + 0.01, g[1] + 0.7], needle, { cls: 'mv', matrix: planeMatrix('y', [g[0], gy + 0.008, g[1]]) });
  S.flat(circ([g[0], gy + 0.02, g[1]], 0.06, 'y', 16), GREY.right, { edge: GREY.edge });
  // the test cart: posts, shelves, casters, handle, instrument with its lid up, a coiled lead
  const c0 = -4.9, c1 = -1.7, e0 = 0.7, e1 = 2.9;
  for (const [x, y] of [[c0 + 0.1, e0 + 0.1], [c1 - 0.1, e0 + 0.1], [c0 + 0.1, e1 - 0.1], [c1 - 0.1, e1 - 0.1]]) {
    S.tube([[x, y - 0.1, 0.18], [x, y + 0.1, 0.18]], 0.17);
    S.box(x - 0.07, y - 0.07, 0.35, x + 0.07, y + 0.07, 3.1);
  }
  S.box(c0, e0, 0.55, c1, e1, 0.68); S.box(c0, e0, 3.1, c1, e1, 3.24);
  S.tube([[c0 - 0.3, e0 + 0.3, 3.0], [c0 - 0.3, e1 - 0.3, 3.0]], 0.05);
  for (const y of [e0 + 0.3, e1 - 0.3]) S.tube([[c0, y, 3.0], [c0 - 0.3, y, 3.0]], 0.04);
  const inst = [
    poly(rectOn('z', 4.1, -4.45, -2.9, 1.0, 2.1), GREY.deep, GREY.edge, SW),
    line([-4.45, 1.55, 4.1], [-2.9, 1.55, 4.1], GREY.right, SW),
  ];
  for (let k = 0; k < 3; k++) inst.push(poly(circ([-2.6, 1.15 + k * 0.4, 4.1], 0.1, 'z', 16), GREY.right, GREY.edge, SW));
  for (let k = 0; k < 2; k++) inst.push(dotEl([-2.1, 1.3 + k * 0.5, 4.1], 0.07, 'z', GREY.deep, GREY.edge));
  inst.push(poly(rectOn('y', 2.6, -4.3, -2.2, 3.4, 3.85), GREY.right, GREY.edge, SW));
  S.box(-4.65, 0.9, 3.24, -1.95, 2.6, 4.1, { deco: inst });
  S.box(-4.65, 0.82, 4.1, -1.95, 0.9, 5.55, { deco: [outline(rectOn('y', 0.9, -4.5, -2.1, 4.25, 5.4))] });
  const coil = []; for (let k = 0; k < 28; k++) { const t = (2 * PI * k) / 28; coil.push([c0 - 0.02, 1.8 + 0.45 * Math.cos(t), 1.9 + 0.45 * Math.sin(t)]); }
  S.tube(coil, 0.05, { closed: true });
  S.box(-4.3, 1.1, 0.68, -2.7, 2.2, 1.35, { deco: [outline(rectOn('y', 2.2, -4.15, -2.85, 0.8, 1.25))] });
  // the test leads, sagging from the instrument to the terminal box
  for (const [ox, t] of [[0, 0.06], [0.25, 0.04]]) {
    S.tube([[-2.1 + ox * 0.1, 1.3 + ox * 2, 4.12], [-1.4, 1.1 + ox, 3.5], [-0.6, 0.5 + ox, 2.2], [0.2, -0.1 + ox * 0.4, 1.7], [0.55 + ox, py1 + 0.27, 1.6]], 0.045, { bend: 0.4, steps: 6 });
  }
  // the needle: at rest on its reading; each loop it drops to zero, sweeps up, overshoots and settles
  const rd = f => (-(-135 + 270 * f)).toFixed(1);
  S.still = `.mv{transform:rotate(${rd(0.62)}deg)}`;
  S.css = `.mv{transform:rotate(${rd(0.62)}deg)}` + run('mv', 'settle', LOOPS.commission, f => `rotate(${rd(f)}deg)`) + RM;
}

/* ============================================================================================
   05 MAINTAIN. A pump set on its skid and pad, the coupling guard off and set down, a roll cab
   with a tote. Red: the spanner on a discharge flange nut, rocking as it works the nut.
   ============================================================================================ */
function maintain(S) {
  S.box(-5.0, -2.0, 0, 3.6, 2.0, 0.55);
  S.box(-4.8, -1.6, 0.55, 3.2, 1.6, 0.95, {
    deco: [poly(rectOn('y', 1.6, -4.7, 3.1, 0.63, 0.87), GREY.deep, GREY.edge, SW), poly(rectOn('x', 3.2, -1.5, 1.5, 0.63, 0.87), GREY.deep, GREY.edge, SW)],
  });
  const bolts = [];
  for (const [x, y] of [[-4.2, 1.35], [-1.2, 1.35], [0.6, 1.35], [2.6, 1.35]]) bolts.push(dotEl([x, y, 0.95], 0.07, 'z', GREY.deep, GREY.edge));
  S.group([-4.8, -1.6, 0.95, 3.2, 1.6, 0.96], bolts);
  // motor: feet, body with fins, fan cowl, terminal box, shaft
  const mz = 2.05, mr = 1.0;
  for (const x of [-3.9, -1.9]) S.box(x - 0.35, -0.95, 0.95, x + 0.35, 0.95, 1.25);
  S.box(-3.9, -0.6, 1.25, -1.9, 0.6, 1.3);
  S.tube([[-4.75, 0, mz], [-4.25, 0, mz]], mr + 0.08, { rings: [0.25] });
  const fins = []; for (let x = -4.05; x < -1.2; x += 0.22) fins.push(x + 4.25);
  S.tube([[-4.25, 0, mz], [-1.05, 0, mz]], mr, { rings: fins });
  S.tube([[-1.05, 0, mz], [-0.85, 0, mz]], mr * 0.7);
  S.box(-3.0, -0.45, mz + 0.9, -2.0, 0.45, mz + 1.45, { deco: [outline(rectOn('y', 0.45, -2.9, -2.1, mz + 1.0, mz + 1.35)), dotEl([-2.5, 0.45, mz + 1.17], 0.06, 'y', GREY.deep)] });
  S.tube([[-0.85, 0, mz], [-0.45, 0, mz]], 0.14);
  // the coupling, open to view
  S.tube([[-0.45, 0, mz], [-0.12, 0, mz]], 0.42, { rings: [0.16] });
  S.tube([[-0.08, 0, mz], [0.25, 0, mz]], 0.42, { rings: [0.17] });
  S.tube([[0.25, 0, mz], [0.6, 0, mz]], 0.14);
  // pump: bearing frame on its foot, volute with a bolt ring, suction and discharge with flanges
  S.box(0.5, -0.55, 0.95, 1.7, 0.55, 1.3);
  S.box(0.6, -0.45, 1.3, 1.6, 0.45, 2.45, { deco: [outline(rectOn('y', 0.45, 0.75, 1.45, 1.5, 2.3)), dotEl([1.1, 0.45, 2.25], 0.06, 'y', GREY.deep)] });
  const vb = [];
  for (let k = 0; k < 10; k++) { const t = (2 * PI * k) / 10; vb.push(dotEl([2.55, 1.02 * Math.cos(t), mz + 1.02 * Math.sin(t)], 0.055, 'x', GREY.deep)); }
  S.box(1.7, -0.5, 0.95, 2.4, 0.5, 1.1);
  S.tube([[1.6, 0, mz], [1.85, 0, mz]], 1.1);
  S.tube([[1.85, 0, mz], [2.55, 0, mz]], 1.18, { deco: vb, rings: [0.35] });
  S.tube([[2.55, 0, mz], [3.3, 0, mz]], 0.42);
  S.tube([[3.3, 0, mz], [3.46, 0, mz]], 0.64, { deco: (() => { const q = []; for (let k = 0; k < 8; k++) { const t = (2 * PI * k) / 8 + PI / 8; q.push(dotEl([3.46, 0.5 * Math.cos(t), mz + 0.5 * Math.sin(t)], 0.05, 'x', GREY.deep)); } return q; })() });
  const fz = mz + 1.95, fc = [2.2, 0, fz];
  S.tube([[2.2, 0, mz + 1.05], [2.2, 0, fz - 0.16]], 0.4);
  S.tube([[2.2, 0, fz - 0.16], [2.2, 0, fz]], 0.66);
  // flange nuts and studs on top; the spanner rides the front one
  const nuts = [];
  for (let k = 0; k < 8; k++) {
    const t = (2 * PI * k) / 8 + PI / 8, x = fc[0] + 0.52 * Math.cos(t), y = fc[1] + 0.52 * Math.sin(t);
    nuts.push([x, y, t]);
  }
  for (const [x, y] of nuts) S.tube([[x, y, fz], [x, y, fz + 0.14]], 0.075);
  const front = nuts.reduce((m, n) => (n[1] > m[1] + 1e-9 || (Math.abs(n[1] - m[1]) < 1e-9 && n[0] > m[0]) ? n : m));
  // spanner: ring end on the nut, handle out along the flange radius, open jaw at the far end
  const ang = PI / 2 - 0.2;
  const R1 = 0.2, w0 = 0.085, w1 = 0.07, jx = 1.95, R2 = 0.25;
  const outlinePts = [];
  const a0 = Math.asin(w0 / R1);
  for (let k = 0; k <= 20; k++) { const t = a0 + ((2 * PI - 2 * a0) * k) / 20; outlinePts.push([R1 * Math.cos(t), R1 * Math.sin(t)]); }
  const b1 = Math.asin(w1 / R2);
  outlinePts.push([jx - R2 * Math.cos(b1), -w1]);
  for (let k = 1; k <= 8; k++) { const t = PI + b1 + ((PI - b1 - 0.55) * k) / 8; outlinePts.push([jx + R2 * Math.cos(t), R2 * Math.sin(t)]); }
  outlinePts.push([jx + 0.02, -0.09], [jx + 0.02, 0.09]);
  for (let k = 0; k <= 8; k++) { const t = 0.55 + ((PI - b1 - 0.55) * k) / 8; outlinePts.push([jx + R2 * Math.cos(t), R2 * Math.sin(t)]); }
  outlinePts.push([jx - R2 * Math.cos(b1), w1]);
  const hole = circ2([0, 0], 0.1, 6).map(([u, v]) => [u, v]);
  const rot = ([u, v]) => [u * Math.cos(ang) - v * Math.sin(ang), u * Math.sin(ang) + v * Math.cos(ang)];
  const O = outlinePts.map(rot), Hh = hole.map(rot);
  const spannerTop = [
    { pts: [...O, O[0], ...Hh.slice().reverse(), Hh[Hh.length - 1]], fill: RED.left, stroke: null, sw: 0 },
    { pts: [...O, O[0]], open: true, fill: 'none', stroke: RED.edge, sw: EW },
    { pts: [...Hh, Hh[0]], open: true, fill: 'none', stroke: RED.edge, sw: SW },
    line2(rot([0.3, 0]), rot([1.6, 0]), RED.seam, SW),
  ];
  const spannerSide = [{ pts: [...O, O[0]], fill: RED.right, stroke: RED.edge, sw: SW }];
  const sz = fz + 0.1, sbb = [front[0] - 0.3, front[1] - 0.3, sz - 0.06, front[0] + 0.5, front[1] + 2.2, sz];
  S.moving(sbb, spannerSide, { cls: 'mv', matrix: planeMatrix('z', [front[0], front[1], sz - 0.06]), layer: 1 });
  S.moving(sbb, spannerTop, { cls: 'mv', matrix: planeMatrix('z', [front[0], front[1], sz]), layer: 2 });
  // the coupling guard, off and set down against the pad
  S.box(-1.4, 2.25, 0, 0.6, 2.95, 0.55, { deco: [line([-1.4, 2.95, 0.3], [0.6, 2.95, 0.3]), line([0.6, 2.25, 0.3], [0.6, 2.95, 0.3])] });
  // the roll cab behind the motor, drawers facing the pump, casters and a tote on top
  const r0 = -5.0, r1 = -2.5, s0 = -5.3, s1 = -3.1, rz = 3.8;
  for (const [x, y] of [[r1 - 0.3, s0 + 0.3], [r1 - 0.3, s1 - 0.3], [r0 + 0.3, s1 - 0.3]]) S.tube([[x - 0.12, y, 0.18], [x + 0.12, y, 0.18]], 0.17);
  const rd = [];
  const bands = [0.5, 1.05, 1.55, 2.05, 2.55, 3.0, 3.5];
  for (let i = 0; i < bands.length - 1; i++) {
    rd.push(outline(rectOn('x', r1, s0 + 0.15, s1 - 0.15, bands[i] + 0.04, bands[i + 1] - 0.04)));
    rd.push(poly(rectOn('x', r1, s0 + 0.5, s1 - 0.5, bands[i + 1] - 0.2, bands[i + 1] - 0.12), GREY.deep, GREY.edge, SW));
  }
  rd.push(outline(rectOn('y', s1, r0 + 0.2, r1 - 0.2, 0.55, rz - 0.3)));
  S.box(r0, s0, 0.35, r1, s1, rz, { deco: rd });
  S.box(r0 - 0.05, s0 - 0.05, rz, r1 + 0.05, s1 + 0.05, rz + 0.12);
  S.box(r0 + 0.35, s0 + 0.3, rz + 0.12, r1 - 0.35, s1 - 0.4, rz + 0.75, { deco: [line([r1 - 0.35, s0 + 0.3, rz + 0.5], [r1 - 0.35, s1 - 0.4, rz + 0.5])] });
  S.tube([[(r0 + r1) / 2, s0 + 0.75, rz + 0.75], [(r0 + r1) / 2, s0 + 0.75, rz + 1.2], [(r0 + r1) / 2, s1 - 0.85, rz + 1.2], [(r0 + r1) / 2, s1 - 0.85, rz + 0.75]], 0.05, { bend: 0.15, steps: 4 });
  S.tube([[r0 + 0.5, s1 + 0.05, 2.9], [r0 + 0.5, s1 + 0.35, 2.9], [r1 - 0.5, s1 + 0.35, 2.9], [r1 - 0.5, s1 + 0.05, 2.9]], 0.05, { bend: 0.12, steps: 4 });
  S.css = run('mv', 'rock', LOOPS.maintain, rotate(-18)) + RM;
}

/* ============================================================================================
   06 HOOKUP. A cluster tool on the raised floor, its facility lines dropping through the open
   floor to the gas cabinet in the subfab, a scrubber beside it. Red: the process connection
   line. Moving: its last spool lifts off the tool port and seats again.
   ============================================================================================ */
function hookup(S) {
  const X0 = -5.2, X1 = 5.2;
  S.box(X0, -4.6, 0, X1, 4.3, 0.3);
  for (const x of [-4.4, 4.4]) S.box(x - 0.35, -0.5, 0.3, x + 0.35, 0.2, 3.6);
  const nx0 = 0.2, nx1 = 2.9, ny0 = -0.75, sy1 = 0.6, WZ0 = 3.6, WZ1 = 4.2, TZ = 4.95;
  const waffle = (a, b) => { const q = []; for (let x = a + 0.3; x + 0.6 < b; x += 1.0) q.push(poly(rectOn('y', sy1, x, x + 0.6, WZ0 + 0.15, WZ1 - 0.15), GREY.deep, GREY.edge, SW)); return q; };
  S.box(X0, -4.6, WZ0, nx0, sy1, WZ1, { deco: waffle(X0, nx0) });
  S.box(nx1, -4.6, WZ0, X1, sy1, WZ1, { deco: waffle(nx1, X1) });
  S.box(nx0, -4.6, WZ0, nx1, ny0, WZ1);
  for (let x = X0 + 0.3; x < X1; x += 1.2) { if (x > nx0 - 0.1 && x < nx1 + 0.1) continue; S.tube([[x, sy1 - 0.15, WZ1], [x, sy1 - 0.15, TZ - 0.2]], 0.06); }
  const grid = (a, b) => { const q = []; for (let x = a + 1.2; x < b; x += 1.2) q.push(line([x, -4.6, TZ], [x, sy1, TZ])); for (let y = -3.4; y < sy1; y += 1.2) q.push(line([a, y, TZ], [b, y, TZ])); return q; };
  S.box(X0, -4.6, TZ - 0.2, nx0, sy1, TZ, { deco: grid(X0, nx0) });
  S.box(nx1, -4.6, TZ - 0.2, X1, sy1, TZ, { deco: grid(nx1, X1) });
  S.box(nx0, -4.6, TZ - 0.2, nx1, ny0, TZ);
  // the lifted tile, set down on the floor beside the opening
  S.box(3.2, -0.3, TZ, 4.4, 0.5, TZ + 0.12, { deco: [outline(rectOn('z', TZ + 0.12, 3.3, 4.3, -0.2, 0.4))] });
  // the cluster tool: mainframe, transfer chamber, two process chambers, front end with load ports
  const t0 = -4.4, t1 = 3.4, u0 = -4.3, u1 = -1.25, h1 = 6.5;
  const td = [outline(rectOn('y', u1, t0 + 0.2, t1 - 0.2, TZ + 0.2, h1 - 0.2)), outline(rectOn('x', t1, u0 + 0.2, u1 - 0.2, TZ + 0.2, h1 - 0.2))];
  td.push(poly(rectOn('y', u1, 0.4, 2.7, TZ + 0.15, 6.2), GREY.left, GREY.edge, SW));
  for (let z = TZ + 0.4; z < TZ + 1.1; z += 0.13) td.push(line([t1, u0 + 0.5, z], [t1, u1 - 0.5, z]));
  S.box(t0, u0, TZ, t1, u1, h1, { deco: td });
  S.tube([[-1.0, -2.8, h1], [-1.0, -2.8, h1 + 0.75]], 1.05, { rings: [0.25] });
  S.tube([[-1.0, -2.8, h1 + 0.75], [-1.0, -2.8, h1 + 0.9]], 0.5);
  for (const [a, b, c, e] of [[-4.2, -2.7, -4.1, -1.7], [0.7, 2.2, -4.1, -2.7]]) {
    S.box(a, c, h1, b, e, h1 + 1.0, { deco: [line([a, e, h1 + 0.5], [b, e, h1 + 0.5]), line([b, c, h1 + 0.5], [b, e, h1 + 0.5])] });
    S.tube([[(a + b) / 2, (c + e) / 2, h1 + 1.0], [(a + b) / 2, (c + e) / 2, h1 + 1.2]], 0.55);
  }
  S.box(-4.2, u1, TZ + 1.0, -1.4, -0.7, TZ + 1.15);
  for (const x of [-3.95, -2.6]) S.box(x, u1 + 0.05, TZ + 1.15, x + 1.1, -0.82, TZ + 1.9, { deco: [line([x, -0.82, TZ + 1.7], [x + 1.1, -0.82, TZ + 1.7])] });
  // facility lines: three gas lines and the red process line drop to the gas cabinet
  const vz = 2.5, v0 = 0.3, v1 = 3.2, w0 = 1.5, w1 = 3.4;
  for (const [x, z] of [[0.75, 5.35], [2.05, 5.95], [2.45, 5.35]]) {
    S.pipe([[x, u1, z], [x, 0.05, z], [x, 0.05, 3.05], [x, 2.3, 3.05], [x, 2.3, vz]], 0.075, { bend: 0.3, steps: 6 });
    S.collar([x, 0.05, 4.3], [x, 0.05, 4.42], 0.11, 0.075);
  }
  const px = 1.4, pz = 5.65, rr = 0.2;
  S.tube([[px, u1, pz], [px, u1 + 0.1, pz]], 0.33);
  const spool = new Scene('spool');
  spool.tube([[px, u1 + 0.1, pz], [px, u1 + 0.2, pz]], 0.33, { pal: RED });
  spool.tube([[px, u1 + 0.2, pz], [px, -0.85, pz]], rr, { pal: RED });
  spool.tube([[px, -0.85, pz], [px, -0.75, pz]], 0.33, { pal: RED });
  S.moving(worldBox(spool), elsOf(spool), { cls: 'mv' });
  S.tube([[px, -0.75, pz], [px, -0.65, pz]], 0.33, { pal: RED });
  S.pipe([[px, -0.65, pz], [px, 0.15, pz], [px, 0.15, 3.25], [px, 1.8, 3.25], [px, 1.8, vz]], rr, { pal: RED, bend: 0.45, steps: 10 });
  // the gas cabinet: window, valve handles, extract duct
  const gd = [poly(rectOn('y', w1, 0.55, 2.95, 1.2, 2.2), GREY.deep, GREY.edge, SW), outline(rectOn('y', w1, 0.45, 3.05, 0.45, 2.35))];
  for (let k = 0; k < 3; k++) { gd.push(poly(circ([1.05 + k * 0.7, w1, 1.7], 0.17, 'y', 20), GREY.top, GREY.edge, SW)); gd.push(line([0.93 + k * 0.7, w1, 1.7], [1.17 + k * 0.7, w1, 1.7], GREY.edge, SW)); }
  gd.push(outline(rectOn('x', v1, w0 + 0.2, w1 - 0.2, 0.45, vz - 0.15)));
  S.box(v0, w0, 0.3, v1, w1, vz, { deco: gd });
  S.tube([[2.9, 2.2, vz], [2.9, 2.2, vz + 0.4]], 0.18);
  // the scrubber, banded, its duct rising under the floor
  S.tube([[-2.6, 2.3, 0.3], [-2.6, 2.3, 2.9]], 0.95, { rings: [0.8, 1.7] });
  S.tube([[-2.6, 2.3, 2.9], [-2.6, 2.3, 3.1]], 1.0);
  S.pipe([[-2.6, 2.3, 3.1], [-2.6, 2.3, 3.3], [-2.6, 0.3, 3.3]], 0.3, { bend: 0.35, steps: 8 });
  // the spool lifts straight up off its seat (clear of both flanges) and is set back
  S.css = run('mv', 'seat', LOOPS.hookup, translate(0, -0.34 * U * K6)) + RM;
}

/* K6 is read inside the scene functions (for animation distances in screen px) */
let K6 = 1;
const SET = [
  ['svc-design', 'Design', design, 1.0],
  ['svc-procure', 'Procure', procure, 1.3],
  ['svc-construct', 'Construct', construct, 1.0],
  ['svc-commission', 'Commission', commission, 1.38],
  ['svc-maintain', 'Maintain', maintain, 1.35],
  ['svc-hookup', 'Hookup', hookup, 1.0],
];
const built = SET.map(([slug, title, fn, k]) => {
  K6 = k; setScale(k);
  const S = new Scene(slug); fn(S);
  const els = elsOf(S); setScale(1);
  return { slug, title, els, bb: bboxOf(els), css: S.css || '', still: S.still || '' };
});
writeSet(OUT, built);
/* the still twin of each, the rest pose with no animation: served through <picture> under
   prefers-reduced-motion (an SVG inside <img> cannot be relied on to see that preference) and the
   source for the 240 px WebP cuts (export-iso6-webp.mjs) */
writeSet(OUT, built.map(b => ({ ...b, slug: b.slug + '-still', css: b.still })));
