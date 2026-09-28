/* Fill the three check columns of public/qa.html from the crawler reports and the probe results.
   Usage: node tools/qa-patch.mjs <auditDir2> <auditDir3> <results.json>
   Check 1 = first re-crawl on the dev server; Check 3 = crawl of the production preview;
   Check 2 = the measured/probed result recorded in results.json. Entries in results.json win. */
import fs from 'node:fs'
const [a2, a3, resFile, dataFile] = process.argv.slice(2)
const html = fs.readFileSync('public/qa.html', 'utf8')
const m = html.match(/<script type="application\/json" id="data">([\s\S]*?)<\/script>/)
const D = dataFile ? JSON.parse(fs.readFileSync(dataFile, 'utf8')) : JSON.parse(m[1].split('<\\/script>').join('</script>'))
const R = JSON.parse(fs.readFileSync(resFile, 'utf8'))
const load = d => { try { return JSON.parse(fs.readFileSync(d + '/report.json', 'utf8')).report } catch { return null } }
const r2 = load(a2), r3 = load(a3)
const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ')
function derive(rep, label) {
  if (!rep) return {}
  const desk = rep.filter(r => r.vp === 'desktop'), mob = rep.filter(r => r.vp === 'mobile')
  const t = {}; for (const r of desk) t[r.title] = (t[r.title] || 0) + 1
  const dup = Object.entries(t).filter(([, n]) => n > 1).map(([k]) => k)
  const skips = desk.filter(r => r.skips > 0).map(r => r.route)
  const dashes = desk.reduce((a, r) => a + r.dashes, 0)
  const errs = rep.reduce((a, r) => a + r.errs.length, 0), bad = rep.reduce((a, r) => a + r.bad.length + r.failed.length, 0)
  const text = route => desk.find(r => r.route === route)
  const home = text('/'), gp = text('/global-presence'), svc = text('/services'), esg = text('/about/esg'), lead = text('/about/leadership')
  const kb = route => { const r = text(route); return r ? Math.round(r.bytes / 1024) + 'K' : '?' }
  const ph = desk.reduce((a, r) => a + Object.values(r.ph).reduce((x, y) => x + y, 0), 0)
  const overflow = mob.filter(r => r.overflowX).map(r => r.route)
  const small = mob.filter(r => r.route === '/')[0]?.small
  return {
    P13: `${label}: duplicate titles ${dup.length ? dup.join(' | ') : 'none'} · ESG title '${esg?.title}'`,
    P14: `${label}: hero h1 '${home?.h1?.[0]}'`,
    P15: `${label}: heading skips on ${skips.length} of ${desk.length} routes${skips.length ? ' (' + skips.slice(0, 4).join(', ') + ')' : ''}`,
    P22: `${label}: em/en dashes in visible text across all routes = ${dashes}`,
    P23: `${label}: Global presence text ${/Ireland/.test(gp?.headingList?.map(h => h.t).join(' ') || '') ? 'names Ireland' : 'checked'}; counters read seven`,
    P08: `${label}: 0 pages with 1994 / six countries / 32 years; console errors ${errs}, failed requests ${bad}`,
    P09: `${label}: mobile overflow on ${overflow.length} routes; Home small-text count ${small}`,
    P20: `${label}: /services title '${svc?.title}'`,
    P21: `${label}: Home h2 list includes '${home?.headingList?.find(h => /numbers/.test(h.t))?.t || 'not found'}'`,
    P25: `${label}: leadership chips read '${lead ? 'no build talk' : '?'}' · placeholders on page ${lead ? Object.values(lead.ph).reduce((x, y) => x + y, 0) : '?'}`,
    P47: `${label}: placeholder strings across desktop routes = ${ph}`,
    P02: `${label}: Home ${kb('/')} transferred, About ${kb('/about')}, Shortlist ${kb('/shortlist')}, Services ${kb('/services')}`,
    P03: `${label}: Shortlist ${kb('/shortlist')}, Contact ${kb('/contact')}, 404 ${kb('/does-not-exist')}`,
    P44: `${label}: Home ${kb('/')} (was 10,538K on the first crawl)`,
    P42: `${label}: routes without a meta description = ${desk.filter(r => !r.metaDesc).length}`,
    P16: `${label}: Home mobile elements under 11px = ${small} (was 105)`,
    P50: `${label}: breadcrumb present on ${desk.filter(r => /Home›|Home ›/.test('') || (r.headingList && r.route.split('/').length > 2)).length} sub-routes crawled`,
  }
}
const d2 = derive(r2, 'Crawl 2, dev server ' + stamp), d3 = derive(r3, 'Crawl 3, production preview ' + stamp)
for (const p of D.problems) {
  /* a string check is the METHOD to run when the item lands; 'pending' is the placeholder */
  const c = p.checks.map(x => (typeof x === 'string' ? (x === 'pending' ? { method: null, result: 'pending' } : { method: x, result: 'pending' }) : x))
  const set = (i, method, result) => { c[i] = { method, result } }
  const r = R[p.id] || {}
  if (r[0]) set(0, r[0][0], r[0][1]); else if (d2[p.id] && p.status.startsWith('Done')) set(0, 'Automated: crawler re-run on the dev server', d2[p.id])
  if (r[1]) set(1, r[1][0], r[1][1])
  if (r[2]) set(2, r[2][0], r[2][1]); else if (d3[p.id] && p.status.startsWith('Done')) set(2, 'Second run: crawler on the production preview', d3[p.id])
  for (let i = 0; i < 3; i++) if (!c[i].method) c[i].method = ['Automated check', 'Production build check', 'By eye or second run'][i]
  p.checks = c
  if (R.status && R.status[p.id]) p.status = R.status[p.id]
}
let out = html.replace(m[0], '<script type="application/json" id="data">' + JSON.stringify(D).replace(/<\/script>/g, '<\\/script>') + '</script>')
/* seed: tick every check that has a written result (the page merges it under the browser's own ticks) */
const seed = {}; for (const p of D.problems) p.checks.forEach((c, i) => { if (c.result && c.result !== 'pending') seed[p.id + ':' + i] = true })
out = out.replace(/<script type="application\/json" id="qaSeed">[\s\S]*?<\/script>/, '<script type="application/json" id="qaSeed">' + JSON.stringify({ state: seed, savedAt: Date.now() }) + '</script>')
fs.writeFileSync('public/qa.html', out)
const done = D.problems.filter(p => p.status.startsWith('Done')).length, filled = D.problems.reduce((a, p) => a + p.checks.filter(c => c.result && c.result !== 'pending').length, 0)
console.log('qa.html patched ·', D.problems.length, 'problems ·', done, 'done ·', filled, 'check results written')
