import type { GameData } from '../game/types';
import { playSound } from './audio';
import { playRecording } from './recorder';
import { playTrack } from '../stages/life/SoundLab';

/** Toca o "som característico" do monstrinho. */
export function playSignature(g: GameData) {
  const s = g.sounds.signature;
  if (!s) {
    playSound('risadinha');
    return;
  }
  if (s.kind === 'sound') {
    if (s.id.startsWith('rec:')) {
      const r = g.sounds.recordings.find((x) => x.id === s.id.slice(4));
      if (r) void playRecording(r, s.pitch);
    } else playSound(s.id, s.pitch);
  } else if (s.kind === 'recording') {
    const r = g.sounds.recordings.find((x) => x.id === s.id);
    if (r) void playRecording(r);
  } else {
    playTrack(g.sounds.track, (id) => g.sounds.recordings.find((r) => r.id === id));
  }
}

export function signatureLabel(g: GameData) {
  const s = g.sounds.signature;
  if (!s) return 'Ainda não escolhido';
  if (s.kind === 'track') return 'Música do laboratório';
  if (s.kind === 'recording') return 'Gravação de voz';
  return s.id;
}
