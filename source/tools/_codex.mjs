import puppeteer from 'puppeteer-core'
const SP = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
const p = await b.newPage()
const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 100)))
p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 100)) })
await p.setViewport({ width: 1440, height: 950 })
await p.goto('http://localhost:5177/portal/codex', { waitUntil: 'networkidle0', timeout: 90000 })
await new Promise(r => setTimeout(r, 2000))
/* the gate */
const gate = await p.evaluate(() => {
  const i = document.querySelector('input[type="password"], input[name*="pass"], input')
  const emg = [...document.querySelectorAll('button,a')].find(e => /emergency/i.test(e.textContent))
  return { hasInput: !!i, emergency: !!emg, h1: (document.querySelector('h1')?.textContent || '').slice(0, 50) }
})
console.log('GATE', JSON.stringify(gate))
if (gate.hasInput) {
  await p.type('input[type="password"], input[name*="pass"], input', 'iaqsolution321')
  await p.keyboard.press('Enter')
  await new Promise(r => setTimeout(r, 2500))
}
const inside = await p.evaluate(() => {
  const txt = document.body.innerText
  return {
    h1: (document.querySelector('h1')?.textContent || '').slice(0, 60),
    len: txt.length,
    map: !!document.querySelector('[class*="map"], [class*="rel"]'),
    videos: document.querySelectorAll('iframe, [class*="video"], [class*="tut"]').length,
    downloads: [...document.querySelectorAll('a,button')].filter(e => /download/i.test(e.textContent)).map(e => e.textContent.trim().slice(0, 44)),
    abbr: document.querySelectorAll('abbr').length,
    brackets: (txt.match(/\([A-Za-z][^()]{2,60}\)/g) || []).length,
  }
})
console.log('INSIDE', JSON.stringify(inside, null, 1))
console.log('ERRS', errs.length, errs.slice(0, 3))
await p.screenshot({ path: SP + '/v-codex.png' })
await b.close()
