import puppeteer from 'puppeteer-core'
const BASE = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 900 })
const go = async r => { await p.goto(BASE + r, { waitUntil: 'networkidle0', timeout: 60000 }); await new Promise(x => setTimeout(x, 700)) }

await go('/news')
const arts = await p.evaluate(() => [...document.querySelectorAll('a[href^="/news/"]')].map(a => a.getAttribute('href')).filter((v, i, s) => s.indexOf(v) === i))
console.log('news article routes:', arts.length, arts.slice(0, 3).join(' '))
for (const r of arts.slice(0, 2)) {
  await go(r)
  console.log('  ' + r + ' -> ' + JSON.stringify(await p.evaluate(() => {
    const m = document.querySelector('main') || document.body
    const paras = [...m.querySelectorAll('p')].map(x => x.innerText.trim()).filter(x => x.length > 60)
    return { h1: document.querySelector('h1')?.textContent.trim().slice(0, 50), bodyParas: paras.length, words: paras.join(' ').split(/\s+/).length, firstPara: paras[0]?.slice(0, 90) }
  })))
}
await go('/careers')
console.log('careers  ' + JSON.stringify(await p.evaluate(() => {
  const m = document.querySelector('main') || document.body
  const t = m.innerText
  const heads = [...m.querySelectorAll('h3, h4')].map(h => h.textContent.trim())
  return { headings: heads.length, sample: heads.slice(0, 6), mentionsApply: /apply/i.test(t), cultureSection: /culture|training|activities/i.test(t), wordCount: t.split(/\s+/).length }
})))
await b.close()
