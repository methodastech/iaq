# IAQ Group website: the complete project

Brand Method, 27 October 2026, updated 28 October 2026. Everything the team needs to run, change and publish the IAQ website.

## What is in this zip

| Folder | What it is | What to do with it |
|---|---|---|
| `site-netlify/` | The public website, built and checked. Static files only. | Upload the contents to Netlify (drag the folder into Netlify Drop, or upload on the Deploys page). Nothing else is needed to go live. |
| `source/` | The full working project: React and Vite source, every page, component, style, 3D scene, image, video and 3D model, the build tools, the review portal and Codex, and the working notes. | Keep this for every future change. Build from it to produce a new `site-netlify/`. |

## Where things stand (27 October 2026)

- Every review note to date is worked: IAQ's 24 Sep and 26 Oct reviews, IAQ's October copy sheet, and Brand Method's own polish and UI/UX sweeps.
- Two record pages, on the dev server: **Amendments** (`/checklist.html`), every note and its status; **Polishing** (`/polish.html`), each change with a before and after picture and one line on why.
- What is still open waits on IAQ (content, confirmations, the GA4 id) or on hosting (the live form endpoint). Each one is listed, with its owner, in the Amendments page.
- The exhibition: `source/_exports/IAQ-Exhibition-2026-10-27.zip` (the exhibition portal, one file that opens offline) and `source/_exports/IAQ-Europe-presentation-1-2026-10-27.zip` (the booth screen deck, its own small site).

## Changed on 28 October 2026

`site-netlify/` is rebuilt from this source with these changes, and the launch checks below all print 0.

- **Projects:** the banner photograph is the campus at dusk (a generated picture, no project caption). The cards no longer show the cleanroom class line above the project name, on `/projects` or under related projects.
- **All six services** (`/services/all`): each stage is one block, its text beside its picture, alternating sides; no stage numbers above the headings; Tool Installation has its own text; a new Maintenance picture.
- **Markets hub:** the clear nav bar no longer shows white links on a light background at the top of `/markets`.
- **Home:** the tool hook-up clip is off the banner reel (eight clips).
- **EPC page:** the opening line reads "Integrated project delivery from concept development through commissioning."
- **Enquiry** (`/enquiry`): the page uses the site's own width and side gutter; the light footer strip under the form is gone.
- **About menu:** a fourth row, Frequently Asked Questions, links to `/faq`.

## Run it on your machine

You need Node 20 or newer.

```bash
cd source
npm install
npm run dev
```

The site opens at http://localhost:5177. Add `?launchview` to any address to see the page exactly as the public build shows it (the review markers and the admin bar hidden).

## Publish a new version

```bash
cd source
npm run build:launch
```

This writes the public build to `source/dist-launch/`. Upload that folder's contents to Netlify. The build removes the review-only parts by itself (`tools/prune-launch.mjs`).

Only ever publish `dist-launch`. Never publish `dist/` or the `source/` folder: they contain the review portal and internal notes.

**Netlify (iaq.netlify.app) runs the review build** (28 Sep 2026): `netlify.toml` builds `npm run build:review` into `source/dist-review/`. That is the website with the Super Admin bar and its review pages (Web Audit, Competitors, Web Plan, Design, Web 1, CMS, Codex), without the Amendments checklist, the client walkthrough video or the staff notes (`tools/prune-review.mjs`), and marked not to be indexed. It is a review site, not the public launch: for the launch, change `netlify.toml` to `npm run build:launch` and `dist-launch`.

## Checks to run after every public build

Run these inside `source/dist-launch/`. Every one must print 0. (Subsidiary names: IAQ asked on 30 Sep for the second Singapore office to show "IAQ Utility Solutions (SG) Pte Ltd", so that name is expected on the Contact page.)

```bash
grep -rl 'iaqsolution321' . | wc -l
ls assets | grep -ci 'codex\|portal'
find . -name 'SOURCES.md' | wc -l
grep -rli 'hasegawa' . | wc -l
```

| Check | Why |
|---|---|
| The review passcode | It opens the internal portal and Codex. Review use only. |
| Codex and portal files | The internal portal must not ship. |
| SOURCES.md | The notes beside the photographs name staff and sources. |
| The Hasegawa name | A client's name; its walkthrough video carries the client's signage and never ships. |

