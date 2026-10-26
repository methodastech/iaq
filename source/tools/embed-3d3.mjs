/* IAQ 3D 3 on the home page (26 Oct 2026, "replace the home page 3D with this new version": yes).

   The developer's new engine ships as a small static site of its own (iaq3d3-netlify: index.html forwarding to
   projects/iaq3d3/index.html, assets/, iaq3d3/, mranti/, plus a second demo project, mranti-site). Unlike the
   earlier deliveries (tools/embed-3d.mjs) it is written to own a whole window and resolves every file relative to
   its own page, so the site frames it (components/Build3D3.jsx) instead of mounting it into the home page. This
   tool copies it into public/build3d3/ with its folder layout kept, and re-run on every new delivery:

     node tools/embed-3d3.mjs "<unzipped iaq3d3-netlify folder>"

   It leaves out the mranti-site demo (its page and its two asset files) and the delivery's _headers, which are
   written for its own site root and would claim the website's /assets/*.

   It changes the delivery in these ways, each checked; a pattern that no longer matches stops the tool:
     script  when framed, the wheel no longer turns the build inside the frame: it is handed to the page, which
             scrolls, and the page hands the scroll position back (message "b3d3-p": the change and the ends), so
             the build follows the page scroll from the first step through "Complete the build" to the finished
             facility and the page carries on past it. Over the left panel the wheel scrolls the panel while it can
             still scroll that way, and the page once it cannot (26 Oct: "im stuck cant scroll up", the panel taller
             than the window held the wheel at its top), and the wheel is taken on the way in, before the camera controls can keep
             it for zoom once the build is finished ("it cant scroll up back"). On its own page the app behaves as delivered.
     page    phones: a vertical swipe on the model scrolls the page rather than holding the visitor in the frame */
import fs from 'node:fs'
import path from 'node:path'

const SRC = path.resolve(process.argv[2] || '')
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..')
const OUT = path.join(ROOT, 'public', 'build3d3')
const die = msg => { console.error('embed-3d3: ' + msg); process.exit(1) }
const PAGE = path.join('projects', 'iaq3d3', 'index.html')
if (!fs.existsSync(path.join(SRC, PAGE))) die('no ' + PAGE + ' in ' + SRC)

/* the page names its bundle and stylesheet */
let html = fs.readFileSync(path.join(SRC, PAGE), 'utf8')
const jsName = (html.match(/<script type="module"[^>]+src="\.\.\/\.\.\/assets\/([^"]+\.js)"/) || [])[1]
if (!jsName) die('the 3D page no longer names one ../../assets/*.js bundle')

/* copy, the layout kept */
fs.rmSync(OUT, { recursive: true, force: true })
const skip = rel => /^projects[\\/]mranti-site/.test(rel) || /^assets[\\/]mranti-site-/.test(rel) || /^_headers$/.test(rel) ||
  /^(index\.html|README\.txt|FILES\.txt)$/.test(rel)
let n = 0
const walk = dir => {
  for (const e of fs.readdirSync(path.join(SRC, dir), { withFileTypes: true })) {
    const rel = path.join(dir, e.name)
    if (skip(rel)) continue
    if (e.isDirectory()) { walk(rel); continue }
    fs.mkdirSync(path.join(OUT, dir), { recursive: true })
    fs.copyFileSync(path.join(SRC, rel), path.join(OUT, rel)); n++
  }
}
walk('')

/* the script: the wheel goes to the page when framed, the page's scroll comes back */
const jsPath = path.join(OUT, 'assets', jsName)
let js = fs.readFileSync(jsPath, 'utf8')
const A = 'let H=0;addEventListener("wheel",L=>{if(!v||'
if (js.split(A).length !== 2) die('scroll bridge: expected one wheel handler after "let H=0;". The delivery changed; update this tool.')
const bridge =
  'let H=0;' +
  'window.parent!==window&&addEventListener("message",L=>{const D=L.data;if(!D||D.kind!=="b3d3-p"||L.origin!==location.origin||document.body.classList.contains("room"))return;' +
  'C();b=!0;d.progress=D.f>=1?1:D.f<=0?0:gt.clamp(d.progress+D.df,0,1)});' +
  /* how far the picture itself has got (it eases behind the progress), sent back so the page can hold at the end of the
     section until the finished facility is on screen */
  'window.parent!==window&&setInterval(()=>parent.postMessage({kind:"b3d3-shown",s:d.shown,p:d.progress},location.origin),150);' +
  /* the page's wheel, caught on the way in (capture on the window, ahead of the camera controls, which stop the wheel at
     the canvas once the build is finished and would otherwise zoom with it) */
  'window.parent!==window&&addEventListener("wheel",L=>{if(L.ctrlKey)return;const P=L.target.closest?.("#hud2 .h-left");' +
  'if(P&&(L.deltaY<0?P.scrollTop>0:P.scrollTop+P.clientHeight<P.scrollHeight-1))return;L.preventDefault();L.stopPropagation();' +
  'parent.postMessage({kind:"b3d3-wheel",dy:L.deltaMode===1?L.deltaY*16:L.deltaMode===2?L.deltaY*innerHeight:L.deltaY},location.origin)},{capture:!0,passive:!1});' +
  'addEventListener("wheel",L=>{if(window.parent!==window)return;' +
  'if(!v||'
js = js.replace(A, bridge)
/* 27 Oct ("i still stuck scroll up, not going back to process utilities, cleanroom"): once the finished facility has settled,
   the app leaves the build for a free orbit (z(!1)) and stops following the progress. A scroll from the page puts it back in
   the build (v||z(!0) above), and the orbit only takes over while the progress itself is at the end, not just the picture */
const O = 'W&&!w&&v&&z(!1)'
if (js.split(O).length !== 2) die('scroll bridge: expected one "finished, leave the build" switch. The delivery changed; update this tool.')
/* 27 Oct ("why scroll up it keep repeating with animation, not feel smooth"): framed in the page, the app never leaves the
   build for the free orbit at all, so a scroll back up just takes parts away from the same view instead of flying the
   camera between the orbit and the build each time; on its own page the orbit still takes over at the end */
js = js.replace(O, 'W&&!w&&v&&d.progress>=.998&&window.parent===window&&z(!1)')
fs.writeFileSync(jsPath, js)

/* the page: a vertical swipe scrolls the website on phones */
/* 27 Oct ("remove that", on the texture and tree credit in the corner): framed in the page, the credit line is not drawn
   over the 3D; the website's footer carries it (components/Footer.jsx), as the tree model's CC BY 4.0 licence requires */
const STYLE = '<style id="b3d3-embed">@media (hover:none) and (pointer:coarse){#scene{touch-action:pan-y!important}}.credits{display:none!important}</style>'
if (!html.includes('</head>')) die('the 3D page has no </head>')
html = html.replace('</head>', STYLE + '\n</head>')
fs.writeFileSync(path.join(OUT, PAGE), html)

console.log(`embed-3d3: ${n} files into public/build3d3, bundle ${jsName} bridged`)
