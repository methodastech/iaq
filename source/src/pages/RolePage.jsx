import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import PageHead from '../components/PageHead.jsx'
import ClosingBand from '../components/ClosingBand.jsx'
import { ROLES, LOCS, DEPTS, HR_EMAIL, applyHref } from '../data/roles.js'
import { WHY_JOIN } from '../data/careersWhy.js'
import { submit } from '../lib/enquiry.js'
import { LAUNCH } from '../lib/launch.js'
import '../styles/pages.css'
import '../styles/role-page.css'

/* ============================================================================
   ONE PAGE PER VACANCY (17 Sep 2026).

   The client asked which way to take applications: "To include form to submit resume on the
   dropdown if possible or to have a dedicated page for each job posting? Might need your
   suggestion on which method is the most convenience for candidate to submit their job
   application."

   This is the answer, and the reasons it is the better of the two:
     · a vacancy has its own link, so HR can post it to LinkedIn or WhatsApp and it opens on the
       role rather than on a list the candidate then has to search,
     · it is a real page, so a search engine can index the job title and the description,
     · the form has room for the fields IAQ's current site asks for, including the CV upload,
       which does not fit inside an accordion row on a phone,
     · and the list stays fast: the dropdown keeps the summary and sends the candidate here.

   The description comes from the roles registry. HR fills `about`, `duties`, `reqs` and `type`
   and this page fills itself; until then it prints the same labelled slot the list prints, and
   never invents hiring criteria.

   THE UPLOAD IS NOT WIRED YET, and the page says so rather than pretending. A CV cannot ride a
   mailto, so the file field needs an endpoint (VITE_ENQUIRY_ENDPOINT, or whatever the host
   provides). Until then the form sends the candidate's details and asks for the CV by email in
   one click, with the role and reference already in the subject.
   ============================================================================ */

const slug = ref => String(ref).toLowerCase().replace(/[^a-z0-9]+/g, '-')
const label = (list, k) => (list.find(([id]) => id === k) || [, k])[1]

/* Until HR supplies the write-up there are two versions of the same truth. The review build gets
   the labelled slot, which names what is owed and who owes it. The public build gets a plain line
   that tells a candidate what to do, with no internal tagging on it: hiding the block entirely, the
   way the launch gate hides the other owed blocks, would leave a vacancy page with no description
   at all, which is worse than saying where the description is. */
function Slot() {
  if (LAUNCH) {
    return (
      <p className="rp-about">
        The full description for this role comes from IAQ HR. Write to{' '}
        <a href={`mailto:${HR_EMAIL}`}>{HR_EMAIL}</a> quoting the reference, or apply below and HR
        will send it with their reply.
      </p>
    )
  }
  return (
    <div className="rp-slot">
      <span className="rp-slot-tag">Role description &middot; supplied by IAQ HR</span>
      <p>
        This opening is real and current. Its duties and requirements have not been published yet,
        so nothing is stated here in IAQ&rsquo;s name. HR answers on the role directly at{' '}
        <a href={`mailto:${HR_EMAIL}`}>{HR_EMAIL}</a>.
      </p>
    </div>
  )
}

