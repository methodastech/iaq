/* PHOTO NOTE
   prj-001 and prj-012 are held by a neutral cleanroom frame. The original
   photographs showed a client wordmark and a client named on a site signboard,
   which breaks the confidentiality rule. Replace with cleared photography
   before launch. Originals are in .photo-quarantine, outside the build.
*/
/* ============ single project registry ============
   Canonical data for the Projects registry page and the Project detail page.
   Index = the old project.html?p=N number (0..17, in registry order).
   Extracted verbatim from _source/projects.html / _source/project.html. */

export const PROJECTS = [
  { name: 'Testing manufacturing plant, 25,000 m² greenfield', client: 'Semiconductor manufacturer', ind: 'semiconductor', region: 'malaysia', loc: 'Malaysia', type: 'cleanroom', iso: 'ISO 6 to 7', size: 25000, img: '/assets/projects/prj-001.webp', cap: 'Photo · iaqtechnology.com.my' },
  { name: 'Wafer fab facility and expansion, cleanroom package with utilities', client: 'Wafer foundry', ind: 'semiconductor', region: 'malaysia', loc: 'the northern corridor, Kedah', type: 'epcc', iso: 'ISO 5', size: 0, img: '/assets/projects/prj-002.webp', cap: 'Photo · iaqtechnology.com.my' },
  { name: 'Semiconductor backend plant, 43,000 m² test, probe and assembly', client: 'Semiconductor manufacturer', ind: 'semiconductor', region: 'malaysia', loc: 'Malaysia', type: 'epcm', iso: 'ISO 6 to 7', size: 43000, img: '/assets/projects/prj-003.webp', cap: 'Photo · iaqtechnology.com.my' },
  { name: 'DLP cleanroom facility', client: 'Semiconductor manufacturer', ind: 'semiconductor', region: 'malaysia', loc: 'Malaysia', type: 'cleanroom', iso: 'ISO 5 to 7', size: 0, img: '/assets/projects/prj-004.webp', cap: 'Photo · iaqtechnology.com.my' },
  { name: 'Silicon wafer manufacturing, multi-class greenfield with full MEP', client: 'Silicon wafer manufacturer', ind: 'semiconductor', region: 'malaysia', loc: 'Ipoh, Perak', type: 'cleanroom', iso: 'ISO 3 to 7', size: 0, img: '/assets/projects/prj-005.webp', cap: 'Photo · iaqtechnology.com.my' },
  { name: 'Lithium-ion battery gigafactory dry room, 62,000 m²', client: 'Battery manufacturer', ind: 'ev-battery', region: 'europe', loc: 'Europe', type: 'dryroom', iso: 'Dry room', size: 62000, img: '/assets/projects/prj-006.webp', cap: 'Photo · iaqtechnology.com.my' },
  { name: 'EV battery gigafab phase 1, 8,000 m² dry room system', client: 'Battery manufacturer', ind: 'ev-battery', region: 'europe', loc: 'Europe', type: 'dryroom', iso: 'Dry room', size: 8000, img: '/assets/projects/prj-007.webp', cap: 'Photo · iaqtechnology.com.my' },
  { name: 'Lithium cell facility, 79,000 m² air-conditioning system', client: 'Battery manufacturer', ind: 'ev-battery', region: 'china', loc: 'Southeast Asia', type: 'hvac', iso: 'ISO 7', size: 79000, img: '/assets/projects/prj-008.webp', cap: 'Photo · iaqtechnology.com.my' },
  { name: 'Pharmaceutical manufacturing plant, small volume parenteral', client: 'Pharmaceutical manufacturer', ind: 'pharma', region: 'malaysia', loc: 'Malaysia', type: 'cleanroom', iso: 'ISO 5, 7, 8', size: 0, img: '/assets/projects/prj-009.webp', cap: 'Photo · iaqtechnology.com.my' },
  { name: 'Healthcare manufacturing plant, medical device greenfield', client: 'Medical device manufacturer', ind: 'pharma', region: 'malaysia', loc: 'Malaysia', type: 'cleanroom', iso: 'ISO 8', size: 0, img: '/assets/projects/prj-010.webp', cap: 'Photo · iaqtechnology.com.my' },
  { name: 'Tissue culture laboratory, class 1K to 10K cleanroom', client: 'University research institute', ind: 'pharma', region: 'singapore', loc: 'Singapore', type: 'cleanroom', iso: 'ISO 6 to 7', size: 0, img: '/assets/projects/prj-011.webp', cap: 'Photo · iaqtechnology.com.my' },
  { name: "District cooling centre, Malaysia's largest", client: 'District cooling operator', ind: 'district-cooling', region: 'malaysia', loc: 'Kuala Lumpur', type: 'district-cooling', iso: 'Energy', size: 0, img: '/assets/projects/prj-012.webp', cap: 'Photo · iaqtechnology.com.my' },
  { name: 'Co-generative plant, first in Southeast Asia', client: 'Energy technology group', ind: 'district-cooling', region: 'malaysia', loc: 'Malaysia', type: 'district-cooling', iso: 'Energy', size: 0, img: '/assets/projects/prj-013.webp', cap: 'Photo · iaqtechnology.com.my' },
  { name: 'Cool energy centre', client: 'District cooling operator', ind: 'district-cooling', region: 'malaysia', loc: 'Malaysia', type: 'district-cooling', iso: 'Energy', size: 0, img: '/assets/projects/prj-014.webp', cap: 'Photo · iaqtechnology.com.my' },
  { name: 'Flavor manufacturing plant', client: 'Flavour manufacturer', ind: 'fnb', region: 'malaysia', loc: 'Malaysia', type: 'cleanroom', iso: 'Hygienic', size: 0, img: '/assets/projects/prj-015.webp', cap: 'Site photo · IAQ' },
  { name: 'Flavor manufacturing plant', client: 'Flavour manufacturer', ind: 'fnb', region: 'malaysia', loc: 'Malaysia', type: 'cleanroom', iso: 'Hygienic', size: 0, img: '/assets/projects/prj-016.webp', cap: 'Photo · iaqtechnology.com.my' },
  { name: 'Data centre the data centre campus phase 1, chilled and condenser water piping', client: 'Hyperscale data centre operator', ind: 'data-centre', region: 'malaysia', loc: 'Kuala Lumpur', type: 'hvac', iso: 'Cooling', size: 0, img: '/assets/projects/prj-017.webp', cap: 'Photo · iaqtechnology.com.my' },
  { name: 'Solar panel manufacturing plant, KMW building M&E works', client: 'Solar module manufacturer', ind: 'photovoltaic', region: 'malaysia', loc: 'the northern corridor, Kedah', type: 'hvac', iso: 'ISO 6', size: 0, img: '/assets/projects/prj-018.webp', cap: 'Photo · iaqtechnology.com.my' },
]

