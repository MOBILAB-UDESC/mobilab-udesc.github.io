// Optional hand control for the hero demo: steer the gripper with your index finger and thumb,
// pinch to grab and release.
//
// Nothing here loads until the visitor presses the camera button. The video is processed in the
// browser by MediaPipe Hand Landmarker; no frame is uploaded anywhere. The MediaPipe code and the
// model (about 22 MB together) come from jsDelivr and Google's model bucket, pinned to a version.

import { PinchDetector, Smoother, mapToRect, pinchRatio, pointerOf } from './hand-math.js';

const VERSION = '1.2.3';
const BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}`;
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const FRAME_MS = 33; // detect at most about 30 times a second
const LOST_MS = 600; // a hand missing this long counts as gone

export const handsSupported = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

let landmarkerPromise = null;

// The model is loaded once and kept, so turning the camera off and on again is quick.
function loadLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FilesetResolver, HandLandmarker } = await import(/* @vite-ignore */ `${BASE}/vision_bundle.mjs`);
      const fileset = await FilesetResolver.forVisionTasks(`${BASE}/wasm`);
      const options = (delegate) => ({
        baseOptions: { modelAssetPath: MODEL_URL, delegate },
        runningMode: 'VIDEO',
        numHands: 1,
      });
      try {
        return await HandLandmarker.createFromOptions(fileset, options('GPU'));
      } catch (err) {
        console.warn('Hand tracking: GPU delegate unavailable, using CPU.', err);
        return HandLandmarker.createFromOptions(fileset, options('CPU'));
      }
    })().catch((err) => {
      landmarkerPromise = null; // allow a retry
      throw err;
    });
  }
  return landmarkerPromise;
}

export class HandControl {
  /**
   * video/overlay: the small camera preview elements. getRect(): the screen rectangle the hand maps onto.
   * onFrame({ point, pinching, present }): point is in client coordinates (null when no hand).
   * onStatus(state, detail): 'loading' | 'on' | 'off' | 'denied' | 'nocamera' | 'error'.
   */
  constructor({ video, overlay, getRect, onFrame, onStatus }) {
    this.video = video;
    this.overlay = overlay;
    this.getRect = getRect;
    this.onFrame = onFrame;
    this.onStatus = onStatus;
    this.running = false;
    this.smoother = new Smoother(0.4);
    this.pinch = new PinchDetector();
  }

  async start() {
    if (this.running || this.starting) return;
    this.starting = true;
    this.onStatus('loading', 'camera');
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: false });
    } catch (err) {
      this.starting = false;
      this.onStatus(err && (err.name === 'NotAllowedError' || err.name === 'SecurityError') ? 'denied' : err && err.name === 'NotFoundError' ? 'nocamera' : 'error', err);
      return;
    }
    this.stream = stream;
    try {
      this.onStatus('loading', 'model');
      this.landmarker = await loadLandmarker();
      this.video.srcObject = stream;
      await this.video.play();
    } catch (err) {
      console.warn('Hand tracking failed to start.', err);
      this.starting = false;
      this.releaseCamera();
      this.onStatus('error', err);
      return;
    }
    if (!this.stream) {
      this.starting = false; // stopped while loading
      return;
    }
    this.starting = false;
    this.running = true;
    this.smoother.reset();
    this.pinch.pinching = false;
    this.lastSeen = performance.now();
    this.lastRun = 0;
    this.lastVideoTime = -1;
    this.onStatus('on');
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    const wasOn = this.running || this.starting;
    this.running = false;
    this.starting = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.releaseCamera();
    this.clearOverlay();
    if (wasOn) {
      this.onFrame({ point: null, pinching: false, present: false });
      this.onStatus('off');
    }
  }

  releaseCamera() {
    if (this.stream) this.stream.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.video.srcObject = null;
  }

  loop = () => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.loop);
    const v = this.video;
    const now = performance.now();
    if (v.readyState < 2 || v.currentTime === this.lastVideoTime || now - this.lastRun < FRAME_MS) return;
    this.lastVideoTime = v.currentTime;
    this.lastRun = now;

    let result;
    try {
      result = this.landmarker.detectForVideo(v, now);
    } catch (err) {
      console.warn('Hand tracking stopped.', err);
      this.stop();
      this.onStatus('error', err);
      return;
    }
    const lm = result.landmarks && result.landmarks[0];
    if (!lm) {
      this.clearOverlay();
      if (now - this.lastSeen > LOST_MS) {
        this.smoother.reset();
        this.pinch.pinching = false;
        this.onFrame({ point: null, pinching: false, present: false });
      }
      return;
    }
    this.lastSeen = now;
    const p = this.smoother.update(pointerOf(lm));
    const pinching = this.pinch.update(pinchRatio(lm));
    this.drawOverlay(lm, pinching);
    this.onFrame({ point: mapToRect(p, this.getRect()), pinching, present: true });
  };

  clearOverlay() {
    const c = this.overlay;
    if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height);
  }

  // Dots on the preview so people can see what is being tracked. The preview is mirrored with CSS.
  drawOverlay(lm, pinching) {
    const c = this.overlay;
    if (!c) return;
    const g = c.getContext('2d');
    g.clearRect(0, 0, c.width, c.height);
    g.fillStyle = 'rgba(242, 244, 241, 0.85)';
    for (const p of lm) {
      g.beginPath();
      g.arc(p.x * c.width, p.y * c.height, 2, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = pinching ? '#e10b1f' : '#03b05a';
    for (const i of [4, 8]) {
      g.beginPath();
      g.arc(lm[i].x * c.width, lm[i].y * c.height, 4, 0, Math.PI * 2);
      g.fill();
    }
  }
}
