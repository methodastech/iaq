#!/usr/bin/env node
/* 29 Sep 2026. The nine discipline objects, isometric, for the Design tab (section 06).
   Run: node public/design/iso/build-iso9.mjs   (writes the nine .svg files next to this file; the engine is iso-engine.mjs)

   Every object is placed by hand in world units on one 12 x 12 footprint, then projected with
   a true 30 degree isometric (x runs down right, y runs down left, z is up). One scale, one
   viewBox, each drawing centred in it. The house rules the drawing code enforces:
     three tones per solid: top #FFFFFF, left face #E6E8EB, right face #C9CDD3, recess #A9AFB8
     edges #8E96A1 at 0.75 px (non scaling), seams and fine detail #A9AFB8 at 0.5 px
     exactly one part per object in IAQ red #EC2326 (its lit top one step lighter, its shade
     face one step deeper, so the red part still reads as a solid)
     no ground patch, no shadow, no gradient, no glow, no black, no text.
   Solids are painted back to front by a topological sort on their world bounding boxes. */
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  U, CO, PI, EW, SW, GREY, RED, add, sub, mul, dot, cross, len, norm, VIEW, P, tone,
  poly, line, pline, circ, dotEl, rectOn, outline, roundPath, Scene, elsOf, bboxOf, FRAME, writeSet,
} from './iso-engine.mjs';

const OUT = dirname(fileURLToPath(import.meta.url));

/* ============================================================================================
   THE NINE. Every object sits on the same 12 by 12 unit footprint at the same scale; the
   extents are tuned so the nine come out at one optical size in the shared viewBox.
   ============================================================================================ */

/* 01 Civil & Structural: bored piles and pile caps under a see-through grade, two ground
   beams, a column rising to a beam stub with its bars showing. Red: the column. */
function civil(S) {
  const g = 5.6, cz = 4.1;
  const piles = [[1.2, 0.1], [2.8, 0.1], [1.2, 1.7], [2.8, 1.7], [-3.6, 0.1], [-3.6, 1.7]];
  for (const [x, y] of piles) S.tube([[x, y, 0.2], [x, y, cz - 0.12]], 0.34, { rings: [1.5] });
  const caps = [[0.5, -0.6, 3.5, 2.4], [-4.45, -0.6, -2.75, 2.4]];
  const ct = g - 0.7;
  for (const [x0, y0, x1, y1] of caps) {
    S.box(x0 - 0.16, y0 - 0.16, cz - 0.12, x1 + 0.16, y1 + 0.16, cz);
    S.box(x0, y0, cz, x1, y1, ct);
  }
  S.box(-2.75, 0.5, ct - 1.0, 0.5, 1.3, ct);
  S.box(1.6, -4.1, ct - 1.0, 2.4, -0.6, ct);
  S.box(1.5, 0.4, ct, 2.5, 1.4, g);
  // the grade: a see-through plane, so what is under it reads as under it
  S.flat([[-6, -4.1, g], [6, -4.1, g], [6, 5, g], [-6, 5, g]], '#FFFFFF', { fop: 0.4 });
  const top = g + 7.2;
  S.box(1.5, 0.4, g, 2.5, 1.4, top, {
    pal: RED,
    deco: [line([1.5, 1.4, g + 3.6], [2.5, 1.4, g + 3.6], RED.seam), line([2.5, 0.4, g + 3.6], [2.5, 1.4, g + 3.6], RED.seam)],
  });
  const bars = [];
  for (const x of [1.78, 2.22]) for (const z of [top - 1.0, top - 0.2]) bars.push(dotEl([x, 4.4, z], 0.07, 'y', GREY.deep));
  S.box(1.6, 1.4, top - 1.2, 2.4, 4.4, top, { deco: [...bars, outline(rectOn('y', 4.4, 1.7, 2.3, top - 1.1, top - 0.1))] });
  for (const [x, y] of [[1.72, 0.62], [2.28, 0.62], [1.72, 1.18], [2.28, 1.18]]) S.tube([[x, y, top], [x, y, top + 0.7]], 0.05);
}

/* 02 Architectural: a portal frame building, clad bays under a sheeted roof with roof lights,
   one open bay showing the I section frame and roof truss, a roller door. Red: the door. */
