import { createRequire } from 'module'
const require = createRequire('/Users/zieel/Bazil Claude 3/Websites/iaq website/package.json')
const puppeteer = require('puppeteer-core')
const OUT = process.env.OUT || new URL('../../_reference/newsroom-scrape/shots', import.meta.url).pathname
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const sleep = ms => new Promise(r => setTimeout(r, ms))
async function go (url, w, h, mob) {
  const p = await b.newPage(); const errs = []
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob })
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await p.goto('http://localhost:5177' + url, { waitUntil: 'networkidle0' }); await sleep(800)
  return { p, errs }
}
async function cap (p, sel, path) {
  await p.evaluate(async s => {
    const root = document.querySelector(s); const im = [...root.querySelectorAll('img')]; im.forEach(i => { i.loading = 'eager' })
    await Promise.all(im.map(i => (i.complete && i.naturalWidth) ? 0 : new Promise(r => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); setTimeout(r, 6000) })))
    for (const e of document.querySelectorAll('body *')) { const pos = getComputedStyle(e).position; if (pos === 'fixed' || pos === 'sticky') e.style.setProperty('position', 'absolute', 'important') }
  }, sel)
  await sleep(300); await (await p.$(sel)).screenshot({ path })
}
{ const { p, errs } = await go('/news/lim-kar-leang-20-years', 1440, 900, false)
  await p.screenshot({ path: OUT + '/final-article-top-d.png' })
  await cap(p, '.ar-proj', OUT + '/final-article-projects-d.png')
  await cap(p, '.ar-more', OUT + '/final-article-more-d.png')
  console.log('d errs', errs); await p.close() }
{ const { p, errs } = await go('/news/lim-kar-leang-20-years', 390, 844, true)
  await p.screenshot({ path: OUT + '/final-article-top-m.png' })
  console.log('m errs', errs); await p.close() }
{ const { p, errs } = await go('/news/johor-data-centre-hub', 1440, 900, false)
  await p.screenshot({ path: OUT + '/final-article-fallback-top-d.png' })
  console.log('fallback errs', errs); await p.close() }
await b.close()
