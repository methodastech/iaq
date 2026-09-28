/* ============ careers role marks ============
   14 Sep (Bazil, on the job list: "better icons that represent, animated").

   The list used to draw ONE mark per department: all eight Engineering rows
   carried the same gear and all five Project rows the same clipboard, so the
   icon repeated the heading above it and said nothing about the role. Each row
   now carries a mark for its DISCIPLINE, read from the job title. A Mechanical
   engineer and a Senior Mechanical engineer share the fan; seniority is the
   Level filter's job, not the icon's.

   DRAWING. Same language as the house sets (components/FlowIcon.jsx and
   components/FabIcon.jsx, whose SPEC this copies): 24 grid, one stroke weight
   of 1.15, butt caps, mitred joins, straight lines, rects and complete circles
   only, no tile or box behind the mark, three to six elements, nothing under
   3 units. The structure is ink; the ONE part that moves is red (class ri-a).
   The rows are built as an HTML string in scenes/careers.js, so the marks are
   strings here rather than JSX.

   MOTION lives in styles/careers.css under "role marks". Parts that move carry
   ri-p plus a motion class (ri-spin, ri-draw ...). --ri-o staggers parts inside
   one mark. Every keyframe starts and ends at the resting drawing, so a hover
   never jumps. Nothing moves under prefers-reduced-motion.

   ⚠ THE MAPPING IS HERE AND ONLY HERE. The rules are tried top to bottom and
   the first match wins, so the order matters: "Site Safety Supervisor" must
   reach safety before "site" reaches construction, and "BIM Modeler" sits in
   the Project department but is still a BIM role. Every pattern is bounded by
   \b so "process" never matches "processing clerk" by accident of a prefix and
   "QS" never matches inside a longer word. A title that matches nothing falls
   back to its department's mark, then to the briefcase. HR can add a role in
   the CMS without touching this file; a new discipline needs one rule and one
   drawing below. */

export const ROLE_RULES = [
  ['bim',          /\bBIM\b|\bmodel(l)?er\b|\bRevit\b|\bdigital engineering\b/i],
  ['qaqc',         /\bQA\s*\/?\s*QC\b|\bQAQC\b|\bQA\b|\bQC\b|\bquality\b|\binspect(or|ion)\b|\bcommissioning\b/i],
  ['safety',       /\bsafety\b|\bHSE\b|\bSHE\b|\bOSH\b|\bEHS\b/i],
  ['document',     /\bdocument(s|ation)?\b|\bdoc(ument)? control\b|\brecords?\b/i],
  ['mechanical',   /\bmechanical\b|\bHVAC\b|\bACMV\b|\bM&E\b/i],
  ['electrical',   /\belectrical\b|\bELV\b|\binstrumentation\b|\bE&I\b/i],
  ['process',      /\bprocess\b|\bpiping\b|\butilit(y|ies)\b|\bchemical\b/i],
  ['construction', /\bconstruction\b|\bsite\b|\bforeman\b|\bsupervisor\b|\bcivil\b/i],
  ['project',      /\bproject\b|\bplann(er|ing)\b|\bscheduler\b|\bcoordinator\b/i],
  ['commercial',   /\bcommercial\b|\btender(ing)?\b|\bcontracts?\b|\bquantity surveyor\b|\bQS\b|\bprocurement\b|\bestimat(or|ion)\b/i],
  ['accounts',     /\baccount(s|ant|ing)?\b|\bledger\b|\bpayables?\b|\breceivables?\b|\baudit(or)?\b/i],
  ['finance',      /\bfinance\b|\bfinancial\b|\btreasury\b|\bcredit\b|\bcontroller\b/i],
]

/* when the title names no discipline the list recognises */
export const DEPT_FALLBACK = { engineering: 'engineering', project: 'project', commercial: 'commercial', finance: 'finance' }

export function roleDiscipline(role) {
  const t = String((role && role.t) || '')
  for (const [key, re] of ROLE_RULES) if (re.test(t)) return key
  return DEPT_FALLBACK[role && role.dept] || 'general'
}

