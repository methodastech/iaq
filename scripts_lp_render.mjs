/* Renders the delivery-cycle stage to a PNG with no browser, so the composition can actually be
   looked at. makeGlyph is lifted VERBATIM out of src/scenes/home.js so the marks drawn here are the
   marks the site draws; everything else (rail, core, wires, stations, masts, seating) mirrors init()
   and the frame loop. Line geometry is projected through the real three.js camera and rasterised. */
import * as T from 'three'
import fs from 'fs'
import zlib from 'zlib'
import { renderSVG } from './scripts_svg_render.mjs'
import { CYCLE_SVG } from './src/data/cycleMarks.js'

const SRC = fs.readFileSync('src/scenes/home.js', 'utf8')

/* ---- lift makeGlyph out of the source, brace-matched ---- */
function lift (name) {
  const a = SRC.indexOf('function ' + name + '(')
  if (a < 0) throw new Error('not found: ' + name)
  let d = 0, i = SRC.indexOf('{', a)
  for (let k = i; k < SRC.length; k++) {
    if (SRC[k] === '{') d++
    else if (SRC[k] === '}') { d--; if (!d) return SRC.slice(a, k + 1) }
  }
  throw new Error('unbalanced: ' + name)
}
const INK = new T.Color(0x3E4A63), DONE = new T.Color(0x7A879F),
      AHEAD = new T.Color(0x97A2B6), RED = new T.Color(0xEC2027)
const CYCLE_SLOTS = ['des', 'prc', 'con', 'com', 'mnt']
const makeGlyph = i => { const g = new T.Group()
  g.add(new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial()))
  g.userData = { env: 1, rad: .5, fixedRad: true, slot: CYCLE_SLOTS[i] }
  return g }
const gaugeOne = (gg, tilt) => { const q = new T.Quaternion().setFromEuler(new T.Euler(tilt, 0, 0))
  const v = new T.Vector3(); let best = 0
  gg.quaternion.identity(); gg.scale.set(1, 1, 1); gg.updateMatrixWorld(true)
  gg.traverse(o => { const pos = o.geometry && o.geometry.attributes && o.geometry.attributes.position
    if (!pos) return
    for (let k = 0; k < pos.count; k++) { v.set(pos.getX(k), pos.getY(k), pos.getZ(k))
      o.localToWorld(v); gg.worldToLocal(v); v.applyQuaternion(q)
      const rr = v.x * v.x + v.y * v.y; if (rr > best) best = rr } })
  gg.userData.rad = Math.sqrt(best) || .13 }
const layout = new Function('T', lift('layout') + '; return layout')(T)

const SW = Number(process.argv[2] || 720), SH = Number(process.argv[3] || 739)
const ACTIVE = Number(process.argv[4] || 0)
const SCALE = Number(process.argv[5] || 1.05)
const W = Math.round(SW * SCALE), H = Math.round(SH * SCALE)

const R = 2.02, STEP = Math.PI * 2 / 5, A0 = -Math.PI / 2, CR = 0.36
const L = layout(SW, SH)

/* ---- camera: fit() ---- */
const camera = new T.PerspectiveCamera(36, SW / SH, 0.1, 40)
{
  const mTop = L.sta * 0.5 + 10, mBot = L.drop + L.chip * 0.5 + 10,
        mSide = L.sta * 0.5 + 10
  const tx = Math.max(0.4, 1 - 2 * mSide / SW), tyT = Math.max(0.4, 1 - 2 * mTop / SH), tyB = Math.max(0.4, 1 - 2 * mBot / SH)
  const pts = [[R, 0, 0], [-R, 0, 0], [0, 0, R], [0, 0, -R], [R * .71, 0, R * .71], [-(R * .71), 0, R * .71], [R * .71, 0, -(R * .71)], [-(R * .71), 0, -(R * .71)]].map(p => new T.Vector3(...p))
  const seat = zz => { camera.clearViewOffset(); camera.position.set(0, L.pitch * zz, zz); camera.lookAt(0, -0.02, 0); camera.updateMatrixWorld() }
  let z = 3.4, ok = false; const v = new T.Vector3()
  while (z <= 12 && !ok) { seat(z); ok = true
    for (const p of pts) { v.copy(p).project(camera); if (Math.abs(v.x) > tx || v.y > tyT || v.y < -tyB) { ok = false; break } }
    if (!ok) z += 0.2 }
  seat(z)
  const fnear = new T.Vector3(0, 0, R), ffar = new T.Vector3(0, 0, -R); let offY = 0
  for (let c = 0; c < 6; c++) {
    const yT = (-v.copy(ffar).project(camera).y * .5 + .5) * SH - L.sta * .5
    const yB = SH - ((-v.copy(fnear).project(camera).y * .5 + .5) * SH + L.drop + L.chip * .5)
    const d = (yB - yT) * .5; if (Math.abs(d) < .5) break
    offY -= d; camera.setViewOffset(SW, SH, 0, offY, SW, SH); camera.updateMatrixWorld() }
}

