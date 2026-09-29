import React, { useEffect, useMemo, useRef, useState } from 'react'
import '../../styles/signature.css'

/* ============================================================================
   SignatureGen · 25 Sep 2026. Bazil: "create an email signature generator in the website", "portal".
   A member fills in their details, sees the signature at true size, and copies it into Outlook, Gmail or Apple Mail.

   What an inbox accepts decides the build: one table, inline styles, the house faces that Microsoft 365 and Windows
   already carry (web fonts do not load in mail; see build), PNG and JPG
   images at twice their display size (WebP and SVG fail in Outlook) served from an absolute address, and colour blocks
   as table cells with bgcolor (Outlook ignores CSS backgrounds). Only offices with a published street address are
   offered; the rest of the seven are still "supplied by IAQ" on the Contact page, so a member there types their own
   address under Other. The form is remembered in this browser only.

   29 Sep 2026 ("use that design on email signature portal", with the house signature as the reference): the layout is
   the reference's. Name, title and the legal entity on the left, the logo and tagline on the right, a red rule; Mobile,
   Email, Office and Web in two columns with red labels; the address; the red "Engineered environments. Trusted outcomes."
   block beside the cleanroom photograph (assets/email/sig-cleanroom.jpg, cut from assets/contact-cleanroom.webp); the
   Intertek and UKAS marks with the ISO line; and the entity's name and registration number with the confidentiality
   line. The company line was "IAQ Group" until now (entity names off anything sent outside, client DV3 A2.1); the
   reference signs with the member's legal entity and its registration number, so the entity is chosen here, with
   IAQ Group still one of the choices. 640px wide: the reference's proportions, inside what mail clients lay out without scaling.
   ============================================================================ */
const OFFICES = [
  { id: 'hq', label: 'Headquarters, Shah Alam', addr: 'No. 12, Jalan Sungai Jeluh 32/192, Kawasan Perindustrian Kemuning, Seksyen 32, 40460 Shah Alam, Selangor, Malaysia', tel: '+603 5124 8319' },
  { id: 'sg', label: 'Singapore', addr: '1 Tai Seng Avenue #04-03, Tai Seng Exchange, Singapore 536464', tel: '+65 6277 5240' },
  { id: 'de', label: 'Dresden, Germany', addr: '8. OG, Budapester Straße 5, 01069 Dresden, Germany', tel: '+49 351 4387 9529' },
  { id: 'in', label: 'Ahmedabad, India', addr: '906, Satymev Eminence, Science City Road, Sola, Ahmedabad 380060, India', tel: '' },
  { id: 'other', label: 'Other (type the address)', addr: '', tel: '' },
]
/* the legal entity a member signs for, with its registration number (SSM, new and old format). IAQ Solutions is the
   reference signature's; IAQ Technology International is the one the site's footer carries. */
const ENTITIES = [
  { id: 'solutions', name: 'IAQ Solutions Sdn. Bhd.', reg: '200501013167 (690214-V)' },
  { id: 'technology', name: 'IAQ Technology International Sdn. Bhd.', reg: '200001031412 (534019-T)' },
  { id: 'group', name: 'IAQ Group', reg: '' },
  { id: 'other', name: '', reg: '' },
]
const SIG_W = 640   /* the signature's width in the inbox */
const SLOGAN = ['Engineered environments.', 'Trusted outcomes.']
/* the four registrations and recognitions the site's footer carries (assets/certs), as PNGs in assets/email: file,
   width at 40px high, alt */
