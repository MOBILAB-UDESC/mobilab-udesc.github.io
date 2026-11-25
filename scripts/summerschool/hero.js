// Interactive SO-101 demo for the summer school page hero.
//
// Source for static/summerschool/hero.js (bundled with three.js by build.mjs). The page provides
// #hero-stage, #hero-canvas, #hero-anchor and #hero-poster; the controls are added here.
//
// The arm follows the cursor on a ground plane. Click to pick up a cube, click again to put it down;
// stack the three cubes, record an episode and replay it, sort them against the clock, or steer with
// your hand through the camera. When nobody is interacting the arm stacks the cubes by itself.
//
// Layout: sim.js is the game (no DOM), player.js records/replays input, hands.js is the optional
// camera control, ui.js is the toolbar. This file connects them to three.js and the page.

import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  DirectionalLight,
  DoubleSide,
  GridHelper,
  Group,
  HemisphereLight,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Raycaster,
  RingGeometry,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { HandControl, handsSupported } from './hands.js';
import { PAN_X } from './ik.js';
import { Player, Recorder } from './player.js';
import { buildRobot } from './robot.js';
import { buildTowerEvents, dismantleTowerEvents } from './script.js';
import { CUBE, CUBE_DEFS, JOINTS, Sim } from './sim.js';
import { Hud } from './ui.js';

const MODEL_URL = '/summerschool/so101.json';

// On-screen size of the whole scene (robot, cubes, grid): 1 is the original framing, 1.2 is 20% bigger.
const ZOOM = 1.2;

const IDLE_MS = 3500; // without input for this long, the arm starts playing by itself
const AUTOPLAY_MAX_S = 45; // ...and stops after this long, so an idle tab does not burn battery
const RECORD_MAX_S = 45;
const CHALLENGE_LIMIT_S = 60;
const BEST_KEY = 'mobilab-summerschool-best';

// Camera: the default view, and how far a drag may rotate it.
const VIEW = { yaw: 2.44, el: 0.36 };
const YAW_RANGE = 0.8;
const EL_MIN = 0.16;
const EL_MAX = 0.85;
const DRAG_PX = 6;
const SLOW_FRAME_MS = 30; // sustained frames slower than this lower the render resolution

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const easeOut = (t) => 1 - (1 - t) * (1 - t);
const fmt = (s) => `${s.toFixed(1)} s`;
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// Soft radial falloff (opaque centre, transparent edge) used for the ground glow and the fake contact shadows.
function radialTexture(rgb, stops) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  stops.forEach(([at, alpha]) => grad.addColorStop(at, `rgba(${rgb}, ${alpha})`));
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new CanvasTexture(c);
}

function readBest() {
  try {
    const v = parseFloat(localStorage.getItem(BEST_KEY));
    return Number.isFinite(v) ? v : null;
  } catch (e) {
    return null;
  }
}
function writeBest(v) {
  try {
    localStorage.setItem(BEST_KEY, String(v));
  } catch (e) {
    /* private mode: the best time just is not remembered */
  }
}

class SummerSchoolHero {
  constructor({ canvas, anchor, stage, poster }) {
    this.canvas = canvas;
    this.anchor = anchor;
    this.stage = stage;
    this.poster = poster;

    this.sim = new Sim();
    this.recorder = new Recorder(this.sim);
    this.player = null; // plays an episode or the autoplay script
    this.episode = null; // the last recorded episode
    this.render = 'loading'; // loading | 3d | poster
    this.mode = 'play'; // play | record | replay | auto
    this.challenge = null; // { t0, result }
    this.view = { ...VIEW };
    this.viewTarget = { ...VIEW };
    this.visible = true;
    this.grabbed = false;
    this.lastStack = 1;
    this.handsState = 'off';
    this.reducedMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    this.touch = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
  }

  // ---------------------------------------------------------------- setup

