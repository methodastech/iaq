/* 15 Sep: which nav wing pushes the page wider than the viewport at desktop widths */
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const w of [1440, 1280, 1100]) for (const path of ['/', '/about', '/careers/culture', '/services', '/services/epc-construction', '/services/energy-management']) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 900 })
  await p.goto('http://localhost:5177' + path, { waitUntil: 'networkidle0', timeout: 40000 })
  const r = await p.evaluate(() => {
    const vw = document.documentElement.clientWidth, sw = document.documentElement.scrollWidth
    const wings = [...document.querySelectorAll('.nav-has')].map(h => { const a = h.querySelector(':scope > a'); const m = h.querySelector('.nav-mega'); const rc = m.getBoundingClientRect()
      return { wing: a.textContent.trim(), left: Math.round(rc.left), right: Math.round(rc.right), width: Math.round(rc.width), shift: getComputedStyle(m).getPropertyValue('--nm-shift') } })
    const res = {}
    for (const h of document.querySelectorAll('.nav-has')) { const m = h.querySelector('.nav-mega'); const prev = m.style.display; m.style.display = 'none'; res[h.querySelector(':scope > a').textContent.trim()] = document.documentElement.scrollWidth; m.style.display = prev }
    return { vw, sw, wings, scrollWidthWithWingHidden: res }
  })
  console.log(w, path, JSON.stringify(r))
  await p.close()
}
await b.close()
