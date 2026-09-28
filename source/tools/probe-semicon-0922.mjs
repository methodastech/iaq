/* 22 Sep: the /semicon booth page at 1440 and 390 on the real GPU. Full-page shots, errors, overflow,
   red phrases that wrap, and the contact hand-off. Usage: node tools/probe-semicon-0922.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 300000,
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--no-sandbox'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
for (const [w, h, tag] of [[1440, 900, 'd'], [390, 844, 'm']]) {
  const p = await b.newPage(); const errs = []
  p.on('pageerror', e => errs.push('PAGE ' + String(e).slice(0, 240))); p.on('console', e => { if (e.type() === 'error') errs.push(e.text().slice(0, 240)) })
  await p.setViewport({ width: w, height: h, deviceScaleFactor: tag === 'm' ? 2 : 1 })
  await p.goto('http://localhost:5177/semicon', { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(2500)
  for (let y = 0; y < 12000; y += 700) { await p.evaluate(y => window.scrollTo(0, y), y); await wait(160) }
  await wait(1500); await p.evaluate(() => window.scrollTo(0, 0)); await wait(600)
  const info = await p.evaluate(() => {
    const vw = document.documentElement.clientWidth
    const wrapped = [...document.querySelectorAll('.sm-hero h1 em, .sm-h h2 em, .sm-eu h2 em')].filter(e => e.getClientRects().length > 1).map(e => e.textContent)
    const spill = [...document.querySelectorAll('main *, .sm-hero *, .sm-sec *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.right > vw + 1 }).slice(0, 5).map(e => (e.className?.baseVal ?? e.className) + ' ' + Math.round(e.getBoundingClientRect().right))
    return { h: document.documentElement.scrollHeight, overflow: document.documentElement.scrollWidth - vw, wrapped, spill }
  })
  console.log(tag, JSON.stringify(info))
  await p.screenshot({ path: `${OUT}/semicon-${tag}.png`, fullPage: true })
  if (tag === 'd') {
    await p.click('.sm-acts .cta'); await wait(2500)
    console.log('contact', JSON.stringify(await p.evaluate(() => ({ url: location.pathname, svc: document.querySelector('#f-service')?.value, msg: document.querySelector('#f-msg')?.value?.slice(0, 60) }))))
  }
  console.log(tag, 'errs', JSON.stringify(errs))
  await p.close()
}
await b.close()
