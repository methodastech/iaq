# IAQ Group website: publish bundle

Built 15 September 2026.

## What is in this zip

| Folder | What it is | What to do with it |
|---|---|---|
| `site/` | The production build (static files: `index.html`, `assets/`, images, videos, `robots.txt`, `sitemap.xml`, `_redirects`, `.htaccess`). This is what goes live. | Upload the CONTENTS of `site/` to the web root of the host. |
| `source/` | The Vite + React source the build was made from (`src/`, `public/`, `tools/`, `index.html`, `package.json`, `vite.config.js`) plus `HANDOVER.md`, the running build log. | Keep for future changes. Not needed to publish. |

## Before go-live: three things only IAQ can supply

| Item | Why it matters | How to apply it |
|---|---|---|
| Approval of the Privacy Policy and Terms of Use text | Both are drafts written by Brand Method for IAQ legal counsel. The public site shows them as the policies. | Edit the `draft` paragraphs in `source/src/pages/Policies.jsx`, rebuild. |
| An enquiry endpoint | Without one, the Contact and campaign forms open the visitor's email app with the enquiry written out to bd@iaqtechnology.com.my. With one, they post JSON to it. | Build with `VITE_ENQUIRY_ENDPOINT=https://...` |
| A Google Analytics id (optional) | No analytics load until it is set. | Build with `VITE_GA_ID=G-...` |

## Publishing `site/`

1. Copy everything inside `site/` to the web root (the folder that serves `https://<domain>/`).
2. The site is a single-page app on real paths (`/services/epc-construction`, `/careers/culture`, ...). Every path must serve `index.html`:
   - Nginx: `location / { try_files $uri $uri/ /index.html; }`
   - Apache: the included `.htaccess`
   - Netlify or Cloudflare Pages: the included `_redirects`
   - Vercel: a rewrite of `/(.*)` to `/index.html`
3. Serve over HTTPS. The canonical origin in the pages and the sitemap is `https://iaqtechnology.com`. If the live domain differs, change `SITE` in `source/src/lib/meta.js` and `source/src/components/PageHead.jsx`, and rebuild with `SITE_URL=https://<domain>` for the sitemap.
4. Cache: long cache for `assets/*` (the filenames are hashed), short or no cache for `index.html`.

## Rebuilding from `source/`

```bash
cd source
npm install
npm run build:launch
```

That writes `dist-launch/` and prunes the internal review pages. Upload `dist-launch/` the same way as `site/`. `npm run dev` starts the local dev server on port 5177. Node 18 or newer.

## How the public build differs from the review build

- The review build labels everything IAQ still owes ("supplied by IAQ" slots, positions still to be named). The launch build hides all of it, and leaves out the pages that are only placeholders: Investor Relations, the Digital Exhibition and Board & Leadership. They return when IAQ supplies their content. The staff login and portal are also left out: they are a front-end prototype with no backend.
- To see any page exactly as it will publish while running the dev server, add `?launchview` to its address.
- Generated photographs on the business unit pages and some office cards are labelled "Representation".
