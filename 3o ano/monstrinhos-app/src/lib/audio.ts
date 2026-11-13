// =====================================================================
// MOTOR DE SOM — tudo é sintetizado com a Web Audio API (sem arquivos).
// =====================================================================
import { ls } from './idb';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

const prefs = ls.get<{ sound: boolean; voice: boolean; volume: number }>('monstrinhos:prefs') ?? { sound: true, voice: false, volume: 0.8 };

export function getPrefs() {
  return { ...prefs };
}
export function setPrefs(p: Partial<typeof prefs>) {
  Object.assign(prefs, p);
  ls.set('monstrinhos:prefs', prefs);
  if (master) master.gain.value = prefs.sound ? prefs.volume : 0;
  if (!prefs.voice) stopSpeech();
}

export function audio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = prefs.sound ? prefs.volume : 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    master.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Destrava o áudio no primeiro toque (exigência dos navegadores). */
export function unlockAudio() {
  const c = audio();
  if (c && c.state === 'suspended') void c.resume();
}

function out() {
  audio();
  return master!;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  s.loop = true;
  return s;
}

function env(g: GainNode, t: number, a: number, peak: number, d: number, end = 0.0001) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
  g.gain.exponentialRampToValueAtTime(end, t + a + d);
}

function tone(c: AudioContext, dest: AudioNode, type: OscillatorType, f0: number, f1: number, t: number, dur: number, vol: number, attack = 0.01) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  env(g, t, attack, vol, dur);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + attack + dur + 0.05);
  return o;
}

function noiseHit(c: AudioContext, dest: AudioNode, filter: BiquadFilterType, freq: number, q: number, t: number, dur: number, vol: number, freqEnd?: number) {
  const n = noise(c);
  const f = c.createBiquadFilter();
  f.type = filter;
  f.frequency.setValueAtTime(freq, t);
  if (freqEnd) f.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
  f.Q.value = q;
  const g = c.createGain();
  env(g, t, 0.005, vol, dur);
  n.connect(f).connect(g).connect(dest);
  n.start(t, Math.random());
  n.stop(t + dur + 0.05);
}

/** Voz "formante" (risadas, miau): serra passando por filtros de vogal. */
function vowel(c: AudioContext, dest: AudioNode, f0: number, f1: number, t: number, dur: number, vol: number, formants: [number, number], attack = 0.02) {
  const o = c.createOscillator();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
  const g = c.createGain();
  env(g, t, attack, vol, dur);
  const mix = c.createGain();
  mix.gain.value = 1;
  for (const fr of formants) {
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = fr;
    bp.Q.value = 6;
    o.connect(bp).connect(mix);
  }
  mix.connect(g).connect(dest);
  o.start(t);
  o.stop(t + dur + attack + 0.05);
}

// ---------------------------------------------------------------- catálogo
export interface SoundDef {
  id: string;
  name: string;
  icon: string;
  cat: 'risadas' | 'rugidos' | 'passos' | 'saltos' | 'magicos' | 'agua' | 'vento' | 'animais' | 'divertidos';
  dur: number;
  play: (c: AudioContext, d: AudioNode, t: number, k: number) => void; // k = multiplicador de altura
}

export const SOUND_CATS: { id: SoundDef['cat']; name: string; icon: string }[] = [
  { id: 'risadas', name: 'Risadas', icon: '😂' },
  { id: 'rugidos', name: 'Rugidos', icon: '🦁' },
  { id: 'passos', name: 'Passos', icon: '👣' },
  { id: 'saltos', name: 'Saltos', icon: '🦘' },
  { id: 'magicos', name: 'Mágicos', icon: '✨' },
  { id: 'agua', name: 'Água', icon: '💧' },
  { id: 'vento', name: 'Vento', icon: '🌬️' },
  { id: 'animais', name: 'Animais', icon: '🐶' },
  { id: 'divertidos', name: 'Divertidos', icon: '🥁' },
];

