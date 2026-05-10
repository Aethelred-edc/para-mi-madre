import { loadProfile, getProfile } from './target-logic.js';
import {
  animatePreloaderRose,
  animateBackgroundRose,
  drawRewardRoses,
  drawMandala,
  spawnHearts,
  spawnPetals,
  spawnRewardPetals,
  initGalaxyCanvas
} from './visuals.js';
import { initGame } from './game-engine.js';
import {
  initAudioToggle,
  playRewardFanfare,
  startMusic
} from './audio-engine.js';

let stopPreloaderAnim = null;
let stopBgAnim        = null;
let stopGalaxyAnim    = null;
let musicStarted      = false;

async function ensureMusicStarted() {
  if (musicStarted) return;
  musicStarted = true;
  await startMusic();
  const audioBtn = document.getElementById('audio-toggle');
  const icon     = audioBtn?.querySelector('.audio-control__icon');
  if (icon) icon.textContent = '♪';
  audioBtn?.setAttribute('aria-pressed', 'true');
  if (audioBtn) audioBtn.style.color = 'var(--oro-light)';
}

function applyProfileContent(profile) {
  const isSuegra = profile._target === 's';

  const greeting    = document.getElementById('intro-greeting');
  const title       = document.getElementById('intro-title');
  const subtitle    = document.getElementById('intro-subtitle');
  const poemAuthor  = document.getElementById('poem-author');
  const poemLabel   = document.getElementById('poem-label');
  const poemText    = document.getElementById('poem-text');
  const rewardTitle = document.getElementById('reward-title');
  const rewardMsg   = document.getElementById('reward-message');

  if (greeting)   greeting.textContent  = profile.saludo || (isSuegra ? '¡Feliz día, Mami!' : '¡Feliz día, Mamá!');
  if (title)      title.textContent     = profile.titulo || '';
  if (subtitle)   subtitle.textContent  = profile.subtitulo || (isSuegra
    ? 'Porque mereces algo especial hoy'
    : 'Un momento solo para ti te espera aquí');
  if (poemLabel)  poemLabel.textContent  = '— Con Amor';
  if (poemAuthor) poemAuthor.textContent = profile.autor || '';
  if (poemText) {
    poemText.textContent = profile.poema || '';
  }
  if (rewardTitle) rewardTitle.textContent = '¡Lo Lograste!';
  if (rewardMsg) {
    rewardMsg.textContent = profile.mensaje_victoria || '';
  }

  document.title = `${profile.titulo || 'Regalo'} ♥`;

  const root = document.documentElement;
  if (profile.color_acento)   root.style.setProperty('--color-acento',   profile.color_acento);
  if (profile.color_primario) root.style.setProperty('--color-primario',  profile.color_primario);
}

function showSection(id) {
  const prev = document.querySelector('.section.active');
  const next = document.getElementById(id);
  if (!next || next === prev) return;

  if (prev) {
    prev.classList.add('exiting');
    prev.setAttribute('aria-hidden', 'true');
    setTimeout(() => prev.classList.remove('active', 'exiting'), 800);
  }

  setTimeout(() => {
    next.classList.add('active');
    next.setAttribute('aria-hidden', 'false');

    if (id === 'section-poem' && !stopGalaxyAnim) {
      const gc = document.getElementById('galaxy-canvas');
      if (gc) stopGalaxyAnim = initGalaxyCanvas(gc);
    }
  }, prev ? 320 : 0);
}

function initFloatingElements() {
  const heartsEl  = document.getElementById('floating-hearts');
  const petalsEl  = document.getElementById('petal-rain');
  if (heartsEl) spawnHearts(heartsEl, 12);
  if (petalsEl)  spawnPetals(petalsEl, 18);
}

function initBackgroundRose() {
  const canvas = document.getElementById('rose-canvas');
  if (!canvas) return;
  stopBgAnim = animateBackgroundRose(canvas);
}

function bindIntroButton() {
  const btn = document.getElementById('btn-start');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    await ensureMusicStarted();
    showSection('section-poem');
  });
}

function bindPoemButton() {
  const btn = document.getElementById('btn-to-game');
  if (!btn) return;
  btn.addEventListener('click', () => showSection('section-game'));
}

function bindGameEngine() {
  initGame(
    {
      instruction: document.getElementById('game-instruction'),
      inputArea:   document.getElementById('game-input-area'),
      hint:        document.getElementById('game-hint'),
      feedback:    document.getElementById('game-feedback'),
      validateBtn: document.getElementById('btn-validate'),
      progressBar: document.getElementById('game-progress-bar')
    },
    async () => {
      await playRewardFanfare();
      showSection('section-reward');

      setTimeout(() => {
        const petalContainer = document.getElementById('reward-petals');
        if (petalContainer) spawnRewardPetals(petalContainer, 40);

        const mandalaCanvas = document.getElementById('mandala-canvas');
        if (mandalaCanvas) {
          mandalaCanvas.width  = mandalaCanvas.offsetWidth  || 360;
          mandalaCanvas.height = mandalaCanvas.offsetHeight || 360;
          drawMandala(mandalaCanvas);
        }

        const rewardCanvas = document.getElementById('reward-canvas');
        if (rewardCanvas) {
          rewardCanvas.width  = rewardCanvas.offsetWidth  || 500;
          rewardCanvas.height = rewardCanvas.offsetHeight || 280;
          drawRewardRoses(rewardCanvas);
        }
      }, 600);
    }
  );
}

async function hidePreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  if (stopPreloaderAnim) stopPreloaderAnim();

  preloader.classList.add('hidden');
  setTimeout(() => preloader.remove(), 900);

  const app = document.getElementById('app');
  if (app) {
    app.removeAttribute('aria-hidden');
    showSection('section-intro');
  }
}

async function init() {
  const preloaderCanvas = document.getElementById('preloader-canvas');
  if (preloaderCanvas) stopPreloaderAnim = animatePreloaderRose(preloaderCanvas);

  initAudioToggle();

  const profile = await loadProfile();

  applyProfileContent(profile);
  initFloatingElements();
  initBackgroundRose();
  bindIntroButton();
  bindPoemButton();
  bindGameEngine();

  const delay = Math.max(0, 2200 - performance.now());
  setTimeout(hidePreloader, delay);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', init);