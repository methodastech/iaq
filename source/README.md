# IAQ Group website (React)

Website concept for IAQ Technology by Brand Method, restructured to the production format: React, feature-grouped folders, WebP assets.

## Run

```bash
npm install
npm run dev      # Vite dev server
npm run build    # production build to dist/
npm run preview  # serve the production build
```

## Structure

| Path | What lives there |
|---|---|
| `src/pages/` | One component per route: Home, About, Projects, ProjectDetail, Careers, Contact |
| `src/components/` | Shared shell: Nav (topbar, nav, burger drawer), Footer (incl. BrandMethod ribbon), UniversalSearch (Cmd+K / "/" overlay), Shell (Lenis smooth scroll, cross-route hash deep links, embedded back button) |
| `src/scenes/` | Each page's animation/3D code as `init<Page>()` returning a cleanup function, invoked from the page's `useEffect` |
| `src/styles/` | `base.css` (tokens, shell, search overlay, shared mobile pass) plus one css file per page |
| `src/data/` | `search.js` (58-entry universal search index), `projects.js` (the 18-project registry driving cards, detail pages, related work) |
| `public/assets/` | All media. Images are WebP (quality 82). Videos are H.264 mp4, compressed |
| `public/audit.html`, `framework.html`, `portal.html` | Standalone Brand Method concept shell pages |
| `_source/` | The static HTML pages the React app was converted from (working reference) |
| `legacy-static/` | Untouched snapshot of the original static site with original media |

## Routes

29 page types in six groups, all declared in `src/data/sitemap.js`:

| Group | Routes |
|---|---|
| Foundation | `/`, `/about`, `/about/history`, `/about/leadership`, `/about/esg`, `/contact` |
| What we do | `/services`, `/services/{design,procurement,construction,commissioning,maintenance}` |
| Who we serve | `/markets`, `/markets/{semiconductor,data-centre,ev-battery,photovoltaics,district-cooling,bio-lifescience,food-beverage}` |
| Proof | `/projects`, `/projects/:id` (0..17), `/global-presence` |
| Momentum | `/news`, `/news/:slug`, `/careers` |
| Gated | `/investors` (sealed), `/policies`, `/exhibition` |
| Internal | `/flow` (the framework diagram, not in public nav) |

Hash deep links work across routes (`/#services`, `/projects#semiconductor`, `/careers#q=Engineer%2C%20Process`).

## The framework is the source of truth

`src/data/sitemap.js` declares every page once: group, route, purpose, block order, its single call to action, and the pages it links to. These all read from it, so structure cannot drift:

- the nav dropdowns for Services and Markets
- the footer columns
- the universal search index
- `/flow`, the interactive site-flow diagram
- `FRAMEWORK.md`, regenerated with `node scripts_gen_framework.mjs`
- the orphan check (every page must have an inbound link)

Two audit scripts guard it: `scripts_gen_framework.mjs` (regenerates the doc, reports orphans) and `scripts_block_audit.mjs` (checks every page renders the blocks the framework declares).

## Known gaps awaiting IAQ

Pages ship labeled placeholder slots rather than invented content. Outstanding: board names and portraits, the business model questionnaire (sections B, C, D), the 20 news article bodies, policy documents and certificate files, the 60-project list, and a ruling on the conflicting company statistics (projects 200+/230/250+, cleanroom 1.05M vs 1.5M m², offices 6/7/8).

**The Investor Relations gate is presentational only.** It is a client-side passcode shipped in the bundle and protects nothing. Replace with server-side auth before launch.

## Conventions

- Libraries are npm dependencies (three 0.184, gsap 3.12.5, lenis 1.3.4), no CDN scripts.
- Every scene module cleans up after itself: listeners, observers, timers, rAF loops, ScrollTriggers, WebGL renderers.
- CSS: design tokens on `:root` in `base.css`; IAQ red is `#EC2027`. Page css owns everything page-specific.
- Copy rules: no dashes as separators, no exclamation marks.

## Suggested next steps for production

- Move to Next.js (app router) if SEO/SSR is required: pages map 1:1, scenes become client components.
- Swap the AI-generated hero clips for real site footage or composite the real IAQ logo in post (current clips carry a generic wordmark).
- Wire the contact form and careers apply flow to a real backend.
