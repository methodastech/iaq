import React, { lazy, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import applyMeta, { watchTitle } from './lib/meta.js'
import Shell from './components/Shell.jsx'
import './styles/base.css'

const Home = lazy(() => import('./pages/Home.jsx'))
const Home2 = lazy(() => import('./pages/Home2.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const Projects = lazy(() => import('./pages/Projects.jsx'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail.jsx'))
const Careers = lazy(() => import('./pages/Careers.jsx'))
const Contact = lazy(() => import('./pages/Contact.jsx'))
const Flow = lazy(() => import('./pages/Flow.jsx'))
const ServicesHub = lazy(() => import('./pages/ServicesHub.jsx'))
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
const Portal = lazy(() => import('./pages/Portal.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

watchTitle()

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    /* description, canonical and og:* per route: they were written once in index.html and then
       never changed, so every route shared the homepage's description and every shared link
       previewed as the homepage */
    applyMeta(pathname)
    /* jump instantly through Lenis when it is driving the scroll, so scroll-linked
       animations on the new page start from a true zero instead of a mid-lerp value */
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true, force: true })
    else window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/* survive Vite HMR of this entry module: reuse the root instead of re-creating it */
const container = document.getElementById('root')
const root = container.__reactRoot || (container.__reactRoot = createRoot(container))
root.render(
  <HashRouter>
    <ScrollToTop />
    <Shell>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home2" element={<Home2 />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/flow" element={<Flow />} />
          <Route path="/services" element={<ServicesHub />} />
          <Route path="/services/design" element={<ServiceDesign />} />
          <Route path="/services/procurement" element={<ServiceProcurement />} />
          <Route path="/services/construction" element={<ServiceConstruction />} />
          <Route path="/services/commissioning" element={<ServiceCommissioning />} />
          <Route path="/services/maintenance" element={<ServiceMaintenance />} />
          <Route path="/services/epc-construction" element={<CapEpc />} />
          <Route path="/services/process-critical-utilities" element={<CapPcu />} />
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
          <Route path="/about/leadership" element={<Leadership />} />
          <Route path="/about/esg" element={<Esg />} />
          <Route path="/global-presence" element={<GlobalPresence />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<Article />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/exhibition" element={<Exhibition />} />
          <Route path="/shortlist" element={<Shortlist />} />
          <Route path="/lp/:campaign" element={<Campaign />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Shell>
  </HashRouter>
)
