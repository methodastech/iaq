import puppeteer from 'puppeteer-core'
const BASE = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 800 })
await p.goto(BASE + (process.argv[3] || '/about'), { waitUntil: 'networkidle0', timeout: 60000 })
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await new Promise(r => setTimeout(r, 1500))
console.log(JSON.stringify(await p.evaluate(() => { const t = document.body.innerText; const c = re => (t.match(re) || []).length; return { footerMounted: !!document.querySelector('.sitefoot, footer'), portalLinks: [...document.querySelectorAll('a[href="/portal"]')].map(a => a.textContent.trim()), staffLogin: c(/staff login/gi), memberPortal: c(/member portal/gi), memberLogin: c(/member login/gi) } })))
await p.setViewport({ width: 390, height: 844 }); await p.goto(BASE + (process.argv[3] || '/about'), { waitUntil: 'networkidle0', timeout: 60000 })
await p.evaluate(() => document.querySelector('.nav-burger, [aria-label="Menu"], .burger, button.nb')?.click()); await new Promise(r => setTimeout(r, 600))
console.log('drawer:', JSON.stringify(await p.evaluate(() => ({ drawerText: [...document.querySelectorAll('a[href="/portal"]')].map(a => a.textContent.trim()) }))))
await b.close()
