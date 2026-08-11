/* ============ newsroom registry ============
   The 20 items below are REAL: title and date captured verbatim from the live
   iaqtechnology.com.my newsroom. Nothing here is invented.

   What does NOT exist in any supplied source: the article bodies. No body copy
   was captured for a single item, so /news/:slug renders a labelled placeholder
   slot instead of prose. Do not write substitute copy.

   `tag` is an editorial classification applied by Brand Method against the tag
   vocabulary the client's own copy sheet asked for (CSR, EHS, Quality), with
   Company and Industry added to cover the rest. IAQ confirms the final tagging
   when the bodies are migrated.

   One title was normalised: "Celebrating 2.6 million Safe Manhours" ends with an
   exclamation mark on the live site, removed per the house copy rules. */

export const TAGS = ['CSR', 'EHS', 'Quality', 'Company', 'Industry']

export const NEWS = [
  { slug: 'house-of-love-chocolate-museum-day', date: '2025-08-13', tag: 'CSR',
    title: 'IAQ Brings Joy to Children from House of Love with a Day at Chocolate Museum Malaysia' },
  { slug: 'osh-week-safety-pledge-signing', date: '2025-08-08', tag: 'EHS',
    title: 'IAQ Concludes OSH Week with Safety Pledge Signing Ceremony, Uniting Site Team in Shared Commitment' },
  { slug: 'penang-branch-office-opening', date: '2025-07-23', tag: 'Company',
    title: 'IAQ Opens Official Branch Office in Penang, Strengthening Commitment to the Northern Region' },
  { slug: 'prime-minister-business-roundtable-france', date: '2025-07-09', tag: 'Company',
    title: "IAQ Joins Prime Minister's High-Level Business Roundtable in France, Representing Malaysia's Growing Global Presence" },
  { slug: 'dosh-kuching-safety-benchmark-sarawak', date: '2025-07-03', tag: 'EHS',
    title: 'IAQ Sets a New Safety Benchmark in Sarawak: Recognized by DOSH Kuching' },
  { slug: 'university-malaya-engineering-insight', date: '2025-06-09', tag: 'Industry',
    title: 'Bridging the Gap: IAQ Shares Real-World Engineering Insight at University of Malaya' },
  { slug: 'university-malaya-strategic-collaboration', date: '2025-05-29', tag: 'Industry',
    title: 'IAQ and University of Malaya Forge Strategic Collaboration to Advance Innovation in Worksite Environments' },
  { slug: 'ims-global-standards-commitment', date: '2025-05-08', tag: 'Quality',
    title: 'Excellence Through Integration: IAQ Reinforces Commitment to IMS and Global Standards' },
  { slug: 'annual-dinner-2025', date: '2025-05-02', tag: 'Company',
    title: 'IAQ Annual Dinner 2025: Hawaiian Night Getaway Strengthens Team Spirit and Togetherness' },
  { slug: 'umengine-career-day-2025', date: '2025-04-28', tag: 'Company',
    title: 'Inspiring Future Engineers: IAQ at UMENGINE Career Day 2025' },
  { slug: 'eid-celebration-2025', date: '2025-04-16', tag: 'Company',
    title: 'Celebrating Unity and Festivity: IAQ Eid Celebration 2025' },
  { slug: 'pdk-kota-raja-community-visit', date: '2025-04-10', tag: 'CSR',
    title: 'Empowering Communities Through Compassion: IAQ Visits PDK Kota Raja' },
  { slug: 'house-of-love-charity-luncheon', date: '2025-04-10', tag: 'CSR',
    title: 'Supporting Compassion and Community at the Charity Luncheon for House of Love' },
  { slug: 'celebrating-2-6-million-safe-manhours', date: '2025-04-10', tag: 'EHS',
    title: 'Celebrating 2.6 million Safe Manhours' },
  { slug: 'cross-department-iftar-gathering', date: '2025-03-28', tag: 'Company',
    title: "Celebrating Unity and Togetherness at IAQ's Cross-Department Iftar Gathering" },
  { slug: 'utar-engineering-science-fiesta-2025', date: '2025-03-05', tag: 'Company',
    title: "IAQ Engages Future Engineers at UTAR's Engineering Science and Fiesta: The Return 2025" },
  { slug: 'safety-manhours-milestone-east-malaysia', date: '2025-02-28', tag: 'EHS',
    title: 'IAQ Achieves 2.6 Million Safety Manhours Milestone in East Malaysia Project' },
  { slug: 'wafer-fab-facility-design-excellence', date: '2025-02-26', tag: 'Industry',
    title: 'Elevating Engineering Excellence in Wafer Fab Facility Design' },
  { slug: 'chinese-new-year-community-2025', date: '2025-02-19', tag: 'CSR',
    title: 'Spreading Love and Joy This Chinese New Year: IAQ Reaffirms Its Commitment to Community' },
  { slug: 'featured-in-the-star', date: '2024-12-24', tag: 'Company',
    title: 'IAQ Featured in The Star: A National Spotlight on Excellence in Hi-Tech Facility Construction' },
]

export const bySlug = slug => NEWS.find(n => n.slug === slug)

/** 13 August 2025 */
export const longDate = iso => {
  const [y, m, d] = iso.split('-').map(Number)
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  return `${d} ${MONTHS[m - 1]} ${y}`
}

/** 2025.08.13 for mono stamps */
export const stampDate = iso => iso.replace(/-/g, '.')
