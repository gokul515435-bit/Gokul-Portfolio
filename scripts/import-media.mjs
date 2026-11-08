// Converts source videos/GIFs into web-ready files for the site.
//
//   node scripts/import-media.mjs <manifest.tsv> <source-dir> [--force]
//
// manifest.tsv rows: <Category>\t<original file name>\t<source id>   (source file = <source-dir>/<id>.<ext>)
// For each item it writes public/media/<slug>/:
//   full.mp4     H.264, long side ≤ 1920, AAC audio when present — played on the project page
//   preview.mp4  muted loop ≤ 6 s, long side ≤ 960 — gallery hover preview
//   poster.jpg   first frame of preview.mp4 (so nothing jumps when the preview starts)
// and prints a JSON summary (dimensions, duration, audio, duplicates) to scripts/media-import.json.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';

const [manifestPath, srcDir] = process.argv.slice(2);
const force = process.argv.includes('--force');
if (!manifestPath || !srcDir) throw new Error('usage: import-media.mjs <manifest.tsv> <source-dir>');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'media');

const slugify = (s) =>
  s
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function probe(file) {
  let err = '';
  try {
    execFileSync(ffmpeg, ['-hide_banner', '-i', file], { stdio: 'pipe' });
  } catch (e) {
    err = String(e.stderr);
  }
  const v = err.match(/Video: [^\n]*?, (\d{2,5})x(\d{2,5})/);
  const d = err.match(/Duration: (\d+):(\d+):([\d.]+)/);
  const rot = /rotate\s*:\s*-?(90|270)|rotation of -?90/.test(err);
  let [w, h] = v ? [Number(v[1]), Number(v[2])] : [0, 0];
  if (rot) [w, h] = [h, w];
  const duration = d ? Number(d[1]) * 3600 + Number(d[2]) * 60 + Number(d[3]) : 0;
  return { width: w, height: h, duration, audio: /Audio: /.test(err) };
}

const run = (args) => execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
const fit = (max) => `scale='if(gte(iw,ih),min(${max},iw),-2)':'if(gte(iw,ih),-2,min(${max},ih))':flags=lanczos,scale=trunc(iw/2)*2:trunc(ih/2)*2,setsar=1`;
const md5 = (f) => createHash('md5').update(readFileSync(f)).digest('hex');

const rows = readFileSync(manifestPath, 'utf8').trim().split('\n').map((l) => l.split('\t'));
const seenHash = new Map();
const usedSlugs = new Map();
const results = [];

for (const [category, name, id] of rows) {
  const ext = name.split('.').pop().toLowerCase();
  const src = join(srcDir, `${id}.${ext}`);
  if (!existsSync(src)) {
    console.warn(`! missing ${name}`);
    continue;
  }
  const hash = md5(src);
  if (seenHash.has(hash)) {
    // identical file in another folder → just add the category to the first one
    const first = seenHash.get(hash);
    if (!first.categories.includes(category)) first.categories.push(category);
    first.duplicates.push(`${category}/${name}`);
    console.log(`= ${category}/${name} is identical to ${first.slug}`);
    continue;
  }
  let slug = category === 'Showreel' ? 'showreel' : slugify(name);
  const n = (usedSlugs.get(slug) ?? 0) + 1;
  usedSlugs.set(slug, n);
  if (n > 1) slug = `${slug}-${n}`;

  const info = probe(src);
  const dir = join(out, slug);
  mkdirSync(dir, { recursive: true });
  const full = join(dir, 'full.mp4');
  const preview = join(dir, 'preview.mp4');
  const poster = join(dir, 'poster.jpg');
  const isGif = ext === 'gif';

  if (force || !existsSync(full)) {
    run([
      ...(isGif ? ['-ignore_loop', '1'] : []),
      '-i', src,
      '-vf', fit(1920), '-c:v', 'libx264', '-preset', 'medium', '-crf', category === 'Showreel' ? '21' : '23',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      ...(info.audio && !isGif ? ['-c:a', 'aac', '-b:a', '160k'] : ['-an']),
      full,
    ]);
  }
  const fullInfo = probe(full);
  const dur = fullInfo.duration || info.duration;
  // Long films: preview starts 15% in (skips black/title cards). Short loops: the whole loop.
  const start = dur > 15 ? Math.round(dur * 0.15 * 10) / 10 : 0;
  const len = Math.min(6, Math.max(dur - start, 0.5));
  if (force || !existsSync(preview)) {
    run(['-ss', String(start), '-i', full, '-t', String(len), '-vf', fit(960), '-c:v', 'libx264', '-preset', 'medium',
      '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', preview]);
  }
  if (force || !existsSync(poster)) {
    run(['-i', preview, '-frames:v', '1', '-q:v', '3', poster]);
  }
  const entry = {
    slug,
    name,
    categories: [category],
    width: fullInfo.width,
    height: fullInfo.height,
    duration: Math.round(dur * 10) / 10,
    audio: info.audio && !isGif,
    source: isGif ? 'gif' : 'video',
    duplicates: [],
  };
  seenHash.set(hash, entry);
  results.push(entry);
  console.log(`✓ ${slug}  ${entry.width}x${entry.height}  ${entry.duration}s${entry.audio ? ' ♪' : ''}`);
}

writeFileSync(join(root, 'scripts', 'media-import.json'), JSON.stringify(results, null, 2));
console.log(`\n${results.length} items → scripts/media-import.json`);
