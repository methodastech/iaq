import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 120)))
const pages = ['/about', '/about/history', '/services', '/services/epc-construction', '/services/energy-management', '/services/tool-installation', '/news', '/careers', '/careers/role/iaq-eng-01']
const out = {}
for (const u of pages) {
  await p.goto('http://localhost:5177' + u, { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1800))
  out[u] = await p.evaluate(() => {
    const t = s => s.replace(/\s+/g, ' ').trim()
    const hs = [...document.querySelectorAll('main h1, main h2, #root h1, #root h2')].map(h => t(h.textContent)).filter(Boolean)
    const rel = !!document.querySelector('.related, .rel, [class*="related"], [aria-label*="goes next" i]') || /Where this goes next/i.test(document.body.innerText)
    const mail = (document.body.innerText.match(/[a-z]+@iaqtechnology\.com\.my/g) || []).filter((v, i, a) => a.indexOf(v) === i)
    const bold = [...document.querySelectorAll('.mline, .mdesc')].map(e => [e.className, getComputedStyle(e).fontSize, getComputedStyle(e).fontWeight])
    const vm = document.querySelector('.vm, [class*="vm-"]') ? [...document.querySelectorAll('canvas')].length : null
    const form = !!document.querySelector('form input[type="file"]')
    const culture4 = /Global Opportunities/.test(document.body.innerText)
    const earlier = /Earlier, by topic/.test(document.body.innerText)
    const sixCards = /Six services\. Open the one you need/.test(document.body.innerText)
    const arc = /The arc runs outward/.test(document.body.innerText)
    const regional = /From a local engineering firm/.test(document.body.innerText)
    return { hs: hs.slice(0, 18), rel, mail, bold, canvases: vm, form, culture4, earlier, sixCards, arc, regional }
  })
}
// menu order
await p.goto('http://localhost:5177/projects', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1500))
out.menu = await p.evaluate(() => [...document.querySelectorAll('.nav-mega.sets .nm-seth b')].map(b => b.textContent))
await p.screenshot({ path: OUT + '/deck-footer.png', captureBeyondViewport: false })
console.log(JSON.stringify({ out, errs }, null, 1))
await b.close()
