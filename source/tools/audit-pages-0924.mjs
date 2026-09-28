import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const PAGES = ['/services/design', '/services/procurement', '/services/construction', '/services/commissioning', '/services/maintenance', '/services/tool-installation', '/services/epc-construction', '/services/energy-management']
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const path of PAGES) {
  for (const w of [1440, 390]) {
    const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 140))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)) })
    await p.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500, deviceScaleFactor: w === 1440 ? 0.5 : 0.6 })
    const resp = await p.goto('http://localhost:5177' + path, { waitUntil: 'networkidle0', timeout: 60000 })
    await p.evaluate(async () => { document.querySelectorAll('[data-reveal],.cxr,.sm-band,section').forEach(e => e.classList.add('in')); window.scrollTo(0, document.body.scrollHeight); await new Promise(r => setTimeout(r, 600)); window.scrollTo(0, 0) }); await new Promise(r => setTimeout(r, 900))
    const r = await p.evaluate(() => {
      const qa = s => [...document.querySelectorAll(s)]
      const main = document.querySelector('main') || document.body
      const h1 = qa('h1').map(e => e.textContent.trim().replace(/\s+/g, ' '))
      const h2 = qa('main h2, h2').map(e => e.textContent.trim().replace(/\s+/g, ' ')).filter(t => t)
      const imgs = qa('img'); const broken = imgs.filter(i => i.complete && i.naturalWidth === 0 && !i.loading).map(i => i.getAttribute('src')?.slice(-40))
      const empties = qa('section').filter(s => s.textContent.trim().length < 20 && !s.querySelector('img,video,svg,canvas')).length
      const words = main.innerText.split(/\s+/).length
      const dashes = (main.innerText.match(/ [–—-] |—|–/g) || []).length, bangs = (main.innerText.match(/!/g) || []).length
      const links = qa('main a[href]').map(a => a.getAttribute('href')).filter(h => h && h.startsWith('/'))
      const ctas = qa('main a, main button').map(e => e.textContent.trim()).filter(t => /contact|start|enquir|quote|talk|open|see /i.test(t)).slice(0, 6)
      return { h1, h2, broken, empties, words, dashes, bangs, links: [...new Set(links)].length, ctas, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, height: document.documentElement.scrollHeight }
    })
    console.log(w, path, resp.status(), JSON.stringify(r), 'errors', errs.length ? errs : 0)
    if (w === 1440) await p.screenshot({ path: `${OUT}/${path.split('/').pop()}-d.png`, fullPage: true })
    await p.close()
  }
}
await b.close()
