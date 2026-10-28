#!/usr/bin/env node
/* 29 Sep 2026, night. The SIMPLE level of the six service objects: the same object as build-iso6.mjs reduced to its
   main volumes, for icon use at 32 to 64 px (navigation, chips, small cards). Same engine, projection and three tone
   greys, one IAQ red part, no box or disc round it, transparent ground. Tuned for small sizes: a 64 unit square frame,
   every edge 1 px (non scaling, so it stays one pixel at 32, 48 and 64), no seams or small print that would close up.
   Each carries the same loop as its detailed twin (iso-loops.mjs) at a small travel, and a still twin for navigation,
   chips and prefers-reduced-motion.
   Also writes the Design tab's Don't plates, drawn for real from the simple Procure object (guide/dont-*.svg): the
   same crate in dimetric and in perspective, with a second accent and red on two parts, with a keyline round it,
   and with gradients and a glow.
   Run: node public/design/iso/build-iso-simple.mjs */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  U, CO, PI, GREY, RED, add, sub, mul, dot, cross, norm, P, setScale, setProjection,
  poly, line, circ, rectOn, outline, Scene, elsOf, bboxOf, planeMatrix, poly2, circ2, writeSet,
} from './iso-engine.mjs';
import { LOOPS, run, translate, rotate, RM } from './iso-loops.mjs';

const OUT = dirname(fileURLToPath(import.meta.url));
const GUIDE = join(OUT, 'guide');
mkdirSync(GUIDE, { recursive: true });
const FR = { W: 64, H: 64 };          // the simple set's frame
const OPT = 46, MAXS = 58;             // optical size (square root of width times height) and the longest side, frame units
const E1 = 1;                          // edge weight, CSS px
const o = (x = {}) => ({ sw: E1, ...x });

function worldBox(T) {
  const b = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9];
  for (const p of T.prims) for (let k = 0; k < 3; k++) { b[k] = Math.min(b[k], p.bb[k]); b[k + 3] = Math.max(b[k + 3], p.bb[k + 3]); }
  return b;
}
function holed(outer3, inner3, fill, edge) {
  const inr = inner3.slice().reverse();
  return [{ pts: [...outer3, outer3[0], ...inr, inr[0]].map(P), fill, stroke: null, sw: 0 }, outline(outer3, edge, E1), outline(inner3, edge, E1)];
}

/* ------------------------------------------------------------------ Design: the plan chest, its sheet and rule, the red set square */
function design(S, k) {
  S.box(-4.6, -3.2, 0, 4.6, 3.2, 3.3, o({ deco: [line([-4.6, 3.2, 1.1], [4.6, 3.2, 1.1], GREY.edge, E1), line([-4.6, 3.2, 2.2], [4.6, 3.2, 2.2], GREY.edge, E1)] }));
  S.box(-4.8, -3.4, 3.3, 4.8, 3.4, 3.7, o());
  S.box(-3.9, -2.1, 3.7, 2.8, 2.9, 3.78, o());
  S.box(-4.6, -2.95, 3.7, 4.6, -2.35, 3.88, o());
  const q0 = 3.78, q1 = 3.9;
  const A = [-3.4, -2.35], B = [-0.2, -2.35], C = [-3.4, 0.85];
  const a = B[0] - A[0], b = C[1] - A[1], c = Math.hypot(a, b), r = (a + b - c) / 2, I = [A[0] + r, A[1] + r];
  const inner = [A, B, C].map(V => [I[0] + (V[0] - I[0]) * 0.36, I[1] + (V[1] - I[1]) * 0.36]);
  const sq = [
    poly([[B[0], B[1], q0], [C[0], C[1], q0], [C[0], C[1], q1], [B[0], B[1], q1]], RED.right, RED.edge, E1),
    ...holed([A, B, C].map(([x, y]) => [x, y, q1]), inner.map(([x, y]) => [x, y, q1]), RED.left, RED.edge),
  ];
  S.moving([A[0], A[1], q0, B[0], C[1], q1], sq, { cls: 'mv' });
  const d = 2.0 * U * k;
  S.css = run('mv', 'slide', LOOPS.design, translate(d * CO, d * 0.5)) + RM;
}

