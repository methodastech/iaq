/* 29 Sep 2026. The isometric drawing engine shared by build-iso9.mjs (the nine disciplines) and
   build-iso6.mjs (the six services). True 30 degree isometric: x runs down right, y runs down left, z is up.
   House rules it enforces: three tones per solid (top #FFFFFF, left #E6E8EB, right #C9CDD3, recess #A9AFB8),
   edges #8E96A1 at 0.75 px non scaling, seams #A9AFB8 at 0.5 px, one part per object in IAQ red #EC2326
   (lit top one step lighter, shade face one step deeper), no ground patch, shadow, gradient, glow or text.
   Solids paint back to front by a topological sort on their world boxes. A moving part is a group with a class
   (screen space, or plane-local through planeMatrix) that the object's own CSS animates. */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const U = 16;                        // screen units per world unit
const CO = Math.cos(Math.PI / 6);
const PI = Math.PI;
const EW = 0.75;                     // edge weight, CSS px
const SW = 0.5;                      // seam weight, CSS px

const GREY = { top: '#FFFFFF', left: '#E6E8EB', right: '#C9CDD3', deep: '#A9AFB8', edge: '#8E96A1', seam: '#A9AFB8' };
const RED = { top: '#F2484B', left: '#EC2326', right: '#C9161B', deep: '#A31015', edge: '#A8141A', seam: '#B8121A' };

/* ---------- vectors and projection ---------- */
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = a => Math.hypot(a[0], a[1], a[2]);
const norm = a => { const l = len(a); return l > 1e-12 ? mul(a, 1 / l) : a; };
const VIEW = norm([1, 1, 1]);
/* K is a per-object world scale (1 for the nine); line weights never scale because every stroke is non scaling */
let K = 1;
const setScale = k => { K = k; };
/* 29 Sep, night: an optional projection override, used ONLY to draw the Design tab's Don't plates (a dimetric and a
   perspective view of the same object, build-iso-simple.mjs). null (the default) is true isometric; the nine and the
   six never set it. fn(p, s) takes a world point and the screen scale U*K and returns [x, y]. */
let PROJ = null;
const setProjection = fn => { PROJ = fn; };
const P = p => (PROJ ? PROJ(p, U * K) : [(p[0] - p[1]) * CO * U * K, ((p[0] + p[1]) * 0.5 - p[2]) * U * K]);

/* tone of a face from its outward normal: top, left (+y) or right (+x) */
function tone(n, pal) {
  const [x, y, z] = n;
  if (z >= x - 1e-9 && z >= y - 1e-9) return pal.top;
  if (y >= x - 1e-9) return pal.left;
  return pal.right;
}

/* ---------- elements ---------- */
const poly = (pts3, fill, stroke = null, sw = EW, extra = {}) => ({ pts: pts3.map(P), fill, stroke, sw, ...extra });
const line = (a, b, stroke = GREY.seam, sw = SW) => ({ pts: [P(a), P(b)], open: true, fill: 'none', stroke, sw });
const pline = (pts3, stroke = GREY.seam, sw = SW) => ({ pts: pts3.map(P), open: true, fill: 'none', stroke, sw });
function circ(c, r, axis, n = 40) {
  const out = [];
  for (let k = 0; k < n; k++) {
    const t = (2 * PI * k) / n, a = r * Math.cos(t), b = r * Math.sin(t);
    out.push(axis === 'z' ? [c[0] + a, c[1] + b, c[2]] : axis === 'x' ? [c[0], c[1] + a, c[2] + b] : [c[0] + a, c[1], c[2] + b]);
  }
  return out;
}
/* a small round detail (bolt head, lamp, rivet) lying on a face */
const dotEl = (c, r, axis, fill = GREY.deep, stroke = null) => poly(circ(c, r, axis, 14), fill, stroke, SW);
/* a rectangle lying on a face: axis is the face normal, (u0,u1) and (w0,w1) the in-plane ranges */
function rectOn(axis, a, u0, u1, w0, w1) {
  if (axis === 'y') return [[u0, a, w0], [u1, a, w0], [u1, a, w1], [u0, a, w1]];
  if (axis === 'x') return [[a, u0, w0], [a, u1, w0], [a, u1, w1], [a, u0, w1]];
  return [[u0, w0, a], [u1, w0, a], [u1, w1, a], [u0, w1, a]];
}
const outline = (pts3, stroke = GREY.seam, sw = SW) => ({ pts: pts3.map(P), fill: 'none', stroke, sw });

