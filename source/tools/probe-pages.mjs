import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) }); p.on('pageerror', e => errs.push(String(e)))
const shoot = async (url, name, ys) => {
  await p.goto('http://localhost:5177' + url, { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 2500))
  const H = await p.evaluate(() => document.documentElement.scrollHeight)
  for (const y of ys) {
    await p.evaluate(y => { window.scrollTo(0, y); document.querySelectorAll('[data-reveal],.reveal').forEach(e => e.classList.add('in', 'on', 'is-in')) }, y)
    await new Promise(r => setTimeout(r, 1400))
    await p.screenshot({ path: `${OUT}/${name}-${y}.png`, captureBeyondViewport: false })
  }
  return H
}
console.log('news', await shoot('/news', 'news', [0, 800, 1700]))
console.log('proj', await shoot('/projects/13', 'proj', [0, 900, 1800, 2700, 3600]))
console.log('errors', JSON.stringify(errs.slice(0, 5)))
await b.close()
