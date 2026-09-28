/* Writes public/sitemap.xml from the sitemap data, the project registry and the news slugs.
   Runs before every build. Domain from SITE_URL or the default.
   15 Sep: pages the launch build drops (lib/launch.js) are left out too: exhibition and leadership.
   18 Sep: a section route (/careers#culture) is not a URL of its own and is left out. */
import fs from 'node:fs'
const SITE = process.env.SITE_URL || 'https://iaqtechnology.com'
const src = fs.readFileSync('src/data/sitemap.js', 'utf8')
const routes = [...new Set([...src.matchAll(/route: '([^']+)'/g)].map(m => m[1]).filter(r => !r.includes(':') && !r.includes('#') && !['/investors', '/portal', '/shortlist', '/exhibition', '/about/leadership', '/home2', '/about2', '/fab', '/flow'].includes(r)))]
const projects = (fs.readFileSync('src/data/projects.js', 'utf8').match(/name: /g) || []).length
const news = [...fs.readFileSync('src/data/news.js', 'utf8').matchAll(/slug: '([^']+)'/g)].map(m => m[1])
/* 17 Sep: one page per vacancy, so each open role is its own URL for search and for HR to post */
const roles = [...fs.readFileSync('src/data/roles.js', 'utf8').matchAll(/ref: '([^']+)'/g)]
  .map(m => m[1].toLowerCase().replace(/[^a-z0-9]+/g, '-'))
const today = new Date().toISOString().slice(0, 10)
const urls = [...routes, ...Array.from({ length: projects }, (_, i) => '/projects/' + i), ...news.map(s => '/news/' + s),
  ...roles.map(r => '/careers/role/' + r)]
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(u => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n</urlset>\n'
fs.writeFileSync('public/sitemap.xml', xml)
console.log('sitemap.xml ·', urls.length, 'urls')