function roundPath(pts, R, steps = 10) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const A = pts[i - 1], B = pts[i], C = pts[i + 1];
    const d1 = norm(sub(B, A)), d2 = norm(sub(C, B));
    const th = Math.acos(Math.max(-1, Math.min(1, dot(d1, d2))));
    if (th < 1e-4) { out.push(B); continue; }
    const t = R * Math.tan(th / 2);
    const S0 = sub(B, mul(d1, t));
    const nr = norm(sub(d2, mul(d1, dot(d1, d2))));
    const O = add(S0, mul(nr, R));
    for (let k = 0; k <= steps; k++) {
      const ph = (th * k) / steps;
      out.push(add(O, add(mul(nr, -R * Math.cos(ph)), mul(d1, R * Math.sin(ph)))));
    }
  }
  out.push(pts[pts.length - 1]);
  return out.filter((p, i, a) => i === 0 || len(sub(p, a[i - 1])) > 1e-6);
}

/* ---------- scene ---------- */
class Scene {
  constructor(name) { this.name = name; this.prims = []; this.clips = []; }
  prim(bb, els, o = {}) { const p = { bb, els, i: this.prims.length, layer: o.layer || 0 }; this.prims.push(p); return p; }

  box(x0, y0, z0, x1, y1, z1, o = {}) {
    const pal = o.pal || GREY, f = o.faces || {}, sw = o.sw ?? EW, st = o.edge ?? pal.edge;
    const els = [];
    if (f.left !== false) els.push(poly([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], f.left || pal.left, st, sw));
    if (f.right !== false) els.push(poly([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], f.right || pal.right, st, sw));
    if (f.top !== false) els.push(poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], f.top || pal.top, st, sw));
    if (o.deco) els.push(...(typeof o.deco === 'function' ? o.deco() : o.deco));
    return this.prim([x0, y0, z0, x1, y1, z1], els, o);
  }

  /* a round solid along any polyline: pipes, piles, cables, flanges, rings. Two tone bands
     per straight run, split on the axis, with the face tone the band's normal picks. */
  tube(path, r, o = {}) {
    const pal = o.pal || GREY, st = o.edge ?? pal.edge, sw = o.sw ?? EW;
    const pts = o.bend ? roundPath(path, o.bend, o.steps || 10) : path;
    const closed = !!o.closed, n = pts.length, segN = closed ? n : n - 1;
    const parts = [];
    for (let i = 0; i < segN; i++) {
      const A = pts[i], B = pts[(i + 1) % n];
      const d = norm(sub(B, A)), e = norm(cross(d, VIEW)), f = norm(sub(VIEW, mul(d, dot(VIEW, d))));
      const first = !closed && i === 0 && !o.openStart, last = !closed && i === segN - 1 && !o.openEnd;
      const ext = r * 0.3;
      const A2 = first ? A : sub(A, mul(d, ext)), B2 = last ? B : add(B, mul(d, ext));
      const at = (C, t) => add(C, add(mul(e, r * Math.cos(t)), mul(f, r * Math.sin(t))));
      const arc = (C, t0, t1, k) => { const q = []; for (let j = 0; j <= k; j++) q.push(at(C, t0 + ((t1 - t0) * j) / k)); return q; };
      const ends = (C, t0, t1, isArc) => (isArc ? arc(C, t0, t1, 9) : [at(C, t0), at(C, t1)]);
      const band = (t0, t1) => { const a = ends(A2, t0, t1, first), b = ends(B2, t0, t1, last); return [...a, ...b.reverse()]; };
      const els = [
        poly(band(0, PI / 2), tone(norm(add(e, f)), pal)),
        poly(band(PI / 2, PI), tone(norm(add(mul(e, -1), f)), pal)),
        line(at(A2, 0), at(B2, 0), st, sw),
        line(at(A2, PI), at(B2, PI), st, sw),
      ];
      if (first) els.push(pline(arc(A, 0, PI, 18), st, sw));
      if (last) els.push(pline(arc(B, 0, PI, 18), st, sw));
      if (o.rings && segN === 1) for (const s of o.rings) els.push(pline(arc(add(A, mul(d, s)), 0, PI, 24), o.ringColor || pal.seam, SW));
      parts.push({ depth: dot(add(A, B), VIEW), els });
    }
    parts.sort((a, b) => a.depth - b.depth);
    const els = parts.flatMap(p => p.els);
    if (!closed) {
      const cap = (c, nrm) => {
        const u = norm(Math.abs(nrm[2]) < 0.9 ? cross(nrm, [0, 0, 1]) : cross(nrm, [1, 0, 0])), w = cross(nrm, u);
        const q = []; for (let k = 0; k < 36; k++) { const t = (2 * PI * k) / 36; q.push(add(c, add(mul(u, r * Math.cos(t)), mul(w, r * Math.sin(t))))); }
        return poly(q, (o.capFill) || tone(nrm, pal), st, sw);
      };
      const d0 = norm(sub(pts[1], pts[0])), d1 = norm(sub(pts[n - 1], pts[n - 2]));
      if (dot(mul(d0, -1), VIEW) > 1e-6 && o.startCap !== false && !o.openStart) els.push(cap(pts[0], mul(d0, -1)));
      if (dot(d1, VIEW) > 1e-6 && o.endCap !== false && !o.openEnd) els.push(cap(pts[n - 1], d1));
    }
    if (o.deco) els.push(...(typeof o.deco === 'function' ? o.deco() : o.deco));
    // world box: each run grows by r only across its own axis, so a tube's flat ends are exact
    const bb = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9];
    for (let i = 0; i < segN; i++) {
      const A = pts[i], B = pts[(i + 1) % n], d = norm(sub(B, A));
      for (let k = 0; k < 3; k++) {
        const ex = r * Math.sqrt(Math.max(0, 1 - d[k] * d[k]));
        bb[k] = Math.min(bb[k], A[k] - ex, B[k] - ex); bb[k + 3] = Math.max(bb[k + 3], A[k] + ex, B[k] + ex);
      }
    }
    return this.prim(bb, els, o);
  }

  /* a bent run split into one piece per segment, so each piece sorts on its own tight box */
  pipe(path, r, o = {}) {
    const pts = o.bend ? roundPath(path, o.bend, o.steps || 10) : path;
    for (let i = 0; i < pts.length - 1; i++) {
      this.tube([pts[i], pts[i + 1]], r, { ...o, bend: 0, openStart: i > 0, openEnd: i < pts.length - 2 });
    }
  }

  /* a collar round a pipe that carries on through it (coupling, clamp, weld ring): the band,
     and on the visible end only the half annulus the pipe beyond does not cover */
  collar(a, b, R, r, o = {}) {
    const pal = o.pal || GREY;
    const d = norm(sub(b, a)), plusEnd = dot(d, VIEW) > 0 ? b : a, dn = dot(d, VIEW) > 0 ? d : mul(d, -1);
    const e = norm(cross(dn, VIEW)), f = norm(sub(VIEW, mul(dn, dot(VIEW, dn))));
    const at = (C, rr, t) => add(C, add(mul(e, rr * Math.cos(t)), mul(f, rr * Math.sin(t))));
    const outer = [], inner = [];
    for (let k = 0; k <= 24; k++) { const t = (PI * k) / 24; outer.push(at(plusEnd, R, t)); inner.push(at(plusEnd, r, PI - t)); }
    const ann = poly([...outer, ...inner], tone(dn, pal), pal.edge, SW);
    return this.tube([a, b], R, { ...o, startCap: false, endCap: false, deco: [ann] });
  }

  /* a straight extrusion of a convex 2D profile along one axis */
  prism(axis, poly2, a0, a1, o = {}) {
    const pal = o.pal || GREY, st = o.edge ?? pal.edge, sw = o.sw ?? EW;
    const to3 = (u, w, a) => (axis === 'x' ? [a, u, w] : axis === 'y' ? [u, a, w] : [u, w, a]);
    let area = 0;
    for (let i = 0; i < poly2.length; i++) { const p = poly2[i], q = poly2[(i + 1) % poly2.length]; area += p[0] * q[1] - q[0] * p[1]; }
    const els = [];
    for (let i = 0; i < poly2.length; i++) {
      const p = poly2[i], q = poly2[(i + 1) % poly2.length];
      let nu = q[1] - p[1], nw = -(q[0] - p[0]);
      if (area < 0) { nu = -nu; nw = -nw; }
      const n3 = axis === 'x' ? [0, nu, nw] : axis === 'y' ? [nu, 0, nw] : [nu, nw, 0];
      if (n3[0] + n3[1] + n3[2] <= 1e-9) continue;
      els.push(poly([to3(p[0], p[1], a0), to3(q[0], q[1], a0), to3(q[0], q[1], a1), to3(p[0], p[1], a1)], tone(n3, pal), st, sw));
    }
    const capT = axis === 'x' ? pal.right : axis === 'y' ? pal.left : pal.top;
    els.push(poly(poly2.map(([u, w]) => to3(u, w, a1)), o.cap || capT, st, sw));
    if (o.deco) els.push(...(typeof o.deco === 'function' ? o.deco() : o.deco));
    const pts = poly2.flatMap(([u, w]) => [to3(u, w, a0), to3(u, w, a1)]);
    const bb = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9];
    for (const p of pts) for (let k = 0; k < 3; k++) { bb[k] = Math.min(bb[k], p[k]); bb[k + 3] = Math.max(bb[k + 3], p[k]); }
    return this.prim(bb, els, o);
  }

  /* a bar between two points lying in a plane normal to `axis`, as a thin prism */
  bar(axis, p, q, w, a0, a1, o = {}) {
    const du = q[0] - p[0], dw = q[1] - p[1], l = Math.hypot(du, dw), nu = (-dw / l) * (w / 2), nw = (du / l) * (w / 2);
    return this.prism(axis, [[p[0] + nu, p[1] + nw], [q[0] + nu, q[1] + nw], [q[0] - nu, q[1] - nw], [p[0] - nu, p[1] - nw]], a0, a1, o);
  }

  flat(pts3, fill, o = {}) {
    const el = poly(pts3, fill, o.edge ?? GREY.edge, o.sw ?? EW, o.fop != null ? { fop: o.fop } : {});
    const bb = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9];
    for (const p of pts3) for (let k = 0; k < 3; k++) { bb[k] = Math.min(bb[k], p[k]); bb[k + 3] = Math.max(bb[k + 3], p[k]); }
    return this.prim(bb, [el, ...(o.deco || [])], o);
  }

  group(bb, els, o = {}) { return this.prim(bb, els, o); }

  /* a moving part: its elements sit in one class group so the object's CSS can move them together */
  moving(bb, children, o = {}) { return this.prim(bb, [{ grp: true, cls: o.cls || 'mv', matrix: o.matrix, origin: o.origin, children }], o); }

  /* painter's order: a topological sort on world boxes whose screen hexagons overlap. An edge
     from a clean separation along x, y or z (or an explicit layer) is strong; two parts that
     interpenetrate fall back to the order they were placed in, as a weak edge that gives way
     first if it would close a cycle. */
  order() {
    const ps = this.prims, n = ps.length, eps = 1e-6, sep = 0.012;
    const rg = b => [[b[0] - b[4], b[3] - b[1]], [b[1] - b[5], b[4] - b[2]], [b[0] - b[5], b[3] - b[2]]];
    const R = ps.map(p => rg(p.bb));
    const ov = (a, b) => a[0] < b[1] - eps && b[0] < a[1] - eps;
    const behind = (a, b) => a[3] <= b[0] + sep || a[4] <= b[1] + sep || a[5] <= b[2] + sep;
    const adj = Array.from({ length: n }, () => []), inS = new Array(n).fill(0), inW = new Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      if (!(ov(R[i][0], R[j][0]) && ov(R[i][1], R[j][1]) && ov(R[i][2], R[j][2]))) continue;
      const A = ps[i], B = ps[j];
      let a = i, b = j, strong = true;
      if (A.layer !== B.layer) { if (A.layer > B.layer) { a = j; b = i; } }
      else {
        const ab = behind(A.bb, B.bb), ba = behind(B.bb, A.bb);
        if (ba && !ab) { a = j; b = i; } else if (!(ab && !ba)) strong = false;
      }
      adj[a].push([b, strong]); if (strong) inS[b]++; else inW[b]++;
    }
    const done = new Array(n).fill(false), out = [];
    while (out.length < n) {
      let pick = -1;
      for (let i = 0; i < n; i++) if (!done[i] && inS[i] === 0 && inW[i] === 0) { pick = i; break; }
      if (pick < 0) for (let i = 0; i < n; i++) if (!done[i] && inS[i] === 0) { pick = i; break; }
      if (pick < 0) {
        for (let i = 0; i < n; i++) if (!done[i]) { pick = i; break; }
        if (process.env.ISO_DEBUG) console.log('strong cycle', this.name, pick, ps[pick].bb.map(v => +v.toFixed(2)).join(','));
      }
      done[pick] = true; out.push(ps[pick]);
      for (const [b, st] of adj[pick]) { if (st) inS[b]--; else inW[b]--; }
    }
    return out;
  }
}

