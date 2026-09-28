import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--ignore-gpu-blocklist'] })
const out = process.argv[2]; const wait = ms => new Promise(r => setTimeout(r, ms)); const res = []
for (const [w, h, mob, skin] of [[390, 844, true, "v1"]]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob })
  await p.goto('http://localhost:61862/', { waitUntil: 'networkidle0', timeout: 120000 }); await wait(2000)
  const top = await p.evaluate(() => document.getElementById('build3d').getBoundingClientRect().top + scrollY)
  await p.evaluate(v => scrollTo(0, v), top - 600); await wait(1500); await p.evaluate(v => scrollTo(0, v), top); await wait(9000)
  await p.evaluate(s => { const d = document.querySelector('#build3d iframe').contentDocument; d.getElementById('skin-' + s).click() }, skin); await wait(2500)
  await p.evaluate(() => { const d = document.querySelector('#build3d iframe').contentDocument; [...d.querySelectorAll('#hud2 .h-rail li')].pop().click() }); await wait(14000)
  await p.evaluate(() => { const d = document.querySelector('#build3d iframe').contentDocument; const e = [...d.querySelectorAll('#hud2 .h-rail li')].pop().querySelector('.iaq-eye'); e && e.click() }); await wait(2500)
  const m = await p.evaluate(() => { const d = document.querySelector('#build3d iframe').contentDocument, fw = d.defaultView; const eye = [...d.querySelectorAll('#hud2 .h-rail li')].pop().querySelector('.iaq-eye'); const chip = d.getElementById('iaq-xr-chip'); const cr = chip && chip.getBoundingClientRect(); return { eye: eye ? getComputedStyle(eye).display + ' ' + eye.getAttribute('aria-pressed') : null, chip: chip ? chip.textContent : null, chipIn: cr ? (cr.left >= 0 && cr.right <= fw.innerWidth && cr.bottom <= fw.innerHeight) : null, zoom: +fw.__iaqAsm.zoomLevel.toFixed(2) } })
  await p.screenshot({ path: `${out}/xray-${w}-${skin}.png`, captureBeyondViewport: false })
  res.push({ w, skin, errs, ...m }); await p.close()
}
console.log(JSON.stringify(res))
await b.close()
