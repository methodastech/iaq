import { createRequire } from 'module'
const require = createRequire('/Users/zieel/Bazil Claude 3/Websites/iaq website/package.json')
const puppeteer = require('puppeteer-core')
const OUT = process.env.OUT || new URL('../../_reference/newsroom-scrape/shots', import.meta.url).pathname
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [w, h, mob, tag] of [[390, 844, true, 'm'], [1440, 900, false, 'd']]) {
  const p = await b.newPage(); const errs = []
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob })
  await p.goto('http://localhost:5177/news', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 800))
  const facts = await p.$$eval('.nb-facts > div', ds => ds.map(d => { const dt = d.querySelector('dt'); const r = dt.getBoundingClientRect(); return { t: dt.textContent, fs: getComputedStyle(dt).fontSize, x: Math.round(r.left), y: Math.round(r.top) } }))
  const ov = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth])
  await (await p.$('.nb')).screenshot({ path: `${OUT}/final-news-banner-${tag}.png` })
  console.log(tag, JSON.stringify(facts), 'overflow', ov, 'errs', errs.length ? errs : 'none')
  await p.close()
}
await b.close()
