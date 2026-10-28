import { BannerSlide, Fab3D, UnitsSlide, RingSlide, ChartSlide, QrSlide, VisitSlide } from '../components/portal/DeckSlides.jsx'

/* ============================================================================
   Presentations · 7 Oct 2026 (Bazil: "in codex we need to add a tab called presentation", "one of it is IAQ Europe
   presentation 1", "for this we need tabs at the top and they're just like slides", "this one is for the screen
   exhibition").

   A deck is a list of slides; the tabs across the top of the deck page are the slides. Each slide is a component
   drawn in the Codex slide system (components/portal/DeckSlides.jsx). `tab` is the short name on the tab strip,
   `says` the one line under the slide, `dur` its seconds in the showreel. A slide with `keep` shares one live instance with every other slide of the
   same `keep` (the 3D loads once and is driven by `mode`). The relationship-map tab was scrapped on Bazil's word.
   ============================================================================ */
export const DECKS = [
  {
    id: 'europe-1',
    name: 'IAQ Europe presentation 1',
    h: ['IAQ Europe,', 'presentation 1.'],
    lede: 'For the exhibition screen. One tab per slide: click a tab or use the arrow keys, and put it full screen on the TV.',
    /* dur: seconds a slide holds in the showreel (Bazil: "a showreel where it shows all slides automatically ... and loop") */
    slides: [
      { id: 'banner', tab: 'Banner', C: BannerSlide, dur: 50, says: 'The home page banner: the reel of IAQ’s own sites and cleanrooms, round and round, the mark over the line, the seven markets along the foot.' },
      { id: 'build', tab: 'Build', keep: 'fab', C: Fab3D, mode: 'build', dur: 28, says: 'The facility assembles as the frame is scrolled: piles, frame, cleanroom, services, tools. Drag to turn it. In the showreel it builds on its own.' },
      { id: 'walk', tab: 'Walkthrough', keep: 'fab', C: Fab3D, mode: 'walk', dur: 22, says: 'The built facility in first person: drag to look, the keys to walk, the doors to change room.' },
      { id: 'systems', tab: 'Systems', keep: 'fab', C: Fab3D, mode: 'systems', dur: 44, says: 'The built facility with its envelope turned to glass and every system labelled. The three units on the right: an item lights what it delivers in the model. EPC builds every system; tools hookup is unit 2; Energy Management runs the plant.' },
      { id: 'units', tab: 'Three units', C: UnitsSlide, dur: 16, says: 'When each unit is called in, from the first drawing to a plant in operation, and the six services along the way.' },
      { id: 'ring', tab: 'Six services', C: RingSlide, dur: 20, says: 'The six services as the delivery cycle. It steps on its own until a station is touched.' },
      { id: 'chart', tab: 'One chart', C: ChartSlide, dur: 18, says: 'Which unit carries which service, the work each one does, and where that work sits in the fab. It tours the units until touched.' },
      { id: 'visit', tab: 'SEMICON Europa', C: VisitSlide, dur: 18, says: 'The invitation, as IAQ’s pre-event poster says it: the dates, the place, the three offerings and the booth number, on IAQ’s own cleanroom footage.' },
      { id: 'scan', tab: 'Scan', C: QrSlide, dur: 14, says: 'Two codes: the website, and the one-page form for a visitor’s details (temporary, /prospect, until IAQ’s endpoint is decided).' },
    ],
  },
]
