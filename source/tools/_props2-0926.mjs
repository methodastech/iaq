import puppeteer from 'puppeteer-core'
/* 26 Sep: the site's machines after the real models load: chapter 1, chapter 3, and the road at handover. */
const out = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 400000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener () {}, removeEventListener () {}, send () {}, close () {}, readyState: 0 }; return new WS(u, pr) } })
const errs = []; p.on('pageerror', e => errs.push(String(e.message || e).slice(0, 200))); p.on('console', m => { if (/fail|error/i.test(m.text())) errs.push('console: ' + m.text().slice(0, 160)) })
await p.goto('http://localhost:57375/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3000)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start', behavior: 'instant' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 120000, polling: 500 }); await sleep(8000)
const info = await p.evaluate(() => { const w = document.querySelector('.db3-frame').contentWindow, bs = w.__iaqBoss, o = []; bs.traverse(x => { if (/Sketchfab_model|RootNode|crane|excav|roller|truck/i.test(x.name || '') && o.length < 12) o.push(x.name) }); const sp = bs.getObjectByName('site-props'); let yellowMaps = 0; sp && sp.traverse(x => { if (x.isMesh) for (const m of [].concat(x.material)) if (m && m.map) yellowMaps++ }); return { names: o, mapsInProps: yellowMaps } })
console.log(JSON.stringify(info))
await p.screenshot({ path: `${out}/p-ch0.png` })
for (let i = 0; i <= 2; i++) { await p.evaluate(i => { const d = document.querySelector('.db3-frame').contentDocument; [...d.querySelectorAll('#hud2 .h-rail li')][i].click() }, i); await sleep(6500) }
await p.screenshot({ path: `${out}/p-ch3.png` })
console.log('errors', JSON.stringify(errs.slice(0, 6))); await b.close()
