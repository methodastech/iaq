/* 22 Oct 2026 (Bazil: "make sure you have already designed all the parts here, whether login, logout and everything"): the
   member area's states, each captured as its own picture for the Polishing table: the signed-out popover, the sign-in
   form, a wrong passcode, the signed-in popover, the portal gate page, the portal signed in, and signed out again.
   Usage: node tools/polish-states.mjs <base> <outdir>   (writes <outdir>/states/<key>.webp and <outdir>/states.json) */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const [base = 'http://localhost:5177', out = 'public/polish/before'] = process.argv.slice(2)
fs.mkdirSync(`${out}/states`, { recursive: true })
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new',
  args: ['--use-angle=metal', '--enable-gpu', '--hide-scrollbars', '--window-size=1440,900'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 160)))
const list = []
const shot = async (key, name, note, clip) => {
  await new Promise(w => setTimeout(w, 700))
  const file = `states/${key}.webp`
  await p.screenshot({ path: `${out}/${file}`, type: 'webp', quality: 85, clip: clip || { x: 0, y: 0, width: 1440, height: 900 } })
  const text = await p.evaluate(sel => { const el = document.querySelector(sel); return el ? (el.innerText || '').trim().slice(0, 1200) : '' }, '.nl-pop, .nav-login-pop, .nl, [class*="login"], .pt-gate, .gate, body')
  list.push({ key, name, note, img: file, text }); console.log(key.padEnd(22), name)
}
const popClip = async () => {
  const r = await p.evaluate(() => { const el = document.querySelector('.nl-pop, .nav-login-pop, [class*="nl-"]'); if (!el) return null; const q = el.getBoundingClientRect(); return { x: q.left, y: q.top, w: q.width, h: q.height } })
  if (!r || r.w < 100) return { x: 880, y: 0, width: 560, height: 620 }
  const x = Math.max(0, r.x - 40), y = Math.max(0, r.y - 110)
  return { x, y, width: Math.min(1440 - x, r.w + 80), height: Math.min(900 - y, r.h + 150) }
}
/* 1 · signed out: the member icon's popover */
await p.goto(base + '/about', { waitUntil: 'networkidle2', timeout: 90000 }); await new Promise(w => setTimeout(w, 2500))
await p.evaluate(() => { try { localStorage.clear(); sessionStorage.clear() } catch (e) {} })
await p.goto(base + '/about', { waitUntil: 'networkidle2', timeout: 90000 }); await new Promise(w => setTimeout(w, 2500))
const icon = await p.$('.nav-login'); if (!icon) { console.log('no .nav-login'); }
await icon.click(); await new Promise(w => setTimeout(w, 900))
await shot('01-signed-out', 'Member icon, signed out', 'The popover before sign in: what it says, the passcode field, the emergency access line.', await popClip())
/* 2 · a wrong passcode */
const field = await p.$('.nl-pop input, [class*="nl-"] input[type="password"], input[type="password"]')
if (field) { await field.type('wrong-pass'); await p.keyboard.press('Enter'); await new Promise(w => setTimeout(w, 900)); await shot('02-wrong-passcode', 'Wrong passcode', 'The error state after a wrong passcode.', await popClip()) }
/* 3 · signed in (the admin grant), the popover */
await p.goto(base + '/about?admin', { waitUntil: 'networkidle2', timeout: 90000 }); await new Promise(w => setTimeout(w, 2500))
await p.goto(base + '/about', { waitUntil: 'networkidle2', timeout: 90000 }); await new Promise(w => setTimeout(w, 2500))
const icon2 = await p.$('.nav-login'); await icon2.click(); await new Promise(w => setTimeout(w, 900))
await shot('03-signed-in', 'Member icon, signed in', 'The popover once signed in: the Codex, the portal, sign out.', await popClip())
/* 4 · the portal, signed in */
await p.goto(base + '/portal/codex', { waitUntil: 'networkidle2', timeout: 90000 }); await new Promise(w => setTimeout(w, 3000))
await shot('04-portal-signed-in', 'Portal, signed in', 'The member portal shell with its sidebar, on the Codex.')
/* 5 · sign out from the portal, then the gate */
const outBtn = await p.$('.pt-out'); if (outBtn) { await outBtn.click(); await new Promise(w => setTimeout(w, 1500)) }
await shot('05-portal-gate', 'Portal gate, signed out', 'What the portal shows a visitor who is not signed in.')
/* 6 · the Codex gate on its own address */
await p.goto(base + '/codex', { waitUntil: 'networkidle2', timeout: 90000 }); await new Promise(w => setTimeout(w, 2500))
await shot('06-codex-gate', 'Codex gate', 'The Codex address when signed out: it redirects to the portal gate.')
fs.writeFileSync(`${out}/states.json`, JSON.stringify({ at: new Date().toISOString(), states: list, errs }, null, 1))
await b.close(); console.log('done', list.length, 'states ->', out, errs.length ? 'ERRS ' + errs.join(' | ') : '')
