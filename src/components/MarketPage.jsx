import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from './Nav.jsx'
import Footer from './Footer.jsx'
import PageHead from './PageHead.jsx'
import Related from './Related.jsx'
import Icon from './FlowIcon.jsx'
import { SCOPES, INDLBL, TYPLBL, fmtSize, pad3 } from '../data/projects.js'
import { cmsProjects, live } from '../lib/cms.js'
const PROJECTS = live(cmsProjects)
import '../styles/pages.css'
import '../styles/markets.css'

/* ============================================================================
   The sector page template. Every market page in group 03 renders through this,
   so all seven carry the block order sitemap.js declares for them:

     Sector hero · What this market demands · How IAQ delivers it ·
     Standards and classes · Proof projects · Enquiry

   The copy lives in the page files, verbatim from the verified sources. This
   file holds only the structure, so a copy correction is a one-line edit in one
   place and never a hunt through seven near-identical pages.

   Interlinking: R1 is satisfied twice on every page, once from the hero fact
   strip and once from the card under the proof grid, both straight into the
   registry pre-filtered on the market's existing hash slug. R3 is satisfied by
   the proof grid, which reads src/data/projects.js rather than a hand list.
   ========================================================================= */

/* The delivery cycle. Stage names and one-liners are the built site's own,
   and each stage deep-links to its capability page. */
export const DISCIPLINES = [
  { n: '01', name: 'Engineering Design & Consultation', line: 'Concept to detailed CSA and MEP design.', to: '/services/design' },
  { n: '02', name: 'Procurement', line: 'Vendors qualified, long-lead equipment tracked.', to: '/services/procurement' },
  { n: '03', name: 'Construction', line: 'Every trade coordinated, schedule and cost held.', to: '/services/construction' },
  { n: '04', name: 'Testing & Commissioning', line: 'Class proven by test, certified handover dossier.', to: '/services/commissioning' },
  { n: '05', name: 'Maintenance', line: 'Planned preventive programmes across the lifecycle.', to: '/services/maintenance' },
]

/** every published project in a market, with its registry index preserved */
export function projectsFor(ind) {
  return PROJECTS.map((p, i) => ({ ...p, i })).filter(p => p.ind === ind)
}

