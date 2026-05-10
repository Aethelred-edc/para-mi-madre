import { getProfile } from './target-logic.js';
import { playSuccessChime, playErrorTone } from './audio-engine.js';
import { launchSuccessOverlay } from './visuals.js';

const STORAGE_KEY = 'regalo-madres-progress';

let currentStep = 0;
let onComplete  = null;

function saveProgress(step) {
  try {
    const target = getProfile()?._target || 'm';
    const data   = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    data[target] = { step, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {}
}

function loadProgress() {
  try {
    const target = getProfile()?._target || 'm';
    const data   = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const entry  = data[target];
    if (!entry) return 0;
    if (Date.now() - entry.timestamp > 86400000) return 0;
    return entry.step || 0;
  } catch (_) {
    return 0;
  }
}

function clearProgress() {
  try {
    const target = getProfile()?._target || 'm';
    const data   = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    delete data[target];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {}
}

function buildDateChallenge(container) {
  container.innerHTML = '';

  const group  = document.createElement('div');
  group.className = 'date-input-group';

  const input  = document.createElement('input');
  input.type        = 'number';
  input.className   = 'date-input';
  input.placeholder = 'AAAA';
  input.maxLength   = 4;
  input.min         = 1900;
  input.max         = new Date().getFullYear();
  input.inputMode   = 'numeric';
  input.setAttribute('aria-label', 'Año');

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-validate')?.click();
  });

  input.addEventListener('input', () => {
    if (input.value.length > 4) input.value = input.value.slice(0, 4);
  });

  group.appendChild(input);
  container.appendChild(group);
  setTimeout(() => input.focus(), 500);

  return {
    getValue: () => input.value.trim(),
    reset:    () => { input.value = ''; }
  };
}

function buildOptionsChallenge(container, profile) {
  container.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'puzzle-options';
  grid.setAttribute('role',       'group');
  grid.setAttribute('aria-label', 'Opciones de respuesta');

  let selected = null;

  (profile.reto_opciones || []).forEach(opt => {
    const btn = document.createElement('button');
    btn.className  = 'puzzle-option';
    btn.textContent = opt;
    btn.setAttribute('aria-pressed', 'false');

    btn.addEventListener('click', () => {
      grid.querySelectorAll('.puzzle-option').forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed', 'true');
      selected = opt;
    });

    grid.appendChild(btn);
  });

  container.appendChild(grid);

  return {
    getValue: () => selected,
    reset:    () => {
      selected = null;
      grid.querySelectorAll('.puzzle-option').forEach(b => {
        b.classList.remove('selected', 'correct', 'wrong');
        b.setAttribute('aria-pressed', 'false');
      });
    },
    markResult: (correct) => {
      grid.querySelectorAll('.puzzle-option').forEach(b => {
        if (b.classList.contains('selected')) {
          b.classList.add(correct ? 'correct' : 'wrong');
        }
      });
    }
  };
}

function setFeedback(el, message, type) {
  el.textContent = message;
  el.className   = `game__feedback ${type}`;
}

function updateProgress(bar, step, total) {
  bar.style.width = `${Math.round((step / total) * 100)}%`;
}

function transitionToStep(wrapper, renderFn, step) {
  wrapper.classList.add('challenge-exit');
  // Force reflow so the browser sees the opacity:0 state before we change it
  void wrapper.offsetHeight;
  setTimeout(() => {
    renderFn(step);
    wrapper.classList.remove('challenge-exit');
    // Force second reflow before adding enter class
    void wrapper.offsetHeight;
    wrapper.classList.add('challenge-enter');
    setTimeout(() => wrapper.classList.remove('challenge-enter'), 600);
  }, 420);
}

function launchStarBurst() {
  const overlay = document.createElement('div');
  overlay.className = 'star-burst-overlay';

  const symbols = ['★', '✦', '✧', '♥', '✶'];
  const count   = 22;

  for (let i = 0; i < count; i++) {
    const el        = document.createElement('span');
    el.className    = 'star-burst__particle';
    el.textContent  = symbols[Math.floor(Math.random() * symbols.length)];
    const angle     = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const dist      = 70 + Math.random() * 90;
    el.style.setProperty('--tx',    `${Math.cos(angle) * dist}px`);
    el.style.setProperty('--ty',    `${Math.sin(angle) * dist}px`);
    el.style.setProperty('--delay', `${i * 0.03}s`);
    el.style.setProperty('--size',  `${0.8 + Math.random() * 1.2}rem`);
    el.style.color = Math.random() > 0.45
      ? `rgba(232,201,107,${0.7 + Math.random() * 0.3})`
      : `rgba(232,130,154,${0.6 + Math.random() * 0.4})`;
    overlay.appendChild(el);
  }

  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 1600);
}

function initGame(containers, callback) {
  onComplete = callback;
  const profile   = getProfile();
  const savedStep = loadProgress();

  const { instruction, inputArea, hint, feedback, validateBtn, progressBar } = containers;

  const TOTAL   = 2;
  let challengeCtrl = null;
  const wrapper = document.querySelector('.game__wrapper');

  function renderStep(step) {
    currentStep = step;
    saveProgress(step);
    updateProgress(progressBar, step, TOTAL);
    setFeedback(feedback, '', '');

    if (step === 0) {
      instruction.textContent = profile.reto_instruccion  || '';
      hint.textContent        = profile.reto_hint          || 'Solo el año (4 dígitos)';
      challengeCtrl = buildDateChallenge(inputArea);
    } else if (step === 1) {
      instruction.textContent = profile.reto_instruccion_2 || '';
      hint.textContent        = 'Elige una opción';
      challengeCtrl = buildOptionsChallenge(inputArea, profile);
    }
  }

  validateBtn.addEventListener('click', async () => {
    const val = challengeCtrl?.getValue();

    if (!val) {
      setFeedback(feedback, 'Por favor ingresa una respuesta ✦', 'error');
      await playErrorTone();
      return;
    }

    let correct = false;

    if (currentStep === 0) {
      correct = String(val).trim() === String(profile.reto_respuesta || '').trim();
    } else if (currentStep === 1) {
      correct = String(val).trim().toLowerCase() === String(profile.reto_respuesta_2 || '').trim().toLowerCase();
      challengeCtrl?.markResult?.(correct);
    }

    if (correct) {
      setFeedback(feedback, '¡Perfecto! ✦', 'success');
      await playSuccessChime();
      launchStarBurst();
      launchSuccessOverlay(currentStep === 0 ? '★' : '♥');

      if (currentStep < TOTAL - 1) {
        setTimeout(() => transitionToStep(wrapper, renderStep, currentStep + 1), 1000);
      } else {
        updateProgress(progressBar, TOTAL, TOTAL);
        setTimeout(() => {
          clearProgress();
          if (typeof onComplete === 'function') onComplete();
        }, 1100);
      }
    } else {
      setFeedback(feedback, 'Inténtalo de nuevo... ♡', 'error');
      await playErrorTone();

      const inputEl = inputArea.querySelector('input');
      if (inputEl) {
        inputEl.style.borderBottomColor = '#E8829A';
        setTimeout(() => { inputEl.style.borderBottomColor = ''; }, 1200);
      }
    }
  });

  const startStep = savedStep >= TOTAL ? 0 : savedStep;
  renderStep(startStep);
}

export { initGame, loadProgress, saveProgress, clearProgress };