import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-gpu'] })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)))
const out = process.argv[2]; const wait = ms => new Promise(r => setTimeout(r, ms))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:52158/services', { waitUntil: 'networkidle0', timeout: 90000 }); await wait(3000)
const cols = await p.evaluate(() => { const q = s => document.querySelector(s); const bot = s => { const e = q(s); const r = e.getBoundingClientRect(); return Math.round(r.bottom) }; return { work: document.querySelectorAll('.rx-w .rx-n').length, workNames: [...document.querySelectorAll('.rx-w .rx-n b')].map(e => e.textContent), systems: document.querySelectorAll('.rx-y .rx-n').length, lastSys: [...document.querySelectorAll('.rx-y .rx-n span')].slice(-3).map(e => e.textContent), uBottom: bot('.rx-u .rx-n:last-child'), wBottom: bot('.rx-w .rx-n:last-child'), hookupCardColor: getComputedStyle(q('.rx-w .rx-n.n-w-s svg')).color } })
// pick PCU & TTI: the fourth work and its systems light, every ribbon one colour
await p.hover('.rx-u .rx-n:nth-child(2)'); await wait(1200)
const pcu = await p.evaluate(() => { const lit = [...document.querySelectorAll('.rx-n.on, .rx-n.me')].map(e => e.className.match(/n-[a-z-]+/)[0] + ':' + (e.querySelector('b') ? e.querySelector('b').textContent : e.querySelector('span').textContent)); const ribs = [...document.querySelectorAll('.rx-lines g.rx-rib')].map(g => { const core = g.querySelector('.rx-rib-core'); const dots = [...g.querySelectorAll('circle')].map(c => c.style.fill); return { kind: g.className.baseVal.match(/k-[swy]/)[0], stroke: getComputedStyle(core).stroke, dots: [...new Set(dots)].length } }); return { litWork: lit.filter(x => x.startsWith('n-w')), litSys: lit.filter(x => x.startsWith('n-y')).length, ribbons: ribs.length, strokesByKind: Object.fromEntries(['k-s', 'k-w', 'k-y'].map(k => [k, [...new Set(ribs.filter(r => r.kind === k).map(r => r.stroke))]])), dualDots: ribs.filter(r => r.dots > 1).length } })
await p.evaluate(() => { const s = document.querySelector('.sm-map-dark.sm-map-full'); document.documentElement.style.marginTop = (-(s.getBoundingClientRect().top + scrollY)) + 'px' }); await wait(1500)
await p.screenshot({ path: `${out}/map-pcu.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } })
await p.evaluate(() => { document.documentElement.style.marginTop = '' })
// pick the fourth work itself, then one of its systems: the reading panel must speak
await p.hover('.rx-w .rx-n.n-w-s'); await wait(900)
const wRead = await p.evaluate(() => ({ text: (document.querySelector('.sm-map-read p') || {}).textContent, ic: !!document.querySelector('.sm-map-read .sm-map-ic svg') }))
await p.hover('.rx-y .rx-n:last-child'); await wait(900)
const yRead = await p.evaluate(() => (document.querySelector('.sm-map-read p') || {}).textContent)
// the 4 works section still says the same
const works = await p.evaluate(() => [...document.querySelectorAll('.wk-card')].map(c => c.querySelector('h3').firstChild.textContent + ' | ' + [...c.querySelectorAll('.wk-units b')].map(b => b.textContent).join(',') + ' | ' + [...c.querySelectorAll('.wk-sys li')].length + ' systems'))
// the cycle marks: fitted, same box; hover animates
const cyc = await p.evaluate(() => { const svgs = [...document.querySelectorAll('.cyc-mk svg')]; return { fitted: svgs.filter(s => s.dataset.fit).length, boxes: svgs.map(s => { const r = s.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height) }), views: svgs.map(s => s.getAttribute('viewBox').split(' ').map(Number).map(n => Math.round(n)).join(',')) } })
const node = await p.$('.cyc-node:nth-of-type(2)'); if (node) { await node.hover(); await wait(300) }
const hov = await p.evaluate(() => { const n = [...document.querySelectorAll('.cyc-node')].find(e => e.matches(':hover')); return n ? getComputedStyle(n.querySelector('.cyc-disc')).animationName : 'no hover' })
console.log(JSON.stringify({ errs, cols, pcu, wRead, yRead, works, cyc, hov }, null, 1))
await b.close()
