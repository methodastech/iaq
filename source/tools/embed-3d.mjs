/* Scroll to build 3D: turns the developer's compiled delivery into a section of the home page (28 Sep 2026).

   The developer ships a finished Vite build ("3D ONLY" folder: index.html, assets/main-*.js and .css, models/,
   fallback/, signs/, fonts/), written to own the whole window. The website no longer frames it in an iframe; it
   mounts the app's markup inside <section id="build3d"> (components/Build3D.jsx, scenes/build3d.js) and runs its
   script there. This tool prepares a delivery for that, and is re-run on every new delivery:

     node tools/embed-3d.mjs "../../3D ONLY"

   It writes
     public/build3d/                 the delivery's assets, models, fallback and signs, with the script and
                                     stylesheet under fixed names (assets/app.js, assets/app.css)
     src/scenes/build3d-markup.html  the app's page markup, comments and scripts removed

   and changes the delivery in exactly these ways, each checked: a pattern that no longer matches stops the tool,
   because a silent miss would ship a section that scrolls the page to the top or reads the wrong scroll range.
     script  scroll position, scroll range and scroll-to are measured from the section, not the page
             leaving the build for the walkthrough no longer scrolls the page to the top
             the render loop waits while the section is off screen or the home page is not showing
             panels the app adds to <body> go into the section instead
             page-wide keyboard shortcuts ignore typing and act only while the section is in use
             model, sign and icon paths are absolute (/build3d/...); check a new delivery on the BUILT site (npm run
             build:launch), since the dev server answers a missed relative path with the home page, not a 404
     styles  every rule scoped under .b3d; html and body rules land on the section's stage (.b3d-stage);
             html.section-scroll rules and @font-face dropped (the site already serves both fonts)

   This is the interim route. When the developer's source arrives, the app is built from source in src/ and this
   tool, public/build3d and the markup file go. */
import fs from 'node:fs'
import path from 'node:path'

const SRC = path.resolve(process.argv[2] || '../../3D ONLY')
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..')
const OUT = path.join(ROOT, 'public', 'build3d')
const MARKUP = path.join(ROOT, 'src', 'scenes', 'build3d-markup.html')
const BASE = '/build3d/'

const die = msg => { console.error('embed-3d: ' + msg); process.exit(1) }
if (!fs.existsSync(path.join(SRC, 'index.html'))) die('no index.html in ' + SRC)

/* ---- the entry page: which script and stylesheet, and the markup ---- */
const html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8')
const jsName = (html.match(/<script[^>]+src="\.\/assets\/([^"]+\.js)"/) || [])[1]
const cssName = (html.match(/<link[^>]+href="\.\/assets\/([^"]+\.css)"/) || [])[1]
if (!jsName || !cssName) die('index.html no longer names one assets/*.js and one assets/*.css')

