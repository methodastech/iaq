# Culture page benchmark · IAQ Group · 14 Sep 2026

Four culture and careers pages studied for `/careers/culture`. Summaries are ours; no copy or images taken.
Fetched 14 Sep 2026. Arup blocked the fetcher (403) and was read from raw HTML. Visual notes marked (inf) are inferred from markup, not screenshots.

| | frog | Instrument | Arup | Life at Spotify |
|---|---|---|---|---|
| Type | Global design firm | Design and digital studio | Engineering, built environment | Tech culture microsite |
| URLs | frog.co/careers · /culture · /studio/london | instrument.com/careers | arup.com/en-us/careers · /life-at-arup · /why-arup · /recruitment-process | lifeatspotify.com · /the-way-we-play/culture · /benefits-and-perks · /find-your-team/locations · /start-your-journey |
| Structure, top to bottom | Promise headline over team photo, roles CTA · five pillars with photos (culture, growth, community, internship, alumni) · benefits philosophy · studio links · jobs by department · CTA band. Culture page: identity hero, studio carousel, heritage timeline, manifesto mural | Headline + skip to jobs · three reasons, backed by numbers · looping team video · affinity groups · how they hire, pay and grow · benefits accordions (health, time off, money) · four step application · job board | Hero · link tiles (jobs, why, early careers, process, life) · carousel of named engineers with quote and video · founder story. Life page: founder quote with audio, project range, member story videos incl. intern day, 12 photo mosaic, join CTA | Featured role · job categories · benefits teaser · deeper cards · three values under one metaphor · join CTA · quick links · FAQ. Separate pages for culture, benefits, locations with live local time, hiring journey |
| People | Studio photography, no named profiles | Stats and video, not portraits | Named engineers: role, first person quote, video | Communities and group photos |
| Values in practice | Heritage timeline and manifesto | Operating commitments stated as process (structured interviews, pay bands) | Founder words plus ownership model | Values tied to one brand metaphor |
| Day in the life | Hinted via studio events | Implied by video | Explicit intern day video | Not on fetched pages |
| Growth and learning | Career lifecycle: intern, growth, alumni | Mentorship, development stipend | Career path stories, skills networks | Learning programme, students track |
| Benefits | Philosophy, varies by region | Itemised with real numbers | Told through one member quote | Named bundles |
| Locations | Strongest: a page per studio with its own character | Remote first | Stories set in named cities | City slider with live local clocks |
| Voices | Pushed off page (podcast, video) | Video only | Strongest: named, quoted, filmed | Communities, few individuals |
| Hiring process | Not explained | Four plain steps + accommodations | Numbered steps with durations, senior track | Best journey page: steps, tips, timelines, FAQ |
| CTAs | Hero, footer band, each studio | Jobs link top, board bottom | Job search ends every page | Reusable quick links block |
| Visual techniques | Large heroes, looping studio carousel (inf), stepper swapping images (inf), full width mural | Marquee, card carousel, accordion synced to media, looping background video (inf) | Swiper carousels with video, quote with audio, mosaic, step blocks, anchor nav | Draggable carousels, sticky floating image cards, live clocks (inf) |
| Why best in class | Makes a large network feel like local studios | Every claim backed by a number or a process | Heritage, ownership and real engineers on site reinforce each other | Culture run like a product: every candidate question has an obvious home |

Runners up checked: Buro Happold (stat card, six staff stories, tabs by career stage; no quotes or benefits), Stripe (best values in practice writing and an "is this for you" self check; no benefits, locations or steps). IDEO, Pentagram, Atelier Ten carried almost no culture content; Foster + Partners, Heatherwick, Snøhetta and BIG careers URLs returned 404 or 403.

## What `/careers/culture` takes, adapted to an engineering group

| Pattern | Source | IAQ version | Fact status |
|---|---|---|---|
| Promise headline over real people photography | frog | Hero over IAQ's own team photographs, stats from site canon | Real (1995, 450, 7, roles derived from `roles.js`) |
| Moving photo strip | Instrument, frog | Marquee of real IAQ photographs, captions honest, one tile for the October shoot | Real + slot |
| Values backed by proof | Instrument, Stripe | Six client values, each paired with a record from history, ESG, policies | Real (`values.js`, `History.jsx`, `Esg.jsx`) |
| Safety as culture | Arup (engineering credibility) | Count up of 2.6 million safe manhours, OSH awards, pledge story | Real (`news.js`, `History.jsx`, `Esg.jsx`) |
| Life on site, in the office, together | Arup life page | Three tab panel + 2025 events rail linking to published news | Real (`news.js`) |
| Founder voice anchor | Arup | Founder named from history, quote slot | Name real, quote slot |
| Career lifecycle | frog | Universities outreach + levels hired today | Real (`news.js`, `roles.js`), training slot |
| Locations with live clocks | Spotify, frog | Seven countries with live local time where the office hours give a zone | Real (`Contact.jsx`, `GlobalPresence.jsx`) |
| Named voices | Arup | Three quote cards | Slot, supplied by IAQ |
| Benefits itemised | Instrument | Designed tiles | Slot, supplied by IAQ |
| Self check | Stripe | "Is this for you" from published facts about the work | Derived from site copy |
| Numbered hiring steps | Arup, Spotify | Four steps already published on Careers | Real (`Careers.jsx`), durations slot |
| CTA ends the page | Arup, Spotify | Open roles band with departments derived + closing band to HR | Real (`roles.js`) |
