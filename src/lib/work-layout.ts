/**
 * Version 2 layout: a strict two-column editorial grid.
 *
 * Every tile keeps its native aspect ratio (media are always `object-fit: contain`,
 * never cropped). The ratio decides how a tile sits in the grid:
 *
 *   - span: wide media (ratio ≥ `fullFrom`) or `hero`/`wide` hints take both columns.
 *   - frame: half-width tiles are framed at no taller than 4:5 so a 9:16 reel doesn't
 *     tower over its neighbour; the reel sits centred on a neutral ground inside that
 *     frame. Full-width tiles are framed at no taller than 16:9.
 *   - on phones (one column) the frame is the native ratio, down to 9:16.
 *
 * Source order is never changed, so reading/tab order matches what you see.
 */
import type { LayoutHint } from '../data/types';

export type FrameInput = { width: number; height: number; layoutHint?: LayoutHint };
export type TileFrame = {
  ratio: number;
  span: 1 | 2;
  /** frame ratio (width / height) in the two-column grid */
  desktop: number;
  /** frame ratio in the single-column phone layout */
  mobile: number;
  letterboxed: boolean;
};

export const HALF_MIN_RATIO = 4 / 5;
export const FULL_MIN_RATIO = 16 / 9;
export const MOBILE_MIN_RATIO = 9 / 16;

export function tileFrame(m: FrameInput, fullFrom = 2.1): TileFrame {
  const ratio = m.width / m.height;
  const span: 1 | 2 = ratio >= fullFrom || m.layoutHint === 'hero' || m.layoutHint === 'wide' ? 2 : 1;
  const desktop = Math.max(ratio, span === 2 ? FULL_MIN_RATIO : HALF_MIN_RATIO);
  const mobile = Math.max(ratio, MOBILE_MIN_RATIO);
  return { ratio, span, desktop, mobile, letterboxed: desktop > ratio + 1e-6 };
}

/**
 * Frames for a whole list, in source order. Keeps the two columns filled:
 * if a soft full-width item (ultrawide, or `wide` hint) would leave the tile
 * before it alone in its row, it drops into the empty half instead —
 * a short wide banner beside a taller tile — rather than leaving a hole.
 * `hero` items always take the full width.
 */
export function layoutGrid(items: FrameInput[], fullFrom = 2.1): TileFrame[] {
  let col = 0; // 0 = row is empty, 1 = left column taken
  return items.map((m) => {
    const t = tileFrame(m, fullFrom);
    if (t.span === 2 && col === 1 && m.layoutHint !== 'hero') {
      col = 0;
      return { ...t, span: 1, desktop: Math.max(t.ratio, HALF_MIN_RATIO), letterboxed: false };
    }
    if (t.span === 2) {
      col = 0;
      return t;
    }
    col = col === 0 ? 1 : 0;
    return t;
  });
}
