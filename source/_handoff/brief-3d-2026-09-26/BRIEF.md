# Brief to the 3D developer: the Scroll to build, high end and light, 26 September 2026

Bazil's ask: "find a way to make the 3D very high end, while ensuring it's light weight and smooth when going through."
The delivery "3D ONLY (4)" is embedded on the IAQ home page as delivered (public/3d, untouched). Its render is inside the
compiled bundle, so the look below has to come from your source. Everything here is standard three.js; nothing needs a
new model.

## The look (what "high end" means here)
1. Materials per system, not one grey. MeshStandardMaterial with roughness 0.55 to 0.7, metalness 0 for concrete and
   cladding, 0.9 for steel and pipework, low-contrast base colours from IAQ's own palette (ink, greys, the eight system
   colours only where a system is lit). No pure white, no flat unlit grey.
2. Light from an environment, not from lamps alone: RoomEnvironment (already in the bundle) or a small studio HDRI
   through PMREMGenerator, environment intensity about 0.6, plus one key DirectionalLight for the shadow.
3. Tone mapping: NeutralToneMapping (PBR Neutral), exposure 1.0, sRGB output. ACES makes the greys go brown.
4. Ground: a large ShadowMaterial plane with the key light's shadow, PCFSoft, one shadow map of 2048, and a soft
   contact darkening under the slab. Shadows re-bake only when the camera or the build state changes, not every frame.
5. A faint dotted drafting grid on the ground and a fog that starts past the model (colour = the page ground #070C18).
6. The build: parts arrive with an ease-out and a short settle (no linear slides), and the reveal of a system tints it
   with its colour for a moment before it goes to its material.

## The weight (what "light and smooth" means here)
1. Pixel ratio capped at 1.5 on every tier (it is 2 on the full tier now); antialias on; no post-processing passes.
2. Frustum culling on; each storey's layers merged into as few draw calls as the palette allows (one material per
   system per storey), instanced where a part repeats (piles, columns, purlins).
3. Draco stays; add meshopt quantisation if the pipeline allows (halves the download again).
4. No allocation in the frame loop; progress lerped (0.12 per frame) so the scrub glides; reduced motion honoured.
5. Stop the loop when the canvas is not on screen (IntersectionObserver) and when the tab is hidden.
6. Budget on a 2020 MacBook Air at 1600 px: 60 fps through the whole build, under 1.5 GB of GPU memory.

## How it is embedded (so nothing you change breaks it)
Same-origin iframe; the page hands its scroll to your document (window.scrollTo) and your wheel/touch are handed back to
the page. Keep the fixed canvas, the scroll runway and the ids in index.html as they are.
