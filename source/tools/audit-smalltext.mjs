import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const route of ['/', '/projects', '/services', '/about/history']) {
  const page = await browser.newPage(); await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
  await page.goto('http://localhost:5177/#' + route, { waitUntil: 'networkidle2', timeout: 60000 }); await new Promise(r => setTimeout(r, 1200))
  const r = await page.evaluate(() => { const m = {}; for (const el of document.querySelectorAll('body *')) { const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 2); if (!own) continue; const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue; const fs = parseFloat(cs.fontSize); if (fs < 11) { const k = (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : el.tagName.toLowerCase()) + ' ' + fs + 'px'; m[k] = (m[k] || 0) + 1 } } return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 12) })
  console.log(route, JSON.stringify(r)); await page.close()
}
await browser.close()
