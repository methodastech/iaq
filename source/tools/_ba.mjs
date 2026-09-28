import puppeteer from 'puppeteer-core'
const out = process.argv[2], page = process.argv[3], tag = process.argv[4], sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.setCacheEnabled(false)
p.evaluateOnNewDocument(() => { try { localStorage.clear() } catch (e) {} })
const errs = []; p.on('pageerror', e => errs.push(String(e.message || e).slice(0, 200)))
await p.goto(`http://localhost:49996/3d/${page}`, { waitUntil: 'domcontentloaded', timeout: 90000 })
await p.waitForFunction(() => document.querySelector('#overlay.hidden'), { timeout: 120000, polling: 500 }); await sleep(3000)
const kick = () => p.evaluate(() => window.dispatchEvent(new Event('resize')))
const shot = async n => { await kick(); await sleep(1500); await p.screenshot({ path: `${out}/${tag}-${n}.png` }) }
const fps = () => p.evaluate(() => new Promise(res => { let n = 0; const t = performance.now(); const f = () => { n++; if (performance.now() - t < 2500) requestAnimationFrame(f); else res(Math.round(n / 2.5)) }; requestAnimationFrame(f) }))
await p.evaluate(() => document.getElementById('skin-v1').click()); await sleep(6000)
await p.mouse.move(900, 450); for (let i = 0; i < 5; i++) { await p.mouse.wheel({ deltaY: 100 }); await sleep(4400) }
await shot('v1-5'); const f1 = await fps()
await p.evaluate(() => document.getElementById('skin-v3').click()); await sleep(7000)
for (let i = 0; i < 5; i++) { await p.mouse.wheel({ deltaY: -100 }); await sleep(3000) }
await shot('v2-0')
for (let i = 0; i < 4; i++) { await p.mouse.wheel({ deltaY: 100 }); await sleep(4400) }
await shot('v2-4'); const f2 = await fps()
for (let i = 0; i < 5; i++) { await p.mouse.wheel({ deltaY: 100 }); await sleep(4400) }
await shot('v2-9')
console.log(tag, 'fps v1', f1, 'v2', f2, 'errors', JSON.stringify(errs.slice(0, 4))); await b.close()
