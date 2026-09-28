import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [w, tag] of [[1440, 'd'], [1100, 't'], [390, 'm']]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
  await p.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(() => { document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('in')); document.querySelector('.sysm').scrollIntoView({ block: 'start' }) }); await new Promise(r => setTimeout(r, 1800))
  const r1 = await p.evaluate(() => ({ lit: [...document.querySelectorAll('.sysm-u.lit b')].map(e => e.textContent), stagesLit: document.querySelectorAll('.sysm-st.lit').length }))
  await new Promise(r => setTimeout(r, 2700))
  const r = await p.evaluate(() => {
    const q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)]
    const ov = qa('.sysm-st span').filter(e => e.scrollWidth > e.parentElement.clientWidth + 1).map(e => e.textContent)
    const stagesX = qa('.sysm-st').map(e => Math.round(e.getBoundingClientRect().left)), cellsX = qa('.sysm-bar')[0] ? [...qa('.sysm-bar')[0].children].map(e => Math.round(e.getBoundingClientRect().left)) : []
    return { stages: qa('.sysm-st').length, rows: qa('.sysm-u').length, cells: qa('.sysm-bar i').length, core: qa('.sysm-bar i.core').length, ask: qa('.sysm-bar i.ask').length, off: qa('.sysm-bar i.off').length,
      kinds: qa('.sysm-wk').length, pins: qa('.sysm-wk-in b').map(e => e.textContent).join(''), ret: !!q('.sysm-ret'), nameOverflow: ov, aligned: stagesX.every((x, i) => Math.abs(x - cellsX[i]) <= 1),
      litNow: [...document.querySelectorAll('.sysm-u.lit b')].map(e => e.textContent), stagesLitNow: document.querySelectorAll('.sysm-st.lit').length, mapGone: !q('.sm-map'),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, barScaled: getComputedStyle(q('.sysm-bar i')).transform }
  })
  console.log(w, JSON.stringify({ first: r1, ...r }), 'errors', errs.length ? errs : 0)
  await (await p.$('.sysm')).screenshot({ path: `${OUT}/${tag}-sysmap.png` })
  if (w === 1440) { await p.hover('.sysm-st:nth-child(6)'); await new Promise(r => setTimeout(r, 500)); console.log('hover 6:', JSON.stringify(await p.evaluate(() => ({ units: [...document.querySelectorAll('.sysm-u.lit b')].map(e => e.textContent), work: [...document.querySelectorAll('.sysm-wk.lit h3')].map(e => e.textContent) })))); await (await p.$('.sysm')).screenshot({ path: `${OUT}/d-sysmap-hover6.png` }) }
  await p.close()
}
await b.close()
