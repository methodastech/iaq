/* ============ careers roles registry ============
   The 16 open roles, verbatim from the client's supplied list. One source of
   truth: the Careers page reads this list, and the CMS portal edits a stored
   copy of it (localStorage in this prototype, the real CMS at production).
   `loc` and `dept` use the fixed vocabularies below so the page filters
   always match. */

export const ROLES = [
  { t: 'Manager, Commercial', loc: 'shah-alam', dept: 'commercial' },
  { t: 'Engineer, Mechanical', loc: 'shah-alam', dept: 'engineering' },
  { t: 'Senior Engineer, Mechanical', loc: 'shah-alam', dept: 'engineering' },
  { t: 'Senior Engineer, Electrical', loc: 'shah-alam', dept: 'engineering' },
  { t: 'Engineer, Electrical', loc: 'shah-alam', dept: 'engineering' },
  { t: 'Engineer, Process', loc: 'penang', dept: 'engineering' },
  { t: 'Senior Engineer, Process', loc: 'penang', dept: 'engineering' },
  { t: 'BIM Coordinator', loc: 'shah-alam', dept: 'engineering' },
  { t: 'Engineer, QAQC', loc: 'shah-alam', dept: 'engineering' },
  { t: 'Manager, Project', loc: 'shah-alam', dept: 'project' },
  { t: 'BIM Modeler', loc: 'shah-alam', dept: 'project' },
  { t: 'Manager, Construction', loc: 'shah-alam', dept: 'project' },
  { t: 'Site Safety Supervisor', loc: 'shah-alam', dept: 'project' },
  { t: 'Document Controller', loc: 'shah-alam', dept: 'project' },
  { t: 'Manager, Finance', loc: 'shah-alam', dept: 'finance' },
  { t: 'Senior Executive, Accounts', loc: 'shah-alam', dept: 'finance' },
]

export const LOCS = [['shah-alam', 'Shah Alam, Selangor'], ['penang', 'Simpang Ampat, Penang']]
export const DEPTS = [['engineering', 'Engineering'], ['project', 'Project'], ['commercial', 'Commercial'], ['finance', 'Finance & Accounts']]