/* ---------- serialise ---------- */
const f2 = v => { const r = Math.round(v * 10) / 10; return (Object.is(r, -0) ? 0 : r).toString(); };
/* paint styles become short classes in the file's own style block */
let CLS = new Map();
const clsOf = el => {
  const k = `fill:${el.fill || 'none'}` + (el.fop != null ? `;fill-opacity:${el.fop}` : '') + (el.stroke ? `;stroke:${el.stroke};stroke-width:${el.sw}px` : '');
  if (!CLS.has(k)) { let i = CLS.size, n = ''; do { n = String.fromCharCode(97 + (i % 26)) + n; i = Math.floor(i / 26) - 1; } while (i >= 0); CLS.set(k, n); }
  return CLS.get(k);
};
const f3 = v => { const r = Math.round(v * 1000) / 1000; return (Object.is(r, -0) ? 0 : r).toString(); };
function ser(el, dx, dy, fx = f2) {
  if (el.grp) {
    if (el.matrix) {
      const [a, b, c, d, e, f] = el.matrix;
      const inner = el.children.map(ch => ser(ch, 0, 0, f3)).join('');
      return `<g transform="matrix(${[a, b, c, d, e + dx, f + dy].map(f3).join(' ')})"><g class="${el.cls}">${inner}</g></g>`;
    }
    const st = el.origin ? ` style="transform-origin:${f2(el.origin[0] + dx)}px ${f2(el.origin[1] + dy)}px"` : '';
    return `<g class="${el.cls}"${st}>${el.children.map(ch => ser(ch, dx, dy)).join('')}</g>`;
  }
  if (el.clip) {
    const d = 'M' + el.clip.map(p => f2(p[0] + dx) + ' ' + f2(p[1] + dy)).join('L') + 'Z';
    return `<clipPath id="${el.id}"><path d="${d}"/></clipPath><g clip-path="url(#${el.id})">${el.children.map(c => ser(c, dx, dy)).join('')}</g>`;
  }
  const q = el.pts.map(p => fx(p[0] + dx) + ' ' + fx(p[1] + dy)).filter((v, i, a) => i === 0 || v !== a[i - 1]);
  const d = 'M' + q.join('L') + (el.open ? '' : 'Z');
  return `<path class="${clsOf(el)}" d="${d}"/>`;
}
function elsOf(scene) { return scene.order().flatMap(p => p.els); }
function bboxOf(els) {
  const b = [1e9, 1e9, -1e9, -1e9];
  const grow = p => { b[0] = Math.min(b[0], p[0]); b[1] = Math.min(b[1], p[1]); b[2] = Math.max(b[2], p[0]); b[3] = Math.max(b[3], p[1]); };
  const walk = e => {
    if (e.grp) {
      if (e.matrix) { const [a, bb, c, d, ee, f] = e.matrix; e.children.forEach(ch => ch.pts.forEach(([u, v]) => grow([a * u + c * v + ee, bb * u + d * v + f]))); }
      else e.children.forEach(walk);
      return;
    }
    if (e.clip) { e.clip.forEach(p => { b[0] = Math.min(b[0], p[0]); b[1] = Math.min(b[1], p[1]); b[2] = Math.max(b[2], p[0]); b[3] = Math.max(b[3], p[1]); }); return; }
    for (const p of e.pts) { b[0] = Math.min(b[0], p[0]); b[1] = Math.min(b[1], p[1]); b[2] = Math.max(b[2], p[0]); b[3] = Math.max(b[3], p[1]); } };
  els.forEach(walk);
  return b;
}

