/* The offices, once, for every map on the site (8 Oct 2026).

   Client, on the maps: "guna pin, terus guna flag country ... you dah mark, lepas tu you buat list ... kita tak pernah
   guna listing untuk our global presence. Kita biasa guna call out ataupun pin dekat map tu sendiri." So every map marks
   each office with a pin carrying its country's flag and a callout naming it, on the map, and no list beside it.

   Until now the home globe, /global-presence and the Commitment globe each kept their own coordinates, and they
   disagreed (India was Ahmedabad on one, Delhi on another, the middle of the country on the third). The cities here are
   the Contact page's addresses (pages/Contact.jsx OFFICES); the USA has no street address yet, so it is Phoenix, as the
   home globe and the booth already had it. */

export const OFFICES = [
  { id: 'my-hq',     cc: 'MY', country: 'Malaysia',      city: 'Shah Alam',  lat: 3.07,  lon: 101.52, hq: true },
  { id: 'my-penang', cc: 'MY', country: 'Malaysia',      city: 'Penang',     lat: 5.22,  lon: 100.50 },   /* Valdor, Jawi */
  { id: 'sg',        cc: 'SG', country: 'Singapore',     city: 'Singapore',  lat: 1.35,  lon: 103.82 },
  { id: 'de',        cc: 'DE', country: 'Germany',       city: 'Dresden',    lat: 51.05, lon: 13.74 },
  { id: 'in',        cc: 'IN', country: 'India',         city: 'Ahmedabad',  lat: 23.03, lon: 72.58 },
  { id: 'se',        cc: 'SE', country: 'Sweden',        city: 'Skellefteå', lat: 64.75, lon: 20.95 },
  { id: 'us',        cc: 'US', country: 'United States', city: 'Phoenix',    lat: 33.45, lon: -112.07 },
  { id: 'ie',        cc: 'IE', country: 'Ireland',       city: 'Dublin',     lat: 53.35, lon: -6.26 },
]

/* one mark per country, for the globes: Malaysia is marked at the headquarters */
export const OFFICE_COUNTRIES = OFFICES.filter((o, i) => OFFICES.findIndex(x => x.cc === o.cc) === i)

/* countries IAQ has delivered projects in, with no office there (the Global Presence map marks them quietly) */
export const DELIVERED = [
  { id: 'cn', country: 'China',   lat: 31.2, lon: 121.5 },
  { id: 'pl', country: 'Poland',  lat: 52.2, lon: 21.0 },
  { id: 'fr', country: 'France',  lat: 46.6, lon: 2.4 },
  { id: 'ma', country: 'Morocco', lat: 33.6, lon: -7.6 },
]
