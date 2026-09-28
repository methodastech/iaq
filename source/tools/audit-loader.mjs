import puppeteer from 'puppeteer-core'
const BASE = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })
for (const [w, h, mobile] of [[390, 844, true], [1280, 800, false]]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile })
  const t0 = Date.now(); await p.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 60000 }); const dcl = Date.now() - t0
  let seen = false, gone = null; for (let i = 0; i < 120; i++) { const s = await p.evaluate(() => { const l = document.getElementById('loader'); return { present: !!l, done: !!l && l.classList.contains('ld-done'), hidden: !!l && getComputedStyle(l).display === 'none', pct: document.getElementById('ldPct')?.textContent } }); if (s.present && !seen) seen = { ms: Date.now() - t0, pct: s.pct }; if (seen && (!s.present || s.done || s.hidden)) { gone = { ms: Date.now() - t0, ...s }; break } await new Promise(r => setTimeout(r, 150)) }
  console.log(mobile ? 'phone 390' : 'desktop 1280', '· DCL', dcl + 'ms', '· loader first seen', JSON.stringify(seen), '· lifted at', JSON.stringify(gone))
  await p.close()
}
await b.close()
