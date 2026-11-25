// Simulation for the summer school hero demo: the arm, three stackable cubes and the pick-and-place
// state machine. Pure logic, no three.js and no DOM, so it can be unit-tested in Node.
//
// Input is two calls, the same ones whether a mouse, a hand, a recorded episode or the autoplay script
// is driving: setGoal(x, z) points the gripper at a ground position, press() grabs or releases.

import { PAN_X, polar, tipFor } from './ik.js';

export const CUBE = 0.024;
export const LOW = 0.008; // tip height when it touches the ground
export const HOVER = 0.05; // free-moving tip height
// Carrying and approaching happen this high: it clears a stack of two (top at 0.048) with the carried cube's
// bottom 8 mm below the tip. Do not raise it much: the wrist joint hits its limit near 0.088 at the ends of the
// reach, the gripper tilts and the cube no longer sits between the jaws (see the wrist test in test/).
export const APPROACH_Y = 0.068;
export const CARRY_Y = 0.068;
export const OPEN = 0.65; // gripper angles (rad). 0.65 opens the jaws about 66 mm: enough for a cube, narrow enough
// not to sweep through the cube next to it.
export const CLOSED = 0.08;
// Jaw angle that squeezes a cube instead of closing through it. Measured on the model: the clear gap between
// the jaw pads is 24 mm (= CUBE) at about 0.12 rad, and the pads' midpoint is the tip point used below.
export const GRIP_HELD = 0.12;
export const WRIST_ROLL = 0; // the demo never rolls the wrist
export const JOINTS = ['shoulder_pan', 'shoulder_lift', 'elbow_flex', 'wrist_flex', 'wrist_roll', 'gripper'];

const GRAB_RADIUS = 0.05; // a click this close to a cube grabs it
const SNAP = 0.022; // a drop this close to a cube stacks on it
const ZONE_SNAP = 0.03; // challenge: a drop this close to a zone centres on it
const ZONE_HIT = 0.016; // challenge: a cube this close to its zone counts
const RELEASE_GAP = 0.008; // cubes are released this high and drop onto the surface
const GRAVITY = 0.8; // slow motion, so the little drop is visible
const WAVE_Y = 0.17;
const REST_Y = CUBE / 2;

export const CUBE_DEFS = [
  { id: 'red', color: 0xe10b1f, home: polar(0.2, 0.85), zone: polar(0.19, -0.95), yaw: 0.25 },
  { id: 'green', color: 0x03b05a, home: polar(0.2, 0.2), zone: polar(0.21, -0.12), yaw: -0.3 },
  { id: 'amber', color: 0xf5b82e, home: polar(0.2, -0.45), zone: polar(0.2, 0.55), yaw: 0.5 },
];
export const TOWER_SPOT = polar(0.2, 0.5);

const BUSY_PHASES = ['grab', 'drop', 'open'];

export class Sim {
  constructor() {
    this.time = 0;
    this.challenge = false;
    this.reset();
  }

  /** Puts the cubes back on their home spots and the arm in its starting pose. */
  reset() {
    this.goal = { x: 0.2, z: -0.04 };
    this.cur = { x: 0.2, z: -0.04, y: HOVER, g: OPEN };
    this.phase = 'free'; // free | grab | carry | drop | open
    this.held = null;
    this.grabTarget = null;
    this.wave = null;
    this.wiggle = 0;
    this.wobble = 0;
    this.releaseY = HOVER;
    this.cubes = CUBE_DEFS.map((d) => ({
      id: d.id,
      x: d.home.x,
      z: d.home.z,
      yaw: d.yaw,
      level: 0,
      y: REST_Y,
      vy: 0,
      squash: 0,
      appear: 0,
      held: false,
    }));
    this.update(0);
  }

  // ---- state capture, used to replay a recorded episode from the same starting scene ----

  snapshot() {
    return {
      cubes: this.cubes.map((c) => ({ ...c })),
      cur: { ...this.cur },
      goal: { ...this.goal },
      phase: this.phase === 'carry' || this.phase === 'drop' ? 'carry' : 'free',
      heldId: this.held ? this.held.id : null,
    };
  }

  restore(snap) {
    this.cubes = snap.cubes.map((c) => ({ ...c, vy: 0, squash: 0, appear: 1, y: c.held ? c.y : c.level * CUBE + REST_Y }));
    this.cur = { ...snap.cur };
    this.goal = { ...snap.goal };
    this.phase = snap.phase;
    this.held = snap.heldId ? this.cubes.find((c) => c.id === snap.heldId) : null;
    if (!this.held && this.phase === 'carry') this.phase = 'free';
    this.grabTarget = null;
    this.wave = null;
    this.wiggle = 0;
    this.wobble = 0;
    this.update(0);
  }

