# IAQ workspace: action plan

Written 5 August 2026. Covers the three builds still open across the Web Plan, the Web Audit and the Competitors pages.
Everything listed as DONE below has been verified in the browser, not assumed.

---

## Where things stand

### Web Plan · `public/plan.html`

Seven sections, renumbered and verified:

`01 Strategy · 02 The edge · 03 The site, page by page · 04 Audience flow · 05 User experience · 06 UI & art direction · 07 Growth & support`

| Done | Detail |
|---|---|
| Parts 03 and 04 merged | The map is the interface, the 33 pages are written out underneath it, the 29 page index sits between them |
| Panel prev/next | Buttons plus arrow keys, `01 / 29` counter, Escape closes |
| Panel carries full page detail | Wireframe mock, numbered sections, why it exists, onward links, the ask |
| Print fallback | Panel hidden, index expands to three columns, linear pages print |
| Audience-flow overlay removed from the map | Cluttered the tree, not needed there |
| Subtitle and icon map rebuilt | Had a duplicate `06` key and no `02`, so User experience was showing Post launch's subtitle |
| Every section opens with what / why / what we want | Three-column block after each lede |
| 02 The edge | Gap in four numbers, five-rung ladder, five moves with icons, compounding chain, 10-row good/bad ledger, five-step action plan with icons, conditions block |
| 06 UI & art direction | Layout grid, spacing scale drawn, 9 components, 8 section frameworks, palette ratio bar, type at real size, 3 page mocks, 4 image frames |

---

## Build 1 · Rebuild section 05, User experience

**Why.** It is the thinnest section at 777 words, and it currently restates the linking diagram instead of arguing from evidence. Bazil asked for it to be scrapped and rebuilt from the audit and competitor findings.

**Source material, already written and verified**

| Source | What to pull from it |
|---|---|
| `public/audit.html` | Nine lens scores. Findability 3/10, performance 2/10, trust 5/10, talent 4/10, IR 1/10. The registry-vs-tabs finding. Careers as a flat list of 16 roles |
| `public/competitors.html` | 22 firms checked, 13 assessed, 1 with a real registry, 0 publishing cleanroom class. Exyte's References page carries no individual entries. Turner's five filter groups. DPR's NDA convention |
| `public/plan.html` part 02 | The five-rung ladder, which section 05 should reference rather than repeat |

**What the section must contain, in order**

1. **The UX failures the audit actually found**, as a table: what a visitor cannot do today, the lens score behind it, and the consequence. Six rows, each traceable to the audit.
2. **The eight tasks** a visitor must complete unaided, with a step budget. This already exists and should be kept.
3. **A task-flow diagram per audience**, four small vertical flows showing the shortest path from entry to the ask. Icons per step.
4. **The five linking rules**, kept as the existing diagram, referenced not repeated.
5. **Acceptance criteria**, six rows, each a pass or block at QA. Already exists, keep.
6. **What competitors get wrong here**, three short cards: tabs instead of filters, no permalinks, no shareable state.

**Rules.** No dashes as separators. No exclamation marks. Every claim traceable to the audit or the competitor set. Anchor new blocks against an existing child element, never against `</section>`.

---

## Build 2 · Visual rebuild of `public/audit.html`

**Why.** Strong content, almost no diagrams. Bazil wants infographics, icons and structure so it reads fast and stays detailed.

**What to add**

| # | Addition | Replaces |
|---|---|---|
| 01 | Nine lens scores as a radar or bar chart, with the score and the one-line finding beside each | The current table |
| 02 | A weight diagram: 26 MB and 152 files against the 2 MB and 40 request target, drawn to scale | A sentence |
| 03 | The content-conflict panel drawn as two homepage variants side by side with the conflicting figures circled | The prose list |
| 04 | A findability diagram: seven tabs versus four filters, showing what a buyer can and cannot reach | The prose |
| 05 | Icons on all 13 verdict ledger rows, matching the verdict type | Plain text rows |
| 06 | A before-and-after strip on the IR gap, showing the structure that has to exist by listing day | Nothing, this is new |

Keep the verdict ledger exactly as it is. It works.

---

## Build 3 · Visual rebuild of `public/competitors.html`

**Why.** Same reason. 7,532 words, thumbnails and tables, no diagrams.

**What to add**

| # | Addition |
|---|---|
| 01 | A positioning map: website quality on one axis, threat on the other, all 13 assessed firms plotted. This single chart carries the whole argument |
| 02 | The five-rung ladder from the plan, reused here with each competitor placed on its rung |
| 03 | A scale-versus-presence chart proving the decoupling: contract scale against website score |
| 04 | Icons on the nine rival profiles, one per threat type: tender rival, channel, benchmark, bar setter |
| 05 | A Malaysia presence map or list, showing which rivals are physically in Penang, Kulim and Johor |
| 06 | The battery gap drawn as a coverage grid: which rivals publish battery capability and which do not |

---

## Order of work

1. Build 1, because the plan is the live client document and section 05 is its weakest chapter.
2. Build 3, because the positioning map is the highest-value single diagram in the whole workspace.
3. Build 2.

## Standing gotchas for whoever picks this up

- Anchor inserts against an existing child element. Inserting before `</section>` has twice put content outside its section, because part 06's markup closes earlier than the source suggests.
- Run the inline-JS syntax scan after every edit. A broken string once killed the entire client workspace silently, with no console error.
- Verify by measuring the DOM, not by reading the markup. Screenshots on the plan page occasionally return blank while the DOM reports the content correctly.
- Back up before any scripted edit. `.plan.pre-0304merge.bak.html` is the state before tonight's merge.