/* ------------------------------------------------------------------ Procure: the fork mast, the crated load on its pallet, the red strap */
function procureParts(S, pal = {}) {
  const P1 = pal.mast || GREY, P2 = pal.pallet || GREY, P3 = pal.strap || RED;
  S.box(-1.2, -1.8, 0, -0.75, -1.35, 6.4, o({ pal: P1 }));
  S.box(-1.2, 1.35, 0, -0.75, 1.8, 6.4, o({ pal: P1 }));
  S.box(-1.2, -1.35, 5.95, -0.75, 1.35, 6.4, o({ pal: P1 }));
  const T = new Scene('load');
  T.box(-0.75, -1.5, 0.35, -0.45, 1.5, 2.6, o());
  for (const x of [0, 1.9, 3.8]) T.box(x, -2, 0.3, x + 0.45, 2, 0.65, o({ pal: P2 }));
  T.box(0, -2, 0.65, 4.25, 2, 0.95, o({ pal: P2 }));
  T.box(0.1, -1.9, 0.95, 4.15, 1.9, 4.5, o());
  T.box(1.9, -1.95, 4.5, 2.35, 1.97, 4.58, o({ pal: P3 }));
  T.box(1.9, 1.9, 0.95, 2.35, 1.97, 4.5, o({ pal: P3 }));
  return T;
}
function procure(S, k) {
  const T = procureParts(S);
  S.moving(worldBox(T), elsOf(T), { cls: 'mv' });
  S.css = run('mv', 'lift', LOOPS.procure, translate(0, -0.7 * U * k)) + RM;
}

/* ------------------------------------------------------------------ Construct: a two level bay, the crane's mast and jib, the red beam on the hook */
function construct(S, k) {
  const H = 4.6;
  for (const x of [0, 4]) for (const y of [0, 3]) S.box(x - 0.2, y - 0.2, 0, x + 0.2, y + 0.2, H, o());
  for (const z of [2.1, H - 0.4]) {
    S.box(0.2, -0.17, z, 3.8, 0.17, z + 0.4, o());
    for (const x of [0, 4]) S.box(x - 0.17, 0.2, z, x + 0.17, 2.8, z + 0.4, o());
    if (z < 3) S.box(0.2, 2.83, z, 3.8, 3.17, z + 0.4, o());
  }
  const my = 3, JZ = 8.9;
  S.box(-2.9, my - 0.3, 0, -2.3, my + 0.3, JZ, o());
  S.box(-4.3, my - 0.4, JZ - 0.9, -3.5, my + 0.4, JZ, o());
  S.box(-4.3, my - 0.2, JZ, 5.2, my + 0.2, JZ + 0.4, o());
  // the falls, and the hook with the red beam on its slings
  const hx = 2, BZ = 5.8, HZ = BZ + 1.6, drop = 0.75;
  S.moving([hx - 0.05, my - 0.05, HZ + 0.3, hx + 0.05, my + 0.05, JZ], [line([hx, my, JZ], [hx, my, HZ + 0.3], GREY.edge, E1)], { cls: 'mv2', origin: P([hx, my, JZ]) });
  const T = new Scene('hook');
  T.box(hx - 0.22, my - 0.22, HZ, hx + 0.22, my + 0.22, HZ + 0.3, o());
  T.group([0.6, my - 0.02, BZ + 0.4, 3.4, my + 0.02, HZ], [line([hx, my, HZ], [0.7, my, BZ + 0.4], GREY.edge, E1), line([hx, my, HZ], [3.3, my, BZ + 0.4], GREY.edge, E1)]);
  T.box(0.2, my - 0.17, BZ, 3.8, my + 0.17, BZ + 0.4, o({ pal: RED }));
  S.moving(worldBox(T), elsOf(T), { cls: 'mv' });
  const D = drop * U * k, L = (JZ - HZ - 0.3) * U * k;
  S.css = run('mv', 'lower', LOOPS.construct, translate(0, D)) + run('mv2', 'payout', LOOPS.construct, a => `scaleY(${(1 + (a * D) / L).toFixed(4)})`) + RM;
}

