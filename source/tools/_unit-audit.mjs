import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-gpu'] })
const routes = ['/services/epc-construction', '/services/tool-installation', '/services/process-critical-utilities', '/services/energy-management']
const res = []
for (const w of [1440, 390]) {
  for (const r of routes) {
    const p = await b.newPage(); const errs = []; const bad = []
    p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error' && !/WebGL/.test(m.text())) errs.push('console: ' + m.text().slice(0, 160)) })
    p.on('response', rs => { if (rs.status() >= 400) bad.push(rs.status() + ' ' + rs.url().replace('http://localhost:52158', '')) })
    await p.setViewport({ width: w, height: w > 600 ? 900 : 844, deviceScaleFactor: 1 })
    const resp = await p.goto('http://localhost:52158' + r, { waitUntil: 'networkidle0', timeout: 90000 }); await new Promise(x => setTimeout(x, 2500))
    // scroll through so lazy content loads and reveals fire
    const H = await p.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y < H; y += 700) { await p.evaluate(v => scrollTo(0, v), y); await new Promise(x => setTimeout(x, 120)) }
    await p.evaluate(() => scrollTo(0, 0)); await new Promise(x => setTimeout(x, 600))
    const m = await p.evaluate(() => {
      const vw = innerWidth
      const over = [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > vw + 1 || r.left < -1) && getComputedStyle(e).position !== 'fixed' }).slice(0, 5).map(e => e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0] + ' ' + Math.round(e.getBoundingClientRect().right - vw))
      const imgs = [...document.images]; const broken = imgs.filter(i => i.complete && i.naturalWidth === 0 && !i.closest('.bmws')).map(i => i.getAttribute('src'))
      const links = [...document.querySelectorAll('a[href^="/"]')].map(a => a.getAttribute('href')); const hrefs = [...new Set(links)]
      const small = [...document.querySelectorAll('main *, .pg-sec *')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && getComputedStyle(e).display !== 'none' && parseFloat(getComputedStyle(e).fontSize) < 11).length
      const h1 = document.querySelector('h1') && document.querySelector('h1').textContent.trim()
      const empties = [...document.querySelectorAll('.pg-sec')].filter(s => s.getBoundingClientRect().height < 40).length
      const em = document.querySelector('h1 em') && getComputedStyle(document.querySelector('h1 em')).color
      const secs = [...document.querySelectorAll('h2')].map(h => h.textContent.trim().slice(0, 40))
      const placeholder = [...document.querySelectorAll('body *')].filter(e => /lorem|TODO|placeholder|coming soon|content slot/i.test(e.textContent) && e.children.length === 0).length
      return { title: document.title, h1, em, docW: document.documentElement.scrollWidth, over, broken, hrefs, small, empties, secs, placeholder, lazyUnloaded: imgs.filter(i => !i.complete).length }
    })
    let inter = null
    if (w === 1440) {
      inter = await p.evaluate(async () => {
        const wait = ms => new Promise(x => setTimeout(x, ms))
        const out = {}
        const tabs = [...document.querySelectorAll('.un-pick-tab')]; if (tabs.length > 1) { tabs[1].click(); await wait(300); out.tabs = tabs.length + ' tabs, second on: ' + tabs[1].classList.contains('on') }
        const steps = [...document.querySelectorAll('.un-step-h')]; if (steps.length > 1) { steps[2].click(); await wait(300); out.steps = steps.length + ' steps, third on: ' + !!steps[2].closest('.un-step').classList.contains('on') }
        const beats = document.querySelectorAll('.un-beat').length; out.beats = beats
        out.projects = document.querySelectorAll('.un-pc, .pg-pc').length
        out.bimImgs = [...document.querySelectorAll('.un-bim img')].map(i => i.naturalWidth > 0).filter(Boolean).length + '/' + document.querySelectorAll('.un-bim img').length
        out.stats = [...document.querySelectorAll('.un-stat b, .un-stat-n, .un-kpi b')].map(e => e.textContent.trim()).slice(0, 4)
        return out
      })
    }
    res.push({ w, r, status: resp.status(), errs, bad, ...m, inter })
    await p.close()
  }
}
// internal links from the three pages: do they answer 200 (client routes render, so check the app returns the shell) and do their routes exist in the router?
const all = [...new Set(res.flatMap(x => x.hrefs))]
console.log(JSON.stringify({ pages: res.map(({ hrefs, ...x }) => x), links: all }, null, 1))
await b.close()
