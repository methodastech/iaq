import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--ignore-gpu-blocklist'] })
const res = []
for (const [w, h, mob] of [[1440, 900, false], [390, 844, true]]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob })
  await p.goto('http://localhost:61862/', { waitUntil: 'networkidle0', timeout: 120000 }); await new Promise(r => setTimeout(r, 2000))
  const top = await p.evaluate(() => document.getElementById('build3d').getBoundingClientRect().top + scrollY)
  await p.evaluate(v => scrollTo(0, v), top - 600); await new Promise(r => setTimeout(r, 1200)); await p.evaluate(v => scrollTo(0, v), top); await new Promise(r => setTimeout(r, 9000))
  const m = await p.evaluate(() => { const a = document.querySelector('.db3-load-ghost').getBoundingClientRect(), g = document.querySelector('.db3-ghost').getBoundingClientRect(); const d = document.querySelector('#build3d iframe').contentDocument; const eyes = [...d.querySelectorAll('#hud2 .h-rail li .iaq-eye')].map(e => getComputedStyle(e).opacity); return { loaderBox: [a.left, a.top, a.width, a.height].map(Math.round), stageBox: [g.left, g.top, g.width, g.height].map(Math.round), eyeOpacities: [...new Set(eyes)] } })
  res.push({ w, ...m }); await p.close()
}
console.log(JSON.stringify(res))
await b.close()
