import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 390, height: 900, isMobile: true, hasTouch: true })
await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
await p.evaluate(() => document.querySelector('.cyc-band').scrollIntoView()); await new Promise(r => setTimeout(r, 4000))
console.log(JSON.stringify(await p.evaluate(() => {
  const n = document.querySelectorAll('.cyc-node')[3]; const out = []
  for (const el of [n, ...n.querySelectorAll('*')]) for (const ps of ['::before', '::after']) { const cs = getComputedStyle(el, ps); if (cs.content !== 'none') out.push({ el: el.tagName + '.' + el.className.toString().slice(0, 24), ps, pos: cs.position, l: cs.left, t: cs.top, w: cs.width, h: cs.height, bg: cs.backgroundColor, sh: cs.boxShadow.slice(0, 40), disp: cs.display, tr: cs.transform }) }
  const hidden = [...n.querySelectorAll('*')].map(e => ({ el: e.tagName + '.' + e.className.toString().slice(0, 20), disp: getComputedStyle(e).display, pos: getComputedStyle(e).position, r: [Math.round(e.getBoundingClientRect().left), Math.round(e.getBoundingClientRect().top), Math.round(e.getBoundingClientRect().width)] }))
  return { out, hidden }
}), null, 1)); await b.close()
