// On-screen controls for the hero demo: a status line, the toolbar and the camera preview.
// Plain DOM; the styles are injected here so the page markup only needs #hero-anchor.

const CSS = `
#hero-hud{position:absolute;left:0;right:0;bottom:0;z-index:2;display:flex;flex-direction:column;align-items:flex-end;gap:8px;pointer-events:none;font-family:'IBM Plex Mono',monospace}
#hero-hud>*{pointer-events:auto}
.hh-status{margin:0;min-height:1.5em;display:flex;align-items:center;justify-content:flex-end;gap:8px;font-size:12px;line-height:1.4;letter-spacing:.06em;text-transform:uppercase;text-align:right;color:#a8b8ad;text-shadow:0 1px 6px #0a1c10,0 0 2px #0a1c10}
.hh-status[data-tone=rec]{color:#ff7b86}
.hh-status[data-tone=ok]{color:#03b05a}
.hh-status i{flex:none;width:8px;height:8px;border-radius:50%;background:currentColor}
.hh-status[data-tone=rec] i{animation:hh-blink 1s steps(2,jump-none) infinite}
.hh-bar{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px}
.hh-btn{display:inline-flex;align-items:center;gap:7px;min-height:34px;padding:0 12px;border:1px solid #4a6a54;border-radius:4px;background:rgba(10,28,16,.78);color:#d5dad6;font:500 12px/1 'IBM Plex Mono',monospace;letter-spacing:.04em;cursor:pointer}
.hh-btn:hover:not(:disabled){border-color:#03b05a;color:#fff}
.hh-btn:disabled{opacity:.4;cursor:default}
.hh-btn[aria-pressed=true]{border-color:#03b05a;color:#03b05a}
.hh-btn[data-act=record][aria-pressed=true]{border-color:#e10b1f;color:#ff7b86}
.hh-btn:focus-visible{outline:3px solid #03b05a;outline-offset:2px}
.hh-btn i{flex:none;width:8px;height:8px;border-radius:50%;background:#e10b1f}
.hh-btn[hidden]{display:none}
.hh-cam{position:relative;width:128px;border:1px solid #4a6a54;border-radius:4px;background:#0a1c10;overflow:hidden}
.hh-cam[hidden]{display:none}
.hh-cam video,.hh-cam canvas{display:block;width:128px;height:96px;transform:scaleX(-1);object-fit:cover}
.hh-cam canvas{position:absolute;left:0;top:0}
.hh-cam span{display:block;padding:4px 6px;font-size:10px;letter-spacing:.04em;text-transform:uppercase;color:#a8b8ad}
@keyframes hh-blink{to{opacity:.25}}
@media (pointer:coarse){.hh-btn{min-height:44px}}
@media (max-width:640px){
#hero-anchor{padding-bottom:96px}
.hh-status{min-height:2.8em;font-size:11px}
.hh-bar{gap:4px;flex-wrap:nowrap}
.hh-btn{padding:0 8px;font-size:11px;gap:5px}
.hh-btn[data-act=reset] span{font-size:0}
.hh-btn[data-act=reset]::after{content:'\\21BA';font-size:16px;line-height:1}
}
@media (prefers-reduced-motion:reduce){.hh-status[data-tone=rec] i{animation:none}}
`;

const BUTTONS = [
  { act: 'record', label: 'Record', dot: true, title: 'Record an episode of you moving the cubes' },
  { act: 'replay', label: 'Replay', title: 'Replay your episode: the arm repeats it on its own' },
  { act: 'challenge', label: 'Challenge', title: 'Put each cube on its matching square, against the clock' },
  { act: 'hands', label: 'Hands', title: 'Control the arm with your hand using the camera (downloads about 22 MB)' },
  { act: 'reset', label: 'Reset', title: 'Put the cubes back' },
];

export class Hud {
  constructor(anchor) {
    if (!document.getElementById('hero-hud-style')) {
      const style = document.createElement('style');
      style.id = 'hero-hud-style';
      style.textContent = CSS;
      document.head.appendChild(style);
    }
    if (getComputedStyle(anchor).position === 'static') anchor.style.position = 'relative';

    const root = document.createElement('div');
    root.id = 'hero-hud';
    root.innerHTML = `
      <div class="hh-cam" hidden><video playsinline muted></video><canvas width="160" height="120"></canvas><span>Camera on, stays on this device</span></div>
      <p class="hh-status" role="status" aria-live="polite"></p>
      <div class="hh-bar" role="toolbar" aria-label="Demo controls"></div>`;
    const bar = root.querySelector('.hh-bar');
    this.buttons = {};
    for (const b of BUTTONS) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'hh-btn';
      el.dataset.act = b.act;
      el.title = b.title;
      el.innerHTML = `${b.dot ? '<i></i>' : ''}<span>${b.label}</span>`;
      bar.appendChild(el);
      this.buttons[b.act] = el;
    }
    anchor.appendChild(root);

    this.root = root;
    this.statusEl = root.querySelector('.hh-status');
    this.camEl = root.querySelector('.hh-cam');
    this.video = root.querySelector('video');
    this.overlay = root.querySelector('canvas');
    this.handler = () => {};
    bar.addEventListener('click', (e) => {
      const el = e.target.closest('button');
      if (el && !el.disabled) this.handler(el.dataset.act);
    });
  }

  onAction(fn) {
    this.handler = fn;
  }

  /** tone: '' | 'rec' | 'ok'. A dot is shown in front of the text for 'rec'. */
  status(text, tone = '') {
    if (this.statusEl.textContent === text && this.statusEl.dataset.tone === tone) return;
    this.statusEl.dataset.tone = tone;
    this.statusEl.textContent = '';
    if (tone === 'rec') this.statusEl.appendChild(document.createElement('i'));
    this.statusEl.appendChild(document.createTextNode(text));
  }

  button(act, { label, pressed, disabled, hidden } = {}) {
    const el = this.buttons[act];
    if (label !== undefined) el.querySelector('span').textContent = label;
    if (pressed !== undefined) el.setAttribute('aria-pressed', String(pressed));
    if (disabled !== undefined) el.disabled = disabled;
    if (hidden !== undefined) el.hidden = hidden;
  }

  showCamera(on) {
    this.camEl.hidden = !on;
  }
}
