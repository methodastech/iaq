import puppeteer from 'puppeteer-core'
const SP = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 950, deviceScaleFactor: 1.5 })
await p.goto('http://localhost:5177/?noanim', { waitUntil: 'networkidle0', timeout: 90000 })
await new Promise(r => setTimeout(r, 2400))
await p.evaluate(() => { const s = document.createElement('style'); s.textContent = '*{transition-duration:0s!important;animation-duration:0s!important;animation-delay:0s!important}'; document.head.appendChild(s) })
const before = await p.evaluate(() => document.querySelectorAll('.nav-has').length)
await p.evaluate(() => {
  const el = [...document.querySelectorAll('.nav-has')].find(e => /services/i.test(e.textContent))
  el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body }))
})
await new Promise(r => setTimeout(r, 800))
const o = await p.evaluate(() => {
  const el = [...document.querySelectorAll('.nav-has')].find(e => /services/i.test(e.textContent))
  const panel = [...el.querySelectorAll('*')].find(e => { const r = e.getBoundingClientRect(); return r.height > 180 && r.width > 500 })
  if (!panel) return { open: false, hubs: document.querySelectorAll('.nav-has').length }
  const r = panel.getBoundingClientRect()
  const links = [...panel.querySelectorAll('a')]
  const cols = [...new Set(links.map(a => Math.round(a.getBoundingClientRect().left)))]
  const boxed = links.filter(a => { const s = getComputedStyle(a); return parseFloat(s.borderWidth) > 1 })
  const bottoms = [...new Set(cols.map(x => Math.max(...links.filter(a => Math.round(a.getBoundingClientRect().left) === x).map(a => Math.round(a.getBoundingClientRect().bottom)))))]
  return { open: true, cls: String(panel.className).slice(0, 44), w: Math.round(r.width), h: Math.round(r.height), links: links.length, cols: cols.length, boxedOver1px: boxed.length, columnBottoms: bottoms }
})
console.log(JSON.stringify({ hubs: before, ...o }, null, 1))
await p.screenshot({ path: SP + '/v-wing.png', clip: { x: 0, y: 60, width: 1440, height: 700 } })
console.log(JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.nav-mega .nav-col, .nav-mega > div > div')].map(c => ({ cls: String(c.className).slice(0,26), top: Math.round(c.getBoundingClientRect().top), bot: Math.round(c.getBoundingClientRect().bottom) })))))
await b.close()
