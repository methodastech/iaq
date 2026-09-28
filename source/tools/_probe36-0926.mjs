import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 240000)
const res = {}
for (const [r, t] of [['epc-construction', 'epc'], ['tool-installation', 'tool'], ['energy-management', 'efm']]) {
  for (const [w, h, tag] of [[1440, 900, 'd'], [375, 812, 'm']]) {
    const p = await b.newPage(); await p.setViewport({ width: w, height: h, isMobile: w < 500, hasTouch: w < 500, deviceScaleFactor: w < 500 ? 2 : 1 })
    const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 140)))
    await p.goto('http://localhost:5177/services/' + r + '?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 3500))
    const H = await p.evaluate(() => document.documentElement.scrollHeight); for (let y = 0; y < H; y += 500) { await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 120)) }
    await new Promise(r => setTimeout(r, 1500))
    res[t + tag] = await p.evaluate(() => { const vw = document.documentElement.clientWidth
      const wide = [...document.querySelectorAll('.un-page *')].filter(e => { const b = e.getBoundingClientRect(); return b.width && b.right > vw + 1 && !e.closest('.un-hero-fig, .dcs3-stage, .un-mo, svg') }).slice(0, 4).map(e => (e.className.baseVal ?? e.className).toString().slice(0, 30) + ':' + Math.round(e.getBoundingClientRect().right))
      const hid = [...document.querySelectorAll('.un-page h2, .un-page h3')].filter(h => parseFloat(getComputedStyle(h).opacity) < .5).map(h => h.textContent.slice(0, 24))
      return { docW: document.documentElement.scrollWidth, vw, wide, hid } })
    res[t + tag].errs = errs
    if (tag === 'd' && t !== 'tool') { const el = await p.$('.un-deliver'); await p.evaluate(() => { const e = document.querySelector('.un-deliver'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 80) }); await new Promise(r => setTimeout(r, 1200)); await el.screenshot({ path: `${OUT}/${t}-why.png` }) }
    if (tag === 'd' && t === 'epc') { const el = await p.$('.un-cycle-stick'); await p.evaluate(() => { const e = document.querySelector('.un-cycle'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY + 200) }); await new Promise(r => setTimeout(r, 1500)); await el.screenshot({ path: `${OUT}/epc-cyc.png` }) }
    if (tag === 'm' && t === 'tool') { await p.evaluate(() => { const e = document.querySelector('.un-svc7'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 60) }); await new Promise(r => setTimeout(r, 1200)); await p.screenshot({ path: `${OUT}/tool-m-flow.png` }) }
    await p.close()
  }
}
console.log(JSON.stringify(res)); await b.close(); process.exit(0)
