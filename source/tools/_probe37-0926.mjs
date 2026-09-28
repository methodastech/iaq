import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 120000)
let p = await b.newPage(); await p.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/services/tool-installation?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 3500))
const f = await p.evaluate(() => { const li = document.querySelector('.un-flow li'); const bb = li.querySelector('b'); const rules = []; for (const sh of document.styleSheets) { try { for (const ru of sh.cssRules) { const inner = ru.cssRules ? [...ru.cssRules].map(x => [x, ru.conditionText || '']) : [[ru, '']]; for (const [r, c] of inner) if (r.selectorText && bb.matches(r.selectorText) && /font/.test(r.cssText)) rules.push(c + ' | ' + r.cssText.slice(0, 150)) } } catch (e) {} } return { b: getComputedStyle(bb).fontSize, rules } })
await p.close()
console.log(JSON.stringify(f)); await b.close(); process.exit(0)
p = 0
await p.goto('x?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 3500))
await p.evaluate(() => { const e = document.querySelector('.un-cycle'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY) }); await new Promise(r => setTimeout(r, 1500))
const c = await p.evaluate(() => { const s = document.querySelector('.un-cyc'); const r = s.getBoundingClientRect(); const fit = s.querySelector('.cyc-fit, svg'); return { cyc: [Math.round(r.left), Math.round(r.right)], fit: fit && [fit.tagName, Math.round(fit.getBoundingClientRect().width)], over: getComputedStyle(s).overflow } })
await p.screenshot({ path: `${OUT}/epc-m-cyc.png` })
console.log(JSON.stringify({ f, c })); await b.close(); process.exit(0)