export default function MarketPage({
  id, no, name, title, lede, image, ind, hash,
  facts = [], why, demands = [], deliverIntro = [], scopeTitle,
  cycleLede, standards, slot, proofLede,
}) {
  useEffect(() => { document.title = `IAQ Group · ${name} · Brand Method` }, [name])

  const proof = projectsFor(ind)
  const scope = SCOPES[ind] || []
  const classes = Array.from(new Set(proof.map(p => p.iso).filter(Boolean)))
  const regLabel = INDLBL[ind] || name

  /* the fourth fact is always the registry, so R1 is reachable from the hero */
  const allFacts = facts.concat([{
    k: 'On the registry',
    v: `${proof.length} published`,
    sub: 'Sample registry. The full 230+ record migrates at launch.',
    to: `/projects#${hash}`,
  }])

  return (
    <>
      <Nav />

      {/* ------------------------------------------------ 01 · sector hero */}
      <div className="mkb">
        <div className="mkb-bg" aria-hidden="true"><img src={image} alt="" /></div>
        <div className="mkb-grid" aria-hidden="true" />
        <PageHead eyebrow={`Market ${no} · Who we serve`} title={title} lede={lede} />
        <div className="mk-facts-w">
          <div className="pg-in">
            <div className="mk-facts">
              {allFacts.map(f => {
                const body = <><span className="k">{f.k}</span><span className="v">{f.v}{f.sub ? <small>{f.sub}</small> : null}</span></>
                return f.to
                  ? <Link className="mk-fact" key={f.k} to={f.to}>{body}</Link>
                  : <div className="mk-fact" key={f.k}>{body}</div>
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------- 02 · what this market demands */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="pg-k">What this market demands</span>
          <h2>{why.head}</h2>
          <div className="pg-split">
            <blockquote className="pg-pull"><small>{why.cite}</small>{why.quote}</blockquote>
            <p className="pg-body u-mt0">{why.body}</p>
          </div>
          <ul className="mk-dem">
            {demands.map((d, i) => (
              <li className="pg-beat" key={d}><i>REQ &middot; {pad3(i + 1)}</i><p>{d}</p></li>
            ))}
          </ul>
        </div>
      </section>

      {/* ----------------------------------- 03 · how IAQ delivers it */}
      <section className="pg-sec calm">
        <div className="pg-in">
          <span className="pg-k">How IAQ delivers it</span>
          <h2>One accountable team, every system</h2>
          {deliverIntro.map((p, i) => <p className="pg-body" key={i}>{p}</p>)}

          <span className="pg-k mk-sub">{scopeTitle}</span>
          <ol className="pg-scope">
            {scope.map((s, i) => <li key={s}><i>{pad3(i + 1)}</i><span>{s}</span></li>)}
          </ol>

          <p className="pg-lede">{cycleLede}</p>
          <div className="pg-rail">
            {DISCIPLINES.map(d => (
              <Link className="pg-rail-n" key={d.n} to={d.to}>
                <span className="n">STAGE {d.n}</span>
                <b>{d.name}</b>
                <small>{d.line}</small>
              </Link>
            ))}
          </div>
          <p className="pg-loop"><i />The cycle closes: what maintenance learns goes back into the next design</p>
        </div>
      </section>

      {/* ------------------------------- 04 · standards and classes */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="pg-k">Standards and classes</span>
          <h2>{standards.head}</h2>
          <div className="pg-split">
            <div>
              <p className="pg-body u-mt0">{standards.body}</p>
              {classes.length > 0 && (
                <ul className="pg-chips">
                  <li className="pg-chip b">Published record</li>
                  {classes.map(c => <li className="pg-chip" key={c}>{c}</li>)}
                </ul>
              )}
            </div>
            {slot ? (
              <div className="pg-slot u-mt0">
                <div className="pg-slot-in">
                  <span className="pg-slot-tag">{slot.tag}</span>
                  <b>{slot.title}</b>
                  <p>{slot.body}</p>
                  <span className="pg-k">{slot.who}</span>
                </div>
              </div>
            ) : (
              <div>
                <span className="pg-k">{standards.k2}</span>
                <p className="pg-body">{standards.body2}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------- 05 · proof projects */}
      <section className="pg-sec calm">
        <div className="pg-in">
          <span className="pg-k">Proof</span>
          <h2>Delivered in this market</h2>
          <p className="pg-lede">{proofLede}</p>

          <div className={proof.length < 3 ? 'pg-proof few' : 'pg-proof'}>
            {proof.map(p => (
              <Link className="pg-pc" key={p.i} to={`/projects/${p.i}`}>
                <div className="pg-pcv"><img src={p.img} alt="" loading="lazy" /></div>
                <div className="pg-pc-in">
                  <span className="pg-ref"><span>PRJ &middot; {pad3(p.i)}</span><span className="iso">{p.iso}</span></span>
                  <h3>{p.name}</h3>
                  <span className="pg-cl">{p.client} &middot; {p.loc}</span>
                  <div className="pg-tags">
                    {/* fmtSize prints "At scale" when a size is not recorded, which
                        says nothing on a tag: only show the tag when there is a number */}
                    {p.size > 0 && <span className="pg-tag b">{fmtSize(p)}</span>}
                    {TYPLBL[p.type] && <span className="pg-tag">{TYPLBL[p.type]}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* R1: straight into the registry, already filtered to this market */}
          <Link className="pg-nextcard" to={`/projects#${hash}`}>
            <span className="pg-nextic"><Icon name="folder" /></span>
            <span>
              <b>Every {regLabel} project in the record</b>
              <small>Opens the registry with the {regLabel} filter already applied. Nothing to set.</small>
            </span>
            <span className="pg-nextarrow"><Icon name="arrow" /></span>
          </Link>
        </div>
      </section>

      {/* --------------------------------------------- 06 · enquiry */}
      <section className="pg-cta">
        <div className="pg-in">
          <div>
            <span className="eyebrow">Start a project</span>
            <h2>Tell us what you are building</h2>
            <p>From feasibility to handover, one accountable team. Send the brief and it goes to the people who have built this environment before.</p>
          </div>
          <div className="pg-cta-act">
            <Link className="cta" to="/contact">Start a project</Link>
            <span className="pg-cta-meta">{name} enquiry<br />Response within one working day</span>
          </div>
        </div>
      </section>

      <Related from={id} />
      <Footer note={`${name} market concept · Brand Method`} />
    </>
  )
}
