import puppeteer from 'puppeteer-core'
const out = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 900, height: 560, deviceScaleFactor: 2 })
const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
for (const [v, pd] of [['fill', 1], ['v4', 1], ['v4', 0.5]]) {
  await p.goto(`http://localhost:57375/loader-lab/index.html?v=${v}&pd=${pd}`, { waitUntil: 'networkidle2', timeout: 60000 }); await sleep(2500)
  const al = await p.evaluate(() => { const k = document.getElementById('knock'), l = document.getElementById('logo'); const a = k.getBoundingClientRect(), c = l.getBoundingClientRect(); return { knockShown: getComputedStyle(k).display, dx: Math.round(a.left - c.left), dy: Math.round(a.top - c.top), dw: Math.round(a.width - c.width) } })
  console.log(v, pd, JSON.stringify(al))
  await p.screenshot({ path: `${out}/lab-${v}-${pd}.png` })
}
console.log('errors', JSON.stringify(errs)); await b.close()