export const SOUNDS: SoundDef[] = [
  { id: 'risada', name: 'Risada', icon: '😄', cat: 'risadas', dur: 0.9, play: (c, d, t, k) => { for (let i = 0; i < 4; i++) vowel(c, d, 260 * k * (1 - i * 0.05), 230 * k * (1 - i * 0.05), t + i * 0.2, 0.14, 0.5, [800 * k, 1250 * k]); } },
  { id: 'risadinha', name: 'Risadinha', icon: '🤭', cat: 'risadas', dur: 0.8, play: (c, d, t, k) => { for (let i = 0; i < 5; i++) vowel(c, d, 520 * k, 470 * k, t + i * 0.14, 0.09, 0.4, [350 * k, 2300 * k]); } },
  { id: 'gargalhada', name: 'Gargalhada', icon: '🤣', cat: 'risadas', dur: 1.2, play: (c, d, t, k) => { for (let i = 0; i < 4; i++) vowel(c, d, 150 * k, 120 * k, t + i * 0.28, 0.22, 0.6, [550 * k, 900 * k]); } },
  { id: 'rugido', name: 'Rugido', icon: '🦖', cat: 'rugidos', dur: 1.4, play: (c, d, t, k) => {
    const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(110 * k, t); o.frequency.linearRampToValueAtTime(140 * k, t + 0.3); o.frequency.exponentialRampToValueAtTime(60 * k, t + 1.3);
    const lfo = c.createOscillator(); lfo.frequency.value = 28; const lg = c.createGain(); lg.gain.value = 20 * k; lfo.connect(lg).connect(o.frequency);
    const ws = c.createWaveShaper(); const curve = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i / 128 - 1; curve[i] = Math.tanh(x * 4); } ws.curve = curve;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900 * k; const g = c.createGain(); env(g, t, 0.12, 0.6, 1.2);
    o.connect(ws).connect(lp).connect(g).connect(d); o.start(t); lfo.start(t); o.stop(t + 1.4); lfo.stop(t + 1.4);
    noiseHit(c, d, 'lowpass', 600 * k, 1, t, 1.2, 0.3, 200);
  } },
  { id: 'rosnado', name: 'Rosnado', icon: '😾', cat: 'rugidos', dur: 1.1, play: (c, d, t, k) => {
    const o = c.createOscillator(); o.type = 'square'; o.frequency.value = 75 * k;
    const am = c.createOscillator(); am.frequency.value = 18; const ag = c.createGain(); ag.gain.value = 0.5; const g = c.createGain(); g.gain.value = 0.5;
    am.connect(ag).connect(g.gain); const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500 * k; const e = c.createGain(); env(e, t, 0.1, 0.5, 1);
    o.connect(lp).connect(g).connect(e).connect(d); o.start(t); am.start(t); o.stop(t + 1.15); am.stop(t + 1.15);
  } },
  { id: 'rugidinho', name: 'Rugidinho', icon: '🐯', cat: 'rugidos', dur: 0.6, play: (c, d, t, k) => { vowel(c, d, 330 * k, 200 * k, t, 0.5, 0.5, [700 * k, 1100 * k], 0.05); } },
  { id: 'passos', name: 'Passos', icon: '🦶', cat: 'passos', dur: 1, play: (c, d, t, k) => { for (let i = 0; i < 4; i++) { tone(c, d, 'sine', 110 * k, 50 * k, t + i * 0.25, 0.12, 0.7); noiseHit(c, d, 'lowpass', 400 * k, 1, t + i * 0.25, 0.08, 0.3); } } },
  { id: 'passinhos', name: 'Passinhos', icon: '🐾', cat: 'passos', dur: 0.8, play: (c, d, t, k) => { for (let i = 0; i < 6; i++) noiseHit(c, d, 'bandpass', (i % 2 ? 2200 : 1800) * k, 4, t + i * 0.12, 0.04, 0.5); } },
  { id: 'boing', name: 'Boing', icon: '🌀', cat: 'saltos', dur: 0.8, play: (c, d, t, k) => {
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(140 * k, t); o.frequency.exponentialRampToValueAtTime(520 * k, t + 0.25);
    const lfo = c.createOscillator(); lfo.frequency.setValueAtTime(18, t); const lg = c.createGain(); lg.gain.setValueAtTime(90 * k, t); lg.gain.exponentialRampToValueAtTime(1, t + 0.7); lfo.connect(lg).connect(o.frequency);
    const g = c.createGain(); env(g, t, 0.01, 0.6, 0.7); o.connect(g).connect(d); o.start(t); lfo.start(t); o.stop(t + 0.8); lfo.stop(t + 0.8);
  } },
  { id: 'pulo', name: 'Pulo', icon: '⬆️', cat: 'saltos', dur: 0.4, play: (c, d, t, k) => { tone(c, d, 'square', 200 * k, 800 * k, t, 0.25, 0.25); } },
  { id: 'magia', name: 'Magia', icon: '🪄', cat: 'magicos', dur: 1, play: (c, d, t, k) => { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(c, d, 'triangle', f * k, f * k, t + i * 0.07, 0.4, 0.25)); } },
  { id: 'brilho', name: 'Brilho', icon: '✨', cat: 'magicos', dur: 1.2, play: (c, d, t, k) => { [2093, 2637, 3136].forEach((f, i) => tone(c, d, 'sine', f * k, f * k, t + i * 0.12, 0.8, 0.18)); } },
  { id: 'teleporte', name: 'Teletransporte', icon: '🌌', cat: 'magicos', dur: 0.9, play: (c, d, t, k) => { tone(c, d, 'sine', 1800 * k, 120 * k, t, 0.8, 0.35); tone(c, d, 'triangle', 900 * k, 60 * k, t + 0.05, 0.8, 0.2); } },
  { id: 'bolhas', name: 'Bolhas', icon: '🫧', cat: 'agua', dur: 1, play: (c, d, t, k) => { for (let i = 0; i < 7; i++) { const f = (300 + Math.random() * 500) * k; tone(c, d, 'sine', f, f * 2.2, t + i * 0.12 + Math.random() * 0.05, 0.07, 0.35); } } },
  { id: 'splash', name: 'Tchibum', icon: '🌊', cat: 'agua', dur: 0.9, play: (c, d, t, k) => { noiseHit(c, d, 'highpass', 800 * k, 0.7, t, 0.8, 0.6, 3000); tone(c, d, 'sine', 300 * k, 90 * k, t, 0.2, 0.4); } },
  { id: 'gota', name: 'Gotinha', icon: '💧', cat: 'agua', dur: 0.3, play: (c, d, t, k) => { tone(c, d, 'sine', 1400 * k, 500 * k, t, 0.12, 0.5); } },
  { id: 'vento', name: 'Ventania', icon: '🌪️', cat: 'vento', dur: 2, play: (c, d, t, k) => {
    const n = noise(c); const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 3; bp.frequency.setValueAtTime(400 * k, t); bp.frequency.linearRampToValueAtTime(1200 * k, t + 1); bp.frequency.linearRampToValueAtTime(500 * k, t + 2);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.6, t + 0.6); g.gain.linearRampToValueAtTime(0.0001, t + 2);
    n.connect(bp).connect(g).connect(d); n.start(t); n.stop(t + 2.05);
  } },
  { id: 'brisa', name: 'Assobio do vento', icon: '🍃', cat: 'vento', dur: 1.6, play: (c, d, t, k) => { tone(c, d, 'sine', 900 * k, 1300 * k, t, 0.7, 0.12, 0.3); tone(c, d, 'sine', 1300 * k, 800 * k, t + 0.7, 0.8, 0.12, 0.1); noiseHit(c, d, 'bandpass', 1500 * k, 2, t, 1.5, 0.15); } },
  { id: 'miau', name: 'Miau', icon: '🐱', cat: 'animais', dur: 0.8, play: (c, d, t, k) => { vowel(c, d, 500 * k, 680 * k, t, 0.25, 0.45, [900 * k, 1800 * k], 0.04); vowel(c, d, 680 * k, 420 * k, t + 0.25, 0.4, 0.45, [700 * k, 1100 * k]); } },
  { id: 'auau', name: 'Au-au', icon: '🐶', cat: 'animais', dur: 0.7, play: (c, d, t, k) => { for (let i = 0; i < 2; i++) { vowel(c, d, 300 * k, 200 * k, t + i * 0.3, 0.16, 0.6, [700 * k, 1200 * k], 0.005); noiseHit(c, d, 'bandpass', 900 * k, 1, t + i * 0.3, 0.1, 0.3); } } },
  { id: 'piupiu', name: 'Piu-piu', icon: '🐦', cat: 'animais', dur: 0.8, play: (c, d, t, k) => { for (let i = 0; i < 3; i++) tone(c, d, 'sine', 2200 * k, 3400 * k, t + i * 0.18, 0.1, 0.3); } },
  { id: 'croac', name: 'Croac', icon: '🐸', cat: 'animais', dur: 0.6, play: (c, d, t, k) => {
    const o = c.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(140 * k, t); o.frequency.linearRampToValueAtTime(110 * k, t + 0.5);
    const am = c.createOscillator(); am.frequency.value = 35; const ag = c.createGain(); ag.gain.value = 0.5; const g = c.createGain(); g.gain.value = 0.5; am.connect(ag).connect(g.gain);
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; const e = c.createGain(); env(e, t, 0.02, 0.5, 0.5);
    o.connect(lp).connect(g).connect(e).connect(d); o.start(t); am.start(t); o.stop(t + 0.6); am.stop(t + 0.6);
  } },
  { id: 'muu', name: 'Muuu', icon: '🐮', cat: 'animais', dur: 1.3, play: (c, d, t, k) => { vowel(c, d, 150 * k, 115 * k, t, 1.1, 0.55, [400 * k, 800 * k], 0.15); } },
  { id: 'quack', name: 'Quack', icon: '🦆', cat: 'animais', dur: 0.6, play: (c, d, t, k) => { for (let i = 0; i < 2; i++) vowel(c, d, 420 * k, 360 * k, t + i * 0.25, 0.14, 0.5, [1100 * k, 1700 * k], 0.005); } },
  { id: 'buzina', name: 'Buzina', icon: '📯', cat: 'divertidos', dur: 0.6, play: (c, d, t, k) => { tone(c, d, 'square', 350 * k, 350 * k, t, 0.45, 0.18); tone(c, d, 'square', 356 * k, 356 * k, t, 0.45, 0.18); } },
  { id: 'tambor', name: 'Tambor', icon: '🥁', cat: 'divertidos', dur: 0.4, play: (c, d, t, k) => { tone(c, d, 'sine', 160 * k, 50 * k, t, 0.3, 0.9); noiseHit(c, d, 'lowpass', 1200, 1, t, 0.1, 0.3); } },
  { id: 'palmas', name: 'Palmas', icon: '👏', cat: 'divertidos', dur: 1.2, play: (c, d, t, k) => { for (let i = 0; i < 8; i++) noiseHit(c, d, 'bandpass', (1300 + Math.random() * 600) * k, 1.5, t + i * 0.13 + Math.random() * 0.03, 0.06, 0.6); } },
  { id: 'pop', name: 'Pop', icon: '🎈', cat: 'divertidos', dur: 0.2, play: (c, d, t, k) => { tone(c, d, 'sine', 900 * k, 180 * k, t, 0.08, 0.6); } },
  { id: 'apito', name: 'Apito', icon: '😗', cat: 'divertidos', dur: 0.8, play: (c, d, t, k) => { const o = tone(c, d, 'sine', 1800 * k, 1800 * k, t, 0.6, 0.25); const l = c.createOscillator(); l.frequency.value = 30; const g = c.createGain(); g.gain.value = 80; l.connect(g).connect(o.frequency); l.start(t); l.stop(t + 0.7); } },
];