function architectural(S) {
  const eave = 5.2, ridge = 6.5, half = 4.0, slope = (ridge - eave) / half;
  const roofZ = y => ridge - slope * Math.abs(y);
  S.box(-6.2, -4.4, 0, 5.4, 4.4, 0.35, {
    deco: [line([-6.2, 4.4, 0.12], [5.4, 4.4, 0.12]), line([5.4, -4.4, 0.12], [5.4, 4.4, 0.12])],
  });
  const deco = [];
  for (let y = -3.5; y <= 3.51; y += 0.5) deco.push(line([1.8, y, 0.95], [1.8, y, roofZ(y) - 0.02]));
  deco.push(pline([[1.8, -4, 0.95], [1.8, 4, 0.95]]));
  for (let x = -5.6; x <= 1.5; x += 0.5) {
    if (x > -3.6 && x < -0.3) continue;
    if (x > 0.15 && x < 1.05) continue;
    deco.push(line([x, 4, 0.95], [x, 4, eave - 0.02]));
  }
  deco.push(line([-6, 4, 0.95], [-3.55, 4, 0.95]), line([-0.45, 4, 0.95], [1.8, 4, 0.95]));
  deco.push(poly(rectOn('y', 4.0, 0.25, 1.0, 0.35, 2.55), GREY.left, GREY.edge, SW), line([0.88, 4.0, 1.35], [0.88, 4.0, 1.6], GREY.edge, EW));
  S.prism('x', [[-half, 0.35], [half, 0.35], [half, eave], [0, ridge], [-half, eave]], -6, 1.8, { deco });
  const slats = [];
  for (let z = 0.62; z < 3.6; z += 0.24) slats.push(line([-3.3, 4.03, z], [-0.7, 4.03, z], RED.seam, SW));
  S.flat(rectOn('y', 4.03, -3.3, -0.7, 0.35, 3.7), RED.left, { edge: RED.edge, deco: [...slats, line([-3.3, 4.03, 0.5], [-0.7, 4.03, 0.5], RED.edge, EW)] });
  S.box(-3.45, 4.0, 0.35, -3.3, 4.16, 3.75);
  S.box(-0.7, 4.0, 0.35, -0.55, 4.16, 3.75);
  S.box(-3.5, 4.0, 3.75, -0.5, 4.45, 4.3, { deco: [line([-3.5, 4.45, 3.95], [-0.5, 4.45, 3.95])] });
  const t = 0.14, ov = 0.35, zE = roofZ(half + ov);
  const ribsF = [], ribsB = [];
  for (let x = -6.05; x <= 1.95; x += 0.4) {
    ribsF.push(line([x, 0.2, ridge + t], [x, half + ov, zE + t]));
    ribsB.push(line([x, -half - ov, zE + t], [x, -0.2, ridge + t]));
  }
  S.prism('x', [[-half - ov, zE], [0, ridge], [0, ridge + t], [-half - ov, zE + t]], -6.25, 2.05, { deco: ribsB });
  const lights = [];
  for (const x0 of [-5.2, -2.9, -0.6]) {
    const q = [[x0, 1.2, roofZ(1.2) + t + 0.01], [x0 + 0.8, 1.2, roofZ(1.2) + t + 0.01], [x0 + 0.8, 3.3, roofZ(3.3) + t + 0.01], [x0, 3.3, roofZ(3.3) + t + 0.01]];
    lights.push(poly(q, GREY.left, GREY.edge, SW));
  }
  S.prism('x', [[0, ridge], [half + ov, zE], [half + ov, zE + t], [0, ridge + t]], -6.25, 2.05, { deco: [...ribsF, ...lights] });
  S.prism('x', [[-0.42, ridge + t - 0.02], [0, ridge + t + 0.2], [0.42, ridge + t - 0.02]], -6.3, 2.1);
  const fx = 4.6;
  for (const yc of [-3.8, 3.8]) {
    S.box(fx - 0.35, yc - 0.3, 0.35, fx + 0.35, yc + 0.3, 0.45, { deco: [dotEl([fx - 0.2, yc + 0.3, 0.4], 0.04, 'y'), dotEl([fx + 0.2, yc + 0.3, 0.4], 0.04, 'y')] });
    S.box(fx - 0.2, yc - 0.2, 0.45, fx + 0.2, yc - 0.14, eave - 0.25);
    S.box(fx - 0.03, yc - 0.14, 0.45, fx + 0.03, yc + 0.14, eave - 0.25, { faces: { right: GREY.deep } });
    S.box(fx - 0.2, yc + 0.14, 0.45, fx + 0.2, yc + 0.2, eave - 0.25);
  }
  for (const yc of [-3.8, 3.8]) S.box(1.8, yc - 0.12, eave - 0.25, fx + 0.2, yc + 0.12, eave);
  const tx0 = fx - 0.07, tx1 = fx + 0.07;
  S.bar('x', [-4, eave - 0.13], [4, eave - 0.13], 0.2, tx0, tx1);
  for (const y of [-2.67, -1.33, 0, 1.33, 2.67]) S.bar('x', [y, eave - 0.03], [y, roofZ(y) - 0.18], 0.1, tx0, tx1);
  for (const [a, b] of [[-2.67, -1.33], [-1.33, 0], [2.67, 1.33], [1.33, 0], [-4, -2.67], [4, 2.67]]) S.bar('x', [a, eave - 0.03], [b, roofZ(b) - 0.2], 0.09, tx0, tx1);
  S.bar('x', [-4.1, eave - 0.03], [0, ridge - 0.1], 0.2, tx0, tx1);
  S.bar('x', [0, ridge - 0.1], [4.1, eave - 0.03], 0.2, tx0, tx1);
  for (const y of [-3.35, -2.2, -1.05, 0, 1.05, 2.2, 3.35]) {
    const z = roofZ(y) - 0.02;
    S.box(2.05, y - 0.05, z, fx + 0.16, y + 0.05, z + 0.16);
  }
  S.bar('y', [1.85, 0.5], [fx - 0.25, eave - 0.4], 0.06, 3.84, 3.88);
  S.bar('y', [1.85, eave - 0.4], [fx - 0.25, 0.5], 0.06, 3.84, 3.88);
}

/* 03 Process Utilities: a two bent pipe rack carrying three headers, a gate valve with its
   handwheel on the near drop, a second drop turning toward the bent. Red: the valve. */
