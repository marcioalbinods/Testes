import { idb } from './idb';
import { downloadRecording } from './api';
import { playBlob } from './audio';
import type { Recording } from '../game/types';

// Gravação de voz pelo microfone (só quando a escola permite).

export function recordingSupported() {
  return typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
}

function pickMime() {
  const opts = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/aac'];
  for (const m of opts) if (MediaRecorder.isTypeSupported?.(m)) return m;
  return '';
}

export interface ActiveRecording {
  stop: () => Promise<{ blob: Blob; mime: string; duration: number }>;
  cancel: () => void;
  level: () => number;
}

export async function startRecording(maxSeconds = 20, onAutoStop?: () => void): Promise<ActiveRecording> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  const mime = pickMime();
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 48000 } : undefined);
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const started = Date.now();
  // medidor de volume
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ac = new AC();
  const src = ac.createMediaStreamSource(stream);
  const an = ac.createAnalyser();
  an.fftSize = 256;
  src.connect(an);
  const buf = new Uint8Array(an.frequencyBinCount);
  rec.start(250);
  const done = new Promise<{ blob: Blob; mime: string; duration: number }>((resolve) => {
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      void ac.close();
      const type = rec.mimeType || mime || 'audio/webm';
      resolve({ blob: new Blob(chunks, { type }), mime: type, duration: (Date.now() - started) / 1000 });
    };
  });
  const timer = setTimeout(() => {
    if (rec.state === 'recording') {
      rec.stop();
      onAutoStop?.();
    }
  }, maxSeconds * 1000);
  return {
    stop: () => {
      clearTimeout(timer);
      if (rec.state === 'recording') rec.stop();
      return done;
    },
    cancel: () => {
      clearTimeout(timer);
      if (rec.state === 'recording') rec.stop();
    },
    level: () => {
      an.getByteTimeDomainData(buf);
      let peak = 0;
      for (const v of buf) peak = Math.max(peak, Math.abs(v - 128));
      return peak / 128;
    },
  };
}

/** Pega o áudio: primeiro do aparelho; se não tiver, baixa da nuvem. */
export async function getRecordingBlob(r: Recording): Promise<Blob | null> {
  const local = await idb.get<Blob>(`rec:${r.id}`);
  if (local) return local;
  if (!r.path) return null;
  try {
    const b = await downloadRecording(r.path);
    await idb.set(`rec:${r.id}`, b);
    return b;
  } catch {
    return null;
  }
}

export async function playRecording(r: Recording, pitch = 0, vol = 1, when = 0) {
  const b = await getRecordingBlob(r);
  if (!b) return 0;
  try {
    return await playBlob(r.id, b, pitch, vol, when);
  } catch {
    return 0;
  }
}
