import React, { lazy, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import applyMeta, { watchTitle } from './lib/meta.js'
import Shell from './components/Shell.jsx'
import AdminBar from './components/AdminBar.jsx'
import { PROJECTS } from './data/projects.js'
import { useParams } from 'react-router-dom'
import './styles/base.css'
import { LAUNCH } from './lib/launch.js'

const Home = lazy(() => import('./pages/Home.jsx'))
/* 10 Sep audit: /projects/999 used to render project 0 as if it existed. An id outside the
   registry is a missing page, and says so. */
/* 10 Sep audit: every page title ends in " · Brand Method" for the review build. The launch build
   strips it wherever a page sets it. Analytics load only when VITE_GA_ID is set at build time. */
/* 10 Sep audit: a keyboard user had to tab through the whole menu on every page. First in the
   document, before the review bar, so the first Tab reaches it. */
function SkipLink() {
  const skip = e => {
    e.preventDefault()
    const t = document.querySelector('main, [role="main"], h1')
    if (t) { if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1'); t.focus(); t.scrollIntoView({ block: 'start' }) }
  }
  return <a className="skip-link" href="#content" onClick={skip}>Skip to content</a>
}

function LaunchGuards() {
  useEffect(() => {
    const LAUNCH = import.meta.env.MODE === 'launch'
    const GA = import.meta.env.VITE_GA_ID
    let mo = null
    if (LAUNCH) {
      const fix = () => { if (/ · Brand Method$/.test(document.title)) document.title = document.title.replace(/ · Brand Method$/, '') }
      fix(); const t = document.querySelector('title'); if (t) { mo = new MutationObserver(fix); mo.observe(t, { childList: true, characterData: true, subtree: true }) }
    }
    if (GA && !window.dataLayer) {
      const sc = document.createElement('script'); sc.async = true; sc.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA; document.head.appendChild(sc)
      window.dataLayer = window.dataLayer || []; window.gtag = function () { window.dataLayer.push(arguments) }
      window.gtag('js', new Date()); window.gtag('config', GA, { send_page_view: false })
      const view = () => window.gtag('event', 'page_view', { page_location: location.href, page_title: document.title })
      view(); window.__gaView = view
    }
    return () => { if (mo) mo.disconnect() }
  }, [])
  return null
}

function RouteViews() {
  const { pathname } = useLocation()
  useEffect(() => { if (window.__gaView) setTimeout(window.__gaView, 50) }, [pathname])
  return null
}

function ProjectRoute() {
  const { id } = useParams(); const v = parseInt(id, 10)
  if (!(Number.isInteger(v) && v >= 0 && v < PROJECTS.length)) return <NotFound />
  return <ProjectDetail />
}
const Home2 = lazy(() => import('./pages/Home2.jsx'))
const About2 = lazy(() => import('./pages/About2.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const Projects = lazy(() => import('./pages/Projects.jsx'))
const FabLab = lazy(() => import('./pages/FabLab.jsx'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail.jsx'))
const Careers = lazy(() => import('./pages/Careers.jsx'))
/* 17 Sep (client asked which way applications should run): one page per vacancy, carrying the
   description and the application form. See pages/RolePage.jsx. */
const RolePage = lazy(() => import('./pages/RolePage.jsx'))
/* 14 Sep: the culture page, the lead-in to Careers (client: "make a culture page").
   18 Sep (Bazil: "just one page"): folded into Careers as its top section; the old address redirects below. */
const Contact = lazy(() => import('./pages/Contact.jsx'))
const Flow = lazy(() => import('./pages/Flow.jsx'))
const ServicesHub = lazy(() => import('./pages/ServicesHub.jsx'))
const ServicesAll = lazy(() => import('./pages/ServicesAll.jsx'))
const ServiceDesign = lazy(() => import('./pages/ServiceDesign.jsx'))
const ServiceProcurement = lazy(() => import('./pages/ServiceProcurement.jsx'))
const ServiceConstruction = lazy(() => import('./pages/ServiceConstruction.jsx'))
const ServiceCommissioning = lazy(() => import('./pages/ServiceCommissioning.jsx'))
const ServiceMaintenance = lazy(() => import('./pages/ServiceMaintenance.jsx'))
const MarketsHub = lazy(() => import('./pages/MarketsHub.jsx'))
const MarketSemiconductor = lazy(() => import('./pages/MarketSemiconductor.jsx'))
const MarketDataCentre = lazy(() => import('./pages/MarketDataCentre.jsx'))
const MarketEvBattery = lazy(() => import('./pages/MarketEvBattery.jsx'))
const MarketPhotovoltaics = lazy(() => import('./pages/MarketPhotovoltaics.jsx'))
const MarketDistrictCooling = lazy(() => import('./pages/MarketDistrictCooling.jsx'))
const MarketBioLifescience = lazy(() => import('./pages/MarketBioLifescience.jsx'))
const MarketFoodBeverage = lazy(() => import('./pages/MarketFoodBeverage.jsx'))
const History = lazy(() => import('./pages/History.jsx'))
const Commitment = lazy(() => import('./pages/Commitment.jsx'))
const Leadership = lazy(() => import('./pages/Leadership.jsx'))
const Esg = lazy(() => import('./pages/Esg.jsx'))
const GlobalPresence = lazy(() => import('./pages/GlobalPresence.jsx'))
const News = lazy(() => import('./pages/News.jsx'))
const Article = lazy(() => import('./pages/Article.jsx'))
const Investors = lazy(() => import('./pages/Investors.jsx'))
const Policies = lazy(() => import('./pages/Policies.jsx'))
const Exhibition = lazy(() => import('./pages/Exhibition.jsx'))
/* the three business units: what is being bought, alongside the six delivery stages above,
   which are how the work runs */
const CapEpc = lazy(() => import('./pages/CapEpc.jsx'))
const CapPcu = lazy(() => import('./pages/CapPcu.jsx'))
const CapTool = lazy(() => import('./pages/CapTool.jsx'))
const CapEnergy = lazy(() => import('./pages/CapEnergy.jsx'))
const Shortlist = lazy(() => import('./pages/Shortlist.jsx'))
const Campaign = lazy(() => import('./pages/Campaign.jsx'))
/* 18 Sep: `import.meta.env.MODE` is a literal at build time, so in the launch build this whole
   branch folds away and no portal or Codex chunk is emitted at all (LAUNCH alone is a runtime
   check, which kept the chunks in the bundle). */
const Portal = import.meta.env.MODE !== 'launch' ? lazy(() => import('./pages/Portal.jsx')) : () => null
/* 18 Sep (Bazil: "a special tab called Codex"): the member-area page that sets out how the IAQ
   business is structured, how a buyer reads it, and how the site presents it. Review builds only. */
const Codex = import.meta.env.MODE !== 'launch' ? lazy(() => import('./pages/Codex.jsx')) : () => null
const CodexSlidesView = import.meta.env.MODE !== 'launch' ? lazy(() => import('./pages/CodexSlidesView.jsx')) : () => null
const CodexSitePreview = import.meta.env.MODE !== 'launch' ? lazy(() => import('./pages/CodexSitePreview.jsx')) : () => null
/* 22 Sep: the booth screen for SEMICON Europa 2026, full screen and outside the portal shell, gated by the member session */
const BoothScreen = import.meta.env.MODE !== 'launch' ? lazy(() => import('./pages/BoothScreen.jsx')) : () => null
const Semicon = import.meta.env.MODE !== 'launch' ? lazy(() => import('./pages/Semicon.jsx')) : () => null
const BoothArt = import.meta.env.MODE !== 'launch' ? lazy(() => import('./pages/BoothArt.jsx')) : () => null
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

watchTitle()

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  /* 25 Sep (Bazil: "this should be in the same page", "make sure not laggy"): the portal's booth is one page whose
     views are sections; moving between them changes only the address, so the page must not jump to the top first.
     PortalBooth lands on the section itself */
  const prev = React.useRef(pathname)
  useEffect(() => {
    const was = prev.current; prev.current = pathname
    if (!hash && was.startsWith('/portal/booth') && pathname.startsWith('/portal/booth')) { applyMeta(pathname); return }
    /* description, canonical and og:* per route: they were written once in index.html and then
       never changed, so every route shared the homepage's description and every shared link
       previewed as the homepage */
    applyMeta(pathname)
    /* a section hash (the About dropdown separates the page into its sections, per the
       client) scrolls to that section once the route has painted; everything else starts
       from a true zero, jumped through Lenis so scroll-linked animations begin clean */
    if (hash) {
      /* the target section belongs to a lazy-loaded page, so poll until it exists
         (or give up quietly after ~2.5s) before scrolling to it */
      let tries = 0
      const t = setInterval(() => {
        const el = document.getElementById(hash.slice(1))
        if (el) {
          clearInterval(t)
          if (window.__lenis) window.__lenis.scrollTo(el, { offset: -70 })
          else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          /* 24 Sep (Bazil: "career should land here"; the Careers link landed 2,200px past the roles): the
             sections above the target change height for a second or two after the route paints (reveals,
             images, the momentum frames), so a jump measured at the start ends up in the wrong place. Hold
             the target in place for 1.8s, re-landing whenever it drifts, unless the visitor scrolls. */
          let user = false
          const stop = () => { user = true }
          for (const ev of ['wheel', 'touchstart', 'keydown']) window.addEventListener(ev, stop, { passive: true, once: true })
          const t0 = performance.now()
          const hold = () => {
            if (user) return
            const d = el.getBoundingClientRect().top - 70
            if (Math.abs(d) > 4 && performance.now() - t0 > 700) {
              if (window.__lenis) window.__lenis.scrollTo(el, { offset: -70, immediate: true, force: true })
              else window.scrollTo(0, window.scrollY + d)
            }
            if (performance.now() - t0 < 1800) requestAnimationFrame(hold)
          }
          requestAnimationFrame(hold)
        } else if (++tries > 20) clearInterval(t)
      }, 120)
      return () => clearInterval(t)
    }
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true, force: true })
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

/* survive Vite HMR of this entry module: reuse the root instead of re-creating it */
const container = document.getElementById('root')
/* 10 Sep audit (P01): the site moves from hash addresses to real paths so every page can be
   indexed and previewed. Old links of the form /#/about still work: the fragment becomes the path
   before the router mounts. In-page fragments (/projects#semiconductor) are untouched. */
/* 18 Sep: the super admin bar opens the Codex as /codex?admin. The session has to be granted HERE, before the
   router mounts: by the time the lazy Codex chunk runs its effects the address has already been tidied and the
   query is gone. Review builds only; the launch build has no member area. */
/* index.html turns a deep link into /?query#/path before this runs, so the path is read from either form */
if (import.meta.env.MODE !== 'launch' && /^(\/|\/#)\/?(codex|portal)/.test(location.pathname + location.hash) && /[?&]admin\b/.test(location.search)) {
  try { localStorage.setItem('iaq.cms.session.v1', '1') } catch (e) {}
}
if (/^#\/.+/.test(location.hash)) {
  /* 22 Sep: keep the query (the booth art page reads ?bleed, ?print, ?marks); only ?admin is tidied away */
  const q = new URLSearchParams(location.search); q.delete('admin')
  const h = location.hash.slice(1), qs = q.toString()
  const target = qs && !h.includes('?') ? h.replace(/(#|$)/, '?' + qs + '$1') : h
  try { history.replaceState(null, '', target) } catch (e) { location.replace(target) }
}

const root = container.__reactRoot || (container.__reactRoot = createRoot(container))
root.render(
  <BrowserRouter>
    <ScrollToTop />
    {/* 9 Sep. Two bars were stacked, so one had to go, and I removed the wrong one.
        This .bmws bar is the SHARED Brand Method workspace bar, byte-identical to the one on
        tenthpin and to public/bmws.css, and it is the only bar that carries tab 04 Design.
        The four static workspace pages (audit, competitors, plan, checklist) all link to it,
        so removing it left the app as the one place in the workspace without the Design tab.
        Nav's own .topbar was the older IAQ-only 8-tab copy and is the one now deleted.
        AdminBar publishes --tbh, which .hero and .fab read for their top offset. */}
    {/* 10 Sep: the review bar and the concept routes exist for the prototype workflow only. `npm run
        build:launch` builds with MODE=launch and leaves them out. */}
    <SkipLink />
    <LaunchGuards />
    <RouteViews />
    {import.meta.env.MODE !== 'launch' && <AdminBar />}
    <Shell>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          {import.meta.env.MODE !== 'launch' && <Route path="/home2" element={<Home2 />} />}
          {import.meta.env.MODE !== 'launch' && <Route path="/about2" element={<About2 />} />}
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectRoute />} />
          {import.meta.env.MODE !== 'launch' && <Route path="/fab" element={<FabLab />} />}
          <Route path="/careers" element={<Careers />} />
          <Route path="/careers/culture" element={<Navigate to="/careers#culture" replace />} />
          <Route path="/careers/role/:ref" element={<RolePage />} />
          <Route path="/contact" element={<Contact />} />
          {import.meta.env.MODE !== 'launch' && <Route path="/flow" element={<Flow />} />}
          <Route path="/services" element={<ServicesHub />} />
          {/* 25 Sep (IAQ: "merge all the description pages for each service into one"): one page; the five old addresses land on their stage */}
          <Route path="/services/all" element={<ServicesAll />} />
          <Route path="/services/design" element={<Navigate to="/services/all#design" replace />} />
          <Route path="/services/procurement" element={<Navigate to="/services/all#procurement" replace />} />
          <Route path="/services/construction" element={<Navigate to="/services/all#construction" replace />} />
          <Route path="/services/commissioning" element={<Navigate to="/services/all#commissioning" replace />} />
          <Route path="/services/maintenance" element={<Navigate to="/services/all#maintenance" replace />} />
          <Route path="/services/epc-construction" element={<CapEpc />} />
          {/* 25 Sep (Bazil: "one main page, 3 sub pages business unit, 1 dedicated page for services"): the utilities page is a section of the PCU & TTI unit page */}
          <Route path="/services/process-critical-utilities" element={<Navigate to="/services/tool-installation" replace />} />
          <Route path="/services/tool-installation" element={<CapTool />} />
          <Route path="/services/energy-management" element={<CapEnergy />} />
          <Route path="/markets" element={<MarketsHub />} />
          <Route path="/markets/semiconductor" element={<MarketSemiconductor />} />
          <Route path="/markets/data-centre" element={<MarketDataCentre />} />
          <Route path="/markets/ev-battery" element={<MarketEvBattery />} />
          <Route path="/markets/photovoltaics" element={<MarketPhotovoltaics />} />
          <Route path="/markets/district-cooling" element={<MarketDistrictCooling />} />
          <Route path="/markets/bio-lifescience" element={<MarketBioLifescience />} />
          <Route path="/markets/food-beverage" element={<MarketFoodBeverage />} />
          <Route path="/about/history" element={<History />} />
          <Route path="/about/commitment" element={<Commitment />} />
          {/* 15 Sep: owed content only; out of the launch build (lib/launch.js) */}
          {!LAUNCH && <Route path="/about/leadership" element={<Leadership />} />}
          <Route path="/about/esg" element={<Esg />} />
          <Route path="/global-presence" element={<GlobalPresence />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<Article />} />
          {/* 15 Sep: owed content only; out of the launch build (lib/launch.js) */}
          {!LAUNCH && <Route path="/investors" element={<Investors />} />}
          <Route path="/policies" element={<Policies />} />
          {/* 15 Sep: owed content only; out of the launch build (lib/launch.js) */}
          {!LAUNCH && <Route path="/exhibition" element={<Exhibition />} />}
          <Route path="/shortlist" element={<Shortlist />} />
          <Route path="/lp/:campaign" element={<Campaign />} />
          {!LAUNCH && <Route path="/portal/*" element={<Portal />} />}
          {import.meta.env.MODE !== 'launch' && <Route path="/semicon" element={<Semicon />} />}
          {import.meta.env.MODE !== 'launch' && <Route path="/booth/screen" element={<BoothScreen />} />}
          {import.meta.env.MODE !== 'launch' && <Route path="/booth/art/:id" element={<BoothArt />} />}
          {!LAUNCH && <Route path="/codex" element={<Codex />} />}
          {!LAUNCH && <Route path="/codex/slides" element={<CodexSlidesView />} />}
          {!LAUNCH && <Route path="/codex/site-preview" element={<CodexSitePreview />} />}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Shell>
  </BrowserRouter>
)
