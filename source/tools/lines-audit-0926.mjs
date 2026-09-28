// Line audit (26 Sep, Bazil: "no separated lines", "most common use should be the 1 line straight", "cannot have too many
// lines"). Per route: every visible horizontal line (borders, hr, thin filled boxes, thin pseudo-elements), how many share
// one screen, and "separated" rows: two or more segments on one y with gaps between them.
// node tools/lines-audit-0926.mjs <out.json> [width] [routes comma list]
import puppeteer from 'puppeteer-core'
import fs from 'fs'
const OUT = process.argv[2], W = +(process.argv[3] || 1440), ONLY = process.argv[4] ? process.argv[4].split(',') : null
const src = fs.readFileSync('tools/rules-audit-0926.mjs', 'utf8'); const ROUTES = eval(src.match(/const ROUTES = (\[[\s\S]*?\])/)[1])
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: W, height: 900, isMobile: W < 700, hasTouch: W < 700 })
await p.evaluateOnNewDocument(() => { try { window.__iaqLoaderPlayed = true } catch (e) {} })
const res = []
for (const route of (ONLY || ROUTES)) {
  try { await p.goto('http://localhost:57375' + route + '?nointro=1', { waitUntil: 'networkidle2', timeout: 60000 }) } catch (e) {}
  await sleep(900)
  await p.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 70)) } scrollTo(0, 0); await new Promise(r => setTimeout(r, 300)) })
  const r = await p.evaluate(() => {
    const segs = []
    const alpha = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return 0; const v = m[1].split(',').map(Number); return v.length > 3 ? v[3] : 1 }
    const name = e => { let s = e.tagName.toLowerCase(); if (e.id) s += '#' + e.id; const c = (typeof e.className === 'string' ? e.className : '').trim().split(/\s+/).filter(Boolean).slice(0, 2); if (c.length) s += '.' + c.join('.'); return s }
    const path = e => { const a = []; let n = e; for (let i = 0; i < 3 && n && n !== document.body; i++, n = n.parentElement) a.unshift(name(n)); return a.join(' > ') }
    const sy = scrollY
    for (const e of document.querySelectorAll('body *')) {
      if (e.closest('.bmws,#loader,#boot,svg,canvas,video,iframe')) continue
      const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue
      const q = e.getBoundingClientRect(); if (q.width < 16 || q.height === 0) continue
      const top = q.top + sy
      for (const side of ['Top', 'Bottom']) {
        const w = parseFloat(cs['border' + side + 'Width']); if (w >= .5 && cs['border' + side + 'Style'] !== 'none' && alpha(cs['border' + side + 'Color']) > .06)
          segs.push({ x1: q.left, x2: q.right, y: side === 'Top' ? top : top + q.height, kind: 'border-' + side.toLowerCase(), who: path(e), c: cs['border' + side + 'Color'] })
      }
      if (q.height <= 3.2 && q.width >= 24 && (alpha(cs.backgroundColor) > .06 || cs.backgroundImage !== 'none')) segs.push({ x1: q.left, x2: q.right, y: top, kind: 'thin box', who: path(e), c: cs.backgroundColor })
      for (const ps of ['::before', '::after']) {
        const pc = getComputedStyle(e, ps); if (pc.content === 'none' || pc.display === 'none' || +pc.opacity === 0) continue
        const h = parseFloat(pc.height), wd = parseFloat(pc.width)
        if (h > 0 && h <= 3.2 && (wd >= 24 || pc.width === 'auto') && (alpha(pc.backgroundColor) > .06 || pc.backgroundImage !== 'none')) {
          const bt = parseFloat(pc.top), bb = parseFloat(pc.bottom)
          const y = !isNaN(bt) ? top + bt : !isNaN(bb) ? top + q.height - bb - h : top
          const l = parseFloat(pc.left), ww = isNaN(wd) ? q.width : wd
          const x1 = q.left + (isNaN(l) ? 0 : l)
          segs.push({ x1, x2: x1 + ww, y, kind: 'pseudo' + ps, who: path(e) + ps, c: pc.backgroundColor })
        }
      }
    }
    // screens: the most lines inside any 900px window
    const ys = segs.map(s => s.y).sort((a, b) => a - b); let most = 0, at = 0
    for (let i = 0; i < ys.length; i++) { let j = i; while (j < ys.length && ys[j] - ys[i] < 900) j++; if (j - i > most) { most = j - i; at = ys[i] } }
    // separated: segments on one y (within 1.5px), two or more, with gaps of 6px or more between them
    const sorted = [...segs].sort((a, b) => a.y - b.y || a.x1 - b.x1); const groups = []
    for (const s of sorted) { const g = groups.find(g => Math.abs(g.y - s.y) <= 1.5); if (g) g.s.push(s); else groups.push({ y: s.y, s: [s] }) }
    const sep = []
    for (const g of groups) {
      if (g.s.length < 2) continue
      const xs = g.s.map(s => [s.x1, s.x2]).sort((a, b) => a[0] - b[0]); const merged = []
      for (const [a, b] of xs) { const m = merged[merged.length - 1]; if (m && a - m[1] < 6) m[1] = Math.max(m[1], b); else merged.push([a, b]) }
      if (merged.length >= 2) sep.push({ y: Math.round(g.y), pieces: merged.length, widths: merged.map(m => Math.round(m[1] - m[0])), who: [...new Set(g.s.map(s => s.who))].slice(0, 2) })
    }
    // lines per source, for fixing
    const by = {}; for (const s of segs) { const k = s.who.split(' > ').slice(-1)[0].replace(/:nth.*$/, '') + ' [' + s.kind + ']'; by[k] = (by[k] || 0) + 1 }
    return { total: segs.length, most, mostAt: Math.round(at), sep, top: Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 8), H: document.documentElement.scrollHeight }
  })
  res.push({ route, ...r }); console.log(route.padEnd(34), 'lines', String(r.total).padStart(3), '| most on one screen', String(r.most).padStart(3), '@', r.mostAt, '| separated rows', r.sep.length)
}
fs.writeFileSync(OUT, JSON.stringify(res, null, 1)); await b.close()