export const INDUSTRIES = [['semiconductor', 'Semiconductor'], ['data-centre', 'Data Centre'], ['ev-battery', 'EV Battery'], ['photovoltaic', 'Photovoltaics'], ['pharma', 'Bio LifeScience'], ['fnb', 'Food & Beverages'], ['district-cooling', 'District Cooling & Heating']]
export const REGIONS = [['malaysia', 'Malaysia'], ['singapore', 'Singapore'], ['sea', 'Southeast Asia'], ['china', 'China'], ['europe', 'Europe']]
export const TYPES = [['cleanroom', 'Cleanroom'], ['dryroom', 'Dry Room'], ['epcc', 'EPCC'], ['epcm', 'EPCM'], ['hvac', 'HVAC / M&E'], ['district-cooling', 'District Cooling']]

export const INDLBL = {}
export const REGLBL = {}
export const TYPLBL = {}
INDUSTRIES.forEach(x => { INDLBL[x[0]] = x[1] })
REGIONS.forEach(x => { REGLBL[x[0]] = x[1] })
TYPES.forEach(x => { TYPLBL[x[0]] = x[1] })

/* industry icons for the visual header, same line style as the homepage industry cards */
export const ICONS = {
  'semiconductor': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 7V4M14 7V4M10 20v-3M14 20v-3M7 10H4M7 14H4M20 10h-3M20 14h-3"/></svg>',
  'data-centre': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="4" y="4" width="16" height="7" rx="1.5"/><rect x="4" y="13" width="16" height="7" rx="1.5"/><path d="M8 7.5h.01M8 16.5h.01M12 7.5h4M12 16.5h4"/></svg>',
  'ev-battery': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="16" height="9" rx="2"/><path d="M21 11v3M11.5 9.5l-2 3h3l-2 3"/></svg>',
  'photovoltaic': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 14h12l1.6 6H4.4zM9 14l.6-4h4.8l.6 4M12 7V4M7 8L5.5 6M17 8l1.5-2"/></svg>',
  'pharma': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3h4M11 3v6l-5 9a2.4 2.4 0 0 0 2.1 3.5h7.8A2.4 2.4 0 0 0 18 18l-5-9V3"/><path d="M8.4 15h7.2"/></svg>',
  'fnb': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3h4M10.5 3v2.6c0 1-.6 1.6-1.3 2.4C8.4 8.9 8 9.8 8 11v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-8c0-1.2-.4-2.1-1.2-3-.7-.8-1.3-1.4-1.3-2.4V3"/><path d="M8 14c1.3 0 1.3 1 2.7 1s1.3-1 2.7-1 1.3 1 2.6 1"/></svg>',
  'district-cooling': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 3v18M5 6.5l14 11M19 6.5l-14 11M12 3l-2 2M12 3l2 2M12 21l-2-2M12 21l2-2"/></svg>',
}

