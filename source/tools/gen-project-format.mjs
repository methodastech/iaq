/* Project description format page (checklist pn3), 15 Sep 2026.
   Builds public/project-format.html from the live registry (src/data/projects.js) and the case study
   field contract (src/data/projectDetail.js), so the per-project "what IAQ still has to send" table is
   always current. Re-run after any project data lands:  node tools/gen-project-format.mjs
   Internal page: noindex, admin bar, stripped from the launch build by tools/prune-launch.mjs. */
import fs from 'node:fs'
import { PROJECTS } from '../src/data/projects.js'
import { PROJECT_DETAIL } from '../src/data/projectDetail.js'

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const qa = fs.readFileSync('public/qa.html', 'utf8')
const barScripts = [...qa.matchAll(/<script\b[^>]*\bsrc="[^"]*"[^>]*><\/script>/g)].map(m => m[0]).join('\n')
const checklist = fs.readFileSync('public/checklist.html', 'utf8')
const pn10 = (checklist.match(/\{id:'pn10'[^\n]*/) || [''])[0]
const signPhotos = new Set([...pn10.matchAll(/prj-(\d{3})/g)].map(m => Number(m[1]) - 1))

const MARKET = { semiconductor: 'Semiconductor', 'data-centre': 'Data Centre', 'ev-battery': 'EV Battery', photovoltaics: 'Photovoltaics',
  'district-cooling': 'District Cooling & Heating', pharma: 'Bio LifeScience', 'bio-lifescience': 'Bio LifeScience', 'food-beverage': 'Food & Beverages' }
const OPTIONAL = [['year', 'Completion year'], ['duration', 'Programme length'], ['brief', 'Brief in three lines'], ['story', 'Challenge, approach and result'],
  ['stages', 'Stages delivered'], ['units', 'Business units'], ['photos', '6 to 10 cleared photographs'], ['video', 'Film (optional)']]

const FIELDS = [
  ['Project title', 'Type and scale, never the client', 'Testing manufacturing plant, 25,000 m² greenfield', 'Page title and headline', 'Yes'],
  ['Market', 'One of the seven markets', 'Semiconductor', 'Fact tile, market filter', 'Yes'],
  ['Location', 'City or state, and country', 'Malaysia', 'Fact tile', 'Yes'],
  ['Completion year', 'The year IAQ handed over', 'IAQ to supply', 'Fact tile, History timeline', 'Yes'],
  ['Programme length', 'As IAQ records it', 'IAQ to supply', 'Fact tile', 'Yes'],
  ['IAQ’s role', 'General contractor, EPCC contractor, cleanroom package', 'General contractor', 'Fact tile', 'Yes'],
  ['Site type', 'Greenfield, brownfield, or greenfield on brownfield', 'Greenfield', 'Fact tile', 'If known'],
  ['Built-up area', 'In m², as recorded', '25,000 m²', 'Fact tile', 'If known'],
  ['Cleanroom class', 'The full class string', 'ISO 6, 7 (Class 1K, 10K)', 'Class and contract', 'If a cleanroom'],
  ['Scope delivered', 'One item per line', 'CSA; MEP and process utilities; cleanroom package', 'Scope delivered', 'Yes'],
  ['Systems', 'One item per line', 'Cleanroom; CSA; M&E; process utilities', 'Scope icons', 'Yes'],
  ['The brief', 'Three short lines: what the client needed', 'IAQ to supply', 'The brief', 'Yes'],
  ['Challenge', 'Two or three sentences', 'IAQ to supply', 'The story', 'Yes'],
  ['Approach', 'Two or three sentences', 'IAQ to supply', 'The story', 'Yes'],
  ['Result', 'Two or three sentences, with a number where one exists', 'IAQ to supply', 'The story', 'Yes'],
  ['Stages delivered', 'Design, Procure, Construct, Commission, Maintain, Hookup', 'IAQ to supply', 'How IAQ delivers', 'Yes'],
  ['Business units', 'EPC, EFM, Tools Hookup', 'IAQ to supply', 'Business units', 'Yes'],
  ['Photographs', '6 to 10, cleared for public use, one caption each', 'IAQ to supply', 'Gallery and full screen viewer', 'Yes'],
  ['Film', 'A link to one film', 'IAQ to supply', 'Walk the facility', 'Optional'],
  ['Client name', 'For Brand Method’s records only', 'Held, never published', 'Nowhere on the site', 'Yes'],
]

const TEMPLATE = `PROJECT DESCRIPTION · one per project
1   Project title (type and scale, no client name):
2   Market:
3   Location (city or state, country):
4   Completion year:
5   Programme length:
6   IAQ’s role:
7   Site type (greenfield, brownfield, greenfield on brownfield):
8   Built-up area (m²):
9   Cleanroom class:
10  Scope delivered (one item per line):
11  Systems (one item per line):
12  The brief, three lines:
13  Challenge (two or three sentences):
14  Approach (two or three sentences):
15  Result (two or three sentences, a number where one exists):
16  Stages delivered (Design, Procure, Construct, Commission, Maintain, Hookup):
17  Business units (EPC, EFM, Tools Hookup):
18  Photographs (6 to 10, cleared, no client signs or logos, one caption each):
19  Film link (optional):
20  Client name (for our records only, never published):`

const rows = PROJECTS.map((p, i) => {
  const d = PROJECT_DETAIL[i] || {}
  const missing = OPTIONAL.filter(([k]) => d[k] == null).map(([, l]) => l)
  const have = ['role', 'isoDetail', 'scopeOfWorks', 'systems', 'siteType', 'builtUp'].filter(k => d[k] != null).length
  const notes = []
  if (d.confidence === 'matched') notes.push('Client attribution to confirm')
  if (signPhotos.has(i)) notes.push('Registry photo shows client signage: replace or clear')
  return `<tr><td class="id">${String(i + 1).padStart(2, '0')}</td><td><b>${esc(p.name)}</b><div class="ev">${esc(MARKET[p.ind] || p.ind)} · ${esc(p.loc)}</div></td>` +
    `<td class="num">${have} of 6</td><td>${missing.length ? missing.map(esc).join('<br>') : '<span class="ok">Complete</span>'}</td><td>${notes.map(esc).join('<br>') || ''}</td>` +
    `<td><a href="/projects/${i}">Open page</a></td></tr>`
}).join('\n')

const d0 = PROJECT_DETAIL[0] || {}, p0 = PROJECTS[0]
const example = [
  ['Project title', p0.name], ['Market', MARKET[p0.ind]], ['Location', p0.loc], ['Completion year', d0.year], ['Programme length', d0.duration],
  ['IAQ’s role', d0.role], ['Site type', d0.siteType], ['Built-up area', d0.builtUp], ['Cleanroom class', d0.isoDetail],
  ['Scope delivered', (d0.scopeOfWorks || []).join('; ')], ['Systems', (d0.systems || []).join('; ')], ['The brief', d0.brief && d0.brief.join(' ')],
  ['Challenge', d0.story && d0.story.challenge], ['Approach', d0.story && d0.story.approach], ['Result', d0.story && d0.story.result],
  ['Stages delivered', d0.stages && d0.stages.join(', ')], ['Business units', d0.units && d0.units.join(', ')], ['Photographs', d0.photos && `${d0.photos.length} supplied`],
].map(([k, v]) => `<tr><td class="k2">${esc(k)}</td><td>${v ? esc(v) : '<span class="gap">IAQ to supply</span>'}</td></tr>`).join('\n')

const complete = PROJECTS.filter((_, i) => OPTIONAL.every(([k]) => (PROJECT_DETAIL[i] || {})[k] != null)).length

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>IAQ · Project description format · Brand Method</title>
<link rel="stylesheet" href="/bmws.css">
<style>
:root{--bg:#0B0F17;--panel:#111826;--line:#1E2738;--text:#E6ECF7;--muted:#8B97AD;--red:#EC2027;--lime:#B8F04A;--amber:#F2B84B;--mono:"JetBrains Mono",ui-monospace,Menlo,monospace;--sans:"Instrument Sans",system-ui,sans-serif}
*{box-sizing:border-box}html{color-scheme:dark}body{margin:0;background:var(--bg);color:var(--text);font:14px/1.55 var(--sans)}
a{color:var(--text)}
.wrap{max-width:1180px;margin:0 auto;padding:28px 20px 90px}
.k{font:700 10.5px/1 var(--mono);letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
h1{font:600 32px/1.1 "Switzer",var(--sans);letter-spacing:-.02em;margin:10px 0 8px}h1 em{font-style:normal;color:var(--red)}
h2{font:600 20px/1.2 "Switzer",var(--sans);letter-spacing:-.01em;margin:48px 0 8px}
.lede{color:var(--muted);max-width:74ch;margin:0 0 18px}
.cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:22px 0}
.card{background:var(--panel);padding:14px 16px}.card b{display:block;font:600 26px/1 "Switzer",var(--sans)}.card span{display:block;margin-top:6px;font:700 10px/1.3 var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.card.red b{color:var(--red)}.card.lime b{color:var(--lime)}
.tw{overflow-x:auto;background:var(--panel)}
table{border-collapse:collapse;width:100%;min-width:860px}
th{text-align:left;font:700 10px/1.3 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--muted);padding:12px;background:#0E1420}
td{padding:11px 12px;vertical-align:top;font-size:13px}
tbody tr:nth-child(even) td{background:rgba(255,255,255,.02)}
td.id,td.num{font:700 11px var(--mono);color:var(--muted);white-space:nowrap}
td.k2{font-weight:600;white-space:nowrap;width:220px}
.ev{color:var(--muted);font-size:12px;margin-top:3px}
.gap{color:var(--amber);font-weight:600}.ok{color:var(--lime);font-weight:600}
ul.rules{margin:0;padding:0;list-style:none;display:grid;gap:8px;max-width:86ch}
ul.rules li{background:var(--panel);padding:12px 14px}ul.rules b{color:var(--text)}
.tpl{position:relative;background:var(--panel);padding:18px 18px 16px}
.tpl pre{margin:0;white-space:pre-wrap;font:12.5px/1.75 var(--mono);color:var(--text)}
.tpl button{position:absolute;top:12px;right:12px;background:var(--red);color:#fff;border:0;font:600 12px var(--sans);padding:8px 12px;cursor:pointer}
@media(max-width:760px){.cards{grid-template-columns:repeat(2,minmax(0,1fr))}h1{font-size:26px}}
</style>
</head>
<body class="bmws-page">
<div id="bmws-bar" data-active="03"></div>
<main class="wrap">
  <span class="k">Checklist pn3 · for Nabilah</span>
  <h1>Project description format, <em>one per project.</em></h1>
  <p class="lede">Every project page on the site already has a place for each field below. Send the fields for a project and its page fills in with no design change. An empty field shows as a labelled gap, never a guess.</p>
  <div class="cards">
    <div class="card"><b>${PROJECTS.length}</b><span>Project pages built</span></div>
    <div class="card lime"><b>${complete}</b><span>Fully described</span></div>
    <div class="card red"><b>${PROJECTS.length - complete}</b><span>Waiting on IAQ</span></div>
    <div class="card"><b>60+</b><span>Projects IAQ plans to add</span></div>
  </div>

  <h2>What to send</h2>
  <p class="lede">Twenty fields. The example column is project 01 as the company profile records it.</p>
  <div class="tw"><table>
    <thead><tr><th>Field</th><th>What to write</th><th>Example</th><th>Where it shows</th><th>Needed</th></tr></thead>
    <tbody>${FIELDS.map(f => `<tr><td class="k2">${esc(f[0])}</td><td>${esc(f[1])}</td><td>${f[2] === 'IAQ to supply' ? '<span class="gap">IAQ to supply</span>' : esc(f[2])}</td><td>${esc(f[3])}</td><td>${esc(f[4])}</td></tr>`).join('\n')}</tbody>
  </table></div>

  <h2>House rules</h2>
  <ul class="rules">
    <li><b>No client names.</b> Titles, text and photographs name the type and the location, never the client.</li>
    <li><b>Numbers as IAQ records them.</b> Area, class and programme length are copied, not rounded.</li>
    <li><b>Leave it empty rather than estimate.</b> A missing field shows as a gap; an estimate shows as a fact.</li>
    <li><b>One idea per sentence.</b> Challenge, approach and result are two or three sentences each.</li>
    <li><b>Photographs cleared for public use.</b> No client signs, logos or client staff without consent.</li>
    <li><b>Values, dates and quotes need written clearance.</b> Contract values and client quotes appear only when cleared.</li>
  </ul>

  <h2>Copy and send</h2>
  <p class="lede">Paste this into a message or a document, one copy per project.</p>
  <div class="tpl"><button type="button" id="cp">Copy</button><pre id="tpl">${esc(TEMPLATE)}</pre></div>

  <h2>Worked example · project 01</h2>
  <p class="lede">What the page already knows, and what is still to come.</p>
  <div class="tw"><table><tbody>${example}</tbody></table></div>

  <h2>The ${PROJECTS.length} projects on the site</h2>
  <p class="lede">Verified fields counts role, class, scope, systems, site type and built-up area from the company profile. The next column is what IAQ still has to send.</p>
  <div class="tw"><table>
    <thead><tr><th>No.</th><th>Project</th><th>Verified</th><th>IAQ to send</th><th>Notes</th><th>Page</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>
</main>
<script>
document.getElementById('cp').addEventListener('click', function () {
  var t = document.getElementById('tpl').textContent, b = this
  ;(navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { b.textContent = 'Copied' }, function () { b.textContent = 'Select and copy' })
  setTimeout(function () { b.textContent = 'Copy' }, 1800)
})
</script>
${barScripts}
</body>
</html>
`
fs.writeFileSync('public/project-format.html', html)
console.log('wrote public/project-format.html ·', PROJECTS.length, 'projects ·', complete, 'complete · sign photos flagged', [...signPhotos].map(i => i + 1), '· bar scripts', (barScripts.match(/<script/g) || []).length)
