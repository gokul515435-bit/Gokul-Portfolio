// Uploads this folder to GitHub as one commit — no git or Xcode tools needed.
// It uses the GitHub CLI's sign-in (../.tools/gh) and GitHub's API.
//
//   npm run push -- "What changed"
//
// What it does:
//   • collects every file here except the ignored ones (same rules as .gitignore:
//     node_modules, dist, full-length films, .env* secrets, .vercel, …)
//   • uploads only files whose content changed since the last commit
//   • makes one commit on `main` whose contents exactly match this folder
//     (files you deleted here are removed on GitHub too)
// Vercel watches the repository, so every push publishes the site.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = 'gokul515435-bit/Gokul-Portfolio';
const BRANCH = 'main';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');
const message = process.argv.slice(2).filter((a) => a !== '--dry-run').join(' ').trim() || 'Update site';
const ghBin = [join(root, '..', '.tools', 'gh', 'bin', 'gh'), 'gh'].find((p) => p === 'gh' || existsSync(p));
const token = execFileSync(ghBin, ['auth', 'token'], { encoding: 'utf8' }).trim();

// ── ignore rules (keep in sync with .gitignore) ───────────────────────────
const IGNORE = [
  /^node_modules(\/|$)/,
  /^dist(\/|$)/,
  /\.tsbuildinfo$/,
  /^public\/media\/[^/]+\/full\.mp4$/,
  /(^|\/)\.env(\..*)?$/,
  /^\.vercel(\/|$)/,
  /(^|\/)\.DS_Store$/,
  /^\.git(\/|$)/,
];
const ignored = (p) => IGNORE.some((re) => re.test(p));

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const abs = join(dir, name);
    const rel = relative(root, abs).split(sep).join('/');
    if (ignored(rel)) return [];
    return statSync(abs).isDirectory() ? walk(abs) : [rel];
  });
}

// ── GitHub API helper ─────────────────────────────────────────────────────
async function gh(method, path, body) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

const gitBlobSha = (buf) => createHash('sha1').update(`blob ${buf.length}\0`).update(buf).digest('hex');

// ── main ──────────────────────────────────────────────────────────────────
const files = walk(root).sort();
if (dryRun) {
  files.forEach((f) => console.log(f));
  console.log(`
${files.length} files would be pushed.`);
  process.exit(0);
}
const ref = await gh('GET', `/git/ref/heads/${BRANCH}`);
const parentSha = ref.object.sha;
const parent = await gh('GET', `/git/commits/${parentSha}`);
const remoteTree = await gh('GET', `/git/trees/${parent.tree.sha}?recursive=1`);
const remote = new Map(remoteTree.tree.filter((e) => e.type === 'blob').map((e) => [e.path, e.sha]));

let uploaded = 0;
let bytes = 0;
const entries = [];
for (const path of files) {
  const buf = readFileSync(join(root, path));
  let sha = gitBlobSha(buf);
  if (remote.get(path) !== sha) {
    const blob = await gh('POST', '/git/blobs', { content: buf.toString('base64'), encoding: 'base64' });
    sha = blob.sha;
    uploaded++;
    bytes += buf.length;
    console.log(`↑ ${path}`);
  }
  const mode = statSync(join(root, path)).mode & 0o111 ? '100755' : '100644';
  entries.push({ path, mode, type: 'blob', sha });
}
const removed = [...remote.keys()].filter((p) => !files.includes(p));
removed.forEach((p) => console.log(`− ${p}`));

if (!uploaded && !removed.length && remote.size === files.length) {
  console.log('Nothing changed — GitHub already matches this folder.');
  process.exit(0);
}

// Full tree (no base_tree) so GitHub mirrors this folder exactly.
const tree = await gh('POST', '/git/trees', { tree: entries });
const commit = await gh('POST', '/git/commits', { message, tree: tree.sha, parents: [parentSha] });
await gh('PATCH', `/git/refs/heads/${BRANCH}`, { sha: commit.sha });

console.log(
  `\n✓ Pushed "${message}" to ${REPO}@${BRANCH} — ${uploaded} file(s) uploaded (${(bytes / 1048576).toFixed(1)} MB), ${removed.length} removed.`,
);
console.log(`  https://github.com/${REPO}/commit/${commit.sha}`);
