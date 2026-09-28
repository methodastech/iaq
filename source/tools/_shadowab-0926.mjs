import puppeteer from 'puppeteer-core'
const out = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 400000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener () {}, removeEventListener () {}, send () {}, close () {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:57375/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3000)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start', behavior: 'instant' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 120000, polling: 500 }); await sleep(5000)
for (let i = 0; i <= 8; i++) { await p.evaluate(i => { const d = document.querySelector('.db3-frame').contentDocument; [...d.querySelectorAll('#hud2 .h-rail li')][i].click() }, i); await sleep(i === 8 ? 14000 : 6500) }
const nudge = async () => { await p.mouse.move(900, 500); await p.mouse.move(903, 502); await sleep(1200) }
const set = v => p.evaluate(v => { const w = document.querySelector('.db3-frame').contentWindow, hs = w.__iaqBoss.getObjectByName('handover-site'), sh = hs.getObjectByName('iaq-yard-shade'); if (sh) { sh.visible = v; if (v) sh.material.opacity = .6 } w.dispatchEvent(new Event('resize')) }, v)
await set(false); await nudge(); await p.screenshot({ path: `${out}/ab-off.png` })
await set(true); await nudge(); await p.screenshot({ path: `${out}/ab-on.png` })
await b.close()
