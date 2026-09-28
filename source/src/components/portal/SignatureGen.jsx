import React, { useEffect, useMemo, useRef, useState } from 'react'
import '../../styles/signature.css'

/* ============================================================================
   SignatureGen · 25 Sep 2026. Bazil: "create an email signature generator in the website", "portal".
   A member fills in their details, sees the signature at true size, and copies it into Outlook, Gmail or Apple Mail.

   What an inbox accepts decides the build: one table, inline styles, Arial (web fonts do not load in mail), a PNG logo
   at twice its display size (WebP and SVG fail in Outlook) served from an absolute address, and no divider rule (the
   house has no left lines). The company line is "IAQ Group": subsidiary entity names stay off anything sent outside
   (client, DV3 A2.1). Only offices with a published street address are offered; the rest of the seven are still
   "supplied by IAQ" on the Contact page, so a member there types their own address under Other.
   The form is remembered in this browser only.
   ============================================================================ */
const OFFICES = [
  { id: 'hq', label: 'Headquarters, Shah Alam', addr: 'No. 12, Jalan Sungai Jeluh 32/192, Kawasan Perindustrian Kemuning, Seksyen 32, 40460 Shah Alam, Selangor, Malaysia', tel: '+603 5124 8319' },
  { id: 'sg', label: 'Singapore', addr: '1 Tai Seng Avenue #04-03, Tai Seng Exchange, Singapore 536464', tel: '+65 6277 5240' },
  { id: 'de', label: 'Dresden, Germany', addr: '8. OG, Budapester Straße 5, 01069 Dresden, Germany', tel: '+49 351 4387 9529' },
  { id: 'in', label: 'Ahmedabad, India', addr: '906, Satymev Eminence, Science City Road, Sola, Ahmedabad 380060, India', tel: '' },
  { id: 'other', label: 'Other (type the address)', addr: '', tel: '' },
]
const KEY = 'iaq.signature.v1'
const DEF = {
  name: '', title: '', dept: '', email: '', mobile: '', office: 'hq', addr: OFFICES[0].addr, tel: OFFICES[0].tel,
  company: 'IAQ Group', site: 'www.iaqtechnology.com.my', tagline: true, certs: true, note: false,
  host: typeof location !== 'undefined' ? location.origin : '',
}
const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const telHref = s => 'tel:' + String(s || '').replace(/[^\d+]/g, '')

/* the signature itself, as an email client needs it */
function build (f) {
  const ink = '#0C1220', soft = '#48536A', faint = '#6B7588', red = '#EC2027'
  const font = 'font-family:Arial,Helvetica,sans-serif;'
  /* the cell carries the line height too, or the client's own (and the portal's) leading opens the lines up */
  const row = (html, pad = '0', lh = 18) => `<tr><td style="${font}padding:${pad};line-height:${lh}px;mso-line-height-rule:exactly;">${html}</td></tr>`
  const lines = []
  lines.push(row(`<img src="${esc(f.host.replace(/\/$/, ''))}/assets/email/iaq-signature-logo.png" width="100" height="42" alt="IAQ" style="display:block;border:0;outline:none;width:100px;height:42px;">`, '0 0 12px 0'))
  lines.push(row(`<span style="font-size:15px;line-height:20px;font-weight:bold;color:${ink};">${esc(f.name || 'Your name')}</span>`, '0', 20))
  lines.push(row(`<span style="font-size:13px;line-height:18px;color:${soft};">${esc(f.title || 'Job title')}${f.dept ? ' &middot; ' + esc(f.dept) : ''}</span>`))
  lines.push(row(`<span style="font-size:13px;line-height:18px;font-weight:bold;color:${ink};">${esc(f.company)}</span>`, '2px 0 0 0'))
  const bits = []
  if (f.mobile) bits.push(`<span style="color:${red};font-weight:bold;">M</span>&nbsp;<a href="${telHref(f.mobile)}" style="color:${ink};text-decoration:none;">${esc(f.mobile)}</a>`)
  if (f.tel) bits.push(`<span style="color:${red};font-weight:bold;">T</span>&nbsp;<a href="${telHref(f.tel)}" style="color:${ink};text-decoration:none;">${esc(f.tel)}</a>`)
  if (f.email) bits.push(`<span style="color:${red};font-weight:bold;">E</span>&nbsp;<a href="mailto:${esc(f.email)}" style="color:${ink};text-decoration:none;">${esc(f.email)}</a>`)
  if (bits.length) lines.push(row(`<span style="font-size:12.5px;line-height:19px;color:${soft};">${bits.join('&nbsp;&nbsp;&nbsp;')}</span>`, '10px 0 0 0'))
  if (f.addr) lines.push(row(`<span style="font-size:12px;line-height:17px;color:${faint};">${esc(f.addr)}</span>`, '2px 0 0 0', 17))
  if (f.site) lines.push(row(`<a href="https://${esc(f.site.replace(/^https?:\/\//, ''))}" style="font-size:12.5px;line-height:18px;font-weight:bold;color:${red};text-decoration:none;">${esc(f.site.replace(/^https?:\/\//, ''))}</a>`, '8px 0 0 0'))
  if (f.tagline) lines.push(row(`<span style="font-size:11.5px;line-height:16px;color:${faint};">Your Total Facility Solutions Provider</span>`, '2px 0 0 0'))
  if (f.certs) lines.push(row(`<span style="font-size:11px;line-height:16px;color:${faint};">ISO 9001 &middot; ISO 14001 &middot; ISO 45001 certified</span>`, '2px 0 0 0'))
  if (f.note) lines.push(row(`<span style="font-size:10.5px;line-height:15px;color:${faint};">This email and its attachments are confidential and meant for the addressee only. If it reached you by mistake, please tell the sender and delete it.</span>`, '12px 0 0 0'))
  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;${font}color:${ink};max-width:520px;">${lines.join('')}</table>`
}
function plain (f) {
  return [f.name, [f.title, f.dept].filter(Boolean).join(' · '), f.company,
    [f.mobile && 'M ' + f.mobile, f.tel && 'T ' + f.tel, f.email && 'E ' + f.email].filter(Boolean).join('   '),
    f.addr, f.site, f.tagline && 'Your Total Facility Solutions Provider'].filter(Boolean).join('\n')
}