function processUtilities(S) {
  const bents = [-3.8, 4.0], top = 7.3, low = 4.6;
  for (const xb of bents) for (const yc of [-2.4, 2.4]) {
    const bolts = [];
    for (const [dx, dy] of [[-0.26, -0.26], [0.26, -0.26], [-0.26, 0.26], [0.26, 0.26]]) bolts.push(dotEl([xb + dx, yc + dy, 0.13], 0.05, 'z', GREY.deep, GREY.edge));
    S.box(xb - 0.42, yc - 0.42, 0, xb + 0.42, yc + 0.42, 0.13, { deco: bolts });
    S.box(xb - 0.22, yc - 0.22, 0.13, xb + 0.22, yc - 0.16, top);
    S.box(xb - 0.03, yc - 0.16, 0.13, xb + 0.03, yc + 0.16, top, { faces: { right: GREY.deep } });
    S.box(xb - 0.22, yc + 0.16, 0.13, xb + 0.22, yc + 0.22, top);
  }
  for (const xb of bents) for (const zb of [low, top]) {
    S.box(xb - 0.2, -2.75, zb, xb + 0.2, 2.75, zb + 0.07);
    S.box(xb - 0.03, -2.75, zb + 0.07, xb + 0.03, 2.75, zb + 0.37, { faces: { right: GREY.deep } });
    S.box(xb - 0.2, -2.75, zb + 0.37, xb + 0.2, 2.75, zb + 0.44);
  }
  for (const xb of bents) for (const s of [-1, 1]) S.bar('x', [s * 2.16, top - 1.0], [s * 1.25, top - 0.07], 0.12, xb - 0.04, xb + 0.04);
  for (const yc of [-2.4, 2.4]) S.box(bents[0] + 0.22, yc - 0.1, top + 0.14, bents[1] - 0.22, yc + 0.1, top + 0.44);
  const zt = top + 0.44, heads = [[-1.3, 0.5], [0.15, 0.38], [1.4, 0.3]];
  for (const [y, r] of heads) {
    for (const xb of bents) S.box(xb - 0.3, y - 0.13, zt, xb + 0.3, y + 0.13, zt + 0.15);
    const zc = zt + 0.15 + r;
    S.tube([[-7.0, y, zc], [5.9, y, zc]], r, { rings: [2.4, 7.9] });
    S.tube([[5.9, y, zc], [6.05, y, zc]], r + 0.2);
    const bolts = [];
    for (let k = 0; k < 8; k++) { const a = (k / 8) * 2 * PI + PI / 8; bolts.push(dotEl([6.21, y + (r + 0.1) * Math.cos(a), zc + (r + 0.1) * Math.sin(a)], 0.045, 'x', GREY.deep)); }
    S.tube([[6.05, y, zc], [6.21, y, zc]], r + 0.2, { deco: bolts });
  }
  // drop one, with the gate valve
  const xv = -0.4, yv = 1.4, zh = zt + 0.15, vz = 4.55;
  S.tube([[xv, yv, zh], [xv, yv, vz + 0.81]], 0.2);
  S.tube([[xv, yv, vz + 0.65], [xv, yv, vz + 0.81]], 0.42);
  S.tube([[xv, yv, vz - 0.91], [xv, yv, vz - 0.75]], 0.42);
  S.pipe([[xv, yv, vz - 0.91], [xv, yv, 1.25], [xv, 3.3, 1.25]], 0.2, { bend: 0.5, steps: 12 });
  S.tube([[xv, 3.3, 1.25], [xv, 3.46, 1.25]], 0.38, {
    deco: (() => { const b = []; for (let k = 0; k < 8; k++) { const a = (k / 8) * 2 * PI + PI / 8; b.push(dotEl([xv + 0.29 * Math.cos(a), 3.46, 1.25 + 0.29 * Math.sin(a)], 0.04, 'y', GREY.deep)); } return b; })(),
  });
  const vb = { pal: RED };
  S.tube([[xv, yv, vz + 0.49], [xv, yv, vz + 0.65]], 0.42, vb);
  S.tube([[xv, yv, vz - 0.59], [xv, yv, vz + 0.49]], 0.34, vb);
  S.tube([[xv, yv, vz - 0.75], [xv, yv, vz - 0.59]], 0.42, vb);
  S.tube([[xv, yv + 0.25, vz], [xv, yv + 0.55, vz]], 0.24, vb);
  S.tube([[xv, yv + 0.55, vz], [xv, yv + 0.66, vz]], 0.32, vb);
  S.tube([[xv, yv + 0.66, vz], [xv, yv + 1.05, vz]], 0.2, vb);
  S.tube([[xv, yv + 1.05, vz], [xv, yv + 1.5, vz]], 0.045);
  const wy = yv + 1.4, wR = 0.52;
  for (const a of [PI / 4, (3 * PI) / 4, (5 * PI) / 4, (7 * PI) / 4]) {
    S.tube([[xv + 0.08 * Math.cos(a), wy, vz + 0.08 * Math.sin(a)], [xv + (wR - 0.04) * Math.cos(a), wy, vz + (wR - 0.04) * Math.sin(a)]], 0.035, { pal: RED, layer: 1 });
  }
  const ring = []; for (let k = 0; k < 36; k++) { const a = (k / 36) * 2 * PI; ring.push([xv + wR * Math.cos(a), wy, vz + wR * Math.sin(a)]); }
  S.tube(ring, 0.065, { pal: RED, closed: true, layer: 2 });
  S.tube([[xv, wy - 0.07, vz], [xv, wy + 0.09, vz]], 0.11, { pal: RED, layer: 3 });
  // drop two, flanged mid height, turning toward the bent
  const x2 = 2.0, y2 = 0.15;
  S.tube([[x2, y2, zh], [x2, y2, 3.1]], 0.22);
  S.tube([[x2, y2, 2.94], [x2, y2, 3.1]], 0.38);
  S.tube([[x2, y2, 2.78], [x2, y2, 2.94]], 0.38);
  S.pipe([[x2, y2, 2.78], [x2, y2, 1.1], [3.2, y2, 1.1]], 0.22, { bend: 0.5, steps: 12 });
  S.tube([[3.2, y2, 1.1], [3.34, y2, 1.1]], 0.38);
}

/* 04 Fire Protection: a sprinkler branch hung from the steel above, fed by a grey cross main
   and riser, with drops to pendant heads. Red: the branch. */
function fireProtection(S) {
  S.box(-6.6, -0.45, 9.8, 6.6, 0.45, 9.9);
  S.box(-6.6, -0.04, 9.9, 6.6, 0.04, 10.5, { faces: { left: GREY.deep } });
  S.box(-6.6, -0.45, 10.5, 6.6, 0.45, 10.6);
  const xm = -4.6, zm = 8.3, rm = 0.5, yr = 5.0;
  S.pipe([[xm, -6.2, zm], [xm, yr, zm], [xm, yr, 0.6]], rm, { bend: 1.0, steps: 14 });
  for (const y of [-3.4, 2.6]) S.collar([xm, y - 0.09, zm], [xm, y + 0.09, zm], rm + 0.06, rm);
  for (const z of [5.8, 2.6]) S.collar([xm, yr, z - 0.09], [xm, yr, z + 0.09], rm + 0.06, rm);
  S.tube([[xm, yr, 0.2], [xm, yr, 0.42]], rm + 0.32);
  S.tube([[xm, yr, 0.42], [xm, yr, 0.6]], rm + 0.24);
  S.tube([[xm + 0.45, yr, 3.9], [xm + 0.8, yr, 3.9]], 0.06);
  S.tube([[xm + 0.8, yr, 3.9], [xm + 0.92, yr, 3.9]], 0.26, { capFill: '#FFFFFF' });
  S.tube([[xm, 0, 9.8], [xm, 0, zm + rm]], 0.045);
  const zb = 7.8, rb = 0.32;
  S.tube([[xm + 0.38, 0, zb], [6.3, 0, zb]], rb, { pal: RED });
  for (const x of [-0.6, 4.3]) S.collar([x - 0.08, 0, zb], [x + 0.08, 0, zb], rb + 0.05, rb);
  for (const xh of [-2.2, 1.7, 5.4]) {
    S.box(xh - 0.16, -0.22, 9.62, xh + 0.16, 0.22, 9.8);
    S.tube([[xh, 0, 9.62], [xh, 0, zb + rb + 0.06]], 0.045);
    const strap = []; for (let k = 0; k <= 24; k++) { const a = -PI / 4 + (k / 24) * PI; strap.push([xh, (rb + 0.05) * Math.cos(a), zb + (rb + 0.05) * Math.sin(a)]); }
    S.tube(strap, 0.04, { layer: 1 });
  }
  for (const xd of [-3.1, 0.5, 3.6]) {
    S.tube([[xd, 0, zb - rb], [xd, 0, zb - 0.56]], 0.2);
    S.tube([[xd, 0, zb - 0.56], [xd, 0, 5.3]], 0.12);
    S.tube([[xd, 0, 5.05], [xd, 0, 5.3]], 0.19);
    for (const s of [-1, 1]) S.tube([[xd + s * 0.14, 0, 5.05], [xd + s * 0.12, 0, 4.78], [xd + s * 0.04, 0, 4.62]], 0.03);
    S.tube([[xd, 0, 4.72], [xd, 0, 4.98]], 0.055, { capFill: GREY.left });
    S.tube([[xd, 0, 4.56], [xd, 0, 4.61]], 0.34);
  }
}

