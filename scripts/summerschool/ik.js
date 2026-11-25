// Inverse kinematics for the SO-101 hero demo. Pure math, no three.js.
//
// Coordinates are metres on the ground plane: x forward from the base, z sideways, y up.

export const PAN_X = 0.03884; // shoulder pan axis, offset from the base origin
export const JAW = 0.0115; // fixed jaw tip offset from the wrist axis

const SR = 0.03039;
const SY = 0.1166;
const L1 = 0.116;
const L2 = 0.135;
const L3 = 0.15943;
const T10 = 1.32698;
const T20 = 0.03853;
const T30 = -0.04957;

/** Point at distance r and angle theta (rad) around the shoulder pan axis. */
export const polar = (r, theta) => ({ x: PAN_X + r * Math.cos(theta), z: r * Math.sin(theta) });

// Planar two-link IK for the shoulder/elbow, with the wrist keeping the gripper pointing down.
export function solveIK(tx, ty, tz) {
  const pan = Math.max(-1.9, Math.min(1.9, Math.atan2(tz, tx - PAN_X)));
  let r = Math.hypot(tx - PAN_X, tz);
  r = Math.max(0.12, Math.min(0.24, r));
  let dx = r - SR;
  const dy = ty + L3 - SY;
  let d = Math.hypot(dx, dy);
  const dmax = L1 + L2 - 0.003;
  if (d > dmax) {
    dx = Math.sqrt(Math.max(dmax * dmax - dy * dy, 0.0001));
    d = Math.hypot(dx, dy);
    r = dx + SR;
  }
  const a = Math.atan2(dy, dx);
  const b = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
  const t1 = a + b;
  const t2 = Math.atan2(dy - L1 * Math.sin(t1), dx - L1 * Math.cos(t1));
  const q1 = T10 - t1;
  const q2 = T20 - t2 - q1;
  const q3 = Math.max(-1.65, Math.min(1.65, T30 + Math.PI / 2 - q1 - q2));
  return { q: [pan, q1, q2, q3], x: PAN_X + r * Math.cos(pan), z: r * Math.sin(pan) };
}

/**
 * IK for the fixed jaw tip landing on (x, z) at height y. The target is offset from the wrist axis so the
 * jaw, not the wrist, ends up on the point. Returns the joint angles plus the actual tip (px, pz).
 */
export function tipFor(x, z, y) {
  const m = Math.hypot(x - PAN_X, z) || 1;
  const ik = solveIK(x - (JAW * (x - PAN_X)) / m, y, z - (JAW * z) / m);
  ik.px = ik.x + JAW * Math.cos(ik.q[0]);
  ik.pz = ik.z + JAW * Math.sin(ik.q[0]);
  return ik;
}
