import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage(); await page.setViewport({ width: 1440, height: 900 })
const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 160)))
const out = {}
for (const r of ['/', '/audit.html', '/competitors.html', '/plan.html', '/checklist.html', '/design.html']) {
  await page.goto('http://localhost:5177' + r, { waitUntil: 'networkidle2', timeout: 60000 }); await new Promise(x => setTimeout(x, 700))
  out[r] = await page.evaluate(() => { const t = document.querySelector('.bmws-tabs'); if (!t) return 'no bar'; const a = [...t.querySelectorAll('a')]; const c = a.find(x => /Codex/.test(x.textContent)); return { tabs: a.length, codex: c ? c.getAttribute('href') : null, last: a[a.length - 1].textContent.trim(), overflow: t.scrollWidth - t.clientWidth, barH: Math.round(document.querySelector('.bmws').getBoundingClientRect().height) } })
}
await page.goto('http://localhost:5177/', { waitUntil: 'networkidle2' }); await page.evaluate(() => localStorage.removeItem('iaq.cms.session.v1'))
await page.evaluate(() => { [...document.querySelectorAll('.bmws-tabs a')].find(x => /Codex/.test(x.textContent)).click() })
await new Promise(x => setTimeout(x, 3000))
out.click = await page.evaluate(() => ({ url: location.pathname + location.search, parts: document.querySelectorAll('.cx-part').length, gate: !!document.querySelector('.cx-gate'), on: document.querySelector('.bmws-tabs a.on')?.textContent.trim(), first: document.querySelector('.cx-head ~ section')?.id, second: document.querySelectorAll('.cx-head ~ section')[1]?.querySelector('h2')?.textContent }))
console.log(JSON.stringify(out)); console.log('errors', errs.length)
await browser.close()
