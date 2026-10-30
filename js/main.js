import { GameAudio } from './audio.js';
import { Input } from './input.js';
import { UI } from './ui.js';
import { Game } from './game.js';

const audio = new GameAudio();
const input = new Input();
const ui = new UI(audio, input);
const canvas = document.getElementById('game');
const game = new Game(canvas, input, ui, audio);
ui.attach(game);
window.dust = { game, ui, input, audio };

input.onKeyAction = (action) => {
  if (action === 'pause') {
    if (game.paused) game.setPaused(false);
    else game.setPaused(true);
    return;
  }
  if (game.phase !== 'live' || !game.player || !game.player.alive) return;
  if (action === 'use') game.useDown();
  else if (action === 'report') {
    const ctx = game.getContext();
    if (ctx && ctx.type === 'report') game.reportBody(ctx.body);
  } else if (action === 'knife') game.playerKnife();
  else if (action === 'sabotage') game.playerSabotage();
  else if (action === 'meeting') game.callEmergency();
};

window.addEventListener('keyup', (e) => {
  if (e.key.toLowerCase() === 'e') game.useUp();
});
window.addEventListener('blur', () => {
  if (game.phase === 'live' && !game.paused) game.setPaused(true);
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.phase === 'live' && !game.paused) game.setPaused(true);
});

ui.setTitle(true);
ui.setHUD(false);

let last = performance.now();
let lastUpdate = performance.now();

// The simulation runs on a timer so it stays real-time even when a headless
// browser throttles requestAnimationFrame. Rendering stays on rAF for smoothness.
function tickUpdate() {
  const now = performance.now();
  const dt = Math.min(0.05, Math.max(0, (now - lastUpdate) / 1000));
  lastUpdate = now;
  try { game.update(dt); } catch (err) { console.error(err); }
}
setInterval(tickUpdate, 16);

function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  try {
    game.render();
  } catch (err) {
    console.error(err);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
