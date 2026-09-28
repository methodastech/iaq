// the live loader's knockout sits exactly on the mark, at rest and through the settle
import puppeteer from 'puppeteer-core'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu'] })
for (const [w, h, mob] of [[1440, 900, false], [390, 844, true], [2560, 1300, false]]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: h, isMobile: mob, hasTouch: mob }); await p.setCacheEnabled(false)
  p.goto('http://localhost:57375/?ldhold=1', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {})
  const rows = []
  for (let i = 0; i < 12; i++) { await sleep(300); rows.push(await p.evaluate(() => { const u = document.querySelector('.ld-ui'), l = document.getElementById('ldLogoFill'); if (!u || !l) return null; const cs = getComputedStyle(u, '::before'); const a = l.getBoundingClientRect(); return { lw: Math.round(a.width), kw: cs.width, mask: cs.webkitMaskImage.slice(-24), fill: l.style.getPropertyValue('--fill') } })) }
  console.log(w, JSON.stringify(rows.filter(Boolean).slice(-1)[0]))
  await p.close()
}
await b.close()
