// ============ BOOTSTRAP ============
import { Game } from './game.js';
import { economy } from './economy.js';
import { audio } from './audio.js';

function fatal(err) {
  console.error(err);
  const el = document.getElementById('fatal');
  if (el) {
    el.classList.remove('hidden');
    document.getElementById('fatal-msg').textContent = String(err?.message || err);
  }
}

try {
  const game = new Game();
  window.__game = game;

  // Resume audio on first interaction (browser autoplay policy)
  const initAudio = () => {
    audio.resume();
    audio.setVolume((economy.profile.settings.volume ?? 65) / 100);
    window.removeEventListener('pointerdown', initAudio);
    window.removeEventListener('keydown', initAudio);
  };
  window.addEventListener('pointerdown', initAudio);
  window.addEventListener('keydown', initAudio);

  // ---- capture / deep-link helpers ----
  const params = new URLSearchParams(location.search);
  const screen = params.get('screen');
  if (screen) {
    setTimeout(() => {
      if (['store', 'wallet', 'loadout', 'dossier'].includes(screen)) game.ui.showOverlay(screen);
    }, 900);
  }
  const play = params.get('play');
  if (play && ['tdm', 'dom', 'blackout'].includes(play)) {
    setTimeout(() => {
      game.ui.selectedMode = play;
      game.startMatch({ debug: true });
      game.countdownRemain = 0.05;
      game.player.pos.set(0, 0, 18);
      game.player.yaw = game.player.lookYaw = 0.08;
      game.player.pitch = game.player.lookPitch = -0.03;
      if (params.get('autofire')) {
        setInterval(() => {
          const p = game.player;
          if (!p || !p.alive) return;
          let best = null, bd = 1e9;
          for (const b of game.bots.list) {
            if (!b.alive || b.team === 'blue') continue;
            const d = Math.hypot(b.pos.x - p.pos.x, b.pos.z - p.pos.z);
            if (d < bd) { bd = d; best = b; }
          }
          if (best) {
            p.lookYaw = Math.atan2(-(best.pos.x - p.pos.x), -(best.pos.z - p.pos.z)) + Math.sin(performance.now() * 0.004) * 0.02;
            p.lookPitch = -0.02;
          }
          game.input.fire = true;
        }, 120);
      }
    }, 1200);
  }
} catch (e) { fatal(e); }
