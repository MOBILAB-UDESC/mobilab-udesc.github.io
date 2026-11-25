import test from 'node:test';
import assert from 'node:assert/strict';
import { pointerOf, pinchRatio, PinchDetector, mapToRect, Smoother } from '../hand-math.js';

// A flat open hand: wrist at the bottom, middle knuckle 0.2 above it, thumb and index tips apart.
const hand = (gap) => {
  const lm = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5 }));
  lm[0] = { x: 0.5, y: 0.8 };
  lm[9] = { x: 0.5, y: 0.6 };
  lm[4] = { x: 0.5 - gap / 2, y: 0.4 };
  lm[8] = { x: 0.5 + gap / 2, y: 0.4 };
  return lm;
};

test('pinch ratio is relative to hand size', () => {
  assert.ok(Math.abs(pinchRatio(hand(0.2)) - 1) < 1e-9);
  assert.ok(pinchRatio(hand(0.02)) < 0.15);
});

test('pinch has hysteresis', () => {
  const d = new PinchDetector(0.3, 0.45);
  assert.equal(d.update(0.8), false);
  assert.equal(d.update(0.25), true);
  assert.equal(d.update(0.4), true, 'stays pinched between the thresholds');
  assert.equal(d.update(0.5), false);
  assert.equal(d.update(0.4), false, 'stays open between the thresholds');
});

test('pointer is the midpoint of thumb and index tips', () => {
  const p = pointerOf(hand(0.2));
  assert.ok(Math.abs(p.x - 0.5) < 1e-9 && Math.abs(p.y - 0.4) < 1e-9);
});

test('mapping mirrors horizontally and clamps to the rectangle', () => {
  const rect = { left: 100, top: 50, width: 400, height: 300 };
  const centre = mapToRect({ x: 0.5, y: 0.5 }, rect);
  assert.ok(Math.abs(centre.x - 300) < 1e-9 && Math.abs(centre.y - 200) < 1e-9);
  const handOnImageLeft = mapToRect({ x: 0.2, y: 0.5 }, rect); // image-left is the user's right
  assert.ok(handOnImageLeft.x > centre.x);
  const off = mapToRect({ x: -1, y: 2 }, rect);
  assert.equal(off.x, 500);
  assert.equal(off.y, 350);
});

test('smoother converges without overshoot', () => {
  const s = new Smoother(0.5);
  s.update({ x: 0, y: 0 });
  let p;
  for (let i = 0; i < 20; i++) p = s.update({ x: 10, y: 10 });
  assert.ok(p.x > 9.99 && p.x <= 10);
});
