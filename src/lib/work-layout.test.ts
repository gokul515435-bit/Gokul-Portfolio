import { describe, expect, it } from 'vitest';
import { tileFrame, layoutGrid, HALF_MIN_RATIO } from './work-layout';
import { projects } from '../data/projects';

const f = (w: number, h: number, hint?: 'hero' | 'wide') => tileFrame({ width: w, height: h, layoutHint: hint });

describe('tileFrame (work grid)', () => {
  it('spans ultrawide across both columns at its native ratio', () => {
    const t = f(2560, 1080);
    expect(t.span).toBe(2);
    expect(t.desktop).toBeCloseTo(2560 / 1080);
    expect(t.letterboxed).toBe(false);
  });
  it('keeps 16:9, 4:3, 1:1 and 4:5 at native ratio in one column', () => {
    for (const [w, h] of [[1920, 1080], [1440, 1080], [1080, 1080], [1080, 1350]]) {
      const t = f(w, h);
      expect(t.span).toBe(1);
      expect(t.desktop).toBeCloseTo(w / h);
      expect(t.letterboxed).toBe(false);
    }
  });
  it('frames a 9:16 reel at 4:5 on desktop and native on phones', () => {
    const t = f(1080, 1920);
    expect(t.desktop).toBeCloseTo(HALF_MIN_RATIO);
    expect(t.mobile).toBeCloseTo(1080 / 1920);
    expect(t.letterboxed).toBe(true);
  });
  it('a frame is never narrower than the media (contain never crops)', () => {
    for (const [w, h] of [[1080, 1920], [1080, 1350], [1920, 1080], [2560, 1080], [500, 2000]]) {
      const t = f(w, h);
      expect(t.desktop).toBeGreaterThanOrEqual(t.ratio - 1e-9);
    }
  });
  it('honours hero/wide hints and the detail-page threshold', () => {
    expect(f(1080, 1080, 'hero').span).toBe(2);
    expect(tileFrame({ width: 1920, height: 1080 }, 1.1).span).toBe(2);
    expect(tileFrame({ width: 1080, height: 1350 }, 1.1).span).toBe(1);
  });
  it('produces a valid frame for every project cover', () => {
    for (const p of projects) {
      const t = tileFrame(p.cover);
      expect(t.desktop).toBeGreaterThan(0);
      expect(t.mobile).toBeGreaterThan(0);
    }
  });
});

describe('layoutGrid', () => {
  const it2 = (w: number, h: number, layoutHint?: 'hero' | 'wide') => ({ width: w, height: h, layoutHint });
  it('fills a would-be hole with the following ultrawide', () => {
    const g = layoutGrid([it2(1920, 1080), it2(1080, 1920), it2(1080, 1080), it2(2560, 1080), it2(1440, 1080)]);
    expect(g.map((t) => t.span)).toEqual([1, 1, 1, 1, 1]);
    expect(g[3].desktop).toBeCloseTo(2560 / 1080);
  });
  it('keeps ultrawide full-width when it starts a row', () => {
    const g = layoutGrid([it2(1920, 1080), it2(1080, 1080), it2(2560, 1080)]);
    expect(g.map((t) => t.span)).toEqual([1, 1, 2]);
  });
  it('never demotes a hero', () => {
    const g = layoutGrid([it2(1080, 1080), it2(1080, 1080, 'hero')]);
    expect(g.map((t) => t.span)).toEqual([1, 2]);
  });
  it('leaves no interior holes for the real data, whatever the filter', () => {
    const covers = projects.map((p) => p.cover);
    const subsets = [covers, covers.filter((_, i) => i % 2 === 0), covers.filter((_, i) => i % 3 !== 1)];
    for (const list of subsets) {
      const g = layoutGrid(list);
      let col = 0;
      g.forEach((t, i) => {
        if (t.span === 2) {
          expect(col, `hole before item ${i}`).toBe(0);
        } else col = col === 0 ? 1 : 0;
      });
    }
  });
});