/* 05 Air-conditioning: an air handling unit on its skid, the fan section opened to show the
   scroll fan, coil connections, return and supply duct stubs. Red: the fan. */
function airConditioning(S) {
  const x0 = -6.3, x1 = 5.9, y0 = -2.5, y1 = 2.5, zb = 0.9, zt = 5.4;
  S.box(x0, y0, 0.3, x1, y1, zb, {
    deco: [poly(rectOn('y', y1, x0 + 0.1, x1 - 0.1, 0.42, 0.78), GREY.deep, GREY.edge, SW), poly(rectOn('x', x1, y0 + 0.1, y1 - 0.1, 0.42, 0.78), GREY.deep, GREY.edge, SW)],
  });
  const joints = [-3.6, -1.6, 0.5, 3.9];
  const d = [];
  for (const x of joints) {
    d.push(line([x - 0.05, y1, zb], [x - 0.05, y1, zt]), line([x + 0.05, y1, zb], [x + 0.05, y1, zt]));
    d.push(line([x - 0.05, y0, zt], [x - 0.05, y1, zt]), line([x + 0.05, y0, zt], [x + 0.05, y1, zt]));
  }
  const door = (a, b) => {
    d.push(outline(rectOn('y', y1, a, b, zb + 0.35, zt - 0.35)));
    d.push(poly(rectOn('y', y1, b - 0.32, b - 0.22, 2.7, 3.5), GREY.deep, GREY.edge, SW));
    for (const z of [zb + 0.7, zt - 0.8]) d.push(poly(rectOn('y', y1, a - 0.06, a + 0.06, z, z + 0.32), GREY.right, GREY.edge, SW));
  };
  door(-5.8, -4.0); door(-3.2, -1.95);
  d.push(outline(rectOn('y', y1, -1.3, 0.25, zb + 0.35, zt - 0.35)));
  d.push(outline(rectOn('y', y1, 4.15, 5.65, zb + 0.35, zt - 0.35)));
  d.push(poly(rectOn('y', y1, 4.45, 5.05, 3.7, 4.4), GREY.right, GREY.edge, SW));
  d.push(outline(rectOn('x', x1, y0 + 0.3, y1 - 0.3, zb + 0.35, zt - 0.35)));
  for (const y of [-1.3, -0.45, 0.45, 1.3]) d.push(line([x1, y, zb + 0.35], [x1, y, zt - 0.35]));
  S.box(x0, y0, zb, x1, y1, zt, { deco: d });
  // the open fan section: interior, then the scroll fan, clipped to the opening
  const ox0 = 0.75, ox1 = 3.65, oz0 = zb + 0.2, oz1 = zt - 0.2;
  const inner = new Scene('fan-inner');
  inner.flat(rectOn('y', y0 + 0.1, 0.5, 3.9, zb, zt), GREY.right, { edge: GREY.right });
  inner.flat(rectOn('z', zb + 0.02, 0.5, 3.9, y0 + 0.1, y1), GREY.left, { edge: GREY.left });
  inner.flat(rectOn('x', 0.6, y0 + 0.1, y1, zb, zt), GREY.deep, { edge: GREY.deep });
  const fc = [1.65, 2.6], fr = 1.0, fy0 = -0.6, fy1 = 1.95;
  for (const x of [1.0, 2.3]) inner.box(x - 0.18, -0.4, zb + 0.02, x + 0.18, 1.7, 1.4);
  inner.box(0.7, -0.5, 1.4, 2.6, 1.8, 1.56);
  inner.tube([[fc[0], fy0, fc[1]], [fc[0], fy1, fc[1]]], fr, { pal: RED });
  inner.box(fc[0], fy0, fc[1] + 0.2, 3.9, fy1, fc[1] + fr, { pal: RED });
  const hub = [fc[0], fy1 + 0.005, fc[1]], wheel = [];
  const ringO = circ(hub, 0.72, 'y', 48), ringI = circ(hub, 0.6, 'y', 48);
  wheel.push(poly(ringI, RED.deep, RED.edge, SW));
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * 2 * PI;
    wheel.push(line([hub[0] + 0.24 * Math.cos(a), hub[1], hub[2] + 0.24 * Math.sin(a)], [hub[0] + 0.58 * Math.cos(a + 0.5), hub[1], hub[2] + 0.58 * Math.sin(a + 0.5)], RED.top, 0.75));
  }
  wheel.push(poly(circ(hub, 0.24, 'y', 32), RED.left, RED.edge, SW));
  wheel.push(poly(circ(hub, 0.08, 'y', 16), GREY.right, GREY.edge, SW));
  wheel.push({ pts: [...ringO, ringO[0]].map(P), open: true, fill: 'none', stroke: RED.edge, sw: SW });
  wheel.push({ pts: [...ringO, ringO[0], ...ringI.slice().reverse(), ringI[ringI.length - 1]].map(P), fill: RED.top, stroke: null, sw: 0 });
  inner.group([fc[0] - 0.8, fy1, fc[1] - 0.8, fc[0] + 0.8, fy1 + 0.01, fc[1] + 0.8], wheel);
  const clipPts = rectOn('y', y1, ox0, ox1, oz0, oz1).map(P);
  const frame = [
    poly([[ox0, y1 - 0.12, oz0], [ox0, y1, oz0], [ox0, y1, oz1], [ox0, y1 - 0.12, oz1]], GREY.right, GREY.edge, SW),
    poly([[ox0, y1 - 0.12, oz0], [ox1, y1 - 0.12, oz0], [ox1, y1, oz0], [ox0, y1, oz0]], GREY.top, GREY.edge, SW),
    outline(rectOn('y', y1, ox0, ox1, oz0, oz1), GREY.edge, EW),
  ];
  S.group([0.5, y0, zb, 3.9, y1, zt], [{ clip: clipPts, id: 'fanOpen', children: elsOf(inner) }, ...frame]);
  // coil connections with valves, and the drain
  for (const z of [1.8, 3.7]) {
    S.tube([[-0.9, y1, z], [-0.9, 3.45, z]], 0.16);
    S.tube([[-0.9, 2.95, z], [-0.9, 3.07, z]], 0.28);
    S.box(-1.06, 3.07, z - 0.14, -0.74, 3.27, z + 0.14);
    S.tube([[-0.9, 3.17, z + 0.14], [-0.9, 3.17, z + 0.52]], 0.035);
    S.box(-1.15, 3.1, z + 0.52, -0.65, 3.24, z + 0.56);
  }
  S.tube([[-0.1, y1, 1.15], [-0.1, 2.95, 1.15]], 0.08);
  const stub = (a0, a1, b0, b1, h) => {
    const flex = [];
    for (let x = a0 + 0.2; x < a1; x += 0.2) flex.push(line([x, b1, zt], [x, b1, zt + 0.32]));
    for (let y = b0 + 0.2; y < b1; y += 0.2) flex.push(line([a1, y, zt], [a1, y, zt + 0.32]));
    S.box(a0, b0, zt, a1, b1, zt + 0.32, { deco: flex });
    S.box(a0, b0, zt + 0.32, a1, b1, zt + h - 0.14, {
      deco: [line([a0, b1, zt + h - 0.7], [a1, b1, zt + h - 0.7]), line([a1, b0, zt + h - 0.7], [a1, b1, zt + h - 0.7])],
    });
    S.box(a0 - 0.12, b0 - 0.12, zt + h - 0.14, a1 + 0.12, b1 + 0.12, zt + h, {
      deco: [poly(rectOn('z', zt + h, a0 + 0.1, a1 - 0.1, b0 + 0.1, b1 - 0.1), GREY.deep, GREY.edge, SW)],
    });
  };
  stub(-5.6, -4.0, -1.7, 1.5, 1.9);
  stub(4.3, 5.5, -1.6, 1.6, 2.3);
}

