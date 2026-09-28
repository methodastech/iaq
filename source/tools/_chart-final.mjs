import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-gpu'] })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)))
for (const w of [1440, 390]) {
  await p.setViewport({ width: w, height: w > 600 ? 900 : 844, deviceScaleFactor: 1 })
  await p.goto('http://localhost:52158/services', { waitUntil: 'networkidle0', timeout: 90000 }); await new Promise(r => setTimeout(r, 2500))
  const m = await p.evaluate(() => { const cells = [...document.querySelectorAll('.sysm-bar i')]; const vis = e => { const c = getComputedStyle(e); return c.display !== 'none' && parseFloat(c.fontSize) > 0 }; const shown = cells.map(c => [...c.querySelectorAll('.sysm-cn,.sysm-ct')].filter(vis).map(e => e.textContent.trim()).join('')); const small = [...document.querySelectorAll('.sysm *')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && getComputedStyle(e).display !== 'none' && parseFloat(getComputedStyle(e).fontSize) < 11).length; return { docW: document.documentElement.scrollWidth, named: shown.filter(Boolean).length, clipped: cells.filter(c => c.scrollWidth > c.clientWidth + 1).length, smallText: small, row1: shown.slice(0, 6).join(' | '), row3: shown.slice(12, 18).join(' | ') } })
  console.log(w, JSON.stringify(m))
  if (w === 390) { const t = await p.evaluate(() => document.querySelector('.sysm').getBoundingClientRect().top + scrollY); await p.evaluate(y => { document.documentElement.style.marginTop = (-y + 10) + 'px' }, t); await new Promise(r => setTimeout(r, 2200)); await p.screenshot({ path: `${process.argv[2]}/svc-chart-390.png`, clip: { x: 0, y: 0, width: 390, height: 700 } }) }
}
console.log('pageerrors', errs.length)
await b.close()
