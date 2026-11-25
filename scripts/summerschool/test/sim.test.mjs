import test from 'node:test';
import assert from 'node:assert/strict';
import { Sim, CUBE_DEFS, TOWER_SPOT, CUBE, LOW, HOVER, APPROACH_Y, CARRY_Y } from '../sim.js';
import { polar, tipFor, PAN_X } from '../ik.js';
import { Player, Recorder } from '../player.js';
import { buildTowerEvents, dismantleTowerEvents } from '../script.js';

const DT = 1 / 60;
// Steps the sim until cond() is true (fails the test after maxSeconds).
function until(sim, cond, maxSeconds = 20, extra = null) {
  for (let t = 0; t < maxSeconds; t += DT) {
    if (extra) extra(DT);
    sim.update(DT);
    if (cond()) return;
  }
  assert.fail('condition not reached in time');
}
const idle = (sim) => until(sim, () => sim.canAim(), 10);
const cube = (sim, id) => sim.cubes.find((c) => c.id === id);
const FREE = polar(0.16, -1.0); // a spot no cube starts on
const home = (id) => CUBE_DEFS.find((d) => d.id === id).home;

function pick(sim, p) {
  sim.setGoal(p.x, p.z);
  assert.ok(sim.press());
  until(sim, () => sim.phase === 'carry');
}
function place(sim, p) {
  sim.setGoal(p.x, p.z);
  assert.ok(sim.press());
  until(sim, () => sim.phase === 'free');
  until(sim, () => !sim.update(DT)); // let the cube settle
}

test('picks a cube up and carries it', () => {
  const sim = new Sim();
  pick(sim, home('red'));
  assert.equal(sim.held, cube(sim, 'red'));
  assert.ok(cube(sim, 'red').held);
});

test('places a cube on the ground where the gripper is', () => {
  const sim = new Sim();
  pick(sim, home('red'));
  place(sim, FREE);
  const red = cube(sim, 'red');
  assert.equal(red.level, 0);
  assert.ok(Math.hypot(red.x - FREE.x, red.z - FREE.z) < 0.01);
  assert.equal(sim.held, null);
});

test('stacks three cubes and snaps them onto each other', () => {
  const sim = new Sim();
  for (const [i, d] of CUBE_DEFS.entries()) {
    pick(sim, d.home);
    // aim a few mm off the stack: it must still snap on
    place(sim, { x: TOWER_SPOT.x + 0.006 * i, z: TOWER_SPOT.z - 0.004 * i });
  }
  assert.deepEqual(CUBE_DEFS.map((d) => cube(sim, d.id).level), [0, 1, 2]);
  const base = cube(sim, 'red');
  for (const id of ['green', 'amber']) {
    assert.ok(Math.hypot(cube(sim, id).x - base.x, cube(sim, id).z - base.z) < 1e-9);
  }
  assert.ok(Math.abs(cube(sim, 'amber').y - (2 * CUBE + CUBE / 2)) < 1e-6, 'amber rests on top of the stack');
  assert.equal(sim.tallestStack(), 3);
});

test('only the top cube of a stack can be picked, and the one below becomes free', () => {
  const sim = new Sim();
  for (const d of CUBE_DEFS) {
    pick(sim, d.home);
    place(sim, TOWER_SPOT);
  }
  pick(sim, TOWER_SPOT);
  assert.equal(sim.held.id, 'amber');
  place(sim, home('amber'));
  pick(sim, TOWER_SPOT);
  assert.equal(sim.held.id, 'green');
});

test('closing on nothing is a miss: the gripper opens again and the wrist wobbles', () => {
  const sim = new Sim();
  sim.setGoal(0.12, -0.15); // far from every cube
  assert.ok(sim.press());
  until(sim, () => sim.phase === 'free');
  assert.equal(sim.held, null);
  assert.ok(sim.wobble > 0.5);
});

test('ignores input while the arm is busy', () => {
  const sim = new Sim();
  sim.setGoal(home('red').x, home('red').z);
  sim.press();
  assert.equal(sim.press(), false);
  assert.equal(sim.setGoal(0.2, 0.2), false);
});