/* ---------- moving parts ---------- */
/* matrix taking plane-local (u, v) in world units to screen, for a part that turns inside one face plane:
   'y' = the x-z plane (u = x, v = z), 'x' = the y-z plane (u = y, v = z), 'z' = the x-y plane (u = x, v = y) */
function planeMatrix(axis, o) {
  const [e, f] = P(o), u = U * K;
  if (axis === 'y') return [CO * u, 0.5 * u, 0, -u, e, f];
  if (axis === 'x') return [-CO * u, 0.5 * u, 0, -u, e, f];
  return [CO * u, 0.5 * u, -CO * u, 0.5 * u, e, f];
}
/* a flat shape in plane-local units (for use inside a plane matrix group) */
const poly2 = (pts2, fill, stroke = null, sw = EW) => ({ pts: pts2.map(p => [p[0], p[1]]), fill, stroke, sw });
const line2 = (a, b, stroke, sw = SW) => ({ pts: [a, b], open: true, fill: 'none', stroke, sw });
function circ2(c, r, n = 32, a0 = 0, a1 = 2 * PI) { const q = []; const full = a1 - a0 >= 2 * PI - 1e-9; const m = full ? n : n + 1; for (let k = 0; k < m; k++) { const t = a0 + ((a1 - a0) * k) / n; q.push([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)]); } return q; }

