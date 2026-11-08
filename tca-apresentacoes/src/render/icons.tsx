import {
  ArrowRight, BookOpen, Camera, ChartColumnBig, Compass, Cpu, Drama, Flag, Gamepad2, HandHeart, Heart, Image, Lightbulb,
  MapPin, Megaphone, Mic, Newspaper, Search, Share2, Sparkles, Target, TriangleAlert, Users, Video, Wrench,
  type LucideIcon,
} from 'lucide-react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MEDIA_OPTIONS } from '../data/constants';

const SLIDE_ICONS: Record<string, LucideIcon> = {
  alert: TriangleAlert, cpu: Cpu, compass: Compass, heart: Heart, search: Search, map: MapPin, users: Users,
  lightbulb: Lightbulb, book: BookOpen, sparkles: Sparkles, chart: ChartColumnBig, arrow: ArrowRight, target: Target,
  megaphone: Megaphone, tool: Wrench, flag: Flag, hand: HandHeart, video: Video, mic: Mic, image: Image, share: Share2,
  camera: Camera, drama: Drama, newspaper: Newspaper, gamepad: Gamepad2,
};

/** Resolve o ícone de um slide. "media:Podcast" → ícone da mídia. */
export function resolveIcon(name: string): LucideIcon {
  if (name.startsWith('media:')) {
    const label = name.slice(6);
    const m = MEDIA_OPTIONS.find((o) => o.short === label || o.name === label);
    return SLIDE_ICONS[m?.icon ?? 'sparkles'] ?? Sparkles;
  }
  return SLIDE_ICONS[name] ?? Sparkles;
}

export const mediaIcon = (icon: string): LucideIcon => SLIDE_ICONS[icon] ?? Sparkles;

/** SVG do ícone como texto (usado para gerar imagens no PowerPoint). */
export function iconSvg(name: string, color: string, size = 128): string {
  return renderToStaticMarkup(createElement(resolveIcon(name), { size, color: '#' + color, strokeWidth: 2.1, xmlns: 'http://www.w3.org/2000/svg' } as never));
}

const pngCache = new Map<string, string>();

/** Converte o ícone em PNG (data URL) para inserir no PowerPoint. */
export async function iconPng(name: string, color: string, size = 160): Promise<string> {
  const key = `${name}|${color}|${size}`;
  const hit = pngCache.get(key);
  if (hit) return hit;
  const svg = iconSvg(name, color, size);
  const img = new window.Image();
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error('icone'));
    img.src = url;
  });
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  c.getContext('2d')!.drawImage(img, 0, 0, size, size);
  const out = c.toDataURL('image/png');
  pngCache.set(key, out);
  return out;
}
