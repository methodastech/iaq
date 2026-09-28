/* 22 Sep (Bazil: "why footer repeat logo and so tall"): on every main route, every IAQ logo from the closing band down,
   and the height of each part of the band. Usage: node tools/probe-footlogo-0922.mjs */
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--no-sandbox'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
for (const route of ['/', '/about', '/services', '/services/epc-construction', '/markets', '/projects', '/news', '/careers', '/contact', '/about/history']) {
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
  await p.goto('http://localhost:5177' + route, { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(3500)
  const r = await p.evaluate(() => {
    const bands = [...document.querySelectorAll('.close3d')]
    const band = bands[bands.length - 1]; if (!band) return { none: true }
    const top = band.getBoundingClientRect().top
    const logos = [...document.querySelectorAll('img[src*="iaq-logo"], .flogo3d')].filter(e => !e.closest('.flogo3d-in') || e.classList.contains('flogo3d'))
      .filter(e => e.getBoundingClientRect().top >= top - 5 && e.getBoundingClientRect().height > 0)
      .map(e => (e.closest('[class]').className + '').slice(0, 30) + '@' + Math.round(e.getBoundingClientRect().top - top) + ' h' + Math.round(e.getBoundingClientRect().height))
    const part = sel => { const e = band.querySelector(sel); return e ? Math.round(e.getBoundingClientRect().height) : null }
    return { bands: bands.length, cls: band.className, total: Math.round(band.getBoundingClientRect().height), top: part('.cb-top'), map: part('.cb-map'), sign: part('.cb-sign'), base: part('.f-base'), rib: part('.bm-footrib-strip'),
      fnav: band.querySelectorAll('.f-nav').length, logos, pad: getComputedStyle(band).paddingTop }
  })
  console.log(route.padEnd(28), JSON.stringify(r))
  await p.close()
}
await b.close()
