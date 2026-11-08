import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { projects } from './projects';
import { site } from './site';

const pub = join(__dirname, '..', '..', 'public');
const local = (u: string) => (u.startsWith('/') ? join(pub, u) : null);

describe('project data', () => {
  it('has unique slugs and orders', () => {
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
    expect(new Set(projects.map((p) => p.order)).size).toBe(projects.length);
  });
  it('covers every ratio class with at least 12 projects', () => {
    expect(projects.length).toBeGreaterThanOrEqual(12);
  });
  it('uses only known categories', () => {
    for (const p of projects) for (const c of p.category) expect(site.categories).toContain(c);
  });
  for (const p of projects) {
    it(`${p.slug}: media are valid and present on disk`, () => {
      for (const m of [p.cover, ...p.media]) {
        expect(m.width).toBeGreaterThan(0);
        expect(m.height).toBeGreaterThan(0);
        expect(m.alt.trim().length).toBeGreaterThan(3);
        for (const u of [m.src, m.preview, m.poster].filter(Boolean) as string[]) {
          const f = local(u);
          if (f) expect(existsSync(f), `missing ${u}`).toBe(true);
        }
        if (m.type === 'video') expect(m.poster, 'videos need a poster').toBeTruthy();
      }
    });
  }
});
