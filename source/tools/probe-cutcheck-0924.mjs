// for each flagged container: is any VISIBLE text actually outside the container's box (a real clip), or is the
// scrollHeight only the unscaled layout of a transformed child (a false flag)?
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
for (const [route, w] of [['/', 1440], ['/', 1024], ['/services', 1440]]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 900 })
  await p.goto('http://localhost:5177' + route, { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1200))
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 70)) } scrollTo(0, 0); await new Promise(r => setTimeout(r, 800)) })
  console.log(route, w, JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.cyc-fit, .ig-card, .sm-uc-pic, .fab-stage')].slice(0, 12).map(c => {
    const cr = c.getBoundingClientRect(); let outside = []
    const tw = document.createTreeWalker(c, NodeFilter.SHOW_TEXT, { acceptNode: n => n.nodeValue.trim() ? 1 : 3 })
    while (tw.nextNode()) { const n = tw.currentNode; const el = n.parentElement; const s = getComputedStyle(el); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < .05) continue; const rg = document.createRange(); rg.selectNodeContents(n); for (const q of rg.getClientRects()) { if (q.width < 2) continue; if (q.bottom > cr.bottom + 1 || q.right > cr.right + 1 || q.top < cr.top - 1) outside.push(n.nodeValue.trim().slice(0, 24) + ' (' + Math.round(q.bottom - cr.bottom) + 'b,' + Math.round(q.right - cr.right) + 'r)') } }
    return c.className.split(' ')[0] + ': ' + (outside.length ? 'REAL ' + outside.slice(0, 3).join(' | ') : 'false flag')
  }))))
  await p.close()
}
await b.close()