/* ------------------------------------------------------------------ Commission: the panel and its gauge, the red needle */
function commission(S, k) {
  S.box(-0.1, -1.3, 0, 3.7, 0.7, 0.4, o());
  S.box(0, -1.2, 0.4, 3.6, 0.6, 5.7, o({ deco: [poly(rectOn('y', 0.6, 0.7, 2.9, 1.0, 1.5), GREY.deep, GREY.edge, E1)] }));
  S.box(-0.08, -1.28, 5.7, 3.68, 0.68, 5.9, o());
  const g = [1.8, 3.55], gy = 0.9, gr = 1.2;
  S.tube([[g[0], 0.6, g[1]], [g[0], gy, g[1]]], gr, o({ capFill: '#FFFFFF' }));
  const needle = [
    poly2([[-0.13, -0.02], [0.13, -0.02], [0.035, 0.98], [-0.035, 0.98]], RED.left, RED.edge, E1),
    poly2(circ2([0, 0], 0.2, 20), RED.top, RED.edge, E1),
  ];
  S.moving([g[0] - 1, gy + 0.005, g[1] - 1, g[0] + 1, gy + 0.01, g[1] + 1], needle, { cls: 'mv', matrix: planeMatrix('y', [g[0], gy + 0.008, g[1]]) });
  const rd = f => (-(-135 + 270 * f)).toFixed(1);
  S.still = `.mv{transform:rotate(${rd(0.62)}deg)}`;
  S.css = S.still + run('mv', 'settle', LOOPS.commission, f => `rotate(${rd(f)}deg)`) + RM;
}

/* ------------------------------------------------------------------ Maintain: the pump set on its skid, the red spanner on the discharge flange */
function maintain(S, k) {
  S.box(-4.4, -1.5, 0, 3.0, 1.5, 0.6, o());
  S.box(-3.8, -0.8, 0.6, -1.5, 0.8, 1.0, o());
  const mz = 1.95;
  S.tube([[-4.2, 0, mz], [-1.3, 0, mz]], 0.95, o());
  S.tube([[-1.3, 0, mz], [-0.35, 0, mz]], 0.32, o());
  S.box(-0.35, -0.6, 0.6, 1.3, 0.6, 1.0, o());
  S.tube([[-0.35, 0, mz], [1.0, 0, mz]], 1.1, o());
  S.tube([[1.0, 0, mz], [2.1, 0, mz]], 0.45, o());
  S.tube([[2.1, 0, mz], [2.35, 0, mz]], 0.72, o());
  const fz = 3.95, fc = [0.3, 0];
  S.tube([[fc[0], fc[1], 2.9], [fc[0], fc[1], fz - 0.22]], 0.45, o());
  S.tube([[fc[0], fc[1], fz - 0.22], [fc[0], fc[1], fz]], 0.78, o());
  // spanner: ring on a nut at the front of the flange, handle out to the front left
  const R1 = 0.3, w0 = 0.15, w1 = 0.13, jx = 2.3, R2 = 0.36, ang = PI / 2 - 0.25;
  const pts = [];
  const a0 = Math.asin(w0 / R1);
  for (let i = 0; i <= 20; i++) { const t = a0 + ((2 * PI - 2 * a0) * i) / 20; pts.push([R1 * Math.cos(t), R1 * Math.sin(t)]); }
  const b1 = Math.asin(w1 / R2);
  pts.push([jx - R2 * Math.cos(b1), -w1]);
  for (let i = 1; i <= 8; i++) { const t = PI + b1 + ((PI - b1 - 0.6) * i) / 8; pts.push([jx + R2 * Math.cos(t), R2 * Math.sin(t)]); }
  pts.push([jx + 0.04, -0.14], [jx + 0.04, 0.14]);
  for (let i = 0; i <= 8; i++) { const t = 0.6 + ((PI - b1 - 0.6) * i) / 8; pts.push([jx + R2 * Math.cos(t), R2 * Math.sin(t)]); }
  pts.push([jx - R2 * Math.cos(b1), w1]);
  const hole = circ2([0, 0], 0.15, 6);
  const rot = ([u, v]) => [u * Math.cos(ang) - v * Math.sin(ang), u * Math.sin(ang) + v * Math.cos(ang)];
  const O = pts.map(rot), Hh = hole.map(rot);
  const top = [
    { pts: [...O, O[0], ...Hh.slice().reverse(), Hh[Hh.length - 1]], fill: RED.left, stroke: null, sw: 0 },
    { pts: [...O, O[0]], open: true, fill: 'none', stroke: RED.edge, sw: E1 },
    { pts: [...Hh, Hh[0]], open: true, fill: 'none', stroke: RED.edge, sw: E1 },
  ];
  const side = [{ pts: [...O, O[0]], fill: RED.right, stroke: RED.edge, sw: E1 }];
  const nut = [fc[0], fc[1] + 0.55], sz = fz + 0.12;
  const bb = [nut[0] - 0.4, nut[1] - 0.4, sz - 0.1, nut[0] + 0.6, nut[1] + 2.6, sz];
  S.moving(bb, side, { cls: 'mv', matrix: planeMatrix('z', [nut[0], nut[1], sz - 0.1]), layer: 1 });
  S.moving(bb, top, { cls: 'mv', matrix: planeMatrix('z', [nut[0], nut[1], sz]), layer: 2 });
  S.css = run('mv', 'rock', LOOPS.maintain, rotate(-18)) + RM;
}

