import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); const wait = ms => new Promise(r => setTimeout(r, ms)); const out = process.argv[2]; const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:61862/', { waitUntil: 'networkidle0', timeout: 120000 }); await wait(2000)
const top = await p.evaluate(() => document.getElementById('build3d').getBoundingClientRect().top + scrollY)
await p.evaluate(v => scrollTo(0, v), top - 700); await wait(1500); await p.evaluate(v => scrollTo(0, v), top); await wait(9000)
const probe = () => p.evaluate(() => {
  const d = document.querySelector('#build3d iframe').contentDocument, w = d.defaultView; const q = s => d.querySelector(s); const f = e => e ? getComputedStyle(e) : null
  const L = q('#hud2 .h-left'), lb = L.getBoundingClientRect()
  return { fonts: [...d.fonts].filter(x => x.status === 'loaded').map(x => x.family + ' ' + x.weight), headFont: f(q('#hud2 .h-head')).fontFamily.slice(0, 20), seqTT: f(q('#hud2 .h-rail li.on .rd-seq')) ? f(q('#hud2 .h-rail li.on .rd-seq')).textTransform : null, skinTT: f(q('#skin-switch button')).textTransform, speedTT: f(q('#hud2 .h-speed')).textTransform, icon: Math.round(q('#hud2 .h-rail .rd-ic').getBoundingClientRect().width) + '/' + Math.round(q('#hud2 .h-rail .rd-ic svg').getBoundingClientRect().width), railK: L.style.getPropertyValue('--rail-k'), colBottom: Math.round(lb.bottom), frameH: w.innerHeight }
})
const a = await probe(); await p.screenshot({ path: `${out}/db3-prem-top.png`, captureBeyondViewport: false })
await p.mouse.move(900, 500); for (let i = 0; i < 3; i++) { await p.mouse.wheel({ deltaY: 200 }); await wait(2800) }
const b2 = await probe(); await p.screenshot({ path: `${out}/db3-prem-mid.png`, captureBeyondViewport: false })
await p.evaluate(() => document.querySelector('#build3d iframe').contentDocument.getElementById('skin-v3').click()); await wait(2500)
await p.screenshot({ path: `${out}/db3-prem-v2.png`, captureBeyondViewport: false })
await p.evaluate(() => document.querySelector('#build3d iframe').contentDocument.getElementById('skin-v1').click()); await wait(800)
console.log(JSON.stringify({ errs, a, b2 }))
await b.close()
