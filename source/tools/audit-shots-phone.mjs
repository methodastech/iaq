import puppeteer from 'puppeteer-core'
const [BASE, OUT] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
const t0 = Date.now(); await p.goto(BASE + '/', { waitUntil: 'networkidle0', timeout: 60000 })
let state; for (let i = 0; i < 20; i++) { state = await p.evaluate(() => { const l = document.querySelector('.loader, .preload, [class*=loader], [class*=preload]'); const vis = l && getComputedStyle(l).display !== 'none' && getComputedStyle(l).opacity !== '0' && getComputedStyle(l).visibility !== 'hidden'; return { loader: l ? l.className : null, visible: !!vis, text: l ? l.innerText.trim().slice(0, 20) : '', h1: document.querySelector('h1')?.innerText.slice(0, 40) } }); if (!state.visible) break; await new Promise(r => setTimeout(r, 500)) }
console.log('loader gone after ms', Date.now() - t0, JSON.stringify(state))
await new Promise(r => setTimeout(r, 800)); await p.screenshot({ path: `${OUT}/13-home-phone.png` })
await p.evaluate(() => window.scrollTo(0, 560)); await new Promise(r => setTimeout(r, 900)); await p.screenshot({ path: `${OUT}/14-home-phone-strip.png` })
await b.close()
