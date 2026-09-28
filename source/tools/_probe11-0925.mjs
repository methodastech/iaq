import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 1000 })
const errs = []; p.on('pageerror', e => errs.push('pe ' + e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ' ' + m.text().slice(0, 200)) })
await p.goto('http://localhost:5177/design.html', { waitUntil: 'networkidle2' })
const r = await p.evaluate(async () => {
  const el = document.querySelector('#art-services'); el.scrollIntoView({ block: 'center' })
  await new Promise(r => setTimeout(r, 1500))
  const svgs = [...document.querySelectorAll('.sm2')]
  const io = 'IntersectionObserver' in window, rm = matchMedia('(prefers-reduced-motion: reduce)').matches
  return { io, rm, n: svgs.length, live: svgs.map(s => s.getAttribute('class')), rect: svgs[0].getBoundingClientRect().toJSON(), vh: innerHeight }
})
console.log(JSON.stringify({ r, errs: errs.slice(0, 8) }))
await b.close()
