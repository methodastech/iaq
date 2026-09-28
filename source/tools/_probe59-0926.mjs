import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 200000)
const res = {}
for (const [w, h] of [[1440, 900], [1180, 820], [390, 844]]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: h, isMobile: w < 500, hasTouch: w < 500 })
  const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 140)))
  await p.goto('http://localhost:5177/careers?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 3500))
  await p.evaluate(() => { const e = document.querySelector('.cr-band'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 100) }); await new Promise(r => setTimeout(r, 1500))
  res['careers' + w] = await p.evaluate(() => { const hb = document.querySelector('.cr-band .hb').getBoundingClientRect(); const els = [...document.querySelectorAll('.cr-band .head h2, .cr-band .head .lede, .cr-band .hchip, .cr-band .eyebrow')]
    const over = els.filter(e => { const r = e.getBoundingClientRect(); return r.width && r.right > hb.left + 2 && r.left < hb.right && r.bottom > hb.top && r.top < hb.bottom }).map(e => e.className || e.tagName)
    return { hbLeft: Math.round(hb.left), hbW: Math.round(hb.width), over, op: getComputedStyle(document.querySelector('.cr-band .hb img')).opacity, errs: 0 } })
  const el = await p.$('.cr-band'); await el.screenshot({ path: `${OUT}/cb-${w}.png` }); await p.close()
}
{ const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
  await p.goto('http://localhost:5177/services/energy-management?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 2500))
  await p.evaluate(() => { const e = document.querySelector('.dcs3-stage'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 140) }); await new Promise(r => setTimeout(r, 6000))
  await p.evaluate(() => document.querySelector('.dcs3-num[data-k="net"]').click()); await new Promise(r => setTimeout(r, 2800))
  const w = await p.$('.dcs3-wrap'); await w.screenshot({ path: `${OUT}/dcs-sq.png` })
  res.dcs = await p.evaluate(() => ({ num: getComputedStyle(document.querySelector('.dcs3-num')).borderRadius, n: getComputedStyle(document.querySelector('.dcs3-steps .n')).borderRadius }))
  await p.close() }
console.log(JSON.stringify(res, null, 1)); await b.close(); process.exit(0)
