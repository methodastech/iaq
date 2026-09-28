// 18 Sep: "check all section no bug no overlapping". Every visible line of text on /portal/codex is measured;
// reports text that collides with other text, text cut off by its box, and anything past the page edge.
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
for (const [w, h] of [[1440, 900], [1024, 800], [390, 844]]) {
  const p = await b.newPage(); const errs = []
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
  await p.goto('http://localhost:5177/?admin', { waitUntil: 'networkidle0' })
  await p.goto('http://localhost:5177/portal/codex?admin', { waitUntil: 'networkidle0' })
  // walk down so every reveal and lazy image runs, open every details, stop the tours
  await p.evaluate(async () => {
    document.querySelectorAll('details').forEach(d => d.open = true)
    for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)) }
    scrollTo(0, 0); await new Promise(r => setTimeout(r, 800))
  })
  const r = await p.evaluate(() => {
    const vis = el => { for (let e = el; e && e !== document.body; e = e.parentElement) { if (e.matches && e.matches('.faq-g:not(.is-open) .faq-gl, .faq-a[aria-hidden="true"]')) return false; const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < .05) return false; if ((s.position === 'absolute' && (e.getBoundingClientRect().width <= 2 || s.clip !== 'auto' || /inset/.test(s.clipPath)))) return false } return true }
    const sr = e => /(^|\s)(sm3-sr|sr-only|visually-hidden|vh)(\s|$)/.test(e.className || '')
    const scroller = e => { for (let x = e; x && x !== document.body; x = x.parentElement) { const s = getComputedStyle(x); if (/auto|scroll/.test(s.overflowX)) return true } return false }
    const main = document.querySelector('.pt') || document.body
    const tw = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, { acceptNode: n => n.nodeValue.trim() && !n.parentElement.closest('svg, .bmws, .pt-bar, [aria-hidden="true"]') ? 1 : 3 })
    const boxes = []
    while (tw.nextNode()) {
      const n = tw.currentNode, el = n.parentElement
      if (!vis(el) || el.closest('.sm3-sr, .sr-only, .visually-hidden')) continue
      const rg = document.createRange(); rg.selectNodeContents(n)
      for (const q of rg.getClientRects()) if (q.width > 2 && q.height > 2) boxes.push({ el, x: q.left, y: q.top + scrollY, r: q.right, b: q.bottom + scrollY, t: n.nodeValue.trim().slice(0, 40) })
    }
    const sec = el => { const s = el.closest('section, .cxs, .rx, .fs, .sm3 > div'); return s ? (s.id || s.className.split(' ').slice(0, 2).join('.')) : '?' }
    // text on text
    boxes.sort((a, c) => a.y - c.y)
    const hits = []
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length && boxes[j].y < boxes[i].b; j++) {
      const a = boxes[i], c = boxes[j]
      if (a.el === c.el || a.el.contains(c.el) || c.el.contains(a.el)) continue
      const ox = Math.min(a.r, c.r) - Math.max(a.x, c.x), oy = Math.min(a.b, c.b) - Math.max(a.y, c.y)
      if (ox > 3 && oy > 4) hits.push(sec(a.el) + ' :: "' + a.t + '" x "' + c.t + '"')
    }
    // text cut off by an overflow:hidden box
    const cut = []
    document.querySelectorAll('.pt *').forEach(e => {
      const s = getComputedStyle(e); if (!/hidden|clip/.test(s.overflow + s.overflowY + s.overflowX) || !e.textContent.trim() || !vis(e)) return
      if (e.closest('svg') || e.matches('.cxs, .cxs-wrap') || sr(e) || e.closest('.sm3-sr')) return
      if (e.scrollHeight - e.clientHeight > 3 || e.scrollWidth - e.clientWidth > 3) cut.push(sec(e) + ' :: ' + e.tagName + '.' + (e.className || '') + ' +' + (e.scrollHeight - e.clientHeight) + 'h +' + (e.scrollWidth - e.clientWidth) + 'w "' + e.textContent.trim().slice(0, 40) + '"')
    })
    // past the right edge (outside scrollers)
    const past = boxes.filter(q => q.r > innerWidth + 1 && !scroller(q.el)).map(q => sec(q.el) + ' :: "' + q.t + '" right ' + Math.round(q.r))
    return { n: boxes.length, hits: [...new Set(hits)], cut: [...new Set(cut)], past: [...new Set(past)], pageOver: document.documentElement.scrollWidth - innerWidth }
  })
  console.log(`\n== ${w}px: ${r.n} text boxes · overlaps ${r.hits.length} · cut ${r.cut.length} · past edge ${r.past.length} · page overflow ${r.pageOver} · errors ${errs.length}`)
  r.hits.slice(0, 25).forEach(x => console.log('  OVERLAP', x)); r.cut.slice(0, 15).forEach(x => console.log('  CUT', x)); r.past.slice(0, 10).forEach(x => console.log('  PAST', x)); errs.slice(0, 3).forEach(x => console.log('  ERR', x))
  await p.close()
}
await b.close()