/* ------------------------------------------------------------------ Hookup: the tool on the raised floor, the cabinet below, the red process line */
function hookup(S, k) {
  S.box(-4, -3, 0, 4, 3.4, 0.3, o());
  for (const x of [-3.6, 3.0]) S.box(x, -0.7, 0.3, x + 0.6, -0.1, 3.2, o());
  S.box(-4, -3, 3.2, 0.2, 0.6, 3.6, o());
  S.box(1.8, -3, 3.2, 4, 0.6, 3.6, o());
  S.box(0.2, -3, 3.2, 1.8, -0.5, 3.6, o());
  S.box(-3.4, -2.8, 3.6, 2.6, -1.0, 6.4, o());
  S.box(0, 1.2, 0.3, 2.6, 3.2, 2.4, o());
  const px = 1.0, pz = 5.2, r = 0.3;
  S.tube([[px, -1.0, pz], [px, -0.92, pz]], 0.45, o({ pal: RED }));
  const T = new Scene('spool');
  T.tube([[px, -0.92, pz], [px, -0.84, pz]], 0.45, o({ pal: RED }));
  T.tube([[px, -0.84, pz], [px, -0.5, pz]], r, o({ pal: RED }));
  T.tube([[px, -0.5, pz], [px, -0.42, pz]], 0.45, o({ pal: RED }));
  S.moving(worldBox(T), elsOf(T), { cls: 'mv' });
  S.tube([[px, -0.42, pz], [px, -0.34, pz]], 0.45, o({ pal: RED }));
  S.pipe([[px, -0.34, pz], [px, 0.1, pz], [px, 0.1, 2.95], [px, 2.2, 2.95], [px, 2.2, 2.4]], r, o({ pal: RED, bend: 0.5, steps: 10 }));
  S.css = run('mv', 'seat', LOOPS.hookup, translate(0, -0.45 * U * k)) + RM;
}

/* ------------------------------------------------------------------ build: fit each to the frame, write the moving file and its still */
const SET = [
  ['design', 'Design', design], ['procure', 'Procure', procure], ['construct', 'Construct', construct],
  ['commission', 'Commission', commission], ['maintain', 'Maintain', maintain], ['hookup', 'Hookup', hookup],
];
function make(fn, k) { setScale(k); const S = new Scene('s'); fn(S, k); const els = elsOf(S); setScale(1); return { S, els, bb: bboxOf(els) }; }
/* one optical size for the set, so a wide flat object and a tall narrow one read at the same weight in a row */
function fitK(fn) { const { bb } = make(fn, 1); const w = bb[2] - bb[0], h = bb[3] - bb[1]; return Math.min(OPT / Math.sqrt(w * h), MAXS / Math.max(w, h)); }
const built = SET.map(([slug, title, fn]) => {
  const k = fitK(fn);
  const { S, els, bb } = make(fn, k);
  return { slug: `svc-${slug}-simple`, title: `${title}, simple`, els, bb, css: S.css || '', still: S.still || '' };
});
writeSet(OUT, built, FR);
writeSet(OUT, built.map(b => ({ ...b, slug: b.slug + '-still', css: b.still })), FR);