export const soundById = (id: string) => SOUNDS.find((s) => s.id === id);

/** Converte -1..1 em multiplicador de altura (voz grossa ↔ fina). */
export const pitchK = (p: number) => Math.pow(2, Math.max(-1, Math.min(1, p)) * 0.8);

export function playSound(id: string, pitch = 0, vol = 1, when = 0) {
  const c = audio();
  if (!c) return 0;
  const def = soundById(id);
  if (!def) return 0;
  const g = c.createGain();
  g.gain.value = vol;
  g.connect(out());
  const t = Math.max(c.currentTime, when || c.currentTime) + 0.01;
  def.play(c, g, t, pitchK(pitch));
  setTimeout(() => g.disconnect(), (def.dur + 1.5) * 1000 + Math.max(0, (t - c.currentTime) * 1000));
  return def.dur;
}

// ---------------------------------------------------------------- gravações
const bufferCache = new Map<string, AudioBuffer>();
export async function playBlob(key: string, blob: Blob, pitch = 0, vol = 1, when = 0) {
  const c = audio();
  if (!c) return 0;
  let buf = bufferCache.get(key);
  if (!buf) {
    buf = await c.decodeAudioData(await blob.arrayBuffer());
    bufferCache.set(key, buf);
  }
  const s = c.createBufferSource();
  s.buffer = buf;
  s.playbackRate.value = pitchK(pitch);
  const g = c.createGain();
  g.gain.value = vol * 1.4;
  s.connect(g).connect(out());
  s.start(Math.max(c.currentTime, when || 0));
  return buf.duration / s.playbackRate.value;
}

