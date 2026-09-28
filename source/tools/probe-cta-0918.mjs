// 18 Sep: the primary button, nav and hero, at rest and on hover.
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
const errs = []; p.on('pageerror', e => errs.push(String(e)))
await p.goto('http://localhost:5177/', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2500))
const info = await p.evaluate(() => [...document.querySelectorAll('.cta, .cta-ghost')].filter(e => e.offsetParent).slice(0, 5).map(e => { const c = getComputedStyle(e), r = e.getBoundingClientRect(); return e.textContent.trim() + ' | ' + c.textTransform + ' ' + c.fontSize + ' ' + c.letterSpacing + ' h' + Math.round(r.height) + ' radius ' + c.borderRadius }))
console.log(info.join('\n'))
const nav = (await p.$$('.nav .cta')).length ? await p.evaluateHandle(() => [...document.querySelectorAll('.nav .cta')].find(e => e.getBoundingClientRect().width > 0)) : null
const bb = await nav.boundingBox()
await p.screenshot({ path: OUT + '/cta-nav.png', clip: { x: bb.x - 360, y: bb.y - 14, width: bb.width + 380, height: bb.height + 28 } })
await nav.hover(); await new Promise(r => setTimeout(r, 400))
await p.screenshot({ path: OUT + '/cta-nav-hover.png', clip: { x: bb.x - 360, y: bb.y - 14, width: bb.width + 380, height: bb.height + 34 } })
const hero = await p.$('.hero-ctas'); if (hero) await hero.screenshot({ path: OUT + '/cta-hero.png' })
console.log('errors', errs.length)
await b.close()
