import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/', { waitUntil: 'domcontentloaded', timeout: 90000 })
await p.waitForSelector('.lp-field', { timeout: 60000 }); await p.waitForFunction(() => { const l = document.getElementById('loader'); return !l || getComputedStyle(l).display === 'none' }, { timeout: 30000 }).catch(() => {})
const sel = ['.lp-field', '#lpStage', '.cring'].find(Boolean)
let el = null; for (const s of ['.lp-field', '#lpStage', '.cring']) { el = await p.$(s); if (el) { console.log('found', s); break } }
if (!el) { console.log('missing'); process.exit(1) }
await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 4500))
await p.addStyleTag({ content: '.bmws,.nav,header.nav{visibility:hidden!important}' })
await el.screenshot({ path: 'public/design/cycle-ring.png' })
console.log(JSON.stringify(await el.evaluate(e => { const r = e.getBoundingClientRect(); return { w: r.width, h: r.height } })))
await b.close()
