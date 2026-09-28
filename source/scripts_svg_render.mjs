/* Rasterises a self-contained SVG to PNG in pure Node, so icons can be judged at the sizes they
   actually ship at without a browser. Covers the subset this icon system uses: path/polygon/rect/
   circle/ellipse/line, groups with transforms, userSpaceOnUse and objectBoundingBox linear and
   radial gradients, clipPaths, fill/stroke with opacity, and nonzero/evenodd winding.

   Usage:  node scripts_svg_render.mjs <in.svg> <out.png> [size] [bg] [gutter] [...more.svg]
           node scripts_svg_render.mjs --sheet out.png 26,44,96 '#F7F9FC' a.svg b.svg c.svg   */
import fs from 'fs'
import { pathToFileURL } from 'url'
import zlib from 'zlib'

/* ------------------------------------------------------------------ XML */
function parseXML (src) {
  const root = { tag: '#root', attr: {}, kids: [] }
  const stack = [root]
  const re = /<\s*(\/)?\s*([A-Za-z_][\w:.-]*)((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/)?\s*>|<!--[\s\S]*?-->/g
  let m
  while ((m = re.exec(src))) {
    if (m[0].startsWith('<!--')) continue
    const [, close, tag, attrs, selfClose] = m
    if (close) { if (stack.length > 1) stack.pop(); continue }
    const attr = {}
    const ar = /([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g
    let a
    while ((a = ar.exec(attrs || ''))) attr[a[1]] = a[2] !== undefined ? a[2] : a[3]
    const node = { tag, attr, kids: [] }
    stack[stack.length - 1].kids.push(node)
    if (!selfClose) stack.push(node)
  }
  return root
}

/* --------------------------------------------------------------- colour */
const NAMED = { none: null, white: [255, 255, 255], black: [0, 0, 0], red: [255, 0, 0],
                currentColor: [0, 0, 0], transparent: null }
function colour (s) {
  if (s == null) return undefined
  s = String(s).trim()
  if (s === '' ) return undefined
  if (s in NAMED) return NAMED[s]
  if (s.startsWith('#')) {
    let h = s.slice(1)
    if (h.length === 3) h = h.split('').map(c => c + c).join('')
    if (h.length === 8) h = h.slice(0, 6)
    const v = parseInt(h, 16)
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
  }
  let m = s.match(/^rgba?\(([^)]+)\)$/)
  if (m) { const p = m[1].split(/[,\s/]+/).map(Number); return [p[0], p[1], p[2]] }
  return [0, 0, 0]
}

/* ------------------------------------------------------------ transform */
const I = [1, 0, 0, 1, 0, 0]
const mul = (a, b) => [
  a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
  a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
  a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]]
const apply = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]
function parseTransform (s) {
  let m = I
  if (!s) return m
  const re = /(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g
  let t
  while ((t = re.exec(s))) {
    const p = t[2].trim().split(/[\s,]+/).map(Number)
    let n = I
    if (t[1] === 'matrix') n = p
    else if (t[1] === 'translate') n = [1, 0, 0, 1, p[0] || 0, p[1] || 0]
    else if (t[1] === 'scale') n = [p[0], 0, 0, p.length > 1 ? p[1] : p[0], 0, 0]
    else if (t[1] === 'rotate') {
      const r = (p[0] || 0) * Math.PI / 180, c = Math.cos(r), s2 = Math.sin(r)
      n = [c, s2, -s2, c, 0, 0]
      if (p.length > 2) n = mul(mul([1, 0, 0, 1, p[1], p[2]], n), [1, 0, 0, 1, -p[1], -p[2]])
    } else if (t[1] === 'skewX') n = [1, 0, Math.tan((p[0] || 0) * Math.PI / 180), 1, 0, 0]
    else if (t[1] === 'skewY') n = [1, Math.tan((p[0] || 0) * Math.PI / 180), 0, 1, 0, 0]
    m = mul(m, n)
  }
  return m
}

/* ------------------------------------------------------------ path data */
function flattenPath (d) {
  const subs = []
  let cur = null, x = 0, y = 0, sx = 0, sy = 0, px = 0, py = 0, prev = ''
  const nums = []
  const re = /([MmLlHhVvCcSsQqTtAaZz])|(-?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?)/g
  const toks = []
  let t
  while ((t = re.exec(d))) toks.push(t[1] || parseFloat(t[2]))
  let i = 0
  const open = () => { cur = [[x, y]]; subs.push(cur) }
  const bez = (x1, y1, x2, y2, x3, y3) => {
    const n = 18
    for (let k = 1; k <= n; k++) {
      const u = k / n, v = 1 - u
      cur.push([v * v * v * x + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x3,
                v * v * v * y + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y3])
    }
    px = x2; py = y2; x = x3; y = y3
  }
  while (i < toks.length) {
    let c = toks[i]
    if (typeof c === 'string') { prev = c; i++ } else c = prev === 'M' ? 'L' : prev === 'm' ? 'l' : prev
    const rel = c === c.toLowerCase()
    const n = () => toks[i++]
    switch (c.toUpperCase()) {
      case 'M': { const a = n(), b = n(); x = rel ? x + a : a; y = rel ? y + b : b; sx = x; sy = y; open(); break }
      case 'L': { const a = n(), b = n(); x = rel ? x + a : a; y = rel ? y + b : b; cur && cur.push([x, y]); break }
      case 'H': { const a = n(); x = rel ? x + a : a; cur && cur.push([x, y]); break }
      case 'V': { const a = n(); y = rel ? y + a : a; cur && cur.push([x, y]); break }
      case 'C': { const a = n(), b = n(), c2 = n(), d2 = n(), e = n(), f = n()
        bez(rel ? x + a : a, rel ? y + b : b, rel ? x + c2 : c2, rel ? y + d2 : d2, rel ? x + e : e, rel ? y + f : f); break }
      case 'S': { const c2 = n(), d2 = n(), e = n(), f = n()
        const rx = 2 * x - px, ry = 2 * y - py
        bez(rx, ry, rel ? x + c2 : c2, rel ? y + d2 : d2, rel ? x + e : e, rel ? y + f : f); break }
      case 'Q': { const a = n(), b = n(), e = n(), f = n()
        const qx = rel ? x + a : a, qy = rel ? y + b : b, ex = rel ? x + e : e, ey = rel ? y + f : f
        bez(x + 2 / 3 * (qx - x), y + 2 / 3 * (qy - y), ex + 2 / 3 * (qx - ex), ey + 2 / 3 * (qy - ey), ex, ey); break }
      case 'A': { const rx = n(), ry = n(), rot = n(), laf = n(), sf = n(), e = n(), f = n()
        const ex = rel ? x + e : e, ey = rel ? y + f : f
        arc(cur, x, y, rx, ry, rot, laf, sf, ex, ey); x = ex; y = ey; break }
      case 'Z': { if (cur) { cur.push([sx, sy]); cur.closed = true } x = sx; y = sy; break }
      default: i++
    }
  }
  return subs
}
function arc (cur, x1, y1, rx, ry, rot, laf, sf, x2, y2) {
  if (!cur || !rx || !ry) { cur && cur.push([x2, y2]); return }
  const p = rot * Math.PI / 180, cp = Math.cos(p), sp = Math.sin(p)
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2
  const x1p = cp * dx + sp * dy, y1p = -sp * dx + cp * dy
  rx = Math.abs(rx); ry = Math.abs(ry)
  let l = x1p * x1p / (rx * rx) + y1p * y1p / (ry * ry)
  if (l > 1) { const s = Math.sqrt(l); rx *= s; ry *= s }
  let num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p
  let co = Math.sqrt(Math.max(0, num / den)); if (laf === sf) co = -co
  const cxp = co * rx * y1p / ry, cyp = -co * ry * x1p / rx
  const cx = cp * cxp - sp * cyp + (x1 + x2) / 2, cy = sp * cxp + cp * cyp + (y1 + y2) / 2
  const ang = (ux, uy, vx, vy) => { const s = Math.sign(ux * vy - uy * vx) || 1
    return s * Math.acos(Math.max(-1, Math.min(1, (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy))))) }
  const t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry)
  let dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry)
  if (!sf && dt > 0) dt -= 2 * Math.PI; else if (sf && dt < 0) dt += 2 * Math.PI
  const n = Math.max(6, Math.ceil(Math.abs(dt) / 0.2))
  for (let k = 1; k <= n; k++) { const th = t1 + dt * k / n
    cur.push([cp * rx * Math.cos(th) - sp * ry * Math.sin(th) + cx,
              sp * rx * Math.cos(th) + cp * ry * Math.sin(th) + cy]) }
}
const ellipsePts = (cx, cy, rx, ry) => { const p = []
  for (let k = 0; k <= 72; k++) { const a = k / 72 * Math.PI * 2; p.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]) }
  p.closed = true; return p }
