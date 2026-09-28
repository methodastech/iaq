import React, { useMemo } from 'react'
import { PROJECTS, INDUSTRIES, INDLBL } from '../data/projects.js'
import '../styles/registry-banner.css'

/* ---------------------------------------------------------------------------
   THE REGISTRY BANNER · /projects

   The old banner was a single team photograph behind a scrim so heavy it had to
   be pushed to near black for white type to survive. It carried no information,
   and nothing about it said "registry": one posed photo cannot stand for 230
   delivered projects.

   So the banner IS the registry. Three columns of the actual project
   photographs drift at different speeds behind the headline, which is what the
   page is: an archive you can search. The wall is desaturated and darkened in
   CSS rather than in the assets, so the same files serve the cards below at
   full strength and nothing new is downloaded for the banner.

   Honesty: every figure in the strip is one the site already publishes. The
   count of images shown is not presented as the project count, because the
   working sample holds 18 while the record is 250+; the strip states both
   rather than letting a wall of 18 imply the whole archive.
   --------------------------------------------------------------------------- */

/* the seven markets with their live counts, widest first, and each bar sized against the
   largest so the shape of the record reads at a glance */
function buildLedger () {
  const rows = INDUSTRIES.map(([k]) => ({
    k, label: INDLBL[k], n: PROJECTS.filter(p => p.ind === k).length,
  })).sort((a, b) => b.n - a.n || a.label.localeCompare(b.label))
  const max = Math.max(1, ...rows.map(r => r.n))
  return rows.map(r => ({ ...r, pct: Math.round((r.n / max) * 100) }))
}
const LEDGER = buildLedger()

const STATS = [
  { k: '250+', v: 'Projects delivered' },
  { k: '1,050,000', v: 'm² cleanroom built' },
  { k: '7', v: 'Markets served' },
  { k: '7', v: 'Countries' },
]

export default function RegistryBanner({ shown = 18 }) {
  /* three interleaved columns, so neighbouring tiles are never the same project */
  const cols = useMemo(() => {
    const imgs = PROJECTS.map(p => p.img).filter(Boolean)
    const out = [[], [], []]
    imgs.forEach((src, i) => out[i % 3].push(src))
    /* each column is doubled so the vertical marquee can loop seamlessly */
    return out.map(c => c.concat(c))
  }, [])

  return (
    <section className="rb" aria-labelledby="rbH">
      <div className="rb-wall" aria-hidden="true">
        {cols.map((col, ci) => (
          <div className={'rb-col rb-col-' + ci} key={ci}>
            {col.map((src, i) => (
              <span className="rb-tile" key={ci + '-' + i}>
                <img src={src} alt="" loading="lazy" decoding="async" />
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* 26 Sep: no scrim and no grid; the words sit on their own navy block (registry-banner.css) */}

      <header className="rb-head wrap">
        <span className="eyebrow">Project registry</span>
        <h1 id="rbH">250+ projects, <em>on the record.</em></h1>
        {/* The second sentence used to read "One registry powers filtering, search, related
            projects and SEO" — written to the client buying the site, not to the visitor
            using it. */}
        <p className="rb-lede">
          Every project carries structured tags: industry, location, delivery model and
          cleanroom class. Filter by any of them and the record narrows
          to the work that matches it.
        </p>

        <dl className="rb-stats">
          {STATS.map(s => (
            <div key={s.v}>
              <dt>{s.k}</dt>
              <dd>{s.v}</dd>
            </div>
          ))}
        </dl>
        {/* 18 Sep (Bazil: "too tall, no need those bar info"): the seven-market ledger and its
            sample note came out of the banner; the filter console under it does that job. */}
      </header>
    </section>
  )
}
