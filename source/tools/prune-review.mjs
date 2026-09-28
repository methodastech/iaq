/* Review build pruning (28 Sep 2026). `npm run build:review` is what Netlify publishes at iaq.netlify.app: the site
   with the Super Admin bar and its review pages (audit, competitors, plan, design, Web 1, CMS, Codex), minus the
   Amendments checklist ("need the super admin. but the Amendments hide"). The React bar drops its tab by build mode
   (components/AdminBar.jsx); this removes the page and the tab from the static pages' own copies of the bar.

   It also removes what never ships in any build (as tools/prune-launch.mjs does): the client walkthrough with the
   client's signage, and the notes naming staff and sources. And the review site asks search engines not to index
   it (robots.txt here; an X-Robots-Tag header in netlify.toml). */
import fs from 'node:fs'
const D = process.argv[2] || 'dist-review'
if (!fs.existsSync(D)) { console.error('prune-review: no ' + D); process.exit(1) }

const gone = ['checklist.html', 'assets/videos/hero-hasegawa-walk.mp4', 'assets/newsroom/SOURCES.md', 'assets/iaq/SOURCES.md',
  'assets/culture/SOURCES.md', 'assets/culture/offices/SOURCES.md', 'assets/iaq/model3d/README.txt']
for (const p of gone) if (fs.existsSync(D + '/' + p)) { fs.rmSync(D + '/' + p, { recursive: true, force: true }); console.log('removed', p) }

/* the Amendments tab in the static pages' copies of the bar: <a href="/checklist.html"><i>03</i>Amendments</a> */
const TAB = /<a href="\/checklist\.html"[^>]*>(?:(?!<\/a>)[\s\S])*<\/a>/g
let pages = 0
for (const f of fs.readdirSync(D)) {
  if (!f.endsWith('.html')) continue
  const s = fs.readFileSync(D + '/' + f, 'utf8'), t = s.replace(TAB, '')
  if (t !== s) { fs.writeFileSync(D + '/' + f, t); pages++ }
}
console.log('Amendments tab removed from', pages, 'static pages')

fs.writeFileSync(D + '/robots.txt', 'User-agent: *\nDisallow: /\n')
console.log('review build pruned · robots.txt set to disallow all')
