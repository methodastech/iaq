import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 950 })
await p.goto('http://localhost:5177/?noanim', { waitUntil: 'domcontentloaded', timeout: 60000 })
await new Promise(r => setTimeout(r, 3000))
await p.evaluate(() => { const s=document.createElement('style'); s.textContent='*{transition-duration:0s!important;animation-duration:0s!important}'; document.head.appendChild(s) })
for (const hub of ['services','about','markets','careers']) {
  await p.evaluate(h => { document.querySelectorAll('.nav-has').forEach(e=>e.dispatchEvent(new MouseEvent('mouseout',{bubbles:true,relatedTarget:document.body})))
    const el=[...document.querySelectorAll('.nav-has')].find(e=>new RegExp(h,'i').test(e.textContent)); el && el.dispatchEvent(new MouseEvent('mouseover',{bubbles:true,relatedTarget:document.body})) }, hub)
  await new Promise(r => setTimeout(r, 500))
  console.log(hub.toUpperCase(), JSON.stringify(await p.evaluate(() => {
    const panel=[...document.querySelectorAll('.nav-mega')].find(e=>e.classList.contains('open'))
    const cols=panel.querySelector('.nm-cols')
    return { gap: getComputedStyle(cols).columnGap, colsBg: getComputedStyle(cols).backgroundColor,
      cols: [...panel.querySelectorAll('.nm-col')].map(c => String(c.className).replace('nm-col nm-set ','') + '=' + getComputedStyle(c).backgroundColor) }
  })))
}
await b.close()
