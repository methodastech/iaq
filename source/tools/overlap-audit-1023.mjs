/* 23 Oct 2026 (the review: "fix what may have overlapping problems, font problems, size etc, in other sections if there is"):
   every route at several window widths, reporting (1) horizontal overflow and what sticks out, (2) text cut by a clipping
   ancestor (overflow hidden), (3) text boxes that overlap other text boxes, (4) text under 13 px.
   Usage: node tools/overlap-audit-1023.mjs <base> <out.json> [/route,...] [1280,1180,1024,900,768,430] */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const [base = 'http://localhost:5177', out = 'public/polish/overlap-audit.json', only, widthsArg = '1280,1180,1024,900,768,430'] = process.argv.slice(2)
let routes = only ? only.split(',') : null
if (!routes) { const idx = JSON.parse(fs.readFileSync('public/polish/after/index.json', 'utf8')); routes = idx.pages.map(p => p.url) }
routes = routes.filter(r => !/booth|portal|codex|presentation/.test(r))
const widths = widthsArg.split(',').map(Number)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new',
  args: ['--use-angle=metal', '--enable-gpu', '--hide-scrollbars', '--window-size=1440,900'] })
const p = await b.newPage()
const all = {}
for (const width of widths) {
  await p.setViewport({ width, height: 900, deviceScaleFactor: 1, isMobile: width < 700, hasTouch: width < 700 })
  for (const r of routes) {
    try { await p.goto(base + r, { waitUntil: 'networkidle2', timeout: 90000 }) } catch (e) { (all[r] = all[r] || {})[width] = { error: String(e.message).slice(0, 100) }; continue }
    await new Promise(w => setTimeout(w, 1200))
    await p.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 600) { window.scrollTo(0, y); await new Promise(w => setTimeout(w, 70)) } window.scrollTo(0, 0); await new Promise(w => setTimeout(w, 500)) })
    const res = await p.evaluate(() => {
      const W = innerWidth
      const txt = el => (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim()
      const path = el => { const bits = []; let e = el; while (e && e !== document.body && bits.length < 4) { bits.unshift(e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '')); e = e.parentElement } return bits.join(' > ') }
      const inAdmin = el => !!el.closest('.bmws, [class*="bmws"]')
      const shown = el => { try { return el.checkVisibility({ opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true }) } catch (e) { return !!el.getClientRects().length } }
      const F = { overflow: null, wide: [], clipped: [], overlap: [], small: [] }
      /* 1. horizontal overflow */
      const sw = document.documentElement.scrollWidth
      if (sw > W + 2) {
        F.overflow = sw - W
        const wide = []
        for (const el of document.querySelectorAll('body *')) { if (!shown(el) || inAdmin(el)) continue; const r = el.getBoundingClientRect(); if (r.right > W + 2 && r.width > 20 && r.width < W * 2) wide.push({ at: path(el), out: Math.round(r.right - W), w: Math.round(r.width) }) }
        wide.sort((a, b) => b.out - a.out); F.wide = wide.slice(0, 8)
      }
      /* text-bearing elements */
      const SEL = 'h1,h2,h3,h4,h5,p,li,dt,dd,span,a,b,strong,em,i,small,figcaption,label,button,time,td,th,summary'
      const textEls = [...document.querySelectorAll(SEL)].filter(el => !inAdmin(el) && shown(el) && [...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim()))
      /* 2. clipped by an ancestor that hides overflow */
      const clipAnc = el => { let a = el.parentElement; while (a && a !== document.body) { const cs = getComputedStyle(a); if (/hidden|clip/.test(cs.overflowX) || /hidden|clip/.test(cs.overflow)) return a; a = a.parentElement } return null }
      for (const el of textEls) {
        const a = clipAnc(el); if (!a) continue
        const r = el.getBoundingClientRect(), ar = a.getBoundingClientRect()
        const cutL = ar.left - r.left, cutR = r.right - ar.right, cut = Math.max(cutL, cutR)
        if (cut > 3 && r.width > 10 && r.height > 6 && r.height < 400) F.clipped.push({ at: path(el), t: txt(el).slice(0, 50), cut: Math.round(cut), side: cutL > cutR ? 'left' : 'right', by: path(a) })
        /* its own box too small for its text (nowrap or fixed width) */
        if (el.scrollWidth > el.clientWidth + 3 && el.clientWidth > 0 && /hidden|clip|ellipsis/.test(getComputedStyle(el).overflowX + getComputedStyle(el).textOverflow)) F.clipped.push({ at: path(el), t: txt(el).slice(0, 50), cut: el.scrollWidth - el.clientWidth, side: 'own', by: 'own box' })
      }
      /* 3. overlapping text boxes: leaves only, different parents, neither inside the other */
      const leaves = textEls.filter(el => !el.querySelector(SEL))
      const boxes = leaves.map(el => ({ el, r: el.getBoundingClientRect() })).filter(x => x.r.width > 8 && x.r.height > 8 && x.r.width < W)
      const over = []
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const A = boxes[i], B = boxes[j]
        if (A.el.parentElement === B.el.parentElement || A.el.contains(B.el) || B.el.contains(A.el)) continue
        const ix = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left), iy = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top)
        if (ix <= 2 || iy <= 2) continue
        const area = ix * iy, small = Math.min(A.r.width * A.r.height, B.r.width * B.r.height)
        if (area > small * 0.2) over.push({ a: path(A.el) + ' "' + txt(A.el).slice(0, 28) + '"', b: path(B.el) + ' "' + txt(B.el).slice(0, 28) + '"', pct: Math.round(100 * area / small) })
      }
      over.sort((a, b) => b.pct - a.pct); F.overlap = over.slice(0, 10)
      /* 4. type under 13 px */
      for (const el of textEls) { const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 12.9) F.small.push({ at: path(el), px: +fs.toFixed(1), t: txt(el).slice(0, 30) }) }
      F.small = F.small.slice(0, 12)
      return F
    })
    ;(all[r] = all[r] || {})[width] = res
    console.log(String(width).padStart(5), r.padEnd(36), `overflow ${res.overflow || 0}  clipped ${res.clipped.length}  overlap ${res.overlap.length}  small ${res.small.length}`)
  }
}
fs.writeFileSync(out, JSON.stringify({ at: new Date().toISOString(), base, widths, pages: all }, null, 1))
console.log('->', out)
await b.close()