function Apply({ role }) {
  const [sent, setSent] = useState(null)
  const [busy, setBusy] = useState(false)

  const onSubmit = async e => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    const f = new FormData(e.currentTarget)
    const cv = f.get('cv')
    const payload = {
      intent: 'career',
      name: f.get('name'),
      email: f.get('email'),
      phone: f.get('phone'),
      message: [
        `Application for ${role.t} (${role.ref})`,
        `Nationality: ${f.get('nationality') || 'not given'}`,
        `Available to start: ${f.get('start') || 'not given'}`,
        cv && cv.name ? `CV: ${cv.name} (${Math.round(cv.size / 1024)} KB)` : 'CV: to follow by email',
        '',
        f.get('note') || '',
      ].join('\n'),
    }
    const res = await submit(payload)
    setSent(res)
    setBusy(false)
  }

  return (
    <div className="rp-apply" id="apply">
      <h2>Apply for this role</h2>
      <p className="rp-lede">
        Your details go to IAQ HR with the role and its reference already on them.
      </p>

      <form className="rp-form" onSubmit={onSubmit}>
        <label className="rp-f"><span>Name</span><input name="name" required autoComplete="name" /></label>
        <label className="rp-f"><span>Email</span><input name="email" type="email" required autoComplete="email" /></label>
        <label className="rp-f"><span>Phone</span><input name="phone" required autoComplete="tel" /></label>
        <label className="rp-f"><span>Nationality</span><input name="nationality" /></label>
        <label className="rp-f"><span>Available to start</span><input name="start" type="date" /></label>
        <label className="rp-f rp-f-file">
          <span>CV or resume <i>PDF or Word, up to 30MB</i></span>
          <input name="cv" type="file" accept=".pdf,.doc,.docx,application/pdf" />
        </label>
        <label className="rp-f rp-f-wide"><span>Anything else HR should know</span><textarea name="note" rows="3" /></label>
        <div className="rp-act">
          <button className="cta" type="submit" disabled={busy}>{busy ? 'Sending' : 'Send application'}</button>
          <a className="rp-alt" href={applyHref(role)}>or email HR directly</a>
        </div>
      </form>

      {sent && (
        <div className="rp-sent" role="status">
          {sent.delivered
            ? <p><b>Sent.</b> HR has your details for {role.t} ({role.ref}) and answers from {HR_EMAIL}.</p>
            : <p>
                <b>Nothing was sent yet.</b> This prototype has no application endpoint behind it, so
                the file cannot be delivered from the page.{' '}
                <a href={applyHref(role)}>Open the email to HR</a> and attach your CV: the role and
                reference are already in the subject.
              </p>}
        </div>
      )}
    </div>
  )
}

export default function RolePage() {
  const { ref } = useParams()
  const role = useMemo(() => ROLES.find(r => slug(r.ref) === String(ref).toLowerCase()), [ref])

  useEffect(() => {
    document.title = role
      ? `IAQ Group · ${role.t} · Careers · Brand Method`
      : 'IAQ Group · Role not found · Brand Method'
  }, [role])

  if (!role) {
    return (
      <>
        <Nav />
        <PageHead crumbs={[{ label: 'Careers', to: '/careers' }]}
          title={<>That role is <em>not open.</em></>}
          lede="It may have closed, or the link may be old. The current openings are on the careers page." />
        <section className="pg-sec"><div className="pg-in">
          <Link className="cta" to="/careers">See the open roles</Link>
        </div></section>
        <ClosingBand note="Careers concept · Brand Method" />
        <Footer />
      </>
    )
  }

  const has = v => Array.isArray(v) ? v.length > 0 : !!v
  const described = has(role.about) || has(role.duties) || has(role.reqs)

  return (
    <>
      <Nav />

      <PageHead crumbs={[{ label: 'Careers', to: '/careers' }]}
        title={<>{role.t}</>}
        lede={`${label(DEPTS, role.dept)} · ${label(LOCS, role.loc)} · reference ${role.ref}`}
      />

      <section className="pg-sec rp-body">
        <div className="pg-in rp-cols">
          <div className="rp-main">
            {described ? (
              <>
                {has(role.about) && <p className="rp-about">{role.about}</p>}
                {has(role.duties) && (
                  <>
                    <h2>What you will do</h2>
                    <ul className="pg-list">{role.duties.map(d => <li key={d}>{d}</li>)}</ul>
                  </>
                )}
                {has(role.reqs) && (
                  <>
                    <h2>What you bring</h2>
                    <ul className="pg-list">{role.reqs.map(d => <li key={d}>{d}</li>)}</ul>
                  </>
                )}
              </>
            ) : <Slot />}

            <h2 className="rp-why-h">Why join IAQ</h2>
            <div className="rp-why">
              {WHY_JOIN.map(w => (
                <div className="rp-why-c" key={w.t}>
                  <b>{w.t}</b>
                  <span>{w.d}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="rp-side">
            <dl className="rp-meta">
              <div><dt>Reference</dt><dd>{role.ref}</dd></div>
              <div><dt>Department</dt><dd>{label(DEPTS, role.dept)}</dd></div>
              <div><dt>Location</dt><dd>{label(LOCS, role.loc)}</dd></div>
              {role.type && <div><dt>Type</dt><dd>{role.type}</dd></div>}
            </dl>
            <a className="cta rp-side-cta" href="#apply">Apply for this role</a>
            <Link className="rp-back" to="/careers">All open roles</Link>
          </aside>
        </div>
      </section>

      <section className="pg-sec calm">
        <div className="pg-in"><Apply role={role} /></div>
      </section>

      <ClosingBand note="Careers concept · Brand Method" />
      <Footer />
    </>
  )
}
