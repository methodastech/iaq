/* Does every page actually render the blocks the framework declares for it?
   Heuristic: look for each block's distinctive words in the page source file. */
import { PAGES } from './src/data/sitemap.js'
import { readFileSync, existsSync } from 'fs'

const FILE = {
  home:'Home', about:'About', history:'History', leadership:'Leadership', esg:'Esg', contact:'Contact',
  'services-hub':'ServicesHub','svc-design':'ServiceDesign','svc-procurement':'ServiceProcurement',
  'svc-construction':'ServiceConstruction','svc-commissioning':'ServiceCommissioning','svc-maintenance':'ServiceMaintenance',
  'markets-hub':'MarketsHub','mkt-semiconductor':'MarketSemiconductor','mkt-data-centre':'MarketDataCentre',
  'mkt-ev-battery':'MarketEvBattery','mkt-photovoltaics':'MarketPhotovoltaics','mkt-district-cooling':'MarketDistrictCooling',
  'mkt-bio-lifescience':'MarketBioLifescience','mkt-food-beverage':'MarketFoodBeverage',
  projects:'Projects', project:'ProjectDetail', 'global-presence':'GlobalPresence',
  news:'News', article:'Article', careers:'Careers', investors:'Investors', policies:'Policies', exhibition:'Exhibition',
}
const STOP = new Set(['the','and','a','of','to','in','on','for','with','it','is','by','as','at','one','two','three','four','five','six','seven'])
const report = []
for (const p of PAGES) {
  const base = FILE[p.id]; if (!base) { report.push([p.label,'NO FILE MAP',[]]); continue }
  let src = ''
  for (const f of [`src/pages/${base}.jsx`, `src/components/MarketPage.jsx`, `src/scenes/${base.toLowerCase()}.js`, `src/data/news.js`, `src/data/projectDetail.js`])
    if (existsSync(f)) src += readFileSync(f,'utf8')
  const low = src.toLowerCase()
  const missing = p.blocks.filter(b => {
    const words = b.toLowerCase().replace(/[^a-z0-9 &]/g,' ').split(/\s+/).filter(w => w.length>3 && !STOP.has(w))
    if (!words.length) return false
    return !words.some(w => low.includes(w))
  })
  if (missing.length) report.push([p.label, p.route, missing])
}
if (!report.length) console.log('All declared blocks present on every page.')
else { console.log('Pages with blocks that may be missing:\n'); report.forEach(([l,r,m]) => console.log(`  ${l} (${r}): ${m.join(' | ')}`)) }
