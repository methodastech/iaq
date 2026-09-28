import { useEffect } from 'react'
/* IAQ's print faces (Brand OS v3.1: Poppins headlines, Urbanist text, League Spartan labels), loaded only on the
   booth pages, so the drafts and the booth screen are seen in the faces they will print and play in. For the
   stand machine they are to be held locally (data/booth.js SCREEN rules). */
const HREF = 'https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Urbanist:wght@500;600;700&family=League+Spartan:wght@600;700&display=swap'
export function useBrandFonts() {
  useEffect(() => {
    if (document.querySelector('link[data-brand-fonts]')) return
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = HREF; l.dataset.brandFonts = '1'
    document.head.appendChild(l)
  }, [])
}
