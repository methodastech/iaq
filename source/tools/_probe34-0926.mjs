import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 90000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/services/epc-construction?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 4000))
const H = await p.evaluate(() => document.documentElement.scrollHeight)
for (let y = 0; y < H; y += 300) { await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 200)) }
await new Promise(r => setTimeout(r, 1500))
const r = await p.evaluate(() => { const h = document.getElementById('un-del-h'); const cs = getComputedStyle(h)
  const rules = []; for (const sh of document.styleSheets) { try { for (const ru of sh.cssRules) { if (ru.selectorText && h.matches(ru.selectorText) && /opacity|animation|transform/.test(ru.cssText)) rules.push(ru.cssText.slice(0, 180)) } } catch (e) {} }
  return { style: h.getAttribute('style'), op: cs.opacity, tf: cs.transform, anim: cs.animationName, trans: cs.transition.slice(0, 120), parentOp: getComputedStyle(h.parentElement).opacity, rules, dataset: { ...h.dataset }, armed: document.querySelector('.un-page').className } })
console.log(JSON.stringify(r, null, 1)); await b.close(); process.exit(0)
