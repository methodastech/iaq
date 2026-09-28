import React, { useState } from 'react'
import { LAUNCH, owed } from '../lib/launch.js'
import { submit } from '../lib/enquiry.js'
import '../styles/gate.css'

/* ============================================================================
   GatedDownload: the capability statement, in exchange for an email.

   Procurement always asks for a document, so giving it in exchange for a work
   email turns an anonymous visit into a named lead. That is the whole trade,
   and it only works if it is honest about it.

   Two honesty rules this follows:
     - if the file is not supplied yet, the form does not appear at all. A gate
       in front of nothing collects emails for a document that cannot be sent.
     - if the enquiry pipeline has no endpoint, the visitor is told, and given
       the email address instead. It never shows a success panel for a request
       that went nowhere.

   props
     file   string  path to the asset. Absent, the labelled slot renders instead.
     title  string
     blurb  string
   ============================================================================ */

export default function GatedDownload({ file, title, blurb, example }) {
  /* 15 Sep: the public site shows the gate only once the file exists (lib/launch.js) */
  if (LAUNCH && !file) return null
  const [state, setState] = useState({ status: 'idle' })

  /* EXAMPLE state (2 Sep, Bazil: "create the UI/UX placeholder pictures and example info here"):
     the finished gate, laid out with example content and a placeholder document stack, so the
     client sees the design rather than an empty frame. The form is inert and the block says so;
     the honesty rules above still hold — nothing here collects an address for a file that does
     not exist. Drop `file` in and the real gate replaces it untouched. */
  if (!file && example) {
    return (
      <div className="gate gate-ex">
        {/* 9 Sep (Bazil: "make this more realistic and 3D, with visual and logo"). The mock was
            three flat white rectangles fanned by a degree or two, with a red bar where a logo
            should be and no picture anywhere: a diagram of a document rather than a document.

            It is a real object now. The cover sits in a perspective scene turned about 20 degrees,
            so the block has a visible page edge on the far side, an inner leaf behind the cover,
            and a contact shadow on the ground. The cover itself is laid out the way IAQ's own
            printed cover would be: a photograph of the work across the top, the IAQ mark under it,
            then the title, the contents line and the edition foot.

            The whole thing is CSS transforms on the real markup, not an image of a document, so
            the cover copy stays live text and the edition and page count can be corrected in one
            place when IAQ supplies the file. */}
        <div className="gate-doc" aria-hidden="true">
          <span className="gd-shadow" />
          <div className="gd-book">
            {/* the far side of the block: page edges, and the leaf behind the cover */}
            <span className="gd-pages" />
            <span className="gd-back" />
            <span className="gd-leaf" />
            <div className="gd-cover">
              <span className="gd-spine" />
              <span className="gd-vis">
                <img src="/assets/hero-campus.webp" alt="" loading="lazy" decoding="async" />
              </span>
              <span className="gd-body">
                <img className="gd-logo" src="/assets/iaq-logo.webp" alt="" loading="lazy" decoding="async" />
                <span className="gd-k">Capability statement</span>
                <b>Total Facility Solutions</b>
                <span className="gd-sub">Scope of services &middot; delivery models &middot; classifications delivered &middot; certifications</span>
                <span className="gd-foot"><i>2026 edition</i><i>PDF</i></span>
              </span>
              <span className="gd-gloss" />
            </div>
          </div>
        </div>
        <div className="gate-tx">
          <span className="pg-k">Download</span>
          <h3>{title || 'Capability statement & certification pack'}</h3>
          <p>{blurb || 'Scope of services, delivery models, classifications delivered and current certifications, as one PDF for your procurement file.'}</p>
          <ul className="gd-list">
            <li><b>What is inside</b><span>Company profile, the six services, the three business units, delivered classes by market, project references by scope</span></li>
            <li><b>Certifications</b><span>ISO 9001 &middot; ISO 14001 &middot; ISO 45001 &middot; CIDB G7 &middot; ESH award record</span></li>
            <li><b>Format</b><span>One PDF &middot; about 24 pages &middot; under 10 MB &middot; sent to your work email</span></li>
          </ul>
          <span className="pg-slot-tag">Example content &middot; the file and the final page count are supplied by IAQ</span>
        </div>
        <form className="gate-form" onSubmit={e => e.preventDefault()} aria-label="Example request form, not yet active">
          <label htmlFor="gx-name">Name</label>
          <input id="gx-name" type="text" placeholder="Your name" disabled />
          <label htmlFor="gx-company">Company</label>
          <input id="gx-company" type="text" placeholder="Company" disabled />
          <label htmlFor="gx-email">Work email</label>
          <input id="gx-email" type="email" placeholder="name@company.com" disabled />
          <button className="cta" type="button" disabled>Get the pack</button>
          <p className="gate-note">Activates the moment IAQ supplies the document.</p>
        </form>
      </div>
    )
  }

  if (!file) {
    return (
      <div className="pg-slot">
        <div className="pg-slot-in">
          <span className="pg-slot-tag">Capability statement &amp; certification pack &middot; supplied by IAQ</span>
          <p>
            The gate is built and the enquiry routing behind it works. It stays hidden until IAQ
            supplies the document, because a form in front of a file that does not exist collects
            email addresses for something nobody can send.
          </p>
        </div>
      </div>
    )
  }

  async function onSubmit(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get('name') || '').trim()
    const email = String(f.get('email') || '').trim()
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setState({ status: 'invalid' }); return }
    setState({ status: 'sending' })
    const r = await submit({
      intent: 'project', source: 'capability-download',
      name, email, company: String(f.get('company') || '').trim(),
      message: 'Capability pack download requested.',
    })
    /* the file is released either way: withholding a public document because our own logging
       failed punishes the visitor for our problem */
    setState({ status: r.delivered ? 'sent' : 'undelivered' })
  }

  return (
    <div className="gate">
      <div className="gate-tx">
        <span className="pg-k">Download</span>
        <h3>{title || 'Capability statement'}</h3>
        <p>{blurb || 'The capability statement and certification pack, as one PDF.'}</p>
      </div>

      {state.status === 'sent' || state.status === 'undelivered' ? (
        <div className="gate-done" role="status">
          <a className="cta" href={file} download>Download the pack</a>
          <p>
            {state.status === 'sent'
              ? 'Thank you. A copy of your request has reached the business development team.'
              : 'The download is ready. Your details stayed on this page: enquiry routing goes live the moment the endpoint is connected.'}
          </p>
        </div>
      ) : (
        <form className="gate-form" onSubmit={onSubmit} noValidate>
          <label htmlFor="gate-name">Name</label>
          <input id="gate-name" name="name" type="text" autoComplete="name" required />
          <label htmlFor="gate-company">Company</label>
          <input id="gate-company" name="company" type="text" autoComplete="organization" />
          <label htmlFor="gate-email">Work email</label>
          <input id="gate-email" name="email" type="email" autoComplete="email" required />
          {state.status === 'invalid' && <p className="gate-err" role="alert">A name and a valid work email are needed.</p>}
          <button className="cta" type="submit" disabled={state.status === 'sending'}>
            {state.status === 'sending' ? 'Sending' : 'Get the pack'}
          </button>
        </form>
      )}
    </div>
  )
}
