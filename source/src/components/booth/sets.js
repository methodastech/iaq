/* 30 Sep 2026: the five exhibition directions as one registry, so the portal's chooser can switch every piece on the page
   (pages/PortalBooth.jsx) and the Directions block can show them side by side (booth/Direction.jsx).
   A: Art.jsx, B: ArtB.jsx, C: ArtC.jsx, D: ArtD.jsx, E: ArtE.jsx. Piece ids are the direction's suffix on A's ids
   (post1-c, ad300x250-d, sig-e), as in the PNG and PDF exports. */
import { ART, PIECES, FlyerFront, FlyerBack, RollUp, Post1, Post2, Post3, Post4, Ad, Signature } from './Art.jsx'
import { ART_B, PIECES_B, FlyerFrontB, FlyerBackB, RollUpB, POSTS_B, AdB, SignatureB } from './ArtB.jsx'
import { ART_C, PIECES_C, PIECES_C2, PIECES_C3, W1C2, W1C3, W3C3, FlyerFrontC, FlyerBackC, RollUpC, POSTS_C, AdC, SignatureC } from './ArtC.jsx'
import { ART_D, PIECES_D, FlyerFrontD, FlyerBackD, RollUpD, POSTS_D, AdD, SignatureD } from './ArtD.jsx'
import { ART_E, PIECES_E, FlyerFrontE, FlyerBackE, RollUpE, POSTS_E, AdE, SignatureE } from './ArtE.jsx'
import { ART_F, PIECES_F, FlyerFrontF, FlyerBackF, RollUpF, POSTS_F, AdF, SignatureF } from './ArtF.jsx'
import { PIECES_PRINT } from './Print.jsx'
import { SURFACES, SURFACES_B, SURFACES_C, SURFACES_C2, SURFACES_C3, SURFACES_D, SURFACES_E, SURFACES_F, DIRECTIONS } from '../../data/booth.js'

/* 30 Sep, after Bazil's review ("direction B and D is rejected", "i like direction C the most", "the front panel do a new
   version that is red", "create one with amazing 3d"): the live options first, C (preferred) the default, then the
   rejected pair, still viewable. Status lives in data/booth.js DIRECTIONS[k].status */
export const LIVE = ['A', 'C', 'C2', 'C3', 'E', 'F']
export const REJECTED = ['B', 'D']
export const DIRS = [...LIVE, ...REJECTED]
export const DEFAULT_DIR = 'C'
export const SFX = { A: '', B: '-b', C: '-c', C2: '-c2', C3: '-c3', D: '-d', E: '-e', F: '-f' }
const WALLS = ['w1', 'w2', 'w3', 'ct']
const byId = (art, sur) => Object.fromEntries(WALLS.map(k => [k, art[sur[k].id]]))

