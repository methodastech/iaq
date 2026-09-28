import puppeteer from 'puppeteer-core'
const out = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { const WS = window.WebSocket; window.WebSocket = function (u, pr) { if (String(pr).includes('vite')) return { addEventListener() {}, removeEventListener() {}, send() {}, close() {}, readyState: 0 }; return new WS(u, pr) } })
const errs = []; p.on('pageerror', e => errs.push(String(e.message || e).slice(0, 200))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
await p.goto('http://localhost:57375/services?nointro=1', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(4000)
await p.evaluate(() => document.querySelector('.fr-canvas').scrollIntoView({ block: 'center' })); await sleep(9000)
const res = {}
for (const name of ['MEP', 'Process utilities', 'Fire protection']) {
  const ok = await p.evaluate(n => { const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => e.textContent.trim().replace(/\s+/g, ' ').startsWith(n)); if (!el) return false; el.click(); return true }, name)
  await sleep(3500)
  res[name] = await p.evaluate(() => [...document.querySelectorAll('.fr-lab')].filter(l => l.style.opacity === '1').map(l => { const r = l.getBoundingClientRect(), i = l.querySelector('i').getBoundingClientRect(), bb = l.querySelector('b').getBoundingClientRect(); return { cls: l.className.replace('fr-lab', '').trim(), tag: [Math.round(bb.x), Math.round(bb.y), Math.round(bb.width), Math.round(bb.height)], pt: [Math.round(i.x), Math.round(i.y), Math.round(i.width), Math.round(i.height)], bg: getComputedStyle(l.querySelector('b')).backgroundColor, stem: getComputedStyle(l.querySelector('i')).height } }))
  await p.screenshot({ path: `${out}/lab-${name.replace(/\s+/g, '')}.png` })
}
console.log(JSON.stringify(res)); console.log('errors', JSON.stringify(errs.slice(0, 4))); await b.close()
