import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage(); await page.setViewport({ width: 1032, height: 900 })
await page.goto('http://localhost:5177/portal/codex?admin', { waitUntil: 'networkidle2', timeout: 90000 })
await page.emulateMediaType('print'); await new Promise(r => setTimeout(r, 800))
const out = await page.evaluate(() => {
  const res = []
  const walk = (el, d) => {
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect()
    if (cs.display === 'none') return
    const bg = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none'
    if (d <= 5 && r.height > 120 && bg) res.push({ d, tag: el.tagName, cls: String(el.className).slice(0, 60), top: Math.round(r.top + scrollY), h: Math.round(r.height), bg: cs.backgroundColor, img: cs.backgroundImage.slice(0, 40), kids: el.children.length, text: el.innerText.slice(0, 40).replace(/\n/g, ' ') })
    if (d < 5) [...el.children].forEach(c => walk(c, d + 1))
  }
  walk(document.querySelector('.cx-page'), 0)
  return res.slice(0, 30)
})
console.log(out.map(o => JSON.stringify(o)).join('\n'))
await browser.close()