  // ---- input ----

  canAim() {
    return !this.wave && (this.phase === 'free' || this.phase === 'carry');
  }

  canPress() {
    return this.canAim();
  }

  /** Points the gripper at (x, z). Returns false if the arm is busy and ignored it. */
  setGoal(x, z) {
    if (!this.canAim()) return false;
    this.goal.x = x;
    this.goal.z = z;
    this.wiggle = 0;
    return true;
  }

  /** Grabs the cube under the goal, or releases the carried one. Returns false if ignored. */
  press() {
    if (!this.canPress()) return false;
    if (this.phase === 'carry') {
      this.phase = 'drop';
      return true;
    }
    const target = this.pickTarget(this.goal.x, this.goal.z);
    if (target) {
      this.goal.x = target.x;
      this.goal.z = target.z;
    }
    this.grabTarget = target;
    this.phase = 'grab';
    return true;
  }

  startWave() {
    if (this.phase !== 'free' || this.wave) return false;
    this.wave = { t: 0, dur: 2.6 };
    return true;
  }

  startWiggle() {
    if (this.phase !== 'free' || this.wave) return false;
    this.wiggle = 1.1;
    return true;
  }

  // ---- queries ----

  isTop(c) {
    return !this.cubes.some((o) => o !== c && !o.held && o.level === c.level + 1 && Math.hypot(o.x - c.x, o.z - c.z) < SNAP);
  }

  /** The nearest cube with nothing on top within reach of (x, z), or null. */
  pickTarget(x, z) {
    let best = null;
    let bestD = GRAB_RADIUS;
    for (const c of this.cubes) {
      if (c.held || !this.isTop(c)) continue;
      const d = Math.hypot(c.x - x, c.z - z);
      if (d < bestD || (d === bestD && best && c.level > best.level)) {
        best = c;
        bestD = d;
      }
    }
    return best;
  }

  /** The topmost cube a cube released at (x, z) would land on, or null for the ground. */
  stackTop(x, z, exclude) {
    let top = null;
    for (const c of this.cubes) {
      if (c === exclude || c.held) continue;
      if (Math.hypot(c.x - x, c.z - z) < SNAP && (!top || c.level > top.level)) top = c;
    }
    return top;
  }

  /** Cubes sitting on their own coloured zone (only meaningful in the challenge). */
  zoneStatus() {
    return CUBE_DEFS.map((d) => {
      const c = this.cubes.find((cb) => cb.id === d.id);
      return { id: d.id, on: !c.held && c.level === 0 && Math.hypot(c.x - d.zone.x, c.z - d.zone.z) < ZONE_HIT };
    });
  }

  /** Number of cubes in the tallest stack on the ground (1 when nothing is stacked). */
  tallestStack() {
    return this.cubes.reduce((m, c) => (c.held ? m : Math.max(m, c.level + 1)), 0);
  }

  /** True when every cube is on the ground, each within a few cm of its home spot. */
  atHome() {
    return CUBE_DEFS.every((d) => {
      const c = this.cubes.find((cb) => cb.id === d.id);
      return !c.held && c.level === 0 && Math.hypot(c.x - d.home.x, c.z - d.home.z) < 0.03;
    });
  }

  // ---- stepping ----

