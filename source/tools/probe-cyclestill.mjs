import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox','--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/', { waitUntil: 'networkidle2' })
await p.evaluate(() => document.getElementById('lpStage').scrollIntoView({ block: 'center' }))
await new Promise(r => setTimeout(r, 1500))
const snap = () => p.evaluate(() => [...document.querySelectorAll('#lpBubbles .lpv')].map(h => { const v = h.querySelector('video'); return { i: h.dataset.i, on: h.classList.contains('on'), live: h.classList.contains('live'), paused: v.paused, t: +v.currentTime.toFixed(2), still: getComputedStyle(h.querySelector('.lpv-still')).opacity } }).filter(x => x.on))
console.log('start', JSON.stringify(await snap()))
const field = await p.$('#lpStage')
await field.screenshot({ path: OUT + '/cyc-0.png' })
for (const i of [1, 0, 2]) {
  await p.evaluate(i => document.querySelector(`#lpBubbles .lpn[data-i="${i}"]`).click(), i)
  const seen = []
  for (let k = 0; k < 12; k++) { await new Promise(r => setTimeout(r, 1000)); seen.push(JSON.stringify(await snap())) }
  console.log('stage', i, seen.join(' | '))
  await field.screenshot({ path: OUT + `/cyc-${i}-late.png` })
}
await b.close()
