/* 15 Sep: rendered-text sweep of the newsroom furniture. Prints every link's visible text and
   every sentence of 20+ words, per route, so repeated placeholder lines and bare "Read" links show.
   Usage: node tools/probe-newstext-0915.mjs [routes,comma] */
import puppeteer from 'puppeteer-core'
const ROUTES = (process.argv[2] || '/news,/news/penang-branch-office-opening,/news/prime-minister-business-roundtable-france,/news/ims-global-standards-commitment,/').split(',')
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const r of ROUTES) {
  const p = await b.newPage(); const errs = []
  p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.setViewport({ width: 1440, height: 900 })
  await p.goto('http://localhost:5177' + r, { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise(x => setTimeout(x, 1000))
  const out = await p.evaluate(() => {
    const main = document.querySelector('#root') || document.body
    const links = [...main.querySelectorAll('a')].map(a => a.innerText.trim().replace(/\s+/g, ' ')).filter(t => /^read\b/i.test(t) || t.length < 3)
    const skip = e => e.closest('.ar-prose, footer, .close3d')
    const sents = []
    main.querySelectorAll('p, span, small, b, li, figcaption, summary').forEach(e => {
      if (skip(e) || e.children.length > 2) return
      const t = e.innerText?.trim().replace(/\s+/g, ' '); if (!t) return
      t.split(/(?<=\.)\s+/).forEach(s => { const n = s.split(' ').length; if (n >= 20) sents.push(n + 'w: ' + s) })
    })
    const notes = [...main.querySelectorAll('.pg-note, .pg-slot, .pg-slot-tag, [class*="note"]')].filter(e => !skip(e)).map(e => e.className + ' :: ' + e.innerText.trim().replace(/\s+/g, ' ').slice(0, 220))
    /* whole blocks of 25+ words, so a placeholder made of short sentences still shows */
    const blocks = [...main.querySelectorAll('p, .pg-slot-in, .pg-lede, .cp-hint, small')].filter(e => !skip(e))
      .map(e => e.innerText.trim().replace(/\s+/g, ' ')).filter(t => t.split(' ').length >= 25).map(t => t.split(' ').length + 'w: ' + t)
    return { links: [...new Set(links)], sents: [...new Set(sents)], blocks: [...new Set(blocks)], notes }
  })
  console.log('\n=== ' + r + ' errs ' + errs.length, errs.join(' | ')); console.log(JSON.stringify(out, null, 1))
  await p.close()
}
await b.close()
