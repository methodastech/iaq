import puppeteer from "puppeteer-core"
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/careers', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1500))
console.log(await p.evaluate(async () => {
  const c = document.querySelector('.close3d'); c.scrollIntoView({ block: 'start' }); await new Promise(r => setTimeout(r, 1200))
  return JSON.stringify([...document.querySelectorAll('body *')].filter(e => { const cs = getComputedStyle(e); return (cs.position === 'sticky' || cs.position === 'fixed') && e.getBoundingClientRect().height > 20 }).map(e => { const r = e.getBoundingClientRect(); return [e.tagName, e.className.toString().slice(0, 60), getComputedStyle(e).position, Math.round(r.top), Math.round(r.height), e.parentElement.className.toString().slice(0, 40)] }))
}))
await b.close()
