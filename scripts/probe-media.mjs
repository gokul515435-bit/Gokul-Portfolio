// Prints the real pixel width/height of every image & video in public/media,
// so you can copy accurate `width` / `height` values into src/data/projects.ts.
//   npm run probe
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const exts = /\.(mp4|webm|mov|jpe?g|png|webp|avif|gif)$/i;
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));

for (const file of walk(join(root, 'media')).filter((f) => exts.test(f))) {
  let out = '';
  try {
    execFileSync(ffmpeg, ['-hide_banner', '-i', file], { stdio: 'pipe' });
  } catch (e) {
    out = String(e.stderr); // ffmpeg exits non-zero without an output file — info is on stderr
  }
  const m = out.match(/Video: .*?(\d{2,5})x(\d{2,5})/);
  const rot = /rotate\s*:\s*-?(90|270)|rotation of -?90/.test(out);
  const [w, h] = m ? (rot ? [m[2], m[1]] : [m[1], m[2]]) : ['?', '?'];
  const ratio = m ? (w / h).toFixed(3) : '';
  console.log(`/${relative(root, file)}  width: ${w}, height: ${h}  (ratio ${ratio})`);
}
