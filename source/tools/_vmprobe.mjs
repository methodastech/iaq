import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:57375/design.html?v=' + Date.now(), { waitUntil: 'networkidle2', timeout: 90000 })
await p.evaluate(() => document.querySelector('.vm-06').scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 2500))
console.log(JSON.stringify(await p.evaluate(() => {
  const out = []
  for (const sel of ['.vm-06 .b2', '.vm-02 rect.f', '.vm-04 .tools rect']) {
    const e = document.querySelector(sel); const cs = getComputedStyle(e); const bb = e.getBBox(); const q = e.getBoundingClientRect()
    // every stylesheet rule that matches and sets width, x, transform
    const hits = []
    for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules } catch (err) { continue }
      const walk = rs => { for (const r of rs) { if (r.cssRules && !r.selectorText) { walk(r.cssRules); continue } if (!r.selectorText) continue; try { if (e.matches(r.selectorText) && /width|transform|\bx\b|scale|translate/.test(r.style.cssText)) hits.push((sh.href || 'inline').slice(-24) + ' :: ' + r.selectorText.slice(0, 60) + ' {' + r.style.cssText.slice(0, 90) + '}') } catch (err) {} } }
      walk(rules) }
    out.push({ sel, attrW: e.getAttribute('width'), cssW: cs.width, bbW: Math.round(bb.width), clientW: Math.round(q.width), transform: cs.transform, anim: cs.animationName, hits })
  }
  return out
}), null, 1))
await b.close()
