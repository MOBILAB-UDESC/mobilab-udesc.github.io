// Scripted sequences for the idle autoplay. They are plain Player events: the arm does exactly what a
// user would do with the mouse, so the demo shows the "policy" using the same controls.

import { CUBE_DEFS, TOWER_SPOT } from './sim.js';

function steps(list) {
  const events = [];
  let t = 0;
  for (const p of list) {
    events.push({ t, type: 'goal', x: p.x, z: p.z });
    t += 0.12;
    events.push({ t, type: 'press' });
    t += 0.05;
  }
  return { events, t };
}

/** Picks the three cubes up from their home spots and stacks them. */
export function buildTowerEvents() {
  const list = [];
  CUBE_DEFS.forEach((d) => list.push(d.home, TOWER_SPOT));
  const { events, t } = steps(list);
  events.push({ t: t + 1.4, type: 'end' });
  return events;
}

/** Takes the tower apart from the top and puts every cube back on its home spot. */
export function dismantleTowerEvents() {
  const list = [];
  [...CUBE_DEFS].reverse().forEach((d) => list.push(TOWER_SPOT, d.home));
  const { events, t } = steps(list);
  events.push({ t: t + 1.2, type: 'end' });
  return events;
}
