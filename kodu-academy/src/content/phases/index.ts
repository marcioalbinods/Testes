import type { Phase } from '../types';
import { module1 } from './module1';
import { module2 } from './module2';
import { module3 } from './module3';
import { module4 } from './module4';
import { module5 } from './module5';

/** As 20 fases da trilha, em ordem. */
export const PHASES: Phase[] = [...module1, ...module2, ...module3, ...module4, ...module5];

export const TOTAL_PHASES = PHASES.length;

export function getPhase(id: number): Phase | undefined {
  return PHASES.find((p) => p.id === id);
}

export function requiredChecklistIds(phase: Phase): string[] {
  return phase.checklist.filter((c) => c.required).map((c) => c.id);
}