export default function SignatureGen () {
  const [f, setF] = useState(() => { try { return { ...DEF, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return DEF } })
  const [done, setDone] = useState('')
  const prev = useRef(null)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(f)) } catch {} }, [f])
  const html = useMemo(() => build(f), [f])
  const set = k => e => { const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value; setF(o => ({ ...o, [k]: v })) }
  const pickOffice = e => { const o = OFFICES.find(x => x.id === e.target.value) || OFFICES[0]; setF(p => ({ ...p, office: o.id, addr: o.id === 'other' ? '' : o.addr, tel: o.tel })) }
  const flash = t => { setDone(t); clearTimeout(flash.t); flash.t = setTimeout(() => setDone(''), 2600) }
  const missing = ['name', 'title', 'email'].filter(k => !String(f[k] || '').trim())

  const copyRich = async () => {
    try {
      if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([plain(f)], { type: 'text/plain' }) })])
        return flash('Signature copied. Paste it into your mail app’s signature box.')
      }
    } catch {}
    /* older browsers: select the preview itself and copy the selection */
    try { const r = document.createRange(); r.selectNodeContents(prev.current); const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand('copy'); s.removeAllRanges(); flash('Signature copied.') } catch { flash('Copy failed. Select the preview and copy it by hand.') }
  }
  const copyHtml = async () => { try { await navigator.clipboard.writeText(html); flash('HTML copied.') } catch { flash('Copy failed.') } }
  const download = () => {
    const doc = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(f.name || 'IAQ')} signature</title></head><body>${html}</body></html>`
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([doc], { type: 'text/html' })); a.download = `iaq-signature-${(f.name || 'member').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.htm`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000)
  }

  return (
    <div className="sg">
      <form className="sg-form" onSubmit={e => e.preventDefault()} aria-label="Your details">
        <fieldset>
          <legend>You</legend>
          <label><span>Full name</span><input value={f.name} onChange={set('name')} autoComplete="name" placeholder="Nur Aisyah binti Rahman" /></label>
          <label><span>Job title</span><input value={f.title} onChange={set('title')} autoComplete="organization-title" placeholder="Senior Project Engineer" /></label>
          <label><span>Department <em>optional</em></span><input value={f.dept} onChange={set('dept')} placeholder="EPC" /></label>
        </fieldset>
        <fieldset>
          <legend>Reach you</legend>
          <label><span>Email</span><input type="email" value={f.email} onChange={set('email')} autoComplete="email" placeholder="name@iaqtechnology.com.my" /></label>
          <label><span>Mobile <em>optional</em></span><input type="tel" value={f.mobile} onChange={set('mobile')} autoComplete="tel" placeholder="+60 12 345 6789" /></label>
          <label><span>Office</span>
            <select value={f.office} onChange={pickOffice}>{OFFICES.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}</select>
          </label>
          <label><span>Office phone <em>optional</em></span><input type="tel" value={f.tel} onChange={set('tel')} /></label>
          <label className="sg-wide"><span>Address</span><textarea rows={3} value={f.addr} onChange={set('addr')} /></label>
        </fieldset>
        <fieldset>
          <legend>Lines</legend>
          <label className="sg-check"><input type="checkbox" checked={f.tagline} onChange={set('tagline')} /><span>Tagline, Your Total Facility Solutions Provider</span></label>
          <label className="sg-check"><input type="checkbox" checked={f.certs} onChange={set('certs')} /><span>ISO 9001, 14001 and 45001 line</span></label>
          <label className="sg-check"><input type="checkbox" checked={f.note} onChange={set('note')} /><span>Confidentiality note</span></label>
        </fieldset>
        <details className="sg-more">
          <summary>Company, website and image address</summary>
          <label><span>Company line</span><input value={f.company} onChange={set('company')} /></label>
          <label><span>Website</span><input value={f.site} onChange={set('site')} /></label>
          <label className="sg-wide"><span>Image address</span><input value={f.host} onChange={set('host')} />
            <small>The logo loads from this address in every inbox. Point it at the live site once it is published.</small></label>
        </details>
      </form>

      <div className="sg-out">
        <div className="sg-stage" aria-label="Preview">
          <div className="sg-mail"><span className="sg-mail-l">Kind regards,</span></div>
          <div ref={prev} className="sg-prev" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        {missing.length > 0 && <p className="sg-need">Still to fill in: {missing.map(k => ({ name: 'full name', title: 'job title', email: 'email' }[k])).join(', ')}.</p>}
        <div className="sg-acts">
          <button type="button" className="sg-go" onClick={copyRich}>Copy signature</button>
          <button type="button" onClick={copyHtml}>Copy HTML</button>
          <button type="button" onClick={download}>Download .htm</button>
        </div>
        <p className="sg-done" aria-live="polite">{done}</p>
        <ol className="sg-how">
          <li><b>Outlook</b><span>Settings, Mail, Compose and reply, Email signature. New signature, paste, save.</span></li>
          <li><b>Gmail</b><span>Settings, See all settings, General, Signature. Create new, paste, save at the bottom of the page.</span></li>
          <li><b>Apple Mail</b><span>Settings, Signatures. Add one, untick "Always match my default message font", paste.</span></li>
        </ol>
      </div>
    </div>
  )
}
