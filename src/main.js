import { Game } from './game.js';

const canvas = document.getElementById('game');
const loading = document.getElementById('loading');
const status = document.getElementById('boot-status');

function fail(message, error) {
  console.error(message, error);
  loading?.classList.add('done');
  loading?.classList.add('hidden');
  if (status) {
    status.textContent = message;
    status.classList.add('error');
  }
  const start = document.getElementById('start-screen');
  const play = document.getElementById('btn-play');
  if (start && play) {
    play.disabled = true;
    play.querySelector('.btn-label').textContent = 'OFFLINE';
    play.querySelector('.btn-sub').textContent = 'WEBGL REQUIRED';
  }
}

try {
  window.__game = new Game(canvas);
  status?.classList.add('ready');
} catch (error) {
  fail('TACTICAL LINK FAILED — WEBGL UNAVAILABLE', error);
}
