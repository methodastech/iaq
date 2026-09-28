import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 120)))
const out = {}
for (const [u, n] of [['/services/energy-management', 'energy'], ['/services/process-critical-utilities', 'pcu'], ['/services/tool-installation', 'hookupband']]) {
  await p.goto('http://localhost:5177' + u, { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1800))
  if (n === 'hookupband') { const y = await p.evaluate(() => document.querySelector('.un-band').getBoundingClientRect().top + scrollY - 60); await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 1500)) }
  out[n] = await p.evaluate(() => ({ hero: document.querySelector('.un-hero-fig img')?.getAttribute('src'), band: document.querySelector('.un-band-fig img')?.getAttribute('src'), tags: [...document.querySelectorAll('.un-rep')].length, loaded: [...document.querySelectorAll('.un-hero-fig img, .un-band-fig img')].every(i => i.complete && i.naturalWidth > 0) }))
  await p.screenshot({ path: `${OUT}/hero-${n}.png`, captureBeyondViewport: false })
}
console.log(JSON.stringify({ out, errs }))
await b.close()
