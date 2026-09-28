/* 16 Sep: the Culture values row. Are the six scenes actually drawing (they blanked when all six
   shared one clock), are they out of phase with each other, and do the cards read 1 to 6?
   Usage: node tools/probe-culture-values-0916.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const res = {}
for (const w of [1440, 860, 390]) {
  const p = await b.newPage(); const m = w < 768
  await p.setViewport({ width: w, height: 900, deviceScaleFactor: 2, isMobile: m, hasTouch: m })
  const errs = []; p.on('console', e => { if (e.type() === 'error') errs.push(e.text()) }); p.on('pageerror', e => errs.push(String(e)))
  await p.goto('http://localhost:5177/careers/culture', { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(() => document.querySelector('#cu-values').scrollIntoView({ block: 'center' }))
  await new Promise(r => setTimeout(r, 1800))
  const read = () => p.evaluate(() => [...document.querySelectorAll('.vm')].map(v => {
    const parts = [...v.querySelectorAll('svg *')].filter(n => n.getBBox && n.getBBox().width + n.getBBox().height > 0)
    const vis = parts.filter(n => parseFloat(getComputedStyle(n).opacity) > .05).length
    return { live: v.classList.contains('is-live'), parts: parts.length, vis, h: Math.round(v.getBoundingClientRect().height) }
  }))
  const a = await read(); await new Promise(r => setTimeout(r, 700)); const c = await read()
  res[w] = {
    scenes: a.length,
    live: a.filter(x => x.live).length,
    blank: a.filter(x => x.vis === 0).length,
    zeroHeight: a.filter(x => x.h < 40).length,
    movedBetweenSamples: a.filter((x, i) => x.vis !== c[i].vis).length,
    visSpread: [...new Set(a.map(x => x.vis))].length,
    numerals: await p.evaluate(() => [...document.querySelectorAll('.cu-vc-ix')].map(n => n.textContent).join(' ')),
    pageOverflow: await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    errors: errs,
  }
  const el = await p.$('#cu-values')
  await el.screenshot({ path: `${OUT}/culture-values-${w}.png` })
  await p.close()
}
console.log(JSON.stringify(res, null, 1))
await b.close()
