/* ============================================================================
   launch.js · 15 Sep 2026 (Bazil: "finish the website", after the publish bundle went to the developer).

   The review build carries labelled slots for everything IAQ still owes ("Street address · supplied by IAQ",
   "Name to be confirmed", the grey pg-slot blocks). That is right for the client review and wrong for a
   public site. LAUNCH is true in the launch build (npm run build:launch, MODE=launch). In the dev and review
   builds, add ?launchview to any URL to see the page exactly as it will publish; it sticks for the tab.

   What LAUNCH changes:
     · <html class="is-launch">, which base.css uses to hide every owed-content block and chip
     · pages that are nothing but owed content leave the route table (Investors, Exhibition, Leadership)
     · owed() lets a page drop a text value that is only a placeholder
   ============================================================================ */
const fromQuery = () => {
  if (typeof window === 'undefined') return false
  try {
    if (new URLSearchParams(window.location.search).has('launchview')) sessionStorage.setItem('iaq_launchview', '1')
    return sessionStorage.getItem('iaq_launchview') === '1'
  } catch (e) { return false }
}

export const LAUNCH = import.meta.env.MODE === 'launch' || fromQuery()

/* a value that only says what IAQ still has to send */
const OWED = /supplied by IAQ|to be confirmed|\bTBC\b|awaiting|still to come/i
export const isOwed = v => typeof v === 'string' && OWED.test(v)
/* in launch, a placeholder value becomes null so the page can skip it */
export const owed = v => (LAUNCH && isOwed(v) ? null : v)

if (LAUNCH && typeof document !== 'undefined') document.documentElement.classList.add('is-launch')
