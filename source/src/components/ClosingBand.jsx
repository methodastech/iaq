import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import FooterNav, { FooterBrand, FooterSocial } from './FooterNav.jsx'
import CloseAmbient from './CloseAmbient.jsx'
import Footer from './Footer.jsx'
import FooterB from './FooterB.jsx'
import '../styles/closing-band.css'

/* ============================================================================
   The closing band (rebuilt 21 Sep 2026).

   Bazil, on the band this replaces: "why is this static and can you improve the structure and
   interactivity and call to action, premium here", then "premium must be there however".

   What was wrong with it. The sitemap led, on the left, where the eye lands first, and the one thing
   the band exists for, the call to action, sat second, as a small button under a sentence. Nothing in
   it answered the visitor: the particles drift too slowly to read as motion, and every row did the
   same thing it would do in a plain footer.

   What it is now, top to bottom:
     1. THE ASK leads, full width. The headline stays the client's approved line. Under it the band
        asks the question back: what are you building? Four answers. The answer rewrites the button
        ("Plan the hook-up", "Size the saving") and travels to the contact form (router state, with
        sessionStorage behind it), which opens with that service already chosen. One decision, made here, saves one there.
     2. THE LEDGER sits beside it: email, phone, headquarters. Email has a second action, copy, which
        says so when it has. The rows are the 28 Aug open ledger, kept.
     3. THE SITEMAP follows, quieter, as the place to go when the answer was "not yet".
   The light in the band follows the pointer, so it is never still under a hand.

   One component for every page, as before (client 4 Sep: "footer should be consistent like homepage
   throughout other pages"). `note` is the prototype credit in the legal strip. `ask` lets a page
   keep its own headline (Careers asks for engineers, not projects) without forking the band.
   ============================================================================ */

const EMAIL = 'business@iaqtechnology.com.my'

/* 22 Sep: footer option B for comparison (components/FooterB.jsx). ?footer=b turns it on for the session, ?footer=a off. */
function footerVariant() {
  try {
    const q = new URLSearchParams(window.location.search).get('footer')
    if (q === 'a' || q === 'b') sessionStorage.setItem('iaq.footer', q)
    return sessionStorage.getItem('iaq.footer') === 'b' ? 'b' : 'a'
  } catch { return 'a' }
}

export default function ClosingBand({ note, ask }) {
  const [variant] = useState(footerVariant)
  const stage = useRef(null)

  /* the light follows the pointer: two custom properties, no state, no re-render */
  const onMove = e => {
    const el = stage.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%')
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%')
  }


  const B = variant === 'b'
  return (
    <>
    <section className={'close3d dark-band cb' + (B ? ' cb-b' : '')} id="contact">
      <div className="close-stage cb-stage" ref={stage} onPointerMove={onMove}>
        <span className="cb-light" aria-hidden="true" />
        {/* 22 Sep (Bazil: "iaq logo needs to be at top", of the ask "put to the right", of the contacts "put these 2 to the
            right", of the links "push this to the top"): left = the brand, then the link columns and Follow; right = the ask,
            then the contact ledger */}
        <div className="wrap cb-in cb-in2">
          <div className="cb-left">
            {!B && <div className="f-nav cb-brand"><FooterBrand /><FooterSocial /></div>}
            {!B && <div className="cb-nav"><FooterNav brand={false} social={false} /></div>}
            {B && <div className="cb-ledger">
              {/* 22 Sep (Bazil: "no need copy button"): the email is a plain row */}
              <a className="crow" href={'mailto:' + EMAIL}><span className="ref">Email</span><b>{EMAIL}</b><i aria-hidden="true">&#8594;</i></a>
              <a className="crow" href="tel:+60351248319"><span className="ref">Phone</span><b>+603 5124 8319</b><i aria-hidden="true">&#8594;</i></a>
              <Link className="crow" to="/global-presence"><span className="ref">HQ &middot; Shah Alam</span><b className="adr">No.12, Jalan Sungai Jeluh 32/192, Kawasan Perindustrian Kemuning, Seksyen 32, 40460 Shah Alam, Selangor</b><i aria-hidden="true">&#8594;</i></Link>
            </div>}
          </div>
          <div className="cb-right">
            <div className="cb-ask">
              <h2 className="close-h cb-h">{(ask && ask.title) || <>Tell us what you are <em>building.</em></>}</h2>
              <p className="lede cb-lede">{(ask && ask.lede) || 'Feasibility to handover, one accountable team. Response in a working day.'}</p>

              <div className="cb-go">
                {/* the answer travels as router state and, for a hard reload, in sessionStorage: the
                    page's own scroll restoration rewrites the URL, so a ?service= query did not
                    survive to the form */}
                {/* 22 Sep (Bazil, of the four choices above the button: "remove this"): one plain action, no service preset */}
                {/* 25 Sep (client: "Remove Design, procurement and construction under one contract."): the button stands alone */}
                <Link className="cb-cta" to="/contact"><span>Start a project</span><i aria-hidden="true">&#8594;</i></Link>
              </div>
            </div>
            {!B && <div className="cb-ledger">
              {/* 22 Sep (Bazil: "no need copy button"): the email is a plain row */}
              <a className="crow" href={'mailto:' + EMAIL}><span className="ref">Email</span><b>{EMAIL}</b><i aria-hidden="true">&#8594;</i></a>
              <a className="crow" href="tel:+60351248319"><span className="ref">Phone</span><b>+603 5124 8319</b><i aria-hidden="true">&#8594;</i></a>
              <Link className="crow" to="/global-presence"><span className="ref">HQ &middot; Shah Alam</span><b className="adr">No.12, Jalan Sungai Jeluh 32/192, Kawasan Perindustrian Kemuning, Seksyen 32, 40460 Shah Alam, Selangor</b><i aria-hidden="true">&#8594;</i></Link>
            </div>}
          </div>
        </div>

        <CloseAmbient />
      </div>
      {!B && <Footer note={note} nav={false} />}
    </section>
    {B && <FooterB />}
    {B && <Footer note={note} nav={false} />}
    </>
  )
}