function rectPts (x, y, w, h, rx, ry) {
  rx = rx || ry || 0; ry = ry || rx || 0
  rx = Math.min(rx, w / 2); ry = Math.min(ry, h / 2)
  if (!rx && !ry) { const p = [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]]; p.closed = true; return p }
  const p = [], k = 12
  const corner = (cx, cy, a0) => { for (let j = 0; j <= k; j++) { const a = a0 + j / k * Math.PI / 2
    p.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]) } }
  corner(x + w - rx, y + ry, -Math.PI / 2); corner(x + w - rx, y + h - ry, 0)
  corner(x + rx, y + h - ry, Math.PI / 2); corner(x + rx, y + ry, Math.PI)
  p.closed = true; return p
}

/* ------------------------------------------------------------ stroking */
function strokePolys (subs, w) {
  const out = [], h = w / 2
  for (const sp of subs) {
    const pts = sp.filter((p, i) => i === 0 || Math.hypot(p[0] - sp[i - 1][0], p[1] - sp[i - 1][1]) > 1e-9)
    for (let i = 0; i + 1 < pts.length; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]
      const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1
      const nx = -dy / L * h, ny = dx / L * h
      const q = [[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]]
      q.closed = true; out.push(q)
    }
    /* joins and caps as discs: cheap, and at icon sizes indistinguishable from a real miter */
    for (let i = 0; i < pts.length; i++) {
      const c = ellipsePts(pts[i][0], pts[i][1], h, h); out.push(c)
    }
  }
  return out
}

