import puppeteer from 'puppeteer-core'
const out = process.argv[2], W = +(process.argv[3] || 800), H = +(process.argv[4] || 500), sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: W, height: H })
const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
for (const v of ['fill', 'hq', 'line']) for (const pd of [0.15, 0.5, 0.85]) {
  await p.goto(`http://localhost:57375/loader-lab/index.html?v=${v}&pd=${pd}`, { waitUntil: 'networkidle0', timeout: 60000 }); await sleep(900)
  await p.screenshot({ path: `${out}/${v}-${Math.round(pd * 100)}-${W}.png` })
}
console.log('errors', JSON.stringify(errs.slice(0, 5))); await b.close()
