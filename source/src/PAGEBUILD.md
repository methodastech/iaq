# Page build contract (new pages, phase 2)

Read this fully before writing anything. It is binding.

## The architecture is already decided

`src/data/sitemap.js` is the single source of truth: every page's id, group, route, purpose, block order, its ONE call to action, and its links out. Build the page your task names, with the block order that file gives it. Do not invent a different structure. Do not edit `sitemap.js` (the orchestrator owns it) unless your task says otherwise.

`/flow` renders that file as a diagram, and `FRAMEWORK.md` is generated from it. Both stay correct automatically if you follow the data.

## Content rules: accuracy is the bar

All verified content is in
`/private/tmp/claude-501/-Users-zieel-Bazil-Claude-3-Websites-iaq-website/de3f50a9-af19-490b-a6f4-8ec9791d46bb/scratchpad/iaq_content.json`

- Use the copy that exists there **verbatim** wherever it fits. It is client-approved.
- The client's own copywriting sheet content is the highest authority, then the company profile, then the built site.
- **Never invent** a person, a date, a client name, a certification, a case study, an award, a testimonial, or a statistic. If it is not in the JSON or in `_source/*.html`, it does not go on the page.
- Where content is a known gap, ship a **labeled placeholder slot**: a bordered panel, dashed inner frame, a mono tag stating exactly what belongs there and who supplies it (e.g. "Board bios and portraits · supplied by IAQ"). That reads as intentional. An empty section does not.
- **Numbers must match the rest of the site.** The sources conflict (projects 200+/230/250+, cleanroom 1.05M/1.5M m², offices 6/7/8). Use ONLY the figures already used in the built pages (`_source/index.html`, `_source/about.html`) so the site is internally consistent. If your page needs a figure that is not already used somewhere in the built site, leave it out and note it in your report.
- **Do not publish client names** for the 77 profile-only project references. Only the 18 projects already in `src/data/projects.js` are publishable.

## House copy rules (hard)

- No dashes of any kind as pauses or separators. Use a colon, a comma, a period, or rewrite.
- No exclamation marks. No flattery. No filler.
- Sentence case headlines, mono for eyebrows/labels/tags.
- One primary action per page, the one named in `sitemap.js`. Never two competing calls.

## Component and file shape

Each page is:
- `src/pages/<Name>.jsx`
- styles: reuse `src/styles/pages.css` (shared phase-2 page styles, create it once if missing, then extend it) rather than one stylesheet per page. Only create a dedicated stylesheet if the page has genuinely unique heavy styling.

```jsx
import React, { useEffect } from 'react'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import PageHead from '../components/PageHead.jsx'      // eyebrow + h1 + lede + optional figure
import Related from '../components/Related.jsx'        // the "where this goes next" strip
import '../styles/pages.css'

export default function X() {
  useEffect(() => { document.title = 'IAQ Group · <Page> · Brand Method' }, [])
  return (<>
    <Nav />
    <PageHead eyebrow="…" title={<>…</>} lede="…" />
    {/* blocks in the order sitemap.js lists them */}
    <Related from="<page id from sitemap.js>" />
    <Footer note="<Page> concept · Brand Method" />
  </>)
}
```

`PageHead` and `Related` are shared components. If they do not exist yet, the FIRST agent to need one creates it in `src/components/`, written generically so the other pages use it unchanged. `Related` must read `linksOut` for the given page id from `sitemap.js` and render those links with their icons (use `src/components/FlowIcon.jsx`), so interlinking rule 05 holds automatically.

## Styling: match the existing site exactly

- Tokens come from `src/styles/base.css` (`--bg`, `--ink`, `--soft`, `--faint`, `--line`, `--line2`, `--blue` = #EC2027, `--maxw`, `--gut`, `--e1`). Never hardcode a hex that a token covers.
- Wrap content in `.wrap` for gutters. If you write a section rule with a `padding:` shorthand on a `.head`-like element, include the horizontal gutter in it (`padding: X var(--gut) Y`), because a two-class selector can outrank `.head.wrap` and flatten the page against the screen edge. This bug already happened once.
- Type: Switzer display, Instrument Sans body, JetBrains Mono labels. Follow the scale used by the built pages.
- Sections alternate rhythm: a dense band, then a calm one. Use hairlines and spacing, not boxes around everything.
- Cards, chips, tags, stat tiles: copy the existing class patterns from `_source/projects.html` and `_source/about.html` so the new pages look native to the site.

## Responsive: required, verified

- Multi-column grids stay multi-column on phones where the content is short (stats, tiles, market cards: 2-up minimum). Prose and the primary CTA go single column.
- No horizontal overflow at 320, 375, 414, 768, 1024, 1440. A wide element must live in its own `overflow-x:auto` scroller.
- Tap targets 40px minimum, inputs 16px so iOS does not zoom.
- Test: `document.documentElement.scrollWidth <= document.documentElement.clientWidth` at each width. Do not use `body.scrollWidth`, it over-reports.

## Interlinking (the five rules)

1. A market page links straight into the registry pre-filtered to that market. Use the EXACT existing hash slugs: Semiconductor `#semiconductor`, Data Centre `#data-centre`, EV Battery `#ev-battery`, Photovoltaics `#photovoltaic`, Bio LifeScience `#pharma`, Food & Beverage `#fnb`, District Cooling `#district-cooling`. So: `<Link to="/projects#semiconductor">`.
2. A project points back to its market and its capability.
3. A capability page shows real reference projects (pull from `src/data/projects.js`, filter by industry).
4. One primary action per page.
5. Nothing orphaned: every page renders `<Related from="…" />`.

## Verification before you report

```
npx esbuild src/pages/<Name>.jsx --outfile=/dev/null --loader:.jsx=jsx --jsx=automatic
```
must pass for every file you wrote. Do NOT run `npm run build` or `vite build` (other agents are working in parallel and you will collide). Do not edit `src/main.jsx`, `src/components/Nav.jsx`, `src/components/Footer.jsx`, `src/data/*`, or any file outside your assignment: the orchestrator wires routes and navigation.

## Report back

State: files written, which pages used real content vs a placeholder slot, any figure you left out because it was unverifiable, and anything in your group that still needs the client.
