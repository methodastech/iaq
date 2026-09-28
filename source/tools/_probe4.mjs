import puppeteer from 'puppeteer-core'
const SP = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
/* nav wing */
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 950, deviceScaleFactor: 1.5 })
await p.goto('http://localhost:5177/', { waitUntil: 'networkidle0', timeout: 90000 })
await new Promise(r => setTimeout(r, 2400))
await p.evaluate(() => { const s = document.createElement('style'); s.textContent = '*{transition-duration:0s!important;animation-duration:0s!important}'; document.head.appendChild(s) })
const opened = await p.evaluate(() => {
  const cands = [...document.querySelectorAll('.nav a, .nav button, nav a, nav button')].filter(e => /services/i.test(e.textContent))
  for (const c of cands) { c.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })); c.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true })) }
  return cands.length
})
await new Promise(r => setTimeout(r, 900))
const wing = await p.evaluate(() => {
  const w = [...document.querySelectorAll('div,section')].find(e => { const r = e.getBoundingClientRect(); return r.height > 200 && r.width > 600 && r.top < 400 && /class/.test(String(e.className)) && /wing|drop|panel|mega/i.test(String(e.className)) })
  if (!w) return { none: true }
  const r = w.getBoundingClientRect()
  const kids = [...w.querySelectorAll('a')]
  const boxed = kids.filter(c => { const s = getComputedStyle(c); return parseFloat(s.borderWidth) > 1 || (s.backgroundColor !== 'rgba(0, 0, 0, 0)' && parseFloat(s.borderRadius) > 6) }).length
  return { cls: String(w.className).slice(0, 50), h: Math.round(r.height), links: kids.length, boxed }
})
console.log('NAV WING', opened, JSON.stringify(wing))
if (!wing.none) { const el = await p.$('.' + wing.cls.split(' ')[0]); if (el) await el.screenshot({ path: SP + '/v-wing.png' }) }
await p.close()
/* About vision & mission */
const q = await b.newPage(); await q.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1.5 })
await q.goto('http://localhost:5177/about', { waitUntil: 'networkidle0', timeout: 90000 })
await new Promise(r => setTimeout(r, 2400))
const vm = await q.evaluate(() => {
  const h = [...document.querySelectorAll('h2,h3')].find(x => /vision/i.test(x.textContent))
  if (!h) return { none: true }
  const sec = h.closest('section') || h.parentElement
  sec.scrollIntoView({ block: 'center' })
  const reds = [...sec.querySelectorAll('svg *')].filter(e => { const s = getComputedStyle(e); return /235, 32, 39|236, 32, 39|255, 59, 66|255, 77, 85/.test(s.fill + ' ' + s.stroke) }).length
  return { imgs: sec.querySelectorAll('img').length, svgs: sec.querySelectorAll('svg').length, reds, cls: String(sec.className).slice(0, 40) }
})
console.log('ABOUT V&M', JSON.stringify(vm))
await new Promise(r => setTimeout(r, 900))
await q.screenshot({ path: SP + '/v-vm.png' })
await q.close()
await b.close()
