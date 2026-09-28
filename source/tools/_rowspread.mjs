import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/' + (process.argv[2] || ''), { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 2500))
console.log(JSON.stringify(await p.evaluate(() => {
  const st = [...document.querySelectorAll('.hmk-stage')]
  const b = st.map(s => +s.getBoundingClientRect().bottom.toFixed(1))
  const anim = getComputedStyle(st[0]).animationName + ' / ' + getComputedStyle(st[0]).animationPlayState
  return { bottoms: b, spread: +(Math.max(...b) - Math.min(...b)).toFixed(1), anim }
})))
await b.close()
