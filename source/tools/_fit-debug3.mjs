import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-gpu'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:52158/services', { waitUntil: 'networkidle0', timeout: 90000 }); await new Promise(r => setTimeout(r, 3000))
const m = await p.evaluate(async () => {
  const svgs = [...document.querySelectorAll('.cyc-mk svg')]
  const before = svgs.map(s => s.getAttribute('viewBox'))
  svgs.forEach(s => { s.setAttribute('viewBox', '0 0 96 96'); delete s.dataset.fit })
  const mod = await import('/src/lib/fitMarks.js')
  mod.fitMarks(document.querySelector('.cyc-fit'), '.cyc-mk svg')
  const after = svgs.map(s => s.getAttribute('viewBox').split(' ').map(n => Math.round(Number(n))).join(','))
  const areas = svgs.map(s => { const b = s.getBBox(); const vb = s.getAttribute('viewBox').split(' ').map(Number); const k = 105 / vb[2]; return Math.round(b.width * k) + 'x' + Math.round(b.height * k) })
  return { before, after, areas }
})
console.log(JSON.stringify(m))
await b.close()