// ---------------------------------------------------------------- interface
export const sfx = {
  tap: () => { const c = audio(); if (!c) return; tone(c, out(), 'sine', 660, 880, c.currentTime, 0.06, 0.15); },
  select: () => { const c = audio(); if (!c) return; tone(c, out(), 'triangle', 520, 1040, c.currentTime, 0.1, 0.22); },
  place: () => { const c = audio(); if (!c) return; tone(c, out(), 'sine', 300, 600, c.currentTime, 0.08, 0.3); tone(c, out(), 'sine', 600, 900, c.currentTime + 0.06, 0.08, 0.2); },
  remove: () => { const c = audio(); if (!c) return; tone(c, out(), 'sine', 600, 200, c.currentTime, 0.15, 0.25); },
  whoosh: () => { const c = audio(); if (!c) return; noiseHit(c, out(), 'bandpass', 600, 1.5, c.currentTime, 0.35, 0.25, 2400); },
  star: () => { const c = audio(); if (!c) return; [1047, 1319, 1568, 2093].forEach((f, i) => tone(c, out(), 'triangle', f, f, c.currentTime + i * 0.08, 0.3, 0.2)); },
  success: () => {
    const c = audio(); if (!c) return; const t = c.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => tone(c, out(), 'square', f, f, t + i * 0.11, 0.18, 0.12));
    [1047, 1319, 1568].forEach((f) => tone(c, out(), 'triangle', f, f, t + 0.48, 0.7, 0.14));
    for (let i = 0; i < 6; i++) noiseHit(c, out(), 'highpass', 5000, 1, t + 0.5 + i * 0.05, 0.05, 0.08);
  },
  unlock: () => { const c = audio(); if (!c) return; [392, 523, 659, 784, 1047].forEach((f, i) => tone(c, out(), 'triangle', f, f, c.currentTime + i * 0.09, 0.4, 0.2)); },
  soft: () => { const c = audio(); if (!c) return; tone(c, out(), 'sine', 440, 330, c.currentTime, 0.2, 0.18); tone(c, out(), 'sine', 330, 392, c.currentTime + 0.2, 0.2, 0.15); },
  stamp: () => { const c = audio(); if (!c) return; tone(c, out(), 'sine', 120, 40, c.currentTime, 0.2, 0.9); noiseHit(c, out(), 'lowpass', 800, 1, c.currentTime, 0.12, 0.6); },
  hatch: () => { const c = audio(); if (!c) return; for (let i = 0; i < 3; i++) noiseHit(c, out(), 'bandpass', 2500, 3, c.currentTime + i * 0.25, 0.05, 0.6); },
  born: () => { const c = audio(); if (!c) return; const t = c.currentTime; noiseHit(c, out(), 'highpass', 1500, 1, t, 0.4, 0.4); [523, 784, 1047, 1568, 2093].forEach((f, i) => tone(c, out(), 'triangle', f, f, t + 0.1 + i * 0.07, 0.6, 0.2)); },
  camera: () => { const c = audio(); if (!c) return; noiseHit(c, out(), 'highpass', 3000, 1, c.currentTime, 0.06, 0.5); noiseHit(c, out(), 'highpass', 2000, 1, c.currentTime + 0.08, 0.08, 0.4); },
};

