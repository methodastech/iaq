import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/contact', { waitUntil: 'networkidle0', timeout: 90000 })
await new Promise(r => setTimeout(r, 2500))
console.log('CONTACT', JSON.stringify(await p.evaluate(() => {
  const forms = [...document.querySelectorAll('form')]
  return forms.map(f => ({ cls: f.className, fields: f.querySelectorAll('input,select,textarea').length, svgs: f.querySelectorAll('svg').length, labels: f.querySelectorAll('label').length }))
}), null, 1))
await p.goto('http://localhost:5177/', { waitUntil: 'networkidle0', timeout: 90000 })
await new Promise(r => setTimeout(r, 2500))
await p.evaluate(() => scrollTo(0, document.body.scrollHeight))
await new Promise(r => setTimeout(r, 2000))
console.log('BAND', JSON.stringify(await p.evaluate(() => {
  const cb = document.querySelector('.close3d') || document.querySelector('[class*="closing"]')
  if (!cb) return { none: true }
  const logos = [...cb.querySelectorAll('img, svg')].filter(e => /logo|iaq/i.test((e.getAttribute('alt') || '') + ' ' + (e.getAttribute('class') || '') + ' ' + (e.parentElement?.className || '')))
  return { cls: cb.className, h: Math.round(cb.getBoundingClientRect().height),
    logos: logos.map(e => ({ tag: e.tagName, cls: String(e.getAttribute('class') || e.parentElement?.className || '').slice(0, 60), alt: e.getAttribute('alt'), w: Math.round(e.getBoundingClientRect().width), vis: getComputedStyle(e).visibility, op: getComputedStyle(e).opacity })) }
}), null, 1))
await b.close()
