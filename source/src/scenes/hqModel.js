import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/* ============================================================================
   Contact map · IAQ's own building (30 Sep 2026).

   Bazil: "make the building more accurate and special for IAQ, have the actual building".

   A low poly model of the head office as it stands in the photographs (public/assets/iaq/hq-exterior-01,
   hq-exterior-02, hq-front-4595, hq-aerial-0001, hq-aerial-0007, hq-aerial-hero), fitted to the OSM
   footprint in hq-district.json. The rest of the district stays white clay; this is the one building
   in its real materials: green tinted glass, timber brown fins, white and grey render, dark grey slabs.

   Plan, in metres, in a frame taken from the footprint (u along the street, left to right as seen from
   the road; v from the front wall back into the lot):
     · main block, u 11.8 to 22.4: three storeys of glazing with staggered timber fins, the glass
       wrapping the right corner, a dark granite step, a glass canopy over the entrance, a grey fascia
       and the thin dark roof slab, a railing, the plant box, the mast and the dish
     · stair core, u 8 to 11.8: white render with a column of small windows
     · second block, u 0.4 to 8: narrower, set back, glazed on the upper floors, its own two slabs
     · roller shutter annex in the right notch of the footprint, the warehouse behind (v 16 back),
       white walls, grey metal gable roof, shutters on the driveway side
     · forecourt paving, carport, boundary wall, guardhouse, three flagpoles, and the gate sign with
       the real IAQ wordmark file (iaq-logo-mark.webp) composited onto the dark band
   What is inferred: the split of the footprint between office, annex and warehouse, and all heights
   (read off the photographs at about 4 m a storey). The photographs show No. 9 on the gate sign; the
   site's address is No. 12. No number is drawn.
   ============================================================================ */

const C = {
  white: 0xF0F1F3, render: 0xC6CAD0, band: 0xA7ADB4, fascia: 0xB9BEC4, slab: 0x4A4F57, lslab: 0xC2C7CD,
  timber: 0x7C4A33, mull: 0x3B4A47, deck: 0xAEB3B9, canopy: 0x5B626A, plinth: 0x2C2F33, pave: 0xBDBBB6, apron: 0xDCE1E9,
  roof: 0x99A0A8, carport: 0xC3C7CC, ridge: 0xB9BFC6, clad: 0xB3B8BE, shutter: 0xD3D6DA, rail: 0x5E636A, pole: 0xE8EAED,
  ac: 0xE6E8EB, plaque: 0xFFFFFF, signband: 0x464B52, signcap: 0x8F959C, yellow: 0xD9B64B, port: 0xD6D9DD,
}

/* the footprint edge that faces the street: its outward normal points at the nearest access road */
function frameFor(ring, roads){
  let s = 0; for (let i = 0; i < ring.length; i++) { const a = ring[i], b = ring[(i + 1) % ring.length]; s += a[0] * b[1] - b[0] * a[1] }
  if (s < 0) ring = ring.slice().reverse()
  const segs = []
  roads.forEach(([c, f]) => { if (c < 1 || c > 3) return; for (let k = 0; k + 3 < f.length; k += 2) segs.push([f[k], f[k + 1], f[k + 2], f[k + 3]]) })
  let best = null
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length], de = b[0] - a[0], dn = b[1] - a[1], l = Math.hypot(de, dn)
    if (l < 8) continue
    const nx = dn / l, ny = -de / l, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2
    let d = 1e9
    for (const [x0, y0, x1, y1] of segs) {
      const sx = x1 - x0, sy = y1 - y0, L = sx * sx + sy * sy || 1, t = Math.max(0, Math.min(1, ((mx - x0) * sx + (my - y0) * sy) / L))
      const px = x0 + sx * t - mx, py = y0 + sy * t - my, dd = Math.hypot(px, py)
      if (dd > 0 && (px * nx + py * ny) / dd > 0.7 && dd < d) d = dd
    }
    if (!best || d < best.d) best = { d, a, U: [de / l, dn / l], W: l }
  }
  const U = best.U, V = [-U[1], U[0]]
  const local = ring.map(p => { const x = p[0] - best.a[0], y = p[1] - best.a[1]; return [x * U[0] + y * U[1], x * V[0] + y * V[1]] })
  return { o: best.a, U, V, W: best.W, local }
}

