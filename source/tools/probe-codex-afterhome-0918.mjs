/* the path that broke: visit the home page first (its industry grid loads .ig-* rules), then open the Codex in the
   same session, and measure the slides */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage(); await page.setViewport({ width: 1440, height: 900 })
const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 200))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
await page.goto('http://localhost:5177/', { waitUntil: 'domcontentloaded', timeout: 90000 }); await new Promise(r => setTimeout(r, 4000))
await page.evaluate(() => localStorage.setItem('iaq.cms.session.v1', '1'))
/* client-side navigation keeps the home page's stylesheets loaded, exactly as a visitor would */
await page.evaluate(() => { history.pushState(null, '', '/portal/codex'); dispatchEvent(new PopStateEvent('popstate')) })
await new Promise(r => setTimeout(r, 4000))
const r = await page.evaluate(() => {
  const s = [...document.querySelectorAll('.cx-set .cxs')]
  const one = s.find(x => x.id === 'slide-1'), five = s.find(x => x.id === 'slide-5')
  const card = one && one.querySelector('.s1-unit'); const cs = card && getComputedStyle(card)
  const p = one && one.querySelector('.cxs-h p'); const pcs = p && getComputedStyle(p)
  return { url: location.pathname, homeCssLoaded: [...document.styleSheets].some(ss => { try { return [...ss.cssRules].some(r => r.selectorText === '.ig-card') } catch (e) { return false } }),
    slides: s.length, cardBg: cs && cs.backgroundColor, cardContainer: cs && cs.containerType, cardH: card && Math.round(card.getBoundingClientRect().height), slideH: one && Math.round(one.getBoundingClientRect().height),
    pFont: pcs && pcs.fontSize, pSpacing: pcs && pcs.letterSpacing, wordSpacing: pcs && pcs.wordSpacing,
    sections: [...document.querySelectorAll('.cx-part .cx-sh h2')].map(h => h.textContent.slice(0, 40)), siteMockBlocks: document.querySelectorAll('[class^="sm3-"], [class*=" sm3-"]').length,
    rx: document.querySelectorAll('.rx-n').length, fs: !!document.querySelector('.fs-frame img') }
})
await page.evaluate(() => document.getElementById('slide-1').scrollIntoView()); await new Promise(r => setTimeout(r, 600))
await page.screenshot({ path: OUT + '/afterhome-slide1.png' })
await page.evaluate(() => document.getElementById('slide-5').scrollIntoView()); await new Promise(r => setTimeout(r, 600))
await page.screenshot({ path: OUT + '/afterhome-slide5.png' })
console.log(JSON.stringify(r)); console.log('errors', errs.length, errs.slice(0, 3))
await browser.close()
