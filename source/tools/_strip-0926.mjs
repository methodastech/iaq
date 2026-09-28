import puppeteer from 'puppeteer-core'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener () {}, removeEventListener () {}, send () {}, close () {}, readyState: 0 }; return new WS(u, pr) } })
await p.goto('http://localhost:5177/services?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3500)
const r = await p.evaluate(async () => { document.documentElement.style.scrollBehavior = 'auto'; const s = document.querySelector('.sm-works'); s.scrollIntoView({ block: 'start', behavior: 'instant' }); await new Promise(r => setTimeout(r, 1500)); const hit = document.elementsFromPoint(460, 63).slice(0, 6).map(e => e.tagName + '.' + String(e.className).slice(0, 60)); const hit2 = document.elementsFromPoint(515, 63).slice(0, 6).map(e => e.tagName + '.' + String(e.className).slice(0, 60)); return { hit, hit2 } })
console.log(JSON.stringify(r)); await b.close()