/* 06 HT & LV Electrical: a cable ladder hung on trapeze supports, three cables leaving its end
   and dropping into a four section switchboard. Red: the cables. */
function electrical(S) {
  const bx0 = -0.4, bx1 = 7.2, by0 = 0.4, by1 = 2.6, bz0 = 0.3, bz1 = 6.2;
  S.box(bx0 - 0.2, 0.25, 0, bx1 + 0.2, 2.8, 0.3);
  const d = [];
  const w = (bx1 - bx0) / 4;
  for (let s = 0; s < 4; s++) {
    const a = bx0 + s * w, b = a + w;
    if (s > 0) d.push(line([a, by1, bz0], [a, by1, bz1], GREY.edge, EW), line([a, by0, bz1], [a, by1, bz1]));
    const m0 = a + 0.14, m1 = b - 0.14;
    for (const [z0, z1] of [[4.05, 5.95], [2.15, 3.85], [0.55, 1.95]]) {
      d.push(outline(rectOn('y', by1, m0, m1, z0, z1)));
      d.push(poly(rectOn('y', by1, m1 - 0.2, m1 - 0.13, (z0 + z1) / 2 - 0.25, (z0 + z1) / 2 + 0.25), GREY.deep, GREY.edge, SW));
    }
    d.push(poly(rectOn('y', by1, m0 + 0.25, m0 + 0.85, 4.95, 5.6), GREY.right, GREY.edge, SW));
    d.push(outline(rectOn('y', by1, m0 + 0.33, m0 + 0.77, 5.05, 5.5)));
    for (let k = 0; k < 3; k++) d.push(dotEl([m0 + 0.32 + k * 0.26, by1, 4.45], 0.075, 'y', GREY.top, GREY.edge));
    d.push(poly(rectOn('y', by1, m0 + 0.45, m0 + 0.85, 2.75, 3.25), GREY.right, GREY.edge, SW));
    for (let z = 0.8; z < 1.8; z += 0.16) d.push(line([m0 + 0.25, by1, z], [m1 - 0.4, by1, z]));
  }
  d.push(outline(rectOn('x', bx1, by0 + 0.2, by1 - 0.2, bz0 + 0.25, bz1 - 0.25)));
  S.box(bx0, by0, bz0, bx1, by1, bz1, { deco: d });
  S.box(bx0 - 0.06, by0 - 0.06, bz1, bx1 + 0.06, by1 + 0.06, bz1 + 0.1);
  const xd = 2.3;
  S.box(xd - 0.8, 0.8, bz1 + 0.1, xd + 0.8, 2.2, bz1 + 0.45);
  for (const y of [1.2, 1.6, 2.0]) S.tube([[xd, y, bz1 + 0.45], [xd, y, bz1 + 0.6]], 0.22);
  const lz = 8.2, lx0 = -6.2, lx1 = 1.2;
  for (const xh of [-4.8, -1.4]) {
    S.box(xh - 0.13, 0.5, lz - 0.28, xh + 0.13, 2.7, lz, { deco: [line([xh - 0.13, 2.7, lz - 0.2], [xh + 0.13, 2.7, lz - 0.2])] });
    for (const y of [0.64, 2.56]) {
      S.tube([[xh, y, lz], [xh, y, 10.4]], 0.045);
      S.box(xh - 0.08, y - 0.08, lz, xh + 0.08, y + 0.08, lz + 0.08);
      S.box(xh - 0.2, y - 0.2, 10.4, xh + 0.2, y + 0.2, 10.5);
    }
  }
  S.box(lx0, 0.78, lz, lx1, 0.9, lz + 0.42);
  for (let x = lx0 + 0.35; x < lx1; x += 0.6) S.box(x - 0.07, 0.9, lz, x + 0.07, 2.3, lz + 0.1);
  for (const y of [1.2, 1.6, 2.0]) S.pipe([[lx0, y, lz + 0.26], [xd, y, lz + 0.26], [xd, y, bz1 + 0.6]], 0.16, { pal: RED, bend: 0.95, steps: 14 });
  S.box(lx0, 2.3, lz, lx1, 2.42, lz + 0.42, {
    deco: [poly(rectOn('y', 2.42, lx0, lx1, lz + 0.08, lz + 0.34), GREY.deep, GREY.edge, SW)],
  });
}

