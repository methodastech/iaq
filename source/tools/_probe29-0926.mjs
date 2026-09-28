import puppeteer from 'puppeteer-core'
const OUT = process.argv[2], TAG = process.argv[3] || 'st'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 200000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)))
await p.goto('http://localhost:5177/services/energy-management?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 2500))
await p.evaluate(() => { const e = document.querySelector('.dcs3-stage'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 140) }); await new Promise(r => setTimeout(r, 6000))
const wrap = await p.$('.dcs3-stage')
await wrap.screenshot({ path: `${OUT}/${TAG}-all.png` })
const overlaps = {}
for (const k of ['plant', 'tes', 'net', 'ets', 'bld']) {
  await p.evaluate(k => document.querySelector(`.dcs3-num[data-k="${k}"]`).click(), k); await new Promise(r => setTimeout(r, 2800))
  await wrap.screenshot({ path: `${OUT}/${TAG}-${k}.png` })
  overlaps[k] = await p.evaluate(() => { const els = [...document.querySelectorAll('.dcs3-labels > *')].filter(e => getComputedStyle(e).opacity > 0.5 && e.style.visibility !== 'hidden' && e.offsetWidth); const r = els.map(e => [e, e.getBoundingClientRect()]); const out = []
    for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) { const a = r[i][1], c = r[j][1]; if (a.left < c.right - 2 && c.left < a.right - 2 && a.top < c.bottom - 2 && c.top < a.bottom - 2) out.push((r[i][0].textContent || '').slice(0, 20) + ' x ' + (r[j][0].textContent || '').slice(0, 20)) }
    return out })
}
console.log(JSON.stringify({ overlaps, errs }, null, 1))
await b.close(); process.exit(0)
