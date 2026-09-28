import puppeteer from 'puppeteer-core'
const out = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:49996/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3500)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 90000, polling: 500 }); await sleep(2500)
await p.evaluate(() => document.querySelector('.db3-frame').contentDocument.getElementById('skin-v3').click()); await sleep(7000)
await p.mouse.move(900, 400); for (let i = 0; i < 6; i++) { await p.mouse.wheel({ deltaY: 100 }); await sleep(4400) }
const geo = await p.evaluate(() => { const W = document.querySelector('.db3-frame').contentWindow, c = W.__iaqCam, sc = W.__iaqScene; let sun = null, cat = null; sc.traverse(n => { if (n.isDirectionalLight && n.castShadow) sun = n; if (n.name === 'iaq-shadow-catcher') cat = n }); const r = v => [v.x, v.y, v.z].map(x => Math.round(x)); const d = c.getWorldDirection(new c.position.constructor()); return { cam: r(c.position), dir: [d.x, d.y, d.z].map(x => +x.toFixed(2)), sunTgt: r(sun.target.position), cat: cat && { vis: cat.visible, pos: r(cat.position), sc: Math.round(cat.scale.x), op: cat.material.opacity, type: cat.material.type } } })
console.log(JSON.stringify(geo))
const setSun = (x, y, z, op) => p.evaluate((x, y, z, op) => { const W = document.querySelector('.db3-frame').contentWindow, sc = W.__iaqScene; sc.traverse(n => { if (n.isDirectionalLight && n.castShadow) { const v = new n.position.constructor(x, y, z).normalize(); n.position.copy(n.target.position).addScaledVector(v, 120); n.shadow.needsUpdate = true } if (n.name === 'iaq-shadow-catcher' && op) n.material.opacity = op }) }, x, y, z, op)
for (const [k, v] of Object.entries({ a: [90, 140, 60], b: [-90, 140, 60], c: [-90, 140, -60], d: [90, 140, -60] })) { await setSun(...v, 0.5); await sleep(1200); await p.screenshot({ path: `${out}/az-${k}.png` }) }
await b.close()