/* 07 Cleanroom System: a raised clean floor with perforated tiles, a return air wall with its
   grilles, and a ceiling grid carrying fan filter units. Red: one fan filter unit. */
function cleanroom(S) {
  const fx0 = -5, fx1 = 5, fy0 = -5.5, fy1 = 2.6;
  S.box(fx0, fy0, 0, fx1, fy1, 0.3);
  for (let x = fx0 + 0.4; x < fx1; x += 1.2) S.tube([[x, fy1 - 0.25, 0.3], [x, fy1 - 0.25, 0.82]], 0.07);
  for (let y = fy0 + 1.0; y < fy1 - 0.5; y += 1.2) S.tube([[fx1 - 0.25, y, 0.3], [fx1 - 0.25, y, 0.82]], 0.07);
  const tz = 1.05, wy1 = fy0 + 0.7;
  const tiles = [];
  for (let x = fx0 + 1.25; x < fx1 - 0.01; x += 1.25) tiles.push(line([x, wy1, tz], [x, fy1, tz]));
  for (let y = wy1 + 1.1; y < fy1 - 0.01; y += 1.1) tiles.push(line([fx0, y, tz], [fx1, y, tz]));
  const perf = [];
  for (const i of [2, 3, 4, 5]) for (const j of [3, 4, 5]) perf.push([fx0 + i * 1.25, wy1 + j * 1.1]);
  for (const [px, py] of perf) {
    tiles.push(poly(rectOn('z', tz, px + 0.1, px + 1.15, py + 0.1, py + 1.0), GREY.top, GREY.seam, SW));
    for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) tiles.push(dotEl([px + 0.25 + i * 0.19, py + 0.25 + j * 0.2, tz], 0.04, 'z', GREY.deep));
  }
  S.box(fx0, fy0, 0.82, fx1, fy1, tz, { deco: tiles });
  const wz1 = 8.4, wd = [];
  for (const [a, b] of [[-4.6, -2.7], [-2.1, -0.2], [0.4, 2.3], [2.9, 4.6]]) {
    wd.push(poly(rectOn('y', wy1, a, b, 1.35, 2.45), GREY.right, GREY.edge, SW));
    for (let z = 1.5; z < 2.4; z += 0.14) wd.push(line([a + 0.08, wy1, z], [b - 0.08, wy1, z], GREY.deep, SW));
  }
  for (let x = -3.75; x < 5; x += 1.25) wd.push(line([x, wy1, 2.75], [x, wy1, wz1]));
  wd.push(line([fx0, wy1, 2.75], [fx1, wy1, 2.75]));
  for (let y = fy0 + 0.2; y < wy1; y += 0.2) wd.push(line([fx1, y, tz], [fx1, y, wz1]));
  S.box(fx0, fy0, tz, fx1, wy1, wz1, { deco: wd });
  const cz0 = 7.0, cz1 = 7.26, cy0 = wy1, cy1 = -0.4;
  const xs = [-5, -2.5, 0, 2.5, 5], ys = [cy0, (cy0 + cy1) / 2, cy1];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
    const a = xs[i] + 0.09, b = xs[i + 1] - 0.09, c = ys[j] + 0.09, e = ys[j + 1] - 0.09;
    const red = i === 3 && j === 1, blank = (i === 1 && j === 1) || (i === 2 && j === 0);
    if (blank) { S.box(a, c, cz0, b, e, cz0 + 0.12, { faces: { top: GREY.left } }); continue; }
    const pal = red ? RED : GREY;
    S.box(a + 0.04, c + 0.04, cz0 + 0.02, b - 0.04, e - 0.04, 7.8, {
      pal, deco: [line([a + 0.04, e - 0.04, 7.42], [b - 0.04, e - 0.04, 7.42], pal.seam), line([b - 0.04, c + 0.04, 7.42], [b - 0.04, e - 0.04, 7.42], pal.seam)],
    });
    const mx = (a + b) / 2 - 0.2, my = (c + e) / 2;
    S.tube([[mx, my, 7.8], [mx, my, 8.1]], 0.52, { pal, deco: [dotEl([mx, my, 8.1], 0.14, 'z', pal.right, pal.edge)] });
    S.box(b - 0.65, c + 0.22, 7.8, b - 0.25, c + 0.55, 7.98, { pal });
  }
  for (const x of xs) S.box(x - 0.09, cy0, cz0, x + 0.09, cy1, cz1);
  for (const y of ys) for (let i = 0; i < 4; i++) S.box(xs[i] + 0.09, y - 0.09, cz0, xs[i + 1] - 0.09, y + 0.09, cz1);
  for (const [x, y] of [[-2.5, ys[1]], [2.5, ys[1]], [0, cy1]]) S.tube([[x, y, cz1], [x, y, 9.6]], 0.04);
}

/* 08 Tools Hookup: a process tool on the raised floor, service drops from above, the waffle
   slab cut at the front, and the sub-fab pump its foreline drops to. Red: the foreline. */
