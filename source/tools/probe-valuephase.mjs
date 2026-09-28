/* 24 Sep: do the six value scenes run on their own phase, and is there any moment when all six are near empty? */
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/careers', { waitUntil: 'networkidle0', timeout: 60000 })
await p.evaluate(() => document.querySelector('.cu-vgrid').scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 1500))
const out = await p.evaluate(async () => {
  const g = document.querySelector('.cu-vgrid'); const vms = [...g.querySelectorAll('.vm')]
  const anims = document.getAnimations().filter(a => g.contains(a.effect?.target))
  const delays = vms.map(v => { const a = anims.find(x => v.contains(x.effect.target)); return a ? a.effect.getTiming().delay : null })
  const vis = v => { const els = [...v.querySelectorAll('svg *')].filter(e => e.tagName !== 'defs' && !e.closest('defs')); const n = els.filter(e => { let o = 1, x = e; while (x && x !== v) { o *= parseFloat(getComputedStyle(x).opacity); x = x.parentElement } return o > 0.1 }).length; return n / els.length }
  const mins = [1, 1, 1, 1, 1, 1]; let allLow = 0
  for (let t = 0; t < 26; t++) { await new Promise(r => setTimeout(r, 300)); const r = vms.map(vis); r.forEach((x, i) => { mins[i] = Math.min(mins[i], x) }); if (r.every(x => x < 0.5)) allLow++ }
  return { live: vms.every(v => v.classList.contains('is-live')), anims: anims.length, delays, minVisible: mins.map(x => x.toFixed(2)), momentsAllSixLow: allLow }
})
console.log(JSON.stringify(out)); await b.close()
