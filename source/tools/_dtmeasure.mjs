import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: +(process.argv[2] || 1440), height: 1000 })
await p.goto('http://localhost:57375/design.html?v=' + Date.now(), { waitUntil: 'networkidle2', timeout: 90000 })
const r = await p.evaluate(() => ['.vp', '.tdr', '.inv-c', '.bcf', '.bck', '.bcb2', '.bck2', '.rr', '.fo>.ab', '.lh>.ab', '.nb>.ab', '.totem>.ab', '.adb', '.sgc', '.dpl'].map(s => { const e = document.querySelector(s); if (!e) return s + ':none'; const q = e.getBoundingClientRect(); const l7 = e.querySelector('.l7,.l5'); return s + ' ' + Math.round(q.width) + 'x' + Math.round(q.height) + (l7 ? ' set ' + Math.round(l7.getBoundingClientRect().height) + 'px' : '') }))
console.log(r.join('\n')); await b.close()
