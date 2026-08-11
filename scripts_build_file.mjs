/* Makes the build openable by double-clicking index.html, with no server.

   THE ACTUAL CONSTRAINT: Chrome blocks `<script type="module">` loaded over file:// under CORS
   (origin "null"). Classic scripts are NOT blocked. So the fix is to stop emitting modules — not
   to inline anything. An earlier attempt inlined the whole 1.9MB bundle into the HTML and broke on
   React's own `"<script><\/script>"` string literal, which is a good illustration of why inlining
   a large bundle into markup is the fragile path.

   Two things still have to be corrected after the iife build:
     1. the emitted tag keeps type="module"        -> strip it, leave a classic script
     2. a classic script is NOT implicitly deferred -> move it to just before </body>, or it runs
        before <div id="root"> exists and main.jsx dies on a null container   */
import fs from 'fs'
import path from 'path'

const DIR = 'dist-file'
let fixed = 0

for (const name of fs.readdirSync(DIR).filter(f => f.endsWith('.html'))) {
  const file = path.join(DIR, name)
  let s = fs.readFileSync(file, 'utf8')
  const tag = s.match(/<script[^>]*src="\.\/app\.js"[^>]*><\/script>/)
  if (!tag) continue
  s = s.replace(/<script[^>]*src="\.\/app\.js"[^>]*><\/script>/g, '')
  s = s.replace(/<\/body>/i, '  <script src="./app.js"></script>\n</body>')
  s = s.replace(/\s+crossorigin(?==|\s|>)/g, '')
  fs.writeFileSync(file, s)
  fixed++
}

const idx = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8')
const rootAt = idx.indexOf('id="root"')
const scriptAt = idx.indexOf('src="./app.js"')
console.log(`patched ${fixed} html file(s)`)
console.log('  module scripts left :', /type="module"/.test(idx) ? 'YES — WILL FAIL on file://' : 'none')
console.log('  script after #root  :', scriptAt > rootAt ? 'yes' : 'NO — will crash on a null #root')
console.log('  bundle              :', (fs.statSync(path.join(DIR, 'app.js')).size / 1024).toFixed(0) + ' KB beside the html')
