/* 22 Oct 2026 (Bazil, walk-through note 4: "having a full stop at the title really makes it look worse ... make sure
   there is no full stop at the title. Commas are fine"): strips the trailing full stop from every heading in the site's
   source. Four patterns: a plain heading (<h2>The delivery cycle.</h2>), a heading whose last word sits in an <em>
   (<em>one page.</em></h2>), a heading prop written as a fragment (title={<>Six stages, <em>one page.</em></>}) and a
   heading prop written as a string (title="Six stages, one page."). Internal pages (the portal, the Codex, the booth)
   are left alone. Usage: node tools/nofullstop-1022.mjs [--dry] */
import fs from 'node:fs'
import path from 'node:path'
const dry = process.argv.includes('--dry')
const SKIP = /Codex|Portal|Booth|Direction|Presentation|DeckSlides|codex\/|booth\/|portal\/|sitemap\.js|search\.js|projectDetail\.js|booth\.js|boothQr|history\.js|news\.js|roles\.js|projects\.js/
const PROPS = '(?:title|head|heading|headline|whatHead|whyHead|servicesHead|painsHead|modelsHead|demandsHead|deliverHead|scopeTitle|cycleHead|closeTitle)'
const files = []
const walk = d => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); const st = fs.statSync(p); if (st.isDirectory()) { if (!/_backups|node_modules/.test(p)) walk(p) } else if (/\.(jsx|js)$/.test(f) && !SKIP.test(p)) files.push(p) } }
walk('src/pages'); walk('src/components'); walk('src/data')
let total = 0
const rules = [
  /* <em>one page.</em></h2>  and  <em>one page.</em></> inside a heading prop */
  [/\.(<\/em>\s*<\/h[1-3]>)/g, '$1'],
  [new RegExp(`(${PROPS}=\\{<>(?:(?!<\\/>)[\\s\\S])*?)\\.((?:<\\/em>)?\\s*<\\/>\\})`, 'g'), '$1$2'],
  [new RegExp(`(${PROPS}:\\s*<>(?:(?!<\\/>)[\\s\\S])*?)\\.((?:<\\/em>)?\\s*<\\/>)`, 'g'), '$1$2'],
  /* <h2>The delivery cycle.</h2> */
  [/\.(\s*<\/h[1-3]>)/g, '$1'],
  /* title="Six stages, one page."  and  head: 'The problems EFM solves.' */
  [new RegExp(`(${PROPS}=")([^"\\n]*?)\\."`, 'g'), '$1$2"'],
  [new RegExp(`(${PROPS}:\\s*')([^'\\n]*?)\\.'`, 'g'), "$1$2'"],
  [new RegExp(`(${PROPS}:\\s*")([^"\\n]*?)\\."`, 'g'), '$1$2"'],
]
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8'); let t = s; const hits = []
  for (const [re, rep] of rules) { const before = t; t = t.replace(re, (...m) => { hits.push(m[0].replace(/\s+/g, ' ').slice(0, 70)); return m[0].replace(re, rep) }); if (t === before) continue }
  if (t !== s) { total += hits.length; console.log(f, hits.length); for (const h of hits) console.log('   ', h); if (!dry) fs.writeFileSync(f, t) }
}
console.log((dry ? 'would change' : 'changed'), total, 'headings in', files.length, 'files')
