/* Content that is missing by ABSENCE rather than by a labelled slot. Usage: node tools/audit-thin.mjs <base> */
import puppeteer from 'puppeteer-core'
const BASE = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 900 })
const go = async r => { await p.goto(BASE + r, { waitUntil: 'networkidle0', timeout: 60000 }); await new Promise(x => setTimeout(x, 700)) }

await go('/news')
console.log('NEWS  ' + JSON.stringify(await p.evaluate(() => {
  const links = [...document.querySelectorAll('a')]
  const out = links.filter(a => /iaqtechnology|iaq\.com|http/i.test(a.getAttribute('href') || '') && !/^\/|^#/.test(a.getAttribute('href') || ''))
  return { articleLinksOffSite: out.length, sampleOffSite: out.slice(0, 3).map(a => a.getAttribute('href')), internalArticleRoutes: links.filter(a => /^\/news\//.test(a.getAttribute('href') || '')).length }
})))

await go('/careers')
console.log('CAREERS  ' + JSON.stringify(await p.evaluate(() => {
  const rows = [...document.querySelectorAll('li, tr, article, .job, [class*=role]')].filter(e => /apply|department|location/i.test(e.innerText) && e.innerText.length < 400)
  return { roleRows: rows.length, firstRow: rows[0]?.innerText.replace(/\n/g, ' | ').slice(0, 140), hasDescriptions: rows.some(r => r.innerText.length > 220) }
})))

await go('/about/commitment')
console.log('COMMITMENT  ' + JSON.stringify(await p.evaluate(() => {
  const t = document.body.innerText
  const certs = ['ISO 9001', 'ISO 14001', 'ISO 45001', 'UKAS', 'CIDB', 'OSH']
  const pdfLinks = [...document.querySelectorAll('a[href$=".pdf"], a[download]')].length
  return { certsNamed: certs.filter(c => t.includes(c)), pdfLinks, downloadable: pdfLinks > 0 }
})))

await go('/about/leadership')
console.log('LEADERSHIP  ' + JSON.stringify(await p.evaluate(() => {
  const cards = [...document.querySelectorAll('article, li, [class*=card]')].filter(e => /to be confirmed|TBC/i.test(e.innerText))
  return { emptyCards: cards.length, portraits: document.querySelectorAll('img').length, names: [...document.querySelectorAll('h3')].map(h => h.textContent.trim()).slice(0, 8) }
})))

await go('/projects')
console.log('PROJECTS  ' + JSON.stringify(await p.evaluate(() => ({ cards: document.querySelectorAll('a[href^="/projects/"]').length, readout: document.querySelector('[class*=count], [class*=readout]')?.innerText.slice(0, 40) }))))
await b.close()