/* ---------------------------------------------------------- rasteriser */
export function renderSVG (src, outW, bg) {
  const root = parseXML(src)
  const svg = (function find (n) { if (n.tag === 'svg') return n
    for (const k of n.kids) { const r = find(k); if (r) return r } return null })(root)
  if (!svg) throw new Error('no <svg>')
  const vb = (svg.attr.viewBox || '0 0 96 96').trim().split(/[\s,]+/).map(Number)
  const [vx, vy, vw, vh] = vb
  const outH = Math.round(outW * vh / vw)
  const SS = outW < 120 ? 6 : 3                      /* supersample harder when the target is tiny */
  const W = outW * SS, H = outH * SS
  const acc = new Float64Array(W * H * 3)
  const bgc = colour(bg) || [255, 255, 255]
  for (let i = 0; i < W * H; i++) { acc[i * 3] = bgc[0]; acc[i * 3 + 1] = bgc[1]; acc[i * 3 + 2] = bgc[2] }
  const base = [W / vw, 0, 0, H / vh, -vx * W / vw, -vy * H / vh]

  const grads = {}, clips = {}
  ;(function scan (n) { for (const k of n.kids) {
    if ((k.tag === 'linearGradient' || k.tag === 'radialGradient') && k.attr.id) grads[k.attr.id] = k
    if (k.tag === 'clipPath' && k.attr.id) clips[k.attr.id] = k
    scan(k) } })(svg)

  function stops (g) {
    let s = g.kids.filter(k => k.tag === 'stop')
    if (!s.length && g.attr['xlink:href']) { const h = grads[g.attr['xlink:href'].slice(1)]; if (h) s = h.kids.filter(k => k.tag === 'stop') }
    return s.map(k => ({ o: parseFloat(k.attr.offset ?? 0),
      c: colour(k.attr['stop-color'] || (k.attr.style || '').match(/stop-color:\s*([^;]+)/)?.[1]) || [0, 0, 0],
      a: parseFloat(k.attr['stop-opacity'] ?? (k.attr.style || '').match(/stop-opacity:\s*([\d.]+)/)?.[1] ?? 1) })).sort((a, b) => a.o - b.o)
  }
  function gradAt (g, S, t, bbox, m) {
    const uso = (g.attr.gradientUnits || 'objectBoundingBox') === 'userSpaceOnUse'
    const gm = mul(m, parseTransform(g.attr.gradientTransform))
    let p0, p1, rad = 0, c0
    if (g.tag === 'linearGradient') {
      const x1 = parseFloat(g.attr.x1 ?? 0), y1 = parseFloat(g.attr.y1 ?? 0)
      const x2 = parseFloat(g.attr.x2 ?? 1), y2 = parseFloat(g.attr.y2 ?? 0)
      p0 = uso ? [x1, y1] : [bbox[0] + x1 * bbox[2], bbox[1] + y1 * bbox[3]]
      p1 = uso ? [x2, y2] : [bbox[0] + x2 * bbox[2], bbox[1] + y2 * bbox[3]]
      p0 = apply(gm, p0[0], p0[1]); p1 = apply(gm, p1[0], p1[1])
    } else {
      const cx = parseFloat(g.attr.cx ?? .5), cy = parseFloat(g.attr.cy ?? .5), r = parseFloat(g.attr.r ?? .5)
      c0 = uso ? [cx, cy] : [bbox[0] + cx * bbox[2], bbox[1] + cy * bbox[3]]
      rad = uso ? r : r * Math.max(bbox[2], bbox[3])
      const e = apply(gm, c0[0] + rad, c0[1]); c0 = apply(gm, c0[0], c0[1])
      rad = Math.hypot(e[0] - c0[0], e[1] - c0[1]) || 1
    }
    return (x, y) => {
      let u
      if (g.tag === 'linearGradient') {
        const dx = p1[0] - p0[0], dy = p1[1] - p0[1], dd = dx * dx + dy * dy
        u = dd ? ((x - p0[0]) * dx + (y - p0[1]) * dy) / dd : 0
      } else u = Math.hypot(x - c0[0], y - c0[1]) / rad
      u = Math.max(0, Math.min(1, u))
      if (!S.length) return [[0, 0, 0], 1]
      if (u <= S[0].o) return [S[0].c, S[0].a]
      for (let k = 1; k < S.length; k++) if (u <= S[k].o) {
        const a = S[k - 1], b = S[k], f = b.o === a.o ? 0 : (u - a.o) / (b.o - a.o)
        return [[a.c[0] + (b.c[0] - a.c[0]) * f, a.c[1] + (b.c[1] - a.c[1]) * f, a.c[2] + (b.c[2] - a.c[2]) * f],
                a.a + (b.a - a.a) * f]
      }
      return [S[S.length - 1].c, S[S.length - 1].a]
    }
  }

  function fillPolys (polys, paint, alpha, evenodd, clipPolys) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9
    for (const p of polys) for (const q of p) {
      if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0]
      if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1] }
    if (x1 < 0 || y1 < 0 || x0 > W || y0 > H) return
    const iy0 = Math.max(0, Math.floor(y0)), iy1 = Math.min(H - 1, Math.ceil(y1))
    const ix0 = Math.max(0, Math.floor(x0)), ix1 = Math.min(W - 1, Math.ceil(x1))
    const wind = (px, py, ps) => { let w = 0
      for (const p of ps) for (let i = 0; i + 1 < p.length; i++) {
        const [ax, ay] = p[i], [bx, by] = p[i + 1]
        if (ay <= py) { if (by > py && (bx - ax) * (py - ay) - (px - ax) * (by - ay) > 0) w++ }
        else if (by <= py && (bx - ax) * (py - ay) - (px - ax) * (by - ay) < 0) w--
      }
      /* close any unclosed subpath implicitly, which is what fill does */
      for (const p of ps) { const a = p[p.length - 1], b = p[0]
        if (a[0] !== b[0] || a[1] !== b[1]) {
          if (a[1] <= py) { if (b[1] > py && (b[0] - a[0]) * (py - a[1]) - (px - a[0]) * (b[1] - a[1]) > 0) w++ }
          else if (b[1] <= py && (b[0] - a[0]) * (py - a[1]) - (px - a[0]) * (b[1] - a[1]) < 0) w--
        } }
      return w }
    for (let y = iy0; y <= iy1; y++) for (let x = ix0; x <= ix1; x++) {
      const cx = x + .5, cy = y + .5
      const w = wind(cx, cy, polys)
      const inside = evenodd ? (w % 2 !== 0) : (w !== 0)
      if (!inside) continue
      if (clipPolys && !(wind(cx, cy, clipPolys) !== 0)) continue
      const [c, ga] = typeof paint === 'function' ? paint(cx, cy) : [paint, 1]
      const a = alpha * ga
      if (a <= 0) continue
      const o = (y * W + x) * 3
      acc[o] += (c[0] - acc[o]) * a
      acc[o + 1] += (c[1] - acc[o + 1]) * a
      acc[o + 2] += (c[2] - acc[o + 2]) * a
    }
  }

  function shapePolys (n) {
    const a = n.attr
    const f = v => parseFloat(v ?? 0)
    if (n.tag === 'path') return flattenPath(a.d || '')
    if (n.tag === 'polygon' || n.tag === 'polyline') {
      const p = (a.points || '').trim().split(/[\s,]+/).map(Number)
      const s = []; for (let i = 0; i + 1 < p.length; i += 2) s.push([p[i], p[i + 1]])
      if (n.tag === 'polygon' && s.length) { s.push(s[0]); s.closed = true }
      return [s]
    }
    if (n.tag === 'rect') return [rectPts(f(a.x), f(a.y), f(a.width), f(a.height), f(a.rx), f(a.ry))]
    if (n.tag === 'circle') return [ellipsePts(f(a.cx), f(a.cy), f(a.r), f(a.r))]
    if (n.tag === 'ellipse') return [ellipsePts(f(a.cx), f(a.cy), f(a.rx), f(a.ry))]
    if (n.tag === 'line') { const s = [[f(a.x1), f(a.y1)], [f(a.x2), f(a.y2)]]; return [s] }
    return null
  }
  const xf = (subs, m) => subs.map(sp => { const o = sp.map(p => apply(m, p[0], p[1])); o.closed = sp.closed; return o })

  function clipFor (id, m) {
    const cp = clips[id]; if (!cp) return null
    let out = []
    for (const k of cp.kids) { const s = shapePolys(k); if (s) out = out.concat(xf(s, mul(m, parseTransform(k.attr.transform)))) }
    return out.length ? out : null
  }

  function walk (n, m, inh) {
    for (const k of n.kids) {
      if (k.tag === 'defs' || k.tag === 'linearGradient' || k.tag === 'radialGradient' || k.tag === 'clipPath') continue
      const a = k.attr
      const style = {}
      ;(a.style || '').split(';').forEach(d => { const i = d.indexOf(':'); if (i > 0) style[d.slice(0, i).trim()] = d.slice(i + 1).trim() })
      const get = key => style[key] !== undefined ? style[key] : a[key]
      const m2 = mul(m, parseTransform(a.transform))
      const cur = {
        fill: get('fill') !== undefined ? get('fill') : inh.fill,
        stroke: get('stroke') !== undefined ? get('stroke') : inh.stroke,
        sw: get('stroke-width') !== undefined ? parseFloat(get('stroke-width')) : inh.sw,
        fo: get('fill-opacity') !== undefined ? parseFloat(get('fill-opacity')) : inh.fo,
        so: get('stroke-opacity') !== undefined ? parseFloat(get('stroke-opacity')) : inh.so,
        op: (get('opacity') !== undefined ? parseFloat(get('opacity')) : 1) * inh.op,
        rule: get('fill-rule') || inh.rule,
        clip: a['clip-path'] ? (a['clip-path'].match(/#([\w:.-]+)/) || [])[1] : inh.clip,
      }
      const clipPolys = cur.clip ? clipFor(cur.clip, m2) : null
      const subs = shapePolys(k)
      if (subs) {
        const dev = xf(subs, m2)
        let bbox = [0, 0, 1, 1]
        { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9
          for (const p of subs) for (const q of p) { x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]) }
          bbox = [x0, y0, Math.max(1e-6, x1 - x0), Math.max(1e-6, y1 - y0)] }
        const fs = cur.fill === undefined ? '#000' : cur.fill
        if (fs && fs !== 'none') {
          const gid = (String(fs).match(/url\(#([\w:.-]+)\)/) || [])[1]
          const paint = gid && grads[gid] ? gradAt(grads[gid], stops(grads[gid]), 0, bbox, m2) : colour(fs)
          if (paint) fillPolys(dev, paint, cur.fo * cur.op, cur.rule === 'evenodd', clipPolys)
        }
        if (cur.stroke && cur.stroke !== 'none' && cur.sw > 0) {
          const sc = Math.sqrt(Math.abs(m2[0] * m2[3] - m2[1] * m2[2])) || 1
          const gid = (String(cur.stroke).match(/url\(#([\w:.-]+)\)/) || [])[1]
          const paint = gid && grads[gid] ? gradAt(grads[gid], stops(grads[gid]), 0, bbox, m2) : colour(cur.stroke)
          if (paint) for (const q of strokePolys(dev, cur.sw * sc)) fillPolys([q], paint, cur.so * cur.op, false, clipPolys)
        }
      }
      if (k.kids.length) walk(k, m2, cur)
    }
  }
  /* Presentation attributes on the ROOT <svg> inherit into its children. Ignoring them made every
     `fill="none" stroke="..."` line icon render as a solid black blob, which looks like a broken
     icon rather than a broken renderer. */
  const rootStyle = {}
  ;(svg.attr.style || '').split(';').forEach(d => { const i = d.indexOf(':')
    if (i > 0) rootStyle[d.slice(0, i).trim()] = d.slice(i + 1).trim() })
  const rget = k => rootStyle[k] !== undefined ? rootStyle[k] : svg.attr[k]
  walk(svg, base, {
    fill: rget('fill'),
    stroke: rget('stroke') || 'none',
    sw: rget('stroke-width') !== undefined ? parseFloat(rget('stroke-width')) : 1,
    fo: rget('fill-opacity') !== undefined ? parseFloat(rget('fill-opacity')) : 1,
    so: rget('stroke-opacity') !== undefined ? parseFloat(rget('stroke-opacity')) : 1,
    op: 1, rule: rget('fill-rule') || 'nonzero', clip: null,
  })

  /* downsample */
  const out = Buffer.alloc(outW * outH * 3)
  for (let y = 0; y < outH; y++) for (let x = 0; x < outW; x++) {
    let r = 0, g = 0, b = 0
    for (let j = 0; j < SS; j++) for (let i = 0; i < SS; i++) {
      const o = ((y * SS + j) * W + (x * SS + i)) * 3
      r += acc[o]; g += acc[o + 1]; b += acc[o + 2] }
    const n = SS * SS, o = (y * outW + x) * 3
    out[o] = Math.round(r / n); out[o + 1] = Math.round(g / n); out[o + 2] = Math.round(b / n)
  }
  return { buf: out, w: outW, h: outH }
}

/* -------------------------------------------------------------- PNG out */
const crcT = (() => { const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) { let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    t[n] = c } return t })()
const crc = b => { let c = -1; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0 }
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const cc = Buffer.alloc(4); cc.writeUInt32BE(crc(td)); return Buffer.concat([len, td, cc]) }
export function writePNG (path, buf, W, H) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4)
  ihdr[8] = 8; ihdr[9] = 2
  const raw = Buffer.alloc(H * (W * 3 + 1))
  for (let y = 0; y < H; y++) { raw[y * (W * 3 + 1)] = 0
    buf.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3) }
  fs.writeFileSync(path, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]))
}

