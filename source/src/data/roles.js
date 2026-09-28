/* ============ careers roles registry ============
   The 16 open roles, verbatim from the client's supplied list. One source of
   truth: the Careers page reads this list, and the CMS portal edits a stored
   copy of it (localStorage in this prototype, the real CMS at production).
   `loc` and `dept` use the fixed vocabularies below so the page filters
   always match.

   4 Sep — WHAT IS REAL AND WHAT IS NOT.
   The client supplied THREE fields per role: the title, the location and the
   department. That is all. The page used to manufacture the rest: scenes/
   careers.js ran the job title through nine regular expressions and printed a
   matching block of "About the role", "What you will do" and "What you bring"
   copy that IAQ never wrote. Two things were wrong with that.

     1. It was fiction presented as IAQ's hiring criteria, including eligibility
        that has real consequences for a candidate — "NIOSH or DOSH certification
        (Green Book preferred)", "CIDB certification an advantage" — and a
        "Full-time" / "On-site" stamp on all sixteen.
     2. It silently mis-fired. "Manager, Project" matched none of the nine
        patterns, so it fell through to the final else and a candidate opening
        the Project Manager role read an ACCOUNTING job spec, under the Project
        department heading.

   So the generator is gone. Every field below is either supplied or absent, and
   an absent field is shown as a labelled slot rather than invented. `ref` is now
   a REAL stored field rather than a number derived from array position, so a
   reference a candidate quotes in an email still resolves after HR reorders or
   removes a row.

   ⚠ FOR HR: fill `about`, `duties`, `reqs` and `type` per role and the accordion
   body fills itself, one role at a time. `duties` and `reqs` are arrays of
   strings. Nothing else needs to change. */

export const ROLES = [
  { ref: 'IAQ-COM-01', t: 'Manager, Commercial', loc: 'shah-alam', dept: 'commercial' },
  { ref: 'IAQ-ENG-01', t: 'Engineer, Mechanical', loc: 'shah-alam', dept: 'engineering' },
  { ref: 'IAQ-ENG-02', t: 'Senior Engineer, Mechanical', loc: 'shah-alam', dept: 'engineering' },
  { ref: 'IAQ-ENG-03', t: 'Senior Engineer, Electrical', loc: 'shah-alam', dept: 'engineering' },
  { ref: 'IAQ-ENG-04', t: 'Engineer, Electrical', loc: 'shah-alam', dept: 'engineering' },
  { ref: 'IAQ-ENG-05', t: 'Engineer, Process', loc: 'penang', dept: 'engineering' },
  { ref: 'IAQ-ENG-06', t: 'Senior Engineer, Process', loc: 'penang', dept: 'engineering' },
  { ref: 'IAQ-ENG-07', t: 'BIM Coordinator', loc: 'shah-alam', dept: 'engineering' },
  { ref: 'IAQ-ENG-08', t: 'Engineer, QAQC', loc: 'shah-alam', dept: 'engineering' },
  { ref: 'IAQ-PRJ-01', t: 'Manager, Project', loc: 'shah-alam', dept: 'project' },
  { ref: 'IAQ-PRJ-02', t: 'BIM Modeler', loc: 'shah-alam', dept: 'project' },
  { ref: 'IAQ-PRJ-03', t: 'Manager, Construction', loc: 'shah-alam', dept: 'project' },
  { ref: 'IAQ-PRJ-04', t: 'Site Safety Supervisor', loc: 'shah-alam', dept: 'project' },
  { ref: 'IAQ-PRJ-05', t: 'Document Controller', loc: 'shah-alam', dept: 'project' },
  { ref: 'IAQ-FIN-01', t: 'Manager, Finance', loc: 'shah-alam', dept: 'finance' },
  { ref: 'IAQ-FIN-02', t: 'Senior Executive, Accounts', loc: 'shah-alam', dept: 'finance' },
]

export const LOCS = [['shah-alam', 'Shah Alam, Selangor'], ['penang', 'Simpang Ampat, Penang']]
export const DEPTS = [['engineering', 'Engineering'], ['project', 'Project'], ['commercial', 'Commercial'], ['finance', 'Finance & Accounts']]

/* Where an application actually goes. From the Discovery V3 questionnaire (B2.10):
   business enquiries are bd@, RECRUITMENT is recruit@. The apply control writes to
   this with the role title and reference in the subject, so HR can route it without
   opening the mail. Swap the address here and every one of the sixteen follows. */
export const HR_EMAIL = 'recruit@iaqtechnology.com.my'

/** the mailto an apply control points at, carrying the role it came from */
export const applyHref = role =>
  `mailto:${HR_EMAIL}?subject=${encodeURIComponent(`Application · ${role.t} · ${role.ref}`)}`
  + `&body=${encodeURIComponent(
    `Hello IAQ,\n\nI would like to apply for ${role.t} (${role.ref}).\n\n`
    + 'My CV is attached.\n\nName:\nPhone:\nEarliest start date:\n\nThank you,\n')}`

/** the speculative route, for the candidate none of the sixteen roles fits */
export const speculativeHref =
  `mailto:${HR_EMAIL}?subject=${encodeURIComponent('Speculative application · CV for consideration')}`
  + `&body=${encodeURIComponent(
    'Hello IAQ,\n\nNone of the current openings matches me, but I would like to be considered '
    + 'for future roles.\n\nDiscipline:\nYears of experience:\nPreferred location:\n\n'
    + 'My CV is attached.\n\nThank you,\n')}`
