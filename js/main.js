// Application entry point: wires the simulation, renderer and interface together.

import { Game } from './game.js';
import { Renderer } from './render.js';
import { UI } from './ui.js';

function boot() {
  const game = new Game();
  game.renderer = new Renderer(game);
  game.ui = new UI(game);
  game.init();
  window.game = game;
  window.addEventListener('error', (event) => {
    console.error('[vanguard] runtime error', event.error || event.message);
  });
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[vanguard] unhandled rejection', event.reason);
  });
  document.body.classList.add('ready');

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((error) => {
        console.warn('[vanguard] service worker unavailable', error);
      });
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
