/* 22 Oct 2026: the Polishing tab (public/polish.html), generated. One row per section of every public page: the section as
   the 22 Oct build has it (Before), the section after a change (After, only once it changed), and the reasoning for the
   copy change and the design change. The page-level ratings from the first review stay as a line at the head of each page.
   Inputs: public/polish/before/*.json (+ images) and public/polish/after/*.json (tools/polish-sections.mjs, then
   tools/polish-compare.py marks which sections changed), tools/polish-review.json (ratings, section reasoning).
   Usage: node tools/polish-build.mjs */
import fs from 'node:fs'
const R = 'public/polish', OUT = 'public/polish.html'
const read = f => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null)
const review = read('tools/polish-review.json') || { pages: {}, sections: {} }
const secNotes = review.sections || {}
const beforeIx = read(`${R}/before/index.json`)
if (!beforeIx) { console.error('no public/polish/before/index.json: run tools/polish-sections.mjs first'); process.exit(1) }
const order = ['home', 'services-epc-construction', 'services-tool-installation', 'services-energy-management', 'markets', 'markets-semiconductor', 'markets-data-centre', 'markets-ev-battery', 'markets-photovoltaics', 'markets-district-cooling', 'markets-bio-lifescience', 'markets-food-beverage',
  'about', 'about-history', 'about-commitment', 'about-leadership', 'about-esg', 'global-presence', 'services', 'services-all', 'projects', 'news', 'careers', 'contact', 'enquiry', 'investors', 'policies', 'exhibition', 'shortlist', 'semicon', 'booth-screen']
const skip = new Set(review.skip || [])
const slugs = beforeIx.pages.map(p => p.slug).filter(s => !skip.has(s))
slugs.sort((a, b) => { const ia = order.findIndex(o => a === o || a.startsWith(o + '-')), ib = order.findIndex(o => b === o || b.startsWith(o + '-')); return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || a.localeCompare(b) })
const group = s => s === 'home' ? 'First pass: home' : /^services-(epc|tool|energy)/.test(s) ? 'First pass: the three unit pages' : /^markets/.test(s) ? 'First pass: the markets' : 'The rest of the site'
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const day = iso => { const d = iso ? new Date(iso) : null; return d && !isNaN(d) ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '' }
const pages = slugs.map(slug => {
  const bf = read(`${R}/before/${slug}.json`); if (!bf) return null
  const af = read(`${R}/after/${slug}.json`)
  const rv = review.pages[slug] || {}
  const notes = secNotes[slug] || {}
  const sections = bf.sections.map((s, i) => {
    /* the after section: same key, else the same place in the page */
    let a = af ? (af.sections.find(x => x.key === s.key) || af.sections[i]) : null
    if (a && a.changed === false) a = null
    const n = notes[s.key] || notes[String(i + 1)] || {}
    return { i: i + 1, key: s.key, heading: s.heading, tag: s.tag, height: s.height, img: `polish/before/${s.img}`, text: s.text, more: n.more || [],
      after: a ? { img: `polish/after/${a.img}`, height: a.height, at: day(af.at) } : null,
      copy: n.copy || (a && a.reason === 'fullstop' ? 'The full stop at the end of the title is gone. Rule 4: a full stop at a title makes it look worse; commas are fine. Applied to every title on the site.' : ''), design: n.design || (a && !n.copy && a.reason !== 'fullstop' ? 'Changed by the site-wide rules only: type a step up (rule 14), tracked labels to .04em (rule 20), balanced lines (rules 1, 22), eyebrows off (rule 38), hover rules at the foot and no hover on non-links (rules 31, 35). See the site-wide list at the top. Nothing on this section was changed by hand.' : ''), note: n.note || '', status: n.status || (a ? 'changed' : 'open') }
  })
  return { slug, url: bf.url, name: rv.name || bf.title.replace(/\s*[·|].*$/, '').trim() || slug, group: group(slug), sections,
    design: rv.design || {}, copy: rv.copy || {}, change: rv.change || '', fix: rv.fix || '' }
}).filter(Boolean)
const secOf = (slug, key) => { const p = pages.find(x => x.slug === slug); if (!p) return null; const sc = p.sections.find(x => x.key === key) || p.sections.find(x => x.key.startsWith(key)); return sc ? { ...sc, page: p.name } : null }
const BAR = fs.readFileSync('public/checklist.html', 'utf8').match(/<div class="bmws"[\s\S]*?<\/div><\/div>\n/)[0]
  .replace(/ class="on"/g, '').replace('<a href="/polish.html"><i>11</i>Polishing</a>', '<a href="/polish.html" class="on"><i>11</i>Polishing</a>')
