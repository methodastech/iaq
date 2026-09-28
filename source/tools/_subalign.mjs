import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 950 })
await p.goto('http://localhost:5177/?noanim', { waitUntil: 'domcontentloaded', timeout: 60000 })
await new Promise(r => setTimeout(r, 3000))
await p.evaluate(() => { const s = document.createElement('style'); s.textContent='*{transition-duration:0s!important;animation-duration:0s!important}'; document.head.appendChild(s)
  const el=[...document.querySelectorAll('.nav-has')].find(e=>/services/i.test(e.textContent)); el.dispatchEvent(new MouseEvent('mouseover',{bubbles:true,relatedTarget:document.body})) })
await new Promise(r => setTimeout(r, 700))
console.log(JSON.stringify(await p.evaluate(() => {
  const panel=[...document.querySelectorAll('.nav-mega')].find(e=>e.classList.contains('open'))
  return [...panel.querySelectorAll('.nm-seg')].map(sg => ({
    name: Math.round(sg.querySelector('em').getBoundingClientRect().left),
    sub: sg.querySelector('.nm-seg-sub a, .nm-seg-sub span') ? Math.round(sg.querySelector('.nm-seg-sub a, .nm-seg-sub span').getBoundingClientRect().left) : null }))
}), null, 0))
await b.close()