/* each entry is the inner markup of one 24 grid mark */
const M = {
  /* MECHANICAL: a fan in its housing. The blades turn. Four swept blades, not three radial ones:
     three spokes in a ring read as a steering wheel, and three wedges widening to the rim read
     as the radiation trefoil, which on a cleanroom contractor's page is the wrong sign. */
  mechanical:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="1.8"/>' +
    '<g class="ri-a ri-p ri-spin">' +
      '<path d="M13.3 10.4 10 5"/>' +
      '<path d="M13.3 10.4 10 5" transform="rotate(90 12 12)"/>' +
      '<path d="M13.3 10.4 10 5" transform="rotate(180 12 12)"/>' +
      '<path d="M13.3 10.4 10 5" transform="rotate(270 12 12)"/>' +
    '</g>',
  /* ELECTRICAL: a distribution board carrying the bolt. The bolt flickers on. */
  electrical:
    '<path d="M5.5 3h13v18h-13z"/>' +
    '<path class="ri-a ri-p ri-flick" d="M13.2 6 9.6 12.5h4.8L10.8 18"/>',
  /* PROCESS: a flanged pipe spool and what runs through it. The flow moves along the pipe.
     A vessel with an elbow off it was tried first and read as a building at row size. */
  process:
    '<path d="M2 7.5h20M2 16.5h20"/><path d="M6.5 5v14M17.5 5v14"/>' +
    '<path class="ri-a ri-p ri-flow" d="M2 12h20"/>',
  /* BIM: the model as a block with its top layer lifted clear. The layer separates and settles. */
  bim:
    '<path d="M4.5 10.5 12 14.5l7.5-4v6L12 20.5l-7.5-4z"/><path d="M12 14.5v6"/>' +
    '<path class="ri-a ri-p ri-lift" d="M12 3l7.5 4-7.5 4-7.5-4z"/>',
  /* QAQC: the inspection glass with a pass tick in it. The glass scans and the tick draws in. */
  qaqc:
    '<g class="ri-p ri-scan"><circle cx="10.5" cy="10.5" r="6"/><path d="M14.8 14.8 20.5 20.5"/></g>' +
    '<path class="ri-a ri-p ri-draw" pathLength="1" style="--ri-o:.12s" d="M7.8 10.6l1.9 1.9 3.6-3.6"/>',
  /* PROJECT: a programme, three tasks on a time axis. The bars grow in sequence. */
  project:
    '<path d="M4 3v18"/>' +
    '<path class="ri-p ri-growx" d="M6.5 4.5h7v3h-7z"/>' +
    '<path class="ri-a ri-p ri-growx" style="--ri-o:.16s" d="M9.5 10.5h9v3h-9z"/>' +
    '<path class="ri-p ri-growx" style="--ri-o:.32s" d="M14 16.5h6v3h-6z"/>',
  /* CONSTRUCTION: a tower crane on its footing. The load lowers and comes back up. */
  construction:
    '<path d="M7 21V3"/><path d="M3.5 6h17"/><path d="M3.5 6 7 3l9 3"/><path d="M3.5 21h7"/>' +
    '<path class="ri-a ri-p ri-rope" d="M17.5 6v5"/>' +
    '<path class="ri-a ri-p ri-load" d="M16 11h3v3h-3z"/>',
  /* SAFETY: a site cone on its base. The reflective bands catch the light one after the other. */
  safety:
    '<path d="M6 19 10.5 4.5h3L18 19"/><path d="M3.5 19h17"/>' +
    '<path class="ri-a ri-p ri-glint" d="M8.95 9.5h6.1"/>' +
    '<path class="ri-a ri-p ri-glint" style="--ri-o:.2s" d="M7.55 14h8.9"/>',
  /* DOCUMENT CONTROL: an issued sheet on the register stack. The sheet is filed onto the stack. */
  document:
    '<path d="M8.5 6.5v-3H20v14h-3"/>' +
    '<g class="ri-p ri-file"><path d="M4 6.5h13v14H4z"/><path class="ri-a" d="M7 11h7M7 14h7M7 17h4"/></g>',
  /* COMMERCIAL: the contract, its terms and the signature. The terms write, then it is signed. */
  commercial:
    '<path d="M5.5 3h9l4 4v14h-13z"/><path d="M14.5 3v4h4"/>' +
    '<path class="ri-p ri-draw" pathLength="1" d="M8.5 10.5h7"/>' +
    '<path class="ri-p ri-draw" pathLength="1" style="--ri-o:.14s" d="M8.5 13.5h7"/>' +
    '<path class="ri-a ri-p ri-draw" pathLength="1" style="--ri-o:.3s" d="M8.5 18l2.5-2.5 2 2.5 2.5-2.5"/>',
  /* ACCOUNTS: the ledger, a ruled sheet with its amount column. The entries are written in. */
  accounts:
    '<path d="M4 3.5h16v17H4z"/><path d="M4 8h16M14.5 8v12.5"/>' +
    '<path class="ri-a ri-p ri-draw" pathLength="1" d="M6.5 11.5H12"/>' +
    '<path class="ri-a ri-p ri-draw" pathLength="1" style="--ri-o:.14s" d="M6.5 14.5H12"/>' +
    '<path class="ri-a ri-p ri-draw" pathLength="1" style="--ri-o:.28s" d="M6.5 17.5H12"/>',
  /* FINANCE: results on an axis, rising. The bars rise in sequence. */
  finance:
    '<path d="M4 3v17.5h17"/>' +
    '<path class="ri-p ri-growy" d="M7 14h3v6.5H7z"/>' +
    '<path class="ri-p ri-growy" style="--ri-o:.14s" d="M12 10h3v10.5h-3z"/>' +
    '<path class="ri-a ri-p ri-growy" style="--ri-o:.28s" d="M17 6h3v14.5h-3z"/>',
  /* ENGINEERING (fallback): the set square. It tilts on its corner and settles. */
  engineering:
    '<g class="ri-p ri-tilt"><path d="M4.5 20V5.5L19 20z"/><path class="ri-a" d="M7.5 17v-4.5l4.5 4.5z"/></g>',
  /* GENERAL (last resort): the briefcase. The handle lifts. */
  general:
    '<path d="M3.5 7.5h17V20h-17z"/><path class="ri-a" d="M3.5 12.5h17"/>' +
    '<path class="ri-p ri-lift" d="M9 7.5v-3h6v3"/>',
}

export function roleIcon(role) {
  const k = roleDiscipline(role)
  return '<svg class="ri ri-' + k + '" data-disc="' + k + '" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
    ' stroke-width="1.15" stroke-linecap="butt" stroke-linejoin="miter" aria-hidden="true" focusable="false">' +
    M[k] + '</svg>'
}