const meta = review.meta || {}
/* the member area's states (tools/polish-states.mjs), as their own block: a row per state */
const statesB = read(`${R}/before/states.json`), statesA = read(`${R}/after/states.json`)
const stateRows = statesB ? statesB.states.map(st => { const a = statesA && statesA.states.find(x => x.key === st.key); const n = (review.states || {})[st.key] || {}
  return { key: st.key, name: st.name, note: st.note, img: `polish/before/${st.img}`, after: a && n.changed ? { img: `polish/after/${a.img}`, at: day(statesA.at) } : null, copy: n.copy || '', design: n.design || '' } }) : []
const total = pages.reduce((a, p) => a + p.sections.length, 0), changed = pages.reduce((a, p) => a + p.sections.filter(s => s.after).length, 0)
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>IAQ · Polishing stage · Brand Method</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/bmws.css">
<style>
:root{--bg:#F7F9FC;--panel:#FFFFFF;--panel-2:#F1F4F9;--line:#E2E7EF;--text:#0C1220;--muted:#5C6675;--red:#EC2027;--good:#0FA968;--good-bg:#E9F4EE;--bad:#B3261E;--bad-bg:#FDECEC;--topbar:#0C1220;--amber:#8A6100;--amber-bg:#FBF3E2;--blue-bg:#EDF2FA;--blue:#31526F}
*{box-sizing:border-box}html,body{margin:0;padding:0}
body{background:var(--bg);color:var(--text);font:15px/1.55 "Instrument Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
.topbar{background:var(--topbar);padding:14px 20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;position:sticky;top:0;z-index:20}
.topbar h1{margin:0;font-size:17px;font-weight:600;color:#fff;letter-spacing:-.01em}.topbar .brand span{display:block;color:#8B95A6;font-size:12.5px;margin-top:2px}
.topbar-actions{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}
.btn{background:#141B2B;color:#EAF0FB;border:1px solid #242D40;padding:8px 12px;font:500 13px/1 "Instrument Sans",sans-serif;cursor:pointer}.btn:hover{background:#1A2233}.btn.primary{background:var(--red);border-color:var(--red);color:#fff}
.wrap{max-width:1680px;margin:0 auto;padding:22px 20px 80px}
.intro{background:var(--panel);border:1px solid var(--line);padding:22px 24px;margin-bottom:18px;display:grid;grid-template-columns:1.3fr 1fr;gap:28px}
.intro h2{margin:0 0 8px;font-size:22px;letter-spacing:-.015em;font-weight:600}.intro p{margin:0 0 10px;color:var(--muted)}.intro p b{color:var(--text);font-weight:600}
.intro table{border-collapse:collapse;width:100%;font-size:13.5px}.intro td{padding:6px 8px;border-top:1px solid var(--line);vertical-align:top}.intro td:first-child{color:var(--muted);white-space:nowrap;width:130px}
.summary{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:16px}
.stat{background:var(--panel);border:1px solid var(--line);padding:14px 16px}.stat .num{font:700 26px/1 "JetBrains Mono",monospace;letter-spacing:-.02em}.stat .lbl{color:var(--muted);font-size:12.5px;margin-top:6px}
.stat.good .num{color:var(--good)}.stat.bad .num{color:var(--bad)}.stat.changed .num{color:var(--red)}
.filters{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;align-items:center}.filters .fl{color:var(--muted);font-size:12.5px;margin:0 4px 0 8px}
.chip{background:var(--panel);border:1px solid var(--line);padding:7px 12px;font:500 13px/1 "Instrument Sans",sans-serif;cursor:pointer;color:var(--text)}.chip.on{background:var(--text);color:#fff;border-color:var(--text)}
.grp{margin:30px 0 10px;display:flex;align-items:baseline;gap:12px}.grp h2{margin:0;font-size:19px;letter-spacing:-.01em;font-weight:600}.grp small{color:var(--muted);font-size:13px}
.page{background:var(--panel);border:1px solid var(--line);margin-bottom:14px}
.page.hide{display:none}
.page-h{display:flex;align-items:center;gap:14px;padding:14px 18px;cursor:pointer;flex-wrap:wrap}
.page-h h3{margin:0;font-size:16.5px;font-weight:600;letter-spacing:-.01em}.page-h .route{font:500 12.5px/1 "JetBrains Mono",monospace;color:var(--muted)}
.page-h .route a{color:inherit;text-decoration:none}.page-h .route a:hover{color:var(--red)}
.tags{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.tag{font:600 11.5px/1 "Instrument Sans",sans-serif;letter-spacing:.02em;padding:6px 9px;text-transform:uppercase}
.tag.good{background:var(--good-bg);color:#1C6B45}.tag.bad{background:var(--bad-bg);color:var(--bad)}.tag.none{background:var(--panel-2);color:var(--muted)}.tag.changed{background:var(--red);color:#fff}.tag.open{background:var(--amber-bg);color:var(--amber)}.tag.lbl{background:transparent;color:var(--muted)}
.page-b{border-top:1px solid var(--line);padding:0 18px 18px;display:block}.page.closed .page-b{display:none}
.sw-t{width:100%;border-collapse:collapse;margin-top:10px;table-layout:fixed}.sw-t th{text-align:left;font:600 12px/1 "Instrument Sans",sans-serif;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);padding:10px 8px;border-bottom:1px solid var(--line)}.sw-t td{padding:12px 8px;border-top:1px solid var(--line);vertical-align:top;font-size:13.5px;line-height:1.5}.sw-t th:nth-child(1),.sw-t td:nth-child(1){width:7%}.sw-t th:nth-child(2),.sw-t td:nth-child(2){width:24%}.sw-t th:nth-child(3),.sw-t td:nth-child(3){width:23%}.sw-t th:nth-child(4),.sw-t td:nth-child(4){width:23%}.sw-t .ex{font-size:12px;color:var(--muted);margin-top:6px}
details.foot{background:var(--panel);border:1px solid var(--line);padding:0 24px;margin-top:18px}details.foot summary{cursor:pointer;padding:16px 0;font-size:17px;font-weight:600;letter-spacing:-.01em}details.foot[open] summary{border-bottom:1px solid var(--line)}details.foot .intro,details.foot .rules{border:0;padding:18px 0;margin:0}
.rating{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:16px 0 4px}
.rt{background:var(--panel-2);padding:12px 14px;font-size:13.5px;line-height:1.5}.rt b{font-weight:600}.rt .tag{margin-left:8px;vertical-align:middle}
table.sec{width:100%;border-collapse:collapse;margin-top:12px;table-layout:fixed}
table.sec th{text-align:left;font:600 12px/1 "Instrument Sans",sans-serif;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);padding:10px 10px;border-bottom:1px solid var(--line)}
table.sec td{padding:12px 10px;border-top:1px solid var(--line);vertical-align:top;font-size:13.5px;line-height:1.5}
table.sec tr.hide{display:none}
table.sec th:nth-child(1),table.sec td:nth-child(1){width:14%}table.sec th:nth-child(2),table.sec td:nth-child(2){width:31%}table.sec th:nth-child(3),table.sec td:nth-child(3){width:31%}table.sec th:nth-child(4),table.sec td:nth-child(4){width:24%}
.sn{font-weight:600}.sn small{display:block;font:500 11.5px/1.4 "JetBrains Mono",monospace;color:var(--muted);margin-top:4px;font-weight:500}
.shot{display:block;max-height:460px;overflow:auto;border:1px solid var(--line);background:#E6EAF0}.shot img{display:block;width:100%;height:auto}
.shot.more{ margin-top:12px; }
.none.more{ margin-top:10px; }
.shot-l{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:var(--muted);margin-top:6px}.shot-l a{color:var(--red);text-decoration:none;font-weight:500}
.none{padding:18px 14px;color:var(--muted);background:var(--panel-2);font-size:13.5px}
.why b{font-weight:600}.why p{margin:0 0 8px}.why .st{display:inline-block;margin-bottom:8px}
textarea.nt{width:100%;min-height:54px;border:1px solid var(--line);padding:8px 10px;font:13.5px/1.5 "Instrument Sans",sans-serif;resize:vertical;background:var(--panel);margin-top:8px}
.rules{background:var(--panel);border:1px solid var(--line);padding:20px 24px;margin-bottom:18px}.rules h2{margin:0 0 6px;font-size:18px;font-weight:600;letter-spacing:-.01em}.rules ol{margin:8px 0 0;padding:0;list-style:none;columns:2;column-gap:32px}.rules li{padding:7px 0;border-top:1px solid var(--line);font-size:14px;line-height:1.5;break-inside:avoid}.rules li b{font-weight:600;margin-right:6px}.rules li small{display:block;color:var(--muted);font-size:12px;margin-top:2px}
.rules table{width:100%;border-collapse:collapse;margin-top:8px;font-size:13.5px;line-height:1.5}.rules th{text-align:left;font-weight:600;color:var(--muted);font-size:12.5px;padding:6px 8px;border-bottom:1px solid var(--line)}.rules td{padding:8px;border-top:1px solid var(--line);vertical-align:top}.rules td:first-child{white-space:nowrap;width:110px;color:var(--muted)}.rules td:last-child{width:30%;color:var(--muted)}
@media (max-width:900px){.rules ol{columns:1}}
.toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:var(--text);color:#fff;padding:10px 16px;font-size:13.5px;opacity:0;pointer-events:none;transition:opacity .2s}.toast.on{opacity:1}
.note{color:var(--muted);font-size:13px;margin:0 0 14px}
@media (max-width:1100px){.intro{grid-template-columns:1fr}.summary{grid-template-columns:repeat(3,1fr)}.rating{grid-template-columns:1fr}table.sec,table.sec thead,table.sec tbody,table.sec tr,table.sec td,table.sec th{display:block;width:auto!important}table.sec thead{display:none}table.sec td{border-top:0;padding:8px 0}table.sec tr{border-top:1px solid var(--line);padding:10px 0}}
</style>
</head>
<body>
<script type="application/json" id="savedState">${encodeURIComponent(JSON.stringify(review.state || {}))}</script>
${BAR}<div class="topbar">
  <div class="brand"><h1>IAQ · Polishing stage</h1><span>Brand Method · every section: Before (22 Oct), After, and why it changed</span></div>
  <div class="topbar-actions">
    <button class="btn" id="expandAll">Fold all</button>
    <button class="btn" id="copyStatus">Copy status</button>
    <button class="btn primary" id="saveFile" title="Download this page with your notes saved inside it">Save file</button>
  </div>
</div>
<div class="wrap">
  <div class="summary">
    <div class="stat"><div class="num" id="sPages">${pages.length}</div><div class="lbl">Pages</div></div>
    <div class="stat"><div class="num" id="sSecs">${total}</div><div class="lbl">Sections</div></div>
    <div class="stat changed"><div class="num" id="sChanged">${changed}</div><div class="lbl">Changed, with After</div></div>
    <div class="stat"><div class="num" id="sOpen">${total - changed}</div><div class="lbl">Still open</div></div>
    <div class="stat bad"><div class="num" id="sBad">${pages.filter(p => p.design.rate === 'bad' || p.copy.rate === 'bad').length}</div><div class="lbl">Pages rated to fix</div></div>
  </div>
  <div class="filters" id="filters">
    <button class="chip on" data-f="all">All sections</button>
    <button class="chip" data-f="changed">Changed</button>
    <button class="chip" data-f="open">Open</button>
    <button class="chip" data-f="noted">With a note</button>
    <span class="fl">Pages</span>
    <button class="chip" data-f="grp-home">Home</button>
    <button class="chip" data-f="grp-units">Unit pages</button>
    <button class="chip" data-f="grp-markets">Markets</button>
    <button class="chip" data-f="grp-rest">The rest</button>
  </div>
  <p class="note">Every section of every page: Before is the 22 Oct build, After is the same section once changed, Reasoning says why. Open shows a picture on its own; a page header folds its table away.</p>
  <div id="app"></div>
  ${stateRows.length ? '<div class="grp"><h2>The member area, state by state</h2><small>' + stateRows.length + ' states</small></div><div class="page open"><div class="page-h"><h3>Member area</h3><span class="route">sign in, the portal, sign out</span><span class="tags"><span class="tag lbl">' + stateRows.length + ' states</span></span></div><div class="page-b"><table class="sec"><thead><tr><th>State</th><th>Before · 22 Oct</th><th>After</th><th>Reasoning</th></tr></thead><tbody>' + stateRows.map(st => '<tr><td><span class="sn">' + esc(st.name) + '<small>' + esc(st.key) + '</small></span><p style="margin:8px 0 0;color:var(--muted);font-size:13px">' + esc(st.note) + '</p></td><td><a class="shot" href="' + st.img + '" target="_blank" rel="noopener"><img loading="lazy" src="' + st.img + '" alt="' + esc(st.name) + '"></a></td><td>' + (st.after ? '<a class="shot" href="' + st.after.img + '" target="_blank" rel="noopener"><img loading="lazy" src="' + st.after.img + '" alt="' + esc(st.name) + ', after"></a>' : '<div class="none">Not changed yet.</div>') + '</td><td class="why">' + (st.after ? '<span class="tag changed st">Changed · ' + esc(st.after.at) + '</span>' : '<span class="tag open st">Open</span>') + (st.copy ? '<p><b>Copy.</b> ' + esc(st.copy) + '</p>' : '') + (st.design ? '<p><b>Design.</b> ' + esc(st.design) + '</p>' : '') + '</td></tr>').join('') + '</tbody></table></div></div>' : ''}
  ${(review.sitewide || []).length ? '<div class="grp"><h2>Site-wide changes</h2><small>' + review.sitewide.length + ' changes applied to every page, each shown on one example section</small></div><div class="page"><div class="page-b"><table class="sw-t"><thead><tr><th>Date</th><th>What changed</th><th>Before · example</th><th>After · example</th><th>Why</th></tr></thead><tbody>' + review.sitewide.map(x => { const ex = x.ex && secOf(x.ex.slug, x.ex.key); const pic = (img, lab) => img ? '<a class="shot" href="' + img + '" target="_blank" rel="noopener"><img loading="lazy" src="' + img + '" alt="' + esc(lab) + '"></a>' : '<div class="none">No example picture yet.</div>'; return '<tr><td>' + esc(x.date) + '</td><td>' + esc(x.what) + (ex ? '<div class="ex">Example: ' + esc(ex.page) + ' · ' + esc(ex.heading || ex.key) + '</div>' : '') + '</td><td>' + pic(ex && ex.img, 'before') + '</td><td>' + pic(ex && ex.after && ex.after.img, 'after') + '</td><td>' + esc(x.why) + '</td></tr>' }).join('') + '</tbody></table></div></div>' : ''}
  <details class="foot"><summary>The walk-through rules (${(review.rules || []).length})</summary>
  ${(review.rules || []).length ? '<div class="rules"><h2>The walk-through rules</h2><p class="note">Every rule set during the walk-through, numbered so a reasoning cell can cite it. They hold for every page.</p><ol>' + review.rules.map(r => '<li><b>' + r.n + '.</b> ' + esc(r.rule) + ' <small>' + esc(r.from) + '</small></li>').join('') + '</ol></div>' : ''}
  </details>
  <details class="foot"><summary>How this page is made</summary>
  <div class="intro">
    <div>
      <h2>How this works</h2>
      <p><b>Every page, cut into its sections.</b> Before is the section exactly as the 22 Oct build has it, captured at 1440 wide. After appears only once that section changed. Reasoning says why the copy changed and why the design changed, one line each.</p>
      <p><b>We go through it one by one.</b> A section with no After is still open. Notes typed in the reasoning cell stay in this browser; Save file bakes them into the page.</p>
      <p><b>The first pass</b> is the order of the first review: home, the three unit pages, the markets. The rest of the site follows in site order.</p>
    </div>
    <div>
      <table>
        <tr><td>Before</td><td>${esc(meta.before || 'The 22 Oct build (IAQ-website-2026-10-22.zip, applied here on 22 Oct), captured before any change')}</td></tr>
        <tr><td>After</td><td>${esc(meta.after || 'The same section after the change, captured the same way')}</td></tr>
        <tr><td>Captured</td><td>${esc(meta.captured2 || 'tools/polish-sections.mjs, Chrome headless at 1440 wide; tools/polish-compare.py marks what changed')}</td></tr>
        <tr><td>Regenerate</td><td><code>node tools/polish-build.mjs</code> after editing tools/polish-review.json (the reasoning lives in its sections map)</td></tr>
      </table>
    </div>
  </div>
  </details>
</div>
<div class="toast" id="toast"></div>
<script>
const DATA = ${JSON.stringify(pages)};
const KEY = 'iaq-polish-sections-1022';
let state = { notes: {}, open: {}, savedAt: 0 }, filter = 'all', storageOK = true;
const store = (() => { try { const p = KEY + '__probe'; localStorage.setItem(p, '1'); localStorage.removeItem(p); return { get: k => localStorage.getItem(k), set: (k, v) => localStorage.setItem(k, v) } } catch (e) { storageOK = false; return { get: () => null, set: () => {} } } })();
function readSeed () { const el = document.getElementById('savedState'); if (!el) return null; try { return JSON.parse(decodeURIComponent(el.textContent.trim())) } catch (e) { return null } }
function load () { let local = null; const seed = readSeed(); try { const raw = store.get(KEY); if (raw) local = JSON.parse(raw) } catch (e) {} const useSeed = seed && seed.savedAt && (!local || seed.savedAt > (local.savedAt || 0)); const s = useSeed ? seed : local; if (s) state = Object.assign({ notes: {}, open: {}, savedAt: 0 }, s) }
function save () { state.savedAt = Date.now(); try { store.set(KEY, JSON.stringify(state)) } catch (e) {} }
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const gk = p => p.slug === 'home' ? 'home' : /^services-(epc|tool|energy)/.test(p.slug) ? 'units' : /^markets/.test(p.slug) ? 'markets' : 'rest';
function secVisible (p, s) {
  if (filter === 'changed') return !!s.after;
  if (filter === 'open') return !s.after;
  if (filter === 'noted') return !!(s.copy || s.design || s.note || (state.notes[p.slug + '/' + s.key] || '').trim());
  return true;
}
function pageVisible (p) { if (filter.startsWith('grp-')) return gk(p) === filter.slice(4); return p.sections.some(s => secVisible(p, s)) }
const tag = r => r === 'good' ? '<span class="tag good">Good</span>' : r === 'bad' ? '<span class="tag bad">To fix</span>' : '<span class="tag none">Not rated</span>';
function shot (img, h, lab) { return '<a class="shot" href="' + img + '" target="_blank" rel="noopener" title="Open the section image on its own"><img loading="lazy" src="' + img + '" alt="' + esc(lab) + '"></a><div class="shot-l"><span>' + h.toLocaleString() + ' px tall</span><a href="' + img + '" target="_blank" rel="noopener">Open</a></div>' }
/* 23 Oct: a section can carry further pictures (a picked state of a 3D, a moment of a tour): sections[slug][key].more =
   [{ b: 'polish/before/extra/x.webp', a: 'polish/after/extra/y.webp', cap: 'what this moment is' }] */
function more (s, side) { return (s.more || []).map(m => m[side] ? '<a class="shot more" href="' + m[side] + '" target="_blank" rel="noopener" title="Open on its own"><img loading="lazy" src="' + m[side] + '" alt="' + esc(m.cap) + '"></a><div class="shot-l"><span>' + esc(m.cap) + '</span></div>' : '<div class="none more">' + esc(m.cap) + ': no picture on this side.</div>').join('') }
function row (p, s) {
  const k = p.slug + '/' + s.key, mine = state.notes[k] || '';
  const why = (s.after ? '<span class="tag changed st">Changed' + (s.after.at ? ' · ' + esc(s.after.at) : '') + '</span>' : '<span class="tag open st">Open</span>') +
    (s.copy ? '<p><b>Copy.</b> ' + esc(s.copy) + '</p>' : '') + (s.design ? '<p><b>Design.</b> ' + esc(s.design) + '</p>' : '') + (s.note ? '<p><b>Note.</b> ' + esc(s.note) + '</p>' : '') +
    '<textarea class="nt" data-k="' + esc(k) + '" placeholder="Your note on this section">' + esc(mine) + '</textarea>';
  return '<tr class="' + (secVisible(p, s) ? '' : 'hide') + '" data-key="' + esc(s.key) + '"><td><span class="sn">' + (esc(s.heading) || esc(s.key)) + '<small>' + s.i + ' · ' + esc(s.tag) + (s.key !== (s.heading || '').toLowerCase() ? ' · ' + esc(s.key) : '') + '</small></span></td>' +
    '<td>' + shot(s.img, s.height, p.name + ', ' + (s.heading || s.key) + ', before') + more(s, 'b') + '</td>' +
    '<td>' + (s.after ? shot(s.after.img, s.after.height, p.name + ', ' + (s.heading || s.key) + ', after') : '<div class="none">Not changed yet. The After appears here once this section changes.</div>') + more(s, 'a') + '</td>' +
    '<td class="why">' + why + '</td></tr>';
}
function card (p) {
  const n = p.sections.filter(s => s.after).length;
  return '<div class="page' + (state.closed && state.closed[p.slug] ? ' closed' : '') + (pageVisible(p) ? '' : ' hide') + '" data-slug="' + p.slug + '">' +
    '<div class="page-h" data-toggle><h3>' + esc(p.name) + '</h3><span class="route"><a href="' + esc(p.url) + '" target="_blank" rel="noopener" title="Open the live page">' + esc(p.url) + '</a></span><span class="tags">' +
      '<span class="tag lbl">' + p.sections.length + ' sections</span>' + (n ? '<span class="tag changed">' + n + ' changed</span>' : '') + '<span class="tag lbl">Design</span>' + tag(p.design.rate) + '<span class="tag lbl">Copy</span>' + tag(p.copy.rate) + '</span></div>' +
    '<div class="page-b">' +
      '<div class="rating"><div class="rt"><b>Design</b>' + tag(p.design.rate) + '<br>' + esc(p.design.why || '') + '</div><div class="rt"><b>Copy</b>' + tag(p.copy.rate) + '<br>' + esc(p.copy.why || '') + '</div></div>' +
      '<table class="sec"><thead><tr><th>Section</th><th>Before · 22 Oct</th><th>After</th><th>Reasoning</th></tr></thead><tbody>' + p.sections.map(s => row(p, s)).join('') + '</tbody></table>' +
    '</div></div>';
}
function render () {
  const app = document.getElementById('app'); let html = '', cur = '';
  for (const p of DATA) { if (p.group !== cur) { cur = p.group; html += '<div class="grp"><h2>' + esc(cur) + '</h2><small>' + DATA.filter(x => x.group === cur).length + ' pages</small></div>' } html += card(p) }
  app.innerHTML = html;
  for (const g of app.querySelectorAll('.grp')) { const t = g.querySelector('h2').textContent; g.style.display = DATA.some(p => p.group === t && pageVisible(p)) ? '' : 'none' }
}
function toast (m) { const t = document.getElementById('toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 1800) }
document.getElementById('app').addEventListener('click', e => { const h = e.target.closest('[data-toggle]'); if (h && !e.target.closest('a')) { const card = h.parentNode, slug = card.dataset.slug; state.closed = state.closed || {}; state.closed[slug] = !state.closed[slug]; card.classList.toggle('closed', !!state.closed[slug]); save() } });
document.getElementById('app').addEventListener('input', e => { const ta = e.target.closest('textarea.nt'); if (!ta) return; state.notes[ta.dataset.k] = ta.value; save() });
document.getElementById('filters').addEventListener('click', e => { const c = e.target.closest('.chip'); if (!c) return; filter = c.dataset.f; for (const x of document.querySelectorAll('#filters .chip')) x.classList.toggle('on', x === c); render() });
document.getElementById('expandAll').addEventListener('click', () => { state.closed = state.closed || {}; const allClosed = DATA.every(p => state.closed[p.slug]); for (const p of DATA) state.closed[p.slug] = !allClosed; save(); render(); document.getElementById('expandAll').textContent = allClosed ? 'Fold all' : 'Open all' });
document.getElementById('copyStatus').addEventListener('click', () => {
  const lines = []; for (const p of DATA) for (const s of p.sections) { const k = p.slug + '/' + s.key; const mine = (state.notes[k] || '').trim(); if (s.after || mine) lines.push(p.name + ' · ' + (s.heading || s.key) + ': ' + (s.after ? 'changed' : 'open') + (mine ? ' · ' + mine : '')) }
  navigator.clipboard.writeText('IAQ polishing, ' + new Date().toLocaleDateString('en-GB') + '\\n' + lines.join('\\n')).then(() => toast('Status copied'));
});
document.getElementById('saveFile').addEventListener('click', () => {
  save(); const doc = document.documentElement.cloneNode(true); const el = doc.querySelector('#savedState'); el.textContent = encodeURIComponent(JSON.stringify(state));
  const blob = new Blob(['<!DOCTYPE html>\\n' + doc.outerHTML], { type: 'text/html' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'IAQ-polishing-' + new Date().toISOString().slice(0, 10) + '.html'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); toast('File saved with the notes inside');
});
load(); render();
</script>
</body>
</html>
`
fs.writeFileSync(OUT, html)
console.log('polish.html written:', pages.length, 'pages,', total, 'sections,', changed, 'changed,', (html.length / 1024).toFixed(0), 'KB')