/* ---- scene ---- */
const uni = new T.Group(), sys = new T.Group(); uni.add(sys)
sys.rotation.y = (A0 + ACTIVE * STEP) - Math.PI / 2
const ptOn = (a, y) => new T.Vector3(R * Math.cos(a), y || 0, R * Math.sin(a))
const angOf = i => A0 + i * STEP

const stations = []
for (let i = 0; i < 5; i++) {
  const g = new T.Group(); g.position.copy(ptOn(angOf(i)))
  const glyph = makeGlyph(i); glyph.position.set(0, .6, 0); g.add(glyph)
  sys.add(g); stations.push({ g, glyph, i })
}
uni.updateMatrixWorld(true)

/* ---- frame-loop seating ---- */
const TANH = Math.tan(camera.fov * Math.PI / 360)
const _sv = new T.Vector3(), _su = new T.Vector3(), _sd = new T.Vector3(), _pq = new T.Quaternion()
const masts = [], nodes = [], plates = []
for (const s of stations) {
  const on = s.i === ACTIVE, done = s.i < ACTIVE, lit = on ? 1 : 0
  s.g.getWorldPosition(_sv); _su.copy(_sv).applyMatrix4(camera.matrixWorldInverse)
  const perPx = (Math.max(.05, -_su.z) * TANH * 2) / SH
  const staR = L.sta * .5 * perPx * (1 + lit * .06)
  s.glyph.position.set(0, 0, 0)
  plates.push({ g: s.g, r: staR, done, lit })
  gaugeOne(s.glyph, -Math.atan2(camera.position.y + .02, camera.position.z))
  s.g.getWorldQuaternion(_pq)
  s.glyph.quaternion.copy(_pq).invert()
  s.glyph.rotateX(-Math.atan2(camera.position.y + .02, camera.position.z))
  s.glyph.scale.setScalar((L.mark * .5 * perPx / (s.glyph.userData.rad || .13)) * (1 + lit * .06))
  s.glyph.userData.state = { done, lit }
}
uni.updateMatrixWorld(true)

/* ---- raster ---- */
const buf = Buffer.alloc(W * H * 3, 0xff)
const px_ = (x, y, c, a) => px(x, y, c, a)
function px (x, y, c, a) {
  x = Math.round(x); y = Math.round(y)
  if (x < 0 || y < 0 || x >= W || y >= H) return
  const o = (y * W + x) * 3
  for (let k = 0; k < 3; k++) buf[o + k] = Math.round(buf[o + k] * (1 - a) + c[k] * a)
}
function line (x0, y0, x1, y1, c, a, wdt) {
  const dx = x1 - x0, dy = y1 - y0, n = Math.max(1, Math.ceil(Math.hypot(dx, dy) * 2))
  for (let k = 0; k <= n; k++) {
    const x = x0 + dx * k / n, y = y0 + dy * k / n
    px(x, y, c, a)
    if (wdt > 1) { px(x + 1, y, c, a * .6); px(x, y + 1, c, a * .6) }
  }
}
function disc (cx, cy, r, c, a) {
  for (let y = Math.floor(cy - r) - 1; y <= cy + r + 1; y++)
    for (let x = Math.floor(cx - r) - 1; x <= cx + r + 1; x++) {
      const d = Math.hypot(x - cx, y - cy)
      if (d <= r + .5) px(x, y, c, a * Math.min(1, r + .5 - d))
    }
}
function ring (cx, cy, r, c, a) {
  const n = Math.max(24, Math.ceil(r * 8))
  for (let k = 0; k < n; k++) {
    const t0 = k / n * Math.PI * 2, t1 = (k + 1) / n * Math.PI * 2
    line(cx + r * Math.cos(t0), cy + r * Math.sin(t0), cx + r * Math.cos(t1), cy + r * Math.sin(t1), c, a, 1)
  }
}
const P = new T.Vector3()
const proj = (v, obj) => { P.copy(v); if (obj) obj.localToWorld(P); P.project(camera)
  return [(P.x * .5 + .5) * SW * SCALE, (-P.y * .5 + .5) * SH * SCALE] }
const rgb = h => [(h >> 16) & 255, (h >> 8) & 255, h & 255]
const C_RAIL = rgb(0x9AA5BA), C_INK = rgb(0x3E4A63), C_AHEAD = rgb(0x97A2B6),
      C_DONE = rgb(0x7A879F), C_RED = rgb(0xEC2027), C_HOOP = rgb(0x9BA5B8)