function toolsHookup(S) {
  const X0 = -5.2, X1 = 5.2;
  S.box(X0, -5.0, 0, X1, 4.4, 0.3);
  for (const x of [-4.4, 4.2]) S.box(x - 0.35, -0.5, 0.3, x + 0.35, 0.2, 3.8);
  const nx0 = -0.75, nx1 = 0.95, ny0 = -0.75, sy1 = 0.6;
  const waffle = (a, b) => { const q = []; for (let x = a + 0.3; x + 0.6 < b; x += 1.0) q.push(poly(rectOn('y', sy1, x, x + 0.6, 3.95, 4.25), GREY.deep, GREY.edge, SW)); return q; };
  S.box(X0, -5.0, 3.8, nx0, sy1, 4.4, { deco: waffle(X0, nx0) });
  S.box(nx1, -5.0, 3.8, X1, sy1, 4.4, { deco: waffle(nx1, X1) });
  S.box(nx0, -5.0, 3.8, nx1, ny0, 4.4);
  for (let x = X0 + 0.3; x < X1; x += 1.2) { if (x > nx0 - 0.1 && x < nx1 + 0.1) continue; S.tube([[x, sy1 - 0.15, 4.4], [x, sy1 - 0.15, 4.95]], 0.06); }
  const tz = 5.15;
  const grid = (a, b) => { const q = []; for (let x = a + 1.2; x < b; x += 1.2) q.push(line([x, -5.0, tz], [x, sy1, tz])); for (let y = -3.8; y < sy1; y += 1.2) q.push(line([a, y, tz], [b, y, tz])); return q; };
  S.box(X0, -5.0, 4.95, nx0, sy1, tz, { deco: grid(X0, nx0) });
  S.box(nx1, -5.0, 4.95, X1, sy1, tz, { deco: grid(nx1, X1) });
  S.box(nx0, -5.0, 4.95, nx1, ny0, tz);
  const t0 = -4.3, t1 = 1.5, u0 = -4.6, u1 = -1.1, h = 8.3;
  const td = [
    outline(rectOn('y', u1, t0 + 0.2, -1.6, tz + 0.25, h - 0.25)),
    outline(rectOn('y', u1, -1.4, t1 - 0.2, tz + 0.25, h - 0.25)),
    poly(rectOn('y', u1, -1.1, 0.9, 6.8, 7.8), GREY.deep, GREY.edge, SW),
    line([-1.1, u1, 7.3], [0.9, u1, 7.3], GREY.edge, SW),
    outline(rectOn('x', t1, u0 + 0.25, u1 - 0.25, tz + 0.25, h - 0.25)),
  ];
  for (let z = tz + 0.5; z < tz + 1.6; z += 0.16) td.push(line([t1, u0 + 0.5, z], [t1, u1 - 0.5, z]));
  S.box(t0, u0, tz, t1, u1, h, { deco: td });
  S.box(-3.9, u1, 6.35, -2.1, -0.5, 6.5);
  S.box(-3.65, u1 + 0.05, 6.5, -2.35, -0.62, 7.35, { deco: [line([-3.65, -0.62, 7.15], [-2.35, -0.62, 7.15])] });
  S.box(-3.25, u1 + 0.2, 7.35, -2.75, -0.9, 7.48);
  S.tube([[-2.5, -2.9, h], [-2.5, -2.9, h + 0.55]], 1.0, { rings: [0.3] });
  S.tube([[-2.5, -2.9, h + 0.55], [-2.5, -2.9, h + 0.72]], 0.48);
  S.tube([[t1 - 0.3, u1 - 0.3, h], [t1 - 0.3, u1 - 0.3, h + 0.9]], 0.1, { rings: [0.3, 0.6] });
  for (const [x, r] of [[-0.3, 0.13], [0.2, 0.13], [0.7, 0.16]]) {
    S.tube([[x, -3.4, h], [x, -3.4, 10.4]], r, { rings: [0.6] });
    S.collar([x, -3.4, h + 0.45], [x, -3.4, h + 0.6], r + 0.08, r);
  }
  S.tube([[-1.2, -2.0, h], [-1.2, -2.0, 10.4]], 0.34, { rings: [0.5, 1.5] });
  S.box(-1.7, -3.62, 9.7, 1.1, -3.4, 9.92, { layer: 1 });
  const p0 = -1.8, p1 = 2.8, q0 = 1.9, q1 = 4.2, pz = 2.7;
  const pd = [
    outline(rectOn('y', q1, p0 + 0.15, 0.45, 0.45, pz - 0.15)),
    outline(rectOn('y', q1, 0.55, p1 - 0.15, 0.45, pz - 0.15)),
    poly(rectOn('y', q1, 0.2, 0.3, 1.2, 1.8), GREY.deep, GREY.edge, SW),
    poly(rectOn('y', q1, 0.7, 0.8, 1.2, 1.8), GREY.deep, GREY.edge, SW),
    outline(rectOn('x', p1, q0 + 0.2, q1 - 0.2, 0.45, pz - 0.15)),
  ];
  for (let z = 0.65; z < 1.3; z += 0.13) { pd.push(line([p0 + 0.4, q1, z], [0.05, q1, z])); pd.push(line([p1, q0 + 0.45, z], [p1, q1 - 0.45, z])); }
  S.box(p0, q0, 0.3, p1, q1, pz, { deco: pd });
  S.box(1.4, 2.2, pz, 2.4, 2.9, pz + 0.35);
  S.tube([[0.1, 3.05, pz], [0.1, 3.05, pz + 0.12]], 0.42);
  S.pipe([[0.1, u1, 6.1], [0.1, 0.0, 6.1], [0.1, 0.0, 3.45], [0.1, 3.05, 3.45], [0.1, 3.05, pz + 0.12]], 0.26, { pal: RED, bend: 0.42, steps: 12 });
  for (const z of [5.5, 4.75]) S.collar([0.1, 0.0, z - 0.06], [0.1, 0.0, z + 0.06], 0.33, 0.26, { layer: 1 });
}

/* 09 Overall: the finished facility. A production block with roof plant and an exhaust stack,
   an office wing in front with its entrance portal. Red: the entrance portal. */
