/* IAQ's Revit model of a fab, rendered as 61 frames (public/assets/iaq/model-seq): 00 to 59, then final */
export const FRAMES = Array.from({ length: 61 }, (_, i) => `/assets/iaq/model-seq/${i === 60 ? 'final' : String(i).padStart(2, '0')}.webp`)
/* the same frames with the white keyed out (public/assets/iaq/model-seq-t), for a dark ground: Bazil, 24 Sep: "I want my 3D" */
export const FRAMES_T = Array.from({ length: 61 }, (_, i) => `/assets/iaq/model-seq-t/${i === 60 ? 'final' : String(i).padStart(2, '0')}.webp`)
