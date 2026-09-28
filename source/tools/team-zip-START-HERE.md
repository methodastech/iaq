# IAQ Group website: the complete project

Brand Method, 26 September 2026. Everything the team needs to run, change and publish the IAQ website.

## What is in this zip

| Folder | What it is | What to do with it |
|---|---|---|
| `site-netlify/` | The public website, built and checked. Static files only. | Upload the contents to Netlify (drag the folder into Netlify Drop, or upload on the Deploys page). Nothing else is needed to go live. |
| `source/` | The full working project: React and Vite source, every page, component, style, 3D scene, image, video and 3D model, the build tools, the review portal and Codex, and the working notes. | Keep this for every future change. Build from it to produce a new `site-netlify/`. |

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

## Checks to run after every public build

Run these inside `source/dist-launch/`. Every one must print 0.

```bash
grep -rl 'iaqsolution321' . | wc -l
ls assets | grep -ci 'codex\|portal'
find . -name 'SOURCES.md' | wc -l
grep -rl 'IAQ Utility Solutions' . | wc -l
grep -rli 'hasegawa' . | wc -l
```

| Check | Why |
|---|---|
| The review passcode | It opens the internal portal and Codex. Review use only. |
| Codex and portal files | The internal portal must not ship. |
| SOURCES.md | The notes beside the photographs name staff and sources. |
| Subsidiary entity names | IAQ asked that subsidiary names stay off public pages. |
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

- **The home banner reel** is eight clips in a fixed order (`SRC` in `src/scenes/home.js`). Change it only on Bazil's word.
- **Generated footage** always carries the "Representation" tag. The hook-up team clip is generated installation work; IAQ asked on 24 Sep that generated footage not show installation work, and the clip stays on Bazil's decision pending IAQ's confirmation.
- **Client and subsidiary names** stay off public pages and files.
- **House style:** no dashes as pauses, no exclamation marks, no round corners, no left-edge stripes, no boxes around icons. Service red `#EC2027`, unit blues `#5CBCF5` `#0B8FD8` `#1C4F9C`, work amber `#F2B705`, system green `#0FA968`, market violet `#6E56E6`.

## Open items

1. IAQ to confirm the generated hook-up footage.
2. IAQ to confirm the EPC scope: their questionnaire lists maintenance and tools hookup as EPC stages 5 and 6; the site shows four stages.
