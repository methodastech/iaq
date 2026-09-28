import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--ignore-gpu-blocklist'] })
const out = process.argv[2]; const wait = ms => new Promise(r => setTimeout(r, ms))
for (const [w, h] of [[930, 1000]]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
  await p.goto('http://localhost:61862/', { waitUntil: 'networkidle0', timeout: 120000 }); await wait(2000)
  const top = await p.evaluate(() => document.getElementById('build3d').getBoundingClientRect().top + scrollY)
  await p.evaluate(v => scrollTo(0, v), top - 600); await wait(1500); await p.evaluate(v => scrollTo(0, v), top); await wait(9000)
  await p.evaluate(() => { const d = document.querySelector('#build3d iframe').contentDocument; [...d.querySelectorAll('#hud2 .h-rail li')].pop().click() }); await wait(14000)
  for (const z of [2.4, 2.8, 3.3, 4]) {
    await p.evaluate(z => { document.querySelector('#build3d iframe').contentWindow.__iaqAsm.zoomLevel = z }, z); await wait(2500)
    await p.screenshot({ path: `${out}/w${w}-z${z}.png`, captureBeyondViewport: false })
  }
  await p.close()
}
await b.close(); console.log('done')
