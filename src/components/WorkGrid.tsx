import type { PortfolioMedia } from '../data/types';
import { layoutGrid } from '../lib/work-layout';
import { MediaTile } from './MediaTile';

export type GridEntry = {
  id: string;
  media: PortfolioMedia;
  href?: string;
  title?: string;
  subtitle?: string;
  placeholder?: boolean;
};

/** Two-column grid; spans and frames come from each item's native ratio (see lib/work-layout.ts). */
export function WorkGrid({ entries, label, fullFrom, compact }: { entries: GridEntry[]; label: string; fullFrom?: number; compact?: boolean }) {
  const frames = layoutGrid(entries.map((e) => e.media), fullFrom);
  return (
    <div className={`wgrid${compact ? ' wgrid--compact' : ''}`} aria-label={label}>
      {entries.map((e, i) => (
        <MediaTile key={e.id} {...e} frame={frames[i]} priority={i < 2} />
      ))}
    </div>
  );
}
