/* ============ newsroom artwork ============
   ONE mapping from a story to its picture, for every surface that shows a news card: the
   newsroom front page and archive (pages/News.jsx), the featured rail (components/NewsFeatured.jsx),
   the home rail (components/NewsRail.jsx) and the article page (pages/Article.jsx). A story keeps
   the same picture wherever it appears.

   15 SEP: REAL PHOTOGRAPHS FIRST. Every row in data/news.js whose post had an IAQ photograph now
   carries it as `img`, and `art()` returns that before anything else. The pools below are only
   the fallback for a story with no usable photograph (the list, with reasons, is in the header of
   data/news.js), and for a story added in the portal without one.

   Three pictures left the pools today because they ARE newsroom photographs of specific stories:
   photo-team is the House of Love day at Chocolate Museum, photo-opening the IMS internal audit,
   photo-awards the MCIEA 2024 awards night. Left in, a story without a photograph would have worn
   another story's picture.

   HOW THE FALLBACK ALLOCATES. Almost every photo-less story is Industry commentary on data centres,
   semiconductors or batteries, so a story is first matched to a TOPIC by its title, then by tag.
   Inside its pool, stories are ranked newest first among the stories that ALSO lack a photograph
   and take pool[rank % pool.length]. Each pool is at least as long as the photo-less stories that
   currently land in it, so no two fallback stories share a picture; the mapping depends on the
   registry's dates, not on render order. */

/* by topic: matched against the title */
const TOPICS = [
  { key: 'datacentre', re: /data cent/i, pool: [
    '/assets/industries/data-centre.webp',
    '/assets/services/data-centre.jpg',
    '/assets/ph-digital.webp',
    '/assets/tl-2025-global.webp',
  ] },
  { key: 'semiconductor', re: /semiconductor|wafer|chip/i, pool: [
    '/assets/industries/semiconductor.webp',
    '/assets/contact-cleanroom.webp',
    '/assets/about-hero-poster.webp',
    '/assets/services/semiconductor.png',
    '/assets/about-2015-robotics.webp',
  ] },
  { key: 'battery', re: /batter|sodium|\bev\b|electric vehicle|gigafactory|dry room/i, pool: [
    '/assets/industries/ev-battery.webp',
    '/assets/tl-2020-dryroom.webp',
    '/assets/services/ev-charger.webp',
  ] },
]

/* by tag: ordered so the strongest picture goes to the newest story */
const POOLS = {
  CSR: [
    '/assets/about-story-broll.webp',
    '/assets/tl-2007-europe.webp',
  ],
  EHS: [
    '/assets/ph-crane.webp',
    '/assets/ph-electrical.webp',
    '/assets/ph-boiler.webp',
  ],
  Quality: [
    '/assets/contact-cleanroom.webp',
    '/assets/about-hero-poster.webp',
  ],
  Company: [
    '/assets/hero-campus.webp',
    '/assets/about-hero-dusk.webp',
    '/assets/film-poster.webp',
    '/assets/tl-2000-china.webp',
    '/assets/about-1994-workshop.webp',
  ],
  Industry: [
    '/assets/industries/photovoltaic.webp',
    '/assets/ph-blueprint.webp',
    '/assets/industries/district-cooling.webp',
    '/assets/about-2013-energy.webp',
  ],
}

const byDate = (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (a.slug < b.slug ? -1 : 1))
const topicOf = item => TOPICS.find(t => t.re.test(String(item.title || ''))) || null

/** the fallback pool a photo-less story draws from, and the stories that share it */
function poolFor (item, rows) {
  const t = topicOf(item)
  if (t) return { pool: t.pool, same: rows.filter(n => !n.img && topicOf(n) === t) }
  return {
    pool: POOLS[item.tag] || POOLS.Company,
    same: rows.filter(n => !n.img && !topicOf(n) && n.tag === item.tag),
  }
}

/** the picture for one story. `list` is the registry it belongs to. */
export function art (item, list) {
  if (!item) return POOLS.Company[0]
  if (item.img) return item.img            /* the post's own photograph always wins */
  const rows = Array.isArray(list) ? list : []
  const { pool, same } = poolFor(item, rows)
  const i = [...same].sort(byDate).findIndex(n => n.slug === item.slug)
  return pool[(i < 0 ? 0 : i) % pool.length]
}

export { POOLS as NEWS_ART_POOLS, TOPICS as NEWS_ART_TOPICS }
