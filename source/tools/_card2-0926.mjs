import puppeteer from 'puppeteer-core'
/* 26 Sep: the refined card, reached the way a visitor reaches it (chapter after chapter).
   node tools/_card2-0926.mjs <outdir> <W> <H> <lastRow> [classic] */
const out = process.argv[2], W = +process.argv[3] || 1440, H = +process.argv[4] || 900, last = +(process.argv[5] ?? 8), classic = process.argv[6] === 'classic'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 400000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); await p.setViewport({ width: W, height: H, deviceScaleFactor: 2 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener () {}, removeEventListener () {}, send () {}, close () {}, readyState: 0 }; return new WS(u, pr) } })
const errs = []; p.on('pageerror', e => errs.push(String(e.message || e).slice(0, 200)))
await p.goto('http://localhost:57375/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3000)
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start', behavior: 'instant' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 120000, polling: 500 }); await sleep(5000)
if (classic) { await p.evaluate(() => document.querySelector('.db3-frame').contentDocument.getElementById('skin-v1').click()); await sleep(6000) }
for (let i = 0; i <= last; i++) { await p.evaluate(i => { const d = document.querySelector('.db3-frame').contentDocument; [...d.querySelectorAll('#hud2 .h-rail li')][i].click() }, i); await sleep(i === 8 ? 12000 : 7000) }
const m = await p.evaluate(() => { const d = document.querySelector('.db3-frame').contentDocument, w = d.defaultView, on = d.querySelector('#hud2 .h-rail li.on'), c = (e, k) => e ? w.getComputedStyle(e)[k] : null
  return { on: on && on.querySelector('.rd-t').textContent.trim(), seq: c(on && on.querySelector('.rd-seq'), 'color'), ct: c(on && on.querySelector('.rd-ct'), 'color'), seqOp: c(on && on.querySelector('.rd-seq'), 'opacity'), liOp: c(on, 'opacity'), bar: on && [...[on.querySelector('.rd-bar')].map(x => { const r = x.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right)] })][0], left: (() => { const r = d.querySelector('#hud2 .h-left').getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right), Math.round(r.top), Math.round(r.bottom)] })(), ih: w.innerHeight, pageY: Math.round(scrollY) } })
console.log(W, classic ? 'classic' : 'env', JSON.stringify(m), 'errors', JSON.stringify(errs.slice(0, 4)))
await p.screenshot({ path: `${out}/c2-${W}${classic ? '-classic' : ''}-r${last}.png` })
await b.close()
