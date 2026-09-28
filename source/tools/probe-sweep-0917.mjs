import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const routes = ['/', '/about', '/about/history', '/about/commitment', '/services', '/services/epc-construction', '/services/energy-management', '/services/tool-installation', '/services/process-critical-utilities', '/services/design', '/services/construction', '/services/commissioning', '/markets', '/markets/semiconductor', '/projects', '/projects/13', '/news', '/careers', '/careers/culture', '/careers/role/iaq-eng-01', '/contact', '/policies']
const out = []
for (const u of routes) {
  const errs = []; const h = e => errs.push(String(e).slice(0, 100)); p.on('pageerror', h); const c = m => { if (m.type() === 'error') errs.push(m.text().slice(0, 100)) }; p.on('console', c)
  const r = await p.goto('http://localhost:5177' + u, { waitUntil: 'networkidle2' }).catch(e => null); await new Promise(r => setTimeout(r, 1200))
  const info = await p.evaluate(() => ({ h1: document.querySelector('h1')?.textContent.replace(/\s+/g, ' ').trim().slice(0, 50), ovf: document.documentElement.scrollWidth > innerWidth, blank: (document.querySelector('#root')?.innerText || '').length < 200 }))
  out.push([u, r && r.status(), info.h1, info.ovf ? 'OVERFLOW' : '', info.blank ? 'BLANK' : '', errs.slice(0, 2).join(' | ')])
  p.off('pageerror', h); p.off('console', c)
}
console.log(out.map(r => r.join('  ')).join('\n'))
await b.close()
