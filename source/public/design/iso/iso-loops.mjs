/* 29 Sep 2026, night. The loops of the six service objects, in one place, so the detailed set (build-iso6.mjs), the
   simple set (build-iso-simple.mjs) and the exploded fab (build-fab.mjs) move on the same clock and the same curves.
   House motion rules these enforce:
   - one part moves, the part that acts (slide, lift, lower, settle, rock, seat), by translate or rotate only;
     nothing scales, nothing zooms (the crane's falls lengthening along themselves is the one allowed stretch)
   - every loop starts and ends on the rest pose with a hold either side, so the seam is still and invisible
   - every curve leaves and arrives with zero velocity (y1 = 0, y2 = 1), so holds join without a kink
   - 4 to 7 s per loop, and the six run on different lengths so a row of them never pulses in step
   - stopped under prefers-reduced-motion; the still twin is the rest pose
   A loop is a list of keys [percent, amount, curve for the segment that starts here]. */

export const CURVE = {
  go: 'cubic-bezier(.5,0,.2,1)',      // a hand slides a part: firm start, long soft arrival
  back: 'cubic-bezier(.5,0,.25,1)',   // the return, a touch quicker to land
  lift: 'cubic-bezier(.45,0,.25,1)',  // a load leaving its seat
  set: 'cubic-bezier(.35,0,.15,1)',   // a load set down: most of the travel early, a long settle onto the seat
  lower: 'cubic-bezier(.4,0,.2,1)',   // paying out on the falls
  raise: 'cubic-bezier(.5,0,.3,1)',
  pull: 'cubic-bezier(.55,0,.25,1)',  // effort on a spanner: slow to start, eases off at the end of the throw
  drop: 'cubic-bezier(.55,0,.35,1)',  // a needle falling back to zero
  sweep: 'cubic-bezier(.3,0,.25,1)',  // a needle driven up the dial
  sine: 'cubic-bezier(.37,0,.63,1)',  // one half swing of a damped needle
};

export const LOOPS = {
  // the set square slides along the rule and back
  design: { dur: 6.0, keys: [[0, 0], [16, 0, 'go'], [44, 1], [58, 1, 'back'], [88, 0], [100, 0]] },
  // the load lifts on the forks, holds, and is set back down
  procure: { dur: 5.6, keys: [[0, 0], [16, 0, 'lift'], [42, 1], [58, 1, 'set'], [84, 0], [100, 0]] },
  // the hook pays out and lowers the beam, holds, and takes it back up
  construct: { dur: 6.4, keys: [[0, 0], [14, 0, 'lower'], [48, 1], [62, 1, 'raise'], [92, 0], [100, 0]] },
  // the needle falls to zero, waits, is driven up past its reading and settles in three shrinking half swings
  commission: { dur: 6.0, keys: [[0, 0.62], [10, 0.62, 'drop'], [24, 0], [30, 0, 'sweep'], [50, 0.72, 'sine'], [58, 0.585, 'sine'], [66, 0.632, 'sine'], [74, 0.62], [100, 0.62]] },
  // the spanner is pulled through its throw on the nut and returned
  maintain: { dur: 5.2, keys: [[0, 0], [16, 0, 'pull'], [46, 1], [56, 1, 'back'], [80, 0], [100, 0]] },
  // the spool lifts off its seat at the tool port, holds, and is seated again
  hookup: { dur: 5.6, keys: [[0, 0], [16, 0, 'lift'], [40, 1], [56, 1, 'set'], [84, 0], [100, 0]] },
};

const RM = '@media (prefers-reduced-motion:reduce){.mv,.mv2,.mv3,.mv4{animation:none!important}}';

/* @keyframes for one loop: fmt(amount) returns the transform for that amount */
export function keyframes(name, loop, fmt) {
  const body = loop.keys.map(([pc, a, c]) => `${pc}%{transform:${fmt(a)}${c ? `;animation-timing-function:${CURVE[c]}` : ''}}`).join('');
  return `@keyframes ${name}{${body}}`;
}
/* the rule for a class running one loop; linear at the top level so each key's own curve governs its segment */
export function run(cls, name, loop, fmt, delay = 0) {
  return `.${cls}{animation:${name} ${loop.dur}s linear ${delay ? `${delay}s ` : ''}infinite}` + keyframes(name, loop, fmt);
}
export const translate = (dx, dy) => a => `translate(${(dx * a).toFixed(2)}px,${(dy * a).toFixed(2)}px)`;
export const rotate = deg => a => `rotate(${(deg * a).toFixed(2)}deg)`;
export { RM };

/* the exploded fab (build-fab.mjs): the four trays are set down one after another, foundation first, each lifting a
   little and settling back onto its place, then the drawing rests for over half the loop. Translate only. */
export const FAB = { dur: 7.0, lift: 18 };
export function fabTray(i) {
  const s = 8 + 7 * i;
  return { dur: FAB.dur, keys: [[0, 0], [s, 0, 'lift'], [s + 9, 1], [s + 12, 1, 'set'], [s + 27, 0], [100, 0]] };
}
