import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.goto('http://localhost:5177/design.html', { waitUntil: 'networkidle2' })
const r = await p.evaluate(async () => { await document.fonts.ready; const out = {}
  for (const [k, f] of [['sw500', '500 100px Switzer'], ['sw600', '600 100px Switzer'], ['is400', '400 100px "Instrument Sans"']]) {
    const s = document.createElement('span'); s.style.font = f; s.style.whiteSpace = 'nowrap'; s.style.position = 'absolute'; s.textContent = 'Your Total Facility Solutions Provider'; document.body.appendChild(s); out[k] = s.getBoundingClientRect().width / 100 / (parseFloat(getComputedStyle(document.documentElement).zoom) || 1); s.remove() }
  return out })
console.log(JSON.stringify(r)); await b.close()
