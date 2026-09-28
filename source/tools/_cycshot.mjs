import puppeteer from 'puppeteer-core'
const out = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
await p.evaluateOnNewDocument(() => { try { window.__iaqLoaderPlayed = true } catch (e) {} })
await p.goto('http://localhost:57375/services?nointro=1', { waitUntil: 'networkidle2', timeout: 60000 }); await sleep(1000)
await p.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 50)) } })
const y = await p.evaluate(() => { const e = document.querySelector('.cyc-canvas'); return e.getBoundingClientRect().top + scrollY })
await p.evaluate(y => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo({ top: y - 90, behavior: 'instant' }) }, y)
await p.waitForFunction(() => document.querySelector('.cyc-canvas.play'), { timeout: 10000 })
const t0 = Date.now()
const P = 7680, phase = await p.evaluate(() => 0); for (const t of [700, 2600, 4800, 6300, 7500]) {
  await sleep(Math.max(0, t - (Date.now() - t0)))
  const st = await p.evaluate(() => { const r = document.querySelector('.cyc-run'), d = document.querySelector('.cyc-red'); return { run: r.style.strokeDashoffset, ro: r.style.opacity, red: d.style.strokeDashoffset, P: getComputedStyle(document.querySelector('.cyc-canvas')).getPropertyValue('--cycP'), track: getComputedStyle(document.querySelector('.cyc-blue')).stroke, mesh: getComputedStyle(document.querySelector('.cyc-mesh')).display } })
  console.log(t, JSON.stringify(st))
  const top = await p.evaluate(() => Math.round(document.querySelector('.cyc-canvas').getBoundingClientRect().top)); console.log('canvas top in viewport', top); await p.screenshot({ path: `${out}/cyc-${t}.png` })
}
console.log('errors', JSON.stringify(errs)); await b.close()