let body = (html.match(/<body[^>]*>([\s\S]*)<\/body>/) || [])[1]
if (!body) die('index.html has no <body>')
body = body.replace(/<!--[\s\S]*?-->/g, '').replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/(src|srcset)="(fallback|signs)\//g, `$1="${BASE}$2/`)
  .replace(/\n\s*\n+/g, '\n').trim() + '\n'
/* 30 Sep delivery: the loader draws the IAQ mark through inline CSS masks, url(signs/...), two marks each with the
   -webkit- twin */
const masks = (body.match(/url\((signs|fallback|icons)\//g) || []).length
if (masks !== 4) die(`markup: expected 4 url(signs/...) masks, found ${masks}. The delivery changed; update this tool.`)
body = body.replace(/url\((signs|fallback|icons)\//g, `url(${BASE}$1/`)

/* ---- the loading screen's own script (8 Oct) ----
   The delivery's index.html carries one inline script beside the bundle: the loading screen's globe, which also fills
   the IAQ mark red with the real progress (it reads --lp, which the bundle writes on #overlay, and writes --fill on
   .ov-logo). The markup above drops every script, so on the site the loader had no engine: a pale grey mark, nothing
   moving, no progress, for as long as the models took. It is kept now, as assets/loader.js, and scenes/build3d.js
   runs it just before the bundle. Its frames go through __b3d.raf like the bundle's, so its globe (96 000 points)
   waits while the section is off screen instead of drawing behind the hero. */
const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1].trim()).filter(Boolean)
if (inline.length !== 1 || !/ov-world/.test(inline[0])) die(`expected the one inline loader script (the .ov-world globe), found ${inline.length}. The delivery changed; update this tool.`)
let loader = inline[0]
const rafs = (loader.match(/requestAnimationFrame\(/g) || []).length
if (rafs !== 4) die(`loader script: expected 4 requestAnimationFrame calls, found ${rafs}. The delivery changed; update this tool.`)
loader = loader.replace(/requestAnimationFrame\(/g, '__b3d.raf(')
/* the fill tallies with the load: it eased at 8% a frame, so when the bundle reported 100% and lifted the screen the
   mark stood about four fifths full. At 100% it now closes in a third of the way each frame, and the globe keeps
   drawing through the overlay's fade (.35s) so the mark is seen to fill before it goes. */
function lpatch (label, from, to) {
  const n = loader.split(from).length - 1
  if (n !== 1) die(`loader patch "${label}": expected 1 match, found ${n}. The delivery changed; update this tool.`)
  loader = loader.replace(from, to)
}
lpatch('fill catch-up', 'shown += (want - shown) * 0.08', 'shown += (want - shown) * (want >= 1 ? 0.34 : 0.08)')
lpatch('finish the fill', "if (done()) { var lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext(); return }",
  "if (done()) { ov.style.setProperty('--lp', '1'); if (!frame.end) frame.end = ts; if (ts - frame.end > 450) { var lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext(); return } }")

/* ---- the script ---- */
let js = fs.readFileSync(path.join(SRC, 'assets', jsName), 'utf8')
const ID = '[A-Za-z_$][\\w$]*'
function patch (label, re, to, expect = 1) {
  const n = (js.match(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')) || []).length
  if (n !== expect) die(`script patch "${label}": expected ${expect} match(es), found ${n}. The delivery changed; update this tool.`)
  js = js.replace(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'), to)
}
patch('scroll position', new RegExp(`=\\(\\)=>(${ID})\\?(${ID}):scrollY`), '=()=>$1?$2:__b3d.y()')
patch('scroll range', /document\.documentElement\.scrollHeight-innerHeight/, '__b3d.span()')
patch('scroll to', new RegExp(`scrollTo\\(\\{top:(${ID}),behavior:(${ID})\\}\\)`), '__b3d.scrollTo($1,$2)')
patch('no jump to the top', new RegExp(`(${ID})\\|\\|scrollTo\\(0,0\\)`), '$1||0')
const loop = (js.match(new RegExp(`;(${ID})\\(\\);?\\s*$`)) || [])[1]
if (!loop) die('the script no longer ends by starting its render loop')
patch('render loop', new RegExp(`requestAnimationFrame\\(${loop.replace(/\$/g, '\\$')}\\)`), `__b3d.raf(${loop})`, 2)
/* 30 Sep delivery ("3D ONLY uplatest"): six panels, up from three (the rail HUD, two hover cards with their
   leader lines, the slow-frame notice, the floor loader, the x-ray pins) */
patch('panels into the section', /document\.body\.append(Child)?\(/, '__b3d.root.append$1(', 6)
patch('keyboard', /(^|[;,{}()])addEventListener\("keydown",/, '$1__b3d.onKey(', 6)
/* 2 Oct delivery ("3D ONLY update 10-2"): thirteen, up from eleven (the props folder, a second machines list) */
patch('model paths', /(["`])(?:\.\/)?models\//, `$1${BASE}models/`, 13)
patch('sign paths', /"\.\/signs\//, `"${BASE}signs/`, 2)
/* the sign painters take the page's base as an argument, "./", and add signs/... to it. From the 30 Sep delivery
   the fire kit and the scope cards take it too, and fetch models/... from it: seven calls, all a base */
patch('sign base', /\("\.\/"([,)])/, `("${BASE}"$1`, 7)
/* 30 Sep delivery: the rail's isometric trade icons (icons/iso/*.svg) */
patch('icon paths', /"\.\/icons\//, `"${BASE}icons/`, 1)

/* ---- the stylesheet ---- */
const css = fs.readFileSync(path.join(SRC, 'assets', cssName), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const PAGE = /^((?:html|:root)(?:[.:[][^\s>+~]*)?)?\s*((?:body)(?:[.:[][^\s>+~]*)?)?\s*/
function scopeSel (sel) {
  sel = sel.trim()
  if (/section-scroll/.test(sel)) return null
  if (sel === ':root') return '.b3d'
  if (sel === 'html' || sel === 'body') return '.b3d-stage'
  const m = sel.match(PAGE)
  const pre = [m[1], m[2]].filter(Boolean).join(' ')
  const rest = sel.slice(m[0].length)
  if (pre) return rest ? `${pre} .b3d ${rest}` : `${pre} .b3d`
  return '.b3d ' + sel
}
/* a small block walker: rules, and @media / @supports that hold rules; @keyframes kept as they are */
function scope (text) {
  let out = '', i = 0
  while (i < text.length) {
    const open = text.indexOf('{', i)
    if (open < 0) break
    const prelude = text.slice(i, open).trim()
    let depth = 1, j = open + 1
    while (j < text.length && depth) { if (text[j] === '{') depth++; else if (text[j] === '}') depth--; j++ }
    const inner = text.slice(open + 1, j - 1)
    i = j
    if (prelude.startsWith('@font-face')) continue
    if (/^@(media|supports|layer|container)/.test(prelude)) { out += `${prelude}{${scope(inner)}}`; continue }
    if (prelude.startsWith('@')) { out += `${prelude}{${inner}}`; continue }
    const sels = prelude.split(/,(?![^(]*\))/).map(scopeSel).filter(Boolean)
    if (sels.length) out += `${sels.join(',')}{${inner}}`
  }
  return out
}
const scoped = scope(css)

/* ---- write ---- */
fs.rmSync(OUT, { recursive: true, force: true })
const SKIP = new Set(['index.html', 'v3.html', 'README.txt', 'FILES.txt', 'serve.ps1', 'Open 3D (local).bat', '_headers', 'fonts'])
for (const f of fs.readdirSync(SRC)) if (!SKIP.has(f)) fs.cpSync(path.join(SRC, f), path.join(OUT, f), { recursive: true })
fs.rmSync(path.join(OUT, 'assets', jsName)); fs.rmSync(path.join(OUT, 'assets', cssName))
fs.writeFileSync(path.join(OUT, 'assets', 'app.js'), js)
fs.writeFileSync(path.join(OUT, 'assets', 'app.css'), scoped)
fs.writeFileSync(path.join(OUT, 'assets', 'loader.js'), loader + '\n')
fs.writeFileSync(MARKUP, body)
const mb = p => { const st = fs.statSync(p); return st.isDirectory() ? fs.readdirSync(p).reduce((a, f) => a + mb(path.join(p, f)), 0) : st.size }
console.log(`embed-3d: ${path.basename(SRC)} -> public/build3d (${(mb(OUT) / 1048576).toFixed(1)} MB), script ${jsName}, styles ${cssName}, markup src/scenes/build3d-markup.html`)
