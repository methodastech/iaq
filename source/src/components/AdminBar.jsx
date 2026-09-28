import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/* The Brand Method super admin bar: developer navigation for the client
   review. WORKSPACE ONLY, compiled away in a client build.

   9 Sep 2026 (Bazil: "a super admin tab must be consistent at the super admin
   or any website"): this is the same bar as every other Brand Method build.
   The CSS below is byte-identical to public/bmws.css and to
   tenthpin/assets/bmws.css and tenthpin/react-app/src/shared/WorkspaceBar.jsx.
   Change every copy together or the bar drifts, which is exactly what it did
   before this file existed: four IAQ pages ran three different bars. */

const GROUPS = [
  /* 25 Sep (Bazil: "create a tab here the videos and photos shared by our client"): everything IAQ has shared, stored at
     Client info/IAQ outside the repo and served on dev only (tools/vite-client-files.mjs) */
  /* 28 Sep ("need the super admin. but the Amendments hide"): the Netlify review build (MODE review) leaves the
     Amendments tab out; the dev server keeps it */
  [['00', 'Web Audit', '/audit.html'], ['01', 'Competitors', '/competitors.html'], ['02', 'Web Plan', '/plan.html'],
   ...(import.meta.env.MODE === 'review' ? [] : [['03', 'Amendments', '/checklist.html']]), ['10', 'Client files', '/client-files.html']],
  [['04', 'Design', '/design.html']],
  /* 9 Sep: the labels were long enough that the strip overflowed and tabs 06 to 08 scrolled off
     the end, so the LIVE build looked missing. The dim state already says superseded; the word
     was costing 140px to repeat it. */
  [['05', 'Web 1', '/web1/index.html', 'rej'], ['06', 'Web 2', '/home2', 'rej'], ['07', 'Web 3 \u00b7 live', '/#/'], ['08', 'CMS', '/portal/newsroom?admin'],
   /* 18 Sep (Bazil, looking for it in this bar: "wheres the codex page"): the Codex is a member page at /codex;
      opened from the super admin bar it lets the admin straight in (?admin grants the session, review builds only) */
   ['09', 'Codex', '/portal/codex?admin']],
]

const CSS = `
/* The super admin bar, one look on every Brand Method surface. Linked, never
   inlined: the moment a page keeps its own copy the bar drifts, which is how
   Baik Khayr ended up with a 10px light bar while every other build ran a
   13px dark one. Positioning (fixed or sticky) stays with each page.

   20 Sep 2026, modern minimalist pass: the tab group lost its container and
   its 00/01/02 numerals. 21 Sep: monochrome and sharp. No numerals, no accent colour, no radius,
   no underlines or rules. The current page is a white block with ink text. Sentence-case
   Instrument Sans on the tabs, mono for the numerals and the context label. */

.bmws{background:#0A0B0E;color:#F2F2F3;line-height:1.6}
.bmws-in{display:flex;align-items:center;justify-content:space-between;padding:12px 24px;max-width:none;margin:0;gap:24px;flex-wrap:nowrap}

/* left: the build on line one, whose bar this is on line two */
.bmws-crumb{display:flex;flex-direction:column;gap:2px;line-height:1.2;white-space:nowrap;min-width:0;overflow:hidden}
.bmws-crumb b{font-family:"Geist","Instrument Sans",Inter,system-ui,sans-serif;font-size:15px;font-weight:600;color:#fff;letter-spacing:-.012em;overflow:hidden;text-overflow:ellipsis}
.bmws-crumb span{font-family:"Geist","Geist","Instrument Sans",Inter,system-ui,sans-serif;font-size:11px;font-weight:500;letter-spacing:0;text-transform:none;color:#7C7F88;overflow:hidden;text-overflow:ellipsis}

/* right: numbered tabs. The page you are on is a filled block. No underlines, no rules, no borders. */
.bmws-tabs{display:flex;align-items:center;gap:2px;border:0;background:none;padding:0;margin-left:auto;min-width:0;flex:0 1 auto;overflow:auto;scrollbar-width:none}
.bmws-tabs::-webkit-scrollbar{height:0}
.bmws-tabs a{font-family:"Geist","Instrument Sans",Inter,system-ui,sans-serif;font-size:13.5px;font-weight:500;letter-spacing:-.005em;color:#8C8F98;text-decoration:none;padding:8px 14px;border-radius:0;white-space:nowrap;display:inline-flex;align-items:baseline;gap:8px;transition:color .2s,background .2s}
.bmws-tabs a i{display:none}
.bmws-tabs a:hover{background:rgba(255,255,255,.08);color:#fff}
.bmws-tabs a.on{background:#fff;color:#0A0C12;font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,.4)}
.bmws-tabs a.rej{color:#55585F}
.bmws-tabs a.rej:hover{color:#80838B}
.bmws-tabs a.rej.on{background:rgba(255,255,255,.14);color:#B4B6BC}
.bmws-tabs a em{font-style:normal;font-family:"Geist","Geist","Instrument Sans",Inter,system-ui,sans-serif;font-size:9px;letter-spacing:.06em;padding:2px 6px;border-radius:0;background:rgba(255,255,255,.08);color:#8C8F98;line-height:1.3}

@media (max-width:1120px){
  .bmws-crumb{max-width:230px}
  .bmws-crumb b{font-size:13.5px}
  .bmws-tabs a{font-size:12.5px;padding:7px 9px;gap:6px}
  .bmws-in{padding:9px 14px;gap:16px}
}
@media (max-width:820px){.bmws-crumb span{display:none}}
@media (max-width:640px){.bmws-crumb{display:none}}
@media print{.bmws{display:none}}

`

