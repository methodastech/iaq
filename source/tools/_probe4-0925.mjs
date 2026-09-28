import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 950 })
await p.setRequestInterception(true)
p.on('request', r => { if (r.url().includes('/model3d/')) setTimeout(() => r.continue(), 4000); else r.continue() })
await p.goto('http://localhost:5177/services', { waitUntil: 'domcontentloaded', timeout: 90000 })
const t0 = Date.now(); const log = []; let shot = false
for (let i = 0; i < 60; i++) { const cl = await p.$eval('.fr', e => e.className).catch(() => 'none'); log.push([Date.now() - t0, cl])
  if (!shot && cl === 'fr') { await new Promise(r => setTimeout(r, 600)); const el = await p.$('.sm-map-dark') || await p.$('.fr'); await el.screenshot({ path: '/private/tmp/claude-501/-Users-zieel-Bazil-Claude-3-Websites/f19488ad-dbd8-4061-ade0-b04e4d89e671/scratchpad/fr-loading.png' }); shot = true }
  if (cl.includes('is-ready')) break; await new Promise(r => setTimeout(r, 300)) }
await new Promise(r => setTimeout(r, 1500))
const el = await p.$('.sm-map-dark') || await p.$('.fr'); await el.screenshot({ path: '/private/tmp/claude-501/-Users-zieel-Bazil-Claude-3-Websites/f19488ad-dbd8-4061-ade0-b04e4d89e671/scratchpad/fr-ready.png' })
console.log(JSON.stringify(log.filter((x, i, a) => i === 0 || x[1] !== a[i - 1][1] || i === a.length - 1)))
await b.close()
