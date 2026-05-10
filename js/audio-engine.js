let melodySynth = null;
let bassSynth = null;
let padSynth = null;
let isPlaying = false;
let loopRef = null;
let initialized = false;
let limiter = null;
let masterGain = null;

const MELODY_NOTES = ['E5','G5','A5','B5','D6','E5','A5','G5','B5','D6','E5','G5'];
const BASS_PATTERN  = ['A2','E3','A2','E3','D3','A2','D3','E3'];
const CHORD_VOICINGS = [
  ['A3','C#4','E4'],
  ['D3','F#3','A3'],
  ['E3','G#3','B3'],
  ['A3','C#4','E4']
];

async function initAudio() {
  if (initialized) return;
  await Tone.start();

  masterGain = new Tone.Gain(0.82).toDestination();

  limiter = new Tone.Limiter(-3).connect(masterGain);

  const reverb = new Tone.Reverb({ decay: 4, preDelay: 0.02, wet: 0.28 }).connect(limiter);
  await reverb.ready;

  const chorus = new Tone.Chorus({ frequency: 0.8, delayTime: 2.5, depth: 0.15, wet: 0.18 }).connect(reverb);
  chorus.start();

  melodySynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.12, decay: 0.5, sustain: 0.25, release: 2.2 },
    volume: -14
  }).connect(chorus);

  bassSynth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.2, decay: 0.8, sustain: 0.18, release: 2.5 },
    volume: -26
  }).connect(limiter);

  padSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 2.5, decay: 1.5, sustain: 0.55, release: 5 },
    volume: -32
  }).connect(reverb);

  initialized = true;
}

function playMelodyLoop() {
  let chordBeat = 0;

  const melodyLoop = new Tone.Sequence((time, note) => {
    if (!isPlaying) return;
    const vel = 0.38 + Math.random() * 0.18;
    const dur = Math.random() > 0.4 ? '8n' : '4n';
    melodySynth.triggerAttackRelease(note, dur, time, vel);
  }, MELODY_NOTES, '8n');

  const bassLoop = new Tone.Sequence((time, note) => {
    if (!isPlaying) return;
    bassSynth.triggerAttackRelease(note, '2n', time, 0.42);
  }, BASS_PATTERN, '4n');

  const chordLoop = new Tone.Sequence((time) => {
    if (!isPlaying) return;
    const chord = CHORD_VOICINGS[chordBeat % CHORD_VOICINGS.length];
    padSynth.triggerAttackRelease(chord, '1n', time, 0.22);
    chordBeat++;
  }, [null], '2n');

  melodyLoop.start(0);
  bassLoop.start(0);
  chordLoop.start(0);

  Tone.Transport.bpm.value = 62;
  Tone.Transport.start();

  loopRef = { melodyLoop, bassLoop, chordLoop };
}

async function startMusic() {
  if (isPlaying) return;
  await initAudio();
  isPlaying = true;
  playMelodyLoop();
}

function stopMusic() {
  isPlaying = false;

  if (loopRef) {
    loopRef.melodyLoop.stop();
    loopRef.bassLoop.stop();
    loopRef.chordLoop.stop();
    loopRef.melodyLoop.dispose();
    loopRef.bassLoop.dispose();
    loopRef.chordLoop.dispose();
    loopRef = null;
  }

  Tone.Transport.stop();
  Tone.Transport.cancel();
}

async function toggleMusic() {
  if (isPlaying) {
    stopMusic();
    return false;
  } else {
    await startMusic();
    return true;
  }
}

async function playSuccessChime() {
  await initAudio();
  const now = Tone.now();
  const chime = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 1.8 },
    volume: -10
  }).connect(limiter);

  ['E6','G6','A6','E7'].forEach((note, i) => {
    chime.triggerAttackRelease(note, '8n', now + i * 0.16, 0.55);
  });

  setTimeout(() => chime.dispose(), 3000);
}

async function playErrorTone() {
  await initAudio();
  const now = Tone.now();
  const err = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.05, release: 0.8 },
    volume: -16
  }).connect(limiter);

  err.triggerAttackRelease('D4', '16n', now, 0.28);
  err.triggerAttackRelease('C4', '16n', now + 0.14, 0.22);

  setTimeout(() => err.dispose(), 1500);
}

async function playRewardFanfare() {
  await initAudio();
  const now = Tone.now();

  const fanfare = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.05, decay: 0.4, sustain: 0.3, release: 2.5 },
    volume: -8
  }).connect(limiter);

  const seq = [
    { note: 'A4',  time: 0,    dur: '8n' },
    { note: 'C#5', time: 0.18, dur: '8n' },
    { note: 'E5',  time: 0.36, dur: '8n' },
    { note: 'A5',  time: 0.54, dur: '4n' },
    { note: ['A4','C#5','E5','A5'], time: 0.95, dur: '2n' }
  ];

  seq.forEach(({ note, time, dur }) => {
    fanfare.triggerAttackRelease(note, dur, now + time, 0.62);
  });

  setTimeout(() => fanfare.dispose(), 5000);
}

function initAudioToggle() {
  const btn  = document.getElementById('audio-toggle');
  const icon = btn?.querySelector('.audio-control__icon');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const nowPlaying = await toggleMusic();
    if (icon) icon.textContent = nowPlaying ? '♪' : '♩';
    btn.setAttribute('aria-pressed', String(nowPlaying));
    btn.style.color = nowPlaying ? 'var(--oro-light)' : 'var(--oro)';
  });
}

export {
  initAudio,
  startMusic,
  stopMusic,
  toggleMusic,
  playSuccessChime,
  playErrorTone,
  playRewardFanfare,
  initAudioToggle
};