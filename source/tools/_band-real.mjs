import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-gpu'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:52158/services', { waitUntil: 'networkidle0', timeout: 90000 }); await new Promise(r => setTimeout(r, 2500))
const read = () => p.evaluate(() => { const band = document.querySelector('.sm-map-dark.sm-map-full'); const r = band.getBoundingClientRect(); const stage = band.querySelector('.sm-map-stage') || band.querySelector('canvas'); const s = stage && stage.getBoundingClientRect(); const side = band.querySelector('.sm-map-side'); const sd = side && side.getBoundingClientRect(); return { scrollY: Math.round(scrollY), bandTop: Math.round(r.top), bandBottom: Math.round(r.bottom), stageBottom: s && Math.round(s.bottom), stageOverflow: s ? Math.round(s.bottom - r.bottom) : null, listsAir: sd ? Math.round(r.bottom - sd.bottom) : null } })
const a = await read()
// a wheel scroll in steps, as a reader would, down to the band's foot
const target = await p.evaluate(() => { const r = document.querySelector('.sm-map-dark.sm-map-full').getBoundingClientRect(); return r.bottom + scrollY - 760 })
let y = 0; while (y < target) { y = Math.min(target, y + 300); await p.mouse.wheel({ deltaY: 300 }); await new Promise(r => setTimeout(r, 120)) }
await new Promise(r => setTimeout(r, 1500))
const c = await read()
await p.screenshot({ path: process.argv[2] + '/svc-band-foot-real.png', clip: { x: 0, y: 0, width: 1440, height: 900 } })
console.log(JSON.stringify({ atTop: a, atFoot: c }))
await b.close()
