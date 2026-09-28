import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-gpu'] })
const p = await b.newPage()
for (const w of [1920, 1440, 1180]) {
  await p.setViewport({ width: w, height: 1000, deviceScaleFactor: 1 })
  await p.goto('http://localhost:52158/markets/ev-battery', { waitUntil: 'networkidle0', timeout: 60000 })
  await new Promise(r => setTimeout(r, 2500))
  const m = await p.evaluate(() => {
    const q = s => document.querySelector(s); const r = s => { const e = q(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.right), Math.round(b.width)] }
    const facts = [...document.querySelectorAll('.mk-fact')].map(e => { const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.right)] })
    return { vw: innerWidth, gut: getComputedStyle(document.documentElement).getPropertyValue('--gut'), pgIn: r('.mkb .pg-in'), aside: r('.mkb .pg-head-aside'), h1: r('.mkb h1'), crumbs: r('.mkb .pg-crumbs'), factsW: r('.mk-facts-w'), factsPad: getComputedStyle(q('.mk-facts-w')).padding, facts: r('.mk-facts'), factCols: facts, nextH2: r('.mkb ~ .pg-sec .pg-in h2') || r('.pg-sec .pg-in h2'), docW: document.documentElement.scrollWidth }
  })
  console.log(JSON.stringify(m))
}
await b.close()
