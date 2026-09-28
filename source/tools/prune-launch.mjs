/* Launch build pruning (10 Sep 2026). `npm run build:launch` builds with MODE=launch (no admin bar,
   no concept routes) and then removes the internal review material that `public/` carries for the
   prototype workflow, so none of it ships to the public host. */
import fs from 'node:fs'
const D = process.argv[2] || 'dist'
const gone = ['bmws.pre-myhero-0923.bak.css', 'design-assets', /* 25 Sep: the Hasegawa walkthrough carries a client's signage and never ships, whatever the hero reel lists */ 'assets/videos/hero-hasegawa-walk.mp4', /* 24 Sep: the notes files beside the photographs name IAQ staff and sources; never public */ 'assets/newsroom/SOURCES.md', 'assets/iaq/SOURCES.md', 'assets/culture/SOURCES.md', 'assets/culture/offices/SOURCES.md', /* 26 Sep: the model mirror's notes name the maker and the source app; nothing references the file */ 'assets/iaq/model3d/README.txt', 'web1', 'assets/competitors', 'audit.html', 'plan.html', 'design.html', /* 25 Sep, night: the Design tab's own assets, including the third-party reference board, internal only */ 'design', /* 26 Sep: the loading-screen demos for the Design tab, internal */ 'loader-lab', 'checklist.html', 'competitors.html', 'qa.html', 'project-format.html', 'bmws.css', 'codex', 'booth', /* 25 Sep: the client's review screenshots, internal */ 'review'].map(p => D + '/' + p)
let freed = 0
const size = p => { try { const st = fs.statSync(p); if (st.isDirectory()) return fs.readdirSync(p).reduce((a, f) => a + size(p + '/' + f), 0); return st.size } catch { return 0 } }
for (const p of gone) { const b = size(p); if (b) { fs.rmSync(p, { recursive: true, force: true }); freed += b; console.log('removed', p, (b / 1048576).toFixed(1) + ' MB') } }
console.log('launch build pruned ·', (freed / 1048576).toFixed(1), 'MB removed from dist')

/* 26 Sep: internal review notes name the reviewer in code comments ("(Bazil: ...)"), and the 3D app's HTML and the
   styles injected as strings keep their comments through minifying. Any comment that names him is scrubbed from the
   published text files: an HTML comment is removed whole; a CSS or JS comment keeps its place, with the name taken
   out. Only comment text changes, never code. Runs on the launch build only (never on the source). */
const TEXT = /\.(html|js|css|mjs|txt|xml|json)$/i, NAME = /bazil/i
let scrubbed = 0
const walk = d => { for (const f of fs.readdirSync(d)) { const p = d + '/' + f, st = fs.statSync(p)
  if (st.isDirectory()) { walk(p); continue }
  if (!TEXT.test(f) || st.size > 20 * 1048576) continue
  const s = fs.readFileSync(p, 'utf8'); if (!NAME.test(s)) continue
  const t = s.replace(/<!--[\s\S]*?-->/g, m => NAME.test(m) ? '' : m)
             .replace(/\/\*[\s\S]*?\*\//g, m => NAME.test(m) ? m.replace(/\bBazil\b[^:)"]*/gi, 'review') : m)
  if (t !== s) { fs.writeFileSync(p, t); scrubbed++ } } }
if (D !== 'dist' && fs.existsSync(D)) { walk(D); console.log('review names scrubbed from', scrubbed, 'files') }