/* NUS deliberately stays a text plate: its logo renders poorly at small sizes */
/* No client logo wall. IAQ's clients are not published: projects are described
   by sector, scope and location only. This is deliberate, not an oversight. */
export const CLOGOS = {}

/* detail page: scope of work + brief blurb per industry */
export const SCOPES = {
  'semiconductor': ['ISO-class cleanroom architecture and envelope', 'ACMV and FFU air management', 'Process utilities and specialty gas systems', 'HV, MV and LV electrical distribution', 'Testing, commissioning and ISO certification'],
  'ev-battery': ['Ultra-low dew point dry room system', 'Envelope, vapour barrier and airlock design', 'Dehumidification and ACMV plant', 'Process utilities and safety systems', 'Commissioning to production readiness'],
  'data-centre': ['Chilled and condenser water piping', 'Cooling plant and heat rejection', 'Electrical distribution and controls integration', 'Pressure testing, flushing and commissioning'],
  'pharma': ['GMP cleanroom architecture and finishes', 'HVAC with pressure cascade design', 'Clean utilities: purified water and clean steam', 'Validation-ready documentation and handover'],
  'photovoltaic': ['Cleanroom and M&E works at production scale', 'ACMV systems for process stability', 'Electrical and process utility distribution', 'Commissioning and performance verification'],
  'fnb': ['Hygienic facility design and build', 'Process and clean utility systems', 'ACMV and environment control', 'Commissioning to food-safety standards'],
  'district-cooling': ['Central plant engineering and build', 'Chillers, thermal storage and distribution', 'Controls and energy optimization', 'Commissioning, operations and maintenance'],
}
export const BLURB = {
  'semiconductor': 'a controlled environment where nanometre-level precision is the daily standard',
  'ev-battery': 'a moisture-controlled environment where humidity is measured in fractions of a percent',
  'data-centre': 'an infrastructure where uptime and thermal stability decide everything',
  'pharma': 'a regulated environment where contamination control protects patients',
  'photovoltaic': 'a production environment moving at the pace of the solar industry',
  'fnb': 'a hygienic environment where spotless is the starting point',
  'district-cooling': 'an energy infrastructure serving whole districts at once',
}

export function pad3(n) { return ('00' + n).slice(-3) }
export function fmtSize(p) { return p.size ? p.size.toLocaleString('en-US') + ' m²' : 'At scale' }