const CERTS = [
  ['sig-cidb.png', 66, 'CIDB registered contractor'],
  ['sig-intertek.png', 32, 'Intertek ISO 9001, 14001 and 45001 certification'],
  ['sig-ukas.png', 29, 'UKAS management systems accreditation'],
  ['sig-highwire.png', 32, 'Highwire Safety Gold 2024'],
]
const NOTE = 'The information in this e-mail is confidential and may be legally privileged. It is solely for the use of the intended recipient(s).'
/* v2 with the 29 Sep layout: the entity and the new lines start at their defaults, the member's own details carry over */
const KEY = 'iaq.signature.v2', OLD = 'iaq.signature.v1'
const MINE = ['name', 'title', 'dept', 'email', 'mobile', 'office', 'addr', 'tel', 'host']
const DEF = {
  name: '', title: '', dept: '', email: '', mobile: '', office: 'hq', addr: OFFICES[0].addr, tel: OFFICES[0].tel,
  entity: 'solutions', company: ENTITIES[0].name, reg: ENTITIES[0].reg, site: 'iaqtechnology.com.my',
  tagline: true, banner: true, certs: true, note: true,
  host: typeof location !== 'undefined' ? location.origin : '',
}
function load () {
  try {
    const v2 = localStorage.getItem(KEY)
    if (v2) return { ...DEF, ...JSON.parse(v2) }
    const v1 = JSON.parse(localStorage.getItem(OLD) || '{}')
    return { ...DEF, ...Object.fromEntries(MINE.filter(k => v1[k] !== undefined).map(k => [k, v1[k]])) }
  } catch { return DEF }
}
const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const telHref = s => 'tel:' + String(s || '').replace(/[^\d+]/g, '')
const bare = s => String(s || '').replace(/^https?:\/\//, '').replace(/\/$/, '')

/* the signature itself, as an email client needs it */
function build (f) {
  const ink = '#0C1220', soft = '#48536A', faint = '#6B7588', red = '#EC2027'
  /* 29 Sep ("email signature need to use this font", Brand OS v4.1): the house faces, all three in Microsoft 365 and
     Windows with no install, so Outlook shows them: Aptos Display for the name and the slogan, Aptos for the text,
     Bahnschrift for the labels and the registration line. Each stack falls back to Segoe UI, then Arial, where they
     are not on the reader's machine. */
  const font = "font-family:Aptos,'Segoe UI',Arial,Helvetica,sans-serif;"
  const display = "font-family:'Aptos Display',Aptos,'Segoe UI',Arial,Helvetica,sans-serif;"
  const spec = "font-family:Bahnschrift,'Segoe UI',Arial,Helvetica,sans-serif;"
  const img = n => esc(f.host.replace(/\/$/, '')) + '/assets/email/' + n
  const W = SIG_W
  /* every cell carries its own line height, or the client's leading (and the portal's) opens the lines up */
  const td = (style, html, attrs = '') => `<td ${attrs}style="${font}mso-line-height-rule:exactly;${style}">${html}</td>`
  const table = (inner, attrs = '', style = '') => `<table cellpadding="0" cellspacing="0" border="0" role="presentation" ${attrs}style="border-collapse:collapse;${style}">${inner}</table>`
  const rows = []

  /* 1 · who, and the logo; the red rule under both */
  const who = [
    `<div style="${display}font-size:21px;line-height:26px;font-weight:bold;color:${ink};">${esc(f.name || 'Your name')}</div>`,
    `<div style="font-size:14px;line-height:20px;color:${soft};padding-top:2px;">${esc(f.title || 'Job title')}${f.dept ? ' &middot; ' + esc(f.dept) : ''}</div>`,
    f.company ? `<div style="font-size:13px;line-height:18px;font-weight:bold;color:${ink};padding-top:6px;">${esc(f.company)}</div>` : '',
  ].join('')
  const logo = `<img src="${img('iaq-signature-logo.png')}" width="120" height="50" alt="IAQ" style="display:block;border:0;outline:none;width:120px;height:50px;margin-left:auto;">`
    + (f.tagline ? `<div style="font-size:9.5px;line-height:13px;color:${ink};padding-top:3px;text-align:right;white-space:nowrap;">Your Total Facility Solutions Provider</div>` : '')
  rows.push(td(`padding:0 0 14px 0;border-bottom:2px solid ${red};`,
    table(`<tr>${td('vertical-align:top;line-height:18px;', who, 'valign="top" ')}${td('vertical-align:top;text-align:right;line-height:13px;', logo, 'valign="top" align="right" width="190" ')}</tr>`, `width="${W}" `, `width:${W}px;`)))

  /* 2 · reach: Mobile and Email on the left, Office and Web on the right, each label in red */
  /* two equal halves, so Office and Web start at the middle whatever the length of the email address */
  const LBL = 62, VAL = W / 2 - LBL
  const pair = (k, v) => k ? td(`${spec}font-size:12.5px;line-height:22px;font-weight:bold;color:${red};white-space:nowrap;`, k, `width="${LBL}" `) + td(`font-size:13px;line-height:22px;color:${ink};padding-right:12px;`, v, `width="${VAL}" `)
    : td('', '', `width="${LBL}" `) + td('', '', `width="${VAL}" `)
  const left = [f.mobile && ['Mobile', `<a href="${telHref(f.mobile)}" style="color:${ink};text-decoration:none;">${esc(f.mobile)}</a>`],
    f.email && ['Email', `<a href="mailto:${esc(f.email)}" style="color:${ink};text-decoration:none;">${esc(f.email)}</a>`]].filter(Boolean)
  const right = [f.tel && ['Office', `<a href="${telHref(f.tel)}" style="color:${ink};text-decoration:none;">${esc(f.tel)}</a>`],
    f.site && ['Web', `<a href="https://${esc(bare(f.site))}" style="color:${ink};text-decoration:none;">${esc(bare(f.site))}</a>`]].filter(Boolean)
  const n = Math.max(left.length, right.length)
  if (n) {
    let grid = ''
    for (let i = 0; i < n; i++) grid += `<tr>${pair(...(left[i] || []))}${pair(...(right[i] || []))}</tr>`
    rows.push(td('padding:14px 0 0 0;', table(grid, `width="${W}" `, `width:${W}px;`)))
  }
  if (f.addr) rows.push(td(`padding:8px 0 0 0;font-size:12.5px;line-height:18px;color:${soft};`, esc(f.addr)))

  /* 3 · the red block and the cleanroom, the same height side by side */
  if (f.banner) {
    const half = (W - 10) / 2
    rows.push(td('padding:18px 0 0 0;', table(`<tr>`
      + td(`${display}background-color:${red};padding:0 26px;height:90px;font-size:17px;line-height:22px;font-weight:bold;color:#ffffff;vertical-align:middle;`, SLOGAN.map(esc).join('<br>'), `width="${half}" height="90" bgcolor="${red}" valign="middle" `)
      + td('font-size:0;line-height:0;', '&nbsp;', 'width="10" ')
      + td('font-size:0;line-height:0;', `<img src="${img('sig-cleanroom.jpg')}" width="${half}" height="90" alt="A cleanroom IAQ builds" style="display:block;border:0;outline:none;width:${half}px;height:90px;">`, `width="${half}" `)
      + `</tr>`, `width="${W}" `, `width:${W}px;`)))
  }

  /* 4 · the certification marks, the footer's four in the footer's order (29 Sep: "four these logo"), one height. The
     ISO line that followed them is gone (29 Sep: "remove ISO 9001 · ISO 14001 · ISO 45001"); the Intertek mark carries
     the three standards itself. */
  if (f.certs) {
    const mark = ([file, w, alt]) => td('vertical-align:middle;padding-right:16px;', `<img src="${img(file)}" width="${w}" height="40" alt="${alt}" style="display:block;border:0;width:${w}px;height:40px;">`, 'valign="middle" ')
    rows.push(td('padding:16px 0 0 0;', table(`<tr>${CERTS.map(mark).join('')}</tr>`)))
  }

  /* 5 · the entity and its registration, then the confidentiality line */
  const legal = f.company ? `<b style="${spec}color:${soft};">${esc(f.company)}${f.reg ? ' &middot; ' + esc(f.reg) : ''}.</b>` : ''
  if (legal || f.note) rows.push(td(`padding:16px 0 0 0;font-size:11.5px;line-height:17px;color:${faint};`, [legal, f.note ? esc(NOTE) : ''].filter(Boolean).join(' ')))

  return table(rows.map(r => `<tr>${r}</tr>`).join(''), `width="${W}" `, `${font}color:${ink};width:${W}px;`)
}
function plain (f) {
  return [f.name, [f.title, f.dept].filter(Boolean).join(' · '), f.company, '',
    f.mobile && 'Mobile  ' + f.mobile, f.email && 'Email   ' + f.email, f.tel && 'Office  ' + f.tel, f.site && 'Web     ' + bare(f.site),
    f.addr, '', f.banner && SLOGAN.join(' '),
    [f.company && f.company + (f.reg ? ' · ' + f.reg : '') + '.', f.note && NOTE].filter(Boolean).join(' ')].filter(v => v !== false && v !== undefined && v !== null).join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

export default function SignatureGen () {
  const [f, setF] = useState(load)
  const [done, setDone] = useState('')
  const prev = useRef(null)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(f)) } catch {} }, [f])
  const html = useMemo(() => build(f), [f])
  /* the preview shows the whole signature: narrower than the signature, the panel scales it down to fit (the preview
     only; what is copied keeps its true size). The panel and the signature share the page's zoom, so the widths compare
     directly. */
  useEffect(() => {
    const el = prev.current; if (!el) return
    const box = el.parentElement
    const fit = () => {
      const cs = getComputedStyle(box)
      const w = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      el.style.zoom = w > 0 && w < SIG_W ? String(w / SIG_W) : ''
    }
    const ro = new ResizeObserver(fit); ro.observe(box); fit()
    return () => ro.disconnect()
  }, [])
  const set = k => e => { const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value; setF(o => ({ ...o, [k]: v })) }
  const pickOffice = e => { const o = OFFICES.find(x => x.id === e.target.value) || OFFICES[0]; setF(p => ({ ...p, office: o.id, addr: o.id === 'other' ? '' : o.addr, tel: o.tel })) }
  const pickEntity = e => { const x = ENTITIES.find(y => y.id === e.target.value) || ENTITIES[0]; setF(p => ({ ...p, entity: x.id, company: x.name, reg: x.reg })) }
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
          <label><span>Company</span>
            <select value={f.entity} onChange={pickEntity}>{ENTITIES.map(x => <option key={x.id} value={x.id}>{x.id === 'other' ? 'Other (type it below)' : x.name}</option>)}</select>
          </label>
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
          <label className="sg-check"><input type="checkbox" checked={f.tagline} onChange={set('tagline')} /><span>Tagline under the logo, Your Total Facility Solutions Provider</span></label>
          <label className="sg-check"><input type="checkbox" checked={f.banner} onChange={set('banner')} /><span>Banner, Engineered environments. Trusted outcomes.</span></label>
          <label className="sg-check"><input type="checkbox" checked={f.certs} onChange={set('certs')} /><span>Certification marks, CIDB, Intertek, UKAS and Highwire</span></label>
          <label className="sg-check"><input type="checkbox" checked={f.note} onChange={set('note')} /><span>Confidentiality note</span></label>
        </fieldset>
        <details className="sg-more">
          <summary>Company name, registration, website and image address</summary>
          <label><span>Company name</span><input value={f.company} onChange={set('company')} /></label>
          <label><span>Registration no. <em>optional</em></span><input value={f.reg} onChange={set('reg')} placeholder="200501013167 (690214-V)" /></label>
          <label><span>Website</span><input value={f.site} onChange={set('site')} /></label>
          <label className="sg-wide"><span>Image address</span><input value={f.host} onChange={set('host')} />
            <small>The logo, the photograph and the marks load from this address in every inbox. Point it at the live site once it is published.</small></label>
        </details>
      </form>

      <div className="sg-out">
        <div className="sg-stage" aria-label="Preview">
          <div className="sg-mail"><span className="sg-mail-l">Kind regards,</span></div>
          <div ref={prev} className="sg-prev" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        {missing.length > 0 && <p className="sg-need">Still to fill in: {missing.map(k => ({ name: 'full name', title: 'job title', email: 'email' }[k])).join(', ')}.</p>}
        {/localhost|127\.0\.0\.1|192\.168\./.test(f.host) && <p className="sg-need">The images load from {f.host}, which only this computer can reach: in anyone else’s inbox they will not show. Set the image address to the live site (Company name, registration, website and image address, below the form) before copying.</p>}
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
