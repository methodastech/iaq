import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-gpu'] })
const p = await b.newPage()
const out = process.argv[2]
for (const [w, slug] of [[1440, 'ev-battery'], [1920, 'ev-battery'], [1440, 'semiconductor'], [1440, 'data-centre'], [390, 'ev-battery']]) {
  await p.setViewport({ width: w, height: w < 600 ? 844 : 1000, deviceScaleFactor: 1 })
  await p.goto(`http://localhost:52158/markets/${slug}`, { waitUntil: 'networkidle0', timeout: 60000 })
  await new Promise(r => setTimeout(r, 2600))
  const m = await p.evaluate(() => {
    const q = s => document.querySelector(s); const L = s => { const e = q(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.right)] }
    const facts = [...document.querySelectorAll('.mk-fact')].map(e => { const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.right)] })
    return { vw: innerWidth, pgIn: L('.mkb .pg-in'), drawing: L('.mkb-ico'), svg: L('.mkb-ico svg'), copy: L('.mkb .pg-head-copy'), h1: L('.mkb h1'), facts, nextH2: L('.pg-sec .pg-in h2'), docW: document.documentElement.scrollWidth, h1em: getComputedStyle(q('.mkb h1 em')).color }
  })
  console.log(w, slug, JSON.stringify(m))
  if (slug === 'ev-battery') await p.screenshot({ path: `${out}/hero-${slug}-${w}.png`, clip: { x: 0, y: 0, width: w, height: w < 600 ? 844 : 720 } })
}
await b.close()
