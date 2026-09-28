import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const out = []
for (const [w, r] of [[1440, '/'], [1440, '/portal/codex?admin'], [1280, '/about'], [1024, '/services'], [2560, '/'], [390, '/'], [1440, '/checklist.html']]) {
  const page = await browser.newPage(); await page.setViewport({ width: w, height: 900, isMobile: w < 500 })
  await page.goto('http://localhost:5177' + r, { waitUntil: 'domcontentloaded', timeout: 90000 }); await new Promise(x => setTimeout(x, 2200))
  out.push(await page.evaluate((w, r) => { const b = document.querySelector('.bmws'); const t = document.querySelector('.bmws-tabs'); const n = document.querySelector('.nav'); const br = b.getBoundingClientRect(); const last = [...t.querySelectorAll('a')].pop().getBoundingClientRect(); const tr = t.getBoundingClientRect()
    return { w, r, barH: Math.round(br.height), overflow: t.scrollWidth - t.clientWidth, lastVisible: Math.round(last.right) <= Math.round(tr.right) + 1, navTop: n ? Math.round(n.getBoundingClientRect().top) : null, barBottom: Math.round(br.bottom), tabFont: getComputedStyle(t.querySelector('a')).fontSize } }, w, r))
  await page.close()
}
console.log(out.map(o => JSON.stringify(o)).join('\n'))
await browser.close()
