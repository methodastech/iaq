import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 950 })
await p.goto('http://localhost:5177/policies?noanim', { waitUntil: 'networkidle2', timeout: 60000 })
await p.evaluate(() => new Promise(res => { let y = 0; const t = setInterval(() => { scrollTo(0, y += 1400); if (y > document.body.scrollHeight) { clearInterval(t); scrollTo(0, 0); res() } }, 50) }))
await new Promise(r => setTimeout(r, 1000))
console.log(JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.gcert')].map(c => {
  const kids = [...c.children].filter(k => k.getBoundingClientRect().height > 0)
  const r = c.getBoundingClientRect()
  const ink = kids.length ? Math.max(...kids.map(k => k.getBoundingClientRect().bottom)) : r.top
  return { name: (c.querySelector('b')?.textContent || '').slice(0, 22), hasFile: c.classList.contains('has-file'), thumb: !!c.querySelector('.gcert-th'), h: Math.round(r.height), slack: Math.round(r.bottom - ink) }
})), null, 1))
await b.close()
