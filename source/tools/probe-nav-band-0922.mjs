/* 22 Sep, late: the About / Services / Careers menus (photo card, no repeated icon, unit cards), the closing band
   (left: brand then links; right: the ask then contacts; no Copy, no choices), and the restored globe (7 chips).
   Usage: node tools/probe-nav-band-0922.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 200000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 150)))
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/about', { waitUntil: 'domcontentloaded' }); await wait(3000)
/* the menu's arrival animations freeze at frame 0 in this capture setup: finish them instantly to read the end state */
await p.addStyleTag({ content: '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important}' })
for (const name of ['About', 'Services', 'Careers']) {
  const h = await p.evaluateHandle(n => [...document.querySelectorAll('.nav a, .nav button')].find(a => a.textContent.trim() === n), name)
  await h.hover(); await wait(3000)
  const info = await p.evaluate(() => { const m = document.querySelector('.nav-mega.open'); if (!m) return null; return { leadIcons: m.querySelectorAll('.nm-lead-ic').length, units: [...m.querySelectorAll('.nm-seg-t em')].map(e => e.textContent), subsBorder: m.querySelector('.nm-seg-sub') ? getComputedStyle(m.querySelector('.nm-seg-sub')).borderTopWidth : null } })
  console.log(name, JSON.stringify(info))
  const box = await p.evaluate(() => { const r = document.querySelector('.nav-mega.open')?.getBoundingClientRect(); return r && { x: r.left, y: r.top, width: r.width, height: r.height } }); if (box) await p.screenshot({ path: `${OUT}/menu-${name}.png`, clip: box })
  await p.mouse.move(700, 800); await wait(600)
}
await p.goto('http://localhost:5177/?footer=a', { waitUntil: 'domcontentloaded' }); await wait(3000)
console.log('band', JSON.stringify(await p.evaluate(() => { const R = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top + scrollY)] }
  return { brand: R('.cb-left .cb-brand'), links: R('.cb-left .f-cols'), ask: R('.cb-right .cb-ask'), ledger: R('.cb-right .cb-ledger'), copy: !!document.querySelector('.cb-copy'), pick: !!document.querySelector('.cb-pick'), cta: document.querySelector('.cb-cta')?.textContent, tags: document.querySelectorAll('.globe-tag').length, card: !!document.querySelector('.globe-card'), overflow: document.documentElement.scrollWidth - innerWidth } })))
const y = await p.evaluate(() => document.querySelector('.close3d').getBoundingClientRect().top + scrollY - 30); await p.evaluate(y => window.scrollTo(0, y), y); await wait(1500)
await p.screenshot({ path: `${OUT}/band-new.jpg`, type: 'jpeg', quality: 80 })
console.log('errs', JSON.stringify(errs))
await b.close()