## Where to find things in `source/`

| Path | What lives there |
|---|---|
| `src/pages/` | One component per page (Home, Services, the three business unit pages, Markets, Projects, About, Careers, Contact, the portal and more) |
| `src/components/` | Shared parts: navigation, footer, the unit page template (`UnitPage.jsx`), the Services map, the district cooling 3D, the email signature generator (`portal/SignatureGen.jsx`) |
| `src/scenes/` | The animation and 3D code for each page. `home.js` holds the loading globe, the hero reel and the world section |
| `src/styles/` | One stylesheet per page, plus `base.css` for the shared rules |
| `src/data/` | The content the pages read: units, services, projects, news, roles, the FAQ, the sitemap |
| `public/assets/` | All images and videos. `public/build3d/` is the 3D building app (the home "Scroll to build" section) and its models, run in the home page itself (`src/components/Build3D.jsx`, `src/scenes/build3d.js`), not in an iframe |
| `tools/` | Build and check tools: `prune-launch.mjs` (strips the public build), `audit-crawl.mjs` (loads every page at desktop and phone width and reports errors), the Client files page generator |
| `HANDOVER.md` | The running log of every change, why it was made and where it lives. Read the latest sections first. |
| `public/checklist.html` | Every client and review note with its status (on the dev server at `/checklist.html`) |
| `README.md`, `DEPLOY.md` | Earlier setup and hosting notes (routes, redirects, the enquiry endpoint and analytics settings) |
| `_reference/`, `_mockups/`, `_exports/`, `_source/`, `legacy-static/` | Reference material: client files, earlier mockups, Codex exports, the static HTML the React app was converted from, the original site |
| `_handoff/` | Briefs and reference renders for the 3D work |

## Bring in a new 3D delivery

The developer delivers the Scroll to build 3D as a finished folder ("3D ONLY": `index.html`, `assets/`, `models/` and so on). It runs inside the home page, so each delivery is converted once:

```bash
cd source
node tools/embed-3d.mjs "path/to/3D ONLY"
npm run build:launch
```

The tool copies the delivery into `public/build3d/`, fits its script and styles to the section, and stops with a message if the delivery has changed in a way it no longer recognises. Check the home page on the built site afterwards: scroll the whole build, press Start build, enter and leave the walkthrough. This route lasts until the developer's source code arrives; the 3D is then built from source inside `src/`.
## The review portal

On the dev server, `/portal` opens the internal portal: the Codex, the Design direction, the booth plan, downloads and the email signature generator. It asks for the review passcode (ask Bazil). The portal is never part of the public build.

## Decisions to respect

- **The home banner reel** is eight clips in a fixed order (`SRC` in `src/scenes/home.js`): cleanroom bay, cleanroom corridor, the wafer fab under construction (IAQ's own drone footage), working at height, the production campus, data centre, district cooling, Kuala Lumpur. No stadium. Change it only on Bazil's word.
- **Generated footage** always carries the "Representation" tag. IAQ asked on 24 Sep that generated footage not show installation work; the hook-up team clip (generated installation work) came off the home reel on 28 Oct. It is still in the booth deck reel (`src/components/portal/DeckSlides.jsx`).
- **Client and subsidiary names** stay off public pages and files.
- **House style:** no dashes as pauses, no exclamation marks, no round corners, no left-edge stripes, no boxes around icons. Service red `#EC2027`, unit blues `#5CBCF5` `#0B8FD8` `#1C4F9C`, work amber `#F2B705`, system green `#0FA968`, market violet `#6E56E6`.

## Open items

All open items are in the Amendments page (`/checklist.html`) with their owner. In short:

1. IAQ: the Penang office (the signboard and the contact card name different companies and postcodes), office addresses and direct lines, the Ireland details.
2. IAQ: role descriptions, project case-study details, ESG savings figures, investor documents, and approval of the privacy and terms text.
3. Hosting: the live endpoint for the contact and careers forms (`VITE_ENQUIRY_ENDPOINT`), and the GA4 id (`VITE_GA_ID`).
4. Launch: the public build must crawl with no "supplied by IAQ" slots; the remaining ones are on Investors, Policies and ESG.
