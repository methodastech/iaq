import puppeteer from 'puppeteer-core'
const [BASE, OUT] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 800 })
const go = async r => { await p.goto(BASE + r, { waitUntil: 'networkidle0', timeout: 60000 }); await new Promise(r => setTimeout(r, 600)) }
await go('/about')
const footer = await p.evaluate(() => { const t = document.body.innerText; const c = re => (t.match(re) || []).length; return { staffLogin: c(/staff login/gi), memberPortal: c(/member portal/gi), memberLogin: c(/member login/gi), navLoginAria: document.querySelector('.nav-login')?.getAttribute('aria-label') } })
await go('/policies')
const tabs = await p.evaluate(() => [...document.querySelectorAll('[role=tab]')].map(t => t.querySelector('h3')?.textContent))
const res = {}
for (const name of tabs) {
  await p.evaluate(n => { const t = [...document.querySelectorAll('[role=tab]')].find(t => t.querySelector('h3')?.textContent === n); t && t.click() }, name)
  await new Promise(r => setTimeout(r, 300))
  res[name] = await p.evaluate(() => { const ds = [...document.querySelectorAll('details.gdraft')]; ds.forEach(d => d.open = true); return { drafts: ds.length, paras: ds[0] ? ds[0].querySelectorAll('p').length : 0, first: ds[0]?.querySelector('p')?.textContent.slice(0, 110) } })
  if (res[name].drafts) { const box = await p.evaluate(() => { const r = document.querySelector('details.gdraft').getBoundingClientRect(); return { top: r.top + window.scrollY, height: r.height } }); await p.screenshot({ path: `${OUT}/policies-draft-${name.replace(/\W+/g, '-').toLowerCase()}.png`, clip: { x: 0, y: Math.max(0, box.top - 40), width: 1280, height: Math.min(900, box.height + 80) }, captureBeyondViewport: true }) }
}
console.log(JSON.stringify({ footer, tabs, res }, null, 1)); await b.close()
