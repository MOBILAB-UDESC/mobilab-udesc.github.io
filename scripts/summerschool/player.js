// Event-driven input for the sim: records what a user does, and plays a recorded or scripted
// sequence back through the same setGoal/press calls.
//
// Events: { t, type: 'goal', x, z } | { t, type: 'press' } | { t, type: 'end' }, t in seconds.
//
// Playback does not depend on frame timing. An event that the arm cannot accept yet (for example a
// press while it is still opening its gripper) holds the clock until it can, so a replay stays in sync
// with the cubes however the frame rate differs from the recording.

export class Player {
  constructor(sim, events) {
    this.sim = sim;
    this.events = events;
    this.i = 0;
    this.clock = 0;
    this.done = false;
  }

  update(dt) {
    let budget = dt;
    while (!this.done) {
      const e = this.events[this.i];
      if (!e) {
        this.done = true;
        break;
      }
      const wait = e.t - this.clock;
      if (wait > 1e-9) {
        const step = Math.min(wait, budget);
        this.clock += step;
        budget -= step;
        if (e.t - this.clock > 1e-9) break; // not due yet
      }
      if (!this.apply(e)) break; // due but the arm cannot take it yet: hold the clock
      this.i++;
    }
  }

  apply(e) {
    switch (e.type) {
      case 'goal':
        return this.sim.setGoal(e.x, e.z);
      case 'press':
        return this.sim.press();
      case 'end':
        return this.sim.canAim(); // finished once the last grab or drop has completed
      default:
        return true;
    }
  }
}

export class Recorder {
  constructor(sim, now = () => performance.now() / 1000) {
    this.sim = sim;
    this.now = now;
    this.active = false;
  }

  start() {
    this.snapshot = this.sim.snapshot();
    this.events = [{ t: 0, type: 'goal', x: this.sim.goal.x, z: this.sim.goal.z }];
    this.t0 = this.now();
    this.active = true;
  }

  get elapsed() {
    return this.active ? this.now() - this.t0 : 0;
  }

  /** Call after the sim accepted a goal. Dense mouse movement is thinned to about 25 samples a second. */
  goal(x, z) {
    if (!this.active) return;
    const t = this.elapsed;
    const last = this.events[this.events.length - 1];
    if (last.type === 'goal' && Math.hypot(last.x - x, last.z - z) < 0.0015) return;
    if (last.type === 'goal' && t - last.t < 0.04) {
      last.x = x; // keep the newest position instead of piling up samples
      last.z = z;
      return;
    }
    this.events.push({ t, type: 'goal', x, z });
  }

  /** Call after the sim accepted a press. */
  press() {
    if (this.active) this.events.push({ t: this.elapsed, type: 'press' });
  }

  stop() {
    if (!this.active) return null;
    this.active = false;
    const duration = this.now() - this.t0;
    this.events.push({ t: duration, type: 'end' });
    return { snapshot: this.snapshot, events: this.events, duration };
  }
}
