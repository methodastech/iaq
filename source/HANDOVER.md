# IAQ website · handover

Status written 10 Sep 2026 after the client review, updated the same night after the QA pass, on 11 Sep after the router, font and checklist work, and on 15 Sep (section below).

## Where things are
| Item | Location |
|---|---|
| Build | `Websites/iaq website` (Vite + React, BrowserRouter on real paths since 11 Sep; old `/#/path` links redirect once at boot). Serve with launch entry `iaq-site` on 5177. Rebuild with `npm run build`; `public/` is copied into `dist/` on build; `tools/sitemap.mjs` runs before every build. |
| Host requirement | Every path must serve `index.html`. `public/_redirects` (Netlify, Cloudflare Pages) and `public/.htaccess` (Apache) ship in both bundles; on Nginx use `try_files $uri /index.html`. Without it a deep link 404s on hard reload. |
| Fonts | Self-hosted in `public/assets/fonts/` (19 woff2 + fonts.css). No Google Fonts or Fontshare requests remain. |
| QA review | `public/qa.html` (served at /qa.html, linked from the checklist jump bar): what is right, 52 problems, a solution each, and an action list with three checks per item. Regenerate check results with `node tools/qa-patch.mjs <audit2> <audit4> <results.json> tools/qa-data.json`; statuses live in `tools/qa-data.json`. |
| Audit tools | `tools/audit-crawl.mjs` (44 routes × 2 viewports: errors, requests, headings, alt, placeholders, overflow, weight, screenshots, text), `audit-summary.mjs`, `audit-probe.mjs`, `audit-weight.mjs`, `audit-smalltext.mjs`, `audit-launch.mjs`, `audit-tab.mjs`, `audit-fabskip.mjs`. puppeteer-core is symlinked from tenthpin/react-app. |
| Launch build | `npm run build:launch` → `dist-launch/` (MODE=launch: no review bar, no concept routes, no agency credits, titles without the suffix) then `tools/prune-launch.mjs` strips web1, competitor images and the internal pages (40MB). Deploy dist-launch, never dist. |
| Revision checklist | `public/checklist.html` (15 sections, 166 items). The 10 Sep meeting is filed in six sections prefixed `10 Sep ·`; the QA audit in three sections `10 Sep · QA review` (fixed 32, part done 6, blocked on IAQ 14; 166 items, 109 ticked), regenerated from `tools/qa-data.json` by `node tools/qa-checklist.mjs`. Ticks persist in the browser; `Save file` bakes them into the file. |
| Client source files | `Bazil Claude 3/Client info/IAQ`: the 27 Jul business unit questionnaires (EPC, Energy Management, general), moodboard, profile brief, Revit transfer. Discovery V3 and Brand Positioning questionnaires arrived as PDFs on 10 Sep (Downloads). |
| Meeting minutes | `Downloads/IAQ x Brandmethod – 2026_09_10 … Notes by Gemini.pdf` plus Bazil's WhatsApp notes (screenshot, 15:54 to 16:19). |
| Backups | `_backups/pre-10sep-minutes/` (src tarball and checklist before today's changes); `_backups/restore-20260903-2251/` (before the 3D revert). |

## 24 Sep 2026 · header, hero, icons in motion, water
Later, 24 Sep: **Services page rebuilt** on `components/ServicesMap.jsx` + `styles/services-map.css` (order on the page: ServicesCover head, UnitsBand, the cycle ring `.cyc-band`, MapBand with `codex/RelExplorer`, QuestionsBand with the six asks, WorkBand with the who-does-what grid, proof strip, FaqBand), all from `data/codex.js`; head is `components/ServicesCover.jsx` + `styles/services-cover.css` (PageHead no longer used on the hub): the Codex cover built live, LAYERS copied from CodexSlides.jsx, model `/assets/iaq/model-seq/44.webp`, pins by percent, tour 2.4s, `.in` on the head arms the pins; a small six-service ring under the copy (`.sc-ring`, stations by `cos()/sin()` of `--a`, arc by `pathLength=6` dasharray) advances on the same timer. CycleRing (`.cyc-band`) now draws hand-off chevrons (`.cring-chev`, red once made), the 6-to-1 return (`.cring-return` dashed, `.cring-return-head`) and its label (`.cring-ret-l`, HTML positioned at R+118). The cover crop `/assets/services/fab-cover-model.webp` stays on disk unused. UnitsBand is three level cards (`.sm-ucards.sm-level`, 9-row subgrid, `.sm-uc-spec` a 4-row nested subgrid, `.sm-svc6` the six-service strip); the selector/stage showcase was built and then replaced on Bazil's word ("three columns, each unit"), its CSS is still in services-map.css. Bazil, 24 Sep: "we focus on clarity first, then design"; every heading says what the section is, no phrase-making. Flow pass: `useInView` per band adds `.in` and services-map.css runs the choreography (life strip rail, cards, aligned asks grid `.sm-ask` with `--k` per column, work lists, grid dots); `tools/probe-services-flow.mjs` proves every band settles at opacity 1. Old units section and glossary block removed (backup `src/_backups/services-0924/`). **Codex**: banner with the exploded fab drawing (`.cx-head-art`, momentum), key examples with `data-noab`, reveal system in `CodexBody` (`.cxr`/`.in`, `.cx-armed`; print shows all), ten questions carry `rec` (green "Our answer"). SiteMock bands hero and map flagged live. **Portal**: group click navigates to its first page. **Design tab**: `tools/design-scenes-0924.mjs` writes the Drawn scenes block between `<!-- scenes:start/end -->` in the Motion section; re-run after editing ValueMotion or its CSS. **Careers**: hero white with motion (dark band rejected), Write to HR gone, universities lead card, safety block on an ink panel with large badges, origin band on three team photos.
Nav: `AdminBar.jsx` fit() pushed every sticky element by the bar's height although the bar is static (it scrolls away); the nav stuck 62px down, or 188px after the bar wrapped in a narrow pane. Push only when the bar is fixed; pushed elements are remembered, re-fitted on resize and released on unmount. Verified: nav rect top 0 after scroll, no body padding.
Hero: particle canvas hidden (`#heroCanvas{display:none}`, loop skipped); lede's second sentence on its own line (`.lede-b`). Market bar marks animate on their one red part per market (`li[data-m]` rules in home.css). Record marks: `grLift` is now a breath on the red part (scale .9 to 1.22). Ring marks keep colour at rest. Globe sea: `dotMat(...,'wave')` swells, size 0.48, bluer, alpha .82. Build clean. Backups `src/_backups/hero-0924/`.
Later the same day: Careers trigger and row land on `#roles` (Nav.jsx `to`), and `ScrollToTop` in main.jsx holds a hash target for 1.8s (it overshot by 2,200px while the sections above settled). Careers page: `.cr-emp` block removed, why cards carry FlowIcon marks (`WHY_ICON`). Cycle marks: detail added in `scripts_marks_build.mjs` and regenerated (`node scripts_marks_build.mjs --cycle > src/data/cycleMarks.js`). Record wash diagonal (`.glance.gr`), land/sea split in `dotMat` calls, strip icons 42px. Portal GROUPS: exhibition items are booth views (`{k,view,label,icon}`), documents = downloads (labelled Files to send) + codex. Origin section on Careers: `OriginClip` in Careers.jsx is a crossfade of three newsroom team photographs (ORIGIN_PICS, 24s cycle, 8s stagger, `cuOrigin` keyframes in culture.css) under a left-heavy scrim; the fit-out clip was rejected ("this is culture"). 1995 sits above the title inside `.cu-origin-copy`. Image-once rule: the three are not used elsewhere on the page. Values scenes: `.vm.is-live :is([class]) {animation-delay}` must stay the LAST rule in value-motion.css; an `animation:` shorthand on any element resets its delay, which is why the 16 Sep phase rule never worked and all six cards blanked together. Careers hero stays white (dark band rejected); universities block has a lead card and four rows on a `grid-auto-rows:1fr` list so the columns end level.

## 18 Sep 2026 · the Codex, the member area, and the strip-back after the 17 Sep review

**Open questions (Bazil, 18 Sep: "we do what we feel is the best but leave the questions at the top if we have any"). Nothing waits on these; each shows what was done meanwhile.**

| Question | Done meanwhile | For |
|---|---|---|
| "Put it in the portal page": the IAQ site's member portal, or the BM SS Portal? | Built as a Downloads tab in the IAQ site portal at /portal | Bazil |
| Unit 2 is now "Process Critical Utilities & Total Tool Installation Solutions", IAQ's own written name, in place of "Total Tools Hookup Solution". Confirm? | Applied on the site, the search index and the slides, from the cross-check; "hookup" now names service 6 only | Nabilah |
| IAQ's papers still say founded 1994 and eight countries; the site says 1995 and seven, on the 10 Sep instruction. Which is final? | The site keeps 1995 and seven | Nabilah |
| Do the six service pages stay as depth reached from the cycle, or fold into the Services page? | Kept, out of the menu, reached from the cycle only | Nabilah |
| Is the unit by service matrix right, the ringed "when asked" ones above all? | EPC six; hookup five plus maintenance when asked; EFM maintenance and commissioning plus the first three when asked | The unit heads |
| Where do cleanroom systems sit in the work layer? | Envelope under CSA, fan filter units under MEP | Nabilah, the BIM manager |
| When does IAQ supply the capability statement PDF? | Portal button inert until it arrives; three ISO certificates download now | Nabilah |
| What page size does the company profile use? | The set exports at 16:9 (PNG and one PDF); a portrait profile needs a second layout | Shazwan, Nabilah |
| Which figures will IAQ release for a performance slide (headcount by function, safety rate, order intake)? | Only the six published counters are used; revenue stays off | Nabilah, management |
| Do slides 2 and 3 go onto the public Services page? | They live in the Codex and export for the profile; a responsive version comes first | Bazil |
| When does the approved project list arrive? | The proof slide is computed from the 18 published references | Sunny |

The same IAQ questions lead the Codex page itself (`OPEN_QUESTIONS` in `src/data/codex.js`): answer one, move its outcome into the data, delete the row.

Source: `Downloads/IAQ x Brandmethod – 2026_09_17 14_57 … Notes by Gemini.pdf` (95 pages; the website review is 00:40 to 01:16 of the transcript) plus Bazil's instructions in the session. Backup of `src/` and the checklist before any edit: `_backups/src-pre-codex-0918.tar.gz`.

| Change | Where | Verified |
|---|---|---|
| **The Codex**, the member-area tab Bazil asked for: part 1 the four-layer structure (business unit, service, work, system) with a pick-a-unit highlight, the unit-by-service matrix and the models; part 2 the buyer's three questions, six buyer paths, the contractor classification, the reading rules; part 3 the reading order, the three-row Services menu, the seven-part unit page, the six services as one diagram, one name each, one end goal per page, the terms filed by layer, applied and next | `src/pages/Codex.jsx`, `src/data/codex.js` (every rule is Nabilah's, 17 Sep), `src/styles/codex.css`; route `/codex` in `main.jsx`, review builds only | Pane at 1440 and 375: 3 parts, 0 console errors, no page overflow, every h1/h2 em on one line at 1440; pick EFM lights 2 services, marks 3 "when asked", dims 1, lights MEP only; print to PDF 13 A4 pages, no blank pages (`tools/probe-codex-print-0918.mjs`) |
| Member passcode is `iaqsolution321`; an **Emergency access** button under the passcode field (nav popover, /portal login, /codex gate) opens the session without it, for testing; sign-in lands on /codex; the signed-in popover offers the Codex and the portal; session changes broadcast (`iaq:auth`) so a sign-out flips the open page | `src/lib/cms.js` (`PASS`, `grant`, `onAuth`), `src/components/MemberLogin.jsx`, `Portal.jsx`, `Codex.jsx`, `.nl-emerg`/`.nl-tab` in base.css | Wrong passcode shows the error, right one opens the Codex, sign-out gates it, emergency reopens it (tab probe, 0 errors) |
| **Capability statement & certification pack** removed from the public Services page; now a **Downloads** tab in the member portal with the document mock, the pack button (inert until IAQ supplies the file, `PACK_FILE` in Portal.jsx) and the three ISO certificate PDFs that already exist | `src/pages/Portal.jsx`, `portal.css`, `ServicesHub.jsx` | /portal Downloads tab: 1 card, 3 certificate links, pack button aria-disabled |
| The red **"Need a service tailored to your facility?" band** removed from every page that carried it (13 files: the five service pages, the hub, UnitPage, CapabilityPage, MarketPage, MarketsHub, Exhibition, Policies, Investors). The closing band holds the one action | the `.pg-cta` sections; CSS left in pages.css | Probe: `.pg-cta` 0 on /services, /services/design, /services/epc-construction, /markets/semiconductor |
| The **navigation blocks above the footer** removed: the "Next stage" cards on the five service pages, the "every project in the record" card on the market pages, the "Where this goes next" strips (`<Related/>`, 15 pages), the "See the full registry / Find your market" rows, and the Projects page "What this sample is made of" block with its three buttons and sample note | service pages, `MarketPage.jsx`, `Projects.jsx`; `Related.jsx` stays on disk unused | Probe: `.pg-nextcard` 0, `.pg-rel` 0, `.rg-close` 0 |
| Projects banner shorter: the seven-market ledger bars and the sample note are out | `src/components/RegistryBanner.jsx` | Banner 563px at pane width; `.rb-ledger` 0 |
| **Careers is one page**: the Culture section on top (opening figures, founder line, six values, safety record, where engineers grow, people by name), then the roles (filter console and list, why IAQ, what the work is, how applying works, the routes), one closing band. The Careers menu has exactly two rows, Culture (`/careers#culture`) and Careers (`/careers#roles`); `/careers/culture` redirects to `/careers#culture`. Dropped from Culture: the photo marquee, the moments, the offices grid, "how hiring works" (duplicate of "how applying works"), the care tiles, both promo bands | `src/pages/Careers.jsx`, `scenes/careers.js` (`#culture` and `#roles` landings), `careers.css`, `Nav.jsx`, `main.jsx` (one route), `sitemap.js`, `meta.js`, `tools/sitemap.mjs`, `public/sitemap.xml`; `Culture.jsx`, `CareersPromo.jsx` unreferenced on disk; backups `src/_backups/careers-merge-0918/` | Lead's own probe at 1440: order culture 152, values 1497, safety 2634, grow 3770, voices 5167, roles 6689, joblist 6892, how 9363, close 9882; 1 h1, 1 closing band, 16 of 16 roles, 0 reveal elements left hidden after a scroll-through, counts land on 450, 7, 16, 2.6; 9 heading em phrases on one line; scrollWidth 1425 at 1440. Agent's probes: `#roles` lands at 70px, `#dept=project` filters to 5, 390px no overflow |

### 18 Sep, evening: the cross-check, the light set, the portal as its own area
Bazil: "it needs to have great infographic", "super clear easy to understand, clear breakdown, group and glows" (six references), "I believe I even gave you documents for these", "compare, crosscheck", "why black layout though", "portal should have its own tabs and pages, right inside there is the Codex".

| Change | Where | Verified |
|---|---|---|
| **Cross-check** of every IAQ document on disk (Discovery V3, the three unit questionnaires, the 1 Jul website copy sheet, the Utility Solutions deck, the moodboard, the annotated feedback deck, the 17 Sep review, the 18 Sep WhatsApp) against the site: 14 rows, 6 fixed, 5 already agreed, 3 where IAQ's own papers disagree. Text of every document extracted to the session scratchpad `docs/` | `CROSSCHECK` in `src/data/codex.js`; Codex part 2 | 14 rows render on /portal/codex |
| Unit 2 renamed to IAQ's written name, **Process Critical Utilities & Total Tool Installation Solutions** (short PCU & TTI); "Total Tools Hookup Solution" retired, so "hookup" names service 6 only | `Nav.jsx`, `ServicesHub.jsx`, `ProjectDetail.jsx`, `sitemap.js`, `search.js` (also fixed: EFM was "the second" unit, hookup "the third"), `codex.js`, slides | 0 copies of the old name in dist-launch |
| Unit 2 is **semiconductor only** (unit head: "Semiconductor exclusively"); the Total Tool Installation page claimed pharma. Hook-up runs in **IAQ's four phases** (facilitization, rig-in, hook-up, commissioning) with the unit head's own detail, in place of six generic steps; the drawing lights by phase | `CapTool.jsx`, `CapPcu.jsx` (filter), `UnitArt.jsx` (`HookupArt` sets) | Page probe: 4 phases, no "pharma", 0 errors |
| **The infographic set, rebuilt**: a cover (IAQ's Revit model, nine layers pinned by discipline, the six-frame build-up) plus eleven slides, one colour per kind of thing printed as a key on every slide (red unit, ink outline model, azure service, amber work, green system, violet market). New: slide 1 "IAQ in one picture" (the six kinds, read down) and slide 2 "Three words that mean two things" (EPC, hookup, PCW/CDA/UPW). Slide 9 uses IAQ's five utility groups from its deck and the four phases, with base build in green and hook-up in red. Light ground with bold colour and soft glows: a black version was built and dropped (IAQ's feedback: "just too white"; moodboard: one or two bold colours; the set also prints) | `src/components/CodexSlides.jsx`, `src/styles/codex-slides.css`; dark version kept in `src/_backups/codex-dark-0918/` | 12 exports at 1920x1080, 0 elements past frame or footer, 0 errors; every slide reviewed by eye |
| **The member portal is its own area**: a tab bar pinned under the site nav, a page per tab on its own address: /portal/codex, /portal/newsroom, /portal/careers, /portal/projects, /portal/downloads. The Codex is a tab (`CodexBody`); /codex redirects to it; Downloads carries the set (PDF plus 12 PNGs from `public/codex/`, pruned from the launch build), the pack and the certificates. The red left-stripe note became a tint | `src/pages/Portal.jsx`, `Codex.jsx`, `main.jsx` (`/portal/*`), `portal.css`, `tools/prune-launch.mjs` | `tools/probe-portal-0918.mjs`: gate, 5 tabs each with its own title, admin link grants, redirect keeps the hash, unknown tab falls back to the Codex, sign-out gates all, 0 errors. Trap fixed: a catch-all `<Navigate to="codex">` is RELATIVE and re-matched itself (update-depth loop); use absolute paths |
| Super admin bar: tab **09 Codex** added on all six copies (→ /portal/codex?admin, which grants the session; 08 CMS → /portal/newsroom?admin). The app's 1.12 page zoom was enlarging the bar (69px, tab 09 off the end); `.bmws{zoom:calc(1/var(--zoomf))}` makes it paint exactly as the static copies, height converted back for `--tbh` | `AdminBar.jsx`, the five static pages | `tools/probe-barfit-0918.mjs`: 62px, overflow 0 at 1440 and 2560, nav flush under the bar; narrower widths scroll behind the fade as the standard intends. Trap: index.html rewrites deep links to `/?query#/path` before the app boots, so the grant tests `pathname + hash` |

Route crawl after all of it (94 captures, portal tabs added to the crawler): 0 console errors, 0 failed requests, 0 broken images, 0 overflow. Launch bundle rebuilt: 0 passcode strings, 0 portal or Codex chunks, no `codex/` folder, 0 copies of the old unit name.

### 18 Sep, afternoon: the benchmark from IAQ, the infographic set, the dropdowns
Nabilah forwarded 13 photographs of a competitor's company introduction deck (Exyte and Exentec, a visit on 17 Sep; their slides are marked confidential, so they are read by DEVICE in the Codex and never reproduced): "This is Sunny expectation on the deliverable from Brandmethod. Infographic that help clients to understand our business." Plus: "include extension of EPC, Process Critical Utilities and Total Tool Installation Solutions and Energy Facility Management from website into our company profile as well after 3 business unit page." Bazil: "go through thoroughly", "we need definitely do a lot better".

| Change | Where | Verified |
|---|---|---|
| **The infographic set**: nine 16:9 slides, each a size container with every measure in cqw, so one markup is a web figure, a 1920x1080 export and a booth screen. 1 at a glance (IAQ's own photographs); 2 three units across the life of a facility; 3 six services, the scope, and the unit that carries each; 4 four ways to contract IAQ (contract drawings); 5 three disciplines with IAQ's Revit extracts; 6 EPC; 7 Total Tools Hookup Solution as a fab section with the six steps pinned; 8 EFM as a ring round RM0; 9 proof by market and work delivered, computed from `PROJECTS` | `src/components/CodexSlides.jsx`, `src/styles/codex-slides.css`; slide view `/codex/slides` (`CodexSlidesView.jsx`) | `tools/export-codex-slides-0918.mjs`: nine 1920x1080 PNGs, 0 elements past the frame or the footer, 0 console errors; every slide reviewed by eye at 1280 |
| Exports for the profile | `_exports/codex-0918/slide-1..9.png`, `IAQ-infographic-set.pdf` (9 pages, 16:9) | Files present |
| Codex rebuilt round the set: open questions, 1 the benchmark (six things their deck does, then their deck slide by slide against ours), 2 the set, 3 the structure, 4 the buyer's view, 5 website and profile (adds the profile placement order: 1, 2, then 6 7 8 after the three business unit page, then 3 4 5, then 9) | `Codex.jsx`, `codex.js` (`BENCHMARK`, `THE_BAR`, `PROFILE_ORDER`, `OPEN_QUESTIONS`), `codex.css` | `tools/probe-codex-0918.mjs` at 1440 and 390: 5 parts, 9 questions first, 9 slides, 11 benchmark rows, 0 errors, page width equals viewport; slides scroll inside their own wrapper on a phone |
| Dropdowns: the count, title and note header removed from every wing; rows are separate white cards with a red icon tile (`.nm-ict`); Services is two stacked groups, the three units as segments (hookup carries its two pages as links, EPC and EFM their models as chips) and the six services as a numbered strip | `Nav.jsx` (kinds `segs` and `strip`, `stack`), end of `base.css` | `tools/probe-wings-0918.mjs`: 0 `.nm-seth`, every wing inside the viewport, Services 3 segments and 6 strip links, 0 errors; About and Careers viewed by eye. Trap: a CLIPPED puppeteer screenshot taken in the hover loop came back with the rows blank; the unclipped one is right |

### Later the same day, "do what is best": the Codex applied on the site
| Change | Where | Verified |
|---|---|---|
| SUPERSEDED THE SAME AFTERNOON (see the dropdown row above: Bazil asked for the six services back as a second group). Morning state: Services menu as the three units only, each with its model line | `Nav.jsx` MENUS services entry | Wing probe at 1440: 3 rows, hrefs epc-construction, tool-installation, energy-management |
| One name each: EPC (was "EPC & Construction"), EFM (was "Energy Management") on the unit pages, the hub card links ("The EPC unit", "The EFM unit"), the project page unit strip, the sitemap labels. Routes unchanged | `CapEpc.jsx`, `CapEnergy.jsx`, `sitemap.js`, `ServicesHub.jsx`, `ProjectDetail.jsx` | Titles read "IAQ Group · EPC" and "IAQ Group · EFM"; 0 "EPC & Construction" strings in the launch bundle |
| Every unit page carries "Six services, the ones this unit carries" and "The work, and the systems inside it", read from `src/data/codex.js` (the Codex's parts 4 and 5 of the unit page). PCU maps to the hookup unit | `UnitPage.jsx` (`cxUnit`), `unit.css` (`.un-scope`) | EPC 6 lit; EFM 2 lit, 3 "when asked", 1 dim, MEP only; PCU and hookup 5 lit, 1 asked, MEP and process; em phrases one line; 375px one column, no overflow |
| Careers "What the work actually is" point 4 no longer repeats the safety record: it now says every discipline sits in one company | `Careers.jsx` | Text probe |
| Launch bundle: `Portal`, `Codex` and `MemberLogin` fold out at compile time (`import.meta.env.MODE`), so no portal or Codex chunk, no passcode and no "Emergency access" string ships; the six stray `.bak` copies that `public/` was shipping moved to `_backups/public-dotfiles-0918/` | `main.jsx`, `MemberLogin.jsx`, `Portal.jsx`, `public/` | `grep` on dist-launch after `npm run build:launch`: 0 passcode files, 0 codex or portal chunks, 0 .bak files |
| Codex status updated (applied and next) and the PDF re-rendered | `codex.js` STATUS | 13 pages |

Route crawl after the applied changes: the first run (`crawl-0918c/`) lost its first 15 captures to a dev-server restart (connection refused, not a page fault); the other 75 were clean. Rerun in full as `crawl-0918d/` (45 routes × desktop and mobile, 90 captures): 0 console errors, 0 failed requests, 0 responses over 400, 0 broken images, 0 sideways overflow.

Route crawl after the removals (`tools/audit-crawl.mjs`, 45 routes × desktop and mobile, 90 captures): 0 console errors, 0 failed requests, 0 responses over 400, 0 broken images, 0 sideways overflow. Report in the session scratchpad `crawl-0918/`.

The Codex prints from the page (Print to PDF button, `@media print` in codex.css); a rendered copy from this session is in the scratchpad as `codex-print.pdf`.

Assumption stated to Bazil: "put it in the portal page" was read as the IAQ site's member portal at /portal, not the BM SS Portal.

## 15 Sep 2026 · status (written mid-session, rewrite at close)
Recovered from the 14 Sep session (it ended cleanly at 19:39 with a full report; no edit in flight). Today's instructions from Bazil, in order: Careers dropdown; buttons between Careers and Culture and a promo above the footer on both; office photos; "find from online, complete everything"; value icons were bad, then animated scenes, no "See the record", no lines; images and videos on the History timeline; achievements on it; check every WhatsApp item.

### Done and verified by the lead
| Change | Verified |
|---|---|
| 20 sub-pages (About, Services, Markets) rendered BLANK on the dev server since 11 Sep: `JSON.stringify` of a JSX headline in the breadcrumb data. `textOf()` in PageHead.jsx, last crumb named from the sitemap | Crawl 2, 45 routes x 2 viewports: 0 console errors, 0 failed requests, 0 broken images, 0 phone overflow; `tools/probe-crumbld.mjs` on the production bundle: Home, About, History of IAQ |
| Seven long BM sentences split (CapEpc, CapPcu, CapTool, Exhibition, District Cooling); duplicated "The route is set." removed | Crawl text: 0 sentences of 30+ words on those pages |
| Careers wing in the nav: open roles by department with live counts deep-linking the filter (`#dept=`, `#loc=`, `#roles` read by scenes/careers.js), Life at IAQ photo cards | Headless hover capture at 1440; links resolve |
| `CareersPromo.jsx` above the footer: Life at IAQ band on Careers, open roles band on Culture (replaces the old roles section); z-index 7 so the sticky filter never crosses it | Captures at 1440 and 390 |
| Culture values: `ValueMotion.jsx` + `value-motion.css`, six drawn scenes that loop only while on screen; cards are no longer links; no divider lines | Filmstrip at five points of the loop, reduced-motion still, 0 borders or gradient lines inside cards (`tools/probe-valuemotion.mjs`, `probe-vmcheck.mjs`) |
| Office cards carry a photograph slot; Penang uses IAQ's own office photo | Capture at 1440 and 390 |
| Project description format page `public/project-format.html` from `tools/gen-project-format.mjs` (re-run after data lands); linked from the checklist jump bar; stripped from the launch build | Headless 1440 and 390, 0 errors, no overflow |
| Checklist m46 to m52 added and ticked | Inline script parses |

### Agents (15 Sep close)
Both unfinished passes below were stopped mid edit. Their files may be half changed and are UNVERIFIED: check /careers/culture, /contact and the News pages render, or restore from the listed backups. Careers menu cut to two entries (Careers, Culture) at Bazil's request; backup src/_backups/culture-design-0915/Nav.pre-twoitems.jsx. Production build passed before the stop.

| Agent | Files it owns | Backups |
|---|---|---|
| DONE: copy pass, 247 fixes in 46 files; vague links 27 to 0; units renumbered 1, 2, 2, 3 per Discovery A2.1; audit table in the session scratchpad copy/copy-audit.md. Client paragraphs edited for grammar and length are listed for Nabilah. Decisions left: ISO Class 1 vs US Class 1; History office list vs Global Presence; ESG "risk-free" energy claim; Food & Beverage H1 grammar | 46 files | src/_backups/copy-0915b/ |
| STOPPED MID EDIT at Bazil's request (usage limit): Culture page design and content pass (hero set by the lead; shorter page, no repeats, no skeletons, momentum on photos, day in the life completed from published posts) | Culture.jsx, culture.css | src/_backups/culture-design-0915/, culture-design-0915b/ |
| STOPPED MID EDIT at Bazil's request (usage limit): emphasis wraps site-wide (29 headings), Contact false claim and labels, News page furniture | shared heading CSS, Contact.jsx, contact.css, News files | src/_backups/fixes-0915c/ |
| DONE: History media and achievements. Every entry has a figure; five dated newsroom achievements; Penang photo and DOSH wording corrected; lines and the timeline eyebrow removed | History.jsx, HistorySpan.jsx, data/history.js, history-span.css, history-media.css, public/assets/newsroom/ (7 WebP + SOURCES.md) | src/_backups/history-media-0915/ |
| DONE: News. 70 posts (was 20 headline-only), every one with its body, 55 with the post's own photo, 7 galleries; topic groups show 6 with Show all; article page centred and de-lined. Rebuild: `tools/news-build/build.py` reading the mirror in `_reference/newsroom-scrape/`. Decisions for Bazil and IAQ: client names inside posts (Bosch, X-FAB, Morrow, ACC, NVIDIA), photo clearance for staff and officials, exclamation marks removed from 16 bodies and 3 titles | data/news.js, newsArt.js, search.js, News.jsx, Article.jsx, NewsRail.jsx, news.css, news-banner.css, public/assets/newsroom/ | src/_backups/news-bodies-0915/ |
| DONE: EPC and EFM pages rebuilt from the 27 Jul questionnaires and IAQ's /epcc, /epcm, /efm pages; gap table in the session scratchpad epc-efm/gap-table.md; five open questions per page are in their slots | CapEpc.jsx, CapEnergy.jsx | src/_backups/epc-efm-0915/ |
| DONE: Culture and Contact. Slots filled from IAQ's newsroom and LinkedIn (founder's words, team photos, training, voices, care tiles); real office photos for Shah Alam, Penang, Singapore, India; generated representations for Dresden, Sweden, USA, Ireland; safety section rebuilt with whole badges and award photos; office cards level on subgrid. Sources: public/assets/culture/SOURCES.md | Culture.jsx, culture.css, Contact.jsx, contact.css, public/assets/culture/ | src/_backups/culture-slots-0915/ |

Research material: IAQ's newsroom scraped to the session scratchpad `research/raw` and `research/images` (about 300 text files, 50 photographs). The scratchpad is temporary: anything used must be copied into public/assets with a SOURCES.md.

Fixed after the agents reported it: the nav wings caused a sideways scroll at desktop widths (the hidden Careers panel ran to 1652px at 1440). `clampWing()` in Nav.jsx now holds every wing inside the viewport at its open size on load, fonts ready and resize. Verified: 18 captures, page width equals viewport; every open wing 16px from the edge (`tools/probe-navoverflow.mjs`, `tools/probe-wingopen.mjs`).

Office representation images generated with Higgsfield on Bazil's instruction: `public/assets/culture/offices/` (sg, de, in, se, us, ie) with SOURCES.md. The 10 Sep note on office visuals said no AI renders, so captions say representation.

Conflicts found in IAQ's public sources, left for Bazil and Nabilah (nothing changed on the site):
| Item | Site says | IAQ's public sources say |
|---|---|---|
| Founding year | 1995 (client instruction, 10 Sep) | 1994 on IAQ's own site and in the CEO's Bernama interview |
| Countries | Seven, incl. USA and Ireland offices | Published list: Malaysia, Singapore, China, Morocco, Poland, France, Sweden; no public trace of USA or Ireland |
| HQ entity and address | IAQ Technology Sdn. Bhd., No. 12 | IAQ's contact page: IAQ Solutions Sdn Bhd, and both No. 9 and No. 12 |
| Singapore Utility address | 4338 Alexandra Technopark | Likely a typo for 438B |
| Highwire Safety Gold 2024 | Shown | No public source beyond the badge IAQ supplied |

Footer fix, 15 Sep: `.close3d` top padding moved into base.css (it lived only in careers, about, home, project and projects css), verified 81px on /careers/culture, /careers, /about, /services. The dead gap above the contact rows was `.close3d .close-cards{align-self:end}` (base.css, 24 Aug) pinning the rows to the bottom of a row stretched to the link column; overridden to start with one margin. Verified: 46px (zoomed) between the call to action and the contact rows on /careers/culture, /careers, /about, /services (`tools/probe-footer.mjs`, `tools/probe-footerbox.mjs`).

Observed, not fixed: `#bmws-bar` renders empty (0px) on qa.html and the new format page; the shared bar is not drawn on the static internal pages.

## Done on 11 Sep, QA follow-through
| Change | Verified |
|---|---|
| Router switched to real paths (BrowserRouter, base `/`); hash links redirect at boot; card clicks and deep links use pushState; canonical, sitemap and shortlist links on real paths | Launch preview 5179: `/#/about` → `/about`; `/projects#semiconductor` shows 5 of 18; card click → `/projects/0` survives a hard reload; canonical `https://iaqtechnology.com/services` |
| `_redirects`, `.htaccess`, `robots.txt` with the sitemap line, `sitemap.xml` (61 urls) generated on every build | Files on the launch preview; crawl on real paths, 0 errors, 0 failed requests |
| Fonts self-hosted, CDN stylesheets removed, two preloads | Launch preview: 0 third-party font requests, 25 local woff2, h1 in Switzer; Home 2,404K cache off |
| Label grey `--faint` #828B9E → #66708A | Computed 4.94:1 on white, 4.73:1 on the page ground; 142 elements on /about use it, 0 on the old grey |
| Portal entries read Staff login (nav button label, phone drawer); public footer columns carry no portal link | Headless on /, /about, /services after scrolling the footer in: Member portal 0, Member login 0 |
| Privacy and Terms carry five draft paragraphs each in a details block labelled draft for IAQ's approval | Headless on /policies: Privacy tab 1 block, Terms tab 1 block, other four tabs untouched; screenshots in the session scratchpad |
| Checklist filed with the QA audit (31 fixed and ticked, 7 part done, 14 blocked); `qa.html` shows 31 done and 111 of 156 check results | Served from 5178 after rebuild; counts read from the file |
| Launch probe's 404 test no longer trips on the postcode 40460 | Rerun on 5179: real pages false, concept routes and `/projects/999` true |
| Second pass, 11 Sep: 13 meeting items that were already built are ticked (facts, home and services structure, news, investors, offices, 2D diagrams); done items' action, effort and dependency columns rewritten in the past tense; QA page check boxes start ticked from a baked seed (111 results), a tick changed in the browser wins | Cross-check script: 52 items, 0 inconsistencies between qa-data.json, the checklist and qa.html; screenshots of every section and every fixed page in the session scratchpad |

## Done on 11 Sep, second pass (breadcrumb data, values, the seam)
| Change | Verified |
|---|---|
| BreadcrumbList data was still writing old hash addresses (`origin + '/#' + path`), dead since the router switch. Rewritten to real paths from the same SITE constant the canonical tag uses | Headless on the production build: 11 routes, 11 carry a list, 0 hash or malformed URLs |
| The list stopped at the parent, so a two-item trail was published for an eleven-page set. The page itself is appended for search engines; on screen the trail is unchanged | `/services/design` now reads iaqtechnology.com > /services > /services/design |
| Project pages had the visible trail but no data at all. `crumbLd()` is now shared by both templates | `/projects/0` and `/projects/1` carry a three-item list |
| P52, the six value diagrams that read alike: superseded. The ring replaced them, and each card carries its own photograph and its own mark | Headless on /about: 0 of the old diagrams in the DOM, 7 unique images in the section; screenshot at 1440 |
| The fab-to-industries seam, looked at rather than computed | The gradient is real but invisible: the WebGL canvas paints over it opaquely. What a visitor sees is a clean horizontal edge where the pinned stage ends and the white band begins. Acceptable as a section boundary; a true fade needs a mask on the canvas, which is a look change to the showpiece and is left for Bazil |
| Dead code check: the six isometric diagrams, `ValuesBoard`, `ValuesPlate` and `valuesArt` are unreferenced | Already tree-shaken: 0 occurrences in `dist`. Source left in place, nothing ships |

## Done on 10 Sep, QA pass (evening)
| Change | Verified |
|---|---|
| three.js deferred to the closing block; menu banners load on first open | Production: Shortlist 3,565K → 409K; Home 7,092K → 2,865K |
| 17 videos re-encoded, 30MB → 7MB (originals in _backups/videos-orig-0910) | Sizes logged; hero plays in the pane |
| Launch build with pruning, robots.txt, favicons, absolute og:image, async fonts, GA hook (VITE_GA_ID) | Headless on dist-launch: no bar, no ribbon, clean titles, 404 for concept routes |
| Facts unified (1995, 31 years, 250+, 1,050,000 m², 7 countries, Ireland on all globes) | grep clean; crawl text |
| Mobile globe 0×0 fixed; phone drawer sub-pages; type floor 11px; skip link first in tab order | Probe at 390; Tab → skip link → H1 |
| Route meta for 7 markets + Commitment; ESG title; unique project titles; heading spaces; footer heading order; unknown project id → 404 | Production crawl: no duplicate titles, no heading skips, meta on all routes |
| Services hub: repeated bullets removed, jargon expansions + glossary, Capabilities → Services | DOM: 8 abbr, 12 glossary rows, 0 bullets in the stage panel |
| Breadcrumbs on all sub-pages (PageHead) and project pages, with BreadcrumbList data | DOM on /services/design |
| Fab skip control; hero strip 'All seven markets'; market names unified; office photos re-assigned; Global presence prose names Ireland; consent line on the form | DOM and pane |

## Done on 10 Sep, client review (afternoon)
| Change | Verified |
|---|---|
| Founding year 1995 everywhere (was 1994), 31 years (was 32) | DOM text checks on About, History, Home, Contact; grep clean |
| Seven countries, Ireland placeholder office on Contact, Global Presence and the About globe | DOM: 8 office cards, Ireland chip, counters 7 |
| Homepage: news rail removed, industry band in its slot, fab band fades into it | Section order in DOM; computed gradient on `#fab` |
| Services hub: six services above the three business units; unit cards on photographs | DOM order, image srcs, screenshot |
| Nav: Services wing has a second column, Business units (EPC, EFM, Tools Hookup); wing widened | DOM: no clipped labels |
| News: lead story kept, filter grid and search removed, plain Earlier index (9 items) | DOM and screenshot |
| Investors: sample report block (read on page + PDF aside) behind the existing gate | DOM and screenshot, gate opened via session |
| Contact office cards carry representation photography, labelled | Screenshot |
| Vision and Mission back on the 2D drawings | Screenshot |
| Portal IAQ brief: founded 1995, seed bumped to `bm_iaq_pages_10sep` | grep |

## What is still missing, measured 11 Sep
`node tools/audit-missing.mjs http://localhost:5178` counts every visible slot per page; `tools/audit-thin.mjs` and `audit-thin2.mjs` find content missing by absence rather than by a label. Last run: **85 visible slots across 25 of 35 public pages**.

| Page | Slots | What IAQ must send |
|---|---|---|
| /contact | 19 | Seven direct lines; street addresses for Penang, Sweden, USA, Ireland; office photographs (8 cards are labelled representation) |
| /policies | 10 | Four policy texts; approval or replacement of the two Brand Method drafts |
| /exhibition | 7 | The corporate film, the 30-second loop, the cleared project list |
| /services + unit pages | 12 | EPC and EFM questionnaire answers; Tools Hookup Section D |
| /about/leadership | 5 | CEO name, board, C-suite, management, portraits (4 of 5 cards empty, 0 names on the page) |
| /projects/N | 5 each | Narrative, dates, cleared photography, client quote for all 18 |
| /markets/N | 1-2 each | One sector figure or flagship reference per market |
| /about/esg | 2 | Energy-savings evidence, certificate artwork |
| /about/commitment | 0 labelled | Six certificates are named on the page; zero files are attached |
| /news | 0 labelled | 20 article pages exist as shells with an honest note; bodies are still on the old site (2 outbound links remain) |
| /careers | 0 labelled | 16 roles carry title, location and department only; no descriptions, no culture section |

Clean, nothing outstanding: /about, /about/history, /services/design, /services/commissioning, /markets, /projects, /shortlist.

## Open, by owner
| Owner | Item |
|---|---|
| Nabilah | Ireland office details; confirm office list (Discovery names France, build shows Sweden and USA); updated EPC/EFM questionnaire; history copy through 2026; project descriptions (60+); ISO certificates and policies; case studies PNC check; engineering review of the 3D; piping legend concerns list |
| Bazil | Exhibition proposal (11 Sep); hookup contingency proposal (11 Sep); timeline summary; brand strategy for Monday 14 Sep; project description format to Nabilah; careers reference links and an IAQ example; case study screenshots to WhatsApp |
| Shazwan | Brand book signage links (11 Sep); Canva links for profile v3 and slides |
| Azwan | Updated character and walking walkthrough (11 Sep); 3D links for the portal tab |
| Haydar | Portal 3D tab; project description pages once details arrive; shooting plan with Fardiha (11 Sep) |
| BM build | EPC and EFM pages from the new questionnaire; careers culture section once HR agrees; services vs business units order once Shazwan confirms |
| Host / launch config | Apply the rewrite rule (see Host requirement); set `VITE_GA_ID` and `VITE_ENQUIRY_ENDPOINT` at build time; Search Console verification needs IAQ's Google account |

## Decisions waiting on Bazil
Router, contrast and the portal label were taken on 11 Sep under the instruction to fix everything; each is reversible in one file (`src/main.jsx`, `src/styles/base.css`, `FooterNav.jsx` and `Nav.jsx`).
| Item | Options |
|---|---|
| Homepage scrub length (P10) | Keep 1800vh with the skip control, or shorten to about 900vh |
| Markets vs Industries (P20) | Keep 'Markets' in the nav or rename to the client's word |

## Not verified by eye
The fab-to-industries seam has now been looked at (11 Sep, headless at 1440 with the scrub landed): see the second-pass table. The policy draft blocks were checked by headless screenshot, not in the browser pane. Real-path routing is verified on the Vite preview server only; the production host's rewrite rule has not been exercised, and until it is, a hard reload on any deep link is untested in the real environment.

The browser pane reports itself hidden in this environment, so it throttles timers and freezes animation. Every visual check in this handover was taken in headless Chrome instead.

## 15 Sep 2026, 04:40 to 05:00 (Websites workspace session, Bazil reviewing /careers/culture live)

| Done | Files | Backup |
|---|---|---|
| Culture page design pass FINISHED: the mid-edit stop had left 26 classes with no CSS (Photo frames `cu-fr/cu-mo/cu-cap`, `cu-cards3/cu-card*`, `cu-meta`, `cu-sub`, `cu-uni-intro/list`, `cu-hero-copy`). Rules appended at the end of culture.css; the two photo award tiles were empty because the `Photo` wrapper had no absolute frame rule | src/styles/culture.css | src/_backups/culture-finish-0915/culture.pre-finish.css |
| "What IAQ looks like" is no longer tabs: three moments in a 2 + 1 grid (`.cu-moments`, `.cu-mt`, third card `.is-wide` spans both columns) per Bazil ("2 column top, 1 column bottom"); tab state, auto-advance and the tab CSS removed; the meta line now has a middle dot between date and place | src/pages/Culture.jsx, culture.css | src/_backups/culture-finish-0915/Culture.pre-finish.jsx |
| University rows: grid re-cut for the new three-part markup (picture, text with date, arrow) | culture.css | same |
| Careers wing restored to the full version (Open roles by department with live counts, Life at IAQ rows) per Bazil ("I like the previous full one"); count in a tint chip, all-roles row as the column foot | src/components/Nav.jsx, styles/base.css | src/_backups/nav-fullwing-0915/Nav.pre-restore.jsx, Nav.pre-nothumb.jsx, base.pre-nothumb.css |
| Every wing row lost its photo thumbnail (Bazil: "remove pictures, icons only; left part can have picture and icon"): units, life and markets rows carry the red mark only; the row photo still swaps into the lead panel on hover; markets list template is three columns plus arrow | Nav.jsx, base.css | same |

Verified in the Browser pane at 1440: Careers, Markets and Services wings open with icons only; culture sections (safety, moments, training, voices, care, universities) render styled. At 390: no horizontal overflow on /careers/culture (scrollWidth 390), sections stack to one column. Wing screenshots must be taken with transitions disabled (`.nav *{transition-duration:0s;animation-duration:0s}`) and the hub opened by dispatching `mouseover` on `.nav-has`; the pane's `hover` action does not fire React's onMouseEnter reliably.
| Wing icons out of their boxes (Bazil: "can we not put icons in boxes", "icon on the right too small or too thin"): no plate behind any wing mark, marks at 24px with a 1.6 stroke, red on the units, markets and life rows, ink (red when lit) on the cycle and roles rows; the roles count is a plain number | styles/base.css (last block) | src/_backups/nav-fullwing-0915/base.pre-nothumb.css |

Checked after that at 1440 (Careers, Services, Markets wings), 768 and 390 (/careers/culture: no sideways scroll, one column). Viewport reset to desktop.
| Markets wing: the "Measured by" and "Class or spec" columns and their head row are gone (Bazil: "no need the 2 other column"); rows are mark, name, arrow. The measured-by and spec data stay in the hub config, unused | components/Nav.jsx, styles/base.css | src/_backups/nav-fullwing-0915/Nav.pre-nomcols.jsx |
| Markets wing width 1060px to 640px (`.nav-mega.sets.one:has(.nm-mlist)`), since the list is now name only | styles/base.css | same |
| Card removal tried and REVERTED (Bazil: "that's worse", "revert"); the wing lists keep their cards, stripes and tinted units panel. Row arrows removed from every wing list (Bazil: "no need arrow") | styles/base.css (last block) | same |
| About wing is a set like the others (count header, three red-mark cards, still exactly the three items), 720px wide (Bazil: "this dropdown looks saddest compared to others") | components/Nav.jsx, styles/base.css | src/_backups/nav-fullwing-0915/Nav.pre-aboutset.jsx |
| Fab showpiece: the active stage's own red bar removed (it doubled the spine hairline); control strip without its top rule, skip button without a border, hints at full strength (Bazil: "no lines and make it more visible", "why got double line") | styles/fab-assembly.css (last block) | src/_backups/nav-fullwing-0915/fab-assembly.pre-lines-0915.css |

## 15 Sep 2026, 05:10 to 05:40: the three business-unit pages rebuilt (Bazil: "a lot better, more premium, detailed but snappy, no repetition, flow easy to understand, very good visuals and animation, not lame")

| Done | Files | Backup |
|---|---|---|
| New template `UnitPage.jsx` + `unit.css` (prefix `un-`) for /services/epc-construction, /services/tool-installation, /services/energy-management. One flow: hero with three facts, definition beside a drawn diagram, the two ways it is bought (EPC and Energy), a scroll-driven sequence rail (sticky step card on the left, the list on the right lights the step nearest the viewport centre), scope as marks, why owners choose it, proof, then the site's Related and ask. No hairlines, no bordered boxes, no mono kickers | src/components/UnitPage.jsx, src/styles/unit.css, src/pages/CapEpc.jsx, CapTool.jsx, CapEnergy.jsx | src/_backups/unit-pages-0915/ (the three pages, CapabilityPage.jsx, capability.css) |
| `UnitArt.jsx`: one animated SVG per unit (one-contract fan for EPC, six service drops landing on a tool for hookup, bill before and after with IAQ funds for energy). Strokes draw with pathLength, nodes pop, one pulse keeps travelling | src/components/UnitArt.jsx | new |
| Copy: each unit gained three sourced facts and (EPC, Energy) two model cards; the paragraphs those cards repeat are no longer printed (left in the source as comments). The "Supplied by IAQ" slot is no longer printed on these pages; what IAQ still owes is unchanged: EPC (FAQ row, fast-track option, which references were EPCC or EPCM), Hookup (IAQ's own sequence, scope boundary with the equipment maker, sectors), Energy (the "up to 30%" claim, references) | same | same |
| Process Critical Utilities (/services/process-critical-utilities) still runs on CapabilityPage; not in the brief | | |

Verified in the Browser pane at 1440: all three pages render with no console errors; sticky sequence tracks scroll; diagrams draw on entry. Phone pass below.
| Second cut the same night (Bazil: "this is a very bad looking visual", "most sections are bad presentation"): the three diagrams redrawn as filled blocks (ink and red, white chips, 13 to 24px type, 3 to 4px connectors) instead of thin outlines; a full-bleed photo band with the unit's claim (`pull`) between the sequence and the scope, each page with its own second photograph (`band`); the "why" beats as white cards with a red index. The step reveal moved from the `li` (React rewrites its className on every step change and wiped the `in` class) to the button; the reveal sweep runs on the scroll event itself with a 2.6 s failsafe, not on rAF | UnitArt.jsx, UnitPage.jsx, unit.css, the three pages | same |

The sideways offset in Bazil's hero screenshot could not be reproduced: at 1440 the page's scroll width equals its viewport (1425 at zoom 1.12); the only elements past the left edge are the footer 3D wordmark layers by 2px, which predate this work.
| Third pass (Bazil: "keep improving", then "this looks very bad, the sizing, visual and stuff", "premium"): the hero is a SPLIT, copy and fact tiles on the ink ground beside a crisp 4:3 photograph panel, no scrim wash, no viewport-height band, no nav offset (the nav is sticky and in the flow; the earlier `calc(var(--navh) + ...)` doubled it and left 110px dead at the top). Headline capped at 60px. A comparison ledger under the model cards (`compare` prop: label column plus one column per model, tint rows, on phones each cell carries its model name). Hookup gained a "What arrives, what leaves" pair plus ledger. Hero integers count up once; the sequence icon pops on each step | UnitPage.jsx, unit.css, the three pages | same |
| Higgsfield visuals for the three unit pages (Bazil: "add whatever visual you need from Higgsfield"): six stills with GPT Image 2 at 2k/high (6.5 credits each): `public/assets/units/hero-{epc,hookup,energy}.jpg` (4:3, 1800px) as the hero panels and `band-{epc,hookup,energy}.jpg` (16:9, 2200px) as the claim bands. Every one carries the "Representation" tag the office visuals use. The old banners stay on disk. Scratchpad keeps the 2k PNG originals for this session only | pages, UnitPage.jsx (rep prop, un-rep tag), public/assets/units/ | prior banners untouched |
| Banner, fourth pass (Bazil: "too much to read at the top, proper navigation is fine", "make the banner look professional and premium and amazing"): no breadcrumb and no unit line above the headline (the BreadcrumbList JSON-LD stays); the photograph bleeds to the right edge of the screen and wipes in from the right (clip-path), the headline steps up to 68px, the fact tiles sit on the photograph's foot line. Hero panel accepts `image.video` (silent loop, the still as poster; hidden under reduced motion). Energy carries `hero-energy.mp4` (Seedance 2.5 image-to-video from the still, 5 s, 720p, silent, 32.5 credits) | UnitPage.jsx, unit.css, CapEnergy.jsx, public/assets/units/hero-energy.mp4 | same |
| All three hero panels now run a silent 5 s loop generated from their own still (Seedance 2.5 image-to-video, 720p, 4:3): `hero-epc.mp4`, `hero-hookup.mp4`, `hero-energy.mp4` in public/assets/units (1.4 to 1.5 MB each). The still stays as poster and fallback; reduced motion shows the still only. The EPC clip needed a resubmit with `declined_preset_id` after Higgsfield offered its "IN THE DARK" preset instead of running the job. Credits: 39 for the six stills, 97.5 for the three loops | CapEpc.jsx, CapTool.jsx, CapEnergy.jsx, public/assets/units/ | |

## 15 Sep 2026, 05:50 to 06:05: hookup visual swapped, final QA, developer bundle

| Done | Files | Backup |
|---|---|---|
| Hookup hero: the wrench shot and its loop were rejected (Bazil: "the guy playing a screw"); replaced by a no-people still of a connected process tool in a bay (GPT Image 2, 6.5 credits); `hero-hookup.mp4` deleted. Hookup has no loop; EPC and Energy keep theirs | CapTool.jsx, public/assets/units/hero-hookup.jpg | |
| QA sweep `tools/qa-units-0915.mjs` (headless, five widths 390 to 1920, the three unit pages and /careers/culture): no console or page errors, no failed requests, no broken images, sideways overflow 0 everywhere, hero headline left edge equals the nav logo's at every width. Remaining flags are expected: momentum wrappers clipped inside their frames, the Culture photo marquee, the site-wide 10 and 10.5px meta lines in the ask band and Related strip | tools/qa-units-0915.mjs | |
| Launch build rebuilt (`npm run build:launch`, pruned 40.4 MB) and served from `dist-launch` for a headless check of the unit pages, Culture and home | dist-launch/ | |
| Developer bundle: `_handoff/IAQ-website-publish-2026-09-15.zip` (120 MB, 1047 files): `site/` = dist-launch (upload its contents to the web root, SPA fallback to index.html), `source/` = src, public, tools, index.html, package files, vite configs, this file; `DEPLOY.md` at the root explains both. Excluded: node_modules, every _backups folder, .bak files, public/web1 and public/competitors | _handoff/ | |

## 15 Sep 2026, evening: finish pass (Bazil: "finish the website, what's not done")

Audit first: `tools/audit-missing.mjs` (119 visible owed-content slots on 27 of 35 pages), `tools/audit-crawl.mjs` (36 public routes x 2 viewports: 0 console errors, 0 failed requests; the crawl stops at /fab, a dev-only lab), the checklist's 47 unticked items (all but three blocked on IAQ or on other people), and the brief of the agent stopped mid-edit on 15 Sep (its Contact job was done, its News job was superseded by the News rebuild, its emphasis job was never started).

| Done | Files | Backup |
|---|---|---|
| LAUNCH GATE. `src/lib/launch.js` exports `LAUNCH` (MODE=launch, or `?launchview` on any dev URL, sticky per tab) and `owed()`. The launch build hides every owed-content block and chip (`html.is-launch` rules at the end of base.css: pg-slot, pd-chip, pd-slotline, pd-rec, off-slot, off-ph-tag), drops Investors, Exhibition, Leadership and the staff portal from the routes, the sitemap, Related strips and in-page links, removes the example download gate on Services, shows Contact offices without placeholder addresses (phone via HQ), and turns Policies into the public page: Privacy and Terms read in full, the certifications, no tracker. Verified with `tools/probe-launchview-0915.mjs`: owed text visible on public routes 0 (only "Representation" captions remain, by design); dropped routes return the 404 page | lib/launch.js, main.jsx, base.css, Contact.jsx, Policies.jsx, gated.css, GatedDownload.jsx, ServicesHub.jsx, Esg.jsx, Related.jsx, Footer.jsx, Nav.jsx, FooterNav.jsx, tools/sitemap.mjs | src/_backups/finish-0915/ |
| Forms: with no `VITE_ENQUIRY_ENDPOINT`, the launch build opens the visitor's email app with the enquiry written out to bd@iaqtechnology.com.my (`mailtoFor()` in lib/enquiry.js) instead of the review build's "nothing was sent" note. Tested on /contact?launchview: the confirmation shows | lib/enquiry.js, Contact.jsx, Campaign.jsx | same |
| Unbroken emphasis rule site-wide: `h1 em, h2 em, h3 em{white-space:nowrap}` above 640px (end of base.css). 11 titles wrapped before (every PageHead h1 among them, plus Careers, Contact banner, Global Presence globe); see the probe line below for after | base.css, tools/probe-emwrap-final-0915.mjs | same |
| Process Critical Utilities moved onto UnitPage with its own drawn diagram (`pcu` in UnitArt: five utility blocks run as one system into the point of use), hero facts, the band, no slot | CapPcu.jsx, UnitArt.jsx | same |
| Article pages: the one-line "Related market" block repeated on all 70 articles removed; "Selected work from the registry" and its internal note became "More of IAQ's work" | Article.jsx | same |
| Checklist pn10: client signage removed from the project photos: SilTerra (prj-002), Texas Instruments (prj-004), MEMC (prj-005) by OpenCV inpainting on letter masks; SVOLT (prj-008) with a GPT Image 2 edit of the photograph (6.5 credits). prj-015 no longer shows a client | public/assets/projects/ | src/_backups/finish-0915/projects/ |
| Checklist d3: the fab walkthrough's pop-up callouts are off; a fixed colour key for the eight systems sits top right and lights with the rail (on phones only the active row shows). Click-a-part naming stays | FabAssembly.jsx, fab3d.js, fab-assembly.css | same |
| Checklist ticked with notes: d3, pn10, m9b | public/checklist.html | src/_backups/finish-0915/checklist.pre-finish.html |
| DEPLOY.md at the project root (and in the zip): go-live requirements (Privacy and Terms approval, enquiry endpoint, GA id), host rewrite rules, how launch differs from review | DEPLOY.md | |

Still open, not buildable by BM: every blocked checklist item (IAQ content: office addresses and lines, policies, certificates, board names, project narratives, History year list, Tools Hookup section D, the updated EPC/EFM questionnaire; decisions: services vs units order, "no fiem", the repeated section at 15:58, the weak section at 16:02; 3D items d1, d2, d4 to d7 with Azwan and Haydar; Bazil's own ow1 to ow9).
| Site search filters the dropped pages in launch (data/search.js); the prototype passcode is compiled out of the launch bundle (lib/cms.js, it only survives as dead text in an unreachable Portal chunk and no longer logs in) | data/search.js, lib/cms.js | src/_backups/finish-0915/ |
| Emphasis probe after the rule: 0 split phrases and 0 overflow on 37 routes at 1920, 1440, 1100, 768 and 641 | | |
| Launch bundle rebuilt and checked on the preview server: 21 routes at 1440 and 390, 0 errors, 0 failed requests, 0 overflow, 0 links to dropped pages; the dropped routes return the 404 page; owed text visible 0 (only "Representation" captions) | dist-launch/ | |
| Developer bundle v2: `_handoff/IAQ-website-publish-2026-09-15-v2.zip` (120.5 MB, 1051 files) plus five parts under 28 MB and JOIN-THE-PARTS-v2.txt, sent to Bazil. Supersedes the morning zip | _handoff/ | |

## 16 Sep 2026: the two values sections (Bazil: "can u make this look better and work better", "where are the visuals or animation etc", "just number normally")

| Done | Files | Backup |
|---|---|---|
| CULTURE, `#cu-values`. The six scenes had blanked: they shared one clock and the fade keyframe ended on opacity 0, so every card went out together and stayed out. The keyframe now dips and returns, and each card runs on a negative delay (`--vmi`), so the six are permanently out of phase. The V·01 style codes are gone: the card carries a plain 1 to 6, large and faint, in the panel corner | ValueMotion.jsx, value-motion.css, Culture.jsx, culture.css | |
| CULTURE on phones. The `@media (max-width:640px)` rule pulled `.cu-vc-top` out of flow and pinned it to the card corner, which was written for the 66px icon these cards used to carry. Against a full scene panel it put the picture on top of the words and cut every title. The panel is in flow now, a third of the card wide, holding its own 3:2 so the scene is never squashed; the number falls to the card's corner and the title reserves room for it | culture.css | |
| ABOUT, "Six values, held on every site." The ring is replaced by a carousel: one value held at the front, the rest standing behind it in perspective. A card's place is a function of one number, its offset from the front, so the front card is always clear of the others, always still, and never clipped. The ring's faults are all gone: no overlap, no cut titles, no centre billboard colliding with the cards, and the cards are numbered 1 to 6 instead of V·01. Cards behind are set back by a white VEIL, not by opacity: faded cards let you read the card behind straight through the one in front. Six seconds per value, held while the pointer, a finger or the keyboard is on it, while the tab is hidden and while the section is off screen; any move you make restarts that six seconds. Drag, swipe, click a card behind, arrows, numbers, arrow keys. Reduced motion renders the typographic index instead. ValuesRing.jsx stays on disk as reference, unmounted | ValuesCarousel.jsx (new), values-carousel.css (new), ValuesGrid.jsx | ValuesRing.jsx kept |
| Measured, 390 to 1440: nothing overlaps the front card on phones and tablets, at most 12 visual px behind it on desktop; 0 clipped titles or lines, 0 sideways overflow, 0 console errors. Behaviour checked in the browser: number, arrow, card click, drag, hover hold, auto advance and arrow keys all land on the right value; reduced motion falls back to the six-item index | tools/probe-values-0916.mjs, tools/probe-values-act-0916.mjs, tools/probe-culture-values-0916.mjs | |
| Site crawl after the change (`tools/audit-crawl.mjs`, 40 routes at 1440 and 390, 90 captures): 0 console errors, 0 failed requests, 0 broken images, 0 sideways overflow. The dead `.vr-*` ring rules were deleted from values-grid.css rather than left to ship | tools/audit-crawl.mjs, values-grid.css | src/_backups/values-0916/ |

Still open for Bazil: the developer bundle in `_handoff/` is the 15 Sep v2 zip and does not contain these two sections; say the word and it gets rebuilt and re-split.

## 17 Sep 2026: the home dot world and the cycle seam

| Done | Files | Backup |
|---|---|---|
| The world stands 15% smaller (Bazil: "reduce size of world by 15%"). Done by moving the camera back, 4.05 to 4.66, not by scaling the group, so the arcs, markers and label chips keep their proportions and the host box and the layout around it do not move. Measured off the render: the dot cloud is 633px wide before, 533px after, at a 717px host. The no-WebGL fallback circle drops with it, 0.42 to 0.357 of the box. It is a desktop instruction: below 901px the camera stays at 4.05, because the phone globe already sits in a 300px box and the full-size label chips would cover it | scenes/home.js | src/_backups/values-0916/home.js.pre-globe-0917 |
| The delivery cycle now keeps room under it (Bazil: "increasing spacing"). The section carried an inline `paddingBottom:0`, so the loop field ended flush with the black fab band and the last station label sat 16px off the edge. The inline zero is gone and `.lpx-band` carries `clamp(40px,4.4vw,72px)`: 63px of white under the ring at 1440, the site's standard 26px on phones | Home.jsx, home.css | |
| Checked after both: home page at 1440 and 390, 0 console errors, 0 page errors, 0 sideways overflow | tools/probe-globe-0917.mjs | |
| The 15% moved from the camera to the BOX (Bazil: "reduce just a bit the spacing"). Standing the camera back had shrunk the world inside a box that kept its old height, so the section went on reserving that room and the white around the globe grew. `.globe-host` is 545px instead of 700 and the camera is back at 4.05: the world measures 539px against 633 before, the 15%, and the glance section is 106px shorter. Phones are untouched, the box there was already 300px | scenes/home.js, home.css | |
| The world went blank in Bazil's tab with Chrome's broken-image square in its place: the canvas had lost its GL context, which a browser can do at any time (GPU process restart, a long-lived background tab, or a page holding several contexts crossing the browser's cap and dropping the oldest). A reload brings the live world back, and losing the context no longer costs the world at all: the scene REBUILDS on a fresh canvas, which gets a fresh context, and the real globe returns within a frame or two. The first cut drew a flat grey world instead and Bazil was right about it ("why soo lame"), so the flat drawing is now only for the cases with no way back: no WebGL at all, or a GPU that drops us three times. Two supporting fixes: the window and observer listeners are wired once, so a rebuild cannot leave two drag handlers turning the world twice as fast, and the frame checks the renderer, since it is null for the moment between the loss and the rebuild and the observer can restart the loop inside that window. Forced the loss with WEBGL_lose_context to prove it: rebuilds 1, chips back to 7, live context, still turning, 0 page errors. `window.__globeQA()` reports vis, raf, renderer, tags, rebuilds and flat for probes | scenes/home.js, tools/probe-globe-loss-0917.mjs | src/_backups/values-0916/home.js.pre-globe-0917 |
| Bug sweep on Bazil's word ("check for bugs check the website"): `tools/audit-crawl.mjs`, 45 routes at 1440 and 390, 90 captures. 0 console errors, 0 page errors, 0 broken images, 0 missing alt text, 0 sideways overflow. Two flags, both chased down and both clear: `net::ERR_ABORTED` on hero-epc.mp4 and hero-energy.mp4 is the browser cancelling a duplicate range fetch, the videos reach readyState 4 and play; and a navigation timeout on the home page is `networkidle0` waiting on the streaming loop video, not a page fault. Measured it with today's scenes/home.js and with the pre-change backup: 25.5s and 20.7s before, 25.3s and 17.4s after, so it is not from this work. DOMContentLoaded and load are 418ms, and without scrolling only ONE mp4 is fetched: the other five cycle loops carry preload="none" | tools/audit-crawl.mjs | |
| The services cycle: "TOOLS HOOKUP FEEDS THE NEXT DESIGN" moved into stage 6 (Bazil drew an arrow from the caption to the Hookup node). The node's sub-label used to read "Tools Hookup" under a title that already said Hookup, and the line that earns the loop floated under the diagram on its own. The line is the sub-label now, in red, and the caption element and its rules are gone. Two consequences handled: the canvas came down from 368 to 322, since the bottom 46px were the caption's room and would have been a dead band, and the section lede lost "Tools hookup feeds the next design", which would otherwise print twice on one screen. Checked at 1440, 1100, 860 and 390: six sub-labels correct, 0 collisions between a label and any disc, 0 stray captions, 0 sideways overflow, 0 console errors, and the red return wire measures y 76 to 256 inside the shorter canvas, so nothing is clipped | CycleFlow.jsx, cycle-flow.css, ServicesHub.jsx, tools/probe-cycle-0917.mjs | src/_backups/cycle-0917/ |

## 17 Sep 2026, afternoon: the client's feedback deck

Bazil sent IAQ's annotated deck (`IAQ WEBSITE FEEDBACK .pdf`, one FigJam board, 81 screenshots and 40 notes) and said to make the changes. Every note is now an item in the Amendments tab (`public/checklist.html`, section "Client feedback · 17 Sep PDF", 26 items) so the client can watch it close.

| Done | Files | Backup |
|---|---|---|
| Enquiry email is business@iaqtechnology.com.my, in 15 files: the footer, every page's contact row, the contact page and the mailto the launch build writes when no endpoint is set | 15 src files | |
| History: the two stacked headers merged into one; "The arc runs outward" removed (India and the United States are already on the timeline under 2025, so it repeated the record above it) with its way through to the registry moved under the records; the "Where this goes next" strip removed and replaced by what the client asked for instead: four milestones now link straight to the registry entry the registry actually holds, 2009, 2015, 2020 and 2022 | History.jsx, data/history.js, HistorySpan.jsx, history-span.css | src/_backups/cycle-0917/ |
| News: "Earlier, by topic" and the related strip removed. Latest carries the whole record now and opens a page at a time, so the removal orphaned no story | News.jsx, news.css | same |
| Services: the three business units open the page; the stage description panel under the cycle and the "Six services" card grid are gone (the client: "These 2 section have the same content"); the unit cards are a name, a sentence and the way in, with the spec rows and scope lists left to the unit pages; the glossary moved up with them. Every service page is still one click away, from its own stage on the diagram | ServicesHub.jsx | same |
| Menu: Business units before Six services, the order the page now runs in | Nav.jsx | same |
| About: one bold statement with the second paragraph descriptive under it; Vision and Mission rebuilt as two boxes side by side, each carrying its own photograph, cool at rest and full colour on hover, replacing the two canvas drawings the client said were "not up to our expectation" | About.jsx, VisionMission.jsx, about.css | same |
| Home: the fab showpiece holds still while the nine systems land on it. The per-stage push-in is off (FOCUS_PUSH 0.34 to 0) and the eye's travel to each system's level is damped to a quarter (LEVEL_MOVE 1 to 0.25). The pull-out at Overall, the one move the client asked to keep, is untouched. Both are named constants in scenes/fab3d.js, so the feel is two numbers | scenes/fab3d.js | same |
| Careers: the client asked which way applications should run. Our answer, built: one page per vacancy at /careers/role/:ref, carrying the description, the four reasons to join and the application form (name, email, phone, nationality, available from, CV to 30MB, notes). A vacancy now has a link HR can post, a page a search engine can index, and room for the upload that does not fit in an accordion row. The list's dropdown keeps the summary and sends the candidate there, with the direct email beside it. The 16 roles are in the sitemap | RolePage.jsx (new), role-page.css (new), main.jsx, scenes/careers.js, careers.css, tools/sitemap.mjs | |
| Careers: the working culture block, in the client's own four points, kept in data/careersWhy.js so the careers page and every vacancy page read the same four. The blocks they marked KIV are untouched | Careers.jsx, data/careersWhy.js (new), careers.css | |
| The Tools Hookup mark was clipped by its disc: its artwork ran to the edges of the 256px canvas while every other mark had a 38px margin. Re-rendered to match the set | public/assets/cycle3d/hookup-ic.webp | src/_backups/marks-0917/ |
| Checked after all of it: /, /about, /about/history, /services, /news, /careers and a role page at 1440, 0 console errors, 0 page errors, 0 sideways overflow. The checklist itself renders with the new section at 18 of 26 ticked | | |

Open from the deck: the header video (the SharePoint Videos folder holds nine files and none is named as the header clip, so which one is a question for IAQ), the job descriptions HR owes, the upload endpoint the application form needs, and more colour on About beyond the two new boxes.

### Double check, same evening

| Check | Result |
|---|---|
| The deck, note by note | 25 notes accounted for: 20 done, 1 part done (About colour), 4 waiting on IAQ (the header video file, the job descriptions, the upload endpoint, and the PCU questionnaire) |
| Every changed page, measured not eyeballed | home carries one enquiry address and it is business@; About has 1 bold line, 1 descriptive, 2 value boxes, 0 old canvases; History has no arc section, no strip, 4 project links, one header; Services opens on the units with no six-card grid and no stage panel; News has no topic section and no strip; Careers has the 4 culture cards and 16 role links; a role page prints all 7 form fields |
| Site crawl, 45 routes at 1440 and 390 | 90 captures: 0 console errors, 0 page errors, 0 broken images, 0 missing alt text, 0 sideways overflow |
| The launch gate | The vacancy pages and the careers dropdown show no owed text under `?launchview`: the labelled "supplied by IAQ HR" slot is a review-build thing, and the public build prints a plain line telling the candidate where the description is. Hiding it outright would have left a vacancy with nothing under its title. A bad reference (`/careers/role/nope`) returns "That role is not open" rather than an empty page |
| The fab camera, measured rather than photographed (`tools/probe-fabcam-0917.mjs`, the scene renders at seconds a frame headless) | Camera distance across the nine systems: 86.9 held for five samples, then a single slow settle to 76.2 which then holds. No per-stage in-and-out at all. Overall pulls out to 228.9, the one move the client kept. Set LEVEL_MOVE to 0 in scenes/fab3d.js if even that settle should go |
| Builds | `npm run build` and `npm run build:launch` clean; the sitemap carries the 16 vacancy pages |

### 17 Sep, later: the rest of the client's deck (the unit pages), and the questionnaires

Bazil sent the pages of the deck that carry the EPC, Tools Hookup and EFM notes, which the first pass had not seen. Ten more items, cf27 to cf36 in the Amendments tab. Three of IAQ's own questionnaires were downloaded from SharePoint (EPC, Energy Management, SL Utility) and IAQ's live EFM page was read, because the client asked for both by name.

| Done | Files | Backup |
|---|---|---|
| The "Where this goes next" strip is off the unit pages (client: "Remove this page, too much interlink section, a bit messy") | UnitPage.jsx | src/_backups/units-0917/ |
| The scope chips merged into the lifecycle (client: "Can be use for the extension of project lifecyle, merge this information with lifecycle and remove this section"). Each stage now carries the part of the scope that belongs to it, as `covers`, and the standalone "What IAQ delivers" section is gone from all four unit pages | UnitPage.jsx, unit.css, CapEpc/CapTool/CapPcu/CapEnergy | same |
| "Why owners choose it" is six claims you can read at a glance, each opening to the sentence behind it on hover or click (client: "less wordy and more interactive way... simpler way") | UnitPage.jsx, unit.css | same |
| "Delivered this way" is subtler: three to a row, a flatter crop, the photograph held back until hover (client: "smaller image... not so into your face") | unit.css | same |
| The EPCC / EPCM ledger became a chooser (client: "Maybe can further design this section instead of listing in words form"). Pick the model and the page answers the five questions for it, with the other model's answer beside it in small type. The information stays, because it is the thing an owner has to decide | UnitPage.jsx, unit.css | same |
| Tools Hookup now carries the BU head's own four-phase process from the SL (Utility) questionnaire, section D: facilitisation, rig-in, hook-up, commissioning, each on its stage. The owed section D slot is closed there and on Process Critical Utilities, and the Services note now asks only for the move-in timeline, which the questionnaire does not give | CapTool.jsx, CapPcu.jsx, ServicesHub.jsx | same |
| EFM rewritten against IAQ's own live page and the Energy questionnaire: the four problems as their own block, the district cooling design concept, and the published "up to 30%" figure. The BU head's instruction is respected in the code and the comments: no client project and no achieved saving is named, so the KLCC figure on the questionnaire stays off the site. The slot now asks for the six questions clients ask, in IAQ's own wording | CapEnergy.jsx, UnitPage.jsx (pains), unit.css | same |
| The fab section printed "3D needs WebGL" at a browser that has it: a page holding several 3D scenes can be refused a context and given one a moment later. It retries once before falling back, and the fallback line no longer reads like a browser error | FabAssembly.jsx, fab-assembly.css | |

Open from this half of the deck: a 3D animation of the tool installation process (the BU head asked for one; the page carries the drawn diagram and the four phases today), and the answers to the six Energy questions.

### 17 Sep, evening: IAQ's own material out of the SharePoint share

Bazil asked for the shared images to go in. Three folder sets were pulled from `Desktop/Website 2027`
through his Chrome session; the provenance of every file is in `public/assets/iaq/SOURCES.md`.

| Done | Files | Note |
|---|---|---|
| IAQ's eight Revit system extracts imported and placed. Each unit page now carries "From IAQ's own model": the architectural model on EPC, the process utilities on PCU, the hook-up layout on Total Tool Installation, the ACMV model on Energy. This is the client's "include diagram if possible", answered with IAQ's own drawing rather than invented art | public/assets/iaq/bim-*.webp, UnitPage.jsx (bim prop), unit.css, the four Cap pages | |
| The claim band on EPC and on Energy carries IAQ's own drone photograph of a delivered plant, in place of the generated still. The Representation tag is now per image (`bandRep`), so a real photograph is never labelled a representation while the hero still is | public/assets/iaq/plant-dusk-*.webp, UnitPage.jsx, CapEpc.jsx, CapEnergy.jsx | |
| HQ exterior, site office interiors and an aerial of a build in progress imported, not yet placed | public/assets/iaq/ | for Contact, Careers and Culture next |
| Held back: the ten Hasegawa perspectives carry the client's logo on the building. Every other project photograph here has client marks removed, so they need IAQ's clearance | | cf38 in the Amendments tab |
| Still downloading when this was written: Cleanroom Photos (54), Site Photos (71), Photos from past event (51) | | cf37 |

## 17 Sep 2026, late afternoon: the deck verified, the share unpacked, IAQ's photographs and certificates placed

Bazil: "have u done this?" (the annotated deck), then "just take control", with the two OneDrive zips and two HEIC photos.

| Done | Where | Note |
|---|---|---|
| Every deck note checked against the live dev pages with `tools/probe-deck-0917.mjs`, not the checklist ticks | checklist `cfb` | All done except: header video (which file), About colour (in progress), JD write-ups from HR, the form endpoint, the Hasegawa clearance, and the diagram + stepper still being two sections on the unit pages (in progress) |
| Second zip recovered: it had stopped downloading at 5.5GB with no directory. Walked the local headers, read sizes from the data descriptors | `scratchpad/recover_zips.py`, files in `Client info/IAQ/SharePoint 2027 (17 Sep)/` | 58 Cleanroom Photos, 665 event photos. Missing entirely: Site Photos, Videos, Corporate Video, Company Profile, Business Model Info: re-download needed |
| Cleanroom photographs placed: EPC hero, Tools Hookup hero and hub card, PCU hero, Construction and Commissioning figures, Semiconductor market photo, menu tile and industry art, Tools Hookup claim band, Energy hero (drone plant) | `public/assets/iaq/cr-*.webp`, `SOURCES.md` | No generated stills and no Representation tags left on the four unit pages. Stock originals in `src/_backups/photos-0917/` |
| Revit extracts re-cut tight to the drawing from the 3840px originals (Bazil: "too small, need to zoom in more") | `public/assets/iaq/bim-*.webp` | all eight, the hook-up layout doubled in size |
| ISO 9001, 14001 and 45001 certificates published with number, dates and PDF | Policies cards, Commitment ISO items, `public/docs/certificates/` | Issued to IAQ Solutions Sdn Bhd by Intertek, valid to June 2029. Highwire 2026 badge on the award row. Client-named safety awards held (cf45) |
| HQ photographs on Contact (front) and Culture (aerial); event photographs on the Culture strip and the House of Love moment | `public/assets/iaq/hq-*.webp`, `events/*.webp` | captions restricted to what the folder, the banner or the file date says |
| In progress by two agents: the unit pages' diagram and step sequence merged into one cycle section with a scroll-built animation from the 116-frame model sequence; the About page colour pass | `src/components/UnitPage.jsx`, `src/pages/About.jsx` | backups in `src/_backups/unit-cycle-0917/` and `src/_backups/about-colour-0917/` |

Owed by IAQ after this pass: the five missing share folders (Videos decides the header clip), the CIDB G7 and Gold OSH 2024 certificate files, the policy documents, HR's job descriptions, the form endpoint, clearance on the Hasegawa renders and the client-named safety awards.

### 17 Sep, evening additions

| Done | Where | Note |
|---|---|---|
| About page colour pass verified: navy story band over the lithography bay, values on a navy field with IAQ's own photographs on every card, a photographic proof strip before the close | `src/pages/About.jsx`, `about.css`, `values-grid.css`, `ValuesCarousel.jsx` | cf8 closed; backups `src/_backups/about-colour-0917/` |
| Menus read as a hierarchy: the panel says Main page, set counts are sub pages only, section rows (department filters, How hiring works, Where people work, Overview) carry a tag instead of an arrow | `Nav.jsx`, `base.css` | cf47; backups `src/_backups/menu-levels-0917/`. Bazil: "sections are not pages" |
| Unit pages: the diagram and the step sequence merged into one cycle section (drawing pinned, stage lit under the eye); "From IAQ's own model" builds the facility as you scroll from a 60-frame cut of the 116-frame share sequence (4MB, lazy, still under reduced motion) | `UnitPage.jsx`, `UnitArt.jsx`, `UnitBuild.jsx`, `unit.css`, `public/assets/iaq/model-seq/` | cf32 and cf34 closed; backups `src/_backups/unit-cycle-0917/`; frames cut by `tools/model-seq-0917.py` |
| Launch bundle rebuilt and checked on a static server with history fallback (`tools/probe-launch-0917.mjs`): 13 routes render, no console errors, no 4xx, the certificate PDFs and the 61 model frames ship, owed-content slots and their wrappers stay hidden | `dist-launch/` (106MB) | deploy this folder, never `dist`; `DEPLOY.md` unchanged |
| Phone pass at 390 on Policies, Commitment, Culture, Contact, Services hub, Semiconductor, EPC: no overflow, no errors | `tools/probe-phone-0917.mjs` | |



## 18 Sep 2026, late: map lines, brackets, the button, the hero market rail

| Request (Bazil) | What changed | Where | Checked |
|---|---|---|---|
| "clearer, no overlapping" (relationship map) | Lines measured from the grid the SVG fills, not the outer frame. Only the lit chain is drawn; each card spreads its lines along its edge in the order of the other ends; a lit line is solid, so a dash only means "when the client asks" | components/codex/RelExplorer.jsx, styles/codex-parts.css | tools/probe-relx-0918.mjs: 0 off-edge ends, 0 lines through a card, 0 into the sentence box, 1440 and 1100 |
| "meaning, everything need to put bracket" | lib/abbr.js: first use gets "(meaning)" inline; slides are fixed frames, so an inline bracket is kept only if it spills nothing, else the short form goes on the slide's "Short forms" line (footer). Live parts (fab story, map, site mockups) carry their brackets in their own markup | lib/abbr.js, CodexSlides.jsx, Codex.jsx, FabStory.jsx, RelExplorer.jsx | tools/probe-abbr-0918.mjs: no block without its meanings; slide exporter overflow audit 0 on all 12 |
| "more professional button please" | .cta: sentence case, 14.5px (nav 14px, 40px tall), tight tracking, two-stop red with a top light and a soft red shadow, 1px lift on hover. Ghost and phone drawer buttons follow the type | styles/base.css (18 Sep block at the end) | tools/probe-cta-0918.mjs |
| "too unprofessional, need to be more dynamic" (hero market strip) | A glass rail over all seven markets: name, line, measured by, largest delivered (or class). Seven tabs with a filling bar; hover, focus or off screen holds it; reduced motion does not rotate | components/HeroMarkets.jsx, data/markets.js (moved out of MarketsHub.jsx), styles/home.css | tools/probe-heromkts-0918.mjs: constant height, rotates, holds on hover, no overflow at 1440, 1024, 390 |

Traps found:
- Slide CSS sets `span{display:block}` inside some cards, so an inserted bracket span stacked as its own line. `.ab-x` is forced inline.
- A bracket's glossary line must be reserved before measuring, or the slide body shrinks after the fit test.
- Never edit text nodes under React in live parts: SiteMock (.sm3), the fab story (.fs) and the map (.rx) are fenced off in lib/abbr.js.

Exports: public/codex/IAQ-Codex.pdf (31 pages, 6.9 MB), IAQ-infographic-set.pdf (12 pages), slide-0..11 png and jpg. Previous copies: _backups/codex-public-0918b.
Crawl: 94 captures, 0 errors. Launch build: no passcode, no portal or Codex code, codex folder pruned.
Backups of this pass: src/_backups/relx-0918, src/_backups/probutton-0918, src/_backups/heromkts-0918.


## 18 Sep 2026, later: no glow on the map, full Codex audit, copy made plain

| Request (Bazil) | What changed | Checked |
|---|---|---|
| "no glowing" (relationship map) | Every coloured blur removed from the map: cards outlined, lit cards tinted, the picked card filled, lines plain | tools/probe-noglow-0918.mjs: 0 glowing elements in the map |
| "check all section no bug no overlapping" | New audit tools/probe-codex-overlap-0918.mjs measures every line of text on /portal/codex at 1440, 1024 and 390 for text on text, text cut by its box, and text past the edge. Fixed: hook-up phases card clipped, "Commission" tile clipped, bracket spans picking up card padding | 0 overlaps, 0 cuts (the mock URL bar's ellipsis is intended), 0 errors |
| "no unclear explanation", "straight to the point, clear and detailed enough" | Rewrote the three buyer questions, decision 4, the four-ways and unit 2 slide subtitles, the "how it is bought" note, section 3's menu and band notes, "moments" lede; cross-check source codes (DV3, Q-SL...) now show the document's name; stale slide numbers fixed (profile: slides 8, 9, 10; booth: cover, 2, 9; Services page: 2 and 5); Print button in sentence case | text re-read; slides re-exported, none spill |

Open: the fab story's "Who does it" panel and the slides still carry soft glows; asked whether to remove them everywhere.
Backups: src/_backups/copy-0918c (codex.js, Codex.jsx, CodexSlides.jsx, SiteMock.jsx, codex.css, Portal.jsx), src/_backups/relx-0918/codex-parts.pre-noglow.css, codex-site.pre-audit.css.

### 18 Sep, later still: video tutorials (Bazil: "put some video tutorial also if there are")
- components/codex/Watch.jsx, data in data/codex.js VIDEOS. Section 1: three films for everyone. Section 2: nine tutorials grouped EPC, PCU & TTI, EFM. Thumbnail first, the youtube-nocookie player loads only on press; print shows titles and links.
- All 12 IDs checked on 18 Sep: oEmbed 200, embeddable (tools: curl oEmbed). IAQ has no YouTube channel. Munters' Morrow dry room film names IAQ as a consortium partner. CIDB's Builder of the Year 2024 page credits IAQ with Bosch's testing plant.
- FINDING: the home page's "IAQ film" (VUG1QFOCL2E in scenes/home.js) is Bosch Malaysia's opening film for its Penang site, not an IAQ upload. The live iaqtechnology.com.my hero video (PcKtMaJg7AQ) is a stock Tokyo aerial. Asked IAQ whether to keep the Bosch film labelled as IAQ's.
- Exporter fix: tools/export-codex-pdf-0918.mjs skips other-origin images in its JPEG swap (a canvas that draws a YouTube thumbnail cannot be exported). Codex PDF now 33 pages, 6.9 MB.
- Checks: tools/probe-watch-0918.mjs (0 players before a press, 1 after, 0 errors), overlap audit 0 at 1440/1024/390, crawl 94 captures clean, launch build clean.

### 18 Sep, last: the download is the WHOLE Codex (Bazil: "didnt i say i want to be able to download the whole codex page")
- Before: the PDF left out the Background, every closed panel (the six buyer requests) and the relationship map.
- Now: the exporter and the Print button open every panel first; Background prints on its own page run; the map prints as two tables (unit: bought as, services carried, only when asked, work; work: its systems); the fab story's print list carries each step's work and services; the picture headings print as a label on their first slide; slides print at 92% width so label and slide share a page.
- Button renamed "Download the whole Codex". The Downloads tab leads with "The Codex, the whole page" and four page previews (public/codex/codex-page-0..3.jpg, written by the exporter).
- Proof: tools/probe-pdf-whole-0918.mjs checks 669 headings and sentences of the live page against the PDF text: 666 present; the 3 absent are the fab story's "press play" line, the live panel's label (its content prints in the list) and one bracketed phrase the matcher cannot see through. PDF: 43 pages, 8.3 MB, one short page (the three-film link list).
- Backups: src/_backups/wholepdf-0918.

## 21 Sep 2026: home page pass on Bazil's notes (market row, the record, the ring, the closing band)

| Done | Files | Backup |
|---|---|---|
| Hero market rail simplified (Bazil: "this really looks bad, no need this complex", "but meaningful yes"). The glass panel, featured card, stat chips, timer and seven progress bars are gone. One sentence, one row of seven market links, and one line under it that says what the market being pointed at demands, in the Markets hub's own words | HeroMarkets.jsx, home.css | src/_backups/home-0921/ |
| "The group in numbers" rebuilt as `GroupRecord`: title "The record, in six numbers.", new lede, light grey ground, no boxes, each number on one line with a small drawing OF the quantity (a 1995 to today line, seven lights, three ISO badges, a seven-part ring, fifty squares of five, a hatched floor plate). It went through a night-sky cut with glass cards first; Bazil: "ui boxes are too much", "maybe background light grey", "dont over complicate things", "number and icons same line" | GroupRecord.jsx (new), group-record.css (new), Home.jsx | same |
| The world is a planet now: a dark body with a fresnel limb, an atmosphere, land lit brightest nearest the eye. It is interactive: the seven countries under it, and the chips on the globe itself, turn the world to that office the short way round and the dock names the city and entity. Left alone it tours the seven offices; the first touch ends the tour. Germany and India moved onto Dresden and Ahmedabad (they sat on Frankfurt and Bangalore, which IAQ never listed). `window.__globeFocus(i)`, `iaq:globe` event, `__globeQA()` now reports sel and touring | scenes/home.js | same |
| The delivery cycle ring's double line (Bazil: "find a way where the line doesnt get out and responsive"). Cause: the orbit was width:100% with a max-height, so on a wide short screen it stopped being square (1654x900 gave 760x612). Everything on the ring is laid out in percentages and masked with closest-side, so a non-square box makes ellipses, and the red arc rides a layer that turns: a turning ellipse over a still one. The width now takes the smallest of its three limits, so the box is square at every size, and the masks name `circle`. Measured square at 1654, 1440 and 1100 | home.css | same |
| The step dial's second red circle is gone: the pulse ring sat 2px outside the arc on every swap | home.css | same |
| The closing band rebuilt (Bazil: "why is this static and can you improve the structure and interactivity and call to action premium"). The ask leads at full size, and asks back: four answers (a new facility, a tool hook-up, an energy upgrade, not sure yet) rewrite the button and travel to the contact form, which opens with that service chosen (router state with sessionStorage behind it; a ?service= query did not survive the page's URL handling). Email has a copy action. The light follows the pointer. No boxes. Home, About, Projects and project pages dropped their inline copies for the shared component; Careers and Culture keep their own recruiting band. Contact gained the "Energy Facility Management" service option | ClosingBand.jsx, closing-band.css (new), Contact.jsx, Home/About/Projects/ProjectDetail.jsx | same |
| Checked: 12 routes, 0 console errors, 0 overflow, 0 broken images; globe pick verified (sel, touring off, dock text); footer choice verified to arrive on Contact | tools/probe-record-0921.mjs, tools/qa-spot-0917.mjs | |
| The record, refined the same day on Bazil's notes. "look a bit messy": the six drawings became one family, the same 88 x 22 slot, the same grey and stroke, no captions inside them, one red part each, and all six numbers now share their line. "one before was better but needs refinement... maybe particles are more refined": the dark planet, fresnel limb and atmosphere are gone; the world is a light particle cloud again, with nearly twice the land particles at two thirds the size so coastlines draw as edges, ink-blue nearest the eye falling to pale grey at the limb. Office picking, the tour and the focus ring are kept. "no need the bottom... no need detail like iaq group": the dock is the country, the city and "Every office"; the country row, the hint and the entity line are gone, and offices are picked on the globe. Chips are held inside the globe's box (the page edge was cutting "MALAYSIA · HQ") | GroupRecord.jsx, group-record.css, scenes/home.js | src/_backups/home-0921/ |

## 22 Sep 2026: ring visual, nav wings, About, Contact (Bazil's notes through the day)

| Done | Files | Backup |
|---|---|---|
| Ring centre visual was being CUT (Bazil: "no cutting the visual"). Two measured causes. (1) The per-clip zooms were sized off one frame at t=1.5s: over the whole loop the hookup cabinet spans 0.044 to 0.967 of the frame height, so zoom 1.15 cut 1.9% off its top and 4.3% off the slab's corner; commission and procure lost a hair off the top. (2) In construct the red beam is ABOVE the source frame for the first and last 2s of the clip, so the clip's own top edge sliced it. Fix: every zoom and origin re-solved from whole-window bounds (4% air top and bottom, inside the side feather's opaque core); hookup not zoomed; construct loops 2.73 to 8.533 (frames differ by 0.66 of 255, the beam still lands) and its still was recut at 2.73; hookup's grey vignette backdrop (217 to 222) lifted to white with its own filter. | styles/home.css, scenes/home.js (CLIP_WIN), public/assets/cycle3d/construct-still.webp | src/_backups/home-0922 |
| Ring smaller, visual may sit under it (Bazil: "make the circulating circle smaller and its fine to overlap", "reduce overall size", "reduce centre visual size just a bit"). Orbit 780px/68vh to 680px/60vh, --ins 6% to 10%, centre box 72% to 74%, `mix-blend-mode:multiply` on .lp-vis so the track hairline reads through the render's blank corners. | styles/home.css | same |
| Ring marks really move (Bazil: "i thought actual moving animation"). The whole-icon float is gone. The generator wraps the one meaningful part of each mark in `.mk-mv`: set square slides, crate is set down, crane winds its load, gauge needle runs up and settles, gear turns (45deg loop, 8 teeth, seamless), red link pulls home. | scripts_marks_build.mjs, data/cycleMarks.js (regenerated), styles/home.css mk* keyframes | same |
| Nav wings, fourth pass (Bazil: "too many boxes and not good animation", "box in a box is too messy", then on the first bare cut: "have line separation and put them nicely", "spacing etc"). One surface; hairlines and one grid carry the structure. Rows: bare line icon, name, line, level in words, hairline between rows, nothing shifts on hover. Services: three unit columns with hairlines, four level bands (mark, name, line, routes), then six services as six equal columns under one hairline. Opening: panel unrolls by clip-path, rows inside 0.6s. It is one appended block in base.css that overrides the 18 Sep pass. | styles/base.css (block "the wings, fourth pass") | src/_backups/nav-0922 |
| About (Bazil: "wtf is this what client wanted", "better not be keep repeating", "why information so low"). Story band photograph: the lithography bay (a yellow wall and an exit door) replaced by the finished ballroom, cr-ballroom-8578. Repetition: spec ticker removed; eyebrow no longer says est. 1995; the 1995 chip replaced by 1,050,000 m2 so the chips carry only what the headline and lede do not; story description no longer repeats 1995 and seven countries; proof strip captions say what each photograph is, not the numbers again, and its second photo changed so the ballroom is not used twice. Hero block centred (was pinned to the foot under 120 to 200px of padding plus 118px of ticker clearance). | pages/About.jsx, styles/about.css (appended block) | src/_backups/about-0922 |
| Contact rebuilt (Bazil: "please refine this its so messy not structured no icon", "this map suck put their actual map", "take all the details and make it awesome zoom in", "should take a whole left to right section", offices: more spacing, refined boxes together, flags, by country). One form in three numbered steps with icons, one open column beside it. The map is the REAL district from OpenStreetMap as a white clay model, full width: 772 footprints, roads, water, trees, traffic, red HQ, fly-in, drag and zoom. Offices grouped by country with SVG flags; Malaysia holds HQ and Penang. | pages/Contact.jsx, styles/contact.css, scenes/contact.js, components/Flag.jsx, components/FlowIcon.jsx (8 icons), tools/build-hqmap.py, tools/data/hq-osm-0922.json, public/assets/iaq/hq-district.json | src/_backups/contact-0922 |

Map facts and inferences: footprints, roads, names from OSM (ODbL, credited on the page). Pin = Google Maps pin for IAQ Technology International Sdn. Bhd., 2.9911454, 101.518056. INFERENCE: the red building is the OSM footprint nearest the pin (way 1123052436, 23 m); the HQ street is OSM way 399204508 (tagged service, unnamed), labelled Jalan Sungai Jeluh 32/192 from the address. Heights estimated from area. Trees and rooftop plant decorative.

Probes added: tools/probe-cliprange-0922.mjs, probe-clipwin-0922.mjs, probe-ringvis-0922.mjs, probe-nav-ring-0922.mjs, probe-about-0922.mjs, probe-contact-0922.mjs. The ring advances itself every 5.2s: dispatch `pointerenter` on #lpStage to hold a stage while measuring.
Open: hq-district-poster.webp (the no-WebGL fallback image for the map) is referenced in contact.css and NOT yet made; nav search/account icons were redrawn at 1.7 round on 22 Sep, which disagrees with the client's 9 Sep note (finer, no round corners), to be realigned; tools/probe-record-0921.mjs still reads .gr-o-txt, which no longer exists.

### 22 Sep, later: the Services wing is three columns (Bazil: "3 columns only, the picture, the 3 units and the 6 services", "3 big buttons", "cards", "you can click each section", "the service putting like this confuses", "im sure you had a look on the codex")
- Photograph | three unit CARDS | six services as a numbered list. `stack` is gone from the Services menu entry in components/Nav.jsx.
- Every section inside a unit card is a link now: EPCC and EPCM go to /services/epc-construction#un-models-h, Cooling as a Service and Energy Performance Contracting to /services/energy-management#un-models-h, the two PCU & TTI pages as before. No dead chips left (probe counts 0).
- The Codex relationship is in the menu: each unit carries `core` and `ask` (indices into the six, copied from data/codex.js UNITS). With a unit under the pointer the list heads "What EPC carries", lights the carried services, marks "When asked", and quiets the rest. Verified: EPC all six; PCU & TTI five plus maintenance when asked; EFM commissioning and maintenance, the first three when asked, hookup quiet.
- The quiet state dims the row's CHILDREN, not the row: the row's arrival animation owns its opacity while it runs.
- Probe: tools/probe-svcwing-0922.mjs (SwiftShader flags on purpose; under the Metal flags the animation clock stalls between screenshots and the wing is shot half open). Backups: src/_backups/nav-0922/*.pre-3col.

### 22 Sep, later: the closing band rebuilt (Bazil: "this part looks mad ugly", "sectionize?", "main page and each have their own dedicated pages", "prettier and better visual, take your time", "be careful about the animation behind and make it premium")
- components/ClosingBand.jsx: three sections. (1) The ask: headline, lede, "What are you building?" as a segmented choice with icons and a sliding red thumb, the CTA (answer still travels to the Contact form), and one glass panel "Reach us directly" with red icon tiles, whole-row links and one square action each (copy email, call, map), hours under it. (2) The sitemap by main page: About, Services, Markets, Projects, News & Insights (its latest story), Careers, each heading is the main page and the list is its own pages. (3) Sign-off: mark, line, LinkedIn, then the legal strip.
- components/CloseAmbient.jsx: the 2,400 three.js specks are gone (and with them the three.js download on pages that only needed it for this). A 2D canvas of 30 streamlines through a waist ("air made laminar"), parting round the pointer, occasional red tracers, two slow CSS light fields; masked out under the sitemap. 61 fps on the M2 Pro; still frame under reduced motion; runs only on screen.
- Careers now uses the shared band (`ask`, `actions`, `reach` props) instead of its own copy of the old one.
- TRAP: about.css (never unloaded in the SPA) pulls every band's footer up 130 to 210px under a dark gradient and forces .close3d's background; the band resets `.close3d.cb > footer.sitefoot` and its own background with !important. A site-wide phone rule forces every h2 to 22 to 28px !important; the band's headline overrides it.
- Checks: tools/probe-band-0922.mjs (Home 1440, Careers 1440, Home 390: 0 errors, 0 overflow, 61 fps); 12-route spot check clean. Backups: src/_backups/band-0922.

### 22 Sep, last: About visual pass (Bazil: "even the about page requires better visual and red icons if possible")
- Vision and mission: two bright white cards on the light grey ground, the photograph at full colour on top, the statement below, the mark a red tile (solid red on hover). Vision's photograph is now IAQ's own drone shot of a delivered plant at dusk (plant-dusk-03, unused elsewhere), in place of the generated campus. Styles: appended block at the end of about.css (`section.vm ...`).
- Values carousel on the About page: every value's mark is red in a tile; the cards behind the front one are navy, so the veil takes them deeper instead of grey; only the front card is white. values-grid.css appended block. Backups: src/_backups/about-0922.
- 12-route spot check clean after the pass.

### 22 Sep, last: the band reverted to the 21 Sep look, the Codex brought up to date
- Band (Bazil: "the design before was better for the background animation and the other things, please revert", "just make it more structured and good"): the three.js particle air is back (CloseAmbient.jsx restored from src/_backups/band-0922), and so are the open answer words and the open contact rows (base.css .crow). Kept from the rebuild: the sitemap by main page, the sign-off row, hairlines between the sections and the contact rows, the email and its Copy on one line. The boxed build is in src/_backups/band-0922b. Probe: tools/probe-band-0922.mjs, 0 errors at Home 1440, Careers 1440, Home 390.
- Codex (Bazil: "is the codex completed"): it was finished on 18 Sep, but today's menu change had made section 3's "The Services menu, live now" replica false. The replica is three columns now and answers to the pointer from UNITS core/ask; STATUS updated (menu, closing band). Audit tools/probe-codex-overlap-0918.mjs: 0 overlaps at 1440/1024/390, the one cut is the intended URL-bar ellipsis. PDF re-exported: 43 pages, 8.3 MB, 0 errors (the 18 Sep PDF is in src/_backups/codex-0922).
- Codex items still waiting on IAQ are its ten OPEN_QUESTIONS (data/codex.js); the 18 Sep question about the soft glows on the slides and the fab story was never answered.

### 22 Sep, final: the band is the 21 Sep arrangement with structure (Bazil: "why footer repeat logo and so tall", "the previous one before all the recent adjustments was ok, just need structure", "no light up effect", "fix spacing", "make sure arrangement ok")
- Cause of the "repeat logo": the nav bar comes back on screen as you scroll up, so its IAQ mark and the band's 3D mark showed together. The band carries no logo now; the company line is text ("IAQ Group", one sentence, LinkedIn).
- Two tiers on ONE grid (1.15fr / .85fr in both): the ask left and the contact rows right, a hairline, then the company line left and the two link columns (FOOTER_COLUMNS, as on 21 Sep) right, starting at the same x as the contact rows (859px at 1440, measured). No pointer light, no red glow under the button. Particles behind, as asked.
- Height at 1440: 1,485px to 1,106px, of which 195px is the review-only BrandMethod ribbon (not in the launch build).
- Checks: tools/probe-footlogo-0922.mjs (0 logos in the band on 10 routes), tools/probe-band-0922.mjs (0 errors, 0 overflow at Home 1440, Careers 1440, Home 390; 61 fps), 12-route spot check clean. Backups: src/_backups/band-0922c holds the version before this.
- Same day, after (Bazil: "no lines in footer", "section nice well"): every rule in the band is gone (the tier hairline, the contact row hairlines, the legal strip's top border, the LinkedIn outline). The two tiers are parted by space and by a deeper ground (rgba(2,5,12,.5)) under the lower tier that runs full width on through the legal strip (.cb-base). A scan of every element and pseudo-element in the band finds 0 borders and 0 inset lines. 12-route spot check clean. Backup: src/_backups/band-0922d.

## 22 Sep 2026, evening: SEMICON Europa 2026 booth plan, in the portal (Bazil: "a detailed proposal plan for the IAQ booth ... booth design, print ... a full on screen to show the services full including the 3D of how it works ... specialise in the portal ... flyer, banner, backdrop and the website ... and the portal section that has all this")

Inputs: two OneDrive zips from IAQ (22 Sep): berrylife's stand renders for Green Excel Poland, version 3 (6 PNG), the graphic specification v. 15.09 (9 whole-stand sheets + 1 IAQ sheet) and berrylife's print preparation guidelines. Event checked on messe-muenchen.de: SEMICON Europa, 10 to 13 Nov 2026, Messe München, with electronica. Deadlines and brief from the 17 Sep minutes (Gemini PDF): backdrop design 10 Oct; TV animation 5 Nov (Nabilah: submit before 4 Nov); only necessary information; Europe = cleanroom construction focus; mockups and booster pack inside the existing cost.

| Built | Where |
|---|---|
| Portal tab **Booth** at /portal/booth: head with countdowns to the three dates; 1 brief and headline options; 2 the stand (renders, IAQ spec sheet, surfaces table); 3 the four IAQ surfaces drawn to scale (lineup at one scale with a 1.75 m figure, then each with zones, print pixel sizes, content; zone and bleed toggles) and the print spec; 4 the screen (live iframe of the player, chapters, rules, modes, delivery); 5 flyer, roll-up, cards, booster pack, booth page, LinkedIn, email signature, ad banner (with drafts); 6 timeline with today marker and owners; 7 ten open questions each with what was done meanwhile; 8 files | pages/PortalBooth.jsx, styles/booth.css, data/booth.js (all content, facts vs proposal marked in its header) |
| Draft artwork, every piece an SVG whose viewBox is its real size in mm: W1 aisle column 310 x 3472, W2 side wall 2852 x 3472 (flat dot map from the globe's own land bits, 7 offices, Europe red, 4 figures), W3 back wall 2046 x 3472 with 1736 visible (Lockup B, headline, the 55 inch screen at 1500 mm, three units; the 310 mm hidden behind W2 hatched), counter 600 x 1170 R170 (mark, line, draft QR); flyer A5 two sides; roll-up 850 x 2000 (Brand OS design 1); LinkedIn 1200 x 627; email signature 600 x 150 | components/booth/Art.jsx, data/landBits.js (from scenes/home.js), data/boothQr.js (draft QR to the PROPOSED iaqtechnology.com.my/semicon) |
| **Booth screen** at /booth/screen (review builds only, member session): a 1920 x 1080 stage scaled to the window, six chapters (open; the Revit model building in five moments with the unit that does each; three units; six services then each unit lighting what it carries, from codex UNITS core/ask; tool hook-up four phases beside the hook-up clip; Europe with Dresden, contact and QR), about two minutes a lap; present mode (1 to 6, arrows, Space, F, Esc), resumes the loop after 45 s. Measured smallest text per chapter: 34, 36, 40, 42, 34, 32 px | pages/BoothScreen.jsx, styles/booth-screen.css, lib/brandFonts.js (Poppins, Urbanist, League Spartan from Google Fonts on the booth pages only) |
| The plan as a PDF: 19 A3 landscape pages, 4.4 MB | tools/export-booth-plan-0922.mjs → public/booth/IAQ-SEMICON-Europa-2026-booth-plan.pdf |
| Files served for the tab: renders, spec sheets (webp), guidelines PDF, cropped marks | public/booth/ (added to tools/prune-launch.mjs; the launch build has no booth code or files, checked) |

Traps: the site's `:root{zoom:1.12}` above 1024px enlarged the 1920 px kiosk stage past the screen: `html.bs-on{zoom:1!important}`. Print of the tab collapsed to the phone grid (the print width reads under 900 px): the print block in booth.css re-declares the desktop grid. FabStory now exports FRAMES and STORY. Probes: tools/probe-booth-0922.mjs (sections, chapters, smallest text, errors). Backups: src/_backups/booth-0922 (Portal.jsx, main.jsx, prune-launch.mjs).
Not built (in the plan, proposed): the public booth page /semicon, the MP4 fallback render, final 1:1 CMYK print PDFs (after IAQ approves the drafts), local font files for the stand machine.

### 22 Sep, night: the booth finished, one page, the screen a live website (Bazil: "u have to design all the things i ask for in the booth area", "remember we are supposed to have design direction or element tab", "i need to see everything on the web not touch and open another screen", "the screen booth thing ... must be shown in a website form ... a total tab that needs to be open and shown looping to the public and interacted")

| What | Where | Checked |
|---|---|---|
| **The portal Booth is one page** at /portal/booth: Plan, Design direction, Stand, Print, Screen and digital, Website, Files, in one scroll. The bar is a sticky jump menu that marks the section in view; /portal/booth/<view> lands on its section (screen is an alias of digital). The booth screen and the booth page run LIVE inside it (iframes), so nothing has to be opened elsewhere | pages/PortalBooth.jsx (VIEWS, go(), IntersectionObserver), Portal.jsx route `booth/:view?`, styles/booth.css (22 Sep blocks) | tools/probe-booth-onepage-0922.mjs: 7 sections, 0 overflow, bar follows the scroll, deep link lands, the screen answers a real mouse click inside the frame |
| **Design direction** tab content: the idea, colour scheme with share bar, hex/RGB/CMYK (starred CMYK = our conversion), which blue (IAQ's side has none; Green Excel's royal blue stays theirs), type faces and sizes by surface, the mark and its lockups, the stripes device, where lines are used (yes/no), spacing and height zones, imagery and icons, do/don't lists, side-by-side do/don't pairs | components/booth/Direction.jsx, data/booth.js DIRECTION | shot at 1440; lockup captions, zone tints (palette greys, headline zone red tint) and a clipped pair fixed |
| **The 3D stand** reads the artwork from the front: cameras moved in front of the corner (they sat outside the side wall and saw its blank back), light cut (environmentIntensity .35, exposure .92) so navy and red print true, no figures (Bazil: "no need people"; the old version is in src/_backups/booth-0922b/BoothModel.with-figures.jsx), pale grey stand floor; `__boothModel.goto(i)` and `shotAt(i or {pos,at}, screen)` | components/booth/BoothModel.jsx | tools/probe-bm3-0922.mjs, 4 views, 0 errors |
| **The booth screen is a touch website** at /booth/screen, open to anyone (no member gate), review builds only. Website header (mark, five sections, Book a meeting) with the section's progress under its name. LOOP: sections advance, the header's right slot says "Touch to explore". EXPLORE (any touch or key): the fab model scrubs and its five moments tap, each unit opens (what, models) with a unit switcher, services filter by unit and each service opens its line, each hook-up phase opens, offices open their details, Book a meeting shows the QR panel. 60 s untouched: back to the loop. Keys for the team: 1 to 6, arrows, Space, F, Esc (not inside a frame) | pages/BoothScreen.jsx, styles/booth-screen.css, data/booth.js SCREEN modes and delivery (MP4 dropped: the screen is a website) | tools/probe-screen-web-0922.mjs: every section and interaction, smallest text 32 px, nothing past the 1920 x 1080 stage, 0 errors |
| **Booth page** /semicon (review builds only until IAQ signs off): headline, dates, Messe München, "Stand to be announced", Book a meeting (opens /contact with "Not sure yet" and the meeting message filled in: Contact.jsx now reads `state.message` / sessionStorage `iaq.message`), add-to-calendar .ics, IAQ's exploded fab, the FabStory model recoloured to the booth palette, three units, six services, Dresden office with world map (Europe crop on phones). The partner stand is NOT named on the public page until IAQ clears it | pages/Semicon.jsx, styles/semicon.css, main.jsx route | tools/probe-semicon-0922.mjs: 1440 and 390, 0 overflow, red phrases unbroken, contact hand-off verified |
| **Exports**: PNG of all 18 pieces (digital at exact sizes: posts 1080 x 1350, ads 1x and @2x, signature 1200 x 300); print PDFs of the 9 print pieces at 1:1 with bleed (10 mm stand and roll-ups, 3 mm flyer), vector, fonts embedded, RGB | public/booth/png, public/booth/print; tools/render-booth-art-0922.mjs, tools/export-booth-print-0922.mjs | PyMuPDF: one page each, sizes within 0.3 mm (Chrome rounds to CSS px, inside the bleed), 0 images in print mode |
| Posts 3 and 4 carry stills of OUR 3D stand, not berrylife's old renders, with no people in them | public/booth/still-post3.webp, still-post4.webp; tools/shoot-booth-stills-0922.mjs | re-exported |

Traps found:
- **Deep links lost their query string.** index.html turns /path?q into /?q#/path and main.jsx rebuilt the path from the hash only, so ?bleed, ?print and ?marks never reached /booth/art (the first PDFs had no painted bleed and carried the screen still). main.jsx now keeps the query and tidies only ?admin. The 3D textures were re-baked in true print mode afterwards.
- `.sm-map svg{display:block}` outranks `.sm-map-eu{display:none}`: scope the toggle as `.sm-map .sm-map-eu`.
- `.bs-phases span` outranked the phase number square once the phases became buttons: `.bs-phases .bs-ph-n`.
- Clicking inside an iframe from puppeteer: map the frame's inner pixels onto its bounding box (box.width / innerWidth); the parent's 1.12 zoom is in that ratio.
- The PDFs name one font (Poppins) plus Type 3 fonts: Chrome embeds Urbanist and League Spartan (variable fonts) as Type 3 outlines. Vector and printable; if berrylife's RIP rejects Type 3, outline the text before sending.

Backups: src/_backups/booth-0922b (Direction, BoothModel, BoothScreen + css, Art, PortalBooth, tex/, HANDOVER), src/_backups/semicon-0922 (Contact.jsx, main.jsx).

### 22 Sep, night 2: IAQ confirmations, leaflet set B, content pass, page structure (Bazil: "no need people", WhatsApp screenshot, "front back leaflet a5 option please 2 design set", "make sure content is correct for the exhibition", "structure this page correctly")

| What | Where | Checked |
|---|---|---|
| No people in the 3D stand, nor in the post 3 and 4 stills | BoothModel.jsx (old version: _backups/booth-0922b/BoothModel.with-figures.jsx), still-post3/4.webp, png/post3/4 | 4 views, 0 errors |
| **Confirmed by IAQ** (Nabilah on the WhatsApp group, 22 Sep): IAQ's part is this corner only; no printing on the outside or the back of the walls. Shown in the Plan and beside the 3D | data/booth.js CONFIRMED, EVENT.stand; PortalBooth Plan and Stand | rendered |
| **Leaflet set B**: front "The cleanroom, and the whole fab around it." with the fab's four layers named and the show plus code in a navy foot; back: three units (EPC first), the record on a tint band, Dresden, HQ, "Book a meeting" code. Set A keeps "Controlled environments, built to class." | Art.jsx FlyerFrontB, FlyerBackB, PIECES flyerB1/flyerB2; PNG and 1:1 PDFs with 3 mm bleed | rendered, PDFs one page 154 x 216 mm, 0 images |
| **Content pass** for the show: Set A's opening line now leads with cleanrooms (IAQ's Europe focus); removed the unconfirmed "team from Shah Alam and Dresden on the stand all four days" (post 1 art and caption, post 2 caption, /semicon lede and .ics); "two working days" became "one working day", the website's own promise (post 4 art and caption, timeline); "four figures" became "four proof numbers"; screen question updated (website, not MP4). Figures checked against site data: 1,050,000 m² (history.js, MarketsHub), 250+ and seven countries (GroupRecord), since 1995 | data/booth.js, Art.jsx, Semicon.jsx, PortalBooth.jsx | grep shows none of the old claims left |
| **Small text fix**: foreignObject text at millimetre sizes had uneven line gaps (lines snap to whole CSS px). Para now lays small text out 10x and scales it down, on screen and in the PDF | Art.jsx Para | all 20 pieces re-exported, PNG and PDF |
| **Page structure**: seven numbered parts (01 Plan to 07 Files), each a band with its own header (number, name, what it holds, links to its sub-sections); sections inside are h3 sub-sections; bands alternate grey and white, no lines. Print order: leaflet in two sets, take-away, roll-ups "for after Munich". Sub-section links land 8 px under the bar (the correction repeats until it settles, since an upward correction brings the site nav back) | PortalBooth.jsx VIEWS, Sec, SETS; booth.css "structure" block | tools/probe-booth-structure-0922.mjs: 7 parts, 15 h3, 0 overflow, 5 sub-links land at 8 px |

Trap: a puppeteer fullPage shot of this 32,000 px page repeats from the top past about 16,000 px. Review it in viewport shots per part.

| Walls and counter to scale as a card grid (Bazil: "at least have 2-3 columns so easy to see"): 3 columns desktop, 2 tablet, 1 phone; each drawing contained in one box height, details under it | PortalBooth.jsx .bt-srfs, booth.css | 1440/1000/390: boxes fill cards, 0 spill, 0 overflow |

| Footer: the IAQ brand block (logo, "Total Facility Solutions", since 1995) moved to the TOP of the closing band, above "Tell us what you are building"; the lower row keeps the two link columns with Follow level with them (Bazil: "iaq logo needs to be at top") | FooterNav.jsx (FooterBrand, brand prop), ClosingBand.jsx, closing-band.css; backup src/_backups/band-0922f | home, About, phone: 1 logo, 0 overflow. Careers already leads with its logo |
| **Globe, Kaspersky style on the light ground** (Bazil: Pinterest pin of Kaspersky's Earth 2050, "is there a way to make the world like this", then "proceed"): each route from HQ is a tube drawn by a shader with two streaks (out of HQ and back in) with fading tails over a faint base line; a light pillar on every office (HQ tallest), pulsing; two faint orbit rings with a red satellite, far halves dimmed behind the planet; clicking an office chip flies the camera in (z 4.25 to 3.35), brings the office to the middle, hides the other chips and opens the office card (entity, address, phone, photograph only where IAQ supplied one; Sweden, USA, Ireland point to the Contact page); Back to globe or Esc returns. The tour stays quiet (no zoom, no card). Canvas edge fades (radial mask) so the zoom never shows a square crop. Phone: the card hangs under the globe and the host makes room | scenes/home.js (globe IIFE: comets, beamMats, ringMats, openCard/closeCard, INFO), styles/group-record.css; backup src/_backups/globe-0922 | tools/probe-globe-kaspersky-0922.mjs at 1440 and 390: card text right, 1 chip shown when open, back restores, 0 page errors |
| "The record, in six numbers." red phrase no longer splits on phones (unbroken emphasis rule) | group-record.css | 360, 390, 1440: one line, 0 overflow |
| **Home, less flat** (Bazil: "does it look too flat and boring the website? front page", then "proceed"): the 3D build scroll 1800vh to 800vh (page 23,618 to 13,578 px at 1440; the scene reads progress from the section height, so nothing else changed); the record's numbers 26-37 px to 32-50 px, labels 14.5 px in a darker slate, tighter bottom; the delivery cycle keeps its white ground (its label plates and render backdrops are white by design) with labels 10 to 11.5 px in slate, resting marks at full strength (still grey, red only on the active stage), the track a step darker. NOT done: a projects band, because IAQ removed "Selected Work" from the home page, KIV until IAQ supplies project images (Home.jsx note) | fab-assembly.css, group-record.css, home.css; backup src/_backups/home-0922b | 1440 and 390: 0 overflow, 0 errors |
| **Footer option B, for comparison** (Bazil: Kresna footer "is the footer better presented like this", then "proceed"): the dark ask band stays; below it on a light ground a navy brand card (logo in its white panel, tagline, since 1995, LinkedIn) and a white links card (The Company, What we do, Get in touch with email, phone, Start a project; the legal line and Back to top), then a giant faint IAQ wordmark cropped at the bottom, then the demo ribbon. Square, no handwriting, no newsletter. Switch: ?footer=b for the session, ?footer=a back; the current footer stays the default | components/FooterB.jsx, styles/footer-b.css, ClosingBand.jsx (footerVariant); backup src/_backups/band-0922f/ClosingBand.pre-optionB.jsx | tools/probe-footer-b-0922.mjs: on, persists to /about, phone, back to A; 1 logo, 0 overflow, 0 errors |

Traps: a site-wide mobile rule sets every h2 to 22-28 px with !important, so small labels inside a component must not be h2 (FooterB uses p). The standard footer carries a 24 to 40 px top margin that shows the white page behind a light footer.
| **Closing band re-laid** (Bazil: "put to the right" of the ask, "to the left like original" of the contacts and links, "iaq logo needs to be at top"): left column = brand (logo at the top), contact ledger, the two link columns and Follow; right column = the ask, level with the logo. Phones: brand, ask, ledger, links. Top room trimmed (the grid adds none) | ClosingBand.jsx (cb-in2, cb-left), closing-band.css; backups src/_backups/band-0922f/*.pre-askright.* | home, About, phone: positions measured, 1 logo, 0 overflow |
| **Band lighter** (Bazil: "background reduce darkness"): every layer of the band (the section, close-viz, close-scrim, the footer strip) moved together from #0A101F to #17213A, so there is still no seam; rendered about #1A2640 where it was #0A101E. Careers' own band matches | base.css (html body .close3d …, beats the per-page !important copies); backup src/_backups/band-0922f/base.pre-navy.css | pixel samples before/after |
| **Globe "why not moving"**: two causes. (1) A re-run of the scene on the same page (hot reload, re-mount) left the old chips frozen over the live ones and drew the world twice; the host is now cleared on start, and a GPU rebuild also clears the streak, pillar and ring lists. (2) The tour held the world dead still 5.6 s per office; it now drifts (0.014 rad/s while an office is read, 0.04 between), still only while no office card is open | scenes/home.js | ry measured every second: moving; card open: held; 7 chips |
| **Globe reverted** (Bazil: "world just got worse and worse, revert [to the] release before"): the Kaspersky streaks, pillars, orbit rings, fly-in card and edge mask are gone; scenes/home.js is the pre-Kaspersky file with two invisible fixes kept (the host is cleared on start so a re-run never leaves frozen duplicate chips; the tour drifts instead of holding dead still). The Kaspersky version is kept at src/_backups/globe-0922/home.kaspersky.js and group-record.kaspersky.css | scenes/home.js, group-record.css | 7 chips, no card, 0 errors |
| **Closing band, final arrangement** (Bazil: "no need copy button", "remove this" of the four choices, "put these 2 to the right" of the contacts, "push this to the top" of the links): left = logo, the two link columns and Follow; right = the ask with one "Start a project" (no service preset) and the contact ledger under it. Phones: logo, ask, contacts, links. Copy button, choice state and their handlers removed | ClosingBand.jsx, closing-band.css; backup src/_backups/band-0922f/ClosingBand.pre-nopick.jsx | positions measured on home; copy and pick absent; 0 overflow |
| **Menus** (Bazil: of the unit cards "no need so long and make it clean"; of the About card "create a much more better visual"; of Careers "why repeating icons"): unit 2 is "PCU & TTI" with its full name beside it like EPC and EFM; each card's routes are one quiet row with no rule; the photo card in every wing drops the icon that repeated the row beside it and reads as an editorial card (picture clear at the top, words at the foot on a scrim that darkens only there); About uses IAQ's headquarters photograph with the sign in view; Careers framed lower | Nav.jsx, base.css (end); backup src/_backups/nav-0922 | tools/probe-nav-band-0922.mjs (animations forced to their end state for the capture) |
| **Hero markets: seven isometric marks across** (Bazil: "remove the seven across etc and just leave the icons and their names, no need all markets", "list all seven markets but put isometric detailed icons instead across, make it look good", "do better icons, quality better icons or isometric 3d animated"): the lead line, All markets and the hover line are gone; seven new Hard Anodise marks (chip on board, server racks, battery module, solar panel under a red sun, cooling unit with a turning fan and red pipe, flask with red liquid and rising bubbles, bottles gliding on a conveyor), each with one moving red part, straight on the photograph with a soft contact shadow (a pale disc behind each was tried and dropped as a glow). Seven across on desktop, 4 + 3 on tablet and phone | scripts_marks_markets.mjs (generator, --svg / --react), src/components/MarketMarks.jsx (generated), HeroMarkets.jsx, home.css (hmk-iso, hmk* keyframes) | 1440 and 390: 7 marks, one row on desktop, 0 overflow, 0 errors |
| **Record marks** (same note): the line drawings are replaced by the Hard Anodise marks again (MarkCtr, MarkIso, MarkInd, MarkPrj, MarkCln from Marks.jsx) and a NEW years mark, a desk calendar (MarkYears in MarketMarks.jsx) in place of the old box; each red part lifts in turn. 1,050,000 became "1.05 mil" (Bazil: "put 1.05 mil"; the counter counts decimals now: data-dec) | GroupRecord.jsx (Viz* kept unused for a revert), group-record.css, scenes/home.js counter | 1440: icon and number on one line; phone: icon over number |
| Globe: the breathing focus ring and the pulsing halo rings removed (Bazil: "no need the blinking circle") | scenes/home.js | 7 chips |
| Footer columns end level (Bazil: "align bottom properly"): both columns full height, last block on the floor | closing-band.css | Follow bottom = HQ bottom at 1440 and 1920 |
| Services wing compartments (Bazil: "compartmentalise it more premium and minimalist"): units on a soft grey panel as three white tiles of one rhythm, routes as small square tags; services on white with no rules | base.css (end) | tiles uniform, tags one row each |
| **Hero market row, modern pass** (23 Sep, Bazil: "looks very dull, flat and not modern, what do you think? try to improve and do your best"): the marks were lit for a light page and went muddy on the photograph. Now: a NIGHT set of the same marks (anodise lifted to bright silver, edges white; generated beside the day set as Mk*N, ids iaqn-), on seven square frosted-glass tiles across the full width (gradient glass, backdrop blur, a fine top highlight, deep soft shadow), the mark at 78 to 104 px, one line of name each; tiles rise in one after another on arrival, each mark floats a little at rest, hover lifts and brightens the tile; phones get a swipe strip (the third tile peeks). Reduced motion: still | scripts_marks_markets.mjs (NIGHT map, toNight), MarketMarks.jsx (regenerated), HeroMarkets.jsx, home.css (23 Sep block); backups src/_backups/home-0922b/*.pre-glass.*, MarketMarks.day.jsx | 1440, 1920, 390: 7 tiles, names one line on desktop, 0 page overflow; fold: row bottom 796/900 at 1440x900, 762/768 at 1366x768 |

### 23 Sep: the market marks in the logo's grammar, and the record heading in plain words

| What | Where | Checked |
|---|---|---|
| **Market marks, third cut** (Bazil sent the IAQ logo mark: "i like the detailing of the icon but can you do something like this design direction", then two isometric line-icon sheets: "must be red though", and "bio lifescience shouldn't have a flat beaker"): each market is now **the facility IAQ builds for it**, drawn in one flat IAQ red, the same 2:1 dimetric, line work with one solid red part which is also the part that moves. Fab hall with a saw-tooth roof and its wafer; two data halls with roof chillers and a lit row; the dry-room hall with the module on the line; two solar arrays, the inverter and the sun; the chiller hall, cooling tower, tanks and header; the cleanroom block with its air handling and a BIOREACTOR (not a beaker); the process hall, silos and filling line | scripts_marks_flat.mjs (generator: boxOutline, facade, cylOutline, stack; --svg / --react), src/components/FlatMarks.jsx (generated), HeroMarkets.jsx; the banded and line-object drafts are kept at src/_backups/home-0922b/scripts_marks_flat.banded.mjs and .line1.mjs | 1440, 1920, 390: 7 tiles, names on one line, 0 overflow, 0 errors; read at 84 px on the dark photograph |
| The grey solid set stays, and the new one is documented beside it on the Design tab (Bazil: "keep all this style at design tab for reference") | public/design.html section 04 (isoset unchanged; new "The market set, in the mark's own grammar" block, isoset-fm); backup src/_backups/home-0922b/design.pre-markets.html | 7 figures render on /design.html |
| "The record, in six numbers." became **"What IAQ has built, in six numbers."** (Bazil: "what does this mean, be clear please" — "the record" meant the track record) | GroupRecord.jsx | rendered |
| **Market marks, fourth cut** (23 Sep, Bazil sent a sheet of isometric icons standing on pale dotted plates): the marks are now DIORAMAS: filled isometric in two values only (IAQ red and a near-black), each on a pale plate with its dot grid, a soft shadow and a node on a stalk, one part still moving. The hero tile behind them is quiet now (no glass), since each mark carries its own plate. Documented on the Design tab; the banded and line cuts are kept in the backups | scripts_marks_diorama.mjs, src/components/DioramaMarks.jsx, HeroMarkets.jsx, home.css, public/design.html | 1440, 1920, 390: 7 marks, names one line, 0 overflow, 0 errors |
| **Market marks, the set that shipped** (23 Sep, Bazil: "it needs not be too boring like this", "red colour only", "but detailed", "the blocky boring shapes too much i dont like", "you can save these that you just did as reference design as well"): buildings are boxes and seven boxes in a row read as one object seven times, so the marks are now the EQUIPMENT IAQ works on, in red line work only: a process tool (chamber, frame, load port, cassette), an open rack (posts, rails, servers, cable loom, one unit lit), a battery pack (tray, cells, busbar, terminal), a tracker (array on its torque tube, truss legs, drive), a chiller skid (tower and fan, barrel on saddles, pumps, header), a bioreactor (jacket ribs, agitator drive, sample port), a filling line (conveyor, filler head, bottles). Detail helpers: pipeRun, valve, ladder, rail, ribs. One solid red part each, and it moves | scripts_marks_flat.mjs, src/components/FlatMarks.jsx, HeroMarkets.jsx, home.css | 1440, 1920, 390: 7 marks, names one line, 0 overflow, 0 errors |
| The diorama cut is kept and documented on the Design tab as a reference system (for light pages and decks); the banded and facility cuts are in src/_backups/home-0922b | public/design.html (two isoset-fm blocks), DioramaMarks.jsx kept | both blocks render |

## 23 Sep 2026 · the market marks, fifth cut: shades of red

Bazil sent a sheet of blue isometric icons ("this one blue but shades of blue, so you need to do red but shades of
red, and thickness"), then, in the same breath, "but IAQ is much more better", then "make sure it's refined and
sublime, amazing details and very clear".

- **Live now on the home hero**: `src/components/TonalMarks.jsx` (`TONAL_MARK`), generated by
  `scripts_marks_tonal.mjs` (`--svg <dir>` for a review sheet, `--react` for the component).
- **The system**: one hue, five values (pale top `#FDECEC`, light-mid `#F8AEB2`, mid `#F2595F`, the client red
  `#EC2027`, deep `#A6131A` for the outline). Two weights only: 2.1 on the silhouette, 1.2 inside it. Every volume is
  stacked bands with a seam down the front edge, which is the IAQ mark's own detailing. A dotted ground under each
  object, tagged `.mk-gd`.
- **The trap, and the fix**: the hero is a dark photo band. The first cut let the page show through the band gaps, so
  on the dark hero every object stripped out into floating slices. Each volume is now filled in the palest value FIRST
  and the bands are painted over it, so the slices read as pale seams on any background. `.hmk-iso .mk-gd{display:none}`
  in `src/styles/home.css` drops the ground dots on the dark hero, where pale dots read as dust. The Data Centre rack
  composes its bands by hand and needed the same base fill separately.
- **Subjects**: package on pins with a wafer (sem), open rack (dat), pack with six cells (ev), tracker (pv), chiller
  skid (dch), bioreactor (bio), filling line (fnb). One solid part each, and that part is the one that moves.
- **Seating rule learned**: a part that stands on a slab must have its base plane equal to the slab's top plane, or it
  floats. The chiller tower and its pump were both wrong before this.
- **Verified** in headless Chrome on the dev server: 1440, 1920 and 390, 7 marks, names on one line, 0 console errors,
  `npm run build` clean. Documented on the Design tab (`public/design.html`) as "The market set", with the line cut and
  the diorama cut kept below it as reference, which Bazil asked for.
- **Backups**: `src/_backups/home-0923/` holds `HeroMarkets.pre-tonal.jsx`, `FlatMarks.line.jsx` and
  `design.pre-tonal.html`. The line generator `scripts_marks_flat.mjs` and the diorama generator
  `scripts_marks_diorama.mjs` are untouched.

### Same day, second pass: fit, hover, and the record set

Bazil: "it needs to be a bit more detailed, and structured to look exactly like what it is, and it needs to be
premiumly animated when hovering. Please centre the icon, right now there are taller ones and there are shorter ones,
some lines are a bit too thick maybe and placed wrongly." Then: "make the fonts smaller and the icon more detailed and
not flat" (the record numbers).

- **Detail**: every market mark gained its real structure. Pins and a lead frame on the package, vents and status
  lights on the rack, cell terminals and a connector on the pack, cell grids and bearings on the tracker, a fan shroud
  and a pump set on the chiller, a dished top, sight glass and handwheel on the bioreactor, shoulders, necks and caps
  on the bottles.
- **Weights**: three now, 1.9 silhouette, 1.45 secondary structure, 1.05 detail. Pipes and legs came down from 2.4.
- **The fit** (this is the centring fix): `tools/fit-tonal-0923.mjs` renders each mark in Chrome, measures the object
  alone (`.mk-ob`, ground dots excluded) and writes `marks-tonal-fit.json` / `marks-record-fit.json`. The generator
  applies that scale and offset, **divides every stroke width by the same scale so line weight never changes**, and
  divides the ground-dot radii too. Always measure from a raw pass: `TONAL_NOFIT=1` (or `RECORD_NOFIT=1`) generates
  unfitted copies for measuring, otherwise the fit compounds.
- **The hover**: each band group carries `--i`, and the svg root carries `--fs` (its fit scale). On hover the bands
  lift by `-1.5px * var(--i) / var(--fs)` with a 16ms stagger, so the object comes apart a little and every mark moves
  the same number of screen pixels. No glow: the movement is the effect. Verified with a real pointer hover in
  headless Chrome, bands measured at -2.21 and -1.11.
- **The record set**: `scripts_marks_record.mjs` → `src/components/RecordMarks.jsx` (`RmYrs, RmCtr, RmIso, RmInd,
  RmPrj, RmCln`), same machinery in graphite with the IAQ red on the one part that carries the fact, which is also the
  part that lifts on `grLift`. Numbers down to `clamp(26px, 2.3vw, 34px)`, labels to 13px, marks up to
  `clamp(62px, 5.4vw, 78px)`. `Marks.jsx` keeps the flat plates.
- **Verified**: 1440 and 390 on the dev server, 6 stats, 0 console errors, `npm run build` clean, both sets documented
  on the Design tab.

### 23 Sep, later: the market row is real 3D, and the record marks are monoline

Five drawn cuts of the hero row were rejected in one sitting ("too over the place", "wacky", "like toy") before the
brief landed: "try making real 3D OpenGL but super refined", and "make sure it's real 3D that can turn and animate".

- **The row**: `src/scenes/market-marks.js`, mounted by `HeroMarkets.jsx`. ONE WebGL context for all seven marks. Each
  object is positioned from its own tile's `.hmk-stage` box, converted to world units along the camera's screen-right
  and screen-up vectors, so the scene knows nothing about the grid and survives any reflow. Orthographic camera on the
  same dimetric the drawn marks used.
- **Look**: flat toon shading on a three-step ramp plus an inverted-hull outline, not PBR. A filmic tone curve and a
  room environment were measured turning IAQ red into salmon (#E2656F, saturation .68 against the brand's .84), so the
  tone curve and the environment are off. The outline is a fixed world-space width, clamped to a fraction of the part
  it wraps, after "line too thick bulky and not professional".
- **The family rule**: the machine is white, ONE working part is red. Before that the red moved around and the row read
  as seven unrelated objects.
- **Normalisation**: every object is scaled to one optical box against height and mean footprint (not the longest
  side), centred in x and z, and sat on y = 0 over its own soft contact-shadow quad.
- **Motion**: slow idle float, the chiller fan turns, hover lifts and rotates the object and speeds its moving part.
  The drawn `TonalMarks.jsx` set stays in the markup as the fallback for no WebGL and reduced motion; `.hmk-on3d` hides
  it once the scene reports it is running.
- **Backups of the rejected cuts**: `src/_backups/home-0923/market-marks.pbr.js` (photoreal), `market-marks.machines.js`
  (the detailed machines before the simple-solid experiment), `scripts_marks_tonal.v1.mjs` / `.v2.mjs` (drawn sets).

- **The record marks**: `src/components/RecordFlat.jsx`, monoline, one ink at 1.15 and 0.85 on a 48 grid, no fills, one
  red element each, sized to the number itself (`clamp(28px, 2.5vw, 37px)`). The isometric graphite set
  (`scripts_marks_record.mjs` → `RecordMarks.jsx`) and the tinted cut are kept but are not used.
- **The footer**: the closing band is one grid on desktop now. Brand and ask on row one, links and contacts on row two,
  measured at 414/414 and 812/812, which killed the hole in the left column. Follow moved up under the brand
  (`FooterSocial` is its own export in `FooterNav.jsx`) so both columns carry content on both rows.
- Both styles are written up on the Design tab. `npm run build` clean.

### 23 Sep, the record block: compact, structured, and a lede that earns trust

- **Layout**: each stat is one cluster on a two-column grid, a fixed gutter of `clamp(30px, 2.7vw, 40px)` for the mark
  and a single text column for the number and its label, so every number in the block starts on the same line and the
  mark is centred against the pair (Bazil: "more compact and nicely put together", "icon on left", "number and
  description on the right", "all aligned"). Row gaps closed from 48px to `clamp(18px, 2.6vh, 28px)`.
- **The lede**: "Pick a country on the globe to see where" is gone ("more direct, don't tell them to pick a country",
  "put a strong statement that gains trust instead"). It now states what IAQ does and what backs it: 1995, cleanrooms
  and dry rooms, one accountable team from design to handover, seven countries, ISO 9001, 14001 and 45001. Every fact
  in it is already carried elsewhere on the site; nothing new was claimed.
- **The row's hover and focus**: the hard red box is gone, replaced by a fine red rule under the name and a hairline
  focus ring at 8px offset. Labels down to 13px so no market name wraps to a second line.
- **The 3D**: pixel ratio to 2.75, an offset elliptical contact shadow instead of a symmetric blob, and a per-mark
  optical trim table (`TRIM` in market-marks.js) because geometry that fits the same box does not carry the same
  weight.

### 23 Sep: the record marks are on the house spec now

Bazil: "refine and compare to better icons." The better icons were already in this build. The interface set on the
Design tab is 41 marks, audited on 9 September, and the whole site runs on it: **24 unit grid, one stroke weight of 1,
butt caps, mitred joins, no fill, currentColor, straight lines and full circles with arcs only where the thing itself
curves.** The record marks were off it (48 grid, 1.15 stroke, solid fills), which is why they never sat with the rest.

They are redrawn to that spec in `src/components/RecordFlat.jsx`, with one deliberate addition: a single red element
per mark, drawn at stroke 1.8 and never filled, carrying the fact and lifting on `grLift`. `tools/compare-icons-0923.mjs`
renders the six beside six interface marks at 96 px and at the 37 px they ship at, which is how the weights were
matched; re-run it after any change to either set.

### 23 Sep, the close of the day: the hero drops the 3D, and the cycle becomes a ring

- **Hero row**: the WebGL row is no longer the default. The audit that settled it: part counts ran 5 to 11 across the
  seven and the red ran from one small element to a whole textured face, so the set could not read as a set, and at
  about 90 px on a photograph a modelled machine has no room for the detail that makes it read as real. The hero
  carries `HeroLineMarks.jsx` now, on the house spec (24 grid, one weight, butt caps, mitred joins, no fill, one red
  element each). `?marks=3d` still mounts `scenes/market-marks.js`, which is worth keeping for a surface that gives an
  object 300 px or more.
- **One market language**: the same geometry is now exported as `LINE_SHAPES` and drawn by the markets strip
  (`IndustryGrid.jsx`), so the hero, the strip and the record block all speak once. The strip's own icon set is gone.
- **The strip's effect**: resting tint halved to .12, the scrim's middle opened from .44 to .30, image contrast and
  saturation up a touch, hover scale to 1.055 over 1.1s, and the hero's fine red rule on hover instead of an outline.
- **The delivery cycle is a ring**: `CycleRing.jsx` + `cycle-ring.css`, laid out on a fixed 1000 grid so it cannot
  drift, six nodes at 60 degree steps, the arc from the previous node to the active one in red and trimmed at both
  ends so it stops at the disc, the active stage in the centre with its tag, name, line and link, and a plain ordered
  list below 860 px. Same data and same 3D stills as before. The serpentine is kept: `?cycle=flow` renders
  `CycleFlow.jsx`, and `src/_backups/services-0923/ServicesHub.pre-ring.jsx` holds the page as it was.
- **Home page**: the record band fades from `#EEF1F5` to white where the services band begins, so the two sections
  meet without an edge. Footer lede is "Feasibility to handover, one accountable team. Response in a working day."
  Footer row two labels share metrics, so THE COMPANY and EMAIL sit on one line.
- Verified at 1440, 1920 and 390 with zero console errors; `npm run build` clean.

### 23 Sep, last pass: detail in the marks, and the ring takes the isometric set

- **Hero marks** gained a second layer on the same spec: die frame and pin-one dot on the chip, vents and status ticks
  on the rack, terminals on the pack, a purlin and a base plate on the tracker, a deck and feet on the tower, a
  nozzle and a shoulder rule on the vessel, a label band and conveyor feet on the bottle. Still one red element each.
- **One source of truth**: the components and the markets strip now both read `LINE_SHAPES`, so the hero and the strip
  cannot drift apart. (A refactor briefly dropped that export and blanked the row; caught by the console check, which
  is why every pass ends with one.)
- **The ring's discs** carry the isometric cycle marks (`data/cycleMarks.js`, the Hard Anodise set) instead of
  photographs, which is the look Bazil's reference wheel has: a grey isometric object with one red part, on white,
  with its own ground. The centre keeps the photograph, so the ring reads as drawing and the middle as the real thing.

### 23 Sep, the finish on the market row: one frame, one red, one phase

Picking up where the last session stopped. The seven hero marks were already on the house spec, but being on the
spec is not the same as being a set, and `tools/measure-heromarks.mjs` (new; it renders the row and prints each
mark's drawn box in SVG user units) said so:

| | before | after |
|---|---|---|
| Baseline | 17 to 22 on a 24 grid | **20 on all seven** |
| Height | 12.5 to 19 | 15 to 16 |
| Centre x | 12, except Bio at 13.1 | **12 on all seven** |
| Red | 1 path, but EV drew three dashes, and PV and F&B drew theirs ON TOP of a grey line already there | **one real element each** |
| Row float | −.7s per tile on a 5.2s cycle, so the seven sat up to **4.2 px apart** at any instant | one phase, spread **0 px** |

- **The frame.** Every mark now obeys four numbers: baseline y = 20, centre x = 12, height 15 to 16, width 13 to 17.
  That is what fixes "there are taller ones and there are shorter ones", which had been said twice and was still
  measurably true in the line set.
- **The red is a part, not a highlight**: the die, the live blade, the positive post, one module producing, the fan,
  the impeller, the cap. A red drawn over an existing grey line is not an element and is banned.
- **Four marks were redrawn**, not just moved: the battery became one case with a lid seam, three cells and two posts
  (it had read as three separate tanks); the chiller became a louvred casing with supply and return headers and a fan
  on struts (its red had been a slab floating over a gap); the bioreactor became a vessel with a dished bottom, drive,
  level line and baffles (it had read as a USB stick, then as a bucket with handles); the filling line got a four-tick
  roller bed. Detail went up on all seven, on the spec.
- **The row breathes on one phase.** `.hmk-stage` lost its per-tile `animation-delay`; amplitude 4px → 3px. The row
  rises and falls as one line instead of seven tiles bobbing out of step.
- **Verified**: 1440, 1920 and 390 · 7 tiles, 0 name wraps at 1440/1920 (one at 390, which is the swipe strip),
  0 overlaps, 0 console errors · hover driven with a real pointer: mark scales 1.05 and lifts 2.1px, the fine red rule
  grows to 34px, the name goes full white · 8-route crawl 0 errors · `npm run build` and `npm run build:launch` clean.
- **The strip draws the same paths** and was checked in place at its real 30px and 19px. A harness note worth keeping:
  copying an `.ig-ic` svg into a bare page to judge it LOSES the red, because the stroked red lives in
  `.ig-ic .ig-ic-sig` in the site's CSS, not on the element. Capture strip marks in place (`tools/shot-igic-0923.mjs`).
- **Design tab** now RENDERS the shipping set (`tools/design-lineset-0923.mjs` reads `LINE_SHAPES` and injects it), so
  the page cannot show a set the site no longer uses, with the four numbers and the reason written under it.
- **Backups**: `src/_backups/home-0923/HeroLineMarks.pre-normalise.jsx`, `home.pre-rowphase.css`;
  `_backups/design.pre-lineset-0923.html`.
- **New tools**: `measure-heromarks.mjs`, `sheet-heroline.mjs`, `shot-hero-widths.mjs`, `shot-strip-0923.mjs`,
  `shot-igic-0923.mjs`, `design-lineset-0923.mjs`, `_rowspread.mjs`, `_rowhover.mjs`, `_designshot.mjs`.

### 23 Sep, the open list rebuilt from evidence, and the four things on it that were ours

Bazil: "create a list of what's not done from the previous task and complete it." The list that existed was not
trustworthy, so it was rebuilt by measuring, and then the Brand Method items on it were finished.

**What the old list got wrong**

| | Was reported | Measured today |
|---|---|---|
| Owed-content slots | 98 across 23 of 35 pages | **82 across 15 of 35** |
| "concept note" slots | 22 | **0.** All 22 were phantoms: `audit-missing.mjs` matched the bare word `concept`, which is IAQ's own service copy, "Concept to detailed design across CSA and MEP", on 17 routes. A slot is a LABEL, so the pattern now matches the label (`tools/audit-concept-0923.mjs` prints every hit in context; the old tool is kept at `tools/audit-missing.pre-0923.mjs.bak`) |
| Checklist | "166 items, 109 ticked" | **291 items, 212 ticked, 79 open** (`tools/_chk3.mjs` reads the real tick state out of the savedState blob) |

**Completed today, with evidence**

| Item | What it was | Evidence |
|---|---|---|
| **br3** · "the six marks actually move" | Genuinely broken, not bookkeeping. When the cycle became a ring the discs took the isometric marks, but the motion stayed on the old serpentine: those rules key off `.lp-field.run .lpn[data-i]` in home.css and match nothing in the ring. Measured before: six `.mk-mv` groups, transform `none`, unchanged over 1.4s | The same six house motions redeclared in `cycle-ring.css` as `crSlide/crSet/crHoist/crNeedle/crGear/crJoin`, node index added to the button. After: all six transforms changed over 1.4s |
| **br3, the guard** | The reduced-motion guard did not fire: `.cring-node .mk-mv` (0-2-0) loses to `.cring-node[data-i="N"] .mk-mv` (0-3-0). It was animating under `prefers-reduced-motion: reduce` | Guard raised to `[data-i]`. Re-measured: six `animation-name: none` under reduce, six running without it |
| **q47** · launch readiness, the BM half | "47 slots and 31 concept notes are visible. Correct for review, wrong for launch" | New `tools/audit-launch-ready-0923.mjs` + `tools/serve-launch.mjs` (npx is unusable here: the npm cache is root-owned). dist-launch over 35 routes: **0 owed-content slots, 0 internal surfaces, 0 page errors**, 33 of 35 routes clean. The 10 that remain are deliberate "REPRESENTATION" captions on the history timeline and the office photographs. `/investors`, `/exhibition`, `/about/leadership`, `/portal`, `/codex`, `/semicon`, `/booth/screen` all 404 in the bundle; `/policies` publishes the two BM-drafted policies in full and drops the four IAQ still owes |
| **ab5** · "the six values diagrams read too alike" | BM's own note from 10 Sep | Obsolete: the values are photo cards with red icon tiles and dark cards behind the front one, not line diagrams. Recorded, not reopened |
| **br1, br2, br6, br7, br8, br10, br12, br13** | Built on the 22 Sep review and never ticked | Verified one by one (`tools/verify-open-0923.mjs`, then by eye where the probe was the weak part) and ticked in `public/checklist.html`. Backup at `_backups/checklist.pre-tick-0923.html` |

**Harness lessons worth keeping**

- A probe that returns "no" is a claim about the probe first. Three of today's failures were mine: the enquiry form
  is `.cx-form` (the 1-field form was the consent row), the closing band's "2 logos" were 8 layered images of ONE 3D
  wordmark, and the launch-bundle count moved between 4 and 10 until the probe scrolled the page before reading it.
- `br4` (nav dropdowns) and `br5` (About story photograph) are left **unticked and unverified**: the wing would not
  open under a dispatched `mouseover` in this probe, and "replaced" cannot be checked without the previous file.

**Still open: 79 items.** 47 blocked on IAQ or on people, 7 KIV, 3 waiting on a word from Bazil, 22 are Codex and
people items carried from 18 Sep that were not re-verified today. Nothing on the list is blocked on the build.

### 23 Sep, proceeding down the list: the wing, the Codex, and the portal finally has a 3D tab

| Item | Was | Now |
|---|---|---|
| **br4** · "level columns" | The Services wing's columns START level, which is why this passed for a month. `tools/_wingcols.mjs` reads where the INK ends, not the box: Business units left **27px** of slack, the Six services list left **198px**, and that hole is the empty white block on the right of the panel. Every other wing measured 13px | The list is a grid inside a flex column, so it takes the leftover height and the six rows divide it equally: same rhythm, same hairlines. Both columns now end at the same y, slack 27px each. Other three wings untouched |
| **br5** · "About story photograph replaced" | Could not be checked from the live page alone | Checked against `src/_backups/about-0922/About.jsx`: `cr-litho-8569.webp` (the lithography bay Bazil rejected, "wtf is this, what client wanted?") is now `cr-ballroom-8578.webp`, the finished ballroom. The same diff also confirms br6: the 1995-and-seven-countries repetition is gone |
| **m18u** · Codex PDF | **Stale.** Exported 22 Sep 06:16 against `FabStory.jsx`, which changed 22 Sep 13:03 | Re-exported: **36 pages, 9.4MB, 0 errors**, dated today. The infographic set was checked and is current (its own sources predate its export) |
| **m18q, m18v, m18w, m18y, m18z, m18r, m18s** | Built on 18 Sep, never ticked | Measured: map renders only the lit chain (3 edges, 3 lit), 3 distinct landing points, **0 lines crossing a card**, **0 glow nodes**; Codex at 1440, 1024 and 390 with 0 sideways overflow and 0 real clipping; both Watch blocks present; "Download the whole Codex" on the page; 120 bracketed short forms; primary button sentence case, no arrow |
| **m18t** | Read as open, but it describes a rail that was replaced on 22 Sep | Reworded in the checklist rather than ticked or deleted, so the record says what actually happened |
| **d6** · "Portal: a 3D modelling tab for Azwan's files, so IAQ reviews both demos in one place" | **Not built.** The portal had six tabs and none of them was 3D, so IAQ was sent the web model and the walkthrough separately | Built: `/portal/models`, seventh tab. Two rows that ship today (the fab assembly, the six cycle marks) link to the live page; three rows carry the site's own honest slot naming what is owed and who owns it (Azwan's character and walkthrough, the Revit/NWD equipment files, IAQ engineering's accuracy check). 0 console errors, no sideways overflow, and the launch bundle still 404s it with everything else in the portal |

**Two probe corrections worth keeping.** The relationship map first measured "3 of 3 lines cross a card": a line LANDS on the card it connects, so the endpoints are not crossings. The test now samples the middle 15 to 85 per cent of each path and ignores the two cards it touches, and the answer is 0. And the Codex "14 clipped elements at 1440, 26 at 390" are 1px `overflow:hidden` screen-reader spans, not clipped text.

**Checklist now 291 items, 224 ticked, 67 open**: 47 blocked on IAQ or on people, 7 KIV, 3 waiting on a word from
Bazil, 10 people items (Azwan's model, Haydar's project pages, the timeline summary, the Canva links). One build item
is left and it is a judgement call, not a gap: m18x, "Codex copy made plain", which cannot be measured.
`npm run build` and `npm run build:launch` clean, 8-route crawl 0 errors, launch bundle 0 owed slots and 0 internal
surfaces.

### 23 Sep, the polish pass

Measured first (`tools/polish-audit-0923.mjs`, per page and width: sideways overflow, coloured phrases that
split, heading widows, tap targets, image aspect, and columns whose ink stops short of their box).

| Item | Before | After |
|---|---|---|
| **The unbroken-emphasis rule** | The rule was gated at `min-width:641px` on an ASSUMPTION that a phone column is narrower than the phrase. Thirteen phrases were splitting at 390 | Measured: every one fits with 38 to 174px to spare, and `tools/emphasis-floor-0923.mjs` walked 430/390/375/360/344/320 to find the real floor. Gate moved to **360px**. PASS at nine widths |
| **The certificate band** | Seven cards in one auto-fit row, all stretched to the tallest: the three ISO cards ended 20px above their floor, CIDB G7 left **372px**, UKAS **391px**, Gold OSH **391px** of empty white | Two rows by kind on a 12-column grid: certificates take four columns, recognitions three. Slack 20/20/20/68/68/20/68. On a phone a certificate is full width, because it cannot be read at half of 362px, and the empty grid cell that rendered as a grey block is gone (99.1% coverage) |
| **Touch targets** | `tools/tap-audit-0923.mjs` scrolls each control into view and checks the element under its own centre, so a link in a closed drawer is not counted. The icon-only controls were 27x27 (save on 28 project cards), 34x34, 60x16, 31x21, 11x65 | Each keeps its drawn box and gains a transparent 44px hit area. A `(pointer:coarse)` query is the textbook answer but cannot be emulated by this harness, so it would ship unverified: the site's own 720px breakpoint is used instead |
| **Two audit bugs of my own** | `/projects/0` reported 1987px of slack (a **sticky** card travelling its column) and three centred cards reported ~100px (balanced padding) | The tool skips sticky columns and only flags a foot gap more than twice the space above it. Both widths now sweep clean |

**The hero row is a bar** (Bazil: "a lot smaller, just taking half the space", "put the icon at the row instead
and cover it with a line that makes it part of the bottom banner", "closer to the bottom"). Mark and name on one
line, seven spread across the hero's width, a hairline top rule and a slight darkening, flush to the hero's floor.
**222px tall before, 83px after**, and the 45px of photograph under it is gone. Line weight 1.15 to 0.95, the red
1.7 to 1.45 ("more thinner please the line"), matched on the markets strip.

**The record block** (Bazil: "this style should be the official say in one line, don't be dorky like 6 numbers",
then "not too long"): the heading is "Total facility solutions, **engineered since 1995.**", IAQ's own descriptor
rather than a count of the cards below it. The lede is two lines, not four: 1995 moved into the heading and the
ISO certificates are already a card in the block. Holding the new phrase together needed the heading's `max-width`
at 19ch (16ch is narrower than the phrase at the 58px ceiling) and a smaller floor below 560px.

**The nav wings** (Bazil, with Markets open: "this is considered tidy"; of Services: "more tidy and don't make
boxy in the unit part"; "maybe red icons"): the Services wing was a tinted panel holding three white cards, each
with a filled icon tile and a row of filled chips. Four box shapes for one idea. It is a list now on the Markets
pattern, hairlines between units, the mark in the client red with no tile, models as quiet text aligned to the
name (an inherited `margin-left:64px` was putting them 72px off). Nothing left the wing. The Services wing's two
columns also end level now: the services list left 198px of slack where the units left 27.

**The portal bar is three jobs, not seven tabs** (Bazil: "separate to 1. edit website, 2. exhibition, 3. documents",
"when click 1 the info expands to the right"). `/portal/models` (the 3D tab) and every other page keeps its own
address and still deep-links; the bar shows the three, and the chosen group's pages open in a panel beside the
buttons behind a hairline, with the current page keeping its red underline.

**The globe has a sea** (Bazil: "make the sea into dots as well, find a way that makes it look good"). The ocean
was gated to one water cell in five, so the planet read as two continents floating on white. Every water cell
carries a point now, finer (0.34 to 0.26) and paler than the land and set a shade further in, so the coastline
stays an edge between two grains rather than one grain at two opacities.

Verified: builds clean, 8-route crawl 0 errors, polish sweep clean at 1440 and 390, emphasis PASS at nine widths.

**Same day, the wing's two groups are told apart** (Bazil: "make separation in between, or colour different, a
background"). Taking the unit cards out of their tinted panel had left Business units and Six services reading as
one field of white. The seam is drawn in the GRID GAP, not as a border on either column, so neither group gains an
edge of its own (the standing rule against left-edge stripes), and the services column carries a very light tint.
Scoped with `:has(.nm-segs)`: measured, only the Services wing has it, and About, Markets and Careers are
unchanged at gap 0 and transparent.

Later still, 24 Sep. Bazil: "no, there was a previous horizontal looking process before". The Services cycle is the serpentine (`CycleFlow.jsx`) again, default; `?cycle=ring` renders the ring. The serpentine's discs now carry the CYCLE_SVG vector marks (`.cyc-mk`), not the old `/assets/cycle3d/*-ic.webp` stills. Phone trap: `.cyc-num::before` (the wire knock-out plate) must be `display:none` on the stack, it painted over "Commission". The cover keeps its small ring beside the model (he confirmed both in one view reads well). Unit cards (`ServicesMap.jsx` UnitsBand) gained a `WHEN` row ("Call when"), model and work explanations under each chip (`.sm-model`), and the dashed/faint key inside the Services row (`.sm-svc6-key`); the subgrid is 10 rows now (spec 5).

Evening, 24 Sep. `SystemMap.jsx` + `system-map.css`: the one-view chart straight under the cover (services across with the return, units down as bars, work at the row end, four work cards with "Done by" and "In the model" pins from the cover's exported `LAYERS`). Data from `codex.js` only. `MapBand` (RelExplorer) is no longer on the Services page; the export stays for the Codex. Phone: the grid is six columns, label and work rows span all six, stage names at 10px measured with no overflow at 390.

Cover trap (24 Sep): `.sc-ring-c` is centred with the `translate` property, not `transform`, because `scTip` animates transform and an animation with `fill: both` replaces the whole transform. `.sc-ring{--r}` is the station radius (160 desktop, 124 under 480px). STANDING RULE (Bazil): every new view or system built on the site goes into the Codex in the same session; `SystemMap` has an `embed` prop for that, and sits in Codex part 2 under "The same, on one chart".

Night, 24 Sep. Codex holds everything the Services page says, in the three parts (LIFE, FAQ, UNITS.when now live in codex.js). Service pages carry `CarriedBy` (which unit carries the stage); unit pages carry `.un-when` (ids cap-epc / cap-tool / cap-pcu / cap-energy map to epc / hookup / efm in `UnitPage.jsx`). Team pack: `Websites/iaq-website-2026-09-24.zip` = site/ (dist-launch) + source/ + README. Rebuild the pack after any further change: the recipe is in the checklist entry.

FAQ (24 Sep, late): `components/Faq.jsx` + `styles/faq.css`, data `codex.js` FAQ (five groups, `link` per item optional). Used on Services (`FaqBand`) and in Codex part 1 (`<Faq embed />`). Phone trap: a horizontal chip strip inside a `1fr` grid column widens the column to its min-content; the column must be `minmax(0,1fr)` with `min-width:0` on the children.

Voice (24 Sep): every IAQ line follows the Voice cards in `BM Modules/Brand Strategy module/clients/IAQ/content.json` (voice|03-1 to 03-4): the Trusted Engineer, figure first, exact names, no superlatives, no exclamation marks, no section-describing ledes. FAQ mark: `node scripts_marks_build.mjs --faq > src/data/faqMark.js`. Services order now ends FAQ, proof, close.

Marks, 24 Sep late. TRAP: `src/components/Marks.jsx` is NOT fully regenerable. `node scripts_marks_build.mjs --react` emits only the seven MARKS in the script (prj cln emp ctr shr crb grw); the file also carries MarkYrs, MarkIso, MarkInd, MarkEpc, MarkPcu, MarkTol, MarkEnr from an older cut. Never overwrite it: generate to /tmp and splice the one function you changed (the MarkGrw block shows how). `DioramaMarks.jsx` IS fully generated (`scripts_marks_diorama.mjs --react`): seven markets + faq + grow. Heading marks: `.sm-faq-h` (Services FAQ, DmFaq) and `.cu-h2-mk` (Careers training, DmGrow), both 84 to 88px beside the h2.

Voice pass, 24 Sep night: every public heading, lede and action reads in the Voice-card register; `tools/copy-audit-0924.mjs` crawls them all into a JSON for the next pass (run it after any copy change, then read the list against the cards). Backups of every touched file in `src/_backups/voice-0924/`. The design stage line lives in FOUR places (Home.jsx lp-kick, ServicesHub STAGES kick, scenes/home.js, ServiceDesign title): change all four together.

Close of 24 Sep. Home h1 is the brand promise (Voice card 3·2). Full crawl clean (tools/crawl-all-0924.mjs, 34 routes, two widths). Team pack current: Websites/iaq-website-2026-09-24.zip. Still open for Bazil: nothing from tonight; Safari unverified as ever (headless Chrome only).



## 24 Sep 2026, night: Bazil's live notes (fourteen, in the order they came)

| Note | Done | Where | Check |
|---|---|---|---|
| "say something better than this" (hero h1, the class pun) | h1 is "Built to class, proven at handover, kept running." one promise per unit; lede trimmed so it no longer repeats "class" | pages/Home.jsx | em on one line at 1440, 1280, 390 |
| "what the heck is this about" (the record band) | It is IAQ's record and footprint: the descriptor as its heading, the six counters, the world with the seven offices. Its deep empty foot (padding-bottom 72 to 128px from a later rule) is gone | styles/group-record.css | band height 908 to ~800 at 1440 |
| "gradient grey from the top and transparent to the bottom" | straight-down gradient, grey to nothing. TRAP: a second `.glance.gr` rule at the foot of group-record.css (162deg, to white) overrode the first; both now say the same | styles/group-record.css line 157 | computed background checked |
| "can the pixel or fonts animate subtly" | land dots carry a slow light sweep by longitude (~12 s) over a faint twinkle: `dotMat(..., 'sweep')` | scenes/home.js | 0 errors; visual unverified headless (WebGL) |
| "no , and ." (record h2) | "Total facility solutions engineered since 1995", no comma, no stop | components/GroupRecord.jsx | text read back |
| "refine, not lame boxy stuff and paper" (home ring) | the ring section is retired from the home page (see next) | pages/Home.jsx | .lpx-band absent |
| "put this info beside the button" (closing band) | the line stays on the button's row at every width, wrapping its own words | styles/closing-band.css | lineBeside true at 1440, 1280, 1160 |
| "align nicely, same level" (footer columns) | EMAIL and THE COMPANY start on one line: the first ledger row lost its 11px top padding | styles/closing-band.css | both labels at the same y |
| "no need to put in a box" (LinkedIn) | icon and word only | styles/base.css | border 0, padding 0 |
| "icon to the left of the title and description, no shadow and platform" (FAQ) | one head row: the question cube (shadow ellipse, platform faces and dot grid hidden) beside the title and lede | components/ServicesMap.jsx, styles/faq.css | capture |
| "this info should be at picture 2, and put this at the second section" | components/CycleBand.jsx: the serpentine (CycleFlow) carrying the Services cover's heading, lede and three facts (plain, no boxes), second on the home page. ASSUMED the home page; the Services page is unchanged | data/cycle.js, styles/cycle-band.css | capture 1440, 390 |
| "the first section should show and explain all 3 units, services, type of work and system, in a 3D view, and when you select the visual reflects where we are" | components/FabExplorer.jsx: the four kinds in the Codex colours beside IAQ's Revit model (61 frames). A pick scrubs the facility to that thing's moment, pins the layers it touches, says the relation (reuses related/sentence from the Codex map, now exported), links to the page. Self tour until touched | styles/fab-explorer.css | tools/probe-fx-0924b.mjs: unit 2 -> frame 44, 5 pins; system -> frame 22, 3 pins; 0 errors, 0 overflow at 1440 and 390 |
| "more detailed explanation, examples, names, icons and visuals" (Codex key) | components/codex/KindsGuide.jsx: six cards, each with icon, count, what it is, every name with an icon, an example sentence, Think / Not / On the site | data/codex.js KINDS | capture |
| "and then a table, detailed, on what it really is, compared" | the same six compared on eight rows (what, how many, names, who decides, think, confused with, where, colour) | KindsGuide.jsx | 6 columns, 8 rows, no sideways scroll at 1440 |

Home order now: hero, FabExplorer, CycleBand, GroupRecord, FabAssembly, industries, closing. Codex PDF re-exported with the guide.
Backups: src/_backups/home-0924b (Home.jsx, GroupRecord.jsx, group-record.css, home.css, closing-band.css, base.css, faq.css, ServicesMap.jsx, DioramaMarks.jsx, home.scene.js, Codex.jsx, codex.css, codex.js).
Open for Bazil: the glows on the slides and fab story; the Bosch film labelled as IAQ's; whether the Services page should also carry the cycle band in place of its cover.

### 24 Sep, later still: two views of the six kinds, the switch, the FAQ in print
- "make a summary view and a detailed view, add icons or other visuals": KindsGuide has a Summary view (six tiles: icon tile in the kind's colour, name, count, one line, every name as a chip with its own icon, Think) and a Detailed view (the full cards and the comparison table); the old key band's chips are folded into Summary. "make tab more visible and icon it": the switch is two labelled tabs with icons and a sub-line, the active one filled ink.
- Print and the PDF carry the Detailed view whichever is on screen (.cx-kinds-print).
- The Codex FAQ (Faq embed) did not print: its items reveal on scroll (.faq.in) and its groups are accordions, and the A4 width tripped the phone rules that hide the group leads. faq.css print block opens every group and answer, forces the reveal, shows the leads; the exporter now scrolls the page once before printing. tools/probe-pdf-whole-0918.mjs is the check.
- Section 3 heading on phones: the red phrase is now "page by page." so it holds on one line at 390 (tools/probe-cx390-0924b.mjs: nothing past the edge).
- Audit (tools/probe-codex-overlap-0918.mjs, now treating closed accordions as hidden): 0 overlaps at 1440, 1024, 390. The header's flagged "cut" is the decorative art bleeding under overflow:hidden, by design.

### 24 Sep, close: the bundle kept clean
- The home explorer imported UNITS/SERVICES/WORK from data/codex.js and the map's rules from RelExplorer.jsx, which pulled a codex chunk into the launch bundle. Split: data/business.js (the public data; codex.js re-exports it), lib/relations.jsx (SYS, related, sentence, MODELS, BOUGHT), data/fabFrames.js (the 61 frames). RelExplorer and FabStory import from those. Launch bundle: no codex, portal or Codex-named chunk; no passcode; no staff name.
- Pre-existing: four SOURCES.md notes files under assets/ (newsroom, iaq, culture, culture/offices) were shipping in dist-launch and one names IAQ staff. Added to the prune list in tools/prune-launch.mjs; 0 .md files in the bundle now.
- Pre-existing, left as is: "IAQ Utility Solutions" appears once in the Contact chunk (the registered company name on the contact page, to confirm with IAQ whether it should read IAQ Group).


## 24 Sep 2026, late night: the Services page replanned and rebuilt, one step at a time (Bazil: "look at the services page and plan what's best to actually show to the web, plan well detailed, execute one by one", "make sure art direction is also good and premium")

Before: nine screens at 1440; the six services shown four times (cover ring, chart header, serpentine, unit cards); the fab with pins on the cover repeating the home explorer; the square-box ring and mono chips on the cover; work cards twice; the chart before the units.

| Step | What | Art direction | Files | Check |
|---|---|---|---|---|
| 1 | The page opens with the cycle band (h1, lede, three plain facts, the serpentine). Ring and chips gone; the old mid-page serpentine section gone | one screen, white, calm; the marks are the only objects | ServicesHub.jsx, CycleBand.jsx (`head` prop), cycle-band.css | one h1, em on one line at 1440 |
| 2 | The three units second (the buyer chooses the unit first) | unchanged content | ServicesHub.jsx order | section order read back |
| 3 | The one-view chart third, without its four work cards | the chart ends on its key | SystemMap.jsx | 989 to 721 px |
| 4 | What to settle: unchanged | | | |
| 5 | The work band: the Revit fab with its nine pins beside the three kinds of work, hover-synced (a card lights its pins, a pin lights its card), the fab sticky beside the cards on desktop, then who does what | the fab is the one picture of the band, pins in the Codex colours, no legend (the cards carry the systems) | components/FabLayers.jsx (from ServicesCover's right half, LAYERS exported), ServicesMap.jsx WorkBand, services-map.css | tools/probe-work-hover-0924c.mjs: MEP lights pins 2, 3, 8 |
| 6 | FAQ: unchanged | | | |
| 7 | Proof: five projects with real photographs, one market each (PROOF = [2, 6, 12, 16, 17]); the two team-photo placeholders (prj-001, prj-012) out until IAQ sends photographs. The counters were never wrong: 247 / 1,036,740 / 444 were the count-up caught mid-way | | ServicesHub.jsx | capture |
| 8 | Closing band: unchanged | | | |

After: about 8.6 screens at 1440 (8692 px), each thing shown once, order = what you buy, how it runs, how it is contracted, who does the work, proof, questions, contact. ServicesCover.jsx stays as the source of LAYERS and for FabLayers; it no longer renders.
Backups: src/_backups/services-0924c.


## 24 Sep 2026, night, after "ok proceed": glows out, the film, the dropdown panels

| Item | Done | Where | Check |
|---|---|---|---|
| Glows on the slides and the fab story (open since 18 Sep, decided on Bazil's "no glowing" for the map) | Nine coloured blurs removed: key dots, list bullets, pins, the red lines and arcs on the slides, the fab story's active band; the unit block's red shadow is a neutral one | codex-slides.css, codex-parts.css, codex.css (backups src/_backups/noglow-0924c) | grep finds no `0 0 <blur>` shadow or glow filter left; slide export audit |
| The Bosch film labelled as IAQ's | The film card is dormant: no page renders #filmCard, so no label shows. The dormant iframe title in scenes/home.js now says what the film is | scenes/home.js | grep |
| "improve all the vertical visuals for each dropdown" | The lead panel of every wing: IAQ's own photographs cropped for it (public/assets/menu/lead-*.webp, 720 x 1120): the headquarters from the air (About), the litho bay of a cleanroom IAQ built (Services), a plant at dusk (Markets), the office with the red chairs (Careers). Scrim clear at the top and deep at the foot so the picture reads. Mono eyebrow gone, mono link gone: Switzer, sentence case, title 20px. Seven stock hover previews replaced with IAQ's own (cap-epc, cap-pcu, cap-energy, svc-design, svc-construct, svc-commission, svc-hookup); originals in _backups/menu-0924c | Nav.jsx LEAD_BG, base.css .nm-lead rules | tools/probe-wings-0924c.mjs, probe-wing-hover-0924c.mjs (row hover still swaps the picture) |


### 24 Sep, later: the map is back on Services, and the flow diagram (Bazil: "don't remove the things I want in the services that explain all 3 parts, units, services and others in one flow, and create diagram")
- Restored: the four work cards at the foot of the one-view chart (step 3 undone), and the relationship map (MapBand, RelExplorer) straight after the chart. It had left the page earlier on 24 Sep when the chart arrived. Order now: head, units, chart, map band, questions, work band, FAQ, proof, closing.
- New: components/OneFlow.jsx + styles/one-flow.css, at the top of the map band. Five stations left to right joined by chevrons: business unit, bought as, services, work, systems. Three unit tabs; the unit's chips light along the row (core solid, "when you ask" dashed, others faint), one sentence reads the row (lib/relations.jsx sentence). Turns through the units every 4.6 s until touched; reduced motion, no turn. Stacks with down-chevrons under 1100. Data: business.js and relations.jsx, the same as the map and the Codex.
- Checked: tools/probe-svcmap-0924c.mjs (24 lines, 0 off a card, 4 work cards), tools/probe-oneflow-0924c.mjs (EPC: 6 services, 3 work, 15 systems; EFM: 2 + 3 asked, 1 work, 6 systems; nothing past the edge at 1440, 1024, 390; 0 errors).
- Lesson: on this page nothing that shows the parts together comes off without Bazil's word, even where it repeats.

- 24 Sep, later (Bazil on the Services panel: "empty room does not represent us", "we're more red and greyish"): the Services lead is IAQ's crew in a cleanroom IAQ built (cr-team-dscn6580), graded to 55% saturation so the green suits sit grey and the panel reads grey, white and red. The six hover previews I had swapped to empty rooms (hookup, commission, construct, pcu, epc, energy) are back to their originals, which were already red and grey (red valves, the crane, the counter, the gas panel, the red folder, the grey plant room); svc-design keeps IAQ's boardroom. RULE for IAQ imagery: people or work in shot, and a red-and-grey palette; no empty rooms, no amber.

### 24 Sep, close of the night ("you done? you sure?", "all the task", "the list", "I need visual representing this")
- The map's nodes carry pictures now (components/codex/RelExplorer.jsx, shared by the Services page and the Codex): services carry the isometric cycle marks in a disc; units carry IAQ's photograph as a strip; work carries IAQ's BIM render of that layer (bim-str, bim-acmv, bim-process, cropped to public/assets/iaq/thumbs); systems carry a line icon each. Lines still land on their cards (probe-svcmap, probe-relx: 0 off a card at 1440 and 1100). Pictures are hidden in print.
- The slides, the set PDF and the Codex PDF were republished after the glow removal (they had still carried the glows).
- tools/probe-overlap-pages-0924.mjs: the site-wide text audit. On home and Services at 1440, 1024, 390: 0 overlaps, 0 past the edge, 0 errors; the 38 "cut" flags were checked one by one (tools/probe-cutcheck-0924.mjs) and every one is a transform-scaled child reporting its unscaled height, with no visible text outside its box.


## 24 Sep 2026, late: Services, the live 3D and the units in detail (Bazil's notes, in order)

| Note | Done | Where | Check |
|---|---|---|---|
| "a diagram of building and structure on top of this diagram, so while we're selecting we can see what it is showcasing" | FabStage (the 61 frames with pins) drove from the map's pick | components/FabStage.jsx (extracted from FabExplorer, shared) | probe-mapstage |
| "use my 3D ... start from the parallax 3D, but instead it shows everything in detail as we select; everything about this business we can know from there" | scenes/fab3d.js gained a DRIVEN mode (opts.driven): no scroll, the hero bays built with every system (u = 8.45, camera close, no envelope), `stop.focus(keys)` lights the systems named, greys the rest, and calls out their part names. components/FabDriven.jsx maps a pick to systems (units, services, work, systems) and draws the key; a key press picks in the map. One WebGL retry after a second, then the frame stage stands in | scenes/fab3d.js, components/FabDriven.jsx, styles/fab-driven.css | tools/probe-fabdriven-0924.mjs: unit 2 lights 3 and 8 with eight part names; key 4 picks MEP |
| "how do we make this view manageable and see both in one go, landscape", "must look great side by side, premium, part of the same view" | One surface: the 3D, its key (a list under the model) and the reading panel (picture + sentence) on the left, pinned; the map on the right in a compact grammar (rx-compact); stacked under 1280 | ServicesMap.jsx MapBand, services-map.css, RelExplorer `read` prop, `visFor` exported | probe-duo: side by side, both in view at 1440 x 900, 12 lines all on cards |
| "I'd like the description be on the right with the icons stuff", "make the title shorter", "just put name, no need Construct then Construction", "no need to put them in circle", "improve this flow", "have this flow once every 3 seconds" | CycleBand: lede and facts right of the heading; "Six stages, one accountable team."; one name per stage (Design, Procurement, Construction, Commissioning, Maintenance, Tools Hookup, the last with its loop line); no discs; the return a heavier travelling dash; the active stage steps every 3 s until touched | CycleBand.jsx, CycleFlow.jsx, cycle-flow.css, cycle-band.css | probe-cycauto: 0 to 1 to 2 over 6.5 s, discs transparent |
| "super detailed when click Read more for all 3, otherwise easy, straight to the point", "iconise Cooling as a Service, EPC and EPCM", "perfect visuals that represent each", "including a diagram in detail view of how it works for each", "make sure the titles correlate" | The card is short: picture, name and its expansion (unit 2 now its own full name), the line, Call when, the models as iconised chips, Read more and Open. Read more opens a panel under the row (one at a time): the how-it-works diagram (UnitDiagrams.jsx: EPCC vs EPCM lanes; utilities rising to the tool and the four phases; Cooling as a Service and Energy Performance Contracting lanes) beside everything stated about the unit (what, when, models with marks, what you buy, six services, work with systems, term, markets, typical requests, the page). ModelIcon.jsx draws the six models. Unit 2's card picture is IAQ's model with the tools in | ModelIcon.jsx, UnitDetail.jsx, UnitDiagrams.jsx, ServicesMap.jsx UnitsBand, services-map.css | probe-units: 3 cards, 6 model marks, every panel opens with its SVG and 8 rows, nothing past the edge at 1440 and 390 |

Traps: the map's tour toggles a pick off if a probe clicks the same node (click a different one first); `.fab-legend` in fab-assembly.css is absolute over the canvas, so the driven stage overrides it to static; a `.cyc-fit` "cut" flag is the scaled child, not a clip.
Backups: src/_backups/services-0924c (CycleFlow, CycleBand, cycle-flow.css, ServicesMap, services-map.css pre-detail), src/_backups/relx-0918 (fab3d.pre-driven.js, FabExplorer.pre-stage.jsx, RelExplorer.pre-visual.jsx).
- Later: "can't really see clearly": the driven scene starts in close (S.zoom 1.75, pitch 0.2 at init, so reset returns there), the key is two columns with full names, and the stacked duo uses minmax(0,1fr) so the canvas's intrinsic width no longer pushes past a phone. A missing SROUTE on the home explorer (lost in the FabStage extraction) is back; home is error-free again.

### 24 Sep, last: the studio (Bazil: "it still looks bad and not professional enough, find out how to do it beautifully", "amazing UI UX", "search and use Pinterest", "done, find the best")
- Reference: a Pinterest search for exploded axonometric building-systems diagrams. Every strong one is on WHITE, thin grey lines, one accent colour, labels on fine leader lines, the layers separated with air round them. Nothing sits on a night sky or brown earth. The 3D agencies' own rule (Utsubo's 2026 round-up): one hero object with real weight, cinematic framing as an exhibition piece, type beside the 3D and not competing with it.
- Applied to the driven scene (scenes/fab3d.js, driven only): clear colour and fog #F7F8FA; a 24 mm lens (fov 24, nearer an axonometric); yaw .92, pitch .36, zoom .88 so the whole cluster stands with air round it; earth, hardstanding, backfill, site props, crews, machines, the sky and the air particles all hidden, a ShadowMaterial plane catches one soft shadow; lights lifted a shade for white. The home page's scroll scene is untouched.
- Chrome: the key is a white row of the eight systems (lit ones ink, the rest grey); the callouts are ink dots, grey leaders and white chips in Switzer; the zoom buttons white; the map beside it loses its dotted grid and its lines thin to 1.6; the reading panel is the same light tint with a hairline.
- Backup: src/_backups/relx-0918/fab3d.pre-studio.js.
- Callouts: fab-assembly.css hides every .fab-lab but the pick (15 Sep, the key replaced them); fab-driven.css shows them again in the studio, where the part names of the lit systems on leader lines are the detail Bazil asked for. Verified: eight labels displayed and in view for MEP.
- Callout placement in the studio: a chip that would pile on another near the frame's foot is pushed up instead, and one that still lands on another is left out; six at most. Verified: five shown for MEP, no two within 40 px.


## 24 Sep 2026, last: the home page cleared, and the Services 3D done to Bazil's references

| Note | Done | Where |
|---|---|---|
| "these are not supposed to be in the home page" | FabExplorer is off the home page (order: hero, cycle, record, fab, industries, closing). The component stays for Services | pages/Home.jsx |
| "please improve this, you have Pinterest" (the map) | The map beside the 3D in the boards' grammar: white node cards on hairlines, grey type, thin grey connectors with hollow dots, colour only on the lit chain, the picked node filled; the reading panel is the sentence with a service's mark, no photograph; "Business unit" as the column head | services-map.css (.rx-compact rules), RelExplorer.jsx, ServicesMap.jsx |
| "need 3D very clean, easy to identify, coloured, structured but detailed enough, zoomed in enough, enough visual space" with three references (dark cards, white clay models, one element lit in colour, pins on stalks) | fab3d.js driven mode: charcoal #14181F ground with a fine grid and a shadow catcher; the model in white clay at rest; on a pick the touched systems come back in their true BIM colours and lift, the rest dim to slate at half opacity; edges white; lens 24, zoom .94, pitch .34, the view offset down 7% so the roof and the pins above it have room; callouts as pins on stalks (dot, 26px stalk, white pill); at most six, none within 40 px, none in the top 64 or bottom 44 px, the view clipped; the key a dark two-column row under the model; the duo 50/50 | scenes/fab3d.js (driven branch of setLook, the studio block, placeLabels), styles/fab-driven.css, services-map.css |

Checks: tools/probe-duo-0924.mjs (side by side, both in a 1440 x 900 screen, 12 lines on cards), probe-labels (5 pins for MEP, all in view), probe-studio captures for EPC, MEP and hookup; crawl 34 routes clean; home and Services 0 overlaps at 1440, 1024, 390; launch bundle clean.
Backups: src/_backups/relx-0918 (fab3d.pre-studio.js, fab3d.pre-clay.js, fab-driven.pre-clay.css, RelExplorer.pre-quiet.jsx), src/_backups/services-0924c (services-map.pre-quiet.css), src/_backups/home-0924b (Home.pre-noexplorer.jsx).

### 24 Sep, the close: the digital twin (Bazil, with a dark digital-twin dashboard: "this kind of render and detail looks good, but of course IAQ theme")
- fab3d.js driven: at rest the model is dark slate with fine white edges (the detailed dark model of the reference); a lit system becomes a hologram in its own KEY colour (surfaces half-clear, self-lit, additive edges, an UnrealBloomPass at strength .28, threshold .86 so only the bright edges halo); a system outside the pick dims; near-white keys (structure, tools) glow at a third and stay solid so they never bloom to a blob. Ground #0F1319 with a fine grid. The pick marks stay IAQ red. The home page's scene is untouched (driven branch only).
- Verified by capture for MEP (cyan and red and gold on the dark model), EPC (all eight lit) and hookup (tools and PCW); pins in view, none piled.
- Backups: src/_backups/relx-0918/fab3d.pre-holo.js.


## 25 Sep 2026, morning: Bazil's notes through the night, one by one

| Note | Done | Where |
|---|---|---|
| "the top part is grey getting whiter and whiter as it goes to section 2" (record band) | Ground runs #E1E6ED at the top to white at the foot, meeting the white ring section. The red tint of the night before is gone. Both `.glance.gr` rules carry the same gradient | styles/group-record.css |
| "don't cut the lines, expand the canvas" | The globe frame is measured in CSS px (`clientWidth`), not the bounding rect: the page runs at zoom 1.12, so the rect is 12% larger and every chip sat 12% too far right and down, the USA chip past the edge. Canvas = section at 1440, 1024, 390; seven chips inside | scenes/home.js frameDims/resize |
| "fix a more direct title for IAQ, the font not cutting each other, no , or ." | h1: IAQ builds and runs / hi-tech facilities / that cannot fail. No punctuation, line-height 1.08, each masked line keeps its descenders. Lede: "Cleanrooms, dry rooms and the systems that hold them in spec. Designed, built and maintained by one team for 31 years." | pages/Home.jsx, styles/home.css (end) |
| "where's the previous design where people working on ceiling, white background", "use that" | The About story band is white again with the crew clip (about-story-build.mp4, poster about-story-broll.webp), flopped so the crew sits right of the words; no eyebrow. The 17 Sep client note "too white" is on record against this | pages/About.jsx, styles/about.css (man-light block) |
| "just what is IAQ" | Vision heading: What IAQ is | components/VisionMission.jsx |
| "remove this" (the four-photo strip: headquarters, ISO 3, on site, the team) | Gone | pages/About.jsx |
| "create visuals and icons for each" (History records) | Six isometric marks in the family (envelope, chiller, plant, award, medal, safety), red accent; the four new ones are in the Codex family under Records | pages/History.jsx recIcon, components/IsoIcon.jsx, codex/IsoFamily.jsx |
| "remove this" (See the projects row) | Gone | pages/History.jsx |
| "make this view more dynamic" (the reading rail) | Year and title slide in on every change, a red progress bar and "n of 17", the spine turns red behind the reader, the live mark rings, figures ease in from a slow zoom, meta rows stagger. Verified: item 4 in the middle band reads 2009, 4 of 17, three past | components/HistorySpan.jsx, styles/history-span.css (end) |
| "create a video banner that's awesome for this" (History head) | VideoBanner.jsx: full-bleed crew clip under a dark scrim, crumbs, a 1995 to 2026 line that draws, the title, lede and the paragraph that sat in a grey band below. The grey band is gone | components/VideoBanner.jsx, styles/pages.css (vb block) |
| Services banner, "the whole 3D takes the whole space" | The frames carry empty sides (measured: the model holds 36 to 71% of the width at full height in most frames, 13 to 82% at rest). The box is 1.35 and the frame covers it; FabStage remaps the pins by the same 12% crop; a pin past 62% carries its label on the left. The scale(1.32) try of the night is out | styles/services-map.css, components/FabStage.jsx CROP |
| "tag and point correctly with icons", "colour code it to match" | The dot sits on its point (the span was centred, so the dot slid as the label opened); every lit label carries an isometric mark; lit pins take the picked kind's colour (unit red, service blue, work black #231F20 (white on dark bands; yellow retired 26 Sep, IAQ rules: no yellow), system green). Phones hide labels again | styles/fab-explorer.css (end), FabStage.jsx |
| The model blanked mid-scrub (headless: src "", naturalWidth 0) | useDecoded: the img shows only a frame that has decoded; the scrub runs one decode behind. 0 blank samples in ten during a scrub at three widths | components/FabStage.jsx |
| "fix this animation" (cycle return) | The return is a grey wire with the same dotted red stream as the loop, into the head; the old 108px travelling segment and its three fighting rule sets are overridden by one rule | components/CycleFlow.jsx, styles/cycle-flow.css (end) |
| Subsidiary name in the launch bundle (Contact, Singapore second office) | The name is off; the address stays as "Second office". Launch rebuilt: passcode 0, codex chunks 0, SOURCES.md 0, subsidiary name 0 | pages/Contact.jsx |

Checks: tools/probe-0925a.mjs (home hero and record, About story, History banner and records, Services cycle and pins); crawl-all 34 routes, 0 flagged; overlap audit: the remaining flags are the dev ribbon in the footer, the values carousel's stacked cards (by design), the story clip's 8px flop overflow inside an overflow-hidden band, and the home industry cards clipping 8px of their foot at 1440 (pre-existing, open).
Backups: src/_backups/about-0925 (About.jsx, about.css, History.jsx, HistorySpan.jsx before today).
Open: Bazil sent two tall captures (780 x 5368 and 576 x 4271) at the end with no words; they did not reach the session, so nothing was done on them. The Services banner layout (model left, panels right) against his two dashboard references (panels both sides) is still his call. Home industry card foot clip.


## 25 Sep 2026, later: the real fab in the banner, and the colour swap

| Note | Done | Where |
|---|---|---|
| "this shouldn't be a visual, it should be actual 3D", then iaq3d.netlify.app ("take everything") | The banner is the Revit model itself. The app splits the fab into one meshopt-compressed GLB per storey per layer with a manifest per layer; 20 layers are mirrored (public/assets/iaq/model3d, README there; the heavy full-detail variants are not). scenes/fabreal.js: three.js, GLTFLoader with the meshopt decoder (and Draco set for good measure), OrbitControls (drag to turn, no wheel zoom so the page still scrolls, zoom buttons), shell and structure at rest in the app's light grey on the dark ground, every other layer fetched the first time a pick needs it, lit layers in the kind's colour lifted 22% to white so edges read, the rest ghosted slate at 32%. The rest pose fits the world box to 90% of the frame by projecting its corners. components/FabReal.jsx maps every pick to layers (SYS_LAYERS by system; work = its systems; construct, EPC and the models = the whole building; hookup = the tools layer), places a pin per lit layer from the projected top of that layer's box, lifts a pin that would land on another, and picks the owner back in the map. Without WebGL the frame sequence (FabStage) stands in | scenes/fabreal.js, components/FabReal.jsx, styles/fab-real.css, ServicesMap.jsx MapBand |
| Traps met on the way | The app's GLBs come pre-gzipped from Netlify (curl saved gzip bytes; gunzipped on disk). They are EXT_meshopt_compression, not Draco: GLTFLoader needs setMeshoptDecoder or every file fails with "setMeshoptDecoder must be called". Headless SwiftShader cannot draw 5M+ triangles between screenshots (blank captures); verify on the GPU with `--use-angle=metal` (M2 Pro: 8.5M triangles in 1.4 ms) | tools, this note |
| "nah this needs to be red back", "the unit is blue and the service is red" | Kind colours: service RED, business unit BLUE, work yellow, system green. Swapped in the tokens (codex-parts.css .cx3, services-map.css, fab-explorer.css .fx, one-flow.css .of, the dark map block), the IsoIcon accents (RelExplorer, ServicesMap reading, IsoFamily, FabStage pins, CycleFlow marks) | those files |
| "the map half, the 3D the other half, or maybe 3/7" | 4:3 model to map from 1280 | services-map.css |
| Tablet capture: the model over the map cards | The stage is sticky only from 1280; stacked it is a block above the map | services-map.css |
| "this picture should be isometric icon rather than OpenGL 3D or flat icon", "you know our design already" | Read as: the icons stay the isometric family (they are). No change | |

Verified (tools/probe runs, 1440): rest 1.07M triangles drawn at 0.6 ms; MEP 5.5M at 0.9 ms; tools hookup 8.6M at 1.4 ms; EFM 4.1M; pins placed, none piled; 0 console errors. Captures in the session scratchpad v18.
Open: the model could stand a touch larger in the box; six MEP pins stack in one column; the tools layer is 20 MB on first pick (a "lite" of the lite would help); the launch bundle now carries 58 MB of model.


## 25 Sep 2026, afternoon: loader, About seam, the 3D made solid, the board, the icons

| Note | Done | Where |
|---|---|---|
| "loading screen white, a super detailed world with dots, the map done well, accurate", "load properly" | scenes/home.js init2d: a 2D canvas. The 192 x 96 land mask is sampled at four times its grid with bilinear smoothing (clean coastlines), the mask's one-cell frame treated as sea, Antarctica left off. Drawn once offscreen, revealed west to east with the real load, offices in red with a breathing ring, names in ink (Singapore's under its point). Logo fills at the foot. The old WebGL globe loader is in _backups/loader-0925 | scenes/home.js, styles/home.css (end) |
| "this transition should fit better" (About hero into the white story) | A white fade over the hero's foot (::before, z 2) and the crew clip's top fading up from white | styles/about.css (end) |
| "why is the 3D breaking", "no need the ground", "one building or parts", "check you got the right one" | Three causes found. (1) Half-clear ghosting sorted badly and left a hollow building while a pick's layers were on their way. Now nothing is transparent: the building is solid light grey at rest, solid slate when picked; the lit layers are rendered in a second pass over a cleared depth buffer, so they show through the walls whole. (2) The app's manifest-detail-exterior-v3 is its alternative site (V3, "the utility building moved"): a second utility building 100 m to the west. It doubled the building whenever CSA, EPC or Design was picked. Dropped from the layers and the mirror. (3) Every layer is now preloaded on wide screens after the building stands (smallest first, two at a time), with the hint counting them, so a pick lights at once. The ground plane is gone. Camera lowered to the app's own view. The model is the app's "Overall" build: shell + structure + 18 detail layers, one facility (the fab on piles and its utility building) | scenes/fabreal.js, components/FabReal.jsx |
| "can this look a lot better", "too messy", "don't want this side" (units board) | No label column: each cell carries a small caption. Picture clean, the unit line under it, name and full name, the line, Call when, Bought as (quiet tinted chips, no descriptions until Read more). Read more centred under the board. Phones: one unit at a time by a tab row | components/UnitsBoard.jsx, styles/services-map.css (board block) |
| "detailed flat or isometric icons instead" | Every icon in the family redrawn with more parts (six to fifteen solids), same grid, tones and accent | components/IsoIcon.jsx (ICONS) |
| Tablet map | Areas: services and work left, units right, systems two columns below. A stray `}` in services-map.css (left by a block removal) had killed every rule after it, which is why the first try measured `areas: none` | styles/services-map.css |

Verified (GPU, 1440): rest solid, 20 layers, 0.5 ms; EFM 0.9 ms; tools 1.3 ms; CSA 1.1 ms; 0 console errors. Loader: white map, 99% at 2.1 s, dismissed by 5 s. Board: 13 rows open, no label column, 0 past the edge. Tablet map areas measured "s u" "w u" "y y".
Traps: a CSS block removed by index can leave its closing brace; count braces after such an edit (python: depth never negative). The app serves storey GLBs pre-gzipped and meshopt-compressed; layers with a `source` line come from FBX and may be alternative geometry, read the manifest before mirroring.


## 25 Sep 2026, later: the main fab only, the loader back on white, positive copy

| Note | Done | Where |
|---|---|---|
| "we just need the one building in the middle, concentrate on that", "can't you fix the building", "no broken parts, solid quality" | The app's storey meshes merge the whole site into one mesh per material, so the annex and the apron deck cannot be hidden by mesh. Two clipping planes on every material (x ≤ 41.2, z ≤ 5: the main fab is where its steel frame stands) cut the model to the fab; meshes wholly outside are hidden; the camera frame and the pins use the clipped box. Trap: two GLOBAL planes set before the first render left the model blank until the programs were rebuilt; local planes on each material from creation work. Lit layers are now drawn with true depth in the first pass (solid and occluded where in view) and again over a cleared depth buffer in a see-through tint of the same colour (a glow where behind walls). The lite layers (decimated, flat normals per their manifests) are flat-shaded so their facets read crisp | scenes/fabreal.js (KEEP, CLIP, ghosts, renderPasses) |
| "revert back the old loading screen, what I meant is white instead of dark" | The WebGL globe loader restored from _backups/loader-0925, on a white radial ground; dot shader ink near, grey far; logo fills red over light grey; tags ink on white. The 2D map loader of the morning is gone | scenes/home.js, styles/home.css (end) |
| "no negative statements in this website" | Hero: that keep running. PCU: the utilities a production tool runs on. EFM: IAQ funds the work upfront / paid from the saving / funded by IAQ. CapTool: with the classification held, stay outside the cleanroom, the last step stays inside one team. Data centre head: around the clock. History: a clean lost time injury record. Diagrams: IAQ's capital, the owner's saving; a fab that keeps running. Codex scenarios and FAQ reworded. Left as they are: quotations from IAQ people (the chairman's "None of this would have been possible without"), newsroom banner text in alt attributes, the Codex's own definitions ("a system is never a service"), policies | pages/Home.jsx, CapPcu, Home2, CapEnergy, CapTool, Codex, Esg, MarketDataCentre, History, components/CodexSlides, UnitDiagrams, data/business.js, data/codex.js |

Verified (GPU, 1440): rest solid fab, 19 layers, 0.6 ms; PCU & TTI 2.4 ms with four pins; EFM 0.9 ms; Fire 0.8 ms; 0 errors. Loader white at 1.5 s, gone by 6 s. Launch rebuilt, 178 MB, leak checks 0, "cannot fail" 0.


## 25 Sep 2026, evening: the twin in the app's colours, flat icons in the map

| Note | Done | Where |
|---|---|---|
| "does it seem like the 3D is broken?" (a zoom on the front, lower half) | Three things were, each fixed: the flat grey plate mid-height was one of two huge low-poly site plates merged into the shell (120 and 72 triangles across 80 to 130 m at roof height), now hidden by a size rule in loadLayer; the blue piles lit as "process tools" came from detail-support (the structure's pile and column supports), taken out of the process mapping; the torn facade was the shell's south wall with the deck openings, now cut at z 1.2 so the floors show in section as the app's Overall view has them (frame, walls and systems keep the z 2.6 cut) | scenes/fabreal.js |
| "it looks so far ok here" (the app's Overall) | Every layer shows at rest in its own colour, PALETTE in fabreal.js (walls green, ducts blue, sprinklers red, electrical orange, pipes green, water blues, plant and tools pale, building light); a pick keeps the lit layers in those colours and greys the building. Frame 1.4 ms at 17M triangles on the M2 Pro at rest | scenes/fabreal.js |
| "didn't I say use flat icon here" (the map) | The map's nodes and the reading panel carry the flat line set (FlowIcon) in the kind's colour; the pins too. The isometric family stays on the cycle band, the board marks and the Codex page | components/codex/RelExplorer.jsx, ServicesMap.jsx, FabReal.jsx, services-map.css (end) |

Verified (GPU, 1440): rest 19 layers coloured, PCU & TTI, HVAC, cleanroom envelope captures; 0 errors.


## 25 Sep 2026, night: the client's review, the client's files, the hero on IAQ's own photographs

| Note | Done | Where |
|---|---|---|
| "make the loading screen better" | The globe has a body (near white, a grey-blue rim in a fresnel shader) that hides the far hemisphere. The dots rise out of the surface in order of angular distance from Shah Alam instead of flying in from a random cloud (the first two seconds read as dust). Dots ink and larger; logo 272 px; the count in Switzer with tabular figures; office tags sentence case on a white pill with a red point, and the keep-out now tests the whole tag box against the logo | scenes/home.js (loader init), home.css end block |
| "this shouldnt be clickable" (the seven market tiles) | Spans, not links: no route, no hover lift, no focus ring, no underline rule. The 3D mode (?marks=3d) keeps pointer hover only | components/HeroMarkets.jsx, home.css `.hmk-it` |
| "use this copywriting" (the hero of the client's 24 Sep review) | "We build the / environments where / the future is made." The red phrase whole on the third line (516 x 99 px at 1440, one line) | pages/Home.jsx |
| IAQ 24 Sep: "This AI video is still wrong ... Better not to use other video that does not involve construction and installation"; Bazil: "for the video please fix" | The reel is four 8 s slow moves rendered from IAQ's own photographs (ffmpeg zoompan over 3840 px masters): the IFKM site from the air mid-build, a cleanroom fit-out (P1010229), a panel install with the ladders in (WhatsApp 2024-12-04, 1080 px source, the softest), the Kuching plant at dusk. The poster is the site aerial. The share holds NO real construction footage: the only project video is an Enscape-style render walkthrough of the Hasegawa exterior, and the event videos are a company trip, robot testing and celebrations | scenes/home.js SRC, home.css `.hero-video` poster, public/assets/videos/hero-site-aerial, hero-cleanroom-build, hero-panels, hero-plant-dusk, public/assets/hero-site-poster.webp, assets/iaq/SOURCES.md |
| "im sure u have access to all the videos and pictures", "create a tab here", "keep all the comments", "store it and show it in this tab" | The store is `Client info/IAQ` (outside the repo). Added: the two 22 Sep booth zips (Green Excel, SEMICON Munich Nov 2026) as `OneDrive 2026-09-22 (SEMICON Munich booth, Green Excel)` and the feedback PDF plus the two Gemini notes as `Feedback and meeting notes`. The Client files tab (super admin bar, every bar copy) shows all 1,113 files, 11.3 GB, in the client's folders: deliveries ledger, what arrived but is not IAQ's, the client's comments, filter chips, search, a lightbox for photos and videos. Served on dev and preview only by a Vite middleware from outside public/, so no build can carry it | tools/vite-client-files.mjs, tools/client-files-index.py (manifest and thumbnails into _reference/client-files), tools/client-files-page.py, vite.config.js, components/AdminBar.jsx and the five static bars |
| "im not sure is this all fom iaq?" | No. `OneDrive_3_14-09-2026 (2).zip` and `OneDrive_1_23-09-2026.zip` are Tenthpin's photo sets (office, training, SAP banners; already in tenthpin/client-photos). `IAQ-Company-Profileddd.zip` is our own Company Profile V3 HTML. Only the two 22 Sep zips are IAQ's | the ledger on the Client files tab |
| "stronger grey please gradient" (the record band) | The ground starts at #C9D1DC and holds to mid-band before the fade to white; both `.glance.gr` rules carry the same stops | styles/group-record.css |
| "make sure these are correct" (the facility map) | Read against IAQ's papers, table below. Fixed: EFM carries Build Operate Transfer as a third model and its `what` names energy audit, chiller and HVAC upgrading and O&M (Q-EM lists all six) | data/business.js |
| "why the 3d look so bad" (a zoom on the pile caps) | The structure layer runs to y -4.3 with the piles and caps; with no ground they hung in space. A third clipping plane at y 3.95 (the shell's slab is at 4.1) cuts them; meshes wholly below are hidden; KEEP and the framing start at the slab | scenes/fabreal.js GROUND_Y |
| "remove this info" (a tooltip over the map legend: "Keeping app data separate makes it easier to manage your privacy") | Not ours. The text is in no source file and not in the live DOM; the legend spans carry no title. The only titles in the map are the EPCC and EPCM chips' full names. It is a browser tooltip (Chrome's own) and cannot be removed from the site | checked with grep and the DOM |

The facility map against IAQ's documents (Q-EPC, Q-EM, Q-SL, DV3, COPY, DECK; the 18 Sep CROSSCHECK in data/codex.js already covered names, sector, EPC vs EPCM):

| Claim on the map | In IAQ's papers | Verdict |
|---|---|---|
| Six services, their names and order | DV3 A1.3, COPY | documented |
| EPC: EPCC and EPCM, "IAQ answers for the system working as intended" | Q-EM and Q-EPC, near verbatim | documented |
| EPC term 12 to 24 months | Q-EPC: "it could range from 12 months to 24 months" | documented |
| PCU & TTI: semiconductor only; standalone or on the EPC or EPCM model | Q-SL, DECK | documented (18 Sep) |
| PCU & TTI term "Per tool set" | nowhere | inferred, ask Nabilah |
| EFM: CaaS is a fixed tariff; EPC contracting is paid from actual savings; IAQ funds the implementation | Q-EM, verbatim | documented |
| EFM: Cooling as a Service, Energy Performance Contracting, Energy Audit, Chiller Plant / HVAC Upgrading, O&M, BOT for district cooling | Q-EM lists all six; the map had two | FIXED 25 Sep |
| EFM "10 to 20 years", "5 to 10 years" | not in any paper (from the 17 Sep review) | ask Nabilah |
| EFM "a registered Energy Service Company (ESCO)" | not in any paper | ask Nabilah |
| MEP systems: HVAC / ACMV, PCW, chiller plant and district cooling, fire, electrical, plumbing | Q-EM, COPY, DECK, the Revit set (ACMV, FPS, PW, CW) | documented |
| Process utilities: specialty gases and chemical, UPW, exhaust, waste treatment | DECK slide 1 (UPW, WWT, chemical and slurry, exhaust) | documented |
| Process utilities: clean dry air (CDA), process vacuum | not in any paper | inferred from the trade, ask |
| CSA and its four systems | the Revit set (ST, AR, the cleanroom model); no paper names "CSA" | grouping is ours, systems are the model's |

Open for Bazil / Nabilah: the hero lede (the client's 24 Sep screenshot carried "The end-to-end partner for cleanrooms, dry rooms and hi-tech facilities."; the crop Bazil sent showed the headline only, so the lede stayed); the three "ask" rows above; whether the Hasegawa walkthrough render may be used anywhere (the ten perspectives are held back for the client's logo).

Verified (pane, 1440): headline three lines with the em on one line; 0 links in the market row, 7 tiles, cursor default; loader body and dots at 54, 84 and 100 percent, tags clear of the logo; record band computed gradient rgb(201,209,220) at 0; hero reel `live`, first two clips readyState 4, poster the site aerial; Client files 1,113 tiles, 14 sections, 0 broken thumbnails, the tab lit; services 3D without the pile field, 0 errors. Unverified: Safari; a phone width crawl after these changes.

Recipes: the hero clips are `scratchpad/hero/make.sh` (zoompan over a 3840x2160 master, 240 frames at 30 fps, libx264 crf 21, the aerial re-cut at crf 26 to 3.1 MB); ffmpeg lives at `~/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1` (no system ffmpeg). Re-index the store after any new delivery: `python3 tools/client-files-index.py && python3 tools/client-files-page.py`.


## 25 Sep 2026, night: the client's notes and Bazil's second sweep

| Note | Done | Where |
|---|---|---|
| Client: remove "Design, procurement and construction under one contract." beside Start a project | Gone from the closing band (every page) | components/ClosingBand.jsx |
| Client: vision and mission, another picture or none, refer to the current site, not everything needs a picture | No photographs on the two cards; text cards as on IAQ's own site | components/VisionMission.jsx, about.css (end) |
| Client: the four-photo strip is unnecessary | Already gone this morning | pages/About.jsx |
| Client: check the core value descriptions | The six lines are IAQ's own, from iaqtechnology.com.my/overview (Core Values), each cut to its first sentence, the full paragraph kept in `full` for a detail view. Titles as IAQ writes them (and, not &) | data/values.js |
| "use a better video that depicts the actual work of IAQ, and disappears to white nicely into what IAQ is" | videos/hero-crew.mp4 (the crew lifting a fan filter unit into a cleanroom ceiling, the sharpest cleanroom-work clip on file; a poster made from its first frame). Scrim: white on the left, the vision section's grey along the foot. The other candidates: the Hasegawa walkthrough in Client info is a rendered exterior with the client's signage (client names stay off public pages), and the rest are events. Real IAQ site footage would replace it when IAQ supplies some | pages/About.jsx, History.jsx, about.css (end) |
| "better title" (What IAQ is) | What IAQ stands for, and where it is going. | components/VisionMission.jsx |
| "clicking should move as well" (values) | A click on the stage that lands on no card's button turns towards the side it was on (the deck's 3D transform leaves the side cards' visible faces outside their hit boxes, measured: elementFromPoint on a side card returned the deck) | components/ValuesCarousel.jsx |
| "don't put icons in a box" | The value marks stand on the card, red on the front card | styles/values-grid.css (end) |
| "these 3D icons look so bad, we had one before that was good, and the line is worse now, please revert" (cycle) | CycleFlow.jsx and cycle-flow.css restored from _backups/services-0924d (the 24 Sep marks and line), plus the overflow rule; this morning's files in _backups/cycle-0925 | components/CycleFlow.jsx, styles/cycle-flow.css |
| "remove this section" (units, services, work and systems in one flow) | FlowBand off the Services page; OneFlow.jsx stays | pages/ServicesHub.jsx |
| "remove this title", "make it fit well", "a very small line left, right and bottom" (markets hub) | No heading over the seven; the band inset 12 to 20px on three sides; cards a screen high | pages/MarketsHub.jsx, markets.css (end) |
| "better title, stop saying wacky things" | What each market requires. Lede: Each market sets its own measure: particles in a wafer fab, moisture on a battery line, kilowatt hours in a cooling plant. | pages/MarketsHub.jsx |
| "put a detailed icon visual for each market here" (market page hero) | The market's tonal mark (components/TonalMarks.jsx, the home hero row's set) at up to 300px on the hero's right; hidden under 600px | components/MarketPage.jsx, markets.css (end) |
| "greatly improve these icons" (business units in the nav) | Three new line icons in FlowIcon (epcUnit, pcuUnit, efmUnit); the unit `icon` fields in data/business.js and Nav.jsx point at them, so the map, the board, the Codex and the nav all carry them | components/FlowIcon.jsx, data/business.js, Nav.jsx |
| "very hard to navigate, maybe a dropdown", "documents and files to send are supposed to be the same" (portal) | Three group buttons, each opening a menu of its pages with notes; the current page named beside its group; the booth page's own tab row hidden inside the portal (one way to move); the Documents group's first page is All files, with the Codex beside it. Backup of the panel version in _backups/client-0925/Portal.jsx | pages/Portal.jsx, styles/portal.css (end) |
| "revert the old loading screen, white instead of dark", then "looks worse" | The globe loader on white; heavier ink dots, the far side keeping weight, the office points larger, the percentage red. The dark occluder sphere reads as a soft white globe on the white ground, which is what makes it hold together | scenes/home.js, home.css (end) |

Verified (headless, 1440): About clip hero-crew.mp4 with poster; hub no h2, grid inset 44px, cards 524px, title What each market requires; bio lifescience hero visual 323px wide at right; nav Services panel shows the three new unit icons; portal groups Edit website / Exhibition / Documents, Exhibition menu 7 pages, Documents menu All files + Codex, picking closes the menu and lands; values click 1 to 2, mark background transparent; cycle marks the 24 Sep svgs, no iso; flow band gone; 0 console errors.

Phone pass, after "is it all done?": (1) at 420px and under the two-column rule fought the swipe strip and the first two market tiles collapsed onto the third (two explicit 1fr tracks in an overflowing column-flow grid resolve to 0); a higher-specificity strip rule at the end of home.css wins on phones. Measured at 375 and 414: seven tiles 131 to 210 px wide, no overlap, the row scrolls, no page overflow. (2) The IFKM aerial's white roof spans the whole phone width and the lede sat on it at the scrim's lightest stop; the phone scrim holds .45 through the copy band now. Both were checked at 375 with the loader gone, 0 errors. The desktop was rechecked after each.


## 25 Sep 2026, late night: About, accurate

| Note | Done | Where |
|---|---|---|
| "cannot use this video because it's wrong", "we need to see some original videos, very important it's accurate" | No generated clip on the story band. It is IAQ's own site photographs from the 17 Sep SharePoint share (cr-build-2024: a cleanroom under construction; cr-utilities-p1010242: the utilities work; cr-litho-8566: the finished bay) in an 18 s crossfade with a slow drift, white at the left and the foot. NOTHING ELSE ON FILE IS USABLE: IAQ's site and YouTube carry no footage; the SharePoint videos are events (Robocon, company trip, Deepavali, Penang opening, Women's Day) and the Hasegawa walkthrough, a rendered exterior with the client's signage. When IAQ sends site footage it replaces the `.man-photos` block in About.jsx. The generated clips stay on disk for the other pages | pages/About.jsx, about.css (end) |
| "this section should be white, the cards can be different", "remove the link", "two visuals representing this" (vision and mission) | White section, #F3F5F8 cards, no links, two 72px drawn marks: visionMark (a region seen from above, a facility rising, the sun over the horizon) and missionMark (a facility held between two hands, a leaf) | components/VisionMission.jsx, FlowIcon.jsx, about.css (end) |
| "make sure content correct" (values) | The V-06 photograph (MCIEA stage) showed a subsidiary's name on the screen; it is the finished ballroom now. SOURCES.md notes it. The six value lines are IAQ's own (earlier tonight) | components/ValuesCarousel.jsx, public/assets/iaq/SOURCES.md |
| "background colour should be the same as the footer, so it seamlessly combines" | The values band on #17213A (the closing band's ground, base.css), its foot shortened | styles/values-grid.css (end) |
| "isn't it supposed to be all dots" (loader) | The occluder body is not drawn; the world is dots front and back, the far side lighter and smaller; the office points are round sprites | scenes/home.js |

Verified (headless 1440): 3 story photographs, no video; vm white, cards #F3F5F8, 0 links, marks 81px with 8 and 9 strokes; values band and closing band both rgb(23,33,58); no mciea-award image on the page; 0 errors.


## 25 Sep 2026, past midnight: the hero line, the units as coloured cards, the flows, the map's marks

| Note | Done | Where |
|---|---|---|
| "We build / environments where / future is made, for the banner" | As sent, three lines, no punctuation, the red phrase whole on the third | pages/Home.jsx |
| "are these the best pictures to represent" (units) | IAQ's own: site-aerial-build (EPC), cr-utilities-p1010244 (PCU & TTI), plant-dusk-02 (EFM) | components/UnitsBoard.jsx |
| "icons not in a box, blue icons", "vertical alignment", "more premium", "something dynamic" (a reference of coloured cards with cut corners), "dark blue, blue, light blue" | The three heads are cards in #0F2D57, #0B8FD8, #5CBCF5 (ink type on the light one), corner cut top left and bottom right by clip-path, the unit number and its line on the photograph, a lift and a slow zoom on hover; icons 40px in the card's type colour with no box; h3 and line tops measured level (286/285/285, 373/372/372); the rows below keep the three columns with the same gap, white, separated by hairlines | styles/services-map.css (end) |
| "recreate how it works better, responsive" | components/UnitFlows.jsx: HTML steps that wrap, arrows by CSS, the active steps in the unit's colour, a boxed group for "IAQ, one contract", dashed boxes for the owner's contractors; EFM's "what the owner gains" as positives. The SVG diagrams stay for the Codex | components/UnitFlows.jsx, services-map.css (uf block) |
| "don't put icon in a box" (reading), "should have icon for each" (the key), "make sure you have refined all the icons" | The reading icon stands at 40px with no box; the four column heads and the banner key carry a mark each; fifteen drawn system marks (FlowIcon sys*: piles, frame, envelope, finishes, air, PCW, chiller, fire, electrical, plumbing, CDA, gases, UPW, vacuum, waste) replace the generic set in the map; node icons larger | components/FlowIcon.jsx, codex/RelExplorer.jsx (SYS_ICON, heads), ServicesMap.jsx (KEY), services-map.css (end) |

Verified (headless): hero text; board heads level, cards coloured, photos IAQ's own; 30 flow steps, 0 past their cell at 1440 and 390; reading icon background transparent, 5 key marks, 4 head marks, 14 distinct system marks, 0 empty; 0 console errors.
Open: an arrow can sit at the start of a wrapped row in a flow (readable, a little loose).

Second batch, same night: record globe dots in ink (landMat/oceanMat in scenes/home.js); the record grey a step lighter and continued into the delivery cycle section (`.glance.gr + .sec.lpx-band` fade, group-record.css); the industries band inset (white gutters, white below; Home.jsx and industry-grid.css); About Vision and Mission rebuilt as tall photo cards with a frosted panel (VisionMission.jsx, about.css end block; marks `vision` and `mission` in IsoIcon.jsx; Mission photo is the lithography bay IMG_8566); services map: legend removed, reading above the map, stage sticky with a 1.75 frame, finer box lines (ServicesMap.jsx, services-map.css end blocks). Verified: both About panels identical (top 392, 428 tall, tiles 31px from the foot, no overflow); stage holds beside the map at 1762 wide; industries row 35px in from each edge with 101px white below; 0 console errors on each page. NOTE: another session edited scenes/home.js and home.css at 03:31 (the loader's "all dots" cut); two sessions on one tree will clobber each other, so one session at a time on this build.

## 25 Sep 2026, night: the client's 24 Sep review worked through, the commitment page rebuilt, the hero on footage

**The review.** IAQ's 19-page comment PDF (`Client info/IAQ/Feedback and meeting notes/2026.09.24_Website Comment_NR.pdf`)
is now section `c24` of the Amendments tab (`public/checklist.html`), one item per comment, 34 items, ticked where done on
the dev build (27) and saying what each open one waits on. Items born ticked carry `done:true` in DATA; the page seeds the
tick once and keeps an untick as `false`. Open: the 3D smoothness pass, the fab assembly moving onto Services (after that
pass), the three business units on Services with no description at all (Bazil decides whether the one-line read stays), the
PCU tool hookup diagram redrawn from the client's (PDF page 12, filed beside the PDF as a JPG) with the flow arrows animated,
and the merge of the six service pages into one (structural, Bazil's call; the "Three things have to be true" block goes
with it). Done in the pass: the EPCC/EPCM ledger answers only for the model in red and names it; the six-services list is
off the unit pages (the work and its systems stay, now the section head); the model-build section is off all three unit
pages (`{false && bim && ...}` in UnitPage, code kept for the Codex); a "why owners choose it" card opens on hover or click
and a click never closes it; the hookup unit's At a glance ledger is gone; EFM's three payment models and its ledger are
replaced by the seven services from iaqtechnology.com.my/efm (`services` prop on UnitPage, `.un-svc7-grid`), its four
problems sit under "The problems EFM solves." (`painsHead`), and a district cooling introduction stands where the
six-services list stood (`intro` prop, `.un-intro`); the Services page lost the kinds-of-work band and the proof strip; the
EPCC card lost "Design, procurement and construction under one contract". Backups: `src/_backups/client-review-0924/`.

**Corporate commitment, rebuilt** (`pages/Commitment.jsx`, `styles/commitment.css`, `components/CommitMarks.jsx`).
Client: "follow our content in current website whereby we can see our certificate directly and policy is attached direct as
pdf." The page follows the live page's sequence: pillars beside the Earth; CSR events; the QEHS statement with both policies
as PDFs (`public/docs/policies/IAQ-Quality-Policy.pdf` 339 KB and `IAQ-EHS-Policy.pdf` 493 KB, IAQ's own files from the
live site, both signed by the CEO on 15 November 2024; first-page previews `public/assets/iaq/policies/*.jpg` made with
sips); the certificate viewer (pick a standard, the certificate large with number, dates, certification body and scope,
turning on its own every 7 s until picked); the six EHS counters the live site publishes; the QEHS events; the recognitions
in the client's order (CIDB, Intertek, UKAS, Highwire gold; circle Highwire and Gold OSH removed). News cards read
`data/news.js` by slug. Old page: `src/_backups/commitment-0925/Commitment.jsx.pre-rebuild`.

**The Earth** is a textured three.js planet (`EarthGlobe` in Commitment.jsx): NASA Blue Marble day map and cloud map
(public domain, `public/assets/earth/day-2048.jpg` 239 KB, `clouds-1024.jpg` 226 KB, from eoimages.gsfc.nasa.gov), a
cloud shell turning a little faster, a fresnel rim on a back-facing shell for the atmosphere (keep it faint: the first cut
was a thick blue ring), the eight offices as red points with breathing rings, the routes from Shah Alam with a travelling
point. three loads only on this page; drag turns it; it pauses off screen; one still under reduced motion. The 2D dot
version that preceded it (continents from `data/landBits.js`) is in git history only. TRAP: the inverse of `ll()` needs
the longitude wrapped to -180..180, or every point lands in column 0 and the whole sphere reads as land.

**The pillar drawings** are in the ValueMotion language (dotted drafting sheet, ink line, one red movement): energy bars
with the red trend drawing down to the target; three people with a red ring drawing round them and the badge landing; a
balance that swings and settles with the red level mark. TRAP: `.vm{height:100%}` inside a grid item resolves against the
tile, so the sheet grew to 246 px; `.cc-vm{height:auto; aspect-ratio:3/2}` fixes it.

**Home.** The reel runs footage now (`SRC` in scenes/home.js): the stadium build at dusk and the KL skyline (the two clips
Bazil chose to keep), then the generated campus at dusk and the data centre, district cooling and photovoltaic market clips;
no clip shows a work process and nobody is at work. Each clip hands over before its own loop point (`holdFor`). Poster is
the stadium's first frame (`assets/hero-plant-poster.webp`). Loading tags are a flag and a name (no box, no square; the
percentage and the world fill are untouched). The home globe chips lost the red square (`group-record.css`).

**Verification.** The Browser pane returned stale frames all night while hidden (DOM said the globe was at the top of the
viewport, the image showed it at the bottom). `tools/shot-0925.mjs <base> <outdir> [urlFilter]` captures the changed pages
headless with presence checks and page errors; that is what proved every change above. Dev pane was on port 52943 (5177
held by an older Vite).


## 26 Sep 2026, small hours: the banner aligned, the map without outlines

| Note | Done | Where |
|---|---|---|
| "this should be aligned same level" (the head and the reading), then the same of the model and the map | The head is a two-column row: name and line left, the reading panel right, both from one top (measured 227 and 227 at 1440 and 2000); the model and the map start level below (stage 359, map 383 is the map's own head row). The model box is 1.7 wide so the fab stands large | components/ServicesMap.jsx (MapBand), services-map.css (end) |
| "instead of the tagging having an outline, a transparent background; lines too much, looks messy" | No outlines on the map's cards: rgba(255,255,255,.05) at rest, the kind's colour at 22% when related, the kind's solid when picked; the model chips are tints; the reading panel has no hairline | services-map.css (end) |

Verified (GPU, 1440 and 2000): tops as above; card box-shadow none in every state; 0 errors.

**Later the same night, Bazil's second sweep (all verified headless):** home industries bottom padding cut to
`clamp(14px,2.2vh,28px)`; closing band heading `clamp(30px,3.9vw,58px)`. About: vision and mission lost the fact tiles
and the photo zoom, carry `compass` and `flag` from FlowIcon (the isometric pair was "bad looking"), and the glass panel
hugs its text (`top:auto`); the story's photo strip starts `clamp(64px,10vh,110px)` below the hero. Services: MapBand
relaid (name and line in the right column over the explorer, the reading under the model in `.sm-map-read-b` with a
212px minimum so it never shifts); FabReal's drag hint renders only while loading; the unit cards are `#1F4F9E`,
`#2364C2`, `#2A7BDA` with white type, no `clip-path`, the photo inset 12px, the unit chip bottom-right on the photo, the
mark on a 64px white tile pulled 42px over the photo's foot, no hover zoom (rule block at the end of services-map.css;
note the `.sm-ub-top .sm-ub-cell.sm-ub-head` specificity needed to beat the row padding). Another session edited
VisionMission.jsx at 03:50 the same night: always re-read before editing. Checklist section b25 lists all of it.
Also that night: the facility map line reads "6 services, 3 business units, 3 kinds of work and 15 systems" (Bazil: services
first, numerals; `SYS_N` is summed from `WORK[].systems`), and the relation map on the dark banner glows (Bazil, with a neon
automation-flow reference: "more modern looking like pic 1"): connectors as light in the kind colours (`drop-shadow` on the
edge paths), halos on lit nodes, the picked node brightest, a faint red radial in the banner ground; square corners and the
kind colours kept. Rules at the end of services-map.css.
And the 3D on the Services banner (Bazil: "do not cut the 3D, the whole section banner is its space"): `frame()` in
scenes/fabreal.js ran once at load for the box of that moment, so a box that changed later cut the model. `resize()` now
refits for the new box and restores the visitor's direction and zoom; the fit fills 90% of the box; the stage is taller
(`.fr` aspect 1.42, 1.5 from 1600px). Verified headless at 1229 and 1600: no edge of the canvas carries the model.

Third batch, same night, Corporate Commitment: pillar drawings replaced by isometric marks (esgEnv, esgSocial, esgGov in IsoIcon.jsx; CommitMarks.jsx kept, unused); the textured Earth now prints in the house palette through a ShaderMaterial (sea by the day map's blueness in ink, land in paper shaded by its own luminance, a lambert terminator, a darkened limb), the cloud shell and the blue atmosphere removed, the red offices and routes untouched; the certificate viewer (tabs, seven-second turn) replaced by three columns; badge tiles transparent. Verified on /about/commitment: tiles 262 to 290px, 3 `.cc-c3` columns, 0 tabs, badges rgba(0,0,0,0), globe canvas 627px, 0 errors. Trap met again: a ShaderMaterial gets sRGB output as is, so brand colours go in as Vector3 floats, not THREE.Color (ColorManagement would darken them).


## 26 Sep 2026, morning: the board sleek, the map calm, the diagrams back

| Note | Done | Where |
|---|---|---|
| "make this look more modern and sleek" (units board) | Each unit is one tall photograph (4:4.4) with the words on it: number top left, the mark top right in white with no box, name, full name and line at the foot over a deep gradient; slow zoom on hover. The rows below sit on the page ground with one hairline between them; Bought as chips are tints; Open links plain; Read more an outlined button at the left. No chamfer, no coloured blocks. An earlier head block in the stylesheet (white mark box with a coloured ring, the chip bottom right) is overridden at the end of services-map.css | components/UnitsBoard.jsx, services-map.css (end) |
| "the previous flow was correct, better than this, is this even correct" (How it works) | The drawn SVG diagrams (UnitDiagrams.jsx) again, in ONE full-width row when Read more opens: each unit's diagram stacked with its label at up to 820px, so the type is readable; a phone scrolls each sideways at 520px. The HTML flows (UnitFlows.jsx) stay on disk, unused. The diagrams take the unit's BLUE (the RED constant in UnitDiagrams is #0B8FD8 now, the name kept) and the EFM foot reads as gains (Efficient cooling, Compliance held, Capital kept for the business, Uptime from new plant); a JSX escape bug (\u2019 printed literally) fixed | components/UnitsBoard.jsx, UnitDiagrams.jsx, services-map.css (dgrow) |
| "no need too much gradient" (the map banner) | The neon block (a red radial ground, glowing connectors, halos on lit cards, from a stretch of the evening not in this record) is overridden: no ground glow, plain 1.5px connectors, cards as tints only | services-map.css (end) |
| "this look should be modern a bit more" (the reading) | No box: a faint tint, 22px padding, a 17px light sentence with bold names, bracket expansions at .8em and .55 opacity, the second line quieter, the mark 40px in the kind's colour | services-map.css (end) |

Verified (GPU 1440, phone 390): ground pseudo display none; card and picked-card box-shadow none; connector filter none; reading font 17px; heads position relative, name and line inside the photograph on all three, gap name to line 8px; diagrams row one column, three SVGs at 918px; 0 errors.

### 26 Sep, later: "this is worse, make them into cards back"
The bare rows on the page (the sleek pass) are cards again: the photograph head as it was, then the rows in a #F4F6F9 card with hairlines between them and the Open link at the foot; the three cards stay level because the board is one grid. When Read more opens, the detail rows sit inside the cards and the drawn diagrams follow the three cards as one full-width block. Verified 1440 and 390: cell background rgb(244,246,249), every row level, 0 overflow, 0 errors. UnitsBoard.jsx (diagrams row moved after the foot), services-map.css (end).
The map's reading panel (Bazil: "fix the position height so it doesn't change", then "don't have empty space like this"):
`MapBand` renders every possible reading (the 27 picks plus the hint) in a hidden measurer that carries the panel's own
class, takes the tallest block's height and sets `--read-h` on the panel (`height`, border-box, `overflow:hidden`);
re-measured by ResizeObserver and on `document.fonts.ready`. Verified at 1366, 1600 and 1920: one height across all
picks, equal to the tallest reading. Note the page's 1.12 zoom: bounding rects are 1.12 times CSS pixels, so compare
scrollHeight with `--read-h`, not with getBoundingClientRect.

### 26 Sep, later: the units in three blues
Photographs 16:9 ("visuals should only be 1920 x 1080"); the mark beside the name; each unit its own blue, light, blue, dark (`--ub` on `.sm-ub-head:nth-child`), the photograph graded by a `mix-blend-mode: color` layer at .9 and a foot gradient in the darker tone under the words; the map's three unit cards take the same three blues (`.rx-u .rx-n:nth-child`, the light one with ink type when picked). Names anchored from the top (`top: calc(100% - 130px)`) so a wrapping full name grows down instead of lifting the name. Verified 1440 and 390: name tops equal across the three, line inside the photo, picks in the map return the three blues, 0 errors. services-map.css (end).
Unit cards, final word that night (Bazil: "don't make the picture blue, what I mean is like a line or colour depicting each
card", "card is white colour"): the LAST block of services-map.css makes the cards white with the photograph untouched, a
5px bar in the unit colour along the top, the unit chip and the mark tile in that colour (`--ub`: #1B4E9B, #2168C6,
#2F87E0), head in the flow. A parallel session had appended a colour-blend tint and absolute heads after my first pass;
the final block overrides all of it and must stay last. The map reading panel is centred in its fixed height via
`.sm-map-dark .sm-map-read-b{align-items:center}` (the plain `.sm-map-read-b` rule lost to `.sm-map-dark .sm-map-read`).

### 26 Sep, later: the map's light, settled
Bazil showed the neon capture ("wasn't it supposed to look modern like this") and then "but not too much lighting". Final: connectors 2px with one drop-shadow of 4px at 55% of their colour, lit cards a 14px halo at 55%, the picked card 20px at 65%, hover a faint white; the cards keep tints and no outlines; the red radial ground stays off. His standing "no glowing" rule is overridden for this one surface by his own instruction. Verified 1440, 0 errors. services-map.css (end).

Fourth batch, same night. THE OFFICIAL ICON STYLE IS THE HERO LINE SET (HeroLineMarks.jsx), Bazil: "this is our official icon style": 24 grid, stroke 0.95, butt caps, mitre joins, no fill, ONE red element (the last shape, `F:` when filled), baseline y 20, centre x 12, height 15 to 16, width 13 to 17. Five marks added (vision, mission, esgEnv, esgSocial, esgGov, exported as LINE_MARKS) and used on the About Vision and Mission cards (ink on the white tile) and the commitment pillars (96px, right of the words). The isometric set (IsoIcon.jsx) keeps its map, units and flow marks; the five isometric ones made earlier tonight are unused. Commitment Earth v2: anti-aliased coasts (fwidth), sea depth from the map's blue, a gloss, embossed land, a 15 degree graticule at a whisper, a cool rim; 128x96 sphere. Certificates: name and cover first, the document on white, facts as a strip, one button, no download. History (/about/history): head removed (an sr-only "Milestones" remains for assistive tech; `.sr-only` added to base.css), all four representation figures removed, the last milestone on IAQ's own plant clip; 12 figures, 0 representations, all IAQ registry or newsroom. About hero: hero-hq-aerial.mp4 (TianChad drone 0001, 8 s, crf 24, 2.5 MB) and hq-aerial-hero.webp. Client files: PARTS in client-files-page.py, inside() in client-files-index.py; stored 25 Sep: the 24 Sep review PDF and the tool hook-up diagram (Feedback and meeting notes, added by the other session at 03:43) and the two emailed logos (Logos by email (15 Sep)). Verified: About hero playing the HQ clip, cards hmk-ln marks, commitment marks hmk-ln, 0 download links, history 12 figures 0 reps, Client files 5 parts, 96 inside summaries, no stray section; 0 console errors on each page. CONCURRENT SESSION: VisionMission.jsx was rewritten by another session at 04:32 (icons compass and flag, the fact tiles removed); my line-mark wiring is in the file as of 04:35. Two sessions on one tree will keep colliding.
Markets hub: the "Not sure which fits?" registry line is gone (Bazil: "remove this"). Market heroes (Bazil: "have better
looking icons for the market and put it at the right side of the title and description"): PageHead takes an `aside`
(a block in the same row as the copy, right after it, level with it; `.pg-in-aside` in pages.css), and MarketPage passes
the market's own line mark (`MARKETS[].icon`) on a frosted tile with a red duotone copy under it (`.mkb-ico`, markets.css).
The tonal drawing (`.mkb-visual`, TonalMarks.jsx) is no longer rendered on the hero; the component stays for the strip.

### 26 Sep, later: the banner's balance
Two columns from 1280 up: left, the model with its top level with the map's column heads (the right head's height is measured in MapBand's fit() and set as --head-h on the row) and the reading at the foot, level with the map's foot (flex column, margin-top auto); right, the name over the map. Every child has min-width 0 and the section clips sideways, so a resize never spills the page. Verified 1760, 1440, 1380, 1280 (see the numbers in the session log). components/ServicesMap.jsx (fit), services-map.css (end).
Balance, measured after the second pass: the model's top level with the map's column heads (0 px at 1760, 1440, 1380; 1 px at 1280), the reading's foot level with the map's foot (0 px at all four), no page overflow. --head-h is the measured distance from the row's top to `.rx-heads`, in CSS px (zoom 1.12 divided out); the left column stretches to the row, the model shrinks when the column would be taller than the map.

### 26 Sep, later: the hole under the map at wide screens
At 2000 wide the model's aspect box grew tall, the row took the left column's height and the map ended with a hole under it. The left column no longer sets the row (`contain: size` on the stage from 1280 up); the map does; the model flexes to fill between the head line and the reading (`flex: 1 1 auto; aspect-ratio: auto; min-height: 220px`), and the 3D fits itself to whatever box it gets. Measured at 2000, 1760, 1440, 1280: model top level with the column heads (0), reading foot level with the map foot (0), stage foot level with the side (0), overflow 0. services-map.css (end).
Then "don't put icons in a box": the market mark stands bare on the hero (no tile, no edge), larger, with its red duotone copy
and a soft red radial behind it (`.mkb-ico` in markets.css).

Fifth batch, History page: hero on IAQ's own plant at dusk (hero-plant-dusk-2.mp4 from DJI_0516, poster plant-dusk-hero.webp), title "31 years of development.", VideoBanner min-height 56vh (pages.css .vb, shared by every page that uses the banner); the six record marks (recClean, recCooling, recCogen, recAward, recMedal, recSafety) in HeroLineMarks.jsx, ink, no shadow (company.css .cp-ic); the four milestones that lost stock figures now carry IAQ's own pictures with honest captions (history.js). SOURCES.md updated.

### 26 Sep, later: the rest zoom and the tools' colour
"By default should zoom in more": the fit was measured on the world box's eight corners, which spread wider than the fab along its diagonal and left air round the model. It now projects the corners of every visible mesh's clipped box and fits those to 92% of the frame. "Tools should be blue colour?": the process tools layer (detail-tools-lite) is #4A9BE6 in the palette. scenes/fabreal.js (frame, PALETTE).

## 25 Sep 2026, small hours: the market pages and the Services banner, Bazil's third sweep

**Market heroes.** `MarketMotion.jsx` (+ `market-motion.css`): seven drawn scenes in the ValueMotion language, light ink on the
dark hero, one red movement each, looping only while on screen. They stand LEFT of the title through PageHead's new
`aside` slot (`.pg-in-aside`, aside first). No tile, no gradient, no duotone copy (all three were tried and rejected the
same night). The tonal drawings (`TonalMarks.jsx`) are no longer on the hero.
**Market body.** Fact strip bare (no panels, sentence-case labels). `.pg-pull` lost its red left rule. `MarketFlow.jsx`
(+ `market-flow.css`) is the delivery diagram: scope as numbered tiles with red arrows, the six stages as tiles with
their line, replacing DetailDiagram's flow rail and `.pg-rail`. `.mk-band`: one photograph per market after the delivery
section (`BAND` map in MarketPage.jsx): IAQ's own cleanroom photographs for semiconductor (DSCN6619) and bio (35.jpg,
cropped to lose its date stamp), generated stills for the other five (Higgsfield gpt_image_2, 16:9, ~6.5 credits each,
balance 2341 before), tagged Representation.
**Services banner.** The model's canvas is the banner itself (`.sm-map-full .sm-map-stage-bg` absolute, `.fr` 100%);
the model is framed into the left 56% with `camera.setViewOffset` driven by `--fr-left` on `.fr` (scenes/fabreal.js
`resize()`; `frame()` clears the offset for the fit and restores it). Left column: a spacer then the reading panel;
right column: the name ("The IAQ facility map", IAQ red) and the explorer. View tools moved to the top left, with a
play button (`tools` prop on FabReal) that starts the map's self tour; `RelExplorer` tours only while `tour` is true and
calls `onTouch` when the reader takes over. Pin tags are dark glass chips with a lit point (`fab-real.css`, last block).
Below 1280px the stage returns to the flow with `--fr-left:1`.



## LOCKED DECISIONS (Bazil, read before touching any of these)

| What | Locked value | When, and his words |
|---|---|---|
| Home hero reel | nine clips, in this order (26 Sep 12:20, on his word: "switch slide 2 and 3 place", "then 2 and 8 place", then "second last and last please shuffle at best place"; 12:55 "remove this" on the crane scene, so `hero-site-crane-hf.mp4` is OFF the reel and stays on disk): `hero-plant.mp4` (stadium), `hero-mkt-district-cooling.mp4`, `hero-kl.mp4`, `hero-site-lift-hf.mp4` ("Working at height"), `hookup-team-rep.mp4`, `cr-bay-hf.mp4`, `hero-campus-dusk.mp4`, `hero-mkt-data-centre.mp4`, `cr-corridor-hf.mp4`. The three-photograph montage `hero-site-team.mp4` came off on 13:35 ("remove the last slide the static image"); it stays on disk. The crane and the lift are IAQ's photographs IMG_9181 and IMG_9445 as Seedance 2.5 start frames ("turn the best 2 picture u choosen into videos for the banner for iaq to add more", "u can use higgsfield"); the montage was his "create a video of these one for the banner" over the 71 site photographs. Per-scene holds: HOLDS in home.js (tool hook-up 4 s, lift 5.5 s). The photovoltaic clip left on 26 Sep ("take out the solar video"). Never the Hasegawa walkthrough. Change the set or the order only on his word in the same session | 25 to 26 Sep |
| Kind colours | service red, business unit blue (light, blue, dark per unit), work BLACK #231F20 (white on dark bands; yellow #F2B705 retired site-wide on 26 Sep, "proceed best"), system green, market violet, delivery model ink on white. Row corrected 26 Sep midday against codex-parts.css | 25 to 26 Sep |
| Services cycle | the horizontal serpentine, CycleFlow.jsx mounted by CycleBand.jsx, title "Six services, one accountable team." ServiceRing.jsx was built and rejected the same afternoon ("this diagram concept is good", on the serpentine); it stays on disk unmounted. Row corrected 26 Sep midday against the code | 26 Sep |
| Services 3D | the real Revit fab (fabreal.js), main building only, solid, tools blue | 25 to 26 Sep |
| About story | IAQ's own photographs until IAQ sends site footage; no generated work footage | 25 Sep |
| Copy | no negative statements on the site | 25 Sep |
| Loading screen | v4, the globe fills: dots only, land a light slate (home.js 0.55 0.59 0.66), a white knockout the shape of the letters under the mark (assets/iaq-logo-knock.png, home.css .ld-ui::before), no round lens, the first-paint shell in index.html | 26 Sep: "ok the globe fill 4th is good" |

## 26 Sep 2026, midday: the ring, the card diagrams, the map's icons, the model's place

| Note | Done | Where |
|---|---|---|
| "why isn't this being animated", "refine this, messy and cut off", "no need 'feeds the next Design'", "create a better diagram, do six stages of service", "title it correctly" | components/ServiceRing.jsx replaces the serpentine in CycleBand: one SVG, a ring with six stations at 60 degrees, the 24 Sep marks (CYCLE_SVG) in foreignObjects on the stations, the names outside on their own side, a red dotted flow running round the ring (CSS dash animation while on screen), a lit arc from the active station to the next, the active mark breathing; the band's three-second step and the touch-to-stop stay in CycleBand; the six are real links laid over the stations. Title: Six services, one accountable team. The old CycleFlow.jsx and its CSS are in _backups/cycle-0926 and no longer mounted (ServicesHub's import is dead code). Verified 1440 and 390: no name cut, 0 past the edge, flow animation running, the active station advancing (Procurement to Construction in 3.3 s) | components/ServiceRing.jsx, styles/service-ring.css, CycleBand.jsx |
| "put this into the card or make a better one, no overlap", "don't just put it here", "remember to follow colour code" | components/UnitDiagramsV.jsx: three diagrams on a 420-wide grid, tall, every box sized for its words at 13px; the How it works row is back inside the cards as the first detail row. Colour code: services red outlines, the unit's own blue for the unit's step, systems green (Power too), delivery models ink. Measured at 1440: 0 text overlaps, 0 past the cell, min font 11px. The wide set stays for the Codex | components/UnitDiagramsV.jsx, UnitsBoard.jsx, services-map.css (end) |
| "card should be white colour overall" | Cells white, chips on a light tint | services-map.css (end) |
| "remove the light dots, instead make the icons coloured", "make the UI look more modern" | The key dots are hidden; the four column heads and every node icon carry the kind's colour; the picked card's icon white. Trap found: FlowIcon ignored className, so every `rx-fi` size and colour rule since 25 Sep had been dead; it passes className through now and the rules apply (service icons 29px, systems 25px) | components/FlowIcon.jsx, services-map.css (end) |
| "push the 3D to the top a bit", "make the model look more realistic, not broken", "tools should be blue" | A view offset lifts the model so its top sits 6% from the box's top at any box height (lift() in frame, resize and reset); a three-point light (key, cooler fill, rim) on a softer sky; fine edge lines (EdgesGeometry at 28 degrees) on the building's skin and structure; the tools layer #4A9BE6; the rest fit on the fab's own outline at 92% | scenes/fabreal.js |

Sixth batch, 04:50. WATCH THIS: another session returned the home hero reel to generated and stock clips at 03:41 (hero-plant, hero-kl, the campus, market clips) and the AI poster; restored to IAQ footage at 04:50, now six real clips (SRC in scenes/home.js). The particle field is back over the hero at half density (home.css `#heroCanvas{display:block}`, LAYERS halved). The client's full hero line restored. About: manifesto top fade (`.man-photos::after`), Vision and Mission as plain cards (photo 16:9 over a white body; the glass block's rules are overridden by the later block in about.css), Mission photo ev-osh-crowd.webp. History hero clip re-rendered (10 s, crf 18, unsharp). Higgsfield media_upload was DENIED by the auto-mode classifier (data exfiltration: the client's photograph would leave the machine); the true image-to-video move needs Bazil to allow that tool.
Then: the map's columns as one lattice (`.sm-map-dark .rx-compact` block: fixed node heights per column, units and work
222px on the same three rows, services 62px, systems 34px, `space-between`), which also brought the banner to about a
screen. Unit cards: no colour bar, the photograph in the card's white frame, the unit chip top left on the photograph, the
mark beside the name; the Read more control is one bar across the three cards. Cycle band: `CycleBand.jsx` renders
`CycleFlow` again (the parallel session had put `ServiceRing` there; Bazil: "revert back to the previous horizontal
diagram"). Two sessions were editing this repo through the night; every block I added sits last in its stylesheet.

### 26 Sep, afternoon: the map's unit cards and the model's height
"Why overlapping", "give more vertical space to unit 2": a later one-screen fit had held the three unit cards to 172px each with overflow hidden, so unit 2 (the long name, two chips) spilled over unit 3. Each card takes its own height now (`.rx-u .rx-n{height:auto}`), the column keeps 12px gaps. Measured: 0 overlaps, 0 spills. The same fit clipped system names to one line with an ellipsis ("Piling and f…"); they wrap now. "The building is supposed to be a bit more to the bottom": lift() puts the model's top at 14% of the box (was 6%). services-map.css (end), scenes/fabreal.js.

### 26 Sep, afternoon: the hero reel, locked
"Turn the static images into videos instead", "remove the office picture", "there should be the video of the stadium and the KL here", then "why do we keep changing back to this stupid thing". The reel is hero-plant.mp4 and hero-kl.mp4, alternating, poster the stadium's first frame; the photograph moves and the HQ aerial are off it. The flips came from three different sessions on 25 Sep each acting on the client's no-generated-footage line; that line is on record, and this is Bazil's decision. Locked in the code (a comment block over SRC in scenes/home.js), in the table above and in memory. Verified: hero-plant playing at load, poster hero-plant-poster.webp, both sources loaded, 0 errors.

05:20. About hero: Bazil asked for the red-line factory clip back ("should just leave that one here"), so hero-campus-dusk.mp4 is on the About hero by instruction. It is generated concept footage; the client's rule is set aside here knowingly. Another session had switched this hero to the plant clip at 05:16.

Seventh batch, 05:50. CHECKLIST: a new group `k25` ("25 Sep · Bazil, night session") sits first in DATA with this session's items, newest first (their ids were m25t to m25ap and clashed with the other session's m25t to m25z, so they are k25a to k25w now, `done:true`). The 24 Sep review group (`c24`) carries the client's own screenshots: 39 images pulled from the PDF with pypdf into public/review/2026-09-24 (pruned from the launch build), attached per item as `imgs` and rendered as thumbnails (`.shots`). Statuses corrected: c24a is OPEN (two instructions on record: the other session kept the stadium and KL clips at 05:20, this session ran IAQ's photographs; Bazil decides), c24f, c24j, c24k notes brought up to date. Commitment: the pillar marks redrawn (leaf and sun, three people with round shoulders and the red helmet, the sheet with a seal ring) and moved to the LEFT of the words (Bazil: "put icon at the left side i said"); the globe holds a slow swing around the Malaysia pose instead of rolling away, tones a shade softer. Services fab: the target moved from 6% under the centre to 3% above it (Bazil: "pushed down just by a bit more"); the canvas is the top element at the model, drag reaches OrbitControls. Another session is editing fabreal.js and Commitment.jsx with notes dated 26 Sep.

## 26 Sep 2026, small hours: About story and hero, the Services banner's final order, and a warning

**About.** Hero: `hero-plant-dusk.mp4` with `plant-dusk-01.webp` behind it (Bazil: "where's the video of the factory").
Story: `.man-split`, the statement left and `cr-utilities-p1010242.webp` right in a crisp panel; the crossfade strip and
its scrim are hidden by the last about.css block (markup left in place for the parallel session).
**Services banner.** Order in the left column: `.sm-map-head-tl` (title, line, 26px padding under it for the pin tags),
spacer, `.sm-map-tools` row (zoom in, zoom out, reset, Play the tour, driven through FabReal's new `apiRef`; FabReal's
own `.fr-tools` are off with `ownTools={false}`), the reading panel. The right column is the explorer alone, wider
(`.44/.56`, `.42/.58` from 1600). MapBand measures the left column's right edge into `--fr-left` on `.fr` and calls
`api.refit()` (new in fabreal.js) on any resize; the vertical seat is the engine's `lift()`.
**TRAP, fabreal.js `frame()`:** `Vector3.project(camera)` reads `matrixWorldInverse`, which only the renderer refreshed,
so every fit pass measured the previous camera. Harmless once at load; with repeated refits it ran away (the model at
2× its band). `camera.updateMatrixWorld(true)` after `lookAt` in every pass fixes it. `window.__frBounds()` returns the
model's box on the canvas in CSS px for probes.
**WARNING, two sessions on one function.** Another session edited `frame()` and added `lift()` in fabreal.js during this
same hour, with its own instructions from Bazil ("push the 3D to the top a bit", "zoom in more"), while this session had
"push the 3D to the bottom a bit". My vertical band was removed so the two agree; the horizontal share and refit stay.
One session should own fabreal.js from here.


## 26 Sep 2026, late afternoon: hub gutters, the serpentine kept and animated, the banner aligned

WARNING for the next session: another Claude session is editing this project at the same time (CycleBand.jsx changed at 05:07 local by a hand not in this record, the hero reel flipped three times on 25 Sep). Read the LOCKED DECISIONS table at the top before touching the hero, the cycle, the colours or the 3D, and re-read a file before editing it.

| Note | Done | Where |
|---|---|---|
| "the left, right and bottom spacing needs to be the same", "follow the padding like the home page" (markets hub) | The seven sit at the page gutter (24 px at 1440, 20 at 1200, 18 at 1100) on the left, the right and the foot; the registry line under them is off | styles/markets.css (end) |
| "this diagram concept is good, just need to improve the animation flow" (the serpentine, after the ring had stood for an hour) | The serpentine stays; ServiceRing.jsx stays on disk unmounted. The run: a red 90 px segment travels the wire Design to Hookup in 6 s, then the return path in 1.5 s, one 7.5 s loop (cyc-run path + cycRunWire, cycRunBack); the chevrons breathe in turn. The old return-dash rules that fought each other are outranked | components/CycleFlow.jsx, styles/cycle-flow.css (end) |
| "make the number bigger and put it beside the icon", "can you not cut off the icon", "align properly", "no need 'feeds the next Design'" | Number 20 px, level with the mark's centre, right after it; the name at 18 px after the number, fitted so no name runs under a chevron; the disc has no clip and the mark's svg has overflow visible (the Design plate's drawing runs past its own viewBox, which is what read as cut); the loop line is hidden | styles/cycle-flow.css (end) |
| "align the title to the top a bit with the description" | The head's two columns align from the top | styles/cycle-band.css (end) |
| "align properly" (view tools), "align" (the panel's top drawn across to the map) | One tools row (.sm-map-tools) right-aligned to the reading panel at every width, the old floating .fr-tools off; fit() sets the panel's height so its top lands on the last unit card's top, or on the card above's foot when the tallest reading needs the room; the spacer under the model yields so the panel's foot stays level with the map's foot | components/ServicesMap.jsx (fit), styles/services-map.css (end) |
| "still too much to the top?" | lift() keeps the model's top at 14% of the box and never under the banner's head when the head stands over the model's part of the canvas | scenes/fabreal.js |
| "no overlapping please" (PCU card diagram) | The lane label "Sub-fab · process utilities" sits under its boxes, clear of the arrows | components/UnitDiagramsV.jsx |

06:10. Home reel: Bazil's latest word ("where are the other videos here i asked u to make, make sure hd"): SRC = KL skyline, site aerial, cleanroom fit-out, plant at dusk (angle 2), HQ aerial, stadium build, plant at dusk (angle 1); all 1920x1080; the panel-install clip (1080px source) is off the reel. c24a2 on the checklist marked done on that basis. Dropdown: unit column in the unit blue (#0B8FD8 / #0772AE, the light-page values from services-map.css), `.nm-segs{padding-top:24px}` aligns "Business units" with "What EPC carries".
| "this box is too tall, make it shorter", "need to make the wording smaller?" (the reading panel) | The panel is as tall as the reading on show, with a floor at the median reading so the common picks share one height; its top snaps to the nearest map line above (any card's top or foot, the system column gives one per row); the height eases over .38 s when a longer reading grows it. The reading type is 15 px. TRAP fixed: the hidden `.sm-map-read-m` copies the box is measured on had the default (smaller) type while the live panel had 16 px, so long readings ran taller than the box and lost their last line; the copies now carry the same type and padding, checked on all 28 readings (0 overflow) | components/ServicesMap.jsx (fit, data-sel on the copies, effect keyed on sel), styles/services-map.css (end) |

06:20. Codex: `--unit` and `--svc` swapped in codex.css (.cx-page) and codex-slides.css so business unit is blue (#0B8FD8 / #0772AE) and service red (#EC2027 / #C8141D), the same grammar as services-map.css; KINDS colour words updated. FOLLOW-UP: the PDFs in public/codex (IAQ-Codex.pdf, IAQ-infographic-set.pdf) were exported with the old colours; re-run tools/export-codex-slides-0918.mjs and the PDF assembly to refresh them.

## 26 Sep 2026: the developer's Scroll to build 3D applied, the old assembly archived

Delivery `3D ONLY (4).zip` (Downloads, 134 MB) is unpacked untouched into `public/3d/` (index.html, v3.html, assets/main-*.js
and css, 194 Draco GLBs gzipped in place and inflated by the app, fallback stills, signs; the Windows helpers dropped, the
Netlify `_headers` kept). It is a self-contained app: fixed canvas + a scroll runway in its own document, 25 beats under
IAQ's service headings, a V1/V2 skin switch, and a first-person walkthrough it hands off to. `components/DevBuild3D.jsx`
(+ `styles/dev-build-3d.css`) embeds it as a same-origin iframe pinned for one viewport under the sticky nav
(`top:var(--sticktop)`) inside a section whose height is the frame's own runway (`--db3-runway`, measured from the frame
document, ~23,500px at 900 tall: the developer's design, about 26 screens); the page's scroll is handed to the frame
(`win.scrollTo`) and wheel/touch inside the frame are handed back to the page (listeners injected into the frame document,
off while the walkthrough is open). Home renders `<DevBuild3D />` where `<FabAssembly />` stood. The old assembly is in
the Codex (member portal), last section "3D archive", running in full. Verified headless: the frame renders, its render
changes with the page scroll by the same amount as on the developer's own page (13 to 24% of pixels per step), the wheel
over the frame moves the page. NOTE: the bundle's own step text ("01 / 01 · beat 1 of 2") does not update in headless on
the developer's standalone page either; it is theirs to check in a real browser. NOTE: `public/3d` adds 131 MB to
`dist-launch`; the older meshopt pack in `public/assets/iaq/model3d` (57 MB) still serves the Services banner.
Backups: `src/_backups/dev3d-0926/`.
Same night: the Codex's Services page flow (`SiteMock.jsx` BANDS: seven bands, the facility map as the banner, no work band,
no projects strip) and the unit-page anatomy (eight parts; `PAGE_ANATOMY` in codex.js, `AnatomyPart` n 4 to 8) rewritten
to the live pages. `DevBuild3D` shrinks the developer's frame to 2px when the section is more than a viewport away
(`.db3.is-far`), so its full-size render loop costs nothing off screen. The "very high end, light and smooth" ask cannot be
met inside the compiled bundle (no scene handle; only `tier`, `layout`, `order` URL switches); the brief for the developer
is `_handoff/BRIEF-3D-high-end-2026-09-26.md`. The alternative is a rebuild in our engine on the same model with the
smooth-scroll-3d-showpiece and web3d-photoreal recipes: a multi-day build, Bazil's call.
| "the loop arrow at the left side not moving and cut off" | Two faults. The return had no wire under it (only a moving red dash), so the loop read as a stub: a grey `.cyc-redbase` path now draws the whole return route Hookup to Design. And the red dash never moved because an `!important stroke-dashoffset` outranked its keyframes (any !important on an animated property freezes the animation). The run and the return are now driven by ONE requestAnimationFrame clock in CycleFlow.jsx (run 0 to 6 s along the wire, return 6 to 7.05 s, both parked off their paths otherwise, the clock stops off screen), because CSS keyframes on stroke-dashoffset also failed to repaint in headless Chrome; verified frame by frame with the stations hidden (red pixels travel Design, arc, Hookup, loop, Design). Chevrons stay on CSS with delays .7/1.7/4.1/5.1 s from the same .play moment | components/CycleFlow.jsx (reveal effect), styles/cycle-flow.css (end) |
| "remove the weird V line at the icons" | The isometric ground V (`stroke-opacity .17` path) is removed from all six marks at the source, which also clears it from the services cover, the system map and the ring; backup src/_backups/marks-0926/cycleMarks.js | data/cycleMarks.js |
Bazil: "proceed" (route 1, the brief to the developer). Packaged in `_handoff/brief-3d-2026-09-26/` and its zip: BRIEF.md,
`current-01-mid-build.jpg` and `current-02-finished.jpg` (frames of the render as embedded today), `message.txt` (the
covering message, addressed to Azwan, from Bazil). Nothing was sent from here: there is no channel to the developer in
this session. When the developer's pass arrives, drop the new "3D ONLY" folder over `public/3d/` (same ids, same
index.html shape) and re-run the pixel-diff probe across scroll positions to confirm the build still follows the page.

06:40. Codex PDFs re-exported with the swapped colours (Bazil: "proceed"): IAQ-Codex.pdf 53 pages, 10.5 MB, 0 errors, dated 25 September 2026 (IAQ-Codex.json updated); IAQ-infographic-set.pdf 12 pages, 2.9 MB, assembled with PIL from the slide PNGs (the exporter writes PNGs only; the assembly is `Image.save(save_all=True)` at 144 dpi, quality 88). The 24 Sep PDFs are in _backups/codex-pdf-0925. Slide 1 checked: units blue, the key at the foot reads Business unit blue and Service red.
| Open list: "the map runs taller than one screen", the model under the tools row (Bazil's capture) | The banner is 889 tall at 1440 (was 1042): the system column takes 1.16fr so fewer names wrap, its rows sit at padding 5 and gap 5, the section's top is 40 and its foot clamp(18px,2.4vh,30px). It clears a 900-tall viewport by itself; with the 83 px site nav on top the foot still runs 72 px below the fold at 1440x900 (fits at 1440x1000 and 1920x1080). The fab is fitted into the band between its lifted top and 14 px above the tools row (`bandPx()` in fabreal.js, converged over 6 passes because a step back shrinks the near corners more), the panel effect calls `refitIfHome()` 440 ms after a pick (after the panel's height eases), which refits only while the view is at home and unzoomed, and reset re-frames into the current room. Verified: 11 to 13 px clear of the tools on every pick and viewport, a zoomed view survives a pick, reset lands clear. TRAP: puppeteer's `networkidle0` never settles on /services now (the layer preload and the dev socket), use `waitUntil:'load'` plus a hard timeout | scenes/fabreal.js (bandPx, frame, zoom, refitIfHome), components/ServicesMap.jsx (panel effect), styles/services-map.css (end) |
| Open list: "home industry cards 8 px foot clip" | Checked: the only things past a card's foot are its image and clip layers, scaled 2% for the slow drift and the hover zoom. Nothing readable is cut. Closed as not a fault | styles/industry-grid.css |

## 26 Sep 2026: the developer's 3D, the experience (DevBuild3D.jsx, dev-build-3d.css)

Bazil: "optimise the experience very well", "smooth light optimised", "mobile version", "should also be able to enter
the cleanroom", "most important loading screen, fast loads, light weight but detailed 3D", "very light fast and easy
navigate clear". Everything below is on our side of the frame; the developer's bundle is untouched.
- **Loading screen**: our overlay over the frame (the IAQ mark filling by `--fill`, a count, the app's own `#status`
  line read every 200 ms; the count creeps to 9 while the app has not reported), cleared when the app's `#overlay`
  gains `.hidden`. On desktop the frame is created at idle (1.5 s timeout) while the visitor is at the hero; on phones
  when the section is within 1.5 viewports.
- **Weight**: the app reads its pixel ratio once at start (2 on Retina, 1.5 when narrower than 900px), so the frame is
  880px wide for its first 1.3 s (`.is-warm`), then full: 1.5 on Retina for the life of the section (verified). Far from
  view the frame is 2px TALL, never narrower (`.is-far`, React state, not a toggled class: React rewrites className):
  the app re-reads its width on every change to pick tap-build vs scroll-build. Section `contain:layout paint`, pin
  `contain:strict`.
- **Length and glide**: page runway = frame runway × 0.38 (0.6 on coarse pointers); the frame's scroll eases toward the
  page's position (0.16 per frame). A 2px red line along the top of the pin shows `--db3-p`.
- **Input**: wheel, vertical single-finger swipes and the scroll keys inside the frame are handed to the page, at the
  CAPTURE phase (the app's canvas handlers would otherwise swallow them). Sideways swipes stay with the app (rotate).
- **Walkthrough**: "Enter the cleanroom" (shown by the app once the build has been scrolled through, not jumped to)
  puts the app in its room state (`body.room`, `#room-bar` shown): the section's runway is frozen, `aim()` stops, wheel
  and keys are prevented inside the frame and the page's own scroll keys are held; "Exit walkthrough" brings the runway
  back (MutationObserver on `#room-bar[hidden]`) and the build resumes at the page's position. Verified by faking the
  room state; the real entry needs pointer lock, which headless cannot grant.
- **Phones**: the app's own tap-to-build mode (its media query); the section is one screen (`frameRunway` 0).
- **Headless caveat**: the app's chapter rail shows one chapter headless (nine in Bazil's real browser), and its
  "01 / 01 · beat 1 of 2" readout does not advance; the render does (pixel-diff probes). Judge those two in a browser.
Probes used: `tools/_d*.mjs` patterns in this session (deleted after use); the recipe is in memory.

## 25 Sep 2026, phone pass (Bazil: "please fix bugs and make sure phone view awesome")

Method: `node tools/phone-sweep-0925.mjs <outdir> http://localhost:52158`, every public route at 390x844 with mobile emulation: console and page errors, failed requests, page overflow, elements past the right edge, text under 11px (with the element, its parent and grandparent), broken images, tap targets under 32px, and VIEWPORT captures at 780px scroll steps (`<route>.shots.json`, base64 JPEGs). TRAP: full-page captures on this site repeat the content (the scroll engine), so never judge the layout from them; tile the viewport shots instead.

Before: 0 errors, 0 overflow, 0 broken images already; 174 text nodes under 11px; 6 numerals past the edge (`.cyc-num`, clipped, off-screen, left); small tap targets on projects, news, about, contact, policies.

| Found | Fix | Where |
|---|---|---|
| Record globe drawn 992px tall behind the band's copy, tags floating in white (the 24 Sep `position:static` host, meant for the desktop arcs) | host positioned again under 900px | group-record.css end |
| Services map model a thumbnail in the left 44% of a 347px stage (`--fr-left .44` from the desktop full-banner layout) | `--fr-left:1` under 760px, stage aspect 1.3 | services-map.css end |
| Services and systems lists 569 and 713px of full-width cards; reading box 291px for 96px of text | two-up grids with the head spanning, connecting lines off, reading box at content height (map column 2,551 to about 1,900px) | services-map.css end |
| Labels at 9.5 to 10.5px across the site (record stats, footer wordmark, search foot, history captions, service refs, news wire, careers filters, policies chips, unit picks) | 11px floor, !important against the page sheets | base.css end |
| Pin map labels 8.5 units on a 320 viewBox, colliding at phone scale; market hero mark caption rendered 5.5px | labels 10 units, hidden under 640px; caption hidden under 640px | company.css, base.css |
| Project save 27px, news rail 16px, carousel dots 28px, inline links 16 to 22px | 40 / 32 / 36px; vertical padding on the flagged inline links | base.css, values-carousel.css |

After (sweep 3, before the last two rules): 0 errors, 0 overflow, 0 broken, 17 small-text nodes (the pin map and the careers emblem, now handled). Sweep 4 is the final count.
Final sweep (4): 29 routes, 0 errors, 0 overflow, 0 broken images, 4 small-text nodes (the careers ISO emblem, an SVG badge, left), 6 `.cyc-num` off-screen numerals (clipped, invisible, left); the services list heads are the columns' ::before and now span the two-up grid; breadcrumb links padded. The bmws review bar wraps to four rows on phones and is left alone: it is identical across every build and never ships.
| "remove this" (the count line under the banner title) | Gone; the title stands alone and the fab rises into the room (lift and bandPx read the head's foot) | components/ServicesMap.jsx |

07:30. Higgsfield image-to-video for the hero: media_upload DENIED twice by the auto-mode classifier (Data Exfiltration), the second time on Bazil's direct instruction. Not retried a third time. To allow it: settings.json `permissions.allow` gets `mcp__58ac16c4-7286-4179-aca5-aded4fd83bf1__media_upload` (and `media_confirm`); then: PUT the four masters in scratchpad/hero to the upload URLs, media_confirm, generate_video seedance_2_5 (omni_reference, start_image, 1080p, 8 s, generate_audio false), jobs_wait, curl the results into public/assets/videos. Meanwhile: hero-site-aerial.mp4 is a 12 s drone flight (zoompan on the 5472px source with a reveal and a sinusoidal bank, 7.3 MB); hero-hasegawa-walk.mp4 is seconds 4 to 14 of the client's walkthrough (mp4v source re-encoded to H.264); the HQ clip is off the reel (Bazil: "this visual remove"). Client files: HEVC and mp4v videos get 720p H.264 proxies (`_reference/client-files/proxies`, served at /client-files/proxies/), the lightbox plays the proxy and links the original; the indexer records `codec`.

## 26 Sep 2026, evening: the services page reordered round the kinds

| Note | Done | Where |
|---|---|---|
| "reduce horizontal distance between cards" | Units board cards 14 px apart | styles/services-map.css (end) |
| "refine the arrow animation so it doesn't overlap", "the looping arrow on the left is a different animation" | The return's head tip stops at x 42, eight units clear of the Design plate's painted edge (its drawing runs 4 units past its box, so the box edge lies); the return starts at 44, clear of the rings. One JS clock, period 6.94 s: run 0 to 6 s, return the rest, same 320 units a second, no pause; chevrons on the same period | components/CycleFlow.jsx, styles/cycle-flow.css (end) |
| "refine this table so it looks more premium" | Colour code applied (units blue in three shades via --ub, services red, work yellow), tints for "when you ask", light grey for "not this unit", 3 px seams, the dashed return route removed, the foot work cards kept only for the Codex embed (`embed && …`) since the page now has its own 4 works section | components/SystemMap.jsx, styles/system-map.css (end) |
| "make a whole banner for this title, not tall but short" | `.sm-qs-band`: navy #17213A, full bleed via negative gutters, 164 px at 1440 | components/ServicesMap.jsx (QuestionsBand), styles/services-map.css (end) |
| "this one should be 6 services", "3 business units in blue", "remove typical", "questions ask" | Kind titles in their colours; "Six requests, and what each one needs"; "Questions clients ask" (read as dropping ", answered."; ask Bazil if he meant the literal words) | components/CycleBand.jsx, ServicesMap.jsx |
| "after this should be four works and detail them" | New WorksBand after the cycle: CSA, MEP, process utilities (data/business.js WORK, with their systems) and tools hookup (service 6); done-by units and model pins from ServicesCover LAYERS. Page order now: banner, units, cycle, works, table, questions, FAQ | components/WorksBand.jsx, styles/works-band.css, pages/ServicesHub.jsx |
| "not too far to the top, just nice in the middle" (the 3D) | lift() centres the fab in the room between the head and the tools row; bandPx keeps 28 px below like the 28 above | scenes/fabreal.js |
| WARNING, the hero reel again | At 11:03 on 25 Sep a parallel session put the seven-clip reel back in scenes/home.js, with hero-hasegawa-walk.mp4 in it, and the launch bundle carried the Hasegawa clip (leak check "hasegawa 1"). Restored to the LOCKED pair (stadium, KL) at 11:40 and rebuilt. The Hasegawa clip stays out of every public bundle whatever the reel says; the leak check greps for it after every build | scenes/home.js (SRC) |
| "check the font size, make sure most consistent and structure" (units board) | The full name under each unit name keeps two lines' room in every card (min-height 34px), so all three heads are 71 px, marks at one y, lines at one y. Type sizes were already equal (24 / 12.5 / 17, rows 12 / 14.5) | styles/services-map.css (end) |
| "you can add icons for each tag" | A flat mark on every service tag (the service's own icon), work tag (the work's icon) and system tag (RelExplorer's sysIcon, now exported); 18 + 6 + 32 marks in the three open cards | components/UnitsBoard.jsx, components/codex/RelExplorer.jsx |
| "remove the grey border" (How it works) | The diagram card sits on white with no padding or frame | styles/services-map.css (end) |
| "background should be same colour" | The FAQ section's grey ground removed; it shares the quote section's ground | styles/services-map.css (end) |
| "better friendly and professional title rather than forced info", "create a visual banner for this" | "Three choices shape your quote." with the lede "The model, the scope and the work. Pick each one, and the quote follows."; the band carries IAQ's own cleanroom build photograph (cr-build-2024) under a navy scrim, words on solid ground left, photograph right, 237 px | components/ServicesMap.jsx (QuestionsBand), styles/services-map.css (end) |
| "use 6, 3, 4", "colour code the words", "remove in one view and ," | Table title "6 services 3 units 4 works", red, blue, amber | components/SystemMap.jsx, styles/system-map.css (end) |

## 26 Sep 2026, morning: the 3D's platform, bands and panel; the copy audit; the markets board

- **Platform**: the app's `section-plinth` group (a dark 85% plane plus a soft shadow plane, sized to the footprint). It is
  re-shown by the app at `yc.visible=s&&!t` whenever section mode starts, so the patch is at that toggle:
  `yc&&(yc.visible=!1)` in `public/3d/assets/main-DFKh-ZaJ.js` (backup `src/_backups/dev3d-0926/main-DFKh-ZaJ.js.orig`;
  the file also carries `window.__iaqScene=n` after the scene is made, for probes). To re-apply on the next delivery,
  search for `.name="section-plinth"` and the `yc.visible` toggle. The site-ground plane of the V2 layout is untouched.
- **Bands**: the section carried the home page's `.sec` class (70px padding); dropped. The pin is the full viewport
  under the nav again (a 20% cut was asked and then reversed: "maximum the responsive screen size"). Every size change we
  make is followed by a `resize` event into the frame so the app's canvas re-sizes.
- **Facilities panel** (`#hud2` in their app, nine rows): overrides injected as `#iaq-embed-style` into the frame
  document: icons in their row's `--hue`, no icon border, no box on the active row, `.h-left` from the top, `#view-tools`
  at the top right under the skin switch, the key legend hidden.
- **Copy audit**: `tools/copy-crawl-0926.mjs` (routes from sitemap.js; headings, ledes, paragraphs, list items, buttons)
  → JSON; a regex pass flags negatives and odd phrasing; 40 lines rewritten across 20 files (backups
  `src/_backups/copy-0926/`). Kept deliberately: IAQ's safety record wording, their own quotations, technical names, the
  EFM problems in their words, the launch-hidden owed-content notes.
- **Markets**: `.mk-cards` (seven cards, 4 + 3) replaces `.mk-board`; the seven-market strip now follows the band.

## 25 Sep 2026, 07:50: the Markets menu in violet, the Amendments tab dated and typed, the banner rule

Bazil's three asks after the phone pass and the video work, all done and verified headlessly (the pane was covered, screenshots timed out; the computed styles and the captures in the scratchpad are the evidence).

| Ask | What changed | Where |
| --- | --- | --- |
| "isnt market purple colour?" | The seven market marks in the Markets menu are the Codex market violet #6E56E6, the lit row #5840C9 (mark and name). Business units stay blue, services red. | `Nav.jsx` wing wrapper carries `data-hub`; `base.css` end block scoped to `.nav-has[data-hub="markets-hub"] .nm-sq` (the market rows carry their mark as `.nm-sq` inside the name, not `.nm-ict`) |
| "beautify the amendments section", "make sure date are tag for each", "type of amendments and which" | Every one of the 518 items carries `time` and `tags` (page + kind). The date leads the meta line as an ink chip with a red dot; page chips neutral grey; kind chips keep their colours (Video red, Bug amber). A second filter row: by page (Home, About, Services, Markets, History, Commitment, Projects and other, Menu, Codex, Phone, Admin tab) and by type (Video, Content, Bug). The renderer prints nothing for a missing date (it printed "undefined" before). The 62 undated items in the 18 Sep batch took their date from their id (m25a is 25 Sep, m24x is 24 Sep). | `public/checklist.html`: TAGLABEL, `.t-*`, `.stamp`, `#filters2`, the click handler binds both bars. Backup before the date pass: scratchpad `z25/checklist.before-dates.html` |
| "remember do not put picture only at the iaq main homepage banner" | Rule saved to memory and here: the home hero is video, never a still. The reel stays KL, stadium, Hasegawa walk, site aerial, cleanroom build, plant dusk x2. | memory `iaq-website-build.md` |

The page and kind tags on the older batches were inferred from each item's wording by a keyword pass (page names, "video", "removed", "fix", "icon" and so on), so a few chips may sit loosely; correct any that read wrong when the list is reviewed. Item ids k26g, k26h, k26i log this batch.

Still open for Bazil or Nabilah: the hero lede wording, the three map claims without a source (contract years, "registered ESCO", "per tool set"), the Hasegawa clip showing the client's mark, and the Higgsfield dynamic clips (media_upload must be allowed in settings first).
Also: `#hud2 .h-left .h-ctrl{margin-top:auto}` is what parked the build controls at the frame's foot; the override sets the
column to its content height and the controls 1.4rem under the rail. "Not applicable" / "Not published" are gone from the
markets board, both market pages, the project pages (`Engineered space`) and the menu specs.
Panel icons, final: line work (`.rd-o`) white (78% on rows not yet reached, full on the active row), the accent stroke or fill
(`.rd-a`) in the row's `--hue`. Bazil: "a mix of white and its colour, not full blown all colour."

### 25 Sep 2026, 08:10: the market theme in violet

Bazil, on the hub's standards cards (the other session's 26 Sep card rebuild of the board): "should u just change the red market theme to purple would that be better? following colour code". Done: every market kind accent is now the Codex market violet. Tokens at the top of `markets.css` (`--mk` #6E56E6 plates and marks, `--mk-t` #5840C9 text on white, `--mk-l` #B4A8F7 type on the dark bands, `--mk-m` #9D8CF5 marks on the dark bands, `--mk-tint`), read by `market-flow.css` and `market-motion.css`. Switched: hub cards (mark, class plate, registry squares, Open the market), hub and market-page hero eyebrow, fact-strip links, the hero drawing's one movement, the delivery flow (arrows, marks, step numbers, hover names), the board's count chip, the old image-card grid, table hover. Kept red on purpose: the h1 emphasis on the market hero (brand voice on every page), the shared page-system kickers and tags (`pg-k`, `pg-tag`), and the seven-market strip that is the home page's own component. Flip the h1 em by editing `.mkb .pg-head h1 em` in markets.css if Bazil wants the whole hero in the kind colour. Backups: `src/_backups/markets-violet-0925/`.
Chapter strike (Bazil: "every time a section is finished it makes a sound and strikes, then emphasise that section"): a
MutationObserver on the app's `#hud2 .h-rail` fires when a row gains their `done` class; the row gets `.iaq-hit` (flash
in its hue, an 8px slide, the mark pops, 0.8 s) and a Web Audio strike (triangle 920→560 Hz over 160 ms at 0.14 plus a
50 ms noise tick at 0.09). Done rows stay emphasised (white title, hue number, a ✓ after the title). Audio unlocks on the
first pointerdown, keydown or touchstart on the page or in the frame, as browsers require; before that the strike is
silent. Headless run: eight strikes for eight chapters.

## 25 Sep 2026, afternoon: marks, titles, the tile matrix, the map grid, the illustrated quote band

| Note | Done | Where |
|---|---|---|
| "icons same size, not flat, not messy, reduce 15%", then "remove the weird box / the shadows", "refine the icon edges" | CycleFlow.jsx wraps every mark's drawing into one group at render and fits it to 74/96 of the box (five of the six marks keep their paths loose under the svg, so the wrapper is needed); disc inset 16 to 7 (15% smaller); no drop shadow, the ground ellipse hidden, the active disc lifts without a CSS scale (a scale rasterises the mark and softens its edges); shape-rendering geometricPrecision. The return path ends at 66 / 57 and the head tip at 68, clear of the fitted marks; the JS clock reads the return's own length so the loop stays one speed | components/CycleFlow.jsx, styles/cycle-flow.css (end) |
| "titles the same size, each with an icon at its left" | h2.kind-h (pages.css): 36px, flex, the kind's flat mark (cycle, epcUnit, helmet) in the kind's colour | styles/pages.css, CycleBand.jsx, ServicesMap.jsx, WorksBand.jsx |
| "you still haven't beautified this section", "why does this look worse", the Navexa reference | SystemMap is a tile matrix: one white panel on the light ground, a 46px tile per cell carrying the service's mark (unit blue / 15% tint / faint), lit stages named in red (no tinted strip when EPC carries all six), unit icons in the row heads, a tile legend. TRAP fixed: an old rule `.sysm-bar i.core span{...}` styled the tile span, and my `display:none` on it hid every core tile; the old label rules are now scoped to `.sysm-tile` explicitly | components/SystemMap.jsx, styles/system-map.css (end) |
| "make the spacing structured and aligned well" (the map) | At ≥1280 the unit column is a 3-row grid (`repeat(3,1fr)` in an auto-height grid resolves to the tallest card, so the rows are equal) and drives the row; the service and work columns are `contain:size` grids dividing the same height (6 and 3 rows) so two service cards line up with each unit card; the system column spreads to the same foot. The unit column is 1.22fr so the long names wrap less. Cost: the banner is 921 at 1440 (was 889) | styles/services-map.css (end) |
| "the boxes should be the same colour" | The view tools share the panel's glass (rgba(255,255,255,.035)) | styles/services-map.css (end) |
| "navigation bar should not be white, disappear like the homepage at the top" | Nav.jsx: overlap on /services too; the banner takes the nav's height into its top padding (html.nav-under) | components/Nav.jsx, styles/services-map.css |
| "don't overlap" (pins over the title) | FabReal: chips are placed above first; if the chip's top would cross the head's foot, it hangs below its point (.fr-lab.below), stepping down past chips already there | components/FabReal.jsx, styles/fab-real.css |
| "light grey theme like its layout", "a bit taller", "a better image visual, part of the layout, made in Higgsfield" | The band is the layout's ground (#EDF0F4), text left, illustration right. The illustration: Higgsfield GPT Image 2.5, four renders, the white-ground one chosen (the transparent ones carried white halos), cropped to content, 1600px WebP (35 KB), `mix-blend-mode:multiply` so its white becomes the band's grey. Logged in public/assets/iaq/SOURCES.md as generated, not a photograph of IAQ work | components/ServicesMap.jsx (QuestionsBand), styles/services-map.css (end), public/assets/iaq/quote-visual.webp |
| Open: "does this connection look better, can it be used at the banner, not this thick, assess first" | Assessed in the reply, not built: thin gradient ribbons (3 px, source colour to target colour) would suit the map; thick Sankey bands would not (a unit lights up to 24 relations). Waiting for Bazil's yes | |

08:20, Bazil on the Semiconductor hero ("shouldnt the theme of market be purple"): the h1 emphasis on the market heroes (`.mkb .pg-head h1 em`) is violet too (`--mk-m` #9D8CF5 on the dark band). The market theme is now whole; the brand red on h1 emphasis holds on every other page.
| "same background colour please" (quote band) | The band has no colour of its own; the illustration multiplies into the section ground | styles/services-map.css (end) |
| "this looks worse now, we're not sure what is what, the animation before is better, 'when you ask' is gone" | The tile matrix is WITHDRAWN (kept in _backups/services-0926c/SystemMap.tiles-rejected.jsx). The bars are back from SystemMap.pre-tiles.jsx: sweep-in, unit name in the first carried cell, "when you ask" in the on-request cells. Kept from the premium pass: unit blues per row (--ub), tints instead of dashed outlines, 3 px seams, white panel on the light ground, lit stages named in red, unit icons in the row heads. LESSON: Bazil reads this chart by the bar labels; do not replace them with symbols | components/SystemMap.jsx, styles/system-map.css (end) |
| "find a way to make the card look more premium" (units board) | No row lines, air between rows; model chips as unit-blue tints, no outline; the unit mark a blue mark with no box (his "don't put icon in a box"); a tinted foot with "Open EPC" in unit blue and a moving arrow; the Read-more bar quiet | styles/services-map.css (end) |

08:25, Bazil on the EV Battery hero ("is this alignment ok? like they're not structured and aligned", "fix this for all"): the market hero and its fact strip now share one grid (markets.css end block, `--mk-aside` and `--mk-gap`). The drawing sits on the container's left edge and fills its track (the tile-era `.mkb-ico svg{width:64%}` was still shrinking it and left a hole before the copy), the copy starts one gap after it, the strip's first fact takes the drawing's track and the other three share the copy's width. Shared lines, measured at 1440 and 1920 on three market pages: drawing left = fact 1 left = next section's h2 left; copy left = fact 2 left; container right = fact 4 right. Under 900px the drawing stacks over the copy and the facts go two by two, all on the container. One template, so all seven pages carry it.
| (found while quieting the cards) the unit mark drew white on white | An older rule (`.sm-ub-head h3 .sm-uc-mark svg{color:#fff}`, for the solid blue box that is gone) forced the svg white; it now inherits the unit's blue. The board's three blues were #1B4E9B / #2168C6 / #2F87E0 with unit 1 darkest, the opposite of the locked code; they now follow it (unit 1 #5CBCF5, unit 2 #0B8FD8, unit 3 #1C4F9C), the same set the table and the works section use | styles/services-map.css (end) |

## 26 Sep 2026, midday: the 3D as a chapter-by-chapter build, coloured; the reel

**Chapter snap** (DevBuild3D.jsx). The bundle now exposes `window.__iaqChapters` (built in the app's `$u()`: per chapter
`first`, `last`, `p` = progress of the first beat, `pl` = of the last beat, `pn` = of the next chapter's first beat),
`window.__iaqAsm` (the assembly `tt`) and calls `window.__iaqOnBind()` after every `bind()`. A wheel roll or a scroll key
inside the frame (build mode, not the walkthrough) snaps to the next LAND point = `pl + 0.15 × (pn − pl)` (last chapter:
1). Measured on the developer's page: at 0 and 0.15 the finished chapter is still the active row with "12 / 12 placed";
at 0.3 and beyond the app has flipped to the next chapter. The move is a tween of the frame's scroll over
`2600 ms × (distance / average chapter)`, clamped 1.5 to 3.4 s, ease-in-out; the page is jumped to the matching
position through Lenis (`window.__lenis.scrollTo(y, {immediate:true, force:true})`; a native `scrollTo` left Lenis's
target behind and it dragged the page a beat forward after every backward snap). Wheel and keys are held during the
tween and for 550 ms after. At the ends the roll falls through to ordinary scrolling. The strike (sound, flash, mark
pop) and the done mark (a small copy of the chapter's icon in its hue, `.iaq-done`) fire at the landing on the row that
is active (`.iaq-landed`); the `done` observer stays as the fallback for scrollbar scrolling.
**Colour.** After each bind, every mesh of a chapter's stages is tinted in the chapter's hue (the app's own hue table,
copied into `HUES`). IN PLACE: `mat.color.set(hue)` and `mat.userData.__origColor` set to match (the app restores colour
from it on fades). Cloning materials broke the app's loading (32 meshes bound instead of 577, "Loading the building…"
for ever): the app patches shaders on its materials (`__shaderPatches`) and a clone loses that. No material is shared
between chapters (measured: 490 materials, 0 shared). `?nocolour=1` on the page turns the tint off for tests.
**Speeds.** Bundle: buttons `0.5 / 1 / 1.5 (pressed) / 2`, `Ov=[.5,1,1.5,2]`, `Vu=1.5`.
**Reel.** `SRC` back to the six clips on Bazil's word in this session (the other session's lock note kept).
Bundle patches to re-apply on the next delivery (search strings): `section-plinth` toggle, `window.__iaqScene`,
`__iaqChapters` in `$u`, `__iaqAsm` at `tt=new Ie(`, `__iaqOnBind` at the end of `bind()`, the speed buttons and `Ov/Vu`.

### 25 Sep 2026, 08:40 to 09:00: the services page, three asks

| Ask | Done | Where |
| --- | --- | --- |
| "give more spacing at the bottom" (the facility map band) | foot padding clamp(60px,7vh,84px) on wide screens, clamp(64px,8vh,104px) below 1280; 63px at 1440x900, was 45. This overrides the 26 Sep "fits one 1440x900 screen" trim by about 20px. | `services-map.css`, the three `.sm-map-dark.sm-map-full` rules |
| "apply the icons" (the Six requests table) | every chip carries its mark: unit line mark, model drawn mark (ModelIcon), the isometric stage mark beside the service number (CYCLE_SVG), work mark, system mark read off the system's words (`sysIcon`) | `ServicesMap.jsx` QuestionsBand, `services-map.css` `.sm-ci` `.sm-cm` |
| "is this the best… more detailed structured clearer", "we cannot make it vague" (the 6 services, 3 units, 4 works chart) | the bars and their sweep stay (Bazil kept them on 25 Sep against the tile version); every carried cell now names its service, every asked cell names it and says "when you ask"; key reworded; under 720px the cells show stage numbers | `SystemMap.jsx` bar cells, `system-map.css` end block |

Capture rule for this page: the facility map is a sticky stage, so a scrolled screenshot shows the stage, not the section. Shift the document with `documentElement.style.marginTop` (the hidden-pane rule) to capture anything below it; `tools/_svc-three-b.mjs` does it.
TRAP, found the same afternoon: the app's scroll runway is not a fixed 400vh; it is resized as beats load and unload
(22,635 → 20,749 px at one backward jump). Any position handed to the frame must be a FRACTION of the runway read on
that frame, never a cached pixel count: the snap tween now reads `scrollHeight - clientHeight` every tick. A move
computed in pixels of the old runway stopped a third short (0.3233 for 0.2964).

## 25 Sep 2026, evening: ribbons, the markets in violet, the Design tab

| Note | Done | Where |
|---|---|---|
| "proceed" on the ribbon connectors | RelExplorer draws each edge as two paths on a per-edge `linearGradient` (userSpaceOnUse, from the leaving card's kind colour to the arriving card's): a 9 px soft pass at .16 under a 2.6 px core; end dots in each end's colour; on-request edges dashed. TRAP: inserting text before `const sysIcon` split `export const sysIcon` and broke the units board import; sysIcon is exported again | components/codex/RelExplorer.jsx, styles/services-map.css (end) |
| "table view instead, so easier to compare" | `.mk-tbl` on the hub at ≥900: one row per market (mark + name, measured by, class chip, largest delivered, registry squares + count, open); the cards remain below 900 | pages/MarketsHub.jsx, styles/markets.css (end) |
| "icons should be purple and white", "not red, purple" ×3 | Hub marks: violet lines, white accents (`.hmk-ln .mk-mv path{fill:#fff}`); the seven tiles' accent stroke violet; the hub's headline phrase violet (`.mk-hub-head h1 em`); market page body accents violet via `.mkb ~ *` (demand numbers, marks, profile cite, ISO refs), buttons untouched | styles/markets.css (end) |
| "remove these" (breadcrumb), "at the bottom of the banner, lined up, sectionized" | `.mkb .pg-crumbs{display:none}` (the BreadcrumbList JSON-LD stays); the four facts are equal glass cells (rgba(8,13,26,.78), blur) with hairline seams, flush with the hero's foot | styles/markets.css (end) |
| "save all this in the design tab" | design.html, Colour section: "The kind colours (Bazil, 25 Sep 2026)" swatches and the rules (numerals in kind colours with marks, no boxes, markets violet and white, marks without shadows, thin ribbons, labels kept in the table) | public/design.html |
| "extend the boxes to the far left and right but the font follows the padding", "what the heck", "fix the others" | The strip's glass is a `::before` on `.mk-facts-w` spanning the full width (z-index -1 inside the wrapper's own stacking context); the cells keep the `.pg-in` content width with the first cell's left and the last cell's right padding at 0, so the words sit on the page's edges. The first column is `--mk-aside` wide on purpose (it lines up with the hero's mark column). TRAP: my first attempt padded the first cell with `calc((100vw - var(--maxw))/2)`, which blew the grid tracks and stacked the last cell's words letter by letter; Bazil saw it live ("what the heck"). Never pad grid cells to fake a bleed; put the bleed on a pseudo-element behind | styles/markets.css (end) |
| "market purple" (nav) | Nav.jsx adds `.nav-mkt` on /markets paths; the active item and its dot take the market violet, lighter when the bar is clear | components/Nav.jsx, styles/markets.css (end) |
| "this cannot be purple" (project card refs) | `.pg-ref .iso` back to `--blue-bright` | styles/markets.css (end) |
| "don't put icons in circle", "if not clickable don't interact, not supposed to be red" | `.dd-ic` has no ring, no hover colour, no transform; `.dd-li` cursor default; violet on market pages | styles/pages.css (end) |
| "remove the line for all", "all visuals premium, not overlapping and messy" (market marks) | MarketMotion.jsx: the eight `i o5` ground lines removed (the stepped `M80 122H140V58H226` in district cooling is drawing, kept); data hall airflow now over the racks (y 16), the bio vessel between columns two and three, the filler nozzle ends above the neck and the check sits in the bottle body. Backup MarketMotion.pre-noground.jsx | components/MarketMotion.jsx |
| "appear as purple square here" | `.nav-links a[href="/markets"]::before` violet on every page (base.css, global) | styles/base.css (end) |
| "a left navigation bar, not this kind of dropdown" (portal) | Shell is `.pt-shell`: a sticky `.pt-side` listing the three groups with their notes and every page (NavLinks with the same on-state logic, booth views included), Sign out at the foot; `.pt-main` beside it. The dropdown code and CSS are in _backups/services-0926c/Portal.pre-sidebar.jsx and portal.pre-sidebar.css. Under 900 px the sidebar becomes a grid block above the page. No left stripe on the active item (Bazil's no-left-lines rule): a tint | pages/Portal.jsx, styles/portal.css (end) |

### 25 Sep 2026, midday: the facility map, four asks

| Ask | Done | Where |
| --- | --- | --- |
| "the line got worse with dual colours" | every ribbon one colour, its relation kind (service red, work amber, system green), end dots the same; gradient defs gone | `codex/RelExplorer.jsx`, `services-map.css` (`--rk`); backup `src/_backups/map-ribbons-0925` |
| "why this show 3 work though, cause hook up", "make sure everything structured well" | tools hookup is the fourth kind of work everywhere: one source in `lib/relations.jsx` (`HOOK_WORK`, `WORK4`, `HOOK_SYS`, `SYS_ALL`, `does`, `workOf`, `sysOf`); the map's Work column has four cards (hookup in service red), the System column 18 rows; edges through `does`; reading panel, print tables, `visFor`, `sysIcon`, `FabReal.layersFor`, `FabStage.pinsFor/frameFor`, `FabDriven` all know it; `WorksBand` reads the same card. Work cards 165px so four stand level with three unit cards. | backup `src/_backups/fourth-work-0925` |
| "make sure this is correct" (4 works cards) | consistent with `business.js` and the cover's `LAYERS`. For IAQ to confirm: EFM under MEP, and the three hookup system lines (our wording) | HANDOVER open list |
| "icons supposed to be the same size and animate when hover" (the cycle) | `lib/fitMarks.js` fits each generated mark's viewBox to its drawing at equal visual weight, never wider than its box; run two frames after mount plus a 900ms safety pass (a measure taken in the commit, from a ref callback, gave wrong bboxes; the data-fit guard stops refits); the same on the chart's stage row; hover lifts and floats (`cycHover`) | `CycleFlow.jsx`, `cycle-flow.css`, `SystemMap.jsx`; backup `src/_backups/cycle-marks-0925` |

Trap met: the explorer's cards select on hover and toggle on click, so a headless test that clicks a hovered card deselects it; hover in tests. The hookup systems crashed the page through `FabStage.pinsFor` (`SYS.find(...).work`) until guarded; any new consumer of system ids must use `sysOf`.
Afternoon: the chapter move follows the app's speed (`dur = 2600 × 1.5/speed × distance/average`), the bundle's speed key
is `iaq.section.speed-v2` so old saved values (Bazil had 1x) no longer apply. Strike sound is a soft mallet (thud 150→70 Hz,
bell 784 Hz + 2 overtones, 30 ms band-passed noise). Done mark: a 7px glowing dot in the hue after the title. Rail icons
44px cells / 36px marks, hover lifts the mark and whitens the title. Sweep fixes: the wheel hold is extended by every
event that arrives inside it (an inertia tail cannot start a second chapter); the frame's own `scroll` (rail click,
Replay build) moves the page to match through Lenis; a window-level keydown mirrors the frame's when the section is pinned
and the frame is not focused.
| "design the sidebar more properly: main titles and subtitles; only when you click the main title the bottom one expands" | Accordion: `.pt-sg-b` title buttons (icon, label, caret) with `aria-expanded`; `openGroup` state starts on the current page's group and follows route changes; items (`.pt-p`, names only, the note as a title tooltip) indented under the open title; the current page tinted. Verified: newsroom opens Edit website (3 items), a click on Exhibition swaps (7 items), opening Stand keeps Exhibition open, a second click collapses | pages/Portal.jsx (Shell), styles/portal.css (end) |
| "this should be in the same page" (Booth files), "make sure not laggy" | The booth was already one page (all parts rendered); what read as a page change was main.jsx ScrollToTop jumping to 0 on every route change, then PortalBooth re-landing three times (350/1200/2600 ms). Now: ScrollToTop skips when both the old and new paths are under /portal/booth; PortalBooth lands once at 80 ms and its correction passes stop on the reader's wheel, touch or key; the scroll spy dispatches `booth:part` and the sidebar's on-state follows it; `.bt-part{content-visibility:auto}` keeps off-screen parts unpainted. Verified: a click on Booth files never passes through scrollY 0, lands 8 px under the bar, the sidebar switches to Files, and scrolling up moves the highlight | src/main.jsx (ScrollToTop), pages/PortalBooth.jsx, pages/Portal.jsx, styles/booth.css (end) |
| "design direction should be in another tab, standalone, not in the exhibition" | GROUPS gains a `solo` entry rendered as one sidebar link (no caret); route `/portal/direction` renders DirectionPage (the booth's Direction component under a Page head, booth.css imported in Portal.jsx, useBrandFonts); the booth's VIEWS and GROUPS lose the direction part, so the booth page has six parts. Old links to /portal/booth/direction land on the booth's first part | pages/Portal.jsx, pages/PortalBooth.jsx, styles/portal.css (end) |

### 25 Sep 2026, afternoon: chart hover, table arrows, unit pages blue and tested

| Ask | Done | Where |
| --- | --- | --- |
| "is this hoverable or something or what, try out" (the chart) | tried: only stage and unit heads responded. Now every cell (unit at service, a `['c', unit, service]` selection), every work chip and the heads answer; a reading line under the grid says the relation; dimmed rows keep legible labels | `SystemMap.jsx`, `system-map.css`; backup `src/_backups/chart-hover-0925` |
| "make the arrow better" (Six requests) | drawn SVG arrow in `.sm-cell::before`, inline under 1100px | `services-map.css` |
| "shouldn't the unit theme page be blue as well" | `--blue`/`--blue-bright` are the unit blues inside `.un-hero`, `.un-sec`, `.un-band`; hero emphasis, "Call X when" and the band kicker in the light unit shade; closing band and nav stay red | `unit.css` end block; backup `chart-hover-0925/unit.css.pre-blue` |
| "check thoroughly the pages of the business unit and test" | four routes at 1440 and 390: 0 errors, 0 failed requests, 0 broken images, 0 small text, no empties, no placeholders, no page overflow; tabs and steps switch; 39 internal links open real pages. The hero facts stay on the unsourced list | `tools/_unit-audit.mjs`, `_unit-links.mjs`, `_unit-blue.mjs`; report in scratchpad `z25/unit-audit.json` |

**Page theme by kind (Bazil, 25 Sep afternoon): business unit pages blue, service pages red, market pages violet.** Inside a unit page the project cycle section stays service red (`.un-sec.un-cycle` resets `--blue`), because its six stages are services. The four unit pages carry no other red inside their sections; the six service pages carry no blue or violet; the seven market pages carry violet with the h1 emphasis included.

## 25 Sep 2026, 13:10: the frame that was 12% too tall, the rail that fits, the walkthrough HUD in white

**The root fault behind every "cut" report.** `base.css` zooms the root 1.12 from 1025px up. `.db3-pin` was `calc(100vh - var(--sticktop))`, and a `100vh` inside a zoomed root renders 12% taller than the window: at 1366x768 the pin measured 860px. The speed row, the mini-map and the controls strip lived in that off-screen band. Every viewport height in `dev-build-3d.css` now divides by `--zoomf` (set beside the zoom in base.css). Headless proof: the frame's inner height reads 804 / 686 / 643 at 900 / 768 / 720 tall windows, equal to the window over the zoom.

| Ask | What changed | Where |
|---|---|---|
| "the size screen must be responsive, don't cut anything" | pin height divided by `--zoomf`; the Facilities column measured against the bottom edge and scaled by `--rail-k` in 0.05 steps until it fits (0.8 at 900 tall, 0.6 at 768, 0.55 at 720); on phones only the active row shows, as before | `dev-build-3d.css`, `fitRail` in `DevBuild3D.jsx` |
| "no squaring" | the landed row is a tint fading to the right, no outline | `#hud2 .h-rail li.on.iaq-landed` |
| "give details and simple view" | level panel opens simple (names only), a Details switch adds the line per level, kept in `localStorage['iaq.walk.levels']` | `plantToggle`, `.iaq-fs-tog`, `.iaq-lv` |
| "the placement is not good enough", "UI is more to white modern theme", "nice and premium UI" | white cards without borders: level panel top-left (14.5rem, 21rem in detail), heading strip top-centre with the compass tape and degrees, Exit top-right, controls as one strip above the dock (shown once for 9 s on entry, `keysHello`), mini-map bottom-left 168px | `#iaq-embed-style` room block |
| "don't make complex border for map" | bundle: `lI.update()` clips to a square, no vignette, no ring strokes; ground `#C4CEDB`, floor `[229,234,241]`, blocks `[150,164,180]`, walls `[64,80,100]`; walls painted 2px in the grid image; the window is 42 m across (`eI`), was 55; `window.__iaqWalk = {x, z, yaw}` written each frame for the compass | `main-DFKh-ZaJ.js` (backup `src/_backups/dev3d-0926/main-DFKh-ZaJ.js.pre-minimap-0925`) |
| phone | level names shown (the app hid them under 700px), Details hidden, strip above the map, heading strip bottom-right, tape hidden | the `@media(max-width:899px)` room block |

**Compass sign.** The mini-map rotates by the yaw `e` and draws N at `+e` clockwise from up, so the heading is `-e`. Facing the tape's W with N on the map's right agrees.

**Re-apply on the next 3D delivery** (all in the bundle): section-plinth off, `__iaqScene`, `__iaqChapters`, `__iaqAsm`, `__iaqOnBind`, speed buttons and key `iaq.section.speed-v3`, walk marker ring hidden, camera sweep and fit, `HERO_FOV=32`, the mini-map square painter and `__iaqWalk`, the map tones.

**Harness.** `tools/_walk2.mjs <shots dir>`: three desktop sizes, rolls five chapters, probes the rail fit and the landed row, enters the walkthrough, probes every HUD box, turns the view for the tape, flips Details and back. Phone: the same page under `KnownDevices['iPhone 13']`. Reads all boxes from the frame's own window; screenshots are for the eye only.

**Open.** The build view keeps the developer's dark scene; only the walkthrough is white. If Bazil wants the build view white too, that is a scene change (background, fog, tone) for Azwan or a further bundle patch. The earlier `b26` checklist items carry "26 Sep" although the system date was 25 Sep.

### 25 Sep 2026, afternoon: the 3D build's intro and zoom keys

| Ask | Done | Where |
| --- | --- | --- |
| "during the intro it cannot be blank, something must be seen first somehow and it animates to this UI" | the app opens on an empty stage (0 of 12 placed) with its list drawn; now the finished facility, cut from the app's own end state (`public/assets/3d/intro-finished.webp`, the canvas region right of the list and under the skin switch, 32.6% / 8.9% of the frame), stands over the stage while nothing is placed and dissolves the moment the app reports its first part placed (the host's arrival roll reaches about 18% of the runway and lands parts within a second, so a scroll threshold alone cleared it too early; a 35% threshold remains as the safety). Over the canvas only, pointer-events none, under the loader | `DevBuild3D.jsx` (`ghost` state, `.db3-intro`), `dev-build-3d.css`; backup `src/_backups/db3-intro-0925` |
| "command ctrl zoom in etc should shortcut zoom in and out" | Cmd/Ctrl + `=`/`+`, `-`, `0` click the app's `#zoom-in`, `#zoom-out`, `#zoom-reset` while the section fills the screen; capture-phase listeners on the page and in the frame; the page is not zoomed | `DevBuild3D.jsx` |

Capture rule for this section: `page.screenshot` with a `clip` captures document coordinates (the hero), so scrolled states need `captureBeyondViewport: false` and no clip; the app boots only after the section is approached with wheel steps (`tools/_db3-states.mjs`). The developer's bundle stays untouched.

Intro details after testing: the ghost crop excludes the app's zoom buttons (x 470 to 1350 of 1440, y 80 of 900, box left 32.64% / right 6.25% / top 8.89%); on phones it sits in the lower 60% of the frame (under the app's list and buttons) with a radial mask so no band shows against the app's ground, and the caption says tap, not scroll. The ghost stands only while the chapter count reads 0 placed AND the page is under 5% into the runway, read live every 400ms, so it returns on an empty stage and never flashes at a later chapter's start.

### 25 Sep 2026, later: the 3D build's scrolling, icons and the V2 ghost

| Ask | Done | Where |
| --- | --- | --- |
| "why can't scroll back up, and continuous scrolling, make it faster" | the wheel handler swallowed every event during a roll and extended the hold on every event after one, so a held wheel stalled until the hand stopped. Now: a held wheel in the roll's direction sets `hurry` (the rest of the chapter finishes inside 600ms; progress is integrated per frame so there is no jump) and `queued` (the next chapter starts the moment this one lands); a push the other way queues a turn; after a roll a 300ms `holdUntil` guards against inertia, then a push of 25 or more starts the next roll. Measured: 8 chapters in 6 s forward, 7 back, then the page leaves the section. A single flick still rolls one chapter at the app's speed setting | `DevBuild3D.jsx` `snapTo`, wheel handler; backup `src/_backups/db3-intro-0925/DevBuild3D.pre-hurry.jsx` |
| "icons should be a bit smaller and more premium" | rail marks 36px with a 27px drawing, outline stroke 1.35, row grid to match, in the injected style | `DevBuild3D.jsx` embed style |
| "what the heck" (V2 skin) | the ghost's ground keyed to alpha, so it stands on the V2 site scene without a panel; soft edge mask at every width | `public/assets/3d/intro-finished.webp`, `dev-build-3d.css` |
| "make sure test sound timing, loading, and others" | loading: the loader clears 2.4 s after page load on the Metal GPU; no audio exists in the app (its one `play()` is the walkthrough figure's animation clip); zero page errors through the whole flow | `tools/_db3-flow.mjs` |

## 25 Sep 2026, night: the 24 Sep review closed out

| Note | Done | Where |
|---|---|---|
| c24x, "use the updated diagram, animate it with arrows showing the flow" | ToolInstallDiagram.jsx: IAQ's Main Tool schematic redrawn (viewBox 1280x880, the same aspect as the four-phase art), 28 boxes in the legend's five fills, 43 flow lines as animated dashes (red tool install, green base build, blue interconnection, CSS tidFlow), floors and the raised metal floor zone; phase 01 of HookupArt returns it, phases 02 to 04 keep the drawing IAQ approved | components/ToolInstallDiagram.jsx, styles/tool-install.css, components/UnitArt.jsx |
| c24ag + c24ah, "merge all the description pages into one, only the header clickable, remove the repetitive bottom section" | ServicesAll.jsx at /services/all: for each of the five stage pages the exported META, Cover and Scope in order (each page still renders itself from the same exports), stage six links to the tool installation page; a sticky jump bar; the five old routes Navigate to /services/all#stage; CYCLE routes and every other `/services/<stage>` link in src now point at the anchors (business.js and friends). TRAP: ids inside the exported sections are suffixed with the slug so the one page has no duplicate ids | pages/ServicesAll.jsx, styles/services-all.css, pages/Service*.jsx, src/main.jsx, data/cycle.js |
| p15, "they have 7 end-to-end Energy Management Services" | Already in CapEnergy.jsx (services={...} with IAQ's own wording); verified on /services/energy-management with the district cooling intro (c24ad) | pages/CapEnergy.jsx |
| c24d, "3D not as smooth" | Assembly pixel ratio capped at 1.25 (was 1.75) in scenes/home.js | scenes/home.js |
| c24l, c24o | Marked superseded by Bazil's later directions (the units board with rows; the real model on the Services banner) | public/checklist.html |
| "a little bit thinner title for all" | `h1,h2,h3{font-weight:500!important}` in base.css (Switzer 500 is on disk and loaded); checked on four pages | styles/base.css (end) |
| "all should be at the Amendments tab" | The Amendments tab IS /checklist.html (AdminBar 03); the review items live there under "24 Sep · IAQ review" | components/AdminBar.jsx |
| TRAP after the merge | Nav.jsx builds `to` objects from sitemap routes; a route with `#` in `pathname` throws in react-router. `toObj()` splits the anchor into `hash`. meta.js keys are pathnames, so the five stage keys became one `/services/all` entry | components/Nav.jsx, lib/meta.js |

## 25 Sep 2026, late night: the home 3D build and walkthrough

The compiled app in public/3d is PATCHED (backup src/_backups/3d-0925/main-DFKh-ZaJ.js and index.html). Two patches: the walk constant qC 3.1 to 1.5 and XC 6.6 to 5 (run), and `||window.__iaqCaps` beside both Shift checks (walk and fly). index.html's controls list gains Shift "Run (held)" and Caps Lock "Run (stays on)". Everything else is in the host, components/DevBuild3D.jsx (backup DevBuild3D.pre-alive.jsx).

| Note | Done |
|---|---|
| "100% number should be bigger" | `.ld-pct` 56 px red Switzer 500 (home.css end) |
| "falls down too fast", "not too slow" | chapter roll 3.2 s per average chapter at 1x (was 2.6) |
| "tools hookup must make sound", "another scroll only the overall", "scroll back up" | ROOT CAUSE: lands() placed each land point 15% of the way from a chapter's last beat to the next's first. Tools hookup's gap is .776 to .900 (eight times the others), so 15% reached .795, past the overall's first beat: the rail had moved to Overall when the roll landed, the hookup's strike and the overall's fired together, and the overall's own roll was silent. Capped at .2% of the runway. Verified roll by roll: 8 rolls land 8 chapters with 8 strikes, the 9th lands the overall with the 9th, and wheel-up steps back chapter by chapter |
| "thinner boxes", "frosted", "minimum black" | injected CSS: speed buttons thin glass; stage buttons and switch glass; walkthrough panels rgba(255,255,255,.72) blur 16 (they were body.room rules at .94 to .96, so the new rules are body.room too); active level and camera view a red tint; the frame's html/body navy |
| "more alive and real, not flat like cardboard" | enliven(): scene.environment = an equirect canvas studio gradient (the texture class borrowed from a mesh's own map, mapping 303), roughness capped .58, metalness at least .06, envMapIntensity .9; re-run every 1.5 s for streamed parts; the app had no environment at all |
| "walk only, Shift or Caps Lock to run, in the controls" | bundle patch above; the host sets win.__iaqCaps from getModifierState on every key |
| "when clicking the walkthrough make sure it looks proper first" | the finished-facility ghost stood over the room (the app takes ~2.5 s to set body.room). A capture click listener in the frame fires `db3:enter`; the ghost leaves within 300 ms and returns on exit |
| "elevator icon for level", "minimize and maximise map" | an elevator svg in `#floor-switch .fs-title`; `.iaq-map-tog` above the map toggles `#minimap.iaq-big` (168 to 320 px, the host's own body.room rule fixes the size, so the toggle sets width and height) |

### 25 Sep 2026, evening: the 3D build, premium pass

Bazil: "do what needs to be done to make sure it's premium". All in the style the host injects into the frame (`DevBuild3D.jsx`), the developer's bundle untouched; backup `src/_backups/db3-intro-0925/DevBuild3D.pre-premium.jsx`.

- Type: `@font-face` for Switzer 500/600 and Instrument Sans 400/500/600 from `/assets/fonts` (same origin, loaded and verified in the frame); Switzer for the title, chapter names, numbers, buttons, switch and zoom; Instrument Sans for the chapter detail, speed label and hints; `text-transform:none` and `letter-spacing:0` wherever the app set uppercase letter-spaced system type.
- Chrome: segmented V1/V2 switch without inner borders, zoom buttons 2.4rem with a hover, flat done dots (no glow), buttons lift on hover, the lit row keeps `padding-left:10px` (the app indented it 4px on light, so the column twitched every chapter).
- Rail marks: the desktop rule scaled by `--rail-k` still carried 44/36, which is why the earlier "smaller icons" only reached phones; now `max(28px, 36px*k)` / `max(21px, 27px*k)`. On phones the rail stops 52px short of the right edge so the lit row clears the zoom column.
- Checked at 1440x900, 1440x760, 1280x720, 390x844, V1 and V2: nothing cut, no overflow, no page errors (`tools/_db3-premium.mjs`, `_db3-sizes.mjs`).

The dev server was stopped by the app at 14:12; restarted on port 59545 (the tools were repointed).

### 25 Sep 2026, evening: final sweep

- 29 routes at 1440 and 390 on the restarted server (port 59545): 0 page errors, 0 failed requests, 0 not-found, 0 overflow, 0 broken images (`tools/_sweep-final.mjs`).
- The Amendments tab was blank: item `m28l` (added by the other session minutes earlier) had an unescaped apostrophe ("loader's") that broke the whole script. Escaped; backup in scratchpad `sweep-final/checklist.pre-escape.html`. **Any session adding checklist items: escape `'` as `\'` inside `t:` and `note:`, and give every item `time` and `tags`.** The 34 new m27/m28 items had neither; dated from their ids and typed by the keyword pass.
- Checklist: 596 items, all dated and typed, script parses. Client files tab: loads, 1,122 entries.

## 25 Sep 2026, after midnight: history 2013, the contact page, the Codex art rules

| Note | Done | Where |
|---|---|---|
| "any better visual for this?" (2013, The energy pivot), "you have Higgsfield" | dcs-illustration.webp: Higgsfield GPT Image 2.5, flat white ground, cropped to content, 1600x730, 95 KB; fig kind "Illustration", ar 160/73 so nothing is cropped; logged in public/assets/iaq/SOURCES.md as generated. The ACMV extract it replaces showed ductwork, not a plant | data/history.js, public/assets/iaq/dcs-illustration.webp |
| "no need the weird ring" (HQ map) | contact.js: the RingGeometry pulse stays in the scene graph (the loop animates it) but is not drawn | scenes/contact.js |
| "icons shouldn't be in a box" (contact) | `.cx-ic` bare, ink; the chosen intent and a hovered reach-us row turn the mark red | styles/contact.css (end) |
| "save this animation style in Codex", "and art style" | Codex.jsx ArtStyle(): the six ValueMotion marks live in the Culture card structure, and two rule lists (art: ground, line, colour, number, scale; motion: one movement, pace, stagger, when); ValueMotion's engineering sheet removed to match the no-box rule | pages/Codex.jsx, styles/codex.css (end), components/ValueMotion.jsx |
| Open-list correction | The History banner had already moved off the generated crew clip to IAQ's own plant at dusk (hero-plant-dusk-2.mp4, DJI_0516) in another session; my open list was stale | pages/History.jsx |
| TRAP from the parallel session (14:24 to 14:26) | FabReal.jsx briefly declared `shown` twice (the build failed; the other session fixed it within minutes). home.css lost the body of the no-underline rule for the hero market row, which also swallowed the phone wrap rule after it; completed for both `.hmk-it` and `a` markup (backup home.pre-hmkfix.css). Build clean, no CSS warning | components/FabReal.jsx, styles/home.css |

### 25 Sep 2026, 14:40: bug sweep ("check for bugs")

| Found | Cause | Fix |
|---|---|---|
| The app's Resume panel ("6 storeys · 2,139k triangles · 129 doors", blue Resume) over the build after Exit walkthrough | pointer-lock release arrives after the mode is back to assembly; handler `!s&&Da.mode!=="orbit"&&te!=="room"&&VI()` fired for assembly | bundle: `&&te!=="assembly"` added before `VI()` |
| A red rope with signboards floating above the finished building after exit | `exit-signs` never hidden by `Wa()`; `room-border` (`ba`) rebuilt by the nav-grid `.then` after the visitor left | bundle: `Wa()` sets `exit-signs` visible only in room; the grid callback hides `ba` and `exit-signs` when `te!=="room"` |

| A roll or a scroll key during the 2.5 to 4 s camera dive into the walkthrough advanced the build underneath, so the visitor came back to another chapter | our wheel, key and touch handlers only checked the walkthrough state, which starts after the dive | `DevBuild3D.jsx`: `diving()` reads the app's own signal (it disables `#explore-cta` for exactly the dive) and the handlers hold input while it is true; page scroll keys held too |

Backups: `src/_backups/dev3d-0926/main-DFKh-ZaJ.js.pre-resumefix-0925`, `.pre-leakfix-0925`. Embed backup: `DevBuild3D.jsx.pre-diveguard-0925`. Add both to the re-apply list for the next 3D delivery.
Clean: 34 routes at 1440 and 390, 0 flagged; one notch one chapter both ways; rail click; third person; HUD after resize; phone enter and exit.
Probe trap: another session saves `DevBuild3D.jsx` about once a minute, and each save remounts the frame under a long probe. Freeze Vite's hot reload inside the headless page (stub `WebSocket` for the `vite-hmr` protocol in `evaluateOnNewDocument`).

## 25 Sep 2026, afternoon: the Codex reorganised

| Note | Done | Where |
|---|---|---|
| Site crawl (my own, per the standing rule) | tools/audit-crawl.mjs over 94 page loads, desktop and phone: 0 broken images, 0 empty links, 0 missing alt, 0 sideways overflow, 0 dashes or exclamation marks. Two errors, both transient (the parallel session's FabReal edit at that minute; the home 3D still streaming at networkidle). Review markers ("Brand Method", "Supplied by IAQ", "content slot", "to be confirmed") verified hidden under ?launchview on six pages | scratchpad crawl/report.json |
| "isn't this supposed to be in the design tab?" | IsoFamily and the new ArtStyle (components/codex/ArtStyle.jsx) render under the Direction rulebook on /portal/direction; the Codex no longer carries them | pages/Portal.jsx, pages/Codex.jsx |
| "this area shouldn't be red" (Codex Part 1) | .cx-p1 plain ground; neutral shadows; .cx-plain-ic bare in unit blue; numbers faint ink | styles/codex.css (end) |
| "any other diagrams or processes, upload them in the right sector" | Part 1: CycleFlow (stages CYCLE) and the district cooling illustration. Part 2 after the chart: WorksBand embed (new `embed` prop hides the head), the three UnitDiagramsV flows, ToolInstallDiagram, the quote visual | pages/Codex.jsx, components/WorksBand.jsx, styles/works-band.css |
| "the Codex left navigation into 3 segments on the same page" | .pt-subs under the Codex link: Links to /portal/codex#part1..3 (ScrollToTop lands them), a scroll spy marks the part in view | pages/Portal.jsx, styles/portal.css |
| "why can't I expand" (tutorial films) | The iframe already allowed full screen; the embedded browser pane blocks it. An Expand button opens an in-page large player (Big), outside the card frame so the frame's iframe rules do not reach it | components/codex/Watch.jsx, styles/codex.css |
| Tool hookup drawing, full width | Shared horizontal runs at y 612 separated (632/620/608), the POU and pump lines moved off the tool control line (680/720), the blue pump interconnection off the pump's run (586), EVac beside its line, "Sub-fab floor" to the left, the legend laid out by label length with the interconnection on its own row (viewBox 912 tall). 82 labels, 0 overlaps | components/ToolInstallDiagram.jsx |

## 25 Sep 2026, afternoon: the Netlify zip

| Note | Done | Where |
|---|---|---|
| "send me a complete zip file for the whole website so my team can upload at Netlify" | deliver/iaq-website-launch-2026-09-25.zip, 265.5 MB, 1,069 entries: the launch build (dist-launch) with `_redirects` (`/* /index.html 200`), no backup files, no .DS_Store. Leak checks 0. Tested: unzipped and served, home and three nav clicks, 0 errors, 0 failed requests | deliver/ |
| Found while testing the zip | Six `url(assets/...)` in home.css and one in about.css were relative: fine on the dev server (styles inline), 404 in the build (the stylesheet lives in /assets/, so they resolved to /assets/assets/). The loading-screen logo and the hero poster were missing on the published site. Now absolute. A stray `bmws.pre-myhero-0923.bak.css` in public/ is now in the prune list | styles/home.css, styles/about.css, tools/prune-launch.mjs |
| "just do it" (the design sections into the admin Design tab too) | design.html, Icons section: the icon family and the marks' art and motion rules, with stills (public/design-assets/icon-family.webp, value-marks.webp) and a pointer to the live versions on /portal/direction | public/design.html |
| "all the updated icons are supposed to be here" (Design tab, Icons) | components/codex/IconLibrary.jsx renders every set from the live components (FlowIcon kinds and interface, ModelIcon, HeroLineMarks markets and LINE_MARKS, CYCLE_SVG objects, MarketMotion scenes) on /portal/direction. tools/export-icons.mjs snapshots each drawing with its computed stroke and fill inlined (animations stopped) into design.html between ICON-LIBRARY markers, first in the Icons section. RERUN it after any icon change: `NODE_PATH=<puppeteer> node tools/export-icons.mjs` with the dev server up. The old red market set carries a "Superseded 25 Sep" note | components/codex/IconLibrary.jsx, styles/icon-library.css, tools/export-icons.mjs, public/design.html |

### 25 Sep 2026, evening: x-ray and the closer finished view

- **X-ray** (Bazil: "view this in x-ray vision for each, eye icons beside each segment"). At the finished view the app switches the system layers off (`layer-detail-ducts`, `-sprinklers`, `-tools`, `-pipes` ...) and shows the exterior; all geometry stays loaded. An eye (`.iaq-eye`, planted by the host into each rail row, shown on done rows and on every row at the last chapter) toggles a chapter in `XR`. `xrApply` collects the chosen chapter's meshes from `__iaqAsm.groups`/`stages`, switches their hidden ancestors back on (kept on by a rAF loop, recorded in `userData.iaqXV`), and swaps every other visible mesh onto a glass copy of its material (`ghostMesh`, original in `userData.iaqXM`). Copies, not opacity edits: the app's `glaze()` pass re-sets any transparent shell material to .96 every frame; the copies carry `asmOpacity: 1`, which it skips. The Overall eye shows every chapter except civil and architectural. Any chapter change clears it (`watchFinal`), so the app's fades never meet it. Chip `#iaq-xr-chip` names the selection, Clear restores exactly. Tested with `tools/_xray-test.mjs` and `_xray-v2phone.mjs`: 0 errors, V1 and V2, 390px.
- **Closer finished view** (Bazil: "ideally should be this close"): on reaching the last chapter, `__iaqAsm.zoomLevel` goes to 2 (1.25 on phones) if the reader has not zoomed; handed back to 1 on leaving the chapter unless the reader changed it.
- Backup before x-ray: `src/_backups/db3-intro-0925/DevBuild3D.pre-xray.jsx`. Dev server now on port 61862 (Bazil restarted it).

## 25 Sep 2026, evening: EPC scope, facility map v1 and v2, five Services pages

| Note | Done | Where |
|---|---|---|
| "EPC is not supposed to be in maintenance and tools hookup" | business.js EPC core = design, procure, construct, commission; codex.js "did" line and the EPCC scenario; Nav EPC core [0,1,2,3]; CapEpc: 4 stages, the Maintain and Hook up steps removed, the in-house line rewritten. FLAG: IAQ's own questionnaire (Q-EPC-A, DV3 A1.3) lists maintenance and tools hookup as EPC stages 5 and 6. Confirm with IAQ | data/business.js, data/codex.js, components/Nav.jsx, pages/CapEpc.jsx (backups src/_backups/epc-scope-0925) |
| "make sure this is all in the Codex, version 1" | src/_versions/facility-map-v1-2026-09-25 (ServicesMap, RelExplorer, relations, FabReal, fabreal.js, three stylesheets, business.js, README with the restore steps); six stills in public/codex/v1; Codex section #facility-map-v1 | Codex.jsx, codex.css |
| Version 2: "no bottom left info", "no business unit", "remove services as well", "tools hookup will have a dedicated section" | RelExplorer `only` prop (['w','y']): only those heads, columns and edges, the three disciplines and the fifteen systems (no hookup work or its systems), its own tour; MapBand drops the reading panel and passes only={['w','y']}; the banner split .56/.44; the Codex keeps all four columns | components/codex/RelExplorer.jsx, components/ServicesMap.jsx, styles/services-map.css (end) |
| Tools hookup dedicated section | ToolsHookupBand.jsx: IAQ's four phases (first sentence of each, SL questionnaire) and ToolInstallDiagram; on /services after the four works, and as stage 6 of /services/all (id tool-installation) | components/ToolsHookupBand.jsx, styles/tools-hookup-band.css, pages/ServicesHub.jsx, pages/ServicesAll.jsx |
| "one main page, 3 unit pages, 1 services page, no work or system pages" | /services, /services/all, /services/epc-construction, /services/tool-installation (PCU & TTI, named so, with the utilities' five steps as its services section), /services/energy-management. /services/process-critical-utilities redirects to the unit page; CYCLE stage 6 goes to /services/all#tool-installation; sitemap cap-pcu points at the unit page; the nav's PCU sub-link lands on the utilities section | main.jsx, data/cycle.js, data/sitemap.js, components/Nav.jsx, pages/CapTool.jsx |
| Commitment: "remove this part" (EHS metrics), "remove this section" (events), "put this one in the footer" (registrations) | Sections 5, 6 and 7 removed (backup src/_backups/commitment-0925b); Footer.jsx gains `.f-certs`, the four marks drawn white (filter) with "Policies and certificates" | pages/Commitment.jsx, components/Footer.jsx, styles/base.css (end) |
| EPC "no need this kind of complex info", "in the FAQ for SEO, a new technical section" | CapEpc `compare` removed; FAQ group `technical` (five questions, the ledger's own facts) last; Faq.jsx writes FAQPage JSON-LD (24 questions) on the site, not in the Codex embed | pages/CapEpc.jsx, data/codex.js, components/Faq.jsx |
| EPC "remove the first picture, no need to explain so detail, use the same cycle visual" | CapEpc `pull` removed (no claim band); UnitPage `cycle` prop renders CycleFlow with `dim` (EPC map [0,1,2,3], dim [4,5]), one sentence per stage, no covers chips | components/UnitPage.jsx, components/CycleFlow.jsx, pages/CapEpc.jsx (backup src/_backups/epc-scope-0925) |

## 25 Sep, evening · unit pages, careers, 3D, signature generator

| Bazil | What changed | Where |
|---|---|---|
| PCU & TTI: "wouldn't this be better replaced with picture 2" (IAQ's Services Scope slide) | ToolScope.jsx in place of the work cards (UnitPage `scope` prop): Main Tool schematic, Process critical utilities (four groups, system green, "built with the base build") and Tool installation hook-up (eleven items, service red). Entity name off. UnitArt `bare` so the cycle's phase 1 does not repeat the schematic. WWT and ZLD added to the jargon glossary | components/ToolScope.jsx, styles/tool-scope.css, components/UnitArt.jsx, lib/jargon.jsx |
| EFM: "this one can remove", "district cooling at the bottom", "explain it nice and straightforward" | `works={false}` drops the cards; `introEnd` renders District cooling, in brief as the last section (.un-dcs): the labelled dcs illustration, three plain steps, IAQ's line, the markets link | pages/CapEnergy.jsx, components/UnitPage.jsx, styles/unit.css (end) |
| "fix the way it's being put together", "why owners choose before the process", "all 3 unit pages, why choose first then how it works" | The why section moved to straight after What X is on all three pages; the hover cards became `.un-why-list` rows (number, claim, sentence), grid-auto-rows 1fr | components/UnitPage.jsx, styles/unit.css (backup src/_backups/unit-0925c) |
| Units menu: "short form at the bottom, full name as the title" | nm-seg-t prints r.full as the title and r.label beneath | components/Nav.jsx |
| Careers: "remove this info" (People, by name) | Section 1.6 removed from Careers; the same block removed from pages/Culture.jsx (not mounted: /careers/culture redirects to /careers#culture) | pages/Careers.jsx, pages/Culture.jsx (backup src/_backups/careers-0925d) |
| Careers banner: "not supposed to be stretched", "line problem" | .cr-band: the awards photo at 16:10 on the right, full band height, clipped, faded in; about.css .hchip divider rules removed site-wide | styles/careers.css, styles/about.css |
| Collage: "change this picture, use Higgsfield, more professional" | Higgsfield gpt_image_2_5 frame (engineers in cleanroom garments, no text), public/assets/culture/cleanroom-team-rep.webp, tagged Representation (.cuh-rep). The old photo-cleanroom.webp had a pasted logo and an "AI-generated content" mark; CareersPromo and meta.js now use IAQ's own photographs | components/CultureCollage.jsx, styles/culture-hero.css, components/CareersPromo.jsx, lib/meta.js |
| 3D: "remove this building, the 3rd one, but keep the original file" | DevBuild3D.jsx `trimSite` in the enliven poll: app coordinates, CUT = (z > 20 and x < 37.5) or the link (x -15 to -2, z 2.5 to 20). Meshes wholly inside get drawRange 0, straddling meshes keep only their outside triangles (index rebuilt with the frame's own Uint32Array and BufferAttribute class), instanced parts zeroed per instance. Model files untouched. intro-finished.webp re-rendered from the live app without the building (pose -172,104,138 to 8,6,-8, background keyed by a model-hidden frame); original in src/_backups/3d-trim-0925/intro-finished.orig.webp. The standalone /3d/index.html and v3.html do not run the host, so they still show it | components/DevBuild3D.jsx, public/assets/3d/intro-finished.webp |
| 3D: "button icon too tall or too bulky" | .h-play buttons .6rem 1rem, 13.5px; play mark 11px; walker 16px with .5rem margin; speed buttons .26rem .6rem | components/DevBuild3D.jsx (injected style) |
| "create an email signature generator in the website", "portal" | /portal/signature, solo sidebar title. Table HTML, inline styles, Arial, PNG logo public/assets/email/iaq-signature-logo.png (200x84, shown 100x42) from an editable image address (defaults to the page origin: point it at the live domain). Offices: HQ, Singapore, Dresden, Ahmedabad, Other. Copy signature (ClipboardItem html and plain), Copy HTML, Download .htm. Form kept in localStorage iaq.signature.v1 | components/portal/SignatureGen.jsx, styles/signature.css, pages/Portal.jsx |

### 25 Sep 2026, 17:00 to 17:20: hero HD, electrons, 3D loader, holes, eyes

| Ask | Done | Where |
| --- | --- | --- |
| "why are our videos very low quality" | shipped hero clips were 720p <1 Mbps; the three market clips portrait 720x1280 in a landscape banner. Re-encoded at 1080p crf 18 from masters (`_backups/videos-orig-0910` for KL and stadium, `legacy-static/assets/hero-campus-dusk.mp4`), and landscape hero cuts `hero-mkt-{data-centre,district-cooling,photovoltaic}.mp4` (centre crop, hqdn3d, lanczos to 1080p, unsharp). Reel order unchanged; SRC points at the hero cuts; portrait `mkt-*.mp4` untouched for the cards. Old copies in `_backups/videos-0925-hero-lowbr`. Script: scratchpad `encode-hero.sh` | `scenes/home.js` SRC, `public/assets/videos` |
| "add a bit more electrons and make it look better" | 84 desktop / 37 phone, larger and brighter, cool far layer (`SC` sprite), distance-faded links between near/mid motes, canvas opacity .9 | `scenes/home.js`, `home.css`; backup `src/_backups/hero-0925c/home.pre-electrons.js` |
| "better loading screen, not weird, bar to 100", "the experience in the beginning loading" | the 3D loader: eased `shown` count that always runs to 100, holds 380ms (`landed`), then lifts; left column mark + line + bar + count; right, `intro-finished.webp` sharpening with `--k`; identical box to the stage ghost | `DevBuild3D.jsx`, `dev-build-3d.css`; backups `src/_backups/db3-intro-0925/*.pre-loader.*` |
| "what's with all the holes" | the app's mid-build facade cut seen at 4x; reader zoom capped at 2.4; Start/Replay resets zoom and x-ray | `DevBuild3D.jsx` |
| "the eye icon, simplify view" | eyes at opacity 0 until the row is hovered or the eye pressed (`@media (hover:hover)`) | `DevBuild3D.jsx` embed style |

17:35, Bazil ("why this pillar extruding out, make it cleaner"): piles are merged into `detail-support-apron/mesh_0` and `detail-exterior-v3-all/mesh_9`; a vertex histogram shows toes at -4.25 and -1.25. `levelPiles` in `DevBuild3D.jsx` adds one clipping plane at y = -1.2 (normal up) to the materials of the 5 meshes reaching below it (flag `userData.iaqPileLow`), re-checked every 1.5 s; the app keeps `localClippingEnabled` on in build and walkthrough and its own section planes (`asm.planes`) are left alone. The half cap at the section edge mid-build is the app's clip box (it moves per chapter: -27.4..0.6 x at the civil chapter, open at the end); not trimmed. Backup `src/_backups/db3-intro-0925/DevBuild3D.pre-piles.jsx`.
| 3D standalone pages | The cut moved into public/3d/iaq-trim.js (script tag in public/3d/index.html and v3.html; backups src/_backups/3d-trim-0925/3d-index.html, 3d-v3.html); DevBuild3D's trimSite returns early when window.__iaqTrimLoaded | public/3d/iaq-trim.js, components/DevBuild3D.jsx |

## 26 Sep · Services page, more premium and easier to read

| Bazil | What changed | Where |
|---|---|---|
| "the building can be bigger and a bit lower", "more premium and modern" (callouts) | bandPx() reads the tools row as the floor without the reading panel (v2 has none, so the fab had been held to .74 of the box); a width pass holds the fab to 90% of its frame; callouts: glass tag with a 1.5px top hairline in the layer colour, stem gradient, 6px lit point with a frPing halo | scenes/fabreal.js, styles/fab-real.css (end); backups src/_backups/services-0926d |
| "make the services page better ... more interesting, easy to understand, looks good", "research online" | ServicesSectionBar (fixed under the nav, hidden over the banner and after the FAQ, scroll spy, colour per kind); ToolsHookupBand `fold` (schematic on demand, Services page only); QuestionsBand shows three of six requests with a toggle; scroll-margin on the seven parts | components/ServicesSectionBar.jsx, styles/services-bar.css, components/ToolsHookupBand.jsx, components/ServicesMap.jsx, pages/ServicesHub.jsx |

### 25 Sep 2026, 17:40: the Services bar gap, two banners, and a slip recovered

| Ask | Done | Where |
|---|---|---|
| "what's wrong with the navigation bar here, try testing services" | pinned elements reserved the admin toolbar's full height after it scrolled away; `AdminBar.jsx` publishes `--tbv` (visible part, live on scroll), and every fixed or sticky top reads `--tbv`; `--tbh` stays for layout (hero heights, fab padding) | AdminBar.jsx, services-bar.css, services-map.css, unit.css, faq.css, fab-explorer.css, codex-site.css; backups `src/_backups/navgap-0925` |
| "add video of clean room", IMG_8588 and IMG_8589, "remove reflection" | 16 s seamless loop from the two photographs (dolly about each vanishing point, 1 s dissolves), the corridor's wall streaks retouched out | CapEpc.jsx hero; `videos/cr-cleanroom-reel.mp4`; scratchpad `cr/render_reel.py` |
| "a visual and video of the same team, better uniform, hookup in a clean room" | generated still and 7 s loop, researched garments and hook-up detail, Representation tag; the photograph it replaced stays on the hub card | CapTool.jsx hero; `videos/hookup-team-rep.mp4` |

**Slip, recovered.** A `cp` ran with its folder variable unset and copied fab-explorer.css over faq.css at 17:24:54. faq.css was rebuilt from `_backups/home-0924b/faq.pre-print.css` plus the three edits the other session made after it (its transcript, 24 Sep 11:23 to 11:30 UTC), then checked against that session's own grep of the live file at 17:11 today (`.faq-more` on lines 57 and 78: match). The FAQ was unstyled for about six minutes. The true pre-slip copy is now `src/_backups/navgap-0925/faq.css`.

### 25 Sep 2026, 18:20: district cooling in 3D on EFM, with Energy as a Service

Bazil sent IAQ's EFM slide ("Services Scope · IAQ Energy Facility Management · Energy As A Service") with "put this info in for the district cooling 3D, very detailed and easy to understand, don't cut corners", then "apply it in the specific page". The slide is EFM's own, so it replaces "District cooling, in brief" at the foot of `/services/energy-management` (`intro.scene: 'dcs'` in CapEnergy.jsx; UnitPage renders `DistrictCooling3D` when it is set, the old section otherwise).

| Part | What it is |
|---|---|
| `src/scenes/dcs3d.js` | three.js, orthographic dimetric, all primitives and canvas textures. Plant hall whose front walls and roof fade away (three chillers, four pumps, headers), cooling tower yard with turning fans and vapour, TES tank whose shell fades to show cold water under warm with the boundary moving, supply and return tubes with rounded elbows and moving chevrons, an ETS cabinet (plate heat exchanger, meter, the building's light-blue loop) at each of five buildings, cars, trees. The district is fitted to any stage shape from its box in camera space. Steps `all plant tes net ets bld epc bot om`; labels are HTML with a collision pass; hover names each building; the shadow map is baked once per step |
| `src/components/DistrictCooling3D.jsx` | the stage (zoom, reset, legend), the tour column with Play (only on press), and the three model cards: steps from the slide, durations from the EFM questionnaire flowcharts, the savings bars and BOT diagram redrawn from the slide as SVG, the maintenance packages table. "See it on the model" moves the 3D to that model's view. Copy provenance is in the file head |
| `src/styles/dcs3d.css` | blue unit theme, white cards, no left rules |

Flag for Bazil: the slide's chart shows a 40% saving; IAQ's live page publishes "up to 30%". The chart is labelled "Illustrative split, from IAQ's company profile".
Placement: the market page `/markets/district-cooling` keeps its own flow; the EFM section links to it.

### 25 Sep 2026, 18:40: photo library, district cooling framing, the build view on white

| Ask | Done | Where |
|---|---|---|
| "add this to the photo library, why is it missing" (IAQ's `EFM Visual DISTRICT COOLING explaination.zip`) | never saved into the indexed store; now in `Client info/IAQ/WhatsApp 2026-09-25 (EFM district cooling visual)` (the GIF renamed plainly, and the zip), own section under Brand and marketing, ledger row; `tools/client-files-index.py` then `client-files-page.py` rebuilt (1,119 files) | tools/client-files-page.py (sect, PARTS, LEDGER) |
| "supposed to be more zoomed out and placed in the middle properly", "refine what you need to" | SHOTS are world boxes with a fill; `frameShot()` frames each along the current view, centred, whatever the stage; resize re-frames | scenes/dcs3d.js; backup `_backups/dcs3d-0925/dcs3d.pre-fit.js` |
| "proceed" on "should the build view turn white too" | `LIGHT_BUILD` in DevBuild3D.jsx: `.is-light` on the section (page-side loader, veil, ghost caption), `html.iaq-light` + `#iaq-light-style` in the frame (rail, head, speed, skin switch, zoom, grid, vignette) | DevBuild3D.jsx, dev-build-3d.css; backups `src/_backups/light-build-0925/` |

**Bundle constants changed for the light view** (put back to revert, with `LIGHT_BUILD = false`): `HC()` gradient stops were `#2a313a`, `#161a20`, `#080a0d` (now `#ffffff`, `#f1f4f8`, `#e2e8f0`); the V2 site sky `ff` was `461848` (#070C18), now `14476268` (#DCE3EC). `intro-finished-light.webp` is a copy of `intro-finished.webp` (the ghost has a keyed-out ground and sits on white as it is).
Not downloaded: IAQ's "Site Photos" SharePoint share (Website 2027/Site Photos, IMG_9310 onward, 26 Oct 2022) needs IAQ's login.
| Footer certificates "why isn't the certificate visible" | .f-certs-row img: white tiles, no filter; trimmed copies in public/assets/certs (originals untouched) | components/Footer.jsx, styles/base.css; backup src/_backups/theme-0926e |
| EPC cycle "why the border and why too small" | .un-cycle-grid:has(.un-cyc) 1.3fr/1fr; figure and .un-cyc frameless | styles/unit.css (end) |
| "blue theme correct, check other pages" | .un-work.is-on, .un-svc.is-on/is-ask, .un-svc-tag in var(--unit) tints; .un-svc-mark unboxed; ToolScope blues. Scan of all three unit pages: no service red outside the cycle (the dcs3 legend red is warmer water, kept) | styles/unit.css, styles/tool-scope.css |
| "loading screen faster" | home.js: CAP 2800, hard cap +1500, floor t/1600, tau .13 (.08 forced), FIN 1000, arcs 0.05+0.06i over .45s, tilt over .8s, hide at 900ms; home.css: lift .7s, logo settle .6s | scenes/home.js, styles/home.css (backup src/_backups/theme-0926e) |
| District cooling 3D "a lot better and realistic" | dcs3d.js: palette (asphalt, lawns, yard), warm sun and cool sky, 4096 shadows, glass envMap 1.15 and deeper glass in the facade textures, smooth instanced-colour trees, exposure .94, desktop GTAOPass via EffectComposer with sprites and see-through surfaces kept out of it. The other session added a 3D model / IAQ animation switch at the same time; told it by message | scenes/dcs3d.js (backup src/_backups/dcs3d-0926) |
| District cooling: "remove this" (IAQ animation), "no need long descriptions", "label numbers or interact", "very good, detailed and alive" | DistrictCooling3D.jsx: view switch and video figure removed, STEPS short, onPick via pickRef; dcs3d.js: NUMS markers (.dcs3-num, lit and dimmed with the step), zebras, lamps, walkers (instanced capsules round each block), crown sway, cars with cabins; dcs3d.css end. Other session told by message | components/DistrictCooling3D.jsx, scenes/dcs3d.js, styles/dcs3d.css (backup src/_backups/dcs3d-0926b) |

### 25 Sep 2026, 19:20: the video set, with Higgsfield, ready to send

"I haven't seen the 2 video set, the people and the cleanrooms 2 ... in the photo and video tab and also the banner, it's not shown, please use Higgsfield and structure it to send", then "please complete it properly".
- Higgsfield uploads WORK now (curl PUT to the presigned URL returned 200, then media_confirm). Source frames: 16:9 crops of IMG_8588 (reflections retouched) and IMG_8589, media 17ea0197 and 4f03a885. Seedance 2.5, 8 s, 1080p, two takes each: corridor take A (job 18c880b5) kept, take B (9760acc9) invented a centred far door; bay take B (f9d6fcc9) kept.
- Site: `CapEpc.jsx` hero = `cr-cleanroom-reel-hf.mp4` (14 s seamless, corridor then bay, 1 s dissolves) + `rep`; `CapTool.jsx` hero = `hookup-team-rep.mp4`; `home.js` SRC nine clips (LOCKED table updated). `UnitPage.jsx` keeps the still `<img>` under the hero `<video>` (unit.css hides the video under Reduce Motion, which had left an empty box).
- Send-ready: `Client info/IAQ/From Brand Method (ready to send)/2026-09-25 Video set/` (01 to 06 plus README), shown in the Client files tab as its own first part; the same folder zipped to `_handoff/iaq-video-set-2026-09-25.zip`.
- IAQ's EFM animation: `videos/efm-dcs-iaq.mp4` (web version of their GIF) is on disk; the stage switch that showed it was removed by the other session on Bazil's "remove this".
- Split agreed with the other IAQ session for "all our 3D render this realistic": it keeps the district cooling 3D; this session takes the home "Scroll to build" 3D.

### 25 Sep 2026, 20:10: scene bar, loading world, V1 dark and V2 sky, x-ray

| Ask | Done | Where |
|---|---|---|
| "a small scene bar of clean room or etc", "the electron layer on top of the video looks weird" | `.hero-scenes` filmstrip (9 thumbs cut from the clips, names, lit and filling, click to jump, clicks during a change queued); `#heroCanvas` hidden | scenes/home.js next to SRC, home.css end; thumbs `public/assets/videos/thumbs/*.webp` |
| "texture of loading screen more like this", "where's the loading of the world" | 90k lattice land dots at 0.66 size, ocean dots, the body sphere drawn light with a darker limb, count held to a visible 1.6 s build | scenes/home.js loader init; backup `_backups/dcs3d-0925/home.pre-globe.js` |
| "V1 classic should be dark", "this sky should be Technical Accuracy", "improve the UI, very messy", "where's the x-ray view" | V1: developer's HC() gradient and light again. V2: `iaqSky()` painted sky as boss-scene background and environment. Light panel follows the V2 skin (skinSync); V2 list on a frosted card; eye visible on the current row | bundle (backups `_backups/light-build-0925/main.pre-*.js`), DevBuild3D.jsx |
| "remove this, two extended bars cut in half" | traced to the district cooling chiller nozzles (they rose 3.2 units past their headers); the other session owns that scene and fixed it | dcs3d.js (other session) |
| "I want all our 3D render to be this realistic" (Hasegawa renders) | this round: V2 sky and image light, sun shadows in the assembly view on desktop. The rest (materials, ambient occlusion, textures on the developer's model) is a larger pass, open | bundle |

Bundle patch list for the next 3D delivery now also includes: `iaqSky()` and its use in `WP()` (background, environment, `e.background.isColor&&` on the fade), and `un.shadowMap.enabled=!Ci,xi.castShadow=!s||!Ci` with the `lL()` call in the light block.

## 26 Sep, evening · unit pages redesigned, district cooling finish, footer badges

| Bazil | What changed | Where |
|---|---|---|
| "improve visually all the unit pages", "boring and messy", "reference", "go all out, don't add unnecessary info" | UnitPage: intro = un-intro2 (what[0] as .un-state beside the band photo; pains as .un-pains2 with icons); why = .un-bento (bentoCols/bentoWide: 3 cols, 4 from seven cards, first card navy and wide when odd); services = .un-svc7-grid on --cols or .un-flow (servicesFlow, PCU); models .is-pair with .un-join (modelsJoin 'or' or 'arrow' with .is-result navy); cycle steps first sentence only, the lit step's covers under the drawing (.un-now-covers); claim band off; proof grid by data-n; section rhythm by nth-of-type with --card. Icons per reason and pain in Cap*.jsx (icon field). PCU bandRep false | components/UnitPage.jsx, styles/unit.css (end), pages/Cap*.jsx; backup src/_backups/unit-redesign-0926 |
| (found) headings blank | lib/motion.js CLAIMED now includes [data-rv]: its heading tween (.pg-in > h2) caught unit headings while useReveal held them at 0 and tweened them to 0 | lib/motion.js (backup in the same folder) |
| (found) phones | base.css forces li > b to 11px under 640px; unit card titles override it. The EPC Services cycle hides under 760px (tall vertical duplicate, sticky) | styles/unit.css (end) |
| "two extended bars cut in half" (via the other session) | dcs3d.js chiller nozzles level from shell to header | scenes/dcs3d.js |
| district cooling "looks good", "warm colour", "clean interface" | return #EF4B2A, chevrons .5, PIPE_R .54, emissive .16; labels avoid NUMS markers (up or down, nearer the anchor); .dcs3-num.dim white; net step shows plant, supply, ret only | scenes/dcs3d.js, styles/dcs3d.css (backup src/_backups/dcs3d-0926b) |
| footer badges "no white background, same size" | public/assets/certs/*-rev.webp (outer white keyed out, Intertek and the UKAS number white), 50px high | components/Footer.jsx, styles/base.css |

### 25 Sep 2026, 22:10: open-list pass

- Hero reel quality: every clip in the current reel is 1920x1080 (hero-plant, hero-kl, cr-corridor-hf, hookup-team-rep, cr-bay-hf, hero-campus-dusk, hero-mkt-data-centre, hero-mkt-district-cooling). Note: memory says the LOCKED reel is nine clips with photovoltaic; `scenes/home.js` SRC runs eight without it. Not changed here; confirm with Bazil which is right.
- Markets hub cards (below 900px; desktop shows the table): equal-width grid, one label per card, acronyms kept. `MarketsHub.jsx`, `markets.css`.
- Higgsfield `media_upload`/`media_confirm` still not in any settings allow list, so the landscape HD market clips stay blocked.
- Dev server restarted on port 50519.

### 25 Sep 2026, 22:10: scene bar as name bars; hook-up redo handed to the other session
- "should not be thumbnails, instead bars and name, put it in the left corner": `.hero-scenes` is now 34 px bars and the playing name, placed by `place()` against the h1's left edge, just over the market rail, or beside the CTA when that would touch it. `NAMES` maps file to name. Backups `_backups/dcs3d-0925/home.pre-bars.*`.
- The hook-up team clip redo is the other session's (Bazil asked it). Reference for the uniform: IAQ's own 3D walkthrough workers, rendered to `_handoff/refs/iaq-3d-worker-outfits.png` (navy long-sleeve shirt with the red IAQ chest logo, navy trousers, white hard hat, mask, white gloves; sub-fab adds blue shoe covers; cleanroom is a white coverall with the IAQ logo). The worker GLBs in `public/3d/models/workers/` are gzipped in place (the app unpacks them).
| Loader "the 100% looks bad", "or better, the world looks like it's being filled"; "texture more like this", "irregular" | home.js loader IIFE: seeded xorshift scatter (124k samples desktop, 64k phone; land read with ±0.85° jitter, 5% thinning, aS size 0.55 to 1.6; sea 8.5% of water samples, ShaderMaterial); no rise (start = tgt, the per-frame posn loop removed); uFill (view-space level from the bottom, soft .07 edge, slight wave, red at the level) on land and sea; body uA .6 to 1.1 from the first frame; window.__ldPd harness; .ld-row hidden, #loader role=progressbar with aria-valuenow. The other session's count pacing line kept | scenes/home.js, styles/home.css (end); backup src/_backups/loader-0926 |
| "take out the solar video", "store it at the client files" | SRC eight clips (photovoltaic removed); file 07 in Client info/IAQ/From Brand Method (ready to send)/2026-09-25 Video set with a README line; client-files-index.py and client-files-page.py rerun. LOCKED reel is now eight clips on his word | scenes/home.js |
| Hook-up video "did not wear what the engineers wear in the 3D, nor the people in the picture", "please redo" | GPT Image 2.5 still (job 6df22ab1, refs: _handoff/refs/iaq-3d-worker-navy-closeup.png and Robocon _DSC5335, _DSC5336), Seedance 2.5 omni_reference 8 s 1080p (job f3f7dde6), 7 s loop with a 1 s xfade, H.264 yuv420p. public/assets/videos/hookup-team-rep.mp4, poster public/assets/iaq/hookup-team-rep.webp, still hookup-team-rep-still.webp; alt text updated; old files in src/_backups/hookup-0926 and the send-ready set's _superseded | pages/CapTool.jsx |
| Generated installation footage (IAQ's 24 Sep note) raised again with the redone hook-up clip | Bazil: "proceed". The clip stays, tagged Representation; recorded in the send-ready README and checklist m30o; still for IAQ to confirm | Client info/IAQ/From Brand Method (ready to send)/2026-09-25 Video set/README.txt |
| Loader on phones (found in the phone check) | the scatter read almost empty on a portrait phone: the dot fade used raw camera distance and the portrait camera stands ~7.2 back, so every dot counted as far side. vD is now measured from the globe's centre as if the camera stood at 4.55 (land and sea shaders); phone samples 104k; portrait size boost 1.35 | scenes/home.js |

### 25 Sep 2026, 22:30: hook-up video, three engineers

Bazil: "for the video of the engineer make sure accurate like in 3d character but i think too many people there maybe max just 3 doing actual work". The previous clip had five people, two of them standing with tablets. New: GPT Image 2.5 edit of the previous still (job 6df22ab1 as reference) to exactly three engineers, all hands-on, same setting, camera and 3D-walkthrough kit (job 5f9e3ce2, 2688x1520); Seedance 2.5 start-image 8 s 1080p, no audio, high bitrate (job 348b2b04); 7 s H.264 loop, the last second dissolved over the first (seam step 5.8 against a natural 2.4 to 4.0 there). Installed as `videos/hookup-team-rep.mp4`, poster `iaq/hookup-team-rep.webp`, still `iaq/hookup-team-rep-still.webp`; CapTool alt text and SOURCES.md updated; send-ready set 03/04 replaced (five-person version in its `_superseded`), client-files index rebuilt. Verified playing at 1920 on the Tool Installation hero and in its turn in the home reel. Backups `src/_backups/hookup-3eng-0925`.
| Site crawl after the session (tools/audit-crawl.mjs, 94 loads) | 0 errors, 0 failed or 4xx requests, 0 broken images, 0 missing alt, 0 overflow, 0 dashes or exclamation marks. Fixed its one flag: ServicesSectionBar parts get real ids (business-units, works, who-does-what, your-quote, questions) and hrefs; Shell.jsx's global in-page anchor handler now passes the target's scroll-margin-top as the Lenis offset (it landed sections flush under the nav) | components/ServicesSectionBar.jsx, components/Shell.jsx (backups src/_backups/services-0926d) |
| "what happened here" (the home world globe, stacked dots and doubled halos) | Dev-only: cleanup() forceContextLoss fired the globe's onLost AFTER teardown and it rebuilt a new globe, one per hot reload. onLost and its rebuild timer return when dead; each run replaces #globeCv with a fresh canvas and drops stray canvases; giveUp anchors the host (position relative) and staticGlobe draws at devicePixelRatio. Verified: 10 HMR saves give 1 canvas, 7 tags; 4 forced losses still recover 3 times, then the flat world fits its box | scenes/home.js (backup src/_backups/loader-0926/home.pre-globe-hmr.js) |

### 25 Sep 2026, 23:00: landscape HD market clips

Bazil: "do it then". The portrait market clips' origin is not recorded, so there was no job to build on, and uploading their frames is what the settings block. Done by text-to-video instead (no upload, no settings change): Seedance 2.5 t2v 8 s 1080p, no audio, high bitrate, prompts written from the portrait originals' frames. Data centre job 1d2fcf2c (symmetrical cold aisle, blue rack LEDs, forward dolly); district cooling job dfd6b637 (white insulated chilled-water mains with end caps, storage tanks, plant buildings, sideways track; the original's refinery columns left out). Encoded H.264 crf 19 and installed as `videos/hero-mkt-data-centre.mp4` and `videos/hero-mkt-district-cooling.mp4` (same names, reel untouched); previous upscaled crops in `_backups/videos-0925-hero-mkt-t2v`. Verified 1920x1080 playing in their reel turns. SOURCES.md logged.

Correction to 22:10: the reel runs eight clips because Bazil took the solar clip out ("take out the solar video", LOCKED table); the memory line saying nine was stale and is fixed.

## 26 Sep, night · complete project zip for the team

`deliver/iaq-website-complete-2026-09-26.zip` (1.09 GB, 5,159 files): `START-HERE.md` (run, publish, leak checks, where things live, decisions, open items), `site-netlify/` (dist-launch, upload as is) and `source/` (the whole project without node_modules, dist, dist-file, dist-launch, deliver, _backups, src/_backups, .photo-quarantine, the old _handoff publish zips, .bak copies and .claude). Verified: unpacked, `npm run build:launch` from the unpacked source built clean with all five leak checks at 0; both site-netlify and the rebuilt copy crawled 8 routes with 0 errors and 0 failed requests. The source holds the review passcode and internal notes: hand it to the team only, never publish it.

### 25 Sep 2026, 23:50: home 3D, realistic pass finished (look v2, sun, shadows, site ground)

Bazil: "I want all our 3D render to be this realistic and 3D", "then do it", "do it". Checked across the whole scroll range in V1, V2 and the walkthrough before calling it done.

| Found | Fixed | Where |
|---|---|---|
| The look pass could stay off for the whole visit: the phone check was read once, on the first frame, when the frame can still be hidden or narrow | live media query read every frame | public/3d/iaq-look.js |
| Occlusion drew heavy black streaks along facade panel joints and mottled smudges on flat walls | each sample now counts at most once and only inside the radius (bias .12, radius .03 x depth, 12 samples in a 4x4 rotation tile), a 5x5 half-weight-rim blur that averages exactly one tile, a depth-aware upsample. Tune live with `__iaqLookTune` | public/3d/iaq-look.js (v1 kept at src/_backups/look-0925/iaq-look.v1.js) |
| Sun at 78 degrees, nearly overhead: short shadows under the building, facades flat; the site scene's own sun sat at another angle | the building sun takes the site sun's direction (90,140,60), 52 degrees; the shadow box includes the building height | bundle `lL(s,t,h)` |
| VSM shadows read "in shadow" on any open ground (the developer's setting) | PCF shadows (`t.shadowMap.type=1`); r185 maps PCFSoft to PCF with a warning, so 1 is set directly | bundle |
| The building's shadow could never reach the V2 site: the site and the building are two scenes | `iaqCatch()`: a shadow-only plane in the building scene at ground level + .1, polygon offset -8/-16 (the paving uses -3/-6), shown only in V2 build view; a base Material flagged as ShadowMaterial because the class is tree-shaken | bundle, called from `Mu()` |
| V2 construction ground near black (made for the developer's night-navy V2) ending in a hard horizon under the painted sky | ground texture base (130,126,118) instead of (88,83,76); construction haze 130 to 700 m instead of 210 to 900 | bundle `HP()`, `pf`, `mf` |

Not done, on purpose: the finished V2 view shows no building shadow on the plaza because most envelope meshes do not cast (251 of 985 do); making them cast re-renders them into the shadow map every frame. Measured 45 to 60 fps at 1440x900 headless with everything on.

Bundle patch list for the next 3D delivery, in addition to the earlier ones (`__iaqTHREE`/`__iaqRenderer`, the `DL`/`DL0` hook, `iaqSky()`, the light block): `window.__iaqBoss=e` in `WP()` (probe handle), `iaqCatch()` before `lL()`, `lL(s,t,h)` with the new sun vector and box, the `Mu()` call `lL(...,max[1]-min[1])),iaqCatch(!!t)`, `t.shadowMap.type=1`, `HP()` base colour, `pf=130,mf=700`. Backup before this round: `src/_backups/look-0925/main-DFKh-ZaJ.pre-sun.js`.

Probe tools: `tools/_live.mjs` (persistent headless page on port 49997: POST /eval runs in the 3D frame; the app renders on demand, so dispatch a resize to see a change), `tools/_look2.mjs` (V1 and V2, pass off, occlusion buffer, pass on), `tools/_v2tour.mjs`, `tools/_ba.mjs`.
| Both zips rebuilt after the other session's 23:50 home 3D pass | prune list gains assets/iaq/model3d/README.txt (named the maker and the source app); dist-launch leak checks all 0, and 0 public files name Bazil; deliver/iaq-website-launch-2026-09-25.zip and deliver/iaq-website-complete-2026-09-26.zip both carry the new public/3d (iaqCatch present). Team zip re-verified: unpacked source rebuilt clean, all checks 0; site-netlify and the rebuild crawled 8 routes, 0 errors. Note: running tools/prune-launch.mjs with no argument prunes dist/ (its default); dist/ was rebuilt with npm run build after an accidental run. tools/_ziptest-0925.mjs takes ZPORT (8791 was held by another session's server) | tools/prune-launch.mjs |
| Services banner 3D, same request ("all our 3D render") | `src/scenes/ao-pass.js`: the home pass as a module (4x MSAA half-float target with depth, half-res bounded occlusion, exact-period blur, depth-aware upsample, then the renderer's own tone mapping and colour space; transparency kept). fabreal's solid pass renders through it; the see-through pass of a pick still draws straight over. Desktop only, `?nolook` or `window.__aoOff` turns it off, `window.__aoTune` tunes. Verified at rest and with Fire protection picked: 60 fps, 0 errors | src/scenes/ao-pass.js, src/scenes/fabreal.js (backup src/_backups/fabreal-ao-0926) |
| Both zips rebuilt again (26 Sep, 00:10) to carry the Services banner occlusion (src/scenes/ao-pass.js via fabreal.js, the other session's b26av) | dist and dist-launch rebuilt; leak checks all 0, 0 public files name Bazil; team zip re-verified (unpacked source rebuilt clean, checks 0, both copies crawled 8 routes with 0 errors); the built /services banner renders at 61 fps with 0 errors (tools/_probe57-0926.mjs serves a folder and captures it) | deliver/ |
| IAQ graphic rules (25 Sep memory rules) applied to my recent work | unit.css (end): .un-bento-c.is-lead::after off; .un-flow connector solid #EC2027 1px, none under 1100px; flow numbers and .un-join square, no halo. tool-scope.css .tsc-col inset top 1px #EC2027. services-bar.css: grey hairline off. base.css .f-certs border-top #EC2027. Flagged to the other session: fab-real.css callout stems (vertical, gradient) and the amber works colour site-wide (for Bazil) | styles (backups src/_backups/iaq-rules-0926) |
| IAQ graphic rules on the Services banner callouts (flagged by the other session) | no stalk, no gradient, no glow, no round ping: each tag is a flat navy slim box touching its point, the point a 6 px square in the layer colour. FabReal.jsx tries eight spots that all touch the point (above centred, flush left, flush right, beside right, beside left, below centred, flush left, flush right); when all are taken the tag folds away and its point stays, name on hover. Verified: MEP pick, 6 labels, 0 overlaps, 1 folded; 0 errors | src/components/FabReal.jsx, src/styles/fab-real.css (backups src/_backups/fr-callouts-0926) |
| IAQ graphic rules, second pass over my areas | dcs3d.css (end): .dcs3-num, list .n, pins, bullets, package dots square, ping off, ETS legend without a grey outline. .thb-fig, .tsc-fig, .sg-stage: soft shadow in place of the grey 1px frame. careers.css (end): .cr-band is a two-column grid (copy left, photograph right at opacity 1, no scrim), stacked under 1000px; verified 0 text over the photograph at 1440, 1180 and 390. The yellow works colour was answered by the "IAQ website viewing" session: works is now black #231F20 site-wide | styles (backups src/_backups/iaq-rules-0926) |
| Zips rebuilt 26 Sep 01:10 on Bazil's "proceed" (not waiting for the other session's rules pass to finish) | carries the callout rebuild, works in black, the entity name "IAQ Technology International Sdn. Bhd.", both rules passes; leak checks 0 (Design tab and model README pruned, 0 files name Bazil); team zip unpacked, rebuilt from source clean, both copies 8 of 8 routes clean. Rebuild once more when "pages fix content" reports its last change | deliver/ |
| Zips rebuilt 26 Sep 01:16 for the "IAQ website viewing" session's fab3d.js change (machines steel, not yellow) | leak checks 0; team zip unpacked, rebuilt clean; both copies 8 of 8 clean | deliver/ |
| Working decisions (Bazil: "proceed, choose best") | EPC stays at four stages as Bazil set them; the Q-EPC-A conflict is for IAQ at handover. The generated hook-up clip stays (Representation), pending IAQ. "remoum" read as a typo, no change. The two wordless screenshots closed as not received. Checklist m30u | public/checklist.html |
| Final crawl and final zips (26 Sep, ~02:15) | audit-crawl 94 loads, every measure 0. The "pages fix content" session reported its last IAQ change was in the 01:10 build and moved its other-project probe scripts (tools/_mh*) out; the 01:16 team zip carried one, so the final rebuild drops it. Public build: 0 of every leak check and 0 other-client names | deliver/ |

## 26 Sep, night · Design tab (tab 04): brand elements, art direction, applications

The Design tab is now the brand system as well as the site's specification: 20 sections, a left sidebar with a scroll spy, and the portal's Design direction page shows the same tab (`/portal/direction` frames `/design.html?embed`; `?source` shows the old React page, which `tools/export-icons.mjs` reads). Everything added lives between `DESIGN-APPS` markers and is rebuilt by `python3 tools/design-apps-0925.py` from `tools/design-apps/{elements,references,artmarks,decisions,applications}.html` and `public/design/apps.css`. `public/design/` (logos, photographs, references, QR) is pruned from the launch build.

| Request (Bazil, 25 and 26 Sep) | What changed | Where |
|---|---|---|
| Store the seventeen references | 03 Art direction: all seventeen on a dark board, each with what IAQ takes and what it changes | `public/design/refs/`, `tools/design-apps/references.html` |
| Brand elements complete, flexible, when and how to use | 02 Brand elements: lockup (IAQ's own PNGs), colour and the two 80/20 modes, fonts, the line (whole, in three, in four) from the vector logo, the seven lines at exact thicknesses, the delivery cycle, slim boxes, squares and texture, construction wireframe, visuals, gradients, badges, an 18 card element library, statements, company block, print values, boundaries of design and language | `tools/design-apps/elements.html`, `public/design/iaq-construction.svg` |
| Eight applications, realistic | 19 Applications: panels, signature, tender and investor covers, cards, roll ups, banners, folder with letterhead and notebook, site signage | `tools/design-apps/applications.html` |
| Photographs not yellowish, not filtered | true colour with the yellow cast removed | `tools/design-grade-0925.py` → `public/design/photos/` |
| Icons: markets, delivery models, interface, service objects | markets violet with a white part; ModelIcon on the line mark frame; Done is a tick, Checklist added; service objects are the cycle3d renders, loops and cards | `IconLibrary.jsx`, `icon-library.css`, `ModelIcon.jsx`; re-export with `node tools/export-icons.mjs` |
| More art marks, in motion | six service scenes on the value mark rules, animated only on screen | `tools/design-apps/artmarks.html` |
| Log the decisions | "The brand system, 25 and 26 September" ledger at the foot of 16 Decisions | `tools/design-apps/decisions.html` |
| Phone and tablet | the tab measures exactly the screen at 390 and 768; the pieces stack one per row under 700 px | `public/design/apps.css` (end) |

Proof: `node tools/shot-design-apps-0925.mjs <out> <width> [names]` captures every subsection and application (0 errors, 0 broken images at 1440 and 390).
| Team zip rebuilt (26 Sep, ~02:30) for the Design tab session's internal changes (design.html, design/apps.css, design-apps/decisions.html, its HANDOVER section); the Netlify zip is unchanged (dist-launch unaffected); 0 other-client names in the added files | deliver/iaq-website-complete-2026-09-26.zip |

## 26 Sep 2026, early morning: IAQ graphic rules across the live site; loader, reel order, hero electrons

Bazil: "proceed" on checking the whole site against his IAQ graphic rules (memory iaq-graphic-rules and iaq-design-elements-rule), then, mid-pass, four direct notes about the home page.

| Bazil | Done | Where |
|---|---|---|
| "the loading screen looks like there is a sphere inside", "supposed to be all dots", "it loads like a loading screen" | the light body sphere under the dots is no longer drawn (dots front and back; the depth fade keeps the far side light); the loader ground is flat white instead of a radial white-to-grey. The rising fill (dark dots under the level, IAQ red at the level) is the progress | scenes/home.js (loader block), styles/home.css #loader; backup src/_backups/hero-fx-0926/home.pre-loader-body.js |
| "switch slide 2 and 3 place", "then 2 and 8 place" | reel order now: stadium, district cooling, KL, tool hook-up, cleanroom bay, campus at dusk, data centre, cleanroom corridor. Same eight clips; the scene bar follows (names keyed by file). LOCKED table updated | scenes/home.js SRC |
| "where are the electron cleanroom effect on the banner video, red and white" | the field is back as crisp square specks, white with about one in five IAQ red, 120 on desktop, 56 on a phone; no glow sprites, no fading tails, no link lines, no additive blend (the IAQ rules rule those out, and they were most of the "looks a bit weird" of 25 Sep) | scenes/home.js hero field IIFE, styles/home.css (the 25 Sep display:none!important removed) |
| rules audit | `tools/rules-audit-0926.mjs <out> [base] [routes] [width]`: loads all 36 public routes, checks every element and its ::before/::after (vertical lines, short dashes, non-red hairlines, outline boxes, gradients and radial blooms, yellow, rounding, 700+ type, mono words, photo filters, overlays and type on photos, red glows, warm photos) and names the stylesheet rule behind each (Vite's data-vite-dev-id). Allowlisted as approved: the delivery ring (discs, track, red arc), the hero scene bars, the footer's 3D logo layers, the two grey fades Bazil asked for on 24 and 25 Sep (.glance.gr and the ring band) | tools/ |
| fixed | red button flat (no two-stop fill, top light or glow); site search: no left stripe, filled key chips; every 700 to 900 weight to 600 in 38 shared sheets plus b/strong at 600; radial blooms off (closing band pointer glow, culture hero, values grid); History timeline: no spine, no year-tick stack; flow line red and whole, no red dash per node; square bullets; filled chips, tags, cards, filter and save buttons instead of outlines; the line tokens --line/--line2 are IAQ red on white and on navy bands (was ink .09/.15, white .08/.16); careers seams and head rule red; markets and news hairlines red; closing band and footer flat navy (the footer is transparent over the band so its sitemap is not covered); red glows off the closing, contact and map buttons; values carousel photos in full colour; 404 label in Switzer 600 | styles (backups src/_backups/rules-0926), components/RegistryBanner.jsx, pages/NotFound.jsx |
| proposal, for Bazil | the Projects banner as two blocks: the words on a flat navy block on the left, the photo wall upright and in full colour on the right, no scrim, no grayscale, no grid; on a phone the wall sits above the words. The same banner pattern (a headline on a darkened, desaturated photo behind a navy scrim) is on the home hero (locked), About, the About video banner, News, Contact, Markets, Culture, the page heroes, the home market cards and the news lead: waiting on his word before the rest follow | styles/registry-banner.css |
| kept, on purpose | the Malaysian flag's yellow (a national flag is drawn true); the two grey fades he asked for; faint square grid textures and the hatched placeholder slots | |
| Rules-audit findings in my files (from "pages fix content", 26 Sep early morning) | unit.css (end): .un-model check marks #EC2027; .un-pc-fig img filter none. dcs3d.css (end): .dcs3-spin square, red. Held for Bazil: .un-hero-fig::after dark fade over the hero photo (the banner question; the Projects banner two-block version is the proposal). Soft shadows on figures and district cooling UI kept (depth, not glow) | styles (backups src/_backups/iaq-rules-0926/*.pre-audit.css) |
| FINAL zips (26 Sep 05:13), after both other sessions' all-clears (rules pass; 3D HUD) | tools/prune-launch.mjs now also scrubs review names from the launch build: HTML comments naming the reviewer removed, CSS/JS comment text naming him replaced with "review" (comment text only; skipped when the target is dist/). Leak checks 0, 0 other-client names, 0 files naming Bazil; team zip unpacked and rebuilt clean (the scrub ran there too); both copies 8 of 8 routes clean | tools/prune-launch.mjs, deliver/ |

## 26 Sep, early morning · The Facilities 3D: Environment default, a refined card, a furnished site

| What | Detail | Files |
|---|---|---|
| Environment is the default ("default should be V2, Environment call it") | The skin buttons read Environment and Classic (no "V1 ·", "V2 ·"), Environment first and pressed on load. The bundle's default is v3 unless the visitor chose Classic; the choice is stored under a new key, iaq.section.skin-0926, so an old stored "v1" no longer overrides the new default | public/3d/index.html, public/3d/v3.html, public/3d/assets/main-DFKh-ZaJ.js (two strings) |
| "No square" | No panel, tint, outline or flash behind any rail row (lit, landed, struck); the struck animation keeps its movement only | DevBuild3D.jsx (#iaq-embed-style, #iaq-light-style) |
| "Don't put it in boxes" | The speeds are words: no border, no fill; the chosen one white on Classic, #C8141D on Environment | DevBuild3D.jsx |
| Card sized to its buttons | With Environment the default, its white card showed "Enter the cleanroom" and "2×" hanging past its edge at every width under 1920; the column is now never narrower than its buttons (min-width: min-content), measured 1024 to 1920 | DevBuild3D.jsx |
| "Refine the interface" | New block #iaq-refine-style (appended last, delete it to go back): one colour cue per row (the mark's accent); two digit numbers in quiet ink from a data-n attribute (a CSS counter fails on phones, where hidden rows cannot count); no dot after finished titles; finished titles ink, coming ones quiet; the lit row's progress line runs the full column width on a track in its own hue; buttons fill the column on one grid, closer to the rail; speeds flush with the buttons; callouts in the scene are navy slim boxes, Switzer sentence case, red square | DevBuild3D.jsx |
| The parked cars never appeared | cars-lite.glb (like most models) is gzip saved as .glb; the app's own loader Pa unpacks gzip, but the car kit called the plain loader and failed silently (dev and Netlify), so the 21 front bays stood empty. The car kit now goes through Pa: one call changed in the bundle. crane, excavator, roller and truck still use the plain loader and show the app's procedural stand ins, on purpose | main-DFKh-ZaJ.js (backup src/_backups/hud-0926/main-DFKh-ZaJ.pre-cars.js) |
| "Can't be too empty here, put something" | The bare paving south of the fab (where the south utility building was cut on 25 Sep) is furnished at runtime, hung on the app's handover-site group so it arrives with the handover and only in Environment: a pipe rack along the fab, gensets (west), a four cell cooling tower bank, the transformer compound and switch room, the bulk gas yard (three tanks, two vaporiser banks, east beside the annex), a staff car park in the app's own car models (instanced, about 100 cars, bay markings, tree islands, lamps), a wastewater plant south of the annex, a tree line on the south edge. Shadows: the site sun casts for these pieces; the site paving is unlit, so the app's own shadow catcher is lent over it; soft contact shade under every piece and car | DevBuild3D.jsx (furnishYard) |
| Paint and yellow | Every car on the site repainted in a calm palette (white, silver, grey, black, navy, deep red, bronze); the construction machines and barrier rails, drawn in amber, repainted steel. The building's discipline colours are untouched | DevBuild3D.jsx (repaintCars, steelMachines) |
| Proof | tools/_hud-0926.mjs (skin, row fills, speeds, phone), tools/_hudw-0926.mjs (card against buttons at four widths), tools/_card2-0926.mjs (card at Overall), tools/_yard-0926.mjs (yard at handover, shadows, paint), tools/_envtour-0926.mjs (nine chapters and the walkthrough); 0 page errors | tools/ |
| Open, for Bazil | The realism plan (ground texture, walkthrough type and its tick tape, tool colours inside, lighting) is in the session reply; nothing of it is built beyond the above | |

## 26 Sep 2026, 06:20: loader check and variations, first-paint shell, line rules on the Design tab and the site

From "pages fix content". Bazil: "is the loading screen ok, put the loading screen in the design tab so we can check it out put 3 variations", then on the Design tab: "no separated lines like above", "7 lines use must be used subtly like a small lines set at bottom", "most common use should be the 1 line straight", "cannot have too many lines".

| Bazil | Done | Where |
|---|---|---|
| is the loading screen ok | Yes, with one fix made. Measured on the dev server: all dots, 60 fps, 100% at 2.4 s and lift at 2.9 s on a phone, 2.8 s and 3.3 s on a laptop. The fix: for the first 0.25 to 0.5 s the page showed its frame (a blank page, the admin bar on dev) before the app mounted #loader. index.html now paints a white shell with the pale IAQ mark exactly where the loader draws it (matched to the pixel at 390, 800, 1440 and 2560, root zoom included), handed over when #loader mounts (~0.57 s), dropped before paint on every other route. Still open: the soft white radial lens behind the logo (.ld-ui::before, home.css) breaks the no-radial rule | index.html (backup src/_backups/boot-0926/), tools/_boot.mjs |
| put 3 variations in the design tab | Design tab, 13 Motion, Loading screen (#mo-loader): three live loops. 1 the globe fills (live today), 2 from Shah Alam (grows from HQ with a red front, turns Malaysia to the centre), 3 the IAQ line (flat square-dot world over one long red line as the progress bar) | public/loader-lab/ (pruned from launch), tools/design-apps/loader.html, LOADER block in tools/design-apps-0925.py |
| no separated lines; one straight line is the common use; seven lines small at the foot; not too many lines (Design tab) | the line in three and in four retired (Never plates only); .l7 is seven fine lines, a small set at the foot of every piece; extra lines removed from the tender, letterhead, signature banner, folder (wireframe gone, seven moved from head to foot), totem and door plates; In use screens keep one line under each title, rows on space, frames as shadows, spec sheet in tint rows; 02 Brand elements text, plates and library rewritten; Decisions and References updated; construction drawing lost its split rows | public/design/apps.css, tools/design-apps/{applications,elements,decisions,references}.html, public/design.html (In use words), public/design/iaq-construction.svg; backups src/_backups/lines-0926/ |
| the same rules on the live site | grid-line grids (gap 1px on a line background, which also drew vertical dividers) became spaced blocks; lists keep one top line and rows sit on space; outlined tags, badges, cards and boxes filled; the news rail is one line that fills red; the Markets table has one line under the head row and a tint on every other row. Lines per page, 1440: /markets 49 to 6, /exhibition 45 to 3, /about/esg 35 to 6, /global-presence 34 to 7, /about/leadership 31 to 4, /policies 31 to 5, /careers 17 to 4 | markets, company, careers (.job seam only), news-banner, gated, pages, base (nav mega rows, .us-foot), detail-diagram, campaign, news .css; backups src/_backups/lines-0926/site/; audit tools/lines-audit-0926.mjs |
| left for their owners | works-band.css .wk-card::before (four top lines side by side on the Services works cards) asked of "viewing"; .un-spec/.un-row row lines and the .un-mark outline on the unit pages told to "comolex" | messages sent 06:1x |
| One straight line over the works (Bazil 05:40: "no separated lines", "most common use should be the 1 line straight") | On /services the four red card tops of the works band read as one line cut in four; they are gone, one 3 px red line runs over the whole grid, gaps included | styles/works-band.css (backup src/_backups/hud-0926/works-band.pre-oneline.css) |
| rules crawl after (06:25) | against the 04:57 rules-pass run at 1440: grey-line 19 to 2, light-line 49 to 7, outline-box 12 to 0, no new rule types. Three follow-ups from it: the news rail track is dim IAQ red with the played part full red; the industry card pill (.ig-pill, shows on phones) is a filled red slim box, not a white outline; the investor gate's one line is red. "viewing" replaced the four works-card tops with one red line over the grid | news-banner.css, industry-grid.css, gated.css; works-band.css (viewing) |
| open, for Bazil | which loader variation goes live; the soft white radial lens behind the loader logo; the /services delivery cycle's grey track, short red dashes and chevrons (an approved core element) under the new line rules; the Projects two-block banner proposal | |
| Zips rebuilt 26 Sep 06:21 (after 06:09) | carries the viewing session's site yard, car-kit loader fix and refined 3D cards; the other session's first-paint boot shell, site-wide line pass, loader-lab (pruned) and three last rule fixes (news rail, industry pill, gate demo) plus works-band. prune-launch gains 'loader-lab'. Full crawl before this build: 94 loads, 0 on every measure. Leak checks 0; team zip unpacked and rebuilt clean; both copies 8 of 8 routes clean | deliver/ |

## 26 Sep 2026, morning: Design tab fixes, loader v4 live, the delivery cycle as one line

From "pages fix content". Bazil on the Design tab and the site, in order.

| Bazil | Done | Where |
|---|---|---|
| "dont do this as well" (badges on red in a white container) | a Never plate now; the rule reads: badges only on a white piece; red and navy pieces carry none, the white piece of the set carries them (no application used them on red) | tools/design-apps/elements.html (el-badges) |
| "i cant find the loader" | his pane held a copy loaded at 05:22; reloaded. The Loading screen now sits at the TOP of 13 Motion, straight under its head | tools/design-apps-0925.py (LOADER insert point) |
| "cannot do 3 or 4 line must do 1" | already true in the current tab (his copy was stale): split lines only as crossed Never plates | |
| "why not aligned" (03 Construction) | the frame was drawn 6 units left of the hook and module; centred under x 160 | tools/design-apps/artmarks.html |
| "go for this but the land grey is too dark or too strong", "that colour overlaps need to fix", "make this better", "do a v4" | v4 = number 1 refined, and LIVE: land a light slate (0.55 0.59 0.66, far side 0.74 0.77 0.82, sea 0.72 0.76 0.84); the round white lens is gone; a white knockout the shape of the letters (bar gaps closed, 5 px square halo) sits under the mark, so no dot shows through its stripes; it follows the settle. Verified 390, 1440, 2560: knockout exactly on the mark, 100% at 2.4 to 2.6 s, no errors | public/assets/iaq-logo-knock.png, styles/home.css (.ld-ui::before), scenes/home.js (land colours), public/loader-lab (?v=v4), tools/design-apps/loader.html (2 x 2 grid, v4 first); backups src/_backups/loader-v4-0926/ |
| "whats wrong with 02 04 06, did it just get worse" | the Design page's form field class .f (width 100%) also matched the value marks' grey fill shapes (svg rect.f) and stretched them full width. Scoped to HTML: .f:not(svg *) | public/design.html (inline CSS); backup src/_backups/lines-0926/design.pre-fscope.html |
| the delivery cycle under the line rules ("just go proceed with all", relayed by viewing) | no dash travels the wire now: the run draws itself as one growing red line Design to Hookup in 6 s, the return after it at the same speed, a hold, a fade, again (period 7.68 s, chevrons on the same period); the grey track is light IAQ red; the background mesh is gone; the stub of wire between a label and its chevron (read as a short dash) is masked | src/components/CycleFlow.jsx, src/styles/cycle-flow.css (end); backups src/_backups/cycle-lines-0926/ |
| "why cant i find these photos or videos in the client files" | the Site Photos (Website 2027/Site Photos, 71 photos, 26 Oct 2022) were in the second 17 Sep OneDrive zip, which stopped downloading at 5.5 GB before reaching them; its recoverable part (cleanroom and event photos) is in Client info/IAQ/SharePoint 2027 (17 Sep). The EFM zip holds one file, ARROW-FLOW.gif. Needs: download that folder on its own from OneDrive | |
| zips | deliver/ zips are from 06:26 and do not carry this section; the "comolex" session that built them is offline. Rebuild once "viewing" reports its 3D phase done | |

## 26 Sep, morning · The Facilities 3D realism phases 1 to 4 (Bazil: "just go proceed with all")

| What | Detail | Files |
|---|---|---|
| 1 Walkthrough in the house rules | Sentence case and no letter spacing on every walkthrough label (Level, Details, Walkthrough, 1st person, 3rd person, Controls, Map, Door); no filled box for the current level or view (ink and red instead); the heading strip draws square dots with a red square for the heading, no vertical ticks; the live marker square and flat | DevBuild3D.jsx (#iaq-refine-style) |
| 1 Walk look | For the walk only: machines in white and light grey panels by their own tone, sprinkler runs steel, the ceiling grid lifted; put back on exit (verified: machines return to the Tools colour, sprinklers red). The entered floor streams its detail in after the walk starts, so every tick picks up newcomers; the app draws the walk on demand, so frames are requested through the dive. The model merges the alarm bells with the sprinkler heads, so the bells turn grey too | DevBuild3D.jsx (walkApply, walkLook) |
| 2 Ground | The app paints the site's earth into two canvases (plot and dug pad), dark and striped; both are repainted in place as light compacted ground, seamless | DevBuild3D.jsx (paintGround, repaintGround) |
| 2 Sun | Same direction, lower: (90,140,60) to (100,105,65) in the three places the bundle sets it (main sun, site sun, section sun); about 52 to 41 degrees, shadows about 1.5 times longer | main-DFKh-ZaJ.js (backup src/_backups/hud-0926/main-DFKh-ZaJ.pre-sun.js) |
| 3 Real machine models | truck, crane, excavator and roller now load through the gzip-aware loader Pa (they failed silently before and showed box stand ins); their stock yellow is taken out of each texture once, in steel, detail kept (construction machines only) | main-DFKh-ZaJ.js four calls (backup ...pre-props.js), DevBuild3D.jsx (steelTextures) |
| 3 Tree line | During construction a loose line of the app's own trees stands 150 to 240 m out; it is hung on site-props so it leaves at handover, when the app's own world comes in | DevBuild3D.jsx (ringTrees) |
| 4 Ambient shading | Already built on 25 Sep: public/3d/iaq-look.js (AO, filmic curve, desktop build view only); left as is | public/3d/iaq-look.js |
| 4 Cost | The yard's cars no longer cast shadows (contact shade grounds them); phones draw the app's box cars. Measured per render at handover: yard adds about 31 draw calls and 0.17 M triangles on desktop, 25 calls and 0.05 M on a phone | DevBuild3D.jsx |
| Also | The red "Enter the cleanroom" button is flat (the app's shine sweep off); the stage list never starts a line with a separator dot and never breaks "sub-fab" at its hyphen | DevBuild3D.jsx |
| Dev server | 5177 went down (stopped elsewhere); 57375 is the live IAQ dev server, kept running; Websites/.claude/launch.json iaq-attach and the tools/_*-0926.mjs harnesses point at 57375 | |
| Proof | tools/_walk-0926.mjs, _walkexit-0926.mjs, _ground-0926.mjs, _props2-0926.mjs, _perf-0926.mjs, _hud-0926.mjs (1440 and 390), _envtour-0926.mjs: 0 page errors | tools/ |
| Left as found | The phone's handover view is far and hazy (the app's phone framing and fog) | |
| zips rebuilt 26 Sep 10:14 ("pages fix content", on "viewing"'s request after its 3D realism phases; "comolex" offline) | same procedure as comolex (its 25/26 Sep commands), staging in this session's scratchpad (START-HERE.md, site-netlify and source as links). Launch checks: passcode 0, codex/portal 0, SOURCES 0, IAQ Utility Solutions 0, Hasegawa 0/0, Bazil 0, other clients 0, design/loader-lab 0; boot shell 1, knockout asset 1. Team zip unpacked, launch rebuilt from its source: the same checks 0; both copies 8 of 8 clean. Carries viewing's DevBuild3D.jsx and main-DFKh-ZaJ.js changes and this morning's section | deliver/iaq-website-launch-2026-09-25.zip (339 MB), deliver/iaq-website-complete-2026-09-26.zip (1.09 GB) |

## 26 Sep 2026, midday: the site photographs in Client files, the reel's ninth scene (a session recovered)

The "IAQ website pages fix content" session was cut at 11:43 while "building the banner clip" from IAQ's OneDrive zip. Recovered here from its transcript on disk and its scratchpad (contact sheets `site71/`, both survived; the photos were already in the store and the Client files index had finished, exit 0, 1202 files). Nothing was lost.

| What | Detail | Files |
|---|---|---|
| Site photographs saved and listed (Bazil: "please save it list") | `OneDrive_2026-09-26.zip` from IAQ's OneDrive (Website 2027 / Site Photos): 71 JPGs, 871 MB, Canon EOS R, 21 to 26 Oct 2022. In the client store as `Client info/IAQ/OneDrive 2026-09-26 (Site Photos, Website 2027)/Site Photos`, indexed (Client files tab, 1202 files) | client store, `_reference/client-files/index.html` |
| The banner video (Bazil: "create a video of these one for the banner") | The home hero reel's NINTH scene, "On site": three of the photographs, each a 3.2 s slow push, joined by 0.7 s dissolves, 8.2 s, 1920x1080, 24 fps, H.264 High yuv420p bt709, 6.8 MB, the same format as the other clips (they hand over at duration minus 1.35 s, so the third shot is on screen when the reel moves on). Shots: IMG_9181 (the crane, two engineers point across the site), IMG_9445 (the scissor lift, IAQ SAFETY FIRST on the vest), IMG_9517 (the finished cleanroom, raised floor). Masters at 7680 px so zoompan's integer steps are a quarter of an output pixel. The eight locked clips and their order are untouched; the new scene is last | `public/assets/videos/hero-site-team.mp4`, `src/scenes/home.js` (SRC ninth entry, NAMES `hero-site-team`), recipe `tools/hero-site-team-0926.py` (writes to `OUT` or `tools/_site-clip/`), backups `src/_backups/site-clip-0926/` |
| Left out | IMG_9497 and IMG_9486 (plant room, reading the drawing): a second company's mark on the polo beside IAQ's; other companies' names stay off IAQ's public pages. The empty plant-room and floor-tile frames show no work | |
| Verified | Dev server 5177 (`iaq-site`; 57375 had gone down): nine cells in the scene bar with the names in order, a click on the ninth lands "On site", `hero-site-team.mp4` plays at 1920x1080 (readyState 4, no error), headline legible over the white cleanroom shot at 1440x900, 0 console errors | captures in this session's scratchpad `site/` |
| Locked rows corrected | The Services cycle row said ServiceRing.jsx; the code mounts CycleFlow.jsx (serpentine) from CycleBand.jsx, and the ring was rejected 26 Sep. The hero row now lists nine clips | HANDOVER LOCKED DECISIONS |
| Client set | The clip is added to `From Brand Method (ready to send)/2026-09-25 Video set` as 08 On site, README line added | client store |
| Open for Bazil | Where the ninth scene goes in the order (last for now). The Projects banner two-block version still waits on his go-ahead | |

## 26 Sep 2026, 12:05: the two best photographs turned into videos, scenes ten and eleven

| What | Detail | Files |
|---|---|---|
| Bazil: "turn the best 2 picture u choosen into videos for the banner for iaq to add more", "u can use higgsfield" | The crane (IMG_9181) and the scissor lift (IMG_9445), each a 1920x1080 16:9 crop of IAQ's photograph as the start frame of a Higgsfield Seedance 2.5 image-to-video: mode omni_reference, role start_image, 8 s, 1080p, 16:9, no audio, high bitrate. Upload path that works: `media_upload` (presigned URL), `curl -X PUT` from the machine (200), `media_confirm`. Jobs 6c954cb5 (crane) and bb063f43 (lift), about four minutes each. Output is HEVC 10-bit at 15 to 27 Mb/s; transcoded to the reel's H.264 High yuv420p bt709 24 fps (crf 20). One take each was enough: the crane holds the two engineers and the pointing with a slow push in and moving cloud; the lift has the worker handing a wrench down, the lift still, the vest text intact | `public/assets/videos/hero-site-crane-hf.mp4`, `hero-site-lift-hf.mp4`; `src/scenes/home.js` SRC entries 10 and 11, NAMES "Site crane", "Working at height"; start frames and takes in this session's scratchpad `site/` |
| TRAP | `generate_video` intercepted the crane prompt with a preset recommendation ("IN THE DARK") and submitted nothing; resubmit the same params with `declined_preset_id` and it goes through | |
| Verified | Dev 5177: eleven cells with the names in order; scenes 10 and 11 play on click at 1920x1080 (readyState 4, no error); the pane's screenshot showed a stale video layer once (the stadium under a "Working at height" label), so the frame was sampled through a canvas from the playing element and matched the lift clip, and the next capture showed it; 0 console errors | |
| Client set | 09 Site crane, 10 Working at height added to `From Brand Method (ready to send)/2026-09-25 Video set` with README lines that say the photograph is IAQ's and the movement is generated | client store |
| Note for IAQ | IAQ's 24 Sep line was against generated construction and installation footage. These two start from IAQ's real photographs, so the site, the kit and the people are IAQ's own; the movement is generated. On the site at Bazil's decision, to raise with IAQ with the hook-up clip | |
| Open for Bazil | The reel is eleven scenes (about 74 s a cycle). The montage "On site" (scene 9) now repeats the crane and the lift that scenes 10 and 11 show on their own; dropping scene 9, or keeping it, is his call. Order of the three new scenes likewise | |

## 26 Sep 2026, 12:15 to 12:40: the focus box, the order, per-scene holds, the lift redone

| Bazil's note | What changed | Verified | Files |
|---|---|---|---|
| "remove this static look" (a white box round the playing cell of the scene bar) | It was the 2 px white `:focus-visible` outline on the clicked cell. Now: no outline; keyboard focus reads as the brighter track (as hover); a pointer click never leaves focus on the cell (`mousedown` preventDefault) | Real mouse click on the dev build: active element is the body, outline none, the bar shows the red fill alone | home.css (.hs-c:focus-visible), home.js (mousedown) |
| "second last and last please shuffle at best place" | Site crane and Working at height moved to 4 and 5: after Kuala Lumpur, before Tool hook-up, so the run reads site, at height, hook-up, cleanroom bay (construction to installation to result). Slots 1 to 3 untouched, the montage last | Bar reads 1 to 11 in that order | home.js SRC |
| "some videos can be shorter like this one" (on Tool hook-up) | Per-scene holds: `HOLDS` map in `holdFor()`, keyed by file name; tool hook-up 4 s, lift 5.5 s (its hand-over completes by 6 s); unlisted scenes hold to their own loop point. To shorten any scene: one number in HOLDS | Measured from click to the next name: Tool hook-up 5.68 s, Cleanroom bay 7.80 s | home.js |
| "u see the iaq disappear like not iaq logo u need to fix this video", "detail through" (the lift clip) | Detail crops of both clips at five times (vests, helmets, hands, printed text): the crane holds every detail through 8 s; in the lift take the engineers' IAQ marks hold but the platform worker's plain vest grows a smudged emblem as he bends. Redone: Seedance 2.5 with the IAQ logo (public/design/iaq-lockup.png on white, media 451be937) as an image reference and every printed mark named and locked in the prompt, the platform vest stated plain, smaller movement; two takes (jobs 87c2eb79, 998c780e) | Take B (998c780e) kept: crops at 0.1, 2, 4, 6, 7.9 s show IAQ on both engineers, the small IAQ on the platform vest, helmet stickers and JCPTT all holding; the worker stays on the rail and hands the wrench down. Take A had him bending with a smeared chest mark at 2 s. Transcoded to H.264 and swapped in under the same file name; first take in `src/_backups/reel-order-0926/hero-site-lift-hf.take1.mp4` and the client set's _superseded | public/assets/videos/hero-site-lift-hf.mp4, scratchpad site/det/ |
| "remove this", "video" (on the Site crane scene, 12:55) | The crane clip is off the reel: ten scenes. File kept on disk and in the client set (09), marked not on the site | Bar reads 1 Stadium build, 2 District cooling, 3 Kuala Lumpur, 4 Working at height, 5 Tool hook-up, 6 Cleanroom bay, 7 Production campus, 8 Data centre, 9 Cleanroom corridor, 10 On site | home.js SRC |
| "now its moving less and its like fake as well check the video thoroughly and fix it" (on take B of the lift, 12:58) | Measured: frame-to-frame motion (mean absolute change on 320 px grey frames) take 1 = 3.10, take A = 1.81, take B = 2.04, so B moves a third less than the take he first saw. Three new takes submitted with lively natural movement named for all three people, a handheld drift, real texture, and every mark still named with the logo reference (jobs f464c0f9, 001ed397, 73ac5fa9) | see the row below | |
| Round 3 finding (13:10) | Takes C, D, E (jobs f464c0f9, 001ed397, 73ac5fa9; motion 1.41, 3.02, 1.93): every take that let the left engineer TURN to his colleague lost the IAQ on his vest front once his chest panel left the camera (D by 2 s, C and E by 6 s); the right engineer's back and the platform worker held in all three. Rule for generated clips with IAQ kit: keep each person's orientation to the camera fixed and put the motion in arms, the platform worker and the camera. Round 4 submitted on that brief (jobs 86b5fcac, 1f6ad578, 39980f91) | see the row below | scratchpad site/det/lift-C,D,E-sheet.jpg |
| Round 4 result (13:25) | Takes F, G, H (jobs 86b5fcac, 1f6ad578, 39980f91; motion 2.14, 2.07, 2.21). H kept: every mark holds at 0.1, 2, 4, 6, 7.9 s, the left engineer keeps his chest panel to the camera while taking the wrench, the right engineer points up, the platform worker crouches and straightens, the camera drifts. F turned the left engineer at 4 s and lost his mark; G is calmer. A 6% eased push in was added in the transcode (zoompan over a 3840 px upscale) so the clip carries continuous camera movement like the first take. Swapped in under the same file name; take B kept as `src/_backups/reel-order-0926/hero-site-lift-hf.take2-B.mp4` and in the client set's _superseded | Served file and playback checked on the dev build (row below) | public/assets/videos/hero-site-lift-hf.mp4, scratchpad site/det/lift-F,G,H-sheet.jpg |
| Home page console error found during the checks (13:40): `d.userData[Pi].getHSL is not a function` in the dev 3D bundle | Not from today's edits. The bundle's skin repaint (bP and four sibling reads) trusts `material.userData.__origColor` to be a THREE.Color; at runtime one material (mesh_2 in detail-frame-gf) held the hex NUMBER instead (a material clone JSON-round-trips userData, and a Color serialises to its hex; the model files carry no such key). BUNDLE PATCH, to re-apply on the next delivery: the five reads now check `?.isColor` before trusting the stored colour and re-clone otherwise (`c.userData[Pi]?.isColor||(...)` x2, `d.userData[Pi]?.isColor||(...)`, `o=r.userData[Pi]?.isColor?r.userData[Pi]:r.color`, `x?.isColor&&(x.getHSL(o)`). Backup `src/_backups/bundle-origcolor-0926/main-DFKh-ZaJ.pre-origcolor.js` | Fresh tab, /3d/index.html and the home page, 20 s each: 0 console errors, scene running (6 storeys, 2,139k triangles). TRAP: the pane's console reader keeps a tab's old entries across reloads; judge a fix in a NEW tab | public/3d/assets/main-DFKh-ZaJ.js |
| "remove the last slide the static image" (13:35, on the On site montage) | The montage is off the reel: nine scenes, all footage or generated motion, no photo slideshow. File kept on disk (`public/assets/videos/hero-site-team.mp4`) and in the client set (08) | Bar reads 1 Stadium build, 2 District cooling, 3 Kuala Lumpur, 4 Working at height, 5 Tool hook-up, 6 Cleanroom bay, 7 Production campus, 8 Data centre, 9 Cleanroom corridor; 0 console errors | home.js SRC |
| "remove this weird image first" (13:45, the finished-facility still on its piles over bare ground) | Both uses of `assets/3d/intro-finished(-light).webp` removed from DevBuild3D.jsx: the ghost over the stage before the build (`.db3-ghost`) and the blurred copy in the loader (`.db3-load-ghost`). The caption now reads "Scroll to build the facility from the piles up" (tap on touch). The webp files stay on disk; the CSS rules for the two classes are now unused | Dev build: no image with intro-finished in the DOM, caption updated, 0 console errors, stage capture in this session | DevBuild3D.jsx (backup src/_backups/ghost-0926/) |

## 28 Sep 2026: the Scroll to build 3D removed from the home page

| Note | What changed | Verified | Files |
|---|---|---|---|
| "remove all the 3d animation on this folder, also remove the animation section. later on ill send out the latest 3d animation. that needs to be merge into the website not as iframe" | The developer's Scroll to build 3D is off the home page: the section between the delivery cycle and the industries band is gone, and with it the iframe app (`public/3d`, 131 MB), its wrapper `components/DevBuild3D.jsx`, `styles/dev-build-3d.css` and the two intro stills in `public/assets/3d`. The home page now runs straight from the delivery cycle to the industries band. The next 3D delivery is to be built into the page as a component, not framed. Kept: `public/draco` (the Services map 3D, `scenes/fabreal.js`, uses it), FabAssembly in the Codex, the district cooling 3D, UnitBuild. The `tools/_db3-*` and other one-off probe scripts that scroll to `#build3d` no longer have a target. Everything removed is in `iaq-website-complete-2026-09-26.zip` | Dev server: Home compiles with no errors, no DevBuild3D in the served module | Home.jsx |

## 28 Sep 2026: the new Scroll to build 3D, in the page itself (no iframe)

| Note | What changed | Verified | Files |
|---|---|---|---|
| "heres the 3d animation file for that section. can build with the website i dont iframe, i want the 3d and website build in the same project" | The delivery ("3D ONLY" folder, 27 Sep, compiled only: no source) runs inside the home page, in `<section id="build3d">` between the delivery cycle and the industries band. `tools/embed-3d.mjs` converts a delivery into `public/build3d/` (assets, models, fallback, signs; script and styles under fixed names `assets/app.js`, `assets/app.css`) and `src/scenes/build3d-markup.html` (the app's page markup). It patches the minified script at checked points: scroll position, range and scroll-to measured from the section (`window.__b3d`); no jump to the page top when the walkthrough opens; the render loop held while the section is off screen or the home page is not showing; panels the app adds to `<body>` go into the section; page-wide key shortcuts ignore typing and act only while the section is in use; model and sign paths absolute. Its stylesheet is scoped under `.b3d` (html/body rules land on the stage, `@font-face` dropped: the site serves the same fonts). A pattern that stops matching fails the tool loudly | Headless Chrome 1440x900, dev and built site: stage exactly one window, pinned, nav stepped aside; no scroll on load; Start build drives the page and a wheel stops it; rail rows jump; past the section the pin releases; walkthrough full screen, page held still, exit returns to the same place; About and back keeps the running app (0 frames drawn while away); 128 model requests, no failures, no page errors. Phone 390x844: loads only near the section, tap-build mode, a swipe on the model scrolls the page. Five launch checks print 0 | tools/embed-3d.mjs, components/Build3D.jsx, scenes/build3d.js, scenes/build3d-markup.html, styles/build3d.css, pages/Home.jsx, public/build3d |
| How it lives in the page | The app is a script that starts once and never shuts down, so its markup is built once and kept: leaving the home page takes the stage out of the document, returning puts the same nodes back. The section cancels the site's root zoom (`zoom: 1 / --zoomf`), so inside it 1px is a screen px and 100vh is the window, as on the app's own page. The stage is sticky and one window tall; the app's `#scroll-runway` under it (the app sets 2615vh for 25 beats) gives the section its length. The app's own start-up scroll only moves the page after the visitor has clicked or pressed a key in the 3D | | scenes/build3d.js, styles/build3d.css |
| Interim | When the developer sends the source (their `src/`: main.ts, layout.ts, cleanroom/section/*), build it inside src/ as a module with a start and stop, and remove the tool, `public/build3d` and the markup file. A new compiled delivery until then: `node tools/embed-3d.mjs "<folder>"`, then check on the BUILT site (the dev server answers a missed relative path with the home page, not a 404; that is how the sign path was found) | | START-HERE.md |

## 28 Sep 2026: Netlify runs the review build; Amendments hidden there

| Note | What changed | Verified | Files |
|---|---|---|---|
| "hide this amendments on netlify", then "need the super admin. but the Amendments hide", and (asked) make iaq.netlify.app the review site | New build `npm run build:review` (Vite mode `review`, into `dist-review`), which Netlify now publishes (`netlify.toml`). Mode `review` keeps everything a non-launch build has (Super Admin bar, portal, Codex, the review pages), and: the React bar leaves out the Amendments tab (AdminBar.jsx, by mode; the dev server keeps it); `tools/prune-review.mjs` deletes `checklist.html`, strips the Amendments tab from the static pages' own copies of the bar (audit, competitors, design, plan), removes what never ships (the Hasegawa walkthrough, the SOURCES.md staff notes, the model README), and writes a disallow-all robots.txt; netlify.toml adds `X-Robots-Tag: noindex, nofollow` | Review build served locally: bar on /, audit, competitors, plan, design and /portal/codex with Web Audit, Competitors, Web Plan, Client files, Design, Web 1, Web 2, Web 3 live, CMS, Codex (no Amendments); dev server still shows Amendments; checklist.html absent; no page errors | components/AdminBar.jsx, tools/prune-review.mjs, package.json, netlify.toml, START-HERE.md |
| Known | The Client files tab only works on the dev server (the files live outside the repo), so on Netlify it opens the home page. The Codex tab's `?admin` link opens the Codex without the passcode on any non-launch build, Netlify included | | |

## 28 Sep 2026: Services facility map, the picked Work card was a blank white box

| Note | What changed | Verified | Files |
|---|---|---|---|
| "fix this" (Services, The IAQ facility map: the first Work card white and empty while its four systems lit) | On the dark map Work is white (`--work:#FFFFFF`, the ink colour turned over), and a picked card fills with its own colour and sets white type, so a picked Work card was white on white. Work is work amber (#F2B705) on the dark map now, as the house colour; a picked Work card fills amber with ink name, description and mark. The mark needs `!important` because codex-parts.css forces a picked card's svg white with `!important`. Tools hookup (`n-w-s`) fills red and keeps white type | Dev server, headless Chrome 1600x900: CSA and MEP picked, ink type and mark on the white card, others unchanged, no page errors | styles/services-map.css |

## 28 Sep 2026: Services, the 4 works section removed; its lines move into the facility map (client, Website Update 28.09.2026)

| Note | What changed | Verified | Files |
|---|---|---|---|
| Client: "To remove this section and add the description highlighted in red to section below", with the facility map's CSA Work card marked where the line goes | The 4 works section (WorksBand, added 26 Sep) is off the Services page, and its tab is off the section bar. Each Work card on the facility map now carries its one line from data/business.js (CSA "The building itself.", MEP "What makes the building run.", Process utilities "What the tool runs on.") under its full name, through a `lines` option on RelExplorer that only the Services map turns on. Light type on the dark cards, ink on a picked (amber) card. Kept: the Codex's copy of the section, WorksBand.jsx itself, and the "4 works" wording in the system map's heading | Dev server, headless Chrome at 1600x900, 1280x800 and 390x844: section gone, bar tabs 3 business units, 6 services, Tools hookup, Who does what, Your quote, Questions; all three lines inside their cards; no page errors | pages/ServicesHub.jsx, components/ServicesMap.jsx, components/codex/RelExplorer.jsx, components/ServicesSectionBar.jsx, styles/services-map.css |
| Client, same document, twice "Remove below section": the Tools hookup section and the "Six requests, and what each one needs" table | Tools hookup (ToolsHookupBand: the four phases and the Main Tool schematic) is off the Services page, and its tab off the section bar; it stays on /services/all. The "Six requests" table (SCENARIOS) is off the "Your quote" section, which now ends on its three choices (model, scope, work); the requests still show on each unit's detail and in the Codex. The imports and helpers only the table used are gone from ServicesMap.jsx | Dev server, 1600x900: the page runs facility map, 3 business units, 6 services, the system map, Three choices shape your quote, Questions clients ask; section bar 3 business units, 6 services, Who does what, Your quote, Questions; /services/all still has Tools hookup; no page errors | pages/ServicesHub.jsx, components/ServicesMap.jsx, components/ServicesSectionBar.jsx |

## 29 Sep 2026: the email signature takes the house signature's design

| Note | What changed | Verified | Files |
|---|---|---|---|
| "use that design on email signature portal" (the reference: Nabilah Mohd Radzi's signature) | The portal's generator (Member portal, Email signature) builds the reference's layout, 640px wide: name, title and entity left, logo and tagline right, red rule; Mobile, Email, Office, Web in two equal columns with red labels; the address; the red "Engineered environments. Trusted outcomes." block beside the cleanroom photograph; the Intertek and UKAS marks with the ISO line; the entity, its registration number and the confidentiality line. Still one table with inline styles, Arial, hosted PNG and JPG at 2x, the red block a bgcolor cell for Outlook. New images in public/assets/email: sig-cleanroom.jpg (630x180, cut from assets/contact-cleanroom.webp), sig-intertek.png, sig-ukas.png (from assets/certs). The company is chosen: IAQ Solutions Sdn. Bhd. 200501013167 (690214-V) (the reference's, the default), IAQ Technology International Sdn. Bhd. 200001031412 (534019-T) (the footer's), IAQ Group, or typed. New toggles: banner; the confidentiality line now on by default. Saved details move to storage key v2 (name, title, contact and office carry over from v1). A warning shows when the image address is this computer (localhost), since recipients cannot load images from it | Dev server, /portal/signature with the reference's details: preview and the same HTML alone on a blank page (as an inbox gets it) match the reference; all four images load; table 640px; no page errors | components/portal/SignatureGen.jsx, public/assets/email/ |
| Decision to confirm | Until now the company line was "IAQ Group" on purpose (entity names off anything sent outside, client DV3 A2.1). The reference signs with the legal entity and its registration number, so that is the default now | | |

## 29 Sep 2026: a lead form landing page, with leads in Netlify Forms

| Note | What changed | Verified | Files |
|---|---|---|---|
| "make me lead form page" (asked: a campaign landing page; leads to Netlify Forms) | New campaign `/lp/project`, "Cleanroom and facility projects: Tell us what you are building. One team delivers it.", on the campaign template (no site nav, one argument, one form), with the full lead form: name, company, work email, phone, market (the seven industries and Other), what you need, timing, the project. Campaign data takes `form: 'project'` for this form (the others keep the three-field capability pack form) and `back` for the footer link. Every /lp/ form now posts to Netlify Forms as "lead" (lib/enquiry.js `toNetlify`, and `submit()` routes any payload naming `netlifyForm`), declared hidden in index.html so Netlify creates the form at deploy; a honeypot field (bot-field) keeps form-filling bots out. On this computer nothing is sent and the page says so; if Netlify refuses, the page asks the visitor to email or call | Dev server: /lp/project renders, empty submit shows the validation line, a filled submit shows "Preview only: nothing was sent"; /lp/semiconductor keeps its pack form; review build passes and dist-review/index.html carries the "lead" form with all 13 fields; no page errors | data/campaigns.js, pages/Campaign.jsx, lib/enquiry.js, styles/campaign.css, index.html |
| To do in Netlify, once, after the next deploy | Site configuration, Forms: enable form detection, then redeploy so the "lead" form is registered. Then Forms, Form notifications: add an email notification to the inbox that should receive leads (business@iaqtechnology.com.my). Submissions show under the Forms tab | | |
| "remove ISO 9001 · ISO 14001 · ISO 45001": the ISO text after the marks is gone from the signature and its plain-text copy (the Intertek mark carries the three standards; its alt text still names them) | Dev server: signature renders with the four marks and no ISO line | components/portal/SignatureGen.jsx |
| "four these logo" (the footer's CIDB, Intertek, UKAS and Highwire Gold 2024 marks), and the preview cut off on the right | The certification row carries the footer's four marks in the footer's order, all 40px high, then the ISO line (new PNGs: assets/email/sig-cidb.png, sig-highwire.png, from assets/certs). The preview column was widening to the signature's 640px and running off the page (a grid item's automatic minimum is its content); it now keeps to its column, the preview scales the signature down to fit (display only, the copied HTML stays 640px), and form and preview stack below 1180px so the preview stays large | Dev server at 1913, 1300, 1100 and 700px wide: the whole signature inside the preview at every width; all six images load in the stand-alone HTML; no page errors | components/portal/SignatureGen.jsx, styles/signature.css, public/assets/email/ |
| "remove eyebrow tag", then "why dropdown look unconsistant. make it sharp edges" | The small red label over the campaign headline is off the template (all /lp/ pages); its text still names the page in the browser tab. The lead form's three menus are drawn by the page (LpSelect in pages/Campaign.jsx) instead of native selects, whose open list the browser draws rounded, light and in the system font: sharp, on the form's navy, in the site's type, the value in a hidden input. Click, Enter or Space opens; arrows, Home and End move; Enter picks; Escape or a click elsewhere closes; typing jumps to a match; open state and the active row live in refs so fast key presses land | Dev server: mouse pick, keyboard pick (also with no pause between keys), Escape keeps the value, typing "da" picks Data Centre, click outside closes, the three values reach FormData; no page errors | pages/Campaign.jsx, styles/campaign.css |
| "phone dont make optional" (asked: the lead form's Phone) | On /lp/project the phone is required: the "optional" tag is off, the field is marked required, and the brief does not send without a number of at least 7 digits; the message names the phone. The pack form on the other campaign pages has no phone and is unchanged | Dev server: no phone and "12345" are refused with the message; "+60 12 693 0642" goes through (to "Preview only" on this computer); no page errors | pages/Campaign.jsx |

## 29 Sep 2026: the portal's Marketing group, with QR codes for reference

| Note | What changed | Verified | Files |
|---|---|---|---|
| "add marketing and sub QR code", then "the sub nav for QR code is just that we put QR code for reference" | A Marketing group in the member portal's sidebar, after Exhibition, with one page under it: QR code (/portal/qr), "QR codes, for reference". Each code is a card: the code, what it is for, the link it opens, and PNG (1024px) and SVG downloads. Four to start: Website, Start a project (/lp/project), Contact, LinkedIn (the company page from data/social.jsx). A code is one entry in CODES in components/portal/QrRefs.jsx. Site pages point at the address the portal runs on, or at iaq.netlify.app when it runs on this computer. New dependency: qrcode 1.5.4 | Dev server: sidebar reads Edit website, Design direction, Exhibition, Marketing, Documents, Email signature; QR code opens lit; each of the four codes decodes (jsQR) to its link; no page errors | pages/Portal.jsx, components/portal/QrRefs.jsx, styles/qr-refs.css, package.json |
| "why got line there fix that", then "big ass gap" (portal: the sidebar's foot meeting the closing band) | The sidebar (#0C1220) ran straight into the closing band (#17213A), two darks meeting in a hard seam; a band of light ground between them (tried first) left too big a gap. The sidebar now takes the band's navy (#17213A), so it runs into the band with no seam and no gap, on every portal page | Dev server at 1740x980, /portal/qr and /portal/signature: sidebar foot and band meet at the same line, one colour; no page errors | styles/portal.css |
| "can you tighting so i cant see the white line" (a hairline of light ground at the sidebar's foot) | At most zooms (the site's 1.12 on top of the browser's) the sidebar's foot and the band's top land on a fraction of a pixel, and the light ground bled through between them. The band now tucks 2px under the portal (.pt-shell margin-bottom -2px; only the white column's empty foot sits under it) and the sidebar's navy reaches 2px further (box-shadow), so the join is always covered | Headless Chrome at device scale 0.9, 1 and 1.25: 2.23px overlap, magnified crops of the join show no light line | styles/portal.css |

## 29 Sep 2026: unit pages, "What … is." (client, Website Update)

| Note | What changed | Verified | Files |
|---|---|---|---|
| PCU & TTI: the hero line "should be under below section", "Seems like you missing out the PCU description" | "What PCU & TTI is." now carries both halves, labelled: Process Critical Utilities (PCU), "The specialty gases, chemicals, ultrapure water and exhaust that a production tool consumes. IAQ designs, installs and commissions them as one system, then brings each of them to the tool." (the page's own utilities lede and first `what` line), and Total Tool Installation (TTI), the hero's line moved as given. The hero has no lede now | Dev server: hero lede absent, the two labelled statements under the heading; no page errors | pages/CapTool.jsx |
| EFM: "You should first describe what EFM is first", with the two paragraphs to use, "Only then continue with The problems EFM solved" | The client's two paragraphs open "What EFM is.", ahead of The problems EFM solves; ESCO in bold as given; the dash after "IAQ Group" is a comma (house style). The name "IAQ Energy Facility Management" is the client's own copy | Dev server: both paragraphs, then the problems; no page errors | pages/CapEnergy.jsx |
| Template | UnitPage takes `whatParts` (statements, each with an optional label) in place of the single `what[0]`, and shows the hero lede only when there is one. Pages without whatParts are unchanged (EPC checked) | | components/UnitPage.jsx, styles/unit.css |

## 29 Sep 2026: History timeline rewritten from IAQ's milestone document; QR codes on the company domain

| Note | What changed | Verified | Files |
|---|---|---|---|
| "okay change the copywriting. image placeholder first" (IAQ's milestone document, 1995 to 2026) | The History timeline is IAQ's document, as given: 23 entries (two in 2024), each with title, description and a new "Technical highlights" line. Where the document carries a photograph (2002, 2009, 2013, 2016, 2018, 2022, MCIEA 2024, 2026; 1995 keeps its headquarters photograph) the entry holds a grey placeholder naming the picture; a placeholder becomes a photograph by giving `fig.img` and `alt` in data/history.js. The registry links stay on the four years the registry holds (Ipoh 2009, the backend plant 2019, the Swedish gigafactory 2020, the Kulim wafer fab 2025). MCIEA 2024 is marked Achievement. The previous timeline (with the newsroom's 2024 to 2026 awards and safety records and their photographs) is in git history; the records tiles below the timeline are unchanged | Dev server: 23 entries in order, every one with its highlights except the MCIEA award (none in the document), nine placeholders, four registry links; no page errors | data/history.js, components/HistorySpan.jsx, styles/history-span.css |
| To confirm | The document names a client (Western Digital, 2011) and contract values (RM22m, RM45m, RM215m, RM900m); both were kept off the site before at IAQ's request. They are published here because they are in IAQ's own document | | |
| "https://iaqtechnology.com.my/" (the QR code page) | Site-page QR codes point at https://iaqtechnology.com.my wherever the portal runs (they are printed and kept). /lp/project and /contact on that domain open once the new site is published there | Dev server: all four codes decode (jsQR) to iaqtechnology.com.my addresses and the LinkedIn page | components/portal/QrRefs.jsx |
| History pictures: 1995 back to its photograph; "put the image and rename the image" (First Project in China.png) | 1995 keeps the Shah Alam headquarters photograph it had (no placeholder). 2000 carries the supplied image, a rendered aerial view, kept as public/assets/history/2000-first-project-china.webp (1600px WebP, 283 KB from a 2.79 MB PNG), shown whole at its own proportions and labelled Representation since it is not a photograph. Supplied timeline pictures live in public/assets/history/, named year-subject.webp | Dev server: both pictures load under their entries; no page errors | data/history.js, public/assets/history/ |
| "same as this" (Cleanroom Facility, Selangor.png) | 2006 carries the supplied aerial photograph, kept as public/assets/history/2006-cleanroom-facility-selangor.webp (1600px, 316 KB from 3.15 MB), shown whole. It shows the occupier's signage, a pharmaceutical company, while the entry says a semiconductor client; asked (hold, blur the signs, or use as supplied), the instruction was to use it as supplied | Dev server: the photograph loads under 2006; no page errors | data/history.js, public/assets/history/ |
| The MCIEA 2024 photograph | MCIEA 2024 carries IAQ's own newsroom photograph of the team at the awards night, already on the site (assets/newsroom/mciea-2024-awards-night-team.webp); no new file | Dev server: loads under the entry; no page errors | data/history.js |
| "email signature need to use this font" (Brand OS v4.1: Aptos Display, Aptos, Bahnschrift, "Microsoft 365 · no install") | The signature's HTML names the house faces: Aptos Display for the name and the banner slogan, Aptos for the text, Bahnschrift for the Mobile, Email, Office and Web labels and the entity and registration line; each stack falls back to Segoe UI, then Arial and Helvetica. No font is embedded (mail clients do not load web fonts, and Aptos is not licensed for it): readers see the faces where Windows or Microsoft 365 carries them, Outlook included | Chrome on this computer: labels render in Bahnschrift (a Windows font); name, text and slogan fall back to Segoe UI, because Aptos here is an Office cloud font the browser cannot use. Outlook with Microsoft 365 shows Aptos | components/portal/SignatureGen.jsx, styles/signature.css |
| "give notice these two placeholder" (the QR code page's Start a project and Contact) | Both carry `soon` in CODES: a red Placeholder tag on a faded code and a notice, "Not live yet. This page opens once the new website is published on iaqtechnology.com.my. Do not print or share this code until then." Website and LinkedIn are live and unmarked. Drop `soon` from an entry once its page is live on the domain | Dev server: two cards flagged, two plain; no page errors | components/portal/QrRefs.jsx, styles/qr-refs.css |
| 2002 picture ("use this image": ChatGPT Image Sep 29, 2026, 01_59_51 PM.png) | 2002 carries it as public/assets/history/2002-lcd-facility-nanjing.webp (176 KB from 2.17 MB), shown whole and labelled Representation, since it was generated | Dev server: loads under 2002; no page errors | data/history.js, public/assets/history/ |
| 2016 picture (ChatGPT Image Sep 29, 2026, 02_03_30 PM.png) | 2016 carries it as public/assets/history/2016-pagoh-district-cooling.webp (245 KB from 2.53 MB), labelled Representation, since it was generated | Dev server: loads under 2016; no page errors | data/history.js, public/assets/history/ |
| 2009 picture (ChatGPT Image Sep 29, 2026, 02_15_34 PM.png, which replaced 02_10_21) | 2009 carries it as public/assets/history/2009-wafer-fab-ipoh.webp (150 KB from 2.06 MB), labelled Representation, since it was generated; it shows a client's name on the facade, used as supplied (as with 2006). The registry link stays under it | Dev server: loads under 2009; no page errors | data/history.js, public/assets/history/ |
| 2008 picture (ChatGPT Image Sep 29, 2026, 02_10_21 PM.png, first tried on 2009) | 2008 carries it as public/assets/history/2008-cleanroom-france.webp, labelled Representation, since it was generated; it shows a client's name on the facade, used as supplied | Dev server: loads under 2008; no page errors | data/history.js, public/assets/history/ |
| 2017 picture (Entrance_B_of_Tun_Razak_Exchange_MRT_station.jpg) | 2017 carries it as public/assets/history/2017-mrt-tun-razak-exchange.webp (a real photograph, so no representation label): "Tun Razak Exchange station, entrance B, on the Kajang line." TO CONFIRM before launch: the file name is Wikimedia Commons' style; if it came from there its licence asks for the photographer's credit in the caption | Dev server: loads under 2017; no page errors | data/history.js, public/assets/history/ |
| "filled in the images. use suitable image" | Every timeline entry now has a picture, from the site's own library, no placeholders left. Where the registry holds the project it is that project's picture (2019 backend plant, 2020 gigafactory, 2025 Kulim wafer fab, 2023 data centre, a rendering so labelled). Elsewhere it is IAQ's own photograph of like work, captioned "…built by IAQ, shown for illustration" so it claims no project (2007, 2011, 2014, 2018, 2021, 2022, 2024 Penang), and for district cooling a representation (2013) and IAQ's illustration (2015); 2026 is an IAQ BIM model. Supplied pictures replace these one by one as they arrive (data/history.js `fig`) | Headless Chrome: all 23 entries show a loaded picture; no page errors | data/history.js |

## 29 Sep 2026: Email signature is a group, with a Designs catalogue

| Note | What changed | Verified | Files |
|---|---|---|---|
| "make sub design under email signature, for catalogue email design, but this portal changeable email signature stay" | Email signature in the portal sidebar is a group: Generator (/portal/signature, the editable page, unchanged) and Designs (/portal/signature-designs), a catalogue of four designs, each rendered from the details saved in the Generator and copied with one button: House (the Generator's own layout, with Edit in Generator), Compact (logo beside the name, one contact line, red rule; replies and forwards), Text only (no images; mobile and image-blocking inboxes), Event (header, contacts and a navy SEMICON Europa 2026 band, 10 to 13 November, Messe München; the stand number is still to confirm so it is not shown). Same build rules as the Generator (tables, inline styles, house faces, hosted images, bgcolor cells). The Generator only gained exports (buildHouse, loadSig and helpers) | Dev server: sidebar Email signature opens to Generator and Designs; Generator works as before; the four designs show the saved name, all their images load; no page errors | pages/Portal.jsx, components/portal/SigCatalogue.jsx, components/portal/SignatureGen.jsx (exports), styles/signature.css |
| "use this info" (Nabilah Mohd Radzi's signature details) | The Designs catalogue shows every design with a sample signature by default: Nabilah Mohd Radzi, Business Development Manager, mobile +6012-693 0642, office +603-5124 8319, nabilah.mohdradzi@iaqtechnology.com.my, www.iaqtechnology.com.my (the member's company, registration and image address stay). A switch, Sample or My details, shows the member's own saved details instead | Dev server: all four designs show the sample; My details shows the saved name; no page errors | components/portal/SigCatalogue.jsx, styles/signature.css |
| "i want this design banner" (red fading into a cleanroom, the slogan in white with a short rule), then "generate the image" | The signature's banner is one image, public/assets/email/sig-banner.jpg (1280 x 168 for a 640 x 84 slot, 61 KB): a generated photograph of a pharmaceutical cleanroom with stainless process piping (Higgsfield, GPT Image 2.5, job 6f161124), with the red fade, the slogan "Engineered environments. Trusted outcomes." and the white rule composed over it, so the text is exact. It replaces the red block beside sig-cleanroom.jpg in the Generator and the House design; the slogan is the image's alt text. The Banner switch still turns it off | Dev server: the signature renders with the banner, all six images load, 640px; no page errors | components/portal/SignatureGen.jsx, components/portal/SigCatalogue.jsx, public/assets/email/sig-banner.jpg |
| "in one line" (the signature's address) | The address is 11px (was 12.5px), which keeps the headquarters address on one line at 640px in Aptos, Segoe UI and Arial alike (measured 573 to 596px); a longer typed address still wraps rather than widening the signature | Dev server: the address renders on one line; no page errors | components/portal/SignatureGen.jsx |
| "use this icon on the email signature" (the Design direction line icons), "banner at the bottom then after that" the entity line, "IAQ Technology International Sdn Bhd" | Contacts lead with the site's line icons in red instead of the words: mobile (a matching handset outline, the set has none), email, phone for the office, globe for the web, pin before the address; drawn from components/FlowIcon.jsx as 16px PNGs (assets/email/sig-ic-*.png; Outlook and Gmail do not show SVG), with the old labels as alt text. Order now: header, contacts, address, the four marks, the banner, then the entity and registration with the confidentiality line. The default entity is IAQ Technology International Sdn. Bhd., 200001031412 (534019-T) (first in the Company list; the catalogue sample uses it); the storage key moved to v3 so saved signatures pick up the new default and keep their own details | Dev server: the signature renders in that order, all eleven images load; the Generator and the catalogue sample read IAQ Technology International Sdn. Bhd.; no page errors | components/portal/SignatureGen.jsx, components/portal/SigCatalogue.jsx, public/assets/email/sig-ic-*.png |
| "remove the line" (the short white rule under the banner's slogan) | sig-banner.jpg rebuilt without the rule, the two lines of the slogan centred in the band | The rebuilt banner checked by eye | public/assets/email/sig-banner.jpg |
| "the address need to standarised", then "use the same font size but make it equally two lines" | The address is 13px like the contact lines (was 11px on one line) and always two lines of about equal length, broken at the comma nearest the middle (addrLines): "No. 12, Jalan Sungai Jeluh 32/192, Kawasan Perindustrian Kemuning," / "Seksyen 32, 40460 Shah Alam, Selangor, Malaysia". A line break typed in the Address box is kept as the break | Dev server: two lines under the pin; no page errors | components/portal/SignatureGen.jsx |
| "icon should be same size", then "make same spacing" | The five contact icons are re-drawn fitted to one optical box (each drawing's bounds scaled so its longer side is 18 of 24 units, centred, the same 1.5 line weight; the mobile outline widened to 12 units so it does not read lighter). The contact rows and both address lines share one 26px rhythm, with no extra gap before the address; each icon centres on its line | Magnified crops: icons read the same size, rows evenly spaced; no page errors | components/portal/SignatureGen.jsx, public/assets/email/sig-ic-*.png |
| "make the adress font black" | The address is ink (#0C1220), the same as the contact lines, instead of the soft grey | Dev server: renders in ink | components/portal/SignatureGen.jsx |
| "maybe the logo can move there" (the four marks, to beside the entity line under the banner) | The signature ends: contacts and address, the banner, then one row with the entity and registration on the left and the four marks on the right (34px high, the footer's order); the confidentiality line, when on, runs under that row | Dev server: renders in that order, all images load; no page errors | components/portal/SignatureGen.jsx |
| "use this font" (the banner slogan in the house display face) | sig-banner.jpg redrawn with the slogan in Aptos Display Bold (was Segoe UI Black), from Microsoft's own Aptos download, used only to draw the image (the font file is not in the project or on the site) | The rebuilt banner checked by eye | public/assets/email/sig-banner.jpg |
| "this spacing too space, tight a bit" (the two address lines) | The address lines are 19px apart (was 26px, the contact rows' rhythm), with 4px above so the first line still sits in step with the rows and beside the pin | Magnified crop: the two lines read as one block; no page errors | components/portal/SignatureGen.jsx |
| Boss, relayed: "i mentioned engineers in the visuals" (the signature banner) | sig-banner.jpg rebuilt over a new generated photograph (Higgsfield GPT Image 2.5, job f18087aa): two engineers in full cleanroom gowns checking a valve and a tablet beside stainless process piping, on the right; the red fade and the slogan in Aptos Display Bold unchanged. A layout structure is to follow from the boss | The banner checked by eye; the signature renders | public/assets/email/sig-banner.jpg, components/portal/SignatureGen.jsx (comment) |
| Boss, relayed: "no red graident should exist" | sig-banner.jpg: the red is one solid panel (to 720 of 1280) with a hard edge, the engineers' photograph after it with no fade; the slogan unchanged | The banner checked by eye | public/assets/email/sig-banner.jpg |
| "make catalogue with other design. add 2 design more" | Two more designs in the catalogue, six in all: Centred (logo, name, a short red rule, contacts with their icons and the banner on one centre line, 480px, for phones) and Navy (the name on a navy band beside the logo, the contacts with icons in two columns, the banner, the registration line; for proposals and first contact). Both use the current banner and the house icons; same email-safe build | Dev server: six designs render with the sample and with My details, every image loads (Centred 6/6, Navy 6/6); no page errors | components/portal/SigCatalogue.jsx |
| "nope remove the 2 added" | The Centred and Navy designs are off the catalogue again (four designs: House, Compact, Text only, Event) | Dev server: four designs render; no page errors | components/portal/SigCatalogue.jsx |
| "add profile picture. so can check or uncheck on the profile pic if needed" | Generator: a Profile picture section with a tick box (off by default), a Photo link field and an upload for preview. The photo is square (76px, no round corners) beside the name. Inboxes load it from the Photo link; an uploaded file shows in the preview only and is not saved, since Gmail and Outlook block images carried inside the message; a notice says so when there is no link. The tick and the link are saved with the member's details, so the House design in the catalogue shows it too | Dev server: off by default; on shows the notice; upload shows the photo; a link sets the image address; untick removes it; no page errors | components/portal/SignatureGen.jsx, styles/signature.css |
| Client: "Registered, certified and recognised" (footer) "should be under this about us page", below "Six values, held on every site.", with their old site's "What We've Achieved" band as reference | About overview: a new Awards & recognition section under the values: "What we've achieved", the four marks (Intertek ISO, UKAS, CIDB, Highwire Gold 2024) in their issued colours on white at one height, the reference's line of copy, and the Policies and certificates link. The row is gone from the footer (markup, list and base.css rules); the white -rev copies stay in public/assets/certs. The eyebrow is in the markup and hidden by the 9 Sep eyebrow rule | Dev server, 1440 and 390: section renders, no footer row, no horizontal overflow, no page errors | pages/About.jsx, styles/about.css, components/Footer.jsx, styles/base.css |
| "fix that" (home 3D: the Speed row cut off under Replay build) | The facilities panel is refitted whenever it or the stage changes size, measured against the stage (scenes/build3d.js, fit/watchFit). The app's own fit ran only after load and on resize, against the window: below the fold it squeezed the list to its smallest, and the panel's growth at the end of the build (the count, the X-ray switch) was never refitted | NOT YET CHECKED in a browser: committed on request before the check ran | scenes/build3d.js |
