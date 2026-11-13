import { blobPath, ellipsePath, roundRectPath } from './common';

// Cabeças: desenhadas em torno do centro (200,160). As âncoras dizem onde
// encaixar olhos, boca, orelhas, chifres e antenas, para que todas as
// peças combinem entre si.
export interface HeadAnchors {
  top: number; // y do topo (centro)
  eyeY: number;
  mouthY: number;
  earX: number; // distância horizontal do centro até a orelha
  earY: number;
  hornX: number;
  hornY: number;
  bottom: number; // y da base da cabeça (pescoço)
}
export interface HeadDef {
  id: string;
  name: string;
  d: string;
  a: HeadAnchors;
  /** Detalhes extras desenhados sobre a cabeça (ex.: gomos da abóbora). */
  lines?: string;
}

export const HEADS: HeadDef[] = [
  { id: 'redonda', name: 'Redonda', d: ellipsePath(200, 162, 96, 92), a: { top: 70, eyeY: 150, mouthY: 204, earX: 80, earY: 105, hornX: 46, hornY: 80, bottom: 254 } },
  { id: 'oval', name: 'Oval larga', d: ellipsePath(200, 170, 114, 82), a: { top: 88, eyeY: 160, mouthY: 207, earX: 98, earY: 128, hornX: 55, hornY: 96, bottom: 252 } },
  { id: 'ovo', name: 'Ovo', d: 'M200,62 C262,62 290,150 290,192 C290,240 250,262 200,262 C150,262 110,240 110,192 C110,150 138,62 200,62Z', a: { top: 62, eyeY: 162, mouthY: 216, earX: 72, earY: 118, hornX: 34, hornY: 74, bottom: 262 } },
  { id: 'gota', name: 'Gota', d: 'M200,52 C232,100 296,140 296,192 C296,242 252,262 200,262 C148,262 104,242 104,192 C104,140 168,100 200,52Z', a: { top: 52, eyeY: 172, mouthY: 222, earX: 74, earY: 140, hornX: 38, hornY: 100, bottom: 262 } },
  { id: 'quadrada', name: 'Quadradinha', d: roundRectPath(105, 74, 190, 182, 42), a: { top: 74, eyeY: 150, mouthY: 210, earX: 88, earY: 98, hornX: 54, hornY: 77, bottom: 256 } },
  { id: 'nuvem', name: 'Nuvem', d: blobPath(200, 168, 98, 84, 7, 0.07), a: { top: 82, eyeY: 160, mouthY: 210, earX: 86, earY: 118, hornX: 46, hornY: 92, bottom: 252 } },
  { id: 'coracao', name: 'Coração', d: 'M200,258 C150,224 100,190 100,136 C100,96 134,76 164,80 C184,83 195,95 200,110 C205,95 216,83 236,80 C266,76 300,96 300,136 C300,190 250,224 200,258Z', a: { top: 84, eyeY: 145, mouthY: 196, earX: 84, earY: 100, hornX: 52, hornY: 86, bottom: 252 } },
  { id: 'feijao', name: 'Feijão', d: 'M118,124 C138,70 262,62 286,116 C306,158 292,252 204,254 C128,256 94,202 118,124Z', a: { top: 76, eyeY: 152, mouthY: 208, earX: 82, earY: 108, hornX: 46, hornY: 84, bottom: 254 } },
  { id: 'triangulo', name: 'Triângulo', d: 'M200,66 Q216,66 226,86 L294,214 Q308,252 266,254 H134 Q92,252 106,214 L174,86 Q184,66 200,66Z', a: { top: 66, eyeY: 180, mouthY: 224, earX: 62, earY: 150, hornX: 14, hornY: 88, bottom: 254 } },
  { id: 'cogumelo', name: 'Cogumelo', d: 'M94,178 C94,96 146,66 200,66 C254,66 306,96 306,178 C306,200 290,206 270,206 L264,244 Q261,258 244,258 H156 Q139,258 136,244 L130,206 C110,206 94,200 94,178Z', a: { top: 66, eyeY: 166, mouthY: 228, earX: 92, earY: 120, hornX: 52, hornY: 76, bottom: 258 } },
  { id: 'abobora', name: 'Abóbora', d: 'M200,86 C232,70 282,80 296,130 C310,182 290,246 240,250 C224,259 176,259 160,250 C110,246 90,182 104,130 C118,80 168,70 200,86Z', a: { top: 80, eyeY: 156, mouthY: 210, earX: 88, earY: 112, hornX: 40, hornY: 86, bottom: 255 }, lines: 'M200,90 C186,140 186,210 200,252 M160,96 C140,140 140,210 160,248 M240,96 C260,140 260,210 240,248' },
  { id: 'amendoim', name: 'Amendoim', d: 'M150,94 C186,94 190,114 200,114 C210,114 214,94 250,94 C302,94 306,160 292,192 C280,232 254,254 200,254 C146,254 120,232 108,192 C94,160 98,94 150,94Z', a: { top: 96, eyeY: 158, mouthY: 212, earX: 90, earY: 112, hornX: 50, hornY: 98, bottom: 254 } },
  { id: 'sino', name: 'Sino', d: 'M200,68 C246,68 262,110 266,150 C270,200 302,214 302,240 Q302,256 282,256 H118 Q98,256 98,240 C98,214 130,200 134,150 C138,110 154,68 200,68Z', a: { top: 68, eyeY: 160, mouthY: 216, earX: 64, earY: 118, hornX: 30, hornY: 78, bottom: 256 } },
  { id: 'hexagono', name: 'Hexágono', d: 'M160,72 H240 Q258,72 268,88 L298,148 Q306,165 298,182 L268,242 Q258,258 240,258 H160 Q142,258 132,242 L102,182 Q94,165 102,148 L132,88 Q142,72 160,72Z', a: { top: 72, eyeY: 156, mouthY: 212, earX: 80, earY: 104, hornX: 40, hornY: 76, bottom: 258 } },
  { id: 'fofinha', name: 'Fofinha', d: blobPath(200, 166, 92, 88, 5, 0.12), a: { top: 72, eyeY: 158, mouthY: 210, earX: 88, earY: 128, hornX: 40, hornY: 82, bottom: 256 } },
];
