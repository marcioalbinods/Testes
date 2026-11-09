/** Todas as 20 missões do curso, em ordem. */
import { MISSIONS_1 } from './missions1';
import { MISSIONS_2 } from './missions2';
import type { Mission } from './missionTypes';

export const MISSIONS: Mission[] = [...MISSIONS_1, ...MISSIONS_2];
export const missionById = (id: string) => MISSIONS.find((m) => m.id === id);
export { LEVELS } from './missionTypes';