/* ---------- write a set ---------- */
const FRAME = { W: 321, H: 315 };          // the viewBox every object in the family shares
const BASE_CSS = 'path{vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round}';
function writeSet(outDir, items, frame = FRAME) {
  const { W, H } = frame;
  for (const b of items) {
    const dx = W / 2 - (b.bb[0] + b.bb[2]) / 2, dy = H / 2 - (b.bb[1] + b.bb[3]) / 2;
    CLS = new Map();
    const body = b.els.map(e => ser(e, dx, dy)).join('');
    const style = '<style>' + BASE_CSS + [...CLS].map(([k, n]) => `.${n}{${k}}`).join('') + (b.css || '') + '</style>';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${b.title.replace('&', '&amp;')}">${style}${body}</svg>\n`;
    writeFileSync(join(outDir, `${b.slug}.svg`), svg);
    console.log(b.slug.padEnd(18), 'w', Math.round(b.bb[2] - b.bb[0]), 'h', Math.round(b.bb[3] - b.bb[1]), 'optical', Math.round(Math.sqrt((b.bb[2] - b.bb[0]) * (b.bb[3] - b.bb[1]))), 'kb', (svg.length / 1024).toFixed(1));
  }
}

export {
  U, CO, PI, EW, SW, GREY, RED, add, sub, mul, dot, cross, len, norm, VIEW, P, tone, setScale, setProjection,
  poly, line, pline, circ, dotEl, rectOn, outline, roundPath, Scene, elsOf, bboxOf,
  planeMatrix, poly2, line2, circ2, FRAME, writeSet,
};
