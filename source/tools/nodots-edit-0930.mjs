/* 30 Sep 2026: the middle dot sweep ("avoid dots or bullet in iaq"). Backs up each file once to
   src/_backups/nodots-0930/<path>.pre, applies the phrase rewrites first, then turns every remaining
   " · " / " &middot; " outside comments and page-title lines into a comma. Leaves parsers, the admin bar and
   document.title alone. Every rewrite must match or the run stops. */
import fs from 'fs'; import path from 'path'
import { parse } from '../node_modules/@babel/parser/lib/index.js'
const SRC = path.resolve('src'), BK = path.join(SRC, '_backups/nodots-0930')
const read = f => fs.readFileSync(path.join(SRC, f), 'utf8')
const backed = new Set()
function write(f, s) {
  const bp = path.join(BK, f + '.pre')
  if (!fs.existsSync(bp)) { fs.mkdirSync(path.dirname(bp), { recursive: true }); fs.copyFileSync(path.join(SRC, f), bp) }
  backed.add(f); fs.writeFileSync(path.join(SRC, f), s)
}
const log = []
/* phrase rewrites: [file, find (string or RegExp with g), replace] */
const R = [
  ['pages/Home.jsx', 'TOTAL FACILITY SOLUTIONS · EST. 1995', 'Total facility solutions since 1995'],
  ['scenes/home.js', "tag:'CSA · MEP'", "tag:'CSA and MEP'"],
  ['scenes/home.js', "tag:'EPCC · EPCM'", "tag:'EPCC or EPCM'"],
  ['scenes/home.js', 'One continuous cycle · tap a stage', 'One continuous cycle. Tap a stage'],
  ['components/MarketPage.jsx', 'eyebrow={`Market ${no} · Who we serve`}', 'eyebrow="Who we serve"'],
  ['components/MarketPage.jsx', 'PRJ &middot; {pad3(p.i)}', 'PRJ {pad3(p.i)}'],
  ['components/MarketPage.jsx', '{p.client} &middot; {p.loc}', '{p.client} in {p.loc}'],
  ['pages/MarketsHub.jsx', '{p.client} &middot; {p.loc}', '{p.client} in {p.loc}'],
  ...['MarketDataCentre', 'MarketDistrictCooling', 'MarketEvBattery', 'MarketFoodBeverage', 'MarketPhotovoltaics'].map(m => [`pages/${m}.jsx`, "'Content slot · ", "'Content slot for "]),
  ['components/CapabilityPage.jsx', 'eyebrow={`Business unit ${no} · ${full}`}', 'eyebrow={`Business unit: ${full}`}'],
  ['data/projects.js', "cap: 'Photo · iaqtechnology.com.my'", "cap: 'Photo: iaqtechnology.com.my'"],
  ['data/projects.js', "cap: 'Site photo · IAQ'", "cap: 'Site photo: IAQ'"],
  ['pages/News.jsx', 'stories from the IAQ newsroom &middot; text and photographs', 'stories from the IAQ newsroom. Text and photographs'],
  ['pages/News.jsx', '{interim > 0 && <> &middot; {interim}', '{interim > 0 && <>. {interim}'],
  ['pages/GlobalPresence.jsx', '18 projects published at concept stage · IAQ confirms the definitive launch list before go live · profile-only references', '18 projects published at concept stage. IAQ confirms the definitive launch list before go live. Profile-only references'],
  ['pages/Commitment.jsx', '{n.tag} <i aria-hidden="true">&middot;</i> {longDate(n.date)}', '{n.tag}, {longDate(n.date)}'],
  ['components/UnitArt.jsx', "'CDA · PCW · PV'", "'CDA, PCW and PV'"],
  ['pages/CapPcu.jsx', "'CDA · PCW · PV', 'UPW · Chemical · Exhaust'", "'CDA, PCW and PV', 'UPW, chemical and exhaust'"],
  ['pages/CapEpc.jsx', "'EPCC · EPCM'", "'EPCC or EPCM'"],
  ['pages/CapEnergy.jsx', "'Registered ESCO · Suruhanjaya Tenaga'", "'Registered ESCO with Suruhanjaya Tenaga'"],
  ['pages/CapTool.jsx', "'Tool installation · hook-up'", "'Tool installation and hook-up'"],
  ['pages/ServiceConstruction.jsx', "'EPCC · EPCM'", "'EPCC or EPCM'"],
  ['pages/ServiceDesign.jsx', "'CSA · MEP'", "'CSA and MEP'"],
  ['pages/ServicesHub.jsx', "tag: 'CSA · MEP'", "tag: 'CSA and MEP'"],
  ['pages/ServicesHub.jsx', "tag: 'EPCC · EPCM'", "tag: 'EPCC or EPCM'"],
  ['pages/ServicesHub.jsx', 'Construction \\u00b7 bought as EPCC or EPCM', 'Construction, bought as EPCC or EPCM'],
  ['pages/ServicesHub.jsx', 'Energy Facility Management \\u00b7 the life of the facility', 'Energy Facility Management, for the life of the facility'],
  ['pages/ServicesHub.jsx', 'Semiconductor fabs \\u00b7 standalone, on the EPC or EPCM model', 'Semiconductor fabs, standalone or on the EPC or EPCM model'],
  ...['ServiceDesign', 'ServiceProcurement', 'ServiceConstruction', 'ServiceCommissioning', 'ServiceMaintenance'].map(m => [`pages/${m}.jsx`, /(Stage \d+) · /g, '$1: ']),
  ['pages/ServicesAll.jsx', '.replace(/^Stage \\d+ · /, \'\')', '.replace(/^Stage \\d+: /, \'\')'],
  ['pages/Campaign.jsx', '\n          <i aria-hidden="true">·</i>\n', '\n'],
  ...['data/values.js', 'components/ValuesRing.jsx', 'components/ValuesCarousel.jsx', 'components/ValueMotion.jsx', 'pages/Careers.jsx', 'pages/Culture.jsx'].map(f => [f, /'V·0([1-6])'/g, "'V0$1'"]),
  ['pages/RolePage.jsx', 'lede={`${label(DEPTS, role.dept)} · ${label(LOCS, role.loc)} · reference ${role.ref}`}', 'lede={`${label(DEPTS, role.dept)} in ${label(LOCS, role.loc)}. Reference ${role.ref}`}'],
  ['pages/Contact.jsx', "entity: 'IAQ Technology International Sdn. Bhd. · northern branch, opened July 2025'", "entity: 'Northern branch of IAQ Technology International Sdn. Bhd., opened July 2025'"],
  ['pages/Contact.jsx', '<option>Construction &middot; EPCC / EPCM</option>', '<option>Construction, EPCC or EPCM</option>'],
  ['pages/Contact.jsx', "{o.hours.replace(/ · /g, ', ')}", '{o.hours}'],
  ['components/GatedDownload.jsx', 'Scope of services &middot; delivery models &middot; classifications delivered &middot; certifications', 'Scope of services, delivery models, classifications delivered and certifications'],
  ['components/GatedDownload.jsx', 'ISO 9001 &middot; ISO 14001 &middot; ISO 45001 &middot; CIDB G7 &middot; ESH award record', 'ISO 9001, ISO 14001, ISO 45001, CIDB G7 and the ESH award record'],
  ['pages/Portal.jsx', 'Scope of services &middot; delivery models &middot; classifications delivered &middot; certifications', 'Scope of services, delivery models, classifications delivered and certifications'],
  ['pages/Portal.jsx', 'ISO 9001 &middot; ISO 14001 &middot; ISO 45001 &middot; CIDB G7 &middot; ESH award record', 'ISO 9001, ISO 14001, ISO 45001, CIDB G7 and the ESH award record'],
  ['pages/Portal.jsx', 'All 18 projects are editable here · the 60-project list follows', 'All 18 projects are editable here. The 60-project list follows'],
  ['pages/Investors.jsx', 'Gate open for this browser session &middot; concept preview &middot; no live disclosure is published', 'Gate open for this browser session. Concept preview, no live disclosure is published'],
  ['pages/Investors.jsx', 'Sample &middot; how a report reads on the page', 'Sample: how a report reads on the page'],
  ['pages/Investors.jsx', '450 &middot; 250 in Malaysia, 200 abroad', '450: 250 in Malaysia, 200 abroad'],
  ['pages/Investors.jsx', 'Segment review &middot; EPC, EFM, Tools Hookup', 'Segment review: EPC, EFM and Tools Hookup'],
  ['pages/Investors.jsx', 'August 2026 &middot; not audited &middot; replaced by', 'August 2026. Not audited, replaced by'],
  ['pages/Leadership.jsx', "'Portrait · founder'", "'Founder portrait'"],
  ['pages/Leadership.jsx', "'Portrait · CEO'", "'CEO portrait'"],
  ['pages/Leadership.jsx', "'Portraits · board'", "'Board portraits'"],
  ['pages/Leadership.jsx', "'Portraits · C-suite'", "'C-suite portraits'"],
  ['pages/Leadership.jsx', "'Portraits · management'", "'Management portraits'"],
  ['pages/About2.jsx', "'ISO 9001 · 14001 · 45001'", "'ISO 9001, 14001 and 45001'"],
  ['pages/About2.jsx', 'Offices · Shah Alam HQ', 'Offices: Shah Alam HQ'],
  ['pages/About2.jsx', 'Delivered in · China, Poland, France, Morocco', 'Delivered in China, Poland, France and Morocco'],
  ['pages/Culture.jsx', '0{i + 1} &middot; {t.label}', '0{i + 1} {t.label}'],
  ['pages/Codex.jsx', '`PDF · every section, ${meta.pages} landscape pages · updated ${meta.date}` : \'PDF · every section, landscape\'', '`PDF of every section, ${meta.pages} landscape pages, updated ${meta.date}` : \'PDF of every section, landscape\''],
  ['components/CodexSlides.jsx', /(EPC[CM]) · IAQ/g, '$1: IAQ'],
  ['components/CodexSlides.jsx', /(Business unit \d) · /g, '$1: '],
  ['components/CodexSlides.jsx', "'Cover · One fab, every layer'", "'Cover: One fab, every layer'"],
  ['components/portal/SignatureGen.jsx', 'ISO 9001 &middot; ISO 14001 &middot; ISO 45001 certified', 'ISO 9001, ISO 14001 and ISO 45001 certified'],
  ...['components/UnitDetail.jsx', 'components/UnitsBoard.jsx', 'components/UnitsCompare.jsx'].map(f => [f, '<small>{a.model} · {', '<small>{a.model}: {']),
  ['components/UnitDiagrams.jsx', /t="(EPCC|EPCM|Cooling as a Service|Energy Performance Contracting) · /g, 't="$1: '],
  ['components/UnitDiagramsV.jsx', /t="(EPCC|EPCM|Cooling as a Service|Energy Performance Contracting) · /g, 't="$1: '],
  ['components/UnitDiagrams.jsx', "grey: the owner's contract · blue dashed: IAQ manages that contractor", "grey for the owner's contract, blue dashed where IAQ manages the contractor"],
  ['components/UnitDiagramsV.jsx', 'grey: the owner’s contract · blue dashed: IAQ manages that contractor', 'grey for the owner’s contract, blue dashed where IAQ manages the contractor'],
  ['components/Mission3D.jsx', 'The flow · three forces', 'The flow: three forces'],
  ['components/Marks.jsx', '<title>EPC · engineering, procurement and construction</title>', '<title>EPC: engineering, procurement and construction</title>'],
  ['scenes/fab3d.js', "(rc ? 'Review · ' + rc", "(rc ? 'Review of ' + rc"],
  ['data/search.js', '"t":"EFM · Energy Facility Management"', '"t":"Energy Facility Management (EFM)"'],
  ['data/roles.js', '`Application · ${role.t} · ${role.ref}`', '`Application for ${role.t}, ${role.ref}`'],
  ['pages/BoothScreen.jsx', 'Paused · Space to play', 'Paused. Press Space to play'],
  ['pages/NotFound.jsx', '>404 · Not found<', '>404, page not found<'],
  ['scenes/about.js', "'Shah Alam \\u00b7 HQ'", "'Shah Alam, HQ'"],
  ['components/DevBuild3D.jsx', ".join('&nbsp;· ')", ".join(', ')"],
  ['styles/careers.css', '.jd-meta span + span::before{content:"·";margin-right:8px;color:var(--line2)}', '.jd-meta span + span{margin-left:10px} /* 30 Sep: space between the facts, no dot */'],
  ['styles/culture.css', '.cu-meta > span + span::before { content: "\\00b7"; margin: 0 8px; }', '.cu-meta > span + span::before { content: ","; margin: 0 6px 0 0; } /* 30 Sep: comma, not a middle dot */'],
  ['styles/portal.css', '.pt-cur::before{content:"\\00b7";margin-right:8px}', '.pt-cur{margin-left:10px} /* 30 Sep: no middle dot */'],
  ['styles/campaign.css', '.lp-foot i{font-style:normal;margin:0 9px;color:var(--line2)}', '.lp-foot i{font-style:normal;margin:0 9px;color:var(--line2)}\n.lp-foot span > a + a{margin-left:18px} /* 30 Sep: the dot between the two links is gone, space holds them apart */'],
]
/* generic pass: files, and lines it must not touch */
const LEAVE_FILES = new Set(['components/AdminBar.jsx', 'data/booth.js', 'pages/PortalBooth.jsx', 'pages/ProjectDetail.jsx'])
const SKIP_LINE = l => /document\.title/.test(l) || /^\s*[?:]\s*[`']IAQ Group · /.test(l) || /\.includes\(' · '\)/.test(l)
const cache = {}
const get = f => (cache[f] ??= read(f))
for (const [f, find, rep] of R) {
  const s = get(f)
  let n = 0, out
  if (find instanceof RegExp) { out = s.replace(find, (...a) => { n++; return rep.replace(/\$(\d)/g, (_, i) => a[+i]) }) }
  else { n = s.split(find).length - 1; out = s.split(find).join(rep) }
  if (!n) { console.error('NO MATCH', f, String(find).slice(0, 80)); process.exit(1) }
  cache[f] = out; log.push(`rewrite ${n}x ${f}: ${String(find).slice(0, 70)}`)
}
/* generic */
const all = []
;(function walk(d) { for (const x of fs.readdirSync(d)) { const p = path.join(d, x); if (x === '_backups' || x === '_versions') continue; if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(jsx?)$/.test(x) && !x.startsWith('.') && !/\.bak|\.pre/.test(x)) all.push(path.relative(SRC, p)) } })(SRC)
let generic = 0
for (const f of all) {
  if (LEAVE_FILES.has(f)) continue
  const s = get(f); if (!/ · | &middot; /.test(s)) continue
  let ranges = []
  try { ranges = parse(s, { sourceType: 'module', plugins: ['jsx'], errorRecovery: true }).comments.map(c => [c.start, c.end]) } catch (e) { console.error('PARSE', f, e.message); process.exit(1) }
  const inC = i => ranges.some(([a, b]) => i >= a && i < b)
  let n = 0
  const out = s.replace(/ · | &middot; /g, (m, off) => {
    if (inC(off)) return m
    const ls = s.lastIndexOf('\n', off) + 1, le = s.indexOf('\n', off), line = s.slice(ls, le < 0 ? undefined : le)
    if (SKIP_LINE(line)) return m
    n++; return ', '
  })
  if (n) { cache[f] = out; generic += n; log.push(`comma ${n}x ${f}`) }
}
for (const f of Object.keys(cache)) if (cache[f] !== read(f)) write(f, cache[f])
console.log(log.join('\n')); console.log('files written', backed.size, 'generic commas', generic)
