import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 200000)
const res = {}
for (const [k, u] of [['epc', '/services/epc-construction'], ['tool', '/services/tool-installation'], ['efm', '/services/energy-management']]) {
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
  const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 140)))
  await p.goto('http://localhost:5177' + u + '?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 3000))
  const H = await p.evaluate(() => document.documentElement.scrollHeight); for (let y = 0; y < H; y += 500) { await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 90)) }
  await new Promise(r => setTimeout(r, 900))
  res[k] = await p.evaluate(() => {
    const RED = /rgba?\(236, 32, 39|rgba?\(200, 20, 29|rgba?\(200, 22, 29|rgb\(255, 248, 248\)|rgb\(253, 236, 234\)/
    const hits = []
    document.querySelectorAll('.un-sec *').forEach(e => { if (e.closest('.un-cycle') || e.closest('.tsc-fig') || e.closest('svg')) return
      const cs = getComputedStyle(e); const props = [['color', cs.color], ['bg', cs.backgroundColor], ['shadow', cs.boxShadow], ['border', cs.borderTopColor + (cs.borderTopWidth !== '0px' ? '' : 'x')]]
      for (const [n, v] of props) if (v && RED.test(v) && !(n === 'border' && v.endsWith('x'))) { hits.push((e.className && e.className.baseVal === undefined ? e.className : e.tagName).toString().slice(0, 40) + ' ' + n); break } })
    return { redOutsideCycle: [...new Set(hits)].slice(0, 12), docW: document.documentElement.scrollWidth }
  })
  res[k].errs = errs
  for (const [sel, name] of [['.un-cycle', 'cycle'], ['.un-scope', 'scope'], ['.sitefoot .f-certs', 'certs']]) {
    const el = await p.$(sel); if (!el) continue
    await p.evaluate(s => { const e = document.querySelector(s); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 120) }, sel); await new Promise(r => setTimeout(r, 1200))
    if (k === 'epc' || name === 'scope') await el.screenshot({ path: `${OUT}/${k}-${name}.png` })
  }
  await p.close()
}
console.log(JSON.stringify(res, null, 1))
await b.close(); process.exit(0)