/* keep the part of a (u, v) polygon where f(p) >= 0, f linear */
function clip(poly, f){
  const out = []
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], fa = f(a), fb = f(b)
    if (fa >= 0) out.push(a)
    if ((fa >= 0) !== (fb >= 0)) { const t = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]) }
  }
  return out
}

export function buildHqModel(THREE, ringPlan, roads){
  const F = frameFor(ringPlan, roads)
  const W = F.W, uL = 11.8, uR = W
  const col = new THREE.Color()

  /* ---- builders, in local metres: x = u, y up, z = -v (the street side faces +z) ---- */
  function Buf(coloured){ this.p = []; this.n = []; this.c = coloured ? [] : null }
  Buf.prototype.tri = function(a, b, c, n, hex){
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2]
    if ((uy * vz - uz * vy) * n[0] + (uz * vx - ux * vz) * n[1] + (ux * vy - uy * vx) * n[2] < 0) { const s = b; b = c; c = s }
    this.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); this.n.push(n[0], n[1], n[2], n[0], n[1], n[2], n[0], n[1], n[2])
    if (this.c && typeof hex === 'function') [a, b, c].forEach(v => this.c.push(...hex(v)))
    else if (this.c) { col.setHex(hex); for (let k = 0; k < 3; k++) this.c.push(col.r, col.g, col.b) }
  }
  Buf.prototype.quad = function(a, b, c, d, n, hex){ this.tri(a, b, c, n, hex); this.tri(a, c, d, n, hex) }
  Buf.prototype.geo = function(){
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3))
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3))
    if (this.c) g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3))
    return g
  }
  const Q = (u, y, v) => [u, y, -v]
  const NF = [0, 0, 1], NB = [0, 0, -1], NL = [-1, 0, 0], NR = [1, 0, 0], NU = [0, 1, 0], ND = [0, -1, 0]
  /* a box, faces named f(ront, street side) k(back) l r t b; skip lists the faces left out */
  function box(buf, u0, u1, y0, y1, v0, v1, hex, skip){
    skip = skip === undefined ? 'b' : skip
    if (skip.indexOf('f') < 0) buf.quad(Q(u0, y0, v0), Q(u1, y0, v0), Q(u1, y1, v0), Q(u0, y1, v0), NF, hex)
    if (skip.indexOf('k') < 0) buf.quad(Q(u0, y0, v1), Q(u1, y0, v1), Q(u1, y1, v1), Q(u0, y1, v1), NB, hex)
    if (skip.indexOf('l') < 0) buf.quad(Q(u0, y0, v0), Q(u0, y0, v1), Q(u0, y1, v1), Q(u0, y1, v0), NL, hex)
    if (skip.indexOf('r') < 0) buf.quad(Q(u1, y0, v0), Q(u1, y0, v1), Q(u1, y1, v1), Q(u1, y1, v0), NR, hex)
    if (skip.indexOf('t') < 0) buf.quad(Q(u0, y1, v0), Q(u1, y1, v0), Q(u1, y1, v1), Q(u0, y1, v1), NU, hex)
    if (skip.indexOf('b') < 0) buf.quad(Q(u0, y0, v0), Q(u1, y0, v0), Q(u1, y0, v1), Q(u0, y0, v1), ND, hex)
  }
  const mat = new Buf(true), glass = new Buf(true), extra = []
  /* each band of glazing darkens toward its foot, where it reflects the forecourt, and lightens toward the sky at its head */
  const sheen = (y0, y1) => v => { const k = 0.52 + 0.56 * Math.max(0, Math.min(1, (v[1] - y0) / (y1 - y0 || 1))); return [k, k, k] }
  const gFront = (u0, u1, y0, y1, v) => glass.quad(Q(u0, y0, v), Q(u1, y0, v), Q(u1, y1, v), Q(u0, y1, v), NF, sheen(y0, y1))
  const gSide = (u, v0, v1, y0, y1, n) => glass.quad(Q(u, y0, v0), Q(u, y0, v1), Q(u, y1, v1), Q(u, y1, v0), n, sheen(y0, y1))
  const m4 = new THREE.Matrix4(), qt = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0)
  function cyl(r0, r1, a, b, hex, seg){
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), len = d.length()
    const g = new THREE.CylinderGeometry(r1, r0, len, seg || 6, 1, false).toNonIndexed(); g.deleteAttribute('uv')
    col.setHex(hex); const n = g.attributes.position.count, c = new Float32Array(n * 3); for (let i = 0; i < n; i++) { c[i * 3] = col.r; c[i * 3 + 1] = col.g; c[i * 3 + 2] = col.b }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3))
    qt.setFromUnitVectors(UP, d.normalize()); m4.compose(A.clone().add(B).multiplyScalar(0.5), qt, new THREE.Vector3(1, 1, 1)); g.applyMatrix4(m4)
    extra.push(g)
  }

  /* ---- the site: paving, the apron across the verge, parking lines ---- */
  const lotL = -3.4, lotR = 33.6, wallV = -12.1, lotBack = Math.max(...F.local.map(p => p[1])) + 1.2
  box(mat, lotL, lotR, 0, 0.34, wallV, lotBack, C.pave, 'bk')
  box(mat, 8.9, 26.4, 0, 0.33, -15.7, wallV, C.apron, 'bk')
  ;[-2.4, 0.3, 3.0, 5.7].forEach(u => box(mat, u, u + 0.12, 0.34, 0.36, -11.2, -9.6, C.yellow, 'bflrk'))
  box(mat, -2.4, 5.82, 0.34, 0.36, -11.2, -11.08, C.yellow, 'bflrk')

  /* ---- main block ---- */
  const G0 = 0.35, G1 = 4.9, B1 = 5.8, F2 = 9.5, T2 = 9.8, F3 = 13.4, FA = 14.6, TOP = 15.1, gv = 0.3, wrap = 2.6
  box(mat, uL - 0.3, uR + 0.6, 0, G0, -1.4, gv, C.plinth)                                       /* granite step */
  box(mat, uL, uR, 0, FA, wrap, 16, C.render, 'bf')                                              /* the rendered body behind the glass */
  ;[[0, G1], [B1, F2], [T2, F3]].forEach(([y0, y1]) => {                                         /* glazing, wrapping the right corner */
    gFront(uL, uR, y0, y1, gv); gSide(uR, gv, wrap, y0, y1, NR); gSide(uL, gv, 1.2, y0, y1, NL)
  })
  box(mat, uL - 0.05, uR + 0.35, G1, B1, -0.35, 16, C.band, 'b')                                 /* first floor band, running on as the side ledge */
  box(mat, uL, uR + 0.12, F2, T2, gv - 0.12, wrap, C.mull, 'bk')                                /* the floor line between the upper storeys */
  box(mat, uL - 0.2, uR + 0.5, F3, FA, -0.5, 13, C.fascia, 'bkt')                               /* fascia */
  box(mat, uL - 1.1, uR + 1.4, FA, TOP, -1.4, 13, C.slab, 'bt')                                  /* the thin dark roof slab, */
  box(mat, uL - 1.1, uR + 1.4, TOP, TOP, -1.4, 13, C.deck, 'bfklr')                              /* its deck a lighter grey */
  /* timber fins, staggered storey by storey as on the building */
  const fins = [[G0, G1, [0, 0.3, 0.56, 0.95], 0.72], [B1, F2, [0, 0.22, 0.53, 0.955], 0.6], [T2, F3, [0, 0.22, 0.43, 0.78], 0.6]]
  fins.forEach(([y0, y1, fr, w]) => fr.forEach(f => { const u = uL + f * (uR - uL - w); box(mat, u, u + w, y0, y1, gv - 0.22, gv, C.timber, 'bk') }))
  /* mullions and transoms */
  ;[[G0, G1], [B1, F2], [T2, F3]].forEach(([y0, y1]) => {
    for (let u = uL + 1.6; u < uR - 0.4; u += 1.6) box(mat, u, u + 0.07, y0, y1, gv - 0.05, gv, C.mull, 'bk')
    box(mat, uL, uR, y0 + (y1 - y0) * 0.62, y0 + (y1 - y0) * 0.62 + 0.07, gv - 0.05, gv, C.mull, 'bk')
    box(mat, uR, uR + 0.05, y0 + (y1 - y0) * 0.62, y0 + (y1 - y0) * 0.62 + 0.07, gv, wrap, C.mull, 'bfk')
    box(mat, uR, uR + 0.05, y0, y1, 1.4, 1.47, C.mull, 'bfkt')
  })
  /* slot windows scattered on the side wall */
  ;[[1.2, 3.4], [1.6, 6.1], [1.1, 9.8], [1.5, 13.2], [6.4, 4.2], [6.9, 7.9], [6.2, 11.5], [6.7, 14.6], [10.4, 3.5], [10.9, 6.9], [10.2, 10.1], [10.8, 13.6]]
    .forEach(([y, v]) => gSide(uR + 0.03, v, v + 0.4, y, y + 1.8, NR))
  /* air conditioning units on the ledge */
  ;[3.3, 4.5, 5.7].forEach(v => box(mat, uR + 0.05, uR + 0.38, B1, B1 + 0.62, v, v + 0.9, C.ac))
  /* glass canopies over the entrance and the side door */
  box(mat, uL - 1.4, uL + 6.8, G1 - 0.1, G1, -2.8, gv, C.canopy, '')
  box(mat, uR, uR + 2.7, G1 - 0.1, G1, 0.5, 5.6, C.canopy, '')
  /* the roof: railing, the plant box, the mast and the dish */
  const r0 = uL - 0.8, r1 = uR + 1.1, s0 = -1.1, s1 = 12.7, RH = 1.1
  ;[[r0, r1, s0, s0 + 0.07], [r0, r1, s1 - 0.07, s1], [r0, r0 + 0.07, s0, s1], [r1 - 0.07, r1, s0, s1]].forEach(([a, b, c, d]) => {
    box(mat, a, b, TOP + RH - 0.07, TOP + RH, c, d, C.rail); box(mat, a, b, TOP + 0.52, TOP + 0.57, c, d, C.rail)
    const len = Math.max(b - a, d - c), n = Math.max(1, Math.round(len / 2.3))
    for (let i = 0; i <= n; i++) { const t = i / n; const pu = a + (b - a - 0.07) * (b - a > 0.1 ? t : 0), pv = c + (d - c - 0.07) * (d - c > 0.1 ? t : 0); box(mat, pu, pu + 0.07, TOP, TOP + RH, pv, pv + 0.07, C.rail) }
  })
  box(mat, 16.0, 18.3, TOP, TOP + 1.9, 7.4, 9.5, C.port)
  const mu = 20.6, mv = 8.4
  cyl(0.11, 0.09, Q(mu, TOP, mv), Q(mu, TOP + 6.9, mv), C.rail)
  cyl(0.24, 0.24, Q(mu, TOP + 4.8, mv), Q(mu, TOP + 6.7, mv), C.port, 8)
  ;[[-1.2, -0.7], [1.2, -0.7], [0, 1.3]].forEach(([du, dv]) => cyl(0.04, 0.04, Q(mu + du, TOP, mv + dv), Q(mu, TOP + 3.2, mv), C.rail, 4))
  cyl(0.06, 0.06, Q(uR + 0.2, TOP, 6.2), Q(uR + 0.2, TOP + 4.3, 6.2), C.rail, 5)
  cyl(0.52, 0.3, Q(uR + 0.35, TOP + 3.75, 6.05), Q(uR + 0.62, TOP + 3.82, 5.78), C.port, 12)

  /* ---- stair core ---- */
  box(mat, 8.0, uL, 0, 14.0, 1.2, 16, C.white)
  ;[[0.8, 2.4], [2.9, 4.5], [5.6, 7.2], [7.7, 9.3], [10.0, 11.6], [12.1, 13.4]].forEach(([y0, y1]) => gFront(9.35, 10.45, y0, y1, 1.17))

  /* ---- second block, set back ---- */
  const lu0 = 0.4, lu1 = 8.0, lv = 2.4, lw = lu1 - lu0
  box(mat, lu0, lu1, 0, 13.2, lv + 0.3, 16, C.white)
  ;[[0.3, 4.4], [5.4, 8.6], [8.8, 12.0]].forEach(([y0, y1]) => gFront(lu0, lu1, y0, y1, lv + 0.28))
  box(mat, lu0, lu0 + 0.55, 0, 13.2, lv, lv + 0.3, C.white, 'bk')                                /* the rendered left edge */
  box(mat, lu0 - 0.3, lu1 + 0.2, 4.4, 5.4, lv - 0.35, lv + 0.3, C.band, 'bk')
  box(mat, lu0, lu1, 8.6, 8.8, lv + 0.18, lv + 0.3, C.mull, 'bk')
  box(mat, lu0 - 0.9, lu1 + 0.3, 12.0, 12.45, lv - 0.9, 14, C.lslab)
  box(mat, lu0 - 1.4, lu1 + 0.4, 13.2, 13.55, lv - 1.4, 14.5, C.lslab)
  ;[[5.4, 8.6, [0.33, 0.67, 0.9]], [8.8, 12.0, [0.4, 0.67, 0.9]]].forEach(([y0, y1, fr]) => fr.forEach(f => { const u = lu0 + f * lw; box(mat, u, u + 0.45, y0, y1, lv + 0.1, lv + 0.3, C.timber, 'bk') }))
  ;[[0.3, 4.4], [5.4, 8.6], [8.8, 12.0]].forEach(([y0, y1]) => { for (let u = lu0 + 1.9; u < lu1 - 0.3; u += 1.9) box(mat, u, u + 0.06, y0, y1, lv + 0.26, lv + 0.3, C.mull, 'bkt') })
  box(mat, lu0 - 0.4, lu1 + 0.1, 4.3, 4.4, -0.2, lv + 0.3, C.canopy, '')                        /* its ground floor canopy */

  /* ---- the roller shutter annex in the footprint's right notch ---- */
  const nr = F.local.filter(p => p[0] > uR + 1 && p[1] < 16).reduce((m, p) => Math.max(m, p[0]), uR + 7)
  const nv = F.local.filter(p => p[0] > uR + 1 && p[1] < 16).reduce((m, p) => Math.min(m, p[1]), 6.7)
  box(mat, uR, nr, 0, 7.4, nv, 16, C.clad, 'bl')
  box(mat, uR - 0.1, nr + 0.3, 6.8, 7.5, nv - 0.3, 16, C.band, 'b')
  box(mat, uR + 1.1, nr - 1.2, 0, 4.9, nv - 0.08, nv, C.shutter, 'bk')
  box(mat, uR + 1.0, nr - 1.1, 4.9, 5.3, nv - 0.3, nv, C.band, 'bk')
  ;[uR + 1.2, uR + 2.4, uR + 3.6, uR + 4.8].forEach(u => box(mat, u, u + 0.9, 7.5, 8.1, 10.5, 11.2, C.ac))

  /* ---- the warehouse: the footprint from v 16 back, white walls, a grey metal gable ---- */
  const back = clip(F.local, p => p[1] - 16)
  const us = back.map(p => p[0]), umin = Math.min(...us), umax = Math.max(...us), ridge = (umin + umax) / 2
  const EAVE = 7.8, RISE = 1.7, k = RISE / (ridge - umin)
  const roofY = u => EAVE + k * (u <= ridge ? u - umin : umax - u)
  ;[clip(back, p => ridge - p[0]), clip(back, p => p[0] - ridge)].forEach(half => {
    if (half.length < 3) return
    const tris = THREE.ShapeUtils.triangulateShape(half.map(p => new THREE.Vector2(p[0], p[1])), [])
    const a0 = Q(half[tris[0][0]][0], roofY(half[tris[0][0]][0]), half[tris[0][0]][1]), a1 = Q(half[tris[0][1]][0], roofY(half[tris[0][1]][0]), half[tris[0][1]][1]), a2 = Q(half[tris[0][2]][0], roofY(half[tris[0][2]][0]), half[tris[0][2]][1])
    const n = new THREE.Vector3().subVectors(new THREE.Vector3(...a1), new THREE.Vector3(...a0)).cross(new THREE.Vector3().subVectors(new THREE.Vector3(...a2), new THREE.Vector3(...a0))).normalize()
    if (n.y < 0) n.negate()
    tris.forEach(t => mat.tri(...t.map(i => Q(half[i][0], roofY(half[i][0]), half[i][1])), [n.x, n.y, n.z], C.roof))
    let s = 0; for (let i = 0; i < half.length; i++) { const a = half[i], b = half[(i + 1) % half.length]; s += a[0] * b[1] - b[0] * a[1] }
    for (let i = 0; i < half.length; i++) {
      const a = half[i], b = half[(i + 1) % half.length], du = b[0] - a[0], dv = b[1] - a[1], l = Math.hypot(du, dv)
      if (l < 0.05 || (Math.abs(a[0] - ridge) < 0.01 && Math.abs(b[0] - ridge) < 0.01) || (Math.abs(a[1] - 16) < 0.01 && Math.abs(b[1] - 16) < 0.01)) continue
      const on = s > 0 ? [dv / l, -du / l] : [-dv / l, du / l], nn = [on[0], 0, -on[1]]
      mat.quad(Q(a[0], 0, a[1]), Q(b[0], 0, b[1]), Q(b[0], EAVE - 0.7, b[1]), Q(a[0], EAVE - 0.7, a[1]), nn, C.white)
      mat.quad(Q(a[0], EAVE - 0.7, a[1]), Q(b[0], EAVE - 0.7, b[1]), Q(b[0], roofY(b[0]), b[1]), Q(a[0], roofY(a[0]), a[1]), nn, C.clad)
    }
  })
  const vmax = Math.max(...back.map(p => p[1]))
  box(mat, ridge - 0.25, ridge + 0.25, EAVE + RISE - 0.05, EAVE + RISE + 0.1, 16, vmax, C.ridge, 'bf')
  /* shutters on the driveway side */
  const edgeU = v => { let u = -1e9; for (let i = 0; i < back.length; i++) { const a = back[i], b = back[(i + 1) % back.length]; if ((a[1] - v) * (b[1] - v) <= 0 && a[1] !== b[1]) u = Math.max(u, a[0] + (b[0] - a[0]) * (v - a[1]) / (b[1] - a[1])) } return u }
  ;[19, 26].forEach(v => { const u = Math.max(edgeU(v), edgeU(v + 4.6)); box(mat, u - 0.02, u + 0.1, 0, 5.2, v, v + 4.6, C.shutter, 'bl') })

  /* ---- the carport on the left of the forecourt ---- */
  box(mat, -3.2, 8.6, 3.0, 3.12, -9.2, -0.6, C.carport, '')
  ;[-2.9, 2.8, 8.3].forEach(u => [-8.95, -0.85].forEach(v => box(mat, u - 0.07, u + 0.07, 0, 3.0, v - 0.07, v + 0.07, C.clad, 'bt')))

  /* ---- boundary wall, guardhouse, flagpoles ---- */
  const wall = (u0, u1, v0, v1) => { box(mat, u0, u1, 0, 1.6, v0, v1, C.white); box(mat, u0 - 0.03, u1 + 0.03, 1.6, 1.7, v0 - 0.03, v1 + 0.03, C.fascia) }
  wall(lotL, 5.6, wallV - 0.15, wallV + 0.15); wall(30.4, lotR, wallV - 0.15, wallV + 0.15)
  wall(lotL, lotL + 0.3, wallV + 0.15, lotBack); wall(lotR - 0.3, lotR, wallV + 0.15, lotBack)
  box(mat, 26.4, 30.3, 0, 2.9, -12.3, -8.6, C.white)
  box(mat, 26.1, 30.6, 2.9, 3.25, -12.6, -8.3, C.slab, '')
  box(mat, 26.7, 27.9, 0, 2.4, -12.36, -12.3, C.shutter, 'bk')
  gFront(28.4, 29.3, 0.35, 2.35, -12.33)
  ;[29.4, 30.9, 32.4].forEach(u => { box(mat, u - 0.25, u + 0.25, 0, 0.55, -6.45, -5.95, C.band); cyl(0.07, 0.045, Q(u, 0.55, -6.2), Q(u, 7.8, -6.2), C.pole, 6) })

  /* ---- the gate sign: white pier, dark band carrying the wordmark, grey cap, the white plaque ---- */
  const su0 = 5.55, su1 = 8.95, sv0 = -12.6, sv1 = -11.8
  box(mat, su0 + 0.05, su1 - 0.05, 0, 1.95, sv0 + 0.05, sv1 - 0.05, C.white)
  box(mat, su0, su1, 1.95, 2.6, sv0, sv1, C.signband, 'bf')
  box(mat, su0 - 0.05, su1 + 0.05, 2.6, 2.8, sv0 - 0.05, sv1 + 0.05, C.signcap)
  box(mat, 6.4, 7.9, 0.95, 1.6, sv0 + 0.02, sv0 + 0.05, C.plaque, 'bk')
  const sc = document.createElement('canvas'); sc.width = 512; sc.height = 98
  const sx = sc.getContext('2d'); sx.fillStyle = '#464B52'; sx.fillRect(0, 0, 512, 98)
  const signTex = new THREE.CanvasTexture(sc); signTex.colorSpace = THREE.SRGBColorSpace; signTex.anisotropy = 4
  const logo = new Image(); logo.decoding = 'async'
  logo.onload = () => { const h = 80, w = h * logo.naturalWidth / logo.naturalHeight; sx.drawImage(logo, 512 * 0.53 - w / 2, (98 - h) / 2, w, h); signTex.needsUpdate = true }
  logo.src = '/assets/iaq-logo-mark.webp'
  const signGeo = new THREE.PlaneGeometry(su1 - su0, 0.65)
  signGeo.translate((su0 + su1) / 2, 2.275, -sv0 + 0.004)

  /* ---- into the district's frame, merged per material ---- */
  const frame = new THREE.Matrix4().makeBasis(new THREE.Vector3(F.U[0], 0, -F.U[1]), new THREE.Vector3(0, 1, 0), new THREE.Vector3(-F.V[0], 0, F.V[1])).setPosition(F.o[0], 0, -F.o[1])
  const matGeo = mergeGeometries([mat.geo(), ...extra]); extra.forEach(g => g.dispose()); matGeo.applyMatrix4(frame)
  const glassGeo = glass.geo(); glassGeo.applyMatrix4(frame)
  signGeo.applyMatrix4(frame)

  /* green tinted glass: a little of a soft sky in it, nothing else in the scene changes */
  const ec = document.createElement('canvas'); ec.width = 128; ec.height = 64
  const ex = ec.getContext('2d'), eg = ex.createLinearGradient(0, 0, 0, 64)
  eg.addColorStop(0, '#F6F8FB'); eg.addColorStop(0.46, '#DCE4EC'); eg.addColorStop(0.53, '#94A8A4'); eg.addColorStop(1, '#5A6B67')
  ex.fillStyle = eg; ex.fillRect(0, 0, 128, 64)
  const envTex = new THREE.CanvasTexture(ec); envTex.mapping = THREE.EquirectangularReflectionMapping; envTex.colorSpace = THREE.SRGBColorSpace

  const mats = {
    body: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, metalness: 0 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x2B665B, vertexColors: true, roughness: 0.1, metalness: 0.7, envMap: envTex, envMapIntensity: 1.15 }),
    sign: new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.88, metalness: 0 }),
  }
  /* thin slabs and single sided glass still throw their whole shadow into the (baked once) map */
  mats.body.shadowSide = THREE.DoubleSide; mats.glass.shadowSide = THREE.DoubleSide
  const group = new THREE.Group()
  const body = new THREE.Mesh(matGeo, mats.body), glassM = new THREE.Mesh(glassGeo, mats.glass), sign = new THREE.Mesh(signGeo, mats.sign)
  body.castShadow = body.receiveShadow = true; glassM.castShadow = glassM.receiveShadow = true; sign.receiveShadow = true
  group.add(body); group.add(glassM); group.add(sign)

  const toPlan = (u, v) => [F.o[0] + u * F.U[0] + v * F.V[0], F.o[1] + u * F.U[1] + v * F.V[1]]
  const toLocal = (e, n) => { const x = e - F.o[0], y = n - F.o[1]; return [x * F.U[0] + y * F.U[1], x * F.V[0] + y * F.V[1]] }
  return {
    group, roofH: TOP,
    pin: toPlan((uL + uR) / 2 - 1.2, 4.2),                      /* on the main block's roof, clear of the plant box and the mast */
    tris: (matGeo.attributes.position.count + glassGeo.attributes.position.count) / 3 + 2,
    /* the lot and the apron, so verge trees do not stand in the gateway or the forecourt */
    occupies: (e, n) => { const [u, v] = toLocal(e, n); return u > lotL - 0.5 && u < lotR + 0.5 && v > wallV - 0.4 && v < lotBack || u > 8.4 && u < 26.9 && v > -16.2 && v <= wallV },
    dispose(){ Object.values(mats).forEach(m => m.dispose()); signTex.dispose(); envTex.dispose(); logo.onload = null },
  }
}
