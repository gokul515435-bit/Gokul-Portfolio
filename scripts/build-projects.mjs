// One-off: writes src/data/projects.ts from scripts/media-import.json.
// After this, edit src/data/projects.ts by hand (titles, subtitles, order, credits).
//   node scripts/build-projects.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const items = JSON.parse(readFileSync(join(root, 'scripts', 'media-import.json'), 'utf8'));

// Clean display titles for the original file names.
const TITLES = {
  '2020TAX_Draft_05.mp4': '2020 Tax',
  'Kissht ToDo Full Cut v8.mp4': 'Kissht ToDo',
  'AI Ep 1_Final_Export.mp4': 'AI — Episode 1',
  'AI Ep 2_Final_Export.mp4': 'AI — Episode 2',
  'AI Ep 3_Final_Export.mp4': 'AI — Episode 3',
  'AI Ep 4_Final_Export.mp4': 'AI — Episode 4',
  'Bloom-iCAS_Explainer_(Full_Cut).mp4': 'Bloom iCAS',
  'DAA_Full_Cut_v4(Updated).mp4': 'DAA',
  'NETFLIX 2.gif': 'Netflix',
  'PEPSI 2.gif': 'Pepsi',
  'NOTHING IMPOSSIBLE.gif': 'Nothing Impossible',
  'SUMMER.gif': 'Summer',
  'TUDUM.gif': 'Tudum',
  '2020TAX_Independence_V_1.mp4': '2020 Tax — Independence',
  'Terry Cube_01.mp4': 'Terry Cube 01',
  '#01.mp4': 'Study #01',
};
const SUBTITLE = {
  Brand: 'Brand film',
  Explainer: 'Explainer film',
  'Kinetic Type': 'Kinetic type',
  Experiments: 'Motion experiment',
};
const title = (it) => TITLES[it.name] ?? it.name.replace(/\.[^.]+$/, '').replace(/_/g, ' ').trim();

const reel = items.find((i) => i.slug === 'showreel');
const work = items.filter((i) => i.slug !== 'showreel');

// Disambiguate repeated titles (different files with the same name).
const counts = {};
for (const it of work) counts[title(it)] = (counts[title(it)] ?? 0) + 1;
const seen = {};

const q = (s) => JSON.stringify(s);
const lines = work.map((it, i) => {
  let t = title(it);
  if (counts[t] > 1) {
    seen[t] = (seen[t] ?? 0) + 1;
    if (seen[t] > 1) t = `${t} ${['', '', 'II', 'III', 'IV'][seen[t]] ?? seen[t]}`;
  }
  const sub = it.categories.map((c) => SUBTITLE[c]).join(' · ');
  return `  project(${i + 1}, ${q(it.slug)}, ${q(t)}, ${q(sub)}, ${q(it.categories)}, ${it.width}, ${it.height}, ${it.audio}),`;
});

const file = `import type { Category, PortfolioMedia, Project } from './types';

/*
 * ─── YOUR WORK ────────────────────────────────────────────────────────────────
 * Generated from your Google Drive folders by scripts/import-media.mjs, then
 * edit freely: reorder lines, rename titles, add subtitles/credits.
 * Files live in /public/media/<slug>/ (full.mp4, preview.mp4, poster.jpg).
 * width/height are the real pixel size of full.mp4 — they drive the layout.
 *
 * To add credits to one project, pass a last argument, e.g.
 *   project(3, 'oreo', 'Oreo', 'Brand film', ['Brand'], 1920, 1080, true,
 *     { year: 2025, client: 'Oreo', role: 'Animation', tools: ['After Effects'] }),
 * ────────────────────────────────────────────────────────────────────────────
 */

const M = (slug: string, file: string) => \`/media/\${slug}/\${file}\`;
/** Full-length films: served from Vercel Blob in production (VITE_FILM_BASE), from /media locally. */
const FILM_BASE = (import.meta.env.VITE_FILM_BASE as string | undefined)?.replace(/\\/$/, '') || '/media';
const FILM = (slug: string) => \`\${FILM_BASE}/\${slug}/full.mp4\`;

function project(
  order: number,
  slug: string,
  title: string,
  subtitle: string,
  category: Category[],
  width: number,
  height: number,
  _hasAudio: boolean,
  extra: Partial<Project> = {},
): Project {
  const cover: PortfolioMedia = {
    id: \`\${slug}-video\`,
    type: 'video',
    src: FILM(slug),
    preview: M(slug, 'preview.mp4'),
    poster: M(slug, 'poster.jpg'),
    width,
    height,
    alt: \`\${title} — \${subtitle.toLowerCase()} by Gokul\`,
  };
  return { slug, title, subtitle, category, cover, media: [cover], order, ...extra };
}

export const projects: Project[] = [
${lines.join('\n')}
].sort((a, b) => a.order - b.order);

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const toCategorySlug = (c: string) => c.toLowerCase().replace(/\\s+/g, '-');

/** Full-screen showreel shown at the top of the Work page (undefined = no reel section). */
export type Showreel = { src: string; poster?: string; width: number; height: number; title: string; alt: string };
export const showreel: Showreel | undefined = ${
  reel
    ? `{
  src: FILM('showreel'),
  poster: M('showreel', 'poster.jpg'),
  width: ${reel.width},
  height: ${reel.height},
  title: 'Showreel 2026',
  alt: 'Gokul — motion design showreel 2026',
}`
    : 'undefined'
};
`;
writeFileSync(join(root, 'src', 'data', 'projects.ts'), file);
console.log(`wrote ${work.length} projects${reel ? ' + showreel' : ''}`);
