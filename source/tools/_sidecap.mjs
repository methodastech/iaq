import puppeteer from 'puppeteer-core'
const SP = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 950, deviceScaleFactor: 1 })
await p.goto('http://localhost:5177/projects/0?noanim', { waitUntil: 'networkidle2', timeout: 60000 })
await p.evaluate(() => new Promise(res => { let y = 0; const t = setInterval(() => { scrollTo(0, y += 1400); if (y > document.body.scrollHeight) { clearInterval(t); scrollTo(0, 0); res() } }, 50) }))
await new Promise(r => setTimeout(r, 1200))
const info = await p.evaluate(() => {
  const s = document.querySelector('.prj-side'); const r = s.getBoundingClientRect()
  const cs = getComputedStyle(s)
  return { top: Math.round(r.top + scrollY), h: Math.round(r.height), pos: cs.position, kids: [...s.children].map(k => ({ cls: String(k.className).slice(0,20), h: Math.round(k.getBoundingClientRect().height), pos: getComputedStyle(k).position })) }
})
console.log(JSON.stringify(info, null, 1))
await p.evaluate(y => scrollTo(0, y - 120), info.top)
await new Promise(r => setTimeout(r, 900))
await p.screenshot({ path: SP + '/prj-side-top.png' })
await p.evaluate(y => scrollTo(0, y + 900), info.top)
await new Promise(r => setTimeout(r, 900))
await p.screenshot({ path: SP + '/prj-side-mid.png' })
await b.close()
