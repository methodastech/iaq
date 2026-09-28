/* 15 Sep: does the History "Reading" label follow the entry on screen, scrolling down and back up? */
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 150)))
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/about/history', { waitUntil: 'networkidle0', timeout: 40000 })
const info = await p.evaluate(() => {
  const all = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /^reading$/i.test(e.textContent.trim()))
  const lab = all[0]; const box = lab ? lab.parentElement : null
  const entries = [...document.querySelectorAll('[data-kind]')].map(e => ({ top: e.getBoundingClientRect().top + scrollY, h3: (e.querySelector('h3') || {}).textContent }))
  return { hasLabel: !!lab, boxClass: box && box.className, entries }
})
if (!info.hasLabel) { console.log('no Reading label found'); await b.close(); process.exit(0) }
const readLabel = () => p.evaluate(() => { const lab = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /^reading$/i.test(e.textContent.trim())); return lab.parentElement.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) })
const seq = [3, 6, 9, 12, 9, 6, 3, 1]
for (const i of seq) {
  const e = info.entries[Math.min(i, info.entries.length - 1)]
  for (let y = await p.evaluate(() => scrollY), target = e.top - 300, steps = 0; Math.abs(target - y) > 5 && steps < 60; steps++) {
    y += Math.sign(target - y) * Math.min(400, Math.abs(target - y)); await p.evaluate(yy => window.scrollTo(0, yy), y); await new Promise(r => setTimeout(r, 40))
  }
  await new Promise(r => setTimeout(r, 400))
  console.log('entry on screen:', (e.h3 || '').padEnd(34), '| label reads:', await readLabel())
}
console.log('entries', info.entries.length, 'errors', errs.length)
await b.close()
