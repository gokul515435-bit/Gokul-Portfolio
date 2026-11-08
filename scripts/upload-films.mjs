// Uploads every public/media/<slug>/full.mp4 to Vercel Blob at films/<slug>/full.mp4
// and prints the VITE_FILM_BASE value to set on Vercel.
//
//   BLOB_READ_WRITE_TOKEN=... node scripts/upload-films.mjs
// (or put the token in .env.local — `npx vercel env pull .env.local` does that)
import { put, list } from '@vercel/blob';
import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
for (const f of ['.env.local', '.env.development.local', '.env']) {
  const p = join(root, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) throw new Error('Set BLOB_READ_WRITE_TOKEN (npx vercel env pull .env.local)');

const media = join(root, 'public', 'media');
const films = readdirSync(media).filter((d) => existsSync(join(media, d, 'full.mp4')));
const existing = new Map();
for await (const page of (async function* () {
  let cursor;
  do {
    const r = await list({ prefix: 'films/', cursor, token });
    yield r.blobs;
    cursor = r.cursor;
  } while (cursor);
})()) for (const b of page) existing.set(b.pathname, b.size);

let base = '';
for (const slug of films) {
  const file = join(media, slug, 'full.mp4');
  const pathname = `films/${slug}/full.mp4`;
  const size = statSync(file).size;
  if (existing.get(pathname) === size) {
    console.log(`= ${pathname} already uploaded`);
    continue;
  }
  const { url } = await put(pathname, createReadStream(file), {
    access: 'public',
    token,
    contentType: 'video/mp4',
    addRandomSuffix: false,
    allowOverwrite: true,
    multipart: size > 50 * 1024 * 1024,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  });
  base = url.slice(0, url.indexOf('/films/') + '/films'.length);
  console.log(`✓ ${pathname}  ${(size / 1048576).toFixed(1)} MB`);
}
if (!base) {
  const { blobs } = await list({ prefix: 'films/', limit: 1, token });
  if (blobs[0]) base = blobs[0].url.slice(0, blobs[0].url.indexOf('/films/') + '/films'.length);
}
console.log(`\nVITE_FILM_BASE=${base}`);
