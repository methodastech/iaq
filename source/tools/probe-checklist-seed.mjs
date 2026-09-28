/* 15 Sep: does /checklist.html adopt the baked seed, both in a fresh browser and over an older local save? */
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const count = p => p.evaluate(() => {
  const boxes = [...document.querySelectorAll('input[type="checkbox"]')]
  const on = boxes.filter(x => x.checked).length
  const q31 = document.querySelector('[data-id="q31"] input, #q31, input[data-id="q31"]')
  const m56 = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /News: all 70/.test(e.textContent))
  return { boxes: boxes.length, checked: on, q31: q31 ? q31.checked : 'n/a', m56Shown: !!m56 }
})
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 150)))
await p.goto('http://localhost:5177/checklist.html', { waitUntil: 'networkidle0' })
console.log('fresh browser:', JSON.stringify(await count(p)), 'errors', errs.length)
const keys = await p.evaluate(() => Object.keys(localStorage))
/* simulate an older local save (numeric savedAt from 14 Sep, fewer ticks) and reload */
await p.evaluate(ks => { for (const k of ks) { try { const v = JSON.parse(localStorage.getItem(k)); if (v && typeof v === 'object' && 'done' in v) { v.savedAt = 1789000000000; v.done = { g3: true }; localStorage.setItem(k, JSON.stringify(v)) } } catch {} } }, keys)
await p.reload({ waitUntil: 'networkidle0' })
console.log('over an older local save:', JSON.stringify(await count(p)), '| storage keys', keys)
await b.close()
