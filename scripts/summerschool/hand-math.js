// Maths for hand control: turns MediaPipe hand landmarks into a screen point and a pinch state.
// Pure functions so they can be unit-tested without a camera.
//
// Landmarks are normalised image coordinates (x, y in 0..1) as MediaPipe returns them:
// 0 wrist, 4 thumb tip, 8 index tip, 9 middle-finger knuckle.

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/** The pointing position: midway between thumb and index tips, so it does not jump while pinching. */
export function pointerOf(lm) {
  return { x: (lm[4].x + lm[8].x) / 2, y: (lm[4].y + lm[8].y) / 2 };
}

/** Thumb-to-index gap relative to the hand's size, so it works at any distance from the camera. */
export function pinchRatio(lm) {
  return dist(lm[4], lm[8]) / (dist(lm[0], lm[9]) || 1e-6);
}

/** Pinch with hysteresis, so jitter around the threshold does not flicker between grab and release. */
export class PinchDetector {
  constructor(on = 0.3, off = 0.45) {
    this.on = on;
    this.off = off;
    this.pinching = false;
  }

  update(ratio) {
    if (this.pinching) {
      if (ratio > this.off) this.pinching = false;
    } else if (ratio < this.on) {
      this.pinching = true;
    }
    return this.pinching;
  }
}

/**
 * Maps a camera point to a position inside rect. The image is mirrored (moving your hand right moves
 * the pointer right) and only the central part of the camera view is used, so the edges of the
 * workspace are reachable without stretching your arm.
 */
export function mapToRect(p, rect, margin = 0.12) {
  const span = 1 - 2 * margin;
  const u = Math.min(Math.max((1 - p.x - margin) / span, 0), 1);
  const v = Math.min(Math.max((p.y - margin) / span, 0), 1);
  return { x: rect.left + u * rect.width, y: rect.top + v * rect.height };
}

/** Exponential smoothing of a 2D point. */
export class Smoother {
  constructor(alpha = 0.4) {
    this.alpha = alpha;
    this.p = null;
  }

  update(p) {
    this.p = this.p ? { x: this.p.x + (p.x - this.p.x) * this.alpha, y: this.p.y + (p.y - this.p.y) * this.alpha } : { ...p };
    return this.p;
  }

  reset() {
    this.p = null;
  }
}
