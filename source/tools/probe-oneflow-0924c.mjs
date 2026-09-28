import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
for (const [w, h] of [[1440, 900], [1024, 768], [390, 844]]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)) })
  await p.setViewport({ width: w, height: h, deviceScaleFactor: w < 500 ? 2 : 1 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1500))
  const of = await p.$('.of'); if (!of) { console.log(w, 'NO ONEFLOW'); continue }
  await of.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 1200))
  const m = await p.evaluate(async () => {
    const q = s => document.querySelector(s)
    const st = () => ({ tab: q('.of-tabs button.on b')?.textContent, svcOn: document.querySelectorAll('.of-st.k-s .of-chip.on').length, svcAsk: document.querySelectorAll('.of-st.k-s .of-chip.ask').length, workOn: document.querySelectorAll('.of-st.k-w .of-chip.on').length, sysOn: document.querySelectorAll('.of-st.k-y .of-chip.on').length, models: [...document.querySelectorAll('.of-st.k-m .of-chip')].map(e => e.textContent).join(' | '), read: q('.of-read')?.innerText.slice(0, 70) })
    const a = st()
    document.querySelectorAll('.of-tabs button')[2].click(); await new Promise(r => setTimeout(r, 600))
    const c = st()
    const past = [...document.querySelectorAll('.of *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).length
    return { first: a, efm: c, past, h: Math.round(q('.of').getBoundingClientRect().height) }
  })
  console.log(w, JSON.stringify(m), 'errors', errs.length, errs.slice(0, 2))
  await p.evaluate(() => document.querySelectorAll('.of-tabs button')[0].click()); await new Promise(r => setTimeout(r, 700))
  await of.screenshot({ path: `${OUT}/oneflow-${w}.png` })
  await p.close()
}
await b.close()
