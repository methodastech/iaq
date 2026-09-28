import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [w, tag] of [[1440, 'd'], [390, 'm']]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(() => { document.querySelectorAll('[data-reveal],.sm-band,.cyc-band').forEach(e => e.classList.add('in')); document.querySelector('.cyc-band').scrollIntoView({ block: 'start' }) }); await new Promise(r => setTimeout(r, 4500))
  const r = await p.evaluate(() => {
    const q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)]
    const specs = qa('.sm-level .sm-uc-spec > div')
    const rowTops = {}; specs.forEach(d => { const k = d.querySelector('dt').textContent; (rowTops[k] ||= []).push(Math.round(d.getBoundingClientRect().top)) })
    const spread = Object.fromEntries(Object.entries(rowTops).map(([k, v]) => [k, Math.max(...v) - Math.min(...v)]))
    return {
      serp: !!q('.cyc-canvas'), ring: !!q('.cring'), marks: qa('.cyc-disc .cyc-mk svg').length, red: !!q('.cyc-red'), redHead: !!q('.cyc-redhead'), chips: qa('.cyc-chip').length,
      loopText: q('.cyc-txt small.is-loop')?.textContent, lede: q('.cyc-lede')?.textContent.trim(),
      when: qa('.sm-uc-when').map(e => e.textContent.length), models: qa('.sm-model small').length, keys: qa('.sm-svc6-key').map(e => e.textContent),
      spread, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      canvasW: Math.round(q('.cyc-canvas')?.getBoundingClientRect().width || 0),
    }
  })
  console.log(w, JSON.stringify(r), 'errors', errs.length ? errs : 0)
  await (await p.$('.cyc-band')).screenshot({ path: `${OUT}/${tag}-serp.png` })
  await p.evaluate(() => document.querySelector('.sm-ucards').scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 800))
  await (await p.$('.sm-ucards')).screenshot({ path: `${OUT}/${tag}-units.png` })
  await p.close()
}

{
  const p = await b.newPage(); await p.setViewport({ width: 390, height: 900, isMobile: true, hasTouch: true })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(() => document.querySelector('.cyc-band').scrollIntoView()); await new Promise(r => setTimeout(r, 4500))
  const n = (await p.$$('.cyc-node'))[3]; await n.screenshot({ path: `${OUT}/m-node4.png` })
  await p.evaluate(() => document.querySelector('.sm-ucards').scrollIntoView()); await new Promise(r => setTimeout(r, 800))
  const c = (await p.$$('.sm-uc'))[2]; await c.screenshot({ path: `${OUT}/m-unit3.png` })
  await p.close()
}
await b.close()
