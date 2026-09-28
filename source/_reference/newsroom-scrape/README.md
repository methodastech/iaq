# IAQ newsroom scrape (15 Sep 2026)

Text of every post on iaqtechnology.com.my, captured for the news article bodies, the History achievements and the
Culture page. `raw/*.txt` are produced by `parse.py` from each post's HTML; `ALL_POSTS*.txt` is the post index;
`dl_list*.txt` map each image slug to its source URL. The photographs used on the site were converted to WebP in
`public/assets/newsroom/` and `public/assets/culture/`, each listed in that folder's SOURCES.md.

The rebuild script for `src/data/news.js` is `tools/news-build/build.py`. It was written in a session scratchpad:
if it still points at /private/tmp paths, point them at this folder before running it.

Layout mirrors the session scratchpad the script was written in: `research/raw`, `research/images/manifest.json`,
`news-bodies/*.json`. `tools/news-build/build.py` now defaults to this folder (override with `NEWS_SP`). The
original downloaded photographs were NOT copied (the WebP versions are in public/assets/newsroom/); a full re-run
that re-converts images must re-download them from the URLs in `research/images/manifest.json` and
`news-bodies/img-map.json`.
