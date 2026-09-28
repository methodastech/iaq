import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/careers', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 3000))
console.log(await p.evaluate(() => { const h = document.querySelector('.head h1'); const out = { style: h.getAttribute('style'), attrs: [...h.attributes].map(a => a.name + '=' + a.value.slice(0, 40)), anims: h.getAnimations().map(a => [a.animationName || a.constructor.name, a.playState, a.currentTime]), rules: [] }
  for (const s of document.styleSheets) { try { for (const r of s.cssRules) { const walk = (r) => { if (r.cssRules) [...r.cssRules].forEach(walk); else if (r.selectorText && h.matches(r.selectorText.replace(/::?(before|after)/g,'')) && /opacity|animation/.test(r.style.cssText)) out.rules.push((s.href||'inline').slice(-30) + ' :: ' + r.selectorText.slice(0, 80) + ' {' + r.style.cssText.slice(0, 120) + '}') }; walk(r) } } catch (e) {} }
  return JSON.stringify(out, null, 1) }))
await b.close()