function overall(S) {
  const a0 = -6.0, a1 = 3.4, b0 = -5.4, b1 = 2.2, H = 5.0;
  const fd = [];
  for (let z = 1; z < H; z += 1) { fd.push(line([a0, b1, z], [a1, b1, z])); fd.push(line([a1, b0, z], [a1, b1, z])); }
  for (let x = a0 + 2.35; x < a1; x += 2.35) fd.push(line([x, b1, 0], [x, b1, H]));
  for (let y = b0 + 2.5; y < b1; y += 2.5) fd.push(line([a1, y, 0], [a1, y, H]));
  fd.push(poly(rectOn('x', a1, -4.4, -2.7, 0, 2.6), GREY.deep, GREY.edge, SW));
  for (let z = 0.3; z < 2.6; z += 0.26) fd.push(line([a1, -4.4, z], [a1, -2.7, z], GREY.right, SW));
  S.box(a0, b0, 0, a1, b1, H, { deco: fd });
  S.box(a1, -4.55, 2.7, a1 + 0.6, -2.55, 2.85);
  const para = (x0, y0, x1, y1, z) => {
    S.box(x0, y0, z, x1, y0 + 0.18, z + 0.32);
    S.box(x0, y0 + 0.18, z, x0 + 0.18, y1 - 0.18, z + 0.32);
    S.box(x1 - 0.18, y0 + 0.18, z, x1, y1 - 0.18, z + 0.32, { layer: 1 });
    S.box(x0, y1 - 0.18, z, x1, y1, z + 0.32, { layer: 1 });
  };
  para(a0, b0, a1, b1, H);
  for (const x of [-5.3, -3.3]) {
    S.box(x, -4.8, H, x + 1.7, -3.1, H + 1.25, {
      deco: [line([x, -3.1, H + 0.45], [x + 1.7, -3.1, H + 0.45]), line([x + 1.7, -4.8, H + 0.45], [x + 1.7, -3.1, H + 0.45])],
    });
    const c = [x + 0.85, -3.95, H + 1.25];
    S.tube([c, add(c, [0, 0, 0.32])], 0.66, {
      capFill: GREY.deep,
      deco: [0, 1, 2, 3].map(k => { const a = (k * PI) / 4; return line([c[0] + 0.62 * Math.cos(a), c[1] + 0.62 * Math.sin(a), c[2] + 0.33], [c[0] - 0.62 * Math.cos(a), c[1] - 0.62 * Math.sin(a), c[2] + 0.33], GREY.edge, SW); }),
    });
  }
  S.box(-5.2, -2.1, H, -1.6, -0.2, H + 0.95, { deco: [line([-3.4, -0.2, H], [-3.4, -0.2, H + 0.95]), line([-1.6, -2.1, H + 0.5], [-1.6, -0.2, H + 0.5])] });
  S.box(-1.6, -1.6, H + 0.2, -0.5, -0.7, H + 0.75);
  S.box(0.9, -4.5, H, 2.5, -2.9, H + 0.8);
  S.tube([[1.7, -3.7, H + 0.8], [1.7, -3.7, 10.3]], 0.42, { rings: [2.2, 4.4] });
  S.tube([[1.7, -3.7, 10.3], [1.7, -3.7, 10.55]], 0.52);
  const w0 = -1.6, w1 = 6.0, v0 = 2.2, v1 = 5.4, wh = 3.4;
  const ex0 = 0.9, ex1 = 4.1, pd = 0.75;
  const wd = [];
  for (const [z0, z1] of [[0.55, 1.35], [2.05, 2.85]]) {
    const runs = z0 < 2 ? [[w0 + 0.3, ex0 - 0.15], [ex1 + 0.15, w1 - 0.3]] : [[w0 + 0.3, w1 - 0.3]];
    for (const [ra, rb] of runs) {
      wd.push(poly(rectOn('y', v1, ra, rb, z0, z1), GREY.deep, GREY.edge, SW));
      for (let x = ra + 0.6; x < rb - 0.05; x += 0.6) wd.push(line([x, v1, z0], [x, v1, z1], GREY.right, SW));
    }
    wd.push(poly(rectOn('x', w1, v0 + 0.3, v1 - 0.3, z0, z1), GREY.deep, GREY.edge, SW));
    for (let y = v0 + 0.9; y < v1 - 0.3; y += 0.6) wd.push(line([w1, y, z0], [w1, y, z1], GREY.right, SW));
  }
  wd.push(poly(rectOn('y', v1, ex0 + 0.35, ex1 - 0.35, 0.12, 1.9), GREY.deep, GREY.edge, SW));
  wd.push(line([(ex0 + ex1) / 2, v1, 0.12], [(ex0 + ex1) / 2, v1, 1.9], GREY.right, SW), line([ex0 + 0.35, v1, 1.55], [ex1 - 0.35, v1, 1.55], GREY.right, SW));
  S.box(w0, v0, 0, w1, v1, wh, { deco: wd });
  para(w0, v0, w1, v1, wh);
  S.box(ex0 + 0.1, v1, 0, ex1 - 0.1, v1 + pd + 0.35, 0.12);
  S.box(ex0, v1, 0.12, ex0 + 0.24, v1 + pd, 2.3, { pal: RED });
  S.box(ex1 - 0.24, v1, 0.12, ex1, v1 + pd, 2.3, { pal: RED });
  S.box(ex0, v1, 2.3, ex1, v1 + pd, 2.62, { pal: RED });
}

const SET = [
  ['civil-structural', 'Civil & Structural', civil],
  ['architectural', 'Architectural', architectural],
  ['process-utilities', 'Process Utilities', processUtilities],
  ['fire-protection', 'Fire Protection', fireProtection],
  ['air-conditioning', 'Air-conditioning', airConditioning],
  ['electrical', 'HT & LV Electrical', electrical],
  ['cleanroom', 'Cleanroom System', cleanroom],
  ['tools-hookup', 'Tools Hookup', toolsHookup],
  ['overall', 'Overall', overall],
];
const built = SET.map(([slug, title, fn]) => { const S = new Scene(slug); fn(S); const els = elsOf(S); return { slug, title, els, bb: bboxOf(els) }; });
const PAD = 14;
const W = Math.ceil(Math.max(...built.map(b => b.bb[2] - b.bb[0])) + PAD * 2);
const H = Math.ceil(Math.max(...built.map(b => b.bb[3] - b.bb[1])) + PAD * 2);
if (W !== FRAME.W || H !== FRAME.H) console.warn('the nine now need', W, H, 'but the family frame is', FRAME.W, FRAME.H);
writeSet(OUT, built, { W, H });
console.log('viewBox', W, H);
