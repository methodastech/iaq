import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)) })
  await p.setViewport({ width: w, height: h, deviceScaleFactor: w < 500 ? 2 : 1 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1500))
  const sec = await p.$('.sm-units'); await sec.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 1200))
  const r = await p.evaluate(async () => {
    const out = { cards: document.querySelectorAll('.sm-uc').length, icons: document.querySelectorAll('.sm-uc .sm-mi .mdl-ic').length, subs: [...document.querySelectorAll('.sm-uc h3 small')].map(e => e.textContent.slice(0, 40)), cardH: [...document.querySelectorAll('.sm-uc')].map(e => Math.round(e.getBoundingClientRect().height)) }
    out.details = []
    for (const btn of document.querySelectorAll('.sm-uc-more')) { btn.click(); await new Promise(r => setTimeout(r, 700)); const d = document.querySelector('.sm-ud'); out.details.push({ open: !!d, svg: !!d?.querySelector('svg.ud-svg'), rows: d?.querySelectorAll('.sm-ud-spec > div').length, asks: d?.querySelectorAll('.sm-ud-asks span').length, past: [...(d ? d.querySelectorAll('*') : [])].filter(e => e.getBoundingClientRect().right > innerWidth + 1).length, h: Math.round(d?.getBoundingClientRect().height || 0) }) }
    return out
  })
  console.log(w, JSON.stringify(r), 'errors', errs.length, errs.slice(0, 2))
  await p.evaluate(async () => { document.querySelectorAll('.sm-uc-more')[0].click(); await new Promise(r => setTimeout(r, 900)) })
  await sec.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 600))
  await sec.screenshot({ path: `${OUT}/units-${w}.png` })
  await p.close()
}
await b.close()
