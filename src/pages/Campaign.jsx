import React, { useEffect, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { bySlug } from '../data/campaigns.js'
import { INDLBL } from '../data/projects.js'
import { cmsProjects, live } from '../lib/cms.js'
const PROJECTS = live(cmsProjects)
import { submit } from '../lib/enquiry.js'
import '../styles/campaign.css'

/* ============================================================================
   /lp/:campaign · standalone sales page.

   Deliberately NOT wrapped in Nav or Footer. A campaign page has one argument
   and one action; giving it the site navigation gives a paid visitor eleven
   other things to do instead of the one thing the click was bought for.

   The only ways off the page are the form, and one honest link to the full
   site for anyone who wants to check the company out before converting.
   ============================================================================ */

export default function Campaign() {
  const { campaign } = useParams()
  const c = bySlug(campaign)

  const [state, setState] = useState({ status: 'idle' })

  useEffect(() => {
    if (c) document.title = `IAQ Group · ${c.eyebrow}`
  }, [c])

  /* An unknown campaign slug must not render an empty sales page. Send it to the markets hub,
     which is the nearest thing to what the visitor was promised. */
  if (!c) return <Navigate to="/markets" replace />

  const proof = PROJECTS.map((p, i) => ({ p, i })).filter(({ p }) => c.proof(p)).slice(0, 3)

  async function onSubmit(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get('name') || '').trim()
    const email = String(f.get('email') || '').trim()
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setState({ status: 'invalid' }); return
    }
    setState({ status: 'sending' })
    const r = await submit({
      intent: 'project',
      source: 'campaign:' + c.slug,
      name, email,
      company: String(f.get('company') || '').trim(),
      message: `Capability pack requested from the ${c.eyebrow} campaign page.`,
    })
    setState({ status: r.delivered ? 'sent' : 'undelivered', owner: r.owner })
  }

  return (
    <main className="lp">
      <div className="lp-mark">
        <img src="/assets/iaq-logo.webp" alt="IAQ Group" />
        <span>Your Total Facility Solutions Provider</span>
      </div>

      <section className="lp-hero">
        <div className="lp-hero-tx">
          <span className="lp-k">{c.eyebrow}</span>
          <h1>{c.title}</h1>
          <p className="lp-lede">{c.lede}</p>
          <ul className="lp-pts">
            {c.points.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
          <a className="lp-jump cta" href="#lp-form">Request the capability pack</a>
        </div>
        <div className="lp-hero-fig">
          <img src={c.image} alt="" loading="eager" />
        </div>
      </section>

      <section className="lp-stats" aria-label="The record">
        {c.stat.map((s, i) => (
          <div className="lp-stat" key={i}><b>{s.v}</b><span>{s.k}</span></div>
        ))}
      </section>

      {proof.length > 0 && (
        <section className="lp-proof" aria-labelledby="lp-proof-h">
          <h2 id="lp-proof-h">Delivered, not proposed.</h2>
          <div className="lp-proof-g">
            {proof.map(({ p, i }) => (
              <article className="lp-pc" key={i}>
                <img src={p.img} alt="" loading="lazy" />
                <div>
                  <span className="lp-pc-k">{p.loc} · {p.iso}</span>
                  <h3>{p.name}</h3>
                  <span className="lp-pc-c">{INDLBL[p.ind]}</span>
                </div>
              </article>
            ))}
          </div>
          <p className="lp-note">
            Published by scope and location only. Client names are withheld where the contract
            requires it.
          </p>
        </section>
      )}

      <section className="lp-form-wrap" id="lp-form">
        <div className="lp-form-in">
          <h2>Request the capability pack</h2>
          <p>
            The capability statement and certification pack, sent to your inbox. One email, no
            follow-up sequence.
          </p>

          {state.status === 'sent' ? (
            <div className="lp-done" role="status">
              <b>Request received.</b>
              <p>{state.owner?.note}. The pack follows shortly.</p>
            </div>
          ) : state.status === 'undelivered' ? (
            <div className="lp-done warn" role="status">
              <b>This form is not connected yet.</b>
              <p>
                Nothing was sent, and we will not pretend otherwise. This is a concept build with no
                enquiry endpoint configured. Email{' '}
                <a href="mailto:info@iaqtechnology.com.my">info@iaqtechnology.com.my</a> and the pack
                will be sent by hand.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <label htmlFor="lp-name">Name</label>
              <input id="lp-name" name="name" type="text" autoComplete="name" required />
              <label htmlFor="lp-company">Company</label>
              <input id="lp-company" name="company" type="text" autoComplete="organization" />
              <label htmlFor="lp-email">Work email</label>
              <input id="lp-email" name="email" type="email" autoComplete="email" required />
              {state.status === 'invalid' && (
                <p className="lp-err" role="alert">A name and a valid work email are needed to send the pack.</p>
              )}
              <button className="cta" type="submit" disabled={state.status === 'sending'}>
                {state.status === 'sending' ? 'Sending' : 'Send me the pack'}
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="lp-foot">
        <span>IAQ Group · Total facility solutions since 1994</span>
        <span>
          <Link to={c.market}>The full {c.eyebrow.toLowerCase()} page</Link>
          <i aria-hidden="true">·</i>
          <Link to="/">iaqtechnology.com</Link>
        </span>
      </footer>
    </main>
  )
}
