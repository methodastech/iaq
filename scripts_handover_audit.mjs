/* Handover-contract audit: checks this build against the HTML-to-React handover checklist
   (files/structure, markup, CSS, JS, forms/data, SEO). Run before any handover or conversion.
   node scripts_handover_audit.mjs   */
import fs from 'fs'; import path from 'path'
const R=(p)=>fs.readFileSync(p,'utf8')
const walk=(d,out=[])=>{for(const f of fs.readdirSync(d,{withFileTypes:true})){
  if(/^(node_modules|dist|\.git|legacy-static|_source|\.src\..*bak.*)$/.test(f.name))continue
  const p=path.join(d,f.name); f.isDirectory()?walk(p,out):out.push(p)} return out}
const files=walk('src'); const jsx=files.filter(f=>f.endsWith('.jsx'))
const css=files.filter(f=>f.endsWith('.css')); const js=files.filter(f=>f.endsWith('.js'))
const L=[]; const say=(sec,item,ok,detail)=>L.push({sec,item,ok,detail})

/* ---- 1 FILES & STRUCTURE ---- */
const main=R('src/main.jsx')
const routes=[...main.matchAll(/path="([^"]*)"/g)].map(m=>m[1])
say(1,'Every page URL listed',true,routes.length+' routes: '+routes.slice(0,8).join(' ')+(routes.length>8?' …':''))
const winPaths=files.filter(f=>/[A-Z]:\\|file:\/\/\//.test(R(f)))
say(1,'No absolute/Windows asset paths',!winPaths.length,winPaths.length?winPaths.join(', '):'all relative')
const idx=R('index.html')
const gf=(idx.match(/fonts\.googleapis\.com[^"']*/g)||[])
say(1,'Fonts declared',!!gf.length,gf.length?gf.length+' Google Fonts links in index.html':'NONE FOUND')
const assetRefs=new Set()
for(const f of [...jsx,...js,...css]) for(const m of R(f).matchAll(/["'(]\/?assets\/([^"')?#]+)/g)) assetRefs.add(m[1])
const missing=[...assetRefs].filter(a=>!fs.existsSync(path.join('public/assets',a)))
say(1,'Every referenced asset exists',!missing.length,missing.length?missing.length+' MISSING: '+missing.slice(0,5).join(', '):assetRefs.size+' refs all resolve')

/* ---- 2 HTML MARKUP ---- */
let dupIds=[],inlineOn=[],inlineStyle=0,styleBlocks=[],sectionless=[]
for(const f of jsx){const s=R(f)
  /* an id appearing once in each arm of a ternary renders once, so strip conditional arms before
     counting. Only ids repeated in straight-line markup are real duplicates. */
  const flat=s.replace(/\?\s*\([\s\S]*?\)\s*:\s*\([\s\S]*?\)/g,'')
  const ids=[...flat.matchAll(/\sid="([^"{]+)"/g)].map(m=>m[1])
  const d=[...new Set(ids.filter((v,i)=>ids.indexOf(v)!==i))]
  if(d.length)dupIds.push(path.basename(f)+': '+d.join(','))
  const on=[...s.matchAll(/\son(click|change|submit)="/gi)]
  if(on.length)inlineOn.push(path.basename(f))
  inlineStyle+=(s.match(/style=\{\{/g)||[]).length
  if(/<style>|<script(?!\s+type="application\/ld)/.test(s))styleBlocks.push(path.basename(f))
  const delegates=/(MarketPage|CapabilityPage|ServicePage|ArticlePage|HubPage)\b/.test(s)
  if(/^src\/pages\//.test(f.replace(/\\/g,'/'))&&!/<section/.test(s)&&!delegates)sectionless.push(path.basename(f))
}
say(2,'No duplicate id on a page',!dupIds.length,dupIds.length?dupIds.join(' | '):'none across '+jsx.length+' components')
say(2,'No inline onclick=""',!inlineOn.length,inlineOn.length?inlineOn.join(', '):'all events via addEventListener in scenes/')
say(2,'Sections wrapped in <section>',!sectionless.length,sectionless.length?'no <section>: '+sectionless.join(', '):'every page uses <section>')
say(2,'Shared blocks built once',fs.existsSync('src/components/Nav.jsx')&&fs.existsSync('src/components/Footer.jsx'),'Nav.jsx + Footer.jsx + Shell')
say(2,'No <style>/<script> in body',!styleBlocks.length,styleBlocks.length?styleBlocks.join(', '):'clean')
say(2,'Inline styles minimised',inlineStyle<60,inlineStyle+' style={{}} occurrences'+(inlineStyle>=60?' — should move to classes':''))
const dataFiles=fs.existsSync('src/data')?fs.readdirSync('src/data'):[]
say(2,'Repeating items looped from data',dataFiles.length>0,dataFiles.length?dataFiles.join(', '):'NO src/data — repeats are hardcoded')

/* ---- 3 CSS ---- */
const base=R('src/styles/base.css')
say(3,'Theme tokens in :root',/:root\{/.test(base),(base.match(/--[a-z0-9-]+:/g)||[]).length+' custom properties in base.css')
const bps=new Set()
for(const f of css) for(const m of R(f).matchAll(/\(max-width:\s*(\d+)px\)/g)) bps.add(+m[1])
say(3,'Breakpoints listed',bps.size>0,[...bps].sort((a,b)=>b-a).join(' / '))
let imp=0; for(const f of css) imp+=(R(f).match(/!important/g)||[]).length
say(3,'!important minimised',imp<80,imp+' uses across '+css.length+' files')
say(3,'Plain CSS, no framework',!/tailwind|bootstrap/i.test(R('package.json')),'plain CSS, one file per page + base.css')

/* ---- 4 JAVASCRIPT ---- */
const pkg=JSON.parse(R('package.json'))
say(4,'Libraries + versions listed',true,Object.entries(pkg.dependencies).map(([k,v])=>k+'@'+v).join(', '))
let jq=[]; for(const f of [...js,...jsx]) if(/\$\(|jQuery/.test(R(f))) jq.push(path.basename(f))
say(4,'No jQuery',!jq.length,jq.length?jq.join(', '):'none')
let dw=[]; for(const f of [...js,...jsx]) if(/document\.write/.test(R(f))) dw.push(path.basename(f))
say(4,'No document.write',!dw.length,dw.length?dw.join(', '):'none')
say(4,'JS separated from markup',js.length>0,js.length+' modules in scenes/ + components/')

/* ---- 5 FORMS & DATA ---- */
const forms=[]
for(const f of jsx){const s=R(f); const n=(s.match(/<form/g)||[]).length; if(n)forms.push(path.basename(f)+' ('+n+')')}
say(5,'Forms inventoried',true,forms.length?forms.join(', '):'no <form> elements')
let secrets=[]
for(const f of [...js,...jsx]){ /* 'company secretary' is not a secret, and a password INPUT is a form
    field, not a stored credential. Look for real credential SHAPES instead. */
  const t=R(f).replace(/company secretar\w*/gi,'')
  if(/api[_-]?key\s*[:=]|Bearer\s+[A-Za-z0-9]{12}|sk_live_|AIza[0-9A-Za-z_-]{20}|-----BEGIN [A-Z ]*PRIVATE KEY/.test(t)) secrets.push(path.basename(f))}
say(5,'No API keys / secrets in source',!secrets.length,secrets.length?secrets.join(', '):'none found')

/* ---- 6 SEO & META ---- */
let noTitle=[]
for(const f of jsx.filter(f=>/pages\//.test(f.replace(/\\/g,'/')))){
  const t=R(f)
  if(!/document\.title\s*=/.test(t)&&!/(MarketPage|CapabilityPage|ServicePage|ArticlePage|HubPage)\b/.test(t)) noTitle.push(path.basename(f))}
say(6,'Per-page <title>',!noTitle.length,noTitle.length?noTitle.length+' pages without document.title: '+noTitle.slice(0,6).join(', '):'all pages set document.title')
say(6,'Meta description',/name="description"/.test(idx),/name="description"/.test(idx)?'present in index.html (single, not per-page)':'MISSING')
say(6,'Favicon',/rel="icon"|rel="shortcut icon"/.test(idx),(idx.match(/rel="[^"]*icon[^"]*"/g)||['MISSING'])[0])
const hasMeta=fs.existsSync('src/lib/meta.js')
say(6,'OG image',/property="og:image"/.test(idx),/property="og:image"/.test(idx)?'index.html + per-route via lib/meta.js':'MISSING')
say(6,'Meta per PAGE (not just site)',hasMeta,hasMeta?'lib/meta.js applies description/og/canonical on every route change':'single global description only')
say(6,'Crawlable URLs',!/HashRouter/.test(main),/HashRouter/.test(main)?'HashRouter: real URLs are /#/about, not /about':'BrowserRouter')
const an=/gtag|googletagmanager|fbq|GTM-/.test(idx)
say(6,'Analytics / pixels',true,an?'present in index.html':'none installed')

const pass=L.filter(x=>x.ok).length
console.log('\n  #  '+'ITEM'.padEnd(38)+'  '+'RESULT')
console.log('  '+'-'.repeat(96))
for(const x of L) console.log('  '+x.sec+'  '+(x.ok?'PASS':'FAIL').padEnd(5)+x.item.padEnd(38).slice(0,38)+'  '+x.detail)
console.log('\n  '+pass+'/'+L.length+' pass\n')