// ---------------------------------------------------------------- músicas
export interface MusicDef {
  id: string;
  name: string;
  icon: string;
  bpm: number;
}
export const MUSICS: MusicDef[] = [
  { id: 'festa', name: 'Festa', icon: '🎉', bpm: 118 },
  { id: 'robo', name: 'Robótica', icon: '🤖', bpm: 124 },
  { id: 'tropical', name: 'Tropical', icon: '🌴', bpm: 104 },
  { id: 'calma', name: 'Calminha', icon: '🌙', bpm: 84 },
  { id: 'aventura', name: 'Aventura', icon: '🗺️', bpm: 112 },
  { id: 'misterio', name: 'Mistério', icon: '🔮', bpm: 92 },
];

const SONGS: Record<string, { chords: number[][]; mel: (number | null)[]; bass: OscillatorType; lead: OscillatorType; drums: 'pop' | 'electro' | 'soft' | 'latin' }> = {
  festa: { chords: [[60, 64, 67], [65, 69, 72], [67, 71, 74], [65, 69, 72]], mel: [72, null, 76, 74, 72, null, 67, null, 69, 72, null, 74, 76, null, 74, null], bass: 'triangle', lead: 'square', drums: 'pop' },
  robo: { chords: [[57, 60, 64], [57, 60, 64], [53, 57, 60], [55, 59, 62]], mel: [69, 69, null, 72, null, 69, 67, null, 64, null, 67, 69, null, 72, 74, null], bass: 'sawtooth', lead: 'square', drums: 'electro' },
  tropical: { chords: [[62, 66, 69], [67, 71, 74], [64, 67, 71], [69, 73, 76]], mel: [74, 76, 78, null, 76, 74, null, 71, 74, null, 76, null, 78, 81, 78, null], bass: 'sine', lead: 'triangle', drums: 'latin' },
  calma: { chords: [[60, 64, 67], [57, 60, 64], [65, 69, 72], [67, 71, 74]], mel: [72, null, null, 71, 69, null, null, 67, 69, null, 72, null, 71, null, null, null], bass: 'sine', lead: 'sine', drums: 'soft' },
  aventura: { chords: [[62, 65, 69], [58, 62, 65], [60, 64, 67], [57, 61, 64]], mel: [74, null, 77, 76, 74, null, 72, 70, 69, null, 72, null, 73, null, 76, null], bass: 'triangle', lead: 'sawtooth', drums: 'pop' },
  misterio: { chords: [[57, 60, 64], [56, 60, 63], [55, 58, 62], [56, 60, 63]], mel: [76, null, 75, null, 72, null, null, 69, 71, null, 72, null, 68, null, null, null], bass: 'sine', lead: 'triangle', drums: 'soft' },
};
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export class MusicPlayer {
  private timer: number | null = null;
  private step = 0;
  private nextTime = 0;
  private bus: GainNode | null = null;
  onBeat: ((step: number) => void) | null = null;
  playing = false;

  start(id: string, tempoMul = 1, volume = 0.55) {
    this.stop();
    const c = audio();
    if (!c) return;
    const song = SONGS[id] ?? SONGS.festa;
    const def = MUSICS.find((m) => m.id === id) ?? MUSICS[0];
    const stepDur = 60 / (def.bpm * tempoMul) / 2; // colcheias
    this.bus = c.createGain();
    this.bus.gain.value = volume;
    this.bus.connect(out());
    this.step = 0;
    this.nextTime = c.currentTime + 0.08;
    this.playing = true;
    const bus = this.bus;
    const tick = () => {
      while (this.nextTime < c.currentTime + 0.2) {
        const s = this.step;
        const t = this.nextTime;
        const chord = song.chords[Math.floor(s / 8) % song.chords.length];
        if (s % 8 === 0) chord.forEach((n) => tone(c, bus, 'triangle', mtof(n), mtof(n), t, stepDur * 7, 0.07, 0.03));
        if (s % 2 === 0) tone(c, bus, song.bass, mtof(chord[0] - 24), mtof(chord[0] - 24), t, stepDur * 1.6, 0.35);
        const m = song.mel[s % song.mel.length];
        if (m !== null && m !== undefined) tone(c, bus, song.lead, mtof(m), mtof(m), t, stepDur * 1.4, song.lead === 'square' || song.lead === 'sawtooth' ? 0.07 : 0.16);
        // bateria
        if (song.drums === 'pop' || song.drums === 'electro') {
          if (s % 4 === 0) tone(c, bus, 'sine', 150, 45, t, 0.18, 0.8);
          if (s % 4 === 2) noiseHit(c, bus, 'bandpass', 1800, 0.8, t, 0.12, 0.35);
          noiseHit(c, bus, 'highpass', 7000, 1, t, 0.03, song.drums === 'electro' ? 0.18 : 0.1);
        } else if (song.drums === 'latin') {
          if (s % 3 === 0) tone(c, bus, 'sine', 140, 60, t, 0.15, 0.6);
          noiseHit(c, bus, 'bandpass', 3500, 3, t, 0.04, s % 2 ? 0.08 : 0.16);
        } else if (s % 8 === 0) tone(c, bus, 'sine', 110, 50, t, 0.3, 0.4);
        this.onBeat?.(s);
        this.step++;
        this.nextTime += stepDur;
      }
    };
    tick();
    this.timer = window.setInterval(tick, 50);
  }

  stop() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.playing = false;
    if (this.bus) {
      const b = this.bus;
      const c = audio();
      if (c) {
        b.gain.setTargetAtTime(0, c.currentTime, 0.05);
        setTimeout(() => b.disconnect(), 400);
      }
      this.bus = null;
    }
  }
}

// ---------------------------------------------------------------- leitura em voz alta
let voice: SpeechSynthesisVoice | null = null;
function pickVoice() {
  if (!('speechSynthesis' in window)) return null;
  const vs = window.speechSynthesis.getVoices();
  voice = vs.find((v) => v.lang === 'pt-BR') ?? vs.find((v) => v.lang.startsWith('pt')) ?? null;
  return voice;
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => pickVoice();
}

export function speechAvailable() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Lê um texto em voz alta (áudio de apoio). "force" lê mesmo com a opção desligada. */
export function speak(text: string, force = false) {
  if (!speechAvailable() || (!prefs.voice && !force)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[^\p{L}\p{N}\s.,!?'-]/gu, ' '));
    u.lang = 'pt-BR';
    const v = voice ?? pickVoice();
    if (v) u.voice = v;
    u.rate = 0.95;
    u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  } catch {
    /* sem voz */
  }
}
export function stopSpeech() {
  if (speechAvailable()) window.speechSynthesis.cancel();
}
