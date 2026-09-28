import puppeteer from 'puppeteer-core'
const B = process.argv[2] || 'http://localhost:5178'
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })
for (const route of process.argv.slice(3)) {
  const p = await browser.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
  const t0 = Date.now(); await p.goto(B + route, { waitUntil: 'networkidle2', timeout: 60000 }); const t = Date.now() - t0; await new Promise(r => setTimeout(r, 1200))
  const res = await p.evaluate(() => performance.getEntriesByType('resource').map(r => [Math.round((r.transferSize || r.encodedBodySize) / 1024), r.name.replace(location.origin, '')]).sort((a, b) => b[0] - a[0]))
  const nav = await p.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return n ? Math.round(n.domContentLoadedEventEnd) : null })
  console.log(`${route}  total ${res.reduce((a, r) => a + r[0], 0)}K · ${res.length} requests · idle ${t}ms · DCL ${nav}ms`); console.log(res.slice(0, 8).map(r => `   ${String(r[0]).padStart(6)}K ${r[1]}`).join('\n'))
  await p.close()
}
await browser.close()
