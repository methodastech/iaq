import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--ignore-gpu-blocklist'] })
const out = process.argv[2]; const wait = ms => new Promise(r => setTimeout(r, ms)); const res = []
for (const [w, h, mob] of [[1440, 760, false], [1280, 720, false], [390, 844, true]]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 120)))
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob })
  await p.goto('http://localhost:61862/', { waitUntil: 'networkidle0', timeout: 120000 }); await wait(2000)
  const top = await p.evaluate(() => document.getElementById('build3d').getBoundingClientRect().top + scrollY)
  await p.evaluate(v => scrollTo(0, v), top - 600); await wait(1500); await p.evaluate(v => scrollTo(0, v), top)
  await p.waitForFunction(() => { const f = document.querySelector('#build3d iframe'); return f && f.contentDocument && f.contentDocument.querySelector('#hud2 .h-left') }, { timeout: 60000 }).catch(() => {}); await wait(7000)
  const m = await p.evaluate(() => { const fr = document.querySelector('#build3d iframe'); if (!fr) return { noFrame: true, cls: document.getElementById('build3d').className }; const d = fr.contentDocument, fw = d.defaultView; const L = d.querySelector('#hud2 .h-left'); const lb = L && L.getBoundingClientRect(); const cut = [...d.querySelectorAll('#hud2 .h-left *, #skin-switch, #view-tools button')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && getComputedStyle(e).visibility !== 'hidden' && (r.bottom > fw.innerHeight + 1 || r.right > fw.innerWidth + 1 || r.left < -1) }).map(e => e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0]).slice(0, 5); return { railK: L ? L.style.getPropertyValue('--rail-k') : null, colBottom: lb ? Math.round(lb.bottom) : null, frameH: fw.innerHeight, cut, docW: document.documentElement.scrollWidth } })
  await p.screenshot({ path: `${out}/db3-prem-${w}x${h}.png`, captureBeyondViewport: false })
  res.push({ w, h, errs, ...m }); await p.close()
}
console.log(JSON.stringify(res))
await b.close()
