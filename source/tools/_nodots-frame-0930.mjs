import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox', '--use-angle=metal'] })
for (const block of [true, false]) {
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
  await p.setRequestInterception(true); p.on('request', r => (block && r.url().includes('iaq-nodots')) ? r.abort() : r.continue())
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 100)))
  await p.goto('http://localhost:5177/3d/index.html', { waitUntil: 'networkidle2', timeout: 60000 }); await new Promise(r => setTimeout(r, 5000))
  const r = await p.evaluate(() => { const t = document.body.textContent; const s = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (/pile caps|or scroll|change level|\/ 9/.test(n.nodeValue) && s.length < 5) s.push(n.nodeValue.trim().slice(0, 90)); return { dots: (t.match(/[·•]/g) || []).length, s } })
  console.log(block ? 'WITHOUT override' : 'WITH override   ', JSON.stringify(r), 'errors', errs.length, errs.slice(0, 2))
  await p.close()
}
await b.close()
