/* Viewport screenshots of the fixed pages on a built preview. Usage: node tools/audit-shots.mjs http://localhost:5178 <outDir> */
import puppeteer from 'puppeteer-core'
const [BASE, OUT] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 800 })
const wait = ms => new Promise(r => setTimeout(r, ms))
const go = async (r, w = 1280, h = 800) => { await p.setViewport({ width: w, height: h }); await p.goto(BASE + r, { waitUntil: 'networkidle0', timeout: 60000 }); await wait(900) }
const shot = async name => { await p.screenshot({ path: `${OUT}/${name}.png` }); console.log('shot', name) }
const clipEl = async (sel, name, pad = 24, maxH = 900) => { const box = await p.evaluate((sel, pad) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.max(0, r.top + window.scrollY - pad), height: r.height + pad * 2 } }, sel, pad); if (!box) { console.log('MISSING', sel); return } await p.screenshot({ path: `${OUT}/${name}.png`, clip: { x: 0, y: box.top, width: 1280, height: Math.min(maxH, box.height) }, captureBeyondViewport: true }); console.log('clip', name, Math.round(box.height)) }
await go('/'); await shot('01-home-hero-strip')
await go('/services'); await shot('02-services-top'); await clipEl('[class*=gloss]', '03-services-glossary')
await go('/services/design'); await shot('04-service-design-crumbs')
await go('/markets/ev-battery'); await shot('05-market-ev-crumbs')
await go('/projects/1'); await shot('06-project-1-crumbs')
await go('/contact'); const ie = await p.evaluate(() => { const c = [...document.querySelectorAll('article, li, div')].find(e => /Ireland/.test(e.textContent) && e.textContent.length < 400 && e.querySelector('img')); if (c) { c.id = 'ie-card'; return true } return false }); if (ie) await clipEl('#ie-card', '07-contact-ireland-card', 30, 700); else await shot('07-contact')
await go('/global-presence'); await shot('08-global-presence-top')
await go('/about'); await shot('09-about-top')
await go('/news'); await shot('10-news-top')
await go('/does-not-exist'); await shot('11-404')
await go('/about', 390, 844); await p.evaluate(() => document.querySelector('.nav-burger, [aria-label="Menu"], .burger, button.nb')?.click()); await wait(700); await shot('12-phone-drawer')
await go('/', 390, 844); await shot('13-home-phone')
await b.close()
