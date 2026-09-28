// 18 Sep: every list inside a slide ends above whatever sits below it (the six-services scope row).
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1968, height: 1200 })
await p.goto('http://localhost:5177/', { waitUntil: 'networkidle2' })
await p.evaluate(() => localStorage.setItem('iaq.cms.session.v1', '1'))
await p.goto('http://localhost:5177/codex/slides', { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 1500))
console.log(await p.evaluate(() => [...document.querySelectorAll('.cxs')].map(s => {
  // any element whose content spills past its own box, inside the slide body
  const bad = [...s.querySelectorAll('.cxs-b *')].filter(e => !(e instanceof SVGElement) && getComputedStyle(e).overflow !== 'hidden' && e.clientHeight > 0 && e.scrollHeight - e.clientHeight > 2 && !e.closest('svg'))
  return s.id + ' spill ' + bad.length + (bad.length ? ' ' + bad.slice(0, 3).map(e => e.tagName + '.' + e.className + ' +' + (e.scrollHeight - e.clientHeight)).join(', ') : '')
}).join('\n')))
await b.close()
