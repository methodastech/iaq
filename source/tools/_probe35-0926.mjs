import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 120000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/services/tool-installation?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 4000))
const out = []
for (const id of ['un-svc7-h', 'un-models-h', 'un-del-h']) {
  await p.evaluate(id => { const h = document.getElementById(id); window.scrollTo(0, h.getBoundingClientRect().top + scrollY - 200) }, id)
  const t0 = Date.now(); const samples = []
  for (let i = 0; i < 8; i++) { await new Promise(r => setTimeout(r, 400)); samples.push(await p.evaluate(id => { const h = document.getElementById(id); return getComputedStyle(h).opacity + (h.classList.contains('in') ? '' : '*') }, id)) }
  out.push([id, samples.join(' ')])
}
console.log(JSON.stringify(out)); await b.close(); process.exit(0)
