import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1920, height: 1080 })
await p.goto('http://localhost:5177/', { waitUntil: 'networkidle2' })
await p.evaluate(() => localStorage.setItem('iaq.cms.session.v1', '1'))
await p.goto('http://localhost:5177/codex/slides', { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 1500))
const out = await p.evaluate(() => {
  const all = [...document.querySelectorAll('.ab-x')]
  const res = all.map(s => {
    const h = s.parentElement, pp = h.parentElement
    return (h.closest('.cxs') || {}).id + ' | ' + h.tagName + '.' + h.className + ' ' + getComputedStyle(h).display + ' | parent ' + pp.tagName + '.' + pp.className + ' ' + getComputedStyle(pp).display + ' | ' + h.textContent.slice(0, 70)
  })
  return { n: all.length, slides: document.querySelectorAll('.cxs').length, res }
})
console.log(out.n, out.slides); out.res.forEach(r => console.log(r))
await b.close()
