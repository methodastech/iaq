/* the hero row at three widths: names on one line, nothing clipped, no overlap */
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox'] })
const out = []
for (const w of [1440, 1920, 390]) {
  const p = await b.newPage()
  const errs = []
  p.on('pageerror', e => errs.push(String(e).slice(0, 120)))
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)) })
  await p.setViewport({ width: w, height: 900, deviceScaleFactor: 2 })
  await p.goto('http://localhost:5177/?noanim&marks=line', { waitUntil: 'networkidle0', timeout: 60000 })
  await new Promise(r => setTimeout(r, 1800))
  await p.evaluate(() => document.querySelector('.hmk-row.hmk-iso').scrollIntoView({ block: 'center' }))
  await new Promise(r => setTimeout(r, 700))
  const info = await p.evaluate(() => {
    const li = [...document.querySelectorAll('.hmk-iso li')]
    const nm = li.map(l => { const n = l.querySelector('.hmk-nm'); const r = n.getBoundingClientRect(); return { t: Math.round(r.top), lines: Math.round(r.height / parseFloat(getComputedStyle(n).lineHeight)) } })
    const mk = li.map(l => { const r = l.querySelector('svg').getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), b: Math.round(r.bottom) } })
    let overlap = 0
    for (let i = 1; i < mk.length; i++) if (mk[i].l < mk[i - 1].r) overlap++
    return { tiles: li.length, twoLine: nm.filter(n => n.lines > 1).length, nameTops: new Set(nm.map(n => n.t)).size, markBottoms: new Set(mk.map(m => m.b)).size, overlap }
  })
  await (await p.$('.hmk')).screenshot({ path: `${process.argv[2]}/hero-${w}.png` })
  out.push({ w, ...info, errs })
  await p.close()
}
await b.close()
console.log(out.map(o => `${o.w}px  tiles=${o.tiles} names>1line=${o.twoLine} distinctNameTops=${o.nameTops} distinctMarkBottoms=${o.markBottoms} overlaps=${o.overlap} errs=${o.errs.length}`).join('\n'))
