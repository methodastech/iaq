import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 950 })
await p.goto('http://localhost:5177/?noanim', { waitUntil: 'networkidle0', timeout: 90000 })
await new Promise(r => setTimeout(r, 2200))
await p.evaluate(() => { const s = document.createElement('style'); s.textContent = '*{transition-duration:0s!important;animation-duration:0s!important}'; document.head.appendChild(s) })
for (const hub of ['services', 'about', 'markets', 'careers']) {
  const got = await p.evaluate(h => {
    document.querySelectorAll('.nav-has').forEach(e => e.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body })))
    const el = [...document.querySelectorAll('.nav-has')].find(e => new RegExp(h, 'i').test(e.textContent))
    if (!el) return false
    el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body }))
    return true
  }, hub)
  if (!got) { console.log(hub, 'no hub'); continue }
  await new Promise(r => setTimeout(r, 600))
  const o = await p.evaluate(() => {
    const panel = [...document.querySelectorAll('.nav-mega')].find(e => e.classList.contains('open'))
    if (!panel) return { none: true }
    const pr = panel.getBoundingClientRect()
    const cols = [...panel.querySelectorAll('.nm-col')].map(c => {
      const r = c.getBoundingClientRect()
      const kids = [...c.children].filter(k => k.getBoundingClientRect().height > 0)
      const last = kids.length ? kids[kids.length - 1].getBoundingClientRect().bottom : r.top
      return { cls: String(c.className).replace('nm-col nm-set ', ''), top: Math.round(r.top), bot: Math.round(r.bottom), inkBot: Math.round(last), slack: Math.round(r.bottom - last) }
    })
    return { panelH: Math.round(pr.height), cols }
  })
  console.log(hub.toUpperCase(), 'panel', o.panelH, o.cols ? o.cols.map(c => `${c.cls}: ink ends ${c.inkBot}, box ends ${c.bot}, slack ${c.slack}px`).join(' | ') : o)
}
await b.close()
