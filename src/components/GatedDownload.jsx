import React, { useState } from 'react'
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

export default function GatedDownload({ file, title, blurb }) {
  const [state, setState] = useState({ status: 'idle' })

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
              : 'The download is ready. Your details were not logged: this concept build has no enquiry endpoint configured yet.'}
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