  init() {
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.draw());
      this.resizeObserver.observe(this.canvas);
    }
    fetch(MODEL_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`${MODEL_URL}: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
        this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        this.renderer.setPixelRatio(this.pixelRatio);
        this.initScene(data);
        this.render = '3d';
        this.initUi();
        this.start();
        this.scheduleIdle();
      })
      .catch((err) => {
        console.warn('Hero demo falling back to the static poster:', err);
        this.showPoster();
      });
  }

  destroy() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.observer) this.observer.disconnect();
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.hands) this.hands.stop();
    if (this.renderer) this.renderer.dispose();
  }

  showPoster() {
    this.render = 'poster';
    this.canvas.style.display = 'none';
    if (this.poster) {
      // Only fetched now: a hidden <img src> would be downloaded by every visitor.
      this.poster.src = this.poster.dataset.src;
      this.poster.hidden = false;
    }
  }

  initScene(data) {
    const scene = new Scene();
    scene.add(new HemisphereLight(0xffffff, 0x1a4a24, 2.2));
    const sun = new DirectionalLight(0xffffff, 2.6);
    sun.position.set(0.6, 1.2, -0.8);
    scene.add(sun);

    const grid = new GridHelper(0.75, 10, 0x2f5a3c, 0x1d3a26);
    grid.position.set(0.15, -0.004, 0);
    scene.add(grid);

    // The scene sits on a near-black page, so a faint lit ground gives the shadows something to darken.
    const glow = new Mesh(
      new PlaneGeometry(0.8, 0.8),
      new MeshBasicMaterial({ map: radialTexture('52, 128, 72', [[0, 0.26], [0.55, 0.11], [1, 0]]), transparent: true, depthWrite: false }),
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(0.15, -0.006, 0);
    scene.add(glow);

    const robot = buildRobot(data);
    scene.add(robot.root);
    this.joints = robot.joints;
    this.baseMeshes = robot.base;

    // Cubes, and the squares the challenge asks you to put them on.
    const cubeGeometry = new BoxGeometry(CUBE, CUBE, CUBE);
    this.cubeMeshes = CUBE_DEFS.map((d) => {
      const m = new Mesh(cubeGeometry, new MeshStandardMaterial({ color: d.color, roughness: 0.6, metalness: 0 }));
      scene.add(m);
      return m;
    });
    this.zones = CUBE_DEFS.map((d) => {
      const g = new Group();
      g.position.set(d.zone.x, 0.0008, d.zone.z);
      g.rotation.y = -Math.atan2(d.zone.z, d.zone.x - PAN_X); // squares face the base, like a cube dropped there
      g.visible = false;
      const fill = new Mesh(
        new PlaneGeometry(0.034, 0.034),
        new MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.3, depthWrite: false }),
      );
      fill.rotation.x = -Math.PI / 2;
      const h = 0.017;
      const edge = new BufferGeometry();
      edge.setAttribute('position', new BufferAttribute(new Float32Array([-h, 0, -h, h, 0, -h, h, 0, h, -h, 0, h]), 3));
      g.add(fill, new LineLoop(edge, new LineBasicMaterial({ color: d.color })));
      scene.add(g);
      return { group: g, fill };
    });

    this.ring = new Mesh(new RingGeometry(0.02, 0.023, 40), new MeshBasicMaterial({ color: 0x03b05a, side: DoubleSide }));
    this.ring.rotation.x = -Math.PI / 2;
    scene.add(this.ring);

    // Fake contact shadows: soft blobs on the ground under the base, each cube and the gripper tip.
    const shadowMap = radialTexture('0, 0, 0', [[0, 1], [0.5, 0.6], [1, 0]]);
    const blob = () => {
      const m = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false }));
      m.rotation.x = -Math.PI / 2;
      m.position.y = 0.0005;
      scene.add(m);
      return m;
    };
    this.baseShadow = blob();
    this.baseShadow.position.x = 0.017;
    this.baseShadow.scale.set(0.2, 0.17, 1);
    this.baseShadow.material.opacity = 0.9;
    this.cubeShadows = CUBE_DEFS.map(blob);
    this.tipShadow = blob();

    this.scene = scene;
    this.camera = new PerspectiveCamera(35, 4 / 3, 0.01, 10);
    this.ray = new Raycaster();
    this.plane = new Plane(new Vector3(0, 1, 0), -0.012);
    this.hit = new Vector3();
    this.ndc = new Vector2();
    this.syncScene();
  }

  initUi() {
    this.hud = new Hud(this.anchor);
    this.hud.onAction((act) => this.onAction(act));
    this.hands = new HandControl({
      video: this.hud.video,
      overlay: this.hud.overlay,
      getRect: () => this.frameRect(),
      onFrame: (f) => this.onHandFrame(f),
      onStatus: (state) => this.onHandStatus(state),
    });
    if (!handsSupported()) this.hud.button('hands', { hidden: true });

    const s = this.stage;
    s.addEventListener('pointermove', (e) => this.onPointerMove(e));
    s.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    s.addEventListener('pointerup', (e) => this.onPointerUp(e));
    s.addEventListener('pointercancel', () => this.endDrag());
    s.addEventListener('click', (e) => this.onClick(e));

    // Nothing runs while the hero is off screen: no autoplay, and the camera is switched off.
    if (window.IntersectionObserver) {
      this.observer = new IntersectionObserver(([entry]) => {
        this.visible = entry.isIntersecting;
        if (!this.visible) {
          clearTimeout(this.idleTimer);
          if (this.mode === 'auto') this.stopAutoplay();
          if (this.hands) this.hands.stop();
        } else {
          this.start();
          this.scheduleIdle();
        }
        this.updateHud();
      }, { threshold: 0.05 });
      this.observer.observe(s);
    }
    this.updateHud();
  }

  // ---------------------------------------------------------------- loop

  tick(dt) {
    if (this.player) {
      this.player.update(dt);
      if (this.player.done) this.onPlayerDone();
    }
    let busy = this.sim.update(dt);

    const kv = 1 - Math.exp(-dt * 10);
    this.view.yaw += (this.viewTarget.yaw - this.view.yaw) * kv;
    this.view.el += (this.viewTarget.el - this.view.el) * kv;
    busy = busy || Math.abs(this.viewTarget.yaw - this.view.yaw) + Math.abs(this.viewTarget.el - this.view.el) > 0.001;

    this.afterSim();
    this.syncScene();
    this.draw();
    return busy || !!this.player;
  }

  // Render loop: runs only while something is moving, so an idle page costs nothing.
  start() {
    if (this.raf || this.render !== '3d' || !this.visible) return;
    this.last = performance.now();
    const step = (t) => {
      const raw = t - this.last;
      this.last = t;
      this.adaptQuality(raw);
      const dt = Math.min(Math.max(raw / 1000, 0), 0.1); // a slow frame must not turn the sim into slow motion
      const moving = this.tick(dt);
      this.raf = moving && this.visible ? requestAnimationFrame(step) : 0;
    };
    this.raf = requestAnimationFrame(step);
  }

  // The canvas covers the whole hero, which is a lot of pixels on a big or high-density screen. If frames
  // keep taking too long, render at a lower resolution instead of letting the demo stutter.
  adaptQuality(frameMs) {
    if (frameMs > 250) return; // a gap between animations, not a slow frame
    this.frameMs = this.frameMs ? this.frameMs * 0.9 + frameMs * 0.1 : frameMs;
    if (this.frameMs <= SLOW_FRAME_MS) {
      this.slowFrames = 0;
      return;
    }
    if (++this.slowFrames > 20 && this.pixelRatio > 1) {
      this.pixelRatio = Math.max(1, this.pixelRatio * 0.8);
      this.renderer.setPixelRatio(this.pixelRatio);
      this.sizeW = 0; // forces setSize on the next draw
      this.slowFrames = 0;
      this.frameMs = 0;
    }
  }

  syncScene() {
    const s = this.sim;
    JOINTS.forEach((name, i) => {
      const j = this.joints[name];
      if (j) j.group.quaternion.setFromAxisAngle(j.axis, s.pose[i]);
    });

    s.cubes.forEach((c, i) => {
      const m = this.cubeMeshes[i];
      const ap = easeOut(c.appear);
      const sy = (1 - c.squash) * ap;
      m.scale.set((1 + c.squash * 0.5) * ap, sy, (1 + c.squash * 0.5) * ap);
      m.position.set(c.x, c.y - CUBE / 2 + (sy * CUBE) / 2, c.z); // squash keeps the bottom on the surface
      m.rotation.y = c.yaw;

      // The shadow of a stacked cube would be hidden under the stack, so only ground-level or lifted cubes cast one.
      const sh = this.cubeShadows[i];
      const lift = c.held ? c.y - CUBE / 2 : 0;
      sh.visible = c.held || c.level === 0;
      sh.position.set(c.x, 0.0005, c.z);
      sh.scale.set((0.05 + lift * 0.9) * ap, (0.05 + lift * 0.9) * ap, 1);
      sh.material.opacity = Math.max(0.8 - lift * 9, 0.15);
    });

    this.ring.position.set(s.ring.x, s.ring.y, s.ring.z);
    const tip = s.tip;
    this.tipShadow.visible = !s.held;
    this.tipShadow.position.set(tip.x, 0.0005, tip.z);
    this.tipShadow.scale.set(0.04 + tip.y * 0.9, 0.04 + tip.y * 0.9, 1);
    this.tipShadow.material.opacity = Math.max(0.6 - tip.y * 7, 0.12);

    const on = s.challenge ? s.zoneStatus() : null;
    this.zones.forEach((z, i) => {
      z.group.visible = s.challenge;
      if (on) z.fill.material.opacity = on[i].on ? 0.7 : 0.3;
    });
  }

  // The part of #hero-anchor the scene is framed in: its box without the strip reserved for the controls on phones.
  frameRect() {
    const r = this.anchor.getBoundingClientRect();
    const pb = parseFloat(getComputedStyle(this.anchor).paddingBottom) || 0;
    return { left: r.left, top: r.top, width: r.width, height: Math.max(r.height - pb, 0) };
  }

  // The arm is framed inside #hero-anchor; the canvas itself covers the whole hero.
  box() {
    const c = this.canvas;
    const cr = c.getBoundingClientRect();
    const w = c.clientWidth;
    const h = c.clientHeight;
    let ax = w * 0.7;
    let ay = h * 0.5;
    let s = Math.min(w, h) * 0.8;
    if (this.anchor) {
      const ar = this.frameRect();
      if (ar.width && ar.height) {
        ax = ar.left - cr.left + ar.width / 2;
        s = Math.min(ar.width, ar.height);
        // Zooming in grows the scene upwards too; shift it down so the top keeps its original clearance.
        ay = ar.top - cr.top + ar.height / 2 + (ZOOM - 1) * 0.3 * s;
      }
    }
    return { w, h, ax, ay, s };
  }

  draw() {
    if (this.render !== '3d' || !this.renderer || !this.scene) return;
    const b = this.box();
    if (!b.w || !b.h) return;
    if (this.sizeW !== b.w || this.sizeH !== b.h) {
      this.renderer.setSize(b.w, b.h, false);
      this.sizeW = b.w;
      this.sizeH = b.h;
    }
    const cam = this.camera;
    const { yaw, el } = this.view;
    const d = (b.h * 0.56) / (0.6306 * b.s * ZOOM);
    cam.aspect = b.w / b.h;
    cam.setViewOffset(b.w, b.h, b.w / 2 - b.ax, b.h / 2 - b.ay, b.w, b.h);
    cam.position.set(0.15 + Math.sin(yaw) * Math.cos(el) * d, 0.1 + Math.sin(el) * d, Math.cos(yaw) * Math.cos(el) * d);
    cam.lookAt(0.15, 0.1, 0);
    cam.updateMatrixWorld();
    this.renderer.render(this.scene, cam);
    this.canvas.classList.add('is-ready'); // fades the canvas in after the first frame
  }

  // ---------------------------------------------------------------- input to the sim (the only way in)

  goalTo(x, z) {
    const ok = this.sim.setGoal(x, z);
    if (ok) this.recorder.goal(x, z);
    return ok;
  }

  pressInput() {
    const ok = this.sim.press();
    if (ok) this.recorder.press();
    this.start();
    return ok;
  }

  // Where the screen point is on the ground plane, or null.
  groundAt(clientX, clientY) {
    const r = this.canvas.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    this.ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.ndc, this.camera);
    if (this.ray.ray.intersectPlane(this.plane, this.hit) && Math.hypot(this.hit.x, this.hit.z) < 2) return { x: this.hit.x, z: this.hit.z };
    return null;
  }

  // Points the gripper at a screen position.
  aimAt(clientX, clientY) {
    if (this.render !== '3d') return false;
    const p = this.groundAt(clientX, clientY);
    const ok = p ? this.goalTo(p.x, p.z) : false;
    this.start();
    return ok;
  }

  // ---------------------------------------------------------------- pointer, touch and orbit

  isUiTarget(el) {
    return !!(el && el.closest && el.closest('h1,h2,p,a,button,li,span,input,select,textarea,label,nav,#hero-hud'));
  }

  isHud(el) {
    return !!(el && el.closest && el.closest('#hero-hud'));
  }

  inputLocked() {
    return this.mode === 'replay' || this.handsState === 'on';
  }

  onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    this.down = { id: e.pointerId, lx: e.clientX, ly: e.clientY, x: e.clientX, y: e.clientY, orbit: !this.isUiTarget(e.target), dragging: false };
  }

  onPointerMove(e) {
    this.noteInput();
    const d = this.down;
    if (d && d.id === e.pointerId && d.orbit) {
      if (!d.dragging && Math.hypot(e.clientX - d.x, e.clientY - d.y) > DRAG_PX) {
        d.dragging = true;
        this.stage.style.userSelect = 'none';
        if (window.getSelection) getSelection().removeAllRanges();
        try {
          this.stage.setPointerCapture(e.pointerId);
        } catch (err) {
          /* pointer already gone */
        }
      }
      if (d.dragging) {
        this.orbit(e.clientX - d.lx, e.clientY - d.ly);
        d.lx = e.clientX;
        d.ly = e.clientY;
        return;
      }
    }
    // The cursor steers the gripper. Touch has no hover, so it only aims on tap.
    if (e.pointerType === 'touch' || this.inputLocked() || this.isHud(e.target)) return;
    if (this.aimAt(e.clientX, e.clientY)) this.armHover();
  }

  onPointerUp(e) {
    const d = this.down;
    if (d && d.id === e.pointerId && d.dragging) {
      this.swallowClick = true; // the click that follows a drag is not a grab
      setTimeout(() => (this.swallowClick = false), 60);
    }
    this.endDrag();
  }

  endDrag() {
    if (this.down && this.down.dragging) {
      this.stage.style.userSelect = '';
      try {
        this.stage.releasePointerCapture(this.down.id);
      } catch (err) {
        /* not captured */
      }
    }
    this.down = null;
  }

  orbit(dx, dy) {
    const t = this.viewTarget;
    t.yaw = clamp(t.yaw - dx * 0.006, VIEW.yaw - YAW_RANGE, VIEW.yaw + YAW_RANGE);
    t.el = clamp(t.el + dy * 0.004, EL_MIN, EL_MAX);
    this.start();
  }

  // `click` rather than `pointerdown`: on touch screens a scroll that starts inside the hero never
  // becomes a click, and a drag to orbit is swallowed above.
  onClick(e) {
    if (this.swallowClick || this.render !== '3d') return;
    if (e.target.closest && e.target.closest('a, button')) return;
    const selection = window.getSelection && window.getSelection();
    if (selection && !selection.isCollapsed) return; // finishing a text selection is not a click on the demo
    if (this.inputLocked()) return;
    this.noteInput();

    if (this.mode === 'play' && this.clickedBase(e.clientX, e.clientY) && this.sim.startWave()) {
      this.start();
      return;
    }
    this.aimAt(e.clientX, e.clientY);
    this.pressInput();
  }

  clickedBase(clientX, clientY) {
    const r = this.canvas.getBoundingClientRect();
    this.ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.ndc, this.camera);
    return this.ray.intersectObjects(this.baseMeshes, false).length > 0;
  }

  // Easter egg: hold the gripper still over a cube for a few seconds and it wiggles at you.
  armHover() {
    clearTimeout(this.hoverTimer);
    this.hoverTimer = setTimeout(() => {
      const s = this.sim;
      const t = this.mode === 'play' && s.phase === 'free' ? s.pickTarget(s.goal.x, s.goal.z) : null;
      if (t && Math.hypot(t.x - s.goal.x, t.z - s.goal.z) < 0.03 && s.startWiggle()) this.start();
    }, 3000);
  }

  // ---------------------------------------------------------------- idle autoplay

  canAuto() {
    return (
      this.render === '3d' && this.mode === 'play' && !this.challenge && this.handsState === 'off' &&
      this.visible && !document.hidden && !this.reducedMotion
    );
  }

  noteInput() {
    if (this.mode === 'auto') {
      this.stopAutoplay();
      this.updateHud();
    }
    this.scheduleIdle();
  }

  scheduleIdle() {
    clearTimeout(this.idleTimer);
    if (this.canAuto()) this.idleTimer = setTimeout(() => this.startAutoplay(), IDLE_MS);
  }

  startAutoplay() {
    if (!this.canAuto()) return;
    this.mode = 'auto';
    this.autoUntil = performance.now() + AUTOPLAY_MAX_S * 1000;
    this.autoStep = 'build';
    if (!this.sim.atHome()) this.sim.reset(); // start from a clean table
    this.player = new Player(this.sim, buildTowerEvents());
    this.updateHud();
    this.start();
  }

  stopAutoplay() {
    if (this.mode !== 'auto') return;
    this.player = null;
    this.mode = 'play';
  }

  onPlayerDone() {
    this.player = null;
    if (this.mode === 'replay') {
      this.mode = 'play';
      this.flash('Replay finished');
      this.scheduleIdle();
    } else if (this.mode === 'auto') {
      if (performance.now() > this.autoUntil || !this.canAuto()) {
        this.mode = 'play';
      } else {
        this.autoStep = this.autoStep === 'build' ? 'dismantle' : 'build';
        this.player = new Player(this.sim, this.autoStep === 'build' ? buildTowerEvents() : dismantleTowerEvents());
      }
    }
    this.updateHud();
  }

  // ---------------------------------------------------------------- toolbar actions

  onAction(act) {
    this.noteInput();
    ({
      record: () => this.toggleRecord(),
      replay: () => this.toggleReplay(),
      challenge: () => this.toggleChallenge(),
      hands: () => this.toggleHands(),
      reset: () => this.resetWorld(),
    })[act]();
    this.start();
  }

  resetWorld({ instant = false } = {}) {
    this.stopAutoplay();
    this.sim.reset();
    this.viewTarget = { ...VIEW }; // Reset also brings the camera back
    if (instant) this.sim.cubes.forEach((c) => (c.appear = 1));
    if (this.challenge) this.beginChallenge();
    this.syncScene();
    this.updateHud();
  }

  toggleRecord() {
    if (this.mode === 'record') {
      const ep = this.recorder.stop();
      this.mode = 'play';
      const useful = ep && ep.events.some((e) => e.type === 'press');
      if (useful) this.episode = ep;
      this.flash(useful ? `Episode recorded, ${fmt(ep.duration)}. Press Replay` : 'Nothing recorded: grab a cube first');
      this.scheduleIdle();
    } else if (!this.challenge && this.mode !== 'replay') {
      this.stopAutoplay();
      this.recorder.start();
      this.mode = 'record';
      this.flashText = null;
    }
    this.updateHud();
  }

  toggleReplay() {
    if (this.mode === 'replay') {
      this.player = null;
      this.mode = 'play';
      this.scheduleIdle();
    } else if (this.episode && this.mode !== 'record' && !this.challenge) {
      this.stopAutoplay();
      this.sim.restore(this.episode.snapshot);
      this.player = new Player(this.sim, this.episode.events);
      this.mode = 'replay';
      this.flashText = null;
    }
    this.updateHud();
  }

  toggleChallenge() {
    if (this.challenge) {
      this.challenge = null;
      this.sim.challenge = false;
      this.scheduleIdle();
    } else if (this.mode === 'play' || this.mode === 'auto') {
      this.stopAutoplay();
      this.sim.reset();
      this.beginChallenge();
    }
    this.syncScene();
    this.updateHud();
  }

  beginChallenge() {
    this.challenge = { t0: performance.now(), result: null };
    this.sim.challenge = true;
    this.flashText = null;
  }

  checkChallenge() {
    const ch = this.challenge;
    if (!ch || ch.result) return;
    const elapsed = (performance.now() - ch.t0) / 1000;
    const on = this.sim.zoneStatus().filter((z) => z.on).length;
    if (on === CUBE_DEFS.length && this.sim.phase === 'free') {
      const best = readBest();
      if (best === null || elapsed < best) writeBest(elapsed);
      ch.result = { ok: true, time: elapsed, best: best === null ? elapsed : Math.min(best, elapsed) };
      this.updateHud();
    } else if (elapsed >= CHALLENGE_LIMIT_S) {
      ch.result = { ok: false, count: on };
      this.updateHud();
    }
  }

  // ---------------------------------------------------------------- hand control

  toggleHands() {
    if (this.handsState === 'on' || this.handsState === 'loading') {
      this.hands.stop();
    } else if (this.mode !== 'replay') {
      this.stopAutoplay();
      this.hands.start();
    }
  }

  onHandStatus(state) {
    this.handsState = state === 'on' || state === 'loading' ? state : 'off';
    this.handsMessage = {
      loading: 'Starting camera…',
      denied: 'Camera blocked. Allow it in the browser and try again',
      nocamera: 'No camera found',
      error: 'Hand tracking could not start',
    }[state] || null;
    this.hud.showCamera(state === 'on');
    if (state === 'off') this.scheduleIdle();
    this.updateHud();
  }

  onHandFrame({ point, pinching, present }) {
    if (!present) return;
    this.aimAt(point.x, point.y);
    const s = this.sim;
    if (pinching && !this.wasPinching) {
      this.wantGrab = true;
      this.wantRelease = false;
    } else if (!pinching && this.wasPinching) {
      this.wantGrab = false;
      this.wantRelease = true;
    }
    this.wasPinching = pinching;
    if (this.wantGrab && s.phase === 'free' && this.pressInput()) this.wantGrab = false;
    if (this.wantRelease && s.phase === 'carry' && this.pressInput()) this.wantRelease = false;
    if (this.wantRelease && s.phase === 'free') this.wantRelease = false; // missed: nothing to release
  }

  // ---------------------------------------------------------------- status line and buttons

  flash(text) {
    this.flashText = text;
    clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => {
      this.flashText = null;
      this.updateHud();
    }, 4500);
  }

  afterSim() {
    const s = this.sim;
    this.checkChallenge();
    if (s.held && !this.grabbed) {
      this.grabbed = true;
      this.updateHud();
    }
    const stack = s.tallestStack();
    if (stack !== this.lastStack) {
      this.lastStack = stack;
      this.updateHud();
    }
  }

  statusText() {
    const s = this.sim;
    if (this.handsMessage) return [this.handsMessage, ''];
    if (this.mode === 'record') return [`Recording episode, ${clock(this.recorder.elapsed)}`, 'rec'];
    if (this.mode === 'replay') return ['Replaying your episode, policy running', 'ok'];
    if (this.mode === 'auto') return [this.touch ? 'Policy running. Tap to take over' : 'Policy running. Move to take over', 'ok'];
    const ch = this.challenge;
    if (ch) {
      const on = s.zoneStatus().filter((z) => z.on).length;
      if (!ch.result) return [`Challenge, ${fmt(Math.min((performance.now() - ch.t0) / 1000, CHALLENGE_LIMIT_S))}, ${on}/3 on their colour`, ''];
      if (ch.result.ok) return [`Sorted in ${fmt(ch.result.time)}. Best ${fmt(ch.result.best)}`, 'ok'];
      return [`Time is up, ${ch.result.count}/3 sorted`, ''];
    }
    if (this.flashText) return [this.flashText, ''];
    if (this.handsState === 'on') return ['Hand control: pinch to grab, open to let go', 'ok'];
    if (s.tallestStack() >= 3) return ['Tower of 3', 'ok'];
    if (s.tallestStack() === 2) return ['Stacked 2', 'ok'];
    if (!this.grabbed) return [this.touch ? 'Tap to move and grab, drag to rotate' : 'Move to guide the arm, click to grab, drag to rotate', ''];
    return ['Stack the cubes', ''];
  }

  updateHud() {
    const h = this.hud;
    if (!h) return;
    const rec = this.mode === 'record';
    const rep = this.mode === 'replay';
    const ch = !!this.challenge;
    const handsBusy = this.handsState === 'on' || this.handsState === 'loading';
    h.button('record', { label: rec ? 'Stop' : 'Record', pressed: rec, disabled: rep || ch });
    h.button('replay', { label: rep ? 'Stop' : 'Replay', pressed: rep, disabled: (!this.episode && !rep) || rec || ch });
    h.button('challenge', { label: ch ? 'Exit' : 'Challenge', pressed: ch, disabled: rec || rep });
    h.button('hands', { label: handsBusy ? 'Camera off' : 'Hands', pressed: handsBusy, disabled: rep });
    h.button('reset', { disabled: rec || rep });
    const [text, tone] = this.statusText();
    h.status(text, tone);

    // The clock in the status line needs a refresh while it is running, even when nothing is moving.
    const ticking = rec || (ch && !this.challenge.result);
    if (ticking && !this.hudTimer) {
      this.hudTimer = setInterval(() => {
        if (this.mode === 'record' && this.recorder.elapsed > RECORD_MAX_S) this.toggleRecord();
        this.checkChallenge();
        this.updateHud();
      }, 200);
    } else if (!ticking && this.hudTimer) {
      clearInterval(this.hudTimer);
      this.hudTimer = 0;
    }
  }
}

const hero = new SummerSchoolHero({
  canvas: document.getElementById('hero-canvas'),
  anchor: document.getElementById('hero-anchor'),
  stage: document.getElementById('hero-stage'),
  poster: document.getElementById('hero-poster'),
});
// Exposed so scripts/summerschool/README.md can capture the fallback poster from the live scene.
window.summerSchoolHero = hero;
hero.init();
