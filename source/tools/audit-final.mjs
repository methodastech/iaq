/* Final probe of the QA fixes on a built preview. Usage: node tools/audit-final.mjs http://localhost:5178 <shotDir> */
import puppeteer from 'puppeteer-core'
const [BASE, OUT] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 800 })
const go = async r => { await p.goto(BASE + r, { waitUntil: 'networkidle0', timeout: 60000 }); await new Promise(r => setTimeout(r, 600)) }
const out = {}
await go('/about')
out.contrast = await p.evaluate(() => { const tok = getComputedStyle(document.documentElement).getPropertyValue('--faint').trim(); let n = 0, old = 0; for (const e of document.querySelectorAll('body *')) { const c = getComputedStyle(e).color; if (c === 'rgb(102, 112, 138)') n++; if (c === 'rgb(130, 139, 158)') old++ } return { token: tok, elementsUsingNew: n, elementsUsingOld: old } })
out.footer = await p.evaluate(() => { const t = document.body.innerText; return { staffLogin: (t.match(/Staff login/g) || []).length, memberPortal: (t.match(/Member portal/g) || []).length, memberLogin: (t.match(/Member login/g) || []).length, startProject: (t.match(/Start a project/gi) || []).length } })
await go('/services')
out.services = await p.evaluate(() => ({ abbr: document.querySelectorAll('abbr[title]').length, abbrSample: [...document.querySelectorAll('abbr[title]')].slice(0, 6).map(a => a.textContent + '=' + a.title), glossary: !!document.querySelector('[class*=gloss]'), glossaryText: document.querySelector('[class*=gloss]')?.innerText.slice(0, 160), title: document.title }))
const crumbs = {}
for (const r of ['/services/design', '/markets/ev-battery', '/projects/1', '/about/esg', '/services/epc-construction', '/global-presence']) { await go(r); crumbs[r] = await p.evaluate(() => { const n = document.querySelector('.pg-crumbs'); const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].some(s => /BreadcrumbList/.test(s.textContent)); return n ? { text: n.innerText.replace(/\n/g, ' '), links: n.querySelectorAll('a').length, jsonld: ld } : { missing: true } }) }
out.crumbs = crumbs
await go('/')
out.home = await p.evaluate(() => { const a = [...document.querySelectorAll('a')].find(a => /All seven markets/.test(a.textContent)); const strip = a?.closest('section, div')?.innerText.replace(/\n/g, ' · ').slice(0, 220); return { allSeven: a ? a.getAttribute('href') : null, strip, h1: document.querySelector('h1')?.textContent.trim() } })
await go('/policies')
out.policies = await p.evaluate(() => { const ds = [...document.querySelectorAll('details.gdraft')]; ds.forEach(d => d.open = true); return { drafts: ds.length, summaries: ds.map(d => d.querySelector('summary')?.innerText.slice(0, 90)), firstLines: ds[0] ? ds[0].innerText.split('\n').slice(1, 4).map(s => s.slice(0, 100)) : [] } })
const el = await p.$('details.gdraft'); if (el) { await el.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 400)); const box = await el.boundingBox(); await p.screenshot({ path: OUT + '/policies-draft.png', clip: { x: 0, y: Math.max(0, box.y - 60), width: 1280, height: Math.min(800, box.height + 120) } }) }
console.log(JSON.stringify(out, null, 1))
await b.close()
