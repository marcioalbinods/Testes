import { blobPath, ellipsePath, roundRectPath } from './common';

// Corpos: desenhados em torno de (200,312). As âncoras indicam onde ficam
// braços, pernas, cauda, asas e a barriga.
export interface BodyAnchors {
  top: number;
  shoulderX: number;
  shoulderY: number;
  hipX: number;
  hipY: number;
  tailX: number;
  tailY: number;
  wingY: number;
  bottom: number;
  belly: { cx: number; cy: number; rx: number; ry: number };
}
export interface BodyDef {
  id: string;
  name: string;
  d: string;
  a: BodyAnchors;
}

export const BODIES: BodyDef[] = [
  { id: 'redondo', name: 'Redondo', d: ellipsePath(200, 314, 86, 78), a: { top: 236, shoulderX: 78, shoulderY: 292, hipX: 44, hipY: 378, tailX: 82, tailY: 340, wingY: 270, bottom: 392, belly: { cx: 200, cy: 326, rx: 52, ry: 50 } } },
  { id: 'pera', name: 'Pera', d: 'M200,234 C240,234 256,270 270,310 C290,362 260,394 200,394 C140,394 110,362 130,310 C144,270 160,234 200,234Z', a: { top: 234, shoulderX: 56, shoulderY: 280, hipX: 46, hipY: 382, tailX: 78, tailY: 350, wingY: 266, bottom: 394, belly: { cx: 200, cy: 338, rx: 46, ry: 44 } } },
  { id: 'ovo', name: 'Ovo', d: ellipsePath(200, 312, 76, 86), a: { top: 226, shoulderX: 70, shoulderY: 288, hipX: 40, hipY: 382, tailX: 72, tailY: 340, wingY: 262, bottom: 398, belly: { cx: 200, cy: 324, rx: 44, ry: 56 } } },
  { id: 'quadrado', name: 'Quadrado', d: roundRectPath(118, 236, 164, 156, 38), a: { top: 236, shoulderX: 80, shoulderY: 284, hipX: 48, hipY: 380, tailX: 82, tailY: 350, wingY: 266, bottom: 392, belly: { cx: 200, cy: 322, rx: 54, ry: 46 } } },
  { id: 'barrigudo', name: 'Barrigudo', d: ellipsePath(200, 322, 104, 72), a: { top: 250, shoulderX: 92, shoulderY: 300, hipX: 52, hipY: 382, tailX: 100, tailY: 340, wingY: 280, bottom: 394, belly: { cx: 200, cy: 330, rx: 66, ry: 46 } } },
  { id: 'comprido', name: 'Comprido', d: roundRectPath(142, 224, 116, 172, 56), a: { top: 224, shoulderX: 56, shoulderY: 278, hipX: 36, hipY: 382, tailX: 56, tailY: 350, wingY: 258, bottom: 396, belly: { cx: 200, cy: 322, rx: 36, ry: 52 } } },
  { id: 'piramide', name: 'Pirâmide', d: 'M200,232 Q216,232 226,250 L286,364 Q298,394 266,394 H134 Q102,394 114,364 L174,250 Q184,232 200,232Z', a: { top: 232, shoulderX: 44, shoulderY: 286, hipX: 52, hipY: 384, tailX: 76, tailY: 360, wingY: 268, bottom: 394, belly: { cx: 200, cy: 344, rx: 44, ry: 36 } } },
  { id: 'saquinho', name: 'Saquinho', d: 'M150,238 H250 Q270,238 272,262 C278,320 300,394 200,394 C100,394 122,320 128,262 Q130,238 150,238Z', a: { top: 238, shoulderX: 70, shoulderY: 278, hipX: 48, hipY: 384, tailX: 86, tailY: 350, wingY: 264, bottom: 394, belly: { cx: 200, cy: 336, rx: 48, ry: 46 } } },
  { id: 'mini', name: 'Mini', d: ellipsePath(200, 320, 62, 58), a: { top: 262, shoulderX: 56, shoulderY: 306, hipX: 30, hipY: 366, tailX: 58, tailY: 336, wingY: 290, bottom: 378, belly: { cx: 200, cy: 330, rx: 36, ry: 34 } } },
  { id: 'fofo', name: 'Fofo', d: blobPath(200, 314, 84, 76, 7, 0.06), a: { top: 236, shoulderX: 80, shoulderY: 292, hipX: 44, hipY: 380, tailX: 84, tailY: 340, wingY: 270, bottom: 392, belly: { cx: 200, cy: 326, rx: 50, ry: 48 } } },
];