/* ------------------------------------------------------------------ the Don't plates, drawn for real */
function still(fn2, slug, title) {
  const k = fitK(S => fn2(S));
  setScale(k); const S = new Scene(slug); fn2(S); const els = elsOf(S); setScale(1);
  writeSet(GUIDE, [{ slug, title, els, bb: bboxOf(els), css: '' }], FR);
}
const procureStill = (S, pal) => { const T = procureParts(S, pal); S.moving(worldBox(T), elsOf(T), { cls: 'mv' }); };
// a dimetric view: x at 7 degrees, y at 42 degrees and foreshortened by half
const c7 = Math.cos((7 * PI) / 180), s7 = Math.sin((7 * PI) / 180), c42 = Math.cos((42 * PI) / 180), s42 = Math.sin((42 * PI) / 180);
setProjection((p, s) => [(p[0] * c7 - p[1] * 0.5 * c42) * s, (p[0] * s7 + p[1] * 0.5 * s42 - p[2] * 0.94) * s]);
still(S => procureStill(S), 'dont-dimetric', 'Dimetric, not isometric');
// a three point perspective from close in, above and to the front
const cam = [13.5, 12, 11], aim = [1.6, 0, 2.4];
const fw = norm(sub(aim, cam)), rt = norm(cross(fw, [0, 0, 1])), up = cross(rt, fw);
setProjection((p, s) => { const d = sub(p, cam), z = dot(d, fw); const F = 17 / z; return [dot(d, rt) * F * s, -dot(d, up) * F * s]; });
still(S => procureStill(S), 'dont-perspective', 'Perspective, not isometric');
setProjection(null);
// a second accent (a safety yellow mast) and red on two parts (the pallet as well as the strap)
const YEL = { top: '#FFE27A', left: '#F5C400', right: '#D4A700', deep: '#A88400', edge: '#9C7C00', seam: '#B08D00' };
still(S => procureStill(S, { mast: YEL, pallet: RED }), 'dont-accents', 'A second accent, and red on two parts');
// the correct one, for the Do plates beside them
still(S => procureStill(S), 'do-procure', 'Procure, simple');
// a keyline round the silhouette, and gradients with a glow: the same drawing, post-processed as a designer would
const base = readFileSync(join(GUIDE, 'do-procure.svg'), 'utf8');
const wrap = (svg, defs, gAttr, extraCss = '') => svg.replace(/(<\/style>)/, `${extraCss}$1<defs>${defs}</defs><g ${gAttr}>`).replace(/<\/svg>\s*$/, '</g></svg>\n');
writeFileSync(join(GUIDE, 'dont-keyline.svg'), wrap(base.replace('aria-label="Procure, simple"', 'aria-label="A keyline round the silhouette"'),
  '<filter id="kl" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius="1.6" result="d"/><feFlood flood-color="#231F20"/><feComposite in2="d" operator="in" result="k"/><feMerge><feMergeNode in="k"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
  'filter="url(#kl)"'));
const grad = base.replace('aria-label="Procure, simple"', 'aria-label="Gradients and a glow"')
  .replace(/fill:#FFFFFF/g, 'fill:url(#gt)').replace(/fill:#E6E8EB/g, 'fill:url(#gl)').replace(/fill:#C9CDD3/g, 'fill:url(#gr)')
  .replace(/fill:#EC2326/g, 'fill:url(#rr);filter:url(#gw)').replace(/fill:#F2484B/g, 'fill:url(#rr);filter:url(#gw)');
writeFileSync(join(GUIDE, 'dont-glow.svg'), wrap(grad,
  '<linearGradient id="gt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C7D3F2"/></linearGradient>' +
  '<linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F6FA"/><stop offset="1" stop-color="#9AA6BF"/></linearGradient>' +
  '<linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D6DCE8"/><stop offset="1" stop-color="#6E7A93"/></linearGradient>' +
  '<linearGradient id="rr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF7A7E"/><stop offset="1" stop-color="#B8121A"/></linearGradient>' +
  '<filter id="gw" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
  '<filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="2.4" flood-color="#2536F5" flood-opacity=".35"/></filter>',
  'filter="url(#sh)"'));
console.log('guide plates written to', GUIDE);
