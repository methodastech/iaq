// text on text, text cut by its box, text past the edge: the public pages that changed today, three widths
import puppeteer from 'puppeteer-core'
const ROUTES = process.argv.slice(2).length ? process.argv.slice(2) : ['/', '/services', '/about', '/markets', '/careers', '/contact', '/projects']
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
let bad = 0
for (const route of ROUTES) for (const [w, h] of [[1440, 900], [1024, 800], [390, 844]]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)))
  await p.setViewport({ width: w, height: h })
  await p.goto('http://localhost:5177' + route, { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1200))
  await p.evaluate(async () => { document.querySelectorAll('details').forEach(d => d.open = true); for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 70)) } scrollTo(0, 0); await new Promise(r => setTimeout(r, 900)) })
  const r = await p.evaluate(() => {
    const vis = el => { for (let e = el; e && e !== document.body; e = e.parentElement) { if (e.matches && e.matches('.faq-g:not(.is-open) .faq-gl, .faq-a[aria-hidden="true"], .nav-mega:not(.open), .nav-drawer, .lpv:not(.on), .fx-pin b')) return false; const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < .05) return false; if (s.position === 'absolute' && (e.getBoundingClientRect().width <= 2 || s.clip !== 'auto' || /inset/.test(s.clipPath))) return false } return true }
    const scroller = e => { for (let x = e; x && x !== document.body; x = x.parentElement) { const s = getComputedStyle(x); if (/auto|scroll/.test(s.overflowX)) return true } return false }
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: n => n.nodeValue.trim() && !n.parentElement.closest('svg, .bmws, script, style, noscript, [aria-hidden="true"], .sr-only, .visually-hidden') ? 1 : 3 })
    const boxes = []
    while (tw.nextNode()) { const n = tw.currentNode, el = n.parentElement; if (!vis(el)) continue; const rg = document.createRange(); rg.selectNodeContents(n); for (const q of rg.getClientRects()) if (q.width > 2 && q.height > 2) boxes.push({ el, x: q.left, y: q.top + scrollY, r: q.right, b: q.bottom + scrollY, t: n.nodeValue.trim().slice(0, 36) }) }
    const sec = el => { const s = el.closest('section, header, footer'); return s ? (s.id || s.className.split(' ').slice(0, 2).join('.')) : '?' }
    boxes.sort((a, c) => a.y - c.y); const hits = []
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length && boxes[j].y < boxes[i].b; j++) { const a = boxes[i], c = boxes[j]; if (a.el === c.el || a.el.contains(c.el) || c.el.contains(a.el)) continue; const ox = Math.min(a.r, c.r) - Math.max(a.x, c.x), oy = Math.min(a.b, c.b) - Math.max(a.y, c.y); if (ox > 3 && oy > 4) hits.push(sec(a.el) + ' :: "' + a.t + '" x "' + c.t + '"') }
    const cut = []
    document.querySelectorAll('main *, section *, footer *').forEach(e => { const s = getComputedStyle(e); if (!/hidden|clip/.test(s.overflow + s.overflowY + s.overflowX) || !e.textContent.trim() || !vis(e)) return; if (e.closest('svg') || /ellipsis/.test(s.textOverflow) || e.matches('.cxs, .cxs-wrap, .hero, .glance, .fab, .sc-model, .fx-view')) return; if (e.scrollHeight - e.clientHeight > 3 || e.scrollWidth - e.clientWidth > 3) cut.push(sec(e) + ' :: ' + e.tagName + '.' + String(e.className).slice(0, 30) + ' +' + (e.scrollHeight - e.clientHeight) + 'h +' + (e.scrollWidth - e.clientWidth) + 'w "' + e.textContent.trim().slice(0, 30) + '"') })
    const past = boxes.filter(q => q.r > innerWidth + 1 && !scroller(q.el)).map(q => sec(q.el) + ' :: "' + q.t + '" right ' + Math.round(q.r))
    return { n: boxes.length, hits: [...new Set(hits)], cut: [...new Set(cut)], past: [...new Set(past)], over: document.documentElement.scrollWidth - innerWidth }
  })
  const n = r.hits.length + r.cut.length + r.past.length + (r.over > 0 ? 1 : 0) + errs.length; bad += n
  console.log(`${route.padEnd(11)} ${String(w).padStart(4)}  text ${r.n}  overlaps ${r.hits.length}  cut ${r.cut.length}  past ${r.past.length}  overflow ${r.over}  errors ${errs.length}`)
  r.hits.slice(0, 6).forEach(x => console.log('   OVERLAP', x)); r.cut.slice(0, 6).forEach(x => console.log('   CUT', x)); r.past.slice(0, 4).forEach(x => console.log('   PAST', x)); errs.slice(0, 2).forEach(x => console.log('   ERR', x.slice(0, 120)))
  await p.close()
}
console.log('TOTAL faults', bad)
await b.close()