export default function AdminBar() {
  const on = import.meta.env.MODE !== 'client'
  const barRef = useRef(null)
  const { pathname } = useLocation()

  /* which tab reads as current. HashRouter puts the route in the hash, so
     every prototype-3 route except /home2 and /portal is "Prototype Web 3". */
  const isHome2 = pathname === '/home2'
  const isPortal = pathname.startsWith('/portal')
  const isCodex = pathname.startsWith('/codex') || pathname.startsWith('/portal/codex') || pathname === '/portal' || pathname === '/portal/'
  const current = isHome2 ? '06' : isCodex ? '09' : isPortal ? '08' : '07'

  useEffect(() => {
    if (!on) return
    /* The bar is fixed, so the page gets a matching top offset and anything
       else pinned to top:0 (the site's own nav) is pushed below it. */
    function tbv() {
      const bar = barRef.current; if (!bar) return
      const zf = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--zoomf')) || 1
      const v = getComputedStyle(bar).position === 'fixed' ? bar.getBoundingClientRect().height : Math.max(0, bar.getBoundingClientRect().bottom)
      const px = Math.round(v / zf) + 'px'
      if (document.documentElement.style.getPropertyValue('--tbv') !== px) document.documentElement.style.setProperty('--tbv', px)
    }
    let tbvRaf = 0
    const onScrollTbv = () => { if (!tbvRaf) tbvRaf = requestAnimationFrame(() => { tbvRaf = 0; tbv() }) }
    function fit() {
      const bar = barRef.current
      if (!bar) return
      /* offsetHeight, NOT the bounding rect: :root carries a CSS zoom, so the rect is in painted
         pixels while paddingTop and top are read as CSS pixels INSIDE that zoom and get scaled
         again. Using the rect left an 8px strip of page showing between the bar and the nav. */
      /* the bar undoes the page zoom, so its height is converted into the page's zoomed CSS pixels */
      const zf = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--zoomf')) || 1
      const h = Math.round(bar.getBoundingClientRect().height / zf) || 46
      /* 24 Sep (Bazil: "you haven't fixed the navigation bar, scroll down"): the bar sits in normal flow and
         scrolls away with the page, so the nav must stick at 0, not at the bar's height. Body padding and the
         push below are only for a bar that is fixed, which this one is not. */
      const fixed = getComputedStyle(bar).position === 'fixed'
      document.body.style.paddingTop = fixed ? h + 'px' : ''
      /* --tbh is the height of the workspace bar, and .hero (100svh - tbh) and .fab read it.
         Nav used to publish it from its own .topbar; that bar is gone, so it comes from here. */
      document.documentElement.style.setProperty('--tbh', h + 'px')
      /* 25 Sep (Bazil, Services: "what's wrong with the navigation bar here"): the bar is in normal flow and scrolls
         away, but everything pinned (the Services section bar, sticky stages) was reserving the full --tbh, so a
         62px band of page showed between the nav and the pinned bar. --tbv is the part of the bar still on screen,
         in the page's zoomed CSS pixels: pinned elements read --tbv, and --tbh stays for layout (the hero's height). */
      tbv()
      /* 23 Sep (Bazil: "fix the header"): the nav sat 188px down the page. The bar had wrapped to three
         lines in a narrow pane, this wrote top:188px on the nav, and every later fit skipped it because
         its top was no longer 0px. Elements pushed once are remembered and re-fitted every time, and
         released when the bar goes. */
      document.querySelectorAll('body *').forEach((el) => {
        if (el.closest('.bmws')) return
        const cs = getComputedStyle(el)
        const pushed = el.dataset.bmwsPushed === '1'
        if (pushed || ((cs.position === 'fixed' || cs.position === 'sticky') && cs.top === '0px')) {
          const r = el.getBoundingClientRect()
          if (pushed || (r.height > 0 && r.height < 190)) { el.dataset.bmwsPushed = '1'; el.style.top = fixed ? h + 'px' : '' }
        }
      })
    }
    const release = () => document.querySelectorAll('[data-bmws-pushed]').forEach((el) => { el.style.top = ''; delete el.dataset.bmwsPushed })
    fit()
    window.addEventListener('load', fit)
    window.addEventListener('resize', fit)
    window.addEventListener('scroll', onScrollTbv, { passive: true })
    const t1 = setTimeout(fit, 800)
    const t2 = setTimeout(fit, 2000)
    return () => {
      window.removeEventListener('load', fit)
      window.removeEventListener('resize', fit)
      window.removeEventListener('scroll', onScrollTbv)
      cancelAnimationFrame(tbvRaf)
      clearTimeout(t1)
      clearTimeout(t2)
      document.body.style.paddingTop = ''
      document.documentElement.style.removeProperty('--tbh')
      document.documentElement.style.removeProperty('--tbv')
      release()
    }
  }, [on, pathname])

  if (!on) return null
  return (
    <div className="bmws" style={{ ['--bmws-acc']: '#2536F5' }} ref={barRef}>
      <style>{CSS}</style>
      <div className="bmws-in">
        <div className="bmws-crumb"><b>IAQ Utility Solutions</b><span>Super Admin</span></div>
        <nav className="bmws-tabs" aria-label="Super admin developer navigation">
          {GROUPS.map((g, gi) => (
            <span className="bmws-g" key={gi}>
              {g.map(([n, label, href, rej]) => {
                const cls = [n === current ? 'on' : '', rej ? 'rej' : ''].filter(Boolean).join(' ') || undefined
                return (
                  <a href={href} className={cls} key={n} title={rej ? `${label}: superseded` : label}>
                    <i>{n}</i>{label}
                  </a>
                )
              })}
            </span>
          ))}
        </nav>
      </div>
    </div>
  )
}
