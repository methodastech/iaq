import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/portal/codex?admin', { waitUntil: 'networkidle0' })
await p.evaluate(() => { document.querySelector('.rx').scrollIntoView(); document.querySelector('.rx-n.n-u').click() })
await new Promise(r => setTimeout(r, 700))
console.log(await p.evaluate(() => {
  const glow = []
  document.querySelectorAll('.rx *').forEach(e => { const s = getComputedStyle(e); const bs = s.boxShadow, f = s.filter
    const blur = bs !== 'none' && bs.split(/,(?![^(]*\))/).some(x => !/inset/.test(x) && /(\d+(\.\d+)?)px\s+(-?\d+(\.\d+)?)px\s+(\d+(\.\d+)?)px/.test(x) && +x.match(/px\s+(-?[\d.]+)px\s+([\d.]+)px/)[2] > 0)
    if (blur || (f && f !== 'none')) glow.push(e.tagName + '.' + (e.className.baseVal ?? e.className) + ' ' + (blur ? bs : f)) })
  return 'glowing elements in the map: ' + glow.length + (glow.length ? '\n' + glow.slice(0, 5).join('\n') : '')
}))
await b.close()
