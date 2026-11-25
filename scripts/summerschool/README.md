# Summer school hero demo: source and build

The interactive SO-101 arm in the hero of `static/summerschool/index.html` is built from the files here.
This folder is not part of the Docusaurus build; its outputs are committed under `static/summerschool/`.

```sh
cd scripts/summerschool
npm install
npm test             # unit tests for the game logic (Node, no browser)
npm run build        # model + bundle
```

| Source (this folder)    | Output (`static/summerschool/`) | Command          |
| ----------------------- | ------------------------------- | ---------------- |
| `hero.js` + modules, `three` | `hero.js` (minified bundle) | `npm run bundle` |
| `so101.full.json`       | `so101.json` (decimated model)  | `npm run model`  |
| the live scene          | `hero-poster.webp`              | manual, see below |

Edit the sources here, never the generated `static/summerschool/hero.js`. three.js is pinned to r160.

## What the demo does

Move the cursor and the gripper follows; click to grab a cube, click again to put it down.

- **Stacking.** Three cubes. A drop within 2.2 cm of a cube stacks on it and snaps into place; only the top cube of
  a stack can be picked up.
- **Record / Replay.** Record captures your moves and clicks; Replay resets the scene to how it was and the arm
  repeats them on its own ("policy running"). Replay waits for the arm instead of trusting timing, so it stays in
  sync at any frame rate.
- **Idle autoplay.** After 3.5 s without input the arm builds and dismantles a tower by itself, for up to 45 s.
  Any pointer movement takes control back. Off for `prefers-reduced-motion`, while the hero is off screen, and
  during record/replay/challenge/camera.
- **Challenge.** Put each cube on its matching coloured square against the clock (60 s cap). The best time is
  kept in `localStorage`.
- **Drag to rotate** the camera (clamped). Reset also restores the view.
- **Easter eggs.** Click the robot's base and it waves. Hold the gripper still over a cube for 3 s and it wiggles.
- **Hands.** The camera button turns on hand control: index finger and thumb steer, pinch grabs, open lets go.

## Layout

| File           | Role                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------ |
| `sim.js`       | The game: arm state machine, cubes, stacking, zones. No DOM or three.js, so it is unit-tested. |
| `ik.js`        | Inverse kinematics and the reach geometry.                                                 |
| `player.js`    | `Recorder` and `Player`: record input events, replay or script them through `setGoal`/`press`. |
| `script.js`    | The autoplay sequences (build / dismantle the tower).                                      |
| `hand-math.js` | Landmarks to pointer and pinch (pure, tested).                                             |
| `hands.js`     | Camera + MediaPipe, loaded only on demand.                                                 |
| `ui.js`        | Toolbar, status line and camera preview; injects its own CSS.                              |
| `robot.js`     | Builds the robot from the model JSON.                                                      |
| `hero.js`      | Connects everything to three.js and the page.                                              |

Every input source (mouse, touch, hand, a recorded episode, the autoplay) drives the sim through the same two
calls, `setGoal(x, z)` and `press()`.

## Things worth knowing

- **Grip geometry was measured, not guessed.** The jaw pads are 24 mm apart (= the cube) at a gripper angle of
  `GRIP_HELD = 0.12`, and the pads' midpoint is the sim's tip point. Over 100 positions in the workspace the held
  cube stays within 0.7 mm of the jaw centre.
- **Carry height matters.** The wrist joint saturates (1.65 rad) if the arm works much higher than
  `CARRY_Y = 0.068` at the ends of its reach; the gripper then tilts and the cube no longer sits between the jaws.
  `test/sim.test.mjs` guards this, so re-run `npm test` after touching heights or reach.
- **Scene size.** `ZOOM` in `hero.js` scales the whole scene (1.2 = 20% bigger than the original framing).
- **Resolution adapts.** If frames stay slower than 30 ms the canvas drops its pixel ratio instead of stuttering.
- **Phones.** Under 640 px the controls get their own strip below the scene.

## Hand control: what it loads and why

Nothing loads until the visitor presses the camera button, and the browser then asks for camera permission. The
video is processed in the browser; no frame is uploaded. MediaPipe Hand Landmarker comes from jsDelivr
(`@mediapipe/tasks-vision@1.2.3`, about 15 MB of WebAssembly) and its model from Google's model bucket (about
8 MB), about 22 MB in all, pinned to those versions. The camera is switched off when the hero scrolls out of view.
To avoid the third-party hosts, copy the wasm and the model into `static/summerschool/` and point `BASE` and
`MODEL_URL` in `hands.js` at them (adds about 22 MB to the repository).

## Model

`so101.full.json` is the full-resolution SO-101 (about 121k triangles): per link, 16-bit quantised meshes
(`lo`/`span` bounds, base64 `p` positions and `i` indices) plus the joint tree from the URDF.
`simplify-so101.mjs` decimates the meshes with meshoptimizer (`--ratio` is the fraction of triangles kept,
default 0.15; `--error` the maximum deviation relative to each mesh, default 0.01) and copies the joints through.
At the hero's display size it is visually indistinguishable from the full model.

The robot design is the open-source **SO-101** from The Robot Studio
(<https://github.com/TheRobotStudio/SO-ARM100>), Apache-2.0. The page footer credits it.

Provenance note: `so101.full.json` was converted from the SO-101 URDF and STL meshes before this folder existed,
and the original converter script was not kept. The decimation step does not depend on it.

## Fallback poster

`hero-poster.webp` is shown only if WebGL or the model fails to load (it is not downloaded otherwise). To
regenerate it after changing the scene, serve `static/`, open the page, and in the browser console:

```js
const h = window.summerSchoolHero;
h.stopAutoplay(); h.resetWorld({ instant: true });   // the starting layout
h.hud.root.style.visibility = 'hidden'; h.syncScene(); h.draw();   // draw() must run in the same task as toBlob
const cr = h.canvas.getBoundingClientRect(), ar = h.frameRect();
const k = h.canvas.width / h.canvas.clientWidth;
const out = document.createElement('canvas');
out.width = Math.round(ar.width * k); out.height = Math.round(ar.height * k);
out.getContext('2d').drawImage(h.canvas, (ar.left - cr.left) * k, (ar.top - cr.top) * k, out.width, out.height, 0, 0, out.width, out.height);
out.toBlob((b) => { /* download or POST b */ }, 'image/webp', 0.85);
```

Then shrink it: `cwebp -q 80 -alpha_q 80 -resize 640 0 in.webp -o hero-poster.webp`.