export const SETS = {
  A: {
    walls: { w1: ART.w1, w2: ART.w2, w3: ART.w3, ct: ART.ct },
    surf: Object.fromEntries(SURFACES.map(s => [s.id, { id: s.id, content: s.content, zones: s.zones }])),
    flyer: { F: FlyerFront, B: FlyerBack, ids: ['flyer1', 'flyer2'], h: 'Controlled environments, built to class.', t: 'Front: what IAQ does, the three units, the exploded fab, the show in the navy crown. Back: the IAQ, the six services, the record, Dresden and headquarters, the code.' },
    roll: { C: RollUp, id: 'rollA', cap: 'The brand book’s design 1: navy crown, white field, the field red foot.' },
    posts: { post1: Post1, post2: Post2, post3: Post3, post4: Post4 }, Ad, Sig: Signature, pieces: PIECES,
  },
  B: {
    walls: byId(ART_B, SURFACES_B), surf: SURFACES_B,
    flyer: { F: FlyerFrontB, B: FlyerBackB, ids: ['flyerB1', 'flyerB2'], h: 'The cleanroom, and the whole fab around it.', t: 'Front on navy: the statement, one wide photograph of an IAQ cleanroom, the show and the code. Back on white: the IAQ, the three units with their objects, the record, Dresden and headquarters on navy.' },
    roll: { C: RollUpB, id: 'rollB', cap: 'The Design tab’s roll-up on navy: every word above 300 mm, the line above the foot.' },
    posts: POSTS_B, Ad: AdB, Sig: SignatureB, pieces: PIECES_B,
  },
  C: {
    walls: byId(ART_C, SURFACES_C), surf: SURFACES_C,
    flyer: { F: FlyerFrontC, B: FlyerBackC, ids: ['flyerC1', 'flyerC2'], h: 'Cleanrooms, built layer by layer.', t: 'Front: the statement and the cleanroom being built, its four layers named, the show and the code. Back: the three units with their objects, the record, Dresden, headquarters, and the stand contact slot.' },
    roll: { C: RollUpC, id: 'rollC', cap: 'White: the statement, IAQ’s exploded fab with one red part and its four layers named, the red line above the foot.' },
    posts: POSTS_C, Ad: AdC, Sig: SignatureC, pieces: PIECES_C,
  },
  D: {
    walls: byId(ART_D, SURFACES_D), surf: SURFACES_D,
    flyer: { F: FlyerFrontD, B: FlyerBackD, ids: ['flyerD1', 'flyerD2'], h: 'Cleanrooms, built to class.', t: 'Front on field red: the statement, one IAQ cleanroom in its block, the show and the code. Back on white: the three units, the record large on a red band, Dresden, headquarters, the stand contact slot.' },
    roll: { C: RollUpD, id: 'rollD', cap: 'Field red: the white IAQ across the top, one IAQ cleanroom, the figure, the white line above the foot.' },
    posts: POSTS_D, Ad: AdD, Sig: SignatureD, pieces: PIECES_D,
  },
  E: {
    walls: byId(ART_E, SURFACES_E), surf: SURFACES_E,
    flyer: { F: FlyerFrontE, B: FlyerBackE, ids: ['flyerE1', 'flyerE2'], h: 'Cleanrooms, built to class.', t: 'Front: the red plane with the white IAQ and the statement, then white: one IAQ cleanroom, three figures, the show and the code. Back: the three units, the record, Dresden, headquarters, the stand contact slot.' },
    roll: { C: RollUpE, id: 'rollE', cap: 'The red plane at the top with the white IAQ, then white: one IAQ cleanroom in a square block, the red line above the foot.' },
    posts: POSTS_E, Ad: AdE, Sig: SignatureE, pieces: PIECES_E,
  },
}
/* C2: C with the red front column, every other piece C's own (its files are C's) */
SETS.C2 = {
  ...SETS.C,
  walls: { ...SETS.C.walls, w1: W1C2 }, surf: SURFACES_C2,
  pieces: { ...PIECES_C2, ...Object.fromEntries(Object.entries(PIECES_C).filter(([id]) => id !== 'w1-c')) },
}
/* C3: C with the loop column and the red back wall, every other piece C's own */
SETS.C3 = {
  ...SETS.C,
  walls: { ...SETS.C.walls, w1: W1C3, w3: W3C3 }, surf: SURFACES_C3,
  pieces: { ...PIECES_C3, ...Object.fromEntries(Object.entries(PIECES_C).filter(([id]) => id !== 'w1-c' && id !== 'w3-c')) },
}
SETS.F = {
  walls: byId(ART_F, SURFACES_F), surf: SURFACES_F,
  flyer: { F: FlyerFrontF, B: FlyerBackF, ids: ['flyerF1', 'flyerF2'], h: 'Cleanrooms, built to class.', t: 'Front: the statement, a cleanroom module exploded (render), the show and the code. Back: the six services as the site’s photoreal objects, the record, Dresden, headquarters, the stand contact slot.' },
  roll: { C: RollUpF, id: 'rollF', cap: 'White: the statement, the tall exploded stack of cleanroom layers (render), the red line above the foot.' },
  posts: POSTS_F, Ad: AdF, Sig: SignatureF, pieces: PIECES_F,
}
/* a piece id in a direction: C2 shares C's files except its front column */
export const pieceId = (d, id) => (d === 'C2' ? (id === 'w1' ? 'w1-c2' : id + SFX.C) : d === 'C3' ? (id === 'w1' || id === 'w3' ? id + '-c3' : id + SFX.C) : id + SFX[d])
/* the 3D stand's option for each direction (BoothModel TEX sets) */
export const OPT = { A: 'a', B: 'b', C: 'c', C2: 'c2', C3: 'c3', D: 'd', E: 'e', F: 'f' }
export const statusOf = d => DIRECTIONS[d].status || 'live'
/* every piece once (C2's shared pieces are C's), for the exports */
export const ALL_PIECES = Object.assign({}, ...DIRS.map(d => SETS[d].pieces), PIECES_PRINT)   /* 30 Sep: plus the exhibition print, two leaflets and two trifolds */
