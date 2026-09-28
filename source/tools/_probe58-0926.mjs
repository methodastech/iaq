import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 200000)
const res = {}
async function grab(url, w, h, sels) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: h, isMobile: w < 500, hasTouch: w < 500 })
  const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 140)))
  await p.goto('http://localhost:5177' + url + '?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 3500))
  const H = await p.evaluate(() => document.documentElement.scrollHeight); for (let y = 0; y < H; y += 600) { await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 90)) }
  await new Promise(r => setTimeout(r, 1500))
  for (const [sel, name] of sels) { const el = await p.$(sel); if (!el) { res[name] = 'missing'; continue } await p.evaluate(s => { const e = document.querySelector(s); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 120) }, sel); await new Promise(r => setTimeout(r, 1300)); await el.screenshot({ path: `${OUT}/r-${name}.png` }); res[name] = 'ok' }
  res[url + w] = { errs, docW: await p.evaluate(() => document.documentElement.scrollWidth) }
  if (url === '/services/tool-installation' && w > 500) res.styles = await p.evaluate(() => ({ lead: getComputedStyle(document.querySelector('.un-bento-c.is-lead'), '::after').display, flowLine: getComputedStyle(document.querySelector('.un-flow li'), '::after').backgroundColor, tsc: getComputedStyle(document.querySelector('.tsc-col')).boxShadow, foot: getComputedStyle(document.querySelector('.sitefoot .f-certs')).borderTopColor, ssb: getComputedStyle(document.querySelector('.ssb') || document.body).boxShadow }))
  await p.close()
}
await grab('/services/tool-installation', 1440, 900, [['.un-deliver', 'why'], ['.un-svc7', 'flow'], ['.tsc-cols', 'scope'], ['.sitefoot .f-certs', 'foot']])
await grab('/services/tool-installation', 390, 844, [['.un-svc7', 'flow-m']])
console.log(JSON.stringify(res, null, 1)); await b.close(); process.exit(0)
