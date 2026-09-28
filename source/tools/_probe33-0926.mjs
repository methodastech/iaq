import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 120000)
for (const r of ['energy-management', 'tool-installation']) {
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
  await p.goto('http://localhost:5177/services/' + r + '?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 4000))
  const H = await p.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < H; y += 300) { await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 200)) }
  await new Promise(r => setTimeout(r, 4000))
  const hs = await p.evaluate(() => [...document.querySelectorAll('.un-page h2')].map(h => { const cs = getComputedStyle(h); return [h.textContent.slice(0, 34), cs.opacity, h.className, h.hasAttribute('data-rv') ? (h.classList.contains('in') ? 'in' : 'NOT-IN') : '-', Math.round(h.getBoundingClientRect().height)] }))
  console.log(r, JSON.stringify(hs))
  await p.close()
}
await b.close(); process.exit(0)
