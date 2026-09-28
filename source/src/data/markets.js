/* The seven markets, one row each (moved here from pages/MarketsHub.jsx on 18 Sep 2026 so the Markets hub
   and the home hero's market rail read one list). Field meanings are documented in MarketsHub.jsx:
     measure  what the market measures a facility by      spec  the class or spec word
     flag     the market page's "Largest delivered" fact  ind   the project registry facet */
export const MARKETS = [
  { id: 'mkt-semiconductor', name: 'Semiconductor', to: '/markets/semiconductor', icon: 'chip',
    img: '/assets/banners/mkt-semiconductor.jpg', ind: 'semiconductor',
    line: 'Wafer fabs and backend plants, held from ISO 3 to ISO 7.',
    measure: 'Particle count', spec: 'ISO 3 to 7', flag: '43,000 m² backend plant' },
  { id: 'mkt-data-centre', name: 'Data Centre', to: '/markets/data-centre', icon: 'server',
    img: '/assets/banners/mkt-data-centre.jpg', ind: 'data-centre',
    line: 'Cooling, power and containment engineered for hyperscale load.',
    measure: 'Uptime and thermal stability', spec: 'Hyperscale, by design', flag: '160 MW hyperscale build' },
  { id: 'mkt-ev-battery', name: 'EV Battery', to: '/markets/ev-battery', icon: 'battery',
    img: '/assets/banners/mkt-ev-battery.jpg', ind: 'ev-battery',
    line: 'Gigafactory dry rooms, where dew point decides the yield.',
    measure: 'Dew point', spec: 'Dry room', flag: '62,000 m² dry room' },
  { id: 'mkt-photovoltaics', name: 'Photovoltaics', to: '/markets/photovoltaics', icon: 'sun',
    img: '/assets/banners/mkt-photovoltaics.jpg', ind: 'photovoltaic',
    line: 'Cell and module lines built to hold process stability at volume.',
    measure: 'Process stability at scale', spec: 'ISO 6 to 8', flag: 'Module plant, Kedah' },
  { id: 'mkt-district-cooling', name: 'District Cooling & Heating', to: '/markets/district-cooling', icon: 'snow',
    img: '/assets/banners/mkt-district-cooling.jpg', ind: 'district-cooling',
    line: "Plant that cools a district, including Malaysia's largest.",
    measure: 'Kilowatt hours', spec: 'Chilled water, by contract', flag: "Malaysia's largest district cooling centre" },
  { id: 'mkt-bio-lifescience', name: 'Bio LifeScience', to: '/markets/bio-lifescience', icon: 'flask',
    img: '/assets/banners/mkt-bio-lifescience.jpg', ind: 'pharma',
    line: 'GMP parenteral suites, laboratories and medical device plants.',
    measure: 'GMP grade', spec: 'ISO 5 to 8, GMP', flag: 'Held in confidence' },
  /* bottle, not leaf: FlowIcon's own note reserves leaf for hygiene and gives food the
     bottle, and sitemap.js already renders a bottle for this market in the Related strip,
     so the card used to disagree with the strip at the foot of the same page */
  { id: 'mkt-food-beverage', name: 'Food & Beverage', to: '/markets/food-beverage', icon: 'bottle',
    img: '/assets/banners/mkt-food-beverage.jpg', ind: 'fnb',
    line: 'Flavour and food plants built to a hygienic regime end to end.',
    measure: 'Hygiene regime', spec: 'Hygienic', flag: '40,000 m² greenfield plant' },
]
