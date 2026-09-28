import puppeteer from 'puppeteer-core'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
await p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 200))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
await p.goto('http://localhost:57375/?nointro=1', { waitUntil: 'networkidle2', timeout: 60000 }); await sleep(2000)
await p.evaluate(() => document.querySelector('#build3d') && document.querySelector('#build3d').scrollIntoView({ block: 'start' }))
let ok = false; try { await p.waitForFunction(() => { const f = document.querySelector('.db3-frame'); return f && f.contentDocument && f.contentDocument.querySelector('#overlay.hidden') }, { timeout: 60000, polling: 500 }); ok = true } catch (e) {}
console.log('3D ready', ok, 'errors', JSON.stringify(errs.slice(0, 4))); await b.close()