test('snapshot and restore bring back the same scene', () => {
  const sim = new Sim();
  pick(sim, home('green'));
  const snap = sim.snapshot();
  place(sim, FREE);
  sim.restore(snap);
  assert.equal(sim.phase, 'carry');
  assert.equal(sim.held.id, 'green');
  assert.deepEqual(sim.cubes.map((c) => c.level), [0, 0, 0]);
});

test('a recorded episode replays to the same final scene', () => {
  const sim = new Sim();
  let clock = 0;
  const rec = new Recorder(sim, () => clock);
  rec.start();
  const drive = (p, press = true) => {
    // move the cursor in small steps like a mouse, then press
    const g0 = { ...sim.goal };
    for (let i = 1; i <= 10; i++) {
      const x = g0.x + ((p.x - g0.x) * i) / 10, z = g0.z + ((p.z - g0.z) * i) / 10;
      if (sim.setGoal(x, z)) rec.goal(x, z);
      clock += 0.016;
      sim.update(0.016);
    }
    if (press && sim.press()) rec.press();
  };
  drive(home('red'));
  until(sim, () => sim.phase === 'carry', 10, (dt) => (clock += dt));
  drive(FREE);
  until(sim, () => sim.phase === 'free', 10, (dt) => (clock += dt));
  until(sim, () => !sim.update(DT));
  const episode = rec.stop();
  const finalRed = { ...cube(sim, 'red') };
  assert.ok(episode.events.some((e) => e.type === 'press'));

  // replay at a different frame rate
  const sim2 = new Sim();
  sim2.restore(episode.snapshot);
  const player = new Player(sim2, episode.events);
  for (let i = 0; i < 2000 && !player.done; i++) {
    player.update(1 / 30);
    sim2.update(1 / 30);
  }
  assert.ok(player.done, 'replay finished');
  until(sim2, () => !sim2.update(DT));
  const red2 = cube(sim2, 'red');
  assert.equal(red2.level, finalRed.level);
  assert.ok(Math.hypot(red2.x - finalRed.x, red2.z - finalRed.z) < 0.01, 'red ended where it did in the recording');
});

test('autoplay script builds a tower and dismantles it back to the home spots', () => {
  const sim = new Sim();
  const run = (events) => {
    const player = new Player(sim, events);
    for (let i = 0; i < 6000 && !player.done; i++) {
      player.update(DT);
      sim.update(DT);
    }
    assert.ok(player.done, 'script finished');
    until(sim, () => !sim.update(DT));
  };
  assert.ok(sim.atHome());
  run(buildTowerEvents());
  assert.equal(sim.tallestStack(), 3);
  run(dismantleTowerEvents());
  assert.equal(sim.tallestStack(), 1);
  assert.ok(sim.atHome(), 'cubes are back on their home spots');
});

test('challenge snaps a cube to a nearby zone and reports it', () => {
  const sim = new Sim();
  sim.challenge = true;
  const zone = CUBE_DEFS[0].zone;
  pick(sim, home('red'));
  place(sim, { x: zone.x + 0.01, z: zone.z - 0.008 });
  assert.deepEqual(sim.zoneStatus().map((z) => z.on), [true, false, false]);
});

test('waving and wiggling only start when the arm is free', () => {
  const sim = new Sim();
  assert.ok(sim.startWave());
  assert.equal(sim.canAim(), false);
  until(sim, () => sim.canAim());
  pick(sim, home('red'));
  assert.equal(sim.startWave(), false);
  assert.equal(sim.startWiggle(), false);
});

test('the wrist never saturates at any height the arm works at, so the gripper stays vertical over the cube', () => {
  // At its joint limit (1.65 rad) the wrist can no longer keep the gripper pointing down and a carried cube
  // stops sitting between the jaws. Check every working height across the whole reach.
  const heights = [LOW, HOVER, APPROACH_Y, CARRY_Y, LOW + 2 * CUBE + 0.008];
  for (const y of heights) {
    for (let r = 0.12; r <= 0.2401; r += 0.01) {
      const ik = tipFor(PAN_X + r, 0, y);
      assert.ok(Math.abs(ik.q[3]) < 1.62, `wrist at limit for tip height ${y}, reach ${r.toFixed(2)}: ${ik.q[3].toFixed(2)}`);
    }
  }
});

test('carrying clears a stack of two', () => {
  assert.ok(CARRY_Y - 0.008 > 2 * CUBE + 0.005);
});
