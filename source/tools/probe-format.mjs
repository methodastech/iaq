/* 15 Sep: render the project format page beside qa.html; compare the admin bar, check errors and overflow. */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [path, w] of [['/qa.html', 1440], ['/project-format.html', 1440], ['/project-format.html', 390]]) {
  const p = await b.newPage(); const errs = []
  p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.setViewport({ width: w, height: 900 })
  await p.goto('http://localhost:5177' + path, { waitUntil: 'networkidle0', timeout: 30000 })
  const r = await p.evaluate(() => { const bar = document.getElementById('bmws-bar'); const bs = bar && getComputedStyle(bar)
    return { title: document.title, barH: bar ? bar.getBoundingClientRect().height : null, barKids: bar ? bar.children.length : null, barBefore: bar ? getComputedStyle(bar, '::before').content.slice(0, 60) : null,
      overflow: document.documentElement.scrollWidth > innerWidth, rows: document.querySelectorAll('tbody tr').length, h1: document.querySelector('h1')?.textContent } })
  console.log(path, w, JSON.stringify(r), 'errors', errs.length ? errs : 0)
  await p.screenshot({ path: `${OUT}/${path.replace(/\W/g, '')}-${w}.png` })
  await p.close()
}
await b.close()
