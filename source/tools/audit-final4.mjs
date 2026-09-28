import puppeteer from 'puppeteer-core'
const BASE = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
await p.goto(BASE + '/checklist.html', { waitUntil: 'networkidle0', timeout: 60000 }); await new Promise(r => setTimeout(r, 800))
const r = await p.evaluate(() => { const t = document.body.innerText; const boxes = [...document.querySelectorAll('input[type=checkbox]')]; const secs = [...document.querySelectorAll('h2, .sec h2, [class*=sec] h2')].map(h => h.textContent.trim()).filter(x => /QA review/.test(x)); return { checkboxes: boxes.length, ticked: boxes.filter(b => b.checked).length, qaHeads: secs, jump: [...document.querySelectorAll('.secjump [data-jump], .secjump a')].map(b => b.textContent.trim()), progress: (t.match(/\d+\s*\/\s*\d+/) || [])[0], q01: /P01 · Site-wide · SEO/.test(t), q46: /P46 · Portal link/.test(t) } })
await p.goto(BASE + '/qa.html', { waitUntil: 'networkidle0', timeout: 60000 }); await new Promise(r => setTimeout(r, 800))
const q = await p.evaluate(() => { const t = document.body.innerText; return { rows: document.querySelectorAll('tbody tr').length, doneMentions: (t.match(/Done · host must serve/g) || []).length, pending: (t.match(/pending/g) || []).length, title: document.title } })
console.log(JSON.stringify({ checklist: r, qa: q, errs }, null, 1)); await b.close()
