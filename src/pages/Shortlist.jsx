import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import PageHead from '../components/PageHead.jsx'
import Related from '../components/Related.jsx'
import { INDLBL, TYPLBL } from '../data/projects.js'
import { cmsProjects, live } from '../lib/cms.js'
const PROJECTS = live(cmsProjects)
import * as SL from '../lib/shortlist.js'
import '../styles/pages.css'
import '../styles/shortlist.css'

/* ============================================================================
   /shortlist · the wishlist.

   Two modes, and the distinction matters:
     OWN       the visitor's own saved list, editable, held in localStorage
     RECEIVED  a list arriving in the URL from a colleague, read-only until
               the recipient chooses to adopt it

   A received list is never silently merged. Overwriting somebody's own saved
   work because they clicked a link is a decision they did not make.
   ============================================================================ */

export default function Shortlist() {
  const loc = useLocation()
  const received = useMemo(() => {
    const q = new URLSearchParams(loc.search)
    return q.has('p') ? SL.decode(q.get('p')) : null
  }, [loc.search])

  const [own, setOwn] = useState(SL.get)
  const [copied, setCopied] = useState(false)
  const [adopted, setAdopted] = useState(false)

  useEffect(() => {
    document.title = 'IAQ Group · Project shortlist · Brand Method'
    return SL.subscribe(setOwn)
  }, [])

  const viewing = received && !adopted ? received : own
  const isReceived = !!received && !adopted

  const rows = viewing
    .map(i => ({ i, p: PROJECTS[i] }))
    .filter(r => r.p)

  async function share() {
    const url = SL.shareUrl(viewing)
    try {
      if (navigator.share) { await navigator.share({ title: 'IAQ project shortlist', url }); return }
      await navigator.clipboard.writeText(url)
      setCopied(true); setTimeout(() => setCopied(false), 2400)
    } catch {
      /* clipboard blocked, or the share sheet was dismissed. Show the raw link so the visitor can
         copy it by hand rather than being told nothing happened. */
      window.prompt('Copy this link', url)
    }
  }

  return (
    <>
      <Nav />

      <PageHead
        eyebrow={isReceived ? 'Shared shortlist' : 'Your shortlist'}
        title={isReceived
          ? <>A colleague sent you <em>these projects.</em></>
          : <>The projects you <em>saved.</em></>}
        lede={isReceived
          ? 'This list was put together by someone else and is shown read only. Add it to your own shortlist to edit it, or send it straight to IAQ as it is.'
          : 'Saved projects stay here between visits. Send the list to a colleague, or attach it to an enquiry so IAQ knows what you have already looked at.'}
        chips={[`${rows.length} ${rows.length === 1 ? 'project' : 'projects'}`, isReceived ? 'Read only' : 'Saved on this device']}
      />

      <section className="pg-sec" aria-labelledby="sl-h">
        <div className="pg-in">
          <h2 id="sl-h" className="sl-vh">Saved projects</h2>

          {rows.length === 0 ? (
            <div className="pg-slot">
              <div className="pg-slot-in">
                <span className="pg-slot-tag">Nothing saved yet</span>
                <p>
                  Open the projects registry and save anything relevant. The list is kept on this
                  device, so it is still here when you come back, and it can be sent to a colleague
                  or attached to an enquiry in one step.
                </p>
                <Link className="pg-more" to="/projects">Open the registry <i aria-hidden="true">&rarr;</i></Link>
              </div>
            </div>
          ) : (
            <>
              <div className="sl-bar">
                <button type="button" className="cta" onClick={share}>
                  {copied ? 'Link copied' : 'Send to a colleague'}
                </button>
                <Link className="sl-ghost" to={{ pathname: '/contact' }} state={{ shortlist: viewing }}>
                  Attach to an enquiry
                </Link>
                {isReceived ? (
                  <button type="button" className="sl-ghost" onClick={() => { SL.adopt(received); setAdopted(true) }}>
                    Add these to my shortlist
                  </button>
                ) : (
                  <button type="button" className="sl-ghost sl-danger" onClick={() => { SL.clear() }}>
                    Clear the list
                  </button>
                )}
              </div>

              <ol className="sl-list">
                {rows.map(({ p, i }) => (
                  <li className="sl-row" key={i}>
                    <Link className="sl-v" to={'/projects/' + i}>
                      <img src={p.img} alt="" loading="lazy" />
                    </Link>
                    <div className="sl-tx">
                      <span className="pg-ref"><span>{p.loc}</span><span className="iso">{p.iso}</span></span>
                      <h3><Link to={'/projects/' + i}>{p.name}</Link></h3>
                      <span className="pg-cl">{p.client}</span>
                      <span className="pg-tags">
                        <span className="pg-tag b">{INDLBL[p.ind]}</span>
                        <span className="pg-tag">{TYPLBL[p.type]}</span>
                      </span>
                    </div>
                    {!isReceived && (
                      <button type="button" className="sl-x" onClick={() => SL.remove(i)}
                              aria-label={`Remove ${p.name} from the shortlist`}>&#10005;</button>
                    )}
                  </li>
                ))}
              </ol>

              <p className="pg-note">
                Published by scope and location only. Client names are withheld where the contract
                requires it.
              </p>
            </>
          )}
        </div>
      </section>

      <Related from="shortlist" />
      <Footer />
    </>
  )
}