  /** Advances the simulation by dt seconds. Returns true while anything is still moving. */
  update(dt) {
    this.time += dt;
    const c = this.cur;
    const k = 1 - Math.exp(-dt * 8);

    if (this.wave) {
      this.wave.t += dt;
      this.goal.x = 0.17;
      this.goal.z = 0.075 * Math.sin(this.wave.t * 5.5);
      if (this.wave.t >= this.wave.dur) this.wave = null;
    }
    c.x += (this.goal.x - c.x) * k;
    c.z += (this.goal.z - c.z) * k;

    let ik = tipFor(c.x, c.z, c.y);
    const there = Math.hypot(this.goal.x - c.x, this.goal.z - c.z) < 0.004;
    let yT = HOVER;
    let gT = OPEN;

    if (this.wave) {
      yT = WAVE_Y;
      gT = 0.5 + 0.4 * Math.sin(this.wave.t * 11);
    } else {
      switch (this.phase) {
        case 'grab': {
          const level = this.grabTarget ? this.grabTarget.level : 0;
          const low = LOW + level * CUBE;
          yT = there ? low : APPROACH_Y;
          const down = Math.abs(c.y - low) < 0.003;
          if (there && down) gT = this.grabTarget ? GRIP_HELD : CLOSED;
          if (there && down && c.g < gT + 0.03) {
            const t = this.grabTarget;
            if (t && Math.hypot(ik.px - t.x, ik.pz - t.z) < 0.02) {
              this.held = t;
              t.held = true;
              this.phase = 'carry';
            } else {
              this.phase = 'free';
              this.wobble = 1; // closed on nothing
            }
            this.grabTarget = null;
          }
          break;
        }
        case 'carry':
          yT = CARRY_Y;
          gT = GRIP_HELD;
          break;
        case 'drop': {
          gT = GRIP_HELD;
          const base = this.stackTop(ik.px, ik.pz, this.held);
          const dropY = LOW + (base ? base.level + 1 : 0) * CUBE + RELEASE_GAP;
          yT = there ? dropY : CARRY_Y;
          if (there && Math.abs(c.y - dropY) < 0.003) this.release(ik, base);
          break;
        }
        case 'open':
          yT = this.releaseY;
          if (c.g > OPEN - 0.2) this.phase = 'free';
          break;
        default:
          if (this.wiggle > 0) {
            yT = HOVER - 0.012;
            gT = 0.55 + 0.35 * Math.sin(this.time * 20);
          }
          break;
      }
    }
    if (this.wiggle > 0) this.wiggle = Math.max(this.wiggle - dt, 0);

    c.y += (yT - c.y) * k;
    c.g += (gT - c.g) * Math.min(1, k * 1.6);
    ik = tipFor(c.x, c.z, c.y);

    const wobbleAdd = this.wobble * 0.25 * Math.sin(this.time * 40);
    this.wobble = this.wobble > 0.02 ? this.wobble * Math.exp(-dt * 4) : 0;
    this.pose = [ik.q[0], ik.q[1], ik.q[2], ik.q[3] + wobbleAdd, WRIST_ROLL, c.g];
    this.tip = { x: ik.px, z: ik.pz, y: c.y };

    if (this.held) {
      this.held.x = ik.px;
      this.held.z = ik.pz;
      this.held.y = c.y + 0.004;
      this.held.yaw = -ik.q[0];
    }
    const cubesBusy = this.stepCubes(dt);

    // Where the gripper will land: on the ground, or on top of the stack it is carrying a cube over.
    const target = tipFor(this.goal.x, this.goal.z, LOW);
    const over = this.phase === 'carry' || this.phase === 'drop' ? this.stackTop(target.px, target.pz, this.held) : null;
    this.ring = { x: target.px, z: target.pz, y: (over ? over.level + 1 : 0) * CUBE + 0.001 };

    const settling =
      Math.abs(this.goal.x - c.x) + Math.abs(this.goal.z - c.z) + Math.abs(yT - c.y) + Math.abs(gT - c.g) > 0.0015;
    return BUSY_PHASES.includes(this.phase) || !!this.wave || this.wiggle > 0 || this.wobble > 0 || settling || cubesBusy;
  }

  release(ik, base) {
    const h = this.held;
    h.held = false;
    if (base) {
      h.x = base.x;
      h.z = base.z;
      h.yaw = base.yaw;
      h.level = base.level + 1;
    } else {
      h.x = ik.px;
      h.z = ik.pz;
      h.yaw = -ik.q[0];
      h.level = 0;
      if (this.challenge) {
        for (const d of CUBE_DEFS) {
          if (Math.hypot(h.x - d.zone.x, h.z - d.zone.z) < ZONE_SNAP) {
            h.x = d.zone.x;
            h.z = d.zone.z;
            h.yaw = -Math.atan2(d.zone.z, d.zone.x - PAN_X); // same facing as a cube dropped by the arm
            break;
          }
        }
      }
    }
    h.vy = 0;
    this.releaseY = this.cur.y;
    this.held = null;
    this.phase = 'open';
  }

  // Cubes fall onto whatever they were released over, bounce a little and squash on impact.
  stepCubes(dt) {
    let busy = false;
    for (const cb of this.cubes) {
      if (cb.appear < 1) {
        cb.appear = Math.min(1, cb.appear + dt * 4);
        busy = true;
      }
      if (cb.held) continue;
      const rest = cb.level * CUBE + REST_Y;
      if (cb.y > rest + 1e-6 || cb.vy !== 0) {
        cb.vy -= GRAVITY * dt;
        cb.y += cb.vy * dt;
        if (cb.y <= rest) {
          const impact = -cb.vy;
          cb.y = rest;
          if (impact > 0.03) {
            cb.vy = impact * 0.4;
            cb.squash = Math.min(impact * 1.6, 0.2);
          } else {
            cb.vy = 0;
          }
        }
        busy = true;
      } else {
        cb.y = rest;
      }
      cb.squash = cb.squash > 0.002 ? cb.squash * Math.exp(-dt * 12) : 0;
      if (cb.squash > 0) busy = true;
    }
    return busy;
  }
}
