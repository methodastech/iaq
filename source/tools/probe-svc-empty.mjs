import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200))); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text().slice(0, 200)) })
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/services/design', { waitUntil: 'networkidle0', timeout: 60000 })
const h = await p.evaluateHandle(() => [...document.querySelectorAll('h2')].find(e => /What IAQ carries/.test(e.textContent)))
await p.evaluate(e => e.scrollIntoView({ block: 'center' }), h); await new Promise(r => setTimeout(r, 2500))
console.log(JSON.stringify(await p.evaluate(() => {
  const h = [...document.querySelectorAll('h2')].find(e => /What IAQ carries/.test(e.textContent)); const sec = h.closest('section') || h.parentElement.parentElement
  const kids = [...sec.querySelectorAll(':scope > * > *, :scope > *')].slice(0, 14).map(e => ({ t: e.tagName, c: (e.className || '').toString().slice(0, 40), h: Math.round(e.getBoundingClientRect().height), op: getComputedStyle(e).opacity, disp: getComputedStyle(e).display, txt: e.textContent.trim().slice(0, 40) }))
  return { secClass: sec.className, secH: Math.round(sec.getBoundingClientRect().height), html: sec.innerHTML.replace(/\s+/g, ' ').slice(0, 900), kids }
}), null, 1)); console.log('errors', errs)
await p.goto('http://localhost:5177/services/epc-construction', { waitUntil: 'networkidle0', timeout: 60000 })
const h2 = await p.evaluateHandle(() => [...document.querySelectorAll('h2')].find(e => /own model/.test(e.textContent)))
await p.evaluate(e => e.scrollIntoView({ block: 'start' }), h2); await new Promise(r => setTimeout(r, 3000))
console.log(JSON.stringify(await p.evaluate(() => { const h = [...document.querySelectorAll('h2')].find(e => /own model/.test(e.textContent)); const sec = h.closest('section'); const media = [...sec.querySelectorAll('canvas,img,video,iframe')].map(e => ({ t: e.tagName, w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height), src: (e.currentSrc || e.src || '').slice(-50), nat: e.naturalWidth, ready: e.readyState })); return { secH: Math.round(sec.getBoundingClientRect().height), media, classes: [...sec.querySelectorAll(':scope > div > *')].map(e => e.className.toString().slice(0, 30)) } })))
await b.close()