/* rail */
{
  const n = 240, pts = []
  for (let k = 0; k <= n; k++) pts.push(proj(ptOn(k / n * Math.PI * 2, 0), sys))
  for (let k = 0; k < n; k++) line(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], C_RAIL, .85, 2)
}
/* the travelled arc, stage 1 -> active */
if (ACTIVE > 0) {
  const n = ACTIVE * 30, pts = []
  for (let k = 0; k <= n; k++) pts.push(proj(ptOn(A0 + (k / 30) * STEP, .004), sys))
  for (let k = 0; k < n; k++) line(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], C_RED, 1, 3)
}
/* core hoops */
for (const [r, op, tx, ty] of [[CR, .5, Math.PI / 2, 0], [CR * .94, .3, 1.2, 0], [CR * .94, .24, 1.2, 1.05]]) {
  const m = new T.Group(); m.rotation.x = tx; m.rotation.y = ty
  sys.add(m); m.updateMatrixWorld(true)
  const n = 96, pts = []
  for (let k = 0; k <= n; k++) { const a2 = k / n * Math.PI * 2
    pts.push(proj(new T.Vector3(r * Math.cos(a2), r * Math.sin(a2), 0), m)) }
  for (let k = 0; k < n; k++) line(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], C_HOOP, op, 1)
  sys.remove(m)
}
/* wires core -> node */
for (let k = 0; k < 5; k++) {
  const a = angOf(k), done = k < ACTIVE, on = k === ACTIVE
  const p0 = proj(new T.Vector3(Math.cos(a) * CR, 0, Math.sin(a) * CR), sys)
  const p1 = proj(ptOn(a), sys)
  line(p0[0], p0[1], p1[0], p1[1], on ? C_RED : (done ? C_DONE : C_AHEAD), on ? .6 : (done ? .34 : .2), 1)
}
/* core */
{
  const c = proj(new T.Vector3(0, 0, 0), sys)
  const e = proj(new T.Vector3(.052, 0, 0), sys)
  disc(c[0], c[1], Math.abs(e[0] - c[0]), C_RED, 1)
  const g2 = proj(new T.Vector3(.13, 0, 0), sys)
  disc(c[0], c[1], Math.abs(g2[0] - c[0]), C_RED, .07)
}
/* plates: a white disc masking the rail, ringed in the station's state colour */
for (const p of plates) {
  const c = proj(new T.Vector3(0, 0, 0), p.g)
  const e = proj(new T.Vector3(p.r, 0, 0), p.g)
  const rr = Math.hypot(e[0] - c[0], e[1] - c[1])
  disc(c[0], c[1], rr, [247, 249, 252], 1)
  ring(c[0], c[1], rr, p.lit ? C_RED : (p.done ? C_DONE : C_AHEAD), p.lit ? 1 : .55)
}
/* masts */
for (const m of masts) {
  const a = proj(m.a, m.g), b = proj(m.b, m.g)
  const col = m.lit ? C_RED : (m.done ? C_DONE : C_AHEAD)
  line(a[0], a[1], b[0], b[1], col, .45 + m.lit * .4, 1)
}
/* nodes */
for (const n of nodes) {
  const c = proj(new T.Vector3(0, 0, 0), n.g)
  const e = proj(new T.Vector3(n.r, 0, 0), n.g)
  const col = n.lit ? C_RED : (n.done ? C_DONE : C_AHEAD)
  disc(c[0], c[1], Math.hypot(e[0] - c[0], e[1] - c[1]), col, 1)
}
/* the marks, composited from the same SVG the browser textures */
for (const st of stations) {
  const { done, lit } = st.glyph.userData.state
  const c = proj(new T.Vector3(0, 0, 0), st.g)
  const px = Math.max(8, Math.round(L.mark * SCALE))
  const im = renderSVG(CYCLE_SVG[st.glyph.userData.slot], px, '#F7F9FC')
  const a = (done ? .9 : .5) + (lit ? .5 : 0)
  const ox = Math.round(c[0] - im.w / 2), oy = Math.round(c[1] - im.h / 2)
  for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) {
    const o = (y * im.w + x) * 3
    const col = [im.buf[o], im.buf[o + 1], im.buf[o + 2]]
    /* the render is on the page colour, so treat near-background pixels as transparent */
    if (Math.abs(col[0] - 247) < 4 && Math.abs(col[1] - 249) < 4 && Math.abs(col[2] - 252) < 4) continue
    px_(ox + x, oy + y, col, Math.min(1, a))
  }
}
for (const s of []) {
  const { done, lit } = s.glyph.userData.state
  const lineCol = lit ? C_INK : (done ? C_INK : C_AHEAD)
  const accCol = lit ? C_RED : (done ? C_DONE : C_AHEAD)
  s.glyph.updateMatrixWorld(true)
  s.glyph.traverse(o => {
    if (o.isLine || o.isLineSegments || o.isLineLoop) {
      const pos = o.geometry.attributes.position, n = pos.count
      const pts = []
      for (let k = 0; k < n; k++) pts.push(proj(new T.Vector3(pos.getX(k), pos.getY(k), pos.getZ(k)), o))
      if (o.isLineSegments) for (let k = 0; k + 1 < n; k += 2) line(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], lineCol, .95, 1)
      else { for (let k = 0; k + 1 < n; k++) line(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], lineCol, .95, 1)
             if (o.isLineLoop && n > 2) line(pts[n - 1][0], pts[n - 1][1], pts[0][0], pts[0][1], lineCol, .95, 1) }
    } else if (o.isMesh) {
      /* draw the real triangles: a box accent rendered as a disc reads far heavier than it is */
      const pos = o.geometry.attributes.position, idx = o.geometry.index
      const n = idx ? idx.count : pos.count
      const tri = []
      for (let k = 0; k < n; k++) { const j = idx ? idx.getX(k) : k
        tri.push(proj(new T.Vector3(pos.getX(j), pos.getY(j), pos.getZ(j)), o)) }
      for (let k = 0; k + 2 < tri.length; k += 3) {
        const [a, b, c] = [tri[k], tri[k + 1], tri[k + 2]]
        const x0 = Math.floor(Math.min(a[0], b[0], c[0])), x1 = Math.ceil(Math.max(a[0], b[0], c[0]))
        const y0 = Math.floor(Math.min(a[1], b[1], c[1])), y1 = Math.ceil(Math.max(a[1], b[1], c[1]))
        const d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
        if (!d) continue
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          const w0 = ((b[1] - c[1]) * (x - c[0]) + (c[0] - b[0]) * (y - c[1])) / d
          const w1 = ((c[1] - a[1]) * (x - c[0]) + (a[0] - c[0]) * (y - c[1])) / d
          if (w0 >= -.002 && w1 >= -.002 && w0 + w1 <= 1.002) px(x, y, accCol, 1)
        }
      }
    }
  })
}
/* the name chips, at the drop the frame loop uses */
const CHIP = [70, 77, 92, 100, 85].map(v => v * (L.chip < 20 ? .72 : 1))
for (let i = 0; i < 5; i++) {
  const c = proj(new T.Vector3(0, 0, 0), stations[i].g)
  const cx = c[0], cy = c[1] + L.drop * SCALE
  const w = CHIP[i] * SCALE, h = 24 * SCALE
  const on = i === ACTIVE
  for (let y = Math.round(cy - h / 2); y <= cy + h / 2; y++)
    for (let x = Math.round(cx - w / 2); x <= cx + w / 2; x++)
      px(x, y, on ? C_RED : [255, 255, 255], on ? 1 : .92)
  ring(cx, cy, 0, C_INK, 0)
  for (let x = Math.round(cx - w / 2); x <= cx + w / 2; x++) {
    px(x, Math.round(cy - h / 2), on ? C_RED : C_AHEAD, .5)
    px(x, Math.round(cy + h / 2), on ? C_RED : C_AHEAD, .5)
  }
}
/* frame edge, so margins are readable */
for (let x = 0; x < W; x++) { px(x, 0, C_AHEAD, .35); px(x, H - 1, C_AHEAD, .35) }
for (let y = 0; y < H; y++) { px(0, y, C_AHEAD, .35); px(W - 1, y, C_AHEAD, .35) }

/* ---- PNG ---- */
const crcT = (() => { const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) { let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    t[n] = c } return t })()
const crc = b => { let c = -1; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0 }
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const cc = Buffer.alloc(4); cc.writeUInt32BE(crc(td)); return Buffer.concat([len, td, cc]) }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4)
ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
const raw = Buffer.alloc(H * (W * 3 + 1))
for (let y = 0; y < H; y++) { raw[y * (W * 3 + 1)] = 0
  buf.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3) }
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))])
const out = process.argv[6] || '.lp-render.png'
fs.writeFileSync(out, png)
console.log('wrote', out, W + 'x' + H, (png.length / 1024).toFixed(1) + 'KB',
  '| pitch', (Math.atan(L.pitch) * 180 / Math.PI).toFixed(1) + 'deg',
  '| sta', L.sta.toFixed(0), 'mark', L.mark.toFixed(0), 'drop', L.drop.toFixed(0))
