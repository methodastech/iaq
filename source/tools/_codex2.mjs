import puppeteer from 'puppeteer-core'
const SP = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
const open = async (w) => {
  const p = await b.newPage()
  const errs = []
  p.on('pageerror', e => errs.push(String(e).slice(0, 90)))
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 90)) })
  await p.setViewport({ width: w, height: 950 })
  await p.goto('http://localhost:5177/portal/codex', { waitUntil: 'networkidle0', timeout: 90000 })
  await new Promise(r => setTimeout(r, 1800))
  if (await p.$('input')) { await p.type('input', 'iaqsolution321'); await p.keyboard.press('Enter'); await new Promise(r => setTimeout(r, 2500)) }
  return { p, errs }
}
/* tutorials + map, at 1440 */
{
  const { p, errs } = await open(1440)
  const t = await p.evaluate(() => {
    const txt = document.body.innerText
    const heads = [...document.querySelectorAll('h2,h3')].map(h => h.textContent.trim().slice(0, 48))
    const tut = [...document.querySelectorAll('*')].filter(e => /tutorial|watch|play/i.test(e.textContent || '') && e.children.length === 0).length
    const posters = document.querySelectorAll('[class*="vid"],[class*="tut"],[class*="play"]').length
    const glow = [...document.querySelectorAll('svg *, [class*="map"] *')].filter(e => { const s = getComputedStyle(e); return /blur|drop-shadow/.test(s.filter) }).length
    return { heads: heads.slice(0, 24), tutWords: tut, posters, glowyNodes: glow, hasTutorialWord: /tutorial/i.test(txt) }
  })
  console.log('CODEX 1440', JSON.stringify(t, null, 1), 'errs', errs.length)
  await p.screenshot({ path: SP + '/v-codex-1440.png' })
  await p.close()
}
/* overlap + clipping sweep at three widths */
for (const w of [1440, 1024, 390]) {
  const { p, errs } = await open(w)
  const o = await p.evaluate(() => {
    const over = document.documentElement.scrollWidth > window.innerWidth + 1
    const clipped = [...document.querySelectorAll('h1,h2,h3,p,em,b,span,a')].filter(e => {
      const r = e.getBoundingClientRect()
      return r.width > 0 && (e.scrollWidth > e.clientWidth + 2) && getComputedStyle(e).overflow !== 'visible'
    }).length
    return { scrollW: document.documentElement.scrollWidth, win: window.innerWidth, sideways: over, clipped }
  })
  console.log(`CODEX ${w}`, JSON.stringify(o), 'errs', errs.length, errs.slice(0, 2))
  await p.close()
}
await b.close()
