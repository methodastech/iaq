import puppeteer from 'puppeteer-core'
/* 26 Sep: the walkthrough (Enter the cleanroom): HUD text, states, frames. node tools/_walk-0926.mjs <outdir> [tag] */
const out = process.argv[2], tag = process.argv[3] || 'w', sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 400000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener () {}, removeEventListener () {}, send () {}, close () {}, readyState: 0 }; return new WS(u, pr) } })
const errs = []; p.on('pageerror', e => errs.push(String(e.message || e).slice(0, 200)))
console.log('goto'); await p.goto('http://localhost:57375/?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3000); console.log('loaded')
await p.evaluate(() => document.querySelector('#build3d').scrollIntoView({ block: 'start', behavior: 'instant' }))
await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 120000, polling: 500 }); console.log('ready'); await sleep(5000)
await p.evaluate(() => { const d = document.querySelector('.db3-frame').contentDocument; d.querySelector('#hud2 .h-cta').click() }); await sleep(10000)
const hud = await p.evaluate(() => { const d = document.querySelector('.db3-frame').contentDocument, w = d.defaultView
  const sel = ['#floor-switch .fs-title', '.iaq-fs-tog', '#floor-switch button[aria-current=true]', '.iaq-where', '.iaq-where small', '.iaq-tape', '.rb-seg button', '.rb-icon', '#exit-room', '.iaq-map-tog', '#door-switch .ds-title', '#room-keys']
  return sel.map(s => { const e = d.querySelector(s); if (!e) return s + ': none'; const c = w.getComputedStyle(e); const r = e.getBoundingClientRect(); return `${s}: "${(e.textContent || '').trim().slice(0, 40)}" tt=${c.textTransform} ls=${c.letterSpacing} bg=${c.backgroundColor} vis=${r.width > 0 && c.display !== 'none'}` }).join('\n') })
console.log(hud)
await p.screenshot({ path: `${out}/${tag}1.png` })
await p.keyboard.down('d'); await sleep(900); await p.keyboard.up('d'); await p.keyboard.down('w'); await sleep(1400); await p.keyboard.up('w'); await sleep(1500)
await p.screenshot({ path: `${out}/${tag}2.png` })
console.log('errors', JSON.stringify(errs.slice(0, 4))); await b.close()