/* --------------------------------------------------------------- sheet */
export function contactSheet (files, sizes, bg, gut = 26, label = true) {
  const bgc = colour(bg) || [247, 249, 252]
  const cols = files.map(f => {
    const src = fs.readFileSync(f, 'utf8')
    return sizes.map(s => renderSVG(src, s, bg))
  })
  const rowH = sizes.map((s, i) => Math.max(...cols.map(c => c[i].h)))
  const colW = cols.map(c => Math.max(...c.map(r => r.w)))
  const W = colW.reduce((a, b) => a + b + gut, gut)
  const H = rowH.reduce((a, b) => a + b + gut, gut)
  const buf = Buffer.alloc(W * H * 3)
  for (let i = 0; i < W * H; i++) { buf[i * 3] = bgc[0]; buf[i * 3 + 1] = bgc[1]; buf[i * 3 + 2] = bgc[2] }
  let y = gut
  for (let r = 0; r < sizes.length; r++) {
    let x = gut
    for (let c = 0; c < cols.length; c++) {
      const im = cols[c][r]
      const oy = y + Math.round((rowH[r] - im.h) / 2), ox = x + Math.round((colW[c] - im.w) / 2)
      for (let j = 0; j < im.h; j++) im.buf.copy(buf, ((oy + j) * W + ox) * 3, j * im.w * 3, (j + 1) * im.w * 3)
      x += colW[c] + gut
    }
    y += rowH[r] + gut
  }
  return { buf, w: W, h: H }
}

/* ---------------------------------------------------------------- main */
/* the project path contains spaces, which import.meta.url percent-encodes and argv does not,
   so compare resolved file URLs rather than a raw string */
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const av = process.argv.slice(2)
  if (av[0] === '--sheet') {
    const out = av[1], sizes = av[2].split(',').map(Number), bg = av[3], files = av.slice(4)
    const s = contactSheet(files, sizes, bg)
    writePNG(out, s.buf, s.w, s.h)
    console.log('wrote', out, s.w + 'x' + s.h, '|', files.length, 'marks at', sizes.join('/') + 'px')
  } else {
    const [inf, out, size = '96', bg = '#F7F9FC'] = av
    const im = renderSVG(fs.readFileSync(inf, 'utf8'), Number(size), bg)
    writePNG(out, im.buf, im.w, im.h)
    console.log('wrote', out, im.w + 'x' + im.h)
  }
}
